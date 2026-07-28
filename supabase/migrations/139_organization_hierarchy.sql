-- Organization Hierarchy Management
-- Multi-property foundation with organization hierarchy and property management

-- Drop objects if they exist to ensure clean schema
DROP VIEW IF EXISTS user_property_access CASCADE;
DROP TABLE IF EXISTS property_users CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS property_hierarchy CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations table (top-level entity)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  org_code TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(org_code);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- Properties table (hotel properties within organizations)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_code TEXT NOT NULL,
  property_type TEXT DEFAULT 'hotel', -- 'hotel', 'resort', 'motel', 'hostel', etc.
  star_rating INTEGER DEFAULT 3,
  address JSONB DEFAULT '{}',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  timezone TEXT DEFAULT 'Africa/Addis_Ababa',
  currency_code TEXT DEFAULT 'ETB',
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, property_code)
);

CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(property_code);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);

-- Property hierarchy (for nested property structures)
CREATE TABLE IF NOT EXISTS property_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  child_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'branch', -- 'branch', 'satellite', 'annex', etc.
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_property_id, child_property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_hierarchy_parent ON property_hierarchy(parent_property_id);
CREATE INDEX IF NOT EXISTS idx_property_hierarchy_child ON property_hierarchy(child_property_id);

-- Organization users (cross-property user assignments)
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'manager', 'member', 'viewer'
  is_global BOOLEAN DEFAULT FALSE, -- If true, user has access to all properties in org
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_users_org ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_role ON organization_users(role);

-- Property users (property-specific user assignments)
CREATE TABLE IF NOT EXISTS property_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'manager', 'frontdesk', 'housekeeping', etc.
  permissions JSONB DEFAULT '{}', -- Granular permissions per property
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_property_users_property ON property_users(property_id);
CREATE INDEX IF NOT EXISTS idx_property_users_user ON property_users(user_id);
CREATE INDEX IF NOT EXISTS idx_property_users_role ON property_users(role);

-- User property access view (combines org and property access)
CREATE OR REPLACE VIEW user_property_access AS
SELECT 
  ou.user_id,
  ou.organization_id,
  CASE 
    WHEN ou.is_global THEN p.id
    ELSE pu.property_id
  END as property_id,
  CASE 
    WHEN ou.is_global THEN ou.role
    ELSE pu.role
  END as role,
  CASE 
    WHEN ou.is_global THEN TRUE
    ELSE pu.is_active
  END as is_active
FROM organization_users ou
CROSS JOIN properties p
LEFT JOIN property_users pu ON pu.user_id = ou.user_id AND pu.property_id = p.id
WHERE ou.organization_id = p.organization_id
  AND (ou.is_global OR pu.property_id IS NOT NULL);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_organization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();

CREATE TRIGGER organization_users_updated_at
  BEFORE UPDATE ON organization_users
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();

CREATE TRIGGER property_users_updated_at
  BEFORE UPDATE ON property_users
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();

-- Function to get user's accessible properties
CREATE OR REPLACE FUNCTION get_user_properties(p_user_id UUID)
RETURNS TABLE (
  property_id UUID,
  property_name TEXT,
  property_code TEXT,
  organization_id UUID,
  organization_name TEXT,
  role TEXT,
  is_global BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.property_name,
    p.property_code,
    o.id,
    o.org_name,
    COALESCE(ou.role, pu.role) as role,
    COALESCE(ou.is_global, FALSE) as is_global
  FROM properties p
  JOIN organizations o ON p.organization_id = o.id
  LEFT JOIN organization_users ou ON ou.organization_id = o.id AND ou.user_id = p_user_id
  LEFT JOIN property_users pu ON pu.property_id = p.id AND pu.user_id = p_user_id
  WHERE (ou.user_id = p_user_id OR pu.user_id = p_user_id)
    AND p.is_active = TRUE
    AND o.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign user to organization
CREATE OR REPLACE FUNCTION assign_user_to_organization(
  p_organization_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member',
  p_is_global BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO organization_users (
    organization_id, user_id, role, is_global
  ) VALUES (
    p_organization_id, p_user_id, p_role, p_is_global
  )
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    is_global = EXCLUDED.is_global,
    updated_at = NOW()
  RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign user to property
CREATE OR REPLACE FUNCTION assign_user_to_property(
  p_property_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member',
  p_permissions JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO property_users (
    property_id, user_id, role, permissions
  ) VALUES (
    p_property_id, p_user_id, p_role, p_permissions
  )
  ON CONFLICT (property_id, user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = NOW()
  RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_hierarchy TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_users TO authenticated;
GRANT SELECT ON user_property_access TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_properties TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_to_organization TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_to_property TO authenticated;

-- RLS policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read organizations" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read properties" ON properties
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read property_hierarchy" ON property_hierarchy
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write property_hierarchy" ON property_hierarchy
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read organization_users" ON organization_users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (user_id = auth.uid() OR 
     EXISTS (
       SELECT 1 FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
     ))
  );

CREATE POLICY "Admins can write organization_users" ON organization_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read property_users" ON property_users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (user_id = auth.uid() OR 
     EXISTS (
       SELECT 1 FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
     ))
  );

CREATE POLICY "Admins can write property_users" ON property_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

-- Insert default organization for existing data
INSERT INTO organizations (org_name, org_code, description) 
VALUES ('SELEDA Hotels', 'SELEDA', 'Default organization for SELEDA hotel properties')
ON CONFLICT (org_code) DO NOTHING;
