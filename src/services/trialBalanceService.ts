const API_BASE = '/api/trial-balance';

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

export interface TrialBalanceAccount {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  net_balance: number;
}

export interface TrialBalanceTotals {
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  difference: number;
}

export interface TrialBalanceResponse {
  trial_balance: TrialBalanceAccount[];
  totals: TrialBalanceTotals;
  period: {
    as_of_date?: string;
    period_start?: string;
    period_end?: string;
  };
}

export async function fetchTrialBalance(asOfDate?: string, periodStart?: string, periodEnd?: string): Promise<TrialBalanceResponse> {
  const params = new URLSearchParams();
  if (asOfDate) params.set('asOfDate', asOfDate);
  if (periodStart) params.set('periodStart', periodStart);
  if (periodEnd) params.set('periodEnd', periodEnd);
  const data = await apiRequest<TrialBalanceResponse>(`?${params.toString()}`);
  return data;
}
