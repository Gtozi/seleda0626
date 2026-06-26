/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Reservation, FolioCharge, FolioPayment, Season, RatePlan, Promotion } from '../types/erp';

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

export const calculateTotalCharges = (charges: FolioCharge[]): number => {
  return (charges || [])
    .filter(c => !c.isVoided)
    .reduce((sum, c) => sum + c.amount, 0);
};

export const calculateTotalPayments = (payments: FolioPayment[]): number => {
  return (payments || [])
    .filter(p => !p.isVoided)
    .reduce((sum, p) => sum + p.amount, 0);
};

export const calculateBalance = (reservation: Reservation): number => {
  const totalCharges = calculateTotalCharges(reservation.charges || []);
  const totalPayments = calculateTotalPayments(reservation.payments || []);
  return totalCharges - totalPayments;
};

export const calculateRemainingBalance = (reservation: Reservation): number => {
  return calculateBalance(reservation);
};

export const getSeasonalMultiplier = (date: string, seasons: Season[]): number => {
  if (!seasons || seasons.length === 0) return 1.0;
  const d = new Date(date);
  const m = d.getMonth();
  const day = d.getDate();

  const season = seasons.find(s => {
    const start = new Date(d.getFullYear(), s.startMonth, s.startDay);
    const end = new Date(d.getFullYear(), s.endMonth, s.endDay);
    // Handle cross-year seasons if needed, but for now simple range
    if (start <= end) {
      return d >= start && d <= end;
    } else {
      // Crosses year boundary (e.g. Dec to Jan)
      return d >= start || d <= end;
    }
  });

  return season ? season.multiplier : 1.0;
};

export const calculateDailyRate = (
  roomType: string,
  ratePlanId: string | undefined,
  ratePlans: RatePlan[],
  promotions: Promotion[],
  promoCode?: string
): number => {
  // Base rates by room type
  const baseRates: Record<string, number> = {
    'Single': 120,
    'Double': 180,
    'Suite': 350,
    'Deluxe': 250,
    'Penthouse': 850
  };

  let rate = baseRates[roomType] || 150;

  // Apply Rate Plan modifier
  if (ratePlanId) {
    const plan = ratePlans.find(p => p.id === ratePlanId);
    if (plan) rate *= plan.baseModifier;
  }

  // Apply Promo discount
  if (promoCode) {
    const promo = promotions.find(p => p.code === promoCode && p.active);
    if (promo) {
      rate *= (1 - promo.discountPercent / 100);
    }
  }

  return Math.round(rate);
};

export const calculateFolioComponents = (
  charges: FolioCharge[],
  reservation: Partial<Reservation>,
  settings: any
) => {
  const subtotal = calculateTotalCharges(charges);
  const discPct = reservation.discountPercent || 0;
  const discountAmt = subtotal * (discPct / 100);

  const taxableSubtotal = subtotal - discountAmt;

  // Use feeComponents array if available, otherwise fall back to legacy fields
  const feeComponents = settings.feeComponents || [];
  const enabledFees = feeComponents.filter((f: any) => f.isEnabled);

  let serviceAmt = 0;
  let addonTotal = 0;
  const addonDetails: { name: string; amount: number }[] = [];
  const feeBreakdown: { name: string; amount: number; type: string; value: number }[] = [];

  // Phase 1: non-VAT fees on taxable subtotal
  for (const fee of enabledFees) {
    if (fee.name.toLowerCase().includes('vat') || fee.name.toLowerCase().includes('tax')) continue;

    const amount = fee.feeType === 'percentage'
      ? taxableSubtotal * (fee.value / 100)
      : fee.value;

    feeBreakdown.push({ name: fee.name, amount, type: fee.feeType, value: fee.value });

    if (fee.name.toLowerCase().includes('service charge')) {
      serviceAmt += amount;
    } else {
      addonTotal += amount;
      addonDetails.push({ name: fee.name, amount });
    }
  }

  // Phase 2: VAT on (taxable subtotal + non-VAT fees)
  const subtotalBeforeVat = taxableSubtotal + serviceAmt + addonTotal;
  let taxAmt = 0;
  const vatFee = enabledFees.find((f: any) =>
    f.name.toLowerCase().includes('vat') || f.name.toLowerCase().includes('tax')
  );
  if (vatFee) {
    taxAmt = vatFee.feeType === 'percentage'
      ? subtotalBeforeVat * (vatFee.value / 100)
      : vatFee.value;
    feeBreakdown.push({ name: vatFee.name, amount: taxAmt, type: vatFee.feeType, value: vatFee.value });
  }

  const total = subtotalBeforeVat + taxAmt;

  return {
    subtotal,
    discountAmt,
    serviceAmt,
    addonTotal,
    addonDetails,
    taxAmt,
    total,
    feeBreakdown
  };
};

export const applyTax = (amount: number, taxPercent: number): number => {
  return amount * (1 + taxPercent / 100);
};

export const applyServiceCharge = (amount: number, serviceChargePercent: number): number => {
  return amount * (1 + serviceChargePercent / 100);
};
