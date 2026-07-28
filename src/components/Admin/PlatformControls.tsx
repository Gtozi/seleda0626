/**
 * Platform Controls
 * Web-app-wide governance: maintenance mode, public-facing surfaces, and
 * department module enablement. All toggles persist to global settings
 * (Supabase-backed via updateGlobalHotelSettings) and are enforced in App.tsx.
 */

import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Globe,
  Smartphone,
  LayoutGrid,
  Power,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const DEPARTMENT_MODULES: { key: string; label: string }[] = [
  { key: 'frontoffice', label: 'Front Office' },
  { key: 'housekeeping', label: 'Housekeeping' },
  { key: 'f&b', label: 'Food & Beverage' },
  { key: 'maintenance', label: 'Maintenance & Engineering' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'finance', label: 'Finance & Accounting' },
  { key: 'hr', label: 'Human Resources' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'operations', label: 'Operations Manager' },
  { key: 'executive', label: 'Executive' },
];

const DEPARTMENT_SUBMODULES: Record<string, { key: string; label: string }[]> = {
  frontoffice: [
    { key: 'frontoffice_dashboard', label: 'Dashboard' },
    { key: 'frontoffice_reservations', label: 'Reservations' },
    { key: 'frontoffice_folio', label: 'Folio Management' },
    { key: 'frontoffice_crm', label: 'Guest CRM' },
    { key: 'frontoffice_reports', label: 'Reports & Audit' },
    { key: 'frontoffice_giftshop', label: 'Gift Shop POS' },
    { key: 'frontoffice_inventory', label: 'Office Inventory' },
  ],
  housekeeping: [
    { key: 'housekeeping_dashboard', label: 'Dashboard' },
    { key: 'housekeeping_rooms', label: 'Room Board' },
    { key: 'housekeeping_tasks', label: 'Task Management' },
    { key: 'housekeeping_laundry', label: 'Laundry' },
    { key: 'housekeeping_inventory', label: 'Inventory' },
    { key: 'housekeeping_amenities', label: 'Guest Amenities' },
    { key: 'housekeeping_lostfound', label: 'Lost & Found' },
    { key: 'housekeeping_staff', label: 'Staff Management' },
    { key: 'housekeeping_reports', label: 'Reports' },
  ],
  'f&b': [
    { key: 'fb_dashboard', label: 'Dashboard' },
    { key: 'fb_pos', label: 'Restaurant POS' },
    { key: 'fb_bar', label: 'Bar POS' },
    { key: 'fb_roomservice', label: 'Room Service' },
    { key: 'fb_banquet', label: 'Banquet & Events' },
    { key: 'fb_kitchen', label: 'Kitchen Display' },
    { key: 'fb_guestmeals', label: 'Guest Meals' },
    { key: 'fb_menu', label: 'Menu Management' },
    { key: 'fb_inventory', label: 'F&B Inventory' },
    { key: 'fb_reports', label: 'Reports' },
  ],
  maintenance: [
    { key: 'maintenance_dashboard', label: 'Dashboard' },
    { key: 'maintenance_requests', label: 'Work Orders' },
    { key: 'maintenance_preventive', label: 'Preventive Maintenance' },
    { key: 'maintenance_inventory', label: 'Parts Inventory' },
    { key: 'maintenance_staff', label: 'Technician Management' },
    { key: 'maintenance_reports', label: 'Reports' },
  ],
  inventory: [
    { key: 'inventory_dashboard', label: 'Dashboard' },
    { key: 'inventory_items', label: 'Item Management' },
    { key: 'inventory_stock', label: 'Stock Control' },
    { key: 'inventory_orders', label: 'Purchase Orders' },
    { key: 'inventory_suppliers', label: 'Supplier Management' },
    { key: 'inventory_reports', label: 'Reports' },
  ],
  finance: [
    { key: 'finance_gl', label: 'General Ledger' },
    { key: 'finance_ar', label: 'Accounts Receivable' },
    { key: 'finance_ap', label: 'Accounts Payable' },
    { key: 'finance_bank', label: 'Bank Reconciliation' },
    { key: 'finance_reports', label: 'Financial Reports' },
    { key: 'finance_budget', label: 'Budget Analysis' },
    { key: 'finance_tax', label: 'Tax Compliance' },
    { key: 'finance_period', label: 'Period Close' },
    { key: 'finance_assets', label: 'Fixed Assets' },
    { key: 'finance_sales', label: 'Sales Registry' },
  ],
  hr: [
    { key: 'hr_dashboard', label: 'Dashboard' },
    { key: 'hr_employees', label: 'Employee Records' },
    { key: 'hr_attendance', label: 'Attendance & Time' },
    { key: 'hr_payroll', label: 'Payroll' },
    { key: 'hr_training', label: 'Training & Development' },
    { key: 'hr_reports', label: 'Reports' },
  ],
  procurement: [
    { key: 'procurement_dashboard', label: 'Dashboard' },
    { key: 'procurement_requests', label: 'Purchase Requests' },
    { key: 'procurement_orders', label: 'Purchase Orders' },
    { key: 'procurement_vendors', label: 'Vendor Management' },
    { key: 'procurement_contracts', label: 'Contract Management' },
    { key: 'procurement_reports', label: 'Reports' },
  ],
  operations: [
    { key: 'operations_briefing', label: 'Daily Briefing' },
    { key: 'operations_actions', label: 'Action Queue' },
    { key: 'operations_escalations', label: 'Escalations' },
    { key: 'operations_staffing', label: 'Staffing' },
    { key: 'operations_handoffs', label: 'Interdepartmental Handoffs' },
    { key: 'operations_handover', label: 'Shift Handover' },
    { key: 'operations_notes', label: 'Manager Notes' },
  ],
  executive: [
    { key: 'executive_dashboard', label: 'Executive Dashboard' },
    { key: 'executive_operations', label: 'Operations' },
    { key: 'executive_finance', label: 'Financial' },
    { key: 'executive_business', label: 'Business Admin' },
    { key: 'executive_property', label: 'Property Config' },
    { key: 'executive_pricing', label: 'Pricing & Revenue' },
    { key: 'executive_analytics', label: 'Analytics' },
    { key: 'executive_risk', label: 'Strategic' },
    { key: 'executive_governance', label: 'Governance' },
  ],
};

const ADMIN_MODULE_TOGGLES: { key: string; label: string }[] = [
  { key: 'admin_user_security', label: 'Identity & Access' },
  { key: 'admin_property_structure', label: 'Property Structure' },
  { key: 'admin_reference_data', label: 'Reference Data' },
  { key: 'admin_platform_controls', label: 'Platform' },
  { key: 'admin_system_integration', label: 'Integration & Channels' },
  { key: 'admin_global_settings', label: 'Global Settings' },
  { key: 'admin_system_health', label: 'System Health' },
  { key: 'admin_audit_center', label: 'Audit Logs' },
  { key: 'admin_data_backups', label: 'Data & Backups' },
  { key: 'admin_pos_setup', label: 'POS Setup' },
  { key: 'admin_property_config', label: 'Property & Config (Exec)' },
  { key: 'admin_financial_revenue', label: 'Financial Controls (Exec)' },
  { key: 'admin_operational_policies', label: 'Operational Policies (Exec)' },
  { key: 'admin_loyalty_program', label: 'Loyalty Program (Exec)' },
  { key: 'admin_revenue_mapping', label: 'Revenue Mapping (Exec)' },
  { key: 'admin_change_control', label: 'Audit/Governance (Exec)' },
];

interface ToggleRowProps {
  key?: React.Key;
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  danger?: boolean;
}

function ToggleRow({ label, description, enabled, onChange, danger }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? (danger ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function PlatformControls() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();

  const initial = useMemo(
    () => ({
      maintenanceMode: globalHotelSettings.maintenanceMode ?? false,
      maintenanceMessage:
        globalHotelSettings.maintenanceMessage ??
        'The system is undergoing scheduled maintenance. Some features may be temporarily unavailable.',
      publicBookingEnabled: globalHotelSettings.publicBookingEnabled ?? true,
      sessionTimeout: globalHotelSettings.sessionTimeout ?? 30,
      moduleToggles: { ...(globalHotelSettings.moduleToggles || {}) } as Record<string, boolean>,
    }),
    [globalHotelSettings]
  );

  const [form, setForm] = useState(initial);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const moduleEnabled = (key: string) => form.moduleToggles[key] !== false;
  const disabledCount = DEPARTMENT_MODULES.filter(m => !moduleEnabled(m.key)).length;
  const adminDisabledCount = ADMIN_MODULE_TOGGLES.filter(m => !moduleEnabled(m.key)).length;

  const setModule = (key: string, next: boolean) => {
    setForm(f => {
      const newToggles = { ...f.moduleToggles, [key]: next };
      
      // Auto-sync submodules when department toggle changes
      const deptKey = DEPARTMENT_MODULES.find(d => d.key === key)?.key;
      if (deptKey && DEPARTMENT_SUBMODULES[deptKey]) {
        DEPARTMENT_SUBMODULES[deptKey].forEach(sub => {
          newToggles[sub.key] = next;
        });
      }
      
      // Auto-update department toggle when submodule changes
      for (const dept of DEPARTMENT_MODULES) {
        const submodules = DEPARTMENT_SUBMODULES[dept.key] || [];
        if (submodules.some(s => s.key === key)) {
          const allEnabled = submodules.every(s => newToggles[s.key] !== false);
          const allDisabled = submodules.every(s => newToggles[s.key] === false);
          if (allEnabled) {
            newToggles[dept.key] = true;
          } else if (allDisabled) {
            newToggles[dept.key] = false;
          }
        }
      }
      
      return { ...f, moduleToggles: newToggles };
    });
  };

  const toggleDepartment = (deptKey: string) => {
    setExpandedDepartments(prev => {
      const next = new Set(prev);
      if (next.has(deptKey)) {
        next.delete(deptKey);
      } else {
        next.add(deptKey);
      }
      return next;
    });
  };

  const enableAllDepartmentModules = (deptKey: string) => {
    const submodules = DEPARTMENT_SUBMODULES[deptKey] || [];
    submodules.forEach(m => setModule(m.key, true));
    setModule(deptKey, true);
  };

  const disableAllDepartmentModules = (deptKey: string) => {
    const submodules = DEPARTMENT_SUBMODULES[deptKey] || [];
    submodules.forEach(m => setModule(m.key, false));
    setModule(deptKey, false);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    submitGlobalSettingsChange(
      'Platform Controls Update',
      `Maintenance: ${form.maintenanceMode ? 'on' : 'off'}, Public booking: ${form.publicBookingEnabled ? 'on' : 'off'}, Modules disabled: ${disabledCount + adminDisabledCount}`,
      'platform-control',
      {
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage,
        publicBookingEnabled: form.publicBookingEnabled,
        sessionTimeout: Number(form.sessionTimeout) || 30,
        moduleToggles: form.moduleToggles,
      }
    );
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Power size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-black text-slate-900 tracking-tight leading-none">Platform Controls</h1>
            <p className="text-xs text-slate-500 font-sans mt-1">Web-app-wide switches for maintenance, public surfaces, and department modules</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saveStatus === 'saving' ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveStatus === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveStatus === 'success' ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-5xl mx-auto">
        {form.maintenanceMode && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm text-rose-700 font-medium">
            <AlertTriangle size={16} /> Maintenance mode is currently <strong>active</strong>. A banner is shown to all users until saved off.
          </div>
        )}

        {/* MAINTENANCE */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-2">
            <ShieldAlert size={18} className="text-rose-500" /> Maintenance Mode
          </h2>
          <div className="divide-y divide-slate-100">
            <ToggleRow
              label="Enable maintenance mode"
              description="Displays a system-wide banner to every signed-in user. Administrators retain full access."
              enabled={form.maintenanceMode}
              onChange={v => setForm(f => ({ ...f, maintenanceMode: v }))}
              danger
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">Banner message</label>
            <textarea
              value={form.maintenanceMessage}
              onChange={e => setForm(f => ({ ...f, maintenanceMessage: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
            />
          </div>
        </section>

        {/* PUBLIC SURFACES */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-2">
            <Globe size={18} className="text-indigo-500" /> Public-Facing Surfaces
          </h2>
          <div className="divide-y divide-slate-100">
            <ToggleRow
              label="Public booking site"
              description="Controls the /booking page where guests make online reservations."
              enabled={form.publicBookingEnabled}
              onChange={v => setForm(f => ({ ...f, publicBookingEnabled: v }))}
            />
          </div>
        </section>

        {/* SESSION */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
            <Clock size={18} className="text-amber-500" /> Session Policy
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Idle session timeout</p>
              <p className="text-xs text-slate-500 mt-0.5">Minutes of inactivity before users are signed out.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={480}
                value={form.sessionTimeout}
                onChange={e => setForm(f => ({ ...f, sessionTimeout: Number(e.target.value) }))}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-right focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <span className="text-xs font-bold text-slate-400 uppercase">min</span>
            </div>
          </div>
        </section>

        {/* DEPARTMENT MODULE ENABLEMENT */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutGrid size={18} className="text-emerald-500" /> Department Modules
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {DEPARTMENT_MODULES.length - disabledCount}/{DEPARTMENT_MODULES.length} enabled
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => DEPARTMENT_MODULES.forEach(m => setModule(m.key, true))}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition"
                >
                  Enable All
                </button>
                <button
                  onClick={() => DEPARTMENT_MODULES.forEach(m => setModule(m.key, false))}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition"
                >
                  Disable All
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Disabling a module hides its portal across the web app. Users assigned to a disabled module see an unavailable notice. Click on a department to expand and manage individual submodules.</p>
          <div className="space-y-3">
            {DEPARTMENT_MODULES.map(dept => {
              const submodules = DEPARTMENT_SUBMODULES[dept.key] || [];
              const isExpanded = expandedDepartments.has(dept.key);
              const deptEnabled = moduleEnabled(dept.key);
              const enabledSubmodules = submodules.filter(m => moduleEnabled(m.key)).length;
              
              return (
                <div key={dept.key} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div
                    onClick={() => toggleDepartment(dept.key)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                      <span className="text-sm font-bold text-slate-900">{dept.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {enabledSubmodules}/{submodules.length} modules
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); enableAllDepartmentModules(dept.key); }}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-bold uppercase transition"
                        >
                          All
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); disableAllDepartmentModules(dept.key); }}
                          className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[9px] font-bold uppercase transition"
                          title="Disable all submodules"
                        >
                          None
                        </button>
                      </div>
                      <button
                        role="switch"
                        aria-checked={deptEnabled}
                        onClick={(e) => { e.stopPropagation(); setModule(dept.key, !deptEnabled); }}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                          deptEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            deptEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 py-3 bg-white border-t border-slate-200">
                      <div className="space-y-2">
                        {submodules.map(sub => (
                          <div key={sub.key} className="flex items-center justify-between py-2">
                            <span className="text-xs text-slate-700">{sub.label}</span>
                            <button
                              role="switch"
                              aria-checked={moduleEnabled(sub.key)}
                              onClick={() => setModule(sub.key, !moduleEnabled(sub.key))}
                              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                                moduleEnabled(sub.key) ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  moduleEnabled(sub.key) ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                        {submodules.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No submodules defined for this department.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ADMIN MODULE ENABLEMENT */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert size={18} className="text-indigo-500" /> Admin Portal Modules
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {ADMIN_MODULE_TOGGLES.length - adminDisabledCount}/{ADMIN_MODULE_TOGGLES.length} enabled
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => ADMIN_MODULE_TOGGLES.forEach(m => setModule(m.key, true))}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition"
                >
                  Enable All
                </button>
                <button
                  onClick={() => ADMIN_MODULE_TOGGLES.forEach(m => setModule(m.key, false))}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition"
                >
                  Disable All
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-2">Toggle individual System Administration modules on or off. Hidden modules are removed from the admin tab bar.</p>
          <div className="divide-y divide-slate-100">
            {ADMIN_MODULE_TOGGLES.map(m => (
              <ToggleRow
                key={m.key}
                label={m.label}
                enabled={moduleEnabled(m.key)}
                onChange={(v: boolean) => { setModule(m.key, v); }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
