/**
 * Front Office Reports Service
 * Database-integrated reporting for daily, reservation, financial, and operational reports
 */

import { supabase } from '../lib/supabase';

// Types
export interface ReportData {
  id: string;
  name: string;
  category: 'daily' | 'reservation' | 'financial' | 'operational';
  description: string;
  lastGenerated?: string;
  scheduled?: string;
  data?: any[];
  summary?: any;
}

export interface ReportFilter {
  dateRange?: { start: Date; end: Date };
  status?: string[];
  roomType?: string[];
  channel?: string[];
}

export interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  recipients: string[];
  status: 'Active' | 'Paused';
  nextRun: string;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// DAILY REPORTS
// ============================================================================

/**
 * Arrival Report - Today's expected arrivals
 */
export async function getArrivalReport(date: Date = new Date()) {
  const today = date.toISOString().split('T')[0];
  
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
      status,
      rate,
      total_amount,
      channel,
      payment_status,
      guests (
        id,
        name,
        email,
        phone,
        status,
        nationality
      )
    `)
    .eq('check_in_date', today)
    .in('status', ['Confirmed', 'CheckedIn'])
    .order('check_in_date', { ascending: true });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalArrivals: data?.length || 0,
      totalRooms: data?.length || 0,
      totalAdults: data?.reduce((sum, r) => sum + r.adults, 0) || 0,
      totalChildren: data?.reduce((sum, r) => sum + r.children, 0) || 0,
      expectedRevenue: data?.reduce((sum, r) => sum + r.total_amount, 0) || 0
    }
  };
}

/**
 * Departure Report - Today's expected departures
 */
export async function getDepartureReport(date: Date = new Date()) {
  const today = date.toISOString().split('T')[0];
  
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
      status,
      rate,
      total_amount,
      channel,
      payment_status,
      guests (
        id,
        name,
        email,
        phone,
        status
      )
    `)
    .eq('check_out_date', today)
    .in('status', ['Confirmed', 'CheckedIn'])
    .order('check_out_date', { ascending: true });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalDepartures: data?.length || 0,
      totalRooms: data?.length || 0,
      totalAdults: data?.reduce((sum, r) => sum + r.adults, 0) || 0,
      totalChildren: data?.reduce((sum, r) => sum + r.children, 0) || 0,
      outstandingBalance: data?.reduce((sum, r) => 
        r.payment_status === 'Unpaid' || r.payment_status === 'Partial' ? sum + r.total_amount : sum, 0) || 0
    }
  };
}

/**
 * In-House Guests Report - Current in-house guest list
 */
export async function getInHouseGuestsReport() {
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
      status,
      rate,
      total_amount,
      channel,
      payment_status,
      guests (
        id,
        name,
        email,
        phone,
        status,
        nationality
      )
    `)
    .eq('status', 'CheckedIn')
    .order('room_number', { ascending: true });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalInHouse: data?.length || 0,
      totalRooms: data?.length || 0,
      totalAdults: data?.reduce((sum, r) => sum + r.adults, 0) || 0,
      totalChildren: data?.reduce((sum, r) => sum + r.children, 0) || 0,
      occupancyRate: data?.length || 0 // Will need total room count for percentage
    }
  };
}

/**
 * VIP Guests Report - VIP guest summary
 */
export async function getVipGuestsReport() {
  const { data, error } = await supabase
    .from('guests')
    .select(`
      id,
      name,
      email,
      phone,
      status,
      nationality,
      total_spend,
      loyalty_points,
      preferences,
      reservations (
        id,
        room_number,
        check_in_date,
        check_out_date,
        status,
        total_amount
      )
    `)
    .eq('status', 'VIP')
    .order('total_spend', { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalVipGuests: data?.length || 0,
      totalSpend: data?.reduce((sum, g) => sum + (g.total_spend || 0), 0) || 0,
      averageSpend: data?.length ? (data.reduce((sum, g) => sum + (g.total_spend || 0), 0) / data.length) : 0,
      currentStays: data?.reduce((sum, g) => 
        sum + (g.reservations?.filter((r: any) => r.status === 'CheckedIn').length || 0), 0) || 0
    }
  };
}

/**
 * House Status Report - Room housekeeping status
 */
export async function getHouseStatusReport() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      id,
      number,
      type,
      floor,
      status,
      rate,
      features,
      reservations (
        id,
        guest_name,
        status,
        check_in_date,
        check_out_date
      )
    `)
    .order('floor', { ascending: true })
    .order('number', { ascending: true });

  if (error) throw error;

  const statusCounts = data?.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    data: data || [],
    summary: {
      totalRooms: data?.length || 0,
      ...statusCounts,
      vacantClean: statusCounts['Vacant Clean'] || 0,
      vacantDirty: statusCounts['Vacant Dirty'] || 0,
      occupiedClean: statusCounts['Occupied Clean'] || 0,
      occupiedDirty: statusCounts['Occupied Dirty'] || 0,
      outOfOrder: statusCounts['Out of Order'] || 0
    }
  };
}

/**
 * Occupancy Report - Daily occupancy statistics
 */
export async function getOccupancyReport(date: Date = new Date()) {
  const today = date.toISOString().split('T')[0];
  
  // Get total rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id, status');

  if (roomsError) throw roomsError;

  // Get checked-in reservations
  const { data: reservations, error: resError } = await supabase
    .from('reservations')
    .select('id, room_type, total_amount, adults, children')
    .eq('status', 'CheckedIn');

  if (resError) throw resError;

  const totalRooms = rooms?.length || 0;
  const occupiedRooms = reservations?.length || 0;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Get room type breakdown
  const roomTypeBreakdown = reservations?.reduce((acc, res) => {
    acc[res.room_type] = (acc[res.room_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    data: reservations || [],
    summary: {
      date: today,
      totalRooms,
      occupiedRooms,
      vacantRooms: totalRooms - occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalAdults: reservations?.reduce((sum, r) => sum + r.adults, 0) || 0,
      totalChildren: reservations?.reduce((sum, r) => sum + r.children, 0) || 0,
      totalGuests: (reservations?.reduce((sum, r) => sum + r.adults, 0) || 0) + 
                   (reservations?.reduce((sum, r) => sum + r.children, 0) || 0),
      roomRevenue: reservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0,
      roomTypeBreakdown
    }
  };
}

/**
 * Room Rack Report - Room rack overview
 */
export async function getRoomRackReport() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      id,
      number,
      type,
      floor,
      status,
      rate,
      features,
      reservations (
        id,
        guest_name,
        guest_status,
        check_in_date,
        check_out_date,
        status
      )
    `)
    .order('floor', { ascending: true })
    .order('number', { ascending: true });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalRooms: data?.length || 0,
      availableRooms: data?.filter(r => r.status === 'Vacant Clean').length || 0,
      occupiedRooms: data?.filter(r => r.status.startsWith('Occupied')).length || 0
    }
  };
}

// ============================================================================
// RESERVATION REPORTS
// ============================================================================

/**
 * Pickup Report - Reservation pickup analysis
 */
export async function getPickupReport(startDate: Date, endDate: Date) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      check_in_date,
      check_out_date,
      status,
      rate,
      total_amount,
      channel,
      created_at
    `)
    .gte('check_in_date', start)
    .lte('check_in_date', end)
    .order('check_in_date', { ascending: true });

  if (error) throw error;

  // Group by date
  const dailyPickup = data?.reduce((acc, res) => {
    const date = res.check_in_date;
    if (!acc[date]) {
      acc[date] = { count: 0, revenue: 0, rooms: {} };
    }
    acc[date].count += 1;
    acc[date].revenue += res.total_amount;
    acc[date].rooms[res.room_type] = (acc[date].rooms[res.room_type] || 0) + 1;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: Object.entries(dailyPickup).map(([date, stats]: [string, any]) => ({
      date,
      ...stats
    })),
    summary: {
      totalReservations: data?.length || 0,
      totalRevenue: data?.reduce((sum, r) => sum + r.total_amount, 0) || 0,
      averageRate: data?.length ? data.reduce((sum, r) => sum + r.rate, 0) / data.length : 0
    }
  };
}

/**
 * Cancellation Report - Cancellation statistics
 */
export async function getCancellationReport(startDate: Date, endDate: Date) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      check_in_date,
      check_out_date,
      status,
      total_amount,
      channel,
      created_at,
      updated_at
    `)
    .eq('status', 'Cancelled')
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by channel
  const byChannel = data?.reduce((acc, res) => {
    acc[res.channel] = (acc[res.channel] || { count: 0, revenue: 0 });
    acc[res.channel].count += 1;
    acc[res.channel].revenue += res.total_amount;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: data || [],
    summary: {
      totalCancellations: data?.length || 0,
      totalLostRevenue: data?.reduce((sum, r) => sum + r.total_amount, 0) || 0,
      cancellationRate: 0, // Would need total reservations for this
      byChannel
    }
  };
}

/**
 * No Show Report - No-show analysis
 */
export async function getNoShowReport(startDate: Date, endDate: Date) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  // For no-shows, we'll look for reservations that were confirmed but not checked in
  // and whose check-in date has passed
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      check_in_date,
      check_out_date,
      status,
      total_amount,
      channel,
      deposit_amount,
      is_deposit_paid
    `)
    .in('status', ['Confirmed', 'Waitlisted'])
    .lt('check_in_date', end)
    .order('check_in_date', { ascending: false });

  if (error) throw error;

  // Filter for potential no-shows (check-in date passed and not checked in)
  const noShows = data?.filter(res => {
    const checkInDate = new Date(res.check_in_date);
    const today = new Date();
    return checkInDate < today && res.status !== 'CheckedIn' && res.status !== 'CheckedOut';
  }) || [];

  return {
    data: noShows,
    summary: {
      totalNoShows: noShows.length,
      totalLostRevenue: noShows.reduce((sum, r) => sum + r.total_amount, 0),
      totalDepositsForfeited: noShows.reduce((sum, r) => sum + (r.is_deposit_paid ? r.deposit_amount : 0), 0)
    }
  };
}

/**
 * Forecast Report - Future occupancy forecast
 */
export async function getForecastReport(daysAhead: number = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      room_type,
      check_in_date,
      check_out_date,
      status,
      total_amount,
      adults,
      children
    `)
    .gte('check_in_date', startDate.toISOString().split('T')[0])
    .lte('check_in_date', endDate.toISOString().split('T')[0])
    .in('status', ['Confirmed', 'CheckedIn'])
    .order('check_in_date', { ascending: true });

  if (error) throw error;

  // Get total rooms for percentage calculations
  const { data: rooms } = await supabase.from('rooms').select('id');
  const totalRooms = rooms?.length || 0;

  // Group by date
  const dailyForecast = data?.reduce((acc, res) => {
    const date = res.check_in_date;
    if (!acc[date]) {
      acc[date] = { 
        reservations: 0, 
        roomNights: 0, 
        revenue: 0, 
        adults: 0, 
        children: 0,
        roomTypes: {}
      };
    }
    acc[date].reservations += 1;
    acc[date].revenue += res.total_amount;
    acc[date].adults += res.adults;
    acc[date].children += res.children;
    acc[date].roomTypes[res.room_type] = (acc[date].roomTypes[res.room_type] || 0) + 1;
    
    // Calculate room nights
    const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
    acc[date].roomNights += nights;
    
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: Object.entries(dailyForecast).map(([date, stats]: [string, any]) => ({
      date,
      ...stats,
      occupancyRate: totalRooms > 0 ? Math.round((stats.reservations / totalRooms) * 10000) / 100 : 0
    })),
    summary: {
      totalReservations: data?.length || 0,
      totalRoomNights: Object.values(dailyForecast).reduce((sum: number, day: any) => sum + day.roomNights, 0),
      totalRevenue: data?.reduce((sum, r) => sum + r.total_amount, 0) || 0,
      forecastPeriod: `${daysAhead} days`
    }
  };
}

/**
 * Group Report - Group booking summary
 */
export async function getGroupReport() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      check_in_date,
      check_out_date,
      status,
      total_amount,
      is_group,
      booking_group_id,
      group_bookings (
        id,
        group_name,
        contact_name,
        contact_email,
        room_count
      )
    `)
    .eq('is_group', true)
    .order('check_in_date', { ascending: true });

  if (error) throw error;

  // Group by booking group
  const groupSummary = data?.reduce((acc, res) => {
    const groupId = res.booking_group_id || 'ungrouped';
    if (!acc[groupId]) {
      acc[groupId] = {
        groupName: res.group_bookings?.[0]?.group_name || 'Ungrouped',
        contactName: res.group_bookings?.[0]?.contact_name,
        contactEmail: res.group_bookings?.[0]?.contact_email,
        reservations: [],
        totalRooms: 0,
        totalRevenue: 0
      };
    }
    acc[groupId].reservations.push(res);
    acc[groupId].totalRooms += 1;
    acc[groupId].totalRevenue += res.total_amount;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: Object.values(groupSummary),
    summary: {
      totalGroups: Object.keys(groupSummary).length,
      totalGroupReservations: data?.length || 0,
      totalGroupRevenue: data?.reduce((sum, r) => sum + r.total_amount, 0) || 0
    }
  };
}

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

/**
 * Guest Ledger - Guest account balances
 */
export async function getGuestLedgerReport() {
  const { data, error } = await supabase
    .from('folios')
    .select(`
      id,
      reservation_id,
      folio_type,
      status,
      balance,
      total_charges,
      total_payments,
      tax_total,
      service_charge_total,
      currency,
      opened_at,
      closed_at,
      reservations (
        id,
        guest_name,
        guest_email,
        room_number,
        check_in_date,
        check_out_date
      )
    `)
    .neq('balance', 0)
    .order('balance', { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalOutstanding: data?.reduce((sum, f) => sum + f.balance, 0) || 0,
      totalCharges: data?.reduce((sum, f) => sum + f.total_charges, 0) || 0,
      totalPayments: data?.reduce((sum, f) => sum + f.total_payments, 0) || 0,
      activeFolios: data?.filter(f => f.status === 'Open').length || 0
    }
  };
}

/**
 * Deposit Ledger - Deposit transactions
 */
export async function getDepositLedgerReport(startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      guest_email,
      room_type,
      check_in_date,
      check_out_date,
      deposit_amount,
      is_deposit_paid,
      total_amount,
      payment_status,
      status
    `)
    .gt('deposit_amount', 0);

  if (startDate) {
    query = query.gte('check_in_date', startDate.toISOString().split('T')[0]);
  }
  if (endDate) {
    query = query.lte('check_in_date', endDate.toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('check_in_date', { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalDeposits: data?.reduce((sum, r) => sum + r.deposit_amount, 0) || 0,
      paidDeposits: data?.reduce((sum, r) => sum + (r.is_deposit_paid ? r.deposit_amount : 0), 0) || 0,
      pendingDeposits: data?.reduce((sum, r) => sum + (!r.is_deposit_paid ? r.deposit_amount : 0), 0) || 0,
      depositCount: data?.length || 0
    }
  };
}

/**
 * Cashier Summary - Cashier shift summary
 */
export async function getCashierSummaryReport(cashierId?: string, date?: Date) {
  const today = date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
  
  let query = supabase
    .from('folio_payments')
    .select(`
      id,
      folio_id,
      payment_date,
      amount,
      payment_method,
      payment_sub_type,
      reference_number,
      cashier_id,
      shift_id,
      is_voided,
      is_refund,
      folios (
        id,
        reservation_id,
        reservations (
          id,
          guest_name,
          room_number
        )
      )
    `)
    .eq('is_voided', false)
    .gte('payment_date', `${today}T00:00:00`)
    .lte('payment_date', `${today}T23:59:59`);

  if (cashierId) {
    query = query.eq('cashier_id', cashierId);
  }

  const { data, error } = await query.order('payment_date', { ascending: true });

  if (error) throw error;

  // Group by payment method
  const byMethod = data?.reduce((acc, payment) => {
    const method = payment.payment_method;
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0, refunds: 0 };
    }
    acc[method].count += 1;
    if (payment.is_refund) {
      acc[method].refunds += payment.amount;
    } else {
      acc[method].total += payment.amount;
    }
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: data || [],
    summary: {
      totalTransactions: data?.length || 0,
      totalPayments: data?.reduce((sum, p) => p.is_refund ? sum : sum + p.amount, 0) || 0,
      totalRefunds: data?.reduce((sum, p) => p.is_refund ? sum + p.amount : sum, 0) || 0,
      netPayments: data?.reduce((sum, p) => p.is_refund ? sum - p.amount : sum + p.amount, 0) || 0,
      byMethod
    }
  };
}

/**
 * Shift Report - Shift financial summary
 */
export async function getShiftReport(shiftId: string) {
  const { data, error } = await supabase
    .from('folio_payments')
    .select(`
      id,
      folio_id,
      payment_date,
      amount,
      payment_method,
      cashier_id,
      shift_id,
      is_voided,
      is_refund,
      folios (
        id,
        folio_type,
        balance,
        total_charges
      )
    `)
    .eq('shift_id', shiftId)
    .eq('is_voided', false)
    .order('payment_date', { ascending: true });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      shiftId,
      totalPayments: data?.reduce((sum, p) => p.is_refund ? sum : sum + p.amount, 0) || 0,
      totalRefunds: data?.reduce((sum, p) => p.is_refund ? sum + p.amount : sum, 0) || 0,
      transactionCount: data?.length || 0,
      paymentMethods: data?.reduce((acc, p) => {
        acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };
}

/**
 * Folio Report - Folio transaction report
 */
export async function getFolioReport(reservationId?: string, startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('folio_lines')
    .select(`
      id,
      folio_id,
      line_number,
      transaction_date,
      posting_date,
      description,
      amount,
      quantity,
      unit_price,
      line_type,
      tax_amount,
      is_voided,
      created_by,
      folios (
        id,
        folio_type,
        status,
        balance,
        reservations (
          id,
          guest_name,
          room_number
        )
      )
    `)
    .eq('is_voided', false);

  if (startDate) {
    query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
  }
  if (endDate) {
    query = query.lte('transaction_date', endDate.toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('transaction_date', { ascending: false });

  if (error) throw error;

  // Filter by reservation if specified
  const filteredData = reservationId 
    ? data?.filter(line => line.folios?.reservations?.id === reservationId)
    : data;

  // Group by line type
  const byType = filteredData?.reduce((acc, line) => {
    acc[line.line_type] = (acc[line.line_type] || { count: 0, total: 0 });
    acc[line.line_type].count += 1;
    acc[line.line_type].total += line.amount;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: filteredData || [],
    summary: {
      totalTransactions: filteredData?.length || 0,
      totalAmount: filteredData?.reduce((sum, line) => sum + line.amount, 0) || 0,
      totalTax: filteredData?.reduce((sum, line) => sum + line.tax_amount, 0) || 0,
      byType
    }
  };
}

// ============================================================================
// OPERATIONAL REPORTS
// ============================================================================

/**
 * Room Move Report - Room move history
 */
export async function getRoomMoveReport(startDate?: Date, endDate?: Date) {
  // This would require a room_moves table or similar audit log
  // For now, we'll return a placeholder that could be enhanced
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_number,
      room_type,
      check_in_date,
      check_out_date,
      status,
      updated_at
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Filter for potential room moves (reservations with room changes)
  // This is a simplified approach - a proper implementation would need a room_moves table
  const potentialMoves = data?.filter(res => 
    res.room_number && res.status === 'CheckedIn'
  ) || [];

  return {
    data: potentialMoves,
    summary: {
      totalMoves: potentialMoves.length,
      // Additional metrics would require proper room move tracking
    }
  };
}

/**
 * Room Assignment Report - Room assignment analysis
 */
export async function getRoomAssignmentReport() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      room_number,
      check_in_date,
      check_out_date,
      status,
      rate,
      channel
    `)
    .in('status', ['Confirmed', 'CheckedIn'])
    .order('room_number', { ascending: true });

  if (error) throw error;

  // Analyze assignments
  const assigned = data?.filter(r => r.room_number) || [];
  const unassigned = data?.filter(r => !r.room_number) || [];

  // Room type utilization
  const byRoomType = data?.reduce((acc, res) => {
    acc[res.room_type] = (acc[res.room_type] || { assigned: 0, unassigned: 0 });
    if (res.room_number) {
      acc[res.room_type].assigned += 1;
    } else {
      acc[res.room_type].unassigned += 1;
    }
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    data: data || [],
    summary: {
      totalReservations: data?.length || 0,
      assignedRooms: assigned.length,
      unassignedRooms: unassigned.length,
      assignmentRate: data?.length ? Math.round((assigned.length / data.length) * 100) : 0,
      byRoomType
    }
  };
}

/**
 * Guest Balance Report - Outstanding balances
 */
export async function getGuestBalanceReport() {
  const { data, error } = await supabase
    .from('folios')
    .select(`
      id,
      reservation_id,
      folio_type,
      status,
      balance,
      total_charges,
      total_payments,
      currency,
      opened_at,
      reservations (
        id,
        guest_name,
        guest_email,
        room_number,
        check_in_date,
        check_out_date,
        status
      )
    `)
    .gt('balance', 0)
    .order('balance', { ascending: false });

  if (error) throw error;

  // Categorize by balance ranges
  const balanceRanges = {
    high: data?.filter(f => f.balance > 1000).length || 0,
    medium: data?.filter(f => f.balance > 100 && f.balance <= 1000).length || 0,
    low: data?.filter(f => f.balance > 0 && f.balance <= 100).length || 0
  };

  return {
    data: data || [],
    summary: {
      totalOutstandingBalance: data?.reduce((sum, f) => sum + f.balance, 0) || 0,
      totalGuestsWithBalance: data?.length || 0,
      averageBalance: data?.length ? data.reduce((sum, f) => sum + f.balance, 0) / data.length : 0,
      balanceRanges
    }
  };
}

/**
 * Long Stay Report - Extended stay guests
 */
export async function getLongStayReport(minNights: number = 7) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_name,
      room_type,
      room_number,
      check_in_date,
      check_out_date,
      adults,
      children,
      status,
      rate,
      total_amount,
      channel
    `)
    .in('status', ['Confirmed', 'CheckedIn'])
    .order('check_out_date', { ascending: false });

  if (error) throw error;

  // Calculate stay lengths and filter long stays
  const longStays = data?.filter(res => {
    const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
    return nights >= minNights;
  }).map(res => ({
    ...res,
    nights: Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
  })) || [];

  return {
    data: longStays,
    summary: {
      totalLongStays: longStays.length,
      totalLongStayNights: longStays.reduce((sum, stay) => sum + stay.nights, 0),
      totalLongStayRevenue: longStays.reduce((sum, stay) => sum + stay.total_amount, 0),
      averageLength: longStays.length ? longStays.reduce((sum, stay) => sum + stay.nights, 0) / longStays.length : 0
    }
  };
}

/**
 * Blacklisted Guests Report - Blacklist status report
 */
export async function getBlacklistedGuestsReport() {
  const { data, error } = await supabase
    .from('group_profiles')
    .select(`
      id,
      code,
      name,
      type,
      status,
      contact_name,
      contact_email,
      contact_phone,
      organization_name,
      notes,
      total_revenue,
      total_room_nights,
      created_at
    `)
    .eq('status', 'Blacklisted')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    summary: {
      totalBlacklisted: data?.length || 0,
      byType: data?.reduce((acc, profile) => {
        acc[profile.type] = (acc[profile.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };
}

/**
 * Lost & Found Report - Lost and found items
 */
export async function getLostFoundReport() {
  // This would require a lost_found table
  // For now, return empty data with proper structure
  return {
    data: [],
    summary: {
      totalItems: 0,
      resolvedItems: 0,
      pendingItems: 0
    },
    message: 'Lost & Found table needs to be implemented'
  };
}

/**
 * Concierge Activity Report - Concierge service log
 */
export async function getConciergeActivityReport(startDate?: Date, endDate?: Date) {
  // This would require a concierge_services or guest_services table
  // Let me check if guest_services exists
  const { data, error } = await supabase
    .from('guest_services')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return {
      data: [],
      summary: {
        totalServices: 0,
        byType: {}
      },
      message: 'Guest services data not available'
    };
  }

  return {
    data: data || [],
    summary: {
      totalServices: data?.length || 0,
      byType: data?.reduce((acc, service) => {
        acc[service.service_type || 'unknown'] = (acc[service.service_type || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };
}

/**
 * Transportation Report - Transportation services
 */
export async function getTransportationReport(startDate?: Date, endDate?: Date) {
  // Check for airport_shuttle_requests table
  const { data, error } = await supabase
    .from('airport_shuttle_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return {
      data: [],
      summary: {
        totalRequests: 0,
        completedTrips: 0,
        pendingTrips: 0
      },
      message: 'Transportation data not available'
    };
  }

  return {
    data: data || [],
    summary: {
      totalRequests: data?.length || 0,
      completedTrips: data?.filter((t: any) => t.status === 'completed').length || 0,
      pendingTrips: data?.filter((t: any) => t.status === 'pending').length || 0
    }
  };
}

// ============================================================================
// SCHEDULED REPORTS
// ============================================================================

/**
 * Get all scheduled reports
 */
export async function getScheduledReports(): Promise<ScheduledReport[]> {
  const { data, error } = await supabase
    .from('report_schedules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(report => ({
    id: report.id,
    reportName: report.report_name,
    frequency: report.frequency,
    recipients: report.recipients,
    status: report.status,
    nextRun: report.next_run,
    createdBy: report.created_by,
    createdAt: report.created_at
  })) || [];
}

/**
 * Create a scheduled report
 */
export async function createScheduledReport(schedule: Omit<ScheduledReport, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('report_schedules')
    .insert({
      report_name: schedule.reportName,
      frequency: schedule.frequency,
      recipients: schedule.recipients,
      status: schedule.status,
      next_run: schedule.nextRun,
      created_by: schedule.createdBy
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update a scheduled report
 */
export async function updateScheduledReport(id: string, updates: Partial<ScheduledReport>) {
  const { data, error } = await supabase
    .from('report_schedules')
    .update({
      report_name: updates.reportName,
      frequency: updates.frequency,
      recipients: updates.recipients,
      status: updates.status,
      next_run: updates.nextRun
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete a scheduled report
 */
export async function deleteScheduledReport(id: string) {
  const { error } = await supabase
    .from('report_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// REPORT EXECUTION HELPERS
// ============================================================================

/**
 * Execute a specific report by ID
 */
export async function executeReport(reportId: string, params?: any) {
  const reportFunctions: Record<string, any> = {
    'RPT-001': getArrivalReport,
    'RPT-002': getDepartureReport,
    'RPT-003': getInHouseGuestsReport,
    'RPT-004': getVipGuestsReport,
    'RPT-005': getHouseStatusReport,
    'RPT-006': getOccupancyReport,
    'RPT-007': getRoomRackReport,
    'RPT-008': getPickupReport,
    'RPT-009': getCancellationReport,
    'RPT-010': getNoShowReport,
    'RPT-011': getForecastReport,
    'RPT-012': getGroupReport,
    'RPT-013': getGuestLedgerReport,
    'RPT-014': getDepositLedgerReport,
    'RPT-015': getCashierSummaryReport,
    'RPT-016': getShiftReport,
    'RPT-017': getFolioReport,
    'RPT-018': getRoomMoveReport,
    'RPT-019': getRoomAssignmentReport,
    'RPT-020': getGuestBalanceReport,
    'RPT-021': getLongStayReport,
    'RPT-022': getBlacklistedGuestsReport,
    'RPT-023': getLostFoundReport,
    'RPT-024': getConciergeActivityReport,
    'RPT-025': getTransportationReport
  };

  const reportFunction = reportFunctions[reportId];
  if (!reportFunction) {
    throw new Error(`Report with ID ${reportId} not found`);
  }

  return await reportFunction(params?.date, params?.startDate, params?.endDate, params?.other);
}