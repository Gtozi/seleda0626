/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { toISODate } from '../../utils/date';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Coffee, 
  Utensils, 
  Moon, 
  AlertCircle,
  QrCode,
  UserCheck,
  History,
  Info,
  ChevronDown,
  Receipt
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { MealPeriod, MealPlanType } from './FoodBeveragePortal';

interface ServedMeal {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  mealPeriod: MealPeriod;
  date: string;
  timestamp: string;
  isExtra: boolean;
}

export default function GuestMealModule() {
  const { reservations, formatAmount, addFolioCharge, addNotification } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'validator' | 'history'>('validator');
  const [selectedMealPeriod, setSelectedMealPeriod] = useState<MealPeriod>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    return 'Dinner';
  });

  const [servedMeals, setServedMeals] = useState<ServedMeal[]>([]);

  const activeReservations = useMemo(() => {
    return reservations.filter(r => r.status === 'Check-In');
  }, [reservations]);

  const filteredGuests = useMemo(() => {
    return activeReservations.filter(r => 
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.roomNumber.includes(searchTerm)
    );
  }, [activeReservations, searchTerm]);

  const getMealPlan = (res: any): MealPlanType => {
    // In a real app, this would come from the reservation object
    if (res.mealPlan) return res.mealPlan as MealPlanType;
    
    // Mock derivation for the demo
    const lastDigit = res.id.slice(-1);
    if (lastDigit === '1') return 'Bed & Breakfast';
    if (lastDigit === '2') return 'Half Board';
    if (lastDigit === '3') return 'Full Board';
    if (lastDigit === '4') return 'Conference Package';
    if (lastDigit === '5') return 'Corporate Package';
    return 'Bed & Breakfast';
  };

  const isEntitled = (plan: MealPlanType, period: MealPeriod): boolean => {
    if (plan === 'Full Board' || plan === 'Corporate Package' || plan === 'Group Package') return true;
    if (plan === 'Half Board') return period === 'Breakfast' || period === 'Dinner';
    if (plan === 'Bed & Breakfast') return period === 'Breakfast';
    if (plan === 'Conference Package') return period === 'Lunch' || period === 'Morning Snack' || period === 'Afternoon Snack';
    return false;
  };

  const isAlreadyServed = (resId: string, period: MealPeriod) => {
    const today = toISODate();
    return servedMeals.some(s => s.reservationId === resId && s.mealPeriod === period && s.date === today);
  };

  const handleServeMeal = (res: any, isExtra: boolean = false) => {
    const plan = getMealPlan(res);
    const entitled = isEntitled(plan, selectedMealPeriod);
    
    if (isAlreadyServed(res.id, selectedMealPeriod)) {
      addNotification(`Guest ${res.guestName} already served ${selectedMealPeriod} today.`, 'warning', 'F&B');
      return;
    }

    if (!entitled && !isExtra) {
      addNotification(`${res.guestName} not entitled. Use 'Charge' instead.`, 'error', 'F&B');
      return;
    }

    if (isExtra) {
      addFolioCharge(res.id, {
        id: `MEAL-${Date.now()}`,
        date: new Date().toISOString(),
        description: `Extra ${selectedMealPeriod} Meal`,
        amount: 25.0, // Mock price for extra meal
        type: 'Other',
        // USALI tracking
        usaliCode: '6100',
        usaliRevenueCode: '6100',
        usaliCostCode: '3110',
        department: 'Restaurant'
      });
      addNotification(`Extra meal charged to room ${res.roomNumber}`, 'success', 'F&B');
    }

    const newServing: ServedMeal = {
      reservationId: res.id,
      guestName: res.guestName,
      roomNumber: res.roomNumber,
      mealPeriod: selectedMealPeriod,
      date: toISODate(),
      timestamp: new Date().toLocaleTimeString(),
      isExtra
    };

    setServedMeals([newServing, ...servedMeals]);
    addNotification(`${selectedMealPeriod} confirmed for Room ${res.roomNumber}`, 'success', 'F&B');
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setView('validator')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${view === 'validator' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Validator
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${view === 'history' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Today's Log
            </button>
         </div>

         {view === 'validator' && (
            <div className="flex flex-1 justify-center">
               <div className="flex bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-xl gap-1 border border-indigo-100 dark:border-indigo-800/30 overflow-x-auto max-w-[500px] scrollbar-none">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack'] as MealPeriod[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedMealPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        selectedMealPeriod === p 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {p === 'Breakfast' && <Coffee size={10} />}
                      {p === 'Lunch' && <Utensils size={10} />}
                      {p === 'Dinner' && <Moon size={10} />}
                      {p.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>
         )}

         <div className="relative">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
           <input
             type="text"
             placeholder="Search Guest or Room..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full md:w-64 bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2 pl-9 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
           />
         </div>
      </div>

      {view === 'validator' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.map(res => {
            const plan = getMealPlan(res);
            const entitled = isEntitled(plan, selectedMealPeriod);
            const served = isAlreadyServed(res.id, selectedMealPeriod);

            return (
              <div key={res.id} className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] p-6 shadow-3xs space-y-5 transition-all group hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 ${served ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{res.id}</span>
                    <h4 className="text-xl font-black text-slate-850 dark:text-white leading-tight">Room {res.roomNumber}</h4>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight truncate max-w-[150px]">{res.guestName}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    plan === 'Full Board' || plan === 'Corporate Package' || plan === 'Group Package' ? 'bg-emerald-500 text-white' :
                    plan === 'Half Board' ? 'bg-indigo-500 text-white' :
                    plan === 'Conference Package' ? 'bg-amber-500 text-white' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {plan}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border dark:border-slate-800/50">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full ${entitled ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'}`} />
                         <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                           {entitled ? 'Entitled' : 'Extra Charge'}
                         </span>
                      </div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border dark:border-slate-800/50 text-right">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Pax Count</p>
                      <span className="text-sm font-black text-slate-850 dark:text-white">{res.adults + res.children} Guests</span>
                   </div>
                </div>

                <div className="pt-2">
                  {served ? (
                    <div className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border border-emerald-100 dark:border-emerald-800/30">
                      <CheckCircle2 size={16} /> VALIDATED & SERVED
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       <button
                         onClick={() => handleServeMeal(res)}
                         className={`flex-[2] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all shadow-lg ${
                           entitled 
                           ? 'bg-slate-900 dark:bg-white dark:text-slate-950 text-white hover:bg-indigo-600 shadow-slate-900/10' 
                           : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                         }`}
                         disabled={!entitled}
                       >
                         {entitled ? <UserCheck size={16} /> : <XCircle size={16} />}
                         {entitled ? `SERVE ${selectedMealPeriod.toUpperCase()}` : 'INELIGIBLE'}
                       </button>
                       {!entitled && (
                          <button
                            onClick={() => handleServeMeal(res, true)}
                            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-amber-500/20 transition-all"
                          >
                             <Receipt size={16} /> CHARGE
                          </button>
                       )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 dark:bg-slate-850 border-b dark:border-slate-800">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Time</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Guest</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Room</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Period</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                 {servedMeals.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                       <td className="p-4 text-xs font-mono font-bold text-slate-400">{log.timestamp}</td>
                       <td className="p-4 font-black text-slate-850 dark:text-white text-xs">{log.guestName}</td>
                       <td className="p-4 text-xs font-bold text-indigo-600">{log.roomNumber}</td>
                       <td className="p-4 text-xs font-bold text-slate-500 uppercase">{log.mealPeriod}</td>
                       <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.isExtra ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {log.isExtra ? 'Paid Extra' : 'Included'}
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-500">
                             <CheckCircle2 size={12} /> Confirmed
                          </div>
                       </td>
                    </tr>
                 ))}
                 {servedMeals.length === 0 && (
                    <tr>
                       <td colSpan={6} className="p-20 text-center text-slate-400 font-mono text-xs uppercase italic tracking-widest">No meals logged for this period</td>
                    </tr>
                 ) }
              </tbody>
           </table>
        </div>
      )}

      {view === 'validator' && filteredGuests.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-150 rounded-[40px] flex flex-col items-center justify-center space-y-4">
           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700"><Users size={48} className="text-slate-200" /></div>
           <div className="space-y-1">
              <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">No Guests Found</h3>
              <p className="text-[10px] text-slate-300 font-mono italic uppercase">Check filters or reservation status</p>
           </div>
        </div>
      )}
    </div>
  );
}
