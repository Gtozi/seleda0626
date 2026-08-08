import React, { useState } from 'react';
import { Building2, Users, DollarSign, Calendar, Clock, Plus, Edit, Trash2, Search, Filter, ChevronRight, ChevronDown } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  employeeCount: number;
  budget: number;
  costCenter: string;
  status: 'active' | 'inactive';
}

interface Team {
  id: string;
  name: string;
  departmentId: string;
  teamLead: string;
  memberCount: number;
}

interface ShiftGroup {
  id: string;
  name: string;
  departmentId: string;
  schedule: string;
  activeMembers: number;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Front Office', code: 'FO', headOfDepartment: 'John Smith', employeeCount: 45, budget: 2500000, costCenter: 'CC-FO-001', status: 'active' },
    { id: '2', name: 'Housekeeping', code: 'HK', headOfDepartment: 'Sarah Johnson', employeeCount: 80, budget: 3000000, costCenter: 'CC-HK-001', status: 'active' },
    { id: '3', name: 'Food & Beverage', code: 'FB', headOfDepartment: 'Mike Wilson', employeeCount: 120, budget: 5000000, costCenter: 'CC-FB-001', status: 'active' },
    { id: '4', name: 'Engineering', code: 'ENG', headOfDepartment: 'David Brown', employeeCount: 25, budget: 1500000, costCenter: 'CC-ENG-001', status: 'active' },
    { id: '5', name: 'Sales & Marketing', code: 'SM', headOfDepartment: 'Emily Davis', employeeCount: 30, budget: 2000000, costCenter: 'CC-SM-001', status: 'active' },
  ]);

  const [teams] = useState<Team[]>([
    { id: '1', name: 'Reception Team', departmentId: '1', teamLead: 'Alice Cooper', memberCount: 15 },
    { id: '2', name: 'Concierge Team', departmentId: '1', teamLead: 'Bob Martin', memberCount: 10 },
    { id: '3', name: 'Room Attendants', departmentId: '2', teamLead: 'Carol White', memberCount: 40 },
    { id: '4', name: 'Public Area Cleaners', departmentId: '2', teamLead: 'Dan Harris', memberCount: 20 },
    { id: '5', name: 'Restaurant Service', departmentId: '3', teamLead: 'Eva Green', memberCount: 35 },
  ]);

  const [shiftGroups] = useState<ShiftGroup[]>([
    { id: '1', name: 'Morning Shift', departmentId: '1', schedule: '6:00 AM - 2:00 PM', activeMembers: 20 },
    { id: '2', name: 'Afternoon Shift', departmentId: '1', schedule: '2:00 PM - 10:00 PM', activeMembers: 15 },
    { id: '3', name: 'Night Shift', departmentId: '1', schedule: '10:00 PM - 6:00 AM', activeMembers: 10 },
    { id: '4', name: 'Flexible Shift', departmentId: '2', schedule: 'Variable', activeMembers: 25 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set(['1', '2']));

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepartments(newExpanded);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dept.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Department Management</h1>
          <p className="text-xs text-slate-400">Configure departments, teams, cost centers, shift groups, and reporting structure</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Building2 size={16} />
            Reporting Structure
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Add Department
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-blue-600' },
          { label: 'Total Teams', value: teams.length, icon: Users, color: 'text-emerald-600' },
          { label: 'Shift Groups', value: shiftGroups.length, icon: Clock, color: 'text-purple-600' },
          { label: 'Total Employees', value: departments.reduce((sum, d) => sum + d.employeeCount, 0), icon: Users, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Head of Department</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Cost Center</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDepartments.map((dept) => (
                <React.Fragment key={dept.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleDepartment(dept.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          {expandedDepartments.has(dept.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {dept.code}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</div>
                          <div className="text-xs text-slate-500">{dept.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dept.headOfDepartment}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users size={14} />
                        {dept.employeeCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <DollarSign size={14} />
                        ${(dept.budget / 1000000).toFixed(1)}M
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dept.costCenter}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(dept.status)}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Edit size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedDepartments.has(dept.id) && (
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Teams */}
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                              <Users size={16} />
                              Teams
                            </h4>
                            <div className="space-y-2">
                              {teams.filter(t => t.departmentId === dept.id).map(team => (
                                <div key={team.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">{team.name}</div>
                                    <div className="text-[10px] text-slate-500">{team.teamLead}</div>
                                  </div>
                                  <div className="text-xs text-slate-500">{team.memberCount} members</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shift Groups */}
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                              <Clock size={16} />
                              Shift Groups
                            </h4>
                            <div className="space-y-2">
                              {shiftGroups.filter(s => s.departmentId === dept.id).map(shift => (
                                <div key={shift.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">{shift.name}</div>
                                    <div className="text-[10px] text-slate-500">{shift.schedule}</div>
                                  </div>
                                  <div className="text-xs text-slate-500">{shift.activeMembers} active</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Centers Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Cost Centers</h3>
            <p className="text-xs text-slate-400">Budget allocation by department</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {dept.code}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</span>
                </div>
                <span className="text-xs text-slate-500">{dept.costCenter}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Budget</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${(dept.budget / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Per Employee</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${Math.round(dept.budget / dept.employeeCount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;