/**
 * Executive Dashboard Module
 * Core strategic KPIs for executive decision-making
 */

import { useMemo } from 'react';
import {
  Bed,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Utensils,
  Briefcase,
  Wrench,
  ShoppingCart,
  BarChart3,
  Activity,
  Clock,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { useERP } from '../../../../context/ERPContext';

interface KPICard {
  id: string;
  name: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  sourceModule: string;
  icon: any;
  color: string;
}

const ExecutiveDashboard = () => {
  const {
    rooms,
    reservations,
    salesTransactions,
    currentSystemDate,
    expenseRequests,
    groupBookings,
    formatAmount
  } = useERP();

  const kpis = useMemo(() => {
    const today = currentSystemDate;
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Occupancy Rate
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;

    // ADR - Average Daily Rate
    const todayRoomRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && t.module === 'Front Desk Folio')
      .reduce((sum, t) => sum + t.total, 0);
    const adr = todayReservations.length > 0
      ? Math.round(todayRoomRevenue / todayReservations.length)
      : 0;

    // RevPAR
    const revpar = rooms.length > 0
      ? Math.round(todayRoomRevenue / rooms.length)
      : 0;

    // TrevPAR - Total Revenue Per Available Room
    const totalRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const trevpar = rooms.length > 0
      ? Math.round(totalRevenue / rooms.length)
      : 0;

    // GOPPAR - Gross Operating Profit Per Available Room
    const operatingExpenses = totalRevenue * 0.3; // Placeholder
    const gop = totalRevenue - operatingExpenses;
    const goppar = rooms.length > 0
      ? Math.round(gop / rooms.length)
      : 0;

    // Room Revenue
    const roomRevenue = todayRoomRevenue;

    // F&B Revenue
    const fbRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && 
        (t.module === 'F&B POS' || t.module === 'Restaurant POS' || t.module === 'Bar POS'))
      .reduce((sum, t) => sum + t.total, 0);

    // Other Revenue
    const otherRevenue = totalRevenue - roomRevenue - fbRevenue;

    // Gross Operating Profit
    const grossOperatingProfit = gop;

    // Net Profit
    const fixedCharges = totalRevenue * 0.15; // Placeholder
    const netProfit = grossOperatingProfit - fixedCharges;

    // Cash Position
    const cashPosition = totalRevenue * 0.8; // Placeholder

    // Forecast Occupancy (next 7 days)
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 7);
    const futureReservations = reservations.filter(r =>
      r.checkInDate <= futureDate && r.checkOutDate > futureDate
    );
    const forecastOccupancy = rooms.length > 0
      ? Math.round((futureReservations.length / rooms.length) * 100)
      : 0;

    // Guest Satisfaction (placeholder)
    const guestSatisfaction = 4.2; // out of 5

    // Employee Satisfaction (placeholder)
    const employeeSatisfaction = 3.8; // out of 5

    // Pending Approvals
    const pendingApprovals = expenseRequests.filter(e => e.status === 'Under Review').length;

    // Critical Alerts
    const criticalAlerts = occupancyRate < 50 ? 1 : 0;

    // VIP Guests (placeholder)
    const vipGuests = todayReservations.filter(r => r.guestName?.toLowerCase().includes('vip')).length;

    // Current Groups
    const currentGroups = groupBookings.filter(g => {
      const todayRes = reservations.filter(r => r.groupBookingId === g.id && 
        r.checkInDate <= today && r.checkOutDate > today);
      return todayRes.length > 0;
    }).length;

    // Daily Revenue
    const dailyRevenue = totalRevenue;

    // Daily Expenses
    const dailyExpenses = operatingExpenses;

    return [
      {
        id: 'occupancy',
        name: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        trend: occupancyRate > 70 ? '+12%' : occupancyRate > 50 ? '+5%' : '-8%',
        trendDirection: occupancyRate > 70 ? 'up' : occupancyRate > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: Bed,
        color: 'indigo'
      },
      {
        id: 'adr',
        name: 'Average Daily Rate',
        value: formatAmount(adr),
        trend: adr > 120 ? '+8%' : adr > 80 ? '+3%' : '-5%',
        trendDirection: adr > 120 ? 'up' : adr > 80 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        id: 'revpar',
        name: 'RevPAR',
        value: formatAmount(revpar),
        trend: revpar > 80 ? '+10%' : revpar > 50 ? '+4%' : '-6%',
        trendDirection: revpar > 80 ? 'up' : revpar > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: TrendingUp,
        color: 'blue'
      },
      {
        id: 'trevpar',
        name: 'TrevPAR',
        value: formatAmount(trevpar),
        trend: '+7%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: BarChart3,
        color: 'purple'
      },
      {
        id: 'goppar',
        name: 'GOPPAR',
        value: formatAmount(goppar),
        trend: '+8%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: Activity,
        color: 'teal'
      },
      {
        id: 'room_revenue',
        name: 'Room Revenue',
        value: formatAmount(roomRevenue),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'Front Office',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        id: 'fb_revenue',
        name: 'F&B Revenue',
        value: formatAmount(fbRevenue),
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'F&B',
        icon: Utensils,
        color: 'orange'
      },
      {
        id: 'other_revenue',
        name: 'Other Revenue',
        value: formatAmount(otherRevenue),
        trend: '+3%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: ShoppingCart,
        color: 'cyan'
      },
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: formatAmount(totalRevenue),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        id: 'gop',
        name: 'Gross Operating Profit',
        value: formatAmount(grossOperatingProfit),
        trend: '+10%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: TrendingUp,
        color: 'purple'
      },
      {
        id: 'net_profit',
        name: 'Net Profit',
        value: formatAmount(netProfit),
        trend: '+9%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: Target,
        color: 'emerald'
      },
      {
        id: 'cash_position',
        name: 'Cash Position',
        value: formatAmount(cashPosition),
        trend: '+15%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: CreditCard,
        color: 'teal'
      },
      {
        id: 'forecast_occupancy',
        name: 'Forecast Occupancy (7d)',
        value: `${forecastOccupancy}%`,
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'Front Office',
        icon: Bed,
        color: 'indigo'
      },
      {
        id: 'guest_satisfaction',
        name: 'Guest Satisfaction',
        value: `${guestSatisfaction}/5`,
        trend: '+0.2',
        trendDirection: 'up',
        sourceModule: 'Front Office',
        icon: Users,
        color: 'amber'
      },
      {
        id: 'employee_satisfaction',
        name: 'Employee Satisfaction',
        value: `${employeeSatisfaction}/5`,
        trend: '-0.1',
        trendDirection: 'down',
        sourceModule: 'HR',
        icon: Briefcase,
        color: 'rose'
      },
      {
        id: 'pending_approvals',
        name: 'Pending Approvals',
        value: pendingApprovals.toString(),
        trend: '0',
        trendDirection: 'neutral',
        sourceModule: 'All Departments',
        icon: Clock,
        color: 'amber'
      },
      {
        id: 'critical_alerts',
        name: 'Critical Alerts',
        value: criticalAlerts.toString(),
        trend: criticalAlerts > 0 ? '+1' : '0',
        trendDirection: criticalAlerts > 0 ? 'up' : 'neutral',
        sourceModule: 'All Departments',
        icon: AlertTriangle,
        color: 'rose'
      },
      {
        id: 'vip_guests',
        name: 'VIP Guests',
        value: vipGuests.toString(),
        trend: '0',
        trendDirection: 'neutral',
        sourceModule: 'Front Office',
        icon: Users,
        color: 'purple'
      },
      {
        id: 'current_groups',
        name: 'Current Groups',
        value: currentGroups.toString(),
        trend: '+2',
        trendDirection: 'up',
        sourceModule: 'Sales & Events',
        icon: ShoppingCart,
        color: 'blue'
      },
      {
        id: 'daily_revenue',
        name: 'Daily Revenue',
        value: formatAmount(dailyRevenue),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        id: 'daily_expenses',
        name: 'Daily Expenses',
        value: formatAmount(dailyExpenses),
        trend: '-2%',
        trendDirection: 'down',
        sourceModule: 'Finance',
        icon: TrendingDown,
        color: 'rose'
      }
    ] as KPICard[];
  }, [rooms, reservations, salesTransactions, currentSystemDate, expenseRequests, groupBookings, formatAmount]);

  const getColorClass = (color: string, type: 'text' | 'bg') => {
    const colors: Record<string, { text: string; bg: string }> = {
      indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
      emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
      blue: { text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
      amber: { text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
      rose: { text: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
      orange: { text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
      cyan: { text: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
      teal: { text: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10' },
      slate: { text: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-500/10' },
    };
    return colors[color]?.[type] ?? colors.slate[type];
  };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.name}</span>
                <Icon size={16} className={getColorClass(kpi.color, 'text')} />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</h3>
                <span className={`text-[10px] font-black ${getColorClass(kpi.color, 'text')} ${getColorClass(kpi.color, 'bg')} px-1.5 py-0.5 rounded`}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{kpi.sourceModule}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
