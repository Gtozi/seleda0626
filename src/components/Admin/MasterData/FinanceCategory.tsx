/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, TrendingUp, Coins, Plus, Trash2, Tag, Globe } from 'lucide-react';
import { ChartOfAccount } from '../../types/finance';

interface FinanceCategoryProps {
  chartOfAccounts: ChartOfAccount[];
  filteredAccounts: ChartOfAccount[];
  totalAssets: number;
  totalLiabilities: number;
  formatAmount: (amount: number) => string;
  onInspect: (account: ChartOfAccount) => void;
  onDelete: (accountCode: string) => void;
  onAddAccount: () => void;
}

export default function FinanceCategory({
  chartOfAccounts,
  filteredAccounts,
  totalAssets,
  totalLiabilities,
  formatAmount,
  onInspect,
  onDelete,
  onAddAccount,
}: FinanceCategoryProps) {
  return (
    <div className="space-y-6">
      {/* Internal Dashboard metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'COA Fiscal Mapping', count: chartOfAccounts.length, desc: 'Registered Ledgers', icon: Sliders, accent: 'text-indigo-500' },
          { label: 'Aggregate Asset Book value', count: formatAmount(totalAssets), desc: 'Liquidity Matrix', icon: TrendingUp, accent: 'text-emerald-500' },
          { label: 'Liabilities & Equity mapped', count: formatAmount(totalLiabilities), desc: 'Balance Sheet Mappers', icon: Coins, accent: 'text-indigo-600' },
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

      {/* Ledgers table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Enterprise Chart of Account Mappings ({filteredAccounts.length})</h3>
          <button
            onClick={onAddAccount}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} /> Map ledger Code
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Account Code</th>
                <th className="px-6 py-3">Definition Ledger Title</th>
                <th className="px-6 py-3">Accounting Category</th>
                <th className="px-6 py-3">Sub-Category Group</th>
                <th className="px-6 py-3 font-mono">Current Ledger Balance</th>
                <th className="px-6 py-3 text-right">Mappers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                    No fiscal account code mapping exists for query.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((accObj) => (
                  <tr
                    key={accObj.code}
                    onClick={() => onInspect(accObj)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                        {accObj.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{accObj.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        accObj.category === 'Asset' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' :
                        accObj.category === 'Liability' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/10' :
                        accObj.category === 'Revenue' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10' :
                        'bg-slate-100 text-slate-550'
                      }`}>
                        {accObj.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{accObj.subCategory || 'Other'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {formatAmount(accObj.balance || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(accObj.code);
                        }}
                        className="p-1 px-2 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition rounded-lg"
                        title="Unmap fiscal code"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax policies and gateway controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Global tax policies mapped</span>
            </div>
            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase font-mono">Synced</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'GDS Booking Commission Tax', rate: '10%', action: 'Deducted directly' },
              { label: 'Operational General Hotel VAT', rate: '15%', action: 'Applicable on checkouts' },
              { label: 'Tourism Flat Levy Assessment', rate: '2% / Room night', action: 'Direct audit charge' },
            ].map((tax, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-250">{tax.label}</span>
                  <span className="text-[8px] text-slate-400 font-mono tracking-wide">{tax.action}</span>
                </div>
                <span className="text-xs font-black text-indigo-600 font-mono">{tax.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Active online Payment Gateways</span>
            </div>
            <button className="text-[8.5px] font-extrabold text-indigo-600 underline uppercase">Config API</button>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Stripe API checkout keys', status: 'Live syncing', level: '128-aes secure' },
              { label: 'TeleBirr Quick-Response API', status: 'Live sync active', level: 'Operational' },
              { label: 'National Bank Core', status: 'Connected', level: 'Ready' },
            ].map((gate, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-250">{gate.label}</span>
                  <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wide">{gate.level}</span>
                </div>
                <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded tracking-wide">{gate.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
