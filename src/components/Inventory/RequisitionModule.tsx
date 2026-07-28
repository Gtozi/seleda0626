
import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Plus,
  ChevronRight,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  Box,
  X,
  FileBarChart,
  RefreshCw
} from 'lucide-react';
import { Requisition, RequisitionStatus } from '../../types/inventory';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { fetchRequisitions, createRequisition, updateRequisition, type Requisition as ProcReq } from '../../services/procurementService';

const RequisitionModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RequisitionStatus | 'All'>('All');
  const {
    inventoryRequisitions: requisitions,
    updateInventoryRequisitionStatus,
    addInventoryRequisition,
    inventoryItems: items,
    stockMovements,
    formatAmount,
    currentUser
  } = useERP();

  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [reqDept, setReqDept] = useState('Gift Shop Souvenir Store');
  const [reqItemCode, setReqItemCode] = useState('GS-STONE-CROSS');
  const [reqQty, setReqQty] = useState(5);
  const [requester, setRequester] = useState('Kidane Zewdu');

  const handleRaiseRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogItem = items.find(i => i.code === reqItemCode);
    if (!catalogItem) return;

    addInventoryRequisition({
      department: reqDept,
      requestedBy: requester,
      requestDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      priority: reqQty > 15 ? 'Urgent' : reqQty > 8 ? 'High' : 'Normal',
      status: 'Pending',
      items: [
        {
          itemId: catalogItem.id,
          name: catalogItem.name,
          requestedQty: reqQty,
          unit: catalogItem.unit
        }
      ]
    });

    setShowRaiseModal(false);
    handleDbCreate();
  };
  const [dbReqs, setDbReqs] = useState<ProcReq[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const loadDbReqs = useCallback(async () => {
    setDbLoading(true);
    try {
      setDbReqs(await fetchRequisitions());
    } catch (err) {
      console.error('Failed to load DB requisitions:', err);
    } finally { setDbLoading(false); }
  }, []);

  useEffect(() => { loadDbReqs(); }, [loadDbReqs]);

  const handleDbCreate = async () => {
    const catalogItem = items.find(i => i.code === reqItemCode || i.id === reqItemCode);
    try {
      await createRequisition({
        fromLocationId: 'Main Store',
        toOutletId: reqDept,
        department: reqDept,
        priority: reqQty > 15 ? 'Urgent' : reqQty > 8 ? 'High' : 'Normal',
        requiredDate: new Date().toISOString().split('T')[0],
        lines: catalogItem ? [{ itemId: catalogItem.id, itemName: catalogItem.name, quantity: reqQty, unit: catalogItem.unit }] : [],
      });
      loadDbReqs();
    } catch (err: any) {
      console.error('Failed to create DB requisition:', err);
    }
  };

  const handleDbStatusUpdate = async (id: string, status: string) => {
    try {
      await updateRequisition(id, { status });
      loadDbReqs();
    } catch (err: any) {
      console.error('Failed to update requisition:', err);
    }
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 font-black';
      case 'Verified': return 'bg-blue-100 text-blue-700 font-black';
      case 'Approved': return 'bg-indigo-100 text-indigo-700 font-black';
      case 'Issued': return 'bg-emerald-100 text-emerald-700 font-black';
      case 'Received': return 'bg-slate-100 text-slate-700 font-black';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 font-black';
      default: return 'bg-slate-100 text-slate-400 font-black';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-rose-600';
      case 'High': return 'text-amber-600';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Department Requisitions</h2>
           <p className="text-xs text-slate-400 font-medium">Internal stock procurement and issuance workflow</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowRaiseModal(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200 dark:shadow-none"
           >
              <Plus size={16} />
              Raise Requisition
           </button>
        </div>
      </div>

      <ModalSystem
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Raise New Requisition"
        subtitle="Request stock from Main Hotel Store."
        variant="form"
        size="md"
        showFooter={false}
      >
              <form onSubmit={handleRaiseRequisition} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Department Node</label>
                    <select 
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                       <option value="Gift Shop Souvenir Store">Gift Shop Souvenir Store</option>
                       <option value="Front Desk & Office Materials Store">Front Desk & Office Materials Store</option>
                       <option value="Kitchen Pantry">Kitchen Pantry</option>
                       <option value="Housekeeping Central">Housekeeping Central</option>
                       <option value="Engineering Plant Store">Engineering Plant Store</option>
                       <option value="Bar Store South">Bar Store South</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Select Item</label>
                    <select 
                      value={reqItemCode}
                      onChange={(e) => setReqItemCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                       {items.filter(i => i.location === 'Main Hotel Store').map(i => (
                          <option key={i.id} value={i.code}>{i.name} (Code: {i.code}, Stock: {i.currentStock})</option>
                       ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Quantity</label>
                       <input 
                         type="number" 
                         min="1"
                         value={reqQty}
                         onChange={(e) => setReqQty(Number(e.target.value))}
                         className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Requested By</label>
                       <input 
                         type="text" 
                         value={requester}
                         onChange={(e) => setRequester(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                       />
                    </div>
                 </div>
                 <div className="pt-2 flex items-center justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowRaiseModal(false)}
                      className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                    >
                      Process Requisition
                    </button>
                 </div>
              </form>
      </ModalSystem>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {['All', 'Pending', 'Approved', 'Issued', 'Received', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status as any)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${
              activeTab === status 
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-4">
            {requisitions.filter(r => activeTab === 'All' || r.status === activeTab).map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{req.number}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] uppercase tracking-tight ${getStatusBadge(req.status)}`}>
                             {req.status}
                          </span>
                          <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${getPriorityColor(req.priority)}`}>
                             <AlertTriangle size={10} /> {req.priority}
                          </span>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <Building2 size={20} />
                         </div>
                         <div>
                            <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{req.department}</h4>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Requested by {req.requestedBy}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         {req.items.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-transparent group-hover:border-emerald-50 transition-colors">
                              <Box size={12} className="text-slate-300" />
                              <div className="flex-1 min-w-0">
                                 <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{item.requestedQty} {item.unit}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="md:w-56 space-y-3 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                         <Clock size={12} className="text-indigo-400" />
                         {req.requestDate}
                      </div>
                      <div className="pt-4 flex flex-col gap-2">
                          {req.status === 'Pending' && (
                            <>
                             <button 
                               onClick={() => updateInventoryRequisitionStatus(req.id, 'Approved')}
                               className="w-full bg-indigo-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-md"
                             >
                                Verify & Approve
                             </button>
                             <button 
                               onClick={() => updateInventoryRequisitionStatus(req.id, 'Cancelled')}
                               className="w-full bg-slate-100 dark:bg-slate-850 text-slate-500 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
                             >
                                Cancel Request
                             </button>
                            </>
                          )}
                          {req.status === 'Approved' && (
                             <button
                               onClick={() => updateInventoryRequisitionStatus(req.id, 'Issued', req.items.map(i => ({ itemId: i.itemId, issuedQty: i.requestedQty })))}
                               className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-750 transition"
                             >
                                Initialize Issuance <ArrowRight size={12} />
                             </button>
                          )}
                          {req.status === 'Issued' && (
                             <div className="space-y-2">
                                <div className="text-center p-3 border border-emerald-100 dark:border-emerald-950 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20">
                                   <CheckCircle2 size={20} className="mx-auto text-emerald-500 mb-1" />
                                   <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Stock Dispatched</span>
                                </div>
                                {currentUser?.name === req.requestedBy ? (
                                  <button
                                    onClick={() => updateInventoryRequisitionStatus(req.id, 'Received')}
                                    className="w-full bg-gray-900 text-white py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-gray-850 transition"
                                  >
                                    Acknowledge Receipt
                                  </button>
                                ) : (
                                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting {req.requestedBy}</span>
                                  </div>
                                )}
                             </div>
                          )}
                          {req.status === 'Received' && (
                             <div className="text-center p-3 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
                                <CheckCircle2 size={20} className="mx-auto text-slate-400 mb-1" />
                                <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Received & Closed</span>
                             </div>
                          )}
                          {req.status === 'Cancelled' && (
                             <div className="text-center p-3 border border-rose-100 dark:border-rose-900/30 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10">
                                <span className="text-[10px] font-black text-rose-550 uppercase tracking-widest">Cancelled</span>
                             </div>
                          )}
                      </div>
                   </div>
                </div>
              </div>
            ))}
         </div>

         {/* DB-backed Requisitions */}
         {dbReqs.length > 0 && (
           <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <ClipboardList size={14} className="text-emerald-500" /> DB Requisitions ({dbReqs.length})
              </h3>
              <button onClick={loadDbReqs} className="p-1.5 text-slate-400 hover:text-emerald-600 transition">
                <RefreshCw size={14} className={dbLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {dbReqs.map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{req.req_number || req.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      req.status === 'Approved' ? 'bg-indigo-50 text-indigo-600' :
                      req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-600' :
                      req.status === 'Draft' ? 'bg-slate-50 text-slate-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>{req.status}</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{req.department || '—'}</p>
                  <p className="text-[9px] font-bold text-slate-400 mb-2">{req.priority} · {req.required_date || '—'}</p>
                  {(req.requisition_lines || []).map((line) => (
                    <div key={line.id} className="flex justify-between text-[10px] font-bold text-slate-500 py-1">
                      <span>{line.item_name || '—'}</span>
                      <span>{line.quantity} {line.unit}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    {req.status === 'Draft' && (
                      <button onClick={() => handleDbStatusUpdate(req.id, 'Approved')} className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Approve</button>
                    )}
                    {req.status === 'Approved' && (
                      <button onClick={() => handleDbStatusUpdate(req.id, 'Fulfilled')} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Fulfill</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
           </div>
         )}

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6 text-white">
               <div>
                  <h3 className="text-sm font-sans font-extrabold leading-tight">Requisition Quick Guide</h3>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">Automated workflow controls</p>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: 'Avg. Fill Rate', val: 98, color: 'text-emerald-400', sub: 'Last 30 Days' },
                    { label: 'Turnaround Time', val: '2.4h', color: 'text-indigo-400', sub: 'Target: 4h' },
                    { label: 'Stockout Impact', val: 'Low', color: 'text-blue-400', sub: '0 Critical outages' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-3">
                       <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">{s.label}</span>
                          <span className={`text-xl font-black ${s.color}`}>{s.val}{typeof s.val === 'number' ? '%' : ''}</span>
                       </div>
                       <span className="text-[8px] font-bold text-white/30 uppercase tracking-tight">{s.sub}</span>
                    </div>
                  ))}
               </div>
               
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                     <AlertCircle size={12} /> Auto-Replenishment Logic
                  </span>
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">
                    "Requests for items below Reorder Point (ROP) will automatically trigger a Purchase Request to the main procurement desk."
                  </p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs overflow-hidden relative">
               <div className="absolute -top-1 -right-1">
                  <MoreVertical size={48} className="text-slate-50 dark:text-slate-850 rotate-90" />
               </div>
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Departmental Usage Analysis</h3>
               <div className="space-y-4 pt-2">
                  {[
                    { dept: 'Kitchen', val: 42, color: 'bg-emerald-500' },
                    { dept: 'Housekeeping', val: 28, color: 'bg-blue-500' },
                    { dept: 'Bar', val: 18, color: 'bg-amber-500' },
                    { dept: 'Other', val: 12, color: 'bg-slate-200' },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <span className="text-[9px] font-black text-slate-400 uppercase w-20 truncate">{d.dept}</span>
                       <div className="flex-1 h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.val}%` }} />
                       </div>
                       <span className="text-[10px] font-black text-slate-900 dark:text-white w-8 text-right">{d.val}%</span>
                    </div>
                  ))}
               </div>
               <button
                 onClick={() => setShowAuditModal(true)}
                 className="w-full mt-4 flex items-center justify-center gap-2 text-indigo-600 font-black uppercase text-[9px] tracking-widest hover:underline"
               >
                  Full Consumption Audit <ArrowUpRight size={12} />
               </button>
            </div>
         </div>
      </div>

      {/* Full Consumption Audit Modal */}
      <ModalSystem
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Full Consumption Audit"
        icon={<FileBarChart size={20} className="text-indigo-500" />}
        variant="info"
        size="xl"
        showFooter={false}
      >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Issues', value: stockMovements.filter(m => m.type === 'Issue').length, color: 'text-emerald-500' },
                  { label: 'Total Transfers', value: stockMovements.filter(m => m.type === 'Transfer').length, color: 'text-indigo-500' },
                  { label: 'Total Adjustments', value: stockMovements.filter(m => m.type === 'Adjustment').length, color: 'text-amber-500' },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                    <span className={`block text-xl font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recent Consumption Events</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {stockMovements.filter(m => m.type === 'Issue' || m.type === 'Transfer').slice(0, 20).map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{m.itemName}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.type} • {m.reference}</span>
                      </div>
                      <div className="text-right">
                        <span className={`block text-[10px] font-black ${m.quantity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.abs(m.quantity)} units</span>
                        <span className="text-[8px] font-black text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {stockMovements.filter(m => m.type === 'Issue' || m.type === 'Transfer').length === 0 && (
                    <p className="text-[10px] text-slate-400 italic p-2">No consumption events recorded.</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">Consumption Value Summary</h5>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Issued Value</span>
                    <span className="text-lg font-black text-indigo-600">
                      {formatAmount(stockMovements.filter(m => m.type === 'Issue').reduce((sum, m) => sum + Math.abs(m.quantity) * m.cost, 0))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Transfer Value</span>
                    <span className="text-lg font-black text-indigo-600">
                      {formatAmount(stockMovements.filter(m => m.type === 'Transfer').reduce((sum, m) => sum + Math.abs(m.quantity) * m.cost, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAuditModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default RequisitionModule;
