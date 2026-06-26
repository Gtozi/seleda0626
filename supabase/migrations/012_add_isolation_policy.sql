-- Add isolation_policy column to global_settings table
-- Used for subsystem isolation/zero-trust security settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;
