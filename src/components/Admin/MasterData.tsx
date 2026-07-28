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
  FileCheck,
  Image as ImageIcon,
  Bed,
  Wifi,
  Coffee,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { Room, RoomType, RoomStatus, Guest, GuestStatus, RoomTypeDetail } from '../../types/erp';
import { InventoryItem } from '../../types/inventory';
import { ChartOfAccount } from '../../types/finance';
import RoomsCategory from './MasterData/RoomsCategory';
import GuestsCategory from './MasterData/GuestsCategory';
import InventoryCategory from './MasterData/InventoryCategory';
import FinanceCategory from './MasterData/FinanceCategory';
import InfrastructureCategory from './MasterData/InfrastructureCategory';
import AttributesCategory from './MasterData/AttributesCategory';

export default function MasterData() {
  const {
    rooms,
    roomTypes,
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

  const CATEGORY_TABS = [
    { id: 'rooms' as const, label: 'Rooms & Properties', icon: Home },
    { id: 'infrastructure' as const, label: 'Property Infrastructure', icon: MapPin },
    { id: 'attributes' as const, label: 'Registry Attributes', icon: Sliders },
  ];
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
    roomTypeId: '' as string,
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
      roomTypeId: roomForm.roomTypeId || undefined,
      floor: Number(roomForm.floor) || 1,
      status: roomForm.status,
      rate: Number(roomForm.rate) || 100,
      features: roomForm.features
    });
    setRoomForm({ number: '', type: 'Double', roomTypeId: '', floor: 1, rate: 150, status: 'Vacant Clean', features: [] });
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

      {/* Horizontal Tab Navigation */}
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {CATEGORY_TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => {
                setCategory(t.id);
                setSearchQuery('');
                setInspectItem(null);
              }}
                className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                  category === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
                }`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="space-y-6">
           
           {/* ROOMS CATEGORY */}
           {category === 'rooms' && (
             <RoomsCategory
               rooms={rooms}
               filteredRooms={filteredRooms}
               formatAmount={formatAmount}
               onInspect={setInspectItem}
               onEdit={(room) => { setEditItem(room); setShowEditModal(true); }}
               onDelete={(roomId) => { deleteRoom(roomId); }}
               onAddRoom={() => { setCategory('rooms'); setShowAddModal(true); }}
             />
           )}

           {/* GUESTS CATEGORY */}
           {category === 'guests' && (
             <GuestsCategory
               guests={guests}
               filteredGuests={filteredGuests}
               onInspect={setInspectItem}
               onEdit={(guest) => { setEditItem(guest); setShowEditModal(true); }}
               onAddGuest={() => { setCategory('guests'); setShowAddModal(true); }}
             />
           )}

           {/* INVENTORY CATEGORY */}
           {category === 'inventory' && (
             <InventoryCategory
               inventoryItems={inventoryItems}
               filteredInventory={filteredInventory}
               reorderAlertCount={reorderAlertCount}
               totalStockVal={totalStockVal}
               formatAmount={formatAmount}
               onInspect={setInspectItem}
               onEdit={(item) => { setEditItem(item); setShowEditModal(true); }}
               onDelete={(itemId) => { deleteInventoryItem(itemId); }}
               onAddItem={() => { setCategory('inventory'); setShowAddModal(true); }}
             />
           )}

           {/* CHART OF ACCOUNTS / FINANCIALS CATEGORY */}
           {category === 'finance' && (
             <FinanceCategory
               chartOfAccounts={chartOfAccounts}
               filteredAccounts={filteredAccounts}
               totalAssets={totalAssets}
               totalLiabilities={totalLiabilities}
               formatAmount={formatAmount}
               onInspect={setInspectItem}
               onDelete={(accountCode) => { deleteAccount(accountCode); triggerSuccess(`Account record mapped at code [${accountCode}] removed.`); }}
               onAddAccount={() => { setCategory('finance'); setShowAddModal(true); }}
             />
           )}

            {/* INFRASTRUCTURE CATEGORY */}
            {category === 'infrastructure' && (
              <InfrastructureCategory
                floors={globalHotelSettings.floors}
                departments={globalHotelSettings.departments}
              />
            )}

           {/* REGISTRY ATTRIBUTES CATEGORY */}
           {category === 'attributes' && (
             <AttributesCategory
               roomTypesDetailed={globalHotelSettings.roomTypesDetailed || []}
               roomFeatures={globalHotelSettings.roomFeatures || []}
               guestStatuses={globalHotelSettings.guestStatuses || []}
               inventoryCategories={globalHotelSettings.inventoryCategories || []}
               inventoryLocations={globalHotelSettings.inventoryLocations || []}
               inventoryUnits={globalHotelSettings.inventoryUnits || []}
               departments={globalHotelSettings.departments || []}
               floors={globalHotelSettings.floors || []}
               onGlobalSettingsChange={submitGlobalSettingsChange}
             />
           )}
      </div>

      {/* INSPECT DETAIL MODAL */}
      <ModalSystem
        isOpen={!!inspectItem}
        onClose={() => setInspectItem(null)}
        title={category === 'rooms' ? `Unit Property: Room ${inspectItem?.number}` : category === 'guests' ? `Guest Profile: ${inspectItem?.name}` : category === 'inventory' ? `SKU Registry: ${inspectItem?.name}` : `Ledger Code: ${inspectItem?.code}`}
        subtitle="SYS_MASTER_METADATA"
        variant="info"
        size="lg"
        showFooter={false}
      >
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {!inspectItem && (
                  <div className="text-center text-slate-400 py-8">No item selected.</div>
                )}
                {inspectItem && category === 'rooms' && (
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

                {inspectItem && category === 'guests' && (
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

                {inspectItem && category === 'inventory' && (
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

                {inspectItem && category === 'finance' && (
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
      </ModalSystem>

      {/* CREATE NEW MASTER ENTRY MODAL */}
      <ModalSystem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={category === 'rooms' ? 'Map New Property Room' : category === 'guests' ? 'Register Guest Profile Card' : category === 'inventory' ? 'Onboard Master SKU Item' : 'Map Accounting Ledger Code'}
        subtitle="Mapped Entry Creator"
        variant="form"
        size="lg"
        showFooter={false}
      >
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
                        onChange={(e) => {
                          const selectedType = e.target.value;
                          const selectedRoomType = roomTypes.find(rt => rt.name === selectedType);
                          setRoomForm({ 
                            ...roomForm, 
                            type: selectedType as RoomType,
                            roomTypeId: selectedRoomType?.id || '',
                            rate: selectedRoomType?.basePrice || roomForm.rate
                          });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {roomTypes.filter(rt => rt.isActive).map(rt => (
                          <option key={rt.id} value={rt.name}>{rt.name} - ${rt.basePrice}/night</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Room Type Preview Card */}
                  {roomForm.roomTypeId && (() => {
                    const selectedRoomType = roomTypes.find(rt => rt.id === roomForm.roomTypeId);
                    if (!selectedRoomType) return null;
                    return (
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-3">
                          {selectedRoomType.imageUrl1 && (
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={selectedRoomType.imageUrl1} alt={selectedRoomType.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">{selectedRoomType.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{selectedRoomType.description}</p>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1 text-[9px] text-slate-600">
                                <DollarSign size={10} className="text-emerald-500" />
                                <span className="font-bold">${selectedRoomType.basePrice}/night</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-slate-600">
                                <Users size={10} className="text-indigo-500" />
                                <span className="font-bold">{selectedRoomType.maxOccupancy} guests</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedRoomType.amenities.slice(0, 4).map((amenity, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[8px]">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
      </ModalSystem>

      {/* EDIT REGISTRY MODAL */}
      <ModalSystem
        isOpen={showEditModal && !!editItem}
        onClose={() => setShowEditModal(false)}
        title="Modify Registry Reference"
        subtitle={`Editing ${category.slice(0, -1)} Record: ${editItem?.id}`}
        variant="form"
        size="xl"
        showFooter={false}
      >
              <form onSubmit={handleUpdateItem} className="space-y-6">
                {!editItem && (
                  <div className="text-center py-8 text-slate-400 text-xs">No item selected for editing</div>
                )}
                {editItem && category === 'rooms' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Unit Number</label>
                      <input 
                        type="text" 
                        value={editItem.number || ''}
                        onChange={(e) => setEditItem({ ...editItem, number: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Category Type</label>
                      <select 
                         value={editItem.type || ''}
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

                {editItem && category === 'guests' && (
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

                {editItem && category === 'inventory' && (
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
      </ModalSystem>
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
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">{title}</h4>
        <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        {items.length === 0 ? (
          <span className="text-[10px] text-slate-400 italic w-full text-center py-4">No attributes defined</span>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 group hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              {item}
              <button 
                onClick={() => handleRemove(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-rose-500"
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
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <button 
          onClick={handleAdd}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

// --------------- ROOM TYPE MANAGER HELPER ---------------
interface RoomTypeData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  bedConfiguration: string;
  roomSizeSqm: number;
  amenities: string[];
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const RoomTypeManager = ({ roomTypes, onUpdate }: { roomTypes: RoomTypeData[], onUpdate: (roomTypes: RoomTypeData[]) => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomTypeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoomTypes = roomTypes.filter(rt => 
    rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (roomTypeData: Partial<RoomTypeData>) => {
    if (editingRoomType) {
      // Update existing
      const updated = roomTypes.map(rt => 
        rt.id === editingRoomType.id 
          ? { ...rt, ...roomTypeData, updatedAt: new Date().toISOString() }
          : rt
      );
      onUpdate(updated);
      setEditingRoomType(null);
    } else {
      // Add new
      const newRoomType: RoomTypeData = {
        id: `rt_${Date.now()}`,
        name: roomTypeData.name || '',
        description: roomTypeData.description || '',
        basePrice: roomTypeData.basePrice || 100,
        maxOccupancy: roomTypeData.maxOccupancy || 2,
        bedConfiguration: roomTypeData.bedConfiguration || '1 King Bed',
        roomSizeSqm: roomTypeData.roomSizeSqm || 28,
        amenities: roomTypeData.amenities || [],
        imageUrl1: roomTypeData.imageUrl1 || '',
        imageUrl2: roomTypeData.imageUrl2 || '',
        imageUrl3: roomTypeData.imageUrl3 || '',
        isActive: true,
        displayOrder: roomTypes.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdate([...roomTypes, newRoomType]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = roomTypes.filter(rt => rt.id !== id);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">Room Types</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{roomTypes.length}</span>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search room types..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredRoomTypes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No room types found
          </div>
        ) : (
          filteredRoomTypes.map((rt) => (
            <div key={rt.id} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 transition-colors">
              <div className="flex gap-4">
                {rt.imageUrl1 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={rt.imageUrl1} alt={rt.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">{rt.name}</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{rt.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingRoomType(rt); setShowAddModal(true); }}
                        className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rt.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <DollarSign size={10} className="text-emerald-500" />
                      <span className="font-bold">{rt.basePrice}/night</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Users size={10} className="text-indigo-500" />
                      <span className="font-bold">{rt.maxOccupancy} guests</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Maximize size={10} className="text-amber-500" />
                      <span className="font-bold">{rt.roomSizeSqm}sqm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <RoomTypeModal
          roomType={editingRoomType}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingRoomType(null); }}
        />
      )}
    </div>
  );
};

// --------------- ROOM TYPE MODAL ---------------
const RoomTypeModal = ({ roomType, onSave, onClose }: { roomType: RoomTypeData | null, onSave: (data: Partial<RoomTypeData>) => void, onClose: () => void }) => {
  const [form, setForm] = useState<Partial<RoomTypeData>>(roomType || {
    name: '',
    description: '',
    basePrice: 100,
    maxOccupancy: 2,
    bedConfiguration: '1 King Bed',
    roomSizeSqm: 28,
    amenities: [],
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    isActive: true,
    displayOrder: 0
  });
  const [amenityInput, setAmenityInput] = useState('');

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !form.amenities?.includes(amenityInput.trim())) {
      setForm({ ...form, amenities: [...(form.amenities || []), amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setForm({ ...form, amenities: form.amenities?.filter(a => a !== amenity) || [] });
  };

  return (
    <ModalSystem
      isOpen={true}
      onClose={onClose}
      title={roomType ? 'Edit Room Type' : 'Add New Room Type'}
      variant="form"
      size="xl"
      showFooter={true}
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
          >
            {roomType ? 'Save Changes' : 'Create Room Type'}
          </button>
        </div>
      }
    >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Room Type Name</label>
              <input 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Deluxe Suite"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Base Price (per night)</label>
              <input 
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Description</label>
            <textarea 
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              placeholder="Describe the room type features and amenities..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Max Occupancy</label>
              <input 
                type="number"
                value={form.maxOccupancy}
                onChange={(e) => setForm({ ...form, maxOccupancy: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Room Size (sqm)</label>
              <input 
                type="number"
                value={form.roomSizeSqm}
                onChange={(e) => setForm({ ...form, roomSizeSqm: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="28"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Bed Configuration</label>
              <input 
                value={form.bedConfiguration}
                onChange={(e) => setForm({ ...form, bedConfiguration: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="1 King Bed"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Amenities</label>
            <div className="flex gap-2">
              <input 
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Add amenity (e.g. WiFi, TV, AC)"
              />
              <button 
                onClick={handleAddAmenity}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.amenities?.map((amenity, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  {amenity}
                  <button 
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Images</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Primary Image</label>
                <input 
                  value={form.imageUrl1}
                  onChange={(e) => setForm({ ...form, imageUrl1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl1 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl1} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Secondary Image</label>
                <input 
                  value={form.imageUrl2}
                  onChange={(e) => setForm({ ...form, imageUrl2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl2 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl2} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Tertiary Image</label>
                <input 
                  value={form.imageUrl3}
                  onChange={(e) => setForm({ ...form, imageUrl3: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl3 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl3} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(form)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
          >
            {roomType ? 'Save Changes' : 'Create Room Type'}
          </button>
        </div>
    </ModalSystem>
  );
};
