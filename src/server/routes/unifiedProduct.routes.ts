/**
 * Unified Products Routes
 * Phase 2 Item 2: Cross-source product queries via SQL views
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// GET /items — unified products across pos_menu/legacy_menu/kitchen_recipe/bar_recipe
router.get('/items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, source, is_active } = req.query as Record<string, string>;

  let q = supabaseAdmin.from('unified_products').select('*');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);
  if (source) q = q.eq('source_table', source);
  if (is_active === 'true') q = q.eq('is_active', true);
  q = q.order('name');

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /summary — aggregate product counts by outlet and source
router.get('/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;

  let q = supabaseAdmin.from('unified_product_summary').select('*');
  if (outlet_id) q = q.eq('pos_outlet_id', outlet_id);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /search — search products by name or recipe_code across all sources
router.get('/search', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { q: searchQuery, outlet_id } = req.query as Record<string, string>;

  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  let query = supabaseAdmin
    .from('unified_products')
    .select('*')
    .ilike('name', `%${searchQuery}%`)
    .order('name')
    .limit(50);

  if (outlet_id) query = query.eq('pos_outlet_id', outlet_id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

export default router;
