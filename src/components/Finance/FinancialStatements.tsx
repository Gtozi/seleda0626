import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Scale
} from 'lucide-react';
import { fetchProfitLoss, fetchBalanceSheet, fetchCashFlow, type ProfitLossResponse, type BalanceSheetResponse, type CashFlowResponse } from '../../services/financialStatementsService';

const FinancialStatements = () => {
  const [activeTab, setActiveTab] = useState<'profit-loss' | 'balance-sheet' | 'cash-flow'>('profit-loss');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profitLoss, setProfitLoss] = useState<ProfitLossResponse | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [cfPeriodStart, setCfPeriodStart] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [cfPeriodEnd, setCfPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  const [plPeriodStart, setPlPeriodStart] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [plPeriodEnd, setPlPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const [bsAsOfDate, setBsAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const loadProfitLoss = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfitLoss(plPeriodStart, plPeriodEnd);
      setProfitLoss(data);
    } catch (err: any) {
      console.error('Error loading profit & loss:', err);
      setError(err.message || 'Failed to load profit & loss');
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBalanceSheet(bsAsOfDate);
      setBalanceSheet(data);
    } catch (err: any) {
      console.error('Error loading balance sheet:', err);
      setError(err.message || 'Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const loadCashFlow = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCashFlow(cfPeriodStart, cfPeriodEnd);
      setCashFlow(data);
    } catch (err: any) {
      console.error('Error loading cash flow:', err);
      setError(err.message || 'Failed to load cash flow');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'profit-loss') {
      loadProfitLoss();
    } else if (activeTab === 'balance-sheet') {
      loadBalanceSheet();
    } else {
      loadCashFlow();
    }
  }, [activeTab, plPeriodStart, plPeriodEnd, bsAsOfDate, cfPeriodStart, cfPeriodEnd]);

  const renderProfitLoss = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label>
            <input
              type="date"
              value={plPeriodStart}
              onChange={(e) => setPlPeriodStart(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={plPeriodEnd}
              onChange={(e) => setPlPeriodEnd(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadProfitLoss}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          Loading profit & loss statement...
        </div>
      ) : profitLoss ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: `$${profitLoss.summary.total_revenue.toLocaleString()}`, sub: 'Gross income', icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Total Expenses', value: `$${profitLoss.summary.total_expenses.toLocaleString()}`, sub: 'Operating costs', icon: TrendingDown, color: 'text-rose-500' },
              { label: 'Net Profit', value: `$${profitLoss.summary.net_profit.toLocaleString()}`, sub: 'Bottom line', icon: DollarSign, color: profitLoss.summary.net_profit >= 0 ? 'text-emerald-500' : 'text-rose-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Revenue</h3>
              <div className="space-y-3">
                {profitLoss.revenue.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No revenue accounts found.
                  </div>
                ) : (
                  profitLoss.revenue.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-600">${account.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Expenses</h3>
              <div className="space-y-3">
                {profitLoss.expenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No expense accounts found.
                  </div>
                ) : (
                  profitLoss.expenses.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-rose-600">${account.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderBalanceSheet = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">As of Date</label>
            <input
              type="date"
              value={bsAsOfDate}
              onChange={(e) => setBsAsOfDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBalanceSheet}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          Loading balance sheet...
        </div>
      ) : balanceSheet ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Assets', value: `$${balanceSheet.summary.total_assets.toLocaleString()}`, sub: 'Resources owned', icon: Building2, color: 'text-indigo-500' },
              { label: 'Total Liabilities', value: `$${balanceSheet.summary.total_liabilities.toLocaleString()}`, sub: 'Obligations', icon: TrendingDown, color: 'text-amber-500' },
              {
                label: 'Total Equity',
                value: `$${balanceSheet.summary.total_equity.toLocaleString()}`,
                sub: balanceSheet.summary.is_balanced ? 'Balanced' : `Difference: $${balanceSheet.summary.difference.toFixed(2)}`,
                icon: Scale,
                color: balanceSheet.summary.is_balanced ? 'text-emerald-500' : 'text-rose-500',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Assets</h3>
              <div className="space-y-3">
                {balanceSheet.assets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No asset accounts found.
                  </div>
                ) : (
                  balanceSheet.assets.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-indigo-600">${account.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Liabilities</h3>
              <div className="space-y-3">
                {balanceSheet.liabilities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No liability accounts found.
                  </div>
                ) : (
                  balanceSheet.liabilities.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-600">${account.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Equity</h3>
              <div className="space-y-3">
                {balanceSheet.equity.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No equity accounts found.
                  </div>
                ) : (
                  balanceSheet.equity.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-600">${account.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label>
            <input
              type="date"
              value={cfPeriodStart}
              onChange={(e) => setCfPeriodStart(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={cfPeriodEnd}
              onChange={(e) => setCfPeriodEnd(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCashFlow}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          Loading cash flow statement...
        </div>
      ) : cashFlow ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Operating Cash', value: `$${cashFlow.summary.operating_total.toLocaleString()}`, sub: 'From operations', icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Investing Cash', value: `$${cashFlow.summary.investing_total.toLocaleString()}`, sub: 'Capital expenditures', icon: Building2, color: 'text-indigo-500' },
              { label: 'Financing Cash', value: `$${cashFlow.summary.financing_total.toLocaleString()}`, sub: 'Equity & debt', icon: DollarSign, color: 'text-amber-500' },
              {
                label: 'Net Cash Change',
                value: `$${cashFlow.summary.net_cash_change.toLocaleString()}`,
                sub: 'Cash & equivalents',
                icon: Scale,
                color: cashFlow.summary.net_cash_change >= 0 ? 'text-emerald-500' : 'text-rose-500',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Operating Activities */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Operating Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Net Profit</span>
                  <span className="text-xs font-mono font-black text-emerald-600">${cashFlow.operating_activities.net_profit.toFixed(2)}</span>
                </div>
                {cashFlow.operating_activities.working_capital_changes.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{item.account_code} - {item.account_name}</p>
                    </div>
                    <span className={`text-xs font-mono font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border-t-2 border-indigo-200 dark:border-indigo-500">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Net Operating Cash</span>
                  <span className="text-xs font-mono font-black text-indigo-600">${cashFlow.operating_activities.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Investing Activities</h3>
              <div className="space-y-3">
                {cashFlow.investing_activities.items.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No investing activity found.
                  </div>
                ) : (
                  cashFlow.investing_activities.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{item.account_code} - {item.account_name}</p>
                      </div>
                      <span className={`text-xs font-mono font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${item.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border-t-2 border-indigo-200 dark:border-indigo-500">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Net Investing Cash</span>
                  <span className="text-xs font-mono font-black text-indigo-600">${cashFlow.investing_activities.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Financing Activities</h3>
              <div className="space-y-3">
                {cashFlow.financing_activities.items.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No financing activity found.
                  </div>
                ) : (
                  cashFlow.financing_activities.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{item.account_code} - {item.account_name}</p>
                      </div>
                      <span className={`text-xs font-mono font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${item.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border-t-2 border-indigo-200 dark:border-indigo-500">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Net Financing Cash</span>
                  <span className="text-xs font-mono font-black text-indigo-600">${cashFlow.financing_activities.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('profit-loss')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'profit-loss' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('balance-sheet')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'balance-sheet' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab('cash-flow')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'cash-flow' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Cash Flow
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {activeTab === 'profit-loss' && renderProfitLoss()}
      {activeTab === 'balance-sheet' && renderBalanceSheet()}
      {activeTab === 'cash-flow' && renderCashFlow()}
    </div>
  );
};

export default FinancialStatements;
