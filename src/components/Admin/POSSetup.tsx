/**
 * POS Setup Module
 * Handles POS outlets, categories, printers, and outlet-category mappings
 */

import React, { useState } from 'react';
import { LayoutGrid, Store, Printer, Save, CheckCircle2, Plus, Settings } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function POSSetup() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'POS Environment Sync',
      `Outlets: ${(globalHotelSettings.posOutlets || []).join(', ') || 'none'}, Categories: ${(globalHotelSettings.posCategories || []).join(', ') || 'none'}, Printers: ${(globalHotelSettings.posPrinters || []).join(', ') || 'none'}`,
      'pos-config',
      {
        posOutlets: globalHotelSettings.posOutlets,
        posCategories: globalHotelSettings.posCategories,
        posPrinters: globalHotelSettings.posPrinters,
        posOutletCategories: globalHotelSettings.posOutletCategories,
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const updateOutlets = (items: string[]) => {
    submitGlobalSettingsChange('POS Outlet List', `Update POS outlets: ${items.join(', ') || 'none'}`, 'pos-config', { posOutlets: items });
  };

  const updateCategories = (items: string[]) => {
    submitGlobalSettingsChange('POS Category List', `Update POS categories: ${items.join(', ') || 'none'}`, 'pos-config', { posCategories: items });
  };

  const updatePrinters = (items: string[]) => {
    submitGlobalSettingsChange('POS Printer List', `Update POS printers: ${items.join(', ') || 'none'}`, 'pos-config', { posPrinters: items });
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8">
        <div className="flex justify-between items-center border-b border-slate-50 pb-6">
          <div>
            <h2 className="text-lg font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-indigo-600" />
              POS Environment Configuration
            </h2>
            <p className="text-xs text-slate-400">Define POS Outlets, Item Categorizations, and Physical Printer Network mappings.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">POS Engine Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* POS Outlets */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Store size={14} className="text-indigo-600" /> Sales Outlets
            </h3>
            <div className="space-y-2">
              {(globalHotelSettings.posOutlets || []).map((outlet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-800">{outlet}</span>
                  <button 
                    onClick={() => updateOutlets((globalHotelSettings.posOutlets || []).filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                  >×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input 
                  placeholder="Add outlet..." 
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        updateOutlets([...(globalHotelSettings.posOutlets || []), target.value.trim()]);
                        target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* POS Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <LayoutGrid size={14} className="text-indigo-600" /> Item Categories
            </h3>
            <div className="space-y-2">
              {(globalHotelSettings.posCategories || []).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-800">{cat}</span>
                  <button 
                    onClick={() => updateCategories((globalHotelSettings.posCategories || []).filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                  >×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input 
                  placeholder="Add category..." 
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        updateCategories([...(globalHotelSettings.posCategories || []), target.value.trim()]);
                        target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* POS Printers */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Printer size={14} className="text-indigo-600" /> Receipt Printers
            </h3>
            <div className="space-y-2">
              {(globalHotelSettings.posPrinters || []).map((printer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-800">{printer}</span>
                  <button 
                    onClick={() => updatePrinters((globalHotelSettings.posPrinters || []).filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                  >×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input 
                  placeholder="Add printer..." 
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        updatePrinters([...(globalHotelSettings.posPrinters || []), target.value.trim()]);
                        target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Granular POS Category Mapping */}
        <div className="pt-8 border-t border-slate-100 space-y-6">
          <div className="flex items-center gap-2">
             <LayoutGrid size={18} className="text-amber-500" />
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Granular Mapping: Categories by Outlet</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(globalHotelSettings.posOutlets || []).map((outlet, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 min-w-[200px]">
                   <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                     <Store size={18} />
                   </div>
                   <div>
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{outlet}</div>
                      <p className="text-[9px] text-slate-400">Select categories visible at this terminal</p>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 flex-1">
                  {(globalHotelSettings.posCategories || []).map((cat, cIdx) => {
                     const isAssigned = (globalHotelSettings.posOutletCategories?.[outlet] || []).includes(cat);
                     return (
                       <button
                         key={cIdx}
                         type="button"
                         onClick={() => {
                           const current = globalHotelSettings.posOutletCategories?.[outlet] || [];
                           const next = isAssigned 
                             ? current.filter(c => c !== cat) 
                             : [...current, cat];
                           
                           submitGlobalSettingsChange(
                             `POS Mapping: ${outlet}`,
                             `Assign categories [${next.join(', ')}] to outlet "${outlet}"`,
                             'pos-config',
                             {
                               posOutletCategories: {
                                 ...(globalHotelSettings.posOutletCategories || {}),
                                 [outlet]: next
                               }
                             }
                           );
                         }}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                           isAssigned
                             ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                             : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'
                         }`}
                       >
                         {cat}
                       </button>
                     );
                  })}
                  {(!globalHotelSettings.posCategories || globalHotelSettings.posCategories.length === 0) && (
                    <span className="text-[10px] text-slate-400 italic font-mono">No categories globally defined.</span>
                  )}
                </div>
              </div>
            ))}
            {(!globalHotelSettings.posOutlets || globalHotelSettings.posOutlets.length === 0) && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p className="text-xs text-slate-400 font-sans">Declare your Sales Outlets above to enable terminal mapping.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 bg-indigo-950 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-6">
        <div className="absolute left-[-20px] top-[-20px] opacity-10 rotate-12">
          <Settings size={200} />
        </div>
        <div className="relative z-10 space-y-2">
          <h4 className="text-xl font-black uppercase tracking-widest">Network Synchronization</h4>
          <p className="text-sm opacity-70 max-w-lg leading-relaxed">Changes to your POS environment are pushed to terminals in real-time. All active terminal sessions should be refreshed after large-scale category modifications.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            type="button"
            onClick={handleSave}
            className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
          >
            Sync Terminals
          </button>
        </div>
      </div>
    </div>
  );
}
