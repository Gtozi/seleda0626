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
      className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xl shadow-stone-900/5"
    >
      <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 text-stone-500">
          <Banknote size={14} />
        </span>
        Deposit & Guarantee
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="depositAmount" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Deposit Amount ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">
              {currency}
            </span>
            <input
              id="depositAmount"
              type="number"
              min={0}
              step={0.01}
              value={depositAmount}
              onChange={(e) => onDepositAmountChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Deposit Status</label>
          <button
            type="button"
            onClick={() => onDepositPaidChange(!isDepositPaid)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
              isDepositPaid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
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
        <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-100 rounded-xl">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-stone-200 text-stone-500 shrink-0">
            <Banknote size={10} />
          </div>
          <div className="text-[10px] text-stone-600 leading-relaxed">
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
