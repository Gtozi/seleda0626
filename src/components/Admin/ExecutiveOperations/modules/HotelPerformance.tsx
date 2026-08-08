/**
 * Hotel Performance Module
 * Overall hotel performance metrics and analytics
 */

import { useMemo } from 'react';
import {
  TrendingUp,
  Bed,
  DollarSign,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useERP } from '../../../../context/ERPContext';

const HotelPerformance = () => {
  const { rooms, reservations, salesTransactions, currentSystemDate } = useERP();

  const performanceMetrics = useMemo(() => {
    const today = currentSystemDate;
    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );

    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;

    const roomRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed' && t.module === 'Front Desk Folio')
      .reduce((sum, t) => sum + t.total, 0);

    const adr = todayReservations.length > 0
      ? Math.round(roomRevenue / todayReservations.length)
      : 0;

    const revpar = rooms.length > 0
      ? Math.round(roomRevenue / rooms.length)
      : 0;

    const totalRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);

    const trevpar = rooms.length > 0
      ? Math.round(totalRevenue / rooms.length)
      : 0;

    return [
      { name: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Bed, color: 'indigo' },
      { name: 'ADR', value: `$${adr}`, icon: DollarSign, color: 'emerald' },
      { name: 'RevPAR', value: `$${revpar}`, icon: TrendingUp, color: 'blue' },
      { name: 'TrevPAR', value: `$${trevpar}`, icon: BarChart3, color: 'purple' },
      { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
      { name: 'Guest Satisfaction', value: '4.2/5', icon: Users, color: 'amber' },
    ];
  }, [rooms, reservations, salesTransactions, currentSystemDate]);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    };
    return colors[color] ?? colors.indigo;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${getColorClass(metric.color)} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.name}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          Performance Trends
        </h3>
        <div className="text-center py-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performance trend charts and analytics
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelPerformance;
