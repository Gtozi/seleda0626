const API_BASE = '/api/food-beverage';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────
export interface Outlet {
  id: string;
  name: string;
  type: 'Restaurant' | 'Bar' | 'RoomService' | 'Banquet' | 'Minibar';
  operating_hours: Record<string, { open: string; close: string }>;
  revenue_center_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Outlet Registry framework fields
  inventory_mode?: 'recipe' | 'sku';
  charge_modes?: string[];
  tax_profile_id?: string;
  gl_mapping_id?: string;
  requires_guest_link?: boolean;
  shift_reconciliation_required?: boolean;
  outlet_status?: 'active' | 'inactive' | 'suspended';
}

export interface MenuItem {
  id: string;
  outlet_id: string;
  name: string;
  category: string;
  selling_price: number;
  tax_code: string;
  is_active: boolean;
  pos_button_group: string;
  meal_periods: string[];
  is_fixed_menu: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'Food' | 'Beverage' | 'Spice' | 'Cleaning' | 'Disposable' | 'Equipment' | 'Tableware';
  unit_of_measure: string;
  par_level: number;
  reorder_point: number;
  current_cost: number;
  suppliers: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  yield: number;
  portions: number;
  created_at: string;
  updated_at: string;
  recipe_lines: RecipeLine[];
}

export interface RecipeLine {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  cost_at_time_of_costing: number;
  created_at: string;
  ingredient?: Ingredient;
}

export interface StockLocation {
  id: string;
  name: string;
  type: 'MainStore' | 'OutletStore' | 'Cellar' | 'Minibar';
  outlet_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  ingredient_id: string;
  location_id: string;
  transaction_type: 'Receipt' | 'Requisition' | 'Transfer' | 'WastageWriteoff' | 'StockCount' | 'POSDepletion';
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_value: number;
  date: string;
  reference_doc: string;
  reference_type: string;
  notes: string;
  created_at: string;
  ingredient?: Ingredient;
  stock_location?: StockLocation;
}

export interface Requisition {
  id: string;
  from_location_id: string;
  to_outlet_id: string;
  status: 'Draft' | 'Approved' | 'Fulfilled' | 'Rejected';
  requested_by: string;
  approved_by: string;
  fulfilled_by: string;
  approved_at: string;
  fulfilled_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
  requisition_lines: RequisitionLine[];
  stock_location?: StockLocation;
  outlet?: Outlet;
}

export interface RequisitionLine {
  id: string;
  requisition_id: string;
  ingredient_id: string;
  quantity_requested: number;
  quantity_fulfilled: number;
  unit: string;
  notes: string;
  created_at: string;
  ingredient?: Ingredient;
}

export interface Order {
  id: string;
  outlet_id: string;
  table_or_room_or_event_id: string;
  customer_type: 'In-House Guest' | 'Walk-In Guest' | 'Corporate Client' | 'Conference Group' | 'Tour Group';
  server_id: string;
  guest_folio_id: string;
  reservation_id: string;
  status: 'Open' | 'Sent' | 'Served' | 'Paid' | 'Void' | 'Cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  service_charge: number;
  total_amount: number;
  payment_method: 'Cash' | 'Card' | 'RoomCharge' | 'CorporateAccount' | 'Complimentary';
  is_complimentary: boolean;
  comp_reason: string;
  void_reason: string;
  voided_by: string;
  voided_at: string;
  meal_period: 'Breakfast' | 'Lunch' | 'Dinner' | 'Brunch' | 'Tea Time' | 'Morning Snack' | 'Afternoon Snack';
  guest_name: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  outlet?: Outlet;
}

export interface OrderLine {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  void_reason: string;
  comp_reason: string;
  is_voided: boolean;
  is_comped: boolean;
  created_at: string;
  menu_item?: MenuItem;
}

export interface BanquetEvent {
  id: string;
  event_name: string;
  event_date: string;
  client_name: string;
  guest_count: number;
  menu_package: string;
  room_setup: string;
  payment_terms: string;
  status: 'Draft' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  estimated_revenue: number;
  actual_revenue: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WastageLog {
  id: string;
  ingredient_id: string;
  location_id: string;
  quantity: number;
  unit: string;
  reason: 'Spoilage' | 'Breakage' | 'Overproduction' | 'QualityReject' | 'Theft' | 'Other';
  cost_value: number;
  logged_by: string;
  approved_by: string;
  notes: string;
  created_at: string;
  ingredient?: Ingredient;
  stock_location?: StockLocation;
}

export interface StockCount {
  id: string;
  location_id: string;
  count_date: string;
  counted_by: string;
  approved_by: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  notes: string;
  created_at: string;
  updated_at: string;
  stock_count_lines: StockCountLine[];
  stock_location?: StockLocation;
}

export interface StockCountLine {
  id: string;
  stock_count_id: string;
  ingredient_id: string;
  expected_quantity: number;
  counted_quantity: number;
  unit: string;
  variance_quantity: number;
  variance_value: number;
  notes: string;
  created_at: string;
  ingredient?: Ingredient;
}

// ── Outlets ───────────────────────────────────────────────────────
export async function fetchOutlets(): Promise<Outlet[]> {
  return apiRequest<Outlet[]>('/outlets');
}

export async function createOutlet(outlet: Omit<Outlet, 'id' | 'created_at' | 'updated_at'>): Promise<Outlet> {
  return apiRequest<Outlet>('/outlets', {
    method: 'POST',
    body: JSON.stringify(outlet),
  });
}

// ── Menu Items ───────────────────────────────────────────────────
export async function fetchMenuItems(outletId?: string, category?: string, isActive?: boolean): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outletId', outletId);
  if (category) params.set('category', category);
  if (isActive !== undefined) params.set('isActive', isActive.toString());
  return apiRequest<MenuItem[]>(`/menu-items?${params.toString()}`);
}

export async function createMenuItem(menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
  return apiRequest<MenuItem>('/menu-items', {
    method: 'POST',
    body: JSON.stringify(menuItem),
  });
}

export async function updateMenuItem(id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(menuItem),
  });
}

// ── Recipes ───────────────────────────────────────────────────────
export async function fetchRecipes(menuItemId?: string): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (menuItemId) params.set('menuItemId', menuItemId);
  return apiRequest<Recipe[]>(`/recipes?${params.toString()}`);
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_lines'>, lines: Omit<RecipeLine, 'id' | 'recipe_id' | 'created_at' | 'ingredient'>[]): Promise<Recipe> {
  return apiRequest<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify({ recipe, lines }),
  });
}

export interface PlateCostCalculation {
  recipeId: string;
  yieldPercentage: number;
  totalIngredientCost: number;
  adjustedPlateCost: number;
  ingredientBreakdown: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    lineCost: number;
  }[];
  portions: number;
  costPerPortion: number;
}

export async function calculatePlateCost(recipeId: string): Promise<PlateCostCalculation> {
  return apiRequest<PlateCostCalculation>(`/recipes/${recipeId}/plate-cost`);
}

// ── Ingredients ───────────────────────────────────────────────────
export async function fetchIngredients(category?: string, isActive?: boolean): Promise<Ingredient[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (isActive !== undefined) params.set('isActive', isActive.toString());
  return apiRequest<Ingredient[]>(`/ingredients?${params.toString()}`);
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
  return apiRequest<Ingredient>('/ingredients', {
    method: 'POST',
    body: JSON.stringify(ingredient),
  });
}

export async function updateIngredient(id: string, ingredient: Partial<Ingredient>): Promise<Ingredient> {
  return apiRequest<Ingredient>(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ingredient),
  });
}

export async function recalculateIngredientCost(id: string): Promise<{ ingredient: Ingredient; previousReceipts: number; totalQuantity: number; totalValue: number; newWeightedAverageCost: number }> {
  return apiRequest(`/ingredients/${id}/recalculate-cost`, {
    method: 'PUT',
  });
}

// ── Stock Locations ───────────────────────────────────────────────
export async function fetchStockLocations(type?: string, outletId?: string): Promise<StockLocation[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (outletId) params.set('outletId', outletId);
  return apiRequest<StockLocation[]>(`/stock-locations?${params.toString()}`);
}

// ── Stock Transactions ────────────────────────────────────────────
export async function fetchStockTransactions(ingredientId?: string, locationId?: string, transactionType?: string, startDate?: string, endDate?: string): Promise<StockTransaction[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.set('ingredientId', ingredientId);
  if (locationId) params.set('locationId', locationId);
  if (transactionType) params.set('transactionType', transactionType);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<StockTransaction[]>(`/stock-transactions?${params.toString()}`);
}

export async function createStockTransaction(transaction: Omit<StockTransaction, 'id' | 'created_at' | 'ingredient' | 'stock_location'>): Promise<StockTransaction> {
  return apiRequest<StockTransaction>('/stock-transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

// ── Requisitions ─────────────────────────────────────────────────
export async function fetchRequisitions(status?: string): Promise<Requisition[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  return apiRequest<Requisition[]>(`/requisitions?${params.toString()}`);
}

export async function createRequisition(requisition: Omit<Requisition, 'id' | 'created_at' | 'updated_at' | 'requisition_lines' | 'stock_location' | 'outlet'>, lines: Omit<RequisitionLine, 'id' | 'requisition_id' | 'created_at' | 'ingredient'>[]): Promise<Requisition> {
  return apiRequest<Requisition>('/requisitions', {
    method: 'POST',
    body: JSON.stringify({ requisition, lines }),
  });
}

export async function approveRequisition(id: string, approvedBy: string): Promise<Requisition> {
  return apiRequest<Requisition>(`/requisitions/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approvedBy }),
  });
}

export async function fulfillRequisition(id: string, fulfilledBy: string, lines: { id: string; quantity_fulfilled: number }[]): Promise<Requisition> {
  return apiRequest<Requisition>(`/requisitions/${id}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify({ fulfilledBy, lines }),
  });
}

// ── Orders (POS) ───────────────────────────────────────────────────
export async function fetchOrders(outletId?: string, status?: string, startDate?: string, endDate?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outletId', outletId);
  if (status) params.set('status', status);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<Order[]>(`/orders?${params.toString()}`);
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_lines' | 'outlet'>, lines: Omit<OrderLine, 'id' | 'order_id' | 'created_at' | 'menu_item'>[]): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({ order, lines }),
  });
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
}

export async function voidOrder(id: string, voidReason: string, voidedBy: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/void`, {
    method: 'PUT',
    body: JSON.stringify({ voidReason, voidedBy }),
  });
}

// ── Banquet Events ─────────────────────────────────────────────────
export async function fetchBanquetEvents(status?: string, startDate?: string, endDate?: string): Promise<BanquetEvent[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<BanquetEvent[]>(`/banquet-events?${params.toString()}`);
}

export async function createBanquetEvent(event: Omit<BanquetEvent, 'id' | 'created_at' | 'updated_at'>): Promise<BanquetEvent> {
  return apiRequest<BanquetEvent>('/banquet-events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function updateBanquetEvent(id: string, event: Partial<BanquetEvent>): Promise<BanquetEvent> {
  return apiRequest<BanquetEvent>(`/banquet-events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
}

// ── Wastage Logs ───────────────────────────────────────────────────
export async function fetchWastageLogs(ingredientId?: string, locationId?: string, reason?: string, startDate?: string, endDate?: string): Promise<WastageLog[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.set('ingredientId', ingredientId);
  if (locationId) params.set('locationId', locationId);
  if (reason) params.set('reason', reason);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<WastageLog[]>(`/wastage-logs?${params.toString()}`);
}

export async function createWastageLog(log: Omit<WastageLog, 'id' | 'created_at' | 'ingredient' | 'stock_location'>): Promise<WastageLog> {
  return apiRequest<WastageLog>('/wastage-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

// ── Stock Counts ───────────────────────────────────────────────────
export async function fetchStockCounts(locationId?: string, status?: string, startDate?: string, endDate?: string): Promise<StockCount[]> {
  const params = new URLSearchParams();
  if (locationId) params.set('locationId', locationId);
  if (status) params.set('status', status);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<StockCount[]>(`/stock-counts?${params.toString()}`);
}

export async function createStockCount(stockCount: Omit<StockCount, 'id' | 'created_at' | 'updated_at' | 'stock_count_lines' | 'stock_location'>, lines: Omit<StockCountLine, 'id' | 'stock_count_id' | 'created_at' | 'ingredient'>[]): Promise<StockCount> {
  return apiRequest<StockCount>('/stock-counts', {
    method: 'POST',
    body: JSON.stringify({ stockCount, lines }),
  });
}

export async function approveStockCount(id: string, approvedBy: string): Promise<StockCount> {
  return apiRequest<StockCount>(`/stock-counts/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approvedBy }),
  });
}

// ── KPI Reporting ───────────────────────────────────────────────────
export interface FBKPIs {
  totalRevenue: number;
  totalOrders: number;
  averageCheck: number;
  paidOrders: number;
  voidOrders: number;
  voidRate: number;
  totalWastageValue: number;
  totalCOGS: number;
  foodCostPercent: number;
  period: { startDate?: string; endDate?: string };
  outletId?: string;
}

export interface OutletKPIs {
  outletId: string;
  outletName: string;
  outletType: string;
  totalRevenue: number;
  totalOrders: number;
  averageCheck: number;
}

export async function fetchFBKPIs(startDate?: string, endDate?: string, outletId?: string): Promise<FBKPIs> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (outletId) params.set('outletId', outletId);
  return apiRequest<FBKPIs>(`/kpis?${params.toString()}`);
}

export async function fetchOutletKPIs(startDate?: string, endDate?: string): Promise<OutletKPIs[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<OutletKPIs[]>(`/kpis/by-outlet?${params.toString()}`);
}
