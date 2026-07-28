import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Staff Management with Labor Forecasting ───────────────────────
// Create staff schedule
router.post('/staff/schedule', authenticate, requirePermission('fb:staff:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    staffId,
    shiftDate,
    startTime,
    endTime,
    position,
    section,
  } = req.body || {};
  
  if (!restaurantId || !staffId || !shiftDate || !startTime || !endTime) {
    return res.status(400).json({ error: 'restaurantId, staffId, shiftDate, startTime, and endTime are required' });
  }

  const { data, error } = await supabaseAdmin.from('staff_schedules').insert({
    restaurant_id: restaurantId,
    staff_id: staffId,
    shift_date: shiftDate,
    start_time: startTime,
    end_time: endTime,
    position,
    section,
    status: 'scheduled',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('staff:*');

  return res.status(201).json(data);
});

// Generate labor forecast
router.post('/staff/labor-forecast', authenticate, requirePermission('fb:staff:forecast'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, startDate, days, historicalDays } = req.body || {};
  
  if (!restaurantId || !startDate || !days) {
    return res.status(400).json({ error: 'restaurantId, startDate, and days are required' });
  }

  // Get historical sales data for forecasting
  const historicalStart = new Date(startDate);
  historicalStart.setDate(historicalStart.getDate() - (historicalDays || 30));

  const { data: historicalSales } = await supabaseAdmin
    .from('pos_transactions')
    .select('amount, transaction_date')
    .eq('restaurant_id', restaurantId)
    .gte('transaction_date', historicalStart.toISOString())
    .lt('transaction_date', startDate);

  // Calculate average daily sales by day of week
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

  // Generate forecast
  const forecast = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const dayOfWeek = currentDate.getDay();
    const forecastedSales = avgSalesByDay[dayOfWeek] || 0;
    
    // Calculate required staff based on sales (simplified: $500 per staff hour)
    const requiredStaffHours = Math.ceil(forecastedSales / 500);
    const requiredStaff = Math.ceil(requiredStaffHours / 8); // 8-hour shifts

    forecast.push({
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek,
      forecastedSales: Math.round(forecastedSales),
      requiredStaffHours,
      requiredStaff,
      recommendedPositions: {
        servers: Math.ceil(requiredStaff * 0.6),
        kitchen: Math.ceil(requiredStaff * 0.3),
        support: Math.ceil(requiredStaff * 0.1),
      },
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Save forecast
  const { data, error } = await supabaseAdmin.from('labor_forecasts').insert({
    restaurant_id: restaurantId,
    start_date: startDate,
    forecast_days: days,
    historical_days: historicalDays || 30,
    forecast_data: forecast,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('labor-forecasts:*');

  return res.status(201).json({
    success: true,
    forecast: data,
    summary: {
      totalStaffHours: forecast.reduce((sum, f) => sum + f.requiredStaffHours, 0),
      avgStaffPerDay: forecast.reduce((sum, f) => sum + f.requiredStaff, 0) / forecast.length,
    },
  });
});

// ── Server Performance Metrics ─────────────────────────────────────
// Get server performance metrics
router.get('/staff/server-metrics', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, staffId, period } = req.query as Record<string, string>;
  
  const cacheKey = `server-metrics:${restaurantId || 'all'}:${staffId || 'all'}:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('staff_performance')
    .select('*')
    .order('performance_date', { ascending: false });
  
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  if (staffId) q = q.eq('staff_id', staffId);
  if (period) q = q.like('performance_date', `${period}%`);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Aggregate metrics by staff
  const metricsByStaff: Record<string, any> = {};
  
  (data || []).forEach((metric: any) => {
    if (!metricsByStaff[metric.staff_id]) {
      metricsByStaff[metric.staff_id] = {
        staffId: metric.staff_id,
        totalOrders: 0,
        totalSales: 0,
        totalTips: 0,
        avgTableTurnTime: [],
        customerRatings: [],
      };
    }
    
    metricsByStaff[metric.staff_id].totalOrders += metric.orders_served || 0;
    metricsByStaff[metric.staff_id].totalSales += metric.sales_amount || 0;
    metricsByStaff[metric.staff_id].totalTips += metric.tips_received || 0;
    if (metric.avg_table_turn_time) {
      metricsByStaff[metric.staff_id].avgTableTurnTime.push(metric.avg_table_turn_time);
    }
    if (metric.customer_rating) {
      metricsByStaff[metric.staff_id].customerRatings.push(metric.customer_rating);
    }
  });

  const aggregatedMetrics = Object.values(metricsByStaff).map((m: any) => ({
    ...m,
    avgOrderValue: m.totalOrders > 0 ? m.totalSales / m.totalOrders : 0,
    avgTipPercent: m.totalSales > 0 ? (m.totalTips / m.totalSales) * 100 : 0,
    avgTableTurnTime: m.avgTableTurnTime.length > 0 
      ? m.avgTableTurnTime.reduce((a, b) => a + b, 0) / m.avgTableTurnTime.length 
      : 0,
    avgCustomerRating: m.customerRatings.length > 0
      ? m.customerRatings.reduce((a, b) => a + b, 0) / m.customerRatings.length
      : 0,
  }));

  const result = {
    restaurantId,
    period,
    metrics: aggregatedMetrics,
    summary: {
      totalStaff: aggregatedMetrics.length,
      topPerformer: aggregatedMetrics.sort((a, b) => b.totalSales - a.totalSales)[0],
      avgSalesPerServer: aggregatedMetrics.reduce((sum, m) => sum + m.totalSales, 0) / (aggregatedMetrics.length || 1),
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10 minute TTL
  return res.json(result);
});

// ── Tip Tracking and Reporting ────────────────────────────────────
// Record tip
router.post('/tips', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    restaurantId,
    staffId,
    orderId,
    amount,
    paymentMethod,
    tipperType,
  } = req.body || {};
  
  if (!restaurantId || !staffId || !amount) {
    return res.status(400).json({ error: 'restaurantId, staffId, and amount are required' });
  }

  const { data, error } = await supabaseAdmin.from('tips').insert({
    restaurant_id: restaurantId,
    staff_id: staffId,
    order_id: orderId,
    amount: Number(amount),
    payment_method: paymentMethod || 'cash',
    tipper_type: tipperType || 'guest',
    recorded_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('tips:*');

  return res.status(201).json(data);
});

// Get tip report
router.get('/tips/report', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, staffId, startDate, endDate } = req.query as Record<string, string>;
  
  const cacheKey = `tips-report:${restaurantId || 'all'}:${staffId || 'all'}:${startDate || 'all'}:${endDate || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('tips')
    .select('*, users(name)')
    .order('recorded_at', { ascending: false });
  
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  if (staffId) q = q.eq('staff_id', staffId);
  if (startDate) q = q.gte('recorded_at', startDate);
  if (endDate) q = q.lte('recorded_at', endDate);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Aggregate by staff
  const byStaff: Record<string, any> = {};
  (data || []).forEach((tip: any) => {
    if (!byStaff[tip.staff_id]) {
      byStaff[tip.staff_id] = {
        staffId: tip.staff_id,
        staffName: tip.users?.name,
        totalTips: 0,
        tipCount: 0,
        byPaymentMethod: {},
      };
    }
    byStaff[tip.staff_id].totalTips += tip.amount;
    byStaff[tip.staff_id].tipCount += 1;
    byStaff[tip.staff_id].byPaymentMethod[tip.payment_method] = 
      (byStaff[tip.staff_id].byPaymentMethod[tip.payment_method] || 0) + tip.amount;
  });

  const result = {
    restaurantId,
    period: { startDate, endDate },
    tips: data || [],
    summary: {
      totalTips: (data || []).reduce((sum, t) => sum + t.amount, 0),
      totalTipCount: (data || []).length,
      avgTip: (data || []).length > 0 
        ? (data || []).reduce((sum, t) => sum + t.amount, 0) / (data || []).length 
        : 0,
      byStaff: Object.values(byStaff),
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// ── Labor Cost % Analysis ─────────────────────────────────────────
// Get labor cost percentage analysis
router.get('/labor-cost-analysis', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, period } = req.query as Record<string, string>;
  
  const cacheKey = `labor-cost:${restaurantId || 'all'}:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get labor cost
  let laborQuery = supabaseAdmin
    .from('labor_costs')
    .select('*');
  
  if (restaurantId) laborQuery = laborQuery.eq('restaurant_id', restaurantId);
  if (period) laborQuery = laborQuery.like('period', `${period}%`);
  
  const { data: laborCosts, error: laborError } = await laborQuery;
  if (laborError) return res.status(500).json({ error: laborError.message });

  // Get sales revenue
  let salesQuery = supabaseAdmin
    .from('pos_transactions')
    .select('amount');
  
  if (restaurantId) salesQuery = salesQuery.eq('restaurant_id', restaurantId);
  if (period) salesQuery = salesQuery.like('transaction_date', `${period}%`);
  
  const { data: sales, error: salesError } = await salesQuery;
  if (salesError) return res.status(500).json({ error: salesError.message });

  const totalLaborCost = (laborCosts || []).reduce((sum, l) => sum + l.total_cost, 0);
  const totalSales = (sales || []).reduce((sum, s) => sum + s.amount, 0);
  const laborCostPercent = totalSales > 0 ? (totalLaborCost / totalSales) * 100 : 0;

  const result = {
    restaurantId,
    period,
    totalLaborCost,
    totalSales,
    laborCostPercent: Math.round(laborCostPercent * 10) / 10,
    targetLaborCostPercent: 30, // Industry standard
    variance: laborCostPercent - 30,
    status: laborCostPercent > 35 ? 'high' : laborCostPercent > 30 ? 'elevated' : 'within target',
    breakdown: (laborCosts || []).map((l: any) => ({
      period: l.period,
      laborCost: l.total_cost,
      sales: totalSales / (laborCosts?.length || 1),
      laborCostPercent: totalSales > 0 ? (l.total_cost / totalSales) * 100 : 0,
    })),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

// ── Guest Preference Tracking ─────────────────────────────────────
// Record guest preference
router.post('/guest-preferences', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    guestId,
    restaurantId,
    preferences,
    notes,
  } = req.body || {};
  
  if (!guestId || !restaurantId || !preferences) {
    return res.status(400).json({ error: 'guestId, restaurantId, and preferences are required' });
  }

  const { data, error } = await supabaseAdmin.from('guest_preferences').insert({
    guest_id: guestId,
    restaurant_id: restaurantId,
    preferences,
    notes,
    recorded_by: req.user?.id,
    recorded_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('guest-preferences:*');

  return res.status(201).json(data);
});

// Get guest preferences
router.get('/guest-preferences/:guestId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('guest_preferences')
    .select('*')
    .eq('guest_id', req.params.guestId)
    .order('recorded_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// ── Loyalty Program Engine ─────────────────────────────────────────
// Enroll guest in loyalty program
router.post('/loyalty/enroll', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { guestId, restaurantId, programType } = req.body || {};
  
  if (!guestId || !restaurantId) {
    return res.status(400).json({ error: 'guestId and restaurantId are required' });
  }

  const { data, error } = await supabaseAdmin.from('loyalty_members').insert({
    guest_id: guestId,
    restaurant_id: restaurantId,
    program_type: programType || 'points',
    points_balance: 0,
    tier: 'bronze',
    enrollment_date: new Date().toISOString(),
    is_active: true,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('loyalty:*');

  return res.status(201).json(data);
});

// Award loyalty points
router.post('/loyalty/award-points', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { guestId, restaurantId, points, orderId, reason } = req.body || {};
  
  if (!guestId || !restaurantId || !points) {
    return res.status(400).json({ error: 'guestId, restaurantId, and points are required' });
  }

  // Update member balance
  const { data: member } = await supabaseAdmin
    .from('loyalty_members')
    .select('*')
    .eq('guest_id', guestId)
    .eq('restaurant_id', restaurantId)
    .single();

  if (!member) {
    return res.status(404).json({ error: 'Loyalty member not found' });
  }

  const newBalance = member.points_balance + points;
  
  // Update tier based on balance
  let newTier = member.tier;
  if (newBalance >= 10000) newTier = 'platinum';
  else if (newBalance >= 5000) newTier = 'gold';
  else if (newBalance >= 1000) newTier = 'silver';

  await supabaseAdmin
    .from('loyalty_members')
    .update({
      points_balance: newBalance,
      tier: newTier,
      last_activity: new Date().toISOString(),
    })
    .eq('id', member.id);

  // Record transaction
  const { data, error } = await supabaseAdmin.from('loyalty_transactions').insert({
    member_id: member.id,
    guest_id: guestId,
    restaurant_id: restaurantId,
    transaction_type: 'earned',
    points,
    order_id: orderId,
    reason: reason || 'Purchase',
    transaction_date: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('loyalty:*');

  return res.status(201).json({
    success: true,
    transaction: data,
    newBalance,
    newTier,
  });
});

// ── Feedback Collection and Sentiment Analysis ───────────────────
// Submit guest feedback
router.post('/feedback', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    guestId,
    restaurantId,
    orderId,
    rating,
    comment,
    category,
  } = req.body || {};
  
  if (!restaurantId || !rating) {
    return res.status(400).json({ error: 'restaurantId and rating are required' });
  }

  // Simple sentiment analysis (can be enhanced with NLP)
  const sentiment = analyzeSentiment(comment || '');

  const { data, error } = await supabaseAdmin.from('guest_feedback').insert({
    guest_id: guestId,
    restaurant_id: restaurantId,
    order_id: orderId,
    rating,
    comment,
    category,
    sentiment,
    submitted_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('feedback:*');

  return res.status(201).json(data);
});

// Get feedback summary
router.get('/feedback/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, period } = req.query as Record<string, string>;
  
  const cacheKey = `feedback-summary:${restaurantId || 'all'}:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('guest_feedback')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  if (period) q = q.like('submitted_at', `${period}%`);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const avgRating = (data || []).length > 0 
    ? (data || []).reduce((sum, f) => sum + f.rating, 0) / (data || []).length 
    : 0;

  const sentimentCounts = (data || []).reduce((acc: any, f: any) => {
    acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
    return acc;
  }, {});

  const result = {
    restaurantId,
    period,
    summary: {
      totalFeedback: (data || []).length,
      avgRating: Math.round(avgRating * 10) / 10,
      sentimentDistribution: sentimentCounts,
      byCategory: categorizeFeedback(data || []),
    },
    recentFeedback: (data || []).slice(0, 10),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'delicious', 'fantastic'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointing', 'slow', 'cold'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function categorizeFeedback(feedback: any[]) {
  const categories: Record<string, number> = {};
  feedback.forEach(f => {
    if (f.category) {
      categories[f.category] = (categories[f.category] || 0) + 1;
    }
  });
  return categories;
}

export default router;
