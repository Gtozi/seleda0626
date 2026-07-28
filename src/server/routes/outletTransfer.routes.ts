/**
 * Outlet Transfer Routes
 * Phase 3 Item 2: Cross-outlet transfer workflow
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

function generateTransferNumber(prefix: string) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

// GET / — list outlet transfers, optionally filtered by outlet and direction
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, status, direction = 'both' } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('outlet_transfers')
    .select('*, from_outlet:pos_outlets!outlet_transfers_from_outlet_id_fkey(name), to_outlet:pos_outlets!outlet_transfers_to_outlet_id_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (outlet_id) {
    if (direction === 'from') {
      q = q.eq('from_outlet_id', outlet_id);
    } else if (direction === 'to') {
      q = q.eq('to_outlet_id', outlet_id);
    } else {
      q = q.or(`from_outlet_id.eq.${outlet_id},to_outlet_id.eq.${outlet_id}`);
    }
  }
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// POST / — create a new cross-outlet transfer
router.post('/', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const {
    from_outlet_id, to_outlet_id, from_location_id, to_location_id,
    item_source, item_id, item_name, quantity, unit, unit_cost,
    transfer_type, priority, requested_by, notes,
  } = req.body;

  if (!to_outlet_id || !item_id || !item_name || quantity === undefined || !unit) {
    return res.status(400).json({ error: 'to_outlet_id, item_id, item_name, quantity, and unit are required' });
  }

  const transfer_number = generateTransferNumber('OTR');
  const total_cost = (Number(unit_cost) || 0) * Number(quantity);

  const { data, error } = await supabaseAdmin
    .from('outlet_transfers')
    .insert({
      transfer_number,
      from_outlet_id: from_outlet_id || null,
      to_outlet_id,
      from_location_id: from_location_id || null,
      to_location_id: to_location_id || null,
      item_source: item_source || 'core',
      item_id,
      item_name,
      quantity,
      unit,
      unit_cost: Number(unit_cost) || 0,
      total_cost,
      transfer_type: transfer_type || 'requisition',
      priority: priority || 'normal',
      requested_by: requested_by || null,
      notes: notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, id: data.id, transfer_number });
});

// POST /:id/approve — approve a pending transfer
router.post('/:id/approve', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const { approved_by } = req.body;

  const { data: transfer, error: fetchError } = await supabaseAdmin
    .from('outlet_transfers')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !transfer) return res.status(404).json({ error: 'Transfer not found' });
  if (transfer.status !== 'pending') return res.status(400).json({ error: 'Transfer is not pending' });

  const { error } = await supabaseAdmin
    .from('outlet_transfers')
    .update({
      status: 'approved',
      approved_by,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  // Record stock_transaction for core items
  if (transfer.item_source === 'core' && transfer.from_location_id) {
    await supabaseAdmin.from('stock_transactions').insert({
      ingredient_id: transfer.item_id,
      location_id: transfer.from_location_id,
      transaction_type: 'Transfer',
      quantity: -Math.abs(Number(transfer.quantity)),
      unit: transfer.unit,
      cost_per_unit: Number(transfer.unit_cost) || 0,
      total_value: Number(transfer.total_cost) || 0,
      reference_doc: transfer.id,
      reference_type: 'outlet_transfer',
      notes: `Transfer ${transfer.transfer_number} approved — outbound`,
    });
  }
  if (transfer.item_source === 'core' && transfer.to_location_id) {
    await supabaseAdmin.from('stock_transactions').insert({
      ingredient_id: transfer.item_id,
      location_id: transfer.to_location_id,
      transaction_type: 'Transfer',
      quantity: Math.abs(Number(transfer.quantity)),
      unit: transfer.unit,
      cost_per_unit: Number(transfer.unit_cost) || 0,
      total_value: Number(transfer.total_cost) || 0,
      reference_doc: transfer.id,
      reference_type: 'outlet_transfer',
      notes: `Transfer ${transfer.transfer_number} approved — inbound`,
    });
  }

  return res.json({ success: true });
});

// POST /:id/receive — mark an approved transfer as received/completed
router.post('/:id/receive', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const { received_by } = req.body;

  const { data: transfer, error: fetchError } = await supabaseAdmin
    .from('outlet_transfers')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !transfer) return res.status(404).json({ error: 'Transfer not found' });
  if (!['approved', 'in_transit'].includes(transfer.status)) {
    return res.status(400).json({ error: 'Transfer must be approved or in transit' });
  }

  const { error } = await supabaseAdmin
    .from('outlet_transfers')
    .update({
      status: 'completed',
      received_by,
      received_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// POST /:id/cancel — cancel a transfer
router.post('/:id/cancel', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const { reason } = req.body;

  const { data: transfer, error: fetchError } = await supabaseAdmin
    .from('outlet_transfers')
    .select('status')
    .eq('id', id)
    .single();
  if (fetchError || !transfer) return res.status(404).json({ error: 'Transfer not found' });
  if (transfer.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed transfer' });

  const { error } = await supabaseAdmin
    .from('outlet_transfers')
    .update({
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// GET /history — unified transfer history across all transfer tables
router.get('/history', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, limit = '100' } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('unified_transfer_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (outlet_id) {
    q = q.or(`from_outlet_id.eq.${outlet_id},to_outlet_id.eq.${outlet_id}`);
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

export default router;
