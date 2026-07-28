/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Labor Cost Analysis Service
 * Labor cost percentage analysis and optimization
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
export interface LaborCostAnalysis {
  id: string;
  outletId: string;
  periodStart: string;
  periodEnd: string;
  totalLaborCost: number;
  totalRevenue: number;
  laborCostPercent: number;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  staffCount: number;
  averageHourlyRate: number;
  salesPerLaborHour: number;
  targetLaborPercent: number;
  variancePercent: number;
  createdAt: string;
}

export interface LaborCostBreakdown {
  outletId: string;
  period: { startDate: string; endDate: string };
  byRole: Array<{
    role: string;
    laborCost: number;
    hours: number;
    staffCount: number;
    percentOfTotal: number;
  }>;
  byDepartment: Array<{
    department: string;
    laborCost: number;
    hours: number;
    percentOfTotal: number;
  }>;
  byPayType: Array<{
    payType: string;
    laborCost: number;
    hours: number;
    percentOfTotal: number;
  }>;
}

export interface LaborCostTrend {
  period: string;
  laborCostPercent: number;
  totalLaborCost: number;
  totalRevenue: number;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  staffCount: number;
  variancePercent: number;
}

export interface LaborCostOptimization {
  currentLaborCost: number;
  currentLaborPercent: number;
  targetLaborPercent: number;
  potentialSavings: number;
  recommendedActions: Array<{
    action: string;
    estimatedSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Labor Cost Analysis CRUD operations
export async function fetchLaborCostAnalysis(
  outletId?: string,
  startDate?: string,
  endDate?: string
): Promise<LaborCostAnalysis[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<LaborCostAnalysis[]>(`/labor-cost-analysis${queryString}`);
}

export async function fetchLaborCostAnalysisById(id: string): Promise<LaborCostAnalysis> {
  return apiRequest<LaborCostAnalysis>(`/labor-cost-analysis/${id}`);
}

export async function calculateLaborCostAnalysis(
  outletId: string,
  periodStart: string,
  periodEnd: string,
  targetLaborPercent: number = 30
): Promise<LaborCostAnalysis> {
  return apiRequest<LaborCostAnalysis>('/labor-cost-analysis/calculate', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd, targetLaborPercent }),
  });
}

export async function updateLaborCostAnalysis(
  id: string,
  analysis: Partial<LaborCostAnalysis>
): Promise<LaborCostAnalysis> {
  return apiRequest<LaborCostAnalysis>(`/labor-cost-analysis/${id}`, {
    method: 'PUT',
    body: JSON.stringify(analysis),
  });
}

// Labor cost breakdown
export async function getLaborCostBreakdown(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<LaborCostBreakdown> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<LaborCostBreakdown>(`/labor-cost-analysis/breakdown?${params.toString()}`);
}

// Labor cost trends
export async function getLaborCostTrends(
  outletId: string,
  periods: number = 12
): Promise<LaborCostTrend[]> {
  return apiRequest<LaborCostTrend[]>(`/labor-cost-analysis/trends/${outletId}?periods=${periods}`);
}

// Labor cost optimization
export async function optimizeLaborCost(
  outletId: string,
  periodStart: string,
  periodEnd: string,
  targetLaborPercent: number
): Promise<LaborCostOptimization> {
  return apiRequest<LaborCostOptimization>('/labor-cost-analysis/optimize', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd, targetLaborPercent }),
  });
}

// Labor cost forecasting
export async function forecastLaborCost(
  outletId: string,
  forecastStartDate: string,
  forecastEndDate: string,
  expectedRevenue: number
): Promise<{
  forecastedLaborCost: number;
  forecastedLaborPercent: number;
  recommendedStaffing: number;
  confidence: number;
}> {
  return apiRequest('/labor-cost-analysis/forecast', {
    method: 'POST',
    body: JSON.stringify({ outletId, forecastStartDate, forecastEndDate, expectedRevenue }),
  });
}

// Labor cost comparison
export async function compareLaborCosts(
  outletIds: string[],
  periodStart: string,
  periodEnd: string
): Promise<Array<{
  outletId: string;
  outletName: string;
  laborCostPercent: number;
  totalLaborCost: number;
  salesPerLaborHour: number;
  ranking: number;
}>> {
  return apiRequest('/labor-cost-analysis/compare', {
    method: 'POST',
    body: JSON.stringify({ outletIds, periodStart, periodEnd }),
  });
}

// Labor Cost Engine
export class LaborCostAnalysisEngine {
  /**
   * Calculate labor cost percentage
   */
  static calculateLaborCostPercent(laborCost: number, revenue: number): number {
    if (revenue === 0) return 0;
    return (laborCost / revenue) * 100;
  }

  /**
   * Calculate sales per labor hour
   */
  static calculateSalesPerLaborHour(revenue: number, laborHours: number): number {
    if (laborHours === 0) return 0;
    return revenue / laborHours;
  }

  /**
   * Calculate variance from target
   */
  static calculateVariance(actual: number, target: number): number {
    if (target === 0) return 0;
    return ((actual - target) / target) * 100;
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
   * Calculate optimal staffing level
   */
  static calculateOptimalStaffing(
    expectedRevenue: number,
    targetLaborPercent: number,
    averageHourlyRate: number,
    shiftHours: number = 8
  ): { staffCount: number; projectedLaborCost: number } {
    const targetLaborCost = expectedRevenue * (targetLaborPercent / 100);
    const totalHoursNeeded = targetLaborCost / averageHourlyRate;
    const staffCount = Math.ceil(totalHoursNeeded / shiftHours);
    const projectedLaborCost = staffCount * shiftHours * averageHourlyRate;

    return { staffCount, projectedLaborCost };
  }

  /**
   * Analyze labor cost trends
   */
  static analyzeTrends(trends: LaborCostTrend[]): {
    trend: 'increasing' | 'decreasing' | 'stable';
    averagePercent: number;
    variance: number;
    recommendations: string[];
  } {
    if (trends.length === 0) {
      return { trend: 'stable', averagePercent: 0, variance: 0, recommendations: [] };
    }

    const laborCostPercents = trends.map(t => t.laborCostPercent);
    const averagePercent = laborCostPercents.reduce((sum, p) => sum + p, 0) / laborCostPercents.length;
    
    const variance = Math.sqrt(
      laborCostPercents.reduce((sum, p) => sum + Math.pow(p - averagePercent, 2), 0) / laborCostPercents.length
    );

    const recent = laborCostPercents.slice(-3);
    const earlier = laborCostPercents.slice(0, -3);
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, p) => sum + p, 0) / earlier.length : recentAvg;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (recentAvg > earlierAvg * 1.05) {
      trend = 'increasing';
    } else if (recentAvg < earlierAvg * 0.95) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    const recommendations: string[] = [];
    if (trend === 'increasing' && averagePercent > 35) {
      recommendations.push('Labor costs trending upward - consider staffing optimization');
    } else if (trend === 'decreasing' && averagePercent < 20) {
      recommendations.push('Labor costs decreasing - monitor service quality impact');
    }

    if (variance > 5) {
      recommendations.push('High variance in labor costs - investigate scheduling consistency');
    }

    return { trend, averagePercent, variance, recommendations };
  }

  /**
   * Generate optimization recommendations
   */
  static generateOptimizationRecommendations(
    analysis: LaborCostAnalysis
  ): Array<{
    action: string;
    estimatedSavings: number;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: Array<{
      action: string;
      estimatedSavings: number;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    const variancePercent = this.calculateVariance(analysis.laborCostPercent, analysis.targetLaborPercent);

    if (variancePercent > 10) {
      // High variance from target
      const excessLaborCost = analysis.totalLaborCost - (analysis.totalRevenue * (analysis.targetLaborPercent / 100));
      recommendations.push({
        action: 'Reduce staffing levels to meet target labor percent',
        estimatedSavings: Math.max(0, excessLaborCost * 0.5),
        priority: 'high',
      });
    }

    if (analysis.overtimeHours > analysis.actualHours * 0.1) {
      // High overtime
      const overtimeCost = this.calculateOvertimeCost(analysis.overtimeHours, analysis.averageHourlyRate);
      recommendations.push({
        action: 'Reduce overtime through better scheduling',
        estimatedSavings: overtimeCost * 0.3,
        priority: 'high',
      });
    }

    if (analysis.salesPerLaborHour < 50) {
      // Low sales per labor hour
      recommendations.push({
        action: 'Improve staff productivity and sales training',
        estimatedSavings: analysis.totalLaborCost * 0.1,
        priority: 'medium',
      });
    }

    if (analysis.scheduledHours > analysis.actualHours * 1.1) {
      // Over-scheduling
      const wastedHours = analysis.scheduledHours - analysis.actualHours;
      const wastedCost = wastedHours * analysis.averageHourlyRate;
      recommendations.push({
        action: 'Reduce scheduled hours to match actual demand',
        estimatedSavings: wastedCost * 0.7,
        priority: 'medium',
      });
    }

    return recommendations.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }

  /**
   * Calculate labor efficiency score
   */
  static calculateEfficiencyScore(
    laborCostPercent: number,
    targetLaborPercent: number,
    salesPerLaborHour: number,
    targetSalesPerLaborHour: number = 75
  ): number {
    const laborScore = Math.max(0, 100 - Math.abs(laborCostPercent - targetLaborPercent) * 2);
    const productivityScore = Math.min(100, (salesPerLaborHour / targetSalesPerLaborHour) * 100);
    
    return (laborScore * 0.6 + productivityScore * 0.4);
  }

  /**
   * Generate labor cost summary
   */
  static generateSummary(
    analysis: LaborCostAnalysis
  ): {
    laborCostPercent: string;
    variancePercent: string;
    efficiencyScore: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    insights: string[];
  } {
    const laborCostPercent = `${analysis.laborCostPercent.toFixed(1)}%`;
    const variancePercent = `${analysis.variancePercent > 0 ? '+' : ''}${analysis.variancePercent.toFixed(1)}%`;
    const efficiencyScore = this.calculateEfficiencyScore(
      analysis.laborCostPercent,
      analysis.targetLaborPercent,
      analysis.salesPerLaborHour
    );

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (efficiencyScore >= 85) {
      status = 'excellent';
    } else if (efficiencyScore >= 70) {
      status = 'good';
    } else if (efficiencyScore >= 55) {
      status = 'fair';
    } else {
      status = 'poor';
    }

    const insights: string[] = [];
    if (analysis.variancePercent > 5) {
      insights.push(`Labor cost ${Math.abs(analysis.variancePercent).toFixed(1)}% ${analysis.variancePercent > 0 ? 'above' : 'below'} target`);
    }
    if (analysis.overtimeHours > 0) {
      insights.push(`${analysis.overtimeHours.toFixed(1)} overtime hours recorded`);
    }
    if (analysis.salesPerLaborHour > 80) {
      insights.push('Excellent sales per labor hour');
    } else if (analysis.salesPerLaborHour < 50) {
      insights.push('Low sales per labor hour - needs improvement');
    }

    return {
      laborCostPercent,
      variancePercent,
      efficiencyScore,
      status,
      insights,
    };
  }

  /**
   * Compare against benchmarks
   */
  static compareWithBenchmark(
    analysis: LaborCostAnalysis,
    benchmark: {
      industryAverageLaborPercent: number;
      topQuartileLaborPercent: number;
      industryAverageSalesPerLaborHour: number;
    }
  ): {
    vsIndustryAverage: string;
    vsTopQuartile: string;
    percentile: number;
  } {
    const vsIndustryAverage = analysis.laborCostPercent < benchmark.industryAverageLaborPercent
      ? `${(benchmark.industryAverageLaborPercent - analysis.laborCostPercent).toFixed(1)}% better than industry`
      : `${(analysis.laborCostPercent - benchmark.industryAverageLaborPercent).toFixed(1)}% worse than industry`;

    const vsTopQuartile = analysis.laborCostPercent < benchmark.topQuartileLaborPercent
      ? 'Better than top quartile'
      : 'Below top quartile performance';

    const percentile = Math.max(0, Math.min(100,
      100 - ((analysis.laborCostPercent - benchmark.topQuartileLaborPercent) / 
      (benchmark.industryAverageLaborPercent - benchmark.topQuartileLaborPercent)) * 100
    ));

    return {
      vsIndustryAverage,
      vsTopQuartile,
      percentile,
    };
  }
}

// Export singleton instance
export const laborCostAnalysisEngine = LaborCostAnalysisEngine;
