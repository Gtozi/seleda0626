/**
 * Reports Component
 * Provides revenue reports, occupancy reports, ADR reports, RevPAR reports, channel reports, segment reports, and custom reports
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  DollarSign,
  Bed,
  Users,
  Globe,
  Settings,
  Plus,
  Eye
} from 'lucide-react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState<'revenue' | 'occupancy' | 'adr' | 'revpar' | 'channel' | 'segment' | 'custom'>('revenue');
  const [dateRange, setDateRange] = useState('30');

  const reports = useMemo(() => [
    { 
      id: '1', 
      name: 'Daily Revenue Report', 
      category: 'revenue',
      description: 'Day-by-day revenue breakdown with segment analysis',
      lastGenerated: '2024-01-28',
      format: 'PDF',
      size: '2.4 MB',
      schedule: 'Daily'
    },
    { 
      id: '2', 
      name: 'Monthly Revenue Summary', 
      category: 'revenue',
      description: 'Monthly revenue trends and YoY comparison',
      lastGenerated: '2024-01-25',
      format: 'Excel',
      size: '1.8 MB',
      schedule: 'Monthly'
    },
    { 
      id: '3', 
      name: 'Occupancy Analysis', 
      category: 'occupancy',
      description: 'Room occupancy by type and channel',
      lastGenerated: '2024-01-28',
      format: 'PDF',
      size: '3.1 MB',
      schedule: 'Weekly'
    },
    { 
      id: '4', 
      name: 'ADR Performance Report', 
      category: 'adr',
      description: 'Average daily rate by segment and channel',
      lastGenerated: '2024-01-27',
      format: 'Excel',
      size: '1.5 MB',
      schedule: 'Weekly'
    },
    { 
      id: '5', 
      name: 'RevPAR Dashboard', 
      category: 'revpar',
      description: 'Revenue per available room analysis',
      lastGenerated: '2024-01-28',
      format: 'PDF',
      size: '2.8 MB',
      schedule: 'Daily'
    },
    { 
      id: '6', 
      name: 'Channel Performance', 
      category: 'channel',
      description: 'Revenue and booking analysis by distribution channel',
      lastGenerated: '2024-01-26',
      format: 'Excel',
      size: '2.2 MB',
      schedule: 'Monthly'
    },
    { 
      id: '7', 
      name: 'Market Segment Report', 
      category: 'segment',
      description: 'Revenue and occupancy by market segment',
      lastGenerated: '2024-01-25',
      format: 'PDF',
      size: '3.5 MB',
      schedule: 'Monthly'
    },
    { 
      id: '8', 
      name: 'Custom Pricing Analysis', 
      category: 'custom',
      description: 'Custom report for executive review',
      lastGenerated: '2024-01-20',
      format: 'PDF',
      size: '4.2 MB',
      schedule: 'On-demand'
    }
  ], []);

  const filteredReports = useMemo(() => {
    if (reportCategory === 'custom') return reports.filter(r => r.category === 'custom');
    return reports.filter(r => r.category === reportCategory);
  }, [reports, reportCategory]);

  const scheduledReports = useMemo(() => [
    { id: 1, name: 'Daily Revenue Report', frequency: 'Daily', nextRun: 'Today 8:00 AM', recipients: ['revenue@hotel.com', 'gm@hotel.com'] },
    { id: 2, name: 'Weekly Occupancy Report', frequency: 'Weekly', nextRun: 'Monday 9:00 AM', recipients: ['frontdesk@hotel.com'] },
    { id: 3, name: 'Monthly Revenue Summary', frequency: 'Monthly', nextRun: 'Feb 1, 10:00 AM', recipients: ['executive@hotel.com', 'finance@hotel.com'] }
  ], []);

  const reportCategories = [
    { id: 'revenue', name: 'Revenue Reports', icon: DollarSign },
    { id: 'occupancy', name: 'Occupancy Reports', icon: Bed },
    { id: 'adr', name: 'ADR Reports', icon: TrendingUp },
    { id: 'revpar', name: 'RevPAR Reports', icon: BarChart3 },
    { id: 'channel', name: 'Channel Reports', icon: Globe },
    { id: 'segment', name: 'Segment Reports', icon: Users },
    { id: 'custom', name: 'Custom Reports', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h2>
          <p className="text-slate-600 dark:text-slate-400">Generate and schedule revenue management reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Report
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setReportCategory(category.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  reportCategory === category.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{reportCategories.find(c => c.id === reportCategory)?.name}</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              selected={selectedReport === report.id}
              onSelect={() => setSelectedReport(report.id)}
            />
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scheduled Reports</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Schedule Report
          </button>
        </div>
        <div className="space-y-3">
          {scheduledReports.map((scheduled) => (
            <ScheduledReportCard key={scheduled.id} scheduled={scheduled} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Download className="w-5 h-5" />}
            title="Export to Excel"
            description="Download current data as Excel spreadsheet"
          />
          <QuickActionButton
            icon={<FileText className="w-5 h-5" />}
            title="Generate PDF"
            description="Create formatted PDF report"
          />
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            title="Schedule Report"
            description="Set up automated report delivery"
          />
          <QuickActionButton
            icon={<Filter className="w-5 h-5" />}
            title="Custom Filters"
            description="Apply custom data filters"
          />
        </div>
      </div>
    </div>
  );
};

interface ReportCardProps {
  report: {
    id: string;
    name: string;
    category: string;
    description: string;
    lastGenerated: string;
    format: string;
    size: string;
    schedule: string;
  };
  selected: boolean;
  onSelect: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, selected, onSelect }) => {
  const formatColors = {
    PDF: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    Excel: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    CSV: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white">{report.name}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formatColors[report.format as keyof typeof formatColors]}`}>
          {report.format}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{report.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
        <span>Last: {report.lastGenerated}</span>
        <span>{report.size}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Schedule: {report.schedule}
        </span>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" title="View">
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Download">
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ScheduledReportCardProps {
  scheduled: {
    id: number;
    name: string;
    frequency: string;
    nextRun: string;
    recipients: string[];
  };
}

const ScheduledReportCard: React.FC<ScheduledReportCardProps> = ({ scheduled }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{scheduled.name}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>{scheduled.frequency}</span>
            <span>Next: {scheduled.nextRun}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">Recipients</p>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{scheduled.recipients.length}</p>
        </div>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, title, description }) => {
  return (
    <button className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-left">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          {icon}
        </div>
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </button>
  );
};

export default Reports;
