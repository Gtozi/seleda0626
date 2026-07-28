/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Channel Attribution Tracking Service
 * Sales channel performance tracking and attribution analysis
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
export interface ChannelAttribution {
  id: string;
  channel: string;
  outletId: string;
  periodStart: string;
  periodEnd: string;
  ordersCount: number;
  revenue: number;
  averageCheck: number;
  growthRate: number;
  marketShare: number;
  conversionRate: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  createdAt: string;
}

export interface ChannelComparison {
  channel: string;
  currentPeriod: {
    orders: number;
    revenue: number;
    averageCheck: number;
  };
  previousPeriod: {
    orders: number;
    revenue: number;
    averageCheck: number;
  };
  growth: {
    ordersChange: number;
    ordersChangePercent: number;
    revenueChange: number;
    revenueChangePercent: number;
  };
  marketShare: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface AttributionReport {
  period: { startDate: string; endDate: string };
  totalRevenue: number;
  totalOrders: number;
  byChannel: ChannelAttribution[];
  channelShare: Array<{
    channel: string;
    revenueShare: number;
    orderShare: number;
  }>;
  topChannels: Array<{
    channel: string;
    revenue: number;
    growthRate: number;
  }>;
  emergingChannels: Array<{
    channel: string;
    growthRate: number;
    revenue: number;
  }>;
}

// Channel Attribution CRUD operations
export async function fetchChannelAttributions(
  channel?: string,
  outletId?: string,
  startDate?: string,
  endDate?: string
): Promise<ChannelAttribution[]> {
  const params = new URLSearchParams();
  if (channel) params.append('channel', channel);
  if (outletId) params.append('outletId', outletId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ChannelAttribution[]>(`/channel-attribution${queryString}`);
}

export async function fetchChannelAttributionById(id: string): Promise<ChannelAttribution> {
  return apiRequest<ChannelAttribution>(`/channel-attribution/${id}`);
}

export async function createChannelAttribution(attribution: Partial<ChannelAttribution>): Promise<ChannelAttribution> {
  return apiRequest<ChannelAttribution>('/channel-attribution', {
    method: 'POST',
    body: JSON.stringify(attribution),
  });
}

export async function updateChannelAttribution(id: string, attribution: Partial<ChannelAttribution>): Promise<ChannelAttribution> {
  return apiRequest<ChannelAttribution>(`/channel-attribution/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attribution),
  });
}

export async function deleteChannelAttribution(id: string): Promise<void> {
  await apiRequest<void>(`/channel-attribution/${id}`, {
    method: 'DELETE',
  });
}

// Channel comparison
export async function compareChannelPerformance(
  outletId: string,
  currentPeriodStart: string,
  currentPeriodEnd: string,
  previousPeriodStart: string,
  previousPeriodEnd: string
): Promise<ChannelComparison[]> {
  return apiRequest<ChannelComparison[]>('/channel-attribution/compare', {
    method: 'POST',
    body: JSON.stringify({
      outletId,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    }),
  });
}

// Attribution reporting
export async function generateAttributionReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<AttributionReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<AttributionReport>(`/channel-attribution/report?${params.toString()}`);
}

// Channel trends
export async function getChannelTrends(
  channel: string,
  outletId: string,
  periods: number = 12
): Promise<Array<{
  period: string;
  revenue: number;
  orders: number;
  averageCheck: number;
  growthRate: number;
}>> {
  return apiRequest(`/channel-attribution/trends/${channel}?outletId=${outletId}&periods=${periods}`);
}

// Market share calculation
export async function calculateMarketShare(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<Array<{
  channel: string;
  revenue: number;
  marketShare: number;
  competitorShare: number;
}>> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest(`/channel-attribution/market-share?${params.toString()}`);
}

// Channel Attribution Engine
export class ChannelAttributionEngine {
  /**
   * Calculate growth rate
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate market share
   */
  static calculateMarketShare(channelRevenue: number, totalMarketRevenue: number): number {
    if (totalMarketRevenue === 0) return 0;
    return (channelRevenue / totalMarketRevenue) * 100;
  }

  /**
   * Calculate conversion rate
   */
  static calculateConversionRate(conversions: number, impressions: number): number {
    if (impressions === 0) return 0;
    return (conversions / impressions) * 100;
  }

  /**
   * Calculate customer acquisition cost
   */
  static calculateCAC(marketingSpend: number, newCustomers: number): number {
    if (newCustomers === 0) return 0;
    return marketingSpend / newCustomers;
  }

  /**
   * Calculate customer lifetime value
   */
  static calculateCLV(
    averageOrderValue: number,
    purchaseFrequency: number,
    customerLifespan: number
  ): number {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  }

  /**
   * Calculate channel ROI
   */
  static calculateROI(revenue: number, cost: number): number {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  }

  /**
   * Determine trend direction
   */
  static determineTrend(growthRate: number): 'increasing' | 'stable' | 'decreasing' {
    if (growthRate > 5) return 'increasing';
    if (growthRate < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Identify emerging channels
   */
  static identifyEmergingChannels(
    channels: ChannelAttribution[],
    threshold: number = 20
  ): ChannelAttribution[] {
    return channels.filter(channel => 
      channel.growthRate > threshold && channel.revenue > 1000
    );
  }

  /**
   * Identify declining channels
   */
  static identifyDecliningChannels(
    channels: ChannelAttribution[],
    threshold: number = -10
  ): ChannelAttribution[] {
    return channels.filter(channel => channel.growthRate < threshold);
  }

  /**
   * Calculate channel attribution share
   */
  static calculateChannelShare(
    channels: ChannelAttribution[]
  ): Map<string, { revenueShare: number; orderShare: number }> {
    const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
    const totalOrders = channels.reduce((sum, c) => sum + c.ordersCount, 0);
    
    const shareMap = new Map<string, { revenueShare: number; orderShare: number }>();
    
    for (const channel of channels) {
      shareMap.set(channel.channel, {
        revenueShare: (channel.revenue / totalRevenue) * 100,
        orderShare: (channel.ordersCount / totalOrders) * 100,
      });
    }
    
    return shareMap;
  }

  /**
   * Generate channel insights
   */
  static generateChannelInsights(
    attributions: ChannelAttribution[]
  ): string[] {
    const insights: string[] = [];
    
    if (attributions.length === 0) return insights;
    
    const totalRevenue = attributions.reduce((sum, a) => sum + a.revenue, 0);
    const topChannel = attributions.reduce((max, a) => a.revenue > max.revenue ? a : max);
    const topChannelShare = (topChannel.revenue / totalRevenue) * 100;
    
    if (topChannelShare > 50) {
      insights.push(`${topChannel.channel} accounts for ${topChannelShare.toFixed(1)}% of revenue - high concentration risk`);
    }
    
    const emergingChannels = this.identifyEmergingChannels(attributions);
    if (emergingChannels.length > 0) {
      insights.push(`${emergingChannels.length} emerging channel(s) showing strong growth`);
    }
    
    const decliningChannels = this.identifyDecliningChannels(attributions);
    if (decliningChannels.length > 0) {
      insights.push(`${decliningChannels.length} declining channel(s) need attention`);
    }
    
    const averageGrowthRate = attributions.reduce((sum, a) => sum + a.growthRate, 0) / attributions.length;
    if (averageGrowthRate > 10) {
      insights.push('Overall channel performance showing strong growth');
    } else if (averageGrowthRate < -5) {
      insights.push('Overall channel performance declining - review marketing strategy');
    }
    
    return insights;
  }

  /**
   * Optimize channel mix
   */
  static optimizeChannelMix(
    channels: ChannelAttribution[],
    targetROI: number = 300
  ): Array<{
    channel: string;
    currentRevenue: number;
    currentROI: number;
    recommendedAction: string;
    potentialImpact: number;
  }> {
    return channels.map(channel => {
      const currentROI = this.calculateROI(channel.revenue, channel.customerAcquisitionCost);
      
      let recommendedAction: string;
      let potentialImpact: number;
      
      if (currentROI > targetROI) {
        recommendedAction = 'Increase investment';
        potentialImpact = channel.revenue * 0.2;
      } else if (currentROI > targetROI * 0.5) {
        recommendedAction = 'Maintain current investment';
        potentialImpact = 0;
      } else {
        recommendedAction = 'Reduce or eliminate investment';
        potentialImpact = -channel.revenue * 0.3;
      }
      
      return {
        channel: channel.channel,
        currentRevenue: channel.revenue,
        currentROI,
        recommendedAction,
        potentialImpact,
      };
    }).sort((a, b) => b.potentialImpact - a.potentialImpact);
  }

  /**
   * Calculate channel cannibalization
   */
  static calculateCannibalization(
    primaryChannel: ChannelAttribution,
    secondaryChannel: ChannelAttribution
  ): {
    cannibalizationRate: number;
    cannibalizedRevenue: number;
    netImpact: number;
  } {
    // Simplified cannibalization calculation
    const cannibalizationRate = Math.min(0.3, secondaryChannel.growthRate / 100);
    const cannibalizedRevenue = primaryChannel.revenue * cannibalizationRate;
    const netImpact = secondaryChannel.revenue - cannibalizedRevenue;
    
    return {
      cannibalizationRate,
      cannibalizedRevenue,
      netImpact,
    };
  }

  /**
   * Generate attribution summary
   */
  static generateAttributionSummary(
    report: AttributionReport
  ): {
    totalRevenue: string;
    totalOrders: string;
    topChannel: string;
    topChannelShare: string;
    averageGrowthRate: string;
    insights: string[];
  } {
    const totalRevenue = `$${report.totalRevenue.toFixed(2)}`;
    const totalOrders = report.totalOrders.toString();
    
    const topChannel = report.topChannels[0]?.channel || 'N/A';
    const topChannelShare = report.channelShare[0]?.revenueShare.toFixed(1) + '%' || 'N/A';
    
    const averageGrowthRate = (
      report.byChannel.reduce((sum, c) => sum + c.growthRate, 0) / report.byChannel.length
    ).toFixed(1) + '%';
    
    const insights = this.generateChannelInsights(report.byChannel);
    
    return {
      totalRevenue,
      totalOrders,
      topChannel,
      topChannelShare,
      averageGrowthRate,
      insights,
    };
  }

  /**
   * Calculate multi-touch attribution
   */
  static calculateMultiTouchAttribution(
    touchpoints: Array<{
      channel: string;
      touchOrder: number;
      conversionValue: number;
    }>
  ): Map<string, number> {
    const attribution = new Map<string, number>();
    
    // Simple linear attribution model
    const touchpointCount = touchpoints.length;
    const valuePerTouch = touchpoints.reduce((sum, t) => sum + t.conversionValue, 0) / touchpointCount;
    
    for (const touchpoint of touchpoints) {
      const currentValue = attribution.get(touchpoint.channel) || 0;
      attribution.set(touchpoint.channel, currentValue + valuePerTouch);
    }
    
    return attribution;
  }
}

// Export singleton instance
export const channelAttributionEngine = ChannelAttributionEngine;
