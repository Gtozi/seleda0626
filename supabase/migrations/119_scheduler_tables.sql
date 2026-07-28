-- Migration 119: Scheduler & Job Engine Tables
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  schedule_cron TEXT NOT NULL DEFAULT '0 2 * * *',
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_id ON job_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_status ON job_runs(status);

ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_read_authenticated" ON scheduled_jobs;
CREATE POLICY "jobs_read_authenticated" ON scheduled_jobs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "jobs_admin_write" ON scheduled_jobs;
CREATE POLICY "jobs_admin_write" ON scheduled_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "runs_read_authenticated" ON job_runs;
CREATE POLICY "runs_read_authenticated" ON job_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "runs_admin_write" ON job_runs;
CREATE POLICY "runs_admin_write" ON job_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default jobs
INSERT INTO scheduled_jobs (name, type, schedule_cron, config, enabled) VALUES
  ('Night Audit', 'night_audit', '0 2 * * *', '{"autoCloseBusinessDate": true, "postRoomCharges": true, "releaseAllotments": true}', true),
  ('Expired Allotment Release', 'allotment_release', '*/30 * * * *', '{}', true),
  ('Daily Report Email', 'report_email', '0 8 * * *', '{"reportType": "daily_summary"}', false),
  ('Database Backup', 'backup', '0 3 * * *', '{"type": "full"}', false)
ON CONFLICT DO NOTHING;
