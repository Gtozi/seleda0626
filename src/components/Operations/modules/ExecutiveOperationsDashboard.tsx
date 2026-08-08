/**
 * Executive Operations Dashboard
 * Hotel KPIs and operational overview for executive management
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bed,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Shield
} from 'lucide-react';

interface KPICard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  trend: 'up' | 'down' | 'stable';
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  department: string;
}

const ExecutiveOperationsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Mock KPI data
  const roomsKPIs: KPICard[] = [
    {
      title: 'Occupancy',
      value: '78%',
      change: 5.2,
      changeType: 'positive',
      icon: Bed,
      trend: 'up'
    },
    {
      title: 'Available Rooms',
      value: 45,
      change: -8,
      changeType: 'negative',
      icon: Bed,
      trend: 'down'
    },
    {
      title: 'Out of Order',
      value: 3,
      change: 0,
      changeType: 'neutral',
      icon: AlertTriangle,
      trend: 'stable'
    },
    {
      title: 'Arrivals',
      value: 124,
      change: 12,
      changeType: 'positive',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Departures',
      value: 98,
      change: -5,
      changeType: 'negative',
      icon: Users,
      trend: 'down'
    },
    {
      title: 'VIP Arrivals',
      value: 8,
      change: 2,
      changeType: 'positive',
      icon: Star,
      trend: 'up'
    }
  ];

  const revenueKPIs: KPICard[] = [
    {
      title: 'Daily Revenue',
      value: '$45,230',
      change: 8.5,
      changeType: 'positive',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'ADR',
      value: '$285',
      change: 3.2,
      changeType: 'positive',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'RevPAR',
      value: '$222',
      change: 4.1,
      changeType: 'positive',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Forecast Revenue',
      value: '$48,500',
      change: 2.3,
      changeType: 'positive',
      icon: TrendingUp,
      trend: 'up'
    }
  ];

  const guestExperienceKPIs: KPICard[] = [
    {
      title: 'Open Complaints',
      value: 12,
      change: -3,
      changeType: 'positive',
      icon: AlertTriangle,
      trend: 'down'
    },
    {
      title: 'Guest Satisfaction',
      value: '4.6/5',
      change: 0.2,
      changeType: 'positive',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Service Recovery',
      value: 5,
      change: -2,
      changeType: 'positive',
      icon: CheckCircle2,
      trend: 'down'
    },
    {
      title: 'Online Reviews',
      value: 4.5,
      change: 0.1,
      changeType: 'positive',
      icon: Star,
      trend: 'up'
    }
  ];

  const operationsKPIs: KPICard[] = [
    {
      title: 'Open Work Orders',
      value: 28,
      change: 5,
      changeType: 'negative',
      icon: Activity,
      trend: 'up'
    },
    {
      title: 'Housekeeping Progress',
      value: '92%',
      change: 3,
      changeType: 'positive',
      icon: CheckCircle2,
      trend: 'up'
    },
    {
      title: 'Security Incidents',
      value: 2,
      change: -1,
      changeType: 'positive',
      icon: Shield,
      trend: 'down'
    },
    {
      title: 'Staffing Levels',
      value: '95%',
      change: -2,
      changeType: 'negative',
      icon: Users,
      trend: 'down'
    }
  ];

  const mockAlerts: AlertItem[] = [
    {
      id: '1',
      type: 'critical',
      title: 'HVAC Failure - Floor 3',
      description: 'Air conditioning system malfunction affecting 12 rooms',
      time: '10 minutes ago',
      department: 'Engineering'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Staff Shortage - Housekeeping',
      description: '3 housekeepers called in sick for afternoon shift',
      time: '25 minutes ago',
      department: 'Housekeeping'
    },
    {
      id: '3',
      type: 'info',
      title: 'VIP Arrival - Mr. Smith',
      description: 'VVIP guest arriving at 3:00 PM, suite preparation required',
      time: '1 hour ago',
      department: 'Front Office'
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const renderKPICard = (kpi: KPICard) => {
    const Icon = kpi.icon;
    const isPositive = kpi.changeType === 'positive';
    const isNegative = kpi.changeType === 'negative';
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">
              {kpi.title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpi.value}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${
            isPositive ? 'bg-emerald-50 dark:bg-emerald-950/20' :
            isNegative ? 'bg-rose-50 dark:bg-rose-950/20' :
            'bg-slate-50 dark:bg-slate-900/50'
          }`}>
            <Icon size={20} className={
              isPositive ? 'text-emerald-600 dark:text-emerald-400' :
              isNegative ? 'text-rose-600 dark:text-rose-400' :
              'text-slate-600 dark:text-slate-400'
            } />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          {kpi.change !== 0 && (
            <>
              {isPositive ? (
                <ArrowUp size={14} className="text-emerald-600 dark:text-emerald-400" />
              ) : isNegative ? (
                <ArrowDown size={14} className="text-rose-600 dark:text-rose-400" />
              ) : null}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                isNegative ? 'text-rose-600 dark:text-rose-400' :
                'text-slate-600 dark:text-slate-400'
              }`}>
                {Math.abs(kpi.change)}%
              </span>
            </>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            vs last {selectedPeriod}
          </span>
        </div>
      </div>
    );
  };

  const renderAlert = (alert: AlertItem) => {
    const alertColors = {
      critical: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800',
      warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
      info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
    };

    const iconColors = {
      critical: 'text-rose-600 dark:text-rose-400',
      warning: 'text-amber-600 dark:text-amber-400',
      info: 'text-blue-600 dark:text-blue-400'
    };

    return (
      <div key={alert.id} className={`p-3 rounded-lg border ${alertColors[alert.type]}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className={iconColors[alert.type]} />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {alert.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {alert.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {alert.time}
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {alert.department}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Executive Operations Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time hotel performance and operational metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={20} className={`text-slate-600 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Rooms KPIs */}
        <div className="lg:col-span-2 xl:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Bed size={16} />
            Rooms
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {roomsKPIs.slice(0, 4).map(renderKPICard)}
          </div>
        </div>

        {/* Revenue KPIs */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <DollarSign size={16} />
            Revenue
          </h3>
          <div className="space-y-3">
            {revenueKPIs.map(renderKPICard)}
          </div>
        </div>

        {/* Guest Experience KPIs */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Users size={16} />
            Guest Experience
          </h3>
          <div className="space-y-3">
            {guestExperienceKPIs.map(renderKPICard)}
          </div>
        </div>

        {/* Operations KPIs */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity size={16} />
            Operations
          </h3>
          <div className="space-y-3">
            {operationsKPIs.map(renderKPICard)}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={16} />
          Critical Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alerts.map(renderAlert)}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOperationsDashboard;