-- Migration 120: Compliance Center Tables
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT,
  consent_type TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  policy_version TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  action TEXT DEFAULT 'archive',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pii_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT,
  target_entity TEXT,
  status TEXT DEFAULT 'pending',
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pii_erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT,
  target_entity TEXT,
  status TEXT DEFAULT 'pending',
  erased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_guest ON consent_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_retention_table ON data_retention_policies(table_name);

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_erasure_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_read" ON consent_logs;
CREATE POLICY "compliance_read" ON consent_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "compliance_write" ON consent_logs;
CREATE POLICY "compliance_write" ON consent_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "retention_read" ON data_retention_policies;
CREATE POLICY "retention_read" ON data_retention_policies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "retention_write" ON data_retention_policies;
CREATE POLICY "retention_write" ON data_retention_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "export_read" ON pii_export_requests;
CREATE POLICY "export_read" ON pii_export_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "export_write" ON pii_export_requests;
CREATE POLICY "export_write" ON pii_export_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "erasure_read" ON pii_erasure_requests;
CREATE POLICY "erasure_read" ON pii_erasure_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "erasure_write" ON pii_erasure_requests;
CREATE POLICY "erasure_write" ON pii_erasure_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default retention policies
INSERT INTO data_retention_policies (table_name, retention_days, action, enabled) VALUES
  ('audit_events', 2555, 'archive', true),
  ('job_runs', 90, 'delete', true),
  ('guest_requests', 365, 'archive', true),
  ('error_logs', 180, 'delete', true)
ON CONFLICT DO NOTHING;
