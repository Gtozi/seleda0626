import { z } from 'zod';
import { idSchema, dateSchema, emailSchema, phoneSchema } from './common';

// Public booking item validation
export const bookingItemSchema = z.object({
  roomTypeId: idSchema,
  qty: z.coerce.number().int().min(1),
  ratePlanId: idSchema.optional(),
});

export type BookingItemInput = z.infer<typeof bookingItemSchema>;

// Public booking validation
export const publicBookingSchema = z.object({
  p_guest_name: z.string().min(2, 'Guest name is required'),
  p_guest_email: emailSchema,
  p_guest_phone: phoneSchema.optional(),
  p_check_in: dateSchema,
  p_check_out: dateSchema,
  p_items: z.array(bookingItemSchema).min(1, 'At least one room item is required'),
  p_channel: z.enum(['Direct Website', 'Walk-In', 'Corporate', 'Group']).default('Direct Website'),
  p_status: z.enum(['Pending', 'Confirmed', 'Waitlisted']).default('Waitlisted'),
  p_source: z.string().optional(),
  p_special_requests: z.string().optional(),
  p_adult_count: z.coerce.number().int().min(1).default(1),
  p_child_count: z.coerce.number().int().min(0).default(0),
  p_package_ids: z.array(idSchema).optional(),
  p_guest_service_ids: z.array(idSchema).optional(),
  p_notes: z.string().optional(),
  p_voucher_code: z.string().optional(),
  p_voucher_discount: z.coerce.number().min(0).optional(),
  p_operator_id: idSchema.optional(),
}).refine((data) => {
  const start = new Date(data.p_check_in);
  const end = new Date(data.p_check_out);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["p_check_out"],
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

// Payment confirmation validation
export const paymentConfirmationSchema = z.object({
  reservationIds: z.array(idSchema).min(1, 'At least one reservation ID is required'),
  paymentMethod: z.enum(['credit_card', 'telebirr', 'cbe_bank_transfer', 'awash_bank_transfer', 'cash']),
  paymentDetails: z.object({
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    walletNumber: z.string().optional(),
    transactionId: z.string().optional(),
    amount: z.coerce.number().min(0),
  }),
});

export type PaymentConfirmationInput = z.infer<typeof paymentConfirmationSchema>;

// Billing calculation validation
export const billingCalculationSchema = z.object({
  checkIn: dateSchema,
  checkOut: dateSchema,
  roomTypeId: idSchema,
  ratePlanId: idSchema.optional(),
  packageIds: z.array(idSchema).optional(),
  guestServiceIds: z.array(idSchema).optional(),
  adultCount: z.coerce.number().int().min(1).default(1),
  childCount: z.coerce.number().int().min(0).default(0),
}).refine((data) => {
  const start = new Date(data.checkIn);
  const end = new Date(data.checkOut);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

export type BillingCalculationInput = z.infer<typeof billingCalculationSchema>;
