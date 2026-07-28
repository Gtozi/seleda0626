
import React, { useState } from 'react';
import {
  Store,
  ArrowLeftRight,
  MapPin,
  User,
  Activity,
  ArrowRight,
  Plus,
  Box,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  X,
  Package,
  Tag
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';

const StoreManagement: React.FC = () => {
  const { inventoryStores: stores, addInventoryStore, inventoryItems: items, updateInventoryItem, recordStockMovement } = useERP();

  const [activeTab, setActiveTab] = useState<'stores' | 'transfers'>('stores');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStoreDetail, setShowStoreDetail] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showTransferDetail, setShowTransferDetail] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<typeof recentTransfers[0] | null>(null);

  // Transfer form state
  const [transferSource, setTransferSource] = useState('');
  const [transferDest, setTransferDest] = useState('');
  const [transferQtyMap, setTransferQtyMap] = useState<Record<string, number>>({});

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState<'Main' | 'Departmental' | 'Virtual'>('Departmental');
  const [newStoreManager, setNewStoreManager] = useState('');

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreManager.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    addInventoryStore({
      name: newStoreName,
      type: newStoreType,
      manager: newStoreManager
    });
    setNewStoreName('');
    setNewStoreManager('');
    setShowAddModal(false);
  };

  const getStoreStockCount = (storeName: string) => {
    return items.filter(item => item.location === storeName).length;
  };

  // Derive transfer history from actual stock movements
  const transferMovements = items.length > 0
    ? (() => {
        const allMoves: { id: string; from: string; to: string; date: string; items: number; status: string }[] = [];
        const seen = new Set<string>();
        // Group movements by a rough transfer batch (same minute + same stores)
        const moves = [...items].flatMap(item =>
          item.id ? [] : [] // placeholder; we derive from stockMovements instead
        );
        return moves;
      })()
    : [];

  // Actually derive from context stockMovements if exposed; since it isn't directly here,
  // we will use a local state for recent transfers that gets appended on submit.
  const [recentTransfers, setRecentTransfers] = useState([
    { id: 'TR-2045', from: 'Main Store', to: 'Bar Store South', date: 'Today, 10:30 AM', status: 'Completed', items: 4 },
    { id: 'TR-2046', from: 'Main Store', to: 'Kitchen Pantry', date: 'Yesterday', status: 'In Transit', items: 12 },
    { id: 'TR-2047', from: 'Housekeeping Central', to: 'Main Store', date: '2 days ago', status: 'Approved', items: 2 },
  ]);

  const sourceItems = items.filter(i => i.location === transferSource);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSource || !transferDest || transferSource === transferDest) return;

    let transferredCount = 0;
    Object.entries(transferQtyMap).forEach(([itemId, qtyValue]) => {
      const qty = Number(qtyValue);
      if (qty > 0) {
        const item = items.find(i => i.id === itemId);
        if (item && item.location === transferSource) {
          const newStock = Math.max(0, item.currentStock - qty);
          const updates: Partial<typeof item> = { currentStock: newStock };
          if (newStock === 0) updates.location = transferDest;
          updateInventoryItem(itemId, updates);
          recordStockMovement({
            date: new Date().toISOString(),
            itemId,
            itemName: item.name,
            type: 'Transfer',
            quantity: -qty,
            cost: item.avgCost,
            reference: `TR-${Date.now()}`,
            user: 'System',
            storeFrom: transferSource,
            storeTo: transferDest
          });
          transferredCount++;
        }
      }
    });

    if (transferredCount > 0) {
      setRecentTransfers(prev => [{
        id: `TR-${Date.now()}`,
        from: transferSource,
        to: transferDest,
        date: new Date().toLocaleString(),
        status: 'Completed',
        items: transferredCount
      }, ...prev]);
      setTransferQtyMap({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Virtual Multi-Store Structure</h2>
           <p className="text-xs text-slate-400 font-medium">Monitoring inventory across {stores.length} location nodes</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setActiveTab('transfers')}
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200"
           >
              <ArrowLeftRight size={16} />
              New Store Transfer
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200 dark:shadow-none"
           >
              <Plus size={16} />
              Add Physical Store
           </button>
        </div>
      </div>

      <ModalSystem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Warehouse Node"
        subtitle="Add a physical, departmental or virtual storage terminal."
        variant="form"
        size="md"
        showFooter={false}
      >
              <form onSubmit={handleCreateStore} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Store Unique Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Front Office Stationary" 
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Terminal Node Type</label>
                    <select 
                      value={newStoreType}
                      onChange={(e: any) => setNewStoreType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                       <option value="Main">Main Store (Mother Node)</option>
                       <option value="Departmental">Departmental Sub-store</option>
                       <option value="Virtual">Virtual / Virtual Staging</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Warehouse Overseer / Manager</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kidane Zewdu" 
                      value={newStoreManager}
                      onChange={(e) => setNewStoreManager(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                 </div>
                 <div className="pt-2 flex items-center justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                    >
                      Establish Store Group
                    </button>
                 </div>
              </form>
      </ModalSystem>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl no-scrollbar gap-1.5">
        {[
          { id: 'stores', label: 'Lodge Stocks', icon: Store },
          { id: 'transfers', label: 'Inter-Store Transfers', icon: ArrowLeftRight },
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

      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {stores.map((store) => {
              const itemsCount = getStoreStockCount(store.name);
              return (
                <div key={store.id} className="bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700 rounded-3xl p-6 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer dark:shadow-slate-900/20">
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                         <Store size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                         <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight ${
                           store.type === 'Main' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                         }`}>
                           {store.type} Store
                         </span>
                         <span className="text-[9px] font-sans font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                           {itemsCount} Unique SKU
                         </span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{store.id}</span>
                         <h3 className="text-base font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{store.name}</h3>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <User size={12} className="text-emerald-500" />
                            {store.manager}
                         </div>
                         <button
                           onClick={() => { setSelectedStore(store.name); setShowStoreDetail(true); }}
                           className="p-2 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-emerald-500 transition rounded-xl"
                         >
                            <ChevronRight size={16} />
                         </button>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8 space-y-4">
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white px-2">Store-to-Store Logistics History</h3>
              {recentTransfers.map((tr) => (
                <div key={tr.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs flex flex-col md:flex-row justify-between gap-6 hover:border-indigo-200 transition-all">
                   <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest leading-none">{tr.id}</span>
                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                            tr.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                            tr.status === 'In Transit' ? 'bg-blue-50 text-blue-600 animate-pulse' :
                            'bg-amber-50 text-amber-600'
                         }`}>
                            {tr.status}
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className="flex-1">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Source Store</span>
                            <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{tr.from}</span>
                         </div>
                         <ArrowRight size={14} className="text-slate-300" />
                         <div className="flex-1">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination Store</span>
                            <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{tr.to}</span>
                         </div>
                      </div>
                   </div>

                   <div className="md:w-48 space-y-3 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                         <Clock size={12} className="text-indigo-400" />
                         {tr.date}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                         <Box size={12} className="text-amber-500" />
                         {tr.items} Unique Item SKU
                      </div>
                      <button
                        onClick={() => { setSelectedTransfer(tr); setShowTransferDetail(true); }}
                        className="w-full bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500"
                      >
                         View Details
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6 text-white shadow-xl">
                 <div>
                    <h3 className="text-sm font-sans font-extrabold leading-tight">Stock Transfer Dispatch</h3>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">Internal location balancing</p>
                 </div>
                 
                 <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Source store</label>
                       <select value={transferSource} onChange={e => { setTransferSource(e.target.value); setTransferQtyMap({}); }} className="w-full bg-white/5 border-none rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                          <option value="" className="bg-slate-900">Select source...</option>
                          {stores.map(s => <option key={s.id} value={s.name} className="bg-slate-900">{s.name}</option>)}
                          <option value="Main Hotel Store" className="bg-slate-900">Main Hotel Store</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target store</label>
                       <select value={transferDest} onChange={e => setTransferDest(e.target.value)} className="w-full bg-white/5 border-none rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                          <option value="" className="bg-slate-900">Select destination...</option>
                          {stores.filter(s => s.name !== transferSource).map(s => <option key={s.id} value={s.name} className="bg-slate-900">{s.name}</option>)}
                          <option value="Main Hotel Store" className="bg-slate-900">Main Hotel Store</option>
                       </select>
                    </div>
                    {transferSource && (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                         <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Items to transfer ({sourceItems.length})</span>
                         {sourceItems.length === 0 && <p className="text-[10px] text-white/30 italic">No items at source.</p>}
                         {sourceItems.map(item => (
                           <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-xl">
                              <span className="text-[10px] font-bold text-white/80 truncate flex-1">{item.name}</span>
                              <input
                                type="number"
                                min={0}
                                max={item.currentStock}
                                value={transferQtyMap[item.id] ?? ''}
                                onChange={e => setTransferQtyMap(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                className="w-16 bg-white/10 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-right outline-none"
                                placeholder={`Max ${item.currentStock}`}
                              />
                           </div>
                         ))}
                      </div>
                    )}
                    <button type="submit" className="w-full bg-white text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition shadow-lg shadow-indigo-500/20">
                       Initialize Transfer Sequence
                    </button>
                 </form>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
                 <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> Storage Capacity Utilization
                 </h4>
                 <div className="space-y-4">
                    {[
                      { label: 'Main Store', val: 82, color: 'bg-emerald-500' },
                      { label: 'Kitchen Pantry', val: 94, color: 'bg-amber-500' },
                      { label: 'HK Store', val: 65, color: 'bg-indigo-500' },
                    ].map((s, i) => (
                      <div key={i} className="space-y-1.5">
                         <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{s.val}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.val}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Store Detail Modal */}
      <ModalSystem
        isOpen={showStoreDetail && !!selectedStore}
        onClose={() => setShowStoreDetail(false)}
        title="Store Inventory"
        variant="info"
        size="lg"
        showFooter={false}
      >
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-emerald-500 shadow-3xs"><Store size={20} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedStore}</h4>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{items.filter(i => i.location === selectedStore).length} SKUs on hand</span>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.filter(i => i.location === selectedStore).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.currentStock} {item.unit}</span>
                </div>
              ))}
              {items.filter(i => i.location === selectedStore).length === 0 && (
                <p className="text-[10px] text-slate-400 italic p-2">No items assigned to this store.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowStoreDetail(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
      </ModalSystem>

      {/* Transfer Detail Modal */}
      <ModalSystem
        isOpen={showTransferDetail && !!selectedTransfer}
        onClose={() => setShowTransferDetail(false)}
        title="Transfer Manifest"
        variant="info"
        size="md"
        showFooter={false}
      >
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transfer ID</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono">{selectedTransfer.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</span>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{selectedTransfer.from}</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
                <div className="flex-1">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</span>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100">{selectedTransfer.to}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                   selectedTransfer.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                   selectedTransfer.status === 'In Transit' ? 'bg-blue-50 text-blue-600' :
                   'bg-amber-50 text-amber-600'
                }`}>{selectedTransfer.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedTransfer.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Count</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{selectedTransfer.items} SKU</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowTransferDetail(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default StoreManagement;
