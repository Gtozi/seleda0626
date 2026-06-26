-- Migration: Add allowed_ips column to global_settings
-- This column is referenced in server.ts KNOWN_GLOBAL_SETTINGS_COLUMNS but was missing from previous migrations

alter table global_settings add column if not exists allowed_ips text[] not null default '{}'::text[];

comment on column global_settings.allowed_ips is 'Array of allowed IP addresses for system access control';
