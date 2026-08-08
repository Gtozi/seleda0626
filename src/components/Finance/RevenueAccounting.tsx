import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface RevenueEntry {
  id: string;
  date: string;
  source: 'room' | 'f_b' | 'spa' | 'laundry' | 'transport' | 'retail' | 'events' | 'misc';
  amount: number;
  tax_amount: number;
  service_charge: number;
  net_amount: number;
  account_code: string;
  department: string;
  status: 'recognized' | 'deferred' | 'accrued';
  description?: string;
}

interface DeferredRevenue {
  id: string;
  original_amount: number;
  recognized_amount: number;
  remaining_amount: number;
  recognition_start: string;
  recognition_end: string;
  recognition_schedule: any;
}

const RevenueAccounting = () => {
  const [activeTab, setActiveTab] = useState<'recognition' | 'deferred' | 'daily' | 'allocation'>('recognition');
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [deferredRevenue, setDeferredRevenue] = useState<DeferredRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'recognition':
        await fetchRevenueEntries();
        break;
      case 'deferred':
        await fetchDeferredRevenue();
        break;
    }
    setLoading(false);
  };

  const fetchRevenueEntries = async () => {
    const { data } = await supabase
      .from('revenue_entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    setRevenueEntries(data || []);
  };

  const fetchDeferredRevenue = async () => {
    const { data } = await supabase
      .from('deferred_revenue')
      .select('*');
    setDeferredRevenue(data || []);
  };

  const revenueSources = [
    { value: 'room', label: 'Room Revenue', icon: '🏨' },
    { value: 'f_b', label: 'Food & Beverage', icon: '🍽️' },
    { value: 'spa', label: 'Spa', icon: '💆' },
    { value: 'laundry', label: 'Laundry', icon: '🧺' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'retail', label: 'Retail Shop', icon: '🛍️' },
    { value: 'events', label: 'Events', icon: '🎉' },
    { value: 'misc', label: 'Miscellaneous', icon: '📦' },
  ];

  const tabs = [
    { id: 'recognition', label: 'Revenue Recognition' },
    { id: 'deferred', label: 'Deferred Revenue' },
    { id: 'daily', label: 'Daily Posting' },
    { id: 'allocation', label: 'Package Allocation' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Revenue Accounting
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Revenue recognition, deferred revenue management, and package allocation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'recognition' && <RevenueRecognitionView entries={revenueEntries} sources={revenueSources} />}
          {activeTab === 'deferred' && <DeferredRevenueView deferred={deferredRevenue} />}
          {activeTab === 'daily' && <DailyPostingView />}
          {activeTab === 'allocation' && <PackageAllocationView />}
        </>
      )}
    </div>
  );
};

const RevenueRecognitionView = ({ entries, sources }: { entries: RevenueEntry[]; sources: any[] }) => {
  const totalRevenue = entries.reduce((sum, e) => sum + e.net_amount, 0);
  const totalTax = entries.reduce((sum, e) => sum + e.tax_amount, 0);
  const totalServiceCharge = entries.reduce((sum, e) => sum + e.service_charge, 0);

  const sourceTotals = sources.map(source => ({
    ...source,
    total: entries.filter(e => e.source === source.value).reduce((sum, e) => sum + e.net_amount, 0),
  })).filter(s => s.total > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Tax</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalTax.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Service Charge</div>
          <div className="text-2xl font-bold text-blue-600">
            ${totalServiceCharge.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Entries</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {entries.length}
          </div>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Revenue by Source
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sourceTotals.map(source => (
            <div key={source.value} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="text-2xl mb-2">{source.icon}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{source.label}</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ${source.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Entries Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Gross</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Service</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Net</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const source = sources.find(s => s.value === entry.source);
              return (
                <tr key={entry.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span>{source?.icon}</span>
                      {source?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">{entry.department}</td>
                  <td className="px-4 py-3 text-right">${entry.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${entry.tax_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${entry.service_charge.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold">${entry.net_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'recognized' ? 'bg-green-100 text-green-800' :
                      entry.status === 'deferred' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DeferredRevenueView = ({ deferred }: { deferred: DeferredRevenue[] }) => {
  const totalOriginal = deferred.reduce((sum, d) => sum + d.original_amount, 0);
  const totalRecognized = deferred.reduce((sum, d) => sum + d.recognized_amount, 0);
  const totalRemaining = deferred.reduce((sum, d) => sum + d.remaining_amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Original Amount</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalOriginal.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Recognized</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalRecognized.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Remaining</div>
          <div className="text-2xl font-bold text-blue-600">
            ${totalRemaining.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Original</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Recognized</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Remaining</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Recognition Start</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Recognition End</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody>
            {deferred.map(d => {
              const progress = (d.recognized_amount / d.original_amount) * 100;
              return (
                <tr key={d.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium">${d.original_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600">${d.recognized_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-blue-600">${d.remaining_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(d.recognition_start).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(d.recognition_end).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DailyPostingView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Daily Revenue Posting
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure daily revenue posting schedules and automation rules
        </div>
      </div>
    </div>
  );
};

const PackageAllocationView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Package Revenue Allocation
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure how package revenue is allocated across different revenue streams
        </div>
      </div>
    </div>
  );
};

export default RevenueAccounting;
