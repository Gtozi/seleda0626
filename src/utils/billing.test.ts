/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Billing Utils Tests
 * Unit tests for billing calculation functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateNights,
  calculateDailyRate,
  calculateFolioComponents,
  applyTax,
  applyServiceCharge,
  getSeasonalMultiplier,
  calculateBillingBreakdownFromBackend,
  validateFeeComponentsMatch,
} from './billing';
import { RatePlan, Promotion, Season } from '../types/erp';
import { FolioCharge } from '../types/erp';

describe('Billing Utils', () => {
  describe('calculateNights', () => {
    it('should calculate correct number of nights', () => {
      expect(calculateNights('2024-01-01', '2024-01-03')).toBe(2);
      expect(calculateNights('2024-01-01', '2024-01-02')).toBe(1);
      expect(calculateNights('2024-01-01', '2024-01-08')).toBe(7);
    });

    it('should return 0 for same-day check-in and check-out', () => {
      expect(calculateNights('2024-01-01', '2024-01-01')).toBe(0);
    });

    it('should handle month boundaries', () => {
      expect(calculateNights('2024-01-30', '2024-02-02')).toBe(3);
    });

    it('should handle year boundaries', () => {
      expect(calculateNights('2023-12-30', '2024-01-02')).toBe(3);
    });

    it('should return 1 for invalid date ranges', () => {
      expect(calculateNights('2024-01-01', '2024-01-00')).toBe(1);
    });

    it('should handle leap year dates', () => {
      expect(calculateNights('2024-02-28', '2024-03-01')).toBe(2); // Leap year
      expect(calculateNights('2023-02-28', '2023-03-01')).toBe(1); // Non-leap year
    });
  });

  describe('getSeasonalMultiplier', () => {
    const seasons: Season[] = [
      { id: 'peak', name: 'Peak Season', startMonth: 5, startDay: 1, endMonth: 8, endDay: 31, multiplier: 1.5 },
      { id: 'off-peak', name: 'Off-Peak', startMonth: 9, startDay: 1, endMonth: 4, endDay: 30, multiplier: 0.8 },
    ];

    it('should apply peak season multiplier', () => {
      expect(getSeasonalMultiplier('2024-06-15', seasons)).toBe(1.5);
      expect(getSeasonalMultiplier('2024-07-01', seasons)).toBe(1.5);
    });

    it('should apply off-peak season multiplier', () => {
      expect(getSeasonalMultiplier('2024-10-15', seasons)).toBe(0.8);
      expect(getSeasonalMultiplier('2024-02-01', seasons)).toBe(0.8);
    });

    it('should return 1.0 when no seasons defined', () => {
      expect(getSeasonalMultiplier('2024-06-15', [])).toBe(1.0);
      expect(getSeasonalMultiplier('2024-06-15', undefined as any)).toBe(1.0);
    });

    it('should handle cross-year seasons', () => {
      const crossYearSeasons: Season[] = [
        { id: 'winter', name: 'Winter', startMonth: 11, startDay: 1, endMonth: 2, endDay: 28, multiplier: 1.2 },
      ];
      expect(getSeasonalMultiplier('2024-12-15', crossYearSeasons)).toBe(1.2);
      expect(getSeasonalMultiplier('2025-01-15', crossYearSeasons)).toBe(1.2);
    });

    it('should return 1.0 for dates outside all seasons', () => {
      expect(getSeasonalMultiplier('2024-09-01', seasons)).toBe(1.0);
    });
  });

  describe('calculateDailyRate', () => {
    const ratePlans: RatePlan[] = [
      {
        id: 'standard',
        name: 'Standard',
        description: 'Standard rate',
        baseModifier: 1.0,
        active: true,
      },
      {
        id: 'corporate',
        name: 'Corporate',
        description: 'Corporate discount',
        baseModifier: 0.9,
        active: true,
      },
    ];

    const promotions: Promotion[] = [
      {
        id: 'promo-1',
        code: 'SUMMER10',
        name: 'Summer 10% Off',
        discountPercent: 10,
        active: true,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        appliesTo: ['Single', 'Double'],
      },
    ];

    it('should return a base rate for a known room type', () => {
      const rate = calculateDailyRate('Single', undefined, ratePlans, promotions);
      expect(rate).toBe(120);
    });

    it('should apply a rate plan modifier', () => {
      const rate = calculateDailyRate('Single', 'corporate', ratePlans, promotions);
      expect(rate).toBe(108); // 120 * 0.9
    });

    it('should apply a promotion discount', () => {
      const rate = calculateDailyRate('Single', undefined, ratePlans, promotions, 'SUMMER10');
      expect(rate).toBe(108); // 120 * 0.9
    });

    it('should ignore inactive promotions', () => {
      const inactivePromos: Promotion[] = [
        { ...promotions[0], active: false },
      ];
      const rate = calculateDailyRate('Single', undefined, ratePlans, inactivePromos, 'SUMMER10');
      expect(rate).toBe(120); // No discount applied
    });

    it('should ignore promotions past valid date', () => {
      const expiredPromos: Promotion[] = [
        { ...promotions[0], validTo: '2023-12-31' },
      ];
      const rate = calculateDailyRate('Single', undefined, ratePlans, expiredPromos, 'SUMMER10');
      expect(rate).toBe(120); // No discount applied
    });

    it('should handle unknown room types with default rate', () => {
      const rate = calculateDailyRate('Unknown', undefined, ratePlans, promotions);
      expect(rate).toBe(150); // Default rate
    });

    it('should handle unknown rate plans', () => {
      const rate = calculateDailyRate('Single', 'unknown', ratePlans, promotions);
      expect(rate).toBe(120); // No modifier applied
    });

    it('should combine rate plan and promotion discounts', () => {
      const rate = calculateDailyRate('Single', 'corporate', ratePlans, promotions, 'SUMMER10');
      // 120 * 0.9 (plan) * 0.9 (promo) = 97.2 -> Math.round = 97
      expect(rate).toBe(97);
    });

    it('should handle multiple rate plans', () => {
      const multiplePlans: RatePlan[] = [
        ...ratePlans,
        { id: 'premium', name: 'Premium', description: 'Premium rate', baseModifier: 1.3, active: true },
      ];
      const rate = calculateDailyRate('Suite', 'premium', multiplePlans, promotions);
      expect(rate).toBe(403); // 350 * 1.3 = 455
    });
  });

  describe('applyTax', () => {
    it('should return amount inclusive of tax', () => {
      expect(applyTax(100, 10)).toBe(110);
      expect(applyTax(100, 15)).toBe(115);
      expect(applyTax(200, 10)).toBe(220);
    });

    it('should handle zero tax', () => {
      expect(applyTax(100, 0)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      expect(applyTax(100, 10.5)).toBe(110.5);
      expect(applyTax(99.99, 10)).toBeCloseTo(109.99, 2);
    });
  });

  describe('applyServiceCharge', () => {
    it('should return amount inclusive of service charge', () => {
      expect(applyServiceCharge(100, 10)).toBe(110);
      expect(applyServiceCharge(100, 15)).toBe(115);
      expect(applyServiceCharge(200, 10)).toBe(220);
    });

    it('should handle zero service charge', () => {
      expect(applyServiceCharge(100, 0)).toBe(100);
    });

    it('should handle large amounts', () => {
      expect(applyServiceCharge(10000, 15)).toBe(11500);
      expect(applyTax(50000, 10)).toBe(55000);
    });

    it('should handle decimal percentages', () => {
      expect(applyTax(100, 12.5)).toBe(112.5);
      expect(applyServiceCharge(200, 7.5)).toBe(215);
    });
  });

  describe('calculateFolioComponents', () => {
    it('should calculate complete folio breakdown', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
        { id: '2', amount: 50, description: 'F&B', date: '2024-01-01' },
      ];

      const reservation = {
        discountPercent: 10,
      };

      const result = calculateFolioComponents(charges, reservation, { feeComponents: [] });

      expect(result.subtotal).toBe(150); // 100 + 50
      expect(result.discountAmt).toBe(15); // 10% of 150
      expect(result.total).toBe(135); // 150 - 15
    });

    it('should handle voided charges', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
        { id: '2', amount: 50, description: 'F&B', date: '2024-01-01', isVoided: true },
      ];

      const result = calculateFolioComponents(charges, {}, { feeComponents: [] });

      expect(result.subtotal).toBe(100); // Only non-voided charge
    });

    it('should apply a percentage service charge fee', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const settings = {
        feeComponents: [
          { name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, {}, settings);

      expect(result.subtotal).toBe(100);
      expect(result.serviceAmt).toBeCloseTo(10, 2);
      expect(result.total).toBeCloseTo(110, 2);
    });

    it('should apply a percentage tax fee', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const settings = {
        feeComponents: [
          { name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, {}, settings);

      expect(result.subtotal).toBe(100);
      expect(result.taxAmt).toBeCloseTo(15, 2);
      expect(result.total).toBeCloseTo(115, 2);
    });

    it('should apply fixed amount fees', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const settings = {
        feeComponents: [
          { name: 'Resort Fee', feeType: 'fixed', value: 25, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, {}, settings);

      expect(result.subtotal).toBe(100);
      expect(result.addonTotal).toBe(25);
      expect(result.total).toBe(125);
    });

    it('should apply multiple fees in correct order (non-VAT first, then VAT)', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const settings = {
        feeComponents: [
          { name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: true },
          { name: 'Resort Fee', feeType: 'fixed', value: 20, isEnabled: true },
          { name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, {}, settings);

      // Subtotal: 100
      // Service Charge (10%): 10
      // Resort Fee (fixed): 20
      // Subtotal before VAT: 130
      // VAT (15% on 130): 19.5
      // Total: 149.5
      expect(result.serviceAmt).toBeCloseTo(10, 2);
      expect(result.addonTotal).toBe(20);
      expect(result.taxAmt).toBeCloseTo(19.5, 2);
      expect(result.total).toBeCloseTo(149.5, 2);
    });

    it('should handle disabled fee components', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const settings = {
        feeComponents: [
          { name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: false },
          { name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, {}, settings);

      expect(result.serviceAmt).toBe(0);
      expect(result.taxAmt).toBeCloseTo(15, 2);
    });

    it('should handle empty charges array', () => {
      const result = calculateFolioComponents([], {}, { feeComponents: [] });
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should apply discount before fees', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];

      const reservation = { discountPercent: 20 };
      const settings = {
        feeComponents: [
          { name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true },
        ],
      };

      const result = calculateFolioComponents(charges, reservation, settings);

      // Subtotal: 100
      // Discount (20%): 20
      // Taxable subtotal: 80
      // VAT (15% on 80): 12
      // Total: 92
      expect(result.discountAmt).toBe(20);
      expect(result.taxAmt).toBeCloseTo(12, 2);
      expect(result.total).toBeCloseTo(92, 2);
    });
  });

  describe('validateFeeComponentsMatch', () => {
    it('should return valid for matching components', () => {
      const frontend = [
        { id: '1', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const backend = [
        { id: '1', name: 'VAT', fee_type: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const result = validateFeeComponentsMatch(frontend, backend);
      expect(result.valid).toBe(true);
      expect(result.mismatches).toEqual([]);
    });

    it('should detect name mismatches', () => {
      const frontend = [
        { id: '1', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const backend = [
        { id: '1', name: 'Tax', fee_type: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const result = validateFeeComponentsMatch(frontend, backend);
      expect(result.valid).toBe(false);
      expect(result.mismatches).toContain('Name mismatch for component 0: frontend="VAT", backend="Tax"');
    });

    it('should detect value mismatches', () => {
      const frontend = [
        { id: '1', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const backend = [
        { id: '1', name: 'VAT', fee_type: 'percentage', value: 18, isEnabled: true, displayOrder: 1 },
      ];
      const result = validateFeeComponentsMatch(frontend, backend);
      expect(result.valid).toBe(false);
      expect(result.mismatches).toContain('Value mismatch for "VAT": frontend=15, backend=18');
    });

    it('should detect missing components', () => {
      const frontend = [
        { id: '1', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
        { id: '2', name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: true, displayOrder: 2 },
      ];
      const backend = [
        { id: '1', name: 'VAT', fee_type: 'percentage', value: 15, isEnabled: true, displayOrder: 1 },
      ];
      const result = validateFeeComponentsMatch(frontend, backend);
      expect(result.valid).toBe(false);
      expect(result.mismatches).toContain('Frontend component "Service Charge" not found in backend');
    });
  });

  describe('calculateBillingBreakdownFromBackend', () => {
    it('should return null on API error', async () => {
      global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
      const result = await calculateBillingBreakdownFromBackend(100);
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      const result = await calculateBillingBreakdownFromBackend(100);
      expect(result).toBeNull();
    });

    it('should return parsed data on success', async () => {
      const mockResponse = {
        base_amount: 100,
        discount_percent: 10,
        discount_amount: 10,
        discounted_amount: 90,
        non_vat_fees: 15,
        service_charge_total: 10,
        vat_amount: 15.75,
        total_amount: 120.75,
        fee_breakdown: [],
      };
      global.fetch = vi.fn(() => 
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })
      );
      const result = await calculateBillingBreakdownFromBackend(100, 10);
      expect(result).toEqual(mockResponse);
    });
  });
});
