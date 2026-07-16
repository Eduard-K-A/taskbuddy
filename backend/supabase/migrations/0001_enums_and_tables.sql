-- TaskBuddy schema — enums, tables, indexes
-- Source of truth: backend/BACKEND_SCHEMA.md §4–§5

-- ---------------------------------------------------------------------------
-- Enumerated types (§4)
-- ---------------------------------------------------------------------------
create type user_role          as enum ('client', 'provider');
create type job_urgency        as enum ('urgent', 'normal', 'flexible');
create type job_status         as enum ('open', 'recommending', 'assigned',
                                        'in_progress', 'completed', 'cancelled', 'expired');
create type application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type application_source as enum ('organic', 'recommended');
create type recommendation_trigger as enum ('timeout', 'manual');
create type notification_type  as enum ('recommendation_invite', 'application_update', 'job_update');

-- ---------------------------------------------------------------------------
-- 5.1 profiles — shared identity for both roles
-- ---------------------------------------------------------------------------
create table profiles (
    id           uuid primary key references auth.users (id) on delete cascade,
    role         user_role not null,
    full_name    text not null,
    phone        text,
    avatar_url   text,
    address      text,
    city         text,
    latitude     double precision,
    longitude    double precision,
    deactivated_at timestamptz,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5.2 service_categories — lookup
-- ---------------------------------------------------------------------------
create table service_categories (
    id         smallint generated always as identity primary key,
    name       text not null unique,
    is_active  boolean not null default true,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5.3 provider_profiles — provider-only attributes + cached ML stats
-- ---------------------------------------------------------------------------
create table provider_profiles (
    profile_id    uuid primary key references profiles (id) on delete cascade,
    category_id   smallint not null references service_categories (id),
    bio           text not null
                  check (char_length(bio) between 20 and 400),
    years_experience numeric(4,1) not null default 0,
    is_available  boolean not null default true,
    service_radius_km numeric(5,1) not null default 15.0,
    cached_avg_rating        numeric(3,2),
    cached_ratings_count     integer not null default 0,
    cached_completed_jobs    integer not null default 0,
    cached_avg_response_hrs  numeric(6,2),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index idx_provider_profiles_category   on provider_profiles (category_id);
create index idx_provider_profiles_available  on provider_profiles (is_available) where is_available;

-- ---------------------------------------------------------------------------
-- 5.4 urgency_settings — recommendation timeout config
-- ---------------------------------------------------------------------------
create table urgency_settings (
    urgency         job_urgency primary key,
    timeout_minutes integer not null check (timeout_minutes > 0)
);

-- ---------------------------------------------------------------------------
-- 5.5 jobs
-- ---------------------------------------------------------------------------
create table jobs (
    id           uuid primary key default gen_random_uuid(),
    client_id    uuid not null references profiles (id),
    category_id  smallint not null references service_categories (id),
    title        text not null check (char_length(title) between 5 and 120),
    description  text not null
                 check (char_length(description) between 20 and 750),
    urgency      job_urgency not null default 'normal',
    status       job_status not null default 'open',
    address      text not null,
    latitude     double precision not null,
    longitude    double precision not null,
    posted_at    timestamptz not null default now(),
    recommendation_deadline timestamptz not null,
    assigned_provider_id uuid references profiles (id),
    assigned_at  timestamptz,
    completed_at timestamptz,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    constraint chk_assignment_consistency
        check (status not in ('assigned','in_progress','completed') or assigned_provider_id is not null)
);

create index idx_jobs_status_deadline on jobs (status, recommendation_deadline)
    where status = 'open';
create index idx_jobs_client   on jobs (client_id);
create index idx_jobs_category on jobs (category_id, status);

-- ---------------------------------------------------------------------------
-- 5.6 job_status_history — audit trail of lifecycle transitions
-- ---------------------------------------------------------------------------
create table job_status_history (
    id         bigint generated always as identity primary key,
    job_id     uuid not null references jobs (id) on delete cascade,
    old_status job_status,
    new_status job_status not null,
    changed_by uuid references profiles (id),
    changed_at timestamptz not null default now()
);

create index idx_job_status_history_job on job_status_history (job_id, changed_at);

-- ---------------------------------------------------------------------------
-- 5.7 job_applications
-- ---------------------------------------------------------------------------
create table job_applications (
    id          uuid primary key default gen_random_uuid(),
    job_id      uuid not null references jobs (id) on delete cascade,
    provider_id uuid not null references profiles (id),
    source      application_source not null default 'organic',
    status      application_status not null default 'pending',
    cover_message text check (char_length(cover_message) <= 300),
    applied_at  timestamptz not null default now(),
    decided_at  timestamptz,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (job_id, provider_id)
);

-- Exactly ONE accepted application per job — the core marketplace invariant.
create unique index uq_job_applications_one_accepted
    on job_applications (job_id) where status = 'accepted';

create index idx_job_applications_provider on job_applications (provider_id, status);

-- ---------------------------------------------------------------------------
-- 5.8 recommendation_runs — one row per scoring event
-- ---------------------------------------------------------------------------
create table recommendation_runs (
    id            uuid primary key default gen_random_uuid(),
    job_id        uuid not null references jobs (id) on delete cascade,
    triggered_by  recommendation_trigger not null default 'timeout',
    model_version text not null,
    pool_size     integer not null,
    created_at    timestamptz not null default now()
);

create index idx_recommendation_runs_job on recommendation_runs (job_id);

-- ---------------------------------------------------------------------------
-- 5.9 recommendation_candidates — ranked results + frozen feature snapshot
-- ---------------------------------------------------------------------------
create table recommendation_candidates (
    id          uuid primary key default gen_random_uuid(),
    run_id      uuid not null references recommendation_runs (id) on delete cascade,
    provider_id uuid not null references profiles (id),
    rank        smallint not null,
    score       numeric(6,5) not null,
    notified_at timestamptz,
    application_id uuid references job_applications (id),
    was_hired   boolean,

    -- Frozen ML feature snapshot (names/types mirror the training CSV) --
    skills_match                smallint not null,
    distance_km                 numeric(6,2) not null,
    provider_avg_rating         numeric(3,2) not null,
    provider_completed_jobs     integer not null,
    provider_availability       smallint not null,
    job_idle_duration_hrs       numeric(8,2) not null,
    provider_response_time_hrs  numeric(6,2) not null,
    provider_years_experience   numeric(4,1) not null,
    hour_posted                 smallint not null,
    provider_skill_category     text not null,
    day_of_week                 text not null,
    job_urgency                 text not null,
    job_description             text not null,
    provider_bio                text not null,

    created_at  timestamptz not null default now(),
    unique (run_id, provider_id)
);

create index idx_recommendation_candidates_provider on recommendation_candidates (provider_id);
create index idx_recommendation_candidates_label
    on recommendation_candidates (was_hired) where was_hired is not null;

-- ---------------------------------------------------------------------------
-- 5.10 reviews — source of provider_avg_rating
-- ---------------------------------------------------------------------------
create table reviews (
    id          uuid primary key default gen_random_uuid(),
    job_id      uuid not null unique references jobs (id) on delete cascade,
    client_id   uuid not null references profiles (id),
    provider_id uuid not null references profiles (id),
    rating      smallint not null check (rating between 1 and 5),
    comment     text check (char_length(comment) <= 500),
    created_at  timestamptz not null default now()
);

create index idx_reviews_provider on reviews (provider_id);

-- ---------------------------------------------------------------------------
-- 5.11 notifications
-- ---------------------------------------------------------------------------
create table notifications (
    id           uuid primary key default gen_random_uuid(),
    recipient_id uuid not null references profiles (id) on delete cascade,
    type         notification_type not null,
    title        text not null,
    body         text not null,
    data         jsonb not null default '{}',
    read_at      timestamptz,
    created_at   timestamptz not null default now()
);

create index idx_notifications_recipient on notifications (recipient_id, read_at, created_at desc);
