import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Lock, Key, History, Shield, UserCheck, UserX, ArrowRight, Calendar, Building, Mail, Phone, MapPin, Briefcase, Crown, UserCog } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'employee' | 'contractor' | 'vendor' | 'service_account' | 'api_user' | 'external_partner';
  department: string;
  property: string;
  position?: string;
  location?: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  mfaEnabled: boolean;
  createdAt: string;
  delegatedTo?: string;
  delegations?: string[];
}

interface Delegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  startDate: string;
  endDate: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Smith', email: 'john.smith@seleda.com', phone: '+1 555-0101', type: 'employee', department: 'Front Office', property: 'Grand Hotel Paris', position: 'Front Desk Manager', location: 'Paris, France', status: 'active', lastLogin: '2 hours ago', mfaEnabled: true, createdAt: '2023-06-15', delegations: ['2'] },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@seleda.com', phone: '+1 555-0102', type: 'employee', department: 'Housekeeping', property: 'Seaside Resort', position: 'Housekeeping Supervisor', location: 'Malibu, CA', status: 'active', lastLogin: '1 day ago', mfaEnabled: true, createdAt: '2023-08-20', delegatedTo: '1' },
    { id: '3', name: 'Tech Support Bot', email: 'support-bot@seleda.com', type: 'service_account', department: 'IT', property: 'All Properties', status: 'active', lastLogin: '5 minutes ago', mfaEnabled: false, createdAt: '2023-01-10' },
    { id: '4', name: 'External API User', email: 'api@partner.com', type: 'api_user', department: 'Integrations', property: 'All Properties', status: 'active', lastLogin: '10 minutes ago', mfaEnabled: false, createdAt: '2023-09-01' },
    { id: '5', name: 'Mike Wilson', email: 'mike.wilson@vendor.com', phone: '+1 555-0103', type: 'vendor', department: 'Maintenance', property: 'Grand Hotel Paris', position: 'Maintenance Lead', location: 'Paris, France', status: 'inactive', lastLogin: '1 week ago', mfaEnabled: false, createdAt: '2023-03-15' },
    { id: '6', name: 'Emily Davis', email: 'emily.davis@seleda.com', phone: '+1 555-0104', type: 'employee', department: 'Food & Beverage', property: 'Seaside Resort', position: 'Restaurant Manager', location: 'Malibu, CA', status: 'active', lastLogin: '3 hours ago', mfaEnabled: true, createdAt: '2023-05-10' },
    { id: '7', name: 'Robert Chen', email: 'robert.chen@seleda.com', phone: '+1 555-0105', type: 'contractor', department: 'Engineering', property: 'Grand Hotel Paris', position: 'Contract Engineer', location: 'Paris, France', status: 'active', lastLogin: '6 hours ago', mfaEnabled: true, createdAt: '2023-11-01' },
  ]);

  const [delegations] = useState<Delegation[]>([
    { id: '1', fromUserId: '1', toUserId: '2', startDate: '2024-01-01', endDate: '2024-01-31', permissions: ['approve_leave', 'approve_expenses'], status: 'active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'delegations'>('users');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const userTypes = [
    { id: 'employee', name: 'Employee', icon: UserCog, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'contractor', name: 'Contractor', icon: Briefcase, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'vendor', name: 'Vendor', icon: Building, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'service_account', name: 'Service Account', icon: Shield, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'api_user', name: 'API User', icon: Key, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'external_partner', name: 'External Partner', icon: Crown, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
  ];

  const statuses = ['active', 'inactive', 'locked'];

  const getTypeColor = (type: string) => {
    const typeObj = userTypes.find(t => t.id === type);
    return typeObj?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'locked': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const userActions = [
    { icon: Lock, label: 'Reset Password', color: 'text-blue-600', description: 'Force password reset on next login' },
    { icon: Key, label: 'Reset MFA', color: 'text-purple-600', description: 'Clear MFA setup for user' },
    { icon: History, label: 'Login History', color: 'text-amber-600', description: 'View recent login attempts' },
    { icon: Shield, label: 'Session Management', color: 'text-emerald-600', description: 'Manage active sessions' },
    { icon: ArrowRight, label: 'Delegation', color: 'text-indigo-600', description: 'Delegate permissions temporarily' },
    { icon: UserCheck, label: 'Enable User', color: 'text-green-600', description: 'Reactivate user account' },
    { icon: UserX, label: 'Disable User', color: 'text-red-600', description: 'Deactivate user account' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">User Management</h1>
          <p className="text-xs text-slate-400">Manage employees, contractors, vendors, service accounts, API users, and external partners</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('delegations')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'delegations'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Delegations
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600' },
              { label: 'Employees', value: users.filter(u => u.type === 'employee').length, icon: UserCog, color: 'text-emerald-600' },
              { label: 'Contractors', value: users.filter(u => u.type === 'contractor').length, icon: Briefcase, color: 'text-purple-600' },
              { label: 'Service Accounts', value: users.filter(u => u.type === 'service_account').length, icon: Shield, color: 'text-cyan-600' },
              { label: 'API Users', value: users.filter(u => u.type === 'api_user').length, icon: Key, color: 'text-rose-600' },
              { label: 'Active Users', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-green-600' },
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
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  {userTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <Filter size={16} />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">MFA</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const type = userTypes.find(t => t.id === user.type);
                    const TypeIcon = type?.icon || Users;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                              {user.position && (
                                <div className="text-[10px] text-slate-400">{user.position}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${getTypeColor(user.type)} flex items-center justify-center`}>
                              <TypeIcon size={12} />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{type?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.department}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.property}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.mfaEnabled ? (
                            <Shield size={16} className="text-emerald-500" />
                          ) : (
                            <Shield size={16} className="text-slate-300" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.lastLogin}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                              <MoreVertical size={16} className="text-slate-400" />
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

          {/* User Management Functions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">User Management Functions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button key={index} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center">
                      <Icon size={20} className={action.color} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">{action.label}</span>
                    <span className="text-[10px] text-slate-400 text-center">{action.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'delegations' && (
        <>
          {/* Delegations Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Delegations</h3>
                <p className="text-xs text-slate-400">Temporary permission delegations</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <ArrowRight size={16} />
                Create Delegation
              </button>
            </div>

            <div className="space-y-4">
              {delegations.map((delegation) => {
                const fromUser = users.find(u => u.id === delegation.fromUserId);
                const toUser = users.find(u => u.id === delegation.toUserId);
                return (
                  <div key={delegation.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                            {fromUser?.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{fromUser?.name}</span>
                        </div>
                        <ArrowRight size={16} className="text-slate-400" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            {toUser?.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{toUser?.name}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(delegation.status)}`}>
                        {delegation.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span>Start: {delegation.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span>End: {delegation.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Shield size={12} />
                        <span>{delegation.permissions.length} permissions</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span>{fromUser?.property}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;