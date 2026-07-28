import { supabase, hasSupabaseConfig, hasUserCustomKeys } from '../lib/supabase';
import { Room, Guest, Reservation, RatePlan, Season, Package, GroupBooking, CorporateAccount, User, CustomRole, SystemAuditLog, GlobalHotelSettings } from '../types/erp';
import { InventoryItem, Store, Requisition, StockMovement, Supplier, GRN } from '../types/inventory';
import {
  mapRoomFromDb as mapRoomFromDbCanonical,
  mapRoomToDb as mapRoomToDbCanonical,
  mapGuestFromDb as mapGuestFromDbCanonical,
  mapGuestToDb as mapGuestToDbCanonical,
  mapReservationFromDb as mapReservationFromDbCanonical,
  mapReservationToDb as mapReservationToDbCanonical,
  mapRatePlanFromDb as mapRatePlanFromDbCanonical,
  mapRatePlanToDb as mapRatePlanToDbCanonical,
  mapSeasonFromDb as mapSeasonFromDbCanonical,
  mapSeasonToDb as mapSeasonToDbCanonical,
  mapPackageFromDb as mapPackageFromDbCanonical,
  mapPackageToDb as mapPackageToDbCanonical,
  mapGroupBookingFromDb as mapGroupBookingFromDbCanonical,
} from './dataMapper';

// Canonical mappers — delegate to dataMapper.ts (single source of truth)
const mapRoomFromDb = (db: any): Room => mapRoomFromDbCanonical(db) as unknown as Room;
const mapRoomToDb = (room: Room) => mapRoomToDbCanonical(room);
const mapGuestFromDb = (db: any): Guest => mapGuestFromDbCanonical(db) as unknown as Guest;
const mapGuestToDb = (guest: Guest) => mapGuestToDbCanonical(guest);
const mapReservationFromDb = (db: any): Reservation => mapReservationFromDbCanonical(db) as unknown as Reservation;
const mapReservationToDb = (res: Reservation) => mapReservationToDbCanonical(res as any);
const mapRatePlanFromDb = (db: any): RatePlan => mapRatePlanFromDbCanonical(db) as unknown as RatePlan;
const mapRatePlanToDb = (plan: RatePlan) => mapRatePlanToDbCanonical(plan);
const mapSeasonFromDb = (db: any): Season => mapSeasonFromDbCanonical(db) as unknown as Season;
const mapSeasonToDb = (season: Season) => mapSeasonToDbCanonical(season);
const mapPackageFromDb = (db: any): Package => mapPackageFromDbCanonical(db) as unknown as Package;
const mapPackageToDb = (pkg: Package) => mapPackageToDbCanonical(pkg);
const mapGroupBookingFromDb = (db: any): GroupBooking => mapGroupBookingFromDbCanonical(db) as unknown as GroupBooking;

const mapStoreFromDb = (db: any): Store => ({
  id: db.id,
  name: db.name,
  type: db.type || 'Departmental',
  manager: db.manager || ''
});

const mapStoreToDb = (store: Store) => ({
  id: store.id,
  name: store.name,
  type: store.type,
  manager: store.manager
});

const mapInventoryItemFromDb = (db: any): InventoryItem => ({
  id: db.id,
  code: db.code || db.id,
  name: db.name,
  category: db.category || 'Operating Supplies',
  subcategory: db.subcategory || 'Consumables',
  unit: db.unit || 'pcs',
  brand: db.brand || undefined,
  supplierId: db.supplier_id || '',
  minStock: Number(db.min_stock || 0),
  maxStock: Number(db.max_stock || 0),
  reorderLevel: Number(db.reorder_level || 0),
  lastCost: Number(db.last_cost || db.price || 0),
  avgCost: Number(db.avg_cost || db.price || 0),
  currentStock: Number(db.current_stock ?? db.stock ?? 0),
  location: db.location || '',
  barcode: db.barcode || undefined,
  storeId: db.store_id || undefined,
  salePrice: Number(db.sale_price || 0),
  retailPrice: Number(db.retail_price || db.price || 0),
  guestPortalActive: db.guest_portal_active || false,
  imageUrl: db.image_url || undefined,
  dietaryTags: db.dietary_tags || []
});

const mapInventoryItemToDb = (item: InventoryItem) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  category: item.category,
  subcategory: item.subcategory,
  unit: item.unit,
  brand: item.brand || null,
  supplier_id: item.supplierId,
  min_stock: item.minStock,
  max_stock: item.maxStock,
  reorder_level: item.reorderLevel,
  last_cost: item.lastCost,
  avg_cost: item.avgCost,
  current_stock: item.currentStock,
  location: item.location,
  barcode: item.barcode || null,
  store_id: item.storeId || null,
  sale_price: item.salePrice ?? 0,
  retail_price: item.retailPrice ?? item.salePrice ?? 0,
  guest_portal_active: item.guestPortalActive ?? false,
  image_url: item.imageUrl || null,
  dietary_tags: item.dietaryTags || []
});

const mapSupplierFromDb = (db: any): Supplier => ({
  id: db.id,
  code: db.code,
  name: db.name,
  contactPerson: db.contact_person || '',
  phone: db.phone || '',
  email: db.email || '',
  status: db.status || 'Active',
  rating: Number(db.rating || 3)
});

const mapSupplierToDb = (supplier: Supplier) => ({
  id: supplier.id,
  code: supplier.code,
  name: supplier.name,
  contact_person: supplier.contactPerson,
  phone: supplier.phone,
  email: supplier.email,
  status: supplier.status,
  rating: supplier.rating
});

const mapRequisitionFromDb = (db: any): Requisition => ({
  id: db.id,
  number: db.number,
  department: db.department,
  requestedBy: db.requested_by,
  requestDate: db.request_date,
  priority: db.priority,
  status: db.status,
  items: db.items || []
});

const mapRequisitionToDb = (req: Requisition) => ({
  id: req.id,
  number: req.number,
  department: req.department,
  requested_by: req.requestedBy,
  request_date: req.requestDate,
  priority: req.priority,
  status: req.status,
  items: req.items
});

const mapStockMovementFromDb = (db: any): StockMovement => ({
  id: db.id,
  date: db.date,
  itemId: db.item_id,
  itemName: db.item_name,
  type: db.type,
  quantity: Number(db.quantity),
  cost: Number(db.cost || 0),
  reference: db.reference || '',
  user: db.user || '',
  storeFrom: db.store_from || undefined,
  storeTo: db.store_to || undefined
});

const mapStockMovementToDb = (m: StockMovement) => ({
  id: m.id,
  date: m.date,
  item_id: m.itemId,
  item_name: m.itemName,
  type: m.type,
  quantity: m.quantity,
  cost: m.cost,
  reference: m.reference,
  user: m.user,
  store_from: m.storeFrom || null,
  store_to: m.storeTo || null
});

const mapGRNFromDb = (db: any): GRN => ({
  id: db.id,
  number: db.number,
  supplierId: db.supplier_id || '',
  supplierName: db.supplier_name,
  purchaseOrderId: db.purchase_order_id || undefined,
  deliveryNote: db.delivery_note,
  invoiceNumber: db.invoice_number,
  receivedDate: db.received_date,
  receiver: db.receiver,
  items: db.items || [],
  totalValue: Number(db.total_value || 0)
});

const mapGRNToDb = (grn: GRN) => ({
  id: grn.id,
  number: grn.number,
  supplier_id: grn.supplierId,
  supplier_name: grn.supplierName,
  purchase_order_id: grn.purchaseOrderId || null,
  delivery_note: grn.deliveryNote,
  invoice_number: grn.invoiceNumber,
  received_date: grn.receivedDate,
  receiver: grn.receiver,
  items: grn.items,
  total_value: grn.totalValue
});

const mapSystemUserFromDb = (db: any): User => ({
  id: db.id,
  name: db.name,
  email: db.email,
  role: db.role,
  roleDescription: db.role_description || db.roleDescription || db.role,
  avatarInitials: db.avatar_initials || db.avatarInitials || db.name?.slice(0, 2).toUpperCase() || 'U',
  status: db.status || 'Active',
  lastLogin: db.last_login || db.lastLogin || undefined,
  authUserId: db.auth_user_id || db.authUserId || undefined,
  employeeId: db.employee_id || db.employeeId || undefined,
  username: db.username || undefined,
  mobileNumber: db.mobile_number || db.mobileNumber || undefined,
  department: db.department || undefined,
  customRoleId: db.custom_role_id || db.customRoleId || undefined,
  moduleAccess: db.module_access || db.moduleAccess || undefined,
  securitySettings: db.security_settings || db.securitySettings || undefined,
  dataRestrictions: db.data_restrictions || db.dataRestrictions || undefined,
  allowedTabs: db.allowed_tabs || db.allowedTabs || undefined,
  allowedSettings: db.allowed_settings || db.allowedSettings || undefined,
});

const mapCustomRoleFromDb = (db: any): CustomRole => ({
  id: db.id,
  name: db.name,
  description: db.description || '',
  department: db.department || '',
  modulePermissions: db.module_permissions || {},
  tabPermissions: db.tab_permissions || {},
  buttonPermissions: db.button_permissions || {},
  fieldPermissions: db.field_permissions || {},
  isSystem: db.is_system || false
});

// CORE SUPABASE API SERVICES
const isTableMissingError = (error: any): boolean => {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('could not find') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('not found') ||
    msg.includes('permission denied') ||
    msg.includes('insufficient_privilege') ||
    error.code === 'PGRST116' ||
    error.code === '42P01' ||
    error.code === '42501'
  );
};

const logMissingTableWarning = (tableName: string, error?: any) => {
  const msg = (error?.message || '').toLowerCase();
  const isPermission = msg.includes('permission denied') || error?.code === '42501';
  if (isPermission) {
    console.warn(
      `🔒 [Supabase Config] Access or permission denied on 'public.${tableName}'. ` +
      `Row-Level Security (RLS) is enabled, or the API key constraints prevent accessing this table. ` +
      `Please ensure appropriate policies are deployed in your Supabase Dashboard or table privileges are granted. ` +
      `The application will continue to work perfectly using robust modern local storage and in-memory fallback.`
    );
  } else {
    console.warn(
      `💡 [Supabase Config] The table 'public.${tableName}' is not found in your Supabase project schema yet. ` +
      `To provision this and all ERP tables, click the SQL Editor in your Supabase Dashboard and execute the SQL file found in '/supabase/schema.sql'. ` +
      `The application will continue to work perfectly using robust modern local storage and in-memory fallback.`
    );
  }
};


const fetchTable = async <T>(tableName: string, mapper: (db: any) => T, orderColumn = 'id'): Promise<T[]> => {
  try {
    const { data, error } = await supabase.from(tableName).select('*').order(orderColumn);
    if (error) {
      if (isTableMissingError(error)) {
        logMissingTableWarning(tableName, error);
        return [];
      }
      throw new Error(`Fetch ${tableName} failed: ${error.message}`);
    }
    return (data || []).map(mapper);
  } catch (e: any) {
    if (isTableMissingError(e)) {
      logMissingTableWarning(tableName, e);
      return [];
    }
    throw e;
  }
};

export const supabaseService = {
  isConfigured: () => hasSupabaseConfig,
  isUserConfigured: () => hasUserCustomKeys,

  // Test client connection
  testConnection: async (): Promise<{ success: boolean; message: string; details?: string }> => {
    if (!hasSupabaseConfig) {
      return { 
        success: false, 
        message: 'Credentials missing in environment setup.' 
      };
    }
    try {
      const { error } = await supabase.from('rooms').select('count', { count: 'exact', head: true });
      if (error) {
        if (isTableMissingError(error)) {
          return {
            success: true,
            message: 'Connected to Supabase project successfully! Note: Base tables in schema.sql still need execution.',
          };
        }
        return { 
          success: false, 
          message: `Database error: ${error.message}`,
          details: error.hint || ''
        };
      }
      return { 
        success: true, 
        message: 'Successfully established contact with Supabase PostgreSQL Cluster.' 
      };
    } catch (e: any) {
      return { 
        success: false, 
        message: 'Network execution error while testing connection.', 
        details: e.message 
      };
    }
  },

  // Rooms Api
  fetchRooms: async (propertyId?: string | null): Promise<Room[]> => {
    try {
      let query = supabase.from('rooms').select('*');
      if (propertyId) query = query.eq('property_id', propertyId);
      const { data, error } = await query.order('number');
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('rooms', error);
          return [];
        }
        throw new Error(`Fetch rooms failed: ${error.message}`);
      }
      return (data || []).map(mapRoomFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('rooms', e);
        return [];
      }
      throw e;
    }
  },

  upsertRooms: async (rooms: Room[]): Promise<void> => {
    const payload = rooms.map(mapRoomToDb);
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert rooms failed: ${response.status}`);
    }
  },

  updateRoomStatus: async (roomNumber: string, status: Room['status']): Promise<void> => {
    const response = await fetch(`/api/rooms/${encodeURIComponent(roomNumber)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Update room status failed: ${response.status}`);
    }
  },

  deleteRoom: async (id: string): Promise<void> => {
    const response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete room failed: ${response.status}`);
    }
  },

  // Guests Api
  fetchGuests: async (): Promise<Guest[]> => {
    try {
      const { data, error } = await supabase.from('guests').select('*').order('name');
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guests', error);
          return [];
        }
        throw new Error(`Fetch guests failed: ${error.message}`);
      }
      return (data || []).map(mapGuestFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guests', e);
        return [];
      }
      throw e;
    }
  },

  upsertGuest: async (guest: Guest): Promise<void> => {
    const payload = mapGuestToDb(guest);
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert guest failed: ${response.status}`);
    }
  },

  // Reservations Api
  fetchReservations: async (propertyId?: string | null): Promise<Reservation[]> => {
    try {
      let query = supabase.from('reservations').select('*');
      if (propertyId) query = query.eq('property_id', propertyId);
      const { data, error } = await query.order('check_in_date', { ascending: false });
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('reservations', error);
          return [];
        }
        throw new Error(`Fetch reservations failed: ${error.message}`);
      }
      return (data || []).map(mapReservationFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('reservations', e);
        return [];
      }
      throw e;
    }
  },

  upsertReservation: async (res: Reservation): Promise<void> => {
    const payload = mapReservationToDb(res);
    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(res.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn(`Upsert reservation warning: ${data.error || response.status}`);
        return;
      }
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        console.warn('Network error - reservation not synced to database (continuing with local state)');
        return;
      }
      console.warn(`Upsert reservation error: ${e instanceof Error ? e.message : String(e)}`);
    }
  },

  fetchRatePlans: async (): Promise<RatePlan[]> => fetchTable('rate_plans', mapRatePlanFromDb, 'name'),
  upsertRatePlan: async (plan: RatePlan): Promise<void> => {
    const response = await fetch('/api/rate-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapRatePlanToDb(plan)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert rate_plan failed: ${response.status}`);
    }
  },
  deleteRatePlan: async (id: string): Promise<void> => {
    const response = await fetch(`/api/rate-plans/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete rate_plan failed: ${response.status}`);
    }
  },

  fetchSeasons: async (): Promise<Season[]> => fetchTable('seasons', mapSeasonFromDb, 'name'),
  upsertSeason: async (season: Season): Promise<void> => {
    const response = await fetch('/api/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapSeasonToDb(season)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert season failed: ${response.status}`);
    }
  },
  deleteSeason: async (id: string): Promise<void> => {
    const response = await fetch(`/api/seasons/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete season failed: ${response.status}`);
    }
  },

  fetchPackages: async (): Promise<Package[]> => fetchTable('packages', mapPackageFromDb, 'name'),
  upsertPackage: async (pkg: Package): Promise<void> => {
    const response = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapPackageToDb(pkg)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert package failed: ${response.status}`);
    }
  },
  deletePackage: async (id: string): Promise<void> => {
    const response = await fetch(`/api/packages/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete package failed: ${response.status}`);
    }
  },

  fetchGroupBookings: async (): Promise<GroupBooking[]> => {
    return fetchTable('group_bookings', mapGroupBookingFromDb, 'id');
  },
  upsertGroupBooking: async (_group: GroupBooking): Promise<void> => {
    // Legacy table - migrated to group_profiles, no-op
  },

  fetchCorporateAccounts: async (): Promise<CorporateAccount[]> => {
    // Legacy table - migrated to group_profiles, return empty array
    return [];
  },
  upsertCorporateAccount: async (_account: CorporateAccount): Promise<void> => {
    // Legacy table - migrated to group_profiles, no-op
  },

  fetchInventoryStores: async (): Promise<Store[]> => fetchTable('inventory_stores', mapStoreFromDb, 'name'),
  upsertInventoryStore: async (store: Store): Promise<void> => {
    const response = await fetch('/api/inventory/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapStoreToDb(store)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert inventory_store failed: ${response.status}`);
    }
  },
  deleteInventoryStore: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/stores/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete inventory_store failed: ${response.status}`);
    }
  },

  fetchInventoryItems: async (): Promise<InventoryItem[]> => fetchTable('inventory_items', mapInventoryItemFromDb, 'name'),
  upsertInventoryItem: async (item: InventoryItem): Promise<void> => {
    const response = await fetch('/api/inventory/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapInventoryItemToDb(item)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert inventory_item failed: ${response.status}`);
    }
  },
  deleteInventoryItem: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/items/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete inventory_item failed: ${response.status}`);
    }
  },

  fetchInventorySuppliers: async (): Promise<Supplier[]> => fetchTable('inventory_suppliers', mapSupplierFromDb, 'name'),
  upsertInventorySupplier: async (supplier: Supplier): Promise<void> => {
    const response = await fetch('/api/inventory/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapSupplierToDb(supplier)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert inventory_supplier failed: ${response.status}`);
    }
  },
  deleteInventorySupplier: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/suppliers/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete inventory_supplier failed: ${response.status}`);
    }
  },

  fetchInventoryRequisitions: async (): Promise<Requisition[]> => fetchTable('inventory_requisitions', mapRequisitionFromDb, 'request_date'),
  upsertInventoryRequisition: async (req: Requisition): Promise<void> => {
    const response = await fetch('/api/inventory/requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapRequisitionToDb(req)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert requisition failed: ${response.status}`);
    }
  },
  deleteInventoryRequisition: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/requisitions/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete requisition failed: ${response.status}`);
    }
  },

  fetchStockMovements: async (): Promise<StockMovement[]> => fetchTable('inventory_stock_movements', mapStockMovementFromDb, 'movement_date'),
  upsertStockMovement: async (movement: StockMovement): Promise<void> => {
    const response = await fetch('/api/inventory/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapStockMovementToDb(movement)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert stock_movement failed: ${response.status}`);
    }
  },

  fetchInventoryGRNs: async (): Promise<GRN[]> => fetchTable('inventory_grns', mapGRNFromDb, 'received_date'),
  upsertInventoryGRN: async (grn: GRN): Promise<void> => {
    const response = await fetch('/api/inventory/grns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapGRNToDb(grn)),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert GRN failed: ${response.status}`);
    }
  },
  deleteInventoryGRN: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/grns/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete GRN failed: ${response.status}`);
    }
  },
  // Batch initial synchronizer utility
  pushInitialStateToSupabase: async (
    localRooms: Room[],
    localRatePlans: RatePlan[],
    localSeasons: Season[],
    localPackages: Package[]
  ): Promise<{ success: boolean; roomsCount: number; errors?: string[] }> => {
    const errors: string[] = [];
    let roomsCount = 0;

    try {
      if (localRooms.length > 0) {
        const resp = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(localRooms.map(mapRoomToDb)),
        });
        if (!resp.ok) errors.push(`Rooms push failed: ${resp.status}`);
        else roomsCount = localRooms.length;
      }

      if (localRatePlans.length > 0) {
        for (const r of localRatePlans) {
          const resp = await fetch('/api/rate-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: r.id, name: r.name, description: r.description, base_modifier: r.baseModifier, active: r.active }),
          });
          if (!resp.ok) errors.push(`Rate plan push failed: ${r.id}`);
        }
      }

      if (localSeasons.length > 0) {
        for (const s of localSeasons) {
          const resp = await fetch('/api/seasons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: s.id, name: s.name, start_month: s.startMonth, start_day: s.startDay, end_month: s.endMonth, end_day: s.endDay, multiplier: s.multiplier }),
          });
          if (!resp.ok) errors.push(`Season push failed: ${s.id}`);
        }
      }

      if (localPackages.length > 0) {
        for (const p of localPackages) {
          const resp = await fetch('/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: p.id, name: p.name, description: p.description, price: p.price, charge_frequency: p.chargeFrequency }),
          });
          if (!resp.ok) errors.push(`Package push failed: ${p.id}`);
        }
      }

      return {
        success: errors.length === 0,
        roomsCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (e: any) {
      return {
        success: false,
        roomsCount,
        errors: [e.message]
      };
    }
  },

  async fetchGlobalSettings(): Promise<Partial<GlobalHotelSettings> | null> {
    try {
      const response = await fetch('/api/settings', { credentials: 'include' });
      if (!response.ok) { console.error('Error fetching global settings:', response.status); return null; }
      const result = await response.json();
      const data = result.settings;
      if (!data) return null;
      return {
        customHotelName: data.custom_hotel_name,
        customHotelAddress: data.custom_hotel_address,
        hotelTin: data.hotel_tin || '',
        hotelVatNo: data.hotel_vat_no || '',
        hotelVatDate: data.hotel_vat_date || '',
        taxPercent: Number(data.tax_percent) || 15,
        serviceChargePercent: Number(data.service_charge_percent) || 10,
        exchangeRate: Number(data.exchange_rate) || 1,
        heroImageUrl: data.hero_image_url || '',
        contactPhone: data.contact_phone || '',
        publicTagline: data.public_tagline || '',
        socialLinks: data.social_links || [],
        invoiceTemplate: data.invoice_template as any,
        invoiceFooterText: data.invoice_footer_text || '',
        invoiceBankDetails: data.invoice_bank_details || '',
        paymentTypes: data.payment_types || [],
        addonCharges: data.addon_charges || [],
        feeComponents: data.fee_components || [],
        posCategories: data.pos_categories || [],
        posOutlets: data.pos_outlets || [],
        posPrinters: data.pos_printers || [],
        posOutletCategories: data.pos_outlet_categories || {},
        splitFolioRules: data.split_folio_rules || [],
        loyaltyPointsPerDollar: Number(data.loyalty_points_per_dollar) || 1,
        loyaltyRedemptionRate: Number(data.loyalty_redemption_rate) || 0.01,
        cancellationGraceHours: Number(data.cancellation_grace_hours) || 24,
        cancellationPenaltyPercent: Number(data.cancellation_penalty_percent) || 0,
        creditLimitDefault: Number(data.credit_limit_default) || 0,
        vipSpendThreshold: Number(data.vip_spend_threshold) || 0,
        autoNightAuditTime: data.auto_night_audit_time || '',
        operatingHours: data.operating_hours || {},
        revenueMappings: data.revenue_mappings || {},
        roomTypes: data.room_types || [],
        roomFeatures: data.room_features || [],
        guestStatuses: data.guest_statuses || [],
        inventoryCategories: data.inventory_categories || [],
        inventoryLocations: data.inventory_locations || [],
        inventoryUnits: data.inventory_units || [],
        floors: data.floors || [],
        departments: data.departments || [],
        sessionTimeout: Number(data.session_timeout) || 30,
        passwordComplexity: data.password_complexity || 'medium',
        forceMfa: data.force_mfa ?? false,
        strictPasswordRotation: data.strict_password_rotation ?? false,
        biometricReauth: data.biometric_reauth ?? false,
        maintenanceMode: data.maintenance_mode ?? false,
        maintenanceMessage: data.maintenance_message || '',
        publicBookingEnabled: data.public_booking_enabled ?? true,
        moduleToggles: data.module_toggles || {},
        allowedIps: data.allowed_ips || [],
        backupFrequency: data.backup_frequency || 'daily',
        systemLogLevel: data.system_log_level || 'info',
        apiIntegrations: data.api_integrations || [],
        termsAdventureLiability: data.terms_adventure_liability || '',
        termsWaitlistProtocol: data.terms_waitlist_protocol || '',
        termsConservationDevotion: data.terms_conservation_devotion || '',
        termsBillingCancellation: data.terms_billing_cancellation || '',
        termsWildernessEmergency: data.terms_wilderness_emergency || '',
        bookingTerms: data.booking_terms || '',
        policySections: data.policy_sections || [],
      };
    } catch (e: any) {
      console.error('Error fetching global settings:', e);
      return null;
    }
  },

  async updateGlobalSettings(settings: Partial<GlobalHotelSettings>): Promise<boolean> {
    const response = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Error updating global settings:', data.error || response.status);
      return false;
    }
    return true;
  },

  // Gift Shop Sales API
  fetchGiftShopSales: async (fromDate?: string, toDate?: string): Promise<any[]> => {
    if (!hasSupabaseConfig) return [];
    try {
      let query = supabase.from('gift_shop_sales').select('*').order('sale_date', { ascending: false });
      if (fromDate) query = query.gte('sale_date', fromDate);
      if (toDate) query = query.lte('sale_date', toDate);
      const { data, error } = await query;
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_sales', error); return []; }
        throw new Error(`Fetch gift_shop_sales failed: ${error.message}`);
      }
      return data || [];
    } catch (e: any) {
      if (isTableMissingError(e)) { logMissingTableWarning('gift_shop_sales', e); return []; }
      throw e;
    }
  },

  insertGiftShopSale: async (sale: any): Promise<string | null> => {
    try {
      const response = await fetch('/api/gift-shop/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Insert gift_shop_sale failed: ${response.status}`);
      }
      const data = await response.json();
      return data?.id || null;
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') return null;
      throw e;
    }
  },

  updateGiftShopSaleStatus: async (id: string, status: 'Completed' | 'Voided'): Promise<void> => {
    const response = await fetch(`/api/gift-shop/sales/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Update gift_shop_sale status failed: ${response.status}`);
    }
  },

  // Gift Shop Issues API
  fetchGiftShopIssues: async (): Promise<any[]> => {
    if (!hasSupabaseConfig) return [];
    try {
      const { data, error } = await supabase.from('gift_shop_issues').select('*').order('created_at', { ascending: false });
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_issues', error); return []; }
        throw new Error(`Fetch gift_shop_issues failed: ${error.message}`);
      }
      return data || [];
    } catch (e: any) {
      if (isTableMissingError(e)) { logMissingTableWarning('gift_shop_issues', e); return []; }
      throw e;
    }
  },

  insertGiftShopIssue: async (issue: any): Promise<string | null> => {
    try {
      const response = await fetch('/api/gift-shop/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(issue),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Insert gift_shop_issue failed: ${response.status}`);
      }
      const data = await response.json();
      return data?.id || null;
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') return null;
      throw e;
    }
  },

  deleteGiftShopIssue: async (id: string): Promise<void> => {
    const response = await fetch(`/api/gift-shop/issues/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete gift_shop_issue failed: ${response.status}`);
    }
  },

  // System Users API
  fetchSystemUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (!response.ok) return [];
      const data = await response.json();
      const users = Array.isArray(data) ? data : (data.users ?? []);
      return users.map(mapSystemUserFromDb);
    } catch (e: any) {
      return [];
    }
  },

  insertSystemUser: async (user: User): Promise<void> => {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Insert system_user failed: ${response.status}`);
    }
  },

  updateSystemUser: async (id: string, updates: Partial<User>): Promise<void> => {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Update system_user failed: ${response.status}`);
    }
  },

  deleteSystemUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete system_user failed: ${response.status}`);
    }
  },

  // Custom Roles API
  fetchCustomRoles: async (): Promise<CustomRole[]> => {
    try {
      const response = await fetch('/api/admin/roles', { credentials: 'include' });
      if (!response.ok) return [];
      const data = await response.json();
      if (!Array.isArray(data)) return [];
      return data.map(mapCustomRoleFromDb);
    } catch (e: any) {
      return [];
    }
  },

  upsertCustomRole: async (role: CustomRole): Promise<void> => {
    const response = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upsert custom_role failed: ${response.status}`);
    }
  },

  deleteCustomRole: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/roles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Delete custom_role failed: ${response.status}`);
    }
  },

  // Audit Events API
  fetchAuditEvents: async (): Promise<SystemAuditLog[]> => {
    try {
      const response = await fetch('/api/audit/events?limit=500', { credentials: 'include' });
      if (!response.ok) return [];
      const data = await response.json();
      if (!Array.isArray(data)) return [];
      return data.map((db: any) => ({
        id: db.id,
        timestamp: db.timestamp,
        userId: db.user_id || '',
        userName: db.user_name || 'Unknown',
        device: db.user_agent || '',
        ipAddress: db.ip_address || '',
        module: db.module || '',
        recordId: db.entity_id || undefined,
        action: db.action,
        details: typeof db.details === 'string' ? db.details : (db.details?.details || JSON.stringify(db.details))
      }));
    } catch (e: any) {
      return [];
    }
  },

  insertAuditEvent: async (log: SystemAuditLog): Promise<void> => {
    const response = await fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(log),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Insert audit_event failed: ${response.status}`);
    }
  },

  // Gift Shop Invoice Sequence
  nextGiftShopInvoice: async (): Promise<string> => {
    if (!hasSupabaseConfig) return `INV-GS-${Date.now()}`;
    try {
      const { data, error } = await supabase.rpc('next_gift_shop_invoice');
      if (error || !data) {
        console.warn('next_gift_shop_invoice RPC failed, using fallback:', error?.message);
        return `INV-GS-${Date.now()}`;
      }
      return data as string;
    } catch (e: any) {
      console.warn('next_gift_shop_invoice RPC error, using fallback:', e.message);
      return `INV-GS-${Date.now()}`;
    }
  }
};
