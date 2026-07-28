/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';

interface StockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: any[];
  onSubmit: (lines: { ingredientId: string; countedQty: number }[]) => void;
}

export default function StockCountModal({ isOpen, onClose, ingredients, onSubmit }: StockCountModalProps) {
  const { formatAmount } = useERP();
  const [stockCountLines, setStockCountLines] = React.useState<{ ingredientId: string; countedQty: number }[]>([]);

  if (!isOpen) return null;

  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Stock Count"
      subtitle="Record actual inventory with variance analysis"
      icon={<ClipboardCheck size={20} className="text-indigo-600" />}
      variant="form"
      size="lg"
      showFooter={false}
    >
          <div className="space-y-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-400 text-xs font-medium">
             <ClipboardCheck size={16} className="shrink-0" />
             <p>Enter counted quantities for each ingredient. Variances will be calculated automatically.</p>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {ingredients.slice(0, 10).map(ingredient => (
              <div key={ingredient.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{ingredient.name}</p>
                  <p className="text-xs text-slate-500">Expected: {ingredient.par_level || 0} {ingredient.unit_of_measure}</p>
                </div>
                <input
                  type="number"
                  placeholder="Counted"
                  value={stockCountLines.find(l => l.ingredientId === ingredient.id)?.countedQty || ''}
                  onChange={(e) => {
                    const newLines = [...stockCountLines];
                    const existingIndex = newLines.findIndex(l => l.ingredientId === ingredient.id);
                    if (existingIndex >= 0) {
                      newLines[existingIndex] = { ingredientId: ingredient.id, countedQty: Number(e.target.value) };
                    } else {
                      newLines.push({ ingredientId: ingredient.id, countedQty: Number(e.target.value) });
                    }
                    setStockCountLines(newLines);
                  }}
                  className="w-24 bg-white dark:bg-slate-900 border dark:border-slate-700 p-2 rounded-lg text-sm text-center"
                />
              </div>
            ))}
          </div>

          {/* Variance Summary */}
          {stockCountLines.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Variance Summary</h4>
              <div className="space-y-2">
                {stockCountLines.map(line => {
                  const ingredient = ingredients.find(i => i.id === line.ingredientId);
                  if (!ingredient) return null;
                  const expected = ingredient.par_level || 0;
                  const variance = line.countedQty - expected;
                  const varianceValue = variance * (ingredient.current_cost || 0);
                  return (
                    <div key={line.ingredientId} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{ingredient.name}</span>
                      <span className={`font-bold ${variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {variance > 0 ? '+' : ''}{variance} ({formatAmount(varianceValue)})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => {
                onClose();
                setStockCountLines([]);
              }}
              className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all font-mono"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onSubmit(stockCountLines);
                onClose();
                setStockCountLines([]);
              }}
              className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              Submit Count
            </button>
          </div>
          </div>
    </ModalSystem>
  );
}
