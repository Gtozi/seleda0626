-- Migration 123: API Management
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 100,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  disabled BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apikeys_read" ON api_keys;
CREATE POLICY "apikeys_read" ON api_keys FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "apikeys_write" ON api_keys;
CREATE POLICY "apikeys_write" ON api_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);
