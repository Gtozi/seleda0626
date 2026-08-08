/**
 * Reports Center Module
 * Centralized reporting hub for executive and department reports
 */

import { useState } from 'react';
import {
  FileBarChart,
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ReportsCenter = () => {
  const [activeTab, setActiveTab] = useState<'executive' | 'department'>('executive');

  const executiveReports = [
    { name: 'Daily Executive Report', frequency: 'Daily', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Flash Report', frequency: 'Daily', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Occupancy Report', frequency: 'Daily', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Revenue Report', frequency: 'Daily', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Budget Variance', frequency: 'Monthly', lastRun: 'Jan 31', status: 'Ready' },
    { name: 'Forecast Report', frequency: 'Weekly', lastRun: 'Jan 28', status: 'Ready' },
    { name: 'KPI Dashboard', frequency: 'Daily', lastRun: 'Today 08:00', status: 'Ready' },
  ];

  const departmentReports = [
    { name: 'Front Office Report', department: 'Front Office', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'F&B Report', department: 'F&B', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Kitchen Report', department: 'Kitchen', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Housekeeping Report', department: 'Housekeeping', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Finance Report', department: 'Finance', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'HR Report', department: 'HR', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Procurement Report', department: 'Procurement', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Engineering Report', department: 'Engineering', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Security Report', department: 'Security', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Inventory Report', department: 'Inventory', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'Sales Report', department: 'Sales', lastRun: 'Today 08:00', status: 'Ready' },
    { name: 'CRM Report', department: 'CRM', lastRun: 'Today 08:00', status: 'Ready' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'Failed': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'Generating': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready': return <CheckCircle2 size={14} />;
      case 'Failed': return <XCircle size={14} />;
      case 'Generating': return <Clock size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const reports = activeTab === 'executive' ? executiveReports : departmentReports;

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('executive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'executive'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            Executive Reports
          </button>
          <button
            onClick={() => setActiveTab('department')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'department'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            Department Reports
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <Calendar size={14} /> Date Range
          </button>
          <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <Filter size={14} /> Filters
          </button>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
            <Plus size={14} /> New Report
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                <FileBarChart size={20} />
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${getStatusColor(report.status)}`}>
                {getStatusIcon(report.status)}
                {report.status}
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {report.name}
            </h4>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">
                <span className="font-medium">Last Run:</span> {report.lastRun}
              </p>
              {'department' in report && (
                <p className="text-[10px] text-slate-500">
                  <span className="font-medium">Department:</span> {report.department}
                </p>
              )}
              {'frequency' in report && (
                <p className="text-[10px] text-slate-500">
                  <span className="font-medium">Frequency:</span> {report.frequency}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <Download size={12} /> Generate
              </button>
              <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsCenter;
