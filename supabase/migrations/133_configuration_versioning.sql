-- Configuration Versioning System
-- Stores version history of critical system configurations for rollback capability

CREATE TABLE IF NOT EXISTS config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL, -- e.g., 'global_hotel_settings', 'business_settings', 'tax_rates'
  config_type TEXT NOT NULL, -- e.g., 'global-setting', 'tax-config', 'rate-config'
  version INTEGER NOT NULL,
  config_data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_config_versions_key ON config_versions(config_key);
CREATE INDEX IF NOT EXISTS idx_config_versions_key_version ON config_versions(config_key, version DESC);
CREATE INDEX IF NOT EXISTS idx_config_versions_created_at ON config_versions(created_at DESC);

-- Function to create a new configuration version
CREATE OR REPLACE FUNCTION create_config_version(
  p_config_key TEXT,
  p_config_type TEXT,
  p_config_data JSONB,
  p_changed_by UUID DEFAULT NULL,
  p_change_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_new_version INTEGER;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
  FROM config_versions
  WHERE config_key = p_config_key;
  
  -- Insert new version
  INSERT INTO config_versions (config_key, config_type, version, config_data, changed_by, change_reason)
  VALUES (p_config_key, p_config_type, v_new_version, p_config_data, p_changed_by, p_change_reason)
  RETURNING id INTO v_version_id;
  
  -- Mark previous versions as inactive
  UPDATE config_versions
  SET is_active = FALSE
  WHERE config_key = p_config_key AND id != v_version_id;
  
  -- Mark new version as active
  UPDATE config_versions
  SET is_active = TRUE
  WHERE id = v_version_id;
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rollback to a specific configuration version
CREATE OR REPLACE FUNCTION rollback_config_version(
  p_config_key TEXT,
  p_target_version INTEGER,
  p_changed_by UUID DEFAULT NULL,
  p_change_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_target_config JSONB;
  v_new_version_id UUID;
BEGIN
  -- Get the target configuration data
  SELECT config_data INTO v_target_config
  FROM config_versions
  WHERE config_key = p_config_key AND version = p_target_version;
  
  IF v_target_config IS NULL THEN
    RAISE EXCEPTION 'Target version % not found for config key %', p_target_version, p_config_key;
  END IF;
  
  -- Create a new version with the rolled-back data
  SELECT create_config_version(p_config_key, 'rollback', v_target_config, p_changed_by, 
    COALESCE(p_change_reason, 'Rollback to version ' || p_target_version))
  INTO v_new_version_id;
  
  RETURN v_target_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get configuration history
CREATE OR REPLACE FUNCTION get_config_history(p_config_key TEXT, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  version INTEGER,
  config_data JSONB,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT cv.id, cv.version, cv.config_data, cv.changed_by, cv.change_reason, cv.created_at, cv.is_active
  FROM config_versions cv
  WHERE cv.config_key = p_config_key
  ORDER BY cv.version DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT ON config_versions TO authenticated;
GRANT EXECUTE ON FUNCTION create_config_version TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_config_version TO authenticated;
GRANT EXECUTE ON FUNCTION get_config_history TO authenticated;

-- Add RLS policies
ALTER TABLE config_versions ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage versions
CREATE POLICY "Admins can manage config versions" ON config_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated users to read versions
CREATE POLICY "Authenticated can read config versions" ON config_versions
  FOR SELECT
  USING (auth.role() = 'authenticated');
