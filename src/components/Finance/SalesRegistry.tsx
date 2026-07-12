import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { toISODate } from '../../utils/date';
import { 
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  X,
  Printer,
  Calendar,
  User,
  CreditCard,
  Hash,
  TrendingUp,
  Banknote,
  Building,
  ArrowUpDown,
  Package,
  RefreshCw,
  Plus,
  Clock,
  ArrowRight
} from 'lucide-react';

type SalesTab = 'transactions' | 'allotments';

export default function SalesRegistry() {
  const { salesTransactions, journals, addJournalEntry, addNotification, formatAmount, chartOfAccounts } = useERP();
  const [activeTab, setActiveTab] = useState<SalesTab>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [filterModule, setFilterModule] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Posted' | 'Unposted'>('All');
  const [showRoomCharges, setShowRoomCharges] = useState<boolean>(false);
  const [targetBankCode, setTargetBankCode] = useState('1020');

  // Allotments state (B2B)
  const [allotments, setAllotments] = useState<any[]>([]);
  const [loadingAllotments, setLoadingAllotments] = useState(false);

  const fetchAllotments = async () => {
    setLoadingAllotments(true);
    try {
      const r = await fetch('/api/b2b/allotments', { credentials: 'include' });
      if (r.ok) setAllotments(await r.json());
    } catch {}
    setLoadingAllotments(false);
  };

  React.useEffect(() => { if (activeTab === 'allotments') fetchAllotments(); }, [activeTab]);

  // Filter COA for bank accounts
  const bankAccounts = React.useMemo(() => 
    chartOfAccounts?.filter(a => a.subCategory === 'Bank') || [], 
    [chartOfAccounts]
  );
  
  // Date Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selection state for batch posting
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // View state
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Determine posting status for each transaction
  const enrichedTransactions = useMemo(() => {
    return salesTransactions.map(tx => {
      const isPosted = journals.some(je => 
        je.reference === tx.invoiceNumber || (je.description && je.description.includes(tx.invoiceNumber))
      );
      return { ...tx, isPosted };
    });
  }, [salesTransactions, journals]);

  const filteredTransactions = useMemo(() => {
    return enrichedTransactions.filter(tx => {
      const matchSearch = tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPayment = filterPayment === 'All' || tx.paymentMethod === filterPayment;
      const matchModule = filterModule === 'All' || tx.module === filterModule;
      const matchStatus = filterStatus === 'All' || 
                         (filterStatus === 'Posted' ? tx.isPosted : !tx.isPosted);
      
      const matchFolio = showRoomCharges || tx.paymentMethod !== 'Room Charge';
      
      const txDate = toISODate(new Date(tx.date));
      const matchStart = !startDate || txDate >= startDate;
      const matchEnd = !endDate || txDate <= endDate;
      
      return matchSearch && matchPayment && matchModule && matchStatus && matchFolio && matchStart && matchEnd;
    });
  }, [enrichedTransactions, searchTerm, filterPayment, filterModule, filterStatus, showRoomCharges, startDate, endDate]);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchPost = () => {
    if (selectedItems.length === 0) return;
    setIsPosting(true);

    // Filter only those that are NOT yet posted
    const toPost = enrichedTransactions.filter(tx => selectedItems.includes(tx.id) && !tx.isPosted);
    
    if (toPost.length === 0) {
      addNotification('Selected items are already posted or invalid.', 'warning', 'Finance');
      setIsPosting(false);
      return;
    }

    // Simulate batch processing delay
    setTimeout(() => {
      toPost.forEach(tx => {
        // Map Revenue Account (Credit)
        const creditAccountCode = tx.module === 'F&B POS' ? '4020' :
                                tx.module === 'Gift Shop' ? '4030' : '4010';
        const creditAccountName = tx.module === 'F&B POS' ? 'F&B Revenue' :
                                 tx.module === 'Gift Shop' ? 'Gift Shop Revenue' : 'General Sales Revenue';

        const lines: any[] = [];

        // Find target bank details
        const selectedBank = bankAccounts.find(a => a.code === targetBankCode) || bankAccounts[0];
        const defaultBankCode = selectedBank?.code || '1020';
        const defaultBankName = selectedBank?.name || 'Operating Bank A/C';

        // Determine Debit Lines
        if (tx.splitPayments && tx.splitPayments.length > 0) {
          tx.splitPayments.forEach((sp, idx) => {
            const isCash = sp.method.toLowerCase().includes('cash');
            lines.push({
              id: `JL-${tx.id}-D-${idx}`,
              accountId: isCash ? '1010' : defaultBankCode,
              accountName: isCash ? 'Cash on Hand' : defaultBankName,
              description: `Split Payment [${sp.method}] for ${tx.invoiceNumber}`,
              debit: sp.amount,
              credit: 0
            });
          });
        } else {
          // Single Payment Method
          let debitAccountCode = defaultBankCode;
          let debitAccountName = defaultBankName;
          
          if (tx.paymentMethod.toLowerCase().includes('cash')) {
            debitAccountCode = '1010';
            debitAccountName = 'Cash on Hand';
          } else if (tx.paymentMethod.toLowerCase().includes('room charge')) {
            debitAccountCode = '1100';
            debitAccountName = 'Accounts Receivable';
          }

          lines.push({
            id: `JL-${tx.id}-D-0`,
            accountId: debitAccountCode,
            accountName: debitAccountName,
            description: `Payment for ${tx.invoiceNumber} via ${tx.paymentMethod}`,
            debit: tx.total,
            credit: 0
          });
        }

        // Add Revenue Credit Line
        lines.push({
          id: `JL-${tx.id}-C-0`,
          accountId: creditAccountCode,
          accountName: creditAccountName,
          description: `Revenue recognition: ${tx.invoiceNumber} (${tx.module})`,
          debit: 0,
          credit: tx.total
        });

        addJournalEntry({
          date: toISODate(),
          description: `Posting: ${tx.module} Sale | ${tx.invoiceNumber} | ${tx.customerName}`,
          reference: tx.invoiceNumber,
          status: 'Posted',
          createdBy: 'SYSTEM_SALES_AUTO',
          amount: tx.total,
          lines: lines
        });
      });

      addNotification(`Successfully posted ${toPost.length} transactions to General Ledger`, 'success', 'Finance');
      setSelectedItems([]);
      setIsPosting(false);
    }, 1200);
  };

  const uniquePaymentMethods = useMemo(() => ['All', ...Array.from(new Set(salesTransactions.map(t => t.paymentMethod)))], [salesTransactions]);
  const uniqueModules = useMemo(() => ['All', ...Array.from(new Set(salesTransactions.map(t => t.module)))], [salesTransactions]);

  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const cash = filteredTransactions.filter(t => t.paymentMethod.includes('Cash')).reduce((acc, curr) => acc + curr.total, 0);
    const bank = filteredTransactions.filter(t => t.paymentMethod.includes('Credit Card') || t.paymentMethod.includes('Bank') || t.paymentMethod.includes('Mobile')).reduce((acc, curr) => acc + curr.total, 0);
    const room = filteredTransactions.filter(t => t.paymentMethod.includes('Room Charge')).reduce((acc, curr) => acc + curr.total, 0);
    
    return { total, cash, bank, room };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button onClick={() => setActiveTab('transactions')} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${activeTab === 'transactions' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Receipt size={14} /> Transactions
        </button>
        <button onClick={() => setActiveTab('allotments')} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${activeTab === 'allotments' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Package size={14} /> Allotments (B2B)
        </button>
      </div>

      {activeTab === 'transactions' && (
        <>
      {/* Financial Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[24px] shadow-3xs group hover:border-emerald-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl">
                <TrendingUp size={18} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase">Gross Revenue</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Collections</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatAmount(stats.total)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[24px] shadow-3xs group hover:border-indigo-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
                <Banknote size={18} />
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase">Liquid Cash</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Physical Currency</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatAmount(stats.cash)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[24px] shadow-3xs group hover:border-sky-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-sky-50 dark:bg-sky-500/10 text-sky-600 rounded-xl">
                <CreditCard size={18} />
              </div>
              <span className="text-[10px] font-black text-sky-500 uppercase">Digital / Bank</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Card & Transfers</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatAmount(stats.bank)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[24px] shadow-3xs group hover:border-amber-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-xl">
                <Building size={18} />
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase">City Ledger</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Room Charges / AR</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatAmount(stats.room)}</h2>
        </div>
      </div>
      
      {/* Registry Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Filter size={14} className="text-indigo-600" />
             Registry Controls
           </h3>
           <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Calendar size={12} className="text-slate-400" />
                <input 
                   type="date" 
                   value={startDate} 
                   onChange={e => setStartDate(e.target.value)}
                   className="bg-transparent border-none text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none w-28"
                />
                <span className="text-slate-300">to</span>
                <input 
                   type="date" 
                   value={endDate} 
                   onChange={e => setEndDate(e.target.value)}
                   className="bg-transparent border-none text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none w-28"
                />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-1 hover:text-rose-500 transition">
                    <X size={12} />
                  </button>
                )}
              </div>
              <select 
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="All">All Status</option>
                <option value="Posted">Posted to GL</option>
                <option value="Unposted">Unposted</option>
              </select>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Include Folio</span>
                <button 
                  onClick={() => setShowRoomCharges(!showRoomCharges)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${showRoomCharges ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showRoomCharges ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterPayment('All');
                  setFilterModule('All');
                  setFilterStatus('All');
                  setShowRoomCharges(false);
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[10px] font-black text-slate-400 uppercase hover:text-indigo-600 transition"
              >
                Reset All
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search Invoice or Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
           </div>
           <div>
             <select 
               value={filterPayment}
               onChange={(e) => setFilterPayment(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-sans font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
             >
               {uniquePaymentMethods.map(pm => <option key={pm} value={pm}>{pm === 'All' ? 'Settlement Method: All' : pm}</option>)}
             </select>
           </div>
           <div>
             <select 
               value={filterModule}
               onChange={(e) => setFilterModule(e.target.value)}
               className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-sans font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
             >
               {uniqueModules.map(mod => <option key={mod} value={mod}>{mod === 'All' ? 'Origin Module: All' : mod}</option>)}
             </select>
           </div>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs flex flex-col">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sales & Remittance Log</h3>
             {selectedItems.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full"
               >
                 <span className="text-[10px] font-black uppercase">{selectedItems.length} Selected</span>
                 <div className="flex items-center gap-2 border-l border-white/20 pl-3 ml-1">
                   <span className="text-[8px] font-black uppercase opacity-70">To Bank:</span>
                   <select 
                     disabled={isPosting}
                     value={targetBankCode}
                     onChange={(e) => setTargetBankCode(e.target.value)}
                     className="bg-white/10 hover:bg-white/20 border-none outline-none text-[10px] font-black uppercase rounded px-2 py-0.5 cursor-pointer max-w-[120px]"
                   >
                     {bankAccounts.map(acc => (
                       <option key={acc.code} value={acc.code} className="text-slate-900">{acc.name}</option>
                     ))}
                   </select>
                 </div>
                 <button 
                  disabled={isPosting}
                  onClick={handleBatchPost}
                  className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[9px] font-black uppercase transition flex items-center gap-1"
                 >
                   {isPosting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Banknote size={10} /></motion.div> : <TrendingUp size={10} />}
                   {isPosting ? 'Posting...' : 'Post Batch to GL'}
                 </button>
                 <button onClick={() => setSelectedItems([])} className="p-0.5 hover:bg-white/10 rounded">
                   <X size={12} />
                 </button>
               </motion.div>
             )}
           </div>
           <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase transition hover:bg-indigo-100">
             <Download size={14} /> Export Register
           </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-xs uppercase font-bold tracking-widest">No matching sales entries</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 w-10">
                    <div 
                      className={`w-4 h-4 rounded border-2 cursor-pointer transition-colors flex items-center justify-center ${selectedItems.length === filteredTransactions.length ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-white'}`}
                      onClick={() => {
                        if (selectedItems.length === filteredTransactions.length) setSelectedItems([]);
                        else setSelectedItems(filteredTransactions.map(t => t.id));
                      }}
                    >
                      {selectedItems.length === filteredTransactions.length && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice Ref</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Origin</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredTransactions.map(tx => (
                  <tr 
                    key={tx.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${selectedItems.includes(tx.id) ? 'bg-indigo-50/20' : ''}`}
                  >
                    <td className="px-6 py-3">
                       <div 
                        className={`w-4 h-4 rounded border-2 cursor-pointer transition-colors flex items-center justify-center ${selectedItems.includes(tx.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-white'}`}
                        onClick={() => toggleSelection(tx.id)}
                      >
                        {selectedItems.includes(tx.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <div className="flex justify-center">
                         {tx.isPosted ? (
                           <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Posted to GL" />
                         ) : (
                           <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" title="Not Posted" />
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline decoration-indigo-400 underline-offset-2"
                      >
                        {tx.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-6 py-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">{new Date(tx.date).toLocaleString()}</td>
                    <td className="px-6 py-3 text-[11px] font-bold text-slate-800 dark:text-slate-200">{tx.customerName}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded">
                        {tx.module}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono font-black text-slate-900 dark:text-white text-right">
                      {formatAmount(tx.total)}
                    </td>
                    <td className="px-6 py-3 text-center">
                       {tx.splitPayments && tx.splitPayments.length > 0 ? (
                         <div className="flex flex-col items-center gap-1">
                           {tx.splitPayments.map((sp, idx) => (
                             <span key={idx} className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${
                               sp.method.includes('Cash') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                             }`}>
                               {sp.method}: {formatAmount(sp.amount)}
                             </span>
                           ))}
                         </div>
                       ) : (
                         <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                           tx.paymentMethod.includes('Cash') ? 'bg-emerald-50 text-emerald-600' :
                           tx.paymentMethod.includes('Room Charge') ? 'bg-amber-50 text-amber-600' :
                           'bg-blue-50 text-blue-600'
                         }`}>
                           {tx.paymentMethod}
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-3 text-right">
                       <div className="flex justify-end gap-2 group-hover:opacity-100 opacity-20 transition-opacity">
                         <button onClick={() => setSelectedTx(tx)} className="p-1.5 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition" title="View Details">
                           <Eye size={14} />
                         </button>
                         {!tx.paymentMethod.includes('Room Charge') && (
                           <>
                             <button className="p-1.5 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition" title="Print Receipt">
                               <Printer size={14} />
                             </button>
                             <button className="p-1.5 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition" title="Email Invoice">
                               <FileText size={14} />
                             </button>
                           </>
                         )}
                         {tx.paymentMethod.includes('Room Charge') && (
                           <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded text-[9px] font-black uppercase">
                             <Building size={10} /> Folio Item
                           </div>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal - Enhanced Invoice View */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTx(null)}>
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-[40px] shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <Receipt size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Invoice Details</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">Settled</span>
                    <span className="text-[10px] font-mono text-slate-400">#{selectedTx.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-850 rounded-3xl">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Invoice Number</label>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{selectedTx.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Billing Date</label>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(selectedTx.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</label>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedTx.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Origin Module</label>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedTx.module}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-8">
                 <div className="flex items-center gap-2 mb-3">
                   <User size={14} className="text-indigo-600" />
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Issuer</h5>
                 </div>
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTx.customerName}</p>
                     <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold">Primary Account Holder</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Served by {selectedTx.cashierName}</p>
                     <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">Authorized Station Representative</p>
                   </div>
                 </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product / Service</th>
                      <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Qty</th>
                      <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Unit Price</th>
                      <th className="pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {selectedTx.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">{it.productName}</td>
                        <td className="py-3 text-[11px] font-mono text-center text-slate-500">{it.quantity}</td>
                        <td className="py-3 text-[11px] font-mono text-right text-slate-500">{formatAmount(it.price)}</td>
                        <td className="py-3 text-[11px] font-mono font-bold text-slate-900 dark:text-white text-right">{formatAmount(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 uppercase font-black tracking-widest">Subtotal</span>
                    <span className="font-mono text-slate-600 font-bold">{formatAmount(selectedTx.subtotal)}</span>
                  </div>
                  {selectedTx.discount && selectedTx.discount > 0 && (
                    <div className="flex justify-between text-[11px] text-rose-500">
                      <span className="uppercase font-black tracking-widest">Discount Applied</span>
                      <span className="font-mono font-bold">-{formatAmount(selectedTx.discount)}</span>
                    </div>
                  )}
                  {selectedTx.serviceCharge && selectedTx.serviceCharge > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 uppercase font-black tracking-widest">Service Charge</span>
                      <span className="font-mono text-slate-600 font-bold">{formatAmount(selectedTx.serviceCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 uppercase font-black tracking-widest">Tax (VAT 15%)</span>
                    <span className="font-mono text-slate-600 font-bold">{formatAmount(selectedTx.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Invoice Grand Total</span>
                    <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{formatAmount(selectedTx.total)}</span>
                  </div>
                  {selectedTx.splitPayments && selectedTx.splitPayments.length > 0 && (
                    <div className="pt-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Split Payment Breakdown</p>
                       {selectedTx.splitPayments.map((sp: any, idx: number) => (
                         <div key={idx} className="flex justify-between text-[10px] font-mono text-slate-500 py-0.5">
                           <span>{sp.method}</span>
                           <span className="font-bold">{formatAmount(sp.amount)}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-850 flex flex-wrap gap-4">
               {!selectedTx.paymentMethod.includes('Room Charge') ? (
                 <>
                   <button className="flex-1 min-w-[140px] py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                     <Printer size={14} /> Print Hardcopy
                   </button>
                   <button className="flex-1 min-w-[140px] py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-2">
                     <Download size={14} /> Save Digital PDF
                   </button>
                 </>
               ) : (
                 <div className="flex-1 min-w-[140px] py-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-100 dark:border-amber-900/30">
                   <Building size={14} /> This item is billed to guest folio and invoiced at check-out
                 </div>
               )}
               <button className="flex-1 min-w-[140px] py-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/40">
                 <X size={14} /> Void Invoice
               </button>
               <button className="flex-1 min-w-[140px] py-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-950/40 transition flex items-center justify-center gap-2 border border-amber-100 dark:border-amber-900/40">
                 <Receipt size={14} /> Adjust Settlement
               </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'allotments' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 text-center">
            <Package size={48} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-3" />
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Tour Operator Allotments</h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-4">Manage room blocks, pickup status, and release expired allotments</p>
            <button onClick={() => window.location.hash = '#executive-pricing_revenue'} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 mx-auto hover:bg-indigo-700">
              <ArrowRight size={14} /> Open Pricing & Revenue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
