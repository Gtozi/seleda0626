/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authentication Helper Functions
 * Extracted from server.ts to enable reuse across middleware and routes
 */

import express from 'express';
import type { User, UserRole } from '../types/erp';
import { hasSupabaseAdminConfig, supabaseAdmin } from './supabaseAdmin';
import crypto from 'crypto';

const SESSION_COOKIE = 'hotel_erp_session';
const FORCE_FALLBACK_AUTH = process.env.FORCE_FALLBACK_AUTH === 'true';

// Legacy permission mapping for backward compatibility
const legacyPermissionMap: Record<string, string> = {
  viewRatePlans: 'rates:view',
  editRatePlans: 'rates:update',
  viewRoomOutlook: 'room:status:update',
  manageUserAccounts: 'users:manage',
  manageRoles: 'roles:manage',
  adjustHotelTaxes: 'settings:tax:update',
  voidTransactions: 'folio:payment:void',
  accessAuditLogs: 'audit:view',
  create_reservation: 'reservation:create',
  update_reservation: 'reservation:update',
  delete_reservation: 'reservation:delete',
  check_in: 'reservation:check_in',
  check_out: 'reservation:check_out',
  add_charge: 'folio:charge:add',
  void_charge: 'folio:charge:void',
  process_payment: 'folio:payment:add',
  void_payment: 'folio:payment:void',
  update_room_status: 'room:status:update',
  manage_users: 'users:manage',
  view_reports: 'reports:view',
  export_data: 'reports:export',
  modify_settings: 'settings:update',
};

const fallbackRolePermissions: Record<string, string[]> = {
  frontoffice: ['reservation:create', 'reservation:update', 'reservation:check_in', 'reservation:check_out', 'folio:charge:add', 'folio:charge:void', 'folio:payment:add', 'folio:payment:void', 'room:status:update', 'reports:view', 'finance:read'],
  housekeeping: ['room:status:update', 'reports:view'],
  'f&b': ['folio:charge:add', 'folio:payment:add', 'reports:view'],
  maintenance: ['room:status:update', 'reports:view'],
  inventory: ['inventory:stock:adjust', 'inventory:transfer:create', 'reports:view', 'reports:export'],
  finance: ['folio:charge:void', 'folio:payment:void', 'rates:view', 'rates:update', 'settings:tax:update', 'audit:view', 'reports:view', 'reports:export', 'finance:journal:create', 'finance:journal:post', 'finance:period:close', 'finance:read'],
  hr: ['users:manage', 'audit:view', 'reports:view'],
  executive: ['*'],
  general_manager: ['*'],
  admin: ['*'],
  procurement: ['procurement:requisition:approve', 'procurement:po:create', 'procurement:po:approve', 'reports:view', 'reports:export'],
  owner: ['*'],
  gm: ['*'],
  custom: [],
};

const fallbackSessions = new Map<string, { user: User; expiresAt: number }>();

/**
 * Parse cookies from request header
 */
function parseCookies(header?: string) {
  try {
    return Object.fromEntries((header || '').split(';').map(part => {
      const [key, ...value] = part.trim().split('=');
      return [key, decodeURIComponent(value.join('='))];
    }).filter(([key]) => key));
  } catch (error) {
    console.error('Error parsing cookies:', error);
    return {};
  }
}

/**
 * Hash session token for storage/lookup
 */
function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Map database user record to User type
 */
function mapSystemUserFromDb(db: any): User {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    role: db.role,
    roleDescription: db.role_description || db.role,
    avatarInitials: db.avatar_initials || db.name?.slice(0, 2).toUpperCase() || 'U',
    status: db.status,
    lastLogin: db.last_login,
    employeeId: db.employee_id,
    username: db.username,
    mobileNumber: db.mobile_number,
    department: db.department,
    customRoleId: db.custom_role_id,
    securitySettings: db.security_settings || undefined,
    dataRestrictions: db.data_restrictions || undefined,
    allowedTabs: db.allowed_tabs || undefined,
    allowedSettings: db.allowed_settings || undefined,
  };
}

/**
 * Normalize permission action to standard format
 */
function normalizePermission(action: string) {
  return legacyPermissionMap[action] || action;
}

/**
 * Get authenticated user from request session
 */
export async function getRequestUser(req: express.Request): Promise<User | null> {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = hashToken(token);

  if (!FORCE_FALLBACK_AUTH && hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: session, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, expires_at, revoked_at, system_users (*)')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle();

    if (error || !session || new Date(session.expires_at).getTime() < Date.now()) return null;
    const systemUser = Array.isArray(session.system_users) ? session.system_users[0] : session.system_users;
    if (!systemUser) return null;
    return mapSystemUserFromDb(systemUser);
  }

  const fallbackSession = fallbackSessions.get(tokenHash);
  if (!fallbackSession || fallbackSession.expiresAt < Date.now()) return null;
  return fallbackSession.user;
}

/**
 * Check if user has permission for specific action
 */
export async function userCan(user: User | null, action: string): Promise<boolean> {
  const permissionCode = normalizePermission(action);
  if (!user || user.status === 'Inactive' || user.status === 'Pending' || user.status === 'Suspended' || user.status === 'Locked') return false;
  if (user.role === 'executive') return true;
  if (user.allowedSettings?.[action as keyof NonNullable<User['allowedSettings']>]) return true;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('roles (is_superuser, role_permissions (permissions (code)))')
      .eq('user_id', user.id);

    if (error || !data) return false;

    return data.some((row: any) => {
      const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
      if (role?.is_superuser) return true;
      return role?.role_permissions?.some((rp: any) => {
        const permission = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
        return permission?.code === permissionCode;
      });
    });
  }

  return fallbackRolePermissions[user.role]?.includes('*') || fallbackRolePermissions[user.role]?.includes(permissionCode) || false;
}

/**
 * Revoke user session
 */
export async function revokeRequestSession(req: express.Request) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return;

  const tokenHash = hashToken(token);

  if (!FORCE_FALLBACK_AUTH && hasSupabaseAdminConfig && supabaseAdmin) {
    await supabaseAdmin
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
    return;
  }

  fallbackSessions.delete(tokenHash);
}

/**
 * Clear session cookie from response
 */
export function clearSessionCookie(res: express.Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}
