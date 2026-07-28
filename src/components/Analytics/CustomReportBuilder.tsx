/**
 * Custom Report Builder
 * Drag-and-drop interface for creating custom reports with various widgets
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calendar,
  Filter,
  Download,
  Save,
  Plus,
  Trash2,
  GripVertical,
  X,
  Settings,
  Eye,
  FileText,
  DollarSign
} from 'lucide-react';

interface ReportWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'timeline';
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

interface SavedReport {
  reportId: string;
  name: string;
  description: string;
  widgets: ReportWidget[];
  createdAt: string;
  createdBy: string;
}

const widgetTemplates = [
  {
    id: 'occupancy-rate',
    type: 'metric' as const,
    title: 'Occupancy Rate',
    icon: LayoutDashboard,
    description: 'Current occupancy percentage'
  },
  {
    id: 'adr-metric',
    type: 'metric' as const,
    title: 'Average Daily Rate',
    icon: DollarSign,
    description: 'Average room rate'
  },
  {
    id: 'revenue-chart',
    type: 'chart' as const,
    title: 'Revenue Trend',
    icon: LineChart,
    description: 'Revenue over time'
  },
  {
    id: 'booking-chart',
    type: 'chart' as const,
    title: 'Bookings by Channel',
    icon: BarChart3,
    description: 'Booking distribution'
  },
  {
    id: 'segment-pie',
    type: 'chart' as const,
    title: 'Market Segments',
    icon: PieChart,
    description: 'Guest segment distribution'
  },
  {
    id: 'reservation-table',
    type: 'table' as const,
    title: 'Reservations',
    icon: Table,
    description: 'Reservation list'
  }
];

const mockSavedReports: SavedReport[] = [
  {
    reportId: 'RPT-001',
    name: 'Daily Operations',
    description: 'Key operational metrics for daily review',
    widgets: [],
    createdAt: '2026-06-15',
    createdBy: 'Admin'
  },
  {
    reportId: 'RPT-002',
    name: 'Revenue Analysis',
    description: 'Revenue trends and breakdown',
    widgets: [],
    createdAt: '2026-06-10',
    createdBy: 'Finance Manager'
  }
];

const MetricWidget = ({ title, value, change }: { title: string; value: string; change: number }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
    <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">{title}</h4>
    <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</div>
    <div className={`text-xs font-bold flex items-center gap-1 ${change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
      {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
    </div>
  </div>
);

const ChartWidget = ({ title, type }: { title: string; type: string }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs h-64">
    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{title}</h4>
    <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-950 rounded-xl">
      <div className="text-center">
        <BarChart3 size={32} className="text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Chart placeholder</p>
      </div>
    </div>
  </div>
);

export default function CustomReportBuilder() {
  const [mode, setMode] = useState<'builder' | 'saved'>('builder');
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const addWidget = (template: typeof widgetTemplates[0]) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: template.type,
      title: template.title,
      config: {},
      position: { x: 0, y: 0 },
      size: { w: 1, h: 1 }
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const renderWidget = (widget: ReportWidget) => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget title={widget.title} value="87.5%" change={5.2} />;
      case 'chart':
        return <ChartWidget title={widget.title} type="bar" />;
      case 'table':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{widget.title}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400">ID</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400">Guest</th>
                    <th className="text-right py-2 text-slate-600 dark:text-slate-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-slate-900 dark:text-white">RES-001</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">John Smith</td>
                    <td className="py-2 text-right text-slate-900 dark:text-white">$450</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-900 dark:text-white">RES-002</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">Sarah Johnson</td>
                    <td className="py-2 text-right text-slate-900 dark:text-white">$320</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl">Unknown widget type</div>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="custom-report-builder">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Report Builder</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Custom Reports</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode(mode === 'builder' ? 'saved' : 'builder')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
              mode === 'builder'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {mode === 'builder' ? <FileText size={14} /> : <LayoutDashboard size={14} />}
            {mode === 'builder' ? 'Builder' : 'Saved Reports'}
          </button>
          {mode === 'builder' && (
            <>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                <Eye size={14} /> {isPreview ? 'Edit' : 'Preview'}
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <Save size={14} /> Save Report
              </button>
            </>
          )}
        </div>
      </div>

      {mode === 'builder' ? (
        <>
          {/* Report Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Report Name</label>
                <input
                  type="text"
                  placeholder="Enter report name..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          {!isPreview && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Widget Library */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Widget Library
                  </h3>
                  <div className="space-y-2">
                    {widgetTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => addWidget(template)}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Icon size={16} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{template.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{template.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="lg:col-span-3">
                <div className="bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-3xl min-h-[500px]">
                  {widgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center">
                      <LayoutDashboard size={48} className="text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No widgets added</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-500">Select widgets from the library to build your report</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {widgets.map((widget) => (
                        <div
                          key={widget.id}
                          className="relative group"
                        >
                          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => removeWidget(widget.id)}
                              className="p-1 bg-rose-100 dark:bg-rose-900/30 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50"
                            >
                              <Trash2 size={14} className="text-rose-600 dark:text-rose-400" />
                            </button>
                          </div>
                          <div className="cursor-move">
                            {renderWidget(widget)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isPreview && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{reportName || 'Untitled Report'}</h3>
              {reportDescription && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{reportDescription}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget) => (
                  <div key={widget.id}>
                    {renderWidget(widget)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Saved Reports */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Reports</h3>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
              <Plus size={14} /> New Report
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSavedReports.map((report) => (
              <div key={report.reportId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs hover:border-purple-500 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileText size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Settings size={14} className="text-slate-400" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{report.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{report.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Created: {report.createdAt}</span>
                  <span>By: {report.createdBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
