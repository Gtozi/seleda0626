/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

interface GuestProfileSectionProps {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  channel: 'Walk-In' | 'Direct Website' | 'Booking.com' | 'Expedia' | 'Corporate';
  onGuestNameChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onGuestPhoneChange: (value: string) => void;
  onChannelChange: (value: 'Walk-In' | 'Direct Website' | 'Booking.com' | 'Expedia' | 'Corporate') => void;
  errors?: {
    guestName?: string;
    guestEmail?: string;
  };
}

export default function GuestProfileSection({
  guestName,
  guestEmail,
  guestPhone,
  channel,
  onGuestNameChange,
  onGuestEmailChange,
  onGuestPhoneChange,
  onChannelChange,
  errors,
}: GuestProfileSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-slate-900/20"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
          <Users size={12} />
        </span>
        Primary Guest Profile
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="guestName" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Guest Name</label>
          <input
            id="guestName"
            type="text"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            placeholder="e.g. John Doe"
            aria-invalid={!!errors?.guestName}
            aria-describedby={errors?.guestName ? 'guestName-error' : undefined}
          />
          {errors?.guestName && (
            <p id="guestName-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.guestName}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="guestEmail" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
          <input
            id="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => onGuestEmailChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            placeholder="john@example.com"
            aria-invalid={!!errors?.guestEmail}
            aria-describedby={errors?.guestEmail ? 'guestEmail-error' : undefined}
          />
          {errors?.guestEmail && (
            <p id="guestEmail-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.guestEmail}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="guestPhone" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
          <input
            id="guestPhone"
            type="tel"
            value={guestPhone}
            onChange={(e) => onGuestPhoneChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="channel" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Booking Channel</label>
          <select
            id="channel"
            value={channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition appearance-none"
          >
            <option value="Walk-In">Walk-In</option>
            <option value="Direct Website">Direct Website</option>
            <option value="Booking.com">Booking.com</option>
            <option value="Expedia">Expedia</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
