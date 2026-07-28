/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Inventory Optimization and Par Level Management
 * Automated par level optimization and inventory management
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
export interface ParLevel {
  ingredientId: string;
  currentParLevel: number;
  recommendedParLevel: number;
  currentReorderPoint: number;
  recommendedReorderPoint: number;
  maxStockLevel: number;
  safetyStockLevel: number;
  leadTimeDays: number;
  demandPerDay: number;
  lastCalculated: string;
}

export interface InventoryOptimization {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  currentParLevel: number;
  recommendedParLevel: number;
  currentReorderPoint: number;
  recommendedReorderPoint: number;
  projectedStockoutDate?: string;
  projectedOverstockDate?: string;
  savingsOpportunity: number;
  actionRequired: 'none' | 'reorder' | 'reduce' | 'optimize';
  priority: 'high' | 'medium' | 'low';
}

export interface StockoutPrediction {
  ingredientId: string;
  predictedStockoutDate: string;
  daysUntilStockout: number;
  probability: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
}

export interface OverstockAlert {
  ingredientId: string;
  currentStock: number;
  optimalStock: number;
  excessQuantity: number;
  excessValue: number;
  holdingCost: number;
  riskOfExpiry: 'high' | 'medium' | 'low';
}

// Par Level Management
export async function fetchParLevels(
  ingredientId?: string,
  outletId?: string
): Promise<ParLevel[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (outletId) params.append('outletId', outletId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ParLevel[]>(`/inventory-optimization/par-levels${queryString}`);
}

export async function calculateParLevels(
  ingredientId: string,
  options?: {
    historicalDays?: number;
    serviceLevel?: number; // 0.95 for 95% service level
    leadTimeDays?: number;
  }
): Promise<ParLevel> {
  const params = new URLSearchParams();
  if (options?.historicalDays) params.append('historicalDays', options.historicalDays.toString());
  if (options?.serviceLevel) params.append('serviceLevel', options.serviceLevel.toString());
  if (options?.leadTimeDays) params.append('leadTimeDays', options.leadTimeDays.toString());

  return apiRequest<ParLevel>(
    `/inventory-optimization/calculate-par/${ingredientId}?${params.toString()}`
  );
}

export async function updateParLevel(
  ingredientId: string,
  parLevel: Partial<ParLevel>
): Promise<ParLevel> {
  return apiRequest<ParLevel>(`/inventory-optimization/par-levels/${ingredientId}`, {
    method: 'PUT',
    body: JSON.stringify(parLevel),
  });
}

export async function bulkCalculateParLevels(
  ingredientIds: string[],
  options?: {
    serviceLevel?: number;
    leadTimeDays?: number;
  }
): Promise<ParLevel[]> {
  return apiRequest<ParLevel[]>('/inventory-optimization/bulk-calculate-par', {
    method: 'POST',
    body: JSON.stringify({ ingredientIds, options }),
  });
}

// Inventory Optimization
export async function fetchInventoryOptimizations(
  outletId?: string,
  category?: string
): Promise<InventoryOptimization[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (category) params.append('category', category);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<InventoryOptimization[]>(`/inventory-optimization${queryString}`);
}

export async function runInventoryOptimization(
  outletId?: string
): Promise<InventoryOptimization[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);

  return apiRequest<InventoryOptimization[]>(
    `/inventory-optimization/run-optimization?${params.toString()}`
  );
}

export async function getStockoutPredictions(
  daysAhead: number = 30
): Promise<StockoutPrediction[]> {
  return apiRequest<StockoutPrediction[]>(
    `/inventory-optimization/stockout-predictions?daysAhead=${daysAhead}`
  );
}

export async function getOverstockAlerts(
  thresholdPercent: number = 150
): Promise<OverstockAlert[]> {
  return apiRequest<OverstockAlert[]>(
    `/inventory-optimization/overstock-alerts?threshold=${thresholdPercent}`
  );
}

// Inventory Optimization Engine
export class InventoryOptimizationEngine {
  /**
   * Calculate optimal par level using (R, S) policy
   */
  static calculateOptimalParLevel(
    demandPerDay: number,
    leadTimeDays: number,
    reviewPeriodDays: number,
    serviceLevel: number = 0.95,
    standardDeviation: number = 0
  ): { parLevel: number; reorderPoint: number; safetyStock: number } {
    // Calculate demand during lead time + review period
    const demandDuringLeadTime = demandPerDay * leadTimeDays;
    const demandDuringReviewPeriod = demandPerDay * reviewPeriodDays;
    
    // Calculate safety stock based on service level
    const zScore = serviceLevel === 0.95 ? 1.645 : serviceLevel === 0.99 ? 2.33 : 1.28;
    const safetyStock = zScore * standardDeviation * Math.sqrt(leadTimeDays);
    
    // Calculate reorder point (R)
    const reorderPoint = demandDuringLeadTime + safetyStock;
    
    // Calculate par level (S)
    const parLevel = demandDuringLeadTime + demandDuringReviewPeriod + safetyStock;
    
    return {
      parLevel: Math.ceil(parLevel),
      reorderPoint: Math.ceil(reorderPoint),
      safetyStock: Math.ceil(safetyStock),
    };
  }

  /**
   * Calculate economic order quantity (EOQ)
   */
  static calculateEOQ(
    annualDemand: number,
    orderingCost: number,
    holdingCostPerUnit: number
  ): number {
    if (annualDemand <= 0 || orderingCost <= 0 || holdingCostPerUnit <= 0) {
      return 0;
    }
    
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit);
    return Math.ceil(eoq);
  }

  /**
   * Predict stockout date based on current stock and demand
   */
  static predictStockoutDate(
    currentStock: number,
    demandPerDay: number,
    safetyStock: number = 0
  ): Date | null {
    if (demandPerDay <= 0 || currentStock <= safetyStock) {
      return new Date(); // Already at or below safety stock
    }
    
    const availableStock = currentStock - safetyStock;
    const daysUntilStockout = availableStock / demandPerDay;
    
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + Math.ceil(daysUntilStockout));
    
    return stockoutDate;
  }

  /**
   * Calculate holding cost for excess inventory
   */
  static calculateHoldingCost(
    excessQuantity: number,
    unitCost: number,
    annualHoldingRate: number = 0.25
  ): number {
    return excessQuantity * unitCost * annualHoldingRate;
  }

  /**
   * Calculate savings opportunity from optimization
   */
  static calculateSavingsOpportunity(
    currentStock: number,
    optimalStock: number,
    unitCost: number
  ): number {
    if (currentStock <= optimalStock) return 0;
    
    const excess = currentStock - optimalStock;
    const annualHoldingCost = this.calculateHoldingCost(excess, unitCost);
    
    // Assume 50% of excess can be avoided through better planning
    return annualHoldingCost * 0.5;
  }

  /**
   * Calculate safety stock level
   */
  static calculateSafetyStock(
    demandPerDay: number,
    leadTimeDays: number,
    serviceLevel: number = 0.95,
    demandVariability: number = 0.2
  ): number {
    const zScore = serviceLevel === 0.95 ? 1.645 : serviceLevel === 0.99 ? 2.33 : 1.28;
    const variabilityFactor = 1 + demandVariability;
    const safetyStock = zScore * demandPerDay * leadTimeDays * variabilityFactor;
    
    return Math.ceil(safetyStock);
  }

  /**
   * Determine action required for inventory item
   */
  static determineActionRequired(
    currentStock: number,
    reorderPoint: number,
    parLevel: number,
    maxStockLevel: number
  ): 'none' | 'reorder' | 'reduce' | 'optimize' {
    if (currentStock <= reorderPoint) {
      return 'reorder';
    }
    if (currentStock >= maxStockLevel) {
      return 'reduce';
    }
    if (currentStock > parLevel * 1.2) {
      return 'reduce';
    }
    if (currentStock < parLevel * 0.8 && currentStock > reorderPoint) {
      return 'optimize';
    }
    return 'none';
  }

  /**
   * Calculate priority level for inventory action
   */
  static calculatePriority(
    currentStock: number,
    reorderPoint: number,
    daysUntilStockout?: number
  ): 'high' | 'medium' | 'low' {
    if (currentStock <= reorderPoint * 0.5) {
      return 'high';
    }
    if (daysUntilStockout !== undefined && daysUntilStockout <= 7) {
      return 'high';
    }
    if (currentStock <= reorderPoint) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate optimal reorder quantity
   */
  static calculateReorderQuantity(
    parLevel: number,
    currentStock: number,
    eoq?: number
  ): number {
    const needed = parLevel - currentStock;
    if (needed <= 0) return 0;
    
    // Round up to nearest EOQ if provided
    if (eoq && eoq > 0) {
      const multiplier = Math.ceil(needed / eoq);
      return multiplier * eoq;
    }
    
    return needed;
  }

  /**
   * Analyze inventory turnover rate
   */
  static calculateInventoryTurnover(
    costOfGoodsSold: number,
    averageInventoryValue: number
  ): number {
    if (averageInventoryValue === 0) return 0;
    return costOfGoodsSold / averageInventoryValue;
  }

  /**
   * Calculate days of inventory on hand
   */
  static calculateDaysOfInventory(
    currentStock: number,
    demandPerDay: number
  ): number {
    if (demandPerDay <= 0) return Infinity;
    return currentStock / demandPerDay;
  }
}

// Export singleton instance
export const inventoryOptimizationEngine = InventoryOptimizationEngine;
