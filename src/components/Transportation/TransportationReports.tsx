import React, { useState } from 'react';
import { 
  FileText,
  Search,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Car
} from 'lucide-react';

const TransportationReports: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const reports = [
    {
      id: 'RPT-001',
      name: 'Daily Trip Report',
      category: 'Operational',
      description: 'Summary of all trips completed today',
      lastGenerated: '2026-07-30 14:00',
      generatedBy: 'System',
      format: 'PDF',
      size: '245 KB'
    },
    {
      id: 'RPT-002',
      name: 'Vehicle Utilization Report',
      category: 'Fleet',
      description: 'Fleet utilization and availability metrics',
      lastGenerated: '2026-07-30 06:00',
      generatedBy: 'System',
      format: 'Excel',
      size: '180 KB'
    },
    {
      id: 'RPT-003',
      name: 'Driver Performance Report',
      category: 'Performance',
      description: 'Driver performance metrics and ratings',
      lastGenerated: '2026-07-29 23:59',
      generatedBy: 'System',
      format: 'PDF',
      size: '320 KB'
    },
    {
      id: 'RPT-004',
      name: 'Airport Transfer Report',
      category: 'Operational',
      description: 'Airport pickup and drop-off statistics',
      lastGenerated: '2026-07-30 12:00',
      generatedBy: 'System',
      format: 'PDF',
      size: '195 KB'
    },
    {
      id: 'RPT-005',
      name: 'Transportation Revenue Report',
      category: 'Financial',
      description: 'Revenue and cost analysis',
      lastGenerated: '2026-07-30 08:00',
      generatedBy: 'System',
      format: 'Excel',
      size: '410 KB'
    },
    {
      id: 'RPT-006',
      name: 'Fuel Consumption Report',
      category: 'Fleet',
      description: 'Fuel usage and cost analysis',
      lastGenerated: '2026-07-30 07:00',
      generatedBy: 'System',
      format: 'Excel',
      size: '155 KB'
    },
    {
      id: 'RPT-007',
      name: 'Shuttle Performance Report',
      category: 'Operational',
      description: 'Shuttle service performance metrics',
      lastGenerated: '2026-07-30 10:00',
      generatedBy: 'System',
      format: 'PDF',
      size: '210 KB'
    },
    {
      id: 'RPT-008',
      name: 'Monthly Fleet Summary',
      category: 'Fleet',
      description: 'Comprehensive monthly fleet overview',
      lastGenerated: '2026-07-01 00:00',
      generatedBy: 'Admin',
      format: 'PDF',
      size: '1.2 MB'
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Operational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Fleet': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Financial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Performance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transportation Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Operational, fleet, financial, and performance reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FileText className="w-4 h-4" />
          Generate Custom Report
        </button>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Operational</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fleet</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Financial</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Performance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Operational">Operational</option>
              <option value="Fleet">Fleet</option>
              <option value="Financial">Financial</option>
              <option value="Performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{report.description}</p>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Last Generated:</span>
                <span className="font-medium text-slate-900 dark:text-white">{report.lastGenerated}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Format:</span>
                <span className="font-medium text-slate-900 dark:text-white">{report.format}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Size:</span>
                <span className="font-medium text-slate-900 dark:text-white">{report.size}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                <FileText className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportationReports;