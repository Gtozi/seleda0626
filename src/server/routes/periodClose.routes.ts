import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Accounting Periods ─────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('accounting_periods').select('*').order('period_start', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/', authenticate, requirePermission('finance:period:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { periodName, periodStart, periodEnd, notes } = req.body || {};
  if (!periodName || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodName, periodStart and periodEnd are required' });
  }

  const { data, error } = await supabaseAdmin.from('accounting_periods').insert({
    period_name: periodName,
    period_start: periodStart,
    period_end: periodEnd,
    notes,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post('/:id/close', authenticate, requirePermission('finance:period:close'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { notes } = req.body || {};
  const closedBy = (req as any).user?.id;

  const { data, error } = await supabaseAdmin.rpc('close_accounting_period', {
    p_period_id: req.params.id,
    p_closed_by: closedBy,
    p_notes: notes,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

router.post('/:id/reopen', authenticate, requirePermission('finance:period:reopen'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { data, error } = await supabaseAdmin.rpc('reopen_accounting_period', {
    p_period_id: req.params.id,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

export default router;
