/**
 * Concierge Portal API Routes
 * Handles all concierge operations including guest requests, profiles, services, and vendor management
 */

import express from 'express';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = express.Router();

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

// Get KPI data for dashboard
router.get('/dashboard/kpi', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get active guest requests
    const { count: activeRequestsCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'In Progress', 'Assigned'])
      .eq('assigned_department', 'Concierge');

    // Get open concierge tasks
    const { count: openTasksCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'Assigned'])
      .eq('assigned_department', 'Concierge');

    // Get transportation requests
    const { count: transportationCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .eq('request_type', 'Transportation')
      .in('status', ['Open', 'In Progress', 'Assigned']);

    // Get restaurant reservations
    const { count: restaurantCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .eq('request_type', 'Restaurant Booking')
      .in('status', ['Open', 'In Progress', 'Assigned']);

    // Get tour bookings
    const { count: toursCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .eq('request_type', 'Tour Booking')
      .in('status', ['Open', 'In Progress', 'Assigned']);

    // Get pending deliveries
    const { count: deliveriesCount } = await supabaseAdmin
      .from('guest_requests')
      .select('*', { count: 'exact', head: true })
      .in('request_type', ['Luggage', 'Package'])
      .in('status', ['Open', 'Assigned']);

    // Calculate satisfaction score
    const { data: satisfactionData } = await supabaseAdmin
      .from('guest_requests')
      .select('rating')
      .not('rating', 'is', null)
      .eq('assigned_department', 'Concierge');

    const avgRating = satisfactionData && satisfactionData.length > 0
      ? satisfactionData.reduce((sum, r) => sum + (r.rating || 0), 0) / satisfactionData.length
      : 0;

    res.json({
      activeGuestRequests: activeRequestsCount || 0,
      vipGuestsInHouse: 0, // Would need complex query
      openConciergeTasks: openTasksCount || 0,
      transportationRequests: transportationCount || 0,
      restaurantReservations: restaurantCount || 0,
      tourBookings: toursCount || 0,
      pendingDeliveries: deliveriesCount || 0,
      guestSatisfactionScore: Math.round(avgRating * 10) / 10,
      averageResponseTime: 0, // Would need complex query
      serviceCompletionRate: 0 // Would need complex query
    });
  } catch (error) {
    console.error('Error fetching dashboard KPI:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard KPI data' });
  }
});

// Get real-time alerts
router.get('/dashboard/alerts', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get urgent guest requests
    const { data: urgentRequests } = await supabaseAdmin
      .from('guest_requests')
      .select('*')
      .in('priority', ['Urgent', 'High'])
      .in('status', ['Open', 'Assigned'])
      .order('submitted_at', { ascending: false })
      .limit(10);

    const alerts = [];

    urgentRequests?.forEach(req => {
      alerts.push({
        id: `ALT-REQ-${req.id}`,
        type: 'Urgent Guest Request',
        message: `${req.guest_name} in Room ${req.room_number}: ${req.description}`,
        severity: req.priority === 'Urgent' ? 'Critical' : 'Warning',
        timestamp: req.submitted_at,
        requestId: req.id,
        guestId: req.guest_name
      });
    });

    res.json(alerts.slice(0, 20));
  } catch (error) {
    console.error('Error fetching dashboard alerts:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
  }
});

// ============================================================================
// GUEST REQUESTS ENDPOINTS
// ============================================================================

// Get all guest requests with filtering
router.get('/requests', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { status, priority, request_type, department, limit = 50 } = req.query;

    let query = supabaseAdmin.from('guest_requests').select('*');

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (request_type) query = query.eq('request_type', request_type);
    if (department) query = query.eq('assigned_department', department);

    query = query.order('submitted_at', { ascending: false }).limit(Number(limit));

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching guest requests:', error);
    res.status(500).json({ error: 'Failed to fetch guest requests' });
  }
});

// Get single guest request by ID
router.get('/requests/:id', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('guest_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Guest request not found' });

    res.json(data);
  } catch (error) {
    console.error('Error fetching guest request:', error);
    res.status(500).json({ error: 'Failed to fetch guest request' });
  }
});

// Create new guest request
router.post('/requests', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const {
      reservation_id,
      room_number,
      guest_name,
      request_type,
      description,
      priority,
      assigned_to,
      assigned_department,
      notes
    } = req.body;

    const request_number = `REQ-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { data, error } = await supabaseAdmin
      .from('guest_requests')
      .insert({
        request_number,
        reservation_id,
        room_number,
        guest_name,
        request_type,
        description,
        priority,
        assigned_to,
        assigned_department,
        notes
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating guest request:', error);
    res.status(500).json({ error: 'Failed to create guest request' });
  }
});

// Update guest request
router.put('/requests/:id', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const {
      status,
      priority,
      assigned_to,
      assigned_department,
      acknowledged_at,
      completed_at,
      notes,
      rating,
      feedback
    } = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (assigned_department !== undefined) updateData.assigned_department = assigned_department;
    if (acknowledged_at !== undefined) updateData.acknowledged_at = acknowledged_at;
    if (completed_at !== undefined) updateData.completed_at = completed_at;
    if (notes !== undefined) updateData.notes = notes;
    if (rating !== undefined) updateData.rating = rating;
    if (feedback !== undefined) updateData.feedback = feedback;

    const { data, error } = await supabaseAdmin
      .from('guest_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Guest request not found' });

    res.json(data);
  } catch (error) {
    console.error('Error updating guest request:', error);
    res.status(500).json({ error: 'Failed to update guest request' });
  }
});

// ============================================================================
// GUEST PROFILES ENDPOINTS
// ============================================================================

// Get guest profile
router.get('/guests/:id', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Guest not found' });

    res.json(data);
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({ error: 'Failed to fetch guest profile' });
  }
});

// Search guests
router.get('/guests', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { search, limit = 20 } = req.query;

    let query = supabaseAdmin.from('guests').select('*').limit(Number(limit));

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error searching guests:', error);
    res.status(500).json({ error: 'Failed to search guests' });
  }
});

// ============================================================================
// GUEST SERVICE CENTER ENDPOINTS
// ============================================================================

// Get in-house guests
router.get('/service-center/in-house', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*, guests(*)')
      .eq('status', 'Checked In')
      .order('check_in_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Transform to match frontend format
    const guests = (data || []).map((row: any) => ({
      id: row.guest_id,
      name: row.guest_name,
      roomNumber: row.room_number,
      status: 'in-house',
      isVIP: row.guests?.preferences?.vip_status === 'true',
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      loyaltyStatus: 'Gold',
      openRequests: 0
    }));

    res.json(guests);
  } catch (error) {
    console.error('Error fetching in-house guests:', error);
    res.status(500).json({ error: 'Failed to fetch in-house guests' });
  }
});

// Get arriving guests
router.get('/service-center/arriving', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('check_in_date', today)
      .neq('status', 'Checked In')
      .order('check_in_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const guests = (data || []).map((row: any) => ({
      id: row.guest_id,
      name: row.guest_name,
      roomNumber: row.room_number || 'TBD',
      status: 'arriving',
      isVIP: false,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      loyaltyStatus: 'Gold',
      openRequests: 0
    }));

    res.json(guests);
  } catch (error) {
    console.error('Error fetching arriving guests:', error);
    res.status(500).json({ error: 'Failed to fetch arriving guests' });
  }
});

// Get departing guests
router.get('/service-center/departing', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('check_out_date', today)
      .eq('status', 'Checked In')
      .order('check_out_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const guests = (data || []).map((row: any) => ({
      id: row.guest_id,
      name: row.guest_name,
      roomNumber: row.room_number,
      status: 'departing',
      isVIP: false,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      loyaltyStatus: 'Gold',
      openRequests: 0
    }));

    res.json(guests);
  } catch (error) {
    console.error('Error fetching departing guests:', error);
    res.status(500).json({ error: 'Failed to fetch departing guests' });
  }
});

// Get service queue
router.get('/service-center/queue', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('guest_requests')
      .select('*')
      .in('status', ['Open', 'Assigned', 'In Progress'])
      .eq('assigned_department', 'Concierge')
      .order('submitted_at', { ascending: true })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });

    const requests = (data || []).map((row: any) => ({
      id: row.id,
      guestName: row.guest_name,
      roomNumber: row.room_number,
      type: row.request_type,
      priority: row.priority.toLowerCase(),
      status: row.status.toLowerCase().replace(' ', '-'),
      requestedAt: row.submitted_at
    }));

    res.json(requests);
  } catch (error) {
    console.error('Error fetching service queue:', error);
    res.status(500).json({ error: 'Failed to fetch service queue' });
  }
});

// ============================================================================
// GUEST COMMUNICATIONS ENDPOINTS
// ============================================================================

// Get guest communications
router.get('/communications', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { guest_id, reservation_id, status, limit = 50 } = req.query;

    let query = supabaseAdmin.from('guest_communications').select('*').limit(Number(limit));

    if (guest_id) query = query.eq('guest_id', guest_id);
    if (reservation_id) query = query.eq('reservation_id', reservation_id);
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Create communication
router.post('/communications', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { guest_id, reservation_id, room_number, message, message_type } = req.body;

    const { data, error } = await supabaseAdmin
      .from('guest_communications')
      .insert({
        guest_id,
        reservation_id,
        room_number,
        message,
        message_type
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ error: 'Failed to create communication' });
  }
});

// Reply to communication
router.put('/communications/:id/reply', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { reply, replied_by } = req.body;

    const { data, error } = await supabaseAdmin
      .from('guest_communications')
      .update({
        reply,
        replied_at: new Date().toISOString(),
        replied_by,
        status: 'Replied'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Communication not found' });

    res.json(data);
  } catch (error) {
    console.error('Error replying to communication:', error);
    res.status(500).json({ error: 'Failed to reply to communication' });
  }
});

// ============================================================================
// VENDOR MANAGEMENT ENDPOINTS
// ============================================================================

// Get vendors
router.get('/vendors', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { category, status, limit = 50 } = req.query;

    let query = supabaseAdmin.from('vendors').select('*').limit(Number(limit));

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Create vendor
router.post('/vendors', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const {
      name, contact_name, email, phone, address,
      tax_id, category, status, withholding_rate
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .insert({
        name,
        contact_name,
        email,
        phone,
        address,
        tax_id,
        category,
        status,
        withholding_rate
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// ============================================================================
// TRANSPORTATION ENDPOINTS
// ============================================================================

// Get airport shuttle requests
router.get('/transportation/shuttle-requests', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { status, limit = 50 } = req.query;

    let query = supabaseAdmin.from('airport_shuttle_requests').select('*').limit(Number(limit));

    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching shuttle requests:', error);
    res.status(500).json({ error: 'Failed to fetch shuttle requests' });
  }
});

// Create shuttle request
router.post('/transportation/shuttle-requests', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const {
      reservation_id, guest_name, flight_number, scheduled_time,
      pickup_location, dropoff_location, quantity, notes
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('airport_shuttle_requests')
      .insert({
        reservation_id,
        guest_name,
        flight_number,
        scheduled_time,
        pickup_location,
        dropoff_location,
        quantity,
        notes
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating shuttle request:', error);
    res.status(500).json({ error: 'Failed to create shuttle request' });
  }
});

// ============================================================================
// GUEST SERVICES ENDPOINTS
// ============================================================================

// Get available guest services
router.get('/services', async (req, res) => {
  try {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { category, available_only = true } = req.query;

    let query = supabaseAdmin.from('guest_services').select('*');

    if (category) query = query.eq('category', category);
    if (available_only === 'true') query = query.eq('available', true);

    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching guest services:', error);
    res.status(500).json({ error: 'Failed to fetch guest services' });
  }
});

export default router;