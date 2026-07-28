/**
 * Outlet Transfer Service
 * Phase 3 Item 2: Cross-outlet transfer workflow
 */

export interface OutletTransfer {
  id: string;
  property_id: string;
  transfer_number: string;
  from_outlet_id: string | null;
  to_outlet_id: string;
  from_location_id: string | null;
  to_location_id: string | null;
  item_source: 'core' | 'kitchen' | 'bar';
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled' | 'rejected';
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  received_by: string | null;
  received_at: string | null;
  transfer_type: 'requisition' | 'transfer' | 'return' | 'adjustment';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string | null;
  created_at: string;
  updated_at: string;
  from_outlet?: { name: string };
  to_outlet?: { name: string };
}

export interface UnifiedTransferHistory {
  transfer_id: string;
  transfer_number: string;
  transfer_type: string;
  from_outlet_id: string | null;
  to_outlet_id: string | null;
  item_source: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  status: string;
  priority: string;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  received_by: string | null;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  source_table: 'unified' | 'kitchen' | 'bar';
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/outlet-transfers${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchOutletTransfers(
  outletId?: string,
  status?: string,
  direction?: 'from' | 'to' | 'both'
): Promise<OutletTransfer[]> {
  const params = new URLSearchParams();
  if (outletId) {
    params.set('outlet_id', outletId);
    params.set('direction', direction || 'both');
  }
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<OutletTransfer[]>(`/${qs}`);
}

export async function createOutletTransfer(data: {
  from_outlet_id?: string;
  to_outlet_id: string;
  from_location_id?: string;
  to_location_id?: string;
  item_source: 'core' | 'kitchen' | 'bar';
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost?: number;
  transfer_type?: string;
  priority?: string;
  requested_by?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string; transfer_number: string }> {
  return apiRequest('/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function approveOutletTransfer(id: string, approvedBy: string): Promise<{ success: boolean }> {
  return apiRequest(`/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approved_by: approvedBy }),
  });
}

export async function receiveOutletTransfer(id: string, receivedBy: string): Promise<{ success: boolean }> {
  return apiRequest(`/${id}/receive`, {
    method: 'POST',
    body: JSON.stringify({ received_by: receivedBy }),
  });
}

export async function cancelOutletTransfer(id: string, reason?: string): Promise<{ success: boolean }> {
  return apiRequest(`/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function fetchUnifiedTransferHistory(outletId?: string, limit?: number): Promise<UnifiedTransferHistory[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (limit) params.set('limit', limit.toString());
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<UnifiedTransferHistory[]>(`/history${qs}`);
}
