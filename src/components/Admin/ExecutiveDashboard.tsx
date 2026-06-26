/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle,
  Home,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const revenueData = [
  { name: 'Mon', rev: 4500, occ: 72 },
  { name: 'Tue', rev: 5200, occ: 78 },
  { name: 'Wed', rev: 4800, occ: 82 },
  { name: 'Thu', rev: 6100, occ: 85 },
  { name: 'Fri', rev: 7200, occ: 90 },
  { name: 'Sat', rev: 8500, occ: 95 },
  { name: 'Sun', rev: 7800, occ: 88 },
];

const deptExpenses = [
  { name: 'Rooms', value: 400, color: '#6366f1' },
  { name: 'F&B', value: 300, color: '#f59e0b' },
  { name: 'Housekeeping', value: 200, color: '#10b981' },
  { name: 'Maintenance', value: 100, color: '#ef4444' },
];

export default function ExecutiveDashboard() {
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="space-y-8 pb-10">
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}
      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy Rate', value: '88%', trend: '+4.2%', icon: Home, color: 'emerald' },
          { label: 'Daily Revenue', value: '$12,450', trend: '+12.5%', icon: DollarSign, color: 'indigo' },
          { label: 'RevPAR', value: '$142.5', trend: '+2.1%', icon: TrendingUp, color: 'purple' },
          { label: 'Staff Attendance', value: '96%', trend: 'Stable', icon: Users, color: 'amber' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{kpi.label}</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{kpi.value}</h3>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{kpi.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Revenue & Occupancy Trend</h3>
                <p className="text-xs text-slate-400">Weekly performance analytics</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">Week</button>
                 <button className="px-3 py-1.5 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-400">Month</button>
              </div>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Expense Distro */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-8">
           <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Expense Allocation</h3>
              <p className="text-xs text-slate-400">Department distribution</p>
           </div>
           <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black text-slate-900 dark:text-white">$120k</span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total Exp.</span>
              </div>
           </div>
           <div className="space-y-3">
              {deptExpenses.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-bold">
                   <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                   </div>
                   <span className="text-slate-900 dark:text-white">${item.value}k</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Live Status Cards */}
         {[
           { label: 'Pending Approvals', value: '12', icon: CreditCard, color: 'indigo', sub: 'High value POs' },
           { label: 'System Alerts', value: '02', icon: AlertTriangle, color: 'rose', sub: 'Security events' },
           { label: 'Staff In-House', value: '42', icon: Users, color: 'emerald', sub: 'Current shift' },
         ].map((card, i) => {
           const Icon = card.icon;
           return (
             <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-600`}>
                   <Icon size={20} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{card.label}</span>
                   <strong className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">{card.value}</strong>
                   <span className="text-[10px] text-slate-400 font-bold">{card.sub}</span>
                </div>
             </div>
           );
         })}
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin Activity Log</h3>
            <button onClick={() => triggerToast('Detailed ledger view opened.', 'info')} className="text-xs font-black text-indigo-600 uppercase tracking-widest">View Detailed Ledger</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-850">
                     <th className="pb-4">TIMESTAMP</th>
                     <th className="pb-4">ADMIN USER</th>
                     <th className="pb-4">ACTION</th>
                     <th className="pb-4">MODULE</th>
                     <th className="pb-4 text-right">STATUS</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {[
                    { time: '14:22', user: 'Administrator', action: 'PO_APPROVAL', module: 'Procurement', status: 'SUCCESS' },
                    { time: '13:45', user: 'Security Officer', action: 'ROLE_UPDATE', module: 'RBAC', status: 'SUCCESS' },
                    { time: '12:10', user: 'Revenue Manager', action: 'PRICE_OVERRIDE', module: 'Revenue', status: 'FLAGGED' },
                    { time: '10:30', user: 'Staff Member A', action: 'SYSTEM_BACKUP', module: 'Recovery', status: 'SUCCESS' },
                  ].map((row, i) => (
                    <tr key={i} className="text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                       <td className="py-4 text-slate-400 font-mono">{row.time}</td>
                       <td className="py-4 text-slate-900 dark:text-white">{row.user}</td>
                       <td className="py-4 font-mono uppercase text-[10px] tracking-tight">{row.action}</td>
                       <td className="py-4 text-slate-500">{row.module}</td>
                       <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                            row.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>{row.status}</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
