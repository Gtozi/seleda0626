-- ============================================================
-- 101_auth_security_columns.sql
-- Add missing auth security columns and MFA secrets table
-- ============================================================

-- Add failed_mfa_count for MFA lockout after 5 failures
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS failed_mfa_count INTEGER DEFAULT 0;

-- Add mfa_locked_until for MFA lockout duration
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_locked_until TIMESTAMPTZ;

-- Add mfa_secret_encrypted (alternative to plaintext mfa_secret)
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT;

-- Create mfa_secrets table for per-device MFA secrets
CREATE TABLE IF NOT EXISTS mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES system_users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS and authenticated policy already created by migration 100_rls_policies_comprehensive.sql
-- which enables RLS and creates authenticated_all_* policies on ALL public tables.
-- Just ensure grants are in place.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfa_secrets TO authenticated;
