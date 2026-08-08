import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ArrowLeftRight,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ShiftRostering = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'shifts' | 'templates' | 'requests'>('roster');
  const [currentWeek, setCurrentWeek] = useState('2024-06-24');

  const shiftTypes = [
    { id: 'ST-001', name: 'Morning', startTime: '07:00', endTime: '15:00', color: 'bg-blue-500' },
    { id: 'ST-002', name: 'Evening', startTime: '15:00', endTime: '23:00', color: 'bg-purple-500' },
    { id: 'ST-003', name: 'Night', startTime: '23:00', endTime: '07:00', color: 'bg-slate-700' },
    { id: 'ST-004', name: 'Split Shift', startTime: '07:00', endTime: '11:00', color: 'bg-amber-500' },
    { id: 'ST-005', name: 'Flexible', startTime: 'Flexible', endTime: 'Flexible', color: 'bg-emerald-500' },
    { id: 'ST-006', name: 'On Call', startTime: 'On Call', endTime: 'On Call', color: 'bg-rose-500' },
  ];

  const weeklyRoster = [
    { 
      day: 'Monday', 
      date: '2024-06-24',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Morning', role: 'Concierge', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Tuesday', 
      date: '2024-06-25',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Morning', role: 'Concierge', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Wednesday', 
      date: '2024-06-26',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Off', role: '-', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Thursday', 
      date: '2024-06-27',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Morning', role: 'Concierge', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Friday', 
      date: '2024-06-28',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Morning', role: 'Concierge', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Saturday', 
      date: '2024-06-29',
      shifts: [
        { employee: 'John Doe', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Evening', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Off', role: '-', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
    { 
      day: 'Sunday', 
      date: '2024-06-30',
      shifts: [
        { employee: 'John Doe', shift: 'Off', role: '-', department: 'Front Office' },
        { employee: 'Elena Smith', shift: 'Morning', role: 'Reception', department: 'Front Office' },
        { employee: 'Carlos Ray', shift: 'Evening', role: 'Concierge', department: 'Front Office' },
        { employee: 'Maria Garcia', shift: 'Night', role: 'Bell Services', department: 'Front Office' },
      ]
    },
  ];

  const shiftTemplates = [
    { id: 'TPL-001', name: 'Standard Week Pattern', description: '5 days on, 2 days off rotation', departments: ['Front Office', 'Housekeeping'], isActive: true },
    { id: 'TPL-002', name: 'Hotel Weekend Pattern', description: 'Weekend heavy staffing', departments: ['F&B', 'Front Office'], isActive: true },
    { id: 'TPL-003', name: 'Night Shift Rotation', description: '4 nights on, 3 nights off', departments: ['Engineering', 'Security'], isActive: false },
  ];

  const swapRequests = [
    { id: 'SWP-001', employee: 'John Doe', currentShift: 'Morning (Jun 24)', requestedShift: 'Evening (Jun 24)', reason: 'Personal commitment', status: 'Pending' },
    { id: 'SWP-002', employee: 'Elena Smith', currentShift: 'Evening (Jun 25)', requestedShift: 'Morning (Jun 25)', reason: 'Medical appointment', status: 'Approved' },
  ];

  const getShiftColor = (shiftName: string) => {
    const shift = shiftTypes.find(s => s.name === shiftName);
    return shift ? shift.color : 'bg-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shift & Rostering</h2>
          <p className="text-sm text-slate-500 mt-1">Manage staff schedules, shifts, and roster planning</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} />
            Auto-Generate
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Add Shift
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled This Week', value: '142', icon: Users, color: 'text-indigo-500' },
          { label: 'Shift Changes', value: '8', icon: ArrowLeftRight, color: 'text-amber-500' },
          { label: 'Open Shifts', value: '5', icon: AlertCircle, color: 'text-rose-500' },
          { label: 'Coverage Rate', value: '94%', icon: TrendingUp, color: 'text-emerald-500' },
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
          { id: 'roster', label: 'Weekly Roster', icon: Calendar },
          { id: 'shifts', label: 'Shift Types', icon: Clock },
          { id: 'templates', label: 'Templates', icon: RefreshCw },
          { id: 'requests', label: 'Swap Requests', icon: ArrowLeftRight },
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

      {/* Weekly Roster Tab */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Week of {currentWeek}</span>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Front Office</option>
                <option>Housekeeping</option>
                <option>F&B</option>
                <option>Engineering</option>
                <option>All Departments</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium">
                Publish Roster
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="px-4 py-4 text-xs font-medium text-slate-500 sticky left-0 bg-slate-50/50 dark:bg-slate-950/20">Employee</th>
                    {weeklyRoster.map((day) => (
                      <th key={day.date} className="px-4 py-4 text-xs font-medium text-slate-500 text-center min-w-[120px]">
                        <div>{day.day.substring(0, 3)}</div>
                        <div className="text-xs font-medium text-slate-400">{day.date.split('-')[2]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {['John Doe', 'Elena Smith', 'Carlos Ray', 'Maria Garcia'].map((employee, empIndex) => (
                    <tr key={employee} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {employee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{employee}</span>
                        </div>
                      </td>
                      {weeklyRoster.map((day) => {
                        const shift = day.shifts.find(s => s.employee === employee);
                        return (
                          <td key={day.date} className="px-4 py-3 text-center">
                            {shift ? (
                              <div className={`p-2 rounded-lg ${getShiftColor(shift.shift)} text-white`}>
                                <div className="text-xs font-medium uppercase">{shift.shift}</div>
                                <div className="text-xs opacity-80">{shift.role}</div>
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <div className="text-xs font-medium uppercase">Off</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shift Types Tab */}
      {activeTab === 'shifts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Types</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Add Shift Type
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {shiftTypes.map((shift) => (
              <div key={shift.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 ${shift.color} rounded-lg flex items-center justify-center`}>
                    <Clock className="text-white" size={16} />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
                      <Edit size={14} className="text-slate-400" />
                    </button>
                    <button className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition">
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{shift.name}</h4>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Clock size={12} />
                  <span>{shift.startTime} - {shift.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Templates</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Create Template
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Template Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Departments</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {shiftTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{template.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {template.departments.map((dept) => (
                        <span key={dept} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium uppercase">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Swap Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Swap Requests</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Current Shift</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Requested Shift</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Reason</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {swapRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.currentShift}</td>
                  <td className="px-6 py-4 text-xs font-bold text-indigo-600">{request.requestedShift}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.reason}</td>
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
    </div>
  );
};

export default ShiftRostering;
