import React, { useState } from 'react';
import {
  Package, Search, Filter, Plus, ArrowDown, ArrowUp,
  AlertTriangle, CheckCircle2, Box, Wrench, Zap, Droplets,
  MoreVertical, Download, Upload, Barcode, Clock
} from 'lucide-react';

interface SparePart {
  id: string;
  code: string;
  name: string;
  category: 'Motors' | 'Filters' | 'Pumps' | 'Bearings' | 'Switches' | 'Belts' | 'Valves' | 'Lamps' | 'Batteries' | 'Fuses';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  location: string;
  supplier: string;
  lastReorderDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
}

interface Transaction {
  id: string;
  partId: string;
  partName: string;
  type: 'Reserve' | 'Issue' | 'Return' | 'Consumption';
  quantity: number;
  date: string;
  workOrder?: string;
  technician?: string;
  notes?: string;
}

const SparePartsInterface: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([
    {
      id: 'SP-001',
      code: 'MTR-001',
      name: 'AC Motor 1HP',
      category: 'Motors',
      currentStock: 3,
      minStock: 2,
      maxStock: 5,
      unit: 'pcs',
      unitCost: 250,
      location: 'Shelf A-12',
      supplier: 'ElectroSupply Ltd',
      lastReorderDate: '2026-06-15',
      status: 'In Stock',
    },
    {
      id: 'SP-002',
      code: 'FLT-001',
      name: 'HEPA Filter 20x20',
      category: 'Filters',
      currentStock: 1,
      minStock: 5,
      maxStock: 15,
      unit: 'pcs',
      unitCost: 45,
      location: 'Shelf B-03',
      supplier: 'FilterTech Inc',
      lastReorderDate: '2026-07-10',
      status: 'Low Stock',
    },
    {
      id: 'SP-003',
      code: 'PMP-001',
      name: 'Water Pump 0.5HP',
      category: 'Pumps',
      currentStock: 0,
      minStock: 2,
      maxStock: 4,
      unit: 'pcs',
      unitCost: 180,
      location: 'Shelf C-08',
      supplier: 'PumpMaster',
      lastReorderDate: '2026-07-20',
      status: 'Out of Stock',
    },
    {
      id: 'SP-004',
      code: 'BRG-001',
      name: 'Ball Bearing 6205',
      category: 'Bearings',
      currentStock: 25,
      minStock: 10,
      maxStock: 20,
      unit: 'pcs',
      unitCost: 15,
      location: 'Shelf A-05',
      supplier: 'BearingWorld',
      lastReorderDate: '2026-06-01',
      status: 'Overstocked',
    },
    {
      id: 'SP-005',
      code: 'SWT-001',
      name: 'Pressure Switch',
      category: 'Switches',
      currentStock: 8,
      minStock: 3,
      maxStock: 10,
      unit: 'pcs',
      unitCost: 35,
      location: 'Shelf D-02',
      supplier: 'SwitchPro',
      status: 'In Stock',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-001',
      partId: 'SP-001',
      partName: 'AC Motor 1HP',
      type: 'Issue',
      quantity: 1,
      date: '2026-07-29 10:30',
      workOrder: 'WO-2026-001',
      technician: 'John Electrician',
      notes: 'For chiller unit repair',
    },
    {
      id: 'TX-002',
      partId: 'SP-002',
      partName: 'HEPA Filter 20x20',
      type: 'Consumption',
      quantity: 2,
      date: '2026-07-29 09:15',
      workOrder: 'WO-2026-002',
      technician: 'Maria HVAC',
      notes: 'Regular filter replacement',
    },
    {
      id: 'TX-003',
      partId: 'SP-004',
      partName: 'Ball Bearing 6205',
      type: 'Reserve',
      quantity: 5,
      date: '2026-07-28 14:00',
      workOrder: 'WO-2026-003',
      technician: 'Carlos Mechanic',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const categories = ['All', 'Motors', 'Filters', 'Pumps', 'Bearings', 'Switches', 'Belts', 'Valves', 'Lamps', 'Batteries', 'Fuses'];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-500';
      case 'Low Stock': return 'bg-amber-500';
      case 'Out of Stock': return 'bg-rose-500';
      case 'Overstocked': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Low Stock': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Out of Stock': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Overstocked': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Reserve': return 'bg-blue-50 text-blue-700';
      case 'Issue': return 'bg-amber-50 text-amber-700';
      case 'Return': return 'bg-emerald-50 text-emerald-700';
      case 'Consumption': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const filteredParts = parts.filter(part => {
    if (activeCategory !== 'All' && part.category !== activeCategory) return false;
    if (activeStatus !== 'All' && part.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Spare Parts Interface</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Reserve, issue, return, and consumption recording</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            Add Part
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeCategory === category
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeStatus === status
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Package size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{parts.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Parts</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reorder Required</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{parts.filter(p => p.status === 'In Stock').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <Box size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">${parts.reduce((acc, p) => acc + (p.currentStock * p.unitCost), 0).toLocaleString()}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Value</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parts List */}
        <div className="lg:col-span-8 space-y-4">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{part.code}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(part.status)}`}>
                      {part.status}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                      {part.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{part.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-500">{part.supplier}</span>
                      <span className="text-[10px] font-bold text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-slate-500">{part.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Current Stock</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{part.currentStock} {part.unit}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Min Stock</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{part.minStock} {part.unit}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Unit Cost</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${part.unitCost}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Value</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${(part.currentStock * part.unitCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition" title="Reserve">
                      <ArrowDown size={16} />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition" title="Issue">
                      <ArrowUp size={16} />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition" title="Return">
                      <CheckCircle2 size={16} />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition" title="More">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Recent Transactions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Common operations</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <ArrowDown size={16} className="text-blue-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Reserve Parts</span>
                  <span className="text-[8px] text-slate-400 font-medium">Reserve for work order</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <ArrowUp size={16} className="text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Issue Parts</span>
                  <span className="text-[8px] text-slate-400 font-medium">Issue to technician</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Return Parts</span>
                  <span className="text-[8px] text-slate-400 font-medium">Return unused parts</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Recent Transactions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Latest movements</p>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${getTransactionTypeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                    <span className="text-[9px] font-black text-slate-400">{tx.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{tx.partName}</span>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{tx.quantity} {tx.type === 'Return' ? '+' : '-'}</span>
                  </div>
                  {tx.workOrder && (
                    <span className="text-[8px] font-bold text-slate-400">{tx.workOrder}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartsInterface;
