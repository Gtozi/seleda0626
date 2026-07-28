import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Vendor Management ─────────────────────────────────────────────────
// Register vendor
router.post('/vendors', authenticate, requirePermission('ops:vendor:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    vendorName,
    contactName,
    email,
    phone,
    address,
    vendorType,
    services,
    paymentTerms,
  } = req.body || {};
  
  if (!propertyId || !vendorName || !email || !phone) {
    return res.status(400).json({ error: 'propertyId, vendorName, email, and phone are required' });
  }

  const { data, error } = await supabaseAdmin.from('vendors').insert({
    property_id: propertyId,
    vendor_name: vendorName,
    contact_name: contactName,
    email,
    phone,
    address,
    vendor_type: vendorType,
    services: services || [],
    payment_terms: paymentTerms || 'net30',
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.status(201).json(data);
});

// Get vendors
router.get('/vendors/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { vendorType, status } = req.query as Record<string, string>;
  
  const cacheKey = `vendors:${req.params.propertyId}:${vendorType || 'all'}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('vendor_name');
  
  if (vendorType) q = q.eq('vendor_type', vendorType);
  if (status) q = q.eq('is_active', status === 'active');
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    vendors: data || [],
    summary: {
      total: (data || []).length,
      byType: groupVendorsByType(data || []),
      active: (data || []).filter(v => v.is_active).length,
    },
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Update vendor
router.put('/vendors/:id', authenticate, requirePermission('ops:vendor:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    vendorName,
    contactName,
    email,
    phone,
    address,
    services,
    paymentTerms,
    isActive,
  } = req.body || {};

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (vendorName) updateData.vendor_name = vendorName;
  if (contactName) updateData.contact_name = contactName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (services) updateData.services = services;
  if (paymentTerms) updateData.payment_terms = paymentTerms;
  if (isActive !== undefined) updateData.is_active = isActive;

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.json(data);
});

// ── Supply Chain Tracking ───────────────────────────────────────────────
// Create supply chain shipment
router.post('/shipments', authenticate, requirePermission('ops:supply:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    vendorId,
    shipmentNumber,
    items,
    estimatedArrival,
    trackingNumber,
  } = req.body || {};
  
  if (!propertyId || !vendorId || !items) {
    return res.status(400).json({ error: 'propertyId, vendorId, and items are required' });
  }

  const { data, error } = await supabaseAdmin.from('supply_chain_shipments').insert({
    property_id: propertyId,
    vendor_id: vendorId,
    shipment_number: shipmentNumber || `SHP-${Date.now()}`,
    items,
    estimated_arrival: estimatedArrival,
    tracking_number: trackingNumber,
    status: 'in_transit',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.status(201).json(data);
});

// Get shipments
router.get('/shipments/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, vendorId } = req.query as Record<string, string>;
  
  const cacheKey = `shipments:${req.params.propertyId}:${status || 'all'}:${vendorId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('supply_chain_shipments')
    .select('*, vendors(vendor_name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    shipments: data || [],
    summary: {
      total: (data || []).length,
      inTransit: (data || []).filter(s => s.status === 'in_transit').length,
      delivered: (data || []).filter(s => s.status === 'delivered').length,
      delayed: (data || []).filter(s => s.status === 'delayed').length,
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update shipment status
router.put('/shipments/:id/status', authenticate, requirePermission('ops:supply:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, actualArrival, notes } = req.body || {};
  
  if (!status || !['in_transit', 'delivered', 'delayed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (actualArrival) updateData.actual_arrival = actualArrival;
  if (notes) updateData.notes = notes;
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('supply_chain_shipments')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.json(data);
});

// ── Inventory Integration ───────────────────────────────────────────────
// Get inventory levels
router.get('/inventory/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { category, lowStockOnly } = req.query as Record<string, string>;
  
  const cacheKey = `inventory:${req.params.propertyId}:${category || 'all'}:${lowStockOnly || 'false'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('name');
  
  if (category) q = q.eq('category', category);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  let inventory = data || [];
  
  if (lowStockOnly === 'true') {
    inventory = inventory.filter(i => i.quantity <= (i.reorder_level || 10));
  }

  const result = {
    propertyId: req.params.propertyId,
    inventory,
    summary: {
      totalItems: inventory.length,
      lowStock: inventory.filter(i => i.quantity <= (i.reorder_level || 10)).length,
      outOfStock: inventory.filter(i => i.quantity === 0).length,
      totalValue: inventory.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
    },
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Create inventory item
router.post('/inventory', authenticate, requirePermission('ops:inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    name,
    category,
    quantity,
    unit,
    unitCost,
    reorderLevel,
    vendorId,
  } = req.body || {};
  
  if (!propertyId || !name || !quantity || !unitCost) {
    return res.status(400).json({ error: 'propertyId, name, quantity, and unitCost are required' });
  }

  const { data, error } = await supabaseAdmin.from('inventory').insert({
    property_id: propertyId,
    name,
    category,
    quantity,
    unit,
    unit_cost: unitCost,
    reorder_level: reorderLevel || 10,
    vendor_id: vendorId,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.status(201).json(data);
});

// Update inventory
router.put('/inventory/:id', authenticate, requirePermission('ops:inventory:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { quantity, unitCost, reorderLevel } = req.body || {};

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (quantity !== undefined) updateData.quantity = quantity;
  if (unitCost !== undefined) updateData.unit_cost = unitCost;
  if (reorderLevel !== undefined) updateData.reorder_level = reorderLevel;

  const { data, error } = await supabaseAdmin
    .from('inventory')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-supply-chain:*');

  return res.json(data);
});

// ── Cost Optimization ─────────────────────────────────────────────────
// Generate cost optimization recommendations
router.post('/cost-optimization', authenticate, requirePermission('ops:analytics:optimize'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, period } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const days = period || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get inventory costs
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('property_id', propertyId);

  // Get vendor performance
  const { data: vendors } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  // Get shipment costs
  const { data: shipments } = await supabaseAdmin
    .from('supply_chain_shipments')
    .select('*')
    .eq('property_id', propertyId)
    .gte('created_at', startDate.toISOString());

  const recommendations = [];

  // Inventory optimization
  const highCostItems = (inventory || []).filter(i => i.unit_cost > 100);
  if (highCostItems.length > 0) {
    recommendations.push({
      type: 'inventory',
      priority: 'medium',
      category: 'high_cost_items',
      message: `${highCostItems.length} high-cost inventory items. Review bulk purchasing opportunities.`,
      items: highCostItems.map(i => ({ name: i.name, cost: i.unit_cost })),
      potentialSavings: '10-15%',
    });
  }

  // Low stock analysis
  const lowStockItems = (inventory || []).filter(i => i.quantity <= i.reorder_level);
  if (lowStockItems.length > 0) {
    recommendations.push({
      type: 'inventory',
      priority: 'high',
      category: 'low_stock',
      message: `${lowStockItems.length} items at or below reorder level. Consider consolidating orders.`,
      items: lowStockItems.map(i => ({ name: i.name, current: i.quantity, reorderLevel: i.reorder_level })),
      potentialSavings: '5-10%',
    });
  }

  // Vendor consolidation
  if (vendors && vendors.length > 5) {
    recommendations.push({
      type: 'vendor',
      priority: 'low',
      category: 'vendor_consolidation',
      message: `${vendors.length} active vendors. Consider consolidating to improve purchasing power.`,
      currentVendorCount: vendors.length,
      recommendedVendorCount: Math.ceil(vendors.length * 0.7),
      potentialSavings: '8-12%',
    });
  }

  // Shipping optimization
  const delayedShipments = (shipments || []).filter(s => s.status === 'delayed');
  if (delayedShipments.length > 0) {
    recommendations.push({
      type: 'shipping',
      priority: 'high',
      category: 'shipping_delays',
      message: `${delayedShipments.length} shipments delayed. Review carrier performance.`,
      delayedCount: delayedShipments.length,
      potentialSavings: '5-8%',
    });
  }

  const result = {
    propertyId,
    period: days,
    recommendations,
    summary: {
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'high').length,
      mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
      lowPriority: recommendations.filter(r => r.priority === 'low').length,
      totalPotentialSavings: '28-45%',
    },
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

export default router;
