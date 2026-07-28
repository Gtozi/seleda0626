import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';
import { currencyService } from '../services/currencyService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Multi-Property Financial Consolidation ─────────────────────
// Get consolidated financial data across properties
router.get('/consolidation', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, organizationId, baseCurrency } = req.query as Record<string, string>;
  
  const cacheKey = `multiproperty-consolidation:${period || 'all'}:${organizationId || 'all'}:${baseCurrency || 'ETB'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get all properties in the organization
  let propertiesQuery = supabaseAdmin.from('properties').select('*');
  if (organizationId) propertiesQuery = propertiesQuery.eq('organization_id', organizationId);
  
  const { data: properties, error: propertiesError } = await propertiesQuery;
  if (propertiesError) return res.status(500).json({ error: propertiesError.message });

  const consolidation = {
    period: period || 'All Periods',
    organizationId,
    baseCurrency: baseCurrency || 'ETB',
    properties: [],
    consolidated: {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
    },
  };

  // Aggregate financial data from each property
  for (const property of properties || []) {
    let propertyQuery = supabaseAdmin.from('financial_statements')
      .select('*')
      .eq('property_id', property.id);
    
    if (period) propertyQuery = propertyQuery.eq('period', period);
    
    const { data: statements, error: statementsError } = await propertyQuery;
    if (statementsError) continue;

    const propertyStatement = statements && statements[0] ? statements[0] : null;
    
    // Convert to base currency if needed
    const conversionRate = propertyStatement && propertyStatement.currency !== baseCurrency
      ? currencyService.getExchangeRate(propertyStatement.currency, baseCurrency || 'ETB')
      : 1;

    const propertyData = {
      propertyId: property.id,
      propertyName: property.name,
      currency: propertyStatement?.currency || 'ETB',
      conversionRate,
      revenue: propertyStatement ? Number(propertyStatement.revenue) * conversionRate : 0,
      expenses: propertyStatement ? Number(propertyStatement.expenses) * conversionRate : 0,
      netIncome: propertyStatement ? Number(propertyStatement.net_income) * conversionRate : 0,
      assets: propertyStatement ? Number(propertyStatement.total_assets) * conversionRate : 0,
      liabilities: propertyStatement ? Number(propertyStatement.total_liabilities) * conversionRate : 0,
      equity: propertyStatement ? Number(propertyStatement.total_equity) * conversionRate : 0,
    };

    consolidation.properties.push(propertyData);
    
    // Add to consolidated totals
    consolidation.consolidated.totalRevenue += propertyData.revenue;
    consolidation.consolidated.totalExpenses += propertyData.expenses;
    consolidation.consolidated.netIncome += propertyData.netIncome;
    consolidation.consolidated.totalAssets += propertyData.assets;
    consolidation.consolidated.totalLiabilities += propertyData.liabilities;
    consolidation.consolidated.totalEquity += propertyData.equity;
  }

  // Round consolidated totals
  consolidation.consolidated.totalRevenue = Math.round(consolidation.consolidated.totalRevenue * 100) / 100;
  consolidation.consolidated.totalExpenses = Math.round(consolidation.consolidated.totalExpenses * 100) / 100;
  consolidation.consolidated.netIncome = Math.round(consolidation.consolidated.netIncome * 100) / 100;
  consolidation.consolidated.totalAssets = Math.round(consolidation.consolidated.totalAssets * 100) / 100;
  consolidation.consolidated.totalLiabilities = Math.round(consolidation.consolidated.totalLiabilities * 100) / 100;
  consolidation.consolidated.totalEquity = Math.round(consolidation.consolidated.totalEquity * 100) / 100;

  cacheService.set(cacheKey, consolidation, 10 * 60 * 1000); // 10 minute TTL
  return res.json(consolidation);
});

// ── Inter-Company Transaction Elimination ──────────────────────────
// Record inter-company transaction for elimination
router.post('/intercompany/transactions', authenticate, requirePermission('finance:multiproperty:record'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    fromPropertyId,
    toPropertyId,
    transactionType,
    amount,
    currency,
    period,
    description,
    reference,
  } = req.body || {};
  
  if (!fromPropertyId || !toPropertyId || !transactionType || !amount || !period) {
    return res.status(400).json({ 
      error: 'fromPropertyId, toPropertyId, transactionType, amount, and period are required' 
    });
  }

  const { data, error } = await supabaseAdmin.from('intercompany_transactions').insert({
    from_property_id: fromPropertyId,
    to_property_id: toPropertyId,
    transaction_type: transactionType,
    amount: Number(amount),
    currency: currency || 'ETB',
    period,
    description,
    reference,
    status: 'Pending Elimination',
    recorded_by: req.user?.id,
    recorded_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate multi-property cache
  cacheService.invalidatePattern('multiproperty:*');

  return res.status(201).json(data);
});

// Get inter-company transactions for elimination
router.get('/intercompany/transactions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, status, organizationId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('intercompany_transactions')
    .select('*, from_properties(name), to_properties(name)')
    .order('recorded_at', { ascending: false });
  
  if (period) q = q.eq('period', period);
  if (status) q = q.eq('status', status);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// Perform inter-company elimination
router.post('/intercompany/eliminate', authenticate, requirePermission('finance:multiproperty:eliminate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, organizationId } = req.body || {};
  
  if (!period) {
    return res.status(400).json({ error: 'period is required' });
  }

  // Get pending inter-company transactions for the period
  const { data: transactions, error: transactionsError } = await supabaseAdmin
    .from('intercompany_transactions')
    .select('*')
    .eq('period', period)
    .eq('status', 'Pending Elimination');

  if (transactionsError) return res.status(500).json({ error: transactionsError.message });

  const eliminations = [];
  let totalEliminated = 0;

  for (const transaction of transactions || []) {
    // Create elimination entry
    const { data: elimination, error: eliminationError } = await supabaseAdmin
      .from('elimination_entries')
      .insert({
        intercompany_transaction_id: transaction.id,
        from_property_id: transaction.from_property_id,
        to_property_id: transaction.to_property_id,
        amount: transaction.amount,
        currency: transaction.currency,
        period,
        elimination_date: new Date().toISOString().split('T')[0],
        eliminated_by: req.user?.id,
      })
      .select()
      .single();

    if (eliminationError) continue;

    // Mark transaction as eliminated
    await supabaseAdmin
      .from('intercompany_transactions')
      .update({ status: 'Eliminated', eliminated_at: new Date().toISOString() })
      .eq('id', transaction.id);

    eliminations.push(elimination);
    totalEliminated += Number(transaction.amount);
  }

  // Invalidate multi-property cache
  cacheService.invalidatePattern('multiproperty:*');

  return res.json({
    success: true,
    period,
    eliminationsCount: eliminations.length,
    totalEliminated: Math.round(totalEliminated * 100) / 100,
    eliminations,
  });
});

// ── Consolidated Financial Statements ─────────────────────────────
// Generate consolidated balance sheet
router.get('/statements/balance-sheet', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, organizationId, baseCurrency } = req.query as Record<string, string>;
  
  const cacheKey = `consolidated-balance-sheet:${period || 'all'}:${organizationId || 'all'}:${baseCurrency || 'ETB'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get consolidation data
  const consolidationData = await getConsolidatedData(period, organizationId, baseCurrency);
  
  // Build consolidated balance sheet
  const balanceSheet = {
    period: period || 'All Periods',
    organizationId,
    baseCurrency: baseCurrency || 'ETB',
    generatedAt: new Date().toISOString(),
    assets: {
      currentAssets: 0,
      nonCurrentAssets: 0,
      totalAssets: consolidationData.consolidated.totalAssets,
      breakdown: [],
    },
    liabilities: {
      currentLiabilities: 0,
      nonCurrentLiabilities: 0,
      totalLiabilities: consolidationData.consolidated.totalLiabilities,
      breakdown: [],
    },
    equity: {
      totalEquity: consolidationData.consolidated.totalEquity,
      breakdown: [],
    },
    intercompanyEliminations: await getIntercompanyEliminations(period, organizationId),
  };

  cacheService.set(cacheKey, balanceSheet, 10 * 60 * 1000);
  return res.json(balanceSheet);
});

// Generate consolidated income statement
router.get('/statements/income-statement', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, organizationId, baseCurrency } = req.query as Record<string, string>;
  
  const cacheKey = `consolidated-income-statement:${period || 'all'}:${organizationId || 'all'}:${baseCurrency || 'ETB'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const consolidationData = await getConsolidatedData(period, organizationId, baseCurrency);
  
  const incomeStatement = {
    period: period || 'All Periods',
    organizationId,
    baseCurrency: baseCurrency || 'ETB',
    generatedAt: new Date().toISOString(),
    revenue: consolidationData.consolidated.totalRevenue,
    operatingExpenses: consolidationData.consolidated.totalExpenses,
    grossProfit: consolidationData.consolidated.totalRevenue,
    netIncome: consolidationData.consolidated.netIncome,
    profitMargin: consolidationData.consolidated.totalRevenue > 0 
      ? (consolidationData.consolidated.netIncome / consolidationData.consolidated.totalRevenue) * 100 
      : 0,
    byProperty: consolidationData.properties.map(p => ({
      propertyName: p.propertyName,
      revenue: p.revenue,
      expenses: p.expenses,
      netIncome: p.netIncome,
      profitMargin: p.revenue > 0 ? (p.netIncome / p.revenue) * 100 : 0,
    })),
  };

  cacheService.set(cacheKey, incomeStatement, 10 * 60 * 1000);
  return res.json(incomeStatement);
});

// ── Cross-Property Reporting ────────────────────────────────────────
// Get cross-property comparison report
router.get('/comparison', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, metrics } = req.query as Record<string, string>;
  
  const cacheKey = `cross-property-comparison:${period || 'all'}:${metrics || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const consolidationData = await getConsolidatedData(period, null, null);
  
  // Calculate metrics for each property
  const comparison = consolidationData.properties.map(property => {
    const profitMargin = property.revenue > 0 ? (property.netIncome / property.revenue) * 100 : 0;
    const assetTurnover = property.assets > 0 ? property.revenue / property.assets : 0;
    const liabilityRatio = property.assets > 0 ? property.liabilities / property.assets : 0;
    
    return {
      ...property,
      profitMargin: Math.round(profitMargin * 100) / 100,
      assetTurnover: Math.round(assetTurnover * 100) / 100,
      liabilityRatio: Math.round(liabilityRatio * 100) / 100,
      efficiency: profitMargin * assetTurnover,
    };
  });

  const result = {
    period: period || 'All Periods',
    properties: comparison,
    rankings: {
      byRevenue: [...comparison].sort((a, b) => b.revenue - a.revenue),
      byProfitMargin: [...comparison].sort((a, b) => b.profitMargin - a.profitMargin),
      byEfficiency: [...comparison].sort((a, b) => b.efficiency - a.efficiency),
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Helper function to get consolidated data
async function getConsolidatedData(period?: string, organizationId?: string, baseCurrency?: string) {
  const baseCurr = baseCurrency || 'ETB';
  
  let propertiesQuery = supabaseAdmin.from('properties').select('*');
  if (organizationId) propertiesQuery = propertiesQuery.eq('organization_id', organizationId);
  
  const { data: properties } = await propertiesQuery;
  
  const consolidation = {
    properties: [],
    consolidated: {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
    },
  };

  for (const property of properties || []) {
    let propertyQuery = supabaseAdmin.from('financial_statements')
      .select('*')
      .eq('property_id', property.id);
    
    if (period) propertyQuery = propertyQuery.eq('period', period);
    
    const { data: statements } = await propertyQuery;
    const propertyStatement = statements && statements[0] ? statements[0] : null;
    
    const conversionRate = propertyStatement && propertyStatement.currency !== baseCurr
      ? currencyService.getExchangeRate(propertyStatement.currency, baseCurr)
      : 1;

    const propertyData = {
      propertyId: property.id,
      propertyName: property.name,
      currency: propertyStatement?.currency || 'ETB',
      conversionRate,
      revenue: propertyStatement ? Number(propertyStatement.revenue) * conversionRate : 0,
      expenses: propertyStatement ? Number(propertyStatement.expenses) * conversionRate : 0,
      netIncome: propertyStatement ? Number(propertyStatement.net_income) * conversionRate : 0,
      assets: propertyStatement ? Number(propertyStatement.total_assets) * conversionRate : 0,
      liabilities: propertyStatement ? Number(propertyStatement.total_liabilities) * conversionRate : 0,
      equity: propertyStatement ? Number(propertyStatement.total_equity) * conversionRate : 0,
    };

    consolidation.properties.push(propertyData);
    consolidation.consolidated.totalRevenue += propertyData.revenue;
    consolidation.consolidated.totalExpenses += propertyData.expenses;
    consolidation.consolidated.netIncome += propertyData.netIncome;
    consolidation.consolidated.totalAssets += propertyData.assets;
    consolidation.consolidated.totalLiabilities += propertyData.liabilities;
    consolidation.consolidated.totalEquity += propertyData.equity;
  }

  return consolidation;
}

// Helper function to get intercompany eliminations
async function getIntercompanyEliminations(period?: string, organizationId?: string) {
  let q = supabaseAdmin
    .from('elimination_entries')
    .select('*, intercompany_transactions(*)')
    .order('elimination_date', { ascending: false });
  
  if (period) q = q.eq('period', period);
  
  const { data } = await q;
  return data || [];
}

export default router;
