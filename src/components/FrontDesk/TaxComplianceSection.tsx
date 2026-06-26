/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Receipt } from 'lucide-react';

interface TaxComplianceSectionProps {
  guestTin: string;
  guestVatNo: string;
  guestVatDate: string;
  onGuestTinChange: (value: string) => void;
  onGuestVatNoChange: (value: string) => void;
  onGuestVatDateChange: (value: string) => void;
  currentSystemDate: string;
}

export default function TaxComplianceSection({
  guestTin,
  guestVatNo,
  guestVatDate,
  onGuestTinChange,
  onGuestVatNoChange,
  onGuestVatDateChange,
  currentSystemDate,
}: TaxComplianceSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-500">
          <Receipt size={12} />
        </span>
        Tax & Compliance Details
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="guestTin" className="text-[10px] font-bold text-slate-500 uppercase">Guest TIN</label>
          <input
            id="guestTin"
            type="text"
            value={guestTin}
            onChange={(e) => onGuestTinChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            placeholder="Tax ID Number"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="guestVatNo" className="text-[10px] font-bold text-slate-500 uppercase">VAT Registration No.</label>
          <input
            id="guestVatNo"
            type="text"
            value={guestVatNo}
            onChange={(e) => onGuestVatNoChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            placeholder="VAT Registration"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="guestVatDate" className="text-[10px] font-bold text-slate-500 uppercase">VAT Effective Date</label>
        <input
          id="guestVatDate"
          type="date"
          value={guestVatDate}
          onChange={(e) => onGuestVatDateChange(e.target.value)}
          min={currentSystemDate}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
        />
      </div>
    </motion.div>
  );
}
