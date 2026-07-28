/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Time Clock Integration Service
 * Staff time clock management and integration
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
export interface TimeClockEntry {
  id: string;
  staffId: string;
  outletId: string;
  scheduleId?: string;
  clockInTime: string;
  clockOutTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours: number;
  breakHours: number;
  workedHours: number;
  hourlyRate: number;
  totalPay: number;
  isOvertime: boolean;
  overtimeHours: number;
  overtimeRate: number;
  location?: string;
  deviceId?: string;
  notes?: string;
  createdAt: string;
}

export interface ClockStatus {
  staffId: string;
  isClockedIn: boolean;
  currentEntry?: TimeClockEntry;
  clockInTime?: string;
  breakStatus: 'none' | 'on_break' | 'break_ended';
  scheduledShift?: {
    shiftStart: string;
    shiftEnd: string;
  };
}

export interface TimeClockReport {
  period: { startDate: string; endDate: string };
  totalEntries: number;
  totalHours: number;
  totalBreakHours: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  totalPay: number;
  byStaff: Array<{
    staffId: string;
    staffName: string;
    totalHours: number;
    workedHours: number;
    overtimeHours: number;
    totalPay: number;
    averageDailyHours: number;
  }>;
  byOutlet: Array<{
    outletId: string;
    outletName: string;
    totalHours: number;
    workedHours: number;
    totalPay: number;
  }>;
}

// Time Clock CRUD operations
export async function fetchTimeClockEntries(
  staffId?: string,
  outletId?: string,
  startDate?: string,
  endDate?: string
): Promise<TimeClockEntry[]> {
  const params = new URLSearchParams();
  if (staffId) params.append('staffId', staffId);
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<TimeClockEntry[]>(`/time-clock${queryString}`);
}

export async function fetchTimeClockEntryById(id: string): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>(`/time-clock/${id}`);
}

export async function clockIn(
  staffId: string,
  outletId: string,
  options?: {
    scheduleId?: string;
    location?: string;
    deviceId?: string;
    notes?: string;
  }
): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>('/time-clock/clock-in', {
    method: 'POST',
    body: JSON.stringify({ staffId, outletId, ...options }),
  });
}

export async function clockOut(
  entryId: string,
  options?: {
    notes?: string;
  }
): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>(`/time-clock/${entryId}/clock-out`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

export async function startBreak(entryId: string): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>(`/time-clock/${entryId}/start-break`, {
    method: 'POST',
  });
}

export async function endBreak(entryId: string): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>(`/time-clock/${entryId}/end-break`, {
    method: 'POST',
  });
}

export async function updateTimeClockEntry(
  id: string,
  entry: Partial<TimeClockEntry>
): Promise<TimeClockEntry> {
  return apiRequest<TimeClockEntry>(`/time-clock/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  });
}

export async function deleteTimeClockEntry(id: string): Promise<void> {
  await apiRequest<void>(`/time-clock/${id}`, {
    method: 'DELETE',
  });
}

// Clock status
export async function getClockStatus(staffId: string): Promise<ClockStatus> {
  return apiRequest<ClockStatus>(`/time-clock/status/${staffId}`);
}

export async function getAllClockStatuses(outletId?: string): Promise<ClockStatus[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ClockStatus[]>(`/time-clock/status/all${queryString}`);
}

// Time clock reports
export async function generateTimeClockReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<TimeClockReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<TimeClockReport>(`/time-clock/report?${params.toString()}`);
}

export async function getAttendanceReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<Array<{
  staffId: string;
  staffName: string;
  scheduledShifts: number;
  shiftsWorked: number;
  attendanceRate: number;
  onTimeArrivals: number;
  lateArrivals: number;
  noShows: number;
}>> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest(`/time-clock/attendance?${params.toString()}`);
}

// Time clock corrections
export async function requestTimeClockCorrection(
  entryId: string,
  correction: {
    correctedClockInTime?: string;
    correctedClockOutTime?: string;
    correctedBreakStart?: string;
    correctedBreakEnd?: string;
    reason: string;
  }
): Promise<{ id: string; status: 'pending' | 'approved' | 'rejected' }> {
  return apiRequest(`/time-clock/${entryId}/correction`, {
    method: 'POST',
    body: JSON.stringify(correction),
  });
}

export async function approveTimeClockCorrection(
  correctionId: string
): Promise<void> {
  await apiRequest(`/time-clock/corrections/${correctionId}/approve`, {
    method: 'POST',
  });
}

export async function rejectTimeClockCorrection(
  correctionId: string,
  reason: string
): Promise<void> {
  await apiRequest(`/time-clock/corrections/${correctionId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// Time Clock Engine
export class TimeClockEngine {
  /**
   * Calculate total hours between two timestamps
   */
  static calculateTotalHours(
    clockIn: string,
    clockOut: string,
    breakStart?: string,
    breakEnd?: string
  ): { totalHours: number; breakHours: number; workedHours: number } {
    const inTime = new Date(clockIn);
    const outTime = new Date(clockOut);
    
    const totalHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
    
    let breakHours = 0;
    if (breakStart && breakEnd) {
      const breakStartTime = new Date(breakStart);
      const breakEndTime = new Date(breakEnd);
      breakHours = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60);
    }
    
    const workedHours = totalHours - breakHours;
    
    return {
      totalHours,
      breakHours,
      workedHours,
    };
  }

  /**
   * Calculate overtime hours
   */
  static calculateOvertimeHours(
    workedHours: number,
    standardHours: number = 8
  ): number {
    return Math.max(0, workedHours - standardHours);
  }

  /**
   * Calculate total pay including overtime
   */
  static calculateTotalPay(
    workedHours: number,
    overtimeHours: number,
    hourlyRate: number,
    overtimeMultiplier: number = 1.5
  ): number {
    const regularPay = (workedHours - overtimeHours) * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
    return regularPay + overtimePay;
  }

  /**
   * Check if staff is currently on break
   */
  static isOnBreak(entry: TimeClockEntry): boolean {
    return !!(entry.breakStartTime && !entry.breakEndTime);
  }

  /**
   * Check if entry is currently active
   */
  static isActive(entry: TimeClockEntry): boolean {
    return !entry.clockOutTime;
  }

  /**
   * Calculate attendance rate
   */
  static calculateAttendanceRate(
    shiftsWorked: number,
    scheduledShifts: number
  ): number {
    if (scheduledShifts === 0) return 0;
    return (shiftsWorked / scheduledShifts) * 100;
  }

  /**
   * Check if arrival is on time
   */
  static isOnTime(
    clockInTime: string,
    scheduledStart: string,
    gracePeriodMinutes: number = 15
  ): boolean {
    const clockIn = new Date(clockInTime);
    const scheduled = new Date(scheduledStart);
    const gracePeriod = gracePeriodMinutes * 60 * 1000;
    
    return clockIn.getTime() <= scheduled.getTime() + gracePeriod;
  }

  /**
   * Calculate late arrival
   */
  static calculateLateMinutes(
    clockInTime: string,
    scheduledStart: string,
    gracePeriodMinutes: number = 15
  ): number {
    const clockIn = new Date(clockInTime);
    const scheduled = new Date(scheduledStart);
    const gracePeriod = gracePeriodMinutes * 60 * 1000;
    
    const diff = clockIn.getTime() - scheduled.getTime() - gracePeriod;
    return Math.max(0, Math.round(diff / (60 * 1000)));
  }

  /**
   * Generate time clock insights
   */
  static generateInsights(
    entries: TimeClockEntry[],
    schedules: Array<{ staffId: string; date: string; shiftStart: string; shiftEnd: string }>
  ): string[] {
    const insights: string[] = [];
    
    const totalEntries = entries.length;
    const overtimeEntries = entries.filter(e => e.isOvertime).length;
    const overtimeRate = (overtimeEntries / totalEntries) * 100;
    
    if (overtimeRate > 20) {
      insights.push(`High overtime rate (${overtimeRate.toFixed(1)}%) - review staffing levels`);
    }
    
    const averageHours = entries.reduce((sum, e) => sum + e.workedHours, 0) / totalEntries;
    if (averageHours > 9) {
      insights.push('Average shift length exceeds 9 hours - consider shift optimization');
    }
    
    let lateArrivals = 0;
    for (const entry of entries) {
      const schedule = schedules.find(s => s.staffId === entry.staffId && s.date === entry.clockInTime.split('T')[0]);
      if (schedule && !this.isOnTime(entry.clockInTime, schedule.shiftStart)) {
        lateArrivals++;
      }
    }
    
    const lateRate = (lateArrivals / totalEntries) * 100;
    if (lateRate > 10) {
      insights.push(`High late arrival rate (${lateRate.toFixed(1)}%) - address punctuality`);
    }
    
    return insights;
  }

  /**
   * Calculate time clock accuracy
   */
  static calculateAccuracy(
    scheduledHours: number,
    actualHours: number
  ): { variance: number; variancePercent: number; isAccurate: boolean } {
    const variance = actualHours - scheduledHours;
    const variancePercent = (variance / scheduledHours) * 100;
    const isAccurate = Math.abs(variancePercent) <= 10; // Within 10%
    
    return {
      variance,
      variancePercent,
      isAccurate,
    };
  }

  /**
   * Generate time clock summary
   */
  static generateSummary(report: TimeClockReport): {
    totalHours: string;
    totalWorkedHours: string;
    totalOvertimeHours: string;
    totalPay: string;
    averageHoursPerEntry: string;
    overtimeRate: string;
    insights: string[];
  } {
    const totalHours = report.totalHours.toFixed(1);
    const totalWorkedHours = report.totalWorkedHours.toFixed(1);
    const totalOvertimeHours = report.totalOvertimeHours.toFixed(1);
    const totalPay = `$${report.totalPay.toFixed(2)}`;
    const averageHoursPerEntry = (report.totalWorkedHours / report.totalEntries).toFixed(1);
    const overtimeRate = ((report.totalOvertimeHours / report.totalWorkedHours) * 100).toFixed(1) + '%';
    
    const insights: string[] = [];
    if (report.totalOvertimeHours > report.totalWorkedHours * 0.1) {
      insights.push('Overtime hours exceed 10% of worked hours');
    }
    if (report.totalBreakHours > report.totalHours * 0.15) {
      insights.push('Break time exceeds 15% of total time');
    }
    
    return {
      totalHours,
      totalWorkedHours,
      totalOvertimeHours,
      totalPay,
      averageHoursPerEntry,
      overtimeRate,
      insights,
    };
  }

  /**
   * Validate time clock entry
   */
  static validateEntry(entry: Partial<TimeClockEntry>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!entry.staffId) {
      errors.push('Staff ID is required');
    }
    if (!entry.outletId) {
      errors.push('Outlet ID is required');
    }
    if (!entry.clockInTime) {
      errors.push('Clock in time is required');
    }
    if (entry.hourlyRate === undefined || entry.hourlyRate <= 0) {
      errors.push('Valid hourly rate is required');
    }
    
    if (entry.clockInTime && entry.clockOutTime && new Date(entry.clockOutTime) <= new Date(entry.clockInTime)) {
      errors.push('Clock out time must be after clock in time');
    }
    
    if (entry.breakStartTime && entry.breakEndTime) {
      if (entry.clockInTime && new Date(entry.breakStartTime) < new Date(entry.clockInTime)) {
        errors.push('Break start time must be after clock in time');
      }
      if (entry.clockOutTime && new Date(entry.breakEndTime) > new Date(entry.clockOutTime)) {
        errors.push('Break end time must be before clock out time');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const timeClockEngine = TimeClockEngine;
