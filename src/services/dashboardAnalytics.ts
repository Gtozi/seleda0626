/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Real-time Dashboard Analytics Service
 * Real-time dashboard configuration and analytics data
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
export interface DashboardConfiguration {
  id: string;
  userId: string;
  dashboardName: string;
  description?: string;
  layout: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  }>;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    config: Record<string, any>;
    dataSource: string;
    refreshInterval?: number;
  }>;
  filters: Record<string, any>;
  refreshInterval: number;
  isDefault: boolean;
  isShared: boolean;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'trend' | 'list';
  title: string;
  config: Record<string, any>;
  dataSource: string;
  data?: any;
  refreshInterval?: number;
  lastUpdated?: string;
}

export interface RealTimeMetrics {
  timestamp: string;
  outletId: string;
  metrics: {
    currentRevenue: number;
    ordersToday: number;
    averageCheck: number;
    activeTables: number;
    waitTime: number;
    serverCount: number;
    kitchenOrders: number;
  };
  comparisons: {
    revenueVsYesterday: number;
    ordersVsYesterday: number;
    revenueVsTarget: number;
    ordersVsTarget: number;
  };
}

export interface DashboardData {
  dashboardId: string;
  timestamp: string;
  widgets: Array<{
    widgetId: string;
    data: any;
    lastUpdated: string;
  }>;
  filters: Record<string, any>;
}

// Dashboard Configuration CRUD operations
export async function fetchDashboardConfigurations(userId?: string): Promise<DashboardConfiguration[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<DashboardConfiguration[]>(`/dashboard-configurations${queryString}`);
}

export async function fetchDashboardConfigurationById(id: string): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>(`/dashboard-configurations/${id}`);
}

export async function createDashboardConfiguration(config: Partial<DashboardConfiguration>): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>('/dashboard-configurations', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function updateDashboardConfiguration(id: string, config: Partial<DashboardConfiguration>): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>(`/dashboard-configurations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function deleteDashboardConfiguration(id: string): Promise<void> {
  await apiRequest<void>(`/dashboard-configurations/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefaultDashboard(id: string): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>(`/dashboard-configurations/${id}/set-default`, {
    method: 'POST',
  });
}

export async function shareDashboard(
  id: string,
  sharedWith: string[]
): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>(`/dashboard-configurations/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ sharedWith }),
  });
}

// Real-time metrics
export async function getRealTimeMetrics(outletId: string): Promise<RealTimeMetrics> {
  return apiRequest<RealTimeMetrics>(`/dashboard-analytics/real-time/${outletId}`);
}

export async function getDashboardData(
  dashboardId: string,
  filters?: Record<string, any>
): Promise<DashboardData> {
  return apiRequest<DashboardData>(`/dashboard-analytics/data/${dashboardId}`, {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

// Widget data
export async function getWidgetData(
  widgetId: string,
  dataSource: string,
  filters?: Record<string, any>
): Promise<any> {
  return apiRequest(`/dashboard-analytics/widget/${widgetId}`, {
    method: 'POST',
    body: JSON.stringify({ dataSource, filters }),
  });
}

export async function refreshWidget(widgetId: string): Promise<any> {
  return apiRequest(`/dashboard-analytics/widget/${widgetId}/refresh`, {
    method: 'POST',
  });
}

// Dashboard templates
export async function createDashboardFromTemplate(
  templateId: string,
  userId: string,
  dashboardName: string
): Promise<DashboardConfiguration> {
  return apiRequest<DashboardConfiguration>('/dashboard-configurations/from-template', {
    method: 'POST',
    body: JSON.stringify({ templateId, userId, dashboardName }),
  });
}

export async function getDashboardTemplates(): Promise<Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: Array<{
    type: string;
    title: string;
    config: Record<string, any>;
  }>;
}>> {
  return apiRequest('/dashboard-configurations/templates');
}

// Dashboard Analytics Engine
export class DashboardAnalyticsEngine {
  /**
   * Calculate metric comparison
   */
  static calculateComparison(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format metric value
   */
  static formatMetric(value: number, format: 'currency' | 'number' | 'percent' | 'duration'): string {
    switch (format) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'number':
        return value.toLocaleString();
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'duration':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      default:
        return value.toString();
    }
  }

  /**
   * Determine metric status
   */
  static determineMetricStatus(
    actual: number,
    target: number,
    tolerance: number = 0.1
  ): 'above' | 'on' | 'below' {
    const upperBound = target * (1 + tolerance);
    const lowerBound = target * (1 - tolerance);
    
    if (actual > upperBound) return 'above';
    if (actual < lowerBound) return 'below';
    return 'on';
  }

  /**
   * Calculate dashboard health score
   */
  static calculateDashboardHealth(
    metrics: RealTimeMetrics
  ): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Check revenue vs target
    if (metrics.comparisons.revenueVsTarget < -10) {
      score -= 20;
      issues.push('Revenue significantly below target');
    }

    // Check wait time
    if (metrics.metrics.waitTime > 15) {
      score -= 15;
      issues.push('High wait times detected');
    }

    // Check active tables
    if (metrics.metrics.activeTables === 0 && metrics.metrics.ordersToday > 0) {
      score -= 10;
      issues.push('Table assignment issue detected');
    }

    // Check kitchen orders
    if (metrics.metrics.kitchenOrders > 20) {
      score -= 10;
      issues.push('Kitchen backlog building up');
    }

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) {
      status = 'excellent';
    } else if (score >= 70) {
      status = 'good';
    } else if (score >= 50) {
      status = 'fair';
    } else {
      status = 'poor';
    }

    return { score, status, issues };
  }

  /**
   * Generate widget configuration
   */
  static generateWidgetConfig(
    type: string,
    dataSource: string,
    options?: Record<string, any>
  ): DashboardWidget {
    const defaultConfigs: Record<string, Record<string, any>> = {
      metric: {
        showTrend: true,
        showComparison: true,
        format: 'currency',
        icon: 'trending-up',
      },
      chart: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      },
      table: {
        sortable: true,
        pagination: true,
        pageSize: 10,
        showExport: true,
      },
      gauge: {
        min: 0,
        max: 100,
        thresholds: [33, 66, 100],
        colors: ['#ef4444', '#f59e0b', '#10b981'],
      },
      trend: {
        showAverage: true,
        showTarget: true,
        period: '7d',
      },
      list: {
        showRanking: true,
        showChange: true,
        limit: 5,
      },
    };

    return {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: options?.title || 'Widget',
      config: { ...defaultConfigs[type], ...options },
      dataSource,
      refreshInterval: options?.refreshInterval || 300,
    };
  }

  /**
   * Validate dashboard configuration
   */
  static validateConfiguration(
    config: DashboardConfiguration
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.dashboardName || config.dashboardName.trim() === '') {
      errors.push('Dashboard name is required');
    }

    if (!config.userId) {
      errors.push('User ID is required');
    }

    if (!config.widgets || config.widgets.length === 0) {
      errors.push('At least one widget is required');
    }

    if (config.widgets && config.widgets.length > 20) {
      warnings.push('More than 20 widgets may impact performance');
    }

    if (config.refreshInterval < 60) {
      warnings.push('Refresh interval less than 60 seconds may cause performance issues');
    }

    // Check for duplicate widget IDs
    const widgetIds = config.widgets.map(w => w.id);
    const uniqueIds = new Set(widgetIds);
    if (widgetIds.length !== uniqueIds.size) {
      errors.push('Duplicate widget IDs detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Optimize dashboard layout
   */
  static optimizeLayout(
    widgets: DashboardWidget[]
  ): Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }> {
    const layout: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];
    let currentX = 0;
    let currentY = 0;
    const gridWidth = 12;

    for (const widget of widgets) {
      const width = widget.config.width || 4;
      const height = widget.config.height || 3;

      if (currentX + width > gridWidth) {
        currentX = 0;
        currentY += height;
      }

      layout.push({
        id: widget.id,
        x: currentX,
        y: currentY,
        w: width,
        h: height,
      });

      currentX += width;
    }

    return layout;
  }

  /**
   * Calculate data freshness
   */
  static calculateDataFreshness(lastUpdated: string): {
    isFresh: boolean;
    age: number;
    ageText: string;
    status: 'fresh' | 'stale' | 'expired';
  } {
    const now = new Date();
    const updated = new Date(lastUpdated);
    const age = (now.getTime() - updated.getTime()) / 1000; // seconds

    let status: 'fresh' | 'stale' | 'expired';
    if (age < 60) {
      status = 'fresh';
    } else if (age < 300) {
      status = 'stale';
    } else {
      status = 'expired';
    }

    let ageText: string;
    if (age < 60) {
      ageText = `${Math.floor(age)}s ago`;
    } else if (age < 3600) {
      ageText = `${Math.floor(age / 60)}m ago`;
    } else {
      ageText = `${Math.floor(age / 3600)}h ago`;
    }

    return {
      isFresh: status === 'fresh',
      age,
      ageText,
      status,
    };
  }

  /**
   * Generate dashboard summary
   */
  static generateDashboardSummary(
    config: DashboardConfiguration,
    metrics: RealTimeMetrics
  ): {
    name: string;
    widgetCount: number;
    lastUpdated: string;
    healthScore: number;
    healthStatus: string;
    keyMetrics: Array<{
      name: string;
      value: string;
      change: string;
    }>;
  } {
    const health = this.calculateDashboardHealth(metrics);

    const keyMetrics = [
      {
        name: 'Revenue',
        value: this.formatMetric(metrics.metrics.currentRevenue, 'currency'),
        change: `${metrics.comparisons.revenueVsYesterday.toFixed(1)}%`,
      },
      {
        name: 'Orders',
        value: this.formatMetric(metrics.metrics.ordersToday, 'number'),
        change: `${metrics.comparisons.ordersVsYesterday.toFixed(1)}%`,
      },
      {
        name: 'Average Check',
        value: this.formatMetric(metrics.metrics.averageCheck, 'currency'),
        change: 'N/A',
      },
    ];

    return {
      name: config.dashboardName,
      widgetCount: config.widgets.length,
      lastUpdated: new Date().toISOString(),
      healthScore: health.score,
      healthStatus: health.status,
      keyMetrics,
    };
  }
}

// Export singleton instance
export const dashboardAnalyticsEngine = DashboardAnalyticsEngine;
