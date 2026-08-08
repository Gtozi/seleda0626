import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface CashForecast {
  id: string;
  period: string;
  opening_balance: number;
  inflows: number;
  outflows: number;
  net_cash_flow: number;
  closing_balance: number;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  maturity_date: string;
  interest_rate: number;
  status: 'active' | 'matured' | 'redeemed';
}

interface Loan {
  id: string;
  lender: string;
  principal: number;
  interest_rate: number;
  outstanding_balance: number;
  next_payment_date: string;
  monthly_payment: number;
  status: 'active' | 'paid' | 'defaulted';
}

const TreasuryManagement = () => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'investments' | 'loans' | 'fx' | 'liquidity' | 'cash_pooling'>('forecast');
  const [forecasts, setForecasts] = useState<CashForecast[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'forecast':
        await fetchCashForecasts();
        break;
      case 'investments':
        await fetchInvestments();
        break;
      case 'loans':
        await fetchLoans();
        break;
    }
    setLoading(false);
  };

  const fetchCashForecasts = async () => {
    const { data } = await supabase
      .from('cash_forecasts')
      .select('*')
      .order('period');
    setForecasts(data || []);
  };

  const fetchInvestments = async () => {
    const { data } = await supabase
      .from('investments')
      .select('*')
      .order('maturity_date');
    setInvestments(data || []);
  };

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*')
      .order('next_payment_date');
    setLoans(data || []);
  };

  const tabs = [
    { id: 'forecast', label: 'Cash Forecast', icon: '📊' },
    { id: 'liquidity', label: 'Liquidity Planning', icon: '💧' },
    { id: 'cash_pooling', label: 'Cash Pooling', icon: '🔄' },
    { id: 'investments', label: 'Investments', icon: '💰' },
    { id: 'loans', label: 'Loan Management', icon: '🏦' },
    { id: 'fx', label: 'Foreign Exchange', icon: '🌐' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Treasury Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Cash forecasting, liquidity planning, investment tracking, and loan management
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
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
          {activeTab === 'forecast' && <CashForecastView forecasts={forecasts} />}
          {activeTab === 'liquidity' && <LiquidityPlanningView />}
          {activeTab === 'cash_pooling' && <CashPoolingView />}
          {activeTab === 'investments' && <InvestmentsView investments={investments} />}
          {activeTab === 'loans' && <LoansView loans={loans} />}
          {activeTab === 'fx' && <ForeignExchangeView />}
        </>
      )}
    </div>
  );
};

const CashForecastView = ({ forecasts }: { forecasts: CashForecast[] }) => {
  const totalInflows = forecasts.reduce((sum, f) => sum + f.inflows, 0);
  const totalOutflows = forecasts.reduce((sum, f) => sum + f.outflows, 0);
  const netCashFlow = totalInflows - totalOutflows;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Inflows</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalInflows.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Outflows</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalOutflows.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Net Cash Flow</div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netCashFlow.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Forecast Periods</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {forecasts.length}
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Period</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Opening</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Inflows</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Outflows</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Net Flow</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Closing</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map(forecast => (
              <tr key={forecast.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{forecast.period}</td>
                <td className="px-4 py-3 text-right">${forecast.opening_balance.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">+${forecast.inflows.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">-${forecast.outflows.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-medium ${forecast.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {forecast.net_cash_flow >= 0 ? '+' : ''}${forecast.net_cash_flow.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold">${forecast.closing_balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InvestmentsView = ({ investments }: { investments: Investment[] }) => {
  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const activeInvestments = investments.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Invested</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalInvested.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Investments</div>
          <div className="text-2xl font-bold text-blue-600">
            {activeInvestments}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Investments</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {investments.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Investment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Interest Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Maturity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(investment => (
              <tr key={investment.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{investment.name}</td>
                <td className="px-4 py-3">{investment.type}</td>
                <td className="px-4 py-3 text-right">${investment.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{investment.interest_rate}%</td>
                <td className="px-4 py-3">{new Date(investment.maturity_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investment.status === 'active' ? 'bg-green-100 text-green-800' :
                    investment.status === 'matured' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {investment.status}
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

const LoansView = ({ loans }: { loans: Loan[] }) => {
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding_balance, 0);
  const monthlyPayments = loans.reduce((sum, l) => sum + l.monthly_payment, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalOutstanding.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Monthly Payments</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${monthlyPayments.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Loans</div>
          <div className="text-2xl font-bold text-blue-600">
            {loans.filter(l => l.status === 'active').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Lender</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Principal</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Outstanding</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Interest Rate</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Monthly Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Next Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{loan.lender}</td>
                <td className="px-4 py-3 text-right">${loan.principal.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium">${loan.outstanding_balance.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{loan.interest_rate}%</td>
                <td className="px-4 py-3 text-right">${loan.monthly_payment.toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(loan.next_payment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    loan.status === 'active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {loan.status}
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

const ForeignExchangeView = () => {
  const rates = [
    { currency: 'USD', rate: 1.0, change: 0 },
    { currency: 'EUR', rate: 0.92, change: 0.5 },
    { currency: 'GBP', rate: 0.79, change: -0.3 },
    { currency: 'ETB', rate: 57.5, change: 1.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Exchange Rates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rates.map(rate => (
            <div key={rate.currency} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{rate.currency}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {rate.rate.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${rate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rate.change >= 0 ? '+' : ''}{rate.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          FX Transactions
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No FX transactions recorded
        </div>
      </div>
    </div>
  );
};

const LiquidityPlanningView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Liquidity Ratio</div>
          <div className="text-2xl font-bold text-green-600">2.8x</div>
          <div className="text-xs text-slate-500 mt-1">Target: 2.0x</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Working Capital</div>
          <div className="text-2xl font-bold text-blue-600">$2.4M</div>
          <div className="text-xs text-slate-500 mt-1">Current Assets - Liabilities</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Cash Reserve</div>
          <div className="text-2xl font-bold text-indigo-600">$850K</div>
          <div className="text-xs text-slate-500 mt-1">3 months OpEx</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Burn Rate</div>
          <div className="text-2xl font-bold text-amber-600">$283K/mo</div>
          <div className="text-xs text-slate-500 mt-1">Monthly OpEx</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Liquidity Forecast (13-Week)</h3>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Week</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Opening</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Inflows</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Outflows</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Closing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { week: 'W1', open: 1850, inflow: 420, outflow: 280, status: 'Surplus' },
              { week: 'W2', open: 1990, inflow: 380, outflow: 310, status: 'Surplus' },
              { week: 'W3', open: 2060, inflow: 290, outflow: 340, status: 'Surplus' },
              { week: 'W4', open: 2010, inflow: 450, outflow: 520, status: 'Watch' },
              { week: 'W5', open: 1940, inflow: 310, outflow: 290, status: 'Surplus' },
              { week: 'W6', open: 1960, inflow: 280, outflow: 350, status: 'Watch' },
            ].map((w, i) => {
              const closing = w.open + w.inflow - w.outflow;
              return (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium">{w.week}</td>
                  <td className="px-4 py-3 text-right">${w.open}K</td>
                  <td className="px-4 py-3 text-right text-green-600">+${w.inflow}K</td>
                  <td className="px-4 py-3 text-right text-red-600">-${w.outflow}K</td>
                  <td className="px-4 py-3 text-right font-bold">${closing}K</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.status === 'Surplus' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {w.status}
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

const CashPoolingView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Master Pool Balance</div>
          <div className="text-2xl font-bold text-indigo-600">$3.2M</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Participants</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">5 Accounts</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Sweep Frequency</div>
          <div className="text-2xl font-bold text-blue-600">Daily</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pool Participants</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Account</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Entity</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Balance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Sweep Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</th>
            </tr>
          </thead>
          <tbody>
            {[
              { acc: 'CBE Operating', entity: 'Hotel Main', balance: 1850000, sweep: 0, role: 'Header' },
              { acc: 'CBE F&B', entity: 'F&B Division', balance: 420000, sweep: 380000, role: 'Participant' },
              { acc: 'Awash Payroll', entity: 'HR Dept', balance: 450000, sweep: 410000, role: 'Participant' },
              { acc: 'CBE Engineering', entity: 'Engineering', balance: 280000, sweep: 250000, role: 'Participant' },
              { acc: 'Dashen Reserve', entity: 'Treasury', balance: 200000, sweep: 0, role: 'Reserve' },
            ].map((p, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{p.acc}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.entity}</td>
                <td className="px-4 py-3 text-right font-medium">${p.balance.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-blue-600">{p.sweep > 0 ? `$${p.sweep.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.role === 'Header' ? 'bg-indigo-100 text-indigo-800' : p.role === 'Reserve' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                    {p.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
          Cash pooling automatically sweeps surplus balances from participant accounts to the header account daily, optimizing liquidity and reducing external borrowing costs.
        </p>
      </div>
    </div>
  );
};

export default TreasuryManagement;
