import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, AlertCircle, FileSpreadsheet, Download, ArrowRight, Calendar, Filter, ChevronDown, X, Printer, RefreshCw } from 'lucide-react';
import { ContentLoader, MetricsSkeleton } from './LoadingStates';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// ── KPI Tile ───────────────────────────────────────────────────

export interface KpiTile {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
  sub?: string;
}

// ── Chart Card ─────────────────────────────────────────────────

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, actions, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Table Card ─────────────────────────────────────────────────

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableCardProps {
  title: string;
  actions?: React.ReactNode;
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
  className?: string;
}

export function TableCard({ title, actions, columns, rows, className = '' }: TableCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs ${className}`}>
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        {actions}
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-950/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── KPI Grid ───────────────────────────────────────────────────

export interface KpiGridProps {
  tiles: KpiTile[];
  columns?: number;
}

export function KpiGrid({ tiles, columns = 4 }: KpiGridProps) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    7: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${colClass} gap-4`}>
      {tiles.map((kpi, i) => {
        const Icon = kpi.icon;
        const positive = kpi.isPositive ?? true;
        const trendColor = positive ? 'text-emerald-500' : 'text-rose-500';
        const colorClass = kpi.colorClass || 'text-slate-500';
        const bgClass = kpi.bgClass || 'bg-slate-50 dark:bg-slate-800/50';
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl transition-all hover:shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 w-fit rounded-xl ${bgClass} ${colorClass}`}>
                <Icon size={18} />
              </div>
              {kpi.trend && (
                <span className={`text-[9px] font-black ${trendColor} bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{kpi.value}</h3>
            {kpi.sub && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{kpi.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard Template ─────────────────────────────────────────

export interface DashboardTemplateProps {
  id?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  kpiTiles?: KpiTile[];
  kpiColumns?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: React.ReactNode;
}

/**
 * Shared dashboard shell used by all department portals.
 * Provides consistent header, KPI card layout, loading/error states, and responsive section grid.
 * Specific dashboard content (charts, tables, alerts) is passed as children.
 */
export function DashboardTemplate({
  id,
  title,
  subtitle,
  actions,
  kpiTiles,
  kpiColumns = 4,
  loading = false,
  error,
  onRetry,
  children,
}: DashboardTemplateProps) {
  if (loading) {
    return (
      <div className="space-y-6" id={id}>
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>}
              {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
            </div>
          </div>
        )}
        <MetricsSkeleton count={kpiColumns} />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl animate-pulse">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
            <div className="h-72 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
          </div>
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl animate-pulse">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
            <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" id={id}>
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-8 text-center">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
          <p className="text-sm text-rose-700 dark:text-rose-400 font-bold mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition text-[10px] font-black uppercase tracking-widest"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id={id}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {kpiTiles && kpiTiles.length > 0 && (
        <KpiGrid tiles={kpiTiles} columns={kpiColumns} />
      )}

      {children}
    </div>
  );
}

// ── Reporting System Components ───────────────────────────────────
// Standardized reporting components based on Finance Portal structure

export interface ReportItem {
  id: string;
  title: string;
  period: string;
  status: 'Finalized' | 'Draft' | 'Live' | 'In Review' | 'Audit Pending' | 'Synced';
  format: string;
  lastRun: string;
  description?: string;
  category?: string;
}

export interface ReportCardProps {
  report: ReportItem;
  onClick: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ReportCard({ report, onClick, onDownload, className = '' }: ReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalized':
      case 'Synced':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Draft':
      case 'In Review':
        return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400';
      case 'Live':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
      case 'Audit Pending':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-600 active:scale-[0.98] ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
          <FileSpreadsheet size={20} />
        </div>
        {onDownload && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={onDownload}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Download size={12} />
            </button>
          </div>
        )}
      </div>
      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{report.title}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{report.period}</p>
      {report.description && (
        <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{report.description}</p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
        <span className="text-[9px] font-bold text-slate-400">Run: {report.lastRun}</span>
      </div>
    </div>
  );
}

export interface ReportGridProps {
  reports: ReportItem[];
  onReportClick: (reportId: string) => void;
  onReportDownload?: (reportId: string) => void;
  columns?: number;
  showCategories?: boolean;
}

export function ReportGrid({ reports, onReportClick, onReportDownload, columns = 3, showCategories = false }: ReportGridProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  if (showCategories) {
    const grouped = reports.reduce((acc, report) => {
      const category = report.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(report);
      return acc;
    }, {} as Record<string, ReportItem[]>);

    return (
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, categoryReports]) => (
          <div key={category}>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight mb-4 px-2">{category}</h3>
            <div className={`grid ${colClass} gap-6`}>
              {categoryReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => onReportClick(report.id)}
                  onDownload={onReportDownload ? () => onReportDownload(report.id) : undefined}
                  className=""
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-6 animate-fade-in`}>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onClick={() => onReportClick(report.id)}
          onDownload={onReportDownload ? () => onReportDownload(report.id) : undefined}
          className=""
        />
      ))}
    </div>
  );
}

export interface ReportTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showDateRange?: boolean;
  dateRange?: DateRangeType;
  onDateRangeChange?: (range: DateRangeType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  className?: string;
}

// ── Date Range Selector ─────────────────────────────────────────────

export type DateRangeType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ytd' | 'custom';

export interface DateRangeSelectorProps {
  selectedRange: DateRangeType;
  onRangeChange: (range: DateRangeType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangeSelector({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  className = ''
}: DateRangeSelectorProps) {
  const [showCustomDates, setShowCustomDates] = useState(selectedRange === 'custom');

  const handleRangeChange = (range: DateRangeType) => {
    onRangeChange(range);
    setShowCustomDates(range === 'custom');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { value: 'daily' as DateRangeType, label: 'Daily' },
          { value: 'weekly' as DateRangeType, label: 'Weekly' },
          { value: 'monthly' as DateRangeType, label: 'Monthly' },
          { value: 'quarterly' as DateRangeType, label: 'Quarterly' },
          { value: 'ytd' as DateRangeType, label: 'YTD' },
          { value: 'custom' as DateRangeType, label: 'Custom' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleRangeChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              selectedRange === option.value
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showCustomDates && onCustomDateChange && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
          <input
            type="date"
            value={customStartDate || ''}
            onChange={(e) => onCustomDateChange(e.target.value, customEndDate || '')}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
          />
          <span className="text-slate-400 text-[10px] font-bold">to</span>
          <input
            type="date"
            value={customEndDate || ''}
            onChange={(e) => onCustomDateChange(customStartDate || '', e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
          />
        </div>
      )}
    </div>
  );
}

// ── Report Template ───────────────────────────────────────────────

export function ReportTemplate({
  title,
  subtitle,
  children,
  filters,
  actions,
  showBackButton = false,
  onBack,
  showDateRange = false,
  dateRange = 'monthly',
  onDateRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  className = ''
}: ReportTemplateProps) {
  return (
    <div className={`space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <ArrowRight className="rotate-180" size={18} />
            </button>
          )}
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showDateRange && onDateRangeChange && (
            <DateRangeSelector
              selectedRange={dateRange}
              onRangeChange={onDateRangeChange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={onCustomDateChange}
            />
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>

      {filters && <div className="animate-in fade-in slide-in-from-bottom-4">{filters}</div>}

      <div className="animate-in fade-in slide-in-from-bottom-4">{children}</div>
    </div>
  );
}

export interface ExportOption {
  format: 'pdf' | 'excel' | 'csv';
  label: string;
  icon: LucideIcon;
  action: () => void;
}

export interface ReportExportProps {
  options: ExportOption[];
  onPrint?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function ReportExport({ options, onPrint, onRefresh, className = '' }: ReportExportProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      )}
      {onPrint && (
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 transition-all"
        >
          <Printer size={14} />
          Print
        </button>
      )}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-lg transition-all">
          <Download size={14} />
          Export
          <ChevronDown size={12} />
        </button>
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[150px]">
          <div className="p-1 space-y-1">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={option.action}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AreaChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  strokeWidth?: number;
  height?: number;
  className?: string;
  actions?: React.ReactNode;
}

export function AreaChartCard({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  color = '#6366f1',
  strokeWidth = 3,
  height = 288,
  className = '',
  actions
}: AreaChartCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false} 
              fontSize={10} 
              fontWeight={700}
              tick={{ fill: '#94a3b8' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={10} 
              fontWeight={700}
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(val) => `$${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={strokeWidth} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartCard({
  title,
  data,
  height = 256,
  className = '',
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80
}: PieChartCardProps) {
  const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8', '#8b5cf6', '#06b6d4'];

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '10px' }} />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div className="space-y-2 mt-4">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || defaultColors[i % defaultColors.length] }} />
                <span className="text-slate-500">{item.name}</span>
              </div>
              <span className="text-slate-900 dark:text-white">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  className?: string;
  actions?: React.ReactNode;
  horizontal?: boolean;
}

export function BarChartCard({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  color = '#6366f1',
  height = 288,
  className = '',
  actions,
  horizontal = false
}: BarChartCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout={horizontal ? 'horizontal' : 'vertical'}>
            <XAxis 
              dataKey={horizontal ? dataKey : xAxisKey}
              axisLine={false} 
              tickLine={false} 
              fontSize={10} 
              fontWeight={700}
              tick={{ fill: '#94a3b8' }} 
              type={horizontal ? 'number' : 'category'}
            />
            <YAxis 
              dataKey={horizontal ? xAxisKey : dataKey}
              axisLine={false} 
              tickLine={false} 
              fontSize={10} 
              fontWeight={700}
              tick={{ fill: '#94a3b8' }}
              type={horizontal ? 'category' : 'number'}
              tickFormatter={(val) => typeof val === 'number' ? `$${val/1000}k` : val}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
