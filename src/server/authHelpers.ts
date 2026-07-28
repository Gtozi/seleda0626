/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authentication Helper Functions
 * Extracted from server.ts to enable reuse across middleware and routes
 */

import express from 'express';
import type { User } from '../types/erp';
import { isFullAccessRole } from '../types/erp';
import { hasSupabaseAdminConfig, supabaseAdmin } from './supabaseAdmin';
import crypto from 'crypto';

const SESSION_COOKIE = 'hotel_erp_session';

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
    authUserId: db.auth_user_id || undefined,
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

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return null;

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

/**
 * Permission check context for granular RBAC (Step 3.2)
 */
export interface PermissionContext {
  module?: string;
  department?: string;
  recordOwnerId?: string;
  field?: string;
}

/**
 * Check if user has permission for specific action with optional context
 * Supports module, department, record-owner, and field-level permissions
 */
export async function userCan(user: User | null, action: string, context?: PermissionContext): Promise<boolean> {
  const permissionCode = normalizePermission(action);
  if (!user || user.status === 'Inactive' || user.status === 'Pending' || user.status === 'Suspended' || user.status === 'Locked') return false;

  // If user has a custom role, check only the custom role's permissions
  if (user.customRoleId) {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return false;
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('is_superuser, role_permissions ( permissions ( code ) )')
      .eq('id', user.customRoleId)
      .maybeSingle();
    if (roleError || !roleData) return false;
    if (roleData.is_superuser) return true;
    return (roleData.role_permissions || []).some((rp: any) => {
      const perm = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
      return perm?.code === permissionCode;
    });
  }

  if (isFullAccessRole(user.role)) return true;
  if (user.allowedSettings?.[action as keyof NonNullable<User['allowedSettings']>]) return true;

  // Field-level permission check (Step 3.2)
  if (context?.field) {
    const fieldPermission = `${permissionCode}:field:${context.field}`;
    if (user.allowedSettings?.[fieldPermission as keyof NonNullable<User['allowedSettings']>]) {
      return !!user.allowedSettings[fieldPermission as keyof NonNullable<User['allowedSettings']>];
    }
  }

  // Department-level permission check (Step 3.2)
  if (context?.department && user.department !== context.department) {
    // Check if user has cross-department permission
    const crossDeptPermission = `${permissionCode}:department:*`;
    if (!user.allowedSettings?.[crossDeptPermission as keyof NonNullable<User['allowedSettings']>]) {
      return false;
    }
  }

  // Record-owner check (Step 3.2)
  if (context?.recordOwnerId && context.recordOwnerId !== user.id) {
    const ownerPermission = `${permissionCode}:owner`;
    if (!user.allowedSettings?.[ownerPermission as keyof NonNullable<User['allowedSettings']>]) {
      return false;
    }
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return false;

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

/**
 * Revoke user session
 */
export async function revokeRequestSession(req: express.Request) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return;

  const tokenHash = hashToken(token);

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;

  await supabaseAdmin
    .from('user_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);
}

/**
 * Clear session cookie from response
 */
export function clearSessionCookie(res: express.Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

// ----------------------------------------------------------------
// TOTP helpers (RFC 6238) — no external dependencies
// ----------------------------------------------------------------

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of cleaned) {
    const val = BASE32_ALPHABET.indexOf(char);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateHotp(secret: Buffer, counter: bigint): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(counter);
  const hmac = crypto.createHmac('sha1', secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 |
                (hmac[offset + 1] & 0xff) << 16 |
                (hmac[offset + 2] & 0xff) << 8 |
                (hmac[offset + 3] & 0xff)) % 1_000_000;
  return code.toString().padStart(6, '0');
}

function generateTotp(secret: string, timeStepSeconds = 30, window = 1): string[] {
  const decoded = base32Decode(secret);
  const now = Math.floor(Date.now() / 1000);
  const currentStep = BigInt(Math.floor(now / timeStepSeconds));
  const codes: string[] = [];
  for (let i = -window; i <= window; i++) {
    codes.push(generateHotp(decoded, currentStep + BigInt(i)));
  }
  return codes;
}

/**
 * Verify a TOTP code against a base32-encoded secret.
 * Allows a small time window for clock drift.
 */
export function verifyTotp(secret: string | null | undefined, code: string): boolean {
  if (!secret || !/^\d{6}$/.test(code)) return false;
  return generateTotp(secret).includes(code);
}

/**
 * Set current user ID in session variable for audit triggers (Step 3.3)
 * This allows DB triggers to capture the actor for audit events
 */
export async function setAuditContext(userId: string): Promise<void> {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    await supabaseAdmin.rpc('set_config', { p_key: 'app.user_id', p_value: userId });
  }
}

/**
 * Clear audit context (set to null)
 */
export async function clearAuditContext(): Promise<void> {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    await supabaseAdmin.rpc('set_config', { p_key: 'app.user_id', p_value: null });
  }
}

/**
 * Generate a new base32 MFA secret suitable for TOTP apps.
 */
export function generateMfaSecret(): string {
  const bytes = crypto.randomBytes(20);
  let secret = '';
  let bits = '';
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }
  for (let i = 0; i < bits.length; i += 5) {
    if (i + 5 > bits.length) break;
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret;
}
