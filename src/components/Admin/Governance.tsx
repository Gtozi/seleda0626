/**
 * Governance Module
 * Handles change proposals and governance for configuration changes
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ShieldCheck, Plus, CheckCircle2, GitPullRequest, AlertTriangle, Users, Key, Lock, Clock, RefreshCw, Settings, Building, ShoppingCart, Heart, BarChart3, Plug, Monitor, ClipboardList, Archive, FileText } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AdminChangeType, PendingAdminChange } from '../../types/erp';

interface ChangeProposal {
  id: string;
  title: string;
  description: string;
  department: string;
  type: 'Policy' | 'Fee' | 'Configuration' | 'System';
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  proposer: string;
  dateProposed: string;
  status: 'Pending' | 'Approved' | 'Declined';
  effectedField?: string;
  effectedValue?: any;
}

const CHANGE_TYPE_META: Record<AdminChangeType, { label: string; color: string; icon: React.ReactNode }> = {
  'user-create': { label: 'User Create', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <Users size={12} /> },
  'user-update': { label: 'User Update', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <Users size={12} /> },
  'user-delete': { label: 'User Delete', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <Users size={12} /> },
  'role-create': { label: 'Role Create', color: 'bg-violet-50 text-violet-700 border-violet-100', icon: <Key size={12} /> },
  'role-update': { label: 'Role Update', color: 'bg-violet-50 text-violet-700 border-violet-100', icon: <Key size={12} /> },
  'role-delete': { label: 'Role Delete', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <Key size={12} /> },
  'security-setting': { label: 'Security Config', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Lock size={12} /> },
  'global-setting': { label: 'Global Setting', color: 'bg-sky-50 text-sky-700 border-sky-100', icon: <Settings size={12} /> },
  'property-config': { label: 'Property Config', color: 'bg-teal-50 text-teal-700 border-teal-100', icon: <Building size={12} /> },
  'pos-config': { label: 'POS Config', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <ShoppingCart size={12} /> },
  'loyalty-config': { label: 'Loyalty Config', color: 'bg-pink-50 text-pink-700 border-pink-100', icon: <Heart size={12} /> },
  'revenue-mapping': { label: 'Revenue Map', color: 'bg-lime-50 text-lime-700 border-lime-100', icon: <BarChart3 size={12} /> },
  'integration-config': { label: 'Integration', color: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: <Plug size={12} /> },
  'platform-control': { label: 'Platform Control', color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <Monitor size={12} /> },
  'operational-policy': { label: 'Operational Policy', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100', icon: <ClipboardList size={12} /> },
  'backup-config': { label: 'Backup Config', color: 'bg-stone-50 text-stone-700 border-stone-100', icon: <Archive size={12} /> },
  'audit-config': { label: 'Audit Config', color: 'bg-neutral-50 text-neutral-700 border-neutral-100', icon: <FileText size={12} /> },
};

export default function Governance() {
  const { globalHotelSettings, addStructuredAuditLog, currentSystemDate, pendingAdminChanges, approveAdminChange, declineAdminChange } = useERP();
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);
  const [localChanges, setLocalChanges] = useState<PendingAdminChange[] | null>(null);

  const displayChanges = localChanges ?? pendingAdminChanges;

  // When pendingAdminChanges from context updates (e.g. after approve/decline),
  // drop the stale localChanges copy so the authoritative context state renders.
  useEffect(() => {
    setLocalChanges(null);
  }, [pendingAdminChanges.length]);

  const refreshChanges = useCallback(() => {
    setRefreshing(true);
    fetch('/api/admin/pending-changes', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((data: PendingAdminChange[]) => {
        if (Array.isArray(data)) setLocalChanges(data);
      })
      .catch(console.error)
      .finally(() => setRefreshing(false));
  }, []);

  // Active Change Control Proposals
  const [proposals, setProposals] = useState<ChangeProposal[]>([
    {
      id: 'CHG-301',
      title: 'Modify Global Service Charge policy parameter',
      description: 'Request adjustment of service charge levy from 10% to 12.5% to finance expanded benefits for housekeeping team.',
      department: 'Finance',
      type: 'Fee',
      urgency: 'Medium',
      proposer: 'Finance Director',
      dateProposed: '2026-06-02',
      status: 'Pending',
      effectedField: 'serviceChargePercent',
      effectedValue: 12.5
    },
    {
      id: 'CHG-302',
      title: 'Deploy Winter Off-Season billing multiplier',
      description: 'Set off-season standard billing models. Reconfigure VAT exception rules for regional luxury stays.',
      department: 'Revenue Admin',
      type: 'Configuration',
      urgency: 'High',
      proposer: 'General Manager',
      dateProposed: '2026-06-03',
      status: 'Pending'
    }
  ]);

  // Create Change proposal form
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState('Operations');
  const [newType, setNewType] = useState<'Policy' | 'Fee' | 'Configuration' | 'System'>('Configuration');
  const [newUrgency, setNewUrgency] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');

  const handleAdminChangeDecision = (id: string, decision: 'Approved' | 'Declined') => {
    if (decision === 'Approved') {
      approveAdminChange(id);
    } else {
      declineAdminChange(id);
    }
    // Also sync localChanges so the UI updates immediately when it is the display source
    setLocalChanges(prev => prev ? prev.map(c => c.id === id ? { ...c, status: decision } : c) : null);
    const target = pendingAdminChanges.find(c => c.id === id);
    addStructuredAuditLog({
      userId: 'executive',
      userName: 'Executive Governance',
      device: 'Web Browser',
      ipAddress: '192.168.1.45',
      module: 'Governance',
      recordId: id,
      action: `ADMIN_CHANGE_${decision.toUpperCase()}`,
      details: `${decision} system admin change request: "${target?.title || id}" (${id}).`
    });
    triggerToast(`Admin change "${target?.title}" was ${decision.toLowerCase()}.`, decision === 'Approved' ? 'success' : 'info');
  };

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => {
      setSaveToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleProposalDecision = (id: string, decision: 'Approved' | 'Declined') => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const updated = { ...p, status: decision };

      return updated;
    }));

    const targetProp = proposals.find(p => p.id === id);
    const label = targetProp ? targetProp.title : id;

    addStructuredAuditLog({
      userId: 'executive',
      userName: 'Administrator (Executive)',
      device: 'Web Browser',
      ipAddress: '192.168.1.45',
      module: 'Governance',
      recordId: id,
      action: `GOVERNANCE_${decision.toUpperCase()}`,
      details: `${decision} business change request: "${label}" (${id}).`
    });

    triggerToast(`Proposal ${id} was successfully ${decision.toLowerCase()}!`, decision === 'Approved' ? 'success' : 'info');
  };

  const submitNewChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newId = `CHG-${Math.floor(305 + Math.random() * 100)}`;
    const newProp: ChangeProposal = {
      id: newId,
      title: newTitle,
      description: newDesc,
      department: newDept,
      type: newType,
      urgency: newUrgency,
      proposer: 'Administrator',
      dateProposed: currentSystemDate,
      status: 'Pending'
    };

    setProposals(prev => [newProp, ...prev]);
    setShowApplyModal(false);

    addStructuredAuditLog({
      userId: 'admin',
      userName: 'Administrator (Proposer)',
      device: 'Web Browser',
      ipAddress: '192.168.1.45',
      module: 'Governance',
      recordId: newId,
      action: 'GOVERNANCE_PROPOSED',
      details: `Initiated active business configuration proposal: "${newTitle}" (${newId}).`
    });

    triggerToast(`New change initiative ${newId} submitted for review!`, 'success');
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4">
      {/* Toast Notification */}
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border border-emerald-100 ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-indigo-50 text-indigo-800'
        }`}>
          <CheckCircle2 size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Upper state banner */}
          <div className="bg-white hover:border-indigo-200 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-sans font-black uppercase text-slate-800 tracking-wider">Change Governance Mode: ACTIVE</h4>
                <p className="text-xs text-slate-500 mt-1">Dual-factor review triggers automatically on changes affecting core ledger ratios or billing metrics.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition"
            >
              <Plus size={14} /> Raise Change Initiative
            </button>
          </div>

          {/* Pending System Admin Changes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-600 flex items-center gap-1.5">
                <Lock size={12} /> System Admin Changes Awaiting Approval
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {displayChanges.filter(c => c.status === 'Pending').length} Pending
                </span>
                <button
                  onClick={refreshChanges}
                  disabled={refreshing}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
                  title="Refresh from database"
                >
                  <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {displayChanges.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No pending system admin changes. Changes submitted by the System Administrator will appear here.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {displayChanges.map((change) => {
                  const meta = CHANGE_TYPE_META[change.changeType];
                  const submittedDate = new Date(change.submittedAt).toLocaleString();
                  return (
                    <div key={change.id} className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden">
                      <div className="absolute right-5 top-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase border select-none ${
                          change.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          change.status === 'Declined' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {change.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-w-[80%]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-bold uppercase">{change.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock size={10} /> {submittedDate} by {change.submittedBy}
                          </span>
                        </div>
                        <h4 className="text-sm font-sans font-black text-slate-900 leading-snug">{change.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">{change.description}</p>
                      </div>

                      {change.status === 'Pending' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleAdminChangeDecision(change.id, 'Approved')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 transition"
                          >
                            Approve &amp; Apply
                          </button>
                          <button
                            onClick={() => handleAdminChangeDecision(change.id, 'Declined')}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-rose-700 transition"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          {/* List of active proposals */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">Proposals Queue</span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                {proposals.filter(p => p.status === 'Pending').length} Pending Review
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {proposals.map((prop) => (
                <div key={prop.id} className="bg-white border rounded-3xl border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden">
                  
                  {/* Corner badge for status */}
                  <div className="absolute right-6 top-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase border select-none ${
                      prop.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      prop.status === 'Declined' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  <div className="space-y-2 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-bold uppercase">{prop.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Proposed by {prop.proposer} on {prop.dateProposed}</span>
                    </div>
                    <h4 className="text-sm font-sans font-black text-slate-900 leading-snug">{prop.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{prop.description}</p>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex gap-4">
                      <span>Scope: <strong className="text-slate-600 font-medium">{prop.department} ({prop.type})</strong></span>
                      <span>Urgency: 
                        <strong className={`font-black uppercase ml-1 px-1 rounded text-[9px] ${
                          prop.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700' :
                          prop.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prop.urgency}
                        </strong>
                      </span>
                    </div>
                    {prop.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleProposalDecision(prop.id, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleProposalDecision(prop.id, 'Declined')}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-rose-700 transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Change Proposal Modal */}
          {showApplyModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
                <h3 className="text-lg font-black text-slate-900">Raise Change Initiative</h3>
                <form onSubmit={submitNewChange} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Title</label>
                    <input 
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Brief change description..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Description</label>
                    <textarea 
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="Detailed explanation of the change..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Department</label>
                      <select 
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      >
                        <option>Operations</option>
                        <option>Finance</option>
                        <option>Revenue Admin</option>
                        <option>Front Office</option>
                        <option>Treasury</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Type</label>
                      <select 
                        value={newType}
                        onChange={e => setNewType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      >
                        <option>Policy</option>
                        <option>Fee</option>
                        <option>Configuration</option>
                        <option>System</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
