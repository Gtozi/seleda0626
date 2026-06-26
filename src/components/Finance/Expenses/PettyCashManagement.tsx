import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  PiggyBank,
  RefreshCw,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';

const PettyCashManagement = () => {
  const branches = [
    { name: 'Hotel HQ Vault', float: 5000.00, balance: 4250.00, status: 'Healthy', custodian: 'Sarah Miller' },
    { name: 'Restaurant Cashier', float: 1000.00, balance: 120.00, status: 'Low Balance', custodian: 'Alex Wong' },
    { name: 'Kitchen Ops', float: 500.00, balance: 480.00, status: 'Healthy', custodian: 'Chef Marco' },
    { name: 'Engineering Store', float: 2000.00, balance: 1850.00, status: 'Healthy', custodian: 'Tom Harris' },
  ];

  const recentTransactions = [
    { id: 'PC-901', date: 'Today, 10:14', account: 'Restaurant', purpose: 'Fresh Herb Replenishment', amount: 45.00, vendor: 'Local Market', status: 'Approved' },
    { id: 'PC-900', date: 'Today, 09:45', account: 'Hotel HQ', purpose: 'Guest Taxi Voucher', amount: 80.00, vendor: 'City Cabs', status: 'Approved' },
    { id: 'PC-899', date: 'Yesterday', account: 'Engineering', purpose: 'Hardware Fasteners', amount: 12.50, vendor: 'ACE Hardware', status: 'Reconciled' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={120} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Total System Liquidity</p>
           <h3 className="text-3xl font-black mb-6">$6,700.00</h3>
           <div className="flex gap-4">
              <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition">Request Top-Up</button>
              <button className="flex-1 py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition">Disburse Cash</button>
           </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           {branches.map((branch, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs flex justify-between items-center">
                <div>
                   <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{branch.name}</h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{branch.custodian}</p>
                   <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">${branch.balance.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">/ ${branch.float.toLocaleString()} Float</span>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${branch.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                      {branch.status}
                   </span>
                   <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full ${branch.balance < (branch.float*0.2) ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${(branch.balance/branch.float)*100}%` }} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         {/* Ledger */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Cash Disbursement Log</h3>
               <button className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2 hover:opacity-70 transition">
                  <RefreshCw size={14} />
                  Reconcile All
               </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose / Branch</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {recentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{tx.id}</span>
                       <p className="text-[9px] font-bold text-slate-400 mt-0.5">{tx.date}</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.purpose}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{tx.account} • {tx.vendor}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-black text-slate-900 dark:text-white">-${tx.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center gap-1">
                          {tx.status === 'Reconciled' ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Clock size={14} className="text-amber-500" />
                          )}
                          <span className="text-[8px] font-black text-slate-400 uppercase">{tx.status}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                          <MoreVertical size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         {/* Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Security & Limits</h3>
               <div className="space-y-4">
                  {[
                    { label: 'Max Transaction', value: '$200', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Daily Cap (User)', value: '$500', icon: AlertCircle, color: 'text-rose-500' },
                    { label: 'Auto-Replenish', value: 'Enabled', icon: RefreshCw, color: 'text-indigo-500' },
                  ].map((ctrl, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl">
                       <ctrl.icon size={18} className={ctrl.color} />
                       <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{ctrl.label}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{ctrl.value}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[40px] text-emerald-50">
               <PiggyBank size={24} className="mb-4 opacity-50" />
               <h3 className="text-sm font-black uppercase tracking-tight mb-2">Replenishment Queue</h3>
               <p className="text-[10px] font-medium leading-relaxed mb-6 opacity-80 uppercase tracking-wider">The "Restaurant Cashier" float is below 20%. A replenishment check for $880.00 has been serialized.</p>
               <button className="w-full py-4 bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition">
                  Approve Immediate Top-Up
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PettyCashManagement;
