import React from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Scale,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  DollarSign,
  ChevronRight
} from 'lucide-react';

const InvoiceManagement = () => {
  const invoices = [
    { id: 'INV-VEN-402', supplier: 'Global Energy Corp', date: '2024-05-30', amount: 8200.00, status: 'Verified', poMatch: 'Success', grnMatch: 'Success', due: '2024-06-15' },
    { id: 'INV-VEN-401', supplier: 'Luxury Linen Services', date: '2024-05-28', amount: 4850.00, status: 'Pending Review', poMatch: 'Success', grnMatch: 'Partial', due: '2024-06-12' },
    { id: 'INV-VEN-400', supplier: 'Premium Beverage Co.', date: '2024-05-25', amount: 12420.00, status: 'Disputed', poMatch: 'Price Diff', grnMatch: 'Success', due: '2024-06-08' },
    { id: 'INV-VEN-399', supplier: 'Digital Media Hub', date: '2024-05-15', amount: 2500.00, status: 'Approved', poMatch: 'Success', grnMatch: 'N/A', due: '2024-05-30' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Invoices', value: '24', sub: '$142,500 total value', icon: Receipt, color: 'text-indigo-600' },
          { label: 'Verified (3-Way)', value: '18', sub: 'Ready for pay-run', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Matching Errors', value: '3', sub: 'Disputes active', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Avg processing', value: '2.4 Days', sub: 'Efficiency score', icon: Clock, color: 'text-blue-600' },
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

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Supplier Invoice Management</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Automated 3-way matching protocol (PO / GRN / INV)</p>
           </div>
           <div className="flex gap-2">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 transition hover:opacity-95">
                 <Plus size={14} />
                 Register Invoice
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document ID / Supplier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">3-Way Match</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Due Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Value</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sans">
            {invoices.map((inv, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Receipt size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{inv.id}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{inv.supplier}</span>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col items-center gap-1.5">
                      <div className="flex gap-1">
                         <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${inv.poMatch === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>PO</div>
                         <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${inv.grnMatch === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>GRN</div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Verification Matrix</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">{inv.due}</span>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs font-black text-slate-900 dark:text-white">${inv.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    inv.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 
                    inv.status === 'Approved' ? 'bg-indigo-50 text-indigo-600' : 
                    inv.status === 'Disputed' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                      <ChevronRight size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center px-10">
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black text-slate-400 uppercase">Ready for Payment</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500" />
                 <span className="text-[9px] font-black text-slate-400 uppercase">Verification Discrepancy</span>
              </div>
           </div>
           <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group">
              Full Invoice Ledger
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
