/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canonical data mapper between Supabase snake_case rows and frontend camelCase entities.
 * Keep this file as the single source of truth for entity shape translation so the
 * frontend and backend can evolve independently.
 */

export interface MappedRoom {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: string;
  rate: number;
  features: string[];
  roomTypeId?: string;
}

export interface MappedGuest {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  status: string;
  loyaltyPoints: number;
  specialRequests: string;
  notes: string;
  history: unknown[];
  totalSpend: number;
  nationality?: string;
  tin?: string;
  vatNo?: string;
  vatDate?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  preferences?: Record<string, unknown>;
  identificationDoc?: Record<string, unknown>;
  parentGroupId?: string;
  parentCorporateId?: string;
  isPrimaryContact?: boolean;
  billingRoutingProfileId?: string;
}

export interface MappedReservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestStatus: string;
  roomType: string;
  roomNumber?: string;
  roomNights?: string[][];
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: string;
  rate: number;
  totalAmount: number;
  channel: string;
  paymentStatus: string;
  notes?: string;
  earlyCheckOutRequested: boolean;
  lateCheckOutRequested: boolean;
  groupBookingId?: string;
  groupId?: string;
  isGroup: boolean;
  depositAmount?: number;
  isDepositPaid: boolean;
  ratePlanId?: string;
  packageIds?: string[];
  guestServiceIds?: string[];
  additionalGuestIds?: string[];
  operatorId?: string;
  allotmentId?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  discountPercent?: number;
  taxPercent?: number;
  serviceChargePercent?: number;
  customHotelName?: string;
  customHotelAddress?: string;
  hotelTin?: string;
  hotelVatNo?: string;
  hotelVatDate?: string;
  guestTin?: string;
  guestVatNo?: string;
  guestVatDate?: string;
  guestNationality?: string;
  guestId?: string;
  routingProfileId?: string;
  corporateAccountId?: string;
  bookingGroupId?: string;
  bookingType?: string;
  roomTypeId?: string;
  folioRoutingOverrides?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MappedFolio {
  id: string;
  reservationId: string;
  folioType: string;
  targetFolio?: string;
  status: string;
  balance: number;
  totalCharges: number;
  totalPayments: number;
  taxTotal: number;
  serviceChargeTotal: number;
  currency: string;
  openedAt: string;
  closedAt?: string;
  createdBy?: string;
  updatedAt?: string;
  notes?: string;
  ownerType?: string;
  ownerId?: string;
  operatorId?: string;
  groupId?: string;
  creditLimit?: number;
  createdAt?: string;
}

export interface MappedFolioLine {
  id: string;
  folioId: string;
  lineNumber: number;
  transactionDate: string;
  postingDate: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice?: number;
  lineType: string;
  targetFolio?: string;
  revenueAccountCode?: string;
  taxCode?: string;
  taxAmount: number;
  isVoided: boolean;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
  sourceModule: string;
  sourceReference?: string;
  postedToGl: boolean;
  glBatchId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  reservationId?: string;
  usaliCode?: string;
  usaliRevenueCode?: string;
  usaliCostCode?: string;
  department?: string;
}

export interface MappedFolioPayment {
  id: string;
  folioId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  paymentSubType?: string;
  referenceNumber?: string;
  cardLastFour?: string;
  cardExpiry?: string;
  authorizationCode?: string;
  isVoided: boolean;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
  isRefund: boolean;
  postedToGl: boolean;
  glBatchId?: string;
  cashierId?: string;
  shiftId?: string;
  createdBy?: string;
  createdAt?: string;
  reservationId?: string;
  notes?: string;
  receiptUrl?: string;
  bankAccountId?: string;
  userId?: string;
  targetFolio?: string;
  invoiceId?: string;
}


// ----------------------------------------------------------------
// Generic helpers
// ----------------------------------------------------------------

function toDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value.split('T')[0];
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value);
}

function toDateTimeString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return undefined;
  return value === 1 || value === 'true' || value === 't' || value === 'yes';
}

// ----------------------------------------------------------------
// Room
// ----------------------------------------------------------------

export function mapRoomFromDb(row: Record<string, unknown>): MappedRoom {
  // Prefer type_name from joined room_types (rooms_with_type_name view), fallback to type column
  const typeName = String(row.type_name ?? row.type ?? row.room_type ?? '');
  return {
    id: String(row.id ?? ''),
    number: String(row.number ?? ''),
    type: typeName,
    floor: toNumber(row.floor) ?? 0,
    status: String(row.status ?? 'Vacant Clean') as MappedRoom['status'],
    rate: toNumber(row.rate) ?? 0,
    features: Array.isArray(row.features) ? row.features as string[] : [],
    roomTypeId: row.room_type_id ? String(row.room_type_id) : undefined,
  };
}

export function mapRoomToDb(room: Partial<MappedRoom>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (room.id !== undefined) row.id = room.id;
  if (room.number !== undefined) row.number = room.number;
  if (room.type !== undefined) row.type = room.type;
  if (room.floor !== undefined) row.floor = room.floor;
  if (room.status !== undefined) row.status = room.status;
  if (room.rate !== undefined) row.rate = room.rate;
  if (room.features !== undefined) row.features = room.features;
  if (room.roomTypeId !== undefined) row.room_type_id = room.roomTypeId;
  return row;
}

// ----------------------------------------------------------------
// Guest
// ----------------------------------------------------------------

export function mapGuestFromDb(row: Record<string, unknown>): MappedGuest {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    lastName: row.last_name ? String(row.last_name) : undefined,
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    status: String(row.status ?? 'Regular') as MappedGuest['status'],
    loyaltyPoints: toNumber(row.loyalty_points) ?? 0,
    specialRequests: String(row.special_requests ?? ''),
    notes: String(row.notes ?? ''),
    history: Array.isArray(row.history) ? row.history as MappedGuest['history'] : [],
    totalSpend: toNumber(row.total_spend) ?? 0,
    nationality: row.nationality ? String(row.nationality) : undefined,
    tin: row.tin ? String(row.tin) : undefined,
    vatNo: row.vat_no ? String(row.vat_no) : undefined,
    vatDate: row.vat_date ? String(row.vat_date) : undefined,
    passportNumber: row.passport_number ? String(row.passport_number) : undefined,
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : undefined,
    preferences: typeof row.preferences === 'object' && row.preferences !== null
      ? row.preferences as MappedGuest['preferences']
      : undefined,
    identificationDoc: typeof row.identification_doc === 'object' && row.identification_doc !== null
      ? row.identification_doc as MappedGuest['identificationDoc']
      : undefined,
    parentGroupId: row.parent_group_id ? String(row.parent_group_id) : undefined,
    parentCorporateId: row.parent_corporate_id ? String(row.parent_corporate_id) : undefined,
    isPrimaryContact: row.is_primary_contact !== undefined ? Boolean(row.is_primary_contact) : undefined,
    billingRoutingProfileId: row.billing_routing_profile_id ? String(row.billing_routing_profile_id) : undefined,
  };
}

export function mapGuestToDb(guest: Partial<MappedGuest>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (guest.id !== undefined) row.id = guest.id;
  if (guest.name !== undefined) row.name = guest.name;
  if (guest.lastName !== undefined) row.last_name = guest.lastName;
  if (guest.email !== undefined) row.email = guest.email;
  if (guest.phone !== undefined) row.phone = guest.phone;
  if (guest.status !== undefined) row.status = guest.status;
  if (guest.loyaltyPoints !== undefined) row.loyalty_points = guest.loyaltyPoints;
  if (guest.specialRequests !== undefined) row.special_requests = guest.specialRequests;
  if (guest.notes !== undefined) row.notes = guest.notes;
  if (guest.history !== undefined) row.history = guest.history;
  if (guest.totalSpend !== undefined) row.total_spend = guest.totalSpend;
  if (guest.nationality !== undefined) row.nationality = guest.nationality;
  if (guest.tin !== undefined) row.tin = guest.tin;
  if (guest.vatNo !== undefined) row.vat_no = guest.vatNo;
  if (guest.vatDate !== undefined) row.vat_date = guest.vatDate;
  if (guest.passportNumber !== undefined) row.passport_number = guest.passportNumber;
  if (guest.dateOfBirth !== undefined) row.date_of_birth = guest.dateOfBirth;
  if (guest.preferences !== undefined) row.preferences = guest.preferences;
  if (guest.identificationDoc !== undefined) row.identification_doc = guest.identificationDoc;
  if (guest.parentGroupId !== undefined) row.parent_group_id = guest.parentGroupId;
  if (guest.parentCorporateId !== undefined) row.parent_corporate_id = guest.parentCorporateId;
  if (guest.isPrimaryContact !== undefined) row.is_primary_contact = guest.isPrimaryContact;
  if (guest.billingRoutingProfileId !== undefined) row.billing_routing_profile_id = guest.billingRoutingProfileId;
  return row;
}

// ----------------------------------------------------------------
// Reservation
// ----------------------------------------------------------------

export function mapReservationFromDb(row: Record<string, unknown>): MappedReservation {
  return {
    id: String(row.id ?? ''),
    guestName: String(row.guest_name ?? ''),
    guestEmail: String(row.guest_email ?? ''),
    guestPhone: String(row.guest_phone ?? ''),
    guestStatus: String(row.guest_status ?? 'Regular') as MappedReservation['guestStatus'],
    roomType: String(row.room_type ?? ''),
    roomNumber: row.room_number ? String(row.room_number) : undefined,
    roomNights: Array.isArray(row.room_nights) ? row.room_nights as string[][] : undefined,
    checkInDate: String(row.check_in_date ?? ''),
    checkOutDate: String(row.check_out_date ?? ''),
    adults: toNumber(row.adults) ?? 1,
    children: toNumber(row.children) ?? 0,
    status: String(row.status ?? 'Waitlisted') as MappedReservation['status'],
    rate: toNumber(row.rate) ?? 0,
    totalAmount: toNumber(row.total_amount) ?? 0,
    channel: String(row.channel ?? 'Direct Website') as MappedReservation['channel'],
    paymentStatus: String(row.payment_status ?? 'Unpaid') as MappedReservation['paymentStatus'],
    notes: row.notes ? String(row.notes) : undefined,
    charges: Array.isArray(row.charges) ? row.charges as MappedFolioLine[] : undefined,
    payments: Array.isArray(row.payments) ? row.payments as MappedFolioPayment[] : undefined,
    earlyCheckOutRequested: toBoolean(row.early_check_out_requested) ?? false,
    lateCheckOutRequested: toBoolean(row.late_check_out_requested) ?? false,
    groupBookingId: row.group_booking_id ? String(row.group_booking_id) : undefined,
    groupId: row.group_id ? String(row.group_id) : undefined,
    isGroup: toBoolean(row.is_group) ?? false,
    depositAmount: toNumber(row.deposit_amount),
    isDepositPaid: toBoolean(row.is_deposit_paid) ?? false,
    ratePlanId: row.rate_plan_id ? String(row.rate_plan_id) : undefined,
    packageIds: Array.isArray(row.package_ids) ? row.package_ids as string[] : undefined,
    guestServiceIds: Array.isArray(row.guest_service_ids) ? row.guest_service_ids as string[] : undefined,
    additionalGuestIds: Array.isArray(row.additional_guest_ids) ? row.additional_guest_ids as string[] : undefined,
    operator_id: row.operator_id ? String(row.operator_id) : undefined,
    operatorId: row.operator_id ? String(row.operator_id) : undefined,
    allotment_id: row.allotment_id ? String(row.allotment_id) : undefined,
    voucherCode: row.voucher_code ? String(row.voucher_code) : undefined,
    voucherDiscount: toNumber(row.voucher_discount),
    discountPercent: toNumber(row.discount_percent),
    taxPercent: toNumber(row.tax_percent),
    serviceChargePercent: toNumber(row.service_charge_percent),
    customHotelName: row.custom_hotel_name ? String(row.custom_hotel_name) : undefined,
    customHotelAddress: row.custom_hotel_address ? String(row.custom_hotel_address) : undefined,
    hotelTin: row.hotel_tin ? String(row.hotel_tin) : undefined,
    hotelVatNo: row.hotel_vat_no ? String(row.hotel_vat_no) : undefined,
    hotelVatDate: row.hotel_vat_date ? String(row.hotel_vat_date) : undefined,
    guestTin: row.guest_tin ? String(row.guest_tin) : undefined,
    guestVatNo: row.guest_vat_no ? String(row.guest_vat_no) : undefined,
    guestVatDate: row.guest_vat_date ? String(row.guest_vat_date) : undefined,
    guestNationality: row.guest_nationality ? String(row.guest_nationality) : undefined,
    guestId: row.guest_id ? String(row.guest_id) : undefined,
    routingProfileId: row.routing_profile_id ? String(row.routing_profile_id) : undefined,
    corporateAccountId: row.corporate_account_id ? String(row.corporate_account_id) : undefined,
    bookingGroupId: row.booking_group_id ? String(row.booking_group_id) : undefined,
    bookingType: String(row.booking_type ?? '') as MappedReservation['bookingType'],
    roomTypeId: row.room_type_id ? String(row.room_type_id) : undefined,
    folioRoutingOverrides: typeof row.folio_routing_overrides === 'object' && row.folio_routing_overrides !== null
      ? row.folio_routing_overrides as MappedReservation['folioRoutingOverrides']
      : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  } as MappedReservation;
}

export function mapReservationToDb(reservation: Partial<MappedReservation>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (reservation.id !== undefined) row.id = reservation.id;
  if (reservation.guestName !== undefined) row.guest_name = reservation.guestName;
  if (reservation.guestEmail !== undefined) row.guest_email = reservation.guestEmail;
  if (reservation.guestPhone !== undefined) row.guest_phone = reservation.guestPhone;
  if (reservation.guestStatus !== undefined) row.guest_status = reservation.guestStatus;
  if (reservation.roomType !== undefined) row.room_type = reservation.roomType;
  if (reservation.roomNumber !== undefined) row.room_number = reservation.roomNumber;
  if (reservation.roomNights !== undefined) row.room_nights = reservation.roomNights;
  if (reservation.checkInDate !== undefined) row.check_in_date = reservation.checkInDate;
  if (reservation.checkOutDate !== undefined) row.check_out_date = reservation.checkOutDate;
  if (reservation.adults !== undefined) row.adults = reservation.adults;
  if (reservation.children !== undefined) row.children = reservation.children;
  if (reservation.status !== undefined) row.status = reservation.status;
  if (reservation.rate !== undefined) row.rate = reservation.rate;
  if (reservation.totalAmount !== undefined) row.total_amount = reservation.totalAmount;
  if (reservation.channel !== undefined) row.channel = reservation.channel;
  if (reservation.paymentStatus !== undefined) row.payment_status = reservation.paymentStatus;
  if (reservation.notes !== undefined) row.notes = reservation.notes;
  if (reservation.earlyCheckOutRequested !== undefined) row.early_check_out_requested = reservation.earlyCheckOutRequested;
  if (reservation.lateCheckOutRequested !== undefined) row.late_check_out_requested = reservation.lateCheckOutRequested;
  if (reservation.groupBookingId !== undefined) row.group_booking_id = reservation.groupBookingId;
  if (reservation.groupId !== undefined) row.group_id = reservation.groupId;
  if (reservation.isGroup !== undefined) row.is_group = reservation.isGroup;
  if (reservation.depositAmount !== undefined) row.deposit_amount = reservation.depositAmount;
  if (reservation.isDepositPaid !== undefined) row.is_deposit_paid = reservation.isDepositPaid;
  if (reservation.ratePlanId !== undefined) row.rate_plan_id = reservation.ratePlanId;
  if (reservation.packageIds !== undefined) row.package_ids = reservation.packageIds;
  if (reservation.guestServiceIds !== undefined) row.guest_service_ids = reservation.guestServiceIds;
  if (reservation.additionalGuestIds !== undefined) row.additional_guest_ids = reservation.additionalGuestIds;
  if (reservation.operatorId !== undefined) row.operator_id = reservation.operatorId;
  if (reservation.allotmentId !== undefined) row.allotment_id = reservation.allotmentId;
  if (reservation.voucherCode !== undefined) row.voucher_code = reservation.voucherCode;
  if (reservation.voucherDiscount !== undefined) row.voucher_discount = reservation.voucherDiscount;
  if (reservation.discountPercent !== undefined) row.discount_percent = reservation.discountPercent;
  if (reservation.taxPercent !== undefined) row.tax_percent = reservation.taxPercent;
  if (reservation.serviceChargePercent !== undefined) row.service_charge_percent = reservation.serviceChargePercent;
  if (reservation.customHotelName !== undefined) row.custom_hotel_name = reservation.customHotelName;
  if (reservation.customHotelAddress !== undefined) row.custom_hotel_address = reservation.customHotelAddress;
  if (reservation.hotelTin !== undefined) row.hotel_tin = reservation.hotelTin;
  if (reservation.hotelVatNo !== undefined) row.hotel_vat_no = reservation.hotelVatNo;
  if (reservation.hotelVatDate !== undefined) row.hotel_vat_date = reservation.hotelVatDate;
  if (reservation.guestTin !== undefined) row.guest_tin = reservation.guestTin;
  if (reservation.guestVatNo !== undefined) row.guest_vat_no = reservation.guestVatNo;
  if (reservation.guestVatDate !== undefined) row.guest_vat_date = reservation.guestVatDate;
  if (reservation.guestNationality !== undefined) row.guest_nationality = reservation.guestNationality;
  if (reservation.guestId !== undefined) row.guest_id = reservation.guestId;
  if (reservation.routingProfileId !== undefined) row.routing_profile_id = reservation.routingProfileId;
  if (reservation.corporateAccountId !== undefined) row.corporate_account_id = reservation.corporateAccountId;
  if (reservation.bookingGroupId !== undefined) row.booking_group_id = reservation.bookingGroupId;
  if (reservation.bookingType !== undefined) row.booking_type = reservation.bookingType;
  if (reservation.roomTypeId !== undefined) row.room_type_id = reservation.roomTypeId;
  if (reservation.folioRoutingOverrides !== undefined) row.folio_routing_overrides = reservation.folioRoutingOverrides;
  return row;
}

// ----------------------------------------------------------------
// Folio
// ----------------------------------------------------------------

export function mapFolioFromDb(row: Record<string, unknown>): MappedFolio {
  return {
    id: String(row.id ?? ''),
    reservationId: String(row.reservation_id ?? ''),
    folioType: String(row.folio_type ?? 'Guest') as MappedFolio['folioType'],
    targetFolio: row.target_folio ? String(row.target_folio) : undefined,
    status: String(row.status ?? 'Open') as MappedFolio['status'],
    balance: toNumber(row.balance) ?? 0,
    totalCharges: toNumber(row.total_charges) ?? 0,
    totalPayments: toNumber(row.total_payments) ?? 0,
    taxTotal: toNumber(row.tax_total) ?? 0,
    serviceChargeTotal: toNumber(row.service_charge_total) ?? 0,
    currency: String(row.currency ?? 'USD'),
    openedAt: String(row.opened_at ?? ''),
    closedAt: row.closed_at ? String(row.closed_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    ownerType: row.owner_type ? String(row.owner_type) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    operatorId: row.operator_id ? String(row.operator_id) : undefined,
    groupId: row.group_id ? String(row.group_id) : undefined,
    creditLimit: toNumber(row.credit_limit),
    createdAt: row.created_at ? String(row.created_at) : undefined,
  } as MappedFolio;
}

export function mapFolioLineFromDb(row: Record<string, unknown>): MappedFolioLine {
  return {
    id: String(row.id ?? ''),
    folioId: String(row.folio_id ?? ''),
    lineNumber: toNumber(row.line_number) ?? 0,
    transactionDate: toDateString(row.transaction_date) ?? '',
    postingDate: toDateTimeString(row.posting_date) ?? '',
    description: String(row.description ?? ''),
    amount: toNumber(row.amount) ?? 0,
    quantity: toNumber(row.quantity) ?? 1,
    unitPrice: toNumber(row.unit_price),
    lineType: String(row.line_type ?? 'Extra') as MappedFolioLine['lineType'],
    targetFolio: row.target_folio ? String(row.target_folio) : undefined,
    revenueAccountCode: row.revenue_account_code ? String(row.revenue_account_code) : undefined,
    taxCode: row.tax_code ? String(row.tax_code) : undefined,
    taxAmount: toNumber(row.tax_amount) ?? 0,
    isVoided: toBoolean(row.is_voided) ?? false,
    voidedAt: row.voided_at ? String(row.voided_at) : undefined,
    voidedBy: row.voided_by ? String(row.voided_by) : undefined,
    voidReason: row.void_reason ? String(row.void_reason) : undefined,
    sourceModule: String(row.source_module ?? ''),
    sourceReference: row.source_reference ? String(row.source_reference) : undefined,
    postedToGl: toBoolean(row.posted_to_gl) ?? false,
    glBatchId: row.gl_batch_id ? String(row.gl_batch_id) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    reservationId: row.reservation_id ? String(row.reservation_id) : undefined,
    usaliCode: row.usali_code ? String(row.usali_code) : undefined,
    usaliRevenueCode: row.usali_revenue_code ? String(row.usali_revenue_code) : undefined,
    usaliCostCode: row.usali_cost_code ? String(row.usali_cost_code) : undefined,
    department: row.department ? String(row.department) : undefined,
  } as MappedFolioLine;
}

export function mapFolioPaymentFromDb(row: Record<string, unknown>): MappedFolioPayment {
  return {
    id: String(row.id ?? ''),
    folioId: String(row.folio_id ?? ''),
    paymentDate: toDateTimeString(row.payment_date) ?? '',
    amount: toNumber(row.amount) ?? 0,
    paymentMethod: String(row.payment_method ?? ''),
    paymentSubType: row.payment_sub_type ? String(row.payment_sub_type) : undefined,
    referenceNumber: row.reference_number ? String(row.reference_number) : undefined,
    cardLastFour: row.card_last_four ? String(row.card_last_four) : undefined,
    cardExpiry: row.card_expiry ? String(row.card_expiry) : undefined,
    authorizationCode: row.authorization_code ? String(row.authorization_code) : undefined,
    isVoided: toBoolean(row.is_voided) ?? false,
    voidedAt: row.voided_at ? String(row.voided_at) : undefined,
    voidedBy: row.voided_by ? String(row.voided_by) : undefined,
    voidReason: row.void_reason ? String(row.void_reason) : undefined,
    isRefund: toBoolean(row.is_refund) ?? false,
    postedToGl: toBoolean(row.posted_to_gl) ?? false,
    glBatchId: row.gl_batch_id ? String(row.gl_batch_id) : undefined,
    cashierId: row.cashier_id ? String(row.cashier_id) : undefined,
    shiftId: row.shift_id ? String(row.shift_id) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    reservationId: row.reservation_id ? String(row.reservation_id) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    receiptUrl: row.receipt_url ? String(row.receipt_url) : undefined,
    bankAccountId: row.bank_account_id ? String(row.bank_account_id) : undefined,
    userId: row.user_id ? String(row.user_id) : undefined,
    targetFolio: row.target_folio ? String(row.target_folio) : undefined,
    invoiceId: row.invoice_id ? String(row.invoice_id) : undefined,
  } as MappedFolioPayment;
}

export function mapFolioLineToDb(line: Partial<MappedFolioLine>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (line.id !== undefined) row.id = line.id;
  if (line.folioId !== undefined) row.folio_id = line.folioId;
  if (line.lineNumber !== undefined) row.line_number = line.lineNumber;
  if (line.transactionDate !== undefined) row.transaction_date = line.transactionDate;
  if (line.postingDate !== undefined) row.posting_date = line.postingDate;
  if (line.description !== undefined) row.description = line.description;
  if (line.amount !== undefined) row.amount = line.amount;
  if (line.quantity !== undefined) row.quantity = line.quantity;
  if (line.unitPrice !== undefined) row.unit_price = line.unitPrice;
  if (line.lineType !== undefined) row.line_type = line.lineType;
  if (line.targetFolio !== undefined) row.target_folio = line.targetFolio;
  if (line.revenueAccountCode !== undefined) row.revenue_account_code = line.revenueAccountCode;
  if (line.taxCode !== undefined) row.tax_code = line.taxCode;
  if (line.taxAmount !== undefined) row.tax_amount = line.taxAmount;
  if (line.isVoided !== undefined) row.is_voided = line.isVoided;
  if (line.voidedAt !== undefined) row.voided_at = line.voidedAt;
  if (line.voidedBy !== undefined) row.voided_by = line.voidedBy;
  if (line.voidReason !== undefined) row.void_reason = line.voidReason;
  if (line.sourceModule !== undefined) row.source_module = line.sourceModule;
  if (line.sourceReference !== undefined) row.source_reference = line.sourceReference;
  if (line.postedToGl !== undefined) row.posted_to_gl = line.postedToGl;
  if (line.glBatchId !== undefined) row.gl_batch_id = line.glBatchId;
  if (line.createdBy !== undefined) row.created_by = line.createdBy;
  if (line.reservationId !== undefined) row.reservation_id = line.reservationId;
  if (line.usaliCode !== undefined) row.usali_code = line.usaliCode;
  if (line.usaliRevenueCode !== undefined) row.usali_revenue_code = line.usaliRevenueCode;
  if (line.usaliCostCode !== undefined) row.usali_cost_code = line.usaliCostCode;
  if (line.department !== undefined) row.department = line.department;
  return row;
}

export function mapFolioPaymentToDb(payment: Partial<MappedFolioPayment>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payment.id !== undefined) row.id = payment.id;
  if (payment.folioId !== undefined) row.folio_id = payment.folioId;
  if (payment.paymentDate !== undefined) row.payment_date = payment.paymentDate;
  if (payment.amount !== undefined) row.amount = payment.amount;
  if (payment.paymentMethod !== undefined) row.payment_method = payment.paymentMethod;
  if (payment.paymentSubType !== undefined) row.payment_sub_type = payment.paymentSubType;
  if (payment.referenceNumber !== undefined) row.reference_number = payment.referenceNumber;
  if (payment.cardLastFour !== undefined) row.card_last_four = payment.cardLastFour;
  if (payment.cardExpiry !== undefined) row.card_expiry = payment.cardExpiry;
  if (payment.authorizationCode !== undefined) row.authorization_code = payment.authorizationCode;
  if (payment.isVoided !== undefined) row.is_voided = payment.isVoided;
  if (payment.voidedAt !== undefined) row.voided_at = payment.voidedAt;
  if (payment.voidedBy !== undefined) row.voided_by = payment.voidedBy;
  if (payment.voidReason !== undefined) row.void_reason = payment.voidReason;
  if (payment.isRefund !== undefined) row.is_refund = payment.isRefund;
  if (payment.postedToGl !== undefined) row.posted_to_gl = payment.postedToGl;
  if (payment.glBatchId !== undefined) row.gl_batch_id = payment.glBatchId;
  if (payment.cashierId !== undefined) row.cashier_id = payment.cashierId;
  if (payment.shiftId !== undefined) row.shift_id = payment.shiftId;
  if (payment.createdBy !== undefined) row.created_by = payment.createdBy;
  if (payment.reservationId !== undefined) row.reservation_id = payment.reservationId;
  if (payment.notes !== undefined) row.notes = payment.notes;
  if (payment.receiptUrl !== undefined) row.receipt_url = payment.receiptUrl;
  if (payment.bankAccountId !== undefined) row.bank_account_id = payment.bankAccountId;
  if (payment.userId !== undefined) row.user_id = payment.userId;
  if (payment.targetFolio !== undefined) row.target_folio = payment.targetFolio;
  if (payment.invoiceId !== undefined) row.invoice_id = payment.invoiceId;
  return row;
}

// ----------------------------------------------------------------
// RatePlan
// ----------------------------------------------------------------

export interface MappedRatePlan {
  id: string;
  name: string;
  description: string;
  baseModifier: number;
  active: boolean;
}

export function mapRatePlanFromDb(row: Record<string, unknown>): MappedRatePlan {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    baseModifier: toNumber(row.base_modifier) ?? 1,
    active: toBoolean(row.active) ?? false,
  };
}

export function mapRatePlanToDb(plan: Partial<MappedRatePlan>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (plan.id !== undefined) row.id = plan.id;
  if (plan.name !== undefined) row.name = plan.name;
  if (plan.description !== undefined) row.description = plan.description;
  if (plan.baseModifier !== undefined) row.base_modifier = plan.baseModifier;
  if (plan.active !== undefined) row.active = plan.active;
  return row;
}

// ----------------------------------------------------------------
// Season
// ----------------------------------------------------------------

export interface MappedSeason {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  multiplier: number;
}

export function mapSeasonFromDb(row: Record<string, unknown>): MappedSeason {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    startMonth: toNumber(row.start_month) ?? 0,
    startDay: toNumber(row.start_day) ?? 1,
    endMonth: toNumber(row.end_month) ?? 0,
    endDay: toNumber(row.end_day) ?? 1,
    multiplier: toNumber(row.multiplier) ?? 1,
  };
}

export function mapSeasonToDb(season: Partial<MappedSeason>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (season.id !== undefined) row.id = season.id;
  if (season.name !== undefined) row.name = season.name;
  if (season.startMonth !== undefined) row.start_month = season.startMonth;
  if (season.startDay !== undefined) row.start_day = season.startDay;
  if (season.endMonth !== undefined) row.end_month = season.endMonth;
  if (season.endDay !== undefined) row.end_day = season.endDay;
  if (season.multiplier !== undefined) row.multiplier = season.multiplier;
  return row;
}

// ----------------------------------------------------------------
// Package
// ----------------------------------------------------------------

export interface MappedPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  chargeFrequency: string;
}

export function mapPackageFromDb(row: Record<string, unknown>): MappedPackage {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    price: toNumber(row.price) ?? 0,
    chargeFrequency: String(row.charge_frequency ?? 'once'),
  };
}

export function mapPackageToDb(pkg: Partial<MappedPackage>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (pkg.id !== undefined) row.id = pkg.id;
  if (pkg.name !== undefined) row.name = pkg.name;
  if (pkg.description !== undefined) row.description = pkg.description;
  if (pkg.price !== undefined) row.price = pkg.price;
  if (pkg.chargeFrequency !== undefined) row.charge_frequency = pkg.chargeFrequency;
  return row;
}

// ----------------------------------------------------------------
// GroupBooking
// ----------------------------------------------------------------

export interface MappedGroupBooking {
  id: string;
  groupName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  roomTypeNeeded: string;
  roomCount: number;
  checkInDate: string;
  checkOutDate: string;
  discountPercent: number;
  status: string;
}

export function mapGroupBookingFromDb(row: Record<string, unknown>): MappedGroupBooking {
  return {
    id: String(row.id ?? ''),
    groupName: String(row.group_name ?? ''),
    contactName: String(row.contact_name ?? ''),
    contactEmail: String(row.contact_email ?? ''),
    contactPhone: String(row.contact_phone ?? ''),
    roomTypeNeeded: String(row.room_type_needed ?? ''),
    roomCount: toNumber(row.room_count) ?? 0,
    checkInDate: toDateString(row.check_in_date) ?? '',
    checkOutDate: toDateString(row.check_out_date) ?? '',
    discountPercent: toNumber(row.discount_percent) ?? 0,
    status: String(row.status ?? 'Pending'),
  };
}

export function mapGroupBookingToDb(group: Partial<MappedGroupBooking>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (group.id !== undefined) row.id = group.id;
  if (group.groupName !== undefined) row.group_name = group.groupName;
  if (group.contactName !== undefined) row.contact_name = group.contactName;
  if (group.contactEmail !== undefined) row.contact_email = group.contactEmail;
  if (group.contactPhone !== undefined) row.contact_phone = group.contactPhone;
  if (group.roomTypeNeeded !== undefined) row.room_type_needed = group.roomTypeNeeded;
  if (group.roomCount !== undefined) row.room_count = group.roomCount;
  if (group.checkInDate !== undefined) row.check_in_date = group.checkInDate;
  if (group.checkOutDate !== undefined) row.check_out_date = group.checkOutDate;
  if (group.discountPercent !== undefined) row.discount_percent = group.discountPercent;
  if (group.status !== undefined) row.status = group.status;
  return row;
}

// ----------------------------------------------------------------
// CorporateAccount
// ----------------------------------------------------------------

export interface MappedCorporateAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  discountPercent: number;
  activeBookings: number;
  unpaidBalance: number;
}

export function mapCorporateAccountFromDb(row: Record<string, unknown>): MappedCorporateAccount {
  return {
    id: String(row.id ?? ''),
    companyName: String(row.company_name ?? ''),
    contactPerson: String(row.contact_person ?? ''),
    contactEmail: String(row.contact_email ?? ''),
    contactPhone: String(row.contact_phone ?? ''),
    discountPercent: toNumber(row.discount_percent) ?? 0,
    activeBookings: toNumber(row.active_bookings) ?? 0,
    unpaidBalance: toNumber(row.unpaid_balance) ?? 0,
  };
}

export function mapCorporateAccountToDb(account: Partial<MappedCorporateAccount>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (account.id !== undefined) row.id = account.id;
  if (account.companyName !== undefined) row.company_name = account.companyName;
  if (account.contactPerson !== undefined) row.contact_person = account.contactPerson;
  if (account.contactEmail !== undefined) row.contact_email = account.contactEmail;
  if (account.contactPhone !== undefined) row.contact_phone = account.contactPhone;
  if (account.discountPercent !== undefined) row.discount_percent = account.discountPercent;
  if (account.activeBookings !== undefined) row.active_bookings = account.activeBookings;
  if (account.unpaidBalance !== undefined) row.unpaid_balance = account.unpaidBalance;
  return row;
}
