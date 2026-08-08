/**
 * Cashier Shifts sub-tab — consolidated from the former standalone Cashiering tab.
 *
 * Renders inside the Folio & Billing portal. Cashiers open a shift with an
 * opening float, post payments against it (via the Folio Ledger), and close
 * the shift by counting the drawer. Variance is computed server-side from
 * linked cash payments.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Plus,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  fetchCashierShifts,
  openCashierShift,
  closeCashierShift,
  CashierShift,
  CashierShiftStatus,
} from '../../../services/cashierService';
import StatCard from '../StatCard';

const STATUS_STYLES: Record<CashierShiftStatus, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  balanced: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  over: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  short: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const STATUS_LABEL: Record<CashierShiftStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  balanced: 'Balanced',
  over: 'Over',
  short: 'Short',
};

function formatMoney(n: number): string {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const CashierShifts = () => {
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closeTarget, setCloseTarget] = useState<CashierShift | null>(null);
  const [openForm, setOpenForm] = useState({ openingFloat: '', notes: '' });
  const [closeForm, setCloseForm] = useState({ actualBalance: '', closingFloat: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCashierShifts();
      setShifts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cashier shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const openShift = shifts.find(s => s.status === 'open');

  const handleOpenSubmit = async () => {
    const openingFloat = Number(openForm.openingFloat);
    if (Number.isNaN(openingFloat) || openingFloat < 0) {
      setToast({ kind: 'error', message: 'Opening float must be a non-negative number' });
      return;
    }
    setSubmitting(true);
    try {
      await openCashierShift({ openingFloat, notes: openForm.notes || undefined });
      setToast({ kind: 'success', message: 'Cashier shift opened' });
      setShowOpenModal(false);
      setOpenForm({ openingFloat: '', notes: '' });
      await loadShifts();
    } catch (err: any) {
      setToast({ kind: 'error', message: err.message || 'Failed to open shift' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSubmit = async () => {
    if (!closeTarget) return;
    const actualBalance = Number(closeForm.actualBalance);
    if (Number.isNaN(actualBalance)) {
      setToast({ kind: 'error', message: 'Actual balance must be a number' });
      return;
    }
    const closingFloat = closeForm.closingFloat !== '' ? Number(closeForm.closingFloat) : undefined;
    setSubmitting(true);
    try {
      const updated = await closeCashierShift(closeTarget.id, {
        actualBalance,
        closingFloat,
        notes: closeForm.notes || undefined,
      });
      const variance = Number(updated.variance ?? 0);
      const status = updated.status;
      const msg = status === 'balanced'
        ? `Shift closed — balanced ($${Math.abs(variance).toFixed(2)} variance)`
        : `Shift closed — ${STATUS_LABEL[status]} by ${formatMoney(Math.abs(variance))}`;
      setToast({ kind: status === 'balanced' ? 'success' : 'error', message: msg });
      setCloseTarget(null);
      setCloseForm({ actualBalance: '', closingFloat: '', notes: '' });
      await loadShifts();
    } catch (err: any) {
      setToast({ kind: 'error', message: err.message || 'Failed to close shift' });
    } finally {
      setSubmitting(false);
    }
  };

  // Stat cards
  const openFloat = openShift ? Number(openShift.openingFloat) : 0;
  const openExpected = openShift ? Number(openShift.expectedBalance) : 0;
  const todayPayments = shifts
    .reduce((sum, s) => sum + Number(s.cashPaymentsTotal), 0);
  const todayRefunds = shifts
    .reduce((sum, s) => sum + Number(s.cashRefundsTotal), 0);
  const openCount = shifts.filter(s => s.status === 'open').length;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            toast.kind === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {toast.kind === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cashier Shifts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Open and close cashier drawers; track float, expected balance and variance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadShifts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowOpenModal(true)}
            disabled={!!openShift}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={openShift ? 'You already have an open shift' : 'Open a new cashier shift'}
          >
            <Plus className="w-4 h-4" />
            Open Shift
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Float" value={formatMoney(openFloat)} icon={Banknote} variant="revenue" />
        <StatCard label="Cash Payments" value={formatMoney(todayPayments)} icon={ArrowUpRight} variant="revenue" />
        <StatCard label="Expected Balance" value={formatMoney(openExpected)} icon={Wallet} variant="revenue" />
        <StatCard label="Open Shifts" value={String(openCount)} icon={Clock} variant="alert" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Shifts table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Shift History</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{shifts.length} shifts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Cashier</th>
                <th className="px-4 py-3 text-left font-semibold">Opened</th>
                <th className="px-4 py-3 text-left font-semibold">Closed</th>
                <th className="px-4 py-3 text-right font-semibold">Opening Float</th>
                <th className="px-4 py-3 text-right font-semibold">Cash Payments</th>
                <th className="px-4 py-3 text-right font-semibold">Expected</th>
                <th className="px-4 py-3 text-right font-semibold">Actual</th>
                <th className="px-4 py-3 text-right font-semibold">Variance</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td>
                </tr>
              )}
              {!loading && shifts.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                    No cashier shifts yet. Click <span className="font-semibold">Open Shift</span> to begin.
                  </td>
                </tr>
              )}
              {!loading && shifts.map((shift) => {
                const variance = Number(shift.variance ?? 0);
                const varianceColor = shift.status === 'open'
                  ? 'text-gray-400'
                  : Math.abs(variance) < 0.005
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : variance > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-rose-600 dark:text-rose-400';
                return (
                  <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{shift.cashierName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDateTime(shift.openedAt)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{shift.closedAt ? formatDateTime(shift.closedAt) : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">{formatMoney(shift.openingFloat)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">
                      {formatMoney(shift.cashPaymentsTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">{formatMoney(shift.expectedBalance)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono">
                      {shift.actualBalance !== null && shift.actualBalance !== undefined ? formatMoney(shift.actualBalance) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${varianceColor}`}>
                      {shift.status === 'open' ? '—' : `${variance >= 0 ? '+' : '-'}${formatMoney(Math.abs(variance)).replace('$', '$')}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[shift.status]}`}>
                        {STATUS_LABEL[shift.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {shift.status === 'open' && (
                        <button
                          onClick={() => {
                            setCloseTarget(shift);
                            setCloseForm({
                              actualBalance: String(shift.expectedBalance),
                              closingFloat: String(shift.openingFloat),
                              notes: '',
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Close Shift
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open Cashier Shift</h3>
              <button
                onClick={() => setShowOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {openShift && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    You already have an open shift. Close it before opening a new one.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opening Float</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={openForm.openingFloat}
                    onChange={e => setOpenForm(f => ({ ...f, openingFloat: e.target.value }))}
                    placeholder="500.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                <textarea
                  value={openForm.notes}
                  onChange={e => setOpenForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Open Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {closeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Close Cashier Shift</h3>
              <button
                onClick={() => setCloseTarget(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Cashier: <span className="font-medium text-gray-900 dark:text-white">{closeTarget.cashierName}</span>
                <br />
                Opened: {formatDateTime(closeTarget.openedAt)}
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Opening Float</p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-white">{formatMoney(closeTarget.openingFloat)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Expected Balance</p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-white">{formatMoney(closeTarget.expectedBalance)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Counted Actual Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={closeForm.actualBalance}
                    onChange={e => setCloseForm(f => ({ ...f, actualBalance: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Variance = Actual − Expected. Status is set automatically (balanced / over / short).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Closing Float (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={closeForm.closingFloat}
                    onChange={e => setCloseForm(f => ({ ...f, closingFloat: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Close Notes (optional)</label>
                <textarea
                  value={closeForm.notes}
                  onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setCloseTarget(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Close Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierShifts;
