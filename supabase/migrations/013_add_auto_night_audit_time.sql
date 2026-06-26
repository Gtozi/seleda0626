-- Add auto_night_audit_time column to global_settings table
-- Used for automatic night audit scheduling
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_night_audit_time text;
