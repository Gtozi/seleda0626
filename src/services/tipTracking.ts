/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Tip Tracking and Reporting Service
 * Tip distribution, tracking, and reporting for staff
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
export interface TipRecord {
  id: string;
  staffId: string;
  outletId: string;
  orderId?: string;
  tipAmount: number;
  tipPercent: number;
  paymentMethod: string;
  tipDate: string;
  isShared: boolean;
  sharedWith: string[];
  distributionMethod: 'individual' | 'pool' | 'tip_share';
  status: 'pending' | 'distributed' | 'paid';
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface TipDistribution {
  staffId: string;
  staffName: string;
  totalTips: number;
  tipCount: number;
  averageTip: number;
  tipPercent: number;
  totalSales: number;
  sharedTipsReceived: number;
  sharedTipsGiven: number;
  netTips: number;
}

export interface TipReport {
  period: { startDate: string; endDate: string };
  totalTips: number;
  totalOrders: number;
  averageTipPerOrder: number;
  overallTipPercent: number;
  byStaff: TipDistribution[];
  byPaymentMethod: Array<{ method: string; amount: number; count: number; percent: number }>;
  byDistributionMethod: Array<{ method: string; amount: number; count: number; percent: number }>;
}

export interface TipPool {
  id: string;
  outletId: string;
  poolName: string;
  startDate: string;
  endDate: string;
  totalTips: number;
  participatingStaff: string[];
  distributionRules: {
    equalShare: boolean;
    weights?: Record<string, number>;
  };
  status: 'open' | 'closed' | 'distributed';
  createdAt: string;
  closedAt?: string;
}

// Tip Tracking CRUD operations
export async function fetchTipRecords(
  staffId?: string,
  outletId?: string,
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<TipRecord[]> {
  const params = new URLSearchParams();
  if (staffId) params.append('staffId', staffId);
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<TipRecord[]>(`/tips${queryString}`);
}

export async function fetchTipRecordById(id: string): Promise<TipRecord> {
  return apiRequest<TipRecord>(`/tips/${id}`);
}

export async function createTipRecord(tip: Partial<TipRecord>): Promise<TipRecord> {
  return apiRequest<TipRecord>('/tips', {
    method: 'POST',
    body: JSON.stringify(tip),
  });
}

export async function updateTipRecord(id: string, tip: Partial<TipRecord>): Promise<TipRecord> {
  return apiRequest<TipRecord>(`/tips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tip),
  });
}

export async function deleteTipRecord(id: string): Promise<void> {
  await apiRequest<void>(`/tips/${id}`, {
    method: 'DELETE',
  });
}

// Tip distribution operations
export async function distributeTips(
  tipIds: string[],
  distributionMethod: 'individual' | 'pool' | 'tip_share',
  sharedWith?: string[]
): Promise<void> {
  await apiRequest('/tips/distribute', {
    method: 'POST',
    body: JSON.stringify({ tipIds, distributionMethod, sharedWith }),
  });
}

export async function markTipsAsPaid(tipIds: string[]): Promise<void> {
  await apiRequest('/tips/mark-paid', {
    method: 'POST',
    body: JSON.stringify({ tipIds }),
  });
}

// Tip reporting
export async function generateTipReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<TipReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<TipReport>(`/tips/report?${params.toString()}`);
}

export async function getTipDistribution(
  staffId: string,
  startDate: string,
  endDate: string
): Promise<TipDistribution> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<TipDistribution>(`/tips/distribution/${staffId}?${params.toString()}`);
}

// Tip pool management
export async function createTipPool(
  pool: Partial<TipPool>
): Promise<TipPool> {
  return apiRequest<TipPool>('/tips/pools', {
    method: 'POST',
    body: JSON.stringify(pool),
  });
}

export async function fetchTipPools(
  outletId?: string,
  status?: string
): Promise<TipPool[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<TipPool[]>(`/tips/pools${queryString}`);
}

export async function closeTipPool(poolId: string): Promise<TipPool> {
  return apiRequest<TipPool>(`/tips/pools/${poolId}/close`, {
    method: 'POST',
  });
}

export async function distributeTipPool(poolId: string): Promise<void> {
  await apiRequest(`/tips/pools/${poolId}/distribute`, {
    method: 'POST',
  });
}

// Tip analytics
export async function getTipTrends(
  staffId: string,
  periods: number = 12
): Promise<Array<{
  period: string;
  totalTips: number;
  tipPercent: number;
  averageTip: number;
  tipCount: number;
}>> {
  return apiRequest(`/tips/trends/${staffId}?periods=${periods}`);
}

export async function getTipComparison(
  staffIds: string[],
  startDate: string,
  endDate: string
): Promise<Array<{
  staffId: string;
  staffName: string;
  totalTips: number;
  tipPercent: number;
  averageTip: number;
  ranking: number;
}>> {
  return apiRequest('/tips/compare', {
    method: 'POST',
    body: JSON.stringify({ staffIds, startDate, endDate }),
  });
}

// Tip Engine
export class TipTrackingEngine {
  /**
   * Calculate tip percentage
   */
  static calculateTipPercent(tipAmount: number, totalAmount: number): number {
    if (totalAmount === 0) return 0;
    return (tipAmount / totalAmount) * 100;
  }

  /**
   * Calculate average tip
   */
  static calculateAverageTip(totalTips: number, tipCount: number): number {
    if (tipCount === 0) return 0;
    return totalTips / tipCount;
  }

  /**
   * Calculate tip distribution for pool
   */
  static calculatePoolDistribution(
    totalTips: number,
    participants: string[],
    weights?: Record<string, number>
  ): Map<string, number> {
    const distribution = new Map<string, number>();
    
    if (!weights || Object.keys(weights).length === 0) {
      // Equal distribution
      const share = totalTips / participants.length;
      participants.forEach(staffId => {
        distribution.set(staffId, share);
      });
    } else {
      // Weighted distribution
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      participants.forEach(staffId => {
        const weight = weights[staffId] || 1;
        const share = (weight / totalWeight) * totalTips;
        distribution.set(staffId, share);
      });
    }
    
    return distribution;
  }

  /**
   * Calculate tip share distribution
   */
  static calculateTipShare(
    originalTip: number,
    sharers: string[],
    shares?: Record<string, number>
  ): Map<string, number> {
    const distribution = new Map<string, number>();
    
    if (!shares || Object.keys(shares).length === 0) {
      // Equal share
      const share = originalTip / sharers.length;
      sharers.forEach(staffId => {
        distribution.set(staffId, share);
      });
    } else {
      // Custom share amounts
      const totalShareAmount = Object.values(shares).reduce((sum, s) => sum + s, 0);
      sharers.forEach(staffId => {
        const share = shares[staffId] || 0;
        distribution.set(staffId, share);
      });
    }
    
    return distribution;
  }

  /**
   * Calculate net tips (received - given)
   */
  static calculateNetTips(
    tipsReceived: number,
    tipsSharedGiven: number
  ): number {
    return tipsReceived - tipsSharedGiven;
  }

  /**
   * Generate tip insights
   */
  static generateTipInsights(
    distribution: TipDistribution,
    teamAverage: TipDistribution
  ): string[] {
    const insights: string[] = [];
    
    if (distribution.tipPercent > teamAverage.tipPercent * 1.2) {
      insights.push('Tip percentage significantly above team average - excellent service');
    } else if (distribution.tipPercent < teamAverage.tipPercent * 0.8) {
      insights.push('Tip percentage below team average - review service quality');
    }
    
    if (distribution.averageTip > teamAverage.averageTip * 1.2) {
      insights.push('Average tip per order above team average');
    } else if (distribution.averageTip < teamAverage.averageTip * 0.8) {
      insights.push('Average tip per order below team average');
    }
    
    if (distribution.sharedTipsGiven > distribution.totalTips * 0.3) {
      insights.push('High tip sharing activity - good team collaboration');
    }
    
    return insights;
  }

  /**
   * Calculate tip variance
   */
  static calculateTipVariance(tips: number[]): number {
    if (tips.length === 0) return 0;
    
    const mean = tips.reduce((sum, tip) => sum + tip, 0) / tips.length;
    const variance = tips.reduce((sum, tip) => sum + Math.pow(tip - mean, 2), 0) / tips.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Detect tip anomalies
   */
  static detectTipAnomalies(
    tips: TipRecord[],
    threshold: number = 3
  ): TipRecord[] {
    const tipAmounts = tips.map(t => t.tipAmount);
    const mean = tipAmounts.reduce((sum, t) => sum + t, 0) / tipAmounts.length;
    const stdDev = this.calculateTipVariance(tipAmounts);
    
    return tips.filter(tip => {
      const zScore = Math.abs((tip.tipAmount - mean) / stdDev);
      return zScore > threshold;
    });
  }

  /**
   * Generate tip summary
   */
  static generateTipSummary(
    report: TipReport
  ): {
    totalTips: string;
    averageTipPerOrder: string;
    overallTipPercent: string;
    topEarner: string;
    insights: string[];
  } {
    const totalTips = `$${report.totalTips.toFixed(2)}`;
    const averageTipPerOrder = `$${report.averageTipPerOrder.toFixed(2)}`;
    const overallTipPercent = `${report.overallTipPercent.toFixed(1)}%`;
    
    const topEarner = report.byStaff.reduce((best, current) => 
      current.totalTips > best.totalTips ? current : best
    );
    
    const insights: string[] = [];
    if (report.overallTipPercent > 18) {
      insights.push('Overall tip percentage above industry average (15-18%)');
    } else if (report.overallTipPercent < 12) {
      insights.push('Overall tip percentage below industry average - review service quality');
    }
    
    if (report.byStaff.length > 0) {
      const variance = this.calculateTipVariance(report.byStaff.map(s => s.totalTips));
      if (variance > 100) {
        insights.push('High variance in tip earnings among staff - investigate performance differences');
      }
    }
    
    return {
      totalTips,
      averageTipPerOrder,
      overallTipPercent,
      topEarner: topEarner.staffName,
      insights,
    };
  }

  /**
   * Calculate tip compliance
   */
  static calculateTipCompliance(
    actualTips: TipRecord[],
    expectedTips: number
  ): {
    complianceRate: number;
    missingTips: number;
    overreportedTips: number;
    accuracy: number;
  } {
    const totalReportedTips = actualTips.reduce((sum, t) => sum + t.tipAmount, 0);
    const complianceRate = (totalReportedTips / expectedTips) * 100;
    
    const missingTips = Math.max(0, expectedTips - totalReportedTips);
    const overreportedTips = Math.max(0, totalReportedTips - expectedTips);
    
    const accuracy = Math.max(0, 100 - Math.abs(complianceRate - 100));
    
    return {
      complianceRate,
      missingTips,
      overreportedTips,
      accuracy,
    };
  }
}

// Export singleton instance
export const tipTrackingEngine = TipTrackingEngine;
