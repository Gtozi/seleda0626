import { Router } from 'express';
import { z } from 'zod';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { getTypeAvailability, getRoomImageUrl, autoAssignRoomsForPublicBookings, writeAuditEvent } from '../services/sharedServices';
import { computeFees, getSeasonMultiplier, getRatePlanModifier, getEffectiveNightlyRate, type FeeComponent, type SeasonRow, type RatePlanRow } from '../../utils/pricing';
import { getGlobalSettings } from '../services/settingsService';

const router = Router();

// Public settings (no auth)
router.get('/settings', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const data = await getGlobalSettings();
  if (!data) return res.json({ settings: {} });

  const feeComponents = data.fee_components || [];
  const vatFee = feeComponents.find((f: any) => f.name.toLowerCase().includes('vat') && f.isEnabled);
  const scFee = feeComponents.find((f: any) => f.name.toLowerCase().includes('service charge') && f.isEnabled);

  return res.json({
    settings: {
      customHotelName: data.custom_hotel_name || '',
      customHotelAddress: data.custom_hotel_address || '',
      publicTagline: data.public_tagline || '',
      heroImageUrl: data.hero_image_url && !data.hero_image_url.startsWith('/src')
        ? data.hero_image_url
        : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920',
      hotelLogo: data.hotel_logo || '',
      contactPhone: data.contact_phone || '',
      contactEmail: data.contact_email || '',
      taxPercent: vatFee ? vatFee.value : (data.tax_percent || 0),
      serviceChargePercent: scFee ? scFee.value : (data.service_charge_percent || 0),
      exchangeRate: data.exchange_rate || 1,
      publicBookingEnabled: data.public_booking_enabled ?? true,
      maintenanceMode: data.maintenance_mode ?? false,
      maintenanceMessage: data.maintenance_message || '',
      bookingTerms: data.booking_terms || '',
      hotelTin: data.hotel_tin || '',
      hotelVatNo: data.hotel_vat_no || '',
      invoiceBankDetails: data.invoice_bank_details || '',
      checkInTime: data.check_in_time || '01:00 PM',
      checkOutTime: data.check_out_time || '10:00 AM',
      starRating: '5',
      feeComponents: feeComponents.map((f: any) => ({
        id: f.id,
        name: f.name,
        feeType: f.feeType,
        value: f.value,
        isEnabled: f.isEnabled
      })),
      policySections: data.policy_sections || [],
      cancellationGraceHours: data.cancellation_grace_hours || 24,
      cancellationPenaltyPercent: data.cancellation_penalty_percent || 50,
      bookingHeroTitle: data.booking_hero_title || 'Find your perfect stay',
      bookingHeroDescription: data.booking_hero_description || 'Book directly with us for the best available rates, personalized service, and instant confirmation.',
      bookingStep1Label: data.booking_step1_label || 'Select Room',
      bookingStep2Label: data.booking_step2_label || 'Add-ons',
      bookingStep3Label: data.booking_step3_label || 'Details',
      bookingRoomsSectionTitle: data.booking_rooms_section_title || 'Select your room',
      bookingPackagesSectionTitle: data.booking_packages_section_title || 'Packages',
      bookingGuestServicesSectionTitle: data.booking_guest_services_section_title || 'Guest Services',
      bookingYourRoomsTitle: data.booking_your_rooms_title || 'Your Rooms',
      bookingGuestDetailsTitle: data.booking_guest_details_title || 'Guest Details',
      bookingSummaryTitle: data.booking_summary_title || 'Booking Summary',
      bookingHeaderSubtitle: data.booking_header_subtitle || 'Direct Reservations',
      bookingNoRoomsMessage: data.booking_no_rooms_message || 'No rooms available for the selected dates.',
      bookingNoRoomsSubtext: data.booking_no_rooms_subtext || 'Try adjusting your dates or contact the hotel.',
      bookingTermsAgreement: data.booking_terms_agreement || 'I agree to the hotel terms and conditions and cancellation policy.',
      bookingReadTermsText: data.booking_read_terms_text || 'Read terms',
      bookingConfirmButtonText: data.booking_confirm_button_text || 'Confirm booking',
      bookingSecureBookingText: data.booking_secure_booking_text || 'Secure booking · No card required'
    }
  });
});

// Public room availability (no auth)
const roomsQuerySchema = z.object({
  checkIn: z.string().min(1, 'checkIn is required'),
  checkOut: z.string().min(1, 'checkOut is required'),
}).refine((data) => {
  const start = new Date(data.checkIn);
  const end = new Date(data.checkOut);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
}, {
  message: "checkOut must be a valid date after checkIn",
  path: ["checkOut"],
});

router.get('/rooms', async (req, res) => {
  const validation = roomsQuerySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { checkIn, checkOut } = validation.data;

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const [{ data: roomTypes, error: rtError }, { data: rooms, error: roomsError }, { data: reservations, error: resError }, { data: seasons }, allotmentsResult] = await Promise.all([
    supabaseAdmin.from('room_types').select('*').eq('is_active', true),
    supabaseAdmin.from('rooms').select('*'),
    supabaseAdmin.from('reservations').select('*').lt('check_in_date', checkOut).gt('check_out_date', checkIn),
    supabaseAdmin.from('seasons').select('*'),
    // Allotments reduce sellable inventory for operators. is_released allotments
    // no longer block. Table may not exist on older schemas — tolerate the error.
    supabaseAdmin.from('allotments').select('room_type_id, stay_date, blocked_qty, picked_up_qty, is_released').gte('stay_date', checkIn).lt('stay_date', checkOut).eq('is_released', false)
  ]);
  if (rtError) return res.status(500).json({ error: rtError.message });
  if (roomsError) return res.status(500).json({ error: roomsError.message });
  if (resError) return res.status(500).json({ error: resError.message });

  const roomTypesList = roomTypes || [];
  const roomsList = rooms || [];
  const reservationsList = reservations || [];
  const season = getSeasonMultiplier(checkIn, (seasons || []) as SeasonRow[]);

  // Sum allotment blocks per room type across the stay range, mirroring the
  // create_booking_atomic RPC so display availability == bookable availability.
  const allotmentBlockByType = new Map<string, number>();
  for (const a of (allotmentsResult?.data || [])) {
    const blocked = Math.max(0, (a.blocked_qty || 0) - (a.picked_up_qty || 0));
    allotmentBlockByType.set(a.room_type_id, (allotmentBlockByType.get(a.room_type_id) || 0) + blocked);
  }

  const result = roomTypesList.map((rt: any) => {
    const availability = getTypeAvailability(rt.id, checkIn, checkOut, roomsList, reservationsList);
    const allotmentBlock = allotmentBlockByType.get(rt.id) || 0;
    const displayAvailable = Math.max(0, availability.available - allotmentBlock);
    return {
      type: rt.id,
      title: rt.name,
      description: rt.description || `${rt.name} room`,
      rate: rt.base_price,
      baseRate: rt.base_price,
      capacity: rt.max_occupancy,
      available: displayAvailable,
      features: rt.amenities || [],
      imageUrl: rt.image_url_1 || getRoomImageUrl(rt.name),
      imageUrl2: rt.image_url_2 || null,
      imageUrl3: rt.image_url_3 || null,
      roomSizeSqm: rt.room_size_sqm,
      bedConfiguration: rt.bed_configuration,
      displayOrder: rt.display_order || 0,
      totalRooms: availability.capacity,
      isActive: rt.is_active !== false,
    };
  }).filter((rt: any) => rt.available > 0).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  return res.json({ rooms: result, season });
});

// Public rate plans (no auth)
router.get('/rate-plans', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('rate_plans').select('*').eq('active', true);
  if (error) return res.status(500).json({ error: error.message });
  const seen = new Set<string>();
  const ratePlans = (data || [])
    .filter((rp: any) => {
      const key = (rp.name || '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((rp: any) => ({
      id: rp.id,
      name: rp.name,
      description: rp.description || '',
      baseModifier: Number(rp.base_modifier) || 1,
      minStay: rp.min_stay || 1,
      maxStay: rp.max_stay || null,
      cancellationPolicy: rp.cancellation_policy || '',
    }))
    .sort((a: any, b: any) => a.baseModifier - b.baseModifier);
  return res.json({ ratePlans });
});

// Public packages (no auth)
router.get('/packages', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('packages').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    packages: (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: Number(p.price),
      chargeFrequency: p.charge_frequency || 'once',
    }))
  });
});

// Public guest services (no auth)
router.get('/guest-services', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('guest_services').select('*').eq('available', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    guestServices: (data || []).map((gs: any) => ({
      id: gs.id,
      name: gs.name,
      description: gs.description || '',
      category: gs.category || 'dining',
      price: Number(gs.price),
      available: gs.available,
    }))
  });
});

// =====================
// Guest In-Stay Requests
// =====================

// Submit a guest request (no auth — guest portal)
router.post('/guest-requests', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { reservationId, roomNumber, guestName, requestType, description, priority } = req.body;
  if (!reservationId || !requestType) {
    return res.status(400).json({ error: 'reservationId and requestType are required' });
  }

  const deptMap: Record<string, string> = {
    Housekeeping: 'Housekeeping',
    Maintenance: 'Engineering',
    'Room Service': 'F&B',
    Concierge: 'Front Office',
  };
  const assignedDept = deptMap[requestType] || 'Front Office';
  const reqNum = `GR-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabaseAdmin.from('guest_requests').insert({
    request_number: reqNum,
    reservation_id: reservationId,
    room_number: roomNumber || null,
    guest_name: guestName || null,
    request_type: requestType,
    description: description || null,
    priority: priority || 'Normal',
    status: 'Open',
    assigned_department: assignedDept,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, request: data });
});

// List guest requests by reservation (no auth — guest portal)
router.get('/guest-requests/:reservationId', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('guest_requests')
    .select('*').eq('reservation_id', req.params.reservationId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ requests: data || [] });
});

// Guest folio view (read-only, no auth — guest portal)
router.get('/guest-folio/:reservationId', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data: folios, error: folioError } = await supabaseAdmin.from('folios')
    .select('*').eq('reservation_id', req.params.reservationId).order('opened_at', { ascending: false });
  if (folioError) return res.status(500).json({ error: folioError.message });

  if (!folios || folios.length === 0) {
    return res.json({ folios: [] });
  }

  const folioIds = folios.map(f => f.id);
  const { data: lines, error: lineError } = await supabaseAdmin.from('folio_lines')
    .select('*').in('folio_id', folioIds).eq('is_voided', false).order('line_number', { ascending: true });
  if (lineError) return res.status(500).json({ error: lineError.message });

  const foliosWithLines = folios.map(f => ({
    ...f,
    lines: (lines || []).filter(l => l.folio_id === f.id),
  }));

  return res.json({ folios: foliosWithLines });
});

// =====================
// Public Portal Endpoints
// =====================

// Public properties (no auth)
router.get('/properties', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('properties').select('*').eq('is_active', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    properties: (data || []).map((prop: any) => ({
      id: prop.id,
      name: prop.name,
      type: prop.property_type || 'hotel',
      location: prop.location || '',
      country: prop.country || 'Ethiopia',
      description: prop.description || '',
      imageUrl: prop.image_url || '',
      amenities: prop.amenities || [],
      facilities: prop.facilities || [],
      contact: {
        phone: prop.phone || '',
        email: prop.email || '',
        website: prop.website || ''
      },
      roomCount: prop.room_count || 0,
      startingPrice: Number(prop.starting_price) || 0,
      rating: prop.rating || 4.5,
      reviewCount: prop.review_count || 0
    }))
  });
});

// Public restaurants (no auth)
router.get('/restaurants', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('restaurants').select('*').eq('is_active', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    restaurants: (data || []).map((rest: any) => ({
      id: rest.id,
      name: rest.name,
      cuisine: rest.cuisine || 'International',
      description: rest.description || '',
      openingHours: rest.opening_hours || '7:00 AM - 10:00 PM',
      dressCode: rest.dress_code || 'Casual',
      rating: rest.rating || 4.5,
      imageUrl: rest.image_url || ''
    }))
  });
});

// Public spa treatments (no auth)
router.get('/spa-treatments', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('spa_treatments').select('*').eq('available', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    treatments: (data || []).map((treatment: any) => ({
      id: treatment.id,
      name: treatment.name,
      duration: treatment.duration || '60 min',
      price: Number(treatment.price) || 0,
      therapist: treatment.therapist_available ? 'Available' : 'By Request',
      description: treatment.description || ''
    }))
  });
});

// Public experiences (no auth)
router.get('/experiences', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('experiences').select('*').eq('available', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    experiences: (data || []).map((exp: any) => ({
      id: exp.id,
      name: exp.name,
      duration: exp.duration || '4 hours',
      price: Number(exp.price) || 0,
      rating: exp.rating || 4.5,
      type: exp.experience_type || 'tour',
      description: exp.description || ''
    }))
  });
});

// Public transportation services (no auth)
router.get('/transportation', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('transportation_services').select('*').eq('available', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    services: (data || []).map((service: any) => ({
      id: service.id,
      name: service.name,
      price: Number(service.price) || 0,
      capacity: service.capacity || '4 passengers',
      vehicle: service.vehicle_type || 'Sedan',
      description: service.description || ''
    }))
  });
});

// Public special offers (no auth)
router.get('/special-offers', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('special_offers').select('*').eq('is_active', true);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    offers: (data || []).map((offer: any) => ({
      id: offer.id,
      title: offer.title,
      discount: offer.discount_text || 'Special Offer',
      description: offer.description || '',
      validUntil: offer.valid_until || '',
      type: offer.offer_type || 'special',
      imageUrl: offer.image_url || ''
    }))
  });
});

// Public reviews (no auth)
router.get('/reviews', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin.from('reviews').select('*').eq('verified', true).order('created_at', { ascending: false }).limit(10);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    reviews: (data || []).map((review: any) => ({
      id: review.id,
      name: review.guest_name || 'Anonymous',
      rating: review.rating || 5,
      date: review.created_at || '',
      comment: review.comment || ''
    }))
  });
});

// Submit meeting inquiry (no auth)
router.post('/meeting-inquiry', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  const inquirySchema = z.object({
    eventType: z.string(),
    attendees: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    requirements: z.string().optional(),
    contactName: z.string(),
    contactEmail: z.string().email(),
    contactPhone: z.string(),
    company: z.string().optional()
  });

  const validation = inquirySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { data, error } = await supabaseAdmin.from('meeting_inquiries').insert([{
    event_type: validation.data.eventType,
    attendees: validation.data.attendees,
    start_date: validation.data.startDate,
    end_date: validation.data.endDate,
    requirements: validation.data.requirements,
    contact_name: validation.data.contactName,
    contact_email: validation.data.contactEmail,
    contact_phone: validation.data.contactPhone,
    company: validation.data.company,
    status: 'pending',
    created_at: new Date().toISOString()
  }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, inquiryId: data?.[0]?.id });
});

// Submit wedding inquiry (no auth)
router.post('/wedding-inquiry', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  const inquirySchema = z.object({
    weddingDate: z.string(),
    guestCount: z.string(),
    package: z.string().optional(),
    contactName: z.string(),
    contactEmail: z.string().email(),
    contactPhone: z.string(),
    message: z.string().optional()
  });

  const validation = inquirySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { data, error } = await supabaseAdmin.from('wedding_inquiries').insert([{
    wedding_date: validation.data.weddingDate,
    guest_count: validation.data.guestCount,
    package: validation.data.package,
    contact_name: validation.data.contactName,
    contact_email: validation.data.contactEmail,
    contact_phone: validation.data.contactPhone,
    message: validation.data.message,
    status: 'pending',
    created_at: new Date().toISOString()
  }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, inquiryId: data?.[0]?.id });
});

// Submit contact form (no auth)
router.post('/contact', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  const contactSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    subject: z.string(),
    message: z.string()
  });

  const validation = contactSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { data, error } = await supabaseAdmin.from('contact_submissions').insert([{
    name: validation.data.name,
    email: validation.data.email,
    subject: validation.data.subject,
    message: validation.data.message,
    status: 'pending',
    created_at: new Date().toISOString()
  }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, submissionId: data?.[0]?.id });
});

// Guest registration (no auth)
router.post('/register', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional()
  });

  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', validation.data.email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const { data, error } = await supabaseAdmin.from('users').insert([{
    name: validation.data.name,
    email: validation.data.email,
    password: validation.data.password, // Note: In production, this should be hashed
    phone: validation.data.phone,
    role: 'guest',
    is_active: true,
    created_at: new Date().toISOString()
  }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, userId: data?.[0]?.id });
});

// Public booking creation (no auth)
router.post('/bookings', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { checkIn, checkOut, guestName, guestEmail, guestPhone, guestNationality, packageIds, guestServiceIds, specialRequests, items, airportShuttleRequests, groupName, primaryContact, operator_id, voucher_code, voucher_discount, ratePlanId } = req.body || {};

    const effectiveGuestName = guestName || primaryContact;

    if (!checkIn || !checkOut || !effectiveGuestName || !guestEmail) {
      return res.status(400).json({ error: 'checkIn, checkOut, guestName, guestEmail are required' });
    }

    const cartItems = Array.isArray(items) && items.length > 0 ? items : [];
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'At least one room is required' });
    }

    // Check if public booking is enabled and not in maintenance mode
    const settings = await getGlobalSettings();
    if (!settings?.public_booking_enabled) {
      return res.status(503).json({ error: 'Public booking is currently disabled' });
    }
    if (settings?.maintenance_mode) {
      return res.status(503).json({ error: settings.maintenance_message || 'System is under maintenance. Please try again later.' });
    }

    const [{ data: roomTypes }, { data: rooms }, { data: reservations }, { data: packages }, { data: guestServices }, { data: allotments }, { data: seasons }, { data: ratePlans }] = await Promise.all([
      supabaseAdmin.from('room_types').select('*'),
      supabaseAdmin.from('rooms').select('*'),
      supabaseAdmin.from('reservations').select('*').lt('check_in_date', checkOut).gt('check_out_date', checkIn),
      supabaseAdmin.from('packages').select('*'),
      supabaseAdmin.from('guest_services').select('*'),
      operator_id ? supabaseAdmin.from('allotments').select('*').eq('operator_id', operator_id).gte('stay_date', checkIn).lte('stay_date', checkOut).eq('is_released', false) : Promise.resolve({ data: [] }),
      supabaseAdmin.from('seasons').select('*'),
      supabaseAdmin.from('rate_plans').select('*')
    ]);

    const roomTypesList = roomTypes || [];
    const roomsList = rooms || [];
    const reservationsList = reservations || [];
    const allotmentsList = allotments || [];
    const taxPercent = (settings as any)?.tax_percent || 0;
    const serviceChargePercent = (settings as any)?.service_charge_percent || 0;
    const feeComponents = ((settings as any)?.fee_components || []) as FeeComponent[];
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));

    // ── Pricing parity with the front desk: seasonal multiplier + rate plan ──
    const season = getSeasonMultiplier(checkIn, (seasons || []) as SeasonRow[]);
    const ratePlan = getRatePlanModifier(ratePlanId, (ratePlans || []) as RatePlanRow[]);
    const packageIdsList: string[] = Array.isArray(packageIds) ? packageIds : (packageIds ? [packageIds] : []);
    const guestServiceIdsList: string[] = Array.isArray(guestServiceIds) ? guestServiceIds : (guestServiceIds ? [guestServiceIds] : []);

    // Build a map of allotment availability by room type and date
    const allotmentAvailability = new Map<string, Map<string, number>>(); // roomTypeId -> date -> available
    if (operator_id && allotmentsList.length > 0) {
      for (const allotment of allotmentsList) {
        const key = `${allotment.room_type_id}`;
        if (!allotmentAvailability.has(key)) {
          allotmentAvailability.set(key, new Map());
        }
        const available = (allotment.blocked_qty || 0) - (allotment.picked_up_qty || 0);
        allotmentAvailability.get(key)!.set(allotment.stay_date, available);
      }
    }

    // Validate availability and compute pricing per item
    const enrichedItems = [];
    let roomSubtotal = 0;
    for (const item of cartItems) {
      const roomTypeId = item.roomType;
      const roomType = roomTypesList.find((rt: any) => rt.id === roomTypeId);
      if (!roomType) {
        return res.status(400).json({ error: `Room type ${roomTypeId} not found` });
      }
      const qty = Math.max(1, Number(item.quantity) || 1);
      // Apply seasonal + rate-plan adjustment so public rates match front desk.
      const rate = getEffectiveNightlyRate(Number(roomType.base_price) || 0, season.multiplier, ratePlan.modifier);

      // Check allotment availability if operator is selected
      if (operator_id && allotmentAvailability.has(roomTypeId)) {
        const dateMap = allotmentAvailability.get(roomTypeId)!;
        let minAllotmentAvailable = Infinity;
        let currentDate = new Date(checkIn);
        while (currentDate < new Date(checkOut)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const available = dateMap.get(dateStr) || 0;
          minAllotmentAvailable = Math.min(minAllotmentAvailable, available);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        if (minAllotmentAvailable < qty) {
          return res.status(409).json({ error: `Only ${minAllotmentAvailable} ${roomType.name} room${minAllotmentAvailable === 1 ? '' : 's'} available in operator allotment for selected dates` });
        }
      } else {
        // Use regular availability check (match by room_type_id, not name)
        const availability = getTypeAvailability(roomTypeId, checkIn, checkOut, roomsList, reservationsList, undefined, qty);
        if (!availability.can_book) {
          return res.status(409).json({ error: `Only ${availability.available} ${roomType.name} room${availability.available === 1 ? '' : 's'} available for selected dates` });
        }
      }

      const itemRoomTotal = rate * nights * qty;
      roomSubtotal += itemRoomTotal;
      const occupancies = Array.isArray(item.occupancies) && item.occupancies.length > 0
        ? item.occupancies.map((o: any) => ({ adults: Number(o.adults) || 1, children: Number(o.children) || 0 }))
        : Array.from({ length: qty }, () => ({ adults: Number(item.adults) || 1, children: Number(item.children) || 0 }));
      enrichedItems.push({ roomTypeId, roomTypeName: roomType.name, qty, rate, itemRoomTotal, adults: Number(item.adults) || 1, children: Number(item.children) || 0, occupancies });
    }

    let packageTotal = 0;
    for (const pid of packageIdsList) {
      const pkg = (packages || []).find((p: any) => p.id === pid);
      if (pkg) {
        packageTotal += Number(pkg.price) * (pkg.charge_frequency === 'daily' ? nights : 1);
      }
    }

    const shuttleRequestsList = Array.isArray(airportShuttleRequests) ? airportShuttleRequests : [];
    const shuttleQuantity = shuttleRequestsList.reduce((sum, req) => sum + (Number(req.quantity) || 0), 0);

    let guestServicesTotal = 0;
    let shuttleServiceCounted = false;
    for (const gsid of guestServiceIdsList) {
      const gs = (guestServices || []).find((g: any) => g.id === gsid);
      if (gs) {
        const isShuttle = (gs.name || '').toLowerCase().includes('airport') || (gs.name || '').toLowerCase().includes('shuttle');
        if (isShuttle) {
          if (!shuttleServiceCounted) {
            guestServicesTotal += Number(gs.price) * Math.max(1, shuttleQuantity);
            shuttleServiceCounted = true;
          }
        } else {
          guestServicesTotal += Number(gs.price);
        }
      }
    }

    const subtotal = roomSubtotal + packageTotal + guestServicesTotal;
    // Unified fee engine (compounded VAT, honors all fee components) — shared
    // with the client and the front desk so displayed == stored == invoiced.
    const fees = computeFees(subtotal, feeComponents, taxPercent, serviceChargePercent);
    const tax = fees.tax;
    const serviceCharge = fees.serviceCharge;
    const additionalFees = fees.additionalFees;
    const voucherDiscountAmount = Number(voucher_discount) || 0;
    const totalAmount = subtotal + tax + serviceCharge + additionalFees - voucherDiscountAmount;

    const totalRoomCount = enrichedItems.reduce((sum, item) => sum + item.qty, 0);
    const isGroupBooking = totalRoomCount > 1;

    // ── Idempotency key: derived from email + dates + item fingerprint ──
    const idempotencyKey = req.headers['idempotency-key'] as string
      || `${guestEmail}::${checkIn}::${checkOut}::${enrichedItems.map(i => `${i.roomTypeName}x${i.qty}`).join(',')}::${Date.now()}`;

    // ── Single atomic RPC call — all inserts happen inside one Postgres txn ──
    const rpcPayload = {
      p_idempotency_key:   idempotencyKey,
      p_guest_name:        effectiveGuestName,
      p_guest_email:       guestEmail,
      p_guest_phone:       guestPhone || '',
      p_guest_nationality: guestNationality || '',
      p_special_requests:  specialRequests || '',
      p_check_in:          checkIn,
      p_check_out:         checkOut,
      p_items:             enrichedItems.map(i => ({
        roomTypeName: i.roomTypeName,
        roomTypeId:   i.roomTypeId,
        qty:          i.qty,
        rate:         i.rate,
        adults:       i.adults,
        children:     i.children,
        occupancies:  i.occupancies,
      })),
      p_package_ids:       packageIdsList,
      p_guest_service_ids: guestServiceIdsList,
      p_package_total:     packageTotal,
      p_guest_svc_total:   guestServicesTotal,
      p_tax_percent:       taxPercent,
      p_svc_charge_pct:    serviceChargePercent,
      p_group_name:        groupName || null,
      p_operator_id:       operator_id && typeof operator_id === 'string' ? operator_id : null,
      // Absolute fee amounts from the unified engine so the RPC stores exactly
      // what the guest was shown (compounded VAT + additional fees).
      p_tax_amount:        tax,
      p_svc_amount:        serviceCharge,
      p_addon_amount:      additionalFees,
      p_channel:           'Direct Website',
      p_status:            'Waitlisted',
    };

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('create_booking_atomic', rpcPayload);

    if (rpcError) {
      const msg: string = rpcError.message || '';
      const details: string = rpcError.details || '';
      const hint: string = rpcError.hint || '';
      console.error('Atomic booking RPC error:', { message: msg, details, hint, code: rpcError.code, payload: rpcPayload });
      if (msg.includes('AVAILABILITY_ERROR:')) {
        return res.status(409).json({ error: msg.replace('AVAILABILITY_ERROR:', '').trim() });
      }
      return res.status(500).json({ error: 'Booking failed. Please try again.', details: msg });
    }

    const result = rpcResult as any;
    const reservationIds: string[] = result.reservationIds || [];
    const guestIds: string[] = result.guestIds || [];
    const guestId: string = guestIds[0] || result.guestId;
    const groupBookingId: string | null = result.groupId || null;

    // ── Auto-assign rooms to the new public reservations (individual or group) ──
    const roomAssignments: Record<string, string> = await autoAssignRoomsForPublicBookings(reservationIds, supabaseAdmin, checkIn, checkOut);

    // ── Airport shuttle requests (non-critical, outside atomic txn) ──
    const airportShuttleService = (guestServices || []).find((gs: any) => {
      const name = (gs.name || '').toLowerCase();
      return name.includes('airport') || name.includes('shuttle');
    });
    if (airportShuttleService && guestServiceIdsList.includes(airportShuttleService.id) && shuttleRequestsList.length > 0 && reservationIds.length > 0) {
      let shuttleIndex = 0;
      for (const shuttleReq of shuttleRequestsList) {
        const shuttleId = `shuttle_${Date.now()}_${shuttleIndex++}`;
        const { error: shuttleError } = await supabaseAdmin.from('airport_shuttle_requests').insert({
          id: shuttleId,
          guest_id: guestId,
          reservation_id: reservationIds[0],
          room_number: null,
          scheduled_date: shuttleReq.scheduledDate,
          scheduled_time: shuttleReq.scheduledTime,
          shuttle_type: shuttleReq.shuttleType,
          flight_number: shuttleReq.flightNumber || null,
          flight_time: shuttleReq.flightTime || null,
          status: 'Pending',
          notes: shuttleReq.notes || null,
          quantity: Math.max(1, Number(shuttleReq.quantity) || 1)
        });
        if (shuttleError) {
          console.error('Error creating airport shuttle request:', shuttleError);
        }
      }
    }

    await writeAuditEvent({
      req,
      action: isGroupBooking ? 'public_group_booking.created' : 'public_booking.created',
      entityType: isGroupBooking ? 'GroupBooking' : 'Reservation',
      entityId: groupBookingId || reservationIds[0] || guestId,
      module: 'public_booking',
      outcome: 'success',
      details: { guestEmail, reservationIds, groupBookingId, checkIn, checkOut, totalAmount, itemCount: cartItems.length, roomCount: totalRoomCount, isGroupBooking, idempotent: result.idempotent, roomAssignments }
    });

    // Handle voucher redemption if a voucher code was provided
    if (voucher_code && voucherDiscountAmount > 0) {
      try {
        await supabaseAdmin.rpc('redeem_voucher', {
          p_voucher_number: voucher_code,
          p_reservation_id: reservationIds[0] || groupBookingId,
          p_discount_amount: voucherDiscountAmount
        });
      } catch (e) {
        console.error('Failed to redeem voucher:', e);
        // Continue anyway - booking is successful even if voucher redemption fails
      }
    }

    // Update allotment pickup log if operator is selected
    if (operator_id && allotmentAvailability.size > 0) {
      try {
        const currentDate = new Date(checkIn);
        while (currentDate < new Date(checkOut)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          for (const item of enrichedItems) {
            const allotment = allotmentsList.find((a: any) =>
              a.room_type_id === item.roomTypeId &&
              a.stay_date === dateStr &&
              a.operator_id === operator_id
            );
            if (allotment) {
              await supabaseAdmin.from('allotment_pickup_log').insert({
                allotment_id: allotment.id,
                reservation_id: reservationIds[0] || groupBookingId,
                pickup_date: dateStr,
                quantity: item.qty,
                picked_up_by: 'system',
                notes: 'Auto-pickup from public booking'
              });
              // Update allotment picked_up_qty
              await supabaseAdmin.from('allotments')
                .update({ picked_up_qty: (allotment.picked_up_qty || 0) + item.qty })
                .eq('id', allotment.id);
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (e) {
        console.error('Failed to update allotment pickup log:', e);
        // Continue anyway - booking is successful even if allotment update fails
      }
    }

    return res.json({
      success: true,
      reservationIds,
      guestId,
      totalAmount,
      subtotal,
      tax,
      serviceCharge,
      additionalFees,
      voucherDiscount: voucherDiscountAmount,
      season: { name: season.name, multiplier: season.multiplier },
      ratePlan: { name: ratePlan.name, modifier: ratePlan.modifier },
      isGroupBooking,
      groupBookingId,
      status: 'Waitlisted',
      idempotent: result.idempotent || false,
      roomAssignments,
    });
  });

// Public booking payment confirmation (no auth)
router.post('/bookings/confirm-payment', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { reservationIds, paymentMethod, paymentDetails } = req.body || {};
    if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
      return res.status(400).json({ error: 'reservationIds is required' });
    }
    try {
      // 1. Ensure rooms are assigned before confirming payment (promotion)
      const roomAssignments = await autoAssignRoomsForPublicBookings(reservationIds, supabaseAdmin);

      // 2. Fetch current reservations to retrieve total_amount & existing payments
      const { data: reservations, error: fetchError } = await supabaseAdmin
        .from('reservations')
        .select('id, total_amount, payments, notes')
        .in('id', reservationIds);

      if (fetchError) throw fetchError;
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({ error: 'Reservations not found' });
      }

      // 3. Loop through and update each reservation with a real payment record
      for (const r of reservations) {
        const paymentObj = {
          description: `Direct Website Deposit Payment (${paymentMethod || 'Credit Card'})`,
          amount: r.total_amount,
          date: new Date().toISOString(),
          method: paymentMethod || 'Credit Card',
          details: paymentDetails || {}
        };
        const currentPayments = Array.isArray(r.payments) ? r.payments : [];
        const updatedPayments = [...currentPayments, paymentObj];

        const paymentNote = `Website direct payment confirmed via ${paymentMethod || 'Credit Card'}. Details: ${JSON.stringify(paymentDetails || {})}`;
        const updatedNotes = r.notes
          ? `${r.notes}\n${paymentNote}`
          : paymentNote;

        const { error: updateError } = await supabaseAdmin
          .from('reservations')
          .update({
            status: 'Confirmed',
            payment_status: 'Paid',
            payments: updatedPayments,
            notes: updatedNotes
          })
          .eq('id', r.id);

        if (updateError) throw updateError;
      }

      // 3. Write a system audit log for the payment confirmation
      await writeAuditEvent({
        req,
        action: 'public_payment.confirmed',
        entityType: 'Reservation',
        entityId: reservationIds[0],
        module: 'public_booking',
        outcome: 'success',
        details: { reservationIds, paymentMethod, roomAssignments }
      });

      return res.json({ success: true, status: 'Confirmed', paymentStatus: 'Paid', roomAssignments });
    } catch (e: any) {
      console.error('Payment confirmation error:', e);
      return res.status(500).json({ error: e.message || 'Payment confirmation failed' });
    }
  });

// Public billing calculation endpoint (no auth required for public booking portal)
router.get('/billing/calculate-breakdown', async (req, res) => {
    const { baseAmount, discountPercent, reservationId } = req.query;

    if (!baseAmount || isNaN(Number(baseAmount))) {
      return res.status(400).json({ error: 'baseAmount is required and must be a number' });
    }

    if (hasSupabaseAdminConfig && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('calculate_billing_breakdown', {
          p_base_amount: Number(baseAmount),
          p_discount_percent: discountPercent ? Number(discountPercent) : 0,
          p_reservation_id: reservationId || null,
        });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(503).json({ error: 'Database not configured' });
  });

// Public: Submit a pre-registration (no auth required)
router.post('/pre-registration', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const body = req.body;
    if (!body.reservation_id || !body.guest_email || !body.guest_name) {
      return res.status(400).json({ error: 'reservation_id, guest_email, and guest_name are required' });
    }

    // Verify the reservation exists and email matches
    const { data: resData, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, guest_email, guest_name, status')
      .eq('id', body.reservation_id)
      .single();
    if (resError || !resData) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if (resData.guest_email?.toLowerCase() !== body.guest_email?.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match reservation' });
    }

    const { data, error } = await supabaseAdmin
      .from('pre_registrations')
      .upsert({
        reservation_id: body.reservation_id,
        guest_email: body.guest_email,
        guest_name: body.guest_name,
        guest_phone: body.guest_phone || null,
        guest_nationality: body.guest_nationality || null,
        date_of_birth: body.date_of_birth || null,
        passport_number: body.passport_number || null,
        id_type: body.id_type || 'passport',
        id_number: body.id_number || null,
        id_expiry_date: body.id_expiry_date || null,
        id_issue_date: body.id_issue_date || null,
        id_issuing_country: body.id_issuing_country || null,
        room_type_preference: body.room_type_preference || null,
        pillow_preference: body.pillow_preference || null,
        dietary_restrictions: body.dietary_restrictions || null,
        language_preference: body.language_preference || null,
        tin: body.tin || null,
        vat_no: body.vat_no || null,
        vat_date: body.vat_date || null,
        vehicle_plate: body.vehicle_plate || null,
        vehicle_make: body.vehicle_make || null,
        vehicle_model: body.vehicle_model || null,
        emergency_contact_name: body.emergency_contact_name || null,
        emergency_contact_phone: body.emergency_contact_phone || null,
        emergency_contact_relationship: body.emergency_contact_relationship || null,
        estimated_arrival_time: body.estimated_arrival_time || null,
        id_front_image_url: body.id_front_image_url || null,
        id_back_image_url: body.id_back_image_url || null,
        special_requests: body.special_requests || null,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'reservation_id,guest_email' })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ preRegistration: data });
  });

// Public: Check pre-registration status by reservation ID + email
router.get('/pre-registration/:reservationId', async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservationId } = req.params;
    const email = req.query.email as string;
    let query = supabaseAdmin.from('pre_registrations').select('*').eq('reservation_id', reservationId);
    if (email) query = query.eq('guest_email', email);
    const { data, error } = await query.single();
    if (error) return res.json({ preRegistration: null });
    res.json({ preRegistration: data });
  });

export default router;
