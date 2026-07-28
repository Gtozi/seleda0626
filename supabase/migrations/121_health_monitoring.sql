-- Migration 121: System Health Monitoring
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  latency_ms INTEGER,
  details JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked ON health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_read" ON health_checks;
CREATE POLICY "health_read" ON health_checks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "health_write" ON health_checks;
CREATE POLICY "health_write" ON health_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "errlog_read" ON error_logs;
CREATE POLICY "errlog_read" ON error_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "errlog_write" ON error_logs;
CREATE POLICY "errlog_write" ON error_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
