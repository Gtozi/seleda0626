import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── AI-Powered Room Assignment Optimization ────────────────────────────
// Generate optimized room assignments for housekeeping
router.post('/housekeeping/room-assignments', authenticate, requirePermission('ops:housekeeping:assign'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    date,
    staffCount,
    priority,
  } = req.body || {};
  
  if (!propertyId || !date) {
    return res.status(400).json({ error: 'propertyId and date are required' });
  }

  // Get rooms requiring cleaning
  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['dirty', 'checkout_pending', 'in_progress']);

  // Get housekeeping staff
  const { data: staff } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('property_id', propertyId)
    .eq('position', 'housekeeping')
    .eq('is_active', true);

  // Get guest priority data
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .like('check_in_date', `${date}%`);

  // Generate optimized assignments
  const assignments = generateOptimizedAssignments(
    rooms || [],
    staff || [],
    reservations || [],
    staffCount || staff?.length || 5,
    priority || 'efficiency'
  );

  // Save assignments
  const assignmentResults = await Promise.all(
    assignments.map(async (assignment: any) => {
      const { data, error } = await supabaseAdmin.from('housekeeping_assignments').insert({
        property_id: propertyId,
        room_id: assignment.roomId,
        staff_id: assignment.staffId,
        assignment_date: date,
        priority: assignment.priority,
        estimated_time: assignment.estimatedTime,
        assignment_type: assignment.assignmentType,
        created_by: req.user?.id,
        created_at: new Date().toISOString(),
      }).select().single();

      return data;
    })
  );

  // Invalidate cache
  cacheService.invalidatePattern('ops-housekeeping:*');

  return res.status(201).json({
    success: true,
    assignments: assignmentResults,
    summary: {
      totalRooms: (rooms || []).length,
      assignedRooms: assignments.length,
      unassignedRooms: (rooms || []).length - assignments.length,
      staffUtilized: assignments.length,
    },
  });
});

function generateOptimizedAssignments(
  rooms: any[],
  staff: any[],
  reservations: any[],
  staffCount: number,
  priority: string
) {
  const assignments = [];
  const assignedStaff = new Set();
  const assignedRooms = new Set();

  // Score rooms based on priority
  const scoredRooms = rooms.map(room => {
    let score = 50;
    let priorityLevel = 'medium';

    // Check if room has incoming guest
    const incomingReservation = reservations.find(r => r.room_id === room.id);
    if (incomingReservation) {
      score += 30;
      priorityLevel = 'high';
    }

    // Room type priority
    if (room.room_type === 'suite') {
      score += 20;
    }

    // Time since checkout
    if (room.status === 'checkout_pending') {
      score += 25;
      priorityLevel = 'high';
    }

    return {
      ...room,
      assignmentScore: score,
      priorityLevel,
      estimatedTime: room.room_type === 'suite' ? 45 : 30,
    };
  });

  // Sort rooms by score
  scoredRooms.sort((a, b) => b.assignmentScore - a.assignmentScore);

  // Assign rooms to staff
  const roomsPerStaff = Math.ceil(scoredRooms.length / Math.min(staffCount, staff.length));
  let currentStaffIndex = 0;

  for (const room of scoredRooms) {
    if (assignedRooms.has(room.id)) continue;

    // Get available staff
    const availableStaff = staff.filter(s => !assignedStaff.has(s.id));
    if (availableStaff.length === 0) break;

    const selectedStaff = availableStaff[currentStaffIndex % availableStaff.length];
    
    assignments.push({
      roomId: room.id,
      roomNumber: room.room_number,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      priority: room.priorityLevel,
      estimatedTime: room.estimatedTime,
      assignmentType: room.status === 'checkout_pending' ? 'checkout_clean' : 'turnover',
    });

    assignedStaff.add(selectedStaff.id);
    assignedRooms.add(room.id);
    currentStaffIndex++;
  }

  return assignments;
}

// ── Mobile Housekeeping App Endpoints ───────────────────────────────────
// Get housekeeping assignments for staff member
router.get('/housekeeping/assignments/:staffId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date, status } = req.query as Record<string, string>;
  
  const cacheKey = `hk-assignments:${req.params.staffId}:${date || 'today'}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  let q = supabaseAdmin
    .from('housekeeping_assignments')
    .select('*, rooms(number, room_type), users(name)')
    .eq('staff_id', req.params.staffId)
    .eq('assignment_date', targetDate)
    .order('priority', { ascending: false });
  
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    staffId: req.params.staffId,
    date: targetDate,
    assignments: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(a => a.status === 'pending').length,
      inProgress: (data || []).filter(a => a.status === 'in_progress').length,
      completed: (data || []).filter(a => a.status === 'completed').length,
      estimatedTotalTime: (data || []).reduce((sum, a) => sum + (a.estimated_time || 0), 0),
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update assignment status
router.put('/housekeeping/assignments/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, actualTime, notes, photos } = req.body || {};
  
  if (!status || !['pending', 'in_progress', 'completed', 'skipped'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (actualTime) updateData.actual_time = actualTime;
  if (notes) updateData.notes = notes;
  if (photos) updateData.photos = photos;
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('housekeeping_assignments')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update room status if completed
  if (status === 'completed') {
    const assignment = data as any;
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'clean' })
      .eq('id', assignment.room_id);
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-housekeeping:*');

  return res.json(data);
});

// ── Linen Inventory Management with Automated Reordering ──────────────
// Get linen inventory
router.get('/housekeeping/linen/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `linen-inventory:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { data, error } = await supabaseAdmin
    .from('linen_inventory')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('item_name');

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    inventory: data || [],
    summary: {
      totalItems: (data || []).length,
      lowStock: (data || []).filter(i => i.quantity <= i.reorder_level).length,
      outOfStock: (data || []).filter(i => i.quantity === 0).length,
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Update linen inventory
router.put('/housekeeping/linen/:id', authenticate, requirePermission('ops:housekeeping:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { quantity, adjustmentType, notes } = req.body || {}; // adjustmentType: 'add', 'remove', 'set'
  
  if (quantity === undefined || !adjustmentType) {
    return res.status(400).json({ error: 'quantity and adjustmentType are required' });
  }

  // Get current inventory
  const { data: current } = await supabaseAdmin
    .from('linen_inventory')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!current) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }

  let newQuantity = current.quantity;
  if (adjustmentType === 'add') newQuantity += quantity;
  else if (adjustmentType === 'remove') newQuantity = Math.max(0, newQuantity - quantity);
  else if (adjustmentType === 'set') newQuantity = quantity;

  const { data, error } = await supabaseAdmin
    .from('linen_inventory')
    .update({
      quantity: newQuantity,
      last_adjusted: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Check if reorder needed
  if (newQuantity <= current.reorder_level) {
    await createLinenReorder(data);
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-housekeeping:*');

  return res.json(data);
});

async function createLinenReorder(item: any) {
  await supabaseAdmin.from('linen_reorders').insert({
    property_id: item.property_id,
    item_id: item.id,
    item_name: item.item_name,
    current_quantity: item.quantity,
    reorder_quantity: item.reorder_quantity || item.reorder_level * 2,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

// ── Quality Assurance with Photo Documentation ────────────────────────
// Create QA inspection
router.post('/housekeeping/qa', authenticate, requirePermission('ops:housekeeping:qa'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    roomId,
    inspectorId,
    score,
    findings,
    photos,
    notes,
  } = req.body || {};
  
  if (!propertyId || !roomId || !inspectorId || score === undefined) {
    return res.status(400).json({ error: 'propertyId, roomId, inspectorId, and score are required' });
  }

  const { data, error } = await supabaseAdmin.from('housekeeping_qa').insert({
    property_id: propertyId,
    room_id: roomId,
    inspector_id: inspectorId,
    score,
    findings: findings || [],
    photos: photos || [],
    notes,
    inspection_date: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-housekeeping:*');

  return res.status(201).json(data);
});

// Get QA inspections
router.get('/housekeeping/qa/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { roomId, days, minScore } = req.query as Record<string, string>;
  
  const daysAgo = parseInt(days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  let q = supabaseAdmin
    .from('housekeeping_qa')
    .select('*, rooms(number), users(name)')
    .eq('property_id', req.params.propertyId)
    .gte('inspection_date', startDate.toISOString())
    .order('inspection_date', { ascending: false });
  
  if (roomId) q = q.eq('room_id', roomId);
  if (minScore) q = q.gte('score', parseInt(minScore));
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    inspections: data || [],
    summary: {
      total: (data || []).length,
      avgScore: (data || []).reduce((sum, i) => sum + i.score, 0) / ((data || []).length || 1),
      belowThreshold: (data || []).filter(i => i.score < 80).length,
    },
  });
});

// ── Performance Analytics and Productivity Tracking ────────────────────
// Get housekeeping performance metrics
router.get('/housekeeping/performance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, staffId } = req.query as Record<string, string>;
  
  const cacheKey = `hk-performance:${req.params.propertyId}:${period || 'month'}:${staffId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'week' ? 7 : period === 'quarter' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get assignments
  let q = supabaseAdmin
    .from('housekeeping_assignments')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('assignment_date', startDate.toISOString());
  
  if (staffId) q = q.eq('staff_id', staffId);
  
  const { data: assignments } = await q;

  // Get QA inspections
  let qaQuery = supabaseAdmin
    .from('housekeeping_qa')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('inspection_date', startDate.toISOString());
  
  if (staffId) qaQuery = qaQuery.eq('inspector_id', staffId);
  
  const { data: qaInspections } = await qaQuery;

  const performance = {
    propertyId: req.params.propertyId,
    period: days,
    assignments: {
      total: (assignments || []).length,
      completed: (assignments || []).filter(a => a.status === 'completed').length,
      completionRate: (assignments || []).length > 0 
        ? ((assignments || []).filter(a => a.status === 'completed').length / (assignments || []).length) * 100 
        : 0,
      avgActualTime: calculateAvgTime(assignments || [], 'actual_time'),
      avgEstimatedTime: calculateAvgTime(assignments || [], 'estimated_time'),
      efficiency: calculateEfficiency(assignments || []),
    },
    quality: {
      totalInspections: (qaInspections || []).length,
      avgScore: (qaInspections || []).reduce((sum, i) => sum + i.score, 0) / ((qaInspections || []).length || 1),
      passingRate: (qaInspections || []).filter(i => i.score >= 80).length / ((qaInspections || []).length || 1) * 100,
    },
    productivity: {
      roomsPerStaffPerDay: (assignments || []).length / (days * 5), // Assuming 5 staff
      timePerRoom: calculateAvgTime(assignments || [], 'actual_time'),
    },
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, performance, 30 * 60 * 1000);
  return res.json(performance);
});

function calculateAvgTime(assignments: any[], timeField: string): number {
  const completed = assignments.filter(a => a[timeField] && a.status === 'completed');
  if (completed.length === 0) return 0;
  return completed.reduce((sum, a) => sum + a[timeField], 0) / completed.length;
}

function calculateEfficiency(assignments: any[]): number {
  const completed = assignments.filter(a => a.status === 'completed' && a.actual_time && a.estimated_time);
  if (completed.length === 0) return 0;
  
  const efficiencySum = completed.reduce((sum, a) => {
    return sum + (a.estimated_time / a.actual_time) * 100;
  }, 0);
  
  return Math.min(100, efficiencySum / completed.length);
}

export default router;
