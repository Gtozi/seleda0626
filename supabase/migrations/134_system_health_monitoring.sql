-- System Health Monitoring
-- Tracks health status of database, API endpoints, and external integrations

-- Drop tables if they exist to ensure clean schema
DROP TABLE IF EXISTS health_alerts CASCADE;
DROP TABLE IF EXISTS health_alert_rules CASCADE;
DROP TABLE IF EXISTS health_checks CASCADE;

CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'database', 'api', 'integration', 'service'
  check_name TEXT NOT NULL, -- e.g., 'postgres_connection', 'supabase_api', 'payment_gateway'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
  response_time_ms INTEGER,
  details JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_health_checks_type ON health_checks(check_type);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);

-- Table for health alert configuration
CREATE TABLE health_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  check_name TEXT NOT NULL,
  condition TEXT NOT NULL, -- 'status_eq', 'response_time_gt', 'consecutive_failures'
  threshold_value TEXT,
  alert_severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
  is_active BOOLEAN DEFAULT TRUE,
  notification_channels TEXT[], -- ['email', 'slack', 'in_app']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for health alerts
CREATE TABLE health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES health_alert_rules(id),
  check_type TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_created_at ON health_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_acknowledged ON health_alerts(acknowledged);

-- Function to record health check
CREATE OR REPLACE FUNCTION record_health_check(
  p_check_type TEXT,
  p_check_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_check_id UUID;
BEGIN
  INSERT INTO health_checks (check_type, check_name, status, response_time_ms, details)
  VALUES (p_check_type, p_check_name, p_status, p_response_time_ms, p_details)
  RETURNING id INTO v_check_id;
  
  -- Trigger alert evaluation
  PERFORM evaluate_health_alerts(p_check_type, p_check_name, p_status, p_response_time_ms);
  
  RETURN v_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to evaluate health alerts
CREATE OR REPLACE FUNCTION evaluate_health_alerts(
  p_check_type TEXT,
  p_check_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_rule RECORD;
  v_should_alert BOOLEAN;
BEGIN
  FOR v_rule IN 
    SELECT * FROM health_alert_rules 
    WHERE is_active = TRUE 
    AND check_type = p_check_type 
    AND (check_name = p_check_name OR check_name = '*')
  LOOP
    v_should_alert := FALSE;
    
    CASE v_rule.condition
      WHEN 'status_eq' THEN
        IF p_status = v_rule.threshold_value THEN
          v_should_alert := TRUE;
        END IF;
      WHEN 'response_time_gt' THEN
        IF p_response_time_ms IS NOT NULL AND p_response_time_ms > CAST(v_rule.threshold_value AS INTEGER) THEN
          v_should_alert := TRUE;
        END IF;
      WHEN 'consecutive_failures' THEN
        -- Check last N checks for failures
        DECLARE
          v_failure_count INTEGER;
        BEGIN
          SELECT COUNT(*) INTO v_failure_count
          FROM health_checks
          WHERE check_type = p_check_type
          AND check_name = p_check_name
          AND status = 'unhealthy'
          AND checked_at > NOW() - INTERVAL '15 minutes';
          
          IF v_failure_count >= CAST(v_rule.threshold_value AS INTEGER) THEN
            v_should_alert := TRUE;
          END IF;
        END;
    END CASE;
    
    IF v_should_alert THEN
      -- Create alert
      INSERT INTO health_alerts (rule_id, check_type, check_name, status, severity, message)
      VALUES (
        v_rule.id,
        p_check_type,
        p_check_name,
        p_status,
        v_rule.alert_severity,
        'Health check alert: ' || p_check_name || ' is ' || p_status
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current health status
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE (
  check_type TEXT,
  check_name TEXT,
  status TEXT,
  response_time_ms INTEGER,
  last_checked TIMESTAMPTZ,
  consecutive_failures INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_checks AS (
    SELECT DISTINCT ON (check_type, check_name) *
    FROM health_checks
    ORDER BY check_type, check_name, checked_at DESC
  ),
  failure_counts AS (
    SELECT 
      check_type,
      check_name,
      COUNT(*) FILTER (WHERE status = 'unhealthy' AND checked_at > NOW() - INTERVAL '15 minutes') as failures
    FROM health_checks
    WHERE checked_at > NOW() - INTERVAL '15 minutes'
    GROUP BY check_type, check_name
  )
  SELECT 
    lc.check_type,
    lc.check_name,
    lc.status,
    lc.response_time_ms,
    lc.checked_at as last_checked,
    COALESCE(fc.failures, 0) as consecutive_failures
  FROM latest_checks lc
  LEFT JOIN failure_counts fc ON lc.check_type = fc.check_type AND lc.check_name = fc.check_name
  ORDER BY lc.check_type, lc.check_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON health_checks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON health_alert_rules TO authenticated;
GRANT SELECT, UPDATE ON health_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION record_health_check TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_health_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health TO authenticated;

-- RLS policies
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read health checks" ON health_checks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write health checks" ON health_checks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage alert rules" ON health_alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage alerts" ON health_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read alerts" ON health_alerts
  FOR SELECT USING (auth.role() = 'authenticated');
