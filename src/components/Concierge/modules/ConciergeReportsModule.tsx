/**
 * Concierge Reports Module
 * Daily activity, guest requests, service performance, and vendor reports
 */

import { useState } from 'react';
import { BarChart3, FileText, TrendingUp, Download, Calendar } from 'lucide-react';

const ConciergeReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('');

  const reports = [
    { id: 'daily-activity', name: 'Daily Concierge Activity', description: 'Summary of daily concierge operations and requests', icon: <BarChart3 size={20} className="text-indigo-600" /> },
    { id: 'guest-requests', name: 'Guest Requests Report', description: 'Detailed analysis of guest requests and fulfillment', icon: <FileText size={20} className="text-emerald-600" /> },
    { id: 'service-performance', name: 'Service Performance', description: 'KPIs and performance metrics for concierge services', icon: <TrendingUp size={20} className="text-blue-600" /> },
    { id: 'vendor-performance', name: 'Vendor Performance', description: 'Analysis of external vendor performance and ratings', icon: <BarChart3 size={20} className="text-amber-600" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Concierge Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daily activity, guest requests, service performance, and vendor reports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <Calendar size={16} className="text-slate-500" />
            <input type="date" className="bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-6 border rounded-xl cursor-pointer transition ${
              selectedReport === report.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{report.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {reports.find(r => r.id === selectedReport)?.name}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
              <Download size={16} />
              Export Report
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Report preview would be displayed here</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Select date range and parameters to generate report</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConciergeReportsModule;