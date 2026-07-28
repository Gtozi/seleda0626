import { z } from 'zod';
import { idSchema, dateSchema, emailSchema, phoneSchema } from './common';

// Group Booking validation
export const groupBookingSchema = z.object({
  id: idSchema.optional(),
  group_name: z.string().min(1, 'Group name is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  contact_email: emailSchema,
  contact_phone: phoneSchema,
  check_in_date: dateSchema,
  check_out_date: dateSchema,
  room_count: z.coerce.number().int().min(1),
  adult_count: z.coerce.number().int().min(1),
  child_count: z.coerce.number().int().min(0).default(0),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).default('Pending'),
  notes: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.check_in_date);
  const end = new Date(data.check_out_date);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["check_out_date"],
});

export type GroupBookingInput = z.infer<typeof groupBookingSchema>;

// Group Profile validation
export const groupProfileSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(['Corporate', 'Tour Operator', 'Travel Agency', 'Association', 'Other']).default('Corporate'),
  contact_person: z.string().min(1, 'Contact person is required'),
  contact_email: emailSchema,
  contact_phone: phoneSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type GroupProfileInput = z.infer<typeof groupProfileSchema>;

// Guest Group Relationship validation
export const guestGroupRelationshipSchema = z.object({
  id: idSchema.optional(),
  guest_id: idSchema,
  group_profile_id: idSchema,
  relationship_type: z.enum(['Member', 'Contact', 'Coordinator', 'Manager']).default('Member'),
  is_primary_contact: z.boolean().default(false),
  notes: z.string().optional(),
});

export type GuestGroupRelationshipInput = z.infer<typeof guestGroupRelationshipSchema>;

// Link Guest to Group validation
export const linkGuestToGroupSchema = z.object({
  guest_id: idSchema,
  relationship_type: z.enum(['Member', 'Contact', 'Coordinator', 'Manager']).default('Member'),
  is_primary_contact: z.boolean().default(false),
  notes: z.string().optional(),
});

export type LinkGuestToGroupInput = z.infer<typeof linkGuestToGroupSchema>;
