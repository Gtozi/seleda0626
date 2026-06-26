/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { checkSettingPermission } from '../types/erp';

interface UseAdminPermissionParams {
  systemUsers: any[];
  userProfile: { email: string; role?: string };
}

interface UseAdminPermissionResult {
  authUser: any;
  isAdmin: boolean;
}

export function useAdminPermission({ systemUsers, userProfile }: UseAdminPermissionParams): UseAdminPermissionResult {
  const authUser = useMemo(() => {
    const matched = systemUsers.find(u => u.email.toLowerCase() === userProfile.email.toLowerCase());
    if (matched) return matched;
    // Fallback: synthesize a user from profile role so role-based permissions work
    const profileRole = userProfile.role?.toLowerCase() || '';
    if (profileRole) {
      // Normalize role names to match UserRole enum
      const roleMap: Record<string, string> = {
        'frontoffice': 'frontoffice',
        'front_office': 'frontoffice',
        'front office': 'frontoffice',
        'front-office': 'frontoffice',
        'housekeeping': 'housekeeping',
        'f&b': 'f&b',
        'fb': 'f&b',
        'food_beverage': 'f&b',
        'food beverage': 'f&b',
        'food-and-beverage': 'f&b',
        'maintenance': 'maintenance',
        'inventory': 'inventory',
        'finance': 'finance',
        'hr': 'hr',
        'human_resources': 'hr',
        'executive': 'executive',
        'procurement': 'procurement',
        'general_manager': 'general_manager',
        'general manager': 'general_manager',
        'system_admin': 'system_admin',
        'system admin': 'system_admin',
        'admin': 'admin',
        'gm': 'gm',
        'owner': 'owner',
      };
      const normalizedRole = roleMap[profileRole] || profileRole.replace(/\s+/g, '_').replace(/-/g, '_');
      return { email: userProfile.email, role: normalizedRole, roleDescription: '', allowedSettings: {} };
    }
    return null;
  }, [systemUsers, userProfile.email, userProfile.role]);

  const isAdmin = useMemo(() => {
    if (!authUser) {
      // Fallback when no user record exists yet: trust the profile role
      const role = userProfile.role?.toLowerCase() || '';
      return role.includes('admin') || role.includes('executive') || role.includes('platform') || role.includes('general_manager') || role.includes('system_admin') || role.includes('gm') || role.includes('owner');
    }
    return (
      authUser.role === 'executive' ||
      authUser.role === 'general_manager' ||
      authUser.role === 'system_admin' ||
      authUser.role === 'admin' ||
      authUser.role === 'gm' ||
      authUser.role === 'owner' ||
      authUser.roleDescription?.toLowerCase().includes('admin') ||
      checkSettingPermission(authUser, 'editGlobalSettings')
    );
  }, [authUser, userProfile.role]);

  return {
    authUser,
    isAdmin
  };
}
