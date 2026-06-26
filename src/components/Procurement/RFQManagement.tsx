import React from 'react';
import { 
  FileSearch, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Columns,
  ChevronRight,
  Users
} from 'lucide-react';

const RFQManagement = () => {
  const rfqs = [
    { id: 'RFQ-402', title: 'Luxury Linen Q2 Bulk Order', status: 'Bidding Open', responses: 5, date: '2024-05-28', closing: '2024-06-05' },
    { id: 'RFQ-401', title: 'Solar Panel Maintenance Contract', status: 'Evaluation', responses: 3, date: '2024-05-20', closing: '2024-05-30' },
    { id: 'RFQ-400', title: 'Kitchen Upgrade (Induction)', status: 'Closed', responses: 4, date: '2024-05-15', closing: '2024-05-25' },
  ];

  const comparisonMatrix = [
    { vendor: 'Premium Supplier A', price: 12400, delivery: '5 Days', terms: 'Net 30', score: 92 },
    { vendor: 'Global Vendor B', price: 11800, delivery: '14 Days', terms: 'Net 45', score: 84 },
    { vendor: 'Local Enterprise C', price: 13200, delivery: '2 Days', terms: 'Cash', score: 88 },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active RFQs', value: '8', sub: 'In market now', icon: FileSearch, color: 'text-indigo-600' },
          { label: 'Avg. Respondents', value: '4.2', sub: 'Per solicitation', icon: Users, color: 'text-emerald-600' },
          { label: 'Pending Evaluation', value: '3', sub: 'Needs technical review', icon: Clock, color: 'text-amber-600' },
          { label: 'Cost Avoidance', value: '14.2%', sub: 'Driven by bidding', icon: TrendingUp, color: 'text-blue-600' },
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
         {/* RFQ Registry */}
         <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Strategic Solicitation Catalog</h3>
               <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                  <Plus size={14} />
                  Initiate RFQ
               </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitation ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bids Received</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Closing Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {rfqs.map((rfq, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{rfq.id}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{rfq.title}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-black text-slate-900 dark:text-white">{rfq.responses}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase">
                       {rfq.closing}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             rfq.status === 'Bidding Open' ? 'bg-emerald-50 text-emerald-600' : 
                             rfq.status === 'Evaluation' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                          }`}>
                             {rfq.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                          <ArrowRight size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         {/* Comparison Matrix Highlights */}
         <div className="lg:col-span-12 space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight px-2">Active RFQ Comparison Matrix (Top Solicitation)</h3>
            <div className="grid md:grid-cols-3 gap-4">
               {comparisonMatrix.map((item, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight max-w-[150px]">{item.vendor}</h4>
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">${item.price.toLocaleString()}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Net Unit</span>
                       </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span className="uppercase">Delivery Window</span>
                          <span className="text-slate-900 dark:text-white">{item.delivery}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span className="uppercase">Financial Terms</span>
                          <span className="text-slate-900 dark:text-white">{item.terms}</span>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weighted Score</span>
                          <span className="text-[11px] font-black text-indigo-600">{item.score}/100</span>
                       </div>
                       <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${item.score}%` }} />
                       </div>
                    </div>
                    
                    <button className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 translate-y-12 group-hover:translate-y-0 transition-transform">
                       <CheckCircle2 size={16} />
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default RFQManagement;
