-- Add function to update auth user passwords
-- Used by admin route to sync password changes to auth.users
CREATE OR REPLACE FUNCTION update_auth_user_password(
  p_user_id UUID,
  p_password TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(p_password, gen_salt('bf')),
      password_change_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_auth_user_password IS 'Updates the password for an auth.users record by UUID';

-- Add function to delete auth user and their identity
CREATE OR REPLACE FUNCTION delete_auth_user_by_id(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.identities WHERE user_id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_auth_user_by_id IS 'Deletes an auth user and their identity record by user_id';

-- Ensure all auth.users have required metadata fields
UPDATE auth.users 
SET 
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
WHERE raw_app_meta_data IS NULL OR raw_user_meta_data IS NULL;
