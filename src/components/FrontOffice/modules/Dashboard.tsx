/**
 * Front Office Dashboard Module
 * Operational KPIs and Alerts
 */

import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  BedDouble,
  AlertTriangle,
  Star,
  Shield,
  Clock,
  XCircle,
  RefreshCw,
  Bell,
  UserCheck,
  UserX,
  CreditCard,
  Heart,
  Home,
  Wrench,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from 'lucide-react';
import StatCard, { type StatCardProps } from '../StatCard';
import { PageHeader, SectionCard, QuickActionButton, Badge } from '../ui';
import { button, statusTone, layout, animation, type StatusTone } from '../brandTheme';

interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  color: string;
  tone?: StatCardProps['tone'];
}

interface Alert {
  id: string;
  type: 'vip' | 'birthday' | 'anniversary' | 'long-stay' | 'no-show' | 'overbooking' | 'high-balance' | 'payment-failed' | 'blacklist' | 'room-assignment';
  message: string;
  guestName?: string;
  roomNumber?: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

const Dashboard = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Default KPIs with zero values — tones map to the earthy luxury palette
  // (accent = terracotta/operations, plus semantic success/warning/danger/info).
  const defaultKpis: KPICard[] = [
    { title: 'Occupancy %', value: '0.0', change: 0, icon: Users, color: 'blue', tone: 'accent' },
    { title: 'ADR', value: '$0', change: 0, icon: DollarSign, color: 'green', tone: 'success' },
    { title: 'RevPAR', value: '$0', change: 0, icon: TrendingUp, color: 'purple', tone: 'info' },
    { title: "Today's Revenue", value: '$0', change: 0, icon: DollarSign, color: 'emerald', tone: 'success' },
    { title: 'Arrivals Today', value: 0, icon: Calendar, color: 'orange', tone: 'info' },
    { title: 'Departures Today', value: 0, icon: Clock, color: 'red', tone: 'warning' },
    { title: 'Stayovers', value: 0, icon: BedDouble, color: 'indigo', tone: 'accent' },
    { title: 'Expected Check-ins', value: 0, icon: UserCheck, color: 'cyan', tone: 'info' },
    { title: 'Expected Check-outs', value: 0, icon: UserX, color: 'rose', tone: 'warning' },
    { title: 'Available Rooms', value: 0, icon: Home, color: 'green', tone: 'success' },
    { title: 'Out of Order', value: 0, icon: Wrench, color: 'yellow', tone: 'warning' },
    { title: 'Out of Service', value: 0, icon: XCircle, color: 'gray', tone: 'danger' },
  ];
  
  const [kpis, setKpis] = useState<KPICard[]>(defaultKpis);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpisRes = await fetch('/api/front-office/dashboard/kpis');
      if (kpisRes.ok) {
        const contentType = kpisRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const kpisData = await kpisRes.json();
          // Use API data if available, otherwise keep default zero values
          if (kpisData.kpis && kpisData.kpis.length > 0) {
            setKpis(kpisData.kpis);
          }
          setLastUpdated(new Date(kpisData.lastUpdated));
        } else {
          console.error('KPIs endpoint returned non-JSON response');
        }
      } else {
        console.error('KPIs endpoint returned:', kpisRes.status);
      }

      // Fetch alerts
      const alertsRes = await fetch('/api/front-office/alerts');
      if (alertsRes.ok) {
        const contentType = alertsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        } else {
          console.error('Alerts endpoint returned non-JSON response');
        }
      } else {
        console.error('Alerts endpoint returned:', alertsRes.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleViewAllAlerts = () => {
    // In a real implementation, this would navigate to a full alerts page
    console.log('Navigate to all alerts page');
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/front-office/alerts/${alertId}/dismiss`, {
        method: 'POST',
      });
      if (res.ok) {
        // Remove the alert from the local state
        setAlerts(alerts.filter(a => a.id !== alertId));
      } else {
        console.warn('Failed to dismiss alert:', res.status);
        // Still remove from local state for better UX even if backend fails
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      // Still remove from local state for better UX even if backend fails
      setAlerts(alerts.filter(a => a.id !== alertId));
    }
  };

  const handleCheckInGuest = () => {
    if (onTabChange) {
      onTabChange('check-in');
    }
  };

  const handleCheckOutGuest = () => {
    if (onTabChange) {
      onTabChange('check-out');
    }
  };

  const handleNewReservation = () => {
    if (onTabChange) {
      onTabChange('reservations');
    }
  };

  const handleAssignRoom = () => {
    if (onTabChange) {
      onTabChange('room-assignment');
    }
  };

  const alertIcons = {
    vip: Star,
    birthday: Calendar,
    anniversary: Heart,
    'long-stay': Clock,
    'no-show': XCircle,
    overbooking: AlertTriangle,
    'high-balance': DollarSign,
    'payment-failed': CreditCard,
    blacklist: Shield,
    'room-assignment': BedDouble,
  };

  // Map alert priority → semantic tone from the brand theme.
  const priorityTone: Record<Alert['priority'], StatusTone> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  };

  return (
    <div className={layout.sectionStack}>
      {/* Header */}
      <PageHeader
        title="Front Office Dashboard"
        subtitle="Real-time operational overview"
        icon={LayoutDashboard}
        actions={
          <>
            <button onClick={handleRefresh} className={button.secondary}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </>
        }
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent-operations)]"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && (
        <>
          {/* KPI Cards */}
          <div className={layout.kpiGrid}>
            {kpis.map((kpi, index) => (
              <StatCard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                tone={kpi.tone ?? 'accent'}
                change={kpi.change}
                interactive
                className={animation.fadeInUp}
              />
            ))}
          </div>

          {/* Alerts Section */}
          <SectionCard
            icon={Bell}
            title="Operational Alerts"
            tone="warning"
            actions={
              <>
                <Badge tone="danger" variant="soft">
                  {alerts.filter(a => a.priority === 'high').length} High
                </Badge>
                <button onClick={handleViewAllAlerts} className="text-sm text-[var(--color-accent-operations)] hover:underline">
                  View All Alerts
                </button>
                <button
                  onClick={() => setAlertsCollapsed(!alertsCollapsed)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg smooth-transition"
                  aria-label={alertsCollapsed ? 'Expand alerts' : 'Collapse alerts'}
                >
                  {alertsCollapsed ? <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                </button>
              </>
            }
          >
            {!alertsCollapsed && (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const AlertIcon = alertIcons[alert.type];
                    const tone = priorityTone[alert.priority];
                    const toneStyles = statusTone[tone];
                    return (
                      <div key={alert.id} className={`p-4 border-l-4 ${toneStyles.border} ${toneStyles.soft}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`shrink-0 p-2 rounded-lg ${toneStyles.soft}`}>
                              <AlertIcon className={`w-5 h-5 ${toneStyles.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {alert.guestName && <span>{alert.guestName}</span>}
                                {alert.roomNumber && <span>Room {alert.roomNumber}</span>}
                                <span>{alert.time}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg smooth-transition"
                            aria-label="Dismiss alert"
                          >
                            <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </SectionCard>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h3>
            <div className={layout.actionGrid}>
              <QuickActionButton label="Check-In Guest" icon={UserCheck} onClick={handleCheckInGuest} tone="success" />
              <QuickActionButton label="Check-Out Guest" icon={UserX} onClick={handleCheckOutGuest} tone="danger" />
              <QuickActionButton label="New Reservation" icon={Calendar} onClick={handleNewReservation} tone="info" />
              <QuickActionButton label="Assign Room" icon={BedDouble} onClick={handleAssignRoom} tone="neutral" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;