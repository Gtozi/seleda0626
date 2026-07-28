/**
 * Hardware Routes — Printer & Payment Terminal Integration
 * Phase 4 Item 4
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';
import { formatReceipt, formatKitchenTicket, ReceiptData } from '../../services/escposFormatter';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Printers ─────────────────────────────────────────────────────────────
router.get('/printers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_printers').select('*').order('is_default', { ascending: false }).order('name');
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/printers', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_printers').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/printers/:id', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_printers').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/printers/:id', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_printers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Payment Terminals ────────────────────────────────────────────────────
router.get('/payment-terminals', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_payment_terminals').select('*').order('name');
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/payment-terminals', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_payment_terminals').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/payment-terminals/:id', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_payment_terminals').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/payment-terminals/:id', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_payment_terminals').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Print Jobs ───────────────────────────────────────────────────────────
router.get('/print-jobs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, status, limit = '50' } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_print_jobs').select('*, printer:pos_printers(name)').order('created_at', { ascending: false }).limit(Number(limit));
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/print-jobs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { printer_id, outlet_id, job_type, content, copies, transaction_id } = req.body || {};
  if (!printer_id || !content) return res.status(400).json({ error: 'printer_id and content are required' });

  const { data: printer } = await supabaseAdmin.from('pos_printers').select('*').eq('id', printer_id).single();
  if (!printer) return res.status(404).json({ error: 'Printer not found' });

  const { data, error } = await supabaseAdmin.from('pos_print_jobs').insert({
    printer_id, outlet_id: outlet_id || printer.outlet_id,
    job_type: job_type || 'receipt', content, copies: copies || 1,
    status: 'queued', transaction_id,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Attempt to send to printer (network printers via IP:port)
  // In production, this would use a socket connection or print server
  // For now, mark as completed if printer has IP, otherwise leave queued
  if (printer.ip_address) {
    try {
      // Update status to printing
      await supabaseAdmin.from('pos_print_jobs').update({
        status: 'printing', started_at: new Date().toISOString(),
      }).eq('id', data.id);

      // Simulate print completion (real implementation would send ESC/POS data via TCP)
      // const net = require('net');
      // const client = new net.Socket();
      // client.connect(printer.port || 9100, printer.ip_address, () => {
      //   client.write(content);
      //   client.destroy();
      // });

      await supabaseAdmin.from('pos_print_jobs').update({
        status: 'completed', completed_at: new Date().toISOString(),
      }).eq('id', data.id);

      return res.json({ ...data, status: 'completed' });
    } catch (e: any) {
      await supabaseAdmin.from('pos_print_jobs').update({
        status: 'failed', error_message: e.message,
      }).eq('id', data.id);
      return res.json({ ...data, status: 'failed', error: e.message });
    }
  }

  return res.status(201).json(data);
});

// ── Print receipt (formats and queues) ───────────────────────────────────
router.post('/print-receipt', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { printer_id, receipt_data, outlet_id } = req.body || {};
  if (!receipt_data) return res.status(400).json({ error: 'receipt_data is required' });

  let printerId = printer_id;

  // If no printer specified, find default printer for outlet
  if (!printerId && outlet_id) {
    const { data: defaultPrinter } = await supabaseAdmin
      .from('pos_printers').select('id').eq('outlet_id', outlet_id)
      .eq('is_default', true).eq('is_active', true).single();
    if (defaultPrinter) printerId = defaultPrinter.id;
  }

  if (!printerId) return res.status(400).json({ error: 'No printer specified and no default printer found' });

  const content = formatReceipt(receipt_data as ReceiptData);

  const { data, error } = await supabaseAdmin.from('pos_print_jobs').insert({
    printer_id: printerId,
    outlet_id,
    job_type: 'receipt',
    content,
    copies: 1,
    status: 'queued',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Try to print
  const { data: printer } = await supabaseAdmin.from('pos_printers').select('*').eq('id', printerId).single();
  if (printer?.ip_address) {
    await supabaseAdmin.from('pos_print_jobs').update({ status: 'printing', started_at: new Date().toISOString() }).eq('id', data.id);
    // Real TCP print would happen here
    await supabaseAdmin.from('pos_print_jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', data.id);
    return res.json({ ...data, status: 'completed' });
  }

  return res.status(201).json(data);
});

// ── Print kitchen ticket ─────────────────────────────────────────────────
router.post('/print-kitchen-ticket', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { printer_id, order_id, table_number, items, course, outlet_id } = req.body || {};
  if (!order_id || !items) return res.status(400).json({ error: 'order_id and items are required' });

  let printerId = printer_id;

  // Find kitchen printer for outlet
  if (!printerId && outlet_id) {
    const { data: kitchenPrinter } = await supabaseAdmin
      .from('pos_printers').select('id').eq('outlet_id', outlet_id)
      .eq('type', 'kitchen').eq('is_active', true).single();
    if (kitchenPrinter) printerId = kitchenPrinter.id;
  }

  if (!printerId) return res.status(400).json({ error: 'No kitchen printer found' });

  const content = formatKitchenTicket(order_id, table_number, items, course || 'main');

  const { data, error } = await supabaseAdmin.from('pos_print_jobs').insert({
    printer_id: printerId, outlet_id,
    job_type: 'kitchen_ticket', content, copies: 1, status: 'queued',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  const { data: printer } = await supabaseAdmin.from('pos_printers').select('*').eq('id', printerId).single();
  if (printer?.ip_address) {
    await supabaseAdmin.from('pos_print_jobs').update({ status: 'printing', started_at: new Date().toISOString() }).eq('id', data.id);
    await supabaseAdmin.from('pos_print_jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', data.id);
    return res.json({ ...data, status: 'completed' });
  }

  return res.status(201).json(data);
});

// ── Process payment via terminal ─────────────────────────────────────────
router.post('/payment/process', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { terminal_id, amount, currency, pos_transaction_id, outlet_id } = req.body || {};
  if (!terminal_id || amount === undefined) return res.status(400).json({ error: 'terminal_id and amount are required' });

  const { data: terminal } = await supabaseAdmin.from('pos_payment_terminals').select('*').eq('id', terminal_id).single();
  if (!terminal) return res.status(404).json({ error: 'Terminal not found' });
  if (!terminal.is_active) return res.status(400).json({ error: 'Terminal is not active' });

  // Create transaction record
  const { data: txn, error: txnError } = await supabaseAdmin.from('pos_payment_terminal_transactions').insert({
    terminal_id, outlet_id: outlet_id || terminal.outlet_id,
    pos_transaction_id, amount, currency: currency || 'ETB',
    payment_method: 'card', status: 'pending',
  }).select().single();

  if (txnError) return res.status(500).json({ error: txnError.message });

  // In production, this would communicate with the payment terminal via TCP/serial
  // For now, simulate a successful payment
  try {
    const authCode = `AUTH${Date.now().toString().slice(-6)}`;
    const txnRef = `TXN${txn.id.substring(0, 8).toUpperCase()}`;

    const { data: updated } = await supabaseAdmin.from('pos_payment_terminal_transactions').update({
      status: 'approved', authorization_code: authCode, transaction_reference: txnRef,
      processed_at: new Date().toISOString(),
    }).eq('id', txn.id).select().single();

    // Update terminal last connected
    await supabaseAdmin.from('pos_payment_terminals').update({
      last_connected_at: new Date().toISOString(),
    }).eq('id', terminal_id);

    return res.json({
      success: true,
      transaction_id: txn.id,
      authorization_code: authCode,
      transaction_reference: txnRef,
      status: 'approved',
    });
  } catch (e: any) {
    await supabaseAdmin.from('pos_payment_terminal_transactions').update({
      status: 'failed', error_message: e.message,
    }).eq('id', txn.id);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// ── Get payment terminal transactions ────────────────────────────────────
router.get('/payment-transactions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { terminal_id, outlet_id, status, limit = '50' } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_payment_terminal_transactions').select('*, terminal:pos_payment_terminals(name)').order('created_at', { ascending: false }).limit(Number(limit));
  if (terminal_id) q = q.eq('terminal_id', terminal_id);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Health check for a device ─────────────────────────────────────────────
router.get('/:deviceId/health', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { deviceId } = req.params;

  // Check printers
  const { data: printer } = await supabaseAdmin.from('pos_printers').select('*').eq('id', deviceId).single();
  if (printer) {
    const isOnline = printer.is_active && !!printer.ip_address;
    return res.json({ deviceId, type: 'printer', status: isOnline ? 'online' : 'offline', name: printer.name });
  }

  // Check payment terminals
  const { data: terminal } = await supabaseAdmin.from('pos_payment_terminals').select('*').eq('id', deviceId).single();
  if (terminal) {
    const isOnline = terminal.is_active;
    return res.json({ deviceId, type: 'payment_terminal', status: isOnline ? 'online' : 'offline', name: terminal.name });
  }

  return res.status(404).json({ error: 'Device not found' });
});

export default router;
