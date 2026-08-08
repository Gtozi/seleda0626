/**
 * Spa & Wellness Reports Module
 * Provides operational, financial, inventory, performance, and executive reports
 */

import { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Star,
  FileText,
  PieChart
} from 'lucide-react';

const SpaWellnessReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'operational' | 'financial' | 'inventory' | 'performance' | 'executive'>('operational');
  const [dateRange, setDateRange] = useState('30');

  const reportCategories = [
    { id: 'operational', name: 'Operational Reports', icon: <BarChart3 size={20} /> },
    { id: 'financial', name: 'Financial Reports', icon: <DollarSign size={20} /> },
    { id: 'inventory', name: 'Inventory Reports', icon: <Package size={20} /> },
    { id: 'performance', name: 'Performance Reports', icon: <Star size={20} /> },
    { id: 'executive', name: 'Executive Reports', icon: <TrendingUp size={20} /> }
  ];

  const operationalReports = [
    { id: 'daily-appointment', name: 'Daily Appointment Report', description: 'Summary of all appointments for the day' },
    { id: 'therapist-schedule', name: 'Therapist Schedule', description: 'Daily schedule and therapist assignments' },
    { id: 'room-utilization', name: 'Room Utilization', description: 'Treatment room usage statistics' },
    { id: 'attendance-report', name: 'Attendance Report', description: 'Member and guest attendance tracking' },
    { id: 'cancellation-report', name: 'Cancellation Report', description: 'Cancelled and no-show appointments' }
  ];

  const financialReports = [
    { id: 'spa-revenue', name: 'Spa Revenue', description: 'Total spa revenue breakdown' },
    { id: 'retail-revenue', name: 'Retail Revenue', description: 'Product sales and retail income' },
    { id: 'membership-revenue', name: 'Membership Revenue', description: 'Membership fees and renewals' },
    { id: 'package-revenue', name: 'Package Revenue', description: 'Wellness package sales' },
    { id: 'product-sales', name: 'Product Sales', description: 'Individual product sales analysis' }
  ];

  const inventoryReports = [
    { id: 'product-consumption', name: 'Product Consumption', description: 'Product usage by treatment' },
    { id: 'low-stock', name: 'Low Stock Report', description: 'Items below minimum stock level' },
    { id: 'retail-stock', name: 'Retail Stock', description: 'Current retail inventory status' },
    { id: 'inventory-valuation', name: 'Inventory Valuation', description: 'Total inventory value' }
  ];

  const performanceReports = [
    { id: 'therapist-productivity', name: 'Therapist Productivity', description: 'Individual therapist performance' },
    { id: 'guest-satisfaction', name: 'Guest Satisfaction', description: 'Customer ratings and feedback' },
    { id: 'popular-treatments', name: 'Popular Treatments', description: 'Most requested treatments' },
    { id: 'treatment-trends', name: 'Treatment Trends', description: 'Treatment popularity over time' }
  ];

  const executiveReports = [
    { id: 'monthly-performance', name: 'Monthly Performance', description: 'Monthly operational summary' },
    { id: 'revenue-by-service', name: 'Revenue by Service', description: 'Revenue breakdown by service type' },
    { id: 'occupancy', name: 'Occupancy Report', description: 'Facility and room occupancy rates' },
    { id: 'membership-growth', name: 'Membership Growth', description: 'New membership acquisition' },
    { id: 'profitability-analysis', name: 'Profitability Analysis', description: 'Cost and profit analysis' }
  ];

  const getReportsForTab = () => {
    switch (activeTab) {
      case 'operational':
        return operationalReports;
      case 'financial':
        return financialReports;
      case 'inventory':
        return inventoryReports;
      case 'performance':
        return performanceReports;
      case 'executive':
        return executiveReports;
      default:
        return [];
    }
  };

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Spa & Wellness Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Operational, financial, and performance analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Report Categories */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {reportCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
              activeTab === category.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Appointments</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">1,247</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% from last period</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">$48,392</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+8% from last period</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Members</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">156</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+5 new this month</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Star size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">4.8</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on 892 reviews</div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {reportCategories.find(c => c.id === activeTab)?.name}
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {getReportsForTab().map((report) => (
            <div key={report.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <PieChart size={16} />
                    Generate
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <BarChart3 size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Daily Summary</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <DollarSign size={20} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Revenue Report</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Therapist Performance</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Package size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Inventory Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaWellnessReportsModule;