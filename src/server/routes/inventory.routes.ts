import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';
import { storeApiSchema, itemApiSchema, supplierApiSchema, requisitionApiSchema, stockMovementApiSchema, grnApiSchema } from '../../schemas/inventorySchema';

const router = Router();

// ── Inventory Stores ───────────────────────────────────────────

router.post('/stores', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = storeApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_stores').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'inventory_store.upserted', entityType: 'InventoryStore', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

// ── Inventory Items ────────────────────────────────────────────

router.post('/items', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = itemApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_items').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'inventory_item.upserted', entityType: 'InventoryItem', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

router.delete('/items/:id', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('inventory_items').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'inventory_item.deleted', entityType: 'InventoryItem', entityId: id, module: 'inventory' });
  res.json({ success: true });
});

// ── Inventory Suppliers ────────────────────────────────────────

router.post('/suppliers', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = supplierApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_suppliers').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'inventory_supplier.upserted', entityType: 'InventorySupplier', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

router.delete('/suppliers/:id', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('inventory_suppliers').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'inventory_supplier.deleted', entityType: 'InventorySupplier', entityId: id, module: 'inventory' });
  res.json({ success: true });
});

// ── Inventory Requisitions ─────────────────────────────────────

router.post('/requisitions', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = requisitionApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_requisitions').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'requisition.upserted', entityType: 'Requisition', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

router.delete('/requisitions/:id', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('inventory_requisitions').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'requisition.deleted', entityType: 'Requisition', entityId: id, module: 'inventory' });
  res.json({ success: true });
});

// ── Stock Movements ────────────────────────────────────────────

router.post('/stock-movements', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = stockMovementApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_stock_movements').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'stock_movement.upserted', entityType: 'StockMovement', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

// ── Inventory GRNs ─────────────────────────────────────────────

router.post('/grns', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  const validation = grnApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('inventory_grns').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'grn.upserted', entityType: 'GRN', entityId: validation.data.id, module: 'inventory' });
  res.json({ success: true });
});

router.delete('/grns/:id', authenticate, requirePermission('inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('inventory_grns').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'grn.deleted', entityType: 'GRN', entityId: id, module: 'inventory' });
  res.json({ success: true });
});

export default router;
