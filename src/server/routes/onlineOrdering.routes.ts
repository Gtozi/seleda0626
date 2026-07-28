import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Branded Online Ordering Platform ───────────────────────────────
// Create online order
router.post('/orders', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    customerInfo,
    items,
    deliveryType, // 'pickup' or 'delivery'
    deliveryAddress,
    scheduledTime,
    paymentMethod,
    specialInstructions,
  } = req.body || {};
  
  if (!restaurantId || !customerInfo || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'restaurantId, customerInfo, and items array are required' });
  }

  const orderNumber = `ONL-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT
  const deliveryFee = deliveryType === 'delivery' ? 50 : 0;
  const total = subtotal + tax + deliveryFee;

  const { data, error } = await supabaseAdmin.from('online_orders').insert({
    order_number: orderNumber,
    restaurant_id: restaurantId,
    customer_info: customerInfo,
    items,
    delivery_type: deliveryType,
    delivery_address: deliveryAddress,
    scheduled_time: scheduledTime,
    payment_method: paymentMethod,
    special_instructions: specialInstructions,
    subtotal,
    tax,
    delivery_fee: deliveryFee,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('online-orders:*');

  return res.status(201).json(data);
});

// Get online orders for restaurant
router.get('/orders/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, date } = req.query as Record<string, string>;
  
  const cacheKey = `online-orders:${req.params.restaurantId}:${status || 'all'}:${date || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('online_orders')
    .select('*')
    .eq('restaurant_id', req.params.restaurantId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (date) q = q.like('created_at', `${date}%`);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    orders: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(o => o.status === 'pending').length,
      preparing: (data || []).filter(o => o.status === 'preparing').length,
      ready: (data || []).filter(o => o.status === 'ready').length,
      delivered: (data || []).filter(o => o.status === 'delivered').length,
    },
  };

  cacheService.set(cacheKey, result, 30 * 1000); // 30 second TTL
  return res.json(result);
});

// Update order status
router.put('/orders/:id/status', authenticate, requirePermission('fb:online:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.body || {};
  
  if (!status || !['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabaseAdmin
    .from('online_orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('online-orders:*');

  return res.json(data);
});

// ── Third-Party Delivery Platform Integration ─────────────────────
// Register delivery platform
router.post('/delivery-platforms', authenticate, requirePermission('fb:delivery:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    platformName,
    apiKey,
    commissionRate,
    supportedAreas,
  } = req.body || {};
  
  if (!platformName || !apiKey) {
    return res.status(400).json({ error: 'platformName and apiKey are required' });
  }

  const { data, error } = await supabaseAdmin.from('delivery_platforms').insert({
    platform_name: platformName,
    api_key: apiKey,
    commission_rate: commissionRate || 15, // 15% default
    supported_areas: supportedAreas || [],
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('delivery-platforms:*');

  return res.status(201).json(data);
});

// Sync order to delivery platform
router.post('/delivery-platforms/:platformId/sync-order', authenticate, requirePermission('fb:delivery:sync'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { orderId } = req.body || {};
  
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  // Get order details
  const { data: order } = await supabaseAdmin
    .from('online_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Get platform details
  const { data: platform } = await supabaseAdmin
    .from('delivery_platforms')
    .select('*')
    .eq('id', req.params.platformId)
    .single();

  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  // Simulate sync to delivery platform
  const platformOrderId = `${platform.platform_name}-${order.order_number}`;
  
  const { data, error } = await supabaseAdmin.from('delivery_syncs').insert({
    platform_id: req.params.platformId,
    order_id: orderId,
    platform_order_id: platformOrderId,
    sync_status: 'synced',
    synced_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('delivery-syncs:*');

  return res.status(201).json({
    success: true,
    platformOrderId,
    sync: data,
  });
});

// Get delivery sync status
router.get('/delivery-syncs/:orderId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('delivery_syncs')
    .select('*, delivery_platforms(name)')
    .eq('order_id', req.params.orderId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// ── Predictive Sales Forecasting ───────────────────────────────────
// Generate predictive sales forecast
router.post('/sales-forecast', authenticate, requirePermission('fb:analytics:forecast'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    forecastDays,
    historicalDays,
    includeSeasonality,
    includeEvents,
  } = req.body || {};
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required' });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (historicalDays || 90));

  // Get historical sales data
  const { data: historicalSales } = await supabaseAdmin
    .from('pos_transactions')
    .select('amount, transaction_date')
    .eq('restaurant_id', restaurantId)
    .gte('transaction_date', startDate.toISOString());

  // Calculate daily averages by day of week
  const salesByDayOfWeek: Record<number, number[]> = {};
  (historicalSales || []).forEach((sale: any) => {
    const dayOfWeek = new Date(sale.transaction_date).getDay();
    if (!salesByDayOfWeek[dayOfWeek]) salesByDayOfWeek[dayOfWeek] = [];
    salesByDayOfWeek[dayOfWeek].push(sale.amount);
  });

  const avgSalesByDay: Record<number, number> = {};
  Object.keys(salesByDayOfWeek).forEach(day => {
    const values = salesByDayOfWeek[Number(day)];
    avgSalesByDay[Number(day)] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Calculate trend (simple linear regression)
  const trend = calculateTrend(historicalSales || []);

  // Generate forecast
  const forecast = [];
  const currentDate = new Date();

  for (let i = 1; i <= (forecastDays || 30); i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dayOfWeek = forecastDate.getDay();
    
    let forecastedSales = avgSalesByDay[dayOfWeek] || 0;
    
    // Apply trend
    forecastedSales += trend.slope * i;
    
    // Apply seasonality if enabled
    if (includeSeasonality) {
      const month = forecastDate.getMonth();
      const seasonalFactor = getSeasonalFactor(month);
      forecastedSales *= seasonalFactor;
    }

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      dayOfWeek,
      forecastedSales: Math.max(0, Math.round(forecastedSales)),
      confidence: 0.85, // Placeholder confidence
      factors: {
        base: avgSalesByDay[dayOfWeek] || 0,
        trend: trend.slope * i,
        seasonality: includeSeasonality ? getSeasonalFactor(forecastDate.getMonth()) : 1,
      },
    });
  }

  // Save forecast
  const { data, error } = await supabaseAdmin.from('sales_forecasts').insert({
    restaurant_id: restaurantId,
    forecast_days: forecastDays || 30,
    historical_days: historicalDays || 90,
    forecast_data: forecast,
    trend_slope: trend.slope,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('sales-forecasts:*');

  return res.status(201).json({
    success: true,
    forecast: data,
    summary: {
      totalForecastedRevenue: forecast.reduce((sum, f) => sum + f.forecastedSales, 0),
      avgDailyRevenue: forecast.reduce((sum, f) => sum + f.forecastedSales, 0) / forecast.length,
      trendDirection: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
    },
  });
});

function calculateTrend(sales: any[]) {
  if (sales.length < 2) return { slope: 0, intercept: 0 };

  const n = sales.length;
  const dailyTotals: Record<string, number> = {};
  
  sales.forEach(sale => {
    const date = sale.transaction_date.split('T')[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + sale.amount;
  });

  const dates = Object.keys(dailyTotals).sort();
  const values = dates.map(d => dailyTotals[d]);

  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function getSeasonalFactor(month: number): number {
  // Simplified seasonal factors (would be based on actual historical data)
  const factors = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9]; // Peak in summer
  return factors[month];
}

// ── Real-Time Dashboards with Drill-Down ────────────────────────────
// Get real-time dashboard data
router.get('/dashboard/realtime/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `dashboard-realtime:${req.params.restaurantId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const today = new Date().toISOString().split('T')[0];

  // Get today's sales
  const { data: todaySales } = await supabaseAdmin
    .from('pos_transactions')
    .select('amount')
    .eq('restaurant_id', req.params.restaurantId)
    .like('transaction_date', `${today}%`);

  // Get active orders
  const { data: activeOrders } = await supabaseAdmin
    .from('online_orders')
    .select('*')
    .eq('restaurant_id', req.params.restaurantId)
    .in('status', ['pending', 'preparing']);

  // Get table status
  const { data: tables } = await supabaseAdmin
    .from('restaurant_tables')
    .select('status')
    .eq('restaurant_id', req.params.restaurantId);

  const dashboard = {
    restaurantId: req.params.restaurantId,
    date: today,
    sales: {
      todayRevenue: (todaySales || []).reduce((sum, s) => sum + s.amount, 0),
      orderCount: (todaySales || []).length,
      avgOrderValue: (todaySales || []).length > 0 
        ? (todaySales || []).reduce((sum, s) => sum + s.amount, 0) / (todaySales || []).length 
        : 0,
    },
    orders: {
      pending: activeOrders?.filter(o => o.status === 'pending').length || 0,
      preparing: activeOrders?.filter(o => o.status === 'preparing').length || 0,
      total: activeOrders?.length || 0,
    },
    tables: {
      total: tables?.length || 0,
      occupied: tables?.filter(t => t.status === 'occupied').length || 0,
      available: tables?.filter(t => t.status === 'available').length || 0,
    },
    lastUpdated: new Date().toISOString(),
  };

  cacheService.set(cacheKey, dashboard, 15 * 1000); // 15 second TTL
  return res.json(dashboard);
});

// Get drill-down data for specific metric
router.get('/dashboard/drilldown/:restaurantId/:metric', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { metric, period } = req.query as Record<string, string>;
  
  const cacheKey = `dashboard-drilldown:${req.params.restaurantId}:${req.params.metric}:${period || 'today'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let drilldownData;

  switch (req.params.metric) {
    case 'sales':
      drilldownData = await getSalesDrilldown(req.params.restaurantId, period || 'today');
      break;
    case 'orders':
      drilldownData = await getOrdersDrilldown(req.params.restaurantId, period || 'today');
      break;
    case 'tables':
      drilldownData = await getTablesDrilldown(req.params.restaurantId);
      break;
    default:
      return res.status(400).json({ error: 'Invalid metric' });
  }

  cacheService.set(cacheKey, drilldownData, 30 * 1000);
  return res.json(drilldownData);
});

async function getSalesDrilldown(restaurantId: string, period: string) {
  const datePattern = period === 'today' 
    ? new Date().toISOString().split('T')[0]
    : period;

  const { data } = await supabaseAdmin
    .from('pos_transactions')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .like('transaction_date', `${datePattern}%`);

  return {
    metric: 'sales',
    period,
    transactions: data || [],
    summary: {
      total: (data || []).reduce((sum, t) => sum + t.amount, 0),
      count: (data || []).length,
      byPaymentMethod: groupByPaymentMethod(data || []),
    },
  };
}

async function getOrdersDrilldown(restaurantId: string, period: string) {
  const datePattern = period === 'today' 
    ? new Date().toISOString().split('T')[0]
    : period;

  const { data } = await supabaseAdmin
    .from('online_orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .like('created_at', `${datePattern}%`);

  return {
    metric: 'orders',
    period,
    orders: data || [],
    summary: {
      total: (data || []).length,
      byStatus: groupByStatus(data || []),
      byType: groupByDeliveryType(data || []),
    },
  };
}

async function getTablesDrilldown(restaurantId: string) {
  const { data } = await supabaseAdmin
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId);

  return {
    metric: 'tables',
    tables: data || [],
    summary: {
      total: (data || []).length,
      byStatus: groupByTableStatus(data || []),
      bySection: groupBySection(data || []),
    },
  };
}

function groupByPaymentMethod(transactions: any[]) {
  return transactions.reduce((acc: any, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + t.amount;
    return acc;
  }, {});
}

function groupByStatus(orders: any[]) {
  return orders.reduce((acc: any, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
}

function groupByDeliveryType(orders: any[]) {
  return orders.reduce((acc: any, o) => {
    acc[o.delivery_type] = (acc[o.delivery_type] || 0) + 1;
    return acc;
  }, {});
}

function groupByTableStatus(tables: any[]) {
  return tables.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
}

function groupBySection(tables: any[]) {
  return tables.reduce((acc: any, t) => {
    acc[t.section || 'unassigned'] = (acc[t.section || 'unassigned'] || 0) + 1;
    return acc;
  }, {});
}

// ── Custom Report Builder ───────────────────────────────────────────
// Save custom report configuration
router.post('/reports/custom', authenticate, requirePermission('fb:reports:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    reportName,
    metrics,
    filters,
    groupBy,
    schedule,
  } = req.body || {};
  
  if (!restaurantId || !reportName || !metrics) {
    return res.status(400).json({ error: 'restaurantId, reportName, and metrics are required' });
  }

  const { data, error } = await supabaseAdmin.from('custom_reports').insert({
    restaurant_id: restaurantId,
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
router.post('/reports/generate', authenticate, requirePermission('fb:reports:generate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reportId, startDate, endDate } = req.body || {};
  
  if (!reportId) {
    return res.status(400).json({ error: 'reportId is required' });
  }

  // Get report configuration
  const { data: report } = await supabaseAdmin
    .from('custom_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Generate report based on configuration
  const reportData = await generateCustomReport(report, startDate, endDate);

  return res.json({
    report,
    data: reportData,
    generatedAt: new Date().toISOString(),
  });
});

async function generateCustomReport(report: any, startDate?: string, endDate?: string) {
  // This would implement the actual report generation logic
  // For now, return a placeholder
  return {
    message: 'Custom report generated',
    metrics: report.metrics,
    filters: report.filters,
  };
}

// ── Benchmarking Against Industry Standards ─────────────────────
// Get industry benchmarks
router.get('/benchmarks/:restaurantId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `benchmarks:${req.params.restaurantId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Industry standards (simplified)
  const industryStandards = {
    foodCostPercent: 28,
    laborCostPercent: 30,
    averageCheck: 45,
    tableTurnTime: 75, // minutes
    customerSatisfaction: 4.5, // out of 5
  };

  // Get restaurant actuals
  const actuals = await getRestaurantActuals(req.params.restaurantId, period || 'month');

  const comparison = {
    restaurantId: req.params.restaurantId,
    period: period || 'month',
    industryStandards,
    actuals,
    variance: {
      foodCostPercent: actuals.foodCostPercent - industryStandards.foodCostPercent,
      laborCostPercent: actuals.laborCostPercent - industryStandards.laborCostPercent,
      averageCheck: actuals.averageCheck - industryStandards.averageCheck,
      tableTurnTime: actuals.tableTurnTime - industryStandards.tableTurnTime,
      customerSatisfaction: actuals.customerSatisfaction - industryStandards.customerSatisfaction,
    },
    performance: {
      foodCostPercent: actuals.foodCostPercent <= industryStandards.foodCostPercent * 1.05 ? 'good' : 'needs improvement',
      laborCostPercent: actuals.laborCostPercent <= industryStandards.laborCostPercent * 1.1 ? 'good' : 'needs improvement',
      averageCheck: actuals.averageCheck >= industryStandards.averageCheck * 0.9 ? 'good' : 'needs improvement',
    },
  };

  cacheService.set(cacheKey, comparison, 60 * 60 * 1000); // 1 hour TTL
  return res.json(comparison);
});

async function getRestaurantActuals(restaurantId: string, period: string) {
  // This would calculate actual metrics from database
  // For now, return placeholder values
  return {
    foodCostPercent: 30,
    laborCostPercent: 32,
    averageCheck: 42,
    tableTurnTime: 80,
    customerSatisfaction: 4.3,
  };
}

export default router;
