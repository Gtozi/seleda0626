import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = express.Router();

// ============================================================================
// DAILY BRIEFING
// ============================================================================

// Get or refresh daily briefing for a specific date
router.get('/briefing', authenticate, async (req, res) => {
  const date = req.query.date as string || new Date().toISOString().split('T')[0];
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Try to get existing briefing
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('daily_briefing')
      .select('*')
      .eq('briefing_date', date)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ error: fetchError.message });
    }
    
    // If briefing exists and is recent (within 1 hour), return it
    if (existing) {
      const generatedAt = new Date(existing.generated_at);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (generatedAt > oneHourAgo) {
        return res.json(existing);
      }
    }
    
    // Refresh the briefing
    const { data: refreshResult, error: refreshError } = await supabaseAdmin
      .rpc('refresh_daily_briefing', {
        p_briefing_date: date,
        p_property_id: null
      });
    
    if (refreshError) {
      return res.status(500).json({ error: refreshError.message });
    }
    
    // Fetch the refreshed briefing
    const { data: refreshed, error: finalError } = await supabaseAdmin
      .from('daily_briefing')
      .select('*')
      .eq('briefing_date', date)
      .single();
    
    if (finalError) return res.status(500).json({ error: finalError.message });
    return res.json(refreshed);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// ACTION QUEUE
// ============================================================================

// Get all action items with filters
router.get('/action-items', authenticate, async (req, res) => {
  const { status, priority, sourceModule, assignedTo } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('action_item')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (sourceModule) query = query.eq('source_module', sourceModule);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create a new action item
router.post('/action-items', authenticate, async (req, res) => {
  const { 
    sourceModule, sourceRecordId, itemType, title, description, 
    priority, assignedTo, dueBy, requiresApprovalAmount 
  } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('create_action_item', {
        p_source_module: sourceModule,
        p_source_record_id: sourceRecordId,
        p_item_type: itemType,
        p_title: title,
        p_description: description,
        p_priority: priority || 'Normal',
        p_assigned_to: assignedTo || null,
        p_due_by: dueBy || null,
        p_requires_approval_amount: requiresApprovalAmount || null
      });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, itemId: data });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Resolve an action item
router.put('/action-items/:itemId/resolve', authenticate, async (req, res) => {
  const { itemId } = req.params;
  const { resolutionNote } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('resolve_action_item', {
        p_item_id: itemId,
        p_resolution_note: resolutionNote,
        p_actor: req.user!.id
      });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, resolved: data });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Update action item (assign, change priority, etc.)
router.put('/action-items/:itemId', authenticate, async (req, res) => {
  const { itemId } = req.params;
  const updates = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('action_item')
      .update({
        assigned_to: updates.assignedTo,
        priority: updates.priority,
        status: updates.status,
        due_by: updates.dueBy
      })
      .eq('item_id', itemId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// ESCALATIONS
// ============================================================================

// Get all escalations with filters
router.get('/escalations', authenticate, async (req, res) => {
  const { status, severity, department } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('escalation')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (department) query = query.eq('department', department);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Get escalation with timeline
router.get('/escalations/:escalationId', authenticate, async (req, res) => {
  const { escalationId } = req.params;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const [{ data: escalation, error: escError }, { data: events, error: eventError }] = await Promise.all([
      supabaseAdmin.from('escalation').select('*').eq('escalation_id', escalationId).single(),
      supabaseAdmin
        .from('escalation_event')
        .select('*')
        .eq('escalation_id', escalationId)
        .order('created_at', { ascending: true })
    ]);
    
    if (escError) return res.status(500).json({ error: escError.message });
    if (eventError) return res.status(500).json({ error: eventError.message });
    
    return res.json({ escalation, events: events || [] });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create new escalation
router.post('/escalations', authenticate, async (req, res) => {
  const {
    department, linkedGuestId, linkedRoomId, category, severity, description, assignedTo
  } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('escalation')
      .insert({
        raised_by: req.user!.id,
        department,
        linked_guest_id: linkedGuestId || null,
        linked_room_id: linkedRoomId || null,
        category,
        severity: severity || 'Moderate',
        description,
        assigned_to: assignedTo || null,
        status: 'Open'
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Add event to escalation timeline
router.post('/escalations/:escalationId/events', authenticate, async (req, res) => {
  const { escalationId } = req.params;
  const { note, statusChange } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('add_escalation_event', {
        p_escalation_id: escalationId,
        p_actor: req.user!.id,
        p_note: note,
        p_status_change: statusChange || null
      });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, eventId: data });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Update escalation (assign, change severity)
router.put('/escalations/:escalationId', authenticate, async (req, res) => {
  const { escalationId } = req.params;
  const { assignedTo, severity, status } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updates: any = {};
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (severity !== undefined) updates.severity = severity;
    if (status !== undefined) updates.status = status;
    
    const { data, error } = await supabaseAdmin
      .from('escalation')
      .update(updates)
      .eq('escalation_id', escalationId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// STAFFING STATUS
// ============================================================================

// Get staffing status with filters
router.get('/staffing', authenticate, async (req, res) => {
  const { date, department, shift } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('staffing_status')
      .select('*')
      .order('status_date', { ascending: false });
    
    if (date) query = query.eq('status_date', date);
    if (department) query = query.eq('department', department);
    if (shift) query = query.eq('shift', shift);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Update staffing status (add coverage plan)
router.put('/staffing/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { coveragePlan, presentCount } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updates: any = { updated_at: new Date().toISOString() };
    if (coveragePlan !== undefined) updates.coverage_plan = coveragePlan;
    if (presentCount !== undefined) updates.present_count = presentCount;
    
    const { data, error } = await supabaseAdmin
      .from('staffing_status')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create staffing status entry
router.post('/staffing', authenticate, async (req, res) => {
  const { department, statusDate, shift, scheduledCount, presentCount, coveragePlan } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('staffing_status')
      .insert({
        department,
        status_date: statusDate,
        shift,
        scheduled_count: scheduledCount || 0,
        present_count: presentCount || 0,
        coverage_plan: coveragePlan || null
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// INTERDEPARTMENTAL HANDOFFS
// ============================================================================

// Get handoffs with filters
router.get('/handoffs', authenticate, async (req, res) => {
  const { status, fromDepartment, toDepartment } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('interdepartmental_handoff')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (fromDepartment) query = query.eq('from_department', fromDepartment);
    if (toDepartment) query = query.eq('to_department', toDepartment);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create handoff
router.post('/handoffs', authenticate, async (req, res) => {
  const { fromDepartment, toDepartment, sourceRecordType, sourceRecordId } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('interdepartmental_handoff')
      .insert({
        from_department: fromDepartment,
        to_department: toDepartment,
        source_record_type: sourceRecordType,
        source_record_id: sourceRecordId,
        status: 'Sent'
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Update handoff status
router.put('/handoffs/:handoffId', authenticate, async (req, res) => {
  const { handoffId } = req.params;
  const { status } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updates: any = { status };
    if (status === 'Completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabaseAdmin
      .from('interdepartmental_handoff')
      .update(updates)
      .eq('handoff_id', handoffId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// SHIFT HANDOVER
// ============================================================================

// Get handover notes
router.get('/handover', authenticate, async (req, res) => {
  const { date, shiftPeriod } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('shift_handover_note')
      .select('*')
      .order('shift_date', { ascending: false });
    
    if (date) query = query.eq('shift_date', date);
    if (shiftPeriod) query = query.eq('shift_period', shiftPeriod);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create handover note
router.post('/handover', authenticate, async (req, res) => {
  const { shiftDate, shiftPeriod, summary, openItemRefs } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('shift_handover_note')
      .insert({
        outgoing_manager: req.user!.id,
        shift_date: shiftDate,
        shift_period: shiftPeriod,
        summary,
        open_item_refs: openItemRefs || []
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Acknowledge handover note
router.put('/handover/:noteId/acknowledge', authenticate, async (req, res) => {
  const { noteId } = req.params;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('acknowledge_handover', {
        p_note_id: noteId,
        p_incoming_manager: req.user!.id
      });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, acknowledged: data });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// MANAGER NOTES
// ============================================================================

// Get manager notes with filters
router.get('/notes', authenticate, async (req, res) => {
  const { linkedType, linkedId } = req.query;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('manager_note')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (linkedType) query = query.eq('linked_type', linkedType);
    if (linkedId) query = query.eq('linked_id', linkedId);
    
    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Create manager note
router.post('/notes', authenticate, async (req, res) => {
  const { linkedType, linkedId, text, visibleToRoles } = req.body;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('manager_note')
      .insert({
        linked_type: linkedType,
        linked_id: linkedId || null,
        author: req.user!.id,
        text,
        visible_to_roles: visibleToRoles || []
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// Delete manager note
router.delete('/notes/:noteId', authenticate, async (req, res) => {
  const { noteId } = req.params;
  
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('manager_note')
      .delete()
      .eq('note_id', noteId);
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  
  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// DEPARTMENT OVERVIEW
// ============================================================================

router.get('/overview', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Gather live data from multiple sources in parallel
      const [actionItemsResult, staffingResult, escalationsResult, roomsResult, reservationsResult] = await Promise.all([
        supabaseAdmin.from('action_item').select('source_module, status').neq('status', 'Resolved').neq('status', 'Dismissed'),
        supabaseAdmin.from('staffing_status').select('*').order('updated_at', { ascending: false }),
        supabaseAdmin.from('escalation').select('department, severity, status').eq('status', 'Open'),
        supabaseAdmin.from('rooms').select('status, housekeeping_status'),
        supabaseAdmin.from('reservations').select('status, check_in, check_out').gte('check_in', today).lte('check_in', today),
      ]);

      const actionItems = actionItemsResult.data || [];
      const staffing = staffingResult.data || [];
      const escalations = escalationsResult.data || [];
      const rooms = roomsResult.data || [];
      const todayReservations = reservationsResult.data || [];

      // Compute per-department overview cards
      const departments = [
        { key: 'FrontOffice', label: 'Front Office' },
        { key: 'Housekeeping', label: 'Housekeeping' },
        { key: 'FandB', label: 'F&B' },
        { key: 'Maintenance', label: 'Maintenance' },
        { key: 'HR', label: 'HR & Payroll' },
        { key: 'Procurement', label: 'Procurement & Stores' },
        { key: 'SalesEvents', label: 'Sales & Events' },
        { key: 'GuestPortal', label: 'Guest Portal' },
      ];

      const overview = departments.map((dept) => {
        const deptActionItems = actionItems.filter((i: any) => i.source_module === dept.key);
        const deptEscalations = escalations.filter((e: any) => e.department === dept.key);
        const deptStaffing = staffing.find((s: any) => s.department === dept.key);
        const hasCriticalEscalation = deptEscalations.some((e: any) => e.severity === 'Critical');
        const hasStaffingGap = deptStaffing && deptStaffing.gap_count > 0;

        // Compute health indicator
        let healthIndicator = 'Good';
        if (hasCriticalEscalation) {
          healthIndicator = 'Critical';
        } else if (hasStaffingGap || deptActionItems.length > 3) {
          healthIndicator = 'Attention';
        }

        // Compute headline metrics per department
        let headlineMetric: any = 0;
        let headlineMetricLabel = '';
        let statusSummary = '';

        switch (dept.key) {
          case 'FrontOffice': {
            const occupied = rooms.filter((r: any) => r.status === 'Occupied').length;
            const total = rooms.length || 1;
            const occRate = Math.round((occupied / total) * 100);
            headlineMetric = `${occRate}%`;
            headlineMetricLabel = 'Occupancy Rate';
            const arrivals = todayReservations.filter((r: any) => r.status === 'Confirmed' || r.status === 'CheckedIn').length;
            statusSummary = `${arrivals} arrivals/departures today, ${deptActionItems.length} open items`;
            break;
          }
          case 'Housekeeping': {
            const clean = rooms.filter((r: any) => r.housekeeping_status === 'Clean').length;
            const dirty = rooms.filter((r: any) => r.housekeeping_status === 'Dirty').length;
            const ooo = rooms.filter((r: any) => r.status === 'OutOfOrder').length;
            headlineMetric = `${clean}/${clean + dirty}`;
            headlineMetricLabel = 'Rooms Clean/Total';
            statusSummary = `${ooo} rooms OOO, ${deptActionItems.length} open items`;
            break;
          }
          case 'FandB': {
            headlineMetric = deptActionItems.length;
            headlineMetricLabel = 'Open Actions';
            statusSummary = `${deptActionItems.length} open items, ${deptEscalations.length} escalations`;
            break;
          }
          case 'Maintenance': {
            const oos = rooms.filter((r: any) => r.status === 'OutOfService').length;
            headlineMetric = deptActionItems.length;
            headlineMetricLabel = 'Open Work Orders';
            statusSummary = `${oos} rooms OOS, ${deptActionItems.length} open work orders`;
            break;
          }
          case 'HR': {
            const totalGaps = staffing.reduce((sum: number, s: any) => sum + (s.gap_count || 0), 0);
            headlineMetric = totalGaps;
            headlineMetricLabel = 'Staffing Gaps';
            statusSummary = `${totalGaps} gaps across property, ${deptActionItems.length} open items`;
            break;
          }
          case 'Procurement': {
            headlineMetric = deptActionItems.length;
            headlineMetricLabel = 'Pending Receipts';
            statusSummary = `${deptActionItems.length} pending items`;
            break;
          }
          case 'SalesEvents': {
            headlineMetric = deptActionItems.length;
            headlineMetricLabel = 'Pipeline Items';
            statusSummary = `${deptActionItems.length} items needing follow-up`;
            break;
          }
          case 'GuestPortal': {
            headlineMetric = deptActionItems.length;
            headlineMetricLabel = 'Open Requests';
            statusSummary = `${deptActionItems.length} open in-stay requests`;
            break;
          }
        }

        const staffingStatus = !deptStaffing ? 'FullyStaffed' : deptStaffing.gap_count > 0 ? 'Gap' : deptStaffing.scheduled_count < deptStaffing.present_count ? 'Overstaffed' : 'FullyStaffed';

        return {
          department: dept.key,
          statusSummary,
          headlineMetric,
          headlineMetricLabel,
          openActionItemCount: deptActionItems.length,
          staffingStatus,
          lastUpdated: new Date().toISOString(),
          healthIndicator,
        };
      });

      return res.json(overview);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback with mock data
  return res.json([
    { department: 'FrontOffice', statusSummary: 'Operations running smoothly', headlineMetric: '72%', headlineMetricLabel: 'Occupancy Rate', openActionItemCount: 2, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Good' },
    { department: 'Housekeeping', statusSummary: '3 rooms OOO, housekeeping on track', headlineMetric: '18/22', headlineMetricLabel: 'Rooms Clean/Total', openActionItemCount: 1, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Good' },
    { department: 'FandB', statusSummary: 'Cover count on target', headlineMetric: '142', headlineMetricLabel: 'Covers Today', openActionItemCount: 0, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Good' },
    { department: 'Maintenance', statusSummary: '2 work orders aging', headlineMetric: '5', headlineMetricLabel: 'Open Work Orders', openActionItemCount: 5, staffingStatus: 'Gap', lastUpdated: new Date().toISOString(), healthIndicator: 'Attention' },
    { department: 'HR', statusSummary: '1 staffing gap in maintenance', headlineMetric: '1', headlineMetricLabel: 'Staffing Gaps', openActionItemCount: 0, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Attention' },
    { department: 'Procurement', statusSummary: '3 pending goods receipts', headlineMetric: '3', headlineMetricLabel: 'Pending Receipts', openActionItemCount: 3, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Good' },
    { department: 'SalesEvents', statusSummary: '2 events today, 1 follow-up needed', headlineMetric: '2', headlineMetricLabel: 'Events Today', openActionItemCount: 1, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Good' },
    { department: 'GuestPortal', statusSummary: '4 open in-stay requests', headlineMetric: '4', headlineMetricLabel: 'Open Requests', openActionItemCount: 4, staffingStatus: 'FullyStaffed', lastUpdated: new Date().toISOString(), healthIndicator: 'Attention' },
  ]);
});

// ============================================================================
// REPORTS
// ============================================================================

// Get report definitions
router.get('/reports/definitions', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_report_definition')
      .select('*')
      .order('category', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  // Fallback with seed report definitions
  return res.json([
    { report_id: 'rpt-001', name: 'Daily Operations Summary', category: 'DailyOperations', description: 'Occupancy, arrivals/departures, F&B covers, open escalations, staffing gaps — one page, end-of-day', default_date_range: 'Today', fields: ['Occupancy', 'Arrivals', 'Departures', 'F&B Covers', 'Open Escalations', 'Staffing Gaps'], output_formats: ['PDF', 'Excel'] },
    { report_id: 'rpt-002', name: 'Shift Handover Report', category: 'DailyOperations', description: 'Formatted export of shift handover notes and any carried-forward action items', default_date_range: 'Today', fields: ['Shift Period', 'Outgoing Manager', 'Summary', 'Carried Forward Items'], output_formats: ['PDF'] },
    { report_id: 'rpt-003', name: 'Housekeeping Daily Report', category: 'Housekeeping', description: 'Rooms cleaned, inspection results, OOO log', default_date_range: 'Today', fields: ['Rooms Cleaned', 'Inspection Results', 'OOO Log'], output_formats: ['PDF', 'Excel', 'CSV'] },
    { report_id: 'rpt-004', name: 'Maintenance Work Order Log', category: 'Maintenance', description: 'All work orders in a date range with status and resolution time', default_date_range: 'WTD', fields: ['Work Order ID', 'Status', 'Resolution Time', 'Room'], output_formats: ['PDF', 'Excel', 'CSV'] },
    { report_id: 'rpt-005', name: 'F&B Daily Cost & Comp Report', category: 'FandB', description: 'Cover count, comp/void log with reasons, food cost %', default_date_range: 'Today', fields: ['Cover Count', 'Comp/Void Log', 'Food Cost %'], output_formats: ['PDF', 'Excel'] },
    { report_id: 'rpt-006', name: 'Front Office Arrivals/Departures', category: 'FrontOffice', description: 'Full guest list with room, rate, notes for the day', default_date_range: 'Today', fields: ['Guest Name', 'Room', 'Rate', 'Notes'], output_formats: ['PDF', 'Excel', 'CSV'] },
    { report_id: 'rpt-007', name: 'Staffing & Attendance Summary', category: 'HR', description: 'Scheduled vs. present by department, overtime flagged', default_date_range: 'MTD', fields: ['Department', 'Scheduled', 'Present', 'Overtime'], output_formats: ['PDF', 'Excel'] },
    { report_id: 'rpt-008', name: 'Goods Receipt & Discrepancy Log', category: 'Procurement', description: 'Receipts in range, any discrepancy noted', default_date_range: 'WTD', fields: ['Receipt ID', 'PO Number', 'Discrepancy', 'Notes'], output_formats: ['PDF', 'Excel', 'CSV'] },
    { report_id: 'rpt-009', name: 'Escalation Log', category: 'CrossDepartment', description: 'All escalations in range with severity, resolution time, department', default_date_range: 'MTD', fields: ['Escalation ID', 'Department', 'Severity', 'Resolution Time', 'Status'], output_formats: ['PDF', 'Excel'] },
    { report_id: 'rpt-010', name: 'Weekly Cross-Department Summary', category: 'CrossDepartment', description: 'Rolled-up version of the Daily Operations Summary across 7 days', default_date_range: 'WTD', fields: ['Daily Occupancy', 'Daily Arrivals', 'Daily Departures', 'F&B Covers', 'Escalations', 'Staffing Gaps'], output_formats: ['PDF', 'Excel'] },
  ]);
});

// Get generated reports
router.get('/reports/generated', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_generated_report')
      .select(`
        *,
        operations_report_definition!inner(name)
      `)
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    const formatted = (data || []).map((r: any) => ({
      generated_report_id: r.generated_report_id,
      report_id: r.report_id,
      report_name: r.operations_report_definition?.name || 'Unknown',
      generated_by: r.generated_by,
      date_range_used: r.date_range_used,
      generated_at: r.generated_at,
      format: r.format,
      file_ref: r.file_ref,
      status: r.status,
    }));
    return res.json(formatted);
  }

  return res.json([]);
});

// Generate a report
router.post('/reports/generate', authenticate, async (req, res) => {
  const { reportId, dateRange, format } = req.body;

  if (!reportId) return res.status(400).json({ error: 'reportId is required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Insert a generated report record
    const { data, error } = await supabaseAdmin
      .from('operations_generated_report')
      .insert({
        report_id: reportId,
        generated_by: req.user!.id,
        date_range_used: dateRange || 'Today',
        format: format || 'PDF',
        file_ref: null,
        status: 'Ready',
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Also insert into archive
    const retentionDays = 90;
    const retainedUntil = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await supabaseAdmin
      .from('operations_report_archive')
      .insert({
        generated_report_id: data.generated_report_id,
        retained_until: retainedUntil,
      });

    return res.json(data);
  }

  // Fallback
  return res.json({
    generated_report_id: `gen-${Date.now()}`,
    report_id: reportId,
    generated_by: req.user?.id || 'unknown',
    date_range_used: dateRange || 'Today',
    generated_at: new Date().toISOString(),
    format: format || 'PDF',
    file_ref: null,
    status: 'Ready',
  });
});

// Get report schedules
router.get('/reports/schedules', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_report_schedule')
      .select(`
        *,
        operations_report_definition!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const formatted = (data || []).map((s: any) => ({
      schedule_id: s.schedule_id,
      report_id: s.report_id,
      report_name: s.operations_report_definition?.name || 'Unknown',
      recipient_list: s.recipient_list || [],
      frequency: s.frequency,
      format: s.format,
      is_active: s.is_active,
      last_sent_at: s.last_sent_at,
    }));
    return res.json(formatted);
  }

  return res.json([]);
});

// Create report schedule
router.post('/reports/schedules', authenticate, async (req, res) => {
  const { reportId, recipientList, frequency, format } = req.body;

  if (!reportId) return res.status(400).json({ error: 'reportId is required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_report_schedule')
      .insert({
        report_id: reportId,
        recipient_list: recipientList || [],
        frequency: frequency || 'Daily',
        format: format || 'PDF',
        is_active: true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Toggle schedule active state
router.patch('/reports/schedules/:scheduleId', authenticate, async (req, res) => {
  const { scheduleId } = req.params;
  const { isActive } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_report_schedule')
      .update({ is_active: isActive })
      .eq('schedule_id', scheduleId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

// Get financial report definitions
router.get('/financial-reports/definitions', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_financial_report_definition')
      .select('*')
      .order('type', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  // Fallback with seed definitions
  return res.json([
    { report_id: 'fin-001', name: 'Monthly P&L Summary', type: 'Monthly', department_scope: 'AllDepartments', includes_budget_comparison: true, includes_prior_period_comparison: false, output_formats: ['PDF', 'Excel'] },
    { report_id: 'fin-002', name: 'Quarterly Financial Rollup', type: 'Quarterly', department_scope: 'AllDepartments', includes_budget_comparison: true, includes_prior_period_comparison: true, output_formats: ['PDF', 'Excel'] },
    { report_id: 'fin-003', name: 'Year-over-Year Comparison', type: 'YearOverYear', department_scope: 'AllDepartments', includes_budget_comparison: false, includes_prior_period_comparison: true, output_formats: ['PDF', 'Excel'] },
    { report_id: 'fin-004', name: 'Rooms Department Monthly', type: 'Monthly', department_scope: 'RoomsOnly', includes_budget_comparison: true, includes_prior_period_comparison: false, output_formats: ['PDF', 'Excel'] },
    { report_id: 'fin-005', name: 'F&B Department Monthly', type: 'Monthly', department_scope: 'FandBOnly', includes_budget_comparison: true, includes_prior_period_comparison: false, output_formats: ['PDF', 'Excel'] },
  ]);
});

// Get monthly financial report
router.get('/financial-reports/monthly', authenticate, async (req, res) => {
  const month = req.query.month as string;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Check period close status — only show data if at least SoftClose
    const { data: periodData, error: periodError } = await supabaseAdmin
      .from('period_close')
      .select('status')
      .eq('period_month', month)
      .single();

    if (periodError || !periodData) {
      return res.status(404).json({ error: 'Period not found or not yet closed. Figures require at least a soft close in Finance.' });
    }

    if (periodData.status && !['SoftClose', 'HardClose'].includes(periodData.status)) {
      return res.status(403).json({ error: 'Period is still open. Figures unavailable until at least soft close.' });
    }

    const { data, error } = await supabaseAdmin
      .from('operations_monthly_financial_report')
      .select('*')
      .eq('month', month + '-01')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // Fallback with mock data
  const monthNum = parseInt(month.split('-')[1]) || 1;
  const baseRevenue = 180000 + monthNum * 12000;
  return res.json({
    report_instance_id: `mfr-${month}`,
    month: month + '-01',
    revenue_by_department: { Rooms: Math.round(baseRevenue * 0.65), 'F&B': Math.round(baseRevenue * 0.22), 'Other': Math.round(baseRevenue * 0.13) },
    expense_by_department: { Rooms: Math.round(baseRevenue * 0.22), 'F&B': Math.round(baseRevenue * 0.14), 'Other': Math.round(baseRevenue * 0.05) },
    undistributed_expenses: Math.round(baseRevenue * 0.08),
    fixed_charges: Math.round(baseRevenue * 0.05),
    gop: Math.round(baseRevenue * 0.36),
    net_operating_income: Math.round(baseRevenue * 0.31),
    budget_variance: {
      'Rooms Revenue': { actual: Math.round(baseRevenue * 0.65), budget: Math.round(baseRevenue * 0.62), variance_amount: Math.round(baseRevenue * 0.03), variance_percent: 4.8 },
      'F&B Revenue': { actual: Math.round(baseRevenue * 0.22), budget: Math.round(baseRevenue * 0.24), variance_amount: Math.round(-baseRevenue * 0.02), variance_percent: -8.3 },
      'Rooms Expense': { actual: Math.round(baseRevenue * 0.22), budget: Math.round(baseRevenue * 0.20), variance_amount: Math.round(baseRevenue * 0.02), variance_percent: 10.0 },
    },
    occupancy_for_month: 68 + (monthNum % 5) * 3,
    adr_for_month: 142 + monthNum * 2,
    revpar_for_month: 96 + monthNum * 1.5,
    goppar_for_month: 35 + monthNum * 0.8,
    generated_at: new Date().toISOString(),
    source_snapshot_date: new Date().toISOString().split('T')[0],
  });
});

// Get quarterly financial report
router.get('/financial-reports/quarterly', authenticate, async (req, res) => {
  const quarter = req.query.quarter as string;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_quarterly_financial_report')
      .select('*')
      .eq('quarter', quarter)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // Fallback: build from 3 mock months
  const [year, qNum] = quarter.split('-Q');
  const q = parseInt(qNum);
  const startMonth = (q - 1) * 3 + 1;
  const months = Array.from({ length: 3 }, (_, i) => `${year}-${String(startMonth + i).padStart(2, '0')}`);

  return res.json({
    report_instance_id: `qfr-${quarter}`,
    quarter,
    monthly_breakdown: months.map(m => ({
      report_instance_id: `mfr-${m}`,
      month: m + '-01',
      revenue_by_department: { Rooms: 130000, 'F&B': 44000, Other: 26000 },
      expense_by_department: { Rooms: 44000, 'F&B': 28000, Other: 10000 },
      undistributed_expenses: 16000,
      fixed_charges: 10000,
      gop: 72000,
      net_operating_income: 62000,
      budget_variance: {},
      occupancy_for_month: 72,
      adr_for_month: 148,
      revpar_for_month: 106,
      goppar_for_month: 38,
      generated_at: new Date().toISOString(),
      source_snapshot_date: new Date().toISOString().split('T')[0],
    })),
    quarter_total_revenue: 600000,
    quarter_total_expense: 282000,
    quarter_gop: 216000,
    quarter_net_operating_income: 186000,
    quarter_over_quarter_variance: {
      Revenue: { amount: 24000, percent: 4.2 },
      GOP: { amount: 12000, percent: 5.9 },
    },
    quarter_budget_variance: {},
    average_occupancy: 72,
    average_adr: 148,
    average_revpar: 106,
    generated_at: new Date().toISOString(),
  });
});

// Get year-over-year report
router.get('/financial-reports/yoy', authenticate, async (req, res) => {
  const periodType = req.query.periodType as string;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_yoy_report')
      .select('*')
      .eq('period_type', periodType)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // Fallback with mock data
  const now = new Date();
  const monthYearOpts = { month: 'long' as const, year: 'numeric' as const };
  const currentLabel = periodType === 'Month' ? now.toLocaleDateString('en-US', monthYearOpts) : periodType === 'Quarter' ? `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}` : `YTD through ${now.toLocaleDateString('en-US', monthYearOpts)}`;
  const priorYear = now.getFullYear() - 1;
  const priorLabel = periodType === 'Month' ? now.toLocaleDateString('en-US', monthYearOpts).replace(String(now.getFullYear()), String(priorYear)) : periodType === 'Quarter' ? `Q${Math.ceil((now.getMonth() + 1) / 3)} ${priorYear}` : `YTD through ${now.toLocaleDateString('en-US', monthYearOpts).replace(String(now.getFullYear()), String(priorYear))}`;

  return res.json({
    report_instance_id: `yoy-${periodType}-${now.getFullYear()}`,
    period_type: periodType,
    current_period_label: currentLabel,
    prior_period_label: priorLabel,
    current_period_financials: { 'Rooms Revenue': 125000, 'F&B Revenue': 42000, 'Total GOP': 78000, 'Net Operating Income': 65000 },
    prior_period_financials: { 'Rooms Revenue': 118000, 'F&B Revenue': 45000, 'Total GOP': 71000, 'Net Operating Income': 59000 },
    variance_amount: { 'Rooms Revenue': 7000, 'F&B Revenue': -3000, 'Total GOP': 7000, 'Net Operating Income': 6000 },
    variance_percent: { 'Rooms Revenue': 5.9, 'F&B Revenue': -6.7, 'Total GOP': 9.9, 'Net Operating Income': 10.2 },
    occupancy_current_vs_prior: { current: 74, prior: 69 },
    adr_current_vs_prior: { current: 152, prior: 141 },
    revpar_current_vs_prior: { current: 112, prior: 97 },
    commentary: null,
    generated_at: new Date().toISOString(),
  });
});

// Save YoY commentary
router.post('/financial-reports/yoy/commentary', authenticate, async (req, res) => {
  const { reportInstanceId, commentary } = req.body;

  if (!reportInstanceId) return res.status(400).json({ error: 'reportInstanceId is required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('operations_yoy_report')
      .update({ commentary })
      .eq('report_instance_id', reportInstanceId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// STAFF SCHEDULING OPTIMIZATION (Phase 2.1)
// ============================================================================

// Get optimized schedules with filters
router.get('/scheduling/optimized-schedules', authenticate, async (req, res) => {
  const { date, department } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_optimized_schedules')
      .select('*')
      .order('date', { ascending: false });

    if (date) query = query.eq('date', date);
    if (department) query = query.eq('department', department);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get optimized schedule with details (shifts and assignments)
router.get('/scheduling/optimized-schedules/:scheduleId', authenticate, async (req, res) => {
  const { scheduleId } = req.params;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const [{ data: schedule, error: scheduleError }, { data: metrics, error: metricsError }] = await Promise.all([
      supabaseAdmin.from('ops_optimized_schedules').select('*').eq('schedule_id', scheduleId).single(),
      supabaseAdmin.from('ops_optimization_metrics').select('*').eq('schedule_id', scheduleId).single()
    ]);

    if (scheduleError) return res.status(500).json({ error: scheduleError.message });
    if (metricsError && metricsError.code !== 'PGRST116') return res.status(500).json({ error: metricsError.message });

    return res.json({ schedule, metrics: metrics || null });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create optimized schedule
router.post('/scheduling/optimized-schedules', authenticate, async (req, res) => {
  const { date, department, totalLaborCost, budgetVariance, coverageScore } = req.body;

  if (!date || !department) return res.status(400).json({ error: 'date and department are required' });

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_optimized_schedules')
      .insert({
        date,
        department,
        total_labor_cost: totalLaborCost || 0,
        budget_variance: budgetVariance || 0,
        coverage_score: coverageScore || 0
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get staff skills
router.get('/scheduling/staff-skills', authenticate, async (req, res) => {
  const { staffId, skillCategory } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_staff_skills')
      .select('*')
      .order('proficiency_level', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (skillCategory) query = query.eq('skill_category', skillCategory);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Add staff skill
router.post('/scheduling/staff-skills', authenticate, async (req, res) => {
  const { staffId, skillName, skillCategory, proficiencyLevel, certified, certificationExpiry } = req.body;

  if (!staffId || !skillName || !skillCategory || !proficiencyLevel) {
    return res.status(400).json({ error: 'staffId, skillName, skillCategory, and proficiencyLevel are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_staff_skills')
      .insert({
        staff_id: staffId,
        skill_name: skillName,
        skill_category: skillCategory,
        proficiency_level: proficiencyLevel,
        certified: certified || false,
        certification_expiry: certificationExpiry || null,
        last_verified: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get staff preferences
router.get('/scheduling/staff-preferences', authenticate, async (req, res) => {
  const { staffId, preferenceType } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_staff_preferences')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (preferenceType) query = query.eq('preference_type', preferenceType);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Set staff preference
router.post('/scheduling/staff-preferences', authenticate, async (req, res) => {
  const { staffId, preferenceType, preferenceValue, priority } = req.body;

  if (!staffId || !preferenceType || !preferenceValue) {
    return res.status(400).json({ error: 'staffId, preferenceType, and preferenceValue are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_staff_preferences')
      .insert({
        staff_id: staffId,
        preference_type: preferenceType,
        preference_value: preferenceValue,
        priority: priority || 'normal',
        is_active: true
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get labor cost forecast
router.get('/scheduling/labor-forecast', authenticate, async (req, res) => {
  const { department, periodStart, periodEnd } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_labor_cost_forecast')
      .select('*')
      .order('period_start', { ascending: false });

    if (department) query = query.eq('department', department);
    if (periodStart) query = query.gte('period_start', periodStart);
    if (periodEnd) query = query.lte('period_end', periodEnd);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Generate labor cost forecast
router.post('/scheduling/labor-forecast/generate', authenticate, async (req, res) => {
  const { department, periodStart, periodEnd } = req.body;

  if (!department || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'department, periodStart, and periodEnd are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('generate_ops_labor_forecast', {
        p_department: department,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get overtime predictions
router.get('/scheduling/overtime-predictions', authenticate, async (req, res) => {
  const { staffId, periodStart, periodEnd } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_overtime_prediction')
      .select('*')
      .order('period_start', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (periodStart) query = query.gte('period_start', periodStart);
    if (periodEnd) query = query.lte('period_end', periodEnd);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Predict overtime risk for staff
router.post('/scheduling/overtime-predictions/predict', authenticate, async (req, res) => {
  const { staffId, periodStart, periodEnd } = req.body;

  if (!staffId || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'staffId, periodStart, and periodEnd are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('predict_overtime_risk', {
        p_staff_id: staffId,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get shift swap requests
router.get('/scheduling/shift-swaps', authenticate, async (req, res) => {
  const { status, requesterStaffId } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_shift_swap_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (requesterStaffId) query = query.eq('requester_staff_id', requesterStaffId);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create shift swap request
router.post('/scheduling/shift-swaps', authenticate, async (req, res) => {
  const { originalShiftId, proposedStaffId, proposedShiftId, reason } = req.body;

  if (!originalShiftId || !proposedStaffId) {
    return res.status(400).json({ error: 'originalShiftId and proposedStaffId are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_shift_swap_requests')
      .insert({
        requester_staff_id: req.user!.id,
        original_shift_id: originalShiftId,
        proposed_staff_id: proposedStaffId,
        proposed_shift_id: proposedShiftId || null,
        reason: reason || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Approve/reject shift swap
router.put('/scheduling/shift-swaps/:swapId', authenticate, async (req, res) => {
  const { swapId } = req.params;
  const { status, reviewNotes } = req.body;

  if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved, rejected, or cancelled' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updates: any = {
      status,
      reviewed_by: req.user!.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null
    };

    if (status === 'approved') {
      updates.approved_by = req.user!.id;
      updates.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('ops_shift_swap_requests')
      .update(updates)
      .eq('swap_id', swapId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get staff performance integration data
router.get('/scheduling/staff-performance', authenticate, async (req, res) => {
  const { staffId, periodStart, periodEnd } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_staff_performance_integration')
      .select('*')
      .order('period_start', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (periodStart) query = query.gte('period_start', periodStart);
    if (periodEnd) query = query.lte('period_end', periodEnd);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Calculate staff performance integration
router.post('/scheduling/staff-performance/calculate', authenticate, async (req, res) => {
  const { staffId, periodStart, periodEnd } = req.body;

  if (!staffId || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'staffId, periodStart, and periodEnd are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .rpc('calculate_staff_performance_integration', {
        p_staff_id: staffId,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get department labor budgets
router.get('/scheduling/labor-budgets', authenticate, async (req, res) => {
  const { department, fiscalYear, month } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_department_labor_budget')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .order('month', { ascending: false });

    if (department) query = query.eq('department', department);
    if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
    if (month) query = query.eq('month', month);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create or update department labor budget
router.post('/scheduling/labor-budgets', authenticate, async (req, res) => {
  const { department, fiscalYear, month, budgetAmount, staffCountBudget } = req.body;

  if (!department || !fiscalYear || !month || !budgetAmount) {
    return res.status(400).json({ error: 'department, fiscalYear, month, and budgetAmount are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_department_labor_budget')
      .insert({
        department,
        fiscal_year: fiscalYear,
        month,
        budget_amount: budgetAmount,
        actual_spent: 0,
        remaining_budget: budgetAmount,
        staff_count_budget: staffCountBudget || 0,
        staff_count_actual: 0
      })
      .select()
      .single();

    if (error) {
      // Try update if exists
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('ops_department_labor_budget')
        .update({
          budget_amount: budgetAmount,
          staff_count_budget: staffCountBudget || 0
        })
        .eq('department', department)
        .eq('fiscal_year', fiscalYear)
        .eq('month', month)
        .select()
        .single();

      if (updateError) return res.status(500).json({ error: updateError.message });
      return res.json(updateData);
    }

    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get scheduling constraints
router.get('/scheduling/constraints', authenticate, async (req, res) => {
  const { constraintType, department } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_scheduling_constraints')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (constraintType) query = query.eq('constraint_type', constraintType);
    if (department) query = query.eq('department', department);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create or update scheduling constraint
router.post('/scheduling/constraints', authenticate, async (req, res) => {
  const { constraintType, department, constraintValue, priority, description } = req.body;

  if (!constraintType || !constraintValue) {
    return res.status(400).json({ error: 'constraintType and constraintValue are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_scheduling_constraints')
      .insert({
        constraint_type: constraintType,
        department: department || null,
        constraint_value: constraintValue,
        priority: priority || 'normal',
        description: description || null,
        is_active: true
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// ============================================================================
// PREDICTIVE MAINTENANCE API ENDPOINTS (Phase 2.2)
// ============================================================================

// Get all IoT sensors
router.get('/maintenance/sensors', authenticate, async (req, res) => {
  const { department, locationType, status, sensorType } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin.from('ops_iot_sensors').select('*');

    if (department) query = query.eq('department', department);
    if (locationType) query = query.eq('location_type', locationType);
    if (status) query = query.eq('status', status);
    if (sensorType) query = query.eq('sensor_type', sensorType);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get sensor readings
router.get('/maintenance/sensor-readings/:sensorId', authenticate, async (req, res) => {
  const { sensorId } = req.params;
  const { limit = 100, anomaliesOnly = false } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_sensor_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('reading_timestamp', { ascending: false })
      .limit(Number(limit));

    if (anomaliesOnly === 'true') {
      query = query.eq('is_anomaly', true);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Add sensor reading
router.post('/maintenance/sensor-readings', authenticate, async (req, res) => {
  const { sensorId, readingValue, readingUnit, metadata } = req.body;

  if (!sensorId || readingValue === undefined) {
    return res.status(400).json({ error: 'sensorId and readingValue are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Detect anomaly
    const { data: anomalyData } = await supabaseAdmin.rpc('detect_sensor_anomaly', {
      p_sensor_id: sensorId,
      p_reading_value: readingValue,
      p_reading_unit: readingUnit || null
    });

    const { data, error } = await supabaseAdmin
      .from('ops_sensor_readings')
      .insert({
        sensor_id: sensorId,
        reading_value: readingValue,
        reading_unit: readingUnit || null,
        is_anomaly: anomalyData || false,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get all equipment assets
router.get('/maintenance/assets', authenticate, async (req, res) => {
  const { department, assetType, status, locationType } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin.from('ops_equipment_assets').select('*');

    if (department) query = query.eq('department', department);
    if (assetType) query = query.eq('asset_type', assetType);
    if (status) query = query.eq('status', status);
    if (locationType) query = query.eq('location_type', locationType);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create equipment asset
router.post('/maintenance/assets', authenticate, async (req, res) => {
  const {
    assetName,
    assetType,
    locationId,
    locationType,
    department,
    installationDate,
    manufacturer,
    modelNumber,
    serialNumber,
    purchaseCost,
    warrantyExpiry
  } = req.body;

  if (!assetName || !assetType || !locationId || !department || !installationDate) {
    return res.status(400).json({ error: 'assetName, assetType, locationId, department, and installationDate are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_equipment_assets')
      .insert({
        asset_name: assetName,
        asset_type: assetType,
        location_id: locationId,
        location_type: locationType || 'other',
        department,
        installation_date: installationDate,
        manufacturer: manufacturer || null,
        model_number: modelNumber || null,
        serial_number: serialNumber || null,
        purchase_cost: purchaseCost || null,
        warranty_expiry: warrantyExpiry || null
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get maintenance predictions
router.get('/maintenance/predictions', authenticate, async (req, res) => {
  const { assetId, riskLevel, status } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_maintenance_predictions')
      .select('*')
      .order('predicted_failure_date', { ascending: true });

    if (assetId) query = query.eq('asset_id', assetId);
    if (riskLevel) query = query.eq('risk_level', riskLevel);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Generate maintenance prediction for asset
router.post('/maintenance/predictions/generate/:assetId', authenticate, async (req, res) => {
  const { assetId } = req.params;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('generate_maintenance_prediction', {
      p_asset_id: assetId
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, message: 'Prediction generated successfully' });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Acknowledge maintenance prediction
router.patch('/maintenance/predictions/:predictionId/acknowledge', authenticate, async (req, res) => {
  const { predictionId } = req.params;
  const { acknowledgedBy, notes } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_maintenance_predictions')
      .update({
        status: 'acknowledged',
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('prediction_id', predictionId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get work orders
router.get('/maintenance/work-orders', authenticate, async (req, res) => {
  const { assetId, status, priority, department } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_maintenance_work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (department) query = query.eq('department', department);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create work order from prediction
router.post('/maintenance/work-orders/from-prediction/:predictionId', authenticate, async (req, res) => {
  const { predictionId } = req.params;
  const { createdBy } = req.body;

  if (!createdBy) {
    return res.status(400).json({ error: 'createdBy is required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('create_work_order_from_prediction', {
      p_prediction_id: predictionId,
      p_created_by: createdBy
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ workOrderId: data, message: 'Work order created successfully' });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Update work order status
router.patch('/maintenance/work-orders/:workOrderId/status', authenticate, async (req, res) => {
  const { workOrderId } = req.params;
  const { status, assignedTo, actualDurationHours, actualCost, completedAt } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { status };
    if (assignedTo) updateData.assigned_to = assignedTo;
    if (actualDurationHours) updateData.actual_duration_hours = actualDurationHours;
    if (actualCost) updateData.actual_cost = actualCost;
    if (status === 'completed') updateData.completed_at = completedAt || new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('ops_maintenance_work_orders')
      .update(updateData)
      .eq('work_order_id', workOrderId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get equipment health scores
router.get('/maintenance/equipment-health/:assetId', authenticate, async (req, res) => {
  const { assetId } = req.params;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_equipment_health')
      .select('*')
      .eq('asset_id', assetId)
      .order('calculated_at', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Calculate equipment health
router.post('/maintenance/equipment-health/calculate/:assetId', authenticate, async (req, res) => {
  const { assetId } = req.params;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('calculate_equipment_health', {
      p_asset_id: assetId
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, message: 'Health score calculated successfully' });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get maintenance alerts
router.get('/maintenance/alerts', authenticate, async (req, res) => {
  const { severity, acknowledged, sensorId } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_maintenance_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (severity) query = query.eq('severity', severity);
    if (acknowledged !== undefined) query = query.eq('acknowledged', acknowledged === 'true');
    if (sensorId) query = query.eq('sensor_id', sensorId);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Acknowledge maintenance alert
router.patch('/maintenance/alerts/:alertId/acknowledge', authenticate, async (req, res) => {
  const { alertId } = req.params;
  const { acknowledgedBy, resolutionNotes } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_maintenance_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null
      })
      .eq('alert_id', alertId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Get preventive maintenance schedule
router.get('/maintenance/preventive-schedule', authenticate, async (req, res) => {
  const { assetId, isActive } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin
      .from('ops_preventive_maintenance_schedule')
      .select('*')
      .order('next_due_date', { ascending: true });

    if (assetId) query = query.eq('asset_id', assetId);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

// Create preventive maintenance schedule
router.post('/maintenance/preventive-schedule', authenticate, async (req, res) => {
  const {
    assetId,
    taskName,
    taskDescription,
    frequency,
    frequencyDays,
    nextDueDate,
    estimatedDurationHours,
    priority
  } = req.body;

  if (!assetId || !taskName || !frequency || !nextDueDate) {
    return res.status(400).json({ error: 'assetId, taskName, frequency, and nextDueDate are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ops_preventive_maintenance_schedule')
      .insert({
        asset_id: assetId,
        task_name: taskName,
        task_description: taskDescription || null,
        frequency,
        frequency_days: frequencyDays || null,
        next_due_date: nextDueDate,
        estimated_duration_hours: estimatedDurationHours || null,
        priority: priority || 'normal'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
