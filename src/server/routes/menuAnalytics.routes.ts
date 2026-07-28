import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Menu Engineering Matrix ───────────────────────────────────────
// Generate menu engineering matrix (Stars/Plowhorses/Puzzles/Dogs)
router.get('/menu-engineering', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, period } = req.query as Record<string, string>;
  
  const cacheKey = `menu-engineering:${restaurantId || 'all'}:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get menu items with sales data
  let salesQuery = supabaseAdmin
    .from('menu_items')
    .select('*, menu_item_sales(*)');
  
  if (restaurantId) salesQuery = salesQuery.eq('restaurant_id', restaurantId);
  if (period) salesQuery = salesQuery.like('created_at', `${period}%`);
  
  const { data: menuItems, error: itemsError } = await salesQuery;
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Calculate popularity and profitability metrics
  const analyzedItems = (menuItems || []).map((item: any) => {
    const sales = item.menu_item_sales || [];
    const totalSales = sales.reduce((sum: number, s: any) => sum + s.quantity, 0);
    const totalRevenue = sales.reduce((sum: number, s: any) => sum + (s.quantity * s.price), 0);
    const totalCost = sales.reduce((sum: number, s: any) => sum + (s.quantity * s.cost), 0);
    
    const contributionMargin = item.price - item.cost;
    const contributionMarginPercent = item.price > 0 ? (contributionMargin / item.price) * 100 : 0;
    const foodCostPercent = item.price > 0 ? (item.cost / item.price) * 100 : 0;

    return {
      ...item,
      totalSales,
      totalRevenue,
      totalCost,
      contributionMargin,
      contributionMarginPercent: Math.round(contributionMarginPercent * 10) / 10,
      foodCostPercent: Math.round(foodCostPercent * 10) / 10,
      profit: totalRevenue - totalCost,
    };
  });

  // Calculate averages for classification
  const avgPopularity = analyzedItems.reduce((sum, i) => sum + i.totalSales, 0) / (analyzedItems.length || 1);
  const avgProfitability = analyzedItems.reduce((sum, i) => sum + i.contributionMarginPercent, 0) / (analyzedItems.length || 1);

  // Classify items into matrix quadrants
  const classifiedItems = analyzedItems.map((item: any) => {
    const isHighPopularity = item.totalSales >= avgPopularity;
    const isHighProfitability = item.contributionMarginPercent >= avgProfitability;

    let classification;
    if (isHighPopularity && isHighProfitability) {
      classification = 'Star'; // High popularity, high profitability
    } else if (isHighPopularity && !isHighProfitability) {
      classification = 'Plowhorse'; // High popularity, low profitability
    } else if (!isHighPopularity && isHighProfitability) {
      classification = 'Puzzle'; // Low popularity, high profitability
    } else {
      classification = 'Dog'; // Low popularity, low profitability
    }

    return {
      ...item,
      classification,
      recommendation: getClassificationRecommendation(classification),
    };
  });

  const result = {
    restaurantId,
    period,
    matrix: {
      stars: classifiedItems.filter(i => i.classification === 'Star'),
      plowhorses: classifiedItems.filter(i => i.classification === 'Plowhorse'),
      puzzles: classifiedItems.filter(i => i.classification === 'Puzzle'),
      dogs: classifiedItems.filter(i => i.classification === 'Dog'),
    },
    summary: {
      totalItems: classifiedItems.length,
      avgPopularity: Math.round(avgPopularity),
      avgProfitability: Math.round(avgProfitability * 10) / 10,
      starCount: classifiedItems.filter(i => i.classification === 'Star').length,
      plowhorseCount: classifiedItems.filter(i => i.classification === 'Plowhorse').length,
      puzzleCount: classifiedItems.filter(i => i.classification === 'Puzzle').length,
      dogCount: classifiedItems.filter(i => i.classification === 'Dog').length,
    },
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000); // 15 minute TTL
  return res.json(result);
});

function getClassificationRecommendation(classification: string): string {
  switch (classification) {
    case 'Star':
      return 'Keep as is - excellent performer';
    case 'Plowhorse':
      return 'Increase price or reduce cost to improve margin';
    case 'Puzzle':
      return 'Promote more aggressively or improve presentation';
    case 'Dog':
      return 'Consider removing from menu or reformulating';
    default:
      return 'No recommendation';
  }
}

// ── Contribution Margin Analysis ───────────────────────────────────
// Get contribution margin analysis for menu items
router.get('/contribution-margin', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, category } = req.query as Record<string, string>;
  
  const cacheKey = `contribution-margin:${restaurantId || 'all'}:${category || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('menu_items')
    .select('*')
    .order('name');
  
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  if (category) q = q.eq('category', category);
  
  const { data: items, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const analysis = (items || []).map((item: any) => {
    const contributionMargin = item.price - item.cost;
    const contributionMarginPercent = item.price > 0 ? (contributionMargin / item.price) * 100 : 0;
    const foodCostPercent = item.price > 0 ? (item.cost / item.price) * 100 : 0;
    
    return {
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
      contributionMargin,
      contributionMarginPercent: Math.round(contributionMarginPercent * 10) / 10,
      foodCostPercent: Math.round(foodCostPercent * 10) / 10,
      targetFoodCostPercent: 30, // Industry standard
      varianceFromTarget: foodCostPercent - 30,
    };
  });

  const result = {
    items: analysis,
    summary: {
      avgContributionMargin: analysis.reduce((sum, i) => sum + i.contributionMargin, 0) / (analysis.length || 1),
      avgFoodCostPercent: analysis.reduce((sum, i) => sum + i.foodCostPercent, 0) / (analysis.length || 1),
      highMarginItems: analysis.filter(i => i.contributionMarginPercent > 70).length,
      lowMarginItems: analysis.filter(i => i.contributionMarginPercent < 30).length,
      aboveTargetCost: analysis.filter(i => i.foodCostPercent > 30).length,
    },
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

// ── Popularity vs. Profitability Scatter Plot Data ─────────────────
// Get data for scatter plot visualization
router.get('/scatter-plot', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, period } = req.query as Record<string, string>;
  
  const cacheKey = `scatter-plot:${restaurantId || 'all'}:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get menu items with sales
  let salesQuery = supabaseAdmin
    .from('menu_items')
    .select('id, name, price, cost, category, menu_item_sales(quantity)');
  
  if (restaurantId) salesQuery = salesQuery.eq('restaurant_id', restaurantId);
  
  const { data: items, error } = await salesQuery;
  if (error) return res.status(500).json({ error: error.message });

  const scatterData = (items || []).map((item: any) => {
    const sales = item.menu_item_sales || [];
    const totalSales = sales.reduce((sum: number, s: any) => sum + s.quantity, 0);
    const contributionMargin = item.price - item.cost;
    const contributionMarginPercent = item.price > 0 ? (contributionMargin / item.price) * 100 : 0;

    return {
      x: totalSales, // Popularity (x-axis)
      y: contributionMarginPercent, // Profitability (y-axis)
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
    };
  });

  const result = {
    data: scatterData,
    axes: {
      x: { label: 'Total Sales (Popularity)', unit: 'units' },
      y: { label: 'Contribution Margin %', unit: '%' },
    },
    quadrants: calculateQuadrants(scatterData),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

function calculateQuadrants(data: any[]) {
  if (data.length === 0) return null;

  const avgX = data.reduce((sum, d) => sum + d.x, 0) / data.length;
  const avgY = data.reduce((sum, d) => sum + d.y, 0) / data.length;

  return {
    centerX: avgX,
    centerY: avgY,
    q1: data.filter(d => d.x >= avgX && d.y >= avgY), // High popularity, high profit
    q2: data.filter(d => d.x >= avgX && d.y < avgY), // High popularity, low profit
    q3: data.filter(d => d.x < avgX && d.y >= avgY), // Low popularity, high profit
    q4: data.filter(d => d.x < avgX && d.y < avgY), // Low popularity, low profit
  };
}

// ── Menu Item Performance Trends ───────────────────────────────────
// Get performance trends over time
router.get('/performance-trends', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, itemId, days } = req.query as Record<string, string>;
  
  const cacheKey = `performance-trends:${restaurantId || 'all'}:${itemId || 'all'}:${days || '30'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (parseInt(days) || 30));

  let q = supabaseAdmin
    .from('menu_item_sales')
    .select('*, menu_items(name)')
    .gte('sale_date', startDate.toISOString())
    .order('sale_date', { ascending: true });
  
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  if (itemId) q = q.eq('menu_item_id', itemId);
  
  const { data: sales, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Group by date
  const groupedByDate = (sales || []).reduce((acc: any, sale: any) => {
    const date = sale.sale_date.split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, quantity: 0, revenue: 0 };
    }
    acc[date].quantity += sale.quantity;
    acc[date].revenue += sale.quantity * sale.price;
    return acc;
  }, {});

  const trends = Object.values(groupedByDate).map((t: any) => ({
    date: t.date,
    quantity: t.quantity,
    revenue: Math.round(t.revenue * 100) / 100,
  }));

  // Calculate trend line
  const trendLine = calculateTrendLine(trends.map(t => t.quantity));

  const result = {
    itemId,
    trends,
    trendLine,
    summary: {
      totalSales: trends.reduce((sum, t) => sum + t.quantity, 0),
      avgDailySales: trends.reduce((sum, t) => sum + t.quantity, 0) / (trends.length || 1),
      totalRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
      trendDirection: trendLine.slope > 0 ? 'increasing' : trendLine.slope < 0 ? 'decreasing' : 'stable',
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

function calculateTrendLine(values: number[]) {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: 0 };

  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// ── Menu Optimization Recommendations ─────────────────────────────
// Generate automated menu optimization recommendations
router.get('/optimization-recommendations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId } = req.query as Record<string, string>;
  
  const cacheKey = `menu-optimization:${restaurantId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get menu engineering data
  const { data: menuItems } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId || '')
    .order('name');

  const recommendations = [];

  for (const item of menuItems || []) {
    const foodCostPercent = item.price > 0 ? (item.cost / item.price) * 100 : 0;
    
    // High food cost recommendation
    if (foodCostPercent > 35) {
      recommendations.push({
        itemId: item.id,
        itemName: item.name,
        type: 'cost_reduction',
        priority: 'high',
        message: `Food cost is ${Math.round(foodCostPercent)}%. Consider reducing portion size or finding cheaper ingredients.`,
        currentCost: item.cost,
        targetCost: item.price * 0.30,
        potentialSavings: (item.cost - item.price * 0.30) * 100, // Assuming 100 units
      });
    }

    // Low price recommendation
    if (foodCostPercent < 20) {
      recommendations.push({
        itemId: item.id,
        itemName: item.name,
        type: 'price_increase',
        priority: 'medium',
        message: `Food cost is only ${Math.round(foodCostPercent)}%. Consider increasing price to improve margin.`,
        currentPrice: item.price,
        suggestedPrice: item.price * 1.15,
        potentialIncrease: item.price * 0.15 * 100,
      });
    }
  }

  // Sort by priority
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  const result = {
    recommendations: recommendations.slice(0, 20), // Top 20
    summary: {
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'high').length,
      mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
      lowPriority: recommendations.filter(r => r.priority === 'low').length,
      totalPotentialSavings: recommendations
        .filter(r => r.type === 'cost_reduction')
        .reduce((sum, r) => sum + r.potentialSavings, 0),
    },
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000); // 30 minute TTL
  return res.json(result);
});

// ── Seasonal Menu Performance Comparison ─────────────────────────
// Compare menu performance across seasons
router.get('/seasonal-comparison', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, year } = req.query as Record<string, string>;
  
  const cacheKey = `seasonal-comparison:${restaurantId || 'all'}:${year || new Date().getFullYear()}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const targetYear = year || new Date().getFullYear().toString();

  // Define seasons
  const seasons = [
    { name: 'Winter', months: ['12', '01', '02'] },
    { name: 'Spring', months: ['03', '04', '05'] },
    { name: 'Summer', months: ['06', '07', '08'] },
    { name: 'Fall', months: ['09', '10', '11'] },
  ];

  const seasonalData = [];

  for (const season of seasons) {
    let totalSales = 0;
    let totalRevenue = 0;
    
    for (const month of season.months) {
      const monthPattern = `${targetYear}-${month}`;
      
      const { data: sales } = await supabaseAdmin
        .from('menu_item_sales')
        .select('quantity, price')
        .like('sale_date', `${monthPattern}%`);
      
      if (sales) {
        totalSales += sales.reduce((sum: number, s: any) => sum + s.quantity, 0);
        totalRevenue += sales.reduce((sum: number, s: any) => sum + (s.quantity * s.price), 0);
      }
    }

    seasonalData.push({
      season: season.name,
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    });
  }

  const result = {
    year: targetYear,
    seasons: seasonalData,
    bestSeason: seasonalData.reduce((best, current) => 
      current.totalRevenue > best.totalRevenue ? current : best
    ),
    worstSeason: seasonalData.reduce((worst, current) => 
      current.totalRevenue < worst.totalRevenue ? current : worst
    ),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000); // 1 hour TTL
  return res.json(result);
});

// ── Cost Change Impact Analysis ────────────────────────────────────
// Analyze impact of cost changes on menu profitability
router.post('/cost-impact-analysis', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, costChanges } = req.body || {};
  
  if (!costChanges || !Array.isArray(costChanges)) {
    return res.status(400).json({ error: 'costChanges array is required' });
  }

  // Get current menu items
  const { data: items } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId || '');

  const impactAnalysis = [];

  for (const item of items || []) {
    const costChange = costChanges.find((c: any) => c.itemId === item.id);
    if (!costChange) continue;

    const oldCost = item.cost;
    const newCost = oldCost * (1 + costChange.percentChange / 100);
    const oldMargin = item.price - oldCost;
    const newMargin = item.price - newCost;
    const marginChange = newMargin - oldMargin;
    const marginChangePercent = oldMargin > 0 ? (marginChange / oldMargin) * 100 : 0;

    impactAnalysis.push({
      itemId: item.id,
      itemName: item.name,
      oldCost: Math.round(oldCost * 100) / 100,
      newCost: Math.round(newCost * 100) / 100,
      costChangePercent: costChange.percentChange,
      oldMargin: Math.round(oldMargin * 100) / 100,
      newMargin: Math.round(newMargin * 100) / 100,
      marginChange: Math.round(marginChange * 100) / 100,
      marginChangePercent: Math.round(marginChangePercent * 10) / 10,
      recommendation: marginChangePercent < -10 
        ? 'Consider price increase to maintain margin'
        : 'Margin change is acceptable',
    });
  }

  const result = {
    restaurantId,
    impactAnalysis,
    summary: {
      totalItemsAffected: impactAnalysis.length,
      avgMarginChangePercent: impactAnalysis.reduce((sum, i) => sum + i.marginChangePercent, 0) / (impactAnalysis.length || 1),
      significantDecreases: impactAnalysis.filter(i => i.marginChangePercent < -10).length,
      totalMarginImpact: impactAnalysis.reduce((sum, i) => sum + i.marginChange, 0),
    },
  };

  return res.json(result);
});

export default router;
