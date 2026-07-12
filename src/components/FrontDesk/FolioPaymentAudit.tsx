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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';

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
  
  // Receipt preview
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  
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

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
      if (searchTerm) params.append('search', searchTerm);
      
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
  }, [startDate, endDate, paymentMethodFilter]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const filteredPayments = payments.filter(p => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      p.reservations?.guest_name?.toLowerCase().includes(searchLower) ||
      p.reservations?.room_number?.toLowerCase().includes(searchLower) ||
      p.reference_number?.toLowerCase().includes(searchLower) ||
      p.payment_method.toLowerCase().includes(searchLower)
    );
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.is_voided ? 0 : p.amount), 0);

  return (
    <div className="space-y-6 container mx-auto animate-fade-in text-slate-700 dark:text-slate-300">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Folio Payment Audit Trail</h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Historical payment records with receipt attachments
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{formatAmount(totalAmount)}</div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Total Valid Payments
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Filter size={16} />
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Guest name, room, reference..."
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
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
              setPaymentMethodFilter('');
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
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Guest</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Receipt</th>
                  <th className="px-6 py-4 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                        No folio payments found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                          {payment.reservations?.guest_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {payment.reservations?.room_number || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            {getPaymentIcon(payment.payment_method)}
                            <span>{payment.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {formatAmount(payment.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                          {payment.reference_number || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {payment.receipt_url ? (
                            <button
                              onClick={() => setSelectedReceipt(payment.receipt_url)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <ImageIcon size={14} />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">No receipt</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {payment.is_voided ? (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                              <XCircle size={14} />
                              <span className="text-xs font-semibold">Voided</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle size={14} />
                              <span className="text-xs font-semibold">Valid</span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Receipt Preview</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
