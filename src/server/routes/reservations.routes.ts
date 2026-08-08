import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';
import { getRequestUser } from '../services/sessionService';
import { setAuditContext } from '../authHelpers';
import { mapFolioFromDb, mapFolioLineFromDb, mapFolioPaymentFromDb } from '../../services/dataMapper';
import { roomApiSchema, guestApiSchema, reservationApiSchema, roomTypeApiSchema, ratePlanApiSchema, seasonApiSchema, packageApiSchema, yieldPolicyApiSchema, airportShuttleApiSchema } from '../../schemas/backendSchemas';

const router = Router();

// ── Rooms ──────────────────────────────────────────────────────

router.post('/rooms', authenticate, requirePermission('property:manage'), async (req, res) => {
  const body = req.body;
  const isArray = Array.isArray(body);
  const validation = isArray
    ? z.array(roomApiSchema).safeParse(body)
    : roomApiSchema.safeParse(body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const payload = validation.data as any;
  const { error } = await supabaseAdmin.from('rooms').upsert(payload, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'rooms.upserted', entityType: 'Room', module: 'property', details: { count: isArray ? (payload as any[]).length : 1 } });
  res.json({ success: true });
});

router.patch('/rooms/:id/status', authenticate, requirePermission('property:manage'), async (req, res) => {
  const statusSchema = z.object({ status: z.enum(['Vacant Clean', 'Vacant Dirty', 'Occupied Clean', 'Occupied Dirty', 'Occupied', 'Out of Order', 'Maintenance']) });
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  // The :id param may be either a room id (e.g. "RM-...") or a room number (e.g. "01").
  // Try matching by number first (the common case from the FrontDesk), then fall back to id.
  let updateQuery = supabaseAdmin.from('rooms').update(validation.data).eq('number', id);
  const { data: byNumber, error: errNumber } = await updateQuery.select('id');
  if (errNumber) return res.status(500).json({ error: errNumber.message });
  if (!byNumber || byNumber.length === 0) {
    const { error: errId } = await supabaseAdmin.from('rooms').update(validation.data).eq('id', id);
    if (errId) return res.status(500).json({ error: errId.message });
  }
  await writeAuditEvent({ req, user: req.user!, action: 'room.status_changed', entityType: 'Room', entityId: id, module: 'property', details: validation.data });
  res.json({ success: true });
});

router.delete('/rooms/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('rooms').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room.deleted', entityType: 'Room', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Guests ─────────────────────────────────────────────────────

router.post('/guests', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const validation = guestApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('guests').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'guest.upserted', entityType: 'Guest', entityId: validation.data.id, module: 'guests' });
  res.json({ success: true });
});

// ── Airport Shuttle Requests ───────────────────────────────────

router.post('/airport-shuttle-requests', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const validation = airportShuttleApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('airport_shuttle_requests').insert(validation.data);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'shuttle.created', entityType: 'AirportShuttleRequest', entityId: validation.data.id, module: 'operations' });
  res.json({ success: true });
});

router.patch('/airport-shuttle-requests/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const partialShuttleSchema = airportShuttleApiSchema.partial();
  const validation = partialShuttleSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('airport_shuttle_requests').update(validation.data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'shuttle.updated', entityType: 'AirportShuttleRequest', entityId: id, module: 'operations' });
  res.json({ success: true });
});

router.delete('/airport-shuttle-requests/:id', authenticate, requirePermission('reservation:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('airport_shuttle_requests').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'shuttle.deleted', entityType: 'AirportShuttleRequest', entityId: id, module: 'operations' });
  res.json({ success: true });
});

// ── Reservations ───────────────────────────────────────────────

router.post('/reservations', authenticate, requirePermission('reservation:create'), async (req, res) => {
  // Handle new reservation structure with rooms array and group fields
  const { 
    guest_id, 
    check_in_date, 
    check_out_date, 
    adults, 
    children, 
    source, 
    status, 
    total_amount, 
    deposit_amount, 
    balance,
    rooms,
    group_name,
    primary_contact,
    travel_agency,
    corporation
  } = req.body;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });

  try {
    // Generate reservation ID
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build reservation data
    const reservationData: any = {
      id: reservationId,
      guest_id: guest_id || 'GUEST-TEMP',
      guest_name: 'Guest Name', // TODO: Get from guest_id
      guest_email: 'guest@example.com',
      guest_phone: '',
      guest_status: 'Regular',
      room_type: rooms?.[0]?.roomType || 'Standard',
      check_in_date: check_in_date,
      check_out_date: check_out_date,
      adults: adults,
      children: children,
      status: status || 'Confirmed',
      rate: total_amount / (Math.ceil((new Date(check_out_date).getTime() - new Date(check_in_date).getTime()) / (1000 * 60 * 60 * 24)) || 1),
      total_amount: total_amount,
      channel: source || 'Direct Website',
      payment_status: 'Unpaid',
      deposit_amount: deposit_amount || 0,
      is_deposit_paid: deposit_amount > 0,
      // Group fields
      group_name: group_name || null,
      primary_contact: primary_contact || null,
      travel_agency: travel_agency || null,
      corporation: corporation || null,
      is_group: !!group_name
    };

    // Insert reservation
    const { error: insertError } = await supabaseAdmin
      .from('reservations')
      .insert(reservationData);

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Insert reservation_rooms if provided
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      const roomEntries = rooms.map((room: any) => ({
        reservation_id: reservationId,
        room_type: room.roomType,
        room_number: room.roomNumber || null,
        adults: room.adults,
        children: room.children,
        amount: room.amount,
        check_in_date: check_in_date,
        check_out_date: check_out_date
      }));

      const { error: roomsInsertError } = await supabaseAdmin
        .from('reservation_rooms')
        .insert(roomEntries);

      if (roomsInsertError) console.error('Error inserting reservation rooms:', roomsInsertError);
    }

    await writeAuditEvent({
      req,
      user: req.user!,
      action: 'reservation.created',
      entityType: 'Reservation',
      entityId: reservationId,
      module: 'reservations',
      details: { ...reservationData, rooms }
    });

    res.json({ success: true, reservationId });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

router.put('/reservations/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const validation = reservationApiSchema.safeParse({ ...req.body, id: req.params.id });
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('reservations').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'reservation.updated', entityType: 'Reservation', entityId: id, module: 'reservations' });
  res.json({ success: true });
});

// ── Rate Plans ─────────────────────────────────────────────────

router.post('/rate-plans', authenticate, requirePermission('property:manage'), async (req, res) => {
  const validation = ratePlanApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('rate_plans').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'rate_plan.upserted', entityType: 'RatePlan', entityId: validation.data.id, module: 'property' });
  res.json({ success: true });
});

router.delete('/rate-plans/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('rate_plans').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'rate_plan.deleted', entityType: 'RatePlan', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Room Types ─────────────────────────────────────────────────

router.post('/room-types', authenticate, requirePermission('property:manage'), async (req, res) => {
  const validation = roomTypeApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('room_types').insert(validation.data);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room_type.created', entityType: 'RoomType', entityId: validation.data.id, module: 'property' });
  res.json({ success: true });
});

router.patch('/room-types/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  const partialRoomTypeSchema = roomTypeApiSchema.partial();
  const validation = partialRoomTypeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('room_types').update(validation.data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room_type.updated', entityType: 'RoomType', entityId: id, module: 'property' });
  res.json({ success: true });
});

router.delete('/room-types/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('room_types').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room_type.deleted', entityType: 'RoomType', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Seasons ────────────────────────────────────────────────────

router.post('/seasons', authenticate, requirePermission('property:manage'), async (req, res) => {
  const validation = seasonApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('seasons').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'season.upserted', entityType: 'Season', entityId: validation.data.id, module: 'property' });
  res.json({ success: true });
});

router.delete('/seasons/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('seasons').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'season.deleted', entityType: 'Season', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Packages ───────────────────────────────────────────────────

router.post('/packages', authenticate, requirePermission('property:manage'), async (req, res) => {
  const validation = packageApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('packages').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'package.upserted', entityType: 'Package', entityId: validation.data.id, module: 'property' });
  res.json({ success: true });
});

router.delete('/packages/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('packages').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'package.deleted', entityType: 'Package', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Yield Policies ─────────────────────────────────────────────

router.post('/yield-policies', authenticate, requirePermission('property:manage'), async (req, res) => {
  const validation = yieldPolicyApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('yield_policies').insert(validation.data);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'yield_policy.created', entityType: 'YieldPolicy', entityId: validation.data.id, module: 'property' });
  res.json({ success: true });
});

router.patch('/yield-policies/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  const partialYieldSchema = yieldPolicyApiSchema.partial();
  const validation = partialYieldSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('yield_policies').update(validation.data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'yield_policy.updated', entityType: 'YieldPolicy', entityId: id, module: 'property' });
  res.json({ success: true });
});

router.delete('/yield-policies/:id', authenticate, requirePermission('property:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('yield_policies').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'yield_policy.deleted', entityType: 'YieldPolicy', entityId: id, module: 'property' });
  res.json({ success: true });
});

// ── Reservation Actions (assign-room, change-room, check-in, no-show, cancel) ──

// Assign a room to a reservation with DB-level overlap conflict checking.
// Uses the assign_room RPC which locks rows and verifies no other
// Confirmed/CheckedIn reservation overlaps on the same room for the same dates.
router.post('/:id/assign-room', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const reservationId = req.params.id;
  const { roomNumber } = req.body;

  if (!roomNumber || typeof roomNumber !== 'string') {
    return res.status(400).json({ error: 'roomNumber is required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('assign_room', {
      p_reservation_id: reservationId,
      p_room_number: roomNumber,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Room assignment failed' });

    return res.json({ success: true, reservationId, roomNumber: data.roomNumber });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/:id/change-room', authenticate, requirePermission('reservation:update'), async (req, res) => {

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('change_room', {
        p_reservation_id: reservationId,
        p_new_room_number: roomNumber,
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Room change failed' });

      return res.json({ success: true, reservationId, fromRoom: data.fromRoom, toRoom: data.toRoom });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.post('/:id/check-in', async (req, res) => {
    // Optional authentication for development - try to get user but don't require it
    try {
      const user = await getRequestUser(req);
      if (user) {
        req.user = user;
        await setAuditContext(user.id);
      }
    } catch (error) {
      console.warn('Optional authentication failed, proceeding without user context:', error);
    }

    const reservationId = req.params.id;
    const { roomNumber } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string') {
      return res.status(400).json({ error: 'roomNumber is required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        // Step 0: Verify the reservation is scheduled to check in today.
        // Check-in is only permitted on the reservation's check-in date.
        const { data: existingReservation, error: fetchError } = await supabaseAdmin
          .from('reservations')
          .select('id, check_in_date, status')
          .eq('id', reservationId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching reservation for check-in date validation:', fetchError);
          return res.status(500).json({ error: fetchError.message });
        }
        if (!existingReservation) {
          return res.status(404).json({ error: 'Reservation not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        if (existingReservation.check_in_date !== today) {
          return res.status(400).json({
            error: `Check-in is only allowed on the reservation's check-in date (${existingReservation.check_in_date}). Today is ${today}.`
          });
        }

        // Step 0b: Verify the room is not already booked by another
        // Confirmed/CheckedIn reservation for overlapping dates. This prevents
        // double-booking at check-in time.
        const { data: existingReservationFull, error: fetchFullError } = await supabaseAdmin
          .from('reservations')
          .select('check_in_date, check_out_date')
          .eq('id', reservationId)
          .maybeSingle();

        if (fetchFullError || !existingReservationFull) {
          return res.status(500).json({ error: fetchFullError?.message || 'Reservation not found' });
        }

        const { data: roomConflicts, error: conflictError } = await supabaseAdmin
          .from('reservations')
          .select('id, guest_name, check_in_date, check_out_date')
          .eq('room_number', roomNumber)
          .neq('id', reservationId)
          .in('status', ['Confirmed', 'CheckedIn'])
          .lt('check_in_date', existingReservationFull.check_out_date)
          .gt('check_out_date', existingReservationFull.check_in_date)
          .limit(1);

        if (conflictError) {
          console.error('Error checking room conflicts at check-in:', conflictError);
          return res.status(500).json({ error: conflictError.message });
        }

        if (roomConflicts && roomConflicts.length > 0) {
          const c = roomConflicts[0];
          return res.status(409).json({
            error: `Room ${roomNumber} is already booked by reservation ${c.id} (${c.guest_name}) for ${c.check_in_date} to ${c.check_out_date}.`
          });
        }

        // Step 1: Update reservation status
        const { error: updateError } = await supabaseAdmin
          .from('reservations')
          .update({
            status: 'CheckedIn',
            room_number: roomNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', reservationId);

        if (updateError) {
          console.error('Error updating reservation:', updateError);
          return res.status(500).json({ error: updateError.message });
        }

        // Step 2: Check if folio already exists
        const { data: existingFolio } = await supabaseAdmin
          .from('folios')
          .select('id')
          .eq('reservation_id', reservationId)
          .eq('status', 'Open')
          .maybeSingle();

        let folioId = existingFolio?.id;

        // Step 3: Create folio if it doesn't exist
        if (!folioId) {
          // Get reservation details
          const { data: reservation } = await supabaseAdmin
            .from('reservations')
            .select('total_amount, discount_percent, room_type, channel, group_booking_id')
            .eq('id', reservationId)
            .maybeSingle();

          if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
          }

          const isCorporate = reservation.channel === 'Corporate' || reservation.group_booking_id != null;
          const rawTotal = reservation.total_amount || 0;
          const discountPct = reservation.discount_percent || 0;

          if (isCorporate) {
            // Create split folios for corporate
            const folioA = crypto.randomUUID();
            const folioB = crypto.randomUUID();
            const userId = req.user?.id || 'system'; // Fallback for development
            
            await supabaseAdmin.from('folios').insert({
              id: folioA,
              reservation_id: reservationId,
              folio_type: 'Master',
              target_folio: 'A',
              status: 'Open',
              balance: 0,
              total_charges: 0,
              total_payments: 0,
              currency: 'USD',
              opened_at: new Date().toISOString(),
              created_by: userId,
            });

            await supabaseAdmin.from('folios').insert({
              id: folioB,
              reservation_id: reservationId,
              folio_type: 'Guest',
              target_folio: 'B',
              status: 'Open',
              balance: 0,
              total_charges: 0,
              total_payments: 0,
              currency: 'USD',
              opened_at: new Date().toISOString(),
              created_by: userId,
            });

            // Post room charge to Master folio
            if (rawTotal > 0) {
              await supabaseAdmin.rpc('post_folio_charge', {
                p_folio_id: folioA,
                p_description: `Room charge - ${reservation.room_type || 'reservation'}`,
                p_amount: rawTotal,
                p_quantity: 1,
                p_line_type: 'Room',
                p_revenue_account_code: null,
                p_user_id: userId,
                p_source_reference: null,
                p_discount_percent: discountPct,
              });
            }

            folioId = folioA; // Return Master folio ID
          } else {
            // Create single folio for individual bookings
            folioId = crypto.randomUUID();
            const userId = req.user?.id || 'system'; // Fallback for development
            
            await supabaseAdmin.from('folios').insert({
              id: folioId,
              reservation_id: reservationId,
              folio_type: 'Guest',
              status: 'Open',
              balance: 0,
              total_charges: 0,
              total_payments: 0,
              currency: 'USD',
              opened_at: new Date().toISOString(),
              created_by: userId,
            });

            // Post room charge
            if (rawTotal > 0) {
              await supabaseAdmin.rpc('post_folio_charge', {
                p_folio_id: folioId,
                p_description: `Room charge - ${reservation.room_type || 'reservation'}`,
                p_amount: rawTotal,
                p_quantity: 1,
                p_line_type: 'Room',
                p_revenue_account_code: null,
                p_user_id: userId,
                p_source_reference: null,
                p_discount_percent: discountPct,
              });
            }
          }
        }

        return res.json({ success: true, reservationId, roomNumber, status: 'CheckedIn', folioId });
      } catch (error: any) {
        console.error('Check-in error:', error);
        return res.status(500).json({ error: error.message || 'Check-in failed' });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // No-Show: mark reservation as NoShow with auto penalty charge
router.post('/:id/no-show', authenticate, requirePermission('reservation:update'), async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('process_no_show', {
        p_reservation_id: reservationId,
        p_user_id: req.user!.id,
      });

      if (error) {
        console.error('process_no_show RPC error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.success) return res.status(409).json({ error: data?.error || 'No-show processing failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Cancel with auto penalty charge based on grace period
router.post('/:id/cancel', authenticate, requirePermission('reservation:update'), async (req, res) => {
    const reservationId = req.params.id;
    const { reason } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('process_cancellation_penalty', {
        p_reservation_id: reservationId,
        p_user_id: req.user!.id,
        p_reason: reason || null,
      });

      if (error) {
        console.error('process_cancellation_penalty RPC error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Cancellation failed' });

      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Re-lookup helper used both for the happy path and as a race-recovery path
  // when a concurrent request wins the insert race (unique violation).
  async function findOpenFolio(reservationId: string, targetFolio?: string) {
    let query = supabaseAdmin!
      .from('folios')
      .select('id, folio_type, target_folio')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open');

    if (targetFolio) {
      query = query.eq('target_folio', targetFolio);
    } else {
      query = query.in('folio_type', ['Guest', 'Master']);
    }

    const { data: existing } = await query.maybeSingle();
    if (existing) return existing.id;

    // If no primary folio exists but other folios do, get the first open one
    const { data: anyFolio } = await supabaseAdmin!
      .from('folios')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('status', 'Open')
      .maybeSingle();
    return anyFolio ? anyFolio.id : null;
  }

  async function ensureFolio(reservationId: string, userId: string, targetFolio?: string) {
    if (!supabaseAdmin) return null;

    const existingId = await findOpenFolio(reservationId, targetFolio);
    if (existingId) return existingId;

    const { data: reservation } = await supabaseAdmin
      .from('reservations')
      .select('status, total_amount, channel, group_booking_id, discount_percent, room_type')
      .eq('id', reservationId)
      .maybeSingle();

    if (!reservation) return null;

    const isCorporate = reservation.channel === 'Corporate' || reservation.group_booking_id != null;

    // Pre-tax base amount for the initial charge. The discount is now applied
    // inside post_folio_charge RPC via p_discount_percent parameter, ensuring
    // consistent fee/tax calculation with the backend. This folio-creation fallback
    // path runs whenever a charge/payment is posted BEFORE check_in_reservation
    // has run (e.g., collecting a pre-arrival deposit), so without seeding a real
    // charge line here the folio would sit at $0.00 total_charges forever.
    const rawTotal = reservation.total_amount || 0;
    const discountPct = reservation.discount_percent || 0;

    if (isCorporate) {
      // Create split folios: Master (A) + Guest (B). The `folios.balance`/
      // `total_charges` columns start at 0 (they're just a cache); the real
      // room charge is posted as an actual folio_line via post_folio_charge
      // below so /folio-balance and /payments (which sum folio_lines/
      // folio_payments directly) see the true amount due.
      const folioA = crypto.randomUUID();
      const folioB = crypto.randomUUID();
      const { error: errA } = await supabaseAdmin.from('folios').insert({
        id: folioA,
        reservation_id: reservationId,
        folio_type: 'Master',
        target_folio: 'A',
        status: 'Open',
        balance: 0,
        total_charges: 0,
        total_payments: 0,
        currency: 'USD',
        opened_at: new Date().toISOString(),
        created_by: userId,
      });
      if (errA?.code === '23505') {
        // Lost the creation race - another request created it concurrently.
        const raceWinner = await findOpenFolio(reservationId, targetFolio);
        if (raceWinner) return raceWinner;
      }
      await supabaseAdmin.from('folios').insert({
        id: folioB,
        reservation_id: reservationId,
        folio_type: 'Guest',
        target_folio: 'B',
        status: 'Open',
        balance: 0,
        total_charges: 0,
        total_payments: 0,
        currency: 'USD',
        opened_at: new Date().toISOString(),
        created_by: userId,
      });

      // Corporate stays put the room charge on the Master (A) folio, same as
      // check_in_reservation - the Guest (B) folio stays at $0 for incidentals.
      if (rawTotal > 0) {
        await supabaseAdmin.rpc('post_folio_charge', {
          p_folio_id: folioA,
          p_description: `Room charge - ${reservation.room_type || 'reservation'} (pre-arrival)`,
          p_amount: rawTotal,
          p_quantity: 1,
          p_line_type: 'Room',
          p_revenue_account_code: null,
          p_user_id: userId,
          p_source_reference: null,
          p_discount_percent: discountPct,
        });
      }
      return targetFolio === 'B' ? folioB : folioA;
    }

    // Individual booking: single Guest folio
    const folioId = crypto.randomUUID();
    const { error: errGuest } = await supabaseAdmin.from('folios').insert({
      id: folioId,
      reservation_id: reservationId,
      folio_type: 'Guest',
      status: 'Open',
      balance: 0,
      total_charges: 0,
      total_payments: 0,
      currency: 'USD',
      opened_at: new Date().toISOString(),
      created_by: userId,
    });
    if (errGuest?.code === '23505') {
      // Lost the creation race - another request created it concurrently.
      const raceWinner = await findOpenFolio(reservationId, targetFolio);
      if (raceWinner) return raceWinner;
    }

    if (rawTotal > 0) {
      await supabaseAdmin.rpc('post_folio_charge', {
        p_folio_id: folioId,
        p_description: `Room charge - ${reservation.room_type || 'reservation'} (pre-arrival)`,
        p_amount: rawTotal,
        p_quantity: 1,
        p_line_type: 'Room',
        p_revenue_account_code: null,
        p_user_id: userId,
        p_source_reference: null,
        p_discount_percent: discountPct,
      });
    }
    return folioId;
  }

// ── Reservation Charges & Folio ──────────────────────────────────────────

router.post('/:id/charges', authenticate, async (req, res) => {

    const reservationId = req.params.id;
    const { description, amount, quantity, lineType, revenueAccountCode, sourceReference, discountPercent, targetFolio, usaliCode, usaliRevenueCode, usaliCostCode, department } = req.body;

    if (!description || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'description and positive amount are required' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, req.user!.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      const { data, error } = await supabaseAdmin.rpc('post_folio_charge', {
        p_folio_id: folioId,
        p_description: description,
        p_amount: amount,
        p_quantity: quantity || 1,
        p_line_type: lineType || 'Extra',
        p_revenue_account_code: revenueAccountCode || null,
        p_user_id: req.user!.id,
        p_source_reference: sourceReference || null,
        p_discount_percent: discountPercent || 0,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Charge failed' });

      // Update folio line with USALI codes if provided
      const updates: Record<string, any> = {};
      if (usaliCode) updates.usali_code = usaliCode;
      if (usaliRevenueCode) updates.usali_revenue_code = usaliRevenueCode;
      if (usaliCostCode) updates.usali_cost_code = usaliCostCode;
      if (department) updates.department = department;
      
      // If an explicit targetFolio was provided, stamp it on the line row.
      // post_folio_charge inherits target_folio from the folio itself; a per-
      // charge override (e.g. manually routing to A or B) requires a follow-up
      // update here. This also fires the sync trigger so reservations.charges
      // gets the correct targetFolio in its JSONB.
      if (targetFolio === 'A' || targetFolio === 'B') {
        updates.target_folio = targetFolio;
      }

      // Apply all updates (USALI codes + targetFolio) in a single call
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('folio_lines')
          .update(updates)
          .eq('id', data.lineId);
      }

      // Keep the cached folio totals and reservation.payment_status in sync
      // with the newly added charge (single source of truth = folio_lines).
      const { data: recomputed } = await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: folioId });
      await supabaseAdmin.rpc('sync_reservation_payment_status', { p_folio_id: folioId });

      return res.json({
        success: true,
        folioId,
        lineId: data.lineId,
        lineNumber: data.lineNumber,
        newBalance: recomputed?.balance ?? data.newBalance,
      });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.get('/:id/folio-balance', authenticate, async (req, res) => {
    const reservationId = req.params.id;
    const { folioType = 'consolidated' } = req.query; // 'consolidated', 'folio-a', 'folio-b'

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const folioId = await ensureFolio(reservationId, req.user!.id);
        if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

        // Get the folio's own target_folio to use as fallback for lines that
        // have NULL target_folio (single non-split folio scenario).
        const { data: folioRow } = await supabaseAdmin
          .from('folios')
          .select('target_folio')
          .eq('id', folioId)
          .single();
        const folioOwnTarget: string | null = folioRow?.target_folio ?? null;

        // Get total charges
        const { data: chargesData } = await supabaseAdmin
          .from('folio_lines')
          .select('amount, target_folio')
          .eq('folio_id', folioId)
          .eq('is_voided', false);

        // Get total payments
        const { data: paymentsData } = await supabaseAdmin
          .from('folio_payments')
          .select('amount, target_folio')
          .eq('folio_id', folioId)
          .eq('is_voided', false);

        // Resolve a line/payment's effective folio side, falling back to the
        // folio's own target_folio when the row has NULL.
        const resolveTarget = (rowTarget: string | null) =>
          rowTarget ?? folioOwnTarget;

        let totalCharges = 0;
        let totalPayments = 0;

        if (folioType === 'consolidated') {
          totalCharges = (chargesData || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        } else if (folioType === 'folio-a') {
          totalCharges = (chargesData || []).filter((c: any) => resolveTarget(c.target_folio) === 'A').reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).filter((p: any) => resolveTarget(p.target_folio) === 'A').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        } else if (folioType === 'folio-b') {
          totalCharges = (chargesData || []).filter((c: any) => resolveTarget(c.target_folio) === 'B').reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          totalPayments = (paymentsData || []).filter((p: any) => resolveTarget(p.target_folio) === 'B').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        }

        const outstandingBalance = Math.round((totalCharges - totalPayments) * 100) / 100;

        return res.json({
          folioId,
          folioType,
          totalCharges: Math.round(totalCharges * 100) / 100,
          totalPayments: Math.round(totalPayments * 100) / 100,
          outstandingBalance
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Get reservation balance from database (DB-only calculation)
router.get('/:id/balance', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_reservation_balance', {
          p_reservation_id: reservationId,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Canonical folio read endpoint (Phase 2)
  // Returns the folios, itemized charges/payments and computed balances for a reservation
  // so the frontend no longer needs to parse the legacy reservations.charges/payments JSONB.
  // Also returns a billing breakdown from get_reservation_billing RPC (Step 2.2).
router.get('/:id/folio', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data: folios, error: foliosError } = await supabaseAdmin
          .from('folios')
          .select('*')
          .eq('reservation_id', reservationId)
          .order('opened_at', { ascending: false });

        if (foliosError) return res.status(500).json({ error: foliosError.message });

        const folioIds = (folios || []).map(f => f.id);

        const [{ data: lines }, { data: payments }, { data: billingBreakdown, error: rpcError }] = await Promise.all([
          supabaseAdmin
            .from('folio_lines')
            .select('*')
            .in('folio_id', folioIds)
            .eq('is_voided', false)
            .order('line_number', { ascending: true }),
          supabaseAdmin
            .from('folio_payments')
            .select('*')
            .in('folio_id', folioIds)
            .eq('is_voided', false)
            .order('payment_date', { ascending: true }),
          supabaseAdmin.rpc('get_reservation_billing', { p_reservation_id: reservationId }),
        ]);

        if (rpcError) {
          console.error('[folio endpoint] get_reservation_billing RPC error:', rpcError.message);
        }

        return res.json({
          folios: (folios || []).map(mapFolioFromDb),
          lines: (lines || []).map(mapFolioLineFromDb),
          payments: (payments || []).map(mapFolioPaymentFromDb),
          consolidatedBalance: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.balance) || 0),
            0
          ),
          consolidatedCharges: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.total_charges) || 0),
            0
          ),
          consolidatedPayments: (folios || []).reduce(
            (sum: number, f: any) => sum + (Number(f.total_payments) || 0),
            0
          ),
          billingBreakdown: billingBreakdown || null,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

  // Get reservation total breakdown from database (DB-only calculation)
router.get('/:id/total', authenticate, async (req, res) => {
    const reservationId = req.params.id;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_reservation_total', {
          p_reservation_id: reservationId,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.post('/:id/payments', authenticate, async (req, res) => {

    const reservationId = req.params.id;
    const { amount, paymentMethod, reference, receiptUrl, idempotencyKey, bankAccountId, paymentSplits } = req.body;

    // Support both single payment and split payments
    const splits = paymentSplits || [{ amount, paymentMethod, reference, receiptUrl, bankAccountId, idempotencyKey }];

    // Validate splits
    const totalSplitAmount = splits.reduce((sum: number, split: any) => sum + (split.amount || 0), 0);
    if (typeof totalSplitAmount !== 'number' || totalSplitAmount <= 0) {
      return res.status(400).json({ error: 'Total payment amount must be positive' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const folioId = await ensureFolio(reservationId, req.user!.id);
      if (!folioId) return res.status(404).json({ error: 'Reservation not found or cannot create folio' });

      // Calculate outstanding balance at the endpoint level for total validation
      const { data: folioData } = await supabaseAdmin
        .from('folios')
        .select('status')
        .eq('id', folioId)
        .single();

      if (!folioData || folioData.status !== 'Open') {
        return res.status(400).json({ error: 'Folio is not open' });
      }

      // Get total charges
      const { data: chargesData } = await supabaseAdmin
        .from('folio_lines')
        .select('amount')
        .eq('folio_id', folioId)
        .eq('is_voided', false);

      const totalCharges = Math.round((chargesData || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0) * 100) / 100;

      // Get total payments
      const { data: paymentsData } = await supabaseAdmin
        .from('folio_payments')
        .select('amount')
        .eq('folio_id', folioId)
        .eq('is_voided', false);

      const totalPayments = Math.round((paymentsData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) * 100) / 100;

      const outstandingBalance = Math.round((totalCharges - totalPayments) * 100) / 100;

      // Validate total payment amount against outstanding balance
      // Use a larger tolerance for floating point precision issues
      if (totalSplitAmount > outstandingBalance + 0.05) {
        return res.status(409).json({
          error: 'Payment amount exceeds outstanding balance',
          outstandingBalance: Math.round(outstandingBalance * 100) / 100,
          requestedAmount: Math.round(totalSplitAmount * 100) / 100
        });
      }

      const paymentResults = [];
      const now = new Date().toISOString();

      // Look up the cashier's currently open shift so payments can be linked to it
      let openShiftId: string | null = null;
      try {
        const { data: openShift } = await supabaseAdmin
          .from('cashier_shifts')
          .select('id')
          .eq('cashier_user_id', req.user!.id)
          .eq('status', 'open')
          .order('opened_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        openShiftId = openShift?.id ?? null;
      } catch { /* cashier_shifts table may not exist yet */ }

      // Get VAT rate from settings (default 15%)
      const { data: settings } = await supabaseAdmin
        .from('global_settings')
        .select('tax_percent, revenue_mappings')
        .eq('id', 'main')
        .single();

      const vatRate = (settings?.tax_percent || 15) / 100;
      const revenueAccountCode = settings?.revenue_mappings?.roomRevenueAccount || '4010';

      // Process each payment split
      for (const split of splits) {
        const { amount: splitAmount, paymentMethod: splitMethod, reference: splitReference, receiptUrl: splitReceiptUrl, bankAccountId: splitBankAccountId, idempotencyKey: splitIdempotencyKey } = split;
        
        if (!splitMethod || typeof splitAmount !== 'number' || splitAmount <= 0) {
          return res.status(400).json({ error: 'Each split must have a valid amount and payment method' });
        }

        const { data, error } = await supabaseAdmin.rpc('post_folio_payment', {
          p_folio_id: folioId,
          p_amount: splitAmount,
          p_payment_method: splitMethod,
          p_reference: splitReference || null,
          p_user_id: req.user!.id,
          p_receipt_url: splitReceiptUrl || null,
          p_idempotency_key: splitIdempotencyKey || null,
          p_bank_account_id: splitBankAccountId || null,
        });

        if (error) return res.status(500).json({ error: error.message });
        if (!data?.success) return res.status(409).json({ error: data?.error || 'Payment failed' });

        // Handle idempotent response
        if (data?.idempotent) {
          paymentResults.push({
            success: true,
            folioId,
            paymentId: data.paymentId,
            idempotent: true,
            message: data.message,
            amount: splitAmount,
            method: splitMethod
          });
          continue;
        }

        // Link payment to the cashier's open shift (if any)
        if (data?.paymentId && openShiftId) {
          try {
            await supabaseAdmin
              .from('folio_payments')
              .update({ shift_id: openShiftId, cashier_id: req.user!.id })
              .eq('id', data.paymentId);
          } catch { /* non-fatal — payment still posted */ }
        }

        // Sync folio.balance and total_payments (the 8-param RPC doesn't do this)
        try {
          const { data: bal } = await supabaseAdmin
            .from('folio_lines')
            .select('amount')
            .eq('folio_id', folioId)
            .eq('is_voided', false);
          const { data: pays } = await supabaseAdmin
            .from('folio_payments')
            .select('amount')
            .eq('folio_id', folioId)
            .eq('is_voided', false);
          const totalCharges = (bal || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
          const totalPays = (pays || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
          await supabaseAdmin
            .from('folios')
            .update({ balance: totalCharges - totalPays, total_payments: totalPays, updated_at: new Date().toISOString() })
            .eq('id', folioId);
        } catch { /* non-fatal */ }

        // Create journal entry for this split
        try {
          const paymentId = data.paymentId;
          const vatAmount = splitAmount * vatRate;
          
          // Create journal entry
          const { data: journalEntry } = await supabaseAdmin
            .from('journal_entries')
            .insert({
              id: crypto.randomUUID(),
              date: now.split('T')[0],
              reference: `FOLIO-PAY-${paymentId}`,
              description: `Folio Payment - Reservation ${reservationId} (${splitMethod})`,
              status: 'Posted',
              created_by: req.user!.id,
              amount: splitAmount,
              department: 'Rooms'
            })
            .select('id')
            .single();
          
          if (journalEntry) {
            const journalEntryId = journalEntry.id;
            
            // Get bank account details if provided
            let bankAccount = null;
            if (splitBankAccountId) {
              const { data: ba } = await supabaseAdmin
                .from('bank_accounts')
                .select('coa_account_code, bank_name')
                .eq('id', splitBankAccountId)
                .single();
              bankAccount = ba;
            }
            
            const coaAccountCode = bankAccount?.coa_account_code || '1100';
            const accountName = bankAccount?.bank_name || 'Accounts Receivable';
            
            // Debit leg: Bank account or Accounts Receivable
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: coaAccountCode,
              account_name: accountName,
              description: `Payment received for folio ${folioId} (${splitMethod})`,
              debit: splitAmount,
              credit: 0
            });
            
            // Credit leg: Revenue account (excluding VAT)
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: revenueAccountCode,
              account_name: 'Room Revenue',
              description: `Room revenue from folio ${folioId} (${splitMethod})`,
              debit: 0,
              credit: splitAmount - vatAmount
            });
            
            // Credit leg: VAT Payable
            await supabaseAdmin.from('journal_lines').insert({
              id: crypto.randomUUID(),
              journal_id: journalEntryId,
              account_id: '2020',
              account_name: 'VAT Payable',
              description: `VAT on folio payment ${folioId} (${splitMethod})`,
              debit: 0,
              credit: vatAmount
            });
            
            // Update chart of accounts balances
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', coaAccountCode).single()).data?.balance + splitAmount })
              .eq('code', coaAccountCode);
            
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', revenueAccountCode).single()).data?.balance - (splitAmount - vatAmount) })
              .eq('code', revenueAccountCode);
            
            await supabaseAdmin
              .from('chart_of_accounts')
              .update({ balance: (await supabaseAdmin.from('chart_of_accounts').select('balance').eq('code', '2020').single()).data?.balance - vatAmount })
              .eq('code', '2020');
          }
        } catch (journalError) {
          console.error('Failed to create journal entry:', journalError);
          // Continue anyway - payment was successful
        }

        paymentResults.push({
          success: true,
          folioId,
          paymentId: data.paymentId,
          amount: splitAmount,
          method: splitMethod,
          bankAccountId: splitBankAccountId
        });
      }

      // Recompute the folio's authoritative totals from folio_lines/folio_payments
      // (single source of truth) and sync reservations.payment_status. A partial
      // payment intentionally leaves the folio status untouched (stays 'Open') -
      // only an explicit checkout/invoice action closes a folio.
      const { data: recomputed } = await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: folioId });
      await supabaseAdmin.rpc('sync_reservation_payment_status', { p_folio_id: folioId });

      return res.json({ 
        success: true, 
        folioId, 
        paymentResults,
        totalAmount: totalSplitAmount,
        splitCount: paymentResults.length,
        remainingBalance: recomputed?.balance ?? Math.max(0, outstandingBalance - totalSplitAmount),
        totalCharges: recomputed?.totalCharges,
        totalPayments: recomputed?.totalPayments,
        folioStatus: 'Open',
      });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

// ── Reservation Charge/Payment Void & Move ───────────────────────────────

router.post('/:reservationId/charges/:chargeId/void', authenticate, async (req, res) => {

    const { chargeId } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) return res.status(400).json({ error: 'reason is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc('void_folio_line', {
        p_line_id: chargeId,
        p_reason: reason,
        p_user_id: req.user!.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, lineId: chargeId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.patch('/:reservationId/charges/:chargeId', authenticate, async (req, res) => {
    const { chargeId } = req.params;
    const { targetFolio, amount } = req.body;

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const updates: Record<string, any> = {};
      if (targetFolio === 'A' || targetFolio === 'B' || targetFolio === null) {
        updates.target_folio = targetFolio;
      }
      if (typeof amount === 'number' && amount > 0) {
        updates.amount = amount;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { error } = await supabaseAdmin
        .from('folio_lines')
        .update(updates)
        .eq('id', chargeId);

      if (error) return res.status(500).json({ error: error.message });

      // Fire sync to keep reservations.charges JSONB in sync
      const { data: lineRow } = await supabaseAdmin
        .from('folio_lines')
        .select('folio_id')
        .eq('id', chargeId)
        .single();
      if (lineRow?.folio_id) {
        await supabaseAdmin.rpc('recompute_folio_totals', { p_folio_id: lineRow.folio_id });
      }

      return res.json({ success: true, lineId: chargeId });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.post('/:reservationId/charges/:chargeId/move', authenticate, async (req, res) => {

    const { chargeId, reservationId: sourceReservationId } = req.params;
    const { targetReservationId } = req.body;

    if (!targetReservationId) return res.status(400).json({ error: 'targetReservationId is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      // Find source folio (primary open folio for source reservation)
      const { data: sourceFolio } = await supabaseAdmin
        .from('folios')
        .select('id')
        .eq('reservation_id', sourceReservationId)
        .eq('status', 'Open')
        .in('folio_type', ['Guest', 'Master'])
        .maybeSingle();

      if (!sourceFolio) return res.status(404).json({ error: 'Source folio not found' });

      // Find target folio (primary open folio for target reservation)
      const { data: targetFolio } = await supabaseAdmin
        .from('folios')
        .select('id')
        .eq('reservation_id', targetReservationId)
        .eq('status', 'Open')
        .in('folio_type', ['Guest', 'Master'])
        .maybeSingle();

      if (!targetFolio) {
        // Create folio for target reservation if it doesn't exist
        const targetFolioId = await ensureFolio(targetReservationId, req.user!.id);
        if (!targetFolioId) return res.status(404).json({ error: 'Target reservation not found or cannot create folio' });

        const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
          p_line_id: chargeId,
          p_target_folio_id: targetFolioId,
          p_user_id: req.user!.id,
        });

        if (error) return res.status(500).json({ error: error.message });
        if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

        return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
      }

      const { data, error } = await supabaseAdmin.rpc('move_folio_line', {
        p_line_id: chargeId,
        p_target_folio_id: targetFolio.id,
        p_user_id: req.user!.id,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Move failed' });

      return res.json({ success: true, lineId: chargeId, fromFolio: data.fromFolio, toFolio: data.toFolio });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

router.post('/:reservationId/payments/:paymentId/void', authenticate, async (req, res) => {

    const { paymentId } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) return res.status(400).json({ error: 'reason is required' });

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      const { data: payment } = await supabaseAdmin
        .from('folio_payments')
        .select('id')
        .eq('id', paymentId)
        .eq('is_voided', false)
        .maybeSingle();

      if (!payment) return res.status(404).json({ error: 'Payment not found or already voided' });

      const { data, error } = await supabaseAdmin.rpc('void_folio_line', {
        p_line_id: paymentId,
        p_reason: reason,
        p_user_id: req.user!.id,
        p_approved_by: approvedBy || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      if (!data?.success) return res.status(409).json({ error: data?.error || 'Void failed' });

      return res.json({ success: true, paymentId, amountReversed: data.amountReversed });
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

export default router;
