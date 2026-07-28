/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Bar Management Service Layer
 * Handles all API communication for the Bar Management module:
 * drink recipes, sub-recipes (syrups, infusions), batch prep, inventory,
 * batches, transfers, spillage/waste, expiry, planning.
 */

const API_BASE = '/api/fb/bar';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export interface POSOutlet {
  id: string;
  name: string;
  outlet_type: string;
  outlet_category?: string;
}

export interface PrepStation {
  id: string;
  station_name: string;
  station_type: string;
  target_prep_time_minutes?: number;
  is_active?: boolean;
}

export async function fetchPOSOutlets(): Promise<POSOutlet[]> {
  const res = await fetch('/api/pos/outlets-list', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load outlets');
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function fetchPrepStations(outletId?: string): Promise<PrepStation[]> {
  const qs = outletId ? `?outlet_id=${outletId}&is_active=true` : '?is_active=true';
  const res = await fetch(`/api/pos/prep-stations${qs}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({ stations: [] }));
  return data.stations || [];
}

// ── Types ───────────────────────────────────────────────────────────────

export interface BarStorageLocation {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  name: string;
  type: string;
  temperature_min: number | null;
  temperature_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarRecipe {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  recipe_code: string;
  name: string;
  category: string;
  recipe_type: 'drink_item' | 'sub_recipe' | 'finished_product';
  parent_recipe_id: string | null;
  yield_qty: number;
  yield_unit: string;
  portion_size: number | null;
  portion_unit: string | null;
  prep_time_minutes: number;
  abv: number | null;
  serving_glass: string | null;
  total_cost: number;
  cost_per_portion: number;
  selling_price: number | null;
  pour_cost_percent: number;
  status: 'draft' | 'active' | 'archived';
  version: number;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  bar_recipe_ingredients?: BarRecipeIngredient[];
}

export interface BarRecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_type: 'raw_material' | 'sub_recipe' | 'finished_product';
  ingredient_id: string | null;
  raw_ingredient_id: string | null;
  quantity: number;
  unit: string;
  waste_percent: number;
  is_optional: boolean;
  cost_at_time_of_costing: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
  bar_recipes?: { name: string; recipe_code: string };
  ingredients?: { name: string; current_cost: number; unit_of_measure: string };
}

export interface BarProductionOrder {
  id: string;
  property_id: string;
  production_number: string;
  bar_id: string | null;
  recipe_id: string;
  prep_station_id?: string | null;
  production_date: string;
  batch_number: string;
  planned_qty: number;
  actual_qty: number;
  yield_percent: number;
  bartender_id: string | null;
  shift: string | null;
  storage_location_id: string | null;
  status: 'draft' | 'approved' | 'in_production' | 'completed' | 'stored' | 'consumed' | 'closed' | 'cancelled';
  total_cost: number;
  cost_per_unit: number;
  labor_cost: number;
  variance_qty: number;
  variance_cost: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  completed_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  bar_recipes?: { name: string; recipe_code: string };
  bar_production_lines?: BarProductionLine[];
}

export interface BarProductionLine {
  id: string;
  production_order_id: string;
  ingredient_type: 'raw_material' | 'sub_recipe' | 'finished_product';
  ingredient_id: string | null;
  raw_ingredient_id: string | null;
  planned_qty: number;
  actual_qty: number;
  unit: string;
  cost_at_time: number;
  batch_consumed: string | null;
  created_at: string;
}

export interface BarInventoryItem {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  name: string;
  item_type: 'raw_material' | 'semi_finished' | 'finished_good';
  category: string;
  unit: string;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
  reorder_level: number;
  min_stock_level: number;
  last_cost: number;
  avg_cost: number;
  bottle_size_ml: number | null;
  recipe_id: string | null;
  raw_ingredient_id: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarInventoryBatch {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  inventory_item_id: string;
  batch_number: string;
  recipe_id: string | null;
  production_order_id: string | null;
  production_date: string;
  expiry_date: string | null;
  best_before_date: string | null;
  shelf_life_days: number | null;
  quantity_produced: number;
  remaining_qty: number;
  unit_cost: number;
  total_cost: number;
  bartender_id: string | null;
  storage_location_id: string | null;
  temperature_required: string | null;
  status: 'active' | 'reserved' | 'expired' | 'consumed' | 'wasted' | 'transferred';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  bar_inventory_items?: { name: string; item_type: string };
  bar_storage_locations?: { name: string };
}

export interface BarInventoryMovement {
  id: string;
  property_id: string;
  inventory_item_id: string;
  batch_id: string | null;
  movement_type: string;
  direction: 'in' | 'out';
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  reference_type: string | null;
  reference_id: string | null;
  from_location_id: string | null;
  to_location_id: string | null;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  bar_inventory_items?: { name: string };
}

export interface BarTransfer {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  transfer_number: string;
  transfer_type: string;
  from_location_id: string | null;
  to_location_id: string | null;
  inventory_item_id: string;
  batch_id: string | null;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  performed_by: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  bar_inventory_items?: { name: string };
  from_location?: { name: string };
  to_location?: { name: string };
}

export interface BarWaste {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  inventory_item_id: string;
  batch_id: string | null;
  quantity: number;
  unit: string;
  cost_value: number;
  reason: string;
  employee_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  bar_inventory_items?: { name: string };
}

export interface BarExpiryAlert {
  batch_id: string;
  batch_number: string;
  inventory_item_id: string;
  item_name: string;
  item_type: string;
  remaining_qty: number;
  unit_cost: number;
  total_value: number;
  production_date: string;
  expiry_date: string | null;
  best_before_date: string | null;
  shelf_life_days: number | null;
  storage_location_id: string | null;
  storage_location_name: string | null;
  batch_status: string;
  expiry_status: 'no_expiry' | 'expired' | 'expiring_today' | 'expiring_soon' | 'fresh';
  days_until_expiry: number | null;
}

export interface BarDashboardSummary {
  today_production_count: number;
  pending_production_count: number;
  inventory_value: number;
  low_stock_count: number;
  expiring_items_count: number;
  waste_today_cost: number;
  avg_pour_cost_percent: number;
  production_efficiency: number;
  total_batches_active: number;
  total_waste_count_today: number;
}

export interface BarSettings {
  id: string;
  property_id: string;
  consumption_method: 'fefo' | 'fifo';
  allow_negative_inventory: boolean;
  enable_labor_costing: boolean;
  enable_auto_purchase_requests: boolean;
  expiry_alert_days: number;
  critical_expiry_days: number;
  over_pour_tolerance_ml: number;
  default_bartender_id: string | null;
  default_shift: string | null;
}

export interface BarProductionPlan {
  recipe_id: string;
  recipe_name: string;
  current_stock: number;
  min_stock: number;
  forecast_demand: number;
  suggested_qty: number;
}

export interface BarAuditLog {
  id: string;
  property_id: string;
  outlet_id?: string | null;
  user_id: string | null;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  notes: string | null;
  created_at: string;
}

// ── API Functions ───────────────────────────────────────────────────────

// Dashboard
export async function fetchBarDashboard(outletId?: string): Promise<BarDashboardSummary> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<BarDashboardSummary>(`/dashboard${qs}`);
}

// Storage Locations
export async function fetchBarStorageLocations(outletId?: string): Promise<BarStorageLocation[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<BarStorageLocation[]>(`/storage-locations${qs}`);
}

export async function createBarStorageLocation(data: Partial<BarStorageLocation>): Promise<{ success: boolean; id: string }> {
  return apiRequest('/storage-locations', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBarStorageLocation(id: string, data: Partial<BarStorageLocation>): Promise<{ success: boolean }> {
  return apiRequest(`/storage-locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// Recipes
export async function fetchBarRecipes(recipeType?: string, outletId?: string): Promise<BarRecipe[]> {
  const params = new URLSearchParams();
  if (recipeType) params.set('type', recipeType);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarRecipe[]>(`/recipes${qs}`);
}

export async function fetchBarRecipe(id: string): Promise<BarRecipe> {
  return apiRequest<BarRecipe>(`/recipes/${id}`);
}

export async function createBarRecipe(data: {
  recipe_code: string;
  name: string;
  category?: string;
  recipe_type: string;
  outlet_id?: string;
  parent_recipe_id?: string;
  yield_qty?: number;
  yield_unit?: string;
  prep_time_minutes?: number;
  abv?: number;
  serving_glass?: string;
  selling_price?: number;
  notes?: string;
  ingredients: Array<{
    ingredient_type: string;
    ingredient_id?: string;
    raw_ingredient_id?: string;
    quantity: number;
    unit: string;
    waste_percent?: number;
    is_optional?: boolean;
    notes?: string;
  }>;
}): Promise<{ success: boolean; id: string }> {
  return apiRequest('/recipes', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBarRecipe(id: string, data: Partial<BarRecipe>): Promise<{ success: boolean }> {
  return apiRequest(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteBarRecipe(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/recipes/${id}`, { method: 'DELETE' });
}

export async function fetchBarRecipeCost(recipeId: string): Promise<{
  total_cost: number;
  cost_per_portion: number;
  ingredient_count: number;
  sub_recipe_count: number;
  cost_breakdown: any[];
}> {
  return apiRequest(`/recipes/${recipeId}/cost`);
}

// Production Orders
export async function fetchBarProductionOrders(status?: string, outletId?: string): Promise<BarProductionOrder[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarProductionOrder[]>(`/production-orders${qs}`);
}

export async function createBarProductionOrder(data: {
  recipe_id: string;
  planned_qty: number;
  outlet_id?: string;
  prep_station_id?: string;
  bartender_id?: string;
  shift?: string;
  storage_location_id?: string;
  production_date?: string;
  notes?: string;
  lines: Array<{
    ingredient_type: string;
    ingredient_id?: string;
    raw_ingredient_id?: string;
    planned_qty: number;
    unit: string;
  }>;
}): Promise<{ success: boolean; id: string; production_number: string }> {
  return apiRequest('/production-orders', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBarProductionOrderStatus(id: string, status: string, approvedBy?: string): Promise<{ success: boolean }> {
  return apiRequest(`/production-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, approved_by: approvedBy }) });
}

export async function completeBarProductionOrder(id: string, actualQty: number, performedBy?: string, laborCost?: number): Promise<{
  success: boolean;
  batch_id: string;
  batch_number: string;
  total_cost: number;
  cost_per_unit: number;
  variance_qty: number;
  variance_cost: number;
}> {
  return apiRequest(`/production-orders/${id}/complete`, { method: 'POST', body: JSON.stringify({ actual_qty: actualQty, performed_by: performedBy, labor_cost: laborCost }) });
}

// Inventory
export async function fetchBarInventory(itemType?: string, outletId?: string): Promise<BarInventoryItem[]> {
  const params = new URLSearchParams();
  if (itemType) params.set('type', itemType);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarInventoryItem[]>(`/inventory${qs}`);
}

export async function createBarInventoryItem(data: Partial<BarInventoryItem>): Promise<{ success: boolean; id: string }> {
  return apiRequest('/inventory', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBarInventoryItem(id: string, data: Partial<BarInventoryItem>): Promise<{ success: boolean }> {
  return apiRequest(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// Batches
export async function fetchBarBatches(status?: string, outletId?: string): Promise<BarInventoryBatch[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarInventoryBatch[]>(`/batches${qs}`);
}

// Movements
export async function fetchBarMovements(limit?: number): Promise<BarInventoryMovement[]> {
  const qs = limit ? `?limit=${limit}` : '';
  return apiRequest<BarInventoryMovement[]>(`/movements${qs}`);
}

// Transfers
export async function fetchBarTransfers(status?: string, outletId?: string): Promise<BarTransfer[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarTransfer[]>(`/transfers${qs}`);
}

export async function createBarTransfer(data: {
  inventory_item_id: string;
  outlet_id?: string;
  batch_id?: string;
  from_location_id?: string;
  to_location_id: string;
  quantity: number;
  unit: string;
  transfer_type?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string; transfer_number: string }> {
  return apiRequest('/transfers', { method: 'POST', body: JSON.stringify(data) });
}

export async function approveBarTransfer(id: string, approvedBy: string): Promise<{ success: boolean }> {
  return apiRequest(`/transfers/${id}/approve`, { method: 'POST', body: JSON.stringify({ approved_by: approvedBy }) });
}

// Waste
export async function fetchBarWaste(status?: string, outletId?: string): Promise<BarWaste[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarWaste[]>(`/waste${qs}`);
}

export async function createBarWaste(data: {
  inventory_item_id: string;
  outlet_id?: string;
  batch_id?: string;
  quantity: number;
  unit: string;
  reason: string;
  employee_id?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string }> {
  return apiRequest('/waste', { method: 'POST', body: JSON.stringify(data) });
}

export async function approveBarWaste(id: string, approvedBy: string): Promise<{ success: boolean; cost_deducted: number }> {
  return apiRequest(`/waste/${id}/approve`, { method: 'POST', body: JSON.stringify({ approved_by: approvedBy }) });
}

// Expiry
export async function fetchBarExpiryAlerts(status?: string, outletId?: string): Promise<BarExpiryAlert[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarExpiryAlert[]>(`/expiry-alerts${qs}`);
}

// Production Planning
export async function fetchBarProductionPlan(outletId?: string): Promise<BarProductionPlan[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<BarProductionPlan[]>(`/production-planning${qs}`);
}

// Settings
export async function fetchBarSettings(): Promise<BarSettings> {
  return apiRequest<BarSettings>('/settings');
}

export async function updateBarSettings(data: Partial<BarSettings>): Promise<{ success: boolean }> {
  return apiRequest('/settings', { method: 'PATCH', body: JSON.stringify(data) });
}

// Audit Log
export async function fetchBarAuditLog(module?: string, limit?: number, outletId?: string): Promise<BarAuditLog[]> {
  const params = new URLSearchParams();
  if (module) params.append('module', module);
  if (limit) params.append('limit', String(limit));
  if (outletId) params.append('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BarAuditLog[]>(`/audit-log${qs}`);
}
