import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';

const router = Router();

// ── Group Bookings ─────────────────────────────────────────────

const groupBookingInputSchema = z.object({
  groupName: z.string().min(1, 'Group name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  roomTypeNeeded: z.string().optional(),
  roomCount: z.coerce.number().int().min(1).default(1),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  discountPercent: z.coerce.number().min(0).default(0),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).default('Pending'),
}).refine((data) => {
  const start = new Date(data.checkInDate);
  const end = new Date(data.checkOutDate);
  return end > start;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

router.post('/group-bookings', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const validation = groupBookingInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { groupName, contactName, contactEmail, contactPhone, roomTypeNeeded, roomCount, checkInDate, checkOutDate, discountPercent, status } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('create_group_booking', {
      p_group_name: groupName,
      p_contact_name: contactName,
      p_contact_email: contactEmail || '',
      p_contact_phone: contactPhone || null,
      p_room_type_needed: roomTypeNeeded || 'Double',
      p_room_count: roomCount || 1,
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate,
      p_discount_percent: discountPercent || 0,
      p_status: status || 'Pending',
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Group booking creation failed' });

    return res.json({ success: true, groupId: data.groupId });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/group-bookings/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const groupId = req.params.id;
  const statusSchema = z.object({ status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']) });
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { status } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('group_bookings')
      .update({ status })
      .eq('id', groupId);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, groupId, status });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ── Group Profiles ─────────────────────────────────────────────

router.get('/group-profiles', authenticate, requirePermission('reports:view'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('group_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ groupProfiles: data || [] });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/group-profiles/:id', authenticate, requirePermission('reports:view'), async (req, res) => {
  const groupId = req.params.id;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('group_profiles')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Group profile not found' });
    return res.json({ groupProfile: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/group-profiles', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const groupProfileInputSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    status: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().email().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactTitle: z.string().optional(),
    organizationName: z.string().optional(),
    organizationAddress: z.string().optional(),
    organizationCity: z.string().optional(),
    organizationCountry: z.string().optional(),
    organizationTaxId: z.string().optional(),
    organizationVatNo: z.string().optional(),
    billingAddress: z.string().optional(),
    billingCity: z.string().optional(),
    billingCountry: z.string().optional(),
    billingTaxId: z.string().optional(),
    billingVatNo: z.string().optional(),
    paymentTerms: z.string().optional(),
    creditLimit: z.coerce.number().min(0).optional(),
    currentBalance: z.coerce.number().optional(),
    contractStartDate: z.string().optional(),
    contractEndDate: z.string().optional(),
    cutOffDate: z.string().optional(),
    negotiatedRateCode: z.string().optional(),
    discountPercent: z.coerce.number().min(0).optional(),
    masterPaymentMethod: z.string().optional(),
    roomTypeBreakdown: z.any().optional(),
    totalRoomsAllocated: z.coerce.number().int().min(0).optional(),
    totalRoomsUsed: z.coerce.number().int().min(0).optional(),
    totalRevenue: z.coerce.number().min(0).optional(),
    totalRoomNights: z.coerce.number().int().min(0).optional(),
    totalStays: z.coerce.number().int().min(0).optional(),
    lifetimeValue: z.coerce.number().min(0).optional(),
    averageDailyRate: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
    preferences: z.record(z.string(), z.any()).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    defaultRoutingProfileId: z.string().optional(),
  });

  const validation = groupProfileInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const groupData = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const newId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabaseAdmin
      .from('group_profiles')
      .insert({
        id: newId,
        code: groupData.code,
        name: groupData.name,
        type: groupData.type,
        status: groupData.status || 'Active',
        contact_name: groupData.contactName || null,
        contact_email: groupData.contactEmail || null,
        contact_phone: groupData.contactPhone || null,
        contact_title: groupData.contactTitle || null,
        organization_name: groupData.organizationName || null,
        organization_address: groupData.organizationAddress || null,
        organization_city: groupData.organizationCity || null,
        organization_country: groupData.organizationCountry || null,
        organization_tax_id: groupData.organizationTaxId || null,
        organization_vat_no: groupData.organizationVatNo || null,
        billing_address: groupData.billingAddress || null,
        billing_city: groupData.billingCity || null,
        billing_country: groupData.billingCountry || null,
        billing_tax_id: groupData.billingTaxId || null,
        billing_vat_no: groupData.billingVatNo || null,
        payment_terms: groupData.paymentTerms || null,
        credit_limit: groupData.creditLimit || 0,
        current_balance: groupData.currentBalance || 0,
        contract_start_date: groupData.contractStartDate || null,
        contract_end_date: groupData.contractEndDate || null,
        cut_off_date: groupData.cutOffDate || null,
        negotiated_rate_code: groupData.negotiatedRateCode || null,
        discount_percent: groupData.discountPercent || 0,
        master_payment_method: groupData.masterPaymentMethod || null,
        room_type_breakdown: groupData.roomTypeBreakdown || null,
        total_rooms_allocated: groupData.totalRoomsAllocated || 0,
        total_rooms_used: groupData.totalRoomsUsed || 0,
        total_revenue: groupData.totalRevenue || 0,
        total_room_nights: groupData.totalRoomNights || 0,
        total_stays: groupData.totalStays || 0,
        lifetime_value: groupData.lifetimeValue || 0,
        average_daily_rate: groupData.averageDailyRate || 0,
        notes: groupData.notes || null,
        preferences: groupData.preferences || {},
        custom_fields: groupData.customFields || {},
        default_routing_profile_id: groupData.defaultRoutingProfileId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: req.user!.id,
        updated_by: req.user!.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'group_profile_created',
      entityType: 'GroupProfile',
      entityId: newId,
      module: 'group_management',
      details: { groupName: groupData.name, groupType: groupData.type }
    });

    return res.json({ success: true, groupProfile: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/group-profiles/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const groupId = req.params.id;
  const updates = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('group_profiles')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Group profile not found' });

    const { data, error } = await supabaseAdmin
      .from('group_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: req.user!.id,
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'group_profile_updated',
      entityType: 'GroupProfile',
      entityId: groupId,
      module: 'group_management',
      details: { previousValues: existing, newValues: updates }
    });

    return res.json({ success: true, groupProfile: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.delete('/group-profiles/:id', authenticate, requirePermission('reservation:delete'), async (req, res) => {
  const groupId = req.params.id;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('group_profiles')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Group profile not found' });

    const { error } = await supabaseAdmin
      .from('group_profiles')
      .delete()
      .eq('id', groupId);

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'group_profile_deleted',
      entityType: 'GroupProfile',
      entityId: groupId,
      module: 'group_management',
      details: { deletedProfile: existing }
    });

    return res.json({ success: true, groupId });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/group-profiles/:id/members', authenticate, requirePermission('reports:view'), async (req, res) => {
  const groupId = req.params.id;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('get_group_active_members', {
      p_group_id: groupId,
    });

    if (error) return res.status(500).json({ error: error.message });
    // Normalize the RPC column names (guest_id, guest_name, guest_email,
    // relationship_type, is_primary_contact) to the camelCase shape the
    // frontend member cards expect (id, name, email, relationshipType,
    // isPrimaryContact) so member.id / member.name resolve correctly.
    const members = (data || []).map((m: any) => ({
      ...m,
      id: m.guest_id ?? m.id,
      name: m.guest_name ?? m.name,
      email: m.guest_email ?? m.email,
      relationshipType: m.relationship_type ?? m.relationshipType,
      isPrimaryContact: m.is_primary_contact ?? m.isPrimaryContact,
    }));
    return res.json({ members });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ── Guest → Active Groups (for reservation auto-suggest & guest profile) ──

router.get('/group-profiles/guest/:guestId/groups', authenticate, requirePermission('reports:view'), async (req, res) => {
  const guestId = req.params.guestId;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('get_guest_active_groups', {
      p_guest_id: guestId,
    });

    if (error) {
      // Fail soft if the RPC is not deployed yet.
      if (error.code === '42883' || error.code === '42P01') {
        return res.json({ groups: [] });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.json({ groups: data || [] });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ── Guest Group Relationships ──────────────────────────────────

router.get('/guest-group-relationships/:guestId', authenticate, requirePermission('reports:view'), async (req, res) => {
  const guestId = req.params.guestId;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('guest_group_relationships')
      .select('*')
      .eq('guest_id', guestId)
      .order('start_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ relationships: data || [] });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

const guestGroupRelInputSchema = z.object({
  guestId: z.string().min(1, 'guestId is required'),
  groupId: z.string().min(1, 'groupId is required'),
  relationshipType: z.string().optional(),
  isPrimaryContact: z.boolean().optional().default(false),
  reservationId: z.string().optional(),
  roleTitle: z.string().optional(),
});

router.post('/guest-group-relationships', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const validation = guestGroupRelInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { guestId, groupId, relationshipType, isPrimaryContact, reservationId } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('link_guest_to_group', {
      p_guest_id: guestId,
      p_group_id: groupId,
      p_relationship_type: relationshipType || null,
      p_is_primary_contact: isPrimaryContact || false,
      p_reservation_id: reservationId || null,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to link guest to group' });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'guest_linked_to_group',
      entityType: 'GuestGroupRelationship',
      entityId: data.relationshipId,
      module: 'group_management',
      details: { groupId, guestId, relationshipType, isPrimaryContact }
    });

    return res.json({ success: true, relationshipId: data.relationshipId });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/guest-group-relationships/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
  const relationshipId = req.params.id;
  const updates = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('guest_group_relationships')
      .select('*')
      .eq('id', relationshipId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Relationship not found' });

    const { data, error } = await supabaseAdmin
      .from('guest_group_relationships')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: req.user!.id,
      })
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'relationship_updated',
      entityType: 'GuestGroupRelationship',
      entityId: relationshipId,
      module: 'group_management',
      details: { groupId: existing.group_id, guestId: existing.guest_id, relationshipId, previousValues: existing, newValues: updates }
    });

    return res.json({ success: true, relationship: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.delete('/guest-group-relationships/:id', authenticate, requirePermission('reservation:delete'), async (req, res) => {
  const relationshipId = req.params.id;
  const { reason } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('guest_group_relationships')
      .select('*')
      .eq('id', relationshipId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Relationship not found' });

    const { data, error } = await supabaseAdmin.rpc('unlink_guest_from_group', {
      p_guest_id: existing.guest_id,
      p_group_id: existing.group_id,
      p_reason: reason || null,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to unlink guest from group' });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'guest_unlinked_from_group',
      entityType: 'GuestGroupRelationship',
      entityId: relationshipId,
      module: 'group_management',
      details: { groupId: existing.group_id, guestId: existing.guest_id, relationshipId, reason }
    });

    return res.json({ success: true, relationshipId });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ── Group Profile Link/Unlink Guest (convenience endpoints) ────

router.post('/group-profiles/:id/link-guest', authenticate, requirePermission('reservation:create'), async (req, res) => {
  const groupId = req.params.id;
  const linkGuestSchema = z.object({
    guestId: z.string().min(1, 'guestId is required'),
    relationshipType: z.string().optional(),
    isPrimaryContact: z.boolean().optional().default(false),
    reservationId: z.string().optional(),
  });
  const validation = linkGuestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { guestId, relationshipType, isPrimaryContact, reservationId } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('link_guest_to_group', {
      p_guest_id: guestId,
      p_group_id: groupId,
      p_relationship_type: relationshipType || null,
      p_is_primary_contact: isPrimaryContact || false,
      p_reservation_id: reservationId || null,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to link guest to group' });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'guest_linked_to_group',
      entityType: 'GuestGroupRelationship',
      entityId: data.relationshipId,
      module: 'group_management',
      details: { groupId, guestId, relationshipType, isPrimaryContact, automatic: true }
    });

    return res.json({ success: true, relationshipId: data.relationshipId });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/group-profiles/:id/unlink-guest', authenticate, requirePermission('reservation:delete'), async (req, res) => {
  const groupId = req.params.id;
  const unlinkGuestSchema = z.object({
    guestId: z.string().min(1, 'guestId is required'),
    reason: z.string().optional(),
  });
  const validation = unlinkGuestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { guestId, reason } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('unlink_guest_from_group', {
      p_guest_id: guestId,
      p_group_id: groupId,
      p_reason: reason || null,
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Failed to unlink guest from group' });

    await writeAuditEvent({
      req,
      user: req.user,
      action: 'guest_unlinked_from_group',
      entityType: 'GuestGroupRelationship',
      module: 'group_management',
      details: { groupId, guestId, reason }
    });

    return res.json({ success: true });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
