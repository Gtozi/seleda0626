/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Settings2, 
  BookOpen, 
  UtensilsCrossed, 
  CalendarClock,
  ChevronRight,
  TrendingUp,
  CircleDollarSign,
  Layers,
  ChefHat,
  ChevronDown,
  Info,
  Trash,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { MenuItem, MealPeriod } from './FoodBeveragePortal';

export default function MenuManagementModule() {
  const { formatAmount, addNotification, globalHotelSettings } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Monday');

  const categories = ['All', ...(globalHotelSettings.posCategories || [])];

  const [showNewDishModal, setShowNewDishModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    price: 15,
    category: (globalHotelSettings.posCategories?.[0] || 'Food') as any,
    available: true,
    mealPeriods: ['Lunch'] as any[],
    isFixedMenu: false,
    ingredients: [] as { itemId: string, name: string, quantity: number, unit: string }[]
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { 
      id: 'MP1', name: 'Standard Lodge Breakfast', price: 25, category: 'Meal Package', 
      available: true, mealPeriods: ['Breakfast'], isFixedMenu: true,
      recipe: { yield: 20, ingredients: [{ itemId: 'I3', name: 'Eggs', quantity: 40, unit: 'pcs' }, { itemId: 'I4', name: 'Bacon', quantity: 5, unit: 'kg' }] }
    },
    { 
      id: 'MP2', name: 'Traditional Lunch', price: 35, category: 'Meal Package', 
      available: true, mealPeriods: ['Lunch'], isFixedMenu: true,
      recipe: { yield: 20, ingredients: [{ itemId: 'I1', name: 'Beef Patty', quantity: 1, unit: 'pcs' }, { itemId: 'I2', name: 'Brioche Bun', quantity: 1, unit: 'pcs' }] }
    },
    { 
      id: 'MP3', name: 'Signature Dinner (Lodge style)', price: 45, category: 'Meal Package', 
      available: true, mealPeriods: ['Dinner'], isFixedMenu: true,
      recipe: { yield: 20, ingredients: [{ itemId: 'I5', name: 'Halloumi', quantity: 150, unit: 'g' }, { itemId: 'I6', name: 'Mixed Greens', quantity: 100, unit: 'g' }] }
    },
  ]);

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.name.trim()) return;
    
    const dishId = `Dish-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdItem: MenuItem = {
      id: dishId,
      name: newDish.name,
      price: Number(newDish.price) || 10,
      category: newDish.category,
      available: newDish.available,
      mealPeriods: newDish.mealPeriods as any[],
      isFixedMenu: newDish.isFixedMenu,
      recipe: {
        yield: 1,
        ingredients: newDish.ingredients
      }
    };

    setMenuItems(prev => [createdItem, ...prev]);
    addNotification(`New dish "${newDish.name}" registered and ${newDish.available ? 'ACTIVATED' : 'saved draft'}.`, 'success', 'Food & Beverage');
    setNewDish({
      name: '',
      price: 15,
      category: globalHotelSettings.posCategories?.[0] || 'Food',
      available: true,
      mealPeriods: ['Lunch'],
      isFixedMenu: false,
      ingredients: []
    });
    setShowNewDishModal(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans animate-fade-in relative min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[2rem] shadow-3xs">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise Menu Control</h3>
          <p className="text-[10px] text-slate-400 font-mono italic">Configuration of dishes, recipes, and cost structures.</p>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border dark:border-slate-700">
             {['B', 'L', 'D'].map(m => (
               <button key={m} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-tight text-slate-500 hover:text-indigo-600">{m}</button>
             ))}
           </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-56 bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2 pl-9 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button 
            id="register-new-dish-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDishModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-650 text-white rounded-xl text-[10px] font-black shadow-3xs hover:bg-indigo-700 transition flex items-center gap-2 uppercase tracking-widest cursor-pointer"
          >
             <Plus size={14} /> New Dish
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1 mr-4">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase ${
                selectedDay === day 
                ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mr-4" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-widest ${
              activeCategory === cat 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => {
              setSelectedItem(item);
              setShowRecipe(true);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-3xs flex gap-6 hover:border-indigo-400 transition-all group overflow-hidden relative cursor-pointer"
          >
            <div className="w-28 h-28 bg-slate-100 dark:bg-slate-850 rounded-[2rem] flex-shrink-0 flex items-center justify-center text-slate-300 relative overflow-hidden group-hover:scale-105 transition-transform shadow-inner">
               {item.image ? (
                 <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
               ) : (
                 <ChefHat size={36} strokeWidth={1.5} className="group-hover:text-indigo-400 transition-colors" />
               )}
               {item.isFixedMenu && (
                 <div className="absolute top-2 left-2 bg-amber-500 text-white p-1 rounded-lg shadow-sm" title="Buffet Item">
                    <Layers size={12} />
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{item.category}</span>
                      {item.recipe && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Recipe-Linked</span>}
                   </div>
                   <h4 className="text-lg font-black text-slate-850 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-2xl border dark:border-slate-700">{formatAmount(item.price)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {item.mealPeriods.map(p => (
                  <span key={p} className="text-[9px] font-black uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {p}
                  </span>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-between border-t dark:border-slate-800 border-slate-50">
                 <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-tighter transition-colors">
                       <BookOpen size={14} /> Full Recipe
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-tighter transition-colors">
                       <TrendingUp size={14} /> Margin Analysis
                    </button>
                 </div>
                 <button 
                   id={`toggle-active-${item.id}`}
                   onClick={(e) => {
                     e.stopPropagation();
                     const nextState = !item.available;
                     setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, available: nextState } : m));
                     addNotification(`"${item.name}" registered status is now ${nextState ? 'ACTIVE' : 'INACTIVE'}`, 'info', 'Food & Beverage');
                   }}
                   className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition cursor-pointer select-none ${
                     item.available 
                       ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
                       : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800 text-rose-750 dark:text-rose-450'
                   }`}
                 >
                    <div className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-tight">
                       {item.available ? 'Active' : 'Inactive'}
                    </span>
                 </button>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-x-1 translate-y-1 rotate-12 group-hover:rotate-0 transition-transform">
               <Settings2 size={64} />
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Slide-over/Panel (Mock Overlay) */}
      {showRecipe && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm animate-fade-in flex justify-end">
           <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in flex flex-col">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recipe Breakdown</h3>
                    <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase italic">{selectedItem.name}</p>
                 </div>
                 <button onClick={() => setShowRecipe(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:text-rose-600 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-[2rem] border dark:border-slate-800/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Production Yield</p>
                       <span className="text-2xl font-black">{selectedItem.recipe?.yield || 1} Servings</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-[2rem] border dark:border-slate-800/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estimated Plate Cost</p>
                       <span className="text-2xl font-black text-emerald-600">{formatAmount(selectedItem.price * 0.35)}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <h4 className="text-base font-black uppercase tracking-tight">Ingredients List</h4>
                       <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Add Ingredient</button>
                    </div>
                    <div className="space-y-2">
                       {selectedItem.recipe?.ingredients.map((ing, idx) => (
                         <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl hover:border-indigo-200 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-xs text-slate-400">{idx + 1}</div>
                               <div>
                                  <h5 className="text-xs font-black text-slate-850 dark:text-white uppercase">{ing.name}</h5>
                                  <span className="text-[10px] text-slate-400 font-mono">Stock ID: {ing.itemId}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <p className="text-xs font-black">{ing.quantity} {ing.unit}</p>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Req. Qty</span>
                               </div>
                               <button className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14} /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 flex gap-4">
                    <Info className="flex-shrink-0 text-amber-500" size={24} />
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">Changes to this recipe will trigger an immediate recalculation of current food cost percentages and update the sub-store requisition thresholds.</p>
                 </div>
              </div>

              <div className="p-8 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                 <button className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Print Card</button>
                 <button className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* New Dish Modal */}
      <AnimatePresence>
        {showNewDishModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-none"
            >
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                 <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Register &amp; Activate Dish</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Add new recipe item to the F&amp;B registry</p>
                 </div>
                 <button onClick={() => setShowNewDishModal(false)} className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xs hover:text-rose-600 transition-colors cursor-pointer">
                    <X size={16} />
                 </button>
              </div>

              <form onSubmit={handleCreateDish} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[75vh]">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Dish / Beverage Name</label>
                       <input 
                         type="text" 
                         required
                         value={newDish.name}
                         onChange={(e) => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="e.g. Grilled Salmon Steak"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Base Tariff / Selling Price ($)</label>
                       <input 
                         type="number" 
                         required
                         min="0"
                         step="0.01"
                         value={newDish.price}
                         onChange={(e) => setNewDish(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                         placeholder="25.00"
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Menu Category</label>
                       <select 
                         value={newDish.category}
                         onChange={(e) => setNewDish(prev => ({ ...prev, category: e.target.value as any }))}
                         className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer text-slate-900 dark:text-white"
                       >
                          {(globalHotelSettings.posCategories || []).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Initial Status</label>
                       <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setNewDish(prev => ({ ...prev, available: true }))}
                            className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                              newDish.available 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 font-black' 
                                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                          >
                             Active / Available
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewDish(prev => ({ ...prev, available: false }))}
                            className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                              !newDish.available 
                                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-600 font-black' 
                                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                          >
                             Inactive / Draft
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Meal Period Availability</label>
                    <div className="flex flex-wrap gap-2">
                       {['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Tea Time'].map(period => {
                          const isSelected = newDish.mealPeriods.includes(period);
                          return (
                            <button
                              key={period}
                              type="button"
                              onClick={() => {
                                setNewDish(prev => {
                                  const contains = prev.mealPeriods.includes(period);
                                  const updated = contains 
                                    ? prev.mealPeriods.filter(p => p !== period)
                                    : [...prev.mealPeriods, period];
                                  return { ...prev, mealPeriods: updated };
                                });
                              }}
                              className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-black' 
                                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-350 font-black'
                              }`}
                            >
                               {period}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">Recipe Ingredients Mapping (Link Stock SKUs)</span>
                       <button
                         type="button"
                         onClick={() => {
                           setNewDish(prev => ({
                             ...prev,
                             ingredients: [...prev.ingredients, { itemId: `Stock-${Math.floor(100+Math.random()*900)}`, name: '', quantity: 1, unit: 'pcs' }]
                           }));
                         }}
                         className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer"
                       >
                          + Add Ingredient
                       </button>
                    </div>

                    {newDish.ingredients.length === 0 ? (
                      <p className="text-[11px] font-semibold text-slate-450 italic leading-snug bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl text-center border border-dashed dark:border-slate-800">
                         No raw stock ingredients linked yet. Optional recipe deduction.
                      </p>
                    ) : (
                      <div className="space-y-2">
                         {newDish.ingredients.map((ing, idx) => (
                           <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-855 p-3 rounded-2xl border dark:border-slate-800 animate-slide-in">
                             <input 
                               type="text"
                               required
                               placeholder="e.g. Salmon fillet"
                               value={ing.name}
                               onChange={(e) => {
                                 const updated = [...newDish.ingredients];
                                 updated[idx].name = e.target.value;
                                 setNewDish(prev => ({ ...prev, ingredients: updated }));
                               }}
                               className="flex-1 min-w-0 bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                             />
                             <input 
                               type="number"
                               required
                               min="1"
                               value={ing.quantity}
                               onChange={(e) => {
                                 const updated = [...newDish.ingredients];
                                 updated[idx].quantity = Number(e.target.value) || 1;
                                 setNewDish(prev => ({ ...prev, ingredients: updated }));
                               }}
                               className="w-16 bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-center"
                             />
                             <input 
                               type="text"
                               required
                               placeholder="pcs"
                               value={ing.unit}
                               onChange={(e) => {
                                 const updated = [...newDish.ingredients];
                                 updated[idx].unit = e.target.value;
                                 setNewDish(prev => ({ ...prev, ingredients: updated }));
                               }}
                               className="w-16 bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-center"
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 setNewDish(prev => ({
                                   ...prev,
                                   ingredients: prev.ingredients.filter((_, i) => i !== idx)
                                 }));
                               }}
                               className="p-2 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                             >
                                <Trash size={14} />
                             </button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowNewDishModal(false)}
                      className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 cursor-pointer"
                    >
                       Register &amp; Activate
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
         <div className="bg-indigo-50 dark:bg-indigo-950/20 p-7 rounded-[2.5rem] space-y-3 border border-indigo-100 dark:border-indigo-900/30">
            <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-tight flex items-center gap-3">
               <CalendarClock size={20} className="text-indigo-500" /> Period Scheduling
            </h4>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed font-bold italic">Smart menu switching based on current time.</p>
         </div>
         <div className="bg-emerald-50 dark:bg-emerald-950/20 p-7 rounded-[2.5rem] space-y-3 border border-emerald-100 dark:border-emerald-900/30">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-tight flex items-center gap-3">
               <ChefHat size={20} className="text-emerald-500" /> Recipe Deductions
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-bold italic">Automatic sub-store stock depletion on POS sale.</p>
         </div>
         <div className="bg-amber-50 dark:bg-amber-950/20 p-7 rounded-[2.5rem] space-y-3 border border-amber-100 dark:border-amber-900/30">
            <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight flex items-center gap-3">
               <CircleDollarSign size={20} className="text-amber-500" /> Food Costing
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-bold italic">Real-time tracking of plate cost vs revenue.</p>
         </div>
      </div>
    </div>
  );
}
