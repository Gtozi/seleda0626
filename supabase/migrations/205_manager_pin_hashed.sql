-- Migration 205: Manager PIN — Backend-Verified Hashed PIN per User
-- Phase 4 Item 1: Replace hardcoded manager PIN with backend-verified, hashed PIN

-- ── 1. Add manager_pin_hash column to system_users ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'manager_pin_hash'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN manager_pin_hash TEXT;
    COMMENT ON COLUMN public.system_users.manager_pin_hash IS 'bcrypt-hashed manager PIN for POS void/discount approvals';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'manager_pin_set_at'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN manager_pin_set_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'manager_pin_attempts'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN manager_pin_attempts INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'manager_pin_locked_until'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN manager_pin_locked_until TIMESTAMPTZ;
  END IF;
END $$;

-- ── 2. Manager PIN audit log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manager_pin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.system_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('verify', 'set', 'reset', 'lock', 'unlock')),
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  outlet_id UUID,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_audit_user ON public.manager_pin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_audit_created ON public.manager_pin_audit_log(created_at DESC);

ALTER TABLE public.manager_pin_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manager_pin_audit_log' AND policyname = 'service_role all pin_audit') THEN
    CREATE POLICY "service_role all pin_audit" ON public.manager_pin_audit_log FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manager_pin_audit_log' AND policyname = 'authenticated read pin_audit') THEN
    CREATE POLICY "authenticated read pin_audit" ON public.manager_pin_audit_log FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 3. Ensure pgcrypto extension ────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 4. Verify manager PIN function ──────────────────────────────────────
-- Returns true if PIN matches, false otherwise. Handles lockout after 5 failed attempts.
CREATE OR REPLACE FUNCTION public.verify_manager_pin(p_user_id TEXT, p_pin TEXT, p_outlet_id UUID DEFAULT NULL, p_context TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_result JSONB;
BEGIN
  SELECT manager_pin_hash, manager_pin_attempts, manager_pin_locked_until, status
  INTO v_user
  FROM public.system_users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check if user is active
  IF v_user.status NOT IN ('Active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is not active');
  END IF;

  -- Check lockout
  IF v_user.manager_pin_locked_until IS NOT NULL AND v_user.manager_pin_locked_until > NOW() THEN
    INSERT INTO public.manager_pin_audit_log (user_id, action, success, outlet_id, context)
    VALUES (p_user_id, 'verify', false, p_outlet_id, 'locked_out');
    RETURN jsonb_build_object('success', false, 'error', 'PIN is locked. Contact administrator.');
  END IF;

  -- Check if PIN is set
  IF v_user.manager_pin_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No manager PIN set. Please set your PIN first.');
  END IF;

  -- Verify PIN using crypt (pgcrypto)
  IF v_user.manager_pin_hash = crypt(p_pin, v_user.manager_pin_hash) THEN
    -- Reset attempts on success
    UPDATE public.system_users
    SET manager_pin_attempts = 0, manager_pin_locked_until = NULL
    WHERE id = p_user_id;

    INSERT INTO public.manager_pin_audit_log (user_id, action, success, outlet_id, context)
    VALUES (p_user_id, 'verify', true, p_outlet_id, p_context);

    RETURN jsonb_build_object('success', true);
  ELSE
    -- Increment failed attempts
    UPDATE public.system_users
    SET manager_pin_attempts = manager_pin_attempts + 1,
        manager_pin_locked_until = CASE
          WHEN manager_pin_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
          ELSE manager_pin_locked_until
        END
    WHERE id = p_user_id;

    INSERT INTO public.manager_pin_audit_log (user_id, action, success, outlet_id, context)
    VALUES (p_user_id, 'verify', false, p_outlet_id, p_context);

    v_result := jsonb_build_object(
      'success', false,
      'error', 'Incorrect PIN',
      'attempts_remaining', GREATEST(0, 5 - (v_user.manager_pin_attempts + 1))
    );

    IF v_user.manager_pin_attempts + 1 >= 5 THEN
      v_result := v_result || jsonb_build_object('error', 'PIN locked due to too many attempts. Try again in 15 minutes.');
    END IF;

    RETURN v_result;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. Set manager PIN function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_manager_pin(p_user_id TEXT, p_pin TEXT)
RETURNS JSONB AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF LENGTH(p_pin) < 4 OR LENGTH(p_pin) > 8 OR p_pin !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'PIN must be 4-8 digits');
  END IF;

  -- Hash PIN using pgcrypto's crypt with bf (blowfish)
  v_hash := crypt(p_pin, gen_salt('bf', 8));

  UPDATE public.system_users
  SET manager_pin_hash = v_hash,
      manager_pin_set_at = NOW(),
      manager_pin_attempts = 0,
      manager_pin_locked_until = NULL
  WHERE id = p_user_id;

  INSERT INTO public.manager_pin_audit_log (user_id, action, success)
  VALUES (p_user_id, 'set', true);

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Reset manager PIN function (admin only) ──────────────────────────
CREATE OR REPLACE FUNCTION public.reset_manager_pin(p_user_id TEXT, p_admin_user_id TEXT)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.system_users
  SET manager_pin_hash = NULL,
      manager_pin_set_at = NULL,
      manager_pin_attempts = 0,
      manager_pin_locked_until = NULL
  WHERE id = p_user_id;

  INSERT INTO public.manager_pin_audit_log (user_id, action, success, context)
  VALUES (p_user_id, 'reset', true, 'Reset by ' || p_admin_user_id);

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

