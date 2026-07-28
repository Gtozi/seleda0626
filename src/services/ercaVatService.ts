const API_BASE = '/api/erca-vat';

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

export interface VatAccount {
  account_code: string;
  account_name: string;
  vat_output: number;
  vat_input: number;
  net_vat: number;
}

export interface ErcaVatExportResponse {
  period: {
    period_start: string;
    period_end: string;
  };
  vat_accounts: VatAccount[];
  summary: {
    total_vat_output: number;
    total_vat_input: number;
    total_net_vat: number;
  };
}

export async function exportErcaVat(periodStart: string, periodEnd: string): Promise<ErcaVatExportResponse> {
  const params = new URLSearchParams({ periodStart, periodEnd });
  const data = await apiRequest<ErcaVatExportResponse>(`/export?${params.toString()}`);
  return data;
}
