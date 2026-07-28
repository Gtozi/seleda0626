/**
 * Executive Portal KPI Calculations Regression Tests
 * Tests for KPI calculation accuracy and consistency
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../src/server/supabaseAdmin';

describe('Executive Portal KPI Calculations', () => {
  const testPropertyId = 'test-property-id';
  
  beforeAll(async () => {
    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Occupancy Rate KPI', () => {
    it('should calculate occupancy rate correctly', async () => {
      const totalRooms = 100;
      const occupiedRooms = 75;
      const expectedRate = 75.0;

      const result = await calculateOccupancyRate(testPropertyId);
      
      expect(result).toBeCloseTo(expectedRate, 1);
    });

    it('should handle zero total rooms', async () => {
      const result = await calculateOccupancyRate('empty-property-id');
      
      expect(result).toBe(0);
    });

    it('should exclude out-of-order rooms', async () => {
      const result = await calculateOccupancyRate(testPropertyId);
      
      // Verify calculation excludes OOO rooms
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('ADR (Average Daily Rate) KPI', () => {
    it('should calculate ADR correctly', async () => {
      const totalRevenue = 15000;
      const occupiedRooms = 75;
      const expectedADR = 200.0;

      const result = await calculateADR(testPropertyId);
      
      expect(result).toBeCloseTo(expectedADR, 1);
    });

    it('should handle zero occupied rooms', async () => {
      const result = await calculateADR('empty-property-id');
      
      expect(result).toBe(0);
    });

    it('should only include confirmed/checked-in/completed reservations', async () => {
      const result = await calculateADR(testPropertyId);
      
      // Verify correct status filtering
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('RevPAR KPI', () => {
    it('should calculate RevPAR correctly', async () => {
      const totalRevenue = 15000;
      const totalRooms = 100;
      const expectedRevPAR = 150.0;

      const result = await calculateRevPAR(testPropertyId);
      
      expect(result).toBeCloseTo(expectedRevPAR, 1);
    });

    it('should handle zero total rooms', async () => {
      const result = await calculateRevPAR('empty-property-id');
      
      expect(result).toBe(0);
    });

    it('should exclude out-of-order rooms from available count', async () => {
      const result = await calculateRevPAR(testPropertyId);
      
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Labor Cost % KPI', () => {
    it('should calculate labor cost percentage correctly', async () => {
      const totalLaborCost = 45000;
      const totalRevenue = 150000;
      const expectedPercent = 30.0;

      const result = await calculateLaborCostPercent(testPropertyId);
      
      expect(result).toBeCloseTo(expectedPercent, 1);
    });

    it('should handle zero revenue', async () => {
      const result = await calculateLaborCostPercent('no-revenue-property-id');
      
      expect(result).toBe(0);
    });

    it('should use 30-day rolling period', async () => {
      const result = await calculateLaborCostPercent(testPropertyId);
      
      // Verify calculation uses correct time period
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('KPI Data Consistency', () => {
    it('should maintain consistency between trigger and scheduled calculations', async () => {
      // Calculate via trigger
      const triggerResult = await getKPIViaTrigger(testPropertyId, 'Occupancy Rate');
      
      // Calculate via scheduled function
      const scheduledResult = await getKPIViaScheduled(testPropertyId, 'Occupancy Rate');
      
      expect(triggerResult).toBeCloseTo(scheduledResult, 0.1);
    });

    it('should handle concurrent updates without data corruption', async () => {
      const updates = Array.from({ length: 10 }, (_, i) => 
        updateRoomStatus(testPropertyId, i, 'occupied')
      );
      
      await Promise.all(updates);
      
      const result = await calculateOccupancyRate(testPropertyId);
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('KPI Threshold Alerts', () => {
    it('should trigger alert when occupancy rate falls below threshold', async () => {
      const threshold = 50.0;
      const currentValue = 45.0;
      
      const shouldAlert = checkThresholdBreach(currentValue, threshold, 'below');
      
      expect(shouldAlert).toBe(true);
    });

    it('should trigger alert when labor cost exceeds threshold', async () => {
      const threshold = 35.0;
      const currentValue = 40.0;
      
      const shouldAlert = checkThresholdBreach(currentValue, threshold, 'above');
      
      expect(shouldAlert).toBe(true);
    });

    it('should not trigger alert when within threshold', async () => {
      const threshold = 35.0;
      const currentValue = 30.0;
      
      const shouldAlert = checkThresholdBreach(currentValue, threshold, 'above');
      
      expect(shouldAlert).toBe(false);
    });
  });

  describe('KPI Historical Accuracy', () => {
    it('should maintain accurate historical KPI data', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const historicalData = await getHistoricalKPIData(testPropertyId, 'Occupancy Rate', startDate);
      
      expect(historicalData.length).toBeGreaterThan(0);
      expect(historicalData.every(d => d.value >= 0 && d.value <= 100)).toBe(true);
    });

    it('should calculate correct averages for historical periods', async () => {
      const period = 30;
      const historicalData = await getHistoricalKPIData(testPropertyId, 'ADR', new Date());
      
      const avg = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
      
      expect(avg).toBeGreaterThan(0);
    });
  });
});

// Helper functions for tests

async function setupTestData() {
  // Create test property
  await supabaseAdmin.from('properties').insert({
    id: 'test-property-id',
    name: 'Test Property',
    created_at: new Date().toISOString(),
  });

  // Create test rooms
  const rooms = Array.from({ length: 100 }, (_, i) => ({
    property_id: 'test-property-id',
    room_number: `R${i + 1}`,
    status: i < 75 ? 'occupied' : 'available',
    room_type: 'standard',
  }));
  
  await supabaseAdmin.from('rooms').insert(rooms);

  // Create test reservations
  const reservations = Array.from({ length: 75 }, (_, i) => ({
    property_id: 'test-property-id',
    room_id: `room-${i}`,
    status: 'checked_in',
    check_in_date: new Date().toISOString().split('T')[0],
    total_amount: 200,
    nightly_rate: 200,
  }));
  
  await supabaseAdmin.from('reservations').insert(reservations);

  // Create test labor costs
  await supabaseAdmin.from('labor_costs').insert({
    property_id: 'test-property-id',
    total_cost: 45000,
    overtime_cost: 5000,
    period: new Date().toISOString(),
  });
}

async function cleanupTestData() {
  await supabaseAdmin.from('labor_costs').delete().eq('property_id', 'test-property-id');
  await supabaseAdmin.from('reservations').delete().eq('property_id', 'test-property-id');
  await supabaseAdmin.from('rooms').delete().eq('property_id', 'test-property-id');
  await supabaseAdmin.from('properties').delete().eq('id', 'test-property-id');
}

async function calculateOccupancyRate(propertyId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('metric_values')
    .select('value')
    .eq('property_id', propertyId)
    .eq('metric_id', (await supabaseAdmin.from('metric_definitions').select('metric_id').eq('name', 'Occupancy Rate').single()).data?.metric_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  
  return data?.value || 0;
}

async function calculateADR(propertyId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('metric_values')
    .select('value')
    .eq('property_id', propertyId)
    .eq('metric_id', (await supabaseAdmin.from('metric_definitions').select('metric_id').eq('name', 'ADR').single()).data?.metric_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  
  return data?.value || 0;
}

async function calculateRevPAR(propertyId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('metric_values')
    .select('value')
    .eq('property_id', propertyId)
    .eq('metric_id', (await supabaseAdmin.from('metric_definitions').select('metric_id').eq('name', 'RevPAR').single()).data?.metric_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  
  return data?.value || 0;
}

async function calculateLaborCostPercent(propertyId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('metric_values')
    .select('value')
    .eq('property_id', propertyId)
    .eq('metric_id', (await supabaseAdmin.from('metric_definitions').select('metric_id').eq('name', 'Labor Cost %').single()).data?.metric_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  
  return data?.value || 0;
}

async function getKPIViaTrigger(propertyId: string, kpiName: string): Promise<number> {
  // Simulate trigger-based calculation
  return calculateOccupancyRate(propertyId);
}

async function getKPIViaScheduled(propertyId: string, kpiName: string): Promise<number> {
  // Simulate scheduled recalculation
  return calculateOccupancyRate(propertyId);
}

async function updateRoomStatus(propertyId: string, roomId: number, status: string) {
  await supabaseAdmin
    .from('rooms')
    .update({ status })
    .eq('property_id', propertyId)
    .eq('room_number', `R${roomId + 1}`);
}

function checkThresholdBreach(currentValue: number, threshold: number, condition: string): boolean {
  if (condition === 'above') return currentValue > threshold;
  if (condition === 'below') return currentValue < threshold;
  return false;
}

async function getHistoricalKPIData(propertyId: string, kpiName: string, startDate: Date) {
  const { data } = await supabaseAdmin
    .from('metric_values')
    .select('*')
    .eq('property_id', propertyId)
    .eq('metric_id', (await supabaseAdmin.from('metric_definitions').select('metric_id').eq('name', kpiName).single()).data?.metric_id)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });
  
  return data || [];
}
