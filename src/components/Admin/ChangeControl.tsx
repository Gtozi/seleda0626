/**
 * Audit Module
 * Handles audit logs and configuration change history
 */

import React, { useState } from 'react';
import { ShieldCheck, Plus, Save, CheckCircle2, GitPullRequest, History, AlertTriangle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

type ChangeTab = 'audit';

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

export default function ChangeControl() {
  const { globalHotelSettings, structuredAuditLogs, addStructuredAuditLog, currentSystemDate } = useERP();
  const [activeTab, setActiveTab] = useState<ChangeTab>('audit');
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

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
      userId: 'admin-001',
      userName: 'Administrator (Business Admin)',
      device: 'Web Browser',
      ipAddress: '192.168.1.45',
      module: 'Change Control',
      action: `CHANGE_CONTROL_${decision.toUpperCase()}`,
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
      userId: 'admin-001',
      userName: 'Administrator (Proposer)',
      device: 'Web Browser',
      ipAddress: '192.168.1.45',
      module: 'Change Control',
      action: 'CHANGE_CONTROL_PROPOSED',
      details: `Initiated active business configuration proposal: "${newTitle}" (${newId}).`
    });

    triggerToast(`New change initiative ${newId} submitted for review!`, 'success');
    setNewTitle('');
    setNewDesc('');
  };

  const currentConfigLogs = structuredAuditLogs;

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

        {activeTab === 'audit' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
                <History size={18} className="text-indigo-500" /> Configuration Change History
              </h2>
              
              <div className="space-y-3">
                {currentConfigLogs.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-xs text-slate-400 font-sans">No configuration changes recorded yet.</p>
                  </div>
                ) : (
                  currentConfigLogs.map((log, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.severity === 'High' ? 'bg-rose-500' :
                        log.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-slate-600">{log.action}</span>
                          <span className="text-[9px] text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 break-words">{log.details}</p>
                        <div className="flex gap-4 mt-2 text-[9px] text-slate-400">
                          <span>User: {log.userName || log.user || 'Unknown'}</span>
                          <span>IP: {log.ipAddress}</span>
                          <span className="font-bold text-emerald-600">Success</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
