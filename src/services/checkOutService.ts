/**
 * Check-Out Service
 * Handles all check-out related database operations
 *
 * Mirrors the checkInService pattern:
 *  - Pending check-outs are reservations with status 'CheckedIn'
 *  - Per-step progress is persisted in the reservation's `notes` field as
 *    `CHECK_OUT_DATA:{...json...}` (same approach used for check-in steps)
 *  - Folio balance is sourced from the `folios` table when present, otherwise
 *    derived from the reservation's total_amount - deposit_amount
 */

import { supabase } from '../lib/supabase';

export type CheckOutStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface CheckOutRequest {
  id: string;
  guestName: string;
  reservationId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  checkOutTime: string;
  nights: number;
  status: CheckOutStatus;
  folioId: string | null;
  folioBalance: number;
  balance: number;
  lateCheckoutRequested: boolean;
  lateCheckoutFee?: number;
  invoiceReviewed: boolean;
  settlementProcessed: boolean;
  refundProcessed: boolean;
  feedbackCollected: boolean;
  folioClosed: boolean;
  groupBookingId?: string | null;
  bookingGroupId?: string | null;
}

export interface CheckOutStep {
  invoiceReviewed: boolean;
  settlementProcessed: boolean;
  refundProcessed: boolean;
  feedbackCollected: boolean;
  folioClosed: boolean;
}

export interface FolioDetails {
  folio: any | null;
  charges: any[];
  payments: any[];
  balance: number;
}

const DEFAULT_CHECKOUT_TIME = '11:00';

/**
 * Build a CheckOutRequest from a reservation row + its folio (if any)
 */
function buildCheckOutRequest(reservation: any, folio: any | null, steps: CheckOutStep | null): CheckOutRequest {
  const checkInDate = new Date(reservation.check_in_date);
  const checkOutDate = new Date(reservation.check_out_date);
  const nights = Math.max(
    1,
    Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const folioBalance = folio ? Number(folio.balance ?? 0) : 0;
  const reservationBalance = Number(reservation.total_amount ?? 0) - Number(reservation.deposit_amount ?? 0);
  const balance = folio ? folioBalance : Math.max(0, reservationBalance);

  // Determine workflow status from reservation status + step progress
  let status: CheckOutStatus = 'pending';
  if (reservation.status === 'CheckedOut') {
    status = 'completed';
  } else if (steps && (steps.invoiceReviewed || steps.settlementProcessed || steps.folioClosed)) {
    status = 'in-progress';
  }

  return {
    id: `CO-${reservation.id}`,
    guestName: reservation.guest_name,
    reservationId: reservation.id,
    roomNumber: reservation.room_number || 'Unassigned',
    roomType: reservation.room_type,
    checkInDate: reservation.check_in_date,
    checkOutDate: reservation.check_out_date,
    checkOutTime: DEFAULT_CHECKOUT_TIME,
    nights,
    status,
    folioId: folio?.id ?? null,
    folioBalance,
    balance,
    lateCheckoutRequested: Boolean(reservation.late_check_out_requested),
    lateCheckoutFee: reservation.late_check_out_requested ? 50 : undefined,
    invoiceReviewed: steps?.invoiceReviewed ?? false,
    settlementProcessed: steps?.settlementProcessed ?? false,
    refundProcessed: steps?.refundProcessed ?? false,
    feedbackCollected: steps?.feedbackCollected ?? false,
    folioClosed: steps?.folioClosed ?? (folio?.status === 'Closed'),
    groupBookingId: reservation.group_booking_id || null,
    bookingGroupId: reservation.booking_group_id || null,
  };
}

/**
 * Fetch the folio for a reservation (most recent open/closed folio)
 */
async function getFolioForReservation(reservationId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('folios')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching folio for reservation:', error);
    return null;
  }
  return data;
}

/**
 * Fetch pending check-outs (currently checked-in guests) from the database
 */
export async function getPendingCheckOuts(): Promise<CheckOutRequest[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        status,
        total_amount,
        deposit_amount,
        late_check_out_requested,
        group_booking_id,
        booking_group_id,
        notes
      `)
      .in('status', ['CheckedIn', 'CheckedOut'])
      .order('check_out_date', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return Promise.all(
      data.map(async (reservation: any) => {
        const [folio, steps] = await Promise.all([
          getFolioForReservation(reservation.id),
          getCheckOutStatus(reservation.id, reservation.notes),
        ]);
        return buildCheckOutRequest(reservation, folio, steps);
      })
    );
  } catch (error) {
    console.error('Error fetching pending check-outs:', error);
    return [];
  }
}

/**
 * Search check-outs by reservation id or guest name
 */
export async function searchCheckOuts(searchTerm: string): Promise<CheckOutRequest[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        status,
        total_amount,
        deposit_amount,
        late_check_out_requested,
        group_booking_id,
        booking_group_id,
        notes
      `)
      .or(`id.ilike.%${searchTerm}%,guest_name.ilike.%${searchTerm}%`)
      .in('status', ['CheckedIn', 'CheckedOut'])
      .order('check_out_date', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return Promise.all(
      data.map(async (reservation: any) => {
        const [folio, steps] = await Promise.all([
          getFolioForReservation(reservation.id),
          getCheckOutStatus(reservation.id, reservation.notes),
        ]);
        return buildCheckOutRequest(reservation, folio, steps);
      })
    );
  } catch (error) {
    console.error('Error searching check-outs:', error);
    return [];
  }
}

/**
 * Parse check-out step data from reservation notes
 */
function parseCheckOutData(notes: string): CheckOutStep {
  try {
    const match = (notes || '').match(/CHECK_OUT_DATA:({.*?})/);
    if (match) {
      const parsed = JSON.parse(match[1]);
      return {
        invoiceReviewed: Boolean(parsed.invoiceReviewed),
        settlementProcessed: Boolean(parsed.settlementProcessed),
        refundProcessed: Boolean(parsed.refundProcessed),
        feedbackCollected: Boolean(parsed.feedbackCollected),
        folioClosed: Boolean(parsed.folioClosed),
      };
    }
  } catch (e) {
    console.error('Error parsing check-out data:', e);
  }
  return {
    invoiceReviewed: false,
    settlementProcessed: false,
    refundProcessed: false,
    feedbackCollected: false,
    folioClosed: false,
  };
}

/**
 * Re-serialize check-out step data into the reservation notes string
 */
function updateCheckOutDataInNotes(notes: string, checkOutData: CheckOutStep): string {
  const cleanedNotes = (notes || '').replace(/CHECK_OUT_DATA:({.*?})/, '').trim();
  const checkOutString = `CHECK_OUT_DATA:${JSON.stringify(checkOutData)}`;
  return cleanedNotes ? `${cleanedNotes}\n${checkOutString}` : checkOutString;
}

/**
 * Get check-out step status for a specific reservation.
 * Accepts an optional pre-fetched notes string to avoid an extra round-trip.
 */
export async function getCheckOutStatus(
  reservationId: string,
  existingNotes?: string
): Promise<CheckOutStep | null> {
  try {
    let notes = existingNotes;
    if (notes === undefined) {
      const { data, error } = await supabase
        .from('reservations')
        .select('notes')
        .eq('id', reservationId)
        .maybeSingle();
      if (error || !data) return null;
      notes = data.notes || '';
    }
    return parseCheckOutData(notes ?? '');
  } catch (error) {
    console.error('Error getting check-out status:', error);
    return null;
  }
}

/**
 * Update a single check-out step status (persisted in reservation notes)
 */
export async function updateCheckOutStep(
  reservationId: string,
  step: keyof CheckOutStep,
  completed: boolean
): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('reservations')
      .select('notes')
      .eq('id', reservationId)
      .maybeSingle();

    if (!existing) return false;

    const checkOutData = parseCheckOutData(existing.notes || '');
    (checkOutData as any)[step] = completed;
    const updatedNotes = updateCheckOutDataInNotes(existing.notes || '', checkOutData);

    const { error } = await supabase
      .from('reservations')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', reservationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating check-out step:', error);
    return false;
  }
}

/**
 * Fetch folio details (folio + charges/lines + payments) for invoice review
 */
export async function getFolioDetails(reservationId: string): Promise<FolioDetails> {
  try {
    const folio = await getFolioForReservation(reservationId);

    if (!folio) {
      // No folio yet — return empty details with reservation-derived balance
      const { data: reservation } = await supabase
        .from('reservations')
        .select('total_amount, deposit_amount')
        .eq('id', reservationId)
        .maybeSingle();
      const balance = Math.max(
        0,
        Number(reservation?.total_amount ?? 0) - Number(reservation?.deposit_amount ?? 0)
      );
      return { folio: null, charges: [], payments: [], balance };
    }

    const [chargesRes, paymentsRes] = await Promise.all([
      supabase
        .from('folio_lines')
        .select('*')
        .eq('folio_id', folio.id)
        .eq('is_voided', false)
        .order('line_number', { ascending: true }),
      supabase
        .from('folio_payments')
        .select('*')
        .eq('folio_id', folio.id)
        .eq('is_voided', false)
        .order('payment_date', { ascending: false }),
    ]);

    return {
      folio,
      charges: chargesRes.data || [],
      payments: paymentsRes.data || [],
      balance: Number(folio.balance ?? 0),
    };
  } catch (error) {
    console.error('Error fetching folio details:', error);
    return { folio: null, charges: [], payments: [], balance: 0 };
  }
}

/**
 * Process a settlement payment against the guest's folio.
 * Records a folio_payments row (non-refund).
 */
export async function processSettlement(
  reservationId: string,
  amount: number,
  paymentMethod: string,
  reference?: string
): Promise<boolean> {
  try {
    const folio = await getFolioForReservation(reservationId);
    if (!folio) {
      console.error('No folio found for settlement');
      return false;
    }

    const { error } = await supabase.from('folio_payments').insert({
      folio_id: folio.id,
      reservation_id: reservationId,
      amount,
      payment_method: paymentMethod,
      reference_number: reference || null,
      is_refund: false,
      payment_date: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing settlement:', error);
    return false;
  }
}

/**
 * Process a refund against the guest's folio.
 * Records a folio_payments row with is_refund = true.
 */
export async function processRefund(
  reservationId: string,
  amount: number,
  paymentMethod: string,
  reference?: string
): Promise<boolean> {
  try {
    const folio = await getFolioForReservation(reservationId);
    if (!folio) {
      console.error('No folio found for refund');
      return false;
    }

    const { error } = await supabase.from('folio_payments').insert({
      folio_id: folio.id,
      reservation_id: reservationId,
      amount,
      payment_method: paymentMethod,
      reference_number: reference || null,
      is_refund: true,
      payment_date: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing refund:', error);
    return false;
  }
}

/**
 * Submit guest feedback (inserts into guest_feedbacks)
 */
export async function submitGuestFeedback(
  reservationId: string,
  guestName: string,
  rating: number,
  comment: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('guest_feedbacks').insert({
      reservation_id: reservationId,
      guest_name: guestName,
      rating,
      comment,
      feedback_date: new Date().toISOString().split('T')[0],
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error submitting guest feedback:', error);
    return false;
  }
}

/**
 * Fetch recent guest feedback entries
 */
export async function getRecentFeedback(limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('guest_feedbacks')
      .select('*')
      .order('feedback_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent feedback:', error);
    return [];
  }
}

/**
 * Close the guest's folio (status -> Closed, set closed_at)
 */
export async function closeFolio(reservationId: string): Promise<boolean> {
  try {
    const folio = await getFolioForReservation(reservationId);
    if (!folio) {
      console.error('No folio found to close');
      return false;
    }

    const { error } = await supabase
      .from('folios')
      .update({
        status: 'Closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', folio.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error closing folio:', error);
    return false;
  }
}

/**
 * Complete the check-out: mark reservation status as CheckedOut.
 */
export async function completeCheckOut(reservationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'CheckedOut',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing check-out:', error);
    return false;
  }
}

/**
 * Toggle the late check-out request flag on a reservation.
 */
export async function toggleLateCheckOut(
  reservationId: string,
  requested: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({
        late_check_out_requested: requested,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling late check-out:', error);
    return false;
  }
}

/**
 * Get reservation details for invoice printing
 */
export async function getReservationForInvoice(reservationId: string) {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        adults,
        children,
        total_amount,
        deposit_amount,
        rate,
        notes
      `)
      .eq('id', reservationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reservation for invoice:', error);
    return null;
  }
}

/**
 * Open a printable invoice window for the reservation + folio details.
 */
export function printInvoice(reservation: any, folioDetails: FolioDetails) {
  if (!reservation) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print invoices');
    return;
  }

  const checkInDate = new Date(reservation.check_in_date).toLocaleDateString();
  const checkOutDate = new Date(reservation.check_out_date).toLocaleDateString();
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(reservation.check_out_date).getTime() -
        new Date(reservation.check_in_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const chargesRows = (folioDetails.charges || [])
    .map(
      (c: any) => `
      <tr>
        <td>${c.transaction_date ? new Date(c.transaction_date).toLocaleDateString() : ''}</td>
        <td>${c.description || ''}</td>
        <td style="text-align:right">${Number(c.amount || 0).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const paymentRows = (folioDetails.payments || [])
    .map(
      (p: any) => `
      <tr>
        <td>${new Date(p.payment_date).toLocaleDateString()}</td>
        <td>${p.payment_method || ''}${p.is_refund ? ' (Refund)' : ''}</td>
        <td style="text-align:right">${Number(p.amount || 0).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const totalCharges = (folioDetails.charges || []).reduce(
    (s: number, c: any) => s + Number(c.amount || 0),
    0
  );
  const totalPayments = (folioDetails.payments || []).reduce(
    (s: number, p: any) => s + Number(p.amount || 0) * (p.is_refund ? -1 : 1),
    0
  );

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${reservation.guest_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f5f5f5; }
        .totals { text-align: right; margin-top: 10px; }
        .totals div { margin: 4px 0; }
        .grand { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Guest Invoice</h1>
        <p>Reservation #${reservation.id}</p>
      </div>
      <div class="section">
        <h2>Guest & Stay Details</h2>
        <table>
          <tr><td><strong>Guest</strong></td><td>${reservation.guest_name}</td></tr>
          <tr><td><strong>Room</strong></td><td>${reservation.room_number || 'N/A'} (${reservation.room_type})</td></tr>
          <tr><td><strong>Check-In</strong></td><td>${checkInDate}</td></tr>
          <tr><td><strong>Check-Out</strong></td><td>${checkOutDate}</td></tr>
          <tr><td><strong>Nights</strong></td><td>${nights}</td></tr>
          <tr><td><strong>Guests</strong></td><td>${reservation.adults || 1} adults, ${reservation.children || 0} children</td></tr>
        </table>
      </div>
      <div class="section">
        <h2>Charges</h2>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>${chargesRows || '<tr><td colspan="3">No charges</td></tr>'}</tbody>
        </table>
      </div>
      <div class="section">
        <h2>Payments</h2>
        <table>
          <thead><tr><th>Date</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>${paymentRows || '<tr><td colspan="3">No payments</td></tr>'}</tbody>
        </table>
      </div>
      <div class="totals">
        <div>Total Charges: $${totalCharges.toFixed(2)}</div>
        <div>Total Payments: $${totalPayments.toFixed(2)}</div>
        <div class="grand">Balance Due: $${folioDetails.balance.toFixed(2)}</div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Open a printable group invoice window — primary contact info + per-member folio summary + guest list.
 */
export function printGroupInvoice(group: any, members: any[], memberFolios: { reservationId: string; details: FolioDetails }[]) {
  if (!group || !members || members.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print invoices');
    return;
  }

  const groupName = group.group_name || group.name || group.id;
  const primaryContact = group.contact_name || members[0]?.guest_name || 'N/A';
  const contactEmail = group.contact_email || members[0]?.guest_email || 'N/A';
  const contactPhone = group.contact_phone || members[0]?.guest_phone || 'N/A';
  const checkInDate = members[0]?.check_in_date ? new Date(members[0].check_in_date).toLocaleDateString() : 'N/A';
  const checkOutDate = members[0]?.check_out_date ? new Date(members[0].check_out_date).toLocaleDateString() : 'N/A';

  // Build per-member rows with folio balance
  const memberRows = members.map((m, i) => {
    const folioData = memberFolios.find((f) => f.reservationId === m.id);
    const balance = folioData?.details.balance ?? 0;
    const totalCharges = (folioData?.details.charges || []).reduce((s: number, c: any) => s + Number(c.amount || 0), 0);
    const totalPayments = (folioData?.details.payments || []).reduce((s: number, p: any) => s + Number(p.amount || 0) * (p.is_refund ? -1 : 1), 0);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${m.guest_name || 'N/A'}</td>
        <td>${m.room_type || 'N/A'}</td>
        <td>${m.room_number || 'N/A'}</td>
        <td style="text-align:right">$${totalCharges.toFixed(2)}</td>
        <td style="text-align:right">$${totalPayments.toFixed(2)}</td>
        <td style="text-align:right">$${balance.toFixed(2)}</td>
      </tr>`;
  }).join('');

  const grandCharges = memberFolios.reduce((s, f) => s + (f.details.charges || []).reduce((s2: number, c: any) => s2 + Number(c.amount || 0), 0), 0);
  const grandPayments = memberFolios.reduce((s, f) => s + (f.details.payments || []).reduce((s2: number, p: any) => s2 + Number(p.amount || 0) * (p.is_refund ? -1 : 1), 0), 0);
  const grandBalance = memberFolios.reduce((s, f) => s + f.details.balance, 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Group Invoice - ${groupName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #666; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .row { display: flex; margin-bottom: 8px; }
        .label { font-weight: bold; width: 180px; flex-shrink: 0; }
        .value { flex-grow: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; font-size: 12px; }
        th { background: #f5f5f5; }
        .totals { text-align: right; margin-top: 10px; }
        .totals div { margin: 4px 0; }
        .grand { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 8px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Group Invoice</h1>
        <p>${groupName} · ${members.length} room${members.length !== 1 ? 's' : ''}</p>
      </div>

      <div class="section">
        <h2>Primary Contact Information</h2>
        <div class="row"><div class="label">Group Name:</div><div class="value">${groupName}</div></div>
        <div class="row"><div class="label">Primary Contact:</div><div class="value">${primaryContact}</div></div>
        <div class="row"><div class="label">Email:</div><div class="value">${contactEmail}</div></div>
        <div class="row"><div class="label">Phone:</div><div class="value">${contactPhone}</div></div>
        ${group.contact_company ? `<div class="row"><div class="label">Company:</div><div class="value">${group.contact_company}</div></div>` : ''}
        <div class="row"><div class="label">Check-In:</div><div class="value">${checkInDate}</div></div>
        <div class="row"><div class="label">Check-Out:</div><div class="value">${checkOutDate}</div></div>
      </div>

      <div class="section">
        <h2>Guest Folio Summary</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Guest Name</th>
              <th>Room Type</th>
              <th>Room No.</th>
              <th style="text-align:right">Charges</th>
              <th style="text-align:right">Payments</th>
              <th style="text-align:right">Balance</th>
            </tr>
          </thead>
          <tbody>${memberRows || '<tr><td colspan="7">No members</td></tr>'}</tbody>
        </table>
      </div>

      <div class="totals">
        <div>Total Charges: $${grandCharges.toFixed(2)}</div>
        <div>Total Payments: $${grandPayments.toFixed(2)}</div>
        <div class="grand">Total Balance Due: $${grandBalance.toFixed(2)}</div>
      </div>

      <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
export function downloadInvoiceCsv(reservation: any, folioDetails: FolioDetails) {
  if (!reservation) return;

  const rows: string[][] = [];
  rows.push(['Invoice', `Reservation #${reservation.id}`]);
  rows.push(['Guest', reservation.guest_name]);
  rows.push(['Room', `${reservation.room_number || 'N/A'} (${reservation.room_type})`]);
  rows.push([]);
  rows.push(['Date', 'Description', 'Type', 'Amount']);
  (folioDetails.charges || []).forEach((c: any) => {
    rows.push([
      c.transaction_date ? new Date(c.transaction_date).toLocaleDateString() : '',
      c.description || '',
      'Charge',
      Number(c.amount || 0).toFixed(2),
    ]);
  });
  (folioDetails.payments || []).forEach((p: any) => {
    rows.push([
      new Date(p.payment_date).toLocaleDateString(),
      `${p.payment_method || ''}${p.is_refund ? ' (Refund)' : ''}`,
      p.is_refund ? 'Refund' : 'Payment',
      Number(p.amount || 0).toFixed(2),
    ]);
  });
  rows.push([]);
  rows.push(['', '', 'Balance Due', folioDetails.balance.toFixed(2)]);

  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${reservation.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
