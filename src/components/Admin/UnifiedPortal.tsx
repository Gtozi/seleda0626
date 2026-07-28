/**
 * Unified Portal — Merges the Executive Portal (KPI dashboard) and
 * Operations Manager Portal (operational command center) into a single
 * cohesive interface with a top-level mode toggle.
 *
 * Mode 1: Executive  — high-level KPIs, financial metrics, alerts, standard reports
 * Mode 2: Operations — daily briefing, action queue, escalations, staffing, handoffs, reports
 */

import { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Activity,
  RefreshCw,
  Download,
  Briefcase,
  CheckCircle2,
  Bed,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import ExecutivePortal from './ExecutivePortal';
import OperationsManagerPortal from './OperationsManagerPortal';

type PortalMode = 'executive' | 'operations';

const UnifiedPortal = ({ initialMode = 'executive' }: { initialMode?: PortalMode }) => {
  const { addNotification, rooms, reservations, salesTransactions, currentSystemDate, groupBookings } = useERP();
  const [mode, setMode] = useState<PortalMode>(initialMode);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    addNotification('Dashboard refreshed — all data updated', 'info', 'Executive');
  };

  const handleExport = () => {
    addNotification('Export started — file will be available shortly', 'info', 'Executive');
  };

  const quickStats = useMemo(() => {
    const today = currentSystemDate;
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;
    const totalRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const pendingGroups = groupBookings.filter(g => g.status === 'Pending').length;

    return { occupancyRate, totalRevenue, pendingGroups, inHouse: todayReservations.length };
  }, [rooms, reservations, salesTransactions, currentSystemDate, groupBookings]);

  const modeConfig = useMemo(() => ({
    executive: {
      label: 'Executive',
      icon: LayoutGrid,
      description: 'KPI Dashboard & Financial Metrics',
      accent: 'from-indigo-500 to-indigo-600',
    },
    operations: {
      label: 'Operations',
      icon: Activity,
      description: 'Daily Command Center & Task Management',
      accent: 'from-blue-500 to-cyan-600',
    },
  }), []);

  const stats = [
    { icon: Bed, label: 'Occupancy', value: `${quickStats.occupancyRate}%`, color: 'text-indigo-600' },
    { icon: Users, label: 'In-House', value: quickStats.inHouse, color: 'text-emerald-600' },
    { icon: DollarSign, label: 'Revenue', value: quickStats.totalRevenue > 0 ? quickStats.totalRevenue.toLocaleString() : '0', color: 'text-amber-600' },
    { icon: AlertTriangle, label: 'Pending Groups', value: quickStats.pendingGroups, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-4 animate-fade-in" id="unified-portal-module">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${modeConfig[mode].accent} flex items-center justify-center text-white shadow-lg`}>
            <Briefcase size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Unified Command</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {modeConfig[mode].label} Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {modeConfig[mode].description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
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

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode Toggle — Segmented Control */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2">
          {(Object.keys(modeConfig) as PortalMode[]).map((key) => {
            const config = modeConfig[key];
            const Icon = config.icon;
            const isActive = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${config.accent} text-white shadow-md`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{config.label}</span>
                <span className={`hidden sm:inline text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                  {config.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Portal Content */}
      <div className="relative">
        {mode === 'executive' && <ExecutivePortal embedded />}
        {mode === 'operations' && <OperationsManagerPortal embedded />}
      </div>

      {/* Unified Footer */}
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Data quality: <span className="font-bold text-emerald-600 dark:text-emerald-400">Live</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Mode: {modeConfig[mode].label}
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Last refreshed: {lastRefreshed.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPortal;
