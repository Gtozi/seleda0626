import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Banknote,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Activity,
  Plus,
  Wallet,
  ArrowRightLeft,
  Coins,
  HandCoins
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchBankAccounts,
  createBankAccount,
  fetchStatementLines,
  fetchReconciliationBatches,
  importStatementLines,
  matchStatementLine,
  createReconciliationBatch,
  type BankAccount,
  type StatementLine,
  type ReconciliationBatch,
} from '../../services/bankReconciliationService';

const BankReconciliation = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cash_ops' | 'import' | 'match' | 'finalize'>('overview');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [statementLines, setStatementLines] = useState<StatementLine[]>([]);
  const [reconciliationBatches, setReconciliationBatches] = useState<ReconciliationBatch[]>([]);

  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    currency: 'ETB',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accounts, lines, batches] = await Promise.all([
        fetchBankAccounts(),
        fetchStatementLines(),
        fetchReconciliationBatches(),
      ]);
      setBankAccounts(accounts);
      setStatementLines(lines);
      setReconciliationBatches(batches);
    } catch (err: any) {
      console.error('Error loading bank reconciliation data:', err);
      setError(err.message || 'Failed to load bank reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async () => {
    if (!newAccountForm.accountNumber || !newAccountForm.accountName || !newAccountForm.bankName) {
      setError('Account number, name and bank name are required');
      return;
    }
    try {
      await createBankAccount(newAccountForm);
      await loadData();
      setShowNewAccount(false);
      setNewAccountForm({
        accountNumber: '',
        accountName: '',
        bankName: '',
        currency: 'ETB',
      });
    } catch (err: any) {
      console.error('Failed to create bank account:', err);
      setError(err.message || 'Failed to create bank account');
    }
  };

  const handleImportStatement = async (bankAccountId: string, lines: any[]) => {
    try {
      await importStatementLines(bankAccountId, lines);
      await loadData();
    } catch (err: any) {
      console.error('Failed to import statement:', err);
      setError(err.message || 'Failed to import statement');
    }
  };

  const handleMatchLine = async (statementLineId: string, journalLineId: string) => {
    try {
      await matchStatementLine(statementLineId, journalLineId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to match line:', err);
      setError(err.message || 'Failed to match line');
    }
  };

  const handleCreateBatch = async (batch: Omit<ReconciliationBatch, 'id' | 'total_debits' | 'total_credits' | 'status' | 'reconciled_by' | 'reconciled_at' | 'created_at' | 'bank_accounts'>) => {
    try {
      await createReconciliationBatch(batch);
      await loadData();
    } catch (err: any) {
      console.error('Failed to create reconciliation batch:', err);
      setError(err.message || 'Failed to create reconciliation batch');
    }
  };

  const unmatchedCount = statementLines.filter(l => l.status === 'Unmatched').length;
  const matchedCount = statementLines.filter(l => l.status === 'Matched').length;
  const varianceCount = statementLines.filter(l => l.status === 'Partially Matched').length;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Unmatched', value: `${unmatchedCount}`, sub: 'No ledger entry', icon: XCircle, color: 'text-rose-500' },
          { label: 'Matched Items', value: `${matchedCount}`, sub: 'Successfully matched', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Variance', value: `${varianceCount}`, sub: 'Partial matches', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Total Lines', value: `${statementLines.length}`, sub: 'Statement lines', icon: FileText, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Accounts</h3>
            <button
              onClick={() => setShowNewAccount(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {bankAccounts.map((bank, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{bank.account_name}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{bank.account_number}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    bank.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {bank.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Balance</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">${bank.balance.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                No bank accounts configured. Click + to add one.
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('import')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <Upload size={14} /> Import Statement
            </button>
            <button 
              onClick={() => setActiveTab('match')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Auto-Match Transactions
            </button>
            <button 
              onClick={() => setActiveTab('finalize')}
              className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} /> Finalize Reconciliation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-3xl shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Import Bank Statement</h3>

        {bankAccounts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold">
            No bank accounts configured. Add an account in the Overview tab first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Bank Account</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white">
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.account_name} ({bank.account_number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Statement Period</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white">
                  <option>June 2024</option>
                  <option>May 2024</option>
                  <option>April 2024</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-slate-400 mb-4" />
              <p className="text-sm font-black text-slate-900 dark:text-white mb-2">Drop your bank statement file here</p>
              <p className="text-[10px] text-slate-500 font-bold mb-4">Supports CSV, OFX, QFX, PDF formats</p>
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">
                Browse Files
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Recent Imports</h3>
        {statementLines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold">
            No statement lines imported yet.
          </div>
        ) : (
          <div className="space-y-3">
            {statementLines.slice(0, 5).map((line, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{line.description || line.reference || 'No description'}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{line.transaction_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">${line.credit > 0 ? line.credit.toFixed(2) : line.debit.toFixed(2)}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    line.status === 'Matched' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {line.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMatch = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search transactions..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold w-64" />
          </div>
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <Filter size={14} />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-700 transition">
          <RefreshCw size={14} /> Auto-Match All
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: 'transaction_date',
            label: 'Date',
            render: (item: StatementLine) => <span className="text-xs font-bold text-slate-500">{item.transaction_date}</span>,
          },
          {
            key: 'description',
            label: 'Description',
            render: (item: StatementLine) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.description || item.reference || '-'}</span>,
          },
          {
            key: 'credit',
            label: 'Ledger Amount',
            align: 'right',
            render: (item: StatementLine) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.credit > 0 ? item.credit.toFixed(2) : '-'}</span>,
          },
          {
            key: 'debit',
            label: 'Statement Amount',
            align: 'right',
            render: (item: StatementLine) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.debit > 0 ? item.debit.toFixed(2) : '-'}</span>,
          },
          {
            key: 'balance',
            label: 'Variance',
            align: 'right',
            render: (item: StatementLine) => (
              <span className={`text-xs font-mono font-black ${item.status === 'Matched' ? 'text-emerald-500' : item.status === 'Partially Matched' ? 'text-amber-500' : 'text-rose-500'}`}>
                ${item.balance.toFixed(2)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (item: StatementLine) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  item.status === 'Matched' ? 'bg-emerald-50 text-emerald-600' :
                  item.status === 'Partially Matched' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            sortable: false,
            render: (item: StatementLine) => (
              <div className="flex justify-center gap-1">
                {item.status !== 'Matched' && (
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ),
          },
        ] as Column<StatementLine>[]}
        data={statementLines}
        rowKey={(_, i) => i}
        sortable
        filterable
        filterPlaceholder="Search transactions..."
        filterKeys={['transaction_date', 'description', 'reference', 'status']}
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderCashOps = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Cash Receipts', value: '$48,200', sub: 'Today', icon: HandCoins, color: 'text-emerald-500' },
          { label: 'Cash Payments', value: '$12,400', sub: 'Today', icon: ArrowRightLeft, color: 'text-rose-500' },
          { label: 'Petty Cash', value: '$3,500', sub: 'Float balance', icon: Wallet, color: 'text-amber-500' },
          { label: 'Cash Float', value: '$8,000', sub: 'Front Office', icon: Coins, color: 'text-indigo-500' },
          { label: 'Cash Transfers', value: '2', sub: 'Pending approval', icon: ArrowRight, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={16} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Petty Cash Floats</h3>
            <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {[
          { dept: 'Front Office', code: 'PC-001', float: 5000, balance: 3500, custodian: 'Sarah T.' },
          { dept: 'F&B Kitchen', code: 'PC-002', float: 3000, balance: 1200, custodian: 'Mike K.' },
          { dept: 'Engineering', code: 'PC-003', float: 2000, balance: 850, custodian: 'James B.' },
          { dept: 'Housekeeping', code: 'PC-004', float: 1500, balance: 420, custodian: 'Lisa M.' },
            ].map((pc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600">
                    <Wallet size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{pc.dept}</p>
                    <p className="text-[9px] font-mono text-slate-400">{pc.code} • {pc.custodian}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white">${pc.balance.toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Float: ${pc.float.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Cash Transactions</h3>
            <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
          { type: 'Receipt', desc: 'Guest cash payment — Room 412', amount: 1200, time: '10:30 AM', icon: HandCoins, color: 'text-emerald-500' },
          { type: 'Payment', desc: 'Courier service payment', amount: -85, time: '09:15 AM', icon: ArrowRightLeft, color: 'text-rose-500' },
          { type: 'Transfer', desc: 'FO to Petty Cash replenishment', amount: -500, time: '08:45 AM', icon: ArrowRight, color: 'text-blue-500' },
          { type: 'Receipt', desc: 'F&B cash settlement', amount: 340, time: '08:20 AM', icon: HandCoins, color: 'text-emerald-500' },
          { type: 'Payment', desc: 'Office supplies purchase', amount: -120, time: 'Yesterday', icon: ArrowRightLeft, color: 'text-rose-500' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 ${tx.color}`}>
                    <tx.icon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.desc}</p>
                    <p className="text-[9px] font-mono text-slate-400">{tx.type} • {tx.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5 rounded-3xl">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
          <AlertCircle size={16} />
          <span className="text-[10px] font-black uppercase">Cash Management Actions</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-md transition flex items-center gap-2">
            <HandCoins size={12} /> Record Cash Receipt
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-md transition flex items-center gap-2">
            <ArrowRightLeft size={12} /> Record Cash Payment
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-md transition flex items-center gap-2">
            <ArrowRight size={12} /> Cash Transfer
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-md transition flex items-center gap-2">
            <Coins size={12} /> Replenish Petty Cash
          </button>
        </div>
      </div>
    </div>
  );

  const renderFinalize = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Reconciliation Checklist</h3>
          <div className="space-y-4">
            {[
              { label: 'All transactions matched', checked: true },
              { label: 'Variances reviewed and approved', checked: true },
              { label: 'Unmatched items investigated', checked: false },
              { label: 'Bank fees accounted for', checked: true },
              { label: 'Opening balance verified', checked: true },
              { label: 'Closing balance verified', checked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {item.checked && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase">Ready to Finalize</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              All critical items have been reviewed. You can proceed with finalizing the reconciliation.
            </p>
          </div>

          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
            <CheckCircle2 size={16} /> Finalize Reconciliation
          </button>

          <button className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('cash_ops')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'cash_ops' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Cash Ops
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'import' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Import
          </button>
          <button 
            onClick={() => setActiveTab('match')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'match' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Match
          </button>
          <button 
            onClick={() => setActiveTab('finalize')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'finalize' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Finalize
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Activity size={16} />
            History
          </button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'cash_ops' && renderCashOps()}
      {activeTab === 'import' && renderImport()}
      {activeTab === 'match' && renderMatch()}
      {activeTab === 'finalize' && renderFinalize()}

      <ModalSystem
        isOpen={showNewAccount}
        onClose={() => setShowNewAccount(false)}
        title="New Bank Account"
        subtitle="Add a bank account for reconciliation"
        variant="form"
        size="md"
        showFooter={false}
      >
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number *</label>
                <input
                  type="text"
                  value={newAccountForm.accountNumber}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Account number"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Name *</label>
                <input
                  type="text"
                  value={newAccountForm.accountName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Operating Account"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bank Name *</label>
                <input
                  type="text"
                  value={newAccountForm.bankName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Commercial Bank of Ethiopia"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Currency</label>
                <select
                  value={newAccountForm.currency}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ETB">ETB - Ethiopian Birr</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-950/20">
              <button
                onClick={() => setShowNewAccount(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
              >
                Create Account
              </button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default BankReconciliation;
