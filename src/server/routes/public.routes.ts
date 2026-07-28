import { Router } from 'express';
import { z } from 'zod';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { getTypeAvailability, getRoomImageUrl } from '../services/sharedServices';
import { getSeasonMultiplier, type SeasonRow } from '../../utils/pricing';
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

  const [{ data: roomTypes, error: rtError }, { data: rooms, error: roomsError }, { data: reservations, error: resError }, { data: seasons }] = await Promise.all([
    supabaseAdmin.from('room_types').select('*').eq('is_active', true),
    supabaseAdmin.from('rooms').select('*'),
    supabaseAdmin.from('reservations').select('*').lte('check_in_date', checkOut).gte('check_out_date', checkIn),
    supabaseAdmin.from('seasons').select('*')
  ]);
  if (rtError) return res.status(500).json({ error: rtError.message });
  if (roomsError) return res.status(500).json({ error: roomsError.message });
  if (resError) return res.status(500).json({ error: resError.message });

  const roomTypesList = roomTypes || [];
  const roomsList = rooms || [];
  const reservationsList = reservations || [];
  const season = getSeasonMultiplier(checkIn, (seasons || []) as SeasonRow[]);

  const result = roomTypesList.map((rt: any) => {
    const availability = getTypeAvailability(rt.id, checkIn, checkOut, roomsList, reservationsList);
    return {
      type: rt.id,
      title: rt.name,
      description: rt.description || `${rt.name} room`,
      rate: rt.base_price,
      baseRate: rt.base_price,
      capacity: rt.max_occupancy,
      available: availability.available,
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

export default router;
