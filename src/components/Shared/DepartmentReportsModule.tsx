/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  BarChart3, 
  Sparkles, 
  Settings, 
  ShieldAlert, 
  BrainCircuit, 
  Download, 
  Printer, 
  Mail, 
  ChevronRight, 
  TrendingUp,
  Activity,
  CheckCircle,
  BadgeAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { REPORTS_METADATA, ReportItem } from '../../data/reportsMetadata';

interface DepartmentReportsModuleProps {
  departmentName: string;
}

export default function DepartmentReportsModule({ departmentName }: DepartmentReportsModuleProps) {
  const { currentSystemDate } = useERP();
  
  // Normalize department name to match metadata keys
  const deptKey = useMemo(() => {
    if (departmentName === 'F&B') return 'F&B';
    if (departmentName === 'Maintenance' || departmentName === 'Engineering') return 'Engineering';
    if (departmentName === 'Housekeeping') return 'Housekeeping';
    if (departmentName === 'Inventory') return 'Inventory';
    if (departmentName === 'Finance') return 'Finance';
    if (departmentName === 'HR' || departmentName === 'Human Resources') return 'HR';
    if (departmentName === 'Procurement') return 'Procurement';
    if (departmentName === 'Executive') return 'Executive';
    return 'Front Office';
  }, [departmentName]);

  const metadata = REPORTS_METADATA[deptKey] || REPORTS_METADATA['Front Office'];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'distribution' | 'alerts'>('dashboard');
  const [activeReport, setActiveReport] = useState<ReportItem | null>(metadata.daily[0] || null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Mock timeline data for charts
  const timelineData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      name: `Day ${i + 1}`,
      Value: Math.round(70 + Math.random() * 30),
      Target: 85,
    }));
  }, []);

  const renderStatsTable = (stats?: any[]) => {
    if (!stats || stats.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6 animate-fade-in">
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <BarChart3 size={12} className="text-indigo-500" />
            Statistical Data Ledger
          </h5>
          <span className="text-[9px] font-mono text-slate-400 uppercase">Consolidated Metrics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="text-[9px] text-slate-400 uppercase tracking-widest font-mono bg-slate-50/20">
                <th className="px-6 py-3 font-black">Performance Metric</th>
                <th className="px-6 py-3 font-black">Current Value</th>
                <th className="px-6 py-3 font-black">Prior Period</th>
                <th className="px-6 py-3 text-right font-black">Variance Index</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {stats.map((row, i) => (
                <tr key={i} className="border-t border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.metric}</td>
                  <td className="px-6 py-4 font-black font-mono text-slate-900 dark:text-white uppercase">{row.current}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{row.previous}</td>
                  <td className={`px-6 py-4 text-right font-mono font-black ${row.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {row.variance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-3xs">
        <div>
          <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900 uppercase tracking-widest inline-block">
            {deptKey} Intelligence Suite
          </span>
          <h3 className="text-xl font-sans font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1.5 leading-none">
            {deptKey} Strategic Reporting Terminal
          </h3>
          <p className="text-2xs text-slate-400 font-mono mt-1">Operational Day: {currentSystemDate} | Reconciled Audit Stream</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setIsAiAnalyzing(true);
              setTimeout(() => setIsAiAnalyzing(false), 1500);
            }}
            disabled={isAiAnalyzing}
            className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-sans font-black rounded-2xl text-[11px] flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition duration-150 cursor-pointer"
          >
            <BrainCircuit size={13} className={isAiAnalyzing ? "animate-spin text-emerald-500" : "text-amber-400 dark:text-emerald-600"} />
            <span>Generate Strategic AI Plan</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-850 rounded-2xl w-full xl:w-max gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'daily', label: 'Daily Reports', icon: Calendar },
          { id: 'weekly', label: 'Weekly Performance', icon: Clock },
          { id: 'monthly', label: 'Monthly Audit', icon: FileText },
          { id: 'quarterly', label: 'Strategic (Q)', icon: Sparkles },
          { id: 'distribution', label: 'Distribution Center', icon: Settings },
          { id: 'alerts', label: 'Operational Alerts', icon: ShieldAlert },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={12} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {metadata.weekly.slice(0, 5).map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">{item.metric}</span>
                  <strong className="text-2xl font-sans font-black block text-indigo-650 dark:text-indigo-400 mt-2">{item.current}</strong>
                  <span className={`text-[10px] font-bold mt-1 ${item.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.variance} vs Prior
                  </span>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-500" />
                  Performance Velocity
                </h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B5563C" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#B5563C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9BBA8" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#6B5C4D'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#6B5C4D'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Value" stroke="#B5563C" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />
                  Metric Distribution
                </h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar List */}
            <div className="lg:col-span-4 space-y-2">
              {metadata.daily.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    activeReport?.id === report.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-mono font-black text-indigo-500 uppercase tracking-widest">{report.category}</span>
                    <span className="text-[9px] font-mono text-slate-400">{report.generatedAt}</span>
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{report.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">{report.description}</p>
                </button>
              ))}
            </div>

            {/* Report Detail */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              {activeReport ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <h4 className="text-xl font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">{activeReport.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{activeReport.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileText size={28} className="text-slate-200 dark:text-slate-700 animate-pulse" />
                    </div>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest font-black">
                      Compiling Strategic {activeReport.category} Ledger...
                    </p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-2 font-mono">Secure data handshake initiated with {deptKey} Audit Stream</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 font-mono text-[10px] uppercase italic tracking-[0.2em]">
                  Select a report parameter to begin view compilation
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <TrendingUp size={14} className="text-indigo-500" />
                 7-Day Comparative Variance Board
               </h4>
               <button className="text-[10px] font-mono font-black text-indigo-500 flex items-center gap-1.5 uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition active:scale-95">
                 Export Data Grid <Download size={12} />
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/30 dark:bg-slate-800/30 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                     <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 font-black">Operational Metric</th>
                     <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 font-black">Current Cycle</th>
                     <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 font-black">Prior Cycle</th>
                     <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 text-right font-black">Variance Index</th>
                   </tr>
                 </thead>
                 <tbody className="text-[11px] font-sans">
                   {metadata.weekly.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-indigo-900/10 transition duration-150 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                       <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{row.metric}</td>
                       <td className="px-8 py-5 font-mono font-black text-slate-900 dark:text-white uppercase">{row.current}</td>
                       <td className="px-8 py-5 font-mono text-slate-400 uppercase">{row.previous}</td>
                       <td className={`px-8 py-5 text-right font-mono font-black ${row.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                         <span className="flex items-center justify-end gap-1.5">
                            {row.variance}
                            <ChevronRight size={10} className={row.isPositive ? 'rotate-270 -mb-0.5' : 'rotate-90 -mt-0.5'} />
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-6">
              {metadata.monthly.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-5 border-b border-slate-50 dark:border-slate-800 pb-5">
                    <h4 className="text-lg font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{section.title}</h4>
                    <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900 flex items-center gap-1.5">
                      <CheckCircle size={10} />
                      {section.trend}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-[1.8] indent-10 text-justify font-medium italic opacity-90 first-letter:text-2xl first-letter:font-black first-letter:text-slate-900 dark:first-letter:text-white first-letter:mr-2">
                    {section.content}
                  </p>
                </div>
              ))}
              
              {/* Statistical Data Table for Monthly */}
              {renderStatsTable(metadata.monthlyStats)}
            </div>
            
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-950 dark:bg-indigo-950 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                 <div className="flex items-center gap-2 mb-6">
                   <BrainCircuit size={16} className="text-emerald-400" />
                   <h4 className="text-[10px] font-mono text-indigo-300 font-extrabold uppercase tracking-widest">AI Strategic Audit</h4>
                 </div>
                 <div className="space-y-4">
                   {metadata.aiRecommendations.map((rec, i) => (
                     <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/card">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter bg-amber-400/10 px-2 py-0.5 rounded-md">{rec.category}</span>
                           <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${rec.impact === 'High' ? 'text-rose-400' : 'text-indigo-400'}`}>
                             <Activity size={8} /> {rec.impact} Impact
                           </span>
                        </div>
                        <h5 className="text-[11px] font-black uppercase mb-1.5 group-hover/card:text-indigo-300 transition-colors leading-tight">{rec.title}</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{rec.recommendation}</p>
                     </div>
                   ))}
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[9px] text-slate-500 font-mono italic">Strategic insights computed via neural audit stream reconciled at 00:00 UTC</p>
                 </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                 <h4 className="text-[10px] font-mono text-slate-400 font-extrabold uppercase mb-5 tracking-widest flex items-center gap-2">
                   <Settings size={14} className="animate-spin-slow" />
                   Digital Distribution Center
                 </h4>
                 <div className="space-y-3">
                   <button className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition active:scale-[0.98] border border-slate-100 dark:border-slate-800 group shadow-3xs">
                     <Mail size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Send Email PDF
                   </button>
                   <button className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition active:scale-[0.98] border border-slate-100 dark:border-slate-800 group shadow-3xs">
                     <Download size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" /> Intelligence XLS
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'quarterly' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-6">
              {metadata.quarterly && metadata.quarterly.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-5 border-b border-slate-50 dark:border-slate-800 pb-5">
                    <h4 className="text-lg font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{section.title}</h4>
                    <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900 flex items-center gap-1.5">
                      <Sparkles size={10} />
                      {section.trend}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-[1.8] indent-10 text-justify font-medium italic opacity-90 first-letter:text-2xl first-letter:font-black first-letter:text-slate-900 dark:first-letter:text-white first-letter:mr-2">
                    {section.content}
                  </p>
                </div>
              ))}

              {/* Statistical Data Table for Quarterly */}
              {renderStatsTable(metadata.quarterlyStats)}

              {!metadata.quarterly && !metadata.quarterlyStats && (
                 <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-24 shadow-sm text-center border-dashed border-2">
                    <Sparkles size={28} className="text-indigo-500 mx-auto mb-4 animate-pulse" />
                    <h4 className="text-xl font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Quarterly Strategic Review</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2">Data sets are being compiled for the current quarterly cycle. Finalization scheduled for period end.</p>
                 </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h4 className="text-[10px] font-mono text-slate-400 font-extrabold uppercase mb-5 tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-indigo-500" />
                  Quarterly Benchmarks
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Market Position</span>
                    <div className="flex justify-between items-end">
                      <strong className="text-lg font-black text-slate-900 dark:text-white">Top 5%</strong>
                      <span className="text-[10px] text-emerald-500 font-bold">+1.2%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Fiscal Health</span>
                    <div className="flex justify-between items-end">
                      <strong className="text-lg font-black text-slate-900 dark:text-white">A+ Rating</strong>
                      <span className="text-[10px] text-indigo-500 font-bold">Stable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder sections for distribution and alerts */}
        {(activeTab === 'distribution' || activeTab === 'alerts') && (
           <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-24 shadow-sm text-center animate-fade-in border-dashed border-2">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
               {activeTab === 'quarterly' && <Sparkles size={28} className="text-indigo-500 animate-pulse" />}
               {activeTab === 'distribution' && <Settings size={28} className="text-slate-500 animate-spin-slow" />}
               {activeTab === 'alerts' && <ShieldAlert size={28} className="text-rose-500" />}
             </div>
             <h4 className="text-xl font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
               Strategic {activeTab === 'quarterly' ? 'Quarterly' : activeTab === 'distribution' ? 'Distribution' : 'Alert'} Module
             </h4>
             <p className="text-[10px] text-slate-400 font-mono tracking-[0.3em] uppercase max-w-sm mx-auto leading-relaxed">
               Initializing real-time synchronization with historical {deptKey} datasets and audit logs...
             </p>
             <div className="mt-8 flex justify-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
