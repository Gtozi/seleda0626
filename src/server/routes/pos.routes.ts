import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Offline Transaction Sync ───────────────────────────────────────
// Receive offline transactions from POS for sync
router.post('/sync/transactions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { transactions, deviceId } = req.body || {};
  
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }

  const results: any[] = [];
  const conflicts: any[] = [];

  for (const tx of transactions) {
    try {
      // Check for duplicate invoice_number
      if (tx.invoice_number) {
        const { data: existing } = await supabaseAdmin
          .from('pos_transactions')
          .select('id, invoice_number')
          .eq('invoice_number', tx.invoice_number)
          .single();

        if (existing) {
          conflicts.push({
            transactionId: tx.invoice_number,
            clientData: tx,
            serverData: existing,
            conflictType: 'duplicate_invoice',
          });
          continue;
        }
      }

      // Get outlet config for tax/GL references
      const { data: outlet } = await supabaseAdmin
        .from('pos_outlets')
        .select('tax_profile_id, gl_mapping_id, inventory_mode')
        .eq('id', tx.outlet_id)
        .single();

      // Insert transaction using canonical schema
      const { data, error } = await supabaseAdmin
        .from('pos_transactions')
        .insert({
          outlet_id: tx.outlet_id,
          terminal_id: tx.terminal_id || null,
          invoice_number: tx.invoice_number,
          transaction_date: tx.transaction_date || new Date().toISOString(),
          business_date: tx.business_date || new Date().toISOString().split('T')[0],
          cashier_id: tx.cashier_id,
          cashier_name: tx.cashier_name || 'Offline Sync',
          customer_type: tx.customer_type || 'walk_in',
          reservation_id: tx.reservation_id || null,
          room_number: tx.room_number || null,
          guest_name: tx.guest_name || null,
          line_items: tx.line_items || [],
          subtotal: tx.subtotal || 0,
          discount_amount: tx.discount_amount || 0,
          discount_percent: tx.discount_percent || 0,
          service_charge_amount: tx.service_charge_amount || 0,
          tax_amount: tx.tax_amount || 0,
          additional_tax_amount: tx.additional_tax_amount || 0,
          total_amount: tx.total_amount || 0,
          payment_method: tx.payment_method || 'cash',
          split_payments: tx.split_payments || null,
          room_charge_details: tx.room_charge_details || null,
          tax_profile_id: outlet?.tax_profile_id || null,
          gl_mapping_id: outlet?.gl_mapping_id || null,
          inventory_mode: outlet?.inventory_mode || 'sku',
          inventory_deducted: false,
          shift_id: tx.shift_id || null,
          status: 'completed',
          metadata: { deviceId, synced_at: new Date().toISOString() },
        })
        .select()
        .single();

      if (error) {
        results.push({ transactionId: tx.invoice_number || tx.outlet_id, success: false, error: error.message });
      } else {
        // Trigger inventory deduction (async)
        if (outlet?.inventory_mode && tx.line_items) {
          (async () => {
            try {
              await supabaseAdmin.rpc('deduct_outlet_inventory', {
                p_outlet_id: tx.outlet_id,
                p_line_items: tx.line_items,
                p_inventory_mode: outlet.inventory_mode,
                p_reference_doc: tx.invoice_number,
                p_reference_type: 'pos_sale'
              });
              await supabaseAdmin
                .from('pos_transactions')
                .update({ inventory_deducted: true })
                .eq('id', data.id);
            } catch (err) {
              console.error('Inventory deduction failed:', err);
            }
          })();
        }
        results.push({ transactionId: data.id, success: true, data });
      }
    } catch (error: any) {
      results.push({ transactionId: 'unknown', success: false, error: error.message });
    }
  }

  // Invalidate POS cache
  cacheService.invalidatePattern('pos:*');

  return res.json({
    success: true,
    synced: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    conflictCount: conflicts.length,
    results,
    conflicts,
  });
});

// Resolve sync conflict
router.post('/sync/conflicts/:id/resolve', authenticate, requirePermission('pos:sync:resolve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { strategy, resolutionData } = req.body || {};
  
  if (!strategy || !['server-wins', 'client-wins', 'merge'].includes(strategy)) {
    return res.status(400).json({ error: 'strategy must be server-wins, client-wins, or merge' });
  }

  let result;
  
  switch (strategy) {
    case 'server-wins':
      result = { action: 'kept_server', transactionId: req.params.id };
      break;
      
    case 'client-wins':
      if (!resolutionData) {
        return res.status(400).json({ error: 'resolutionData required for client-wins strategy' });
      }
      const { error: updateError } = await supabaseAdmin
        .from('pos_transactions')
        .update({
          line_items: resolutionData.line_items || [],
          subtotal: resolutionData.subtotal || 0,
          total_amount: resolutionData.total_amount || 0,
          payment_method: resolutionData.payment_method || 'cash',
          metadata: { ...resolutionData.metadata, conflict_resolved: true, resolved_at: new Date().toISOString() },
        })
        .eq('id', req.params.id);
      
      if (updateError) return res.status(500).json({ error: updateError.message });
      result = { action: 'overwrote_with_client', transactionId: req.params.id };
      break;
      
    case 'merge':
      result = { action: 'merged', transactionId: req.params.id };
      break;
  }

  return res.json({ success: true, result });
});

// ── Inventory Sync ─────────────────────────────────────────────────
// Get inventory levels for offline caching
router.get('/inventory/sync', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { lastSync } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('inventory')
    .select('id, product_id, quantity, location, updated_at')
    .order('updated_at', { ascending: false });
  
  if (lastSync) {
    q = q.gt('updated_at', lastSync);
  }
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    timestamp: new Date().toISOString(),
    inventory: data || [],
  });
});

// Validate inventory offline (with cached levels)
router.post('/inventory/validate-offline', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { items, cachedLevels } = req.body || {};
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const validationResults = [];

  for (const item of items) {
    const cached = cachedLevels?.[item.productId];
    const isValid = cached !== undefined && cached >= item.quantity;
    
    validationResults.push({
      productId: item.productId,
      required: item.quantity,
      cached,
      isValid,
      status: isValid ? 'valid' : 'insufficient',
    });
  }

  const allValid = validationResults.every(r => r.isValid);

  return res.json({
    valid: allValid,
    results: validationResults,
  });
});

// ── Hardware Integration ─────────────────────────────────────────
// Register printer
router.post('/hardware/printers', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { name, type, station, ipAddress } = req.body || {};
  
  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' });
  }

  const { data, error } = await supabaseAdmin.from('pos_printers').insert({
    name,
    type,
    station,
    ip_address: ipAddress,
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get all printers
router.get('/hardware/printers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type, station } = req.query as Record<string, string>;
  
  let q = supabaseAdmin.from('pos_printers').select('*').order('name');
  if (type) q = q.eq('type', type);
  if (station) q = q.eq('station', station);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// Register payment terminal
router.post('/hardware/payment-terminals', authenticate, requirePermission('pos:hardware:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type, model, serialNumber } = req.body || {};
  
  if (!type || !model) {
    return res.status(400).json({ error: 'type and model are required' });
  }

  const { data, error } = await supabaseAdmin.from('pos_payment_terminals').insert({
    type,
    model,
    serial_number: serialNumber,
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get all payment terminals
router.get('/hardware/payment-terminals', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type } = req.query as Record<string, string>;
  
  let q = supabaseAdmin.from('pos_payment_terminals').select('*').order('model');
  if (type) q = q.eq('type', type);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// ── Kitchen Display System ───────────────────────────────────────
// Send order to KDS — multi-station ticket splitting (§4.2)
// Items with different prep_station_id values create separate KDS tickets,
// all sharing the same order_id as correlation key.
router.post('/kds/orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { orderId, items, tableNumber, priority, station, outlet_id, station_id, order_type, customer_name, course_group, notes } = req.body || {};

  if (!orderId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'orderId and items array are required' });
  }

  // Resolve default station for outlet (fallback for items without explicit station)
  let defaultStationId = station_id;
  if (!defaultStationId && station) {
    const { data: stationData } = await supabaseAdmin
      .from('pos_prep_stations')
      .select('id')
      .ilike('station_name', station)
      .limit(1)
      .single();
    if (stationData) defaultStationId = stationData.id;
  }
  if (!defaultStationId && outlet_id) {
    const { data: link } = await supabaseAdmin
      .from('pos_outlet_prep_stations')
      .select('station_id')
      .eq('outlet_id', outlet_id)
      .limit(1)
      .single();
    if (link) defaultStationId = link.station_id;
  }

  // Group items by their prep_station_id (or default station)
  const itemsByStation = new Map<string, any[]>();
  for (const item of items) {
    const itemStationId = item.prep_station_id || item.station_id || defaultStationId;
    if (!itemsByStation.has(itemStationId)) itemsByStation.set(itemStationId, []);
    itemsByStation.get(itemStationId)!.push(item);
  }

  // If no station grouping at all, create one ticket with all items
  if (itemsByStation.size === 0) {
    itemsByStation.set(defaultStationId || '', items);
  }

  // Create one KDS ticket per station
  const createdTickets: any[] = [];
  for (const [stId, stationItems] of itemsByStation.entries()) {
    // Get target prep time from station
    let targetPrepTime = 15;
    if (stId) {
      const { data: st } = await supabaseAdmin
        .from('pos_prep_stations')
        .select('target_prep_time_minutes')
        .eq('id', stId)
        .single();
      if (st) targetPrepTime = st.target_prep_time_minutes;
    }

    // Station-level KDS resolution: try (outlet, station) first, fall back to (outlet, NULL)
    let kdsInstanceId: string | null = null;
    if (outlet_id && stId) {
      const { data: stationConn } = await supabaseAdmin
        .from('kds_pos_connections')
        .select('kds_instance_id')
        .eq('outlet_id', outlet_id)
        .eq('prep_station_id', stId)
        .eq('is_active', true)
        .order('priority_weight', { ascending: false })
        .limit(1)
        .single();
      if (stationConn) kdsInstanceId = stationConn.kds_instance_id;
    }
    if (!kdsInstanceId && outlet_id) {
      const { data: catchAllConn } = await supabaseAdmin
        .from('kds_pos_connections')
        .select('kds_instance_id')
        .eq('outlet_id', outlet_id)
        .is('prep_station_id', null)
        .eq('is_active', true)
        .order('priority_weight', { ascending: false })
        .limit(1)
        .single();
      if (catchAllConn) kdsInstanceId = catchAllConn.kds_instance_id;
    }

    const { data, error } = await supabaseAdmin.from('kds_orders').insert({
      order_id: orderId,
      outlet_id: outlet_id || null,
      station_id: stId || null,
      kds_instance_id: kdsInstanceId,
      table_number: tableNumber,
      customer_name,
      order_type: order_type || 'dine_in',
      items: stationItems,
      course_group: course_group || 'main',
      priority: priority || 'normal',
      status: 'fired',
      fired_at: new Date().toISOString(),
      target_prep_time_minutes: targetPrepTime,
      notes,
    }).select().single();

    if (error) {
      // If some tickets were already created, return partial success
      if (createdTickets.length > 0) {
        cacheService.invalidatePattern('kds:*');
        return res.status(207).json({ tickets: createdTickets, error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    createdTickets.push(data);
  }

  // Invalidate KDS cache
  cacheService.invalidatePattern('kds:*');

  return res.status(201).json(createdTickets.length === 1 ? createdTickets[0] : { tickets: createdTickets });
});

// Get KDS orders for station
router.get('/kds/orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { station_id, status } = req.query as Record<string, string>;
  
  const cacheKey = `kds-orders:${station_id || 'all'}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('kds_orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (station_id) q = q.eq('station_id', station_id);
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    orders: data || [],
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 1000); // 30 second TTL for real-time data
  return res.json(result);
});

// Update KDS order status
router.put('/kds/orders/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { status, bumped_by, recalled_reason } = req.body || {};

  const validStatuses = ['fired', 'in_progress', 'ready', 'served', 'recalled', 'voided'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'in_progress') updates.in_progress_at = new Date().toISOString();
  if (status === 'ready') updates.ready_at = new Date().toISOString();
  if (status === 'served') {
    updates.served_at = new Date().toISOString();
    if (bumped_by) updates.bumped_by = bumped_by;
  }
  if (status === 'recalled') {
    updates.recalled_at = new Date().toISOString();
    if (recalled_reason) updates.recalled_reason = recalled_reason;
  }

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate KDS cache
  cacheService.invalidatePattern('kds:*');

  return res.json(data);
});

// ── Barcode Scanner ───────────────────────────────────────────────
// Lookup product by barcode
router.get('/products/barcode/:barcode', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('barcode', req.params.barcode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// ── POS Outlet Management ───────────────────────────────────────────
// Get all POS outlets
router.get('/outlets', authenticate, requirePermission('pos_settings:read'), async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('pos_outlets')
    .select('*')
    .order('name');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ outlets: data || [] });
});

// Create POS outlet (with Outlet Registry framework fields)
router.post('/outlets', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { 
    name, outlet_type, code, description, location, store_location, 
    default_tax_rate, default_service_charge,
    inventory_mode, charge_modes, tax_profile_id, gl_mapping_id,
    requires_guest_link, shift_reconciliation_required, outlet_status,
    outlet_category, requires_kds
  } = req.body || {};
  
  if (!name || !outlet_type || !code) {
    return res.status(400).json({ error: 'name, outlet_type, and code are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_outlets').insert({
    name,
    outlet_type,
    code,
    description,
    location,
    store_location: store_location || 'Main Store',
    default_tax_rate: default_tax_rate || 15,
    default_service_charge: default_service_charge || 10,
    is_active: true,
    operating_hours: {},
    // Outlet Registry framework fields
    inventory_mode: inventory_mode || 'sku',
    charge_modes: charge_modes || '["cash","card","room_folio","mobile_money"]',
    tax_profile_id,
    gl_mapping_id,
    requires_guest_link: requires_guest_link || false,
    shift_reconciliation_required: shift_reconciliation_required !== undefined ? shift_reconciliation_required : true,
    outlet_status: outlet_status || 'active',
    outlet_category: outlet_category || 'Other',
    requires_kds: requires_kds || false
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Invalidate POS cache
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

// Update POS outlet (with Outlet Registry framework fields)
router.put('/outlets/:outletId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outletId } = req.params;
  const { 
    name, outlet_type, code, description, location, store_location, 
    default_tax_rate, default_service_charge, is_active, operating_hours,
    inventory_mode, charge_modes, tax_profile_id, gl_mapping_id,
    requires_guest_link, shift_reconciliation_required, outlet_status,
    outlet_category, requires_kds
  } = req.body || {};
  
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (outlet_type !== undefined) updates.outlet_type = outlet_type;
  if (code !== undefined) updates.code = code;
  if (description !== undefined) updates.description = description;
  if (location !== undefined) updates.location = location;
  if (store_location !== undefined) updates.store_location = store_location;
  if (default_tax_rate !== undefined) updates.default_tax_rate = default_tax_rate;
  if (default_service_charge !== undefined) updates.default_service_charge = default_service_charge;
  if (is_active !== undefined) updates.is_active = is_active;
  if (operating_hours !== undefined) updates.operating_hours = operating_hours;
  // Outlet Registry framework fields
  if (inventory_mode !== undefined) updates.inventory_mode = inventory_mode;
  if (charge_modes !== undefined) updates.charge_modes = charge_modes;
  if (tax_profile_id !== undefined) updates.tax_profile_id = tax_profile_id;
  if (gl_mapping_id !== undefined) updates.gl_mapping_id = gl_mapping_id;
  if (requires_guest_link !== undefined) updates.requires_guest_link = requires_guest_link;
  if (shift_reconciliation_required !== undefined) updates.shift_reconciliation_required = shift_reconciliation_required;
  if (outlet_status !== undefined) updates.outlet_status = outlet_status;
  if (outlet_category !== undefined) updates.outlet_category = outlet_category;
  if (requires_kds !== undefined) updates.requires_kds = requires_kds;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_outlets')
    .update(updates)
    .eq('id', outletId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Invalidate POS cache
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

// Get users assigned to an outlet
router.get('/outlets/:outletId/users', authenticate, requirePermission('pos_settings:read'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outletId } = req.params;
  
  const { data, error } = await supabaseAdmin
    .from('pos_outlet_roles')
    .select('*')
    .eq('outlet_id', outletId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  if (!data || data.length === 0) {
    return res.json({ users: [] });
  }
  
  // Fetch matching system_users by auth_user_id
  const authUserIds = data.map((r: any) => r.user_id).filter(Boolean);
  const { data: sysUsers } = await supabaseAdmin
    .from('system_users')
    .select('id, name, email, auth_user_id')
    .in('auth_user_id', authUserIds);
  
  const userMap = new Map((sysUsers || []).map((u: any) => [u.auth_user_id, u]));
  const enriched = data.map((r: any) => ({
    ...r,
    user: userMap.get(r.user_id) ? {
      id: userMap.get(r.user_id).id,
      email: userMap.get(r.user_id).email,
      name: userMap.get(r.user_id).name,
    } : null,
  }));
  
  return res.json({ users: enriched });
});

// Assign user to outlet role
router.post('/outlets/:outletId/roles', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outletId } = req.params;
  const { user_id, role, is_primary, permissions } = req.body || {};
  
  if (!user_id || !role) {
    return res.status(400).json({ error: 'user_id and role are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_outlet_roles').insert({
    user_id,
    outlet_id: outletId,
    role,
    is_primary: is_primary || false,
    permissions: permissions || {},
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Invalidate POS cache
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

// Update outlet role (permissions, role, is_primary)
router.patch('/outlets/:outletId/roles/:roleId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outletId, roleId } = req.params;
  const updates: Record<string, any> = {};
  
  if (req.body.role !== undefined) updates.role = req.body.role;
  if (req.body.is_primary !== undefined) updates.is_primary = req.body.is_primary;
  if (req.body.permissions !== undefined) updates.permissions = req.body.permissions;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_outlet_roles')
    .update(updates)
    .eq('id', roleId)
    .eq('outlet_id', outletId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

// Remove user from outlet role
router.delete('/outlets/:outletId/roles/:userId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outletId, userId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_outlet_roles')
    .delete()
    .eq('outlet_id', outletId)
    .eq('user_id', userId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Invalidate POS cache
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── POS Tax Profiles CRUD ──────────────────────────────────────────────
router.get('/tax-profiles', authenticate, requirePermission('pos_settings:read'), async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('pos_tax_profiles')
    .select('*')
    .order('name');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ profiles: data || [] });
});

router.post('/tax-profiles', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { name, description, vat_rate, service_charge_rate, is_vat_exempt, is_service_charge_exempt, additional_tax_rules } = req.body || {};
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_tax_profiles').insert({
    name,
    description,
    vat_rate: vat_rate || 15.00,
    service_charge_rate: service_charge_rate || 10.00,
    is_vat_exempt: is_vat_exempt || false,
    is_service_charge_exempt: is_service_charge_exempt || false,
    additional_tax_rules: additional_tax_rules || '[]',
    is_active: true
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/tax-profiles/:profileId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { profileId } = req.params;
  const updates: Record<string, any> = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.vat_rate !== undefined) updates.vat_rate = req.body.vat_rate;
  if (req.body.service_charge_rate !== undefined) updates.service_charge_rate = req.body.service_charge_rate;
  if (req.body.is_vat_exempt !== undefined) updates.is_vat_exempt = req.body.is_vat_exempt;
  if (req.body.is_service_charge_exempt !== undefined) updates.is_service_charge_exempt = req.body.is_service_charge_exempt;
  if (req.body.additional_tax_rules !== undefined) updates.additional_tax_rules = req.body.additional_tax_rules;
  if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_tax_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

router.delete('/tax-profiles/:profileId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { profileId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_tax_profiles')
    .delete()
    .eq('id', profileId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── POS GL Mappings CRUD ───────────────────────────────────────────────
router.get('/gl-mappings', authenticate, requirePermission('pos_settings:read'), async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('pos_gl_mappings')
    .select('*')
    .order('name');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ mappings: data || [] });
});

router.post('/gl-mappings', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { name, description, revenue_account_code, cogs_account_code, vat_account_code, service_charge_account_code, cash_account_code, ar_account_code } = req.body || {};
  
  if (!name || !revenue_account_code) {
    return res.status(400).json({ error: 'name and revenue_account_code are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_gl_mappings').insert({
    name,
    description,
    revenue_account_code,
    cogs_account_code,
    vat_account_code: vat_account_code || '2020',
    service_charge_account_code,
    cash_account_code: cash_account_code || '1010',
    ar_account_code: ar_account_code || '1100',
    is_active: true
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/gl-mappings/:mappingId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { mappingId } = req.params;
  const updates: Record<string, any> = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.revenue_account_code !== undefined) updates.revenue_account_code = req.body.revenue_account_code;
  if (req.body.cogs_account_code !== undefined) updates.cogs_account_code = req.body.cogs_account_code;
  if (req.body.vat_account_code !== undefined) updates.vat_account_code = req.body.vat_account_code;
  if (req.body.service_charge_account_code !== undefined) updates.service_charge_account_code = req.body.service_charge_account_code;
  if (req.body.cash_account_code !== undefined) updates.cash_account_code = req.body.cash_account_code;
  if (req.body.ar_account_code !== undefined) updates.ar_account_code = req.body.ar_account_code;
  if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_gl_mappings')
    .update(updates)
    .eq('id', mappingId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

router.delete('/gl-mappings/:mappingId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { mappingId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_gl_mappings')
    .delete()
    .eq('id', mappingId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── POS Terminals CRUD ─────────────────────────────────────────────────
router.get('/terminals', authenticate, requirePermission('pos_settings:read'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id } = req.query;
  
  let query = supabaseAdmin
    .from('pos_terminals')
    .select('*');
  
  if (outlet_id) {
    query = query.eq('outlet_id', outlet_id);
  }
  
  const { data, error } = await query.order('terminal_name');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ terminals: data || [] });
});

router.post('/terminals', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, device_id, terminal_name, terminal_type, hardware_model, ip_address, printer_station, settings } = req.body || {};
  
  if (!outlet_id || !device_id || !terminal_name) {
    return res.status(400).json({ error: 'outlet_id, device_id, and terminal_name are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_terminals').insert({
    outlet_id,
    device_id,
    terminal_name,
    terminal_type: terminal_type || 'standard',
    hardware_model,
    ip_address,
    printer_station,
    settings: settings || '{}',
    is_active: true
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/terminals/:terminalId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { terminalId } = req.params;
  const updates: Record<string, any> = {};
  
  if (req.body.terminal_name !== undefined) updates.terminal_name = req.body.terminal_name;
  if (req.body.terminal_type !== undefined) updates.terminal_type = req.body.terminal_type;
  if (req.body.hardware_model !== undefined) updates.hardware_model = req.body.hardware_model;
  if (req.body.ip_address !== undefined) updates.ip_address = req.body.ip_address;
  if (req.body.printer_station !== undefined) updates.printer_station = req.body.printer_station;
  if (req.body.settings !== undefined) updates.settings = req.body.settings;
  if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
  if (req.body.last_seen_at !== undefined) updates.last_seen_at = req.body.last_seen_at;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_terminals')
    .update(updates)
    .eq('id', terminalId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

router.delete('/terminals/:terminalId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { terminalId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_terminals')
    .delete()
    .eq('id', terminalId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── Tax Calculation Endpoint (Phase 2: Tax Profile Engine) ──────────────
// POS terminals call this to get tax estimates before posting a transaction
router.post('/tax-calculate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { outlet_id, subtotal, discount_amount, line_items } = req.body || {};

  if (!outlet_id || subtotal === undefined) {
    return res.status(400).json({ error: 'outlet_id and subtotal are required' });
  }

  const { data: outlet } = await supabaseAdmin
    .from('pos_outlets')
    .select('tax_profile_id, default_tax_rate, default_service_charge')
    .eq('id', outlet_id)
    .single();

  if (!outlet) return res.status(404).json({ error: 'Outlet not found' });

  let vatRate = outlet.default_tax_rate || 15;
  let serviceChargeRate = outlet.default_service_charge || 10;
  let isVatExempt = false;
  let isServiceChargeExempt = false;
  let additionalTaxRules: any[] = [];

  if (outlet.tax_profile_id) {
    const { data: taxProfile } = await supabaseAdmin
      .from('pos_tax_profiles')
      .select('*')
      .eq('id', outlet.tax_profile_id)
      .single();

    if (taxProfile) {
      vatRate = Number(taxProfile.vat_rate);
      serviceChargeRate = Number(taxProfile.service_charge_rate);
      isVatExempt = taxProfile.is_vat_exempt;
      isServiceChargeExempt = taxProfile.is_service_charge_exempt;
      additionalTaxRules = typeof taxProfile.additional_tax_rules === 'string'
        ? JSON.parse(taxProfile.additional_tax_rules)
        : (taxProfile.additional_tax_rules || []);
    }
  }

  const baseSubtotal = Number(subtotal);
  const discount = Number(discount_amount || 0);
  const baseAfterDiscount = baseSubtotal - discount;

  const vatAmount = isVatExempt ? 0 : Math.round(baseAfterDiscount * vatRate / 100 * 100) / 100;
  const serviceChargeAmount = isServiceChargeExempt ? 0 : Math.round(baseAfterDiscount * serviceChargeRate / 100 * 100) / 100;

  let additionalTaxTotal = 0;
  const additionalTaxBreakdown = additionalTaxRules.map((rule: any) => {
    const base = rule.applies_to === 'total' ? baseAfterDiscount + vatAmount : baseAfterDiscount;
    const amount = Math.round(Number(base) * Number(rule.rate) / 100 * 100) / 100;
    additionalTaxTotal += amount;
    return { name: rule.name, rate: Number(rule.rate), amount, applies_to: rule.applies_to || 'subtotal' };
  });

  const totalAmount = baseAfterDiscount + vatAmount + serviceChargeAmount + additionalTaxTotal;

  return res.json({
    outlet_id,
    subtotal: baseSubtotal,
    discount_amount: discount,
    taxable_base: baseAfterDiscount,
    vat: { rate: vatRate, amount: vatAmount, exempt: isVatExempt },
    service_charge: { rate: serviceChargeRate, amount: serviceChargeAmount, exempt: isServiceChargeExempt },
    additional_taxes: { breakdown: additionalTaxBreakdown, total: additionalTaxTotal },
    total_amount: totalAmount,
    line_items: line_items || [],
  });
});

// ── POS Unified Transactions ───────────────────────────────────────────
router.post('/transactions', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { 
    outlet_id, terminal_id, invoice_number, cashier_id, cashier_name,
    customer_type, reservation_id, room_number, guest_name,
    line_items, subtotal, discount_amount, discount_percent,
    service_charge_amount, tax_amount, additional_tax_amount, total_amount,
    payment_method, split_payments, room_charge_details,
    client_name, client_tin, client_vat_no, client_vat_date,
    shift_id
  } = req.body || {};
  
  if (!outlet_id || !cashier_id || !cashier_name || !line_items || !total_amount) {
    return res.status(400).json({ error: 'outlet_id, cashier_id, cashier_name, line_items, and total_amount are required' });
  }
  
  // Get outlet configuration for tax/GL references
  const { data: outlet } = await supabaseAdmin
    .from('pos_outlets')
    .select('tax_profile_id, gl_mapping_id, inventory_mode')
    .eq('id', outlet_id)
    .single();
  
  // ── Tax Profile Engine (Phase 2: ERCA compliance) ──
  // Fetch the tax profile and compute taxes server-side if not provided by client
  let computedTaxAmount = tax_amount;
  let computedServiceCharge = service_charge_amount;
  let computedAdditionalTax = additional_tax_amount;

  if (outlet?.tax_profile_id) {
    const { data: taxProfile } = await supabaseAdmin
      .from('pos_tax_profiles')
      .select('*')
      .eq('id', outlet.tax_profile_id)
      .single();

    if (taxProfile) {
      const baseSubtotal = subtotal || 0;
      const baseAfterDiscount = baseSubtotal - (discount_amount || 0);

      // Compute VAT if not exempt
      if (!taxProfile.is_vat_exempt && !tax_amount) {
        computedTaxAmount = Math.round(baseAfterDiscount * Number(taxProfile.vat_rate) / 100 * 100) / 100;
      }

      // Compute service charge if not exempt
      if (!taxProfile.is_service_charge_exempt && !service_charge_amount) {
        computedServiceCharge = Math.round(baseAfterDiscount * Number(taxProfile.service_charge_rate) / 100 * 100) / 100;
      }

      // Compute additional tax rules (e.g. Tourism Levy)
      if ((!additional_tax_amount || additional_tax_amount === 0) && taxProfile.additional_tax_rules) {
        const rules = typeof taxProfile.additional_tax_rules === 'string'
          ? JSON.parse(taxProfile.additional_tax_rules)
          : taxProfile.additional_tax_rules;
        if (Array.isArray(rules) && rules.length > 0) {
          let additionalTotal = 0;
          for (const rule of rules) {
            const base = rule.applies_to === 'total' ? baseAfterDiscount + (computedTaxAmount || 0) : baseAfterDiscount;
            additionalTotal += Math.round(Number(base) * Number(rule.rate) / 100 * 100) / 100;
          }
          computedAdditionalTax = additionalTotal;
        }
      }
    }
  }
  
  // Generate invoice number if not provided
  let invoice = invoice_number;
  if (!invoice) {
    const { data: invoiceData } = await supabaseAdmin.rpc('next_pos_invoice_number');
    invoice = invoiceData;
  }
  
  const { data, error } = await supabaseAdmin.from('pos_transactions').insert({
    outlet_id,
    terminal_id,
    invoice_number: invoice,
    transaction_date: new Date().toISOString(),
    business_date: new Date().toISOString().split('T')[0],
    cashier_id,
    cashier_name,
    customer_type: customer_type || 'walk_in',
    reservation_id,
    room_number,
    guest_name,
    line_items,
    subtotal: subtotal || 0,
    discount_amount: discount_amount || 0,
    discount_percent: discount_percent || 0,
    service_charge_amount: computedServiceCharge || 0,
    tax_amount: computedTaxAmount || 0,
    additional_tax_amount: computedAdditionalTax || 0,
    total_amount,
    payment_method: payment_method || 'cash',
    split_payments,
    room_charge_details,
    tax_profile_id: outlet?.tax_profile_id,
    gl_mapping_id: outlet?.gl_mapping_id,
    inventory_mode: outlet?.inventory_mode || 'sku',
    inventory_deducted: false,
    client_name,
    client_tin,
    client_vat_no,
    client_vat_date,
    shift_id,
    status: 'completed'
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Trigger inventory deduction (async, don't wait) — §3 Transaction Pipeline
  if (outlet?.inventory_mode && line_items) {
    (async () => {
      try {
        await supabaseAdmin.rpc('deduct_outlet_inventory', {
          p_outlet_id: outlet_id,
          p_line_items: line_items,
          p_inventory_mode: outlet.inventory_mode,
          p_reference_doc: invoice,
          p_reference_type: 'pos_sale'
        });
        // Mark as deducted
        await supabaseAdmin
          .from('pos_transactions')
          .update({ inventory_deducted: true })
          .eq('id', data.id);
      } catch (err) {
        console.error('Inventory deduction failed:', err);
      }
    })();
  }

  // KDS Auto-Routing (§4.2) — if line_items have prep_required items, auto-create KDS tickets
  if (line_items && Array.isArray(line_items)) {
    (async () => {
      try {
        // Fetch menu items to check prep_required and prep_station_id
        const menuItemIds = line_items.map(li => li.menu_item_id).filter(Boolean);
        if (menuItemIds.length === 0) return;

        const { data: menuItems } = await supabaseAdmin
          .from('pos_menu_items')
          .select('id, prep_required, prep_station_id, name')
          .in('id', menuItemIds);

        const prepItems = line_items
          .map(li => ({
            ...li,
            prep_required: menuItems?.find(mi => mi.id === li.menu_item_id)?.prep_required || false,
            prep_station_id: menuItems?.find(mi => mi.id === li.menu_item_id)?.prep_station_id || null,
            name: menuItems?.find(mi => mi.id === li.menu_item_id)?.name || li.name
          }))
          .filter(li => li.prep_required);

        if (prepItems.length === 0) return;

        // Resolve default station for outlet
        let defaultStationId = null;
        const { data: defaultLink } = await supabaseAdmin
          .from('pos_outlet_prep_stations')
          .select('station_id')
          .eq('outlet_id', outlet_id)
          .limit(1)
          .single();
        if (defaultLink) defaultStationId = defaultLink.station_id;

        // Group items by prep_station_id (multi-station ticket splitting)
        const itemsByStation = new Map<string, any[]>();
        for (const item of prepItems) {
          const itemStationId = item.prep_station_id || defaultStationId || '';
          if (!itemsByStation.has(itemStationId)) itemsByStation.set(itemStationId, []);
          itemsByStation.get(itemStationId)!.push({
            quantity: item.quantity,
            name: item.name,
            notes: item.notes,
            modifiers: item.modifiers
          });
        }

        // Create one KDS ticket per station — resolve KDS instance per-station (§2.3)
        for (const [stId, stationItems] of itemsByStation.entries()) {
          let targetPrepTime = 15;
          if (stId) {
            const { data: st } = await supabaseAdmin
              .from('pos_prep_stations')
              .select('target_prep_time_minutes')
              .eq('id', stId)
              .single();
            if (st) targetPrepTime = st.target_prep_time_minutes;
          }

          // Station-level KDS resolution: try (outlet, station) first, fall back to (outlet, NULL)
          let kdsInstanceId: string | null = null;
          const stationUuid = stId || null;
          if (stationUuid) {
            const { data: stationConn } = await supabaseAdmin
              .from('kds_pos_connections')
              .select('kds_instance_id')
              .eq('outlet_id', outlet_id)
              .eq('prep_station_id', stationUuid)
              .eq('is_active', true)
              .order('priority_weight', { ascending: false })
              .limit(1)
              .single();
            if (stationConn) kdsInstanceId = stationConn.kds_instance_id;
          }
          if (!kdsInstanceId) {
            const { data: catchAllConn } = await supabaseAdmin
              .from('kds_pos_connections')
              .select('kds_instance_id')
              .eq('outlet_id', outlet_id)
              .is('prep_station_id', null)
              .eq('is_active', true)
              .order('priority_weight', { ascending: false })
              .limit(1)
              .single();
            if (catchAllConn) kdsInstanceId = catchAllConn.kds_instance_id;
          }

          await supabaseAdmin.from('kds_orders').insert({
            order_id: data.id.toString(),
            transaction_id: data.id,
            kds_instance_id: kdsInstanceId,
            outlet_id,
            station_id: stId || null,
            table_number: room_number || null,
            customer_name: guest_name || null,
            order_type: 'dine_in',
            items: stationItems,
            course_group: 'main',
            priority: 'normal',
            status: 'fired',
            fired_at: new Date().toISOString(),
            target_prep_time_minutes: targetPrepTime
          });
        }

        cacheService.invalidatePattern('kds:*');
      } catch (err) {
        console.error('KDS auto-routing failed:', err);
      }
    })();
  }

  // Folio Posting (§3 Transaction Pipeline) — if payment_method=room_folio and reservation_id, post to folio
  if (payment_method === 'room_folio' && reservation_id) {
    (async () => {
      try {
        // Check if reservation exists and has a folio
        const { data: res } = await supabaseAdmin
          .from('reservations')
          .select('id, folio_id')
          .eq('id', reservation_id)
          .single();

        if (res?.folio_id) {
          // Post charge to folio
          await supabaseAdmin.from('folio_lines').insert({
            folio_id: res.folio_id,
            line_type: 'charge',
            description: `POS Invoice ${invoice}`,
            amount: total_amount,
            reference_type: 'pos_transaction',
            reference_id: data.id.toString(),
            created_at: new Date().toISOString()
          });

          // Update transaction with folio linkage
          await supabaseAdmin
            .from('pos_transactions')
            .update({ folio_charge_id: res.folio_id })
            .eq('id', data.id);
        }
      } catch (err) {
        console.error('Folio posting failed:', err);
      }
    })();
  }

  cacheService.invalidatePattern('pos:*');

  return res.status(201).json(data);
});

router.get('/transactions', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, business_date, status, limit = 100 } = req.query;
  
  let query = supabaseAdmin
    .from('pos_transactions')
    .select('*');
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (business_date) query = query.eq('business_date', business_date);
  if (status) query = query.eq('status', status);
  
  const { data, error } = await query
    .order('transaction_date', { ascending: false })
    .limit(Number(limit));
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ transactions: data || [] });
});

// ── POS Shifts CRUD ────────────────────────────────────────────────────
router.get('/shifts', authenticate, requirePermission('pos_settings:read'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, status, cashier_id } = req.query;
  
  let query = supabaseAdmin
    .from('pos_shifts')
    .select('*');
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (status) query = query.eq('status', status);
  if (cashier_id) query = query.eq('cashier_id', cashier_id);
  
  const { data, error } = await query
    .order('opened_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ shifts: data || [] });
});

router.post('/shifts', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, terminal_id, cashier_id, cashier_name, opening_float } = req.body || {};
  
  if (!outlet_id || !cashier_id || !cashier_name) {
    return res.status(400).json({ error: 'outlet_id, cashier_id, and cashier_name are required' });
  }
  
  // Get shift number for this outlet/cashier today
  const today = new Date().toISOString().split('T')[0];
  const { data: existingShifts } = await supabaseAdmin
    .from('pos_shifts')
    .select('shift_number')
    .eq('outlet_id', outlet_id)
    .eq('cashier_id', cashier_id)
    .gte('opened_at', today);
  
  const nextShiftNumber = (existingShifts?.length || 0) + 1;
  
  const { data, error } = await supabaseAdmin.from('pos_shifts').insert({
    outlet_id,
    terminal_id,
    cashier_id,
    cashier_name,
    shift_number: nextShiftNumber,
    opening_float: opening_float || 0,
    status: 'open'
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/shifts/:shiftId/close', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { shiftId } = req.params;
  const { counted_cash, reconciliation_notes } = req.body || {};
  
  // Get shift details
  const { data: shift, error: shiftError } = await supabaseAdmin
    .from('pos_shifts')
    .select('*')
    .eq('id', shiftId)
    .single();
  
  if (shiftError) return res.status(500).json({ error: shiftError.message });
  
  // Calculate variance
  const cashVariance = counted_cash !== undefined ? counted_cash - shift.expected_cash : null;
  
  const updates: Record<string, any> = {
    closed_at: new Date().toISOString(),
    status: 'closed'
  };
  
  if (counted_cash !== undefined) {
    updates.counted_cash = counted_cash;
    updates.cash_variance = cashVariance;
  }
  if (reconciliation_notes !== undefined) updates.reconciliation_notes = reconciliation_notes;
  
  const { data, error } = await supabaseAdmin
    .from('pos_shifts')
    .update(updates)
    .eq('id', shiftId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

// ── GL Posting (§3 Transaction Pipeline) — End-of-shift/day journal per GLMappingID ──
router.post('/gl/post', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { shift_id, business_date, outlet_id } = req.body || {};

  if (!shift_id && !business_date) {
    return res.status(400).json({ error: 'Either shift_id or business_date is required' });
  }

  // Build filter for transactions to post (only completed, not voided, not already posted)
  let query = supabaseAdmin
    .from('pos_transactions')
    .select('id, outlet_id, gl_mapping_id, total_amount, subtotal, tax_amount, service_charge_amount, payment_method, business_date, invoice_number')
    .eq('status', 'completed')
    .is('journal_entry_id', null);

  if (shift_id) query = query.eq('shift_id', shift_id);
  if (business_date) query = query.eq('business_date', business_date);
  if (outlet_id) query = query.eq('outlet_id', outlet_id);

  const { data: transactions, error: txError } = await query;
  if (txError) return res.status(500).json({ error: txError.message });
  if (!transactions || transactions.length === 0) {
    return res.json({ message: 'No transactions to post', journal_entries: [] });
  }

  // Group transactions by outlet and GL mapping
  const grouped = new Map<string, any[]>();
  for (const tx of transactions) {
    const key = `${tx.outlet_id}|${tx.gl_mapping_id || 'default'}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(tx);
  }

  const journalEntries: any[] = [];

  // Create one journal entry per group
  for (const [key, groupTx] of grouped.entries()) {
    const [outletId, glMappingId] = key.split('|');

    // Get GL mapping details
    let glMapping: any = null;
    if (glMappingId !== 'default') {
      const { data: glData } = await supabaseAdmin
        .from('pos_gl_mappings')
        .select('*')
        .eq('id', glMappingId)
        .single();
      glMapping = glData;
    }

    // Fallback to default GL mapping if not found
    const revenueAccount = glMapping?.revenue_account_code || '6100';
    const vatAccount = glMapping?.vat_account_code || '2020';
    const serviceChargeAccount = glMapping?.service_charge_account_code || '6200';
    const cashAccount = glMapping?.cash_account_code || '1010';
    const arAccount = glMapping?.ar_account_code || '1100';

    // Aggregate amounts
    const totalRevenue = groupTx.reduce((sum, tx) => sum + Number(tx.subtotal), 0);
    const totalVat = groupTx.reduce((sum, tx) => sum + Number(tx.tax_amount), 0);
    const totalServiceCharge = groupTx.reduce((sum, tx) => sum + Number(tx.service_charge_amount), 0);
    const totalCash = groupTx
      .filter(tx => tx.payment_method === 'cash' || tx.payment_method === 'card')
      .reduce((sum, tx) => sum + Number(tx.total_amount), 0);
    const totalAr = groupTx
      .filter(tx => tx.payment_method === 'room_folio')
      .reduce((sum, tx) => sum + Number(tx.total_amount), 0);

    // Create journal entry
    const journalNumber = `POS-JNL-${Date.now()}`;
    const { data: journal, error: journalError } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        journal_number: journalNumber,
        journal_date: business_date || groupTx[0].business_date,
        description: `POS Posting ${shift_id ? `Shift ${shift_id}` : business_date}`,
        total_debit: totalRevenue + totalVat + totalServiceCharge,
        total_credit: totalCash + totalAr,
        reference_type: 'pos_posting',
        reference_id: shift_id || business_date,
        status: 'posted',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (journalError) {
      console.error('Journal entry creation failed:', journalError);
      continue;
    }

    // Create journal lines (debits)
    const lines = [
      { journal_id: journal.id, account_code: revenueAccount, debit: totalRevenue, credit: 0, description: 'POS Revenue' },
      { journal_id: journal.id, account_code: vatAccount, debit: totalVat, credit: 0, description: 'POS VAT' },
      ...(totalServiceCharge > 0 ? [{ journal_id: journal.id, account_code: serviceChargeAccount, debit: totalServiceCharge, credit: 0, description: 'POS Service Charge' }] : []),
      { journal_id: journal.id, account_code: cashAccount, debit: 0, credit: totalCash, description: 'POS Cash/Card' },
      { journal_id: journal.id, account_code: arAccount, debit: 0, credit: totalAr, description: 'POS Room Charge' }
    ];

    await supabaseAdmin.from('journal_lines').insert(lines);

    // Link transactions to journal entry
    const txIds = groupTx.map(tx => tx.id);
    await supabaseAdmin
      .from('pos_transactions')
      .update({ journal_entry_id: journal.id })
      .in('id', txIds);

    journalEntries.push({
      journal_id: journal.id,
      journal_number: journalNumber,
      outlet_id: outletId,
      gl_mapping_id: glMappingId,
      transaction_count: groupTx.length,
      total_amount: totalRevenue + totalVat + totalServiceCharge
    });
  }

  cacheService.invalidatePattern('pos:*');
  cacheService.invalidatePattern('gl:*');

  return res.json({ journal_entries: journalEntries });
});

// ── Offline Sync Queue (§1: Offline-first, §3: Transaction Pipeline) ──
// POS terminals queue transactions here when offline, then sync when connectivity returns.
// Dedup via transaction_id as idempotency key.

// Queue a transaction from an offline terminal
router.post('/sync', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { transaction_id, outlet_id, terminal_id, device_id, payload, client_created_at } = req.body || {};

  if (!transaction_id || !outlet_id || !payload) {
    return res.status(400).json({ error: 'transaction_id, outlet_id, and payload are required' });
  }

  // Check for duplicate — if transaction_id already exists in queue, return existing
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
    payload,
    sync_status: 'pending',
    client_created_at: client_created_at || new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get sync status for a terminal or outlet
router.get('/sync/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { outlet_id, terminal_id, device_id } = req.query as Record<string, string>;

  let query = supabaseAdmin
    .from('pos_sync_queue')
    .select('id, transaction_id, sync_status, sync_attempts, last_sync_error, synced_at, client_created_at');

  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (terminal_id) query = query.eq('terminal_id', terminal_id);
  if (device_id) query = query.eq('device_id', device_id);

  const { data, error } = await query.order('client_created_at', { ascending: false }).limit(100);

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

// Flush pending queue items — process them into pos_transactions
router.post('/sync/flush', authenticate, requirePermission('pos:transaction'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { outlet_id, limit = 50 } = req.body || {};

  let query = supabaseAdmin
    .from('pos_sync_queue')
    .select('*')
    .eq('sync_status', 'pending')
    .order('client_created_at', { ascending: true })
    .limit(Number(limit));

  if (outlet_id) query = query.eq('outlet_id', outlet_id);

  const { data: pendingItems, error: fetchError } = await query;

  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!pendingItems || pendingItems.length === 0) {
    return res.json({ message: 'No pending transactions to sync', synced: 0, results: [] });
  }

  const results: any[] = [];
  let syncedCount = 0;
  let failedCount = 0;
  let conflictCount = 0;

  for (const item of pendingItems) {
    try {
      const p = item.payload;

      // Check for duplicate in pos_transactions
      const { data: existingTxn } = await supabaseAdmin
        .from('pos_transactions')
        .select('id, status')
        .eq('id', p.id || item.transaction_id)
        .single();

      if (existingTxn) {
        // Conflict — transaction already exists
        await supabaseAdmin
          .from('pos_sync_queue')
          .update({
            sync_status: 'conflict',
            sync_attempts: item.sync_attempts + 1,
            last_sync_error: 'Transaction already exists in pos_transactions',
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        conflictCount++;
        results.push({ transaction_id: item.transaction_id, status: 'conflict' });
        continue;
      }

      // Get outlet config for tax/GL
      const { data: outlet } = await supabaseAdmin
        .from('pos_outlets')
        .select('tax_profile_id, gl_mapping_id, inventory_mode')
        .eq('id', item.outlet_id)
        .single();

      // Generate invoice if not in payload
      let invoice = p.invoice_number;
      if (!invoice) {
        const { data: invoiceData } = await supabaseAdmin.rpc('next_pos_invoice_number');
        invoice = invoiceData;
      }

      // Insert into pos_transactions
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
        client_name: p.client_name,
        client_tin: p.client_tin,
        client_vat_no: p.client_vat_no,
        client_vat_date: p.client_vat_date,
        shift_id: p.shift_id,
        status: 'completed',
        metadata: { sync_source: 'offline_queue', sync_queue_id: item.id, device_id: item.device_id },
      }).select().single();

      if (insertError) {
        await supabaseAdmin
          .from('pos_sync_queue')
          .update({
            sync_status: 'failed',
            sync_attempts: item.sync_attempts + 1,
            last_sync_error: insertError.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        failedCount++;
        results.push({ transaction_id: item.transaction_id, status: 'failed', error: insertError.message });
        continue;
      }

      // Mark as synced
      await supabaseAdmin
        .from('pos_sync_queue')
        .update({
          sync_status: 'synced',
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      // Trigger inventory deduction (async)
      if (outlet?.inventory_mode && p.line_items) {
        (async () => {
          try {
            await supabaseAdmin.rpc('deduct_outlet_inventory', {
              p_outlet_id: item.outlet_id,
              p_line_items: p.line_items,
              p_inventory_mode: outlet.inventory_mode,
              p_reference_doc: invoice,
              p_reference_type: 'pos_sale'
            });
            await supabaseAdmin
              .from('pos_transactions')
              .update({ inventory_deducted: true })
              .eq('id', txn.id);
          } catch (err) {
            console.error('Inventory deduction failed for synced txn:', err);
          }
        })();
      }

      // KDS auto-routing (async)
      if (p.line_items && Array.isArray(p.line_items)) {
        (async () => {
          try {
            const menuItemIds = p.line_items.map((li: any) => li.menu_item_id).filter(Boolean);
            if (menuItemIds.length === 0) return;

            const { data: menuItems } = await supabaseAdmin
              .from('pos_menu_items')
              .select('id, prep_required, prep_station_id, name')
              .in('id', menuItemIds);

            const prepItems = p.line_items
              .map((li: any) => ({
                ...li,
                prep_required: menuItems?.find((mi: any) => mi.id === li.menu_item_id)?.prep_required || false,
                prep_station_id: menuItems?.find((mi: any) => mi.id === li.menu_item_id)?.prep_station_id || null,
                name: menuItems?.find((mi: any) => mi.id === li.menu_item_id)?.name || li.name
              }))
              .filter((li: any) => li.prep_required);

            if (prepItems.length === 0) return;

            // Resolve default station for outlet
            let defaultStationId = null;
            const { data: defaultLink } = await supabaseAdmin
              .from('pos_outlet_prep_stations')
              .select('station_id')
              .eq('outlet_id', item.outlet_id)
              .limit(1)
              .single();
            if (defaultLink) defaultStationId = defaultLink.station_id;

            const itemsByStation = new Map<string, any[]>();
            for (const item2 of prepItems) {
              const stId = item2.prep_station_id || defaultStationId || '';
              if (!itemsByStation.has(stId)) itemsByStation.set(stId, []);
              itemsByStation.get(stId)!.push({ quantity: item2.quantity, name: item2.name, notes: item2.notes, modifiers: item2.modifiers });
            }

            for (const [stId, stationItems] of itemsByStation.entries()) {
              let targetPrepTime = 15;
              if (stId) {
                const { data: st } = await supabaseAdmin
                  .from('pos_prep_stations')
                  .select('target_prep_time_minutes')
                  .eq('id', stId)
                  .single();
                if (st) targetPrepTime = st.target_prep_time_minutes;
              }

              // Station-level KDS resolution: try (outlet, station) first, fall back to (outlet, NULL)
              let syncKdsInstanceId: string | null = null;
              const stationUuid = stId || null;
              if (stationUuid) {
                const { data: stationConn } = await supabaseAdmin
                  .from('kds_pos_connections')
                  .select('kds_instance_id')
                  .eq('outlet_id', item.outlet_id)
                  .eq('prep_station_id', stationUuid)
                  .eq('is_active', true)
                  .order('priority_weight', { ascending: false })
                  .limit(1)
                  .single();
                if (stationConn) syncKdsInstanceId = stationConn.kds_instance_id;
              }
              if (!syncKdsInstanceId) {
                const { data: catchAllConn } = await supabaseAdmin
                  .from('kds_pos_connections')
                  .select('kds_instance_id')
                  .eq('outlet_id', item.outlet_id)
                  .is('prep_station_id', null)
                  .eq('is_active', true)
                  .order('priority_weight', { ascending: false })
                  .limit(1)
                  .single();
                if (catchAllConn) syncKdsInstanceId = catchAllConn.kds_instance_id;
              }

              await supabaseAdmin.from('kds_orders').insert({
                order_id: txn.id.toString(),
                transaction_id: txn.id,
                kds_instance_id: syncKdsInstanceId,
                outlet_id: item.outlet_id,
                station_id: stId || null,
                table_number: p.room_number || null,
                customer_name: p.guest_name || null,
                order_type: 'dine_in',
                items: stationItems,
                course_group: 'main',
                priority: 'normal',
                status: 'fired',
                fired_at: new Date().toISOString(),
                target_prep_time_minutes: targetPrepTime
              });
            }

            cacheService.invalidatePattern('kds:*');
          } catch (err) {
            console.error('KDS auto-routing failed for synced txn:', err);
          }
        })();
      }

      // Folio posting (async)
      if (p.payment_method === 'room_folio' && p.reservation_id) {
        (async () => {
          try {
            const { data: res } = await supabaseAdmin
              .from('reservations')
              .select('id, folio_id')
              .eq('id', p.reservation_id)
              .single();

            if (res?.folio_id) {
              await supabaseAdmin.from('folio_lines').insert({
                folio_id: res.folio_id,
                line_type: 'charge',
                description: 'POS Invoice ' + invoice,
                amount: p.total_amount,
                reference_type: 'pos_transaction',
                reference_id: txn.id.toString(),
                created_at: new Date().toISOString()
              });

              await supabaseAdmin
                .from('pos_transactions')
                .update({ folio_charge_id: res.folio_id })
                .eq('id', txn.id);
            }
          } catch (err) {
            console.error('Folio posting failed for synced txn:', err);
          }
        })();
      }

      syncedCount++;
      results.push({ transaction_id: item.transaction_id, status: 'synced', pos_transaction_id: txn.id });
    } catch (err: any) {
      await supabaseAdmin
        .from('pos_sync_queue')
        .update({
          sync_status: 'failed',
          sync_attempts: item.sync_attempts + 1,
          last_sync_error: err.message || 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      failedCount++;
      results.push({ transaction_id: item.transaction_id, status: 'failed', error: err.message });
    }
  }

  cacheService.invalidatePattern('pos:*');

  return res.json({
    synced: syncedCount,
    failed: failedCount,
    conflict: conflictCount,
    results,
  });
});

// ── POS Menu Versions ──────────────────────────────────────────────────
router.get('/menu-versions', authenticate, requirePermission('pos_settings:read'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, is_active } = req.query;
  
  let query = supabaseAdmin
    .from('pos_menu_versions')
    .select('*');
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
  
  const { data, error } = await query
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ versions: data || [] });
});

router.post('/menu-versions', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, version_label, description, is_active, effective_from, effective_until, menu_snapshot } = req.body || {};
  
  if (!outlet_id || !version_label) {
    return res.status(400).json({ error: 'outlet_id and version_label are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_menu_versions').insert({
    outlet_id,
    version_label,
    description,
    is_active: is_active || false,
    effective_from,
    effective_until,
    menu_snapshot: menu_snapshot || '{}'
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

// ── POS Menu Items CRUD ────────────────────────────────────────────────
router.get('/menu-items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, category_id, is_active, is_available } = req.query;
  
  let query = supabaseAdmin
    .from('pos_menu_items')
    .select('*');
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (category_id) query = query.eq('category_id', category_id);
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
  if (is_available !== undefined) query = query.eq('is_available', is_available === 'true');
  
  const { data, error } = await query.order('name');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ items: data || [] });
});

router.post('/menu-items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    outlet_id, category_id, name, description, sku, barcode,
    selling_price, cost_price, is_active, is_available, image_url,
    preparation_time, is_taxable, tax_rate, is_service_charge_applicable,
    recipe, modifiers, item_type, prep_required, prep_station_id, recipe_id
  } = req.body || {};
  
  if (!outlet_id || !name || selling_price === undefined) {
    return res.status(400).json({ error: 'outlet_id, name, and selling_price are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_menu_items').insert({
    outlet_id,
    category_id,
    name,
    description,
    sku,
    barcode,
    selling_price,
    cost_price,
    is_active: is_active !== false,
    is_available: is_available !== false,
    image_url,
    preparation_time,
    is_taxable: is_taxable !== false,
    tax_rate,
    is_service_charge_applicable: is_service_charge_applicable !== false,
    recipe: recipe || '{}',
    modifiers: modifiers || '[]',
    item_type: item_type || 'Retail',
    prep_required: prep_required || false,
    prep_station_id: prep_station_id || null,
    recipe_id: recipe_id || null,
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/menu-items/:itemId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { itemId } = req.params;
  const updates: Record<string, any> = {};
  
  const fields = [
    'category_id', 'name', 'description', 'sku', 'barcode',
    'selling_price', 'cost_price', 'is_active', 'is_available', 'image_url',
    'preparation_time', 'is_taxable', 'tax_rate', 'is_service_charge_applicable',
    'recipe', 'modifiers', 'item_type', 'prep_required', 'prep_station_id', 'recipe_id'
  ];
  
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_menu_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

router.delete('/menu-items/:itemId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { itemId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_menu_items')
    .delete()
    .eq('id', itemId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── POS Menu Item Recipes ──────────────────────────────────────────────
// Create a recipe (with ingredient lines) for a pos_menu_item and link it via recipe_id
router.post('/menu-items/:itemId/recipe', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { itemId } = req.params;
  const { yield: yieldPct, portions, lines } = req.body || {};
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'At least one ingredient line is required' });
  }

  // Check if a recipe already exists for this menu item
  const { data: existing } = await supabaseAdmin
    .from('recipes').select('id').eq('menu_item_id', itemId).maybeSingle();

  let recipeId = existing?.id;

  if (recipeId) {
    // Update existing recipe
    const { error: updErr } = await supabaseAdmin
      .from('recipes').update({
        yield: yieldPct ?? 1.0,
        portions: portions ?? 1,
        updated_at: new Date().toISOString(),
      }).eq('id', recipeId);
    if (updErr) return res.status(500).json({ error: updErr.message });

    // Delete old recipe lines
    await supabaseAdmin.from('recipe_lines').delete().eq('recipe_id', recipeId);
  } else {
    // Create new recipe
    const { data: recipeData, error: recipeErr } = await supabaseAdmin
      .from('recipes').insert({
        menu_item_id: itemId,
        yield: yieldPct ?? 1.0,
        portions: portions ?? 1,
      }).select().single();
    if (recipeErr) return res.status(500).json({ error: recipeErr.message });
    recipeId = recipeData.id;
  }

  // Insert recipe lines
  const recipeLines = lines
    .filter((l: any) => l.ingredient_id)
    .map((l: any) => ({
      recipe_id: recipeId,
      ingredient_id: l.ingredient_id,
      quantity: l.quantity || 0,
      unit: l.unit || 'pcs',
      cost_at_time_of_costing: l.cost_at_time_of_costing || 0,
    }));

  if (recipeLines.length > 0) {
    const { error: linesErr } = await supabaseAdmin.from('recipe_lines').insert(recipeLines);
    if (linesErr) return res.status(500).json({ error: linesErr.message });
  }

  // Link recipe to pos_menu_item via recipe_id
  await supabaseAdmin.from('pos_menu_items').update({ recipe_id: recipeId }).eq('id', itemId);

  cacheService.invalidatePattern('pos:*');
  return res.status(201).json({ id: recipeId, menu_item_id: itemId });
});

// Get recipe (with ingredient lines + plate cost) for a pos_menu_item
router.get('/menu-items/:itemId/recipe', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { itemId } = req.params;

  const { data: recipe, error } = await supabaseAdmin
    .from('recipes')
    .select('*, recipe_lines(*, ingredients(*))')
    .eq('menu_item_id', itemId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!recipe) return res.json(null);

  // Calculate plate cost
  let totalIngredientCost = 0;
  const breakdown: any[] = [];
  if (recipe.recipe_lines) {
    for (const line of recipe.recipe_lines) {
      const ing = (line as any).ingredients;
      const qty = line.quantity || 0;
      const cost = ing?.current_cost || 0;
      const lineCost = qty * cost;
      totalIngredientCost += lineCost;
      breakdown.push({
        ingredient_id: ing?.id,
        ingredient_name: ing?.name,
        quantity: qty,
        unit: line.unit,
        cost_per_unit: cost,
        line_cost: lineCost,
      });
    }
  }
  const yieldPct = recipe.yield || 1.0;
  const adjustedPlateCost = totalIngredientCost / yieldPct;
  const portions = recipe.portions || 1;

  return res.json({
    ...recipe,
    total_ingredient_cost: totalIngredientCost,
    adjusted_plate_cost: adjustedPlateCost,
    cost_per_portion: adjustedPlateCost / portions,
    ingredient_breakdown: breakdown,
  });
});

// Get available ingredients for recipe creation
router.get('/ingredients', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('ingredients')
    .select('id, name, category, unit_of_measure, current_cost, is_active')
    .eq('is_active', true)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ingredients: data || [] });
});

// ── POS Outlet Categories CRUD ─────────────────────────────────────────
router.get('/outlet-categories', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id } = req.query;
  
  let query = supabaseAdmin
    .from('pos_outlet_categories')
    .select('*');
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  
  const { data, error } = await query.order('display_order');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ categories: data || [] });
});

router.post('/outlet-categories', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id, name, display_order, icon, is_active } = req.body || {};
  
  if (!outlet_id || !name) {
    return res.status(400).json({ error: 'outlet_id and name are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('pos_outlet_categories').insert({
    outlet_id,
    name,
    display_order: display_order || 0,
    icon,
    is_active: is_active !== false,
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.status(201).json(data);
});

router.put('/outlet-categories/:categoryId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { categoryId } = req.params;
  const updates: Record<string, any> = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;
  if (req.body.icon !== undefined) updates.icon = req.body.icon;
  if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const { data, error } = await supabaseAdmin
    .from('pos_outlet_categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json(data);
});

router.delete('/outlet-categories/:categoryId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { categoryId } = req.params;
  
  const { error } = await supabaseAdmin
    .from('pos_outlet_categories')
    .delete()
    .eq('id', categoryId);
  
  if (error) return res.status(500).json({ error: error.message });
  
  cacheService.invalidatePattern('pos:*');
  
  return res.json({ success: true });
});

// ── POS Tables (from fb_tables) ────────────────────────────────────────
router.get('/tables', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { outlet_id } = req.query;
  
  let query = supabaseAdmin
    .from('fb_tables')
    .select('id, table_number, seats, section, outlet_id, status, current_order_id, is_active')
    .eq('is_active', true);
  
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  
  const { data, error } = await query.order('table_number');
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ tables: data || [] });
});

// ── Prep Stations CRUD ─────────────────────────────────────────────────
router.get('/prep-stations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, is_active } = req.query;
  let query = supabaseAdmin.from('pos_prep_stations').select('*');
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
  const { data, error } = await query.order('station_name');
  if (error) return res.status(500).json({ error: error.message });

  // If outlet_id provided, filter to stations serving that outlet
  if (outlet_id) {
    const { data: links } = await supabaseAdmin
      .from('pos_outlet_prep_stations')
      .select('station_id')
      .eq('outlet_id', outlet_id);
    const stationIds = (links || []).map(l => l.station_id);
    return res.json({ stations: (data || []).filter(s => stationIds.includes(s.id)) });
  }

  return res.json({ stations: data || [] });
});

router.post('/prep-stations', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { station_name, station_type, display_device_id, target_prep_time_minutes, is_active, outlet_ids } = req.body || {};
  if (!station_name) return res.status(400).json({ error: 'station_name is required' });

  const { data, error } = await supabaseAdmin.from('pos_prep_stations').insert({
    station_name,
    station_type: station_type || 'kitchen',
    display_device_id,
    target_prep_time_minutes: target_prep_time_minutes || 15,
    is_active: is_active !== false,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Link outlets if provided
  if (outlet_ids && Array.isArray(outlet_ids) && data) {
    const links = outlet_ids.map((oid: string) => ({ outlet_id: oid, station_id: data.id }));
    await supabaseAdmin.from('pos_outlet_prep_stations').insert(links);
  }

  cacheService.invalidatePattern('prep-stations:*');
  return res.status(201).json(data);
});

router.put('/prep-stations/:id', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { station_name, station_type, display_device_id, target_prep_time_minutes, is_active } = req.body || {};
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (station_name !== undefined) updates.station_name = station_name;
  if (station_type !== undefined) updates.station_type = station_type;
  if (display_device_id !== undefined) updates.display_device_id = display_device_id;
  if (target_prep_time_minutes !== undefined) updates.target_prep_time_minutes = target_prep_time_minutes;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabaseAdmin.from('pos_prep_stations').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('prep-stations:*');
  return res.json(data);
});

router.delete('/prep-stations/:id', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_prep_stations').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('prep-stations:*');
  return res.json({ success: true });
});

// ── KDS Ticket Lifecycle ───────────────────────────────────────────────
// Get KDS tickets with optional station/status/outlet filter
router.get('/kds/tickets', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { station_id, status, outlet_id, order_type } = req.query as Record<string, string>;

  let query = supabaseAdmin.from('kds_orders').select('*');
  if (station_id) query = query.eq('station_id', station_id);
  if (status) query = query.eq('status', status);
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (order_type) query = query.eq('order_type', order_type);

  // Exclude served/voided by default (active tickets only)
  if (!status) {
    query = query.in('status', ['fired', 'in_progress', 'ready']);
  }

  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ tickets: data || [] });
});

// Update KDS ticket status (fire → in_progress → ready → served / recalled)
router.put('/kds/tickets/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, bumped_by, recalled_reason } = req.body || {};

  const validStatuses = ['fired', 'in_progress', 'ready', 'served', 'recalled', 'voided'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'in_progress') updates.in_progress_at = new Date().toISOString();
  if (status === 'ready') updates.ready_at = new Date().toISOString();
  if (status === 'served') {
    updates.served_at = new Date().toISOString();
    if (bumped_by) updates.bumped_by = bumped_by;
  }
  if (status === 'recalled') {
    updates.recalled_at = new Date().toISOString();
    if (recalled_reason) updates.recalled_reason = recalled_reason;
  }

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // ── KDS → POS feedback loop (§4.4) ──────────────────────────────
  // When ticket is bumped to 'served', update parent transaction line items
  if (status === 'served' && data?.order_id) {
    // Find the parent POS transaction by order_id
    const { data: txn } = await supabaseAdmin
      .from('pos_transactions')
      .select('id, line_items')
      .eq('id', data.order_id)
      .single();

    if (txn?.line_items && Array.isArray(txn.line_items)) {
      // Mark line items that match this ticket's items as 'served'
      const ticketItemNames = (data.items || []).map((i: any) => i.name);
      const updatedLineItems = txn.line_items.map((li: any) => {
        if (ticketItemNames.includes(li.name || li.item_name)) {
          return { ...li, kds_status: 'served', served_at: new Date().toISOString() };
        }
        return li;
      });
      await supabaseAdmin
        .from('pos_transactions')
        .update({ line_items: updatedLineItems })
        .eq('id', txn.id);
    }

    // ── Course grouping fire logic (§4.2) ───────────────────────
    // When a course group ticket is served, auto-fire the next course group
    // for the same order_id (e.g. starters served → fire mains)
    const courseOrder = ['starter', 'main', 'dessert'];
    const currentCourseIdx = courseOrder.indexOf(data.course_group);
    if (currentCourseIdx >= 0 && currentCourseIdx < courseOrder.length - 1) {
      const nextCourse = courseOrder[currentCourseIdx + 1];
      // Find held tickets for the next course group of the same order
      const { data: heldTickets } = await supabaseAdmin
        .from('kds_orders')
        .select('id, status, course_group')
        .eq('order_id', data.order_id)
        .eq('course_group', nextCourse)
        .in('status', ['fired', 'in_progress', 'ready']); // Already fired = not held

      // If no active tickets exist for next course, check for 'held' status tickets
      if (!heldTickets || heldTickets.length === 0) {
        const { data: heldCourseTickets } = await supabaseAdmin
          .from('kds_orders')
          .select('id')
          .eq('order_id', data.order_id)
          .eq('course_group', nextCourse)
          .eq('status', 'held');

        if (heldCourseTickets && heldCourseTickets.length > 0) {
          // Fire all held tickets for the next course
          await supabaseAdmin
            .from('kds_orders')
            .update({
              status: 'fired',
              fired_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .in('id', heldCourseTickets.map(t => t.id));
        }
      }
    }
  }

  // ── Void/86 propagation (§4.4) ──────────────────────────────────
  // When ticket is voided, propagate back to POS transaction
  if (status === 'voided' && data?.order_id) {
    const { data: txn } = await supabaseAdmin
      .from('pos_transactions')
      .select('id, line_items')
      .eq('id', data.order_id)
      .single();

    if (txn?.line_items && Array.isArray(txn.line_items)) {
      const ticketItemNames = (data.items || []).map((i: any) => i.name);
      const updatedLineItems = txn.line_items.map((li: any) => {
        if (ticketItemNames.includes(li.name || li.item_name)) {
          return { ...li, kds_status: 'voided', voided_at: new Date().toISOString() };
        }
        return li;
      });
      await supabaseAdmin
        .from('pos_transactions')
        .update({ line_items: updatedLineItems })
        .eq('id', txn.id);
    }
  }

  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// Recall a KDS ticket (send back to kitchen)
router.post('/kds/tickets/:id/recall', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { recalled_reason } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update({
      status: 'recalled',
      recalled_at: new Date().toISOString(),
      recalled_reason: recalled_reason || 'Sent back',
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// ── Shift Reconciliation Summary (Phase 2) ───────────────────────────────
router.get('/shifts/:shiftId/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { shiftId } = req.params;

  const { data: shift, error } = await supabaseAdmin
    .from('pos_shifts')
    .select('*')
    .eq('id', shiftId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Get all transactions for this shift (including voided for analysis)
  const { data: transactions } = await supabaseAdmin
    .from('pos_transactions')
    .select('id, outlet_id, total_amount, subtotal, discount_amount, tax_amount, service_charge_amount, payment_method, status, invoice_number, created_at')
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: true });

  const txns = transactions || [];
  const completedTxns = txns.filter(t => t.status === 'completed');
  const voidedTxns = txns.filter(t => t.status === 'voided');

  // Payment method breakdown
  const paymentBreakdown = {
    cash: { count: 0, amount: 0 },
    card: { count: 0, amount: 0 },
    mobile_money: { count: 0, amount: 0 },
    room_folio: { count: 0, amount: 0 },
    split: { count: 0, amount: 0 },
  };
  for (const t of completedTxns) {
    const pm = t.payment_method as keyof typeof paymentBreakdown;
    if (paymentBreakdown[pm]) {
      paymentBreakdown[pm].count++;
      paymentBreakdown[pm].amount += Number(t.total_amount);
    }
  }

  // Totals
  const totalSales = completedTxns.reduce((sum, t) => sum + Number(t.total_amount), 0);
  const totalSubtotal = completedTxns.reduce((sum, t) => sum + Number(t.subtotal), 0);
  const totalDiscounts = completedTxns.reduce((sum, t) => sum + Number(t.discount_amount), 0);
  const totalTax = completedTxns.reduce((sum, t) => sum + Number(t.tax_amount), 0);
  const totalServiceCharge = completedTxns.reduce((sum, t) => sum + Number(t.service_charge_amount), 0);

  // Void analysis
  const voidAnalysis = {
    voided_count: voidedTxns.length,
    voided_amount: voidedTxns.reduce((sum, t) => sum + Number(t.total_amount), 0),
    voided_invoices: voidedTxns.map(t => t.invoice_number),
  };

  // Cash variance
  const expectedCash = paymentBreakdown.cash.amount;
  const countedCash = shift.counted_cash ? Number(shift.counted_cash) : null;
  const cashVariance = countedCash !== null ? countedCash - expectedCash : null;

  // Per-outlet breakdown (for multi-outlet shifts)
  const outletMap = new Map<string, { outlet_id: string; transaction_count: number; total_sales: number; voided_count: number }>();
  for (const t of completedTxns) {
    const oid = t.outlet_id;
    if (!outletMap.has(oid)) {
      outletMap.set(oid, { outlet_id: oid, transaction_count: 0, total_sales: 0, voided_count: 0 });
    }
    const o = outletMap.get(oid)!;
    o.transaction_count++;
    o.total_sales += Number(t.total_amount);
  }
  for (const t of voidedTxns) {
    const oid = t.outlet_id;
    if (outletMap.has(oid)) {
      outletMap.get(oid)!.voided_count++;
    }
  }

  const summary = {
    ...shift,
    transaction_count: completedTxns.length,
    total_sales: totalSales,
    subtotal: totalSubtotal,
    total_discounts: totalDiscounts,
    total_tax: totalTax,
    total_service_charge: totalServiceCharge,
    payment_breakdown: paymentBreakdown,
    void_analysis: voidAnalysis,
    cash_variance: cashVariance,
    expected_cash: expectedCash,
    counted_cash: countedCash,
    outlet_breakdown: Array.from(outletMap.values()),
    reconciliation_status: shift.reconciliation_status || 'pending',
    reconciliation_notes: shift.reconciliation_notes || null,
  };

  return res.json({ summary });
});

// ── Expo Aggregate View (§4.3) ─────────────────────────────────────────
// Groups all active KDS tickets by order_id/table, showing which stations
// are ready and which aren't — for the expediter/pass-through screen.
router.get('/kds/expo', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;

  let query = supabaseAdmin
    .from('kds_orders')
    .select('*')
    .in('status', ['fired', 'in_progress', 'ready']);

  if (outlet_id) query = query.eq('outlet_id', outlet_id);

  const { data: tickets, error } = await query.order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  // Group by order_id
  const expoMap = new Map<string, any>();
  for (const ticket of tickets || []) {
    const key = ticket.order_id;
    if (!expoMap.has(key)) {
      expoMap.set(key, {
        order_id: key,
        table_number: ticket.table_number,
        customer_name: ticket.customer_name,
        order_type: ticket.order_type,
        course_group: ticket.course_group,
        tickets: [],
        all_ready: true,
        station_count: 0,
        ready_count: 0,
      });
    }
    const expo = expoMap.get(key);
    expo.tickets.push({
      id: ticket.id,
      station_id: ticket.station_id,
      status: ticket.status,
      course_group: ticket.course_group,
      fired_at: ticket.fired_at,
      target_prep_time_minutes: ticket.target_prep_time_minutes,
      items: ticket.items,
    });
    expo.station_count++;
    if (ticket.status === 'ready') expo.ready_count++;
    if (ticket.status !== 'ready') expo.all_ready = false;
  }

  return res.json({ expo: Array.from(expoMap.values()) });
});

// ── Station-Level KDS Performance Metrics (§6.5) ───────────────────────
// Returns avg ticket time, bump rate, and throughput per station.
router.get('/kds/station-performance', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { station_id, hours } = req.query as Record<string, string>;
  const lookbackHours = parseInt(hours || '24', 10);
  const since = new Date(Date.now() - lookbackHours * 3600000).toISOString();

  let query = supabaseAdmin
    .from('kds_orders')
    .select('id, station_id, status, fired_at, served_at, ready_at, target_prep_time_minutes, course_group')
    .gte('created_at', since);

  if (station_id) query = query.eq('station_id', station_id);

  const { data: tickets, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Get station names
  const { data: stations } = await supabaseAdmin
    .from('pos_prep_stations')
    .select('id, station_name, station_type');

  const stationMap = new Map((stations || []).map(s => [s.id, s]));

  // Group by station_id
  const perfMap = new Map<string, any>();
  for (const t of tickets || []) {
    const sid = t.station_id || 'unassigned';
    if (!perfMap.has(sid)) {
      perfMap.set(sid, {
        station_id: sid,
        station_name: stationMap.get(sid)?.station_name || 'Unassigned',
        station_type: stationMap.get(sid)?.station_type || 'unknown',
        total_tickets: 0,
        served_tickets: 0,
        recalled_tickets: 0,
        voided_tickets: 0,
        total_prep_time_minutes: 0,
        on_time_count: 0,
        late_count: 0,
      });
    }
    const p = perfMap.get(sid);
    p.total_tickets++;
    if (t.status === 'served' && t.served_at && t.fired_at) {
      p.served_tickets++;
      const prepTime = (new Date(t.served_at).getTime() - new Date(t.fired_at).getTime()) / 60000;
      p.total_prep_time_minutes += prepTime;
      if (prepTime <= t.target_prep_time_minutes) p.on_time_count++;
      else p.late_count++;
    }
    if (t.status === 'recalled') p.recalled_tickets++;
    if (t.status === 'voided') p.voided_tickets++;
  }

  // Calculate averages
  const performance = Array.from(perfMap.values()).map(p => ({
    ...p,
    avg_prep_time_minutes: p.served_tickets > 0 ? Math.round((p.total_prep_time_minutes / p.served_tickets) * 10) / 10 : 0,
    on_time_rate: p.served_tickets > 0 ? Math.round((p.on_time_count / p.served_tickets) * 100) : 0,
    bump_rate: p.total_tickets > 0 ? Math.round((p.served_tickets / p.total_tickets) * 100) : 0,
    recall_rate: p.total_tickets > 0 ? Math.round((p.recalled_tickets / p.total_tickets) * 100) : 0,
  }));

  return res.json({ performance, lookback_hours: lookbackHours });
});

// ── Course Fire Endpoint (§4.2) ────────────────────────────────────────
// Manually fire held course tickets for an order (e.g. fire mains now)
router.post('/kds/orders/:orderId/fire-course', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { orderId } = req.params;
  const { course_group } = req.body || {};

  if (!course_group) {
    return res.status(400).json({ error: 'course_group is required (starter, main, dessert)' });
  }

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update({
      status: 'fired',
      fired_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .eq('course_group', course_group)
    .eq('status', 'held')
    .select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json({ fired: data?.length || 0, tickets: data || [] });
});

// ── Multi-Property Outlet Template Clone (Phase 3) ──────────────────────
// Clones an outlet config (tax profile, GL mapping, categories, menu items,
// prep station links) to a target property. Enables "clone an Outlet config
// across properties" per §8 Phase 3.
router.post('/outlets/:outletId/clone', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const { outletId } = req.params;
  const { target_property_id, new_outlet_name, new_outlet_code } = req.body || {};

  if (!target_property_id) {
    return res.status(400).json({ error: 'target_property_id is required' });
  }

  // Fetch source outlet
  const { data: sourceOutlet, error: srcError } = await supabaseAdmin
    .from('pos_outlets')
    .select('*')
    .eq('id', outletId)
    .single();

  if (srcError || !sourceOutlet) {
    return res.status(404).json({ error: 'Source outlet not found' });
  }

  // Clone tax profile if exists
  let clonedTaxProfileId = null;
  if (sourceOutlet.tax_profile_id) {
    const { data: taxProfile } = await supabaseAdmin
      .from('pos_tax_profiles')
      .select('*')
      .eq('id', sourceOutlet.tax_profile_id)
      .single();

    if (taxProfile) {
      const { data: newTaxProfile, error: tpError } = await supabaseAdmin
        .from('pos_tax_profiles')
        .insert({
          name: `${taxProfile.name} (Clone)`,
          description: taxProfile.description,
          vat_rate: taxProfile.vat_rate,
          service_charge_rate: taxProfile.service_charge_rate,
          is_vat_exempt: taxProfile.is_vat_exempt,
          is_service_charge_exempt: taxProfile.is_service_charge_exempt,
          additional_tax_rules: taxProfile.additional_tax_rules,
          is_active: true,
        })
        .select()
        .single();

      if (!tpError && newTaxProfile) {
        clonedTaxProfileId = newTaxProfile.id;
      }
    }
  }

  // Clone GL mapping if exists
  let clonedGlMappingId = null;
  if (sourceOutlet.gl_mapping_id) {
    const { data: glMapping } = await supabaseAdmin
      .from('pos_gl_mappings')
      .select('*')
      .eq('id', sourceOutlet.gl_mapping_id)
      .single();

    if (glMapping) {
      const { data: newGlMapping, error: glError } = await supabaseAdmin
        .from('pos_gl_mappings')
        .insert({
          name: `${glMapping.name} (Clone)`,
          description: glMapping.description,
          revenue_account_code: glMapping.revenue_account_code,
          cogs_account_code: glMapping.cogs_account_code,
          vat_account_code: glMapping.vat_account_code,
          service_charge_account_code: glMapping.service_charge_account_code,
          cash_account_code: glMapping.cash_account_code,
          ar_account_code: glMapping.ar_account_code,
          is_active: true,
        })
        .select()
        .single();

      if (!glError && newGlMapping) {
        clonedGlMappingId = newGlMapping.id;
      }
    }
  }

  // Create cloned outlet
  const { data: newOutlet, error: outletError } = await supabaseAdmin
    .from('pos_outlets')
    .insert({
      name: new_outlet_name || `${sourceOutlet.name} (Clone)`,
      outlet_type: sourceOutlet.outlet_type,
      code: new_outlet_code || `${sourceOutlet.code}-CLN`,
      description: sourceOutlet.description,
      location: sourceOutlet.location,
      store_location: sourceOutlet.store_location,
      default_tax_rate: sourceOutlet.default_tax_rate,
      default_service_charge: sourceOutlet.default_service_charge,
      is_active: true,
      operating_hours: sourceOutlet.operating_hours,
      inventory_mode: sourceOutlet.inventory_mode,
      charge_modes: sourceOutlet.charge_modes,
      tax_profile_id: clonedTaxProfileId,
      gl_mapping_id: clonedGlMappingId,
      requires_guest_link: sourceOutlet.requires_guest_link,
      shift_reconciliation_required: sourceOutlet.shift_reconciliation_required,
      outlet_status: 'active',
      outlet_category: sourceOutlet.outlet_category,
      requires_kds: sourceOutlet.requires_kds,
      property_id: target_property_id,
    })
    .select()
    .single();

  if (outletError) {
    return res.status(500).json({ error: outletError.message });
  }

  // Clone menu categories
  const { data: sourceCategories } = await supabaseAdmin
    .from('pos_outlet_categories')
    .select('*')
    .eq('outlet_id', outletId);

  const categoryMap = new Map<string, string>();
  if (sourceCategories && sourceCategories.length > 0) {
    for (const cat of sourceCategories) {
      const { data: newCat, error: catError } = await supabaseAdmin
        .from('pos_outlet_categories')
        .insert({
          outlet_id: newOutlet.id,
          name: cat.name,
          display_order: cat.display_order,
          icon: cat.icon,
          is_active: cat.is_active,
        })
        .select()
        .single();

      if (!catError && newCat) {
        categoryMap.set(cat.id, newCat.id);
      }
    }
  }

  // Clone menu items
  const { data: sourceMenuItems } = await supabaseAdmin
    .from('pos_menu_items')
    .select('*')
    .eq('outlet_id', outletId);

  let clonedMenuItems = 0;
  if (sourceMenuItems && sourceMenuItems.length > 0) {
    for (const item of sourceMenuItems) {
      const mappedCategoryId = item.category_id ? categoryMap.get(item.category_id) : null;

      const { error: itemError } = await supabaseAdmin
        .from('pos_menu_items')
        .insert({
          outlet_id: newOutlet.id,
          category_id: mappedCategoryId,
          name: item.name,
          description: item.description,
          sku: item.sku ? `${item.sku}-C` : null,
          barcode: item.barcode,
          selling_price: item.selling_price,
          cost_price: item.cost_price,
          is_active: item.is_active,
          is_available: item.is_available,
          image_url: item.image_url,
          preparation_time: item.preparation_time,
          is_taxable: item.is_taxable,
          tax_rate: item.tax_rate,
          is_service_charge_applicable: item.is_service_charge_applicable,
          recipe: item.recipe,
          modifiers: item.modifiers,
          item_type: item.item_type,
          prep_required: item.prep_required,
          prep_station_id: item.prep_station_id,
          recipe_id: item.recipe_id,
          time_based_pricing_rule_id: item.time_based_pricing_rule_id,
        });

      if (!itemError) clonedMenuItems++;
    }
  }

  // Clone prep station links
  const { data: sourceStationLinks } = await supabaseAdmin
    .from('pos_outlet_prep_stations')
    .select('station_id')
    .eq('outlet_id', outletId);

  if (sourceStationLinks && sourceStationLinks.length > 0) {
    const newLinks = sourceStationLinks.map(l => ({
      outlet_id: newOutlet.id,
      station_id: l.station_id,
    }));
    await supabaseAdmin.from('pos_outlet_prep_stations').insert(newLinks);
  }

  cacheService.invalidatePattern('pos:*');

  return res.status(201).json({
    cloned_outlet: newOutlet,
    cloned_tax_profile_id: clonedTaxProfileId,
    cloned_gl_mapping_id: clonedGlMappingId,
    cloned_categories: categoryMap.size,
    cloned_menu_items: clonedMenuItems,
    cloned_station_links: sourceStationLinks?.length || 0,
  });
});

// ── Menu Builder: pos_menus CRUD ────────────────────────────────────────

// GET /outlets-list — lightweight outlet list for dropdowns (authenticate only, no pos_settings:read)
router.get('/outlets-list', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('pos_outlets')
    .select('id, name, outlet_type, code, is_active')
    .eq('is_active', true)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ outlets: data || [] });
});

// GET /menus — list all menus
router.get('/menus', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { menu_type, status } = req.query;
  let query = supabaseAdmin.from('pos_menus').select('*');
  if (menu_type) query = query.eq('menu_type', menu_type);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ menus: data || [] });
});

// GET /menus/:id — get a single menu with courses, items, and outlet assignments
router.get('/menus/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;

  const { data: menu, error: menuErr } = await supabaseAdmin
    .from('pos_menus').select('*').eq('id', id).single();
  if (menuErr) return res.status(404).json({ error: 'Menu not found' });

  const { data: courses } = await supabaseAdmin
    .from('pos_menu_courses').select('*').eq('menu_id', id).order('sequence_number');

  const { data: courseItems } = await supabaseAdmin
    .from('pos_menu_course_items').select(`
      id, menu_id, course_id, item_id, price_override, is_supplement, supplement_price, sort_order,
      item:pos_menu_items(id, name, selling_price, is_available, image_url, item_type)
    `).eq('menu_id', id).order('sort_order');

  const { data: assignments } = await supabaseAdmin
    .from('pos_menu_outlet_assignments').select(`
      id, menu_id, outlet_id, is_primary, active_from, active_to,
      outlet:pos_outlets(id, name, outlet_type, code)
    `).eq('menu_id', id);

  return res.json({
    ...menu,
    courses: courses || [],
    course_items: courseItems || [],
    outlet_assignments: assignments || [],
  });
});

// POST /menus — create a new menu
router.post('/menus', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { name, description, menu_type, base_price, day_part, status, valid_from, valid_to } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  const { data, error } = await supabaseAdmin.from('pos_menus').insert({
    name, description, menu_type: menu_type || 'a_la_carte',
    base_price: base_price || null, day_part: day_part || null,
    status: status || 'draft', valid_from: valid_from || null, valid_to: valid_to || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.status(201).json(data);
});

// PUT /menus/:id — update a menu
router.put('/menus/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const updates: Record<string, any> = {};
  const fields = ['name', 'description', 'menu_type', 'base_price', 'day_part', 'status', 'valid_from', 'valid_to'];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin.from('pos_menus').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json(data);
});

// DELETE /menus/:id — delete a menu (cascades to courses, items, assignments)
router.delete('/menus/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('pos_menus').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json({ success: true });
});

// ── Menu Builder: pos_menu_courses CRUD ─────────────────────────────────

// POST /menus/:menuId/courses — add a course to a menu
router.post('/menus/:menuId/courses', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { menuId } = req.params;
  const { name, sequence_number, choice_count, fire_mode, day_of_week } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  const { data, error } = await supabaseAdmin.from('pos_menu_courses').insert({
    menu_id: menuId,
    name,
    sequence_number: sequence_number || 1,
    choice_count: choice_count || 1,
    fire_mode: fire_mode || 'immediate',
    day_of_week: day_of_week || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.status(201).json(data);
});

// PUT /menus/:menuId/courses/:courseId — update a course
router.put('/menus/:menuId/courses/:courseId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { courseId } = req.params;
  const updates: Record<string, any> = {};
  const fields = ['name', 'sequence_number', 'choice_count', 'fire_mode', 'day_of_week'];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin.from('pos_menu_courses').update(updates).eq('id', courseId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json(data);
});

// DELETE /menus/:menuId/courses/:courseId — delete a course
router.delete('/menus/:menuId/courses/:courseId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { courseId } = req.params;
  const { error } = await supabaseAdmin.from('pos_menu_courses').delete().eq('id', courseId);
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json({ success: true });
});

// ── Menu Builder: pos_menu_course_items CRUD ────────────────────────────

// POST /menus/:menuId/items — assign an item to a menu/course
router.post('/menus/:menuId/items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { menuId } = req.params;
  const { item_id, course_id, price_override, is_supplement, supplement_price, sort_order } = req.body || {};
  if (!item_id) return res.status(400).json({ error: 'item_id is required' });

  const { data, error } = await supabaseAdmin.from('pos_menu_course_items').insert({
    menu_id: menuId,
    item_id,
    course_id: course_id || null,
    price_override: price_override || null,
    is_supplement: is_supplement || false,
    supplement_price: supplement_price || null,
    sort_order: sort_order || 0,
  }).select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Item already assigned to this menu/course' });
    return res.status(500).json({ error: error.message });
  }
  cacheService.invalidatePattern('menus:*');
  return res.status(201).json(data);
});

// PUT /menus/:menuId/items/:itemId — update a menu course item
router.put('/menus/:menuId/items/:itemId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { itemId } = req.params;
  const updates: Record<string, any> = {};
  const fields = ['course_id', 'price_override', 'is_supplement', 'supplement_price', 'sort_order'];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const { data, error } = await supabaseAdmin.from('pos_menu_course_items').update(updates).eq('id', itemId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json(data);
});

// DELETE /menus/:menuId/items/:itemId — remove an item from a menu
router.delete('/menus/:menuId/items/:itemId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { itemId } = req.params;
  const { error } = await supabaseAdmin.from('pos_menu_course_items').delete().eq('id', itemId);
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json({ success: true });
});

// ── Menu Builder: pos_menu_outlet_assignments CRUD ──────────────────────

// POST /menus/:menuId/assignments — assign a menu to an outlet
router.post('/menus/:menuId/assignments', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { menuId } = req.params;
  const { outlet_id, is_primary, active_from, active_to } = req.body || {};
  if (!outlet_id) return res.status(400).json({ error: 'outlet_id is required' });

  // If is_primary, unset other primaries for this outlet first
  if (is_primary) {
    await supabaseAdmin
      .from('pos_menu_outlet_assignments')
      .update({ is_primary: false })
      .eq('outlet_id', outlet_id)
      .eq('is_primary', true);
  }

  const { data, error } = await supabaseAdmin.from('pos_menu_outlet_assignments').insert({
    menu_id: menuId, outlet_id,
    is_primary: is_primary || false,
    active_from: active_from || null, active_to: active_to || null,
  }).select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Menu already assigned to this outlet' });
    return res.status(500).json({ error: error.message });
  }
  cacheService.invalidatePattern('menus:*');
  return res.status(201).json(data);
});

// DELETE /menus/:menuId/assignments/:assignmentId — unassign a menu from an outlet
router.delete('/menus/:menuId/assignments/:assignmentId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { assignmentId } = req.params;
  const { error } = await supabaseAdmin.from('pos_menu_outlet_assignments').delete().eq('id', assignmentId);
  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidatePattern('menus:*');
  return res.json({ success: true });
});

// ── Outlet Active Menus Resolution (§3: Menu resolution at checkout) ────

// GET /outlets/:outletId/active-menus — get active menus for an outlet with courses and items
router.get('/outlets/:outletId/active-menus', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId } = req.params;

  // Get active menu assignments for this outlet
  const { data: assignments, error: assignErr } = await supabaseAdmin
    .from('pos_menu_outlet_assignments')
    .select(`
      is_primary, active_from, active_to,
      menu:pos_menus(id, name, menu_type, base_price, day_part, status)
    `)
    .eq('outlet_id', outletId)
    .eq('menu.status', 'active');
  if (assignErr) return res.status(500).json({ error: assignErr.message });

  const activeMenus = (assignments || []).filter((a: any) => {
    const today = new Date().toISOString().split('T')[0];
    const fromOk = !a.active_from || a.active_from <= today;
    const toOk = !a.active_to || a.active_to >= today;
    return fromOk && toOk;
  });

  const result: any[] = [];
  for (const assignment of activeMenus as any[]) {
    const menu = Array.isArray(assignment.menu) ? assignment.menu[0] : assignment.menu;
    if (!menu) continue;

    // Get courses
    const { data: courses } = await supabaseAdmin
      .from('pos_menu_courses')
      .select('*')
      .eq('menu_id', menu.id)
      .order('sequence_number');

    // Get course items with item details
    const { data: courseItems } = await supabaseAdmin
      .from('pos_menu_course_items')
      .select(`
        id, course_id, item_id, price_override, is_supplement, supplement_price, sort_order,
        item:pos_menu_items(id, name, selling_price, is_available, image_url, item_type, prep_required)
      `)
      .eq('menu_id', menu.id)
      .order('sort_order');

    result.push({
      ...menu,
      is_primary: assignment.is_primary,
      courses: courses || [],
      items: courseItems || [],
    });
  }

  // Sort: primary first
  result.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  return res.json({ menus: result });
});

export default router;
