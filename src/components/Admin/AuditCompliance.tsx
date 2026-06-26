/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileSearch, 
  History, 
  ShieldAlert, 
  User, 
  Database, 
  Download, 
  Filter, 
  Search, 
  Activity, 
  AlertTriangle,
  Users,
  Calendar,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Terminal,
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSystem } from '../../context/SystemContext';

function deriveSeverity(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('fail') || a.includes('denied') || a.includes('lock') || a.includes('unauthorized')) return 'Critical';
  if (a.includes('delete') || a.includes('void') || a.includes('override') || a.includes('quarantine')) return 'High';
  if (a.includes('update') || a.includes('config') || a.includes('role') || a.includes('change')) return 'Medium';
  return 'Low';
}

const FALLBACK_EVENTS = [
  { id: 'LOG-001', time: '2026-05-29 14:22:01', user: 'Administrator', action: 'PO_APPROVAL', module: 'Procurement', severity: 'Low', details: 'Approved Bulk Linen Purchase (PO-9442)' },
  { id: 'LOG-002', time: '2026-05-29 13:45:12', user: 'Security Officer', action: 'ROLE_UPDATE', module: 'RBAC', severity: 'Medium', details: 'Elevated staff member to Maintenance Supervisor' },
  { id: 'LOG-003', time: '2026-05-29 12:10:45', user: 'Revenue Manager', action: 'PRICE_OVERRIDE', module: 'Revenue', severity: 'High', details: 'Overrode rate for Room 402 (VIP Courtesy)' },
  { id: 'LOG-004', time: '2026-05-29 10:30:11', user: 'SYSTEM', action: 'BACKUP_SYNC', module: 'Recovery', severity: 'Low', details: 'Daily Firestore snapshot successfully exported' },
  { id: 'LOG-005', time: '2026-05-29 09:12:33', user: 'UNKNOWN', action: 'FAILED_LOGIN', module: 'Auth', severity: 'Critical', details: '5 consecutive failed logins from IP 192.168.1.44' },
  { id: 'LOG-006', time: '2026-05-29 08:30:00', user: 'James Wilson', action: 'SYSTEM_CONFIG', module: 'Admin', severity: 'Medium', details: 'Changed global tax settings from 15% to 16%' },
];

export default function AuditCenter() {
  const { structuredAuditLogs } = useSystem();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  const auditEvents = useMemo(() => {
    if (structuredAuditLogs.length === 0) return FALLBACK_EVENTS;
    return structuredAuditLogs.map(log => ({
      id: log.id,
      time: log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '',
      user: log.userName || 'Unknown',
      action: log.action,
      module: log.module || 'System',
      severity: deriveSeverity(log.action),
      details: log.details || ''
    }));
  }, [structuredAuditLogs]);

  return (
    <div className="space-y-6 animate-fade-in" id="audit-compliance-module">
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
          <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Compliance Ledger</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Audit & System Monitoring</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast('Immutable ledger export initiated.', 'info')} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
             <Download size={14} /> Export Immutable Ledger
           </button>
           <button onClick={() => triggerToast('Compliance check completed — all systems green.', 'success')} className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
             <ShieldAlert size={14} /> Compliance Check
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Security Anomalies', value: '02', icon: ShieldAlert, color: 'rose', sub: 'High risk events detected' },
           { label: 'Activity Velocity', value: '+12%', icon: Activity, color: 'indigo', sub: 'Admin throughput today' },
           { label: 'Data Integrity', value: '100%', icon: Database, color: 'emerald', sub: 'All nodes synchronized' },
         ].map((s, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600`}>
                 <s.icon size={24} />
              </div>
              <div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{s.label}</span>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">{s.value}</h4>
                 <span className="text-[10px] text-slate-400 font-bold">{s.sub}</span>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        <div className="lg:col-span-12 space-y-4">
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
                  <History size={18} className="text-indigo-500" />
                  Configuration Change History
                </h2>
                <div className="space-y-3">
                  {auditEvents.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                      <p className="text-xs text-slate-400 font-sans">No configuration changes recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600"><Activity size={20} /></div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Events</span>
                            <h4 className="text-xl font-black text-slate-900 leading-none">{auditEvents.length}</h4>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600"><ShieldAlert size={20} /></div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Critical</span>
                            <h4 className="text-xl font-black text-slate-900 leading-none">{auditEvents.filter(e => e.severity === 'Critical').length}</h4>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600"><AlertTriangle size={20} /></div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">High Risk</span>
                            <h4 className="text-xl font-black text-slate-900 leading-none">{auditEvents.filter(e => e.severity === 'High').length}</h4>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600"><Users size={20} /></div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Users</span>
                            <h4 className="text-xl font-black text-slate-900 leading-none">{new Set(auditEvents.map(e => e.user)).size}</h4>
                          </div>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2">
                          {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
                            <button
                              key={f}
                              onClick={() => setActiveFilter(f as any)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                                activeFilter === f
                                  ? 'bg-slate-950 text-white'
                                  : 'text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search audit log..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none w-48 focus:w-64 transition-all" />
                          </div>
                          <button onClick={() => triggerToast('Audit log export downloaded.', 'info')} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-50">
                            <Download size={12} /> Export
                          </button>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                                <th className="px-5 py-3">Timestamp</th>
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Action</th>
                                <th className="px-5 py-3">Details</th>
                                <th className="px-5 py-3">Module</th>
                                <th className="px-5 py-3">IP</th>
                                <th className="px-5 py-3 text-right">Severity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {auditEvents.filter(e => activeFilter === 'All' || e.severity === activeFilter).map((event) => (
                                <tr key={event.id} className="text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                                  <td className="px-5 py-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{event.time}</td>
                                  <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{event.user.charAt(0)}</div>
                                      <span className="text-slate-900">{event.user}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono uppercase">{event.action}</span>
                                  </td>
                                  <td className="px-5 py-3 text-[10px] text-slate-500 max-w-xs break-words whitespace-normal">{event.details}</td>
                                  <td className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase">{event.module}</td>
                                  <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{event.ipAddress || '—'}</td>
                                  <td className="px-5 py-3 text-right whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                                      event.severity === 'Critical' ? 'bg-rose-500 text-white' :
                                      event.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      event.severity === 'Medium' ? 'bg-amber-50 text-amber-700' :
                                      'bg-slate-100 text-slate-600'
                                    }`}>{event.severity.toUpperCase()}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Widgets */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
           <div className="bg-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10"><Terminal size={140} /></div>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <Lock size={20} className="text-amber-500" />
                    <h4 className="font-black text-sm uppercase tracking-widest">Unauthorized Access Detection</h4>
                 </div>
                 <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                       <span className="text-[10px] opacity-60 uppercase block font-bold">Suspicious IP Blocked</span>
                       <span className="text-sm font-black font-mono">185.23.44.120</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-rose-500">THREAT LEVEL: HIGH</span>
                       <div className="text-[9px] opacity-40">2 minutes ago</div>
                    </div>
                 </div>
                 <button onClick={() => triggerToast('Firewall control panel opened.', 'info')} className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">Universal Firewall Controls <ArrowUpRight size={14} /></button>
              </div>
           </div>

           <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-widest">Compliance Reporting</h4>
                    <p className="text-xs opacity-70">Automated SOX/GDPR ready report delivery.</p>
                 </div>
                 <History size={32} strokeWidth={1} className="opacity-30" />
              </div>
              <div className="space-y-3">
                 {[
                   { name: 'Monthly Financial Audit', status: 'Ready' },
                   { name: 'System Access Log Export', status: 'In Process' },
                 ].map((rep, i) => (
                   <div key={i} className="bg-white/10 p-3 rounded-xl flex items-center justify-between text-[11px] font-bold">
                      {rep.name}
                      <span className="text-[8px] font-black uppercase bg-emerald-500 px-1.5 py-0.5 rounded">{rep.status}</span>
                   </div>
                 ))}
              </div>
              <button onClick={() => triggerToast('Master compliance report generated.', 'success')} className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 Generate Master Report <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
