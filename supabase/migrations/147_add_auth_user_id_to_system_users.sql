-- Add auth_user_id column to system_users to link to auth.users
-- This allows POS and other auth-based tables to reference users via UUID

ALTER TABLE system_users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_system_users_auth_user_id ON system_users(auth_user_id);

-- Backfill existing users by matching on email
UPDATE system_users su
SET auth_user_id = au.id
FROM auth.users au
WHERE su.email = au.email AND su.auth_user_id IS NULL;

COMMENT ON COLUMN system_users.auth_user_id IS 'References auth.users.id (UUID) for linking to POS and other auth-based tables';
