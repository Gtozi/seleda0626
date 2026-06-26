/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ChefHat, 
  Utensils, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Clock,
  LayoutGrid,
  AlertCircle,
  XCircle,
  Gift,
  Package,
  Layers,
  ClipboardList,
  Footprints,
  Grid3X3
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function FBDashboard() {
  const { formatAmount } = useERP();
  
  const salesData = [
    { name: 'Mon', sales: 4200, orders: 120 },
    { name: 'Tue', sales: 3800, orders: 110 },
    { name: 'Wed', sales: 5100, orders: 145 },
    { name: 'Thu', sales: 4800, orders: 135 },
    { name: 'Fri', sales: 7200, orders: 190 },
    { name: 'Sat', sales: 8500, orders: 210 },
    { name: 'Sun', sales: 6400, orders: 170 },
  ];

  const topItems = [
    { name: 'Full Board Package', count: 450, growth: '+12%', value: '#1', color: '#6366f1' },
    { name: 'Breakfast Package', count: 380, growth: '+8%', value: '#2', color: '#10b981' },
    { name: 'Local Beer', count: 210, growth: '-2%', value: '#3', color: '#f59e0b' },
    { name: 'Soft Drinks', count: 180, growth: '+5%', value: '#4', color: '#64748b' },
  ];

  const categoryMix = [
    { name: 'Meal Packages', value: 70 },
    { name: 'Beverages', value: 20 },
    { name: 'Extra Charges', value: 10 },
  ];

  const categoryColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* SECTION 1: TODAY'S OPERATIONAL PULSE */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Forecasted Guests', val: '124', icon: Users, color: 'indigo' },
          { label: 'Entitled Served', val: '98', icon: Footprints, color: 'emerald' },
          { label: 'Extra Meal Sold', val: '14', icon: Utensils, color: 'amber' },
          { label: 'Active POS Orders', val: '8', icon: ClipboardList, color: 'blue' },
          { label: 'Kitchen Load', val: '12', icon: ChefHat, color: 'rose' },
          { label: 'Stock Alerts', val: '3', icon: Package, color: 'slate' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-3xs space-y-2">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{stat.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-3">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                 <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                 <ArrowUpRight size={10} /> +18.5%
              </span>
           </div>
           <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Daily Net Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatAmount(14250)}</h3>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-3">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                 <Gift size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comp / Voids</span>
           </div>
           <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Total Adjustment Value</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatAmount(420)}</h3>
              <p className="text-[9px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                <XCircle size={10} /> 5 Voids today
              </p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-3">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
                 <AlertCircle size={24} />
              </div>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">ACTION NEEDED</span>
           </div>
           <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Stock Alerts</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">12 Items</h3>
              <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase">Below reorder levels</p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-3">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-inside">
                 <ClipboardList size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">LATEST CYCLE</span>
           </div>
           <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Lunch Occupancy</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">82%</h3>
              <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Peak expected at 13:30h</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Main Revenue Chart */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[40px] shadow-3xs space-y-6">
            <div className="flex justify-between items-center px-2">
               <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Trend Analysis</h4>
                  <p className="text-[10px] text-slate-400">Comparing past 7 days of total F&B settlements (Inclusive of Taxes)</p>
               </div>
               <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Weekly</span>
               </div>
            </div>
            
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                       dy={10}
                     />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                     />
                     <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Sales Mix Pie Chart */}
         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[40px] shadow-3xs space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight px-2">Category Mix Portfolio</h4>
            
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categoryMix}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                     >
                        {categoryMix.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                  <span className="text-[8px] font-mono text-slate-400 uppercase font-black">Sales Mix</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-2">
               {categoryMix.map((c, idx) => (
                 <div key={c.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[idx] }} />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400">{c.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 ml-auto">{c.value}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Selling Items */}
         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs space-y-6">
            <div>
               <h4 className="text-base font-black text-slate-900 dark:text-white">Best Selling Products</h4>
               <p className="text-xs text-slate-400 font-medium">Monthly volume breakdown by item category</p>
            </div>

            <div className="space-y-4">
               {topItems.map((item, idx) => (
                 <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/20" style={{ backgroundColor: item.color }}>
                          {item.value}
                       </div>
                       <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.name}</h5>
                          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{item.count} units sold</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] font-black font-mono flex items-center gap-1 justify-end ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.growth.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {item.growth}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Hourly Peaks */}
         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs space-y-6">
            <div>
               <h4 className="text-base font-black text-slate-900 dark:text-white">Traffic Density Patterns</h4>
               <p className="text-xs text-slate-400 font-medium">Identifying peak operational hours for staff allocation</p>
            </div>

            <div className="space-y-4 h-48 flex items-end justify-between px-2">
               {[40, 20, 15, 10, 25, 45, 85, 95, 70, 40, 30, 20].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full max-w-[12px] bg-indigo-50 dark:bg-slate-800 rounded-t-full relative overflow-hidden h-32">
                       <div 
                         className={`absolute bottom-0 left-0 w-full rounded-t-full transition-all duration-1000 group-hover:bg-amber-400 ${h > 80 ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                         style={{ height: `${h}%` }}
                       />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-400">{i * 2}h</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
