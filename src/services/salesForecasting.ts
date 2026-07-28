/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Predictive Sales Forecasting Service
 * AI-powered sales forecasting with multiple factors
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
export interface SalesForecast {
  id: string;
  outletId: string;
  forecastDate: string;
  mealPeriod: 'breakfast' | 'lunch' | 'dinner' | 'all_day';
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  factors: {
    historical: number;
    weather: number;
    events: number;
    seasonality: number;
  };
  actualRevenue?: number;
  actualOrders?: number;
  forecastAccuracy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastFactors {
  historical: number;
  weather: number;
  events: number;
  seasonality: number;
  dayOfWeek: number;
  holiday: boolean;
  specialEvent?: string;
}

export interface ForecastAccuracyReport {
  period: { startDate: string; endDate: string };
  totalForecasts: number;
  averageAccuracy: number;
  highAccuracyCount: number;
  mediumAccuracyCount: number;
  lowAccuracyCount: number;
  byMealPeriod: Array<{
    mealPeriod: string;
    averageAccuracy: number;
    forecastCount: number;
  }>;
}

// Sales Forecast CRUD operations
export async function fetchSalesForecasts(
  outletId?: string,
  startDate?: string,
  endDate?: string,
  mealPeriod?: string
): Promise<SalesForecast[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (mealPeriod) params.append('mealPeriod', mealPeriod);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SalesForecast[]>(`/sales-forecasts${queryString}`);
}

export async function fetchSalesForecastById(id: string): Promise<SalesForecast> {
  return apiRequest<SalesForecast>(`/sales-forecasts/${id}`);
}

export async function createSalesForecast(forecast: Partial<SalesForecast>): Promise<SalesForecast> {
  return apiRequest<SalesForecast>('/sales-forecasts', {
    method: 'POST',
    body: JSON.stringify(forecast),
  });
}

export async function updateSalesForecast(id: string, forecast: Partial<SalesForecast>): Promise<SalesForecast> {
  return apiRequest<SalesForecast>(`/sales-forecasts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(forecast),
  });
}

export async function deleteSalesForecast(id: string): Promise<void> {
  await apiRequest<void>(`/sales-forecasts/${id}`, {
    method: 'DELETE',
  });
}

// Forecast generation
export async function generateSalesForecast(
  outletId: string,
  forecastDate: string,
  mealPeriod: 'breakfast' | 'lunch' | 'dinner' | 'all_day' = 'all_day',
  factors?: Partial<ForecastFactors>
): Promise<SalesForecast> {
  return apiRequest<SalesForecast>('/sales-forecasts/generate', {
    method: 'POST',
    body: JSON.stringify({ outletId, forecastDate, mealPeriod, factors }),
  });
}

export async function generateBulkForecasts(
  outletId: string,
  startDate: string,
  endDate: string,
  mealPeriod?: string
): Promise<SalesForecast[]> {
  return apiRequest<SalesForecast[]>('/sales-forecasts/generate-bulk', {
    method: 'POST',
    body: JSON.stringify({ outletId, startDate, endDate, mealPeriod }),
  });
}

// Forecast accuracy
export async function updateForecastWithActuals(
  forecastId: string,
  actualRevenue: number,
  actualOrders: number
): Promise<SalesForecast> {
  return apiRequest<SalesForecast>(`/sales-forecasts/${forecastId}/actuals`, {
    method: 'POST',
    body: JSON.stringify({ actualRevenue, actualOrders }),
  });
}

export async function getForecastAccuracyReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<ForecastAccuracyReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<ForecastAccuracyReport>(`/sales-forecasts/accuracy?${params.toString()}`);
}

// Forecast comparison
export async function compareForecastsVsActuals(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<Array<{
  forecastDate: string;
  mealPeriod: string;
  predictedRevenue: number;
  actualRevenue: number;
  predictedOrders: number;
  actualOrders: number;
  accuracy: number;
  variance: number;
}>> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest(`/sales-forecasts/compare?${params.toString()}`);
}

// Sales Forecasting Engine
export class SalesForecastingEngine {
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
    historicalData: Array<{ date: string; value: number }>,
    targetMonth: number
  ): number {
    const monthlyData = historicalData.filter(d => new Date(d.date).getMonth() === targetMonth);
    if (monthlyData.length === 0) return 1;
    
    const monthlyAverage = monthlyData.reduce((sum, d) => sum + d.value, 0) / monthlyData.length;
    const overallAverage = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
    
    if (overallAverage === 0) return 1;
    return monthlyAverage / overallAverage;
  }

  /**
   * Calculate day-of-week factor
   */
  static calculateDayOfWeekFactor(
    historicalData: Array<{ date: string; value: number }>,
    targetDayOfWeek: number
  ): number {
    const dayData = historicalData.filter(d => new Date(d.date).getDay() === targetDayOfWeek);
    if (dayData.length === 0) return 1;
    
    const dayAverage = dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length;
    const overallAverage = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
    
    if (overallAverage === 0) return 1;
    return dayAverage / overallAverage;
  }

  /**
   * Calculate forecast confidence
   */
  static calculateConfidence(
    historicalData: number[],
    forecast: number
  ): number {
    if (historicalData.length < 3) return 50;
    
    const variance = historicalData.reduce((sum, val) => {
      return sum + Math.pow(val - forecast, 2);
    }, 0) / historicalData.length;
    
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / Math.abs(forecast);
    
    // Lower variability = higher confidence
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }

  /**
   * Calculate forecast accuracy
   */
  static calculateAccuracy(
    predicted: number,
    actual: number
  ): number {
    if (predicted === 0) return 0;
    return (1 - Math.abs(predicted - actual) / predicted) * 100;
  }

  /**
   * Generate forecast with multiple factors
   */
  static generateForecast(
    historicalData: Array<{ date: string; revenue: number; orders: number }>,
    factors: ForecastFactors
  ): {
    predictedRevenue: number;
    predictedOrders: number;
    confidence: number;
  } {
    const revenues = historicalData.map(d => d.revenue);
    const orders = historicalData.map(d => d.orders);
    
    // Base forecast using moving average
    let predictedRevenue = this.calculateMovingAverage(revenues, 7);
    let predictedOrders = this.calculateMovingAverage(orders, 7);
    
    // Apply factors
    predictedRevenue *= (1 + (factors.historical - 0.5) * 0.3);
    predictedRevenue *= (1 + (factors.weather - 0.5) * 0.2);
    predictedRevenue *= (1 + (factors.events - 0.5) * 0.3);
    predictedRevenue *= factors.seasonality;
    
    predictedOrders *= (1 + (factors.historical - 0.5) * 0.3);
    predictedOrders *= (1 + (factors.weather - 0.5) * 0.2);
    predictedOrders *= (1 + (factors.events - 0.5) * 0.3);
    predictedOrders *= factors.seasonality;
    
    // Calculate confidence
    const confidence = this.calculateConfidence(revenues, predictedRevenue);
    
    return {
      predictedRevenue: Math.max(0, predictedRevenue),
      predictedOrders: Math.max(0, Math.round(predictedOrders)),
      confidence,
    };
  }

  /**
   * Detect forecast anomalies
   */
  static detectAnomalies(
    forecasts: SalesForecast[]
  ): SalesForecast[] {
    if (forecasts.length < 3) return [];
    
    const revenues = forecasts.map(f => f.predictedRevenue);
    const mean = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    const stdDev = Math.sqrt(
      revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length
    );
    
    const threshold = 2; // 2 standard deviations
    
    return forecasts.filter(f => {
      const zScore = Math.abs((f.predictedRevenue - mean) / stdDev);
      return zScore > threshold;
    });
  }

  /**
   * Generate forecast insights
   */
  static generateInsights(
    forecasts: SalesForecast[],
    actuals?: Array<{ date: string; revenue: number }>
  ): string[] {
    const insights: string[] = [];
    
    if (forecasts.length === 0) return insights;
    
    const totalPredictedRevenue = forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0);
    const averageConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
    
    if (averageConfidence < 70) {
      insights.push('Low forecast confidence - consider gathering more historical data');
    } else if (averageConfidence >= 90) {
      insights.push('High forecast confidence - predictions are reliable');
    }
    
    const anomalies = this.detectAnomalies(forecasts);
    if (anomalies.length > 0) {
      insights.push(`${anomalies.length} forecast anomalies detected - review manually`);
    }
    
    if (actuals && actuals.length > 0) {
      const totalActualRevenue = actuals.reduce((sum, a) => sum + a.revenue, 0);
      const variance = ((totalActualRevenue - totalPredictedRevenue) / totalPredictedRevenue) * 100;
      
      if (Math.abs(variance) > 20) {
        insights.push(`Forecast variance ${variance.toFixed(1)}% - significant deviation from actuals`);
      }
    }
    
    return insights;
  }

  /**
   * Optimize forecast parameters
   */
  static optimizeParameters(
    historicalData: Array<{ date: string; revenue: number; orders: number }>,
    actualData: Array<{ date: string; revenue: number; orders: number }>
  ): {
    optimalAlpha: number;
    optimalPeriod: number;
    improvedAccuracy: number;
  } {
    let bestAccuracy = 0;
    let optimalAlpha = 0.3;
    let optimalPeriod = 7;
    
    // Test different alpha values for exponential smoothing
    for (const alpha of [0.1, 0.2, 0.3, 0.4, 0.5]) {
      const forecasted = this.calculateExponentialSmoothing(
        historicalData.map(d => d.revenue),
        alpha
      );
      
      const accuracy = this.calculateAccuracy(forecasted, actualData[0]?.revenue || 0);
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        optimalAlpha = alpha;
      }
    }
    
    return {
      optimalAlpha,
      optimalPeriod,
      improvedAccuracy: bestAccuracy,
    };
  }
}

// Export singleton instance
export const salesForecastingEngine = SalesForecastingEngine;
