import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';

const router = Router();

// ═══════════════════════════════════════════════════════════
// ENHANCED FORECAST MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════

// Save forecast snapshot
router.post('/', authenticate, requirePermission('reports:view'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const {
    forecast_name, forecast_type, horizon_days, demand_multiplier,
    comp_pricing_strategy, pricing_strategy, promo_active,
    forecast_data, avg_occupancy_rate, total_revenue, avg_adr, avg_revpar,
    property_id, notes
  } = req.body;

  if (!forecast_data || !horizon_days) {
    return res.status(400).json({ error: 'forecast_data and horizon_days are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('forecast_snapshots')
    .insert({
      forecast_name,
      forecast_type: forecast_type || 'occupancy',
      horizon_days,
      demand_multiplier: demand_multiplier || 1.0,
      comp_pricing_strategy,
      pricing_strategy,
      promo_active: promo_active || false,
      forecast_data,
      avg_occupancy_rate,
      total_revenue,
      avg_adr,
      avg_revpar,
      property_id: property_id || null,
      notes,
      created_by: req.user?.id || null
    })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Also save daily performance data
  if (forecast_data && Array.isArray(forecast_data)) {
    const dailyRecords = forecast_data.map((day: any) => ({
      forecast_snapshot_id: data.id,
      property_id: property_id || null,
      forecast_date: day.date,
      forecast_occupancy_rate: day.simulatedOccupancyRate || day.occupancyRate,
      forecast_revenue: day.simulatedRevenue || day.revenue,
      forecast_adr: day.simulatedADR || day.adr,
      forecast_revpar: day.simulatedRevPAR || day.revPAR
    }));

    const { error: dailyError } = await supabaseAdmin
      .from('forecast_daily_performance')
      .insert(dailyRecords);

    if (dailyError) {
      console.error('Failed to save daily forecast data:', dailyError);
    }
  }

  await writeAuditEvent({
    req, user: req.user!,
    action: 'forecast.created',
    entityType: 'ForecastSnapshot',
    entityId: data.id,
    module: 'forecasting',
    details: { forecast_name, forecast_type, horizon_days }
  });

  res.json({ forecast: data });
});

// Get forecast snapshots
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { property_id, forecast_type, limit = 20 } = req.query;

  let query = supabaseAdmin
    .from('forecast_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (property_id) query = query.eq('property_id', property_id);
  if (forecast_type) query = query.eq('forecast_type', forecast_type);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ forecasts: data || [] });
});

// Get specific forecast with daily data
router.get('/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;

  const [forecastResult, dailyResult] = await Promise.all([
    supabaseAdmin.from('forecast_snapshots').select('*').eq('id', id).single(),
    supabaseAdmin.from('forecast_daily_performance').select('*').eq('forecast_snapshot_id', id).order('forecast_date')
  ]);

  if (forecastResult.error) return res.status(500).json({ error: forecastResult.error.message });

  res.json({
    forecast: forecastResult.data,
    dailyData: dailyResult.data || []
  });
});

// Update forecast with actuals (for accuracy tracking)
router.post('/:id/actuals', authenticate, requirePermission('reports:view'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { actuals } = req.body; // Array of { date, actual_occupancy_rate, actual_revenue, actual_adr, actual_revpar }

  if (!actuals || !Array.isArray(actuals)) {
    return res.status(400).json({ error: 'actuals array is required' });
  }

  for (const actual of actuals) {
    const { date, actual_occupancy_rate, actual_revenue, actual_adr, actual_revpar } = actual;

    // Get forecasted values for this date
    const { data: forecastData } = await supabaseAdmin
      .from('forecast_daily_performance')
      .select('*')
      .eq('forecast_snapshot_id', id)
      .eq('forecast_date', date)
      .single();

    if (forecastData) {
      // Calculate variance
      const occupancy_variance = forecastData.forecast_occupancy_rate
        ? ((actual_occupancy_rate - forecastData.forecast_occupancy_rate) / forecastData.forecast_occupancy_rate) * 100
        : null;
      const revenue_variance = forecastData.forecast_revenue
        ? ((actual_revenue - forecastData.forecast_revenue) / forecastData.forecast_revenue) * 100
        : null;

      // Update with actuals
      await supabaseAdmin
        .from('forecast_daily_performance')
        .update({
          actual_occupancy_rate,
          actual_revenue,
          actual_adr,
          actual_revpar,
          occupancy_variance_pct: occupancy_variance,
          revenue_variance_pct: revenue_variance
        })
        .eq('id', forecastData.id);
    }
  }

  // Recalculate forecast accuracy
  await supabaseAdmin.rpc('calculate_forecast_accuracy_v2', { p_forecast_id: id });

  await writeAuditEvent({
    req, user: req.user!,
    action: 'forecast.actuals_updated',
    entityType: 'ForecastSnapshot',
    entityId: id,
    module: 'forecasting',
    details: { actuals_count: actuals.length }
  });

  res.json({ success: true });
});

export default router;
