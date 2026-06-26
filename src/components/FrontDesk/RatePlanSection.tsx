/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Tag } from 'lucide-react';
import { RatePlan, Package, RoomType } from '../../types/erp';

interface RatePlanSectionProps {
  ratePlanId: string;
  promoCode: string;
  packageIds: string[];
  ratePlans: RatePlan[];
  packages: Package[];
  onRatePlanChange: (value: string) => void;
  onPromoCodeChange: (value: string) => void;
  onPackageIdsChange: (value: string[]) => void;
  formatAmount: (amount: number) => string;
}

export default function RatePlanSection({
  ratePlanId,
  promoCode,
  packageIds,
  ratePlans,
  packages,
  onRatePlanChange,
  onPromoCodeChange,
  onPackageIdsChange,
  formatAmount,
}: RatePlanSectionProps) {
  const handlePackageToggle = (pkgId: string) => {
    if (packageIds.includes(pkgId)) {
      onPackageIdsChange(packageIds.filter(id => id !== pkgId));
    } else {
      onPackageIdsChange([...packageIds, pkgId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-500">
          <Tag size={12} />
        </span>
        Rate Plan & Dynamic Upsell
      </h4>

      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="ratePlanId" className="text-[10px] font-bold text-slate-500 uppercase">Active Rate Plan</label>
          <select
            id="ratePlanId"
            value={ratePlanId}
            onChange={(e) => onRatePlanChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition appearance-none"
          >
            {ratePlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} (x{plan.baseModifier})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="promoCode" className="text-[10px] font-bold text-slate-500 uppercase">Promo Code</label>
          <div className="relative">
            <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="promoCode"
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="WINTER2024"
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Select Add-on Packages</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Add-on packages">
            {packages.map(pkg => (
              <label
                key={pkg.id}
                className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg cursor-pointer hover:border-amber-200 transition"
              >
                <input
                  type="checkbox"
                  checked={packageIds.includes(pkg.id)}
                  onChange={() => handlePackageToggle(pkg.id)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700">{pkg.name}</span>
                  <span className="text-[10px] text-slate-400">{formatAmount(pkg.price)} / {pkg.chargeFrequency}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
