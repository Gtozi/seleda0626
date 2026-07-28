/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Custom Report Builder Service
 * Custom report template creation and execution
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
export interface ReportTemplate {
  id: string;
  templateName: string;
  description?: string;
  reportType: 'sales' | 'inventory' | 'labor' | 'financial' | 'performance' | 'custom';
  dataSources: Array<{
    table: string;
    alias?: string;
    joins?: Array<{ table: string; on: string; type: 'inner' | 'left' | 'right' }>;
  }>;
  metrics: Array<{
    name: string;
    expression: string;
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
    alias: string;
    format?: string;
  }>;
  filters: Record<string, any>;
  groupings: Array<{
    field: string;
    alias?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
  chartConfig: {
    type: 'bar' | 'line' | 'pie' | 'table' | 'metric';
    showLegend?: boolean;
    showGrid?: boolean;
    colors?: string[];
  };
  scheduleConfig: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
  };
  createdBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  templateId: string;
  executedBy: string;
  executionDate: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  resultData: any;
  fileUrl?: string;
  fileFormat?: string;
  rowCount?: number;
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface ReportData {
  columns: Array<{
    name: string;
    type: string;
    format?: string;
  }>;
  rows: Array<Record<string, any>>;
  summary: {
    totalRows: number;
    executionTime: number;
    generatedAt: string;
  };
}

// Report Template CRUD operations
export async function fetchReportTemplates(
  reportType?: string,
  createdBy?: string,
  isPublic?: boolean
): Promise<ReportTemplate[]> {
  const params = new URLSearchParams();
  if (reportType) params.append('reportType', reportType);
  if (createdBy) params.append('createdBy', createdBy);
  if (isPublic !== undefined) params.append('isPublic', isPublic.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ReportTemplate[]>(`/report-templates${queryString}`);
}

export async function fetchReportTemplateById(id: string): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>(`/report-templates/${id}`);
}

export async function createReportTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>('/report-templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
}

export async function updateReportTemplate(id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>(`/report-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
}

export async function deleteReportTemplate(id: string): Promise<void> {
  await apiRequest<void>(`/report-templates/${id}`, {
    method: 'DELETE',
  });
}

export async function duplicateReportTemplate(id: string, newName: string): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>(`/report-templates/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify({ newName }),
  });
}

// Report Execution operations
export async function executeReport(
  templateId: string,
  parameters?: Record<string, any>
): Promise<ReportExecution> {
  return apiRequest<ReportExecution>('/report-executions', {
    method: 'POST',
    body: JSON.stringify({ templateId, parameters }),
  });
}

export async function fetchReportExecutions(
  templateId?: string,
  executedBy?: string,
  status?: string
): Promise<ReportExecution[]> {
  const params = new URLSearchParams();
  if (templateId) params.append('templateId', templateId);
  if (executedBy) params.append('executedBy', executedBy);
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ReportExecution[]>(`/report-executions${queryString}`);
}

export async function fetchReportExecutionById(id: string): Promise<ReportExecution> {
  return apiRequest<ReportExecution>(`/report-executions/${id}`);
}

export async function downloadReport(
  executionId: string,
  format: 'pdf' | 'excel' | 'csv'
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/report-executions/${executionId}/download?format=${format}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(error.error || error.message || 'Download failed');
  }

  return response.blob();
}

export async function scheduleReport(
  templateId: string,
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  }
): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>(`/report-templates/${templateId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(schedule),
  });
}

// Report data operations
export async function getReportData(
  templateId: string,
  parameters?: Record<string, any>
): Promise<ReportData> {
  return apiRequest<ReportData>('/report-builder/data', {
    method: 'POST',
    body: JSON.stringify({ templateId, parameters }),
  });
}

export async function previewReport(
  template: Partial<ReportTemplate>,
  parameters?: Record<string, any>
): Promise<ReportData> {
  return apiRequest<ReportData>('/report-builder/preview', {
    method: 'POST',
    body: JSON.stringify({ template, parameters }),
  });
}

// Report templates
export async function getReportTemplateCategories(): Promise<Array<{
  category: string;
  description: string;
  templateCount: number;
}>> {
  return apiRequest('/report-builder/categories');
}

export async function createReportFromPreset(
  presetId: string,
  customization: Partial<ReportTemplate>
): Promise<ReportTemplate> {
  return apiRequest<ReportTemplate>('/report-builder/from-preset', {
    method: 'POST',
    body: JSON.stringify({ presetId, customization }),
  });
}

// Report Builder Engine
export class ReportBuilderEngine {
  /**
   * Validate report template
   */
  static validateTemplate(template: Partial<ReportTemplate>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template.templateName || template.templateName.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.reportType) {
      errors.push('Report type is required');
    }

    if (!template.dataSources || template.dataSources.length === 0) {
      errors.push('At least one data source is required');
    }

    if (!template.metrics || template.metrics.length === 0) {
      errors.push('At least one metric is required');
    }

    if (template.metrics && template.metrics.length > 20) {
      warnings.push('More than 20 metrics may impact performance');
    }

    if (template.groupings && template.groupings.length > 10) {
      warnings.push('More than 10 groupings may impact readability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate SQL query from template
   */
  static generateSQL(template: ReportTemplate, parameters?: Record<string, any>): string {
    const selectClause = template.metrics.map(m => `${m.expression} AS ${m.alias}`).join(', ');
    const fromClause = template.dataSources[0].table;
    
    let joinClause = '';
    if (template.dataSources[0].joins) {
      joinClause = template.dataSources[0].joins.map(j => 
        ` ${j.type} JOIN ${j.table} ON ${j.on}`
      ).join('');
    }

    let whereClause = '';
    if (template.filters && Object.keys(template.filters).length > 0) {
      const conditions = Object.entries(template.filters).map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key} = '${value}'`;
        } else if (Array.isArray(value)) {
          return `${key} IN (${value.map(v => `'${v}'`).join(', ')})`;
        }
        return `${key} = ${value}`;
      });
      whereClause = ` WHERE ${conditions.join(' AND ')}`;
    }

    let groupByClause = '';
    if (template.groupings && template.groupings.length > 0) {
      groupByClause = ` GROUP BY ${template.groupings.map(g => g.field).join(', ')}`;
    }

    let orderByClause = '';
    if (template.groupings && template.groupings.some(g => g.sortOrder)) {
      const orderings = template.groupings.filter(g => g.sortOrder).map(g => 
        `${g.field} ${g.sortOrder?.toUpperCase()}`
      );
      orderByClause = ` ORDER BY ${orderings.join(', ')}`;
    }

    return `SELECT ${selectClause} FROM ${fromClause}${joinClause}${whereClause}${groupByClause}${orderByClause}`;
  }

  /**
   * Format report data
   */
  static formatData(
    data: ReportData,
    format: 'table' | 'chart' | 'metric'
  ): any {
    switch (format) {
      case 'table':
        return this.formatAsTable(data);
      case 'chart':
        return this.formatAsChart(data);
      case 'metric':
        return this.formatAsMetric(data);
      default:
        return data;
    }
  }

  /**
   * Format as table
   */
  static formatAsTable(data: ReportData): any {
    return {
      type: 'table',
      columns: data.columns,
      rows: data.rows,
      summary: data.summary,
    };
  }

  /**
   * Format as chart
   */
  static formatAsChart(data: ReportData): any {
    const labels = data.rows.map(row => row[Object.keys(row)[0]]);
    const datasets = data.columns.slice(1).map(col => ({
      label: col.name,
      data: data.rows.map(row => row[col.name]),
    }));

    return {
      type: 'chart',
      labels,
      datasets,
      summary: data.summary,
    };
  }

  /**
   * Format as metric
   */
  static formatAsMetric(data: ReportData): any {
    if (data.rows.length === 0) {
      return {
        type: 'metric',
        value: 0,
        label: 'No data',
      };
    }

    const firstMetric = data.columns[0];
    const value = data.rows[0][firstMetric.name];

    return {
      type: 'metric',
      value,
      label: firstMetric.name,
      format: firstMetric.format,
    };
  }

  /**
   * Calculate execution time
   */
  static calculateExecutionTime(startTime: number, endTime: number): number {
    return endTime - startTime;
  }

  /**
   * Estimate execution time
   */
  static estimateExecutionTime(
    template: ReportTemplate,
    rowCount: number
  ): number {
    // Simple estimation based on complexity
    const complexityFactor = template.metrics.length * 0.1 + template.groupings.length * 0.05;
    return Math.round(rowCount * complexityFactor);
  }

  /**
   * Generate report summary
   */
  static generateSummary(execution: ReportExecution): {
    status: string;
    executionTime: string;
    rowCount: string;
    generatedAt: string;
    error?: string;
  } {
    return {
      status: execution.status,
      executionTime: execution.executionTimeMs 
        ? `${execution.executionTimeMs}ms` 
        : 'N/A',
      rowCount: execution.rowCount?.toString() || 'N/A',
      generatedAt: execution.executionDate,
      error: execution.errorMessage,
    };
  }

  /**
   * Create preset template
   */
  static createPresetTemplate(
    type: 'sales' | 'inventory' | 'labor' | 'financial'
  ): Partial<ReportTemplate> {
    const presets: Record<string, Partial<ReportTemplate>> = {
      sales: {
        templateName: 'Sales Report',
        reportType: 'sales',
        dataSources: [{ table: 'fb_orders' }],
        metrics: [
          { name: 'Total Revenue', expression: 'SUM(total_amount)', aggregation: 'sum', alias: 'total_revenue' },
          { name: 'Total Orders', expression: 'COUNT(*)', aggregation: 'count', alias: 'total_orders' },
        ],
        groupings: [{ field: 'DATE(order_date)', alias: 'order_date', sortOrder: 'asc' }],
        chartConfig: { type: 'line' },
      },
      inventory: {
        templateName: 'Inventory Report',
        reportType: 'inventory',
        dataSources: [{ table: 'fb_inventory' }],
        metrics: [
          { name: 'Total Items', expression: 'SUM(quantity)', aggregation: 'sum', alias: 'total_quantity' },
          { name: 'Total Value', expression: 'SUM(quantity * unit_cost)', aggregation: 'sum', alias: 'total_value' },
        ],
        groupings: [{ field: 'category', alias: 'category' }],
        chartConfig: { type: 'bar' },
      },
      labor: {
        templateName: 'Labor Report',
        reportType: 'labor',
        dataSources: [{ table: 'fb_staff_schedules' }],
        metrics: [
          { name: 'Total Hours', expression: 'SUM(scheduled_hours)', aggregation: 'sum', alias: 'total_hours' },
          { name: 'Total Cost', expression: 'SUM(labor_cost)', aggregation: 'sum', alias: 'total_cost' },
        ],
        groupings: [{ field: 'role', alias: 'role' }],
        chartConfig: { type: 'pie' },
      },
      financial: {
        templateName: 'Financial Report',
        reportType: 'financial',
        dataSources: [{ table: 'fb_profit_loss_by_outlet' }],
        metrics: [
          { name: 'Revenue', expression: 'SUM(revenue)', aggregation: 'sum', alias: 'revenue' },
          { name: 'Net Profit', expression: 'SUM(net_profit)', aggregation: 'sum', alias: 'net_profit' },
          { name: 'Profit Margin', expression: 'AVG(profit_margin)', aggregation: 'avg', alias: 'profit_margin' },
        ],
        groupings: [{ field: 'outlet_id', alias: 'outlet_id' }],
        chartConfig: { type: 'table' },
      },
    };

    return presets[type];
  }

  /**
   * Optimize report performance
   */
  static optimizePerformance(template: ReportTemplate): {
    recommendations: string[];
    estimatedImprovement: number;
  } {
    const recommendations: string[] = [];
    let estimatedImprovement = 0;

    if (template.metrics.length > 10) {
      recommendations.push('Reduce number of metrics to improve query performance');
      estimatedImprovement += 20;
    }

    if (template.groupings && template.groupings.length > 5) {
      recommendations.push('Reduce number of groupings for faster aggregation');
      estimatedImprovement += 15;
    }

    if (!template.filters || Object.keys(template.filters).length === 0) {
      recommendations.push('Add date range filters to limit data scope');
      estimatedImprovement += 30;
    }

    if (template.chartConfig.type === 'table' && template.dataSources[0].table.includes('orders')) {
      recommendations.push('Consider using summary tables for large order data');
      estimatedImprovement += 25;
    }

    return {
      recommendations,
      estimatedImprovement: Math.min(estimatedImprovement, 80),
    };
  }
}

// Export singleton instance
export const reportBuilderEngine = ReportBuilderEngine;
