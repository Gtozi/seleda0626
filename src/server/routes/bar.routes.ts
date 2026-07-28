import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

function generateNumber(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

// ── Dashboard ───────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  try {
    const today = new Date().toISOString().split('T')[0];
    let todayProdQ = supabaseAdmin
      .from('bar_production_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    if (outlet_id) todayProdQ = todayProdQ.eq('bar_id', outlet_id);
    const { count: todayProduction } = await todayProdQ;

    let pendingProdQ = supabaseAdmin
      .from('bar_production_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'approved', 'in_production']);
    if (outlet_id) pendingProdQ = pendingProdQ.eq('bar_id', outlet_id);
    const { count: pendingProduction } = await pendingProdQ;

    let lowStockQ = supabaseAdmin
      .from('bar_inventory_items')
      .select('available_qty, reorder_level')
      .eq('is_active', true)
      .eq('is_deleted', false);
    if (outlet_id) lowStockQ = lowStockQ.eq('outlet_id', outlet_id);
    const { data: lowStockItems } = await lowStockQ;

    const lowStock = (lowStockItems || []).filter((item: any) => Number(item.available_qty || 0) <= Number(item.reorder_level || 0)).length;
    let expiringQ = supabaseAdmin
      .from('bar_inventory_batches')
      .select('*', { count: 'exact', head: true })
      .lte('expiry_date', `now() + interval '3 days'`)
      .gt('remaining_qty', 0)
      .eq('is_deleted', false);
    if (outlet_id) expiringQ = expiringQ.eq('outlet_id', outlet_id);
    const { count: expiringItems } = await expiringQ;

    let invValQ = supabaseAdmin
      .from('bar_inventory_items')
      .select('on_hand_qty, avg_cost')
      .eq('is_active', true)
      .eq('is_deleted', false);
    if (outlet_id) invValQ = invValQ.eq('outlet_id', outlet_id);
    const { data: inventoryValueData, error: invErr } = await invValQ;
    if (invErr) throw invErr;
    const inventoryValue = (inventoryValueData || []).reduce((sum: number, item: any) => sum + (Number(item.on_hand_qty || 0) * Number(item.avg_cost || 0)), 0);

    let wasteTodayQ = supabaseAdmin
      .from('bar_waste')
      .select('cost_value')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .eq('status', 'approved');
    if (outlet_id) wasteTodayQ = wasteTodayQ.eq('outlet_id', outlet_id);
    const { data: wasteToday, error: wasteErr } = await wasteTodayQ;
    if (wasteErr) throw wasteErr;
    const wasteTodayCost = (wasteToday || []).reduce((sum, w) => sum + Number(w.cost_value || 0), 0);

    let recipeQ = supabaseAdmin
      .from('bar_recipes')
      .select('pour_cost_percent')
      .eq('is_deleted', false)
      .eq('status', 'active');
    if (outlet_id) recipeQ = recipeQ.eq('outlet_id', outlet_id);
    const { data: recipes, error: recipeErr } = await recipeQ;
    if (recipeErr) throw recipeErr;
    const avgPourCostPercent = recipes && recipes.length
      ? recipes.reduce((sum, r) => sum + Number(r.pour_cost_percent || 0), 0) / recipes.length
      : 0;

    let activeBatchesQ = supabaseAdmin
      .from('bar_inventory_batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_deleted', false);
    if (outlet_id) activeBatchesQ = activeBatchesQ.eq('outlet_id', outlet_id);
    const { count: activeBatches } = await activeBatchesQ;

    let totalWasteTodayQ = supabaseAdmin
      .from('bar_waste')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    if (outlet_id) totalWasteTodayQ = totalWasteTodayQ.eq('outlet_id', outlet_id);
    const { count: totalWasteToday } = await totalWasteTodayQ;

    return res.json({
      today_production_count: todayProduction || 0,
      pending_production_count: pendingProduction || 0,
      inventory_value: inventoryValue,
      low_stock_count: lowStock || 0,
      expiring_items_count: expiringItems || 0,
      waste_today_cost: wasteTodayCost,
      avg_pour_cost_percent: avgPourCostPercent,
      production_efficiency: 0,
      total_batches_active: activeBatches || 0,
      total_waste_count_today: totalWasteToday || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load dashboard' });
  }
});

// ── Storage Locations ───────────────────────────────────────────────────
router.get('/storage-locations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('bar_storage_locations').select('*').order('name');
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/storage-locations', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('bar_storage_locations').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, id: data.id });
});

router.patch('/storage-locations/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('bar_storage_locations').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// ── Recipes ─────────────────────────────────────────────────────────────
async function calculateBarRecipeCost(recipeId: string) {
  if (!supabaseAdmin) return { total_cost: 0, cost_per_portion: 0, pour_cost_percent: 0 };
  const { data: recipe } = await supabaseAdmin.from('bar_recipes').select('*').eq('id', recipeId).single();
  if (!recipe) return { total_cost: 0, cost_per_portion: 0, pour_cost_percent: 0 };
  const { data: lines } = await supabaseAdmin
    .from('bar_recipe_ingredients')
    .select('*')
    .eq('recipe_id', recipeId);
  const rawIds = (lines || []).filter((l: any) => l.ingredient_type === 'raw_material').map((l: any) => l.raw_ingredient_id).filter(Boolean);
  const subRecipeIds = (lines || []).filter((l: any) => l.ingredient_type === 'sub_recipe' || l.ingredient_type === 'finished_product').map((l: any) => l.ingredient_id).filter(Boolean);
  const { data: rawItems } = await supabaseAdmin.from('bar_inventory_items').select('id, avg_cost').in('id', rawIds.length ? rawIds : ['00000000-0000-0000-0000-000000000000']);
  const { data: subRecipes } = await supabaseAdmin.from('bar_recipes').select('id, total_cost, yield_qty').in('id', subRecipeIds.length ? subRecipeIds : ['00000000-0000-0000-0000-000000000000']);
  const rawItemMap = new Map((rawItems || []).map((r: any) => [r.id, r]));
  const subRecipeMap = new Map((subRecipes || []).map((r: any) => [r.id, r]));
  let totalCost = 0;
  for (const line of lines || []) {
    const qty = Number(line.quantity || 0);
    if (line.ingredient_type === 'raw_material') {
      const item = rawItemMap.get((line as any).raw_ingredient_id);
      const unitCost = Number(item?.avg_cost || 0);
      totalCost += qty * unitCost;
    } else if (line.ingredient_type === 'sub_recipe' || line.ingredient_type === 'finished_product') {
      const subRecipe = subRecipeMap.get((line as any).ingredient_id);
      if (subRecipe && Number(subRecipe.yield_qty || 1)) {
        totalCost += qty * (Number(subRecipe.total_cost || 0) / Number(subRecipe.yield_qty || 1));
      }
    }
  }
  const yieldQty = Number(recipe.yield_qty || 1);
  const costPerPortion = yieldQty ? totalCost / yieldQty : 0;
  const sellingPrice = Number(recipe.selling_price || 0);
  const pourCostPercent = sellingPrice ? (costPerPortion / sellingPrice) * 100 : 0;
  return { total_cost: totalCost, cost_per_portion: costPerPortion, pour_cost_percent: pourCostPercent };
}

router.get('/recipes', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { type, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('bar_recipes').select('*, bar_recipe_ingredients(*)').eq('is_deleted', false).order('name');
  if (type) q = q.eq('recipe_type', type);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/recipes/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('bar_recipes')
    .select('*, bar_recipe_ingredients(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/recipes', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ingredients, ...recipeFields } = req.body;
  const { data: recipe, error } = await supabaseAdmin.from('bar_recipes').insert(recipeFields).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (ingredients && ingredients.length > 0) {
    const lines = ingredients.map((line: any) => ({ ...line, recipe_id: recipe.id }));
    const { error: lineError } = await supabaseAdmin.from('bar_recipe_ingredients').insert(lines);
    if (lineError) return res.status(500).json({ error: lineError.message });
  }
  const costs = await calculateBarRecipeCost(recipe.id);
  await supabaseAdmin.from('bar_recipes').update(costs).eq('id', recipe.id);
  return res.status(201).json({ success: true, id: recipe.id });
});

router.patch('/recipes/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { ingredients, ...recipeFields } = req.body;
  const { data: recipe, error } = await supabaseAdmin.from('bar_recipes').update(recipeFields).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (ingredients) {
    await supabaseAdmin.from('bar_recipe_ingredients').delete().eq('recipe_id', req.params.id);
    if (ingredients.length > 0) {
      const lines = ingredients.map((line: any) => ({ ...line, recipe_id: req.params.id }));
      const { error: lineError } = await supabaseAdmin.from('bar_recipe_ingredients').insert(lines);
      if (lineError) return res.status(500).json({ error: lineError.message });
    }
  }
  const costs = await calculateBarRecipeCost(req.params.id);
  await supabaseAdmin.from('bar_recipes').update(costs).eq('id', req.params.id);
  return res.json({ success: true, data: { ...recipe, ...costs } });
});

router.delete('/recipes/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('bar_recipes').update({ is_deleted: true }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

router.get('/recipes/:id/cost', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  try {
    const costs = await calculateBarRecipeCost(req.params.id);
    const { data: lines } = await supabaseAdmin
      .from('bar_recipe_ingredients')
      .select('*')
      .eq('recipe_id', req.params.id);
    const rawIds = (lines || []).filter((l: any) => l.ingredient_type === 'raw_material').map((l: any) => l.raw_ingredient_id).filter(Boolean);
    const { data: rawItems } = await supabaseAdmin.from('bar_inventory_items').select('id, name, avg_cost, unit').in('id', rawIds.length ? rawIds : ['00000000-0000-0000-0000-000000000000']);
    const rawItemMap = new Map((rawItems || []).map((r: any) => [r.id, r]));
    const costBreakdown = (lines || []).map((line: any) => {
      const item = line.ingredient_type === 'raw_material' ? rawItemMap.get(line.raw_ingredient_id) : null;
      const unitCost = Number(item?.avg_cost || 0);
      return {
        ingredient_id: line.ingredient_id || line.raw_ingredient_id,
        ingredient_name: item?.name || 'Sub-recipe',
        quantity: line.quantity,
        unit: item?.unit || line.unit,
        unit_cost: unitCost,
        line_cost: line.quantity * unitCost,
      };
    });
    return res.json({
      total_cost: costs.total_cost,
      cost_per_portion: costs.cost_per_portion,
      ingredient_count: costBreakdown.length,
      sub_recipe_count: (lines || []).filter((l: any) => l.ingredient_type !== 'raw_material').length,
      cost_breakdown: costBreakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Production Orders ───────────────────────────────────────────────────
router.get('/production-orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin
    .from('bar_production_orders')
    .select('*, bar_recipes(name, recipe_code), bar_production_lines(*)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (outlet_id) q = q.eq('bar_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/production-orders', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { lines, outlet_id, ...orderFields } = req.body;
  const production_number = generateNumber('BPO');
  const batch_number = orderFields.batch_number || generateNumber('BBATCH');
  const insertData: any = { ...orderFields, production_number, batch_number };
  if (outlet_id) insertData.bar_id = outlet_id;
  const { data: order, error } = await supabaseAdmin
    .from('bar_production_orders')
    .insert(insertData)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (lines && lines.length > 0) {
    const productionLines = lines.map((line: any) => ({ ...line, production_order_id: order.id }));
    const { error: lineError } = await supabaseAdmin.from('bar_production_lines').insert(productionLines);
    if (lineError) return res.status(500).json({ error: lineError.message });
  }
  return res.status(201).json({ success: true, id: order.id, production_number });
});

router.patch('/production-orders/:id/status', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, approved_by } = req.body;
  const update: any = { status };
  if (status === 'approved') {
    update.approved_by = approved_by;
    update.approved_at = new Date().toISOString();
  }
  const { data, error } = await supabaseAdmin.from('bar_production_orders').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

router.post('/production-orders/:id/complete', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { actual_qty, performed_by, labor_cost = 0 } = req.body;
  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('bar_production_orders')
      .select('*, bar_production_lines(*), bar_recipes(name, recipe_code)')
      .eq('id', req.params.id)
      .single();
    if (orderError || !order) throw orderError || new Error('Order not found');
    const plannedQty = Number(order.planned_qty || 1);
    const actualQty = Number(actual_qty || plannedQty);
    const yieldPercent = plannedQty ? (actualQty / plannedQty) * 100 : 100;

    const { data: recipeCost } = await supabaseAdmin.from('bar_recipes').select('total_cost, cost_per_portion').eq('id', order.recipe_id).single();
    const totalCost = Number(recipeCost?.total_cost || 0) * (actualQty / Number(order.planned_qty || 1));
    const costPerUnit = actualQty ? totalCost / actualQty : 0;
    const varianceQty = actualQty - plannedQty;
    const varianceCost = varianceQty * costPerUnit;

    const batch_number = generateNumber('BBATCH');
    let { data: inventoryItem } = await supabaseAdmin
      .from('bar_inventory_items')
      .select('id')
      .eq('recipe_id', order.recipe_id)
      .single();
    if (!inventoryItem) {
      const { data: newItem, error: createItemError } = await supabaseAdmin.from('bar_inventory_items').insert({
        name: order.bar_recipes?.name || 'Produced Item',
        item_type: 'finished_good',
        unit: order.bar_recipes?.yield_unit || 'ml',
        recipe_id: order.recipe_id,
        outlet_id: order.bar_id || null,
      }).select().single();
      if (createItemError) throw createItemError;
      inventoryItem = newItem;
    }
    if (!inventoryItem) throw new Error('Failed to resolve inventory item');

    const { data: batch, error: batchError } = await supabaseAdmin
      .from('bar_inventory_batches')
      .insert({
        inventory_item_id: inventoryItem.id,
        batch_number,
        recipe_id: order.recipe_id,
        production_order_id: order.id,
        production_date: order.production_date,
        quantity_produced: actualQty,
        remaining_qty: actualQty,
        unit_cost: costPerUnit,
        total_cost: totalCost,
        bartender_id: performed_by || order.bartender_id,
        storage_location_id: order.storage_location_id,
      })
      .select()
      .single();
    if (batchError) throw batchError;

    await supabaseAdmin.from('bar_production_orders').update({
      status: 'completed',
      actual_qty: actualQty,
      yield_percent: yieldPercent,
      total_cost: totalCost,
      cost_per_unit: costPerUnit,
      variance_qty: varianceQty,
      variance_cost: varianceCost,
      labor_cost: labor_cost,
      completed_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    return res.json({
      success: true,
      batch_id: batch.id,
      batch_number,
      total_cost: totalCost,
      cost_per_unit: costPerUnit,
      variance_qty: varianceQty,
      variance_cost: varianceCost,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to complete production order' });
  }
});

// ── Inventory ─────────────────────────────────────────────────────────────
router.get('/inventory', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { type, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('bar_inventory_items').select('*').eq('is_deleted', false).order('name');
  if (type) q = q.eq('item_type', type);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/inventory', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('bar_inventory_items').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, id: data.id });
});

router.patch('/inventory/:id', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('bar_inventory_items').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// ── Batches ───────────────────────────────────────────────────────────────
router.get('/batches', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin
    .from('bar_inventory_batches')
    .select('*, bar_inventory_items(name, item_type), bar_storage_locations(name)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Movements ─────────────────────────────────────────────────────────────
router.get('/movements', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { limit = '50' } = req.query as Record<string, string>;
  const { data, error } = await supabaseAdmin
    .from('bar_inventory_movements')
    .select('*, bar_inventory_items(name)')
    .order('created_at', { ascending: false })
    .limit(Number(limit));
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// ── Transfers ─────────────────────────────────────────────────────────────
router.get('/transfers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin
    .from('bar_transfers')
    .select('*, bar_inventory_items(name), from_location:bar_storage_locations!bar_transfers_from_location_id_fkey(name), to_location:bar_storage_locations!bar_transfers_to_location_id_fkey(name)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/transfers', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const transfer_number = generateNumber('BTR');
  const { data, error } = await supabaseAdmin.from('bar_transfers').insert({ ...req.body, transfer_number }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, id: data.id, transfer_number });
});

router.post('/transfers/:id/approve', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { approved_by } = req.body;
  try {
    const { data: transfer, error } = await supabaseAdmin.from('bar_transfers').select('*').eq('id', req.params.id).single();
    if (error || !transfer) throw error || new Error('Transfer not found');
    if (transfer.status !== 'pending') return res.status(400).json({ error: 'Transfer is not pending' });

    const { data: item } = await supabaseAdmin.from('bar_inventory_items').select('avg_cost').eq('id', transfer.inventory_item_id).single();
    const unitCost = Number(item?.avg_cost || 0);
    const totalCost = unitCost * Number(transfer.quantity || 0);

    await supabaseAdmin.from('bar_inventory_movements').insert({
      inventory_item_id: transfer.inventory_item_id,
      batch_id: transfer.batch_id,
      movement_type: 'transfer',
      direction: 'out',
      quantity: transfer.quantity,
      unit: transfer.unit,
      unit_cost: unitCost,
      total_cost: totalCost,
      reference_type: 'transfer',
      reference_id: transfer.id,
      from_location_id: transfer.from_location_id,
      to_location_id: transfer.to_location_id,
      performed_by: approved_by,
      notes: `Transfer ${transfer.transfer_number} approved`,
    });
    await supabaseAdmin.from('bar_inventory_movements').insert({
      inventory_item_id: transfer.inventory_item_id,
      batch_id: transfer.batch_id,
      movement_type: 'transfer',
      direction: 'in',
      quantity: transfer.quantity,
      unit: transfer.unit,
      unit_cost: unitCost,
      total_cost: totalCost,
      reference_type: 'transfer',
      reference_id: transfer.id,
      from_location_id: transfer.from_location_id,
      to_location_id: transfer.to_location_id,
      performed_by: approved_by,
      notes: `Transfer ${transfer.transfer_number} received`,
    });

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('bar_transfers')
      .update({ status: 'completed', approved_by, approved_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateError) throw updateError;
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to approve transfer' });
  }
});

// ── Waste ─────────────────────────────────────────────────────────────────
router.get('/waste', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin
    .from('bar_waste')
    .select('*, bar_inventory_items(name)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/waste', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  try {
    const { data: item } = await supabaseAdmin.from('bar_inventory_items').select('avg_cost').eq('id', req.body.inventory_item_id).single();
    const costValue = Number(item?.avg_cost || 0) * Number(req.body.quantity || 0);
    const { data, error } = await supabaseAdmin.from('bar_waste').insert({ ...req.body, cost_value: costValue }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, id: data.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/waste/:id/approve', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { approved_by } = req.body;
  try {
    const { data: waste, error } = await supabaseAdmin.from('bar_waste').select('*').eq('id', req.params.id).single();
    if (error || !waste) throw error || new Error('Waste record not found');
    if (waste.status !== 'pending') return res.status(400).json({ error: 'Waste record is not pending' });

    await supabaseAdmin.from('bar_inventory_movements').insert({
      inventory_item_id: waste.inventory_item_id,
      batch_id: waste.batch_id,
      movement_type: 'waste',
      direction: 'out',
      quantity: waste.quantity,
      unit: waste.unit,
      unit_cost: Number(waste.cost_value || 0) / Number(waste.quantity || 1),
      total_cost: waste.cost_value,
      reference_type: 'waste',
      reference_id: waste.id,
      performed_by: approved_by,
      notes: `Waste approved: ${waste.reason}`,
    });

    await supabaseAdmin.from('bar_waste').update({ status: 'approved', approved_by, approved_at: new Date().toISOString() }).eq('id', req.params.id);
    return res.json({ success: true, cost_deducted: waste.cost_value });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to approve waste' });
  }
});

// ── Expiry Alerts ───────────────────────────────────────────────────────────
router.get('/expiry-alerts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { status, outlet_id } = req.query as Record<string, string>;
  try {
    const { data: settings } = await supabaseAdmin.from('bar_settings').select('expiry_alert_days, critical_expiry_days').single();
    const alertDays = Number(settings?.expiry_alert_days || 3);
    const criticalDays = Number(settings?.critical_expiry_days || 1);

    let q = supabaseAdmin
      .from('bar_inventory_batches')
      .select('*, bar_inventory_items(name, item_type), bar_storage_locations(name)')
      .gt('remaining_qty', 0)
      .eq('is_deleted', false)
      .order('expiry_date', { ascending: true });

    if (outlet_id) q = q.eq('outlet_id', outlet_id);

    if (status === 'expired') q = q.lt('expiry_date', 'now()');
    else if (status === 'expiring_soon') q = q.lte('expiry_date', `now() + interval '${alertDays} days'`).gt('expiry_date', `now() + interval '${criticalDays} days'`);
    else if (status === 'expiring_today') q = q.lte('expiry_date', `now() + interval '1 day'`).gt('expiry_date', 'now()');
    else if (status === 'fresh') q = q.gt('expiry_date', `now() + interval '${alertDays} days'`);

    const { data, error } = await q;
    if (error) throw error;

    const alerts = (data || []).map((batch: any) => {
      const expiryDate = batch.expiry_date ? new Date(batch.expiry_date) : null;
      const now = new Date();
      const daysUntil = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      let expiryStatus: string = 'no_expiry';
      if (!expiryDate) expiryStatus = 'no_expiry';
      else if (daysUntil! < 0) expiryStatus = 'expired';
      else if (daysUntil === 0) expiryStatus = 'expiring_today';
      else if (daysUntil! <= criticalDays) expiryStatus = 'expiring_soon';
      else if (daysUntil! <= alertDays) expiryStatus = 'expiring_soon';
      else expiryStatus = 'fresh';

      return {
        batch_id: batch.id,
        batch_number: batch.batch_number,
        inventory_item_id: batch.inventory_item_id,
        item_name: batch.bar_inventory_items?.name,
        item_type: batch.bar_inventory_items?.item_type,
        remaining_qty: batch.remaining_qty,
        unit_cost: batch.unit_cost,
        total_value: batch.total_cost,
        production_date: batch.production_date,
        expiry_date: batch.expiry_date,
        best_before_date: batch.best_before_date,
        shelf_life_days: batch.shelf_life_days,
        storage_location_id: batch.storage_location_id,
        storage_location_name: batch.bar_storage_locations?.name,
        batch_status: batch.status,
        expiry_status: expiryStatus,
        days_until_expiry: daysUntil,
      };
    });
    return res.json(alerts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Production Planning ───────────────────────────────────────────────────
router.get('/production-planning', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  try {
    let recipeQ = supabaseAdmin
      .from('bar_recipes')
      .select('id, name, yield_qty, yield_unit, cost_per_portion, selling_price, pour_cost_percent')
      .eq('is_deleted', false)
      .eq('status', 'active');
    if (outlet_id) recipeQ = recipeQ.eq('outlet_id', outlet_id);
    const { data: recipes, error } = await recipeQ;
    if (error) throw error;

    const plans = (recipes || []).map((recipe: any) => ({
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      current_stock: 0,
      min_stock: 0,
      forecast_demand: 0,
      suggested_qty: 0,
    }));
    return res.json(plans);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Settings ──────────────────────────────────────────────────────────────
router.get('/settings', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('bar_settings').select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch('/settings', authenticate, requirePermission('fb:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data: existing } = await supabaseAdmin.from('bar_settings').select('id').single();
  let result;
  if (existing) {
    result = await supabaseAdmin.from('bar_settings').update(req.body).eq('id', existing.id).select().single();
  } else {
    result = await supabaseAdmin.from('bar_settings').insert(req.body).select().single();
  }
  if (result.error) return res.status(500).json({ error: result.error.message });
  return res.json({ success: true, data: result.data });
});

// ── Audit Log ─────────────────────────────────────────────────────────────
router.get('/audit-log', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { module, limit = '50', outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('bar_audit_log').select('*').order('created_at', { ascending: false }).limit(Number(limit));
  if (module) q = q.eq('module', module);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

export default router;
