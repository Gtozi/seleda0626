import React, { useState, useEffect, useCallback } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  User,
  Lock,
  Shield,
  History,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Mail,
  Building2,
  IdCard,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-purple-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500', 'from-sky-500 to-blue-500', 'from-violet-500 to-fuchsia-500',
];

function getAvatarGradient(name: string) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

interface SessionInfo {
  id: string;
  created_at: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  revoked_at: string | null;
}

function parseUserAgent(ua: string | null): { device: string; browser: string } {
  if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return { device: os, browser };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AccountSettingsModule() {
  const {
    userProfile,
    updateProfile,
    updatePassword,
    syncUserProfile
  } = useERP();

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'sessions'>('profile');

  // Profile Form State
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [mobileNumber, setMobileNumber] = useState(userProfile.mobileNumber || '');
  const [username, setUsername] = useState(userProfile.username || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');

  // Sync form fields when userProfile changes (e.g. after login)
  useEffect(() => {
    setName(userProfile.name || '');
    setEmail(userProfile.email || '');
    setMobileNumber(userProfile.mobileNumber || '');
    setUsername(userProfile.username || '');
  }, [userProfile.id, userProfile.name, userProfile.email, userProfile.mobileNumber, userProfile.username]);

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [secStatus, setSecStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'sessions') {
      fetchSessions();
    }
  }, [activeSection, fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, revoked_at: new Date().toISOString() } : s));
      }
    } catch (e) {
      console.error('Failed to revoke session:', e);
    } finally {
      setRevokingId(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setProfileError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, mobileNumber, username }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local context state
        updateProfile({ name, email, mobileNumber, username });
        // Also sync full profile from server response
        if (data.user) {
          syncUserProfile({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            roleDescription: data.user.roleDescription,
            avatar: data.user.avatarInitials,
            lastLogin: data.user.lastLogin || new Date().toISOString(),
            department: data.user.department,
            employeeId: data.user.employeeId,
            mobileNumber: data.user.mobileNumber,
            username: data.user.username,
            status: data.user.status,
          });
        }
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setProfileError(data.error || 'Failed to update profile');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (e) {
      setProfileError('Network error. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setSecStatus('error');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setSecStatus('error');
      return;
    }

    setSecStatus('checking');
    const success = await updatePassword(oldPassword, newPassword);
    if (success) {
      setSecStatus('success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecStatus('idle'), 3000);
    } else {
      setErrorMsg('Current password incorrect');
      setSecStatus('error');
    }
  };

  const avatarInitials = userProfile.avatar || userProfile.name?.slice(0, 2).toUpperCase() || 'U';
  const avatarGradient = getAvatarGradient(userProfile.name || 'U');

  // Read-only info fields derived from auth/DB (not self-editable)
  const readOnlyFields = [
    { icon: Shield, label: 'Role', value: userProfile.roleDescription || userProfile.role },
    { icon: Building2, label: 'Department', value: userProfile.department || 'General' },
    { icon: IdCard, label: 'Employee ID', value: userProfile.employeeId || 'N/A' },
    { icon: CheckCircle2, label: 'Status', value: userProfile.status || 'Active' },
    { icon: History, label: 'Last Login', value: userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleString() : 'N/A' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="account-settings-module">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User size={18} />
            My Profile
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock size={18} />
            Security & Auth
          </button>
          <button
            onClick={() => setActiveSection('sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'sessions'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History size={18} />
            Login Sessions
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8"
              >
                {/* Avatar + Identity Header */}
                <div className="flex items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className={`w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-sm bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-black text-white`}>
                      {avatarInitials}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition">
                      <Camera size={14} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white truncate">{userProfile.name || 'Loading...'}</h2>
                    <p className="text-sm text-slate-500 font-mono mt-1">{userProfile.roleDescription || userProfile.role || 'Loading...'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        userProfile.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                        userProfile.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          userProfile.status === 'Active' ? 'bg-emerald-500' :
                          userProfile.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {userProfile.status || 'Active'}
                      </span>
                      {userProfile.department && (
                        <span className="text-xs text-slate-400 font-mono">{userProfile.department}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Read-only identity fields */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {readOnlyFields.map((field, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold mb-1">
                        <field.icon size={12} />
                        {field.label}
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={field.value}>{field.value}</p>
                    </div>
                  ))}
                </div>

                {/* Editable form fields */}
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold flex items-center gap-1.5">
                        <User size={11} /> Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold flex items-center gap-1.5">
                        <Mail size={11} /> Work Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold flex items-center gap-1.5">
                        <Smartphone size={11} /> Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        placeholder="+251 911 234 567"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold flex items-center gap-1.5">
                        <IdCard size={11} /> Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        placeholder="your_username"
                      />
                    </div>
                  </div>

                  {saveStatus === 'error' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex gap-2">
                      <AlertCircle size={14} />
                      {profileError}
                    </div>
                  )}

                  <hr className="border-slate-100 dark:border-slate-800" />

                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={saveStatus === 'saving'}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {saveStatus === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : saveStatus === 'success' ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {saveStatus === 'success' ? 'Profile Updated' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8"
              >
                <div>
                  <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="text-indigo-600" size={24} />
                    Login & Security
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your administrator password and authentication methods.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Current Password</label>
                      <div className="relative">
                        <input
                          type={showOld ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOld(!showOld)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {secStatus === 'error' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex gap-2 animate-shake">
                      <AlertCircle size={14} />
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={secStatus === 'checking'}
                      className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      {secStatus === 'checking' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                      ) : secStatus === 'success' ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {secStatus === 'success' ? 'Password Changed' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeSection === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white">Active Login Sessions</h2>
                    <p className="text-sm text-slate-500 mt-1">Review every device currently logged into your administrator account.</p>
                  </div>
                  <button
                    onClick={fetchSessions}
                    disabled={sessionsLoading}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
                    title="Refresh sessions"
                  >
                    {sessionsLoading ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
                  </button>
                </div>

                {sessionsLoading && sessions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-slate-300" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <History size={20} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold">No active sessions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {sessions.map((session, idx) => {
                      const isActive = !session.revoked_at && new Date(session.expires_at).getTime() > Date.now();
                      const isCurrent = idx === 0 && isActive;
                      const { device, browser } = parseUserAgent(session.user_agent);
                      const icon = session.user_agent?.includes('Mobile') || session.user_agent?.includes('Android') || session.user_agent?.includes('iPhone') ? Smartphone : Monitor;
                      return (
                        <div key={session.id} className={`p-4 flex items-center justify-between transition ${
                          isCurrent ? 'bg-slate-50/50 dark:bg-slate-800/30' : !isActive ? 'opacity-50' : ''
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                              isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                              'bg-rose-50 dark:bg-rose-900/20 text-rose-400'
                            }`}>
                              {icon ? <icon size={20} /> : <Globe size={20} />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                {browser} on {device}
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] uppercase font-bold rounded">Active Now</span>
                                )}
                                {!isActive && session.revoked_at && (
                                  <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[9px] uppercase font-bold rounded">Revoked</span>
                                )}
                                {!isActive && !session.revoked_at && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] uppercase font-bold rounded">Expired</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {session.ip_address || 'Unknown IP'} • {timeAgo(session.created_at)}
                              </p>
                            </div>
                          </div>
                          {isActive && !isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokingId === session.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition disabled:opacity-50"
                            >
                              {revokingId === session.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
