/**
 * Daily Flash Reports
 * Generate daily operational reports
 */

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Clock,
  Filter,
  Search,
  Send,
  Eye
} from 'lucide-react';

interface FlashReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  status: 'ready' | 'generating' | 'failed';
  format: 'PDF' | 'Excel';
}

const DailyFlashReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<FlashReport[]>([
    {
      id: '1',
      name: 'Daily Operations Report',
      type: 'Operations',
      generatedAt: '2026-07-31 10:00',
      generatedBy: 'System',
      status: 'ready',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Morning Flash Report',
      type: 'Flash',
      generatedAt: '2026-07-31 08:00',
      generatedBy: 'Duty Manager',
      status: 'ready',
      format: 'PDF'
    },
    {
      id: '3',
      name: 'Evening Summary',
      type: 'Summary',
      generatedAt: '2026-07-30 23:00',
      generatedBy: 'Night Manager',
      status: 'ready',
      format: 'PDF'
    }
  ]);

  const reportTypes = [
    'Daily Operations Report',
    'Morning Flash Report',
    'Evening Summary',
    'Executive Briefing',
    'Duty Manager Report',
    'Guest Complaint Summary',
    'Occupancy Summary',
    'Revenue Snapshot',
    'Incident Summary'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'generating':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'failed':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileBarChart size={28} />
            Daily Flash Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Generate daily operational reports</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <FileBarChart size={18} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Generate New Report</h3>
          <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm mb-3">
            {reportTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              Generate
            </button>
            <button className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
              Schedule
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Report Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Morning Flash</span>
              <span className="text-slate-900 dark:text-white">08:00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Evening Summary</span>
              <span className="text-slate-900 dark:text-white">23:00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Daily Operations</span>
              <span className="text-slate-900 dark:text-white">10:00</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2">
              <Send size={14} />
              Email All Reports
            </button>
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2">
              <Download size={14} />
              Download Archive
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Reports</h3>
        </div>
        <div className="p-4 space-y-2">
          {reports.map(report => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileBarChart size={18} className="text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{report.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.generatedAt}</span>
                    <span>•</span>
                    <span>{report.generatedBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                  <Eye size={16} className="text-slate-500" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                  <Download size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyFlashReports;