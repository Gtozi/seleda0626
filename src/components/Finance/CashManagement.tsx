import React, { useMemo, useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  Landmark,
  CreditCard,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Plus,
  ArrowRightLeft,
  X,
  Trash2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { motion, AnimatePresence } from 'motion/react';

const CashManagement = () => {
  const { journals, chartOfAccounts, formatAmount, addAccount, deleteAccount } = useERP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAcc, setNewAcc] = useState({
    name: '',
    code: '',
    type: 'Bank',
    balance: 0
  });

  // Find all Cash and Bank accounts from COA
  const treasuryAccounts = useMemo(() => chartOfAccounts.filter(a => a.subCategory === 'Cash' || a.subCategory === 'Bank'), [chartOfAccounts]);
  const cashAccounts = useMemo(() => chartOfAccounts.filter(a => a.subCategory === 'Cash'), [chartOfAccounts]);
  const bankAccounts = useMemo(() => chartOfAccounts.filter(a => a.subCategory === 'Bank'), [chartOfAccounts]);

  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.code) return;

    if (chartOfAccounts.some(a => a.code === newAcc.code)) {
      alert(`Account code ${newAcc.code} already exists in the Chart of Accounts.`);
      return;
    }

    setIsConnecting(true);
    
    // Simulate real connection time
    setTimeout(() => {
      addAccount({
        id: Math.random().toString(36).substr(2, 9),
        code: newAcc.code,
        name: newAcc.name,
        category: 'Asset',
        subCategory: newAcc.type,
        balance: Number(newAcc.balance),
        currency: 'USD',
        isActive: true
      });
      setIsConnecting(false);
      setShowAddModal(false);
      setNewAcc({ name: '', code: '', type: 'Bank', balance: 0 });
    }, 2000);
  };

  // Derive Treasury Transactions from Journals
  const treasuryTransactions = useMemo(() => {
    const txs: any[] = [];
    const treasuryCodeMap = new Map(treasuryAccounts.map(a => [a.code, a.name]));
    
    journals.forEach(j => {
      j.lines?.forEach(line => {
        if (treasuryCodeMap.has(line.accountId)) {
          txs.push({
            id: j.id,
            date: j.date,
            description: line.description || j.description,
            reference: j.reference,
            account: treasuryCodeMap.get(line.accountId),
            isBank: chartOfAccounts.find(a => a.code === line.accountId)?.subCategory === 'Bank',
            type: line.debit > 0 ? 'Credit' : 'Debit',
            amount: line.debit > 0 ? line.debit : line.credit,
            source: j.createdBy === 'SYSTEM_SALES_AUTO' ? 'Sales Registry' : 'Journal Voucher'
          });
        }
      });
    });

    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journals, treasuryAccounts, chartOfAccounts]);

  const totalLiquidity = treasuryAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalCash = cashAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalBank = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Liquidity', value: formatAmount(totalLiquidity), sub: `${treasuryAccounts.length} Connected Accounts`, icon: Wallet, color: 'text-indigo-600' },
          { label: 'Cash on Hand', value: formatAmount(totalCash), sub: `${cashAccounts.length} Physical Funds`, icon: CreditCard, color: 'text-emerald-600' },
          { label: 'Bank Reserves', value: formatAmount(totalBank), sub: `${bankAccounts.length} Linked Institutions`, icon: Landmark, color: 'text-blue-600' },
          { label: 'Monthly Velocity', value: 'High', sub: 'Audit Level: Active', icon: RefreshCcw, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         {/* Bank Accounts Section */}
         <div className="lg:col-span-12 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Financial Institution Linkages</h3>
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition"
               >
                  <Plus size={14} />
                  Link Account
               </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {treasuryAccounts.map((acc) => (
                  <div key={acc.code} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs group hover:border-indigo-200 transition-all cursor-pointer text-sans overflow-hidden relative">
                      <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl ${acc.subCategory === 'Bank' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
                              {acc.subCategory === 'Bank' ? <Landmark size={24} /> : <Wallet size={24} />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${acc.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                              {acc.isActive ? (acc.status || 'ACTIVE') : 'INACTIVE'}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if(confirm(`Are you sure you want to remove ${acc.name}?`)) deleteAccount(acc.code);
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={14} />
                            </button>
                          </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{acc.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 font-mono text-indigo-600">CODE: {acc.code} | {acc.subCategory.toUpperCase()} SETTLEMENT</p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-end justify-between">
                         <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Functional Balance</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatAmount(acc.balance || 0)}</span>
                         </div>
                         <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                            <Download size={18} />
                         </button>
                      </div>
                  </div>
                ))}
            </div>
         </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 overflow-hidden"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                        <Plus size={20} />
                     </div>
                     <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Link New Treasury A/C</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleAddAccount} className="space-y-6">
                  {isConnecting ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                       <div className="relative">
                          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 rounded-full" />
                          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <RefreshCcw size={24} className="text-indigo-600 animate-pulse" />
                          </div>
                       </div>
                       <div className="text-center">
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Handshaking Secure API...</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verifying GL Account {newAcc.code}</p>
                       </div>
                    </div>
                  ) : (
                    <>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quick Link (Popular Banks)</label>
                     <div className="flex flex-wrap gap-2 py-2">
                        {[
                           { name: 'HSBC Corp', code: '1025' },
                           { name: 'Chase Business', code: '1035' },
                           { name: 'Barclays Prime', code: '1045' },
                           { name: 'Standard Chartered', code: '1055' }
                        ].map(bank => (
                           <button
                              key={bank.code}
                              type="button"
                              onClick={() => setNewAcc({ ...newAcc, name: bank.name, code: bank.code })}
                              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700 transition"
                           >
                              {bank.name}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Entity Name</label>
                     <input 
                        required
                        type="text" 
                        value={newAcc.name}
                        onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="e.g. Barclays Corporate"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">GL Code</label>
                       <input 
                          required
                          type="text" 
                          value={newAcc.code}
                          onChange={e => setNewAcc({...newAcc, code: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                          placeholder="10XX"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                       <select 
                          value={newAcc.type}
                          onChange={e => setNewAcc({...newAcc, type: e.target.value as 'Bank' | 'Cash'})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                       >
                          <option value="Bank">Bank Institution</option>
                          <option value="Cash">Physical Cash Fund</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Opening Statement Balance</label>
                     <input 
                        type="number" 
                        value={newAcc.balance}
                        onChange={e => setNewAcc({...newAcc, balance: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                     />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                  >
                     Establish Linkage
                  </button>
                    </>
                  )}
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

         {/* Recent Treasury Transactions */}
         <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <ArrowRightLeft size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Settlement Audit Log</h3>
               </div>
               <button className="text-[10px] font-black text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg uppercase tracking-tight hover:bg-indigo-100 transition">Download Statements</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement Date</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Ref</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Treasury Source</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Settled Account</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sans">
                  {treasuryTransactions.length > 0 ? treasuryTransactions.map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.id}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Ref: {tx.reference}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{tx.description}</span>
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{tx.source}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            {tx.account.includes('Bank') ? <Landmark size={12} className="text-blue-500" /> : <Wallet size={12} className="text-emerald-500" />}
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{tx.account}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`text-[11px] font-black font-mono ${tx.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.type === 'Credit' ? '+' : '-'}{formatAmount(tx.amount)}
                         </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-30">
                             <History size={32} className="text-slate-300" />
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No treasury activity recorded</p>
                          </div>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CashManagement;
