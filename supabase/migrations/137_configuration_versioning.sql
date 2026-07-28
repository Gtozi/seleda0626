-- Configuration Versioning and Rollback System
-- Tracks configuration changes with version history and rollback capability

-- Configuration versions table
CREATE TABLE IF NOT EXISTS configuration_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL, -- e.g., 'global_hotel_settings', 'business_settings'
  config_value JSONB NOT NULL,
  version INTEGER NOT NULL,
  change_description TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_config_versions_key_version ON configuration_versions(config_key, version);
CREATE INDEX IF NOT EXISTS idx_config_versions_key_current ON configuration_versions(config_key, is_current);
CREATE INDEX IF NOT EXISTS idx_config_versions_changed_at ON configuration_versions(changed_at DESC);

-- Configuration rollback log
CREATE TABLE IF NOT EXISTS configuration_rollbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL,
  from_version INTEGER NOT NULL,
  to_version INTEGER NOT NULL,
  rollback_reason TEXT,
  rolled_back_by UUID REFERENCES auth.users(id),
  rolled_back_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_config_rollbacks_key ON configuration_rollbacks(config_key);
CREATE INDEX IF NOT EXISTS idx_config_rollbacks_rolled_back_at ON configuration_rollbacks(rolled_back_at DESC);

-- Function to create a new configuration version
CREATE OR REPLACE FUNCTION create_configuration_version(
  p_config_key TEXT,
  p_config_value JSONB,
  p_change_description TEXT DEFAULT NULL,
  p_changed_by UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
  v_new_version INTEGER;
BEGIN
  -- Get current max version for this config key
  SELECT COALESCE(MAX(version), 0) INTO v_new_version
  FROM configuration_versions
  WHERE config_key = p_config_key;
  
  v_new_version := v_new_version + 1;
  
  -- Mark previous current version as not current
  UPDATE configuration_versions
  SET is_current = FALSE
  WHERE config_key = p_config_key AND is_current = TRUE;
  
  -- Insert new version
  INSERT INTO configuration_versions (
    config_key, config_value, version, change_description, changed_by, is_current, metadata
  ) VALUES (
    p_config_key, p_config_value, v_new_version, p_change_description, p_changed_by, TRUE, p_metadata
  );
  
  RETURN v_new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current configuration version
CREATE OR REPLACE FUNCTION get_current_config(p_config_key TEXT)
RETURNS TABLE (
  id UUID,
  config_value JSONB,
  version INTEGER,
  change_description TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id, config_value, version, change_description, changed_by, changed_at, metadata
  FROM configuration_versions
  WHERE config_key = p_config_key AND is_current = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get configuration version history
CREATE OR REPLACE FUNCTION get_config_history(p_config_key TEXT, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  config_value JSONB,
  version INTEGER,
  change_description TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ,
  is_current BOOLEAN,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id, config_value, version, change_description, changed_by, changed_at, is_current, metadata
  FROM configuration_versions
  WHERE config_key = p_config_key
  ORDER BY version DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rollback to a specific version
CREATE OR REPLACE FUNCTION rollback_configuration(
  p_config_key TEXT,
  p_target_version INTEGER,
  p_rollback_reason TEXT DEFAULT NULL,
  p_rolled_back_by UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
  v_target_config JSONB;
  v_current_version INTEGER;
  v_new_version INTEGER;
BEGIN
  -- Get target config
  SELECT config_value INTO v_target_config
  FROM configuration_versions
  WHERE config_key = p_config_key AND version = p_target_version;
  
  IF v_target_config IS NULL THEN
    RAISE EXCEPTION 'Target version % not found for config key %', p_target_version, p_config_key;
  END IF;
  
  -- Get current version
  SELECT version INTO v_current_version
  FROM configuration_versions
  WHERE config_key = p_config_key AND is_current = TRUE;
  
  -- Create rollback log entry
  INSERT INTO configuration_rollbacks (
    config_key, from_version, to_version, rollback_reason, rolled_back_by, metadata
  ) VALUES (
    p_config_key, v_current_version, p_target_version, p_rollback_reason, p_rolled_back_by, p_metadata
  );
  
  -- Create new version with rolled back config
  v_new_version := create_configuration_version(
    p_config_key, 
    v_target_config, 
    'Rollback to version ' || p_target_version || ': ' || COALESCE(p_rollback_reason, 'No reason provided'),
    p_rolled_back_by,
    p_metadata
  );
  
  RETURN v_new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to compare two configuration versions
CREATE OR REPLACE FUNCTION compare_config_versions(
  p_config_key TEXT,
  p_version1 INTEGER,
  p_version2 INTEGER
) RETURNS TABLE (
  path TEXT[],
  value1 JSONB,
  value2 JSONB,
  change_type TEXT -- 'added', 'removed', 'modified', 'unchanged'
) AS $$
DECLARE
  v_config1 JSONB;
  v_config2 JSONB;
BEGIN
  SELECT config_value INTO v_config1
  FROM configuration_versions
  WHERE config_key = p_config_key AND version = p_version1;
  
  SELECT config_value INTO v_config2
  FROM configuration_versions
  WHERE config_key = p_config_key AND version = p_version2;
  
  -- Simple comparison - in production, use a proper JSON diff library
  -- This is a basic implementation
  RETURN QUERY
  SELECT 
    ARRAY['root']::TEXT[],
    v_config1,
    v_config2,
    CASE 
      WHEN v_config1 = v_config2 THEN 'unchanged'
      WHEN v_config1 IS NULL THEN 'added'
      WHEN v_config2 IS NULL THEN 'removed'
      ELSE 'modified'
    END::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON configuration_versions TO authenticated;
GRANT SELECT, INSERT ON configuration_rollbacks TO authenticated;
GRANT EXECUTE ON FUNCTION create_configuration_version TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_config TO authenticated;
GRANT EXECUTE ON FUNCTION get_config_history TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_configuration TO authenticated;
GRANT EXECUTE ON FUNCTION compare_config_versions TO authenticated;

-- RLS policies
ALTER TABLE configuration_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_rollbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read config versions" ON configuration_versions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write config versions" ON configuration_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read rollback logs" ON configuration_rollbacks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write rollback logs" ON configuration_rollbacks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );
