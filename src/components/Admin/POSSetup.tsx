/**
 * POS Setup Module
 * Handles POS outlets, categories, printers, and outlet-category mappings
 */

import React, { useState } from 'react';
import { LayoutGrid, Store, Printer, Save, CheckCircle2, Plus, Settings, X, Edit2, Trash2, MapPin, DollarSign, Wifi, Coffee, Monitor } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface POSOutlet {
  id: string;
  name: string;
  location: string;
  terminalId: string;
  isActive: boolean;
  defaultPrinter?: string;
}

interface POSCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  taxRate: number;
  isActive: boolean;
}

interface POSPrinter {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  printerType: 'thermal' | 'inkjet' | 'laser';
  isActive: boolean;
}

export default function POSSetup() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [activeTab, setActiveTab] = useState<'outlets' | 'categories' | 'printers' | 'mapping'>('outlets');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const TABS = [
    { id: 'outlets' as const, label: 'Sales Outlets', icon: Store },
    { id: 'categories' as const, label: 'Item Categories', icon: LayoutGrid },
    { id: 'printers' as const, label: 'Network Printers', icon: Printer },
    { id: 'mapping' as const, label: 'Outlet Mapping', icon: MapPin },
  ];

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
    <div className="space-y-6 animate-fade-in pt-4 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-6">
          <div>
            <h2 className="text-lg font-sans font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-indigo-600" />
              POS Environment Configuration
            </h2>
            <p className="text-xs text-slate-400">Define POS Outlets, Item Categorizations, and Physical Printer Network mappings.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">POS Engine Online</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex justify-center">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                    activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-900'
                  }`}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'outlets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Store size={16} className="text-indigo-600" /> Sales Outlets
                </h3>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Plus size={12} /> Add Outlet
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(globalHotelSettings.posOutlets || []).map((outlet, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                          <Store size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{outlet}</h4>
                          <p className="text-[9px] text-slate-400">Terminal ID: POS-{idx + 100}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 rounded-lg transition">
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => updateOutlets((globalHotelSettings.posOutlets || []).filter((_, i) => i !== idx))}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <MapPin size={10} />
                      <span>Main Building, Floor 1</span>
                    </div>
                  </div>
                ))}
                {(!globalHotelSettings.posOutlets || globalHotelSettings.posOutlets.length === 0) && (
                  <div className="col-span-3 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 italic">No sales outlets configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutGrid size={16} className="text-indigo-600" /> Item Categories
                </h3>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Plus size={12} /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(globalHotelSettings.posCategories || []).map((cat, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                          <Coffee size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{cat}</h4>
                          <p className="text-[9px] text-slate-400">Tax Rate: 15%</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 rounded-lg transition">
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => updateCategories((globalHotelSettings.posCategories || []).filter((_, i) => i !== idx))}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span>Color: #6366f1</span>
                    </div>
                  </div>
                ))}
                {(!globalHotelSettings.posCategories || globalHotelSettings.posCategories.length === 0) && (
                  <div className="col-span-3 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 italic">No categories configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'printers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer size={16} className="text-indigo-600" /> Network Printers
                </h3>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Plus size={12} /> Add Printer
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(globalHotelSettings.posPrinters || []).map((printer, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                          <Printer size={14} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{printer}</h4>
                          <p className="text-[9px] text-slate-400">Thermal Printer</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 rounded-lg transition">
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => updatePrinters((globalHotelSettings.posPrinters || []).filter((_, i) => i !== idx))}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <Wifi size={10} />
                      <span>192.168.1.100:9100</span>
                    </div>
                  </div>
                ))}
                {(!globalHotelSettings.posPrinters || globalHotelSettings.posPrinters.length === 0) && (
                  <div className="col-span-3 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 italic">No printers configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Granular Mapping: Categories by Outlet</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(globalHotelSettings.posOutlets || []).map((outlet, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Store size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{outlet}</div>
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
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-xs text-slate-400 font-sans">Declare your Sales Outlets above to enable terminal mapping.</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
