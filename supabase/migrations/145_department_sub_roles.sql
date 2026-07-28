-- Migration: 145_department_sub_roles.sql
-- Department sub-roles with module access control
-- Adds parent_role_id, department, module_access, role_label to custom_roles
-- Seeds department-specific sub-roles (F&B, Front Office, Housekeeping, etc.)

ALTER TABLE custom_roles
  ADD COLUMN IF NOT EXISTS parent_role_id UUID REFERENCES custom_roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS module_access JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS role_label TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_custom_roles_parent ON custom_roles(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_department ON custom_roles(department);

-- ── FOOD & BEVERAGE DEPARTMENT ─────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('fb_manager', 'F&B Manager', 'Full F&B department management', 'food_beverage', 'fnb', 'F&B Manager',
  '{"fnb":true,"pos":true,"inventory":true,"reports":true,"analytics":true}',
  '{"pos_sales":["read","create","update","refund"],"pos_inventory":["read","create","update"],"pos_reports":["read","export"],"pos_settings":["read","update","manage_outlets"],"pos_kitchen":["read","update"],"inventory":["read","create","update"],"reports":["read","export"],"billing":["read","create","update"]}',
  true),
('fb_waiter', 'Waiter', 'Take orders and serve guests', 'food_beverage', 'fnb', 'Waiter',
  '{"fnb":true,"pos":true}',
  '{"pos_sales":["read","create","update"],"pos_kitchen":["read"]}',
  true),
('fb_bartender', 'Bartender', 'Bar service and drink preparation', 'food_beverage', 'fnb', 'Bartender',
  '{"fnb":true,"pos":true}',
  '{"pos_sales":["read","create","update"],"pos_inventory":["read"]}',
  true),
('fb_barman', 'Barman', 'Bar service operations', 'food_beverage', 'fnb', 'Barman',
  '{"fnb":true,"pos":true}',
  '{"pos_sales":["read","create","update"],"pos_cash_management":["read","cash_in","cash_out"]}',
  true),
('fb_chef', 'Chef', 'Kitchen operations and order preparation', 'food_beverage', 'fnb', 'Chef',
  '{"fnb":true,"pos":true}',
  '{"pos_kitchen":["read","update","complete_orders"],"pos_inventory":["read"]}',
  true),
('fb_sous_chef', 'Sous Chef', 'Assistant kitchen management', 'food_beverage', 'fnb', 'Sous Chef',
  '{"fnb":true,"pos":true}',
  '{"pos_kitchen":["read","update","complete_orders"],"pos_inventory":["read"]}',
  true),
('fb_host', 'Host/Hostess', 'Guest seating and reservations', 'food_beverage', 'fnb', 'Host',
  '{"fnb":true}',
  '{"pos_sales":["read"],"guests":["read","create","update"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── FRONT OFFICE DEPARTMENT ───────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('fo_manager', 'Front Office Manager', 'Full front office management', 'front_office', 'frontoffice', 'FO Manager',
  '{"frontoffice":true,"bookings":true,"guests":true,"rooms":true,"reports":true}',
  '{"bookings":["read","create","update","delete","check_in","check_out"],"guests":["read","create","update","delete"],"rooms":["read","update"],"billing":["read","create","update"],"reports":["read"]}',
  true),
('fo_front_desk', 'Front Desk Agent', 'Check-in/check-out and reservations', 'front_office', 'frontoffice', 'Front Desk',
  '{"frontoffice":true,"bookings":true,"guests":true,"rooms":true}',
  '{"bookings":["read","create","update","check_in","check_out"],"guests":["read","create","update"],"rooms":["read"],"billing":["read","create"]}',
  true),
('fo_reservationist', 'Reservationist', 'Manage reservations and availability', 'front_office', 'frontoffice', 'Reservationist',
  '{"frontoffice":true,"bookings":true,"guests":true}',
  '{"bookings":["read","create","update"],"guests":["read","create","update"]}',
  true),
('fo_night_auditor', 'Night Auditor', 'Night audit and daily reconciliation', 'front_office', 'frontoffice', 'Night Auditor',
  '{"frontoffice":true,"bookings":true,"reports":true,"finance":true}',
  '{"bookings":["read","update","check_in","check_out"],"billing":["read","create","update"],"reports":["read","export"]}',
  true),
('fo_bellman', 'Bellman', 'Guest luggage and assistance', 'front_office', 'frontoffice', 'Bellman',
  '{"frontoffice":true,"guests":true}',
  '{"guests":["read","update"],"rooms":["read"]}',
  true),
('fo_concierge', 'Concierge', 'Guest services and special requests', 'front_office', 'frontoffice', 'Concierge',
  '{"frontoffice":true,"guests":true}',
  '{"guests":["read","create","update"],"bookings":["read"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── HOUSEKEEPING DEPARTMENT ───────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('hk_manager', 'Housekeeping Manager', 'Full housekeeping management', 'housekeeping', 'housekeeping', 'HK Manager',
  '{"housekeeping":true,"rooms":true,"reports":true}',
  '{"rooms":["read","create","update","delete"],"housekeeping":["read","create","update","delete"],"reports":["read"]}',
  true),
('hk_supervisor', 'Housekeeping Supervisor', 'Supervise housekeeping staff and room status', 'housekeeping', 'housekeeping', 'HK Supervisor',
  '{"housekeeping":true,"rooms":true}',
  '{"rooms":["read","update"],"housekeeping":["read","create","update"]}',
  true),
('hk_housekeeper', 'Housekeeper', 'Room cleaning and status updates', 'housekeeping', 'housekeeping', 'Housekeeper',
  '{"housekeeping":true,"rooms":true}',
  '{"rooms":["read","update"],"housekeeping":["read","update"]}',
  true),
('hk_laundry', 'Laundry Attendant', 'Laundry operations', 'housekeeping', 'housekeeping', 'Laundry',
  '{"housekeeping":true}',
  '{"housekeeping":["read","update"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── ENGINEERING / MAINTENANCE DEPARTMENT ──────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('eng_manager', 'Engineering Manager', 'Full maintenance and engineering management', 'engineering', 'engineering', 'Eng Manager',
  '{"engineering":true,"rooms":true,"inventory":true,"reports":true}',
  '{"rooms":["read","update"],"inventory":["read","create","update"],"reports":["read"]}',
  true),
('eng_technician', 'Technician', 'General maintenance and repairs', 'engineering', 'engineering', 'Technician',
  '{"engineering":true,"rooms":true}',
  '{"rooms":["read","update"]}',
  true),
('eng_electrician', 'Electrician', 'Electrical maintenance specialist', 'engineering', 'engineering', 'Electrician',
  '{"engineering":true}',
  '{"rooms":["read","update"]}',
  true),
('eng_plumber', 'Plumber', 'Plumbing maintenance specialist', 'engineering', 'engineering', 'Plumber',
  '{"engineering":true}',
  '{"rooms":["read","update"]}',
  true),
('eng_hvac', 'HVAC Technician', 'HVAC system maintenance', 'engineering', 'engineering', 'HVAC Tech',
  '{"engineering":true}',
  '{"rooms":["read","update"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── FINANCE DEPARTMENT ────────────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('fin_manager', 'Finance Manager', 'Full finance management', 'finance', 'finance', 'Finance Manager',
  '{"finance":true,"billing":true,"reports":true,"analytics":true}',
  '{"billing":["read","create","update","refund"],"reports":["read","export"],"settings":["read","update"],"audit":["read"]}',
  true),
('fin_accountant', 'Accountant', 'Accounting and journal entries', 'finance', 'finance', 'Accountant',
  '{"finance":true,"reports":true}',
  '{"billing":["read","create","update"],"reports":["read","export"]}',
  true),
('fin_cashier', 'Cashier', 'Payment processing and cash handling', 'finance', 'finance', 'Cashier',
  '{"finance":true,"billing":true}',
  '{"billing":["read","create","update"]}',
  true),
('fin_auditor', 'Internal Auditor', 'Audit and compliance review', 'finance', 'finance', 'Auditor',
  '{"finance":true,"reports":true}',
  '{"reports":["read","export"],"audit":["read"],"billing":["read"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── HR DEPARTMENT ─────────────────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('hr_manager', 'HR Manager', 'Full HR management', 'hr', 'hr', 'HR Manager',
  '{"hr":true,"reports":true,"settings":true}',
  '{"users":["read","create","update","delete"],"roles":["read"],"reports":["read"],"settings":["read","update"]}',
  true),
('hr_officer', 'HR Officer', 'Employee management and payroll', 'hr', 'hr', 'HR Officer',
  '{"hr":true}',
  '{"users":["read","create","update"],"reports":["read"]}',
  true),
('hr_trainer', 'Training Coordinator', 'Staff training and development', 'hr', 'hr', 'Trainer',
  '{"hr":true}',
  '{"users":["read"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── INVENTORY DEPARTMENT ──────────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('inv_manager', 'Inventory Manager', 'Full inventory management', 'inventory', 'inventory', 'Inventory Manager',
  '{"inventory":true,"reports":true}',
  '{"inventory":["read","create","update","delete"],"reports":["read","export"]}',
  true),
('inv_clerk', 'Inventory Clerk', 'Stock tracking and adjustments', 'inventory', 'inventory', 'Inventory Clerk',
  '{"inventory":true}',
  '{"inventory":["read","create","update"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── PROCUREMENT DEPARTMENT ────────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('proc_manager', 'Procurement Manager', 'Full procurement management', 'sales', 'procurement', 'Procurement Manager',
  '{"procurement":true,"inventory":true,"reports":true}',
  '{"inventory":["read","create","update"],"reports":["read","export"]}',
  true),
('proc_officer', 'Procurement Officer', 'Purchase orders and supplier management', 'sales', 'procurement', 'Procurement Officer',
  '{"procurement":true}',
  '{"inventory":["read","create"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── SALES & MARKETING DEPARTMENT ──────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('sales_manager', 'Sales Manager', 'Full sales and marketing management', 'sales', 'sales', 'Sales Manager',
  '{"sales":true,"bookings":true,"reports":true,"analytics":true}',
  '{"bookings":["read","create","update"],"guests":["read","create","update"],"reports":["read","export"]}',
  true),
('sales_executive', 'Sales Executive', 'Manage corporate accounts and group bookings', 'sales', 'sales', 'Sales Executive',
  '{"sales":true,"bookings":true}',
  '{"bookings":["read","create","update"],"guests":["read","create","update"]}',
  true),
('sales_coordinator', 'Sales Coordinator', 'Support sales operations', 'sales', 'sales', 'Sales Coordinator',
  '{"sales":true}',
  '{"bookings":["read","create"],"guests":["read","create"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- ── OPERATIONS DEPARTMENT ─────────────────────────────────────────────
INSERT INTO custom_roles (name, display_name, description, category, department, role_label, module_access, permissions, is_system_role) VALUES
('ops_manager', 'Operations Manager', 'Full operations management', 'operations', 'operations', 'Ops Manager',
  '{"operations":true,"frontoffice":true,"housekeeping":true,"fnb":true,"engineering":true,"reports":true,"analytics":true}',
  '{"bookings":["read","update"],"rooms":["read","update"],"reports":["read","export"],"pos_settings":["read","update","manage_outlets"]}',
  true),
('ops_supervisor', 'Operations Supervisor', 'Cross-department supervision', 'operations', 'operations', 'Ops Supervisor',
  '{"operations":true,"frontoffice":true,"housekeeping":true,"fnb":true}',
  '{"rooms":["read","update"],"bookings":["read","update"],"reports":["read"]}',
  true)
ON CONFLICT (name) DO NOTHING;

-- Grant access on new columns
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_roles TO authenticated;

COMMENT ON COLUMN custom_roles.parent_role_id IS 'Parent role for hierarchical sub-roles within a department';
COMMENT ON COLUMN custom_roles.department IS 'Department this role belongs to (fnb, frontoffice, housekeeping, engineering, finance, hr, inventory, procurement, sales, operations)';
COMMENT ON COLUMN custom_roles.module_access IS 'JSONB map of module names to boolean (which modules this role can access)';
COMMENT ON COLUMN custom_roles.role_label IS 'Human-readable label for the sub-role (e.g., Waiter, Bartender, Chef)';
