/**
 * Alerts Center Module
 * Real-time alerts for revenue drop, low occupancy, equipment failure, VIP arrival, inventory shortage, etc.
 */

import { useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Wrench,
  Star,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Shield,
  XCircle,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { useERP } from '../../../../context/ERPContext';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const AlertsCenter = () => {
  const { rooms, reservations, salesTransactions, currentSystemDate } = useERP();

  const alerts = useMemo(() => {
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

    const newAlerts: Alert[] = [];

    // Revenue Drop Alert
    if (totalRevenue < 30000) {
      newAlerts.push({
        id: 'revenue-drop',
        severity: 'critical',
        type: 'Revenue',
        title: 'Revenue Below Target',
        message: `Daily revenue is ${((30000 - totalRevenue) / 30000 * 100).toFixed(0)}% below target of $30,000`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Low Occupancy Alert
    if (occupancyRate < 50) {
      newAlerts.push({
        id: 'low-occupancy',
        severity: 'critical',
        type: 'Occupancy',
        title: 'Low Occupancy',
        message: `Current occupancy is ${occupancyRate}%, significantly below the 70% target`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (occupancyRate < 70) {
      newAlerts.push({
        id: 'occupancy-warning',
        severity: 'warning',
        type: 'Occupancy',
        title: 'Occupancy Below Target',
        message: `Current occupancy is ${occupancyRate}%, below the 70% target`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Equipment Failure (placeholder)
    newAlerts.push({
      id: 'equipment-failure',
      severity: 'warning',
      type: 'Maintenance',
      title: 'Equipment Maintenance Required',
      message: 'HVAC system in Building B requires scheduled maintenance',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: false
    });

    // VIP Arrival
    const vipArrivals = reservations.filter(r => 
      r.checkInDate === today && r.guestName?.toLowerCase().includes('vip')
    );
    if (vipArrivals.length > 0) {
      newAlerts.push({
        id: 'vip-arrival',
        severity: 'info',
        type: 'Guest',
        title: 'VIP Guest Arrival',
        message: `${vipArrivals.length} VIP guest(s) arriving today`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Inventory Shortage (placeholder)
    newAlerts.push({
      id: 'inventory-shortage',
      severity: 'warning',
      type: 'Inventory',
      title: 'Inventory Shortage',
      message: 'Low stock on premium toiletries in Housekeeping',
      timestamp: new Date(Date.now() - 7200000),
      acknowledged: false
    });

    // Food Cost Increase (placeholder)
    newAlerts.push({
      id: 'food-cost',
      severity: 'warning',
      type: 'F&B',
      title: 'Food Cost Elevated',
      message: 'Food cost percentage is running 2 points above target',
      timestamp: new Date(Date.now() - 10800000),
      acknowledged: false
    });

    // Cash Variance (placeholder)
    newAlerts.push({
      id: 'cash-variance',
      severity: 'critical',
      type: 'Finance',
      title: 'Cash Variance Detected',
      message: 'Cash variance of $450 detected in Front Office shift',
      timestamp: new Date(Date.now() - 1800000),
      acknowledged: false
    });

    // Guest Complaint Escalation (placeholder)
    newAlerts.push({
      id: 'guest-complaint',
      severity: 'critical',
      type: 'Guest',
      title: 'Guest Complaint Escalation',
      message: 'Unresolved guest complaint in Room 305 requires management attention',
      timestamp: new Date(Date.now() - 900000),
      acknowledged: false
    });

    // Security Event (placeholder)
    newAlerts.push({
      id: 'security-event',
      severity: 'critical',
      type: 'Security',
      title: 'Security Alert',
      message: 'Unauthorized access attempt detected at North Entrance',
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false
    });

    return newAlerts;
  }, [rooms, reservations, salesTransactions, currentSystemDate]);

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={16} className="text-rose-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-600" />;
      default:
        return <CheckCircle2 size={16} className="text-slate-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Revenue': return <DollarSign size={16} className="text-slate-500" />;
      case 'Occupancy': return <TrendingDown size={16} className="text-slate-500" />;
      case 'Maintenance': return <Wrench size={16} className="text-slate-500" />;
      case 'Guest': return <Star size={16} className="text-slate-500" />;
      case 'Inventory': return <ShoppingCart size={16} className="text-slate-500" />;
      case 'F&B': return <ShoppingCart size={16} className="text-slate-500" />;
      case 'Finance': return <DollarSign size={16} className="text-slate-500" />;
      case 'Security': return <Shield size={16} className="text-slate-500" />;
      default: return <MessageSquare size={16} className="text-slate-500" />;
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-rose-600" />
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical</p>
              <p className="text-2xl font-black text-rose-600">{criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Warning</p>
              <p className="text-2xl font-black text-amber-600">{warningCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Info</p>
              <p className="text-2xl font-black text-slate-600">{infoCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">All</button>
          <button className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">Critical</button>
          <button className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">Warning</button>
          <button className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">Info</button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded bg-white dark:bg-slate-800">
                    {getTypeIcon(alert.type)}
                  </div>
                  <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">{alert.type}</p>
                  <span className="text-[10px] text-slate-400">•</span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{alert.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{alert.message}</p>
              </div>
              <button className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No active alerts</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All systems operating normally</p>
        </div>
      )}
    </div>
  );
};

export default AlertsCenter;
