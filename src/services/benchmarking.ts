/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Benchmarking and Comparison Service
 * Industry benchmarking and outlet performance comparison
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
export interface BenchmarkingData {
  id: string;
  metricName: string;
  metricCategory: string;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  region?: string;
  establishmentType?: string;
  year: number;
  quarter?: number;
  dataSource: string;
  createdAt: string;
}

export interface OutletBenchmark {
  id: string;
  outletId: string;
  benchmarkDate: string;
  metricName: string;
  actualValue: number;
  benchmarkValue: number;
  variance: number;
  variancePercent: number;
  percentile: number;
  trend: 'above_average' | 'average' | 'below_average';
  createdAt: string;
}

export interface ProfitAndLossBenchmark {
  outletId: string;
  period: { startDate: string; endDate: string };
  revenue: number;
  cogs: number;
  laborCost: number;
  overheadCost: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  benchmarks: {
    revenue: number;
    cogs: number;
    laborCost: number;
    profitMargin: number;
  };
  variances: {
    revenue: number;
    cogs: number;
    laborCost: number;
    profitMargin: number;
  };
}

export interface OutletComparison {
  outletId: string;
  outletName: string;
  metrics: Array<{
    metricName: string;
    actualValue: number;
    industryAverage: number;
    topQuartile: number;
    percentile: number;
    trend: string;
  }>;
  overallScore: number;
  ranking: number;
}

// Benchmarking Data CRUD operations
export async function fetchBenchmarkingData(
  metricName?: string,
  metricCategory?: string,
  year?: number
): Promise<BenchmarkingData[]> {
  const params = new URLSearchParams();
  if (metricName) params.append('metricName', metricName);
  if (metricCategory) params.append('metricCategory', metricCategory);
  if (year) params.append('year', year.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<BenchmarkingData[]>(`/benchmarking-data${queryString}`);
}

export async function fetchBenchmarkingDataById(id: string): Promise<BenchmarkingData> {
  return apiRequest<BenchmarkingData>(`/benchmarking-data/${id}`);
}

export async function createBenchmarkingData(data: Partial<BenchmarkingData>): Promise<BenchmarkingData> {
  return apiRequest<BenchmarkingData>('/benchmarking-data', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBenchmarkingData(id: string, data: Partial<BenchmarkingData>): Promise<BenchmarkingData> {
  return apiRequest<BenchmarkingData>(`/benchmarking-data/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBenchmarkingData(id: string): Promise<void> {
  await apiRequest<void>(`/benchmarking-data/${id}`, {
    method: 'DELETE',
  });
}

// Outlet Benchmark CRUD operations
export async function fetchOutletBenchmarks(
  outletId?: string,
  benchmarkDate?: string,
  metricName?: string
): Promise<OutletBenchmark[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (benchmarkDate) params.append('benchmarkDate', benchmarkDate);
  if (metricName) params.append('metricName', metricName);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<OutletBenchmark[]>(`/outlet-benchmarks${queryString}`);
}

export async function fetchOutletBenchmarkById(id: string): Promise<OutletBenchmark> {
  return apiRequest<OutletBenchmark>(`/outlet-benchmarks/${id}`);
}

export async function calculateOutletBenchmark(
  outletId: string,
  benchmarkDate: string,
  metricName: string
): Promise<OutletBenchmark> {
  return apiRequest<OutletBenchmark>('/outlet-benchmarks/calculate', {
    method: 'POST',
    body: JSON.stringify({ outletId, benchmarkDate, metricName }),
  });
}

export async function deleteOutletBenchmark(id: string): Promise<void> {
  await apiRequest<void>(`/outlet-benchmarks/${id}`, {
    method: 'DELETE',
  });
}

// Benchmarking operations
export async function calculateOutletComparison(
  outletId: string,
  benchmarkDate: string
): Promise<OutletComparison> {
  return apiRequest<OutletComparison>('/benchmarking/compare', {
    method: 'POST',
    body: JSON.stringify({ outletId, benchmarkDate }),
  });
}

export async function calculateProfitAndLossBenchmark(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<ProfitAndLossBenchmark> {
  return apiRequest<ProfitAndLossBenchmark>('/benchmarking/profit-loss', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd }),
  });
}

export async function compareOutlets(
  outletIds: string[],
  benchmarkDate: string
): Promise<OutletComparison[]> {
  return apiRequest<OutletComparison[]>('/benchmarking/compare-outlets', {
    method: 'POST',
    body: JSON.stringify({ outletIds, benchmarkDate }),
  });
}

export async function getBenchmarkTrends(
  metricName: string,
  periods: number = 12
): Promise<Array<{
  period: string;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
}>> {
  return apiRequest(`/benchmarking/trends/${metricName}?periods=${periods}`);
}

// Benchmarking Engine
export class BenchmarkingEngine {
  /**
   * Calculate variance
   */
  static calculateVariance(actual: number, benchmark: number): number {
    return actual - benchmark;
  }

  /**
   * Calculate variance percentage
   */
  static calculateVariancePercent(actual: number, benchmark: number): number {
    if (benchmark === 0) return 0;
    return ((actual - benchmark) / benchmark) * 100;
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(
    value: number,
    bottomQuartile: number,
    topQuartile: number
  ): number {
    if (value <= bottomQuartile) return 25;
    if (value >= topQuartile) return 75;
    
    const range = topQuartile - bottomQuartile;
    const position = (value - bottomQuartile) / range;
    return 25 + (position * 50);
  }

  /**
   * Determine trend
   */
  static determineTrend(variancePercent: number): 'above_average' | 'average' | 'below_average' {
    if (variancePercent > 10) return 'above_average';
    if (variancePercent < -10) return 'below_average';
    return 'average';
  }

  /**
   * Calculate overall score
   */
  static calculateOverallScore(
    benchmarks: OutletBenchmark[]
  ): number {
    if (benchmarks.length === 0) return 50;
    
    const averagePercentile = benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length;
    return averagePercentile;
  }

  /**
   * Identify strengths
   */
  static identifyStrengths(
    benchmarks: OutletBenchmark[],
    threshold: number = 75
  ): OutletBenchmark[] {
    return benchmarks.filter(b => b.percentile >= threshold);
  }

  /**
   * Identify weaknesses
   */
  static identifyWeaknesses(
    benchmarks: OutletBenchmark[],
    threshold: number = 25
  ): OutletBenchmark[] {
    return benchmarks.filter(b => b.percentile <= threshold);
  }

  /**
   * Generate improvement recommendations
   */
  static generateRecommendations(
    benchmarks: OutletBenchmark[]
  ): Array<{
    metricName: string;
    currentPercentile: number;
    targetPercentile: number;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: Array<{
      metricName: string;
      currentPercentile: number;
      targetPercentile: number;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    for (const benchmark of benchmarks) {
      if (benchmark.percentile < 25) {
        recommendations.push({
          metricName: benchmark.metricName,
          currentPercentile: benchmark.percentile,
          targetPercentile: 50,
          recommendation: `Significant improvement needed in ${benchmark.metricName}`,
          priority: 'high',
        });
      } else if (benchmark.percentile < 50) {
        recommendations.push({
          metricName: benchmark.metricName,
          currentPercentile: benchmark.percentile,
          targetPercentile: 60,
          recommendation: `Moderate improvement opportunity in ${benchmark.metricName}`,
          priority: 'medium',
        });
      } else if (benchmark.percentile < 75) {
        recommendations.push({
          metricName: benchmark.metricName,
          currentPercentile: benchmark.percentile,
          targetPercentile: 80,
          recommendation: `Minor optimization possible in ${benchmark.metricName}`,
          priority: 'low',
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calculate competitive position
   */
  static calculateCompetitivePosition(
    comparisons: OutletComparison[]
  ): {
    leader: string;
    follower: string;
    averageScore: number;
    marketPosition: 'leader' | 'competitive' | 'challenger';
  } {
    if (comparisons.length === 0) {
      return {
        leader: 'N/A',
        follower: 'N/A',
        averageScore: 50,
        marketPosition: 'competitive',
      };
    }

    const sorted = [...comparisons].sort((a, b) => b.overallScore - a.overallScore);
    const leader = sorted[0];
    const follower = sorted[sorted.length - 1];
    
    const averageScore = comparisons.reduce((sum, c) => sum + c.overallScore, 0) / comparisons.length;
    
    let marketPosition: 'leader' | 'competitive' | 'challenger';
    if (averageScore >= 75) {
      marketPosition = 'leader';
    } else if (averageScore >= 50) {
      marketPosition = 'competitive';
    } else {
      marketPosition = 'challenger';
    }

    return {
      leader: leader.outletName,
      follower: follower.outletName,
      averageScore,
      marketPosition,
    };
  }

  /**
   * Generate benchmarking summary
   */
  static generateBenchmarkingSummary(
    comparison: OutletComparison
  ): {
    overallScore: number;
    ranking: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    marketPosition: string;
  } {
    const strengths = this.identifyStrengths(
      comparison.metrics.map(m => ({
        metricName: m.metricName,
        percentile: m.percentile,
      } as OutletBenchmark))
    ).map(s => s.metricName);

    const weaknesses = this.identifyWeaknesses(
      comparison.metrics.map(m => ({
        metricName: m.metricName,
        percentile: m.percentile,
      } as OutletBenchmark))
    ).map(w => w.metricName);

    const recommendations = this.generateRecommendations(
      comparison.metrics.map(m => ({
        metricName: m.metricName,
        percentile: m.percentile,
      } as OutletBenchmark))
    ).map(r => r.recommendation);

    let marketPosition: string;
    if (comparison.overallScore >= 75) {
      marketPosition = 'Market Leader';
    } else if (comparison.overallScore >= 50) {
      marketPosition = 'Competitive';
    } else {
      marketPosition = 'Needs Improvement';
    }

    return {
      overallScore: comparison.overallScore,
      ranking: `${comparison.ranking} of ${comparison.ranking}`, // This would need total count
      strengths,
      weaknesses,
      recommendations,
      marketPosition,
    };
  }

  /**
   * Calculate gap to target
   */
  static calculateGapToTarget(
    actual: number,
    target: number
  ): {
    gap: number;
    gapPercent: number;
    requiredImprovement: number;
  } {
    const gap = target - actual;
    const gapPercent = target !== 0 ? (gap / target) * 100 : 0;
    const requiredImprovement = Math.max(0, gap);

    return {
      gap,
      gapPercent,
      requiredImprovement,
    };
  }

  /**
   * Generate industry comparison
   */
  static generateIndustryComparison(
    benchmarks: BenchmarkingData[],
    outletValues: Record<string, number>
  ): Array<{
    metricName: string;
    industryAverage: number;
    topQuartile: number;
    outletValue: number;
    percentile: number;
    position: 'above' | 'within' | 'below';
  }> {
    return benchmarks.map(benchmark => {
      const outletValue = outletValues[benchmark.metricName] || 0;
      const percentile = this.calculatePercentile(
        outletValue,
        benchmark.bottomQuartile,
        benchmark.topQuartile
      );

      let position: 'above' | 'within' | 'below';
      if (outletValue >= benchmark.topQuartile) {
        position = 'above';
      } else if (outletValue <= benchmark.bottomQuartile) {
        position = 'below';
      } else {
        position = 'within';
      }

      return {
        metricName: benchmark.metricName,
        industryAverage: benchmark.industryAverage,
        topQuartile: benchmark.topQuartile,
        outletValue,
        percentile,
        position,
      };
    });
  }

  /**
   * Validate benchmarking data
   */
  static validateBenchmarkingData(data: Partial<BenchmarkingData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.metricName || data.metricName.trim() === '') {
      errors.push('Metric name is required');
    }

    if (!data.metricCategory || data.metricCategory.trim() === '') {
      errors.push('Metric category is required');
    }

    if (data.industryAverage === undefined || data.industryAverage < 0) {
      errors.push('Valid industry average is required');
    }

    if (data.topQuartile === undefined || data.topQuartile < data.industryAverage) {
      errors.push('Top quartile must be greater than or equal to industry average');
    }

    if (data.bottomQuartile === undefined || data.bottomQuartile > data.industryAverage) {
      errors.push('Bottom quartile must be less than or equal to industry average');
    }

    if (!data.year || data.year < 2000 || data.year > new Date().getFullYear() + 1) {
      errors.push('Valid year is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate benchmarking insights
   */
  static generateBenchmarkingInsights(
    comparison: OutletComparison
  ): string[] {
    const insights: string[] = [];

    if (comparison.overallScore >= 80) {
      insights.push('Outlet performing in top quartile - excellent performance');
    } else if (comparison.overallScore >= 60) {
      insights.push('Outlet performing above average - good standing');
    } else if (comparison.overallScore >= 40) {
      insights.push('Outlet performing near industry average - room for improvement');
    } else {
      insights.push('Outlet below industry average - significant improvement needed');
    }

    const highPerformingMetrics = comparison.metrics.filter(m => m.percentile >= 75);
    if (highPerformingMetrics.length > 0) {
      insights.push(`Strong performance in ${highPerformingMetrics.length} metrics`);
    }

    const lowPerformingMetrics = comparison.metrics.filter(m => m.percentile <= 25);
    if (lowPerformingMetrics.length > 0) {
      insights.push(`Critical improvement needed in ${lowPerformingMetrics.length} metrics`);
    }

    return insights;
  }
}

// Export singleton instance
export const benchmarkingEngine = BenchmarkingEngine;
