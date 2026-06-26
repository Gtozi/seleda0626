import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AccountSettingsModule() {
  const {
    userProfile,
    updateProfile,
    updatePassword
  } = useERP();

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'sessions'>('profile');

  // Profile Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [secStatus, setSecStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      updateProfile({ name, email });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
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
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-sm"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition">
                      <Camera size={14} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white">{userProfile.name}</h2>
                    <p className="text-sm text-slate-500 font-mono mt-1">{userProfile.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Joined via Enterprise Provisioning</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Work Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
                      />
                    </div>
                  </div>

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
                          placeholder="At least 6 characters"
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
                <div>
                  <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white">Active Login Sessions</h2>
                  <p className="text-sm text-slate-500 mt-1">Review every device currently logged into your administrator account.</p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <History size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          Current Browser Session
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] uppercase font-bold rounded">Active Now</span>
                        </div>
                        <p className="text-xs text-slate-400">Chrome on macOS High Sierra • 172.16.0.45</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                        <History size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Mobile App Sync</div>
                        <p className="text-xs text-slate-400">Admin App on iPhone 15 • 2 days ago</p>
                      </div>
                    </div>
                    <button className="text-xs font-mono text-slate-400 hover:text-rose-500 transition">Revoke Access</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
