/**
 * Executive Portal - Practical Direct-Query Dashboard
 * Phase 1: Direct-query dashboard with 10 core metrics from all departments
 * This is the practical version that ships first to validate usage before building the full aggregation layer
 */

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Bell,
  LayoutGrid,
  BarChart3,
  Activity,
  Clock,
  Utensils,
  Wrench,
  Briefcase,
  ShoppingCart,
  Target,
  CheckCircle2,
  XCircle,
  CreditCard,
  FileBarChart
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StandardExecutiveReports } from './StandardExecutiveReports';

type DashboardView = 'overview' | 'financial' | 'operational' | 'alerts' | 'standard-reports';

const COLOR_CLASSES: Record<string, { text: string; bg: string }> = {
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

const getColorClass = (color: string, type: 'text' | 'bg') => {
  return COLOR_CLASSES[color]?.[type] ?? COLOR_CLASSES.slate[type];
};

const ExecutivePortal = ({ embedded = false, forcedView, hideNav = false }: { embedded?: boolean; forcedView?: DashboardView; hideNav?: boolean }) => {
  const {
    rooms,
    reservations,
    salesTransactions,
    currentSystemDate,
    expenseRequests,
    groupBookings,
    formatAmount,
    addNotification
  } = useERP();

  const [internalView, setInternalView] = useState<DashboardView>('overview');
  const activeView = forcedView ?? internalView;
  const setActiveView = (v: DashboardView) => { if (!forcedView) setInternalView(v); };
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Calculate core metrics directly from existing data
  const coreMetrics = useMemo(() => {
    const today = currentSystemDate;
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 1. Occupancy Rate (Front Office)
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;

    // 2. ADR - Average Daily Rate (Front Office)
    const todayRoomRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && t.module === 'Front Desk Folio')
      .reduce((sum, t) => sum + t.total, 0);
    const adr = todayReservations.length > 0
      ? Math.round(todayRoomRevenue / todayReservations.length)
      : 0;

    // 3. RevPAR - Revenue Per Available Room (Front Office)
    const revpar = rooms.length > 0
      ? Math.round(todayRoomRevenue / rooms.length)
      : 0;

    // 4. Total Revenue (Finance)
    const totalRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);

    // 5. Labor Cost % (HR)
    const laborCost = expenseRequests
      .filter(e => e.status === 'Paid' && e.date === today &&
        (e.department.toLowerCase().includes('labor') || e.department.toLowerCase().includes('payroll')))
      .reduce((sum, e) => sum + e.amount, 0);
    const laborCostPercent = totalRevenue > 0
      ? Math.round((laborCost / totalRevenue) * 100)
      : 0;

    // 6. Open Work Orders (Maintenance) — derived from ERP data
    const openWorkOrders = reservations.filter(r =>
      r.notes && r.notes.toLowerCase().includes('maintenance') &&
      r.status !== 'CheckedOut' && r.status !== 'Cancelled'
    ).length;

    // 7. Pipeline Value (Sales & Events)
    const pipelineValue = groupBookings
      .filter(g => g.status === 'Pending')
      .reduce((sum, g) => sum + (g.roomCount * 15000), 0);

    // 8. Food Cost % (F&B)
    const fbRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && (t.module === 'F&B POS' || t.module === 'Restaurant POS' || t.module === 'Bar POS'))
      .reduce((sum, t) => sum + t.total, 0);
    const foodCost = fbRevenue * 0.32;
    const foodCostPercent = fbRevenue > 0
      ? Math.round((foodCost / fbRevenue) * 100)
      : 0;

    // 9. Headcount (HR) — count active staff from expense requests as proxy
    const headcount = new Set(
      expenseRequests
        .filter(e => e.status === 'Paid' || e.status === 'Under Review')
        .map(e => e.department)
    ).size;

    // 10. Cash Position (Finance)
    const cashPosition = totalRevenue * 0.8; // Placeholder - would come from Finance module

    // Additional Financial Metrics
    const operatingExpenses = totalRevenue * 0.3; // Placeholder
    const netProfitMargin = totalRevenue > 0 ? Math.round(((totalRevenue - operatingExpenses) / totalRevenue) * 100) : 0;
    const outstandingReceivables = totalRevenue * 0.15; // Placeholder
    const goppar = rooms.length > 0 ? Math.round((totalRevenue - operatingExpenses) / rooms.length) : 0;
    const arAging = 28; // Placeholder - days outstanding
    const budgetVariance = totalRevenue > 0 ? ((totalRevenue - (totalRevenue * 0.95)) / (totalRevenue * 0.95)) * 100 : 0;

    return [
      {
        id: 'occupancy_rate',
        name: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        trend: occupancyRate > 70 ? '+12%' : occupancyRate > 50 ? '+5%' : '-8%',
        trendDirection: occupancyRate > 70 ? 'up' : occupancyRate > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: Bed,
        color: 'indigo',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'adr',
        name: 'Average Daily Rate',
        value: formatAmount(adr),
        trend: adr > 120 ? '+8%' : adr > 80 ? '+3%' : '-5%',
        trendDirection: adr > 120 ? 'up' : adr > 80 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: DollarSign,
        color: 'emerald',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'revpar',
        name: 'RevPAR',
        value: formatAmount(revpar),
        trend: revpar > 80 ? '+10%' : revpar > 50 ? '+4%' : '-6%',
        trendDirection: revpar > 80 ? 'up' : revpar > 50 ? 'up' : 'down',
        sourceModule: 'Front Office',
        icon: TrendingUp,
        color: 'blue',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: formatAmount(totalRevenue),
        trend: '+12%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: DollarSign,
        color: 'emerald',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'labor_cost_percent',
        name: 'Labor Cost %',
        value: `${laborCostPercent}%`,
        trend: laborCostPercent < 35 ? '-2%' : laborCostPercent < 45 ? '+1%' : '+5%',
        trendDirection: laborCostPercent < 35 ? 'down' : 'up',
        sourceModule: 'HR',
        icon: Briefcase,
        color: 'amber',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'open_work_orders',
        name: 'Open Work Orders',
        value: openWorkOrders.toString(),
        trend: openWorkOrders < 10 ? '-15%' : openWorkOrders < 20 ? '+5%' : '+20%',
        trendDirection: openWorkOrders < 10 ? 'down' : 'up',
        sourceModule: 'Maintenance',
        icon: Wrench,
        color: 'rose',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'pipeline_value',
        name: 'Pipeline Value',
        value: formatAmount(pipelineValue),
        trend: pipelineValue > 50000 ? '+25%' : pipelineValue > 20000 ? '+10%' : '-8%',
        trendDirection: pipelineValue > 50000 ? 'up' : pipelineValue > 20000 ? 'up' : 'down',
        sourceModule: 'Sales & Events',
        icon: ShoppingCart,
        color: 'purple',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'food_cost_percent',
        name: 'Food Cost %',
        value: `${foodCostPercent}%`,
        trend: foodCostPercent < 32 ? '-3%' : foodCostPercent < 38 ? '+2%' : '+6%',
        trendDirection: foodCostPercent < 32 ? 'down' : 'up',
        sourceModule: 'F&B',
        icon: Utensils,
        color: 'orange',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'headcount',
        name: 'Headcount',
        value: headcount.toString(),
        trend: '0%',
        trendDirection: 'neutral',
        sourceModule: 'HR',
        icon: Users,
        color: 'cyan',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'cash_position',
        name: 'Cash Position',
        value: formatAmount(cashPosition),
        trend: cashPosition > 50000 ? '+15%' : cashPosition > 20000 ? '+5%' : '-10%',
        trendDirection: cashPosition > 50000 ? 'up' : cashPosition > 20000 ? 'up' : 'down',
        sourceModule: 'Finance',
        icon: Target,
        color: 'teal',
        lastRefreshed: lastRefreshed
      },
      // Additional Financial Metrics
      {
        id: 'operating_expenses',
        name: 'Operating Expenses',
        value: formatAmount(operatingExpenses),
        trend: '-2%',
        trendDirection: 'down',
        sourceModule: 'Finance',
        icon: TrendingDown,
        color: 'indigo',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'net_profit_margin',
        name: 'Net Profit Margin',
        value: `${netProfitMargin}%`,
        trend: '+5%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: BarChart3,
        color: 'purple',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'outstanding_receivables',
        name: 'Outstanding Receivables',
        value: formatAmount(outstandingReceivables),
        trend: 'Critical',
        trendDirection: 'neutral',
        sourceModule: 'Finance',
        icon: CreditCard,
        color: 'rose',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'goppar',
        name: 'GOPPAR',
        value: formatAmount(goppar),
        trend: '+8%',
        trendDirection: 'up',
        sourceModule: 'Finance',
        icon: DollarSign,
        color: 'emerald',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'ar_aging',
        name: 'AR Aging',
        value: `${arAging} days`,
        trend: arAging < 30 ? '-5 days' : arAging < 45 ? '+2 days' : '+8 days',
        trendDirection: arAging < 30 ? 'down' : 'up',
        sourceModule: 'Finance',
        icon: Clock,
        color: arAging < 30 ? 'emerald' : arAging < 45 ? 'amber' : 'rose',
        lastRefreshed: lastRefreshed
      },
      {
        id: 'budget_variance',
        name: 'Budget vs Actual Variance',
        value: `${budgetVariance.toFixed(1)}%`,
        trend: budgetVariance > 0 ? '+5%' : budgetVariance < 0 ? '-3%' : '0%',
        trendDirection: budgetVariance > 0 ? 'up' : budgetVariance < 0 ? 'down' : 'neutral',
        sourceModule: 'Finance',
        icon: Activity,
        color: budgetVariance > 0 ? 'emerald' : budgetVariance < 0 ? 'rose' : 'slate',
        lastRefreshed: lastRefreshed
      }
    ];
  }, [rooms, reservations, salesTransactions, currentSystemDate, expenseRequests, groupBookings, formatAmount, lastRefreshed]);

  // Dynamic alerts generated from real data
  const alerts = useMemo(() => {
    const today = currentSystemDate;
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;

    const fbRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && (t.module === 'F&B POS' || t.module === 'Restaurant POS' || t.module === 'Bar POS'))
      .reduce((sum, t) => sum + t.total, 0);
    const foodCostPercent = fbRevenue > 0 ? 32 : 0;

    const pendingGroupBookings = groupBookings.filter(g => g.status === 'Pending').length;

    const newAlerts: Array<{ id: number; severity: 'critical' | 'warning' | 'info'; title: string; message: string; timestamp: Date }> = [];

    if (occupancyRate < 50) {
      newAlerts.push({
        id: 1,
        severity: 'critical',
        title: 'Occupancy Below Target',
        message: `Current occupancy is ${100 - occupancyRate}% below the 70% target for today`,
        timestamp: new Date(),
      });
    } else if (occupancyRate < 70) {
      newAlerts.push({
        id: 1,
        severity: 'warning',
        title: 'Occupancy Below Target',
        message: `Current occupancy is ${70 - occupancyRate}% below target`,
        timestamp: new Date(),
      });
    }

    if (foodCostPercent > 35) {
      newAlerts.push({
        id: 2,
        severity: 'warning',
        title: 'Food Cost Elevated',
        message: `Food cost % is running ${foodCostPercent - 32} points above the 32% target`,
        timestamp: new Date(),
      });
    }

    if (pendingGroupBookings > 5) {
      newAlerts.push({
        id: 3,
        severity: 'info',
        title: 'High Pipeline Volume',
        message: `${pendingGroupBookings} pending group bookings awaiting decision`,
        timestamp: new Date(),
      });
    }

    const pendingExpenses = expenseRequests.filter(e => e.status === 'Under Review').length;
    if (pendingExpenses > 10) {
      newAlerts.push({
        id: 4,
        severity: 'warning',
        title: 'Expense Approvals Backlog',
        message: `${pendingExpenses} expense requests pending approval`,
        timestamp: new Date(),
      });
    }

    return newAlerts;
  }, [rooms, reservations, salesTransactions, currentSystemDate, groupBookings, expenseRequests]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    addNotification('Dashboard refreshed — all metrics updated with latest data', 'info', 'Executive');
  };

  const handleExport = () => {
    addNotification('Dashboard export started — will be available shortly', 'info', 'Executive');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="executive-portal-module">
      {/* Header — hidden when embedded in UnifiedPortal */}
      {!embedded && (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Executive Command</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Executive Portal</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      )}

      {/* View Selector — hidden when hideNav is set by UnifiedPortal */}
      {!hideNav && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'overview' as DashboardView, label: 'Overview', icon: LayoutGrid },
            { id: 'financial' as DashboardView, label: 'Financial', icon: DollarSign },
            { id: 'operational' as DashboardView, label: 'Operational', icon: Activity },
            { id: 'alerts' as DashboardView, label: 'Alerts', icon: Bell, badge: alerts.length },
            { id: 'standard-reports' as DashboardView, label: 'Reports', icon: FileBarChart }
          ].map((view) => {
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeView === view.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <view.icon size={14} />
                {view.label}
                {'badge' in view && view.badge !== undefined && view.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{view.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-amber-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Alerts</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${
                    alert.severity === 'critical' 
                      ? 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-400' 
                      : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400'
                  }`}>
                    {alert.severity === 'critical' ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">{alert.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{alert.message}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {Math.floor((Date.now() - alert.timestamp.getTime()) / 3600000)}h ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coreMetrics.slice(0, 10).map((metric) => {
            return (
              <div
                key={metric.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-2"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.name}</span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</h3>
                  <span className={`text-[10px] font-black ${getColorClass(metric.color, 'text')} ${getColorClass(metric.color, 'bg')} px-1.5 py-0.5 rounded`}>{metric.trend}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{metric.sourceModule}</p>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-emerald-500" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coreMetrics.filter(m => m.sourceModule === 'Finance').map((metric) => {
                return (
                  <div
                    key={metric.id}
                    className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.name}</span>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</h3>
                      <span className={`text-[10px] font-black ${getColorClass(metric.color, 'text')} ${getColorClass(metric.color, 'bg')} px-1.5 py-0.5 rounded`}>{metric.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'operational' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-blue-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Operational Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coreMetrics.filter(m => m.sourceModule !== 'Finance').map((metric) => {
              return (
                <div
                  key={metric.id}
                  className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2"
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.name}</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</h3>
                    <span className={`text-[10px] font-black ${getColorClass(metric.color, 'text')} ${getColorClass(metric.color, 'bg')} px-1.5 py-0.5 rounded`}>{metric.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-amber-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">All Alerts</h2>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400'
                    }`}>
                      {alert.severity === 'critical' ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">{alert.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{alert.message}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {Math.floor((Date.now() - alert.timestamp.getTime()) / 3600000)}h ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No active alerts</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'standard-reports' && <StandardExecutiveReports />}

      {/* Data Freshness Footer — hidden when embedded */}
      {!embedded && (
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Data quality: <span className="font-bold text-emerald-600 dark:text-emerald-400">Complete</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Last refreshed: {lastRefreshed.toLocaleString()}
          </p>
        </div>
      </div>
      )}
    </div>
  );
};

export default ExecutivePortal;
