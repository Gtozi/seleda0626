const API_BASE = '/api/bank-reconciliation';

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

export interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  currency: string;
  balance: number;
  last_reconciled_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StatementLine {
  id: string;
  bank_account_id: string;
  statement_date: string;
  transaction_date: string;
  description?: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  status: string;
  matched_journal_line_id?: string;
  created_at: string;
}

export interface ReconciliationBatch {
  id: string;
  bank_account_id: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  total_debits: number;
  total_credits: number;
  status: string;
  reconciled_by?: string;
  reconciled_at?: string;
  created_at: string;
  bank_accounts?: { account_name: string; account_number: string };
}

export function mapBankAccountFromDb(row: any): BankAccount {
  return {
    id: row.id,
    account_number: row.account_number,
    account_name: row.account_name,
    bank_name: row.bank_name,
    currency: row.currency,
    balance: Number(row.balance) || 0,
    last_reconciled_date: row.last_reconciled_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapStatementLineFromDb(row: any): StatementLine {
  return {
    id: row.id,
    bank_account_id: row.bank_account_id,
    statement_date: row.statement_date,
    transaction_date: row.transaction_date,
    description: row.description,
    reference: row.reference,
    debit: Number(row.debit) || 0,
    credit: Number(row.credit) || 0,
    balance: Number(row.balance) || 0,
    status: row.status,
    matched_journal_line_id: row.matched_journal_line_id,
    created_at: row.created_at,
  };
}

export function mapReconciliationBatchFromDb(row: any): ReconciliationBatch {
  return {
    id: row.id,
    bank_account_id: row.bank_account_id,
    period_start: row.period_start,
    period_end: row.period_end,
    opening_balance: Number(row.opening_balance) || 0,
    closing_balance: Number(row.closing_balance) || 0,
    total_debits: Number(row.total_debits) || 0,
    total_credits: Number(row.total_credits) || 0,
    status: row.status,
    reconciled_by: row.reconciled_by,
    reconciled_at: row.reconciled_at,
    created_at: row.created_at,
    bank_accounts: row.bank_accounts,
  };
}

export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const data = await apiRequest<any[]>('/accounts');
  return data.map(mapBankAccountFromDb);
}

export async function createBankAccount(account: Omit<BankAccount, 'id' | 'balance' | 'last_reconciled_date' | 'status' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
  const data = await apiRequest<any>('/accounts', {
    method: 'POST',
    body: JSON.stringify({
      accountNumber: account.account_number,
      accountName: account.account_name,
      bankName: account.bank_name,
      currency: account.currency,
    }),
  });
  return mapBankAccountFromDb(data);
}

export async function fetchStatementLines(bankAccountId?: string, status?: string): Promise<StatementLine[]> {
  const params = new URLSearchParams();
  if (bankAccountId) params.set('bankAccountId', bankAccountId);
  if (status) params.set('status', status);
  const data = await apiRequest<any[]>(`/statement-lines?${params.toString()}`);
  return data.map(mapStatementLineFromDb);
}

export async function importStatementLines(bankAccountId: string, lines: Array<{
  statement_date: string;
  transaction_date: string;
  description?: string;
  reference?: string;
  debit?: number;
  credit?: number;
  balance?: number;
}>): Promise<{ imported_count: number }> {
  return apiRequest('/statement-lines/import', {
    method: 'POST',
    body: JSON.stringify({ bankAccountId, lines }),
  });
}

export async function matchStatementLine(statementLineId: string, journalLineId: string): Promise<{ success: boolean }> {
  return apiRequest(`/statement-lines/${statementLineId}/match`, {
    method: 'POST',
    body: JSON.stringify({ journalLineId }),
  });
}

export async function fetchReconciliationBatches(bankAccountId?: string): Promise<ReconciliationBatch[]> {
  const params = new URLSearchParams();
  if (bankAccountId) params.set('bankAccountId', bankAccountId);
  const data = await apiRequest<any[]>(`/batches?${params.toString()}`);
  return data.map(mapReconciliationBatchFromDb);
}

export async function createReconciliationBatch(batch: Omit<ReconciliationBatch, 'id' | 'total_debits' | 'total_credits' | 'status' | 'reconciled_by' | 'reconciled_at' | 'created_at' | 'bank_accounts'>): Promise<ReconciliationBatch> {
  const data = await apiRequest<any>('/batches', {
    method: 'POST',
    body: JSON.stringify({
      bankAccountId: batch.bank_account_id,
      periodStart: batch.period_start,
      periodEnd: batch.period_end,
      openingBalance: batch.opening_balance,
      closingBalance: batch.closing_balance,
    }),
  });
  return mapReconciliationBatchFromDb(data);
}
