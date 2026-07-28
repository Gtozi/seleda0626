import { z } from 'zod';
import { dateSchema, emailSchema } from './common';

// Report email dispatch validation
export const reportEmailSchema = z.object({
  reportName: z.string().min(1, 'Report name is required'),
  recipients: z.union([
    z.array(z.string().email('Invalid email address')),
    z.string().transform((val) => val.split(',').map((r) => r.trim()).filter(Boolean))
  ]),
  fileSize: z.coerce.number().min(0).optional(),
  summary: z.string().optional(),
});

export type ReportEmailInput = z.infer<typeof reportEmailSchema>;

// Historical stats validation
export const historicalStatsSchema = z.object({
  businessDate: dateSchema,
  occupancy: z.coerce.number().min(0).max(100).optional(),
  roomRevenue: z.coerce.number().min(0).optional(),
  ancillaryRevenue: z.coerce.number().min(0).optional(),
  adr: z.coerce.number().min(0).optional(),
  revpar: z.coerce.number().min(0).optional(),
  guestSatisfaction: z.coerce.number().min(0).max(5).optional(),
});

export type HistoricalStatsInput = z.infer<typeof historicalStatsSchema>;
