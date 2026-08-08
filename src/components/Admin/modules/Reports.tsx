import React, { useState } from 'react';
import { Shield, Users, Activity, BarChart3, FileText, Download, Calendar, Search, Filter, Eye, TrendingUp, TrendingDown, MoreVertical, Clock, Lock, Key, Zap, Globe, CheckCircle, AlertTriangle, Play as PlayIcon } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  category: 'security' | 'administration' | 'system';
  type: string;
  description: string;
  lastGenerated: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  status: 'ready' | 'generating' | 'error';
}

interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    // Security Reports
    { id: '1', name: 'Login Activity Report', category: 'security', type: 'Login Activity', description: 'Track user login patterns and failed attempts', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
    { id: '2', name: 'Permission Changes Report', category: 'security', type: 'Permission Changes', description: 'Monitor permission modifications and role assignments', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
    { id: '3', name: 'MFA Compliance Report', category: 'security', type: 'MFA Compliance', description: 'Track multi-factor authentication adoption and compliance', lastGenerated: '2024-01-14 08:00', schedule: 'weekly', status: 'ready' },
    { id: '4', name: 'Security Audit Log', category: 'security', type: 'Audit Logs', description: 'Comprehensive security event log and analysis', lastGenerated: '2024-01-15 06:00', schedule: 'daily', status: 'ready' },
    
    // Administration Reports
    { id: '5', name: 'User Activity Report', category: 'administration', type: 'User Activity', description: 'Track user engagement and portal usage patterns', lastGenerated: '2024-01-15 08:00', schedule: 'weekly', status: 'ready' },
    { id: '6', name: 'Portal Usage Report', category: 'administration', type: 'Portal Usage', description: 'Monitor portal adoption and feature utilization', lastGenerated: '2024-01-14 08:00', schedule: 'weekly', status: 'ready' },
    { id: '7', name: 'License Usage Report', category: 'administration', type: 'License Usage', description: 'Track license consumption and utilization trends', lastGenerated: '2024-01-15 08:00', schedule: 'monthly', status: 'ready' },
    { id: '8', name: 'Feature Adoption Report', category: 'administration', type: 'Feature Adoption', description: 'Monitor feature flag adoption and usage patterns', lastGenerated: '2024-01-14 08:00', schedule: 'monthly', status: 'ready' },
    
    // System Reports
    { id: '9', name: 'Performance Report', category: 'system', type: 'Performance', description: 'System performance metrics and response times', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
    { id: '10', name: 'API Usage Report', category: 'system', type: 'API Usage', description: 'API call volume, response times, and error rates', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
    { id: '11', name: 'Integration Status Report', category: 'system', type: 'Integration Status', description: 'Third-party integration health and sync status', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
    { id: '12', name: 'Background Jobs Report', category: 'system', type: 'Background Jobs', description: 'Background job execution status and performance', lastGenerated: '2024-01-15 08:00', schedule: 'daily', status: 'ready' },
  ]);

  const [schedules, setSchedules] = useState<ReportSchedule[]>([
    { id: '1', reportId: '1', frequency: 'daily', nextRun: '2024-01-16 08:00', recipients: ['admin@seleda.com', 'security@seleda.com'], format: 'pdf' },
    { id: '2', reportId: '5', frequency: 'weekly', nextRun: '2024-01-22 08:00', recipients: ['admin@seleda.com'], format: 'excel' },
    { id: '3', reportId: '9', frequency: 'daily', nextRun: '2024-01-16 08:00', recipients: ['ops@seleda.com', 'admin@seleda.com'], format: 'pdf' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSchedule, setFilterSchedule] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'security' | 'administration' | 'system' | 'schedules'>('security');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesSchedule = filterSchedule === 'all' || report.schedule === filterSchedule;
    return matchesSearch && matchesCategory && matchesSchedule;
  });

  const categories = [
    { id: 'security', name: 'Security Reports', icon: Shield, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'administration', name: 'Administration Reports', icon: Users, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'system', name: 'System Reports', icon: Activity, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'generating': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const reportStats = [
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Security', value: reports.filter(r => r.category === 'security').length, icon: Shield, color: 'text-emerald-600' },
    { label: 'Administration', value: reports.filter(r => r.category === 'administration').length, icon: Users, color: 'text-purple-600' },
    { label: 'System', value: reports.filter(r => r.category === 'system').length, icon: Activity, color: 'text-amber-600' },
    { label: 'Scheduled', value: schedules.length, icon: Calendar, color: 'text-cyan-600' },
    { label: 'Ready', value: reports.filter(r => r.status === 'ready').length, icon: CheckCircle, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reports</h1>
          <p className="text-xs text-slate-400">Security reports, administration reports, and system reports</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <FileText size={16} />
          Create Custom Report
        </button>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reportStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Security Reports
        </button>
        <button
          onClick={() => setActiveTab('administration')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'administration'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Administration Reports
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          System Reports
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'schedules'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Schedules
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterSchedule}
              onChange={(e) => setFilterSchedule(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Schedules</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="on_demand">On Demand</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {(activeTab === 'security' || activeTab === 'administration' || activeTab === 'system') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Generated</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredReports
                  .filter(report => {
                    if (activeTab === 'security') return report.category === 'security';
                    if (activeTab === 'administration') return report.category === 'administration';
                    if (activeTab === 'system') return report.category === 'system';
                    return true;
                  })
                  .map((report) => {
                    const category = categories.find(c => c.id === report.category);
                    const CategoryIcon = category?.icon || FileText;
                    return (
                      <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${category?.color} flex items-center justify-center`}>
                              <CategoryIcon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{report.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{report.type}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{report.description}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                            {report.schedule.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{report.lastGenerated}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-1.5 hover-bg-indigo-50 rounded-lg transition" title="Generate report">
                              <BarChart3 size={14} className="text-indigo-600" />
                            </button>
                            <button className="p-1.5 hover-bg-amber-50 rounded-lg transition" title="Download">
                              <Download size={14} className="text-amber-600" />
                            </button>
                            <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="Schedule">
                              <Calendar size={14} className="text-slate-600" />
                            </button>
                            <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="More options">
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Report Schedules</h3>
              <p className="text-xs text-slate-400">Automated report generation and delivery</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Calendar size={14} />
              Add Schedule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Next Run</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Format</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {schedules.map((schedule) => {
                  const report = reports.find(r => r.id === schedule.reportId);
                  return (
                    <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{report?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                          {schedule.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{schedule.nextRun}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{schedule.recipients.join(', ')}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                          {schedule.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover-bg-indigo-50 rounded-lg transition" title="Edit schedule">
                            <Calendar size={14} className="text-indigo-600" />
                          </button>
                          <button className="p-1.5 hover-bg-rose-50 rounded-lg transition" title="Delete schedule">
                            <AlertTriangle size={14} className="text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Categories Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Report Categories</h3>
            <p className="text-xs text-slate-400">Available reports by category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className={`p-4 rounded-xl ${category.color} flex flex-col items-center justify-center`}>
              <category.icon size={24} className="mb-2" />
              <span className="text-xs font-bold">{category.name}</span>
              <span className="text-[10px] opacity-75">{reports.filter(r => r.category === category.id).length} reports</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;