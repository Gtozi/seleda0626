const API_BASE = '/api/finance/ar';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export interface ArCustomer {
  id: string;
  customer_code?: string;
  customer_type?: string;
  name: string;
  tin?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  credit_limit?: number;
  current_balance?: number;
  payment_terms?: string;
  commission_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FolioWithAging {
  id: string;
  reservation_id: string;
  guest_name: string;
  room_number: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string;
  balance: number;
  total_charges: number;
  total_payments: number;
  opened_at: string;
  closed_at: string | null;
  payment_status: string | null;
  days_outstanding: number;
  aging_bucket: string;
}

export interface AgingSummary {
  bucket_0_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  total_outstanding: number;
}

export async function fetchCustomers(): Promise<ArCustomer[]> {
  return apiRequest<ArCustomer[]>('/customers');
}

export async function createCustomer(customer: Partial<ArCustomer>): Promise<{ success: boolean; customer: ArCustomer }> {
  return apiRequest<{ success: boolean; customer: ArCustomer }>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export async function fetchFoliosWithAging(): Promise<FolioWithAging[]> {
  return apiRequest<FolioWithAging[]>('/folios');
}

export function computeAgingSummary(folios: FolioWithAging[]): AgingSummary {
  const summary: AgingSummary = {
    bucket_0_30: 0,
    bucket_31_60: 0,
    bucket_61_90: 0,
    bucket_90_plus: 0,
    total_outstanding: 0,
  };
  for (const f of folios) {
    if (f.balance <= 0) continue;
    summary.total_outstanding += f.balance;
    switch (f.aging_bucket) {
      case '0-30': summary.bucket_0_30 += f.balance; break;
      case '31-60': summary.bucket_31_60 += f.balance; break;
      case '61-90': summary.bucket_61_90 += f.balance; break;
      case '90+': summary.bucket_90_plus += f.balance; break;
    }
  }
  return summary;
}
