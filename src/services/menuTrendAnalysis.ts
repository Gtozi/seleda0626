/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Menu Item Trend Analysis Service
 * Menu item performance trend analysis and insights
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
export interface MenuItemTrend {
  id: string;
  menuItemId: string;
  outletId: string;
  periodStart: string;
  periodEnd: string;
  ordersCount: number;
  revenue: number;
  averageRating: number;
  popularityRank: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number;
  category: string;
  seasonalityIndex: number;
  createdAt: string;
}

export interface TrendAnalysis {
  menuItemId: string;
  menuItemName: string;
  currentPeriod: {
    orders: number;
    revenue: number;
    averageRating: number;
  };
  previousPeriod: {
    orders: number;
    revenue: number;
    averageRating: number;
  };
  trend: {
    ordersChange: number;
    ordersChangePercent: number;
    revenueChange: number;
    revenueChangePercent: number;
    ratingChange: number;
    direction: 'increasing' | 'stable' | 'decreasing';
  };
  seasonality: {
    index: number;
    season: 'peak' | 'normal' | 'low';
  };
}

export interface MenuPerformanceReport {
  period: { startDate: string; endDate: string };
  topPerformers: Array<{
    menuItemId: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }>;
  decliningItems: Array<{
    menuItemId: string;
    name: string;
    orders: number;
    revenue: number;
    trendPercent: number;
  }>;
  emergingItems: Array<{
    menuItemId: string;
    name: string;
    orders: number;
    revenue: number;
    trendPercent: number;
  }>;
  byCategory: Array<{
    category: string;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  }>;
}

// Menu Item Trend CRUD operations
export async function fetchMenuItemTrends(
  menuItemId?: string,
  outletId?: string,
  startDate?: string,
  endDate?: string,
  category?: string
): Promise<MenuItemTrend[]> {
  const params = new URLSearchParams();
  if (menuItemId) params.append('menuItemId', menuItemId);
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<MenuItemTrend[]>(`/menu-item-trends${queryString}`);
}

export async function fetchMenuItemTrendById(id: string): Promise<MenuItemTrend> {
  return apiRequest<MenuItemTrend>(`/menu-item-trends/${id}`);
}

export async function createMenuItemTrend(trend: Partial<MenuItemTrend>): Promise<MenuItemTrend> {
  return apiRequest<MenuItemTrend>('/menu-item-trends', {
    method: 'POST',
    body: JSON.stringify(trend),
  });
}

export async function updateMenuItemTrend(id: string, trend: Partial<MenuItemTrend>): Promise<MenuItemTrend> {
  return apiRequest<MenuItemTrend>(`/menu-item-trends/${id}`, {
    method: 'PUT',
    body: JSON.stringify(trend),
  });
}

export async function deleteMenuItemTrend(id: string): Promise<void> {
  await apiRequest<void>(`/menu-item-trends/${id}`, {
    method: 'DELETE',
  });
}

// Trend analysis
export async function analyzeMenuItemTrend(
  menuItemId: string,
  currentPeriodStart: string,
  currentPeriodEnd: string,
  previousPeriodStart: string,
  previousPeriodEnd: string
): Promise<TrendAnalysis> {
  return apiRequest<TrendAnalysis>('/menu-item-trends/analyze', {
    method: 'POST',
    body: JSON.stringify({
      menuItemId,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    }),
  });
}

export async function generateMenuPerformanceReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<MenuPerformanceReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<MenuPerformanceReport>(`/menu-item-trends/report?${params.toString()}`);
}

// Seasonality analysis
export async function calculateSeasonality(
  menuItemId: string,
  months: number = 12
): Promise<Array<{
  month: number;
  averageOrders: number;
  seasonalityIndex: number;
}>> {
  return apiRequest(`/menu-item-trends/seasonality/${menuItemId}?months=${months}`);
}

// Popularity ranking
export async function updatePopularityRankings(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<void> {
  await apiRequest('/menu-item-trends/update-rankings', {
    method: 'POST',
    body: JSON.stringify({ outletId, periodStart, periodEnd }),
  });
}

export async function getPopularityRankings(
  outletId: string,
  periodStart: string,
  periodEnd: string
): Promise<Array<{
  menuItemId: string;
  name: string;
  rank: number;
  orders: number;
  revenue: number;
}>> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('periodStart', periodStart);
  params.append('periodEnd', periodEnd);

  return apiRequest(`/menu-item-trends/rankings?${params.toString()}`);
}

// Menu Item Trend Analysis Engine
export class MenuTrendAnalysisEngine {
  /**
   * Calculate trend direction
   */
  static calculateTrendDirection(
    currentValue: number,
    previousValue: number
  ): 'increasing' | 'stable' | 'decreasing' {
    if (previousValue === 0) return 'stable';
    
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate trend percentage
   */
  static calculateTrendPercent(
    currentValue: number,
    previousValue: number
  ): number {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  /**
   * Calculate seasonality index
   */
  static calculateSeasonalityIndex(
    monthlyData: Array<{ month: number; value: number }>,
    targetMonth: number
  ): number {
    const targetMonthData = monthlyData.find(d => d.month === targetMonth);
    if (!targetMonthData) return 1;
    
    const monthlyAverage = monthlyData.reduce((sum, d) => sum + d.value, 0) / monthlyData.length;
    
    if (monthlyAverage === 0) return 1;
    return targetMonthData.value / monthlyAverage;
  }

  /**
   * Determine season
   */
  static determineSeason(seasonalityIndex: number): 'peak' | 'normal' | 'low' {
    if (seasonalityIndex >= 1.2) return 'peak';
    if (seasonalityIndex <= 0.8) return 'low';
    return 'normal';
  }

  /**
   * Calculate popularity ranking
   */
  static calculateRankings(items: Array<{ menuItemId: string; orders: number }>): Map<string, number> {
    const rankings = new Map<string, number>();
    
    const sorted = [...items].sort((a, b) => b.orders - a.orders);
    sorted.forEach((item, index) => {
      rankings.set(item.menuItemId, index + 1);
    });
    
    return rankings;
  }

  /**
   * Identify top performers
   */
  static identifyTopPerformers(
    items: MenuItemTrend[],
    topN: number = 10
  ): MenuItemTrend[] {
    return [...items]
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, topN);
  }

  /**
   * Identify declining items
   */
  static identifyDecliningItems(
    items: MenuItemTrend[],
    threshold: number = -10
  ): MenuItemTrend[] {
    return items.filter(item => item.trendPercent < threshold);
  }

  /**
   * Identify emerging items
   */
  static identifyEmergingItems(
    items: MenuItemTrend[],
    threshold: number = 20
  ): MenuItemTrend[] {
    return items.filter(item => 
      item.trendDirection === 'increasing' && item.trendPercent > threshold
    );
  }

  /**
   * Calculate category performance
   */
  static calculateCategoryPerformance(
    items: MenuItemTrend[]
  ): Map<string, { totalOrders: number; totalRevenue: number; averageRating: number; itemCount: number }> {
    const categoryPerformance = new Map<string, {
      totalOrders: number;
      totalRevenue: number;
      averageRating: number;
      itemCount: number;
    }>();
    
    for (const item of items) {
      if (!categoryPerformance.has(item.category)) {
        categoryPerformance.set(item.category, {
          totalOrders: 0,
          totalRevenue: 0,
          averageRating: 0,
          itemCount: 0,
        });
      }
      
      const category = categoryPerformance.get(item.category)!;
      category.totalOrders += item.ordersCount;
      category.totalRevenue += item.revenue;
      category.averageRating = (category.averageRating * category.itemCount + item.averageRating) / (category.itemCount + 1);
      category.itemCount++;
    }
    
    return categoryPerformance;
  }

  /**
   * Generate trend insights
   */
  static generateTrendInsights(
    trends: MenuItemTrend[]
  ): string[] {
    const insights: string[] = [];
    
    const increasingItems = trends.filter(t => t.trendDirection === 'increasing');
    const decreasingItems = trends.filter(t => t.trendDirection === 'decreasing');
    
    if (increasingItems.length > trends.length * 0.6) {
      insights.push('Most menu items showing positive growth trends');
    } else if (decreasingItems.length > trends.length * 0.4) {
      insights.push('Significant number of declining menu items - review menu strategy');
    }
    
    const topPerformers = this.identifyTopPerformers(trends, 3);
    if (topPerformers.length > 0) {
      const topRevenue = topPerformers.reduce((sum, t) => sum + t.revenue, 0);
      const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
      const concentration = (topRevenue / totalRevenue) * 100;
      
      if (concentration > 40) {
        insights.push(`Top 3 items account for ${concentration.toFixed(1)}% of revenue - high concentration risk`);
      }
    }
    
    const seasonalItems = trends.filter(t => t.seasonalityIndex > 1.3 || t.seasonalityIndex < 0.7);
    if (seasonalItems.length > trends.length * 0.3) {
      insights.push('Many items show strong seasonality - plan inventory accordingly');
    }
    
    return insights;
  }

  /**
   * Compare item performance
   */
  static compareItems(
    item1: MenuItemTrend,
    item2: MenuItemTrend
  ): {
    ordersDifference: number;
    ordersDifferencePercent: number;
    revenueDifference: number;
    revenueDifferencePercent: number;
    ratingDifference: number;
    performanceWinner: string;
  } {
    const ordersDifference = item1.ordersCount - item2.ordersCount;
    const ordersDifferencePercent = this.calculateTrendPercent(item1.ordersCount, item2.ordersCount);
    
    const revenueDifference = item1.revenue - item2.revenue;
    const revenueDifferencePercent = this.calculateTrendPercent(item1.revenue, item2.revenue);
    
    const ratingDifference = item1.averageRating - item2.averageRating;
    
    // Simple performance winner based on revenue
    const performanceWinner = item1.revenue > item2.revenue ? item1.menuItemId : item2.menuItemId;
    
    return {
      ordersDifference,
      ordersDifferencePercent,
      revenueDifference,
      revenueDifferencePercent,
      ratingDifference,
      performanceWinner,
    };
  }

  /**
   * Generate menu optimization recommendations
   */
  static generateOptimizationRecommendations(
    trends: MenuItemTrend[]
  ): Array<{
    menuItemId: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }> {
    const recommendations: Array<{
      menuItemId: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: string;
    }> = [];
    
    const decliningItems = this.identifyDecliningItems(trends, -15);
    for (const item of decliningItems) {
      recommendations.push({
        menuItemId: item.menuItemId,
        recommendation: 'Consider removing or repositioning this declining item',
        priority: 'high',
        expectedImpact: 'Reduce waste and improve menu focus',
      });
    }
    
    const emergingItems = this.identifyEmergingItems(trends, 25);
    for (const item of emergingItems) {
      recommendations.push({
        menuItemId: item.menuItemId,
        recommendation: 'Promote this emerging item more prominently',
        priority: 'medium',
        expectedImpact: 'Capitalize on growing popularity',
      });
    }
    
    const lowRatedItems = trends.filter(t => t.averageRating < 3.5 && t.ordersCount > 10);
    for (const item of lowRatedItems) {
      recommendations.push({
        menuItemId: item.menuItemId,
        recommendation: 'Review recipe or presentation for low-rated items',
        priority: 'high',
        expectedImpact: 'Improve customer satisfaction',
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate menu diversity score
   */
  static calculateMenuDiversityScore(
    trends: MenuItemTrend[]
  ): {
    diversityScore: number;
    categoryCount: number;
    revenueConcentration: number;
    assessment: string;
  } {
    const categories = new Set(trends.map(t => t.category));
    const categoryCount = categories.size;
    
    const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
    const sortedByRevenue = [...trends].sort((a, b) => b.revenue - a.revenue);
    const top3Revenue = sortedByRevenue.slice(0, 3).reduce((sum, t) => sum + t.revenue, 0);
    const revenueConcentration = (top3Revenue / totalRevenue) * 100;
    
    // Calculate diversity score (0-100)
    const diversityScore = Math.max(0, Math.min(100,
      (categoryCount / 10) * 50 + (100 - revenueConcentration) * 0.5
    ));
    
    let assessment: string;
    if (diversityScore >= 70) {
      assessment = 'Well-diversified menu with good category balance';
    } else if (diversityScore >= 50) {
      assessment = 'Moderately diverse menu - consider adding variety';
    } else {
      assessment = 'Low menu diversity - high concentration risk';
    }
    
    return {
      diversityScore,
      categoryCount,
      revenueConcentration,
      assessment,
    };
  }
}

// Export singleton instance
export const menuTrendAnalysisEngine = MenuTrendAnalysisEngine;
