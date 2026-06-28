import React from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  Users,
  Calendar,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight
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
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const ProcurementDashboard = () => {
  const kpis = [
    { label: 'Open Requisitions', value: '18', sub: '4 require immediate action', icon: FileText, color: 'text-blue-600', trend: '+2 today' },
    { id: 'po-issued', label: 'POs Issued (MTD)', value: '124', sub: '$482,500 total value', icon: ShoppingCart, color: 'text-indigo-600', trend: '+12% vs LY' },
    { label: 'Awaiting Delivery', value: '42', sub: 'Next arrival in 2 hrs', icon: Truck, color: 'text-amber-600', trend: '8 on schedule' },
    { label: 'Cost Savings', value: '$24,800', sub: 'Cost avoidance this month', icon: PiggyBank, color: 'text-emerald-600', trend: '+5.4% efficiency' },
  ];

  const spendByDepartment = [
    { name: 'Kitchen', value: 145000 },
    { name: 'Rooms', value: 92000 },
    { name: 'Eng.', value: 78000 },
    { name: 'Admin', value: 34000 },
    { name: 'F&B Outlet', value: 124000 },
  ];

  const monthlyTrend = [
    { month: 'Jan', spend: 320000, savings: 15000 },
    { month: 'Feb', spend: 280000, savings: 12000 },
    { month: 'Mar', spend: 410000, savings: 24000 },
    { month: 'Apr', spend: 390000, savings: 21000 },
    { month: 'May', spend: 480000, savings: 32000 },
  ];

  const COLORS = ['#B5563C', '#5F7A4F', '#C18A3B', '#9C4A36', '#7C8463'];

  return (
    <div className="space-y-6 text-sans">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[9px] font-black font-mono text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Spend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Strategic Purchasing Trend</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Monthly Spend vs Realized Savings</p>
            </div>
             <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-black uppercase tracking-tight">
                <button className="px-3 py-1 bg-white dark:bg-slate-700 shadow-sm rounded-lg">Spend</button>
                <button className="px-3 py-1 text-slate-400">Inventory</button>
             </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
                <Area type="monotone" dataKey="savings" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept breakdown */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Dept. Allocation</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendByDepartment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-slate-400 uppercase leading-none">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">$523k</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {spendByDepartment.map((dept, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-2 rounded-xl">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase">{dept.name}</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-900 dark:text-white">${dept.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requisitions Table */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Priority Procurement Queue</h3>
             <button className="text-[10px] font-black text-indigo-600 uppercase">View All Requests</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Req ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {[
                { id: 'REQ-4021', item: 'Industrial Microwave Oven', dept: 'Kitchen', priority: 'High', status: 'Pending Review', cost: 2450.00 },
                { id: 'REQ-4022', item: 'Linen Replenishment (Q2)', dept: 'Housekeeping', priority: 'Normal', status: 'Approved', cost: 12800.00 },
                { id: 'REQ-4023', item: 'Server UPS Batteries', dept: 'Engineering', priority: 'Emergency', status: 'Sourcing', cost: 850.00 },
                { id: 'REQ-4024', item: 'Premium Wine Stock (Selection A)', dept: 'F&B Outlet', priority: 'Normal', status: 'Draft', cost: 5600.00 },
              ].map((req, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{req.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{req.item}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{req.dept}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      req.priority === 'Emergency' ? 'bg-rose-50 text-rose-600' : 
                      req.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-indigo-500" />
                       <span className="text-[10px] font-bold text-slate-600 uppercase">{req.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${req.cost.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
