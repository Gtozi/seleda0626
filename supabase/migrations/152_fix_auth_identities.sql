-- Fix: Create missing auth.identities records for all auth.users
-- GoTrue requires auth.identities for login and admin API operations
INSERT INTO auth.identities (id, user_id, identity_id, provider, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  au.id,
  au.id,
  'email',
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM auth.identities ai WHERE ai.user_id = au.id);

-- Also ensure auth.users has required metadata fields
UPDATE auth.users 
SET 
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
WHERE raw_app_meta_data IS NULL OR raw_user_meta_data IS NULL;
