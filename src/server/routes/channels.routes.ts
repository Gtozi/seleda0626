import { Router } from 'express';
import crypto from 'crypto';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { autoAssignRoomsForPublicBookings } from '../services/sharedServices';

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('channel_connections')
    .select('*')
    .order('channel_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ channels: data });
});

// Update channel connection (credentials, settings, active toggle)
router.patch('/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const allowedFields = ['credentials', 'active', 'test_mode', 'sync_interval_minutes', 'rate_parity_enabled', 'rate_parity_threshold', 'inventory_sync_enabled', 'booking_sync_enabled', 'settings', 'webhook_url'];
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('channel_connections')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ channel: data });
});

// Get channel room mappings
router.get('/:id/mappings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('channel_room_mapping')
    .select('*, room_types(name)')
    .eq('channel_id', id)
    .order('channel_room_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ mappings: data });
});

// Upsert channel room mapping
router.put('/:id/mappings', authenticate, requirePermission('settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { our_room_type_id, channel_room_code, channel_room_name, rate_multiplier, active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('channel_room_mapping')
    .upsert({
      channel_id: id,
      our_room_type_id,
      channel_room_code,
      channel_room_name,
      rate_multiplier: rate_multiplier || 1.0,
      active: active !== false,
    }, { onConflict: 'channel_id,our_room_type_id' })
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ mapping: data });
});

// Sync inventory to a channel (push availability)
router.post('/:id/sync-inventory', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { startDate, endDate } = req.body;
  const { data: channels } = await supabaseAdmin.from('channel_connections').select('*').eq('id', id).single();
  if (!channels) return res.status(404).json({ error: 'Channel not found' });

  // Get room types and mappings
  const { data: mappings } = await supabaseAdmin
    .from('channel_room_mapping')
    .select('*, room_types(id, name)')
    .eq('channel_id', id)
    .eq('active', true);

  const { data: rooms } = await supabaseAdmin.from('rooms').select('*');
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('room_type_id, check_in_date, check_out_date, status, channel')
    .in('status', ['Confirmed', 'CheckedIn', 'Waitlisted']);

  const syncId = crypto.randomUUID();
  let processed = 0, successful = 0, failed = 0;
  const start = new Date(startDate || new Date());
  const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));
  const errors: any[] = [];

  for (const mapping of (mappings || [])) {
    const roomTypeId = mapping.our_room_type_id;
    // Sellable capacity excludes rooms that are physically unavailable
    // (Out of Order / Out of Service / Maintenance).
    const UNSELLABLE_STATUSES = new Set(['Out of Order', 'Out of Service', 'Maintenance']);
    const roomTypeRooms = (rooms || []).filter((r: any) =>
      (r.room_type_id === roomTypeId || r.type === mapping.room_types?.name) &&
      !UNSELLABLE_STATUSES.has(r.status)
    );
    const totalCapacity = roomTypeRooms.length;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      // Only confirmed-consuming reservations block inventory; Waitlisted
      // bookings are overflow-tolerant except Direct Website public bookings.
      const booked = (reservations || []).filter((r: any) =>
        r.room_type_id === roomTypeId &&
        (r.status === 'Confirmed' || r.status === 'CheckedIn' ||
         (r.status === 'Waitlisted' && r.channel === 'Direct Website')) &&
        r.check_in_date <= dateStr &&
        r.check_out_date > dateStr
      ).length;
      const available = Math.max(0, totalCapacity - booked);

      const snapResult = await supabaseAdmin
        .from('channel_inventory_snapshot')
        .upsert({
          channel_id: id,
          room_type_id: roomTypeId,
          date: dateStr,
          total_rooms: totalCapacity,
          available_rooms: available,
          booked_rooms: booked,
          sync_status: 'synced',
          synced_at: new Date().toISOString(),
        }, { onConflict: 'channel_id,room_type_id,date' });
      const snapError = snapResult.error;
      if (snapError) {
        await supabaseAdmin.from('channel_inventory_snapshot').update({
          sync_status: 'failed',
          error_message: snapError.message,
        }).eq('channel_id', id).eq('room_type_id', roomTypeId).eq('date', dateStr);
      }

      processed++;
      if (snapError) { failed++; errors.push({ date: dateStr, error: snapError.message }); }
      else successful++;
    }
  }

  // Log the sync
  await supabaseAdmin.from('inventory_sync_log').insert({
    sync_id: syncId,
    channel_id: id,
    sync_type: 'full',
    sync_start: new Date().toISOString(),
    sync_end: new Date().toISOString(),
    records_processed: processed,
    records_successful: successful,
    records_failed: failed,
    status: failed === 0 ? 'success' : 'partial',
    error_summary: errors.length > 0 ? errors : null,
    trigger_type: 'manual',
  });

  // Update channel last_sync
  await supabaseAdmin.from('channel_connections').update({
    last_sync_at: new Date().toISOString(),
    last_sync_status: failed === 0 ? 'success' : 'partial',
  }).eq('id', id);

  res.json({ success: true, syncId, processed, successful, failed });
});

// Sync rates to a channel (push our rates)
router.post('/:id/sync-rates', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  const { data: mappings } = await supabaseAdmin
    .from('channel_room_mapping')
    .select('*, room_types(id, name)')
    .eq('channel_id', id)
    .eq('active', true);

  const { data: seasons } = await supabaseAdmin.from('seasons').select('*');
  const { data: roomTypes } = await supabaseAdmin.from('room_types').select('*');

  const syncId = crypto.randomUUID();
  let processed = 0, successful = 0, failed = 0;

  const start = new Date(startDate || new Date());
  const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));

  for (const mapping of (mappings || [])) {
    const roomType = roomTypes?.find((rt: any) => rt.id === mapping.our_room_type_id);
    if (!roomType) continue;
    const baseRate = roomType.base_rate || roomType.default_rate || 100;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      // Simple rate calculation: base * seasonal multiplier * channel rate_multiplier
      const season = (seasons || []).find((s: any) => s.start_date <= dateStr && s.end_date >= dateStr);
      const seasonMult = season?.multiplier || 1.0;
      const ourRate = Math.round(baseRate * seasonMult * (mapping.rate_multiplier || 1.0) * 100) / 100;

      const rateResult = await supabaseAdmin
        .from('rate_sync_log')
        .insert({
          sync_id: syncId,
          channel_id: id,
          room_type_id: mapping.our_room_type_id,
          date: dateStr,
          our_rate: ourRate,
          sync_status: 'synced',
          synced_at: new Date().toISOString(),
        });
      const rateError = rateResult.error;
      if (rateError) {
        await supabaseAdmin.from('rate_sync_log').update({
          sync_status: 'failed',
          error_message: rateError.message,
        }).eq('sync_id', syncId).eq('channel_id', id).eq('room_type_id', mapping.our_room_type_id).eq('date', dateStr);
      }

      processed++;
      if (rateError) failed++; else successful++;
    }
  }

  await supabaseAdmin.from('channel_connections').update({
    last_sync_at: new Date().toISOString(),
    last_sync_status: failed === 0 ? 'success' : 'partial',
  }).eq('id', id);

  res.json({ success: true, syncId, processed, successful, failed });
});

// Fetch bookings from a channel (inbound sync)
router.post('/:id/sync-bookings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  const { data: channel } = await supabaseAdmin.from('channel_connections').select('channel_name').eq('id', id).single();

  // For now, this pulls existing channel_bookings and checks for unsynced ones
  const { data: unsynced, error } = await supabaseAdmin
    .from('channel_bookings')
    .select('*')
    .eq('channel_id', id)
    .eq('sync_status', 'pending')
    .gte('check_in_date', startDate || new Date().toISOString().split('T')[0])
    .lte('check_out_date', endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);

  if (error) return res.status(500).json({ error: error.message });

  let imported = 0;
  const newReservationIds: string[] = [];
  for (const booking of (unsynced || [])) {
    // Create reservation from channel booking if not already linked
    if (!booking.reservation_id) {
      const { data: newRes, error: resError } = await supabaseAdmin
        .from('reservations')
        .insert({
          guest_name: booking.guest_name,
          guest_email: booking.guest_email,
          guest_phone: booking.guest_phone,
          room_type_id: booking.room_type_id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          adults: booking.adults,
          children: booking.children,
          total_amount: booking.total_amount,
          status: 'Confirmed',
          channel: channel?.channel_name || 'OTA',
        })
        .select('id')
        .single();

      if (!resError && newRes) {
        newReservationIds.push(newRes.id);
        await supabaseAdmin.from('channel_bookings')
          .update({ reservation_id: newRes.id, sync_status: 'synced', updated_at: new Date().toISOString() })
          .eq('id', booking.id);
        imported++;
      }
    } else {
      await supabaseAdmin.from('channel_bookings')
        .update({ sync_status: 'synced', updated_at: new Date().toISOString() })
        .eq('id', booking.id);
    }
  }

  // Auto-assign rooms to newly imported channel reservations with
  // DB-level conflict checking to prevent double-booking.
  if (newReservationIds.length > 0) {
    try {
      await autoAssignRoomsForPublicBookings(
        newReservationIds, supabaseAdmin,
        unsynced?.[0]?.check_in_date, unsynced?.[0]?.check_out_date
      );
    } catch (e) {
      console.error('Auto-assign failed for channel import:', e);
    }
  }

  res.json({ success: true, processed: unsynced?.length || 0, imported });
});

// Sync all channels (inventory + rates + bookings)
router.post('/sync-all', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { startDate, endDate } = req.body;
  const { data: channels } = await supabaseAdmin
    .from('channel_connections')
    .select('*')
    .eq('active', true);

  const results: any[] = [];
  const { data: mappings } = await supabaseAdmin
    .from('channel_room_mapping')
    .select('*, room_types(id, name, base_rate, default_rate)')
    .in('channel_id', (channels || []).map((c: any) => c.id))
    .eq('active', true);
  const { data: rooms } = await supabaseAdmin.from('rooms').select('*');
  const { data: allReservations } = await supabaseAdmin
    .from('reservations')
    .select('room_type_id, check_in_date, check_out_date, status, channel')
    .in('status', ['Confirmed', 'CheckedIn', 'Waitlisted']);
  const { data: seasons } = await supabaseAdmin.from('seasons').select('*');

  // Sellable capacity excludes rooms that are physically unavailable.
  const UNSELLABLE_STATUSES = new Set(['Out of Order', 'Out of Service', 'Maintenance']);

  for (const channel of (channels || [])) {
    try {
      const channelMappings = (mappings || []).filter((m: any) => m.channel_id === channel.id);
      let invProcessed = 0, invSuccess = 0, rateProcessed = 0, rateSuccess = 0;
      const start = new Date(startDate || new Date());
      const end = new Date(endDate || new Date(Date.now() + 30 * 86400000));

      for (const mapping of channelMappings) {
        const roomTypeId = mapping.our_room_type_id;
        const totalCapacity = (rooms || []).filter((r: any) =>
          r.room_type_id === roomTypeId && !UNSELLABLE_STATUSES.has(r.status)
        ).length;
        const roomType = mapping.room_types;
        const baseRate = roomType?.base_rate || roomType?.default_rate || 100;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // Only confirmed-consuming reservations block inventory; Waitlisted
          // bookings are overflow-tolerant except Direct Website public bookings.
          const booked = (allReservations || []).filter((r: any) =>
            r.room_type_id === roomTypeId &&
            (r.status === 'Confirmed' || r.status === 'CheckedIn' ||
             (r.status === 'Waitlisted' && r.channel === 'Direct Website')) &&
            r.check_in_date <= dateStr && r.check_out_date > dateStr
          ).length;
          const available = Math.max(0, totalCapacity - booked);

          const invResult = await supabaseAdmin.from('channel_inventory_snapshot').upsert({
            channel_id: channel.id, room_type_id: roomTypeId, date: dateStr,
            total_rooms: totalCapacity, available_rooms: available, booked_rooms: booked,
            sync_status: 'synced', synced_at: new Date().toISOString(),
          }, { onConflict: 'channel_id,room_type_id,date' });
          const invErr = invResult.error;
          if (invErr) {
            await supabaseAdmin.from('channel_inventory_snapshot').update({
              sync_status: 'failed',
            }).eq('channel_id', channel.id).eq('room_type_id', roomTypeId).eq('date', dateStr);
          }
          invProcessed++;
          if (!invErr) invSuccess++;

          const season = (seasons || []).find((s: any) => s.start_date <= dateStr && s.end_date >= dateStr);
          const ourRate = Math.round((baseRate * (season?.multiplier || 1.0) * (mapping.rate_multiplier || 1.0)) * 100) / 100;
          const rateResult2 = await supabaseAdmin.from('rate_sync_log').insert({
            sync_id: crypto.randomUUID(), channel_id: channel.id, room_type_id: roomTypeId,
            date: dateStr, our_rate: ourRate, sync_status: 'synced', synced_at: new Date().toISOString(),
          });
          const rateErr = rateResult2.error;
          if (rateErr) {
            await supabaseAdmin.from('rate_sync_log').update({
              sync_status: 'failed',
            }).eq('sync_id', crypto.randomUUID()).eq('channel_id', channel.id).eq('room_type_id', roomTypeId).eq('date', dateStr);
          }
          rateProcessed++;
          if (!rateErr) rateSuccess++;
        }
      }

      await supabaseAdmin.from('channel_connections').update({
        last_sync_at: new Date().toISOString(), last_sync_status: 'success',
      }).eq('id', channel.id);

      results.push({ channelId: channel.id, channelName: channel.channel_name, inventory: { processed: invProcessed, successful: invSuccess }, rates: { processed: rateProcessed, successful: rateSuccess } });
    } catch (err: any) {
      results.push({ channelId: channel.id, channelName: channel.channel_name, error: err.message });
    }
  }

  res.json({ success: true, results });
});

// Webhook receiver for inbound channel notifications
router.post('/:id/webhook', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const webhookType = req.headers['x-webhook-type'] as string || 'booking';
  const payload = req.body;

  // Log the webhook
  const { error } = await supabaseAdmin.from('webhook_log').insert({
    channel_id: id,
    webhook_type: webhookType,
    payload: payload,
    headers: req.headers,
    processed: false,
    processing_status: 'pending',
    ip_address: req.ip,
  });

  if (error) return res.status(500).json({ error: error.message });

  // Respond 200 immediately; processing happens async
  res.json({ received: true, message: 'Webhook logged for processing' });
});

// Get rate parity monitor data
router.get('/parity-status', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('rate_parity_monitor')
    .select('*, channel_connections(channel_name), room_types(name)')
    .order('date', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ parityRecords: data });
});

// Get channel bookings
router.get('/:id/bookings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('channel_bookings')
    .select('*')
    .eq('channel_id', id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ bookings: data });
});

// Get channel performance metrics
router.get('/:id/performance', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('channel_performance')
    .select('*')
    .eq('channel_id', id)
    .order('date', { ascending: false })
    .limit(30);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ performance: data });
});

// Get sync logs
router.get('/:id/sync-logs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { type } = req.query;
  const table = type === 'rate' ? 'rate_sync_log' : type === 'booking' ? 'booking_sync_log' : 'inventory_sync_log';
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq('channel_id', id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data });
});

// Get channel overview (aggregate view)
router.get('/overview', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('channel_overview')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ overview: data });
});

export default router;
