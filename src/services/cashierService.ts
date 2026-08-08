/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cashier Shift Service
 * Client-side wrappers for the /api/cashier-shifts endpoints.
 *
 * Cashier shifts were consolidated from the former standalone Cashiering tab
 * into the Folio & Billing portal. A shift tracks the cashier's opening float,
 * expected balance (opening float + cash payments - cash refunds) and the
 * variance computed when the shift is closed.
 */

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export type CashierShiftStatus = 'open' | 'closed' | 'balanced' | 'over' | 'short';

export interface CashierShift {
  id: string;
  cashierUserId?: string | null;
  cashierName: string;
  status: CashierShiftStatus;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  closingFloat?: number | null;
  expectedBalance: number;
  actualBalance?: number | null;
  variance?: number | null;
  cashPaymentsTotal: number;
  cashRefundsTotal: number;
  paymentCount: number;
  openNotes?: string | null;
  closeNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpenShiftPayload {
  openingFloat: number;
  notes?: string;
}

export interface CloseShiftPayload {
  actualBalance: number;
  closingFloat?: number;
  notes?: string;
}

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

function authFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

function mapShift(row: any): CashierShift {
  return {
    id: String(row.id ?? ''),
    cashierUserId: row.cashier_user_id ? String(row.cashier_user_id) : null,
    cashierName: String(row.cashier_name ?? 'Cashier'),
    status: String(row.status ?? 'open') as CashierShiftStatus,
    openedAt: String(row.opened_at ?? ''),
    closedAt: row.closed_at ? String(row.closed_at) : null,
    openingFloat: Number(row.opening_float ?? 0),
    closingFloat: row.closing_float !== null && row.closing_float !== undefined ? Number(row.closing_float) : null,
    expectedBalance: Number(row.expected_balance ?? 0),
    actualBalance: row.actual_balance !== null && row.actual_balance !== undefined ? Number(row.actual_balance) : null,
    variance: row.variance !== null && row.variance !== undefined ? Number(row.variance) : null,
    cashPaymentsTotal: Number(row.cash_payments_total ?? 0),
    cashRefundsTotal: Number(row.cash_refunds_total ?? 0),
    paymentCount: Number(row.payment_count ?? 0),
    openNotes: row.open_notes ? String(row.open_notes) : null,
    closeNotes: row.close_notes ? String(row.close_notes) : null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

// ----------------------------------------------------------------
// API wrappers
// ----------------------------------------------------------------

/**
 * Fetch cashier shifts, optionally filtered by status.
 */
export async function fetchCashierShifts(status?: CashierShiftStatus): Promise<CashierShift[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const response = await authFetch(`/api/cashier-shifts${qs}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch cashier shifts'));
  const data = await response.json();
  return (data.shifts || []).map(mapShift);
}

/**
 * Open a new cashier shift with the given opening float.
 */
export async function openCashierShift(payload: OpenShiftPayload): Promise<CashierShift> {
  const response = await authFetch('/api/cashier-shifts', {
    method: 'POST',
    body: JSON.stringify({
      openingFloat: payload.openingFloat,
      notes: payload.notes || undefined,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to open cashier shift'));
  const data = await response.json();
  return mapShift(data.shift);
}

/**
 * Close a cashier shift with the counted actual balance.
 */
export async function closeCashierShift(shiftId: string, payload: CloseShiftPayload): Promise<CashierShift> {
  const response = await authFetch(`/api/cashier-shifts/${encodeURIComponent(shiftId)}/close`, {
    method: 'PATCH',
    body: JSON.stringify({
      actualBalance: payload.actualBalance,
      closingFloat: payload.closingFloat,
      notes: payload.notes || undefined,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to close cashier shift'));
  const data = await response.json();
  return mapShift(data.shift);
}
