/**
 * User Management & Security (Identity & Access Control)
 * 1. Role-Based Access Control (RBAC)
 * 2. User Profiles
 * 3. Audit Logs
 * 4. Security Settings
 */

import React, { useState, useMemo } from 'react';
import {
  Shield, Users, Key, FileSearch, Lock, Smartphone,
  Save, CheckCircle2, AlertTriangle, Search,
  Globe, ChevronRight, Activity,
  ShieldAlert, Download, Plus, Edit2, Trash2, X,
  UserCircle2, Clock, Mail, Building2, UserCheck, UserX
} from 'lucide-react';
import {
  GENERIC_MODULE_ACCESS,
  DEPARTMENTS,
  ModuleAccessSelector,
  useModuleRegistry,
  getDynamicDepartmentModuleAccess,
  filterPermissionsByDepartment,
  getModuleLabel,
  formatPermissionCode,
} from '../Shared/PermissionChecklist';
import { useERP } from '../../context/ERPContext';
import { User, SystemAuditLog } from '../../types/erp';

type SecurityTab = 'rbac' | 'users' | 'audit' | 'security_settings';

const TAB_META: { id: SecurityTab; label: string; icon: React.ReactNode }[] = [
  { id: 'users', label: 'User Profiles', icon: <Users size={14} /> },
  { id: 'rbac', label: 'Role & Permissions', icon: <Key size={14} /> },
  { id: 'audit', label: 'Audit Logs', icon: <FileSearch size={14} /> },
  { id: 'security_settings', label: 'Security Settings', icon: <Shield size={14} /> },
];

function deriveSeverity(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('fail') || a.includes('denied') || a.includes('lock') || a.includes('unauthorized')) return 'Critical';
  if (a.includes('delete') || a.includes('void') || a.includes('override')) return 'High';
  if (a.includes('update') || a.includes('config') || a.includes('role') || a.includes('change')) return 'Medium';
  return 'Low';
}

export default function UserManagementSecurity() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('users');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {TAB_META.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'users' && <UserProfilesModule />}
        {activeTab === 'rbac' && <RBACModule />}
        {activeTab === 'audit' && <AuditLogsModule />}
        {activeTab === 'security_settings' && <SecuritySettingsModule />}
      </div>
    </div>
  );
}

// ---------- USER PROFILES ----------
const AVATAR_GRADIENTS = [
  'from-indigo-500 to-purple-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500', 'from-sky-500 to-blue-500', 'from-violet-500 to-fuchsia-500',
];

function getAvatarGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function getDeptInfo(deptId: string) {
  return DEPARTMENTS.find(d => d.id === deptId);
}

function UserProfilesModule() {
  const { systemUsers, deleteSystemUser } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredUsers = systemUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const activeCount = systemUsers.filter(u => u.status === 'Active').length;
  const pendingCount = systemUsers.filter(u => u.status === 'Pending').length;
  const inactiveCount = systemUsers.filter(u => u.status === 'Inactive' || u.status === 'Suspended' || u.status === 'Locked').length;

  const handleAddUser = async (userData: any) => {
    setLoading(true);
    try {
      // Normalize role: strip custom_ prefix, keep system role as base
      let systemRole = userData.role || 'member';
      if (systemRole.startsWith('custom_')) systemRole = 'member';
      const username = userData.phone || (userData.email ? userData.email.split('@')[0] : '');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: userData.name,
          email: userData.email,
          password: userData.password,
          role: systemRole,
          custom_role_id: userData.customRoleId || null,
          username: username.length >= 3 ? username : undefined,
          department: userData.department || undefined,
          is_active: true,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: 'User created successfully' });
        setShowAddUserModal(false);
        window.location.reload();
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to create user' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    setLoading(true);
    try {
      // When a custom role is selected, formData.role is "custom_<id>" —
      // keep the user's existing system role as the base and set custom_role_id separately
      let systemRole = userData.role || 'guest';
      const hasCustomRole = userData.customRoleId && String(userData.customRoleId).length > 0;
      if (systemRole.startsWith('custom_')) {
        systemRole = editingUser?.role || 'member';
      }
      const payload: any = {
        full_name: userData.name,
        email: userData.email,
        role: systemRole,
        custom_role_id: hasCustomRole ? userData.customRoleId : null,
        is_active: userData.status !== 'Inactive' && userData.status !== 'Locked' && userData.status !== 'Suspended',
      };
      if (userData.department) payload.department = userData.department;
      const username = userData.phone || (userData.email ? userData.email.split('@')[0] : '');
      if (username && username.length >= 3) payload.username = username;
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        if (userData.customRoleId) {
          try {
            await fetch(`/api/admin/users/${editingUser.id}/roles`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ roleId: userData.customRoleId }),
            });
          } catch (e) { console.error('Role assignment failed:', e); }
        }
        setNotification({ type: 'success', message: 'User updated successfully' });
        setShowEditUserModal(false);
        setEditingUser(null);
        setTimeout(() => window.location.reload(), 800);
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to update user' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: systemUsers.length, icon: UserCircle2, color: 'indigo' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: 'emerald' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'amber' },
          { label: 'Inactive / Locked', value: inactiveCount, icon: UserX, color: 'rose' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${s.color}-50 text-${s.color}-600`}><s.icon size={18} /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-lg font-black text-slate-900 leading-tight">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none w-full sm:w-80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
          />
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Department filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setDeptFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
            deptFilter === 'all' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50 bg-white border border-slate-200'
          }`}
        >
          All Departments
        </button>
        {DEPARTMENTS.map((dept) => {
          const count = systemUsers.filter(u => u.department === dept.id).length;
          if (count === 0) return null;
          return (
            <button
              key={dept.id}
              onClick={() => setDeptFilter(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${
                deptFilter === dept.id ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50 bg-white border border-slate-200'
              }`}
            >
              <span>{dept.icon}</span> {dept.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${deptFilter === dept.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => {
              const deptInfo = getDeptInfo(user.department || '');
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(user.name)} flex items-center justify-center text-xs font-black text-white shadow-sm`}>
                        {user.avatarInitials || user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user.roleDescription || user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Mail size={11} className="text-slate-300" />
                      {user.email}
                    </div>
                    {user.mobileNumber && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Smartphone size={10} className="text-slate-300" />
                        {user.mobileNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {deptInfo ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                        <span>{deptInfo.icon}</span> {deptInfo.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">General</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 capitalize">
                      <Key size={9} /> {user.roleDescription || user.role || 'member'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      user.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500' :
                        user.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.lastLogin ? (
                      <span className="text-[10px] text-slate-500 font-mono">{user.lastLogin}</span>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit user"
                      >
                        <Edit2 size={12} className="text-indigo-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                            deleteSystemUser(user.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 rounded-lg transition"
                        title="Delete user"
                      >
                        <Trash2 size={12} className="text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Users size={20} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold">No users found</p>
                    <p className="text-[10px] text-slate-300">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
          loading={loading}
        />
      )}

      {showEditUserModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          onUpdateUser={handleUpdateUser}
          loading={loading}
        />
      )}
    </div>
  );
}

// ---------- RBAC MODULE ----------
function RBACModule() {
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'system' | 'custom'>('all');
  const { registry } = useModuleRegistry();

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        credentials: 'include'
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Failed to fetch roles: Received non-JSON response');
        return;
      }
      
      const result = await response.json();
      if (response.ok) {
        setAllRoles(result.roles || []);
      } else {
        console.error('Failed to fetch roles:', result.error, 'Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setAllPermissions(result.permissions || []);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  React.useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleUpdateRole = async (roleId: string, roleData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roleData),
      });
      const result = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: 'Role updated successfully' });
        setEditingRole(null);
        fetchRoles();
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to update role' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (roleData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roleData),
      });
      const result = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: 'Role created successfully' });
        setShowAddRoleModal(false);
        fetchRoles();
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to create role' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setNotification({ type: 'success', message: 'Role deleted successfully' });
        fetchRoles();
      } else {
        const result = await response.json();
        setNotification({ type: 'error', message: result.error || 'Failed to delete role' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error occurred' });
    }
  };

  // Filter roles by type and department
  const filteredRoles = useMemo(() => {
    let roles = allRoles;
    if (roleFilter === 'system') roles = roles.filter(r => r.source === 'server');
    else if (roleFilter === 'custom') roles = roles.filter(r => r.source === 'custom');
    if (selectedDepartment !== 'all') {
      roles = roles.filter(r => r.source === 'server' || r.department === selectedDepartment || (!r.department && selectedDepartment === 'operations'));
    }
    return roles;
  }, [allRoles, roleFilter, selectedDepartment]);

  // Group filtered roles by department
  const rolesByDepartment = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const role of filteredRoles) {
      const dept = role.department || 'ungrouped';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(role);
    }
    return grouped;
  }, [filteredRoles]);

  const filteredDepartments = selectedDepartment === 'all'
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d => d.id === selectedDepartment);

  const systemRoleCount = allRoles.filter(r => r.source === 'server').length;
  const customRoleCount = allRoles.filter(r => r.source === 'custom').length;
  const deptsWithRoles = new Set(allRoles.map(r => r.department).filter(Boolean)).size;

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Roles', value: allRoles.length, icon: Key, color: 'indigo' },
          { label: 'System Roles', value: systemRoleCount, icon: Shield, color: 'amber' },
          { label: 'Custom Roles', value: customRoleCount, icon: Edit2, color: 'violet' },
          { label: 'Permissions', value: allPermissions.length, icon: Lock, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${s.color}-50 text-${s.color}-600`}><s.icon size={18} /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-lg font-black text-slate-900 leading-tight">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Roles & Permissions</h3>
          <p className="text-xs text-slate-500">Manage system and custom roles with granular permission control</p>
        </div>
        <div className="flex gap-2">
          {/* Role type filter */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['all', 'system', 'custom'] as const).map(f => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                  roleFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={14} /> Create Role
          </button>
        </div>
      </div>

      {/* Department filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDepartment('all')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
            selectedDepartment === 'all' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50 bg-white border border-slate-200'
          }`}
        >
          All Departments
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] ${selectedDepartment === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{allRoles.length}</span>
        </button>
        {DEPARTMENTS.map((dept) => {
          const count = (rolesByDepartment[dept.id] || []).length;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${
                selectedDepartment === dept.id ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50 bg-white border border-slate-200'
              }`}
            >
              <span>{dept.icon}</span> {dept.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${selectedDepartment === dept.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Roles grouped by department */}
      {(() => {
        const ungroupedRoles = rolesByDepartment['ungrouped'] || [];
        const hasUngrouped = ungroupedRoles.length > 0 && (selectedDepartment === 'all' || roleFilter === 'system');
        return (
          <>
          {hasUngrouped && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="text-base">⚙️</span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Roles</h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black">{ungroupedRoles.length} role{ungroupedRoles.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ungroupedRoles.map((role) => (
                  <RoleCard key={role.id} role={role} onDelete={handleDeleteRole} onEdit={(r: any) => setEditingRole(r)} registry={registry} />
                ))}
              </div>
            </div>
          )}
          {filteredDepartments.map((dept) => {
            const roles = rolesByDepartment[dept.id] || [];
            if (roles.length === 0 && selectedDepartment !== 'all') return null;
            return (
              <div key={dept.id} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="text-base">{dept.icon}</span>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{dept.label}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black">{roles.length} role{roles.length !== 1 ? 's' : ''}</span>
                </div>
                {roles.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <p className="text-xs text-slate-400">No roles defined for {dept.label} yet.</p>
                    <button
                      onClick={() => setShowAddRoleModal(true)}
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      + Create the first role
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <RoleCard key={role.id} role={role} onDelete={handleDeleteRole} onEdit={(r: any) => setEditingRole(r)} registry={registry} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          </>
        );
      })()}

      {showAddRoleModal && (
        <AddRoleModal 
          onClose={() => setShowAddRoleModal(false)}
          onAddRole={handleAddRole}
          loading={loading}
          registry={registry}
          allPermissions={allPermissions}
        />
      )}
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          allPermissions={allPermissions}
          onClose={() => setEditingRole(null)}
          onUpdateRole={handleUpdateRole}
          loading={loading}
          registry={registry}
        />
      )}
    </div>
  );
}

// ---------- ROLE CARD ----------
const DEPT_ICON_COLORS: Record<string, string> = {
  fnb: 'bg-amber-100 text-amber-600',
  frontoffice: 'bg-indigo-100 text-indigo-600',
  housekeeping: 'bg-sky-100 text-sky-600',
  engineering: 'bg-orange-100 text-orange-600',
  finance: 'bg-emerald-100 text-emerald-600',
  hr: 'bg-violet-100 text-violet-600',
  inventory: 'bg-blue-100 text-blue-600',
  procurement: 'bg-teal-100 text-teal-600',
  sales: 'bg-rose-100 text-rose-600',
  operations: 'bg-slate-100 text-slate-600',
};

function RoleCard({ role, onDelete, onEdit, registry }: { role: any; onDelete: (id: string) => void; onEdit?: (role: any) => void; registry?: any }) {
  const [expanded, setExpanded] = useState(false);
  const isSystem = role.is_system_role || role.isSystem || role.source === 'server';
  const isSuperuser = role.is_superuser || role.isSuperuser;
  const moduleAccess: Record<string, any> = role.module_access || {};
  const enabledModules = Object.entries(moduleAccess).filter(([, v]) => {
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object') return v.read || v.edit;
    return false;
  }).map(([k]) => k);
  const permList: string[] = Array.isArray(role.permissions) ? role.permissions : [];
  const permObj: Record<string, string[]> = (!Array.isArray(role.permissions) && role.permissions) ? role.permissions : {};
  const permCount = permList.length + Object.values(permObj).reduce((sum: number, actions: any) => sum + (Array.isArray(actions) ? actions.length : 0), 0);
  const iconColor = DEPT_ICON_COLORS[role.department] || 'bg-indigo-100 text-indigo-600';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center`}>
            <Key size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{role.display_name || role.name}</h4>
            <p className="text-[10px] text-slate-400 font-mono">{role.name}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(role)}
              className="p-1.5 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100"
              title="Edit role"
            >
              <Edit2 size={12} className="text-indigo-600" />
            </button>
          )}
          {!isSystem && (
            <button
              onClick={() => onDelete(role.id)}
              className="p-1.5 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
              title="Delete role"
            >
              <Trash2 size={12} className="text-rose-600" />
            </button>
          )}
        </div>
      </div>

      {role.description && (
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{role.description}</p>
      )}

      <div className="flex gap-2 flex-wrap mb-3">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
          isSystem ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'
        }`}>
          {isSystem ? 'System' : 'Custom'}
        </span>
        {isSuperuser && (
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-rose-50 text-rose-600">
            Superuser
          </span>
        )}
        {role.role_label && (
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-indigo-50 text-indigo-600">
            {role.role_label}
          </span>
        )}
        {permCount > 0 && (
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-500">
            {permCount} perms
          </span>
        )}
      </div>

      {/* Module access badges */}
      {enabledModules.length > 0 && (
        <div className="mb-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Module Access</p>
          <div className="flex gap-1 flex-wrap">
            {enabledModules.map((modId) => {
              const deptModules = role.department && getDynamicDepartmentModuleAccess(registry)[role.department] ? getDynamicDepartmentModuleAccess(registry)[role.department] : [];
              const mod = deptModules.find((m: any) => m.id === modId) || GENERIC_MODULE_ACCESS.find((m: any) => m.id === modId);
              const access = role.module_access?.[modId];
              const isRead = typeof access === 'boolean' ? access : access?.read;
              const isEdit = typeof access === 'object' ? access?.edit : false;
              return (
                <span key={modId} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold flex items-center gap-1 border border-emerald-100">
                  {mod?.icon || '📦'} {mod?.label || modId}
                  {isEdit && <span className="text-[8px] bg-indigo-500 text-white px-1 rounded">RW</span>}
                  {isRead && !isEdit && <span className="text-[8px] bg-slate-400 text-white px-1 rounded">R</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable permissions detail */}
      {permCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
        >
          {expanded ? 'Hide' : 'Show'} permissions ({permCount})
          <ChevronRight size={10} className={expanded ? 'rotate-90 transition' : 'transition'} />
        </button>
      )}

      {expanded && permCount > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2">
          {permList.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-1.5">Permissions</p>
              <div className="flex gap-1 flex-wrap">
                {permList.map((code) => (
                  <span key={code} className="px-1.5 py-0.5 rounded bg-white text-slate-600 text-[9px] font-bold border border-slate-200 font-mono">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
          {Object.entries(permObj).map(([cat, actions]) => (
            <div key={cat} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-1.5">{cat}</p>
              <div className="flex gap-1 flex-wrap">
                {(actions as string[]).map((action) => (
                  <span key={action} className="px-1.5 py-0.5 rounded bg-white text-slate-600 text-[9px] font-bold border border-slate-200">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- AUDIT LOGS ----------
function AuditLogsModule() {
  const { structuredAuditLogs, systemUsers } = useERP();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const auditEvents = useMemo(() => {
    return structuredAuditLogs.map((log: SystemAuditLog) => ({
      id: log.id,
      time: log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '',
      user: log.userName || 'Unknown',
      action: log.action,
      module: log.module || 'System',
      severity: deriveSeverity(log.action),
      details: log.details || '',
      ip: log.ipAddress || '—',
    }));
  }, [structuredAuditLogs]);

  const filtered = auditEvents.filter(e => {
    const matchesFilter = activeFilter === 'All' || e.severity === activeFilter;
    const matchesSearch = !searchTerm ||
      e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = auditEvents.filter(e => e.severity === 'Critical').length;
  const highCount = auditEvents.filter(e => e.severity === 'High').length;
  const mediumCount = auditEvents.filter(e => e.severity === 'Medium').length;
  const lowCount = auditEvents.filter(e => e.severity === 'Low').length;

  const severityCounts: Record<string, number> = { All: auditEvents.length, Critical: criticalCount, High: highCount, Medium: mediumCount, Low: lowCount };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: auditEvents.length, icon: Activity, color: 'indigo' },
          { label: 'Critical', value: criticalCount, icon: ShieldAlert, color: 'rose' },
          { label: 'High Risk', value: highCount, icon: AlertTriangle, color: 'amber' },
          { label: 'Active Users', value: systemUsers.filter((u: User) => u.status === 'Active').length, icon: Users, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${s.color}-50 text-${s.color}-600`}><s.icon size={18} /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-lg font-black text-slate-900 leading-tight">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${
                  activeFilter === f ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                {f}
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeFilter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{severityCounts[f]}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search audit log..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none w-48 focus:w-64 transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
            </div>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-50 transition">
              <Download size={12} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">IP</th>
                <th className="px-5 py-3 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="text-xs font-bold hover:bg-slate-50/50 transition cursor-pointer group">
                  <td className="px-5 py-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{e.time}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getAvatarGradient(e.user)} flex items-center justify-center text-[10px] font-black text-white`}>{e.user.charAt(0)}</div>
                      <span className="text-slate-900">{e.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono uppercase">{e.action}</span>
                  </td>
                  <td className="px-5 py-3 text-[10px] text-slate-500 max-w-xs truncate">{e.details}</td>
                  <td className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase">{e.module}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{e.ip}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                      e.severity === 'Critical' ? 'bg-rose-500 text-white' :
                      e.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      e.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        e.severity === 'Critical' ? 'bg-white' :
                        e.severity === 'High' ? 'bg-rose-500' :
                        e.severity === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      {e.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <FileSearch size={20} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400 font-bold">No audit events match your filters</p>
                      <p className="text-[10px] text-slate-300">Try adjusting severity or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- SECURITY SETTINGS ----------
function SecuritySettingsModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    passwordComplexity: globalHotelSettings.passwordComplexity || 'medium',
    forceMfa: globalHotelSettings.forceMfa ?? false,
    strictPasswordRotation: globalHotelSettings.strictPasswordRotation ?? false,
    biometricReauth: globalHotelSettings.biometricReauth ?? false,
    sessionTimeout: globalHotelSettings.sessionTimeout ?? 30,
    allowedIps: (globalHotelSettings.allowedIps || []).join('\n'),
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    submitGlobalSettingsChange(
      'Security & Authentication Policy',
      `Password complexity: ${form.passwordComplexity}, MFA: ${form.forceMfa ? 'on' : 'off'}, Session timeout: ${form.sessionTimeout}min, IP whitelist: ${form.allowedIps.split('\n').filter(Boolean).length} entries.`,
      'security-setting',
      {
        passwordComplexity: form.passwordComplexity as any,
        forceMfa: form.forceMfa,
        strictPasswordRotation: form.strictPasswordRotation,
        biometricReauth: form.biometricReauth,
        sessionTimeout: Number(form.sessionTimeout) || 30,
        allowedIps: form.allowedIps.split('\n').map(s => s.trim()).filter(Boolean),
      }
    );
    setTimeout(() => { setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2500); }, 400);
  };

  // Compute security strength score
  const securityChecks = [
    { label: 'Password Complexity', passed: form.passwordComplexity !== 'low', weight: 2 },
    { label: 'MFA Enforcement', passed: form.forceMfa, weight: 3 },
    { label: 'Password Rotation', passed: form.strictPasswordRotation, weight: 1 },
    { label: 'Biometric Re-auth', passed: form.biometricReauth, weight: 1 },
    { label: 'IP Restrictions', passed: form.allowedIps.trim().length > 0, weight: 2 },
    { label: 'Short Session Timeout', passed: form.sessionTimeout <= 60, weight: 1 },
  ];
  const maxScore = securityChecks.reduce((s, c) => s + c.weight, 0);
  const currentScore = securityChecks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const strengthPct = Math.round((currentScore / maxScore) * 100);
  const strengthLabel = strengthPct >= 80 ? 'Strong' : strengthPct >= 50 ? 'Moderate' : 'Weak';
  const strengthColor = strengthPct >= 80 ? 'emerald' : strengthPct >= 50 ? 'amber' : 'rose';

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      {/* Security Strength Summary */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield size={18} className="text-indigo-500" /> Security Posture
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black text-${strengthColor}-600`}>{strengthLabel}</span>
            <span className={`text-2xl font-black text-${strengthColor}-600`}>{strengthPct}%</span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full bg-${strengthColor}-500 rounded-full transition-all duration-500`}
            style={{ width: `${strengthPct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {securityChecks.map((check, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold ${
              check.passed
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>
              {check.passed
                ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                : <AlertTriangle size={12} className="text-slate-300 shrink-0" />}
              {check.label}
            </div>
          ))}
        </div>
      </div>

      {/* Authentication & Password Policies */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Lock size={16} className="text-indigo-500" />
          </div>
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight">Authentication & Password Policies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest">Password Complexity</label>
            <select value={form.passwordComplexity} onChange={e => setForm(f => ({ ...f, passwordComplexity: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition">
              <option value="low">Low — Minimum 6 characters</option>
              <option value="medium">Medium — 8 chars, mixed case & number</option>
              <option value="high">High — 12 chars, symbols, no dictionary words</option>
            </select>
            <div className="flex gap-1.5">
              {['low', 'medium', 'high'].map(level => (
                <div key={level} className={`h-1 flex-1 rounded-full ${
                  form.passwordComplexity === level
                    ? level === 'low' ? 'bg-rose-400' : level === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    : 'bg-slate-100'
                }`} />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest">Session Timeout (minutes)</label>
            <input type="number" min={5} max={480} value={form.sessionTimeout}
              onChange={e => setForm(f => ({ ...f, sessionTimeout: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition" />
            <p className="text-[10px] text-slate-400">Recommended: 30-60 minutes for sensitive systems</p>
          </div>
        </div>
      </div>

      {/* MFA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Smartphone size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight">Multi-Factor Authentication (MFA)</h2>
        </div>
        <div className="space-y-1">
          <ToggleRow label="Enforce MFA for all users" description="Require authenticator app or SMS OTP at every login."
            enabled={form.forceMfa} onChange={v => setForm(f => ({ ...f, forceMfa: v }))} />
          <ToggleRow label="Biometric Re-authentication" description="Prompt for biometric verification on sensitive actions."
            enabled={form.biometricReauth} onChange={v => setForm(f => ({ ...f, biometricReauth: v }))} />
          <ToggleRow label="Mandatory Password Rotation" description="Force password change every 90 days."
            enabled={form.strictPasswordRotation} onChange={v => setForm(f => ({ ...f, strictPasswordRotation: v }))} />
        </div>
      </div>

      {/* IP Access Control */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Globe size={16} className="text-amber-500" />
          </div>
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight">IP Access Control</h2>
        </div>
        <label className="text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest block mb-2">Allowed IP Addresses (one per line)</label>
        <textarea rows={4} value={form.allowedIps}
          onChange={e => setForm(f => ({ ...f, allowedIps: e.target.value }))}
          placeholder="192.168.1.0/24&#10;10.0.0.5"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none resize-none font-mono transition" />
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${form.allowedIps.trim() ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <p className="text-[10px] text-slate-400">
            {form.allowedIps.trim() ? `${form.allowedIps.split('\n').filter(Boolean).length} IP range(s) whitelisted` : 'No restrictions — all IPs allowed'}
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end sticky bottom-0 bg-slate-50/80 backdrop-blur-sm py-3 -mx-6 px-6 border-t border-slate-200">
        <button onClick={handleSave} disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm">
          {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved Successfully' : 'Save Security Policies'}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }: { label: string; description?: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{label}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <button type="button" role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ---------- ADD USER MODAL ----------
function AddUserModal({ onClose, onAddUser, loading }: { onClose: () => void; onAddUser: (userData: any) => void; loading: boolean }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'member',
    customRoleId: '',
    department: '',
    phone: '',
    forcePasswordChange: true
  });
  const [allRoles, setAllRoles] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/admin/roles', { credentials: 'include' });
        const result = await response.json();
        if (response.ok) {
          setAllRoles(result.roles || []);
        }
      } catch (e) {
        console.error('Failed to fetch roles:', e);
      }
    };
    fetchRoles();
  }, []);

  const systemRoles = allRoles.filter((r: any) => r.source === 'server' || r.isSystem);
  const customRoles = allRoles.filter((r: any) => r.source === 'custom' && !r.isSystem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserCircle2 size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Add New User</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role</label>
            <select
              value={formData.customRoleId ? `custom_${formData.customRoleId}` : formData.role}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('custom_')) {
                  const roleId = val.replace('custom_', '');
                  setFormData({ ...formData, customRoleId: roleId, role: val });
                } else {
                  setFormData({ ...formData, customRoleId: '', role: val });
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
            >
              <option value="">Select a role...</option>
              {systemRoles.length > 0 && (
                <option disabled>──────────── System Roles ────────────</option>
              )}
              {systemRoles.map((r: any) => (
                <option key={r.id} value={r.name}>{r.display_name || r.name}</option>
              ))}
              {customRoles.length > 0 && (
                <>
                  <option disabled>──────────── Custom Sub-Roles ────────────</option>
                  {DEPARTMENTS.map((dept) => {
                    const deptRoles = customRoles.filter((r: any) => r.department === dept.id);
                    if (deptRoles.length === 0) return null;
                    return (
                      <React.Fragment key={dept.id}>
                        {deptRoles.map((r: any) => (
                          <option key={r.id} value={`custom_${r.id}`}>
                            {dept.icon} {r.role_label || r.display_name} ({dept.label})
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {customRoles.filter((r: any) => !r.department).length > 0 && (
                    customRoles.filter((r: any) => !r.department).map((r: any) => (
                      <option key={r.id} value={`custom_${r.id}`}>
                        {r.role_label || r.display_name} (General)
                      </option>
                    ))
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Department</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, department: '' })}
                className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition ${
                  !formData.department ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                General
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, department: dept.id })}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-bold transition ${
                    formData.department === dept.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{dept.icon}</span> {dept.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="+251 911 234 567"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition">
            <input
              type="checkbox"
              id="forcePasswordChange"
              checked={formData.forcePasswordChange}
              onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Force password change on first login</span>
              <span className="text-[10px] text-slate-400">User will be prompted to set a new password</span>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- EDIT USER MODAL ----------
function EditUserModal({ user, onClose, onUpdateUser, loading }: { user: any; onClose: () => void; onUpdateUser: (userData: any) => void; loading: boolean }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'member',
    customRoleId: user.customRoleId || '',
    department: user.department || '',
    phone: user.mobileNumber || '',
    status: user.status || 'Active'
  });
  const [allRoles, setAllRoles] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/admin/roles', { credentials: 'include' });
        const result = await response.json();
        if (response.ok) {
          setAllRoles(result.roles || []);
        }
      } catch (e) {
        console.error('Failed to fetch roles:', e);
      }
    };
    fetchRoles();
  }, []);

  const systemRoles = allRoles.filter((r: any) => r.source === 'server' || r.isSystem);
  const customRoles = allRoles.filter((r: any) => r.source === 'custom' && !r.isSystem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Edit2 size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Edit User</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Locked">Locked</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role</label>
            <select
              value={formData.customRoleId ? `custom_${formData.customRoleId}` : formData.role}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('custom_')) {
                  const roleId = val.replace('custom_', '');
                  setFormData({ ...formData, customRoleId: roleId, role: val });
                } else {
                  setFormData({ ...formData, customRoleId: '', role: val });
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
            >
              <option value="">Select a role...</option>
              {systemRoles.length > 0 && (
                <option disabled>──────────── System Roles ────────────</option>
              )}
              {systemRoles.map((r: any) => (
                <option key={r.id} value={r.name}>{r.display_name || r.name}</option>
              ))}
              {customRoles.length > 0 && (
                <>
                  <option disabled>──────────── Custom Sub-Roles ────────────</option>
                  {DEPARTMENTS.map((dept) => {
                    const deptRoles = customRoles.filter((r: any) => r.department === dept.id);
                    if (deptRoles.length === 0) return null;
                    return (
                      <React.Fragment key={dept.id}>
                        {deptRoles.map((r: any) => (
                          <option key={r.id} value={`custom_${r.id}`}>
                            {dept.icon} {r.role_label || r.display_name} ({dept.label})
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {customRoles.filter((r: any) => !r.department).length > 0 && (
                    customRoles.filter((r: any) => !r.department).map((r: any) => (
                      <option key={r.id} value={`custom_${r.id}`}>
                        {r.role_label || r.display_name} (General)
                      </option>
                    ))
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Department</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, department: '' })}
                className={`px-2 py-2 rounded-lg border text-[10px] font-bold transition ${
                  !formData.department ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                General
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, department: dept.id })}
                  className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-bold transition ${
                    formData.department === dept.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{dept.icon}</span> {dept.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="+251 911 234 567"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- ADD ROLE MODAL ----------
function AddRoleModal({ onClose, onAddRole, loading, registry, allPermissions }: { onClose: () => void; onAddRole: (roleData: any) => void; loading: boolean; registry?: any; allPermissions?: any[] }) {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    roleLabel: '',
    department: '' as string,
    category: 'custom' as const,
    moduleAccess: {} as Record<string, any>, // Support both boolean and ModuleAccessLevel
    isSystemRole: false
  });

  const handleModuleAccessChange = (moduleId: string, key: 'read' | 'edit', value: boolean) => {
    setFormData(prev => {
      const current = prev.moduleAccess[moduleId];
      const currentAccess = typeof current === 'boolean' ? { read: current, edit: false } : (current || { read: false, edit: false });
      return {
        ...prev,
        moduleAccess: { ...prev.moduleAccess, [moduleId]: { ...currentAccess, [key]: value } }
      };
    });
  };

  const handleDepartmentChange = (deptId: string) => {
    const catMap: Record<string, string> = {
      fnb: 'food_beverage', frontoffice: 'front_office', housekeeping: 'housekeeping',
      engineering: 'engineering', finance: 'finance', hr: 'hr', inventory: 'inventory',
      sales: 'sales', procurement: 'sales', operations: 'operations'
    };
    setFormData(prev => ({
      ...prev,
      department: deptId,
      category: (catMap[deptId] || 'custom') as any,
    }));
  };

  const filteredPermissions = useMemo(() => {
    return filterPermissionsByDepartment(allPermissions || [], formData.department, registry);
  }, [allPermissions, formData.department, registry]);

  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const perm of filteredPermissions) {
      const mod = perm.module || 'other';
      if (!grouped[mod]) grouped[mod] = [];
      grouped[mod].push(perm);
    }
    return grouped;
  }, [filteredPermissions]);

  const togglePerm = (code: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (module: string, perms: any[]) => {
    const allCodes = perms.map(p => p.code);
    const allSelected = allCodes.every(c => selectedPerms.has(c));
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allCodes.forEach(c => next.delete(c));
      } else {
        allCodes.forEach(c => next.add(c));
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRole({
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      roleLabel: formData.roleLabel || undefined,
      department: formData.department || undefined,
      category: formData.category,
      moduleAccess: formData.moduleAccess,
      rbacPermissionCodes: Array.from(selectedPerms),
      isSystemRole: formData.isSystemRole
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Key size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Create Department Sub-Role</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Department</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDepartmentChange(dept.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition ${
                    formData.department === dept.id
                      ? `${DEPT_ICON_COLORS[dept.id] || 'bg-indigo-50 border-indigo-300 text-indigo-700'} border-current shadow-sm`
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">{dept.icon}</span>
                  <span>{dept.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role Name (Internal)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none font-mono transition"
                placeholder="fb_waiter"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Display Name</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
                placeholder="Waiter"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role Label (e.g. Waiter, Bartender, Chef)</label>
            <input
              type="text"
              value={formData.roleLabel}
              onChange={(e) => setFormData({ ...formData, roleLabel: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              placeholder="Waiter"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none resize-none transition"
              rows={2}
              placeholder="Role purpose"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-3">Module Access & Permissions</label>
            <ModuleAccessSelector moduleAccess={formData.moduleAccess} onChange={handleModuleAccessChange} department={formData.department} registry={registry} />
          </div>

          {/* RBAC Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest">
                RBAC Permissions ({selectedPerms.size} selected)
              </label>
              {formData.department && (
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Filtered: {DEPARTMENTS.find(d => d.id === formData.department)?.label || formData.department}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {Object.entries(permissionsByModule).map(([module, perms]) => {
                const allSelected = perms.every((p: any) => selectedPerms.has(p.code));
                const someSelected = perms.some((p: any) => selectedPerms.has(p.code));
                const moduleLabel = getModuleLabel(module, registry);
                return (
                  <div key={module} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition"
                      onClick={() => toggleModule(module, perms)}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        readOnly
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                      />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{moduleLabel}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${someSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        {perms.filter((p: any) => selectedPerms.has(p.code)).length}/{perms.length}
                      </span>
                    </div>
                    <div className="px-3 pb-3 pt-2 grid grid-cols-2 gap-2">
                      {perms.map((perm: any) => {
                        const parsed = formatPermissionCode(perm.code);
                        return (
                          <label key={perm.code} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedPerms.has(perm.code)}
                              onChange={() => togglePerm(perm.code)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-slate-700 group-hover:text-slate-900 transition block truncate">
                                {parsed.label}
                              </span>
                              <span className="text-[9px] text-slate-400 block truncate font-mono">{perm.code}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.keys(permissionsByModule).length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Lock size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold">
                    {formData.department
                      ? `No permissions mapped for ${DEPARTMENTS.find(d => d.id === formData.department)?.label || formData.department} department`
                      : 'Select a department to load relevant permissions'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white -mx-6 px-6 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- EDIT ROLE MODAL ----------
function EditRoleModal({ role, allPermissions, onClose, onUpdateRole, loading, registry }: {
  role: any;
  allPermissions: any[];
  onClose: () => void;
  onUpdateRole: (roleId: string, roleData: any) => void;
  loading: boolean;
  registry?: any;
}) {
  const existingPerms: string[] = Array.isArray(role.rbacPermissions)
    ? role.rbacPermissions
    : (Array.isArray(role.permissions)
      ? role.permissions
      : Object.values(role.permissions || {}).flat() as string[]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set(existingPerms));
  const [formData, setFormData] = useState({
    name: role.name || '',
    displayName: role.display_name || role.name || '',
    description: role.description || '',
    roleLabel: role.role_label || '',
    department: role.department || '',
    isActive: role.is_active !== false,
    moduleAccess: role.module_access || {},
  });

  const filteredPermissions = useMemo(() => {
    return filterPermissionsByDepartment(allPermissions, formData.department, registry);
  }, [allPermissions, formData.department, registry]);

  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const perm of filteredPermissions) {
      const mod = perm.module || 'other';
      if (!grouped[mod]) grouped[mod] = [];
      grouped[mod].push(perm);
    }
    return grouped;
  }, [filteredPermissions]);

  const togglePerm = (code: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (module: string, perms: any[]) => {
    const allCodes = perms.map(p => p.code);
    const allSelected = allCodes.every(c => selectedPerms.has(c));
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allCodes.forEach(c => next.delete(c));
      } else {
        allCodes.forEach(c => next.add(c));
      }
      return next;
    });
  };

  const handleModuleAccessChange = (moduleId: string, key: 'read' | 'edit', value: boolean) => {
    setFormData(prev => {
      const newAccess = { ...prev.moduleAccess };
      const existing = newAccess[moduleId];
      if (typeof existing === 'boolean') {
        newAccess[moduleId] = { read: key === 'read' ? value : existing, edit: key === 'edit' ? value : false };
      } else if (existing && typeof existing === 'object') {
        newAccess[moduleId] = { ...existing, [key]: value };
      } else {
        newAccess[moduleId] = { read: key === 'read' ? value : false, edit: key === 'edit' ? value : false };
      }
      return { ...prev, moduleAccess: newAccess };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRole(role.id, {
      name: formData.name,
      description: formData.description,
      roleLabel: formData.roleLabel || undefined,
      department: formData.department || undefined,
      rbacPermissionCodes: Array.from(selectedPerms),
      moduleAccess: formData.moduleAccess,
      is_active: formData.isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Edit2 size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Edit Role</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role Name (Internal)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none font-mono transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Display Name</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none resize-none transition"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
              >
                <option value="">No department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-2">Role Label</label>
              <input
                type="text"
                value={formData.roleLabel}
                onChange={(e) => setFormData({ ...formData, roleLabel: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
                placeholder="e.g. Waiter, Bartender"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700">Active</span>
            </label>
          </div>

          {/* Module Access */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest mb-3">Module Access & Permissions</label>
            <ModuleAccessSelector
              moduleAccess={formData.moduleAccess}
              onChange={handleModuleAccessChange}
              department={formData.department}
              registry={registry}
            />
          </div>

          {/* RBAC Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-black tracking-widest">
                RBAC Permissions ({selectedPerms.size} selected)
              </label>
              {formData.department && (
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Filtered: {DEPARTMENTS.find(d => d.id === formData.department)?.label || formData.department}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {Object.entries(permissionsByModule).map(([module, perms]) => {
                const allSelected = perms.every((p: any) => selectedPerms.has(p.code));
                const someSelected = perms.some((p: any) => selectedPerms.has(p.code));
                const moduleLabel = getModuleLabel(module, registry);
                return (
                  <div key={module} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition"
                      onClick={() => toggleModule(module, perms)}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        readOnly
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                      />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{moduleLabel}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${someSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        {perms.filter((p: any) => selectedPerms.has(p.code)).length}/{perms.length}
                      </span>
                    </div>
                    <div className="px-3 pb-3 pt-2 grid grid-cols-2 gap-2">
                      {perms.map((perm: any) => {
                        const parsed = formatPermissionCode(perm.code);
                        return (
                          <label key={perm.code} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedPerms.has(perm.code)}
                              onChange={() => togglePerm(perm.code)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-slate-700 group-hover:text-slate-900 transition block truncate">
                                {parsed.label}
                              </span>
                              <span className="text-[9px] text-slate-400 block truncate font-mono">{perm.code}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.keys(permissionsByModule).length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Lock size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold">
                    {formData.department
                      ? `No permissions mapped for ${DEPARTMENTS.find(d => d.id === formData.department)?.label || formData.department} department`
                      : 'Select a department to load relevant permissions'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white -mx-6 px-6 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
