import { Router } from 'express';
import crypto from 'crypto';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Supplier Master Database ───────────────────────────────────────
// Create or update supplier
router.post('/suppliers', authenticate, requirePermission('fb:procurement:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    name,
    contactName,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    currency,
    categories,
    isActive,
  } = req.body || {};
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email, and phone are required' });
  }

  const { data, error } = await supabaseAdmin.from('suppliers').insert({
    name,
    contact_name: contactName,
    email,
    phone,
    address,
    tax_id: taxId,
    payment_terms: paymentTerms || 'NET 30',
    currency: currency || 'ETB',
    categories: categories || [],
    is_active: isActive !== false,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate supplier cache
  cacheService.invalidatePattern('suppliers:*');

  return res.status(201).json(data);
});

// Get all suppliers with performance metrics
router.get('/suppliers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { category, isActive } = req.query as Record<string, string>;
  
  const cacheKey = `suppliers:${category || 'all'}:${isActive || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin.from('suppliers').select('*').order('name');
  if (category) q = q.contains('categories', [category]);
  if (isActive !== undefined) q = q.eq('is_active', isActive === 'true');
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Get performance metrics for each supplier
  const suppliersWithMetrics = await Promise.all(
    (data || []).map(async (supplier) => {
      const metrics = await calculateSupplierPerformance(supplier.id);
      return {
        ...supplier,
        performance: metrics,
      };
    })
  );

  const result = {
    suppliers: suppliersWithMetrics,
    summary: {
      total: suppliersWithMetrics.length,
      active: suppliersWithMetrics.filter(s => s.is_active).length,
      byCategory: categorizeSuppliers(suppliersWithMetrics),
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10 minute TTL
  return res.json(result);
});

// Helper function to calculate supplier performance
async function calculateSupplierPerformance(supplierId: string) {
  // Get purchase orders for this supplier
  const { data: pos } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('supplier_id', supplierId);

  const totalOrders = pos?.length || 0;
  
  // Calculate on-time delivery rate
  const onTimeDeliveries = pos?.filter(po => {
    const actualDate = new Date(po.actual_delivery_date || po.received_at);
    const expectedDate = new Date(po.expected_delivery_date);
    return actualDate <= expectedDate;
  }).length || 0;
  
  const onTimeRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 0;

  // Calculate quality acceptance rate
  const acceptedReceipts = pos?.filter(po => po.quality_status === 'accepted').length || 0;
  const qualityRate = totalOrders > 0 ? (acceptedReceipts / totalOrders) * 100 : 0;

  // Calculate average price competitiveness (simplified)
  const avgPriceCompetitiveness = 85; // Placeholder - would compare with market rates

  return {
    totalOrders,
    onTimeDeliveryRate: Math.round(onTimeRate * 10) / 10,
    qualityAcceptanceRate: Math.round(qualityRate * 10) / 10,
    priceCompetitiveness: avgPriceCompetitiveness,
    overallScore: Math.round((onTimeRate * 0.4 + qualityRate * 0.4 + avgPriceCompetitiveness * 0.2)),
  };
}

function categorizeSuppliers(suppliers: any[]) {
  const categories: Record<string, number> = {};
  suppliers.forEach(s => {
    s.categories?.forEach((cat: string) => {
      categories[cat] = (categories[cat] || 0) + 1;
    });
  });
  return categories;
}

// ── Automated Purchase Order Generation ─────────────────────────
// Generate POs based on par levels
router.post('/purchase-orders/generate', authenticate, requirePermission('fb:procurement:generate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, supplierId, categories } = req.body || {};
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required' });
  }

  // Get inventory items below par level
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .lt('quantity', supabaseAdmin.raw('par_level'));

  if (!inventory || inventory.length === 0) {
    return res.json({ success: true, message: 'No items below par level', pos: [] });
  }

  // Group items by preferred supplier
  const itemsBySupplier: Record<string, any[]> = {};
  
  for (const item of inventory || []) {
    const supplierId = item.preferred_supplier_id;
    if (!supplierId) continue;
    
    if (!itemsBySupplier[supplierId]) {
      itemsBySupplier[supplierId] = [];
    }
    itemsBySupplier[supplierId].push(item);
  }

  // Generate POs for each supplier
  const pos = [];
  
  for (const [suppId, items] of Object.entries(itemsBySupplier)) {
    if (supplierId && suppId !== supplierId) continue;
    
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    const lineItems = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.par_level - item.quantity,
      unit_price: item.standard_cost || 0,
      total: (item.par_level - item.quantity) * (item.standard_cost || 0),
    }));

    const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

    const { data, error } = await supabaseAdmin.from('purchase_orders').insert({
      po_number: poNumber,
      supplier_id: suppId,
      restaurant_id: restaurantId,
      line_items: lineItems,
      total_amount: totalAmount,
      status: 'pending',
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_by: req.user?.id,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error(`Error creating PO for supplier ${suppId}:`, error);
      continue;
    }

    pos.push(data);
  }

  // Invalidate cache
  cacheService.invalidatePattern('purchase-orders:*');
  cacheService.invalidatePattern('suppliers:*');

  return res.json({
    success: true,
    message: `Generated ${pos.length} purchase orders`,
    pos,
  });
});

// Get all purchase orders
router.get('/purchase-orders', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, supplierId, restaurantId } = req.query as Record<string, string>;
  
  const cacheKey = `purchase-orders:${status || 'all'}:${supplierId || 'all'}:${restaurantId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('purchase_orders')
    .select('*, suppliers(name)')
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (supplierId) q = q.eq('supplier_id', supplierId);
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    orders: data || [],
    summary: {
      total: (data || []).length,
      pending: (data || []).filter(o => o.status === 'pending').length,
      approved: (data || []).filter(o => o.status === 'approved').length,
      received: (data || []).filter(o => o.status === 'received').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

// ── Goods Receipt with Quality Control ─────────────────────────────
// Record goods receipt with quality check
router.post('/goods-receipt', authenticate, requirePermission('fb:procurement:receive'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    poNumber,
    receivedItems,
    receivedBy,
    qualityCheck,
    notes,
  } = req.body || {};
  
  if (!poNumber || !receivedItems || !Array.isArray(receivedItems)) {
    return res.status(400).json({ error: 'poNumber and receivedItems array are required' });
  }

  // Get the PO
  const { data: po, error: poError } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('po_number', poNumber)
    .single();

  if (poError || !po) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }

  // Create goods receipt
  const receiptNumber = `GR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  
  const { data: receipt, error: receiptError } = await supabaseAdmin.from('goods_receipts').insert({
    receipt_number: receiptNumber,
    po_id: po.id,
    po_number: poNumber,
    supplier_id: po.supplier_id,
    restaurant_id: po.restaurant_id,
    received_items: receivedItems,
    quality_check: qualityCheck || {},
    quality_status: qualityCheck?.passed ? 'accepted' : 'rejected',
    notes,
    received_by: receivedBy || req.user?.id,
    received_at: new Date().toISOString(),
  }).select().single();

  if (receiptError) return res.status(500).json({ error: receiptError.message });

  // Update inventory
  for (const item of receivedItems) {
    await supabaseAdmin.rpc('update_inventory_on_receipt', {
      p_product_id: item.product_id,
      p_quantity: item.received_quantity,
      p_restaurant_id: po.restaurant_id,
    });
  }

  // Update PO status
  await supabaseAdmin
    .from('purchase_orders')
    .update({
      status: 'received',
      actual_delivery_date: new Date().toISOString().split('T')[0],
      received_at: new Date().toISOString(),
      quality_status: qualityCheck?.passed ? 'accepted' : 'rejected',
    })
    .eq('id', po.id);

  // Invalidate caches
  cacheService.invalidatePattern('goods-receipts:*');
  cacheService.invalidatePattern('purchase-orders:*');
  cacheService.invalidatePattern('inventory:*');

  return res.status(201).json({ success: true, receipt });
});

// ── Three-Way Matching ─────────────────────────────────────────────
// Perform three-way match (PO, Receipt, Invoice)
router.post('/three-way-match', authenticate, requirePermission('fb:procurement:match'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { poId, receiptId, invoiceData } = req.body || {};
  
  if (!poId || !receiptId || !invoiceData) {
    return res.status(400).json({ error: 'poId, receiptId, and invoiceData are required' });
  }

  // Get PO
  const { data: po } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('id', poId)
    .single();

  // Get Receipt
  const { data: receipt } = await supabaseAdmin
    .from('goods_receipts')
    .select('*')
    .eq('id', receiptId)
    .single();

  if (!po || !receipt) {
    return res.status(404).json({ error: 'PO or Receipt not found' });
  }

  // Calculate totals
  const poTotal = po.total_amount;
  const receiptTotal = receipt.received_items.reduce((sum: number, item: any) => 
    sum + (item.received_quantity * item.unit_price), 0
  );
  const invoiceTotal = invoiceData.total_amount;

  // Perform matching logic
  const tolerance = 0.05; // 5% tolerance
  const poReceiptMatch = Math.abs(poTotal - receiptTotal) / poTotal <= tolerance;
  const receiptInvoiceMatch = Math.abs(receiptTotal - invoiceTotal) / receiptTotal <= tolerance;
  const poInvoiceMatch = Math.abs(poTotal - invoiceTotal) / poTotal <= tolerance;

  const matchStatus = poReceiptMatch && receiptInvoiceMatch && poInvoiceMatch ? 'matched' : 'discrepancy';
  
  const discrepancies = [];
  if (!poReceiptMatch) discrepancies.push('PO and Receipt totals do not match');
  if (!receiptInvoiceMatch) discrepancies.push('Receipt and Invoice totals do not match');
  if (!poInvoiceMatch) discrepancies.push('PO and Invoice totals do not match');

  // Create three-way match record
  const { data, error } = await supabaseAdmin.from('three_way_matches').insert({
    po_id: poId,
    po_number: po.po_number,
    receipt_id: receiptId,
    receipt_number: receipt.receipt_number,
    invoice_number: invoiceData.invoice_number,
    invoice_amount: invoiceTotal,
    po_total: poTotal,
    receipt_total: receiptTotal,
    match_status: matchStatus,
    discrepancies,
    matched_by: req.user?.id,
    matched_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // If matched, update invoice status
  if (matchStatus === 'matched') {
    await supabaseAdmin
      .from('supplier_invoices')
      .insert({
        invoice_number: invoiceData.invoice_number,
        supplier_id: po.supplier_id,
        po_id: poId,
        amount: invoiceTotal,
        currency: po.currency || 'ETB',
        due_date: invoiceData.due_date,
        status: 'approved_for_payment',
        created_at: new Date().toISOString(),
      });
  }

  // Invalidate cache
  cacheService.invalidatePattern('three-way-matches:*');

  return res.status(201).json({
    success: true,
    match: data,
    canProceedToPayment: matchStatus === 'matched',
  });
});

// ── AI-Powered Demand Forecasting ─────────────────────────────────
// Generate demand forecast for products
router.post('/demand-forecast', authenticate, requirePermission('fb:procurement:forecast'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { 
    restaurantId, 
    productId, 
    forecastPeriods, 
    historicalDays 
  } = req.body || {};
  
  if (!restaurantId || !productId) {
    return res.status(400).json({ error: 'restaurantId and productId are required' });
  }

  // Get historical consumption data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (historicalDays || 30));
  
  const { data: historicalData } = await supabaseAdmin
    .from('inventory_transactions')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('product_id', productId)
    .eq('transaction_type', 'consumption')
    .gte('transaction_date', startDate.toISOString())
    .order('transaction_date', { ascending: true });

  // Calculate simple moving average forecast
  const dailyConsumption = (historicalData || []).reduce((sum: number, t: any) => 
    sum + Math.abs(t.quantity_change), 0
  ) / (historicalDays || 30);

  const forecast = [];
  const currentDate = new Date();

  for (let i = 1; i <= (forecastPeriods || 7); i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Apply seasonal adjustment (simplified)
    const dayOfWeek = forecastDate.getDay();
    const seasonalFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0; // Higher on weekends
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      forecasted_demand: Math.round(dailyConsumption * seasonalFactor),
      confidence: 0.75, // Placeholder confidence score
    });
  }

  // Save forecast
  const { data, error } = await supabaseAdmin.from('demand_forecasts').insert({
    restaurant_id: restaurantId,
    product_id: productId,
    forecast_period_days: forecastPeriods || 7,
    historical_days: historicalDays || 30,
    forecast_data: forecast,
    generated_at: new Date().toISOString(),
    generated_by: req.user?.id,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('demand-forecasts:*');

  return res.status(201).json({
    success: true,
    forecast: data,
    dailyAverage: Math.round(dailyConsumption * 100) / 100,
  });
});

// ── Automated Par Level Optimization ─────────────────────────────
// Optimize par levels based on demand forecast
router.post('/par-levels/optimize', authenticate, requirePermission('fb:procurement:optimize'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, serviceLevel, leadTimeDays } = req.body || {};
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required' });
  }

  const serviceLevelValue = serviceLevel || 0.95; // 95% service level
  const leadTime = leadTimeDays || 3; // 3 days lead time

  // Get all inventory items
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId);

  const optimizations = [];

  for (const item of inventory || []) {
    // Get recent demand
    const recentDemand = await getRecentDemand(item.product_id, restaurantId, 30);
    const dailyDemand = recentDemand / 30;

    // Calculate safety stock using service level
    const zScore = 1.645; // Z-score for 95% service level
    const demandStdDev = dailyDemand * 0.2; // Assume 20% standard deviation
    const safetyStock = Math.ceil(zScore * demandStdDev * Math.sqrt(leadTime));

    // Calculate reorder point
    const reorderPoint = Math.ceil(dailyDemand * leadTime + safetyStock);

    // Calculate economic order quantity (simplified)
    const holdingCost = 0.1; // 10% annual holding cost
    const orderingCost = 50; // Fixed ordering cost
    const annualDemand = dailyDemand * 365;
    const eoq = Math.sqrt((2 * orderingCost * annualDemand) / (holdingCost * (item.standard_cost || 1)));

    const optimization = {
      product_id: item.product_id,
      product_name: item.product_name,
      current_par_level: item.par_level,
      optimized_par_level: Math.ceil(reorderPoint + eoq),
      safety_stock: safetyStock,
      reorder_point: reorderPoint,
      economic_order_quantity: Math.round(eoq),
      daily_demand: Math.round(dailyDemand * 100) / 100,
      service_level: serviceLevelValue,
    };

    optimizations.push(optimization);

    // Update par level if significantly different
    if (Math.abs(optimization.optimized_par_level - item.par_level) > item.par_level * 0.1) {
      await supabaseAdmin
        .from('inventory')
        .update({ par_level: optimization.optimized_par_level })
        .eq('id', item.id);
    }
  }

  // Save optimization results
  const { data, error } = await supabaseAdmin.from('par_level_optimizations').insert({
    restaurant_id: restaurantId,
    service_level: serviceLevelValue,
    lead_time_days: leadTime,
    optimizations,
    optimized_at: new Date().toISOString(),
    optimized_by: req.user?.id,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('inventory:*');

  return res.status(201).json({
    success: true,
    optimization: data,
    summary: {
      totalItems: optimizations.length,
      itemsOptimized: optimizations.filter(o => 
        Math.abs(o.optimized_par_level - o.current_par_level) > o.current_par_level * 0.1
      ).length,
    },
  });
});

// Helper function to get recent demand
async function getRecentDemand(productId: string, restaurantId: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data } = await supabaseAdmin
    .from('inventory_transactions')
    .select('quantity_change')
    .eq('restaurant_id', restaurantId)
    .eq('product_id', productId)
    .eq('transaction_type', 'consumption')
    .gte('transaction_date', startDate.toISOString());

  return Math.abs((data || []).reduce((sum: number, t: any) => sum + t.quantity_change, 0));
}

// ── Expiry Date Tracking and FEFO ───────────────────────────────────
// Get inventory with expiry dates sorted by FEFO (First Expired, First Out)
router.get('/inventory/expiry', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId } = req.query as Record<string, string>;
  
  const cacheKey = `inventory-expiry:${restaurantId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId || '')
    .not('expiry_date', 'is', null)
    .order('expiry_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const today = new Date();
  const warningDays = 7;
  const criticalDays = 3;

  const classifiedItems = (data || []).map((item: any) => {
    const expiryDate = new Date(item.expiry_date);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status;
    if (daysUntilExpiry < 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= criticalDays) {
      status = 'critical';
    } else if (daysUntilExpiry <= warningDays) {
      status = 'warning';
    } else {
      status = 'good';
    }

    return {
      ...item,
      daysUntilExpiry,
      status,
      recommendation: getExpiryRecommendation(status, daysUntilExpiry),
    };
  });

  const result = {
    restaurantId,
    items: classifiedItems,
    summary: {
      total: classifiedItems.length,
      expired: classifiedItems.filter(i => i.status === 'expired').length,
      critical: classifiedItems.filter(i => i.status === 'critical').length,
      warning: classifiedItems.filter(i => i.status === 'warning').length,
      good: classifiedItems.filter(i => i.status === 'good').length,
    },
    fefoOrder: classifiedItems.sort((a, b) => 
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    ),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minute TTL
  return res.json(result);
});

function getExpiryRecommendation(status: string, daysUntilExpiry: number): string {
  switch (status) {
    case 'expired':
      return 'Remove from inventory immediately - item has expired';
    case 'critical':
      return `Use within ${daysUntilExpiry} days or mark for discount`;
    case 'warning':
      return `Use within ${daysUntilExpiry} days - prioritize in FEFO order`;
    case 'good':
      return 'Normal stock - follow FEFO ordering';
    default:
      return 'No recommendation';
  }
}

// Record stock consumption following FEFO
router.post('/inventory/consume-fefo', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { restaurantId, productId, quantity, reason } = req.body || {};
  
  if (!restaurantId || !productId || !quantity) {
    return res.status(400).json({ error: 'restaurantId, productId, and quantity are required' });
  }

  // Get inventory items sorted by expiry (FEFO)
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('product_id', productId)
    .gt('quantity', 0)
    .not('expiry_date', 'is', null)
    .order('expiry_date', { ascending: true });

  if (!inventory || inventory.length === 0) {
    return res.status(404).json({ error: 'No available inventory found for this product' });
  }

  let remainingToConsume = quantity;
  const consumptionLog = [];

  for (const item of inventory) {
    if (remainingToConsume <= 0) break;

    const consumeFromItem = Math.min(remainingToConsume, item.quantity);
    
    // Update inventory
    await supabaseAdmin
      .from('inventory')
      .update({
        quantity: item.quantity - consumeFromItem,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    // Record transaction
    await supabaseAdmin.from('inventory_transactions').insert({
      restaurant_id: restaurantId,
      product_id: productId,
      quantity_change: -consumeFromItem,
      transaction_type: 'consumption',
      reason: reason || 'FEFO consumption',
      expiry_date: item.expiry_date,
      transaction_date: new Date().toISOString(),
    });

    consumptionLog.push({
      inventoryId: item.id,
      expiryDate: item.expiry_date,
      consumed: consumeFromItem,
      remaining: item.quantity - consumeFromItem,
    });

    remainingToConsume -= consumeFromItem;
  }

  // Invalidate cache
  cacheService.invalidatePattern('inventory:*');
  cacheService.invalidatePattern('inventory-expiry:*');

  return res.json({
    success: true,
    consumed: quantity - remainingToConsume,
    remainingToConsume,
    consumptionLog,
  });
});

// =====================
// GRNs (Goods Received Notes)
// =====================
router.get('/grns', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('inventory_grns').select('*').order('received_date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/grns', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { number, supplierId, supplierName, purchaseOrderId, deliveryNote, invoiceNumber, receivedDate, items, totalValue } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const grnId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin.from('inventory_grns')
      .insert({
        id: grnId, number, supplier_id: supplierId, supplier_name: supplierName,
        purchase_order_id: purchaseOrderId, delivery_note: deliveryNote, invoice_number: invoiceNumber,
        received_date: receivedDate, receiver: req.user!.name || req.user!.id,
        items: items || [], total_value: totalValue || 0,
      })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Auto-create AP bill draft
    const { data: apResult, error: apError } = await supabaseAdmin.rpc('create_ap_bill_from_grn', { p_grn_id: grnId, p_created_by: req.user!.id });
    if (apError) console.error('AP bill creation failed:', apError.message);

    return res.json({ success: true, grn: data, apBillId: apResult?.[0]?.ap_bill_id || null });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/grns/:id/discrepancy', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { discrepancyStatus, discrepancyNotes } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('inventory_grns')
      .update({ discrepancy_status: discrepancyStatus, discrepancy_notes: discrepancyNotes })
      .eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, grn: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Stock Counts
router.get('/stock-counts', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('stock_counts')
      .select('*, stock_count_lines(*)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/stock-counts', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { locationId, countDate, notes, lines } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const scId = crypto.randomUUID();
    const { error: scError } = await supabaseAdmin.from('stock_counts')
      .insert({ id: scId, location_id: locationId, count_date: countDate, counted_by: req.user!.id, status: 'In Progress', notes });
    if (scError) return res.status(500).json({ error: scError.message });

    if (lines && lines.length > 0) {
      const scLines = lines.map((l: any) => ({
        stock_count_id: scId,
        item_id: l.itemId,
        item_name: l.itemName,
        ingredient_id: l.ingredientId,
        expected_quantity: l.expectedQuantity,
        counted_quantity: l.countedQuantity,
        unit: l.unit,
        variance_quantity: (l.countedQuantity || 0) - (l.expectedQuantity || 0),
        variance_value: l.varianceValue || 0,
        notes: l.notes,
      }));
      const { error: linesError } = await supabaseAdmin.from('stock_count_lines').insert(scLines);
      if (linesError) return res.status(500).json({ error: linesError.message });
    }

    return res.json({ success: true, stockCountId: scId });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/stock-counts/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { status, lines } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { status };
    if (status === 'Approved') { updateData.approved_by = req.user!.id; }

    const { data, error } = await supabaseAdmin.from('stock_counts').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Update counted lines if provided
    if (lines && lines.length > 0) {
      for (const line of lines) {
        await supabaseAdmin.from('stock_count_lines')
          .update({ counted_quantity: line.countedQuantity, variance_quantity: (line.countedQuantity || 0) - (line.expectedQuantity || 0) })
          .eq('id', line.id);
      }
    }

    // If approved, post stock adjustments
    if (status === 'Approved') {
      const { data: scLines } = await supabaseAdmin.from('stock_count_lines').select('*').eq('stock_count_id', req.params.id);
      for (const line of scLines || []) {
        if (line.variance_quantity && line.variance_quantity !== 0) {
          // Post stock transaction for the adjustment
          await supabaseAdmin.from('stock_transactions').insert({
            ingredient_id: line.ingredient_id,
            location_id: data.location_id,
            transaction_type: 'Adjustment',
            quantity: line.variance_quantity,
            unit: line.unit,
            cost_per_unit: 0,
            total_value: line.variance_value || 0,
            reference_doc: data.id,
            reference_type: 'StockCount',
            notes: `Stock count adjustment: ${line.item_name || line.ingredient_id}`,
          });
        }
      }
    }

    return res.json({ success: true, stockCount: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Requisitions
router.get('/requisitions', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('requisitions')
      .select('*, requisition_lines(*)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/requisitions', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { fromLocationId, toOutletId, department, priority, requiredDate, notes, lines } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const reqId = crypto.randomUUID();
    const reqNumber = `REQ-${Date.now().toString().slice(-6)}`;
    const { error: reqError } = await supabaseAdmin.from('requisitions')
      .insert({
        id: reqId, req_number: reqNumber, from_location_id: fromLocationId, to_outlet_id: toOutletId,
        department, priority: priority || 'Normal', required_date: requiredDate,
        status: 'Draft', requested_by: req.user!.id, notes,
      });
    if (reqError) return res.status(500).json({ error: reqError.message });

    if (lines && lines.length > 0) {
      const reqLines = lines.map((l: any) => ({
        requisition_id: reqId,
        item_id: l.itemId,
        item_name: l.itemName,
        quantity: l.quantity,
        unit: l.unit,
        notes: l.notes,
      }));
      const { error: linesError } = await supabaseAdmin.from('requisition_lines').insert(reqLines);
      if (linesError) return res.status(500).json({ error: linesError.message });
    }

    return res.json({ success: true, requisitionId: reqId, reqNumber });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/requisitions/:id', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  const { status, fulfilledLines } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { status };
    if (status === 'Approved') { updateData.approved_by = req.user!.id; updateData.approved_at = new Date().toISOString(); }
    if (status === 'Fulfilled') { updateData.fulfilled_by = req.user!.id; updateData.fulfilled_at = new Date().toISOString(); }

    const { data, error } = await supabaseAdmin.from('requisitions').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Update fulfilled quantities if provided
    if (fulfilledLines && fulfilledLines.length > 0) {
      for (const line of fulfilledLines) {
        await supabaseAdmin.from('requisition_lines')
          .update({ fulfilled_quantity: line.fulfilledQuantity }).eq('id', line.id);
      }
    }

    return res.json({ success: true, requisition: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
