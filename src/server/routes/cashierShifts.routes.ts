import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';

const router = Router();

// ------------------------------------------------------------------
// Cashier Shifts API — consolidated from the former Cashiering tab.
// Shifts track per-cashier float, expected balance (opening float +
// cash payments - cash refunds) and variance on close.
// ------------------------------------------------------------------

// List cashier shifts (optionally filtered by status)
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    let query = supabaseAdmin
      .from('cashier_shifts')
      .select('*')
      .order('opened_at', { ascending: false });

    const { status } = req.query;
    if (status) query = query.eq('status', String(status));

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching cashier shifts:', error);
      return res.status(500).json({ error: 'Failed to fetch cashier shifts', details: error.message });
    }

    // Enrich open shifts with live cash payment totals + running expected balance
    const shifts = data || [];
    const openShifts = shifts.filter((s: any) => s.status === 'open');
    if (openShifts.length > 0) {
      for (const shift of openShifts) {
        try {
          const { data: shiftPays } = await supabaseAdmin
            .from('folio_payments')
            .select('amount, is_refund, is_voided')
            .eq('shift_id', shift.id)
            .in('payment_method', ['cash', 'Cash']);
          const valid = (shiftPays || []).filter((p: any) => !p.is_voided);
          const cashIn = valid.filter((p: any) => !p.is_refund).reduce((s: number, p: any) => s + Number(p.amount), 0);
          const cashOut = valid.filter((p: any) => p.is_refund).reduce((s: number, p: any) => s + Number(p.amount), 0);
          shift.cash_payments_total = cashIn;
          shift.cash_refunds_total = cashOut;
          shift.payment_count = valid.length;
          shift.expected_balance = Number(shift.opening_float) + cashIn - cashOut;
        } catch { /* ignore — leave defaults */ }
      }
    }

    return res.json({ shifts });
  } catch (err: any) {
    console.error('Unexpected error fetching cashier shifts:', err);
    return res.status(500).json({ error: 'Failed to fetch cashier shifts', details: err.message });
  }
});

// Open a new cashier shift
router.post('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    const openingFloat = Number(req.body?.openingFloat ?? 0);
    if (Number.isNaN(openingFloat) || openingFloat < 0) {
      return res.status(400).json({ error: 'openingFloat must be a non-negative number' });
    }

    // Prevent a second open shift for the same cashier
    const cashierUserId = req.user?.id || null;
    const cashierName = req.user?.name || req.user?.email || req.user?.username || 'Cashier';

    if (cashierUserId) {
      const { data: existing } = await supabaseAdmin
        .from('cashier_shifts')
        .select('id')
        .eq('cashier_user_id', cashierUserId)
        .eq('status', 'open')
        .maybeSingle();
      if (existing) {
        return res.status(409).json({ error: 'You already have an open cashier shift. Close it before opening a new one.' });
      }
    }

    const shiftId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('cashier_shifts')
      .insert({
        id: shiftId,
        cashier_user_id: cashierUserId,
        cashier_name: cashierName,
        status: 'open',
        opening_float: openingFloat,
        expected_balance: openingFloat, // updated as payments are posted
        open_notes: req.body?.notes || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error opening cashier shift:', error);
      return res.status(500).json({ error: 'Failed to open cashier shift', details: error.message });
    }

    await writeAuditEvent({ req, user: req.user!, action: 'cashier_shift.opened', module: 'finance', details: { shiftId, openingFloat } });
    return res.status(201).json({ shift: data });
  } catch (err: any) {
    console.error('Unexpected error opening cashier shift:', err);
    return res.status(500).json({ error: 'Failed to open cashier shift', details: err.message });
  }
});

// Close a cashier shift — accepts actualBalance, computes variance and status
router.patch('/:id/close', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    const shiftId = req.params.id;
    const actualBalance = Number(req.body?.actualBalance ?? 0);
    const closingFloat = req.body?.closingFloat !== undefined ? Number(req.body.closingFloat) : actualBalance;
    if (Number.isNaN(actualBalance)) {
      return res.status(400).json({ error: 'actualBalance must be a number' });
    }

    // Fetch the shift to verify it exists and is open
    const { data: shift, error: fetchErr } = await supabaseAdmin
      .from('cashier_shifts')
      .select('*')
      .eq('id', shiftId)
      .maybeSingle();
    if (fetchErr) {
      console.error('Error fetching cashier shift for close:', fetchErr);
      return res.status(500).json({ error: 'Failed to fetch cashier shift', details: fetchErr.message });
    }
    if (!shift) return res.status(404).json({ error: 'Cashier shift not found' });
    if (shift.status !== 'open') return res.status(409).json({ error: `Shift is already ${shift.status}` });

    // Recalculate expected balance from cash payments linked to this shift
    const { data: payments, error: payErr } = await supabaseAdmin
      .from('folio_payments')
      .select('amount, is_refund, is_voided')
      .eq('shift_id', shiftId)
      .in('payment_method', ['cash', 'Cash']);
    if (payErr) console.error('Warning: could not fetch shift payments for expected balance:', payErr);

    const validPayments = (payments || []).filter((p: any) => !p.is_voided);
    const cashPaymentsTotal = validPayments.filter((p: any) => !p.is_refund).reduce((s: number, p: any) => s + Number(p.amount), 0);
    const cashRefundsTotal = validPayments.filter((p: any) => p.is_refund).reduce((s: number, p: any) => s + Number(p.amount), 0);
    const expectedBalance = Number(shift.opening_float) + cashPaymentsTotal - cashRefundsTotal;
    const variance = actualBalance - expectedBalance;
    const status = Math.abs(variance) < 0.005 ? 'balanced' : variance > 0 ? 'over' : 'short';

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('cashier_shifts')
      .update({
        status,
        closed_at: new Date().toISOString(),
        closing_float: closingFloat,
        actual_balance: actualBalance,
        expected_balance: expectedBalance,
        cash_payments_total: cashPaymentsTotal,
        cash_refunds_total: cashRefundsTotal,
        payment_count: validPayments.length,
        close_notes: req.body?.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shiftId)
      .select('*')
      .single();

    if (updateErr) {
      console.error('Error closing cashier shift:', updateErr);
      return res.status(500).json({ error: 'Failed to close cashier shift', details: updateErr.message });
    }

    await writeAuditEvent({
      req,
      user: req.user!,
      action: 'cashier_shift.closed',
      module: 'finance',
      details: { shiftId, status, expectedBalance, actualBalance, variance },
    });
    return res.json({ shift: updated });
  } catch (err: any) {
    console.error('Unexpected error closing cashier shift:', err);
    return res.status(500).json({ error: 'Failed to close cashier shift', details: err.message });
  }
});

export default router;
