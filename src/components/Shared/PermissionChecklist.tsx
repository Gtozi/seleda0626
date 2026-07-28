/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */
import { useState, useEffect, useCallback } from 'react';

// ── Types for dynamic module registry ─────────────────────────

export interface ModuleDefinition {
  id: string;
  department: string;
  label: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface PermissionCategoryDefinition {
  id: string;
  label: string;
  icon: string;
  actions: string[];
  sort_order: number;
}

export interface DepartmentPermissionMapping {
  department: string;
  category_id: string;
  sort_order: number;
}

export interface DepartmentMeta {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ModuleRegistry {
  modules: ModuleDefinition[];
  permissionCategories: PermissionCategoryDefinition[];
  departmentPermissionCategories: DepartmentPermissionMapping[];
  departments: DepartmentMeta[];
}

// ── Static fallbacks (used when DB is unavailable or loading) ──

// Permission categories and actions
export const PERMISSION_CATEGORIES = [
  { id: 'users', label: 'User Management', icon: '👥', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'roles', label: 'Role Management', icon: '🔐', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'bookings', label: 'Bookings', icon: '📅', actions: ['read', 'create', 'update', 'delete', 'check_in', 'check_out'] },
  { id: 'rooms', label: 'Rooms', icon: '🛏️', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'guests', label: 'Guests', icon: '👤', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  { id: 'billing', label: 'Billing & Payments', icon: '💳', actions: ['read', 'create', 'update', 'refund'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'settings', label: 'System Settings', icon: '⚙️', actions: ['read', 'update'] },
  { id: 'audit', label: 'Audit Logs', icon: '📋', actions: ['read'] },
  { id: 'pos_sales', label: 'POS Sales', icon: '🛒', actions: ['read', 'create', 'update', 'delete', 'refund'] },
  { id: 'pos_inventory', label: 'POS Inventory', icon: '📦', actions: ['read', 'create', 'update', 'delete', 'adjust'] },
  { id: 'pos_reports', label: 'POS Reports', icon: '📊', actions: ['read', 'export', 'view_shifts'] },
  { id: 'pos_settings', label: 'POS Settings', icon: '⚙️', actions: ['read', 'update', 'manage_outlets'] },
];

// Department-specific permission categories
export const DEPARTMENT_PERMISSION_CATEGORIES: Record<string, typeof PERMISSION_CATEGORIES> = {
  fnb: [
    { id: 'pos_sales', label: 'POS Sales', icon: '🛒', actions: ['read', 'create', 'update', 'delete', 'refund', 'void'] },
    { id: 'pos_kitchen', label: 'Kitchen Display', icon: '👨‍🍳', actions: ['read', 'update', 'complete_orders'] },
    { id: 'pos_inventory', label: 'POS Inventory', icon: '📦', actions: ['read', 'create', 'update', 'adjust'] },
    { id: 'pos_cash_management', label: 'Cash Management', icon: '💵', actions: ['read', 'create', 'cash_in', 'cash_out', 'declare_float'] },
    { id: 'pos_reports', label: 'POS Reports', icon: '📊', actions: ['read', 'export', 'view_shifts'] },
    { id: 'pos_settings', label: 'POS Settings', icon: '⚙️', actions: ['read', 'update', 'manage_outlets', 'manage_menus'] },
    { id: 'inventory', label: 'Inventory', icon: '📦', actions: ['read', 'create', 'update'] },
    { id: 'billing', label: 'Billing', icon: '💳', actions: ['read', 'create', 'update'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  ],
  frontoffice: [
    { id: 'bookings', label: 'Bookings', icon: '📅', actions: ['read', 'create', 'update', 'delete', 'check_in', 'check_out'] },
    { id: 'guests', label: 'Guests', icon: '👤', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'rooms', label: 'Rooms', icon: '🛏️', actions: ['read', 'update'] },
    { id: 'billing', label: 'Billing', icon: '💳', actions: ['read', 'create', 'update'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  ],
  housekeeping: [
    { id: 'rooms', label: 'Rooms', icon: '🛏️', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'housekeeping', label: 'Housekeeping', icon: '🧹', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read'] },
  ],
  engineering: [
    { id: 'rooms', label: 'Rooms', icon: '🛏️', actions: ['read', 'update'] },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read'] },
  ],
  finance: [
    { id: 'billing', label: 'Billing & Payments', icon: '💳', actions: ['read', 'create', 'update', 'refund'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', actions: ['read', 'update'] },
  ],
  hr: [
    { id: 'users', label: 'User Management', icon: '👥', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  ],
  inventory: [
    { id: 'inventory', label: 'Inventory', icon: '📦', actions: ['read', 'create', 'update', 'delete'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  ],
  procurement: [
    { id: 'inventory', label: 'Inventory', icon: '📦', actions: ['read', 'create', 'update'] },
    { id: 'reports', label: 'Reports', icon: '📊', actions: ['read', 'export'] },
  ],
};

// Module access level: read = view only, edit = create/update/delete
export type ModuleAccessLevel = { read: boolean; edit: boolean };

// Department-specific module access lists — mirrors actual app navigation
export const DEPARTMENT_MODULE_ACCESS: Record<string, Array<{ id: string; label: string; icon: string; description: string }>> = {
  fnb: [
    { id: 'fb_dashboard', label: 'Dashboard', icon: '📊', description: 'F&B overview dashboard' },
    { id: 'fb_stores', label: 'Stores', icon: '🏪', description: 'Consolidated F&B store management' },
    { id: 'fb_meals', label: 'In-House Meals', icon: '🍽️', description: 'In-house meal orders' },
    { id: 'fb_kds', label: 'Kitchen/KDS', icon: '👨‍🍳', description: 'Kitchen Display System' },
    { id: 'fb_menu', label: 'Menu Management', icon: '📋', description: 'Menu items and categories' },
    { id: 'fb_banquets', label: 'Banquets', icon: '🎉', description: 'Banquet events management' },
    { id: 'fb_recipes', label: 'Recipes', icon: '📖', description: 'Recipe management' },
    { id: 'fb_beo', label: 'BEO Builder', icon: '📝', description: 'Banquet Event Order builder' },
    { id: 'fb_waste', label: 'Waste Track', icon: '🗑️', description: 'Food waste tracking' },
    { id: 'fb_suppliers', label: 'Suppliers', icon: '🏭', description: 'F&B supplier management' },
    { id: 'fb_purchase_orders', label: 'Purchase Orders', icon: '🛒', description: 'F&B purchase orders' },
    { id: 'fb_staff', label: 'Staff', icon: '👥', description: 'F&B staff management' },
    { id: 'fb_analytics', label: 'Analytics', icon: '📉', description: 'F&B performance analytics' },
    { id: 'fb_reports', label: 'Reports', icon: '📈', description: 'F&B reports' },
    { id: 'fb_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard F&B reports' },
  ],
  frontoffice: [
    { id: 'fo_dashboard', label: 'Dashboard', icon: '📊', description: 'Front Office dashboard' },
    { id: 'fo_reservations', label: 'Reservations', icon: '📅', description: 'Room reservations management' },
    { id: 'fo_folio', label: 'Folio', icon: '💰', description: 'Guest folio and billing' },
    { id: 'fo_crm', label: 'CRM Board', icon: '👤', description: 'Guest CRM management' },
    { id: 'fo_reports', label: 'Reports', icon: '📈', description: 'Front Office reports' },
    { id: 'fo_inventory', label: 'Inventory', icon: '📦', description: 'Front Office inventory' },
    { id: 'fo_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Front Office reports' },
  ],
  housekeeping: [
    { id: 'hk_dashboard', label: 'Dashboard', icon: '📊', description: 'Housekeeping dashboard' },
    { id: 'hk_rooms', label: 'Rooms', icon: '🛏️', description: 'Room status management' },
    { id: 'hk_tasks', label: 'Tasks', icon: '🧹', description: 'Housekeeping tasks' },
    { id: 'hk_laundry', label: 'Laundry', icon: '👔', description: 'Laundry management' },
    { id: 'hk_inventory', label: 'Inventory', icon: '📦', description: 'Housekeeping inventory' },
    { id: 'hk_amenities', label: 'Amenities', icon: '🧴', description: 'Amenities management' },
    { id: 'hk_lostfound', label: 'Lost & Found', icon: '🔍', description: 'Lost and found items' },
    { id: 'hk_staff', label: 'Staff', icon: '👥', description: 'Housekeeping staff' },
    { id: 'hk_reports', label: 'Reports', icon: '📈', description: 'Housekeeping reports' },
    { id: 'hk_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Housekeeping reports' },
  ],
  maintenance: [
    { id: 'eng_dashboard', label: 'Dashboard', icon: '📊', description: 'Engineering dashboard' },
    { id: 'eng_workorders', label: 'Work Orders', icon: '🔧', description: 'Maintenance work orders' },
    { id: 'eng_pm', label: 'Preventive', icon: '📅', description: 'Preventive maintenance' },
    { id: 'eng_assets', label: 'Assets', icon: '🏷️', description: 'Asset management' },
    { id: 'eng_rooms', label: 'Rooms', icon: '🛏️', description: 'Room maintenance' },
    { id: 'eng_utilities', label: 'Utilities', icon: '💡', description: 'Utilities management' },
    { id: 'eng_inventory', label: 'Inventory', icon: '📦', description: 'Engineering inventory' },
    { id: 'eng_staff', label: 'Staff', icon: '👥', description: 'Engineering staff' },
    { id: 'eng_compliance', label: 'Compliance', icon: '✅', description: 'Compliance tracking' },
    { id: 'eng_reports', label: 'Reports', icon: '📈', description: 'Engineering reports' },
    { id: 'eng_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Engineering reports' },
  ],
  inventory: [
    { id: 'inv_dashboard', label: 'Dashboard', icon: '📊', description: 'Inventory dashboard' },
    { id: 'inv_items', label: 'Items', icon: '📦', description: 'Inventory items management' },
    { id: 'inv_stores', label: 'Stores', icon: '🏪', description: 'Inventory stores management' },
    { id: 'inv_requisitions', label: 'Requisitions', icon: '📋', description: 'Inventory requisitions' },
    { id: 'inv_receiving', label: 'Receiving', icon: '📥', description: 'Goods receiving' },
    { id: 'inv_count', label: 'Stock Count', icon: '🔢', description: 'Stock counting' },
    { id: 'inv_suppliers', label: 'Suppliers', icon: '🏭', description: 'Supplier management' },
    { id: 'inv_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Inventory reports' },
    { id: 'inv_reports', label: 'Reports', icon: '📈', description: 'Inventory reports' },
  ],
  finance: [
    { id: 'fin_dashboard', label: 'Dashboard', icon: '📊', description: 'Finance dashboard' },
    { id: 'fin_gl', label: 'General Ledger', icon: '📚', description: 'General ledger management' },
    { id: 'fin_sales', label: 'Sales', icon: '💰', description: 'Sales records' },
    { id: 'fin_ap', label: 'Accounts Payable', icon: '📤', description: 'Accounts payable' },
    { id: 'fin_ar', label: 'Accounts Receivable', icon: '📥', description: 'Accounts receivable' },
    { id: 'fin_bank_recon', label: 'Bank Reconciliation', icon: '🏦', description: 'Bank reconciliation' },
    { id: 'fin_reports', label: 'Reports', icon: '📈', description: 'Financial reports' },
    { id: 'fin_trial_balance', label: 'Trial Balance', icon: '⚖️', description: 'Trial balance' },
    { id: 'fin_statements', label: 'Financial Statements', icon: '📄', description: 'Financial statements' },
    { id: 'fin_budget', label: 'Budget', icon: '🎯', description: 'Budget management' },
    { id: 'fin_tax', label: 'Tax Compliance', icon: '🧾', description: 'Tax compliance' },
    { id: 'fin_erca_vat', label: 'ERCA VAT', icon: '🏛️', description: 'ERCA VAT management' },
    { id: 'fin_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Finance reports' },
    { id: 'fin_period_close', label: 'Period Close', icon: '🔒', description: 'Period closing' },
    { id: 'fin_assets', label: 'Fixed Assets', icon: '🏢', description: 'Fixed asset management' },
  ],
  hr: [
    { id: 'hr_dashboard', label: 'Dashboard', icon: '📊', description: 'HR dashboard' },
    { id: 'hr_employees', label: 'Employees', icon: '👥', description: 'Employee management' },
    { id: 'hr_attendance', label: 'Attendance', icon: '⏰', description: 'Attendance tracking' },
    { id: 'hr_payroll', label: 'Payroll', icon: '💰', description: 'Payroll management' },
    { id: 'hr_leave', label: 'Leave', icon: '🏖️', description: 'Leave management' },
    { id: 'hr_performance', label: 'Performance', icon: '🎯', description: 'Performance reviews' },
    { id: 'hr_training', label: 'Training', icon: '🎓', description: 'Training management' },
    { id: 'hr_recruitment', label: 'Recruitment', icon: '📝', description: 'Recruitment management' },
    { id: 'hr_reports', label: 'Reports', icon: '📈', description: 'HR reports' },
    { id: 'hr_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard HR reports' },
  ],
  procurement: [
    { id: 'proc_dashboard', label: 'Dashboard', icon: '📊', description: 'Procurement dashboard' },
    { id: 'proc_requisitions', label: 'Requisitions', icon: '📋', description: 'Procurement requisitions' },
    { id: 'proc_orders', label: 'Purchase Orders', icon: '🛒', description: 'Purchase order management' },
    { id: 'proc_suppliers', label: 'Suppliers', icon: '🏭', description: 'Supplier management' },
    { id: 'proc_rfq', label: 'RFQ', icon: '📝', description: 'Request for quotation' },
    { id: 'proc_receiving', label: 'Receiving', icon: '📥', description: 'Goods receiving' },
    { id: 'proc_contracts', label: 'Contracts', icon: '📜', description: 'Contract management' },
    { id: 'proc_budget', label: 'Budget', icon: '🎯', description: 'Budget management' },
    { id: 'proc_invoices', label: 'Invoices', icon: '🧾', description: 'Invoice management' },
    { id: 'proc_approvals', label: 'Approvals', icon: '✅', description: 'Approval workflow' },
    { id: 'proc_reports', label: 'Reports', icon: '📈', description: 'Procurement reports' },
    { id: 'proc_standard_reports', label: 'Standard Reports', icon: '📄', description: 'Standard Procurement reports' },
  ],
};

export const GENERIC_MODULE_ACCESS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Main dashboard' },
  { id: 'reports', label: 'Reports', icon: '📈', description: 'General reports' },
  { id: 'settings', label: 'Settings', icon: '⚙️', description: 'System settings' },
  { id: 'users', label: 'Users', icon: '👥', description: 'User management' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alerts and notifications' },
];

// Legacy module access list for backward compatibility
export const MODULE_ACCESS_LIST = [
  { id: 'frontoffice', label: 'Front Office', icon: '🏨' },
  { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
  { id: 'fnb', label: 'Food & Beverage', icon: '🍽️' },
  { id: 'engineering', label: 'Engineering', icon: '🔧' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'hr', label: 'Human Resources', icon: '👥' },
  { id: 'executive', label: 'Executive', icon: '👔' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
  { id: 'procurement', label: 'Procurement', icon: '🛒' },
  { id: 'sales', label: 'Sales & Marketing', icon: '📈' },
  { id: 'operations', label: 'Operations', icon: '🔄' },
  { id: 'pos', label: 'POS', icon: '🛒' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'analytics', label: 'Analytics', icon: '📉' },
  { id: 'bookings', label: 'Bookings', icon: '📅' },
  { id: 'guests', label: 'Guests', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// Department metadata for UI grouping
export const DEPARTMENTS = [
  { id: 'executive', label: 'Executive', icon: '👑', color: 'gold' },
  { id: 'fnb', label: 'Food & Beverage', icon: '🍽️', color: 'amber' },
  { id: 'frontoffice', label: 'Front Office', icon: '🏨', color: 'indigo' },
  { id: 'housekeeping', label: 'Housekeeping', icon: '🧹', color: 'sky' },
  { id: 'engineering', label: 'Engineering', icon: '🔧', color: 'orange' },
  { id: 'finance', label: 'Finance', icon: '💰', color: 'emerald' },
  { id: 'hr', label: 'Human Resources', icon: '👥', color: 'violet' },
  { id: 'inventory', label: 'Inventory', icon: '📦', color: 'blue' },
  { id: 'procurement', label: 'Procurement', icon: '🛒', color: 'teal' },
  { id: 'sales', label: 'Sales & Marketing', icon: '📈', color: 'rose' },
  { id: 'operations', label: 'Operations', icon: '🔄', color: 'slate' },
];

// POS-specific permission categories
export const POS_PERMISSION_CATEGORIES = [
  { id: 'pos_sales', label: 'POS Sales', icon: '🛒', actions: ['read', 'create', 'update', 'delete', 'refund', 'void'] },
  { id: 'pos_inventory', label: 'POS Inventory', icon: '📦', actions: ['read', 'create', 'update', 'delete', 'adjust', 'transfer'] },
  { id: 'pos_reports', label: 'POS Reports', icon: '📊', actions: ['read', 'export', 'view_shifts', 'view_sales'] },
  { id: 'pos_settings', label: 'POS Settings', icon: '⚙️', actions: ['read', 'update', 'manage_outlets', 'manage_menus'] },
  { id: 'pos_kitchen', label: 'Kitchen Display', icon: '👨‍🍳', actions: ['read', 'update', 'complete_orders'] },
  { id: 'pos_cash_management', label: 'Cash Management', icon: '💵', actions: ['read', 'create', 'update', 'cash_in', 'cash_out', 'declare_float'] },
];

interface PermissionCheckboxProps {
  category: string;
  action: string;
  checked: boolean;
  onChange: (category: string, action: string, checked: boolean) => void;
}

export const ACTION_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  check_in: 'Check In',
  check_out: 'Check Out',
  export: 'Export',
  refund: 'Refund',
  void: 'Void',
  adjust: 'Adjust',
  transfer: 'Transfer',
  view_shifts: 'View Shifts',
  view_sales: 'View Sales',
  manage_outlets: 'Manage Outlets',
  manage_menus: 'Manage Menus',
  complete_orders: 'Complete Orders',
  cash_in: 'Cash In',
  cash_out: 'Cash Out',
  declare_float: 'Declare Float',
};

export function formatActionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatPermissionCode(code: string): { category: string; action: string; label: string } {
  const parts = code.split(':');
  if (parts.length >= 2) {
    const category = parts[0];
    const action = parts.slice(1).join(':');
    return { category, action, label: `${formatActionLabel(action)}` };
  }
  return { category: code, action: '', label: code };
}

export function PermissionCheckbox({ category, action, checked, onChange }: PermissionCheckboxProps) {
  const actionLabels = ACTION_LABELS;

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(category, action, e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition">
        {actionLabels[action] || action}
      </span>
    </label>
  );
}

interface PermissionChecklistProps {
  permissions: Record<string, string[]>;
  onChange: (category: string, action: string, checked: boolean) => void;
  categories?: typeof PERMISSION_CATEGORIES;
  maxHeight?: string;
  registry?: ModuleRegistry | null;
}

export function PermissionChecklist({
  permissions,
  onChange,
  categories,
  maxHeight = 'max-h-64',
  registry = null,
}: PermissionChecklistProps) {
  const effectiveCategories = categories || getDynamicPermissionCategories(registry);
  return (
    <div className={`${maxHeight} overflow-y-auto pr-2 space-y-3`}>
      {effectiveCategories.map((category) => (
        <div key={category.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{category.icon}</span>
            <span className="text-xs font-bold text-slate-700">{category.label}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {category.actions.map((action) => (
              <PermissionCheckbox
                key={action}
                category={category.id}
                action={action}
                checked={permissions[category.id]?.includes(action) || false}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PermissionChecklist;

// ── Dynamic Module Registry Hook ─────────────────────────────────

let _cachedRegistry: ModuleRegistry | null = null;
let _fetchPromise: Promise<ModuleRegistry | null> | null = null;

export function useModuleRegistry(): {
  registry: ModuleRegistry | null;
  loading: boolean;
  refetch: () => void;
} {
  const [registry, setRegistry] = useState<ModuleRegistry | null>(_cachedRegistry);
  const [loading, setLoading] = useState(!_cachedRegistry);

  const fetchRegistry = useCallback(async () => {
    if (_fetchPromise) return _fetchPromise;
    _fetchPromise = (async () => {
      try {
        const res = await fetch('/api/admin/module-registry');
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.modules) {
          _cachedRegistry = data as ModuleRegistry;
          return data as ModuleRegistry;
        }
        return null;
      } catch {
        return null;
      } finally {
        _fetchPromise = null;
      }
    })();
    return _fetchPromise;
  }, []);

  useEffect(() => {
    if (_cachedRegistry) {
      setRegistry(_cachedRegistry);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchRegistry().then((data) => {
      if (mounted && data) {
        setRegistry(data);
      }
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchRegistry]);

  const refetch = useCallback(() => {
    _cachedRegistry = null;
    _fetchPromise = null;
    setLoading(true);
    fetchRegistry().then((data) => {
      if (data) setRegistry(data);
      setLoading(false);
    });
  }, [fetchRegistry]);

  return { registry, loading, refetch };
}

// Build dynamic PERMISSION_CATEGORIES from registry (falls back to static)
export function getDynamicPermissionCategories(registry: ModuleRegistry | null): typeof PERMISSION_CATEGORIES {
  if (!registry?.permissionCategories?.length) return PERMISSION_CATEGORIES;
  return registry.permissionCategories.map((pc) => ({
    id: pc.id,
    label: pc.label,
    icon: pc.icon,
    actions: pc.actions,
  }));
}

// Build dynamic DEPARTMENT_MODULE_ACCESS from registry (falls back to static)
export function getDynamicDepartmentModuleAccess(
  registry: ModuleRegistry | null
): typeof DEPARTMENT_MODULE_ACCESS {
  if (!registry?.modules?.length) return DEPARTMENT_MODULE_ACCESS;
  const result: Record<string, Array<{ id: string; label: string; icon: string; description: string }>> = {};
  for (const mod of registry.modules) {
    if (!mod.is_active) continue;
    if (!result[mod.department]) result[mod.department] = [];
    result[mod.department].push({
      id: mod.id,
      label: mod.label,
      icon: mod.icon,
      description: mod.description,
    });
  }
  // Merge with static for any departments not in DB
  for (const [dept, mods] of Object.entries(DEPARTMENT_MODULE_ACCESS)) {
    if (!result[dept]) result[dept] = mods;
  }
  return result;
}

// Build dynamic DEPARTMENT_PERMISSION_CATEGORIES from registry (falls back to static)
export function getDynamicDepartmentPermissionCategories(
  registry: ModuleRegistry | null
): typeof DEPARTMENT_PERMISSION_CATEGORIES {
  if (!registry?.departmentPermissionCategories?.length || !registry?.permissionCategories?.length) {
    return DEPARTMENT_PERMISSION_CATEGORIES;
  }
  const catMap = new Map(registry.permissionCategories.map((pc) => [pc.id, pc]));
  const result: Record<string, typeof PERMISSION_CATEGORIES> = {};
  for (const mapping of registry.departmentPermissionCategories) {
    const cat = catMap.get(mapping.category_id);
    if (!cat) continue;
    if (!result[mapping.department]) result[mapping.department] = [];
    result[mapping.department].push({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      actions: cat.actions,
    });
  }
  // Merge with static for any departments not in DB
  for (const [dept, cats] of Object.entries(DEPARTMENT_PERMISSION_CATEGORIES)) {
    if (!result[dept]) result[dept] = cats;
  }
  return result;
}

// Build dynamic DEPARTMENTS from registry (falls back to static)
export function getDynamicDepartments(registry: ModuleRegistry | null): typeof DEPARTMENTS {
  if (!registry?.departments?.length) return DEPARTMENTS;
  return registry.departments.map((d) => ({
    id: d.id,
    label: d.label,
    icon: d.icon,
    color: d.color,
  }));
}

// Filter a list of permission objects (from /api/admin/permissions) to only those
// whose `module` field matches a permission category relevant to the given department.
// Falls back to all permissions if department is empty or no mapping is found.
export function filterPermissionsByDepartment(
  allPermissions: Array<{ id: string; code: string; module: string; description?: string }>,
  department: string | undefined | null,
  registry: ModuleRegistry | null
): Array<{ id: string; code: string; module: string; description?: string }> {
  if (!department) return allPermissions;
  const deptCategories = getDynamicDepartmentPermissionCategories(registry);
  const categoryIds = deptCategories[department];
  if (!categoryIds || categoryIds.length === 0) return allPermissions;
  const validIds = new Set(categoryIds.map(c => c.id));
  return allPermissions.filter(p => validIds.has(p.module));
}

// Build a human-readable label for a permission module name
export function getModuleLabel(moduleName: string, registry: ModuleRegistry | null): string {
  const cats = getDynamicPermissionCategories(registry);
  const cat = cats.find(c => c.id === moduleName);
  return cat ? cat.label : moduleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Module Access Selector ────────────────────────────────────────────

interface ModuleAccessSelectorProps {
  moduleAccess: Record<string, ModuleAccessLevel | boolean>;
  onChange: (moduleId: string, key: 'read' | 'edit', value: boolean) => void;
  department?: string;
  registry?: ModuleRegistry | null;
}

// Note: fine-grained action permissions are configured exclusively via the
// RBAC "permissions" checklist (role_permissions table, see PermissionChecklist
// component + rbacPermissionCodes). This selector only controls module/tab
// visibility (read/edit) and intentionally does not duplicate action-level
// permission editing to avoid two divergent sources of truth.
export function ModuleAccessSelector({
  moduleAccess,
  onChange,
  department,
  registry = null,
}: ModuleAccessSelectorProps) {
  const dynamicModuleAccess = getDynamicDepartmentModuleAccess(registry);
  const moduleList =
    department && dynamicModuleAccess[department]
      ? dynamicModuleAccess[department]
      : GENERIC_MODULE_ACCESS;

  const getAccess = (id: string): ModuleAccessLevel => {
    const v = moduleAccess[id];
    if (typeof v === 'boolean') return { read: v, edit: false };
    if (v && typeof v === 'object') return { read: !!v.read, edit: !!v.edit };
    return { read: false, edit: false };
  };

  const enabledCount = moduleList.filter(
    (m) => getAccess(m.id).read || getAccess(m.id).edit
  ).length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {moduleList.map((mod) => {
          const access = getAccess(mod.id);
          const hasAny = access.read || access.edit;

          return (
            <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div
                className={`flex items-center gap-2 px-3 py-2.5 transition-all ${
                  hasAny
                    ? 'bg-indigo-50/50 border-transparent'
                    : 'bg-slate-50 border-transparent'
                }`}
              >
                <span className="text-sm shrink-0">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold ${hasAny ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {mod.label}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">{mod.description}</div>
                </div>
                <div className="flex gap-1 shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => onChange(mod.id, 'read', !access.read)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                      access.read
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(mod.id, 'edit', !access.edit)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                      access.edit
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400">
        {enabledCount} of {moduleList.length} modules enabled. Fine-grained action permissions are set below under "RBAC Permissions".
      </p>
    </div>
  );
}
