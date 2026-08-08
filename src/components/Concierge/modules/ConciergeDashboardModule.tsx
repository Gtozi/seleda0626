/**
 * Concierge Dashboard Module
 * Executive dashboard with guest service KPIs, alerts, and quick actions
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Bell,
  AlertTriangle,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Car,
  Utensils,
  MapPin,
  Ticket,
  Package,
  Crown,
  MessageSquare,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ConciergeDashboardModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onViewRequest?: (requestId: string) => void;
}

interface KPIData {
  activeGuestRequests: number;
  vipGuestsInHouse: number;
  openConciergeTasks: number;
  transportationRequests: number;
  restaurantReservations: number;
  tourBookings: number;
  pendingDeliveries: number;
  guestSatisfactionScore: number;
  averageResponseTime: number;
  serviceCompletionRate: number;
}

interface Alert {
  id: string;
  type: 'VIP Arrival' | 'Urgent Guest Request' | 'Transportation Delay' | 'Missed Reservation' | 'Package Arrival' | 'Special Occasion' | 'Flight Delay' | 'Vendor Cancellation';
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
  guestId?: string;
  requestId?: string;
}

const ConciergeDashboardModule: React.FC<ConciergeDashboardModuleProps> = ({
  onViewGuestProfile,
  onViewRequest
}) => {
  const [kpiData, setKpiData] = useState<KPIData>({
    activeGuestRequests: 0,
    vipGuestsInHouse: 0,
    openConciergeTasks: 0,
    transportationRequests: 0,
    restaurantReservations: 0,
    tourBookings: 0,
    pendingDeliveries: 0,
    guestSatisfactionScore: 0,
    averageResponseTime: 0,
    serviceCompletionRate: 0
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/concierge/dashboard/kpi');
      if (response.ok) {
        const data = await response.json();
        setKpiData(data);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/concierge/dashboard/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchKPIData(), fetchAlerts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchKPIData();
    fetchAlerts();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400';
      case 'Warning':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Info':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'VIP Arrival':
        return <Crown size={16} />;
      case 'Urgent Guest Request':
        return <AlertTriangle size={16} />;
      case 'Transportation Delay':
        return <Car size={16} />;
      case 'Missed Reservation':
        return <Calendar size={16} />;
      case 'Package Arrival':
        return <Package size={16} />;
      case 'Special Occasion':
        return <Star size={16} />;
      case 'Flight Delay':
        return <Clock size={16} />;
      case 'Vendor Cancellation':
        return <AlertTriangle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.guestId && onViewGuestProfile) {
      onViewGuestProfile(alert.guestId);
    } else if (alert.requestId && onViewRequest) {
      onViewRequest(alert.requestId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Concierge Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Guest services overview and real-time alerts
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<Users size={20} />}
          label="Active Requests"
          value={kpiData.activeGuestRequests}
          color="indigo"
        />
        <KPICard
          icon={<Crown size={20} />}
          label="VIP Guests"
          value={kpiData.vipGuestsInHouse}
          color="amber"
        />
        <KPICard
          icon={<CheckCircle2 size={20} />}
          label="Open Tasks"
          value={kpiData.openConciergeTasks}
          color="emerald"
        />
        <KPICard
          icon={<Car size={20} />}
          label="Transportation"
          value={kpiData.transportationRequests}
          color="blue"
        />
        <KPICard
          icon={<Utensils size={20} />}
          label="Restaurant Reservations"
          value={kpiData.restaurantReservations}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<MapPin size={20} />}
          label="Tour Bookings"
          value={kpiData.tourBookings}
          color="purple"
        />
        <KPICard
          icon={<Package size={20} />}
          label="Pending Deliveries"
          value={kpiData.pendingDeliveries}
          color="orange"
        />
        <KPICard
          icon={<Star size={20} />}
          label="Satisfaction Score"
          value={kpiData.guestSatisfactionScore}
          suffix="/5.0"
          color="yellow"
        />
        <KPICard
          icon={<Clock size={20} />}
          label="Avg Response Time"
          value={kpiData.averageResponseTime}
          suffix="min"
          color="cyan"
        />
        <KPICard
          icon={<TrendingUp size={20} />}
          label="Completion Rate"
          value={kpiData.serviceCompletionRate}
          suffix="%"
          color="green"
        />
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            Real-time Alerts
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {alerts.length} active alerts
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition ${getSeverityColor(alert.severity)}`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm">{alert.type}</h3>
                    <span className="text-xs opacity-75">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <ArrowRight size={16} className="flex-shrink-0 opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <QuickActionButton
            icon={<MessageSquare size={20} />}
            label="New Request"
            color="indigo"
          />
          <QuickActionButton
            icon={<Calendar size={20} />}
            label="Restaurant"
            color="rose"
          />
          <QuickActionButton
            icon={<Car size={20} />}
            label="Transport"
            color="blue"
          />
          <QuickActionButton
            icon={<MapPin size={20} />}
            label="Tour Booking"
            color="purple"
          />
          <QuickActionButton
            icon={<Ticket size={20} />}
            label="Tickets"
            color="amber"
          />
          <QuickActionButton
            icon={<Package size={20} />}
            label="Packages"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, suffix, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        {value}{suffix}
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color }) => {
  const colorClasses = {
    indigo: 'hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-900/20 dark:text-indigo-400',
    rose: 'hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-900/20 dark:text-rose-400',
    blue: 'hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/20 dark:text-blue-400',
    purple: 'hover:bg-purple-50 text-purple-600 dark:hover:bg-purple-900/20 dark:text-purple-400',
    amber: 'hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-900/20 dark:text-amber-400',
    orange: 'hover:bg-orange-50 text-orange-600 dark:hover:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <button className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition ${colorClasses[color as keyof typeof colorClasses]}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default ConciergeDashboardModule;