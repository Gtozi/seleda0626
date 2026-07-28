import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Enhanced Task Management with Scheduling Optimization ─────
// Create or update housekeeping task
router.post('/tasks', authenticate, requirePermission('hk:tasks:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    roomId,
    taskType,
    priority,
    scheduledTime,
    assignedTo,
    estimatedDuration,
    notes,
  } = req.body || {};
  
  if (!propertyId || !roomId || !taskType) {
    return res.status(400).json({ error: 'propertyId, roomId, and taskType are required' });
  }

  const { data, error } = await supabaseAdmin.from('housekeeping_tasks').insert({
    property_id: propertyId,
    room_id: roomId,
    task_type: taskType,
    priority: priority || 'medium',
    scheduled_time: scheduledTime,
    assigned_to: assignedTo,
    estimated_duration: estimatedDuration || 30,
    notes,
    status: 'pending',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.status(201).json(data);
});

// Get tasks with filtering
router.get('/tasks/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, assignedTo, taskType, date } = req.query as Record<string, string>;
  
  const cacheKey = `hk-tasks:${req.params.propertyId}:${status || 'all'}:${assignedTo || 'all'}:${taskType || 'all'}:${date || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, rooms(room_number, floor), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('scheduled_time', { ascending: true });

  if (status) q = q.eq('status', status);
  if (assignedTo) q = q.eq('assigned_to', assignedTo);
  if (taskType) q = q.eq('task_type', taskType);
  if (date) q = q.like('scheduled_time', `${date}%`);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    tasks: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(t => t.status === 'pending').length,
      inProgress: (data || []).filter(t => t.status === 'in_progress').length,
      completed: (data || []).filter(t => t.status === 'completed').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update task status
router.put('/tasks/:id', authenticate, requirePermission('hk:tasks:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, completedAt, notes, actualDuration } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('housekeeping_tasks')
    .update({
      status,
      completed_at: completedAt || new Date().toISOString(),
      notes,
      actual_duration: actualDuration,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.json(data);
});

// ── AI-Powered Room Assignment Based on Location and Staff Skills ─────
// Get AI-powered room assignments
router.get('/assignments/ai/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date } = req.query as Record<string, string>;
  
  const cacheKey = `hk-assignments-ai:${req.params.propertyId}:${date || new Date().toISOString().split('T')[0]}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const targetDate = date || new Date().toISOString().split('T')[0];
  const assignments = await generateAIAssignments(req.params.propertyId, targetDate);

  const result = {
    propertyId: req.params.propertyId,
    date: targetDate,
    assignments,
    summary: {
      totalRooms: assignments.length,
      assignedStaff: [...new Set(assignments.map(a => a.assignedTo))].length,
      avgTasksPerStaff: assignments.length / ([...new Set(assignments.map(a => a.assignedTo))].length || 1),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

async function generateAIAssignments(propertyId: string, date: string) {
  // Get pending tasks for the date
  const { data: tasks } = await supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, rooms(room_number, floor, building)')
    .eq('property_id', propertyId)
    .like('scheduled_time', `${date}%`)
    .eq('status', 'pending');

  // Get available staff with their skills and location
  const { data: staff } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('property_id', propertyId)
    .eq('role', 'housekeeping')
    .eq('is_active', true);

  const assignments = [];

  // Simple AI assignment logic
  const staffByFloor = groupStaffByFloor(staff || []);
  const tasksByFloor = groupTasksByFloor(tasks || []);

  for (const [floor, floorTasks] of Object.entries(tasksByFloor)) {
    const floorStaff = staffByFloor[floor] || staffByFloor['default'] || [];
    const tasksPerStaff = Math.ceil(floorTasks.length / (floorStaff.length || 1));

    floorTasks.forEach((task, index) => {
      const assignedStaff = floorStaff[index % floorStaff.length];
      assignments.push({
        taskId: task.id,
        roomId: task.room_id,
        roomNumber: task.rooms?.room_number,
        floor: task.rooms?.floor,
        taskType: task.task_type,
        priority: task.priority,
        assignedTo: assignedStaff?.id,
        assignedStaffName: assignedStaff?.full_name,
        assignedStaffSkills: assignedStaff?.skills || [],
        reason: 'Location-based assignment',
        estimatedDuration: task.estimated_duration,
        scheduledTime: task.scheduled_time,
      });
    });
  }

  return assignments;
}

function groupStaffByFloor(staff: any[]) {
  const grouped: Record<string, any[]> = { default: staff };
  staff.forEach(s => {
    const floor = s.preferred_floor || 'default';
    if (!grouped[floor]) grouped[floor] = [];
    grouped[floor].push(s);
  });
  return grouped;
}

function groupTasksByFloor(tasks: any[]) {
  const grouped: Record<string, any[]> = {};
  tasks.forEach(t => {
    const floor = t.rooms?.floor || 'default';
    if (!grouped[floor]) grouped[floor] = [];
    grouped[floor].push(t);
  });
  return grouped;
}

// ── Route Planning for Attendants ───────────────────────────────────────
// Get optimized route for attendant
router.get('/routes/:propertyId/:attendantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date } = req.query as Record<string, string>;
  
  const cacheKey = `hk-routes:${req.params.propertyId}:${req.params.attendantId}:${date || new Date().toISOString().split('T')[0]}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const targetDate = date || new Date().toISOString().split('T')[0];
  const route = await generateOptimizedRoute(req.params.propertyId, req.params.attendantId, targetDate);

  const result = {
    propertyId: req.params.propertyId,
    attendantId: req.params.attendantId,
    date: targetDate,
    route,
    summary: {
      totalTasks: route.length,
      totalEstimatedTime: route.reduce((sum, r) => sum + r.estimatedDuration, 0),
      totalDistance: calculateTotalDistance(route),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function generateOptimizedRoute(propertyId: string, attendantId: string, date: string) {
  const { data: tasks } = await supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, rooms(room_number, floor, building, x_coordinate, y_coordinate)')
    .eq('property_id', propertyId)
    .eq('assigned_to', attendantId)
    .like('scheduled_time', `${date}%`)
    .eq('status', 'pending')
    .order('priority', { ascending: false });

  // Simple nearest-neighbor route optimization
  const route = [];
  const remaining = [...(tasks || [])];
  let current = null;

  while (remaining.length > 0) {
    let nearest = null;
    let minDist = Infinity;

    for (const task of remaining) {
      const dist = current ? calculateDistance(current, task) : 0;
      if (dist < minDist) {
        minDist = dist;
        nearest = task;
      }
    }

    if (nearest) {
      route.push({
        taskId: nearest.id,
        roomId: nearest.room_id,
        roomNumber: nearest.rooms?.room_number,
        floor: nearest.rooms?.floor,
        building: nearest.rooms?.building,
        taskType: nearest.task_type,
        priority: nearest.priority,
        estimatedDuration: nearest.estimatedDuration,
        scheduledTime: nearest.scheduled_time,
        sequence: route.length + 1,
        distanceFromPrevious: minDist,
      });
      current = nearest;
      remaining.splice(remaining.indexOf(nearest), 1);
    }
  }

  return route;
}

function calculateDistance(task1: any, task2: any) {
  const x1 = task1.rooms?.x_coordinate || 0;
  const y1 = task1.rooms?.y_coordinate || 0;
  const x2 = task2.rooms?.x_coordinate || 0;
  const y2 = task2.rooms?.y_coordinate || 0;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function calculateTotalDistance(route: any[]) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += route[i].distanceFromPrevious || 0;
  }
  return total;
}

// ── Workload Balancing ─────────────────────────────────────────────────
// Get workload balance across staff
router.get('/workload/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date } = req.query as Record<string, string>;
  
  const cacheKey = `hk-workload:${req.params.propertyId}:${date || new Date().toISOString().split('T')[0]}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const targetDate = date || new Date().toISOString().split('T')[0];
  const workload = await calculateWorkloadBalance(req.params.propertyId, targetDate);

  const result = {
    propertyId: req.params.propertyId,
    date: targetDate,
    workload,
    summary: {
      avgTasksPerStaff: workload.reduce((sum, w) => sum + w.taskCount, 0) / (workload.length || 1),
      maxTasks: Math.max(...workload.map(w => w.taskCount)),
      minTasks: Math.min(...workload.map(w => w.taskCount)),
      imbalanceFactor: calculateImbalanceFactor(workload),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

async function calculateWorkloadBalance(propertyId: string, date: string) {
  const { data: staff } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('property_id', propertyId)
    .eq('role', 'housekeeping')
    .eq('is_active', true);

  const workload = [];

  for (const attendant of staff || []) {
    const { data: tasks } = await supabaseAdmin
      .from('housekeeping_tasks')
      .select('*')
      .eq('property_id', propertyId)
      .eq('assigned_to', attendant.id)
      .like('scheduled_time', `${date}%`)
      .in('status', ['pending', 'in_progress']);

    workload.push({
      attendantId: attendant.id,
      attendantName: attendant.full_name,
      taskCount: (tasks || []).length,
      totalEstimatedTime: (tasks || []).reduce((sum, t) => sum + (t.estimated_duration || 0), 0),
      highPriorityTasks: (tasks || []).filter(t => t.priority === 'high').length,
      status: 'balanced',
    });
  }

  // Mark imbalanced workloads
  const avgTasks = workload.reduce((sum, w) => sum + w.taskCount, 0) / (workload.length || 1);
  workload.forEach(w => {
    if (w.taskCount > avgTasks * 1.3) w.status = 'overloaded';
    else if (w.taskCount < avgTasks * 0.7) w.status = 'underloaded';
  });

  return workload;
}

function calculateImbalanceFactor(workload: any[]): number {
  if (workload.length === 0) return 0;
  const avg = workload.reduce((sum, w) => sum + w.taskCount, 0) / workload.length;
  const variance = workload.reduce((sum, w) => sum + Math.pow(w.taskCount - avg, 2), 0) / workload.length;
  return Math.sqrt(variance) / (avg || 1);
}

// ── Priority-Based Task Queuing ────────────────────────────────────────
// Get prioritized task queue
router.get('/queue/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { taskType } = req.query as Record<string, string>;
  
  const cacheKey = `hk-queue:${req.params.propertyId}:${taskType || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, rooms(room_number, floor), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .in('status', ['pending', 'in_progress'])
    .order('priority', { ascending: false })
    .order('scheduled_time', { ascending: true });

  if (taskType) q = q.eq('task_type', taskType);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const queue = (data || []).map((task, index) => ({
    ...task,
    queuePosition: index + 1,
    urgencyScore: calculateUrgencyScore(task),
  }));

  const result = {
    propertyId: req.params.propertyId,
    queue,
    summary: {
      total: queue.length,
      highPriority: queue.filter(t => t.priority === 'high').length,
      mediumPriority: queue.filter(t => t.priority === 'medium').length,
      lowPriority: queue.filter(t => t.priority === 'low').length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 2 * 60 * 1000);
  return res.json(result);
});

function calculateUrgencyScore(task: any): number {
  let score = 0;
  
  // Priority points
  if (task.priority === 'high') score += 100;
  else if (task.priority === 'medium') score += 50;
  else score += 25;

  // Time-based urgency
  const now = new Date();
  const scheduled = new Date(task.scheduled_time);
  const hoursUntil = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntil < 2) score += 50;
  else if (hoursUntil < 4) score += 30;
  else if (hoursUntil < 8) score += 10;

  return score;
}

// ── Phase 2: Mobile Housekeeping App Endpoints ─────────────────────────
// Get mobile-optimized task list
router.get('/mobile/tasks/:attendantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hk-mobile-tasks:${req.params.attendantId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, rooms(room_number, floor, building, amenities)')
    .eq('assigned_to', req.params.attendantId)
    .in('status', ['pending', 'in_progress'])
    .order('priority', { ascending: false })
    .order('scheduled_time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    attendantId: req.params.attendantId,
    tasks: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(t => t.status === 'pending').length,
      inProgress: (data || []).filter(t => t.status === 'in_progress').length,
    },
  };

  cacheService.set(cacheKey, result, 1 * 60 * 1000);
  return res.json(result);
});

// Update room status from mobile
router.post('/mobile/room-status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { roomId, status, attendantId, notes, photos } = req.body || {};
  
  if (!roomId || !status || !attendantId) {
    return res.status(400).json({ error: 'roomId, status, and attendantId are required' });
  }

  // Update room status
  const { data: room, error: roomError } = await supabaseAdmin
    .from('rooms')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .select()
    .single();

  if (roomError) return res.status(500).json({ error: roomError.message });

  // Update task status
  const { data: task, error: taskError } = await supabaseAdmin
    .from('housekeeping_tasks')
    .update({
      status: status === 'clean' ? 'completed' : 'in_progress',
      notes,
      completed_at: status === 'clean' ? new Date().toISOString() : null,
      photos,
      updated_at: new Date().toISOString(),
    })
    .eq('room_id', roomId)
    .eq('assigned_to', attendantId)
    .in('status', ['pending', 'in_progress'])
    .select()
    .single();

  cacheService.invalidate('hk-*');
  return res.json({ room, task });
});

// ── Quality Management System with Digital Checklists ─────────────────
// Get quality checklists
router.get('/quality/checklists/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { taskType } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('quality_checklists')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);
  
  if (taskType) q = q.eq('task_type', taskType);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    checklists: data || [],
  });
});

// Submit quality inspection
router.post('/quality/inspections', authenticate, requirePermission('hk:quality:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    roomId,
    checklistId,
    inspectorId,
    items,
    photos,
    overallScore,
    notes,
  } = req.body || {};
  
  if (!propertyId || !roomId || !checklistId || !inspectorId || !items) {
    return res.status(400).json({ error: 'propertyId, roomId, checklistId, inspectorId, and items are required' });
  }

  const { data, error } = await supabaseAdmin.from('quality_inspections').insert({
    property_id: propertyId,
    room_id: roomId,
    checklist_id: checklistId,
    inspector_id: inspectorId,
    items,
    photos,
    overall_score: overallScore,
    notes,
    inspection_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.status(201).json(data);
});

// Get quality inspections
router.get('/quality/inspections/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { roomId, inspectorId, startDate, endDate } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('quality_inspections')
    .select('*, rooms(room_number), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('inspection_date', { ascending: false });

  if (roomId) q = q.eq('room_id', roomId);
  if (inspectorId) q = q.eq('inspector_id', inspectorId);
  if (startDate) q = q.gte('inspection_date', startDate);
  if (endDate) q = q.lte('inspection_date', endDate);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    inspections: data || [],
  });
});

// ── Quality Scoring ─────────────────────────────────────────────────────
// Get quality scores summary
router.get('/quality/scores/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-quality-scores:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: inspections } = await supabaseAdmin
    .from('quality_inspections')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('inspection_date', startDate.toISOString());

  const scores = calculateQualityScores(inspections || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    scores,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateQualityScores(inspections: any[]) {
  if (inspections.length === 0) {
    return { averageScore: 0, totalInspections: 0, passingRate: 0 };
  }

  const averageScore = inspections.reduce((sum, i) => sum + (i.overall_score || 0), 0) / inspections.length;
  const passingInspections = inspections.filter(i => (i.overall_score || 0) >= 80).length;

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    totalInspections: inspections.length,
    passingRate: (passingInspections / inspections.length) * 100,
    byInspector: groupScoresByInspector(inspections),
  };
}

function groupScoresByInspector(inspections: any[]) {
  const grouped: Record<string, any[]> = {};
  inspections.forEach(i => {
    const inspectorId = i.inspector_id;
    if (!grouped[inspectorId]) grouped[inspectorId] = [];
    grouped[inspectorId].push(i);
  });

  return Object.entries(grouped).map(([inspectorId, insp]) => ({
    inspectorId,
    averageScore: insp.reduce((sum, i) => sum + (i.overall_score || 0), 0) / insp.length,
    totalInspections: insp.length,
  }));
}

// ── Trend Analysis and Coaching ────────────────────────────────────────
// Get quality trends
router.get('/quality/trends/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { days } = req.query as Record<string, string>;
  
  const cacheKey = `hk-quality-trends:${req.params.propertyId}:${days || '30'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const dayCount = parseInt(days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dayCount);

  const { data: inspections } = await supabaseAdmin
    .from('quality_inspections')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('inspection_date', startDate.toISOString());

  const trends = calculateQualityTrends(inspections || [], dayCount);

  const result = {
    propertyId: req.params.propertyId,
    days: dayCount,
    trends,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateQualityTrends(inspections: any[], days: number) {
  const trends = [];
  const currentDate = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayInspections = inspections.filter(i => i.inspection_date.startsWith(dateStr));
    const avgScore = dayInspections.length > 0
      ? dayInspections.reduce((sum, i) => sum + (i.overall_score || 0), 0) / dayInspections.length
      : null;

    trends.push({
      date: dateStr,
      averageScore: avgScore,
      inspectionCount: dayInspections.length,
    });
  }

  return trends;
}

// Get coaching recommendations
router.get('/quality/coaching/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hk-quality-coaching:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const recommendations = await generateCoachingRecommendations(req.params.propertyId);

  const result = {
    propertyId: req.params.propertyId,
    recommendations,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

async function generateCoachingRecommendations(propertyId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { data: inspections } = await supabaseAdmin
    .from('quality_inspections')
    .select('*, profiles(full_name)')
    .eq('property_id', propertyId)
    .gte('inspection_date', startDate.toISOString());

  const recommendations = [];

  // Identify staff with low scores
  const byInspector = groupScoresByInspector(inspections || []);
  byInspector.forEach(insp => {
    if (insp.averageScore < 80) {
      recommendations.push({
        type: 'performance_improvement',
        priority: 'high',
        inspectorId: insp.inspectorId,
        inspectorName: inspections?.find(i => i.inspector_id === insp.inspectorId)?.profiles?.full_name,
        currentScore: insp.averageScore,
        targetScore: 85,
        recommendation: 'Schedule additional training and mentoring sessions',
        suggestedActions: [
          'Review cleaning procedures',
          'Shadow high-performing staff',
          'Focus on frequently failed checklist items',
        ],
      });
    }
  });

  return recommendations;
}

// ── Phase 3: Linen Inventory Management with Automated Reordering ─────
// Get linen inventory
router.get('/inventory/linen/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hk-linen-inventory:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('linen_inventory')
    .select('*')
    .eq('property_id', req.params.propertyId);

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    inventory: data || [],
    summary: {
      totalItems: (data || []).length,
      lowStockItems: (data || []).filter(i => i.quantity <= i.reorder_level).length,
      totalValue: (data || []).reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Update linen inventory
router.post('/inventory/linen', authenticate, requirePermission('hk:inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    itemType,
    quantity,
    unitCost,
    reorderLevel,
    notes,
  } = req.body || {};
  
  if (!propertyId || !itemType || !quantity) {
    return res.status(400).json({ error: 'propertyId, itemType, and quantity are required' });
  }

  const { data, error } = await supabaseAdmin.from('linen_inventory').insert({
    property_id: propertyId,
    item_type: itemType,
    quantity,
    unit_cost,
    reorder_level: reorderLevel || 50,
    notes,
    updated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.status(201).json(data);
});

// Check for reorder requirements
router.get('/inventory/linen/reorder-check/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('linen_inventory')
    .select('*')
    .eq('property_id', req.params.propertyId);

  if (error) return res.status(500).json({ error: error.message });

  const reorderItems = (data || []).filter(i => i.quantity <= i.reorder_level);

  const result = {
    propertyId: req.params.propertyId,
    needsReorder: reorderItems.length > 0,
    items: reorderItems.map(i => ({
      itemType: i.item_type,
      currentQuantity: i.quantity,
      reorderLevel: i.reorder_level,
      suggestedOrderQuantity: i.reorder_level * 2 - i.quantity,
      estimatedCost: (i.reorder_level * 2 - i.quantity) * i.unit_cost,
    })),
    totalEstimatedCost: reorderItems.reduce((sum, i) => sum + ((i.reorder_level * 2 - i.quantity) * i.unit_cost), 0),
  };

  return res.json(result);
});

// ── Supply Tracking and Consumption Analytics ─────────────────────────
// Get supply consumption analytics
router.get('/inventory/consumption/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-consumption:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: consumption } = await supabaseAdmin
    .from('supply_consumption')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('consumption_date', startDate.toISOString());

  const analytics = calculateConsumptionAnalytics(consumption || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    analytics,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateConsumptionAnalytics(consumption: any[]) {
  const byItem: Record<string, number> = {};
  consumption.forEach(c => {
    byItem[c.item_type] = (byItem[c.item_type] || 0) + c.quantity;
  });

  return {
    totalConsumption: consumption.reduce((sum, c) => sum + c.quantity, 0),
    totalCost: consumption.reduce((sum, c) => sum + (c.quantity * c.unit_cost), 0),
    byItem: Object.entries(byItem).map(([item, quantity]) => ({ item, quantity })),
    trend: 'stable',
  };
}

// ── Lost & Found Workflow Enhancement with Photo Upload ───────────────
// Create lost & found item
router.post('/lost-found', authenticate, requirePermission('hk:lostfound:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    roomId,
    itemType,
    description,
    foundBy,
    photos,
    location,
    dateFound,
  } = req.body || {};
  
  if (!propertyId || !itemType || !foundBy) {
    return res.status(400).json({ error: 'propertyId, itemType, and foundBy are required' });
  }

  const { data, error } = await supabaseAdmin.from('lost_found_items').insert({
    property_id: propertyId,
    room_id: roomId,
    item_type: itemType,
    description,
    found_by: foundBy,
    photos,
    location,
    date_found: dateFound || new Date().toISOString(),
    status: 'found',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.status(201).json(data);
});

// Get lost & found items
router.get('/lost-found/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('lost_found_items')
    .select('*, rooms(room_number), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('date_found', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    items: data || [],
  });
});

// Update lost & found item status
router.put('/lost-found/:id', authenticate, requirePermission('hk:lostfound:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, claimedBy, claimDate, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('lost_found_items')
    .update({
      status,
      claimed_by: claimedBy,
      claim_date: claimDate,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hk-*');
  return res.json(data);
});

// ── Phase 4: Performance Analytics and Productivity Tracking ───────────
// Get performance analytics
router.get('/performance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, attendantId } = req.query as Record<string, string>;
  
  const cacheKey = `hk-performance:${req.params.propertyId}:${period || 'month'}:${attendantId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await calculatePerformanceAnalytics(req.params.propertyId, startDate, attendantId);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    attendantId: attendantId || 'all',
    analytics,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function calculatePerformanceAnalytics(propertyId: string, startDate: Date, attendantId?: string) {
  let q = supabaseAdmin
    .from('housekeeping_tasks')
    .select('*, profiles(full_name)')
    .eq('property_id', propertyId)
    .gte('created_at', startDate.toISOString());

  if (attendantId) q = q.eq('assigned_to', attendantId);

  const { data: tasks } = await q;

  const completedTasks = (tasks || []).filter(t => t.status === 'completed');
  const avgCleaningTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => sum + (t.actual_duration || t.estimated_duration || 0), 0) / completedTasks.length
    : 0;

  return {
    totalTasks: (tasks || []).length,
    completedTasks: completedTasks.length,
    inProgressTasks: (tasks || []).filter(t => t.status === 'in_progress').length,
    pendingTasks: (tasks || []).filter(t => t.status === 'pending').length,
    completionRate: (tasks || []).length > 0 ? (completedTasks.length / (tasks || []).length) * 100 : 0,
    avgCleaningTime,
    byAttendant: attendantId ? null : groupPerformanceByAttendant(tasks || []),
  };
}

function groupPerformanceByAttendant(tasks: any[]) {
  const grouped: Record<string, any[]> = {};
  tasks.forEach(t => {
    const attendantId = t.assigned_to;
    if (!grouped[attendantId]) grouped[attendantId] = [];
    grouped[attendantId].push(t);
  });

  return Object.entries(grouped).map(([attendantId, attTasks]) => ({
    attendantId,
    attendantName: attTasks[0]?.profiles?.full_name,
    totalTasks: attTasks.length,
    completedTasks: attTasks.filter(t => t.status === 'completed').length,
    completionRate: attTasks.length > 0 ? (attTasks.filter(t => t.status === 'completed').length / attTasks.length) * 100 : 0,
    avgCleaningTime: attTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.actual_duration || t.estimated_duration || 0), 0) / (attTasks.filter(t => t.status === 'completed').length || 1),
  }));
}

// ── Clean Room Rate Metrics ────────────────────────────────────────────
// Get clean room rate
router.get('/metrics/clean-room-rate/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-clean-rate:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('property_id', req.params.propertyId);

  const { data: tasks } = await supabaseAdmin
    .from('housekeeping_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  const cleanRate = calculateCleanRoomRate(rooms || [], tasks || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    cleanRate,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateCleanRoomRate(rooms: any[], tasks: any[]) {
  const totalRooms = rooms.length;
  const cleanedRooms = tasks.filter(t => t.status === 'completed').length;

  return {
    totalRooms,
    cleanedRooms,
    cleanRoomRate: totalRooms > 0 ? (cleanedRooms / totalRooms) * 100 : 0,
    targetRate: 95,
    gap: totalRooms > 0 ? 95 - ((cleanedRooms / totalRooms) * 100) : 95,
  };
}

// ── Average Cleaning Time Tracking ─────────────────────────────────────
// Get average cleaning time
router.get('/metrics/cleaning-time/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-cleaning-time:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: tasks } = await supabaseAdmin
    .from('housekeeping_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  const cleaningTime = calculateAverageCleaningTime(tasks || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    cleaningTime,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateAverageCleaningTime(tasks: any[]) {
  if (tasks.length === 0) {
    return { averageTime: 0, targetTime: 30, variance: 0 };
  }

  const times = tasks.map(t => t.actual_duration || t.estimated_duration || 30);
  const averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) / times.length;

  return {
    averageTime: Math.round(averageTime),
    targetTime: 30,
    variance: Math.round(Math.sqrt(variance)),
    withinTarget: averageTime <= 30,
    byTaskType: groupCleaningTimeByTaskType(tasks),
  };
}

function groupCleaningTimeByTaskType(tasks: any[]) {
  const grouped: Record<string, number[]> = {};
  tasks.forEach(t => {
    const type = t.task_type;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(t.actual_duration || t.estimated_duration || 30);
  });

  return Object.entries(grouped).map(([type, times]) => ({
    taskType: type,
    averageTime: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
    count: times.length,
  }));
}

// ── Linen Cost Per Room Analysis ───────────────────────────────────────
// Get linen cost per room
router.get('/metrics/linen-cost/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-linen-cost:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: consumption } = await supabaseAdmin
    .from('supply_consumption')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('item_category', 'linen')
    .gte('consumption_date', startDate.toISOString());

  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('property_id', req.params.propertyId);

  const linenCost = calculateLinenCostPerRoom(consumption || [], rooms || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    linenCost,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateLinenCostPerRoom(consumption: any[], rooms: any[]) {
  const totalCost = consumption.reduce((sum, c) => sum + (c.quantity * c.unit_cost), 0);
  const totalRooms = rooms.length;

  return {
    totalCost,
    totalRooms,
    costPerRoom: totalRooms > 0 ? totalCost / totalRooms : 0,
    targetCostPerRoom: 5,
    variance: totalRooms > 0 ? (totalCost / totalRooms) - 5 : 0,
    byItemType: consumption.reduce((acc: any, c) => {
      acc[c.item_type] = (acc[c.item_type] || 0) + (c.quantity * c.unit_cost);
      return acc;
    }, {}),
  };
}

// ── Staff Performance Dashboards ────────────────────────────────────────
// Get staff performance dashboard
router.get('/dashboard/staff/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hk-staff-dashboard:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: staff } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('role', 'housekeeping')
    .eq('is_active', true);

  const staffPerformance = await Promise.all(
    (staff || []).map(async (s) => {
      const analytics = await calculatePerformanceAnalytics(req.params.propertyId, startDate, s.id);
      const qualityScores = await getStaffQualityScores(req.params.propertyId, s.id, startDate);

      return {
        attendantId: s.id,
        attendantName: s.full_name,
        tasks: analytics,
        quality: qualityScores,
      };
    })
  );

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    staffPerformance,
    summary: {
      totalStaff: staffPerformance.length,
      avgCompletionRate: staffPerformance.reduce((sum, s) => sum + s.tasks.completionRate, 0) / (staffPerformance.length || 1),
      avgQualityScore: staffPerformance.reduce((sum, s) => sum + s.quality.averageScore, 0) / (staffPerformance.length || 1),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

async function getStaffQualityScores(propertyId: string, attendantId: string, startDate: Date) {
  const { data: inspections } = await supabaseAdmin
    .from('quality_inspections')
    .select('*')
    .eq('property_id', propertyId)
    .eq('inspector_id', attendantId)
    .gte('inspection_date', startDate.toISOString());

  if ((inspections || []).length === 0) {
    return { averageScore: 0, totalInspections: 0 };
  }

  return {
    averageScore: inspections.reduce((sum, i) => sum + (i.overall_score || 0), 0) / inspections.length,
    totalInspections: inspections.length,
  };
}

export default router;
