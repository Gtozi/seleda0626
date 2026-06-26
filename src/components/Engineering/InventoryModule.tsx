
import React, { useState } from 'react';
import { 
  Box, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  RotateCcw,
  Hammer,
  Wrench,
  ShoppingBag,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { SparePart } from '../../types/engineering';

const InventoryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parts' | 'tools' | 'requisitions'>('parts');

  const [parts, setParts] = useState<SparePart[]>([
    { id: 'P-001', name: 'MCB 10A Single Pole', category: 'Electrical', currentStock: 25, minStock: 10, reorderLevel: 15, unitCost: 4.5, unit: 'Pcs' },
    { id: 'P-002', name: 'Gate Valve 1/2"', category: 'Plumbing', currentStock: 8, minStock: 10, reorderLevel: 12, unitCost: 12.0, unit: 'Pcs' },
    { id: 'P-003', name: 'R410A Refrigerant Gas', category: 'HVAC', currentStock: 4, minStock: 2, reorderLevel: 3, unitCost: 85.0, unit: 'Cylinder' },
    { id: 'P-004', name: 'LED Bulb 9W (Warm White)', category: 'Electrical', currentStock: 120, minStock: 50, reorderLevel: 80, unitCost: 2.5, unit: 'Pcs' },
    { id: 'P-005', name: 'Gen-Air Filter G1', category: 'Generator', currentStock: 2, minStock: 2, reorderLevel: 2, unitCost: 45.0, unit: 'Pcs' },
  ]);

  const [tools, setTools] = useState([
    { id: 'T-001', name: 'Fluke Multimeter', assignedTo: 'Elena R.', status: 'Issued', condition: 'Perfect' },
    { id: 'T-002', name: 'Makita Drill Kit', assignedTo: '-', status: 'Available', condition: 'Good' },
    { id: 'T-003', name: 'Pressure Gauge Set', assignedTo: 'Carlos M.', status: 'Issued', condition: 'Fair' },
    { id: 'T-004', name: 'Heat Gun (Professional)', assignedTo: '-', status: 'Available', condition: 'Perfect' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Engineering Inventory & Store</h2>
           <p className="text-xs text-slate-400 font-medium">Tracking {parts.length} specialized spare parts and technician tools</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <ClipboardList size={16} />
              Reorder Report
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <Plus size={16} />
              Receive Stock
           </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {[
          { id: 'parts', label: 'Spare Parts', icon: Box },
          { id: 'tools', label: 'Technician Tools', icon: Hammer },
          { id: 'requisitions', label: 'Issuance & Requisitions', icon: ArrowUpRight },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'parts' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Stock Value', value: '$12,450', sub: 'Calculated at FIFO', color: 'indigo' },
                { label: 'Critical Items', value: 4, sub: 'Below Min Stock', color: 'rose' },
                { label: 'Pending Orders', value: 2, sub: 'With Procurement', color: 'amber' },
                { label: 'Recent Issuances', value: 18, sub: 'Last 24 Hours', color: 'emerald' },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 border border-slate-150 dark:border-slate-800 rounded-3xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                   <div className="flex items-end gap-2">
                      <span className={`text-2xl font-black text-${s.color}-500`}>{s.value}</span>
                      <span className="text-[9px] text-slate-400 font-bold mb-1.5">{s.sub}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                       <th className="px-6 py-4">Part Details</th>
                       <th className="px-6 py-4">Category</th>
                       <th className="px-6 py-4 text-center">Stock Level</th>
                       <th className="px-6 py-4 text-right">Unit Price</th>
                       <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parts.map((p) => (
                       <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group">
                          <td className="px-6 py-4">
                             <div>
                                <span className="block text-xs font-black text-slate-900 dark:text-white leading-tight">{p.name}</span>
                                <span className="text-[9px] font-mono text-slate-400 font-bold">{p.id}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-tight">{p.category}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 w-32">
                                   <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${p.currentStock <= p.minStock ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${Math.min(100, (p.currentStock / p.reorderLevel) * 100)}%` }} 
                                      />
                                   </div>
                                   <span className={`text-[10px] font-black ${p.currentStock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                      {p.currentStock} {p.unit}
                                   </span>
                                </div>
                                {p.currentStock <= p.minStock && (
                                  <span className="text-[8px] font-black text-rose-500 flex items-center gap-1 animate-pulse">
                                     <AlertCircle size={8} /> CRITICAL STOCK
                                  </span>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="text-xs font-mono font-black text-slate-900 dark:text-white">${p.unitCost.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition" title="Issue Part">
                                   <ArrowUpRight size={16} />
                                </button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition">
                                   <MoreVertical size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'tools' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
               <div key={tool.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-400 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <Hammer size={20} />
                     </div>
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                        tool.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                     }`}>
                        {tool.status}
                     </span>
                  </div>
                  
                  <div className="space-y-1 mb-6">
                     <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{tool.id}</span>
                     <h3 className="font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{tool.name}</h3>
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        Assigned To: <span className="text-slate-900 dark:text-slate-200">{tool.assignedTo}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-850">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Condition</span>
                        <span className="block text-[10px] font-black text-indigo-500 uppercase">{tool.condition}</span>
                     </div>
                     <button className={`p-2 rounded-xl transition ${tool.status === 'Available' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {tool.status === 'Available' ? <ArrowUpRight size={14} /> : <RotateCcw size={14} />}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default InventoryModule;
