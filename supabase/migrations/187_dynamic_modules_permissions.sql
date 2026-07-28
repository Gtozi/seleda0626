-- ============================================================
-- Dynamic Modules & Permission Categories Registry
-- ============================================================
-- Replaces hardcoded PERMISSION_CATEGORIES, DEPARTMENT_MODULE_ACCESS,
-- and DEPARTMENT_PERMISSION_CATEGORIES in PermissionChecklist.tsx
-- with database-driven definitions that auto-sync when modules are
-- added or removed.
-- ============================================================

-- 1. Modules table — stores department-specific sub-module definitions
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Permission Categories table — stores category + actions definitions
CREATE TABLE IF NOT EXISTS public.permission_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Department Permission Categories — maps departments to permission categories
CREATE TABLE IF NOT EXISTS public.department_permission_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.permission_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(department, category_id)
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_permission_categories ENABLE ROW LEVEL SECURITY;

-- Anon: no access to any of these tables
DO $$
BEGIN
  EXECUTE 'CREATE POLICY modules_anon_no_access ON public.modules FOR ALL TO anon USING (false) WITH CHECK (false);';
  EXECUTE 'CREATE POLICY perm_cat_anon_no_access ON public.permission_categories FOR ALL TO anon USING (false) WITH CHECK (false);';
  EXECUTE 'CREATE POLICY dept_perm_cat_anon_no_access ON public.department_permission_categories FOR ALL TO anon USING (false) WITH CHECK (false);';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated: read-only
DO $$
BEGIN
  EXECUTE 'CREATE POLICY modules_auth_select ON public.modules FOR SELECT TO authenticated USING (true);';
  EXECUTE 'CREATE POLICY perm_cat_auth_select ON public.permission_categories FOR SELECT TO authenticated USING (true);';
  EXECUTE 'CREATE POLICY dept_perm_cat_auth_select ON public.department_permission_categories FOR SELECT TO authenticated USING (true);';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. Seed Permission Categories (from PERMISSION_CATEGORIES + POS)
-- ============================================================

INSERT INTO public.permission_categories (id, label, icon, actions, sort_order) VALUES
  ('users', 'User Management', '👥', '["read","create","update","delete"]', 1),
  ('roles', 'Role Management', '🔐', '["read","create","update","delete"]', 2),
  ('bookings', 'Bookings', '📅', '["read","create","update","delete","check_in","check_out"]', 3),
  ('rooms', 'Rooms', '🛏️', '["read","create","update","delete"]', 4),
  ('guests', 'Guests', '👤', '["read","create","update","delete"]', 5),
  ('reports', 'Reports', '📊', '["read","export"]', 6),
  ('billing', 'Billing & Payments', '💳', '["read","create","update","refund"]', 7),
  ('inventory', 'Inventory', '📦', '["read","create","update","delete"]', 8),
  ('settings', 'System Settings', '⚙️', '["read","update"]', 9),
  ('audit', 'Audit Logs', '📋', '["read"]', 10),
  ('pos_sales', 'POS Sales', '🛒', '["read","create","update","delete","refund","void"]', 11),
  ('pos_inventory', 'POS Inventory', '📦', '["read","create","update","delete","adjust","transfer"]', 12),
  ('pos_reports', 'POS Reports', '📊', '["read","export","view_shifts","view_sales"]', 13),
  ('pos_settings', 'POS Settings', '⚙️', '["read","update","manage_outlets","manage_menus"]', 14),
  ('pos_kitchen', 'Kitchen Display', '👨‍🍳', '["read","update","complete_orders"]', 15),
  ('pos_cash_management', 'Cash Management', '💵', '["read","create","update","cash_in","cash_out","declare_float"]', 16),
  ('housekeeping', 'Housekeeping', '🧹', '["read","create","update","delete"]', 17),
  ('maintenance', 'Maintenance', '🔧', '["read","create","update","delete"]', 18)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Seed Department Permission Categories
-- ============================================================

INSERT INTO public.department_permission_categories (department, category_id, sort_order) VALUES
  -- fnb
  ('fnb', 'pos_sales', 1), ('fnb', 'pos_kitchen', 2), ('fnb', 'pos_inventory', 3),
  ('fnb', 'pos_cash_management', 4), ('fnb', 'pos_reports', 5), ('fnb', 'pos_settings', 6),
  ('fnb', 'inventory', 7), ('fnb', 'billing', 8), ('fnb', 'reports', 9),
  -- frontoffice
  ('frontoffice', 'bookings', 1), ('frontoffice', 'guests', 2), ('frontoffice', 'rooms', 3),
  ('frontoffice', 'billing', 4), ('frontoffice', 'reports', 5),
  -- housekeeping
  ('housekeeping', 'rooms', 1), ('housekeeping', 'housekeeping', 2), ('housekeeping', 'reports', 3),
  -- engineering
  ('engineering', 'rooms', 1), ('engineering', 'maintenance', 2), ('engineering', 'reports', 3),
  -- finance
  ('finance', 'billing', 1), ('finance', 'reports', 2), ('finance', 'settings', 3),
  -- hr
  ('hr', 'users', 1), ('hr', 'reports', 2),
  -- inventory
  ('inventory', 'inventory', 1), ('inventory', 'reports', 2),
  -- procurement
  ('procurement', 'inventory', 1), ('procurement', 'reports', 2)
ON CONFLICT (department, category_id) DO NOTHING;

-- ============================================================
-- 6. Seed Modules (from DEPARTMENT_MODULE_ACCESS)
-- ============================================================

INSERT INTO public.modules (id, department, label, icon, description, sort_order) VALUES
  -- F&B
  ('fb_dashboard', 'fnb', 'Dashboard', '📊', 'F&B overview dashboard', 1),
  ('fb_stores', 'fnb', 'Stores', '🏪', 'Consolidated F&B store management', 2),
  ('fb_meals', 'fnb', 'In-House Meals', '🍽️', 'In-house meal orders', 3),
  ('fb_kds', 'fnb', 'Kitchen/KDS', '👨‍🍳', 'Kitchen Display System', 4),
  ('fb_menu', 'fnb', 'Menu Management', '📋', 'Menu items and categories', 5),
  ('fb_banquets', 'fnb', 'Banquets', '🎉', 'Banquet events management', 6),
  ('fb_recipes', 'fnb', 'Recipes', '📖', 'Recipe management', 7),
  ('fb_beo', 'fnb', 'BEO Builder', '📝', 'Banquet Event Order builder', 8),
  ('fb_waste', 'fnb', 'Waste Track', '🗑️', 'Food waste tracking', 9),
  ('fb_suppliers', 'fnb', 'Suppliers', '🏭', 'F&B supplier management', 10),
  ('fb_purchase_orders', 'fnb', 'Purchase Orders', '🛒', 'F&B purchase orders', 11),
  ('fb_staff', 'fnb', 'Staff', '👥', 'F&B staff management', 12),
  ('fb_analytics', 'fnb', 'Analytics', '📉', 'F&B performance analytics', 13),
  ('fb_reports', 'fnb', 'Reports', '📈', 'F&B reports', 14),
  ('fb_standard_reports', 'fnb', 'Standard Reports', '📄', 'Standard F&B reports', 15),
  ('fb_bar_store', 'fnb', 'Bar Store', '🍺', 'Bar store management', 16),
  ('fb_kitchen', 'fnb', 'Kitchen Mgmt', '🍳', 'Kitchen management', 17),
  ('fb_bar', 'fnb', 'Bar Mgmt', '🍸', 'Bar management', 18),
  -- Front Office
  ('fo_dashboard', 'frontoffice', 'Dashboard', '📊', 'Front Office dashboard', 1),
  ('fo_reservations', 'frontoffice', 'Reservations', '📅', 'Room reservations management', 2),
  ('fo_folio', 'frontoffice', 'Folio', '💰', 'Guest folio and billing', 3),
  ('fo_crm', 'frontoffice', 'CRM Board', '👤', 'Guest CRM management', 4),
  ('fo_reports', 'frontoffice', 'Reports', '📈', 'Front Office reports', 5),
  ('fo_inventory', 'frontoffice', 'Inventory', '📦', 'Front Office inventory', 6),
  ('fo_standard_reports', 'frontoffice', 'Standard Reports', '📄', 'Standard Front Office reports', 7),
  -- Housekeeping
  ('hk_dashboard', 'housekeeping', 'Dashboard', '📊', 'Housekeeping dashboard', 1),
  ('hk_rooms', 'housekeeping', 'Rooms', '🛏️', 'Room status management', 2),
  ('hk_tasks', 'housekeeping', 'Tasks', '🧹', 'Housekeeping tasks', 3),
  ('hk_laundry', 'housekeeping', 'Laundry', '👔', 'Laundry management', 4),
  ('hk_inventory', 'housekeeping', 'Inventory', '📦', 'Housekeeping inventory', 5),
  ('hk_amenities', 'housekeeping', 'Amenities', '🧴', 'Amenities management', 6),
  ('hk_lostfound', 'housekeeping', 'Lost & Found', '🔍', 'Lost and found items', 7),
  ('hk_staff', 'housekeeping', 'Staff', '👥', 'Housekeeping staff', 8),
  ('hk_reports', 'housekeeping', 'Reports', '📈', 'Housekeeping reports', 9),
  ('hk_standard_reports', 'housekeeping', 'Standard Reports', '📄', 'Standard Housekeeping reports', 10),
  -- Engineering (uses 'engineering' department key, not 'maintenance')
  ('eng_dashboard', 'engineering', 'Dashboard', '📊', 'Engineering dashboard', 1),
  ('eng_workorders', 'engineering', 'Work Orders', '🔧', 'Maintenance work orders', 2),
  ('eng_pm', 'engineering', 'Preventive', '📅', 'Preventive maintenance', 3),
  ('eng_assets', 'engineering', 'Assets', '🏷️', 'Asset management', 4),
  ('eng_rooms', 'engineering', 'Rooms', '🛏️', 'Room maintenance', 5),
  ('eng_utilities', 'engineering', 'Utilities', '💡', 'Utilities management', 6),
  ('eng_inventory', 'engineering', 'Inventory', '📦', 'Engineering inventory', 7),
  ('eng_staff', 'engineering', 'Staff', '👥', 'Engineering staff', 8),
  ('eng_compliance', 'engineering', 'Compliance', '✅', 'Compliance tracking', 9),
  ('eng_reports', 'engineering', 'Reports', '📈', 'Engineering reports', 10),
  ('eng_standard_reports', 'engineering', 'Standard Reports', '📄', 'Standard Engineering reports', 11),
  -- Inventory
  ('inv_dashboard', 'inventory', 'Dashboard', '📊', 'Inventory dashboard', 1),
  ('inv_items', 'inventory', 'Items', '📦', 'Inventory items management', 2),
  ('inv_stores', 'inventory', 'Stores', '🏪', 'Inventory stores management', 3),
  ('inv_requisition', 'inventory', 'Requisitions', '📋', 'Inventory requisitions', 4),
  ('inv_receiving', 'inventory', 'Receiving', '📥', 'Goods receiving', 5),
  ('inv_count', 'inventory', 'Stock Count', '🔢', 'Stock counting', 6),
  ('inv_suppliers', 'inventory', 'Suppliers', '🏭', 'Supplier management', 7),
  ('inv_standard_reports', 'inventory', 'Standard Reports', '📄', 'Standard Inventory reports', 8),
  ('inv_reports', 'inventory', 'Reports', '📈', 'Inventory reports', 9),
  -- Finance
  ('fin_dashboard', 'finance', 'Dashboard', '📊', 'Finance dashboard', 1),
  ('fin_gl', 'finance', 'General Ledger', '📚', 'General ledger management', 2),
  ('fin_sales', 'finance', 'Sales', '💰', 'Sales records', 3),
  ('fin_ap', 'finance', 'Accounts Payable', '📤', 'Accounts payable', 4),
  ('fin_ar', 'finance', 'Accounts Receivable', '📥', 'Accounts receivable', 5),
  ('fin_bank_recon', 'finance', 'Bank Reconciliation', '🏦', 'Bank reconciliation', 6),
  ('fin_reports', 'finance', 'Reports', '📈', 'Financial reports', 7),
  ('fin_trial_balance', 'finance', 'Trial Balance', '⚖️', 'Trial balance', 8),
  ('fin_statements', 'finance', 'Financial Statements', '📄', 'Financial statements', 9),
  ('fin_budget', 'finance', 'Budget', '🎯', 'Budget management', 10),
  ('fin_tax', 'finance', 'Tax Compliance', '🧾', 'Tax compliance', 11),
  ('fin_erca_vat', 'finance', 'ERCA VAT', '🏛️', 'ERCA VAT management', 12),
  ('fin_standard_reports', 'finance', 'Standard Reports', '📄', 'Standard Finance reports', 13),
  ('fin_period_close', 'finance', 'Period Close', '🔒', 'Period closing', 14),
  ('fin_assets', 'finance', 'Fixed Assets', '🏢', 'Fixed asset management', 15),
  -- HR
  ('hr_dashboard', 'hr', 'Dashboard', '📊', 'HR dashboard', 1),
  ('hr_employees', 'hr', 'Employees', '👥', 'Employee management', 2),
  ('hr_attendance', 'hr', 'Attendance', '⏰', 'Attendance tracking', 3),
  ('hr_payroll', 'hr', 'Payroll', '💰', 'Payroll management', 4),
  ('hr_leave', 'hr', 'Leave', '🏖️', 'Leave management', 5),
  ('hr_performance', 'hr', 'Performance', '🎯', 'Performance reviews', 6),
  ('hr_training', 'hr', 'Training', '🎓', 'Training management', 7),
  ('hr_recruitment', 'hr', 'Recruitment', '📝', 'Recruitment management', 8),
  ('hr_reports', 'hr', 'Reports', '📈', 'HR reports', 9),
  ('hr_standard_reports', 'hr', 'Standard Reports', '📄', 'Standard HR reports', 10),
  -- Procurement
  ('proc_dashboard', 'procurement', 'Dashboard', '📊', 'Procurement dashboard', 1),
  ('proc_requisitions', 'procurement', 'Requisitions', '📋', 'Procurement requisitions', 2),
  ('proc_orders', 'procurement', 'Purchase Orders', '🛒', 'Purchase order management', 3),
  ('proc_suppliers', 'procurement', 'Suppliers', '🏭', 'Supplier management', 4),
  ('proc_rfq', 'procurement', 'RFQ', '📝', 'Request for quotation', 5),
  ('proc_receiving', 'procurement', 'Receiving', '📥', 'Goods receiving', 6),
  ('proc_contracts', 'procurement', 'Contracts', '📜', 'Contract management', 7),
  ('proc_budget', 'procurement', 'Budget', '🎯', 'Budget management', 8),
  ('proc_invoices', 'procurement', 'Invoices', '🧾', 'Invoice management', 9),
  ('proc_approvals', 'procurement', 'Approvals', '✅', 'Approval workflow', 10),
  ('proc_reports', 'procurement', 'Reports', '📈', 'Procurement reports', 11),
  ('proc_standard_reports', 'procurement', 'Standard Reports', '📄', 'Standard Procurement reports', 12),
  -- Generic
  ('dashboard', 'general', 'Dashboard', '📊', 'Main dashboard', 1),
  ('reports', 'general', 'Reports', '📈', 'General reports', 2),
  ('settings', 'general', 'Settings', '⚙️', 'System settings', 3),
  ('users', 'general', 'Users', '👥', 'User management', 4),
  ('notifications', 'general', 'Notifications', '🔔', 'Alerts and notifications', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. Auto-sync function: clean up module_access when module is deactivated
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_module_access_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When a module is deactivated or deleted, remove it from all roles' module_access
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.is_active = false) THEN
    UPDATE public.roles
    SET module_access = module_access - OLD.id,
        updated_at = NOW()
    WHERE module_access ? OLD.id;
  END IF;

  -- When a new module is added, log it (roles still need explicit assignment)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_events (action, module, details, outcome)
    VALUES (
      'module.registered',
      'admin',
      jsonb_build_object('module_id', NEW.id, 'label', NEW.label, 'department', NEW.department),
      'success'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_sync_module_access ON public.modules;
CREATE TRIGGER trg_sync_module_access
  AFTER INSERT OR UPDATE OR DELETE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.sync_module_access_on_change();

-- ============================================================
-- 8. Auto-sync function: clean up permissions when category is deleted
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_permissions_on_category_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When a permission category is deleted, remove it from all roles' permissions JSONB
  IF TG_OP = 'DELETE' THEN
    UPDATE public.roles
    SET permissions = permissions - OLD.id,
        updated_at = NOW()
    WHERE permissions ? OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_permissions ON public.permission_categories;
CREATE TRIGGER trg_sync_permissions
  AFTER DELETE ON public.permission_categories
  FOR EACH ROW EXECUTE FUNCTION public.sync_permissions_on_category_change();

-- ============================================================
-- 9. Convenience function: get all module/permission definitions for frontend
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_module_registry()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'modules', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', m.id, 'department', m.department, 'label', m.label,
          'icon', m.icon, 'description', m.description,
          'is_active', m.is_active, 'sort_order', m.sort_order
        )
        ORDER BY m.department, m.sort_order
      )
      FROM public.modules m
      WHERE m.is_active = true
    ),
    'permissionCategories', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pc.id, 'label', pc.label, 'icon', pc.icon,
          'actions', pc.actions, 'sort_order', pc.sort_order
        )
        ORDER BY pc.sort_order
      )
      FROM public.permission_categories pc
    ),
    'departmentPermissionCategories', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'department', dpc.department, 'category_id', dpc.category_id,
          'sort_order', dpc.sort_order
        )
        ORDER BY dpc.department, dpc.sort_order
      )
      FROM public.department_permission_categories dpc
    ),
    'departments', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', d.id, 'label', d.label, 'icon', d.icon, 'color', d.color
        )
      )
      FROM (VALUES
        ('executive', 'Executive', '👑', 'gold'),
        ('fnb', 'Food & Beverage', '🍽️', 'amber'),
        ('frontoffice', 'Front Office', '🏨', 'indigo'),
        ('housekeeping', 'Housekeeping', '🧹', 'sky'),
        ('engineering', 'Engineering', '🔧', 'orange'),
        ('finance', 'Finance', '💰', 'emerald'),
        ('hr', 'Human Resources', '👥', 'violet'),
        ('inventory', 'Inventory', '📦', 'blue'),
        ('procurement', 'Procurement', '🛒', 'teal'),
        ('sales', 'Sales & Marketing', '📈', 'rose'),
        ('operations', 'Operations', '🔄', 'slate')
      ) AS d(id, label, icon, color)
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.get_module_registry() TO authenticated;

-- ============================================================
-- 10. Add config version trigger for modules table
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_modules' AND event_object_table = 'modules') THEN
    CREATE TRIGGER config_version_modules AFTER UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_permission_categories' AND event_object_table = 'permission_categories') THEN
    CREATE TRIGGER config_version_permission_categories AFTER UPDATE ON public.permission_categories FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
END $$;

-- END: 187_dynamic_modules_permissions.sql
