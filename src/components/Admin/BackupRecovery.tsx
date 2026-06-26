/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Download, 
  Settings, 
  History, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export default function BackupRecovery() {
  const { currentSystemDate } = useSystem();
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  const snapshots = useMemo(() => {
    const base = new Date(currentSystemDate);
    const rows: { id: string; date: string; time: string; type: string; size: string; status: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      rows.push({
        id: `SNAP_${9422 - i}`,
        date: dateStr,
        time: '14:00 UTC',
        type: i % 2 === 0 ? 'Diff' : 'Full',
        size: i % 2 === 0 ? `${200 + i * 10}MB` : `${12.4 - i * 0.1}GB`,
        status: i === 0 ? 'Healthy' : 'Verified'
      });
    }
    return rows;
  }, [currentSystemDate]);

  return (
    <div className="space-y-6 animate-fade-in" id="backup-recovery-module">
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
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Disaster Prevention</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Business Continuity Suite</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast('Full audit trail exported successfully.', 'info')} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
             <History size={14} /> Full Audit Trail
           </button>
           <button onClick={() => triggerToast('Snapshot triggered and queued for processing.', 'success')} className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition hover:scale-105">
             <RefreshCw size={14} /> Trigger Snapshot
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
           {/* Backup Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Storage Usage', value: '42.2 GB', sub: 'Cloud + Local Redundant', icon: Database, color: 'indigo' },
                { label: 'Backup Health', value: '100%', sub: 'Last 100 snapshots healthy', icon: ShieldCheck, color: 'emerald' },
                { label: 'Recovery SLA', value: '14m', sub: 'Estimated time to restore', icon: Clock, color: 'purple' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{s.label}</span>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">{s.value}</h4>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">{s.sub}</p>
                        </div>
                    </div>
                )
              })}
           </div>

           {/* Snapshot History */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Enterprise Snapshots</h3>
                 <button onClick={() => triggerToast('Recurring schedule configuration opened.', 'info')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Schedule Recurring</button>
              </div>
              <div className="p-0">
                 {snapshots.map((row, i) => (
                   <div key={i} className="flex items-center justify-between p-4 px-6 border-b last:border-0 border-slate-50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer group">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 font-mono text-[10px] group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">
                            {row.type === 'Full' ? 'F' : 'D'}
                         </div>
                         <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">{row.id} • {row.size}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{row.date} @ {row.time}</div>
                         </div>
                      </div>
                      <div className="flex gap-6 items-center">
                         <div className="text-right hidden md:block">
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{row.status}</span>
                         </div>
                         <button onClick={() => triggerToast(`Snapshot ${row.id} download started.`, 'info')} className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:bg-slate-100 group-hover:text-indigo-600 transition">
                            <Download size={16} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-8 rounded-3xl text-white shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-10"><HardDrive size={180} /></div>
              <div className="space-y-2 relative z-10">
                 <h3 className="text-lg font-black uppercase tracking-widest">Restore Subsystem</h3>
                 <p className="text-xs opacity-60 leading-relaxed font-sans italic">"Critical Warning: Point-in-time recovery will ROLL BACK all database transactions. This action requires 'Double-Key' Super Admin verification."</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl relative z-10 space-y-3">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                    <AlertTriangle size={14} /> Recovery Protocol Alpha
                 </div>
                 <button onClick={() => triggerToast('Restore flow initialized — awaiting secondary admin verification.', 'info')} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2">
                    Initialize Restore Flow <ArrowRight size={14} />
                 </button>
              </div>
           </div>

           <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                 <h3 className="font-black text-sm uppercase tracking-widest">DR Dashboard</h3>
                 <Settings size={20} className="opacity-50" />
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Site Redundancy', status: 'Active (Zone B)' },
                   { label: 'Cloud Mirror', status: 'Connected' },
                   { label: 'Auto-Snapshot', status: 'Enabled (Every 1h)' },
                 ].map((d, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="opacity-60">{d.label}</span>
                      <span className="font-black">{d.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
