/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 *
 * FolioInvoicePaymentHistory - Invoice & Payment History view for the Folio portal.
 * Lists every invoice document with its associated payments, folio and reservation,
 * with filtering, summary cards and a print/preview modal (reuses UnifiedInvoiceTemplate).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Receipt,
  CreditCard,
  Coins,
  Smartphone,
  Landmark,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight,
  Unlink,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import UnifiedInvoiceTemplate, { InvoiceItem, InvoiceFee, InvoicePayment } from '../Shared/UnifiedInvoiceTemplate';

interface HistoryPayment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  is_voided: boolean;
  voided_at: string | null;
  bank_account_id: string | null;
}

interface HistoryInvoice {
  id: string;
  folio_id: string;
  invoice_number: string;
  invoice_type: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_tin: string | null;
  customer_vat_no: string | null;
  notes: string | null;
  is_voided: boolean;
  created_at: string;
  folios: {
    id: string;
    reservation_id: string | null;
    folio_type: string | null;
    status: string | null;
  } | null;
  reservations: {
    id: string;
    guest_name: string;
    guest_email: string | null;
    room_number: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
  } | null;
  payments: HistoryPayment[];
  bank_accounts: {
    id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
  } | null;
}

interface FullInvoiceResponse {
  invoice: {
    id: string;
    folio_id: string;
    invoice_number: string;
    invoice_type: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_total: number;
    discount_total: number;
    total: number;
    amount_paid: number;
    status: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_tin: string | null;
    customer_vat_no: string | null;
    notes: string | null;
  };
  folio: { id: string; reservation_id: string | null; folio_type: string | null; status: string | null } | null;
  reservation: {
    id: string;
    guest_name: string;
    guest_email: string | null;
    guest_tin: string | null;
    guest_vat_no: string | null;
    room_number: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
  } | null;
  lines: { id: string; description: string; amount: number; quantity: number | null; unit_price: number | null; line_type: string }[];
  payments: { id: string; payment_date: string; payment_method: string; amount: number; reference_number: string | null }[];
}

// Uninvoiced payment (from /api/folio-payments/audit where invoice_documents is null)
interface UninvoicedPayment {
  id: string;
  folio_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  is_voided: boolean;
  bank_account_id: string | null;
  folios: { reservation_id: string; folio_type: string; status: string } | null;
  reservations: { id: string; guest_name: string; room_number: string | null; check_in_date: string | null; check_out_date: string | null } | null;
  bank_accounts: { id: string; account_name: string; account_number: string; bank_name: string } | null;
}

// Consolidated payment row — unified shape for both invoiced and uninvoiced payments
interface ConsolidatedPayment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  is_voided: boolean;
  bank_accounts: { id: string; account_name: string; account_number: string; bank_name: string } | null;
  guest_name: string | null;
  room_number: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_status: string | null;
  invoice_total: number | null;
  isUninvoiced: boolean;
}

type PaymentViewFilter = 'all' | 'invoiced' | 'uninvoiced';

const invoiceStatuses = ['Paid', 'Issued', 'Pending', 'Overdue', 'Voided'];

export default function FolioInvoicePaymentHistory() {
  const { formatAmount } = useERP();

  const [invoices, setInvoices] = useState<HistoryInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Uninvoiced payments (payments with no invoice_id / invoice_documents)
  const [uninvoicedPayments, setUninvoicedPayments] = useState<UninvoicedPayment[]>([]);
  const [uninvoicedLoading, setUninvoicedLoading] = useState(true);
  const [uninvoicedError, setUninvoicedError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentViewFilter, setPaymentViewFilter] = useState<PaymentViewFilter>('all');

  // Full invoice preview/print data
  const [invoicePrintData, setInvoicePrintData] = useState<{
    invoiceNumber: string;
    date: string;
    title: string;
    customerName: string;
    customerEmail?: string;
    customerTin?: string;
    customerVatNo?: string;
    roomNo?: string;
    stayDetails?: { checkIn?: string; checkOut?: string; nights: number; roomType?: string; rate?: number };
    items: InvoiceItem[];
    subtotal: number;
    fees: InvoiceFee[];
    total: number;
    payments: InvoicePayment[];
    balanceDue: number;
    footerMessage?: string;
  } | null>(null);
  const [invoicePrintLoading, setInvoicePrintLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('invoiceType', typeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/invoices?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch invoice history');
      }
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice history');
    } finally {
      setLoading(false);
    }
  };

  const fetchUninvoicedPayments = async () => {
    setUninvoicedLoading(true);
    setUninvoicedError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/folio-payments/audit?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch uninvoiced payments');
      }
      const data = await response.json();
      // Uninvoiced = payments with no linked invoice document
      const uninvoiced = (data.payments || []).filter((p: any) => !p.invoice_documents && !p.invoice_id);
      setUninvoicedPayments(uninvoiced);
    } catch (err: any) {
      setUninvoicedError(err.message || 'Failed to fetch uninvoiced payments');
    } finally {
      setUninvoicedLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchUninvoicedPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, statusFilter, typeFilter]);

  const handleSearch = () => {
    fetchInvoices();
    fetchUninvoicedPayments();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Coins size={14} />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard size={14} />;
      case 'Mobile Money':
        return <Smartphone size={14} />;
      case 'Bank Transfer':
      case 'Cheque':
        return <Landmark size={14} />;
      default:
        return <Receipt size={14} />;
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Credit Card':
      case 'Debit Card':
        return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
      case 'Bank Transfer':
      case 'Cheque':
        return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
      default:
        return 'bg-slate-50 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Issued':
      case 'Pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Voided':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const handlePreviewInvoice = async (invoiceId: string) => {
    setInvoicePrintLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, { credentials: 'include' });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load invoice preview');
      }
      const data: FullInvoiceResponse = await response.json();
      const invoice = data.invoice;
      const reservation = data.reservation;

      const checkIn = reservation?.check_in_date ? new Date(reservation.check_in_date).toLocaleDateString() : undefined;
      const checkOut = reservation?.check_out_date ? new Date(reservation.check_out_date).toLocaleDateString() : undefined;

      let nights = 0;
      if (reservation?.check_in_date && reservation?.check_out_date) {
        const start = new Date(reservation.check_in_date);
        const end = new Date(reservation.check_out_date);
        const diffMs = end.getTime() - start.getTime();
        nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const items: InvoiceItem[] = (data.lines || []).map(line => {
        const qty = line.quantity || 1;
        const unitPrice = line.unit_price ?? (qty ? line.amount / qty : line.amount);
        return {
          productName: line.description || line.line_type || 'Folio line item',
          quantity: qty,
          price: unitPrice
        };
      });

      const fees: InvoiceFee[] = [];
      if (invoice.tax_total) {
        fees.push({ label: 'Tax', amount: invoice.tax_total });
      }
      if (invoice.discount_total) {
        fees.push({ label: 'Discount', amount: invoice.discount_total, isDiscount: true });
      }

      const payments: InvoicePayment[] = (data.payments || []).map(payment => ({
        method: payment.payment_method,
        amount: payment.amount,
        date: payment.payment_date ? new Date(payment.payment_date).toLocaleString() : undefined
      }));

      const subtotal = invoice.subtotal || invoice.total || 0;

      setInvoicePrintData({
        invoiceNumber: invoice.invoice_number,
        date: new Date(invoice.issue_date).toLocaleString(),
        title: invoice.invoice_type === 'Group Master' ? 'GROUP MASTER INVOICE' : 'OFFICIAL VAT INVOICE',
        customerName: invoice.customer_name || reservation?.guest_name || 'Guest',
        customerEmail: invoice.customer_email || reservation?.guest_email || undefined,
        customerTin: invoice.customer_tin || reservation?.guest_tin || undefined,
        customerVatNo: invoice.customer_vat_no || reservation?.guest_vat_no || undefined,
        roomNo: reservation?.room_number || undefined,
        stayDetails: checkIn && checkOut
          ? { checkIn, checkOut, nights, roomType: 'Standard', rate: subtotal / (nights || 1) }
          : undefined,
        items: items.length > 0 ? items : [{ productName: 'Folio charges', quantity: 1, price: subtotal }],
        subtotal,
        fees,
        total: invoice.total || 0,
        payments,
        balanceDue: (invoice.total || 0) - (invoice.amount_paid || 0),
        footerMessage: invoice.notes || `Invoice ${invoice.invoice_number} — ${invoice.status}`
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice preview');
    } finally {
      setInvoicePrintLoading(false);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const active = invoices.filter(i => !i.is_voided);
    const totalInvoiced = active.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalCollected = active.reduce(
      (sum, i) => sum + (i.payments || []).filter(p => !p.is_voided).reduce((s, p) => s + p.amount, 0),
      0
    );
    const totalOutstanding = totalInvoiced - totalCollected;
    const paidCount = active.filter(i => i.status === 'Paid').length;
    const pendingCount = active.filter(i => i.status !== 'Paid' && i.status !== 'Voided').length;
    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      invoiceCount: active.length,
      paidCount,
      pendingCount
    };
  }, [invoices]);

  const invoiceTypes = useMemo(() => {
    const types = new Set<string>();
    invoices.forEach(i => i.invoice_type && types.add(i.invoice_type));
    return Array.from(types);
  }, [invoices]);

  const uninvoicedCount = useMemo(
    () => uninvoicedPayments.filter(p => !p.is_voided).length,
    [uninvoicedPayments]
  );

  // Consolidated payments: flatten invoiced payments (from invoices) + uninvoiced payments
  // into one unified list sorted by payment date descending.
  const consolidatedPayments = useMemo<ConsolidatedPayment[]>(() => {
    const fromInvoices: ConsolidatedPayment[] = [];
    invoices.forEach(inv => {
      (inv.payments || []).forEach(p => {
        fromInvoices.push({
          id: p.id,
          payment_date: p.payment_date,
          amount: p.amount,
          payment_method: p.payment_method,
          reference_number: p.reference_number,
          is_voided: p.is_voided,
          bank_accounts: inv.bank_accounts,
          guest_name: inv.customer_name || inv.reservations?.guest_name || null,
          room_number: inv.reservations?.room_number || null,
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_status: inv.status,
          invoice_total: inv.total ?? null,
          isUninvoiced: false
        });
      });
    });

    const fromUninvoiced: ConsolidatedPayment[] = uninvoicedPayments.map(p => ({
      id: p.id,
      payment_date: p.payment_date,
      amount: p.amount,
      payment_method: p.payment_method,
      reference_number: p.reference_number,
      is_voided: p.is_voided,
      bank_accounts: p.bank_accounts,
      guest_name: p.reservations?.guest_name || null,
      room_number: p.reservations?.room_number || null,
      invoice_id: null,
      invoice_number: null,
      invoice_status: null,
      invoice_total: null,
      isUninvoiced: true
    }));

    return [...fromInvoices, ...fromUninvoiced].sort(
      (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  }, [invoices, uninvoicedPayments]);

  // Apply the view filter (all / invoiced / uninvoiced) + search term
  const visiblePayments = useMemo(() => {
    let list = consolidatedPayments;
    if (paymentViewFilter === 'invoiced') list = list.filter(p => !p.isUninvoiced);
    else if (paymentViewFilter === 'uninvoiced') list = list.filter(p => p.isUninvoiced);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.invoice_number?.toLowerCase().includes(s) ||
        p.guest_name?.toLowerCase().includes(s) ||
        p.room_number?.toLowerCase().includes(s) ||
        p.reference_number?.toLowerCase().includes(s) ||
        p.payment_method.toLowerCase().includes(s)
      );
    }
    return list;
  }, [consolidatedPayments, paymentViewFilter, searchTerm]);

  const visibleTotal = useMemo(
    () => visiblePayments.filter(p => !p.is_voided).reduce((s, p) => s + p.amount, 0),
    [visiblePayments]
  );

  // Breakdown of visible payments by payment method (responds to view filter)
  const breakdownByMethod = useMemo(() => {
    const groups = new Map<string, { total: number; count: number }>();
    visiblePayments.forEach(p => {
      if (p.is_voided) return;
      const key = p.payment_method || 'Unknown';
      const cur = groups.get(key) || { total: 0, count: 0 };
      cur.total += p.amount;
      cur.count += 1;
      groups.set(key, cur);
    });
    return Array.from(groups.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [visiblePayments]);

  // Breakdown of visible payments by bank account (responds to view filter)
  const breakdownByBank = useMemo(() => {
    const groups = new Map<string, { total: number; count: number; name: string; number: string }>();
    visiblePayments.forEach(p => {
      if (p.is_voided) return;
      if (!p.bank_accounts) return;
      const key = p.bank_accounts.id;
      const cur = groups.get(key) || {
        total: 0,
        count: 0,
        name: p.bank_accounts.bank_name,
        number: p.bank_accounts.account_number
      };
      cur.total += p.amount;
      cur.count += 1;
      groups.set(key, cur);
    });
    return Array.from(groups.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [visiblePayments]);

  // Visible payments with no bank account
  const breakdownNoBank = useMemo(() => {
    const items = visiblePayments.filter(p => !p.is_voided && !p.bank_accounts);
    const total = items.reduce((s, p) => s + p.amount, 0);
    return { total, count: items.length };
  }, [visiblePayments]);

  // Group visible payments by guest name (null/empty -> 'Walk-in Customer')
  const groupedByGuest = useMemo(() => {
    const groups = new Map<string, {
      guestKey: string;
      payments: ConsolidatedPayment[];
      total: number;
      activeTotal: number;
      invoiceCount: number;
      uninvoicedCount: number;
      roomNumbers: Set<string>;
      invoiceNumbers: Set<string>;
    }>();

    visiblePayments.forEach(p => {
      const key = (p.guest_name || 'Walk-in Customer').trim() || 'Walk-in Customer';
      const cur = groups.get(key) || {
        guestKey: key,
        payments: [],
        total: 0,
        activeTotal: 0,
        invoiceCount: 0,
        uninvoicedCount: 0,
        roomNumbers: new Set<string>(),
        invoiceNumbers: new Set<string>()
      };
      cur.payments.push(p);
      cur.total += p.amount;
      if (!p.is_voided) cur.activeTotal += p.amount;
      if (p.isUninvoiced) cur.uninvoicedCount += 1;
      else cur.invoiceCount += 1;
      if (p.room_number) cur.roomNumbers.add(p.room_number);
      if (p.invoice_number) cur.invoiceNumbers.add(p.invoice_number);
      groups.set(key, cur);
    });

    // Sort groups by total amount descending
    return Array.from(groups.values()).sort((a, b) => b.activeTotal - a.activeTotal);
  }, [visiblePayments]);

  // Expanded guest rows
  const [expandedGuestKeys, setExpandedGuestKeys] = useState<Set<string>>(new Set());

  const toggleGuestExpand = (key: string) => {
    setExpandedGuestKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setTypeFilter('');
    fetchInvoices();
    fetchUninvoicedPayments();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4 print-area" id="folio-invoice-history">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Billing History</span>
          <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">Invoice &amp; Payment History</h4>
        </div>
        <div className="flex gap-4 items-center text-xs">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Printer size={14} />
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border p-3 bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Invoices</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{stats.invoiceCount}</div>
        </div>
        <div className="rounded-xl border p-3 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Invoiced</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatAmount(stats.totalInvoiced)}</div>
        </div>
        <div className="rounded-xl border p-3 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Collected</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatAmount(stats.totalCollected)}</div>
        </div>
        <div className="rounded-xl border p-3 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Outstanding</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatAmount(stats.totalOutstanding)}</div>
        </div>
        <div className="rounded-xl border p-3 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Paid</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{stats.paidCount}</div>
        </div>
        <div className="rounded-xl border p-3 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Open</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{stats.pendingCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Filter size={16} />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Invoice #, guest, room, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {invoiceStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Invoice Type */}
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Invoice Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {invoiceTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Loading invoice history...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Uninvoiced fetch error (non-fatal — table still shows invoiced payments) */}
      {uninvoicedError && !error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-500" size={18} />
          <p className="text-sm text-amber-700 dark:text-amber-400">Could not load uninvoiced payments: {uninvoicedError}</p>
        </div>
      )}

      {/* Consolidated Invoice & Payment History (breakdown + table in one card) */}
      {!loading && !error && !uninvoicedLoading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Card header with view filter toggle */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Invoice &amp; Payment History</h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setPaymentViewFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-tight transition-all ${
                    paymentViewFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({consolidatedPayments.length})
                </button>
                <button
                  onClick={() => setPaymentViewFilter('invoiced')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-tight transition-all ${
                    paymentViewFilter === 'invoiced'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Invoiced ({consolidatedPayments.filter(p => !p.isUninvoiced).length})
                </button>
                <button
                  onClick={() => setPaymentViewFilter('uninvoiced')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-tight transition-all ${
                    paymentViewFilter === 'uninvoiced'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Uninvoiced ({uninvoicedCount})
                </button>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-slate-500">Visible Total</div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{formatAmount(visibleTotal)}</div>
              </div>
            </div>
          </div>

          {/* Payment breakdown panel (responds to All/Invoiced/Uninvoiced filter) */}
          <div className={`border-b border-slate-100 dark:border-slate-800 ${paymentViewFilter === 'uninvoiced' ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : 'bg-slate-50/40 dark:bg-slate-800/10'}`}>
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-100/60 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                {paymentViewFilter === 'uninvoiced' ? (
                  <Unlink size={14} className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" />
                )}
                <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                  {paymentViewFilter === 'uninvoiced' ? 'Uninvoiced' : paymentViewFilter === 'invoiced' ? 'Invoiced' : 'All'} Payment Breakdown
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[10px] font-mono text-slate-500">{visiblePayments.filter(p => !p.is_voided).length} payments</span>
                <span className={`text-sm font-black font-mono ${paymentViewFilter === 'uninvoiced' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatAmount(visibleTotal)}
                </span>
              </div>
            </div>
            <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* By Payment Method */}
              <div className="space-y-1.5">
                <h5 className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <CreditCard size={11} />
                  By Payment Method
                </h5>
                {breakdownByMethod.length === 0 ? (
                  <p className="text-[10px] text-slate-400">No payments to break down</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {breakdownByMethod.map(([method, group]) => {
                      const percentage = visibleTotal > 0 ? Math.round((group.total / visibleTotal) * 100) : 0;
                      const getMethodColor = (m: string) => {
                        switch (m) {
                          case 'Cash': return 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40';
                          case 'Credit Card':
                          case 'Debit Card': return 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40';
                          case 'Bank Transfer':
                          case 'Cheque': return 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40';
                          default: return 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40';
                        }
                      };
                      const getMethodIconColor = (m: string) => {
                        switch (m) {
                          case 'Cash': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-800/50';
                          case 'Credit Card':
                          case 'Debit Card': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-800/50';
                          case 'Bank Transfer':
                          case 'Cheque': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-800/50';
                          default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/15 border-slate-200 dark:border-slate-800/50';
                        }
                      };
                      return (
                        <div key={method} className={`rounded-lg border p-2 ${getMethodColor(method)}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className={`inline-flex items-center justify-center w-4 h-4 rounded border ${getMethodIconColor(method)}`}>
                              {getPaymentIcon(method)}
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate">{method}</span>
                          </div>
                          <div className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatAmount(group.total)}</div>
                          <div className="text-[8px] text-slate-500 font-mono">{group.count} • {percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* By Bank Account */}
              <div className="space-y-1.5">
                <h5 className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Landmark size={11} />
                  By Bank Account
                </h5>
                {breakdownByBank.length === 0 && breakdownNoBank.count === 0 ? (
                  <p className="text-[10px] text-slate-400">No payments with bank accounts</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {breakdownByBank.map(([id, group]) => {
                      const percentage = visibleTotal > 0 ? Math.round((group.total / visibleTotal) * 100) : 0;
                      return (
                        <div key={id} className="rounded-lg border p-2 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-indigo-600 dark:text-indigo-400">
                              <Landmark size={11} />
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate" title={`${group.name}-${group.number}`}>
                              {group.name}-{group.number}
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatAmount(group.total)}</div>
                          <div className="text-[8px] text-slate-500 font-mono">{group.count} • {percentage}%</div>
                        </div>
                      );
                    })}
                    {breakdownNoBank.count > 0 && (
                      <div className="rounded-lg border p-2 bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-slate-500 dark:text-slate-400">
                            <Unlink size={11} />
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate">No Bank</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatAmount(breakdownNoBank.total)}</div>
                        <div className="text-[8px] text-slate-500 font-mono">{breakdownNoBank.count} (cash)</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold w-8"></th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Rooms</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Invoices</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Payments</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Uninvoiced</th>
                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Paid</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {groupedByGuest.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                        No payments found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    groupedByGuest.map((group) => {
                      const isExpanded = expandedGuestKeys.has(group.guestKey);
                      const rooms = Array.from(group.roomNumbers).join(', ') || '-';
                      const invoiceList = Array.from(group.invoiceNumbers);
                      return (
                        <React.Fragment key={group.guestKey}>
                          {/* Guest summary row */}
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer bg-slate-50/30 dark:bg-slate-800/20"
                            onClick={() => toggleGuestExpand(group.guestKey)}
                          >
                            <td className="px-3 py-3 align-top">
                              <span className="inline-flex items-center justify-center w-5 h-5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{group.guestKey}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                              {rooms}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-0.5">
                                {invoiceList.length === 0 ? (
                                  <span className="text-[10px] font-mono text-slate-400 italic">None</span>
                                ) : (
                                  invoiceList.slice(0, 2).map(num => (
                                    <span key={num} className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                                      <FileText size={10} />
                                      {num}
                                    </span>
                                  ))
                                )}
                                {invoiceList.length > 2 && (
                                  <span className="text-[9px] font-mono text-slate-400">+{invoiceList.length - 2} more</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                              {group.payments.length}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {group.uninvoicedCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
                                  <Unlink size={11} />
                                  {group.uninvoicedCount}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-sm font-black text-slate-900 dark:text-white font-mono text-right">
                              {formatAmount(group.activeTotal)}
                            </td>
                            <td className="px-4 py-3 align-top"></td>
                          </motion.tr>

                          {/* Expanded payment rows for this guest */}
                          <AnimatePresence>
                            {isExpanded && (
                              <>
                                <motion.tr
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="bg-indigo-50/40 dark:bg-indigo-900/10"
                                >
                                  <td colSpan={8} className="px-4 py-2">
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                          {group.guestKey} — {group.payments.length} payment{group.payments.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">
                                          {group.invoiceCount} invoiced • {group.uninvoicedCount} uninvoiced
                                        </span>
                                      </div>
                                      <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Date</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Invoice #</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Method</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Bank Account</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Reference</th>
                                            <th className="px-3 py-2 text-right text-[10px] font-mono uppercase text-slate-500 font-semibold">Amount</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Status</th>
                                            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold"></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                          {group.payments.map((payment) => (
                                            <tr
                                              key={`${payment.isUninvoiced ? 'un' : 'inv'}-${payment.id}`}
                                              className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${payment.is_voided ? 'opacity-50' : ''} ${payment.isUninvoiced ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}
                                            >
                                              <td className="px-3 py-2 align-top text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {formatDate(payment.payment_date)}
                                              </td>
                                              <td className="px-3 py-2 align-top">
                                                {payment.isUninvoiced ? (
                                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
                                                    <Unlink size={11} />
                                                    Uninvoiced
                                                  </span>
                                                ) : (
                                                  <div className="flex items-center gap-2">
                                                    <FileText size={12} className="text-indigo-600 dark:text-indigo-400" />
                                                    <div className="flex flex-col">
                                                      <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 font-mono">{payment.invoice_number}</span>
                                                      {payment.invoice_total != null && (
                                                        <span className="text-[9px] font-mono text-slate-400">Inv: {formatAmount(payment.invoice_total)}</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 align-top">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold uppercase w-fit ${getMethodBadgeColor(payment.payment_method)}`}>
                                                  {getPaymentIcon(payment.payment_method)}
                                                  {payment.payment_method}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                                                {payment.bank_accounts ? `${payment.bank_accounts.bank_name}-${payment.bank_accounts.account_number}` : (
                                                  <span className="text-slate-400 italic">No bank</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                                                {payment.reference_number || '-'}
                                              </td>
                                              <td className="px-3 py-2 align-top text-sm font-bold text-slate-900 dark:text-white font-mono text-right">
                                                {formatAmount(payment.amount)}
                                              </td>
                                              <td className="px-3 py-2 align-top">
                                                {payment.is_voided ? (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-rose-600 dark:text-rose-400">
                                                    <AlertCircle size={11} />
                                                    Voided
                                                  </span>
                                                ) : payment.isUninvoiced ? (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                                                    <Unlink size={11} />
                                                    Uninvoiced
                                                  </span>
                                                ) : payment.invoice_status ? (
                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${getInvoiceStatusColor(payment.invoice_status)}`}>
                                                    {payment.invoice_status}
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle size={11} />
                                                    Active
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 align-top">
                                                {!payment.isUninvoiced && payment.invoice_id && (
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); handlePreviewInvoice(payment.invoice_id!); }}
                                                    disabled={invoicePrintLoading}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Preview & Print Invoice"
                                                  >
                                                    <Printer size={13} />
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                                            <td colSpan={5} className="px-3 py-2 text-right text-[10px] font-mono uppercase text-slate-500 font-bold">
                                              {group.guestKey} Subtotal
                                            </td>
                                            <td className="px-3 py-2 text-sm font-black text-slate-900 dark:text-white font-mono text-right">{formatAmount(group.activeTotal)}</td>
                                            <td colSpan={2}></td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </td>
                                </motion.tr>
                              </>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                  <td colSpan={6} className="px-4 py-2.5 text-right text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Grand Total ({groupedByGuest.length} guests • {visiblePayments.length} payments)
                  </td>
                  <td className="px-4 py-2.5 text-sm font-black text-slate-900 dark:text-white font-mono text-right">{formatAmount(visibleTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Full Invoice Preview / Print */}
      {invoicePrintData && (
        <UnifiedInvoiceTemplate
          invoiceNumber={invoicePrintData.invoiceNumber}
          date={invoicePrintData.date}
          title={invoicePrintData.title}
          customerName={invoicePrintData.customerName}
          customerEmail={invoicePrintData.customerEmail}
          customerTin={invoicePrintData.customerTin}
          customerVatNo={invoicePrintData.customerVatNo}
          roomNo={invoicePrintData.roomNo}
          stayDetails={invoicePrintData.stayDetails}
          items={invoicePrintData.items}
          subtotal={invoicePrintData.subtotal}
          fees={invoicePrintData.fees}
          total={invoicePrintData.total}
          payments={invoicePrintData.payments}
          balanceDue={invoicePrintData.balanceDue}
          footerMessage={invoicePrintData.footerMessage}
          onClose={() => setInvoicePrintData(null)}
        />
      )}
    </div>
  );
}
