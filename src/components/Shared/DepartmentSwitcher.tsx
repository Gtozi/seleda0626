/**
 * DepartmentSwitcher — UI to change the active ERP department.
 *
 * Phase 4 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 *
 * Renders a dropdown in the global header that lists departments the current
 * user has access to. On select, calls `navigate('/erp/:urlSegment')`.
 *
 * This fills a pre-existing UX gap: before the route-driven migration, there
 * was NO in-app UI to change departments — users were locked into the
 * department chosen at login.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building2 } from 'lucide-react';
import { DEPARTMENTS, type DepartmentConfig } from '../../config/departments';
import { getTabsForDepartment } from '../../config/departmentTabs';
import { CORE_ADMIN_MODULES } from '../Admin/adminModules';
import type { User } from '../../types/erp';

export interface DepartmentSwitcherProps {
  currentUser: User | null;
  /** Current department url segment (highlights the active option). */
  activeSegment?: string;
  /** moduleToggles map from App.tsx (keyed by department toggle key). */
  moduleToggles?: Record<string, boolean>;
  /** hasModuleAccess(modId) — the same predicate used by `subNavItems`. */
  hasModuleAccess?: (modId: string) => boolean;
}

/**
 * Compute the list of departments a user can switch to.
 * Mirrors the filtering logic from `subNavItems` in App.tsx.
 */
export function getSwitchableDepartments(
  currentUser: User | null,
  moduleToggles: Record<string, boolean>,
  hasModuleAccess: (modId: string) => boolean,
): DepartmentConfig[] {
  return DEPARTMENTS.filter((d) => {
    // Settings is not a switchable department — it's accessed via the gear icon
    if (d.key === 'settings') return false;

    // admin bypasses the module-toggle check (mirrors App.tsx isModuleDisabled)
    if (d.key !== 'admin') {
      if (moduleToggles[d.key] === false) return false;
    }

    // User must have access to at least one tab in the department
    if (!currentUser) return false;

    // For admin: check if any CORE_ADMIN_MODULE is visible
    if (d.key === 'admin') {
      const visibleAdmin = CORE_ADMIN_MODULES.filter(m => moduleToggles[m.toggleKey] !== false);
      return visibleAdmin.length > 0;
    }

    // For other departments: check if any tab's modId is accessible
    const tabs = getTabsForDepartment(d.key);
    if (tabs.length === 0) return true; // No tabs = always accessible (e.g. banquet-events)
    return tabs.some(t => !t.modId || hasModuleAccess(t.modId));
  });
}

export function DepartmentSwitcher({
  currentUser,
  activeSegment,
  moduleToggles = {},
  hasModuleAccess = () => true,
}: DepartmentSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const switchable = getSwitchableDepartments(currentUser, moduleToggles, hasModuleAccess);
  const activeDept = switchable.find(d => d.urlSegment === activeSegment);
  const activeLabel = activeDept?.label ?? 'Departments';

  const handleSelect = (dept: DepartmentConfig) => {
    navigate(`/erp/${dept.urlSegment}`);
    setOpen(false);
  };

  if (switchable.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        title="Switch department"
      >
        <Building2 size={12} className="text-indigo-500" />
        <span className="max-w-[100px] truncate">{activeLabel}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] max-h-[300px] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] py-1">
          {switchable.map((dept) => (
            <button
              key={dept.key}
              onClick={() => handleSelect(dept)}
              className={`w-full text-left px-3 py-2 text-[11px] font-sans font-medium transition-colors flex items-center gap-2 ${
                dept.urlSegment === activeSegment
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Building2 size={12} className="shrink-0 opacity-60" />
              <span className="truncate">{dept.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DepartmentSwitcher;
