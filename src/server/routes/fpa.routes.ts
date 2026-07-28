import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Scenario Modeling ─────────────────────────────────────────────
// Create a financial scenario
router.post('/scenarios', authenticate, requirePermission('finance:fpa:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    scenarioName,
    description,
    basePeriod,
    forecastPeriods,
    assumptions,
    createdBy,
  } = req.body || {};
  
  if (!scenarioName || !basePeriod || !forecastPeriods) {
    return res.status(400).json({ error: 'scenarioName, basePeriod, and forecastPeriods are required' });
  }

  const { data, error } = await supabaseAdmin.from('financial_scenarios').insert({
    scenario_name: scenarioName,
    description,
    base_period: basePeriod,
    forecast_periods: Number(forecastPeriods),
    assumptions: assumptions || {},
    status: 'Draft',
    created_by: createdBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.status(201).json(data);
});

// Get all scenarios
router.get('/scenarios', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  let q = supabaseAdmin.from('financial_scenarios').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// Update scenario with model parameters
router.put('/scenarios/:id/parameters', authenticate, requirePermission('finance:fpa:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { parameters } = req.body || {};
  
  if (!parameters || typeof parameters !== 'object') {
    return res.status(400).json({ error: 'parameters object is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('financial_scenarios')
    .update({
      parameters,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.json(data);
});

// Run scenario simulation
router.post('/scenarios/:id/simulate', authenticate, requirePermission('finance:fpa:simulate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: scenario, error: scenarioError } = await supabaseAdmin
    .from('financial_scenarios')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (scenarioError || !scenario) {
    return res.status(404).json({ error: scenarioError?.message || 'Scenario not found' });
  }

  // Get base period actuals
  const { data: actuals, error: actualsError } = await supabaseAdmin
    .from('budget_actual')
    .select('*')
    .eq('period', scenario.base_period);

  if (actualsError) return res.status(500).json({ error: actualsError.message });

  // Apply scenario parameters to forecast
  const parameters = scenario.parameters || {};
  const growthRate = parameters.growthRate || 0;
  const costReduction = parameters.costReduction || 0;
  
  const forecasts = [];
  const baseDate = new Date(scenario.base_period);

  for (let i = 1; i <= scenario.forecast_periods; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const forecastPeriod = forecastDate.toISOString().slice(0, 7);

    for (const actual of actuals || []) {
      const baseAmount = Number(actual.actual_amount);
      let forecastAmount = baseAmount * (1 + growthRate / 100);
      
      // Apply cost reduction for expense accounts
      if (actual.account_code.startsWith('6') || actual.account_code.startsWith('7')) {
        forecastAmount *= (1 - costReduction / 100);
      }

      forecasts.push({
        scenario_id: scenario.id,
        period: forecastPeriod,
        department: actual.department,
        account_code: actual.account_code,
        forecast_amount: Math.round(forecastAmount * 100) / 100,
        base_amount: baseAmount,
        variance: Math.round(forecastAmount * 100) / 100 - baseAmount,
      });
    }
  }

  // Save simulation results
  const { data: results, error: resultsError } = await supabaseAdmin
    .from('scenario_results')
    .insert(forecasts)
    .select();

  if (resultsError) return res.status(500).json({ error: resultsError.message });

  // Update scenario status
  await supabaseAdmin
    .from('financial_scenarios')
    .update({ status: 'Simulated', simulated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.json({
    success: true,
    scenarioId: req.params.id,
    results: results || [],
    summary: {
      totalForecasts: forecasts.length,
      periods: scenario.forecast_periods,
      parameters,
    },
  });
});

// ── Cash Flow Forecasting ─────────────────────────────────────────
// Generate cash flow forecast
router.post('/cashflow/forecast', authenticate, requirePermission('finance:fpa:forecast'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { 
    startDate, 
    periods, 
    includeAccountsReceivable, 
    includeAccountsPayable,
    assumptions 
  } = req.body || {};
  
  if (!startDate || !periods) {
    return res.status(400).json({ error: 'startDate and periods are required' });
  }

  const forecast = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < Number(periods); i++) {
    const periodStart = new Date(currentDate);
    const periodEnd = new Date(currentDate);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const periodLabel = periodStart.toISOString().slice(0, 7);
    
    // Get cash inflows
    let cashInflows = 0;
    if (includeAccountsReceivable) {
      const { data: arData } = await supabaseAdmin
        .from('ar_ledger')
        .select('amount')
        .gte('due_date', periodStart.toISOString())
        .lt('due_date', periodEnd.toISOString())
        .eq('status', 'Open');
      
      cashInflows = (arData || []).reduce((sum, row) => sum + Number(row.amount), 0);
    }

    // Get cash outflows
    let cashOutflows = 0;
    if (includeAccountsPayable) {
      const { data: apData } = await supabaseAdmin
        .from('ap_ledger')
        .select('amount')
        .gte('due_date', periodStart.toISOString())
        .lt('due_date', periodEnd.toISOString())
        .eq('status', 'Open');
      
      cashOutflows = (apData || []).reduce((sum, row) => sum + Number(row.amount), 0);
    }

    // Apply assumptions
    const collectionRate = assumptions?.collectionRate || 0.9;
    const paymentRate = assumptions?.paymentRate || 0.95;
    
    const netCashFlow = (cashInflows * collectionRate) - (cashOutflows * paymentRate);

    forecast.push({
      period: periodLabel,
      startDate: periodStart.toISOString(),
      endDate: periodEnd.toISOString(),
      cashInflows: Math.round(cashInflows * 100) / 100,
      cashOutflows: Math.round(cashOutflows * 100) / 100,
      netCashFlow: Math.round(netCashFlow * 100) / 100,
      assumptions: {
        collectionRate,
        paymentRate,
      },
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Save forecast
  const { data, error } = await supabaseAdmin.from('cashflow_forecasts').insert({
    forecast_name: `Cash Flow Forecast ${startDate}`,
    start_date: startDate,
    periods: Number(periods),
    assumptions: assumptions || {},
    forecast_data: forecast,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.status(201).json({
    forecast: data,
    details: forecast,
  });
});

// Get cash flow forecasts
router.get('/cashflow/forecasts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { limit = '10' } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin
    .from('cashflow_forecasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// ── Capital Expenditure Planning ───────────────────────────────────
// Create capital expenditure project
router.post('/capex/projects', authenticate, requirePermission('finance:fpa:capex'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    projectName,
    description,
    category,
    estimatedCost,
    startDate,
    endDate,
    fundingSource,
    expectedROI,
    priority,
  } = req.body || {};
  
  if (!projectName || !estimatedCost || !startDate || !endDate) {
    return res.status(400).json({ 
      error: 'projectName, estimatedCost, startDate, and endDate are required' 
    });
  }

  const { data, error } = await supabaseAdmin.from('capex_projects').insert({
    project_name: projectName,
    description,
    category,
    estimated_cost: Number(estimatedCost),
    start_date: startDate,
    end_date: endDate,
    funding_source: fundingSource,
    expected_roi: expectedROI ? Number(expectedROI) : null,
    priority: priority || 'Medium',
    status: 'Proposed',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.status(201).json(data);
});

// Get CAPEX projects with ROI analysis
router.get('/capex/projects', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, category } = req.query as Record<string, string>;
  
  const cacheKey = `capex-projects:${status || 'all'}:${category || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin.from('capex_projects').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (category) q = q.eq('category', category);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Calculate ROI for projects with actual returns
  const projectsWithROI = (data || []).map((project: any) => {
    let roi = null;
    if (project.actual_cost && project.actual_return) {
      roi = ((Number(project.actual_return) - Number(project.actual_cost)) / Number(project.actual_cost)) * 100;
    } else if (project.expected_roi) {
      roi = project.expected_roi;
    }
    
    return {
      ...project,
      calculatedROI: roi,
      paybackPeriod: project.estimated_cost && project.expected_roi 
        ? Number(project.estimated_cost) / (Number(project.estimated_cost) * (Number(project.expected_roi) / 100))
        : null,
    };
  });

  const result = {
    projects: projectsWithROI,
    summary: {
      totalProjects: projectsWithROI.length,
      totalEstimatedCost: projectsWithROI.reduce((sum, p) => sum + Number(p.estimated_cost), 0),
      byPriority: {
        High: projectsWithROI.filter(p => p.priority === 'High').length,
        Medium: projectsWithROI.filter(p => p.priority === 'Medium').length,
        Low: projectsWithROI.filter(p => p.priority === 'Low').length,
      },
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

// ── What-If Analysis ───────────────────────────────────────────────
// Perform what-if analysis
router.post('/what-if', authenticate, requirePermission('finance:fpa:whatif'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    basePeriod,
    variables,
    scenarios,
  } = req.body || {};
  
  if (!basePeriod || !variables || !scenarios) {
    return res.status(400).json({ error: 'basePeriod, variables, and scenarios are required' });
  }

  // Get base period data
  const { data: baseData, error: baseError } = await supabaseAdmin
    .from('budget_actual')
    .select('*')
    .eq('period', basePeriod);

  if (baseError) return res.status(500).json({ error: baseError.message });

  // Run each scenario
  const results = scenarios.map((scenario: any) => {
    const scenarioResults = (baseData || []).map((actual: any) => {
      let adjustedAmount = Number(actual.actual_amount);
      
      // Apply scenario variables
      if (scenario.revenueGrowth && actual.account_code.startsWith('4')) {
        adjustedAmount *= (1 + Number(scenario.revenueGrowth) / 100);
      }
      if (scenario.costIncrease && (actual.account_code.startsWith('6') || actual.account_code.startsWith('7'))) {
        adjustedAmount *= (1 + Number(scenario.costIncrease) / 100);
      }
      if (scenario.staffingChange && actual.account_code.startsWith('6') && actual.account_code.includes('62')) {
        adjustedAmount *= (1 + Number(scenario.staffingChange) / 100);
      }

      return {
        accountCode: actual.account_code,
        department: actual.department,
        baseAmount: Number(actual.actual_amount),
        adjustedAmount: Math.round(adjustedAmount * 100) / 100,
        variance: Math.round(adjustedAmount * 100) / 100 - Number(actual.actual_amount),
        variancePercent: ((adjustedAmount - Number(actual.actual_amount)) / Number(actual.actual_amount)) * 100,
      };
    });

    return {
      scenarioName: scenario.name,
      totalRevenue: scenarioResults
        .filter(r => r.accountCode.startsWith('4'))
        .reduce((sum, r) => sum + r.adjustedAmount, 0),
      totalExpenses: scenarioResults
        .filter(r => r.accountCode.startsWith('6') || r.accountCode.startsWith('7'))
        .reduce((sum, r) => sum + r.adjustedAmount, 0),
      netIncome: scenarioResults
        .filter(r => r.accountCode.startsWith('4'))
        .reduce((sum, r) => sum + r.adjustedAmount, 0) -
        scenarioResults
        .filter(r => r.accountCode.startsWith('6') || r.accountCode.startsWith('7'))
        .reduce((sum, r) => sum + r.adjustedAmount, 0),
      details: scenarioResults,
    };
  });

  // Save what-if analysis
  const { data, error } = await supabaseAdmin.from('what_if_analyses').insert({
    base_period: basePeriod,
    variables,
    scenarios,
    results,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate FP&A cache
  cacheService.invalidatePattern('fpa:*');

  return res.status(201).json({
    analysis: data,
    comparison: results,
  });
});

// Get what-if analyses
router.get('/what-if/analyses', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { limit = '10' } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin
    .from('what_if_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

export default router;
