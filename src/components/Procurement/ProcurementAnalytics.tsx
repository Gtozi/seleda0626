import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieIcon, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Layers,
  Star
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
  Pie,
  ComposedChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';

const ProcurementAnalytics = () => {
  const spendByDepartment = [
    { name: 'Kitchen', spend: 145000, items: 342, vendors: 12 },
    { name: 'Housekeeping', spend: 92000, items: 124, vendors: 8 },
    { name: 'Engineering', spend: 78000, items: 85, vendors: 15 },
    { name: 'F&B Outlet', spend: 124000, items: 210, vendors: 10 },
    { name: 'Admin', spend: 34000, items: 45, vendors: 6 },
  ];

  const savingsTrends = [
    { name: 'Jan', projected: 320000, actual: 305000, savings: 15000 },
    { name: 'Feb', projected: 300000, actual: 288000, savings: 12000 },
    { name: 'Mar', projected: 450000, actual: 426000, savings: 24000 },
    { name: 'Apr', projected: 420000, actual: 399000, savings: 21000 },
    { name: 'May', projected: 520000, actual: 488000, savings: 32000 },
  ];

  const vendorPerformance = [
    { subject: 'Price', score: 92, fullMark: 100 },
    { subject: 'Quality', score: 88, fullMark: 100 },
    { subject: 'Lead Time', score: 75, fullMark: 100 },
    { subject: 'Terms', score: 85, fullMark: 100 },
    { subject: 'Compl.', score: 98, fullMark: 100 },
  ];

  const spendByCategory = [
    { name: 'Consumables', value: 45, color: '#6366f1' },
    { name: 'Service', value: 25, color: '#10b981' },
    { name: 'Equipment', value: 20, color: '#f59e0b' },
    { name: 'Mktg', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Spend Analysis (YTD)', value: '$2.48M', sub: 'Gross procurement value', icon: BarChart3, color: 'text-indigo-600' },
          { label: 'Compliance Index', value: '98.4%', sub: 'Policy adherence', icon: Target, color: 'text-emerald-600' },
          { label: 'Variance (Actual/Budget)', value: '-4.2%', sub: 'Under budget trend', icon: TrendingDown, color: 'text-blue-600' },
          { label: 'Vendor Optimization', value: '+12.5%', sub: 'Driven by RFQs', icon: TrendingUp, color: 'text-amber-600' },
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
         {/* Savings Performance */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Strategic Spend Analysis</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Projected vs Actual Expenditures (YTD)</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-indigo-500" />
                     <span className="text-[10px] font-bold text-slate-500">Projected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-bold text-slate-500">Actual</span>
                  </div>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={savingsTrends}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                     <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     />
                     <Area type="monotone" dataKey="projected" fill="#6366f1" fillOpacity={0.05} stroke="#6366f1" strokeWidth={2} />
                     <Bar dataKey="actual" fill="#10b981" barSize={32} radius={[4, 4, 0, 0]} />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Category Breakdown */}
         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Spend by Category</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={spendByCategory}
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={10}
                       dataKey="value"
                     >
                        {spendByCategory.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
               {spendByCategory.map((cat, i) => (
                 <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                       <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{cat.value}%</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Vendor Performance Radar */}
         <div className="lg:col-span-6 bg-slate-900 rounded-[40px] p-8 text-white">
            <h3 className="text-sm font-black uppercase tracking-tight mb-8">Supplier Lifecycle Performance</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vendorPerformance}>
                     <PolarGrid stroke="#334155" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                     <Tooltip />
                     <Radar
                       name="Vendor Avg"
                       dataKey="score"
                       stroke="#6366f1"
                       fill="#6366f1"
                       fillOpacity={0.6}
                     />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest leading-none">Best Category</span>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">Price Index</span>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest leading-none">Target Improvement</span>
                  <span className="text-xs font-black text-rose-400 uppercase tracking-tight">Delivery Lag</span>
               </div>
            </div>
         </div>

         {/* Detailed Stats */}
         <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Dept Performance Ledger</h3>
            <div className="space-y-4">
               {spendByDepartment.map((dept, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl group cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                          <Activity size={18} />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">{dept.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{dept.vendors} Associated Suppliers</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-slate-900 dark:text-white block tracking-tight">${dept.spend.toLocaleString()}</span>
                       <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{dept.items} SKUs</span>
                    </div>
                 </div>
               ))}
               <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                  Download Full Analytics PDF
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProcurementAnalytics;
