/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Permission Validation Library
 * Server-side permission checks to prevent client-side bypass
 */

import { User, UserRole } from '../types/erp';

export type Permission = 
  | 'viewRatePlans'
  | 'editRatePlans'
  | 'viewRoomOutlook'
  | 'viewSalesCampaigns'
  | 'manageSalesCampaigns'
  | 'manageUserAccounts'
  | 'manageRoles'
  | 'editGlobalSettings'
  | 'adjustHotelTaxes'
  | 'bypassHousekeepingLock'
  | 'voidTransactions'
  | 'accessAuditLogs'
  | 'exportData'
  | 'deleteReservations'
  | 'overrideRates';

export type Action = 
  | 'create_reservation'
  | 'update_reservation'
  | 'delete_reservation'
  | 'check_in'
  | 'check_out'
  | 'add_charge'
  | 'void_charge'
  | 'process_payment'
  | 'void_payment'
  | 'update_room_status'
  | 'manage_users'
  | 'view_reports'
  | 'export_data'
  | 'modify_settings';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validate permission on the server
 * NEVER trust client-side permission checks for critical operations
 */
export const validatePermission = async (
  action: Action | Permission
): Promise<PermissionCheckResult> => {
  try {
    const response = await fetch('/api/auth/validate-permission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      return {
        allowed: false,
        reason: 'Permission check failed',
      };
    }

    const data = await response.json();
    return {
      allowed: data.allowed,
      reason: data.reason,
    };
  } catch (error) {
    console.error('Permission validation error:', error);
    return {
      allowed: false,
      reason: 'Network error during permission check',
    };
  }
};

/**
 * Client-side permission check (for UI only, NOT for security)
 * Always validate on server before performing sensitive operations
 */
export const hasPermission = (
  user: User | null,
  permission: Permission
): boolean => {
  if (!user) return false;

  // Inactive or pending users have no permissions
  if (user.status === 'Inactive' || user.status === 'Pending') {
    return false;
  }

  // Executive, General Manager, System Admin, Admin, GM, and Owner roles have all permissions
  if (user.role === 'executive' || user.role === 'general_manager' || user.role === 'system_admin' || user.role === 'admin' || user.role === 'gm' || user.role === 'owner') {
    return true;
  }

  // Check explicit allowedSettings first (whether from custom role or direct user settings)
  if (user.allowedSettings && user.allowedSettings[permission] !== undefined) {
    return user.allowedSettings[permission] === true;
  }

  // Default permissions by role
  const rolePermissions: Record<UserRole, Permission[]> = {
    frontoffice: [
      'viewRatePlans',
      'editRatePlans',
      'viewRoomOutlook',
      'viewSalesCampaigns',
    ],
    housekeeping: [
      'viewRoomOutlook',
    ],
    'f&b': [
      'viewRoomOutlook',
    ],
    maintenance: [
      'viewRoomOutlook',
    ],
    inventory: [
      'viewRoomOutlook',
    ],
    finance: [
      'viewRatePlans',
      'editRatePlans',
      'viewRoomOutlook',
      'adjustHotelTaxes',
      'voidTransactions',
      'accessAuditLogs',
    ],
    hr: [
      'manageUserAccounts',
      'accessAuditLogs',
    ],
    executive: [], // Has all permissions
    general_manager: [], // Has all permissions
    system_admin: [], // Has all permissions
    admin: [], // Has all permissions
    procurement: [
      'viewRoomOutlook',
    ],
    custom: [], // Permissions handled via customRoleId and allowedSettings
    gm: [], // Has all permissions
    owner: [], // Has all permissions
  };

  return rolePermissions[user.role]?.includes(permission) || false;
};

/**
 * Check if user can access a specific tab/module
 */
export const canAccessTab = (
  user: User | null,
  tab: UserRole | 'settings' | 'admin'
): boolean => {
  if (!user) return false;

  // Inactive or pending users cannot access any tabs
  if (user.status === 'Inactive' || user.status === 'Pending') {
    return false;
  }

  // Settings tab is accessible to all active users
  if (tab === 'settings') return true;

  // Check explicitly allowed tabs first (overrides role defaults)
  if (user.allowedTabs && Array.isArray(user.allowedTabs)) {
    return user.allowedTabs.includes(tab as any);
  }

  // Executive, General Manager, System Admin, Admin, GM, and Owner roles can access all tabs (when no explicit allowedTabs)
  if (user.role === 'executive' || user.role === 'general_manager' || user.role === 'system_admin' || user.role === 'admin' || user.role === 'gm' || user.role === 'owner') return true;

  // Admin tab is not accessible to non-admin roles without explicit allowedTabs
  if (tab === 'admin') return false;

  // Default: user can only access their own role's tab
  return user.role === tab;
};

/**
 * Audit permission denial
 */
export const auditPermissionDenial = async (
  action: Action | Permission,
  reason: string
): Promise<void> => {
  try {
    await fetch('/api/audit/permission-denial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        action,
        reason,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to audit permission denial:', error);
  }
};

/**
 * Higher-order function to protect actions with permission checks
 */
export const withPermission = <T extends any[], R>(
  permission: Permission,
  action: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | null> => {
    const result = await validatePermission(permission);
    
    if (!result.allowed) {
      await auditPermissionDenial(permission, result.reason || 'Permission denied');
      throw new Error(`Permission denied: ${result.reason || 'Insufficient privileges'}`);
    }

    return action(...args);
  };
};

/**
 * React hook for permission checking
 */
export const usePermission = (permission: Permission) => {
  const [isAllowed, setIsAllowed] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      const result = await validatePermission(permission);
      setIsAllowed(result.allowed);
      setIsLoading(false);
    };

    checkPermission();
  }, [permission]);

  return { isAllowed, isLoading };
};

// Import React for the hook
import React from 'react';
