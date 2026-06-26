/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useERP } from '../context/ERPContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  BarChart2, 
  PieChart as LucidePieChart 
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { rooms, reservations, stats, groupBookings, campaigns, formatAmount, currency } = useERP();
  
  const EXCHANGE_RATE = 120;
  const scale = (val: number) => currency === 'ETB' ? val * EXCHANGE_RATE : val;

  // Dynamic Occupancy calculations by Room Type
  const roomTypesCount = rooms.reduce((acc, room) => {
    acc[room.type] = (acc[room.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const occupiedRoomsOfType = reservations
    .filter(r => r.status === 'CheckedIn' && r.roomNumber)
    .reduce((acc, r) => {
      acc[r.roomType] = (acc[r.roomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const occupancyByTypeData = Object.keys(roomTypesCount).map(type => {
    const total = roomTypesCount[type] || 0;
    const occupied = occupiedRoomsOfType[type] || 0;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return {
      name: type,
      Total: total,
      Occupied: occupied,
      Rate: rate
    };
  });

  // Dynamic Reservation Breakdown by channel (Direct vs Booking.com etc.)
  const channelBreakdown = reservations.reduce((acc, r) => {
    acc[r.channel] = (acc[r.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const channelData = Object.keys(channelBreakdown).map((channel, idx) => ({
    name: channel,
    value: channelBreakdown[channel],
    color: ['#6366f1', '#fbbf24', '#f43f5e', '#10b981', '#64748b'][idx % 5]
  }));

  // Revenue progress timeline (simulated historical line points)
  const revenueTrendData = [
    { name: 'May 23', Revenue: scale(24000), Occupancy: 42 },
    { name: 'May 24', Revenue: scale(26500), Occupancy: 48 },
    { name: 'May 25', Revenue: scale(29000), Occupancy: 53 },
    { name: 'May 26', Revenue: scale(31200), Occupancy: 50 },
    { name: 'May 27', Revenue: scale(33400), Occupancy: 56 },
    { name: 'May 28', Revenue: scale(stats.totalRevenue), Occupancy: stats.occupancyRate }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="analytics-portal">
      
      {/* High-level performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-2xl shadow-sm border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-mono uppercase text-slate-400">Yield Management Index</span>
            <Activity className="text-amber-400" size={16} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-sans font-bold">{formatAmount(stats.totalRevenue)}</h3>
            <div className="flex justify-between text-2xs font-mono text-slate-400">
              <span>ADR: {formatAmount(stats.adr)}</span>
              <span>RevPAR: {formatAmount(stats.revpar)}</span>
            </div>
          </div>
          <hr className="border-slate-850" />
          <p className="text-3xs text-slate-500 font-sans leading-relaxed">
            Overall revenue posted from Checked-in tariffs, corporate balances, and immediate walk-in settlements.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-105 rounded-2xl shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-mono uppercase text-slate-400">Average Occupied Density</span>
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-808 font-mono text-3xs rounded-full font-bold">LIVE SYNC</span>
            </div>
            <h3 className="text-2xl font-sans font-bold text-slate-850">{stats.occupancyRate}%</h3>
          </div>
          <div className="space-y-1 pt-2">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between font-mono text-3xs text-slate-400">
              <span>{stats.occupiedRoomsCount} Filled</span>
              <span>{rooms.length - stats.occupiedRoomsCount - stats.outOfOrderCount} Free</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-105 rounded-2xl shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-mono uppercase text-slate-400">Campaign Outreach ROI</span>
              <Sparkles className="text-indigo-600 animate-spin" size={14} />
            </div>
            <h3 className="text-2xl font-sans font-bold text-slate-850">
              {Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length)}% ROI
            </h3>
          </div>
          <div className="text-3xs text-slate-505 leading-relaxed font-sans pt-2 border-t border-t-slate-50">
            Ad budget performing in compliance with dynamic guest reservation acquisitions across all mediums.
          </div>
        </div>
      </div>

      {/* GRAPHICAL CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE GRAPH: Revenues trend */}
        <div className="lg:col-span-2 bg-white border border-slate-105 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-500 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-slate-500" /> Revenue & Occupancy trajectory
            </h3>
            <p className="text-2xs text-slate-400">Visual progression of occupancy percentages vs compiled totals.</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontStyle="mono" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} fontStyle="mono" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                  formatter={(value: any) => formatAmount(currency === 'ETB' ? value / EXCHANGE_RATE : value)}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Booking Channels */}
        <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-500 flex items-center gap-1.5">
              <LucidePieChart size={14} className="text-slate-500" /> Booking Channels Split
            </h3>
            <p className="text-2xs text-slate-400">Share of arrivals booked per channel distribution.</p>
          </div>

          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute text-center">
              <div className="text-lg font-bold text-slate-800">{reservations.length}</div>
              <div className="text-4xs uppercase tracking-wider font-mono text-slate-400 text-slate-400">GUESTS</div>
            </div>
          </div>

          {/* Table index legends */}
          <div className="grid grid-cols-2 gap-2 text-3xs font-mono border-t border-t-slate-55 pt-2">
            {channelData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span className="truncate">{c.name}: {c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER CHART ROW: Occupancy rates by room category */}
      <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <BarChart2 size={14} className="text-slate-500" /> Category Occupancy Performance
          </h3>
          <p className="text-2xs text-slate-400">Percent index of filled rooms divided by specific room categories.</p>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyByTypeData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} fontStyle="mono" tickLine={false} axisLine={false} />
              <YAxis fontSize={10} fontStyle="mono" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
              <Bar dataKey="Rate" name="Occupancy Rate (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
