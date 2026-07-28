/**
 * Shared helpers for rendering POS shift journal payment details.
 * Provides split-payment badges, method/bank summaries, and CSV export helpers.
 */

import React from 'react';
import {
  Coins,
  CreditCard,
  Smartphone,
  Landmark,
  Building,
  Receipt,
  Banknote,
  Printer,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Trash2,
  Funnel,
  Search
} from 'lucide-react';
import { SplitPayment } from '../../types/finance';

export interface EnrichedSplit extends SplitPayment {
  bankAccountName?: string;
}

export function getPaymentMethodColor(method?: string): string {
  const m = (method || '').toLowerCase();
  if (m === 'cash' || m.includes('cash')) {
    return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
  }
  if (m.includes('card')) {
    return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
  }
  if (m.includes('mobile') || m.includes('telebirr') || m.includes('wallet')) {
    return 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50';
  }
  if (m.includes('transfer') || m.includes('bank')) {
    return 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
  }
  if (m.includes('room')) {
    return 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

export function getPaymentMethodSummaryBg(method?: string): string {
  const m = (method || '').toLowerCase();
  if (m === 'cash' || m.includes('cash')) return 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40';
  if (m.includes('card')) return 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40';
  if (m.includes('mobile') || m.includes('telebirr') || m.includes('wallet')) return 'bg-sky-50/50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40';
  if (m.includes('transfer') || m.includes('bank')) return 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40';
  if (m.includes('room')) return 'bg-violet-50/50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/40';
  return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
}

export function getPaymentMethodIcon(method?: string, size = 12) {
  const m = (method || '').toLowerCase();
  if (m === 'cash' || m.includes('cash')) return <Coins size={size} />;
  if (m.includes('card')) return <CreditCard size={size} />;
  if (m.includes('mobile') || m.includes('telebirr') || m.includes('wallet')) return <Smartphone size={size} />;
  if (m.includes('transfer')) return <Landmark size={size} />;
  if (m.includes('bank')) return <Building size={size} />;
  if (m.includes('room')) return <Banknote size={size} />;
  return <Receipt size={size} />;
}

export function enrichSplitPayments(
  splits: SplitPayment[] | undefined,
  bankAccounts: any[]
): EnrichedSplit[] {
  if (!splits || splits.length === 0) return [];
  return splits.map((split) => {
    const account = split.bankAccountId
      ? bankAccounts.find((a: any) => a.id === split.bankAccountId)
      : undefined;
    return {
      ...split,
      bankAccountName: account
        ? `${account.bank_name || account.account_name || account.name || account.bankName || 'Bank'}-${account.accountNumber || account.account_number || ''}`
        : split.bankAccountName
    };
  });
}

export function buildPaymentCSVHeader(): string[] {
  return [
    'Invoice',
    'Date',
    'Guest',
    'Items',
    'Method',
    'BankAccount',
    'Amount',
    'Reference',
    'Receipt',
    'Status'
  ];
}

export function formatTransactionRowsForCSV(
  tx: {
    invoiceNumber: string;
    date: string;
    customerName?: string;
    clientName?: string;
    items?: { productName: string; quantity: number; price: number }[];
    total: number;
    paymentMethod?: string;
    splitPayments?: SplitPayment[];
    status?: string;
    receiptUrl?: string;
  }
): string[][] {
  const itemsLabel = (tx.items || []).map(i => `${i.productName} (x${i.quantity})`).join('; ');
  const splits = tx.splitPayments && tx.splitPayments.length > 0 ? tx.splitPayments : undefined;
  const base = [
    tx.invoiceNumber,
    tx.date,
    tx.customerName || tx.clientName || 'N/A',
    itemsLabel
  ];
  const receipt = tx.receiptUrl ? 'Yes' : 'No';
  const status = tx.status || 'Completed';
  if (!splits) {
    return [[...base, tx.paymentMethod || 'N/A', '', String(tx.total), '', receipt, status]];
  }
  return splits.map((split) => [
    ...base,
    split.method,
    split.bankAccountName || split.bankAccountId || '',
    String(split.amount),
    split.reference || '',
    receipt,
    status
  ]);
}

export interface PaymentAuditTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  items: { productName: string; quantity: number; price: number }[];
  paymentMethod?: string;
  splitPayments?: SplitPayment[];
  status?: string;
  receiptUrl?: string;
  total: number;
  subtotal?: number;
  tax?: number;
}

export interface PaymentSplitsCellProps {
  splitPayments?: SplitPayment[];
  paymentMethod?: string;
  total: number;
  bankAccounts?: any[];
  formatAmount: (amount: number) => string;
}

export function PaymentSplitsCell({
  splitPayments,
  paymentMethod,
  total,
  bankAccounts = [],
  formatAmount
}: PaymentSplitsCellProps) {
  const splits = enrichSplitPayments(splitPayments, bankAccounts);

  if (splits.length > 1) {
    return (
      <div className="flex flex-col gap-1.5">
        {splits.map((split, idx) => (
          <div
            key={idx}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase w-fit ${getPaymentMethodColor(split.method)}`}
            title={split.bankAccountName ? `Account: ${split.bankAccountName}` : undefined}
          >
            {getPaymentMethodIcon(split.method, 10)}
            <span>{split.method}</span>
            <span className="opacity-80">{formatAmount(split.amount)}</span>
            {split.reference && (
              <span className="text-[9px] font-normal opacity-70">Ref: {split.reference}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  const method = splits[0]?.method || paymentMethod || 'N/A';
  const reference = splits[0]?.reference;
  const account = splits[0]?.bankAccountName;
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase w-fit ${getPaymentMethodColor(method)}`}
        title={account ? `Account: ${account}` : undefined}
      >
        {getPaymentMethodIcon(method, 10)}
        {method}
      </span>
      {reference && (
        <span className="text-[9px] text-slate-500 font-mono">Ref: {reference}</span>
      )}
      {account && (
        <span className="text-[9px] text-slate-500 font-mono truncate max-w-[180px]" title={account}>
          {account}
        </span>
      )}
    </div>
  );
}

export interface PaymentMethodSummaryProps {
  transactions: {
    total: number;
    paymentMethod?: string;
    splitPayments?: SplitPayment[];
  }[];
  bankAccounts?: any[];
  formatAmount: (amount: number) => string;
}

export function PaymentMethodSummary({ transactions, bankAccounts = [], formatAmount }: PaymentMethodSummaryProps) {
  const summary = React.useMemo(() => {
    const map: Record<string, { method: string; amount: number; count: number }> = {};
    transactions.forEach((tx) => {
      const splits = tx.splitPayments && tx.splitPayments.length > 0
        ? enrichSplitPayments(tx.splitPayments, bankAccounts)
        : [{ method: tx.paymentMethod || 'Unknown', amount: tx.total }];
      splits.forEach((split) => {
        if (!map[split.method]) {
          map[split.method] = { method: split.method, amount: 0, count: 0 };
        }
        map[split.method].amount += split.amount;
        map[split.method].count += 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount);
  }, [transactions, bankAccounts]);

  if (summary.length === 0) return null;

  const total = summary.reduce((sum, [, { amount }]) => sum + amount, 0);

  return (
    <div className="space-y-2">
      <h5 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Payment Method Summary</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map(([method, data]) => (
          <div
            key={method}
            className={`rounded-xl border p-3 ${getPaymentMethodSummaryBg(data.method)}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={getPaymentMethodColor(data.method)}>{getPaymentMethodIcon(data.method, 14)}</span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate">
                {data.method}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {formatAmount(data.amount)}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              {data.count} transaction{data.count !== 1 ? 's' : ''}
              {total > 0 && ` • ${((data.amount / total) * 100).toFixed(0)}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface BankAccountSummaryProps {
  transactions: {
    total: number;
    paymentMethod?: string;
    splitPayments?: SplitPayment[];
  }[];
  bankAccounts?: any[];
  formatAmount: (amount: number) => string;
}

export function BankAccountSummary({ transactions, bankAccounts = [], formatAmount }: BankAccountSummaryProps) {
  const summary = React.useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    transactions.forEach((tx) => {
      const splits = tx.splitPayments && tx.splitPayments.length > 0
        ? enrichSplitPayments(tx.splitPayments, bankAccounts)
        : undefined;
      if (!splits) return;
      splits.forEach((split) => {
        const account = split.bankAccountName || split.bankAccountId || 'Unspecified';
        if (!map[account]) {
          map[account] = { label: account, amount: 0, count: 0 };
        }
        map[account].amount += split.amount;
        map[account].count += 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount);
  }, [transactions, bankAccounts]);

  if (summary.length === 0) return null;

  const total = summary.reduce((sum, [, { amount }]) => sum + amount, 0);

  return (
    <div className="space-y-2">
      <h5 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Bank Account Summary</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map(([key, data]) => (
          <div
            key={key}
            className="rounded-xl border p-3 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-indigo-600 dark:text-indigo-400"><Building size={14} /></span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 truncate" title={data.label}>
                {data.label.split(' • ')[0] || data.label}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {formatAmount(data.amount)}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              {data.count} payment{data.count !== 1 ? 's' : ''}
              {total > 0 && ` • ${((data.amount / total) * 100).toFixed(0)}%`}
            </div>
            {data.label.includes(' • ') && (
              <div className="text-[9px] text-slate-500 font-mono truncate mt-1" title={data.label.split(' • ')[1]}>
                {data.label.split(' • ')[1]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface POSPaymentAuditTableProps {
  transactions: PaymentAuditTransaction[];
  bankAccounts?: any[];
  formatAmount: (amount: number) => string;
  onViewReceipt?: (tx: PaymentAuditTransaction) => void;
  onPrintInvoice?: (tx: PaymentAuditTransaction) => void;
  onVoidTransaction?: (tx: PaymentAuditTransaction) => void;
  emptyMessage?: string;
}

export function POSPaymentAuditTable({
  transactions,
  bankAccounts = [],
  formatAmount,
  onViewReceipt,
  onPrintInvoice,
  onVoidTransaction,
  emptyMessage = 'No settled transactions found.'
}: POSPaymentAuditTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [bankAccount, setBankAccount] = React.useState('');

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter (item names)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const itemsMatch = (tx.items || []).some(item =>
          item.productName.toLowerCase().includes(searchLower)
        );
        const invoiceMatch = tx.invoiceNumber.toLowerCase().includes(searchLower);
        if (!itemsMatch && !invoiceMatch) return false;
      }

      // Date range filter
      if (startDate) {
        const txDate = new Date(tx.date);
        const start = new Date(startDate);
        if (txDate < start) return false;
      }
      if (endDate) {
        const txDate = new Date(tx.date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (txDate > end) return false;
      }

      // Payment method filter
      if (paymentMethod) {
        const splits = tx.splitPayments && tx.splitPayments.length > 0
          ? tx.splitPayments
          : [{ method: tx.paymentMethod }];
        const methodMatch = splits.some(s => s.method === paymentMethod);
        if (!methodMatch) return false;
      }

      // Bank account filter
      if (bankAccount) {
        const splits = tx.splitPayments && tx.splitPayments.length > 0
          ? tx.splitPayments
          : [];
        const bankMatch = splits.some(s => s.bankAccountId === bankAccount);
        if (!bankMatch) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, startDate, endDate, paymentMethod, bankAccount]);

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPaymentMethod('');
    setBankAccount('');
  };

  const grouped = React.useMemo(() => {
    const map: Record<string, PaymentAuditTransaction[]> = {};
    filteredTransactions.forEach((tx) => {
      if (!map[tx.invoiceNumber]) map[tx.invoiceNumber] = [];
      map[tx.invoiceNumber].push(tx);
    });
    return Object.entries(map).sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime());
  }, [filteredTransactions]);

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Completed';
    if (s === 'Voided') {
      return (
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
          <XCircle size={14} />
          <span className="text-xs font-semibold">{s}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
        <CheckCircle size={14} />
        <span className="text-xs font-semibold">{s}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Funnel size={16} />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Search</label>
            <div className="flex gap-2">
              <input
                placeholder="Item name, invoice, reference..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Search size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Start Date</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">End Date</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Payment Method</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Voucher">Voucher</option>
              <option value="Corporate Bill">Corporate Bill</option>
              <option value="Company Ledger">Company Ledger</option>
              <option value="Room Charge">Room Charge</option>
              <option value="Complimentary">Complimentary</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">Bank Account</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            >
              <option value="">All Accounts</option>
              {bankAccounts.filter((acc: any) => acc.is_active).map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank_name || acc.account_name || acc.name || 'Bank'}-{acc.account_number}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Invoice</th>
            <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Guest</th>
            <th className="px-4 py-3 text-left text-[10px] font-mono uppercase text-slate-500 font-semibold">Item</th>
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            grouped.map(([invoiceNumber, invoiceTxs]) => (
              <React.Fragment key={invoiceNumber}>
                {invoiceTxs.map((tx, txIndex) => {
                  const splits = enrichSplitPayments(tx.splitPayments, bankAccounts);
                  const paymentRows = splits.length > 0 ? splits : [
                    { method: tx.paymentMethod || 'N/A', amount: tx.total, reference: undefined, bankAccountName: undefined, bankAccountId: undefined }
                  ];
                  const txRowSpan = splits.length > 0 ? splits.length : 1;
                  return paymentRows.map((split, splitIndex) => {
                    const isFirstRow = txIndex === 0 && splitIndex === 0;
                    const isFirstPaymentOfTx = splitIndex === 0;
                    const rowSpan = invoiceTxs.reduce((acc, t) => {
                      const s = enrichSplitPayments(t.splitPayments, bankAccounts);
                      return acc + (s.length > 0 ? s.length : 1);
                    }, 0);
                    return (
                      <tr key={`${tx.id}-${splitIndex}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        {isFirstRow && (
                          <td rowSpan={rowSpan} className="px-4 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 font-mono">
                                  {tx.invoiceNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                        )}
                        {isFirstPaymentOfTx && (
                          <>
                            <td rowSpan={txRowSpan} className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                              {formatDate(tx.date)}
                            </td>
                            <td rowSpan={txRowSpan} className="px-4 py-3 align-top text-xs font-semibold text-slate-800 dark:text-white">
                              {tx.customerName}
                            </td>
                            <td rowSpan={txRowSpan} className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400">
                              <span className="block truncate max-w-[180px]" title={(tx.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ')}>
                                {(tx.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold uppercase w-fit ${getPaymentMethodColor(split.method)}`}>
                            {getPaymentMethodIcon(split.method, 10)}
                            {split.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {split.bankAccountName || split.bankAccountId || '-'}
                        </td>
                        <td className="px-4 py-3 align-top text-sm font-bold text-slate-900 dark:text-white font-mono">
                          {formatAmount(split.amount)}
                        </td>
                        <td className="px-4 py-3 align-top text-xs font-mono text-slate-600 dark:text-slate-400">
                          {split.reference || '-'}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {tx.receiptUrl ? (
                            <button
                              onClick={() => onViewReceipt?.(tx)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-[10px] font-semibold transition-colors"
                            >
                              <ImageIcon size={12} />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">No receipt</span>
                          )}
                        </td>
                        {isFirstPaymentOfTx && (
                          <td rowSpan={txRowSpan} className="px-4 py-3 align-top">
                            {getStatusBadge(tx.status)}
                          </td>
                        )}
                        {isFirstPaymentOfTx && (
                          <td rowSpan={txRowSpan} className="px-4 py-3 align-top">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onPrintInvoice?.(tx)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                title="Print Receipt"
                              >
                                <Printer size={14} />
                              </button>
                              {onVoidTransaction && (
                                <button
                                  onClick={() => onVoidTransaction(tx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                  title="Void Transaction"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
