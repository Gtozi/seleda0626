import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  FileText,
  PieChart,
  LineChart,
  Target,
  Award,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState<'hr' | 'attendance' | 'payroll' | 'performance' | 'executive'>('hr');

  const hrReports = [
    { 
      id: 'HR-001', 
      name: 'Employee Directory', 
      description: 'Complete list of all employees with details',
      category: 'HR',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel'
    },
    { 
      id: 'HR-002', 
      name: 'Headcount Report', 
      description: 'Current headcount by department and position',
      category: 'HR',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel'
    },
    { 
      id: 'HR-003', 
      name: 'Turnover Report', 
      description: 'Employee turnover analysis and trends',
      category: 'HR',
      lastGenerated: '2024-06-25',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'HR-004', 
      name: 'Recruitment Report', 
      description: 'Recruitment metrics and time-to-hire analysis',
      category: 'HR',
      lastGenerated: '2024-06-20',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
  ];

  const attendanceReports = [
    { 
      id: 'ATT-001', 
      name: 'Daily Attendance', 
      description: 'Daily attendance records by department',
      category: 'Attendance',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel'
    },
    { 
      id: 'ATT-002', 
      name: 'Late Arrivals Report', 
      description: 'Analysis of late arrival patterns',
      category: 'Attendance',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel'
    },
    { 
      id: 'ATT-003', 
      name: 'Overtime Report', 
      description: 'Overtime hours and cost analysis',
      category: 'Attendance',
      lastGenerated: '2024-06-25',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'ATT-004', 
      name: 'Absenteeism Report', 
      description: 'Absenteeism patterns and trends',
      category: 'Attendance',
      lastGenerated: '2024-06-20',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
  ];

  const payrollReports = [
    { 
      id: 'PAY-001', 
      name: 'Payroll Register', 
      description: 'Detailed payroll register for current period',
      category: 'Payroll',
      lastGenerated: '2024-06-28',
      generatedBy: 'Payroll Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PAY-002', 
      name: 'Payroll Summary', 
      description: 'Summary of payroll costs by department',
      category: 'Payroll',
      lastGenerated: '2024-06-28',
      generatedBy: 'Payroll Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PAY-003', 
      name: 'Tax Report', 
      description: 'Tax deductions and compliance report',
      category: 'Payroll',
      lastGenerated: '2024-06-28',
      generatedBy: 'Payroll Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PAY-004', 
      name: 'Bank Transfer Report', 
      description: 'Bank transfer file for payroll processing',
      category: 'Payroll',
      lastGenerated: '2024-06-28',
      generatedBy: 'Payroll Manager',
      format: 'Excel, CSV'
    },
  ];

  const performanceReports = [
    { 
      id: 'PERF-001', 
      name: 'Performance Ratings', 
      description: 'Employee performance ratings distribution',
      category: 'Performance',
      lastGenerated: '2024-06-15',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PERF-002', 
      name: 'Goal Achievement', 
      description: 'Goal completion rates by department',
      category: 'Performance',
      lastGenerated: '2024-06-15',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PERF-003', 
      name: 'Training Completion', 
      description: 'Training program completion rates',
      category: 'Performance',
      lastGenerated: '2024-06-10',
      generatedBy: 'Training Manager',
      format: 'PDF, Excel'
    },
    { 
      id: 'PERF-004', 
      name: 'Succession Readiness', 
      description: 'Succession planning readiness assessment',
      category: 'Performance',
      lastGenerated: '2024-06-01',
      generatedBy: 'HR Director',
      format: 'PDF, Excel'
    },
  ];

  const executiveReports = [
    { 
      id: 'EXEC-001', 
      name: 'Labor Cost Analysis', 
      description: 'Comprehensive labor cost analysis and trends',
      category: 'Executive',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel, Dashboard'
    },
    { 
      id: 'EXEC-002', 
      name: 'Revenue per Employee', 
      description: 'Revenue productivity metrics',
      category: 'Executive',
      lastGenerated: '2024-06-28',
      generatedBy: 'System',
      format: 'PDF, Excel, Dashboard'
    },
    { 
      id: 'EXEC-003', 
      name: 'Employee Productivity', 
      description: 'Productivity metrics and KPIs',
      category: 'Executive',
      lastGenerated: '2024-06-25',
      generatedBy: 'System',
      format: 'PDF, Excel, Dashboard'
    },
    { 
      id: 'EXEC-004', 
      name: 'Workforce Planning', 
      description: 'Workforce planning and forecasting',
      category: 'Executive',
      lastGenerated: '2024-06-20',
      generatedBy: 'HR Director',
      format: 'PDF, Excel, Dashboard'
    },
    { 
      id: 'EXEC-005', 
      name: 'Diversity Analysis', 
      description: 'Diversity and inclusion metrics',
      category: 'Executive',
      lastGenerated: '2024-06-15',
      generatedBy: 'HR Manager',
      format: 'PDF, Excel, Dashboard'
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HR': return Users;
      case 'Attendance': return Clock;
      case 'Payroll': return DollarSign;
      case 'Performance': return Award;
      case 'Executive': return TrendingUp;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'HR': return 'text-indigo-500';
      case 'Attendance': return 'text-amber-500';
      case 'Payroll': return 'text-emerald-500';
      case 'Performance': return 'text-purple-500';
      case 'Executive': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Generate and view HR reports and analytics dashboards</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Custom Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: '24', icon: FileText, color: 'text-indigo-500' },
          { label: 'Generated Today', value: '8', icon: Calendar, color: 'text-emerald-500' },
          { label: 'Scheduled Reports', value: '12', icon: Clock, color: 'text-amber-500' },
          { label: 'Dashboards', value: '5', icon: BarChart3, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'hr', label: 'HR Reports', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'payroll', label: 'Payroll', icon: DollarSign },
          { id: 'performance', label: 'Performance', icon: Award },
          { id: 'executive', label: 'Executive', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* HR Reports Tab */}
      {activeTab === 'hr' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">HR Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Report Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Generated</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Format</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {hrReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{report.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.lastGenerated}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.format}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <FileText size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance Reports Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Report Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Generated</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Format</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {attendanceReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{report.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.lastGenerated}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.format}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <FileText size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payroll Reports Tab */}
      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Report Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Generated</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Format</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {payrollReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{report.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.lastGenerated}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.format}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <FileText size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Performance Reports Tab */}
      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Report Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Generated</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Format</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {performanceReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{report.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.lastGenerated}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.format}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <FileText size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Executive Reports Tab */}
      {activeTab === 'executive' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Executive Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Report Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Generated</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Format</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {executiveReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{report.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.lastGenerated}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{report.format}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <FileText size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;
