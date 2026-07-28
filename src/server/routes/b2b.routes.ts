import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// ═══════════════════════════════════════════════════════════
// B2B ROUTES — Tour Operators
// ═══════════════════════════════════════════════════════════
router.get('/operators', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('tour_operators').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/operators', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('tour_operators').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
router.put('/operators/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('tour_operators').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Allotments ────────────────────────────────────────────────
router.get('/allotments', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { operator_id, from_date, to_date } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('allotments').select('*, tour_operators(name,code), room_types(name)').order('stay_date');
  if (operator_id) q = q.eq('operator_id', operator_id);
  if (from_date)   q = q.gte('stay_date', from_date);
  if (to_date)     q = q.lte('stay_date', to_date);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/allotments', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('allotments').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
router.post('/allotments/release-expired', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.rpc('release_expired_allotments');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ released: data });
});

// ── Operator Contracts ────────────────────────────────────────
router.get('/contracts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { operator_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('operator_contracts').select('*, tour_operators(name,code), room_types(name)').order('valid_from', { ascending: false });
  if (operator_id) q = q.eq('operator_id', operator_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/contracts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('operator_contracts').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
router.put('/contracts/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('operator_contracts').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Vouchers ──────────────────────────────────────────────────
router.get('/vouchers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { operator_id, status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('vouchers').select('*, tour_operators(name,code), room_types(name)').order('issued_at', { ascending: false });
  if (operator_id) q = q.eq('operator_id', operator_id);
  if (status)      q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/vouchers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('vouchers').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
router.post('/vouchers/redeem', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { voucher_no, reservation_id } = req.body || {};
  if (!voucher_no) return res.status(400).json({ error: 'voucher_no is required' });

  // Preview mode: return the voucher value without redeeming it.
  if (!reservation_id) {
    const { data: voucher, error: voucherError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('voucher_no', voucher_no)
      .single();
    if (voucherError || !voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.status !== 'issued') return res.status(409).json({ error: `Voucher is ${voucher.status}` });
    if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) return res.status(409).json({ error: 'Voucher expired' });
    return res.json({
      ...voucher,
      discount_amount: Number(voucher.net_value) || 0,
    });
  }

  const { data, error } = await supabaseAdmin.rpc('redeem_voucher', {
    p_voucher_no: voucher_no, p_reservation_id: reservation_id,
    p_redeemed_by: req.user!.name || req.user!.email || 'staff'
  });
  if (error) {
    const msg: string = error.message || '';
    if (msg.includes('VOUCHER_')) return res.status(409).json({ error: msg });
    return res.status(500).json({ error: msg });
  }
  return res.json({
    ...data,
    discount_amount: Number((data as any).net_value) || 0,
  });
});

// ── Accounts Receivable Ledger ────────────────────────────────
router.get('/ar-ledger', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { operator_id, reconciled } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('ar_ledger').select('*, tour_operators(name,code)').order('posting_date', { ascending: false }).limit(500);
  if (operator_id) q = q.eq('operator_id', operator_id);
  if (reconciled !== undefined) q = q.eq('is_reconciled', reconciled === 'true');
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/ar-ledger', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('ar_ledger').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
router.post('/ar-ledger/reconcile/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data, error } = await supabaseAdmin.from('ar_ledger').update({ is_reconciled: true, reconciled_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
router.post('/ar-ledger/post-folio', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { folio_id, due_date } = req.body || {};
  if (!folio_id || !due_date) return res.status(400).json({ error: 'folio_id and due_date required' });
  const { data, error } = await supabaseAdmin.rpc('post_folio_to_ar', { p_folio_id: folio_id, p_due_date: due_date });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ar_entry_id: data });
});

export default router;
