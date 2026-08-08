/**
 * Spa & Wellness Dashboard Module
 * Executive dashboard with spa operations KPIs, alerts, and quick actions
 */

import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Home,
  DollarSign,
  Star,
  TrendingDown,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  UserX,
  Package,
  Wrench,
  Crown,
  Ticket,
  Plus,
  RefreshCw
} from 'lucide-react';

interface SpaWellnessDashboardModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onViewAppointment?: (appointmentId: string) => void;
  onViewTherapist?: (therapistId: string) => void;
}

interface KPIData {
  todaysAppointments: number;
  activeTreatments: number;
  therapistUtilization: number;
  treatmentRoomOccupancy: number;
  membershipCount: number;
  retailRevenue: number;
  spaRevenue: number;
  guestSatisfaction: number;
  averageTreatmentValue: number;
  cancellationRate: number;
}

interface Alert {
  id: string;
  type: 'Therapist Unavailable' | 'Appointment Conflict' | 'Low Inventory' | 'Membership Expiry' | 'Equipment Maintenance Due' | 'VIP Appointment' | 'Package Expiry';
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
  guestId?: string;
  appointmentId?: string;
  therapistId?: string;
}

const SpaWellnessDashboardModule: React.FC<SpaWellnessDashboardModuleProps> = ({
  onViewGuestProfile,
  onViewAppointment,
  onViewTherapist
}) => {
  const [kpiData, setKpiData] = useState<KPIData>({
    todaysAppointments: 42,
    activeTreatments: 8,
    therapistUtilization: 87,
    treatmentRoomOccupancy: 75,
    membershipCount: 156,
    retailRevenue: 3240,
    spaRevenue: 8750,
    guestSatisfaction: 4.8,
    averageTreatmentValue: 145,
    cancellationRate: 3.2
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'SPA-ALT-001',
      type: 'VIP Appointment',
      message: 'VIP appointment for Mrs. Johnson - Couples Retreat Package at 2:00 PM',
      severity: 'Critical',
      timestamp: '2026-07-31T10:30:00',
      guestId: 'GST-001',
      appointmentId: 'APT-001'
    },
    {
      id: 'SPA-ALT-002',
      type: 'Therapist Unavailable',
      message: 'Therapist Sarah called in sick - reassign 3 appointments',
      severity: 'Critical',
      timestamp: '2026-07-31T09:45:00',
      therapistId: 'THP-001'
    },
    {
      id: 'SPA-ALT-003',
      type: 'Low Inventory',
      message: 'Lavender massage oil below minimum stock level',
      severity: 'Warning',
      timestamp: '2026-07-31T09:15:00'
    },
    {
      id: 'SPA-ALT-004',
      type: 'Membership Expiry',
      message: '5 memberships expiring this week - send renewal notices',
      severity: 'Warning',
      timestamp: '2026-07-31T08:30:00'
    },
    {
      id: 'SPA-ALT-005',
      type: 'Equipment Maintenance Due',
      message: 'Hydrotherapy pump scheduled for maintenance tomorrow',
      severity: 'Info',
      timestamp: '2026-07-31T08:00:00'
    },
    {
      id: 'SPA-ALT-006',
      type: 'Package Expiry',
      message: 'Weekend Spa Package expires in 3 days - 2 unused sessions',
      severity: 'Warning',
      timestamp: '2026-07-31T07:30:00',
      guestId: 'GST-002'
    }
  ]);

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
      case 'Therapist Unavailable':
        return <UserX size={16} />;
      case 'Appointment Conflict':
        return <AlertTriangle size={16} />;
      case 'Low Inventory':
        return <Package size={16} />;
      case 'Membership Expiry':
        return <Ticket size={16} />;
      case 'Equipment Maintenance Due':
        return <Wrench size={16} />;
      case 'VIP Appointment':
        return <Crown size={16} />;
      case 'Package Expiry':
        return <Ticket size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.guestId && onViewGuestProfile) {
      onViewGuestProfile(alert.guestId);
    } else if (alert.appointmentId && onViewAppointment) {
      onViewAppointment(alert.appointmentId);
    } else if (alert.therapistId && onViewTherapist) {
      onViewTherapist(alert.therapistId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Spa & Wellness Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Spa operations overview and real-time alerts
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<Calendar size={20} />}
          label="Today's Appointments"
          value={kpiData.todaysAppointments}
          color="indigo"
        />
        <KPICard
          icon={<Sparkles size={20} />}
          label="Active Treatments"
          value={kpiData.activeTreatments}
          color="purple"
        />
        <KPICard
          icon={<Users size={20} />}
          label="Therapist Utilization"
          value={kpiData.therapistUtilization}
          suffix="%"
          color="emerald"
        />
        <KPICard
          icon={<Home size={20} />}
          label="Room Occupancy"
          value={kpiData.treatmentRoomOccupancy}
          suffix="%"
          color="blue"
        />
        <KPICard
          icon={<Users size={20} />}
          label="Memberships"
          value={kpiData.membershipCount}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<DollarSign size={20} />}
          label="Retail Revenue"
          value={kpiData.retailRevenue}
          prefix="$"
          color="green"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Spa Revenue"
          value={kpiData.spaRevenue}
          prefix="$"
          color="rose"
        />
        <KPICard
          icon={<Star size={20} />}
          label="Guest Satisfaction"
          value={kpiData.guestSatisfaction}
          suffix="/5.0"
          color="yellow"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Avg Treatment Value"
          value={kpiData.averageTreatmentValue}
          prefix="$"
          color="cyan"
        />
        <KPICard
          icon={<TrendingDown size={20} />}
          label="Cancellation Rate"
          value={kpiData.cancellationRate}
          suffix="%"
          color="orange"
        />
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-indigo-600" />
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
            icon={<Plus size={20} />}
            label="New Appointment"
            color="indigo"
          />
          <QuickActionButton
            icon={<Users size={20} />}
            label="Guest Check-in"
            color="emerald"
          />
          <QuickActionButton
            icon={<Calendar size={20} />}
            label="View Schedule"
            color="blue"
          />
          <QuickActionButton
            icon={<DollarSign size={20} />}
            label="Process Payment"
            color="green"
          />
          <QuickActionButton
            icon={<Package size={20} />}
            label="Retail Sale"
            color="orange"
          />
          <QuickActionButton
            icon={<Ticket size={20} />}
            label="Membership"
            color="purple"
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
  prefix?: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, suffix, prefix, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        {prefix}{value}{suffix}
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
    emerald: 'hover:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/20 dark:text-blue-400',
    green: 'hover:bg-green-50 text-green-600 dark:hover:bg-green-900/20 dark:text-green-400',
    orange: 'hover:bg-orange-50 text-orange-600 dark:hover:bg-orange-900/20 dark:text-orange-400',
    purple: 'hover:bg-purple-50 text-purple-600 dark:hover:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <button className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition ${colorClasses[color as keyof typeof colorClasses]}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default SpaWellnessDashboardModule;