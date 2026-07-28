/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Image as ImageIcon, 
  Eye,
  X,
  Receipt,
  CreditCard,
  Coins,
  Smartphone,
  Landmark,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Unlink,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import UnifiedInvoiceTemplate, { InvoiceItem, InvoiceFee, InvoicePayment } from '../Shared/UnifiedInvoiceTemplate';

interface FolioLine {
  id: string;
  description: string;
  amount: number;
  quantity: number | null;
  unit_price: number | null;
  line_type: string;
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
  folio: {
    id: string;
    reservation_id: string | null;
    folio_type: string | null;
    status: string | null;
  } | null;
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
  lines: FolioLine[];
  payments: {
    id: string;
    payment_date: string;
    payment_method: string;
    amount: number;
    reference_number: string | null;
  }[];
}

interface FolioPayment {
  id: string;
  folio_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  receipt_url: string | null;
  cashier_id: string | null;
  created_at: string;
  is_voided: boolean;
  voided_at: string | null;
  invoice_id: string | null;
  bank_account_id: string | null;
  folios: {
    reservation_id: string;
    folio_type: string;
    status: string;
  };
  reservations: {
    id: string;
    guest_name: string;
    room_number: string | null;
    check_in_date: string | null;
    check_out_date: string | null;
  } | null;
  invoice_documents: {
    id: string;
    invoice_number: string;
    invoice_type: string;
    issue_date: string;
    total: number;
    status: string;
  } | null;
  bank_accounts: {
    id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
  } | null;
}

export default function FolioPaymentAudit() {
  const { formatAmount } = useERP();
  
  const [payments, setPayments] = useState<FolioPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [bankAccountFilter, setBankAccountFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Receipt preview
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  
  // Invoice details modal
  const [selectedInvoice, setSelectedInvoice] = useState<FolioPayment['invoice_documents'] | null>(null);
  
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
  
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Mobile Money',
    'Bank Transfer',
    'Cheque',
    'Voucher',
    'Corporate Bill',
    'Company Ledger',
    'Room Charge',
    'Complimentary',
    'Other'
  ];

  const invoiceStatuses = ['Paid', 'Pending', 'Overdue', 'Voided'];

  // Bank accounts from payments
  const bankAccounts = React.useMemo(() => {
    const accounts = new Map<string, { id: string; name: string; number: string }>();
    payments.forEach(p => {
      if (p.bank_accounts && !accounts.has(p.bank_accounts.id)) {
        accounts.set(p.bank_accounts.id, {
          id: p.bank_accounts.id,
          name: p.bank_accounts.bank_name,
          number: p.bank_accounts.account_number
        });
      }
    });
    return Array.from(accounts.values());
  }, [payments]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (bankAccountFilter) params.append('bankAccountId', bankAccountFilter);
      
      const response = await fetch(`/api/folio-payments/audit?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch folio payments');
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch folio payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [startDate, endDate, paymentMethodFilter, bankAccountFilter]);

  const handleSearch = () => {
    fetchPayments();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Coins size={16} />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard size={16} />;
      case 'Mobile Money':
        return <Smartphone size={16} />;
      case 'Bank Transfer':
      case 'Cheque':
        return <Landmark size={16} />;
      default:
        return <Receipt size={16} />;
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
        return 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      default:
        return 'bg-slate-50 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const handlePreviewInvoice = async (invoiceId: string) => {
    setInvoicePrintLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load invoice preview');
      }
      const data: FullInvoiceResponse = await response.json();
      const invoice = data.invoice;
      const reservation = data.reservation;

      const checkIn = reservation?.check_in_date
        ? new Date(reservation.check_in_date).toLocaleDateString()
        : undefined;
      const checkOut = reservation?.check_out_date
        ? new Date(reservation.check_out_date).toLocaleDateString()
        : undefined;

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
        items: items.length > 0
          ? items
          : [{ productName: 'Folio charges', quantity: 1, price: subtotal }],
        subtotal,
        fees,
        total: invoice.total || 0,
        payments,
        balanceDue: (invoice.total || 0) - (invoice.amount_paid || 0),
        footerMessage: invoice.notes || `Invoice ${invoice.invoice_number} — ${invoice.status}`
      });
      setSelectedInvoice(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice preview');
    } finally {
      setInvoicePrintLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      p.reservations?.guest_name?.toLowerCase().includes(searchLower) ||
      p.reservations?.room_number?.toLowerCase().includes(searchLower) ||
      p.reference_number?.toLowerCase().includes(searchLower) ||
      p.payment_method.toLowerCase().includes(searchLower) ||
      p.invoice_documents?.invoice_number?.toLowerCase().includes(searchLower)
    );
  });

  const invoiceFilteredPayments = filteredPayments.filter(p => {
    if (!invoiceStatusFilter) return true;
    if (invoiceStatusFilter === 'No Invoice') {
      return !p.invoice_documents;
    }
    return p.invoice_documents?.status === invoiceStatusFilter;
  });

  // Payment method statistics
  const paymentMethodStats = React.useMemo(() => {
    const stats = new Map<string, { amount: number; count: number }>();
    invoiceFilteredPayments.forEach(p => {
      if (!p.is_voided) {
        const method = p.payment_method;
        const current = stats.get(method) || { amount: 0, count: 0 };
        stats.set(method, {
          amount: current.amount + p.amount,
          count: current.count + 1
        });
      }
    });
    return stats;
  }, [invoiceFilteredPayments]);

  // Bank account statistics
  const bankAccountStats = React.useMemo(() => {
    const stats = new Map<string, { amount: number; count: number; name: string; number: string }>();
    invoiceFilteredPayments.forEach(p => {
      if (!p.is_voided && p.bank_accounts) {
        const key = p.bank_accounts.id;
        const current = stats.get(key) || { amount: 0, count: 0, name: p.bank_accounts.bank_name, number: p.bank_accounts.account_number };
        stats.set(key, {
          amount: current.amount + p.amount,
          count: current.count + 1,
          name: current.name,
          number: current.number
        });
      }
    });
    return stats;
  }, [invoiceFilteredPayments]);

  // Group payments by invoice
  const groupedPayments = invoiceFilteredPayments.reduce((acc, payment) => {
    const invoiceId = payment.invoice_id || 'no-invoice';
    if (!acc[invoiceId]) {
      acc[invoiceId] = {
        invoice: payment.invoice_documents,
        payments: []
      };
    }
    acc[invoiceId].payments.push(payment);
    return acc;
  }, {} as Record<string, { invoice: FolioPayment['invoice_documents']; payments: FolioPayment[] }>);

  const totalAmount = invoiceFilteredPayments.reduce((sum, p) => sum + (p.is_voided ? 0 : p.amount), 0);
  
  const invoiceStats = {
    total: invoiceFilteredPayments.length,
    withInvoice: invoiceFilteredPayments.filter(p => p.invoice_documents).length,
    withoutInvoice: invoiceFilteredPayments.filter(p => !p.invoice_documents).length,
    paidInvoices: invoiceFilteredPayments.filter(p => p.invoice_documents?.status === 'Paid').length,
    pendingInvoices: invoiceFilteredPayments.filter(p => p.invoice_documents?.status === 'Pending').length
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
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

  return (
    <div className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-4" id="historical-pos-records">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Core Ledgers</span>
          <h4 className="text-base font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">Boutique Shift Invoice Journal</h4>
        </div>
        <div className="flex gap-4 items-center text-xs">
          <input 
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 font-mono text-xs" 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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

      {/* Payment Method Summary */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Payment Method Summary</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from(paymentMethodStats.entries()).map(([method, stats]) => {
            const percentage = totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0;
            const getMethodColor = (m: string) => {
              switch (m) {
                case 'Cash': return 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40';
                case 'Credit Card':
                case 'Debit Card': return 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40';
                case 'Bank Transfer':
                case 'Cheque': return 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40';
                default: return 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40';
              }
            };
            const getMethodIconColor = (m: string) => {
              switch (m) {
                case 'Cash': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-800/50';
                case 'Credit Card':
                case 'Debit Card': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-800/50';
                case 'Bank Transfer':
                case 'Cheque': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-800/50';
                default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/15 border-slate-200 dark:border-slate-800/50';
              }
            };
            return (
              <div key={method} className={`rounded-xl border p-3 ${getMethodColor(method)}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={getMethodIconColor(method)}>
                    {getPaymentIcon(method)}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate">{method}</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatAmount(stats.amount)}</div>
                <div className="text-[9px] text-slate-500 font-mono">{stats.count} transaction{stats.count !== 1 ? 's' : ''} • {percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Account Summary */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Bank Account Summary</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from(bankAccountStats.entries()).map(([id, stats]) => {
            const percentage = totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0;
            return (
              <div key={id} className="rounded-xl border p-3 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    <Landmark size={14} />
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate" title={`${stats.name}-${stats.number}`}>{stats.name}-{stats.number}</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatAmount(stats.amount)}</div>
                <div className="text-[9px] text-slate-500 font-mono">{stats.count} payment{stats.count !== 1 ? 's' : ''} • {percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Total Collections */}
      <div className="flex gap-4 items-center text-xs">
        <div className="bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-slate-500 font-mono">
          Shift Total Collections: <strong className="text-slate-900 dark:text-white font-sans font-black">{formatAmount(totalAmount)}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Filter size={16} />
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Item name, invoice, reference..."
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
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Payment Method */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Bank Account */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              Bank Account
            </label>
            <select
              value={bankAccountFilter}
              onChange={(e) => setBankAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Accounts</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}-{account.number}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
              setPaymentMethodFilter('');
              setInvoiceStatusFilter('');
              setBankAccountFilter('');
              fetchPayments();
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Loading folio payments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Payments Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Invoice</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Room</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Method</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Bank Acc</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Receipt</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {invoiceFilteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-400">
                        No folio payments found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    Object.values(groupedPayments).map(({ invoice, payments: groupPayments }: { invoice: FolioPayment['invoice_documents']; payments: FolioPayment[] }) => (
                      <React.Fragment key={invoice?.id || 'no-invoice'}>
                        {groupPayments.map((payment, index) => (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {index === 0 && invoice ? (
                              <td rowSpan={groupPayments.length} className="px-4 py-3 align-top">
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 font-mono">{invoice.invoice_number}</span>
                                  </div>
                                </div>
                              </td>
                            ) : index === 0 ? (
                              <td rowSpan={groupPayments.length} className="px-4 py-3 align-top">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Unlink size={14} />
                                  <span className="text-xs">No invoice</span>
                                </div>
                              </td>
                            ) : null}
                            <td className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-4 py-3 align-top text-xs font-semibold text-slate-800 dark:text-white">
                              {payment.reservations?.guest_name || 'Walk-in Customer'}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400">
                              {payment.reservations?.room_number || '-'}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold uppercase w-fit ${getMethodBadgeColor(payment.payment_method)}`}>
                                {getPaymentIcon(payment.payment_method)}
                                {payment.payment_method}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400 font-mono">
                              {payment.bank_accounts ? `${payment.bank_accounts.bank_name}-${payment.bank_accounts.account_number}` : '-'}
                            </td>
                            <td className="px-4 py-3 align-top text-sm font-bold text-slate-900 dark:text-white font-mono">
                              {formatAmount(payment.amount)}
                            </td>
                            <td className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                              {payment.reference_number || '-'}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className="text-xs text-slate-400">No receipt</span>
                            </td>
                            {index === 0 && (
                              <>
                                <td rowSpan={groupPayments.length} className="px-4 py-3 align-top">
                                  {invoice ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle size={14} />
                                      <span className="text-xs font-semibold">{invoice.status}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <span className="text-xs">No invoice</span>
                                    </div>
                                  )}
                                </td>
                                <td rowSpan={groupPayments.length} className="px-4 py-3 align-top">
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => {
                                        console.log('Print button clicked, invoice:', invoice);
                                        if (invoice?.id) {
                                          handlePreviewInvoice(invoice.id);
                                        }
                                      }}
                                      disabled={!invoice || invoicePrintLoading}
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                      title="Print Receipt"
                                    >
                                      <Printer size={14} />
                                    </button>
                                    <button className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Void Transaction">
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </motion.tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ModalSystem
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Receipt Preview"
        variant="info"
        size="xl"
        showFooter={false}
      >
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 flex justify-end gap-2">
                <a
                  href={selectedReceipt}
                  download
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
      </ModalSystem>

      {/* Invoice Details Modal */}
      <ModalSystem
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Invoice Details"
        subtitle={selectedInvoice?.invoice_number}
        icon={<FileText size={20} className="text-indigo-600 dark:text-indigo-400" />}
        variant="info"
        size="xl"
        showFooter={false}
      >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">Invoice Type</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{selectedInvoice.invoice_type}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">Status</div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded border inline-block ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">Issue Date</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{new Date(selectedInvoice.issue_date).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">Total Amount</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatAmount(selectedInvoice.total)}</div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-mono uppercase text-indigo-700 dark:text-indigo-400 font-semibold">Invoice Summary</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{formatAmount(selectedInvoice.total)}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{selectedInvoice.status === 'Paid' ? '100%' : '0%'}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Paid</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{selectedInvoice.status === 'Pending' ? formatAmount(selectedInvoice.total) : '0.00'}</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Due</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePreviewInvoice(selectedInvoice.id)}
                  disabled={invoicePrintLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Printer size={16} />
                  {invoicePrintLoading ? 'Loading...' : 'Preview & Print'}
                </button>
              </div>
      </ModalSystem>

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
