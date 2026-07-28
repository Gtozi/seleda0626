const API_BASE = '/api/engineering';

async function apiRequest<T = any>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('erp_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Types
export interface Asset {
  id: string;
  asset_code: string | null;
  asset_name: string | null;
  asset_category: string | null;
  description: string | null;
  location: string | null;
  purchase_date: string | null;
  purchase_cost: number;
  salvage_value: number;
  useful_life_years: number | null;
  depreciation_method: string;
  accumulated_depreciation: number;
  net_book_value: number;
  status: string;
  serial_number: string | null;
  manufacturer: string | null;
  model_number: string | null;
  warranty_start: string | null;
  warranty_end: string | null;
  warranty_provider: string | null;
  criticality: string;
  parent_asset_id: string | null;
  disposal_date: string | null;
  disposal_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed?: boolean;
}

export interface PMSchedule {
  id: string;
  schedule_name: string;
  asset_id: string | null;
  frequency: string;
  interval_days: number;
  next_due_date: string;
  last_completed_date: string | null;
  checklist_template: ChecklistItem[] | any[];
  assigned_technician: string | null;
  priority: string;
  status: string;
  fixed_assets?: { asset_name: string; asset_code: string; location: string } | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  wo_number: string | null;
  pm_schedule_id: string | null;
  asset_id: string | null;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  room_number: string | null;
  checklist: any[];
  completed_checklist: any[];
  spare_parts_used: any[];
  labor_hours: number;
  cost_estimate: number;
  actual_cost: number;
  created_date: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  fixed_assets?: { asset_name: string; asset_code: string; location: string } | null;
}

export interface SparePart {
  id: string;
  part_number: string | null;
  part_name: string;
  category: string | null;
  manufacturer: string | null;
  unit: string;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  unit_cost: number;
  location: string | null;
  reorder_qty: number;
  last_reorder_date: string | null;
  created_at: string;
  updated_at: string;
}

// API Functions
export const fetchAssets = () => apiRequest<Asset[]>(`${API_BASE}/assets`);
export const createAsset = (data: any) => apiRequest(`${API_BASE}/assets`, { method: 'POST', body: JSON.stringify(data) });
export const updateAsset = (id: string, data: any) => apiRequest(`${API_BASE}/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAsset = (id: string) => apiRequest(`${API_BASE}/assets/${id}`, { method: 'DELETE' });

export const fetchPMSchedules = () => apiRequest<PMSchedule[]>(`${API_BASE}/pm-schedules`);
export const createPMSchedule = (data: any) => apiRequest(`${API_BASE}/pm-schedules`, { method: 'POST', body: JSON.stringify(data) });
export const updatePMSchedule = (id: string, data: any) => apiRequest(`${API_BASE}/pm-schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const generatePMWorkOrders = () => apiRequest(`${API_BASE}/generate-pm-work-orders`, { method: 'POST' });

export const fetchWorkOrders = () => apiRequest<WorkOrder[]>(`${API_BASE}/work-orders`);
export const createWorkOrder = (data: any) => apiRequest(`${API_BASE}/work-orders`, { method: 'POST', body: JSON.stringify(data) });
export const updateWorkOrder = (id: string, data: any) => apiRequest(`${API_BASE}/work-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const fetchSpareParts = () => apiRequest<SparePart[]>(`${API_BASE}/spare-parts`);
export const createSparePart = (data: any) => apiRequest(`${API_BASE}/spare-parts`, { method: 'POST', body: JSON.stringify(data) });
export const updateSparePart = (id: string, data: any) => apiRequest(`${API_BASE}/spare-parts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
