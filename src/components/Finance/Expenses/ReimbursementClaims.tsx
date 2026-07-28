import React from 'react';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Paperclip, 
  MoreVertical, 
  ArrowUpRight, 
  Search, 
  Filter,
  CreditCard,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DataTable, Column } from '../../Shared/DataTable';

const ReimbursementClaims = () => {
  const claims = [
    { id: 'REM-1042', staff: 'Sarah Johnson', role: 'Sales Exec', amount: 120.50, category: 'Travel', status: 'Pending', date: '2024-05-30', receipts: 2 },
    { id: 'REM-1041', staff: 'David Smith', role: 'IT Support', amount: 45.00, category: 'Meals', status: 'Verified', date: '2024-05-29', receipts: 1 },
    { id: 'REM-1040', staff: 'Emma Wilson', role: 'HR Manager', amount: 850.00, category: 'Training', status: 'Paid', date: '2024-05-28', receipts: 1 },
    { id: 'REM-1039', staff: 'Michael Chen', role: 'Kitchen Head', amount: 35.00, category: 'Misc', status: 'Rejected', date: '2024-05-27', receipts: 0 },
  ];

  const categories = [
    { label: 'Travel & Transport', count: 12, amount: '$2,450', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Client Meals', count: 8, amount: '$1,120', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Professional Dev', count: 3, amount: '$4,800', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs flex items-center gap-6">
             <div className={`p-4 rounded-3xl ${cat.bg} ${cat.color}`}>
                <cat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{cat.label}</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.amount}</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{cat.count} Claims</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Staff Reimbursement Workflow</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Employee expense claims & verification state</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition">
               Submit Claim
            </button>
         </div>
         <DataTable
           columns={[
             {
               key: 'staff', label: 'Employee Profile',
               render: (claim: any) => (
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold text-xs">
                     {claim.staff.split(' ').map((n: string) => n[0]).join('')}
                   </div>
                   <div>
                     <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{claim.staff}</h4>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{claim.role}</span>
                   </div>
                 </div>
               ),
             },
             {
               key: 'id', label: 'Reference', align: 'center' as const,
               render: (claim: any) => (
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{claim.id}</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase">{claim.date}</span>
                 </div>
               ),
             },
             {
               key: 'amount', label: 'Amount', align: 'center' as const,
               render: (claim: any) => (
                 <div className="flex flex-col items-center">
                   <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${claim.amount.toFixed(2)}</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{claim.category}</span>
                 </div>
               ),
             },
             {
               key: 'status', label: 'Status', align: 'center' as const,
               render: (claim: any) => (
                 <div className="flex flex-col items-center gap-1.5">
                   {claim.status === 'Pending' && <Clock size={16} className="text-amber-500" />}
                   {claim.status === 'Verified' && <CheckCircle size={16} className="text-blue-500" />}
                   {claim.status === 'Paid' && <CheckCircle size={16} className="text-emerald-500" />}
                   {claim.status === 'Rejected' && <AlertCircle size={16} className="text-rose-500" />}
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{claim.status}</span>
                 </div>
               ),
             },
             {
               key: 'actions', label: 'Verification', align: 'right' as const, sortable: false,
               render: (claim: any) => (
                 <div className="flex items-center justify-end gap-4">
                   {claim.receipts > 0 && (
                     <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                       <Paperclip size={12} />
                       <span className="text-[10px] font-bold">{claim.receipts}</span>
                     </div>
                   )}
                   <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition">
                     <ChevronRight size={16} />
                   </button>
                 </div>
               ),
             },
           ] as Column<any>[]}
           data={claims}
           rowKey={(claim) => claim.id}
           sortable
           filterable
           filterPlaceholder="Search by staff name..."
           filterKeys={['id', 'staff', 'role', 'category', 'status']}
           containerClassName="rounded-[32px]"
         />
      </div>
    </div>
  );
};

export default ReimbursementClaims;
