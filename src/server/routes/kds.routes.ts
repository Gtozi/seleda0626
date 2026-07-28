import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── KDS Instance CRUD ────────────────────────────────────────────────────

// GET / — list all KDS instances (optionally filter by property_id)
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { property_id, is_active } = req.query as Record<string, string>;

  let query = supabaseAdmin.from('kds_instances').select('*');
  if (property_id) query = query.eq('property_id', property_id);
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ instances: data || [] });
});

// GET /:instanceId — get a single KDS instance with its POS connections
router.get('/:instanceId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { data: instance, error } = await supabaseAdmin
    .from('kds_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  if (error) return res.status(404).json({ error: error.message });

  // Fetch connected POS outlets
  const { data: connections } = await supabaseAdmin
    .from('kds_pos_connections')
    .select(`
      id, is_active, item_type_filter, feedback_webhook_url, priority_weight,
      outlet:pos_outlets(id, name, outlet_type, code, requires_kds)
    `)
    .eq('kds_instance_id', instanceId);

  // Fetch external POS systems
  const { data: externalSystems } = await supabaseAdmin
    .from('kds_external_pos_systems')
    .select('id, system_name, system_type, is_active, last_order_at, total_orders_received')
    .eq('kds_instance_id', instanceId);

  return res.json({
    ...instance,
    pos_connections: connections || [],
    external_pos_systems: externalSystems || [],
  });
});

// POST / — create a new KDS instance
router.post('/', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  const {
    name, description, instance_type, property_id,
    display_config, station_filter, display_device_id,
  } = req.body || {};

  if (!name) return res.status(400).json({ error: 'name is required' });

  const insertData: Record<string, any> = {
    name,
    instance_type: instance_type || 'combined',
    is_active: true,
  };
  if (description !== undefined) insertData.description = description;
  if (property_id !== undefined) insertData.property_id = property_id || null;
  if (display_config !== undefined) insertData.display_config = display_config;
  if (station_filter !== undefined) insertData.station_filter = station_filter;
  if (display_device_id !== undefined) insertData.display_device_id = display_device_id || null;

  const { data, error } = await supabaseAdmin.from('kds_instances').insert(insertData).select().single();

  if (error) {
    console.error('KDS instance create error:', error);
    return res.status(500).json({ error: error.message });
  }

  cacheService.invalidatePattern('kds:*');
  return res.status(201).json(data);
});

// PUT /:instanceId — update KDS instance config
router.put('/:instanceId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const updates: Record<string, any> = {};
  const fields = [
    'name', 'description', 'instance_type', 'property_id',
    'display_config', 'station_filter', 'display_device_id', 'is_active',
  ];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const { data, error } = await supabaseAdmin
    .from('kds_instances')
    .update(updates)
    .eq('id', instanceId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// DELETE /:instanceId — delete a KDS instance
router.delete('/:instanceId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { error } = await supabaseAdmin
    .from('kds_instances')
    .delete()
    .eq('id', instanceId);

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json({ success: true });
});

// ── KDS Instance Heartbeat ──────────────────────────────────────────────
// POST /:instanceId/heartbeat — display device checks in
router.post('/:instanceId/heartbeat', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { error } = await supabaseAdmin
    .from('kds_instances')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', instanceId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true, timestamp: new Date().toISOString() });
});

// ── POS Outlet Connections ──────────────────────────────────────────────

// GET /:instanceId/connections — list POS outlets connected to this KDS
router.get('/:instanceId/connections', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('kds_pos_connections')
    .select(`
      id, is_active, item_type_filter, feedback_webhook_url, priority_weight, prep_station_id, created_at,
      outlet:pos_outlets(id, name, outlet_type, code, requires_kds)
    `)
    .eq('kds_instance_id', instanceId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ connections: data || [] });
});

// POST /:instanceId/connections — connect a POS outlet to this KDS
router.post('/:instanceId/connections', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const {
    outlet_id, item_type_filter, feedback_webhook_url, feedback_api_key, priority_weight, prep_station_id,
  } = req.body || {};

  if (!outlet_id) return res.status(400).json({ error: 'outlet_id is required' });

  const { data, error } = await supabaseAdmin.from('kds_pos_connections').insert({
    kds_instance_id: instanceId,
    outlet_id,
    item_type_filter: item_type_filter || ['Prepared'],
    feedback_webhook_url: feedback_webhook_url || null,
    feedback_api_key: feedback_api_key || null,
    priority_weight: priority_weight || 1,
    prep_station_id: prep_station_id || null,
    is_active: true,
  }).select().single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This outlet is already connected to this KDS instance' });
    }
    return res.status(500).json({ error: error.message });
  }

  cacheService.invalidatePattern('kds:*');
  return res.status(201).json(data);
});

// PUT /:instanceId/connections/:connectionId — update a connection
router.put('/:instanceId/connections/:connectionId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { connectionId } = req.params;

  const updates: Record<string, any> = {};
  const fields = ['item_type_filter', 'feedback_webhook_url', 'feedback_api_key', 'priority_weight', 'is_active', 'prep_station_id'];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const { data, error } = await supabaseAdmin
    .from('kds_pos_connections')
    .update(updates)
    .eq('id', connectionId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// DELETE /:instanceId/connections/:connectionId — disconnect a POS outlet
router.delete('/:instanceId/connections/:connectionId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { connectionId } = req.params;

  const { error } = await supabaseAdmin
    .from('kds_pos_connections')
    .delete()
    .eq('id', connectionId);

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json({ success: true });
});

// ── External POS System Connections ─────────────────────────────────────

// GET /:instanceId/external-pos — list external POS systems
router.get('/:instanceId/external-pos', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('kds_external_pos_systems')
    .select('id, system_name, system_type, is_active, last_order_at, total_orders_received, created_at')
    .eq('kds_instance_id', instanceId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ external_systems: data || [] });
});

// POST /:instanceId/external-pos — register an external POS system
router.post('/:instanceId/external-pos', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { system_name, system_type, webhook_url } = req.body || {};
  if (!system_name) return res.status(400).json({ error: 'system_name is required' });

  // Generate API key
  const apiKey = `kds_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const { data, error } = await supabaseAdmin.from('kds_external_pos_systems').insert({
    kds_instance_id: instanceId,
    system_name,
    system_type: system_type || 'generic',
    api_key: apiKey,
    webhook_url: webhook_url || null,
    is_active: true,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// DELETE /:instanceId/external-pos/:systemId — remove external POS
router.delete('/:instanceId/external-pos/:systemId', authenticate, requirePermission('pos_settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { systemId } = req.params;

  const { error } = await supabaseAdmin
    .from('kds_external_pos_systems')
    .delete()
    .eq('id', systemId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true });
});

// ── External POS Order Ingestion Webhook ────────────────────────────────
// POST /external/:apiKey/orders — external POS posts orders here
// This is the key endpoint that enables any external POS to send to KDS
router.post('/external/:apiKey/orders', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { apiKey } = req.params;

  // Validate API key
  const { data: extSystem, error: authError } = await supabaseAdmin
    .from('kds_external_pos_systems')
    .select('id, kds_instance_id, is_active, system_name')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (authError || !extSystem) {
    return res.status(401).json({ error: 'Invalid or inactive API key' });
  }

  const {
    order_id, table_number, customer_name, order_type,
    items, course_group, priority, notes, station_id,
  } = req.body || {};

  if (!order_id || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'order_id and items[] are required' });
  }

  // Determine target prep station
  let targetStationId = station_id || null;
  let targetPrepTime = 15;

  if (!targetStationId && items.length > 0) {
    // Try to find a station from the first item's menu mapping
    const firstItemName = items[0]?.name;
    if (firstItemName) {
      const { data: menuItem } = await supabaseAdmin
        .from('pos_menu_items')
        .select('prep_station_id')
        .eq('name', firstItemName)
        .limit(1)
        .single();
      if (menuItem?.prep_station_id) {
        targetStationId = menuItem.prep_station_id;
      }
    }
  }

  if (targetStationId) {
    const { data: station } = await supabaseAdmin
      .from('pos_prep_stations')
      .select('target_prep_time_minutes')
      .eq('id', targetStationId)
      .single();
    if (station) targetPrepTime = station.target_prep_time_minutes;
  }

  // Create KDS order
  const { data: ticket, error: ticketError } = await supabaseAdmin.from('kds_orders').insert({
    order_id: `ext_${order_id}`,
    kds_instance_id: extSystem.kds_instance_id,
    outlet_id: null,  // external POS orders don't have an internal outlet
    station_id: targetStationId,
    table_number: table_number || null,
    customer_name: customer_name || null,
    order_type: order_type || 'dine_in',
    items,
    course_group: course_group || 'main',
    priority: priority || 'normal',
    status: 'fired',
    fired_at: new Date().toISOString(),
    target_prep_time_minutes: targetPrepTime,
    notes: notes || `External POS: ${extSystem.system_name}`,
  }).select().single();

  if (ticketError) return res.status(500).json({ error: ticketError.message });

  // Update external POS stats
  await supabaseAdmin
    .from('kds_external_pos_systems')
    .update({
      last_order_at: new Date().toISOString(),
      total_orders_received: (extSystem.total_orders_received || 0) + 1,
    })
    .eq('id', extSystem.id);

  cacheService.invalidatePattern('kds:*');

  return res.status(201).json({
    success: true,
    ticket_id: ticket.id,
    kds_instance_id: extSystem.kds_instance_id,
  });
});

// ── KDS Tickets by Instance ─────────────────────────────────────────────
// GET /:instanceId/tickets — get all active tickets for a specific KDS display
router.get('/:instanceId/tickets', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;
  const { station_id, status } = req.query as Record<string, string>;

  let query = supabaseAdmin
    .from('kds_orders')
    .select('*')
    .eq('kds_instance_id', instanceId);

  if (station_id) query = query.eq('station_id', station_id);
  if (status) {
    query = query.eq('status', status);
  } else {
    query = query.in('status', ['fired', 'in_progress', 'ready', 'recalled']);
  }

  const { data: tickets, error } = await query.order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  // Get station filter from instance config
  const { data: instance } = await supabaseAdmin
    .from('kds_instances')
    .select('station_filter, display_config')
    .eq('id', instanceId)
    .single();

  let filteredTickets = tickets || [];
  if (instance?.station_filter && Array.isArray(instance.station_filter) && instance.station_filter.length > 0) {
    filteredTickets = filteredTickets.filter(t =>
      !t.station_id || instance.station_filter.includes(t.station_id)
    );
  }

  return res.json({
    tickets: filteredTickets,
    display_config: instance?.display_config || {},
  });
});

// ── KDS Expo View by Instance ───────────────────────────────────────────
// GET /:instanceId/expo — aggregate expo view for a specific KDS
router.get('/:instanceId/expo', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;

  const { data: tickets, error } = await supabaseAdmin
    .from('kds_orders')
    .select('*')
    .eq('kds_instance_id', instanceId)
    .in('status', ['fired', 'in_progress', 'ready'])
    .order('created_at', { ascending: true });

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
        course_group: ticket.course_group,
        tickets: [],
        station_count: new Set(),
        ready_count: 0,
      });
    }
    const expo = expoMap.get(key);
    expo.tickets.push(ticket);
    expo.station_count.add(ticket.station_id);
    if (ticket.status === 'ready') expo.ready_count++;
  }

  const expoData = Array.from(expoMap.values()).map(e => ({
    ...e,
    station_count: e.station_count.size,
    all_ready: e.station_count.size > 0 && e.ready_count === e.station_count.size,
  }));

  return res.json({ expo: expoData });
});

// ── KDS Station Performance by Instance ─────────────────────────────────
// GET /:instanceId/performance — station performance metrics for this KDS
router.get('/:instanceId/performance', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { instanceId } = req.params;
  const lookbackHours = parseInt(req.query.lookback as string) || 24;
  const since = new Date(Date.now() - lookbackHours * 3600000).toISOString();

  const { data: tickets, error } = await supabaseAdmin
    .from('kds_orders')
    .select('id, station_id, status, fired_at, served_at, ready_at, target_prep_time_minutes, course_group')
    .eq('kds_instance_id', instanceId)
    .gte('created_at', since);

  if (error) return res.status(500).json({ error: error.message });

  // Get station names
  const stationIds = [...new Set((tickets || []).map(t => t.station_id).filter(Boolean))];
  const { data: stations } = await supabaseAdmin
    .from('pos_prep_stations')
    .select('id, station_name, station_type')
    .in('id', stationIds);

  const stationMap = new Map((stations || []).map(s => [s.id, s]));

  // Aggregate per station
  const perfMap = new Map<string, any>();
  for (const t of tickets || []) {
    const sid = t.station_id || 'unassigned';
    if (!perfMap.has(sid)) {
      const st = stationMap.get(t.station_id);
      perfMap.set(sid, {
        station_id: sid,
        station_name: st?.station_name || 'Unassigned',
        station_type: st?.station_type || 'unknown',
        total_tickets: 0,
        served_tickets: 0,
        voided_tickets: 0,
        recalled_tickets: 0,
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
      if (prepTime <= (t.target_prep_time_minutes || 15)) {
        p.on_time_count++;
      } else {
        p.late_count++;
      }
    }
    if (t.status === 'voided') p.voided_tickets++;
    if (t.status === 'recalled') p.recalled_tickets++;
  }

  const perfData = Array.from(perfMap.values()).map(p => ({
    ...p,
    avg_prep_time_minutes: p.served_tickets > 0
      ? Math.round((p.total_prep_time_minutes / p.served_tickets) * 10) / 10
      : 0,
    on_time_rate: p.served_tickets > 0
      ? Math.round((p.on_time_count / p.served_tickets) * 100)
      : 0,
    recall_rate: p.total_tickets > 0
      ? Math.round((p.recalled_tickets / p.total_tickets) * 100)
      : 0,
  }));

  return res.json({ performance: perfData });
});

// ── KDS Ticket Status Update (standalone) ───────────────────────────────
// PUT /tickets/:ticketId/status — update ticket status from KDS display
router.put('/tickets/:ticketId/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ticketId } = req.params;
  const { status, bumped_by } = req.body || {};

  const validStatuses = ['fired', 'in_progress', 'ready', 'served', 'recalled', 'voided'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updates: Record<string, any> = { status };
  const now = new Date().toISOString();
  if (status === 'in_progress') updates.in_progress_at = now;
  if (status === 'ready') updates.ready_at = now;
  if (status === 'served') {
    updates.served_at = now;
    if (bumped_by) updates.bumped_by = bumped_by;
  }
  if (status === 'recalled') {
    updates.recalled_at = now;
    if (req.body.recalled_reason) updates.recalled_reason = req.body.recalled_reason;
  }

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Propagate to POS transaction line items if transaction_id exists
  if (data.transaction_id && (status === 'served' || status === 'voided')) {
    try {
      const { data: txn } = await supabaseAdmin
        .from('pos_transactions')
        .select('line_items')
        .eq('id', data.transaction_id)
        .single();

      if (txn?.line_items && Array.isArray(txn.line_items)) {
        const updatedItems = txn.line_items.map((item: any) => {
          if (item.kds_ticket_id === ticketId || item.name === (data.items?.[0]?.name)) {
            return { ...item, kds_status: status };
          }
          return item;
        });

        await supabaseAdmin
          .from('pos_transactions')
          .update({ line_items: updatedItems })
          .eq('id', data.transaction_id);
      }
    } catch (err) {
      console.error('KDS→POS feedback propagation failed:', err);
    }
  }

  // Course grouping fire logic — auto-fire next course
  if (status === 'served' && data.course_group) {
    const courseOrder = ['starter', 'main', 'dessert'];
    const currentCourseIdx = courseOrder.indexOf(data.course_group);
    if (currentCourseIdx >= 0 && currentCourseIdx < courseOrder.length - 1) {
      const nextCourse = courseOrder[currentCourseIdx + 1];
      const { data: heldTickets } = await supabaseAdmin
        .from('kds_orders')
        .select('id')
        .eq('order_id', data.order_id)
        .eq('course_group', nextCourse)
        .eq('status', 'held');

      if (heldTickets && heldTickets.length > 0) {
        await supabaseAdmin
          .from('kds_orders')
          .update({ status: 'fired', fired_at: now })
          .in('id', heldTickets.map(t => t.id));
      }
    }
  }

  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// POST /tickets/:ticketId/recall — recall a ticket
router.post('/tickets/:ticketId/recall', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ticketId } = req.params;
  const { recalled_reason } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update({
      status: 'recalled',
      recalled_at: new Date().toISOString(),
      recalled_reason: recalled_reason || 'Requested by kitchen',
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json(data);
});

// POST /orders/:orderId/fire-course — fire next course group
router.post('/orders/:orderId/fire-course', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { orderId } = req.params;
  const { course_group } = req.body || {};

  if (!course_group) return res.status(400).json({ error: 'course_group is required' });

  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .update({ status: 'fired', fired_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .eq('course_group', course_group)
    .eq('status', 'held')
    .select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidatePattern('kds:*');
  return res.json({ fired: data?.length || 0, tickets: data || [] });
});

export default router;
