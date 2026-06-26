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
import PropertyConfiguration from './PropertyConfiguration';
import AuditCompliance from './AuditCompliance';
import BackupRecovery from './BackupRecovery';
import WorkflowEngine from './WorkflowEngine';
import ApprovalCenter from '../Executive/ApprovalCenter';
import IntegrationsCenter from './IntegrationsCenter';
import ReportsAnalytics from './ReportsAnalytics';
import SystemHealthDashboard from './SystemHealthDashboard';
import SystemAdmin from '../Executive/SystemAdmin';
import ChangeControl from './ChangeControl';

export interface AdminModuleConfig {
  id: string;
  label: string;
  component: React.FC<any>;
  /** moduleToggle key in GlobalHotelSettings.moduleToggles (e.g. 'admin_user_security') */
  toggleKey: string;
  /** Whether this module appears in the top tab bar in App.tsx */
  isNavigable: boolean;
}

/** Core system admin modules (rendered in the top tab bar).
 *  Business modules have been moved to the Executive Portal. */
export const CORE_ADMIN_MODULES: AdminModuleConfig[] = [
  {
    id: 'user_security',
    label: 'Identity & Access',
    component: UserManagementSecurity,
    toggleKey: 'admin_user_security',
    isNavigable: true,
  },
  {
    id: 'platform_controls',
    label: 'Platform',
    component: PlatformControls,
    toggleKey: 'admin_platform_controls',
    isNavigable: true,
  },
  {
    id: 'system_integration',
    label: 'Integration & Channels',
    component: SystemIntegrationChannel,
    toggleKey: 'admin_system_integration',
    isNavigable: true,
  },
  {
    id: 'global_settings',
    label: 'Global Settings',
    component: GlobalSystemSettings,
    toggleKey: 'admin_global_settings',
    isNavigable: true,
  },
  {
    id: 'system_health',
    label: 'System Health',
    component: SystemHealthDashboard,
    toggleKey: 'admin_system_health',
    isNavigable: true,
  },
  {
    id: 'audit_center',
    label: 'Audit Logs',
    component: AuditCompliance,
    toggleKey: 'admin_audit_center',
    isNavigable: true,
  },
  {
    id: 'data_backups',
    label: 'Data & Backups',
    component: DataManagementBackups,
    toggleKey: 'admin_data_backups',
    isNavigable: true,
  },
];

/** Legacy / backward-compat modules (not in top tab bar; routed via deep links or fallback).
 *  Business modules moved to Executive Portal have been removed. */
export const LEGACY_ADMIN_MODULES: AdminModuleConfig[] = [
  { id: 'change_control', label: 'Audit', component: ChangeControl, toggleKey: 'admin_change_control', isNavigable: false },
  { id: 'property_setup', label: 'Property Setup', component: PropertyConfiguration, toggleKey: 'admin_property_setup', isNavigable: false },
  { id: 'user_management', label: 'User Management', component: () => React.createElement(SystemAdmin, { initialTab: 'users', showNav: false }), toggleKey: 'admin_user_management', isNavigable: false },
  { id: 'role_permissions', label: 'Role Permissions', component: () => React.createElement(SystemAdmin, { initialTab: 'roles', showNav: false }), toggleKey: 'admin_role_permissions', isNavigable: false },
  { id: 'security_center', label: 'Security Center', component: () => React.createElement(SystemAdmin, { initialTab: 'security', showNav: false }), toggleKey: 'admin_security_center', isNavigable: false },
  { id: 'emergency_controls', label: 'Emergency Controls', component: () => React.createElement(SystemAdmin, { initialTab: 'emergency', showNav: false }), toggleKey: 'admin_emergency_controls', isNavigable: false },
  { id: 'reports_analytics', label: 'Reports & Analytics', component: ReportsAnalytics, toggleKey: 'admin_reports_analytics', isNavigable: false },
  { id: 'workflow_engine', label: 'Workflow Engine', component: WorkflowEngine, toggleKey: 'admin_workflow_engine', isNavigable: false },
  { id: 'approval_matrix', label: 'Approval Matrix', component: ApprovalCenter, toggleKey: 'admin_approval_matrix', isNavigable: false },
  { id: 'integration_hub', label: 'Integration Hub', component: IntegrationsCenter, toggleKey: 'admin_integration_hub', isNavigable: false },
  { id: 'backup_recovery', label: 'Backup Recovery', component: BackupRecovery, toggleKey: 'admin_backup_recovery', isNavigable: false },
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
  masterdata: 'data_backups',
  backup: 'data_backups',
  financial: 'financial_revenue',
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
