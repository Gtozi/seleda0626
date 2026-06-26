
import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  History,
  Activity,
  FileBarChart,
  X,
  CalendarDays,
  ListFilter,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { InventoryItem } from '../../types/inventory';

interface CountSheet {
  id: string;
  store: string;
  type: string;
  date: string;
  status: 'In Progress' | 'Completed' | 'Approved';
  items: number;
  variance: string;
}

const StockCountModule: React.FC = () => {
  const { inventoryItems, inventoryStores, updateInventoryItem, recordStockMovement } = useERP();

  const [countSheets, setCountSheets] = useState<CountSheet[]>([
    { id: 'CS-102', store: 'Main Store', type: 'Cycle Count', date: '2026-05-30', status: 'In Progress', items: 45, variance: 'TBD' },
    { id: 'CS-101', store: 'Kitchen Pantry', type: 'Full Count', date: '2026-05-28', status: 'Completed', items: 120, variance: '0.4%' },
    { id: 'CS-099', store: 'Bar Store South', type: 'Spot Count', date: '2026-05-25', status: 'Approved', items: 12, variance: '0%' },
  ]);

  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCountAnalysis, setShowCountAnalysis] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<CountSheet | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const storeItems = useMemo(() => {
    if (!selectedStore) return [];
    return inventoryItems.filter(i => i.location === selectedStore);
  }, [selectedStore, inventoryItems]);

  const openCountModal = () => {
    setSelectedStore(inventoryStores.length > 0 ? inventoryStores[0].name : 'Main Hotel Store');
    setCounts({});
    setShowCountModal(true);
  };

  const handleApplyCount = () => {
    const adjusted: { item: InventoryItem; variance: number }[] = [];
    storeItems.forEach(item => {
      const physicalCount = counts[item.id];
      if (physicalCount !== undefined) {
        const variance = physicalCount - item.currentStock;
        if (variance !== 0) {
          updateInventoryItem(item.id, { currentStock: physicalCount });
          recordStockMovement({
            date: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            type: 'Adjustment',
            quantity: variance,
            cost: item.avgCost,
            reference: `CS-${Date.now()}`,
            user: 'System',
            storeFrom: item.location
          });
          adjusted.push({ item, variance });
        }
      }
    });

    const totalValueVariance = adjusted.reduce((sum, a) => sum + (a.variance * a.item.avgCost), 0);
    const nextId = `CS-${String(countSheets.length + 1).padStart(3, '0')}`;
    setCountSheets(prev => [{
      id: nextId,
      store: selectedStore,
      type: 'Cycle Count',
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      items: storeItems.length,
      variance: totalValueVariance === 0 ? '0%' : `${(totalValueVariance >= 0 ? '+' : '')}$${Math.abs(totalValueVariance).toFixed(2)}`
    }, ...prev]);

    setShowCountModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Physical Stock Counting</h2>
           <p className="text-xs text-slate-400 font-medium">Variance analysis and physical auditing of digital ledger</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowHistoryModal(true)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <History size={16} />
              Count History
           </button>
           <button onClick={openCountModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
              <Plus size={16} />
              New Count Sheet
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-4">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white px-2">Active Count Operations</h3>
            {countSheets.map((sheet) => (
              <div key={sheet.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer">
                 <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{sheet.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                             sheet.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                             sheet.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                             'bg-slate-100 text-slate-500'
                          }`}>
                             {sheet.status}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-850 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-tight">{sheet.type}</span>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                             <ClipboardCheck size={20} />
                          </div>
                          <div>
                             <h4 className="text-base font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{sheet.store}</h4>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Initiated on {sheet.date}</span>
                          </div>
                       </div>
                    </div>

                    <div className="md:w-64 space-y-4 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Item Count</span>
                             <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{sheet.items}</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Variance</span>
                             <span className={`text-xl font-black leading-none ${sheet.variance === 'TBD' ? 'text-slate-300' : 'text-emerald-500'}`}>
                                {sheet.variance}
                             </span>
                          </div>
                       </div>
                       <button
                         onClick={() => { setSelectedSheet(sheet); setShowCountAnalysis(true); }}
                         className="w-full bg-emerald-600 text-white py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                       >
                          {sheet.status === 'In Progress' ? 'Resume Counting' : 'View Count Analysis'}
                          <ArrowUpRight size={14} />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6 text-white shadow-xl">
               <h3 className="text-sm font-sans font-extrabold flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" /> Audit Integrity Snapshot
               </h3>
               <div className="space-y-6">
                  {[
                    { label: 'Inventory Accuracy', val: 99.4, color: 'text-emerald-400', sub: 'Target: 99.5%' },
                    { label: 'Variance Value (MTD)', val: '-$140', color: 'text-rose-400', sub: 'Last 3 audits' },
                    { label: 'Last House Count', val: '2d ago', color: 'text-indigo-400', sub: 'Store: Kitchen' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-3">
                       <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">{s.label}</span>
                          <span className={`text-2xl font-black ${s.color}`}>{s.val}{typeof s.val === 'number' ? '%' : ''}</span>
                       </div>
                       <span className="text-[8px] font-bold text-white/30 uppercase tracking-tight">{s.sub}</span>
                    </div>
                  ))}
               </div>
               <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">
                    "High integrity detected in physical stock-take. No recurring thematic variance found in high-value beverage lines."
                  </p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Scheduled Cycle Counts</h3>
               <div className="space-y-3">
                  {[
                    { store: 'Bar Store South', date: 'Jun 02, 2026', scope: 'Spirits & Wine' },
                    { store: 'Main Store', date: 'Jun 05, 2026', scope: 'Dry Goods' },
                  ].map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl flex justify-between items-center group cursor-pointer border border-transparent hover:border-emerald-100 transition">
                       <div className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-emerald-500 shadow-3xs">
                             <Calendar size={12} />
                          </div>
                          <div>
                             <span className="block text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{c.store}</span>
                             <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{c.scope}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-500">{c.date}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <button
                 onClick={() => setShowCalendarModal(true)}
                 className="w-full mt-2 flex items-center justify-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:underline transition"
               >
                  <FileBarChart size={14} /> Full Audit Calendar
               </button>
            </div>
         </div>
      </div>

      {/* New Count Sheet Modal */}
      {showCountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">New Count Sheet</h3>
              <button onClick={() => setShowCountModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Store / Location</label>
              <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCounts({}); }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                {inventoryStores.map(s => <option key={s.id} value={s.name}>{s.name} ({s.type})</option>)}
                <option value="Main Hotel Store">Main Hotel Store</option>
              </select>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items in {selectedStore} ({storeItems.length})</h4>
              {storeItems.length === 0 && (
                <p className="text-xs text-slate-400 italic">No items assigned to this location.</p>
              )}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {storeItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">System: {item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight whitespace-nowrap">Physical:</span>
                      <input
                        type="number"
                        min={0}
                        value={counts[item.id] ?? ''}
                        onChange={e => setCounts(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                        className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-right outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder={String(item.currentStock)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCountModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Cancel</button>
              <button onClick={handleApplyCount} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">Apply Count & Adjust Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Count History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <ListFilter size={16} className="text-emerald-500" /> Count History Ledger
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {countSheets.map((sheet) => (
                <div key={sheet.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      sheet.status === 'Completed' ? 'bg-emerald-500' :
                      sheet.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{sheet.id} • {sheet.store}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sheet.type} • {sheet.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block text-[10px] font-black ${sheet.status === 'In Progress' ? 'text-indigo-500' : 'text-emerald-500'}`}>{sheet.status}</span>
                    <span className="text-[8px] font-black text-slate-400">{sheet.items} items • {sheet.variance} var</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowHistoryModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Count Analysis Modal */}
      {showCountAnalysis && selectedSheet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">Count Analysis</h3>
              <button onClick={() => setShowCountAnalysis(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Count Sheet ID</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono">{selectedSheet.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedSheet.store}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedSheet.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedSheet.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                   selectedSheet.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                   selectedSheet.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' :
                   'bg-slate-100 text-slate-500'
                }`}>{selectedSheet.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Counted</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{selectedSheet.items}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variance</span>
                <span className={`text-[10px] font-black ${selectedSheet.variance === 'TBD' ? 'text-slate-400' : 'text-emerald-500'}`}>{selectedSheet.variance}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCountAnalysis(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <CalendarDays size={16} className="text-emerald-500" /> Full Audit Calendar
              </h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { store: 'Bar Store South', date: 'Jun 02, 2026', scope: 'Spirits & Wine', status: 'Scheduled' },
                { store: 'Main Store', date: 'Jun 05, 2026', scope: 'Dry Goods', status: 'Scheduled' },
                { store: 'Kitchen Pantry', date: 'Jun 08, 2026', scope: 'Perishables', status: 'Pending Approval' },
                { store: 'Housekeeping Central', date: 'Jun 12, 2026', scope: 'Cleaning Supplies', status: 'Scheduled' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      c.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      <Calendar size={12} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{c.store}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{c.scope}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{c.date}</span>
                    <span className={`text-[8px] font-black uppercase tracking-tight ${
                      c.status === 'Scheduled' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Next mandatory full-house count scheduled for end of quarter. All departmental sub-stores must reconcile by Jun 30.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCalendarModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCountModule;
