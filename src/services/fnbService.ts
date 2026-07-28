const API_BASE = '/api/fb';

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

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  par_level: number;
  reorder_point: number;
  current_cost: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  outlet_id: string;
  name: string;
  category: string;
  selling_price: number;
  is_active: boolean;
}

export interface RecipeLine {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  cost_at_time_of_costing: number;
  ingredients?: { id: string; name: string; current_cost: number; unit_of_measure: string };
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  yield: number;
  portions: number;
  created_at: string;
  menu_items?: { name: string; selling_price: number };
  recipe_lines?: RecipeLine[];
}

export interface RecipeCost {
  total_cost: number;
  portions: number;
  cost_per_portion: number;
  menu_item_name: string;
  selling_price: number;
  food_cost_percent: number;
}

export interface WastageLog {
  id: string;
  ingredient_id: string;
  location_id: string;
  quantity: number;
  unit: string;
  reason: string;
  cost_value: number;
  logged_by: string;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  ingredients?: { name: string; category: string; unit_of_measure: string };
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
  status: string;
  estimated_revenue: number;
  actual_revenue: number;
  notes: string | null;
  av_requirements: string | null;
  billing_instructions: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  function_room: string | null;
  created_at: string;
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  return apiRequest<Ingredient[]>('/ingredients');
}

export async function createIngredient(data: Partial<Ingredient>): Promise<{ success: boolean; ingredient: Ingredient }> {
  return apiRequest('/ingredients', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>('/menu-items');
}

export async function fetchRecipes(): Promise<Recipe[]> {
  return apiRequest<Recipe[]>('/recipes');
}

export async function createRecipe(data: { menuItemId: string; portions: number; yield: number; lines: any[] }): Promise<{ success: boolean; recipeId: string }> {
  return apiRequest('/recipes', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchRecipeCost(recipeId: string): Promise<RecipeCost[]> {
  return apiRequest<RecipeCost[]>(`/recipes/${recipeId}/cost`);
}

export async function fetchWastageLogs(): Promise<WastageLog[]> {
  return apiRequest<WastageLog[]>('/wastage');
}

export async function createWastageLog(data: { ingredientId: string; locationId: string; quantity: number; unit: string; reason: string; costValue: number; notes?: string }): Promise<{ success: boolean; wastage: WastageLog }> {
  return apiRequest('/wastage', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchWastageSummary(): Promise<any[]> {
  return apiRequest<any[]>('/wastage/summary');
}

export async function fetchBanquetEvents(): Promise<BanquetEvent[]> {
  return apiRequest<BanquetEvent[]>('/banquet-events');
}

export async function createBanquetEvent(data: Partial<BanquetEvent>): Promise<{ success: boolean; event: BanquetEvent }> {
  return apiRequest('/banquet-events', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBanquetEvent(id: string, data: Partial<BanquetEvent>): Promise<{ success: boolean; event: BanquetEvent }> {
  return apiRequest(`/banquet-events/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
