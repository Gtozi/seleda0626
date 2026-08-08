/**
 * Front Office Reports Module
 * Simplified version to debug import issues
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileBarChart,
  Calendar,
  Users,
  DollarSign,
  BedDouble,
  TrendingUp,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Clock,
  Activity,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import StatCard from '../StatCard';

type ReportCategory = 'daily' | 'reservation' | 'financial' | 'operational';

interface Report {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  icon: any;
}

// Renders a cell value as readable text. Nested objects (e.g. {date, amount, description})
// are flattened to "key: value" pairs joined by newlines instead of raw JSON.
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v === null || v === undefined ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join('\n');
  }
  return String(value);
};

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') as ReportCategory) || 'daily';
  const setActiveCategory = (cat: ReportCategory) => {
    const next = new URLSearchParams(searchParams);
    next.set('category', cat);
    setSearchParams(next);
  };
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const reports: Report[] = [
    // Daily Reports
    { id: 'RPT-001', name: 'Arrival Report', category: 'daily', description: 'Today\'s expected arrivals', icon: Users },
    { id: 'RPT-002', name: 'Departure Report', category: 'daily', description: 'Today\'s expected departures', icon: Users },
    { id: 'RPT-003', name: 'In-House Guests', category: 'daily', description: 'Current in-house guest list', icon: BedDouble },
    { id: 'RPT-004', name: 'VIP Guests', category: 'daily', description: 'VIP guest summary', icon: Users },
    { id: 'RPT-005', name: 'House Status', category: 'daily', description: 'Room housekeeping status', icon: BedDouble },
    { id: 'RPT-006', name: 'Occupancy Report', category: 'daily', description: 'Daily occupancy statistics', icon: TrendingUp },
    { id: 'RPT-007', name: 'Room Rack Report', category: 'daily', description: 'Room rack overview', icon: BedDouble },
    
    // Reservation Reports
    { id: 'RPT-008', name: 'Pickup Report', category: 'reservation', description: 'Reservation pickup analysis', icon: TrendingUp },
    { id: 'RPT-009', name: 'Cancellation Report', category: 'reservation', description: 'Cancellation statistics', icon: Users },
    { id: 'RPT-010', name: 'No Show Report', category: 'reservation', description: 'No-show analysis', icon: Users },
    { id: 'RPT-011', name: 'Forecast Report', category: 'reservation', description: 'Future occupancy forecast', icon: Calendar },
    { id: 'RPT-012', name: 'Group Report', category: 'reservation', description: 'Group booking summary', icon: Users },
    
    // Financial Reports
    { id: 'RPT-013', name: 'Guest Ledger', category: 'financial', description: 'Guest account balances', icon: DollarSign },
    { id: 'RPT-014', name: 'Deposit Ledger', category: 'financial', description: 'Deposit transactions', icon: DollarSign },
    { id: 'RPT-015', name: 'Cashier Summary', category: 'financial', description: 'Cashier shift summary', icon: DollarSign },
    { id: 'RPT-016', name: 'Shift Report', category: 'financial', description: 'Shift financial summary', icon: Clock },
    { id: 'RPT-017', name: 'Folio Report', category: 'financial', description: 'Folio transaction report', icon: FileText },
    
    // Operational Reports
    { id: 'RPT-018', name: 'Room Move Report', category: 'operational', description: 'Room move history', icon: BedDouble },
    { id: 'RPT-019', name: 'Room Assignment Report', category: 'operational', description: 'Room assignment analysis', icon: BedDouble },
    { id: 'RPT-020', name: 'Guest Balance Report', category: 'operational', description: 'Outstanding balances', icon: DollarSign },
    { id: 'RPT-021', name: 'Long Stay Report', category: 'operational', description: 'Extended stay guests', icon: Clock },
    { id: 'RPT-022', name: 'Blacklisted Guests', category: 'operational', description: 'Blacklist status report', icon: Users },
    { id: 'RPT-023', name: 'Lost & Found Report', category: 'operational', description: 'Lost and found items', icon: Users },
    { id: 'RPT-024', name: 'Concierge Activity', category: 'operational', description: 'Concierge service log', icon: Activity },
    { id: 'RPT-025', name: 'Transportation Report', category: 'operational', description: 'Transportation services', icon: Activity },
  ];

  const categories = [
    { id: 'daily', label: 'Daily Reports', icon: Calendar },
    { id: 'reservation', label: 'Reservation Reports', icon: FileText },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign },
    { id: 'operational', label: 'Operational Reports', icon: Activity },
  ];

  const filteredReports = reports.filter(report => report.category === activeCategory);

  // Real database query functions
  const getArrivalReport = async (date: Date = new Date()) => {
    const today = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('check_in_date', today)
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return {
      summary: {
        totalArrivals: data?.length || 0,
        totalRooms: data?.length || 0,
        totalAdults: data?.reduce((sum, r) => sum + (r.adults || 0), 0) || 0,
        totalChildren: data?.reduce((sum, r) => sum + (r.children || 0), 0) || 0,
        expectedRevenue: data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      },
      data: data || []
    };
  };

  const getDepartureReport = async (date: Date = new Date()) => {
    const today = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('check_out_date', today)
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('check_out_date', { ascending: true });

    if (error) throw error;

    return {
      summary: {
        totalDepartures: data?.length || 0,
        totalRooms: data?.length || 0,
        outstandingBalance: data?.reduce((sum, r) => 
          (r.payment_status === 'Unpaid' || r.payment_status === 'Partial') ? sum + (r.total_amount || 0) : sum, 0) || 0
      },
      data: data || []
    };
  };

  const getInHouseGuestsReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', 'CheckedIn')
      .order('room_number', { ascending: true });

    if (error) throw error;

    return {
      summary: {
        totalInHouse: data?.length || 0,
        totalRooms: data?.length || 0,
        totalAdults: data?.reduce((sum, r) => sum + (r.adults || 0), 0) || 0,
        totalChildren: data?.reduce((sum, r) => sum + (r.children || 0), 0) || 0
      },
      data: data || []
    };
  };

  const getOccupancyReport = async (date: Date = new Date()) => {
    const today = date.toISOString().split('T')[0];
    
    // Get total rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id');

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

    return {
      summary: {
        date: today,
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalAdults: reservations?.reduce((sum, r) => sum + (r.adults || 0), 0) || 0,
        totalChildren: reservations?.reduce((sum, r) => sum + (r.children || 0), 0) || 0,
        roomRevenue: reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      },
      data: reservations || []
    };
  };

  const getHouseStatusReport = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('floor', { ascending: true })
      .order('number', { ascending: true });

    if (error) throw error;

    const statusCounts = data?.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      summary: {
        totalRooms: data?.length || 0,
        ...statusCounts,
        vacantClean: statusCounts['Vacant Clean'] || 0,
        vacantDirty: statusCounts['Vacant Dirty'] || 0,
        occupiedClean: statusCounts['Occupied Clean'] || 0,
        occupiedDirty: statusCounts['Occupied Dirty'] || 0,
        outOfOrder: statusCounts['Out of Order'] || 0
      },
      data: data || []
    };
  };

  const getGuestLedgerReport = async () => {
    const { data, error } = await supabase
      .from('folios')
      .select(`
        *,
        reservations (
          id,
          guest_name,
          room_number
        )
      `)
      .neq('balance', 0)
      .order('balance', { ascending: false });

    if (error) throw error;

    return {
      summary: {
        totalOutstanding: data?.reduce((sum, f) => sum + (f.balance || 0), 0) || 0,
        totalCharges: data?.reduce((sum, f) => sum + (f.total_charges || 0), 0) || 0,
        totalPayments: data?.reduce((sum, f) => sum + (f.total_payments || 0), 0) || 0,
        activeFolios: data?.filter(f => f.status === 'Open').length || 0
      },
      data: data || []
    };
  };

  const getFolioReport = async () => {
    const { data, error } = await supabase
      .from('folio_lines')
      .select(`
        *,
        folios (
          id,
          reservations (
            id,
            guest_name,
            room_number
          )
        )
      `)
      .eq('is_voided', false)
      .order('transaction_date', { ascending: false })
      .limit(100);

    if (error) throw error;

    const byType = data?.reduce((acc, line) => {
      acc[line.line_type] = (acc[line.line_type] || { count: 0, total: 0 });
      acc[line.line_type].count += 1;
      acc[line.line_type].total += line.amount || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalTransactions: data?.length || 0,
        totalAmount: data?.reduce((sum, line) => sum + (line.amount || 0), 0) || 0,
        totalTax: data?.reduce((sum, line) => sum + (line.tax_amount || 0), 0) || 0,
        byType
      },
      data: data || []
    };
  };

  const getVipGuestsReport = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
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
      summary: {
        totalVipGuests: data?.length || 0,
        totalSpend: data?.reduce((sum, g) => sum + (g.total_spend || 0), 0) || 0,
        averageSpend: data?.length ? (data.reduce((sum, g) => sum + (g.total_spend || 0), 0) / data.length) : 0,
        currentStays: data?.reduce((sum, g) => 
          sum + (g.reservations?.filter((r: any) => r.status === 'CheckedIn').length || 0), 0) || 0
      },
      data: data || []
    };
  };

  const getRoomRackReport = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
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

    return {
      summary: {
        totalRooms: data?.length || 0,
        availableRooms: data?.filter(r => r.status === 'Vacant Clean').length || 0,
        occupiedRooms: data?.filter(r => r.status.startsWith('Occupied')).length || 0
      },
      data: data || []
    };
  };

  const getPickupReport = async (startDate: Date, endDate: Date) => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('check_in_date', start)
      .lte('check_in_date', end)
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    const dailyPickup = data?.reduce((acc, res) => {
      const date = res.check_in_date;
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += res.total_amount || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalReservations: data?.length || 0,
        totalRevenue: data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
        averageRate: data?.length ? data.reduce((sum, r) => sum + (r.rate || 0), 0) / data.length : 0
      },
      data: Object.entries(dailyPickup).map(([date, stats]: [string, any]) => ({
        date,
        ...stats
      }))
    };
  };

  const getCancellationReport = async (startDate: Date, endDate: Date) => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', 'Cancelled')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const byChannel = data?.reduce((acc, res) => {
      acc[res.channel] = (acc[res.channel] || { count: 0, revenue: 0 });
      acc[res.channel].count += 1;
      acc[res.channel].revenue += res.total_amount || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalCancellations: data?.length || 0,
        totalLostRevenue: data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
        byChannel
      },
      data: data || []
    };
  };

  const getNoShowReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['Confirmed', 'Waitlisted'])
      .lt('check_in_date', today)
      .order('check_in_date', { ascending: false });

    if (error) throw error;

    const noShows = data?.filter(res => {
      const checkInDate = new Date(res.check_in_date);
      return checkInDate < new Date() && res.status !== 'CheckedIn' && res.status !== 'CheckedOut';
    }) || [];

    return {
      summary: {
        totalNoShows: noShows.length,
        totalLostRevenue: noShows.reduce((sum, r) => sum + (r.total_amount || 0), 0),
        totalDepositsForfeited: noShows.reduce((sum, r) => sum + (r.is_deposit_paid ? r.deposit_amount || 0 : 0), 0)
      },
      data: noShows
    };
  };

  const getForecastReport = async (daysAhead: number = 30) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('check_in_date', startDate.toISOString().split('T')[0])
      .lte('check_in_date', endDate.toISOString().split('T')[0])
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    const { data: rooms } = await supabase.from('rooms').select('id');
    const totalRooms = rooms?.length || 0;

    const dailyForecast = data?.reduce((acc, res) => {
      const date = res.check_in_date;
      if (!acc[date]) {
        acc[date] = { reservations: 0, revenue: 0, adults: 0, children: 0 };
      }
      acc[date].reservations += 1;
      acc[date].revenue += res.total_amount || 0;
      acc[date].adults += res.adults || 0;
      acc[date].children += res.children || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalReservations: data?.length || 0,
        totalRevenue: data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
        forecastPeriod: `${daysAhead} days`
      },
      data: Object.entries(dailyForecast).map(([date, stats]: [string, any]) => ({
        date,
        ...stats,
        occupancyRate: totalRooms > 0 ? Math.round((stats.reservations / totalRooms) * 10000) / 100 : 0
      }))
    };
  };

  const getGroupReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('is_group', true)
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    const groupSummary = data?.reduce((acc, res) => {
      const groupId = res.booking_group_id || 'ungrouped';
      if (!acc[groupId]) {
        acc[groupId] = {
          groupName: res.booking_group_id || 'Ungrouped',
          reservations: [],
          totalRooms: 0,
          totalRevenue: 0
        };
      }
      acc[groupId].reservations.push(res);
      acc[groupId].totalRooms += 1;
      acc[groupId].totalRevenue += res.total_amount || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalGroups: Object.keys(groupSummary).length,
        totalGroupReservations: data?.length || 0,
        totalGroupRevenue: data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      },
      data: Object.values(groupSummary)
    };
  };

  const getDepositLedgerReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gt('deposit_amount', 0)
      .order('check_in_date', { ascending: false });

    if (error) throw error;

    return {
      summary: {
        totalDeposits: data?.reduce((sum, r) => sum + (r.deposit_amount || 0), 0) || 0,
        paidDeposits: data?.reduce((sum, r) => sum + (r.is_deposit_paid ? r.deposit_amount || 0 : 0), 0) || 0,
        pendingDeposits: data?.reduce((sum, r) => sum + (!r.is_deposit_paid ? r.deposit_amount || 0 : 0), 0) || 0,
        depositCount: data?.length || 0
      },
      data: data || []
    };
  };

  const getCashierSummaryReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('folio_payments')
      .select(`
        *,
        folios (
          id,
          reservations (
            id,
            guest_name,
            room_number
          )
        )
      `)
      .eq('is_voided', false)
      .gte('payment_date', `${today}T00:00:00`)
      .lte('payment_date', `${today}T23:59:59`)
      .order('payment_date', { ascending: true });

    if (error) throw error;

    const byMethod = data?.reduce((acc, payment) => {
      const method = payment.payment_method;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0, refunds: 0 };
      }
      acc[method].count += 1;
      if (payment.is_refund) {
        acc[method].refunds += payment.amount || 0;
      } else {
        acc[method].total += payment.amount || 0;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    return {
      summary: {
        totalTransactions: data?.length || 0,
        totalPayments: data?.reduce((sum, p) => p.is_refund ? sum : sum + (p.amount || 0), 0) || 0,
        totalRefunds: data?.reduce((sum, p) => p.is_refund ? sum + (p.amount || 0) : sum, 0) || 0,
        netPayments: data?.reduce((sum, p) => p.is_refund ? sum - (p.amount || 0) : sum + (p.amount || 0), 0) || 0,
        byMethod
      },
      data: data || []
    };
  };

  const getShiftReport = async () => {
    const { data, error } = await supabase
      .from('folio_payments')
      .select(`
        *,
        folios (
          id,
          folio_type,
          balance,
          total_charges
        )
      `)
      .eq('is_voided', false)
      .order('payment_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    return {
      summary: {
        totalPayments: data?.reduce((sum, p) => p.is_refund ? sum : sum + (p.amount || 0), 0) || 0,
        totalRefunds: data?.reduce((sum, p) => p.is_refund ? sum + (p.amount || 0) : sum, 0) || 0,
        transactionCount: data?.length || 0,
        paymentMethods: data?.reduce((acc, p) => {
          acc[p.payment_method] = (acc[p.payment_method] || 0) + (p.amount || 0);
          return acc;
        }, {} as Record<string, number>) || {}
      },
      data: data || []
    };
  };

  const getRoomMoveReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', 'CheckedIn')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return {
      summary: {
        totalMoves: data?.length || 0
      },
      data: data?.map(res => ({
        ...res,
        currentRoom: res.room_number,
        lastUpdated: res.updated_at
      })) || []
    };
  };

  const getRoomAssignmentReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('room_number', { ascending: true });

    if (error) throw error;

    const assigned = data?.filter(r => r.room_number) || [];
    const unassigned = data?.filter(r => !r.room_number) || [];

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
      summary: {
        totalReservations: data?.length || 0,
        assignedRooms: assigned.length,
        unassignedRooms: unassigned.length,
        assignmentRate: data?.length ? Math.round((assigned.length / data.length) * 100) : 0,
        byRoomType
      },
      data: data || []
    };
  };

  const getGuestBalanceReport = async () => {
    const { data, error } = await supabase
      .from('folios')
      .select(`
        *,
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

    const balanceRanges = {
      high: data?.filter(f => (f.balance || 0) > 1000).length || 0,
      medium: data?.filter(f => (f.balance || 0) > 100 && (f.balance || 0) <= 1000).length || 0,
      low: data?.filter(f => (f.balance || 0) > 0 && (f.balance || 0) <= 100).length || 0
    };

    return {
      summary: {
        totalOutstandingBalance: data?.reduce((sum, f) => sum + (f.balance || 0), 0) || 0,
        totalGuestsWithBalance: data?.length || 0,
        averageBalance: data?.length ? data.reduce((sum, f) => sum + (f.balance || 0), 0) / data.length : 0,
        balanceRanges
      },
      data: data || []
    };
  };

  const getLongStayReport = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('check_out_date', { ascending: false });

    if (error) throw error;

    const minNights = 7;
    const longStays = data?.filter(res => {
      const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
      return nights >= minNights;
    }).map(res => ({
      ...res,
      nights: Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
    })) || [];

    return {
      summary: {
        totalLongStays: longStays.length,
        totalLongStayNights: longStays.reduce((sum, stay) => sum + stay.nights, 0),
        totalLongStayRevenue: longStays.reduce((sum, stay) => sum + (stay.total_amount || 0), 0),
        averageLength: longStays.length ? longStays.reduce((sum, stay) => sum + stay.nights, 0) / longStays.length : 0
      },
      data: longStays
    };
  };

  const getBlacklistedGuestsReport = async () => {
    const { data, error } = await supabase
      .from('group_profiles')
      .select('*')
      .eq('status', 'Blacklisted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      summary: {
        totalBlacklisted: data?.length || 0,
        byType: data?.reduce((acc, profile) => {
          acc[profile.type] = (acc[profile.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      },
      data: data || []
    };
  };

  const getLostFoundReport = async () => {
    const { data, error } = await supabase
      .from('lost_found')
      .select(`
        *,
        guests (
          id,
          name,
          email,
          phone
        ),
        reservations (
          id,
          guest_name,
          room_number
        )
      `)
      .order('found_date', { ascending: false })
      .order('found_time', { ascending: false });

    if (error) throw error;

    const statusCounts = data?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      summary: {
        totalItems: data?.length || 0,
        activeItems: data?.filter(item => item.status === 'Found').length || 0,
        claimedItems: data?.filter(item => item.status === 'Claimed').length || 0,
        resolvedItems: data?.filter(item => ['Donated', 'Disposed', 'Returned to Owner'].includes(item.status)).length || 0,
        totalValue: data?.reduce((sum, item) => sum + (item.estimated_value || 0), 0) || 0,
        itemsThisWeek: data?.filter(item => {
          const itemDate = new Date(item.found_date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return itemDate >= weekAgo;
        }).length || 0,
        byCategory: data?.reduce((acc, item) => {
          acc[item.item_category] = (acc[item.item_category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byStatus: statusCounts
      },
      data: data || []
    };
  };

  const getConciergeActivityReport = async () => {
    const { data, error } = await supabase
      .from('guest_services')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return {
        summary: {
          totalServices: 0,
          byType: {}
        },
        data: [],
        message: 'Guest services data not available'
      };
    }

    return {
      summary: {
        totalServices: data?.length || 0,
        byType: data?.reduce((acc, service) => {
          acc[service.service_type || 'unknown'] = (acc[service.service_type || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      },
      data: data || []
    };
  };

  const getTransportationReport = async () => {
    const { data, error } = await supabase
      .from('airport_shuttle_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return {
        summary: {
          totalRequests: 0,
          completedTrips: 0,
          pendingTrips: 0
        },
        data: [],
        message: 'Transportation data not available'
      };
    }

    return {
      summary: {
        totalRequests: data?.length || 0,
        completedTrips: data?.filter((t: any) => t.status === 'completed').length || 0,
        pendingTrips: data?.filter((t: any) => t.status === 'pending').length || 0
      },
      data: data || []
    };
  };

  const handleGenerateReport = async (report: Report) => {
    setIsLoading(true);
    setSelectedReport(report);
    
    try {
      let result;
      
      switch(report.id) {
        case 'RPT-001': // Arrival Report
          result = await getArrivalReport();
          break;
        case 'RPT-002': // Departure Report
          result = await getDepartureReport();
          break;
        case 'RPT-003': // In-House Guests
          result = await getInHouseGuestsReport();
          break;
        case 'RPT-004': // VIP Guests
          result = await getVipGuestsReport();
          break;
        case 'RPT-005': // House Status
          result = await getHouseStatusReport();
          break;
        case 'RPT-006': // Occupancy Report
          result = await getOccupancyReport();
          break;
        case 'RPT-007': // Room Rack Report
          result = await getRoomRackReport();
          break;
        case 'RPT-008': // Pickup Report
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          result = await getPickupReport(startDate, endDate);
          break;
        case 'RPT-009': // Cancellation Report
          const cancelEnd = new Date();
          const cancelStart = new Date();
          cancelStart.setDate(cancelStart.getDate() - 30);
          result = await getCancellationReport(cancelStart, cancelEnd);
          break;
        case 'RPT-010': // No Show Report
          result = await getNoShowReport();
          break;
        case 'RPT-011': // Forecast Report
          result = await getForecastReport(30);
          break;
        case 'RPT-012': // Group Report
          result = await getGroupReport();
          break;
        case 'RPT-013': // Guest Ledger
          result = await getGuestLedgerReport();
          break;
        case 'RPT-014': // Deposit Ledger
          result = await getDepositLedgerReport();
          break;
        case 'RPT-015': // Cashier Summary
          result = await getCashierSummaryReport();
          break;
        case 'RPT-016': // Shift Report
          result = await getShiftReport();
          break;
        case 'RPT-017': // Folio Report
          result = await getFolioReport();
          break;
        case 'RPT-018': // Room Move Report
          result = await getRoomMoveReport();
          break;
        case 'RPT-019': // Room Assignment Report
          result = await getRoomAssignmentReport();
          break;
        case 'RPT-020': // Guest Balance Report
          result = await getGuestBalanceReport();
          break;
        case 'RPT-021': // Long Stay Report
          result = await getLongStayReport();
          break;
        case 'RPT-022': // Blacklisted Guests
          result = await getBlacklistedGuestsReport();
          break;
        case 'RPT-023': // Lost & Found Report
          result = await getLostFoundReport();
          break;
        case 'RPT-024': // Concierge Activity
          result = await getConciergeActivityReport();
          break;
        case 'RPT-025': // Transportation Report
          result = await getTransportationReport();
          break;
        default:
          result = {
            summary: { message: 'Report data will be available soon' },
            data: [],
            message: `${report.name} is coming soon. Database integration in progress.`
          };
      }
      
      setReportData(result);
      setShowReportModal(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportData({
        summary: { error: 'Failed to generate report' },
        data: [],
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setShowReportModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData || !selectedReport) return;
    
    const csv = [
      Object.keys(reportData.data[0]).join(','),
      ...reportData.data.map((row: any) => Object.values(row).map((v: any) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') {
          return Object.entries(v)
            .map(([k, val]) => `${k}: ${val === null || val === undefined ? '-' : typeof val === 'object' ? JSON.stringify(val) : String(val)}`)
            .join('; ');
        }
        return String(v);
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    if (!reportData || !selectedReport) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>${selectedReport.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${selectedReport.name}</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <h2>Summary</h2>
          <pre>${JSON.stringify(reportData.summary, null, 2)}</pre>
          <table>
            <thead>
              <tr>
                ${Object.keys(reportData.data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${reportData.data.map((row: any) => `
                <tr>
                  ${Object.values(row).map((val: any) => {
                    let cell: string;
                    if (val === null || val === undefined) cell = '';
                    else if (typeof val === 'object') {
                      cell = Object.entries(val)
                        .map(([k, v]) => `${k}: ${v === null || v === undefined ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                        .join('<br>');
                    } else cell = String(val);
                    return `<td>${cell}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Daily, reservation, financial, and operational reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as ReportCategory)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeCategory === category.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                {reports.filter(r => r.category === category.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">
                  Live Data
                </span>
              </div>
              <button 
                onClick={() => handleGenerateReport(report)}
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {isLoading && selectedReport?.id === report.id ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value="25" icon={FileBarChart} variant="primary" />
        <StatCard label="Daily Reports" value="7" icon={Calendar} variant="primary" />
        <StatCard label="Financial Reports" value="5" icon={DollarSign} variant="revenue" />
        <StatCard label="Operational Reports" value="8" icon={Activity} variant="rooms" />
      </div>

      {/* Report Data Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedReport.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generated: {new Date().toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {reportData?.summary && !reportData.summary.error && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.summary)
                      .filter(([key]) => key !== 'message' && key !== 'error')
                      .map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData?.summary?.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">Error</h3>
                  <p className="text-red-700 dark:text-red-300">{reportData.summary.error}</p>
                </div>
              )}

              {reportData?.data && reportData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        {Object.keys(reportData.data[0]).map((key) => (
                          <th key={key} className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/30">
                          {Object.values(row).map((value: any, cellIndex: number) => (
                            <td key={cellIndex} className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
                              {formatCellValue(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  {reportData?.message ? (
                    <div className="text-gray-500 dark:text-gray-400">
                      {reportData.message}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      No data available for this report
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button 
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;