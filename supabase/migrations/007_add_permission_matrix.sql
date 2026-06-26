-- Add permission_matrix JSONB column to system_users for granular RBAC
alter table system_users add column if not exists permission_matrix jsonb not null default '{}'::jsonb;
