const API_BASE = '/api/sales';

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

export interface SalesLead {
  id: string;
  lead_number: string | null;
  lead_name: string;
  company: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string;
  stage: string;
  opportunity_value: number;
  expected_close_date: string | null;
  assigned_to: string | null;
  corporate_account_id: string | null;
  priority: string;
  notes: string | null;
  conversion_date: string | null;
  lost_reason: string | null;
  corporate_accounts?: { company_name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  proposal_number: string | null;
  lead_id: string | null;
  corporate_account_id: string | null;
  title: string;
  event_type: string | null;
  event_dates: string | null;
  guest_count: number;
  room_nights: number;
  proposed_revenue: number;
  discount_percent: number;
  terms_conditions: string | null;
  status: string;
  valid_until: string | null;
  sent_date: string | null;
  accepted_date: string | null;
  rejected_date: string | null;
  contract_id: string | null;
  notes: string | null;
  sales_leads?: { lead_name: string; company: string } | null;
  corporate_accounts?: { company_name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  contract_number: string | null;
  proposal_id: string | null;
  lead_id: string | null;
  corporate_account_id: string | null;
  title: string;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  guest_count: number;
  room_nights: number;
  total_value: number;
  deposit_amount: number;
  deposit_paid: boolean;
  status: string;
  group_block_id: string | null;
  beo_id: string | null;
  terms: string | null;
  signed_by_client: string | null;
  signed_date: string | null;
  sales_proposals?: { proposal_number: string; title: string } | null;
  corporate_accounts?: { company_name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CorporateAccount {
  id: string;
  company_name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  discount_percent: number;
  active_bookings: number;
  unpaid_balance: number;
  credit_limit: number;
  credit_terms: string;
  billing_address: string | null;
  tax_id: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesAnalytics {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalPipelineValue: number;
  totalContractValue: number;
  totalProposedValue: number;
  stageCounts: Record<string, number>;
}

// API Functions
export const fetchLeads = () => apiRequest<SalesLead[]>(`${API_BASE}/leads`);
export const createLead = (data: any) => apiRequest(`${API_BASE}/leads`, { method: 'POST', body: JSON.stringify(data) });
export const updateLead = (id: string, data: any) => apiRequest(`${API_BASE}/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const fetchProposals = () => apiRequest<Proposal[]>(`${API_BASE}/proposals`);
export const createProposal = (data: any) => apiRequest(`${API_BASE}/proposals`, { method: 'POST', body: JSON.stringify(data) });
export const updateProposal = (id: string, data: any) => apiRequest(`${API_BASE}/proposals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const fetchContracts = () => apiRequest<Contract[]>(`${API_BASE}/contracts`);
export const createContract = (data: any) => apiRequest(`${API_BASE}/contracts`, { method: 'POST', body: JSON.stringify(data) });
export const updateContract = (id: string, data: any) => apiRequest(`${API_BASE}/contracts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const createGroupBlock = (contractId: string) => apiRequest(`${API_BASE}/contracts/${contractId}/create-group-block`, { method: 'POST' });
export const createBEO = (contractId: string) => apiRequest(`${API_BASE}/contracts/${contractId}/create-beo`, { method: 'POST' });

export const fetchCorporateAccounts = () => apiRequest<CorporateAccount[]>(`${API_BASE}/corporate-accounts`);
export const createCorporateAccount = (data: any) => apiRequest(`${API_BASE}/corporate-accounts`, { method: 'POST', body: JSON.stringify(data) });
export const updateCorporateAccount = (id: string, data: any) => apiRequest(`${API_BASE}/corporate-accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const fetchSalesAnalytics = () => apiRequest<SalesAnalytics>(`${API_BASE}/analytics`);
