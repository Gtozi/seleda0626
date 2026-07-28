import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';
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
  const statusSchema = z.object({ status: z.enum(['Vacant Clean', 'Vacant Dirty', 'Occupied', 'Out of Order', 'Maintenance']) });
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('rooms').update(validation.data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room.status_changed', entityType: 'Room', entityId: id, module: 'property', details: validation.data });
  res.json({ success: true });
});

router.patch('/rooms/:number/status', authenticate, requirePermission('property:manage'), async (req, res) => {
  const statusSchema = z.object({ status: z.enum(['Vacant Clean', 'Vacant Dirty', 'Occupied', 'Out of Order', 'Maintenance']) });
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { number } = req.params;
  const { error } = await supabaseAdmin.from('rooms').update(validation.data).eq('number', number);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'room.status_changed', entityType: 'Room', entityId: number, module: 'property', details: validation.data });
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
  const validation = reservationApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('reservations').upsert(validation.data, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'reservation.upserted', entityType: 'Reservation', entityId: validation.data.id, module: 'reservations' });
  res.json({ success: true });
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

export default router;
