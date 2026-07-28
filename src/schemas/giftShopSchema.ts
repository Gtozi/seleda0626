import { z } from 'zod';
import { idSchema } from './common';

// Gift Shop Sale validation
export const giftShopSaleSchema = z.object({
  id: idSchema.optional(),
  item_id: idSchema,
  quantity: z.coerce.number().int().min(1),
  unit_price: z.coerce.number().min(0),
  total_amount: z.coerce.number().min(0),
  sale_date: z.string().optional(),
  sold_by: idSchema.optional(),
  status: z.enum(['Pending', 'Completed', 'Cancelled']).default('Pending'),
  notes: z.string().optional(),
});

export type GiftShopSaleInput = z.infer<typeof giftShopSaleSchema>;

// Gift Shop Issue validation
export const giftShopIssueSchema = z.object({
  id: idSchema.optional(),
  item_id: idSchema,
  quantity: z.coerce.number().int().min(1),
  reason: z.string().min(1, 'Reason is required'),
  issue_date: z.string().optional(),
  issued_by: idSchema.optional(),
  notes: z.string().optional(),
});

export type GiftShopIssueInput = z.infer<typeof giftShopIssueSchema>;
