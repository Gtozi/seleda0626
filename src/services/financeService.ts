import type { ChartOfAccount, JournalEntry, JournalLine, AccountCategory } from '../types/finance';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export function mapChartOfAccountFromDb(row: any): ChartOfAccount {
  return {
    id: row.code,
    code: row.code,
    name: row.name,
    category: (row.account_type || 'Asset') as AccountCategory,
    subCategory: row.parent_code || '',
    balance: Number(row.balance) || 0,
    currency: row.currency || 'ETB',
    isActive: row.is_active !== false,
  };
}

export function mapJournalLineFromDb(line: any): JournalLine {
  return {
    id: line.id,
    accountId: line.account_code,
    accountName: line.account_name,
    description: line.description || line.memo || '',
    debit: Number(line.debit) || 0,
    credit: Number(line.credit) || 0,
  };
}

export function mapJournalEntryFromDb(row: any): JournalEntry {
  const lines: any[] = row.journal_lines || [];
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  return {
    id: row.id,
    date: row.date,
    reference: row.reference || row.id,
    description: row.description,
    status: (row.status === 'Posted' ? 'Posted' : row.status === 'Reversed' ? 'Reversed' : 'Draft') as JournalEntry['status'],
    createdBy: row.created_by || '',
    approvedBy: row.approved_by,
    amount: totalDebit,
    lines: lines.map(mapJournalLineFromDb),
    department: row.department,
  };
}

export function mapJournalLineToApi(line: JournalLine): any {
  return {
    accountCode: line.accountId,
    accountName: line.accountName,
    description: line.description,
    debit: line.debit,
    credit: line.credit,
  };
}

export async function fetchChartOfAccounts(): Promise<ChartOfAccount[]> {
  const rows = await api<any[]>('/api/finance/chart-of-accounts');
  return rows.map(mapChartOfAccountFromDb);
}

export async function fetchJournalEntries(page = 1, limit = 50, filters?: { period?: string; status?: string }): Promise<{
  data: JournalEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.period) params.append('period', filters.period);
  if (filters?.status) params.append('status', filters.status);
  
  const response = await api<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/finance/journal-entries?${params}`);
  
  return {
    data: response.data.map(mapJournalEntryFromDb),
    pagination: response.pagination,
  };
}

export async function createJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  const body = {
    date: entry.date,
    period: entry.date.slice(0, 7),
    source: 'Manual',
    reference: entry.reference,
    description: entry.description,
    department: entry.department,
    lines: entry.lines.map(mapJournalLineToApi),
  };
  const data = await api<{ success: boolean; entry: any }>('/api/finance/journal-entries', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapJournalEntryFromDb(data.entry);
}

export async function postJournalEntry(id: string): Promise<void> {
  await api<{ success: boolean }>(`/api/finance/journal-entries/${id}/post`, {
    method: 'POST',
  });
}

export async function reverseJournalEntry(id: string): Promise<JournalEntry> {
  const data = await api<{ success: boolean; newEntry: any }>(`/api/finance/journal-entries/${id}/reverse`, {
    method: 'POST',
  });
  return mapJournalEntryFromDb(data.newEntry);
}
