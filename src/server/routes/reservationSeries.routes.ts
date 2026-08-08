import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';

const router = Router();

// ── Reservation Series ───────────────────────────────────────────────────

router.get('/', authenticate, async (_req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { data, error } = await supabaseAdmin
      .from('reservation_series')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ series: data || [] });
  });

  // Get series details with child reservations
router.get('/:id', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const [seriesResult, reservationsResult] = await Promise.all([
      supabaseAdmin.from('reservation_series').select('*').eq('id', id).single(),
      supabaseAdmin.from('reservations').select('id, check_in_date, check_out_date, status, room_number').eq('series_id', id).order('check_in_date'),
    ]);
    if (seriesResult.error) return res.status(500).json({ error: seriesResult.error.message });
    res.json({ series: seriesResult.data, reservations: reservationsResult.data || [] });
  });

  // Create series and generate child reservations
router.post('/', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const {
      series_name, guest_name, guest_email, guest_phone, guest_status,
      room_type, adults, children, rate, channel, payment_status, notes,
      frequency, interval_days, days_of_week, check_in_offset,
      start_date, end_date, property_id
    } = req.body;

    if (!series_name || !guest_name || !room_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'series_name, guest_name, room_type, start_date, and end_date are required' });
    }
    if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
    }
    const nights = Math.max(1, check_in_offset || 1);

    // Insert the series record
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('reservation_series')
      .insert({
        series_name, guest_name, guest_email, guest_phone,
        guest_status: guest_status || 'Regular',
        room_type, adults: adults || 1, children: children || 0,
        rate: rate || 0, channel: channel || 'Direct Website',
        payment_status: payment_status || 'Unpaid', notes,
        frequency, interval_days: interval_days || 1,
        days_of_week: days_of_week || null,
        check_in_offset: nights,
        start_date, end_date,
        property_id: property_id || null,
      })
      .select('*')
      .single();
    if (seriesError) return res.status(500).json({ error: seriesError.message });

    const seriesId = seriesData.id;

    // Generate occurrence dates
    const { data: datesData, error: datesError } = await supabaseAdmin
      .rpc('generate_series_dates', {
        p_frequency: frequency,
        p_interval: interval_days || 1,
        p_days_of_week: days_of_week || null,
        p_start_date: start_date,
        p_end_date: end_date,
      });
    if (datesError) return res.status(500).json({ error: `Date generation failed: ${datesError.message}` });

    const occurrences: any[] = datesData || [];
    if (occurrences.length === 0) {
      return res.json({ series: seriesData, generatedCount: 0, message: 'No occurrences generated for the given pattern.' });
    }

    // Build reservation rows
    const reservationRows = occurrences.map((occ: any) => {
      const checkIn = occ.occurrence_date;
      const checkOutDate = new Date(checkIn);
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      const checkOutStr = checkOutDate.toISOString().split('T')[0];
      const resId = `RS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      return {
        id: resId,
        series_id: seriesId,
        guest_name, guest_email, guest_phone,
        guest_status: guest_status || 'Regular',
        room_type,
        check_in_date: checkIn,
        check_out_date: checkOutStr,
        adults: adults || 1,
        children: children || 0,
        status: 'Waitlisted',
        rate: rate || 0,
        total_amount: (rate || 0) * nights,
        channel: channel || 'Direct Website',
        payment_status: payment_status || 'Unpaid',
        notes: notes || null,
        property_id: property_id || null,
      };
    });

    // Batch insert reservations
    const { error: insertError } = await supabaseAdmin
      .from('reservations')
      .insert(reservationRows);
    if (insertError) return res.status(500).json({ error: `Series created but reservation generation failed: ${insertError.message}` });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.created',
      entityType: 'ReservationSeries',
      entityId: seriesId,
      module: 'reservations',
      details: { series_name, frequency, occurrences: occurrences.length },
    });

    res.json({ series: seriesData, generatedCount: occurrences.length });
  });

  // Cancel a series and all future child reservations
router.delete('/:id', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    // Mark series inactive
    const { error: seriesErr } = await supabaseAdmin.from('reservation_series').update({ is_active: false }).eq('id', id);
    if (seriesErr) return res.status(500).json({ error: seriesErr.message });
    // Cancel all future reservations in the series that are still Waitlisted/Confirmed
    const today = new Date().toISOString().split('T')[0];
    const { error: resErr } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'Cancelled' })
      .eq('series_id', id)
      .in('status', ['Waitlisted', 'Confirmed'])
      .gte('check_in_date', today);
    if (resErr) return res.status(500).json({ error: resErr.message });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.cancelled',
      entityType: 'ReservationSeries',
      entityId: id,
      module: 'reservations',
    });

    res.json({ success: true });
  });

// ── Reservation Series Exceptions ─────────────────────────────────────────

router.post('/:id/exceptions', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { exception_date, exception_type, override_room_type, override_rate, override_adults, override_children, reason } = req.body;

    if (!exception_date || !exception_type) {
      return res.status(400).json({ error: 'exception_date and exception_type are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('reservation_series_exceptions')
      .insert({
        series_id: id,
        exception_date,
        exception_type,
        override_room_type,
        override_rate,
        override_adults,
        override_children,
        reason,
        created_by: req.user?.id || null
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.exception_added',
      entityType: 'ReservationSeries',
      entityId: id,
      module: 'reservations',
      details: { exception_date, exception_type }
    });

    res.json({ exception: data });
  });

  // Get series exceptions
router.get('/:id/exceptions', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('reservation_series_exceptions')
      .select('*')
      .eq('series_id', id)
      .order('exception_date');

    if (error) return res.status(500).json({ error: error.message });
    res.json({ exceptions: data || [] });
  });

  // Remove series exception
router.delete('/:id/exceptions/:exceptionId', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id, exceptionId } = req.params;

    const { error } = await supabaseAdmin
      .from('reservation_series_exceptions')
      .delete()
      .eq('id', exceptionId)
      .eq('series_id', id);

    if (error) return res.status(500).json({ error: error.message });

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.exception_removed',
      entityType: 'ReservationSeries',
      entityId: id,
      module: 'reservations',
      details: { exception_id: exceptionId }
    });

    res.json({ success: true });
  });

// ── Reservation Series Analytics ──────────────────────────────────────────

  // Get series analytics
router.get('/:id/analytics', authenticate, async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { from_date, to_date } = req.query;

    let query = supabaseAdmin
      .from('reservation_series_analytics')
      .select('*')
      .eq('series_id', id)
      .order('analytics_date', { ascending: false });

    if (from_date) query = query.gte('analytics_date', from_date);
    if (to_date) query = query.lte('analytics_date', to_date);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ analytics: data || [] });
  });

  // Update series analytics manually
router.post('/:id/analytics', authenticate, requirePermission('reservation:update'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { analytics_date } = req.body;

    const { error } = await supabaseAdmin.rpc('update_series_analytics_v2', {
      p_series_id: id,
      p_analytics_date: analytics_date || new Date().toISOString().split('T')[0]
    });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true });
  });

// ── Reservation Series Regenerate ─────────────────────────────────────────

  // Regenerate series reservations with exceptions
router.post('/:id/regenerate', authenticate, requirePermission('reservation:create'), async (req, res) => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
    const { id } = req.params;

    // Get series details
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('reservation_series')
      .select('*')
      .eq('id', id)
      .single();

    if (seriesError) return res.status(500).json({ error: seriesError.message });

    // Generate dates with exceptions
    const { data: datesData, error: datesError } = await supabaseAdmin
      .rpc('generate_series_dates_with_exceptions', { p_series_id: id });

    if (datesError) return res.status(500).json({ error: datesError.message });

    const occurrences: any[] = datesData || [];
    const validOccurrences = occurrences.filter((occ: any) => !occ.is_exception || occ.exception_type !== 'skip');

    // Delete existing future reservations in this series
    const today = new Date().toISOString().split('T')[0];
    await supabaseAdmin
      .from('reservations')
      .delete()
      .eq('series_id', id)
      .gte('check_in_date', today);

    // Build and insert new reservation rows
    const nights = seriesData.check_in_offset || 1;
    const reservationRows = validOccurrences.map((occ: any) => {
      const checkIn = occ.occurrence_date;
      const checkOutDate = new Date(checkIn);
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      const checkOutStr = checkOutDate.toISOString().split('T')[0];

      // Check if this is a modify exception
      const exception = occurrences.find((o: any) => o.occurrence_date === checkIn && o.exception_type === 'modify');

      return {
        id: `RS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        series_id: id,
        guest_name: seriesData.guest_name,
        guest_email: seriesData.guest_email,
        guest_phone: seriesData.guest_phone,
        guest_status: seriesData.guest_status,
        room_type: exception?.override_room_type || seriesData.room_type,
        check_in_date: checkIn,
        check_out_date: checkOutStr,
        adults: exception?.override_adults || seriesData.adults,
        children: exception?.override_children || seriesData.children,
        status: seriesData.auto_confirm ? 'Confirmed' : 'Waitlisted',
        rate: exception?.override_rate || seriesData.rate,
        total_amount: (exception?.override_rate || seriesData.rate || 0) * nights,
        channel: seriesData.channel,
        payment_status: seriesData.payment_status,
        notes: seriesData.notes,
        property_id: seriesData.property_id
      };
    });

    const { error: insertError } = await supabaseAdmin
      .from('reservations')
      .insert(reservationRows);

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Update series metadata
    await supabaseAdmin
      .from('reservation_series')
      .update({
        last_modified_by: req.user?.id || null,
        last_modified_at: new Date().toISOString()
      })
      .eq('id', id);

    await writeAuditEvent({
      req, user: req.user!,
      action: 'reservation_series.regenerated',
      entityType: 'ReservationSeries',
      entityId: id,
      module: 'reservations',
      details: { generated_count: reservationRows.length }
    });

    res.json({ success: true, generatedCount: reservationRows.length });
  });

export default router;
