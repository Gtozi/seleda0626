import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sessionService';

const router = Router();

// Admin: List all pre-registrations (with optional status filter)
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const status = req.query.status as string;
  let query = supabaseAdmin.from('pre_registrations').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ preRegistrations: data || [] });
});

// Admin: Get a single pre-registration
router.get('/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from('pre_registrations').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ preRegistration: data });
});

// Admin: Review a pre-registration (update status + notes)
router.patch('/:id/review', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { status, review_notes } = req.body;
  if (!['pending', 'reviewed', 'imported', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const { data, error } = await supabaseAdmin
    .from('pre_registrations')
    .update({
      status,
      review_notes: review_notes || null,
      reviewed_by: req.user?.id || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await writeAuditEvent({
    req, user: req.user!,
    action: 'pre_registration.reviewed',
    entityType: 'PreRegistration',
    entityId: id,
    module: 'crm',
    details: { status, review_notes },
  });

  res.json({ preRegistration: data });
});

// Admin: Import a pre-registration into CRM (create/update guest profile)
router.post('/:id/import', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;

  const { data: prereg, error: fetchErr } = await supabaseAdmin
    .from('pre_registrations')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr || !prereg) return res.status(404).json({ error: 'Pre-registration not found' });

  // Check if guest already exists by email
  const { data: existingGuest } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('email', prereg.guest_email)
    .single();

  const guestPayload: Record<string, any> = {
    name: prereg.guest_name,
    email: prereg.guest_email,
    phone: prereg.guest_phone || '',
    nationality: prereg.guest_nationality || null,
    date_of_birth: prereg.date_of_birth || null,
    passport_number: prereg.passport_number || null,
    tin: prereg.tin || null,
    vat_no: prereg.vat_no || null,
    vat_date: prereg.vat_date || null,
    special_requests: prereg.special_requests || '',
    notes: `Imported from pre-registration for reservation ${prereg.reservation_id}`,
    identification_doc: prereg.id_number ? {
      type: prereg.id_type || 'passport',
      number: prereg.id_number,
      expiryDate: prereg.id_expiry_date || '',
      issueDate: prereg.id_issue_date || undefined,
      issuingCountry: prereg.id_issuing_country || undefined,
      frontImageUrl: prereg.id_front_image_url || undefined,
      backImageUrl: prereg.id_back_image_url || undefined,
      isUploaded: true,
    } : undefined,
    preferences: prereg.room_type_preference || prereg.pillow_preference || prereg.dietary_restrictions || prereg.language_preference ? {
      roomTypePreference: prereg.room_type_preference || undefined,
      pillowPreference: prereg.pillow_preference || undefined,
      dietaryRestrictions: prereg.dietary_restrictions || undefined,
      languagePreference: prereg.language_preference || undefined,
    } : undefined,
  };

  let guestId: string;
  if (existingGuest) {
    // Update existing guest
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('guests')
      .update(guestPayload)
      .eq('id', existingGuest.id)
      .select('id')
      .single();
    if (updErr) return res.status(500).json({ error: updErr.message });
    guestId = updated.id;
  } else {
    // Create new guest
    guestPayload.id = `guest-${Date.now()}`;
    guestPayload.status = 'Regular';
    guestPayload.loyalty_points = 0;
    guestPayload.total_spend = 0;
    guestPayload.history = [];
    const { data: created, error: createErr } = await supabaseAdmin
      .from('guests')
      .insert(guestPayload)
      .select('id')
      .single();
    if (createErr) return res.status(500).json({ error: createErr.message });
    guestId = created.id;
  }

  // Link reservation to this guest
  await supabaseAdmin
    .from('reservations')
    .update({ guest_id: guestId })
    .eq('id', prereg.reservation_id);

  // Mark pre-registration as imported
  await supabaseAdmin
    .from('pre_registrations')
    .update({
      status: 'imported',
      imported_guest_id: guestId,
      reviewed_by: req.user?.id || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  await writeAuditEvent({
    req, user: req.user!,
    action: 'pre_registration.imported',
    entityType: 'PreRegistration',
    entityId: id,
    module: 'crm',
    details: { guest_id: guestId, reservation_id: prereg.reservation_id },
  });

  res.json({ success: true, guestId });
});

export default router;
