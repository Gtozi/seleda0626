import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Enhanced Sales Pipeline Visualization ──────────────────────
// Get sales pipeline
router.get('/pipeline/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `sales-pipeline:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: opportunities } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*, corporate_accounts(account_name)')
    .eq('property_id', req.params.propertyId)
    .in('status', ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .order('created_at', { ascending: false });

  const pipeline = groupByStage(opportunities || []);

  const result = {
    propertyId: req.params.propertyId,
    pipeline,
    summary: {
      totalOpportunities: (opportunities || []).length,
      totalValue: (opportunities || []).reduce((sum, o) => sum + (o.value || 0), 0),
      weightedPipeline: calculateWeightedPipeline(opportunities || []),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

function groupByStage(opportunities: any[]) {
  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  return stages.map(stage => ({
    stage,
    opportunities: opportunities.filter(o => o.status === stage),
    count: opportunities.filter(o => o.status === stage).length,
    totalValue: opportunities.filter(o => o.status === stage).reduce((sum, o) => sum + (o.value || 0), 0),
  }));
}

function calculateWeightedPipeline(opportunities: any[]): number {
  const weights = { lead: 0.1, qualified: 0.25, proposal: 0.5, negotiation: 0.75, closed_won: 1, closed_lost: 0 };
  return opportunities.reduce((sum, o) => sum + ((o.value || 0) * (weights[o.status] || 0)), 0);
}

// ── Lead to Conversion Funnel Tracking ────────────────────────────────────
// Get conversion funnel
router.get('/funnel/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-funnel:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: leads } = await supabaseAdmin
    .from('sales_leads')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  const funnel = {
    leads: (leads || []).length,
    qualified: (leads || []).filter(l => l.status === 'qualified').length,
    proposals: (leads || []).filter(l => l.status === 'proposal').length,
    negotiations: (leads || []).filter(l => l.status === 'negotiation').length,
    won: (leads || []).filter(l => l.status === 'closed_won').length,
    lost: (leads || []).filter(l => l.status === 'closed_lost').length,
  };

  const conversionRates = {
    leadToQualified: funnel.leads > 0 ? (funnel.qualified / funnel.leads) * 100 : 0,
    qualifiedToProposal: funnel.qualified > 0 ? (funnel.proposals / funnel.qualified) * 100 : 0,
    proposalToNegotiation: funnel.proposals > 0 ? (funnel.negotiations / funnel.proposals) * 100 : 0,
    negotiationToWon: funnel.negotiations > 0 ? (funnel.won / funnel.negotiations) * 100 : 0,
    overallConversion: funnel.leads > 0 ? (funnel.won / funnel.leads) * 100 : 0,
  };

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    funnel,
    conversionRates,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

// ── Proposal/Contract Workflow Automation ────────────────────────────────
// Create proposal
router.post('/proposals', authenticate, requirePermission('sales:proposals:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    opportunityId,
    corporateAccountId,
    proposalNumber,
    title,
    description,
    value,
    validUntil,
    terms,
    createdBy,
  } = req.body || {};
  
  if (!propertyId || !opportunityId || !title || !value) {
    return res.status(400).json({ error: 'propertyId, opportunityId, title, and value are required' });
  }

  const { data, error } = await supabaseAdmin.from('sales_proposals').insert({
    property_id: propertyId,
    opportunity_id: opportunityId,
    corporate_account_id: corporateAccountId,
    proposal_number: proposalNumber || `PROP-${Date.now()}`,
    title,
    description,
    value,
    valid_until: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    terms,
    status: 'draft',
    created_by: createdBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// Get proposals
router.get('/proposals/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, corporateAccountId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('sales_proposals')
    .select('*, corporate_accounts(account_name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);
  if (corporateAccountId) q = q.eq('corporate_account_id', corporateAccountId);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    proposals: data || [],
  });
});

// Send proposal
router.put('/proposals/:id/send', authenticate, requirePermission('sales:proposals:send'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { sentBy, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('sales_proposals')
    .update({
      status: 'sent',
      sent_by: sentBy || req.user?.id,
      sent_at: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.json(data);
});

// Accept proposal
router.put('/proposals/:id/accept', authenticate, requirePermission('sales:proposals:accept'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { acceptedBy, signature } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('sales_proposals')
    .update({
      status: 'accepted',
      accepted_by: acceptedBy,
      signature,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Generate contract from accepted proposal
  await generateContractFromProposal(req.params.id);

  cacheService.invalidate('sales-*');
  return res.json(data);
});

async function generateContractFromProposal(proposalId: string) {
  const { data: proposal } = await supabaseAdmin
    .from('sales_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  await supabaseAdmin.from('sales_contracts').insert({
    property_id: proposal?.property_id,
    proposal_id: proposalId,
    corporate_account_id: proposal?.corporate_account_id,
    contract_number: `CTR-${Date.now()}`,
    value: proposal?.value,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
  });
}

// ── Corporate Account Master Enhancement ──────────────────────────────────
// Get corporate accounts
router.get('/corporate-accounts/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  const cacheKey = `sales-corporate:${req.params.propertyId}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('corporate_accounts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('account_name', { ascending: true });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const accountsWithStats = await Promise.all(
    (data || []).map(async (account) => {
      const stats = await getCorporateAccountStats(account.id);
      return { ...account, stats };
    })
  );

  const result = {
    propertyId: req.params.propertyId,
    corporateAccounts: accountsWithStats,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

async function getCorporateAccountStats(accountId: string) {
  const { data: opportunities } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*')
    .eq('corporate_account_id', accountId);

  return {
    totalOpportunities: (opportunities || []).length,
    totalValue: (opportunities || []).reduce((sum, o) => sum + (o.value || 0), 0),
    wonDeals: (opportunities || []).filter(o => o.status === 'closed_won').length,
    activeDeals: (opportunities || []).filter(o => ['lead', 'qualified', 'proposal', 'negotiation'].includes(o.status)).length,
  };
}

// Create corporate account
router.post('/corporate-accounts', authenticate, requirePermission('sales:corporate:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    accountName,
    industry,
    contactName,
    email,
    phone,
    address,
    taxId,
    creditLimit,
    paymentTerms,
    notes,
  } = req.body || {};
  
  if (!propertyId || !accountName || !email || !phone) {
    return res.status(400).json({ error: 'propertyId, accountName, email, and phone are required' });
  }

  const { data, error } = await supabaseAdmin.from('corporate_accounts').insert({
    property_id: propertyId,
    account_name: accountName,
    industry,
    contact_name: contactName,
    email,
    phone,
    address,
    tax_id: taxId,
    credit_limit: creditLimit,
    payment_terms: paymentTerms,
    notes,
    status: 'active',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Sales Forecasting ──────────────────────────────────────────────────────
// Get sales forecast
router.get('/forecast/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { months } = req.query as Record<string, string>;
  
  const cacheKey = `sales-forecast:${req.params.propertyId}:${months || '6'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const forecastMonths = parseInt(months) || 6;
  const forecast = await generateSalesForecast(req.params.propertyId, forecastMonths);

  const result = {
    propertyId: req.params.propertyId,
    forecastMonths,
    forecast,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function generateSalesForecast(propertyId: string, months: number) {
  const forecast = [];
  const currentDate = new Date();

  // Get historical data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  const { data: historical } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*')
    .eq('property_id', propertyId)
    .gte('created_at', startDate.toISOString())
    .eq('status', 'closed_won');

  const avgMonthlyRevenue = historical.length > 0 
    ? historical.reduce((sum, o) => sum + (o.value || 0), 0) / 12 
    : 50000;

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const monthStr = forecastDate.toISOString().substring(0, 7);

    // Apply seasonal adjustment
    const seasonalFactor = getSeasonalAdjustment(forecastDate.getMonth());
    const growthRate = 0.05; // 5% monthly growth
    const forecastRevenue = avgMonthlyRevenue * seasonalFactor * Math.pow(1 + growthRate, i);

    forecast.push({
      month: monthStr,
      forecastRevenue: Math.round(forecastRevenue),
      confidence: 0.75,
      seasonalFactor,
    });
  }

  return forecast;
}

function getSeasonalAdjustment(month: number): number {
  // Simplified seasonal factors
  if (month >= 4 && month <= 6) return 1.2; // Peak season
  if (month >= 11 || month <= 1) return 1.1; // Holiday season
  return 1.0;
}

// ── Opportunity Management ─────────────────────────────────────────────────
// Get opportunities
router.get('/opportunities/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, corporateAccountId, owner } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('sales_opportunities')
    .select('*, corporate_accounts(account_name), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);
  if (corporateAccountId) q = q.eq('corporate_account_id', corporateAccountId);
  if (owner) q = q.eq('owner_id', owner);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    opportunities: data || [],
  });
});

// Create opportunity
router.post('/opportunities', authenticate, requirePermission('sales:opportunities:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    corporateAccountId,
    title,
    description,
    value,
    stage,
    probability,
    expectedCloseDate,
    ownerId,
  } = req.body || {};
  
  if (!propertyId || !title || !value) {
    return res.status(400).json({ error: 'propertyId, title, and value are required' });
  }

  const { data, error } = await supabaseAdmin.from('sales_opportunities').insert({
    property_id: propertyId,
    corporate_account_id: corporateAccountId,
    title,
    description,
    value,
    status: stage || 'lead',
    probability: probability || 10,
    expected_close_date: expectedCloseDate,
    owner_id: ownerId || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// Update opportunity stage
router.put('/opportunities/:id/stage', authenticate, requirePermission('sales:opportunities:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { stage, probability, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('sales_opportunities')
    .update({
      status: stage,
      probability,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.json(data);
});

// ── Phase 2: Event Booking Calendar Enhancement ──────────────────────────
// Get event calendar
router.get('/events/calendar/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { startDate, endDate } = req.query as Record<string, string>;
  
  const cacheKey = `sales-calendar:${req.params.propertyId}:${startDate}:${endDate}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('events')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('event_date', { ascending: true });

  if (startDate) q = q.gte('event_date', startDate);
  if (endDate) q = q.lte('event_date', endDate);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const calendar = (data || []).map(event => ({
    id: event.id,
    title: event.name,
    start: event.event_date,
    end: event.end_date || event.event_date,
    status: event.status,
    expectedAttendees: event.expected_attendees,
    revenue: event.estimated_revenue,
  }));

  const result = {
    propertyId: req.params.propertyId,
    calendar,
    summary: {
      totalEvents: calendar.length,
      confirmedEvents: calendar.filter(e => e.status === 'confirmed').length,
      pendingEvents: calendar.filter(e => e.status === 'pending').length,
      totalExpectedRevenue: calendar.reduce((sum, e) => sum + (e.revenue || 0), 0),
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// ── BEO Handoff Automation to F&B ─────────────────────────────────────────
// Generate BEO
router.post('/events/:eventId/beo', authenticate, requirePermission('sales:events:beo'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', req.params.eventId)
    .single();

  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { data, error } = await supabaseAdmin.from('banquet_event_orders').insert({
    property_id: event.property_id,
    event_id: req.params.eventId,
    beo_number: `BEO-${Date.now()}`,
    event_date: event.event_date,
    event_type: event.event_type,
    expected_attendees: event.expected_attendees,
    setup_time: event.setup_time,
    service_style: event.service_style,
    special_requirements: event.special_requirements,
    status: 'draft',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Update event status
  await supabaseAdmin
    .from('events')
    .update({ beo_generated: true, beo_generated_at: new Date().toISOString() })
    .eq('id', req.params.eventId);

  cacheService.invalidate('sales-*');
  cacheService.invalidate('fb-*');
  return res.status(201).json(data);
});

// Get BEOs
router.get('/events/beos/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('banquet_event_orders')
    .select('*, events(name, event_date)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    beos: data || [],
  });
});

// ── Resource Scheduling for Events ────────────────────────────────────────
// Get resource availability
router.get('/events/resources/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { date, resourceType } = req.query as Record<string, string>;
  
  const cacheKey = `sales-resources:${req.params.propertyId}:${date}:${resourceType || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: resources } = await supabaseAdmin
    .from('event_resources')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (resourceType) {
    // Filter by type
  }

  const { data: bookings } = await supabaseAdmin
    .from('event_resource_bookings')
    .select('*')
    .eq('booking_date', date || new Date().toISOString().split('T')[0]);

  const availability = (resources || []).map(resource => {
    const bookedQuantity = (bookings || []).filter(b => b.resource_id === resource.id).reduce((sum, b) => sum + b.quantity, 0);
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.resource_type,
      totalQuantity: resource.total_quantity,
      bookedQuantity,
      availableQuantity: resource.total_quantity - bookedQuantity,
      isAvailable: resource.total_quantity > bookedQuantity,
    };
  });

  const result = {
    propertyId: req.params.propertyId,
    date: date || new Date().toISOString().split('T')[0],
    availability,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Book resource
router.post('/events/resources/book', authenticate, requirePermission('sales:resources:book'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    eventId,
    resourceId,
    quantity,
    bookingDate,
    bookedBy,
  } = req.body || {};
  
  if (!propertyId || !eventId || !resourceId || !quantity || !bookingDate) {
    return res.status(400).json({ error: 'propertyId, eventId, resourceId, quantity, and bookingDate are required' });
  }

  const { data, error } = await supabaseAdmin.from('event_resource_bookings').insert({
    property_id: propertyId,
    event_id: eventId,
    resource_id: resourceId,
    quantity,
    booking_date: bookingDate,
    booked_by: bookedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Post-Event Analysis ─────────────────────────────────────────────────────
// Get post-event analysis
router.get('/events/analysis/:eventId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', req.params.eventId)
    .single();

  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { data: actuals } = await supabaseAdmin
    .from('event_actuals')
    .select('*')
    .eq('event_id', req.params.eventId);

  const analysis = {
    eventId: req.params.eventId,
    eventName: event.name,
    eventDate: event.event_date,
    expectedAttendees: event.expected_attendees,
    actualAttendees: actuals?.[0]?.actual_attendees || 0,
    attendanceRate: event.expected_attendees > 0 ? ((actuals?.[0]?.actual_attendees || 0) / event.expected_attendees) * 100 : 0,
    estimatedRevenue: event.estimated_revenue,
    actualRevenue: actuals?.[0]?.actual_revenue || 0,
    revenueVariance: (actuals?.[0]?.actual_revenue || 0) - (event.estimated_revenue || 0),
    satisfactionScore: actuals?.[0]?.satisfaction_score || 0,
    feedback: actuals?.[0]?.feedback,
  };

  return res.json(analysis);
});

// Record event actuals
router.post('/events/:eventId/actuals', authenticate, requirePermission('sales:events:actuals'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    actualAttendees,
    actualRevenue,
    satisfactionScore,
    feedback,
    recordedBy,
  } = req.body || {};

  const { data, error } = await supabaseAdmin.from('event_actuals').insert({
    event_id: req.params.eventId,
    actual_attendees: actualAttendees,
    actual_revenue: actualRevenue,
    satisfaction_score: satisfactionScore,
    feedback,
    recorded_by: recordedBy || req.user?.id,
    recorded_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Event Revenue Tracking ───────────────────────────────────────────────────
// Get event revenue
router.get('/events/revenue/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-event-revenue:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('event_date', startDate.toISOString());

  const revenue = (events || []).map(event => ({
    eventId: event.id,
    eventName: event.name,
    eventDate: event.event_date,
    estimatedRevenue: event.estimated_revenue,
    actualRevenue: event.actual_revenue || 0,
    variance: (event.actual_revenue || 0) - (event.estimated_revenue || 0),
    status: event.status,
  }));

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    revenue,
    summary: {
      totalEvents: revenue.length,
      totalEstimatedRevenue: revenue.reduce((sum, r) => sum + r.estimatedRevenue, 0),
      totalActualRevenue: revenue.reduce((sum, r) => sum + r.actualRevenue, 0),
      totalVariance: revenue.reduce((sum, r) => sum + r.variance, 0),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

// ── Phase 3: CRM Linking Enhancement with Front Office ─────────────────────
// Get CRM-linked guests
router.get('/crm/guests/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { search } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('crm_guests')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('last_name', { ascending: true });

  if (search) {
    q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const guestsWithLinks = await Promise.all(
    (data || []).map(async (guest) => {
      const { data: reservations } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .eq('guest_id', guest.guest_id)
        .order('check_in_date', { ascending: false })
        .limit(5);

      return {
        ...guest,
        linkedReservations: reservations || [],
        totalStays: (reservations || []).length,
        totalRevenue: (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0),
      };
    })
  );

  return res.json({
    propertyId: req.params.propertyId,
    guests: guestsWithLinks,
  });
});

// Link guest to CRM
router.post('/crm/link-guest', authenticate, requirePermission('sales:crm:link'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, guestId, firstName, lastName, email, phone, corporateAccountId } = req.body || {};
  
  if (!propertyId || !guestId || !firstName || !lastName) {
    return res.status(400).json({ error: 'propertyId, guestId, firstName, and lastName are required' });
  }

  const { data, error } = await supabaseAdmin.from('crm_guests').insert({
    property_id: propertyId,
    guest_id: guestId,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    corporate_account_id: corporateAccountId,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Guest Preference Integration ───────────────────────────────────────────
// Get guest preferences
router.get('/crm/preferences/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: preferences } = await supabaseAdmin
    .from('guest_preferences')
    .select('*')
    .eq('guest_id', req.params.guestId);

  const grouped = {
    room: (preferences || []).filter(p => p.category === 'room'),
    dining: (preferences || []).filter(p => p.category === 'dining'),
    amenities: (preferences || []).filter(p => p.category === 'amenities'),
    service: (preferences || []).filter(p => p.category === 'service'),
  };

  return res.json({
    guestId: req.params.guestId,
    preferences: grouped,
  });
});

// Update guest preferences
router.put('/crm/preferences/:guestId', authenticate, requirePermission('sales:crm:preferences'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { preferences } = req.body || [];

  // Delete existing preferences
  await supabaseAdmin
    .from('guest_preferences')
    .delete()
    .eq('guest_id', req.params.guestId);

  // Insert new preferences
  const { data, error } = await supabaseAdmin.from('guest_preferences').insert(
    preferences.map((p: any) => ({
      guest_id: req.params.guestId,
      category: p.category,
      preference: p.preference,
      value: p.value,
      created_at: new Date().toISOString(),
    }))
  ).select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.json({ preferences: data || [] });
});

// ── Communication History Tracking ────────────────────────────────────────
// Get communication history
router.get('/crm/communications/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: communications } = await supabaseAdmin
    .from('communication_history')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('communication_date', { ascending: false });

  return res.json({
    guestId: req.params.guestId,
    communications: communications || [],
  });
});

// Log communication
router.post('/crm/communications', authenticate, requirePermission('sales:crm:log'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    guestId,
    communicationType,
    subject,
    message,
    direction,
    loggedBy,
  } = req.body || {};
  
  if (!guestId || !communicationType || !message) {
    return res.status(400).json({ error: 'guestId, communicationType, and message are required' });
  }

  const { data, error } = await supabaseAdmin.from('communication_history').insert({
    guest_id: guestId,
    communication_type: communicationType,
    subject,
    message,
    direction: direction || 'outbound',
    logged_by: loggedBy || req.user?.id,
    communication_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Sales Activity Logging ─────────────────────────────────────────────────
// Get sales activities
router.get('/activities/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { salespersonId, activityType, startDate, endDate } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('sales_activities')
    .select('*, profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('activity_date', { ascending: false });

  if (salespersonId) q = q.eq('salesperson_id', salespersonId);
  if (activityType) q = q.eq('activity_type', activityType);
  if (startDate) q = q.gte('activity_date', startDate);
  if (endDate) q = q.lte('activity_date', endDate);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    activities: data || [],
  });
});

// Log sales activity
router.post('/activities', authenticate, requirePermission('sales:activities:log'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    salespersonId,
    activityType,
    opportunityId,
    description,
    outcome,
    duration,
  } = req.body || {};
  
  if (!propertyId || !salespersonId || !activityType) {
    return res.status(400).json({ error: 'propertyId, salespersonId, and activityType are required' });
  }

  const { data, error } = await supabaseAdmin.from('sales_activities').insert({
    property_id: propertyId,
    salesperson_id: salespersonId,
    activity_type: activityType,
    opportunity_id: opportunityId,
    description,
    outcome,
    duration,
    activity_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Contact Management ─────────────────────────────────────────────────────
// Get contacts
router.get('/contacts/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { type, search } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('sales_contacts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('last_name', { ascending: true});

  if (type) q = q.eq('contact_type', type);
  if (search) {
    q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    contacts: data || [],
  });
});

// Create contact
router.post('/contacts', authenticate, requirePermission('sales:contacts:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    corporateAccountId,
    firstName,
    lastName,
    title,
    email,
    phone,
    contactType,
    notes,
  } = req.body || {};
  
  if (!propertyId || !firstName || !lastName || !email) {
    return res.status(400).json({ error: 'propertyId, firstName, lastName, and email are required' });
  }

  const { data, error } = await supabaseAdmin.from('sales_contacts').insert({
    property_id: propertyId,
    corporate_account_id: corporateAccountId,
    first_name: firstName,
    last_name: lastName,
    title,
    email,
    phone,
    contact_type: contactType || 'prospect',
    notes,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('sales-*');
  return res.status(201).json(data);
});

// ── Phase 4: Sales Analytics Dashboard ───────────────────────────────────────
// Get sales analytics dashboard
router.get('/analytics/dashboard/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-dashboard:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [opportunities, proposals, events] = await Promise.all([
    supabaseAdmin
      .from('sales_opportunities')
      .select('*')
      .eq('property_id', req.params.propertyId)
      .gte('created_at', startDate.toISOString()),
    supabaseAdmin
      .from('sales_proposals')
      .select('*')
      .eq('property_id', req.params.propertyId)
      .gte('created_at', startDate.toISOString()),
    supabaseAdmin
      .from('events')
      .select('*')
      .eq('property_id', req.params.propertyId)
      .gte('event_date', startDate.toISOString()),
  ]);

  const dashboard = {
    opportunities: {
      total: (opportunities.data || []).length,
      won: (opportunities.data || []).filter(o => o.status === 'closed_won').length,
      lost: (opportunities.data || []).filter(o => o.status === 'closed_lost').length,
      pipelineValue: (opportunities.data || []).filter(o => ['lead', 'qualified', 'proposal', 'negotiation'].includes(o.status)).reduce((sum, o) => sum + (o.value || 0), 0),
      wonValue: (opportunities.data || []).filter(o => o.status === 'closed_won').reduce((sum, o) => sum + (o.value || 0), 0),
    },
    proposals: {
      total: (proposals.data || []).length,
      sent: (proposals.data || []).filter(p => p.status === 'sent').length,
      accepted: (proposals.data || []).filter(p => p.status === 'accepted').length,
      acceptanceRate: (proposals.data || []).length > 0 ? ((proposals.data || []).filter(p => p.status === 'accepted').length / (proposals.data || []).length) * 100 : 0,
    },
    events: {
      total: (events.data || []).length,
      confirmed: (events.data || []).filter(e => e.status === 'confirmed').length,
      completed: (events.data || []).filter(e => e.status === 'completed').length,
      totalRevenue: (events.data || []).reduce((sum, e) => sum + (e.estimated_revenue || 0), 0),
    },
  };

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    dashboard,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

// ── Conversion Rate Tracking ────────────────────────────────────────────────
// Get conversion rates
router.get('/analytics/conversion/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-conversion:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: leads } = await supabaseAdmin
    .from('sales_leads')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  const conversionRates = {
    leadToQualified: calculateConversionRate(leads || [], 'qualified'),
    qualifiedToProposal: calculateConversionRate(leads || [], 'proposal'),
    proposalToNegotiation: calculateConversionRate(leads || [], 'negotiation'),
    negotiationToWon: calculateConversionRate(leads || [], 'closed_won'),
    overall: calculateOverallConversion(leads || []),
  };

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    conversionRates,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateConversionRate(leads: any[], targetStatus: string): number {
  if (leads.length === 0) return 0;
  const targetCount = leads.filter(l => l.status === targetStatus).length;
  return (targetCount / leads.length) * 100;
}

function calculateOverallConversion(leads: any[]): number {
  const won = leads.filter(l => l.status === 'closed_won').length;
  return leads.length > 0 ? (won / leads.length) * 100 : 0;
}

// ── Average Deal Size Analysis ──────────────────────────────────────────────
// Get deal size analysis
router.get('/analytics/deal-size/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-deal-size:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: wonDeals } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'closed_won')
    .gte('created_at', startDate.toISOString());

  const dealSizes = (wonDeals || []).map(d => d.value || 0);
  const avgDealSize = dealSizes.length > 0 ? dealSizes.reduce((sum, d) => sum + d, 0) / dealSizes.length : 0;
  const medianDealSize = dealSizes.length > 0 ? dealSizes.sort((a, b) => a - b)[Math.floor(dealSizes.length / 2)] : 0;

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    dealSize: {
      totalDeals: dealSizes.length,
      avgDealSize: Math.round(avgDealSize),
      medianDealSize: medianDealSize,
      minDealSize: dealSizes.length > 0 ? Math.min(...dealSizes) : 0,
      maxDealSize: dealSizes.length > 0 ? Math.max(...dealSizes) : 0,
      totalRevenue: dealSizes.reduce((sum, d) => sum + d, 0),
    },
    byMonth: groupDealSizeByMonth(wonDeals || []),
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function groupDealSizeByMonth(deals: any[]) {
  const grouped: Record<string, number[]> = {};
  deals.forEach(d => {
    const month = d.created_at.substring(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(d.value || 0);
  });

  return Object.entries(grouped).map(([month, values]) => ({
    month,
    avgDealSize: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
    totalDeals: values.length,
  }));
}

// ── Customer Acquisition Cost Tracking ─────────────────────────────────────
// Get CAC
router.get('/analytics/cac/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `sales-cac:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: marketingSpend } = await supabaseAdmin
    .from('marketing_spend')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('spend_date', startDate.toISOString());

  const { data: newCustomers } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'closed_won')
    .gte('created_at', startDate.toISOString());

  const totalSpend = (marketingSpend || []).reduce((sum, m) => sum + (m.amount || 0), 0);
  const newCustomerCount = new Set((newCustomers || []).map(c => c.corporate_account_id)).size;
  const cac = newCustomerCount > 0 ? totalSpend / newCustomerCount : 0;

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    cac: {
      totalMarketingSpend: totalSpend,
      newCustomers: newCustomerCount,
      cac: Math.round(cac),
      targetCAC: 5000,
      variance: cac - 5000,
    },
    byChannel: groupSpendByChannel(marketingSpend || []),
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function groupSpendByChannel(spend: any[]) {
  const grouped: Record<string, number> = {};
  spend.forEach(s => {
    grouped[s.channel] = (grouped[s.channel] || 0) + (s.amount || 0);
  });

  return Object.entries(grouped).map(([channel, amount]) => ({ channel, amount }));
}

// ── Market Segmentation Analysis ────────────────────────────────────────────
// Get market segmentation
router.get('/analytics/segmentation/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `sales-segmentation:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: accounts } = await supabaseAdmin
    .from('corporate_accounts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const { data: opportunities } = await supabaseAdmin
    .from('sales_opportunities')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'closed_won');

  const segmentation = {
    byIndustry: groupByIndustry(accounts || []),
    byDealSize: groupByDealSize(opportunities || []),
    byGeography: groupByGeography(accounts || []),
    totalAccounts: (accounts || []).length,
    totalRevenue: (opportunities || []).reduce((sum, o) => sum + (o.value || 0), 0),
  };

  const result = {
    propertyId: req.params.propertyId,
    segmentation,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

function groupByIndustry(accounts: any[]) {
  const grouped: Record<string, number> = {};
  accounts.forEach(a => {
    const industry = a.industry || 'other';
    grouped[industry] = (grouped[industry] || 0) + 1;
  });

  return Object.entries(grouped).map(([industry, count]) => ({ industry, count }));
}

function groupByDealSize(opportunities: any[]) {
  const tiers = {
    small: opportunities.filter(o => (o.value || 0) < 10000).length,
    medium: opportunities.filter(o => (o.value || 0) >= 10000 && (o.value || 0) < 50000).length,
    large: opportunities.filter(o => (o.value || 0) >= 50000).length,
  };

  return Object.entries(tiers).map(([tier, count]) => ({ tier, count }));
}

function groupByGeography(accounts: any[]) {
  const grouped: Record<string, number> = {};
  accounts.forEach(a => {
    const location = a.address?.city || a.address?.country || 'other';
    grouped[location] = (grouped[location] || 0) + 1;
  });

  return Object.entries(grouped).map(([location, count]) => ({ location, count }));
}

export default router;
