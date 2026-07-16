-- TaskBuddy — functions & triggers
-- Source of truth: backend/BACKEND_SCHEMA.md §8, §10

-- ---------------------------------------------------------------------------
-- 10.9 haversine_km — great-circle distance in km
-- ---------------------------------------------------------------------------
create or replace function haversine_km(
    lat1 double precision, lon1 double precision,
    lat2 double precision, lon2 double precision
) returns double precision
language sql immutable as $$
    select 6371 * acos(least(1.0,
        cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1))
        + sin(radians(lat1)) * sin(radians(lat2))
    ));
$$;

-- ---------------------------------------------------------------------------
-- 10.1 handle_new_user — create profiles row from signup metadata
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    insert into public.profiles (id, role, full_name, phone)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'role', 'client')::user_role,
        coalesce(new.raw_user_meta_data ->> 'full_name', 'Unnamed User'),
        new.raw_user_meta_data ->> 'phone'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- 10.2 set_updated_at — maintain updated_at on every mutable table
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger trg_profiles_updated_at
    before update on profiles
    for each row execute function set_updated_at();

create trigger trg_provider_profiles_updated_at
    before update on provider_profiles
    for each row execute function set_updated_at();

create trigger trg_jobs_updated_at
    before update on jobs
    for each row execute function set_updated_at();

create trigger trg_job_applications_updated_at
    before update on job_applications
    for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 10.3 set_recommendation_deadline — posted_at + urgency timeout
-- ---------------------------------------------------------------------------
create or replace function set_recommendation_deadline()
returns trigger
language plpgsql as $$
begin
    new.recommendation_deadline := new.posted_at + make_interval(
        mins => (select timeout_minutes from urgency_settings where urgency = new.urgency)
    );
    return new;
end;
$$;

create trigger trg_jobs_set_deadline
    before insert on jobs
    for each row execute function set_recommendation_deadline();

-- ---------------------------------------------------------------------------
-- 10.4 log_job_status_change — audit trail
-- ---------------------------------------------------------------------------
create or replace function log_job_status_change()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if new.status is distinct from old.status then
        insert into job_status_history (job_id, old_status, new_status, changed_by)
        values (new.id, old.status, new.status, auth.uid());
    end if;
    return new;
end;
$$;

create trigger trg_jobs_log_status
    after update of status on jobs
    for each row execute function log_job_status_change();

-- Also log the initial 'open' state on insert.
create or replace function log_job_created()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    insert into job_status_history (job_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
    return new;
end;
$$;

create trigger trg_jobs_log_created
    after insert on jobs
    for each row execute function log_job_created();

-- ---------------------------------------------------------------------------
-- 10.5 handle_application_accepted — assign job, auto-reject siblings
-- ---------------------------------------------------------------------------
create or replace function handle_application_accepted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if new.status = 'accepted' and old.status is distinct from 'accepted' then
        update jobs
           set assigned_provider_id = new.provider_id,
               assigned_at          = now(),
               status               = 'assigned'
         where id = new.job_id;

        update job_applications
           set status     = 'rejected',
               decided_at = now()
         where job_id = new.job_id
           and id <> new.id
           and status = 'pending';
    end if;
    return new;
end;
$$;

create trigger trg_application_accepted
    after update on job_applications
    for each row execute function handle_application_accepted();

-- ---------------------------------------------------------------------------
-- 10.6 refresh_provider_rating — cached_avg_rating / cached_ratings_count
-- ---------------------------------------------------------------------------
create or replace function refresh_provider_rating()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    update provider_profiles pp
       set cached_avg_rating    = sub.avg_rating,
           cached_ratings_count = sub.n
      from (
          select round(avg(rating)::numeric, 2) as avg_rating, count(*)::int as n
            from reviews
           where provider_id = new.provider_id
      ) sub
     where pp.profile_id = new.provider_id;
    return new;
end;
$$;

create trigger trg_reviews_refresh_rating
    after insert on reviews
    for each row execute function refresh_provider_rating();

-- ---------------------------------------------------------------------------
-- 10.7 refresh_provider_completed_jobs — cached_completed_jobs + was_hired backfill
-- ---------------------------------------------------------------------------
create or replace function refresh_provider_completed_jobs()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if new.status = 'completed' and old.status is distinct from 'completed' then
        update provider_profiles
           set cached_completed_jobs = cached_completed_jobs + 1
         where profile_id = new.assigned_provider_id;

        update jobs set completed_at = now()
         where id = new.id and completed_at is null;

        -- Backfill labels: hired = the assigned provider of a completed job.
        update recommendation_candidates rc
           set was_hired = (rc.provider_id = new.assigned_provider_id)
          from recommendation_runs rr
         where rr.id = rc.run_id
           and rr.job_id = new.id
           and rc.was_hired is null;
    elsif new.status in ('cancelled', 'expired')
          and old.status not in ('cancelled', 'expired') then
        update recommendation_candidates rc
           set was_hired = false
          from recommendation_runs rr
         where rr.id = rc.run_id
           and rr.job_id = new.id
           and rc.was_hired is null;
    end if;
    return new;
end;
$$;

create trigger trg_jobs_terminal_state
    after update of status on jobs
    for each row execute function refresh_provider_completed_jobs();

-- ---------------------------------------------------------------------------
-- 10.8 refresh_provider_response_time — avg over last 20 responded invites
-- ---------------------------------------------------------------------------
create or replace function refresh_provider_response_time()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if new.application_id is not null and new.notified_at is not null then
        update provider_profiles pp
           set cached_avg_response_hrs = sub.avg_hrs
          from (
              select round(avg(response_hrs)::numeric, 2) as avg_hrs
                from (
                    select extract(epoch from (ja.applied_at - rc.notified_at)) / 3600 as response_hrs
                      from recommendation_candidates rc
                      join job_applications ja on ja.id = rc.application_id
                     where rc.provider_id = new.provider_id
                       and rc.notified_at is not null
                       and rc.application_id is not null
                     order by ja.applied_at desc
                     limit 20
                ) last20
          ) sub
         where pp.profile_id = new.provider_id;
    end if;
    return new;
end;
$$;

create trigger trg_candidates_response_time
    after update of application_id on recommendation_candidates
    for each row execute function refresh_provider_response_time();

-- ---------------------------------------------------------------------------
-- §8 fn_job_provider_features — feature vectors for one job's eligible pool
-- ---------------------------------------------------------------------------
create or replace function fn_job_provider_features(p_job_id uuid)
returns table (
    provider_id uuid,
    skills_match smallint,
    distance_km numeric,
    provider_avg_rating numeric,
    provider_completed_jobs integer,
    provider_availability smallint,
    job_idle_duration_hrs numeric,
    provider_response_time_hrs numeric,
    provider_years_experience numeric,
    hour_posted smallint,
    provider_skill_category text,
    day_of_week text,
    job_urgency text,
    job_description text,
    provider_bio text
)
language sql stable as $$
    select
        pp.profile_id,
        (pp.category_id = j.category_id)::int::smallint,
        round(haversine_km(j.latitude, j.longitude, pr.latitude, pr.longitude)::numeric, 2),
        coalesce(pp.cached_avg_rating, 3.0),
        pp.cached_completed_jobs,
        pp.is_available::int::smallint,
        round((extract(epoch from (now() - j.posted_at)) / 3600)::numeric, 2),
        coalesce(pp.cached_avg_response_hrs, 2.0),
        pp.years_experience,
        extract(hour from j.posted_at at time zone 'Asia/Manila')::smallint,
        sc.name,
        trim(to_char(j.posted_at at time zone 'Asia/Manila', 'Day')),
        j.urgency::text,
        j.description,
        pp.bio
    from jobs j
    cross join provider_profiles pp
    join profiles pr on pr.id = pp.profile_id
    join service_categories sc on sc.id = pp.category_id
    where j.id = p_job_id
      and pp.is_available
      and pr.deactivated_at is null
      and pr.latitude is not null and pr.longitude is not null
      and not exists (select 1 from job_applications ja
                      where ja.job_id = j.id and ja.provider_id = pp.profile_id)
      and (pp.category_id = j.category_id
           or haversine_km(j.latitude, j.longitude, pr.latitude, pr.longitude)
              <= pp.service_radius_km);
$$;
