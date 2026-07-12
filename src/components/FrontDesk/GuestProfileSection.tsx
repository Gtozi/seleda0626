/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, MessageSquare, Building, Gift, Tag } from 'lucide-react';

interface GuestProfileSectionProps {
  bookingType: 'Individual' | 'Group' | 'Corporate';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestNationality?: string;
  groupName?: string;
  specialRequests?: string;
  channel: 'Walk-In' | 'Direct Website' | 'Booking.com' | 'Expedia' | 'Corporate';
  cancellationGraceHours?: number;
  cancellationPenaltyPercent?: number;
  tourOperators?: any[];
  operatorId?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  voucherError?: string;
  applyingVoucher?: boolean;
  formatAmount?: (amount: number) => string;
  onGuestNameChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onGuestPhoneChange: (value: string) => void;
  onGuestNationalityChange?: (value: string) => void;
  onGroupNameChange?: (value: string) => void;
  onSpecialRequestsChange?: (value: string) => void;
  onChannelChange: (value: 'Walk-In' | 'Direct Website' | 'Booking.com' | 'Expedia' | 'Corporate') => void;
  onOperatorIdChange?: (value: string) => void;
  onVoucherCodeChange?: (value: string) => void;
  onApplyVoucher?: () => void;
  onClearVoucher?: () => void;
  errors?: {
    guestName?: string;
    guestEmail?: string;
    groupName?: string;
  };
}

export default function GuestProfileSection({
  bookingType,
  guestName,
  guestEmail,
  guestPhone,
  guestNationality,
  groupName,
  specialRequests,
  channel,
  cancellationGraceHours = 24,
  cancellationPenaltyPercent = 50,
  onGuestNameChange,
  onGuestEmailChange,
  onGuestPhoneChange,
  onGuestNationalityChange,
  onGroupNameChange,
  onSpecialRequestsChange,
  onChannelChange,
  onOperatorIdChange,
  onVoucherCodeChange,
  onApplyVoucher,
  onClearVoucher,
  tourOperators = [],
  operatorId,
  voucherCode,
  voucherDiscount,
  voucherError,
  applyingVoucher,
  formatAmount,
  errors,
}: GuestProfileSectionProps) {
  const isGroup = bookingType === 'Group';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden"
    >
      <div className="p-5 border-b border-stone-100 bg-stone-50/50">
        <h3 className="font-semibold text-stone-900 flex items-center gap-2">
          <User size={18} className="text-amber-500" />
          {isGroup ? 'Group & Contact Details' : 'Guest Details'}
        </h3>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="guestName" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {isGroup ? 'Primary contact name' : 'Full name'}
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              placeholder={isGroup ? 'e.g. John Smith' : 'e.g. John Doe'}
              aria-invalid={!!errors?.guestName}
              aria-describedby={errors?.guestName ? 'guestName-error' : undefined}
            />
            {errors?.guestName && (
              <p id="guestName-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.guestName}</p>
            )}
          </div>

          {isGroup && (
            <div className="space-y-1">
              <label htmlFor="groupName" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Group name</label>
              <input
                id="groupName"
                type="text"
                value={groupName || ''}
                onChange={(e) => onGroupNameChange?.(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                placeholder="e.g. Company Conference"
                aria-invalid={!!errors?.groupName}
                aria-describedby={errors?.groupName ? 'groupName-error' : undefined}
              />
              {errors?.groupName && (
                <p id="groupName-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.groupName}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="guestEmail" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</label>
            <input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={(e) => onGuestEmailChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              placeholder="john@example.com"
              aria-invalid={!!errors?.guestEmail}
              aria-describedby={errors?.guestEmail ? 'guestEmail-error' : undefined}
            />
            {errors?.guestEmail && (
              <p id="guestEmail-error" className="text-[10px] text-rose-500 mt-1" role="alert">{errors.guestEmail}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="guestPhone" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phone</label>
            <input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => onGuestPhoneChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="guestNationality" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nationality</label>
            <input
              id="guestNationality"
              type="text"
              value={guestNationality || ''}
              onChange={(e) => onGuestNationalityChange?.(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              placeholder="e.g. Ethiopia"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="channel" className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Booking Channel</label>
            <select
              id="channel"
              value={channel}
              onChange={(e) => onChannelChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition appearance-none"
            >
              <option value="Walk-In">Walk-In</option>
              <option value="Direct Website">Direct Website</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Expedia">Expedia</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="specialRequests" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
            <MessageSquare size={12} className="text-stone-400" /> Special requests
          </label>
          <textarea
            id="specialRequests"
            value={specialRequests || ''}
            onChange={(e) => onSpecialRequestsChange?.(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
            placeholder="e.g. Late check-in requested, high floor preferred, allergy information..."
          />
        </div>

        {/* B2B Tour Operator & Voucher */}
        {isGroup && (
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-100/60 text-indigo-900 font-bold uppercase tracking-wider text-[10px] font-mono">
              <Building size={14} className="text-indigo-600" /> Tour Operator & Voucher
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="operatorId" className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Tour operator</label>
                <select
                  id="operatorId"
                  value={operatorId || ''}
                  onChange={(e) => onOperatorIdChange?.(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition appearance-none"
                >
                  <option value="">No tour operator</option>
                  {tourOperators.map((op) => (
                    <option key={op.id} value={op.id}>{op.name || op.company_name || op.id}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="voucherCode" className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                  <Gift size={12} className="text-stone-400" /> Voucher code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="voucherCode"
                      type="text"
                      value={voucherCode || ''}
                      onChange={(e) => {
                        onVoucherCodeChange?.(e.target.value);
                        if (!e.target.value.trim()) {
                          onClearVoucher?.();
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                      placeholder="Enter voucher code"
                    />
                    {voucherDiscount ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600">
                        -{formatAmount ? formatAmount(voucherDiscount) : voucherDiscount}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={onApplyVoucher}
                    disabled={applyingVoucher || !voucherCode?.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {applyingVoucher ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {voucherError && (
                  <p className="text-[10px] text-rose-500 mt-1" role="alert">{voucherError}</p>
                )}
                {voucherDiscount ? (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                    <Tag size={10} /> Voucher applied: discount of {formatAmount ? formatAmount(voucherDiscount) : voucherDiscount}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Key Booking Policies */}
        <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200/40 text-stone-900 font-bold uppercase tracking-wider text-[10px] font-mono">
            <ShieldCheck size={14} className="text-emerald-600" /> Key Booking Policies
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 mt-0.5 font-mono">
              C
            </div>
            <div>
              <p className="font-bold text-stone-800 text-[11px]">Flexible Cancellation Rules</p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Free cancellation up to <strong className="text-stone-700 font-bold">{cancellationGraceHours} hours</strong> before check-in. Late cancellations incur a {cancellationPenaltyPercent}% fee.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 bg-amber-50 text-amber-700 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 mt-0.5 font-mono">
              W
            </div>
            <div>
              <p className="font-bold text-stone-800 text-[11px]">Verification Protocol</p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                Reservations may be held as <span className="font-semibold text-amber-700 font-mono">Waitlisted</span> and are automatically promoted to <span className="font-semibold text-emerald-700 font-mono">Confirmed</span> once verified by business admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
