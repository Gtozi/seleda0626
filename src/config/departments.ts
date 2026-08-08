 /**
 * Department registry — single source of truth for the 17 ERP departments.
 *
 * Phase 0 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 * This file is INTRODUCED in Phase 0 and not yet wired into App.tsx routing.
 * It will be consumed in Phase 3 when `/erp/*` becomes a nested `<Route>` tree.
 *
 * Backward-compatibility note:
 *   - `key` is the existing internal department identifier used by `activeDept`
 *     state in App.tsx and throughout the codebase. It MUST NOT change.
 *   - `urlSegment` is the URL-safe path segment used in `/erp/:urlSegment/:tab`.
 *     For most departments it equals `key`; `f&b` maps to `fb` (the `&` char is
 *     unsafe in a URL path segment).
 *   - `defaultTab` mirrors the initial value of the corresponding `*Dir` state
 *     declared in App.tsx (lines 593-608) so that `/erp/:dept` with no tab
 *     resolves to the same screen users see today.
 */

import type { ComponentType } from 'react';
import type { User } from '../types/erp';

import FrontOfficePortal from '../components/FrontOffice/FrontOfficePortal';
import HousekeepingPortal from '../components/Housekeeping/HousekeepingPortal';
import FoodBeveragePortal from '../components/FoodBeverage/FoodBeveragePortal';
import EngineeringPortal from '../components/Engineering/EngineeringPortal';
import InventoryPortal from '../components/Inventory/InventoryPortal';
import FinancePortal from '../components/Finance/FinancePortal';
import HumanResourcesPortal from '../components/HumanResources/HumanResourcesPortal';
import SecurityPortal from '../components/Security/SecurityPortal';
import TransportationPortal from '../components/Transportation/TransportationPortal';
import AdminPortal from '../components/Admin/AdminPortal';
import ProcurementPortal from '../components/Procurement/ProcurementPortal';
import SalesPortal from '../components/Sales/SalesPortal';
import HotelOperationsPortal from '../components/Operations/HotelOperationsPortal';
import ConciergePortal from '../components/Concierge/ConciergePortal';
import SpaWellnessPortal from '../components/SpaWellness/SpaWellnessPortal';
import BanquetEventsPortal from '../components/BanquetEvents/BanquetEventsPortal';
import ExecutiveBusinessIntelligencePortal from '../components/Admin/ExecutiveBusinessIntelligencePortal';
import AccountSettingsModule from '../components/Settings/AccountSettingsModule';

/** The union of department keys — mirrors the `activeDept` state type in App.tsx. */
export type DepartmentKey =
  | 'frontoffice'
  | 'housekeeping'
  | 'f&b'
  | 'maintenance'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'security'
  | 'executive'
  | 'admin'
  | 'procurement'
  | 'operations'
  | 'sales'
  | 'transportation'
  | 'concierge'
  | 'spa-wellness'
  | 'banquet-events'
  | 'settings';

/**
 * Props every portal component accepts for navigation control.
 * Portals currently use one of `activeTab` or `activeModule` as the prop name;
 * the route wrapper (Phase 3) will normalize this. For Phase 0 we only declare
 * the minimal shape used to type the registry.
 */
export interface PortalProps {
  activeTab?: string;
  activeModule?: string;
  onTabChange?: (tab: string) => void;
  onModuleChange?: (tab: string) => void;
  currentUser?: User;
}

export interface DepartmentConfig {
  key: DepartmentKey;
  /** Human-readable label shown in the header / side nav. */
  label: string;
  /** URL-safe path segment for `/erp/:urlSegment`. */
  urlSegment: string;
  /** Tab id shown when navigating to `/erp/:urlSegment` with no tab. */
  defaultTab: string;
  /**
   * The portal component rendered for this department.
   *
   * Typed as `ComponentType<any>` because the 17 portals have heterogeneous,
   * department-specific prop shapes (e.g. `activeTab: HKTab` for Housekeeping,
   * `activeModule: string` for Finance/Admin, `currentUser` for Concierge/Spa,
   * a distinct `HotelOperationsPortalProps` for Operations). A single shared
   * prop interface cannot accurately describe all of them. The concrete prop
   * wiring happens in the Phase 3 per-department route wrappers, which import
   * each portal directly and pass its actual props; this registry only needs
   * to carry the component reference.
   */
  Portal: ComponentType<any>;
  /**
   * Whether this department's tab set is static (`false`) or resolved
   * dynamically at runtime (`true`). Admin pulls from CORE_ADMIN_MODULES and
   * is filtered by module toggles; Operations/Executive share a sub-nav whose
   * modIds depend on the active department.
   */
  dynamicTabs?: boolean;
}

/**
 * The 17 departments, in the order they appear in the App.tsx `activeDept`
 * union. Order is not semantically significant but is preserved for stability.
 */
export const DEPARTMENTS: readonly DepartmentConfig[] = [
  { key: 'frontoffice', label: 'Front Office', urlSegment: 'frontoffice', defaultTab: 'dashboard', Portal: FrontOfficePortal },
  { key: 'housekeeping', label: 'Housekeeping', urlSegment: 'housekeeping', defaultTab: 'dashboard', Portal: HousekeepingPortal },
  { key: 'f&b', label: 'Food & Beverage', urlSegment: 'fb', defaultTab: 'executive-dashboard', Portal: FoodBeveragePortal },
  { key: 'maintenance', label: 'Engineering', urlSegment: 'maintenance', defaultTab: 'dashboard', Portal: EngineeringPortal },
  { key: 'inventory', label: 'Inventory', urlSegment: 'inventory', defaultTab: 'dashboard', Portal: InventoryPortal },
  { key: 'finance', label: 'Finance', urlSegment: 'finance', defaultTab: 'dashboard', Portal: FinancePortal },
  { key: 'hr', label: 'Human Resources', urlSegment: 'hr', defaultTab: 'dashboard', Portal: HumanResourcesPortal },
  { key: 'security', label: 'Security', urlSegment: 'security', defaultTab: 'dashboard', Portal: SecurityPortal },
  { key: 'executive', label: 'Executive', urlSegment: 'executive', defaultTab: 'executive-dashboard', Portal: ExecutiveBusinessIntelligencePortal },
  { key: 'admin', label: 'Admin', urlSegment: 'admin', defaultTab: 'user_security', Portal: AdminPortal, dynamicTabs: true },
  { key: 'procurement', label: 'Procurement', urlSegment: 'procurement', defaultTab: 'dashboard', Portal: ProcurementPortal },
  { key: 'operations', label: 'Operations', urlSegment: 'operations', defaultTab: 'executive-dashboard', Portal: HotelOperationsPortal, dynamicTabs: true },
  { key: 'sales', label: 'Sales', urlSegment: 'sales', defaultTab: 'dashboard', Portal: SalesPortal },
  { key: 'transportation', label: 'Transportation', urlSegment: 'transportation', defaultTab: 'dashboard', Portal: TransportationPortal },
  { key: 'concierge', label: 'Concierge', urlSegment: 'concierge', defaultTab: 'dashboard', Portal: ConciergePortal },
  { key: 'spa-wellness', label: 'Spa & Wellness', urlSegment: 'spa-wellness', defaultTab: 'dashboard', Portal: SpaWellnessPortal },
  { key: 'banquet-events', label: 'Banquet & Events', urlSegment: 'banquet-events', defaultTab: 'dashboard', Portal: BanquetEventsPortal },
  { key: 'settings', label: 'Settings', urlSegment: 'settings', defaultTab: 'account', Portal: AccountSettingsModule },
] as const;

/** Lookup by internal key (the value used by `activeDept` today). */
export const DEPARTMENT_BY_KEY: Readonly<Record<DepartmentKey, DepartmentConfig>> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.key, d]),
) as Readonly<Record<DepartmentKey, DepartmentConfig>>;

/** Lookup by URL segment (used by the Phase 3 route wrapper to resolve `:department`). */
export const DEPARTMENT_BY_SEGMENT: Readonly<Record<string, DepartmentConfig>> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.urlSegment, d]),
) as Readonly<Record<string, DepartmentConfig>>;

/** Resolve a URL segment to a department, falling back to `frontoffice`. */
export function resolveDepartmentBySegment(segment: string | undefined): DepartmentConfig {
  if (segment && DEPARTMENT_BY_SEGMENT[segment]) return DEPARTMENT_BY_SEGMENT[segment];
  return DEPARTMENT_BY_KEY.frontoffice;
}

/** Resolve an internal key to a department, falling back to `frontoffice`. */
export function resolveDepartmentByKey(key: string | undefined): DepartmentConfig {
  if (key && (DEPARTMENT_BY_KEY as Record<string, DepartmentConfig>)[key]) return (DEPARTMENT_BY_KEY as Record<string, DepartmentConfig>)[key];
  return DEPARTMENT_BY_KEY.frontoffice;
}

/** All valid URL segments — used by the Phase 3 route guard to 404 unknown depts. */
export const DEPARTMENT_SEGMENTS: readonly string[] = DEPARTMENTS.map((d) => d.urlSegment);

/**
 * Role-to-department mapping for roles that don't match department keys exactly.
 * Consolidates the duplicate maps that existed in App.tsx (handleLoginSuccess,
 * verifySession useEffect, ForcedPasswordChangeScreen onSuccess).
 */
const ROLE_TO_DEPT: Readonly<Record<string, DepartmentKey>> = {
  fin_manager: 'finance',
  finance_manager: 'finance',
  finance_controller: 'finance',
  finance_director: 'finance',
  cfo: 'finance',
  accountant: 'finance',
  auditor: 'finance',
  revenue_manager: 'finance',
  revenue: 'finance',
  fo_manager: 'frontoffice',
  front_office_manager: 'frontoffice',
  'front office manager': 'frontoffice',
  housekeeping_manager: 'housekeeping',
  hk_manager: 'housekeeping',
  fb_manager: 'f&b',
  'f&b_manager': 'f&b',
  food_beverage_manager: 'f&b',
  maintenance_manager: 'maintenance',
  eng_manager: 'maintenance',
  engineering_manager: 'maintenance',
  inventory_manager: 'inventory',
  stores_manager: 'inventory',
  hr_manager: 'hr',
  human_resources_manager: 'hr',
  security_manager: 'security',
  security_officer: 'security',
  procurement_manager: 'procurement',
  sales_manager: 'sales',
  sales_director: 'sales',
  ops_manager: 'operations',
  operations_manager: 'operations',
  concierge_manager: 'concierge',
  concierge: 'concierge',
  guest_services_manager: 'concierge',
  spa_manager: 'spa-wellness',
  spa_director: 'spa-wellness',
  wellness_manager: 'spa-wellness',
  spa: 'spa-wellness',
  banquet: 'frontoffice',
  banquet_manager: 'banquet-events',
  banquet_events_manager: 'banquet-events',
  transportation: 'operations',
  fleet_manager: 'transportation',
  transportation_manager: 'transportation',
};

/** Departments that can be directly assigned as a user's default. */
const ASSIGNABLE_DEPTS: readonly DepartmentKey[] = DEPARTMENTS.map((d) => d.key).filter((k) => k !== 'settings');

/**
 * Compute the default department for a user based on their role.
 * Mirrors the logic that was in App.tsx handleLoginSuccess / verifySession.
 */
export function getDefaultDeptForUser(user: { role: string; allowedTabs?: string[] }): DepartmentKey {
  // Direct match: role IS a department key
  if (ASSIGNABLE_DEPTS.includes(user.role as DepartmentKey)) {
    return user.role as DepartmentKey;
  }
  // Role-to-dept map
  if (ROLE_TO_DEPT[user.role]) {
    return ROLE_TO_DEPT[user.role];
  }
  // Fallback: first allowed tab that's a valid department
  if (user.allowedTabs && user.allowedTabs.length > 0) {
    const tab = user.allowedTabs.find((t) => t !== 'settings' && (ASSIGNABLE_DEPTS as readonly string[]).includes(t));
    if (tab) return tab as DepartmentKey;
  }
  return 'frontoffice';
}

/** Get the default ERP redirect path for a user: `/erp/:urlSegment`. */
export function getDefaultErpPath(user: { role: string; allowedTabs?: string[] }): string {
  const dept = getDefaultDeptForUser(user);
  return `/erp/${DEPARTMENT_BY_KEY[dept].urlSegment}`;
}
