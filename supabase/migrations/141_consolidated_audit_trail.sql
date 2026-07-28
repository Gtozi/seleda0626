-- Consolidated Audit Trail
-- Unified audit logging across organizations and properties with cross-property visibility

-- Consolidated audit log table
CREATE TABLE IF NOT EXISTS consolidated_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'reservation', 'guest', 'user', 'property', 'organization', 'payment', etc.
  entity_id UUID,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', etc.
  changes JSONB DEFAULT '{}', -- Before/after values for updates
  metadata JSONB DEFAULT '{}', -- Additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON consolidated_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type ON consolidated_audit_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id ON consolidated_audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON consolidated_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_property ON consolidated_audit_log(property_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON consolidated_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON consolidated_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON consolidated_audit_log(action);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_org_property_created ON consolidated_audit_log(organization_id, property_id, created_at DESC);

-- Audit log retention policy table
CREATE TABLE IF NOT EXISTS audit_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  entity_type TEXT,
  retention_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, property_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_retention_policy_org ON audit_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_retention_policy_property ON audit_retention_policies(property_id);
CREATE INDEX IF NOT EXISTS idx_retention_policy_entity ON audit_retention_policies(entity_type);

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_event_type TEXT,
  p_entity_type TEXT,
  p_action TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_property_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID from auth
  v_user_id := auth.uid();
  
  INSERT INTO consolidated_audit_log (
    event_type, entity_type, action, entity_id, organization_id, property_id,
    user_id, changes, metadata, ip_address, user_agent
  ) VALUES (
    p_event_type, p_entity_type, p_action, p_entity_id, p_organization_id, p_property_id,
    v_user_id, p_changes, p_metadata, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit logs with filtering
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_organization_id UUID DEFAULT NULL,
  p_property_id UUID DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  event_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  organization_id UUID,
  property_id UUID,
  user_id UUID,
  action TEXT,
  changes JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.event_type,
    al.entity_type,
    al.entity_id,
    al.organization_id,
    al.property_id,
    al.user_id,
    al.action,
    al.changes,
    al.metadata,
    al.ip_address,
    al.user_agent,
    al.created_at
  FROM consolidated_audit_log al
  WHERE 
    (p_organization_id IS NULL OR al.organization_id = p_organization_id)
    AND (p_property_id IS NULL OR al.property_id = p_property_id)
    AND (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_event_type IS NULL OR al.event_type = p_event_type)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
  v_retention_days INTEGER;
BEGIN
  -- Get retention days from policy or default to 365
  SELECT COALESCE(
    (SELECT MIN(retention_days) FROM audit_retention_policies arp 
     WHERE (arp.organization_id IS NULL OR arp.organization_id IS NULL)
       AND (arp.property_id IS NULL OR arp.property_id IS NULL)
       AND (arp.entity_type IS NULL OR arp.entity_type IS NULL)
       AND arp.is_active = TRUE),
    365
  ) INTO v_retention_days;
  
  -- Delete audit logs older than retention policy
  DELETE FROM consolidated_audit_log al
  WHERE al.created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN COALESCE(v_deleted_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update retention policy timestamp
CREATE OR REPLACE FUNCTION update_retention_policy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_retention_policies_updated_at
  BEFORE UPDATE ON audit_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_retention_policy_timestamp();

-- Grant permissions
GRANT SELECT, INSERT ON consolidated_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_retention_policies TO authenticated;
GRANT SELECT ON consolidated_audit_log TO authenticated;

GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_audit_logs TO authenticated;

-- RLS policies
ALTER TABLE consolidated_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read audit logs" ON consolidated_audit_log
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (
      -- User can see logs for their own actions
      user_id = auth.uid() OR
      -- Admins can see all logs
      EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
      )
    )
  );

CREATE POLICY "System can write audit logs" ON consolidated_audit_log
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read retention policies" ON audit_retention_policies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write retention policies" ON audit_retention_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Insert default retention policy
INSERT INTO audit_retention_policies (organization_id, property_id, entity_type, retention_days, is_active)
VALUES (NULL, NULL, NULL, 365, TRUE)
ON CONFLICT (organization_id, property_id, entity_type) DO NOTHING;
