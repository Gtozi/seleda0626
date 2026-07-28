import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Enhanced In-Stay Requests with Categories ───────────────────
// Get request categories
router.get('/requests/categories/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `guest-request-categories:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('guest_request_categories')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    categories: data || [],
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

// Create guest request
router.post('/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    roomId,
    categoryId,
    description,
    urgency,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !categoryId || !description) {
    return res.status(400).json({ error: 'propertyId, reservationId, categoryId, and description are required' });
  }

  const { data, error } = await supabaseAdmin.from('guest_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    room_id: roomId,
    category_id: categoryId,
    description,
    urgency: urgency || 'normal',
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Request Tracking and Fulfillment Status ────────────────────────────────
// Get guest requests
router.get('/requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('guest_requests')
    .select('*, guest_request_categories(category_name), profiles(full_name)')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    reservationId: req.params.reservationId,
    requests: data || [],
  });
});

// Update request status
router.put('/requests/:id/status', authenticate, requirePermission('guest:requests:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, updatedBy, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('guest_requests')
    .update({
      status,
      updated_by: updatedBy || req.user?.id,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.json(data);
});

// ── Hotel Information Enhancement ──────────────────────────────────────────
// Get hotel information
router.get('/hotel-info/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `guest-hotel-info:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: property } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', req.params.propertyId)
    .single();

  const { data: amenities } = await supabaseAdmin
    .from('property_amenities')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const { data: services } = await supabaseAdmin
    .from('property_services')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const result = {
    propertyId: req.params.propertyId,
    property,
    amenities: amenities || [],
    services: services || [],
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

// ── Service Ordering ────────────────────────────────────────────────────────
// Get available services
router.get('/services/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { category } = req.query as Record<string, string>;
  
  const cacheKey = `guest-services:${req.params.propertyId}:${category || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('guest_services')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true)
    .order('service_name', { ascending: true });

  if (category) q = q.eq('category', category);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    services: data || [],
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

// Order service
router.post('/services/order', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    serviceId,
    quantity,
    specialInstructions,
    orderedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !serviceId) {
    return res.status(400).json({ error: 'propertyId, reservationId, and serviceId are required' });
  }

  const { data: service } = await supabaseAdmin
    .from('guest_services')
    .select('*')
    .eq('id', serviceId)
    .single();

  const { data, error } = await supabaseAdmin.from('service_orders').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    service_id: serviceId,
    quantity: quantity || 1,
    unit_price: service?.price || 0,
    total_price: (service?.price || 0) * (quantity || 1),
    special_instructions: specialInstructions,
    status: 'pending',
    ordered_by: orderedBy || req.user?.id,
    ordered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Bill Viewing and Payment ───────────────────────────────────────────────
// Get guest folio
router.get('/folio/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: folio } = await supabaseAdmin
    .from('reservation_folios')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .single();

  const { data: charges } = await supabaseAdmin
    .from('folio_charges')
    .select('*')
    .eq('folio_id', folio?.id)
    .order('charge_date', { ascending: false });

  const { data: payments } = await supabaseAdmin
    .from('folio_payments')
    .select('*')
    .eq('folio_id', folio?.id)
    .order('payment_date', { ascending: false });

  return res.json({
    reservationId: req.params.reservationId,
    folio,
    charges: charges || [],
    payments: payments || [],
    balance: calculateFolioBalance(charges || [], payments || []),
  });
});

function calculateFolioBalance(charges: any[], payments: any[]): number {
  const totalCharges = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return totalCharges - totalPayments;
}

// Make payment
router.post('/folio/:folioId/payment', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    amount,
    paymentMethod,
    paymentReference,
    paidBy,
  } = req.body || {};
  
  if (!amount || !paymentMethod) {
    return res.status(400).json({ error: 'amount and paymentMethod are required' });
  }

  const { data, error } = await supabaseAdmin.from('folio_payments').insert({
    folio_id: req.params.folioId,
    amount,
    payment_method: paymentMethod,
    payment_reference: paymentReference,
    paid_by: paidBy || req.user?.id,
    payment_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── PWA Packaging for Offline Support ───────────────────────────────────────
// Get PWA manifest
router.get('/pwa/manifest/:propertyId', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: property } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', req.params.propertyId)
    .single();

  const manifest = {
    name: `${property?.property_name} Guest Portal`,
    short_name: `${property?.property_name}`,
    description: 'Guest mobile portal for hotel services',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: property?.primary_color || '#0066cc',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    offline_enabled: true,
    cache_version: Date.now(),
  };

  res.json(manifest);
});

// ── Phase 2: Mobile Check-In Flow ────────────────────────────────────────────
// Initiate mobile check-in
router.post('/check-in/initiate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    reservationId,
    propertyId,
    guestId,
  } = req.body || {};
  
  if (!reservationId || !propertyId || !guestId) {
    return res.status(400).json({ error: 'reservationId, propertyId, and guestId are required' });
  }

  const { data: reservation } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  const { data, error } = await supabaseAdmin.from('mobile_check_ins').insert({
    reservation_id: reservationId,
    property_id: propertyId,
    guest_id: guestId,
    status: 'initiated',
    initiated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json({ checkIn: data, reservation });
});

// Complete mobile check-in
router.post('/check-in/:checkInId/complete', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    signature,
    photoIdVerified,
    paymentMethodOnFile,
    completedBy,
  } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('mobile_check_ins')
    .update({
      status: 'completed',
      signature,
      photo_id_verified: photoIdVerified,
      payment_method_on_file: paymentMethodOnFile,
      completed_by: completedBy || req.user?.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', req.params.checkInId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update reservation status
  await supabaseAdmin
    .from('reservations')
    .update({ check_in_status: 'completed', actual_check_in: new Date().toISOString() })
    .eq('id', data?.reservation_id);

  cacheService.invalidate('guest-*');
  return res.json(data);
});

// ── Digital Key Integration Placeholder ────────────────────────────────────
// Get digital key status
router.get('/digital-key/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: key } = await supabaseAdmin
    .from('digital_keys')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .single();

  return res.json({
    reservationId: req.params.reservationId,
    keyStatus: key?.status || 'not_issued',
    keyExpiry: key?.expiry_date,
    placeholder: 'Digital key integration pending lock system provider',
  });
});

// Issue digital key
router.post('/digital-key/:reservationId/issue', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { roomId, guestId } = req.body || {};

  const { data, error } = await supabaseAdmin.from('digital_keys').insert({
    reservation_id: req.params.reservationId,
    room_id: roomId,
    guest_id: guestId,
    status: 'active',
    issued_at: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json({
    key: data,
    placeholder: 'Digital key issued - integration with lock system pending',
  });
});

// ── Mobile Check-Out Flow ──────────────────────────────────────────────────
// Initiate mobile check-out
router.post('/check-out/initiate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reservationId, propertyId, guestId } = req.body || {};
  
  if (!reservationId || !propertyId || !guestId) {
    return res.status(400).json({ error: 'reservationId, propertyId, and guestId are required' });
  }

  const { data, error } = await supabaseAdmin.from('mobile_check_outs').insert({
    reservation_id: reservationId,
    property_id: propertyId,
    guest_id: guestId,
    status: 'initiated',
    initiated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// Complete mobile check-out
router.post('/check-out/:checkOutId/complete', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    roomInspected,
    keyReturned,
    feedback,
    completedBy,
  } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('mobile_check_outs')
    .update({
      status: 'completed',
      room_inspected: roomInspected,
      key_returned: keyReturned,
      feedback,
      completed_by: completedBy || req.user?.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', req.params.checkOutId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update reservation status
  await supabaseAdmin
    .from('reservations')
    .update({ check_out_status: 'completed', actual_check_out: new Date().toISOString() })
    .eq('id', data?.reservation_id);

  cacheService.invalidate('guest-*');
  return res.json(data);
});

// ── Express Checkout ────────────────────────────────────────────────────────
// Request express checkout
router.post('/express-checkout/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { requestedBy } = req.body || {};

  const { data, error } = await supabaseAdmin.from('express_checkouts').insert({
    reservation_id: req.params.reservationId,
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    requested_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Folio Review and Payment ───────────────────────────────────────────────
// Get folio summary for checkout
router.get('/checkout/folio/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: folio } = await supabaseAdmin
    .from('reservation_folios')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .single();

  const { data: charges } = await supabaseAdmin
    .from('folio_charges')
    .select('*')
    .eq('folio_id', folio?.id);

  const summary = {
    roomCharges: charges?.filter(c => c.category === 'room').reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    serviceCharges: charges?.filter(c => c.category === 'service').reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    taxes: charges?.filter(c => c.category === 'tax').reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    otherCharges: charges?.filter(c => !['room', 'service', 'tax'].includes(c.category)).reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    total: charges?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
  };

  return res.json({
    reservationId: req.params.reservationId,
    summary,
    charges: charges || [],
  });
});

// ── Phase 3: In-Stay Service Ordering ──────────────────────────────────────
// Get in-stay services
router.get('/in-stay/services/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('in_stay_services')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true);

  if (type) q = q.eq('service_type', type);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    services: data || [],
  });
});

// Order in-stay service
router.post('/in-stay/orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    serviceId,
    serviceType,
    quantity,
    deliveryTime,
    specialInstructions,
    orderedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !serviceId || !serviceType) {
    return res.status(400).json({ error: 'propertyId, reservationId, serviceId, and serviceType are required' });
  }

  const { data, error } = await supabaseAdmin.from('in_stay_orders').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    service_id: serviceId,
    service_type: serviceType,
    quantity: quantity || 1,
    delivery_time: deliveryTime,
    special_instructions: specialInstructions,
    status: 'pending',
    ordered_by: orderedBy || req.user?.id,
    ordered_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Housekeeping Requests ───────────────────────────────────────────────────
// Create housekeeping request
router.post('/housekeeping/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    roomId,
    requestType,
    urgency,
    notes,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !roomId || !requestType) {
    return res.status(400).json({ error: 'propertyId, reservationId, roomId, and requestType are required' });
  }

  const { data, error } = await supabaseAdmin.from('housekeeping_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    room_id: roomId,
    request_type: requestType,
    urgency: urgency || 'normal',
    notes,
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  cacheService.invalidate('hk-*');
  return res.status(201).json(data);
});

// Get housekeeping request status
router.get('/housekeeping/requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('housekeeping_requests')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    reservationId: req.params.reservationId,
    requests: data || [],
  });
});

// ── Maintenance Requests ────────────────────────────────────────────────────
// Create maintenance request
router.post('/maintenance/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    roomId,
    issueType,
    description,
    urgency,
    photos,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !roomId || !issueType || !description) {
    return res.status(400).json({ error: 'propertyId, reservationId, roomId, issueType, and description are required' });
  }

  const { data, error } = await supabaseAdmin.from('maintenance_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    room_id: roomId,
    issue_type: issueType,
    description,
    urgency: urgency || 'normal',
    photos,
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  cacheService.invalidate('eng-*');
  return res.status(201).json(data);
});

// Get maintenance request status
router.get('/maintenance/requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('maintenance_requests')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    reservationId: req.params.reservationId,
    requests: data || [],
  });
});

// ── Concierge Services ───────────────────────────────────────────────────────
// Get concierge services
router.get('/concierge/services/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('concierge_services')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_available', true)
    .order('service_name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    services: data || [],
  });
});

// Request concierge service
router.post('/concierge/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    serviceId,
    requestDetails,
    scheduledFor,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !serviceId) {
    return res.status(400).json({ error: 'propertyId, reservationId, and serviceId are required' });
  }

  const { data, error } = await supabaseAdmin.from('concierge_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    service_id: serviceId,
    request_details: requestDetails,
    scheduled_for: scheduledFor,
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Restaurant Reservations ────────────────────────────────────────────────
// Get available restaurant slots
router.get('/restaurants/availability/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date, partySize, restaurantId } = req.query as Record<string, string>;
  
  const cacheKey = `guest-restaurant-availability:${req.params.propertyId}:${date}:${partySize}:${restaurantId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('restaurants')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (restaurantId) q = q.eq('id', restaurantId);

  const { data: restaurants } = await q;

  const availability = (restaurants || []).map(restaurant => ({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    availableSlots: generateAvailableSlots(date, partySize, restaurant.capacity),
  }));

  const result = {
    propertyId: req.params.propertyId,
    date: date || new Date().toISOString().split('T')[0],
    partySize: partySize || 2,
    availability,
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

function generateAvailableSlots(date: string | undefined, partySize: string | undefined, capacity: number): string[] {
  const slots = ['07:00', '08:00', '09:00', '12:00', '13:00', '18:00', '19:00', '20:00', '21:00'];
  return slots.filter(() => Math.random() > 0.3); // Random availability
}

// Make restaurant reservation
router.post('/restaurants/reservations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    restaurantId,
    date,
    time,
    partySize,
    specialRequests,
    reservedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !restaurantId || !date || !time || !partySize) {
    return res.status(400).json({ error: 'propertyId, reservationId, restaurantId, date, time, and partySize are required' });
  }

  const { data, error } = await supabaseAdmin.from('restaurant_reservations').insert({
    property_id: propertyId,
    guest_reservation_id: reservationId,
    restaurant_id: restaurantId,
    reservation_date: date,
    reservation_time: time,
    party_size: partySize,
    special_requests: specialRequests,
    status: 'confirmed',
    reserved_by: reservedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  cacheService.invalidate('fb-*');
  return res.status(201).json(data);
});

// ── Phase 4: Guest Preferences Management ─────────────────────────────────
// Get guest preferences
router.get('/preferences/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: preferences } = await supabaseAdmin
    .from('guest_preferences')
    .select('*')
    .eq('guest_id', req.params.guestId);

  const grouped = {
    room: preferences?.filter(p => p.category === 'room') || [],
    dining: preferences?.filter(p => p.category === 'dining') || [],
    amenities: preferences?.filter(p => p.category === 'amenities') || [],
    service: preferences?.filter(p => p.category === 'service') || [],
    accessibility: preferences?.filter(p => p.category === 'accessibility') || [],
  };

  return res.json({
    guestId: req.params.guestId,
    preferences: grouped,
  });
});

// Update guest preferences
router.put('/preferences/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { preferences } = req.body || [];

  await supabaseAdmin
    .from('guest_preferences')
    .delete()
    .eq('guest_id', req.params.guestId);

  const { data, error } = await supabaseAdmin.from('guest_preferences').insert(
    preferences.map((p: any) => ({
      guest_id: req.params.guestId,
      category: p.category,
      preference: p.preference,
      value: p.value,
      created_at: new Date().toISOString(),
    }))
  ).select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.json({ preferences: data || [] });
});

// ── Special Requests Tracking ───────────────────────────────────────────────
// Get special requests
router.get('/special-requests/:reservationId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('special_requests')
    .select('*')
    .eq('reservation_id', req.params.reservationId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    reservationId: req.params.reservationId,
    specialRequests: data || [],
  });
});

// Create special request
router.post('/special-requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    requestType,
    description,
    urgency,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !requestType || !description) {
    return res.status(400).json({ error: 'propertyId, reservationId, requestType, and description are required' });
  }

  const { data, error } = await supabaseAdmin.from('special_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    request_type: requestType,
    description,
    urgency: urgency || 'normal',
    status: 'pending',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// ── Loyalty Program Integration ─────────────────────────────────────────────
// Get guest loyalty status
router.get('/loyalty/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: loyalty } = await supabaseAdmin
    .from('loyalty_members')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .single();

  const { data: points } = await supabaseAdmin
    .from('loyalty_points')
    .select('*')
    .eq('member_id', loyalty?.id);

  const totalPoints = (points || []).reduce((sum, p) => sum + (p.points || 0), 0);

  return res.json({
    guestId: req.params.guestId,
    loyalty,
    totalPoints,
    tier: calculateLoyaltyTier(totalPoints),
  });
});

function calculateLoyaltyTier(points: number): string {
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 2500) return 'silver';
  return 'bronze';
}

// ── Guest Feedback Collection ───────────────────────────────────────────────
// Submit feedback
router.post('/feedback', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    guestId,
    category,
    rating,
    comments,
    submittedBy,
  } = req.body || {};
  
  if (!propertyId || !reservationId || !category || !rating) {
    return res.status(400).json({ error: 'propertyId, reservationId, category, and rating are required' });
  }

  const { data, error } = await supabaseAdmin.from('guest_feedback').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    guest_id: guestId,
    category,
    rating,
    comments,
    submitted_by: submittedBy || req.user?.id,
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('guest-*');
  return res.status(201).json(data);
});

// Get feedback form
router.get('/feedback/form/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: form } = await supabaseAdmin
    .from('feedback_forms')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true)
    .single();

  return res.json({
    propertyId: req.params.propertyId,
    feedbackForm: form,
  });
});

// ── Personalized Recommendations ────────────────────────────────────────────
// Get personalized recommendations
router.get('/recommendations/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type } = req.query as Record<string, string>;
  
  const cacheKey = `guest-recommendations:${req.params.guestId}:${type || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: preferences } = await supabaseAdmin
    .from('guest_preferences')
    .select('*')
    .eq('guest_id', req.params.guestId);

  const { data: history } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .limit(10);

  const recommendations = generateRecommendations(preferences || [], history || [], type);

  const result = {
    guestId: req.params.guestId,
    type: type || 'all',
    recommendations,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function generateRecommendations(preferences: any[], history: any[], type?: string): any[] {
  const recommendations = [];

  // Room recommendations
  if (!type || type === 'room') {
    const roomPrefs = preferences.filter(p => p.category === 'room');
    recommendations.push({
      type: 'room',
      recommendations: [
        { id: 1, name: 'Ocean View Suite', reason: 'Based on your preference for ocean views' },
        { id: 2, name: 'Deluxe King Room', reason: 'Popular among guests with similar preferences' },
      ],
    });
  }

  // Dining recommendations
  if (!type || type === 'dining') {
    const diningPrefs = preferences.filter(p => p.category === 'dining');
    recommendations.push({
      type: 'dining',
      recommendations: [
        { id: 1, name: 'Fine Dining Restaurant', reason: 'Based on your dining preferences' },
        { id: 2, name: 'In-Room Dining', reason: 'Convenient option for late arrivals' },
      ],
    });
  }

  return recommendations;
}

// ── Push Notifications for Offers ───────────────────────────────────────────
// Get offers
router.get('/offers/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: offers } = await supabaseAdmin
    .from('guest_offers')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true)
    .gte('valid_from', new Date().toISOString())
    .lte('valid_until', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('valid_from', { ascending: true });

  return res.json({
    propertyId: req.params.propertyId,
    offers: offers || [],
  });
});

// Subscribe to notifications
router.post('/notifications/subscribe', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { guestId, deviceToken, notificationTypes } = req.body || {};
  
  if (!guestId || !deviceToken) {
    return res.status(400).json({ error: 'guestId and deviceToken are required' });
  }

  const { data, error } = await supabaseAdmin.from('notification_subscriptions').insert({
    guest_id: guestId,
    device_token: deviceToken,
    notification_types: notificationTypes || ['offers', 'requests', 'reminders'],
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Send notification
router.post('/notifications/send', authenticate, requirePermission('guest:notifications:send'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    guestId,
    notificationType,
    title,
    message,
    data,
  } = req.body || {};
  
  if (!propertyId || !guestId || !title || !message) {
    return res.status(400).json({ error: 'propertyId, guestId, title, and message are required' });
  }

  const { data: notification } = await supabaseAdmin.from('push_notifications').insert({
    property_id: propertyId,
    guest_id: guestId,
    notification_type: notificationType || 'offer',
    title,
    message,
    data,
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  return res.status(201).json({
    notification,
    placeholder: 'Push notification sent - integration with FCM/APNS pending',
  });
});

export default router;
