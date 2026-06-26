/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Comprehensive Validation Schemas
 * Zod schemas for all user inputs with security validations
 */

import { z } from 'zod';

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
const sanitizeString = (str: string): string => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Email validation with normalization
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email is too long')
  .transform(email => email.toLowerCase().trim());

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number. Use international format (e.g., +1234567890)'
  )
  .transform(phone => phone.replace(/\s/g, ''));

/**
 * Name validation (prevents special characters)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform(name => name.trim());

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * TIN (Tax Identification Number) validation
 */
export const tinSchema = z
  .string()
  .optional()
  .refine(
    val => !val || /^\d{10}$/.test(val),
    'TIN must be exactly 10 digits'
  );

/**
 * VAT number validation
 */
export const vatSchema = z
  .string()
  .optional()
  .refine(
    val => !val || /^[A-Z0-9]{8,15}$/.test(val),
    'Invalid VAT number format'
  );

/**
 * Date validation (ISO format)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    date => !isNaN(new Date(date).getTime()),
    'Invalid date'
  );

/**
 * Safe text input (prevents XSS)
 */
export const safeTextSchema = (maxLength: number = 1000) =>
  z
    .string()
    .max(maxLength, `Text must be less than ${maxLength} characters`)
    .transform(text => sanitizeString(text.trim()));

// ============================================================================
// GUEST SCHEMAS
// ============================================================================

export const guestInputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  nationality: z
    .string()
    .optional()
    .refine(
      val => !val || /^[A-Z]{2}$/.test(val),
      'Nationality must be a 2-letter country code (e.g., US, GB)'
    ),
  tin: tinSchema,
  vatNo: vatSchema,
  vatDate: dateSchema.optional(),
  specialRequests: safeTextSchema(500).optional(),
  notes: safeTextSchema(1000).optional(),
  preferences: z
    .object({
      roomTypePreference: z
        .enum(['Single', 'Double', 'Deluxe', 'Suite', 'Penthouse'])
        .optional(),
      pillowPreference: z
        .enum(['Soft', 'Firm', 'Feather', 'Orthopedic'])
        .optional(),
      dietaryRestrictions: safeTextSchema(200).optional(),
      languagePreference: z.string().max(50).optional(),
    })
    .optional(),
  identificationDoc: z
    .object({
      type: z.string().max(50),
      number: z.string().max(50),
      expiryDate: dateSchema,
      isUploaded: z.boolean(),
    })
    .optional(),
});

export type GuestInput = z.infer<typeof guestInputSchema>;

// ============================================================================
// RESERVATION SCHEMAS
// ============================================================================

export const reservationInputSchema = z
  .object({
    guestName: nameSchema,
    guestEmail: emailSchema,
    guestPhone: phoneSchema,
    roomType: z.enum(['Single', 'Double', 'Deluxe', 'Suite', 'Penthouse']),
    checkInDate: dateSchema,
    checkOutDate: dateSchema,
    adults: z.number().int().min(1, 'At least 1 adult required').max(10),
    children: z.number().int().min(0).max(10),
    notes: safeTextSchema(500).optional(),
    promoCode: z
      .string()
      .max(50)
      .regex(/^[A-Z0-9-_]*$/, 'Invalid promo code format')
      .optional(),
    ratePlanId: z.string().optional(),
    packageIds: z.array(z.string()).optional(),
  })
  .refine(
    data => new Date(data.checkOutDate) > new Date(data.checkInDate),
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate'],
    }
  )
  .refine(
    data => {
      const checkIn = new Date(data.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkIn >= today;
    },
    {
      message: 'Check-in date cannot be in the past',
      path: ['checkInDate'],
    }
  );

export type ReservationInput = z.infer<typeof reservationInputSchema>;

// ============================================================================
// USER/AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum([
      'frontoffice',
      'housekeeping',
      'f&b',
      'maintenance',
      'inventory',
      'finance',
      'hr',
      'executive',
      'procurement',
    ]),
    department: z.string().max(100).optional(),
    employeeId: z.string().max(50).optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const paymentInputSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large')
    .refine(
      val => Number.isFinite(val) && val === parseFloat(val.toFixed(2)),
      'Amount must have at most 2 decimal places'
    ),
  method: z.enum([
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Mobile Money',
    'Corporate Account',
  ]),
  notes: safeTextSchema(200).optional(),
  cardLast4: z
    .string()
    .optional()
    .refine(
      val => !val || /^\d{4}$/.test(val),
      'Card last 4 digits must be exactly 4 numbers'
    ),
  transactionId: z.string().max(100).optional(),
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;

// ============================================================================
// CHARGE SCHEMAS
// ============================================================================

export const chargeInputSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large')
    .refine(
      val => Number.isFinite(val) && val === parseFloat(val.toFixed(2)),
      'Amount must have at most 2 decimal places'
    ),
  description: safeTextSchema(200),
  type: z.enum([
    'Room',
    'F&B',
    'Extra',
    'Minibar',
    'Laundry',
    'Tax',
    'Discount',
    'Transfer',
    'Other',
  ]),
  targetFolio: z.enum(['A', 'B']).optional(),
});

export type ChargeInput = z.infer<typeof chargeInputSchema>;

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const hotelSettingsSchema = z.object({
  customHotelName: z.string().min(1).max(200),
  customHotelAddress: z.string().max(500),
  hotelTin: tinSchema,
  hotelVatNo: vatSchema,
  hotelVatDate: dateSchema.optional(),
  taxPercent: z.number().min(0).max(100),
  serviceChargePercent: z.number().min(0).max(100),
  currency: z.enum(['USD', 'ETB']),
  publicTagline: safeTextSchema(200).optional(),
  termsAdventureLiability: safeTextSchema(2000).optional(),
  termsWaitlistProtocol: safeTextSchema(2000).optional(),
  termsConservationDevotion: safeTextSchema(2000).optional(),
  termsBillingCancellation: safeTextSchema(2000).optional(),
  termsWildernessEmergency: safeTextSchema(2000).optional(),
});

export type HotelSettingsInput = z.infer<typeof hotelSettingsSchema>;

// ============================================================================
// RATE PLAN SCHEMAS
// ============================================================================

export const ratePlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: safeTextSchema(500),
  baseModifier: z
    .number()
    .min(0.1, 'Modifier must be at least 0.1')
    .max(10, 'Modifier cannot exceed 10'),
  active: z.boolean(),
});

export type RatePlanInput = z.infer<typeof ratePlanSchema>;

// ============================================================================
// PACKAGE SCHEMAS
// ============================================================================

export const packageSchema = z.object({
  name: z.string().min(1).max(100),
  description: safeTextSchema(500),
  price: z.number().min(0).max(100000),
  chargeFrequency: z.enum(['once', 'daily', 'per_person']),
});

export type PackageInput = z.infer<typeof packageSchema>;

// ============================================================================
// SEASON SCHEMAS
// ============================================================================

export const seasonSchema = z
  .object({
    name: z.string().min(1).max(100),
    startMonth: z.number().int().min(0).max(11),
    startDay: z.number().int().min(1).max(31),
    endMonth: z.number().int().min(0).max(11),
    endDay: z.number().int().min(1).max(31),
    multiplier: z.number().min(0.1).max(10),
  })
  .refine(
    data => {
      // Validate that the date range is valid
      const start = new Date(2024, data.startMonth, data.startDay);
      const end = new Date(2024, data.endMonth, data.endDay);
      return !isNaN(start.getTime()) && !isNaN(end.getTime());
    },
    {
      message: 'Invalid date range',
    }
  );

export type SeasonInput = z.infer<typeof seasonSchema>;

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const schemas = {
  guest: guestInputSchema,
  reservation: reservationInputSchema,
  login: loginSchema,
  register: registerSchema,
  changePassword: changePasswordSchema,
  payment: paymentInputSchema,
  charge: chargeInputSchema,
  hotelSettings: hotelSettingsSchema,
  ratePlan: ratePlanSchema,
  package: packageSchema,
  season: seasonSchema,
};
