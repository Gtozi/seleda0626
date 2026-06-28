
import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Box, 
  ArrowUpRight,
  PieChart as PieIcon,
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
  Cell,
  AreaChart,
  Area
} from 'recharts';

const ReportsModule: React.FC = () => {
  const departmentConsumptionData = [
    { dept: 'Kitchen', value: 8500, color: '#5F7A4F' },
    { dept: 'Housekeeping', value: 6200, color: '#5E7A78' },
    { dept: 'Bar', value: 3400, color: '#C18A3B' },
    { dept: 'Front Desk', value: 800, color: '#B5563C' },
    { dept: 'Engineering', value: 2100, color: '#7C8463' },
    { dept: 'Admin', value: 450, color: '#6B5C4D' },
  ];

  const valueTrend = [
    { month: 'Jan', value: 125000 },
    { month: 'Feb', value: 128000 },
    { month: 'Mar', value: 135000 },
    { month: 'Apr', value: 132000 },
    { month: 'May', value: 142500 },
  ];

  const reportCategories = [
    { title: 'Inventory Valuation', desc: 'Current stock value by category & FIFO aging', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Department Consumption', desc: 'Detailed cost distribution by cost center', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { title: 'Item Movement Audit', desc: 'Full lifecycle tracking of stock SKUs', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Procurement Insights', desc: 'Supplier spend & PO turnaround analysis', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Inventory & Consumption Reports</h2>
           <p className="text-xs text-slate-400 font-medium">Strategic financial insights and operational stock metrics</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <Download size={16} />
              Export Full Audit
           </button>
           <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
              <Calendar size={16} />
              Schedule Auto-Reports
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {reportCategories.map((report, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer flex gap-4">
                     <div className={`w-12 h-12 rounded-2xl ${report.bg} flex items-center justify-center ${report.color} group-hover:scale-110 transition-transform`}>
                        <report.icon size={24} />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight mb-1">{report.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{report.desc}</p>
                     </div>
                     <div className="flex flex-col justify-center">
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                     </div>
                  </div>
               ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Consumption Value by Department (Current Month)</h3>
                    <p className="text-[10px] text-slate-400">Inventory dollar values issued per cost center</p>
                  </div>
                  <BarChart3 size={16} className="text-indigo-500" />
               </div>
               <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentConsumptionData} layout="vertical">
                       <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} horizontal={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={10} width={80} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                       <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                          {departmentConsumptionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <div>
                  <h3 className="text-sm font-sans font-extrabold leading-tight">Portfolio Value Tracking</h3>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">Strategic Stock Equity</p>
               </div>
               
               <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={valueTrend}>
                        <defs>
                           <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                     <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Asset Equity Value</span>
                        <span className="text-2xl font-black">$142,500</span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-400">+5.2% MTD</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Inventory Turn (MTD)</span>
                        <span className="text-xl font-black">4.2x</span>
                     </div>
                     <span className="text-[8px] font-bold text-white/30 uppercase tracking-tight italic">Industry Avg: 3.8x</span>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Custom Analytics Filter</h3>
               <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Audit period</span>
                     <select className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest outline-none">
                        <option>Current Fiscal Month</option>
                        <option>Last 90 Days</option>
                        <option>Year-to-Date (YTD)</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Dimension focus</span>
                     <div className="flex flex-wrap gap-2 pt-1">
                        {['LIFO', 'FIFO', 'Avg Cost', 'Batch Trace'].map((f, i) => (
                           <button key={i} className={`px-2 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-tight transition ${
                              i === 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 dark:bg-slate-850 border-transparent text-slate-400 hover:text-slate-600'
                           }`}>
                              {f}
                           </button>
                        ))}
                     </div>
                  </div>
                  <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition">
                     Generate Segment Report
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsModule;
