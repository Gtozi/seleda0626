-- Add api_integrations column to global_settings table
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS api_integrations jsonb not null default '[]'::jsonb;
