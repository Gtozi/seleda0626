/**
 * Central Production Planning Service
 * Phase 3 Item 1: Prep list generation from reservations, BEOs, forecasted covers
 */

export interface ForecastCover {
  source: 'reservation' | 'banquet' | 'pos_history' | 'forecast';
  covers: number;
  detail: Record<string, any>;
}

export interface PrepListLine {
  recipe_id: string;
  recipe_source: 'kitchen' | 'bar';
  recipe_name: string;
  yield_qty: number;
  yield_unit: string;
  covers: number;
  portions_per_cover: number;
  forecast_qty: number;
  current_stock_qty: number;
  suggested_production_qty: number;
  prep_station_id: string | null;
  cost_per_unit: number;
  estimated_total_cost: number;
}

export interface PrepList {
  id: string;
  property_id: string;
  outlet_id: string | null;
  prep_date: string;
  meal_period: string;
  source_type: 'manual' | 'reservation' | 'banquet' | 'forecast' | 'pos_history';
  forecast_covers: number;
  reservation_covers: number;
  banquet_covers: number;
  total_demand: number;
  status: 'draft' | 'approved' | 'in_production' | 'completed' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  lines?: PrepListLineRecord[];
}

export interface PrepListLineRecord {
  id: string;
  prep_list_id: string;
  recipe_id: string;
  recipe_source: 'kitchen' | 'bar';
  recipe_name: string;
  yield_qty: number;
  yield_unit: string;
  covers: number;
  portions_per_cover: number;
  forecast_qty: number;
  current_stock_qty: number;
  suggested_production_qty: number;
  prep_station_id: string | null;
  status: 'pending' | 'approved' | 'in_production' | 'completed' | 'skipped';
  cost_per_unit: number;
  estimated_total_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/production-planning${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchForecastCovers(date: string, outletId?: string): Promise<ForecastCover[]> {
  const params = new URLSearchParams();
  params.set('date', date);
  if (outletId) params.set('outlet_id', outletId);
  return apiRequest<ForecastCover[]>(`/forecast-covers?${params.toString()}`);
}

export async function generatePrepList(
  outletId: string,
  date: string,
  mealPeriod?: string,
  portionsPerCoverKitchen?: number,
  portionsPerCoverBar?: number
): Promise<PrepListLine[]> {
  const params = new URLSearchParams();
  params.set('outlet_id', outletId);
  params.set('date', date);
  if (mealPeriod) params.set('meal_period', mealPeriod);
  if (portionsPerCoverKitchen) params.set('ppc_kitchen', portionsPerCoverKitchen.toString());
  if (portionsPerCoverBar) params.set('ppc_bar', portionsPerCoverBar.toString());
  return apiRequest<PrepListLine[]>(`/generate?${params.toString()}`);
}

export async function savePrepList(data: {
  outlet_id: string;
  prep_date: string;
  meal_period?: string;
  source_type?: string;
  forecast_covers?: number;
  reservation_covers?: number;
  banquet_covers?: number;
  total_demand?: number;
  notes?: string;
  created_by?: string;
  lines: Array<{
    recipe_id: string;
    recipe_source: 'kitchen' | 'bar';
    recipe_name: string;
    yield_qty: number;
    yield_unit: string;
    covers: number;
    portions_per_cover: number;
    forecast_qty: number;
    current_stock_qty: number;
    suggested_production_qty: number;
    prep_station_id?: string | null;
    cost_per_unit: number;
    estimated_total_cost: number;
  }>;
}): Promise<{ id: string }> {
  return apiRequest<{ id: string }>('/prep-lists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchPrepLists(outletId?: string, date?: string, status?: string): Promise<PrepList[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PrepList[]>(`/prep-lists${qs}`);
}

export async function fetchPrepListDetail(id: string): Promise<PrepList> {
  return apiRequest<PrepList>(`/prep-lists/${id}`);
}

export async function approvePrepList(id: string, approvedBy: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/prep-lists/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approved_by: approvedBy }),
  });
}

export async function updatePrepListLine(
  lineId: string,
  updates: { status?: string; prep_station_id?: string | null; notes?: string }
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/prep-list-lines/${lineId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function pushPrepListToKDS(prepListId: string): Promise<{ success: boolean; pushed: number }> {
  return apiRequest<{ success: boolean; pushed: number }>(`/prep-lists/${prepListId}/push-kds`, {
    method: 'POST',
  });
}
