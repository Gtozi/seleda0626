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
      className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-slate-900/20"
    >
      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600">
          <Users2 size={14} />
        </span>
        Booking Type
      </h4>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(['Individual', 'Group', 'Corporate'] as const).map((type) => {
            const descriptions: Record<typeof type, string> = {
              Individual: 'Single guest or family',
              Group: 'Multiple rooms, one party',
              Corporate: 'B2B company account',
            };
            return (
              <label
                key={type}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                  bookingType === type
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-800 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  value={type}
                  checked={bookingType === type}
                  onChange={(e) => onBookingTypeChange(e.target.value as 'Individual' | 'Group' | 'Corporate')}
                  className="sr-only"
                />
                <div className="flex items-center gap-1.5">
                  {type === 'Individual' && <Users size={12} />}
                  {type === 'Group' && <Users2 size={12} />}
                  {type === 'Corporate' && <Building2 size={12} />}
                  {type}
                </div>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">{descriptions[type]}</span>
              </label>
            );
          })}
        </div>

        {bookingType === 'Group' && (
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Booking Group ID</label>
              <input
                type="text"
                value={bookingGroupId || ''}
                onChange={(e) => onBookingGroupIdChange(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition"
              />
            </div>
          </div>
        )}

        {bookingType === 'Corporate' && (
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Corporate Account</label>
              <select
                value={corporateAccountId || ''}
                onChange={(e) => onCorporateAccountIdChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition appearance-none"
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
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Booking Group ID</label>
              <input
                type="text"
                value={bookingGroupId || ''}
                onChange={(e) => onBookingGroupIdChange(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
