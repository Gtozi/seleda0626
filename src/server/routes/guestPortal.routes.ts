import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Guest Portal Routes ─────────────────────────────────────────────────────

// ── Profile & Preferences ─────────────────────────────────────────────────
router.get('/profile/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.params.guestId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.put('/profile/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(req.body)
    .eq('id', req.params.guestId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidate('profile-*');
  return res.json(data);
});

// ── Reservations ───────────────────────────────────────────────────────────
router.get('/reservations/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('check_in_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ reservations: data || [] });
});

router.post('/reservations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert(req.body)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidate('reservation-*');
  return res.status(201).json(data);
});

router.put('/reservations/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidate('reservation-*');
  return res.json(data);
});

router.delete('/reservations/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { error } = await supabaseAdmin
    .from('reservations')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  cacheService.invalidate('reservation-*');
  return res.status(204).send();
});

// ── Digital Check-in ─────────────────────────────────────────────────────
router.get('/checkin/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_checkins')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/checkin', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_checkins')
    .insert({
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/checkin/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_checkins')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Digital Room Key ─────────────────────────────────────────────────────
router.get('/room-keys/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_room_keys')
    .select('*')
    .eq('reservation_id', req.params.reservationId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ keys: data || [] });
});

router.post('/room-keys', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_room_keys')
    .insert({
      ...req.body,
      status: 'active',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/room-keys/:id/revoke', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('digital_room_keys')
    .update({ status: 'revoked' })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Room Service ─────────────────────────────────────────────────────────
router.get('/room-service/menu/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `room-service-menu:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('room_service_menu')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true)
    .order('category', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const result = { menuItems: data || [] };
  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

router.post('/room-service/orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('room_service_orders')
    .insert({
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/room-service/orders/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('room_service_orders')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ orders: data || [] });
});

// ── Restaurant Reservations ───────────────────────────────────────────────
router.get('/restaurants/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `restaurants:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = { restaurants: data || [] };
  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

router.post('/restaurant-reservations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('restaurant_reservations')
    .insert({
      ...req.body,
      status: 'confirmed',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/restaurant-reservations/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('restaurant_reservations')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('reservation_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ reservations: data || [] });
});

// ── Spa & Wellness ───────────────────────────────────────────────────────
router.get('/spa/treatments/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `spa-treatments:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('spa_treatments')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = { treatments: data || [] };
  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

router.post('/spa/bookings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('spa_bookings')
    .insert({
      ...req.body,
      status: 'confirmed',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/spa/bookings/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('spa_bookings')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('booking_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ bookings: data || [] });
});

// ── Concierge Services ───────────────────────────────────────────────────
router.post('/concierge/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('concierge_requests')
    .insert({
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/concierge/requests/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('concierge_requests')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ requests: data || [] });
});

// ── Transportation ─────────────────────────────────────────────────────────
router.get('/transportation/vehicles/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `transportation-vehicles:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('transportation_vehicles')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = { vehicles: data || [] };
  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

router.post('/transportation/bookings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('transportation_bookings')
    .insert({
      ...req.body,
      status: 'confirmed',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Housekeeping Requests ─────────────────────────────────────────────────
router.post('/housekeeping/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('housekeeping_requests')
    .insert({
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/housekeeping/requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('housekeeping_requests')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ requests: data || [] });
});

// ── Maintenance Requests ─────────────────────────────────────────────────
router.post('/maintenance/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .insert({
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/maintenance/requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ requests: data || [] });
});

// ── Events & Activities ───────────────────────────────────────────────────
router.get('/activities/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `activities:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('hotel_activities')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = { activities: data || [] };
  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

router.post('/activity-bookings', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('activity_bookings')
    .insert({
      ...req.body,
      status: 'confirmed',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Loyalty Program ───────────────────────────────────────────────────────
router.get('/loyalty/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('loyalty_programs')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/loyalty/rewards/:tier', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `loyalty-rewards:${req.params.tier}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('loyalty_rewards')
    .select('*')
    .eq('required_tier', req.params.tier)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = { rewards: data || [] };
  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

// ── Wallet & Payments ───────────────────────────────────────────────────
router.get('/wallet/payment-methods/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('payment_methods')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ paymentMethods: data || [] });
});

router.post('/wallet/payment-methods', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('payment_methods')
    .insert(req.body)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/wallet/payments/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_payments')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ payments: data || [] });
});

// ── Billing & Folio ───────────────────────────────────────────────────────
router.get('/billing/folio/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('reservation_folios')
    .select('*, folio_charges(*)')
    .eq('reservation_id', req.params.reservationId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/billing/payments', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('folio_payments')
    .insert({
      ...req.body,
      status: 'completed',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Messaging Center ───────────────────────────────────────────────────
router.get('/messaging/conversations/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_conversations')
    .select('*, guest_messages(*)')
    .eq('guest_id', req.params.guestId)
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ conversations: data || [] });
});

router.post('/messaging/messages', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_messages')
    .insert({
      ...req.body,
      sender: 'guest',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Notifications ───────────────────────────────────────────────────────
router.get('/notifications/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_notifications')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ notifications: data || [] });
});

router.put('/notifications/:id/read', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_notifications')
    .update({ read: true })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Feedback & Reviews ───────────────────────────────────────────────────
router.post('/feedback', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_feedback')
    .insert({
      ...req.body,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/feedback/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_feedback')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ feedback: data || [] });
});

export default router;
