/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ShieldCheck, TrendingDown } from 'lucide-react';
import { Package as PackageType, GuestService } from '../../types/erp';

interface RoomBreakdownItem {
  roomType: string;
  count: number;
  subtotal: number;
}

interface TariffSummarySectionProps {
  nights: number;
  roomTotal: number;
  packageTotal: number;
  serviceTotal: number;
  tax?: number;
  serviceCharge?: number;
  additionalFees?: number;
  grandTotal: number;
  voucherDiscount?: number;
  formatAmount: (amount: number) => string;
  roomBreakdown?: RoomBreakdownItem[];
  packageIds?: string[];
  guestServiceIds?: string[];
  packages?: PackageType[];
  guestServices?: GuestService[];
  checkInDate?: string;
  checkOutDate?: string;
}

export default function TariffSummarySection({
  nights,
  roomTotal,
  packageTotal,
  serviceTotal,
  tax = 0,
  serviceCharge = 0,
  additionalFees = 0,
  grandTotal,
  voucherDiscount = 0,
  formatAmount,
  roomBreakdown,
  packageIds = [],
  guestServiceIds = [],
  packages = [],
  guestServices = [],
  checkInDate,
  checkOutDate,
}: TariffSummarySectionProps) {
  const hasRooms = (roomBreakdown?.length || 0) > 0;

  const packageSelections = React.useMemo(() => {
    return packages
      .map(pkg => {
        const count = packageIds.filter(id => id === pkg.id).length;
        if (count === 0) return null;
        const durationMultiplier = pkg.chargeFrequency === 'daily' ? nights : 1;
        return { ...pkg, count, lineTotal: pkg.price * count * durationMultiplier };
      })
      .filter((item): item is PackageType & { count: number; lineTotal: number } => item !== null);
  }, [packages, packageIds, nights]);

  const guestServiceSelections = React.useMemo(() => {
    return guestServices
      .map(gs => {
        const count = guestServiceIds.filter(id => id === gs.id).length;
        if (count === 0) return null;
        return { ...gs, count, lineTotal: gs.price * count };
      })
      .filter((item): item is GuestService & { count: number; lineTotal: number } => item !== null);
  }, [guestServices, guestServiceIds]);

  const hasAnySelection = hasRooms || packageSelections.length > 0 || guestServiceSelections.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm shadow-slate-900/5 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <ShoppingBag size={18} className="text-indigo-500" /> Reservation Summary
        </h3>
        {checkInDate && checkOutDate && (
          <p className="text-xs text-slate-500 mt-1">
            {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {nights} Night{nights !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="p-5 divide-y divide-slate-100 space-y-4">
        {!hasAnySelection ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 font-medium">No items selected</p>
            <p className="text-xs text-slate-400 mt-1">Add rooms and extras to see the estimate</p>
          </div>
        ) : (
          <>
            {/* Rooms */}
            {hasRooms && (
              <div className="space-y-3 pb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rooms</h4>
                {roomBreakdown?.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.roomType}</p>
                      <p className="text-xs text-slate-500">{item.count} room{item.count > 1 ? 's' : ''} × {formatAmount(Math.round(item.subtotal / item.count / (nights || 1)))} / night</p>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">{formatAmount(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Packages */}
            {packageSelections.length > 0 && (
              <div className="space-y-3 py-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected Upgrades</h4>
                {packageSelections.map(pkg => (
                  <div key={pkg.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{pkg.name}</p>
                      <p className="text-xs text-slate-500">
                        {pkg.count} × {formatAmount(pkg.price)} {pkg.chargeFrequency === 'daily' ? '/ night' : '/ stay'}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">{formatAmount(pkg.lineTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Guest Services */}
            {guestServiceSelections.length > 0 && (
              <div className="space-y-3 py-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guest Services</h4>
                {guestServiceSelections.map(gs => (
                  <div key={gs.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{gs.name}</p>
                      <p className="text-xs text-slate-500">{gs.count} × {formatAmount(gs.price)}</p>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">{formatAmount(gs.lineTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Taxes & Fees */}
            <div className="space-y-2 py-4 text-xs text-slate-600">
              {serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="font-medium">{formatAmount(serviceCharge)}</span>
                </div>
              )}
              {additionalFees > 0 && (
                <div className="flex justify-between">
                  <span>Additional Fees</span>
                  <span className="font-medium">{formatAmount(additionalFees)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax / VAT</span>
                  <span className="font-medium">{formatAmount(tax)}</span>
                </div>
              )}
            </div>

            {/* Voucher Discount */}
            {voucherDiscount > 0 && (
              <div className="py-2 flex justify-between text-xs text-emerald-600">
                <span className="font-medium">Voucher Discount</span>
                <span className="font-medium">-{formatAmount(voucherDiscount)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-4 flex justify-between items-baseline">
              <div>
                <p className="text-sm font-bold text-slate-900">Total Estimate</p>
                <p className="text-[10px] text-slate-500">All fees included</p>
              </div>
              <span className="text-2xl font-black text-indigo-600">{formatAmount(grandTotal)}</span>
            </div>

            {/* Per-Night Average */}
            {nights > 0 && grandTotal > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <TrendingDown size={12} className="text-indigo-500" />
                  <span>Average per night</span>
                </div>
                <span className="text-sm font-bold text-indigo-700">{formatAmount(Math.round(grandTotal / nights))}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
        <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
        <span>All fees are included in the total estimate</span>
      </div>
    </motion.div>
  );
}
