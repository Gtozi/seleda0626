import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Star,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Plus
} from 'lucide-react';

const SupplierManagement = () => {
  const suppliers = [
    { name: 'Premium Beverage Co.', code: 'SUP-FB-01', category: 'Food & Beverage', contact: 'Mark Evans', score: 4.8, status: 'Preferred', location: 'Dubai, UAE' },
    { name: 'Luxury Linen Services', code: 'SUP-HK-44', category: 'Housekeeping', contact: 'Sarah J.', score: 4.5, status: 'Active', location: 'London, UK' },
    { name: 'Global Energy Corp', code: 'SUP-UT-22', category: 'Utilities', contact: 'David W.', score: 4.9, status: 'Strategic', location: 'Texas, USA' },
    { name: 'Digital Media Hub', code: 'SUP-MK-99', category: 'Marketing', contact: 'Emma Stone', score: 3.8, status: 'Under Review', location: 'Berlin, Germany' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Suppliers', value: '42', sub: '+2 this month', icon: Users, color: 'text-indigo-600' },
          { label: 'Strategic Partners', value: '12', sub: 'Long-term contracts', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Avg Vendor Score', value: '4.4 / 5', sub: 'Performance Index', icon: Star, color: 'text-amber-600' },
          { label: 'Categories', value: '18', sub: 'Service coverage', icon: Filter, color: 'text-blue-600' },
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
        <div className="lg:col-span-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-2">
               <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Active Supplier Database</h3>
               </div>
               <div className="flex gap-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input 
                       type="text" 
                       placeholder="Search suppliers..." 
                       className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-64"
                     />
                  </div>
                  <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                     <Plus size={14} />
                     Add Supplier
                  </button>
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {suppliers.map((sup, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[40px] shadow-3xs hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                             <Award size={20} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{sup.name}</h4>
                             <span className="text-[10px] font-bold text-slate-400 font-mono italic">{sup.code}</span>
                          </div>
                       </div>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          sup.status === 'Preferred' ? 'bg-emerald-50 text-emerald-600' : 
                          sup.status === 'Strategic' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                       }`}>
                          {sup.status}
                       </span>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <MapPin size={12} className="text-slate-300" />
                          <span>{sup.location}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Mail size={12} className="text-slate-300" />
                          <span>{sup.contact.toLowerCase().replace(' ', '.')}@vendor.com</span>
                       </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-black text-slate-900 dark:text-white">{sup.score}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Perf. Score</span>
                       </div>
                       <button className="text-indigo-600 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition">
                          <ArrowRight size={16} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement;
