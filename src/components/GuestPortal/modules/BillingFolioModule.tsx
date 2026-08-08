/**
 * Billing & Folio Module (Guest Portal)
 * Display current folio, charges by category, download invoice, split bill,
 * pay outstanding balance.
 *
 * DB-integrated: folio data is fetched from /api/reservations/:id/folio and all
 * payments/invoices go through src/services/folioService.ts. The legacy
 * hardcoded mock data and `// Simulate ...` stubs have been removed.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Download,
  CreditCard,
  Split,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  X,
  Loader2,
} from 'lucide-react';
import {
  fetchReservationFolio,
  postPayment,
  generateInvoice,
  PaymentSplit,
} from '../../../services/folioService';
import { MappedFolio, MappedFolioLine, MappedFolioPayment } from '../../../services/dataMapper';

interface BillingFolioModuleProps {
  reservationId?: string;
  guestId?: string;
}

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Mobile Money',
  'Bank Transfer',
  'Cheque',
  'Voucher',
];

const getCategoryColor = (lineType: string): string => {
  const colors: Record<string, string> = {
    Room: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
    'F&B': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
    Spa: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
    Transfer: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
    Laundry: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
    Extra: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400',
  };
  return colors[lineType] || colors.Extra;
};

const BillingFolioModule: React.FC<BillingFolioModuleProps> = ({ reservationId }) => {
  const [folios, setFolios] = useState<MappedFolio[]>([]);
  const [lines, setLines] = useState<MappedFolioLine[]>([]);
  const [payments, setPayments] = useState<MappedFolioPayment[]>([]);
  const [billingBreakdown, setBillingBreakdown] = useState<any | null>(null);
  const [consolidatedBalance, setConsolidatedBalance] = useState(0);
  const [consolidatedCharges, setConsolidatedCharges] = useState(0);
  const [consolidatedPayments, setConsolidatedPayments] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [paymentReference, setPaymentReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [splitWays, setSplitWays] = useState(2);
  const [splitMethods, setSplitMethods] = useState<string[]>([PAYMENT_METHODS[0], PAYMENT_METHODS[0]]);
  const [submittingSplit, setSubmittingSplit] = useState(false);

  const [invoiceInFlight, setInvoiceInFlight] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFolio = useCallback(async () => {
    if (!reservationId) {
      setFolios([]);
      setLines([]);
      setPayments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReservationFolio(reservationId);
      setFolios(data.folios || []);
      setLines(data.lines || []);
      setPayments(data.payments || []);
      setBillingBreakdown(data.billingBreakdown || null);
      setConsolidatedBalance(data.consolidatedBalance ?? 0);
      setConsolidatedCharges(data.consolidatedCharges ?? 0);
      setConsolidatedPayments(data.consolidatedPayments ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load folio');
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadFolio();
  }, [loadFolio]);

  // Use billing breakdown for tax/service charge when available, else sum from folios.
  const taxTotal = billingBreakdown?.taxTotal ?? folios.reduce((s, f) => s + (f.taxTotal || 0), 0);
  const serviceChargeTotal =
    billingBreakdown?.serviceChargeTotal ?? folios.reduce((s, f) => s + (f.serviceChargeTotal || 0), 0);
  const currency = folios[0]?.currency || 'USD';
  const folioStatus = folios.some((f) => f.status === 'Open') ? 'Open' : folios.length ? 'Closed' : '—';
  const primaryFolio = folios[0] || null;

  // Keep payment amount in sync with balance when modal opens.
  useEffect(() => {
    if (showPaymentModal) setPaymentAmount(consolidatedBalance > 0 ? consolidatedBalance : 0);
  }, [showPaymentModal, consolidatedBalance]);

  const handleDownloadInvoice = async () => {
    if (!primaryFolio) return;
    setInvoiceInFlight(true);
    try {
      const result = await generateInvoice(primaryFolio.id);
      showToast('success', `Invoice ${result.invoice.invoice_number} generated`);
      // Trigger a download of the invoice details as JSON (lightweight client-side export).
      const blob = new Blob([JSON.stringify(result.invoice, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.invoice.invoice_number}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      await loadFolio();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate invoice');
    } finally {
      setInvoiceInFlight(false);
    }
  };

  const handleMakePayment = async () => {
    if (!reservationId) return;
    if (!paymentMethod || typeof paymentAmount !== 'number' || paymentAmount <= 0) {
      showToast('error', 'A positive amount and payment method are required');
      return;
    }
    if (paymentAmount > consolidatedBalance + 0.05) {
      showToast('error', 'Payment amount exceeds outstanding balance');
      return;
    }
    setSubmittingPayment(true);
    try {
      const split: PaymentSplit = {
        amount: paymentAmount,
        paymentMethod,
        reference: paymentReference.trim() || null,
      };
      await postPayment(reservationId, split);
      showToast('success', 'Payment processed');
      setShowPaymentModal(false);
      setPaymentReference('');
      await loadFolio();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to process payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleSplitBill = async () => {
    if (!reservationId) return;
    if (splitWays < 2 || splitWays > 10) {
      showToast('error', 'Split ways must be between 2 and 10');
      return;
    }
    const perPerson = consolidatedBalance / splitWays;
    if (!(perPerson > 0)) {
      showToast('error', 'Outstanding balance must be greater than zero to split');
      return;
    }
    setSubmittingSplit(true);
    try {
      const splits: PaymentSplit[] = Array.from({ length: splitWays }, (_, i) => ({
        amount: Math.round(perPerson * 100) / 100,
        paymentMethod: splitMethods[i] || PAYMENT_METHODS[0],
      }));
      // Adjust last split for rounding so the total exactly matches the balance.
      const total = splits.reduce((s, p) => s + p.amount, 0);
      splits[splits.length - 1].amount = Math.round((perPerson + (consolidatedBalance - total)) * 100) / 100;

      await postPayment(reservationId, splits);
      showToast('success', `Bill split into ${splitWays} payments`);
      setShowSplitBillModal(false);
      await loadFolio();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to split bill');
    } finally {
      setSubmittingSplit(false);
    }
  };

  const updateSplitMethod = (index: number, method: string) => {
    setSplitMethods((prev) => {
      const next = [...prev];
      next[index] = method;
      return next;
    });
  };

  // No reservation selected
  if (!reservationId) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-400">No reservation selected</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
              Please select a reservation to view its billing and folio details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Folio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View your folio and manage payments
          </p>
        </div>
        <button
          onClick={handleDownloadInvoice}
          disabled={invoiceInFlight || !primaryFolio}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium disabled:opacity-50"
        >
          {invoiceInFlight ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={16} />}
          Download Invoice
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            toast.kind === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {toast.kind === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Loading folio...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8 mb-3" />
          <p className="text-sm">{error}</p>
          <button onClick={loadFolio} className="mt-3 text-sm text-indigo-600 hover:underline">
            Try again
          </button>
        </div>
      ) : folios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
          <Receipt className="w-8 h-8 mb-3 opacity-50" />
          <p className="text-sm">No folio available for this reservation yet.</p>
        </div>
      ) : (
        <>
          {/* Folio Summary */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm font-medium opacity-90 mb-1">Folio Status</div>
                <div className="flex items-center gap-2">
                  <Receipt size={24} />
                  <span className="text-2xl font-bold">{folioStatus}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-90 mb-1">Outstanding Balance</div>
                <div className="text-3xl font-bold">
                  {currency} {consolidatedBalance.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="text-xs opacity-75 mb-1">Total Charges</div>
                <div className="text-lg font-bold">{currency} {consolidatedCharges.toFixed(2)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="text-xs opacity-75 mb-1">Payments</div>
                <div className="text-lg font-bold">{currency} {consolidatedPayments.toFixed(2)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="text-xs opacity-75 mb-1">Tax</div>
                <div className="text-lg font-bold">{currency} {taxTotal.toFixed(2)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="text-xs opacity-75 mb-1">Service Charge</div>
                <div className="text-lg font-bold">{currency} {serviceChargeTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={consolidatedBalance <= 0}
              className="flex items-center justify-center gap-3 p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={24} />
              <div className="text-left">
                <div className="font-semibold">Pay Outstanding Balance</div>
                <div className="text-sm opacity-90">{currency} {consolidatedBalance.toFixed(2)}</div>
              </div>
            </button>
            <button
              onClick={() => setShowSplitBillModal(true)}
              disabled={consolidatedBalance <= 0}
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Split size={24} />
              <div className="text-left">
                <div className="font-semibold">Split Bill</div>
                <div className="text-sm opacity-90">Divide charges among guests</div>
              </div>
            </button>
          </div>

          {/* Folio Lines */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Folio Details</h3>
            {lines.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No charge lines on this folio.
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {line.transactionDate ? new Date(line.transactionDate).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{line.description}</div>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                            line.lineType
                          )} inline-block mt-1`}
                        >
                          {line.lineType}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {currency} {line.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal (Charges)</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currency} {consolidatedCharges.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currency} {taxTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Service Charge</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currency} {serviceChargeTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Payments</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    -{currency} {consolidatedPayments.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">Balance Due</span>
                  <span className={consolidatedBalance > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600'}>
                    {currency} {consolidatedBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments History */}
          {payments.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment History</h3>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{p.paymentMethod}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '—'}
                          {p.referenceNumber ? ` · Ref ${p.referenceNumber}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {currency} {p.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Make Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reference (optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction reference"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remaining Balance</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currency} {Math.max(0, consolidatedBalance - paymentAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMakePayment}
                disabled={submittingPayment}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard size={16} />}
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      {showSplitBillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Split Bill</h3>
              <button
                onClick={() => setShowSplitBillModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Number of Ways to Split
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={splitWays}
                  onChange={(e) => {
                    const n = Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 2));
                    setSplitWays(n);
                    setSplitMethods((prev) =>
                      Array.from({ length: n }, (_, i) => prev[i] || PAYMENT_METHODS[0])
                    );
                  }}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.from({ length: splitWays }, (_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-6">#{i + 1}</span>
                    <select
                      value={splitMethods[i] || PAYMENT_METHODS[0]}
                      onChange={(e) => updateSplitMethod(i, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-medium text-slate-900 dark:text-white w-24 text-right">
                      {currency} {(consolidatedBalance / splitWays).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount per Person</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currency} {(consolidatedBalance / splitWays).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSplitBillModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSplitBill}
                disabled={submittingSplit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submittingSplit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Split size={16} />}
                Split Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingFolioModule;
