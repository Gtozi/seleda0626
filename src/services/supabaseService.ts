import { supabase, hasSupabaseConfig, hasUserCustomKeys } from '../lib/supabase';
import { Room, Guest, Reservation, RatePlan, Season, Package, GroupBooking, CorporateAccount, User, CustomRole, SystemAuditLog, GlobalHotelSettings } from '../types/erp';
import { InventoryItem, Store, Requisition, StockMovement, Supplier, GRN } from '../types/inventory';

// Map Room
const mapRoomFromDb = (db: any): Room => ({
  id: db.id,
  number: db.number,
  type: db.type,
  floor: db.floor,
  status: db.status,
  rate: Number(db.rate),
  features: db.features || []
});

const mapRoomToDb = (room: Room) => ({
  id: room.id,
  number: room.number,
  type: room.type,
  floor: room.floor,
  status: room.status,
  rate: room.rate,
  features: room.features
});

// Map Guest
const mapGuestFromDb = (db: any): Guest => ({
  id: db.id,
  name: db.name,
  email: db.email,
  phone: db.phone || '',
  status: db.status || 'Regular',
  loyaltyPoints: db.loyalty_points || 0,
  specialRequests: db.special_requests || '',
  notes: db.notes || '',
  totalSpend: Number(db.total_spend || 0),
  nationality: db.nationality || undefined,
  tin: db.tin || undefined,
  vatNo: db.vat_no || undefined,
  vatDate: db.vat_date || undefined,
  preferences: db.preferences || {},
  identificationDoc: db.identification_doc || {},
  history: [], // Calculated or nested from stays relation
  parentGroupId: db.parent_group_id || undefined,
  parentCorporateId: db.parent_corporate_id || undefined,
  isPrimaryContact: db.is_primary_contact || false,
  billingRoutingProfileId: db.billing_routing_profile_id || undefined
});

const mapGuestToDb = (guest: Guest) => ({
  id: guest.id,
  name: guest.name,
  email: guest.email,
  phone: guest.phone,
  status: guest.status,
  loyalty_points: guest.loyaltyPoints,
  special_requests: guest.specialRequests,
  notes: guest.notes,
  total_spend: guest.totalSpend,
  nationality: guest.nationality,
  tin: guest.tin,
  vat_no: guest.vatNo,
  vat_date: guest.vatDate,
  preferences: guest.preferences || {},
  identification_doc: guest.identificationDoc || {},
  parent_group_id: guest.parentGroupId || null,
  parent_corporate_id: guest.parentCorporateId || null,
  is_primary_contact: guest.isPrimaryContact || false,
  billing_routing_profile_id: guest.billingRoutingProfileId || null
});

// Map Reservation
const mapReservationFromDb = (db: any): Reservation => ({
  id: db.id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone || '',
  guestStatus: db.guest_status || 'Regular',
  roomType: db.room_type,
  roomNumber: db.room_number || undefined,
  roomNights: db.room_nights || undefined,
  checkInDate: db.check_in_date,
  checkOutDate: db.check_out_date,
  adults: db.adults || 1,
  children: db.children || 0,
  status: db.status,
  rate: Number(db.rate),
  totalAmount: Number(db.total_amount),
  channel: db.channel,
  paymentStatus: db.payment_status || 'Unpaid',
  notes: db.notes || '',
  charges: db.charges || [],
  payments: db.payments || [],
  earlyCheckOutRequested: db.early_check_out_requested || false,
  lateCheckOutRequested: db.late_check_out_requested || false,
  groupBookingId: db.group_booking_id || undefined,
  isGroup: db.is_group || false,
  depositAmount: Number(db.deposit_amount || 0),
  isDepositPaid: db.is_deposit_paid || false,
  ratePlanId: db.rate_plan_id || undefined,
  packageIds: db.package_ids || [],
  guestServiceIds: db.guest_service_ids || [],
  additionalGuestIds: db.additional_guest_ids || [],
  discountPercent: Number(db.discount_percent || 0),
  taxPercent: Number(db.tax_percent || 0),
  serviceChargePercent: Number(db.service_charge_percent || 0),
  customHotelName: db.custom_hotel_name || undefined,
  customHotelAddress: db.custom_hotel_address || undefined,
  hotelTin: db.hotel_tin || undefined,
  hotelVatNo: db.hotel_vat_no || undefined,
  hotelVatDate: db.hotel_vat_date || undefined,
  guestTin: db.guest_tin || undefined,
  guestVatNo: db.guest_vat_no || undefined,
  guestVatDate: db.guest_vat_date || undefined,
  routingProfileId: db.routing_profile_id || undefined,
  corporateAccountId: db.corporate_account_id || undefined,
  bookingGroupId: db.booking_group_id || undefined,
  groupId: db.group_id || undefined,
  guestId: db.guest_id || undefined,
  operator_id: db.tour_operator_id || undefined
});

const mapReservationToDb = (res: Reservation) => ({
  id: res.id,
  guest_name: res.guestName,
  guest_email: res.guestEmail,
  guest_phone: res.guestPhone,
  guest_status: res.guestStatus,
  room_type: res.roomType,
  room_number: res.roomNumber || null,
  room_nights: res.roomNights || null,
  check_in_date: res.checkInDate,
  check_out_date: res.checkOutDate,
  adults: res.adults,
  children: res.children,
  status: res.status,
  rate: res.rate,
  total_amount: res.totalAmount,
  channel: res.channel,
  payment_status: res.paymentStatus,
  notes: res.notes || '',
  charges: res.charges || [],
  payments: res.payments || [],
  early_check_out_requested: res.earlyCheckOutRequested,
  late_check_out_requested: res.lateCheckOutRequested,
  group_booking_id: res.groupBookingId || null,
  is_group: res.isGroup,
  deposit_amount: res.depositAmount || 0,
  is_deposit_paid: res.isDepositPaid,
  rate_plan_id: res.ratePlanId || null,
  package_ids: res.packageIds || [],
  guest_service_ids: res.guestServiceIds || [],
  additional_guest_ids: res.additionalGuestIds || [],
  discount_percent: res.discountPercent || 0,
  tax_percent: res.taxPercent || 0,
  service_charge_percent: res.serviceChargePercent || 0,
  custom_hotel_name: res.customHotelName || null,
  custom_hotel_address: res.customHotelAddress || null,
  hotel_tin: res.hotelTin || null,
  hotel_vat_no: res.hotelVatNo || null,
  hotel_vat_date: res.hotelVatDate || null,
  guest_tin: res.guestTin || null,
  guest_vat_no: res.guestVatNo || null,
  guest_vat_date: res.guestVatDate || null,
  routing_profile_id: res.routingProfileId || null,
  corporate_account_id: res.corporateAccountId || null,
  booking_group_id: res.bookingGroupId || null,
  group_id: res.groupId || null,
  guest_id: res.guestId || null,
  tour_operator_id: res.operator_id || null
});

const mapRatePlanFromDb = (db: any): RatePlan => ({
  id: db.id,
  name: db.name,
  description: db.description || '',
  baseModifier: Number(db.base_modifier || 1),
  active: Boolean(db.active)
});

const mapRatePlanToDb = (plan: RatePlan) => ({
  id: plan.id,
  name: plan.name,
  description: plan.description,
  base_modifier: plan.baseModifier,
  active: plan.active
});

const mapSeasonFromDb = (db: any): Season => ({
  id: db.id,
  name: db.name,
  startMonth: Number(db.start_month),
  startDay: Number(db.start_day),
  endMonth: Number(db.end_month),
  endDay: Number(db.end_day),
  multiplier: Number(db.multiplier)
});

const mapSeasonToDb = (season: Season) => ({
  id: season.id,
  name: season.name,
  start_month: season.startMonth,
  start_day: season.startDay,
  end_month: season.endMonth,
  end_day: season.endDay,
  multiplier: season.multiplier
});

const mapPackageFromDb = (db: any): Package => ({
  id: db.id,
  name: db.name,
  description: db.description || '',
  price: Number(db.price),
  chargeFrequency: db.charge_frequency || 'once'
});

const mapPackageToDb = (pkg: Package) => ({
  id: pkg.id,
  name: pkg.name,
  description: pkg.description,
  price: pkg.price,
  charge_frequency: pkg.chargeFrequency
});

const mapGroupBookingFromDb = (db: any): GroupBooking => ({
  id: db.id,
  groupName: db.group_name,
  contactName: db.contact_name,
  contactEmail: db.contact_email,
  contactPhone: db.contact_phone || '',
  roomTypeNeeded: db.room_type_needed,
  roomCount: Number(db.room_count),
  checkInDate: db.check_in_date,
  checkOutDate: db.check_out_date,
  discountPercent: Number(db.discount_percent || 0),
  status: db.status || 'Pending'
});

const mapGroupBookingToDb = (group: GroupBooking) => ({
  id: group.id,
  group_name: group.groupName,
  contact_name: group.contactName,
  contact_email: group.contactEmail,
  contact_phone: group.contactPhone,
  room_type_needed: group.roomTypeNeeded,
  room_count: group.roomCount,
  check_in_date: group.checkInDate,
  check_out_date: group.checkOutDate,
  discount_percent: group.discountPercent,
  status: group.status
});

const mapCorporateAccountFromDb = (db: any): CorporateAccount => ({
  id: db.id,
  companyName: db.company_name,
  contactPerson: db.contact_person,
  contactEmail: db.contact_email,
  contactPhone: db.contact_phone || '',
  discountPercent: Number(db.discount_percent || 0),
  activeBookings: Number(db.active_bookings || 0),
  unpaidBalance: Number(db.unpaid_balance || 0)
});

const mapCorporateAccountToDb = (account: CorporateAccount) => ({
  id: account.id,
  company_name: account.companyName,
  contact_person: account.contactPerson,
  contact_email: account.contactEmail,
  contact_phone: account.contactPhone,
  discount_percent: account.discountPercent,
  active_bookings: account.activeBookings,
  unpaid_balance: account.unpaidBalance
});

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
  roleDescription: db.role_description || db.role,
  avatarInitials: db.avatar_initials || db.name?.slice(0, 2).toUpperCase() || 'U',
  status: db.status || 'Active',
  lastLogin: db.last_login || undefined,
  employeeId: db.employee_id || undefined,
  username: db.username || undefined,
  mobileNumber: db.mobile_number || undefined,
  department: db.department || undefined,
  customRoleId: db.custom_role_id || undefined,
  securitySettings: db.security_settings || undefined,
  dataRestrictions: db.data_restrictions || undefined,
  allowedTabs: db.allowed_tabs || undefined,
  allowedSettings: db.allowed_settings || undefined,
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

const mapAuditEventFromDb = (db: any): SystemAuditLog => ({
  id: db.id,
  timestamp: db.timestamp,
  userId: db.user_id || '',
  userName: db.user_name || 'Unknown',
  device: db.user_agent || '',
  ipAddress: db.ip_address || '',
  module: db.module || '',
  recordId: db.entity_id || undefined,
  action: db.action,
  details: typeof db.details === 'string' ? db.details : (db.details?.text || JSON.stringify(db.details))
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

const upsertTable = async <T>(tableName: string, value: T, mapper: (item: T) => any): Promise<void> => {
  try {
    const { error } = await supabase.from(tableName).upsert(mapper(value), { onConflict: 'id' });
    if (error) {
      if (isTableMissingError(error)) {
        logMissingTableWarning(tableName, error);
        return;
      }
      throw new Error(`Upsert ${tableName} failed: ${error.message}`);
    }
  } catch (e) {
    if (!isTableMissingError(e)) throw e;
  }
};

const deleteFromTable = async (tableName: string, id: string): Promise<void> => {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      if (isTableMissingError(error)) {
        logMissingTableWarning(tableName, error);
        return;
      }
      throw new Error(`Delete from ${tableName} failed: ${error.message}`);
    }
  } catch (e) {
    if (!isTableMissingError(e)) throw e;
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
      const { data, error } = await supabase.from('rooms').select('count', { count: 'exact', head: true });
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
  fetchRooms: async (): Promise<Room[]> => {
    try {
      const { data, error } = await supabase.from('rooms').select('*').order('number');
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
    try {
      const payload = rooms.map(mapRoomToDb);
      const { error } = await supabase.from('rooms').upsert(payload, { onConflict: 'id' });
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('rooms', error);
          return;
        }
        throw new Error(`Upsert rooms failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
    }
  },

  updateRoomStatus: async (roomNumber: string, status: Room['status']): Promise<void> => {
    try {
      const { error } = await supabase.from('rooms').update({ status }).eq('number', roomNumber);
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('rooms', error);
          return;
        }
        throw new Error(`Update room status failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
    }
  },

  deleteRoom: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('rooms', error);
          return;
        }
        throw new Error(`Delete room failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
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
    try {
      const payload = mapGuestToDb(guest);
      const { error } = await supabase.from('guests').upsert(payload, { onConflict: 'id' });
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guests', error);
          return;
        }
        throw new Error(`Upsert guest failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
    }
  },

  // Reservations Api
  fetchReservations: async (): Promise<Reservation[]> => {
    try {
      const { data, error } = await supabase.from('reservations').select('*').order('check_in_date', { ascending: false });
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
    try {
      const payload = mapReservationToDb(res);
      const { error } = await supabase.from('reservations').upsert(payload, { onConflict: 'id' });
      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('reservations', error);
          return;
        }
        // Log network/configuration errors but don't throw to avoid breaking the app
        console.warn(`Supabase upsert reservation warning: ${error.message}`);
        return;
      }
    } catch (e) {
      // Handle network errors (Failed to fetch) gracefully
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        console.warn('Supabase network error - reservation not synced to database (continuing with local state)');
        return;
      }
      if (!isTableMissingError(e)) {
        console.warn(`Supabase upsert reservation error: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
    }
  },

  fetchRatePlans: async (): Promise<RatePlan[]> => fetchTable('rate_plans', mapRatePlanFromDb, 'name'),
  upsertRatePlan: async (plan: RatePlan): Promise<void> => upsertTable('rate_plans', plan, mapRatePlanToDb),
  deleteRatePlan: async (id: string): Promise<void> => deleteFromTable('rate_plans', id),

  fetchSeasons: async (): Promise<Season[]> => fetchTable('seasons', mapSeasonFromDb, 'name'),
  upsertSeason: async (season: Season): Promise<void> => upsertTable('seasons', season, mapSeasonToDb),
  deleteSeason: async (id: string): Promise<void> => deleteFromTable('seasons', id),

  fetchPackages: async (): Promise<Package[]> => fetchTable('packages', mapPackageFromDb, 'name'),
  upsertPackage: async (pkg: Package): Promise<void> => upsertTable('packages', pkg, mapPackageToDb),
  deletePackage: async (id: string): Promise<void> => deleteFromTable('packages', id),

  fetchGroupBookings: async (): Promise<GroupBooking[]> => {
    return fetchTable('group_bookings', mapGroupBookingFromDb, 'id');
  },
  upsertGroupBooking: async (group: GroupBooking): Promise<void> => {
    // Legacy table - migrated to group_profiles, no-op
  },

  fetchCorporateAccounts: async (): Promise<CorporateAccount[]> => {
    // Legacy table - migrated to group_profiles, return empty array
    return [];
  },
  upsertCorporateAccount: async (account: CorporateAccount): Promise<void> => {
    // Legacy table - migrated to group_profiles, no-op
  },

  fetchInventoryStores: async (): Promise<Store[]> => fetchTable('inventory_stores', mapStoreFromDb, 'name'),
  upsertInventoryStore: async (store: Store): Promise<void> => upsertTable('inventory_stores', store, mapStoreToDb),

  fetchInventoryItems: async (): Promise<InventoryItem[]> => fetchTable('inventory_items', mapInventoryItemFromDb, 'name'),
  upsertInventoryItem: async (item: InventoryItem): Promise<void> => upsertTable('inventory_items', item, mapInventoryItemToDb),
  deleteInventoryItem: async (id: string): Promise<void> => deleteFromTable('inventory_items', id),

  fetchInventorySuppliers: async (): Promise<Supplier[]> => fetchTable('inventory_suppliers', mapSupplierFromDb, 'name'),
  upsertInventorySupplier: async (supplier: Supplier): Promise<void> => upsertTable('inventory_suppliers', supplier, mapSupplierToDb),
  deleteInventorySupplier: async (id: string): Promise<void> => deleteFromTable('inventory_suppliers', id),

  fetchInventoryRequisitions: async (): Promise<Requisition[]> => fetchTable('inventory_requisitions', mapRequisitionFromDb, 'request_date'),
  upsertInventoryRequisition: async (req: Requisition): Promise<void> => upsertTable('inventory_requisitions', req, mapRequisitionToDb),
  deleteInventoryRequisition: async (id: string): Promise<void> => deleteFromTable('inventory_requisitions', id),

  fetchStockMovements: async (): Promise<StockMovement[]> => fetchTable('inventory_stock_movements', mapStockMovementFromDb, 'movement_date'),
  upsertStockMovement: async (movement: StockMovement): Promise<void> => upsertTable('inventory_stock_movements', movement, mapStockMovementToDb),

  fetchInventoryGRNs: async (): Promise<GRN[]> => fetchTable('inventory_grns', mapGRNFromDb, 'received_date'),
  upsertInventoryGRN: async (grn: GRN): Promise<void> => upsertTable('inventory_grns', grn, mapGRNToDb),
  deleteInventoryGRN: async (id: string): Promise<void> => deleteFromTable('inventory_grns', id),
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
        const { error } = await supabase.from('rooms').upsert(localRooms.map(mapRoomToDb), { onConflict: 'id' });
        if (error) errors.push(`Rooms push failed: ${error.message}`);
        else roomsCount = localRooms.length;
      }

      if (localRatePlans.length > 0) {
        const { error } = await supabase.from('rate_plans').upsert(
          localRatePlans.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            base_modifier: r.baseModifier,
            active: r.active
          })),
          { onConflict: 'id' }
        );
        if (error) errors.push(`Rate plans push failed: ${error.message}`);
      }

      if (localSeasons.length > 0) {
        const { error } = await supabase.from('seasons').upsert(
          localSeasons.map(s => ({
            id: s.id,
            name: s.name,
            start_month: s.startMonth,
            start_day: s.startDay,
            end_month: s.endMonth,
            end_day: s.endDay,
            multiplier: s.multiplier
          })),
          { onConflict: 'id' }
        );
        if (error) errors.push(`Seasons push failed: ${error.message}`);
      }

      if (localPackages.length > 0) {
        const { error } = await supabase.from('packages').upsert(
          localPackages.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            charge_frequency: p.chargeFrequency
          })),
          { onConflict: 'id' }
        );
        if (error) errors.push(`Packages push failed: ${error.message}`);
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
    if (!hasSupabaseConfig) return null;
    try {
      const { data, error } = await supabase.from('global_settings').select('*').eq('id', 'main').maybeSingle();
      if (error) { logMissingTableWarning('global_settings', error); return null; }
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
      let query = supabase.from('gift_shop_sales').select('*').order('date', { ascending: false });
      if (fromDate) query = query.gte('date', fromDate);
      if (toDate) query = query.lte('date', toDate);
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
    if (!hasSupabaseConfig) return null;
    try {
      const { data, error } = await supabase.from('gift_shop_sales').insert(sale).select('id').single();
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_sales', error); return null; }
        throw new Error(`Insert gift_shop_sales failed: ${error.message}`);
      }
      return data?.id || null;
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
      return null;
    }
  },

  updateGiftShopSaleStatus: async (id: string, status: 'Completed' | 'Voided'): Promise<void> => {
    if (!hasSupabaseConfig) return;
    try {
      const { error } = await supabase.from('gift_shop_sales').update({ status }).eq('id', id);
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_sales', error); return; }
        throw new Error(`Update gift_shop_sales status failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
    }
  },

  // Gift Shop Issues API
  fetchGiftShopIssues: async (): Promise<any[]> => {
    if (!hasSupabaseConfig) return [];
    try {
      const { data, error } = await supabase.from('gift_shop_issues').select('*').order('date', { ascending: false });
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
    if (!hasSupabaseConfig) return null;
    try {
      const { data, error } = await supabase.from('gift_shop_issues').insert(issue).select('id').single();
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_issues', error); return null; }
        throw new Error(`Insert gift_shop_issues failed: ${error.message}`);
      }
      return data?.id || null;
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
      return null;
    }
  },

  deleteGiftShopIssue: async (id: string): Promise<void> => {
    if (!hasSupabaseConfig) return;
    try {
      const { error } = await supabase.from('gift_shop_issues').delete().eq('id', id);
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('gift_shop_issues', error); return; }
        throw new Error(`Delete gift_shop_issues failed: ${error.message}`);
      }
    } catch (e) {
      if (!isTableMissingError(e)) throw e;
    }
  },

  // System Users API
  fetchSystemUsers: async (): Promise<User[]> => {
    if (!hasSupabaseConfig) return [];
    try {
      const { data, error } = await supabase.from('system_users').select('*').order('name');
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('system_users', error); return []; }
        throw new Error(`Fetch system_users failed: ${error.message}`);
      }
      return (data || []).map(mapSystemUserFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) { logMissingTableWarning('system_users', e); return []; }
      throw e;
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
    if (!hasSupabaseConfig) return [];
    try {
      const { data, error } = await supabase.from('custom_roles').select('*').order('name');
      if (error) {
        if (isTableMissingError(error)) { logMissingTableWarning('custom_roles', error); return []; }
        throw new Error(`Fetch custom_roles failed: ${error.message}`);
      }
      return (data || []).map(mapCustomRoleFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) { logMissingTableWarning('custom_roles', e); return []; }
      throw e;
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
