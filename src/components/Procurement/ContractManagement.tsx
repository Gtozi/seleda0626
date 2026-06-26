import React from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Lock
} from 'lucide-react';

const ContractManagement = () => {
  const contracts = [
    { id: 'CTR-2024-001', supplier: 'Premium Beverage Co.', type: 'Master Service Agreement', end: '2025-05-28', value: 84000.00, status: 'Active', renewal: 'In 11 Months' },
    { id: 'CTR-2024-042', supplier: 'Luxury Linen Services', type: 'Framework Contract', end: '2024-06-30', value: 32000.00, status: 'Expiring Soon', renewal: '30 Days' },
    { id: 'CTR-2024-009', supplier: 'Global Energy Corp', type: 'Fixed Rate Tariff', end: '2026-12-15', value: 124000.00, status: 'Active', renewal: 'In 2 Years' },
    { id: 'CTR-2023-088', supplier: 'Digital Media Hub', type: 'Retainer Agreement', end: '2024-05-15', value: 12000.00, status: 'Under Renewal', renewal: 'Passed' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active Contracts', value: '18', sub: '$482,500 commitment', icon: FileCheck, color: 'text-indigo-600' },
          { label: 'Expiring 60 Days', value: '4', sub: 'Action required', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Audit Compliance', value: '100%', sub: 'No missing documentation', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Renewal Queue', value: '2', sub: 'In negotiation', icon: Clock, color: 'text-amber-600' },
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
         {/* Contract Library */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Strategic Vendor Agreements</h3>
               <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 transition hover:opacity-95">
                  <Plus size={14} />
                  Execute New Contract
               </button>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-50 dark:border-slate-800">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search master agreements..." 
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-bold"
                  />
               </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 dark:bg-slate-950/40">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agreement / Supplier</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Expiry</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sans">
                {contracts.map((ctr, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 transition-colors">
                             <FileText size={16} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{ctr.supplier}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase">{ctr.type}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{ctr.end}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${ctr.renewal === '30 Days' || ctr.renewal === 'Passed' ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{ctr.renewal}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          ctr.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                          ctr.status === 'Expiring Soon' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                          {ctr.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs font-black text-slate-900 dark:text-white">${ctr.value.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         {/* Compliance & Storage */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white">
               <Lock className="mb-4 opacity-50" size={24} />
               <h3 className="text-sm font-black uppercase tracking-tight mb-2">Legal Vault</h3>
               <p className="text-[10px] text-indigo-100 font-medium mb-6 leading-relaxed uppercase tracking-wider">Secure storage for certified supplier licenses and bilateral agreements.</p>
               <div className="space-y-2">
                  {[
                    { name: 'VAT Certificate.pdf', size: '1.2 MB' },
                    { name: 'ISO 9001 Compliance.pdf', size: '2.4 MB' },
                    { name: 'Trade License 2024.pdf', size: '0.8 MB' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer text-[10px]">
                       <span className="font-bold">{doc.name}</span>
                       <Download size={12} className="opacity-60" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Expiry Alerts</h3>
               <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-[24px] bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                     <AlertCircle className="text-rose-500 shrink-0" size={18} />
                     <div>
                        <h4 className="text-[10px] font-black text-rose-900 dark:text-rose-400 uppercase tracking-tight">Contract CTR-88 Expiring</h4>
                        <p className="text-[9px] text-rose-700 dark:text-rose-300 font-medium mt-1 leading-tight">Digital Media Hub retainer ends in 12 hours. Renegotiation required.</p>
                     </div>
                  </div>
                  <button className="w-full py-3 border border-slate-100 dark:border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition">
                     Manage All Alerts
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ContractManagement;
