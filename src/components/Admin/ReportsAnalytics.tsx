/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  FileText, 
  Filter, 
  Calendar, 
  Share2, 
  Zap, 
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  CheckCircle
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
  Bar
} from 'recharts';

const data = [
  { name: 'Mon', rev: 4000, exp: 2400 },
  { name: 'Tue', rev: 3000, exp: 1398 },
  { name: 'Wed', rev: 2000, exp: 9800 },
  { name: 'Thu', rev: 2780, exp: 3908 },
  { name: 'Fri', rev: 1890, exp: 4800 },
  { name: 'Sat', rev: 2390, exp: 3800 },
  { name: 'Sun', rev: 3490, exp: 4300 },
];

export default function ReportsAnalytics() {
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-analytics-module">
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Advanced Intelligence</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Executive Reports & Analytics</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast('Period comparison panel opened.', 'info')} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
             <Calendar size={14} /> Compare Periods
           </button>
           <button onClick={() => triggerToast('Report scheduling configuration saved.', 'success')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition hover:scale-105">
             <Share2 size={14} /> Schedule Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Hero */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-8">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white">Revenue vs Expenditure Matrix</h3>
                 <p className="text-xs text-slate-400 font-sans">Operational dynamic performance flow (Weekly)</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-1.5 bg-indigo-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-1.5 bg-rose-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Expenses</span>
                 </div>
              </div>
           </div>
           
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="exp" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExp)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-8 rounded-3xl text-white shadow-xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest font-sans">Report Templates</h3>
              <div className="space-y-3">
                 {[
                   { name: 'Daily Manager Log', format: 'PDF', icon: FileText },
                   { name: 'Financial YTD Audit', format: 'Excel', icon: BarChart3 },
                   { name: 'Inventory Depletion', format: 'CSV', icon: Zap },
                   { name: 'Guest Geo-Trends', format: 'PDF', icon: PieChart },
                 ].map((report, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition cursor-pointer">
                        <div className="flex gap-3 items-center">
                            <report.icon size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold font-sans">{report.name}</span>
                        </div>
                        <Download size={14} className="text-slate-500 group-hover:text-white transition" />
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Performance Benchmarks</span>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Market ADR Index', value: '1.42', trend: '+0.12' },
                   { label: 'CompSet Occupancy', value: '78.2%', trend: '-1.4%' },
                 ].map((b, i) => (
                   <div key={i} className="flex justify-between items-center pb-2 border-b dark:border-slate-850">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">{b.label}</span>
                      <div className="text-right">
                         <div className="text-sm font-black text-slate-900 dark:text-white font-sans">{b.value}</div>
                         <div className={`text-[9px] font-black font-sans ${b.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{b.trend}</div>
                      </div>
                   </div>
                 ))}
                 <button onClick={() => triggerToast('Benchmark comparison dashboard loaded.', 'info')} className="w-full py-2.5 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition font-sans">
                    Universal Benchmark View
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
               <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white font-sans tracking-tight">Revenue Heatmap Control</h4>
            </div>
            <div className="h-40 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
               <span className="text-[10px] font-black text-slate-400 uppercase italic font-sans">GEOVIS_MAP_WIDGET_LOCKED</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic">Connect MapBox or Google Maps API in the Integrations portal to visualize guest origin heatmaps and primary distribution channels.</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white font-sans tracking-tight border-b dark:border-slate-850 pb-2">Automation Insight Feed</h4>
            <div className="space-y-4">
               {[
                 { msg: 'System detected revenue leakage in MiniBar POS', urgency: 'High', color: 'rose' },
                 { msg: 'Predictive occupancy suggests overbooking risk for July 12-14', urgency: 'Med', color: 'amber' },
                 { msg: 'Energy optimization cycle saved $420 in Floor 3 HVAC logs', urgency: 'Low', color: 'emerald' },
               ].map((inf, i) => (
                 <div key={i} className="flex gap-3">
                    <div className={`w-1 h-8 rounded-full bg-${inf.color}-500 shrink-0`} />
                    <div>
                       <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-sans leading-tight">{inf.msg}</p>
                       <span className={`text-[8px] font-black uppercase text-${inf.color}-600`}>{inf.urgency} Urgency</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white space-y-6">
            <div className="space-y-1">
               <h3 className="font-black text-lg uppercase tracking-widest font-sans">AI Forecaster</h3>
               <p className="text-[10px] opacity-70 italic font-sans leading-relaxed">Neural prediction model trained on historical site data & global travel demand indices.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl space-y-3">
               <div className="flex justify-between text-xs font-black italic">
                  <span>Q3 TARGET</span>
                  <span>$1.2M</span>
               </div>
               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[65%]" />
               </div>
               <div className="text-[9px] opacity-60 text-center font-bold">Recommended Staff Saturation: 92%</div>
            </div>
            <button onClick={() => triggerToast('AI forecaster metrics updated successfully.', 'success')} className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition hover:scale-105 active:scale-95 font-sans">
               Configure Brain Metrics
            </button>
         </div>
      </div>
    </div>
  );
}
