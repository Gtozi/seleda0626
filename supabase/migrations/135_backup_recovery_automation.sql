-- Backup & Recovery Automation
-- Manages automated database backups and recovery procedures

CREATE TABLE IF NOT EXISTS backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'schema_only'
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  backup_size_bytes BIGINT,
  storage_location TEXT, -- 'supabase', 's3', 'local'
  storage_path TEXT,
  initiated_by UUID REFERENCES auth.users(id),
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_type ON backup_jobs(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_created_at ON backup_jobs(initiated_at DESC);

-- Table for backup schedules
CREATE TABLE IF NOT EXISTS backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL UNIQUE,
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'schema_only'
  cron_schedule TEXT NOT NULL, -- e.g., '0 2 * * *' for daily at 2 AM
  retention_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  storage_location TEXT DEFAULT 'supabase',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_backup_schedules_active ON backup_schedules(is_active);

-- Table for backup restoration logs
CREATE TABLE IF NOT EXISTS backup_restorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_job_id UUID REFERENCES backup_jobs(id),
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  initiated_by UUID REFERENCES auth.users(id),
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  tables_restored TEXT[],
  rows_restored INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_backup_restorations_status ON backup_restorations(status);
CREATE INDEX IF NOT EXISTS idx_backup_restorations_created_at ON backup_restorations(initiated_at DESC);

-- Function to create a backup job
CREATE OR REPLACE FUNCTION create_backup_job(
  p_backup_type TEXT,
  p_storage_location TEXT DEFAULT 'supabase',
  p_initiated_by UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO backup_jobs (backup_type, status, storage_location, initiated_by, metadata)
  VALUES (p_backup_type, 'pending', p_storage_location, p_initiated_by, p_metadata)
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update backup job status
CREATE OR REPLACE FUNCTION update_backup_job_status(
  p_job_id UUID,
  p_status TEXT,
  p_backup_size_bytes BIGINT DEFAULT NULL,
  p_storage_path TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE backup_jobs
  SET 
    status = p_status,
    backup_size_bytes = p_backup_size_bytes,
    storage_path = p_storage_path,
    error_message = p_error_message,
    completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE NULL END
  WHERE id = p_job_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a backup schedule
CREATE OR REPLACE FUNCTION create_backup_schedule(
  p_schedule_name TEXT,
  p_backup_type TEXT,
  p_cron_schedule TEXT,
  p_retention_days INTEGER DEFAULT 30,
  p_storage_location TEXT DEFAULT 'supabase',
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_schedule_id UUID;
BEGIN
  INSERT INTO backup_schedules (
    schedule_name, backup_type, cron_schedule, retention_days,
    storage_location, created_by
  )
  VALUES (
    p_schedule_name, p_backup_type, p_cron_schedule, p_retention_days,
    p_storage_location, p_created_by
  )
  RETURNING id INTO v_schedule_id;
  
  RETURN v_schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate next run time based on cron
CREATE OR REPLACE FUNCTION calculate_next_run(p_cron_schedule TEXT, p_last_run TIMESTAMPTZ DEFAULT NULL)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
BEGIN
  -- Simplified cron parsing for common schedules
  -- In production, use a proper cron library
  IF p_cron_schedule = '0 2 * * *' THEN -- Daily at 2 AM
    v_next_run := COALESCE(p_last_run, NOW() - INTERVAL '1 day') + INTERVAL '1 day';
    v_next_run := date_trunc('day', v_next_run) + INTERVAL '2 hours';
  ELSIF p_cron_schedule = '0 2 * * 0' THEN -- Weekly on Sunday at 2 AM
    v_next_run := COALESCE(p_last_run, NOW() - INTERVAL '7 days') + INTERVAL '7 days';
    v_next_run := date_trunc('day', v_next_run) + INTERVAL '2 hours';
    WHILE EXTRACT(DOW FROM v_next_run) != 0 LOOP
      v_next_run := v_next_run + INTERVAL '1 day';
    END LOOP;
  ELSIF p_cron_schedule = '0 2 1 * *' THEN -- Monthly on 1st at 2 AM
    v_next_run := COALESCE(p_last_run, NOW() - INTERVAL '1 month') + INTERVAL '1 month';
    v_next_run := date_trunc('month', v_next_run) + INTERVAL '2 hours';
  ELSE
    -- Default to daily if cron not recognized
    v_next_run := COALESCE(p_last_run, NOW() - INTERVAL '1 day') + INTERVAL '1 day';
  END IF;
  
  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get backup statistics
CREATE OR REPLACE FUNCTION get_backup_statistics()
RETURNS TABLE (
  total_backups BIGINT,
  successful_backups BIGINT,
  failed_backups BIGINT,
  total_size_bytes BIGINT,
  avg_backup_size_bytes BIGINT,
  last_backup_time TIMESTAMPTZ,
  last_backup_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_backups,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_backups,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_backups,
    COALESCE(SUM(backup_size_bytes), 0) as total_size_bytes,
    COALESCE(AVG(backup_size_bytes) FILTER (WHERE status = 'completed'), 0) as avg_backup_size_bytes,
    MAX(initiated_at) as last_backup_time,
    (SELECT status FROM backup_jobs ORDER BY initiated_at DESC LIMIT 1) as last_backup_status
  FROM backup_jobs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old backups based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_backups(p_retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete backup records older than retention period
  -- Note: Actual backup file deletion would be handled by storage-specific logic
  DELETE FROM backup_jobs
  WHERE initiated_at < NOW() - (p_retention_days || ' days')::INTERVAL
  AND status = 'completed';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON backup_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON backup_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON backup_restorations TO authenticated;
GRANT EXECUTE ON FUNCTION create_backup_job TO authenticated;
GRANT EXECUTE ON FUNCTION update_backup_job_status TO authenticated;
GRANT EXECUTE ON FUNCTION create_backup_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_next_run TO authenticated;
GRANT EXECUTE ON FUNCTION get_backup_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_backups TO authenticated;

-- RLS policies
ALTER TABLE backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_restorations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read backup jobs" ON backup_jobs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage backup jobs" ON backup_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read backup schedules" ON backup_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage backup schedules" ON backup_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read backup restorations" ON backup_restorations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage backup restorations" ON backup_restorations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );
