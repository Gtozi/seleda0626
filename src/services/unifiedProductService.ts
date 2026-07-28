/**
 * Unified Products Service
 * Phase 2 Item 2: Single API for querying products across
 * pos_menu_items, menu_items (legacy), kitchen_recipes, and bar_recipes.
 */

export interface UnifiedProduct {
  product_id: string;
  name: string;
  description: string | null;
  selling_price: number | null;
  cost_price: number | null;
  pos_outlet_id: string | null;
  source_table: 'pos_menu' | 'legacy_menu' | 'kitchen_recipe' | 'bar_recipe';
  item_type: string | null;
  is_active: boolean;
  is_available: boolean;
  prep_required: boolean;
  prep_station_id: string | null;
  recipe_id: string | null;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  category_name: string | null;
  recipe_code: string | null;
  yield_qty: number | null;
  yield_unit: string | null;
  cost_per_portion: number | null;
  food_cost_percent: number | null;
  prep_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedProductSummary {
  pos_outlet_id: string | null;
  source_table: string;
  total_products: number;
  active_products: number;
  avg_selling_price: number | null;
  avg_cost_price: number | null;
  prep_required_count: number;
  station_linked_count: number;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/unified-products${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchUnifiedProducts(
  outletId?: string,
  source?: UnifiedProduct['source_table'],
  activeOnly?: boolean
): Promise<UnifiedProduct[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (source) params.set('source', source);
  if (activeOnly) params.set('is_active', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<UnifiedProduct[]>(`/items${qs}`);
}

export async function fetchUnifiedProductSummary(outletId?: string): Promise<UnifiedProductSummary[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<UnifiedProductSummary[]>(`/summary${qs}`);
}

export async function fetchUnifiedProductSearch(
  query: string,
  outletId?: string
): Promise<UnifiedProduct[]> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (outletId) params.set('outlet_id', outletId);
  return apiRequest<UnifiedProduct[]>(`/search?${params.toString()}`);
}
