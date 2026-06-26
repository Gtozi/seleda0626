-- Comprehensive migration to add ALL missing columns to global_settings table
-- This ensures the database is fully aligned with schema.sql

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS social_links jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_template text default 'modern';

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_footer_text text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_bank_details text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS payment_types text[] not null default '{"Cash", "Credit Card", "Mobile Money", "Bank Transfer"}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS addon_charges jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_categories text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_outlets text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_printers text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_outlet_categories jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS split_folio_rules jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS cancellation_grace_hours integer not null default 24;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS cancellation_penalty_percent numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS credit_limit_default numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS loyalty_points_per_dollar numeric not null default 1.0;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS loyalty_redemption_rate numeric not null default 0.01;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS vip_spend_threshold numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_night_audit_time text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS operating_hours jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS revenue_mappings jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS room_types text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS room_features text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS guest_statuses text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_categories text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_locations text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_units text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS floors text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS departments text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS session_timeout integer;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS password_complexity text check (password_complexity in ('low', 'medium', 'high'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS allowed_ips text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS system_log_level text check (system_log_level in ('info', 'detailed', 'debug'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS api_integrations jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS module_toggles jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS force_mfa boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS strict_password_rotation boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS biometric_reauth boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS maintenance_message text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS public_booking_enabled boolean not null default true;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS guest_portal_enabled boolean not null default true;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS public_page_content jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_adventure_liability text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_waitlist_protocol text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_conservation_devotion text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_billing_cancellation text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_wilderness_emergency text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS policy_sections jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS fee_components jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;

-- Add audit columns for tracking changes
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS created_by text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS updated_by text;
