-- ============================================================
-- 103_session_timeout_columns.sql
-- Add session activity tracking and concurrent session limit
-- ============================================================

-- Add last_activity to user_sessions for idle timeout tracking
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT now();

-- Add max_concurrent_sessions to global_settings
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 3;
