import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// Get loyalty transaction history for a guest
router.get('/transactions/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { guestId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('loyalty_transactions')
    .select('*')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ transactions: data || [] });
});

// Accrue loyalty points (called automatically on checkout or manually)
router.post('/accrue', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { guest_id, points, reservation_id, description, reference_type, reference_id } = req.body;
  if (!guest_id || !points || points <= 0) {
    return res.status(400).json({ error: 'guest_id and positive points are required' });
  }
  const { data, error } = await supabaseAdmin.rpc('accrue_loyalty_points', {
    p_guest_id: guest_id,
    p_points: Math.floor(points),
    p_reservation_id: reservation_id || null,
    p_description: description || 'Loyalty accrual on checkout',
    p_reference_type: reference_type || 'checkout',
    p_reference_id: reference_id || null,
    p_created_by: req.user?.id || null,
  });
  if (error) return res.status(500).json({ error: error.message });
  const result = data && data[0];
  res.json({ success: true, newBalance: result?.new_balance ?? 0 });
});

// Redeem loyalty points
router.post('/redeem', authenticate, requirePermission('reservation:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { guest_id, points, description, reference_id } = req.body;
  if (!guest_id || !points || points <= 0) {
    return res.status(400).json({ error: 'guest_id and positive points are required' });
  }
  const { data, error } = await supabaseAdmin.rpc('redeem_loyalty_points', {
    p_guest_id: guest_id,
    p_points: Math.floor(points),
    p_description: description || 'Loyalty redemption',
    p_reference_id: reference_id || null,
    p_created_by: req.user?.id || null,
  });
  if (error) return res.status(500).json({ error: error.message });
  const result = data && data[0];
  if (!result?.success) {
    return res.status(400).json({ error: 'Insufficient loyalty points', balance: result?.new_balance ?? 0 });
  }
  res.json({ success: true, newBalance: result.new_balance });
});

export default router;
