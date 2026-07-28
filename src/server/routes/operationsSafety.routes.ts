import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Comprehensive Incident Management System ───────────────────────────
// Create incident
router.post('/incidents', authenticate, requirePermission('ops:safety:incidents'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    incidentType,
    severity,
    title,
    description,
    location,
    reportedBy,
    affectedGuests,
    photos,
  } = req.body || {};
  
  if (!propertyId || !incidentType || !title) {
    return res.status(400).json({ error: 'propertyId, incidentType, and title are required' });
  }

  const incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabaseAdmin.from('safety_incidents').insert({
    incident_number: incidentNumber,
    property_id: propertyId,
    incident_type: incidentType,
    severity: severity || 'medium',
    title,
    description,
    location,
    reported_by: reportedBy || req.user?.id,
    affected_guests: affectedGuests || [],
    photos: photos || [],
    status: 'open',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

// Get incidents
router.get('/incidents/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, severity, incidentType } = req.query as Record<string, string>;
  
  const cacheKey = `safety-incidents:${req.params.propertyId}:${status || 'all'}:${severity || 'all'}:${incidentType || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('safety_incidents')
    .select('*, users(name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (severity) q = q.eq('severity', severity);
  if (incidentType) q = q.eq('incident_type', incidentType);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    incidents: data || [],
    summary: {
      total: (data || []).length,
      open: (data || []).filter(i => i.status === 'open').length,
      investigating: (data || []).filter(i => i.status === 'investigating').length,
      resolved: (data || []).filter(i => i.status === 'resolved').length,
      critical: (data || []).filter(i => i.severity === 'critical').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update incident status
router.put('/incidents/:id/status', authenticate, requirePermission('ops:safety:incidents'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, resolution, assignedTo, resolvedBy } = req.body || {};
  
  if (!status || !['open', 'investigating', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (resolution) updateData.resolution = resolution;
  if (assignedTo) updateData.assigned_to = assignedTo;
  if (resolvedBy) updateData.resolved_by = resolvedBy;
  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('safety_incidents')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.json(data);
});

// ── Safety Compliance Tracking ────────────────────────────────────────────
// Create compliance checklist
router.post('/compliance/checklists', authenticate, requirePermission('ops:safety:compliance'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    checklistName,
    checklistType,
    items,
    frequency,
    assignedTo,
  } = req.body || {};
  
  if (!propertyId || !checklistName || !items) {
    return res.status(400).json({ error: 'propertyId, checklistName, and items are required' });
  }

  const { data, error } = await supabaseAdmin.from('compliance_checklists').insert({
    property_id: propertyId,
    checklist_name: checklistName,
    checklist_type: checklistType,
    items,
    frequency,
    assigned_to: assignedTo,
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

// Submit compliance checklist
router.post('/compliance/submissions', authenticate, requirePermission('ops:safety:compliance'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    checklistId,
    submittedBy,
    responses,
    photos,
    notes,
  } = req.body || {};
  
  if (!propertyId || !checklistId || !responses) {
    return res.status(400).json({ error: 'propertyId, checklistId, and responses are required' });
  }

  const { data, error } = await supabaseAdmin.from('compliance_submissions').insert({
    property_id: propertyId,
    checklist_id: checklistId,
    submitted_by: submittedBy || req.user?.id,
    responses,
    photos: photos || [],
    notes,
    submission_date: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

// Get compliance submissions
router.get('/compliance/submissions/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { checklistId, days } = req.query as Record<string, string>;
  
  const daysAgo = parseInt(days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  let q = supabaseAdmin
    .from('compliance_submissions')
    .select('*, compliance_checklists(checklist_name), users(name)')
    .eq('property_id', req.params.propertyId)
    .gte('submission_date', startDate.toISOString())
    .order('submission_date', { ascending: false });
  
  if (checklistId) q = q.eq('checklist_id', checklistId);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    submissions: data || [],
    summary: {
      total: (data || []).length,
      passing: (data || []).filter(s => calculateComplianceScore(s.responses) >= 80).length,
      avgScore: (data || []).reduce((sum, s) => sum + calculateComplianceScore(s.responses), 0) / ((data || []).length || 1),
    },
  });
});

function calculateComplianceScore(responses: any[]): number {
  if (!responses || responses.length === 0) return 0;
  const passed = responses.filter(r => r.passed).length;
  return (passed / responses.length) * 100;
}

// ── Emergency Response Automation ───────────────────────────────────────
// Trigger emergency response
router.post('/emergency/trigger', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    emergencyType,
    location,
    severity,
    triggeredBy,
    notes,
  } = req.body || {};
  
  if (!propertyId || !emergencyType || !location) {
    return res.status(400).json({ error: 'propertyId, emergencyType, and location are required' });
  }

  const emergencyNumber = `EMG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Create emergency record
  const { data, error } = await supabaseAdmin.from('emergency_responses').insert({
    emergency_number: emergencyNumber,
    property_id: propertyId,
    emergency_type: emergencyType,
    location,
    severity: severity || 'high',
    triggered_by: triggeredBy || req.user?.id,
    notes,
    status: 'active',
    triggered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Execute emergency response protocol
  await executeEmergencyProtocol(propertyId, emergencyType, location, severity);

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

async function executeEmergencyProtocol(propertyId: string, emergencyType: string, location: string, severity: string) {
  // Get emergency contacts
  const { data: contacts } = await supabaseAdmin
    .from('emergency_contacts')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  // Get response team
  const { data: team } = await supabaseAdmin
    .from('emergency_response_team')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  // Create alerts (simplified - would send actual notifications in production)
  if (contacts) {
    contacts.forEach((contact: any) => {
      // Would send notification to contact
    });
  }

  if (team) {
    team.forEach((member: any) => {
      // Would send notification to team member
    });
  }
}

// Get emergency responses
router.get('/emergency/responses/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  const cacheKey = `emergency-responses:${req.params.propertyId}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('emergency_responses')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('triggered_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    responses: data || [],
    summary: {
      total: (data || []).length,
      active: (data || []).filter(r => r.status === 'active').length,
      resolved: (data || []).filter(r => r.status === 'resolved').length,
    },
  };

  cacheService.set(cacheKey, result, 2 * 60 * 1000);
  return res.json(result);
});

// Resolve emergency
router.put('/emergency/resolve/:id', authenticate, requirePermission('ops:safety:emergency'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { resolution, resolvedBy } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('emergency_responses')
    .update({
      status: 'resolved',
      resolution,
      resolved_by: resolvedBy || req.user?.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.json(data);
});

// ── Real-Time Guest Request Tracking ─────────────────────────────────────
// Create guest request
router.post('/guest-requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reservationId,
    roomId,
    requestType,
    description,
    priority,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !requestType || !description) {
    return res.status(400).json({ error: 'propertyId, requestType, and description are required' });
  }

  const { data, error } = await supabaseAdmin.from('guest_requests').insert({
    property_id: propertyId,
    reservation_id: reservationId,
    room_id: roomId,
    request_type: requestType,
    description,
    priority: priority || 'medium',
    requested_by: requestedBy,
    status: 'pending',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

// Get guest requests
router.get('/guest-requests/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, priority, roomId } = req.query as Record<string, string>;
  
  const cacheKey = `guest-requests:${req.params.propertyId}:${status || 'all'}:${priority || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('guest_requests')
    .select('*, rooms(number)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  if (roomId) q = q.eq('room_id', roomId);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    requests: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(r => r.status === 'pending').length,
      inProgress: (data || []).filter(r => r.status === 'in_progress').length,
      completed: (data || []).filter(r => r.status === 'completed').length,
      highPriority: (data || []).filter(r => r.priority === 'high').length,
    },
  };

  cacheService.set(cacheKey, result, 2 * 60 * 1000);
  return res.json(result);
});

// Update guest request status
router.put('/guest-requests/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, assignedTo, completedBy, notes } = req.body || {};
  
  if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (assignedTo) updateData.assigned_to = assignedTo;
  if (completedBy) updateData.completed_by = completedBy;
  if (notes) updateData.notes = notes;
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('guest_requests')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.json(data);
});

// ── Service Recovery Workflow Automation ─────────────────────────────────
// Initiate service recovery
router.post('/service-recovery', authenticate, requirePermission('ops:safety:recovery'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    incidentId,
    guestId,
    recoveryType,
    actions,
    assignedTo,
    compensationOffered,
  } = req.body || {};
  
  if (!propertyId || !incidentId || !guestId) {
    return res.status(400).json({ error: 'propertyId, incidentId, and guestId are required' });
  }

  const { data, error } = await supabaseAdmin.from('service_recovery').insert({
    property_id: propertyId,
    incident_id: incidentId,
    guest_id: guestId,
    recovery_type: recoveryType || 'standard',
    actions: actions || [],
    assigned_to: assignedTo,
    compensation_offered: compensationOffered,
    status: 'in_progress',
    initiated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-safety:*');

  return res.status(201).json(data);
});

// Get service recovery records
router.get('/service-recovery/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, guestId } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin
    .from('service_recovery')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('initiated_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (guestId) q = q.eq('guest_id', guestId);
  
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    recoveryRecords: data || [],
    summary: {
      total: (data || []).length,
      inProgress: (data || []).filter(r => r.status === 'in_progress').length,
      completed: (data || []).filter(r => r.status === 'completed').length,
    },
  });
});

// ── Guest Journey Mapping ────────────────────────────────────────────────
// Record guest journey touchpoint
router.post('/guest-journey/touchpoints', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    guestId,
    reservationId,
    touchpoint,
    stage,
    satisfaction,
    notes,
  } = req.body || {};
  
  if (!propertyId || !guestId || !touchpoint || !stage) {
    return res.status(400).json({ error: 'propertyId, guestId, touchpoint, and stage are required' });
  }

  const { data, error } = await supabaseAdmin.from('guest_journey').insert({
    property_id: propertyId,
    guest_id: guestId,
    reservation_id: reservationId,
    touchpoint,
    stage,
    satisfaction,
    notes,
    timestamp: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get guest journey
router.get('/guest-journey/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('guest_journey')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('timestamp', { ascending: true });
  
  if (propertyId) q = q.eq('property_id', propertyId);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const journeyMap = groupByStage(data || []);

  return res.json({
    guestId: req.params.guestId,
    journey: data || [],
    journeyMap,
    summary: {
      totalTouchpoints: (data || []).length,
      avgSatisfaction: (data || []).reduce((sum, j) => sum + (j.satisfaction || 0), 0) / ((data || []).length || 1),
    },
  });
});

function groupByStage(touchpoints: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  touchpoints.forEach(t => {
    if (!grouped[t.stage]) grouped[t.stage] = [];
    grouped[t.stage].push(t);
  });
  return grouped;
}

export default router;
