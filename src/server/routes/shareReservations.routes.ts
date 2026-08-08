import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';

const router = Router();

// ── Share Reservations (Multi-Guest Linking) ─────────────────────────────

  // Get all shared guests for a reservation
router.get('/:reservationId', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservationId } = req.params;
    const { data, error } = await supabaseAdmin.rpc('get_shared_guests', { p_reservation_id: reservationId });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ sharedGuests: data || [] });
  });

  // Add a guest to a shared reservation
router.post('/', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { reservation_id, guest_id, role, is_primary_occupant, billing_split, folio_label, preferences, notes } = req.body;
    if (!reservation_id || !guest_id) {
      return res.status(400).json({ error: 'reservation_id and guest_id are required' });
    }
    const { data, error } = await supabaseAdmin
      .from('share_reservations')
      .insert({
        reservation_id,
        guest_id,
        role: role || 'sharing',
        is_primary_occupant: is_primary_occupant || false,
        billing_split: billing_split || 'shared',
        folio_label: folio_label || null,
        preferences: preferences || null,
        notes: notes || null,
      })
      .select('*')
      .single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Guest already linked to this reservation' });
      return res.status(500).json({ error: error.message });
    }

    // Also update the reservation's additionalGuestIds array for backward compatibility
    const { data: resData } = await supabaseAdmin.from('reservations').select('additional_guest_ids').eq('id', reservation_id).single();
    if (resData) {
      const existingIds: string[] = Array.isArray(resData.additional_guest_ids) ? resData.additional_guest_ids : [];
      if (!existingIds.includes(guest_id)) {
        await supabaseAdmin.from('reservations').update({ additional_guest_ids: [...existingIds, guest_id] }).eq('id', reservation_id);
      }
    }

    await writeAuditEvent({
      req, user: req.user!,
      action: 'share_reservation.guest_added',
      entityType: 'Reservation',
      entityId: reservation_id,
      module: 'reservations',
      details: { guest_id, role: role || 'sharing' },
    });

    res.json({ shareReservation: data });
  });

  // Update a shared guest's role/billing preferences
router.patch('/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { role, is_primary_occupant, billing_split, folio_label, preferences, notes } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (role !== undefined) updates.role = role;
    if (is_primary_occupant !== undefined) updates.is_primary_occupant = is_primary_occupant;
    if (billing_split !== undefined) updates.billing_split = billing_split;
    if (folio_label !== undefined) updates.folio_label = folio_label;
    if (preferences !== undefined) updates.preferences = preferences;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin.from('share_reservations').update(updates).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ shareReservation: data });
  });

  // Remove a guest from a shared reservation
router.delete('/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;

    // Get the share record before deleting (to update additionalGuestIds)
    const { data: shareData } = await supabaseAdmin.from('share_reservations').select('reservation_id, guest_id').eq('id', id).single();

    const { error } = await supabaseAdmin.from('share_reservations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    // Remove from reservation's additionalGuestIds for backward compatibility
    if (shareData) {
      const { data: resData } = await supabaseAdmin.from('reservations').select('additional_guest_ids').eq('id', shareData.reservation_id).single();
      if (resData && Array.isArray(resData.additional_guest_ids)) {
        const updatedIds = resData.additional_guest_ids.filter((gid: string) => gid !== shareData.guest_id);
        await supabaseAdmin.from('reservations').update({ additional_guest_ids: updatedIds }).eq('id', shareData.reservation_id);
      }
    }

    res.json({ success: true });
  });

export default router;
