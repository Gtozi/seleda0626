/**
 * Admin Module Registry
 * Single source of truth for all System Administration modules.
 * Used by App.tsx (tab bar) and AdminPortal.tsx (content router).
 * Based on System Administration Portal Architecture v1.0
 */

import React from 'react';

// Placeholder imports for new modules - will be implemented
import ExecutiveDashboard from './modules/ExecutiveDashboard';
import TenantPropertyManagement from './modules/TenantPropertyManagement';
import OrganizationStructure from './modules/OrganizationStructure';
import UserManagement from './modules/UserManagement';
import IdentityAuthentication from './modules/IdentityAuthentication';
import RolePermissionManagement from './modules/RolePermissionManagement';
import DepartmentManagement from './modules/DepartmentManagement';
import PortalManagement from './modules/PortalManagement';
import ModuleManagement from './modules/ModuleManagement';
import FeatureFlagManagement from './modules/FeatureFlagManagement';
import WorkflowEngine from './modules/WorkflowEngine';
import ApprovalMatrix from './modules/ApprovalMatrix';
import MasterDataManagement from './modules/MasterDataManagement';
import BusinessRulesEngine from './modules/BusinessRulesEngine';
import NotificationCenter from './modules/NotificationCenter';
import DocumentTemplateManagement from './modules/DocumentTemplateManagement';
import IntegrationHub from './modules/IntegrationHub';
import APIGatewayManagement from './modules/APIGatewayManagement';
import PaymentGatewayConfiguration from './modules/PaymentGatewayConfiguration';
import DeviceManagement from './modules/DeviceManagement';
import POSManagement from './modules/POSManagement';
import ChannelManagerConfiguration from './modules/ChannelManagerConfiguration';
import RateTaxConfiguration from './modules/RateTaxConfiguration';
import Localization from './modules/Localization';
import SecurityCenter from './modules/SecurityCenter';
import AuditCenter from './modules/AuditCenter';
import MonitoringHealth from './modules/MonitoringHealth';
import BackupDisasterRecovery from './modules/BackupDisasterRecovery';
import Licensing from './modules/Licensing';
import Reports from './modules/Reports';
import SystemSettings from './modules/SystemSettings';

// Legacy imports for backward compatibility
import UserManagementSecurity from './UserManagementSecurity';
import SystemIntegrationChannel from './SystemIntegrationChannel';
import GlobalSystemSettings from './GlobalSystemSettings';
import DataManagementBackups from './DataManagementBackups';
import PlatformControls from './PlatformControls';
import PropertyConfigurationSetup from './PropertyConfigurationSetup';
import MasterData from './MasterData';
import AuditCompliance from './AuditCompliance';
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
import ExecutiveBusinessIntelligencePortal from './ExecutiveBusinessIntelligencePortal';

export interface AdminModuleConfig {
  id: string;
  label: string;
  component: React.FC<any>;
  /** moduleToggle key in GlobalHotelSettings.moduleToggles (e.g. 'admin_user_security') */
  toggleKey: string;
  /** Whether this module appears in the top tab bar in App.tsx */
  isNavigable: boolean;
  /** Section grouping for consolidated admin layout */
  section?: 'dashboard' | 'tenant' | 'organization' | 'identity' | 'security' | 'configuration' | 'users_roles' | 'audit_center' | 'operations' | 'integrations' | 'reports';
}

export const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Executive Dashboard', order: 1 },
  { id: 'tenant', label: 'Tenant & Property', order: 2 },
  { id: 'organization', label: 'Organization', order: 3 },
  { id: 'identity', label: 'Identity & Access', order: 4 },
  { id: 'security', label: 'Security', order: 5 },
  { id: 'configuration', label: 'Configuration', order: 6 },
  { id: 'users_roles', label: 'Users & Roles', order: 7 },
  { id: 'audit_center', label: 'Audit Center', order: 8 },
  { id: 'operations', label: 'Operations', order: 9 },
  { id: 'integrations', label: 'Integrations', order: 10 },
  { id: 'reports', label: 'Reports', order: 11 },
] as const;

/** Core system admin modules — organized into 11 consolidated sections.
 *  Based on System Administration Portal Architecture v1.0
 *  This is the single source of truth for admin navigation. */
export const CORE_ADMIN_MODULES: AdminModuleConfig[] = [
  // ── Executive Dashboard ──
  {
    id: 'executive_dashboard',
    label: 'Executive Dashboard',
    component: ExecutiveDashboard,
    toggleKey: 'admin_executive_dashboard',
    isNavigable: true,
    section: 'dashboard',
  },

  // ── Tenant & Property Management ──
  {
    id: 'tenant_property',
    label: 'Tenant & Property',
    component: TenantPropertyManagement,
    toggleKey: 'admin_tenant_property',
    isNavigable: true,
    section: 'tenant',
  },

  // ── Organization Structure ──
  {
    id: 'organization_structure',
    label: 'Organization Structure',
    component: OrganizationStructure,
    toggleKey: 'admin_organization_structure',
    isNavigable: true,
    section: 'organization',
  },

  // ── Identity & Access ──
  {
    id: 'user_management',
    label: 'User Management',
    component: UserManagement,
    toggleKey: 'admin_user_management',
    isNavigable: true,
    section: 'identity',
  },
  {
    id: 'identity_authentication',
    label: 'Identity & Authentication',
    component: IdentityAuthentication,
    toggleKey: 'admin_identity_authentication',
    isNavigable: true,
    section: 'identity',
  },
  {
    id: 'role_permission',
    label: 'Role & Permission',
    component: RolePermissionManagement,
    toggleKey: 'admin_role_permission',
    isNavigable: true,
    section: 'identity',
  },
  {
    id: 'department_management',
    label: 'Department Management',
    component: DepartmentManagement,
    toggleKey: 'admin_department_management',
    isNavigable: true,
    section: 'identity',
  },

  // ── Security ──
  {
    id: 'security_center',
    label: 'Security Center',
    component: SecurityCenter,
    toggleKey: 'admin_security_center',
    isNavigable: true,
    section: 'security',
  },

  // ── Configuration ──
  {
    id: 'portal_management',
    label: 'Portal Management',
    component: PortalManagement,
    toggleKey: 'admin_portal_management',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'module_management',
    label: 'Module Management',
    component: ModuleManagement,
    toggleKey: 'admin_module_management',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'feature_flag',
    label: 'Feature Flags',
    component: FeatureFlagManagement,
    toggleKey: 'admin_feature_flag',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'master_data',
    label: 'Master Data',
    component: MasterDataManagement,
    toggleKey: 'admin_master_data',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'business_rules',
    label: 'Business Rules',
    component: BusinessRulesEngine,
    toggleKey: 'admin_business_rules',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'notification_center',
    label: 'Notification Center',
    component: NotificationCenter,
    toggleKey: 'admin_notification_center',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'document_template',
    label: 'Document & Template',
    component: DocumentTemplateManagement,
    toggleKey: 'admin_document_template',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'payment_gateway',
    label: 'Payment Gateway',
    component: PaymentGatewayConfiguration,
    toggleKey: 'admin_payment_gateway',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'device_management',
    label: 'Device Management',
    component: DeviceManagement,
    toggleKey: 'admin_device_management',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'pos_management',
    label: 'POS Management',
    component: POSManagement,
    toggleKey: 'admin_pos_management',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'channel_manager',
    label: 'Channel Manager',
    component: ChannelManagerConfiguration,
    toggleKey: 'admin_channel_manager',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'rate_tax',
    label: 'Rate & Tax',
    component: RateTaxConfiguration,
    toggleKey: 'admin_rate_tax',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'localization',
    label: 'Localization',
    component: Localization,
    toggleKey: 'admin_localization',
    isNavigable: true,
    section: 'configuration',
  },
  {
    id: 'system_settings',
    label: 'System Settings',
    component: SystemSettings,
    toggleKey: 'admin_system_settings',
    isNavigable: true,
    section: 'configuration',
  },

  // ── Users & Roles ──
  {
    id: 'workflow_engine',
    label: 'Workflow Engine',
    component: WorkflowEngine,
    toggleKey: 'admin_workflow_engine',
    isNavigable: true,
    section: 'users_roles',
  },
  {
    id: 'approval_matrix',
    label: 'Approval Matrix',
    component: ApprovalMatrix,
    toggleKey: 'admin_approval_matrix',
    isNavigable: true,
    section: 'users_roles',
  },

  // ── Audit Center ──
  {
    id: 'audit_center',
    label: 'Audit Center',
    component: AuditCenter,
    toggleKey: 'admin_audit_center',
    isNavigable: true,
    section: 'audit_center',
  },

  // ── Operations ──
  {
    id: 'monitoring_health',
    label: 'Monitoring & Health',
    component: MonitoringHealth,
    toggleKey: 'admin_monitoring_health',
    isNavigable: true,
    section: 'operations',
  },
  {
    id: 'backup_recovery',
    label: 'Backup & Recovery',
    component: BackupDisasterRecovery,
    toggleKey: 'admin_backup_recovery',
    isNavigable: true,
    section: 'operations',
  },
  {
    id: 'licensing',
    label: 'Licensing',
    component: Licensing,
    toggleKey: 'admin_licensing',
    isNavigable: true,
    section: 'operations',
  },

  // ── Integrations ──
  {
    id: 'integration_hub',
    label: 'Integration Hub',
    component: IntegrationHub,
    toggleKey: 'admin_integration_hub',
    isNavigable: true,
    section: 'integrations',
  },
  {
    id: 'api_gateway',
    label: 'API Gateway',
    component: APIGatewayManagement,
    toggleKey: 'admin_api_gateway',
    isNavigable: true,
    section: 'integrations',
  },

  // ── Reports ──
  {
    id: 'reports',
    label: 'Reports',
    component: Reports,
    toggleKey: 'admin_reports',
    isNavigable: true,
    section: 'reports',
  },
];

/** Legacy / backward-compat modules (not in top tab bar; routed via deep links or fallback).
 *  These are aliased to their consolidated counterparts. */
export const LEGACY_ADMIN_MODULES: AdminModuleConfig[] = [
  { id: 'property_config', label: 'Property Config', component: PropertyConfigurationSetup, toggleKey: 'admin_property_config', isNavigable: false, section: 'configuration' },
  { id: 'role_permissions', label: 'Role Permissions', component: UserManagementSecurity, toggleKey: 'admin_role_permissions', isNavigable: false, section: 'security' },
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
