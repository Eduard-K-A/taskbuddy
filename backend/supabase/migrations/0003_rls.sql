-- TaskBuddy — Row Level Security
-- Source of truth: backend/BACKEND_SCHEMA.md §11
--
-- The NestJS API talks to the database with the service-role key, which
-- bypasses RLS; these policies are defense-in-depth and cover any direct
-- supabase-js access from the frontends.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_select_own on profiles
    for select using (id = auth.uid());

create policy profiles_update_own on profiles
    for update using (id = auth.uid());

-- Marketplace display: any authenticated user may read basic profile info.
create policy profiles_select_authenticated on profiles
    for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- service_categories / urgency_settings — read-only lookups
-- ---------------------------------------------------------------------------
alter table service_categories enable row level security;

create policy categories_read on service_categories
    for select to authenticated using (true);

alter table urgency_settings enable row level security;

create policy urgency_read on urgency_settings
    for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- provider_profiles
-- ---------------------------------------------------------------------------
alter table provider_profiles enable row level security;

create policy provider_profiles_read on provider_profiles
    for select to authenticated using (true);

create policy provider_profiles_insert_own on provider_profiles
    for insert with check (profile_id = auth.uid());

-- Providers may update their own row. The cached_* columns are written only
-- by triggers/service role; column-level protection is enforced by the API.
create policy provider_profiles_update_own on provider_profiles
    for update using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
alter table jobs enable row level security;

create policy jobs_client_all on jobs
    for all using (client_id = auth.uid());

create policy jobs_provider_read on jobs
    for select using (
        status in ('open', 'recommending')
        or assigned_provider_id = auth.uid()
    );

-- ---------------------------------------------------------------------------
-- job_applications
-- ---------------------------------------------------------------------------
alter table job_applications enable row level security;

create policy applications_provider_insert on job_applications
    for insert with check (provider_id = auth.uid());

create policy applications_provider_read on job_applications
    for select using (provider_id = auth.uid());

create policy applications_provider_update on job_applications
    for update using (provider_id = auth.uid());

create policy applications_client_read on job_applications
    for select using (
        exists (select 1 from jobs j where j.id = job_id and j.client_id = auth.uid())
    );

create policy applications_client_update on job_applications
    for update using (
        exists (select 1 from jobs j where j.id = job_id and j.client_id = auth.uid())
    );

-- ---------------------------------------------------------------------------
-- recommendation_runs / recommendation_candidates — service role ONLY
-- (RLS enabled, no policies: feature snapshots and scores are never
--  client-readable.)
-- ---------------------------------------------------------------------------
alter table recommendation_runs enable row level security;
alter table recommendation_candidates enable row level security;

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
alter table reviews enable row level security;

create policy reviews_read on reviews
    for select to authenticated using (true);

create policy reviews_client_insert on reviews
    for insert with check (
        client_id = auth.uid()
        and exists (select 1 from jobs j
                     where j.id = job_id
                       and j.client_id = auth.uid()
                       and j.status = 'completed')
    );

-- ---------------------------------------------------------------------------
-- notifications — recipient reads/marks-read; inserts via service role only
-- ---------------------------------------------------------------------------
alter table notifications enable row level security;

create policy notifications_recipient_read on notifications
    for select using (recipient_id = auth.uid());

create policy notifications_recipient_update on notifications
    for update using (recipient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- job_status_history — read own-job / assigned-job history; insert via trigger
-- ---------------------------------------------------------------------------
alter table job_status_history enable row level security;

create policy job_status_history_read on job_status_history
    for select using (
        exists (select 1 from jobs j
                 where j.id = job_id
                   and (j.client_id = auth.uid() or j.assigned_provider_id = auth.uid()))
    );
