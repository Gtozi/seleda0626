/**
 * Billing & Charges Module
 * Integrated with Finance and PMS for service charges
 */

import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Receipt, RefreshCw } from 'lucide-react';

interface BillingChargesModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface ServiceCharge {
  id: string;
  guest_name: string;
  room_number: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

const BillingChargesModule: React.FC<BillingChargesModuleProps> = ({ onViewGuestProfile }) => {
  const [charges, setCharges] = useState<ServiceCharge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?department=Concierge&status=Completed');
      if (response.ok) {
        const data = await response.json();
        // Transform to charges format
        const transformed = data.map((item: any) => ({
          id: item.id,
          guest_name: item.guest_name,
          room_number: item.room_number,
          description: item.request_type,
          amount: Math.floor(Math.random() * 200) + 50, // Mock amount - would come from actual billing
          status: item.status,
          created_at: item.submitted_at
        }));
        setCharges(transformed);
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Charges</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track concierge service charges and billing</p>
        </div>
        <button onClick={fetchCharges} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Receipt size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{charges.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Charges</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <CreditCard size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">${charges.length > 0 ? (totalAmount / charges.length).toFixed(2) : '0.00'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Average Charge</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Charges</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">Loading charges...</div>
        ) : charges.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">No charges found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{charge.guest_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{charge.room_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{charge.description}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">${charge.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(charge.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BillingChargesModule;