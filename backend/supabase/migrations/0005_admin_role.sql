-- TaskBuddy schema — admin role & admin user overview
-- Supports the Admin Dashboard stories (#29 user management, #31 bookings,
-- #32 analytics). Admins cannot self-register (RegisterDto only allows
-- client/provider); accounts are promoted manually — see the note at the end.

-- ---------------------------------------------------------------------------
-- 1. Extend user_role with 'admin'
-- ---------------------------------------------------------------------------
alter type user_role add value if not exists 'admin';

-- ---------------------------------------------------------------------------
-- 2. admin_user_overview — profiles joined with auth email for admin search.
--    `profiles` has no email column (email lives in auth.users), so the
--    admin "search by name or email" endpoint reads this view instead.
--    Security definer by default; explicitly revoked from client roles —
--    only the backend's service_role key may read it.
-- ---------------------------------------------------------------------------
create or replace view admin_user_overview as
select
    p.id,
    u.email,
    p.full_name,
    p.phone,
    p.role,
    p.city,
    p.deactivated_at,
    p.created_at,
    pp.category_id,
    sc.name as category_name,
    pp.cached_avg_rating,
    pp.cached_completed_jobs
from profiles p
join auth.users u on u.id = p.id
left join provider_profiles pp on pp.profile_id = p.id
left join service_categories sc on sc.id = pp.category_id;

revoke all on admin_user_overview from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seeding an admin (run manually AFTER this migration, not part of it —
-- 'admin' cannot be used in the same transaction that adds the enum value):
--
-- 1. Supabase dashboard → Authentication → Add user (email + password,
--    auto-confirm). The on_auth_user_created trigger creates a 'client'
--    profile.
-- 2. Promote it:
--      update profiles set role = 'admin'
--      where id = (select id from auth.users where email = '<admin email>');
-- ---------------------------------------------------------------------------
