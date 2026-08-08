/**
 * Front Office Folio & Billing Interface Module
 * Charge posting and folio management.
 *
 * DB-integrated: all folios, charges, payments and balances are fetched from the
 * backend via src/services/folioService.ts. The legacy hardcoded mock data has
 * been removed.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Receipt,
  Users,
  Building2,
  Layers,
  Download,
  RefreshCw,
  CheckCircle2,
  BedDouble,
  Utensils,
  Coffee,
  Shirt,
  Sparkles,
  Phone,
  Car,
  Package,
  Star,
  Calendar,
  X,
  AlertCircle,
  Loader2,
  Printer,
  CreditCard,
  History,
  Wallet,
} from 'lucide-react';
import {
  fetchFolios,
  fetchReservationFolio,
  addCharge,
  voidCharge,
  closeFolioWithInvoice,
  generateInvoice,
  postPayment,
  fetchBankAccounts,
  fetchFolioInvoices,
  FolioListItem,
  BankAccount,
  FolioInvoiceSummary,
} from '../../../services/folioService';
import { MappedFolioLine, MappedFolioPayment } from '../../../services/dataMapper';
import {
  getReservationForInvoice,
  getFolioDetails,
  printInvoice,
  downloadInvoiceCsv,
} from '../../../services/checkOutService';
import FolioInvoicePaymentHistory from '../../FrontDesk/FolioInvoicePaymentHistory';
import CashierShifts from './CashierShifts';

type FolioTypeFilter = 'all' | 'Guest' | 'Master' | 'Company' | 'Group' | 'Split';
type StatusFilter = 'all' | 'Open' | 'Closed' | 'Pending';
type FolioBillingSubTab = 'ledger' | 'history' | 'shifts';

// Charge categories map to line_type values accepted by post_folio_charge.
const CHARGE_CATEGORIES: { id: string; label: string; icon: any; lineType: string }[] = [
  { id: 'room', label: 'Room Charges', icon: BedDouble, lineType: 'Room' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, lineType: 'F&B' },
  { id: 'bar', label: 'Bar', icon: Coffee, lineType: 'F&B' },
  { id: 'room-service', label: 'Room Service', icon: Coffee, lineType: 'F&B' },
  { id: 'laundry', label: 'Laundry', icon: Shirt, lineType: 'Laundry' },
  { id: 'spa', label: 'Spa', icon: Sparkles, lineType: 'Spa' },
  { id: 'telephone', label: 'Telephone', icon: Phone, lineType: 'Telephone' },
  { id: 'transportation', label: 'Transportation', icon: Car, lineType: 'Transfer' },
  { id: 'gift-shop', label: 'Gift Shop', icon: Package, lineType: 'Extra' },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: FileText, lineType: 'Extra' },
];

const FOLIO_TYPES: { id: string; label: string; icon: any }[] = [
  { id: 'Guest', label: 'Guest Folio', icon: Users },
  { id: 'Master', label: 'Master Folio', icon: Star },
  { id: 'Company', label: 'Company Folio', icon: Building2 },
  { id: 'Group', label: 'Group Folio', icon: Users },
  { id: 'Split', label: 'Split Folio', icon: Layers },
];

const folioTypeColors: Record<string, string> = {
  Guest: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Master: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Company: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Group: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Split: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const statusColors: Record<string, string> = {
  Open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

interface AddChargeForm {
  description: string;
  amount: string;
  quantity: string;
  lineType: string;
}

const EMPTY_CHARGE_FORM: AddChargeForm = {
  description: '',
  amount: '',
  quantity: '1',
  lineType: 'Extra',
};

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'mobile_payment', label: 'Mobile Payment' },
  { id: 'cheque', label: 'Cheque' },
];

interface PaymentForm {
  amount: string;
  paymentMethod: string;
  reference: string;
  bankAccountId: string;
}

const EMPTY_PAYMENT_FORM: PaymentForm = {
  amount: '',
  paymentMethod: 'cash',
  reference: '',
  bankAccountId: '',
};

// Payment methods that require a bank account selection
const BANK_REQUIRED_METHODS = ['credit_card', 'debit_card', 'bank_transfer', 'mobile_payment', 'cheque'];

const FolioBilling = () => {
  const [folios, setFolios] = useState<FolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubTab = (searchParams.get('view') as FolioBillingSubTab) || 'ledger';
  const selectedReservationId = searchParams.get('reservationId') || undefined;
  const processedReservationRef = useRef<string | null>(null);
  const setActiveSubTab = (tab: FolioBillingSubTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [folioTypeFilter, setFolioTypeFilter] = useState<FolioTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Expanded folio id -> its lines (lazily fetched on expand)
  const [expandedFolioId, setExpandedFolioId] = useState<string | null>(null);
  const [linesByFolio, setLinesByFolio] = useState<Record<string, MappedFolioLine[]>>({});
  const [paymentsByFolio, setPaymentsByFolio] = useState<Record<string, MappedFolioPayment[]>>({});
  const [invoicesByFolio, setInvoicesByFolio] = useState<Record<string, FolioInvoiceSummary[]>>({});
  const [linesLoading, setLinesLoading] = useState(false);
  const [expandedSubTab, setExpandedSubTab] = useState<'charges' | 'payments' | 'invoices'>('charges');

  // Add charge modal
  const [addChargeFolio, setAddChargeFolio] = useState<FolioListItem | null>(null);
  const [chargeForm, setChargeForm] = useState<AddChargeForm>(EMPTY_CHARGE_FORM);
  const [submittingCharge, setSubmittingCharge] = useState(false);

  // Void confirmation
  const [voidTarget, setVoidTarget] = useState<{ folio: FolioListItem; line: MappedFolioLine } | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [submittingVoid, setSubmittingVoid] = useState(false);

  // Add payment modal
  const [addPaymentFolio, setAddPaymentFolio] = useState<FolioListItem | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(EMPTY_PAYMENT_FORM);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Folio action in-flight (close / invoice) keyed by folio id
  const [actionInFlight, setActionInFlight] = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFolios();
      setFolios(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch folios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolios();
    fetchBankAccounts()
      .then(setBankAccounts)
      .catch(() => { /* non-fatal — bank selector just won't populate */ });
  }, [loadFolios]);

  const loadFolioLines = useCallback(async (folio: FolioListItem) => {
    setLinesLoading(true);
    try {
      const [folioData, invoices] = await Promise.all([
        fetchReservationFolio(folio.reservationId),
        fetchFolioInvoices(folio.id),
      ]);
      // Filter lines and payments to this folio only
      const folioLines = (folioData.lines || []).filter((l) => l.folioId === folio.id);
      const folioPayments = (folioData.payments || []).filter((p) => p.folioId === folio.id);
      setLinesByFolio((prev) => ({ ...prev, [folio.id]: folioLines }));
      setPaymentsByFolio((prev) => ({ ...prev, [folio.id]: folioPayments }));
      setInvoicesByFolio((prev) => ({ ...prev, [folio.id]: invoices }));
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load folio details');
    } finally {
      setLinesLoading(false);
    }
  }, []);

  // Handle navigation to specific reservation's folio
  useEffect(() => {
    if (selectedReservationId && folios.length > 0 && processedReservationRef.current !== selectedReservationId) {
      const matchingFolio = folios.find(f => f.reservationId === selectedReservationId);
      if (matchingFolio) {
        // Mark this reservation as processed to prevent infinite loops
        processedReservationRef.current = selectedReservationId;
        // Set this as the only folio to display
        setFolios([matchingFolio]);
        // Auto-expand it
        setExpandedFolioId(matchingFolio.id);
        setExpandedSubTab('charges');
        // Load its lines
        loadFolioLines(matchingFolio);
      }
    }
    // Reset the ref when selectedReservationId changes to null (navigation away)
    if (!selectedReservationId) {
      processedReservationRef.current = null;
    }
  }, [selectedReservationId, loadFolioLines]);

  const handleExpand = (folio: FolioListItem) => {
    if (expandedFolioId === folio.id) {
      setExpandedFolioId(null);
      return;
    }
    setExpandedFolioId(folio.id);
    setExpandedSubTab('charges');
    if (!linesByFolio[folio.id]) {
      loadFolioLines(folio);
    }
  };

  const filteredFolios = folios.filter((f) => {
    if (folioTypeFilter !== 'all' && f.folioType !== folioTypeFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const haystack = `${f.guestName || ''} ${f.roomNumber || ''} ${f.id} ${f.reservationId} ${f.folioType}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const openAddCharge = (folio: FolioListItem) => {
    setAddChargeFolio(folio);
    setChargeForm(EMPTY_CHARGE_FORM);
  };

  const submitAddCharge = async () => {
    if (!addChargeFolio) return;
    const amount = parseFloat(chargeForm.amount);
    if (!chargeForm.description.trim() || isNaN(amount) || amount <= 0) {
      showToast('error', 'Description and a positive amount are required');
      return;
    }
    setSubmittingCharge(true);
    try {
      await addCharge(addChargeFolio.reservationId, {
        description: chargeForm.description.trim(),
        amount,
        quantity: parseInt(chargeForm.quantity, 10) || 1,
        lineType: chargeForm.lineType,
      });
      showToast('success', 'Charge posted successfully');
      setAddChargeFolio(null);
      // Refresh folio list (balances) and the expanded lines
      await loadFolios();
      if (expandedFolioId === addChargeFolio.id) {
        await loadFolioLines(addChargeFolio);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post charge');
    } finally {
      setSubmittingCharge(false);
    }
  };

  const openAddPayment = (folio: FolioListItem) => {
    setAddPaymentFolio(folio);
    // Pre-fill amount with the outstanding balance, and pre-select default bank
    const defaultBank = bankAccounts.find((b) => b.isDefaultForSales) || bankAccounts[0];
    setPaymentForm({
      ...EMPTY_PAYMENT_FORM,
      amount: folio.balance > 0 ? folio.balance.toFixed(2) : '',
      bankAccountId: defaultBank?.id || '',
    });
  };

  const submitPayment = async () => {
    if (!addPaymentFolio) return;
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'A positive payment amount is required');
      return;
    }
    if (!paymentForm.paymentMethod) {
      showToast('error', 'Payment method is required');
      return;
    }
    if (BANK_REQUIRED_METHODS.includes(paymentForm.paymentMethod) && !paymentForm.bankAccountId) {
      showToast('error', 'Please select a bank account for this payment method');
      return;
    }
    setSubmittingPayment(true);
    try {
      const results = await postPayment(addPaymentFolio.reservationId, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference.trim() || undefined,
        bankAccountId: BANK_REQUIRED_METHODS.includes(paymentForm.paymentMethod)
          ? paymentForm.bankAccountId
          : undefined,
      });
      const r = results[0];
      showToast('success', `Payment of ${addPaymentFolio.currency} ${amount.toFixed(2)} posted${r?.idempotent ? ' (duplicate detected — not re-posted)' : ''}`);
      setAddPaymentFolio(null);
      await loadFolios();
      if (expandedFolioId === addPaymentFolio.id) {
        await loadFolioLines(addPaymentFolio);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const submitVoid = async () => {
    if (!voidTarget || !voidReason.trim()) return;
    setSubmittingVoid(true);
    try {
      await voidCharge(voidTarget.folio.reservationId, voidTarget.line.id, voidReason.trim());
      showToast('success', 'Charge voided');
      setVoidTarget(null);
      setVoidReason('');
      await loadFolios();
      await loadFolioLines(voidTarget.folio);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to void charge');
    } finally {
      setSubmittingVoid(false);
    }
  };

  const handleCloseFolio = async (folio: FolioListItem) => {
    if (folio.status !== 'Open') return;
    if (!window.confirm(`Close folio ${folio.id} and generate the final invoice?`)) return;
    setActionInFlight((p) => ({ ...p, [folio.id]: true }));
    try {
      await closeFolioWithInvoice(folio.id);
      showToast('success', 'Folio closed with invoice');
      await loadFolios();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to close folio');
    } finally {
      setActionInFlight((p) => ({ ...p, [folio.id]: false }));
    }
  };

  const handleGenerateInvoice = async (folio: FolioListItem) => {
    setActionInFlight((p) => ({ ...p, [folio.id]: true }));
    try {
      const result = await generateInvoice(folio.id);
      showToast('success', `Invoice ${result.invoice.invoice_number} generated`);
      await loadFolios();
      // Open a printable invoice preview window
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(folio.reservationId),
        getFolioDetails(folio.reservationId),
      ]);
      if (reservation) {
        printInvoice(reservation, details);
      } else {
        showToast('error', 'Invoice generated but preview failed — try Download instead');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate invoice');
    } finally {
      setActionInFlight((p) => ({ ...p, [folio.id]: false }));
    }
  };

  const handleDownloadInvoice = async (folio: FolioListItem) => {
    setActionInFlight((p) => ({ ...p, [folio.id]: true }));
    try {
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(folio.reservationId),
        getFolioDetails(folio.reservationId),
      ]);
      if (reservation) {
        downloadInvoiceCsv(reservation, details);
        showToast('success', 'Invoice CSV downloaded');
      } else {
        showToast('error', 'Failed to load reservation details for download');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to download invoice');
    } finally {
      setActionInFlight((p) => ({ ...p, [folio.id]: false }));
    }
  };

  const handlePrintPreview = async (folio: FolioListItem) => {
    setActionInFlight((p) => ({ ...p, [folio.id]: true }));
    try {
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(folio.reservationId),
        getFolioDetails(folio.reservationId),
      ]);
      if (reservation) {
        printInvoice(reservation, details);
      } else {
        showToast('error', 'Failed to load reservation details for print preview');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to open print preview');
    } finally {
      setActionInFlight((p) => ({ ...p, [folio.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Folio & Billing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Charge posting and folio management</p>
        </div>
        <div className="flex items-center gap-3">
          {activeSubTab === 'ledger' && (
            <button
              onClick={loadFolios}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'ledger'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Folio Ledger
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'history'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          Invoice & Payment History
        </button>
        <button
          onClick={() => setActiveSubTab('shifts')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'shifts'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Cashier Shifts
        </button>
      </div>

      {/* Invoice & Payment History sub-tab */}
      {activeSubTab === 'history' && <FolioInvoicePaymentHistory />}

      {/* Cashier Shifts sub-tab */}
      {activeSubTab === 'shifts' && <CashierShifts />}

      {/* Ledger sub-tab content */}
      {activeSubTab === 'ledger' && (
        <>
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

      {/* Folio Types (quick filter chips) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {FOLIO_TYPES.map((type) => {
          const Icon = type.icon;
          const active = folioTypeFilter === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setFolioTypeFilter(active ? 'all' : (type.id as FolioTypeFilter))}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm ${
                active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Folios List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Folios</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search folios..."
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={folioTypeFilter}
              onChange={(e) => setFolioTypeFilter(e.target.value as FolioTypeFilter)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Guest">Guest Folio</option>
              <option value="Master">Master Folio</option>
              <option value="Company">Company Folio</option>
              <option value="Group">Group Folio</option>
              <option value="Split">Split Folio</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Empty states */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading folios...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8 mb-3" />
            <p className="text-sm">{error}</p>
            <button onClick={loadFolios} className="mt-3 text-sm text-blue-600 hover:underline">
              Try again
            </button>
          </div>
        ) : filteredFolios.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Receipt className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No folios found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredFolios.map((folio) => {
              const isExpanded = expandedFolioId === folio.id;
              const lines = linesByFolio[folio.id] || [];
              const busy = !!actionInFlight[folio.id];
              return (
                <div key={folio.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <button
                      onClick={() => handleExpand(folio)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {folio.folioType} Folio
                        </h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${folioTypeColors[folio.folioType] || folioTypeColors.Guest}`}>
                          {folio.folioType}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[folio.status] || statusColors.Open}`}>
                          {folio.status}
                        </span>
                        {folio.targetFolio && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                            Folio {folio.targetFolio}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Guest:</span>
                          <span className="text-gray-900 dark:text-white">{folio.guestName || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Room:</span>
                          <span className="text-gray-900 dark:text-white">{folio.roomNumber || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Opened:</span>
                          <span className="text-gray-900 dark:text-white">
                            {folio.openedAt ? new Date(folio.openedAt).toLocaleDateString() : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Charges:</span>
                          <span className="text-gray-900 dark:text-white">{folio.totalCharges.toFixed(2)} {folio.currency}</span>
                        </div>
                      </div>
                    </button>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {folio.currency} {folio.totalCharges.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Charges</div>
                      <div className={`text-lg font-medium ${folio.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {folio.currency} {folio.balance.toFixed(2)} balance
                      </div>
                    </div>
                  </div>

                  {/* Expanded charges table */}
                  {isExpanded && (
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
                      {linesLoading && !lines.length ? (
                        <div className="p-6 flex items-center justify-center text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Loading charges...
                        </div>
                      ) : lines.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No charge lines on this folio.
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-100 dark:bg-slate-800">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {lines.map((line) => (
                              <tr key={line.id} className="hover:bg-gray-100 dark:hover:bg-slate-800">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{line.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{line.lineType}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                  {line.transactionDate ? new Date(line.transactionDate).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{line.quantity}</td>
                                <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">
                                  {folio.currency} {line.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => setVoidTarget({ folio, line })}
                                      title="Void charge"
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-100 dark:bg-slate-800">
                            <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Total Charges</td>
                              <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 dark:text-white">
                                {folio.currency} {folio.totalCharges.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Payments</td>
                              <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 dark:text-white">
                                -{folio.currency} {folio.totalPayments.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white">Balance</td>
                              <td className={`px-4 py-2 text-sm font-bold text-right ${folio.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {folio.currency} {folio.balance.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openAddCharge(folio)}
                        disabled={folio.status !== 'Open'}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Add Charge
                      </button>
                      <button
                        onClick={() => openAddPayment(folio)}
                        disabled={folio.status !== 'Open'}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="w-4 h-4" />
                        Add Payment
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(folio)}
                        disabled={busy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Generate Invoice
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintPreview(folio)}
                        disabled={busy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                        Print
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(folio)}
                        disabled={busy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download
                      </button>
                      {folio.status === 'Open' && (
                        <button
                          onClick={() => handleCloseFolio(folio)}
                          disabled={busy}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Close Folio
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Charge Modal */}
      {addChargeFolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post Charge</h3>
              <button
                onClick={() => setAddChargeFolio(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Folio: {addChargeFolio.folioType} · {addChargeFolio.guestName || 'Guest'} · Room {addChargeFolio.roomNumber || '—'}
              </div>

              {/* Quick category chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Category</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CHARGE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = chargeForm.lineType === cat.lineType;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setChargeForm((f) => ({ ...f, lineType: cat.lineType }))}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={chargeForm.description}
                  onChange={(e) => setChargeForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Restaurant Dinner"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={chargeForm.amount}
                    onChange={(e) => setChargeForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={chargeForm.quantity}
                    onChange={(e) => setChargeForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Type</label>
                <select
                  value={chargeForm.lineType}
                  onChange={(e) => setChargeForm((f) => ({ ...f, lineType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Room">Room</option>
                  <option value="F&B">F&B</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Spa">Spa</option>
                  <option value="Telephone">Telephone</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddChargeFolio(null)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitAddCharge}
                disabled={submittingCharge}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submittingCharge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Post Charge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Charge Modal */}
      {voidTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Void Charge</h3>
              <button
                onClick={() => {
                  setVoidTarget(null);
                  setVoidReason('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm">
                <div className="font-medium text-gray-900 dark:text-white">{voidTarget.line.description}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {voidTarget.line.lineType} · {voidTarget.line.quantity} × {voidTarget.line.amount.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason (required)</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Reason for voiding this charge"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setVoidTarget(null);
                  setVoidReason('');
                }}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitVoid}
                disabled={submittingVoid || !voidReason.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submittingVoid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Void Charge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {addPaymentFolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post Payment</h3>
              <button
                onClick={() => setAddPaymentFolio(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Folio: {addPaymentFolio.folioType} · {addPaymentFolio.guestName || 'Guest'} · Room {addPaymentFolio.roomNumber || '—'}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Outstanding Balance</span>
                <span className={`font-bold ${addPaymentFolio.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {addPaymentFolio.currency} {addPaymentFolio.balance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const active = paymentForm.paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentForm((f) => ({ ...f, paymentMethod: m.id }))}
                        className={`px-3 py-2 rounded-lg border text-xs transition-colors ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {BANK_REQUIRED_METHODS.includes(paymentForm.paymentMethod) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Account {bankAccounts.length === 0 && <span className="text-red-500">(none configured)</span>}
                  </label>
                  {bankAccounts.length > 0 ? (
                    <select
                      value={paymentForm.bankAccountId}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, bankAccountId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} — {b.accountName} ({b.accountNumber}) [{b.accountType}]{b.isDefaultForSales ? ' ★' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 px-4 py-2 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                      No active bank accounts. Add one in Finance → Bank Accounts.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference (optional)</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                    placeholder="e.g. TXN-12345"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddPaymentFolio(null)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitPayment}
                disabled={submittingPayment}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Post Payment
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default FolioBilling;
