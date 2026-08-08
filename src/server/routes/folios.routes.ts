import { Router } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// Generate invoice for a folio and link payments
router.post('/:folioId/generate-invoice', authenticate, async (req, res) => {
  const { folioId } = req.params;
  const { invoiceType, dueDate, notes } = req.body;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // Get folio details
    const { data: folio, error: folioError } = await supabaseAdmin
      .from('folios')
      .select('*, reservations(*)')
      .eq('id', folioId)
      .single();

    if (folioError || !folio) {
      return res.status(404).json({ error: 'Folio not found' });
    }

    const reservation = folio.reservations;
    if (!reservation) {
      return res.status(400).json({ error: 'Folio has no associated reservation' });
    }

    // Calculate folio totals
    const { data: folioTotals } = await supabaseAdmin.rpc('recompute_folio_totals', {
      p_folio_id: folioId
    });

    const subtotal = folioTotals?.total_charges || 0;
    const totalPayments = folioTotals?.total_payments || 0;
    const balance = folioTotals?.folio_balance || 0;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create invoice document
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoice_documents')
      .insert({
        id: crypto.randomUUID(),
        folio_id: folioId,
        invoice_number: invoiceNumber,
        invoice_type: invoiceType === 'Group Master' ? 'Group Master' : 'Guest',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate || null,
        subtotal: subtotal,
        tax_total: 0, // TODO: Calculate from folio lines
        discount_total: 0, // TODO: Calculate from folio lines
        total: subtotal,
        amount_paid: totalPayments,
        status: balance <= 0 ? 'Paid' : 'Issued',
        customer_name: reservation.guest_name,
        customer_email: reservation.guest_email || null,
        customer_address: null,
        customer_tin: reservation.guest_tin || null,
        customer_vat_no: reservation.guest_vat_no || null,
        hotel_tin: null, // TODO: Get from global settings
        hotel_vat_no: null, // TODO: Get from global settings
        hotel_vat_date: null, // TODO: Get from global settings
        payment_terms: 'Net 30',
        notes: notes || null,
        is_voided: false,
        created_by: req.user?.id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return res.status(500).json({ error: 'Failed to create invoice', details: invoiceError.message });
    }

    // Link payments to the invoice
    const { data: linkResult, error: linkError } = await supabaseAdmin.rpc('link_payments_to_invoice', {
      p_invoice_id: invoice.id,
      p_folio_id: folioId
    });

    if (linkError) {
      console.error('Error linking payments to invoice:', linkError);
      // Don't fail the whole operation if linking fails, just log it
    }

    return res.json({
      success: true,
      invoice: invoice,
      paymentsLinked: linkResult?.paymentsLinked || 0
    });
  } catch (err: any) {
    console.error('[generate-invoice] UNEXPECTED ERROR:', err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
  }
});

// List invoices for a folio
router.get('/:folioId/invoices', authenticate, async (req, res) => {
  const { folioId } = req.params;
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('invoice_documents')
      .select('id, invoice_number, invoice_type, issue_date, due_date, subtotal, tax_total, discount_total, total, amount_paid, status, is_voided, created_at')
      .eq('folio_id', folioId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ invoices: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
  }
});

// Close folio with automatic invoice generation
router.post('/:folioId/close-with-invoice', authenticate, async (req, res) => {
  const { folioId } = req.params;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('close_folio_with_invoice', {
      p_folio_id: folioId,
      p_user_id: req.user?.id
    });

    if (error) {
      console.error('Error closing folio with invoice:', error);
      return res.status(500).json({ error: 'Failed to close folio', details: error.message });
    }

    return res.json(data);
  } catch (err: any) {
    console.error('Unexpected error closing folio:', err);
    return res.status(500).json({ error: 'Failed to close folio', details: err.message });
  }
});

// Get folios by reservation ID
router.get('/', authenticate, async (req, res) => {
  const { reservation_id } = req.query;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // Join reservations so the list view has guest_name / room_number without
    // a second round-trip. Selecting a nested object keeps the row shape flat
    // for callers that ignore the join.
    let query = supabaseAdmin
      .from('folios')
      .select('*, reservations(guest_name, room_number, check_in_date, check_out_date)');

    if (reservation_id) {
      query = query.eq('reservation_id', reservation_id);
    }

    query = query.order('opened_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching folios:', error);
      return res.status(500).json({ error: 'Failed to fetch folios', details: error.message });
    }

    return res.json({ folios: data || [] });
  } catch (err: any) {
    console.error('Unexpected error fetching folios:', err);
    return res.status(500).json({ error: 'Failed to fetch folios', details: err.message });
  }
});

// Move a folio line to a different folio
router.post('/folio-lines/:lineId/move', authenticate, async (req, res) => {

  const { lineId } = req.params;
  const { targetFolioId } = req.body;

  if (!targetFolioId) return res.status(400).json({ error: 'targetFolioId is required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
      p_line_id: lineId,
      p_target_folio_id: targetFolioId,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

    return res.json({ success: true, lineId, fromFolio: data.fromFolio, toFolio: data.toFolio });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Folio payments audit
router.get('/folio-payments/audit', authenticate, async (req, res) => {
  const { startDate, endDate, paymentMethod, search } = req.query;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // Simple query without complex joins first
    let query = supabaseAdmin
      .from('folio_payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching folio payments audit:', error);
      return res.status(500).json({ error: 'Failed to fetch folio payments', details: error.message });
    }

    // Fetch folio details for each payment
    const paymentsWithDetails = await Promise.all(
      (data || []).map(async (payment) => {
        const sa = supabaseAdmin!;
        const { data: folio } = await sa
          .from('folios')
          .select('reservation_id, folio_type, status')
          .eq('id', payment.folio_id)
          .single();

        let reservation = null;
        if (folio?.reservation_id) {
          const { data: res } = await sa
            .from('reservations')
            .select('id, guest_name, room_number, check_in_date, check_out_date')
            .eq('id', folio.reservation_id)
            .single();
          reservation = res;
        }

        // Fetch invoice details if payment is linked to an invoice
        let invoice = null;
        if (payment.invoice_id) {
          const { data: inv } = await sa
            .from('invoice_documents')
            .select('id, invoice_number, invoice_type, issue_date, total, status')
            .eq('id', payment.invoice_id)
            .single();
          invoice = inv;
        }

        // Fetch bank account details if payment has a bank account
        let bankAccount = null;
        if (payment.bank_account_id) {
          const { data: bank } = await sa
            .from('bank_accounts')
            .select('id, account_name, account_number, bank_name')
            .eq('id', payment.bank_account_id)
            .single();
          bankAccount = bank;
        }

        return {
          ...payment,
          folios: folio,
          reservations: reservation,
          invoice_documents: invoice,
          bank_accounts: bankAccount
        };
      })
    );

    // Client-side filtering for search
    let filteredPayments = paymentsWithDetails || [];
    if (search) {
      const searchLower = String(search).toLowerCase();
      filteredPayments = filteredPayments.filter(p =>
        (p.reservations?.guest_name?.toLowerCase().includes(searchLower)) ||
        (p.reservations?.room_number?.toLowerCase().includes(searchLower)) ||
        (p.reference_number?.toLowerCase().includes(searchLower))
      );
    }

    return res.json({ payments: filteredPayments });
  } catch (err: any) {
    console.error('Unexpected error fetching folio payments:', err);
    return res.status(500).json({ error: 'Failed to fetch folio payments', details: err.message });
  }
});

export default router;
