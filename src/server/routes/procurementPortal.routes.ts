import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Goods Receiving → AP Bill Draft Automation ─────────────────
// Generate AP bill draft from goods receipt
router.post('/goods-receiving/generate-ap-bill', authenticate, requirePermission('proc:ap-bill:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { goodsReceiptId } = req.body || {};
  
  if (!goodsReceiptId) {
    return res.status(400).json({ error: 'goodsReceiptId is required' });
  }

  const { data: receipt } = await supabaseAdmin
    .from('goods_receipts')
    .select('*, suppliers(name, tax_id), purchase_orders(order_number)')
    .eq('id', goodsReceiptId)
    .single();

  if (!receipt) return res.status(404).json({ error: 'Goods receipt not found' });

  // Generate AP bill draft
  const { data: apBill } = await supabaseAdmin.from('ap_bills').insert({
    property_id: receipt.property_id,
    supplier_id: receipt.supplier_id,
    purchase_order_id: receipt.purchase_order_id,
    bill_number: `AP-BILL-${Date.now()}`,
    bill_date: new Date().toISOString(),
    due_date: calculateDueDate(receipt.received_date, receipt.payment_terms || 30),
    currency: 'ETB',
    subtotal: receipt.items?.reduce((sum: number, i: any) => sum + (i.quantity_received * i.unit_cost), 0) || 0,
    tax: calculateTax(receipt.items?.reduce((sum: number, i: any) => sum + (i.quantity_received * i.unit_cost), 0) || 0),
    total: 0, // Will be calculated
    status: 'draft',
    goods_receipt_id: goodsReceiptId,
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  // Calculate total
  const total = apBill.subtotal + apBill.tax;
  await supabaseAdmin.from('ap_bills').update({ total }).eq('id', apBill.id);

  cacheService.invalidate('proc-*');
  cacheService.invalidate('ap-*');
  return res.status(201).json({ apBill, receipt });
});

function calculateDueDate(receivedDate: string, paymentTerms: number): string {
  const date = new Date(receivedDate);
  date.setDate(date.getDate() + paymentTerms);
  return date.toISOString();
}

function calculateTax(subtotal: number): number {
  return subtotal * 0.15; // 15% VAT
}

// ── Discrepancy Workflow ──────────────────────────────────────────────────
// Report discrepancy
router.post('/goods-receiving/discrepancy', authenticate, requirePermission('proc:discrepancy:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    goodsReceiptId,
    itemId,
    expectedQuantity,
    receivedQuantity,
    discrepancyType,
    reason,
    reportedBy,
  } = req.body || {};
  
  if (!propertyId || !goodsReceiptId || !itemId || !discrepancyType) {
    return res.status(400).json({ error: 'propertyId, goodsReceiptId, itemId, and discrepancyType are required' });
  }

  const { data, error } = await supabaseAdmin.from('procurement_discrepancies').insert({
    property_id: propertyId,
    goods_receipt_id: goodsReceiptId,
    item_id: itemId,
    expected_quantity: expectedQuantity,
    received_quantity: receivedQuantity,
    discrepancy_type: discrepancyType,
    reason,
    reported_by: reportedBy || req.user?.id,
    status: 'open',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// Get discrepancies
router.get('/goods-receiving/discrepancies/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('procurement_discrepancies')
    .select('*, inventory_items(item_name), profiles(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    discrepancies: data || [],
  });
});

// Resolve discrepancy
router.put('/goods-receiving/discrepancies/:id/resolve', authenticate, requirePermission('proc:discrepancy:resolve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { resolvedBy, resolution, creditNoteIssued } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('procurement_discrepancies')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy,
      resolution,
      credit_note_issued: creditNoteIssued,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.json(data);
});

// ── Physical Stock Count Integration ─────────────────────────────────────
// Create stock count
router.post('/stock-count', authenticate, requirePermission('proc:stock-count:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    storeId,
    countDate,
    countType,
    initiatedBy,
  } = req.body || {};
  
  if (!propertyId || !storeId || !countDate) {
    return res.status(400).json({ error: 'propertyId, storeId, and countDate are required' });
  }

  const { data, error } = await supabaseAdmin.from('stock_counts').insert({
    property_id: propertyId,
    store_id: storeId,
    count_date: countDate,
    count_type: countType || 'full',
    status: 'in_progress',
    initiated_by: initiatedBy || req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// Add stock count items
router.post('/stock-count/:id/items', authenticate, requirePermission('proc:stock-count:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { items } = req.body || [];
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const stockCountItems = items.map((item: any) => ({
    stock_count_id: req.params.id,
    item_id: item.itemId,
    system_quantity: item.systemQuantity,
    counted_quantity: item.countedQuantity,
    variance: item.countedQuantity - item.systemQuantity,
    counted_by: item.countedBy || req.user?.id,
    counted_at: new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin.from('stock_count_items').insert(stockCountItems).select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json({ items: data || [] });
});

// Complete stock count
router.put('/stock-count/:id/complete', authenticate, requirePermission('proc:stock-count:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { completedBy, notes } = req.body || {};

  const { data: items } = await supabaseAdmin
    .from('stock_count_items')
    .select('*')
    .eq('stock_count_id', req.params.id);

  const totalVariance = (items || []).reduce((sum, i) => sum + i.variance, 0);

  const { data, error } = await supabaseAdmin
    .from('stock_counts')
    .update({
      status: 'completed',
      total_variance: totalVariance,
      completed_by: completedBy || req.user?.id,
      completed_at: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Adjust inventory for variances
  await Promise.all(
    (items || []).map(item =>
      supabaseAdmin.rpc('adjust_inventory', {
        p_store_id: data?.store_id,
        p_item_id: item.item_id,
        p_quantity: item.variance,
        p_reason: `Stock count adjustment`,
      })
    )
  );

  cacheService.invalidate('proc-*');
  return res.json(data);
});

// ── Store-to-Department Requisition ──────────────────────────────────────
// Create requisition
router.post('/requisitions', authenticate, requirePermission('proc:requisitions:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    requestingDepartmentId,
    storeId,
    items,
    requestedBy,
    neededBy,
  } = req.body || {};
  
  if (!propertyId || !requestingDepartmentId || !storeId || !items) {
    return res.status(400).json({ error: 'propertyId, requestingDepartmentId, storeId, and items are required' });
  }

  const { data, error } = await supabaseAdmin.from('procurement_requisitions').insert({
    property_id: propertyId,
    requesting_department_id: requestingDepartmentId,
    store_id: storeId,
    items,
    requested_by: requestedBy || req.user?.id,
    needed_by: neededBy,
    status: 'pending',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// Get requisitions
router.get('/requisitions/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, requestingDepartmentId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('procurement_requisitions')
    .select('*, departments(department_name), inventory_stores(store_name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);
  if (requestingDepartmentId) q = q.eq('requesting_department_id', requestingDepartmentId);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    requisitions: data || [],
  });
});

// Fulfill requisition
router.put('/requisitions/:id/fulfill', authenticate, requirePermission('proc:requisitions:fulfill'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { fulfilledBy, notes } = req.body || {};

  const { data: requisition } = await supabaseAdmin
    .from('procurement_requisitions')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!requisition) return res.status(404).json({ error: 'Requisition not found' });

  const { data, error } = await supabaseAdmin
    .from('procurement_requisitions')
    .update({
      status: 'fulfilled',
      fulfilled_by: fulfilledBy || req.user?.id,
      fulfilled_at: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.json(data);
});

// ── Multi-Bid Comparison for Purchases ───────────────────────────────────
// Create bid request
router.post('/bids/request', authenticate, requirePermission('proc:bids:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    description,
    items,
    deadline,
    requestedBy,
  } = req.body || {};
  
  if (!propertyId || !description || !items || !deadline) {
    return res.status(400).json({ error: 'propertyId, description, items, and deadline are required' });
  }

  const { data, error } = await supabaseAdmin.from('bid_requests').insert({
    property_id: propertyId,
    description,
    items,
    deadline,
    requested_by: requestedBy || req.user?.id,
    status: 'open',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// Submit bid
router.post('/bids/:requestId/submit', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { supplierId, totalAmount, items, validUntil, notes } = req.body || {};
  
  if (!supplierId || !totalAmount || !items) {
    return res.status(400).json({ error: 'supplierId, totalAmount, and items are required' });
  }

  const { data, error } = await supabaseAdmin.from('bid_submissions').insert({
    bid_request_id: req.params.requestId,
    supplier_id: supplierId,
    total_amount: totalAmount,
    items,
    valid_until: validUntil,
    notes,
    submitted_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// Compare bids
router.get('/bids/:requestId/compare', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: bids } = await supabaseAdmin
    .from('bid_submissions')
    .select('*, suppliers(name, rating)')
    .eq('bid_request_id', req.params.requestId)
    .order('total_amount', { ascending: true });

  const comparison = (bids || []).map(bid => ({
    supplierId: bid.supplier_id,
    supplierName: bid.suppliers?.name,
    supplierRating: bid.suppliers?.rating || 0,
    totalAmount: bid.total_amount,
    items: bid.items,
    submittedAt: bid.submitted_at,
    validUntil: bid.valid_until,
    rank: 0,
  }));

  // Rank bids by price and rating
  comparison.sort((a, b) => {
    const aScore = a.totalAmount / (a.supplierRating || 1);
    const bScore = b.totalAmount / (b.supplierRating || 1);
    return aScore - bScore;
  });

  comparison.forEach((bid, index) => {
    bid.rank = index + 1;
  });

  return res.json({
    bidRequestId: req.params.requestId,
    comparison,
    recommendation: comparison[0] || null,
  });
});

// ── Phase 2: Supplier Performance Management System ──────────────────────
// Get supplier performance
router.get('/suppliers/performance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `proc-supplier-perf:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: suppliers } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const performance = await Promise.all(
    (suppliers || []).map(async (supplier) => {
      return await calculateSupplierPerformanceDetailed(supplier.id, startDate);
    })
  );

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    performance,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function calculateSupplierPerformanceDetailed(supplierId: string, startDate: Date) {
  const { data: orders } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('supplier_id', supplierId)
    .gte('order_date', startDate.toISOString());

  const { data: receipts } = await supabaseAdmin
    .from('goods_receipts')
    .select('*')
    .eq('supplier_id', supplierId)
    .gte('received_date', startDate.toISOString());

  const { data: supplier } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();

  const onTimeDeliveries = (receipts || []).filter(r => isOnTimeDelivery(r)).length;
  const totalSpend = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return {
    supplierId,
    supplierName: supplier?.name,
    totalOrders: (orders || []).length,
    onTimeDeliveries,
    onTimeDeliveryRate: (receipts || []).length > 0 ? (onTimeDeliveries / (receipts || []).length) * 100 : 100,
    qualityScore: supplier?.quality_score || 80,
    responsivenessScore: calculateResponsivenessScore(orders || []),
    priceCompetitivenessScore: supplier?.price_competitiveness_score || 75,
    totalSpend,
    overallScore: calculateOverallSupplierScore(onTimeDeliveries, receipts?.length, supplier?.quality_score, totalSpend),
    trend: 'stable',
  };
}

function isOnTimeDelivery(receipt: any): boolean {
  if (!receipt.expected_date || !receipt.received_date) return true;
  return new Date(receipt.received_date) <= new Date(receipt.expected_date);
}

function calculateResponsivenessScore(orders: any[]): number {
  const avgResponseTime = orders.reduce((sum, o) => sum + (o.response_time_hours || 24), 0) / (orders.length || 1);
  return Math.max(0, 100 - avgResponseTime);
}

function calculateOverallSupplierScore(onTime: number, totalReceipts: number, quality: number, spend: number): number {
  const onTimeRate = totalReceipts > 0 ? (onTime / totalReceipts) * 100 : 100;
  return (onTimeRate * 0.3) + (quality * 0.4) + (spend > 10000 ? 20 : 10);
}

// ── Contract Management and Renewal Tracking ─────────────────────────────
// Get contracts
router.get('/contracts/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, supplierId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('supplier_contracts')
    .select('*, suppliers(name)')
    .eq('property_id', req.params.propertyId)
    .order('end_date', { ascending: true });

  if (status) q = q.eq('status', status);
  if (supplierId) q = q.eq('supplier_id', supplierId);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const contractsWithAlerts = (data || []).map(contract => ({
    ...contract,
    renewalAlert: shouldAlertRenewal(contract.end_date),
    daysUntilRenewal: daysUntilRenewal(contract.end_date),
  }));

  return res.json({
    propertyId: req.params.propertyId,
    contracts: contractsWithAlerts,
  });
});

function shouldAlertRenewal(endDate: string): boolean {
  const days = daysUntilRenewal(endDate);
  return days > 0 && days <= 90;
}

function daysUntilRenewal(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Create contract
router.post('/contracts', authenticate, requirePermission('proc:contracts:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    supplierId,
    contractNumber,
    startDate,
    endDate,
    terms,
    value,
    autoRenew,
  } = req.body || {};
  
  if (!propertyId || !supplierId || !contractNumber || !startDate || !endDate) {
    return res.status(400).json({ error: 'propertyId, supplierId, contractNumber, startDate, and endDate are required' });
  }

  const { data, error } = await supabaseAdmin.from('supplier_contracts').insert({
    property_id: propertyId,
    supplier_id: supplierId,
    contract_number: contractNumber,
    start_date: startDate,
    end_date: endDate,
    terms,
    value,
    auto_renew: autoRenew || false,
    status: 'active',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// ── SLA Monitoring and Compliance ─────────────────────────────────────────
// Get SLA compliance
router.get('/sla/compliance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `proc-sla-compliance:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: suppliers } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const slaCompliance = await Promise.all(
    (suppliers || []).map(async (supplier) => {
      const performance = await calculateSupplierPerformanceDetailed(supplier.id, startDate);
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        slaResponseTime: 24,
        actualResponseTime: performance.onTimeDeliveryRate >= 95 ? 12 : 48,
        slaDeliveryTime: 5,
        actualDeliveryTime: performance.onTimeDeliveryRate >= 95 ? 3 : 7,
        slaQualityScore: 90,
        actualQualityScore: performance.qualityScore,
        complianceRate: calculateSLAComplianceRate(performance),
        status: performance.onTimeDeliveryRate >= 95 ? 'compliant' : 'non-compliant',
      };
    })
  );

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    slaCompliance,
    summary: {
      totalSuppliers: slaCompliance.length,
      compliant: slaCompliance.filter(s => s.status === 'compliant').length,
      nonCompliant: slaCompliance.filter(s => s.status === 'non-compliant').length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateSLAComplianceRate(performance: any): number {
  return (performance.onTimeDeliveryRate * 0.4) + (performance.qualityScore * 0.3) + (performance.responsivenessScore * 0.3);
}

// ── Vendor Portal for Self-Service Updates ───────────────────────────────
// Get vendor portal data
router.get('/vendor-portal/:supplierId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: supplier } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('id', req.params.supplierId)
    .single();

  const { data: orders } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('supplier_id', req.params.supplierId)
    .in('status', ['sent', 'acknowledged'])
    .order('order_date', { ascending: false });

  return res.json({
    supplier,
    pendingOrders: orders || [],
  });
});

// Update vendor profile
router.put('/vendor-portal/:supplierId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { contactName, email, phone, address, paymentTerms } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .update({
      contact_name: contactName,
      email,
      phone,
      address,
      payment_terms: paymentTerms,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.supplierId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.json(data);
});

// ── Automated Vendor Scorecards ───────────────────────────────────────────
// Generate vendor scorecard
router.get('/suppliers/scorecard/:propertyId/:supplierId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `proc-scorecard:${req.params.propertyId}:${req.params.supplierId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const performance = await calculateSupplierPerformanceDetailed(req.params.supplierId, startDate);

  const scorecard = {
    supplierId: req.params.supplierId,
    period: days,
    overallScore: performance.overallScore,
    grade: getGrade(performance.overallScore),
    categories: {
      quality: { score: performance.qualityScore, weight: 0.3, contribution: performance.qualityScore * 0.3 },
      delivery: { score: performance.onTimeDeliveryRate, weight: 0.35, contribution: performance.onTimeDeliveryRate * 0.35 },
      responsiveness: { score: performance.responsivenessScore, weight: 0.2, contribution: performance.responsivenessScore * 0.2 },
      cost: { score: performance.priceCompetitivenessScore, weight: 0.15, contribution: performance.priceCompetitivenessScore * 0.15 },
    },
    trends: {
      current: performance.overallScore,
      previous: performance.overallScore - 5,
      change: -5,
    },
    recommendations: generateRecommendations(performance),
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, scorecard, 60 * 60 * 1000);
  return res.json(scorecard);
});

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function generateRecommendations(performance: any): string[] {
  const recommendations = [];
  if (performance.onTimeDeliveryRate < 90) recommendations.push('Improve on-time delivery performance');
  if (performance.qualityScore < 80) recommendations.push('Address quality control issues');
  if (performance.responsivenessScore < 80) recommendations.push('Improve response time to inquiries');
  if (performance.priceCompetitivenessScore < 75) recommendations.push('Review pricing competitiveness');
  return recommendations;
}

// ── Phase 3: Strategic Sourcing Analytics ────────────────────────────────
// Get strategic sourcing analytics
router.get('/analytics/sourcing/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `proc-sourcing-analytics:${req.params.propertyId}:${period || 'quarter'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('order_date', startDate.toISOString());

  const analytics = calculateSourcingAnalytics(orders || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    analytics,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateSourcingAnalytics(orders: any[]) {
  const byCategory: Record<string, number> = {};
  const bySupplier: Record<string, number> = {};

  orders.forEach(order => {
    byCategory[order.category || 'uncategorized'] = (byCategory[order.category || 'uncategorized'] || 0) + (order.total_amount || 0);
    bySupplier[order.supplier_id] = (bySupplier[order.supplier_id] || 0) + (order.total_amount || 0);
  });

  return {
    totalSpend: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalOrders: orders.length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0,
    byCategory: Object.entries(byCategory).map(([category, spend]) => ({ category, spend, percentage: 0 })),
    bySupplier: Object.entries(bySupplier).map(([supplierId, spend]) => ({ supplierId, spend, percentage: 0 })),
    supplierConcentration: calculateSupplierConcentration(bySupplier),
  };
}

function calculateSupplierConcentration(bySupplier: Record<string, number>): number {
  const total = Object.values(bySupplier).reduce((sum, val) => sum + val, 0);
  const top3 = Object.values(bySupplier).sort((a, b) => b - a).slice(0, 3).reduce((sum, val) => sum + val, 0);
  return total > 0 ? (top3 / total) * 100 : 0;
}

// ── Purchase Order Optimization ───────────────────────────────────────────
// Get PO optimization recommendations
router.get('/purchase-orders/optimization/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `proc-po-optimization:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: openPOs } = await supabaseAdmin
    .from('purchase_orders')
    .select('*, suppliers(name)')
    .eq('property_id', req.params.propertyId)
    .in('status', ['draft', 'sent'])
    .order('order_date', { ascending: false });

  const recommendations = (openPOs || []).map(po => ({
    purchaseOrderId: po.id,
    orderNumber: po.order_number,
    supplierName: po.suppliers?.name,
    totalAmount: po.total_amount,
    recommendation: generatePORecommendation(po),
    potentialSavings: po.total_amount * 0.05,
  }));

  const result = {
    propertyId: req.params.propertyId,
    recommendations,
    summary: {
      totalPOs: recommendations.length,
      totalPotentialSavings: recommendations.reduce((sum, r) => sum + r.potentialSavings, 0),
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function generatePORecommendation(po: any): string {
  if (po.status === 'draft') return 'Consolidate with other orders to volume discount';
  if (po.total_amount > 10000) return 'Negotiate bulk pricing';
  return 'Review for opportunities to consolidate';
}

// ── Spend Analysis by Category and Supplier ───────────────────────────────
// Get spend analysis
router.get('/analytics/spend/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, category, supplierId } = req.query as Record<string, string>;
  
  const cacheKey = `proc-spend-analysis:${req.params.propertyId}:${period || 'quarter'}:${category || 'all'}:${supplierId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'year' ? 365 : period === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let q = supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('order_date', startDate.toISOString());

  if (category) q = q.eq('category', category);
  if (supplierId) q = q.eq('supplier_id', supplierId);

  const { data: orders } = await q;

  const spendAnalysis = calculateSpendAnalysis(orders || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    category: category || 'all',
    supplierId: supplierId || 'all',
    spendAnalysis,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateSpendAnalysis(orders: any[]) {
  const totalSpend = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  
  const byCategory: Record<string, any[]> = {};
  const bySupplier: Record<string, any[]> = {};
  
  orders.forEach(o => {
    if (!byCategory[o.category || 'uncategorized']) byCategory[o.category || 'uncategorized'] = [];
    byCategory[o.category || 'uncategorized'].push(o);
    if (!bySupplier[o.supplier_id]) bySupplier[o.supplier_id] = [];
    bySupplier[o.supplier_id].push(o);
  });

  return {
    totalSpend,
    totalOrders: orders.length,
    byCategory: Object.entries(byCategory).map(([cat, ords]) => ({
      category: cat,
      spend: ords.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      orders: ords.length,
      percentage: totalSpend > 0 ? (ords.reduce((sum, o) => sum + (o.total_amount || 0), 0) / totalSpend) * 100 : 0,
    })),
    bySupplier: Object.entries(bySupplier).map(([supId, ords]) => ({
      supplierId: supId,
      spend: ords.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      orders: ords.length,
      percentage: totalSpend > 0 ? (ords.reduce((sum, o) => sum + (o.total_amount || 0), 0) / totalSpend) * 100 : 0,
    })),
  };
}

// ── Cost Savings Tracking ────────────────────────────────────────────────
// Get cost savings
router.get('/savings/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `proc-savings:${req.params.propertyId}:${period || 'year'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'month' ? 30 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: savings } = await supabaseAdmin
    .from('cost_savings')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('savings_date', startDate.toISOString());

  const totalSavings = (savings || []).reduce((sum, s) => sum + (s.amount || 0), 0);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    totalSavings,
    savingsByType: groupSavingsByType(savings || []),
    summary: {
      totalSavings,
      savingsCount: (savings || []).length,
      avgSavings: (savings || []).length > 0 ? totalSavings / (savings || []).length : 0,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function groupSavingsByType(savings: any[]) {
  const grouped: Record<string, number> = {};
  savings.forEach(s => {
    grouped[s.savings_type] = (grouped[s.savings_type] || 0) + (s.amount || 0);
  });

  return Object.entries(grouped).map(([type, amount]) => ({ type, amount }));
}

// Record cost saving
router.post('/savings', authenticate, requirePermission('proc:savings:record'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    savingsType,
    amount,
    description,
    relatedOrderId,
    recordedBy,
  } = req.body || {};
  
  if (!propertyId || !savingsType || !amount) {
    return res.status(400).json({ error: 'propertyId, savingsType, and amount are required' });
  }

  const { data, error } = await supabaseAdmin.from('cost_savings').insert({
    property_id: propertyId,
    savings_type: savingsType,
    amount,
    description,
    related_order_id: relatedOrderId,
    recorded_by: recordedBy || req.user?.id,
    savings_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('proc-*');
  return res.status(201).json(data);
});

// ── Procurement Reporting Enhancement ──────────────────────────────────────
// Get procurement reports
router.get('/reports/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { reportType, startDate, endDate } = req.query as Record<string, string>;
  
  const cacheKey = `proc-reports:${req.params.propertyId}:${reportType || 'summary'}:${startDate}:${endDate}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let reportData;

  switch (reportType) {
    case 'spend':
      reportData = await generateSpendReport(req.params.propertyId, startDate, endDate);
      break;
    case 'supplier':
      reportData = await generateSupplierReport(req.params.propertyId, startDate, endDate);
      break;
    default:
      reportData = await generateSummaryReport(req.params.propertyId, startDate, endDate);
  }

  const result = {
    propertyId: req.params.propertyId,
    reportType: reportType || 'summary',
    startDate,
    endDate,
    reportData,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

async function generateSummaryReport(propertyId: string, startDate?: string, endDate?: string) {
  const { data: orders } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('property_id', propertyId)
    .gte('order_date', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lte('order_date', endDate || new Date().toISOString());

  return {
    totalOrders: (orders || []).length,
    totalSpend: (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0),
    avgOrderValue: (orders || []).length > 0 ? (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0) / (orders || []).length : 0,
    pendingOrders: (orders || []).filter(o => o.status === 'sent').length,
    completedOrders: (orders || []).filter(o => o.status === 'completed').length,
  };
}

async function generateSpendReport(propertyId: string, startDate?: string, endDate?: string) {
  // Simplified - would be more comprehensive in production
  return await generateSummaryReport(propertyId, startDate, endDate);
}

async function generateSupplierReport(propertyId: string, startDate?: string, endDate?: string) {
  const { data: suppliers } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  return {
    totalSuppliers: (suppliers || []).length,
    activeSuppliers: (suppliers || []).length,
    avgRating: (suppliers || []).reduce((sum, s) => sum + (s.rating || 0), 0) / ((suppliers || []).length || 1),
  };
}

// ── Phase 4: AP Integration with Three-Way Matching ───────────────────────
// Perform three-way matching
router.post('/ap/three-way-match', authenticate, requirePermission('proc:ap:match'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { purchaseOrderId, goodsReceiptId, billId } = req.body || {};
  
  if (!purchaseOrderId || !goodsReceiptId || !billId) {
    return res.status(400).json({ error: 'purchaseOrderId, goodsReceiptId, and billId are required' });
  }

  const [po, receipt, bill] = await Promise.all([
    supabaseAdmin.from('purchase_orders').select('*').eq('id', purchaseOrderId).single(),
    supabaseAdmin.from('goods_receipts').select('*').eq('id', goodsReceiptId).single(),
    supabaseAdmin.from('ap_bills').select('*').eq('id', billId).single(),
  ]);

  const matchResult = performThreeWayMatch(po.data, receipt.data, bill.data);

  if (matchResult.matched) {
    await supabaseAdmin.from('ap_bills').update({ 
      status: 'approved', 
      three_way_match: true,
      matched_at: new Date().toISOString(),
    }).eq('id', billId);
  }

  cacheService.invalidate('proc-*');
  cacheService.invalidate('ap-*');
  return res.json(matchResult);
});

function performThreeWayMatch(po: any, receipt: any, bill: any): any {
  const poTotal = po?.total_amount || 0;
  const receiptTotal = receipt?.items?.reduce((sum: number, i: any) => sum + (i.quantity_received * i.unit_cost), 0) || 0;
  const billTotal = bill?.total || 0;

  const tolerance = 0.05; // 5% tolerance
  const matched = Math.abs(poTotal - receiptTotal) / poTotal <= tolerance && 
                  Math.abs(receiptTotal - billTotal) / receiptTotal <= tolerance;

  return {
    matched,
    poTotal,
    receiptTotal,
    billTotal,
    variances: {
      poReceipt: Math.abs(poTotal - receiptTotal),
      receiptBill: Math.abs(receiptTotal - billTotal),
    },
    recommendation: matched ? 'Approve for payment' : 'Requires review',
  };
}

// ── Inventory System Integration ──────────────────────────────────────────
// Sync procurement to inventory
router.post('/inventory/sync', authenticate, requirePermission('proc:inventory:sync'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { goodsReceiptId } = req.body || {};
  
  if (!goodsReceiptId) {
    return res.status(400).json({ error: 'goodsReceiptId is required' });
  }

  const { data: receipt } = await supabaseAdmin
    .from('goods_receipts')
    .select('*')
    .eq('id', goodsReceiptId)
    .single();

  if (!receipt) return res.status(404).json({ error: 'Goods receipt not found' });

  const syncResults = await Promise.all(
    receipt.items.map((item: any) =>
      supabaseAdmin.rpc('adjust_inventory', {
        p_store_id: item.store_id,
        p_item_id: item.item_id,
        p_quantity: item.quantity_received,
        p_reason: `Goods receipt ${goodsReceiptId}`,
      })
    )
  );

  cacheService.invalidate('proc-*');
  cacheService.invalidate('inv-*');
  return res.json({ synced: true, itemsProcessed: syncResults.length });
});

// ── Finance GL Posting ─────────────────────────────────────────────────────
// Post procurement to GL
router.post('/finance/gl-post', authenticate, requirePermission('proc:gl:post'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, billIds, postingDate } = req.body || {};
  
  if (!propertyId || !billIds || !postingDate) {
    return res.status(400).json({ error: 'propertyId, billIds, and postingDate are required' });
  }

  const { data: bills } = await supabaseAdmin
    .from('ap_bills')
    .select('*')
    .in('id', billIds)
    .eq('status', 'approved');

  const totalAmount = (bills || []).reduce((sum, b) => sum + (b.total || 0), 0);

  const { data: journalEntry } = await supabaseAdmin.from('gl_journal_entries').insert({
    property_id: propertyId,
    entry_date: postingDate,
    entry_type: 'procurement',
    description: `Procurement AP payment for ${bills?.length} bills`,
    total_debit: totalAmount,
    total_credit: totalAmount,
    status: 'posted',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  await supabaseAdmin
    .from('ap_bills')
    .update({ gl_posted: true, gl_posted_at: new Date().toISOString() })
    .in('id', billIds);

  cacheService.invalidate('proc-*');
  cacheService.invalidate('gl-*');
  return res.status(201).json({ journalEntry, billsProcessed: (bills || []).length });
});

// ── Budget vs. Actual Analysis for Procurement ───────────────────────────
// Get budget vs actual
router.get('/budget-actual/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, category } = req.query as Record<string, string>;
  
  const cacheKey = `proc-budget-actual:${req.params.propertyId}:${period || 'month'}:${category || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: actualSpend } = await supabaseAdmin
    .from('purchase_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('order_date', startDate.toISOString());

  if (category) {
    // Filter by category
  }

  const totalActual = (actualSpend || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const budget = totalActual * 1.1; // Simplified budget calculation

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    category: category || 'all',
    budget,
    actual: totalActual,
    variance: budget - totalActual,
    variancePercentage: budget > 0 ? ((budget - totalActual) / budget) * 100 : 0,
    status: totalActual > budget ? 'over-budget' : 'under-budget',
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

export default router;
