/**
 * Session & Authentication Service
 *
 * Phase 1 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 *
 * Extracted from server.ts to make session/auth helpers available to route
 * files in Phase 2. These are the COMPLETE versions from server.ts — they
 * include fallback-mode support, idle-timeout tracking, concurrent-session
 * enforcement, account lockout, IP allowlist, and device restriction checks
 * that the simpler authHelpers.ts versions lack.
 *
 * server.ts imports these back (replacing its local duplicates) so there is
 * one source of truth. Route files will import from here in Phase 2.
 *
 * Backward compatibility: behavior is identical to the server.ts local
 * functions — same constants, same logic, same return values. Only the
 * module location changes.
 */

import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { User } from '../../types/erp';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { getGlobalSettings } from './settingsService';
import { resolvePolicy, type PasswordPolicy } from '../../lib/passwordPolicy';
import { encrypt, maskApiKey, isEncrypted, decryptIfEncrypted } from '../../lib/crypto';
import { enrichUserWithDerivedPermissions as enrichUserShared } from './sharedServices';

// ─── Constants ───────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'hotel_erp_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 1000 * 60 * 30; // 30 minutes

// ─── Fallback mode state ─────────────────────────────────────────────────

export const FALLBACK_USERS: User[] = [
  { id: 'fallback-1', name: 'Front Office Manager', email: 'frontoffice@erp.com', role: 'front office manager', roleDescription: 'Front Office Manager', avatarInitials: 'FO', status: 'Active' },
  { id: 'fallback-2', name: 'Housekeeping Manager', email: 'housekeeping@erp.com', role: 'housekeeping', roleDescription: 'Housekeeping Manager', avatarInitials: 'HK', status: 'Active' },
  { id: 'fallback-3', name: 'F&B Manager', email: 'fb@erp.com', role: 'fb_manager', roleDescription: 'F&B Manager', avatarInitials: 'FB', status: 'Active' },
  { id: 'fallback-4', name: 'Maintenance Manager', email: 'maintenance@erp.com', role: 'maintenance', roleDescription: 'Maintenance Manager', avatarInitials: 'MT', status: 'Active' },
  { id: 'fallback-5', name: 'General Manager', email: 'gm@erp.com', role: 'executive', roleDescription: 'General Manager', avatarInitials: 'GM', status: 'Active' },
  { id: 'fallback-6', name: 'Finance Manager', email: 'finance@erp.com', role: 'fin_manager', roleDescription: 'Finance Manager', avatarInitials: 'FM', status: 'Active' },
  { id: 'fallback-7', name: 'HR Manager', email: 'hr@erp.com', role: 'hr', roleDescription: 'HR Manager', avatarInitials: 'HR', status: 'Active' },
  { id: 'fallback-8', name: 'Inventory Manager', email: 'inventory@erp.com', role: 'inventory', roleDescription: 'Inventory Manager', avatarInitials: 'IM', status: 'Active' },
  { id: 'fallback-9', name: 'Procurement Manager', email: 'procurement@erp.com', role: 'procurement', roleDescription: 'Procurement Manager', avatarInitials: 'PM', status: 'Active' },
  { id: 'fallback-10', name: 'System Admin', email: 'admin@erp.com', role: 'admin', roleDescription: 'System Admin', avatarInitials: 'SA', status: 'Active' },
  { id: 'fallback-11', name: 'Operations Manager', email: 'operations@erp.com', role: 'ops_manager', roleDescription: 'Operations Manager', avatarInitials: 'OM', status: 'Active' },
  { id: 'fallback-12', name: 'Sales Manager', email: 'sales@erp.com', role: 'sales', roleDescription: 'Sales Manager', avatarInitials: 'SM', status: 'Active' },
  { id: 'fallback-13', name: 'Concierge Manager', email: 'concierge@erp.com', role: 'concierge', roleDescription: 'Concierge Manager', avatarInitials: 'CC', status: 'Active' },
  { id: 'fallback-14', name: 'Spa & Wellness Director', email: 'spa@erp.com', role: 'spa', roleDescription: 'Spa & Wellness Director', avatarInitials: 'SW', status: 'Active' },
  { id: 'fallback-15', name: 'Banquet & Events Manager', email: 'banquet@erp.com', role: 'banquet', roleDescription: 'Banquet & Events Manager', avatarInitials: 'BE', status: 'Active' },
  { id: 'fallback-16', name: 'Transportation Manager', email: 'transportation@erp.com', role: 'transportation', roleDescription: 'Transportation Manager', avatarInitials: 'TM', status: 'Active' },
  { id: 'fallback-17', name: 'Revenue Manager', email: 'revenue@erp.com', role: 'revenue', roleDescription: 'Revenue Manager', avatarInitials: 'RM', status: 'Active' },
  { id: 'fallback-18', name: 'Security Manager', email: 'security@erp.com', role: 'security_manager', roleDescription: 'Security Manager', avatarInitials: 'SM', status: 'Active' },
];

export const FALLBACK_PASSWORD = process.env.DEV_LOGIN_PASSWORD || 'admin123';
export const FORCE_FALLBACK_AUTH = process.env.FORCE_FALLBACK_AUTH === 'true';
export const IS_FALLBACK_MODE = !hasSupabaseAdminConfig || !supabaseAdmin || FORCE_FALLBACK_AUTH;

/** In-memory session store for fallback mode. */
export const fallbackSessions = new Map<string, { user: User; expiresAt: number }>();

// ─── Legacy permission mapping ───────────────────────────────────────────

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

export function normalizePermission(action: string) {
  return legacyPermissionMap[action] || action;
}

// ─── Cookie / token utilities ────────────────────────────────────────────

export function parseCookies(header?: string) {
  return Object.fromEntries((header || '').split(';').map(part => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }).filter(([key]) => key));
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function setRawSessionCookie(res: express.Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

export function clearSessionCookie(res: express.Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

// ─── User mapping ────────────────────────────────────────────────────────

export function mapSystemUserFromDb(db: any): User {
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

// ─── Session settings ────────────────────────────────────────────────────

export async function fetchSessionSettings(): Promise<{ timeoutMs: number; maxConcurrent: number }> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return { timeoutMs: SESSION_TTL_MS, maxConcurrent: 3 };
  try {
    const settings = await getGlobalSettings();
    const timeoutMin = Number(settings?.session_timeout) || 0;
    const maxConcurrent = Number(settings?.max_concurrent_sessions) || 3;
    const timeoutMs = timeoutMin > 0 ? timeoutMin * 60 * 1000 : SESSION_TTL_MS;
    return { timeoutMs, maxConcurrent };
  } catch {
    return { timeoutMs: SESSION_TTL_MS, maxConcurrent: 3 };
  }
}

// ─── Session lifecycle ───────────────────────────────────────────────────

export async function createSession(user: User, req: express.Request, res: express.Response) {
  const token = createSessionToken();
  const { timeoutMs, maxConcurrent } = await fetchSessionSettings();
  const expiresAt = new Date(Date.now() + timeoutMs);

  if (IS_FALLBACK_MODE) {
    fallbackSessions.set(token, { user, expiresAt: Date.now() + timeoutMs });
    setRawSessionCookie(res, token);
    return;
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: activeSessions } = await supabaseAdmin
      .from('user_sessions')
      .select('id, created_at')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: true });

    if (activeSessions && activeSessions.length >= maxConcurrent) {
      const toRevoke = activeSessions.slice(0, activeSessions.length - maxConcurrent + 1);
      for (const s of toRevoke) {
        await supabaseAdmin.from('user_sessions')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', s.id);
      }
    }

    await supabaseAdmin.from('user_sessions').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      token_hash: hashToken(token),
      expires_at: expiresAt.toISOString(),
      user_agent: req.headers['user-agent'] || null,
      ip_address: req.ip,
      last_activity: new Date().toISOString(),
    });
  } else {
    throw new Error('Database not configured');
  }

  setRawSessionCookie(res, token);
}

export async function getRequestUser(req: express.Request): Promise<User | null> {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;

  if (IS_FALLBACK_MODE) {
    const session = fallbackSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      fallbackSessions.delete(token);
      return null;
    }
    const { timeoutMs } = await fetchSessionSettings();
    session.expiresAt = Date.now() + timeoutMs;
    return session.user;
  }

  const tokenHash = hashToken(token);

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: session, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, expires_at, revoked_at, last_activity, system_users (*)')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle();

    if (error || !session || new Date(session.expires_at).getTime() < Date.now()) return null;

    const { timeoutMs } = await fetchSessionSettings();
    if (session.last_activity) {
      const lastActivity = new Date(session.last_activity).getTime();
      if (Date.now() - lastActivity > timeoutMs) {
        await supabaseAdmin.from('user_sessions')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', session.id);
        return null;
      }
    }

    await supabaseAdmin.from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);

    const systemUser = Array.isArray(session.system_users) ? session.system_users[0] : session.system_users;
    if (!systemUser) return null;
    return mapSystemUserFromDb(systemUser);
  }

  return null;
}

export async function revokeRequestSession(req: express.Request) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return;

  if (IS_FALLBACK_MODE) {
    fallbackSessions.delete(token);
    return;
  }

  const tokenHash = hashToken(token);

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;

  await supabaseAdmin
    .from('user_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);
}

// ─── Authentication ──────────────────────────────────────────────────────

export async function authenticateUser(
  email: string,
  password: string,
  req: express.Request
): Promise<{ user?: User; error?: string; status: number; forcePasswordChange?: boolean }> {
  if (IS_FALLBACK_MODE) {
    const fallbackUser = FALLBACK_USERS.find(u => u.email === email);
    if (fallbackUser && password === FALLBACK_PASSWORD) {
      await writeAuditEvent({ req, user: fallbackUser, action: 'login.success', module: 'auth', details: { mode: 'development-fallback' } });
      return { status: 200, user: fallbackUser, forcePasswordChange: false };
    }
    await writeAuditEvent({ req, action: 'login.failure', outcome: 'failure', details: { email, reason: 'invalid_fallback_credentials', mode: 'development-fallback' } });
    return { status: 401, error: 'Invalid credentials' };
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return { status: 503, error: 'Database not configured' };
  }

  const { data: dbUser, error } = await supabaseAdmin
    .from('system_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !dbUser || !dbUser.password_hash) {
    await writeAuditEvent({ req, action: 'login.failure', outcome: 'failure', details: { email, reason: 'unknown_user' } });
    return { status: 401, error: 'Invalid credentials' };
  }

  if (dbUser.locked_until && new Date(dbUser.locked_until).getTime() > Date.now()) {
    return { status: 423, error: 'Account is temporarily locked' };
  }

  const passwordOk = await bcrypt.compare(password, dbUser.password_hash);
  if (!passwordOk) {
    const newFailedCount = Number(dbUser.failed_login_count || 0) + 1;
    const lockoutUpdates: any = { failed_login_count: newFailedCount };
    if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
      lockoutUpdates.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      lockoutUpdates.status = 'Locked';
    }
    await supabaseAdmin.from('system_users').update(lockoutUpdates).eq('id', dbUser.id);
    await writeAuditEvent({ req, user: mapSystemUserFromDb(dbUser), action: 'login.failure', outcome: 'failure', details: { email, reason: 'bad_password', failedCount: newFailedCount, locked: newFailedCount >= MAX_FAILED_ATTEMPTS } });
    return { status: 401, error: 'Invalid credentials' };
  }

  if (dbUser.status !== 'Active') {
    return { status: 403, error: `Account is ${dbUser.status}` };
  }

  const settings = await getGlobalSettings();
  const allowedIps = settings?.allowed_ips;
  if (allowedIps && Array.isArray(allowedIps) && allowedIps.length > 0) {
    const clientIp = req.ip || '';
    const isAllowed = allowedIps.some((entry: any) => {
      if (typeof entry === 'string') return entry.trim() === clientIp;
      if (entry && typeof entry.ip === 'string') return entry.ip.trim() === clientIp;
      return false;
    });
    if (!isAllowed) {
      await writeAuditEvent({ req, user: mapSystemUserFromDb(dbUser), action: 'login.ip_blocked', outcome: 'denied', module: 'auth', details: { email, ip: clientIp } });
      return { status: 403, error: 'Access denied from this IP address' };
    }
  }

  const securitySettings = dbUser.security_settings || {};
  const deviceRestrictions = (securitySettings as any)?.deviceRestrictions;
  if (deviceRestrictions?.enabled) {
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.ip || '';
    const { data: knownSessions } = await supabaseAdmin
      .from('user_sessions')
      .select('user_agent, ip_address')
      .eq('user_id', dbUser.id)
      .is('revoked_at', null)
      .not('user_agent', 'is', null);
    const knownDevices = (knownSessions || []).map((s: any) => `${s.user_agent}|${s.ip_address}`);
    const currentDevice = `${userAgent}|${clientIp}`;
    const isKnownDevice = knownDevices.some((d: string) => d === currentDevice);
    if (!isKnownDevice && knownDevices.length > 0) {
      await writeAuditEvent({ req, user: mapSystemUserFromDb(dbUser), action: 'login.device_blocked', outcome: 'denied', module: 'auth', details: { email, device: currentDevice } });
      return { status: 403, error: 'Access denied from unknown device. Contact an administrator to approve this device.' };
    }
  }

  await supabaseAdmin
    .from('system_users')
    .update({ failed_login_count: 0, locked_until: null, last_login: new Date().toISOString() })
    .eq('id', dbUser.id);

  const user = mapSystemUserFromDb(dbUser);
  user.lastLogin = new Date().toISOString();
  const forcePasswordChange = dbUser.force_password_change === true;
  return { status: 200, user, forcePasswordChange };
}

// ─── Permission check ────────────────────────────────────────────────────

export async function userCan(user: User | null, action: string) {
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

  return false;
}

// ─── Password policy ─────────────────────────────────────────────────────

export async function fetchPasswordPolicy(): Promise<PasswordPolicy | null> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return null;
  try {
    const settings = await getGlobalSettings();
    if (settings?.password_complexity) {
      return resolvePolicy(settings.password_complexity);
    }
  } catch {}
  return null;
}

// ─── Audit event writing ─────────────────────────────────────────────────

/**
 * Write an audit event to the database.
 *
 * This is the COMPLETE version from server.ts — uses crypto.randomUUID(),
 * req.ip for the IP address, and has 42P01 retry logic (creates the table
 * if it doesn't exist, then retries the insert).
 */
export async function writeAuditEvent(params: {
  req: express.Request;
  user?: User | null;
  action: string;
  entityType?: string;
  entityId?: string;
  module?: string;
  outcome?: 'success' | 'failure' | 'denied';
  details?: Record<string, unknown>;
}) {
  const event = {
    id: crypto.randomUUID(),
    user_id: params.user?.id || null,
    user_name: params.user?.name || null,
    action: params.action,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    module: params.module || null,
    ip_address: params.req.ip,
    user_agent: params.req.headers['user-agent'] || null,
    outcome: params.outcome || 'success',
    details: params.details || {},
  };

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from('audit_events').insert(event);
      if (error && error.code === '42P01') {
        await ensureAuditEventsTable();
        const retry = await supabaseAdmin.from('audit_events').insert(event);
        if (!retry.error) return;
      } else if (!error) {
        return;
      }
    } catch (_) {}
  }
}

// ─── Table existence checks ──────────────────────────────────────────────

export async function ensurePendingAdminChangesTable() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from('pending_admin_changes').select('id').limit(0);
    if (error && error.code === '42P01') {
      const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ query: `CREATE TABLE IF NOT EXISTS pending_admin_changes (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, change_type TEXT NOT NULL, submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), submitted_by TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', payload JSONB NOT NULL); CREATE INDEX IF NOT EXISTS idx_pending_admin_changes_status ON pending_admin_changes (status);` }),
      }).catch(() => null);
    }
  } catch (_) {}
}

export async function ensureAuditEventsTable() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from('audit_events').select('id').limit(0);
    if (error && error.code === '42P01') {
      const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ query: `CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), user_id TEXT, user_name TEXT, action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, module TEXT, ip_address TEXT, user_agent TEXT, outcome TEXT NOT NULL DEFAULT 'success', details JSONB NOT NULL DEFAULT '{}'::jsonb); CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(created_at DESC); CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);` }),
      }).catch(() => null);
    }
  } catch (_) {}
}

// ─── API integration processing ──────────────────────────────────────────

export function processApiIntegrationsOnRead(raw: any): any[] {
  if (!raw) return [];
  let integrations: any[];
  if (typeof raw === 'string') {
    try { integrations = JSON.parse(raw); } catch { return []; }
  } else if (Array.isArray(raw)) {
    integrations = raw;
  } else {
    return [];
  }
  return integrations.map((item: any) => {
    const processed = { ...item };
    if (item.apiKey) {
      try {
        const decrypted = decryptIfEncrypted(item.apiKey);
        processed.apiKey = maskApiKey(decrypted);
      } catch {
        processed.apiKey = maskApiKey(item.apiKey);
      }
    }
    return processed;
  });
}

export function processApiIntegrationsOnWrite(integrations: any[]): any[] {
  if (!Array.isArray(integrations)) return [];
  return integrations.map((item: any) => {
    const processed = { ...item };
    if (item.apiKey && !isEncrypted(item.apiKey)) {
      try {
        processed.apiKey = encrypt(item.apiKey);
      } catch (e) {
        console.error('[CRYPTO] Failed to encrypt API key:', e);
      }
    }
    return processed;
  });
}

// ─── Derived permissions wrapper ─────────────────────────────────────────

export async function enrichUserWithDerivedPermissions(user: User): Promise<User> {
  return enrichUserShared(user);
}
