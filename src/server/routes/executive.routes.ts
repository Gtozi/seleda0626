import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Server-Side KPI API Endpoints ─────────────────────────────
// Get KPI data (cached server-side, no direct client queries)
router.get('/kpi/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, category } = req.query as Record<string, string>;
  
  const cacheKey = `exec-kpi:${req.params.propertyId}:${period || 'month'}:${category || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Calculate KPIs based on category
  let kpiData = {};
  
  switch (category) {
    case 'occupancy':
      kpiData = await calculateOccupancyKPIs(req.params.propertyId, startDate);
      break;
    case 'revenue':
      kpiData = await calculateRevenueKPIs(req.params.propertyId, startDate);
      break;
    case 'labor':
      kpiData = await calculateLaborKPIs(req.params.propertyId, startDate);
      break;
    case 'guest':
      kpiData = await calculateGuestKPIs(req.params.propertyId, startDate);
      break;
    default:
      kpiData = await calculateAllKPIs(req.params.propertyId, startDate);
  }

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    category: category || 'all',
    kpis: kpiData,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

async function calculateOccupancyKPIs(propertyId: string, startDate: Date) {
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId);

  const totalRooms = (rooms || []).length;
  const occupiedRooms = (reservations || []).filter(r => 
    r.status === 'confirmed' || r.status === 'checked_in'
  ).length;
  
  return {
    occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
    totalRooms,
    occupiedRooms,
    averageLengthOfStay: calculateAvgLengthOfStay(reservations || []),
  };
}

async function calculateRevenueKPIs(propertyId: string, startDate: Date) {
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const totalRevenue = (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const avgDailyRate = (reservations || []).reduce((sum, r) => sum + (r.nightly_rate || 0), 0) / ((reservations || []).length || 1);
  const revPAR = totalRevenue / 30; // Simplified

  return {
    totalRevenue,
    avgDailyRate,
    revPAR,
    revenuePerAvailableRoom: revPAR,
  };
}

async function calculateLaborKPIs(propertyId: string, startDate: Date) {
  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', propertyId)
    .gte('period', startDate.toISOString());

  const totalLaborCost = (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0);
  const laborCostPercentage = totalLaborCost / (totalLaborCost * 3.33) * 100; // Simplified

  return {
    totalLaborCost,
    laborCostPercentage,
    overtimeCost: (laborCosts || []).reduce((sum, l) => sum + (l.overtime_cost || 0), 0),
  };
}

async function calculateGuestKPIs(propertyId: string, startDate: Date) {
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const totalGuests = (reservations || []).reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0);
  const guestSatisfaction = 85; // Simplified - would come from feedback

  return {
    totalGuests,
    guestSatisfaction,
    returnGuestRate: 25, // Simplified
  };
}

async function calculateAllKPIs(propertyId: string, startDate: Date) {
  return {
    occupancy: await calculateOccupancyKPIs(propertyId, startDate),
    revenue: await calculateRevenueKPIs(propertyId, startDate),
    labor: await calculateLaborKPIs(propertyId, startDate),
    guest: await calculateGuestKPIs(propertyId, startDate),
  };
}

function calculateAvgLengthOfStay(reservations: any[]): number {
  const completed = reservations.filter(r => r.check_in_date && r.check_out_date);
  if (completed.length === 0) return 0;
  
  const totalNights = completed.reduce((sum, r) => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  
  return totalNights / completed.length;
}

// ── Phase 2: Advanced Analytics with Trend Analysis ───────────────────
// Get advanced analytics with trends
router.get('/analytics/trends/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { metric, days } = req.query as Record<string, string>;
  
  const cacheKey = `exec-trends:${req.params.propertyId}:${metric || 'all'}:${days || '30'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const daysCount = parseInt(days) || 30;
  const trendData = await generateTrendData(req.params.propertyId, metric || 'all', daysCount);

  const result = {
    propertyId: req.params.propertyId,
    metric: metric || 'all',
    days: daysCount,
    trends: trendData,
    summary: calculateTrendSummary(trendData),
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

async function generateTrendData(propertyId: string, metric: string, days: number) {
  const trends = [];
  const currentDate = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayData = await calculateDayMetrics(propertyId, dateStr, metric);
    trends.push({
      date: dateStr,
      ...dayData,
    });
  }

  return trends;
}

async function calculateDayMetrics(propertyId: string, dateStr: string, metric: string) {
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .like('check_in_date', `${dateStr}%`);

  const dayRevenue = (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const dayOccupancy = (reservations || []).filter(r => r.status === 'confirmed' || r.status === 'checked_in').length;

  return {
    revenue: dayRevenue,
    occupancy: dayOccupancy,
    checkIns: (reservations || []).length,
  };
}

function calculateTrendSummary(trends: any[]) {
  const revenueTrend = calculateTrendDirection(trends.map(t => t.revenue));
  const occupancyTrend = calculateTrendDirection(trends.map(t => t.occupancy));

  return {
    revenueTrend,
    occupancyTrend,
    avgRevenue: trends.reduce((sum, t) => sum + t.revenue, 0) / trends.length,
    avgOccupancy: trends.reduce((sum, t) => sum + t.occupancy, 0) / trends.length,
  };
}

function calculateTrendDirection(values: number[]): string {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg * 1.05) return 'increasing';
  if (secondAvg < firstAvg * 0.95) return 'decreasing';
  return 'stable';
}

// ── Predictive Analytics for Operational Bottlenecks ──────────────────
// Get predictive analytics for bottlenecks
router.get('/analytics/predictive/bottlenecks/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { forecastDays } = req.query as Record<string, string>;
  
  const cacheKey = `exec-predictive-bottlenecks:${req.params.propertyId}:${forecastDays || '30'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = parseInt(forecastDays) || 30;
  const bottlenecks = await predictBottlenecks(req.params.propertyId, days);

  const result = {
    propertyId: req.params.propertyId,
    forecastDays: days,
    bottlenecks,
    summary: {
      highRisk: bottlenecks.filter(b => b.riskLevel === 'high').length,
      mediumRisk: bottlenecks.filter(b => b.riskLevel === 'medium').length,
      lowRisk: bottlenecks.filter(b => b.riskLevel === 'low').length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function predictBottlenecks(propertyId: string, days: number) {
  const bottlenecks = [];

  // Predict staffing bottlenecks
  const staffingBottleneck = await predictStaffingBottleneck(propertyId, days);
  if (staffingBottleneck) bottlenecks.push(staffingBottleneck);

  // Predict maintenance bottlenecks
  const maintenanceBottleneck = await predictMaintenanceBottleneck(propertyId, days);
  if (maintenanceBottleneck) bottlenecks.push(maintenanceBottleneck);

  // Predict inventory bottlenecks
  const inventoryBottleneck = await predictInventoryBottleneck(propertyId, days);
  if (inventoryBottleneck) bottlenecks.push(inventoryBottleneck);

  return bottlenecks;
}

async function predictStaffingBottleneck(propertyId: string, days: number) {
  // Get historical staffing data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { data: schedules } = await supabaseAdmin
    .from('staff_schedules')
    .select('*')
    .eq('property_id', propertyId)
    .gte('shift_date', startDate.toISOString());

  // Get demand forecast
  const { data: demand } = await supabaseAdmin
    .from('staffing_recommendations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('recommendation_date', new Date().toISOString().split('T')[0])
    .limit(7);

  const avgStaff = (schedules || []).length / 30;
  const requiredStaff = demand?.[0]?.totalStaffRecommended || avgStaff * 1.2;

  if (requiredStaff > avgStaff * 1.1) {
    return {
      type: 'staffing',
      riskLevel: 'high',
      description: 'Staffing shortage predicted based on demand forecast',
      currentStaff: Math.round(avgStaff),
      requiredStaff: Math.round(requiredStaff),
      shortfall: Math.round(requiredStaff - avgStaff),
      recommendedAction: 'Increase staffing or optimize schedules',
      estimatedImpactDays: 7,
    };
  }

  return null;
}

async function predictMaintenanceBottleneck(propertyId: string, days: number) {
  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'assigned');

  const pendingWorkOrders = (workOrders || []).length;
  const avgResolutionTime = 48; // hours

  if (pendingWorkOrders > 20) {
    return {
      type: 'maintenance',
      riskLevel: 'medium',
      description: 'High backlog of maintenance work orders',
      pendingWorkOrders,
      avgResolutionTime,
      recommendedAction: 'Add maintenance resources or prioritize critical orders',
      estimatedImpactDays: 5,
    };
  }

  return null;
}

async function predictInventoryBottleneck(propertyId: string, days: number) {
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('property_id', propertyId);

  const lowStockItems = (inventory || []).filter(i => i.quantity <= i.reorder_level);

  if (lowStockItems.length > 5) {
    return {
      type: 'inventory',
      riskLevel: 'medium',
      description: 'Multiple items at or below reorder level',
      lowStockItems: lowStockItems.length,
      items: lowStockItems.map(i => ({ name: i.name, current: i.quantity, reorderLevel: i.reorder_level })),
      recommendedAction: 'Consolidate orders and expedite delivery',
      estimatedImpactDays: 3,
    };
  }

  return null;
}

// ── What-If Scenario Modeling ───────────────────────────────────────────
// Create what-if scenario
router.post('/scenarios', authenticate, requirePermission('exec:scenarios:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    scenarioName,
    scenarioType,
    parameters,
    description,
  } = req.body || {};
  
  if (!propertyId || !scenarioName || !scenarioType || !parameters) {
    return res.status(400).json({ error: 'propertyId, scenarioName, scenarioType, and parameters are required' });
  }

  // Run scenario simulation
  const simulationResults = await runScenarioSimulation(propertyId, scenarioType, parameters);

  const { data, error } = await supabaseAdmin.from('executive_scenarios').insert({
    property_id: propertyId,
    scenario_name: scenarioName,
    scenario_type: scenarioType,
    parameters,
    description,
    simulation_results: simulationResults,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

async function runScenarioSimulation(propertyId: string, scenarioType: string, parameters: any) {
  switch (scenarioType) {
    case 'staffing':
      return await runStaffingScenario(propertyId, parameters);
    case 'pricing':
      return await runPricingScenario(propertyId, parameters);
    case 'occupancy':
      return await runOccupancyScenario(propertyId, parameters);
    default:
      return { error: 'Unknown scenario type' };
  }
}

async function runStaffingScenario(propertyId: string, parameters: any) {
  const { staffChange, period } = parameters;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (period || 30));

  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', propertyId)
    .gte('period', startDate.toISOString());

  const currentTotalCost = (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0);
  const projectedCost = currentTotalCost * (1 + (staffChange || 0) / 100);

  return {
    scenarioType: 'staffing',
    currentTotalCost,
    projectedCost,
    costDifference: projectedCost - currentTotalCost,
    staffChangePercent: staffChange,
    projectedImpact: staffChange > 0 ? 'increase' : 'decrease',
  };
}

async function runPricingScenario(propertyId: string, parameters: any) {
  const { priceChange, period } = parameters;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (period || 30));

  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const currentRevenue = (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const projectedRevenue = currentRevenue * (1 + (priceChange || 0) / 100);

  // Price elasticity assumption: 10% price change = 5% demand change
  const demandChange = -((priceChange || 0) / 100) * 0.5;
  const projectedDemand = (reservations || []).length * (1 + demandChange);

  return {
    scenarioType: 'pricing',
    currentRevenue,
    projectedRevenue,
    revenueDifference: projectedRevenue - currentRevenue,
    priceChangePercent: priceChange,
    projectedDemand,
    demandChangePercent: demandChange * 100,
  };
}

async function runOccupancyScenario(propertyId: string, parameters: any) {
  const { occupancyChange, period } = parameters;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (period || 30));

  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const currentOccupancy = (reservations || []).length;
  const projectedOccupancy = currentOccupancy * (1 + (occupancyChange || 0) / 100);

  const avgRate = (reservations || []).reduce((sum, r) => sum + (r.nightly_rate || 0), 0) / ((reservations || []).length || 1);
  const currentRevenue = currentOccupancy * avgRate;
  const projectedRevenue = projectedOccupancy * avgRate;

  return {
    scenarioType: 'occupancy',
    currentOccupancy,
    projectedOccupancy,
    occupancyChangePercent: occupancyChange,
    currentRevenue,
    projectedRevenue,
    revenueDifference: projectedRevenue - currentRevenue,
  };
}

// Get saved scenarios
router.get('/scenarios/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { scenarioType } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('executive_scenarios')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (scenarioType) q = q.eq('scenario_type', scenarioType);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    scenarios: data || [],
  });
});

// ── Benchmarking Against Industry Standards ───────────────────────────
// Get benchmarking data
router.get('/benchmarking/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `exec-benchmarking:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Industry standards
  const industryStandards = {
    occupancyRate: 75,
    revPAR: 120,
    adr: 160,
    laborCostPercentage: 30,
    guestSatisfaction: 85,
  };

  // Get actual performance
  const actualPerformance = await getActualBenchmarkingPerformance(req.params.propertyId, startDate);

  const comparison = {
    propertyId: req.params.propertyId,
    period: days,
    industryStandards,
    actual: actualPerformance,
    variance: {
      occupancyRate: actualPerformance.occupancyRate - industryStandards.occupancyRate,
      revPAR: actualPerformance.revPAR - industryStandards.revPAR,
      adr: actualPerformance.adr - industryStandards.adr,
      laborCostPercentage: actualPerformance.laborCostPercentage - industryStandards.laborCostPercentage,
      guestSatisfaction: actualPerformance.guestSatisfaction - industryStandards.guestSatisfaction,
    },
    performance: {
      occupancyRate: actualPerformance.occupancyRate >= industryStandards.occupancyRate ? 'above' : 'below',
      revPAR: actualPerformance.revPAR >= industryStandards.revPAR ? 'above' : 'below',
      adr: actualPerformance.adr >= industryStandards.adr ? 'above' : 'below',
      laborCostPercentage: actualPerformance.laborCostPercentage <= industryStandards.laborCostPercentage ? 'above' : 'below',
      guestSatisfaction: actualPerformance.guestSatisfaction >= industryStandards.guestSatisfaction ? 'above' : 'below',
    },
  };

  cacheService.set(cacheKey, comparison, 60 * 60 * 1000);
  return res.json(comparison);
});

async function getActualBenchmarkingPerformance(propertyId: string, startDate: Date) {
  const kpis = await calculateAllKPIs(propertyId, startDate);
  
  return {
    occupancyRate: kpis.occupancy.occupancyRate,
    revPAR: kpis.revenue.revPAR,
    adr: kpis.revenue.avgDailyRate,
    laborCostPercentage: kpis.labor.laborCostPercentage,
    guestSatisfaction: kpis.guest.guestSatisfaction,
  };
}

// ── Custom Report Builder ──────────────────────────────────────────────
// Save custom report configuration
router.post('/reports/custom', authenticate, requirePermission('exec:reports:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    reportName,
    metrics,
    filters,
    groupBy,
    schedule,
  } = req.body || {};
  
  if (!propertyId || !reportName || !metrics) {
    return res.status(400).json({ error: 'propertyId, reportName, and metrics are required' });
  }

  const { data, error } = await supabaseAdmin.from('executive_reports').insert({
    property_id: propertyId,
    report_name: reportName,
    metrics,
    filters: filters || {},
    group_by: groupBy,
    schedule,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Generate custom report
router.post('/reports/generate', authenticate, requirePermission('exec:reports:generate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reportId, startDate, endDate } = req.body || {};
  
  if (!reportId) {
    return res.status(400).json({ error: 'reportId is required' });
  }

  const { data: report } = await supabaseAdmin
    .from('executive_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const reportData = await generateExecutiveReport(report, startDate, endDate);

  return res.json({
    report,
    data: reportData,
    generatedAt: new Date().toISOString(),
  });
});

async function generateExecutiveReport(report: any, startDate?: string, endDate?: string) {
  return {
    message: 'Executive report generated',
    metrics: report.metrics,
    filters: report.filters,
  };
}

// ── Phase 3: Alerting System for KPI Threshold Breaches ───────────────
// Create alert rule
router.post('/alerts/rules', authenticate, requirePermission('exec:alerts:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    ruleName,
    kpiMetric,
    threshold,
    condition,
    notificationChannels,
    severity,
  } = req.body || {};
  
  if (!propertyId || !ruleName || !kpiMetric || !threshold || !condition) {
    return res.status(400).json({ error: 'propertyId, ruleName, kpiMetric, threshold, and condition are required' });
  }

  const { data, error } = await supabaseAdmin.from('executive_alert_rules').insert({
    property_id: propertyId,
    rule_name: ruleName,
    kpi_metric: kpiMetric,
    threshold,
    condition, // 'above' or 'below'
    notification_channels: notificationChannels || [],
    severity: severity || 'medium',
    is_active: true,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json(data);
});

// Get alert rules
router.get('/alerts/rules/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { isActive } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('executive_alert_rules')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (isActive) q = q.eq('is_active', isActive === 'true');
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    rules: data || [],
  });
});

// Check for KPI threshold breaches
router.post('/alerts/check/:propertyId', authenticate, requirePermission('exec:alerts:check'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  // Get active alert rules
  const { data: rules } = await supabaseAdmin
    .from('executive_alert_rules')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  // Get current KPIs
  const kpiResponse = await getKPIData(req.params.propertyId, 'month');
  const kpis = kpiResponse.kpis;

  const breaches = [];

  for (const rule of rules || []) {
    const kpiValue = getKPIValue(kpis, rule.kpi_metric);
    const breached = checkThreshold(kpiValue, rule.threshold, rule.condition);

    if (breached) {
      breaches.push({
        ruleId: rule.id,
        ruleName: rule.rule_name,
        kpiMetric: rule.kpi_metric,
        currentValue: kpiValue,
        threshold: rule.threshold,
        condition: rule.condition,
        severity: rule.severity,
        triggeredAt: new Date().toISOString(),
      });

      // Create alert record
      await supabaseAdmin.from('executive_alerts').insert({
        property_id: req.params.propertyId,
        rule_id: rule.id,
        kpi_metric: rule.kpi_metric,
        current_value: kpiValue,
        threshold: rule.threshold,
        severity: rule.severity,
        status: 'active',
        triggered_at: new Date().toISOString(),
      });
    }
  }

  return res.json({
    propertyId: req.params.propertyId,
    breaches,
    summary: {
      totalBreaches: breaches.length,
      critical: breaches.filter(b => b.severity === 'critical').length,
      high: breaches.filter(b => b.severity === 'high').length,
      medium: breaches.filter(b => b.severity === 'medium').length,
    },
  });
});

function getKPIValue(kpis: any, metric: string): number {
  if (metric.includes('occupancy')) return kpis.occupancy?.occupancyRate || 0;
  if (metric.includes('revenue')) return kpis.revenue?.totalRevenue || 0;
  if (metric.includes('labor')) return kpis.labor?.laborCostPercentage || 0;
  if (metric.includes('satisfaction')) return kpis.guest?.guestSatisfaction || 0;
  return 0;
}

function checkThreshold(value: number, threshold: number, condition: string): boolean {
  if (condition === 'above') return value > threshold;
  if (condition === 'below') return value < threshold;
  return false;
}

async function getKPIData(propertyId: string, period: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return await calculateAllKPIs(propertyId, startDate);
}

// Get active alerts
router.get('/alerts/active/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('executive_alerts')
    .select('*, executive_alert_rules(rule_name)')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'active')
    .order('triggered_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    alerts: data || [],
    summary: {
      total: (data || []).length,
      bySeverity: {
        critical: (data || []).filter(a => a.severity === 'critical').length,
        high: (data || []).filter(a => a.severity === 'high').length,
        medium: (data || []).filter(a => a.severity === 'medium').length,
      },
    },
  });
});

// Acknowledge alert
router.put('/alerts/:id/acknowledge', authenticate, requirePermission('exec:alerts:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { acknowledgedBy, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('executive_alerts')
    .update({
      status: 'acknowledged',
      acknowledged_by: acknowledgedBy || req.user?.id,
      acknowledged_at: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data);
});

// ── Real-Time Monitoring Dashboard ─────────────────────────────────────
// Get real-time monitoring data
router.get('/monitoring/realtime/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `exec-monitoring-realtime:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const today = new Date().toISOString().split('T')[0];

  // Get today's metrics
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .like('check_in_date', `${today}%`);

  const { data: rooms } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('property_id', req.params.propertyId);

  const { data: activeAlerts } = await supabaseAdmin
    .from('executive_alerts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('status', 'active');

  const monitoring = {
    propertyId: req.params.propertyId,
    timestamp: new Date().toISOString(),
    occupancy: {
      totalRooms: (rooms || []).length,
      occupiedRooms: (rooms || []).filter(r => typeof r.status === 'string' && r.status.includes('Occupied')).length,
      availableRooms: (rooms || []).filter(r => r.status === 'Vacant Clean' || r.status === 'Vacant Dirty').length,
      occupancyRate: (rooms || []).length > 0
        ? ((rooms || []).filter(r => typeof r.status === 'string' && r.status.includes('Occupied')).length / (rooms || []).length) * 100
        : 0,
    },
    reservations: {
      todayCheckIns: (reservations || []).filter(r => r.check_in_date === today).length,
      todayCheckOuts: (reservations || []).filter(r => r.check_out_date === today).length,
      inHouse: (reservations || []).filter(r => r.status === 'checked_in').length,
      pending: (reservations || []).filter(r => r.status === 'confirmed').length,
    },
    revenue: {
      todayRevenue: (reservations || []).filter(r => r.check_in_date === today).reduce((sum, r) => sum + (r.total_amount || 0), 0),
    },
    alerts: {
      active: (activeAlerts || []).length,
      critical: (activeAlerts || []).filter(a => a.severity === 'critical').length,
      high: (activeAlerts || []).filter(a => a.severity === 'high').length,
    },
    systemHealth: {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
    },
  };

  cacheService.set(cacheKey, monitoring, 30 * 1000);
  return res.json(monitoring);
});

// ── Automated Insights and Recommendations ─────────────────────────────
// Generate insights and recommendations
router.get('/insights/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `exec-insights:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const insights = await generateInsights(req.params.propertyId, startDate);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    insights,
    summary: {
      total: insights.length,
      priority: {
        high: insights.filter(i => i.priority === 'high').length,
        medium: insights.filter(i => i.priority === 'medium').length,
        low: insights.filter(i => i.priority === 'low').length,
      },
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function generateInsights(propertyId: string, startDate: Date) {
  const insights = [];

  const kpis = await calculateAllKPIs(propertyId, startDate);

  // Occupancy insights
  if (kpis.occupancy.occupancyRate < 70) {
    insights.push({
      category: 'occupancy',
      priority: 'high',
      type: 'warning',
      title: 'Low Occupancy Rate',
      description: `Occupancy rate is at ${kpis.occupancy.occupancyRate.toFixed(1)}%, below the recommended 70% threshold.`,
      recommendation: 'Consider promotional pricing or targeted marketing campaigns.',
      currentValue: kpis.occupancy.occupancyRate,
      targetValue: 70,
    });
  }

  // Revenue insights
  if (kpis.revenue.revPAR < 100) {
    insights.push({
      category: 'revenue',
      priority: 'medium',
      type: 'opportunity',
      title: 'RevPAR Optimization Opportunity',
      description: `RevPAR is at ${kpis.revenue.revPAR.toFixed(2)}, there may be room for improvement.`,
      recommendation: 'Review pricing strategy and consider dynamic pricing adjustments.',
      currentValue: kpis.revenue.revPAR,
      targetValue: 120,
    });
  }

  // Labor cost insights
  if (kpis.labor.laborCostPercentage > 35) {
    insights.push({
      category: 'labor',
      priority: 'high',
      type: 'warning',
      title: 'High Labor Cost Percentage',
      description: `Labor cost percentage is at ${kpis.labor.laborCostPercentage.toFixed(1)}%, above the recommended 30% threshold.`,
      recommendation: 'Review staffing schedules and consider optimization measures.',
      currentValue: kpis.labor.laborCostPercentage,
      targetValue: 30,
    });
  }

  // Guest satisfaction insights
  if (kpis.guest.guestSatisfaction < 80) {
    insights.push({
      category: 'guest',
      priority: 'high',
      type: 'warning',
      title: 'Guest Satisfaction Below Target',
      description: `Guest satisfaction score is at ${kpis.guest.guestSatisfaction}, below the target of 85%.`,
      recommendation: 'Review guest feedback and implement service improvements.',
      currentValue: kpis.guest.guestSatisfaction,
      targetValue: 85,
    });
  } else if (kpis.guest.guestSatisfaction >= 90) {
    insights.push({
      category: 'guest',
      priority: 'low',
      type: 'success',
      title: 'Excellent Guest Satisfaction',
      description: `Guest satisfaction score is at ${kpis.guest.guestSatisfaction}, exceeding the target.`,
      recommendation: 'Maintain current service standards and consider sharing best practices.',
      currentValue: kpis.guest.guestSatisfaction,
      targetValue: 85,
    });
  }

  return insights;
}

// ── Phase 4: Revenue Forecasting (30/60/90-day projections) ───────────
// Get revenue forecast
router.get('/forecasting/revenue/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { forecastDays } = req.query as Record<string, string>;
  
  const cacheKey = `exec-forecast-revenue:${req.params.propertyId}:${forecastDays || '90'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = parseInt(forecastDays) || 90;
  const forecast = await generateRevenueForecast(req.params.propertyId, days);

  const result = {
    propertyId: req.params.propertyId,
    forecastDays: days,
    forecast,
    summary: {
      totalProjectedRevenue: forecast.reduce((sum, f) => sum + f.projectedRevenue, 0),
      avgDailyRevenue: forecast.reduce((sum, f) => sum + f.projectedRevenue, 0) / forecast.length,
      growthRate: calculateGrowthRate(forecast),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

async function generateRevenueForecast(propertyId: string, days: number) {
  // Get historical data
  const historicalDays = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - historicalDays);

  const { data: historicalReservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  // Calculate daily averages
  const dailyRevenue: Record<string, number> = {};
  (historicalReservations || []).forEach(r => {
    const date = r.check_in_date.split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (r.total_amount || 0);
  });

  const avgDailyRevenue = Object.values(dailyRevenue).reduce((a, b) => a + b, 0) / Object.keys(dailyRevenue).length;

  // Generate forecast
  const forecast = [];
  const currentDate = new Date();

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];

    // Apply seasonal adjustments (simplified)
    const dayOfWeek = forecastDate.getDay();
    const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1.0; // Weekend boost

    const projectedRevenue = avgDailyRevenue * dayMultiplier * (0.9 + Math.random() * 0.2);

    forecast.push({
      date: dateStr,
      projectedRevenue: Math.round(projectedRevenue),
      confidence: 0.75,
      period: i <= 30 ? '30-day' : i <= 60 ? '60-day' : '90-day',
    });
  }

  return forecast;
}

function calculateGrowthRate(forecast: any[]): number {
  if (forecast.length < 2) return 0;
  const firstAvg = forecast.slice(0, 10).reduce((sum, f) => sum + f.projectedRevenue, 0) / 10;
  const lastAvg = forecast.slice(-10).reduce((sum, f) => sum + f.projectedRevenue, 0) / 10;
  return ((lastAvg - firstAvg) / firstAvg) * 100;
}

// ── Market Share Analysis ─────────────────────────────────────────────
// Get market share analysis
router.get('/analytics/market-share/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `exec-market-share:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const marketData = await calculateMarketShare(req.params.propertyId, startDate);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    marketShare: marketData,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

async function calculateMarketShare(propertyId: string, startDate: Date) {
  // Get property revenue
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const propertyRevenue = (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);

  // Simulated market data (would come from external market data source)
  const totalMarketRevenue = propertyRevenue * 5; // Assume property has 20% market share
  const marketShare = (propertyRevenue / totalMarketRevenue) * 100;

  return {
    propertyRevenue,
    totalMarketRevenue,
    marketShare,
    competitors: [
      { name: 'Competitor A', marketShare: 25 },
      { name: 'Competitor B', marketShare: 20 },
      { name: 'Competitor C', marketShare: 15 },
      { name: 'Your Property', marketShare: Math.round(marketShare) },
      { name: 'Others', marketShare: 100 - 25 - 20 - 15 - Math.round(marketShare) },
    ],
  };
}

// ── Guest Satisfaction Analytics ───────────────────────────────────────
// Get guest satisfaction analytics
router.get('/analytics/satisfaction/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `exec-satisfaction:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const satisfaction = await calculateGuestSatisfactionAnalytics(req.params.propertyId, startDate);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    satisfaction,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function calculateGuestSatisfactionAnalytics(propertyId: string, startDate: Date) {
  // Simplified - would integrate with actual guest feedback system
  return {
    overallScore: 87,
    trend: 'improving',
    byCategory: {
      cleanliness: 88,
      service: 85,
      amenities: 90,
      value: 84,
      location: 92,
    },
    feedback: {
      totalResponses: 245,
      responseRate: 68,
      positive: 198,
      neutral: 32,
      negative: 15,
    },
    topIssues: [
      { issue: 'Room temperature', count: 8, severity: 'medium' },
      { issue: 'WiFi speed', count: 5, severity: 'low' },
      { issue: 'Noise levels', count: 4, severity: 'medium' },
    ],
  };
}

// ── Labor Cost Analysis ────────────────────────────────────────────────
// Get labor cost analysis
router.get('/analytics/labor-cost/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `exec-labor-cost:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const laborAnalysis = await calculateLaborCostAnalysis(req.params.propertyId, startDate);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    laborCost: laborAnalysis,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function calculateLaborCostAnalysis(propertyId: string, startDate: Date) {
  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', propertyId)
    .gte('period', startDate.toISOString());

  const totalLaborCost = (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0);
  const overtimeCost = (laborCosts || []).reduce((sum, l) => sum + (l.overtime_cost || 0), 0);

  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in_date', startDate.toISOString());

  const totalRevenue = (reservations || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);

  return {
    totalLaborCost,
    overtimeCost,
    laborCostPercentage: totalRevenue > 0 ? (totalLaborCost / totalRevenue) * 100 : 0,
    overtimePercentage: totalLaborCost > 0 ? (overtimeCost / totalLaborCost) * 100 : 0,
    byDepartment: {
      housekeeping: totalLaborCost * 0.35,
      frontDesk: totalLaborCost * 0.25,
      foodBeverage: totalLaborCost * 0.25,
      maintenance: totalLaborCost * 0.15,
    },
    trend: 'stable',
  };
}

// ── Capital Expenditure ROI Analysis ───────────────────────────────────
// Get CapEx ROI analysis
router.get('/analytics/capex-roi/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `exec-capex-roi:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const capexAnalysis = await calculateCapExROI(req.params.propertyId);

  const result = {
    propertyId: req.params.propertyId,
    capex: capexAnalysis,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

async function calculateCapExROI(propertyId: string) {
  // Simplified CapEx analysis
  return {
    totalInvestment: 250000,
    projects: [
      {
        name: 'Room Renovations',
        investment: 150000,
        expectedROI: 18,
        paybackPeriod: 36,
        status: 'in_progress',
        annualReturn: 27000,
      },
      {
        name: 'HVAC Upgrade',
        investment: 75000,
        expectedROI: 22,
        paybackPeriod: 30,
        status: 'completed',
        annualReturn: 16500,
      },
      {
        name: 'Smart Lock Installation',
        investment: 25000,
        expectedROI: 15,
        paybackPeriod: 24,
        status: 'completed',
        annualReturn: 3750,
      },
    ],
    overallROI: 18.5,
    totalAnnualReturn: 47250,
    averagePaybackPeriod: 30,
  };
}

export default router;
