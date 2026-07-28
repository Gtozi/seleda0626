import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Outlets ───────────────────────────────────────────────────────
router.get('/outlets', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('outlets').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/outlets', authenticate, requirePermission('fb:outlet:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('outlets').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Menu Items ────────────────────────────────────────────────────
router.get('/menu-items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId, category, isActive } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('menu_items').select('*').order('name');
  if (outletId) q = q.eq('outlet_id', outletId);
  if (category) q = q.eq('category', category);
  if (isActive !== undefined) q = q.eq('is_active', isActive === 'true');
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/menu-items', authenticate, requirePermission('fb:menu:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('menu_items').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/menu-items/:id', authenticate, requirePermission('fb:menu:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('menu_items').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Recipes ───────────────────────────────────────────────────────
router.get('/recipes', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { menuItemId } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('recipes').select('*, recipe_lines(*, ingredients(*))');
  if (menuItemId) q = q.eq('menu_item_id', menuItemId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/recipes', authenticate, requirePermission('fb:recipe:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { recipe, lines } = req.body;
  const { data: recipeData, error: recipeError } = await supabaseAdmin.from('recipes').insert(recipe).select().single();
  if (recipeError) return res.status(500).json({ error: recipeError.message });

  if (lines && lines.length > 0) {
    const recipeLines = lines.map((line: any) => ({ ...line, recipe_id: recipeData.id }));
    const { error: linesError } = await supabaseAdmin.from('recipe_lines').insert(recipeLines);
    if (linesError) return res.status(500).json({ error: linesError.message });
  }

  return res.status(201).json(recipeData);
});

// Calculate plate cost from recipe ingredients
router.get('/recipes/:id/plate-cost', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  try {
    const recipeId = req.params.id;
    
    // Get recipe with ingredients and their current costs
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .select('*, recipe_lines(*, ingredients(*))')
      .eq('id', recipeId)
      .single();
    
    if (recipeError) return res.status(500).json({ error: recipeError.message });
    
    // Calculate total ingredient cost
    let totalIngredientCost = 0;
    const ingredientBreakdown: any[] = [];
    
    if (recipe.recipe_lines) {
      recipe.recipe_lines.forEach((line: any) => {
        const ingredient = line.ingredient;
        const quantity = line.quantity || 0;
        const currentCost = ingredient?.current_cost || 0;
        const lineCost = quantity * currentCost;
        
        totalIngredientCost += lineCost;
        
        ingredientBreakdown.push({
          ingredientId: ingredient?.id,
          ingredientName: ingredient?.name,
          quantity,
          unit: line.unit,
          costPerUnit: currentCost,
          lineCost
        });
      });
    }
    
    // Apply yield percentage (loss factor)
    const yieldPercentage = recipe.yield || 1.0;
    const adjustedPlateCost = totalIngredientCost / yieldPercentage;
    
    return res.json({
      recipeId,
      yieldPercentage,
      totalIngredientCost,
      adjustedPlateCost,
      ingredientBreakdown,
      portions: recipe.portions || 1,
      costPerPortion: adjustedPlateCost / (recipe.portions || 1)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate plate cost' });
  }
});

// ── Ingredients ───────────────────────────────────────────────────
router.get('/ingredients', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { category, isActive } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('ingredients').select('*').order('name');
  if (category) q = q.eq('category', category);
  if (isActive !== undefined) q = q.eq('is_active', isActive === 'true');
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/ingredients', authenticate, requirePermission('fb:ingredient:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('ingredients').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/ingredients/:id', authenticate, requirePermission('fb:ingredient:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('ingredients').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Weighted-average cost recalculation for an ingredient
router.put('/ingredients/:id/recalculate-cost', authenticate, requirePermission('fb:ingredient:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  try {
    const ingredientId = req.params.id;
    
    // Get all receipt transactions for this ingredient (positive quantities only)
    const { data: receipts, error: receiptsError } = await supabaseAdmin
      .from('stock_transactions')
      .select('*')
      .eq('ingredient_id', ingredientId)
      .eq('transaction_type', 'Receipt')
      .order('date', { ascending: true });
    
    if (receiptsError) return res.status(500).json({ error: receiptsError.message });
    
    // Calculate weighted average cost
    let totalValue = 0;
    let totalQuantity = 0;
    
    receipts?.forEach(receipt => {
      const qty = receipt.quantity || 0;
      const costPerUnit = receipt.cost_per_unit || 0;
      totalValue += qty * costPerUnit;
      totalQuantity += qty;
    });
    
    const weightedAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
    
    // Update ingredient with new cost
    const { data: updatedIngredient, error: updateError } = await supabaseAdmin
      .from('ingredients')
      .update({ current_cost: weightedAverageCost, updated_at: new Date().toISOString() })
      .eq('id', ingredientId)
      .select()
      .single();
    
    if (updateError) return res.status(500).json({ error: updateError.message });
    
    return res.json({
      ingredient: updatedIngredient,
      previousReceipts: receipts?.length || 0,
      totalQuantity,
      totalValue,
      newWeightedAverageCost: weightedAverageCost
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to recalculate weighted average cost' });
  }
});

// ── Stock Locations ───────────────────────────────────────────────
router.get('/stock-locations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { type, outletId } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('stock_locations').select('*').order('name');
  if (type) q = q.eq('type', type);
  if (outletId) q = q.eq('outlet_id', outletId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Stock Transactions ────────────────────────────────────────────
router.get('/stock-transactions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ingredientId, locationId, transactionType, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('stock_transactions').select('*, ingredients(*), stock_locations(*)').order('date', { ascending: false });
  if (ingredientId) q = q.eq('ingredient_id', ingredientId);
  if (locationId) q = q.eq('location_id', locationId);
  if (transactionType) q = q.eq('transaction_type', transactionType);
  if (startDate) q = q.gte('date', startDate);
  if (endDate) q = q.lte('date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/stock-transactions', authenticate, requirePermission('fb:stock:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  try {
    const transaction = req.body;
    
    // Insert the stock transaction
    const { data: newTransaction, error: insertError } = await supabaseAdmin
      .from('stock_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (insertError) return res.status(500).json({ error: insertError.message });
    
    // If this is a Receipt, automatically recalculate weighted-average cost for the ingredient
    if (transaction.transaction_type === 'Receipt') {
      const ingredientId = transaction.ingredient_id;
      
      // Get all receipt transactions for this ingredient
      const { data: receipts, error: receiptsError } = await supabaseAdmin
        .from('stock_transactions')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .eq('transaction_type', 'Receipt')
        .order('date', { ascending: true });
      
      if (!receiptsError && receipts) {
        // Calculate weighted average cost
        let totalValue = 0;
        let totalQuantity = 0;
        
        receipts.forEach(receipt => {
          const qty = receipt.quantity || 0;
          const costPerUnit = receipt.cost_per_unit || 0;
          totalValue += qty * costPerUnit;
          totalQuantity += qty;
        });
        
        const weightedAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
        
        // Update ingredient with new cost
        await supabaseAdmin
          .from('ingredients')
          .update({ current_cost: weightedAverageCost, updated_at: new Date().toISOString() })
          .eq('id', ingredientId);
        
        newTransaction.weighted_average_cost_updated = weightedAverageCost;
      }
    }
    
    return res.status(201).json(newTransaction);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create stock transaction' });
  }
});

// ── Requisitions ───────────────────────────────────────────────────
router.get('/requisitions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('requisitions').select('*, requisition_lines(*, ingredients(*)), stock_locations(*), outlets(*)').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/requisitions', authenticate, requirePermission('fb:requisition:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { requisition, lines } = req.body;
  const { data: requisitionData, error: requisitionError } = await supabaseAdmin.from('requisitions').insert(requisition).select().single();
  if (requisitionError) return res.status(500).json({ error: requisitionError.message });

  if (lines && lines.length > 0) {
    const requisitionLines = lines.map((line: any) => ({ ...line, requisition_id: requisitionData.id }));
    const { error: linesError } = await supabaseAdmin.from('requisition_lines').insert(requisitionLines);
    if (linesError) return res.status(500).json({ error: linesError.message });
  }

  return res.status(201).json(requisitionData);
});

router.put('/requisitions/:id/approve', authenticate, requirePermission('fb:requisition:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { approvedBy } = req.body;
  const { data, error } = await supabaseAdmin.from('requisitions').update({ status: 'Approved', approved_by: approvedBy, approved_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.put('/requisitions/:id/fulfill', authenticate, requirePermission('fb:requisition:fulfill'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { fulfilledBy, lines } = req.body;
  const { data, error } = await supabaseAdmin.from('requisitions').update({ status: 'Fulfilled', fulfilled_by: fulfilledBy, fulfilled_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Update requisition lines with fulfilled quantities
  if (lines && lines.length > 0) {
    for (const line of lines) {
      await supabaseAdmin.from('requisition_lines').update({ quantity_fulfilled: line.quantity_fulfilled }).eq('id', line.id);
    }
  }

  return res.json(data);
});

// ── Orders (POS) ───────────────────────────────────────────────────
router.get('/orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId, status, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('orders').select('*, order_lines(*, menu_items(*)), outlets(*)').order('created_at', { ascending: false });
  if (outletId) q = q.eq('outlet_id', outletId);
  if (status) q = q.eq('status', status);
  if (startDate) q = q.gte('created_at', startDate);
  if (endDate) q = q.lte('created_at', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/orders', authenticate, requirePermission('fb:order:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { order, lines } = req.body;
  const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert(order).select().single();
  if (orderError) return res.status(500).json({ error: orderError.message });

  if (lines && lines.length > 0) {
    const orderLines = lines.map((line: any) => ({ ...line, order_id: orderData.id }));
    const { error: linesError } = await supabaseAdmin.from('order_lines').insert(orderLines);
    if (linesError) return res.status(500).json({ error: linesError.message });
  }

  return res.status(201).json(orderData);
});

router.put('/orders/:id', authenticate, requirePermission('fb:order:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('orders').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.put('/orders/:id/void', authenticate, requirePermission('fb:order:void'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { voidReason, voidedBy } = req.body;
  const { data, error } = await supabaseAdmin.from('orders').update({ status: 'Void', void_reason: voidReason, voided_by: voidedBy, voided_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Banquet Events ─────────────────────────────────────────────────
router.get('/banquet-events', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('banquet_events').select('*').order('event_date', { ascending: false });
  if (status) q = q.eq('status', status);
  if (startDate) q = q.gte('event_date', startDate);
  if (endDate) q = q.lte('event_date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/banquet-events', authenticate, requirePermission('fb:banquet:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('banquet_events').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/banquet-events/:id', authenticate, requirePermission('fb:banquet:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('banquet_events').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Wastage Logs ───────────────────────────────────────────────────
router.get('/wastage-logs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ingredientId, locationId, reason, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('wastage_logs').select('*, ingredients(*), stock_locations(*)').order('created_at', { ascending: false });
  if (ingredientId) q = q.eq('ingredient_id', ingredientId);
  if (locationId) q = q.eq('location_id', locationId);
  if (reason) q = q.eq('reason', reason);
  if (startDate) q = q.gte('created_at', startDate);
  if (endDate) q = q.lte('created_at', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/wastage-logs', authenticate, requirePermission('fb:wastage:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('wastage_logs').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Stock Counts ───────────────────────────────────────────────────
router.get('/stock-counts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { locationId, status, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('stock_counts').select('*, stock_count_lines(*, ingredients(*)), stock_locations(*)').order('count_date', { ascending: false });
  if (locationId) q = q.eq('location_id', locationId);
  if (status) q = q.eq('status', status);
  if (startDate) q = q.gte('count_date', startDate);
  if (endDate) q = q.lte('count_date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/stock-counts', authenticate, requirePermission('fb:stockcount:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { stockCount, lines } = req.body;
  const { data: stockCountData, error: stockCountError } = await supabaseAdmin.from('stock_counts').insert(stockCount).select().single();
  if (stockCountError) return res.status(500).json({ error: stockCountError.message });

  if (lines && lines.length > 0) {
    const stockCountLines = lines.map((line: any) => ({ ...line, stock_count_id: stockCountData.id }));
    const { error: linesError } = await supabaseAdmin.from('stock_count_lines').insert(stockCountLines);
    if (linesError) return res.status(500).json({ error: linesError.message });
  }

  return res.status(201).json(stockCountData);
});

router.put('/stock-counts/:id/approve', authenticate, requirePermission('fb:stockcount:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { approvedBy } = req.body;
  const { data, error } = await supabaseAdmin.from('stock_counts').update({ status: 'Approved', approved_by: approvedBy }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── KPI Reporting ──────────────────────────────────────────────────
router.get('/kpis', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { startDate, endDate, outletId } = req.query as Record<string, string>;

  try {
    // Get orders for the period
    let ordersQuery = supabaseAdmin.from('orders').select('*');
    if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
    if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);
    if (outletId) ordersQuery = ordersQuery.eq('outlet_id', outletId);
    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) return res.status(500).json({ error: ordersError.message });

    // Calculate KPIs
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidOrders = orders?.filter(o => o.status === 'Paid').length || 0;
    const voidOrders = orders?.filter(o => o.status === 'Void').length || 0;
    const voidRate = totalOrders > 0 ? (voidOrders / totalOrders) * 100 : 0;

    // Get wastage data
    let wastageQuery = supabaseAdmin.from('wastage_logs').select('*');
    if (startDate) wastageQuery = wastageQuery.gte('created_at', startDate);
    if (endDate) wastageQuery = wastageQuery.lte('created_at', endDate);
    const { data: wastageLogs, error: wastageError } = await wastageQuery;

    if (wastageError) return res.status(500).json({ error: wastageError.message });

    const totalWastageValue = wastageLogs?.reduce((sum, log) => sum + (log.cost_value || 0), 0) || 0;

    // Get stock transactions for COGS calculation
    let stockQuery = supabaseAdmin.from('stock_transactions').select('*').eq('transaction_type', 'POSDepletion');
    if (startDate) stockQuery = stockQuery.gte('date', startDate);
    if (endDate) stockQuery = stockQuery.lte('date', endDate);
    const { data: stockTransactions, error: stockError } = await stockQuery;

    if (stockError) return res.status(500).json({ error: stockError.message });

    const totalCOGS = stockTransactions?.reduce((sum, tx) => sum + (tx.total_value || 0), 0) || 0;
    const foodCostPercent = totalRevenue > 0 ? (totalCOGS / totalRevenue) * 100 : 0;

    const kpis = {
      totalRevenue,
      totalOrders,
      averageCheck,
      paidOrders,
      voidOrders,
      voidRate,
      totalWastageValue,
      totalCOGS,
      foodCostPercent,
      period: { startDate, endDate },
      outletId
    };

    return res.json(kpis);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate KPIs' });
  }
});

router.get('/kpis/by-outlet', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { startDate, endDate } = req.query as Record<string, string>;

  try {
    // Get all outlets
    const { data: outlets, error: outletsError } = await supabaseAdmin.from('outlets').select('*').eq('is_active', true);
    if (outletsError) return res.status(500).json({ error: outletsError.message });

    // Calculate KPIs per outlet
    const outletKPIs = await Promise.all(
      (outlets || []).map(async (outlet) => {
        let ordersQuery = supabaseAdmin!.from('orders').select('*').eq('outlet_id', outlet.id);
        if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
        if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);
        const { data: orders } = await ordersQuery;

        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const totalOrders = orders?.length || 0;
        const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
          outletId: outlet.id,
          outletName: outlet.name,
          outletType: outlet.type,
          totalRevenue,
          totalOrders,
          averageCheck
        };
      })
    );

    return res.json(outletKPIs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate outlet KPIs' });
  }
});

// ── Table Management ─────────────────────────────────────────────────
router.get('/tables', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId, status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_tables').select('*').order('table_number');
  if (outletId) q = q.eq('outlet_id', outletId);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/tables', authenticate, requirePermission('fb:table:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_tables').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/tables/:id', authenticate, requirePermission('fb:table:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_tables').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/tables/:id', authenticate, requirePermission('fb:table:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_tables').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.post('/tables/assign', authenticate, requirePermission('fb:table:assign'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { tableId, orderId, serverId } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('assign_table_to_order', {
    p_table_id: tableId,
    p_order_id: orderId,
    p_server_id: serverId
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/tables/release', authenticate, requirePermission('fb:table:release'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { tableId, markDirty } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('release_table_from_order', {
    p_table_id: tableId,
    p_mark_dirty: markDirty !== false
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.put('/tables/:id/clean', authenticate, requirePermission('fb:table:clean'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin.rpc('mark_table_clean', {
    p_table_id: req.params.id
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/tables/available', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId, partySize, section } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin.rpc('get_available_tables', {
    p_outlet_id: outletId,
    p_party_size: parseInt(partySize),
    p_section: section || null
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/tables/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin.rpc('get_table_status_summary', {
    p_outlet_id: outletId
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Table Reservations ───────────────────────────────────────────────
router.get('/table-reservations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { tableId, reservationId, status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_table_reservations').select('*').order('arrival_time');
  if (tableId) q = q.eq('table_id', tableId);
  if (reservationId) q = q.eq('reservation_id', reservationId);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/table-reservations', authenticate, requirePermission('fb:reservation:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_table_reservations').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/table-reservations/:id', authenticate, requirePermission('fb:reservation:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_table_reservations').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/table-reservations/auto-assign/:reservationId', authenticate, requirePermission('fb:reservation:auto_assign'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin.rpc('auto_assign_table_from_reservation', {
    p_reservation_id: req.params.reservationId
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Waitlist ─────────────────────────────────────────────────────────
router.get('/waitlist', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { seated, cancelled } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_waitlist').select('*').order('queued_at', { ascending: false });
  if (seated !== undefined) q = q.eq('seated', seated === 'true');
  if (cancelled !== undefined) q = q.eq('cancelled', cancelled === 'true');
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/waitlist', authenticate, requirePermission('fb:waitlist:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { guestName, partySize, contactPhone, notes } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('add_to_waitlist', {
    p_guest_name: guestName,
    p_party_size: partySize,
    p_contact_phone: contactPhone || null,
    p_notes: notes || null
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ id: data });
});

router.put('/waitlist/:id', authenticate, requirePermission('fb:waitlist:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_waitlist').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/waitlist/seat-next', authenticate, requirePermission('fb:waitlist:seat'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { tableId, partySize } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('seat_next_waitlist_guest', {
    p_table_id: tableId,
    p_party_size: partySize
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/waitlist/:id/notify', authenticate, requirePermission('fb:waitlist:notify'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('fb_waitlist')
    .update({ notified: true, notified_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/waitlist/:id/cancel', authenticate, requirePermission('fb:waitlist:cancel'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('fb_waitlist')
    .update({ cancelled: true, cancelled_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Server Sections ───────────────────────────────────────────────────
router.get('/server-sections', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outletId, serverId } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_server_sections').select('*').order('section_name');
  if (outletId) q = q.eq('outlet_id', outletId);
  if (serverId) q = q.eq('server_id', serverId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/server-sections', authenticate, requirePermission('fb:section:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_server_sections').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/server-sections/:id', authenticate, requirePermission('fb:section:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_server_sections').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/server-sections/:id', authenticate, requirePermission('fb:section:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_server_sections').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// ── Table Turn History ───────────────────────────────────────────────
router.get('/table-turn-history', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { tableId, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin!.from('fb_table_turn_history').select('*').order('turn_start_time', { ascending: false });
  if (tableId) q = q.eq('table_id', tableId);
  if (startDate) q = q.gte('turn_start_time', startDate);
  if (endDate) q = q.lte('turn_start_time', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Supplier Management ───────────────────────────────────────────────
router.get('/suppliers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { isActive, search, category } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_suppliers').select('*').order('name');
  if (isActive !== undefined) q = q.eq('is_active', isActive === 'true');
  if (search) q = q.ilike('name', `%${search}%`);
  if (category) {
    const { data: categoryAssignments } = await supabaseAdmin
      .from('fb_supplier_category_assignments')
      .select('supplier_id')
      .eq('category_id', category);
    const supplierIds = categoryAssignments?.map(a => a.supplier_id) || [];
    if (supplierIds.length > 0) {
      q = q.in('id', supplierIds);
    } else {
      q = q.eq('id', 'none'); // Return no results if no suppliers in category
    }
  }
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/suppliers/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_suppliers').select('*').eq('id', req.params.id).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/suppliers', authenticate, requirePermission('fb:supplier:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_suppliers').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/suppliers/:id', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_suppliers').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/suppliers/:id', authenticate, requirePermission('fb:supplier:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_suppliers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// Supplier Contacts
router.get('/suppliers/:id/contacts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_contacts').select('*').eq('supplier_id', req.params.id).order('is_primary', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/suppliers/:id/contacts', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_contacts').insert({ ...req.body, supplier_id: req.params.id }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/suppliers/:id/contacts/:contactId', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_contacts').update(req.body).eq('id', req.params.contactId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/suppliers/:id/contacts/:contactId', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_supplier_contacts').delete().eq('id', req.params.contactId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// Supplier Categories
router.get('/supplier-categories', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_categories').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/supplier-categories', authenticate, requirePermission('fb:supplier:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_categories').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/supplier-categories/:id', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_categories').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/supplier-categories/:id', authenticate, requirePermission('fb:supplier:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_supplier_categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.post('/suppliers/:id/categories/:categoryId', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_supplier_category_assignments').insert({
    supplier_id: req.params.id,
    category_id: req.params.categoryId
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).send();
});

router.delete('/suppliers/:id/categories/:categoryId', authenticate, requirePermission('fb:supplier:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_supplier_category_assignments')
    .delete()
    .eq('supplier_id', req.params.id)
    .eq('category_id', req.params.categoryId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// Supplier Performance
router.get('/suppliers/:id/performance', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_supplier_performance').select('*').eq('supplier_id', req.params.id).order('period_start', { ascending: false });
  if (startDate) q = q.gte('period_start', startDate);
  if (endDate) q = q.lte('period_end', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/suppliers/:id/performance/calculate', authenticate, requirePermission('fb:supplier:view'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { startDate, endDate } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('calculate_supplier_performance', {
    p_supplier_id: req.params.id,
    p_period_start: startDate,
    p_period_end: endDate
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ id: data });
});

// Supplier Search and Analytics
router.get('/suppliers/search', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { q } = req.query as Record<string, string>;
  if (!q) return res.json([]);
  
  const { data, error } = await supabaseAdmin
    .from('fb_suppliers')
    .select('*')
    .or(`name.ilike.%${q}%,supplier_code.ilike.%${q}%,contact_person.ilike.%${q}%`)
    .eq('is_active', true)
    .limit(20);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/suppliers/:id/statistics', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  try {
    // Get supplier statistics
    const { data: orders } = await supabaseAdmin
      .from('fb_purchase_orders')
      .select('total_amount, order_date, status')
      .eq('supplier_id', req.params.id)
      .in('status', ['received', 'closed']);
    
    const totalOrders = orders?.length || 0;
    const totalSpend = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
    const lastOrderDate = orders && orders.length > 0 ? orders[orders.length - 1].order_date : undefined;
    
    // Get performance metrics
    const { data: performance } = await supabaseAdmin
      .from('fb_supplier_performance')
      .select('*')
      .eq('supplier_id', req.params.id)
      .order('period_start', { ascending: false })
      .limit(1);
    
    const onTimeDeliveryRate = performance?.[0]?.on_time_delivery_rate || 0;
    const qualityScore = performance?.[0]?.quality_score || 0;
    
    return res.json({
      totalOrders,
      totalSpend,
      averageOrderValue,
      onTimeDeliveryRate,
      qualityScore,
      lastOrderDate,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// ── Purchase Orders ───────────────────────────────────────────────────
router.get('/purchase-orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { supplierId, status, outletId, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_purchase_orders').select('*').order('order_date', { ascending: false });
  if (supplierId) q = q.eq('supplier_id', supplierId);
  if (status) q = q.eq('status', status);
  if (outletId) q = q.eq('outlet_id', outletId);
  if (startDate) q = q.gte('order_date', startDate);
  if (endDate) q = q.lte('order_date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/purchase-orders/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').select('*').eq('id', req.params.id).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/purchase-orders', authenticate, requirePermission('fb:po:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/purchase-orders/:id', authenticate, requirePermission('fb:po:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/purchase-orders/:id', authenticate, requirePermission('fb:po:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_purchase_orders').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// Purchase Order Lines
router.get('/purchase-orders/:id/lines', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_order_lines').select('*').eq('po_id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/purchase-orders/:id/lines', authenticate, requirePermission('fb:po:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_order_lines').insert({ ...req.body, po_id: req.params.id }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/purchase-orders/:id/lines/:lineId', authenticate, requirePermission('fb:po:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_order_lines').update(req.body).eq('id', req.params.lineId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/purchase-orders/:id/lines/:lineId', authenticate, requirePermission('fb:po:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_purchase_order_lines').delete().eq('id', req.params.lineId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// Purchase Order Workflow
router.post('/purchase-orders/:id/submit', authenticate, requirePermission('fb:po:submit'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').update({ status: 'submitted' }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/purchase-orders/:id/approve', authenticate, requirePermission('fb:po:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').update({ 
    status: 'acknowledged',
    approved_by: req.body.approvedBy,
    approved_at: new Date().toISOString()
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/purchase-orders/:id/cancel', authenticate, requirePermission('fb:po:cancel'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_purchase_orders').update({ 
    status: 'cancelled',
    notes: req.body.reason
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/purchase-orders/:id/calculate-total', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.rpc('calculate_po_total', { p_po_id: req.params.id });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ total: data });
});

// Goods Receipts
router.get('/goods-receipts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { poId, supplierId, outletId, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_goods_receipts').select('*').order('received_date', { ascending: false });
  if (poId) q = q.eq('po_id', poId);
  if (supplierId) q = q.eq('supplier_id', supplierId);
  if (outletId) q = q.eq('outlet_id', outletId);
  if (startDate) q = q.gte('received_date', startDate);
  if (endDate) q = q.lte('received_date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/goods-receipts/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_goods_receipts').select('*').eq('id', req.params.id).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/goods-receipts', authenticate, requirePermission('fb:receipt:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_goods_receipts').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/goods-receipts/:id', authenticate, requirePermission('fb:receipt:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_goods_receipts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Supplier Invoices
router.get('/supplier-invoices', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { supplierId, poId, status, startDate, endDate } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('fb_supplier_invoices').select('*').order('invoice_date', { ascending: false });
  if (supplierId) q = q.eq('supplier_id', supplierId);
  if (poId) q = q.eq('po_id', poId);
  if (status) q = q.eq('status', status);
  if (startDate) q = q.gte('invoice_date', startDate);
  if (endDate) q = q.lte('invoice_date', endDate);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/supplier-invoices/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_invoices').select('*').eq('id', req.params.id).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/supplier-invoices', authenticate, requirePermission('fb:invoice:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_invoices').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/supplier-invoices/:id', authenticate, requirePermission('fb:invoice:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_invoices').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/supplier-invoices/:id', authenticate, requirePermission('fb:invoice:delete'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('fb_supplier_invoices').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.post('/supplier-invoices/:id/paid', authenticate, requirePermission('fb:invoice:pay'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('fb_supplier_invoices').update({
    status: 'paid',
    payment_date: new Date().toISOString(),
    payment_reference: req.body.paymentReference
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;
