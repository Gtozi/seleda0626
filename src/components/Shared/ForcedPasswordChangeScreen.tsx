/**
 * ForcedPasswordChangeScreen — shown when a user must set a new password
 * before they can access the ERP.
 *
 * Extracted from App.tsx during Phase 3 of the route-driven migration so
 * that ErpLayout can import it without a circular dependency.
 */

import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { changePassword } from '../../lib/auth';
import type { User } from '../../types/erp';

export interface ForcedPasswordChangeScreenProps {
  user: User;
  onSuccess: () => void;
}

export function ForcedPasswordChangeScreen({ user, onSuccess }: ForcedPasswordChangeScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await changePassword('', newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to change password');
      return;
    }

    onSuccess();
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-[calc(100vh-57px)]">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Password Change Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome, {user.name}. You must set a new password before continuing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-2.5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters with mixed case, digits, and special chars"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Changing...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForcedPasswordChangeScreen;
