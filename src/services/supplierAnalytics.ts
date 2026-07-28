/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Supplier Performance Tracking and Analytics
 * Comprehensive supplier performance metrics and analytics
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
export interface SupplierPerformanceMetrics {
  supplierId: string;
  supplierName: string;
  period: { startDate: string; endDate: string };
  onTimeDeliveryRate: number;
  qualityScore: number;
  orderAccuracy: number;
  averageLeadTime: number;
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  returnsCount: number;
  complaintsCount: number;
  rating: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SupplierBenchmark {
  supplierId: string;
  supplierName: string;
  metrics: {
    onTimeDeliveryRate: number;
    qualityScore: number;
    priceCompetitiveness: number;
    overallPerformance: number;
  };
  industryAverage: {
    onTimeDeliveryRate: number;
    qualityScore: number;
    priceCompetitiveness: number;
    overallPerformance: number;
  };
  percentile: number;
}

export interface SupplierRiskAssessment {
  supplierId: string;
  supplierName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendedActions: string[];
  lastAssessment: string;
}

export interface SupplierSavingsOpportunity {
  supplierId: string;
  supplierName: string;
  category: string;
  currentSpend: number;
  potentialSavings: number;
  savingsPercent: number;
  opportunityType: 'volume_discount' | 'alternative_supplier' | 'contract_renegotiation' | 'payment_terms';
  confidence: number;
}

export interface SupplierComparison {
  suppliers: Array<{
    supplierId: string;
    name: string;
    onTimeDeliveryRate: number;
    qualityScore: number;
    priceLevel: number;
    totalSpend: number;
    rating: number;
  }>;
  bestOverall: string;
  bestOnTime: string;
  bestQuality: string;
  bestPrice: string;
}

// Performance Metrics Operations
export async function fetchSupplierPerformanceMetrics(
  supplierId: string,
  startDate?: string,
  endDate?: string
): Promise<SupplierPerformanceMetrics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return apiRequest<SupplierPerformanceMetrics>(
    `/supplier-analytics/performance/${supplierId}?${params.toString()}`
  );
}

export async function fetchAllSupplierPerformance(
  startDate?: string,
  endDate?: string,
  category?: string
): Promise<SupplierPerformanceMetrics[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SupplierPerformanceMetrics[]>(`/supplier-analytics/performance${queryString}`);
}

export async function calculatePerformanceTrend(
  supplierId: string,
  periods: number = 4
): Promise<Array<{
  period: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  totalSpend: number;
}>> {
  return apiRequest(`/supplier-analytics/performance-trend/${supplierId}?periods=${periods}`);
}

// Benchmarking Operations
export async function benchmarkSupplier(
  supplierId: string
): Promise<SupplierBenchmark> {
  return apiRequest<SupplierBenchmark>(`/supplier-analytics/benchmark/${supplierId}`);
}

export async function benchmarkAllSuppliers(
  category?: string
): Promise<SupplierBenchmark[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  return apiRequest<SupplierBenchmark[]>(
    `/supplier-analytics/benchmark-all?${params.toString()}`
  );
}

// Risk Assessment Operations
export async function assessSupplierRisk(
  supplierId: string
): Promise<SupplierRiskAssessment> {
  return apiRequest<SupplierRiskAssessment>(`/supplier-analytics/risk/${supplierId}`);
}

export async function assessAllSupplierRisks(): Promise<SupplierRiskAssessment[]> {
  return apiRequest<SupplierRiskAssessment[]>('/supplier-analytics/risk-all');
}

// Savings Opportunity Analysis
export async function identifySavingsOpportunities(
  category?: string,
  minSpend: number = 10000
): Promise<SupplierSavingsOpportunity[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (minSpend) params.append('minSpend', minSpend.toString());

  return apiRequest<SupplierSavingsOpportunity[]>(
    `/supplier-analytics/savings-opportunities?${params.toString()}`
  );
}

// Supplier Comparison
export async function compareSuppliers(
  ingredientId?: string,
  category?: string
): Promise<SupplierComparison> {
  const params = new URLSearchParams();
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (category) params.append('category', category);

  return apiRequest(`/supplier-analytics/compare?${params.toString()}`);
}

// Analytics Engine
export class SupplierAnalyticsEngine {
  /**
   * Calculate on-time delivery rate
   */
  static calculateOnTimeDeliveryRate(
    onTimeDeliveries: number,
    totalDeliveries: number
  ): number {
    if (totalDeliveries === 0) return 0;
    return (onTimeDeliveries / totalDeliveries) * 100;
  }

  /**
   * Calculate quality score
   */
  static calculateQualityScore(
    approvedReceipts: number,
    totalReceipts: number,
    returns: number,
    complaints: number
  ): number {
    if (totalReceipts === 0) return 100;
    
    const approvalRate = (approvedReceipts / totalReceipts) * 100;
    const returnPenalty = (returns / totalReceipts) * 10; // 10% penalty per return
    const complaintPenalty = (complaints / totalReceipts) * 15; // 15% penalty per complaint
    
    return Math.max(0, Math.min(100, approvalRate - returnPenalty - complaintPenalty));
  }

  /**
   * Calculate order accuracy
   */
  static calculateOrderAccuracy(
    correctOrders: number,
    totalOrders: number
  ): number {
    if (totalOrders === 0) return 100;
    return (correctOrders / totalOrders) * 100;
  }

  /**
   * Calculate average lead time
   */
  static calculateAverageLeadTime(
    leadTimes: number[]
  ): number {
    if (leadTimes.length === 0) return 0;
    return leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;
  }

  /**
   * Determine performance trend
   */
  static determineTrend(
    currentMetrics: SupplierPerformanceMetrics,
    previousMetrics: SupplierPerformanceMetrics
  ): 'improving' | 'stable' | 'declining' {
    const currentScore = (
      currentMetrics.onTimeDeliveryRate +
      currentMetrics.qualityScore +
      currentMetrics.orderAccuracy
    ) / 3;
    
    const previousScore = (
      previousMetrics.onTimeDeliveryRate +
      previousMetrics.qualityScore +
      previousMetrics.orderAccuracy
    ) / 3;
    
    const change = currentScore - previousScore;
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calculate overall performance score
   */
  static calculateOverallScore(
    onTimeDeliveryRate: number,
    qualityScore: number,
    orderAccuracy: number,
    priceCompetitiveness: number = 100,
    weights?: {
      onTimeDelivery: number;
      quality: number;
      accuracy: number;
      price: number;
    }
  ): number {
    const defaultWeights = { onTimeDelivery: 0.3, quality: 0.3, accuracy: 0.2, price: 0.2 };
    const w = weights || defaultWeights;
    
    return (
      (onTimeDeliveryRate * w.onTimeDelivery) +
      (qualityScore * w.quality) +
      (orderAccuracy * w.accuracy) +
      (priceCompetitiveness * w.price)
    );
  }

  /**
   * Assess supplier risk level
   */
  static assessRiskLevel(
    performance: SupplierPerformanceMetrics,
    riskFactors: Array<{ severity: 'low' | 'medium' | 'high' }>
  ): 'low' | 'medium' | 'high' | 'critical' {
    const highSeverityCount = riskFactors.filter(r => r.severity === 'high').length;
    const mediumSeverityCount = riskFactors.filter(r => r.severity === 'medium').length;
    
    if (performance.onTimeDeliveryRate < 70 || performance.qualityScore < 70) {
      return 'critical';
    }
    if (highSeverityCount >= 2 || mediumSeverityCount >= 3) {
      return 'high';
    }
    if (highSeverityCount === 1 || mediumSeverityCount >= 1) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate price competitiveness index
   */
  static calculatePriceCompetitiveness(
    supplierPrice: number,
    marketAveragePrice: number
  ): number {
    if (marketAveragePrice === 0) return 100;
    return Math.max(0, Math.min(100, (marketAveragePrice / supplierPrice) * 100));
  }

  /**
   * Identify savings opportunities
   */
  static identifySavingsOpportunities(
    supplierSpend: number,
    marketAveragePrice: number,
    currentPrice: number,
    annualVolume: number
  ): { potentialSavings: number; savingsPercent: number; opportunityType: string } {
    const priceDifference = currentPrice - marketAveragePrice;
    if (priceDifference <= 0) {
      return {
        potentialSavings: 0,
        savingsPercent: 0,
        opportunityType: 'none',
      };
    }
    
    const priceDifferencePercent = (priceDifference / currentPrice) * 100;
    const potentialSavings = priceDifferencePercent * supplierSpend / 100;
    
    let opportunityType = 'contract_renegotiation';
    if (annualVolume > 100000) {
      opportunityType = 'volume_discount';
    } else if (priceDifferencePercent > 15) {
      opportunityType = 'alternative_supplier';
    }
    
    return {
      potentialSavings,
      savingsPercent: priceDifferencePercent,
      opportunityType,
    };
  }

  /**
   * Generate supplier comparison matrix
   */
  static generateComparisonMatrix(
    suppliers: Array<{
      id: string;
      name: string;
      onTimeDeliveryRate: number;
      qualityScore: number;
      priceLevel: number;
      totalSpend: number;
    }>
  ): {
    bestOverall: string;
    bestOnTime: string;
    bestQuality: string;
    bestPrice: string;
  } {
    if (suppliers.length === 0) {
      return {
        bestOverall: '',
        bestOnTime: '',
        bestQuality: '',
        bestPrice: '',
      };
    }
    
    const bestOnTime = suppliers.reduce((best, current) =>
      current.onTimeDeliveryRate > best.onTimeDeliveryRate ? current : best
    );
    
    const bestQuality = suppliers.reduce((best, current) =>
      current.qualityScore > best.qualityScore ? current : best
    );
    
    const bestPrice = suppliers.reduce((best, current) =>
      current.priceLevel < best.priceLevel ? current : best
    );
    
    const bestOverall = suppliers.reduce((best, current) => {
      const currentScore = this.calculateOverallScore(
        current.onTimeDeliveryRate,
        current.qualityScore,
        95, // Assuming good accuracy for comparison
        this.calculatePriceCompetitiveness(100, current.priceLevel)
      );
      const bestScore = this.calculateOverallScore(
        best.onTimeDeliveryRate,
        best.qualityScore,
        95,
        this.calculatePriceCompetitiveness(100, best.priceLevel)
      );
      return currentScore > bestScore ? current : best;
    });
    
    return {
      bestOverall: bestOverall.id,
      bestOnTime: bestOnTime.id,
      bestQuality: bestQuality.id,
      bestPrice: bestPrice.id,
    };
  }

  /**
   * Calculate supplier reliability index
   */
  static calculateReliabilityIndex(
    onTimeDeliveryRate: number,
    qualityScore: number,
    orderAccuracy: number,
    complaintRate: number
  ): number {
    // Complaint rate should be low for high reliability
    const complaintPenalty = Math.min(50, complaintRate * 5);
    
    const baseScore = (
      onTimeDeliveryRate * 0.4 +
      qualityScore * 0.3 +
      orderAccuracy * 0.3
    );
    
    return Math.max(0, baseScore - complaintPenalty);
  }

  /**
   * Generate supplier performance report
   */
  static generatePerformanceReport(
    supplierId: string,
    metrics: SupplierPerformanceMetrics,
    benchmark?: SupplierBenchmark
  ): {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    score: number;
  } {
    const score = this.calculateOverallScore(
      metrics.onTimeDeliveryRate,
      metrics.qualityScore,
      metrics.orderAccuracy,
      benchmark?.metrics.priceCompetitiveness || 100
    );
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    if (metrics.onTimeDeliveryRate >= 95) {
      strengths.push('Excellent on-time delivery performance');
    } else if (metrics.onTimeDeliveryRate < 80) {
      weaknesses.push('On-time delivery rate below industry standard');
      recommendations.push('Address delivery delays with supplier');
    }
    
    if (metrics.qualityScore >= 95) {
      strengths.push('Consistently high product quality');
    } else if (metrics.qualityScore < 80) {
      weaknesses.push('Quality issues affecting operations');
      recommendations.push('Implement stricter quality control measures');
    }
    
    if (metrics.averageLeadTime <= 7) {
      strengths.push('Fast order fulfillment');
    } else if (metrics.averageLeadTime > 14) {
      weaknesses.push('Long lead times affecting inventory planning');
      recommendations.push('Consider safety stock adjustments or alternative suppliers');
    }
    
    if (metrics.returnsCount > metrics.totalOrders * 0.05) {
      weaknesses.push('High return rate indicating quality issues');
      recommendations.push('Investigate root causes of returns');
    }
    
    let summary = `Overall supplier performance score: ${score.toFixed(1)}/100. `;
    if (score >= 80) {
      summary += 'Supplier is performing well within acceptable parameters.';
    } else if (score >= 60) {
      summary += 'Supplier performance is adequate but needs improvement in key areas.';
    } else {
      summary += 'Supplier performance is below acceptable standards and requires immediate attention.';
    }
    
    return {
      summary,
      strengths,
      weaknesses,
      recommendations,
      score,
    };
  }
}

// Export singleton instance
export const supplierAnalyticsEngine = SupplierAnalyticsEngine;
