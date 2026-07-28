const API_BASE = '/api/financial-statements';

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

export interface StatementAccount {
  account_id: string;
  account_code: string;
  account_name: string;
  amount: number;
}

export interface ProfitLossResponse {
  period: {
    period_start: string;
    period_end: string;
  };
  revenue: StatementAccount[];
  expenses: StatementAccount[];
  summary: {
    total_revenue: number;
    total_expenses: number;
    gross_profit: number;
    net_profit: number;
  };
}

export interface BalanceSheetResponse {
  as_of_date: string;
  assets: StatementAccount[];
  liabilities: StatementAccount[];
  equity: StatementAccount[];
  summary: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    is_balanced: boolean;
    difference: number;
  };
}

export async function fetchProfitLoss(periodStart: string, periodEnd: string): Promise<ProfitLossResponse> {
  const params = new URLSearchParams({ periodStart, periodEnd });
  const data = await apiRequest<ProfitLossResponse>(`/profit-loss?${params.toString()}`);
  return data;
}

export async function fetchBalanceSheet(asOfDate: string): Promise<BalanceSheetResponse> {
  const params = new URLSearchParams({ asOfDate });
  const data = await apiRequest<BalanceSheetResponse>(`/balance-sheet?${params.toString()}`);
  return data;
}

export interface CashFlowActivityItem {
  account_id: string;
  account_code: string;
  account_name: string;
  amount: number;
}

export interface CashFlowResponse {
  period: {
    period_start: string;
    period_end: string;
  };
  operating_activities: {
    net_profit: number;
    working_capital_changes: CashFlowActivityItem[];
    total: number;
  };
  investing_activities: {
    items: CashFlowActivityItem[];
    total: number;
  };
  financing_activities: {
    items: CashFlowActivityItem[];
    total: number;
  };
  summary: {
    net_cash_change: number;
    operating_total: number;
    investing_total: number;
    financing_total: number;
  };
}

export async function fetchCashFlow(periodStart: string, periodEnd: string): Promise<CashFlowResponse> {
  const params = new URLSearchParams({ periodStart, periodEnd });
  const data = await apiRequest<CashFlowResponse>(`/cash-flow?${params.toString()}`);
  return data;
}
