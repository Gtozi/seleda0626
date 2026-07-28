/**
 * Outlet Transfer Dashboard
 * Phase 3 Item 2: Cross-outlet transfer workflow
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchOutletTransfers,
  createOutletTransfer,
  approveOutletTransfer,
  receiveOutletTransfer,
  cancelOutletTransfer,
  fetchUnifiedTransferHistory,
  type OutletTransfer,
  type UnifiedTransferHistory,
} from '../../services/outletTransferService';
import { ArrowRight, CheckCircle, XCircle, Package, History, Plus } from 'lucide-react';

interface Props {
  outletId?: string | null;
}

interface POSOutlet {
  id: string;
  name: string;
  outlet_type: string;
}

export function OutletTransferDashboard({ outletId }: Props) {
  const [transfers, setTransfers] = useState<OutletTransfer[]>([]);
  const [history, setHistory] = useState<UnifiedTransferHistory[]>([]);
  const [outlets, setOutlets] = useState<POSOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Create form state
  const [fromOutletId, setFromOutletId] = useState('');
  const [toOutletId, setToOutletId] = useState('');
  const [itemSource, setItemSource] = useState<'core' | 'kitchen' | 'bar'>('core');
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [unitCost, setUnitCost] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [transfersData, historyData] = await Promise.all([
        fetchOutletTransfers(outletId || undefined),
        fetchUnifiedTransferHistory(outletId || undefined, 50),
      ]);
      setTransfers(transfersData);
      setHistory(historyData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [outletId]);

  const loadOutlets = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/outlets-list', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); loadOutlets(); }, [load, loadOutlets]);

  const handleCreate = async () => {
    if (!toOutletId || !itemId || !itemName || !quantity) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await createOutletTransfer({
        from_outlet_id: fromOutletId || undefined,
        to_outlet_id: toOutletId,
        item_source: itemSource,
        item_id: itemId,
        item_name: itemName,
        quantity: Number(quantity),
        unit,
        unit_cost: unitCost ? Number(unitCost) : undefined,
        priority,
        notes: notes || undefined,
      });
      setShowCreate(false);
      setItemId(''); setItemName(''); setQuantity(''); setUnitCost(''); setNotes('');
      await load();
    } catch (e: any) { alert(e.message); }
  };

  const handleApprove = async (id: string) => {
    try { await approveOutletTransfer(id, 'current_user'); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleReceive = async (id: string) => {
    try { await receiveOutletTransfer(id, 'current_user'); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleCancel = async (id: string) => {
    try { await cancelOutletTransfer(id); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const sourceBadge = (src: string) => {
    const colors: Record<string, string> = {
      core: 'bg-indigo-100 text-indigo-700',
      kitchen: 'bg-amber-100 text-amber-700',
      bar: 'bg-purple-100 text-purple-700',
    };
    return colors[src] || 'bg-slate-100 text-slate-600';
  };

  const outletName = (id: string | null) => {
    if (!id) return 'Main Store';
    const o = outlets.find(o => o.id === id);
    return o?.name || id.substring(0, 8);
  };

  if (loading) {
    return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading transfers...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['active', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition cursor-pointer ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
              {tab === 'history' ? (
                <span className="flex items-center gap-1"><History className="w-3 h-3" /> History</span>
              ) : 'Active Transfers'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition cursor-pointer">
          <Plus className="w-4 h-4" /> New Transfer
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">New Cross-Outlet Transfer</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">From Outlet</label>
              <select value={fromOutletId} onChange={e => setFromOutletId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">Main Store</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">To Outlet *</label>
              <select value={toOutletId} onChange={e => setToOutletId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">Select outlet...</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Item Source</label>
              <select value={itemSource} onChange={e => setItemSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="core">Core Ingredient</option>
                <option value="kitchen">Kitchen Item</option>
                <option value="bar">Bar Item</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Item ID *</label>
              <input value={itemId} onChange={e => setItemId(e.target.value)} placeholder="UUID"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Item Name *</label>
              <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item name"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity *</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</label>
              <input type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase cursor-pointer">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-700 cursor-pointer">Create Transfer</button>
          </div>
        </div>
      )}

      {/* Active Transfers Table */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-3 py-2">Transfer #</th>
                <th className="text-left px-3 py-2">Route</th>
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-left px-3 py-2">Source</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Cost</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-center px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-[10px] text-slate-500">{t.transfer_number}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <span>{outletName(t.from_outlet_id)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{outletName(t.to_outlet_id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{t.item_name}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sourceBadge(t.item_source)}`}>{t.item_source}</span>
                  </td>
                  <td className="px-3 py-2 text-right">{t.quantity} {t.unit}</td>
                  <td className="px-3 py-2 text-right">${Number(t.total_cost).toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColors[t.status] || 'bg-slate-100'}`}>{t.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center space-x-2">
                    {t.status === 'pending' && (
                      <button onClick={() => handleApprove(t.id)} className="text-blue-600 hover:text-blue-800 cursor-pointer text-[10px] font-bold">Approve</button>
                    )}
                    {['approved', 'in_transit'].includes(t.status) && (
                      <button onClick={() => handleReceive(t.id)} className="text-green-600 hover:text-green-800 cursor-pointer text-[10px] font-bold">Receive</button>
                    )}
                    {t.status !== 'completed' && t.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(t.id)} className="text-red-600 hover:text-red-800 cursor-pointer text-[10px] font-bold">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No active transfers.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* History Table */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-3 py-2">Transfer #</th>
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-left px-3 py-2">Source</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-center px-3 py-2">Origin</th>
                <th className="text-left px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {history.map(h => (
                <tr key={`${h.source_table}-${h.transfer_id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-[10px] text-slate-500">{h.transfer_number}</td>
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      {h.item_name}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sourceBadge(h.item_source)}`}>{h.item_source}</span>
                  </td>
                  <td className="px-3 py-2 text-right">{h.quantity} {h.unit}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColors[h.status] || 'bg-slate-100'}`}>{h.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-[10px] text-slate-400">{h.source_table}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-[10px]">{new Date(h.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No transfer history.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
