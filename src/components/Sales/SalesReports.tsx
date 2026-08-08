import React, { useState } from 'react';
import {
  RefreshCw, FileText, Download, BarChart3,
  TrendingUp, Users, DollarSign, Target,
} from 'lucide-react';

const REPORT_CATEGORIES = [
  {
    category: 'Sales Reports',
    icon: TrendingUp,
    color: 'bg-indigo-50 text-indigo-600',
    reports: [
      'Sales Pipeline Summary', 'Lead Conversion Report', 'Revenue by Sales Rep',
      'Lost Opportunities Analysis', 'Sales Forecast Report', 'Monthly Sales Performance',
    ],
  },
  {
    category: 'Marketing Reports',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    reports: [
      'Campaign Performance Report', 'Email Marketing Analytics', 'SMS Campaign Results',
      'Channel ROI Analysis', 'Lead Source Analysis', 'Marketing Spend Report',
    ],
  },
  {
    category: 'CRM Reports',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600',
    reports: [
      'Customer Lifetime Value', 'Guest Satisfaction Report', 'Loyalty Program Analytics',
      'Guest Retention Report', 'Feedback Summary Report', 'NPS Trend Report',
    ],
  },
  {
    category: 'Financial Reports',
    icon: DollarSign,
    color: 'bg-amber-50 text-amber-600',
    reports: [
      'Revenue by Account', 'Corporate Account Summary', 'Travel Agent Commission Report',
      'Contract Value Report', 'Proposal Success Rate', 'AR Aging Report',
    ],
  },
  {
    category: 'Operational Reports',
    icon: Target,
    color: 'bg-cyan-50 text-cyan-600',
    reports: [
      'Booking Source Analysis', 'Market Segmentation Report', 'Seasonal Demand Report',
      'Group Booking Report', 'Event Revenue Report', 'Occupancy Forecast',
    ],
  },
  {
    category: 'Standard Reports',
    icon: FileText,
    color: 'bg-slate-100 text-slate-600',
    reports: [
      'Daily Sales Summary', 'Weekly Pipeline Report', 'Monthly KPI Dashboard',
      'Quarterly Business Review', 'Annual Sales Report', 'Year-over-Year Comparison',
    ],
  },
];

const SalesReports: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredCategories = REPORT_CATEGORIES.map(cat => ({
    ...cat,
    reports: cat.reports.filter(r => r.toLowerCase().includes(search.toLowerCase())),
  })).filter(cat => cat.reports.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Reports</h2>
          <p className="text-xs text-slate-400 font-medium">Sales, marketing, CRM, financial, operational, and standard reports</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.category} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-xl ${cat.color}`}><Icon size={16} /></div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{cat.category}</h3>
              </div>
              <div className="space-y-2">
                {cat.reports.map(report => (
                  <button key={report} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition group">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-left">{report}</span>
                    <Download size={12} className="text-slate-300 group-hover:text-indigo-500 transition" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FileText size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-400">No reports found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default SalesReports;
