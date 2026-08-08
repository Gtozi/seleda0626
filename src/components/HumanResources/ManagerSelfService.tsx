import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Briefcase,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';

const ManagerSelfService = () => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'team' | 'schedule' | 'performance' | 'recruitment'>('approvals');

  const pendingApprovals = [
    { id: 'APR-001', type: 'Leave', employee: 'John Doe', details: 'Annual Leave: Jun 05 - Jun 12 (7 days)', date: '2024-06-01', priority: 'Normal' },
    { id: 'APR-002', type: 'Overtime', employee: 'Elena Smith', details: 'Weekend Work: 8 hours on May 31', date: '2024-05-31', priority: 'High' },
    { id: 'APR-003', type: 'Expense', employee: 'Carlos Ray', details: 'Travel Expense: $150 for client meeting', date: '2024-05-30', priority: 'Normal' },
    { id: 'APR-004', type: 'Training', employee: 'Maria Garcia', details: 'Leadership Course: July 10-12', date: '2024-05-29', priority: 'Normal' },
  ];

  const teamMembers = [
    { 
      id: 'EMP-001', 
      name: 'John Doe', 
      position: 'Receptionist', 
      department: 'Front Office',
      status: 'Active',
      attendance: '95%',
      performance: '4.2/5',
      leaveBalance: 14,
      avatar: 'JD'
    },
    { 
      id: 'EMP-002', 
      name: 'Elena Smith', 
      position: 'Senior Receptionist', 
      department: 'Front Office',
      status: 'Active',
      attendance: '92%',
      performance: '4.5/5',
      leaveBalance: 8,
      avatar: 'ES'
    },
    { 
      id: 'EMP-003', 
      name: 'Carlos Ray', 
      position: 'Concierge', 
      department: 'Front Office',
      status: 'On Leave',
      attendance: '88%',
      performance: '4.0/5',
      leaveBalance: 21,
      avatar: 'CR'
    },
    { 
      id: 'EMP-004', 
      name: 'Maria Garcia', 
      position: 'Bell Services', 
      department: 'Front Office',
      status: 'Active',
      attendance: '97%',
      performance: '4.3/5',
      leaveBalance: 12,
      avatar: 'MG'
    },
  ];

  const teamSchedule = [
    { date: '2024-06-28', day: 'Friday', shifts: [
      { employee: 'John Doe', shift: 'Morning (07:00 - 15:00)', role: 'Reception' },
      { employee: 'Elena Smith', shift: 'Evening (15:00 - 23:00)', role: 'Reception' },
      { employee: 'Maria Garcia', shift: 'Morning (07:00 - 15:00)', role: 'Bell Services' },
    ]},
    { date: '2024-06-29', day: 'Saturday', shifts: [
      { employee: 'John Doe', shift: 'Morning (07:00 - 15:00)', role: 'Reception' },
      { employee: 'Elena Smith', shift: 'Evening (15:00 - 23:00)', role: 'Reception' },
      { employee: 'Maria Garcia', shift: 'Off', role: '-' },
    ]},
    { date: '2024-06-30', day: 'Sunday', shifts: [
      { employee: 'John Doe', shift: 'Off', role: '-' },
      { employee: 'Elena Smith', shift: 'Morning (07:00 - 15:00)', role: 'Reception' },
      { employee: 'Maria Garcia', shift: 'Evening (15:00 - 23:00)', role: 'Bell Services' },
    ]},
  ];

  const performanceReviews = [
    { id: 'PR-001', employee: 'John Doe', period: 'Q2 2024', status: 'In Progress', dueDate: '2024-06-30', goals: 5, completed: 3 },
    { id: 'PR-002', employee: 'Elena Smith', period: 'Q2 2024', status: 'Pending', dueDate: '2024-06-30', goals: 5, completed: 0 },
    { id: 'PR-003', employee: 'Carlos Ray', period: 'Q2 2024', status: 'Completed', dueDate: '2024-06-15', goals: 5, completed: 5 },
  ];

  const recruitmentRequests = [
    { id: 'REC-001', position: 'Receptionist', department: 'Front Office', type: 'Replacement', priority: 'High', status: 'Approved', vacancies: 2 },
    { id: 'REC-002', position: 'Concierge', department: 'Front Office', type: 'New Position', priority: 'Normal', status: 'Pending', vacancies: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manager Self-Service</h2>
          <p className="text-sm text-slate-500 mt-1">Approve requests, manage team, and drive performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: '12', icon: Clock, color: 'text-amber-500' },
          { label: 'Team Members', value: '24', icon: Users, color: 'text-indigo-500' },
          { label: 'On Leave Today', value: '3', icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Performance Reviews', value: '8', icon: TrendingUp, color: 'text-purple-500' },
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
          { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
          { id: 'team', label: 'My Team', icon: Users },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
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

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Approvals</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search approvals..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Details</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {pendingApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                      {approval.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{approval.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{approval.details}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{approval.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      approval.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {approval.priority}
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

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Team</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search team..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Attendance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Performance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Leave Balance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {member.avatar}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{member.position}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{member.attendance}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{member.performance}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{member.leaveBalance}d</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <MoreVertical size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Schedule</h3>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium">
                Previous Week
              </button>
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium">
                Next Week
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium">
                Export Schedule
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {teamSchedule.map((day) => (
              <div key={day.date} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
                <div className="p-4 bg-indigo-600 text-white">
                  <h4 className="text-sm font-semibold">{day.day}</h4>
                  <p className="text-xs opacity-80">{day.date}</p>
                </div>
                <div className="p-4 space-y-3">
                  {day.shifts.map((shift, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{shift.employee}</span>
                        <span className={`text-xs font-medium uppercase ${
                          shift.shift === 'Off' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {shift.shift}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400">{shift.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Reviews</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              New Review
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Period</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Due Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Goals</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {performanceReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{review.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{review.period}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{review.dueDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{review.completed}/{review.goals}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      review.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      review.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recruitment Tab */}
      {activeTab === 'recruitment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[32xl] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recruitment Requests</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              New Request
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Vacancies</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {recruitmentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="text-indigo-600 dark:text-indigo-400" size={14} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.department}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {request.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {request.vacancies}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <MoreVertical size={14} className="text-slate-400" />
                      </button>
                    </div>
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

export default ManagerSelfService;
