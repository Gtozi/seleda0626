import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  PieChart as PieIcon, 
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Unlock,
  Building2
} from 'lucide-react';

const ExpenseBudgetControl = () => {
  const departmentBudgets = [
    { dept: 'Kitchen & F&B', allocated: 250000, consumed: 185000, status: 'On Track', trend: '-2%' },
    { dept: 'Housekeeping', allocated: 120000, consumed: 115000, status: 'Near Limit', trend: '+8%' },
    { dept: 'Front Office', allocated: 85000, consumed: 42000, status: 'Under Budget', trend: '-5%' },
    { dept: 'Engineering', allocated: 180000, consumed: 182000, status: 'Exceeded', trend: '+15%' },
    { dept: 'Admin & HR', allocated: 95000, consumed: 88000, status: 'On Track', trend: '+1%' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck size={200} />
         </div>
         <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black uppercase tracking-tight">Active Budget Control</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time expenditure gatekeeping</p>
                  </div>
               </div>
               <p className="text-sm font-medium leading-relaxed text-slate-400 mb-8 max-w-md">
                  Global budget utilization is currently at <span className="text-white font-black">74.2%</span>. 
                  Automatic hardening rules are enabled for departments exceeding 90% allocation.
               </p>
               <div className="flex gap-4">
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">Adjustment Request</button>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition">Policy Config</button>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               {[
                 { label: 'Exceeded Budgets', value: '1', icon: AlertTriangle, color: 'text-rose-400' },
                 { label: 'Hard Block Threshold', value: '110%', icon: Lock, color: 'text-emerald-400' },
                 { label: 'Variance Alerts', value: '12', icon: Activity, color: 'text-amber-400' },
                 { label: 'Active Cost Centers', value: '28', icon: Building2, color: 'text-indigo-400' },
               ].map((kpi, i) => (
                 <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                    <kpi.icon size={20} className={kpi.color + " mb-3"} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{kpi.label}</span>
                    <span className="text-xl font-black">{kpi.value}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
         <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Departmental Consumption Index</h3>
            <div className="flex gap-2 text-[10px] font-black uppercase overflow-x-auto no-scrollbar">
               <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg">Operational</button>
               <button className="px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">Capital</button>
               <button className="px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">Direct</button>
            </div>
         </div>
         <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {departmentBudgets.map((dept, i) => {
                 const pct = (dept.consumed / dept.allocated) * 100;
                 return (
                   <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950/20 rounded-[32px] border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">{dept.dept}</h4>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                               dept.status === 'Exceeded' ? 'bg-rose-100 text-rose-600' : 
                               dept.status === 'Near Limit' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                               {dept.status}
                            </span>
                         </div>
                         <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-3xs ${pct > 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {pct > 90 ? <Lock size={16} /> : <Unlock size={16} />}
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group relative">
                            <span>Consumption</span>
                            <span>{pct.toFixed(1)}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${
                               pct > 100 ? 'bg-rose-500' : pct > 90 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`} style={{ width: `${Math.min(pct, 100)}%` }} />
                         </div>
                         <div className="flex justify-between items-end pt-2">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Budget Usage</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white">${dept.consumed.toLocaleString()} <span className="text-slate-400 text-[10px]">/ ${dept.allocated.toLocaleString()}</span></p>
                             </div>
                             <div className={`flex items-center gap-1 text-[10px] font-bold ${dept.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {dept.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {dept.trend}
                             </div>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ExpenseBudgetControl;
