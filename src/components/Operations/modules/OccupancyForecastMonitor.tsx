/**
 * Occupancy & Forecast Monitor
 * Monitor occupancy and forecast data
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Users,
  Bed,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

interface OccupancyData {
  date: string;
  occupancy: number;
  arrivals: number;
  departures: number;
  revenue: number;
}

const OccupancyForecastMonitor: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'current' | '7-day' | '30-day'>('current');
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);

  const mockOccupancyData: OccupancyData[] = [
    { date: '2026-07-31', occupancy: 78, arrivals: 124, departures: 98, revenue: 45230 },
    { date: '2026-08-01', occupancy: 82, arrivals: 98, departures: 112, revenue: 48500 },
    { date: '2026-08-02', occupancy: 85, arrivals: 115, departures: 95, revenue: 51200 },
    { date: '2026-08-03', occupancy: 88, arrivals: 132, departures: 105, revenue: 54100 },
    { date: '2026-08-04', occupancy: 90, arrivals: 145, departures: 118, revenue: 57800 },
    { date: '2026-08-05', occupancy: 87, arrivals: 108, departures: 135, revenue: 52300 },
    { date: '2026-08-06', occupancy: 84, arrivals: 95, departures: 122, revenue: 48900 }
  ];

  useEffect(() => {
    setOccupancyData(mockOccupancyData);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp size={28} />
            Occupancy & Forecast Monitor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor occupancy and forecast data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            {(['current', '7-day', '30-day'] as const).map(view => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {view === 'current' ? 'Today' : view === '7-day' ? '7-Day' : '30-Day'}
              </button>
            ))}
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-indigo-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Current Occupancy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">78%</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
            <ArrowUp size={14} />
            <span>5% vs yesterday</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Bed size={18} className="text-emerald-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Available Rooms</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">45</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-rose-600">
            <ArrowDown size={14} />
            <span>8 vs yesterday</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Today's Arrivals</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">124</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
            <ArrowUp size={14} />
            <span>12 vs yesterday</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-amber-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Today's Departures</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">98</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-rose-600">
            <ArrowDown size={14} />
            <span>5 vs yesterday</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Occupancy Forecast</h3>
        <div className="space-y-3">
          {occupancyData.map((data, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="w-24">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Occupancy</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.occupancy}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${data.occupancy}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-600">+{data.arrivals}</span> / <span className="text-rose-600">-{data.departures}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">${data.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupancyForecastMonitor;