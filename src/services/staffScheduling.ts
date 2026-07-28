/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Staff Scheduling Service
 * Staff scheduling with labor forecasting and management
 */

const API_BASE = '/api/food-beverage';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Types
export interface StaffSchedule {
  id: string;
  staffId: string;
  outletId: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  role: 'server' | 'bartender' | 'chef' | 'sous_chef' | 'line_cook' | 'host' | 'manager' | 'supervisor' | 'busser' | 'runner';
  section?: string;
  scheduledHours: number;
  actualHours?: number;
  hourlyRate: number;
  laborCost: number;
  status: 'scheduled' | 'clocked_in' | 'clocked_out' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaborForecast {
  id: string;
  outletId: string;
  forecastDate: string;
  dayOfWeek: number;
  isHoliday: boolean;
  isSpecialEvent: boolean;
  eventName?: string;
  expectedRevenue?: number;
  expectedOrders?: number;
  expectedGuests?: number;
  recommendedStaffCount: number;
  recommendedHours: number;
  recommendedLaborCost?: number;
  confidenceLevel: number;
  actualRevenue?: number;
  actualOrders?: number;
  actualStaffCount?: number;
  actualHours?: number;
  actualLaborCost?: number;
  forecastAccuracy?: number;
  createdAt: string;
}

export interface ScheduleConflict {
  staffId: string;
  staffName: string;
  conflictingSchedules: Array<{
    date: string;
    shiftStart: string;
    shiftEnd: string;
  }>;
}

// Staff Schedule CRUD operations
export async function fetchStaffSchedules(options?: {
  staffId?: string;
  outletId?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  status?: string;
}): Promise<StaffSchedule[]> {
  const params = new URLSearchParams();
  if (options?.staffId) params.append('staffId', options.staffId);
  if (options?.outletId) params.append('outletId', options.outletId);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.role) params.append('role', options.role);
  if (options?.status) params.append('status', options.status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<StaffSchedule[]>(`/staff-schedules${queryString}`);
}

export async function fetchStaffScheduleById(id: string): Promise<StaffSchedule> {
  return apiRequest<StaffSchedule>(`/staff-schedules/${id}`);
}

export async function createStaffSchedule(schedule: Partial<StaffSchedule>): Promise<StaffSchedule> {
  return apiRequest<StaffSchedule>('/staff-schedules', {
    method: 'POST',
    body: JSON.stringify(schedule),
  });
}

export async function updateStaffSchedule(id: string, schedule: Partial<StaffSchedule>): Promise<StaffSchedule> {
  return apiRequest<StaffSchedule>(`/staff-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  });
}

export async function deleteStaffSchedule(id: string): Promise<void> {
  await apiRequest<void>(`/staff-schedules/${id}`, {
    method: 'DELETE',
  });
}

// Bulk schedule operations
export async function createBulkSchedules(schedules: Partial<StaffSchedule>[]): Promise<StaffSchedule[]> {
  return apiRequest<StaffSchedule[]>('/staff-schedules/bulk', {
    method: 'POST',
    body: JSON.stringify({ schedules }),
  });
}

export async function copyScheduleWeek(
  sourceStartDate: string,
  targetStartDate: string,
  outletId: string
): Promise<StaffSchedule[]> {
  return apiRequest<StaffSchedule[]>('/staff-schedules/copy-week', {
    method: 'POST',
    body: JSON.stringify({ sourceStartDate, targetStartDate, outletId }),
  });
}

// Schedule conflict detection
export async function detectScheduleConflicts(
  schedules: Partial<StaffSchedule>[]
): Promise<ScheduleConflict[]> {
  return apiRequest<ScheduleConflict[]>('/staff-schedules/detect-conflicts', {
    method: 'POST',
    body: JSON.stringify({ schedules }),
  });
}

// Labor Forecasting operations
export async function fetchLaborForecasts(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<LaborForecast[]> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<LaborForecast[]>(`/labor-forecast?${params.toString()}`);
}

export async function generateLaborForecast(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<LaborForecast[]> {
  return apiRequest<LaborForecast[]>('/labor-forecast/generate', {
    method: 'POST',
    body: JSON.stringify({ outletId, startDate, endDate }),
  });
}

export async function updateLaborForecast(
  forecastId: string,
  forecast: Partial<LaborForecast>
): Promise<LaborForecast> {
  return apiRequest<LaborForecast>(`/labor-forecast/${forecastId}`, {
    method: 'PUT',
    body: JSON.stringify(forecast),
  });
}

// Schedule optimization
export async function optimizeSchedule(
  outletId: string,
  startDate: string,
  endDate: string,
  targetLaborPercent: number = 30
): Promise<{
  optimizedSchedules: StaffSchedule[];
  projectedLaborCost: number;
  projectedRevenue: number;
  laborCostPercent: number;
  savings: number;
}> {
  return apiRequest('/staff-schedules/optimize', {
    method: 'POST',
    body: JSON.stringify({ outletId, startDate, endDate, targetLaborPercent }),
  });
}

// Schedule templates
export async function createScheduleTemplate(
  name: string,
  outletId: string,
  schedules: Partial<StaffSchedule>[]
): Promise<{ id: string; name: string }> {
  return apiRequest('/staff-schedules/templates', {
    method: 'POST',
    body: JSON.stringify({ name, outletId, schedules }),
  });
}

export async function applyScheduleTemplate(
  templateId: string,
  startDate: string
): Promise<StaffSchedule[]> {
  return apiRequest<StaffSchedule[]>(`/staff-schedules/templates/${templateId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ startDate }),
  });
}

// Staff availability
export async function setStaffAvailability(
  staffId: string,
  availability: Array<{
    dayOfWeek: number;
    available: boolean;
    startTime?: string;
    endTime?: string;
  }>
): Promise<void> {
  await apiRequest(`/staff-schedules/availability/${staffId}`, {
    method: 'POST',
    body: JSON.stringify({ availability }),
  });
}

export async function fetchStaffAvailability(staffId: string): Promise<Array<{
  dayOfWeek: number;
  available: boolean;
  startTime?: string;
  endTime?: string;
}>> {
  return apiRequest(`/staff-schedules/availability/${staffId}`);
}

// Scheduling Engine
export class StaffSchedulingEngine {
  /**
   * Calculate shift duration in hours
   */
  static calculateShiftDuration(shiftStart: string, shiftEnd: string): number {
    const start = new Date(`2000-01-01T${shiftStart}`);
    const end = new Date(`2000-01-01T${shiftEnd}`);
    
    let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Handle overnight shifts
    if (duration < 0) {
      duration += 24;
    }
    
    return duration;
  }

  /**
   * Calculate labor cost for a shift
   */
  static calculateLaborCost(hours: number, hourlyRate: number): number {
    return hours * hourlyRate;
  }

  /**
   * Check for schedule conflicts
   */
  static checkForConflict(
    schedule: Partial<StaffSchedule>,
    existingSchedules: StaffSchedule[]
  ): boolean {
    if (!schedule.staffId || !schedule.date || !schedule.shiftStart || !schedule.shiftEnd) {
      return false;
    }

    const newStart = new Date(`${schedule.date}T${schedule.shiftStart}`);
    const newEnd = new Date(`${schedule.date}T${schedule.shiftEnd}`);

    return existingSchedules.some(existing => {
      if (existing.staffId !== schedule.staffId || existing.date !== schedule.date) {
        return false;
      }

      const existingStart = new Date(`${existing.date}T${existing.shiftStart}`);
      const existingEnd = new Date(`${existing.date}T${existing.shiftEnd}`);

      // Check for overlap
      return (
        (newStart < existingEnd && newEnd > existingStart) ||
        (newStart < existingStart && newEnd > existingStart) ||
        (newStart < existingEnd && newEnd > existingEnd)
      );
    });
  }

  /**
   * Calculate required staff based on forecast
   */
  static calculateRequiredStaff(
    expectedOrders: number,
    ordersPerStaff: number = 15
  ): number {
    return Math.max(2, Math.ceil(expectedOrders / ordersPerStaff));
  }

  /**
   * Calculate optimal shift distribution
   */
  static calculateOptimalShifts(
    totalStaff: number,
    operatingHours: { open: string; close: string }
  ): Array<{ startTime: string; endTime: string; staffCount: number }> {
    const openTime = operatingHours.open;
    const closeTime = operatingHours.close;
    
    // Simple distribution: split into 2-3 shifts based on total staff
    const shifts: Array<{ startTime: string; endTime: string; staffCount: number }> = [];
    
    if (totalStaff <= 4) {
      // Single shift for small teams
      shifts.push({
        startTime: openTime,
        endTime: closeTime,
        staffCount: totalStaff,
      });
    } else if (totalStaff <= 8) {
      // Two shifts
      const morningStaff = Math.ceil(totalStaff * 0.6);
      const eveningStaff = totalStaff - morningStaff;
      
      const midDay = '14:00';
      shifts.push({
        startTime: openTime,
        endTime: midDay,
        staffCount: morningStaff,
      });
      shifts.push({
        startTime: midDay,
        endTime: closeTime,
        staffCount: eveningStaff,
      });
    } else {
      // Three shifts
      const morningStaff = Math.ceil(totalStaff * 0.4);
      const afternoonStaff = Math.ceil(totalStaff * 0.4);
      const eveningStaff = totalStaff - morningStaff - afternoonStaff;
      
      shifts.push({
        startTime: openTime,
        endTime: '14:00',
        staffCount: morningStaff,
      });
      shifts.push({
        startTime: '11:00',
        endTime: '18:00',
        staffCount: afternoonStaff,
      });
      shifts.push({
        startTime: '16:00',
        endTime: closeTime,
        staffCount: eveningStaff,
      });
    }
    
    return shifts;
  }

  /**
   * Calculate overtime hours
   */
  static calculateOvertimeHours(
    actualHours: number,
    standardHours: number = 8
  ): number {
    return Math.max(0, actualHours - standardHours);
  }

  /**
   * Calculate overtime cost
   */
  static calculateOvertimeCost(
    overtimeHours: number,
    hourlyRate: number,
    overtimeMultiplier: number = 1.5
  ): number {
    return overtimeHours * hourlyRate * overtimeMultiplier;
  }

  /**
   * Optimize schedule based on labor cost target
   */
  static optimizeForLaborCost(
    schedules: StaffSchedule[],
    targetLaborPercent: number,
    expectedRevenue: number
  ): {
    optimizedSchedules: StaffSchedule[];
    projectedLaborCost: number;
    laborCostPercent: number;
    recommendations: string[];
  } {
    const currentLaborCost = schedules.reduce((sum, s) => sum + s.laborCost, 0);
    const currentLaborPercent = (currentLaborCost / expectedRevenue) * 100;
    const targetLaborCost = expectedRevenue * (targetLaborPercent / 100);
    
    const recommendations: string[] = [];
    let optimizedSchedules = [...schedules];
    
    if (currentLaborPercent > targetLaborPercent) {
      recommendations.push('Current labor cost exceeds target. Consider reducing staff hours.');
      recommendations.push('Review shift overlaps and reduce redundancy.');
      
      // Simple optimization: remove non-essential shifts (last 20%)
      const shiftCount = Math.floor(schedules.length * 0.2);
      if (shiftCount > 0) {
        optimizedSchedules = schedules.slice(0, -shiftCount);
        recommendations.push(`Removed ${shiftCount} low-priority shifts.`);
      }
    } else if (currentLaborPercent < targetLaborPercent * 0.8) {
      recommendations.push('Current labor cost is significantly below target. Consider adding staff for better service.');
    } else {
      recommendations.push('Labor cost is within acceptable range.');
    }
    
    const optimizedLaborCost = optimizedSchedules.reduce((sum, s) => sum + s.laborCost, 0);
    const optimizedLaborPercent = (optimizedLaborCost / expectedRevenue) * 100;
    
    return {
      optimizedSchedules,
      projectedLaborCost: optimizedLaborCost,
      laborCostPercent: optimizedLaborPercent,
      recommendations,
    };
  }

  /**
   * Generate weekly schedule summary
   */
  static generateWeeklySummary(
    schedules: StaffSchedule[]
  ): {
    totalShifts: number;
    totalScheduledHours: number;
    totalLaborCost: number;
    byRole: Record<string, { count: number; hours: number; cost: number }>;
    byDay: Record<string, { count: number; hours: number; cost: number }>;
  } {
    const totalShifts = schedules.length;
    const totalScheduledHours = schedules.reduce((sum, s) => sum + s.scheduledHours, 0);
    const totalLaborCost = schedules.reduce((sum, s) => sum + s.laborCost, 0);
    
    const byRole: Record<string, { count: number; hours: number; cost: number }> = {};
    const byDay: Record<string, { count: number; hours: number; cost: number }> = {};
    
    for (const schedule of schedules) {
      // By role
      if (!byRole[schedule.role]) {
        byRole[schedule.role] = { count: 0, hours: 0, cost: 0 };
      }
      byRole[schedule.role].count++;
      byRole[schedule.role].hours += schedule.scheduledHours;
      byRole[schedule.role].cost += schedule.laborCost;
      
      // By day
      if (!byDay[schedule.date]) {
        byDay[schedule.date] = { count: 0, hours: 0, cost: 0 };
      }
      byDay[schedule.date].count++;
      byDay[schedule.date].hours += schedule.scheduledHours;
      byDay[schedule.date].cost += schedule.laborCost;
    }
    
    return {
      totalShifts,
      totalScheduledHours,
      totalLaborCost,
      byRole,
      byDay,
    };
  }
}

// Export singleton instance
export const staffSchedulingEngine = StaffSchedulingEngine;
