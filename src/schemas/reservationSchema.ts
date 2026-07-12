/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { RoomType } from '../types/erp';

const roomSelectionSchema = z.object({
  roomType: z.string().min(1, 'Room type is required'),
  count: z.number().min(1),
  roomNumbers: z.array(z.string()).optional(),
  roomNights: z.array(z.array(z.string())).optional(),
});

export const reservationSchema = z.object({
  id: z.string().optional(),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().optional(),
  roomType: z.string().min(1, 'Room type is required'),
  roomSelections: z.array(roomSelectionSchema).optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  adults: z.number().min(1, 'At least 1 adult is required'),
  children: z.number().min(0),
  promoCode: z.string().optional(),
  channel: z.enum(['Booking.com', 'Expedia', 'Walk-In', 'Direct Website', 'Corporate']),
  specialRequests: z.string().optional(),
  guestNationality: z.string().optional(),
  depositAmount: z.number().min(0),
  isDepositPaid: z.boolean(),
  ratePlanId: z.string().optional(),
  packageIds: z.array(z.string()),
  guestServiceIds: z.array(z.string()),
  additionalGuestIds: z.array(z.string()),
  guestTin: z.string().optional(),
  guestVatNo: z.string().optional(),
  guestVatDate: z.string().optional(),
  bookingType: z.enum(['Individual', 'Group', 'Corporate']),
  bookingGroupId: z.string().optional(),
  groupName: z.string().optional(),
  numberOfRooms: z.number().min(1).optional(),
  corporateAccountId: z.string().optional(),
  operatorId: z.string().optional(),
  voucherCode: z.string().optional(),
  voucherDiscount: z.number().min(0).optional(),
}).refine((data) => {
  const start = new Date(data.checkInDate);
  const end = new Date(data.checkOutDate);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
}).refine((data) => {
  // Individual bookings can only have one room type
  if (data.bookingType === 'Individual' && data.roomSelections && data.roomSelections.length > 1) {
    return false;
  }
  return true;
}, {
  message: "Individual bookings can only have one room type",
  path: ["roomSelections"],
}).refine((data) => {
  if (data.bookingType === 'Group' && (!data.groupName || data.groupName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Group name is required for group bookings",
  path: ["groupName"],
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
