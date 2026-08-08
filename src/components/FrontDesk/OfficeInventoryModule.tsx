import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  Search,
  Send,
  Boxes,
  ClipboardList,
  Compass,
  FileText
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { Requisition, RequisitionStatus } from '../../types/inventory';

const OfficeInventoryModule: React.FC = () => {
  const { 
    inventoryItems, 
    inventoryRequisitions, 
    addInventoryRequisition, 
    updateInventoryRequisitionStatus,
    currentUser
  } = useERP();

  const [selectedStore, setSelectedStore] = useState<'office' | 'giftshop'>('office');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  
  // Requisition form states
  const [reqItemCode, setReqItemCode] = useState('');
  const [reqQty, setReqQty] = useState(5);
  const [requesterName, setRequesterName] = useState(currentUser?.name || 'Front Desk Staff');
  const [reqPriority, setReqPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // Dynamic configurations based on the selected store node
  const officeStoreId = 'ST-OFC';
  const giftShopStoreId = 'ST-GIFT';
  const mainStoreId = 'ST-MAIN';

  const isOffice = selectedStore === 'office';
  const activeStoreId = isOffice ? officeStoreId : giftShopStoreId;
  const storeTitle = isOffice ? 'Front Office Materials Store' : 'Gift Shop Souvenirs Store';
  const mainStoreCategory = isOffice ? 'Office Supplies' : 'Gift Shop';

  // Filter items in our chosen Node by storeId
  const currentStoreItems = inventoryItems.filter(item => 
    item.storeId === activeStoreId &&
    (searchQuery === '' || 
     item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Requisitions belonging to the chosen department
  const currentStoreRequisitions = inventoryRequisitions.filter(req => 
    req.department === (isOffice ? 'Front Office' : 'Gift Shop')
  );

  // Available items from the Main Warehouse for restocking
  const mainStoreCatalogItems = inventoryItems.filter(item => 
    item.storeId === mainStoreId && 
    item.category === mainStoreCategory
  );

  // Safety trigger: sync selected item code when switching tabs
  useEffect(() => {
    if (mainStoreCatalogItems.length > 0) {
      setReqItemCode(mainStoreCatalogItems[0].code);
    } else {
      setReqItemCode('');
    }
  }, [selectedStore, inventoryItems]);

  const getStatusBadgeClass = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-305 font-bold';
      case 'Approved': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold';
      case 'Issued': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold animate-pulse';
      case 'Received': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-semibold';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold';
      default: return 'bg-slate-200 text-slate-705 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = mainStoreCatalogItems.find(i => i.code === reqItemCode);
    if (!selectedItem) {
      alert('Selected master item not found in catalog.');
      return;
    }

    addInventoryRequisition({
      department: isOffice ? 'Front Office' : 'Gift Shop',
      requestedBy: requesterName,
      requestDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      priority: reqPriority,
      status: 'Pending',
      items: [
        {
          itemId: selectedItem.id,
          name: selectedItem.name,
          requestedQty: reqQty,
          unit: selectedItem.unit
        }
      ]
    });

    setReqQty(5);
    setShowRaiseModal(false);
  };

  const activeRequisitionsCount = currentStoreRequisitions.filter(r => r.status !== 'Received' && r.status !== 'Cancelled').length;
  const lowStockItems = currentStoreItems.filter(i => i.currentStock <= i.minStock);

  return (
    <div className="space-y-6">
      {/* Node selection Segment Tab */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1 rounded-xl w-full sm:w-fit gap-1 md:self-center">
         <button
           onClick={() => { setSelectedStore('office'); setSearchQuery(''); }}
           className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
             isOffice 
               ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
               : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
           }`}
         >
            <FileText size={14} className={isOffice ? "text-emerald-600" : "text-slate-450"} />
            Front Desk Supplies
         </button>
         <button
           onClick={() => { setSelectedStore('giftshop'); setSearchQuery(''); }}
           className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
             !isOffice 
               ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
               : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
           }`}
         >
            <Compass size={14} className={!isOffice ? "text-emerald-600" : "text-slate-450"} />
            Gift Shop Souvenirs
         </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">{storeTitle}</h2>
           <p className="text-xs text-slate-400 font-medium">Terminal Node: {activeStoreId}</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowRaiseModal(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200 dark:shadow-none"
           >
              <Send size={14} />
              Request {isOffice ? 'Materials' : 'Souvenirs'} Restock
           </button>
        </div>
      </div>

      {/* Overview Bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stock</span>
               <Boxes size={18} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{currentStoreItems.length}</div>
            <p className="text-[10px] text-slate-500">Unique listed SKUs in Store</p>
         </div>

         <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Safety Margin</span>
               <AlertTriangle size={18} className={lowStockItems.length > 0 ? "text-amber-500 animate-bounce" : "text-slate-400"} />
            </div>
            <div className={`text-2xl font-black ${lowStockItems.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
               {lowStockItems.length}
            </div>
            <p className="text-[10px] text-slate-500">Requiring reorder trigger</p>
         </div>

         <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Transits</span>
               <ArrowLeftRight size={18} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{activeRequisitionsCount}</div>
            <p className="text-[10px] text-slate-500">Procurement logs in flow</p>
         </div>

         <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950/50 animate-fade-in">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Manager</div>
            <div className="flex items-center gap-2 mt-1.5">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">
                  {isOffice ? 'TT' : 'KZ'}
               </div>
               <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                     {isOffice ? 'Tsige T.' : 'Kidane Z.'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                     Storekeeper Node {isOffice ? 'ST-008' : 'ST-007'}
                  </span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Internal Stock Balances */}
         <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                     <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">
                        {isOffice ? 'Cabinets Stock Balance' : 'Display Shelves Stock Balance'}
                     </h3>
                     <p className="text-xs text-slate-400">
                        {isOffice ? 'Current available on-the-desk inventories for the Front Office' : 'Active physical inventory ready for retail sale in the Gift Shop'}
                     </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input 
                       type="text" 
                       placeholder={`Filter ${isOffice ? 'materials' : 'souvenirs'}...`} 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white"
                     />
                  </div>
               </div>

               {currentStoreItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                     <Package size={36} className="mx-auto text-slate-300 mb-2" />
                     <span className="text-xs font-bold text-slate-400 block">
                        No matching {isOffice ? 'desk' : 'gift shop'} inventory items found in node.
                     </span>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {currentStoreItems.map((item) => {
                        const isLow = item.currentStock <= item.minStock;
                        const stockPercentage = Math.min(100, (item.currentStock / item.maxStock) * 100);
                        return (
                           <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700/50 transition bg-slate-50/20 dark:bg-slate-950/10 space-y-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <span className="text-[9px] font-mono font-black text-slate-400 tracking-wider">#{item.code}</span>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{item.name}</h4>
                                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">{item.subcategory} • {item.unit}</span>
                                 </div>
                              </div>

                              <div className="space-y-1">
                                 <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-tight">Stock Volume</span>
                                    <span className={`font-black uppercase text-[11px] ${isLow ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                       {item.currentStock} / {item.maxStock} {isLow ? '(Low)' : ''}
                                    </span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${stockPercentage}%` }}
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-400">
                                 <span>Min Safety: {item.minStock}</span>
                                 <span className="text-right">Reorder level: {item.reorderLevel}</span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>

         {/* Materials Requisitions & Transit Log */}
         <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
               <div>
                  <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">Courier & Reorders Log</h3>
                  <p className="text-xs text-slate-400">Requisitions dispatched to Mother Node</p>
               </div>

               {currentStoreRequisitions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                     <ClipboardList size={30} className="mx-auto text-slate-400 mb-2" />
                     <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">No transit activities recorded</span>
                  </div>
               ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 no-scrollbar animate-fade-in">
                     {currentStoreRequisitions.map((req) => (
                        <div key={req.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/20 space-y-2 text-xs">
                           <div className="flex justify-between items-center">
                              <span className="font-mono font-black text-[10px] text-slate-400">#{req.number}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] uppercase tracking-tight ${getStatusBadgeClass(req.status)}`}>
                                 {req.status}
                              </span>
                           </div>

                           <div className="space-y-1">
                              {req.items.map((it, idx) => (
                                 <div key={idx} className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    <span>{it.name}</span>
                                    <span>x{it.requestedQty} {it.unit}</span>
                                 </div>
                              ))}
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                                 <Clock size={10} />
                                 <span>{req.requestDate}</span>
                                 <span>•</span>
                                 <span className={req.priority === 'Normal' ? 'text-slate-500' : 'text-amber-500 font-bold'}>
                                    {req.priority}
                                 </span>
                              </div>
                           </div>

                           {req.status === 'Issued' && (
                              currentUser?.name === req.requestedBy ? (
                                <button
                                  onClick={() => updateInventoryRequisitionStatus(req.id, 'Received')}
                                  className="w-full bg-slate-900 border border-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase text-[9px] py-1.5 rounded-xl block transition hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white"
                                >
                                   Acknowledge Arrived Stock
                                </button>
                              ) : (
                                <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting {req.requestedBy}</span>
                                </div>
                              )
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Requisition Trigger Modal */}
      <ModalSystem
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Request materials"
        subtitle={`Order from the Mother Warehouse (${mainStoreId}).`}
        variant="form"
        size="md"
        showFooter={false}
      >
               <form onSubmit={handleCreateRequisition} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Select Item</label>
                     <select 
                       value={reqItemCode}
                       onChange={(e) => setReqItemCode(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs outline-none text-slate-800 dark:text-white font-bold"
                     >
                        {mainStoreCatalogItems.map(item => (
                           <option key={item.id} value={item.code}>
                              {item.name} ({item.unit}) (Available Stock: {item.currentStock})
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Request Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          max="200"
                          value={reqQty}
                          onChange={(e) => setReqQty(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs outline-none text-slate-800 dark:text-white"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Priority Level</label>
                        <select 
                          value={reqPriority}
                          onChange={(e: any) => setReqPriority(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs outline-none text-slate-800 dark:text-white font-semibold"
                        >
                           <option value="Normal">Normal Delivery</option>
                           <option value="High">High Priority</option>
                           <option value="Urgent">Urgent Express</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Staff Requesting</label>
                     <input 
                       type="text" 
                       value={requesterName}
                       onChange={(e) => setRequesterName(e.target.value)}
                       placeholder="Enter requesting name"
                       className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs outline-none text-slate-800 dark:text-white"
                     />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                     <button 
                       type="button" 
                       onClick={() => setShowRaiseModal(false)}
                       className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit" 
                       className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                     >
                       Dispatch Requisition
                     </button>
                  </div>
               </form>
      </ModalSystem>
    </div>
  );
};

export default OfficeInventoryModule;
