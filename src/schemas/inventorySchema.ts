import { z } from 'zod';
import { idSchema, dateSchema, phoneSchema, emailSchema } from './common';

// Store validation (backend API)
export const storeApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Store name is required'),
  location: z.string().optional(),
  manager_id: idSchema.optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type StoreApiInput = z.infer<typeof storeApiSchema>;

// Item validation (backend API)
export const itemApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Item name is required'),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  unit_cost: z.coerce.number().min(0).default(0),
  selling_price: z.coerce.number().min(0).default(0),
  reorder_level: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type ItemApiInput = z.infer<typeof itemApiSchema>;

// Supplier validation (backend API)
export const supplierApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Supplier name is required'),
  contact_person: z.string().optional(),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type SupplierApiInput = z.infer<typeof supplierApiSchema>;

// Requisition validation (backend API)
export const requisitionApiSchema = z.object({
  id: idSchema.optional(),
  store_id: idSchema,
  requested_by: idSchema,
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Partially Fulfilled', 'Fulfilled']).default('Pending'),
  request_date: dateSchema.optional(),
  required_date: dateSchema.optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    item_id: idSchema,
    quantity: z.coerce.number().int().min(1),
    unit_cost: z.coerce.number().min(0).optional(),
  })).optional(),
});

export type RequisitionApiInput = z.infer<typeof requisitionApiSchema>;

// Stock Movement validation (backend API)
export const stockMovementApiSchema = z.object({
  id: idSchema.optional(),
  item_id: idSchema,
  store_id: idSchema,
  movement_type: z.enum(['in', 'out', 'transfer', 'adjustment']),
  quantity: z.coerce.number().int(),
  reference_type: z.string().optional(),
  reference_id: idSchema.optional(),
  notes: z.string().optional(),
  moved_by: idSchema.optional(),
  movement_date: dateSchema.optional(),
});

export type StockMovementApiInput = z.infer<typeof stockMovementApiSchema>;

// GRN (Goods Received Note) validation (backend API)
export const grnApiSchema = z.object({
  id: idSchema.optional(),
  supplier_id: idSchema,
  store_id: idSchema,
  received_date: dateSchema,
  invoice_number: z.string().optional(),
  invoice_date: dateSchema.optional(),
  notes: z.string().optional(),
  received_by: idSchema.optional(),
  items: z.array(z.object({
    item_id: idSchema,
    quantity_received: z.coerce.number().int().min(1),
    unit_cost: z.coerce.number().min(0),
    batch_number: z.string().optional(),
    expiry_date: dateSchema.optional(),
  })).optional(),
});

export type GrnApiInput = z.infer<typeof grnApiSchema>;
