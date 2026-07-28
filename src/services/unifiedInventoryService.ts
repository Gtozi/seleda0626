/**
 * Unified Inventory Service
 * Phase 2 Item 3: Provides a single API for querying inventory across
 * core ingredients, kitchen inventory items, and bar inventory items.
 */

export interface UnifiedInventoryItem {
  item_id: string;
  name: string;
  category: string;
  unit: string;
  avg_cost: number;
  reorder_level: number;
  min_stock_level: number;
  is_active: boolean;
  pos_outlet_id: string | null;
  source_table: 'core' | 'kitchen' | 'bar';
  item_type: string | null;
  available_qty: number | null;
  reserved_qty: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedStorageLocation {
  location_id: string;
  name: string;
  type: string;
  temperature_min: number | null;
  temperature_max: number | null;
  is_active: boolean;
  pos_outlet_id: string | null;
  source_table: 'core' | 'kitchen' | 'bar';
  created_at: string;
  updated_at: string;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/unified-inventory${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchUnifiedInventory(outletId?: string, source?: 'core' | 'kitchen' | 'bar'): Promise<UnifiedInventoryItem[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (source) params.set('source', source);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<UnifiedInventoryItem[]>(`/items${qs}`);
}

export async function fetchUnifiedStorageLocations(outletId?: string, source?: 'core' | 'kitchen' | 'bar'): Promise<UnifiedStorageLocation[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (source) params.set('source', source);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<UnifiedStorageLocation[]>(`/locations${qs}`);
}

export async function fetchUnifiedLowStock(outletId?: string): Promise<UnifiedInventoryItem[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<UnifiedInventoryItem[]>(`/low-stock${qs}`);
}
