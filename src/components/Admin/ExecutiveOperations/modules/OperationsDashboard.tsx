/**
 * Operations Dashboard Module
 * Unified live operational monitoring across all departments
 */

import { useMemo } from 'react';
import {
  Bed,
  Utensils,
  Wrench,
  DollarSign,
  Shield,
  ShoppingCart,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useERP } from '../../../../context/ERPContext';

interface DepartmentMetric {
  department: string;
  icon: any;
  metrics: {
    label: string;
    value: string;
    trend: string;
    trendDirection: 'up' | 'down' | 'neutral';
    status: 'good' | 'warning' | 'critical';
  }[];
}

const OperationsDashboard = () => {
  const {
    rooms,
    reservations,
    salesTransactions,
    currentSystemDate,
    expenseRequests,
    groupBookings
  } = useERP();

  const departmentMetrics = useMemo(() => {
    const today = currentSystemDate;
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );

    // Front Office Metrics
    const arrivals = reservations.filter(r => r.checkInDate === today).length;
    const departures = reservations.filter(r => r.checkOutDate === today).length;
    const checkIns = todayReservations.filter(r => r.checkInDate === today).length;
    const checkOuts = todayReservations.filter(r => r.checkOutDate === today).length;
    const roomStatus = rooms.filter(r => r.status === 'Dirty').length;
    const vipArrivals = reservations.filter(r => r.checkInDate === today && r.guestName?.toLowerCase().includes('vip')).length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;

    // F&B Metrics
    const restaurantStatus = 'Open';
    const kitchenStatus = 'Active';
    const posSales = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && 
        (t.module === 'F&B POS' || t.module === 'Restaurant POS' || t.module === 'Bar POS'))
      .reduce((sum, t) => sum + t.total, 0);
    const openOrders = 15; // Placeholder
    const tableOccupancy = 75; // Placeholder %
    const avgTicketTime = 12; // Placeholder minutes
    const foodCost = posSales * 0.32; // Placeholder
    const beverageCost = posSales * 0.28; // Placeholder
    const wasteMonitoring = 5; // Placeholder %

    // Housekeeping Metrics
    const cleanRooms = rooms.filter(r => r.status === 'Clean').length;
    const dirtyRooms = rooms.filter(r => r.status === 'Dirty').length;
    const inspectedRooms = rooms.filter(r => r.status === 'Inspected').length;
    const rushRooms = rooms.filter(r => r.priority === 'High').length;
    const roomProductivity = 85; // Placeholder %

    // Engineering Metrics
    const openWorkOrders = 8; // Placeholder
    const preventiveMaintenance = 12; // Placeholder
    const equipmentDowntime = 2; // Placeholder %
    const utilities = 4500; // Placeholder cost

    // Finance Metrics
    const revenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const cashCollection = revenue * 0.85; // Placeholder
    const refunds = salesTransactions
      .filter(t => t.date === today && t.status === 'Refunded')
      .reduce((sum, t) => sum + t.total, 0);
    const outstandingInvoices = 12500; // Placeholder
    const nightAudit = 'Complete';

    // Security Metrics
    const incidents = 0; // Placeholder
    const fireAlarm = 'None';
    const cctvAlerts = 0; // Placeholder
    const accessControl = 'Normal';

    // Sales Metrics
    const groupBusiness = groupBookings.filter(g => g.status === 'Confirmed').length;
    const events = 3; // Placeholder
    const pipeline = groupBookings.filter(g => g.status === 'Pending').length;
    const forecast = revenue * 1.15; // Placeholder

    return [
      {
        department: 'Front Office',
        icon: Bed,
        metrics: [
          { label: 'Arrivals', value: arrivals.toString(), trend: '+5%', trendDirection: 'up', status: 'good' },
          { label: 'Departures', value: departures.toString(), trend: '-3%', trendDirection: 'down', status: 'good' },
          { label: 'Check-ins', value: checkIns.toString(), trend: '+2%', trendDirection: 'up', status: 'good' },
          { label: 'Check-outs', value: checkOuts.toString(), trend: '-4%', trendDirection: 'down', status: 'good' },
          { label: 'Room Status', value: `${dirtyRooms} Dirty`, trend: '-10%', trendDirection: 'down', status: dirtyRooms > 10 ? 'warning' : 'good' },
          { label: 'VIP Arrivals', value: vipArrivals.toString(), trend: '0', trendDirection: 'neutral', status: 'good' },
          { label: 'Available Rooms', value: availableRooms.toString(), trend: '+8%', trendDirection: 'up', status: 'good' },
        ]
      },
      {
        department: 'Food & Beverage',
        icon: Utensils,
        metrics: [
          { label: 'Restaurant Status', value: restaurantStatus, trend: 'Stable', trendDirection: 'neutral', status: 'good' },
          { label: 'Kitchen Status', value: kitchenStatus, trend: 'Stable', trendDirection: 'neutral', status: 'good' },
          { label: 'POS Sales', value: `$${posSales.toLocaleString()}`, trend: '+12%', trendDirection: 'up', status: 'good' },
          { label: 'Open Orders', value: openOrders.toString(), trend: '+5%', trendDirection: 'up', status: openOrders > 20 ? 'warning' : 'good' },
          { label: 'Table Occupancy', value: `${tableOccupancy}%`, trend: '+3%', trendDirection: 'up', status: 'good' },
          { label: 'Avg Ticket Time', value: `${avgTicketTime}m`, trend: '-8%', trendDirection: 'down', status: avgTicketTime > 15 ? 'warning' : 'good' },
          { label: 'Food Cost', value: `${Math.round(foodCost).toLocaleString()}`, trend: '+2%', trendDirection: 'up', status: 'good' },
          { label: 'Beverage Cost', value: `${Math.round(beverageCost).toLocaleString()}`, trend: '+1%', trendDirection: 'up', status: 'good' },
          { label: 'Waste Monitoring', value: `${wasteMonitoring}%`, trend: '-5%', trendDirection: 'down', status: wasteMonitoring > 8 ? 'warning' : 'good' },
        ]
      },
      {
        department: 'Housekeeping',
        icon: Bed,
        metrics: [
          { label: 'Clean Rooms', value: cleanRooms.toString(), trend: '+10%', trendDirection: 'up', status: 'good' },
          { label: 'Dirty Rooms', value: dirtyRooms.toString(), trend: '-15%', trendDirection: 'down', status: dirtyRooms > 15 ? 'warning' : 'good' },
          { label: 'Inspected Rooms', value: inspectedRooms.toString(), trend: '+8%', trendDirection: 'up', status: 'good' },
          { label: 'Rush Rooms', value: rushRooms.toString(), trend: '-20%', trendDirection: 'down', status: rushRooms > 5 ? 'warning' : 'good' },
          { label: 'Room Productivity', value: `${roomProductivity}%`, trend: '+5%', trendDirection: 'up', status: 'good' },
        ]
      },
      {
        department: 'Engineering',
        icon: Wrench,
        metrics: [
          { label: 'Open Work Orders', value: openWorkOrders.toString(), trend: '-10%', trendDirection: 'down', status: openWorkOrders > 15 ? 'warning' : 'good' },
          { label: 'Preventive Maintenance', value: preventiveMaintenance.toString(), trend: '+5%', trendDirection: 'up', status: 'good' },
          { label: 'Equipment Downtime', value: `${equipmentDowntime}%`, trend: '-25%', trendDirection: 'down', status: equipmentDowntime > 5 ? 'warning' : 'good' },
          { label: 'Utilities', value: `$${utilities.toLocaleString()}`, trend: '-3%', trendDirection: 'down', status: 'good' },
        ]
      },
      {
        department: 'Finance',
        icon: DollarSign,
        metrics: [
          { label: 'Revenue', value: `$${revenue.toLocaleString()}`, trend: '+12%', trendDirection: 'up', status: 'good' },
          { label: 'Cash Collection', value: `$${cashCollection.toLocaleString()}`, trend: '+10%', trendDirection: 'up', status: 'good' },
          { label: 'Refunds', value: `$${refunds.toLocaleString()}`, trend: '-15%', trendDirection: 'down', status: 'good' },
          { label: 'Outstanding Invoices', value: `$${outstandingInvoices.toLocaleString()}`, trend: '-5%', trendDirection: 'down', status: outstandingInvoices > 20000 ? 'warning' : 'good' },
          { label: 'Night Audit', value: nightAudit, trend: 'Complete', trendDirection: 'neutral', status: 'good' },
        ]
      },
      {
        department: 'Security',
        icon: Shield,
        metrics: [
          { label: 'Incidents', value: incidents.toString(), trend: '0', trendDirection: 'neutral', status: incidents > 0 ? 'critical' : 'good' },
          { label: 'Fire Alarm', value: fireAlarm, trend: 'None', trendDirection: 'neutral', status: 'good' },
          { label: 'CCTV Alerts', value: cctvAlerts.toString(), trend: '0', trendDirection: 'neutral', status: 'good' },
          { label: 'Access Control', value: accessControl, trend: 'Normal', trendDirection: 'neutral', status: 'good' },
        ]
      },
      {
        department: 'Sales',
        icon: ShoppingCart,
        metrics: [
          { label: 'Group Business', value: groupBusiness.toString(), trend: '+15%', trendDirection: 'up', status: 'good' },
          { label: 'Events', value: events.toString(), trend: '+2', trendDirection: 'up', status: 'good' },
          { label: 'Pipeline', value: pipeline.toString(), trend: '+8%', trendDirection: 'up', status: 'good' },
          { label: 'Forecast', value: `$${forecast.toLocaleString()}`, trend: '+10%', trendDirection: 'up', status: 'good' },
        ]
      }
    ] as DepartmentMetric[];
  }, [rooms, reservations, salesTransactions, currentSystemDate, groupBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50';
      case 'critical': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp size={12} className="text-emerald-600" />;
      case 'down': return <TrendingDown size={12} className="text-rose-600" />;
      default: return <Activity size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {departmentMetrics.map((dept) => {
        const Icon = dept.icon;
        return (
          <div key={dept.department} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {dept.department}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {dept.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`p-4 rounded-2xl border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {metric.label}
                    </span>
                    {getTrendIcon(metric.trendDirection)}
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    {metric.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationsDashboard;
