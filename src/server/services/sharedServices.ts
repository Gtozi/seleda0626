/**
 * Shared server-side services and helpers
 * Extracted from server.ts for route module use (Step 4.1)
 */
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import type { User } from '../../types/erp';
import { resolvePolicy, type PasswordPolicy } from '../../lib/passwordPolicy';

type AllowedTab = NonNullable<User['allowedTabs']>[number];

let cachedGlobalSettingsColumns: Set<string> | null = null;

export async function getGlobalSettingsColumns(): Promise<Set<string>> {
  if (cachedGlobalSettingsColumns) return cachedGlobalSettingsColumns;
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return new Set();
  try {
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', { p_table_name: 'global_settings' });
    if (error || !data) { console.warn('Failed to fetch global_settings columns:', error); return new Set(); }
    const columns = Array.isArray(data) ? data.map((row: any) => row.column_name) : [];
    cachedGlobalSettingsColumns = new Set(columns);
    return cachedGlobalSettingsColumns;
  } catch (e) { console.warn('Error fetching global_settings columns:', e); return new Set(); }
}

export async function filterKnownColumns(obj: Record<string, any>): Promise<Record<string, any>> {
  const allowedColumns = await getGlobalSettingsColumns();
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (allowedColumns.has(key)) result[key] = value;
  }
  return result;
}

export function camelToSnakeRecord(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snake] = value;
  }
  return result;
}

export function snakeToCamelRecord(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camel = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camel] = value;
  }
  return result;
}

export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  const aStart = new Date(aIn).getTime();
  const aEnd = new Date(aOut).getTime();
  const bStart = new Date(bIn).getTime();
  const bEnd = new Date(bOut).getTime();
  if ([aStart, aEnd, bStart, bEnd].some(t => isNaN(t))) return false;
  return aStart < bEnd && bStart < aEnd;
}

export function getTypeAvailability(
  roomTypeId: string, checkInDate: string, checkOutDate: string,
  rooms: any[], reservations: any[], excludeReservationId?: string, requestedQuantity: number = 1
) {
  // Sellable capacity excludes rooms that are physically unavailable
  // (Out of Order / Out of Service / Maintenance).
  const UNSELLABLE_STATUSES = new Set(['Out of Order', 'Out of Service', 'Maintenance']);
  const capacity = rooms.filter((r: any) =>
    r.room_type_id === roomTypeId && !UNSELLABLE_STATUSES.has(r.status)
  ).length;
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

export function getRoomImageUrl(type: string): string {
  const map: Record<string, string> = {
    Single: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    Double: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    Deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    Suite: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    Penthouse: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200',
  };
  return map[type] || map.Deluxe;
}

export function findAvailableRoomForReservation(
  res: any, rooms: any[], reservations: any[], excludeRoomNumbers: Set<string> = new Set()
): string | null {
  // Only confirmed-consuming reservations block physical inventory;
  // Cancelled/NoShow do not. Waitlisted bookings are overflow-tolerant
  // except Direct Website public bookings.
  const BLOCKING_STATUSES = new Set(['Confirmed', 'CheckedIn']);
  const unavailableRoomNumbers = new Set([
    ...reservations
      .filter((r: any) =>
        r.id !== res.id && r.room_number && r.room_type_id === res.room_type_id &&
        (BLOCKING_STATUSES.has(r.status) ||
         (r.status === 'Waitlisted' && r.channel === 'Direct Website')) &&
        rangesOverlap(res.check_in_date, res.check_out_date, r.check_in_date, r.check_out_date)
      )
      .map((r: any) => r.room_number),
    ...excludeRoomNumbers
  ]);
  const UNSELLABLE_STATUSES = new Set(['Out of Order', 'Out of Service', 'Maintenance']);
  const candidates = rooms.filter((r: any) =>
    r.room_type_id === res.room_type_id &&
    !UNSELLABLE_STATUSES.has(r.status) &&
    !unavailableRoomNumbers.has(r.number)
  );
  if (candidates.length === 0) return null;
  // Prefer Vacant Clean, then by room number for deterministic assignment.
  candidates.sort((a: any, b: any) => {
    const aClean = a.status === 'Vacant Clean' ? 0 : 1;
    const bClean = b.status === 'Vacant Clean' ? 0 : 1;
    if (aClean !== bClean) return aClean - bClean;
    return String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
  });
  return candidates[0].number;
}

export function deriveLegacyPermissions(permissionCodes: string[]): { allowedTabs: AllowedTab[]; allowedSettings: Record<string, boolean> } {
  const allowedTabs = new Set<AllowedTab>();
  const allowedSettings: Record<string, boolean> = {};
  const tabMapping: Record<string, AllowedTab[]> = {
    'rates:view': ['finance'], 'rates:update': ['finance'],
    'room:status:update': ['housekeeping', 'maintenance'],
    'folio:charge:add': ['finance'], 'folio:charge:void': ['finance'],
    'folio:payment:add': ['finance'], 'folio:payment:void': ['finance'],
    'users:manage': ['admin', 'hr'], 'roles:manage': ['admin'],
    'audit:view': ['admin', 'finance'],
    'settings:update': ['admin', 'settings'], 'settings:tax:update': ['admin', 'finance'],
    'reports:view': ['finance', 'executive'], 'reports:export': ['finance', 'executive'],
    'inventory:view': ['inventory'], 'inventory:manage': ['inventory'],
    'procurement:view': ['procurement'], 'procurement:manage': ['procurement'],
    'hr:view': ['hr'], 'hr:manage': ['hr'],
  };
  const settingMapping: Record<string, string> = {
    'rates:view': 'viewRatePlans', 'rates:update': 'editRatePlans',
    'room:status:update': 'viewRoomOutlook', 'reservation:create': 'viewRoomOutlook',
    'reservation:check_in': 'viewRoomOutlook', 'users:manage': 'manageUserAccounts',
    'settings:update': 'editGlobalSettings', 'settings:tax:update': 'adjustHotelTaxes',
    'folio:payment:void': 'voidTransactions', 'audit:view': 'accessAuditLogs',
  };
  for (const code of permissionCodes) {
    const tabs = tabMapping[code]; if (tabs) tabs.forEach(t => allowedTabs.add(t));
    const setting = settingMapping[code]; if (setting) allowedSettings[setting] = true;
  }
  return { allowedTabs: Array.from(allowedTabs), allowedSettings };
}

export async function enrichUserWithDerivedPermissions(user: User): Promise<User> {
  // Fallback mode: provide default permissions based on role
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    const roleToTab: Record<string, AllowedTab[]> = {
      // Front Office
      'frontoffice': ['frontoffice', 'settings'],
      'front office manager': ['frontoffice', 'settings'],
      'front_office_manager': ['frontoffice', 'settings'],
      'fo_manager': ['frontoffice', 'settings'],
      // Housekeeping
      'housekeeping': ['housekeeping', 'settings'],
      'housekeeping_manager': ['housekeeping', 'settings'],
      'hk_manager': ['housekeeping', 'settings'],
      // F&B
      'f&b': ['f&b', 'settings'],
      'fb_manager': ['f&b', 'settings'],
      'f&b_manager': ['f&b', 'settings'],
      'food_beverage_manager': ['f&b', 'settings'],
      // Maintenance
      'maintenance': ['maintenance', 'settings'],
      'maintenance_manager': ['maintenance', 'settings'],
      'eng_manager': ['maintenance', 'settings'],
      'engineering_manager': ['maintenance', 'settings'],
      // Inventory
      'inventory': ['inventory', 'settings'],
      'inventory_manager': ['inventory', 'settings'],
      'stores_manager': ['inventory', 'settings'],
      // Finance
      'finance': ['finance', 'settings'],
      'fin_manager': ['finance', 'settings'],
      'finance_manager': ['finance', 'settings'],
      'finance_controller': ['finance', 'settings'],
      'finance_director': ['finance', 'settings'],
      'cfo': ['finance', 'settings'],
      'accountant': ['finance', 'settings'],
      'auditor': ['finance', 'settings'],
      'revenue_manager': ['finance', 'settings'],
      'revenue': ['finance', 'settings'],
      'guest': ['finance', 'settings'], // Accountant role
      // HR
      'hr': ['hr', 'settings'],
      'hr_manager': ['hr', 'settings'],
      'human_resources_manager': ['hr', 'settings'],
      // Executive
      'executive': ['executive', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'admin', 'procurement', 'operations', 'sales', 'settings'],
      'general_manager': ['executive', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'admin', 'procurement', 'operations', 'sales', 'settings'],
      'gm': ['executive', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'admin', 'procurement', 'operations', 'sales', 'settings'],
      'owner': ['executive', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'admin', 'procurement', 'operations', 'sales', 'settings'],
      // Admin
      'admin': ['admin', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'procurement', 'operations', 'sales', 'settings'],
      'system_admin': ['admin', 'frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'procurement', 'operations', 'sales', 'settings'],
      // Procurement
      'procurement': ['procurement', 'settings'],
      'procurement_manager': ['procurement', 'settings'],
      // Operations
      'operations': ['operations', 'settings'],
      'ops_manager': ['operations', 'settings'],
      'operations_manager': ['operations', 'settings'],
      // Sales
      'sales': ['sales', 'settings'],
      'sales_manager': ['sales', 'settings'],
      'sales_director': ['sales', 'settings'],
      // Concierge
      'concierge': ['concierge', 'settings'],
      'concierge_manager': ['concierge', 'settings'],
      'guest_services_manager': ['concierge', 'settings'],
      // Spa & Wellness
      'spa': ['spa-wellness', 'settings'],
      'spa_manager': ['spa-wellness', 'settings'],
      'spa_director': ['spa-wellness', 'settings'],
      'wellness_manager': ['spa-wellness', 'settings'],
      // Banquet & Events
      'banquet': ['frontoffice', 'settings'],
      // Transportation
      'transportation': ['operations', 'settings'],
      // Security
      'security_manager': ['operations', 'settings'],
      // Member roles (guest-facing)
      'member': ['settings'],
    };
    return { 
      ...user, 
      allowedTabs: roleToTab[user.role] || ['settings'], 
      allowedSettings: { ...(user.allowedSettings || {}) } 
    };
  }

  // If user has a custom role, derive allowedTabs from the role's module_access + permissions
  if (user.customRoleId && hasSupabaseAdminConfig && supabaseAdmin) {
    try {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('is_superuser, module_access, role_permissions ( permissions ( code ) )')
        .eq('id', user.customRoleId)
        .maybeSingle();

      if (roleError) {
        console.error('[enrich] Role lookup error for customRoleId:', user.customRoleId, roleError);
      }

      if (!roleError && roleData) {
        if (roleData.is_superuser) {
          return {
            ...user,
            allowedTabs: ['frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'admin', 'procurement', 'operations', 'sales', 'settings'] as AllowedTab[],
            allowedSettings: { ...(user.allowedSettings || {}) },
          };
        }

        // Map module_access keys to allowedTabs
        // Handles both top-level department keys (e.g., 'frontoffice') and sub-module IDs (e.g., 'fo_dashboard')
        const moduleToTab: Record<string, AllowedTab> = {
          // Top-level department keys
          'frontoffice': 'frontoffice', 'housekeeping': 'housekeeping',
          'fnb': 'f&b', 'engineering': 'maintenance',
          'inventory': 'inventory', 'finance': 'finance',
          'hr': 'hr', 'executive': 'executive',
          'admin': 'admin', 'procurement': 'procurement',
          'operations': 'operations', 'sales': 'sales', 'settings': 'settings',
          // Sub-module prefixes → parent tab
          'fo_': 'frontoffice', 'hk_': 'housekeeping',
          'fb_': 'f&b', 'eng_': 'maintenance',
          'inv_': 'inventory', 'fin_': 'finance',
          'hr_': 'hr', 'exec_': 'executive',
          'admin_': 'admin', 'proc_': 'procurement',
          'sales_': 'sales', 'ops_': 'operations',
        };

        // Start fresh — don't inherit stale allowedTabs from DB
        const allowedTabs = new Set<AllowedTab>();
        const moduleAccess = roleData.module_access || {};
        console.log('[enrich] customRoleId:', user.customRoleId, 'module_access:', JSON.stringify(moduleAccess));
        for (const [moduleId, access] of Object.entries(moduleAccess)) {
          const a = access as any;
          if (a && (a.read === true || a === true)) {
            // Try exact match first, then prefix match (e.g., 'fo_dashboard' matches 'fo_')
            let tab = moduleToTab[moduleId];
            if (!tab) {
              const prefix = Object.keys(moduleToTab).find(k => k.endsWith('_') && moduleId.startsWith(k));
              if (prefix) tab = moduleToTab[prefix];
            }
            if (tab) allowedTabs.add(tab);
          }
        }

        // Also derive tabs from permission codes
        const codes: string[] = [];
        (roleData.role_permissions || []).forEach((rp: any) => {
          const perm = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
          if (perm?.code) codes.push(perm.code);
        });
        const derived = deriveLegacyPermissions(codes);
        derived.allowedTabs.forEach(t => allowedTabs.add(t));

        // Always include settings for active users
        allowedTabs.add('settings');

        console.log('[enrich] Final allowedTabs:', Array.from(allowedTabs));

        return {
          ...user,
          allowedTabs: Array.from(allowedTabs),
          allowedSettings: { ...(derived.allowedSettings || {}), ...(user.allowedSettings || {}) },
          moduleAccess: roleData.module_access || {},
        };
      }
    } catch (e) {
      console.error('Failed to enrich custom role permissions:', e);
    }
  }

  // Fallback: system role defaults
  if (user.role === 'system_admin' || user.role === 'admin') {
    return { ...user, allowedTabs: ['admin', 'settings'] as AllowedTab[], allowedSettings: { ...(user.allowedSettings || {}) } };
  }
  if (user.role === 'general_manager' || user.role === 'gm' || user.role === 'owner' || user.role === 'executive') {
    return { ...user, allowedTabs: ['executive', 'settings'] as AllowedTab[], allowedSettings: { ...(user.allowedSettings || {}) } };
  }
  const roleToTab: Record<string, AllowedTab[]> = {
    // Front Office
    'frontoffice': ['frontoffice', 'settings'],
    'front office manager': ['frontoffice', 'settings'],
    'front_office_manager': ['frontoffice', 'settings'],
    'fo_manager': ['frontoffice', 'settings'],
    // Housekeeping
    'housekeeping': ['housekeeping', 'settings'],
    'housekeeping_manager': ['housekeeping', 'settings'],
    'hk_manager': ['housekeeping', 'settings'],
    // F&B
    'f&b': ['f&b', 'settings'],
    'fb_manager': ['f&b', 'settings'],
    'f&b_manager': ['f&b', 'settings'],
    'food_beverage_manager': ['f&b', 'settings'],
    // Maintenance
    'maintenance': ['maintenance', 'settings'],
    'maintenance_manager': ['maintenance', 'settings'],
    'eng_manager': ['maintenance', 'settings'],
    'engineering_manager': ['maintenance', 'settings'],
    // Inventory
    'inventory': ['inventory', 'settings'],
    'inventory_manager': ['inventory', 'settings'],
    'stores_manager': ['inventory', 'settings'],
    // Finance
    'finance': ['finance', 'settings'],
    'fin_manager': ['finance', 'settings'],
    'finance_manager': ['finance', 'settings'],
    'finance_controller': ['finance', 'settings'],
    'finance_director': ['finance', 'settings'],
    'cfo': ['finance', 'settings'],
    'accountant': ['finance', 'settings'],
    'auditor': ['finance', 'settings'],
    'revenue_manager': ['finance', 'settings'],
    'revenue': ['finance', 'settings'],
    'guest': ['finance', 'settings'], // Accountant role
    // HR
    'hr': ['hr', 'settings'],
    'hr_manager': ['hr', 'settings'],
    'human_resources_manager': ['hr', 'settings'],
    // Procurement
    'procurement': ['procurement', 'settings'],
    'procurement_manager': ['procurement', 'settings'],
    // Operations
    'operations': ['operations', 'settings'],
    'ops_manager': ['operations', 'settings'],
    'operations_manager': ['operations', 'settings'],
    // Sales
    'sales': ['sales', 'settings'],
    'sales_manager': ['sales', 'settings'],
    'sales_director': ['sales', 'settings'],
    // Concierge
    'concierge': ['concierge', 'settings'],
    'concierge_manager': ['concierge', 'settings'],
    'guest_services_manager': ['concierge', 'settings'],
    // Spa & Wellness
    'spa': ['spa-wellness', 'settings'],
    'spa_manager': ['spa-wellness', 'settings'],
    'spa_director': ['spa-wellness', 'settings'],
    'wellness_manager': ['spa-wellness', 'settings'],
    // Banquet & Events
    'banquet': ['frontoffice', 'settings'],
    // Transportation
    'transportation': ['operations', 'settings'],
    // Security
    'security_manager': ['operations', 'settings'],
    // Member roles (guest-facing)
    'member': ['settings'],
  };
  if (roleToTab[user.role]) {
    return { ...user, allowedTabs: roleToTab[user.role], allowedSettings: { ...(user.allowedSettings || {}) } };
  }
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
        ? (['frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'admin', 'procurement', 'operations', 'sales', 'settings'] as AllowedTab[])
        : (derived.allowedTabs.length > 0 ? derived.allowedTabs : user.allowedTabs),
      allowedSettings: { ...(derived.allowedSettings || {}), ...(user.allowedSettings || {}) },
    };
  } catch { return user; }
}

export async function fetchPasswordPolicy(): Promise<PasswordPolicy | null> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return null;
  try {
    const { data } = await supabaseAdmin.from('global_settings').select('password_complexity').limit(1).maybeSingle();
    if (data?.password_complexity) return resolvePolicy(data.password_complexity);
  } catch {}
  return null;
}

export async function writeAuditEvent(params: {
  req: any; user: User; action: string; module?: string; entityType?: string;
  entityId?: string; details?: any; outcome?: string;
}): Promise<void> {
  const { req, user, action, module: mod, entityType, entityId, details, outcome } = params;
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    const event: Record<string, any> = {
      user_id: user.id,
      action,
      module: mod || 'system',
      timestamp: new Date().toISOString(),
      ip_address: req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
      user_agent: req.headers?.['user-agent'] || 'unknown',
    };
    if (entityType) event.entity_type = entityType;
    if (entityId) event.entity_id = entityId;
    if (details) event.details = details;
    if (outcome) event.outcome = outcome;
    await supabaseAdmin.from('audit_events').insert(event);
  } catch (e) {
    console.error('Failed to write audit event:', e);
  }
}

export async function ensureAuditEventsTable(): Promise<void> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    await supabaseAdmin.rpc('get_table_columns', { p_table_name: 'audit_events' });
  } catch {
    // Table might not exist yet — that's OK
  }
}

export async function ensurePendingAdminChangesTable(): Promise<void> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;
  try {
    await supabaseAdmin.from('pending_admin_changes').select('id').limit(1);
  } catch {
    // Table might not exist yet
  }
}

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
    authUserId: db.auth_user_id || undefined,
    employeeId: db.employee_id,
    username: db.username,
    mobileNumber: db.mobile_number,
    department: db.department,
    customRoleId: db.custom_role_id,
    moduleAccess: db.module_access || undefined,
    securitySettings: db.security_settings || undefined,
    dataRestrictions: db.data_restrictions || undefined,
    allowedTabs: db.allowed_tabs || undefined,
    allowedSettings: db.allowed_settings || undefined,
  };
}

export { hasSupabaseAdminConfig, supabaseAdmin };

// ─── Public booking helpers ──────────────────────────────────────────────

/**
 * Auto-assign rooms for public booking reservations.
 * Extracted from server.ts (Phase 1 of route-driven migration).
 * Best-effort: persists room assignments but does not fail the booking on error.
 */
export async function autoAssignRoomsForPublicBookings(
  reservationIds: string[],
  supabaseClient: any,
  checkIn?: string,
  checkOut?: string
): Promise<Record<string, string>> {
  let roomsList: any[];
  let reservationsList: any[];

  if (checkIn && checkOut) {
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
