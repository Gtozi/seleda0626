import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent, ensureAuditEventsTable } from '../services/sessionService';

const router = Router();

// Report a permission denial
router.post('/permission-denial', authenticate, async (req, res) => {
  await writeAuditEvent({ req, user: req.user, action: 'permission.denial_reported', module: 'auth', outcome: 'denied', details: { requestedAction: req.body?.action, reason: req.body?.reason } });
  res.json({ success: true });
});

// Client-side audit log
router.post('/log', authenticate, async (req, res) => {
  const body = req.body || {};
  await writeAuditEvent({
    req,
    user: req.user,
    action: body.action || 'client.audit',
    module: body.module || 'client',
    entityType: body.entityType || null,
    entityId: body.recordId || body.entityId || null,
    details: { details: body.details, clientTimestamp: body.timestamp }
  });
  res.json({ success: true });
});

// Get audit exceptions
router.get('/exceptions', authenticate, requirePermission('audit:view'), async (_req, res) => {

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('audit_exceptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ exceptions: data || [] });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create audit exception
router.post('/exceptions', authenticate, requirePermission('audit:view'), async (req, res) => {

  const { description, reservationId, roomNumber, businessDate, owner } = req.body || {};
  if (!description) return res.status(400).json({ error: 'description is required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('audit_exceptions')
      .insert({
        description,
        reservation_id: reservationId || null,
        room_number: roomNumber || null,
        business_date: businessDate || new Date().toISOString().slice(0, 10),
        owner: owner || req.user?.name || 'Front Office'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, exception: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Resolve an audit exception
router.patch('/exceptions/:id/resolve', authenticate, requirePermission('audit:view'), async (req, res) => {

  const id = req.params.id;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('audit_exceptions')
      .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: req.user?.id || null })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, exception: data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get audit events
router.get('/events', authenticate, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 500, 1000);
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let { data, error } = await supabaseAdmin
      .from('audit_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error && error.code === '42P01') {
      await ensureAuditEventsTable();
      const result = await supabaseAdmin
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      data = result.data;
      error = result.error;
    }
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
