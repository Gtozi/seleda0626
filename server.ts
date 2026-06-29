import './src/server/env';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { User, UserRole } from './src/types/erp';
import { hasSupabaseAdminConfig, supabaseAdmin } from './src/server/supabaseAdmin';

if (typeof globalThis.DOMException === 'undefined') {
  // @ts-ignore
  import('node-domexception').then((mod) => {
    globalThis.DOMException = mod.default;
  }).catch(() => {});
}

const SESSION_COOKIE = 'hotel_erp_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const DEFAULT_PASSWORD = process.env.DEV_LOGIN_PASSWORD || 'admin123';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1000 * 60 * 30; // 30 minutes
const FORCE_FALLBACK_AUTH = process.env.FORCE_FALLBACK_AUTH === 'true';

/** Convert camelCase object keys to snake_case for Supabase column names */
function camelToSnakeRecord(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snake] = value;
  }
  return result;
}

/** Convert snake_case object keys to camelCase for frontend consumption */
function snakeToCamelRecord(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camel = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camel] = value;
  }
  return result;
}

/** Known global_settings columns – strips unknown keys to prevent DB errors */
const KNOWN_GLOBAL_SETTINGS_COLUMNS = new Set([
  'id', 'custom_hotel_name', 'custom_hotel_address', 'hotel_tin', 'hotel_vat_no', 'hotel_vat_date',
  'tax_percent', 'service_charge_percent', 'exchange_rate', 'hero_image_url', 'contact_phone', 'contact_email',
  'hotel_logo', 'check_in_time', 'check_out_time', 'star_rating',
  'public_tagline', 'social_links', 'invoice_template', 'invoice_footer_text', 'invoice_bank_details',
  'payment_types', 'addon_charges', 'pos_categories', 'pos_outlets', 'pos_printers', 'pos_outlet_categories',
  'split_folio_rules', 'loyalty_points_per_dollar', 'loyalty_redemption_rate', 'cancellation_grace_hours',
  'cancellation_penalty_percent', 'credit_limit_default', 'vip_spend_threshold', 'auto_night_audit_time',
  'operating_hours', 'revenue_mappings', 'room_types', 'room_features', 'guest_statuses',
  'inventory_categories', 'inventory_locations', 'inventory_units', 'floors', 'departments',
  'session_timeout', 'password_complexity', 'maintenance_mode', 'maintenance_message',
  'public_booking_enabled', 'guest_portal_enabled', 'module_toggles', 'allowed_ips',
  'backup_frequency', 'system_log_level', 'api_integrations', 'terms_adventure_liability',
  'terms_waitlist_protocol', 'terms_conservation_devotion', 'terms_billing_cancellation',
  'terms_wilderness_emergency', 'booking_terms', 'policy_sections', 'fee_components', 'public_page_content',
  'force_mfa', 'strict_password_rotation', 'biometric_reauth', 'isolation_policy',
  'created_at', 'updated_at', 'created_by', 'updated_by',
]);

function filterKnownColumns(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (KNOWN_GLOBAL_SETTINGS_COLUMNS.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

// =====================
// Public booking helpers
// =====================

function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  const aStart = new Date(aIn).getTime();
  const aEnd = new Date(aOut).getTime();
  const bStart = new Date(bIn).getTime();
  const bEnd = new Date(bOut).getTime();
  if ([aStart, aEnd, bStart, bEnd].some(t => isNaN(t))) return false;
  return aStart < bEnd && bStart < aEnd;
}

function getTypeAvailability(
  roomType: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: any[],
  reservations: any[],
  excludeReservationId?: string
) {
  const capacity = rooms.filter((r: any) => r.type === roomType).length;
  const booked = reservations.filter((res: any) =>
    res.id !== excludeReservationId &&
    res.room_type === roomType &&
    (res.status === 'Confirmed' || res.status === 'CheckedIn') &&
    rangesOverlap(checkInDate, checkOutDate, res.check_in_date, res.check_out_date)
  ).length;
  return { roomType, capacity, booked, available: Math.max(0, capacity - booked) };
}

function getRoomImageUrl(type: string): string {
  const map: Record<string, string> = {
    Single: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    Double: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    Deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    Suite: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    Penthouse: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200',
  };
  return map[type] || map.Deluxe;
}

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
  housekeeping: ['room:status:update', 'reports:view'],
  'f&b': ['folio:charge:add', 'folio:payment:add', 'reports:view'],
  maintenance: ['room:status:update', 'reports:view'],
  inventory: ['inventory:stock:adjust', 'inventory:transfer:create', 'reports:view', 'reports:export'],
  finance: ['folio:charge:void', 'folio:payment:void', 'rates:view', 'rates:update', 'settings:tax:update', 'audit:view', 'reports:view', 'reports:export', 'finance:journal:create', 'finance:journal:post', 'finance:period:close'],
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
const fallbackAuditEvents: unknown[] = [];

/** Hard-coded test users for development when no Supabase database is configured.
 *  Password for all accounts defaults to the DEV_LOGIN_PASSWORD env var or 'admin123'. */
const fallbackUsers: Record<string, User & { password: string }> = {
  'frontoffice@erp.com': {
    id: 'U-101', name: 'Front Office Supervisor', email: 'frontoffice@erp.com',
    role: 'frontoffice', roleDescription: 'Night Auditor', avatarInitials: 'FO',
    status: 'Active', allowedTabs: ['frontoffice', 'settings'],
    allowedSettings: { viewRatePlans: true, viewRoomOutlook: true, viewSalesCampaigns: true },
    password: DEFAULT_PASSWORD,
  },
  'housekeeping@erp.com': {
    id: 'U-102', name: 'Housekeeping Manager', email: 'housekeeping@erp.com',
    role: 'housekeeping', roleDescription: 'HK Supervisor', avatarInitials: 'HK',
    status: 'Active', allowedTabs: ['housekeeping', 'settings'],
    allowedSettings: { viewRoomOutlook: true },
    password: DEFAULT_PASSWORD,
  },
  'fb@erp.com': {
    id: 'U-103', name: 'F&B Director', email: 'fb@erp.com',
    role: 'f&b', roleDescription: 'Culinary Director', avatarInitials: 'FB',
    status: 'Active', allowedTabs: ['f&b', 'settings'],
    allowedSettings: { viewRoomOutlook: true },
    password: DEFAULT_PASSWORD,
  },
  'maintenance@erp.com': {
    id: 'U-104', name: 'Chief Engineer', email: 'maintenance@erp.com',
    role: 'maintenance', roleDescription: 'Chief Engineer', avatarInitials: 'CE',
    status: 'Active', allowedTabs: ['maintenance', 'settings'],
    allowedSettings: { viewRoomOutlook: true },
    password: DEFAULT_PASSWORD,
  },
  'gm@erp.com': {
    id: 'U-105', name: 'General Manager', email: 'gm@erp.com',
    role: 'executive', roleDescription: 'General Manager', avatarInitials: 'GM',
    status: 'Active', allowedTabs: ['executive', 'settings'],
    allowedSettings: { editGlobalSettings: true, adjustHotelTaxes: true, bypassHousekeepingLock: true, manageUserAccounts: true, viewRatePlans: true, editRatePlans: true, viewRoomOutlook: true, viewSalesCampaigns: true, manageSalesCampaigns: true },
    password: DEFAULT_PASSWORD,
  },
  'finance@erp.com': {
    id: 'U-106', name: 'Finance Controller', email: 'finance@erp.com',
    role: 'finance', roleDescription: 'Finance Controller', avatarInitials: 'FC',
    status: 'Active', allowedTabs: ['finance', 'settings'],
    allowedSettings: { viewRatePlans: true, editRatePlans: true, adjustHotelTaxes: true },
    password: DEFAULT_PASSWORD,
  },
  'hr@erp.com': {
    id: 'U-107', name: 'HR Manager', email: 'hr@erp.com',
    role: 'hr', roleDescription: 'HR Manager', avatarInitials: 'HR',
    status: 'Active', allowedTabs: ['hr', 'settings'],
    allowedSettings: { manageUserAccounts: true },
    password: DEFAULT_PASSWORD,
  },
  'inventory@erp.com': {
    id: 'U-108', name: 'Inventory Manager', email: 'inventory@erp.com',
    role: 'inventory', roleDescription: 'Stores Manager', avatarInitials: 'IM',
    status: 'Active', allowedTabs: ['inventory', 'settings'],
    allowedSettings: {},
    password: DEFAULT_PASSWORD,
  },
  'procurement@erp.com': {
    id: 'U-109', name: 'Procurement Lead', email: 'procurement@erp.com',
    role: 'procurement', roleDescription: 'Procurement Lead', avatarInitials: 'PL',
    status: 'Active', allowedTabs: ['procurement', 'settings'],
    allowedSettings: {},
    password: DEFAULT_PASSWORD,
  },
  'admin@erp.com': {
    id: 'U-110', name: 'System Administrator', email: 'admin@erp.com',
    role: 'admin', roleDescription: 'System Administrator', avatarInitials: 'SA',
    status: 'Active', allowedTabs: ['admin', 'settings'],
    allowedSettings: { editGlobalSettings: true, adjustHotelTaxes: true, bypassHousekeepingLock: true, manageUserAccounts: true, manageRoles: true, viewRatePlans: true, editRatePlans: true, viewRoomOutlook: true, viewSalesCampaigns: true, manageSalesCampaigns: true },
    password: DEFAULT_PASSWORD,
  },
};

function parseCookies(header?: string) {
  return Object.fromEntries((header || '').split(';').map(part => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }).filter(([key]) => key));
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRawSessionCookie(res: express.Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function clearSessionCookie(res: express.Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

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

function normalizePermission(action: string) {
  return legacyPermissionMap[action] || action;
}

/**
 * Derive legacy allowedTabs and allowedSettings from normalized permission codes.
 * This merges the legacy flat permission model into the normalized permissions model
 * so that the client receives a single unified view.
 */
type AllowedTab = NonNullable<User['allowedTabs']>[number];

function deriveLegacyPermissions(permissionCodes: string[]): { allowedTabs: AllowedTab[]; allowedSettings: Record<string, boolean> } {
  const allowedTabs = new Set<AllowedTab>();
  const allowedSettings: Record<string, boolean> = {};

  const tabMapping: Record<string, AllowedTab[]> = {
    'rates:view': ['finance'],
    'rates:update': ['finance'],
    'room:status:update': ['housekeeping', 'maintenance'],
    'folio:charge:add': ['finance'],
    'folio:charge:void': ['finance'],
    'folio:payment:add': ['finance'],
    'folio:payment:void': ['finance'],
    'users:manage': ['admin', 'hr'],
    'roles:manage': ['admin'],
    'audit:view': ['admin', 'finance'],
    'settings:update': ['admin', 'settings'],
    'settings:tax:update': ['admin', 'finance'],
    'reports:view': ['finance', 'executive'],
    'reports:export': ['finance', 'executive'],
    'inventory:view': ['inventory'],
    'inventory:manage': ['inventory'],
    'procurement:view': ['procurement'],
    'procurement:manage': ['procurement'],
    'hr:view': ['hr'],
    'hr:manage': ['hr'],
  };

  const settingMapping: Record<string, string> = {
    'rates:view': 'viewRatePlans',
    'rates:update': 'editRatePlans',
    'room:status:update': 'viewRoomOutlook',
    'reservation:create': 'viewRoomOutlook',
    'reservation:check_in': 'viewRoomOutlook',
    'users:manage': 'manageUserAccounts',
    'settings:update': 'editGlobalSettings',
    'settings:tax:update': 'adjustHotelTaxes',
    'folio:payment:void': 'voidTransactions',
    'audit:view': 'accessAuditLogs',
  };

  for (const code of permissionCodes) {
    const tabs = tabMapping[code];
    if (tabs) tabs.forEach(t => allowedTabs.add(t));
    const setting = settingMapping[code];
    if (setting) allowedSettings[setting] = true;
  }

  return { allowedTabs: Array.from(allowedTabs), allowedSettings };
}

/**
 * Fetch normalized role permissions for a user and derive legacy allowedTabs/allowedSettings.
 * This unifies the permission model so the client works with a single source of truth.
 */
async function enrichUserWithDerivedPermissions(user: User): Promise<User> {
  // Apply role-based access control regardless of Supabase configuration
  // System admin must only access admin portal
  if (user.role === 'system_admin' || user.role === 'admin') {
    return {
      ...user,
      allowedTabs: ['admin', 'settings'] as AllowedTab[],
      allowedSettings: { ...(user.allowedSettings || {}) },
    };
  }
  
  // GM/executive accounts must only access executive, never operational departments or admin
  if (user.role === 'general_manager' || user.role === 'gm' || user.role === 'owner' || user.role === 'executive') {
    return {
      ...user,
      allowedTabs: ['executive', 'settings'] as AllowedTab[],
      allowedSettings: { ...(user.allowedSettings || {}) },
    };
  }
  
  // Operational roles restricted to their specific department only
  const roleToTab: Record<string, AllowedTab[]> = {
    'frontoffice': ['frontoffice'],
    'housekeeping': ['housekeeping'],
    'f&b': ['f&b'],
    'maintenance': ['maintenance'],
    'inventory': ['inventory'],
    'finance': ['finance'],
    'hr': ['hr'],
    'procurement': ['procurement'],
  };
  
  if (roleToTab[user.role]) {
    return {
      ...user,
      allowedTabs: roleToTab[user.role],
      allowedSettings: { ...(user.allowedSettings || {}) },
    };
  }

  // If Supabase is configured, fetch additional permissions from database
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return user;
  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('roles (is_superuser, role_permissions (permissions (code)))')
      .eq('user_id', user.id);
    if (error || !data || data.length === 0) return user;

    const codes: string[] = [];
    let isSuper = false;
    data.forEach((row: any) => {
      const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
      if (role?.is_superuser) isSuper = true;
      role?.role_permissions?.forEach((rp: any) => {
        const perm = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
        if (perm?.code) codes.push(perm.code);
      });
    });

    const derived = deriveLegacyPermissions(codes);
    
    return {
      ...user,
      allowedTabs: isSuper
        ? (['frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'admin', 'procurement', 'settings'] as AllowedTab[])
        : (derived.allowedTabs.length > 0 ? derived.allowedTabs : user.allowedTabs),
      allowedSettings: { ...(derived.allowedSettings || {}), ...(user.allowedSettings || {}) },
    };
  } catch {
    return user;
  }
}

async function writeAuditEvent(params: {
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

  fallbackAuditEvents.push({ timestamp: new Date().toISOString(), ...event });
}

async function createSession(user: User, req: express.Request, res: express.Response) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  if (!FORCE_FALLBACK_AUTH && hasSupabaseAdminConfig && supabaseAdmin) {
    await supabaseAdmin.from('user_sessions').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      token_hash: hashToken(token),
      expires_at: expiresAt.toISOString(),
      user_agent: req.headers['user-agent'] || null,
      ip_address: req.ip,
    });
  } else {
    fallbackSessions.set(hashToken(token), { user, expiresAt: expiresAt.getTime() });
  }

  setRawSessionCookie(res, token);
}

async function getRequestUser(req: express.Request): Promise<User | null> {
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

async function revokeRequestSession(req: express.Request) {
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

async function authenticateUser(email: string, password: string, req: express.Request): Promise<{ user?: User; error?: string; status: number; forcePasswordChange?: boolean }> {
  if (!FORCE_FALLBACK_AUTH && hasSupabaseAdminConfig && supabaseAdmin) {
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

    await supabaseAdmin
      .from('system_users')
      .update({ failed_login_count: 0, last_login: new Date().toISOString() })
      .eq('id', dbUser.id);

    const user = mapSystemUserFromDb(dbUser);
    user.lastLogin = new Date().toISOString();
    const forcePasswordChange = dbUser.force_password_change === true;
    return { status: 200, user, forcePasswordChange };
  }

  // Fallback auth for development / testing without a database
  const fallbackUser = fallbackUsers[email];
  if (fallbackUser && password === fallbackUser.password) {
    const { password: _, ...userWithoutPassword } = fallbackUser;
    const user: User = { ...userWithoutPassword, lastLogin: new Date().toISOString() };
    return { status: 200, user, forcePasswordChange: false };
  }

  return { status: 401, error: 'Invalid credentials' };
}

async function userCan(user: User | null, action: string) {
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

async function ensurePendingAdminChangesTable() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    // Check if table exists by selecting with limit 0
    const { error } = await supabaseAdmin.from('pending_admin_changes').select('id').limit(0);
    if (error && error.code === '42P01') {
      // Table does not exist — create it via a raw query workaround
      // Use the REST /sql endpoint available in Supabase's pg proxy
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

async function ensureAuditEventsTable() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from('audit_events').select('id').limit(0);
    if (error && error.code === '42P01') {
      const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ query: `CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), user_id TEXT, user_name TEXT, action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, module TEXT, ip_address TEXT, user_agent TEXT, outcome TEXT NOT NULL DEFAULT 'success', details JSONB NOT NULL DEFAULT '{}'::jsonb); CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC); CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);` }),
      }).catch(() => null);
    }
  } catch (_) {}
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  await ensurePendingAdminChangesTable();
  await ensureAuditEventsTable();

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      system: 'Hotel Management ERP Global Node',
      authStore: (FORCE_FALLBACK_AUTH || !hasSupabaseAdminConfig) ? 'development-fallback' : 'database',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const auth = await authenticateUser(email, password, req);

    if (!auth.user) return res.status(auth.status).json({ error: auth.error || 'Invalid credentials' });

    const enrichedUser = await enrichUserWithDerivedPermissions(auth.user);
    await createSession(enrichedUser, req, res);
    await writeAuditEvent({ req, user: enrichedUser, action: 'login.success', module: 'auth', details: { forcePasswordChange: auth.forcePasswordChange } });
    res.json({ user: enrichedUser, forcePasswordChange: auth.forcePasswordChange || false });
  });

  app.post('/api/auth/logout', async (req, res) => {
    const user = await getRequestUser(req);
    if (user) await writeAuditEvent({ req, user, action: 'logout.success', module: 'auth' });
    await revokeRequestSession(req);
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.get('/api/auth/verify', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const enriched = await enrichUserWithDerivedPermissions(user);
    res.json({ user: enriched });
  });

  app.post('/api/auth/refresh', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    // Validate user account status before refreshing session
    if (user.status === 'Inactive' || user.status === 'Pending' || user.status === 'Suspended' || user.status === 'Locked') {
      await revokeRequestSession(req);
      clearSessionCookie(res);
      return res.status(403).json({ error: `Account is ${user.status}` });
    }
    
    // Fetch fresh user data from database to ensure no account switching
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser, error } = await supabaseAdmin
        .from('system_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error || !dbUser || dbUser.id !== user.id) {
        await revokeRequestSession(req);
        clearSessionCookie(res);
        return res.status(401).json({ error: 'Account not found or invalid' });
      }
      
      if (dbUser.status !== 'Active') {
        await revokeRequestSession(req);
        clearSessionCookie(res);
        return res.status(403).json({ error: `Account is ${dbUser.status}` });
      }
    }
    
    await revokeRequestSession(req);
    await createSession(user, req, res);
    res.json({ success: true });
  });

  app.post('/api/auth/validate-permission', async (req, res) => {
    const user = await getRequestUser(req);
    const action = String(req.body?.action || '');
    const allowed = await userCan(user, action);
    if (!allowed) {
      await writeAuditEvent({ req, user, action: 'permission.denied', module: 'auth', outcome: 'denied', details: { requestedAction: action, permissionCode: normalizePermission(action) } });
    }
    res.status(user ? 200 : 401).json({ allowed, reason: allowed ? undefined : user ? 'Insufficient privileges' : 'Not authenticated' });
  });

  app.post('/api/audit/permission-denial', async (req, res) => {
    const user = await getRequestUser(req);
    await writeAuditEvent({ req, user, action: 'permission.denial_reported', module: 'auth', outcome: 'denied', details: { requestedAction: req.body?.action, reason: req.body?.reason } });
    res.json({ success: true });
  });

  app.post('/api/audit/log', async (req, res) => {
    const user = await getRequestUser(req);
    const body = req.body || {};
    await writeAuditEvent({
      req,
      user,
      action: body.action || 'client.audit',
      module: body.module || 'client',
      entityType: body.entityType || null,
      entityId: body.recordId || body.entityId || null,
      details: { details: body.details, clientTimestamp: body.timestamp }
    });
    res.json({ success: true });
  });

  app.get('/api/audit/events', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const limit = Math.min(Number(req.query.limit) || 500, 1000);
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      let { data, error } = await supabaseAdmin
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error && error.code === '42P01') {
        await ensureAuditEventsTable();
        const result = await supabaseAdmin
          .from('audit_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        data = result.data;
        error = result.error;
      }
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data || []);
    }
    return res.json(fallbackAuditEvents.slice(-limit));
  });

  app.post('/api/auth/change-password', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash').eq('id', user.id).maybeSingle();
      if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });
      const passwordOk = await bcrypt.compare(currentPassword, dbUser.password_hash);
      if (!passwordOk) {
        await writeAuditEvent({ req, user, action: 'password.change.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_current_password' } });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await supabaseAdmin.from('system_users').update({ password_hash: newHash, password_updated_at: new Date().toISOString(), force_password_change: false }).eq('id', user.id);
      await writeAuditEvent({ req, user, action: 'password.change.success', module: 'auth' });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/auth/request-reset', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('id').eq('email', email).maybeSingle();
      if (dbUser) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
        await supabaseAdmin.from('system_users').update({ password_reset_token: token, password_reset_expires: expiresAt.toISOString() }).eq('id', dbUser.id);
      }
      await writeAuditEvent({ req, action: 'password.reset_requested', module: 'auth', details: { email } });
      return res.json({ success: true, message: 'If an account exists, a reset link has been generated.' });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword are required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('id, password_reset_expires').eq('password_reset_token', token).maybeSingle();
      if (!dbUser || !dbUser.password_reset_expires || new Date(dbUser.password_reset_expires).getTime() < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await supabaseAdmin.from('system_users').update({ password_hash: newHash, password_updated_at: new Date().toISOString(), force_password_change: false, password_reset_token: null, password_reset_expires: null }).eq('id', dbUser.id);
      await writeAuditEvent({ req, action: 'password.reset.success', module: 'auth', details: { userId: dbUser.id } });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/auth/verify-mfa', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'MFA code is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('mfa_enabled').eq('id', user.id).maybeSingle();
      if (!dbUser?.mfa_enabled) return res.json({ success: true, user });
      if (!/^\d{6}$/.test(String(code))) return res.status(400).json({ error: 'Invalid MFA code format' });
      await writeAuditEvent({ req, user, action: 'mfa.verified', module: 'auth' });
      return res.json({ success: true, user });
    }
    return res.json({ success: true, user });
  });

  app.post('/api/auth/verify-password', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash').eq('id', user.id).maybeSingle();
      if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });
      const passwordOk = await bcrypt.compare(password, dbUser.password_hash);
      if (!passwordOk) {
        await writeAuditEvent({ req, user, action: 'password.verify.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_password' } });
        return res.status(401).json({ error: 'Incorrect password' });
      }
      await writeAuditEvent({ req, user, action: 'password.verify.success', module: 'auth' });
      return res.json({ success: true });
    }
    // Development fallback: accept any non-empty password when database is not configured
    if (password.length > 0) {
      await writeAuditEvent({ req, user, action: 'password.verify.success', module: 'auth', details: { mode: 'development-fallback' } });
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Password is required' });
  });

  // =====================
  // Admin API — Users, Roles, Settings
  // =====================

  app.get('/api/admin/users', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'users:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('system_users').select('*').order('name');
      if (error) return res.status(500).json({ error: error.message });
      const mapped = (data || []).map(mapSystemUserFromDb);
      const enriched = await Promise.all(mapped.map(u => enrichUserWithDerivedPermissions(u)));
      return res.json({ users: enriched });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/admin/users', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'users:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const body = req.body || {};
    if (!body.name || !body.email || !body.role) return res.status(400).json({ error: 'name, email, and role are required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const newId = body.id || `U-${Date.now()}`;
      const newHash = await bcrypt.hash(body.password || 'ChangeMe123!', 10);
      const { data, error } = await supabaseAdmin.from('system_users').insert({
        id: newId,
        name: body.name,
        email: String(body.email).toLowerCase(),
        role: body.role,
        role_description: body.roleDescription || body.role,
        avatar_initials: body.avatarInitials || body.name?.slice(0, 2).toUpperCase() || 'U',
        status: body.status || 'Active',
        employee_id: body.employeeId || null,
        username: body.username || null,
        mobile_number: body.mobileNumber || null,
        department: body.department || null,
        custom_role_id: body.customRoleId || null,
        security_settings: body.securitySettings || {},
        data_restrictions: body.dataRestrictions || {},
        allowed_tabs: body.allowedTabs || [],
        allowed_settings: body.allowedSettings || {},
        permission_matrix: body.permissionMatrix || {},
        password_hash: newHash,
        force_password_change: true
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user, action: 'user.created', entityType: 'User', entityId: newId, module: 'admin', details: { name: body.name, email: body.email, role: body.role } });
      return res.json({ success: true, user: mapSystemUserFromDb(data) });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/admin/users/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'users:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const targetId = req.params.id;
    const updates = req.body || {};
    if (user.id === targetId) {
      if (updates.role !== undefined || updates.allowedTabs !== undefined || updates.allowedSettings !== undefined || updates.permissionMatrix !== undefined) {
        return res.status(403).json({ error: 'You cannot modify your own role or permissions' });
      }
    }
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.email !== undefined) payload.email = String(updates.email).toLowerCase();
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.roleDescription !== undefined) payload.role_description = updates.roleDescription;
      if (updates.avatarInitials !== undefined) payload.avatar_initials = updates.avatarInitials;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.employeeId !== undefined) payload.employee_id = updates.employeeId || null;
      if (updates.username !== undefined) payload.username = updates.username || null;
      if (updates.mobileNumber !== undefined) payload.mobile_number = updates.mobileNumber || null;
      if (updates.department !== undefined) payload.department = updates.department || null;
      if (updates.customRoleId !== undefined) payload.custom_role_id = updates.customRoleId || null;
      if (updates.securitySettings !== undefined) payload.security_settings = updates.securitySettings;
      if (updates.dataRestrictions !== undefined) payload.data_restrictions = updates.dataRestrictions;
      if (updates.allowedTabs !== undefined) payload.allowed_tabs = updates.allowedTabs;
      if (updates.allowedSettings !== undefined) payload.allowed_settings = updates.allowedSettings;
      if (updates.permissionMatrix !== undefined) payload.permission_matrix = updates.permissionMatrix;
      if (updates.password) {
        payload.password_hash = await bcrypt.hash(updates.password, 10);
        payload.force_password_change = false;
        payload.password_updated_at = new Date().toISOString();
      }
      const { data, error } = await supabaseAdmin.from('system_users').update(payload).eq('id', targetId).select().single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user, action: 'user.updated', entityType: 'User', entityId: targetId, module: 'admin', details: { updates: Object.keys(updates) } });
      return res.json({ success: true, user: mapSystemUserFromDb(data) });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'users:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const targetId = req.params.id;
    if (user.id === targetId) return res.status(403).json({ error: 'You cannot delete your own account' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('system_users').delete().eq('id', targetId);
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user, action: 'user.deleted', entityType: 'User', entityId: targetId, module: 'admin' });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/admin/roles', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'roles:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('custom_roles').select('*').order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ roles: data || [] });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/admin/roles', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'roles:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ error: 'name is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const roleId = body.id || `ROLE-${Date.now()}`;
      const { data, error } = await supabaseAdmin.from('custom_roles').upsert({
        id: roleId,
        name: body.name,
        description: body.description || '',
        department: body.department || '',
        module_permissions: body.modulePermissions || {},
        tab_permissions: body.tabPermissions || {},
        button_permissions: body.buttonPermissions || {},
        field_permissions: body.fieldPermissions || {},
        is_system: body.isSystem || false
      }, { onConflict: 'id' }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      const isNew = body.id ? false : true;
      await writeAuditEvent({ req, user, action: isNew ? 'role.created' : 'role.updated', entityType: 'CustomRole', entityId: data.id, module: 'admin', details: { name: body.name } });
      return res.json({ success: true, role: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/admin/roles/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'roles:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const roleId = req.params.id;
    const updates = req.body || {};
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.modulePermissions !== undefined) payload.module_permissions = updates.modulePermissions;
      if (updates.tabPermissions !== undefined) payload.tab_permissions = updates.tabPermissions;
      if (updates.buttonPermissions !== undefined) payload.button_permissions = updates.buttonPermissions;
      if (updates.fieldPermissions !== undefined) payload.field_permissions = updates.fieldPermissions;
      if (updates.isSystem !== undefined) payload.is_system = updates.isSystem;
      const { data, error } = await supabaseAdmin.from('custom_roles').update(payload).eq('id', roleId).select().single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user, action: 'role.updated', entityType: 'CustomRole', entityId: roleId, module: 'admin', details: { updates: Object.keys(updates) } });
      return res.json({ success: true, role: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/admin/roles/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'roles:manage'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const roleId = req.params.id;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('custom_roles').delete().eq('id', roleId);
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user, action: 'role.deleted', entityType: 'CustomRole', entityId: roleId, module: 'admin' });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/admin/settings', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('global_settings').select('*').maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ settings: data ? snakeToCamelRecord(data) : {} });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Endpoint specifically for updating public page content (more relaxed permissions)
  app.patch('/api/admin/public-booking-content', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    console.log('User attempting to update public content:', user.id, user.role, user.username);

    const { publicPageContent } = req.body || {};
    console.log('Received publicPageContent:', JSON.stringify(publicPageContent, null, 2));
    
    if (!publicPageContent) {
      return res.status(400).json({ error: 'publicPageContent is required' });
    }

    // Convert camelCase to snake_case for database
    const convertedContent = camelToSnakeRecord(publicPageContent);
    console.log('Converted content for database:', JSON.stringify(convertedContent, null, 2));

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin.from('global_settings').select('id').maybeSingle();
      if (existing) {
        const { data, error } = await supabaseAdmin.from('global_settings').update({
          public_page_content: convertedContent,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }).eq('id', existing.id).select().single();
        if (error) {
          console.error('Error updating public content:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Successfully updated public content. Result:', JSON.stringify(data, null, 2));
        await writeAuditEvent({ req, user, action: 'public_content.updated', entityType: 'GlobalSettings', entityId: existing.id, module: 'admin', details: { updates: 'publicPageContent' } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      } else {
        const { data, error } = await supabaseAdmin.from('global_settings').insert({
          public_page_content: convertedContent,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }).select().single();
        if (error) {
          console.error('Error inserting public content:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Successfully inserted public content. Result:', JSON.stringify(data, null, 2));
        await writeAuditEvent({ req, user, action: 'public_content.updated', entityType: 'GlobalSettings', entityId: data.id, module: 'admin', details: { updates: 'publicPageContent' } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      }
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Public Booking API
  // =====================

  app.get('/api/public/settings', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data, error } = await supabaseAdmin.from('global_settings').select('*').maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.json({ settings: {} });
    
    // Parse fee components from business admin
    const feeComponents = data.fee_components || [];
    const vatFee = feeComponents.find((f: any) => f.name.toLowerCase().includes('vat') && f.isEnabled);
    const scFee = feeComponents.find((f: any) => f.name.toLowerCase().includes('service charge') && f.isEnabled);
    
    // Parse operating hours
    const operatingHours = data.operating_hours || {};
    
    return res.json({
      settings: {
        customHotelName: data.custom_hotel_name || '',
        customHotelAddress: data.custom_hotel_address || '',
        publicTagline: data.public_tagline || '',
        heroImageUrl: data.hero_image_url && !data.hero_image_url.startsWith('/src')
          ? data.hero_image_url
          : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920',
        hotelLogo: data.hotel_logo || '',
        contactPhone: data.contact_phone || '',
        contactEmail: data.contact_email || '',
        taxPercent: vatFee ? vatFee.value : (data.tax_percent || 0),
        serviceChargePercent: scFee ? scFee.value : (data.service_charge_percent || 0),
        exchangeRate: data.exchange_rate || 1,
        publicBookingEnabled: data.public_booking_enabled ?? true,
        maintenanceMode: data.maintenance_mode ?? false,
        maintenanceMessage: data.maintenance_message || '',
        bookingTerms: data.booking_terms || '',
        // Business admin extended fields
        hotelTin: data.hotel_tin || '',
        hotelVatNo: data.hotel_vat_no || '',
        checkInTime: data.check_in_time || '01:00 PM',
        checkOutTime: data.check_out_time || '10:00 AM',
        starRating: '5',
        // Fee components for detailed pricing
        feeComponents: feeComponents.map((f: any) => ({
          id: f.id,
          name: f.name,
          feeType: f.feeType,
          value: f.value,
          isEnabled: f.isEnabled
        })),
        // Policy sections
        policySections: data.policy_sections || [],
        cancellationGraceHours: data.cancellation_grace_hours || 24,
        cancellationPenaltyPercent: data.cancellation_penalty_percent || 50
      }
    });
  });

  app.get('/api/public/rooms', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const checkIn = String(req.query.checkIn || '');
    const checkOut = String(req.query.checkOut || '');
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut are required' });
    }

    const [{ data: roomTypes, error: rtError }, { data: rooms, error: roomsError }, { data: reservations, error: resError }] = await Promise.all([
      supabaseAdmin.from('room_types').select('*').eq('is_active', true),
      supabaseAdmin.from('rooms').select('*'),
      supabaseAdmin.from('reservations').select('*')
    ]);
    if (rtError) return res.status(500).json({ error: rtError.message });
    if (roomsError) return res.status(500).json({ error: roomsError.message });
    if (resError) return res.status(500).json({ error: resError.message });

    const roomTypesList = roomTypes || [];
    const roomsList = rooms || [];
    const reservationsList = reservations || [];

    const result = roomTypesList.map((rt: any) => {
      const roomsOfType = roomsList.filter((r: any) => r.room_type_id === rt.id || r.type === rt.name);
      const availability = getTypeAvailability(rt.name, checkIn, checkOut, roomsList, reservationsList);
      return {
        type: rt.id, // Use room_type_id as the type identifier
        title: rt.name,
        description: rt.description || `${rt.name} room`,
        rate: rt.base_price,
        capacity: rt.max_occupancy,
        available: availability.available,
        features: rt.amenities || [],
        imageUrl: rt.image_url_1 || getRoomImageUrl(rt.name),
        imageUrl2: rt.image_url_2 || null,
        imageUrl3: rt.image_url_3 || null,
        roomSizeSqm: rt.room_size_sqm,
        bedConfiguration: rt.bed_configuration,
        displayOrder: rt.display_order || 0,
        totalRooms: availability.capacity,
        // Additional fields from executive portal room inventory
        isActive: rt.is_active !== false,
      };
    }).filter((rt: any) => rt.available > 0).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    return res.json({ rooms: result });
  });

  app.get('/api/public/packages', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data, error } = await supabaseAdmin.from('packages').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({
      packages: (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        chargeFrequency: p.charge_frequency || 'once',
      }))
    });
  });

  app.get('/api/public/guest-services', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data, error } = await supabaseAdmin.from('guest_services').select('*').eq('available', true);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({
      guestServices: (data || []).map((gs: any) => ({
        id: gs.id,
        name: gs.name,
        description: gs.description || '',
        category: gs.category || 'dining',
        price: Number(gs.price),
        available: gs.available,
      }))
    });
  });

  app.post('/api/public/bookings', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { checkIn, checkOut, guestName, guestEmail, guestPhone, guestNationality, packageIds, guestServiceIds, specialRequests, items, airportShuttleDetails } = req.body || {};

    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      return res.status(400).json({ error: 'checkIn, checkOut, guestName, guestEmail are required' });
    }

    const cartItems = Array.isArray(items) && items.length > 0 ? items : [];
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'At least one room is required' });
    }

    const [{ data: roomTypes }, { data: rooms }, { data: reservations }, { data: settings }, { data: packages }, { data: guestServices }] = await Promise.all([
      supabaseAdmin.from('room_types').select('*'),
      supabaseAdmin.from('rooms').select('*'),
      supabaseAdmin.from('reservations').select('*'),
      supabaseAdmin.from('global_settings').select('*').maybeSingle(),
      supabaseAdmin.from('packages').select('*'),
      supabaseAdmin.from('guest_services').select('*')
    ]);

    const roomTypesList = roomTypes || [];
    const roomsList = rooms || [];
    const reservationsList = reservations || [];
    const taxPercent = settings?.tax_percent || 0;
    const serviceChargePercent = settings?.service_charge_percent || 0;
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    const packageIdsList: string[] = Array.isArray(packageIds) ? packageIds : (packageIds ? [packageIds] : []);
    const guestServiceIdsList: string[] = Array.isArray(guestServiceIds) ? guestServiceIds : (guestServiceIds ? [guestServiceIds] : []);

    // Validate availability and compute pricing per item
    const enrichedItems = [];
    let roomSubtotal = 0;
    for (const item of cartItems) {
      const roomTypeId = item.roomType;
      const roomType = roomTypesList.find((rt: any) => rt.id === roomTypeId);
      if (!roomType) {
        return res.status(400).json({ error: `Room type ${roomTypeId} not found` });
      }
      const qty = Math.max(1, Number(item.quantity) || 1);
      const availability = getTypeAvailability(roomType.name, checkIn, checkOut, roomsList, reservationsList);
      if (availability.available < qty) {
        return res.status(409).json({ error: `Only ${availability.available} ${roomType.name} room${availability.available === 1 ? '' : 's'} available for selected dates` });
      }
      const rate = roomType.base_price;
      const itemRoomTotal = rate * nights * qty;
      roomSubtotal += itemRoomTotal;
      enrichedItems.push({ roomTypeId, roomTypeName: roomType.name, qty, rate, itemRoomTotal, adults: Number(item.adults) || 1, children: Number(item.children) || 0 });
    }

    let packageTotal = 0;
    for (const pid of packageIdsList) {
      const pkg = (packages || []).find((p: any) => p.id === pid);
      if (pkg) {
        packageTotal += Number(pkg.price) * (pkg.charge_frequency === 'daily' ? nights : 1);
      }
    }

    let guestServicesTotal = 0;
    for (const gsid of guestServiceIdsList) {
      const gs = (guestServices || []).find((g: any) => g.id === gsid);
      if (gs) {
        guestServicesTotal += Number(gs.price);
      }
    }

    const subtotal = roomSubtotal + packageTotal + guestServicesTotal;
    const tax = Math.round(subtotal * (taxPercent / 100));
    const serviceCharge = Math.round(subtotal * (serviceChargePercent / 100));
    const totalAmount = subtotal + tax + serviceCharge;

    const totalRoomCount = enrichedItems.reduce((sum, item) => sum + item.qty, 0);
    const isGroupBooking = true; // All direct website bookings are treated as group bookings pending front desk promotion

    const guestId = `G-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error: guestError } = await supabaseAdmin.from('guests').insert({
      id: guestId,
      name: guestName,
      email: guestEmail,
      phone: guestPhone || '',
      nationality: guestNationality || '',
      status: 'Regular',
      loyalty_points: 0,
      special_requests: specialRequests || '',
      notes: 'Primary contact for direct website booking pending front desk promotion',
      total_spend: 0,
      preferences: {}
    });
    if (guestError) return res.status(500).json({ error: guestError.message });

    const groupBookingId = `GB-${Math.floor(1000 + Math.random() * 9000)}`;
    const primaryRoomType = enrichedItems.length === 1 ? enrichedItems[0].roomTypeName : 'Mixed';
    const { error: groupError } = await supabaseAdmin.from('group_bookings').insert({
      id: groupBookingId,
      group_name: `${guestName} Group`,
      contact_name: guestName,
      contact_email: guestEmail,
      contact_phone: guestPhone || '',
      room_type_needed: primaryRoomType,
      room_count: totalRoomCount,
      check_in_date: checkIn,
      check_out_date: checkOut,
      discount_percent: 0,
      status: 'Pending'
    });
    if (groupError) return res.status(500).json({ error: groupError.message });

    const reservationIds: string[] = [];
    let firstReservation = true;
    let packagesAdded = false;
    let guestServicesAdded = false;
    for (const item of enrichedItems) {
      for (let i = 0; i < item.qty; i++) {
        const baseAmount = item.rate * nights;
        let itemTotal = Math.round(baseAmount * (1 + taxPercent / 100 + serviceChargePercent / 100));
        const charges: any[] = [{ description: 'Room charge', amount: baseAmount, date: new Date().toISOString() }];

        if (firstReservation && packageTotal > 0 && !packagesAdded) {
          itemTotal += Math.round(packageTotal * (1 + taxPercent / 100 + serviceChargePercent / 100));
          charges.push({ description: 'Packages & add-ons', amount: packageTotal, date: new Date().toISOString() });
          packagesAdded = true;
        }

        if (firstReservation && guestServicesTotal > 0 && !guestServicesAdded) {
          itemTotal += Math.round(guestServicesTotal * (1 + taxPercent / 100 + serviceChargePercent / 100));
          charges.push({ description: 'Guest services', amount: guestServicesTotal, date: new Date().toISOString() });
          guestServicesAdded = true;
        }

        const reservationId = `R-${Math.floor(1000 + Math.random() * 9000)}`;
        reservationIds.push(reservationId);
        const { error: resError } = await supabaseAdmin.from('reservations').insert({
          id: reservationId,
          guest_id: guestId,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || '',
          guest_status: 'Regular',
          room_type: item.roomTypeName,
          room_type_id: item.roomTypeId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          adults: item.adults,
          children: item.children,
          status: 'Waitlisted',
          rate: item.rate,
          total_amount: itemTotal,
          channel: 'Direct Website',
          payment_status: 'Unpaid',
          notes: specialRequests || '',
          tax_percent: taxPercent,
          service_charge_percent: serviceChargePercent,
          package_ids: packageIdsList,
          guest_service_ids: guestServiceIdsList,
          guest_services_price: firstReservation ? guestServicesTotal : 0,
          guest_services_revenue: firstReservation && !guestServicesAdded ? Math.round(guestServicesTotal * (1 + taxPercent / 100 + serviceChargePercent / 100)) : 0,
          charges,
          payments: [],
          is_group: isGroupBooking,
          group_booking_id: groupBookingId,
          booking_group_id: groupBookingId
        });
        if (resError) return res.status(500).json({ error: resError.message });
      }
    }

    // Create airport shuttle request if the service is selected and details are provided
    const airportShuttleService = (guestServices || []).find((gs: any) => {
      const name = (gs.name || '').toLowerCase();
      return name.includes('airport') || name.includes('shuttle');
    });
    if (airportShuttleService && guestServiceIdsList.includes(airportShuttleService.id) && airportShuttleDetails && reservationIds.length > 0) {
      const shuttleId = `shuttle_${Date.now()}`;
      const { error: shuttleError } = await supabaseAdmin.from('airport_shuttle_requests').insert({
        id: shuttleId,
        guest_id: guestId,
        reservation_id: reservationIds[0],
        room_number: null,
        scheduled_date: airportShuttleDetails.scheduledDate,
        scheduled_time: airportShuttleDetails.scheduledTime,
        shuttle_type: airportShuttleDetails.shuttleType,
        flight_number: airportShuttleDetails.flightNumber || null,
        flight_time: airportShuttleDetails.flightTime || null,
        status: 'Pending',
        notes: airportShuttleDetails.notes || null
      });
      if (shuttleError) {
        console.error('Error creating airport shuttle request:', shuttleError);
      }
    }

    await writeAuditEvent({
      req,
      action: isGroupBooking ? 'public_group_booking.created' : 'public_booking.created',
      entityType: isGroupBooking ? 'GroupBooking' : 'Reservation',
      entityId: groupBookingId || reservationIds[0] || guestId,
      module: 'public_booking',
      outcome: 'success',
      details: { guestEmail, reservationIds, groupBookingId, checkIn, checkOut, totalAmount, itemCount: cartItems.length, roomCount: totalRoomCount, isGroupBooking }
    });

    return res.json({
      success: true,
      reservationIds,
      guestId,
      totalAmount,
      isGroupBooking,
      groupBookingId,
      status: isGroupBooking ? 'Waitlisted' : 'Confirmed'
    });
  });

  app.patch('/api/admin/settings', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'settings:update'))) return res.status(403).json({ error: 'Insufficient privileges' });
    const updates = filterKnownColumns(camelToSnakeRecord(req.body || {}));
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin.from('global_settings').select('id').maybeSingle();
      if (existing) {
        const { data, error } = await supabaseAdmin.from('global_settings').update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }).eq('id', existing.id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await writeAuditEvent({ req, user, action: 'settings.updated', entityType: 'GlobalSettings', entityId: existing.id, module: 'admin', details: { updates: Object.keys(updates) } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      } else {
        const newId = crypto.randomUUID();
        const { data, error } = await supabaseAdmin.from('global_settings').insert({
          id: newId,
          ...filterKnownColumns(updates),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id,
          updated_by: user.id
        }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await writeAuditEvent({ req, user, action: 'settings.created', entityType: 'GlobalSettings', entityId: newId, module: 'admin', details: { updates: Object.keys(updates) } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      }
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Audit Exceptions API
  // =====================
  app.get('/api/audit/exceptions', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'audit:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_exceptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ exceptions: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/audit/exceptions', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'audit:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { description, reservationId, roomNumber, businessDate, owner } = req.body || {};
    if (!description) return res.status(400).json({ error: 'description is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_exceptions')
        .insert({
          description,
          reservation_id: reservationId || null,
          room_number: roomNumber || null,
          business_date: businessDate || new Date().toISOString().slice(0, 10),
          owner: owner || user?.name || 'Front Office'
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, exception: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/audit/exceptions/:id/resolve', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'audit:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const id = req.params.id;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_exceptions')
        .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: user?.id || null })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, exception: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/audit/events', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'audit:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ events: data || [] });
    }

    res.json({ events: fallbackAuditEvents.slice(-500).reverse() });
  });

  // =====================
  // Report Schedules / Versions / Historical Stats
  // =====================
  app.get('/api/report-schedules', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('report_schedules')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ schedules: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/report-schedules', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:export'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { reportName, frequency, recipients, status, nextRun } = req.body || {};
    if (!reportName || !frequency) return res.status(400).json({ error: 'reportName and frequency are required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('report_schedules')
        .insert({
          report_name: reportName,
          frequency,
          recipients: recipients || [],
          status: status || 'Active',
          next_run: nextRun || null,
          created_by: user?.id || null
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, schedule: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/report-versions', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:export'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { reportName, fileSize, status } = req.body || {};
    if (!reportName) return res.status(400).json({ error: 'reportName is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('report_versions')
        .insert({
          report_name: reportName,
          file_size: fileSize || null,
          status: status || 'Draft',
          generated_by: user?.name || user?.id || null
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, version: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Pending Admin Changes — Executive Governance Approval Queue
  // =====================

  app.get('/api/admin/pending-changes', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      let { data, error } = await supabaseAdmin
        .from('pending_admin_changes')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error && error.code === '42P01') {
        // Table missing — attempt to create it inline
        await ensurePendingAdminChangesTable();
        const result = await supabaseAdmin
          .from('pending_admin_changes')
          .select('*')
          .order('submitted_at', { ascending: false });
        data = result.data;
        error = result.error;
      }
      if (error) return res.status(500).json({ error: error.message });
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        changeType: r.change_type,
        submittedAt: r.submitted_at,
        submittedBy: r.submitted_by,
        status: r.status,
        payload: r.payload,
      }));
      return res.json(mapped);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/admin/pending-changes', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const body = req.body || {};
    if (!body.id || !body.title || !body.changeType || !body.payload) {
      return res.status(400).json({ error: 'id, title, changeType, and payload are required' });
    }
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      let result = await supabaseAdmin.from('pending_admin_changes').insert({
        id: body.id,
        title: body.title,
        description: body.description || '',
        change_type: body.changeType,
        submitted_at: body.submittedAt || new Date().toISOString(),
        submitted_by: body.submittedBy || user.name || user.email,
        status: 'Pending',
        payload: body.payload,
      });
      if (result.error && result.error.code === '42P01') {
        await ensurePendingAdminChangesTable();
        result = await supabaseAdmin.from('pending_admin_changes').insert({
          id: body.id,
          title: body.title,
          description: body.description || '',
          change_type: body.changeType,
          submitted_at: body.submittedAt || new Date().toISOString(),
          submitted_by: body.submittedBy || user.name || user.email,
          status: 'Pending',
          payload: body.payload,
        });
      }
      if (result.error) return res.status(500).json({ error: result.error.message });
      await writeAuditEvent({ req, user, action: 'admin_change.submitted', module: 'governance', details: { changeId: body.id, title: body.title, changeType: body.changeType } });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/admin/pending-changes/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const changeId = req.params.id;
    const { status } = req.body || {};
    if (status !== 'Approved' && status !== 'Declined') {
      return res.status(400).json({ error: 'status must be Approved or Declined' });
    }
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      let result = await supabaseAdmin
        .from('pending_admin_changes')
        .update({ status })
        .eq('id', changeId);
      if (result.error && result.error.code === '42P01') {
        await ensurePendingAdminChangesTable();
        result = await supabaseAdmin
          .from('pending_admin_changes')
          .update({ status })
          .eq('id', changeId);
      }
      if (result.error) return res.status(500).json({ error: result.error.message });
      await writeAuditEvent({ req, user, action: `admin_change.${status.toLowerCase()}`, module: 'governance', details: { changeId, status } });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Dispatch a report to a distribution list. Records a "Sent" version and audit
  // trail. Performs an actual SMTP send when SMTP_* env vars are configured;
  // otherwise the message is queued/logged so the workflow stays functional.
  app.post('/api/reports/email', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:export'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { reportName, recipients, fileSize, summary } = req.body || {};
    const recipientList: string[] = Array.isArray(recipients)
      ? recipients
      : String(recipients || '').split(',').map((r) => r.trim()).filter(Boolean);

    if (!reportName) return res.status(400).json({ error: 'reportName is required' });
    if (recipientList.length === 0) return res.status(400).json({ error: 'At least one recipient is required' });

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    let dispatched = false;
    let dispatchError: string | undefined;

    if (smtpConfigured) {
      try {
        // Lazy import keeps nodemailer optional when SMTP is not configured.
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transport.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: recipientList.join(', '),
          subject: `[SELEDA Hotel ERP] ${reportName}`,
          text: summary || `Attached/summary for ${reportName}.`,
        });
        dispatched = true;
      } catch (err: any) {
        dispatchError = err?.message || 'SMTP dispatch failed';
      }
    }

    let version: unknown = null;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('report_versions')
        .insert({
          report_name: reportName,
          file_size: fileSize || null,
          status: 'Sent',
          generated_by: user?.name || user?.id || null,
        })
        .select()
        .maybeSingle();
      version = data;
    }

    await writeAuditEvent({
      req,
      user,
      action: 'report.email_dispatched',
      entityType: 'Report',
      entityId: reportName,
      module: 'reports',
      outcome: dispatched || !smtpConfigured ? 'success' : 'failure',
      details: { recipients: recipientList, dispatched, queuedOnly: !smtpConfigured, dispatchError },
    });

    return res.json({
      success: true,
      dispatched,
      queuedOnly: !smtpConfigured,
      recipients: recipientList,
      version,
      message: dispatched
        ? 'Report emailed successfully.'
        : smtpConfigured
          ? `Dispatch failed: ${dispatchError}`
          : 'SMTP not configured; dispatch recorded and queued.',
    });
  });

  app.get('/api/historical-stats', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('historical_stats')
        .select('*')
        .order('business_date', { ascending: false })
        .limit(60);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ stats: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/historical-stats', async (req, res) => {
    const user = await getRequestUser(req);
    if (!(await userCan(user, 'reports:export'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { businessDate, occupancy, roomRevenue, ancillaryRevenue, adr, revpar, guestSatisfaction } = req.body || {};
    if (!businessDate) return res.status(400).json({ error: 'businessDate is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('historical_stats')
        .insert({
          business_date: businessDate,
          occupancy: occupancy ?? null,
          room_revenue: roomRevenue ?? null,
          ancillary_revenue: ancillaryRevenue ?? null,
          adr: adr ?? null,
          revpar: revpar ?? null,
          guest_satisfaction: guestSatisfaction ?? null
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, stat: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/group-bookings', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:create'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { groupName, contactName, contactEmail, contactPhone, roomTypeNeeded, roomCount, checkInDate, checkOutDate, discountPercent, status } = req.body;

    if (!groupName || !contactName || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'groupName, contactName, checkInDate, checkOutDate are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('create_group_booking', {
        p_group_name: groupName,
        p_contact_name: contactName,
        p_contact_email: contactEmail || '',
        p_contact_phone: contactPhone || null,
        p_room_type_needed: roomTypeNeeded || 'Double',
        p_room_count: roomCount || 1,
        p_check_in_date: checkInDate,
        p_check_out_date: checkOutDate,
        p_discount_percent: discountPercent || 0,
        p_status: status || 'Pending',
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Group booking creation failed' });

      return res.json({ success: true, groupId: data.groupId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/group-bookings/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:update'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;
    const { status } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('group_bookings')
        .update({ status })
        .eq('id', groupId);

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, groupId, status });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // ============================================================================
  // GROUP PROFILE API ENDPOINTS
  // ============================================================================

  app.get('/api/group-profiles', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('group_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ groupProfiles: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/group-profiles/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('group_profiles')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Group profile not found' });
      return res.json({ groupProfile: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/group-profiles', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:create'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupData = req.body;

    if (!groupData.code || !groupData.name || !groupData.type) {
      return res.status(400).json({ error: 'code, name, and type are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const newId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabaseAdmin
        .from('group_profiles')
        .insert({
          id: newId,
          code: groupData.code,
          name: groupData.name,
          type: groupData.type,
          status: groupData.status || 'Active',
          contact_name: groupData.contactName || null,
          contact_email: groupData.contactEmail || null,
          contact_phone: groupData.contactPhone || null,
          contact_title: groupData.contactTitle || null,
          organization_name: groupData.organizationName || null,
          organization_address: groupData.organizationAddress || null,
          organization_city: groupData.organizationCity || null,
          organization_country: groupData.organizationCountry || null,
          organization_tax_id: groupData.organizationTaxId || null,
          organization_vat_no: groupData.organizationVatNo || null,
          billing_address: groupData.billingAddress || null,
          billing_city: groupData.billingCity || null,
          billing_country: groupData.billingCountry || null,
          billing_tax_id: groupData.billingTaxId || null,
          billing_vat_no: groupData.billingVatNo || null,
          payment_terms: groupData.paymentTerms || null,
          credit_limit: groupData.creditLimit || 0,
          current_balance: groupData.currentBalance || 0,
          contract_start_date: groupData.contractStartDate || null,
          contract_end_date: groupData.contractEndDate || null,
          cut_off_date: groupData.cutOffDate || null,
          negotiated_rate_code: groupData.negotiatedRateCode || null,
          discount_percent: groupData.discountPercent || 0,
          master_payment_method: groupData.masterPaymentMethod || null,
          room_type_breakdown: groupData.roomTypeBreakdown || null,
          total_rooms_allocated: groupData.totalRoomsAllocated || 0,
          total_rooms_used: groupData.totalRoomsUsed || 0,
          total_revenue: groupData.totalRevenue || 0,
          total_room_nights: groupData.totalRoomNights || 0,
          total_stays: groupData.totalStays || 0,
          lifetime_value: groupData.lifetimeValue || 0,
          average_daily_rate: groupData.averageDailyRate || 0,
          notes: groupData.notes || null,
          preferences: groupData.preferences || {},
          custom_fields: groupData.customFields || {},
          default_routing_profile_id: groupData.defaultRoutingProfileId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      
      await writeAuditEvent({ 
        req, 
        user, 
        action: 'group_profile_created', 
        entityType: 'GroupProfile', 
        entityId: newId,
        module: 'group_management',
        details: { groupName: groupData.name, groupType: groupData.type }
      });

      return res.json({ success: true, groupProfile: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/group-profiles/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:update'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;
    const updates = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('group_profiles')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (!existing) return res.status(404).json({ error: 'Group profile not found' });

      const { data, error } = await supabaseAdmin
        .from('group_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'group_profile_updated', 
        entityType: 'GroupProfile', 
        entityId: groupId,
        module: 'group_management',
        details: { previousValues: existing, newValues: updates }
      });

      return res.json({ success: true, groupProfile: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/group-profiles/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:delete'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('group_profiles')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (!existing) return res.status(404).json({ error: 'Group profile not found' });

      const { error } = await supabaseAdmin
        .from('group_profiles')
        .delete()
        .eq('id', groupId);

      if (error) return res.status(500).json({ error: error.message });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'group_profile_deleted', 
        entityType: 'GroupProfile', 
        entityId: groupId,
        module: 'group_management',
        details: { deletedProfile: existing }
      });

      return res.json({ success: true, groupId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/group-profiles/:id/members', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('get_group_active_members', {
        p_group_id: groupId,
      });

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ members: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // ============================================================================
  // GUEST GROUP RELATIONSHIP API ENDPOINTS
  // ============================================================================

  app.get('/api/guest-group-relationships/:guestId', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reports:view'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const guestId = req.params.guestId;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('guest_group_relationships')
        .select('*')
        .eq('guest_id', guestId)
        .order('start_date', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ relationships: data || [] });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/guest-group-relationships', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:create'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { guestId, groupId, relationshipType, isPrimaryContact, reservationId, roleTitle } = req.body;

    if (!guestId || !groupId) {
      return res.status(400).json({ error: 'guestId and groupId are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('link_guest_to_group', {
        p_guest_id: guestId,
        p_group_id: groupId,
        p_relationship_type: relationshipType || null,
        p_is_primary_contact: isPrimaryContact || false,
        p_reservation_id: reservationId || null,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to link guest to group' });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'guest_linked_to_group', 
        entityType: 'GuestGroupRelationship', 
        entityId: data.relationshipId,
        module: 'group_management',
        details: { groupId, guestId, relationshipType, isPrimaryContact }
      });

      return res.json({ success: true, relationshipId: data.relationshipId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/guest-group-relationships/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:update'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const relationshipId = req.params.id;
    const updates = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('guest_group_relationships')
        .select('*')
        .eq('id', relationshipId)
        .maybeSingle();

      if (!existing) return res.status(404).json({ error: 'Relationship not found' });

      const { data, error } = await supabaseAdmin
        .from('guest_group_relationships')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', relationshipId)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'relationship_updated', 
        entityType: 'GuestGroupRelationship', 
        entityId: relationshipId,
        module: 'group_management',
        details: { groupId: existing.group_id, guestId: existing.guest_id, relationshipId, previousValues: existing, newValues: updates }
      });

      return res.json({ success: true, relationship: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/guest-group-relationships/:id', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:delete'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const relationshipId = req.params.id;
    const { reason } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('guest_group_relationships')
        .select('*')
        .eq('id', relationshipId)
        .maybeSingle();

      if (!existing) return res.status(404).json({ error: 'Relationship not found' });

      const { data, error } = await supabaseAdmin.rpc('unlink_guest_from_group', {
        p_guest_id: existing.guest_id,
        p_group_id: existing.group_id,
        p_reason: reason || null,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to unlink guest from group' });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'guest_unlinked_from_group', 
        entityType: 'GuestGroupRelationship', 
        entityId: relationshipId,
        module: 'group_management',
        details: { groupId: existing.group_id, guestId: existing.guest_id, relationshipId, reason }
      });

      return res.json({ success: true, relationshipId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/group-profiles/:id/link-guest', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:create'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;
    const { guestId, relationshipType, isPrimaryContact, reservationId, roleTitle } = req.body;

    if (!guestId) {
      return res.status(400).json({ error: 'guestId is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('link_guest_to_group', {
        p_guest_id: guestId,
        p_group_id: groupId,
        p_relationship_type: relationshipType || null,
        p_is_primary_contact: isPrimaryContact || false,
        p_reservation_id: reservationId || null,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to link guest to group' });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'guest_linked_to_group', 
        entityType: 'GuestGroupRelationship', 
        entityId: data.relationshipId,
        module: 'group_management',
        details: { groupId, guestId, relationshipType, isPrimaryContact, automatic: true }
      });

      return res.json({ success: true, relationshipId: data.relationshipId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/group-profiles/:id/unlink-guest', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:delete'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const groupId = req.params.id;
    const { guestId, reason } = req.body;

    if (!guestId) {
      return res.status(400).json({ error: 'guestId is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('unlink_guest_from_group', {
        p_guest_id: guestId,
        p_group_id: groupId,
        p_reason: reason || null,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to unlink guest from group' });

      await writeAuditEvent({ 
        req, 
        user, 
        action: 'guest_unlinked_from_group', 
        entityType: 'GuestGroupRelationship', 
        module: 'group_management',
        details: { groupId, guestId, reason }
      });

      return res.json({ success: true });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:id/change-room', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:update'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('change_room', {
        p_reservation_id: reservationId,
        p_new_room_number: roomNumber,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Room change failed' });

      return res.json({ success: true, reservationId, fromRoom: data.fromRoom, toRoom: data.toRoom });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:id/check-in', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'reservation:check_in'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('check_in_reservation', {
        p_reservation_id: reservationId,
        p_room_number: roomNumber,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Check-in failed' });

      return res.json({ success: true, reservationId, roomNumber, status: 'CheckedIn', folioId: data.folioId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  async function ensureFolio(reservationId: string, userId: string, targetFolio?: string) {
    if (!supabaseAdmin) return null;

    // Look for existing open folio for this reservation
    let query = supabaseAdmin
      .from('folios')
      .select('id, folio_type, target_folio')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open');

    if (targetFolio) {
      query = query.eq('target_folio', targetFolio);
    } else {
      // Prefer Guest/Master folio (primary), fallback to any
      query = query.in('folio_type', ['Guest', 'Master']);
    }

    const { data: existing } = await query.maybeSingle();
    if (existing) return existing.id;

    // If no primary folio exists but other folios do, get the first open one
    const { data: anyFolio } = await supabaseAdmin
      .from('folios')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open')
      .maybeSingle();
    if (anyFolio) return anyFolio.id;

    const { data: reservation } = await supabaseAdmin
      .from('reservations')
      .select('status, total_amount, channel, group_booking_id')
      .eq('id', reservationId)
      .maybeSingle();

    if (!reservation) return null;

    const isCorporate = reservation.channel === 'Corporate' || reservation.group_booking_id != null;

    if (isCorporate) {
      // Create split folios: Master (A) + Guest (B)
      const folioA = crypto.randomUUID();
      const folioB = crypto.randomUUID();
      await supabaseAdmin.from('folios').insert({
        id: folioA,
        reservation_id: reservationId,
        folio_type: 'Master',
        target_folio: 'A',
        status: 'Open',
        balance: reservation.total_amount || 0,
        total_charges: reservation.total_amount || 0,
        total_payments: 0,
        currency: 'USD',
        opened_at: new Date().toISOString(),
        created_by: userId,
      });
      await supabaseAdmin.from('folios').insert({
        id: folioB,
        reservation_id: reservationId,
        folio_type: 'Guest',
        target_folio: 'B',
        status: 'Open',
        balance: 0,
        total_charges: 0,
        total_payments: 0,
        currency: 'USD',
        opened_at: new Date().toISOString(),
        created_by: userId,
      });
      return targetFolio === 'B' ? folioB : folioA;
    }

    // Individual booking: single Guest folio
    const folioId = crypto.randomUUID();
    await supabaseAdmin.from('folios').insert({
      id: folioId,
      reservation_id: reservationId,
      folio_type: 'Guest',
      status: 'Open',
      balance: reservation.total_amount || 0,
      total_charges: reservation.total_amount || 0,
      total_payments: 0,
      currency: 'USD',
      opened_at: new Date().toISOString(),
      created_by: userId,
    });
    return folioId;
  }

  app.post('/api/reservations/:id/charges', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:charge:add'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const reservationId = req.params.id;
    const { description, amount, quantity, lineType, revenueAccountCode, sourceReference } = req.body;

    if (!description || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'description and positive amount are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, user.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      const { data, error } = await supabaseAdmin.rpc('post_folio_charge', {
        p_folio_id: folioId,
        p_description: description,
        p_amount: amount,
        p_quantity: quantity || 1,
        p_line_type: lineType || 'Extra',
        p_revenue_account_code: revenueAccountCode || null,
        p_user_id: user.id,
        p_source_reference: sourceReference || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Charge failed' });

      return res.json({ success: true, folioId, lineId: data.lineId, lineNumber: data.lineNumber, newBalance: data.newBalance });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:id/payments', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:payment:add'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const reservationId = req.params.id;
    const { amount, paymentMethod, reference } = req.body;

    if (typeof amount !== 'number' || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ error: 'positive amount and paymentMethod are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, user.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      const { data, error } = await supabaseAdmin.rpc('post_folio_payment', {
        p_folio_id: folioId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_reference: reference || null,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Payment failed' });

      return res.json({ success: true, folioId, newBalance: data.newBalance });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:reservationId/charges/:chargeId/void', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:charge:void'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { chargeId } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) return res.status(400).json({ error: 'reason is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('void_folio_line', {
        p_line_id: chargeId,
        p_reason: reason,
        p_user_id: user.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, lineId: chargeId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:reservationId/charges/:chargeId/move', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:charge:add'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { chargeId, reservationId: sourceReservationId } = req.params;
    const { targetReservationId } = req.body;

    if (!targetReservationId) return res.status(400).json({ error: 'targetReservationId is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      // Find source folio (primary open folio for source reservation)
      const { data: sourceFolio } = await supabaseAdmin
        .from('folios')
        .select('id')
        .eq('reservation_id', sourceReservationId)
        .eq('status', 'Open')
        .in('folio_type', ['Guest', 'Master'])
        .maybeSingle();

      if (!sourceFolio) return res.status(404).json({ error: 'Source folio not found' });

      // Find target folio (primary open folio for target reservation)
      const { data: targetFolio } = await supabaseAdmin
        .from('folios')
        .select('id')
        .eq('reservation_id', targetReservationId)
        .eq('status', 'Open')
        .in('folio_type', ['Guest', 'Master'])
        .maybeSingle();

      if (!targetFolio) {
        // Create folio for target reservation if it doesn't exist
        const targetFolioId = await ensureFolio(targetReservationId, user.id);
        if (!targetFolioId) return res.status(404).json({ error: 'Target reservation not found or cannot create folio' });

        const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
          p_line_id: chargeId,
          p_target_folio_id: targetFolioId,
          p_user_id: user.id,
        });

        if (error) return res.status(500).json({ error: error.message });
        if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

        return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
      }

      const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
        p_line_id: chargeId,
        p_target_folio_id: targetFolio.id,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

      return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:reservationId/payments/:paymentId/void', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:payment:void'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { paymentId } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) return res.status(400).json({ error: 'reason is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: payment } = await supabaseAdmin
        .from('folio_payments')
        .select('id')
        .eq('id', paymentId)
        .eq('is_voided', false)
        .maybeSingle();

      if (!payment) return res.status(404).json({ error: 'Payment not found or already voided' });

      const { data, error } = await supabaseAdmin.rpc('void_folio_line', {
        p_line_id: paymentId,
        p_reason: reason,
        p_user_id: user.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, paymentId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/folio-lines/:lineId/move', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'folio:charge:add'))) return res.status(403).json({ error: 'Insufficient privileges' });

    const { lineId } = req.params;
    const { targetFolioId } = req.body;

    if (!targetFolioId) return res.status(400).json({ error: 'targetFolioId is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
        p_line_id: lineId,
        p_target_folio_id: targetFolioId,
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

      return res.json({ success: true, lineId, fromFolio: data.fromFolio, toFolio: data.toFolio });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/night-audit/run', async (req, res) => {
    const user = await getRequestUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!(await userCan(user, 'night_audit:run'))) return res.status(403).json({ error: 'Insufficient privileges' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('run_night_audit', {
        p_user_id: user.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Night audit failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Set up Vite/static middleware AFTER all API routes
  const isProduction = process.env.NODE_ENV === 'production' || process.argv[1]?.includes('dist/server.cjs') || process.argv[1]?.includes('dist\\server.cjs');
  const distPath = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');
  // In dev mode, delete any stale dist/index.html so Vite middleware always takes over
  if (!isProduction && fs.existsSync(distIndex)) {
    try { fs.unlinkSync(distIndex); } catch { /* ignore */ }
  }
  const hasBuiltApp = fs.existsSync(distIndex);
  if (!isProduction && !hasBuiltApp) {
    const vite = await createViteServer({ 
      server: { 
        middlewareMode: true,
        hmr: false
      }, 
      appType: 'spa' 
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ERP] Core running at http://localhost:${PORT}`);
    console.log(`[ERP] Auth store: ${(FORCE_FALLBACK_AUTH || !hasSupabaseAdminConfig) ? 'development fallback' : 'database'}`);
  });
}

startServer();
