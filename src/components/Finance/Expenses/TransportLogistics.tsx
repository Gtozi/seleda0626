import React from 'react';
import { 
  Truck, 
  Fuel, 
  MapPin, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  PackageCheck,
  Search,
  MoreVertical,
  Plus,
  Navigation,
  Activity,
  History
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
  LineChart,
  Line
} from 'recharts';

const TransportLogistics = () => {
  const stats = [
    { label: 'Total Transport Cost', value: '$14,240', trend: '-2.4%', icon: Truck, color: 'text-indigo-600' },
    { label: 'Fuel Spend (MTD)', value: '$3,850', trend: '+12.5%', icon: Fuel, color: 'text-amber-600' },
    { label: 'Carrier Deliveries', value: '142', trend: '+18', icon: PackageCheck, color: 'text-emerald-600' },
    { label: 'Landed Cost Impact', value: '4.2%', trend: 'Avg.', icon: Activity, color: 'text-blue-600' },
  ];

  const dailyTrend = [
    { date: '24 May', cost: 420 },
    { date: '25 May', cost: 580 },
    { date: '26 May', cost: 1200 }, // Peak
    { date: '27 May', cost: 450 },
    { date: '28 May', cost: 380 },
  ];

  const vehicleExpenses = [
    { id: 'TR-102', description: 'Fuel Refill - Staff Shuttle', amount: 145.00, vehicle: 'Bus 01', type: 'Fuel', date: '2 hrs ago' },
    { id: 'TR-101', description: 'Freight - Kitchen Equipment', amount: 850.00, vehicle: 'External Carrier', type: 'Delivery', date: '5 hrs ago' },
    { id: 'TR-100', description: 'Tyre Replacement', amount: 320.00, vehicle: 'Guest Van 02', type: 'Maintenance', date: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className={`text-[9px] font-bold mt-1 uppercase tracking-tight ${stat.trend.startsWith('-') ? 'text-emerald-500' : 'text-rose-500'}`}>
               {stat.trend} vs LY
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Logistics Expenditure Flow</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Daily aggregated transport & freight costs</p>
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
               <button className="px-3 py-1 bg-white dark:bg-slate-700 shadow-sm rounded-lg text-[10px] font-black uppercase">Direct</button>
               <button className="px-3 py-1 text-slate-400 text-[10px] font-black uppercase">Allocated</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cost" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Intelligence */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-8 text-white">
           <MapPin size={24} className="mb-4 opacity-50" />
           <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-indigo-400">Landed Cost Logic</h3>
           <p className="text-[10px] font-medium leading-relaxed mb-6 text-slate-400">System automated rule applied: Freight related to PO-2024-86 (Kitchen Eq.) has been capitalized as a <span className="text-white">Landed Cost</span> instead of direct expense.</p>
           
           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Offset</span>
                    <span className="text-[10px] font-black text-emerald-400">+$1,240.00</span>
                 </div>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-2/3" />
                 </div>
              </div>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                 View Allocation Rules
              </button>
           </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
           <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Transport Expense Log</h3>
              <div className="flex gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search logistics..." 
                      className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-48"
                    />
                 </div>
                 <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                    <Plus size={14} />
                    New Entry
                 </button>
              </div>
           </div>
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Vehicle</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {vehicleExpenses.map((exp, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{exp.id}</span>
                       <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{exp.date}</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{exp.description}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exp.vehicle}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          exp.type === 'Fuel' ? 'bg-amber-50 text-amber-600' : 
                          exp.type === 'Delivery' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                          {exp.type}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${exp.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                          <MoreVertical size={14} />
                       </button>
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

export default TransportLogistics;
