-- Add system_log_level column to global_settings table
-- Used for system logging verbosity (info, detailed, debug)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS system_log_level text check (system_log_level in ('info', 'detailed', 'debug'));
