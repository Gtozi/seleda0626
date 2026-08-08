/**
 * Reports
 * Comprehensive reporting module for operations
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  category: string;
  description: string;
  lastGenerated: string;
  format: string;
}

const Reports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'operations' | 'guest' | 'approval' | 'executive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const reports: Report[] = [
    {
      id: '1',
      name: 'Daily Operations Summary',
      category: 'operations',
      description: 'Summary of daily operational activities across all departments',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF, Excel'
    },
    {
      id: '2',
      name: 'Shift Report',
      category: 'operations',
      description: 'Detailed shift-by-shift operational report',
      lastGenerated: '2026-07-31 08:00',
      format: 'PDF'
    },
    {
      id: '3',
      name: 'Department Status',
      category: 'operations',
      description: 'Current status of all hotel departments',
      lastGenerated: '2026-07-31 09:30',
      format: 'PDF, Excel'
    },
    {
      id: '4',
      name: 'Cross-Department Tasks',
      category: 'operations',
      description: 'Status of tasks involving multiple departments',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF'
    },
    {
      id: '5',
      name: 'SLA Compliance',
      category: 'operations',
      description: 'Service Level Agreement compliance report',
      lastGenerated: '2026-07-30 23:00',
      format: 'PDF, Excel'
    },
    {
      id: '6',
      name: 'VIP Report',
      category: 'guest',
      description: 'VIP guest activity and special requests',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF'
    },
    {
      id: '7',
      name: 'Guest Recovery Report',
      category: 'guest',
      description: 'Service recovery cases and resolutions',
      lastGenerated: '2026-07-31 09:00',
      format: 'PDF, Excel'
    },
    {
      id: '8',
      name: 'Complaint Report',
      category: 'guest',
      description: 'Guest complaints and resolution status',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF'
    },
    {
      id: '9',
      name: 'Service Quality Report',
      category: 'guest',
      description: 'Guest satisfaction and service quality metrics',
      lastGenerated: '2026-07-30 23:00',
      format: 'PDF, Excel'
    },
    {
      id: '10',
      name: 'Pending Approvals',
      category: 'approval',
      description: 'Current pending approval requests',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF'
    },
    {
      id: '11',
      name: 'Approval Turnaround Time',
      category: 'approval',
      description: 'Analysis of approval processing times',
      lastGenerated: '2026-07-30 23:00',
      format: 'PDF, Excel'
    },
    {
      id: '12',
      name: 'Escalation Report',
      category: 'approval',
      description: 'Escalated items and resolution status',
      lastGenerated: '2026-07-31 09:00',
      format: 'PDF'
    },
    {
      id: '13',
      name: 'Hotel Status',
      category: 'executive',
      description: 'Overall hotel operational status',
      lastGenerated: '2026-07-31 10:00',
      format: 'PDF'
    },
    {
      id: '14',
      name: 'Department Performance',
      category: 'executive',
      description: 'Performance metrics by department',
      lastGenerated: '2026-07-30 23:00',
      format: 'PDF, Excel'
    },
    {
      id: '15',
      name: 'Daily Flash',
      category: 'executive',
      description: 'Executive daily flash report',
      lastGenerated: '2026-07-31 08:00',
      format: 'PDF'
    },
    {
      id: '16',
      name: 'Weekly Operations Review',
      category: 'executive',
      description: 'Weekly operational performance review',
      lastGenerated: '2026-07-28 23:00',
      format: 'PDF, Excel'
    },
    {
      id: '17',
      name: 'Monthly Operations Review',
      category: 'executive',
      description: 'Monthly operational performance review',
      lastGenerated: '2026-07-31 00:00',
      format: 'PDF, Excel'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operations':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'guest':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'approval':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'executive':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText size={28} />
            Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive reporting module for operations</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="operations">Operations Reports</option>
          <option value="guest">Guest Reports</option>
          <option value="approval">Approval Reports</option>
          <option value="executive">Executive Reports</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(report.category)}`}>
                  {report.category}
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white mt-2">{report.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {report.lastGenerated}
                  </span>
                  <span>•</span>
                  <span>{report.format}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2">
                <FileText size={14} />
                Generate
              </button>
              <button className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;