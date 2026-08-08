/**
 * Billing & Payments Module
 * Manages spa billing, payments, revenue tracking, and financial transactions
 */

import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Receipt,
  AlertTriangle,
  Download
} from 'lucide-react';

interface BillingPaymentsModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onViewAppointment?: (appointmentId: string) => void;
}

interface Transaction {
  id: string;
  guestName: string;
  guestId: string;
  appointmentId?: string;
  description: string;
  amount: number;
  tax: number;
  serviceCharge: number;
  tip: number;
  total: number;
  paymentMethod: 'Guest Folio' | 'Credit/Debit Card' | 'Mobile Wallet' | 'Cash' | 'Corporate Billing' | 'Gift Voucher' | 'Membership Credit';
  status: 'Pending' | 'Completed' | 'Refunded' | 'Failed';
  date: string;
  roomNumber?: string;
}

const BillingPaymentsModule: React.FC<BillingPaymentsModuleProps> = ({
  onViewGuestProfile,
  onViewAppointment
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      guestName: 'Sarah Johnson',
      guestId: 'GST-001',
      appointmentId: 'APT-001',
      description: 'Swedish Massage (60 min)',
      amount: 120,
      tax: 10.80,
      serviceCharge: 12,
      tip: 20,
      total: 162.80,
      paymentMethod: 'Credit/Debit Card',
      status: 'Completed',
      date: '2026-07-31',
      roomNumber: '305'
    },
    {
      id: 'TXN-002',
      guestName: 'Michael Williams',
      guestId: 'GST-002',
      appointmentId: 'APT-002',
      description: 'Deep Tissue Massage (90 min)',
      amount: 150,
      tax: 13.50,
      serviceCharge: 15,
      tip: 25,
      total: 203.50,
      paymentMethod: 'Guest Folio',
      status: 'Completed',
      date: '2026-07-31',
      roomNumber: '212'
    },
    {
      id: 'TXN-003',
      guestName: 'Emma Davis',
      guestId: 'GST-003',
      appointmentId: 'APT-003',
      description: 'Hydrating Facial (45 min)',
      amount: 95,
      tax: 8.55,
      serviceCharge: 9.50,
      tip: 15,
      total: 128.05,
      paymentMethod: 'Mobile Wallet',
      status: 'Completed',
      date: '2026-07-31',
      roomNumber: '118'
    },
    {
      id: 'TXN-004',
      guestName: 'James Brown',
      guestId: 'GST-004',
      description: 'Couples Retreat Package',
      amount: 350,
      tax: 31.50,
      serviceCharge: 35,
      tip: 50,
      total: 466.50,
      paymentMethod: 'Gift Voucher',
      status: 'Pending',
      date: '2026-07-31',
      roomNumber: '407'
    },
    {
      id: 'TXN-005',
      guestName: 'Olivia Wilson',
      guestId: 'GST-005',
      description: 'Retail Purchase - Lavender Oil',
      amount: 45,
      tax: 4.05,
      serviceCharge: 0,
      tip: 0,
      total: 49.05,
      paymentMethod: 'Credit/Debit Card',
      status: 'Completed',
      date: '2026-07-30'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('All');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

  const paymentMethods = ['All', 'Guest Folio', 'Credit/Debit Card', 'Mobile Wallet', 'Cash', 'Corporate Billing', 'Gift Voucher', 'Membership Credit'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Refunded':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      'Guest Folio': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Credit/Debit Card': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Mobile Wallet': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
      'Cash': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Corporate Billing': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
      'Gift Voucher': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Membership Credit': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400'
    };
    return colors[method as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'All' || transaction.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const handleStatusChange = (transactionId: string, newStatus: Transaction['status']) => {
    setTransactions(transactions.map(transaction =>
      transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
    ));
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.total, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spa billing, payments, and financial transactions
          </p>
        </div>
        <button
          onClick={() => setShowNewTransactionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${pendingAmount.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Receipt size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Transactions Today</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{transactions.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{transaction.id}</div>
                  {transaction.roomNumber && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">Room {transaction.roomNumber}</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewGuestProfile?.(transaction.guestId)}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {transaction.guestName}
                  </button>
                  {transaction.appointmentId && (
                    <button
                      onClick={() => onViewAppointment?.(transaction.appointmentId)}
                      className="block text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {transaction.appointmentId}
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 text-slate-900 dark:text-white">
                  {transaction.description}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                    {transaction.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <select
                    value={transaction.status}
                    onChange={(e) => handleStatusChange(transaction.id, e.target.value as Transaction['status'])}
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">
                  ${transaction.total.toFixed(2)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Receipt size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Download size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Transaction Modal Placeholder */}
      {showNewTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Transaction</h2>
              <button
                onClick={() => setShowNewTransactionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Transaction creation form would be implemented here with guest selection, service details, payment method, and amount configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTransactionModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPaymentsModule;