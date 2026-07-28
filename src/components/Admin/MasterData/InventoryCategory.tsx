/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, AlertTriangle, Warehouse, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';

interface InventoryCategoryProps {
  inventoryItems: InventoryItem[];
  filteredInventory: InventoryItem[];
  reorderAlertCount: number;
  totalStockVal: number;
  formatAmount: (amount: number) => string;
  onInspect: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  onAddInventory: () => void;
}

export default function InventoryCategory({
  inventoryItems,
  filteredInventory,
  reorderAlertCount,
  totalStockVal,
  formatAmount,
  onInspect,
  onEdit,
  onDelete,
  onAddInventory,
}: InventoryCategoryProps) {
  return (
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
            onClick={onAddInventory}
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
                      onClick={() => onInspect(item)}
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition rounded-lg"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
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
  );
}
