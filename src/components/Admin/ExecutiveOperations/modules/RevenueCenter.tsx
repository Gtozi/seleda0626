/**
 * Revenue Center Module
 * Revenue analysis by outlet, segment, market, nationality, distribution channel, employee, and shift
 */

import { useState } from 'react';
import {
  DollarSign,
  Utensils,
  ShoppingCart,
  Calendar,
  MapPin,
  Users,
  Building2,
  Clock,
  Filter,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const RevenueCenter = () => {
  const [selectedDimension, setSelectedDimension] = useState<'outlet' | 'segment' | 'market' | 'nationality' | 'channel' | 'employee' | 'shift'>('outlet');

  const dimensions = [
    { id: 'outlet', label: 'By Outlet', icon: Building2 },
    { id: 'segment', label: 'By Segment', icon: Users },
    { id: 'market', label: 'By Market', icon: MapPin },
    { id: 'nationality', label: 'By Nationality', icon: MapPin },
    { id: 'channel', label: 'By Distribution Channel', icon: ShoppingCart },
    { id: 'employee', label: 'By Employee', icon: Users },
    { id: 'shift', label: 'By Shift', icon: Clock },
  ];

  const revenueStreams = [
    { name: 'Room Revenue', value: 45000, trend: '+12%', icon: DollarSign, color: 'indigo' },
    { name: 'F&B Revenue', value: 18500, trend: '+8%', icon: Utensils, color: 'orange' },
    { name: 'Spa Revenue', value: 3200, trend: '+15%', icon: TrendingUp, color: 'purple' },
    { name: 'Retail Revenue', value: 1800, trend: '+5%', icon: ShoppingCart, color: 'cyan' },
    { name: 'Conference Revenue', value: 8500, trend: '+20%', icon: Calendar, color: 'blue' },
    { name: 'Parking Revenue', value: 1200, trend: '+3%', icon: MapPin, color: 'teal' },
    { name: 'Laundry Revenue', value: 900, trend: '+2%', icon: ShoppingCart, color: 'slate' },
    { name: 'Other Revenue', value: 2400, trend: '+7%', icon: DollarSign, color: 'emerald' },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
      rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
      cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600',
      teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600',
      slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600',
    };
    return colors[color] ?? colors.slate;
  };

  return (
    <div className="space-y-6">
      {/* Dimension Selector */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            return (
              <button
                key={dim.id}
                onClick={() => setSelectedDimension(dim.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedDimension === dim.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Icon size={14} />
                {dim.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Revenue Streams Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Revenue by Stream
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total revenue breakdown by department
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <div
                key={stream.name}
                className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${getColorClass(stream.color)} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-black ${stream.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stream.trend}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stream.name}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  ${stream.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analysis View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          {dimensions.find(d => d.id === selectedDimension)?.label} Analysis
        </h3>
        <div className="text-center py-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detailed breakdown and drill-down analysis will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueCenter;
