import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  History, 
  Settings, 
  ChevronDown, 
  Eye, 
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Menu
} from 'lucide-react';
import { JournalEntry, ChartOfAccount } from '../../types/finance';
import { useERP } from '../../context/ERPContext';

const GeneralLedger = () => {
  const { journals: erpJournals, chartOfAccounts: coa, addJournalEntry, currentSystemDate, formatAmount } = useERP();
  const [activeTab, setActiveTab] = useState<'journals' | 'coa' | 'ledger' | 'invoices'>('journals');
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState<string>(coa?.[0]?.code || '1010');
  const [showNewJournal, setShowNewJournal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const journals = (erpJournals?.length > 0) ? erpJournals : [
    { 
      id: 'JV-2024-05-001', 
      date: '2024-05-28', 
      reference: 'INV-FB-492', 
      description: 'Monthly F&B Supplier Payment Posting', 
      status: 'Posted', 
      createdBy: 'Sarah Accountant', 
      amount: 14200.50,
      lines: [
        { id: '1', accountId: '1010', accountName: 'Cash on Hand', description: 'Payment Received', debit: 14200.50, credit: 0 },
        { id: '2', accountId: '4010', accountName: 'F&B Revenue', description: 'Revenue Recognition', debit: 0, credit: 14200.50 }
      ] 
    },
    { 
      id: 'JV-2024-05-002', 
      date: '2024-05-29', 
      reference: 'UTIL-MAY-01', 
      description: 'Accrued Electricity Charges May', 
      status: 'Pending', 
      createdBy: 'John Doe', 
      amount: 4500.00,
      lines: [] 
    },
    { 
      id: 'JV-2024-05-003', 
      date: '2024-05-30', 
      reference: 'PR-MAY-24', 
      description: 'Payroll Disbursements Executive', 
      status: 'Approved', 
      createdBy: 'Elena Finance', 
      amount: 85000.00,
      lines: [] 
    },
  ];

  // Derive ledger transactions for the selected account
  const ledgerEntries = React.useMemo(() => {
    const account = coa?.find(a => a.code === selectedLedgerAccount);
    const entries: any[] = [];
    
    // Filter all journal lines that involve this account
    journals.forEach(j => {
      j.lines?.forEach(line => {
        if (line.accountId === selectedLedgerAccount) {
          entries.push({
            date: j.date,
            reference: j.reference,
            description: line.description || j.description,
            debit: line.debit,
            credit: line.credit,
            id: j.id
          });
        }
      });
    });

    // Sort by date
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate running balances
    let running = 0; // In a real app, this starts with the opening balance of the period
    return sorted.map(entry => {
      const isAssetOrExpense = account?.category === 'Asset' || account?.category === 'Expense';
      if (isAssetOrExpense) {
        running += (entry.debit - entry.credit);
      } else {
        running += (entry.credit - entry.debit);
      }
      return { ...entry, runningBalance: running };
    });
  }, [selectedLedgerAccount, journals, coa]);

  const selectedAccountDetails = React.useMemo(() => coa?.find(a => a.code === selectedLedgerAccount), [coa, selectedLedgerAccount]);

  // Journal Filters
  const [journalSearch, setJournalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [newJournalLines, setNewJournalLines] = useState([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  const [entryDate, setEntryDate] = useState(currentSystemDate);
  const [refNum, setRefNum] = useState('');
  const [mainDesc, setMainDesc] = useState('');

  const handleSaveJournal = () => {
    if (!isBalanced) return;
    
    addJournalEntry({
      date: entryDate,
      reference: refNum,
      description: mainDesc,
      status: 'Posted',
      createdBy: 'Zeray Goytom',
      amount: totalDebit,
      lines: newJournalLines.map((line, idx) => ({
        id: `JL-${Date.now()}-${idx}`,
        accountId: line.accountId,
        accountName: coa?.find(a => a.code === line.accountId)?.name || 'Unknown',
        description: line.description || mainDesc,
        debit: line.debit,
        credit: line.credit
      }))
    });
    
    setShowNewJournal(false);
    setNewJournalLines([{ accountId: '', description: '', debit: 0, credit: 0 }, { accountId: '', description: '', debit: 0, credit: 0 }]);
    setRefNum('');
    setMainDesc('');
  };

  const addJournalLine = () => {
    setNewJournalLines([...newJournalLines, { accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeJournalLine = (index: number) => {
    setNewJournalLines(newJournalLines.filter((_, i) => i !== index));
  };

  const updateJournalLine = (index: number, field: string, value: any) => {
    const updatedLines = [...newJournalLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setNewJournalLines(updatedLines);
  };

  const totalDebit = newJournalLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = newJournalLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const filteredJournals = journals.filter(j => {
    const matchSearch = j.id.toLowerCase().includes(journalSearch.toLowerCase()) || 
                       j.reference.toLowerCase().includes(journalSearch.toLowerCase()) ||
                       j.description.toLowerCase().includes(journalSearch.toLowerCase());
    const matchStatus = statusFilter === 'All' || j.status === statusFilter;
    const matchDate = (!dateFrom || j.date >= dateFrom) && (!dateTo || j.date <= dateTo);
    return matchSearch && matchStatus && matchDate;
  });

  const chartData = [
    { date: '05-24', amount: 45000 },
    { date: '05-25', amount: 52000 },
    { date: '05-26', amount: 38000 },
    { date: '05-27', amount: 65000 },
    { date: '05-28', amount: 42000 },
    { date: '05-29', amount: 88000 },
    { date: '05-30', amount: 74000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('journals')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'journals' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Journal Entries
          </button>
          <button 
            onClick={() => setActiveTab('coa')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'coa' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Chart of Accounts
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Ledger View
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'invoices' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Invoices
          </button>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <Download size={16} />
              Export
           </button>
           <button 
             onClick={() => setShowNewJournal(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none"
           >
              <Plus size={16} />
              {activeTab === 'journals' ? 'New Journal' : 'New Account'}
           </button>
        </div>
      </div>

      {showNewJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">New Journal Entry</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Double-entry architectural matching</p>
                 </div>
                 <button 
                  onClick={() => setShowNewJournal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                 >
                    <Settings size={20} className="rotate-45" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entry Date</label>
                       <input 
                        type="date" 
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference Number</label>
                       <input 
                        type="text" 
                        placeholder="e.g. JV-2026-X"
                        value={refNum}
                        onChange={(e) => setRefNum(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase placeholder:normal-case font-mono"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                       <input 
                        type="text" 
                        placeholder="Internal notes..."
                        value={mainDesc}
                        onChange={(e) => setMainDesc(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">General Ledger Lines</h4>
                       <button 
                        onClick={addJournalLine}
                        className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase hover:underline"
                       >
                          <Plus size={12} /> Add Line
                       </button>
                    </div>

                    <div className="space-y-3">
                       {newJournalLines.map((line, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 items-start animate-fade-in">
                             <div className="col-span-4 space-y-1">
                                <select 
                                 value={line.accountId}
                                 onChange={(e) => updateJournalLine(idx, 'accountId', e.target.value)}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                >
                                   <option value="">Select Account...</option>
                                   {coa?.map(acc => (
                                      <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                                   ))}
                                </select>
                             </div>
                             <div className="col-span-4">
                                <input 
                                 type="text" 
                                 placeholder="Line description..."
                                 value={line.description}
                                 onChange={(e) => updateJournalLine(idx, 'description', e.target.value)}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                             </div>
                             <div className="col-span-2">
                                <input 
                                 type="number" 
                                 placeholder="Debit"
                                 value={line.debit || ''}
                                 onChange={(e) => updateJournalLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-black text-right outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                                />
                             </div>
                             <div className="col-span-2 relative">
                                <input 
                                 type="number" 
                                 placeholder="Credit"
                                 value={line.credit || ''}
                                 onChange={(e) => updateJournalLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-black text-right outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                                />
                                {newJournalLines.length > 2 && (
                                   <button 
                                    onClick={() => removeJournalLine(idx)}
                                    className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition p-1"
                                   >
                                      <Plus size={14} className="rotate-45" />
                                   </button>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                 <div className="flex gap-6 items-center">
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Debits</span>
                       <span className="text-sm font-black text-emerald-600 font-mono">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Credits</span>
                       <span className="text-sm font-black text-rose-600 font-mono">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {totalDebit > 0 && (
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all animate-fade-in ${
                         isBalanced ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                          {isBalanced ? 'Balanced' : `Difference: $${Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                       </div>
                    )}
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowNewJournal(false)}
                      className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition"
                    >
                       Discard
                    </button>
                    <button 
                      disabled={!isBalanced}
                      onClick={handleSaveJournal}
                      className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                    >
                       Post Transaction
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'journals' && (
        <div className="grid lg:grid-cols-12 gap-6">
           {/* Chart Section */}
           <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs overflow-hidden">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Volume Trend</h4>
                       <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-1">Activity Audit</p>
                    </div>
                    <div className="flex gap-2">
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Balanced
                       </span>
                    </div>
                 </div>
                 <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                             dataKey="date" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                             dy={10}
                          />
                          <YAxis hide />
                          <Tooltip 
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900' }}
                             formatter={(value: any) => [`$${value.toLocaleString()}`, 'Posted Amount']}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="amount" 
                             stroke="#6366f1" 
                             strokeWidth={3}
                             fillOpacity={1} 
                             fill="url(#colorAmount)" 
                             animationDuration={2000}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Journal Health', value: '99.2%', sub: 'No Mismatches', color: 'bg-emerald-50 text-emerald-600' },
                   { label: 'Posting Speed', value: '4.2s', sub: 'Instant Sync', color: 'bg-blue-50 text-blue-600' },
                   { label: 'Audit Trail', value: 'Active', sub: 'Immutable Logs', color: 'bg-indigo-50 text-indigo-600' }
                 ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{card.label}</span>
                       <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{card.value}</p>
                       <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${card.color}`}>
                          {card.sub}
                       </span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Stats Row */}
           <div className="lg:col-span-12 flex gap-4 overflow-x-auto no-scrollbar">
              {[
                { label: 'Total Volume', value: '$251k', p: '+12%', color: 'text-indigo-600' },
                { label: 'Pending Approval', value: '4 Entries', p: '$12.4k', color: 'text-amber-600' },
                { label: 'Last Posting', value: 'Today', p: '09:42 AM', color: 'text-emerald-600' },
                { label: 'Errors/Reversals', value: '0', p: 'All Clean', color: 'text-slate-500' },
              ].map((s, i) => (
                <div key={i} className="min-w-[180px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                   <div className="flex items-baseline justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{s.value}</span>
                      <span className={`text-[9px] font-bold ${s.color}`}>{s.p}</span>
                   </div>
                </div>
              ))}
           </div>

           {/* Journals Table */}
           <div className="lg:col-span-12 bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700 rounded-3xl overflow-hidden shadow-3xs dark:shadow-slate-900/20">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search by ID, ref, or desc..." 
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] w-72 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    />
                 </div>
                 <div className="flex gap-2">
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><Filter size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><History size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><Settings size={14} /></button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal ID</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created By</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredJournals.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4">
                           <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                                 <FileText size={12} />
                              </div>
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{j.id}</span>
                           </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{j.date}</td>
                        <td className="px-5 py-4">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{j.description}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Ref: {j.reference}</span>
                           </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white text-right">${j.amount?.toLocaleString()}</td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{j.createdBy}</td>
                        <td className="px-5 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             j.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                             j.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
                             'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
                           }`}>
                             {j.status}
                           </span>
                        </td>
                        <td className="px-5 py-4">
                           <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => setSelectedJournal(j)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                              >
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Menu size={14} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'coa' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise Chart of Accounts</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Multi-level double entry matching structure</p>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Code</th>
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Name</th>
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Category</th>
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                       <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {coa?.map((acc) => (
                       <tr key={acc.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4 text-xs font-black text-indigo-600 font-mono italic">{acc.code}</td>
                          <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white">{acc.name}</td>
                          <td className="px-5 py-4">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                               acc.category === 'Asset' ? 'bg-blue-100 text-blue-700' :
                               acc.category === 'Liability' ? 'bg-amber-100 text-amber-700' :
                               acc.category === 'Revenue' ? 'bg-emerald-100 text-emerald-700' :
                               'bg-slate-100 text-slate-700'
                             }`}>
                                {acc.category}
                             </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-bold text-slate-500">{acc.subCategory}</td>
                          <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white text-right">${acc.balance.toLocaleString()}</td>
                          <td className="px-5 py-4">
                             <div className="flex justify-center items-center gap-1.5 text-emerald-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black uppercase">Active</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected General Ledger Account</label>
                 <div className="relative">
                   <select 
                    value={selectedLedgerAccount}
                    onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10"
                   >
                      {coa?.map(acc => (
                         <option key={acc.code} value={acc.code}>{acc.code} - {acc.name} ({acc.category})</option>
                      ))}
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left min-w-[160px]">
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Account Category</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      selectedAccountDetails?.category === 'Asset' ? 'bg-blue-100 text-blue-700' :
                      selectedAccountDetails?.category === 'Liability' ? 'bg-amber-100 text-amber-700' :
                      selectedAccountDetails?.category === 'Revenue' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedAccountDetails?.category} / {selectedAccountDetails?.subCategory}
                    </span>
                 </div>
                 <div className="bg-indigo-600 border border-indigo-500 p-4 rounded-2xl text-left min-w-[200px] shadow-lg shadow-indigo-600/20">
                    <span className="text-[8px] font-black text-indigo-200 uppercase block mb-1">Functional Balance</span>
                    <span className="text-lg font-black text-white font-mono leading-none">
                      {formatAmount ? formatAmount(selectedAccountDetails?.balance || 0) : `$${selectedAccountDetails?.balance?.toLocaleString()}`}
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <div className="flex items-center gap-3">
                    <History size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">General Ledger Activity Log</h4>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Period: All Time (Live Audit)</div>
                    <button className="flex items-center gap-1 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">
                      <Download size={14} /> Export XLS
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID / Ref</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Debit (+)</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Credit (-)</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Running Balance</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-all">
                       {ledgerEntries.length > 0 ? ledgerEntries.map((trx, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                             <td className="px-5 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                {new Date(trx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                             </td>
                             <td className="px-5 py-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{trx.id}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Ref: {trx.reference}</span>
                                </div>
                             </td>
                             <td className="px-5 py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 max-w-[240px] truncate" title={trx.description}>
                                {trx.description}
                             </td>
                             <td className="px-5 py-4 text-[10px] font-black text-emerald-600 text-right font-mono">
                                {trx.debit > 0 ? (formatAmount ? formatAmount(trx.debit) : `$${trx.debit.toLocaleString()}`) : '-'}
                             </td>
                             <td className="px-5 py-4 text-[10px] font-black text-rose-600 text-right font-mono">
                                {trx.credit > 0 ? (formatAmount ? formatAmount(trx.credit) : `$${trx.credit.toLocaleString()}`) : '-'}
                             </td>
                             <td className="px-5 py-4 text-[11px] font-black text-slate-900 dark:text-white text-right font-mono bg-slate-50/30 dark:bg-slate-950/20">
                                {formatAmount ? formatAmount(trx.runningBalance) : `$${trx.runningBalance.toLocaleString()}`}
                             </td>
                          </tr>
                       )) : (
                         <tr>
                            <td colSpan={6} className="px-5 py-20 text-center">
                               <div className="flex flex-col items-center gap-3 opacity-30">
                                  <ArrowRightLeft size={32} className="text-slate-300" />
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No transaction activity recorded for this period</p>
                               </div>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
              {ledgerEntries.length > 0 && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <div className="flex gap-6">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Period Activity</span>
                         <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{ledgerEntries.length} Posted Items</span>
                      </div>
                   </div>
                   <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Detailed Audit Report</button>
                </div>
              )}
           </div>
        </div>
      )}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Unpaid Invoices', value: '$84,200', count: '12 Bills', color: 'text-rose-500', icon: Clock },
                { label: 'Total Billed (MTD)', value: '$520,400', count: '142 Invoices', color: 'text-indigo-500', icon: FileText },
                { label: 'Settled to GL', value: '$436,200', count: '92% Rate', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: 'Open Disputes', value: '$12,500', count: '3 cases', color: 'text-amber-500', icon: Menu },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex items-center gap-4">
                   <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 ${stat.color}`}>
                      <stat.icon size={20} />
                   </div>
                   <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.count}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Document Audit Registry</h4>
                 <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition">
                       Category: All
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition">
                       Status: Active
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document #</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Vendor</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued Date</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Amount</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GL Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {[
                         { 
                           id: 'INV-2026-001', 
                           type: 'Guest Folio', 
                           entity: 'John Smith (Room 402)', 
                           date: '2026-06-03', 
                           net: 1250.00, 
                           tax: 187.50, 
                           gl: 'Posted', 
                           glRef: 'JV-2026-8821',
                           items: [
                             { desc: 'Room Tariff (3 Nights)', qty: 3, rate: 350, total: 1050 },
                             { desc: 'Room Service - Dinner', qty: 1, rate: 125, total: 125 },
                             { desc: 'Spa Treatment - Swedish', qty: 1, rate: 75, total: 75 }
                           ]
                         },
                         { 
                           id: 'INV-2026-002', 
                           type: 'Vendor Bill', 
                           entity: 'Apex Cleaning Supplies', 
                           date: '2026-06-02', 
                           net: 4500.00, 
                           tax: 0.00, 
                           gl: 'Pending', 
                           glRef: '-',
                           items: [
                             { desc: 'Industrial Detergent (20L)', qty: 10, rate: 250, total: 2500 },
                             { desc: 'Microfiber Towel Set', qty: 50, rate: 20, total: 1000 },
                             { desc: 'Disinfectant Spray 500ml', qty: 100, rate: 10, total: 1000 }
                           ]
                         },
                         { 
                           id: 'INV-2026-003', 
                           type: 'Guest Folio', 
                           entity: 'TechCorp Group', 
                           date: '2026-06-01', 
                           net: 15400.00, 
                           tax: 2310.00, 
                           gl: 'Posted', 
                           glRef: 'JV-2026-8840',
                           items: [
                             { desc: 'Conference Room Rental', qty: 2, rate: 2500, total: 5000 },
                             { desc: 'Executive Catering Package', qty: 40, rate: 150, total: 6000 },
                             { desc: 'Audio Visual Support', qty: 1, rate: 4400, total: 4400 }
                           ]
                         },
                         { 
                           id: 'INV-2026-004', 
                           type: 'Maintenance Bill', 
                           entity: 'Elevator Pro Services', 
                           date: '2026-05-31', 
                           net: 850.00, 
                           tax: 127.50, 
                           gl: 'Draft', 
                           glRef: '-',
                           items: [
                             { desc: 'Monthly Preventative Maintenance', qty: 1, rate: 850, total: 850 }
                           ]
                         },
                       ].map((inv, i) => (
                          <tr 
                            key={i} 
                            onClick={() => setSelectedInvoice(inv)}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                          >
                             <td className="px-6 py-4">
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter group-hover:underline">{inv.id}</span>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  inv.type === 'Guest Folio' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                }`}>{inv.type}</span>
                             </td>
                             <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white uppercase">{inv.entity}</td>
                             <td className="px-6 py-4 text-xs font-bold text-slate-500">{inv.date}</td>
                             <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white text-right font-mono">${inv.net.toLocaleString()}</td>
                             <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right font-mono">${inv.tax.toLocaleString()}</td>
                             <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-1">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                     inv.gl === 'Posted' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                                   }`}>{inv.gl}</span>
                                   {inv.glRef !== '-' && <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{inv.glRef}</span>}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedJournal.id}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Reference: {selectedJournal.reference}</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      selectedJournal.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                      selectedJournal.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
                      'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
                    }`}>
                      {selectedJournal.status}
                    </span>
                    <button 
                      onClick={() => setSelectedJournal(null)}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <Plus size={20} className="rotate-45" />
                    </button>
                 </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                 <div className="grid grid-cols-3 gap-6 text-[11px]">
                    <div>
                       <span className="text-slate-400 uppercase font-black block mb-1">Entry Date</span>
                       <span className="font-bold text-slate-900 dark:text-white">{selectedJournal.date}</span>
                    </div>
                    <div>
                       <span className="text-slate-400 uppercase font-black block mb-1">Created By</span>
                       <span className="font-bold text-slate-900 dark:text-white">{selectedJournal.createdBy}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-slate-400 uppercase font-black block mb-1">Total Amount</span>
                       <span className="font-black text-indigo-600">{formatAmount ? formatAmount(selectedJournal.amount || 0) : `$${selectedJournal.amount?.toLocaleString()}`}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Entry Description</h4>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       {selectedJournal.description}
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Ledger Lines</h4>
                    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-3xs">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Debit</th>
                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Credit</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {selectedJournal.lines?.length > 0 ? selectedJournal.lines.map((line, idx) => (
                                <tr key={idx} className="text-[10px]">
                                   <td className="px-4 py-3 font-bold text-indigo-600">{line.accountId} - {line.accountName}</td>
                                   <td className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">{line.description}</td>
                                   <td className="px-4 py-3 font-black text-emerald-600 text-right">{line.debit > 0 ? (formatAmount ? formatAmount(line.debit) : `$${line.debit.toLocaleString()}`) : '-'}</td>
                                   <td className="px-4 py-3 font-black text-rose-600 text-right">{line.credit > 0 ? (formatAmount ? formatAmount(line.credit) : `$${line.credit.toLocaleString()}`) : '-'}</td>
                                </tr>
                             )) : (
                                <tr>
                                   <td colSpan={4} className="px-4 py-6 text-center text-slate-400 font-bold uppercase text-[9px]">No breakdown available for this entry</td>
                                </tr>
                             )}
                          </tbody>
                          <tfoot className="bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-150 dark:border-slate-800">
                             <tr className="text-[10px] font-black">
                                <td colSpan={2} className="px-4 py-3 uppercase">Total</td>
                                <td className="px-4 py-3 text-right text-indigo-600">{formatAmount ? formatAmount(selectedJournal.amount || 0) : `$${selectedJournal.amount?.toLocaleString()}`}</td>
                                <td className="px-4 py-3 text-right text-indigo-600">{formatAmount ? formatAmount(selectedJournal.amount || 0) : `$${selectedJournal.amount?.toLocaleString()}`}</td>
                             </tr>
                          </tfoot>
                       </table>
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-950/20">
                 <button 
                  onClick={() => window.print()}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                 >
                    <Download size={14} /> Print Voucher
                 </button>
                 <button 
                  onClick={() => setSelectedJournal(null)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                 >
                    Close View
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-start">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 mb-2 inline-block">
                  {selectedInvoice.type}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedInvoice.id}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase">Document Audit Trail • Issued {selectedInvoice.date}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entity Description</span>
                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{selectedInvoice.entity}</p>
                   <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Primary Billing Recipient</p>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">GL Posting Status</span>
                   <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        selectedInvoice.gl === 'Posted' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedInvoice.gl}
                      </span>
                      {selectedInvoice.glRef !== '-' && <span className="text-[9px] font-black text-indigo-600 font-mono italic">Ref: {selectedInvoice.glRef}</span>}
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Document Line Breakdown</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedInvoice.items?.length || 0} Items</span>
                 </div>
                 <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                             <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                             <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                             <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Rate</th>
                             <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {selectedInvoice.items?.map((item: any, idx: number) => (
                             <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.desc}</td>
                                <td className="px-4 py-2.5 text-xs font-bold text-slate-500 text-center">{item.qty}</td>
                                <td className="px-4 py-2.5 text-xs font-bold text-slate-500 text-right font-mono">${item.rate.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-xs font-black text-slate-900 dark:text-white text-right font-mono">${item.total.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                       <span>Net Transaction Amount</span>
                       <span className="font-mono text-slate-900 dark:text-white">${selectedInvoice.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                       <span>Sales Tax / VAT (15%)</span>
                       <span className="font-mono text-slate-900 dark:text-white">${selectedInvoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                    <div className="flex justify-between items-center font-black uppercase">
                       <span className="text-xs text-slate-900 dark:text-white">Gross Revenue Impact</span>
                       <span className="text-xl text-indigo-600 font-mono">${(selectedInvoice.net + selectedInvoice.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition hover:opacity-90 shadow-xl shadow-slate-900/20 dark:shadow-none flex items-center justify-center gap-2">
                    <Download size={14} /> Download PDF
                 </button>
                 <button className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition hover:bg-slate-50 flex items-center justify-center gap-2">
                    <ArrowRightLeft size={14} /> View GL Entry
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;
