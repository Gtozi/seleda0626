
import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck, Plus, AlertTriangle, CheckCircle2,
  RefreshCw, Eye, Activity,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchStockCounts, createStockCount, updateStockCount,
  type StockCount,
} from '../../services/procurementService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const StockCountModule: React.FC = () => {
  const { inventoryItems, inventoryStores } = useERP();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedSC, setSelectedSC] = useState<StockCount | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setStockCounts(await fetchStockCounts());
    } catch (err: any) {
      setError(err.message || 'Failed to load stock counts');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const storeItems = inventoryItems.filter(i => i.location === selectedStore);

  const openCountModal = () => {
    setSelectedStore(inventoryStores.length > 0 ? inventoryStores[0].name : 'Main Hotel Store');
    setCounts({}); setShowCountModal(true);
  };

  const handleCreateCount = async () => {
    try {
      const lines = storeItems.map(item => ({
        itemId: item.id, itemName: item.name,
        expectedQuantity: item.currentStock,
        countedQuantity: counts[item.id] !== undefined ? counts[item.id] : null,
        unit: item.unit,
        varianceValue: counts[item.id] !== undefined ? (counts[item.id] - item.currentStock) * (item.avgCost || 0) : 0,
      }));
      await createStockCount({ locationId: selectedStore, countDate: new Date().toISOString().split('T')[0], lines });
      setShowCountModal(false); setCounts({}); loadData();
    } catch (err: any) { setError(err.message || 'Failed to create stock count'); }
  };

  const handleApprove = async (sc: StockCount) => {
    try {
      const lines = (sc.stock_count_lines || []).map(l => ({ id: l.id, countedQuantity: l.counted_quantity || l.expected_quantity }));
      await updateStockCount(sc.id, { status: 'Approved', lines });
      loadData();
      if (selectedSC?.id === sc.id) { setSelectedSC(null); setShowDetail(false); }
    } catch (err: any) { setError(err.message || 'Failed to approve'); }
  };

  const totalVariance = (sc: StockCount) => (sc.stock_count_lines || []).reduce((s, l) => s + Math.abs(Number(l.variance_value) || 0), 0);

  const scColumns: Column<StockCount>[] = [
    { key: 'id', label: 'Count ID', render: (sc) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{sc.id.slice(0, 8)}</span> },
    { key: 'location_id', label: 'Store', render: (sc) => <span className="text-xs font-black text-slate-900 dark:text-white">{sc.location_id || '—'}</span> },
    { key: 'count_date', label: 'Date', align: 'center', render: (sc) => <span className="text-[10px] font-bold text-slate-500">{sc.count_date || '—'}</span> },
    { key: 'stock_count_lines', label: 'Items', align: 'center', render: (sc) => <span className="text-[10px] font-bold text-slate-500">{sc.stock_count_lines?.length || 0}</span> },
    { key: 'variance', label: 'Variance Value', align: 'right', render: (sc) => { const v = totalVariance(sc); return <span className={`text-xs font-mono font-black ${v > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>${fmt(v)}</span>; } },
    { key: 'status', label: 'Status', align: 'center', render: (sc) => { const colors: Record<string, string> = { Draft: 'bg-slate-50 text-slate-600', 'In Progress': 'bg-indigo-50 text-indigo-600', Completed: 'bg-amber-50 text-amber-600', Approved: 'bg-emerald-50 text-emerald-600' }; return <div className="flex justify-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[sc.status] || colors['Draft']}`}>{sc.status}</span></div>; } },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (sc) => (
      <div className="flex justify-center gap-1">
        <button onClick={() => { setSelectedSC(sc); setShowDetail(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View"><Eye size={14} /></button>
        {sc.status !== 'Approved' && <button onClick={() => handleApprove(sc)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Approve & Post"><CheckCircle2 size={14} /></button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Physical Stock Counting</h2>
          <p className="text-xs text-slate-400 font-medium">Variance analysis and physical auditing of digital ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={openCountModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Count Sheet
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mb-3"><ClipboardCheck size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Counts</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{stockCounts.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-3"><Activity size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">In Progress</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{stockCounts.filter(s => s.status === 'In Progress').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 mb-3"><AlertTriangle size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Variance</p>
          <h3 className="text-xl font-black text-rose-600">${fmt(stockCounts.reduce((s, sc) => s + totalVariance(sc), 0))}</h3>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading stock counts...</div>
      ) : (
        <DataTable columns={scColumns} data={stockCounts} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search stock counts..." filterKeys={['location_id', 'status', 'id']} emptyMessage="No stock counts found. Click New Count Sheet to start one." />
      )}

      {/* New Count Sheet Modal */}
      <ModalSystem isOpen={showCountModal} onClose={() => setShowCountModal(false)} title="New Count Sheet" subtitle="Select store and enter physical counts" variant="form" size="xl" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Store / Location</label>
            <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCounts({}); }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
              {inventoryStores.map(s => <option key={s.id} value={s.name}>{s.name} ({s.type})</option>)}
              <option value="Main Hotel Store">Main Hotel Store</option>
            </select>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items in {selectedStore} ({storeItems.length})</h4>
            {storeItems.length === 0 && <p className="text-xs text-slate-400 italic">No items assigned to this location.</p>}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {storeItems.map(item => {
                const physicalCount = counts[item.id];
                const variance = physicalCount !== undefined ? physicalCount - item.currentStock : 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">System: {item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {variance !== 0 && physicalCount !== undefined && <span className={`text-[9px] font-black ${variance > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{variance > 0 ? '+' : ''}{variance}</span>}
                      <input type="number" min={0} value={counts[item.id] ?? ''} onChange={e => setCounts(prev => ({ ...prev, [item.id]: Number(e.target.value) }))} className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-right outline-none focus:ring-1 focus:ring-emerald-500" placeholder={String(item.currentStock)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowCountModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateCount} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Count Sheet</button>
        </div>
      </ModalSystem>

      {/* Stock Count Detail Modal */}
      <ModalSystem isOpen={showDetail && !!selectedSC} onClose={() => setShowDetail(false)} title="Stock Count Detail" subtitle={`${selectedSC?.location_id} · ${selectedSC?.count_date}`} variant="info" size="lg" showFooter={false}>
        {selectedSC && (
          <>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Items</span><span className="text-lg font-black text-slate-900 dark:text-white">{selectedSC.stock_count_lines?.length || 0}</span></div>
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4"><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Variance Value</span><span className="text-lg font-black text-amber-600">${fmt(totalVariance(selectedSC))}</span></div>
                <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Status</span><span className="text-sm font-black text-indigo-600">{selectedSC.status}</span></div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Count Lines</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedSC.stock_count_lines || []).map((line) => (
                    <div key={line.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{line.item_name || line.ingredient_id || '—'}</p>
                        <p className="text-[9px] font-bold text-slate-400">Expected: {line.expected_quantity} {line.unit}{line.counted_quantity !== null && ` · Counted: ${line.counted_quantity} ${line.unit}`}</p>
                      </div>
                      {line.variance_quantity !== 0 && line.counted_quantity !== null && <span className={`text-xs font-black font-mono ${Number(line.variance_quantity) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{Number(line.variance_quantity) > 0 ? '+' : ''}{line.variance_quantity}</span>}
                    </div>
                  ))}
                  {(!selectedSC.stock_count_lines || selectedSC.stock_count_lines.length === 0) && <div className="p-6 text-center text-slate-500 text-xs font-bold">No count lines.</div>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
              {selectedSC.status !== 'Approved' && <button onClick={() => { handleApprove(selectedSC); setShowDetail(false); }} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Approve & Post Adjustments</button>}
              <button onClick={() => setShowDetail(false)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Close</button>
            </div>
          </>
        )}
      </ModalSystem>
    </div>
  );
};

export default StockCountModule;
