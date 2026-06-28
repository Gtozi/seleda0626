/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';

interface StayTimelineSectionProps {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  onCheckInDateChange: (value: string) => void;
  onCheckOutDateChange: (value: string) => void;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  currentSystemDate: string;
  errors?: {
    checkOutDate?: string;
    adults?: string;
  };
}

export default function StayTimelineSection({
  checkInDate,
  checkOutDate,
  adults,
  children,
  onCheckInDateChange,
  onCheckOutDateChange,
  onAdultsChange,
  onChildrenChange,
  currentSystemDate,
  errors,
}: StayTimelineSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-slate-900/20"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
          <Calendar size={12} />
        </span>
        Stay Timeline
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="checkInDate" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Check-In</label>
          <input
            id="checkInDate"
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInDateChange(e.target.value)}
            min={currentSystemDate}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="checkOutDate" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Check-Out</label>
          <input
            id="checkOutDate"
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutDateChange(e.target.value)}
            min={checkInDate || currentSystemDate}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            aria-invalid={!!errors?.checkOutDate}
            aria-describedby={errors?.checkOutDate ? 'checkOutDate-error' : undefined}
          />
          {errors?.checkOutDate && (
            <p id="checkOutDate-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.checkOutDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="adults" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Adults</label>
          <input
            id="adults"
            type="number"
            min="1"
            value={adults}
            onChange={(e) => onAdultsChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            aria-invalid={!!errors?.adults}
            aria-describedby={errors?.adults ? 'adults-error' : undefined}
          />
          {errors?.adults && (
            <p id="adults-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.adults}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="children" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Children</label>
          <input
            id="children"
            type="number"
            min="0"
            value={children}
            onChange={(e) => onChildrenChange(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
          />
        </div>
      </div>
    </motion.div>
  );
}
