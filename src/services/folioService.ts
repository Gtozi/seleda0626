/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folio & Billing Service
 * Centralized client-side wrappers for all folio/billing API endpoints.
 *
 * All monetary values are sourced from the database via these endpoints — the
 * deprecated frontend helpers in src/utils/billing.ts should NOT be used for
 * monetary calculations.
 */

import {
  MappedFolio,
  MappedFolioLine,
  MappedFolioPayment,
} from './dataMapper';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface FolioListItem extends MappedFolio {
  guestName?: string;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface ReservationFolioResponse {
  folios: MappedFolio[];
  lines: MappedFolioLine[];
  payments: MappedFolioPayment[];
  consolidatedBalance: number;
  consolidatedCharges: number;
  consolidatedPayments: number;
  billingBreakdown: any | null;
}

export interface FolioBalanceResponse {
  folioId: string;
  folioType: string;
  totalCharges: number;
  totalPayments: number;
  outstandingBalance: number;
}

export interface AddChargePayload {
  description: string;
  amount: number;
  quantity?: number;
  lineType?: string;
  revenueAccountCode?: string | null;
  sourceReference?: string | null;
  discountPercent?: number;
  targetFolio?: 'A' | 'B' | null;
  usaliCode?: string | null;
  usaliRevenueCode?: string | null;
  usaliCostCode?: string | null;
  department?: string | null;
}

export interface AddChargeResponse {
  success: boolean;
  folioId: string;
  lineId: string;
  lineNumber: number;
  newBalance: number;
}

export interface PaymentSplit {
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  receiptUrl?: string | null;
  bankAccountId?: string | null;
  idempotencyKey?: string | null;
}

export interface PaymentResult {
  success: boolean;
  folioId: string;
  paymentId: string;
  idempotent?: boolean;
  message?: string;
  amount: number;
  method: string;
}

export interface InvoiceDocument {
  id: string;
  folio_id: string;
  invoice_number: string;
  invoice_type: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_tin: string | null;
  customer_vat_no: string | null;
  notes: string | null;
}

export interface GenerateInvoiceResponse {
  success: boolean;
  invoice: InvoiceDocument;
  paymentsLinked: number;
}

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

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

// ----------------------------------------------------------------
// Read endpoints
// ----------------------------------------------------------------

/**
 * Fetch all folios (optionally filtered by reservation_id). The endpoint joins
 * the reservations table so each folio carries guest_name / room_number for the
 * list view.
 */
export async function fetchFolios(reservationId?: string): Promise<FolioListItem[]> {
  const params = new URLSearchParams();
  if (reservationId) params.append('reservation_id', reservationId);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const response = await authFetch(`/api/folios${qs}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch folios'));
  const data = await response.json();

  return (data.folios || []).map((row: any) => ({
    id: String(row.id ?? ''),
    reservationId: String(row.reservation_id ?? ''),
    folioType: String(row.folio_type ?? 'Guest'),
    targetFolio: row.target_folio ? String(row.target_folio) : undefined,
    status: String(row.status ?? 'Open'),
    balance: Number(row.balance ?? 0),
    totalCharges: Number(row.total_charges ?? 0),
    totalPayments: Number(row.total_payments ?? 0),
    taxTotal: Number(row.tax_total ?? 0),
    serviceChargeTotal: Number(row.service_charge_total ?? 0),
    currency: String(row.currency ?? 'USD'),
    openedAt: String(row.opened_at ?? ''),
    closedAt: row.closed_at ? String(row.closed_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    // joined reservation fields
    guestName: row.reservations?.guest_name ? String(row.reservations.guest_name) : undefined,
    roomNumber: row.reservations?.room_number ? String(row.reservations.room_number) : undefined,
    checkInDate: row.reservations?.check_in_date ? String(row.reservations.check_in_date) : undefined,
    checkOutDate: row.reservations?.check_out_date ? String(row.reservations.check_out_date) : undefined,
  }));
}

/**
 * Fetch the canonical folio (folios + lines + payments + billing breakdown) for
 * a reservation. This is the source of truth for the folio detail view.
 */
export async function fetchReservationFolio(reservationId: string): Promise<ReservationFolioResponse> {
  const response = await authFetch(`/api/${encodeURIComponent(reservationId)}/folio`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch folio'));
  return response.json();
}

/**
 * Fetch a consolidated/A/B folio balance for a reservation.
 */
export async function fetchFolioBalance(
  reservationId: string,
  folioType: 'consolidated' | 'folio-a' | 'folio-b' = 'consolidated'
): Promise<FolioBalanceResponse> {
  const response = await authFetch(
    `/api/${encodeURIComponent(reservationId)}/folio-balance?folioType=${folioType}`
  );
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch folio balance'));
  return response.json();
}

// ----------------------------------------------------------------
// Charge endpoints
// ----------------------------------------------------------------

/**
 * Post a charge to a reservation's folio. Creates the folio if it doesn't exist.
 */
export async function addCharge(reservationId: string, payload: AddChargePayload): Promise<AddChargeResponse> {
  const response = await authFetch(`/api/${encodeURIComponent(reservationId)}/charges`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to post charge'));
  return response.json();
}

/**
 * Void a folio line (charge). Requires a reason.
 */
export async function voidCharge(
  reservationId: string,
  chargeId: string,
  reason: string,
  approvedBy?: string
): Promise<{ success: boolean; lineId: string; amountReversed: number }> {
  const response = await authFetch(
    `/api/${encodeURIComponent(reservationId)}/charges/${encodeURIComponent(chargeId)}/void`,
    {
      method: 'POST',
      body: JSON.stringify({ reason, approvedBy: approvedBy || null }),
    }
  );
  if (!response.ok) throw new Error(await parseError(response, 'Failed to void charge'));
  return response.json();
}

/**
 * Update a folio line (target folio routing and/or amount).
 */
export async function updateCharge(
  reservationId: string,
  chargeId: string,
  updates: { targetFolio?: 'A' | 'B' | null; amount?: number }
): Promise<{ success: boolean; lineId: string }> {
  const response = await authFetch(
    `/api/${encodeURIComponent(reservationId)}/charges/${encodeURIComponent(chargeId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );
  if (!response.ok) throw new Error(await parseError(response, 'Failed to update charge'));
  return response.json();
}

// ----------------------------------------------------------------
// Payment endpoints
// ----------------------------------------------------------------

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  isDefaultForSales: boolean;
}

/**
 * Fetch active bank accounts for the payment dropdown.
 */
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const response = await authFetch('/api/finance/bank-accounts');
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch bank accounts'));
  const data = await response.json();
  const accounts = data?.bankAccounts || [];
  return accounts
    .filter((a: any) => a.is_active !== false)
    .map((a: any) => ({
      id: a.id,
      accountName: a.account_name,
      bankName: a.bank_name,
      accountNumber: a.account_number,
      accountType: a.account_type,
      currency: a.currency,
      isDefaultForSales: !!a.is_default_for_sales,
    }))
    .sort((a: BankAccount, b: BankAccount) => {
      // Default-for-sales first, then alphabetical by bank name
      if (a.isDefaultForSales !== b.isDefaultForSales) return a.isDefaultForSales ? -1 : 1;
      return a.bankName.localeCompare(b.bankName);
    });
}

/**
 * Post a single payment or a set of split payments to a reservation's folio.
 */
export async function postPayment(
  reservationId: string,
  payment: PaymentSplit | PaymentSplit[]
): Promise<PaymentResult[]> {
  const body = Array.isArray(payment)
    ? { paymentSplits: payment }
    : {
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        receiptUrl: payment.receiptUrl,
        bankAccountId: payment.bankAccountId,
        idempotencyKey: payment.idempotencyKey,
      };

  const response = await authFetch(`/api/${encodeURIComponent(reservationId)}/payments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to post payment'));
  const data = await response.json();
  // Endpoint returns either a single result or { paymentResults: [...] }
  if (Array.isArray(data?.paymentResults)) return data.paymentResults;
  return [data];
}

/**
 * Void a folio payment. Requires a reason.
 */
export async function voidPayment(
  reservationId: string,
  paymentId: string,
  reason: string
): Promise<{ success: boolean }> {
  const response = await authFetch(
    `/api/${encodeURIComponent(reservationId)}/payments/${encodeURIComponent(paymentId)}/void`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
  if (!response.ok) throw new Error(await parseError(response, 'Failed to void payment'));
  return response.json();
}

// ----------------------------------------------------------------
// Invoice / folio close endpoints
// ----------------------------------------------------------------

/**
 * Generate an invoice document for a folio.
 */
export async function generateInvoice(
  folioId: string,
  options?: { invoiceType?: string; dueDate?: string; notes?: string }
): Promise<GenerateInvoiceResponse> {
  console.log('[folioService] generateInvoice START', folioId);
  const response = await authFetch(`/api/folios/${encodeURIComponent(folioId)}/generate-invoice`, {
    method: 'POST',
    body: JSON.stringify({
      invoiceType: options?.invoiceType || 'Guest',
      dueDate: options?.dueDate || null,
      notes: options?.notes || null,
    }),
  });
  console.log('[folioService] generateInvoice response status:', response.status, response.ok);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to generate invoice'));
  const data = await response.json();
  console.log('[folioService] generateInvoice parsed data:', data);
  return data;
}

/**
 * Close a folio and generate its final invoice in one step.
 */
export async function closeFolioWithInvoice(folioId: string): Promise<any> {
  const response = await authFetch(`/api/folios/${encodeURIComponent(folioId)}/close-with-invoice`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to close folio'));
  return response.json();
}

/**
 * Fetch a single invoice document with full folio/payment details for preview/print.
 */
export async function fetchInvoice(invoiceId: string): Promise<any> {
  const response = await authFetch(`/api/invoices/${encodeURIComponent(invoiceId)}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch invoice'));
  return response.json();
}

export interface FolioInvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_type: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  status: string;
  is_voided: boolean;
  created_at: string;
}

/**
 * Fetch all invoice documents for a folio.
 */
export async function fetchFolioInvoices(folioId: string): Promise<FolioInvoiceSummary[]> {
  const response = await authFetch(`/api/folios/${encodeURIComponent(folioId)}/invoices`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch folio invoices'));
  const data = await response.json();
  return data?.invoices || [];
}
