import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Vendors ─────────────────────────────────────────────────────
router.get('/vendors', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/vendors', authenticate, requirePermission('finance:vendor:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { name, contactName, email, phone, address, taxId, withholdingRate, category } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Vendor name is required' });

  const { data, error } = await supabaseAdmin.from('vendors').insert({
    name,
    contact_name: contactName || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    tax_id: taxId || null,
    withholding_rate: withholdingRate || 0,
    category: category || 'Operations',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Bills ───────────────────────────────────────────────────────
router.get('/bills', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, vendor_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('ap_bills').select('*, vendors(name)').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (vendor_id) q = q.eq('vendor_id', vendor_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/bills', authenticate, requirePermission('finance:bill:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { vendorId, invoiceNumber, invoiceDate, dueDate, category, amount, taxAmount, withholdingAmount, lines } = req.body || {};
  if (!vendorId || !invoiceNumber || !invoiceDate || !dueDate || amount === undefined) {
    return res.status(400).json({ error: 'vendorId, invoiceNumber, invoiceDate, dueDate and amount are required' });
  }

  const netPayable = Number(amount) + Number(taxAmount || 0) - Number(withholdingAmount || 0);
  const id = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const { data: bill, error } = await supabaseAdmin.from('ap_bills').insert({
    id,
    vendor_id: vendorId,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    due_date: dueDate,
    category: category || null,
    amount: Number(amount),
    tax_amount: Number(taxAmount || 0),
    withholding_amount: Number(withholdingAmount || 0),
    net_payable: netPayable,
    amount_due: netPayable,
    status: 'Pending',
    lines: lines || [],
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Update vendor balance
  const { error: vendorError } = await supabaseAdmin.rpc('increment_vendor_balance', {
    p_vendor_id: vendorId,
    p_delta: netPayable,
  });
  if (vendorError) console.error('Error updating vendor balance:', vendorError);

  return res.status(201).json(bill);
});

// ── Payments ──────────────────────────────────────────────────────
router.get('/payments', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('ap_payments')
    .select('*, ap_bills(invoice_number), vendors(name)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/bills/:id/pay', authenticate, requirePermission('finance:payment:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { amount, paymentDate, paymentMethod, reference } = req.body || {};
  if (!amount || !paymentDate) {
    return res.status(400).json({ error: 'amount and paymentDate are required' });
  }

  const { data, error } = await supabaseAdmin.rpc('record_ap_payment', {
    p_bill_id: req.params.id,
    p_amount: Number(amount),
    p_payment_date: paymentDate,
    p_payment_method: paymentMethod || 'Bank Transfer',
    p_reference: reference || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

export default router;
