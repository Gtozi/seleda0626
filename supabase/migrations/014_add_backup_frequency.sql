-- Add backup_frequency column to global_settings table
-- Used for backup scheduling (daily, weekly, manual)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual'));
