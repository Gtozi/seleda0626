/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Banknote, ShieldCheck, Shield } from 'lucide-react';

interface DepositSectionProps {
  depositAmount: number;
  isDepositPaid: boolean;
  currency: string;
  formatAmount: (amount: number) => string;
  onDepositAmountChange: (value: number) => void;
  onDepositPaidChange: (value: boolean) => void;
}

export default function DepositSection({
  depositAmount,
  isDepositPaid,
  currency,
  formatAmount,
  onDepositAmountChange,
  onDepositPaidChange,
}: DepositSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-slate-900/20"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
          <Banknote size={12} />
        </span>
        Deposit & Guarantee
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="depositAmount" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            Deposit Amount ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
              {currency}
            </span>
            <input
              id="depositAmount"
              type="number"
              min={0}
              step={0.01}
              value={depositAmount}
              onChange={(e) => onDepositAmountChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Deposit Status</label>
          <button
            type="button"
            onClick={() => onDepositPaidChange(!isDepositPaid)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
              isDepositPaid
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {isDepositPaid ? (
              <>
                <ShieldCheck size={14} />
                Deposit Received
              </>
            ) : (
              <>
                <Shield size={14} />
                Deposit Pending
              </>
            )}
          </button>
        </div>
      </div>

      {depositAmount > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-700/40 rounded-xl">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300 shrink-0">
            <Banknote size={10} />
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold">Guarantee:</span>{' '}
            {isDepositPaid
              ? `${formatAmount(depositAmount)} secured. Reservation is financially guaranteed.`
              : `${formatAmount(depositAmount)} expected. Toggle above once received.`}
          </div>
        </div>
      )}
    </motion.div>
  );
}
