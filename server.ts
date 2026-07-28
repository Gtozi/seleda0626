import './src/server/env';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { User, } from './src/types/erp';
import { hasSupabaseAdminConfig, supabaseAdmin } from './src/server/supabaseAdmin';
import { authenticate, requirePermission,  requireActiveAccount } from './src/server/middleware/auth';
import { verifyTotp, generateMfaSecret } from './src/server/authHelpers';
import { validatePassword, resolvePolicy, type PasswordPolicy } from './src/lib/passwordPolicy';
import { encrypt,  maskApiKey, isEncrypted,  decryptIfEncrypted } from './src/lib/crypto';
import {
  mapFolioFromDb,
  mapFolioLineFromDb,
  mapFolioPaymentFromDb,
} from './src/services/dataMapper';
import b2bRoutes from './src/server/routes/b2b.routes';
import financeRoutes from './src/server/routes/finance.routes';
import financeV1Routes from './src/server/routes/v1/finance.routes';
import budgetingRoutes from './src/server/routes/budgeting.routes';
import taxRoutes from './src/server/routes/tax.routes';
import fpaRoutes from './src/server/routes/fpa.routes';
import multipropertyRoutes from './src/server/routes/multiproperty.routes';
import posRoutes from './src/server/routes/pos.routes';
import kdsRoutes from './src/server/routes/kds.routes';
import kitchenRoutes from './src/server/routes/kitchen.routes';
import barRoutes from './src/server/routes/bar.routes';
import unifiedInventoryRoutes from './src/server/routes/unifiedInventory.routes';
import unifiedProductRoutes from './src/server/routes/unifiedProduct.routes';
import productionPlanningRoutes from './src/server/routes/productionPlanning.routes';
import outletTransferRoutes from './src/server/routes/outletTransfer.routes';
import costVarianceRoutes from './src/server/routes/costVariance.routes';
import posSyncRoutes from './src/server/routes/posSync.routes';
import managerPinRoutes from './src/server/routes/managerPin.routes';
import menuEnhancementsRoutes from './src/server/routes/menuEnhancements.routes';
import hardwareRoutes from './src/server/routes/hardware.routes';
import tableManagementRoutes from './src/server/routes/tableManagement.routes';
import procurementRoutes from './src/server/routes/procurement.routes';
import menuAnalyticsRoutes from './src/server/routes/menuAnalytics.routes';
import guestStaffRoutes from './src/server/routes/guestStaff.routes';
import onlineOrderingRoutes from './src/server/routes/onlineOrdering.routes';
import operationsPortalRoutes from './src/server/routes/operationsPortal.routes';
import operationsAIRoutes from './src/server/routes/operationsAI.routes';
import operationsIoTRoutes from './src/server/routes/operationsIoT.routes';
import operationsOptimizationRoutes from './src/server/routes/operationsOptimization.routes';
import operationsAnalyticsRoutes from './src/server/routes/operationsAnalytics.routes';
import operationsSupplyChainRoutes from './src/server/routes/operationsSupplyChain.routes';
import operationsHousekeepingRoutes from './src/server/routes/operationsHousekeeping.routes';
import operationsSafetyRoutes from './src/server/routes/operationsSafety.routes';
import accountsPayableRoutes from './src/server/routes/accountsPayable.routes';
import bankReconciliationRoutes from './src/server/routes/bankReconciliation.routes';
import fixedAssetsRoutes from './src/server/routes/fixedAssets.routes';
import trialBalanceRoutes from './src/server/routes/trialBalance.routes';
import financialStatementsRoutes from './src/server/routes/financialStatements.routes';
import ercaVatRoutes from './src/server/routes/ercaVat.routes';
import periodCloseRoutes from './src/server/routes/periodClose.routes';
import foodBeverageRoutes from './src/server/routes/foodBeverage.routes';
import operationsManagerRoutes from './src/server/routes/operationsManager.routes';
import authRoutes from './src/server/routes/auth.routes';
import adminRoutes from './src/server/routes/admin.routes';
import { enrichUserWithDerivedPermissions as enrichUserShared } from './src/server/services/sharedServices';
import reservationsRoutes from './src/server/routes/reservations.routes';
import inventoryRoutes from './src/server/routes/inventory.routes';
import publicRoutes from './src/server/routes/public.routes';
import reportsRoutes from './src/server/routes/reports.routes';
import standardReportsRoutes from './src/server/routes/standardReports.routes';
import giftShopRoutes from './src/server/routes/giftShop.routes';
import groupProfilesRoutes from './src/server/routes/groupProfiles.routes';
import executiveRoutes from './src/server/routes/executive.routes';
import housekeepingPortalRoutes from './src/server/routes/housekeepingPortal.routes';
import engineeringPortalRoutes from './src/server/routes/engineeringPortal.routes';
import inventoryPortalRoutes from './src/server/routes/inventoryPortal.routes';
import hrPayrollPortalRoutes from './src/server/routes/hrPayrollPortal.routes';
import procurementPortalRoutes from './src/server/routes/procurementPortal.routes';
import salesEventsPortalRoutes from './src/server/routes/salesEventsPortal.routes';
import guestMobilePortalRoutes from './src/server/routes/guestMobilePortal.routes';
import { getGlobalSettings, invalidateGlobalSettingsCache } from './src/server/services/settingsService';
import {
  computeFees,
  getSeasonMultiplier,
  getRatePlanModifier,
  getEffectiveNightlyRate,
  type FeeComponent,
  type SeasonRow,
  type RatePlanRow,
} from './src/utils/pricing';

if (typeof globalThis.DOMException === 'undefined') {
  // @ts-ignore
  import('node-domexception').then((mod) => {
    globalThis.DOMException = mod.default;
  }).catch(() => {});
}

const SESSION_COOKIE = 'hotel_erp_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1000 * 60 * 30; // 30 minutes

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
// Dynamic column filter for global_settings (Step 2.5)
// Replaces manual KNOWN_GLOBAL_SETTINGS_COLUMNS with schema query
let cachedGlobalSettingsColumns: Set<string> | null = null;

async function getGlobalSettingsColumns(): Promise<Set<string>> {
  if (cachedGlobalSettingsColumns) return cachedGlobalSettingsColumns;
  
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return new Set();
  }

  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_table_columns', { p_table_name: 'global_settings' });
    
    if (error || !data) {
      console.warn('Failed to fetch global_settings columns:', error);
      return new Set();
    }

    const columns = Array.isArray(data) ? data.map((row: any) => row.column_name) : [];
    cachedGlobalSettingsColumns = new Set(columns);
    return cachedGlobalSettingsColumns;
  } catch (e) {
    console.warn('Error fetching global_settings columns:', e);
    return new Set();
  }
}

async function filterKnownColumns(obj: Record<string, any>): Promise<Record<string, any>> {
  const allowedColumns = await getGlobalSettingsColumns();
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (allowedColumns.has(key)) {
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
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: any[],
  reservations: any[],
  excludeReservationId?: string,
  requestedQuantity: number = 1
) {
  // Calculate capacity using room_type_id (canonical field after Step 2.4)
  const capacity = rooms.filter((r: any) => r.room_type_id === roomTypeId).length;
  const booked = reservations.filter((res: any) =>
    res.id !== excludeReservationId &&
    res.room_type_id === roomTypeId &&
    (res.status === 'Confirmed' || res.status === 'CheckedIn' ||
     (res.status === 'Waitlisted' && res.channel === 'Direct Website')) &&
    rangesOverlap(checkInDate, checkOutDate, res.check_in_date, res.check_out_date)
  ).length;
  const available = Math.max(0, capacity - booked);
  return { roomTypeId, capacity, booked, available, can_book: available >= requestedQuantity };
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
void getRoomImageUrl;

function findAvailableRoomForReservation(
  res: any,
  rooms: any[],
  reservations: any[],
  excludeRoomNumbers: Set<string> = new Set()
): string | null {
  const unavailableRoomNumbers = new Set([
    ...reservations
      .filter((r: any) =>
        r.id !== res.id &&
        r.room_number &&
        r.room_type_id === res.room_type_id &&
        rangesOverlap(res.check_in_date, res.check_out_date, r.check_in_date, r.check_out_date)
      )
      .map((r: any) => r.room_number),
    ...excludeRoomNumbers
  ]);

  const candidates = rooms.filter((r: any) =>
    r.room_type_id === res.room_type_id &&
    r.status !== 'Out of Order' &&
    !unavailableRoomNumbers.has(r.number)
  );

  // Prefer a clean vacant room, then any available room
  const best = candidates.find((r: any) => r.status === 'Vacant Clean') || candidates[0];
  return best ? best.number : null;
}

async function autoAssignRoomsForPublicBookings(
  reservationIds: string[],
  supabaseClient: any,
  checkIn?: string,
  checkOut?: string
): Promise<Record<string, string>> {
  let roomsList: any[];
  let reservationsList: any[];

  if (checkIn && checkOut) {
    // Fetch reservations that overlap the date range plus the requested IDs
    const { data: overlapping } = await supabaseClient.from('reservations')
      .select('*')
      .lte('check_in_date', checkOut)
      .gte('check_out_date', checkIn);
    const { data: requested } = await supabaseClient.from('reservations')
      .select('*')
      .in('id', reservationIds);
    const merged = new Map<string, any>();
    for (const r of (overlapping || [])) merged.set(r.id, r);
    for (const r of (requested || [])) merged.set(r.id, r);
    reservationsList = Array.from(merged.values());
    const { data: rooms } = await supabaseClient.from('rooms').select('*');
    roomsList = rooms || [];
  } else {
    const [{ data: rooms }, { data: reservations }] = await Promise.all([
      supabaseClient.from('rooms').select('*'),
      supabaseClient.from('reservations').select('*').in('id', reservationIds)
    ]);
    roomsList = rooms || [];
    reservationsList = reservations || [];
  }
  const assignedRooms: Record<string, string> = {};
  const assignedRoomNumbers = new Set<string>();

  for (const id of reservationIds) {
    const res = reservationsList.find((r: any) => r.id === id);
    if (!res) continue;

    if (res.room_number) {
      assignedRooms[id] = res.room_number;
      assignedRoomNumbers.add(res.room_number);
      continue;
    }

    const roomNumber = findAvailableRoomForReservation(res, roomsList, reservationsList, assignedRoomNumbers);
    if (roomNumber) {
      assignedRooms[id] = roomNumber;
      assignedRoomNumbers.add(roomNumber);
    }
  }

  // Persist the room assignments (best-effort; do not fail the whole booking)
  for (const [id, roomNumber] of Object.entries(assignedRooms)) {
    try {
      const { error } = await supabaseClient.from('reservations').update({ room_number: roomNumber }).eq('id', id);
      if (error) {
        console.error(`Failed to assign room ${roomNumber} to reservation ${id}:`, error);
      }
    } catch (e) {
      console.error(`Error assigning room to reservation ${id}:`, e);
    }
  }

  return assignedRooms;
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
void deriveLegacyPermissions;

/**
 * Fetch normalized role permissions for a user and derive legacy allowedTabs/allowedSettings.
 * This unifies the permission model so the client works with a single source of truth.
 */
async function enrichUserWithDerivedPermissions(user: User): Promise<User> {
  return enrichUserShared(user);
}

async function fetchPasswordPolicy(): Promise<PasswordPolicy | null> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return null;
  try {
    const settings = await getGlobalSettings();
    if (settings?.password_complexity) {
      return resolvePolicy(settings.password_complexity);
    }
  } catch {}
  return null;
}

function processApiIntegrationsOnRead(raw: any): any[] {
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

function processApiIntegrationsOnWrite(integrations: any[]): any[] {
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
}

async function fetchSessionSettings(): Promise<{ timeoutMs: number; maxConcurrent: number }> {
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

async function createSession(user: User, req: express.Request, res: express.Response) {
  const token = createSessionToken();
  const { timeoutMs, maxConcurrent } = await fetchSessionSettings();
  const expiresAt = new Date(Date.now() + timeoutMs);

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Enforce max concurrent sessions — revoke oldest active sessions if exceeded
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

async function getRequestUser(req: express.Request): Promise<User | null> {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = hashToken(token);

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: session, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, expires_at, revoked_at, last_activity, system_users (*)')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle();

    if (error || !session || new Date(session.expires_at).getTime() < Date.now()) return null;
    
    // Check idle timeout based on last_activity
    const { timeoutMs } = await fetchSessionSettings();
    if (session.last_activity) {
      const lastActivity = new Date(session.last_activity).getTime();
      if (Date.now() - lastActivity > timeoutMs) {
        // Session expired due to inactivity — revoke it
        await supabaseAdmin.from('user_sessions')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', session.id);
        return null;
      }
    }
    
    // Update last_activity on this request
    await supabaseAdmin.from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);
    
    const systemUser = Array.isArray(session.system_users) ? session.system_users[0] : session.system_users;
    if (!systemUser) return null;
    return mapSystemUserFromDb(systemUser);
  }

  return null;
}
void getRequestUser;

async function revokeRequestSession(req: express.Request) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return;

  const tokenHash = hashToken(token);

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;

  await supabaseAdmin
    .from('user_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);
}

async function authenticateUser(email: string, password: string, req: express.Request): Promise<{ user?: User; error?: string; status: number; forcePasswordChange?: boolean }> {
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

  // IP allowlist check
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

  // Device restriction check
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

  return false;
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
        body: JSON.stringify({ query: `CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), user_id TEXT, user_name TEXT, action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, module TEXT, ip_address TEXT, user_agent TEXT, outcome TEXT NOT NULL DEFAULT 'success', details JSONB NOT NULL DEFAULT '{}'::jsonb); CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(created_at DESC); CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);` }),
      }).catch(() => null);
    }
  } catch (_) {}
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Production guard: refuse to start if Supabase env vars are missing
  if (IS_PRODUCTION && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.error('[FATAL] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production. Refusing to start.');
    process.exit(1);
  }

  await ensurePendingAdminChangesTable();
  await ensureAuditEventsTable();

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'operational',
      system: 'Hotel Management ERP Global Node',
      authStore: 'database',
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

  app.post('/api/auth/logout', authenticate, async (req, res) => {
    if (req.user) await writeAuditEvent({ req, user: req.user, action: 'logout.success', module: 'auth' });
    await revokeRequestSession(req);
    clearSessionCookie(res);
    res.json({ success: true });
  });

  // /api/auth/verify is now in auth.routes.ts

  app.post('/api/auth/refresh', authenticate, requireActiveAccount, async (req, res) => {
    
    // Validate user account status before refreshing session
    if (req.user!.status === 'Inactive' || req.user!.status === 'Pending' || req.user!.status === 'Suspended' || req.user!.status === 'Locked') {
      await revokeRequestSession(req);
      clearSessionCookie(res);
      return res.status(403).json({ error: `Account is ${req.user!.status}` });
    }
    
    // Fetch fresh user data from database to ensure no account switching
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser, error } = await supabaseAdmin
        .from('system_users')
        .select('*')
        .eq('id', req.user!.id)
        .maybeSingle();
      
      if (error || !dbUser || dbUser.id !== req.user!.id) {
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
    await createSession(req.user!, req, res);
    res.json({ success: true });
  });

  // /api/auth/validate-permission is now in auth.routes.ts

  app.post('/api/audit/permission-denial', authenticate, async (req, res) => {
    await writeAuditEvent({ req, user: req.user, action: 'permission.denial_reported', module: 'auth', outcome: 'denied', details: { requestedAction: req.body?.action, reason: req.body?.reason } });
    res.json({ success: true });
  });

  app.post('/api/audit/log', authenticate, async (req, res) => {
    const body = req.body || {};
    await writeAuditEvent({
      req,
      user: req.user,
      action: body.action || 'client.audit',
      module: body.module || 'client',
      entityType: body.entityType || null,
      entityId: body.recordId || body.entityId || null,
      details: { details: body.details, clientTimestamp: body.timestamp }
    });
    res.json({ success: true });
  });


  app.post('/api/auth/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ error: 'newPassword is required' });
    const policy = await fetchPasswordPolicy();
    const validation = validatePassword(newPassword, policy);
    if (!validation.valid) return res.status(400).json({ error: validation.errors.join('; ') });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash, force_password_change').eq('id', req.user!.id).maybeSingle();
      if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });
      
      // Skip current password verification only on forced first-login change
      if (!dbUser.force_password_change) {
        if (!currentPassword) return res.status(400).json({ error: 'currentPassword is required' });
        const passwordOk = await bcrypt.compare(currentPassword, dbUser.password_hash);
        if (!passwordOk) {
          await writeAuditEvent({ req, user: req.user, action: 'password.change.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_current_password' } });
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await supabaseAdmin.from('system_users').update({ password_hash: newHash, password_updated_at: new Date().toISOString(), force_password_change: false }).eq('id', req.user!.id);
      await writeAuditEvent({ req, user: req.user, action: 'password.change.success', module: 'auth' });
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
    const policy = await fetchPasswordPolicy();
    const validation = validatePassword(newPassword, policy);
    if (!validation.valid) return res.status(400).json({ error: validation.errors.join('; ') });
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

  app.post('/api/auth/mfa-setup', authenticate, async (req, res) => {
    const targetUserId = String(req.body?.userId || req.user!.id);
    // Users can configure their own MFA; managing other users requires permission.
    if (targetUserId !== req.user!.id) {
      const allowed = await userCan(req.user ?? null, 'users:manage');
      if (!allowed) return res.status(403).json({ error: 'Insufficient privileges' });
    }
    const secret = generateMfaSecret();
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('system_users')
        .update({ mfa_secret: secret, mfa_enabled: true })
        .eq('id', targetUserId)
        .select('id, mfa_enabled')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditEvent({ req, user: req.user, action: 'mfa.setup', module: 'auth', details: { targetUserId } });
      return res.json({ success: true, secret, userId: data.id });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/auth/verify-mfa', authenticate, async (req, res) => {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'MFA code is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('mfa_enabled, mfa_secret, failed_mfa_count, mfa_locked_until').eq('id', req.user!.id).maybeSingle();
      if (!dbUser?.mfa_enabled) return res.json({ success: true, user: req.user });
      if (!dbUser?.mfa_secret) {
        return res.status(403).json({ error: 'MFA is enabled but no secret is configured. Set up MFA first.' });
      }
      
      // Check MFA lockout
      if (dbUser.mfa_locked_until && new Date(dbUser.mfa_locked_until).getTime() > Date.now()) {
        return res.status(423).json({ error: 'MFA locked due to too many failed attempts. Try again later.' });
      }
      
      if (!/^\d{6}$/.test(String(code))) return res.status(400).json({ error: 'Invalid MFA code format' });
      if (!verifyTotp(dbUser.mfa_secret, String(code))) {
        const newFailedCount = Number(dbUser.failed_mfa_count || 0) + 1;
        const lockoutUpdates: any = { failed_mfa_count: newFailedCount };
        if (newFailedCount >= 5) {
          lockoutUpdates.mfa_locked_until = new Date(Date.now() + 1000 * 60 * 30).toISOString();
        }
        await supabaseAdmin.from('system_users').update(lockoutUpdates).eq('id', req.user!.id);
        await writeAuditEvent({ req, user: req.user, action: 'mfa.verify.failure', module: 'auth', outcome: 'failure', details: { failedCount: newFailedCount, locked: newFailedCount >= 5 } });
        if (newFailedCount >= 5) {
          return res.status(423).json({ error: 'MFA locked due to too many failed attempts. Try again in 30 minutes.' });
        }
        return res.status(401).json({ error: 'Invalid MFA code' });
      }
      // Reset failed count on success
      await supabaseAdmin.from('system_users').update({ failed_mfa_count: 0, mfa_locked_until: null }).eq('id', req.user!.id);
      await writeAuditEvent({ req, user: req.user, action: 'mfa.verified', module: 'auth' });
      return res.json({ success: true, user: req.user });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/auth/verify-password', authenticate, async (req, res) => {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash').eq('id', req.user!.id).maybeSingle();
      if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });
      const passwordOk = await bcrypt.compare(password, dbUser.password_hash);
      if (!passwordOk) {
        await writeAuditEvent({ req, user: req.user, action: 'password.verify.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_password' } });
        return res.status(401).json({ error: 'Incorrect password' });
      }
      await writeAuditEvent({ req, user: req.user, action: 'password.verify.success', module: 'auth' });
      return res.json({ success: true });
    }
    // Development fallback: accept any non-empty password when database is not configured
    if (password.length > 0) {
      await writeAuditEvent({ req, user: req.user, action: 'password.verify.success', module: 'auth', details: { mode: 'development-fallback' } });
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Password is required' });
  });

  // =====================
  // Admin API — Users, Roles, Settings
  // Users and Roles routes are now in admin.routes.ts
  // =====================

  // Single settings read endpoint with a lightweight checksum for stale-context detection
  app.get('/api/settings', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const data = await getGlobalSettings();
      if (!data) return res.json({ settings: null, checksum: null });

      // Mask API keys on read — use encrypted_api_integrations if available, fall back to api_integrations
      const encryptedIntegrations = data.encrypted_api_integrations || data.api_integrations;
      data.api_integrations = processApiIntegrationsOnRead(encryptedIntegrations);
      if (data.encrypted_api_integrations) data.encrypted_api_integrations = undefined;

      // Return version and checksum in response headers (Step 2.5)
      if (data.settings_version) res.setHeader('X-Settings-Version', String(data.settings_version));
      if (data.settings_checksum) res.setHeader('X-Settings-Checksum', data.settings_checksum);

      const checksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
      return res.json({
        settings: data,
        checksum,
        version: data.settings_version || data.updated_at || data.created_at || null,
      });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/admin/settings', authenticate, requirePermission('settings:update'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const data = await getGlobalSettings();
      if (data) {
        // Mask API keys on read
        const encryptedIntegrations = data.encrypted_api_integrations || data.api_integrations;
        data.api_integrations = processApiIntegrationsOnRead(encryptedIntegrations);
        if (data.encrypted_api_integrations) data.encrypted_api_integrations = undefined;
      }
      return res.json({ settings: data ? snakeToCamelRecord(data) : {} });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Admin atomic booking endpoint — mirrors /api/public/bookings but allows
  // the front desk to specify channel/status (e.g. Walk-In → Confirmed).
  app.post('/api/admin/bookings', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const payload = req.body || {};
    const required = ['p_guest_name', 'p_guest_email', 'p_check_in', 'p_check_out', 'p_items'];
    const missing = required.filter(k => !payload[k]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    if (!Array.isArray(payload.p_items) || payload.p_items.length === 0) {
      return res.status(400).json({ error: 'p_items must be a non-empty array' });
    }

    // create_booking_atomic does not know about voucher fields; strip them and
    // handle them after the booking is created.
    const { p_voucher_code, p_voucher_discount, ...rpcPayload } = payload;
    const operatorId = payload.p_operator_id || null;

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('create_booking_atomic', rpcPayload);

    if (rpcError) {
      const msg: string = rpcError.message || '';
      console.error('Admin atomic booking RPC error:', { message: msg, details: rpcError.details, hint: rpcError.hint, code: rpcError.code, payload });
      if (msg.includes('AVAILABILITY_ERROR:')) {
        return res.status(409).json({ error: msg.replace('AVAILABILITY_ERROR:', '').trim() });
      }
      return res.status(500).json({ error: 'Booking failed. Please try again.', details: msg });
    }

    const result = rpcResult as any;
    const reservationIds = result.reservationIds || [];
    const groupId = result.groupId || null;
    const firstReservationId = reservationIds[0];

    // Apply voucher discount and mark voucher as redeemed.
    if (firstReservationId && p_voucher_code) {
      try {
        const { data: redeemData, error: redeemError } = await supabaseAdmin.rpc('redeem_voucher', {
          p_voucher_no: p_voucher_code,
          p_reservation_id: firstReservationId,
          p_redeemed_by: req.user!.name || req.user!.email || 'staff'
        });
        if (!redeemError && redeemData) {
          const redeemResult = redeemData as any;
          const voucherDiscount = Number(redeemResult.net_value || p_voucher_discount || 0);
          const { data: firstRes } = await supabaseAdmin
            .from('reservations')
            .select('total_amount, charges')
            .eq('id', firstReservationId)
            .single();
          if (firstRes) {
            const newTotal = Math.max(0, Number(firstRes.total_amount) - voucherDiscount);
            const newCharges = Array.isArray(firstRes.charges) ? [...firstRes.charges] : [];
            newCharges.push({
              description: 'Voucher discount',
              amount: -voucherDiscount,
              date: new Date().toISOString()
            });
            await supabaseAdmin
              .from('reservations')
              .update({ total_amount: newTotal, charges: newCharges })
              .eq('id', firstReservationId);
          }
        } else if (redeemError) {
          console.error('Admin voucher redeem failed:', redeemError);
        }
      } catch (e) {
        console.error('Voucher redemption error:', e);
      }
    }

    // Record operator allotment pickup for each item/day.
    if (firstReservationId && operatorId) {
      try {
        const { data: allotments } = await supabaseAdmin
          .from('allotments')
          .select('*')
          .eq('operator_id', operatorId)
          .gte('stay_date', payload.p_check_in)
          .lt('stay_date', payload.p_check_out);

        if (allotments && allotments.length > 0) {
          const checkIn = new Date(payload.p_check_in);
          const checkOut = new Date(payload.p_check_out);
          const current = new Date(checkIn);
          while (current < checkOut) {
            const dateStr = current.toISOString().split('T')[0];
            for (const item of payload.p_items) {
              const roomTypeId = item.roomTypeId;
              const qty = item.qty || 1;
              const allotment = (allotments as any[]).find((a: any) =>
                a.room_type_id === roomTypeId && a.stay_date === dateStr
              );
              if (allotment) {
                await supabaseAdmin.from('allotment_pickup_log').insert({
                  allotment_id: allotment.id,
                  reservation_id: firstReservationId,
                  pickup_date: dateStr,
                  quantity: qty,
                  picked_up_by: req.user!.name || req.user!.email || 'staff',
                  notes: 'Admin group booking'
                });
                await supabaseAdmin.from('allotments')
                  .update({ picked_up_qty: (allotment.picked_up_qty || 0) + qty })
                  .eq('id', allotment.id);
              }
            }
            current.setDate(current.getDate() + 1);
          }
        }
      } catch (e) {
        console.error('Allotment pickup error:', e);
      }
    }

    return res.status(201).json({
      reservationIds: reservationIds,
      guestIds: result.guestIds || [],
      groupId: groupId,
    });
  });

  // Endpoint specifically for updating public page content
  app.patch('/api/admin/public-booking-content', authenticate, requirePermission('settings:update'), async (req, res) => {
    
    console.log('User attempting to update public content:', req.user!.id, req.user!.role, req.user!.username);

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
          updated_by: req.user!.id
        }).eq('id', existing.id).select().single();
        if (error) {
          console.error('Error updating public content:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Successfully updated public content. Result:', JSON.stringify(data, null, 2));
        invalidateGlobalSettingsCache();
        await writeAuditEvent({ req, user: req.user!, action: 'public_content.updated', entityType: 'GlobalSettings', entityId: existing.id, module: 'admin', details: { updates: 'publicPageContent' } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      } else {
        const { data, error } = await supabaseAdmin.from('global_settings').insert({
          public_page_content: convertedContent,
          updated_at: new Date().toISOString(),
          updated_by: req.user!.id
        }).select().single();
        if (error) {
          console.error('Error inserting public content:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Successfully inserted public content. Result:', JSON.stringify(data, null, 2));
        invalidateGlobalSettingsCache();
        await writeAuditEvent({ req, user: req.user!, action: 'public_content.updated', entityType: 'GlobalSettings', entityId: data.id, module: 'admin', details: { updates: 'publicPageContent' } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      }
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Operational CRUD API — Rooms, Guests, Reservations, etc.
  // These endpoints are now in reservations.routes.ts, inventory.routes.ts, and giftShop.routes.ts
  // =====================

  // =====================
  // Public Booking API
  // GET routes (settings, rooms, rate-plans, packages, guest-services) are now in public.routes.ts
  // =====================

  app.post('/api/public/bookings', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { checkIn, checkOut, guestName, guestEmail, guestPhone, guestNationality, packageIds, guestServiceIds, specialRequests, items, airportShuttleRequests, groupName, primaryContact, operator_id, voucher_code, voucher_discount, ratePlanId } = req.body || {};

    const effectiveGuestName = guestName || primaryContact;

    if (!checkIn || !checkOut || !effectiveGuestName || !guestEmail) {
      return res.status(400).json({ error: 'checkIn, checkOut, guestName, guestEmail are required' });
    }

    const cartItems = Array.isArray(items) && items.length > 0 ? items : [];
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'At least one room is required' });
    }

    // Check if public booking is enabled and not in maintenance mode
    const settings = await getGlobalSettings();
    if (!settings?.public_booking_enabled) {
      return res.status(503).json({ error: 'Public booking is currently disabled' });
    }
    if (settings?.maintenance_mode) {
      return res.status(503).json({ error: settings.maintenance_message || 'System is under maintenance. Please try again later.' });
    }

    const [{ data: roomTypes }, { data: rooms }, { data: reservations }, { data: packages }, { data: guestServices }, { data: allotments }, { data: seasons }, { data: ratePlans }] = await Promise.all([
      supabaseAdmin.from('room_types').select('*'),
      supabaseAdmin.from('rooms').select('*'),
      supabaseAdmin.from('reservations').select('*').lte('check_in_date', checkOut).gte('check_out_date', checkIn),
      supabaseAdmin.from('packages').select('*'),
      supabaseAdmin.from('guest_services').select('*'),
      operator_id ? supabaseAdmin.from('allotments').select('*').eq('operator_id', operator_id).gte('stay_date', checkIn).lte('stay_date', checkOut).eq('is_released', false) : Promise.resolve({ data: [] }),
      supabaseAdmin.from('seasons').select('*'),
      supabaseAdmin.from('rate_plans').select('*')
    ]);

    const roomTypesList = roomTypes || [];
    const roomsList = rooms || [];
    const reservationsList = reservations || [];
    const allotmentsList = allotments || [];
    const taxPercent = (settings as any)?.tax_percent || 0;
    const serviceChargePercent = (settings as any)?.service_charge_percent || 0;
    const feeComponents = ((settings as any)?.fee_components || []) as FeeComponent[];
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));

    // ── Pricing parity with the front desk: seasonal multiplier + rate plan ──
    const season = getSeasonMultiplier(checkIn, (seasons || []) as SeasonRow[]);
    const ratePlan = getRatePlanModifier(ratePlanId, (ratePlans || []) as RatePlanRow[]);
    const packageIdsList: string[] = Array.isArray(packageIds) ? packageIds : (packageIds ? [packageIds] : []);
    const guestServiceIdsList: string[] = Array.isArray(guestServiceIds) ? guestServiceIds : (guestServiceIds ? [guestServiceIds] : []);

    // Build a map of allotment availability by room type and date
    const allotmentAvailability = new Map<string, Map<string, number>>(); // roomTypeId -> date -> available
    if (operator_id && allotmentsList.length > 0) {
      for (const allotment of allotmentsList) {
        const key = `${allotment.room_type_id}`;
        if (!allotmentAvailability.has(key)) {
          allotmentAvailability.set(key, new Map());
        }
        const available = (allotment.blocked_qty || 0) - (allotment.picked_up_qty || 0);
        allotmentAvailability.get(key)!.set(allotment.stay_date, available);
      }
    }

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
      // Apply seasonal + rate-plan adjustment so public rates match front desk.
      const rate = getEffectiveNightlyRate(Number(roomType.base_price) || 0, season.multiplier, ratePlan.modifier);
      
      // Check allotment availability if operator is selected
      if (operator_id && allotmentAvailability.has(roomTypeId)) {
        const dateMap = allotmentAvailability.get(roomTypeId)!;
        let minAllotmentAvailable = Infinity;
        let currentDate = new Date(checkIn);
        while (currentDate < new Date(checkOut)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const available = dateMap.get(dateStr) || 0;
          minAllotmentAvailable = Math.min(minAllotmentAvailable, available);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        if (minAllotmentAvailable < qty) {
          return res.status(409).json({ error: `Only ${minAllotmentAvailable} ${roomType.name} room${minAllotmentAvailable === 1 ? '' : 's'} available in operator allotment for selected dates` });
        }
      } else {
        // Use regular availability check
        const availability = getTypeAvailability(roomType.name, checkIn, checkOut, roomsList, reservationsList, undefined, qty);
        if (!availability.can_book) {
          return res.status(409).json({ error: `Only ${availability.available} ${roomType.name} room${availability.available === 1 ? '' : 's'} available for selected dates` });
        }
      }
      
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

    const shuttleRequestsList = Array.isArray(airportShuttleRequests) ? airportShuttleRequests : [];
    const shuttleQuantity = shuttleRequestsList.reduce((sum, req) => sum + (Number(req.quantity) || 0), 0);

    let guestServicesTotal = 0;
    let shuttleServiceCounted = false;
    for (const gsid of guestServiceIdsList) {
      const gs = (guestServices || []).find((g: any) => g.id === gsid);
      if (gs) {
        const isShuttle = (gs.name || '').toLowerCase().includes('airport') || (gs.name || '').toLowerCase().includes('shuttle');
        if (isShuttle) {
          if (!shuttleServiceCounted) {
            guestServicesTotal += Number(gs.price) * Math.max(1, shuttleQuantity);
            shuttleServiceCounted = true;
          }
        } else {
          guestServicesTotal += Number(gs.price);
        }
      }
    }

    const subtotal = roomSubtotal + packageTotal + guestServicesTotal;
    // Unified fee engine (compounded VAT, honors all fee components) — shared
    // with the client and the front desk so displayed == stored == invoiced.
    const fees = computeFees(subtotal, feeComponents, taxPercent, serviceChargePercent);
    const tax = fees.tax;
    const serviceCharge = fees.serviceCharge;
    const additionalFees = fees.additionalFees;
    const voucherDiscountAmount = Number(voucher_discount) || 0;
    const totalAmount = subtotal + tax + serviceCharge + additionalFees - voucherDiscountAmount;

    const totalRoomCount = enrichedItems.reduce((sum, item) => sum + item.qty, 0);
    const isGroupBooking = totalRoomCount > 1;

    // ── Idempotency key: derived from email + dates + item fingerprint ──
    const idempotencyKey = req.headers['idempotency-key'] as string
      || `${guestEmail}::${checkIn}::${checkOut}::${enrichedItems.map(i => `${i.roomTypeName}x${i.qty}`).join(',')}::${Date.now()}`;

    // ── Single atomic RPC call — all inserts happen inside one Postgres txn ──
    const rpcPayload = {
      p_idempotency_key:   idempotencyKey,
      p_guest_name:        effectiveGuestName,
      p_guest_email:       guestEmail,
      p_guest_phone:       guestPhone || '',
      p_guest_nationality: guestNationality || '',
      p_special_requests:  specialRequests || '',
      p_check_in:          checkIn,
      p_check_out:         checkOut,
      p_items:             enrichedItems.map(i => ({
        roomTypeName: i.roomTypeName,
        roomTypeId:   i.roomTypeId,
        qty:          i.qty,
        rate:         i.rate,
        adults:       i.adults,
        children:     i.children,
      })),
      p_package_ids:       packageIdsList,
      p_guest_service_ids: guestServiceIdsList,
      p_package_total:     packageTotal,
      p_guest_svc_total:   guestServicesTotal,
      p_tax_percent:       taxPercent,
      p_svc_charge_pct:    serviceChargePercent,
      p_group_name:        groupName || null,
      p_operator_id:       operator_id && typeof operator_id === 'string' ? operator_id : null,
      // Absolute fee amounts from the unified engine so the RPC stores exactly
      // what the guest was shown (compounded VAT + additional fees).
      p_tax_amount:        tax,
      p_svc_amount:        serviceCharge,
      p_addon_amount:      additionalFees,
      p_channel:           'Direct Website',
      p_status:            'Waitlisted',
    };

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('create_booking_atomic', rpcPayload);

    if (rpcError) {
      const msg: string = rpcError.message || '';
      const details: string = rpcError.details || '';
      const hint: string = rpcError.hint || '';
      console.error('Atomic booking RPC error:', { message: msg, details, hint, code: rpcError.code, payload: rpcPayload });
      if (msg.includes('AVAILABILITY_ERROR:')) {
        return res.status(409).json({ error: msg.replace('AVAILABILITY_ERROR:', '').trim() });
      }
      return res.status(500).json({ error: 'Booking failed. Please try again.', details: msg });
    }

    const result = rpcResult as any;
    const reservationIds: string[] = result.reservationIds || [];
    const guestIds: string[] = result.guestIds || [];
    const guestId: string = guestIds[0] || result.guestId;
    const groupBookingId: string | null = result.groupId || null;

    // ── Auto-assign rooms to the new public reservations (individual or group) ──
    const roomAssignments: Record<string, string> = await autoAssignRoomsForPublicBookings(reservationIds, supabaseAdmin, checkIn, checkOut);

    // ── Airport shuttle requests (non-critical, outside atomic txn) ──
    const airportShuttleService = (guestServices || []).find((gs: any) => {
      const name = (gs.name || '').toLowerCase();
      return name.includes('airport') || name.includes('shuttle');
    });
    if (airportShuttleService && guestServiceIdsList.includes(airportShuttleService.id) && shuttleRequestsList.length > 0 && reservationIds.length > 0) {
      let shuttleIndex = 0;
      for (const shuttleReq of shuttleRequestsList) {
        const shuttleId = `shuttle_${Date.now()}_${shuttleIndex++}`;
        const { error: shuttleError } = await supabaseAdmin.from('airport_shuttle_requests').insert({
          id: shuttleId,
          guest_id: guestId,
          reservation_id: reservationIds[0],
          room_number: null,
          scheduled_date: shuttleReq.scheduledDate,
          scheduled_time: shuttleReq.scheduledTime,
          shuttle_type: shuttleReq.shuttleType,
          flight_number: shuttleReq.flightNumber || null,
          flight_time: shuttleReq.flightTime || null,
          status: 'Pending',
          notes: shuttleReq.notes || null,
          quantity: Math.max(1, Number(shuttleReq.quantity) || 1)
        });
        if (shuttleError) {
          console.error('Error creating airport shuttle request:', shuttleError);
        }
      }
    }

    await writeAuditEvent({
      req,
      action: isGroupBooking ? 'public_group_booking.created' : 'public_booking.created',
      entityType: isGroupBooking ? 'GroupBooking' : 'Reservation',
      entityId: groupBookingId || reservationIds[0] || guestId,
      module: 'public_booking',
      outcome: 'success',
      details: { guestEmail, reservationIds, groupBookingId, checkIn, checkOut, totalAmount, itemCount: cartItems.length, roomCount: totalRoomCount, isGroupBooking, idempotent: result.idempotent, roomAssignments }
    });

    // Handle voucher redemption if a voucher code was provided
    if (voucher_code && voucherDiscountAmount > 0) {
      try {
        await supabaseAdmin.rpc('redeem_voucher', {
          p_voucher_number: voucher_code,
          p_reservation_id: reservationIds[0] || groupBookingId,
          p_discount_amount: voucherDiscountAmount
        });
      } catch (e) {
        console.error('Failed to redeem voucher:', e);
        // Continue anyway - booking is successful even if voucher redemption fails
      }
    }

    // Update allotment pickup log if operator is selected
    if (operator_id && allotmentAvailability.size > 0) {
      try {
        const currentDate = new Date(checkIn);
        while (currentDate < new Date(checkOut)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          for (const item of enrichedItems) {
            const allotment = allotmentsList.find((a: any) => 
              a.room_type_id === item.roomTypeId && 
              a.stay_date === dateStr &&
              a.operator_id === operator_id
            );
            if (allotment) {
              await supabaseAdmin.from('allotment_pickup_log').insert({
                allotment_id: allotment.id,
                reservation_id: reservationIds[0] || groupBookingId,
                pickup_date: dateStr,
                quantity: item.qty,
                picked_up_by: 'system',
                notes: 'Auto-pickup from public booking'
              });
              // Update allotment picked_up_qty
              await supabaseAdmin.from('allotments')
                .update({ picked_up_qty: (allotment.picked_up_qty || 0) + item.qty })
                .eq('id', allotment.id);
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (e) {
        console.error('Failed to update allotment pickup log:', e);
        // Continue anyway - booking is successful even if allotment update fails
      }
    }

    return res.json({
      success: true,
      reservationIds,
      guestId,
      totalAmount,
      subtotal,
      tax,
      serviceCharge,
      additionalFees,
      voucherDiscount: voucherDiscountAmount,
      season: { name: season.name, multiplier: season.multiplier },
      ratePlan: { name: ratePlan.name, modifier: ratePlan.modifier },
      isGroupBooking,
      groupBookingId,
      status: 'Waitlisted',
      idempotent: result.idempotent || false,
      roomAssignments,
    });
  });

  app.post('/api/public/bookings/confirm-payment', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { reservationIds, paymentMethod, paymentDetails } = req.body || {};
    if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
      return res.status(400).json({ error: 'reservationIds is required' });
    }
    try {
      // 1. Ensure rooms are assigned before confirming payment (promotion)
      const roomAssignments = await autoAssignRoomsForPublicBookings(reservationIds, supabaseAdmin);

      // 2. Fetch current reservations to retrieve total_amount & existing payments
      const { data: reservations, error: fetchError } = await supabaseAdmin
        .from('reservations')
        .select('id, total_amount, payments, notes')
        .in('id', reservationIds);
        
      if (fetchError) throw fetchError;
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({ error: 'Reservations not found' });
      }

      // 3. Loop through and update each reservation with a real payment record
      for (const r of reservations) {
        const paymentObj = {
          description: `Direct Website Deposit Payment (${paymentMethod || 'Credit Card'})`,
          amount: r.total_amount,
          date: new Date().toISOString(),
          method: paymentMethod || 'Credit Card',
          details: paymentDetails || {}
        };
        const currentPayments = Array.isArray(r.payments) ? r.payments : [];
        const updatedPayments = [...currentPayments, paymentObj];
        
        const paymentNote = `Website direct payment confirmed via ${paymentMethod || 'Credit Card'}. Details: ${JSON.stringify(paymentDetails || {})}`;
        const updatedNotes = r.notes 
          ? `${r.notes}\n${paymentNote}`
          : paymentNote;

        const { error: updateError } = await supabaseAdmin
          .from('reservations')
          .update({
            status: 'Confirmed',
            payment_status: 'Paid',
            payments: updatedPayments,
            notes: updatedNotes
          })
          .eq('id', r.id);
          
        if (updateError) throw updateError;
      }

      // 3. Write a system audit log for the payment confirmation
      await writeAuditEvent({
        req,
        action: 'public_payment.confirmed',
        entityType: 'Reservation',
        entityId: reservationIds[0],
        module: 'public_booking',
        outcome: 'success',
        details: { reservationIds, paymentMethod, roomAssignments }
      });
      
      return res.json({ success: true, status: 'Confirmed', paymentStatus: 'Paid', roomAssignments });
    } catch (e: any) {
      console.error('Payment confirmation error:', e);
      return res.status(500).json({ error: e.message || 'Payment confirmation failed' });
    }
  });

  app.patch('/api/admin/settings', authenticate, requirePermission('settings:update'), async (req, res) => {
    const updates = await filterKnownColumns(camelToSnakeRecord(req.body || {}));
    
    // Encrypt API integration keys before storing
    if (updates.api_integrations) {
      try {
        const encrypted = processApiIntegrationsOnWrite(updates.api_integrations);
        updates.encrypted_api_integrations = encrypted;
        updates.api_integrations = [];
      } catch (e) {
        console.error('[CRYPTO] Failed to encrypt API integrations on write:', e);
      }
    }
    
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin.from('global_settings').select('id').maybeSingle();
      if (existing) {
        const { data, error } = await supabaseAdmin.from('global_settings').update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: req.user!.id
        }).eq('id', existing.id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        invalidateGlobalSettingsCache();
        await writeAuditEvent({ req, user: req.user!, action: 'settings.updated', entityType: 'GlobalSettings', entityId: existing.id, module: 'admin', details: { updates: Object.keys(updates) } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      } else {
        const newId = crypto.randomUUID();
        const { data, error } = await supabaseAdmin.from('global_settings').insert({
          id: newId,
          ...filterKnownColumns(updates),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: req.user!.id,
          updated_by: req.user!.id
        }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        invalidateGlobalSettingsCache();
        await writeAuditEvent({ req, user: req.user!, action: 'settings.created', entityType: 'GlobalSettings', entityId: newId, module: 'admin', details: { updates: Object.keys(updates) } });
        return res.json({ success: true, settings: data ? snakeToCamelRecord(data) : {} });
      }
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Audit Exceptions API
  // =====================
  app.get('/api/audit/exceptions', authenticate, requirePermission('audit:view'), async (_req, res) => {

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

  app.post('/api/audit/exceptions', authenticate, requirePermission('audit:view'), async (req, res) => {

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
          owner: owner || req.user?.name || 'Front Office'
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, exception: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/audit/exceptions/:id/resolve', authenticate, requirePermission('audit:view'), async (req, res) => {

    const id = req.params.id;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_exceptions')
        .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: req.user?.id || null })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, exception: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/audit/events', authenticate, async (req, res) => {
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
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Report Schedules / Versions / Historical Stats
  // =====================
  app.get('/api/report-schedules', authenticate, requirePermission('reports:view'), async (_req, res) => {

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

  app.post('/api/report-schedules', authenticate, requirePermission('reports:export'), async (req, res) => {

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
          created_by: req.user?.id || null
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, schedule: data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/report-versions', authenticate, requirePermission('reports:export'), async (req, res) => {

    const { reportName, fileSize, status } = req.body || {};
    if (!reportName) return res.status(400).json({ error: 'reportName is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('report_versions')
        .insert({
          report_name: reportName,
          file_size: fileSize || null,
          status: status || 'Draft',
          generated_by: req.user?.name || req.user?.id || null
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

  app.get('/api/admin/pending-changes', authenticate, async (_req, res) => {
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

  app.post('/api/admin/pending-changes', authenticate, async (req, res) => {
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
        submitted_by: body.submittedBy || req.user!.name || req.user!.email,
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
          submitted_by: body.submittedBy || req.user!.name || req.user!.email,
          status: 'Pending',
          payload: body.payload,
        });
      }
      if (result.error) return res.status(500).json({ error: result.error.message });
      await writeAuditEvent({ req, user: req.user, action: 'admin_change.submitted', module: 'governance', details: { changeId: body.id, title: body.title, changeType: body.changeType } });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/admin/pending-changes/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
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
      await writeAuditEvent({ req, user: req.user, action: `admin_change.${status.toLowerCase()}`, module: 'governance', details: { changeId, status } });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // /api/reports/email and /api/historical-stats are now in reports.routes.ts
  // Group bookings, group profiles, and guest-group relationships are now in groupProfiles.routes.ts

  // ============================================================================
  // GROUP PROFILE API ENDPOINTS (moved to groupProfiles.routes.ts)
  // ============================================================================

  // ID Card Upload for Check-In
  app.post('/api/guests/:id/id-card', authenticate, requirePermission('reservation:check_in'), async (req, res) => {
    const guestId = req.params.id;
    const { docType, docNumber, expiryDate, issueDate, issuingCountry, frontImageBase64, backImageBase64 } = req.body;

    if (!docType || !docNumber || !expiryDate) {
      return res.status(400).json({ error: 'docType, docNumber, and expiryDate are required' });
    }

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      let frontImageUrl = null;
      let backImageUrl = null;

      // Upload front image if provided
      if (frontImageBase64) {
        const frontBuffer = Buffer.from(frontImageBase64, 'base64');
        const frontFileName = `${guestId}-front-${Date.now()}.jpg`;
        const frontFilePath = `id-cards/${frontFileName}`;
        
        const { error: frontError } = await supabaseAdmin
          .storage
          .from('id-cards')
          .upload(frontFilePath, frontBuffer, { contentType: 'image/jpeg' });

        if (frontError) {
          console.error('Error uploading front ID card:', frontError);
          return res.status(500).json({ error: 'Failed to upload front ID card image' });
        }

        const { data: { publicUrl: frontPublicUrl } } = supabaseAdmin
          .storage
          .from('id-cards')
          .getPublicUrl(frontFilePath);
        
        frontImageUrl = frontPublicUrl;
      }

      // Upload back image if provided
      if (backImageBase64) {
        const backBuffer = Buffer.from(backImageBase64, 'base64');
        const backFileName = `${guestId}-back-${Date.now()}.jpg`;
        const backFilePath = `id-cards/${backFileName}`;
        
        const { error: backError } = await supabaseAdmin
          .storage
          .from('id-cards')
          .upload(backFilePath, backBuffer, { contentType: 'image/jpeg' });

        if (backError) {
          console.error('Error uploading back ID card:', backError);
          return res.status(500).json({ error: 'Failed to upload back ID card image' });
        }

        const { data: { publicUrl: backPublicUrl } } = supabaseAdmin
          .storage
          .from('id-cards')
          .getPublicUrl(backFilePath);
        
        backImageUrl = backPublicUrl;
      }

      // Update guest identification_doc using the database function
      const { data, error } = await supabaseAdmin.rpc('update_guest_id_card', {
        p_guest_id: guestId,
        p_doc_type: docType,
        p_doc_number: docNumber,
        p_expiry_date: expiryDate,
        p_issue_date: issueDate || null,
        p_issuing_country: issuingCountry || null,
        p_front_image_url: frontImageUrl || null,
        p_back_image_url: backImageUrl || null
      });

      if (error) {
        console.error('Error updating guest ID card:', error);
        return res.status(500).json({ error: error.message });
      }

      await writeAuditEvent({ 
        req, 
        user: req.user, 
        action: 'id_card_uploaded', 
        entityType: 'Guest', 
        entityId: guestId,
        module: 'check_in',
        details: { docType, docNumber, expiryDate, hasFrontImage: !!frontImageUrl, hasBackImage: !!backImageUrl }
      });

      return res.json({ success: true, identificationDoc: data });
    } catch (error) {
      console.error('Error in ID card upload:', error);
      return res.status(500).json({ error: 'Failed to upload ID card' });
    }
  });

  app.post('/api/reservations/:id/change-room', authenticate, requirePermission('reservation:update'), async (req, res) => {

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('change_room', {
        p_reservation_id: reservationId,
        p_new_room_number: roomNumber,
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Room change failed' });

      return res.json({ success: true, reservationId, fromRoom: data.fromRoom, toRoom: data.toRoom });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:id/check-in', authenticate, requirePermission('reservation:check_in'), async (req, res) => {

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('check_in_reservation', {
        p_reservation_id: reservationId,
        p_room_number: roomNumber,
        p_user_id: req.user!.id,
      });

      if (error) {
        console.error('check_in_reservation RPC error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Check-in failed' });

      return res.json({ success: true, reservationId, roomNumber, status: 'CheckedIn', folioId: data.folioId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // No-Show: mark reservation as NoShow with auto penalty charge
  app.post('/api/reservations/:id/no-show', authenticate, requirePermission('reservation:update'), async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('process_no_show', {
        p_reservation_id: reservationId,
        p_user_id: req.user!.id,
      });

      if (error) {
        console.error('process_no_show RPC error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.success) return res.status(409).json({ error: data?.error || 'No-show processing failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Cancel with auto penalty charge based on grace period
  app.post('/api/reservations/:id/cancel', authenticate, requirePermission('reservation:update'), async (req, res) => {
    const reservationId = req.params.id;
    const { reason } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('process_cancellation_penalty', {
        p_reservation_id: reservationId,
        p_user_id: req.user!.id,
        p_reason: reason || null,
      });

      if (error) {
        console.error('process_cancellation_penalty RPC error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Cancellation failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Re-lookup helper used both for the happy path and as a race-recovery path
  // when a concurrent request wins the insert race (unique violation).
  async function findOpenFolio(reservationId: string, targetFolio?: string) {
    let query = supabaseAdmin!
      .from('folios')
      .select('id, folio_type, target_folio')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open');

    if (targetFolio) {
      query = query.eq('target_folio', targetFolio);
    } else {
      query = query.in('folio_type', ['Guest', 'Master']);
    }

    const { data: existing } = await query.maybeSingle();
    if (existing) return existing.id;

    // If no primary folio exists but other folios do, get the first open one
    const { data: anyFolio } = await supabaseAdmin!
      .from('folios')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open')
      .maybeSingle();
    return anyFolio ? anyFolio.id : null;
  }

  async function ensureFolio(reservationId: string, userId: string, targetFolio?: string) {
    if (!supabaseAdmin) return null;

    const existingId = await findOpenFolio(reservationId, targetFolio);
    if (existingId) return existingId;

    const { data: reservation } = await supabaseAdmin
      .from('reservations')
      .select('status, total_amount, channel, group_booking_id, discount_percent, room_type')
      .eq('id', reservationId)
      .maybeSingle();

    if (!reservation) return null;

    const isCorporate = reservation.channel === 'Corporate' || reservation.group_booking_id != null;

    // Pre-tax base amount for the initial charge. The discount is now applied
    // inside post_folio_charge RPC via p_discount_percent parameter, ensuring
    // consistent fee/tax calculation with the backend. This folio-creation fallback
    // path runs whenever a charge/payment is posted BEFORE check_in_reservation
    // has run (e.g., collecting a pre-arrival deposit), so without seeding a real
    // charge line here the folio would sit at $0.00 total_charges forever.
    const rawTotal = reservation.total_amount || 0;
    const discountPct = reservation.discount_percent || 0;

    if (isCorporate) {
      // Create split folios: Master (A) + Guest (B). The `folios.balance`/
      // `total_charges` columns start at 0 (they're just a cache); the real
      // room charge is posted as an actual folio_line via post_folio_charge
      // below so /folio-balance and /payments (which sum folio_lines/
      // folio_payments directly) see the true amount due.
      const folioA = crypto.randomUUID();
      const folioB = crypto.randomUUID();
      const { error: errA } = await supabaseAdmin.from('folios').insert({
        id: folioA,
        reservation_id: reservationId,
        folio_type: 'Master',
        target_folio: 'A',
        status: 'Open',
        balance: 0,
        total_charges: 0,
        total_payments: 0,
        currency: 'USD',
        opened_at: new Date().toISOString(),
        created_by: userId,
      });
      if (errA?.code === '23505') {
        // Lost the creation race - another request created it concurrently.
        const raceWinner = await findOpenFolio(reservationId, targetFolio);
        if (raceWinner) return raceWinner;
      }
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

      // Corporate stays put the room charge on the Master (A) folio, same as
      // check_in_reservation - the Guest (B) folio stays at $0 for incidentals.
      if (rawTotal > 0) {
        await supabaseAdmin.rpc('post_folio_charge', {
          p_folio_id: folioA,
          p_description: `Room charge - ${reservation.room_type || 'reservation'} (pre-arrival)`,
          p_amount: rawTotal,
          p_quantity: 1,
          p_line_type: 'Room',
          p_revenue_account_code: null,
          p_user_id: userId,
          p_source_reference: null,
          p_discount_percent: discountPct,
        });
      }
      return targetFolio === 'B' ? folioB : folioA;
    }

    // Individual booking: single Guest folio
    const folioId = crypto.randomUUID();
    const { error: errGuest } = await supabaseAdmin.from('folios').insert({
      id: folioId,
      reservation_id: reservationId,
      folio_type: 'Guest',
      status: 'Open',
      balance: 0,
      total_charges: 0,
      total_payments: 0,
      currency: 'USD',
      opened_at: new Date().toISOString(),
      created_by: userId,
    });
    if (errGuest?.code === '23505') {
      // Lost the creation race - another request created it concurrently.
      const raceWinner = await findOpenFolio(reservationId, targetFolio);
      if (raceWinner) return raceWinner;
    }

    if (rawTotal > 0) {
      await supabaseAdmin.rpc('post_folio_charge', {
        p_folio_id: folioId,
        p_description: `Room charge - ${reservation.room_type || 'reservation'} (pre-arrival)`,
        p_amount: rawTotal,
        p_quantity: 1,
        p_line_type: 'Room',
        p_revenue_account_code: null,
        p_user_id: userId,
        p_source_reference: null,
        p_discount_percent: discountPct,
      });
    }
    return folioId;
  }

  app.post('/api/reservations/:id/charges', authenticate, requirePermission('folio:charge:add'), async (req, res) => {

    const reservationId = req.params.id;
    const { description, amount, quantity, lineType, revenueAccountCode, sourceReference, discountPercent, targetFolio, usaliCode, usaliRevenueCode, usaliCostCode, department } = req.body;

    if (!description || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'description and positive amount are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, req.user!.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      const { data, error } = await supabaseAdmin.rpc('post_folio_charge', {
        p_folio_id: folioId,
        p_description: description,
        p_amount: amount,
        p_quantity: quantity || 1,
        p_line_type: lineType || 'Extra',
        p_revenue_account_code: revenueAccountCode || null,
        p_user_id: req.user!.id,
        p_source_reference: sourceReference || null,
        p_discount_percent: discountPercent || 0,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Charge failed' });

      // Update folio line with USALI codes if provided
      const updates: Record<string, any> = {};
      if (usaliCode) updates.usali_code = usaliCode;
      if (usaliRevenueCode) updates.usali_revenue_code = usaliRevenueCode;
      if (usaliCostCode) updates.usali_cost_code = usaliCostCode;
      if (department) updates.department = department;
      
      // If an explicit targetFolio was provided, stamp it on the line row.
      // post_folio_charge inherits target_folio from the folio itself; a per-
      // charge override (e.g. manually routing to A or B) requires a follow-up
      // update here. This also fires the sync trigger so reservations.charges
      // gets the correct targetFolio in its JSONB.
      if (targetFolio === 'A' || targetFolio === 'B') {
        updates.target_folio = targetFolio;
      }

      // Apply all updates (USALI codes + targetFolio) in a single call
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('folio_lines')
          .update(updates)
          .eq('id', data.lineId);
      }

      // Keep the cached folio totals and reservation.payment_status in sync
      // with the newly added charge (single source of truth = folio_lines).
      const { data: recomputed } = await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: folioId });
      await supabaseAdmin.rpc('sync_reservation_payment_status', { p_folio_id: folioId });

      return res.json({
        success: true,
        folioId,
        lineId: data.lineId,
        lineNumber: data.lineNumber,
        newBalance: recomputed?.balance ?? data.newBalance,
      });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Public billing calculation endpoint (no auth required for public booking portal)
  app.get('/api/public/billing/calculate-breakdown', async (req, res) => {
    const { baseAmount, discountPercent, reservationId } = req.query;

    if (!baseAmount || isNaN(Number(baseAmount))) {
      return res.status(400).json({ error: 'baseAmount is required and must be a number' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('calculate_billing_breakdown', {
          p_base_amount: Number(baseAmount),
          p_discount_percent: discountPercent ? Number(discountPercent) : 0,
          p_reservation_id: reservationId || null,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/billing/calculate-breakdown', authenticate, async (req, res) => {
    const { baseAmount, discountPercent, reservationId } = req.query;

    const hasBase = baseAmount !== undefined && baseAmount !== '' && !isNaN(Number(baseAmount));
    const hasReservation = reservationId !== undefined && reservationId !== '';

    if (!hasBase && !hasReservation) {
      return res.status(400).json({ error: 'Either baseAmount or reservationId is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('calculate_billing_breakdown', {
          p_base_amount: hasBase ? Number(baseAmount) : null,
          p_discount_percent: discountPercent ? Number(discountPercent) : 0,
          p_reservation_id: hasReservation ? String(reservationId) : null,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/reservations/:id/folio-balance', authenticate, async (req, res) => {
    const reservationId = req.params.id;
    const { folioType = 'consolidated' } = req.query; // 'consolidated', 'folio-a', 'folio-b'

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const folioId = await ensureFolio(reservationId, req.user!.id);
        if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

        // Get the folio's own target_folio to use as fallback for lines that
        // have NULL target_folio (single non-split folio scenario).
        const { data: folioRow } = await supabaseAdmin
          .from('folios')
          .select('target_folio')
          .eq('id', folioId)
          .single();
        const folioOwnTarget: string | null = folioRow?.target_folio ?? null;

        // Get total charges
        const { data: chargesData } = await supabaseAdmin
          .from('folio_lines')
          .select('amount, target_folio')
          .eq('folio_id', folioId)
          .eq('is_voided', false);

        // Get total payments
        const { data: paymentsData } = await supabaseAdmin
          .from('folio_payments')
          .select('amount, target_folio')
          .eq('folio_id', folioId)
          .eq('is_voided', false);

        // Resolve a line/payment's effective folio side, falling back to the
        // folio's own target_folio when the row has NULL.
        const resolveTarget = (rowTarget: string | null) =>
          rowTarget ?? folioOwnTarget;

        let totalCharges = 0;
        let totalPayments = 0;

        if (folioType === 'consolidated') {
          totalCharges = (chargesData || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        } else if (folioType === 'folio-a') {
          totalCharges = (chargesData || []).filter((c: any) => resolveTarget(c.target_folio) === 'A').reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).filter((p: any) => resolveTarget(p.target_folio) === 'A').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        } else if (folioType === 'folio-b') {
          totalCharges = (chargesData || []).filter((c: any) => resolveTarget(c.target_folio) === 'B').reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).filter((p: any) => resolveTarget(p.target_folio) === 'B').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        }

        const outstandingBalance = Math.round((totalCharges - totalPayments) * 100) / 100;

        return res.json({
          folioId,
          folioType,
          totalCharges: Math.round(totalCharges * 100) / 100,
          totalPayments: Math.round(totalPayments * 100) / 100,
          outstandingBalance
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Get reservation balance from database (DB-only calculation)
  app.get('/api/reservations/:id/balance', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_reservation_balance', {
          p_reservation_id: reservationId,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Canonical folio read endpoint (Phase 2)
  // Returns the folios, itemized charges/payments and computed balances for a reservation
  // so the frontend no longer needs to parse the legacy reservations.charges/payments JSONB.
  // Also returns a billing breakdown from get_reservation_billing RPC (Step 2.2).
  app.get('/api/reservations/:id/folio', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data: folios, error: foliosError } = await supabaseAdmin
          .from('folios')
          .select('*')
          .eq('reservation_id', reservationId)
          .order('opened_at', { ascending: false });

        if (foliosError) return res.status(500).json({ error: foliosError.message });

        const folioIds = (folios || []).map(f => f.id);

        const [{ data: lines }, { data: payments }, { data: billingBreakdown, error: rpcError }] = await Promise.all([
          supabaseAdmin
            .from('folio_lines')
            .select('*')
            .in('folio_id', folioIds)
            .eq('is_voided', false)
            .order('line_number', { ascending: true }),
          supabaseAdmin
            .from('folio_payments')
            .select('*')
            .in('folio_id', folioIds)
            .eq('is_voided', false)
            .order('payment_date', { ascending: true }),
          supabaseAdmin.rpc('get_reservation_billing', { p_reservation_id: reservationId }),
        ]);

        if (rpcError) {
          console.error('[folio endpoint] get_reservation_billing RPC error:', rpcError.message);
        }

        return res.json({
          folios: (folios || []).map(mapFolioFromDb),
          lines: (lines || []).map(mapFolioLineFromDb),
          payments: (payments || []).map(mapFolioPaymentFromDb),
          consolidatedBalance: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.balance) || 0),
            0
          ),
          consolidatedCharges: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.total_charges) || 0),
            0
          ),
          consolidatedPayments: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.total_payments) || 0),
            0
          ),
          billingBreakdown: billingBreakdown || null,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Get reservation total breakdown from database (DB-only calculation)
  app.get('/api/reservations/:id/total', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_reservation_total', {
          p_reservation_id: reservationId,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Get effective nightly rate from database (DB-only calculation)
  app.get('/api/rates/effective', authenticate, async (req, res) => {
    const { roomType, checkInDate, ratePlanId } = req.query;

    if (!roomType || !checkInDate) {
      return res.status(400).json({ error: 'roomType and checkInDate are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_effective_nightly_rate', {
          p_room_type: roomType,
          p_check_in_date: checkInDate,
          p_rate_plan_id: ratePlanId || null,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:id/payments', authenticate, requirePermission('folio:payment:add'), async (req, res) => {

    const reservationId = req.params.id;
    const { amount, paymentMethod, reference, receiptUrl, idempotencyKey, bankAccountId, paymentSplits } = req.body;

    // Support both single payment and split payments
    const splits = paymentSplits || [{ amount, paymentMethod, reference, receiptUrl, bankAccountId, idempotencyKey }];

    // Validate splits
    const totalSplitAmount = splits.reduce((sum: number, split: any) => sum + (split.amount || 0), 0);
    if (typeof totalSplitAmount !== 'number' || totalSplitAmount <= 0) {
      return res.status(400).json({ error: 'Total payment amount must be positive' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, req.user!.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      // Calculate outstanding balance at the endpoint level for total validation
      const { data: folioData } = await supabaseAdmin
        .from('folios')
        .select('status')
        .eq('id', folioId)
        .single();

      if (!folioData || folioData.status !== 'Open') {
        return res.status(400).json({ error: 'Folio is not open' });
      }

      // Get total charges
      const { data: chargesData } = await supabaseAdmin
        .from('folio_lines')
        .select('amount')
        .eq('folio_id', folioId)
        .eq('is_voided', false);

      const totalCharges = Math.round((chargesData || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0) * 100) / 100;

      // Get total payments
      const { data: paymentsData } = await supabaseAdmin
        .from('folio_payments')
        .select('amount')
        .eq('folio_id', folioId)
        .eq('is_voided', false);

      const totalPayments = Math.round((paymentsData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) * 100) / 100;

      const outstandingBalance = Math.round((totalCharges - totalPayments) * 100) / 100;

      // Validate total payment amount against outstanding balance
      // Use a larger tolerance for floating point precision issues
      if (totalSplitAmount > outstandingBalance + 0.05) {
        return res.status(409).json({
          error: 'Payment amount exceeds outstanding balance',
          outstandingBalance: Math.round(outstandingBalance * 100) / 100,
          requestedAmount: Math.round(totalSplitAmount * 100) / 100
        });
      }

      const paymentResults = [];
      const now = new Date().toISOString();

      // Get VAT rate from settings (default 15%)
      const { data: settings } = await supabaseAdmin
        .from('global_settings')
        .select('tax_percent, revenue_mappings')
        .eq('id', 'main')
        .single();

      const vatRate = (settings?.tax_percent || 15) / 100;
      const revenueAccountCode = settings?.revenue_mappings?.roomRevenueAccount || '4010';

      // Process each payment split
      for (const split of splits) {
        const { amount: splitAmount, paymentMethod: splitMethod, reference: splitReference, receiptUrl: splitReceiptUrl, bankAccountId: splitBankAccountId, idempotencyKey: splitIdempotencyKey } = split;
        
        if (!splitMethod || typeof splitAmount !== 'number' || splitAmount <= 0) {
          return res.status(400).json({ error: 'Each split must have a valid amount and payment method' });
        }

        const { data, error } = await supabaseAdmin.rpc('post_folio_payment', {
          p_folio_id: folioId,
          p_amount: splitAmount,
          p_payment_method: splitMethod,
          p_reference: splitReference || null,
          p_user_id: req.user!.id,
          p_receipt_url: splitReceiptUrl || null,
          p_idempotency_key: splitIdempotencyKey || null,
          p_bank_account_id: splitBankAccountId || null,
        });

        if (error) return res.status(500).json({ error: error.message });
        if (!data?.success) return res.status(409).json({ error: data?.error || 'Payment failed' });

        // Handle idempotent response
        if (data?.idempotent) {
          paymentResults.push({
            success: true,
            folioId,
            paymentId: data.paymentId,
            idempotent: true,
            message: data.message,
            amount: splitAmount,
            method: splitMethod
          });
          continue;
        }

        // Create journal entry for this split
        try {
          const paymentId = data.paymentId;
          const vatAmount = splitAmount * vatRate;
          
          // Create journal entry
          const { data: journalEntry } = await supabaseAdmin
            .from('journal_entries')
            .insert({
              id: crypto.randomUUID(),
              date: now.split('T')[0],
              reference: `FOLIO-PAY-${paymentId}`,
              description: `Folio Payment - Reservation ${reservationId} (${splitMethod})`,
              status: 'Posted',
              created_by: req.user!.id,
              amount: splitAmount,
              department: 'Rooms'
            })
            .select('id')
            .single();
          
          if (journalEntry) {
            const journalEntryId = journalEntry.id;
            
            // Get bank account details if provided
            let bankAccount = null;
            if (splitBankAccountId) {
              const { data: ba } = await supabaseAdmin
                .from('bank_accounts')
                .select('coa_account_code, bank_name')
                .eq('id', splitBankAccountId)
                .single();
              bankAccount = ba;
            }
            
            const coaAccountCode = bankAccount?.coa_account_code || '1100';
            const accountName = bankAccount?.bank_name || 'Accounts Receivable';
            
            // Debit leg: Bank account or Accounts Receivable
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: coaAccountCode,
              account_name: accountName,
              description: `Payment received for folio ${folioId} (${splitMethod})`,
              debit: splitAmount,
              credit: 0
            });
            
            // Credit leg: Revenue account (excluding VAT)
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: revenueAccountCode,
              account_name: 'Room Revenue',
              description: `Room revenue from folio ${folioId} (${splitMethod})`,
              debit: 0,
              credit: splitAmount - vatAmount
            });
            
            // Credit leg: VAT Payable
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: '2020',
              account_name: 'VAT Payable',
              description: `VAT on folio payment ${folioId} (${splitMethod})`,
              debit: 0,
              credit: vatAmount
            });
            
            // Update chart of accounts balances
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', coaAccountCode).single()).data?.balance + splitAmount })
              .eq('code', coaAccountCode);
            
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', revenueAccountCode).single()).data?.balance - (splitAmount - vatAmount) })
              .eq('code', revenueAccountCode);
            
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', '2020').single()).data?.balance - vatAmount })
              .eq('code', '2020');
          }
        } catch (journalError) {
          console.error('Failed to create journal entry:', journalError);
          // Continue anyway - payment was successful
        }

        paymentResults.push({
          success: true,
          folioId,
          paymentId: data.paymentId,
          amount: splitAmount,
          method: splitMethod,
          bankAccountId: splitBankAccountId
        });
      }

      // Recompute the folio's authoritative totals from folio_lines/folio_payments
      // (single source of truth) and sync reservations.payment_status. A partial
      // payment intentionally leaves the folio status untouched (stays 'Open') -
      // only an explicit checkout/invoice action closes a folio.
      const { data: recomputed } = await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: folioId });
      await supabaseAdmin.rpc('sync_reservation_payment_status', { p_folio_id: folioId });

      return res.json({ 
        success: true, 
        folioId, 
        paymentResults,
        totalAmount: totalSplitAmount,
        splitCount: paymentResults.length,
        remainingBalance: recomputed?.balance ?? Math.max(0, outstandingBalance - totalSplitAmount),
        totalCharges: recomputed?.totalCharges,
        totalPayments: recomputed?.totalPayments,
        folioStatus: 'Open',
      });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:reservationId/charges/:chargeId/void', authenticate, requirePermission('folio:charge:void'), async (req, res) => {

    const { chargeId } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) return res.status(400).json({ error: 'reason is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('void_folio_line', {
        p_line_id: chargeId,
        p_reason: reason,
        p_user_id: req.user!.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, lineId: chargeId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/reservations/:reservationId/charges/:chargeId', authenticate, requirePermission('folio:charge:add'), async (req, res) => {
    const { chargeId } = req.params;
    const { targetFolio, amount } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updates: Record<string, any> = {};
      if (targetFolio === 'A' || targetFolio === 'B' || targetFolio === null) {
        updates.target_folio = targetFolio;
      }
      if (typeof amount === 'number' && amount > 0) {
        updates.amount = amount;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { error } = await supabaseAdmin
        .from('folio_lines')
        .update(updates)
        .eq('id', chargeId);

      if (error) return res.status(500).json({ error: error.message });

      // Fire sync to keep reservations.charges JSONB in sync
      const { data: lineRow } = await supabaseAdmin
        .from('folio_lines')
        .select('folio_id')
        .eq('id', chargeId)
        .single();
      if (lineRow?.folio_id) {
        await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: lineRow.folio_id });
      }

      return res.json({ success: true, lineId: chargeId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/reservations/:reservationId/charges/:chargeId/move', authenticate, requirePermission('folio:charge:add'), async (req, res) => {

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
        const targetFolioId = await ensureFolio(targetReservationId, req.user!.id);
        if (!targetFolioId) return res.status(404).json({ error: 'Target reservation not found or cannot create folio' });

        const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
          p_line_id: chargeId,
          p_target_folio_id: targetFolioId,
          p_user_id: req.user!.id,
        });

        if (error) return res.status(500).json({ error: error.message });
        if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

        return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
      }

      const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
        p_line_id: chargeId,
        p_target_folio_id: targetFolio.id,
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

      return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/folio-payments/audit', authenticate, async (req, res) => {
    const { startDate, endDate, paymentMethod, search } = req.query;

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      // Simple query without complex joins first
      let query = supabaseAdmin
        .from('folio_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (startDate) {
        query = query.gte('payment_date', startDate);
      }
      if (endDate) {
        query = query.lte('payment_date', endDate);
      }
      if (paymentMethod) {
        query = query.eq('payment_method', paymentMethod);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching folio payments audit:', error);
        return res.status(500).json({ error: 'Failed to fetch folio payments', details: error.message });
      }

      // Fetch folio details for each payment
      const paymentsWithDetails = await Promise.all(
        (data || []).map(async (payment) => {
          const sa = supabaseAdmin!;
          const { data: folio } = await sa
            .from('folios')
            .select('reservation_id, folio_type, status')
            .eq('id', payment.folio_id)
            .single();

          let reservation = null;
          if (folio?.reservation_id) {
            const { data: res } = await sa
              .from('reservations')
              .select('id, guest_name, room_number, check_in_date, check_out_date')
              .eq('id', folio.reservation_id)
              .single();
            reservation = res;
          }

          // Fetch invoice details if payment is linked to an invoice
          let invoice = null;
          if (payment.invoice_id) {
            const { data: inv } = await sa
              .from('invoice_documents')
              .select('id, invoice_number, invoice_type, issue_date, total, status')
              .eq('id', payment.invoice_id)
              .single();
            invoice = inv;
          }

          // Fetch bank account details if payment has a bank account
          let bankAccount = null;
          if (payment.bank_account_id) {
            const { data: bank } = await sa
              .from('bank_accounts')
              .select('id, account_name, account_number, bank_name')
              .eq('id', payment.bank_account_id)
              .single();
            bankAccount = bank;
          }

          return {
            ...payment,
            folios: folio,
            reservations: reservation,
            invoice_documents: invoice,
            bank_accounts: bankAccount
          };
        })
      );

      // Client-side filtering for search
      let filteredPayments = paymentsWithDetails || [];
      if (search) {
        const searchLower = String(search).toLowerCase();
        filteredPayments = filteredPayments.filter(p =>
          (p.reservations?.guest_name?.toLowerCase().includes(searchLower)) ||
          (p.reservations?.room_number?.toLowerCase().includes(searchLower)) ||
          (p.reference_number?.toLowerCase().includes(searchLower))
        );
      }

      return res.json({ payments: filteredPayments });
    } catch (err: any) {
      console.error('Unexpected error fetching folio payments:', err);
      return res.status(500).json({ error: 'Failed to fetch folio payments', details: err.message });
    }
  });

  app.post('/api/reservations/:reservationId/payments/:paymentId/void', authenticate, requirePermission('folio:payment:void'), async (req, res) => {

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
        p_user_id: req.user!.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, paymentId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/folio-lines/:lineId/move', authenticate, requirePermission('folio:charge:add'), async (req, res) => {

    const { lineId } = req.params;
    const { targetFolioId } = req.body;

    if (!targetFolioId) return res.status(400).json({ error: 'targetFolioId is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
        p_line_id: lineId,
        p_target_folio_id: targetFolioId,
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

      return res.json({ success: true, lineId, fromFolio: data.fromFolio, toFolio: data.toFolio });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/night-audit/run', authenticate, requirePermission('night_audit:run'), async (req, res) => {

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('run_night_audit', {
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Night audit failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // ═══════════════════════════════════════════════════════════
  // B2B ROUTES — Tour Operators
  // ═══════════════════════════════════════════════════════════
  app.use('/api/b2b', b2bRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/v1/finance', financeV1Routes);
  app.use('/api/finance/budgeting', budgetingRoutes);
  app.use('/api/finance/tax', taxRoutes);
  app.use('/api/finance/fpa', fpaRoutes);
  app.use('/api/finance/multiproperty', multipropertyRoutes);
  app.use('/api/pos', posRoutes);
  app.use('/api/kds', kdsRoutes);
  app.use('/api/fb/kitchen', kitchenRoutes);
  app.use('/api/fb/bar', barRoutes);
  app.use('/api/fb/unified-inventory', unifiedInventoryRoutes);
  app.use('/api/fb/unified-products', unifiedProductRoutes);
  app.use('/api/fb/production-planning', productionPlanningRoutes);
  app.use('/api/fb/outlet-transfers', outletTransferRoutes);
  app.use('/api/fb/cost-variance', costVarianceRoutes);
  app.use('/api/fb/pos-sync', posSyncRoutes);
  app.use('/api/fb/manager-pin', managerPinRoutes);
  app.use('/api/fb/menu-enhancements', menuEnhancementsRoutes);
  app.use('/api/hardware', hardwareRoutes);
  app.use('/api/fb/tables', tableManagementRoutes);
  app.use('/api/fb/procurement', procurementRoutes);
  app.use('/api/fb/menu-analytics', menuAnalyticsRoutes);
  app.use('/api/fb/guest-staff', guestStaffRoutes);
  app.use('/api/fb/online-ordering', onlineOrderingRoutes);
  app.use('/api/ops/portal', operationsPortalRoutes);
  app.use('/api/ops/ai', operationsAIRoutes);
  app.use('/api/ops/iot', operationsIoTRoutes);
  app.use('/api/ops/optimization', operationsOptimizationRoutes);
  app.use('/api/ops/analytics', operationsAnalyticsRoutes);
  app.use('/api/ops/supply-chain', operationsSupplyChainRoutes);
  app.use('/api/ops/housekeeping', operationsHousekeepingRoutes);
  app.use('/api/ops/safety', operationsSafetyRoutes);
  app.use('/api/executive', executiveRoutes);
  app.use('/api/hk-portal', housekeepingPortalRoutes);
  app.use('/api/eng-portal', engineeringPortalRoutes);
  app.use('/api/inv-portal', inventoryPortalRoutes);
  app.use('/api/hr-portal', hrPayrollPortalRoutes);
  app.use('/api/proc-portal', procurementPortalRoutes);
  app.use('/api/sales-events', salesEventsPortalRoutes);
  app.use('/api/guest-portal', guestMobilePortalRoutes);
  app.use('/api/accounts-payable', accountsPayableRoutes);
  app.use('/api/bank-reconciliation', bankReconciliationRoutes);
  app.use('/api/fixed-assets', fixedAssetsRoutes);
  app.use('/api/trial-balance', trialBalanceRoutes);
  app.use('/api/financial-statements', financialStatementsRoutes);
  app.use('/api/erca-vat', ercaVatRoutes);
  app.use('/api/period-close', periodCloseRoutes);
  app.use('/api/food-beverage', foodBeverageRoutes);
  app.use('/api/operations', operationsManagerRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', reservationsRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/standard-reports', standardReportsRoutes);
  app.use('/api/gift-shop', giftShopRoutes);
  app.use('/api', groupProfilesRoutes);
  // app.use('/api/rms', rmsRoutes); // TODO: Create RMS routes when backend is ready

  // ═══════════════════════════════════════════════════════════
  // PROPERTIES (Multi-property) ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get('/api/properties', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const [propsResult, orgsResult] = await Promise.all([
      supabaseAdmin.from('properties').select('*').eq('is_active', true).order('property_name'),
      supabaseAdmin.from('organizations').select('*').order('org_name'),
    ]);
    if (propsResult.error) return res.status(500).json({ error: propsResult.error.message });
    if (orgsResult.error) return res.status(500).json({ error: orgsResult.error.message });
    res.json({ properties: propsResult.data || [], organizations: orgsResult.data || [] });
  });

  app.post('/api/properties', authenticate, requirePermission('settings:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { property_name, property_code, organization_id, currency_code, property_type } = req.body;
    if (!property_name) return res.status(400).json({ error: 'property_name is required' });
    if (!organization_id) return res.status(400).json({ error: 'organization_id is required' });
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({ property_name, property_code: property_code || property_name.toUpperCase().replace(/\s/g, '-'), organization_id, currency_code: currency_code || 'ETB', property_type: property_type || 'hotel' })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ property: data });
  });

  app.patch('/api/properties/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const allowed = ['property_name', 'property_code', 'property_type', 'currency_code', 'organization_id', 'is_active', 'contact_email', 'contact_phone', 'star_rating', 'timezone'];
    const updates: Record<string, any> = {};
    for (const f of allowed) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const { data, error } = await supabaseAdmin.from('properties').update(updates).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ property: data });
  });

  app.delete('/api/properties/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('properties').update({ is_active: false }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // RESERVATION SERIES (Recurring Reservations) ROUTES
  // ═══════════════════════════════════════════════════════════

  // List all series
  app.get('/api/reservation-series', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { data, error } = await supabaseAdmin
      .from('reservation_series')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ series: data || [] });
  });

  // Get series details with child reservations
  app.get('/api/reservation-series/:id', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const [seriesResult, reservationsResult] = await Promise.all([
      supabaseAdmin.from('reservation_series').select('*').eq('id', id).single(),
      supabaseAdmin.from('reservations').select('id, check_in_date, check_out_date, status, room_number').eq('series_id', id).order('check_in_date'),
    ]);
    if (seriesResult.error) return res.status(500).json({ error: seriesResult.error.message });
    res.json({ series: seriesResult.data, reservations: reservationsResult.data || [] });
  });

  // Create series and generate child reservations
  app.post('/api/reservation-series', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const {
      series_name, guest_name, guest_email, guest_phone, guest_status,
      room_type, adults, children, rate, channel, payment_status, notes,
      frequency, interval_days, days_of_week, check_in_offset,
      start_date, end_date, property_id
    } = req.body;

    if (!series_name || !guest_name || !room_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'series_name, guest_name, room_type, start_date, and end_date are required' });
    }
    if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
    }
    const nights = Math.max(1, check_in_offset || 1);

    // Insert the series record
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('reservation_series')
      .insert({
        series_name, guest_name, guest_email, guest_phone,
        guest_status: guest_status || 'Regular',
        room_type, adults: adults || 1, children: children || 0,
        rate: rate || 0, channel: channel || 'Direct Website',
        payment_status: payment_status || 'Unpaid', notes,
        frequency, interval_days: interval_days || 1,
        days_of_week: days_of_week || null,
        check_in_offset: nights,
        start_date, end_date,
        property_id: property_id || null,
      })
      .select('*')
      .single();
    if (seriesError) return res.status(500).json({ error: seriesError.message });

    const seriesId = seriesData.id;

    // Generate occurrence dates
    const { data: datesData, error: datesError } = await supabaseAdmin
      .rpc('generate_series_dates', {
        p_frequency: frequency,
        p_interval: interval_days || 1,
        p_days_of_week: days_of_week || null,
        p_start_date: start_date,
        p_end_date: end_date,
      });
    if (datesError) return res.status(500).json({ error: `Date generation failed: ${datesError.message}` });

    const occurrences: any[] = datesData || [];
    if (occurrences.length === 0) {
      return res.json({ series: seriesData, generatedCount: 0, message: 'No occurrences generated for the given pattern.' });
    }

    // Build reservation rows
    const reservationRows = occurrences.map((occ: any) => {
      const checkIn = occ.occurrence_date;
      const checkOutDate = new Date(checkIn);
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      const checkOutStr = checkOutDate.toISOString().split('T')[0];
      const resId = `RS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      return {
        id: resId,
        series_id: seriesId,
        guest_name, guest_email, guest_phone,
        guest_status: guest_status || 'Regular',
        room_type,
        check_in_date: checkIn,
        check_out_date: checkOutStr,
        adults: adults || 1,
        children: children || 0,
        status: 'Waitlisted',
        rate: rate || 0,
        total_amount: (rate || 0) * nights,
        channel: channel || 'Direct Website',
        payment_status: payment_status || 'Unpaid',
        notes: notes || null,
        property_id: property_id || null,
      };
    });

    // Batch insert reservations
    const { error: insertError } = await supabaseAdmin
      .from('reservations')
      .insert(reservationRows);
    if (insertError) return res.status(500).json({ error: `Series created but reservation generation failed: ${insertError.message}` });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.created',
      entityType: 'ReservationSeries',
      entityId: seriesId,
      module: 'reservations',
      details: { series_name, frequency, occurrences: occurrences.length },
    });

    res.json({ series: seriesData, generatedCount: occurrences.length });
  });

  // Cancel a series and all future child reservations
  app.delete('/api/reservation-series/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    // Mark series inactive
    const { error: seriesErr } = await supabaseAdmin.from('reservation_series').update({ is_active: false }).eq('id', id);
    if (seriesErr) return res.status(500).json({ error: seriesErr.message });
    // Cancel all future reservations in the series that are still Waitlisted/Confirmed
    const today = new Date().toISOString().split('T')[0];
    const { error: resErr } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'Cancelled' })
      .eq('series_id', id)
      .in('status', ['Waitlisted', 'Confirmed'])
      .gte('check_in_date', today);
    if (resErr) return res.status(500).json({ error: resErr.message });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.cancelled',
      entityType: 'ReservationSeries',
      entityId: id,
      module: 'reservations',
    });

    res.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // LOYALTY PROGRAM ROUTES
  // ═══════════════════════════════════════════════════════════

  // Get loyalty transaction history for a guest
  app.get('/api/loyalty/transactions/:guestId', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { guestId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('loyalty_transactions')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ transactions: data || [] });
  });

  // Accrue loyalty points (called automatically on checkout or manually)
  app.post('/api/loyalty/accrue', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { guest_id, points, reservation_id, description, reference_type, reference_id } = req.body;
    if (!guest_id || !points || points <= 0) {
      return res.status(400).json({ error: 'guest_id and positive points are required' });
    }
    const { data, error } = await supabaseAdmin.rpc('accrue_loyalty_points', {
      p_guest_id: guest_id,
      p_points: Math.floor(points),
      p_reservation_id: reservation_id || null,
      p_description: description || 'Loyalty accrual on checkout',
      p_reference_type: reference_type || 'checkout',
      p_reference_id: reference_id || null,
      p_created_by: req.user?.id || null,
    });
    if (error) return res.status(500).json({ error: error.message });
    const result = data && data[0];
    res.json({ success: true, newBalance: result?.new_balance ?? 0 });
  });

  // Redeem loyalty points
  app.post('/api/loyalty/redeem', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { guest_id, points, description, reference_id } = req.body;
    if (!guest_id || !points || points <= 0) {
      return res.status(400).json({ error: 'guest_id and positive points are required' });
    }
    const { data, error } = await supabaseAdmin.rpc('redeem_loyalty_points', {
      p_guest_id: guest_id,
      p_points: Math.floor(points),
      p_description: description || 'Loyalty redemption',
      p_reference_id: reference_id || null,
      p_created_by: req.user?.id || null,
    });
    if (error) return res.status(500).json({ error: error.message });
    const result = data && data[0];
    if (!result?.success) {
      return res.status(400).json({ error: 'Insufficient loyalty points', balance: result?.new_balance ?? 0 });
    }
    res.json({ success: true, newBalance: result.new_balance });
  });

  // ═══════════════════════════════════════════════════════════
  // SHARE RESERVATIONS (Multi-Guest Linking) ROUTES
  // ═══════════════════════════════════════════════════════════

  // Get all shared guests for a reservation
  app.get('/api/share-reservations/:reservationId', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservationId } = req.params;
    const { data, error } = await supabaseAdmin.rpc('get_shared_guests', { p_reservation_id: reservationId });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ sharedGuests: data || [] });
  });

  // Add a guest to a shared reservation
  app.post('/api/share-reservations', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservation_id, guest_id, role, is_primary_occupant, billing_split, folio_label, preferences, notes } = req.body;
    if (!reservation_id || !guest_id) {
      return res.status(400).json({ error: 'reservation_id and guest_id are required' });
    }
    const { data, error } = await supabaseAdmin
      .from('share_reservations')
      .insert({
        reservation_id,
        guest_id,
        role: role || 'sharing',
        is_primary_occupant: is_primary_occupant || false,
        billing_split: billing_split || 'shared',
        folio_label: folio_label || null,
        preferences: preferences || null,
        notes: notes || null,
      })
      .select('*')
      .single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Guest already linked to this reservation' });
      return res.status(500).json({ error: error.message });
    }

    // Also update the reservation's additionalGuestIds array for backward compatibility
    const { data: resData } = await supabaseAdmin.from('reservations').select('additional_guest_ids').eq('id', reservation_id).single();
    if (resData) {
      const existingIds: string[] = Array.isArray(resData.additional_guest_ids) ? resData.additional_guest_ids : [];
      if (!existingIds.includes(guest_id)) {
        await supabaseAdmin.from('reservations').update({ additional_guest_ids: [...existingIds, guest_id] }).eq('id', reservation_id);
      }
    }

    await writeAuditEvent({
      req, user: req.user!,
      action: 'share_reservation.guest_added',
      entityType: 'Reservation',
      entityId: reservation_id,
      module: 'reservations',
      details: { guest_id, role: role || 'sharing' },
    });

    res.json({ shareReservation: data });
  });

  // Update a shared guest's role/billing preferences
  app.patch('/api/share-reservations/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { role, is_primary_occupant, billing_split, folio_label, preferences, notes } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (role !== undefined) updates.role = role;
    if (is_primary_occupant !== undefined) updates.is_primary_occupant = is_primary_occupant;
    if (billing_split !== undefined) updates.billing_split = billing_split;
    if (folio_label !== undefined) updates.folio_label = folio_label;
    if (preferences !== undefined) updates.preferences = preferences;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin.from('share_reservations').update(updates).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ shareReservation: data });
  });

  // Remove a guest from a shared reservation
  app.delete('/api/share-reservations/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;

    // Get the share record before deleting (to update additionalGuestIds)
    const { data: shareData } = await supabaseAdmin.from('share_reservations').select('reservation_id, guest_id').eq('id', id).single();

    const { error } = await supabaseAdmin.from('share_reservations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    // Remove from reservation's additionalGuestIds for backward compatibility
    if (shareData) {
      const { data: resData } = await supabaseAdmin.from('reservations').select('additional_guest_ids').eq('id', shareData.reservation_id).single();
      if (resData && Array.isArray(resData.additional_guest_ids)) {
        const updatedIds = resData.additional_guest_ids.filter((gid: string) => gid !== shareData.guest_id);
        await supabaseAdmin.from('reservations').update({ additional_guest_ids: updatedIds }).eq('id', shareData.reservation_id);
      }
    }

    res.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // PRE-REGISTRATION ROUTES
  // ═══════════════════════════════════════════════════════════

  // Public: Submit a pre-registration (no auth required)
  app.post('/api/public/pre-registration', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const body = req.body;
    if (!body.reservation_id || !body.guest_email || !body.guest_name) {
      return res.status(400).json({ error: 'reservation_id, guest_email, and guest_name are required' });
    }

    // Verify the reservation exists and email matches
    const { data: resData, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, guest_email, guest_name, status')
      .eq('id', body.reservation_id)
      .single();
    if (resError || !resData) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if (resData.guest_email?.toLowerCase() !== body.guest_email?.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match reservation' });
    }

    const { data, error } = await supabaseAdmin
      .from('pre_registrations')
      .upsert({
        reservation_id: body.reservation_id,
        guest_email: body.guest_email,
        guest_name: body.guest_name,
        guest_phone: body.guest_phone || null,
        guest_nationality: body.guest_nationality || null,
        date_of_birth: body.date_of_birth || null,
        passport_number: body.passport_number || null,
        id_type: body.id_type || 'passport',
        id_number: body.id_number || null,
        id_expiry_date: body.id_expiry_date || null,
        id_issue_date: body.id_issue_date || null,
        id_issuing_country: body.id_issuing_country || null,
        room_type_preference: body.room_type_preference || null,
        pillow_preference: body.pillow_preference || null,
        dietary_restrictions: body.dietary_restrictions || null,
        language_preference: body.language_preference || null,
        tin: body.tin || null,
        vat_no: body.vat_no || null,
        vat_date: body.vat_date || null,
        vehicle_plate: body.vehicle_plate || null,
        vehicle_make: body.vehicle_make || null,
        vehicle_model: body.vehicle_model || null,
        emergency_contact_name: body.emergency_contact_name || null,
        emergency_contact_phone: body.emergency_contact_phone || null,
        emergency_contact_relationship: body.emergency_contact_relationship || null,
        estimated_arrival_time: body.estimated_arrival_time || null,
        id_front_image_url: body.id_front_image_url || null,
        id_back_image_url: body.id_back_image_url || null,
        special_requests: body.special_requests || null,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'reservation_id,guest_email' })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ preRegistration: data });
  });

  // Public: Check pre-registration status by reservation ID + email
  app.get('/api/public/pre-registration/:reservationId', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservationId } = req.params;
    const email = req.query.email as string;
    let query = supabaseAdmin.from('pre_registrations').select('*').eq('reservation_id', reservationId);
    if (email) query = query.eq('guest_email', email);
    const { data, error } = await query.single();
    if (error) return res.json({ preRegistration: null });
    res.json({ preRegistration: data });
  });

  // Admin: List all pre-registrations (with optional status filter)
  app.get('/api/pre-registrations', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const status = req.query.status as string;
    let query = supabaseAdmin.from('pre_registrations').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ preRegistrations: data || [] });
  });

  // Admin: Get a single pre-registration
  app.get('/api/pre-registrations/:id', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('pre_registrations').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json({ preRegistration: data });
  });

  // Admin: Review a pre-registration (update status + notes)
  app.patch('/api/pre-registrations/:id/review', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { status, review_notes } = req.body;
    if (!['pending', 'reviewed', 'imported', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { data, error } = await supabaseAdmin
      .from('pre_registrations')
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_by: req.user?.id || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'pre_registration.reviewed',
      entityType: 'PreRegistration',
      entityId: id,
      module: 'crm',
      details: { status, review_notes },
    });

    res.json({ preRegistration: data });
  });

  // Admin: Import a pre-registration into CRM (create/update guest profile)
  app.post('/api/pre-registrations/:id/import', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;

    const { data: prereg, error: fetchErr } = await supabaseAdmin
      .from('pre_registrations')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr || !prereg) return res.status(404).json({ error: 'Pre-registration not found' });

    // Check if guest already exists by email
    const { data: existingGuest } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('email', prereg.guest_email)
      .single();

    const guestPayload: Record<string, any> = {
      name: prereg.guest_name,
      email: prereg.guest_email,
      phone: prereg.guest_phone || '',
      nationality: prereg.guest_nationality || null,
      date_of_birth: prereg.date_of_birth || null,
      passport_number: prereg.passport_number || null,
      tin: prereg.tin || null,
      vat_no: prereg.vat_no || null,
      vat_date: prereg.vat_date || null,
      special_requests: prereg.special_requests || '',
      notes: `Imported from pre-registration for reservation ${prereg.reservation_id}`,
      identification_doc: prereg.id_number ? {
        type: prereg.id_type || 'passport',
        number: prereg.id_number,
        expiryDate: prereg.id_expiry_date || '',
        issueDate: prereg.id_issue_date || undefined,
        issuingCountry: prereg.id_issuing_country || undefined,
        frontImageUrl: prereg.id_front_image_url || undefined,
        backImageUrl: prereg.id_back_image_url || undefined,
        isUploaded: true,
      } : undefined,
      preferences: prereg.room_type_preference || prereg.pillow_preference || prereg.dietary_restrictions || prereg.language_preference ? {
        roomTypePreference: prereg.room_type_preference || undefined,
        pillowPreference: prereg.pillow_preference || undefined,
        dietaryRestrictions: prereg.dietary_restrictions || undefined,
        languagePreference: prereg.language_preference || undefined,
      } : undefined,
    };

    let guestId: string;
    if (existingGuest) {
      // Update existing guest
      const { data: updated, error: updErr } = await supabaseAdmin
        .from('guests')
        .update(guestPayload)
        .eq('id', existingGuest.id)
        .select('id')
        .single();
      if (updErr) return res.status(500).json({ error: updErr.message });
      guestId = updated.id;
    } else {
      // Create new guest
      guestPayload.id = `guest-${Date.now()}`;
      guestPayload.status = 'Regular';
      guestPayload.loyalty_points = 0;
      guestPayload.total_spend = 0;
      guestPayload.history = [];
      const { data: created, error: createErr } = await supabaseAdmin
        .from('guests')
        .insert(guestPayload)
        .select('id')
        .single();
      if (createErr) return res.status(500).json({ error: createErr.message });
      guestId = created.id;
    }

    // Link reservation to this guest
    await supabaseAdmin
      .from('reservations')
      .update({ guest_id: guestId })
      .eq('id', prereg.reservation_id);

    // Mark pre-registration as imported
    await supabaseAdmin
      .from('pre_registrations')
      .update({
        status: 'imported',
        imported_guest_id: guestId,
        reviewed_by: req.user?.id || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    await writeAuditEvent({
      req, user: req.user!,
      action: 'pre_registration.imported',
      entityType: 'PreRegistration',
      entityId: id,
      module: 'crm',
      details: { guest_id: guestId, reservation_id: prereg.reservation_id },
    });

    res.json({ success: true, guestId });
  });

  // ═══════════════════════════════════════════════════════════
  // CHANNEL MANAGER ROUTES
  // ═══════════════════════════════════════════════════════════

  // List all channel connections
  app.get('/api/channels', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { data, error } = await supabaseAdmin
      .from('channel_connections')
      .select('*')
      .order('channel_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ channels: data });
  });

  // Update channel connection (credentials, settings, active toggle)
  app.patch('/api/channels/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const allowedFields = ['credentials', 'active', 'test_mode', 'sync_interval_minutes', 'rate_parity_enabled', 'rate_parity_threshold', 'inventory_sync_enabled', 'booking_sync_enabled', 'settings', 'webhook_url'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('channel_connections')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ channel: data });
  });

  // Get channel room mappings
  app.get('/api/channels/:id/mappings', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('channel_room_mapping')
      .select('*, room_types(name)')
      .eq('channel_id', id)
      .order('channel_room_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ mappings: data });
  });

  // Upsert channel room mapping
  app.put('/api/channels/:id/mappings', authenticate, requirePermission('settings:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { our_room_type_id, channel_room_code, channel_room_name, rate_multiplier, active } = req.body;
    const { data, error } = await supabaseAdmin
      .from('channel_room_mapping')
      .upsert({
        channel_id: id,
        our_room_type_id,
        channel_room_code,
        channel_room_name,
        rate_multiplier: rate_multiplier || 1.0,
        active: active !== false,
      }, { onConflict: 'channel_id,our_room_type_id' })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ mapping: data });
  });

  // Sync inventory to a channel (push availability)
  app.post('/api/channels/:id/sync-inventory', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const { data: channels } = await supabaseAdmin.from('channel_connections').select('*').eq('id', id).single();
    if (!channels) return res.status(404).json({ error: 'Channel not found' });

    // Get room types and mappings
    const { data: mappings } = await supabaseAdmin
      .from('channel_room_mapping')
      .select('*, room_types(id, name)')
      .eq('channel_id', id)
      .eq('active', true);

    const { data: rooms } = await supabaseAdmin.from('rooms').select('*');
    const { data: reservations } = await supabaseAdmin
      .from('reservations')
      .select('room_type_id, check_in_date, check_out_date, status')
      .in('status', ['Confirmed', 'CheckedIn', 'Waitlisted']);

    const syncId = crypto.randomUUID();
    let processed = 0, successful = 0, failed = 0;
    const start = new Date(startDate || new Date());
    const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));
    const errors: any[] = [];

    for (const mapping of (mappings || [])) {
      const roomTypeId = mapping.our_room_type_id;
      const roomTypeRooms = (rooms || []).filter((r: any) => r.room_type_id === roomTypeId || r.type === mapping.room_types?.name);
      const totalCapacity = roomTypeRooms.length;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const booked = (reservations || []).filter((r: any) =>
          r.room_type_id === roomTypeId &&
          r.status !== 'Cancelled' &&
          r.status !== 'NoShow' &&
          r.check_in_date <= dateStr &&
          r.check_out_date > dateStr
        ).length;
        const available = Math.max(0, totalCapacity - booked);

        const snapResult = await supabaseAdmin
          .from('channel_inventory_snapshot')
          .upsert({
            channel_id: id,
            room_type_id: roomTypeId,
            date: dateStr,
            total_rooms: totalCapacity,
            available_rooms: available,
            booked_rooms: booked,
            sync_status: 'synced',
            synced_at: new Date().toISOString(),
          }, { onConflict: 'channel_id,room_type_id,date' });
        const snapError = snapResult.error;
        if (snapError) {
          await supabaseAdmin.from('channel_inventory_snapshot').update({
            sync_status: 'failed',
            error_message: snapError.message,
          }).eq('channel_id', id).eq('room_type_id', roomTypeId).eq('date', dateStr);
        }

        processed++;
        if (snapError) { failed++; errors.push({ date: dateStr, error: snapError.message }); }
        else successful++;
      }
    }

    // Log the sync
    await supabaseAdmin.from('inventory_sync_log').insert({
      sync_id: syncId,
      channel_id: id,
      sync_type: 'full',
      sync_start: new Date().toISOString(),
      sync_end: new Date().toISOString(),
      records_processed: processed,
      records_successful: successful,
      records_failed: failed,
      status: failed === 0 ? 'success' : 'partial',
      error_summary: errors.length > 0 ? errors : null,
      trigger_type: 'manual',
    });

    // Update channel last_sync
    await supabaseAdmin.from('channel_connections').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: failed === 0 ? 'success' : 'partial',
    }).eq('id', id);

    res.json({ success: true, syncId, processed, successful, failed });
  });

  // Sync rates to a channel (push our rates)
  app.post('/api/channels/:id/sync-rates', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const { data: mappings } = await supabaseAdmin
      .from('channel_room_mapping')
      .select('*, room_types(id, name)')
      .eq('channel_id', id)
      .eq('active', true);

    const { data: seasons } = await supabaseAdmin.from('seasons').select('*');
    const { data: roomTypes } = await supabaseAdmin.from('room_types').select('*');

    const syncId = crypto.randomUUID();
    let processed = 0, successful = 0, failed = 0;

    const start = new Date(startDate || new Date());
    const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));

    for (const mapping of (mappings || [])) {
      const roomType = roomTypes?.find((rt: any) => rt.id === mapping.our_room_type_id);
      if (!roomType) continue;
      const baseRate = roomType.base_rate || roomType.default_rate || 100;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        // Simple rate calculation: base * seasonal multiplier * channel rate_multiplier
        const season = (seasons || []).find((s: any) => s.start_date <= dateStr && s.end_date >= dateStr);
        const seasonMult = season?.multiplier || 1.0;
        const ourRate = Math.round(baseRate * seasonMult * (mapping.rate_multiplier || 1.0) * 100) / 100;

        const rateResult = await supabaseAdmin
          .from('rate_sync_log')
          .insert({
            sync_id: syncId,
            channel_id: id,
            room_type_id: mapping.our_room_type_id,
            date: dateStr,
            our_rate: ourRate,
            sync_status: 'synced',
            synced_at: new Date().toISOString(),
          });
        const rateError = rateResult.error;
        if (rateError) {
          await supabaseAdmin.from('rate_sync_log').update({
            sync_status: 'failed',
            error_message: rateError.message,
          }).eq('sync_id', syncId).eq('channel_id', id).eq('room_type_id', mapping.our_room_type_id).eq('date', dateStr);
        }

        processed++;
        if (rateError) failed++; else successful++;
      }
    }

    await supabaseAdmin.from('channel_connections').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: failed === 0 ? 'success' : 'partial',
    }).eq('id', id);

    res.json({ success: true, syncId, processed, successful, failed });
  });

  // Fetch bookings from a channel (inbound sync)
  app.post('/api/channels/:id/sync-bookings', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const { data: channel } = await supabaseAdmin.from('channel_connections').select('channel_name').eq('id', id).single();

    // For now, this pulls existing channel_bookings and checks for unsynced ones
    const { data: unsynced, error } = await supabaseAdmin
      .from('channel_bookings')
      .select('*')
      .eq('channel_id', id)
      .eq('sync_status', 'pending')
      .gte('check_in_date', startDate || new Date().toISOString().split('T')[0])
      .lte('check_out_date', endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);

    if (error) return res.status(500).json({ error: error.message });

    let imported = 0;
    for (const booking of (unsynced || [])) {
      // Create reservation from channel booking if not already linked
      if (!booking.reservation_id) {
        const { data: newRes, error: resError } = await supabaseAdmin
          .from('reservations')
          .insert({
            guest_name: booking.guest_name,
            guest_email: booking.guest_email,
            guest_phone: booking.guest_phone,
            room_type_id: booking.room_type_id,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            adults: booking.adults,
            children: booking.children,
            total_amount: booking.total_amount,
            status: 'Confirmed',
            channel: channel?.channel_name || 'OTA',
          })
          .select('id')
          .single();

        if (!resError && newRes) {
          await supabaseAdmin.from('channel_bookings')
            .update({ reservation_id: newRes.id, sync_status: 'synced', updated_at: new Date().toISOString() })
            .eq('id', booking.id);
          imported++;
        }
      } else {
        await supabaseAdmin.from('channel_bookings')
          .update({ sync_status: 'synced', updated_at: new Date().toISOString() })
          .eq('id', booking.id);
      }
    }

    res.json({ success: true, processed: unsynced?.length || 0, imported });
  });

  // Sync all channels (inventory + rates + bookings)
  app.post('/api/channels/sync-all', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { startDate, endDate } = req.body;
    const { data: channels } = await supabaseAdmin
      .from('channel_connections')
      .select('*')
      .eq('active', true);

    const results: any[] = [];
    const { data: mappings } = await supabaseAdmin
      .from('channel_room_mapping')
      .select('*, room_types(id, name, base_rate, default_rate)')
      .in('channel_id', (channels || []).map((c: any) => c.id))
      .eq('active', true);
    const { data: rooms } = await supabaseAdmin.from('rooms').select('*');
    const { data: allReservations } = await supabaseAdmin
      .from('reservations')
      .select('room_type_id, check_in_date, check_out_date, status')
      .in('status', ['Confirmed', 'CheckedIn', 'Waitlisted']);
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*');

    for (const channel of (channels || [])) {
      try {
        const channelMappings = (mappings || []).filter((m: any) => m.channel_id === channel.id);
        let invProcessed = 0, invSuccess = 0, rateProcessed = 0, rateSuccess = 0;
        const start = new Date(startDate || new Date());
        const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));

        for (const mapping of channelMappings) {
          const roomTypeId = mapping.our_room_type_id;
          const totalCapacity = (rooms || []).filter((r: any) => r.room_type_id === roomTypeId).length;
          const roomType = mapping.room_types;
          const baseRate = roomType?.base_rate || roomType?.default_rate || 100;

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const booked = (allReservations || []).filter((r: any) =>
              r.room_type_id === roomTypeId && r.status !== 'Cancelled' && r.status !== 'NoShow' &&
              r.check_in_date <= dateStr && r.check_out_date > dateStr
            ).length;
            const available = Math.max(0, totalCapacity - booked);

            const invResult = await supabaseAdmin.from('channel_inventory_snapshot').upsert({
              channel_id: channel.id, room_type_id: roomTypeId, date: dateStr,
              total_rooms: totalCapacity, available_rooms: available, booked_rooms: booked,
              sync_status: 'synced', synced_at: new Date().toISOString(),
            }, { onConflict: 'channel_id,room_type_id,date' });
            const invErr = invResult.error;
            if (invErr) {
              await supabaseAdmin.from('channel_inventory_snapshot').update({
                sync_status: 'failed',
              }).eq('channel_id', channel.id).eq('room_type_id', roomTypeId).eq('date', dateStr);
            }
            invProcessed++;
            if (!invErr) invSuccess++;

            const season = (seasons || []).find((s: any) => s.start_date <= dateStr && s.end_date >= dateStr);
            const ourRate = Math.round((baseRate * (season?.multiplier || 1.0) * (mapping.rate_multiplier || 1.0)) * 100) / 100;
            const rateResult2 = await supabaseAdmin.from('rate_sync_log').insert({
              sync_id: crypto.randomUUID(), channel_id: channel.id, room_type_id: roomTypeId,
              date: dateStr, our_rate: ourRate, sync_status: 'synced', synced_at: new Date().toISOString(),
            });
            const rateErr = rateResult2.error;
            if (rateErr) {
              await supabaseAdmin.from('rate_sync_log').update({
                sync_status: 'failed',
              }).eq('sync_id', crypto.randomUUID()).eq('channel_id', channel.id).eq('room_type_id', roomTypeId).eq('date', dateStr);
            }
            rateProcessed++;
            if (!rateErr) rateSuccess++;
          }
        }

        await supabaseAdmin.from('channel_connections').update({
          last_sync_at: new Date().toISOString(), last_sync_status: 'success',
        }).eq('id', channel.id);

        results.push({ channelId: channel.id, channelName: channel.channel_name, inventory: { processed: invProcessed, successful: invSuccess }, rates: { processed: rateProcessed, successful: rateSuccess } });
      } catch (err: any) {
        results.push({ channelId: channel.id, channelName: channel.channel_name, error: err.message });
      }
    }

    res.json({ success: true, results });
  });

  // Webhook receiver for inbound channel notifications
  app.post('/api/channels/:id/webhook', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const webhookType = req.headers['x-webhook-type'] as string || 'booking';
    const payload = req.body;

    // Log the webhook
    const { error } = await supabaseAdmin.from('webhook_log').insert({
      channel_id: id,
      webhook_type: webhookType,
      payload: payload,
      headers: req.headers,
      processed: false,
      processing_status: 'pending',
      ip_address: req.ip,
    });

    if (error) return res.status(500).json({ error: error.message });

    // Respond 200 immediately; processing happens async
    res.json({ received: true, message: 'Webhook logged for processing' });
  });

  // Get rate parity monitor data
  app.get('/api/channels/parity-status', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { data, error } = await supabaseAdmin
      .from('rate_parity_monitor')
      .select('*, channel_connections(channel_name), room_types(name)')
      .order('date', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ parityRecords: data });
  });

  // Get channel bookings
  app.get('/api/channels/:id/bookings', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('channel_bookings')
      .select('*')
      .eq('channel_id', id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ bookings: data });
  });

  // Get channel performance metrics
  app.get('/api/channels/:id/performance', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('channel_performance')
      .select('*')
      .eq('channel_id', id)
      .order('date', { ascending: false })
      .limit(30);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ performance: data });
  });

  // Get sync logs
  app.get('/api/channels/:id/sync-logs', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { type } = req.query;
    const table = type === 'rate' ? 'rate_sync_log' : type === 'booking' ? 'booking_sync_log' : 'inventory_sync_log';
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('channel_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ logs: data });
  });

  // Get channel overview (aggregate view)
  app.get('/api/channels/overview', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { data, error } = await supabaseAdmin
      .from('channel_overview')
      .select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ overview: data });
  });

  // Generate invoice for a folio and link payments
  app.post('/api/folios/:folioId/generate-invoice', authenticate, requirePermission('folio:invoice:create'), async (req, res) => {
    const { folioId } = req.params;
    const { invoiceType, dueDate, notes } = req.body;

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      // Get folio details
      const { data: folio, error: folioError } = await supabaseAdmin
        .from('folios')
        .select('*, reservations(*)')
        .eq('id', folioId)
        .single();

      if (folioError || !folio) {
        return res.status(404).json({ error: 'Folio not found' });
      }

      const reservation = folio.reservations;
      if (!reservation) {
        return res.status(400).json({ error: 'Folio has no associated reservation' });
      }

      // Calculate folio totals
      const { data: folioTotals } = await supabaseAdmin.rpc('recompute_folio_totals', {
        p_folio_id: folioId
      });

      const subtotal = folioTotals?.total_charges || 0;
      const totalPayments = folioTotals?.total_payments || 0;
      const balance = folioTotals?.folio_balance || 0;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create invoice document
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoice_documents')
        .insert({
          id: crypto.randomUUID(),
          folio_id: folioId,
          invoice_number: invoiceNumber,
          invoice_type: invoiceType === 'Group Master' ? 'Group Master' : 'Guest',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate || null,
          subtotal: subtotal,
          tax_total: 0, // TODO: Calculate from folio lines
          discount_total: 0, // TODO: Calculate from folio lines
          total: subtotal,
          amount_paid: totalPayments,
          status: balance <= 0 ? 'Paid' : 'Issued',
          customer_name: reservation.guest_name,
          customer_email: reservation.guest_email || null,
          customer_address: null,
          customer_tin: reservation.guest_tin || null,
          customer_vat_no: reservation.guest_vat_no || null,
          hotel_tin: null, // TODO: Get from global settings
          hotel_vat_no: null, // TODO: Get from global settings
          hotel_vat_date: null, // TODO: Get from global settings
          payment_terms: 'Net 30',
          notes: notes || null,
          is_voided: false,
          created_by: req.user?.id
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return res.status(500).json({ error: 'Failed to create invoice', details: invoiceError.message });
      }

      // Link payments to the invoice
      const { data: linkResult, error: linkError } = await supabaseAdmin.rpc('link_payments_to_invoice', {
        p_invoice_id: invoice.id,
        p_folio_id: folioId
      });

      if (linkError) {
        console.error('Error linking payments to invoice:', linkError);
        // Don't fail the whole operation if linking fails, just log it
      }

      return res.json({
        success: true,
        invoice: invoice,
        paymentsLinked: linkResult?.paymentsLinked || 0
      });
    } catch (err: any) {
      console.error('Unexpected error generating invoice:', err);
      return res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
    }
  });

  // Get a single invoice document with full folio and payment details for preview/print
  app.get('/api/invoices/:invoiceId', authenticate, async (req, res) => {
    const { invoiceId } = req.params;

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      // Fetch invoice document
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoice_documents')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        console.error('Error fetching invoice:', invoiceError);
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Fetch associated folio
      const { data: folio } = await supabaseAdmin
        .from('folios')
        .select('id, reservation_id, folio_type, status')
        .eq('id', invoice.folio_id)
        .single();

      // Fetch associated reservation
      let reservation = null;
      if (folio?.reservation_id) {
        const { data: res } = await supabaseAdmin
          .from('reservations')
          .select('id, guest_name, guest_email, guest_tin, guest_vat_no, room_number, check_in_date, check_out_date')
          .eq('id', folio.reservation_id)
          .single();
        reservation = res;
      }

      // Fetch folio lines (itemized charges)
      const { data: lines, error: linesError } = await supabaseAdmin
        .from('folio_lines')
        .select('id, line_number, transaction_date, description, amount, quantity, unit_price, line_type, is_voided')
        .eq('folio_id', invoice.folio_id)
        .eq('is_voided', false)
        .order('line_number', { ascending: true });

      if (linesError) {
        console.error('Error fetching folio lines for invoice:', linesError);
      }

      // Fetch payments linked to this invoice
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from('folio_payments')
        .select('id, payment_date, payment_method, amount, reference_number, is_voided')
        .eq('invoice_id', invoiceId)
        .eq('is_voided', false)
        .order('payment_date', { ascending: true });

      if (paymentsError) {
        console.error('Error fetching payments for invoice:', paymentsError);
      }

      return res.json({
        invoice,
        folio,
        reservation,
        lines: lines || [],
        payments: payments || []
      });
    } catch (err: any) {
      console.error('Unexpected error fetching invoice:', err);
      return res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
    }
  });

  // Close folio with automatic invoice generation
  app.post('/api/folios/:folioId/close-with-invoice', authenticate, async (req, res) => {
    const { folioId } = req.params;

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      const { data, error } = await supabaseAdmin.rpc('close_folio_with_invoice', {
        p_folio_id: folioId,
        p_user_id: req.user?.id
      });

      if (error) {
        console.error('Error closing folio with invoice:', error);
        return res.status(500).json({ error: 'Failed to close folio', details: error.message });
      }

      return res.json(data);
    } catch (err: any) {
      console.error('Unexpected error closing folio:', err);
      return res.status(500).json({ error: 'Failed to close folio', details: err.message });
    }
  });

  // Get folios by reservation ID
  app.get('/api/folios', authenticate, async (req, res) => {
    const { reservation_id } = req.query;

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    try {
      let query = supabaseAdmin.from('folios').select('*');
      
      if (reservation_id) {
        query = query.eq('reservation_id', reservation_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching folios:', error);
        return res.status(500).json({ error: 'Failed to fetch folios', details: error.message });
      }

      return res.json({ folios: data || [] });
    } catch (err: any) {
      console.error('Unexpected error fetching folios:', err);
      return res.status(500).json({ error: 'Failed to fetch folios', details: err.message });
    }
  });

  // Set up Vite/static middleware AFTER all API routes
  const isProduction = process.env.NODE_ENV === 'production' || process.argv[1]?.includes('dist/server.cjs') || process.argv[1]?.includes('dist\\server.cjs');
  const distPath = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');
  // In dev mode, delete any stale dist/index.html so Vite middleware always takes over
  if (!isProduction && fs.existsSync(distIndex)) {
    try { fs.unlinkSync(distIndex); } catch { /* ignore */ }
  }
  // Bank Accounts API endpoints
  app.get('/api/finance/bank-accounts', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, bankAccounts: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/finance/bank-accounts/:id', authenticate, async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('bank_accounts')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Bank account not found' });
      return res.json({ success: true, bankAccount: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/finance/bank-accounts/:id/summary', authenticate, requirePermission('finance:read'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('get_bank_account_summary', {
        p_bank_account_id: req.params.id
      });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/bank-accounts', authenticate, requirePermission('finance:write'), async (req, res) => {
    const {
      accountName,
      bankName,
      accountNumber,
      accountType,
      currency,
      swiftBicCode,
      branchName,
      branchAddress,
      description,
      openingBalance,
      isDefaultForSales,
      isDefaultForExpenses
    } = req.body;

    if (!accountName || !bankName || !accountNumber || !accountType) {
      return res.status(400).json({ error: 'accountName, bankName, accountNumber, and accountType are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const bankAccountId = crypto.randomUUID();
      const insertData: any = {
        id: bankAccountId,
        account_name: accountName,
        bank_name: bankName,
        account_number: accountNumber,
        account_type: accountType,
        currency: currency || 'ETB',
        swift_bic_code: swiftBicCode,
        branch_name: branchName,
        branch_address: branchAddress,
        description,
        opening_balance: openingBalance || 0,
        current_balance: openingBalance || 0,
        is_default_for_sales: isDefaultForSales || false,
        is_default_for_expenses: isDefaultForExpenses || false,
        created_by: req.user!.id
      };

      const { data, error } = await supabaseAdmin
        .from('bank_accounts')
        .insert(insertData)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, bankAccount: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.put('/api/finance/bank-accounts/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
    const {
      accountName,
      bankName,
      accountNumber,
      accountType,
      currency,
      isActive,
      isDefaultForSales,
      isDefaultForExpenses,
      swiftBicCode,
      branchName,
      branchAddress,
      description
    } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (accountName !== undefined) updateData.account_name = accountName;
      if (bankName !== undefined) updateData.bank_name = bankName;
      if (accountNumber !== undefined) updateData.account_number = accountNumber;
      if (accountType !== undefined) updateData.account_type = accountType;
      if (currency !== undefined) updateData.currency = currency;
      if (isActive !== undefined) updateData.is_active = isActive;
      if (isDefaultForSales !== undefined) updateData.is_default_for_sales = isDefaultForSales;
      if (isDefaultForExpenses !== undefined) updateData.is_default_for_expenses = isDefaultForExpenses;
      if (swiftBicCode !== undefined) updateData.swift_bic_code = swiftBicCode;
      if (branchName !== undefined) updateData.branch_name = branchName;
      if (branchAddress !== undefined) updateData.branch_address = branchAddress;
      if (description !== undefined) updateData.description = description;

      const { data, error } = await supabaseAdmin
        .from('bank_accounts')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Bank account not found' });
      return res.json({ success: true, bankAccount: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/finance/bank-accounts/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('bank_accounts')
        .delete()
        .eq('id', req.params.id);

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, message: 'Bank account deleted' });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Expense payment with bank account tracking
  app.post('/api/finance/expenses/:id/payment', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { bankAccountId, paymentMethod, paymentReference } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'paymentMethod is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('update_expense_payment', {
        p_expense_id: req.params.id,
        p_bank_account_id: bankAccountId || null,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference || null,
        p_user_id: req.user!.id
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(400).json({ error: data?.error || 'Payment failed' });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // General Ledger API
  // =====================
  app.get('/api/finance/journal-entries', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('journal_entries')
        .select(`
          *,
          journal_lines(*),
          usali_chart_of_accounts(account_name, account_code)
        `)
        .order('posting_date', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/journal-entries', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { period, source, description, totalDebit, totalCredit, lines } = req.body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Journal lines are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: entry, error: entryError } = await supabaseAdmin
        .from('journal_entries')
        .insert({
          period,
          source,
          description,
          total_debit: totalDebit,
          total_credit: totalCredit,
          status: 'Draft',
          created_by: req.user!.id
        })
        .select()
        .single();

      if (entryError) return res.status(500).json({ error: entryError.message });

      const { error: linesError } = await supabaseAdmin
        .from('journal_lines')
        .insert(lines.map((line: any) => ({
          journal_entry_id: entry.id,
          account_code: line.accountCode,
          account_name: line.accountName,
          debit_amount: line.debitAmount,
          credit_amount: line.creditAmount,
          currency: line.currency || 'ETB',
          exchange_rate: line.exchangeRate || 1,
          tax_code: line.taxCode,
          memo: line.memo
        })));

      if (linesError) return res.status(500).json({ error: linesError.message });
      return res.json({ success: true, entry });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.put('/api/finance/journal-entries/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { status } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('journal_entries')
        .update({
          status,
          posted_at: status === 'Posted' ? new Date().toISOString() : null
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, entry: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Accounts Payable API
  // =====================
  app.get('/api/finance/ap/vendors', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ap_vendors')
        .select('*')
        .order('name');

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/ap/vendors', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { name, contactEmail, contactPhone, address, taxId, withholdingTaxRate, paymentTerms } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ap_vendors')
        .insert({
          name,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address,
          tax_id: taxId,
          withholding_tax_rate: withholdingTaxRate,
          payment_terms: paymentTerms,
          created_by: req.user!.id
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, vendor: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/finance/ap/bills', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ap_bills')
        .select(`
          *,
          ap_vendors(name),
          ap_bill_lines(*)
        `)
        .order('invoice_date', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/ap/bills', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { vendorId, invoiceNumber, invoiceDate, dueDate, subtotal, taxAmount, withholdingAmount, totalAmount, lines } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: bill, error: billError } = await supabaseAdmin
        .from('ap_bills')
        .insert({
          vendor_id: vendorId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          due_date: dueDate,
          subtotal,
          tax_amount: taxAmount,
          withholding_amount: withholdingAmount,
          total_amount: totalAmount,
          status: 'Open',
          created_by: req.user!.id
        })
        .select()
        .single();

      if (billError) return res.status(500).json({ error: billError.message });

      if (lines && Array.isArray(lines)) {
        const { error: linesError } = await supabaseAdmin
          .from('ap_bill_lines')
          .insert(lines.map((line: any) => ({
            bill_id: bill.id,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unitPrice,
            line_total: line.lineTotal
          })));

        if (linesError) return res.status(500).json({ error: linesError.message });
      }

      return res.json({ success: true, bill });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Accounts Receivable API
  // =====================
  app.get('/api/finance/ar/customers', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ar_customers')
        .select('*')
        .order('name');

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/ar/customers', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { name, contactEmail, contactPhone, address, taxId, creditLimit, category } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ar_customers')
        .insert({
          name,
          email: contactEmail,
          phone: contactPhone,
          address,
          tin: taxId,
          credit_limit: creditLimit,
          customer_type: category,
          is_active: true,
          created_by: req.user!.id
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, customer: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/finance/ar/invoices', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ar_invoices')
        .select(`
          *,
          ar_customers(name),
          ar_invoice_lines(*)
        `)
        .order('invoice_date', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Guest folios with aging buckets
  app.get('/api/finance/ar/folios', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('folios')
        .select(`
          id, reservation_id, status, balance, total_charges, total_payments,
          opened_at, closed_at, currency
        `)
        .order('opened_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });

      // Fetch reservation details for guest name / room
      const reservationIds = (data || []).map((f: any) => f.reservation_id).filter(Boolean);
      let reservationMap: Record<string, any> = {};
      if (reservationIds.length > 0) {
        const { data: reservations } = await supabaseAdmin
          .from('reservations')
          .select('id, guest_name, room_number, check_in_date, check_out_date, payment_status')
          .in('id', reservationIds);
        (reservations || []).forEach((r: any) => { reservationMap[r.id] = r; });
      }

      const now = new Date();
      const foliosWithAging = (data || []).map((f: any) => {
        const openedDate = f.opened_at ? new Date(f.opened_at) : now;
        const daysOutstanding = Math.floor((now.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
        const balance = Number(f.balance) || 0;
        let agingBucket = '0-30';
        if (daysOutstanding > 90) agingBucket = '90+';
        else if (daysOutstanding > 60) agingBucket = '61-90';
        else if (daysOutstanding > 30) agingBucket = '31-60';

        const reservation = f.reservation_id ? reservationMap[f.reservation_id] : null;
        return {
          id: f.id,
          reservation_id: f.reservation_id,
          guest_name: reservation?.guest_name || 'Unknown',
          room_number: reservation?.room_number || null,
          check_in_date: reservation?.check_in_date || null,
          check_out_date: reservation?.check_out_date || null,
          status: f.status,
          balance,
          total_charges: Number(f.total_charges) || 0,
          total_payments: Number(f.total_payments) || 0,
          opened_at: f.opened_at,
          closed_at: f.closed_at,
          payment_status: reservation?.payment_status || null,
          days_outstanding: daysOutstanding,
          aging_bucket: agingBucket,
        };
      });

      return res.json(foliosWithAging);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Fixed Assets API
  // =====================
  app.get('/api/finance/fixed-assets', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('fixed_assets')
        .select('*')
        .order('acquisition_date', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/fixed-assets', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { assetCode, name, description, category, acquisitionDate, acquisitionCost, usefulLife, depreciationMethod, salvageValue } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('fixed_assets')
        .insert({
          asset_code: assetCode,
          name,
          description,
          category,
          acquisition_date: acquisitionDate,
          acquisition_cost: acquisitionCost,
          useful_life: usefulLife,
          depreciation_method: depreciationMethod,
          salvage_value: salvageValue,
          current_book_value: acquisitionCost,
          accumulated_depreciation: 0,
          status: 'Active',
          created_by: req.user!.id
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, asset: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Tax Codes API
  // =====================
  app.get('/api/finance/tax-codes', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('tax_codes')
        .select('*')
        .order('code');

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Budget vs Actual API
  // =====================
  app.get('/api/finance/budget-actual', authenticate, requirePermission('finance:read'), async (req, res) => {
    const { period, accountCode } = req.query;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      let query = supabaseAdmin.from('budgets').select('*');

      if (period) query = query.eq('period', period);
      if (accountCode) query = query.eq('account_code', accountCode);

      const { data, error } = await query.order('period', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/budget-actual', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { budgetName, period, accountCode, department, budgetedAmount } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('budgets')
        .insert({
          budget_name: budgetName,
          period,
          account_code: accountCode,
          department,
          budgeted_amount: budgetedAmount,
          actual_amount: 0,
          variance: 0,
          variance_percent: 0,
          version: 'Draft',
          created_by: req.user!.id,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, budget: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Period Close API
  // =====================
  app.get('/api/finance/period-close', authenticate, requirePermission('finance:read'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('period_close_workflow')
        .select('*')
        .order('period', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/finance/period-close', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { period, lockType, notes } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('period_close_workflow')
        .insert({
          period,
          lock_type: lockType,
          status: 'In Progress',
          notes,
          initiated_by: req.user!.id
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, workflow: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.put('/api/finance/period-close/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
    const { status, notes } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('period_close_workflow')
        .update({
          status,
          notes,
          completed_at: status === 'Closed' ? new Date().toISOString() : null
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, workflow: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // F&B Recipe & Ingredient API
  // =====================
  app.get('/api/fb/ingredients', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('ingredients').select('*').eq('is_active', true).order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/ingredients', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { name, category, unitOfMeasure, parLevel, reorderPoint, currentCost } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('ingredients')
        .insert({ name, category, unit_of_measure: unitOfMeasure, par_level: parLevel, reorder_point: reorderPoint, current_cost: currentCost, is_active: true })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, ingredient: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/fb/ingredients/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { name, category, unitOfMeasure, parLevel, reorderPoint, currentCost, isActive } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateFields: Record<string, any> = {};
      if (name !== undefined) updateFields.name = name;
      if (category !== undefined) updateFields.category = category;
      if (unitOfMeasure !== undefined) updateFields.unit_of_measure = unitOfMeasure;
      if (parLevel !== undefined) updateFields.par_level = parLevel;
      if (reorderPoint !== undefined) updateFields.reorder_point = reorderPoint;
      if (currentCost !== undefined) updateFields.current_cost = currentCost;
      if (isActive !== undefined) updateFields.is_active = isActive;
      const { error } = await supabaseAdmin.from('ingredients').update(updateFields).eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/fb/ingredients/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('ingredients').update({ is_active: false }).eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/fb/menu-items', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('menu_items').select('*').eq('is_active', true).order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/menu-items', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('menu_items')
        .insert(req.body)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/fb/menu-items/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('menu_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/fb/menu-items/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('menu_items')
        .delete()
        .eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/fb/recipes', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('recipes')
        .select('*, menu_items(name, selling_price), recipe_lines(*, ingredients(id, name, current_cost, unit_of_measure))')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/recipes', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { menuItemId, portions, yield: recipeYield, lines } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const recipeId = crypto.randomUUID();
      const { data: recipeData, error: recipeError } = await supabaseAdmin.from('recipes')
        .insert({
          id: recipeId,
          menu_item_id: menuItemId,
          portions,
          yield: recipeYield
        })
        .select()
        .single();
      
      if (recipeError) return res.status(500).json({ error: recipeError.message });
      
      if (lines && lines.length > 0) {
        const { error: linesError } = await supabaseAdmin.from('recipe_lines')
          .insert(lines.map((line: any) => ({
            id: crypto.randomUUID(),
            recipe_id: recipeId,
            ingredient_id: line.ingredientId,
            quantity: line.quantity,
            unit: line.unit,
            cost_at_time_of_costing: line.cost || 0
          })));
        
        if (linesError) return res.status(500).json({ error: linesError.message });
      }
      
      return res.json(recipeData);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/fb/recipes/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('recipes')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/fb/recipes/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('recipes')
        .delete()
        .eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/fb/recipes/:id/cost', authenticate, async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('calculate_recipe_cost', { p_recipe_id: req.params.id });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // F&B Wastage API
  // =====================
  app.get('/api/fb/wastage', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('wastage_logs')
        .select('*, ingredients(name, category, unit_of_measure)')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/wastage', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { ingredientId, locationId, quantity, unit, reason, costValue, notes } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('wastage_logs')
        .insert({ ingredient_id: ingredientId, location_id: locationId, quantity, unit, reason, cost_value: costValue, notes, logged_by: req.user!.id })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, wastage: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/fb/wastage/summary', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('waste_summary').select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // F&B Outlets API
  // =====================
  app.get('/api/fb/outlets', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('outlets')
        .select('*').order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/outlets', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('outlets')
        .insert(req.body)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/fb/outlets/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('outlets')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/fb/outlets/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('outlets')
        .delete()
        .eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // F&B Banquet Events (BEO) API
  // =====================
  app.get('/api/fb/banquet-events', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('banquet_events')
        .select('*').order('event_date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/fb/banquet-events', authenticate, requirePermission('fb:write'), async (req, res) => {
    const { eventName, eventDate, clientName, guestCount, menuPackage, roomSetup, paymentTerms,
            estimatedRevenue, notes, avRequirements, billingInstructions, contactPhone, contactEmail,
            eventStartTime, eventEndTime, functionRoom } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('banquet_events')
        .insert({
          event_name: eventName, event_date: eventDate, client_name: clientName,
          guest_count: guestCount, menu_package: menuPackage, room_setup: roomSetup,
          payment_terms: paymentTerms, estimated_revenue: estimatedRevenue, notes,
          av_requirements: avRequirements, billing_instructions: billingInstructions,
          contact_phone: contactPhone, contact_email: contactEmail,
          event_start_time: eventStartTime, event_end_time: eventEndTime, function_room: functionRoom,
          status: 'Draft',
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, event: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/fb/banquet-events/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('banquet_events')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, event: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });


  // =====================
  // HR & Payroll API
  // =====================
  app.get('/api/hr/employees', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('employees').select('*').order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/hr/tax-bands', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('tax_bands').select('*').eq('is_active', true).order('band_order');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/hr/pension-rates', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('pension_rates').select('*').eq('is_active', true).order('effective_date', { ascending: false }).limit(1);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/hr/payroll-runs', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('payroll_runs').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/hr/payroll-runs', authenticate, requirePermission('hr:write'), async (req, res) => {
    const { period, employeeIds } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      // Create payroll run
      const runId = crypto.randomUUID();
      const { error: runError } = await supabaseAdmin.from('payroll_runs')
        .insert({ id: runId, period, status: 'Draft', created_by: req.user!.id });
      if (runError) return res.status(500).json({ error: runError.message });

      // Fetch employees
      let empQuery = supabaseAdmin.from('employees').select('*').eq('status', 'Active');
      if (employeeIds && employeeIds.length > 0) {
        empQuery = empQuery.in('id', employeeIds);
      }
      const { data: employees, error: empError } = await empQuery;
      if (empError) return res.status(500).json({ error: empError.message });

      // Fetch pension rates
      const { data: pensionData } = await supabaseAdmin.from('pension_rates')
        .select('*').eq('is_active', true).order('effective_date', { ascending: false }).limit(1);
      const pension = pensionData?.[0] || null;

      const empRate = pension?.employee_rate || 7;
      const erRate = pension?.employer_rate || 11;

      let totalGross = 0, totalTax = 0, totalPensionEmp = 0, totalPensionEr = 0, totalNet = 0;

      // Calculate payslips for each employee
      for (const emp of employees || []) {
        const basic = Number(emp.basic_salary || emp.salary || 0);
        const allowances = Number(emp.allowance_amount || 0);
        const gross = basic + allowances;

        // Calculate income tax
        const { data: taxResult, error: taxError } = await supabaseAdmin.rpc('calculate_income_tax', { p_taxable_income: gross });
        const tax = taxError ? 0 : Number(taxResult || 0);

        // Calculate pension
        const pensionEmp = gross * empRate / 100;
        const pensionEr = gross * erRate / 100;

        const totalDeductions = tax + pensionEmp;
        const netPay = gross - totalDeductions;

        totalGross += gross;
        totalTax += tax;
        totalPensionEmp += pensionEmp;
        totalPensionEr += pensionEr;
        totalNet += netPay;

        await supabaseAdmin.from('payslips').insert({
          payroll_run_id: runId,
          employee_id: emp.id,
          period,
          basic_salary: basic,
          allowances,
          overtime: 0,
          gross_pay: gross,
          income_tax: tax,
          pension_employee: pensionEmp,
          pension_employer: pensionEr,
          total_deductions: totalDeductions,
          net_pay: netPay,
          status: 'Calculated',
        });
      }

      // Update run totals
      await supabaseAdmin.from('payroll_runs').update({
        total_gross: totalGross,
        total_tax: totalTax,
        total_pension_employee: totalPensionEmp,
        total_pension_employer: totalPensionEr,
        total_deductions: totalTax + totalPensionEmp,
        total_net: totalNet,
        employee_count: employees?.length || 0,
        status: 'Calculated',
      }).eq('id', runId);

      return res.json({ success: true, runId, employeeCount: employees?.length || 0, totalGross, totalNet });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/hr/payroll-runs/:id', authenticate, requirePermission('hr:write'), async (req, res) => {
    const { status } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { status };
      if (status === 'Approved') { updateData.approved_by = req.user!.id; updateData.approved_at = new Date().toISOString(); }
      if (status === 'Posted') { updateData.posted_by = req.user!.id; updateData.posted_at = new Date().toISOString(); }

      const { data, error } = await supabaseAdmin.from('payroll_runs').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // If approved, mark payslips as approved too
      if (status === 'Approved') {
        await supabaseAdmin.from('payslips').update({ status: 'Approved' }).eq('payroll_run_id', req.params.id);
      }
      return res.json({ success: true, run: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/hr/payroll-runs/:id/payslips', authenticate, async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('payslips')
        .select('*, employees(name, email, phone, department, position, bank_account, pension_number)')
        .eq('payroll_run_id', req.params.id)
        .order('employees(name)');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.get('/api/hr/payslips/:id', authenticate, async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('payslips')
        .select('*, employees(name, email, phone, department, position, bank_account, pension_number), payroll_runs(period, status)')
        .eq('id', req.params.id).single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Procurement & Inventory API
  // =====================
  app.get('/api/procurement/grns', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('inventory_grns').select('*').order('received_date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/procurement/grns', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { number, supplierId, supplierName, purchaseOrderId, deliveryNote, invoiceNumber, receivedDate, items, totalValue } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const grnId = crypto.randomUUID();
      const { data, error } = await supabaseAdmin.from('inventory_grns')
        .insert({
          id: grnId, number, supplier_id: supplierId, supplier_name: supplierName,
          purchase_order_id: purchaseOrderId, delivery_note: deliveryNote, invoice_number: invoiceNumber,
          received_date: receivedDate, receiver: req.user!.name || req.user!.id,
          items: items || [], total_value: totalValue || 0,
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });

      // Auto-create AP bill draft
      const { data: apResult, error: apError } = await supabaseAdmin.rpc('create_ap_bill_from_grn', { p_grn_id: grnId, p_created_by: req.user!.id });
      if (apError) console.error('AP bill creation failed:', apError.message);

      return res.json({ success: true, grn: data, apBillId: apResult?.[0]?.ap_bill_id || null });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/procurement/grns/:id/discrepancy', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { discrepancyStatus, discrepancyNotes } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('inventory_grns')
        .update({ discrepancy_status: discrepancyStatus, discrepancy_notes: discrepancyNotes })
        .eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, grn: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Stock Counts
  app.get('/api/procurement/stock-counts', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('stock_counts')
        .select('*, stock_count_lines(*)').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/procurement/stock-counts', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { locationId, countDate, notes, lines } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const scId = crypto.randomUUID();
      const { error: scError } = await supabaseAdmin.from('stock_counts')
        .insert({ id: scId, location_id: locationId, count_date: countDate, counted_by: req.user!.id, status: 'In Progress', notes });
      if (scError) return res.status(500).json({ error: scError.message });

      if (lines && lines.length > 0) {
        const scLines = lines.map((l: any) => ({
          stock_count_id: scId,
          item_id: l.itemId,
          item_name: l.itemName,
          ingredient_id: l.ingredientId,
          expected_quantity: l.expectedQuantity,
          counted_quantity: l.countedQuantity,
          unit: l.unit,
          variance_quantity: (l.countedQuantity || 0) - (l.expectedQuantity || 0),
          variance_value: l.varianceValue || 0,
          notes: l.notes,
        }));
        const { error: linesError } = await supabaseAdmin.from('stock_count_lines').insert(scLines);
        if (linesError) return res.status(500).json({ error: linesError.message });
      }

      return res.json({ success: true, stockCountId: scId });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/procurement/stock-counts/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { status, lines } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { status };
      if (status === 'Approved') { updateData.approved_by = req.user!.id; }

      const { data, error } = await supabaseAdmin.from('stock_counts').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // Update counted lines if provided
      if (lines && lines.length > 0) {
        for (const line of lines) {
          await supabaseAdmin.from('stock_count_lines')
            .update({ counted_quantity: line.countedQuantity, variance_quantity: (line.countedQuantity || 0) - (line.expectedQuantity || 0) })
            .eq('id', line.id);
        }
      }

      // If approved, post stock adjustments
      if (status === 'Approved') {
        const { data: scLines } = await supabaseAdmin.from('stock_count_lines').select('*').eq('stock_count_id', req.params.id);
        for (const line of scLines || []) {
          if (line.variance_quantity && line.variance_quantity !== 0) {
            // Post stock transaction for the adjustment
            await supabaseAdmin.from('stock_transactions').insert({
              ingredient_id: line.ingredient_id,
              location_id: data.location_id,
              transaction_type: 'Adjustment',
              quantity: line.variance_quantity,
              unit: line.unit,
              cost_per_unit: 0,
              total_value: line.variance_value || 0,
              reference_doc: data.id,
              reference_type: 'StockCount',
              notes: `Stock count adjustment: ${line.item_name || line.ingredient_id}`,
            });
          }
        }
      }

      return res.json({ success: true, stockCount: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Requisitions
  app.get('/api/procurement/requisitions', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('requisitions')
        .select('*, requisition_lines(*)').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/procurement/requisitions', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { fromLocationId, toOutletId, department, priority, requiredDate, notes, lines } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const reqId = crypto.randomUUID();
      const reqNumber = `REQ-${Date.now().toString().slice(-6)}`;
      const { error: reqError } = await supabaseAdmin.from('requisitions')
        .insert({
          id: reqId, req_number: reqNumber, from_location_id: fromLocationId, to_outlet_id: toOutletId,
          department, priority: priority || 'Normal', required_date: requiredDate,
          status: 'Draft', requested_by: req.user!.id, notes,
        });
      if (reqError) return res.status(500).json({ error: reqError.message });

      if (lines && lines.length > 0) {
        const reqLines = lines.map((l: any) => ({
          requisition_id: reqId,
          item_id: l.itemId,
          item_name: l.itemName,
          quantity: l.quantity,
          unit: l.unit,
          notes: l.notes,
        }));
        const { error: linesError } = await supabaseAdmin.from('requisition_lines').insert(reqLines);
        if (linesError) return res.status(500).json({ error: linesError.message });
      }

      return res.json({ success: true, requisitionId: reqId, reqNumber });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/procurement/requisitions/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
    const { status, fulfilledLines } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { status };
      if (status === 'Approved') { updateData.approved_by = req.user!.id; updateData.approved_at = new Date().toISOString(); }
      if (status === 'Fulfilled') { updateData.fulfilled_by = req.user!.id; updateData.fulfilled_at = new Date().toISOString(); }

      const { data, error } = await supabaseAdmin.from('requisitions').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // Update fulfilled quantities if provided
      if (fulfilledLines && fulfilledLines.length > 0) {
        for (const line of fulfilledLines) {
          await supabaseAdmin.from('requisition_lines')
            .update({ fulfilled_quantity: line.fulfilledQuantity }).eq('id', line.id);
        }
      }

      return res.json({ success: true, requisition: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Engineering & Maintenance API
  // =====================
  app.get('/api/engineering/assets', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('fixed_assets').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/engineering/assets', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { assetCode, assetName, assetCategory, description, location, purchaseDate, purchaseCost, salvageValue, usefulLifeYears, depreciationMethod, serialNumber, manufacturer, modelNumber, warrantyStart, warrantyEnd, warrantyProvider, criticality, parentAssetId } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('fixed_assets')
        .insert({
          asset_code: assetCode, asset_name: assetName, asset_category: assetCategory, description,
          location, purchase_date: purchaseDate, purchase_cost: purchaseCost || 0,
          salvage_value: salvageValue || 0, useful_life_years: usefulLifeYears,
          depreciation_method: depreciationMethod || 'Straight Line',
          net_book_value: (purchaseCost || 0) - (salvageValue || 0),
          serial_number: serialNumber, manufacturer, model_number: modelNumber,
          warranty_start: warrantyStart, warranty_end: warrantyEnd, warranty_provider: warrantyProvider,
          criticality: criticality || 'Medium', parent_asset_id: parentAssetId,
          status: 'Active',
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, asset: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/engineering/assets/:id', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { status, ...updates } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      const { data, error } = await supabaseAdmin.from('fixed_assets').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, asset: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.delete('/api/engineering/assets/:id', authenticate, requirePermission('engineering:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('fixed_assets').delete().eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // PM Schedules
  app.get('/api/engineering/pm-schedules', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('pm_schedules')
        .select('*, fixed_assets(asset_name, asset_code, location)').order('next_due_date', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/engineering/pm-schedules', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { scheduleName, assetId, frequency, intervalDays, nextDueDate, checklistTemplate, assignedTechnician, priority } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('pm_schedules')
        .insert({
          schedule_name: scheduleName, asset_id: assetId, frequency: frequency || 'Monthly',
          interval_days: intervalDays || 30, next_due_date: nextDueDate,
          checklist_template: checklistTemplate || [], assigned_technician: assignedTechnician,
          priority: priority || 'Medium', status: 'Active',
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, schedule: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/engineering/pm-schedules/:id', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { status, nextDueDate, lastCompletedDate } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (nextDueDate) updateData.next_due_date = nextDueDate;
      if (lastCompletedDate) updateData.last_completed_date = lastCompletedDate;
      const { data, error } = await supabaseAdmin.from('pm_schedules').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, schedule: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Generate PM work orders
  app.post('/api/engineering/generate-pm-work-orders', authenticate, requirePermission('engineering:write'), async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('generate_pm_work_orders', { p_date: new Date().toISOString().split('T')[0] });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, generated: data || [] });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Work Orders
  app.get('/api/engineering/work-orders', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('work_orders')
        .select('*, fixed_assets(asset_name, asset_code, location)').order('created_date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/engineering/work-orders', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { title, description, assetId, type, priority, assignedTo, roomNumber, scheduledDate, checklist } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const woId = crypto.randomUUID();
      const woNumber = `WO-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabaseAdmin.from('work_orders')
        .insert({
          id: woId, wo_number: woNumber, asset_id: assetId, title, description,
          type: type || 'Corrective', priority: priority || 'Medium', status: 'Open',
          assigned_to: assignedTo, room_number: roomNumber, scheduled_date: scheduledDate,
          checklist: checklist || [], created_by: req.user!.id,
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, workOrder: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/engineering/work-orders/:id', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { status, completedChecklist, sparePartsUsed, laborHours, actualCost, notes, startedAt } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (completedChecklist) updateData.completed_checklist = completedChecklist;
      if (sparePartsUsed) updateData.spare_parts_used = sparePartsUsed;
      if (laborHours !== undefined) updateData.labor_hours = laborHours;
      if (actualCost !== undefined) updateData.actual_cost = actualCost;
      if (notes !== undefined) updateData.notes = notes;
      if (startedAt) updateData.started_at = startedAt;
      if (status === 'Completed') updateData.completed_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin.from('work_orders').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // If completed and has room number, auto-release OOO/OOS room
      if (status === 'Completed' && data.room_number) {
        const { error: releaseError } = await supabaseAdmin.rpc('release_ooo_room', { p_wo_id: req.params.id });
        if (releaseError) console.error('OOO release failed:', releaseError.message);
      }

      return res.json({ success: true, workOrder: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Spare Parts
  app.get('/api/engineering/spare-parts', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('spare_parts').select('*').order('part_name', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/engineering/spare-parts', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { partNumber, partName, category, manufacturer, unit, minStock, maxStock, currentStock, unitCost, location, reorderQty } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('spare_parts')
        .insert({
          part_number: partNumber, part_name: partName, category, manufacturer,
          unit: unit || 'pcs', min_stock: minStock || 5, max_stock: maxStock || 50,
          current_stock: currentStock || 0, unit_cost: unitCost || 0, location,
          reorder_qty: reorderQty || 10,
        })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, sparePart: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/engineering/spare-parts/:id', authenticate, requirePermission('engineering:write'), async (req, res) => {
    const { currentStock, minStock, maxStock, reorderQty } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (currentStock !== undefined) updateData.current_stock = currentStock;
      if (minStock !== undefined) updateData.min_stock = minStock;
      if (maxStock !== undefined) updateData.max_stock = maxStock;
      if (reorderQty !== undefined) updateData.reorder_qty = reorderQty;
      const { data, error } = await supabaseAdmin.from('spare_parts').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, sparePart: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // =====================
  // Sales & Events API
  // =====================
  app.get('/api/sales/leads', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('sales_leads').select('*, corporate_accounts(company_name)').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/sales/leads', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { leadName, company, contactPerson, contactEmail, contactPhone, source, stage, opportunityValue, expectedCloseDate, assignedTo, corporateAccountId, priority, notes } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const leadNum = `LEAD-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabaseAdmin.from('sales_leads')
        .insert({ lead_number: leadNum, lead_name: leadName, company, contact_person: contactPerson, contact_email: contactEmail, contact_phone: contactPhone, source: source || 'Direct', stage: stage || 'Prospect', opportunity_value: opportunityValue || 0, expected_close_date: expectedCloseDate, assigned_to: assignedTo, corporate_account_id: corporateAccountId, priority: priority || 'Medium', notes })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, lead: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/sales/leads/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { stage, opportunityValue, expectedCloseDate, assignedTo, priority, notes, lostReason, conversionDate } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (stage) updateData.stage = stage;
      if (opportunityValue !== undefined) updateData.opportunity_value = opportunityValue;
      if (expectedCloseDate) updateData.expected_close_date = expectedCloseDate;
      if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
      if (priority) updateData.priority = priority;
      if (notes !== undefined) updateData.notes = notes;
      if (lostReason !== undefined) updateData.lost_reason = lostReason;
      if (conversionDate) updateData.conversion_date = conversionDate;
      const { data, error } = await supabaseAdmin.from('sales_leads').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, lead: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Proposals
  app.get('/api/sales/proposals', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('sales_proposals').select('*, sales_leads(lead_name, company), corporate_accounts(company_name)').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/sales/proposals', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { leadId, corporateAccountId, title, eventType, eventDates, guestCount, roomNights, proposedRevenue, discountPercent, termsConditions, validUntil, notes } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const propNum = `PROP-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabaseAdmin.from('sales_proposals')
        .insert({ proposal_number: propNum, lead_id: leadId, corporate_account_id: corporateAccountId, title, event_type: eventType, event_dates: eventDates, guest_count: guestCount || 0, room_nights: roomNights || 0, proposed_revenue: proposedRevenue || 0, discount_percent: discountPercent || 0, terms_conditions: termsConditions, valid_until: validUntil, notes, created_by: req.user!.id, status: 'Draft' })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, proposal: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/sales/proposals/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { status, sentDate, acceptedDate, rejectedDate } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (sentDate) updateData.sent_date = sentDate;
      if (acceptedDate) updateData.accepted_date = acceptedDate;
      if (rejectedDate) updateData.rejected_date = rejectedDate;
      const { data, error } = await supabaseAdmin.from('sales_proposals').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, proposal: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Contracts
  app.get('/api/sales/contracts', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('sales_contracts').select('*, sales_proposals(proposal_number, title), corporate_accounts(company_name)').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/sales/contracts', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { proposalId, leadId, corporateAccountId, title, eventType, startDate, endDate, guestCount, roomNights, totalValue, depositAmount, terms, signedByClient, signedDate } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const contractNum = `CONTRACT-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabaseAdmin.from('sales_contracts')
        .insert({ contract_number: contractNum, proposal_id: proposalId, lead_id: leadId, corporate_account_id: corporateAccountId, title, event_type: eventType, start_date: startDate, end_date: endDate, guest_count: guestCount || 0, room_nights: roomNights || 0, total_value: totalValue || 0, deposit_amount: depositAmount || 0, terms, signed_by_client: signedByClient, signed_date: signedDate, status: 'Active', created_by: req.user!.id })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, contract: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/sales/contracts/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { status, depositPaid, signedByClient, signedDate } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (depositPaid !== undefined) updateData.deposit_paid = depositPaid;
      if (signedByClient !== undefined) updateData.signed_by_client = signedByClient;
      if (signedDate) updateData.signed_date = signedDate;
      const { data, error } = await supabaseAdmin.from('sales_contracts').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, contract: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Create group block from contract
  app.post('/api/sales/contracts/:id/create-group-block', authenticate, requirePermission('sales:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('create_group_block_from_contract', { p_contract_id: req.params.id });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, block: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Create BEO from contract
  app.post('/api/sales/contracts/:id/create-beo', authenticate, requirePermission('sales:write'), async (req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('create_beo_from_contract', { p_contract_id: req.params.id });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, beo: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Corporate Accounts
  app.get('/api/sales/corporate-accounts', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('corporate_accounts').select('*').order('company_name', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.post('/api/sales/corporate-accounts', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { companyName, contactPerson, contactEmail, contactPhone, discountPercent, creditLimit, creditTerms, billingAddress, taxId, industry, notes } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('corporate_accounts')
        .insert({ company_name: companyName, contact_person: contactPerson, contact_email: contactEmail, contact_phone: contactPhone, discount_percent: discountPercent || 0, credit_limit: creditLimit || 0, credit_terms: creditTerms || 'Net 30', billing_address: billingAddress, tax_id: taxId, industry, notes })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, account: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  app.patch('/api/sales/corporate-accounts/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
    const { companyName, contactPerson, contactEmail, contactPhone, discountPercent, creditLimit, creditTerms, billingAddress, taxId, industry, notes, activeBookings, unpaidBalance } = req.body;
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (companyName !== undefined) updateData.company_name = companyName;
      if (contactPerson !== undefined) updateData.contact_person = contactPerson;
      if (contactEmail !== undefined) updateData.contact_email = contactEmail;
      if (contactPhone !== undefined) updateData.contact_phone = contactPhone;
      if (discountPercent !== undefined) updateData.discount_percent = discountPercent;
      if (creditLimit !== undefined) updateData.credit_limit = creditLimit;
      if (creditTerms !== undefined) updateData.credit_terms = creditTerms;
      if (billingAddress !== undefined) updateData.billing_address = billingAddress;
      if (taxId !== undefined) updateData.tax_id = taxId;
      if (industry !== undefined) updateData.industry = industry;
      if (notes !== undefined) updateData.notes = notes;
      if (activeBookings !== undefined) updateData.active_bookings = activeBookings;
      if (unpaidBalance !== undefined) updateData.unpaid_balance = unpaidBalance;
      const { data, error } = await supabaseAdmin.from('corporate_accounts').update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, account: data });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Group Analytics
  app.get('/api/sales/analytics', authenticate, async (_req, res) => {
    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const [leads, contracts, proposals] = await Promise.all([
        supabaseAdmin.from('sales_leads').select('stage, opportunity_value, created_at'),
        supabaseAdmin.from('sales_contracts').select('total_value, status, created_at'),
        supabaseAdmin.from('sales_proposals').select('proposed_revenue, status'),
      ]);
      const totalLeads = leads.data?.length || 0;
      const wonLeads = leads.data?.filter(l => l.stage === 'Won').length || 0;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
      const totalPipelineValue = leads.data?.reduce((s, l) => s + Number(l.opportunity_value || 0), 0) || 0;
      const totalContractValue = contracts.data?.reduce((s, c) => s + Number(c.total_value || 0), 0) || 0;
      const totalProposedValue = proposals.data?.reduce((s, p) => s + Number(p.proposed_revenue || 0), 0) || 0;
      const stageCounts: Record<string, number> = {};
      leads.data?.forEach(l => { stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1; });
      return res.json({ totalLeads, wonLeads, conversionRate, totalPipelineValue, totalContractValue, totalProposedValue, stageCounts });
    }
    return res.status(503).json({ error: 'Database not configured' });
  });

  // Vite SPA middleware — registered AFTER all API routes so POST/PUT/DELETE
  // requests to /api/* are matched before Vite intercepts them.
  const hasBuiltApp = fs.existsSync(distIndex);
  if (!isProduction && !hasBuiltApp) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
      root: process.cwd()
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ERP] Core running at http://localhost:${PORT}`);
    console.log(`[ERP] Auth store: database`);
    // Start scheduler
    import('./src/server/scheduler').then(({ loadAndStartJobs }) => {
      loadAndStartJobs().catch(err => console.error('[Scheduler] Failed to start:', err.message));
    });
  });
}

startServer();
