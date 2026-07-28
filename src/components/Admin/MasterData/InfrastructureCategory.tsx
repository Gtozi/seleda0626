/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Layers, Briefcase, Globe, Database } from 'lucide-react';

interface InfrastructureCategoryProps {
  floors?: string[];
  departments?: string[];
}

export default function InfrastructureCategory({
  floors,
  departments,
}: InfrastructureCategoryProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-850 pb-6">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Property Infrastructure Repository</h3>
            <p className="text-xs text-slate-400">Map the physical layout, operational zones, and resource hierarchies of the enterprise.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Vertical Layout (Floors)</h4>
            <div className="grid grid-cols-2 gap-4">
              {floors?.map((f: string, i: number) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-850 flex items-center gap-3">
                  <Layers size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Operating Departments</h4>
            <div className="space-y-3">
              {departments?.map((dept: string, i: number) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center shadow-xs">
                  <div className="flex items-center gap-3">
                    <Briefcase size={14} className="text-emerald-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{dept}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">Active Code</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-8 rounded-[32px] text-white space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 p-8 opacity-5"><Globe size={160} /></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest">Global Resource Synced</h4>
            <p className="text-xs opacity-60">All units are mapped to these structural definitions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
