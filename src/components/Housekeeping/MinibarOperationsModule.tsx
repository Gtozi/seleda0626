/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  DollarSign,
  Filter,
  MapPin,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface MinibarItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  threshold: number;
}

interface MinibarRecord {
  id: string;
  roomNumber: string;
  items: Array<{ itemId: string; name: string; quantity: number; price: number }>;
  total: number;
  status: 'Pending' | 'Posted' | 'Verified';
  recordedBy: string;
  recordedAt: string;
  postedToFolio?: boolean;
}

const minibarInventory: MinibarItem[] = [
  { id: 'MB-001', name: 'Cola 330ml', category: 'Soft Drinks', price: 3.50, stock: 45, threshold: 20 },
  { id: 'MB-002', name: 'Sparkling Water', category: 'Soft Drinks', price: 4.00, stock: 30, threshold: 15 },
  { id: 'MB-003', name: 'Orange Juice', category: 'Juices', price: 5.00, stock: 25, threshold: 10 },
  { id: 'MB-004', name: 'Mineral Water', category: 'Water', price: 3.00, stock: 50, threshold: 25 },
  { id: 'MB-005', name: 'Beer 330ml', category: 'Alcohol', price: 6.00, stock: 35, threshold: 15 },
  { id: 'MB-006', name: 'Red Wine', category: 'Alcohol', price: 12.00, stock: 20, threshold: 8 },
  { id: 'MB-007', name: 'Chocolate Bar', category: 'Snacks', price: 4.50, stock: 40, threshold: 15 },
  { id: 'MB-008', name: 'Mixed Nuts', category: 'Snacks', price: 5.50, stock: 30, threshold: 12 },
  { id: 'MB-009', name: 'Potato Chips', category: 'Snacks', price: 3.00, stock: 55, threshold: 20 },
  { id: 'MB-010', name: 'Energy Drink', category: 'Soft Drinks', price: 5.00, stock: 28, threshold: 10 },
];

export default function MinibarOperationsModule() {
  const [records, setRecords] = useState<MinibarRecord[]>([
    { 
      id: 'MBR-101', 
      roomNumber: '101', 
      items: [
        { itemId: 'MB-001', name: 'Cola 330ml', quantity: 2, price: 3.50 },
        { itemId: 'MB-007', name: 'Chocolate Bar', quantity: 1, price: 4.50 }
      ], 
      total: 11.50, 
      status: 'Pending', 
      recordedBy: 'Staff A', 
      recordedAt: '2026-05-30 09:15' 
    },
    { 
      id: 'MBR-102', 
      roomNumber: '304', 
      items: [
        { itemId: 'MB-005', name: 'Beer 330ml', quantity: 3, price: 6.00 },
        { itemId: 'MB-006', name: 'Red Wine', quantity: 1, price: 12.00 }
      ], 
      total: 30.00, 
      status: 'Posted', 
      recordedBy: 'Staff B', 
      recordedAt: '2026-05-30 08:30',
      postedToFolio: true
    },
  ]);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Posted' | 'Verified'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MinibarRecord | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ itemId: string; quantity: number }>>([]);

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'All' || record.status === filter;
    const matchesSearch = record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-emerald-500 text-white';
      case 'Verified': return 'bg-purple-500 text-white';
      case 'Pending': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handleAddItem = (itemId: string) => {
    const existing = selectedItems.find(i => i.itemId === itemId);
    if (existing) {
      setSelectedItems(prev => prev.map(i => 
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems(prev => [...prev, { itemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.itemId === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return newQty === 0 ? null : { ...i, quantity: newQty };
      }
      return i;
    }).filter(Boolean) as any);
  };

  const handleSaveRecord = () => {
    if (!selectedRoom || selectedItems.length === 0) return;

    const items = selectedItems.map(si => {
      const item = minibarInventory.find(i => i.id === si.itemId);
      return {
        itemId: si.itemId,
        name: item?.name || '',
        quantity: si.quantity,
        price: item?.price || 0
      };
    });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newRecord: MinibarRecord = {
      id: `MBR-${Date.now()}`,
      roomNumber: selectedRoom,
      items,
      total,
      status: 'Pending',
      recordedBy: 'Current User',
      recordedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setRecords(prev => [newRecord, ...prev]);
    setSelectedRoom('');
    setSelectedItems([]);
    setIsRecording(false);
  };

  const handlePostToFolio = (recordId: string) => {
    setRecords(prev => prev.map(r => 
      r.id === recordId ? { ...r, status: 'Posted', postedToFolio: true } : r
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, si) => {
      const item = minibarInventory.find(i => i.id === si.itemId);
      return sum + (item?.price || 0) * si.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Minibar Operations</h2>
          <p className="text-xs text-slate-500 font-mono italic">Track minibar consumption, stock verification, and charge posting to PMS.</p>
        </div>
        <button 
          onClick={() => setIsRecording(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={14} /> Record Consumption
        </button>
      </div>

      {isRecording ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Record Minibar Consumption</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Select room and consumed items</p>
            </div>
            <button 
              onClick={() => setIsRecording(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <XCircle size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Room Number</label>
              <input 
                type="text"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                placeholder="Enter room number..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Items</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {minibarInventory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedItems.some(si => si.itemId === item.id)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-[10px] font-black text-slate-900 dark:text-white mb-1">{item.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500">${item.price.toFixed(2)}</span>
                      {selectedItems.find(si => si.itemId === item.id) && (
                        <span className="text-[9px] font-black text-indigo-600">
                          x{selectedItems.find(si => si.itemId === item.id)?.quantity}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Items</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {selectedItems.map(si => {
                    const item = minibarInventory.find(i => i.id === si.itemId);
                    return (
                      <div key={si.itemId} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item?.name}</span>
                          <span className="text-[9px] text-slate-500">${item?.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(si.itemId, -1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-black hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-black w-6 text-center">{si.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(si.itemId, 1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-black hover:bg-slate-200"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(si.itemId)}
                            className="ml-2 text-rose-500 hover:text-rose-700"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => setIsRecording(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRecord}
                disabled={!selectedRoom || selectedItems.length === 0}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> Save Record
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['All', 'Pending', 'Posted', 'Verified'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    filter === f 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search room number..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map(record => (
              <div key={record.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{record.id}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">Room {record.roomNumber}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-bold">{record.recordedBy}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {record.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-600 dark:text-slate-400">{item.name} x{item.quantity}</span>
                      <span className="font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-mono font-black block">Total</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">${record.total.toFixed(2)}</span>
                  </div>
                  {record.status === 'Pending' && (
                    <button 
                      onClick={() => handlePostToFolio(record.id)}
                      className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5"
                    >
                      <DollarSign size={10} /> Post to Folio
                    </button>
                  )}
                  {record.postedToFolio && (
                    <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5">
                      <CheckCircle2 size={10} /> Posted
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
