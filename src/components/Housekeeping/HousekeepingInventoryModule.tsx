/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Truck,
  ClipboardList,
  History,
  Archive,
  ArrowRight
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Consumables' | 'Chemicals' | 'Guest Amenities' | 'Cleaning Tools';
  unit: string;
  stockInHand: number;
  reorderLevel: number;
  price: number;
  lastRestock: string;
}

export default function HousekeepingInventoryModule() {
  const { formatAmount, addNotification } = useERP();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'HK-INV-001', name: 'Bath Soap (Eco-friendly)', category: 'Guest Amenities', unit: 'pcs', stockInHand: 450, reorderLevel: 100, price: 0.85, lastRestock: '2026-05-25' },
    { id: 'HK-INV-002', name: 'Luxury Shampoo (50ml)', category: 'Guest Amenities', unit: 'pcs', stockInHand: 80, reorderLevel: 120, price: 1.20, lastRestock: '2026-05-24' },
    { id: 'HK-INV-003', name: 'Multi-Surface Cleaner', category: 'Chemicals', unit: 'Liters', stockInHand: 45, reorderLevel: 15, price: 5.50, lastRestock: '2026-05-20' },
    { id: 'HK-INV-004', name: 'Premium Toilet Tissue', category: 'Consumables', unit: 'Rolls', stockInHand: 280, reorderLevel: 80, price: 0.40, lastRestock: '2026-05-28' },
    { id: 'HK-INV-005', name: 'Microfiber Cleaning Cloths', category: 'Cleaning Tools', unit: 'pcs', stockInHand: 60, reorderLevel: 20, price: 2.10, lastRestock: '2026-04-15' },
    { id: 'HK-INV-006', name: 'Premium King Bedsheet', category: 'Consumables', unit: 'pcs', stockInHand: 412, reorderLevel: 50, price: 30.00, lastRestock: '2026-05-10' },
    { id: 'HK-INV-007', name: 'Egyptian Bath Towel', category: 'Consumables', unit: 'pcs', stockInHand: 495, reorderLevel: 100, price: 15.00, lastRestock: '2026-05-15' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Issue Console State
  const [selectedStaff, setSelectedStaff] = useState('Staff Member A');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [issueQty, setIssueQty] = useState(1);
  const [history, setHistory] = useState([
    { type: 'Issue', item: 'Shampoo (50ml)', qty: 40, to: 'Shift Cart A', time: '10:45 AM' },
    { type: 'Receive', item: 'Toilet Tissue', qty: 200, to: 'Main Store', time: '09:30 AM' },
    { type: 'Issue', item: 'Garbage Bags', qty: 10, to: 'Shift Cart B', time: '08:15 AM' },
  ]);

  const handleIssueItem = () => {
    if (!selectedItemId || issueQty <= 0) {
      addNotification('Please select an item and valid quantity.', 'error', 'Inventory');
      return;
    }

    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    if (item.stockInHand < issueQty) {
      addNotification(`Insufficient stock for ${item.name}.`, 'error', 'Inventory');
      return;
    }

    // Update inventory
    setInventory(prev => prev.map(i => 
      i.id === selectedItemId 
        ? { ...i, stockInHand: i.stockInHand - issueQty }
        : i
    ));

    // Update history
    const newLog = {
      type: 'Issue' as const,
      item: item.name,
      qty: issueQty,
      to: `${selectedStaff}'s Cart`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory(prev => [newLog, ...prev]);

    addNotification(`Successfully issued ${issueQty} ${item.unit} of ${item.name} to ${selectedStaff}.`, 'success', 'Inventory');
    
    // Reset selection
    setSelectedItemId('');
    setIssueQty(1);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Consumables', 'Chemicals', 'Guest Amenities', 'Cleaning Tools'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Housekeeping Central Store & Linen</h2>
          <p className="text-xs text-slate-500 font-mono italic">Manage guest amenities, cleaning chemicals, linen inventory, and operational consumables.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight shadow-lg hover:bg-slate-800 transition-all">
            <Truck size={14} /> Request from Main Store
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 overflow-x-auto max-w-full scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                    activeCategory === cat 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-3xs">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 border-b dark:border-slate-800">
                  <th className="px-6">Item Description</th>
                  <th className="px-6">Category</th>
                  <th className="px-6 text-center">Stock</th>
                  <th className="px-6 text-center">Reorder</th>
                  <th className="px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredInventory.map(item => {
                  const isLow = item.stockInHand <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors h-14">
                      <td className="px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{item.name}</span>
                          <span className="text-[9px] font-mono text-slate-400">{item.id}</span>
                        </div>
                      </td>
                      <td className="px-6">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 text-center">
                        <span className={`text-xs font-black font-mono ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {item.stockInHand} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 text-center">
                        <span className="text-[11px] font-bold text-slate-400 font-mono italic">
                          {item.reorderLevel} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 text-right">
                        <div className="flex justify-end gap-2">
                          {isLow ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase ring-1 ring-rose-200">
                               <AlertCircle size={10} /> Critical Low
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase ring-1 ring-emerald-200">
                               Satisfactory
                            </div>
                          )}
                          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <ClipboardList size={22} className="text-white" />
                </div>
                <div className="flex flex-col items-end">
                   <h4 className="text-2xl font-black tabular-nums">12</h4>
                   <p className="text-[10px] font-mono text-slate-450 uppercase font-black">Issue Vouchers Today</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Staff Issue Console</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">Fast-track inventory distribution to cleaning staff shift carts.</p>
              </div>
              <div className="space-y-4 pt-2">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Select Staff Member</label>
                    <select 
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-white/20 text-slate-300 [&>option]:text-slate-900"
                    >
                      <option>Staff Member A</option>
                      <option>Staff Member B</option>
                      <option>Staff Member C</option>
                      <option>Staff Member D</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Select Item to Issue</label>
                    <select 
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-white/20 text-slate-300 [&>option]:text-slate-900"
                    >
                      <option value="">Choose item...</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.stockInHand} available)</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Quantity</label>
                    <input 
                      type="number"
                      min="1"
                      value={issueQty}
                      onChange={(e) => setIssueQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-white/20 text-slate-300"
                    />
                 </div>
                 <button 
                  onClick={handleIssueItem}
                  className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all mt-2"
                 >
                    Generate Issue Slip
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-3xs space-y-4">
            <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                 <History size={18} />
              </div>
              <div>
                 <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Movement History</h4>
                 <p className="text-[9px] text-slate-400 font-mono">Recent stock card entries.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {history.map((log, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${log.type === 'Issue' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {log.type === 'Issue' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{log.item}</p>
                      <p className="text-[9px] text-slate-400 font-mono">{log.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[11px] font-black ${log.type === 'Issue' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      {log.type === 'Issue' ? '-' : '+'}{log.qty}
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-center py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
               View Full Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
