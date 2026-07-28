import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Advanced Budgeting ───────────────────────────────────────────
// Create a zero-based budget entry (starts from zero, all expenses must be justified)
router.post('/zero-based', authenticate, requirePermission('finance:budget:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    budgetName,
    period,
    department,
    accountCode,
    justification,
    proposedAmount,
    benefits,
    alternatives,
    requestedBy,
  } = req.body || {};
  
  if (!budgetName || !period || !department || !accountCode || !proposedAmount || !justification) {
    return res.status(400).json({ 
      error: 'budgetName, period, department, accountCode, proposedAmount, and justification are required' 
    });
  }

  const { data, error } = await supabaseAdmin.from('budget_entries').insert({
    budget_name: budgetName,
    period,
    department,
    account_code: accountCode,
    budget_type: 'Zero-Based',
    budgeted_amount: Number(proposedAmount),
    justification,
    benefits: benefits || [],
    alternatives: alternatives || [],
    status: 'Pending Review',
    requested_by: requestedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate budget cache
  cacheService.invalidatePattern('budget:*');

  return res.status(201).json(data);
});

// Create a rolling forecast budget
router.post('/rolling-forecast', authenticate, requirePermission('finance:budget:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    basePeriod,
    forecastPeriods,
    department,
    growthRate,
    seasonalityAdjustments,
    assumptions,
  } = req.body || {};
  
  if (!basePeriod || !forecastPeriods || !department) {
    return res.status(400).json({ 
      error: 'basePeriod, forecastPeriods, and department are required' 
    });
  }

  // Get actuals from base period to use as starting point
  const { data: actuals, error: actualsError } = await supabaseAdmin
    .from('budget_actual')
    .select('*')
    .eq('period', basePeriod)
    .eq('department', department);

  if (actualsError) return res.status(500).json({ error: actualsError.message });

  const forecasts = [];
  const baseDate = new Date(basePeriod);
  const growthFactor = 1 + (Number(growthRate) || 0) / 100;

  for (let i = 1; i <= Number(forecastPeriods); i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const forecastPeriod = forecastDate.toISOString().slice(0, 7);

    // Apply seasonality adjustment if provided
    let seasonalityFactor = 1.0;
    if (seasonalityAdjustments && seasonalityAdjustments[i - 1]) {
      seasonalityFactor = 1 + Number(seasonalityAdjustments[i - 1]) / 100;
    }

    // Calculate forecasted amount for each account
    for (const actual of actuals || []) {
      const forecastAmount = Number(actual.actual_amount) * growthFactor * seasonalityFactor;
      
      forecasts.push({
        budget_name: `Rolling Forecast ${forecastPeriod}`,
        period: forecastPeriod,
        department,
        account_code: actual.account_code,
        budget_type: 'Rolling Forecast',
        budgeted_amount: Math.round(forecastAmount * 100) / 100,
        base_period: basePeriod,
        growth_rate: Number(growthRate) || 0,
        seasonality_adjustment: seasonalityFactor,
        assumptions: assumptions || [],
        status: 'Draft',
        created_at: new Date().toISOString(),
      });
    }
  }

  const { data, error } = await supabaseAdmin.from('budget_entries').insert(forecasts).select();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate budget cache
  cacheService.invalidatePattern('budget:*');

  return res.status(201).json({ 
    success: true, 
    forecasts: data, 
    message: `Generated ${forecasts.length} rolling forecast entries` 
  });
});

// Get budget variance analysis with drill-down
router.get('/variance-analysis', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, department, accountCode } = req.query as Record<string, string>;
  
  const cacheKey = `budget-variance:${period || 'all'}:${department || 'all'}:${accountCode || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get budget entries
  let budgetQuery = supabaseAdmin.from('budget_entries').select('*');
  if (period) budgetQuery = budgetQuery.eq('period', period);
  if (department) budgetQuery = budgetQuery.eq('department', department);
  if (accountCode) budgetQuery = budgetQuery.eq('account_code', accountCode);
  
  const { data: budgets, error: budgetError } = await budgetQuery;
  if (budgetError) return res.status(500).json({ error: budgetError.message });

  // Get actuals for the same period
  let actualsQuery = supabaseAdmin.from('budget_actual').select('*');
  if (period) actualsQuery = actualsQuery.eq('period', period);
  if (department) actualsQuery = actualsQuery.eq('department', department);
  if (accountCode) actualsQuery = actualsQuery.eq('account_code', accountCode);
  
  const { data: actuals, error: actualsError } = await actualsQuery;
  if (actualsError) return res.status(500).json({ error: actualsError.message });

  // Calculate variance for each account
  const varianceAnalysis = (budgets || []).map((budget: any) => {
    const actual = actuals?.find((a: any) => 
      a.account_code === budget.account_code && 
      a.period === budget.period &&
      a.department === budget.department
    );
    
    const actualAmount = actual ? Number(actual.actual_amount) : 0;
    const budgetAmount = Number(budget.budgeted_amount);
    const variance = actualAmount - budgetAmount;
    const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
    
    return {
      budgetId: budget.id,
      accountCode: budget.account_code,
      department: budget.department,
      period: budget.period,
      budgetedAmount: budgetAmount,
      actualAmount,
      variance,
      variancePercent,
      status: Math.abs(variancePercent) > 10 ? 'Significant Variance' : 'Within Tolerance',
      budgetType: budget.budget_type,
    };
  });

  // Summary statistics
  const summary = {
    totalBudget: varianceAnalysis.reduce((sum, v) => sum + v.budgetedAmount, 0),
    totalActual: varianceAnalysis.reduce((sum, v) => sum + v.actualAmount, 0),
    totalVariance: varianceAnalysis.reduce((sum, v) => sum + v.variance, 0),
    significantVariances: varianceAnalysis.filter(v => v.status === 'Significant Variance').length,
    totalAccounts: varianceAnalysis.length,
  };

  const result = {
    summary,
    details: varianceAnalysis,
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

// Submit budget for approval
router.post('/:id/submit-approval', authenticate, requirePermission('finance:budget:submit'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { submittedBy, notes } = req.body || {};
  
  const { data, error } = await supabaseAdmin
    .from('budget_entries')
    .update({
      status: 'Pending Approval',
      submitted_at: new Date().toISOString(),
      submitted_by: submittedBy || req.user?.id,
      submission_notes: notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate budget cache
  cacheService.invalidatePattern('budget:*');

  return res.json(data);
});

// Approve or reject budget
router.post('/:id/approval', authenticate, requirePermission('finance:budget:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { action, approvedBy, notes } = req.body || {};
  
  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be either "approve" or "reject"' });
  }

  const updateData: any = {
    status: action === 'approve' ? 'Approved' : 'Rejected',
    approved_by: approvedBy || req.user?.id,
    approved_at: new Date().toISOString(),
    approval_notes: notes,
  };

  const { data, error } = await supabaseAdmin
    .from('budget_entries')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate budget cache
  cacheService.invalidatePattern('budget:*');

  return res.json(data);
});

// Get pending approvals
router.get('/approvals/pending', authenticate, requirePermission('finance:budget:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('budget_entries')
    .select('*')
    .eq('status', 'Pending Approval')
    .order('submitted_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

export default router;
