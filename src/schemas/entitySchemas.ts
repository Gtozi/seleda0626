/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Zod schemas for runtime validation of API responses and entity boundaries.
 * These validate the shape of data returned from the database via dataMapper.ts.
 */

import { z } from 'zod';

// ============================================================================
// ROOM
// ============================================================================

export const roomSchema = z.object({
  id: z.string(),
  number: z.string(),
  type: z.string(),
  floor: z.number().int(),
  status: z.enum(['Vacant Clean', 'Vacant Dirty', 'Occupied Clean', 'Occupied Dirty', 'Out of Order']),
  rate: z.number(),
  features: z.array(z.string()),
  roomTypeId: z.string().optional(),
});

export type RoomEntity = z.infer<typeof roomSchema>;

// ============================================================================
// GUEST
// ============================================================================

export const guestSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  status: z.enum(['VIP', 'Regular', 'Loyalty Member']),
  loyaltyPoints: z.number().int(),
  specialRequests: z.string(),
  notes: z.string(),
  history: z.array(z.unknown()),
  totalSpend: z.number(),
  nationality: z.string().optional(),
  tin: z.string().optional(),
  vatNo: z.string().optional(),
  vatDate: z.string().optional(),
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  identificationDoc: z.record(z.string(), z.unknown()).optional(),
  parentGroupId: z.string().optional(),
  parentCorporateId: z.string().optional(),
  isPrimaryContact: z.boolean().optional(),
  billingRoutingProfileId: z.string().optional(),
});

export type GuestEntity = z.infer<typeof guestSchema>;

// ============================================================================
// RESERVATION (response validation)
// ============================================================================

export const reservationResponseSchema = z.object({
  id: z.string(),
  guestName: z.string(),
  guestEmail: z.string(),
  guestPhone: z.string(),
  guestStatus: z.string(),
  roomType: z.string(),
  roomNumber: z.string().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  adults: z.number().int(),
  children: z.number().int(),
  status: z.enum(['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'Waitlisted']),
  rate: z.number(),
  totalAmount: z.number(),
  channel: z.enum(['Booking.com', 'Expedia', 'Walk-In', 'Direct Website', 'Corporate']),
  paymentStatus: z.enum(['Unpaid', 'Paid', 'Partial']),
  isGroup: z.boolean(),
  isDepositPaid: z.boolean(),
  discountPercent: z.number().optional(),
  taxPercent: z.number().optional(),
  serviceChargePercent: z.number().optional(),
  guestId: z.string().optional(),
  groupId: z.string().optional(),
  groupBookingId: z.string().optional(),
  corporateAccountId: z.string().optional(),
  routingProfileId: z.string().optional(),
  bookingGroupId: z.string().optional(),
  bookingType: z.string().optional(),
});

export type ReservationEntity = z.infer<typeof reservationResponseSchema>;

// ============================================================================
// FOLIO
// ============================================================================

export const folioSchema = z.object({
  id: z.string(),
  reservationId: z.string(),
  folioType: z.string(),
  targetFolio: z.string().optional(),
  status: z.string(),
  balance: z.number(),
  totalCharges: z.number(),
  totalPayments: z.number(),
  taxTotal: z.number(),
  serviceChargeTotal: z.number(),
  currency: z.string(),
  openedAt: z.string(),
  closedAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
  ownerType: z.string().optional(),
  ownerId: z.string().optional(),
  operatorId: z.string().optional(),
  groupId: z.string().optional(),
  creditLimit: z.number().optional(),
  createdAt: z.string().optional(),
});

export type FolioEntity = z.infer<typeof folioSchema>;

// ============================================================================
// FOLIO LINE
// ============================================================================

export const folioLineSchema = z.object({
  id: z.string(),
  folioId: z.string(),
  lineNumber: z.number().int(),
  transactionDate: z.string(),
  postingDate: z.string(),
  description: z.string(),
  amount: z.number(),
  quantity: z.number(),
  unitPrice: z.number().optional(),
  lineType: z.string(),
  targetFolio: z.string().optional(),
  revenueAccountCode: z.string().optional(),
  taxCode: z.string().optional(),
  taxAmount: z.number(),
  isVoided: z.boolean(),
  voidedAt: z.string().optional(),
  voidedBy: z.string().optional(),
  voidReason: z.string().optional(),
  sourceModule: z.string(),
  sourceReference: z.string().optional(),
  postedToGl: z.boolean(),
  glBatchId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  reservationId: z.string().optional(),
  usaliCode: z.string().optional(),
  usaliRevenueCode: z.string().optional(),
  usaliCostCode: z.string().optional(),
  department: z.string().optional(),
});

export type FolioLineEntity = z.infer<typeof folioLineSchema>;

// ============================================================================
// FOLIO PAYMENT
// ============================================================================

export const folioPaymentSchema = z.object({
  id: z.string(),
  folioId: z.string(),
  paymentDate: z.string(),
  amount: z.number(),
  paymentMethod: z.string(),
  paymentSubType: z.string().optional(),
  referenceNumber: z.string().optional(),
  cardLastFour: z.string().optional(),
  cardExpiry: z.string().optional(),
  authorizationCode: z.string().optional(),
  isVoided: z.boolean(),
  voidedAt: z.string().optional(),
  voidedBy: z.string().optional(),
  voidReason: z.string().optional(),
  isRefund: z.boolean(),
  postedToGl: z.boolean(),
  glBatchId: z.string().optional(),
  cashierId: z.string().optional(),
  shiftId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  reservationId: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  bankAccountId: z.string().optional(),
  userId: z.string().optional(),
  targetFolio: z.string().optional(),
  invoiceId: z.string().optional(),
});

export type FolioPaymentEntity = z.infer<typeof folioPaymentSchema>;

// ============================================================================
// FOLIO API RESPONSE (GET /api/reservations/:id/folio)
// ============================================================================

export const folioApiResponseSchema = z.object({
  folios: z.array(folioSchema),
  lines: z.array(folioLineSchema),
  payments: z.array(folioPaymentSchema),
  consolidatedBalance: z.number(),
  consolidatedCharges: z.number(),
  consolidatedPayments: z.number(),
  billingBreakdown: z.any().nullable().optional(),
});

export type FolioApiResponse = z.infer<typeof folioApiResponseSchema>;

// ============================================================================
// RATE PLAN
// ============================================================================

export const ratePlanEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  baseModifier: z.number().min(0.1).max(10),
  active: z.boolean(),
});

export type RatePlanEntity = z.infer<typeof ratePlanEntitySchema>;

// ============================================================================
// SEASON
// ============================================================================

export const seasonEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  startMonth: z.number().int().min(0).max(11),
  startDay: z.number().int().min(1).max(31),
  endMonth: z.number().int().min(0).max(11),
  endDay: z.number().int().min(1).max(31),
  multiplier: z.number().min(0.1).max(10),
});

export type SeasonEntity = z.infer<typeof seasonEntitySchema>;

// ============================================================================
// PACKAGE
// ============================================================================

export const packageEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  chargeFrequency: z.enum(['once', 'daily']),
});

export type PackageEntity = z.infer<typeof packageEntitySchema>;

// ============================================================================
// GROUP BOOKING
// ============================================================================

export const groupBookingEntitySchema = z.object({
  id: z.string(),
  groupName: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  roomTypeNeeded: z.string(),
  roomCount: z.number().int().min(1),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  discountPercent: z.number().min(0).max(100),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled']),
});

export type GroupBookingEntity = z.infer<typeof groupBookingEntitySchema>;

// ============================================================================
// CORPORATE ACCOUNT
// ============================================================================

export const corporateAccountEntitySchema = z.object({
  id: z.string(),
  companyName: z.string(),
  contactPerson: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  discountPercent: z.number().min(0).max(100),
  activeBookings: z.number().int(),
  unpaidBalance: z.number(),
});

export type CorporateAccountEntity = z.infer<typeof corporateAccountEntitySchema>;
