/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared pricing engine for the public booking portal.
 *
 * This module is the SINGLE SOURCE OF TRUTH for public-booking pricing and is
 * imported by BOTH the Express server (server.ts) and the public booking client
 * (BookingPage.tsx). Keeping the math in one place guarantees that the total a
 * guest sees on screen is byte-for-byte identical to the total persisted by the
 * server, and that both mirror the front-desk fee logic (ERPContext
 * `formatTaxesAndFees`).
 *
 * Fee model (matches front desk):
 *   1. Service charge + any non-VAT "additional" fees are applied to the base.
 *   2. VAT/tax is applied LAST, on (base + service charge + additional fees).
 *      i.e. VAT is compounded over the service charge — the Ethiopian standard.
 */

export interface FeeComponent {
  id: string;
  name: string;
  feeType: 'percentage' | 'fixed_amount';
  value: number;
  isEnabled: boolean;
}

export interface FeeBreakdown {
  serviceCharge: number;
  additionalFees: number;
  additionalFeeDetails: { name: string; amount: number }[];
  tax: number;
  totalFees: number;
}

export interface SeasonRow {
  id?: string;
  name: string;
  start_month: number; // 0-indexed (January = 0), matching JS Date months
  start_day: number;
  end_month: number;
  end_day: number;
  multiplier: number | string;
}

export interface RatePlanRow {
  id: string;
  name: string;
  base_modifier: number | string;
  active?: boolean;
}

const isVatFee = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('vat') || n.includes('tax');
};

const isServiceChargeFee = (name: string) => name.toLowerCase().includes('service charge');

/**
 * Compute service charge, additional fees, and VAT/tax for a given pre-tax
 * subtotal, honoring every enabled fee component with compounded VAT.
 *
 * When no fee components are configured, falls back to flat tax/service-charge
 * percentages so legacy installs keep working.
 */
export function computeFees(
  subtotal: number,
  feeComponents: FeeComponent[] | undefined | null,
  fallbackTaxPercent = 0,
  fallbackServiceChargePercent = 0,
): FeeBreakdown {
  const enabled = (feeComponents || []).filter(f => f.isEnabled);

  if (enabled.length === 0) {
    const serviceCharge = Math.round(subtotal * (fallbackServiceChargePercent / 100));
    const tax = Math.round(subtotal * (fallbackTaxPercent / 100));
    return {
      serviceCharge,
      additionalFees: 0,
      additionalFeeDetails: [],
      tax,
      totalFees: serviceCharge + tax,
    };
  }

  let serviceCharge = 0;
  let additionalFees = 0;
  const additionalFeeDetails: { name: string; amount: number }[] = [];

  // Phase 1 — everything except VAT, applied to the base subtotal.
  for (const fee of enabled) {
    if (isVatFee(fee.name)) continue;
    const amount = fee.feeType === 'percentage' ? subtotal * (fee.value / 100) : fee.value;
    if (isServiceChargeFee(fee.name)) {
      serviceCharge += amount;
    } else {
      additionalFees += amount;
      additionalFeeDetails.push({ name: fee.name, amount: Math.round(amount) });
    }
  }

  // Phase 2 — VAT applied last, on the subtotal + service charge + add-on fees.
  const subtotalBeforeVat = subtotal + serviceCharge + additionalFees;
  const vatFee = enabled.find(f => isVatFee(f.name));
  let tax = 0;
  if (vatFee) {
    tax = vatFee.feeType === 'percentage'
      ? subtotalBeforeVat * (vatFee.value / 100)
      : vatFee.value;
  }

  serviceCharge = Math.round(serviceCharge);
  additionalFees = Math.round(additionalFees);
  tax = Math.round(tax);

  return {
    serviceCharge,
    additionalFees,
    additionalFeeDetails,
    tax,
    totalFees: serviceCharge + additionalFees + tax,
  };
}

/**
 * Resolve the seasonal rate multiplier for a stay based on the check-in date.
 * Mirrors the front-desk `activeSeason` logic in useBookingEngine/ERPContext.
 */
export function getSeasonMultiplier(
  checkIn: string,
  seasons: SeasonRow[] | undefined | null,
): { multiplier: number; name: string } {
  if (!checkIn || !seasons || seasons.length === 0) return { multiplier: 1, name: '' };
  const d = new Date(checkIn);
  if (isNaN(d.getTime())) return { multiplier: 1, name: '' };

  const found = seasons.find(s => {
    const start = new Date(d.getFullYear(), s.start_month, s.start_day);
    const end = new Date(d.getFullYear(), s.end_month, s.end_day);
    // Season that wraps across the new year (e.g. Nov 20 -> Jan 10)
    if (start > end) return d >= start || d <= end;
    return d >= start && d <= end;
  });

  if (!found) return { multiplier: 1, name: '' };
  return { multiplier: Number(found.multiplier) || 1, name: found.name };
}

/**
 * Resolve a rate plan's base modifier by id. Defaults to 1.0 (no adjustment)
 * when the plan is missing or inactive.
 */
export function getRatePlanModifier(
  ratePlanId: string | undefined | null,
  ratePlans: RatePlanRow[] | undefined | null,
): { modifier: number; name: string } {
  if (!ratePlanId || !ratePlans) return { modifier: 1, name: 'Standard Rate' };
  const plan = ratePlans.find(r => r.id === ratePlanId && r.active !== false);
  if (!plan) return { modifier: 1, name: 'Standard Rate' };
  return { modifier: Number(plan.base_modifier) || 1, name: plan.name };
}

/**
 * Compute the effective nightly rate for a room type, applying the seasonal
 * multiplier and rate-plan modifier on top of the base price.
 */
export function getEffectiveNightlyRate(
  baseRate: number,
  seasonMultiplier: number,
  ratePlanModifier: number,
): number {
  return Math.round(baseRate * seasonMultiplier * ratePlanModifier);
}
