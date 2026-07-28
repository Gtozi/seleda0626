import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Mobile Operations Manager API ─────────────────────────────────
// Get mobile dashboard data
router.get('/mobile/dashboard/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `ops-mobile-dashboard:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const today = new Date().toISOString().split('T')[0];

  // Get pending tasks
  const { data: tasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .in('status', ['pending', 'in_progress'])
    .order('priority', { ascending: false });

  // Get active work orders
  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .in('status', ['assigned', 'in_progress'])
    .order('created_at', { ascending: false });

  // Get recent incidents
  const { data: incidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .in('status', ['open', 'investigating'])
    .order('created_at', { ascending: false });

  // Get asset alerts
  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('requires_maintenance', true);

  const dashboard = {
    propertyId: req.params.propertyId,
    date: today,
    summary: {
      pendingTasks: (tasks || []).length,
      activeWorkOrders: (workOrders || []).length,
      openIncidents: (incidents || []).length,
      maintenanceAlerts: (assets || []).length,
    },
    tasks: (tasks || []).slice(0, 10),
    workOrders: (workOrders || []).slice(0, 5),
    incidents: (incidents || []).slice(0, 5),
    assets: (assets || []).slice(0, 5),
    lastUpdated: new Date().toISOString(),
  };

  cacheService.set(cacheKey, dashboard, 30 * 1000); // 30 second TTL
  return res.json(dashboard);
});

// Sync mobile data
router.post('/mobile/sync', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    deviceId,
    lastSyncTime,
    dataChanges,
  } = req.body || {};
  
  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required' });
  }

  const results = {
    tasks: [],
    workOrders: [],
    incidents: [],
    errors: [],
  };

  // Process task changes
  if (dataChanges?.tasks) {
    for (const task of dataChanges.tasks) {
      try {
        const { data, error } = await supabaseAdmin
          .from('operations_tasks')
          .upsert({
            ...task,
            synced_at: new Date().toISOString(),
            synced_by: deviceId,
          })
          .select()
          .single();

        if (error) {
          results.errors.push({ type: 'task', id: task.id, error: error.message });
        } else {
          results.tasks.push(data);
        }
      } catch (error: any) {
        results.errors.push({ type: 'task', id: task.id, error: error.message });
      }
    }
  }

  // Process work order changes
  if (dataChanges?.workOrders) {
    for (const workOrder of dataChanges.workOrders) {
      try {
        const { data, error } = await supabaseAdmin
          .from('work_orders')
          .upsert({
            ...workOrder,
            synced_at: new Date().toISOString(),
            synced_by: deviceId,
          })
          .select()
          .single();

        if (error) {
          results.errors.push({ type: 'workOrder', id: workOrder.id, error: error.message });
        } else {
          results.workOrders.push(data);
        }
      } catch (error: any) {
        results.errors.push({ type: 'workOrder', id: workOrder.id, error: error.message });
      }
    }
  }

  // Process incident changes
  if (dataChanges?.incidents) {
    for (const incident of dataChanges.incidents) {
      try {
        const { data, error } = await supabaseAdmin
          .from('incidents')
          .upsert({
            ...incident,
            synced_at: new Date().toISOString(),
            synced_by: deviceId,
          })
          .select()
          .single();

        if (error) {
          results.errors.push({ type: 'incident', id: incident.id, error: error.message });
        } else {
          results.incidents.push(data);
        }
      } catch (error: any) {
        results.errors.push({ type: 'incident', id: incident.id, error: error.message });
      }
    }
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');

  return res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    results,
    summary: {
      tasksSynced: results.tasks.length,
      workOrdersSynced: results.workOrders.length,
      incidentsSynced: results.incidents.length,
      errors: results.errors.length,
    },
  });
});

// Get data for offline sync
router.get('/mobile/sync-data/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { lastSyncTime, dataTypes } = req.query as Record<string, string>;
  
  const types = dataTypes ? dataTypes.split(',') : ['tasks', 'workOrders', 'incidents', 'assets'];

  const syncData: any = {
    propertyId: req.params.propertyId,
    syncTimestamp: new Date().toISOString(),
  };

  // Get tasks
  if (types.includes('tasks')) {
    let q = supabaseAdmin
      .from('operations_tasks')
      .select('*')
      .eq('property_id', req.params.propertyId);
    
    if (lastSyncTime) {
      q = q.gt('updated_at', lastSyncTime);
    }
    
    const { data } = await q;
    syncData.tasks = data || [];
  }

  // Get work orders
  if (types.includes('workOrders')) {
    let q = supabaseAdmin
      .from('work_orders')
      .select('*')
      .eq('property_id', req.params.propertyId);
    
    if (lastSyncTime) {
      q = q.gt('updated_at', lastSyncTime);
    }
    
    const { data } = await q;
    syncData.workOrders = data || [];
  }

  // Get incidents
  if (types.includes('incidents')) {
    let q = supabaseAdmin
      .from('incidents')
      .select('*')
      .eq('property_id', req.params.propertyId);
    
    if (lastSyncTime) {
      q = q.gt('updated_at', lastSyncTime);
    }
    
    const { data } = await q;
    syncData.incidents = data || [];
  }

  // Get assets
  if (types.includes('assets')) {
    let q = supabaseAdmin
      .from('assets')
      .select('*')
      .eq('property_id', req.params.propertyId);
    
    if (lastSyncTime) {
      q = q.gt('updated_at', lastSyncTime);
    }
    
    const { data } = await q;
    syncData.assets = data || [];
  }

  return res.json(syncData);
});

// ── Real-Time Task Management ─────────────────────────────────────
// Create task
router.post('/tasks', authenticate, requirePermission('ops:tasks:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    title,
    description,
    priority,
    assignedTo,
    dueDate,
    category,
    location,
  } = req.body || {};
  
  if (!propertyId || !title) {
    return res.status(400).json({ error: 'propertyId and title are required' });
  }

  const { data, error } = await supabaseAdmin.from('operations_tasks').insert({
    property_id: propertyId,
    title,
    description,
    priority: priority || 'medium',
    assigned_to: assignedTo,
    due_date: dueDate,
    category,
    location,
    status: 'pending',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-tasks:*');

  return res.status(201).json(data);
});

// Get tasks
router.get('/tasks/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, priority, assignedTo } = req.query as Record<string, string>;
  
  const cacheKey = `ops-tasks:${req.params.propertyId}:${status || 'all'}:${priority || 'all'}:${assignedTo || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('operations_tasks')
    .select('*, users(name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  if (assignedTo) q = q.eq('assigned_to', assignedTo);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    tasks: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(t => t.status === 'pending').length,
      inProgress: (data || []).filter(t => t.status === 'in_progress').length,
      completed: (data || []).filter(t => t.status === 'completed').length,
      highPriority: (data || []).filter(t => t.priority === 'high').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

// Update task status
router.put('/tasks/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, notes, completedBy } = req.body || {};
  
  if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes) updateData.notes = notes;
  if (completedBy) updateData.completed_by = completedBy;
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('operations_tasks')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-tasks:*');

  return res.json(data);
});

// ── Mobile Incident Reporting ───────────────────────────────────────
// Report incident from mobile
router.post('/incidents', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    type,
    severity,
    title,
    description,
    location,
    reportedBy,
    photos,
    gpsCoordinates,
  } = req.body || {};
  
  if (!propertyId || !type || !title) {
    return res.status(400).json({ error: 'propertyId, type, and title are required' });
  }

  const incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabaseAdmin.from('incidents').insert({
    incident_number: incidentNumber,
    property_id: propertyId,
    type,
    severity: severity || 'medium',
    title,
    description,
    location,
    reported_by: reportedBy || req.user?.id,
    photos: photos || [],
    gps_coordinates: gpsCoordinates,
    status: 'open',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-incidents:*');

  return res.status(201).json(data);
});

// Get incidents
router.get('/incidents/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, severity, type } = req.query as Record<string, string>;
  
  const cacheKey = `ops-incidents:${req.params.propertyId}:${status || 'all'}:${severity || 'all'}:${type || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (severity) q = q.eq('severity', severity);
  if (type) q = q.eq('type', type);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
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
router.put('/incidents/:id/status', authenticate, requirePermission('ops:incidents:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, resolution, resolvedBy } = req.body || {};
  
  if (!status || !['open', 'investigating', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (resolution) updateData.resolution = resolution;
  if (resolvedBy) updateData.resolved_by = resolvedBy;
  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('incidents')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-incidents:*');

  return res.json(data);
});

// ── Work Order Management ───────────────────────────────────────────
// Create work order
router.post('/work-orders', authenticate, requirePermission('ops:workorders:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    title,
    description,
    priority,
    assignedTo,
    dueDate,
    category,
    assetId,
    estimatedCost,
  } = req.body || {};
  
  if (!propertyId || !title) {
    return res.status(400).json({ error: 'propertyId and title are required' });
  }

  const workOrderNumber = `WO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabaseAdmin.from('work_orders').insert({
    work_order_number: workOrderNumber,
    property_id: propertyId,
    title,
    description,
    priority: priority || 'medium',
    assigned_to: assignedTo,
    due_date: dueDate,
    category,
    asset_id: assetId,
    estimated_cost: estimatedCost,
    status: 'assigned',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-work-orders:*');

  return res.status(201).json(data);
});

// Get work orders
router.get('/work-orders/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, priority, assignedTo } = req.query as Record<string, string>;
  
  const cacheKey = `ops-work-orders:${req.params.propertyId}:${status || 'all'}:${priority || 'all'}:${assignedTo || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('work_orders')
    .select('*, users(name), assets(name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  if (assignedTo) q = q.eq('assigned_to', assignedTo);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    workOrders: data || [],
    summary: {
      total: (data || []).length,
      assigned: (data || []).filter(w => w.status === 'assigned').length,
      inProgress: (data || []).filter(w => w.status === 'in_progress').length,
      completed: (data || []).filter(w => w.status === 'completed').length,
      highPriority: (data || []).filter(w => w.priority === 'high').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update work order status
router.put('/work-orders/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, notes, actualCost, completedBy } = req.body || {};
  
  if (!status || !['assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes) updateData.notes = notes;
  if (actualCost) updateData.actual_cost = actualCost;
  if (completedBy) updateData.completed_by = completedBy;
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('work_orders')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-mobile:*');
  cacheService.invalidatePattern('ops-work-orders:*');

  return res.json(data);
});

// ── Mobile Asset Tracking ───────────────────────────────────────────
// Get assets for mobile
router.get('/assets/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { category, status } = req.query as Record<string, string>;
  
  const cacheKey = `ops-assets:${req.params.propertyId}:${category || 'all'}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('assets')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('name');
  
  if (category) q = q.eq('category', category);
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    assets: data || [],
    summary: {
      total: (data || []).length,
      active: (data || []).filter(a => a.status === 'active').length,
      maintenanceRequired: (data || []).filter(a => a.requires_maintenance).length,
      byCategory: categorizeAssets(data || []),
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Update asset location
router.put('/assets/:id/location', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { location, gpsCoordinates, updatedBy } = req.body || {};
  
  if (!location) {
    return res.status(400).json({ error: 'location is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('assets')
    .update({
      location,
      gps_coordinates: gpsCoordinates,
      last_location_update: new Date().toISOString(),
      updated_by: updatedBy || req.user?.id,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-assets:*');

  return res.json(data);
});

// Report asset issue from mobile
router.post('/assets/:id/report-issue', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { issueType, description, severity, photos, reportedBy } = req.body || {};
  
  if (!issueType || !description) {
    return res.status(400).json({ error: 'issueType and description are required' });
  }

  // Mark asset as requiring maintenance
  await supabaseAdmin
    .from('assets')
    .update({
      requires_maintenance: true,
      maintenance_notes: description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id);

  // Create work order
  const { data: asset } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('id', req.params.id)
    .single();

  const workOrderNumber = `WO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabaseAdmin.from('work_orders').insert({
    work_order_number: workOrderNumber,
    property_id: asset?.property_id,
    title: `Asset Issue: ${issueType}`,
    description,
    priority: severity === 'critical' ? 'high' : 'medium',
    category: issueType,
    asset_id: req.params.id,
    status: 'assigned',
    created_by: reportedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-assets:*');
  cacheService.invalidatePattern('ops-work-orders:*');

  return res.status(201).json(data);
});

function categorizeAssets(assets: any[]) {
  const categories: Record<string, number> = {};
  assets.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + 1;
  });
  return categories;
}

// ── Location-Based Services ────────────────────────────────────────
// Get tasks near location
router.get('/tasks/near/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { latitude, longitude, radius } = req.query as Record<string, string>;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  // Get tasks with location data
  const { data: tasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .not('gps_coordinates', 'is', null)
    .in('status', ['pending', 'in_progress']);

  // Filter by distance (simplified - would use proper geospatial query in production)
  const nearbyTasks = (tasks || []).filter((task: any) => {
    if (!task.gps_coordinates) return false;
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      task.gps_coordinates.latitude,
      task.gps_coordinates.longitude
    );
    return distance <= (parseFloat(radius) || 100); // Default 100m radius
  });

  return res.json({
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    radius: parseFloat(radius) || 100,
    tasks: nearbyTasks,
    count: nearbyTasks.length,
  });
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}

// ── Push Notifications for Mobile ───────────────────────────────────
// Register device for push notifications
router.post('/notifications/register', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    deviceId,
    platform, // 'ios' or 'android'
    pushToken,
    userId,
  } = req.body || {};
  
  if (!deviceId || !pushToken) {
    return res.status(400).json({ error: 'deviceId and pushToken are required' });
  }

  const { data, error } = await supabaseAdmin.from('push_notification_devices').insert({
    device_id: deviceId,
    user_id: userId || req.user?.id,
    platform,
    push_token: pushToken,
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Send push notification
router.post('/notifications/send', authenticate, requirePermission('ops:notifications:send'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    userIds,
    title,
    message,
    data,
    priority,
  } = req.body || {};
  
  if (!userIds || !title || !message) {
    return res.status(400).json({ error: 'userIds, title, and message are required' });
  }

  // Get push tokens for users
  const { data: devices } = await supabaseAdmin
    .from('push_notification_devices')
    .select('*')
    .in('user_id', Array.isArray(userIds) ? userIds : [userIds])
    .eq('is_active', true);

  if (!devices || devices.length === 0) {
    return res.json({ success: true, message: 'No devices registered for push notifications' });
  }

  // Send push notifications (simplified - would use FCM/APNS in production)
  const notificationResults = await Promise.all(
    (devices || []).map(async (device: any) => {
      // Simulate sending
      return {
        deviceId: device.device_id,
        success: true,
      };
    })
  );

  return res.json({
    success: true,
    sent: notificationResults.filter(r => r.success).length,
    failed: notificationResults.filter(r => !r.success).length,
  });
});

export default router;
