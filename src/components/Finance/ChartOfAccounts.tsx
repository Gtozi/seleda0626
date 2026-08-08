import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Account {
  id: string;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost_of_sales' | 'operating_expense' | 'other_income' | 'other_expense';
  parent_id: string | null;
  level: number;
  is_active: boolean;
  department_id?: string;
  cost_center_id?: string;
  profit_center_id?: string;
  project_id?: string;
  property_id?: string;
  description?: string;
  children?: Account[];
}

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Error fetching accounts:', error);
    } else {
      const accountTree = buildAccountTree(data || []);
      setAccounts(accountTree);
    }
    setLoading(false);
  };

  const buildAccountTree = (flatAccounts: Account[]): Account[] => {
    const map = new Map<string, Account>();
    const roots: Account[] = [];

    flatAccounts.forEach(account => {
      map.set(account.id, { ...account, children: [] });
    });

    flatAccounts.forEach(account => {
      const node = map.get(account.id)!;
      if (account.parent_id && map.has(account.parent_id)) {
        map.get(account.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesFilter = filter === 'all' || account.account_type === filter;
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const accountTypes = [
    { value: 'asset', label: 'Assets', color: 'bg-blue-100 text-blue-800' },
    { value: 'liability', label: 'Liabilities', color: 'bg-red-100 text-red-800' },
    { value: 'equity', label: 'Equity', color: 'bg-green-100 text-green-800' },
    { value: 'revenue', label: 'Revenue', color: 'bg-purple-100 text-purple-800' },
    { value: 'cost_of_sales', label: 'Cost of Sales', color: 'bg-pink-100 text-pink-800' },
    { value: 'operating_expense', label: 'Operating Expenses', color: 'bg-orange-100 text-orange-800' },
    { value: 'other_income', label: 'Other Income', color: 'bg-teal-100 text-teal-800' },
    { value: 'other_expense', label: 'Other Expenses', color: 'bg-amber-100 text-amber-800' },
    { value: 'expense', label: 'Expenses', color: 'bg-orange-100 text-orange-800' },
  ];

  const renderAccountRow = (account: Account, level: number = 0) => {
    const typeConfig = accountTypes.find(t => t.value === account.account_type);
    const paddingLeft = level * 24;

    return (
      <>
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <td className="px-4 py-3" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
            <span className="font-mono text-sm">{account.code}</span>
          </td>
          <td className="px-4 py-3">
            <div className="font-medium">{account.name}</div>
            {account.description && (
              <div className="text-xs text-slate-500 dark:text-slate-400">{account.description}</div>
            )}
          </td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig?.color}`}>
              {typeConfig?.label}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            {account.department_id || '-'}
          </td>
          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            {account.cost_center_id || '-'}
          </td>
          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            {account.project_id || '-'}
          </td>
          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            {account.property_id || '-'}
          </td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              account.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
            }`}>
              {account.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3">
            <button
              onClick={() => { setSelectedAccount(account); setShowModal(true); }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Edit
            </button>
          </td>
        </tr>
        {account.children?.map(child => renderAccountRow(child, level + 1))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Chart of Accounts
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage the complete account structure for financial reporting
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-2">
            {accountTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter(filter === type.value ? 'all' : type.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === type.value
                    ? type.color
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setSelectedAccount(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            + New Account
          </button>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Cost Center
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Property
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No accounts found
                </td>
              </tr>
            ) : (
              filteredAccounts.map(account => renderAccountRow(account))
            )}
          </tbody>
        </table>
      </div>

      {/* Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {selectedAccount ? 'Edit Account' : 'New Account'}
              </h2>
            </div>
            <div className="p-6">
              <AccountForm
                account={selectedAccount}
                onSave={() => { setShowModal(false); fetchAccounts(); }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AccountForm = ({ account, onSave, onCancel }: { account: Account | null; onSave: () => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    code: account?.code || '',
    name: account?.name || '',
    account_type: account?.account_type || 'asset',
    parent_id: account?.parent_id || '',
    is_active: account?.is_active ?? true,
    department_id: account?.department_id || '',
    cost_center_id: account?.cost_center_id || '',
    profit_center_id: account?.profit_center_id || '',
    project_id: account?.project_id || '',
    property_id: account?.property_id || '',
    description: account?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('chart_of_accounts')
      .upsert({
        ...formData,
        id: account?.id,
        level: account?.level || 1,
      });
    
    if (error) {
      console.error('Error saving account:', error);
    } else {
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Account Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="cost_of_sales">Cost of Sales</option>
            <option value="operating_expense">Operating Expense</option>
            <option value="other_income">Other Income</option>
            <option value="other_expense">Other Expense</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Account Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department
          </label>
          <input
            type="text"
            value={formData.department_id}
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cost Center
          </label>
          <input
            type="text"
            value={formData.cost_center_id}
            onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Profit Center
          </label>
          <input
            type="text"
            value={formData.profit_center_id}
            onChange={(e) => setFormData({ ...formData, profit_center_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project
          </label>
          <input
            type="text"
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Property
          </label>
          <input
            type="text"
            value={formData.property_id}
            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
          Active
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Account
        </button>
      </div>
    </form>
  );
};

export default ChartOfAccounts;
