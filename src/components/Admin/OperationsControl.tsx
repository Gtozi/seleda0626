/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  Map, 
  Home, 
  Calendar, 
  Users, 
  Zap, 
  AlertTriangle, 
  ArrowUpRight,
  Filter,
  RefreshCw,
  Search,
  CheckCircle
} from 'lucide-react';

const roomStats = [
  { status: 'Occupied', count: 42, color: 'emerald' },
  { status: 'Vacant Dirty', count: 8, color: 'rose' },
  { status: 'Vacant Ready', count: 12, color: 'indigo' },
  { status: 'Maintenance', count: 3, color: 'amber' },
  { status: 'Reserved', count: 15, color: 'slate' },
];

export default function OperationsControl() {
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="operations-control-module">
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
          <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">Real-time Intelligence</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Operations Command Center</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast('Operations matrix refreshed successfully.', 'success')} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
             <RefreshCw size={14} /> Refresh Matrix
           </button>
           <button onClick={() => triggerToast('Global broadcast message sent to all departments.', 'info')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
             <Zap size={14} /> Global Broadcast
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roomStats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.status}</span>
               <div className={`w-2 h-2 rounded-full bg-${s.color}-500`} />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{s.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           {/* Room Status Matrix Administrative View */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Property Floor Oversight</h3>
                 <div className="flex gap-2">
                    <button className="p-1 px-3 text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg uppercase">Floor 1</button>
                    <button className="p-1 px-3 text-[10px] font-black text-slate-400 hover:bg-slate-50 rounded-lg uppercase">Floor 2</button>
                    <button className="p-1 px-3 text-[10px] font-black text-slate-400 hover:bg-slate-50 rounded-lg uppercase">Floor 3</button>
                 </div>
              </div>
              <div className="p-8 grid grid-cols-4 md:grid-cols-8 gap-3">
                 {Array.from({ length: 32 }).map((_, i) => {
                    const status = i % 5 === 0 ? 'dirty' : i % 7 === 0 ? 'maint' : 'occ';
                    const color = status === 'dirty' ? 'bg-rose-500' : status === 'maint' ? 'bg-amber-500' : 'bg-emerald-500';
                    return (
                      <div key={i} className="aspect-square rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative group cursor-pointer hover:border-indigo-500 transition-all">
                         <span className="text-[10px] font-black text-slate-900 dark:text-white">10{i+1}</span>
                         <div className={`mt-1.5 w-6 h-1 rounded-full ${color}`} />
                         <div className="absolute inset-0 bg-slate-950/80 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ArrowUpRight size={14} className="text-white" />
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Arrivals / Departures</h4>
                 </div>
                 <div className="space-y-3">
                    {[
                      { name: 'John Doe', type: 'Arrival', room: '102', time: '14:00' },
                      { name: 'Alice Smith', type: 'Departure', room: '305', time: '11:00' },
                      { name: 'Bob Johnson', type: 'Arrival', room: '201', time: '16:30' },
                    ].map((guest, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800">
                         <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">{guest.name}</div>
                            <div className="text-[9px] text-slate-400 uppercase">Room {guest.room} • {guest.time}</div>
                         </div>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${guest.type === 'Arrival' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{guest.type}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2">
                    <Activity size={18} className="text-rose-600" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Emergency Alerts</h4>
                 </div>
                 <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-600">
                       <AlertTriangle size={16} />
                       <span className="text-xs font-black">Fire Drill (Simulator)</span>
                    </div>
                    <p className="text-[10px] text-rose-700 dark:text-rose-400 leading-tight">System-wide drill scheduled for Monday at 10:00 UTC. Personnel must review exit protocols.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10"><Users size={140} /></div>
              <div className="relative z-10 space-y-4">
                 <h3 className="font-black text-sm uppercase tracking-widest">Active Shift Oversight</h3>
                 <div className="space-y-3">
                    {[
                      { role: 'Front Desk', count: 4, status: 'Ready' },
                      { role: 'Housekeeping', count: 12, status: 'Active' },
                      { role: 'Maintenance', count: 2, status: 'On-Call' },
                      { role: 'F&B Link', count: 6, status: 'Peak' },
                    ].map((shift, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                         <div>
                            <div className="text-xs font-bold">{shift.role}</div>
                            <div className="text-[10px] opacity-40">{shift.count} personnel</div>
                         </div>
                         <span className="text-[8px] font-black uppercase bg-white/10 px-1.5 py-0.5 rounded italic">{shift.status}</span>
                      </div>
                    ))}
                 </div>
                 <button onClick={() => triggerToast('Shift log detail panel opened.', 'info')} className="w-full py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Shift Log Detail</button>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                 <Filter size={14} className="text-slate-400" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Metrics</span>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Check-in Efficiency', value: '4.2m', color: 'emerald' },
                   { label: 'Turnover Cycle', value: '32m', color: 'indigo' },
                   { label: 'Wait Time (Front)', value: '1.5m', color: 'emerald' },
                 ].map((m, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">{m.label}</span>
                          <span className={`text-${m.color}-600`}>{m.value}</span>
                       </div>
                       <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-${m.color}-500 w-[70%]`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
