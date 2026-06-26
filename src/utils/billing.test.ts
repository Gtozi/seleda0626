/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Billing Utils Tests
 * Unit tests for billing calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateNights,
  calculateDailyRate,
  calculateFolioComponents,
  applyTax,
  applyServiceCharge,
} from './billing';
import { Season, RatePlan } from '../types/erp';

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
  });

  describe('calculateDailyRate', () => {
    const seasons: Season[] = [
      {
        id: 'peak',
        name: 'Peak Season',
        startMonth: 11, // December
        startDay: 1,
        endMonth: 0, // January
        endDay: 31,
        multiplier: 1.5,
      },
      {
        id: 'off-peak',
        name: 'Off Peak',
        startMonth: 5, // June
        startDay: 1,
        endMonth: 7, // August
        endDay: 31,
        multiplier: 0.8,
      },
    ];

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

    it('should apply seasonal multiplier correctly', () => {
      const baseRate = 100;
      const peakDate = '2024-12-15'; // Peak season
      
      const rate = calculateDailyRate(baseRate, peakDate, seasons, ratePlans, 1.0);
      expect(rate).toBe(150); // 100 * 1.5
    });

    it('should apply rate plan modifier', () => {
      const baseRate = 100;
      const normalDate = '2024-03-15'; // No season
      const corporatePlan = ratePlans.find(p => p.id === 'corporate');
      
      const rate = calculateDailyRate(
        baseRate,
        normalDate,
        seasons,
        ratePlans,
        corporatePlan!.baseModifier
      );
      expect(rate).toBe(90); // 100 * 0.9
    });

    it('should apply yield multiplier', () => {
      const baseRate = 100;
      const normalDate = '2024-03-15';
      const yieldMultiplier = 1.2;
      
      const rate = calculateDailyRate(
        baseRate,
        normalDate,
        seasons,
        ratePlans,
        1.0,
        yieldMultiplier
      );
      expect(rate).toBe(120); // 100 * 1.2
    });

    it('should combine all multipliers', () => {
      const baseRate = 100;
      const peakDate = '2024-12-15';
      const corporatePlan = ratePlans.find(p => p.id === 'corporate');
      const yieldMultiplier = 1.1;
      
      const rate = calculateDailyRate(
        baseRate,
        peakDate,
        seasons,
        ratePlans,
        corporatePlan!.baseModifier,
        yieldMultiplier
      );
      // 100 * 1.5 (season) * 0.9 (rate plan) * 1.1 (yield) = 148.5
      expect(rate).toBe(148.5);
    });
  });

  describe('applyTax', () => {
    it('should calculate tax correctly', () => {
      expect(applyTax(100, 10)).toBe(10);
      expect(applyTax(100, 15)).toBe(15);
      expect(applyTax(200, 10)).toBe(20);
    });

    it('should handle zero tax', () => {
      expect(applyTax(100, 0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(applyTax(100, 10.5)).toBe(10.5);
      expect(applyTax(99.99, 10)).toBeCloseTo(10, 2);
    });
  });

  describe('applyServiceCharge', () => {
    it('should calculate service charge correctly', () => {
      expect(applyServiceCharge(100, 10)).toBe(10);
      expect(applyServiceCharge(100, 15)).toBe(15);
      expect(applyServiceCharge(200, 10)).toBe(20);
    });

    it('should handle zero service charge', () => {
      expect(applyServiceCharge(100, 0)).toBe(0);
    });
  });

  describe('calculateFolioComponents', () => {
    it('should calculate complete folio breakdown', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
        { id: '2', amount: 50, description: 'F&B', date: '2024-01-01' },
      ];
      
      const result = calculateFolioComponents(
        charges,
        [],
        10, // 10% discount
        15, // 15% tax
        10  // 10% service charge
      );

      const subtotal = 150; // 100 + 50
      const afterDiscount = 135; // 150 - 15 (10%)
      const serviceCharge = 13.5; // 135 * 0.1
      const tax = 22.275; // (135 + 13.5) * 0.15
      const total = 170.775; // 135 + 13.5 + 22.275

      expect(result.subtotal).toBe(subtotal);
      expect(result.discountAmount).toBe(15);
      expect(result.afterDiscount).toBe(afterDiscount);
      expect(result.serviceCharge).toBeCloseTo(serviceCharge, 2);
      expect(result.tax).toBeCloseTo(tax, 2);
      expect(result.total).toBeCloseTo(total, 2);
    });

    it('should handle voided charges', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
        { id: '2', amount: 50, description: 'F&B', date: '2024-01-01', isVoided: true },
      ];
      
      const result = calculateFolioComponents(charges, [], 0, 0, 0);
      
      expect(result.subtotal).toBe(100); // Only non-voided charge
    });

    it('should deduct payments from balance', () => {
      const charges = [
        { id: '1', amount: 100, description: 'Room', date: '2024-01-01' },
      ];
      
      const payments = [
        { id: '1', amount: 50, method: 'Cash', date: '2024-01-01' },
      ];
      
      const result = calculateFolioComponents(charges, payments, 0, 0, 0);
      
      expect(result.total).toBe(100);
      expect(result.totalPayments).toBe(50);
      expect(result.balance).toBe(50);
    });
  });
});
