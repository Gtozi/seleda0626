/**
 * Cost Variance Routes
 * Phase 3 Item 3: Theoretical vs actual cost analysis
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// GET /theoretical — theoretical cost from POS sales × recipe costs
router.get('/theoretical', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { start_date, end_date, outlet_id } = req.query as Record<string, string>;

  const { data, error } = await supabaseAdmin.rpc('compute_theoretical_cost', {
    p_start_date: start_date || new Date().toISOString().split('T')[0],
    p_end_date: end_date || new Date().toISOString().split('T')[0],
    p_outlet_id: outlet_id || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /actual — actual cost from stock depletion, wastage, and movements
router.get('/actual', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { start_date, end_date, outlet_id } = req.query as Record<string, string>;

  const { data, error } = await supabaseAdmin.rpc('compute_actual_cost', {
    p_start_date: start_date || new Date().toISOString().split('T')[0],
    p_end_date: end_date || new Date().toISOString().split('T')[0],
    p_outlet_id: outlet_id || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /summary — cost variance summary
router.get('/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { start_date, end_date, outlet_id } = req.query as Record<string, string>;

  const { data, error } = await supabaseAdmin.rpc('compute_cost_variance_summary', {
    p_start_date: start_date || new Date().toISOString().split('T')[0],
    p_end_date: end_date || new Date().toISOString().split('T')[0],
    p_outlet_id: outlet_id || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0] || {
    theoretical_total: 0,
    actual_total: 0,
    variance_amount: 0,
    variance_percent: 0,
    actual_revenue: 0,
    actual_food_cost_percent: 0,
    theoretical_food_cost_percent: 0,
  });
});

export default router;
