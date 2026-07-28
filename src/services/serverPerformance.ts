/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Server Performance Metrics Tracking
 * Performance tracking and analytics for service staff
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
export interface ServerPerformance {
  id: string;
  staffId: string;
  outletId: string;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalOrders: number;
  averageCheck: number;
  salesPerHour: number;
  upsellRate: number;
  voidRate: number;
  guestSatisfactionScore?: number;
  tipsTotal: number;
  tipPercent: number;
  tablesServed: number;
  guestsServed: number;
  returnsCount: number;
  complaintsCount: number;
  complimentsCount: number;
  ranking: number;
  totalHoursWorked: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceComparison {
  staffId: string;
  staffName: string;
  currentPeriod: {
    totalSales: number;
    totalOrders: number;
    averageCheck: number;
    salesPerHour: number;
    tipPercent: number;
  };
  previousPeriod: {
    totalSales: number;
    totalOrders: number;
    averageCheck: number;
    salesPerHour: number;
    tipPercent: number;
  };
  changePercent: {
    totalSales: number;
    totalOrders: number;
    averageCheck: number;
    salesPerHour: number;
    tipPercent: number;
  };
}

export interface PerformanceLeaderboard {
  period: { startDate: string; endDate: string };
  categories: {
    topSales: Array<{ staffId: string; staffName: string; value: number; rank: number }>;
    topOrders: Array<{ staffId: string; staffName: string; value: number; rank: number }>;
    topSalesPerHour: Array<{ staffId: string; staffName: string; value: number; rank: number }>;
    topTips: Array<{ staffId: string; staffName: string; value: number; rank: number }>;
    topSatisfaction: Array<{ staffId: string; staffName: string; value: number; rank: number }>;
  };
}

// Performance Metrics CRUD operations
export async function fetchServerPerformance(
  staffId?: string,
  outletId?: string,
  startDate?: string,
  endDate?: string
): Promise<ServerPerformance[]> {
  const params = new URLSearchParams();
  if (staffId) params.append('staffId', staffId);
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ServerPerformance[]>(`/server-performance${queryString}`);
}

export async function fetchServerPerformanceById(id: string): Promise<ServerPerformance> {
  return apiRequest<ServerPerformance>(`/server-performance/${id}`);
}

export async function calculateServerPerformance(
  staffId: string,
  periodStart: string,
  periodEnd: string
): Promise<ServerPerformance> {
  return apiRequest<ServerPerformance>('/server-performance/calculate', {
    method: 'POST',
    body: JSON.stringify({ staffId, periodStart, periodEnd }),
  });
}

export async function bulkCalculatePerformance(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<ServerPerformance[]> {
  return apiRequest<ServerPerformance[]>('/server-performance/bulk-calculate', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd }),
  });
}

// Performance comparison and analysis
export async function comparePerformance(
  staffId: string,
  currentPeriodStart: string,
  currentPeriodEnd: string,
  previousPeriodStart: string,
  previousPeriodEnd: string
): Promise<PerformanceComparison> {
  return apiRequest<PerformanceComparison>('/server-performance/compare', {
    method: 'POST',
    body: JSON.stringify({
      staffId,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    }),
  });
}

export async function getPerformanceLeaderboard(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<PerformanceLeaderboard> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('periodStart', periodStart);
  params.append('periodEnd', periodEnd);

  return apiRequest<PerformanceLeaderboard>(`/server-performance/leaderboard?${params.toString()}`);
}

// Performance trends
export async function getPerformanceTrends(
  staffId: string,
  periods: number = 12
): Promise<Array<{
  period: string;
  totalSales: number;
  totalOrders: number;
  averageCheck: number;
  salesPerHour: number;
  tipPercent: number;
  ranking: number;
}>> {
  return apiRequest(`/server-performance/trends/${staffId}?periods=${periods}`);
}

// Performance ranking
export async function updatePerformanceRankings(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<void> {
  await apiRequest('/server-performance/update-rankings', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd }),
  });
}

// Performance goals
export async function setPerformanceGoals(
  staffId: string,
  goals: {
    targetSales?: number;
    targetOrders?: number;
    targetAverageCheck?: number;
    targetSalesPerHour?: number;
    targetTipPercent?: number;
    targetSatisfactionScore?: number;
  }
): Promise<void> {
  await apiRequest(`/server-performance/goals/${staffId}`, {
    method: 'POST',
    body: JSON.stringify(goals),
  });
}

export async function getPerformanceGoals(
  staffId: string
): Promise<{
  targetSales?: number;
  targetOrders?: number;
  targetAverageCheck?: number;
  targetSalesPerHour?: number;
  targetTipPercent?: number;
  targetSatisfactionScore?: number;
}> {
  return apiRequest(`/server-performance/goals/${staffId}`);
}

export async function checkGoalProgress(
  staffId: string,
  periodStart: string,
  periodEnd: string
): Promise<{
  goals: Record<string, { target: number; actual: number; progress: number; achieved: boolean }>;
  overallProgress: number;
}> {
  return apiRequest(`/server-performance/goals/${staffId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ periodStart, periodEnd }),
  });
}

// Performance Engine
export class ServerPerformanceEngine {
  /**
   * Calculate average check
   */
  static calculateAverageCheck(totalSales: number, totalOrders: number): number {
    if (totalOrders === 0) return 0;
    return totalSales / totalOrders;
  }

  /**
   * Calculate sales per hour
   */
  static calculateSalesPerHour(totalSales: number, hoursWorked: number): number {
    if (hoursWorked === 0) return 0;
    return totalSales / hoursWorked;
  }

  /**
   * Calculate upsell rate
   */
  static calculateUpsellRate(
    totalOrders: number,
    ordersWithUpsell: number
  ): number {
    if (totalOrders === 0) return 0;
    return (ordersWithUpsell / totalOrders) * 100;
  }

  /**
   * Calculate void rate
   */
  static calculateVoidRate(
    totalOrders: number,
    voidedOrders: number
  ): number {
    if (totalOrders === 0) return 0;
    return (voidedOrders / totalOrders) * 100;
  }

  /**
   * Calculate tip percentage
   */
  static calculateTipPercent(totalTips: number, totalSales: number): number {
    if (totalSales === 0) return 0;
    return (totalTips / totalSales) * 100;
  }

  /**
   * Calculate performance score (0-100)
   */
  static calculatePerformanceScore(
    performance: ServerPerformance,
    weights?: {
      sales: number;
      orders: number;
      service: number;
      tips: number;
    }
  ): number {
    const defaultWeights = { sales: 0.3, orders: 0.2, service: 0.3, tips: 0.2 };
    const w = weights || defaultWeights;
    
    const normalizedSales = Math.min(100, performance.salesPerHour / 50 * 100);
    const normalizedOrders = Math.min(100, performance.averageCheck / 100 * 100);
    const normalizedService = performance.guestSatisfactionScore || 80;
    const normalizedTips = Math.min(100, performance.tipPercent);
    
    return (
      normalizedSales * w.sales +
      normalizedOrders * w.orders +
      normalizedService * w.service +
      normalizedTips * w.tips
    );
  }

  /**
   * Calculate performance ranking
   */
  static calculateRankings(performances: ServerPerformance[]): Map<string, number> {
    const rankings = new Map<string, number>();
    
    // Sort by sales per hour descending
    const sortedBySales = [...performances].sort((a, b) => b.salesPerHour - a.salesPerHour);
    sortedBySales.forEach((p, index) => {
      rankings.set(p.staffId, index + 1);
    });
    
    return rankings;
  }

  /**
   * Calculate performance change percentage
   */
  static calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Determine performance trend
   */
  static determineTrend(current: number, previous: number): 'increasing' | 'stable' | 'decreasing' {
    const change = this.calculateChangePercent(current, previous);
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate performance insights
   */
  static generateInsights(performance: ServerPerformance): string[] {
    const insights: string[] = [];
    
    if (performance.salesPerHour > 100) {
      insights.push('Excellent sales per hour - consistently high performance');
    } else if (performance.salesPerHour < 50) {
      insights.push('Sales per hour below target - consider upselling training');
    }
    
    if (performance.tipPercent > 20) {
      insights.push('Exceptional tip percentage indicates strong guest satisfaction');
    } else if (performance.tipPercent < 10) {
      insights.push('Tip percentage below average - review service quality');
    }
    
    if (performance.voidRate > 5) {
      insights.push('High void rate - may indicate order accuracy issues');
    }
    
    if (performance.complaintsCount > performance.totalOrders * 0.01) {
      insights.push('Complaint rate above 1% - investigate service issues');
    }
    
    if (performance.guestSatisfactionScore && performance.guestSatisfactionScore < 4) {
      insights.push('Guest satisfaction score below 4 - immediate attention needed');
    } else if (performance.guestSatisfactionScore && performance.guestSatisfactionScore >= 4.5) {
      insights.push('Excellent guest satisfaction - maintain current service standards');
    }
    
    return insights;
  }

  /**
   * Compare against team average
   */
  static compareWithTeamAverage(
    staffPerformance: ServerPerformance,
    teamPerformances: ServerPerformance[]
  ): {
    metric: string;
    staffValue: number;
    teamAverage: number;
    difference: number;
    differencePercent: number;
    isAboveAverage: boolean;
  }[] {
    const teamAverageSalesPerHour = teamPerformances.reduce((sum, p) => sum + p.salesPerHour, 0) / teamPerformances.length;
    const teamAverageCheck = teamPerformances.reduce((sum, p) => sum + p.averageCheck, 0) / teamPerformances.length;
    const teamAverageTips = teamPerformances.reduce((sum, p) => sum + p.tipPercent, 0) / teamPerformances.length;
    
    return [
      {
        metric: 'Sales Per Hour',
        staffValue: staffPerformance.salesPerHour,
        teamAverage: teamAverageSalesPerHour,
        difference: staffPerformance.salesPerHour - teamAverageSalesPerHour,
        differencePercent: this.calculateChangePercent(staffPerformance.salesPerHour, teamAverageSalesPerHour),
        isAboveAverage: staffPerformance.salesPerHour >= teamAverageSalesPerHour,
      },
      {
        metric: 'Average Check',
        staffValue: staffPerformance.averageCheck,
        teamAverage: teamAverageCheck,
        difference: staffPerformance.averageCheck - teamAverageCheck,
        differencePercent: this.calculateChangePercent(staffPerformance.averageCheck, teamAverageCheck),
        isAboveAverage: staffPerformance.averageCheck >= teamAverageCheck,
      },
      {
        metric: 'Tip Percentage',
        staffValue: staffPerformance.tipPercent,
        teamAverage: teamAverageTips,
        difference: staffPerformance.tipPercent - teamAverageTips,
        differencePercent: this.calculateChangePercent(staffPerformance.tipPercent, teamAverageTips),
        isAboveAverage: staffPerformance.tipPercent >= teamAverageTips,
      },
    ];
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(
    performance: ServerPerformance,
    goals?: Record<string, number>
  ): {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    goalProgress: Array<{ goal: string; target: number; actual: number; achieved: boolean }>;
    overallScore: number;
  } {
    const overallScore = this.calculatePerformanceScore(performance);
    const insights = this.generateInsights(performance);
    
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    
    if (performance.salesPerHour > 75) strengths.push('Strong sales performance');
    if (performance.tipPercent > 15) strengths.push('Excellent guest satisfaction');
    if (performance.voidRate < 2) strengths.push('Low void rate - good order accuracy');
    
    if (performance.salesPerHour < 50) areasForImprovement.push('Improve sales per hour');
    if (performance.tipPercent < 10) areasForImprovement.push('Increase tip percentage');
    if (performance.voidRate > 3) areasForImprovement.push('Reduce void rate');
    
    const goalProgress: Array<{ goal: string; target: number; actual: number; achieved: boolean }> = [];
    if (goals) {
      if (goals.targetSales) {
        goalProgress.push({
          goal: 'Sales',
          target: goals.targetSales,
          actual: performance.totalSales,
          achieved: performance.totalSales >= goals.targetSales,
        });
      }
      if (goals.targetOrders) {
        goalProgress.push({
          goal: 'Orders',
          target: goals.targetOrders,
          actual: performance.totalOrders,
          achieved: performance.totalOrders >= goals.targetOrders,
        });
      }
      if (goals.targetSalesPerHour) {
        goalProgress.push({
          goal: 'Sales Per Hour',
          target: goals.targetSalesPerHour,
          actual: performance.salesPerHour,
          achieved: performance.salesPerHour >= goals.targetSalesPerHour,
        });
      }
    }
    
    let summary = `Performance score: ${overallScore.toFixed(1)}/100. `;
    if (overallScore >= 80) {
      summary += 'Excellent performance exceeding expectations.';
    } else if (overallScore >= 60) {
      summary += 'Good performance meeting most targets.';
    } else if (overallScore >= 40) {
      summary += 'Average performance with room for improvement.';
    } else {
      summary += 'Performance below expectations - intervention recommended.';
    }
    
    return {
      summary,
      strengths,
      areasForImprovement,
      goalProgress,
      overallScore,
    };
  }
}

// Export singleton instance
export const serverPerformanceEngine = ServerPerformanceEngine;
