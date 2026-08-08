
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Tag, 
  Box, 
  AlertCircle, 
  ChevronRight, 
  MoreVertical,
  Plus,
  ArrowUpRight,
  ClipboardList,
  Edit2,
  Trash2,
  Barcode,
  X,
  Printer,
  Package,
  History
} from 'lucide-react';
import { InventoryItem, InventoryCategory, InventorySubCategory } from '../../types/inventory';

import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';

const ItemMasterModule: React.FC = () => {
  const { 
    inventoryItems: items, 
    inventoryStores: stores,
    stockMovements,
    formatAmount,
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem 
  } = useERP();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState<Partial<InventoryItem>>({
    code: '', name: '', category: 'Food & Beverage', subcategory: 'Dry Foods',
    unit: 'pcs', supplierId: '', minStock: 0, maxStock: 0, reorderLevel: 0,
    avgCost: 0, currentStock: 0, location: 'Central Warehouse', storeId: 'ST-MAIN'
  });

  const getStoreIdFromLocation = (locationName: string) => {
    const store = stores.find(s => s.name === locationName);
    return store?.id || 'ST-MAIN';
  };

  const resetForm = () => {
    setForm({
      code: '', name: '', category: 'Food & Beverage', subcategory: 'Dry Foods',
      unit: 'pcs', supplierId: '', minStock: 0, maxStock: 0, reorderLevel: 0,
      avgCost: 0, currentStock: 0, location: 'Central Warehouse', storeId: 'ST-MAIN'
    });
  };

  const openCreate = () => { resetForm(); setShowCreateModal(true); };
  const openEdit = (item: InventoryItem) => { setEditingItem(item); setForm({ ...item }); setShowEditModal(true); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    addInventoryItem(form as Omit<InventoryItem, 'id'>);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !form.code || !form.name) return;
    updateInventoryItem(editingItem.id, form);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const categories = ['All', 'Food & Beverage', 'Housekeeping', 'Engineering', 'Office Supplies', 'Gift Shop', 'Fixed Assets'];

  const filteredItems = items.filter(i => {
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchesLocation = selectedLocation === 'All' || i.location === selectedLocation;
    const matchesSearch = searchQuery === '' || 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLocation && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Item Master Catalog</h2>
           <p className="text-xs text-slate-400 font-medium">Managing {items.length} unique inventory SKUs across global categories</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowPrintModal(true)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <Barcode size={16} />
              Print Labels
           </button>
           <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200 dark:shadow-none">
              <Plus size={16} />
              Create New Item
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs">
         <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by code or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs bg-transparent outline-none focus:ring-2 ring-emerald-500/20 text-slate-800 dark:text-slate-100 font-medium"
            />
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Location Node:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
            >
               <option value="All">All Storage Nodes</option>
               {stores.map(s => <option key={s.id} value={s.name}>{s.name} ({s.type})</option>)}
            </select>
         </div>
      </div>

      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar mb-2 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-4 text-xs font-bold transition-all relative ${
              activeCategory === cat 
                ? 'text-emerald-600' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {filteredItems.map((item) => (
           <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-emerald-300 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Tag size={20} />
                 </div>
                 <div className="flex flex-col items-end">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                      item.currentStock <= item.minStock ? 'bg-rose-500 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">#{item.code}</span>
                 </div>
              </div>

              <div className="space-y-1 mb-4">
                 <h3 className="font-sans font-extrabold text-slate-900 dark:text-white leading-tight min-h-[40px] line-clamp-2">{item.name}</h3>
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {item.subcategory} • {item.unit}
                 </div>
                 <div className="text-[9px] font-sans font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                   <span>📍 {item.location}</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-2">
                    <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Available Stock</span>
                       <span className={`block text-xl font-black ${item.currentStock <= item.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                          {item.currentStock}
                       </span>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Standard Cost</span>
                       <span className="text-xs font-mono font-black text-slate-900 dark:text-white">${item.avgCost.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Min Stock</span>
                       <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.minStock}</span>
                    </div>
                    <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Reorder Level</span>
                       <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.reorderLevel}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center gap-2">
                 <div className="flex -space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition">
                       <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowDetailModal(true); }}
                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 flex items-center justify-center transition"
                    >
                       <ClipboardList size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this SKU item?')) {
                          deleteInventoryItem(item.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-rose-500 flex items-center justify-center transition"
                    >
                       <Trash2 size={12} />
                    </button>
                 </div>
                 <button
                   onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowDetailModal(true); }}
                   className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-xl hover:bg-slate-800 transition"
                 >
                    <ArrowUpRight size={14} />
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Create Item Modal */}
      <ModalSystem
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Inventory Item"
        variant="form"
        size="lg"
        showFooter={false}
      >
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="SKU-001" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="Item name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as InventoryCategory })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                    {(['Food & Beverage','Housekeeping','Engineering','Office Supplies','Gift Shop','Fixed Assets'] as InventoryCategory[]).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Subcategory</label>
                  <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value as InventorySubCategory })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="e.g. Dry Foods" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Unit</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="pcs, kg, liters" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Location</label>
                  <select value={form.location} onChange={e => {
                    const loc = e.target.value;
                    setForm({ ...form, location: loc, storeId: getStoreIdFromLocation(loc) });
                  }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                    {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Min Stock</label>
                  <input type="number" min={0} value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Max Stock</label>
                  <input type="number" min={0} value={form.maxStock} onChange={e => setForm({ ...form, maxStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Reorder Level</label>
                  <input type="number" min={0} value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Avg Cost</label>
                  <input type="number" min={0} step="0.01" value={form.avgCost} onChange={e => setForm({ ...form, avgCost: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Current Stock</label>
                  <input type="number" min={0} value={form.currentStock} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Supplier ID</label>
                  <input value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="SUP-001" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">Create Item</button>
              </div>
            </form>
      </ModalSystem>

      {/* Edit Item Modal */}
      <ModalSystem
        isOpen={showEditModal && !!editingItem}
        onClose={() => setShowEditModal(false)}
        title="Edit Inventory Item"
        variant="form"
        size="lg"
        showFooter={false}
      >
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as InventoryCategory })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                    {(['Food & Beverage','Housekeeping','Engineering','Office Supplies','Gift Shop','Fixed Assets'] as InventoryCategory[]).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Subcategory</label>
                  <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value as InventorySubCategory })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Unit</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Location</label>
                  <select value={form.location} onChange={e => {
                    const loc = e.target.value;
                    setForm({ ...form, location: loc, storeId: getStoreIdFromLocation(loc) });
                  }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                    {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Min Stock</label>
                  <input type="number" min={0} value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Max Stock</label>
                  <input type="number" min={0} value={form.maxStock} onChange={e => setForm({ ...form, maxStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Reorder Level</label>
                  <input type="number" min={0} value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Avg Cost</label>
                  <input type="number" min={0} step="0.01" value={form.avgCost} onChange={e => setForm({ ...form, avgCost: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Current Stock</label>
                  <input type="number" min={0} value={form.currentStock} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Supplier ID</label>
                  <input value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">Save Changes</button>
              </div>
            </form>
      </ModalSystem>

      {/* Print Labels Modal */}
      <ModalSystem
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Print SKU Labels"
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print-area">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-950 flex flex-col items-center gap-2">
                  <div className="w-full h-8 bg-slate-900 dark:bg-white rounded flex items-center justify-center gap-1 overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900" style={{ width: Math.random() > 0.5 ? '2px' : '1px', height: '100%' }} />
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.code}</span>
                    <span className="block text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <button onClick={() => window.print()} className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:underline">Print</button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 no-print">
              <button onClick={() => setShowPrintModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
              <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2"><Printer size={14} /> Print All</button>
            </div>
      </ModalSystem>

      {/* Item Detail Modal */}
      <ModalSystem
        isOpen={showDetailModal && !!selectedItem}
        onClose={() => setShowDetailModal(false)}
        title="Item Ledger"
        variant="info"
        size="lg"
        showFooter={false}
      >
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-emerald-500 shadow-3xs">
                <Package size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedItem.name}</h4>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedItem.code} • {selectedItem.category} • {selectedItem.location}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Stock</span>
                <span className="block text-lg font-black text-slate-900 dark:text-white">{selectedItem.currentStock}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg Cost</span>
                <span className="block text-lg font-black text-slate-900 dark:text-white">{formatAmount(selectedItem.avgCost)}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Stock Value</span>
                <span className="block text-lg font-black text-emerald-500">{formatAmount(selectedItem.currentStock * selectedItem.avgCost)}</span>
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><History size={12} /> Stock Movement History</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stockMovements.filter(m => m.itemId === selectedItem.id).length === 0 && (
                  <p className="text-[10px] text-slate-400 italic p-2">No recorded movements for this SKU.</p>
                )}
                {stockMovements.filter(m => m.itemId === selectedItem.id).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{m.type}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.reference}</span>
                    </div>
                    <div className="text-right">
                      <span className={`block text-[10px] font-black ${m.quantity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{m.quantity >= 0 ? '+' : ''}{m.quantity}</span>
                      <span className="text-[8px] font-black text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDetailModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default ItemMasterModule;
