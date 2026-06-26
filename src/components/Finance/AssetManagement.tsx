import React from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Zap, 
  Settings, 
  TrendingDown, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowUpRight
} from 'lucide-react';

const AssetManagement = () => {
  const assets = [
    { name: 'HVAC System - North Wing', id: 'AST-ME-402', value: 124500, life: '12 Years', dep: 8400, condition: 'Excellent' },
    { name: 'Commercial Kitchen Suite', id: 'AST-KT-108', value: 82000, life: '8 Years', dep: 12000, condition: 'Good' },
    { name: 'Fleet vehicle: Guest Shuttle', id: 'AST-VH-66', value: 45000, life: '5 Years', dep: 9000, condition: 'Watch' },
    { name: 'Network Infrastructure', id: 'AST-IT-901', value: 38000, life: '3 Years', dep: 12600, condition: 'Critical' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Asset Value', value: '$842,500', sub: 'Gross Book Value', icon: Building2, color: 'text-indigo-600' },
          { label: 'Accumulated Dep.', value: '$214,200', sub: 'Fiscal Year 2024', icon: TrendingDown, color: 'text-rose-600' },
          { label: 'Maintenance Score', value: '94/100', sub: 'Health Index', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Replacement Fund', value: '$128k', sub: 'Escrow Reserve', icon: Zap, color: 'text-amber-600' },
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

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-3xs">
         <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Fixed Asset Register</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Capitalized Asset Inventory & Valuation</p>
            </div>
            <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition">
                  <Plus size={14} />
                  Capitalize Asset
               </button>
               <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition">
                  <Filter size={18} />
               </button>
            </div>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Description</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Expectancy</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Value</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ann. Deprec.</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
               {assets.map((asset, i) => (
                 <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{asset.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{asset.id}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <History size={12} className="text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">{asset.life}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-slate-900 dark:text-white">${asset.value.toLocaleString()}</td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-rose-500 font-mono">-${asset.dep.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             asset.condition === 'Excellent' || asset.condition === 'Good' ? 'bg-emerald-50 text-emerald-600' : 
                             asset.condition === 'Watch' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                             {asset.condition}
                          </span>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="p-6 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center">
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Operational Assets</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Maintenance Required</span>
               </div>
            </div>
            <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group">
               Full Depreciation Schedule
               <ArrowUpRight size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default AssetManagement;
