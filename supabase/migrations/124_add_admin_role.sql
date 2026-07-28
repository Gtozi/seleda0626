-- Add the missing 'admin' superuser role and link System Administrator
-- Also fix audit_events.id to have a default (was missing, causing trigger failures)

-- Fix: audit_events.id had no default, causing audit trigger INSERT to fail
ALTER TABLE audit_events ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add the 'admin' role (was missing from the roles table)
INSERT INTO roles (id, name, description, is_superuser, is_system)
VALUES ('role_admin', 'admin', 'System Administrator with full access', true, true)
ON CONFLICT (id) DO NOTHING;

-- Link System Administrator (U-110) to the admin role
INSERT INTO user_roles (user_id, role_id)
SELECT 'U-110', 'role_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = 'U-110' AND role_id = 'role_admin'
);

-- Link Operation Manager (U-111) to the operations role (was missing)
INSERT INTO user_roles (user_id, role_id)
SELECT 'U-111', 'role_operations'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = 'U-111' AND role_id = 'role_operations'
);

-- Grant all permissions to the admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_admin', p.id FROM permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = 'role_admin' AND rp.permission_id = p.id
);
