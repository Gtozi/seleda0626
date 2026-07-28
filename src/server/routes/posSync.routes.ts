/**
 * Unified POS Sync Routes
 * Phase 3 Item 4: Unified offline POS sync monitoring & management
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// GET /queue — list sync queue items with optional filters
router.get('/queue', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, status, operation_type, limit = '100' } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('pos_sync_queue')
    .select('*')
    .order('client_created_at', { ascending: false })
    .limit(Number(limit));

  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  if (status) q = q.eq('sync_status', status);
  if (operation_type) q = q.eq('operation_type', operation_type);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// POST /queue — queue a transaction/operation for sync
router.post('/queue', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { transaction_id, outlet_id, terminal_id, device_id, operation_type, payload, client_created_at } = req.body || {};

  if (!transaction_id || !outlet_id || !payload) {
    return res.status(400).json({ error: 'transaction_id, outlet_id, and payload are required' });
  }

  // Dedup check
  const { data: existing } = await supabaseAdmin
    .from('pos_sync_queue')
    .select('id, sync_status')
    .eq('transaction_id', transaction_id)
    .single();

  if (existing) {
    return res.json({ id: existing.id, sync_status: existing.sync_status, message: 'Transaction already queued' });
  }

  const { data, error } = await supabaseAdmin.from('pos_sync_queue').insert({
    transaction_id,
    outlet_id,
    terminal_id: terminal_id || null,
    device_id: device_id || null,
    operation_type: operation_type || 'transaction',
    payload,
    sync_status: 'pending',
    client_created_at: client_created_at || new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ id: data.id, sync_status: data.sync_status });
});

// GET /status — sync status summary for a terminal or outlet
router.get('/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, terminal_id, device_id } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('pos_sync_queue')
    .select('id, transaction_id, sync_status, sync_attempts, last_sync_error, synced_at, client_created_at, operation_type');

  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  if (terminal_id) q = q.eq('terminal_id', terminal_id);
  if (device_id) q = q.eq('device_id', device_id);

  const { data, error } = await q.order('client_created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });

  const summary = {
    total: data?.length || 0,
    pending: data?.filter(q => q.sync_status === 'pending').length || 0,
    synced: data?.filter(q => q.sync_status === 'synced').length || 0,
    failed: data?.filter(q => q.sync_status === 'failed').length || 0,
    conflict: data?.filter(q => q.sync_status === 'conflict').length || 0,
  };

  return res.json({ queue: data || [], summary });
});

// GET /unified-status — aggregated sync status by outlet and operation type
router.get('/unified-status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { data, error } = await supabaseAdmin
    .from('unified_sync_status')
    .select('*')
    .order('outlet_name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /health — sync health summary per outlet
router.get('/health', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { data, error } = await supabaseAdmin
    .from('sync_health_summary')
    .select('*')
    .order('outlet_name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// POST /flush — flush pending queue items into pos_transactions
router.post('/flush', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, limit = 50 } = req.body || {};

  let q = supabaseAdmin
    .from('pos_sync_queue')
    .select('*')
    .eq('sync_status', 'pending')
    .order('client_created_at', { ascending: true })
    .limit(Number(limit));

  if (outlet_id) q = q.eq('outlet_id', outlet_id);

  const { data: pendingItems, error: fetchError } = await q;
  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!pendingItems || pendingItems.length === 0) {
    return res.json({ message: 'No pending transactions to sync', synced: 0, failed: 0, conflict: 0, results: [] });
  }

  const results: any[] = [];
  let syncedCount = 0;
  let failedCount = 0;
  let conflictCount = 0;

  for (const item of pendingItems) {
    try {
      const p = item.payload;
      const opType = item.operation_type || 'transaction';

      if (opType === 'transaction') {
        // Check for duplicate
        const { data: existingTxn } = await supabaseAdmin
          .from('pos_transactions')
          .select('id, status')
          .eq('id', p.id || item.transaction_id)
          .single();

        if (existingTxn) {
          await supabaseAdmin.from('pos_sync_queue').update({
            sync_status: 'conflict',
            sync_attempts: item.sync_attempts + 1,
            last_sync_error: 'Transaction already exists in pos_transactions',
            synced_at: new Date().toISOString(),
          }).eq('id', item.id);
          conflictCount++;
          results.push({ transaction_id: item.transaction_id, status: 'conflict' });
          continue;
        }

        // Get outlet config
        const { data: outlet } = await supabaseAdmin
          .from('pos_outlets')
          .select('tax_profile_id, gl_mapping_id, inventory_mode')
          .eq('id', item.outlet_id)
          .single();

        let invoice = p.invoice_number;
        if (!invoice) {
          const { data: invoiceData } = await supabaseAdmin.rpc('next_pos_invoice_number');
          invoice = invoiceData;
        }

        const { data: txn, error: insertError } = await supabaseAdmin.from('pos_transactions').insert({
          outlet_id: item.outlet_id,
          terminal_id: item.terminal_id || p.terminal_id,
          invoice_number: invoice,
          transaction_date: p.transaction_date || item.client_created_at,
          business_date: (p.business_date || item.client_created_at || new Date().toISOString()).split('T')[0],
          cashier_id: p.cashier_id,
          cashier_name: p.cashier_name,
          customer_type: p.customer_type || 'walk_in',
          reservation_id: p.reservation_id,
          room_number: p.room_number,
          guest_name: p.guest_name,
          line_items: p.line_items || [],
          subtotal: p.subtotal || 0,
          discount_amount: p.discount_amount || 0,
          discount_percent: p.discount_percent || 0,
          service_charge_amount: p.service_charge_amount || 0,
          tax_amount: p.tax_amount || 0,
          additional_tax_amount: p.additional_tax_amount || 0,
          total_amount: p.total_amount || 0,
          payment_method: p.payment_method || 'cash',
          split_payments: p.split_payments,
          room_charge_details: p.room_charge_details,
          tax_profile_id: outlet?.tax_profile_id,
          gl_mapping_id: outlet?.gl_mapping_id,
          inventory_mode: outlet?.inventory_mode || 'sku',
          inventory_deducted: false,
          shift_id: p.shift_id,
          status: 'completed',
          metadata: { sync_source: 'offline_queue', sync_queue_id: item.id, device_id: item.device_id },
        }).select().single();

        if (insertError) {
          await supabaseAdmin.from('pos_sync_queue').update({
            sync_status: 'failed',
            sync_attempts: item.sync_attempts + 1,
            last_sync_error: insertError.message,
          }).eq('id', item.id);
          failedCount++;
          results.push({ transaction_id: item.transaction_id, status: 'failed', error: insertError.message });
          continue;
        }

        // Mark synced
        await supabaseAdmin.from('pos_sync_queue').update({
          sync_status: 'synced',
          synced_at: new Date().toISOString(),
        }).eq('id', item.id);

        // Async inventory deduction
        if (outlet?.inventory_mode && p.line_items) {
          (async () => {
            try {
              await supabaseAdmin.rpc('deduct_outlet_inventory', {
                p_outlet_id: item.outlet_id,
                p_line_items: p.line_items,
                p_inventory_mode: outlet.inventory_mode,
                p_reference_doc: invoice,
                p_reference_type: 'pos_sale',
              });
              await supabaseAdmin.from('pos_transactions').update({ inventory_deducted: true }).eq('id', txn.id);
            } catch (err) {
              console.error('Inventory deduction failed for synced txn:', err);
            }
          })();
        }

        syncedCount++;
        results.push({ transaction_id: item.transaction_id, status: 'synced', pos_transaction_id: txn.id });
      } else if (opType === 'void') {
        // Handle void operation
        const { error: voidError } = await supabaseAdmin.from('pos_transactions')
          .update({ status: 'voided', void_reason: p.void_reason, voided_by: p.voided_by, voided_at: new Date().toISOString() })
          .eq('id', p.transaction_id);

        if (voidError) {
          await supabaseAdmin.from('pos_sync_queue').update({
            sync_status: 'failed', sync_attempts: item.sync_attempts + 1, last_sync_error: voidError.message,
          }).eq('id', item.id);
          failedCount++;
          results.push({ transaction_id: item.transaction_id, status: 'failed', error: voidError.message });
          continue;
        }

        await supabaseAdmin.from('pos_sync_queue').update({ sync_status: 'synced', synced_at: new Date().toISOString() }).eq('id', item.id);
        syncedCount++;
        results.push({ transaction_id: item.transaction_id, status: 'synced' });
      } else {
        // Unknown operation type — mark as failed
        await supabaseAdmin.from('pos_sync_queue').update({
          sync_status: 'failed', sync_attempts: item.sync_attempts + 1,
          last_sync_error: `Unknown operation_type: ${opType}`,
        }).eq('id', item.id);
        failedCount++;
        results.push({ transaction_id: item.transaction_id, status: 'failed', error: `Unknown operation_type: ${opType}` });
      }
    } catch (err: any) {
      await supabaseAdmin.from('pos_sync_queue').update({
        sync_status: 'failed', sync_attempts: item.sync_attempts + 1, last_sync_error: err.message,
      }).eq('id', item.id);
      failedCount++;
      results.push({ transaction_id: item.transaction_id, status: 'failed', error: err.message });
    }
  }

  cacheService.invalidatePattern('pos:*');
  return res.json({ synced: syncedCount, failed: failedCount, conflict: conflictCount, results });
});

// POST /retry-failed — retry failed sync items
router.post('/retry-failed', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.body || {};

  let q = supabaseAdmin.from('pos_sync_queue').update({ sync_status: 'pending', last_sync_error: null })
    .eq('sync_status', 'failed');
  if (outlet_id) q = q.eq('outlet_id', outlet_id);

  const { data, error } = await q.select();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, retried: data?.length || 0 });
});

export default router;
