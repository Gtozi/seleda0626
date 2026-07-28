const API_BASE = '/api/procurement';

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

export interface GRN {
  id: string;
  number: string;
  supplier_id: string;
  supplier_name: string;
  purchase_order_id: string;
  delivery_note: string;
  invoice_number: string;
  received_date: string;
  receiver: string;
  items: any[];
  total_value: number;
  ap_bill_id: string | null;
  discrepancy_status: string;
  discrepancy_notes: string | null;
  created_at: string;
}

export interface StockCountLine {
  id: string;
  stock_count_id: string;
  item_id: string | null;
  item_name: string | null;
  ingredient_id: string | null;
  expected_quantity: number;
  counted_quantity: number | null;
  unit: string;
  variance_quantity: number;
  variance_value: number;
  notes: string | null;
}

export interface StockCount {
  id: string;
  location_id: string;
  count_date: string;
  counted_by: string;
  approved_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  stock_count_lines?: StockCountLine[];
}

export interface RequisitionLine {
  id: string;
  requisition_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  fulfilled_quantity: number;
  notes: string | null;
}

export interface Requisition {
  id: string;
  req_number: string;
  from_location_id: string;
  to_outlet_id: string;
  department: string;
  priority: string;
  required_date: string;
  status: string;
  requested_by: string;
  approved_by: string | null;
  fulfilled_by: string | null;
  approved_at: string | null;
  fulfilled_at: string | null;
  notes: string | null;
  created_at: string;
  requisition_lines?: RequisitionLine[];
}

export async function fetchGRNs(): Promise<GRN[]> {
  return apiRequest<GRN[]>('/grns');
}

export async function createGRN(data: Partial<GRN>): Promise<{ success: boolean; grn: GRN; apBillId: string | null }> {
  return apiRequest('/grns', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateGRNDiscrepancy(id: string, discrepancyStatus: string, discrepancyNotes: string): Promise<{ success: boolean; grn: GRN }> {
  return apiRequest(`/grns/${id}/discrepancy`, { method: 'PATCH', body: JSON.stringify({ discrepancyStatus, discrepancyNotes }) });
}

export async function fetchStockCounts(): Promise<StockCount[]> {
  return apiRequest<StockCount[]>('/stock-counts');
}

export async function createStockCount(data: { locationId: string; countDate: string; notes?: string; lines?: any[] }): Promise<{ success: boolean; stockCountId: string }> {
  return apiRequest('/stock-counts', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateStockCount(id: string, data: { status: string; lines?: any[] }): Promise<{ success: boolean; stockCount: StockCount }> {
  return apiRequest(`/stock-counts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function fetchRequisitions(): Promise<Requisition[]> {
  return apiRequest<Requisition[]>('/requisitions');
}

export async function createRequisition(data: { fromLocationId: string; toOutletId: string; department: string; priority?: string; requiredDate?: string; notes?: string; lines: any[] }): Promise<{ success: boolean; requisitionId: string; reqNumber: string }> {
  return apiRequest('/requisitions', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateRequisition(id: string, data: { status: string; fulfilledLines?: any[] }): Promise<{ success: boolean; requisition: Requisition }> {
  return apiRequest(`/requisitions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
