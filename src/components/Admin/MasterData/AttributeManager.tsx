/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AttributeManagerProps {
  title: string;
  items: string[];
  onUpdate: (items: string[]) => void;
}

export default function AttributeManager({ title, items, onUpdate }: AttributeManagerProps) {
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
}
