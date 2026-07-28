import { z } from 'zod';
import { idSchema, dateSchema, emailSchema, phoneSchema } from './common';

// Room validation (backend API)
export const roomApiSchema = z.object({
  id: idSchema.optional(),
  number: z.string().min(1, 'Room number is required'),
  room_type_id: idSchema,
  status: z.enum(['Vacant Clean', 'Vacant Dirty', 'Occupied', 'Out of Order', 'Maintenance']).default('Vacant Clean'),
  floor: z.coerce.number().int().optional(),
  notes: z.string().optional(),
});

export type RoomApiInput = z.infer<typeof roomApiSchema>;

// Guest validation (backend API)
export const guestApiSchema = z.object({
  id: idSchema.optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  nationality: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestApiInput = z.infer<typeof guestApiSchema>;

// Reservation validation (backend API)
export const reservationApiSchema = z.object({
  id: idSchema.optional(),
  guest_id: idSchema.optional(),
  room_type_id: idSchema,
  room_number: z.string().optional(),
  check_in_date: dateSchema,
  check_out_date: dateSchema,
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow', 'Waitlisted']).default('Pending'),
  channel: z.enum(['Direct', 'OTA', 'Corporate', 'Group', 'Direct Website']).default('Direct'),
  source: z.string().optional(),
  adult_count: z.coerce.number().int().min(1).default(1),
  child_count: z.coerce.number().int().min(0).default(0),
  base_rate: z.coerce.number().min(0).optional(),
  total_amount: z.coerce.number().min(0).optional(),
  deposit_amount: z.coerce.number().min(0).optional(),
  payment_status: z.enum(['Unpaid', 'Partial', 'Paid', 'Refunded']).default('Unpaid'),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  created_by: idSchema.optional(),
}).refine((data) => {
  const start = new Date(data.check_in_date);
  const end = new Date(data.check_out_date);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["check_out_date"],
});

export type ReservationApiInput = z.infer<typeof reservationApiSchema>;

// Room Type validation (backend API)
export const roomTypeApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Room type name is required'),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0),
  max_occupancy: z.coerce.number().int().min(1),
  bed_configuration: z.string().optional(),
  room_size_sqm: z.coerce.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  image_url_1: z.string().url().optional().or(z.literal('')),
  image_url_2: z.string().url().optional().or(z.literal('')),
  image_url_3: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export type RoomTypeApiInput = z.infer<typeof roomTypeApiSchema>;

// Rate Plan validation (backend API)
export const ratePlanApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Rate plan name is required'),
  description: z.string().optional(),
  base_modifier: z.coerce.number().min(0).default(1),
  min_stay: z.coerce.number().int().min(1).default(1),
  max_stay: z.coerce.number().int().optional(),
  cancellation_policy: z.string().optional(),
  active: z.boolean().default(true),
});

export type RatePlanApiInput = z.infer<typeof ratePlanApiSchema>;

// Season validation (backend API)
export const seasonApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Season name is required'),
  start_date: dateSchema,
  end_date: dateSchema,
  multiplier: z.coerce.number().min(0).default(1),
  is_active: z.boolean().default(true),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type SeasonApiInput = z.infer<typeof seasonApiSchema>;

// Package validation (backend API)
export const packageApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  charge_frequency: z.enum(['once', 'per_night', 'per_stay']).default('once'),
  is_active: z.boolean().default(true),
});

export type PackageApiInput = z.infer<typeof packageApiSchema>;

// Yield Policy validation (backend API)
export const yieldPolicyApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Policy name is required'),
  room_type_id: idSchema,
  min_occupancy_threshold: z.coerce.number().int().min(0).default(0),
  max_occupancy_threshold: z.coerce.number().int().min(0).default(100),
  rate_modifier: z.coerce.number().default(1),
  is_active: z.boolean().default(true),
});

export type YieldPolicyApiInput = z.infer<typeof yieldPolicyApiSchema>;

// Airport Shuttle Request validation (backend API)
export const airportShuttleApiSchema = z.object({
  id: idSchema.optional(),
  reservation_id: idSchema.optional(),
  direction: z.enum(['pickup', 'dropoff']),
  flight_number: z.string().min(1, 'Flight number is required'),
  scheduled_time: dateSchema,
  passenger_count: z.coerce.number().int().min(1),
  notes: z.string().optional(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled']).default('Scheduled'),
});

export type AirportShuttleApiInput = z.infer<typeof airportShuttleApiSchema>;
