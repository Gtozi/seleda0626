import React from 'react';
import { 
  PiggyBank, 
  Target, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  AlertCircle,
  PieChart as PieIcon,
  Calculator,
  Calendar,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';

const BudgetAnalysis = () => {
  const budgetVsActual = [
    { name: 'Front Office', budget: 120000, actual: 112000, var: -8000 },
    { name: 'Housekeeping', budget: 180000, actual: 194000, var: 14000 },
    { name: 'F&B Outlet', budget: 240000, actual: 210000, var: -30000 },
    { name: 'Engineering', budget: 95000, actual: 102000, var: 7000 },
    { name: 'Marketing', budget: 60000, actual: 45000, var: -15000 },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget Q2', value: '$1.42M', sub: 'Allocated Funds', icon: PiggyBank, color: 'text-indigo-600' },
          { label: 'Budget Utilization', value: '78.4%', sub: 'M-TD Bench', icon: Target, color: 'text-emerald-600' },
          { label: 'Variance (Net)', value: '-$32,480', sub: 'Positive Variance', icon: TrendingDown, color: 'text-blue-600' },
          { label: 'Analysis Accuracy', value: '99.2%', sub: 'Model Integrity', icon: Calculator, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         {/* Variance Visualization */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Departmental Budget Variance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Variance Analysis (Actual vs Allocated)</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-bold text-slate-500">Under Budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-rose-500" />
                     <span className="text-[10px] font-bold text-slate-500">Over Budget</span>
                  </div>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetVsActual} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                     <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       cursor={{ fill: '#f8fafc' }}
                     />
                     <ReferenceLine y={0} stroke="#cbd5e1" />
                     <Bar dataKey="var" radius={[4, 4, 0, 0]} barSize={32}>
                        {budgetVsActual.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.var > 0 ? '#ef4444' : '#10b981'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Budget Controls */}
         <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
            <h3 className="text-sm font-black uppercase tracking-tight mb-8">Strategic Planning</h3>
            <div className="space-y-6">
               {[
                 { label: 'Re-allocation Threshold', value: 'Moderate', color: 'text-amber-500' },
                 { label: 'Next Review Cycle', value: 'June 15', color: 'text-indigo-400' },
                 { label: 'Budget Lock Status', value: 'Unlocked', color: 'text-emerald-500' },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-[11px] font-black uppercase opacity-60 font-sans">{item.label}</span>
                    <span className={`text-[11px] font-black uppercase ${item.color}`}>{item.value}</span>
                 </div>
               ))}
               
               <div className="mt-8 space-y-3">
                  <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                     Initialize Q3 Budget
                  </button>
                  <button className="w-full py-4 bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition">
                     View Forecast Models
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BudgetAnalysis;
