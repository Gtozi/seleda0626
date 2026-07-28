const API_BASE = '/api/period-close';

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

export interface AccountingPeriod {
  id: string;
  period_name: string;
  period_start: string;
  period_end: string;
  status: string;
  closed_by?: string;
  closed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function mapAccountingPeriodFromDb(row: any): AccountingPeriod {
  return {
    id: row.id,
    period_name: row.period_name,
    period_start: row.period_start,
    period_end: row.period_end,
    status: row.status,
    closed_by: row.closed_by,
    closed_at: row.closed_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchAccountingPeriods(status?: string): Promise<AccountingPeriod[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const data = await apiRequest<any[]>(`?${params.toString()}`);
  return data.map(mapAccountingPeriodFromDb);
}

export async function createAccountingPeriod(period: Omit<AccountingPeriod, 'id' | 'status' | 'closed_by' | 'closed_at' | 'created_at' | 'updated_at'>): Promise<AccountingPeriod> {
  const data = await apiRequest<any>('/', {
    method: 'POST',
    body: JSON.stringify({
      periodName: period.period_name,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      notes: period.notes,
    }),
  });
  return mapAccountingPeriodFromDb(data);
}

export async function closeAccountingPeriod(periodId: string, notes?: string): Promise<{ success: boolean; period_id: string }> {
  return apiRequest(`/${periodId}/close`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function reopenAccountingPeriod(periodId: string): Promise<{ success: boolean; period_id: string }> {
  return apiRequest(`/${periodId}/reopen`, {
    method: 'POST',
  });
}
