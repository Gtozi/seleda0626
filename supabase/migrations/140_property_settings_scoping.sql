-- Property-Level Settings Scoping
-- Allows settings to be scoped at organization or property level with inheritance

-- Property settings table
CREATE TABLE IF NOT EXISTS property_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'array'
  is_encrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_property_settings_property ON property_settings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_settings_key ON property_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_property_settings_active ON property_settings(is_active);

-- Organization settings table (defaults that properties can override)
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'string',
  is_encrypted BOOLEAN DEFAULT FALSE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_org_settings_org ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_settings_key ON organization_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_org_settings_active ON organization_settings(is_active);

-- Setting definitions (catalog of available settings)
CREATE TABLE IF NOT EXISTS setting_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_name TEXT NOT NULL,
  description TEXT,
  setting_type TEXT DEFAULT 'string',
  default_value JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  is_encrypted BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general', -- 'general', 'booking', 'payment', 'reporting', etc.
  allowed_values JSONB DEFAULT '[]', -- For enum-like settings
  validation_regex TEXT,
  scope_level TEXT DEFAULT 'property', -- 'organization', 'property', 'both'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_setting_defs_key ON setting_definitions(setting_key);
CREATE INDEX IF NOT EXISTS idx_setting_defs_category ON setting_definitions(category);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_property_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_settings_updated_at
  BEFORE UPDATE ON property_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_property_settings_timestamp();

CREATE TRIGGER organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_property_settings_timestamp();

CREATE TRIGGER setting_definitions_updated_at
  BEFORE UPDATE ON setting_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_property_settings_timestamp();

-- Function to get property setting with inheritance from organization
CREATE OR REPLACE FUNCTION get_property_setting(p_property_id UUID, p_setting_key TEXT)
RETURNS TABLE (
  setting_value JSONB,
  setting_type TEXT,
  source TEXT -- 'property', 'organization', 'default'
) AS $$
DECLARE
  v_org_id UUID;
  v_default_value JSONB;
  v_default_type TEXT;
BEGIN
  -- Get organization ID for the property
  SELECT organization_id INTO v_org_id
  FROM properties
  WHERE id = p_property_id;
  
  -- Try to get property-level setting
  RETURN QUERY
  SELECT 
    ps.setting_value,
    ps.setting_type,
    'property'::TEXT
  FROM property_settings ps
  WHERE ps.property_id = p_property_id 
    AND ps.setting_key = p_setting_key 
    AND ps.is_active = TRUE;
  
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Try to get organization-level setting
  IF v_org_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      os.setting_value,
      os.setting_type,
      'organization'::TEXT
    FROM organization_settings os
    WHERE os.organization_id = v_org_id 
      AND os.setting_key = p_setting_key 
      AND os.is_active = TRUE;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Get default value from definition
  SELECT default_value, setting_type INTO v_default_value, v_default_type
  FROM setting_definitions
  WHERE setting_key = p_setting_key;
  
  IF v_default_value IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      v_default_value,
      COALESCE(v_default_type, 'string')::TEXT,
      'default'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set property setting
CREATE OR REPLACE FUNCTION set_property_setting(
  p_property_id UUID,
  p_setting_key TEXT,
  p_setting_value JSONB,
  p_setting_type TEXT DEFAULT 'string'
) RETURNS UUID AS $$
DECLARE
  v_setting_id UUID;
BEGIN
  INSERT INTO property_settings (
    property_id, setting_key, setting_value, setting_type
  ) VALUES (
    p_property_id, p_setting_key, p_setting_value, p_setting_type
  )
  ON CONFLICT (property_id, setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    updated_at = NOW()
  RETURNING id INTO v_setting_id;
  
  RETURN v_setting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set organization setting
CREATE OR REPLACE FUNCTION set_organization_setting(
  p_organization_id UUID,
  p_setting_key TEXT,
  p_setting_value JSONB,
  p_setting_type TEXT DEFAULT 'string'
) RETURNS UUID AS $$
DECLARE
  v_setting_id UUID;
BEGIN
  INSERT INTO organization_settings (
    organization_id, setting_key, setting_value, setting_type
  ) VALUES (
    p_organization_id, p_setting_key, p_setting_value, p_setting_type
  )
  ON CONFLICT (organization_id, setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    updated_at = NOW()
  RETURNING id INTO v_setting_id;
  
  RETURN v_setting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for all property settings with inheritance
CREATE OR REPLACE VIEW property_settings_inherited AS
SELECT 
  p.id as property_id,
  p.property_name,
  p.organization_id,
  o.org_name,
  sd.setting_key,
  COALESCE(ps.setting_value, os.setting_value, sd.default_value) as setting_value,
  COALESCE(ps.setting_type, os.setting_type, sd.setting_type) as setting_type,
  CASE 
    WHEN ps.setting_value IS NOT NULL THEN 'property'
    WHEN os.setting_value IS NOT NULL THEN 'organization'
    ELSE 'default'
  END as source,
  sd.description
FROM properties p
JOIN organizations o ON p.organization_id = o.id
CROSS JOIN setting_definitions sd
LEFT JOIN property_settings ps ON ps.property_id = p.id AND ps.setting_key = sd.setting_key AND ps.is_active = TRUE
LEFT JOIN organization_settings os ON os.organization_id = o.id AND os.setting_key = sd.setting_key AND os.is_active = TRUE
WHERE p.is_active = TRUE;

-- Insert default setting definitions
INSERT INTO setting_definitions (setting_key, setting_name, description, setting_type, default_value, category, scope_level) VALUES
  ('check_in_time', 'Check-in Time', 'Default check-in time for the property', 'string', '"14:00"', 'general', 'both'),
  ('check_out_time', 'Check-out Time', 'Default check-out time for the property', 'string', '"11:00"', 'general', 'both'),
  ('currency_code', 'Currency Code', 'Default currency for pricing', 'string', '"ETB"', 'general', 'both'),
  ('timezone', 'Timezone', 'Property timezone for scheduling', 'string', '"Africa/Addis_Ababa"', 'general', 'property'),
  ('tax_rate', 'Tax Rate', 'Default tax rate percentage', 'number', '15', 'booking', 'both'),
  ('service_charge', 'Service Charge', 'Service charge percentage', 'number', '10', 'booking', 'both'),
  ('require_credit_card', 'Require Credit Card', 'Require credit card for booking', 'boolean', 'false', 'booking', 'both'),
  ('cancellation_policy_hours', 'Cancellation Policy Hours', 'Hours before check-in for free cancellation', 'number', '24', 'booking', 'both'),
  ('max_guests_per_room', 'Max Guests Per Room', 'Maximum guests allowed per room', 'number', '4', 'general', 'property'),
  ('min_nights_stay', 'Minimum Nights Stay', 'Minimum nights for booking', 'number', '1', 'booking', 'both'),
  ('max_nights_stay', 'Maximum Nights Stay', 'Maximum nights for booking', 'number', '30', 'booking', 'both'),
  ('breakfast_included', 'Breakfast Included', 'Include breakfast by default', 'boolean', 'false', 'general', 'property'),
  ('payment_methods', 'Payment Methods', 'Accepted payment methods', 'array', '["cash", "card"]', 'payment', 'both'),
  ('invoice_footer', 'Invoice Footer', 'Footer text for invoices', 'string', '"Thank you for your stay!"', 'reporting', 'property'),
  ('receipt_email_required', 'Receipt Email Required', 'Require email for receipt', 'boolean', 'true', 'booking', 'both')
ON CONFLICT (setting_key) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON property_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON setting_definitions TO authenticated;
GRANT SELECT ON property_settings_inherited TO authenticated;

GRANT EXECUTE ON FUNCTION get_property_setting TO authenticated;
GRANT EXECUTE ON FUNCTION set_property_setting TO authenticated;
GRANT EXECUTE ON FUNCTION set_organization_setting TO authenticated;

-- RLS policies
ALTER TABLE property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read property settings" ON property_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write property settings" ON property_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read organization settings" ON organization_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write organization settings" ON organization_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read setting definitions" ON setting_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write setting definitions" ON setting_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );
