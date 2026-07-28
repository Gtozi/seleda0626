/**
 * Unified POS Sync Service
 * Phase 3 Item 4: Unified offline POS sync monitoring
 */

export interface SyncQueueItem {
  id: string;
  transaction_id: string;
  outlet_id: string;
  terminal_id: string | null;
  device_id: string | null;
  operation_type: string;
  payload: any;
  sync_status: 'pending' | 'synced' | 'failed' | 'conflict';
  sync_attempts: number;
  last_sync_error: string | null;
  synced_at: string | null;
  client_created_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncStatusSummary {
  total: number;
  pending: number;
  synced: number;
  failed: number;
  conflict: number;
}

export interface UnifiedSyncStatus {
  outlet_id: string;
  outlet_name: string;
  outlet_type: string;
  operation_type: string;
  pending_count: number;
  synced_count: number;
  failed_count: number;
  conflict_count: number;
  total_count: number;
  last_queued_at: string | null;
  last_synced_at: string | null;
}

export interface SyncHealthSummary {
  outlet_id: string;
  outlet_name: string;
  outlet_type: string;
  total_pending: number;
  total_failed: number;
  total_conflicts: number;
  total_operations: number;
  health_status: 'healthy' | 'offline' | 'error' | 'conflict';
  last_activity: string | null;
  last_sync: string | null;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/pos-sync${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchSyncQueue(
  outletId?: string,
  status?: string,
  operationType?: string,
  limit?: number
): Promise<SyncQueueItem[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  if (status) params.set('status', status);
  if (operationType) params.set('operation_type', operationType);
  if (limit) params.set('limit', limit.toString());
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SyncQueueItem[]>(`/queue${qs}`);
}

export async function fetchSyncStatus(outletId?: string): Promise<{ queue: SyncQueueItem[]; summary: SyncStatusSummary }> {
  const params = new URLSearchParams();
  if (outletId) params.set('outlet_id', outletId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/status${qs}`);
}

export async function fetchUnifiedSyncStatus(): Promise<UnifiedSyncStatus[]> {
  return apiRequest<UnifiedSyncStatus[]>('/unified-status');
}

export async function fetchSyncHealth(): Promise<SyncHealthSummary[]> {
  return apiRequest<SyncHealthSummary[]>('/health');
}

export async function flushSyncQueue(outletId?: string, limit?: number): Promise<{
  synced: number;
  failed: number;
  conflict: number;
  results: any[];
}> {
  return apiRequest('/flush', {
    method: 'POST',
    body: JSON.stringify({ outlet_id: outletId, limit }),
  });
}

export async function queueTransaction(data: {
  transaction_id: string;
  outlet_id: string;
  terminal_id?: string;
  device_id?: string;
  operation_type?: string;
  payload: any;
  client_created_at?: string;
}): Promise<{ id: string; sync_status: string }> {
  return apiRequest('/queue', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function retryFailedSync(outletId?: string): Promise<{ success: boolean; retried: number }> {
  return apiRequest('/retry-failed', {
    method: 'POST',
    body: JSON.stringify({ outlet_id: outletId }),
  });
}
