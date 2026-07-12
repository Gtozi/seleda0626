/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 *
 * Folio Portal - Dedicated module for folio management with sub-navigation
 */

import React, { useState } from 'react';
import { 
  Receipt, 
  FileText,
  ChevronRight
} from 'lucide-react';
import CheckInOutModule from './CheckInOutModule';
import FolioPaymentAudit from './FolioPaymentAudit';

type FolioModule = 'ledger' | 'audit';

export default function FolioPortal({
  initialFolioResId,
  onClearFolioResId
}: {
  initialFolioResId?: string;
  onClearFolioResId?: () => void;
}) {
  const [activeModule, setActiveModule] = useState<FolioModule>('ledger');

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Sub-Navigation Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Receipt size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Folio Management</h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Guest billing & payment audit</p>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveModule('ledger')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
              activeModule === 'ledger'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText size={14} />
            Ledger
          </button>
          <button
            onClick={() => setActiveModule('audit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
              activeModule === 'audit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Receipt size={14} />
            Payment Audit
          </button>
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {activeModule === 'ledger' && (
          <CheckInOutModule
            initialFolioResId={initialFolioResId}
            onClearFolioResId={onClearFolioResId}
          />
        )}
        {activeModule === 'audit' && (
          <div className="p-6">
            <FolioPaymentAudit />
          </div>
        )}
      </div>
    </div>
  );
}
