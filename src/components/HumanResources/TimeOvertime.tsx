import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  FileText,
  Download,
  Users
} from 'lucide-react';

const TimeOvertime = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'approvals' | 'history' | 'analysis'>('requests');

  const overtimeRequests = [
    { 
      id: 'OT-001', 
      employee: 'John Doe', 
      department: 'Front Office',
      type: 'Weekend Work',
      date: '2024-06-29',
      startTime: '08:00',
      endTime: '16:00',
      hours: 8,
      reason: 'Special event coverage',
      status: 'Pending',
      rate: '1.5x'
    },
    { 
      id: 'OT-002', 
      employee: 'Elena Smith', 
      department: 'Front Office',
      type: 'Holiday Work',
      date: '2024-07-04',
      startTime: '07:00',
      endTime: '15:00',
      hours: 8,
      reason: 'Independence Day',
      status: 'Approved',
      rate: '2.0x'
    },
    { 
      id: 'OT-003', 
      employee: 'Carlos Ray', 
      department: 'Front Office',
      type: 'Regular Overtime',
      date: '2024-06-28',
      startTime: '16:00',
      endTime: '20:00',
      hours: 4,
      reason: 'Late checkout assistance',
      status: 'Pending',
      rate: '1.5x'
    },
  ];

  const toilRequests = [
    { 
      id: 'TOIL-001', 
      employee: 'Maria Garcia', 
      department: 'Front Office',
      hoursEarned: 8,
      hoursUsed: 0,
      balance: 8,
      expiryDate: '2024-12-31',
      status: 'Active'
    },
    { 
      id: 'TOIL-002', 
      employee: 'John Doe', 
      department: 'Front Office',
      hoursEarned: 4,
      hoursUsed: 4,
      balance: 0,
      expiryDate: '2024-09-30',
      status: 'Exhausted'
    },
  ];

  const overtimeHistory = [
    { period: 'June 2024', totalHours: 142, totalCost: 8520, approvals: 38, rejections: 3 },
    { period: 'May 2024', totalHours: 128, totalCost: 7680, approvals: 35, rejections: 2 },
    { period: 'April 2024', totalHours: 115, totalCost: 6900, approvals: 32, rejections: 4 },
    { period: 'March 2024', totalHours: 98, totalCost: 5880, approvals: 28, rejections: 1 },
  ];

  const laborCostAnalysis = [
    { department: 'Front Office', budget: 45000, actual: 48200, variance: -3200, overtimeHours: 45, overtimeCost: 2700 },
    { department: 'Housekeeping', budget: 38000, actual: 37500, variance: 500, overtimeHours: 32, overtimeCost: 1920 },
    { department: 'F&B', budget: 52000, actual: 54800, variance: -2800, overtimeHours: 58, overtimeCost: 3480 },
    { department: 'Engineering', budget: 28000, actual: 27500, variance: 500, overtimeHours: 18, overtimeCost: 1080 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Time & Overtime</h2>
          <p className="text-sm text-slate-500 mt-1">Manage overtime requests, TOIL, and labor cost analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export Report
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: '12', icon: Clock, color: 'text-amber-500' },
          { label: 'Overtime Hours (MTD)', value: '142h', icon: TrendingUp, color: 'text-indigo-500' },
          { label: 'Overtime Cost (MTD)', value: '$8,520', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'TOIL Balance', value: '156h', icon: Calendar, color: 'text-purple-500' },
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
          { id: 'requests', label: 'Overtime Requests', icon: Clock },
          { id: 'approvals', label: 'TOIL Management', icon: Calendar },
          { id: 'history', label: 'History', icon: FileText },
          { id: 'analysis', label: 'Cost Analysis', icon: TrendingUp },
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

      {/* Overtime Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overtime Requests</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Hours</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Rate</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Reason</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {overtimeRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{request.employee}</span>
                      <span className="text-xs font-medium text-slate-400">{request.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.type === 'Holiday Work' ? 'bg-rose-50 text-rose-600' : 
                      request.type === 'Weekend Work' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {request.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.date}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{request.hours}h</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                      {request.rate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{request.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 bg-emerald-500 text-white rounded-lg hover:shadow-md transition">
                        <CheckCircle2 size={14} />
                      </button>
                      <button className="p-1.5 bg-rose-500 text-white rounded-lg hover:shadow-md transition">
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TOIL Management Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Time-Off in Lieu (TOIL)</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Process TOIL
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Hours Earned</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Hours Used</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Balance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {toilRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.department}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{request.hoursEarned}h</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{request.hoursUsed}h</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.balance > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {request.balance}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.expiryDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overtime History</h3>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Period</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Total Hours</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Total Cost</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Approvals</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Rejections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {overtimeHistory.map((record) => (
                <tr key={record.period} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{record.period}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{record.totalHours}h</td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                    ${record.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-emerald-600">{record.approvals}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-rose-600">{record.rejections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Labor Cost Analysis</h3>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Current Month</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Budget</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Actual</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Variance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">OT Hours</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">OT Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {laborCostAnalysis.map((analysis) => (
                <tr key={analysis.department} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Users className="text-indigo-600 dark:text-indigo-400" size={14} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{analysis.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                    ${analysis.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                    ${analysis.actual.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-medium ${
                      analysis.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {analysis.variance >= 0 ? '+' : ''}${analysis.variance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {analysis.overtimeHours}h
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                    ${analysis.overtimeCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeOvertime;
