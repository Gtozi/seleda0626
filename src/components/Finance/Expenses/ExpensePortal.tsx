import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Wallet, 
  Truck, 
  UserCheck, 
  ShieldCheck, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import ExpenseDashboard from './ExpenseDashboard';
import ExpenseRegistry from './ExpenseRegistry';
import PettyCashManagement from './PettyCashManagement';
import TransportLogistics from './TransportLogistics';
import ReimbursementClaims from './ReimbursementClaims';
import ExpenseBudgetControl from './ExpenseBudgetControl';

import { useERP } from '../../../context/ERPContext';
import { ModalSystem } from '../../Shared/ModalSystem';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const ExpensePortal = () => {
  const { addExpenseRequest, currentSystemDate, userProfile } = useERP();
  const [activeSubModule, setActiveSubModule] = useState<'dashboard' | 'registry' | 'petty-cash' | 'transport' | 'reimbursements' | 'budget'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'requisition' | 'grn'>('requisition');
  
  const [newRequest, setNewRequest] = useState({
    department: 'Front Office',
    category: 'Operational',
    subcategory: '',
    description: '',
    amount: 0,
    priority: 'Medium' as any
  });

  const [grnForm, setGrnForm] = useState({
    grnId: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
    supplierName: 'Global Energy Corp',
    department: 'Engineering',
    amount: 0,
    subcategory: 'Equipment Maintenance',
    description: 'Verified receipt of physical items. Satisfies 3-point matching audit protocol (PO vs Delivery vs Invoice). Items inspected and matching without discrepancy.',
    priority: 'High' as any
  });

  const subModules = [
    { id: 'dashboard', label: 'Expense Dashboard', icon: BarChart3 },
    { id: 'registry', label: 'Expense Registry', icon: FileText },
    { id: 'petty-cash', label: 'Petty Cash', icon: Wallet },
    { id: 'transport', label: 'Transport Costs', icon: Truck },
    { id: 'reimbursements', label: 'Reimbursements', icon: UserCheck },
    { id: 'budget', label: 'Budget Control', icon: ShieldCheck },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalTab === 'requisition') {
      addExpenseRequest({
        ...newRequest,
        date: currentSystemDate,
        status: 'Under Review',
        requestedBy: userProfile?.name || 'Authorized User',
        attachments: 0
      });
      setNewRequest({
        department: 'Front Office',
        category: 'Operational',
        subcategory: '',
        description: '',
        amount: 0,
        priority: 'Medium'
      });
    } else {
      addExpenseRequest({
        department: grnForm.department,
        category: 'Inventory Receipt',
        subcategory: grnForm.subcategory,
        description: grnForm.description,
        amount: Number(grnForm.amount),
        status: 'Approved', // As it is already physical goods verified, it enters registered as Approved.
        requestedBy: userProfile?.name || 'Inventory Supervisor',
        attachments: 2,
        priority: grnForm.priority,
        isGrn: true,
        grnId: grnForm.grnId,
        supplierName: grnForm.supplierName
      });
      setGrnForm({
        grnId: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
        supplierName: 'Global Energy Corp',
        department: 'Engineering',
        amount: 0,
        subcategory: 'Equipment Maintenance',
        description: 'Verified receipt of physical items. Satisfies 3-point matching audit protocol (PO vs Delivery vs Invoice). Items inspected and matching without discrepancy.',
        priority: 'High'
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/20 rounded-[32px] p-1 overflow-hidden relative">
      {/* Tertiary Nav */}
      <div className="flex items-center gap-2 p-4 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-[30px]">
        {subModules.map((sm) => {
          const Icon = sm.icon;
          return (
            <button
              key={sm.id}
              onClick={() => setActiveSubModule(sm.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeSubModule === sm.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              {sm.label}
            </button>
          );
        })}
        
        <div className="ml-auto flex items-center gap-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition"
           >
              <Plus size={14} />
              New Expense Request
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {activeSubModule === 'dashboard' && <ExpenseDashboard />}
        {activeSubModule === 'registry' && <ExpenseRegistry />}
        {activeSubModule === 'petty-cash' && <PettyCashManagement />}
        {activeSubModule === 'transport' && <TransportLogistics />}
        {activeSubModule === 'reimbursements' && <ReimbursementClaims />}
        {activeSubModule === 'budget' && <ExpenseBudgetControl />}
      </div>

      <ModalSystem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={modalTab === 'grn' ? 'Register Goods Receipt Note (GRN)' : 'Create Expenditure Requisition'}
        icon={<FileText size={20} className={modalTab === 'grn' ? 'text-emerald-600' : 'text-indigo-600'} />}
        variant="form"
        size="lg"
        showFooter={false}
      >
                {/* Tab Switcher */}
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
                   <button
                     type="button"
                     onClick={() => setModalTab('requisition')}
                     className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${modalTab === 'requisition' ? 'bg-indigo-650 bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                   >
                     Standard Requisition
                   </button>
                   <button
                     type="button"
                     onClick={() => setModalTab('grn')}
                     className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${modalTab === 'grn' ? 'bg-emerald-650 bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                   >
                     Grn Receipt Entry
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                   {modalTab === 'requisition' ? (
                     <>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Requesting Department</label>
                           <select 
                              value={newRequest.department}
                              onChange={e => setNewRequest({...newRequest, department: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                           >
                              <option>Front Office</option>
                              <option>Housekeeping</option>
                              <option>Kitchen</option>
                              <option>Engineering</option>
                              <option>Marketing</option>
                              <option>Admin & Finance</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Priority Level</label>
                           <select 
                              value={newRequest.priority}
                              onChange={e => setNewRequest({...newRequest, priority: e.target.value as any})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                           >
                              <option value="Low">Low - Normal Routine</option>
                              <option value="Medium">Medium - Regular Priority</option>
                              <option value="High">High - Important Need</option>
                              <option value="Urgent">Urgent - Operational Critical</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Expense Category</label>
                           <select 
                              value={newRequest.category}
                              onChange={e => setNewRequest({...newRequest, category: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                           >
                              <option>Operational</option>
                              <option>Administrative</option>
                              <option>Utility</option>
                              <option>Service</option>
                              <option>Asset Purchase</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Specific Sub-Category</label>
                           <input 
                              required
                              type="text" 
                              value={newRequest.subcategory}
                              onChange={e => setNewRequest({...newRequest, subcategory: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                              placeholder="e.g. Repairs, Stationery, etc."
                           />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Detailed Justification</label>
                           <textarea 
                              required
                              value={newRequest.description}
                              onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                              placeholder="Briefly describe why this expenditure is required..."
                           />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Estimated Cost (USD)</label>
                           <div className="relative">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                             <input 
                                required
                                type="number" 
                                value={newRequest.amount || ''}
                                onChange={e => setNewRequest({...newRequest, amount: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-10 pr-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                             />
                           </div>
                        </div>

                        <button 
                          type="submit"
                          className="col-span-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                           Submit Requisition Voucher
                        </button>
                     </>
                   ) : (
                     <>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">GRN Number (Audited)</label>
                           <input 
                              required
                              type="text" 
                              value={grnForm.grnId}
                              onChange={e => setGrnForm({...grnForm, grnId: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                              placeholder="GRN-2026-###"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Target Supplier</label>
                           <select 
                              value={grnForm.supplierName}
                              onChange={e => setGrnForm({...grnForm, supplierName: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                           >
                              <option>Luxury Linen Services</option>
                              <option>Global Energy Corp</option>
                              <option>Premium Beverage Co.</option>
                              <option>Metro Food Wholesalers</option>
                              <option>Universal Tech Systems</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Receiving Department</label>
                           <select 
                              value={grnForm.department}
                              onChange={e => setGrnForm({...grnForm, department: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                           >
                              <option>Kitchen</option>
                              <option>Housekeeping</option>
                              <option>Engineering</option>
                              <option>Front Office</option>
                              <option>Admin & Finance</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Priority Designation</label>
                           <select 
                              value={grnForm.priority}
                              onChange={e => setGrnForm({...grnForm, priority: e.target.value as any})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                           >
                              <option value="Low">Low - Post-Audited Stock</option>
                              <option value="Medium">Medium - Regular Restock</option>
                              <option value="High">High - Essential Inflow</option>
                              <option value="Urgent">Urgent - Operational Critical</option>
                           </select>
                        </div>

                        <div className="col-span-2 space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Received Goods Classification</label>
                           <input 
                              required
                              type="text" 
                              value={grnForm.subcategory}
                              onChange={e => setGrnForm({...grnForm, subcategory: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              placeholder="e.g. Bed Linens, HVAC spare parts, Beverage stock"
                           />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                           <div className="flex justify-between items-center ml-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-sans">Physical Delivery Verification Audit</label>
                              <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-600 font-bold uppercase py-0.2 px-1 rounded">3-way matching green</span>
                           </div>
                           <textarea 
                              required
                              value={grnForm.description}
                              onChange={e => setGrnForm({...grnForm, description: e.target.value})}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                              placeholder="Describe physical quantities and quality matching status..."
                           />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-sans">Total Confirmed GRN Value (USD)</label>
                           <div className="relative">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                             <input 
                                required
                                type="number" 
                                value={grnForm.amount || ''}
                                onChange={e => setGrnForm({...grnForm, amount: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-10 pr-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                                placeholder="Confirmed voucher value"
                             />
                           </div>
                        </div>

                        <button 
                          type="submit"
                          className="col-span-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                           Register Verified GRN Receipt
                        </button>
                     </>
                   )}
                </form>
      </ModalSystem>
    </div>
  );
};

export default ExpensePortal;
