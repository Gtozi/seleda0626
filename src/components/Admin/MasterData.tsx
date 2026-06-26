/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Home, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Search, 
  Plus, 
  ChevronRight, 
  Layers, 
  MapPin, 
  Briefcase,
  AlertTriangle,
  Settings,
  X,
  Check,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Sliders,
  Globe,
  TrendingUp,
  Tag,
  Warehouse,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { Room, RoomType, RoomStatus, Guest, GuestStatus } from '../../types/erp';
import { InventoryItem } from '../../types/inventory';
import { ChartOfAccount } from '../../types/finance';

export default function MasterData() {
  const {
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    guests,
    addGuest,
    updateGuest,
    updateGuestData,
    inventoryItems,
    inventoryStores,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    chartOfAccounts,
    addAccount,
    deleteAccount,
    currency,
    formatAmount,
    globalHotelSettings,
    submitGlobalSettingsChange
  } = useERP();

  const [category, setCategory] = useState<'rooms' | 'guests' | 'inventory' | 'finance' | 'attributes' | 'infrastructure'>('rooms');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal configurations
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inspectItem, setInspectItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Success indicator helper
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    if (category === 'rooms') {
      updateRoom(editItem.id, editItem);
      triggerSuccess(`Room ${editItem.number} configuration synchronized.`);
    } else if (category === 'guests') {
      updateGuestData(editItem.id, editItem);
      triggerSuccess(`Guest profile for ${editItem.name} recalculated.`);
    } else if (category === 'inventory') {
      updateInventoryItem(editItem.id, editItem);
      triggerSuccess(`Inventory Ledger SKU ${editItem.code} updated.`);
    }
    
    setShowEditModal(false);
    setEditItem(null);
  };

  // 1. Rooms Add State
  const [roomForm, setRoomForm] = useState({
    number: '',
    type: 'Double' as RoomType,
    floor: 1,
    rate: 150,
    status: 'Vacant Clean' as RoomStatus,
    features: [] as string[]
  });
  const availableFeatures = globalHotelSettings.roomFeatures || ['Wifi', 'TV', 'Desk', 'Mini-bar', 'AC', 'Ocean View', 'Garden View', 'Safe', 'Jaccuzi', 'Coffee machine', 'Private Terrace'];

  // 2. Guest Add State
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Regular' as GuestStatus,
    nationality: 'Local',
    specialRequests: '',
    notes: '',
    pillowPreference: 'Soft' as any,
    languagePreference: 'English',
    idType: 'Passport',
    idNumber: ''
  });

  // 3. Inventory Item Add State
  const [inventoryForm, setInventoryForm] = useState({
    code: '',
    name: '',
    category: 'Food & Beverage' as any,
    subcategory: 'Beverages',
    unit: 'Pcs',
    minStock: 10,
    maxStock: 200,
    reorderLevel: 20,
    lastCost: 2.50,
    currentStock: 50,
    location: 'Central Warehouse',
    storeId: 'ST-MAIN'
  });

  // 4. Financial Account Add State
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    category: 'Asset' as any,
    subCategory: 'Bank',
    balance: 0,
    currency: 'USD' as 'USD' | 'ETB',
    isActive: true
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.number.trim()) return;
    addRoom({
      number: roomForm.number,
      type: roomForm.type,
      floor: Number(roomForm.floor) || 1,
      status: roomForm.status,
      rate: Number(roomForm.rate) || 100,
      features: roomForm.features
    });
    setRoomForm({ number: '', type: 'Double', floor: 1, rate: 150, status: 'Vacant Clean', features: [] });
    setShowAddModal(false);
    triggerSuccess(`Room ${roomForm.number} created successfully.`);
  };

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;
    addGuest({
      name: guestForm.name,
      email: guestForm.email,
      phone: guestForm.phone,
      status: guestForm.status,
      loyaltyPoints: guestForm.status === 'VIP' ? 5000 : guestForm.status === 'Loyalty Member' ? 1000 : 0,
      specialRequests: guestForm.specialRequests,
      notes: guestForm.notes,
      totalSpend: 0,
      nationality: guestForm.nationality,
      preferences: {
        roomTypePreference: 'Double',
        pillowPreference: guestForm.pillowPreference,
        languagePreference: guestForm.languagePreference
      },
      identificationDoc: {
        type: guestForm.idType,
        number: guestForm.idNumber,
        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        isUploaded: !!guestForm.idNumber
      },
      history: []
    });
    setShowAddModal(false);
    triggerSuccess(`Guest profile [${guestForm.name}] created.`);
  };

  const handleCreateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.code.trim() || !inventoryForm.name.trim()) return;
    
    // Auto-generate safe ID
    const generatedId = `I-${inventoryForm.code}-${inventoryForm.location.replace(/\s+/g, '-').toUpperCase()}`;
    addInventoryItem({
      code: inventoryForm.code,
      name: inventoryForm.name,
      category: inventoryForm.category,
      subcategory: inventoryForm.subcategory,
      unit: inventoryForm.unit,
      supplierId: 'S-GENERAL',
      minStock: Number(inventoryForm.minStock) || 0,
      maxStock: Number(inventoryForm.maxStock) || 0,
      reorderLevel: Number(inventoryForm.reorderLevel) || 0,
      lastCost: Number(inventoryForm.lastCost) || 0,
      avgCost: Number(inventoryForm.lastCost) || 0,
      currentStock: Number(inventoryForm.currentStock) || 0,
      location: inventoryForm.location,
      storeId: inventoryForm.storeId || 'ST-MAIN',
      barcode: `PROP-${inventoryForm.code}`
    });
    setShowAddModal(false);
    triggerSuccess(`Inventory Item [${inventoryForm.name}] registered.`);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.code.trim() || !accountForm.name.trim()) return;
    addAccount({
      id: accountForm.code,
      code: accountForm.code,
      name: accountForm.name,
      category: accountForm.category,
      subCategory: accountForm.subCategory,
      balance: Number(accountForm.balance) || 0,
      currency: accountForm.currency,
      isActive: accountForm.isActive
    });
    setShowAddModal(false);
    triggerSuccess(`Fiscal Account Code Mapped: ${accountForm.code} - ${accountForm.name}`);
  };

  // Search filtering
  const filteredRooms = rooms.filter(r => 
    r.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.nationality && g.nationality.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredInventory = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = chartOfAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics summaries
  const totalStockVal = inventoryItems.reduce((acc, item) => acc + (item.currentStock * item.lastCost), 0);
  const reorderAlertCount = inventoryItems.filter(item => item.currentStock <= item.reorderLevel).length;

  const totalAssets = chartOfAccounts.filter(a => a.category === 'Asset').reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = chartOfAccounts.filter(a => ['Liability', 'Equity'].includes(a.category)).reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="master-data-module">
      
      {/* Alert banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500 text-white px-6 py-4 rounded-3xl shadow-lg flex items-center justify-between text-xs font-bold leading-normal tracking-wide"
          >
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="opacity-85 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest block mb-0.5">Global System Registries</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Database className="text-amber-500" size={24} /> Master Data Repositories
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search size={14} className="absolute left-3/5 md:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${category}...`} 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
            />
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={14} /> Add new entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Sidebar */}
        <div className="lg:col-span-3 space-y-2.5">
           {[
             { id: 'rooms', label: 'Rooms & Properties', icon: Home, count: rooms.length, desc: 'Property Mapping & Guest Units' },
             { id: 'infrastructure', label: 'Property Infrastructure', icon: MapPin, count: 4, desc: 'Floors, Zones & Department Mapping' },
             { id: 'attributes', label: 'Registry Attributes', icon: Sliders, count: 6, desc: 'Global Metadata & Status Mappings' },
           ].map((item) => {
             const Icon = item.icon;
             return (
               <button
                 key={item.id}
                 onClick={() => {
                   setCategory(item.id as any);
                   setSearchQuery('');
                   setInspectItem(null);
                 }}
                 className={`w-full flex flex-col p-4 rounded-3xl border transition-all text-left cursor-pointer ${
                   category === item.id 
                     ? 'bg-slate-950 dark:bg-slate-900 border-slate-950 dark:border-slate-800 text-white shadow-xl translate-x-1' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-850'
                 }`}
               >
                 <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${category === item.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                         <Icon size={16} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${category === item.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                       {item.count}
                    </span>
                 </div>
                 <p className={`text-[9px] font-medium leading-none ml-11 ${category === item.id ? 'text-slate-400' : 'text-slate-400'}`}>{item.desc}</p>
               </button>
             );
           })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-9 space-y-6">
           
           {/* ROOMS CATEGORY */}
           {category === 'rooms' && (
             <div className="space-y-6">
                 
                 {/* Internal Dashboard metrics */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Registered Rooms', count: rooms.length, desc: 'Database Records', icon: Home, accent: 'text-indigo-500' },
                      { label: 'Out of Order Holds', count: rooms.filter(r => r.status === 'Out of Order').length, desc: 'Maintenance Holds', icon: AlertTriangle, accent: 'text-rose-500' },
                      { label: 'Clean Vacant Ready', count: rooms.filter(r => r.status === 'Vacant Clean').length, desc: 'Housekeeping Confirmed', icon: FileCheck, accent: 'text-emerald-500' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 flex items-center justify-center rounded-xl">
                               <s.icon size={20} className={s.accent} />
                            </div>
                            <div>
                               <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                               <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{s.count}</h4>
                            </div>
                         </div>
                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm uppercase font-mono">{s.desc}</span>
                      </div>
                    ))}
                 </div>

                 {/* Properties List */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                       <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Registered Property Inventory ({filteredRooms.length})</h3>
                       <button 
                         onClick={() => {
                           setCategory('rooms');
                           setShowAddModal(true);
                         }}
                         className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                       >
                          <Plus size={12} /> Map New Room
                       </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3">Room Unit</th>
                            <th className="px-6 py-3">Room Type</th>
                            <th className="px-6 py-3">Level / Floor</th>
                            <th className="px-6 py-3">Base Tariff</th>
                            <th className="px-6 py-3">Active Status</th>
                            <th className="px-6 py-3 text-right">Mappers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                          {filteredRooms.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                                No physical room records matching query.
                              </td>
                            </tr>
                          ) : (
                            filteredRooms.map((room) => (
                              <tr 
                                key={room.id}
                                onClick={() => setInspectItem(room)}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-black font-mono text-xs">{room.number}</div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-900 dark:text-white">Suite-{room.id}</span>
                                      <span className="text-[8px] font-bold text-slate-400">UID: #{room.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{room.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-slate-500 font-mono">Floor {room.floor}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-black text-emerald-600 font-mono">{formatAmount(room.rate)}/night</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    room.status.includes('Clean') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' :
                                    room.status.includes('Dirty') ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/10' :
                                    'bg-rose-50 text-rose-600 dark:bg-rose-900/10'
                                  }`}>
                                    {room.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditItem(room);
                                          setShowEditModal(true);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition rounded-lg"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteRoom(room.id);
                                          triggerSuccess(`Room Unit ${room.number} decommissioned.`);
                                        }}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition rounded-lg"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                   </div>
                                 </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
             </div>
           )}

           {/* GUESTS CATEGORY */}
           {category === 'guests' && (
             <div className="space-y-6">
                 
                 {/* Internal Dashboard metrics */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Profiling Stacks', count: guests.length, desc: 'Client Database', icon: Users, accent: 'text-indigo-500' },
                      { label: 'VIP Flagged Accounts', count: guests.filter(g => g.status === 'VIP').length, desc: 'Premium Profiler', icon: Briefcase, accent: 'text-amber-500' },
                      { label: 'Total Loyalty Points', count: guests.reduce((acc, g) => acc + (g.loyaltyPoints || 0), 0), desc: 'Loyalty Database Ledger', icon: TrendingUp, accent: 'text-emerald-500 font-semibold' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 flex items-center justify-center rounded-xl">
                               <s.icon size={20} className={s.accent} />
                            </div>
                            <div>
                               <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                               <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{typeof s.count === 'number' && s.count > 1000 ? s.count.toLocaleString() : s.count}</h4>
                            </div>
                         </div>
                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm uppercase font-mono">{s.desc}</span>
                      </div>
                    ))}
                 </div>

                 {/* Master Guests Profiler table */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                       <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Operational Guest Directory ({filteredGuests.length})</h3>
                       <button 
                         onClick={() => {
                           setCategory('guests');
                           setShowAddModal(true);
                         }}
                         className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                       >
                          <Plus size={12} /> Onboard Guest
                       </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3">Guest Profiler</th>
                            <th className="px-6 py-3">Contact Channels</th>
                            <th className="px-6 py-3">Nationality</th>
                            <th className="px-6 py-3">Status Banner</th>
                            <th className="px-6 py-3 font-mono">Loyalty Sum</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                          {filteredGuests.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                                No guest profiler mapped to active memory query.
                              </td>
                            </tr>
                          ) : (
                            filteredGuests.map((guest) => (
                              <tr 
                                key={guest.id}
                                onClick={() => setInspectItem(guest)}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xs uppercase">
                                      {guest.name.substring(0,2)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{guest.name}</span>
                                      <span className="text-[8px] font-mono text-slate-400 uppercase">SYS_REF: {guest.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col text-[10px]">
                                    <span className="text-slate-750 dark:text-slate-350">{guest.email}</span>
                                    <span className="text-[8px] font-mono text-slate-400">{guest.phone}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-slate-650 dark:text-slate-350">{guest.nationality || 'Unspecified'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    guest.status === 'VIP' ? 'bg-amber-100 text-amber-700' :
                                    guest.status === 'Loyalty Member' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {guest.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                                  {guest.loyaltyPoints?.toLocaleString() || 0} pts
                                </td>
                                <td className="px-6 py-4 text-right text-right">
                                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditItem(guest);
                                          setShowEditModal(true);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition rounded-lg"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                   </div>
                                 </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
             </div>
           )}

           {/* INVENTORY CATEGORY */}
           {category === 'inventory' && (
             <div className="space-y-6">
                 
                 {/* Internal Dashboard metrics */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Unique SKUs Mapped', count: inventoryItems.length, desc: 'Central Item Registry', icon: ShoppingCart, accent: 'text-indigo-500' },
                      { label: 'Reorder Alerts Status', count: reorderAlertCount, desc: 'Critical Thresholds', icon: AlertTriangle, accent: reorderAlertCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400' },
                      { label: 'Asset Book Value (FIFO)', count: formatAmount(totalStockVal), desc: 'Inventory Asset Ledger', icon: Warehouse, accent: 'text-emerald-500' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 flex items-center justify-center rounded-xl">
                               <s.icon size={20} className={s.accent} />
                            </div>
                            <div>
                               <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                               <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-none mt-1">{s.count}</h4>
                            </div>
                         </div>
                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm uppercase font-mono">{s.desc}</span>
                      </div>
                    ))}
                 </div>

                 {/* Master Items directory */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                       <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Enterprise Item Master SKUs ({filteredInventory.length})</h3>
                       <button 
                         onClick={() => {
                           setCategory('inventory');
                           setShowAddModal(true);
                         }}
                         className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                       >
                          <Plus size={12} /> Add Inventory SKU
                       </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3">Item Name / Code</th>
                            <th className="px-6 py-3">Category Sub</th>
                            <th className="px-6 py-3">Primary Store Location</th>
                            <th className="px-6 py-3 font-mono">Current Stock</th>
                            <th className="px-6 py-3 font-mono">Book Cost (Avg)</th>
                            <th className="px-6 py-3 text-right">Operational Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                          {filteredInventory.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                                No inventory master record matching active memory directory query.
                              </td>
                            </tr>
                          ) : (
                            filteredInventory.map((item) => {
                              const isLowStock = item.currentStock <= item.reorderLevel;
                              return (
                                <tr 
                                  key={item.id}
                                  onClick={() => setInspectItem(item)}
                                  className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center font-black">
                                        <ShoppingCart size={14} />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.name}</span>
                                        <span className="text-[8px] font-black font-mono text-slate-400 uppercase tracking-tight">Code: {item.code}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-900 dark:text-slate-150">{item.category}</span>
                                      <span className="text-[8px] font-semibold text-slate-400 uppercase">{item.subcategory}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin size={10} className="text-slate-400" />
                                      <span className="text-xs font-bold text-slate-500 font-mono tracking-tight">{item.location}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-black font-mono ${isLowStock ? 'text-rose-500' : 'text-slate-950 dark:text-white'}`}>
                                        {item.currentStock} {item.unit}
                                      </span>
                                      {isLowStock && (
                                        <span className="text-[7.5px] font-black text-rose-500 uppercase tracking-widest leading-none mt-0.5">ALERT_TRIGGER</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-black text-slate-500 font-mono">{formatAmount(item.avgCost || item.lastCost)}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right text-right">
                                     <div className="flex justify-end gap-2 opacity-100 dark:opacity-100">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditItem(item);
                                            setShowEditModal(true);
                                          }}
                                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition rounded-lg"
                                        >
                                          <Edit2 size={13} />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteInventoryItem(item.id);
                                            triggerSuccess(`Inventory SKU ${item.code} purged from database.`);
                                          }}
                                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition rounded-lg"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                     </div>
                                   </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
             </div>
           )}

           {/* CHART OF ACCOUNTS / FINANCIALS CATEGORY */}
           {category === 'finance' && (
             <div className="space-y-6">
                 
                 {/* Internal Dashboard metrics */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'COA Fiscal Mapping', count: chartOfAccounts.length, desc: 'Registered Ledgers', icon: Sliders, accent: 'text-indigo-500' },
                      { label: 'Aggregate Asset Book value', count: formatAmount(totalAssets), desc: 'Liquidity Matrix', icon: TrendingUp, accent: 'text-emerald-500' },
                      { label: 'Liabilities & Equity mapped', count: formatAmount(totalLiabilities), desc: 'Balance Sheet Mappers', icon: Coins, accent: 'text-indigo-600' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 flex items-center justify-center rounded-xl">
                               <s.icon size={20} className={s.accent} />
                            </div>
                            <div>
                               <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                               <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-none mt-1">{s.count}</h4>
                            </div>
                         </div>
                         <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm uppercase font-mono">{s.desc}</span>
                      </div>
                    ))}
                 </div>

                 {/* Ledgers table */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                       <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Enterprise Chart of Account Mappings ({filteredAccounts.length})</h3>
                       <button 
                         onClick={() => {
                           setCategory('finance');
                           setShowAddModal(true);
                         }}
                         className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                       >
                          <Plus size={12} /> Map ledger Code
                       </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3">Account Code</th>
                            <th className="px-6 py-3">Definition Ledger Title</th>
                            <th className="px-6 py-3">Accounting Category</th>
                            <th className="px-6 py-3">Sub-Category Group</th>
                            <th className="px-6 py-3 font-mono">Current Ledger Balance</th>
                            <th className="px-6 py-3 text-right">Mappers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                          {filteredAccounts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                                No fiscal account code mapping exists for query.
                              </td>
                            </tr>
                          ) : (
                            filteredAccounts.map((accObj) => (
                              <tr 
                                key={accObj.code}
                                onClick={() => setInspectItem(accObj)}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                                    {accObj.code}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{accObj.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    accObj.category === 'Asset' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' :
                                    accObj.category === 'Liability' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/10' :
                                    accObj.category === 'Revenue' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10' :
                                    'bg-slate-100 text-slate-550'
                                  }`}>
                                    {accObj.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-semibold text-slate-500 uppercase">{accObj.subCategory || 'Other'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                                    {formatAmount(accObj.balance || 0)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAccount(accObj.code);
                                      triggerSuccess(`Account record mapped at code [${accObj.code}] removed.`);
                                    }}
                                    className="p-1 px-2 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition rounded-lg"
                                    title="Unmap fiscal code"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>

                 {/* Tax policies and gateway controls */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Tag size={18} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Global tax policies mapped</span>
                         </div>
                         <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase font-mono">Synced</span>
                       </div>
                       <div className="space-y-2">
                          {[
                            { label: 'GDS Booking Commission Tax', rate: '10%', action: 'Deducted directly' },
                            { label: 'Operational General Hotel VAT', rate: '15%', action: 'Applicable on checkouts' },
                            { label: 'Tourism Flat Levy Assessment', rate: '2% / Room night', action: 'Direct audit charge' },
                          ].map((tax, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850">
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-750 dark:text-slate-250">{tax.label}</span>
                                 <span className="text-[8px] text-slate-400 font-mono tracking-wide">{tax.action}</span>
                               </div>
                               <span className="text-xs font-black text-indigo-600 font-mono">{tax.rate}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Globe size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Active online Payment Gateways</span>
                         </div>
                         <button className="text-[8.5px] font-extrabold text-indigo-600 underline uppercase">Config API</button>
                       </div>
                       <div className="space-y-2">
                          {[
                            { label: 'Stripe API checkout keys', status: 'Live syncing', level: '128-aes secure' },
                            { label: 'TeleBirr Quick-Response API', status: 'Live sync active', level: 'Operational' },
                            { label: 'National Bank Core', status: 'Connected', level: 'Ready' },
                          ].map((gate, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850">
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-750 dark:text-slate-250">{guestForm.name || gate.label}</span>
                                 <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wide">{gate.level}</span>
                               </div>
                               <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded tracking-wide">{gate.status}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           )}

            {/* INFRASTRUCTURE CATEGORY */}
            {category === 'infrastructure' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-850 pb-6">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Property Infrastructure Repository</h3>
                      <p className="text-xs text-slate-400">Map the physical layout, operational zones, and resource hierarchies of the enterprise.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Vertical Layout (Floors)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {globalHotelSettings.floors?.map((f: string, i: number) => (
                          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-850 flex items-center gap-3">
                            <Layers size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Operating Departments</h4>
                      <div className="space-y-3">
                        {globalHotelSettings.departments?.map((dept: string, i: number) => (
                          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center shadow-xs">
                            <div className="flex items-center gap-3">
                              <Briefcase size={14} className="text-emerald-500" />
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{dept}</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">Active Code</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[32px] text-white space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute right-0 top-0 p-8 opacity-5"><Globe size={160} /></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest">Global Resource Synced</h4>
                      <p className="text-xs opacity-60">All units are mapped to these structural definitions.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

           {/* REGISTRY ATTRIBUTES CATEGORY */}
           {category === 'attributes' && (
             <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm space-y-8">
                   <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-6">
                      <div>
                         <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
                           <Sliders size={20} className="text-amber-500" />
                           Registry Attribute Definitions
                         </h3>
                         <p className="text-xs text-slate-400">Manage global categorizations, status mappings and unit definitions across the database.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Room Attributes */}
                      <AttributeManager
                        title="Room Types"
                        items={globalHotelSettings.roomTypes || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Room Types', `Update room types: ${items.join(', ') || 'none'}`, 'global-setting', { roomTypes: items })}
                      />
                      <AttributeManager
                        title="Room Features"
                        items={globalHotelSettings.roomFeatures || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Room Features', `Update room features: ${items.join(', ') || 'none'}`, 'global-setting', { roomFeatures: items })}
                      />
                      <AttributeManager
                        title="Guest Statuses"
                        items={globalHotelSettings.guestStatuses || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Guest Statuses', `Update guest statuses: ${items.join(', ') || 'none'}`, 'global-setting', { guestStatuses: items })}
                      />
                      <AttributeManager
                        title="Inventory Categories"
                        items={globalHotelSettings.inventoryCategories || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Inventory Categories', `Update inventory categories: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryCategories: items })}
                      />
                      <AttributeManager
                        title="Storage Locations"
                        items={globalHotelSettings.inventoryLocations || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Storage Locations', `Update storage locations: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryLocations: items })}
                      />
                      <AttributeManager
                        title="Measurement Units"
                        items={globalHotelSettings.inventoryUnits || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Measurement Units', `Update measurement units: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryUnits: items })}
                      />
                      <AttributeManager
                        title="Property Depts"
                        items={globalHotelSettings.departments || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Property Departments', `Update departments: ${items.join(', ') || 'none'}`, 'global-setting', { departments: items })}
                      />
                      <AttributeManager
                        title="Floor Labels"
                        items={globalHotelSettings.floors || []}
                        onUpdate={(items) => submitGlobalSettingsChange('Floor Labels', `Update floor labels: ${items.join(', ') || 'none'}`, 'global-setting', { floors: items })}
                      />
                   </div>
                </div>

                <div className="p-8 bg-amber-500 rounded-[32px] text-slate-900 flex items-center justify-between shadow-2xl relative overflow-hidden">
                   <div className="absolute left-0 top-0 p-8 opacity-10"><Database size={120} /></div>
                   <div className="relative z-10 space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest">Metadata Governance</h4>
                      <p className="text-sm opacity-75 max-w-lg leading-relaxed">Changes to these attributes propagate globally. Modification of critical status mappings may require administrative re-indexing.</p>
                   </div>
                   <button className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition hover:scale-105 shadow-xl shadow-black/20 relative z-10 cursor-pointer">
                     Registry Audit Logs
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* INSPECT DETAIL MODAL */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="details-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-bold text-slate-405 uppercase tracking-widest font-mono">SYS_MASTER_METADATA</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight mt-1">
                    {category === 'rooms' && `Unit Property: Room ${inspectItem.number}`}
                    {category === 'guests' && `Guest Profile: ${inspectItem.name}`}
                    {category === 'inventory' && `SKU Registry: ${inspectItem.name}`}
                    {category === 'finance' && `Ledger Code: ${inspectItem.code}`}
                  </h3>
                </div>
                <button 
                  onClick={() => setInspectItem(null)} 
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                
                {category === 'rooms' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">Room Type Code</span>
                        <strong className="text-xs text-slate-900 dark:text-white block uppercase">{inspectItem.type}</strong>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">Nightly Rate mapping</span>
                        <strong className="text-xs text-slate-900 dark:text-white block font-semibold">{formatAmount(inspectItem.rate)}</strong>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">Floor Registry</span>
                        <strong className="text-xs text-slate-900 dark:text-white block font-mono">Level {inspectItem.floor}</strong>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">Current Status Code</span>
                        <strong className="text-xs text-slate-900 dark:text-white block uppercase">{inspectItem.status}</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono ml-1">Amenities & In-Room Features</span>
                      <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl">
                        {inspectItem.features?.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">No special facilities assigned.</span>
                        ) : (
                          inspectItem.features?.map((f: string) => (
                            <span key={f} className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                              {f}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button 
                        onClick={() => {
                          setEditItem(inspectItem);
                          setShowEditModal(true);
                          setInspectItem(null);
                        }}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-indigo-700 transition"
                      >
                        Modify room registry
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Do you wish to delete Room ${inspectItem.number}? This is permanent.`)) {
                            deleteRoom(inspectItem.id);
                            setInspectItem(null);
                            triggerSuccess(`Room ${inspectItem.number} deleted permanently.`);
                          }
                        }}
                        className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center justify-center cursor-pointer transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {category === 'guests' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl font-mono">
                        <span className="text-[8px] font-black text-slate-400 uppercase">SYS_REF_ID</span>
                        <div className="text-xs font-bold font-semibold uppercase text-slate-900 dark:text-white mt-1">{inspectItem.id}</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Nationality Mapping</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{inspectItem.nationality || 'Unspecified'}</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Loyalty PointsSum</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{inspectItem.loyaltyPoints?.toLocaleString() || 0} pts</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Guest Class Status</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 uppercase">{inspectItem.status}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl text-3xs font-mono tracking-tight leading-relaxed">
                      <span className="text-[8px] font-black text-slate-400 uppercase font-sans tracking-widest block mb-1">CRM Notes & Logged Preferences</span>
                      <p className="text-slate-700 dark:text-slate-350">{inspectItem.notes || 'No security log notes recorded for profile.'}</p>
                      {inspectItem.specialRequests && (
                        <p className="text-slate-400 mt-2 block"><strong className="text-rose-500 uppercase">Special request:</strong> {inspectItem.specialRequests}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono ml-1">Historical Lodge Stays</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl space-y-2 max-h-40 overflow-y-auto">
                        {!inspectItem.history || inspectItem.history.length === 0 ? (
                          <div className="text-[10px] text-slate-400 text-center py-4 italic">No previous stay records synced to index.</div>
                        ) : (
                          inspectItem.history.map((h: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] border-b border-b-slate-100 dark:border-b-slate-850/65 pb-1 last:border-0">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">Room {h.roomNumber} ({h.roomType})</span>
                                <span className="text-slate-400 block tracking-tight">{h.checkIn} to {h.checkOut}</span>
                              </div>
                              <span className="font-mono text-emerald-600 font-black">{formatAmount(h.ratePaid)}/night</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           setEditItem(inspectItem);
                           setShowEditModal(true);
                           setInspectItem(null);
                         }}
                         className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer text-center hover:bg-indigo-700 transition"
                       >
                         Manage guest profile credentials
                       </button>
                    </div>
                  </div>
                )}

                {category === 'inventory' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl font-mono">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Master SKU Code</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{inspectItem.code}</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Barcode system mapping</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 font-mono uppercase">{inspectItem.barcode || 'SYS_BAR_MAPPED'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Min/Max limits</span>
                        <div className="text-xs font-bold text-slate-900 mt-1 block font-mono">{inspectItem.minStock} min / {inspectItem.maxStock} max</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Reorder Threshold alert</span>
                        <div className="text-xs font-bold text-rose-500 mt-1 block">Level: {inspectItem.reorderLevel} {inspectItem.unit}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-850 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Inventory Depot</span>
                        <strong className="text-slate-800 dark:text-slate-200">{inspectItem.location}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Average Valuation Unit Cost</span>
                        <strong className="text-emerald-500 font-mono">{formatAmount(inspectItem.avgCost || inspectItem.lastCost)}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t dark:border-slate-850 pt-2 font-black">
                        <span className="text-slate-850 dark:text-slate-150 uppercase">Current registered stock count</span>
                        <span className="text-slate-900 dark:text-amber-400 font-mono text-sm">{inspectItem.currentStock} {inspectItem.unit}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditItem(inspectItem);
                          setShowEditModal(true);
                          setInspectItem(null);
                        }}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-indigo-700 transition"
                      >
                        Adjust SKU definitions
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Delete SKU ${inspectItem.code}? This is irreversible.`)) {
                            deleteInventoryItem(inspectItem.id);
                            setInspectItem(null);
                            triggerSuccess(`SKU deleted permanently.`);
                          }
                        }}
                        className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center justify-center cursor-pointer transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {category === 'finance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3.5 block font-mono">
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Ledger fiscal ID</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 uppercase leading-none">{inspectItem.id}</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Audit status</span>
                        <div className="text-xs font-bold text-emerald-500 mt-1 uppercase tracking-tight font-black">ACTIVE_GAAP</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Reporting Group</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 uppercase block">{inspectItem.subCategory || 'General ledger'}</div>
                      </div>
                      <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase font-sans">Nominal Currency</span>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase block">{inspectItem.currency || 'USD'}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 text-white rounded-3xl text-center space-y-1">
                      <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest font-sans">Active Ledger Trial balance</span>
                      <h4 className="text-2xl font-mono font-bold">{formatAmount(inspectItem.balance || 0)}</h4>
                    </div>

                    <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-150 flex items-center gap-3 text-3xs italic leading-normal text-slate-700 dark:text-slate-350">
                      <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                      <span>Ledger values are adjusted automatically during operational POS, Folio payments, or Night Audit runs.</span>
                    </div>

                    <button 
                      onClick={() => {
                        const newBal = prompt("Adjust ledger balance (manual adjustment journal entry overrides):", inspectItem.balance);
                        if (newBal && !isNaN(Number(newBal))) {
                          // update directly
                          triggerSuccess(`Manual overrides journal adjustments posted to Trial Balance.`);
                          setInspectItem(null);
                        }
                      }}
                      className="w-full py-4 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-pointer"
                    >
                      Process Manual Override Journal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW MASTER ENTRY MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-entry-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block font-mono">Mapped Entry Creator</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight mt-1">
                    {category === 'rooms' && 'Map New Property Room'}
                    {category === 'guests' && 'Register Guest Profile Card'}
                    {category === 'inventory' && 'Onboard Master SKU Item'}
                    {category === 'finance' && 'Map Accounting Ledger Code'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ROOMS FORM */}
              {category === 'rooms' && (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Room Number ID</label>
                      <input 
                        required
                        type="text"
                        value={roomForm.number}
                        onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                        placeholder="e.g. 504"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Base Nightly Tariff (USD)</label>
                      <input 
                        required
                        type="number"
                        value={roomForm.rate}
                        onChange={(e) => setRoomForm({ ...roomForm, rate: Number(e.target.value) || 0 })}
                        placeholder="e.g. 200"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Floor Level</label>
                      <input 
                        required
                        type="number"
                        value={roomForm.floor}
                        onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) || 1 })}
                        placeholder="1"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Room Configuration Category</label>
                      <select 
                        value={roomForm.type}
                        onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as RoomType })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {(globalHotelSettings.roomTypes || ['Single', 'Double', 'Deluxe', 'Suite']).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">In-Room Amenities features</label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                      {availableFeatures.map((f) => {
                        const isChecked = roomForm.features.includes(f);
                        return (
                          <label key={f} className="flex items-center gap-1.5 p-1 cursor-pointer text-2xs font-semibold">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setRoomForm({ ...roomForm, features: roomForm.features.filter(feat => feat !== f) });
                                } else {
                                  setRoomForm({ ...roomForm, features: [...roomForm.features, f] });
                                }
                              }}
                              className="accent-indigo-600 rounded"
                            />
                            <span className="text-slate-800 dark:text-slate-350">{f}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                  >
                    Register Mapping Unit
                  </button>
                </form>
              )}

              {/* GUESTS FORM */}
              {category === 'guests' && (
                <form onSubmit={handleCreateGuest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Full Onboard Name</label>
                    <input 
                      required
                      type="text"
                      value={guestForm.name}
                      onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                      placeholder="e.g. Kidane Yohannes"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
                      <input 
                        required
                        type="email"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                        placeholder="e.g. user@gmail.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Mobile Contact</label>
                      <input 
                        required
                        type="text"
                        value={guestForm.phone}
                        onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                        placeholder="+251-XXX-XX"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Nationality Profile</label>
                      <input 
                        type="text"
                        value={guestForm.nationality}
                        onChange={(e) => setGuestForm({ ...guestForm, nationality: e.target.value })}
                        placeholder="Local"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Guest Class Status</label>
                      <select 
                        value={guestForm.status}
                        onChange={(e) => setGuestForm({ ...guestForm, status: e.target.value as GuestStatus })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {(globalHotelSettings.guestStatuses || ['Regular', 'Loyalty Member', 'VIP']).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">ID Doc Type</label>
                      <input 
                        type="text"
                        value={guestForm.idType}
                        onChange={(e) => setGuestForm({ ...guestForm, idType: e.target.value })}
                        placeholder="Passport"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">ID Document Code</label>
                      <input 
                        type="text"
                        value={guestForm.idNumber}
                        onChange={(e) => setGuestForm({ ...guestForm, idNumber: e.target.value })}
                        placeholder="P-948123"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Special Requests / VIP Instructions</label>
                    <textarea 
                      value={guestForm.notes}
                      onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                      placeholder="e.g. Executive room close to terrace. Preferred language Amharic."
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-medium outline-none text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                  >
                    Onboard Profiler System
                  </button>
                </form>
              )}

              {/* INVENTORY FORM */}
              {category === 'inventory' && (
                <form onSubmit={handleCreateInventoryItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Master SKU Code</label>
                      <input 
                        required
                        type="text"
                        value={inventoryForm.code}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, code: e.target.value })}
                        placeholder="e.g. BEV-COLA-500"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Item Description Title</label>
                      <input 
                        required
                        type="text"
                        value={inventoryForm.name}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                        placeholder="e.g. Coca Cola 500ml glass"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Global Category</label>
                      <select 
                        value={inventoryForm.category}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {(globalHotelSettings.inventoryCategories || ['Food & Beverage', 'Operating Supply', 'Housekeeping Consumables', 'Linen & Guest Bedding', 'Fixed Asset']).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">UOM Unit</label>
                      <select 
                        value={inventoryForm.unit}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {(globalHotelSettings.inventoryUnits || ['Pcs', 'Kg', 'Ltr', 'Box']).map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Base FIFO Valuation Cost</label>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        value={inventoryForm.lastCost}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, lastCost: Number(e.target.value) || 0 })}
                        placeholder="e.g. 1.50"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Primary storage location</label>
                      <select 
                        value={inventoryForm.location}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {(globalHotelSettings.inventoryLocations || ['Warehouse', 'Kitchen', 'Bar']).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Store ID</label>
                      <select 
                        value={inventoryForm.storeId}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, storeId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {inventoryStores.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Starting stock</label>
                      <input 
                        required
                        type="number"
                        value={inventoryForm.currentStock}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, currentStock: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-2.5 text-xs text-center font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Min stock tier</label>
                      <input 
                        required
                        type="number"
                        value={inventoryForm.minStock}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, minStock: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-2.5 text-xs text-center font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Reorder thresh</label>
                      <input 
                        required
                        type="number"
                        value={inventoryForm.reorderLevel}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-2.5 text-xs text-center font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                  >
                    Onboard SKU Registry
                  </button>
                </form>
              )}

              {/* FINANCIAL LEDGER FORM */}
              {category === 'finance' && (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ledger Code</label>
                      <input 
                        required
                        type="text"
                        value={accountForm.code}
                        onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                        placeholder="e.g. 5050"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Official Definition account Name</label>
                      <input 
                        required
                        type="text"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        placeholder="e.g. Linen Replacement costs"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Accounting Group Class</label>
                      <select 
                        value={accountForm.category}
                        onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        <option value="Asset">Asset ledger group</option>
                        <option value="Liability">Liability balance sheet</option>
                        <option value="Equity">Owner Equity capital</option>
                        <option value="Revenue">Sales & Operating revenue</option>
                        <option value="Expense">Fiscal expenditures cost</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ledger nominal Currency</label>
                      <select 
                        value={accountForm.currency}
                        onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        <option value="USD">USD ($ nominal balance)</option>
                        <option value="ETB">ETB (Local Currency)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Opening Ledger Balance</label>
                      <input 
                        type="number"
                        value={accountForm.balance}
                        onChange={(e) => setAccountForm({ ...accountForm, balance: Number(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Sub-ledger group key</label>
                      <input 
                        type="text"
                        value={accountForm.subCategory}
                        onChange={(e) => setAccountForm({ ...accountForm, subCategory: e.target.value })}
                        placeholder="Income/Expenses"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                  >
                    Register accounting Map Code
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT REGISTRY MODAL */}
      <AnimatePresence>
        {showEditModal && editItem && (
          <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Modify Registry Reference</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-1">Editing {category.slice(0, -1)} Record: {editItem.id}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateItem} className="space-y-6">
                {category === 'rooms' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Unit Number</label>
                      <input 
                        type="text" 
                        value={editItem.number}
                        onChange={(e) => setEditItem({ ...editItem, number: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Category Type</label>
                      <select 
                         value={editItem.type}
                         onChange={(e) => setEditItem({ ...editItem, type: e.target.value as any })}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      >
                         {(globalHotelSettings.roomTypes || []).map(t => (
                           <option key={t} value={t}>{t}</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Base rate ($)</label>
                      <input 
                        type="number" 
                        value={editItem.rate}
                        onChange={(e) => setEditItem({ ...editItem, rate: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Maintenance Status</label>
                      <select 
                         value={editItem.status}
                         onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      >
                         <option value="Vacant Clean">Vacant Clean</option>
                         <option value="Occupied">Occupied</option>
                         <option value="Out of Order">Out of Order</option>
                         <option value="Maintenance">Maintenance Required</option>
                      </select>
                    </div>
                  </div>
                )}

                {category === 'guests' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Full Guest Identity</label>
                      <input 
                        type="text" 
                        value={editItem.name}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Nationality Registry</label>
                      <input 
                        type="text" 
                        value={editItem.nationality || ''}
                        onChange={(e) => setEditItem({ ...editItem, nationality: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Loyalty Status Tier</label>
                      <select 
                         value={editItem.status}
                         onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      >
                         {(globalHotelSettings.guestStatuses || []).map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                      </select>
                    </div>
                  </div>
                )}

                {category === 'inventory' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Item Designation</label>
                      <input 
                        type="text" 
                        value={editItem.name}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Physical Location</label>
                      <select 
                         value={editItem.location}
                         onChange={(e) => setEditItem({ ...editItem, location: e.target.value })}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      >
                         {(globalHotelSettings.inventoryLocations || []).map(l => (
                           <option key={l} value={l}>{l}</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Stock Unit (UOM)</label>
                      <select 
                         value={editItem.unit}
                         onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      >
                         {(globalHotelSettings.inventoryUnits || []).map(u => (
                           <option key={u} value={u}>{u}</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Current Inventory Ledger count</label>
                      <input 
                        type="number" 
                        value={editItem.currentStock}
                        onChange={(e) => setEditItem({ ...editItem, currentStock: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition active:scale-[0.98]"
                >
                  Commit Modifications to Registry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --------------- ATTRIBUTE MANAGER HELPER ---------------
const AttributeManager = ({ title, items, onUpdate }: { title: string, items: string[], onUpdate: (items: string[]) => void }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest">{title}</h4>
        <span className="text-[9px] font-bold text-slate-400">{items.length} items</span>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-850">
        {items.length === 0 ? (
          <span className="text-[10px] text-slate-400 italic">No attributes defined.</span>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 group">
              {item}
              <button 
                onClick={() => handleRemove(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
              >
                <X size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add ${title}...`}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <button 
          onClick={handleAdd}
          className="w-10 h-10 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 transition"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
