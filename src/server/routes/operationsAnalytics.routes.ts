import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Advanced Analytics Dashboard ─────────────────────────────────────
// Get comprehensive operations analytics dashboard
router.get('/dashboard/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `ops-analytics-dashboard:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get tasks metrics
  const { data: tasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  // Get incidents metrics
  const { data: incidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  // Get work orders metrics
  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('created_at', startDate.toISOString());

  // Get labor costs
  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('period', startDate.toISOString());

  const dashboard = {
    propertyId: req.params.propertyId,
    period: days,
    tasks: {
      total: (tasks || []).length,
      completed: (tasks || []).filter(t => t.status === 'completed').length,
      pending: (tasks || []).filter(t => t.status === 'pending').length,
      inProgress: (tasks || []).filter(t => t.status === 'in_progress').length,
      completionRate: (tasks || []).length > 0 
        ? ((tasks || []).filter(t => t.status === 'completed').length / (tasks || []).length) * 100 
        : 0,
      avgResolutionTime: calculateAvgResolutionTime(tasks || []),
    },
    incidents: {
      total: (incidents || []).length,
      open: (incidents || []).filter(i => i.status === 'open').length,
      resolved: (incidents || []).filter(i => i.status === 'resolved').length,
      critical: (incidents || []).filter(i => i.severity === 'critical').length,
      avgResolutionTime: calculateAvgResolutionTime(incidents || []),
    },
    workOrders: {
      total: (workOrders || []).length,
      completed: (workOrders || []).filter(w => w.status === 'completed').length,
      pending: (workOrders || []).filter(w => w.status === 'assigned').length,
      avgCost: (workOrders || []).reduce((sum, w) => sum + (w.actual_cost || w.estimated_cost || 0), 0) / ((workOrders || []).length || 1),
    },
    labor: {
      totalCost: (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0),
      avgDailyCost: (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0) / ((laborCosts || []).length || 1),
      overtimeCost: (laborCosts || []).reduce((sum, l) => sum + (l.overtime_cost || 0), 0),
    },
    kpis: calculateKPIs(tasks || [], incidents || [], workOrders || [], laborCosts || []),
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, dashboard, 5 * 60 * 1000);
  return res.json(dashboard);
});

function calculateAvgResolutionTime(items: any[]): number {
  const completedItems = items.filter(i => i.status === 'completed' && i.completed_at && i.created_at);
  if (completedItems.length === 0) return 0;

  const totalHours = completedItems.reduce((sum, item) => {
    const hours = (new Date(item.completed_at).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  return totalHours / completedItems.length;
}

function calculateKPIs(tasks: any[], incidents: any[], workOrders: any[], laborCosts: any[]): any {
  return {
    taskCompletionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
    incidentResolutionRate: incidents.length > 0 ? (incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100 : 0,
    workOrderCompletionRate: workOrders.length > 0 ? (workOrders.filter(w => w.status === 'completed').length / workOrders.length) * 100 : 0,
    laborCostPerTask: tasks.length > 0 ? (laborCosts.reduce((sum, l) => sum + l.total_cost, 0) / tasks.length) : 0,
    criticalIncidentRate: incidents.length > 0 ? (incidents.filter(i => i.severity === 'critical').length / incidents.length) * 100 : 0,
  };
}

// ── Custom Report Builder ─────────────────────────────────────────────
// Save custom report configuration
router.post('/reports/custom', authenticate, requirePermission('ops:reports:create'), async (req, res) => {
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

  const { data, error } = await supabaseAdmin.from('custom_ops_reports').insert({
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
router.post('/reports/generate', authenticate, requirePermission('ops:reports:generate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reportId, startDate, endDate } = req.body || {};
  
  if (!reportId) {
    return res.status(400).json({ error: 'reportId is required' });
  }

  // Get report configuration
  const { data: report } = await supabaseAdmin
    .from('custom_ops_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Generate report based on configuration
  const reportData = await generateCustomOpsReport(report, startDate, endDate);

  return res.json({
    report,
    data: reportData,
    generatedAt: new Date().toISOString(),
  });
});

async function generateCustomOpsReport(report: any, startDate?: string, endDate?: string) {
  // This would implement the actual report generation logic
  return {
    message: 'Custom operations report generated',
    metrics: report.metrics,
    filters: report.filters,
  };
}

// ── Predictive Analytics ───────────────────────────────────────────────
// Generate predictive analytics
router.post('/predictive-analytics', authenticate, requirePermission('ops:analytics:predictive'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    forecastDays,
    metrics,
  } = req.body || {};
  
  if (!propertyId || !metrics) {
    return res.status(400).json({ error: 'propertyId and metrics are required' });
  }

  const predictions = [];

  for (const metric of metrics) {
    const prediction = await generateMetricPrediction(propertyId, metric, forecastDays || 30);
    predictions.push(prediction);
  }

  const result = {
    propertyId,
    forecastDays: forecastDays || 30,
    predictions,
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

async function generateMetricPrediction(propertyId: string, metric: string, days: number): Promise<any> {
  const historicalDays = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - historicalDays);

  let historicalData: any[] = [];

  // Get historical data based on metric type
  switch (metric) {
    case 'task_volume':
      const { data: tasks } = await supabaseAdmin
        .from('operations_tasks')
        .select('*')
        .eq('property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      historicalData = tasks || [];
      break;
      
    case 'incident_volume':
      const { data: incidents } = await supabaseAdmin
        .from('incidents')
        .select('*')
        .eq('property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      historicalData = incidents || [];
      break;
      
    case 'labor_cost':
      const { data: labor } = await supabaseAdmin
        .from('labor_costs')
        .select('*')
        .eq('property_id', propertyId)
        .gte('period', startDate.toISOString());
      historicalData = labor || [];
      break;
  }

  // Calculate trend and forecast
  const forecast = generateForecast(historicalData, days);

  return {
    metric,
    forecast,
    confidence: 0.75,
    trend: forecast.length > 1 && forecast[forecast.length - 1] > forecast[0] ? 'increasing' : 'stable',
  };
}

function generateForecast(historicalData: any[], days: number): number[] {
  if (historicalData.length === 0) return Array(days).fill(0);

  // Simple moving average forecast
  const recentData = historicalData.slice(-30);
  const avgValue = recentData.length / 30; // Simplified
  
  const forecast = [];
  for (let i = 0; i < days; i++) {
    // Add some randomness to simulate real-world variation
    const variation = 0.9 + Math.random() * 0.2;
    forecast.push(Math.round(avgValue * variation));
  }

  return forecast;
}

// ── Benchmarking and KPIs ──────────────────────────────────────────────
// Get benchmarking data
router.get('/benchmarking/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `ops-benchmarking:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Industry standards (simplified)
  const industryBenchmarks = {
    taskCompletionRate: 85,
    incidentResolutionRate: 90,
    avgTaskResolutionTime: 24, // hours
    laborCostPercentage: 30,
    criticalIncidentRate: 5,
  };

  // Get actual performance
  const actualPerformance = await getActualPerformance(req.params.propertyId, period || 'month');

  const comparison = {
    propertyId: req.params.propertyId,
    period: period || 'month',
    industryBenchmarks,
    actual: actualPerformance,
    variance: {
      taskCompletionRate: actualPerformance.taskCompletionRate - industryBenchmarks.taskCompletionRate,
      incidentResolutionRate: actualPerformance.incidentResolutionRate - industryBenchmarks.incidentResolutionRate,
      avgTaskResolutionTime: actualPerformance.avgTaskResolutionTime - industryBenchmarks.avgTaskResolutionTime,
      laborCostPercentage: actualPerformance.laborCostPercentage - industryBenchmarks.laborCostPercentage,
      criticalIncidentRate: actualPerformance.criticalIncidentRate - industryBenchmarks.criticalIncidentRate,
    },
    performance: {
      taskCompletionRate: actualPerformance.taskCompletionRate >= industryBenchmarks.taskCompletionRate ? 'above' : 'below',
      incidentResolutionRate: actualPerformance.incidentResolutionRate >= industryBenchmarks.incidentResolutionRate ? 'above' : 'below',
      avgTaskResolutionTime: actualPerformance.avgTaskResolutionTime <= industryBenchmarks.avgTaskResolutionTime ? 'above' : 'below',
    },
  };

  cacheService.set(cacheKey, comparison, 60 * 60 * 1000);
  return res.json(comparison);
});

async function getActualPerformance(propertyId: string, period: string): Promise<any> {
  // This would calculate actual metrics from database
  return {
    taskCompletionRate: 82,
    incidentResolutionRate: 88,
    avgTaskResolutionTime: 26,
    laborCostPercentage: 32,
    criticalIncidentRate: 6,
  };
}

// ── Real-Time Performance Monitoring ────────────────────────────────────
// Get real-time performance metrics
router.get('/realtime/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `ops-realtime:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const today = new Date().toISOString().split('T')[0];

  // Get today's metrics
  const { data: tasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .like('created_at', `${today}%`);

  const { data: incidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .like('created_at', `${today}%`);

  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .like('created_at', `${today}%`);

  const realtime = {
    propertyId: req.params.propertyId,
    date: today,
    tasks: {
      created: (tasks || []).length,
      completed: (tasks || []).filter(t => t.status === 'completed').length,
      inProgress: (tasks || []).filter(t => t.status === 'in_progress').length,
    },
    incidents: {
      reported: (incidents || []).length,
      open: (incidents || []).filter(i => i.status === 'open').length,
      resolved: (incidents || []).filter(i => i.status === 'resolved').length,
    },
    workOrders: {
      created: (workOrders || []).length,
      assigned: (workOrders || []).filter(w => w.status === 'assigned').length,
      inProgress: (workOrders || []).filter(w => w.status === 'in_progress').length,
    },
    alerts: generateRealtimeAlerts(tasks || [], incidents || [], workOrders || []),
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, realtime, 30 * 1000);
  return res.json(realtime);
});

function generateRealtimeAlerts(tasks: any[], incidents: any[], workOrders: any[]): Array<{
  type: string;
  severity: string;
  message: string;
  count: number;
}> {
  const alerts = [];

  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status === 'open');
  if (criticalIncidents.length > 0) {
    alerts.push({
      type: 'incident',
      severity: 'critical',
      message: `${criticalIncidents.length} critical incidents require immediate attention`,
      count: criticalIncidents.length,
    });
  }

  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
  if (overdueTasks.length > 0) {
    alerts.push({
      type: 'task',
      severity: 'high',
      message: `${overdueTasks.length} tasks are overdue`,
      count: overdueTasks.length,
    });
  }

  const urgentWorkOrders = workOrders.filter(w => w.priority === 'high' && w.status === 'assigned');
  if (urgentWorkOrders.length > 0) {
    alerts.push({
      type: 'workOrder',
      severity: 'medium',
      message: `${urgentWorkOrders.length} high-priority work orders are pending`,
      count: urgentWorkOrders.length,
    });
  }

  return alerts;
}

export default router;
