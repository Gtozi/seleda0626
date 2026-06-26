-- Migration: Add module_toggles and missing settings columns to global_settings
-- This ensures all GlobalHotelSettings fields have corresponding DB columns.

alter table global_settings add column if not exists module_toggles jsonb not null default '{}'::jsonb;
alter table global_settings add column if not exists hero_image_url text;
alter table global_settings add column if not exists contact_phone text;
alter table global_settings add column if not exists public_tagline text;
alter table global_settings add column if not exists social_links jsonb not null default '[]'::jsonb;
alter table global_settings add column if not exists force_mfa boolean not null default false;
alter table global_settings add column if not exists strict_password_rotation boolean not null default false;
alter table global_settings add column if not exists biometric_reauth boolean not null default false;
alter table global_settings add column if not exists maintenance_message text;
alter table global_settings add column if not exists public_booking_enabled boolean not null default true;
alter table global_settings add column if not exists guest_portal_enabled boolean not null default true;
alter table global_settings add column if not exists vip_spend_threshold numeric not null default 0.00;
alter table global_settings add column if not exists public_page_content jsonb not null default '{}'::jsonb;

comment on column global_settings.module_toggles is 'JSONB map of admin/department module toggle keys to boolean enabled state.';
