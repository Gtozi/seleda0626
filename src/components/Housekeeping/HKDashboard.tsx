/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Layers, 
  Clock, 
  CheckCheck, 
  Wrench, 
  User, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Info,
  Plus,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface SuppliesRequest {
  id: string;
  item: string;
  quantity: number;
  requestedBy: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Delivered';
  requestedAt: string;
}

export default function HKDashboard() {
  const { 
    rooms, 
    notifications, 
    clearNotification, 
    addNotification,
    formatAmount
  } = useERP();

  // Metrics Data
  const hkStats = useMemo(() => {
    const total = rooms.length;
    const dirty = rooms.filter(r => r.status?.includes('Dirty')).length;
    const clean = rooms.filter(r => r.status === 'Vacant Clean' || r.status === 'Occupied Clean').length;
    const inspected = rooms.filter(r => r.status === 'Inspected').length; 
    const ooo = rooms.filter(r => r.status === 'Out of Order').length;
    const vacant = rooms.filter(r => r.status.startsWith('Vacant')).length;
    const occupied = rooms.filter(r => r.status.startsWith('Occupied')).length;
    const maintenance = rooms.filter(r => r.status === 'Maintenance Required').length;

    return { 
      total, 
      dirty, 
      clean, 
      inspected, 
      ooo, 
      vacant, 
      occupied,
      maintenance,
      laundryInProgress: 24, // Mock
      laundryReady: 12, // Mock
      linenStockLevel: 82, // Mock %
      tasksDue: 15, // Mock
      lostFoundPending: 4 // Mock
    };
  }, [rooms]);

  const cleaningChartData = useMemo(() => {
    return [
      { name: 'Vacant Clean', value: rooms.filter(r => r.status === 'Vacant Clean').length, color: '#10b981' },
      { name: 'Vacant Dirty', value: rooms.filter(r => r.status === 'Vacant Dirty').length, color: '#f59e0b' },
      { name: 'Occupied Clean', value: rooms.filter(r => r.status === 'Occupied Clean').length, color: '#6366f1' },
      { name: 'Occupied Dirty', value: rooms.filter(r => r.status === 'Occupied Dirty').length, color: '#f43f5e' },
      { name: 'Out of Order', value: rooms.filter(r => r.status === 'Out of Order').length, color: '#dc2626' },
      { name: 'Inspected', value: hkStats.inspected, color: '#8b5cf6' },
    ];
  }, [rooms, hkStats.inspected]);

  const laundryWorkloadData = [
    { name: 'Wash', value: 12, color: '#6366f1' },
    { name: 'Dry', value: 8, color: '#10b981' },
    { name: 'Iron', value: 15, color: '#f59e0b' },
    { name: 'Ready', value: 20, color: '#8b5cf6' },
  ];

  const linenConsumptionData = [
    { name: 'Sheets', used: 45, laundry: 30 },
    { name: 'Towels', used: 60, laundry: 45 },
    { name: 'Pillows', used: 25, laundry: 15 },
    { name: 'Mats', used: 20, laundry: 12 },
  ];

  const housekeepingAlerts = useMemo(() => {
    return notifications.filter(n => n.department === 'Housekeeping');
  }, [notifications]);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab">
      {/* EXECUTIVE SUMMARY PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Rooms', value: hkStats.total, color: 'slate', icon: Layers },
          { label: 'Occupied', value: hkStats.occupied, color: 'indigo', icon: User },
          { label: 'Vacant', value: hkStats.vacant, color: 'emerald', icon: Sparkles },
          { label: 'Dirty', value: hkStats.dirty, color: 'rose', icon: Clock },
          { label: 'Clean', value: hkStats.clean, color: 'emerald', icon: CheckCheck },
          { label: 'Inspected', value: hkStats.inspected, color: 'purple', icon: Activity },
          { label: 'Out of Order', value: hkStats.ooo, color: 'slate', icon: Wrench },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs flex flex-col justify-between group hover:border-indigo-400 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 transition-colors`}>
                  <Icon size={14} />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{item.value}</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Maintenance', value: hkStats.maintenance, sub: 'Under repair', color: 'bg-amber-500' },
          { label: 'Laundry Process', value: hkStats.laundryInProgress, sub: 'Items in cycle', color: 'bg-blue-500' },
          { label: 'Laundry Ready', value: hkStats.laundryReady, sub: 'Ready for issue', color: 'bg-emerald-500' },
          { label: 'Linen Stock', value: `${hkStats.linenStockLevel}%`, sub: 'Average levels', color: 'bg-indigo-500' },
          { label: 'Tasks Due', value: hkStats.tasksDue, sub: 'Scheduled today', color: 'bg-purple-500' },
          { label: 'Lost & Found', value: hkStats.lostFoundPending, sub: 'Pending claim', color: 'bg-rose-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs flex flex-col gap-1">
            <div className={`w-1.5 h-6 ${item.color} rounded-full mb-1`} />
            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{item.value}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{item.label}</span>
            <p className="text-[8px] text-slate-500 font-medium italic">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">OPERATIONS METRICS GRAPH</span>
            <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={14} className="text-indigo-650 dark:text-indigo-400" />
              Cleaning Distribution & Occupancy Analytics
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time room status ratios against live property floor distribution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center">
            {/* Pie Chart */}
            <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/80 pr-2 h-full">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase mb-2 text-center">Room Cleaning Status Share</span>
              <div className="h-44 w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cleaningChartData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {cleaningChartData.map((d, index) => (
                        <Cell key={`cell-${index}`} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center text-[8px] font-mono">
                {cleaningChartData.map(d => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-500">{d.name}: {d.value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bar Chart - Workload */}
            <div className="flex flex-col items-center justify-center pl-2 h-full">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase mb-2 text-center">Laundry Workload distribution</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={laundryWorkloadData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={8} />
                    <YAxis stroke="#a0aec0" fontSize={8} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px' }} />
                    <Bar dataKey="value" name="Items" radius={[4, 4, 0, 0]}>
                      {laundryWorkloadData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Alerts Side Board */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-rose-500 font-extrabold uppercase">SMART ALERT ENGINE</span>
            <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
              OPERATIONAL CRITICALS ({housekeepingAlerts.length})
            </h3>
            <p className="text-[10px] text-slate-400 leading-tight">Live detection of SLA violations, supply shortages, and guest escalations.</p>
          </div>

          <div className="divide-y divide-slate-150 dark:divide-slate-800/80 max-h-48 overflow-y-auto pr-1 flex-1 mt-2">
            {[
              { id: 'ALT-01', type: 'Delay', msg: 'Room 304 cleaning exceeds SLA (45m elapsed)', priority: 'High' },
              { id: 'ALT-02', type: 'VIP', msg: 'VIP Penthouse 502 pending arrival in 30min', priority: 'Critical' },
              { id: 'ALT-03', type: 'Shortage', msg: 'Linen shortage reported on Floor 4', priority: 'Medium' },
              ...housekeepingAlerts.map(n => ({ id: n.id, type: 'Guest', msg: n.message, priority: 'High' }))
            ].map(alert => (
              <div key={alert.id} className="py-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    alert.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500/10 text-amber-700'
                  }`}>{alert.type} ALERT</span>
                  <span className="text-slate-400 font-bold">LIVE</span>
                </div>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 font-sans font-semibold leading-relaxed">
                  {alert.msg}
                </p>
                <div className="flex gap-2">
                  <button className="py-1 px-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded font-bold font-mono text-[8px] transition cursor-pointer">
                    Acknowledge
                  </button>
                  <button className="py-1 px-2.5 border border-slate-200 dark:border-slate-800 rounded font-bold font-mono text-[8px] text-slate-500">
                    Snooze
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t dark:border-slate-800 pt-3 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 p-2.5 rounded-xl text-3xs text-indigo-700 dark:text-indigo-400 font-sans leading-tight">
            <Info size={14} className="shrink-0" />
            <p>Priority rooms register directly with housekeeper tablet systems to optimize daily runtimes.</p>
          </div>
        </div>
      </div>

      {/* Linen Consumption Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">LINEN LOGISTICS</span>
            <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <ShoppingBag size={14} className="text-indigo-650 dark:text-indigo-400" />
              Linen Consumption & Laundry Turnaround Trends
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Comparative analytics of daily linen usage against laundry processing yields.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linenConsumptionData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={10} />
                <YAxis stroke="#a0aec0" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '12px' }} />
                <Legend iconType="circle" />
                <Bar dataKey="used" name="Used in Rooms" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="laundry" name="Cleaned in Laundry" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b dark:border-slate-800 pb-2">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase block font-semibold leading-tight">STOCK ALERTS</span>
              <h3 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-100 mt-0.5">Linen Stock Criticals</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Bath Towels', stock: 12, target: 100, color: 'text-rose-500' },
                { label: 'King Sheets', stock: 45, target: 150, color: 'text-amber-500' },
                { label: 'Pillow Cases', stock: 210, target: 300, color: 'text-emerald-500' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{alert.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${alert.color}`}>{alert.stock}</span>
                    <span className="text-slate-350">/ {alert.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl mt-4">
            <div className="flex items-start gap-2.5">
              <Info size={14} className="text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-sans leading-snug">
                <strong>Insight:</strong> Linen loss has dropped by 4% since the new laundry audit process was initiated last month.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
