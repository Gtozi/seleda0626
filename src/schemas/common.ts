import { z } from 'zod';

// Common validation patterns
export const idSchema = z.string().min(1, 'ID is required');

export const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
