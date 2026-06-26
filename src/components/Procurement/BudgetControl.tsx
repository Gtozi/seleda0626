import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  PiggyBank,
  Calculator,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';

const BudgetControl = () => {
  const departmentalBudgets = [
    { name: 'Kitchen', allocation: 250000, spend: 185000, color: '#6366f1' },
    { name: 'Rooms', allocation: 180000, spend: 195000, color: '#ef4444' }, // Over budget
    { name: 'Eng.', allocation: 120000, spend: 92000, color: '#10b981' },
    { name: 'F&B', allocation: 320000, spend: 280000, color: '#6366f1' },
    { name: 'Admin', allocation: 60000, spend: 42000, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Purchasing Budget', value: '$1.4M', sub: 'Q2 Allocation', icon: PiggyBank, color: 'text-indigo-600' },
          { label: 'Utilized Amount', value: '$842,500', sub: '60.2% consumption', icon: Target, color: 'text-emerald-600' },
          { label: 'Over-Budget Alerts', value: '2', sub: 'Action required', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Verification Rate', value: '100%', sub: 'Pre-purchase checks', icon: ShieldCheck, color: 'text-blue-600' },
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
         {/* Usage Chart */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Departmental Budget Compliance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Spend vs Planned Allocation (Q2)</p>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentalBudgets} layout="vertical" margin={{ left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                     <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '16px border: none boxShadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                     />
                     <Bar dataKey="allocation" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={12} />
                     <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={12}>
                        {departmentalBudgets.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.spend > entry.allocation ? '#ef4444' : '#6366f1'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Budget Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
               <h3 className="text-sm font-black uppercase tracking-tight mb-6">Validation Protocols</h3>
               <div className="space-y-4">
                  {[
                    { label: 'Soft Limit', value: '80%', status: 'Active' },
                    { label: 'Hard Limit', value: '100%', status: 'Locked' },
                    { label: 'Approval Escalation', value: '>$5,000', status: 'Enabled' },
                  ].map((ctrl, i) => (
                    <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{ctrl.label}</span>
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{ctrl.status}</span>
                       </div>
                       <span className="text-lg font-black text-white">{ctrl.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
               <div className="flex items-center gap-3 mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-[28px]">
                  <AlertCircle className="text-rose-500" size={24} />
                  <div>
                     <h4 className="text-[10px] font-black text-rose-950 dark:text-rose-400 uppercase tracking-tight">Budget Breach: Rooms Dept</h4>
                     <p className="text-[9px] text-rose-700 dark:text-rose-300 font-medium mt-0.5 leading-tight">Allocation exceeded by $15,000. Requisition PR-2024-042 locked pending GM approval.</p>
                  </div>
               </div>
               <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-indigo-100 dark:shadow-none transition">
                  Initiate Fund Transfer
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BudgetControl;
