/**
 * Wallet & Payments Module
 * Save payment methods, secure payments, payment history
 */

import { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Smartphone,
  Building,
  Gift
} from 'lucide-react';

interface WalletPaymentsModuleProps {
  guestId?: string;
}

interface PaymentMethod {
  id: string;
  type: 'CreditCard' | 'DebitCard' | 'MobileWallet' | 'BankTransfer' | 'CorporateAccount' | 'GiftCard';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
}

const WalletPaymentsModule: React.FC<WalletPaymentsModuleProps> = ({
  guestId
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'PM-001',
      type: 'CreditCard',
      name: 'Visa ending in 4242',
      lastFour: '4242',
      expiryDate: '12/2027',
      isDefault: true
    },
    {
      id: 'PM-002',
      type: 'MobileWallet',
      name: 'Apple Pay',
      lastFour: '1234',
      isDefault: false
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      amount: 1250.00,
      currency: 'USD',
      date: '2026-08-15',
      description: 'Room Reservation',
      method: 'Visa ending in 4242',
      status: 'Completed'
    },
    {
      id: 'PAY-002',
      amount: 45.00,
      currency: 'USD',
      date: '2026-08-15',
      description: 'Room Service',
      method: 'Apple Pay',
      status: 'Completed'
    }
  ]);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'CreditCard',
    name: '',
    lastFour: '',
    expiryDate: ''
  });

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'CreditCard':
      case 'DebitCard': return <CreditCard size={20} />;
      case 'MobileWallet': return <Smartphone size={20} />;
      case 'BankTransfer': return <Building size={20} />;
      case 'CorporateAccount': return <Building size={20} />;
      case 'GiftCard': return <Gift size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Failed': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400',
      'Refunded': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === paymentMethodId
    })));
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
    }
  };

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `PM-${String(paymentMethods.length + 1).padStart(3, '0')}`,
      type: newPaymentMethod.type as any,
      name: newPaymentMethod.name,
      lastFour: newPaymentMethod.lastFour,
      expiryDate: newPaymentMethod.expiryDate || undefined,
      isDefault: false
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddPaymentModal(false);
    setNewPaymentMethod({ type: 'CreditCard', name: '', lastFour: '', expiryDate: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet & Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your payment methods and view payment history
          </p>
        </div>
        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {getPaymentMethodIcon(method.type)}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{method.name}</div>
                  {method.expiryDate && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">Expires: {method.expiryDate}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {method.isDefault && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 size={16} />
                    <span>Default</span>
                  </div>
                )}
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment History</h3>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{payment.description}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {payment.method} • {new Date(payment.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </div>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">
                  {payment.currency} {payment.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Payment Type
                </label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CreditCard">Credit Card</option>
                  <option value="DebitCard">Debit Card</option>
                  <option value="MobileWallet">Mobile Wallet</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="CorporateAccount">Corporate Account</option>
                  <option value="GiftCard">Gift Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name on Card/Account
                </label>
                <input
                  type="text"
                  value={newPaymentMethod.name}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  value={newPaymentMethod.lastFour}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, lastFour: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {(newPaymentMethod.type === 'CreditCard' || newPaymentMethod.type === 'DebitCard') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethod.expiryDate}
                    onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, expiryDate: e.target.value })}
                    placeholder="MM/YYYY"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Plus size={16} />
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPaymentsModule;
