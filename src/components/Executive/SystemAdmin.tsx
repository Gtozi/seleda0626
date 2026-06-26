import React, { useState, useEffect } from 'react';
import {
  Users, Lock, ShieldAlert, Key, Search,
  Filter, Plus, Edit2, CheckCircle, UserX, X, ShieldCheck, UserCheck, Eye,
  Activity, AlertTriangle, Fingerprint, LogOut, LayoutDashboard,
  ChevronDown, ChevronRight, Smartphone, Save, Trash2, Loader2,
  Settings, Settings2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { useSystem } from '../../context/SystemContext';
import { User, UserRole, CustomRole, SystemAuditLog, GlobalHotelSettings, checkSettingPermission } from '../../types/erp';

// Basic static layouts for dropdown options
const DEPARTMENTS = ['All', 'Executive', 'Front Office', 'Housekeeping', 'F&B', 'Maintenance', 'Inventory', 'Finance', 'HR', 'Procurement', 'Administration'];
const POSITIONS = ['Owner', 'General Manager', 'Finance Manager', 'HR Manager', 'Procurement Manager', 'Front Office Manager', 'Receptionist', 'Housekeeping Manager', 'Room Attendant', 'Auditor'];

// --------------- TYPES ---------------
interface TabButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  current: string;
  set: (id: string) => void;
}

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

interface UserManagementProps {
  users: User[];
  customRoles: CustomRole[];
  addSystemUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateSystemUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteSystemUser: (id: string) => void;
  canManageUsers: boolean;
}

interface UserProfileEditorProps {
  user: User;
  roles: CustomRole[];
  onBack: () => void;
  onSave: (updates: Partial<User>) => void;
  saveError?: string | null;
}

interface RoleManagementProps {
  customRoles: CustomRole[];
  addCustomRole: (role: Omit<CustomRole, 'id'>) => void;
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (id: string) => void;
  canManageRoles: boolean;
}

interface SecurityProtocolsProps {
  settings: GlobalHotelSettings;
  update: (settings: Partial<GlobalHotelSettings>) => void;
  canEdit: boolean;
}

interface EmergencyControlsProps {
  users: User[];
  updateSystemUser: (id: string, updates: Partial<User>) => void;
  addStructuredAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  canManageUsers: boolean;
}

interface CustomRoleEditorProps {
  role: Partial<CustomRole>;
  onBack: () => void;
  onSave: (updates: Partial<CustomRole>) => void;
}

interface SystemAdminProps {
  initialTab?: 'dashboard' | 'users' | 'roles' | 'security' | 'emergency';
  showNav?: boolean;
}

const SystemAdmin = ({ initialTab = 'dashboard', showNav = true }: SystemAdminProps) => {
  const { 
    systemUsers, 
    addSystemUser, 
    updateSystemUser, 
    deleteSystemUser,
    structuredAuditLogs, 
    addStructuredAuditLog,
    customRoles, 
    addCustomRole, 
    updateCustomRole, 
    deleteCustomRole,
    globalHotelSettings,
    updateGlobalHotelSettings,
    submitAdminChange
  } = useERP();

  const { userProfile, isSystemLoading } = useSystem();
  const currentAdminUser = systemUsers.find(u => u.email.toLowerCase() === userProfile.email.toLowerCase()) || null;
  const canManageUsers = checkSettingPermission(currentAdminUser, 'manageUserAccounts');
  const canManageRoles = checkSettingPermission(currentAdminUser, 'manageRoles');
  const canEditGlobalSettings = checkSettingPermission(currentAdminUser, 'editGlobalSettings');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'roles' | 'security' | 'emergency'>(initialTab);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  const showApprovalToast = (msg: string) => {
    setApprovalToast(msg);
    setTimeout(() => setApprovalToast(null), 5000);
  };

  const submitAddSystemUser = async (user: Omit<import('../../types/erp').User, 'id'>): Promise<void> => {
    submitAdminChange({
      title: `Create User: ${user.name}`,
      description: `New system user "${user.name}" (${user.email}) in ${user.department} department with role ${user.roleDescription}.`,
      changeType: 'user-create',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'addSystemUser', args: [user] }
    });
    showApprovalToast('User creation submitted for Executive Governance approval.');
  };

  const submitUpdateSystemUser = async (id: string, updates: Partial<import('../../types/erp').User>): Promise<void> => {
    const user = systemUsers.find(u => u.id === id);
    submitAdminChange({
      title: `Update User: ${user?.name || id}`,
      description: `Modify profile/security settings for user "${user?.name}" (${user?.email}).`,
      changeType: 'user-update',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'updateSystemUser', args: [id, updates] }
    });
    showApprovalToast('User update submitted for Executive Governance approval.');
  };

  const submitDeleteSystemUser = (id: string) => {
    const user = systemUsers.find(u => u.id === id);
    submitAdminChange({
      title: `Delete User: ${user?.name || id}`,
      description: `Permanently remove system user "${user?.name}" (${user?.email}) from the platform.`,
      changeType: 'user-delete',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'deleteSystemUser', args: [id] }
    });
    showApprovalToast('User deletion submitted for Executive Governance approval.');
  };

  const submitAddCustomRole = (role: Omit<import('../../types/erp').CustomRole, 'id'>) => {
    submitAdminChange({
      title: `Create Role: ${role.name}`,
      description: `Define new custom RBAC role "${role.name}" for ${role.department || 'All'} department.`,
      changeType: 'role-create',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'addCustomRole', args: [role] }
    });
    showApprovalToast('Role creation submitted for Executive Governance approval.');
  };

  const submitUpdateCustomRole = (id: string, updates: Partial<import('../../types/erp').CustomRole>) => {
    const role = customRoles.find(r => r.id === id);
    submitAdminChange({
      title: `Update Role: ${role?.name || id}`,
      description: `Modify RBAC permissions matrix for role "${role?.name}".`,
      changeType: 'role-update',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'updateCustomRole', args: [id, updates] }
    });
    showApprovalToast('Role update submitted for Executive Governance approval.');
  };

  const submitSecurityUpdate = (settings: Partial<import('../../types/erp').GlobalHotelSettings>) => {
    const label = Object.keys(settings).map(k => {
      if (k === 'forceMfa') return 'Force MFA for Admins';
      if (k === 'allowedIps') return 'Restrict IP Access Ranges';
      if (k === 'strictPasswordRotation') return 'Strict Password Rotation';
      if (k === 'biometricReauth') return 'Biometric Re-authentication';
      if (k === 'passwordComplexity') return 'Password Complexity';
      if (k === 'isolationPolicy') return 'Subsystem Isolation Policy';
      return k;
    }).join(', ');
    submitAdminChange({
      title: `Security Change: ${label}`,
      description: `Modify global security configuration — ${label}.`,
      changeType: 'security-setting',
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'updateGlobalHotelSettings', args: [settings] }
    });
    showApprovalToast('Security setting change submitted for Executive Governance approval.');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4">
      {/* Approval Submission Toast */}
      {approvalToast && (
        <div className="fixed top-4 right-4 z-[200] p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold bg-amber-50 text-amber-900 border border-amber-200 max-w-sm">
          <Clock size={16} className="text-amber-600 shrink-0" />
          <span>{approvalToast}</span>
        </div>
      )}
      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pb-6 relative">
        {isSystemLoading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600 mb-3" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Syncing System Data...</span>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-6 space-y-4">
          {/* Governance requirement banner */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-sans">
            <ShieldCheck size={16} className="text-amber-600 shrink-0" />
            <span className="text-amber-800 font-bold">All changes require Executive Governance approval before taking effect. Changes will be queued for review in the <span className="underline">Executive → Governance</span> tab.</span>
          </div>
          {activeTab === 'dashboard' && <SecurityDashboard logs={structuredAuditLogs} users={systemUsers} />}
          {activeTab === 'users' && <UserManagement
            users={systemUsers}
            customRoles={customRoles}
            addSystemUser={submitAddSystemUser}
            updateSystemUser={submitUpdateSystemUser}
            deleteSystemUser={submitDeleteSystemUser}
            canManageUsers={canManageUsers}
          />}
          {activeTab === 'roles' && <RoleManagement
            customRoles={customRoles}
            addCustomRole={submitAddCustomRole}
            updateCustomRole={submitUpdateCustomRole}
            deleteCustomRole={deleteCustomRole}
            canManageRoles={canManageRoles}
          />}
          {activeTab === 'security' && <SecurityProtocols settings={globalHotelSettings} update={submitSecurityUpdate} canEdit={canEditGlobalSettings} />}
          {activeTab === 'emergency' && <EmergencyControls users={systemUsers} updateSystemUser={updateSystemUser} addStructuredAuditLog={addStructuredAuditLog} canManageUsers={canManageUsers} />}
        </div>
      </div>
    </div>
  );
};

// --------------- TAB BUTTON ---------------
const TabButton = ({ id, icon, label, current, set }: TabButtonProps) => (
  <button
    onClick={() => set(id)}
    className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
      current === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
    }`}
  >
    {icon} {label}
  </button>
);

// --------------- DASHBOARD ---------------
const SecurityDashboard = ({ logs, users }: { logs: SystemAuditLog[], users: User[] }) => {
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const concurrentLogins = users.filter(u => u.lastLogin && new Date().getTime() - new Date(u.lastLogin).getTime() < 30 * 60 * 1000).length;
  const failedAttempts = logs.filter(l => l.action === 'FAILED_LOGIN' || l.details?.toLowerCase().includes('failed')).length;
  const permissionViolations = logs.filter(l => l.action === 'PERMISSION_VIOLATION' || l.details?.toLowerCase().includes('unauthorized')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Active Users" value={activeUsers} icon={<Users size={20} className="text-emerald-500" />} />
        <MetricCard title="Recent Logins (30m)" value={concurrentLogins} icon={<Activity size={20} className="text-indigo-500" />} />
        <MetricCard title="Failed Login Attempts" value={failedAttempts} icon={<ShieldAlert size={20} className="text-rose-500" />} />
        <MetricCard title="Permission Violations" value={permissionViolations} icon={<AlertTriangle size={20} className="text-amber-500" />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-sans font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2"><Activity size={18} /> System Activity Heatmap</h3>
        <div className="h-48 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono">
          [Activity Bar Chart Visualization Rendering...]
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon }: MetricCardProps) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-3xs font-mono uppercase text-slate-500 font-bold mb-1">{title}</p>
      <h3 className="text-2xl font-sans font-black text-slate-900 leading-none">{value}</h3>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
  </div>
);

// --------------- USERS MANAGEMENT ---------------
const UserManagement = ({ users, customRoles, addSystemUser, updateSystemUser, deleteSystemUser, canManageUsers }: UserManagementProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('manager');
  const [newUserRoleDesc, setNewUserRoleDesc] = useState('Department Coordinator');
  const [newUserDept, setNewUserDept] = useState('Front Office');
  const [newUserId, setNewUserId] = useState('');

  // Error feedback state
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password confirmation modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<'delete' | 'edit' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handlePasswordConfirm = async () => {
    setPasswordError(null);
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: passwordInput }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        let error = 'Password verification failed';
        try {
          const data = JSON.parse(text);
          error = data.error || error;
        } catch {
          error = text || error;
        }
        setPasswordError(error);
        return;
      }
      
      // Password verified, proceed with action
      if (passwordAction === 'delete' && pendingUser) {
        deleteSystemUser(pendingUser.id);
      } else if (passwordAction === 'edit' && pendingUser) {
        setSelectedUser(pendingUser);
      }
      setShowPasswordModal(false);
      setPasswordInput('');
      setPendingUser(null);
      setPasswordAction(null);
    } catch (err: any) {
      setPasswordError(err?.message || 'Password verification failed');
    }
  };

  const handleDeleteClick = (user: User) => {
    setPendingUser(user);
    setPasswordAction('delete');
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError(null);
  };

  const handleEditClick = (user: User) => {
    setPendingUser(user);
    setPasswordAction('edit');
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError(null);
  };

  if (selectedUser) {
    return <UserProfileEditor user={selectedUser} roles={customRoles} onBack={() => setSelectedUser(null)} onSave={(updates) => {
      setSaveError(null);
      updateSystemUser(selectedUser.id, updates)
        .then(() => setSelectedUser(null))
        .catch((err: any) => setSaveError(err?.message || 'Failed to update user'));
    }} saveError={saveError} />
  }

  // Live filter computation
  const filteredUsers = users.filter((u: User) => {
    const matchesSearch = searchTerm === '' || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.roleDescription && u.roleDescription.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesDept = deptFilter === 'All' || u.department === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Search, Filter & Quick Options */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by name, ID, email, role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:ring-2 focus:ring-slate-900 focus:outline-none" 
            />
          </div>
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-sans bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 hover:bg-slate-800 transition md:ml-auto flex-shrink-0"
        >
          <Plus size={14}/> Create Account
        </button>
      </div>

      {/* User Profiles Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500">Employee</th>
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500">Role / Position</th>
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500">Department</th>
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500">Security / MFA</th>
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500">Status</th>
              <th className="px-5 py-3 text-3xs font-mono uppercase text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u: User) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-white uppercase">{u.avatarInitials}</div>
                    <div>
                      <div className="text-xs font-sans font-bold text-slate-900">{u.name}</div>
                      <div className="text-3xs font-mono text-slate-400">{u.email} &bull; {u.employeeId || 'ID:N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-sans font-medium text-slate-700">
                  {u.customRoleId && customRoles.find(r => r.id === u.customRoleId)
                    ? customRoles.find(r => r.id === u.customRoleId)!.name
                    : u.roleDescription}
                </td>
                <td className="px-5 py-3 text-xs font-sans text-slate-500">{u.department || 'General'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Smartphone size={14} className={u.securitySettings?.twoFactorEnabled ? "text-emerald-500" : "text-slate-350"} title={u.securitySettings?.twoFactorEnabled ? "2FA Active" : "2FA Off"} />
                    <Fingerprint size={14} className="text-indigo-400" title="Zero Trust Enforced" />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    u.status === 'Locked' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {u.status || 'Active'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg inline-flex"
                      title="Edit Identity Settings"
                    >
                      <Edit2 size={13}/>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(u)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg inline-flex"
                      title="Delete Account"
                    >
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs font-sans text-slate-400">
                  No registered active users match your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Add New System User</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
              </div>

              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-sans">
                  {saveError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newUserName} 
                    onChange={(e) => setNewUserName(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. Alexis Carter"
                  />
                </div>

                <div>
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newUserEmail} 
                    onChange={(e) => setNewUserEmail(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. a.carter@lodge.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Base Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewUserRole(val);
                        const selectedCustom = customRoles.find(r => r.id === val);
                        if (selectedCustom) {
                          setNewUserRoleDesc(selectedCustom.name);
                        } else if (val === 'owner') setNewUserRoleDesc('Owner / Superadmin');
                        else if (val === 'gm') setNewUserRoleDesc('General Manager');
                        else if (val === 'receptionist') setNewUserRoleDesc('Reception Desk Clerk');
                        else setNewUserRoleDesc('Department Coordinator');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <optgroup label="System Presets">
                        <option value="owner">Owner / Board</option>
                        <option value="gm">General Manager</option>
                        <option value="manager">Manager</option>
                        <option value="receptionist">Receptionist</option>
                      </optgroup>
                      {customRoles.length > 0 && (
                        <optgroup label="Custom Roles">
                          {customRoles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Department</label>
                    <select 
                      value={newUserDept} 
                      onChange={(e) => setNewUserDept(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Employee Override ID (Optional)</label>
                  <input 
                    type="text" 
                    value={newUserId} 
                    onChange={(e) => setNewUserId(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. ERP-9923"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button
                  onClick={() => {
                    if (!newUserName || !newUserEmail) return;
                    setSaveError(null);
                    const selectedCustomRole = customRoles.find(r => r.id === newUserRole);
                    addSystemUser({
                      name: newUserName,
                      email: newUserEmail,
                      role: selectedCustomRole ? 'custom' : (newUserRole as any),
                      roleDescription: newUserRoleDesc,
                      customRoleId: selectedCustomRole ? selectedCustomRole.id : undefined,
                      avatarInitials: newUserName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SU',
                      status: 'Active',
                      employeeId: newUserId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
                      department: newUserDept,
                      securitySettings: {
                        twoFactorEnabled: true,
                        sessionTimeoutMins: 15,
                        ipRestrictions: 'All',
                        deviceRestrictions: 'All',
                        forcePasswordChange: false
                      }
                    }).then(() => {
                      setShowCreateModal(false);
                      setNewUserName('');
                      setNewUserEmail('');
                      setNewUserId('');
                    }).catch((err: any) => setSaveError(err?.message || 'Failed to create user'));
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition hover:scale-105"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Confirmation Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {passwordAction === 'delete' ? 'Confirm Deletion' : 'Confirm Edit'}
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
              </div>

              <p className="text-sm text-slate-600">
                {passwordAction === 'delete'
                  ? `You are about to permanently delete the account for ${pendingUser?.name}. This action cannot be undone.`
                  : `You are about to edit the account for ${pendingUser?.name}. Please confirm your identity.`}
              </p>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-sans">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold block mb-1">Enter Your Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowPasswordModal(false)} className="px-5 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button
                  onClick={handlePasswordConfirm}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition hover:scale-105"
                >
                  {passwordAction === 'delete' ? 'Delete Account' : 'Continue to Edit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserProfileEditor = ({ user, roles, onBack, onSave, saveError }: UserProfileEditorProps) => {
  const isCustomRole = user.customRoleId && roles.some(r => r.id === user.customRoleId);
  const [formData, setFormData] = useState({
    name: user.name,
    employeeId: user.employeeId || '',
    department: user.department || 'General',
    role: isCustomRole ? user.customRoleId! : (user.role || 'frontoffice'),
    twoFactorEnabled: user.securitySettings?.twoFactorEnabled ?? true,
    ipWhitelistEnabled: false,
    propertyAccess: user.dataRestrictions?.propertyAccess || 'Single',
  });

  const handleSave = () => {
    const selectedCustomRole = roles.find(r => r.id === formData.role);
    onSave({
      name: formData.name,
      employeeId: formData.employeeId,
      department: formData.department,
      role: selectedCustomRole ? 'custom' : (formData.role as UserRole),
      customRoleId: selectedCustomRole ? selectedCustomRole.id : undefined,
      roleDescription: selectedCustomRole ? selectedCustomRole.name : undefined,
      securitySettings: {
        ...(user.securitySettings || { sessionTimeoutMins: 15, ipRestrictions: 'All', deviceRestrictions: 'All', forcePasswordChange: false }),
        twoFactorEnabled: formData.twoFactorEnabled,
      },
      dataRestrictions: {
        ...(user.dataRestrictions || { allowAllDepartments: false, allowedDepartments: [] }),
        propertyAccess: formData.propertyAccess as 'Single' | 'Multiple' | 'Corporate',
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fade-in relative">
      <button onClick={onBack} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><X size={18} /></button>
      {saveError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-sans">
          {saveError}
        </div>
      )}
      <h3 className="text-xl font-sans font-black text-slate-900 mb-6 flex items-center gap-2"><UserCheck /> Edit Profiling & Security: {user.name}</h3>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase text-slate-500 font-bold border-b border-slate-100 pb-2">Core Identity</h4>
          <div className="space-y-3">
            <div>
              <label className="text-3xs font-mono uppercase text-slate-400">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-mono uppercase text-slate-400">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans"
                />
              </div>
              <div>
                <label className="text-3xs font-mono uppercase text-slate-400">Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-white"
                >
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
             <div>
              <label className="text-3xs font-mono uppercase text-slate-400">RBAC Base Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-amber-50 border-amber-200 text-amber-900"
              >
                <optgroup label="System Presets">
                  <option value="owner">Owner / Board</option>
                  <option value="gm">General Manager</option>
                  <option value="frontoffice">Front Office</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="f&b">F&B</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inventory">Inventory</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                  <option value="procurement">Procurement</option>
                </optgroup>
                {roles.length > 0 && (
                  <optgroup label="Custom Roles">
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-xs font-mono uppercase text-slate-500 font-bold border-b border-slate-100 pb-2">Governance & Security Parameters</h4>
           <div className="space-y-3">
             <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
               <div>
                 <div className="text-xs font-sans font-bold text-slate-800">Two-Factor Authentication</div>
                 <div className="text-3xs text-slate-400 font-mono">Enforce MFA via Authenticator App</div>
               </div>
               <input
                 type="checkbox"
                 className="h-4 w-4 bg-white"
                 checked={formData.twoFactorEnabled}
                 onChange={e => setFormData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
               />
             </label>
             <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
               <div>
                 <div className="text-xs font-sans font-bold text-slate-800">IP Whitelist Strict Locking</div>
                 <div className="text-3xs text-slate-400 font-mono">Block login originating outside registered IPs</div>
               </div>
               <input
                 type="checkbox"
                 className="h-4 w-4 bg-white"
                 checked={formData.ipWhitelistEnabled}
                 onChange={e => setFormData(prev => ({ ...prev, ipWhitelistEnabled: e.target.checked }))}
               />
             </label>
             <div>
                <label className="text-3xs font-mono uppercase text-slate-400">Data Boundary (Property Level)</label>
                <select
                  value={formData.propertyAccess}
                  onChange={e => setFormData(prev => ({ ...prev, propertyAccess: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-white"
                >
                  <option value="Single">Local Property Only</option>
                  <option value="Multiple">Regional Cluster</option>
                  <option value="Corporate">All Global Properties</option>
                </select>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onBack} className="px-6 py-2 border border-slate-200 rounded-xl text-xs font-sans font-bold">Cancel</button>
        <button onClick={handleSave} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-sans font-bold hover:bg-slate-800 transition">Deploy Identity Policies</button>
      </div>
    </div>
  );
}

// --------------- ROLES MANAGEMENT ---------------
const RoleManagement = ({ customRoles, addCustomRole, updateCustomRole, deleteCustomRole, canManageRoles }: RoleManagementProps) => {
    const [selectedRole, setSelectedRole] = useState<Partial<CustomRole> | null>(null);

    if (selectedRole) {
      return <CustomRoleEditor 
               role={selectedRole} 
               onBack={() => setSelectedRole(null)} 
               onSave={(updates: Partial<CustomRole>) => {
                 if (selectedRole.id) {
                     updateCustomRole(selectedRole.id, updates);
                 } else {
                     addCustomRole(updates as Omit<CustomRole, 'id'>);
                 }
                 setSelectedRole(null);
               }} 
             />
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <h2 className="text-lg font-sans font-black text-slate-900 tracking-tight flex items-center gap-2"><Key size={20} className="text-indigo-600"/> Institutional Role Definitions & Matrix</h2>
                 {canManageRoles && (
                   <button onClick={() => setSelectedRole({ modulePermissions: {}, tabPermissions: {}, buttonPermissions: {}, fieldPermissions: {} })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 hover:bg-slate-800 transition"><Plus size={14}/> Define Custom Role</button>
                 )}
             </div>

             <div className="grid grid-cols-4 gap-6">
                 <div className="col-span-1 space-y-4">
                     <p className="text-3xs font-mono uppercase text-slate-400 font-bold ml-1">Defined Roles ({customRoles.length + 4})</p>
                     
                     <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 flex flex-col gap-2">
                       <div className="text-3xs font-mono uppercase text-slate-400 font-bold px-2 py-1">System Presets</div>
                       <div className="p-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-medium cursor-not-allowed border border-slate-200 flex justify-between items-center opacity-70">Owner / Superadmin <ShieldCheck size={14} className="text-emerald-500" /></div>
                       <div className="p-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-medium cursor-not-allowed border border-slate-200 flex justify-between items-center opacity-70">General Manager <ShieldCheck size={14} className="text-emerald-500" /></div>
                       <div className="p-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-medium cursor-not-allowed border border-slate-200 flex justify-between items-center opacity-70">Front Office <ShieldCheck size={14} className="text-emerald-500" /></div>
                       <div className="p-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-medium cursor-not-allowed border border-slate-200 flex justify-between items-center opacity-70">Housekeeping <ShieldCheck size={14} className="text-emerald-500" /></div>
                     </div>

                     <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 flex flex-col gap-2">
                       <div className="text-3xs font-mono uppercase text-slate-400 font-bold px-2 py-1">Custom Defined Variables</div>
                       {customRoles.map((r: CustomRole) => (
                         <div key={r.id} onClick={() => canManageRoles && setSelectedRole(r)} className={`p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-sans font-bold border border-indigo-100 transition shadow-sm flex items-center justify-between group ${canManageRoles ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                            {r.name}
                            {canManageRoles && <Edit2 size={12} className="opacity-0 group-hover:opacity-100" />}
                         </div>
                       ))}
                       {customRoles.length === 0 && (
                          <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">No custom roles defined.</div>
                       )}
                     </div>
                 </div>

                 <div className="col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6 flex items-center justify-center text-center">
                    <div>
                      <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                        <Settings2 size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-sans font-black text-slate-900 tracking-tight">Select a Role to View Matrix</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-md">Every permission vector is cryptographically mapped to specific departments, fields, tabs, and export operations. Create a new custom role to begin editing.</p>
                      {canManageRoles && (
                        <button onClick={() => setSelectedRole({ modulePermissions: {}, tabPermissions: {}, buttonPermissions: {}, fieldPermissions: {} })} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-700 font-bold font-sans rounded-xl text-sm border border-indigo-100 hover:bg-indigo-100 transition inline-flex items-center gap-2 shadow-sm">
                          <Plus size={16} /> Define New Role
                        </button>
                      )}
                    </div>
                 </div>
             </div>
        </div>
    );
}

const CustomRoleEditor = ({ role, onBack, onSave }: CustomRoleEditorProps) => {
  const [formData, setFormData] = useState<Partial<CustomRole> & { name: string; description: string; department: string }>({
    name: role.name || '',
    description: role.description || '',
    department: role.department || 'All',
    modulePermissions: role.modulePermissions || {},
    fieldPermissions: role.fieldPermissions || {},
  });

  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const DEPARTMENT_MODULES: Record<string, string[]> = {
    'Front Office': ['FO Dashboard', 'Reservations', 'Folios & Billing', 'CRM & Profiles', 'Sales Campaigns', 'Reports & Audits'],
    'Housekeeping': ['HK Dashboard', 'Room Management', 'Laundry & Linen', 'Inventory & Amenities', 'Lost & Found', 'HK Reports'],
    'Maintenance': ['Maintenance Dashboard', 'Work Orders', 'Preventive Maintenance', 'Asset Management', 'Contractors & Utils'],
    'F&B': ['F&B Dashboard', 'Point of Sale (POS)', 'Kitchen Operations', 'Banquets & Catering', 'Menu & Inventory'],
    'Inventory': ['Inventory Dashboard', 'Store Operations', 'Stock Control'],
    'Finance': ['Finance Dashboard', 'Accounts Receivable (AR)', 'Accounts Payable (AP)', 'Cash & Bank', 'General Ledger', 'Tax & Compliance'],
    'HR': ['HR Dashboard', 'Employee Lifecycle', 'Attendance & Leave', 'Payroll & Benefits'],
    'Procurement': ['Procurement Dashboard', 'Purchasing', 'Vendor Management'],
    'Administration': ['Admin Dashboard', 'User Access & Security', 'System Config', 'Data & Logs']
  };

  const MODULE_GRANULARITY: Record<string, { tabs: string[], actions: string[] }> = {
    'FO Dashboard': {
      tabs: ['Overview', 'Arrivals/Departures', 'Task Feed', 'Occupancy Stats'],
      actions: ['View Metrics', 'Customize Widgets', 'Refresh Data', 'Filter by Date Range']
    },
    'Reservations': {
      tabs: ['Walk-in Check-in', 'Bookings Registry', 'Rooms Outlook Timeline', 'Channel Manager (OTA)', 'Yield & Dynamic Pricing', 'Rate Plans & Packages', 'AI Forecasting'],
      actions: ['Create Reservation', 'Edit Reservation', 'Cancel Reservation', 'Apply Discount', 'Override Rate', 'Assign Room', 'Change Dates']
    },
    'Folios & Billing': {
      tabs: ['In-House Folios', 'Guest Ledger', 'City Ledger (Corporate)', 'Disputed Charges'],
      actions: ['Post Charge', 'Void Charge', 'Process Payment', 'Split Folio', 'Merge Folio', 'Checkout', 'Print Document', 'Export PDF']
    },
    'CRM & Profiles': {
      tabs: ['Guest History', 'VIP Management', 'Concierge Requests', 'Wake-up Calls', 'Transport & Airport Transfers', 'Messaging & Communications'],
      actions: ['Create Profile', 'Merge Profiles', 'Add Preferences', 'Log Incident', 'Send Email/SMS', 'Schedule Routine']
    },
    'Sales Campaigns': {
      tabs: ['Sales Campaign Tracker', 'Promotion Codes', 'Corporate Accounts', 'Group Blocks'],
      actions: ['Add Campaign', 'Edit Campaign', 'Delete Campaign', 'Generate Promo', 'Approve Corporate Rate', 'Disable Promo']
    },
    'Reports & Audits': {
      tabs: ['Night Audit', 'Cashier Shift Reports', 'Manager Flash Report', 'Discrepancy Checks'],
      actions: ['Run Night Audit', 'Roll System Date', 'Export to General Ledger', 'Print Shift Report', 'Approve Audit', 'Filter by Date Range']
    },
    'HK Dashboard': {
      tabs: ['Overview', 'Staff Status', 'Zone Map'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Room Management': {
      tabs: ['Room Cleaning', 'Room Inspection', 'Room Attendant Routes', 'Deep Cleaning', 'Cleaning Schedules'],
      actions: ['Assign Room', 'Change Status', 'Verify Clean', 'Add Note', 'Print Sheet']
    },
    'Laundry & Linen': {
      tabs: ['Laundry Operations', 'Linen Store', 'Guest Laundry Requests'],
      actions: ['Accept Batch', 'Update Stock', 'Bill Guest', 'Discard Damaged']
    },
    'Inventory & Amenities': {
      tabs: ['Minibar Refill', 'Amenities Inventory', 'Cart Stock'],
      actions: ['Request Stock', 'Post Minibar Charge', 'Audit Cart']
    },
    'Lost & Found': {
      tabs: ['Reported Items', 'Claimed Items', 'Disposed Items'],
      actions: ['Log Item', 'Update Status', 'Print Tag', 'Process Shipping']
    },
    'HK Reports': {
      tabs: ['Productivity Report', 'Discrepancy Report', 'Turnaround Times'],
      actions: ['Generate', 'Export PDF', 'Print', 'Filter by Date Range']
    },
    'Maintenance Dashboard': {
      tabs: ['Open Issues', 'Critical Alerts', 'Technician Status'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Work Orders': {
      tabs: ['New Requests', 'In Progress', 'Completed', 'On Hold'],
      actions: ['Create WO', 'Assign Tech', 'Update Status', 'Close WO', 'Add Parts Cost']
    },
    'Preventive Maintenance': {
      tabs: ['Schedules', 'Checklists', 'Compliance Logs'],
      actions: ['Create Schedule', 'Acknowledge Task', 'Edit Checklist']
    },
    'Asset Management': {
      tabs: ['Equipment Registry', 'Calibration Logs', 'Warranties'],
      actions: ['Add Asset', 'Decommission', 'Log Calibration', 'Upload Warranty']
    },
    'Contractors & Utils': {
      tabs: ['Third-Party Contractors', 'Utility Readings', 'Landscaping', 'Pool Maintenance'],
      actions: ['Log Reading', 'Add Invoice', 'Rate Service', 'Schedule Visit']
    },
    'F&B Dashboard': {
      tabs: ['Revenue Today', 'Active Tables', 'Stock Alerts'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Point of Sale (POS)': {
      tabs: ['Restaurant POS', 'Bar POS', 'Room Service (IRD)', 'Voids & Discounts'],
      actions: ['Open Table', 'Take Order', 'Settle Bill', 'Transfer to Room', 'Apply Void/Discount']
    },
    'Kitchen Operations': {
      tabs: ['Kitchen Display System (KDS)', 'Preparation Times', 'Order Queue'],
      actions: ['Bump Order', 'Mark Ready', '86 Item']
    },
    'Banquets & Catering': {
      tabs: ['Event Calendar', 'BEOs', 'Resource Allocation'],
      actions: ['Create BEO', 'Edit Requirement', 'Approve Event', 'Generate Invoice']
    },
    'Menu & Inventory': {
      tabs: ['Menu Engineering', 'Recipe Management', 'Costing Analysis'],
      actions: ['Add Item', 'Update Price', 'Modify Recipe', 'Run Cost Report']
    },
    'Inventory Dashboard': {
      tabs: ['Low Stock Alerts', 'Recent Movements', 'Valuation Summary'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Store Operations': {
      tabs: ['Main Store', 'Warehouse Transfers', 'Goods Receipt (GRN)'],
      actions: ['Process GRN', 'Approve Transfer', 'Reject Goods', 'Print Barcode']
    },
    'Stock Control': {
      tabs: ['Stock Movements', 'Stock Adjustments', 'Par Levels', 'Perishable Stock', 'Wastage & Damages'],
      actions: ['Adjust Stock', 'Log Wastage', 'Set Par Level', 'Perform Count']
    },
    'Finance Dashboard': {
      tabs: ['Cash Flow', 'Revenue Summary', 'Pending Approvals'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Accounts Receivable (AR)': {
      tabs: ['Invoices', 'City Ledger', 'Aging Report', 'Payment Gateways'],
      actions: ['Generate Invoice', 'Process Payment', 'Send Reminder', 'Write-off']
    },
    'Accounts Payable (AP)': {
      tabs: ['Vendor Bills', 'Pending Payments', 'Paid Invoices'],
      actions: ['Post Bill', 'Approve Payment', 'Schedule Transfer', 'Hold Payment']
    },
    'Cash & Bank': {
      tabs: ['Cash Management', 'Bank Accounts', 'Reconciliation'],
      actions: ['Add Account', 'Reconcile Statement', 'Petty Cash Entry']
    },
    'General Ledger': {
      tabs: ['Journal Entries', 'Chart of Accounts', 'Trial Balance', 'Balance Sheet', 'Profit and Loss', 'End of Day/Month'],
      actions: ['Post Entry', 'Open/Close Period', 'Reverse Entry', 'Run Financial Reports', 'Filter by Date Range']
    },
    'Tax & Compliance': {
      tabs: ['Tax Configurations', 'Fixed Assets', 'Budgeting & Forecasting'],
      actions: ['Update Tax Rate', 'Depreciate Asset', 'Set Budget']
    },
    'HR Dashboard': {
      tabs: ['Headcount', 'Announcements', 'Pending Leaves'],
      actions: ['View Metrics', 'Refresh Data', 'Post Announcement', 'Filter by Date Range']
    },
    'Employee Lifecycle': {
      tabs: ['Employee Directory', 'Recruitment & Onboarding', 'Performance Reviews', 'Training & Development'],
      actions: ['Add Employee', 'Terminate', 'Edit Profile', 'Log Review', 'Upload Document']
    },
    'Attendance & Leave': {
      tabs: ['Shift Roster', 'Time Tracking', 'Leave Management'],
      actions: ['Approve Leave', 'Edit Roster', 'Override Clock-in', 'Filter by Date Range']
    },
    'Payroll & Benefits': {
      tabs: ['Payroll Processing', 'Employee Loans', 'Deductions & Allowances', 'Payslips'],
      actions: ['Run Payroll', 'Approve Loan', 'Edit Allowances', 'Generate Payslips']
    },
    'Procurement Dashboard': {
      tabs: ['Spend Analysis', 'Pending PRs', 'Expiring Contracts'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'Purchasing': {
      tabs: ['Purchase Requests (PR)', 'RFQ / Tenders', 'Purchase Orders (PO)', 'Invoice Matching'],
      actions: ['Create PR', 'Approve PR', 'Generate PO', 'Send RFQ', 'Match Invoice']
    },
    'Vendor Management': {
      tabs: ['Vendor Database', 'Vendor Contracts', 'Quality Control', 'Return to Vendor (RTV)'],
      actions: ['Add Vendor', 'Evaluate Vendor', 'Upload Contract', 'Process RTV']
    },
    'Admin Dashboard': {
      tabs: ['System Health', 'Active Sessions', 'Storage Usage'],
      actions: ['View Metrics', 'Refresh Data', 'Filter by Date Range']
    },
    'User Access & Security': {
      tabs: ['User Management', 'Roles & Permissions', 'License Management'],
      actions: ['Create User', 'Edit Role Policy', 'Lock Account', 'Assign License']
    },
    'System Config': {
      tabs: ['System Settings', 'Global Tax Rules', 'Integrations & API', 'Email & SMS Setup'],
      actions: ['Update Settings', 'Generate API Key', 'Configure Templates']
    },
    'Data & Logs': {
      tabs: ['Audit Logs', 'Backup & Recovery', 'Document Management'],
      actions: ['View Logs', 'Export Logs', 'Initiate Backup', 'Restore Data', 'Filter by Date Range']
    }
  };

  const getModuleGranularity = (mod: string) => {
    return MODULE_GRANULARITY[mod] || {
      tabs: ['Dashboard', 'Main View', 'Reports', 'Settings'],
      actions: ['Add Record', 'Edit Record', 'Delete Record', 'Export Data', 'Print Document', 'Approve Workflow']
    };
  };

  const getActiveModules = () => {
    if (formData.department === 'All' || formData.department === 'Executive') {
      return Array.from(new Set(Object.values(DEPARTMENT_MODULES).flat()));
    }
    return Array.from(new Set(DEPARTMENT_MODULES[formData.department] || []));
  };

  const currentModules = getActiveModules();

  const handleModuleToggle = (mod: string, perm: string) => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: {
        ...prev.modulePermissions,
        [mod]: {
          ...(prev.modulePermissions?.[mod] || { view: false, create: false, edit: false, delete: false, approve: false, export: false, print: false }),
          [perm]: !(prev.modulePermissions?.[mod] as Record<string, boolean>)?.[perm]
        }
      }
    }));
  };

  const permsKeys = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fade-in relative z-20">
      <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
        <div>
           <h3 className="text-xl font-sans font-black text-slate-900 mb-1 flex items-center gap-2"><Key size={20} className="text-indigo-600"/> {role.id ? 'Edit Role Policy Matrix' : 'Define New Custom Role'}</h3>
           <p className="text-xs text-slate-500 font-sans">Granular control over RBAC policies, structural access, and UI actions.</p>
        </div>
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl hover:bg-slate-100 transition"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-5 border-r border-slate-100 pr-6">
          <h4 className="text-sm font-sans font-bold text-slate-900">Role Base Structure</h4>
          <div>
            <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Role Title</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Night Auditor Lead" className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Base Department</label>
            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
               {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Description / Purpose</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]" placeholder="Brief context about this operational role..."></textarea>
          </div>
          
          <div className="pt-4 space-y-4">
             <h4 className="text-sm font-sans font-bold text-slate-900">Field-Level Constraints</h4>
             <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-2xs font-mono uppercase text-slate-400 font-bold">Employee Salary Masks</p>
                    <select className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-slate-50"><option>Masked/Hidden</option><option>Read Only</option><option>Full Edit</option></select>
                </div>
                <div className="space-y-1">
                    <p className="text-2xs font-mono uppercase text-slate-400 font-bold">Vendor Banking Routing</p>
                    <select className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-slate-50"><option>Masked/Hidden</option><option>Read Only</option><option>Full Edit</option></select>
                </div>
                <div className="space-y-1">
                    <p className="text-2xs font-mono uppercase text-slate-400 font-bold">Room Rate Discount Base</p>
                    <select className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-slate-50"><option>No Access</option><option>View Only</option><option>Override Max 15%</option><option>Full Uncapped Override</option></select>
                </div>
             </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
           <h3 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2"><LayoutDashboard size={18} className="text-slate-400"/> All Modules Regardless Their Hierarchy</h3>
           
           <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-8 gap-0 bg-slate-100 p-3 text-3xs font-mono uppercase text-slate-500 font-bold border-b border-slate-200">
                    <div className="col-span-2">Module Vector</div>
                    <div className="text-center">View</div>
                    <div className="text-center">Create</div>
                    <div className="text-center">Edit</div>
                    <div className="text-center">Delete</div>
                    <div className="text-center">Approve</div>
                    <div className="text-center">Export</div>
                </div>
                <div className="bg-slate-50 max-h-[400px] overflow-y-auto">
                    {currentModules.map((mod: string) => {
                        const mState = formData.modulePermissions[mod] || {};
                        return (
                        <div key={mod} className="flex flex-col border-b border-slate-100 last:border-0 hover:bg-white transition">
                            <div className="grid grid-cols-8 gap-0 p-3 items-center">
                                <div className="col-span-2 text-xs font-sans font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer hover:text-indigo-600" onClick={() => setExpandedModule(expandedModule === mod ? null : mod)}>
                                    {expandedModule === mod ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                    {mod}
                                </div>
                                {permsKeys.map((p) => (
                                    <div key={p} className="flex justify-center">
                                        <div 
                                          onClick={() => handleModuleToggle(mod, p)}
                                          className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition ${
                                            mState[p] ? 'bg-indigo-500 border-indigo-600 text-white shadow-inner' : 'bg-white border-slate-300 text-transparent hover:border-indigo-300'
                                        }`}>
                                            <CheckCircle size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {expandedModule === mod && (
                                <div className="pl-8 pr-4 pb-4 animate-fade-in bg-slate-50 border-t border-slate-100/60 pt-3">
                                   <div className="grid grid-cols-2 gap-6">
                                      {/* TABS */}
                                      <div>
                                         <div className="flex items-center justify-between mb-2">
                                           <h5 className="text-3xs font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5"><LayoutDashboard size={12}/> Allowed Tabs / Pages</h5>
                                           <button 
                                              onClick={() => {
                                                  const tabs = Array.from(new Set(getModuleGranularity(mod).tabs));
                                                  const allSelected = tabs.every(t => formData.tabPermissions?.[`${mod}_${t}`]);
                                                  const updates: any = {};
                                                  tabs.forEach(t => updates[`${mod}_${t}`] = !allSelected);
                                                  setFormData(prev => ({...prev, tabPermissions: {...(prev.tabPermissions || {}), ...updates}}));
                                              }}
                                              className="text-[10px] font-sans text-indigo-600 font-bold hover:underline uppercase"
                                           >
                                              Select All
                                           </button>
                                         </div>
                                         <div className="space-y-1">
                                             {Array.from(new Set(getModuleGranularity(mod).tabs)).map(tab => {
                                                 const tabKey = `${mod}_${tab}`;
                                                 return (
                                                 <label key={tab} className="flex items-center gap-2 text-xs font-sans text-slate-700 cursor-pointer">
                                                     <input type="checkbox" className="h-3 w-3 text-indigo-600 rounded border-slate-300 bg-white" 
                                                       checked={!!formData.tabPermissions?.[tabKey]}
                                                       onChange={(e) => setFormData(prev => ({...prev, tabPermissions: {...(prev.tabPermissions || {}), [tabKey]: e.target.checked}}))}
                                                     />
                                                     {tab}
                                                 </label>
                                             )})}
                                         </div>
                                      </div>
                                      {/* ACTIONS */}
                                      <div>
                                         <div className="flex items-center justify-between mb-2">
                                           <h5 className="text-3xs font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5"><Settings size={12}/> Permitted Actions</h5>
                                           <button 
                                              onClick={() => {
                                                  const actions = Array.from(new Set(getModuleGranularity(mod).actions));
                                                  const allSelected = actions.every(a => formData.buttonPermissions?.[`${mod}_${a}`]);
                                                  const updates: any = {};
                                                  actions.forEach(a => updates[`${mod}_${a}`] = !allSelected);
                                                  setFormData(prev => ({...prev, buttonPermissions: {...(prev.buttonPermissions || {}), ...updates}}));
                                              }}
                                              className="text-[10px] font-sans text-emerald-600 font-bold hover:underline uppercase"
                                           >
                                              Select All
                                           </button>
                                         </div>
                                         <div className="space-y-1">
                                             {Array.from(new Set(getModuleGranularity(mod).actions)).map(action => {
                                                 const actionKey = `${mod}_${action}`;
                                                 return (
                                                 <label key={action} className="flex items-center gap-2 text-xs font-sans text-slate-700 cursor-pointer">
                                                     <input type="checkbox" className="h-3 w-3 text-emerald-600 rounded border-slate-300 bg-white"
                                                        checked={!!formData.buttonPermissions?.[actionKey]}
                                                        onChange={(e) => setFormData(prev => ({...prev, buttonPermissions: {...(prev.buttonPermissions || {}), [actionKey]: e.target.checked}}))}
                                                     />
                                                     {action}
                                                 </label>
                                             )})}
                                         </div>
                                      </div>
                                   </div>
                                </div>
                            )}
                        </div>
                    )})}
                </div>
           </div>

           <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 mt-6">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <div>
                   <h4 className="text-sm font-sans font-bold text-slate-900">Warning: Matrix Evaluation Precedence</h4>
                   <p className="text-xs text-slate-600 font-sans mt-0.5">Custom role assignment overrides all implicit user-level tabs explicitly. If you define a matrix here and apply it to an existing user, any legacy user 'allowedTabs' array will be discarded in favor of this zero-trust model calculation.</p>
                </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
        <button onClick={onBack} className="px-6 py-2 border border-slate-200 hover:bg-slate-50 transition rounded-xl text-xs font-sans font-bold">Cancel</button>
        <button 
          onClick={() => {
            if (!formData.name) return alert('Role title is required');
            onSave(formData);
          }} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-sans font-bold flex items-center gap-2 shadow-sm shadow-indigo-200">
          <ShieldCheck size={16} /> Mint Role Layout
        </button>
      </div>
    </div>
  )
}


// --------------- EMERGENCY ---------------
const EmergencyControls = ({ users, updateSystemUser, addStructuredAuditLog, canManageUsers }: EmergencyControlsProps) => {
  const [simUserId, setSimUserId] = useState('');

  const handleQuarantine = () => {
    if (!window.confirm('CRITICAL: This will lock ALL non-superadmin accounts immediately. Are you absolutely sure?')) return;
    users.forEach(u => {
      if (u.role !== 'executive' && (u.role as string) !== 'owner') {
        updateSystemUser(u.id, { status: 'Locked' });
      }
    });
    addStructuredAuditLog({
      userId: 'SYSTEM',
      userName: 'Emergency Control',
      device: 'Admin Console',
      ipAddress: '127.0.0.1',
      module: 'EMERGENCY',
      action: 'QUARANTINE',
      details: 'Locked all non-executive user accounts via emergency quarantine.',
    });
  };

  const handleSeverSessions = () => {
    if (!window.confirm('WARNING: This will clear all active login sessions. All users will be forced to re-authenticate. Continue?')) return;
    users.forEach(u => {
      updateSystemUser(u.id, { lastLogin: undefined });
    });
    addStructuredAuditLog({
      userId: 'SYSTEM',
      userName: 'Emergency Control',
      device: 'Admin Console',
      ipAddress: '127.0.0.1',
      module: 'EMERGENCY',
      action: 'SEVER_SESSIONS',
      details: 'Cleared all user lastLogin timestamps to force re-authentication.',
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-white border-2 border-rose-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-sans font-black text-rose-800 tracking-tight flex items-center gap-2 mb-1"><AlertTriangle size={18}/> Red/Zero-Day Actions</h3>
          <p className="text-xs text-rose-600/80 font-sans">Immediate destructive and lockdown system overrides.</p>
        </div>

        {canManageUsers ? (
          <div className="space-y-3">
            <button onClick={handleQuarantine} className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition text-left group cursor-pointer">
              <div>
                <p className="text-sm font-sans font-bold text-rose-900 group-hover:text-rose-950">Quarantine Data Store Vectors</p>
                <p className="text-xs font-sans text-rose-700">Blocks all non-superadmin reads/writes instantly.</p>
              </div>
              <Lock size={20} className="text-rose-500"/>
            </button>
            <button onClick={handleSeverSessions} className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition text-left group cursor-pointer">
              <div>
                <p className="text-sm font-sans font-bold text-rose-900 group-hover:text-rose-950">Sever Concurrent Sessions</p>
                <p className="text-xs font-sans text-rose-700">Force immediate logout globally.</p>
              </div>
              <LogOut size={20} className="text-rose-500"/>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-sans">
            You do not have permission to execute emergency controls. Contact a system administrator.
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Eye size={120} className="text-white"/></div>
        <div className="relative z-10">
          <h3 className="text-lg font-sans font-black text-white tracking-tight gap-2 mb-1">Perspective Simulation</h3>
          <p className="text-xs text-slate-400 font-sans">Assume identity to simulate visual layout constraints and permission ceilings explicitly. "View As" Tooling.</p>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-3xs font-mono uppercase text-slate-400">Target Vector Entity</label>
            <select
              value={simUserId}
              onChange={e => setSimUserId(e.target.value)}
              className="w-full p-3 bg-slate-800 text-white border border-slate-700 rounded-xl text-sm font-sans focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select a user...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.roleDescription}</option>)}
            </select>
          </div>
          <button
            onClick={() => {
              if (!simUserId) return;
              const target = users.find(u => u.id === simUserId);
              if (target) {
                alert(`Simulating view as: ${target.name}\nRole: ${target.roleDescription}\nDepartment: ${target.department || 'N/A'}\nAllowed tabs: ${target.allowedTabs?.join(', ') || 'Default'}`);
              }
            }}
            disabled={!simUserId}
            className="w-full p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold font-sans rounded-xl text-sm transition cursor-pointer"
          >
            Initiate Render Simulation Overlays
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------- SECURITY PROTOCOLS ---------------
const SecurityProtocols = ({ settings, update, canEdit }: SecurityProtocolsProps) => {
  const [showIsolationModal, setShowIsolationModal] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [isolationSettings, setIsolationSettings] = useState({
    financeEnabled: settings.isolationPolicy?.finance ?? false,
    hrEnabled: settings.isolationPolicy?.hr ?? false,
    executiveEnabled: settings.isolationPolicy?.executive ?? false,
    dualSignatureRequired: settings.isolationPolicy?.dualSignature ?? false,
  });

  const protocols = [
    { key: 'forceMfa' as const, label: 'Force MFA for Admins', checked: settings.forceMfa ?? true, desc: 'Enforce dual factor authentication via authorization apps.' },
    { key: 'restrictIp' as const, label: 'Restrict IP Access Ranges', checked: settings.allowedIps?.[0] !== '*', desc: 'Limit administrative logins to pre-approved corporate IPs.' },
    { key: 'sessionTimeout' as const, label: 'Session Auto-Timeout', checked: true, desc: `Inactivity suspension triggered after ${settings.sessionTimeout || 15} minutes.` },
    { key: 'passwordRotate' as const, label: 'Strict Password Rotation', checked: settings.strictPasswordRotation ?? true, desc: 'Require security renew cycles every 90 days. ' },
    { key: 'biometric' as const, label: 'Biometric Re-authentication', checked: settings.biometricReauth ?? true, desc: 'Require biometric touch IDs for cross-border ledger updates.' }
  ];

  const handleToggle = (key: string) => {
    if (key === 'restrictIp') {
      const isRestricted = settings.allowedIps?.[0] !== '*';
      update({ allowedIps: isRestricted ? ['*'] : ['192.168.1.0/24'] });
    } else if (key === 'forceMfa') {
      update({ forceMfa: !(settings.forceMfa ?? true) });
    } else if (key === 'passwordRotate') {
      update({ strictPasswordRotation: !(settings.strictPasswordRotation ?? true) });
    } else if (key === 'biometric') {
      update({ biometricReauth: !(settings.biometricReauth ?? true) });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-sm font-sans font-black uppercase text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              Access Protocols & MFA Policy
            </h4>
            <div className="space-y-3">
              {protocols.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-400 transition-all">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{s.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{s.desc}</span>
                  </div>
                  <button
                    onClick={() => canEdit && handleToggle(s.key)}
                    className={`w-10 h-5 rounded-full p-1 transition-colors ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${s.checked ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${s.checked ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-sans font-black uppercase text-slate-900 flex items-center gap-2">
              <Fingerprint size={18} className="text-indigo-600" />
              Subsystem Isolation / Zero-Trust
            </h4>
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
              <p className="text-xs text-indigo-900 leading-relaxed font-medium">Protect high-value departments (Finance, Executive Admin, HR Payroll) with custom dual-signature security constraints. This registers biometric re-auth protocols for any critical modifications.</p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-mono text-indigo-700 bg-white/50 p-2 rounded-lg border border-indigo-200">
                    <span>Password Complexity</span>
                    <select 
                      value={settings.passwordComplexity} 
                      onChange={e => update({ passwordComplexity: e.target.value })}
                      className="bg-transparent font-bold outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                 </div>
                 <button
                   onClick={() => setShowIsolationModal(true)}
                   className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition hover:scale-[1.02] cursor-pointer"
                 >
                   Configure Isolation Policy
                 </button>
              </div>
            </div>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Last Security Scan</span>
              <span className="text-xs font-bold text-emerald-500 mt-1 block">100% Clean — Today 04:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <ShieldCheck size={160} />
        </div>
        <div className="space-y-2 relative z-10">
          <h3 className="text-lg font-black uppercase tracking-widest font-sans">Audit Trail Intensity Status</h3>
          <p className="text-sm opacity-75 leading-relaxed max-w-lg">System processes every state transaction, login signature, external API request, and user database modifications permanently in the audit trail ledger.</p>
        </div>
        <button
          onClick={() => setShowAuditLogs(true)}
          className="w-full py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest transition relative z-10 cursor-pointer"
        >
          Review Security Logs Audit Pipeline
        </button>
      </div>

      {/* Isolation Policy Modal */}
      <AnimatePresence>
        {showIsolationModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Configure Isolation Policy</h3>
                <button onClick={() => setShowIsolationModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-sans">Enable dual-signature security constraints for high-value departments. This registers biometric re-auth protocols for critical modifications.</p>
                
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <div>
                    <div className="text-xs font-sans font-bold text-slate-800">Finance Department</div>
                    <div className="text-3xs text-slate-400 font-mono">AR, AP, General Ledger, Cash Management</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-white"
                    checked={isolationSettings.financeEnabled}
                    onChange={e => setIsolationSettings(prev => ({ ...prev, financeEnabled: e.target.checked }))}
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <div>
                    <div className="text-xs font-sans font-bold text-slate-800">HR Payroll</div>
                    <div className="text-3xs text-slate-400 font-mono">Employee data, salaries, benefits, loans</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-white"
                    checked={isolationSettings.hrEnabled}
                    onChange={e => setIsolationSettings(prev => ({ ...prev, hrEnabled: e.target.checked }))}
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <div>
                    <div className="text-xs font-sans font-bold text-slate-800">Executive Admin</div>
                    <div className="text-3xs text-slate-400 font-mono">Board-level decisions, strategic configs</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-white"
                    checked={isolationSettings.executiveEnabled}
                    onChange={e => setIsolationSettings(prev => ({ ...prev, executiveEnabled: e.target.checked }))}
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer">
                  <div>
                    <div className="text-xs font-sans font-bold text-amber-900">Require Dual Signature</div>
                    <div className="text-3xs text-amber-600 font-mono">Two authorized users required for changes</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-white"
                    checked={isolationSettings.dualSignatureRequired}
                    onChange={e => setIsolationSettings(prev => ({ ...prev, dualSignatureRequired: e.target.checked }))}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowIsolationModal(false)} className="px-5 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button
                  onClick={() => {
                    update({
                      isolationPolicy: isolationSettings
                    });
                    setShowIsolationModal(false);
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition hover:scale-105"
                >
                  Apply Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Logs Modal */}
      <AnimatePresence>
        {showAuditLogs && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl p-8 space-y-6 animate-fade-in max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security Logs Audit Pipeline</h3>
                <button onClick={() => setShowAuditLogs(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">1,247</div>
                    <div className="text-3xs font-mono text-slate-500 uppercase">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-600">1,201</div>
                    <div className="text-3xs font-mono text-slate-500 uppercase">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-600">42</div>
                    <div className="text-3xs font-mono text-slate-500 uppercase">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-rose-600">4</div>
                    <div className="text-3xs font-mono text-slate-500 uppercase">Critical</div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  <div className="text-3xs font-mono text-emerald-400 font-bold uppercase mb-3">Recent Audit Trail Entries</div>
                  {[
                    { time: '11:42:15', user: 'admin@seleda.com', action: 'LOGIN_SUCCESS', module: 'AUTH', ip: '192.168.1.105' },
                    { time: '11:38:22', user: 'gm@seleda.com', action: 'UPDATE_SETTINGS', module: 'SYSTEM_CONFIG', ip: '192.168.1.112' },
                    { time: '11:35:08', user: 'finance@seleda.com', action: 'EXPORT_REPORT', module: 'FINANCE_DASHBOARD', ip: '192.168.1.108' },
                    { time: '11:30:45', user: 'unknown', action: 'FAILED_LOGIN', module: 'AUTH', ip: '203.45.67.89' },
                    { time: '11:28:33', user: 'admin@seleda.com', action: 'CREATE_USER', module: 'USER_MANAGEMENT', ip: '192.168.1.105' },
                    { time: '11:25:11', user: 'hr@seleda.com', action: 'VIEW_EMPLOYEE', module: 'HR_DASHBOARD', ip: '192.168.1.110' },
                    { time: '11:22:55', user: 'gm@seleda.com', action: 'APPROVE_PO', module: 'PROCUREMENT', ip: '192.168.1.112' },
                    { time: '11:18:42', user: 'admin@seleda.com', action: 'MODIFY_ROLE', module: 'RBAC', ip: '192.168.1.105' },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-mono border-b border-slate-800 pb-2 last:border-0">
                      <span className="text-slate-500 w-16">{log.time}</span>
                      <span className="text-slate-300 w-32 truncate">{log.user}</span>
                      <span className={`${log.action.includes('FAILED') || log.action.includes('CRITICAL') ? 'text-rose-400' : log.action.includes('SUCCESS') ? 'text-emerald-400' : 'text-indigo-400'} w-28`}>{log.action}</span>
                      <span className="text-slate-400 w-28">{log.module}</span>
                      <span className="text-slate-500">{log.ip}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Export CSV</button>
                  <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Export PDF</button>
                  <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Filter by Date</button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={() => setShowAuditLogs(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">Close</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemAdmin;
