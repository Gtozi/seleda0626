/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Recipe Costing and Menu Engineering Tools
 * Advanced recipe costing with menu engineering analytics
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
export interface RecipeCost {
  recipeId: string;
  recipeName: string;
  menuItemId: string;
  menuItemName: string;
  totalCost: number;
  costPerPortion: number;
  portions: number;
  foodCostPercent: number;
  targetFoodCostPercent: number;
  variance: number;
  lastCalculated: string;
  lines: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unitOfMeasure: string;
    unitCost: number;
    lineCost: number;
  }>;
}

export interface MenuEngineeringAnalysis {
  menuItemId: string;
  name: string;
  category: string;
  popularity: number; // % of total sales
  profitability: number; // contribution margin
  classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
  salesVolume: number;
  contributionMargin: number;
  foodCostPercent: number;
  menuPrice: number;
  plateCost: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
}

export interface MenuPerformanceTrend {
  menuItemId: string;
  name: string;
  period: string;
  salesQuantity: number;
  salesRevenue: number;
  foodCost: number;
  averageCheckImpact: number;
  popularityRank: number;
  profitabilityRank: number;
}

export interface CostChangeImpact {
  ingredientId: string;
  ingredientName: string;
  oldCost: number;
  newCost: number;
  percentChange: number;
  affectedMenuItems: Array<{
    menuItemId: string;
    name: string;
    oldPlateCost: number;
    newPlateCost: number;
    costIncrease: number;
    recommendedPriceAdjustment: number;
  }>;
}

export interface PricingOptimization {
  menuItemId: string;
  name: string;
  currentPrice: number;
  currentPlateCost: number;
  currentFoodCostPercent: number;
  targetFoodCostPercent: number;
  recommendedPrice: number;
  priceElasticity: number;
  projectedRevenueChange: number;
  confidence: number;
}

// Recipe Costing Operations
export async function calculateRecipeCost(
  recipeId: string,
  options?: {
    includeYieldAdjustment?: boolean;
    includeWasteFactor?: boolean;
  }
): Promise<RecipeCost> {
  const params = new URLSearchParams();
  if (options?.includeYieldAdjustment) params.append('includeYieldAdjustment', 'true');
  if (options?.includeWasteFactor) params.append('includeWasteFactor', 'true');

  return apiRequest<RecipeCost>(
    `/recipe-costing/calculate/${recipeId}?${params.toString()}`
  );
}

export async function bulkCalculateRecipeCosts(
  recipeIds: string[]
): Promise<RecipeCost[]> {
  return apiRequest<RecipeCost[]>('/recipe-costing/bulk-calculate', {
    method: 'POST',
    body: JSON.stringify({ recipeIds }),
  });
}

export async function fetchRecipeCosts(
  menuItemId?: string,
  category?: string
): Promise<RecipeCost[]> {
  const params = new URLSearchParams();
  if (menuItemId) params.append('menuItemId', menuItemId);
  if (category) params.append('category', category);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<RecipeCost[]>(`/recipe-costing${queryString}`);
}

export async function updateRecipeCost(
  recipeId: string,
  costData: Partial<RecipeCost>
): Promise<RecipeCost> {
  return apiRequest<RecipeCost>(`/recipe-costing/${recipeId}`, {
    method: 'PUT',
    body: JSON.stringify(costData),
  });
}

// Menu Engineering Operations
export async function generateMenuEngineeringAnalysis(
  outletId?: string,
  period?: string
): Promise<MenuEngineeringAnalysis[]> {
  const params = new URLSearchParams();
  if (outletId) params.append('outletId', outletId);
  if (period) params.append('period', period);

  return apiRequest<MenuEngineeringAnalysis[]>(
    `/recipe-costing/menu-engineering?${params.toString()}`
  );
}

export async function fetchMenuPerformanceTrends(
  menuItemId?: string,
  startDate?: string,
  endDate?: string
): Promise<MenuPerformanceTrend[]> {
  const params = new URLSearchParams();
  if (menuItemId) params.append('menuItemId', menuItemId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<MenuPerformanceTrend[]>(`/recipe-costing/performance-trends${queryString}`);
}

export async function analyzeCostChangeImpact(
  ingredientId: string,
  newCost: number
): Promise<CostChangeImpact> {
  return apiRequest<CostChangeImpact>('/recipe-costing/cost-impact', {
    method: 'POST',
    body: JSON.stringify({ ingredientId, newCost }),
  });
}

export async function optimizePricing(
  menuItemId?: string,
  targetFoodCostPercent?: number
): Promise<PricingOptimization[]> {
  const params = new URLSearchParams();
  if (menuItemId) params.append('menuItemId', menuItemId);
  if (targetFoodCostPercent) params.append('targetFoodCostPercent', targetFoodCostPercent.toString());

  return apiRequest<PricingOptimization[]>(
    `/recipe-costing/pricing-optimization?${params.toString()}`
  );
}

// Recipe Costing Engine
export class RecipeCostingEngine {
  /**
   * Calculate total recipe cost
   */
  static calculateTotalCost(lines: Array<{
    quantity: number;
    unitCost: number;
  }>): number {
    return lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  }

  /**
   * Calculate cost per portion
   */
  static calculateCostPerPortion(
    totalCost: number,
    portions: number,
    yieldPercent: number = 1.0
  ): number {
    if (portions <= 0) return 0;
    return (totalCost / portions) * yieldPercent;
  }

  /**
   * Calculate food cost percentage
   */
  static calculateFoodCostPercent(
    plateCost: number,
    menuPrice: number
  ): number {
    if (menuPrice <= 0) return 0;
    return (plateCost / menuPrice) * 100;
  }

  /**
   * Calculate contribution margin
   */
  static calculateContributionMargin(
    menuPrice: number,
    plateCost: number
  ): number {
    return menuPrice - plateCost;
  }

  /**
   * Calculate contribution margin ratio
   */
  static calculateContributionMarginRatio(
    contributionMargin: number,
    menuPrice: number
  ): number {
    if (menuPrice <= 0) return 0;
    return contributionMargin / menuPrice;
  }

  /**
   * Classify menu item using menu engineering matrix
   */
  static classifyMenuItem(
    popularity: number,
    profitability: number,
    medianPopularity: number,
    medianProfitability: number
  ): 'star' | 'plowhorse' | 'puzzle' | 'dog' {
    const isHighPopularity = popularity >= medianPopularity;
    const isHighProfitability = profitability >= medianProfitability;

    if (isHighPopularity && isHighProfitability) return 'star';
    if (isHighPopularity && !isHighProfitability) return 'plowhorse';
    if (!isHighPopularity && isHighProfitability) return 'puzzle';
    return 'dog';
  }

  /**
   * Generate recommendation based on classification
   */
  static generateRecommendation(classification: string): string {
    switch (classification) {
      case 'star':
        return 'Keep on menu and highlight. Consider premium pricing strategy.';
      case 'plowhorse':
        return 'Popular but low margin. Increase price slightly or reduce portion size.';
      case 'puzzle':
        return 'High margin but low popularity. Improve marketing or reduce price.';
      case 'dog':
        return 'Consider removing from menu or re-engineering recipe to improve margins.';
      default:
        return 'Monitor performance closely.';
    }
  }

  /**
   * Calculate recommended price based on target food cost
   */
  static calculateRecommendedPrice(
    plateCost: number,
    targetFoodCostPercent: number,
    currentPrice?: number
  ): number {
    const recommendedPrice = plateCost / (targetFoodCostPercent / 100);
    
    // If current price exists, apply gradual adjustment (max 10% change)
    if (currentPrice) {
      const priceChangePercent = ((recommendedPrice - currentPrice) / currentPrice) * 100;
      if (Math.abs(priceChangePercent) > 10) {
        const maxChange = currentPrice * 0.1;
        return priceChangePercent > 0 
          ? currentPrice + maxChange 
          : currentPrice - maxChange;
      }
    }
    
    return Math.round(recommendedPrice * 100) / 100;
  }

  /**
   * Calculate price elasticity impact
   */
  static calculatePriceElasticityImpact(
    currentPrice: number,
    newPrice: number,
    elasticity: number = -1.5,
    currentSales: number = 100
  ): {
    projectedSales: number;
    revenueChange: number;
    percentChange: number;
  } {
    const priceChangePercent = ((newPrice - currentPrice) / currentPrice) * 100;
    const salesChangePercent = elasticity * priceChangePercent;
    const projectedSales = currentSales * (1 + salesChangePercent / 100);
    const currentRevenue = currentPrice * currentSales;
    const projectedRevenue = newPrice * projectedSales;
    const revenueChange = projectedRevenue - currentRevenue;
    const percentChange = (revenueChange / currentRevenue) * 100;

    return {
      projectedSales: Math.max(0, projectedSales),
      revenueChange,
      percentChange,
    };
  }

  /**
   * Analyze cost variance
   */
  static calculateCostVariance(
    actualCost: number,
    standardCost: number
  ): { variance: number; variancePercent: number; isFavorable: boolean } {
    const variance = actualCost - standardCost;
    const variancePercent = (variance / standardCost) * 100;
    const isFavorable = variance < 0;

    return {
      variance,
      variancePercent,
      isFavorable,
    };
  }

  /**
   * Calculate yield-adjusted cost
   */
  static calculateYieldAdjustedCost(
    baseCost: number,
    yieldPercentage: number
  ): number {
    if (yieldPercentage <= 0 || yieldPercentage > 100) return baseCost;
    return baseCost / (yieldPercentage / 100);
  }

  /**
   * Calculate waste-adjusted cost
   */
  static calculateWasteAdjustedCost(
    baseCost: number,
    wastePercentage: number
  ): number {
    if (wastePercentage < 0 || wastePercentage > 100) return baseCost;
    return baseCost / ((100 - wastePercentage) / 100);
  }

  /**
   * Calculate recipe variance analysis
   */
  static calculateRecipeVariance(
    standardRecipe: Array<{ ingredientId: string; quantity: number }>,
    actualRecipe: Array<{ ingredientId: string; quantity: number }>,
    ingredientCosts: Map<string, number>
  ): Array<{
    ingredientId: string;
    standardQuantity: number;
    actualQuantity: number;
    variance: number;
    variancePercent: number;
    costImpact: number;
  }> {
    const varianceAnalysis: Array<{
      ingredientId: string;
      standardQuantity: number;
      actualQuantity: number;
      variance: number;
      variancePercent: number;
      costImpact: number;
    }> = [];

    const allIngredients = new Set([
      ...standardRecipe.map(r => r.ingredientId),
      ...actualRecipe.map(r => r.ingredientId),
    ]);

    for (const ingredientId of allIngredients) {
      const standardLine = standardRecipe.find(r => r.ingredientId === ingredientId);
      const actualLine = actualRecipe.find(r => r.ingredientId === ingredientId);
      const unitCost = ingredientCosts.get(ingredientId) || 0;

      const standardQuantity = standardLine?.quantity || 0;
      const actualQuantity = actualLine?.quantity || 0;
      const variance = actualQuantity - standardQuantity;
      const variancePercent = standardQuantity > 0 ? (variance / standardQuantity) * 100 : 0;
      const costImpact = variance * unitCost;

      varianceAnalysis.push({
        ingredientId,
        standardQuantity,
        actualQuantity,
        variance,
        variancePercent,
        costImpact,
      });
    }

    return varianceAnalysis.sort((a, b) => Math.abs(b.costImpact) - Math.abs(a.costImpact));
  }
}

// Export singleton instance
export const recipeCostingEngine = RecipeCostingEngine;
