-- Backfill: Create auth.users records for legacy system_users without auth_user_id
-- Allows existing users to be assigned to POS outlets (which require auth.users UUID)

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
SELECT 
  gen_random_uuid()::uuid,
  su.email,
  crypt('ChangeMe123!', gen_salt('bf')),
  NOW(),
  'authenticated',
  'authenticated'
FROM system_users su
WHERE su.auth_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = su.email
  );

-- Link system_users to auth.users by email
UPDATE system_users su
SET auth_user_id = au.id
FROM auth.users au
WHERE su.email = au.email AND su.auth_user_id IS NULL;
