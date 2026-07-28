import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, FileText, FileSignature, CheckCircle2, XCircle,
  ChevronRight, Calendar, Users, DollarSign, ArrowRight, Zap,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchProposals, createProposal, updateProposal,
  fetchContracts, createContract, updateContract,
  createGroupBlock, createBEO,
  fetchLeads,
  type Proposal, type Contract, type SalesLead,
} from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const ProposalContract: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [showPropModal, setShowPropModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [propForm, setPropForm] = useState({
    leadId: '', title: '', eventType: 'Conference', eventDates: '',
    guestCount: 0, roomNights: 0, proposedRevenue: 0, discountPercent: 0,
    validUntil: '', termsConditions: 'Standard terms and conditions apply.', notes: '',
  });
  const [contractForm, setContractForm] = useState({
    proposalId: '', leadId: '', title: '', eventType: '', startDate: '', endDate: '',
    guestCount: 0, roomNights: 0, totalValue: 0, depositAmount: 0,
    terms: 'Contract terms per signed agreement.', signedByClient: '', signedDate: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [p, c, l] = await Promise.all([fetchProposals(), fetchContracts(), fetchLeads()]);
      setProposals(p); setContracts(c); setLeads(l);
    } catch (err: any) { setError(err.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateProposal = async () => {
    try {
      await createProposal(propForm);
      setShowPropModal(false);
      setPropForm({ leadId: '', title: '', eventType: 'Conference', eventDates: '', guestCount: 0, roomNights: 0, proposedRevenue: 0, discountPercent: 0, validUntil: '', termsConditions: 'Standard terms and conditions apply.', notes: '' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create proposal'); }
  };

  const handleSendProposal = async (prop: Proposal) => {
    try { await updateProposal(prop.id, { status: 'Sent', sentDate: new Date().toISOString().split('T')[0] }); loadData(); }
    catch (err: any) { setError(err.message || 'Failed to send proposal'); }
  };

  const handleAcceptProposal = async (prop: Proposal) => {
    try { await updateProposal(prop.id, { status: 'Accepted', acceptedDate: new Date().toISOString().split('T')[0] }); loadData(); }
    catch (err: any) { setError(err.message || 'Failed to accept proposal'); }
  };

  const handleRejectProposal = async (prop: Proposal) => {
    try { await updateProposal(prop.id, { status: 'Rejected', rejectedDate: new Date().toISOString().split('T')[0] }); loadData(); }
    catch (err: any) { setError(err.message || 'Failed to reject proposal'); }
  };

  const handleCreateContract = async () => {
    try {
      await createContract(contractForm);
      setShowContractModal(false);
      setContractForm({ proposalId: '', leadId: '', title: '', eventType: '', startDate: '', endDate: '', guestCount: 0, roomNights: 0, totalValue: 0, depositAmount: 0, terms: 'Contract terms per signed agreement.', signedByClient: '', signedDate: '' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create contract'); }
  };

  const handleCreateGroupBlock = async (contract: Contract) => {
    try { await createGroupBlock(contract.id); loadData(); }
    catch (err: any) { setError(err.message || 'Failed to create group block'); }
  };

  const handleCreateBEO = async (contract: Contract) => {
    try { await createBEO(contract.id); loadData(); }
    catch (err: any) { setError(err.message || 'Failed to create BEO'); }
  };

  const propColumns: Column<Proposal>[] = [
    { key: 'proposal_number', label: 'Proposal #', render: (p) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{p.proposal_number || p.id.slice(0, 8)}</span> },
    { key: 'title', label: 'Title', render: (p) => <span className="text-xs font-black text-slate-900 dark:text-white">{p.title}</span> },
    { key: 'lead', label: 'Lead', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.sales_leads?.lead_name || '—'}</span> },
    { key: 'event_type', label: 'Type', align: 'center', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.event_type || '—'}</span> },
    { key: 'proposed_revenue', label: 'Revenue', align: 'right', render: (p) => <span className="text-xs font-black text-emerald-600">${fmt(p.proposed_revenue)}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (p) => {
      const colors: Record<string, string> = { Draft: 'bg-slate-50 text-slate-600', Sent: 'bg-blue-50 text-blue-600', Accepted: 'bg-emerald-50 text-emerald-600', Rejected: 'bg-rose-50 text-rose-600' };
      return <div className="flex justify-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[p.status] || colors['Draft']}`}>{p.status}</span></div>;
    } },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (p) => (
      <div className="flex justify-center gap-1">
        {p.status === 'Draft' && <button onClick={() => handleSendProposal(p)} className="p-1.5 text-slate-400 hover:text-blue-600 transition" title="Send"><ArrowRight size={14} /></button>}
        {p.status === 'Sent' && <>
          <button onClick={() => handleAcceptProposal(p)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Accept"><CheckCircle2 size={14} /></button>
          <button onClick={() => handleRejectProposal(p)} className="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Reject"><XCircle size={14} /></button>
        </>}
      </div>
    ) },
  ];

  const contractColumns: Column<Contract>[] = [
    { key: 'contract_number', label: 'Contract #', render: (c) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{c.contract_number || c.id.slice(0, 8)}</span> },
    { key: 'title', label: 'Title', render: (c) => <span className="text-xs font-black text-slate-900 dark:text-white">{c.title}</span> },
    { key: 'account', label: 'Account', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.corporate_accounts?.company_name || '—'}</span> },
    { key: 'total_value', label: 'Value', align: 'right', render: (c) => <span className="text-xs font-black text-emerald-600">${fmt(c.total_value)}</span> },
    { key: 'start_date', label: 'Start', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.start_date || '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (c) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Completed: 'bg-slate-50 text-slate-600', Cancelled: 'bg-rose-50 text-rose-600' };
      return <div className="flex justify-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[c.status] || colors['Active']}`}>{c.status}</span></div>;
    } },
    { key: 'handoff', label: 'Handoff', align: 'center', sortable: false, render: (c) => (
      <div className="flex justify-center gap-1">
        {!c.group_block_id && <button onClick={() => handleCreateGroupBlock(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Create Group Block"><Users size={14} /></button>}
        {c.group_block_id && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[7px] font-black uppercase">Block</span>}
        {!c.beo_id && <button onClick={() => handleCreateBEO(c)} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Create BEO"><Zap size={14} /></button>}
        {c.beo_id && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[7px] font-black uppercase">BEO</span>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Proposals & Contracts</h2>
          <p className="text-xs text-slate-400 font-medium">Generate proposals, convert to contracts, create group blocks and BEOs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowContractModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <FileSignature size={16} /> New Contract
          </button>
          <button onClick={() => setShowPropModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Proposal
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Proposals */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <FileText size={16} className="text-emerald-500" /> Proposals ({proposals.length})
        </h3>
        <DataTable columns={propColumns} data={proposals} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search proposals..." filterKeys={['title', 'status', 'event_type']} emptyMessage="No proposals yet." />
      </div>

      {/* Contracts */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <FileSignature size={16} className="text-indigo-500" /> Contracts ({contracts.length})
        </h3>
        <DataTable columns={contractColumns} data={contracts} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search contracts..." filterKeys={['title', 'status', 'contract_number']} emptyMessage="No contracts yet." />
      </div>

      {/* Proposal Modal */}
      <ModalSystem isOpen={showPropModal} onClose={() => setShowPropModal(false)} title="New Proposal" subtitle="Generate a proposal from a lead" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Select Lead</label>
            <select value={propForm.leadId} onChange={e => setPropForm({ ...propForm, leadId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">— Select Lead —</option>
              {leads.filter(l => l.stage !== 'Lost').map(l => <option key={l.id} value={l.id}>{l.lead_name} ({l.company || '—'}) — ${fmt(l.opportunity_value)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Proposal Title</label>
            <input value={propForm.title} onChange={e => setPropForm({ ...propForm, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Annual Corporate Retreat Package" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Event Type</label>
              <select value={propForm.eventType} onChange={e => setPropForm({ ...propForm, eventType: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Conference</option><option>Wedding</option><option>Corporate Retreat</option><option>Banquet</option><option>Meeting</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Event Dates</label>
              <input value={propForm.eventDates} onChange={e => setPropForm({ ...propForm, eventDates: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Mar 15-18, 2026" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guests</label>
              <input type="number" value={propForm.guestCount} onChange={e => setPropForm({ ...propForm, guestCount: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Room Nights</label>
              <input type="number" value={propForm.roomNights} onChange={e => setPropForm({ ...propForm, roomNights: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Revenue ($)</label>
              <input type="number" value={propForm.proposedRevenue} onChange={e => setPropForm({ ...propForm, proposedRevenue: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Discount (%)</label>
              <input type="number" value={propForm.discountPercent} onChange={e => setPropForm({ ...propForm, discountPercent: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Valid Until</label>
            <input type="date" value={propForm.validUntil} onChange={e => setPropForm({ ...propForm, validUntil: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowPropModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateProposal} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Proposal</button>
        </div>
      </ModalSystem>

      {/* Contract Modal */}
      <ModalSystem isOpen={showContractModal} onClose={() => setShowContractModal(false)} title="New Contract" subtitle="Convert accepted proposal to contract" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Select Accepted Proposal</label>
            <select value={contractForm.proposalId} onChange={e => {
              const prop = proposals.find(p => p.id === e.target.value);
              setContractForm({
                ...contractForm,
                proposalId: e.target.value,
                leadId: prop?.lead_id || '',
                title: prop?.title || '',
                eventType: prop?.event_type || '',
                guestCount: prop?.guest_count || 0,
                roomNights: prop?.room_nights || 0,
                totalValue: prop?.proposed_revenue || 0,
              });
            }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— Select Proposal —</option>
              {proposals.filter(p => p.status === 'Accepted').map(p => <option key={p.id} value={p.id}>{p.proposal_number} — {p.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contract Title</label>
              <input value={contractForm.title} onChange={e => setContractForm({ ...contractForm, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Event Type</label>
              <input value={contractForm.eventType} onChange={e => setContractForm({ ...contractForm, eventType: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Start Date</label>
              <input type="date" value={contractForm.startDate} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">End Date</label>
              <input type="date" value={contractForm.endDate} onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guests</label>
              <input type="number" value={contractForm.guestCount} onChange={e => setContractForm({ ...contractForm, guestCount: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Room Nights</label>
              <input type="number" value={contractForm.roomNights} onChange={e => setContractForm({ ...contractForm, roomNights: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Total Value ($)</label>
              <input type="number" value={contractForm.totalValue} onChange={e => setContractForm({ ...contractForm, totalValue: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Deposit ($)</label>
              <input type="number" value={contractForm.depositAmount} onChange={e => setContractForm({ ...contractForm, depositAmount: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Signed By (Client)</label>
              <input value={contractForm.signedByClient} onChange={e => setContractForm({ ...contractForm, signedByClient: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Client name" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Signed Date</label>
              <input type="date" value={contractForm.signedDate} onChange={e => setContractForm({ ...contractForm, signedDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowContractModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateContract} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Create Contract</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default ProposalContract;
