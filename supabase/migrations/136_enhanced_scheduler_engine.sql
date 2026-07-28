-- Enhanced Scheduler/Job Engine
-- Comprehensive job scheduling and execution system for automated tasks

-- Enhance existing scheduled_jobs table if it exists, or create new
CREATE TABLE IF NOT EXISTS scheduled_jobs_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'backup', 'cleanup', 'report', 'sync', 'custom'
  job_handler TEXT NOT NULL, -- Function name or handler identifier
  schedule_cron TEXT NOT NULL, -- Cron expression
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 5, -- 1-10, lower is higher priority
  timeout_seconds INTEGER DEFAULT 300,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "retry_delay_seconds": 60}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enhanced_enabled ON scheduled_jobs_enhanced(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enhanced_next_run ON scheduled_jobs_enhanced(next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enhanced_type ON scheduled_jobs_enhanced(job_type);

-- Enhanced job runs table
CREATE TABLE IF NOT EXISTS job_runs_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs_enhanced(id),
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  output JSONB DEFAULT '{}',
  error_message TEXT,
  error_stack TEXT,
  triggered_by TEXT DEFAULT 'scheduler', -- 'scheduler', 'manual', 'api'
  triggered_by_user UUID REFERENCES auth.users(id),
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_job_runs_enhanced_job_id ON job_runs_enhanced(job_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_enhanced_status ON job_runs_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_job_runs_enhanced_started_at ON job_runs_enhanced(started_at DESC);

-- Job dependencies table
CREATE TABLE IF NOT EXISTS job_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs_enhanced(id) ON DELETE CASCADE,
  depends_on_job_id UUID REFERENCES scheduled_jobs_enhanced(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'success', -- 'success', 'completion', 'failure'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_dependencies_unique ON job_dependencies(job_id, depends_on_job_id);

-- Job execution queue
CREATE TABLE IF NOT EXISTS job_execution_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs_enhanced(id),
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_execution_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled ON job_execution_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON job_execution_queue(priority, scheduled_for);

-- Function to calculate next run time from cron
CREATE OR REPLACE FUNCTION calculate_next_run_time(p_cron TEXT, p_last_run TIMESTAMPTZ DEFAULT NULL)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
  v_base_time TIMESTAMPTZ;
BEGIN
  v_base_time := COALESCE(p_last_run, NOW());
  
  -- Enhanced cron parsing for common schedules
  CASE 
    WHEN p_cron = '0 * * * *' THEN -- Every hour
      v_next_run := date_trunc('hour', v_base_time) + INTERVAL '1 hour';
    WHEN p_cron = '0 */6 * * *' THEN -- Every 6 hours
      v_next_run := date_trunc('hour', v_base_time);
      WHILE EXTRACT(HOUR FROM v_next_run) % 6 != 0 LOOP
        v_next_run := v_next_run + INTERVAL '1 hour';
      END LOOP;
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '6 hours';
      END IF;
    WHEN p_cron = '0 2 * * *' THEN -- Daily at 2 AM
      v_next_run := date_trunc('day', v_base_time) + INTERVAL '2 hours';
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '1 day';
      END IF;
    WHEN p_cron = '0 2 * * 0' THEN -- Weekly on Sunday at 2 AM
      v_next_run := date_trunc('day', v_base_time) + INTERVAL '2 hours';
      WHILE EXTRACT(DOW FROM v_next_run) != 0 LOOP
        v_next_run := v_next_run + INTERVAL '1 day';
      END LOOP;
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '7 days';
      END IF;
    WHEN p_cron = '0 2 1 * *' THEN -- Monthly on 1st at 2 AM
      v_next_run := date_trunc('month', v_base_time) + INTERVAL '2 hours';
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '1 month';
      END IF;
    WHEN p_cron = '*/30 * * * *' THEN -- Every 30 minutes
      v_next_run := date_trunc('minute', v_base_time);
      WHILE EXTRACT(MINUTE FROM v_next_run) % 30 != 0 LOOP
        v_next_run := v_next_run + INTERVAL '1 minute';
      END LOOP;
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '30 minutes';
      END IF;
    ELSE
      -- Default to daily if cron not recognized
      v_next_run := date_trunc('day', v_base_time) + INTERVAL '2 hours';
      IF v_next_run <= v_base_time THEN
        v_next_run := v_next_run + INTERVAL '1 day';
      END IF;
  END CASE;
  
  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enqueue a job for execution
CREATE OR REPLACE FUNCTION enqueue_job(p_job_id UUID, p_priority INTEGER DEFAULT 5, p_scheduled_for TIMESTAMPTZ DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO job_execution_queue (job_id, priority, scheduled_for)
  VALUES (p_job_id, p_priority, COALESCE(p_scheduled_for, NOW()))
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next job from queue
CREATE OR REPLACE FUNCTION dequeue_job(p_worker_id TEXT DEFAULT NULL)
RETURNS TABLE (
  queue_id UUID,
  job_id UUID,
  job_name TEXT,
  job_handler TEXT,
  config JSONB
) AS $$
DECLARE
  v_queue_id UUID;
  v_job_id UUID;
BEGIN
  -- Lock and get next job
  UPDATE job_execution_queue
  SET 
    status = 'processing',
    locked_at = NOW(),
    locked_by = p_worker_id,
    attempts = attempts + 1
  WHERE id = (
    SELECT id FROM job_execution_queue
    WHERE status = 'queued'
    AND scheduled_for <= NOW()
    ORDER BY priority ASC, scheduled_for ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, job_id INTO v_queue_id, v_job_id;
  
  IF v_queue_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    jq.id as queue_id,
    jq.job_id,
    sj.job_name,
    sj.job_handler,
    sj.config
  FROM job_execution_queue jq
  JOIN scheduled_jobs_enhanced sj ON sj.id = jq.job_id
  WHERE jq.id = v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a job run
CREATE OR REPLACE FUNCTION complete_job_run(
  p_queue_id UUID,
  p_status TEXT,
  p_output JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_job_id UUID;
  v_job_run_id UUID;
  v_started_at TIMESTAMPTZ;
BEGIN
  -- Get job info
  SELECT job_id, created_at INTO v_job_id, v_started_at
  FROM job_execution_queue
  WHERE id = p_queue_id;
  
  -- Update queue
  UPDATE job_execution_queue
  SET status = p_status
  WHERE id = p_queue_id;
  
  -- Create job run record
  INSERT INTO job_runs_enhanced (job_id, status, started_at, completed_at, duration_seconds, output, error_message)
  VALUES (
    v_job_id,
    p_status,
    v_started_at,
    NOW(),
    EXTRACT(EPOCH FROM (NOW() - v_started_at))::INTEGER,
    p_output,
    p_error_message
  )
  RETURNING id INTO v_job_run_id;
  
  -- Update job statistics
  IF p_status = 'completed' THEN
    UPDATE scheduled_jobs_enhanced
    SET 
      success_count = success_count + 1,
      run_count = run_count + 1,
      last_run_at = NOW(),
      next_run_at = calculate_next_run_time(schedule_cron, NOW())
    WHERE id = v_job_id;
  ELSIF p_status = 'failed' THEN
    UPDATE scheduled_jobs_enhanced
    SET 
      failure_count = failure_count + 1,
      run_count = run_count + 1,
      last_run_at = NOW()
    WHERE id = v_job_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and enqueue due jobs
CREATE OR REPLACE FUNCTION enqueue_due_jobs()
RETURNS INTEGER AS $$
DECLARE
  v_enqueued_count INTEGER := 0;
  v_job_record RECORD;
BEGIN
  FOR v_job_record IN 
    SELECT id, schedule_cron, next_run_at
    FROM scheduled_jobs_enhanced
    WHERE enabled = TRUE
    AND (next_run_at IS NULL OR next_run_at <= NOW())
  LOOP
    -- Enqueue the job
    INSERT INTO job_execution_queue (job_id, scheduled_for)
    VALUES (v_job_record.id, NOW());
    
    -- Update next run time
    UPDATE scheduled_jobs_enhanced
    SET next_run_at = calculate_next_run_time(v_job_record.schedule_cron, NOW())
    WHERE id = v_job_record.id;
    
    v_enqueued_count := v_enqueued_count + 1;
  END LOOP;
  
  RETURN v_enqueued_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get job statistics
CREATE OR REPLACE FUNCTION get_job_statistics()
RETURNS TABLE (
  total_jobs INTEGER,
  enabled_jobs INTEGER,
  total_runs INTEGER,
  successful_runs INTEGER,
  failed_runs INTEGER,
  avg_duration_seconds NUMERIC,
  jobs_in_queue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM scheduled_jobs_enhanced) as total_jobs,
    (SELECT COUNT(*) FROM scheduled_jobs_enhanced WHERE enabled = TRUE) as enabled_jobs,
    (SELECT COUNT(*) FROM job_runs_enhanced) as total_runs,
    (SELECT COUNT(*) FROM job_runs_enhanced WHERE status = 'completed') as successful_runs,
    (SELECT COUNT(*) FROM job_runs_enhanced WHERE status = 'failed') as failed_runs,
    (SELECT AVG(duration_seconds) FROM job_runs_enhanced WHERE status = 'completed') as avg_duration_seconds,
    (SELECT COUNT(*) FROM job_execution_queue WHERE status = 'queued') as jobs_in_queue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_jobs_enhanced TO authenticated;
GRANT SELECT, INSERT, UPDATE ON job_runs_enhanced TO authenticated;
GRANT SELECT, INSERT, DELETE ON job_dependencies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON job_execution_queue TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_next_run_time TO authenticated;
GRANT EXECUTE ON FUNCTION enqueue_job TO authenticated;
GRANT EXECUTE ON FUNCTION dequeue_job TO authenticated;
GRANT EXECUTE ON FUNCTION complete_job_run TO authenticated;
GRANT EXECUTE ON FUNCTION enqueue_due_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION get_job_statistics TO authenticated;

-- RLS policies
ALTER TABLE scheduled_jobs_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_execution_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read scheduled jobs" ON scheduled_jobs_enhanced
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage scheduled jobs" ON scheduled_jobs_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read job runs" ON job_runs_enhanced
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage job runs" ON job_runs_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage job dependencies" ON job_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage job queue" ON job_execution_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );
