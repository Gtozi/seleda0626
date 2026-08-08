import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface InventoryValuation {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  valuation_method: 'fifo' | 'lifo' | 'weighted_average';
  last_revalued: string;
}

interface COGSEntry {
  id: string;
  date: string;
  department: string;
  item_category: string;
  quantity_used: number;
  unit_cost: number;
  total_cogs: number;
  reference?: string;
}

const InventoryAccounting = () => {
  const [activeTab, setActiveTab] = useState<'valuation' | 'cogs' | 'adjustments' | 'writeoffs' | 'revaluation'>('valuation');
  const [inventoryValuation, setInventoryValuation] = useState<InventoryValuation[]>([]);
  const [cogsEntries, setCogsEntries] = useState<COGSEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'valuation':
        await fetchInventoryValuation();
        break;
      case 'cogs':
        await fetchCOGSEntries();
        break;
    }
    setLoading(false);
  };

  const fetchInventoryValuation = async () => {
    const { data } = await supabase
      .from('inventory_valuation')
      .select('*')
      .order('total_value', { ascending: false });
    setInventoryValuation(data || []);
  };

  const fetchCOGSEntries = async () => {
    const { data } = await supabase
      .from('cogs_entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    setCogsEntries(data || []);
  };

  const tabs = [
    { id: 'valuation', label: 'Inventory Valuation' },
    { id: 'cogs', label: 'Cost of Goods Sold' },
    { id: 'adjustments', label: 'Inventory Adjustments' },
    { id: 'writeoffs', label: 'Stock Write-offs' },
    { id: 'revaluation', label: 'Stock Revaluation' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Inventory Accounting
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Inventory valuation, COGS tracking, and stock adjustments
        </p>
      </div>

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
          {activeTab === 'valuation' && <InventoryValuationView valuation={inventoryValuation} />}
          {activeTab === 'cogs' && <COGSView entries={cogsEntries} />}
          {activeTab === 'adjustments' && <InventoryAdjustmentsView />}
          {activeTab === 'writeoffs' && <StockWriteoffsView />}
          {activeTab === 'revaluation' && <StockRevaluationView />}
        </>
      )}
    </div>
  );
};

const InventoryValuationView = ({ valuation }: { valuation: InventoryValuation[] }) => {
  const totalValue = valuation.reduce((sum, v) => sum + v.total_value, 0);
  const totalQuantity = valuation.reduce((sum, v) => sum + v.quantity, 0);

  const categoryTotals = valuation.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.total_value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Inventory Value</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-blue-600">
            {totalQuantity.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Categories</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {Object.keys(categoryTotals).length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Value by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(categoryTotals).map(([category, value]) => (
            <div key={category} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{category}</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ${value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Unit Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Valuation Method</th>
            </tr>
          </thead>
          <tbody>
            {valuation.map(item => (
              <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-mono font-medium">{item.item_code}</td>
                <td className="px-4 py-3 font-medium">{item.item_name}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 text-right">{item.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${item.unit_cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold">${item.total_value.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.valuation_method.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const COGSView = ({ entries }: { entries: COGSEntry[] }) => {
  const totalCOGS = entries.reduce((sum, e) => sum + e.total_cogs, 0);
  const departmentTotals = entries.reduce((acc, entry) => {
    acc[entry.department] = (acc[entry.department] || 0) + entry.total_cogs;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total COGS</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalCOGS.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Entries</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {entries.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Departments</div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(departmentTotals).length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Unit Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total COGS</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Reference</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">{entry.department}</td>
                <td className="px-4 py-3">{entry.item_category}</td>
                <td className="px-4 py-3 text-right">{entry.quantity_used.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${entry.unit_cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">${entry.total_cogs.toLocaleString()}</td>
                <td className="px-4 py-3">{entry.reference || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InventoryAdjustmentsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Inventory Adjustments
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Record and track inventory adjustments and revaluations
        </div>
      </div>
    </div>
  );
};

const StockWriteoffsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Stock Write-offs
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Manage stock write-offs and disposals with approval workflows
        </div>
      </div>
    </div>
  );
};

const StockRevaluationView = () => {
  const revaluations = [
    { id: 'REV-001', item: 'Wine Inventory - Premium', category: 'Beverages', oldCost: 85.00, newCost: 92.50, qty: 240, oldTotal: 20400, newTotal: 22200, variance: 1800, date: '2024-06-01', reason: 'Market price adjustment', status: 'Pending' },
    { id: 'REV-002', item: 'Linen Set - King', category: 'Housekeeping', oldCost: 45.00, newCost: 42.00, qty: 180, oldTotal: 8100, newTotal: 7560, variance: -540, date: '2024-05-20', reason: 'Bulk purchase discount', status: 'Approved' },
    { id: 'REV-003', item: 'Food Stock - Dry Goods', category: 'Food', oldCost: 12.50, newCost: 13.75, qty: 850, oldTotal: 10625, newTotal: 11687.50, variance: 1062.50, date: '2024-05-15', reason: 'Supplier price increase', status: 'Approved' },
    { id: 'REV-004', item: 'Cleaning Supplies', category: 'Housekeeping', oldCost: 8.00, newCost: 7.50, qty: 320, oldTotal: 2560, newTotal: 2400, variance: -160, date: '2024-05-10', reason: 'New vendor contract', status: 'Approved' },
  ];

  const totalVariance = revaluations.reduce((s, r) => s + r.variance, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revaluations</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{revaluations.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Net Variance</div>
          <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>${totalVariance.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-amber-600">{revaluations.filter(r => r.status === 'Pending').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Approved</div>
          <div className="text-2xl font-bold text-emerald-600">{revaluations.filter(r => r.status === 'Approved').length}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stock Revaluation History</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ New Revaluation</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Old Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">New Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Variance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {revaluations.map(r => (
              <tr key={r.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 font-medium text-sm">{r.item}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{r.category}</td>
                <td className="px-4 py-3 text-right text-sm">${r.oldCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold">${r.newCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm">{r.qty}</td>
                <td className={`px-4 py-3 text-right text-sm font-bold ${r.variance >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{r.variance >= 0 ? '+' : ''}${r.variance.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.reason}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryAccounting;
