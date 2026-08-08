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
  Menu,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Send,
  RotateCcw,
  Play,
  DollarSign,
  Calendar
} from 'lucide-react';
import { JournalEntry, ChartOfAccount } from '../../types/finance';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const GeneralLedger = () => {
  const { journals: erpJournals, chartOfAccounts: coa, createJournalEntry, postJournalEntry, reverseJournalEntry, currentSystemDate, formatAmount } = useERP();
  const [activeTab, setActiveTab] = useState<'journals' | 'coa' | 'ledger' | 'invoices' | 'recurring' | 'periods' | 'reversing' | 'adjusting' | 'closing' | 'trial_balance' | 'audit_trail'>('journals');
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
      approvedBy: 'Finance Manager',
      approvedAt: '2024-05-28T10:30:00Z',
      postedAt: '2024-05-28T11:00:00Z',
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
      status: 'Draft', 
      createdBy: 'John Doe', 
      amount: 4500.00,
      lines: [] 
    },
    { 
      id: 'JV-2024-05-003', 
      date: '2024-05-30', 
      reference: 'PR-MAY-24', 
      description: 'Payroll Disbursements Executive', 
      status: 'Pending Approval', 
      createdBy: 'Elena Finance', 
      amount: 85000.00,
      lines: [] 
    },
    { 
      id: 'JV-2024-05-004', 
      date: '2024-05-31', 
      reference: 'MAINT-JUN-01', 
      description: 'Prepaid Maintenance Contract', 
      status: 'Approved', 
      createdBy: 'Michael Accountant', 
      approvedBy: 'Finance Manager',
      approvedAt: '2024-05-31T14:20:00Z',
      amount: 12000.00,
      lines: [
        { id: '1', accountId: '1510', accountName: 'Prepaid Expenses', description: 'Annual Maintenance Contract', debit: 12000.00, credit: 0 },
        { id: '2', accountId: '1010', accountName: 'Cash on Hand', description: 'Payment for Maintenance', debit: 0, credit: 12000.00 }
      ] 
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
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [newJournalLines, setNewJournalLines] = useState([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  const [entryDate, setEntryDate] = useState(currentSystemDate);
  const [refNum, setRefNum] = useState('');
  const [mainDesc, setMainDesc] = useState('');

  const handleSaveJournal = async () => {
    if (!isBalanced) return;

    await createJournalEntry({
      date: entryDate,
      reference: refNum,
      description: mainDesc,
      status: 'Draft',
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

  const handleSubmitForApproval = (journal: JournalEntry) => {
    // In a real app, this would update the journal status via API
    const updatedJournals = erpJournals?.map(j => 
      j.id === journal.id ? { ...j, status: 'Pending Approval' as const } : j
    );
    // For now, we'll just log this action
    console.log('Journal submitted for approval:', journal.id);
  };

  const handleApproveJournal = (journal: JournalEntry) => {
    // In a real app, this would update the journal status via API
    const updatedJournals = erpJournals?.map(j => 
      j.id === journal.id ? { ...j, status: 'Approved' as const, approvedBy: 'Finance Manager', approvedAt: new Date().toISOString() } : j
    );
    console.log('Journal approved:', journal.id);
  };

  const handlePostJournal = async (journal: JournalEntry) => {
    try {
      await postJournalEntry(journal.id);
      console.log('Journal posted:', journal.id);
    } catch (error) {
      console.error('Failed to post journal:', error);
    }
  };

  const handleReverseJournal = async (journal: JournalEntry) => {
    try {
      await reverseJournalEntry(journal.id);
      console.log('Journal reversed:', journal.id);
    } catch (error) {
      console.error('Failed to reverse journal:', error);
    }
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

  const invoiceDocuments = [
    { id: 'INV-2026-001', type: 'Guest Folio', entity: 'John Smith (Room 402)', date: '2026-06-03', net: 1250.00, tax: 187.50, gl: 'Posted', glRef: 'JV-2026-8821', items: [{ desc: 'Room Tariff (3 Nights)', qty: 3, rate: 350, total: 1050 }, { desc: 'Room Service - Dinner', qty: 1, rate: 125, total: 125 }, { desc: 'Spa Treatment - Swedish', qty: 1, rate: 75, total: 75 }] },
    { id: 'INV-2026-002', type: 'Vendor Bill', entity: 'Apex Cleaning Supplies', date: '2026-06-02', net: 4500.00, tax: 0.00, gl: 'Pending', glRef: '-', items: [{ desc: 'Industrial Detergent (20L)', qty: 10, rate: 250, total: 2500 }, { desc: 'Microfiber Towel Set', qty: 50, rate: 20, total: 1000 }, { desc: 'Disinfectant Spray 500ml', qty: 100, rate: 10, total: 1000 }] },
    { id: 'INV-2026-003', type: 'Guest Folio', entity: 'TechCorp Group', date: '2026-06-01', net: 15400.00, tax: 2310.00, gl: 'Posted', glRef: 'JV-2026-8840', items: [{ desc: 'Conference Room Rental', qty: 2, rate: 2500, total: 5000 }, { desc: 'Executive Catering Package', qty: 40, rate: 150, total: 6000 }, { desc: 'Audio Visual Support', qty: 1, rate: 4400, total: 4400 }] },
    { id: 'INV-2026-004', type: 'Maintenance Bill', entity: 'Elevator Pro Services', date: '2026-05-31', net: 850.00, tax: 127.50, gl: 'Draft', glRef: '-', items: [{ desc: 'Monthly Preventative Maintenance', qty: 1, rate: 850, total: 850 }] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('journals')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'journals' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Journal Entries
          </button>
          <button 
            onClick={() => setActiveTab('coa')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'coa' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Chart of Accounts
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'ledger' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Ledger View
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'invoices' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Invoices
          </button>
          <button 
            onClick={() => setActiveTab('recurring')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'recurring' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Recurring
          </button>
          <button 
            onClick={() => setActiveTab('periods')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'periods' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Periods
          </button>
          <button 
            onClick={() => setActiveTab('reversing')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'reversing' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Reversing
          </button>
          <button 
            onClick={() => setActiveTab('adjusting')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'adjusting' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Adjusting
          </button>
          <button 
            onClick={() => setActiveTab('closing')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'closing' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Closing
          </button>
          <button 
            onClick={() => setActiveTab('trial_balance')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'trial_balance' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Trial Balance
          </button>
          <button 
            onClick={() => setActiveTab('audit_trail')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'audit_trail' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Audit Trail
          </button>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <Download size={16} />
              Export
           </button>
           <button 
             onClick={() => setShowNewJournal(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none"
           >
              <Plus size={16} />
              {activeTab === 'journals' ? 'New Journal' : 'New Account'}
           </button>
        </div>
      </div>

      <ModalSystem
        isOpen={showNewJournal}
        onClose={() => setShowNewJournal(false)}
        title="New Journal Entry"
        subtitle="Double-entry architectural matching"
        variant="form"
        size="xl"
        showFooter={false}
      >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entry Date</label>
                       <input 
                        type="date" 
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference Number</label>
                       <input 
                        type="text" 
                        placeholder="e.g. JV-2026-X"
                        value={refNum}
                        onChange={(e) => setRefNum(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase placeholder:normal-case font-mono"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                       <input 
                        type="text" 
                        placeholder="Internal notes..."
                        value={mainDesc}
                        onChange={(e) => setMainDesc(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                                 className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
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
                                 className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                             </div>
                             <div className="col-span-2">
                                <input 
                                 type="number" 
                                 placeholder="Debit"
                                 value={line.debit || ''}
                                 onChange={(e) => updateJournalLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[11px] font-black text-right outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                                />
                             </div>
                             <div className="col-span-2 relative">
                                <input 
                                 type="number" 
                                 placeholder="Credit"
                                 value={line.credit || ''}
                                 onChange={(e) => updateJournalLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[11px] font-black text-right outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
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

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/20 sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
                      className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition"
                    >
                       Discard
                    </button>
                    <button 
                      disabled={!isBalanced}
                      onClick={handleSaveJournal}
                      className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                    >
                       Save as Draft
                    </button>
                 </div>
              </div>
      </ModalSystem>

      {activeTab === 'journals' && (
        <div className="grid lg:grid-cols-12 gap-6">
           {/* Chart Section */}
           <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm overflow-hidden">
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
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
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
                <div key={i} className="min-w-[180px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                   <div className="flex items-baseline justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{s.value}</span>
                      <span className={`text-[9px] font-bold ${s.color}`}>{s.p}</span>
                   </div>
                </div>
              ))}
           </div>

           {/* Journals Table */}
           <div className="lg:col-span-12 space-y-4">
              <div className="mb-4">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal Entries</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Double entry transaction records</p>
              </div>
              <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm dark:shadow-slate-900/20">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search by ID, ref, or desc..." 
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] w-72 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    />
                 </div>
                 <div className="flex gap-2">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="All">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Posted">Posted</option>
                    </select>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><History size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><Settings size={14} /></button>
                 </div>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Journal ID', render: (j: JournalEntry) => (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg"><FileText size={12} /></div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{j.id}</span>
                    </div>
                  ) },
                  { key: 'date', label: 'Date', render: (j: JournalEntry) => <span className="text-xs font-bold text-slate-500">{j.date}</span> },
                  { key: 'description', label: 'Description', render: (j: JournalEntry) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{j.description}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Ref: {j.reference}</span>
                    </div>
                  ) },
                  { key: 'amount', label: 'Amount', align: 'right' as const, render: (j: JournalEntry) => <span className="text-xs font-black text-slate-900 dark:text-white">${j.amount?.toLocaleString()}</span> },
                  { key: 'createdBy', label: 'Created By', render: (j: JournalEntry) => <span className="text-xs font-bold text-slate-500">{j.createdBy}</span> },
                  { key: 'status', label: 'Status', render: (j: JournalEntry) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      j.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                      j.status === 'Approved' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' :
                      j.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
                      j.status === 'Draft' ? 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>{j.status}</span>
                  ) },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (j: JournalEntry) => (
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setSelectedJournal(j)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      {j.status === 'Draft' && <button onClick={() => handleSubmitForApproval(j)} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Submit for Approval"><Send size={14} /></button>}
                      {j.status === 'Pending' && <button onClick={() => handleApproveJournal(j)} className="p-1.5 text-slate-400 hover:text-blue-600 transition" title="Approve Journal"><UserCheck size={14} /></button>}
                      {j.status === 'Approved' && <button onClick={() => handlePostJournal(j)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Post to GL"><ShieldCheck size={14} /></button>}
                      {j.status === 'Posted' && <button onClick={() => handleReverseJournal(j)} className="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Reverse Journal"><RotateCcw size={14} /></button>}
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Menu size={14} /></button>
                    </div>
                  ) },
                ] as Column<JournalEntry>[]}
                data={filteredJournals}
                rowKey={(j) => j.id}
                sortable
                filterable
                filterPlaceholder="Search journals..."
                filterKeys={['id', 'description', 'reference', 'createdBy', 'status']}
                containerClassName="rounded-lg"
              />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'coa' && (
        <div>
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise Chart of Accounts</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Multi-level double entry matching structure</p>
           </div>
           <DataTable
             columns={[
               { key: 'code', label: 'Account Code', render: (acc: ChartOfAccount) => <span className="text-xs font-black text-indigo-600 font-mono italic">{acc.code}</span> },
               { key: 'name', label: 'Account Name', render: (acc: ChartOfAccount) => <span className="text-xs font-black text-slate-900 dark:text-white">{acc.name}</span> },
               { key: 'category', label: 'Category', render: (acc: ChartOfAccount) => (
                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                   acc.category === 'Asset' ? 'bg-blue-100 text-blue-700' :
                   acc.category === 'Liability' ? 'bg-amber-100 text-amber-700' :
                   acc.category === 'Revenue' ? 'bg-emerald-100 text-emerald-700' :
                   'bg-slate-100 text-slate-700'
                 }`}>{acc.category}</span>
               ) },
               { key: 'subCategory', label: 'Sub-Category', render: (acc: ChartOfAccount) => <span className="text-xs font-bold text-slate-500">{acc.subCategory}</span> },
               { key: 'balance', label: 'Balance', align: 'right' as const, render: (acc: ChartOfAccount) => <span className="text-xs font-black text-slate-900 dark:text-white">${acc.balance.toLocaleString()}</span> },
               { key: 'status', label: 'Status', align: 'center' as const, sortable: false, render: () => (
                 <div className="flex justify-center items-center gap-1.5 text-emerald-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[9px] font-black uppercase">Active</span>
                 </div>
               ) },
             ] as Column<ChartOfAccount>[]}
             data={coa || []}
             rowKey={(acc) => acc.code}
             sortable
             filterable
             filterPlaceholder="Search accounts..."
             filterKeys={['code', 'name', 'category', 'subCategory']}
             containerClassName="rounded-lg"
           />
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">General Ledger Inquiry</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Account-level transaction history and balances</p>
           </div>
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected General Ledger Account</label>
                 <div className="relative">
                   <select 
                    value={selectedLedgerAccount}
                    onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10"
                   >
                      {coa?.map(acc => (
                         <option key={acc.code} value={acc.code}>{acc.code} - {acc.name} ({acc.category})</option>
                      ))}
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-left min-w-[160px]">
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
                 <div className="bg-blue-600 border border-indigo-500 p-4 rounded-lg text-left min-w-[200px] shadow-lg shadow-indigo-600/20">
                    <span className="text-[8px] font-black text-indigo-200 uppercase block mb-1">Functional Balance</span>
                    <span className="text-lg font-black text-white font-mono leading-none">
                      {formatAmount ? formatAmount(selectedAccountDetails?.balance || 0) : `$${selectedAccountDetails?.balance?.toLocaleString()}`}
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
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
              <DataTable
                columns={[
                  { key: 'date', label: 'Entry Date', render: (trx: any) => (
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                      {new Date(trx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  ) },
                  { key: 'id', label: 'ID / Ref', render: (trx: any) => (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{trx.id}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Ref: {trx.reference}</span>
                    </div>
                  ) },
                  { key: 'description', label: 'Description', render: (trx: any) => (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 max-w-[240px] truncate" title={trx.description}>{trx.description}</span>
                  ) },
                  { key: 'debit', label: 'Debit (+)', align: 'right' as const, render: (trx: any) => (
                    <span className="text-[10px] font-black text-emerald-600 font-mono">{trx.debit > 0 ? (formatAmount ? formatAmount(trx.debit) : `$${trx.debit.toLocaleString()}`) : '-'}</span>
                  ) },
                  { key: 'credit', label: 'Credit (-)', align: 'right' as const, render: (trx: any) => (
                    <span className="text-[10px] font-black text-rose-600 font-mono">{trx.credit > 0 ? (formatAmount ? formatAmount(trx.credit) : `$${trx.credit.toLocaleString()}`) : '-'}</span>
                  ) },
                  { key: 'runningBalance', label: 'Running Balance', align: 'right' as const, render: (trx: any) => (
                    <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono bg-slate-50/30 dark:bg-slate-700/20">{formatAmount ? formatAmount(trx.runningBalance) : `$${trx.runningBalance.toLocaleString()}`}</span>
                  ) },
                ] as Column<any>[]}
                data={ledgerEntries}
                rowKey={(trx: any, i: number) => trx.id || i}
                sortable
                filterable
                filterPlaceholder="Search ledger entries..."
                filterKeys={['id', 'reference', 'description']}
                containerClassName="rounded-lg border-0"
                emptyMessage="No transaction activity recorded for this period"
                emptyIcon={<ArrowRightLeft size={32} className="text-slate-300" />}
              />
              {ledgerEntries.length > 0 && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
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
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AP/AR Invoice Integration</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Billed transactions pending journal posting</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Unpaid Invoices', value: '$84,200', count: '12 Bills', color: 'text-rose-500', icon: Clock },
                { label: 'Total Billed (MTD)', value: '$520,400', count: '142 Invoices', color: 'text-indigo-500', icon: FileText },
                { label: 'Settled to GL', value: '$436,200', count: '92% Rate', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: 'Open Disputes', value: '$12,500', count: '3 cases', color: 'text-amber-500', icon: Menu },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div>
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Document Audit Registry</h4>
                 <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition">Category: All</button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition">Status: Active</button>
                 </div>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Document #', render: (inv: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{inv.id}</span> },
                  { key: 'type', label: 'Type', render: (inv: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${inv.type === 'Guest Folio' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{inv.type}</span>
                  ) },
                  { key: 'entity', label: 'Client / Vendor', render: (inv: any) => <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{inv.entity}</span> },
                  { key: 'date', label: 'Issued Date', render: (inv: any) => <span className="text-xs font-bold text-slate-500">{inv.date}</span> },
                  { key: 'net', label: 'Net Amount', align: 'right' as const, render: (inv: any) => <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${inv.net.toLocaleString()}</span> },
                  { key: 'tax', label: 'Tax', align: 'right' as const, render: (inv: any) => <span className="text-xs font-bold text-slate-400 font-mono">${inv.tax.toLocaleString()}</span> },
                  { key: 'gl', label: 'GL Status', render: (inv: any) => (
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${inv.gl === 'Posted' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{inv.gl}</span>
                      {inv.glRef !== '-' && <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{inv.glRef}</span>}
                    </div>
                  ) },
                ] as Column<any>[]}
                data={invoiceDocuments}
                rowKey={(inv: any) => inv.id}
                sortable
                filterable
                filterPlaceholder="Search documents..."
                filterKeys={['id', 'type', 'entity', 'gl']}
                onRowClick={(inv: any) => setSelectedInvoice(inv)}
                containerClassName="rounded-lg"
              />
           </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Recurring Journal Templates</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Automated periodic transaction schedules</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Templates', value: '8', count: 'Monthly/Weekly', color: 'text-indigo-500', icon: RotateCcw },
                { label: 'Next Run', value: 'Tomorrow', count: '3 Due', color: 'text-emerald-500', icon: Clock },
                { label: 'Generated This Month', value: '24', count: 'Journals', color: 'text-blue-500', icon: FileText },
                { label: 'Total Value', value: '$125k', count: 'Monthly', color: 'text-amber-500', icon: DollarSign },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <RotateCcw size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Recurring Journal Templates</h4>
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={12} /> New Template
                 </button>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Template ID', render: (rj: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{rj.id}</span> },
                  { key: 'name', label: 'Template Name', render: (rj: any) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rj.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{rj.description}</span>
                    </div>
                  ) },
                  { key: 'frequency', label: 'Frequency', render: (rj: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${rj.frequency === 'Monthly' ? 'bg-blue-50 text-blue-600' : rj.frequency === 'Weekly' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{rj.frequency}</span>
                  ) },
                  { key: 'nextRun', label: 'Next Run', render: (rj: any) => <span className="text-xs font-bold text-slate-500">{rj.nextRun}</span> },
                  { key: 'amount', label: 'Amount', align: 'right' as const, render: (rj: any) => <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${rj.amount.toLocaleString()}</span> },
                  { key: 'status', label: 'Status', render: (rj: any) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      rj.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>{rj.status}</span>
                  ) },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (rj: any) => (
                    <div className="flex justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Run Now"><Play size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Edit"><Settings size={14} /></button>
                    </div>
                  ) },
                ] as Column<any>[]}
                data={[
                  { id: 'RJ-001', name: 'Monthly Rent Accrual', description: 'Office rent expense accrual', frequency: 'Monthly', nextRun: '2024-06-01', amount: 15000, status: 'Active' },
                  { id: 'RJ-002', name: 'Payroll Accrual', description: 'Monthly payroll accrual', frequency: 'Monthly', nextRun: '2024-06-01', amount: 85000, status: 'Active' },
                  { id: 'RJ-003', name: 'Depreciation Entry', description: 'Fixed asset depreciation', frequency: 'Monthly', nextRun: '2024-06-01', amount: 12000, status: 'Active' },
                  { id: 'RJ-004', name: 'Insurance Premium', description: 'Quarterly insurance payment', frequency: 'Quarterly', nextRun: '2024-06-15', amount: 4500, status: 'Active' },
                  { id: 'RJ-005', name: 'Utility Accrual', description: 'Weekly utility expense accrual', frequency: 'Weekly', nextRun: '2024-06-03', amount: 2500, status: 'Active' },
                  { id: 'RJ-006', name: 'Subscription Renewal', description: 'Software subscription', frequency: 'Monthly', nextRun: '2024-06-10', amount: 1200, status: 'Paused' },
                ]}
                rowKey={(rj: any) => rj.id}
                sortable
                filterable
                filterPlaceholder="Search templates..."
                filterKeys={['id', 'name', 'description', 'frequency']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'periods' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Period Management</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Accounting period open/close controls</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Current Period', value: 'June 2024', count: 'Open', color: 'text-emerald-500', icon: Clock },
                { label: 'Closed Periods', value: '5', count: 'FY 2024', color: 'text-slate-500', icon: ShieldCheck },
                { label: 'Pending Close', value: 'May 2024', count: 'Ready', color: 'text-amber-500', icon: AlertCircle },
                { label: 'Fiscal Year', value: '2024', count: 'Jul-Jun', color: 'text-indigo-500', icon: Calendar },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Accounting Periods</h4>
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={12} /> New Period
                 </button>
              </div>
              <DataTable
                columns={[
                  { key: 'name', label: 'Period Name', render: (p: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span> },
                  { key: 'startDate', label: 'Start Date', render: (p: any) => <span className="text-xs font-bold text-slate-500">{p.startDate}</span> },
                  { key: 'endDate', label: 'End Date', render: (p: any) => <span className="text-xs font-bold text-slate-500">{p.endDate}</span> },
                  { key: 'status', label: 'Status', render: (p: any) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      p.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      p.status === 'Closed' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{p.status}</span>
                  ) },
                  { key: 'journalCount', label: 'Journals', align: 'right' as const, render: (p: any) => <span className="text-xs font-black text-slate-900 dark:text-white">{p.journalCount}</span> },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (p: any) => (
                    <div className="flex justify-center gap-1">
                      {p.status === 'Open' && (
                        <button className="px-2 py-1 text-[9px] font-black text-rose-600 hover:bg-rose-50 rounded transition" title="Close Period">Close</button>
                      )}
                      {p.status === 'Closed' && (
                        <button className="px-2 py-1 text-[9px] font-black text-amber-600 hover:bg-amber-50 rounded transition" title="Reopen Period">Reopen</button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                    </div>
                  ) },
                ] as Column<any>[]}
                data={[
                  { name: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-31', status: 'Closed', journalCount: 142 },
                  { name: 'February 2024', startDate: '2024-02-01', endDate: '2024-02-29', status: 'Closed', journalCount: 128 },
                  { name: 'March 2024', startDate: '2024-03-01', endDate: '2024-03-31', status: 'Closed', journalCount: 156 },
                  { name: 'April 2024', startDate: '2024-04-01', endDate: '2024-04-30', status: 'Closed', journalCount: 134 },
                  { name: 'May 2024', startDate: '2024-05-01', endDate: '2024-05-31', status: 'Pending Close', journalCount: 145 },
                  { name: 'June 2024', startDate: '2024-06-01', endDate: '2024-06-30', status: 'Open', journalCount: 89 },
                ]}
                rowKey={(p: any) => p.name}
                sortable
                filterable
                filterPlaceholder="Search periods..."
                filterKeys={['name', 'status']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'reversing' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Reversing Journals</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Transaction reversal entries and corrections</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Reversals', value: '3', count: 'This Month', color: 'text-amber-500', icon: RotateCcw },
                { label: 'Reversed This Month', value: '12', count: 'Journals', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: 'Total Reversed', value: '$45k', count: 'YTD', color: 'text-blue-500', icon: DollarSign },
                { label: 'Auto-Reversals', value: '8', count: 'Scheduled', color: 'text-indigo-500', icon: Clock },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <RotateCcw size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Reversing Journals</h4>
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={12} /> New Reversal
                 </button>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Journal ID', render: (rj: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{rj.id}</span> },
                  { key: 'originalJournal', label: 'Original Journal', render: (rj: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{rj.originalJournal}</span> },
                  { key: 'reason', label: 'Reversal Reason', render: (rj: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{rj.reason}</span> },
                  { key: 'reversalDate', label: 'Reversal Date', render: (rj: any) => <span className="text-xs font-bold text-slate-500">{rj.reversalDate}</span> },
                  { key: 'amount', label: 'Amount', align: 'right' as const, render: (rj: any) => <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${rj.amount.toLocaleString()}</span> },
                  { key: 'status', label: 'Status', render: (rj: any) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      rj.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      rj.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>{rj.status}</span>
                  ) },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (rj: any) => (
                    <div className="flex justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Post Now"><Send size={14} /></button>
                    </div>
                  ) },
                ] as Column<any>[]}
                data={[
                  { id: 'REV-2024-003', originalJournal: 'JV-2024-05-089', reason: 'Correction of accrual error', reversalDate: '2024-06-15', amount: 8500, status: 'Pending' },
                  { id: 'REV-2024-002', originalJournal: 'JV-2024-05-075', reason: 'Duplicate entry reversal', reversalDate: '2024-06-10', amount: 12400, status: 'Posted' },
                  { id: 'REV-2024-001', originalJournal: 'JV-2024-05-062', reason: 'Prepayment adjustment', reversalDate: '2024-06-05', amount: 5000, status: 'Posted' },
                ]}
                rowKey={(rj: any) => rj.id}
                sortable
                filterable
                filterPlaceholder="Search reversals..."
                filterKeys={['id', 'originalJournal', 'reason', 'status']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'adjusting' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Adjusting Journal Entries</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Period-end adjustments and accruals</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Adjustments', value: '5', count: 'Review Required', color: 'text-amber-500', icon: AlertCircle },
                { label: 'Posted This Month', value: '18', count: 'Adjustments', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: 'Total Adjusted', value: '$78k', count: 'YTD', color: 'text-blue-500', icon: DollarSign },
                { label: 'Auto-Adjustments', value: '6', count: 'System', color: 'text-indigo-500', icon: Settings },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <Settings size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Adjusting Journals</h4>
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={12} /> New Adjustment
                 </button>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Journal ID', render: (aj: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{aj.id}</span> },
                  { key: 'description', label: 'Description', render: (aj: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{aj.description}</span> },
                  { key: 'adjustmentType', label: 'Type', render: (aj: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      aj.adjustmentType === 'Accrual' ? 'bg-blue-50 text-blue-600' :
                      aj.adjustmentType === 'Deferral' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>{aj.adjustmentType}</span>
                  ) },
                  { key: 'amount', label: 'Amount', align: 'right' as const, render: (aj: any) => <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${aj.amount.toLocaleString()}</span> },
                  { key: 'createdBy', label: 'Created By', render: (aj: any) => <span className="text-xs font-bold text-slate-500">{aj.createdBy}</span> },
                  { key: 'status', label: 'Status', render: (aj: any) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      aj.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      aj.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>{aj.status}</span>
                  ) },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (aj: any) => (
                    <div className="flex justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Approve"><CheckCircle2 size={14} /></button>
                    </div>
                  ) },
                ] as Column<any>[]}
                data={[
                  { id: 'ADJ-2024-005', description: 'Q2 Revenue Adjustment', adjustmentType: 'Accrual', amount: 15000, createdBy: 'Sarah Accountant', status: 'Pending' },
                  { id: 'ADJ-2024-004', description: 'Prepaid Expense Deferral', adjustmentType: 'Deferral', amount: 8500, createdBy: 'John Doe', status: 'Posted' },
                  { id: 'ADJ-2024-003', description: 'Inventory Valuation Adjustment', adjustmentType: 'Correction', amount: 4200, createdBy: 'Michael Accountant', status: 'Posted' },
                  { id: 'ADJ-2024-002', description: 'Bad Debt Provision', adjustmentType: 'Accrual', amount: 12000, createdBy: 'Elena Finance', status: 'Posted' },
                  { id: 'ADJ-2024-001', description: 'Depreciation Adjustment', adjustmentType: 'Correction', amount: 3500, createdBy: 'Sarah Accountant', status: 'Posted' },
                ]}
                rowKey={(aj: any) => aj.id}
                sortable
                filterable
                filterPlaceholder="Search adjustments..."
                filterKeys={['id', 'description', 'adjustmentType', 'status']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'closing' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Year-End Closing Entries</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Fiscal year close and reset procedures</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Current FY', value: '2024', count: 'Jul-Jun', color: 'text-indigo-500', icon: Calendar },
                { label: 'Periods Closed', value: '5', count: 'of 12', color: 'text-emerald-500', icon: ShieldCheck },
                { label: 'Next Close', value: 'Jun 30', count: 'FY End', color: 'text-amber-500', icon: Clock },
                { label: 'Closing Entries', value: '24', count: 'Generated', color: 'text-blue-500', icon: FileText },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Closing Journals</h4>
                 </div>
                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={12} /> Generate Closing
                 </button>
              </div>
              <DataTable
                columns={[
                  { key: 'id', label: 'Journal ID', render: (cj: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{cj.id}</span> },
                  { key: 'period', label: 'Period', render: (cj: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{cj.period}</span> },
                  { key: 'closingType', label: 'Closing Type', render: (cj: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      cj.closingType === 'Month-End' ? 'bg-blue-50 text-blue-600' :
                      cj.closingType === 'Quarter-End' ? 'bg-purple-50 text-purple-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>{cj.closingType}</span>
                  ) },
                  { key: 'revenueClosed', label: 'Revenue Closed', align: 'right' as const, render: (cj: any) => <span className="text-xs font-black text-emerald-600 font-mono">${cj.revenueClosed.toLocaleString()}</span> },
                  { key: 'expenseClosed', label: 'Expense Closed', align: 'right' as const, render: (cj: any) => <span className="text-xs font-black text-rose-600 font-mono">${cj.expenseClosed.toLocaleString()}</span> },
                  { key: 'netIncome', label: 'Net Income', align: 'right' as const, render: (cj: any) => <span className="text-xs font-black text-indigo-600 font-mono">${cj.netIncome.toLocaleString()}</span> },
                  { key: 'status', label: 'Status', render: (cj: any) => (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      cj.status === 'Posted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{cj.status}</span>
                  ) },
                  { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (cj: any) => (
                    <div className="flex justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Post"><Send size={14} /></button>
                    </div>
                  ) },
                ] as Column<any>[]}
                data={[
                  { id: 'CL-2024-005', period: 'May 2024', closingType: 'Month-End', revenueClosed: 285000, expenseClosed: 245000, netIncome: 40000, status: 'Posted' },
                  { id: 'CL-2024-004', period: 'April 2024', closingType: 'Month-End', revenueClosed: 278000, expenseClosed: 238000, netIncome: 40000, status: 'Posted' },
                  { id: 'CL-2024-003', period: 'March 2024', closingType: 'Quarter-End', revenueClosed: 845000, expenseClosed: 715000, netIncome: 130000, status: 'Posted' },
                  { id: 'CL-2024-002', period: 'February 2024', closingType: 'Month-End', revenueClosed: 265000, expenseClosed: 228000, netIncome: 37000, status: 'Posted' },
                  { id: 'CL-2024-001', period: 'January 2024', closingType: 'Month-End', revenueClosed: 258000, expenseClosed: 222000, netIncome: 36000, status: 'Posted' },
                ]}
                rowKey={(cj: any) => cj.id}
                sortable
                filterable
                filterPlaceholder="Search closing entries..."
                filterKeys={['id', 'period', 'closingType', 'status']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'trial_balance' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Trial Balance Report</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Debit and credit balance verification</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Debits', value: '$1,245,000', sub: 'As of Jun 30', color: 'text-emerald-500', icon: ArrowUpRight },
                { label: 'Total Credits', value: '$1,245,000', sub: 'Balanced', color: 'text-blue-500', icon: ArrowDownRight },
                { label: 'Net Balance', value: '$0', sub: 'In Balance', color: 'text-indigo-500', icon: CheckCircle2 },
                { label: 'Accounts', value: '142', sub: 'Active', color: 'text-slate-500', icon: FileText },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
                      <stat.icon size={20} />
                   </div>
                   <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.sub}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <FileText size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Trial Balance Report</h4>
                 </div>
                 <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition flex items-center gap-2">
                    <Download size={12} /> Export
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Printer size={12} /> Print
                  </button>
                 </div>
              </div>
              <DataTable
                columns={[
                  { key: 'accountCode', label: 'Account Code', render: (tb: any) => <span className="text-xs font-mono text-slate-500">{tb.accountCode}</span> },
                  { key: 'accountName', label: 'Account Name', render: (tb: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{tb.accountName}</span> },
                  { key: 'accountType', label: 'Type', render: (tb: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      tb.accountType === 'Asset' ? 'bg-emerald-50 text-emerald-600' :
                      tb.accountType === 'Liability' ? 'bg-rose-50 text-rose-600' :
                      tb.accountType === 'Equity' ? 'bg-blue-50 text-blue-600' :
                      tb.accountType === 'Revenue' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>{tb.accountType}</span>
                  ) },
                  { key: 'debit', label: 'Debit', align: 'right' as const, render: (tb: any) => <span className="text-xs font-black text-emerald-600 font-mono">{tb.debit ? `$${tb.debit.toLocaleString()}` : '-'}</span> },
                  { key: 'credit', label: 'Credit', align: 'right' as const, render: (tb: any) => <span className="text-xs font-black text-rose-600 font-mono">{tb.credit ? `$${tb.credit.toLocaleString()}` : '-'}</span> },
                  { key: 'balance', label: 'Balance', align: 'right' as const, render: (tb: any) => <span className="text-xs font-black text-indigo-600 font-mono">${tb.balance.toLocaleString()}</span> },
                ] as Column<any>[]}
                data={[
                  { accountCode: '1010', accountName: 'Cash on Hand', accountType: 'Asset', debit: 125000, credit: 0, balance: 125000 },
                  { accountCode: '1020', accountName: 'Bank Accounts', accountType: 'Asset', debit: 485000, credit: 0, balance: 485000 },
                  { accountCode: '1030', accountName: 'Accounts Receivable', accountType: 'Asset', debit: 85000, credit: 0, balance: 85000 },
                  { accountCode: '1510', accountName: 'Prepaid Expenses', accountType: 'Asset', debit: 25000, credit: 0, balance: 25000 },
                  { accountCode: '2010', accountName: 'Accounts Payable', accountType: 'Liability', debit: 0, credit: 95000, balance: -95000 },
                  { accountCode: '2020', accountName: 'Accrued Expenses', accountType: 'Liability', debit: 0, credit: 35000, balance: -35000 },
                  { accountCode: '3010', accountName: 'Owner Equity', accountType: 'Equity', debit: 0, credit: 500000, balance: -500000 },
                  { accountCode: '4010', accountName: 'Room Revenue', accountType: 'Revenue', debit: 0, credit: 285000, balance: -285000 },
                  { accountCode: '4020', accountName: 'F&B Revenue', accountType: 'Revenue', debit: 0, credit: 125000, balance: -125000 },
                  { accountCode: '5010', accountName: 'Room Operations', accountType: 'Expense', debit: 145000, credit: 0, balance: 145000 },
                  { accountCode: '5020', accountName: 'F&B Cost', accountType: 'Expense', debit: 65000, credit: 0, balance: 65000 },
                  { accountCode: '5030', accountName: 'Staff Salaries', accountType: 'Expense', debit: 85000, credit: 0, balance: 85000 },
                  { accountCode: '5040', accountName: 'Utilities', accountType: 'Expense', debit: 25000, credit: 0, balance: 25000 },
                  { accountCode: '5050', accountName: 'Maintenance', accountType: 'Expense', debit: 15000, credit: 0, balance: 15000 },
                ]}
                rowKey={(tb: any) => tb.accountCode}
                sortable
                filterable
                filterPlaceholder="Search accounts..."
                filterKeys={['accountCode', 'accountName', 'accountType']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      {activeTab === 'audit_trail' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal Audit Trail</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Complete transaction history and changes</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Entries', value: '1,245', count: 'This Month', color: 'text-indigo-500', icon: FileText },
                { label: 'Posted Today', value: '23', count: 'Journals', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: 'Pending Review', value: '5', count: 'Entries', color: 'text-amber-500', icon: Clock },
                { label: 'Modified', value: '12', count: 'Revisions', color: 'text-rose-500', icon: AlertCircle },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
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

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20">
                 <div className="flex items-center gap-3">
                    <History size={16} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Journal Audit Trail</h4>
                 </div>
                 <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition flex items-center gap-2">
                    <Filter size={12} /> Filter
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition flex items-center gap-2">
                    <Download size={12} /> Export
                  </button>
                 </div>
              </div>
              <DataTable
                columns={[
                  { key: 'timestamp', label: 'Timestamp', render: (at: any) => <span className="text-xs font-bold text-slate-500">{at.timestamp}</span> },
                  { key: 'journalId', label: 'Journal ID', render: (at: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{at.journalId}</span> },
                  { key: 'action', label: 'Action', render: (at: any) => (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      at.action === 'Created' ? 'bg-emerald-50 text-emerald-600' :
                      at.action === 'Posted' ? 'bg-blue-50 text-blue-600' :
                      at.action === 'Modified' ? 'bg-amber-50 text-amber-600' :
                      at.action === 'Reversed' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>{at.action}</span>
                  ) },
                  { key: 'description', label: 'Description', render: (at: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{at.description}</span> },
                  { key: 'amount', label: 'Amount', align: 'right' as const, render: (at: any) => <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${at.amount.toLocaleString()}</span> },
                  { key: 'user', label: 'User', render: (at: any) => <span className="text-xs font-bold text-slate-500">{at.user}</span> },
                  { key: 'ipAddress', label: 'IP Address', render: (at: any) => <span className="text-[10px] font-mono text-slate-400">{at.ipAddress}</span> },
                ] as Column<any>[]}
                data={[
                  { timestamp: '2024-06-30 14:32:15', journalId: 'JV-2024-06-089', action: 'Posted', description: 'Monthly rent payment', amount: 15000, user: 'Sarah Accountant', ipAddress: '192.168.1.45' },
                  { timestamp: '2024-06-30 14:28:42', journalId: 'JV-2024-06-088', action: 'Created', description: 'Utility expense accrual', amount: 4500, user: 'John Doe', ipAddress: '192.168.1.46' },
                  { timestamp: '2024-06-30 14:15:33', journalId: 'JV-2024-06-087', action: 'Modified', description: 'Correction of entry amount', amount: 8500, user: 'Michael Accountant', ipAddress: '192.168.1.47' },
                  { timestamp: '2024-06-30 13:45:21', journalId: 'REV-2024-003', action: 'Reversed', description: 'Reversal of JV-2024-05-089', amount: 8500, user: 'Elena Finance', ipAddress: '192.168.1.48' },
                  { timestamp: '2024-06-30 13:22:18', journalId: 'JV-2024-06-086', action: 'Posted', description: 'Payroll disbursement', amount: 85000, user: 'Sarah Accountant', ipAddress: '192.168.1.45' },
                  { timestamp: '2024-06-30 12:55:07', journalId: 'JV-2024-06-085', action: 'Created', description: 'Accounts receivable posting', amount: 12500, user: 'John Doe', ipAddress: '192.168.1.46' },
                  { timestamp: '2024-06-30 12:30:45', journalId: 'JV-2024-06-084', action: 'Posted', description: 'Vendor payment processing', amount: 24500, user: 'Michael Accountant', ipAddress: '192.168.1.47' },
                  { timestamp: '2024-06-30 11:15:33', journalId: 'ADJ-2024-005', action: 'Created', description: 'Q2 revenue adjustment', amount: 15000, user: 'Elena Finance', ipAddress: '192.168.1.48' },
                ]}
                rowKey={(at: any) => at.journalId + at.timestamp}
                sortable
                filterable
                filterPlaceholder="Search audit trail..."
                filterKeys={['journalId', 'action', 'description', 'user']}
                containerClassName="rounded-lg border-0"
              />
           </div>
        </div>
      )}

      <ModalSystem
        isOpen={!!selectedJournal}
        onClose={() => setSelectedJournal(null)}
        title={selectedJournal?.id ?? ''}
        subtitle={`Reference: ${selectedJournal?.reference ?? ''}`}
        variant="info"
        size="xl"
        showFooter={false}
      >
              <div className="p-6 space-y-6 overflow-y-auto print-area">
                 <div className="grid grid-cols-3 gap-6 text-[11px]">
                    <div>
                       <span className="text-slate-400 uppercase font-black block mb-1">Entry Date</span>
                       <span className="font-bold text-slate-900 dark:text-white">{selectedJournal?.date || '-'}</span>
                    </div>
                    <div>
                       <span className="text-slate-400 uppercase font-black block mb-1">Created By</span>
                       <span className="font-bold text-slate-900 dark:text-white">{selectedJournal?.createdBy || '-'}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-slate-400 uppercase font-black block mb-1">Total Amount</span>
                       <span className="font-black text-indigo-600">{formatAmount ? formatAmount(selectedJournal?.amount || 0) : `$${selectedJournal?.amount?.toLocaleString() || 0}`}</span>
                    </div>
                 </div>

                 {/* Approval Workflow Info */}
                 {selectedJournal && (selectedJournal.status === 'Approved' || selectedJournal.status === 'Posted') && (
                   <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                         <UserCheck size={16} className="text-blue-600" />
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Approval Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                         <div>
                            <span className="text-slate-500 uppercase font-black block mb-1">Approved By</span>
                            <span className="font-bold text-slate-900 dark:text-white">{selectedJournal.approvedBy || 'Finance Manager'}</span>
                         </div>
                         <div>
                            <span className="text-slate-500 uppercase font-black block mb-1">Approved At</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedJournal.approvedAt ? new Date(selectedJournal.approvedAt).toLocaleString() : '-'}
                            </span>
                         </div>
                      </div>
                   </div>
                 )}

                 {selectedJournal && selectedJournal.status === 'Posted' && (
                   <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                         <ShieldCheck size={16} className="text-emerald-600" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Posting Information</span>
                      </div>
                      <div className="text-[10px]">
                         <span className="text-slate-500 uppercase font-black block mb-1">Posted At</span>
                         <span className="font-bold text-slate-900 dark:text-white">
                           {selectedJournal.postedAt ? new Date(selectedJournal.postedAt).toLocaleString() : '-'}
                         </span>
                      </div>
                   </div>
                 )}

                 {selectedJournal && (
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Entry Description</h4>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                         {selectedJournal.description || '-'}
                      </p>
                   </div>
                 )}

                 {selectedJournal && (
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Ledger Lines</h4>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="bg-slate-50/50 dark:bg-slate-700/20">
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
                            <tfoot className="bg-slate-50/50 dark:bg-slate-700/20 border-t border-slate-200 dark:border-slate-700">
                               <tr className="text-[10px] font-black">
                                  <td colSpan={2} className="px-4 py-3 uppercase">Total</td>
                                  <td className="px-4 py-3 text-right text-indigo-600">{formatAmount ? formatAmount(selectedJournal.amount || 0) : `$${selectedJournal.amount?.toLocaleString()}`}</td>
                                  <td className="px-4 py-3 text-right text-indigo-600">{formatAmount ? formatAmount(selectedJournal.amount || 0) : `$${selectedJournal.amount?.toLocaleString()}`}</td>
                               </tr>
                            </tfoot>
                         </table>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-700/20 no-print">
                 <div className="flex gap-2">
                    {selectedJournal && selectedJournal.status === 'Draft' && (
                      <button 
                        onClick={() => handleSubmitForApproval(selectedJournal)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                      >
                        <Send size={14} /> Submit for Approval
                      </button>
                    )}
                    {selectedJournal && selectedJournal.status === 'Pending Approval' && (
                      <button 
                        onClick={() => handleApproveJournal(selectedJournal)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                      >
                        <UserCheck size={14} /> Approve Journal
                      </button>
                    )}
                    {selectedJournal && selectedJournal.status === 'Approved' && (
                      <button 
                        onClick={() => handlePostJournal(selectedJournal)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                      >
                        <ShieldCheck size={14} /> Post to GL
                      </button>
                    )}
                    {selectedJournal && selectedJournal.status === 'Posted' && (
                      <button
                        onClick={() => handleReverseJournal(selectedJournal)}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                      >
                        <RotateCcw size={14} /> Reverse Journal
                      </button>
                    )}
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => window.print()}
                      className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                      <Download size={14} /> Print Voucher
                    </button>
                    <button 
                      onClick={() => setSelectedJournal(null)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition"
                    >
                      Close View
                    </button>
                 </div>
              </div>
      </ModalSystem>

      <ModalSystem
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.id ?? ''}
        subtitle={`Document Audit Trail • Issued ${selectedInvoice?.date ?? ''}`}
        variant="info"
        size="xl"
        showFooter={false}
      >
            {selectedInvoice && (
              <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entity Description</span>
                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{selectedInvoice?.entity || '-'}</p>
                   <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Primary Billing Recipient</p>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">GL Posting Status</span>
                   <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        selectedInvoice?.gl === 'Posted' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedInvoice?.gl || '-'}
                      </span>
                      {selectedInvoice?.glRef && selectedInvoice.glRef !== '-' && <span className="text-[9px] font-black text-indigo-600 font-mono italic">Ref: {selectedInvoice.glRef}</span>}
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Document Line Breakdown</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedInvoice.items?.length || 0} Items</span>
                 </div>
                 <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
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

              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-6 border border-slate-100 dark:border-slate-700">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                       <span>Net Transaction Amount</span>
                       <span className="font-mono text-slate-900 dark:text-white">${(selectedInvoice?.net || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                       <span>Sales Tax / VAT (15%)</span>
                       <span className="font-mono text-slate-900 dark:text-white">${(selectedInvoice?.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                    <div className="flex justify-between items-center font-black uppercase">
                       <span className="text-xs text-slate-900 dark:text-white">Gross Revenue Impact</span>
                       <span className="text-xl text-indigo-600 font-mono">${((selectedInvoice?.net || 0) + (selectedInvoice?.tax || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition hover:opacity-90 shadow-xl shadow-slate-900/20 dark:shadow-none flex items-center justify-center gap-2">
                    <Download size={14} /> Download PDF
                 </button>
                 <button className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition hover:bg-slate-50 flex items-center justify-center gap-2">
                    <ArrowRightLeft size={14} /> View GL Entry
                 </button>
              </div>
            </div>
            )}
      </ModalSystem>
    </div>
  );
};

export default GeneralLedger;
