
import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Calendar, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign,
  Box,
  MoreVertical,
  ClipboardList,
  X,
  Trash2,
  Printer,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GRN } from '../../types/inventory';
import { useERP } from '../../context/ERPContext';

const ReceivingModule: React.FC = () => {
  const { inventoryItems, updateInventoryItem, recordStockMovement, suppliers } = useERP();
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [supplierName, setSupplierName] = useState('Global Foods Ltd');
  const [purchaseOrderId, setPurchaseOrderId] = useState('PO-5023');
  const [deliveryNote, setDeliveryNote] = useState('DN-10255');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-8812');
  const [receiver, setReceiver] = useState('John Storekeeper');
  
  const [items, setItems] = useState<Array<{
    name: string;
    receivedQty: number;
    unitCost: number;
    batchNumber: string;
    expiryDate: string;
  }>>([
    {
      name: 'Fresh Organic Tomatoes',
      receivedQty: 100,
      unitCost: 12.50,
      batchNumber: 'B-105',
      expiryDate: '2027-04-15'
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        receivedQty: 0,
        unitCost: 0,
        batchNumber: `B-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: '2027-06-01'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setItems(updated);
  };

  const totalValue = items.reduce((sum, item) => sum + ((item.receivedQty || 0) * (item.unitCost || 0)), 0);

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const grnIdNum = Math.floor(1000 + Math.random() * 9000);
    const grnNumber = `GRN-2026-00${grns.length + 1}`;
    const grnFormatted: GRN = {
      id: `GRN-${grnIdNum}`,
      number: grnNumber,
      supplierId: `S-00${Math.floor(1 + Math.random() * 5)}`,
      supplierName: supplierName,
      purchaseOrderId: purchaseOrderId,
      deliveryNote: deliveryNote,
      invoiceNumber: invoiceNumber,
      receivedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      receiver: receiver,
      totalValue: totalValue,
      items: items.map(item => ({
        itemId: `I-00${Math.floor(1 + Math.random() * 9)}`,
        name: item.name,
        receivedQty: Number(item.receivedQty),
        unitCost: Number(item.unitCost),
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate
      }))
    };
    setGrns([grnFormatted, ...grns]);

    // Update actual inventory stock for matched items
    items.forEach(item => {
      const matchedItem = inventoryItems.find(inv =>
        inv.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
      if (matchedItem && item.receivedQty > 0) {
        const receivedQty = Number(item.receivedQty);
        const unitCost = Number(item.unitCost);
        const oldStock = matchedItem.currentStock;
        const oldAvgCost = matchedItem.avgCost;
        const newStock = oldStock + receivedQty;
        const newAvgCost = newStock > 0
          ? Number((((oldStock * oldAvgCost) + (receivedQty * unitCost)) / newStock).toFixed(2))
          : unitCost;

        updateInventoryItem(matchedItem.id, {
          currentStock: newStock,
          avgCost: newAvgCost
        });

        recordStockMovement({
          date: new Date().toISOString(),
          itemId: matchedItem.id,
          itemName: matchedItem.name,
          type: 'Purchase',
          quantity: receivedQty,
          cost: unitCost,
          reference: grnNumber,
          user: receiver,
          storeTo: matchedItem.location
        });
      }
    });

    setShowReceiveModal(false);

    // Reset to generic values
    setSupplierName('Global Foods Ltd');
    setPurchaseOrderId(`PO-${Math.floor(5023 + Math.random() * 100)}`);
    setDeliveryNote(`DN-${Math.floor(10000 + Math.random() * 90000)}`);
    setInvoiceNumber(`INV-${Math.floor(4000 + Math.random() * 5000)}`);
    setReceiver('John Storekeeper');
    setItems([
      {
        name: 'Fresh Organic Tomatoes',
        receivedQty: 100,
        unitCost: 12.50,
        batchNumber: 'B-105',
        expiryDate: '2027-04-15'
      }
    ]);
  };

  const [grnSearch, setGrnSearch] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showGrnDetail, setShowGrnDetail] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);

  const [grns, setGrns] = useState<GRN[]>([
    {
      id: 'GRN-1024',
      number: 'GRN-2026-001',
      supplierId: 'S-001',
      supplierName: 'Global Foods Ltd',
      purchaseOrderId: 'PO-5021',
      deliveryNote: 'DN-98241',
      invoiceNumber: 'INV-4402',
      receivedDate: '2026-05-30 08:00',
      receiver: 'John Storekeeper',
      totalValue: 1240.50,
      items: [
        { itemId: 'I-001', name: 'Aqua Lodge Mineral Water 500ml', receivedQty: 100, unitCost: 8.5, batchNumber: 'B-992', expiryDate: '2027-04-01' }
      ]
    },
    {
      id: 'GRN-1025',
      number: 'GRN-2026-002',
      supplierId: 'S-004',
      supplierName: 'Luxe Hospitality Supplies',
      purchaseOrderId: 'PO-5022',
      deliveryNote: 'DN-29381',
      invoiceNumber: 'INV-7731',
      receivedDate: '2026-05-30 10:15',
      receiver: 'John Storekeeper',
      totalValue: 3420.00,
      items: [
        { itemId: 'I-002', name: 'Luxury Guest Soap 40g', receivedQty: 50, unitCost: 24.0, batchNumber: 'L-012', expiryDate: '2028-12-30' }
      ]
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Goods Receiving (GRN)</h2>
           <p className="text-xs text-slate-400 font-medium">Capture incoming deliveries and match with commercial invoices</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowPendingModal(true)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <ClipboardList size={16} />
              Pending Deliveries
           </button>
           <button 
              onClick={() => setShowReceiveModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200"
           >
              <Plus size={16} />
              Receive New Goods
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex items-center gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by GRN#, Invoice#, or Supplier..."
                    value={grnSearch}
                    onChange={(e) => setGrnSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-2.5 pl-9 text-xs outline-none"
                  />
               </div>
               <button
                 onClick={() => setGrnSearch('')}
                 className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-emerald-500 transition"
               >
                  <Truck size={16} />
               </button>
            </div>

            <div className="space-y-4">
               {grns.filter(g =>
                 !grnSearch ||
                 g.number.toLowerCase().includes(grnSearch.toLowerCase()) ||
                 g.supplierName.toLowerCase().includes(grnSearch.toLowerCase()) ||
                 g.invoiceNumber.toLowerCase().includes(grnSearch.toLowerCase())
               ).map((grn) => (
                  <div key={grn.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer">
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{grn.number}</span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-tight">Received</span>
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-tight">Invoice Matched</span>
                           </div>

                           <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Supplier</span>
                              <h4 className="text-base font-sans font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{grn.supplierName}</h4>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-tight">PO Reference</span>
                                 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{grn.purchaseOrderId}</span>
                              </div>
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-tight">Delivery Note</span>
                                 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{grn.deliveryNote}</span>
                              </div>
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-tight">Invoice #</span>
                                 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{grn.invoiceNumber}</span>
                              </div>
                              <div>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-tight">Received By</span>
                                 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{grn.receiver}</span>
                              </div>
                           </div>

                           <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verified Items ({grn.items.length})</span>
                              <div className="space-y-2">
                                 {grn.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.name || "Untitled Item"}</span>
                                       </div>
                                       <div className="flex items-center gap-4 text-[10px] font-mono mt-1 sm:mt-0">
                                          <span className="text-slate-400">Qty: <strong className="text-slate-700 dark:text-slate-300">{item.receivedQty}</strong></span>
                                          <span className="text-slate-450">Cost: <strong className="text-slate-700 dark:text-slate-300">${item.unitCost.toFixed(2)}</strong></span>
                                          {item.batchNumber && <span className="text-slate-400">Batch: <strong className="text-slate-700 dark:text-slate-300">{item.batchNumber}</strong></span>}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="md:w-48 flex flex-col justify-between items-end md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                           <div className="text-right">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Receipt Value</span>
                              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">${grn.totalValue.toLocaleString()}</span>
                           </div>
                           <div className="flex gap-2 w-full mt-4">
                              <button
                                onClick={() => { setSelectedGrn(grn); setShowGrnDetail(true); }}
                                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition flex items-center justify-center"
                              >
                                 <Eye size={16} />
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="flex-1 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-500 rounded-xl transition flex items-center justify-center"
                              >
                                 <Printer size={16} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <div>
                  <h3 className="text-sm font-sans font-extrabold leading-tight">Quality Control (QC)</h3>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">Goods inspection standards</p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl items-center">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={24} />
                     </div>
                     <div className="flex-1">
                        <span className="block text-[10px] font-black tracking-tight uppercase">Incoming QC Passed</span>
                        <p className="text-[9px] text-white/50 leading-relaxed mt-0.5">All 14 items received today passed temperature & damage logs.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl items-center">
                     <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <AlertCircle size={24} />
                     </div>
                     <div className="flex-1">
                        <span className="block text-[10px] font-black tracking-tight uppercase text-amber-400">Pending Reconciliation</span>
                        <p className="text-[9px] text-white/50 leading-relaxed mt-0.5">Partial delivery alert on PO-4822. Missing 2 items from dry-stock.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-3xs">
               <div className="flex justify-between items-center">
                  <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Receiving Metrics</h3>
                  <Calendar size={14} className="text-slate-400" />
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Purchases This Week', val: '$42,500', trend: '+12%', color: 'text-emerald-500' },
                    { label: 'Avg Delivery Lead Time', val: '2.4 Days', trend: '-0.5d', color: 'text-indigo-500' },
                    { label: 'Quality Reject Rate', val: '0.4%', trend: 'Low', color: 'text-emerald-400' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-3">
                       <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{s.label}</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">{s.val}</span>
                       </div>
                       <span className={`text-[10px] font-black ${s.color}`}>{s.trend}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showReceiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowReceiveModal(false)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh] shadow-2xl border border-slate-100 dark:border-slate-800 z-10"
             >
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                         <Truck size={20} />
                      </div>
                      <div>
                         <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Receive & Validate Goods (GRN)</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">3-way verification workflow</p>
                      </div>
                   </div>
                   <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleReceiveSubmit} className="grid grid-cols-2 gap-5">
                   <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplier Name</label>
                      <select
                         value={supplierName}
                         onChange={e => setSupplierName(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                      >
                         {suppliers.filter(s => s.status === 'Active').map(s => (
                           <option key={s.id}>{s.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Purchase Order link</label>
                      <input 
                         required
                         type="text" 
                         value={purchaseOrderId}
                         onChange={e => setPurchaseOrderId(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                         placeholder="PO-XXXX"
                      />
                   </div>

                   <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Note (DN)</label>
                      <input 
                         required
                         type="text" 
                         value={deliveryNote}
                         onChange={e => setDeliveryNote(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                         placeholder="DN-XXXXXX"
                      />
                   </div>

                   <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Reference</label>
                      <input 
                         required
                         type="text" 
                         value={invoiceNumber}
                         onChange={e => setInvoiceNumber(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                         placeholder="INV-XXXX"
                      />
                   </div>

                   <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/60 my-2 pt-4">
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Physical Goods verification ({items.length} items)</h4>
                         <button 
                            type="button"
                            onClick={handleAddItem}
                            className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold py-1 px-3 rounded-full flex items-center gap-1 text-[9px] uppercase tracking-wider transition-all"
                         >
                            <Plus size={12} />
                            Add Item Row
                         </button>
                      </div>
                      
                      <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1">
                         {items.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950/65 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative space-y-4">
                               {items.length > 1 && (
                                  <button
                                     type="button"
                                     onClick={() => handleRemoveItem(index)}
                                     className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 transition"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                                )}
                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Item #{index + 1}</div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2 space-y-1.5">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Item Description</label>
                                     <input 
                                        required
                                        type="text" 
                                        value={item.name}
                                        onChange={e => handleItemChange(index, 'name', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-slate-100"
                                        placeholder="e.g. Fresh Organic Tomatoes, Luxury Guest Soap"
                                     />
                                  </div>

                                  <div className="col-span-1 space-y-1.5">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Qty Received</label>
                                     <input 
                                        required
                                        type="number" 
                                        value={item.receivedQty || ''}
                                        onChange={e => handleItemChange(index, 'receivedQty', Number(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-slate-800 dark:text-slate-100"
                                        placeholder="0"
                                     />
                                  </div>

                                  <div className="col-span-1 space-y-1.5">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Cost (USD)</label>
                                     <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</div>
                                        <input 
                                           required
                                           type="number" 
                                           step="0.01"
                                           value={item.unitCost || ''}
                                           onChange={e => handleItemChange(index, 'unitCost', Number(e.target.value))}
                                           className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-slate-800 dark:text-slate-100"
                                           placeholder="0.00"
                                        />
                                     </div>
                                  </div>

                                  <div className="col-span-1 space-y-1.5">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch / Lot Number</label>
                                     <input 
                                        type="text" 
                                        value={item.batchNumber}
                                        onChange={e => handleItemChange(index, 'batchNumber', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-slate-800 dark:text-slate-100"
                                        placeholder="B-XXX"
                                     />
                                  </div>

                                  <div className="col-span-1 space-y-1.5">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                     <input 
                                        type="date" 
                                        value={item.expiryDate}
                                        onChange={e => handleItemChange(index, 'expiryDate', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer text-slate-750 dark:text-slate-300"
                                     />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="col-span-2 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center mt-2">
                      <div>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Calculated GRN Voucher Value</span>
                         <span className="text-lg font-black text-slate-950 dark:text-white font-mono">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </span>
                      </div>
                      <div className="text-right">
                         <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900 uppercase">
                            Auto Matching Active
                         </span>
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="col-span-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-650/20 flex items-center justify-center gap-2 mt-2"
                   >
                     Validate Delivery & Generate GRN
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending Deliveries Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <ClipboardList size={16} className="text-amber-500" /> Pending Deliveries
              </h3>
              <button onClick={() => setShowPendingModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[
                { po: 'PO-5024', supplier: 'Global Foods Ltd', items: 'Dairy, Eggs, Bread', eta: 'Today, 14:00', status: 'In Transit' },
                { po: 'PO-5025', supplier: 'Luxe Hospitality Supplies', items: 'Guest Amenities, Linens', eta: 'Tomorrow, 09:00', status: 'Scheduled' },
                { po: 'PO-5026', supplier: 'Ethiopian Coffee Exporters', items: 'Green Coffee Beans', eta: 'Jun 17, 08:00', status: 'Confirmed' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{d.po} • {d.supplier}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{d.items}</span>
                  </div>
                  <div className="text-right">
                    <span className={`block text-[9px] font-black uppercase tracking-tight ${
                      d.status === 'In Transit' ? 'text-amber-500' : d.status === 'Scheduled' ? 'text-indigo-500' : 'text-emerald-500'
                    }`}>{d.status}</span>
                    <span className="text-[8px] font-bold text-slate-400">{d.eta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPendingModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* GRN Detail Modal */}
      {showGrnDetail && selectedGrn && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">Goods Receipt Note</h3>
              <button onClick={() => setShowGrnDetail(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">GRN Number</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white font-mono">{selectedGrn.number}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Supplier</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white">{selectedGrn.supplierName}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">PO Reference</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white font-mono">{selectedGrn.purchaseOrderId}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Invoice #</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white font-mono">{selectedGrn.invoiceNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Delivery Note</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white font-mono">{selectedGrn.deliveryNote}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Received By</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white">{selectedGrn.receiver}</span>
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Verified Items ({selectedGrn.items.length})</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedGrn.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Batch: {item.batchNumber} • Exp: {item.expiryDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black text-slate-900 dark:text-white">{item.receivedQty} units</span>
                      <span className="text-[8px] font-black text-slate-400">${item.unitCost.toFixed(2)} / unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Receipt Value</span>
              <span className="text-lg font-black text-emerald-600">${selectedGrn.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowGrnDetail(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
              <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2"><Printer size={14} /> Print GRN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingModule;
