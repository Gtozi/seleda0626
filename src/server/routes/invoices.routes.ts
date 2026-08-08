import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// List all invoice documents with their folio, reservation and payments
// Used by the Folio & Billing "Invoice & Payment History" sub-tab.
router.get('/', authenticate, async (req, res) => {
  const { startDate, endDate, status, invoiceType, search } = req.query;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    let query = supabaseAdmin
      .from('invoice_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('issue_date', String(startDate));
    }
    if (endDate) {
      query = query.lte('issue_date', String(endDate));
    }
    if (status) {
      query = query.eq('status', String(status));
    }
    if (invoiceType) {
      query = query.eq('invoice_type', String(invoiceType));
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Error fetching invoice history:', error);
      return res.status(500).json({ error: 'Failed to fetch invoices', details: error.message });
    }

    // Enrich each invoice with its folio, reservation and payments
    const enriched = await Promise.all(
      (invoices || []).map(async (invoice) => {
        const sa = supabaseAdmin!;

        const { data: folio } = await sa
          .from('folios')
          .select('id, reservation_id, folio_type, status')
          .eq('id', invoice.folio_id)
          .single();

        let reservation: any = null;
        if (folio?.reservation_id) {
          const { data: res } = await sa
            .from('reservations')
            .select('id, guest_name, guest_email, room_number, check_in_date, check_out_date')
            .eq('id', folio.reservation_id)
            .single();
          reservation = res;
        }

        const { data: payments } = await sa
          .from('folio_payments')
          .select('id, payment_date, amount, payment_method, reference_number, is_voided, voided_at, bank_account_id')
          .eq('invoice_id', invoice.id)
          .order('payment_date', { ascending: false });

        let bankAccount: any = null;
        const bankIds = Array.from(new Set((payments || []).map((p: any) => p.bank_account_id).filter(Boolean)));
        if (bankIds.length === 1) {
          const { data: bank } = await sa
            .from('bank_accounts')
            .select('id, account_name, account_number, bank_name')
            .eq('id', bankIds[0])
            .single();
          bankAccount = bank;
        }

        return {
          ...invoice,
          folios: folio,
          reservations: reservation,
          payments: payments || [],
          bank_accounts: bankAccount
        };
      })
    );

    // Client-side search across invoice number, guest name, room number, reference
    let filtered = enriched;
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(s) ||
        inv.customer_name?.toLowerCase().includes(s) ||
        inv.reservations?.guest_name?.toLowerCase().includes(s) ||
        inv.reservations?.room_number?.toLowerCase().includes(s) ||
        (inv.payments || []).some((p: any) => p.reference_number?.toLowerCase().includes(s))
      );
    }

    return res.json({ invoices: filtered });
  } catch (err: any) {
    console.error('Unexpected error fetching invoice history:', err);
    return res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
  }
});

// Get a single invoice document with full folio and payment details for preview/print
router.get('/:invoiceId', authenticate, async (req, res) => {
  const { invoiceId } = req.params;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // Fetch invoice document
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoice_documents')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Fetch associated folio
    const { data: folio } = await supabaseAdmin
      .from('folios')
      .select('id, reservation_id, folio_type, status')
      .eq('id', invoice.folio_id)
      .single();

    // Fetch associated reservation
    let reservation = null;
    if (folio?.reservation_id) {
      const { data: res } = await supabaseAdmin
        .from('reservations')
        .select('id, guest_name, guest_email, guest_tin, guest_vat_no, room_number, check_in_date, check_out_date')
        .eq('id', folio.reservation_id)
        .single();
      reservation = res;
    }

    // Fetch folio lines (itemized charges)
    const { data: lines, error: linesError } = await supabaseAdmin
      .from('folio_lines')
      .select('id, line_number, transaction_date, description, amount, quantity, unit_price, line_type, is_voided')
      .eq('folio_id', invoice.folio_id)
      .eq('is_voided', false)
      .order('line_number', { ascending: true });

    if (linesError) {
      console.error('Error fetching folio lines for invoice:', linesError);
    }

    // Fetch payments linked to this invoice
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('folio_payments')
      .select('id, payment_date, payment_method, amount, reference_number, is_voided')
      .eq('invoice_id', invoiceId)
      .eq('is_voided', false)
      .order('payment_date', { ascending: true });

    if (paymentsError) {
      console.error('Error fetching payments for invoice:', paymentsError);
    }

    return res.json({
      invoice,
      folio,
      reservation,
      lines: lines || [],
      payments: payments || []
    });
  } catch (err: any) {
    console.error('Unexpected error fetching invoice:', err);
    return res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
  }
});

export default router;
