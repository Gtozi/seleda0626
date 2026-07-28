import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Fixed Assets ───────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { category, status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fixed_assets').select('*').order('purchase_date', { ascending: false });
  if (category) q = q.eq('asset_category', category);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/', authenticate, requirePermission('finance:asset:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const {
    assetCode,
    assetName,
    assetCategory,
    description,
    location,
    purchaseDate,
    purchaseCost,
    salvageValue,
    usefulLifeYears,
    depreciationMethod,
  } = req.body || {};
  if (!assetCode || !assetName || !assetCategory || !purchaseDate || !purchaseCost || !usefulLifeYears) {
    return res.status(400).json({ error: 'assetCode, assetName, assetCategory, purchaseDate, purchaseCost and usefulLifeYears are required' });
  }

  const netBookValue = Number(purchaseCost) - Number(salvageValue || 0);

  const { data, error } = await supabaseAdmin.from('fixed_assets').insert({
    asset_code: assetCode,
    asset_name: assetName,
    asset_category: assetCategory,
    description,
    location,
    purchase_date: purchaseDate,
    purchase_cost: Number(purchaseCost),
    salvage_value: Number(salvageValue) || 0,
    useful_life_years: Number(usefulLifeYears),
    depreciation_method: depreciationMethod || 'Straight Line',
    net_book_value: netBookValue,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.post('/:id/calculate-depreciation', authenticate, requirePermission('finance:asset:depreciate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { fiscalYear } = req.body || {};
  if (!fiscalYear) {
    return res.status(400).json({ error: 'fiscalYear is required' });
  }

  const { data, error } = await supabaseAdmin.rpc('calculate_depreciation', {
    p_asset_id: req.params.id,
    p_fiscal_year: Number(fiscalYear),
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

router.post('/:id/dispose', authenticate, requirePermission('finance:asset:dispose'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { disposalDate, disposalValue } = req.body || {};
  if (!disposalDate) {
    return res.status(400).json({ error: 'disposalDate is required' });
  }

  const { data, error } = await supabaseAdmin.rpc('dispose_asset', {
    p_asset_id: req.params.id,
    p_disposal_date: disposalDate,
    p_disposal_value: Number(disposalValue) || 0,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

// ── Depreciation Schedules ───────────────────────────────────────
router.get('/:id/depreciation-schedule', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('depreciation_schedules')
    .select('*')
    .eq('asset_id', req.params.id)
    .order('fiscal_year', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// Generate full depreciation schedule for an asset
router.post('/:id/generate-schedule', authenticate, requirePermission('finance:asset:depreciate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: asset, error: assetError } = await supabaseAdmin
    .from('fixed_assets')
    .select('*')
    .eq('id', req.params.id)
    .single();
    
  if (assetError || !asset) {
    return res.status(404).json({ error: assetError?.message || 'Asset not found' });
  }

  const purchaseCost = Number(asset.purchase_cost);
  const salvageValue = Number(asset.salvage_value) || 0;
  const usefulLife = Number(asset.useful_life_years);
  const method = asset.depreciation_method || 'Straight Line';
  const purchaseYear = new Date(asset.purchase_date).getFullYear();
  
  const schedule = [];
  let accumulatedDepreciation = 0;
  let netBookValue = purchaseCost;

  for (let year = 0; year <= usefulLife; year++) {
    const fiscalYear = purchaseYear + year;
    let depreciationExpense = 0;

    if (year < usefulLife) {
      switch (method) {
        case 'Straight Line':
          depreciationExpense = (purchaseCost - salvageValue) / usefulLife;
          break;
        case 'Double Declining Balance':
          const rate = 2 / usefulLife;
          depreciationExpense = Math.min(netBookValue * rate, netBookValue - salvageValue);
          break;
        case 'Sum of Years Digits':
          const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
          depreciationExpense = (purchaseCost - salvageValue) * (usefulLife - year) / sumOfYears;
          break;
        default:
          depreciationExpense = (purchaseCost - salvageValue) / usefulLife;
      }
    } else {
      // Final year - ensure we don't depreciate below salvage value
      depreciationExpense = Math.max(0, netBookValue - salvageValue);
    }

    accumulatedDepreciation += depreciationExpense;
    netBookValue = purchaseCost - accumulatedDepreciation;

    schedule.push({
      asset_id: req.params.id,
      fiscal_year: fiscalYear,
      depreciation_expense: Math.round(depreciationExpense * 100) / 100,
      accumulated_depreciation: Math.round(accumulatedDepreciation * 100) / 100,
      net_book_value: Math.round(netBookValue * 100) / 100,
      method,
    });
  }

  // Insert or update schedule
  for (const entry of schedule) {
    await supabaseAdmin
      .from('depreciation_schedules')
      .upsert(entry, { onConflict: 'asset_id,fiscal_year' });
  }

  return res.json({ 
    success: true, 
    schedule,
    message: `Generated ${schedule.length} year depreciation schedule using ${method} method`
  });
});

// Get depreciation summary across all assets
router.get('/summary/depreciation', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { fiscalYear } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('depreciation_schedules')
    .select('*, fixed_assets(asset_name, asset_category)');
    
  if (fiscalYear) {
    q = q.eq('fiscal_year', Number(fiscalYear));
  }
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  
  // Calculate summary
  const summary = (data || []).reduce((acc: any, row: any) => ({
    totalDepreciationExpense: acc.totalDepreciationExpense + Number(row.depreciation_expense),
    totalAccumulatedDepreciation: acc.totalAccumulatedDepreciation + Number(row.accumulated_depreciation),
    totalNetBookValue: acc.totalNetBookValue + Number(row.net_book_value),
    assetCount: acc.assetCount + 1,
  }), {
    totalDepreciationExpense: 0,
    totalAccumulatedDepreciation: 0,
    totalNetBookValue: 0,
    assetCount: 0,
  });
  
  return res.json({
    summary,
    details: data || [],
  });
});

export default router;
