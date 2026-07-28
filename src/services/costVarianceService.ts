/**
 * Cost Variance Service
 * Phase 3 Item 3: Theoretical vs actual cost analysis
 */

export interface TheoreticalCostRow {
  menu_item_id: string;
  menu_item_name: string;
  total_quantity: number;
  recipe_cost_per_unit: number;
  theoretical_cost: number;
  actual_revenue: number;
}

export interface ActualCostRow {
  source: 'stock_transaction' | 'wastage' | 'kitchen_movement' | 'bar_movement';
  item_id: string;
  item_name: string;
  total_quantity: number;
  unit_cost: number;
  actual_cost: number;
}

export interface CostVarianceSummary {
  theoretical_total: number;
  actual_total: number;
  variance_amount: number;
  variance_percent: number;
  actual_revenue: number;
  actual_food_cost_percent: number;
  theoretical_food_cost_percent: number;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/cost-variance${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchTheoreticalCost(
  startDate: string,
  endDate: string,
  outletId?: string
): Promise<TheoreticalCostRow[]> {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (outletId) params.set('outlet_id', outletId);
  return apiRequest<TheoreticalCostRow[]>(`/theoretical?${params.toString()}`);
}

export async function fetchActualCost(
  startDate: string,
  endDate: string,
  outletId?: string
): Promise<ActualCostRow[]> {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (outletId) params.set('outlet_id', outletId);
  return apiRequest<ActualCostRow[]>(`/actual?${params.toString()}`);
}

export async function fetchCostVarianceSummary(
  startDate: string,
  endDate: string,
  outletId?: string
): Promise<CostVarianceSummary> {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  if (outletId) params.set('outlet_id', outletId);
  return apiRequest<CostVarianceSummary>(`/summary?${params.toString()}`);
}
