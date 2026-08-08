/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Moon, Users, Baby, Zap } from 'lucide-react';

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
  const nights = checkInDate && checkOutDate
    ? Math.max(0, Math.round((new Date(checkOutDate + 'T00:00:00').getTime() - new Date(checkInDate + 'T00:00:00').getTime()) / 86400000))
    : 0;

  const totalGuests = adults + children;

  const quickPresets = [
    { label: 'Tonight', getCheckIn: () => currentSystemDate, getCheckOut: () => { const d = new Date(currentSystemDate + 'T00:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; } },
    { label: 'Weekend', getCheckIn: () => { const d = new Date(currentSystemDate + 'T00:00:00'); const day = d.getDay(); const diff = (5 - day + 7) % 7 || 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0]; }, getCheckOut: () => { const d = new Date(currentSystemDate + 'T00:00:00'); const day = d.getDay(); const diff = (5 - day + 7) % 7 || 7; d.setDate(d.getDate() + diff + 2); return d.toISOString().split('T')[0]; } },
    { label: '1 Week', getCheckIn: () => currentSystemDate, getCheckOut: () => { const d = new Date(currentSystemDate + 'T00:00:00'); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; } },
  ];

  const applyPreset = (preset: typeof quickPresets[0]) => {
    onCheckInDateChange(preset.getCheckIn());
    onCheckOutDateChange(preset.getCheckOut());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm shadow-slate-900/5"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500">
            <Calendar size={14} />
          </span>
          Stay Timeline
        </h4>
        {nights > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
            <Moon size={12} className="text-indigo-600" />
            <span className="text-[11px] font-bold text-indigo-700">{nights} Night{nights !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Quick Date Presets */}
      <div className="flex items-center gap-1.5">
        <Zap size={12} className="text-slate-400 shrink-0" />
        {quickPresets.map(preset => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition border border-transparent hover:border-indigo-200"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="checkInDate" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-In</label>
          <input
            id="checkInDate"
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInDateChange(e.target.value)}
            min={currentSystemDate}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />
          {checkInDate && (
            <p className="text-[10px] text-slate-400">
              {new Date(checkInDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="checkOutDate" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-Out</label>
          <input
            id="checkOutDate"
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutDateChange(e.target.value)}
            min={checkInDate || currentSystemDate}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            aria-invalid={!!errors?.checkOutDate}
            aria-describedby={errors?.checkOutDate ? 'checkOutDate-error' : undefined}
          />
          {errors?.checkOutDate ? (
            <p id="checkOutDate-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.checkOutDate}</p>
          ) : checkOutDate ? (
            <p className="text-[10px] text-slate-400">
              {new Date(checkOutDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          ) : null}
        </div>
      </div>

      {/* Visual Date Range Bar */}
      {nights > 0 && (
        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
            <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
          </div>
        </div>
      )}

      {/* Guest Counter Pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="adults" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Users size={10} /> Adults
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAdultsChange(Math.max(1, adults - 1))}
              disabled={adults <= 1}
              className="w-8 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition shrink-0"
            >
              −
            </button>
            <input
              id="adults"
              type="number"
              min="1"
              value={adults}
              onChange={(e) => onAdultsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
              aria-invalid={!!errors?.adults}
              aria-describedby={errors?.adults ? 'adults-error' : undefined}
            />
            <button
              type="button"
              onClick={() => onAdultsChange(adults + 1)}
              className="w-8 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition shrink-0"
            >
              +
            </button>
          </div>
          {errors?.adults && (
            <p id="adults-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.adults}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="children" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Baby size={10} /> Children
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChildrenChange(Math.max(0, children - 1))}
              disabled={children <= 0}
              className="w-8 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition shrink-0"
            >
              −
            </button>
            <input
              id="children"
              type="number"
              min="0"
              value={children}
              onChange={(e) => onChildrenChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-center px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            />
            <button
              type="button"
              onClick={() => onChildrenChange(children + 1)}
              className="w-8 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition shrink-0"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {totalGuests > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500">
          <Users size={12} className="text-slate-400" />
          <span><strong className="text-slate-700">{totalGuests}</strong> guest{totalGuests !== 1 ? 's' : ''} total</span>
          {nights > 0 && <span className="text-slate-300">·</span>}
          {nights > 0 && <span><strong className="text-slate-700">{nights}</strong> night{nights !== 1 ? 's' : ''}</span>}
        </div>
      )}
    </motion.div>
  );
}
