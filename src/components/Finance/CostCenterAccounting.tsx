import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  manager?: string;
  budget: number;
  actual_expense: number;
  actual_revenue: number;
  variance: number;
  status: 'active' | 'inactive';
}

interface DepartmentPL {
  department: string;
  revenue: number;
  cost_of_sales: number;
  gross_profit: number;
  operating_expenses: number;
  operating_profit: number;
  net_profit: number;
}

const CostCenterAccounting = () => {
  const [activeTab, setActiveTab] = useState<'centers' | 'departments' | 'profit_centers' | 'analysis'>('centers');
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [departmentPL, setDepartmentPL] = useState<DepartmentPL[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'centers':
        await fetchCostCenters();
        break;
      case 'departments':
        await fetchDepartmentPL();
        break;
    }
    setLoading(false);
  };

  const fetchCostCenters = async () => {
    const { data } = await supabase
      .from('cost_centers')
      .select('*')
      .order('code');
    setCostCenters(data || []);
  };

  const fetchDepartmentPL = async () => {
    const { data } = await supabase
      .from('department_profit_loss')
      .select('*')
      .order('department');
    setDepartmentPL(data || []);
  };

  const tabs = [
    { id: 'centers', label: 'Cost Centers' },
    { id: 'departments', label: 'Department P&L' },
    { id: 'profit_centers', label: 'Profit Centers' },
    { id: 'analysis', label: 'Profitability Analysis' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Cost Center Accounting
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Department expenses, revenue allocation, and profitability analysis
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
          {activeTab === 'centers' && <CostCentersView centers={costCenters} />}
          {activeTab === 'departments' && <DepartmentPLView data={departmentPL} />}
          {activeTab === 'profit_centers' && <ProfitCentersView />}
          {activeTab === 'analysis' && <ProfitabilityAnalysisView />}
        </>
      )}
    </div>
  );
};

const CostCentersView = ({ centers }: { centers: CostCenter[] }) => {
  const totalBudget = centers.reduce((sum, c) => sum + c.budget, 0);
  const totalExpense = centers.reduce((sum, c) => sum + c.actual_expense, 0);
  const totalRevenue = centers.reduce((sum, c) => sum + c.actual_revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalBudget.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Centers</div>
          <div className="text-2xl font-bold text-blue-600">
            {centers.filter(c => c.status === 'active').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actual Expense</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actual Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Variance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {centers.map(center => (
              <tr key={center.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-mono font-medium">{center.code}</td>
                <td className="px-4 py-3 font-medium">{center.name}</td>
                <td className="px-4 py-3">{center.department}</td>
                <td className="px-4 py-3 text-right">${center.budget.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">${center.actual_expense.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">${center.actual_revenue.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-medium ${center.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {center.variance >= 0 ? '+' : ''}${center.variance.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    center.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {center.status}
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

const DepartmentPLView = ({ data }: { data: DepartmentPL[] }) => {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalGrossProfit = data.reduce((sum, d) => sum + d.gross_profit, 0);
  const totalOperatingProfit = data.reduce((sum, d) => sum + d.operating_profit, 0);
  const totalNetProfit = data.reduce((sum, d) => sum + d.net_profit, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Gross Profit</div>
          <div className="text-2xl font-bold text-blue-600">
            ${totalGrossProfit.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Operating Profit</div>
          <div className="text-2xl font-bold text-purple-600">
            ${totalOperatingProfit.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Net Profit</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalNetProfit.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">COGS</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Gross Profit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Op Expenses</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Op Profit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map(dept => (
              <tr key={dept.department} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{dept.department}</td>
                <td className="px-4 py-3 text-right text-green-600">${dept.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">${dept.cost_of_sales.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">${dept.gross_profit.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">${dept.operating_expenses.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">${dept.operating_profit.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-bold ${dept.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${dept.net_profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProfitCentersView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Profit Centers
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure profit centers and allocate revenue and costs
        </div>
      </div>
    </div>
  );
};

const ProfitabilityAnalysisView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Profitability Analysis
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Department profitability metrics and performance analysis
        </div>
      </div>
    </div>
  );
};

export default CostCenterAccounting;
