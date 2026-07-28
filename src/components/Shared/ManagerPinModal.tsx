/**
 * Manager PIN Modal
 * Phase 4 Item 1: Reusable modal for backend-verified manager PIN entry
 * Used for POS void/discount approvals, kitchen/bar waste approvals, etc.
 */
import { useState, useEffect, useRef } from 'react';
import { Shield, X, Lock, AlertCircle } from 'lucide-react';
import { verifyManagerPin, setManagerPin, getPinStatus } from '../../services/managerPinService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  context?: string;
  outletId?: string;
  title?: string;
  description?: string;
}

export function ManagerPinModal({
  open,
  onClose,
  onSuccess,
  context,
  outletId,
  title = 'Manager Approval Required',
  description = 'Enter your manager PIN to authorize this action.',
}: Props) {
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError(null);
      setAttemptsRemaining(null);
      setShowSetPin(false);
      setNewPin('');
      setConfirmPin('');
      checkPinStatus();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const checkPinStatus = async () => {
    try {
      const status = await getPinStatus();
      setHasPin(status.hasPin);
      if (status.isLocked) {
        setError(`PIN is locked${status.lockedUntil ? ` until ${new Date(status.lockedUntil).toLocaleTimeString()}` : ''}. Contact administrator.`);
      }
    } catch {
      setHasPin(null);
    }
  };

  const handleVerify = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const result = await verifyManagerPin(pin, outletId, context);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Verification failed');
        setAttemptsRemaining(result.attempts_remaining ?? null);
        setPin('');
        inputRef.current?.focus();
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4 || newPin.length > 8 || !/^\d+$/.test(newPin)) {
      setError('PIN must be 4-8 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setSettingPin(true);
    setError(null);
    try {
      const result = await setManagerPin(newPin);
      if (result.success) {
        setShowSetPin(false);
        setHasPin(true);
        setNewPin('');
        setConfirmPin('');
        setError(null);
      } else {
        setError(result.error || 'Failed to set PIN');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to set PIN');
    } finally {
      setSettingPin(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showSetPin) handleSetPin();
      else handleVerify();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
              <p className="text-[10px] text-slate-400">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Set PIN flow */}
        {showSetPin ? (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                Set a new manager PIN (4-8 digits). This will be required for voids, discounts, and other sensitive actions.
              </p>
            </div>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="Enter new PIN"
              maxLength={8}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="Confirm new PIN"
              maxLength={8}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleSetPin}
              disabled={settingPin || newPin.length < 4 || newPin !== confirmPin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {settingPin ? 'Setting PIN...' : 'Set PIN'}
            </button>
          </div>
        ) : hasPin === false ? (
          /* No PIN set — prompt to set one */
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 text-center">
              <Lock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                No manager PIN set. You need to create one before performing manager actions.
              </p>
            </div>
            <button
              onClick={() => setShowSetPin(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition cursor-pointer"
            >
              Set Manager PIN
            </button>
          </div>
        ) : (
          /* Verify PIN flow */
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="• • • •"
              maxLength={8}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />

            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{error}</p>
                  {attemptsRemaining !== null && attemptsRemaining > 0 && (
                    <p className="text-[10px] text-red-400 mt-0.5">{attemptsRemaining} attempts remaining</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || pin.length < 4}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {verifying ? 'Verifying...' : 'Authorize'}
            </button>

            <button
              onClick={() => setShowSetPin(true)}
              className="w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Change PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
