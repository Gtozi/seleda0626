const API_BASE = '/api/fixed-assets';

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

export interface FixedAsset {
  id: string;
  asset_code: string;
  asset_name: string;
  asset_category: string;
  description?: string;
  location?: string;
  purchase_date: string;
  purchase_cost: number;
  salvage_value: number;
  useful_life_years: number;
  depreciation_method: string;
  accumulated_depreciation: number;
  net_book_value: number;
  status: string;
  disposal_date?: string;
  disposal_value?: number;
  created_at: string;
  updated_at: string;
}

export interface DepreciationSchedule {
  id: string;
  asset_id: string;
  fiscal_year: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  net_book_value: number;
  created_at: string;
}

export function mapFixedAssetFromDb(row: any): FixedAsset {
  return {
    id: row.id,
    asset_code: row.asset_code,
    asset_name: row.asset_name,
    asset_category: row.asset_category,
    description: row.description,
    location: row.location,
    purchase_date: row.purchase_date,
    purchase_cost: Number(row.purchase_cost) || 0,
    salvage_value: Number(row.salvage_value) || 0,
    useful_life_years: Number(row.useful_life_years) || 0,
    depreciation_method: row.depreciation_method,
    accumulated_depreciation: Number(row.accumulated_depreciation) || 0,
    net_book_value: Number(row.net_book_value) || 0,
    status: row.status,
    disposal_date: row.disposal_date,
    disposal_value: row.disposal_value ? Number(row.disposal_value) : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapDepreciationScheduleFromDb(row: any): DepreciationSchedule {
  return {
    id: row.id,
    asset_id: row.asset_id,
    fiscal_year: Number(row.fiscal_year) || 0,
    depreciation_amount: Number(row.depreciation_amount) || 0,
    accumulated_depreciation: Number(row.accumulated_depreciation) || 0,
    net_book_value: Number(row.net_book_value) || 0,
    created_at: row.created_at,
  };
}

export async function fetchFixedAssets(category?: string, status?: string): Promise<FixedAsset[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  const data = await apiRequest<any[]>(`?${params.toString()}`);
  return data.map(mapFixedAssetFromDb);
}

export async function createFixedAsset(asset: Omit<FixedAsset, 'id' | 'accumulated_depreciation' | 'net_book_value' | 'status' | 'disposal_date' | 'disposal_value' | 'created_at' | 'updated_at'>): Promise<FixedAsset> {
  const data = await apiRequest<any>('/', {
    method: 'POST',
    body: JSON.stringify({
      assetCode: asset.asset_code,
      assetName: asset.asset_name,
      assetCategory: asset.asset_category,
      description: asset.description,
      location: asset.location,
      purchaseDate: asset.purchase_date,
      purchaseCost: asset.purchase_cost,
      salvageValue: asset.salvage_value,
      usefulLifeYears: asset.useful_life_years,
      depreciationMethod: asset.depreciation_method,
    }),
  });
  return mapFixedAssetFromDb(data);
}

export async function calculateDeprecation(assetId: string, fiscalYear: number): Promise<{ depreciation_amount: number; accumulated_depreciation: number; net_book_value: number }> {
  return apiRequest(`/${assetId}/calculate-depreciation`, {
    method: 'POST',
    body: JSON.stringify({ fiscalYear }),
  });
}

export async function disposeAsset(assetId: string, disposalDate: string, disposalValue: number): Promise<{ success: boolean }> {
  return apiRequest(`/${assetId}/dispose`, {
    method: 'POST',
    body: JSON.stringify({ disposalDate, disposalValue }),
  });
}

export async function fetchDepreciationSchedule(assetId: string): Promise<DepreciationSchedule[]> {
  const data = await apiRequest<any[]>(`/${assetId}/depreciation-schedule`);
  return data.map(mapDepreciationScheduleFromDb);
}
