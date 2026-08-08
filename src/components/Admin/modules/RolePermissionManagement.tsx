import React, { useState } from 'react';
import { Shield, Users, Key, Eye, Edit, Trash2, Plus, Search, Filter, Check, X, Lock, Unlock } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  type: 'system_admin' | 'property_admin' | 'department_admin' | 'manager' | 'supervisor' | 'staff' | 'read_only' | 'auditor' | 'api_client';
  description: string;
  userCount: number;
  permissions: number;
  status: 'active' | 'inactive';
}

interface Permission {
  id: string;
  name: string;
  category: 'portal' | 'module' | 'screen' | 'record' | 'field' | 'action' | 'approval' | 'data';
  description: string;
}

const RolePermissionManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'System Administrator', type: 'system_admin', description: 'Full system access and configuration', userCount: 5, permissions: 150, status: 'active' },
    { id: '2', name: 'Property Administrator', type: 'property_admin', description: 'Property-level management and configuration', userCount: 12, permissions: 120, status: 'active' },
    { id: '3', name: 'Department Administrator', type: 'department_admin', description: 'Department-level management', userCount: 25, permissions: 80, status: 'active' },
    { id: '4', name: 'Manager', type: 'manager', description: 'Operational management and oversight', userCount: 45, permissions: 60, status: 'active' },
    { id: '5', name: 'Supervisor', type: 'supervisor', description: 'Team supervision and task management', userCount: 80, permissions: 40, status: 'active' },
    { id: '6', name: 'Staff', type: 'staff', description: 'Basic operational access', userCount: 350, permissions: 25, status: 'active' },
    { id: '7', name: 'Read Only', type: 'read_only', description: 'View-only access to data', userCount: 60, permissions: 15, status: 'active' },
    { id: '8', name: 'Auditor', type: 'auditor', description: 'Audit and compliance access', userCount: 8, permissions: 35, status: 'active' },
    { id: '9', name: 'API Client', type: 'api_client', description: 'API access for integrations', userCount: 15, permissions: 20, status: 'active' },
  ]);

  const [permissions] = useState<Permission[]>([
    { id: '1', name: 'Portal Access', category: 'portal', description: 'Access to specific portals' },
    { id: '2', name: 'Module Access', category: 'module', description: 'Access to specific modules' },
    { id: '3', name: 'Screen Access', category: 'screen', description: 'Access to specific screens' },
    { id: '4', name: 'Record Access', category: 'record', description: 'CRUD operations on records' },
    { id: '5', name: 'Field-Level Security', category: 'field', description: 'Field-level access control' },
    { id: '6', name: 'Action Permissions', category: 'action', description: 'Specific action permissions' },
    { id: '7', name: 'Approval Authority', category: 'approval', description: 'Approval level authority' },
    { id: '8', name: 'Data Scope', category: 'data', description: 'Data access scope restrictions' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || role.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const roleTypes = ['system_admin', 'property_admin', 'department_admin', 'manager', 'supervisor', 'staff', 'read_only', 'auditor', 'api_client'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system_admin': return 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400';
      case 'property_admin': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'department_admin': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'manager': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'supervisor': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'staff': return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400';
      case 'read_only': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'auditor': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'api_client': return 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'portal': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'module': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'screen': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'record': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'field': return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400';
      case 'action': return 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400';
      case 'approval': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'data': return 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Role & Permission Management</h1>
          <p className="text-xs text-slate-400">Configure role types and granular permissions</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Key size={16} />
            Permission Matrix
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Add Role
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, icon: Shield, color: 'text-blue-600' },
          { label: 'Active Roles', value: roles.filter(r => r.status === 'active').length, icon: Check, color: 'text-emerald-600' },
          { label: 'Total Users', value: roles.reduce((sum, r) => sum + r.userCount, 0), icon: Users, color: 'text-purple-600' },
          { label: 'Total Permissions', value: permissions.length, icon: Key, color: 'text-amber-600' },
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
              placeholder="Search roles..."
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
              {roleTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Role Types</h3>
            <p className="text-xs text-slate-400">User role definitions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <div key={role.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${getTypeColor(role.type)} flex items-center justify-center`}>
                  <Shield size={20} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit size={16} className="text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{role.name}</h4>
              <p className="text-xs text-slate-500 mb-4">{role.description}</p>

              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize ${getTypeColor(role.type)}`}>
                  {role.type.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  role.status === 'active' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400'
                }`}>
                  {role.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {role.userCount} users
                </div>
                <div className="flex items-center gap-1">
                  <Key size={12} />
                  {role.permissions} permissions
                </div>
              </div>

              <button 
                onClick={() => setSelectedRole(role.id)}
                className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                View Permissions
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Permission Categories</h3>
            <p className="text-xs text-slate-400">Granular access control</p>
          </div>
          <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Add Permission
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${getCategoryColor(permission.category)} flex items-center justify-center`}>
                  {permission.category === 'portal' && <Eye size={16} />}
                  {permission.category === 'module' && <Edit size={16} />}
                  {permission.category === 'screen' && <Eye size={16} />}
                  {permission.category === 'record' && <Edit size={16} />}
                  {permission.category === 'field' && <Lock size={16} />}
                  {permission.category === 'action' && <Unlock size={16} />}
                  {permission.category === 'approval' && <Check size={16} />}
                  {permission.category === 'data' && <Shield size={16} />}
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize ${getCategoryColor(permission.category)}`}>
                  {permission.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{permission.name}</h4>
              <p className="text-xs text-slate-500">{permission.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Permission Matrix</h3>
            <p className="text-xs text-slate-400">Role-based access control overview</p>
          </div>
          <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
            View Full Matrix
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Portal</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Screen</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Record</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Field</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {roles.slice(0, 5).map((role) => (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{role.name}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check size={16} className="mx-auto text-emerald-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check size={16} className="mx-auto text-emerald-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {role.type === 'staff' || role.type === 'read_only' ? (
                      <Eye size={16} className="mx-auto text-amber-500" />
                    ) : (
                      <Check size={16} className="mx-auto text-emerald-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {role.type === 'system_admin' ? (
                      <Check size={16} className="mx-auto text-emerald-500" />
                    ) : (
                      <X size={16} className="mx-auto text-slate-300" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {role.type === 'staff' ? (
                      <X size={16} className="mx-auto text-slate-300" />
                    ) : (
                      <Check size={16} className="mx-auto text-emerald-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {role.type === 'read_only' ? (
                      <X size={16} className="mx-auto text-slate-300" />
                    ) : (
                      <Check size={16} className="mx-auto text-emerald-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {['system_admin', 'property_admin', 'department_admin', 'manager'].includes(role.type) ? (
                      <Check size={16} className="mx-auto text-emerald-500" />
                    ) : (
                      <X size={16} className="mx-auto text-slate-300" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManagement;