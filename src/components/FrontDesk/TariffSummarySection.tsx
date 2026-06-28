/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';

interface RoomBreakdownItem {
  roomType: string;
  count: number;
  subtotal: number;
}

interface TariffSummarySectionProps {
  nights: number;
  roomTotal: number;
  packageTotal: number;
  grandTotal: number;
  formatAmount: (amount: number) => string;
  roomBreakdown?: RoomBreakdownItem[];
}

export default function TariffSummarySection({
  nights,
  roomTotal,
  packageTotal,
  grandTotal,
  formatAmount,
  roomBreakdown,
}: TariffSummarySectionProps) {
  const hasMultipleRoomTypes = (roomBreakdown?.length || 0) > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35, ease: 'easeOut' }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/70 dark:border-amber-700/50 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-slate-900/20"
    >
      <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-700/40 pb-3">
        <h4 className="text-sm font-sans font-black text-amber-900 dark:text-amber-400 tracking-tight flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400">
            <CreditCard size={12} />
          </span>
          Tariff Finalization
        </h4>
        <div className="text-right">
          <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold">Estimated Cost</div>
          <div className="text-xl font-mono font-black text-amber-900 dark:text-amber-400">{formatAmount(grandTotal)}</div>
        </div>
      </div>

      <div className="space-y-2 text-[11px] font-medium text-amber-800 dark:text-amber-300">
        {hasMultipleRoomTypes && roomBreakdown ? (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Room Revenue ({nights} Night{nights !== 1 ? 's' : ''})</div>
            {roomBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between pl-2">
                <span>{item.count}x {item.roomType}</span>
                <span>{formatAmount(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between pl-2 pt-1 border-t border-amber-200/30 dark:border-amber-700/30">
              <span className="font-bold">Room Subtotal</span>
              <span className="font-bold">{formatAmount(roomTotal)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <span>Room Revenue ({nights} Night{nights !== 1 ? 's' : ''}):</span>
            <span>{formatAmount(roomTotal)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Upsell Packages & Add-ons:</span>
          <span>{formatAmount(packageTotal)}</span>
        </div>
        {nights > 0 && (
          <div className="flex justify-between pt-2 border-t border-amber-200/50 dark:border-amber-700/40">
            <span>Effective Nightly Rate (Inc Package):</span>
            <span>{formatAmount(Math.round(grandTotal / nights))}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
