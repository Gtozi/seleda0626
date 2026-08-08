import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: 'open' | 'closed';
}

interface AccountingPeriod {
  id: string;
  fiscal_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_base: boolean;
  exchange_rate: number;
}

const FinanceConfiguration = () => {
  const [activeTab, setActiveTab] = useState<'fiscal' | 'periods' | 'coa' | 'tax' | 'approval' | 'posting_rules' | 'exchange_rates' | 'journal_types' | 'posting_profiles'>('fiscal');
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<AccountingPeriod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'fiscal':
        await fetchFiscalYears();
        break;
      case 'periods':
        await fetchAccountingPeriods();
        break;
      case 'tax':
        await fetchCurrencies();
        break;
    }
    setLoading(false);
  };

  const fetchFiscalYears = async () => {
    const { data } = await supabase
      .from('fiscal_years')
      .select('*')
      .order('start_date', { ascending: false });
    setFiscalYears(data || []);
  };

  const fetchAccountingPeriods = async () => {
    const { data } = await supabase
      .from('accounting_periods')
      .select('*')
      .order('start_date', { ascending: false });
    setAccountingPeriods(data || []);
  };

  const fetchCurrencies = async () => {
    const { data } = await supabase
      .from('currencies')
      .select('*');
    setCurrencies(data || []);
  };

  const tabs = [
    { id: 'fiscal', label: 'Fiscal Years' },
    { id: 'periods', label: 'Accounting Periods' },
    { id: 'coa', label: 'Chart of Accounts' },
    { id: 'tax', label: 'Tax Setup' },
    { id: 'approval', label: 'Approval Setup' },
    { id: 'posting_rules', label: 'Posting Rules' },
    { id: 'exchange_rates', label: 'Exchange Rates' },
    { id: 'journal_types', label: 'Journal Types' },
    { id: 'posting_profiles', label: 'Posting Profiles' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Finance Configuration
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Fiscal years, accounting periods, tax codes, and system settings
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
          {activeTab === 'fiscal' && <FiscalYearsView years={fiscalYears} />}
          {activeTab === 'periods' && <AccountingPeriodsView periods={accountingPeriods} />}
          {activeTab === 'coa' && <ChartOfAccountsSetupView />}
          {activeTab === 'tax' && <TaxSetupView currencies={currencies} />}
          {activeTab === 'approval' && <ApprovalSetupView />}
          {activeTab === 'posting_rules' && <PostingRulesView />}
          {activeTab === 'exchange_rates' && <ExchangeRatesView currencies={currencies} />}
          {activeTab === 'journal_types' && <JournalTypesView />}
          {activeTab === 'posting_profiles' && <PostingProfilesView />}
        </>
      )}
    </div>
  );
};

const FiscalYearsView = ({ years }: { years: FiscalYear[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Fiscal Years
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          + New Fiscal Year
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">End Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Current</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.map(year => (
              <tr key={year.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{year.name}</td>
                <td className="px-4 py-3">{new Date(year.start_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(year.end_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    year.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {year.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {year.is_current && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AccountingPeriodsView = ({ periods }: { periods: AccountingPeriod[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Accounting Periods
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          + New Period
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Period Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">End Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{period.name}</td>
                <td className="px-4 py-3">{new Date(period.start_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(period.end_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    period.is_closed ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {period.is_closed ? 'Closed' : 'Open'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    {period.is_closed ? 'Reopen' : 'Close'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChartOfAccountsSetupView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Chart of Accounts Setup
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure account structure, journal types, and posting profiles
        </div>
      </div>
    </div>
  );
};

const TaxSetupView = ({ currencies }: { currencies: Currency[] }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Tax Codes
            </h3>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">+ Add Code</button>
          </div>
          <div className="space-y-3">
            {[
              { code: 'VAT', name: 'Value Added Tax', rate: '15%' },
              { code: 'WHT', name: 'Withholding Tax', rate: '2%' },
              { code: 'TL', name: 'Tourism Levy', rate: '3%' },
              { code: 'SC', name: 'Service Charge', rate: '10%' },
              { code: 'PAYE', name: 'PAYE', rate: '15%' },
            ].map(tax => (
              <div key={tax.code} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{tax.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{tax.code}</div>
                </div>
                <div className="text-lg font-bold text-blue-600">{tax.rate}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Tax Rates
            </h3>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">+ Add Rate</button>
          </div>
          <div className="space-y-3">
            {[
              { code: 'VAT-STD', name: 'VAT Standard', rate: 15, effective: '2024-01-01' },
              { code: 'VAT-ZERO', name: 'VAT Zero Rated', rate: 0, effective: '2024-01-01' },
              { code: 'WHT-SRV', name: 'WHT Services', rate: 2, effective: '2024-01-01' },
              { code: 'WHT-CON', name: 'WHT Contracts', rate: 3, effective: '2024-01-01' },
              { code: 'TL-STD', name: 'Tourism Levy', rate: 3, effective: '2024-01-01' },
            ].map(rate => (
              <div key={rate.code} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{rate.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{rate.code} • Effective: {rate.effective}</div>
                </div>
                <div className="text-lg font-bold text-emerald-600">{rate.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Jurisdictions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Tax Jurisdictions
          </h3>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">+ Add Jurisdiction</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Jurisdiction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tax Authority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Filing Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Registration #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { jurisdiction: 'Federal', type: 'National', authority: 'Ethiopian Revenue Authority', frequency: 'Monthly', reg: 'ERA-12345', status: 'Active' },
                { jurisdiction: 'Addis Ababa', type: 'Regional', authority: 'Addis Ababa Revenue Authority', frequency: 'Monthly', reg: 'AARA-67890', status: 'Active' },
                { jurisdiction: 'Tigray', type: 'Regional', authority: 'Tigray Revenue Authority', frequency: 'Quarterly', reg: 'TRA-11223', status: 'Active' },
              ].map((j, i) => (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{j.jurisdiction}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{j.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{j.authority}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{j.frequency}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{j.reg}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{j.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Currency Setup
        </h3>
        <div className="space-y-3">
          {currencies.length === 0 ? (
            [
              { symbol: 'Br', name: 'Ethiopian Birr', code: 'ETB', rate: 1, isBase: true },
              { symbol: '$', name: 'US Dollar', code: 'USD', rate: 57.5, isBase: false },
              { symbol: '€', name: 'Euro', code: 'EUR', rate: 62.3, isBase: false },
            ].map((c, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.symbol}</span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{c.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.isBase && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Base
                    </span>
                  )}
                  <div className="text-sm font-medium">{c.rate.toFixed(2)}</div>
                </div>
              </div>
            ))
          ) : (
            currencies.map(currency => (
              <div key={currency.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currency.symbol}</span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{currency.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{currency.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currency.is_base && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Base
                    </span>
                  )}
                  <div className="text-sm font-medium">{currency.exchange_rate.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ApprovalSetupView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Approval Setup
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure approval levels, delegation rules, and spending limits
        </div>
      </div>
    </div>
  );
};

const PostingRulesView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Posting Rules</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ New Rule</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Rule Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Auto-post Revenue', module: 'Revenue', condition: 'Amount < $1,000', action: 'Auto-post to GL', status: 'Active' },
              { name: 'Require Dual Approval', module: 'AP', condition: 'Amount > $10,000', action: 'Route to Controller', status: 'Active' },
              { name: 'Block Unbalanced JE', module: 'GL', condition: 'Debits != Credits', action: 'Block posting', status: 'Active' },
              { name: 'Auto-reverse Accruals', module: 'GL', condition: 'Entry type = Accrual', action: 'Reverse on period open', status: 'Active' },
              { name: 'Enforce Period Lock', module: 'GL', condition: 'Period = Closed', action: 'Block all postings', status: 'Active' },
            ].map((rule, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{rule.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rule.module}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rule.condition}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rule.action}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{rule.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExchangeRatesView = ({ currencies }: { currencies: Currency[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Exchange Rates</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ New Rate</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Currency</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Rate vs Base</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Last Updated</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.length === 0 ? (
              [
                { name: 'Ethiopian Birr', code: 'ETB', rate: '1.0000', updated: 'Base Currency' },
                { name: 'US Dollar', code: 'USD', rate: '57.50', updated: '2024-06-03' },
                { name: 'Euro', code: 'EUR', rate: '62.30', updated: '2024-06-03' },
                { name: 'British Pound', code: 'GBP', rate: '73.10', updated: '2024-06-03' },
              ].map((c, i) => (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.code}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{c.rate}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.updated}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Update</button>
                  </td>
                </tr>
              ))
            ) : (
              currencies.map(c => (
                <tr key={c.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.code}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{c.exchange_rate.toFixed(4)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.is_base ? 'Base Currency' : 'Recently'}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Update</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const JournalTypesView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Journal Types</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ New Type</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { code: 'JE', name: 'Standard Journal Entry', desc: 'General purpose manual journal entry', color: 'bg-blue-50 text-blue-700' },
          { code: 'REV', name: 'Reversing Entry', desc: 'Auto-reverses in next period', color: 'bg-purple-50 text-purple-700' },
          { code: 'ACC', name: 'Accrual Entry', desc: 'Records expenses before invoice', color: 'bg-amber-50 text-amber-700' },
          { code: 'DEF', name: 'Deferral Entry', desc: 'Defers revenue to future periods', color: 'bg-emerald-50 text-emerald-700' },
          { code: 'REVAL', name: 'Revaluation Entry', desc: 'FX revaluation of foreign currency', color: 'bg-rose-50 text-rose-700' },
          { code: 'DEP', name: 'Depreciation Entry', desc: 'Auto-generated from Fixed Assets', color: 'bg-indigo-50 text-indigo-700' },
          { code: 'ALLOC', name: 'Allocation Entry', desc: 'Cost center allocations', color: 'bg-teal-50 text-teal-700' },
          { code: 'IC', name: 'Intercompany Entry', desc: 'Cross-entity transactions', color: 'bg-orange-50 text-orange-700' },
          { code: 'CLOSE', name: 'Closing Entry', desc: 'Period-end closing entries', color: 'bg-slate-100 text-slate-700' },
        ].map(jt => (
          <div key={jt.code} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${jt.color}`}>{jt.code}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{jt.name}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{jt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PostingProfilesView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Posting Profiles</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ New Profile</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Profile Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Debit Account</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Credit Account</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Room Revenue Posting', module: 'Front Office', debit: '1100 - AR', credit: '4000 - Room Revenue', status: 'Active' },
              { name: 'F&B Revenue Posting', module: 'F&B', debit: '1100 - AR', credit: '4100 - F&B Revenue', status: 'Active' },
              { name: 'Vendor Invoice Posting', module: 'AP', debit: '5000 - Expense', credit: '2000 - AP', status: 'Active' },
              { name: 'Payment Posting', module: 'AR', debit: '1000 - Cash', credit: '1100 - AR', status: 'Active' },
              { name: 'Payroll Posting', module: 'HR', debit: '5100 - Salaries', credit: '2100 - Accrued Payroll', status: 'Active' },
              { name: 'Depreciation Posting', module: 'Fixed Assets', debit: '5200 - Depreciation', credit: '1500 - Accum. Dep.', status: 'Active' },
            ].map((p, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.module}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{p.debit}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{p.credit}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceConfiguration;
