/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Demand Forecasting Engine
 * AI-powered demand forecasting for ingredients with seasonal pattern recognition
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
export interface DemandForecast {
  ingredientId: string;
  forecastDate: string;
  predictedQuantity: number;
  confidence: number;
  factors: {
    historicalTrend: number;
    seasonality: number;
    events: number;
    dayOfWeek: number;
  };
  upperBound: number;
  lowerBound: number;
}

export interface ForecastFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface SeasonalPattern {
  ingredientId: string;
  month: number;
  averageDemand: number;
  seasonalityIndex: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ForecastAccuracy {
  ingredientId: string;
  period: string;
  actualQuantity: number;
  forecastedQuantity: number;
  accuracy: number;
  error: number;
  mape: number; // Mean Absolute Percentage Error
}

// Demand Forecasting operations
export async function generateDemandForecast(
  ingredientId: string,
  startDate: string,
  endDate: string,
  options?: {
    includeSeasonality?: boolean;
    includeEvents?: boolean;
    confidenceLevel?: number;
  }
): Promise<DemandForecast[]> {
  const params = new URLSearchParams();
  params.append('ingredientId', ingredientId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (options?.includeSeasonality) params.append('includeSeasonality', 'true');
  if (options?.includeEvents) params.append('includeEvents', 'true');
  if (options?.confidenceLevel) params.append('confidenceLevel', options.confidenceLevel.toString());

  return apiRequest<DemandForecast[]>(`/demand-forecasting/generate?${params.toString()}`);
}

export async function generateBulkForecasts(
  startDate: string,
  endDate: string,
  options?: {
    outletId?: string;
    category?: string;
  }
): Promise<DemandForecast[]> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (options?.outletId) params.append('outletId', options.outletId);
  if (options?.category) params.append('category', options.category);

  return apiRequest<DemandForecast[]>(`/demand-forecasting/generate-bulk?${params.toString()}`);
}

export async function fetchExistingForecasts(
  ingredientId?: string,
  startDate?: string,
  endDate?: string
): Promise<DemandForecast[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<DemandForecast[]>(`/demand-forecasting${queryString}`);
}

// Seasonal Pattern Analysis
export async function analyzeSeasonalPatterns(
  ingredientId: string,
  historicalMonths: number = 24
): Promise<SeasonalPattern[]> {
  return apiRequest<SeasonalPattern[]>(
    `/demand-forecasting/seasonal-patterns/${ingredientId}?months=${historicalMonths}`
  );
}

export async function getSeasonalIndices(
  month: number,
  category?: string
): Promise<{ ingredientId: string; seasonalityIndex: number }[]> {
  const params = new URLSearchParams();
  params.append('month', month.toString());
  if (category) params.append('category', category);

  return apiRequest(`/demand-forecasting/seasonal-indices?${params.toString()}`);
}

// Forecast Accuracy Tracking
export async function trackForecastAccuracy(
  actualData: Array<{ ingredientId: string; date: string; actualQuantity: number }>
): Promise<ForecastAccuracy[]> {
  return apiRequest<ForecastAccuracy[]>('/demand-forecasting/track-accuracy', {
    method: 'POST',
    body: JSON.stringify({ actualData }),
  });
}

export async function fetchForecastAccuracy(
  ingredientId?: string,
  period?: string
): Promise<ForecastAccuracy[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (period) params.append('period', period);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ForecastAccuracy[]>(`/demand-forecasting/accuracy${queryString}`);
}

// Forecast Factors Analysis
export async function analyzeForecastFactors(
  ingredientId: string,
  forecastDate: string
): Promise<ForecastFactor[]> {
  return apiRequest<ForecastFactor[]>(
    `/demand-forecasting/factors/${ingredientId}?date=${forecastDate}`
  );
}

// AI Model Training and Management
export async function trainForecastModel(
  ingredientId: string,
  trainingDataStart: string,
  trainingDataEnd: string
): Promise<{ modelId: string; accuracy: number; trainedAt: string }> {
  return apiRequest(`/demand-forecasting/train-model/${ingredientId}`, {
    method: 'POST',
    body: JSON.stringify({
      trainingDataStart,
      trainingDataEnd,
    }),
  });
}

export async function getModelAccuracy(ingredientId: string): Promise<{
  modelId: string;
  accuracy: number;
  lastTrained: string;
  trainingDataPoints: number;
}> {
  return apiRequest(`/demand-forecasting/model-accuracy/${ingredientId}`);
}

// Event-based demand adjustments
export interface EventImpact {
  eventId: string;
  eventName: string;
  eventDate: string;
  expectedImpact: number; // percentage increase/decrease
  affectedIngredients: Array<{ ingredientId: string; impactFactor: number }>;
}

export async function analyzeEventImpact(
  eventDate: string,
  eventType: 'holiday' | 'conference' | 'weekend' | 'special_event'
): Promise<EventImpact[]> {
  return apiRequest<EventImpact[]>(`/demand-forecasting/event-impact`, {
    method: 'POST',
    body: JSON.stringify({ eventDate, eventType }),
  });
}

// Advanced forecasting algorithms
export class DemandForecastingEngine {
  /**
   * Simple moving average forecast
   */
  static calculateMovingAverage(
    historicalData: number[],
    period: number
  ): number {
    if (historicalData.length < period) {
      return historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    }
    const recentData = historicalData.slice(-period);
    return recentData.reduce((sum, val) => sum + val, 0) / period;
  }

  /**
   * Weighted moving average forecast
   */
  static calculateWeightedMovingAverage(
    historicalData: number[],
    weights: number[]
  ): number {
    const period = Math.min(historicalData.length, weights.length);
    const recentData = historicalData.slice(-period);
    const normalizedWeights = weights.slice(0, period);
    const weightSum = normalizedWeights.reduce((sum, w) => sum + w, 0);
    
    return recentData.reduce((sum, val, idx) => {
      return sum + (val * normalizedWeights[idx] / weightSum);
    }, 0);
  }

  /**
   * Exponential smoothing forecast
   */
  static calculateExponentialSmoothing(
    historicalData: number[],
    alpha: number = 0.3
  ): number {
    if (historicalData.length === 0) return 0;
    
    let forecast = historicalData[0];
    for (let i = 1; i < historicalData.length; i++) {
      forecast = alpha * historicalData[i] + (1 - alpha) * forecast;
    }
    return forecast;
  }

  /**
   * Calculate seasonality index
   */
  static calculateSeasonalityIndex(
    monthlyData: Array<{ month: number; demand: number }>,
    targetMonth: number
  ): number {
    const monthlyAverage = monthlyData.reduce((sum, d) => sum + d.demand, 0) / monthlyData.length;
    const targetMonthData = monthlyData.find(d => d.month === targetMonth);
    
    if (!targetMonthData || monthlyAverage === 0) return 1;
    return targetMonthData.demand / monthlyAverage;
  }

  /**
   * Calculate trend
   */
  static calculateTrend(historicalData: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (historicalData.length < 2) return 'stable';
    
    const recent = historicalData.slice(-7);
    const earlier = historicalData.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
    
    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate confidence interval
   */
  static calculateConfidenceInterval(
    forecast: number,
    historicalData: number[],
    confidenceLevel: number = 0.95
  ): { upperBound: number; lowerBound: number } {
    if (historicalData.length < 2) {
      return {
        upperBound: forecast * 1.2,
        lowerBound: forecast * 0.8,
      };
    }
    
    const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);
    
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.645;
    const margin = zScore * stdDev;
    
    return {
      upperBound: forecast + margin,
      lowerBound: Math.max(0, forecast - margin),
    };
  }

  /**
   * Combine multiple forecasting methods
   */
  static combineForecasts(
    forecasts: Array<{ value: number; weight: number }>
  ): number {
    const totalWeight = forecasts.reduce((sum, f) => sum + f.weight, 0);
    return forecasts.reduce((sum, f) => sum + (f.value * f.weight / totalWeight), 0);
  }
}

// Export singleton instance
export const demandForecastingEngine = DemandForecastingEngine;
