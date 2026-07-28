import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Table Floor Plan Management ───────────────────────────────────
// Create or update table layout
router.post('/floor-plan', authenticate, requirePermission('fb:tables:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    name,
    layoutData,
    tables,
  } = req.body || {};
  
  if (!restaurantId || !name || !layoutData) {
    return res.status(400).json({ error: 'restaurantId, name, and layoutData are required' });
  }

  const { data, error } = await supabaseAdmin.from('restaurant_floor_plans').insert({
    restaurant_id: restaurantId,
    name,
    layout_data: layoutData,
    tables: tables || [],
    is_active: true,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate table cache
  cacheService.invalidatePattern('tables:*');

  return res.status(201).json(data);
});

// Get floor plans for restaurant
router.get('/floor-plans/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `floor-plan:${req.params.restaurantId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { data, error } = await supabaseAdmin
    .from('restaurant_floor_plans')
    .select('*')
    .eq('restaurant_id', req.params.restaurantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    restaurantId: req.params.restaurantId,
    floorPlans: data || [],
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

// ── Table Status Management ───────────────────────────────────────
// Update table status
router.put('/tables/:tableId/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, orderId, guestCount, serverId } = req.body || {};
  
  if (!status || !['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].includes(status)) {
    return res.status(400).json({ 
      error: 'status must be available, occupied, reserved, cleaning, or maintenance' 
    });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (orderId !== undefined) updateData.current_order_id = orderId;
  if (guestCount !== undefined) updateData.guest_count = guestCount;
  if (serverId !== undefined) updateData.server_id = serverId;

  // Track turn time if table is being occupied
  if (status === 'occupied' && updateData.current_order_id) {
    updateData.occupied_at = new Date().toISOString();
  }

  // Calculate turn time if table is being freed
  if (status === 'available') {
    const { data: currentTable } = await supabaseAdmin
      .from('restaurant_tables')
      .select('occupied_at')
      .eq('id', req.params.tableId)
      .single();
    
    if (currentTable?.occupied_at) {
      const turnTimeMinutes = Math.floor(
        (Date.now() - new Date(currentTable.occupied_at).getTime()) / 60000
      );
      updateData.last_turn_time_minutes = turnTimeMinutes;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('restaurant_tables')
    .update(updateData)
    .eq('id', req.params.tableId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate table cache
  cacheService.invalidatePattern('tables:*');
  
  // Broadcast real-time update
  await supabaseAdmin
    .from('table_status_updates')
    .insert({
      table_id: req.params.tableId,
      status,
      order_id: orderId,
      updated_by: req.user?.id,
      updated_at: new Date().toISOString(),
    });

  return res.json(data);
});

// Get all tables with status
router.get('/tables/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, section } = req.query as Record<string, string>;
  
  const cacheKey = `tables:${req.params.restaurantId}:${status || 'all'}:${section || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('restaurant_tables')
    .select('*, servers(name)')
    .eq('restaurant_id', req.params.restaurantId);
  
  if (status) q = q.eq('status', status);
  if (section) q = q.eq('section', section);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    restaurantId: req.params.restaurantId,
    tables: data || [],
    summary: {
      total: (data || []).length,
      available: (data || []).filter(t => t.status === 'available').length,
      occupied: (data || []).filter(t => t.status === 'occupied').length,
      reserved: (data || []).filter(t => t.status === 'reserved').length,
      cleaning: (data || []).filter(t => t.status === 'cleaning').length,
    },
  };

  cacheService.set(cacheKey, result, 30 * 1000); // 30 second TTL for real-time data
  return res.json(result);
});

// ── Automated Table Assignment ─────────────────────────────────────
// Assign table automatically based on criteria
router.post('/tables/assign', authenticate, requirePermission('fb:tables:assign'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, guestCount, preference, section, serverId } = req.body || {};
  
  if (!restaurantId || !guestCount) {
    return res.status(400).json({ error: 'restaurantId and guestCount are required' });
  }

  // Get available tables
  let q = supabaseAdmin
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'available')
    .gte('capacity', guestCount)
    .order('capacity', { ascending: true });
  
  if (section) q = q.eq('section', section);
  if (serverId) q = q.eq('server_id', serverId);
  
  const { data: availableTables, error: tablesError } = await q;
  if (tablesError) return res.status(500).json({ error: tablesError.message });

  if (!availableTables || availableTables.length === 0) {
    return res.status(404).json({ 
      error: 'No available tables found matching criteria' 
    });
  }

  // Apply preference logic
  let assignedTable;
  switch (preference) {
    case 'smallest':
      // Get smallest table that fits
      assignedTable = availableTables[0];
      break;
      
    case 'largest':
      // Get largest table
      assignedTable = availableTables[availableTables.length - 1];
      break;
      
    case 'balanced':
      // Get table closest to guest count
      assignedTable = availableTables.reduce((best, current) => {
        const bestDiff = Math.abs(best.capacity - guestCount);
        const currentDiff = Math.abs(current.capacity - guestCount);
        return currentDiff < bestDiff ? current : best;
      });
      break;
      
    default:
      assignedTable = availableTables[0];
  }

  // Update table status
  const { data: updatedTable, error: updateError } = await supabaseAdmin
    .from('restaurant_tables')
    .update({
      status: 'reserved',
      guest_count: guestCount,
      assigned_at: new Date().toISOString(),
      assigned_by: req.user?.id,
    })
    .eq('id', assignedTable.id)
    .select()
    .single();

  if (updateError) return res.status(500).json({ error: updateError.message });

  // Invalidate table cache
  cacheService.invalidatePattern('tables:*');

  return res.json({
    success: true,
    table: updatedTable,
    criteria: { restaurantId, guestCount, preference, section },
  });
});

// ── Front Office Reservation Integration ──────────────────────────
// Sync reservation from Front Office to F&B
router.post('/reservations/sync', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reservationId, guestName, guestCount, dateTime, notes, tablePreference } = req.body || {};
  
  if (!reservationId || !guestCount || !dateTime) {
    return res.status(400).json({ error: 'reservationId, guestCount, and dateTime are required' });
  }

  // Check if reservation already synced
  const { data: existing } = await supabaseAdmin
    .from('fb_reservations')
    .select('*')
    .eq('reservation_id', reservationId)
    .single();

  if (existing) {
    return res.json({ success: true, message: 'Reservation already synced', reservation: existing });
  }

  // Create F&B reservation
  const { data, error } = await supabaseAdmin.from('fb_reservations').insert({
    reservation_id: reservationId,
    guest_name: guestName,
    guest_count: guestCount,
    date_time: dateTime,
    notes,
    table_preference: tablePreference,
    status: 'confirmed',
    synced_from: 'front_office',
    synced_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Auto-assign table if preference specified
  if (tablePreference) {
    // Attempt to assign preferred table
    await supabaseAdmin
      .from('restaurant_tables')
      .update({
        status: 'reserved',
        reservation_id: reservationId,
        guest_count: guestCount,
      })
      .eq('id', tablePreference);
  }

  // Invalidate cache
  cacheService.invalidatePattern('tables:*');
  cacheService.invalidatePattern('reservations:*');

  return res.status(201).json({ success: true, reservation: data });
});

// Get F&B reservations
router.get('/reservations/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date, status } = req.query as Record<string, string>;
  
  const cacheKey = `fb-reservations:${req.params.restaurantId}:${date || 'all'}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('fb_reservations')
    .select('*')
    .eq('restaurant_id', req.params.restaurantId)
    .order('date_time', { ascending: true });
  
  if (date) q = q.like('date_time', `${date}%`);
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    restaurantId: req.params.restaurantId,
    reservations: data || [],
  };

  cacheService.set(cacheKey, result, 2 * 60 * 1000); // 2 minute TTL
  return res.json(result);
});

// ── Server Section Management ─────────────────────────────────────
// Create or update server section
router.post('/sections', authenticate, requirePermission('fb:tables:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, name, tables, primaryServerId } = req.body || {};
  
  if (!restaurantId || !name) {
    return res.status(400).json({ error: 'restaurantId and name are required' });
  }

  const { data, error } = await supabaseAdmin.from('server_sections').insert({
    restaurant_id: restaurantId,
    name,
    tables: tables || [],
    primary_server_id: primaryServerId,
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get server sections
router.get('/sections/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('server_sections')
    .select('*, users(name)')
    .eq('restaurant_id', req.params.restaurantId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// Assign server to section
router.put('/sections/:sectionId/assign-server', authenticate, requirePermission('fb:tables:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { serverId } = req.body || {};
  
  if (!serverId) {
    return res.status(400).json({ error: 'serverId is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('server_sections')
    .update({
      primary_server_id: serverId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.sectionId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data);
});

// ── Waitlist Management ───────────────────────────────────────────
// Add to waitlist
router.post('/waitlist', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, guestName, guestCount, phone, notes, estimatedWaitTime } = req.body || {};
  
  if (!restaurantId || !guestName || !guestCount) {
    return res.status(400).json({ error: 'restaurantId, guestName, and guestCount are required' });
  }

  // Calculate position in queue
  const { data: existingWaitlist } = await supabaseAdmin
    .from('waitlist')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true });

  const position = (existingWaitlist?.length || 0) + 1;

  const { data, error } = await supabaseAdmin.from('waitlist').insert({
    restaurant_id: restaurantId,
    guest_name: guestName,
    guest_count: guestCount,
    phone,
    notes,
    estimated_wait_minutes: estimatedWaitTime,
    position,
    status: 'waiting',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('waitlist:*');

  return res.status(201).json(data);
});

// Get waitlist
router.get('/waitlist/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  const cacheKey = `waitlist:${req.params.restaurantId}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('waitlist')
    .select('*')
    .eq('restaurant_id', req.params.restaurantId)
    .order('created_at', { ascending: true });
  
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    restaurantId: req.params.restaurantId,
    waitlist: data || [],
    summary: {
      total: (data || []).length,
      waiting: (data || []).filter(w => w.status === 'waiting').length,
      seated: (data || []).filter(w => w.status === 'seated').length,
      cancelled: (data || []).filter(w => w.status === 'cancelled').length,
    },
  };

  cacheService.set(cacheKey, result, 30 * 1000); // 30 second TTL
  return res.json(result);
});

// Update waitlist entry status
router.put('/waitlist/:id/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, tableId, seatedBy } = req.body || {};
  
  if (!status || !['waiting', 'seated', 'cancelled', 'no-show'].includes(status)) {
    return res.status(400).json({ error: 'status must be waiting, seated, cancelled, or no-show' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (tableId) updateData.seated_table_id = tableId;
  if (seatedBy) updateData.seated_by = seatedBy;
  if (status === 'seated') updateData.seated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('waitlist')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update positions for remaining waiting guests
  if (status === 'seated' || status === 'cancelled') {
    await repositionWaitlist(req.params.id);
  }

  // Invalidate cache
  cacheService.invalidatePattern('waitlist:*');

  return res.json(data);
});

// Helper function to reposition waitlist
async function repositionWaitlist(seatedId: string) {
  // This would update positions for remaining guests
  // For now, it's a placeholder
  console.log(`Repositioning waitlist after seating ${seatedId}`);
}

export default router;
