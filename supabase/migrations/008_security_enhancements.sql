-- Security enhancements: account lockout, forced password change, reset tokens, RLS
alter table if exists system_users
  add column if not exists force_password_change boolean not null default false,
  add column if not exists password_reset_token text,
  add column if not exists password_reset_expires timestamp with time zone;

-- Enable RLS on sensitive admin tables
alter table if exists system_users enable row level security;
alter table if exists custom_roles enable row level security;
alter table if exists global_settings enable row level security;
alter table if exists audit_events enable row level security;

-- Drop any existing anon/policy rules so we can recreate cleanly
-- (safe to re-run)
drop policy if exists system_users_anon_all on system_users;
drop policy if exists custom_roles_anon_all on custom_roles;
drop policy if exists global_settings_anon_all on global_settings;
drop policy if exists audit_events_anon_all on audit_events;

-- system_users: anon key can only SELECT (server handles writes via service role)
create policy if not exists system_users_anon_select
  on system_users for select
  to anon
  using (true);

-- custom_roles: anon key can only SELECT
create policy if not exists custom_roles_anon_select
  on custom_roles for select
  to anon
  using (true);

-- global_settings: anon key can only SELECT
create policy if not exists global_settings_anon_select
  on global_settings for select
  to anon
  using (true);

-- audit_events: anon key can only SELECT
create policy if not exists audit_events_anon_select
  on audit_events for select
  to anon
  using (true);
