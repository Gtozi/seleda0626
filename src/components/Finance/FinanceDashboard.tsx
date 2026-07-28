import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Banknote,
  Building2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { DashboardTemplate, type KpiTile } from '../Shared/DashboardTemplate';

const FinanceDashboard = () => {
  const kpis: KpiTile[] = [
    { label: 'Daily Yield', value: '$84,520', trend: '+12.5%', isPositive: true, icon: DollarSign, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'AR (0-30 Days)', value: '$142,500', trend: '-2.4%', isPositive: true, icon: Wallet, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Net Cash Position', value: '$1,850,200', trend: '+5.1%', isPositive: true, icon: Banknote, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Daily ADR', value: '$349.25', trend: '+8.2%', isPositive: true, icon: TrendingUp, colorClass: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'RevPAR', value: '$308.73', trend: '+1.2%', isPositive: true, icon: Activity, colorClass: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'GOPPAR', value: '$192.45', trend: '+4.8%', isPositive: true, icon: Building2, colorClass: 'text-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: 'Unreconciled', value: '$8,400', trend: 'Alert', isPositive: false, icon: AlertCircle, colorClass: 'text-rose-500', bgClass: 'bg-rose-50 dark:bg-rose-500/10' },
  ];

  const revenueExpenseData = [
    { month: 'Jan', revenue: 420000, expense: 320000 },
    { month: 'Feb', revenue: 380000, expense: 310000 },
    { month: 'Mar', revenue: 450000, expense: 340000 },
    { month: 'Apr', revenue: 480000, expense: 360000 },
    { month: 'May', revenue: 510000, expense: 380000 },
    { month: 'Jun', revenue: 550000, expense: 395000 },
  ];

  const deptRevenueData = [
    { name: 'Rooms', value: 245000, color: '#6366f1' },
    { name: 'F&B', value: 142000, color: '#10b981' },
    { name: 'Events', value: 85000, color: '#f59e0b' },
    { name: 'Laundry', value: 24000, color: '#ec4899' },
    { name: 'Other', value: 12000, color: '#94a3b8' },
  ];

  const arAgingData = [
    { range: 'Current', amount: 85000 },
    { range: '30 Days', amount: 24000 },
    { range: '60 Days', amount: 12000 },
    { range: '90 Days', amount: 3200 },
  ];

  return (
    <DashboardTemplate kpiTiles={kpis}>
      <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <TrendingUp size={16} className="text-indigo-500" />
                Revenue & Expense Trend
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">First Half Year Analysis</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500">Revenue</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[10px] font-bold text-slate-500">Expenses</span>
               </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueExpenseData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  fontWeight={700}
                  tick={{ fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  fontWeight={700}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expense" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Revenue Pie */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Revenue by Dept.</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {deptRevenueData.map((dept, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-500">{dept.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white">${dept.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AR Aging */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">AR Aging Buckets</h3>
          <div className="space-y-4">
            {arAgingData.map((bucket, i) => {
              const max = 85000;
              const pct = (bucket.amount / max) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{bucket.range}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">${bucket.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase">Outstanding Alert</span>
             </div>
             <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
               12 invoices over 60 days require immediate collection action. High risk of bad debt escalation.
             </p>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Accounts & Cash Pos.</h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 hover:underline transition-colors">Manage Accounts</button>
           </div>
           <div className="grid md:grid-cols-3 gap-4">
              {[
                { bank: 'Chase Operating', acc: '...4920', type: 'Primary Operational', bal: '$1,850,200', color: 'border-l-emerald-500' },
                { bank: 'Wells Fargo', acc: '...8812', type: 'Payroll Fund', bal: '$450,100', color: 'border-l-indigo-500' },
                { bank: 'AMEX Settlement', acc: '...1104', type: 'Merchant Sync', bal: '$125,400', color: 'border-l-amber-500' },
              ].map((acc, i) => (
                <div key={i} className={`p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border-l-[3px] ${acc.color}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{acc.bank}</p>
                  <p className="text-[9px] text-slate-500 font-bold mb-3 uppercase tracking-tighter">{acc.acc} • {acc.type}</p>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">{acc.bal}</h4>
                </div>
              ))}
           </div>
           
           <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-8">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Debt-to-Equity</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">0.42</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Current Ratio</span>
                    <span className="text-sm font-black text-emerald-500">2.81</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Burn Rate</span>
                    <span className="text-sm font-black text-rose-500">$8.4k</span>
                 </div>
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300">
                Download Exec. Summary
              </button>
           </div>
        </div>
      </div>
    </DashboardTemplate>
  );
};

export default FinanceDashboard;
