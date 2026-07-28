-- Fix: create_system_user function - null value in column "id" of relation "users" violates not-null constraint
-- Root cause: auth.users.id (UUID, NOT NULL) had no default and the function didn't supply a value.
-- Also, system_users_id_seq sequence referenced by nextval() did not exist.
-- Fix: Generate UUID explicitly via extensions.uuid_generate_v4() and use timestamp-based system user ID.

CREATE OR REPLACE FUNCTION create_system_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'member',
  p_department TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_force_password_change BOOLEAN DEFAULT TRUE
) RETURNS JSONB AS $$
DECLARE
  v_auth_user_id UUID;
  v_system_user_id TEXT;
  v_result JSONB;
BEGIN
  -- Generate UUID explicitly (auth.users.id has no default)
  v_auth_user_id := extensions.uuid_generate_v4();

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
  VALUES (
    v_auth_user_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Generate system user ID (system_users_id_seq does not exist, use timestamp-based ID)
  v_system_user_id := 'U-' || extract(epoch from now())::bigint::text || '-' || (random() * 1000)::int::text;

  INSERT INTO system_users (
    id, name, email, role, department, mobile_number, status,
    force_password_change, created_at, updated_at
  ) VALUES (
    v_system_user_id,
    p_name,
    p_email,
    p_role,
    p_department,
    p_phone,
    'Active',
    p_force_password_change,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_system_user_id;

  v_result := jsonb_build_object(
    'auth_user_id', v_auth_user_id,
    'system_user_id', v_system_user_id,
    'email', p_email,
    'name', p_name,
    'success', true
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_system_user IS 'Creates a new auth user and corresponding system_user record';
