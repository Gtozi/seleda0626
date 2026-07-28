/**
 * Unified Inventory Routes
 * Phase 2 Item 3: Cross-source inventory queries via SQL views
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// GET /items — unified inventory items across core/kitchen/bar
router.get('/items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, source } = req.query as Record<string, string>;

  let q = supabaseAdmin.from('unified_inventory_items').select('*');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);
  if (source) q = q.eq('source_table', source);
  q = q.order('name');

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /locations — unified storage locations across core/kitchen/bar
router.get('/locations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, source } = req.query as Record<string, string>;

  let q = supabaseAdmin.from('unified_storage_locations').select('*');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);
  if (source) q = q.eq('source_table', source);
  q = q.order('name');

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /low-stock — items below reorder level across all sources
router.get('/low-stock', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('unified_inventory_items')
    .select('*')
    .or('available_qty.lte.reorder_level,min_stock_level.lte.reorder_level');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /summary — aggregate counts by source and outlet
router.get('/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('unified_inventory_items')
    .select('source_table, is_active');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const summary: Record<string, { total: number; active: number }> = {};
  for (const row of data || []) {
    const src = row.source_table;
    if (!summary[src]) summary[src] = { total: 0, active: 0 };
    summary[src].total++;
    if (row.is_active) summary[src].active++;
  }
  return res.json(summary);
});

export default router;
