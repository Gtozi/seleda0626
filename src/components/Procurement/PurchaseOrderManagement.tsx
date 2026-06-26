import React from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Calendar,
  Truck,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const PurchaseOrderManagement = () => {
  const purchaseOrders = [
    { id: 'PO-2024-88', supplier: 'Premium Beverage Co.', date: '2024-05-28', deliveryDate: '2024-06-05', total: 12420.00, status: 'Sent to Supplier', items: 8, priority: 'High' },
    { id: 'PO-2024-87', supplier: 'Luxury Linen Services', date: '2024-05-25', deliveryDate: '2024-06-01', total: 4850.00, status: 'Partially Received', items: 5, priority: 'Normal' },
    { id: 'PO-2024-86', supplier: 'Global Energy Corp', date: '2024-05-20', deliveryDate: '2024-05-25', total: 8200.00, status: 'Fully Received', items: 1, priority: 'Normal' },
    { id: 'PO-2024-85', supplier: 'Digital Media Hub', date: '2024-05-18', deliveryDate: '2024-06-15', total: 2500.00, status: 'Draft', items: 3, priority: 'Low' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active POs', value: '84', sub: 'Awaiting delivery', icon: ShoppingCart, color: 'text-indigo-600' },
          { label: 'Total PO Value', value: '$242,500', sub: 'M-TD Issued', icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Awaiting Receipt', value: '12', sub: 'High priority items', icon: Truck, color: 'text-amber-600' },
          { label: 'Avg Lead Time', value: '5.2 Days', sub: '-1.2 from average', icon: Clock, color: 'text-blue-600' },
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
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Purchase Order Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Official supplier procurement bindings</p>
           </div>
           <div className="flex gap-2">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-slate-200">
                 <Plus size={14} />
                 New Purchase Order
              </button>
           </div>
        </div>
        
        {/* PO Filters */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex gap-4 overflow-x-auto no-scrollbar">
           {['All POs', 'Draft', 'Approved', 'Sent', 'Partially Received', 'Completed'].map((tab, i) => (
             <button key={i} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight whitespace-nowrap transition ${i === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab}
             </button>
           ))}
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/20 dark:bg-slate-950/40">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID / Supplier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {purchaseOrders.map((po, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{po.id}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">{po.supplier}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{po.date}</span>
                     <span className="text-[9px] font-medium text-slate-400">Exp. Delivery: {po.deliveryDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                     <span className="text-[10px] font-black text-slate-600">{po.items}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                  ${po.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    po.status === 'Fully Received' ? 'bg-emerald-50 text-emerald-600' : 
                    po.status === 'Partially Received' ? 'bg-blue-50 text-blue-600' : 
                    po.status === 'Sent to Supplier' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Print PO">
                         <Download size={14} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                         <MoreVertical size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;
