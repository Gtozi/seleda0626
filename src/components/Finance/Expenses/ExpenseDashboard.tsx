import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PiggyBank, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

const ExpenseDashboard = () => {
  const kpis = [
    { label: 'Total Expenses (MTD)', value: '$124,500', trend: '+5.2%', isUp: true, sub: 'Target: $140,000', icon: DollarSign, color: 'text-indigo-600' },
    { label: 'Pending Approvals', value: '18', trend: '-2', isUp: false, sub: 'Value: $12,400', icon: Clock, color: 'text-amber-600' },
    { label: 'Petty Cash Balance', value: '$4,250', trend: 'Stable', isUp: true, sub: 'Across 4 branches', icon: PiggyBank, color: 'text-emerald-600' },
    { label: 'Budget Utilization', value: '82%', trend: '+4%', isUp: true, sub: 'Threshold: 85%', icon: Activity, color: 'text-blue-600' },
  ];

  const categoryData = [
    { name: 'Utilities', value: 45000, color: '#6366f1' },
    { name: 'Transport', value: 28000, color: '#10b981' },
    { name: 'Staff Costs', value: 32000, color: '#f59e0b' },
    { name: 'Maintenance', value: 15400, color: '#ef4444' },
    { name: 'Supplies', value: 12100, color: '#8b5cf6' },
  ];

  const monthlyTrend = [
    { month: 'Jan', expense: 110000, budget: 120000 },
    { month: 'Feb', expense: 98000, budget: 115000 },
    { month: 'Mar', expense: 135000, budget: 130000 },
    { month: 'Apr', expense: 122000, budget: 135000 },
    { month: 'May', expense: 124500, budget: 140000 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${stat.isUp ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Strategic Expense Velocity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Operational Spend vs Budget Allocation</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[10px] font-black uppercase tracking-tight text-slate-600 px-4 py-2">
              <option>Last 6 Months</option>
              <option>Full Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                <Area type="monotone" dataKey="budget" stroke="#94a3b8" fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Expense Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">$124k</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {categoryData.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-2 rounded-lg">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{cat.name}</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-900 dark:text-white">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
