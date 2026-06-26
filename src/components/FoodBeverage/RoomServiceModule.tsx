/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Utensils, 
  Search, 
  Clock, 
  CheckCircle2, 
  Plus, 
  X, 
  Search as SearchIcon,
  ChefHat,
  Bike,
  PackageCheck,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { MenuItem, FBOrder } from './FoodBeveragePortal';

export default function RoomServiceModule() {
  const { formatAmount, reservations, addFolioCharge, addNotification } = useERP();
  
  const [activeOrders, setActiveOrders] = useState<FBOrder[]>([
    { 
      id: 'RS-701', 
      source: 'Room Service', 
      customerType: 'In-House Guest',
      roomNumber: '102', 
      reservationId: 'RES-001',
      guestName: 'Amanda Sterling', 
      items: [
        { menuItemId: 'M2', quantity: 1, name: 'Caesar Salad', price: 14 },
        { menuItemId: 'M5', quantity: 1, name: 'Red Wine (Glass)', price: 12 }
      ],
      status: 'In Progress', 
      timestamp: '12:15 PM',
      total: 26
    },
    { 
      id: 'RS-702', 
      source: 'Room Service', 
      customerType: 'In-House Guest',
      roomNumber: '304', 
      reservationId: 'RES-003',
      guestName: 'Guest Member C', 
      items: [
        { menuItemId: 'M3', quantity: 2, name: 'Margherita Pizza', price: 16.5 }
      ],
      status: 'Ready', 
      timestamp: '12:30 PM',
      total: 33
    },
  ]);

  const [searchRoom, setSearchRoom] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedResId, setSelectedResId] = useState('');
  const [cart, setCart] = useState<{ menuItemId: string, quantity: number, name: string, price: number }[]>([]);

  const [showHistory, setShowHistory] = useState(false);

  const roomServiceMenu: MenuItem[] = [
    { id: 'M1', name: 'Classic Burger', price: 18.5, category: 'Food', available: true, mealPeriods: ['Lunch', 'Dinner'], isFixedMenu: false },
    { id: 'M2', name: 'Caesar Salad', price: 14, category: 'Food', available: true, mealPeriods: ['Lunch', 'Dinner'], isFixedMenu: false },
    { id: 'M4', name: 'Tiramisu', price: 9, category: 'Desserts', available: true, mealPeriods: ['Lunch', 'Dinner'], isFixedMenu: false },
    { id: 'M9', name: 'Orange Juice', price: 5, category: 'Beverage', available: true, mealPeriods: ['Breakfast', 'Lunch', 'Dinner'], isFixedMenu: false },
    { id: 'M10', name: 'Club Sandwich', price: 16, category: 'Food', available: true, mealPeriods: ['Lunch', 'Dinner'], isFixedMenu: false },
  ];

  const { globalHotelSettings } = useERP();
  const outletCategories = globalHotelSettings.posOutletCategories?.['Room Service'] || globalHotelSettings.posCategories || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredMenu = roomServiceMenu.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { menuItemId: item.id, quantity: 1, name: item.name, price: item.price }]);
    }
  };

  const submitRoomServiceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const res = reservations.find(r => r.id === selectedResId);
    if (!res || cart.length === 0) return;

    const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const newOrder: FBOrder = {
      id: `RS-${Math.floor(Math.random() * 900) + 100}`,
      source: 'Room Service',
      customerType: 'In-House Guest',
      roomNumber: res.roomNumber,
      reservationId: res.id,
      guestName: res.guestName,
      items: [...cart],
      status: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total
    };

    setActiveOrders([newOrder, ...activeOrders]);
    addNotification(`Room service order ${newOrder.id} registered for Room ${res.roomNumber}`, 'success', 'F&B');
    setShowOrderForm(false);
    setCart([]);
    setSelectedResId('');
  };

  const updateOrderStatus = (orderId: string, nextStatus: FBOrder['status']) => {
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status: nextStatus };
        if (nextStatus === 'Delivered') {
          // Posting to folio!
          if (order.reservationId) {
            addFolioCharge(order.reservationId, {
              amount: order.total,
              description: `Room Service: ${order.id} - ${order.items.map(i => i.name).join(', ')}`
            });
            addNotification(`${order.id} total of ${formatAmount(order.total)} posted to Room ${order.roomNumber} folio.`, 'success', 'F&B');
          }
        }
        return updated;
      }
      return order;
    }));
  };

  const filteredOrders = activeOrders.filter(o => 
    o.roomNumber?.includes(searchRoom) || o.guestName.toLowerCase().includes(searchRoom.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Room Service Queue</h3>
          <p className="text-[10px] text-slate-400">Total Orders: {activeOrders.length} | In Preparation: {activeOrders.filter(o => o.status === 'In Progress').length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Room # or Guest..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2 pl-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-44"
            />
          </div>
          <button 
            onClick={() => setShowOrderForm(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-3xs"
          >
            <Plus size={14} /> NEW ORDER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs space-y-4 hover:border-slate-300 transition-colors animate-fade-in relative overflow-hidden group">
            {/* Status Ribbon */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black font-mono tracking-tighter uppercase ${
              order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
              order.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
              order.status === 'Ready' ? 'bg-teal-100 text-teal-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {order.status}
            </div>

            <div className="flex justify-between items-start">
               <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{order.id} • {order.timestamp}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">Room {order.roomNumber}</h4>
                  <p className="text-[10px] text-slate-500">{order.guestName}</p>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-slate-950 dark:text-white block">{formatAmount(order.total)}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono">{order.items.length} Items</span>
               </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t dark:border-slate-800">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatAmount(item.price * item.quantity)}</span>
                 </div>
               ))}
            </div>

            <div className="pt-4 flex gap-2">
               {order.status === 'Pending' && (
                 <button 
                  onClick={() => updateOrderStatus(order.id, 'In Progress')}
                  className="flex-1 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-100"
                 >
                   <ChefHat size={12} /> START PREP
                 </button>
               )}
               {order.status === 'In Progress' && (
                 <button 
                  onClick={() => updateOrderStatus(order.id, 'Ready')}
                  className="flex-1 py-1.5 bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-teal-100"
                 >
                   <CheckCircle2 size={12} /> MARK READY
                 </button>
               )}
               {order.status === 'Ready' && (
                 <button 
                  onClick={() => updateOrderStatus(order.id, 'Delivered')}
                  className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 shadow-3xs"
                 >
                   <Bike size={12} /> DISPATCH & BILL
                 </button>
               )}
               {order.status === 'Delivered' && (
                 <div className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                   <PackageCheck size={12} /> DELIVERED & BILLED
                 </div>
               )}
               <button 
                onClick={() => setShowHistory(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                 <History size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Intake Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl">
                    <History size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Lifecycle Log</h3>
               </div>
               <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {activeOrders.map(o => (
                <div key={o.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-indigo-600">{o.id}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-slate-500">{o.timestamp}</span>
                  </div>
                  <span className="font-bold text-slate-400 uppercase text-[9px]">{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in shadow-2xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                   <Utensils size={24} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white">New Room Service Order</h3>
                   <p className="text-xs text-slate-400">Intake station for active hotel guest demands</p>
                 </div>
              </div>
              <button 
                onClick={() => { setShowOrderForm(false); setCart([]); }}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRoomServiceOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Room Selection</label>
                  <select
                    required
                    value={selectedResId}
                    onChange={(e) => setSelectedResId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-bold"
                  >
                    <option value="">Select In-House Room...</option>
                    {reservations.filter(r => r.status === 'Check-In').map(r => (
                      <option key={r.id} value={r.id}>Room {r.roomNumber} - {r.guestName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                 <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Select Menu Items</label>
                 
                 {/* Category Selection */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   <button
                     type="button"
                     onClick={() => setSelectedCategory('All')}
                     className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                       selectedCategory === 'All'
                         ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                         : 'bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-white'
                     }`}
                   >
                     All
                   </button>
                   {outletCategories.map(cat => (
                     <button
                       key={cat}
                       type="button"
                       onClick={() => setSelectedCategory(cat)}
                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                         selectedCategory === cat
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                           : 'bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-white'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                   {filteredMenu.map(item => (
                     <button
                       key={item.id}
                       type="button"
                       onClick={() => addToCart(item)}
                       className="p-3 bg-white dark:bg-slate-850 border dark:border-slate-800 rounded-2xl text-left hover:border-indigo-500 group transition-all"
                     >
                       <span className="text-[8px] font-mono text-slate-400 block uppercase">{item.category}</span>
                       <h4 className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                       <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block mt-1">{formatAmount(item.price)}</span>
                     </button>
                   ))}
                 </div>
              </div>

              {cart.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl space-y-3">
                  <h4 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest border-b dark:border-slate-800 pb-2">Order Summary</h4>
                  <div className="space-y-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex gap-2">
                          <span className="font-mono text-slate-400">{item.quantity}x</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold">{formatAmount(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-center text-lg font-black text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatAmount(cart.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                 <button 
                  type="button"
                  onClick={() => { setShowOrderForm(false); setCart([]); }}
                  className="px-6 py-3 border dark:border-slate-800 rounded-2xl text-xs font-bold font-sans hover:bg-slate-50 dark:hover:bg-slate-800"
                 >
                   CANCEL
                 </button>
                 <button 
                  type="submit"
                  disabled={!selectedResId || cart.length === 0}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   POST ORDER TO QUEUE
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
