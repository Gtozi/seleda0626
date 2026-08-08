import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Expense {
  id: string;
  date: string;
  category: 'payroll' | 'utilities' | 'maintenance' | 'marketing' | 'insurance' | 'supplies' | 'food_cost' | 'beverage_cost' | 'laundry_cost' | 'other';
  amount: number;
  tax_amount: number;
  net_amount: number;
  account_code: string;
  department: string;
  cost_center: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  description?: string;
  vendor?: string;
  reference?: string;
}

interface ExpenseClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  amount: number;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submitted_date: string;
  approved_date?: string;
  receipts?: string[];
}

const ExpenseManagement = () => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'claims' | 'approvals' | 'recurring'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'expenses':
        await fetchExpenses();
        break;
      case 'claims':
        await fetchClaims();
        break;
    }
    setLoading(false);
  };

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    setExpenses(data || []);
  };

  const fetchClaims = async () => {
    const { data } = await supabase
      .from('expense_claims')
      .select('*')
      .order('submitted_date', { ascending: false });
    setClaims(data || []);
  };

  const expenseCategories = [
    { value: 'payroll', label: 'Payroll', icon: '💰' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'supplies', label: 'Office Supplies', icon: '📦' },
    { value: 'food_cost', label: 'Food Cost', icon: '🍽️' },
    { value: 'beverage_cost', label: 'Beverage Cost', icon: '🍷' },
    { value: 'laundry_cost', label: 'Laundry Cost', icon: '🧺' },
    { value: 'other', label: 'Other', icon: '📋' },
  ];

  const tabs = [
    { id: 'expenses', label: 'Expense Register' },
    { id: 'claims', label: 'Expense Claims' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'recurring', label: 'Recurring Expenses' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Expense Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track, approve, and manage all organizational expenses
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
          {activeTab === 'expenses' && <ExpenseRegisterView expenses={expenses} categories={expenseCategories} />}
          {activeTab === 'claims' && <ExpenseClaimsView claims={claims} />}
          {activeTab === 'approvals' && <ExpenseApprovalsView />}
          {activeTab === 'recurring' && <RecurringExpensesView />}
        </>
      )}
    </div>
  );
};

const ExpenseRegisterView = ({ expenses, categories }: { expenses: Expense[]; categories: any[] }) => {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.net_amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.net_amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.net_amount, 0);

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.net_amount, 0),
  })).filter(c => c.total > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            ${pendingExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            ${approvedExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Entries</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {expenses.length}
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Expenses by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryTotals.map(cat => (
            <div key={cat.value} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{cat.label}</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ${cat.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => {
              const category = categories.find(c => c.value === expense.category);
              return (
                <tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span>{category?.icon}</span>
                      {category?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">{expense.description || '-'}</td>
                  <td className="px-4 py-3">{expense.department}</td>
                  <td className="px-4 py-3 text-right font-medium">${expense.net_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                      expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      expense.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {expense.status}
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

const ExpenseClaimsView = ({ claims }: { claims: ExpenseClaim[] }) => {
  const pendingClaims = claims.filter(c => c.status === 'pending');
  const totalPending = pendingClaims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Claims</div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingClaims.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Amount</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalPending.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Claims</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {claims.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{claim.employee_name}</td>
                <td className="px-4 py-3">{claim.category}</td>
                <td className="px-4 py-3">{claim.description}</td>
                <td className="px-4 py-3 text-right font-medium">${claim.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(claim.submitted_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    claim.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
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

const ExpenseApprovalsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Expense Approvals
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure approval workflows and spending limits
        </div>
      </div>
    </div>
  );
};

const RecurringExpensesView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Recurring Expenses
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure recurring expense schedules and automation
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
