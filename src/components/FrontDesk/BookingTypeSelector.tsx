/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, Users2, Building2 } from 'lucide-react';
import { CorporateAccount } from '../../types/erp';

interface BookingTypeSelectorProps {
  bookingType: 'Individual' | 'Group' | 'Corporate';
  corporateAccounts: CorporateAccount[];
  bookingGroupId?: string;
  corporateAccountId?: string;
  onBookingTypeChange: (type: 'Individual' | 'Group' | 'Corporate') => void;
  onBookingGroupIdChange: (value: string) => void;
  onCorporateAccountIdChange: (value: string) => void;
}

export default function BookingTypeSelector({
  bookingType,
  corporateAccounts,
  bookingGroupId,
  corporateAccountId,
  onBookingTypeChange,
  onBookingGroupIdChange,
  onCorporateAccountIdChange,
}: BookingTypeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0, duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-stone-900/30 border border-stone-200/80 dark:border-stone-700 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-stone-900/20"
    >
      <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 text-stone-600">
          <Users2 size={14} />
        </span>
        Booking Type
      </h4>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(['Individual', 'Group', 'Corporate'] as const).map((type) => (
            <label
              key={type}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                bookingType === type
                  ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-400'
                  : 'bg-white dark:bg-stone-900/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <input
                type="radio"
                value={type}
                checked={bookingType === type}
                onChange={(e) => onBookingTypeChange(e.target.value as 'Individual' | 'Group' | 'Corporate')}
                className="sr-only"
              />
              {type === 'Individual' && <Users size={12} />}
              {type === 'Group' && <Users2 size={12} />}
              {type === 'Corporate' && <Building2 size={12} />}
              {type}
            </label>
          ))}
        </div>

        {bookingType === 'Group' && (
          <div className="space-y-3 p-3 bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-700 rounded-xl">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">Booking Group ID</label>
              <input
                type="text"
                value={bookingGroupId || ''}
                onChange={(e) => onBookingGroupIdChange(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full px-3 py-2 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs dark:text-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
              />
            </div>
          </div>
        )}

        {bookingType === 'Corporate' && (
          <div className="space-y-3 p-3 bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-700 rounded-xl">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">Corporate Account</label>
              <select
                value={corporateAccountId || ''}
                onChange={(e) => onCorporateAccountIdChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition appearance-none"
              >
                <option value="">-- Select Corporate Account --</option>
                {corporateAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.companyName} — {acc.contactPerson}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">Booking Group ID</label>
              <input
                type="text"
                value={bookingGroupId || ''}
                onChange={(e) => onBookingGroupIdChange(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full px-3 py-2 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs dark:text-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
