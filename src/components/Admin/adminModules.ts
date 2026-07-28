/**
 * Admin Module Registry
 * Single source of truth for all System Administration modules.
 * Used by App.tsx (tab bar) and AdminPortal.tsx (content router).
 */

import React from 'react';

import UserManagementSecurity from './UserManagementSecurity';
import SystemIntegrationChannel from './SystemIntegrationChannel';
import GlobalSystemSettings from './GlobalSystemSettings';
import DataManagementBackups from './DataManagementBackups';
import PlatformControls from './PlatformControls';
import PropertyConfigurationSetup from './PropertyConfigurationSetup';
import MasterData from './MasterData';
import AuditCompliance from './AuditCompliance';
import WorkflowEngine from './WorkflowEngine';
import IntegrationsCenter from './IntegrationsCenter';
import ReportsAnalytics from './ReportsAnalytics';
import SystemHealthDashboard from './SystemHealthDashboard';
import POSOutletManagement from './POSOutletManagement';
import KDSInstanceManagement from '../FoodBeverage/KDSInstanceManagement';
import PropertyManager from './PropertyManager';
import SchedulerManager from './SchedulerManager';
import ComplianceCenter from './ComplianceCenter';
import ConfigHistory from './ConfigHistory';
import APIManagement from './APIManagement';
import PublicPageManager from './PublicPageManager';

export interface AdminModuleConfig {
  id: string;
  label: string;
  component: React.FC<any>;
  /** moduleToggle key in GlobalHotelSettings.moduleToggles (e.g. 'admin_user_security') */
  toggleKey: string;
  /** Whether this module appears in the top tab bar in App.tsx */
  isNavigable: boolean;
  /** Section grouping for consolidated admin layout */
  section?: 'security' | 'configuration' | 'users_roles' | 'audit_center' | 'operations';
}

export const ADMIN_SECTIONS = [
  { id: 'security', label: 'Security Center', order: 1 },
  { id: 'configuration', label: 'Configuration', order: 2 },
  { id: 'users_roles', label: 'User & Role Management', order: 3 },
  { id: 'audit_center', label: 'Audit Center', order: 4 },
  { id: 'operations', label: 'Operations', order: 5 },
] as const;

/** Core system admin modules — organized into 5 consolidated sections.
 *  Sections: Security Center, Configuration, User & Role Management, Audit Center, Operations.
 *  This is the single source of truth for admin navigation. */
export const CORE_ADMIN_MODULES: AdminModuleConfig[] = [
  // ── Security Center ──
  {
    id: 'user_security',
    label: 'Identity & Access',
    component: UserManagementSecurity,
    toggleKey: 'admin_user_security',
    isNavigable: true,
    section: 'security',
  },

  // ── Configuration ──
  {
    id: 'property_structure',
    label: 'Property Structure',
    component: PropertyConfigurationSetup,
    toggleKey: 'admin_property_structure',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'property_manager',
    label: 'Properties',
    component: PropertyManager,
    toggleKey: 'admin_property_manager',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'reference_data',
    label: 'Reference Data',
    component: MasterData,
    toggleKey: 'admin_reference_data',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'global_settings',
    label: 'Global Settings',
    component: GlobalSystemSettings,
    toggleKey: 'admin_global_settings',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'pos_setup',
    label: 'POS Setup',
    component: POSOutletManagement,
    toggleKey: 'admin_pos_setup',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'kds_management',
    label: 'KDS Management',
    component: KDSInstanceManagement,
    toggleKey: 'admin_kds_management',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'platform_controls',
    label: 'Platform',
    component: PlatformControls,
    toggleKey: 'admin_platform_controls',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'public_page',
    label: 'Public Page',
    component: PublicPageManager,
    toggleKey: 'admin_public_page',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'system_integration',
    label: 'Integration & Channels',
    component: SystemIntegrationChannel,
    toggleKey: 'admin_system_integration',
    isNavigable: true,
    section: 'configuration',
  },

  // ── Audit Center ──
  {
    id: 'audit_center',
    label: 'Audit Logs',
    component: AuditCompliance,
    toggleKey: 'admin_audit_center',
    isNavigable: true,
    section: 'audit_center',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    component: ComplianceCenter,
    toggleKey: 'admin_compliance',
    isNavigable: true,
    section: 'audit_center',
  },
  {
    id: 'config_history',
    label: 'Config History',
    component: ConfigHistory,
    toggleKey: 'admin_config_history',
    isNavigable: true,
    section: 'audit_center',
  },

  // ── Operations ──
  {
    id: 'system_health',
    label: 'System Health',
    component: SystemHealthDashboard,
    toggleKey: 'admin_system_health',
    isNavigable: true,
    section: 'operations',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    component: SchedulerManager,
    toggleKey: 'admin_scheduler',
    isNavigable: true,
    section: 'operations',
  },
  {
    id: 'data_backups',
    label: 'Data & Backups',
    component: DataManagementBackups,
    toggleKey: 'admin_data_backups',
    isNavigable: true,
    section: 'operations',
  },
  {
    id: 'api_management',
    label: 'API Keys',
    component: APIManagement,
    toggleKey: 'admin_api_management',
    isNavigable: true,
    section: 'operations',
  },
];

/** Legacy / backward-compat modules (not in top tab bar; routed via deep links or fallback).
 *  These are aliased to their consolidated counterparts. */
export const LEGACY_ADMIN_MODULES: AdminModuleConfig[] = [
  { id: 'property_config', label: 'Property Config', component: PropertyConfigurationSetup, toggleKey: 'admin_property_config', isNavigable: false, section: 'configuration' },
  { id: 'user_management', label: 'User Management', component: UserManagementSecurity, toggleKey: 'admin_user_management', isNavigable: false, section: 'security' },
  { id: 'role_permissions', label: 'Role Permissions', component: UserManagementSecurity, toggleKey: 'admin_role_permissions', isNavigable: false, section: 'security' },
  { id: 'security_center', label: 'Security Center', component: UserManagementSecurity, toggleKey: 'admin_security_center', isNavigable: false, section: 'security' },
  { id: 'reports_analytics', label: 'Reports & Analytics', component: ReportsAnalytics, toggleKey: 'admin_reports_analytics', isNavigable: false, section: 'operations' },
  { id: 'workflow_engine', label: 'Workflow Engine', component: WorkflowEngine, toggleKey: 'admin_workflow_engine', isNavigable: false },
];

export const ALL_ADMIN_MODULES: AdminModuleConfig[] = [...CORE_ADMIN_MODULES, ...LEGACY_ADMIN_MODULES];

/** Build a fast lookup map: moduleId -> config */
export const adminModuleMap: Record<string, AdminModuleConfig> = ALL_ADMIN_MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, AdminModuleConfig>
);

/** Legacy aliases for old module names */
export const adminModuleAliases: Record<string, string> = {
  system_admin: 'user_security',
  property_config: 'property_config',
  masterdata: 'reference_data',
  backup: 'data_backups',
  integration: 'system_integration',
  global: 'global_settings',
};

/**
 * Resolve any module key (including legacy aliases) to a canonical config.
 * Falls back to the first core module if unknown.
 */
export function resolveAdminModule(moduleId?: string): AdminModuleConfig {
  if (!moduleId) return CORE_ADMIN_MODULES[0];
  const canonical = adminModuleAliases[moduleId] || moduleId;
  return adminModuleMap[canonical] || CORE_ADMIN_MODULES[0];
}

/** Group navigable modules by section for sidebar rendering. */
export function getModulesBySection(): { section: string; label: string; modules: AdminModuleConfig[] }[] {
  return ADMIN_SECTIONS.map(sec => ({
    section: sec.id,
    label: sec.label,
    modules: CORE_ADMIN_MODULES.filter(m => m.section === sec.id && m.isNavigable),
  })).filter(group => group.modules.length > 0);
}
