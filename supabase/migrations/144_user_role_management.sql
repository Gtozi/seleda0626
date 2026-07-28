-- Enhanced User and Role Management System
-- Migration: 144_user_role_management.sql
-- Adds comprehensive role management and user creation capabilities

-- Drop existing objects if they exist for clean migration
DROP TABLE IF EXISTS user_role_assignments CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;
DROP TYPE IF EXISTS role_category;

-- Create enum for role categories
CREATE TYPE role_category AS ENUM (
  'system_admin',
  'executive',
  'operations',
  'finance',
  'front_office',
  'housekeeping',
  'food_beverage',
  'engineering',
  'hr',
  'inventory',
  'sales',
  'custom'
);

-- Custom roles table for defining roles with granular permissions
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category role_category NOT NULL DEFAULT 'custom',
  permissions JSONB DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for custom_roles
CREATE INDEX idx_custom_roles_name ON custom_roles(name);
CREATE INDEX idx_custom_roles_category ON custom_roles(category);
CREATE INDEX idx_custom_roles_active ON custom_roles(is_active);

-- User role assignments table (links users to custom roles)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, role_id, property_id, organization_id)
);

-- Create indexes for user_role_assignments
CREATE INDEX idx_user_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_role ON user_role_assignments(role_id);
CREATE INDEX idx_user_role_assignments_property ON user_role_assignments(property_id);
CREATE INDEX idx_user_role_assignments_organization ON user_role_assignments(organization_id);
CREATE INDEX idx_user_role_assignments_active ON user_role_assignments(is_active);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_role_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_role_timestamp();

-- Function to create a new custom role
CREATE OR REPLACE FUNCTION create_custom_role(
  p_name TEXT,
  p_display_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category role_category DEFAULT 'custom',
  p_permissions JSONB DEFAULT '{}',
  p_is_system_role BOOLEAN DEFAULT FALSE,
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_role_id UUID;
BEGIN
  INSERT INTO custom_roles (
    name, display_name, description, category, permissions, is_system_role, created_by
  ) VALUES (
    p_name, p_display_name, p_description, p_category, p_permissions, p_is_system_role, p_created_by
  )
  RETURNING id INTO v_role_id;
  
  RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign a role to a user
CREATE OR REPLACE FUNCTION assign_role_to_user(
  p_user_id UUID,
  p_role_id UUID,
  p_property_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_assigned_by UUID DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO user_role_assignments (
    user_id, role_id, property_id, organization_id, assigned_by, expires_at
  ) VALUES (
    p_user_id, p_role_id, p_property_id, p_organization_id, p_assigned_by, p_expires_at
  )
  ON CONFLICT (user_id, role_id, property_id, organization_id)
  DO UPDATE SET
    is_active = TRUE,
    assigned_by = COALESCE(EXCLUDED.assigned_by, user_role_assignments.assigned_by),
    expires_at = COALESCE(EXCLUDED.expires_at, user_role_assignments.expires_at),
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's roles and permissions
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE (
  role_id UUID,
  role_name TEXT,
  display_name TEXT,
  category role_category,
  permissions JSONB,
  property_id UUID,
  organization_id UUID,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.name,
    cr.display_name,
    cr.category,
    cr.permissions,
    ura.property_id,
    ura.organization_id,
    ura.is_active
  FROM user_role_assignments ura
  JOIN custom_roles cr ON ura.role_id = cr.id
  WHERE ura.user_id = p_user_id
    AND cr.is_active = TRUE
    AND (ura.expires_at IS NULL OR ura.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new user (auth.user + system_user record)
CREATE OR REPLACE FUNCTION create_system_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'member',
  p_department TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_force_password_change BOOLEAN DEFAULT TRUE
) RETURNS JSONB AS $$
DECLARE
  v_auth_user_id UUID;
  v_system_user_id TEXT;
  v_result JSONB;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW()
  )
  RETURNING id INTO v_auth_user_id;
  
  -- Generate system user ID
  v_system_user_id := 'U-' || (nextval('system_users_id_seq')::TEXT);
  
  -- Create system user record
  INSERT INTO system_users (
    id, name, email, role, department, phone, status, 
    force_password_change, created_at, updated_at
  ) VALUES (
    v_system_user_id,
    p_name,
    p_email,
    p_role,
    p_department,
    p_phone,
    'Active',
    p_force_password_change,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_system_user_id;
  
  -- Return result
  v_result := jsonb_build_object(
    'auth_user_id', v_auth_user_id,
    'system_user_id', v_system_user_id,
    'email', p_email,
    'name', p_name,
    'success', true
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default custom roles
INSERT INTO custom_roles (name, display_name, description, category, permissions, is_system_role) VALUES
  (
    'super_admin',
    'Super Administrator',
    'Full system access with all permissions',
    'system_admin',
    '{
      "all": true,
      "admin": true,
      "users": ["create", "read", "update", "delete"],
      "roles": ["create", "read", "update", "delete"],
      "settings": ["read", "update"],
      "audit": ["read"]
    }'::jsonb,
    true
  ),
  (
    'property_admin',
    'Property Administrator',
    'Full access to property management',
    'operations',
    '{
      "admin": false,
      "property": ["create", "read", "update", "delete"],
      "reservations": ["create", "read", "update", "delete"],
      "rooms": ["read", "update"],
      "guests": ["create", "read", "update"],
      "reports": ["read"]
    }'::jsonb,
    true
  ),
  (
    'front_desk_manager',
    'Front Desk Manager',
    'Front office operations and guest management',
    'front_office',
    '{
      "reservations": ["create", "read", "update"],
      "checkin": ["create", "read"],
      "checkout": ["create", "read"],
      "guests": ["create", "read", "update"],
      "rooms": ["read", "update"],
      "reports": ["read"]
    }'::jsonb,
    true
  ),
  (
    'housekeeping_supervisor',
    'Housekeeping Supervisor',
    'Room status and housekeeping management',
    'housekeeping',
    '{
      "rooms": ["read", "update"],
      "housekeeping": ["create", "read", "update"],
      "maintenance": ["create", "read"]
    }'::jsonb,
    true
  ),
  (
    'finance_manager',
    'Finance Manager',
    'Financial reports and billing management',
    'finance',
    '{
      "billing": ["create", "read", "update"],
      "payments": ["create", "read", "update"],
      "reports": ["read"],
      "folios": ["read", "update"]
    }'::jsonb,
    true
  ),
  (
    'report_viewer',
    'Report Viewer',
    'Read-only access to reports and analytics',
    'operations',
    '{
      "reports": ["read"],
      "analytics": ["read"]
    }'::jsonb,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_role_assignments TO authenticated;
GRANT SELECT ON custom_roles TO anon;
GRANT SELECT ON user_role_assignments TO anon;

GRANT EXECUTE ON FUNCTION create_custom_role TO authenticated;
GRANT EXECUTE ON FUNCTION assign_role_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_user TO authenticated;

-- RLS Policies
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Custom roles policies
CREATE POLICY "Authenticated can read custom_roles" ON custom_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write custom_roles" ON custom_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN custom_roles cr ON ura.role_id = cr.id
      WHERE ura.user_id = auth.uid() 
        AND cr.name IN ('super_admin', 'property_admin')
        AND ura.is_active = TRUE
    )
  );

-- User role assignments policies
CREATE POLICY "Users can read their own role assignments" ON user_role_assignments
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Admins can read all role assignments" ON user_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN custom_roles cr ON ura.role_id = cr.id
      WHERE ura.user_id = auth.uid() 
        AND cr.name IN ('super_admin', 'property_admin')
        AND ura.is_active = TRUE
    )
  );

CREATE POLICY "Admins can write role assignments" ON user_role_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN custom_roles cr ON ura.role_id = cr.id
      WHERE ura.user_id = auth.uid() 
        AND cr.name IN ('super_admin', 'property_admin')
        AND ura.is_active = TRUE
    )
  );

-- Add comment for documentation
COMMENT ON TABLE custom_roles IS 'Custom roles with granular permissions for user management';
COMMENT ON TABLE user_role_assignments IS 'Assigns custom roles to users with property/organization scope';
COMMENT ON FUNCTION create_system_user IS 'Creates a new auth user and corresponding system_user record';
COMMENT ON FUNCTION create_custom_role IS 'Creates a new custom role with specified permissions';
COMMENT ON FUNCTION assign_role_to_user IS 'Assigns a custom role to a user with optional property/organization scope';
COMMENT ON FUNCTION get_user_roles IS 'Returns all active roles and permissions for a user';
