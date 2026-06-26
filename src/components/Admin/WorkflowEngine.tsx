/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  User, 
  Shield, 
  Zap, 
  Plus, 
  Settings,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  DollarSign,
  Package,
  Wrench,
  Users,
  Layers,
  Info,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApprovalRequest, ApprovalCategory, ApprovalStatus } from '../../types/admin';

// Static historical data to prevent re-entering but keep it clean
const defaultRequests: ApprovalRequest[] = [
  {
    id: 'REQ-2024-FO-012',
    category: 'Procurement',
    title: 'Bulk Linen Replacement Q3',
    requestedBy: 'Head of Housekeeping',
    department: 'Housekeeping',
    amount: 14200.00,
    date: '2024-05-28',
    status: 'Pending',
    priority: 'High',
    description: 'Annual replacement of 400TC Egyptian cotton sheets and towels for guest rooms.'
  },
  {
    id: 'REQ-2024-HR-044',
    category: 'HR',
    title: 'New Role: Assistant F&B Manager',
    requestedBy: 'HR Director',
    department: 'Food & Beverage',
    date: '2024-05-29',
    status: 'Pending',
    priority: 'Normal',
    description: 'Creation of new role to manage increased catering demand for conference season.'
  },
  {
    id: 'REQ-2024-FIN-009',
    category: 'Finance',
    title: 'Quarterly Tax Adjustment Posting',
    requestedBy: 'Finance Controller',
    department: 'Administrative',
    amount: 45800.50,
    date: '2024-05-29',
    status: 'Pending',
    priority: 'Emergency',
    description: 'End-of-period VAT rebalancing and journal adjustment for cross-departmental charges.'
  },
  {
    id: 'REQ-2024-ENG-022',
    category: 'Maintenance',
    title: 'Chiller Pump Motor Overhaul',
    requestedBy: 'Chief Engineer',
    department: 'Maintenance',
    amount: 5400.00,
    date: '2024-05-30',
    status: 'Pending',
    priority: 'Emergency',
    description: 'Critical repair of HVAC secondary pump. Risk of building cooling failure if not addressed.'
  }
];

const defaultWorkflows = [
  { id: 'WF-101', type: 'Procurement', title: 'Luxury Linen Bulk Order', amount: '$4,200', status: 'In Progress', currentStep: 'Finance Manager', startTime: '2h ago', notes: '' },
  { id: 'WF-102', type: 'Refund', title: 'Cancellation Room 402 (Late)', amount: '$150', status: 'Pending', currentStep: 'General Manager', startTime: '4h ago', notes: '' },
  { id: 'WF-103', type: 'Staff Leave', title: 'Staff Leave Request', amount: null, status: 'Approved', currentStep: 'Completed', startTime: '1d ago', notes: '' },
  { id: 'WF-104', type: 'Discount', title: 'Corporate Event Discount (Enterprise)', amount: '15%', status: 'Rejected', currentStep: 'CEO Office', startTime: '2d ago', notes: '' },
];

interface WorkflowEngineProps {
  defaultTab?: 'approvals' | 'flows' | 'builder' | 'automation';
}

export default function WorkflowEngine({ defaultTab }: WorkflowEngineProps = {}) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'flows' | 'builder' | 'automation'>(defaultTab || 'approvals');
  
  // Stateful approvals and workflows to support real action states
  const [requests, setRequests] = useState<ApprovalRequest[]>(defaultRequests);
  const [workflows, setWorkflows] = useState<any[]>(defaultWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  
  // State for search and filter options
  const [approvalFilterTab, setApprovalFilterTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom justification input for workflow side panel
  const [workflowNote, setWorkflowNote] = useState('');
  
  // Action notifications
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showNotice = (message: string, type: 'success' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleApproveRequest = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
    const item = requests.find(r => r.id === id);
    showNotice(`Approved: "${item?.title}" successfully authorized & written to Ledger Audit Trail.`, 'success');
  };

  const handleRejectRequest = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
    const item = requests.find(r => r.id === id);
    showNotice(`Rejected: "${item?.title}" has been voided & returned to requestor.`, 'info');
  };

  const handleAuthorizeWorkflow = (id: string, notes: string) => {
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, status: 'Approved', currentStep: 'Completed', notes } : wf));
    const item = workflows.find(w => w.id === id);
    showNotice(`Action Authorized for ${id}: "${item?.title}" details posted.`, 'success');
    setSelectedWorkflow(null);
    setWorkflowNote('');
  };

  const handleRejectWorkflow = (id: string, notes: string) => {
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, status: 'Rejected', notes } : wf));
    const item = workflows.find(w => w.id === id);
    showNotice(`Workflow ${id} has been Rejected and Voided.`, 'info');
    setSelectedWorkflow(null);
    setWorkflowNote('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Procurement': return { icon: <Package size={16} />, bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' };
      case 'HR': return { icon: <Users size={16} />, bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20' };
      case 'Finance': return { icon: <DollarSign size={16} />, bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20' };
      case 'Maintenance': return { icon: <Wrench size={16} />, bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20' };
      case 'Inventory': return { icon: <Layers size={16} />, bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 border border-purple-100 dark:border-purple-500/20' };
      case 'Capital': return { icon: <Zap size={16} />, bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20' };
      default: return { icon: <Info size={16} />, bg: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 border border-slate-100 dark:border-slate-500/20' };
    }
  };

  // Filter requests dynamically
  const filteredRequests = requests.filter(req => {
    const matchesStatus = approvalFilterTab === 'pending' 
      ? req.status === 'Pending' 
      : (req.status === 'Approved' || req.status === 'Rejected');

    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'All' || req.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;

    return matchesStatus && matchesSearch && matchesPriority && matchesCategory;
  });

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const activeWorkflowsCount = workflows.filter(w => w.status === 'In Progress' || w.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in" id="workflow-engine-module">
      {/* Action Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[110] flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border shadow-xl text-xs font-black uppercase tracking-tight text-white ${
              notification.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-200 dark:shadow-none' 
                : 'bg-indigo-600 border-indigo-500 shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflow Review Side Panel */}
      <AnimatePresence>
        {selectedWorkflow && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[100] flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
               <div className="flex gap-4 items-center">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white">
                     <GitBranch size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedWorkflow.id} Review</h3>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Procedural Approval Flow</span>
                  </div>
               </div>
               <button onClick={() => { setSelectedWorkflow(null); setWorkflowNote(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                  <Plus size={24} className="rotate-45 text-slate-400" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="space-y-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Workflow Context</span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{selectedWorkflow.title}</h2>
                  {selectedWorkflow.amount && (
                    <div className="text-2xl font-black text-indigo-600 font-mono">{selectedWorkflow.amount}</div>
                  )}
               </div>

               <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                     <Shield size={16} className="text-emerald-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Approval Chain</span>
                  </div>
                  
                  <div className="space-y-6 relative">
                     <div className="absolute left-[11px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700" />
                     
                     {[
                       { stage: 'Initiation', owner: 'Mendez (Ops)', status: 'Approved', date: '2h ago' },
                       { stage: 'Fiscal Policy Review', owner: 'Finance Manager', status: selectedWorkflow.status === 'Approved' ? 'Approved' : selectedWorkflow.status === 'Rejected' ? 'Rejected' : 'Pending', date: selectedWorkflow.status === 'Approved' ? 'Approved' : selectedWorkflow.status === 'Rejected' ? 'Rejected' : 'Active' },
                       { stage: 'Final Authorization', owner: 'General Manager', status: selectedWorkflow.status === 'Approved' ? 'Approved' : 'Upcoming', date: selectedWorkflow.status === 'Approved' ? 'Approved' : '-' }
                     ].map((step, i) => (
                       <div key={i} className="flex gap-4 relative z-10">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            step.status === 'Approved' ? 'bg-emerald-500 border-emerald-500 text-white' :
                            step.status === 'Rejected' ? 'bg-rose-500 border-rose-500 text-white' :
                            step.status === 'Pending' ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 animate-pulse' :
                            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                          }`}>
                            {step.status === 'Approved' ? <CheckCircle size={14} /> : 
                             step.status === 'Rejected' ? <XCircle size={14} /> :
                             <span className="text-[10px] font-black">{i+1}</span>}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between">
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{step.stage}</span>
                                <span className={`text-[9px] font-bold ${step.status === 'Approved' ? 'text-emerald-600' : 'text-slate-400'}`}>{step.date}</span>
                             </div>
                             <div className="text-xs text-slate-500 font-bold">{step.owner}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Audit Trail Note</span>
                  <textarea 
                    value={workflowNote}
                    onChange={(e) => setWorkflowNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-500/10 h-32"
                    placeholder="Enter approval/rejection justification notes..."
                  ></textarea>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
               <button 
                 onClick={() => handleRejectWorkflow(selectedWorkflow.id, workflowNote)} 
                 className="flex-1 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-105 transition cursor-pointer"
               >
                 Reject & Void
               </button>
               <button 
                 onClick={() => handleAuthorizeWorkflow(selectedWorkflow.id, workflowNote)} 
                 className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-103 active:scale-97 transition cursor-pointer"
               >
                 Authorize Action
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest">Enterprise Administration</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Workflow & Approvals Command</h2>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 cursor-pointer hover:opacity-90">
             <Plus size={14} /> Create Process Template
           </button>
        </div>
      </div>

      {/* Dynamic Statistics Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: pendingRequestsCount, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/25 border-amber-100 dark:border-amber-950/40' },
          { label: 'Active Process flows', value: activeWorkflowsCount, icon: GitBranch, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/25 border-indigo-100 dark:border-indigo-950/40' },
          { label: 'Avg Decision Cycle', value: '1.2h', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-950/40' },
          { label: 'Audit Compliance', value: '100%', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/25 border-purple-100 dark:border-purple-950/40' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${s.bg}`}>
                <s.icon size={22} className={s.color} />
             </div>
             <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
                <div className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{s.value}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit">
        {[
          { id: 'approvals', label: 'My Approvals Queue' },
          { id: 'flows', label: 'Active Process Flows' },
          { id: 'builder', label: 'Workflow Architect' },
          { id: 'automation', label: 'Automated Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedWorkflow(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      <div className="grid grid-cols-1">
        <div>
           {/* TAB 1: EXECUTIVE APPROVALS QUEUE (Merged from ApprovalCenter.tsx) */}
           {activeTab === 'approvals' && (
             <div className="space-y-4">
                {/* Visual Filter Bar */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-150 dark:border-slate-800">
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-850">
                     <button 
                       onClick={() => setApprovalFilterTab('pending')}
                       className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition cursor-pointer ${approvalFilterTab === 'pending' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-3xs' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                     >
                       Pending Action ({requests.filter(r => r.status === 'Pending').length})
                     </button>
                     <button 
                       onClick={() => setApprovalFilterTab('history')}
                       className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition cursor-pointer ${approvalFilterTab === 'history' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-3xs' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                     >
                       Approval History ({requests.filter(r => r.status !== 'Pending').length})
                     </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                     {/* Priority Selection */}
                     <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-xl shadow-3xs">
                       <Filter size={12} className="text-slate-400" />
                       <select 
                         value={selectedPriority} 
                         onChange={(e) => setSelectedPriority(e.target.value)}
                         className="text-[10px] font-bold text-slate-600 dark:text-slate-350 bg-transparent border-none outline-none cursor-pointer focus:ring-0 py-0"
                       >
                         <option value="All">Priority: All</option>
                         <option value="Emergency">Emergency</option>
                         <option value="High">High</option>
                         <option value="Normal">Normal</option>
                         <option value="Low">Low</option>
                       </select>
                     </div>

                     {/* Category Selection */}
                     <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-xl shadow-3xs">
                       <Package size={12} className="text-slate-400" />
                       <select 
                         value={selectedCategory} 
                         onChange={(e) => setSelectedCategory(e.target.value)}
                         className="text-[10px] font-bold text-slate-600 dark:text-slate-350 bg-transparent border-none outline-none cursor-pointer focus:ring-0 py-0"
                       >
                         <option value="All">Category: All</option>
                         <option value="Procurement">Procurement</option>
                         <option value="HR">HR</option>
                         <option value="Finance">Finance</option>
                         <option value="Maintenance">Maintenance</option>
                         <option value="Inventory">Inventory</option>
                         <option value="Capital">Capital</option>
                       </select>
                     </div>

                     {/* Search Query Input */}
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input 
                          type="text" 
                          placeholder="Search global requests..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
                        />
                     </div>
                  </div>
                </div>

                {/* Queue Lists Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider leading-none">Queue Filter Cleaned</h4>
                        <p className="text-[10px] font-medium text-slate-400 max-w-xs mx-auto mt-2 italic leading-relaxed">There are no operational requests corresponding to the selected priorities, queries, or statuses.</p>
                      </div>
                    </div>
                  ) : (
                    filteredRequests.map((req) => {
                      const catDetails = getCategoryIcon(req.category);
                      return (
                        <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-3xs group hover:border-indigo-400 transition-all duration-300">
                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex items-start gap-4 flex-1">
                                 <div className={`p-3 rounded-2xl ${catDetails.bg} flex items-center justify-center shrink-0`}>
                                    {catDetails.icon}
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                       <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{req.category}</span>
                                       <span className="text-[10px] text-slate-300 uppercase font-black">•</span>
                                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                         req.priority === 'Emergency' ? 'bg-rose-500 text-white animate-pulse' : 
                                         req.priority === 'High' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' : 
                                         'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                                       }`}>
                                         {req.priority} Priority
                                       </span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{req.title}</h4>
                                    <p className="text-[11px] font-medium text-slate-500 leading-normal italic">"{req.description}"</p>
                                 </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-8 px-0 lg:px-6">
                                 <div className="text-right shrink-0">
                                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Requested By</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">{req.requestedBy}</span>
                                    <span className="text-[8px] font-medium text-slate-400 block uppercase font-mono">{req.department}</span>
                                 </div>
                                 {req.amount && (
                                    <div className="text-right shrink-0">
                                       <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Total Value</span>
                                       <span className="text-sm font-black text-indigo-600 font-mono">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                 )}
                                 <div className="text-right shrink-0">
                                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Submission Date</span>
                                    <span className="text-xs font-bold text-slate-600">{req.date}</span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                 {req.status === 'Pending' ? (
                                   <>
                                     <button 
                                       onClick={() => handleApproveRequest(req.id)}
                                       className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                     >
                                        <CheckCircle2 size={13} />
                                        Approve
                                     </button>
                                     <button 
                                       onClick={() => handleRejectRequest(req.id)}
                                       className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 dark:hover:bg-rose-950/20 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                     >
                                        <XCircle size={13} />
                                        Reject
                                     </button>
                                   </>
                                 ) : (
                                   <div className="flex flex-col items-end">
                                     <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                       req.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450'
                                     }`}>
                                       {req.status}
                                     </span>
                                     <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-widest font-mono">Dual-Verified</span>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Audit Trust Advisory card */}
                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-full text-indigo-600 shadow-sm">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise Audit Integrity Policy</h5>
                         <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">All managerial and board actions are automatically aggregated, dual-verified with timestamp, and permanently signed into the hotel operational ledger.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* TAB 2: ACTIVE PROCESS WORKFLOW FLOWS */}
           {activeTab === 'flows' && (
             <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 bg-slate-50/55 dark:bg-slate-950/20">
                               <th className="px-6 py-4">Process Category</th>
                               <th className="px-6 py-4">Title / Context</th>
                               <th className="px-6 py-4">Active Step</th>
                               <th className="px-6 py-4">Workflow Time</th>
                               <th className="px-6 py-4 text-right">Review Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                            {workflows.map((wf) => (
                              <tr 
                                key={wf.id} 
                                onClick={() => setSelectedWorkflow(wf)}
                                className="text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-950/20 cursor-pointer group"
                              >
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        wf.type === 'Procurement' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' :
                                        wf.type === 'Refund' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' :
                                        wf.type === 'Discount' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' :
                                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                      }`}>
                                         <GitBranch size={16} />
                                      </div>
                                      <div>
                                         <div className="text-slate-900 dark:text-white uppercase tracking-tighter font-black text-[10px]">{wf.type}</div>
                                         <div className="text-slate-400 font-mono text-[9px]">{wf.id}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="text-slate-700 dark:text-slate-300 font-sans font-extrabold uppercase">{wf.title}</div>
                                   {wf.amount && <div className="text-indigo-600 font-black mt-0.5">{wf.amount}</div>}
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        wf.status === 'Approved' ? 'bg-emerald-500' :
                                        wf.status === 'In Progress' ? 'bg-indigo-500 animate-pulse' :
                                        wf.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                      }`} />
                                      <span className="text-slate-700 dark:text-slate-300 uppercase font-black text-[11px]">{wf.currentStep}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                                      <Clock size={12} /> {wf.startTime}
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end gap-2 shrink-0">
                                      <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-tight transition cursor-pointer">
                                        Review Details
                                      </button>
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

           {/* TAB 3: WORKFLOW ARCHITECT (BUILDER) */}
           {activeTab === 'builder' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-3xs space-y-8">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                         <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Workflow Visual Architect</h3>
                         <p className="text-xs text-slate-450 mt-1 uppercase font-bold">Design step configurations, dual approvals, and escalation timeout paths.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition"><Settings size={18} /></button>
                         <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg cursor-pointer">Publish Architect Pipeline</button>
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-6 relative py-12 bg-slate-50/50 dark:bg-slate-950/20 rounded-[30px] border border-dashed border-slate-205 dark:border-slate-800">
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 border-dashed border-l border-slate-300 dark:border-slate-700" />
                      
                      {/* Step 1 */}
                      <div className="z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl w-full max-w-sm flex items-center gap-4 shadow-sm">
                         <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center font-black font-mono">ST-1</div>
                         <div className="flex-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">INITIATION</span>
                            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">Department Head Request</div>
                         </div>
                         <ArrowRight size={18} className="text-slate-300 rotate-90" />
                      </div>

                      {/* Condition Rules Node */}
                      <div className="z-10 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl w-full max-w-xs flex items-center gap-4 shadow-3xs">
                         <Shield size={18} className="text-amber-600 shrink-0" />
                         <div className="flex-1">
                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block">RULE REGISTRY ENGINE</span>
                            <div className="text-[10px] font-bold text-slate-750 dark:text-slate-300">IF TRANSACTION VALUE &gt; $5,000</div>
                         </div>
                      </div>

                      {/* Step 2 */}
                      <div className="z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl w-full max-w-sm flex items-center gap-4 shadow-sm border-l-4 border-l-indigo-500">
                         <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black font-mono">ST-2</div>
                         <div className="flex-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">FISCAL POLICIES SIGN</span>
                            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">Finance Manager Verification</div>
                         </div>
                         <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Plus size={14} /></button>
                      </div>

                      {/* Add Dynamic Point */}
                      <button className="z-10 w-10 h-10 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition cursor-pointer">
                         <Plus size={18} />
                      </button>
                   </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-slate-950 p-6 rounded-[32px] text-white shadow-xl space-y-6">
                      <div className="flex items-center gap-2">
                         <Zap size={18} className="text-amber-400" />
                         <h4 className="font-black text-xs uppercase tracking-widest">Workflow Logic Components</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                         {['SLA Timeout Warning (48h)', 'Manager Email Dispatch', 'Dual Approval Segment', 'Security Push Notification', 'Threshold Auto-Reject Gate'].map((comp, i) => (
                           <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-[10px] font-bold hover:bg-white/10 cursor-move transition">
                              {comp}
                              <GitBranch size={12} className="opacity-30" />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-indigo-650 dark:bg-indigo-900/40 p-6 rounded-[32px] text-white shadow-xl space-y-4">
                      <div className="flex items-center gap-2">
                         <CheckCircle size={18} />
                         <h4 className="font-black text-xs uppercase tracking-widest">Escalation Policy rules</h4>
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed italic font-medium">"Approval requests that remain silent for &gt; 24h are automatically escalated directly to the General Manager's central operational pipeline."</p>
                   </div>
                </div>
             </div>
           )}

           {/* TAB 4: AUTOMATED RULES TERMINAL */}
           {activeTab === 'automation' && (
             <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-[32px] p-12 text-center text-slate-400 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/60 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                   <GitBranch size={32} strokeWidth={1} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Auto-Rule Policy Agent Engine</h4>
                   <p className="text-xs max-w-sm mx-auto mt-2 italic font-medium text-slate-400">Establish and execute high-speed conditional triggers (e.g., auto-release housekeeping hold triggers during high occupancies).</p>
                </div>
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-95 cursor-pointer">Start Engine Policy Agent</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
