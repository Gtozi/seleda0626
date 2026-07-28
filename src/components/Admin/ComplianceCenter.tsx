import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Shield, Download, Trash2, FileText, CheckCircle2,
  AlertTriangle, Clock, Lock,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';
import { ModalSystem } from '../Shared/ModalSystem';

interface ConsentLog {
  id: string;
  guest_id: string | null;
  consent_type: string;
  granted: boolean;
  policy_version: string | null;
  timestamp: string;
}

interface RetentionPolicy {
  id: string;
  table_name: string;
  retention_days: number;
  action: string;
  enabled: boolean;
}

interface PiiRequest {
  id: string;
  requested_by: string | null;
  target_entity: string;
  status: string;
  exported_at: string | null;
  erased_at: string | null;
  created_at: string;
}

const ComplianceCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'consent' | 'retention' | 'requests'>('overview');
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [exports, setExports] = useState<PiiRequest[]>([]);
  const [erasures, setErasures] = useState<PiiRequest[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEraseModal, setShowEraseModal] = useState(false);
  const [targetEntity, setTargetEntity] = useState('');
  const [exportResult, setExportResult] = useState<any>(null);
  const [editPolicy, setEditPolicy] = useState<RetentionPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState({ retentionDays: 365, action: 'archive', enabled: true });

  const token = localStorage.getItem('erp_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [consentRes, retentionRes, reqRes] = await Promise.all([
        fetch('/api/admin/compliance/consent-logs', { headers }).then(r => r.json()),
        fetch('/api/admin/compliance/retention-policies', { headers }).then(r => r.json()),
        fetch('/api/admin/compliance/requests', { headers }).then(r => r.json()),
      ]);
      setConsentLogs(consentRes.logs || []);
      setPolicies(retentionRes.policies || []);
      setExports(reqRes.exports || []);
      setErasures(reqRes.erasures || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/compliance/pii-export', {
        method: 'POST', headers, body: JSON.stringify({ targetEntity }),
      });
      const data = await res.json();
      if (data.success) {
        setExportResult(data.data);
        loadData();
      } else { setError(data.error || 'Export failed'); }
    } catch (err: any) { setError(err.message); }
  };

  const handleErase = async () => {
    try {
      const res = await fetch('/api/admin/compliance/pii-erasure', {
        method: 'POST', headers, body: JSON.stringify({ targetEntity }),
      });
      const data = await res.json();
      if (data.success) { setShowEraseModal(false); setTargetEntity(''); loadData(); }
      else { setError(data.error || 'Erasure failed'); }
    } catch (err: any) { setError(err.message); }
  };

  const handleSavePolicy = async () => {
    if (!editPolicy) return;
    try {
      await fetch(`/api/admin/compliance/retention-policies/${editPolicy.id}`, {
        method: 'PATCH', headers, body: JSON.stringify(policyForm),
      });
      setEditPolicy(null); loadData();
    } catch (err: any) { setError(err.message); }
  };

  const consentColumns: Column<ConsentLog>[] = [
    { key: 'guest_id', label: 'Guest ID', render: (l) => <span className="text-[10px] font-mono font-black text-slate-400">{l.guest_id?.slice(0, 12) || '—'}</span> },
    { key: 'consent_type', label: 'Type', render: (l) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{l.consent_type}</span> },
    { key: 'granted', label: 'Granted', align: 'center', render: (l) => l.granted ? <CheckCircle2 size={14} className="text-emerald-600 inline" /> : <AlertTriangle size={14} className="text-rose-600 inline" /> },
    { key: 'policy_version', label: 'Policy', align: 'center', render: (l) => <span className="text-[10px] font-bold text-slate-400">{l.policy_version || '—'}</span> },
    { key: 'timestamp', label: 'Timestamp', align: 'center', render: (l) => <span className="text-[10px] font-bold text-slate-500">{new Date(l.timestamp).toLocaleString()}</span> },
  ];

  const retentionColumns: Column<RetentionPolicy>[] = [
    { key: 'table_name', label: 'Table', render: (p) => <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">{p.table_name}</span> },
    { key: 'retention_days', label: 'Retention', align: 'right', render: (p) => <span className="text-xs font-black text-indigo-600">{p.retention_days} days</span> },
    { key: 'action', label: 'Action', align: 'center', render: (p) => <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.action === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{p.action}</span> },
    { key: 'enabled', label: 'Status', align: 'center', render: (p) => (
      <button onClick={() => { setEditPolicy(p); setPolicyForm({ retentionDays: p.retention_days, action: p.action, enabled: p.enabled }); }} className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
        {p.enabled ? 'Active' : 'Disabled'}
      </button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Compliance Center</h2>
          <p className="text-xs text-slate-400 font-medium">GDPR/PCI tooling, PII export/erasure, consent management, data retention</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => { setTargetEntity(''); setExportResult(null); setShowExportModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Download size={16} /> PII Export
          </button>
          <button onClick={() => { setTargetEntity(''); setShowEraseModal(true); }} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-rose-200">
            <Trash2 size={16} /> PII Erasure
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'consent', label: 'Consent Logs' },
          { id: 'retention', label: 'Retention Policies' },
          { id: 'requests', label: 'PII Requests' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`py-2.5 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition ${tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
            <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><Shield size={18} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consent Records</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{consentLogs.length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
            <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><Clock size={18} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retention Policies</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{policies.filter(p => p.enabled).length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
            <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><Download size={18} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PII Exports</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{exports.length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
            <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><Trash2 size={18} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PII Erasures</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{erasures.length}</h3>
          </div>
        </div>
      )}

      {/* Consent Logs */}
      {tab === 'consent' && <DataTable columns={consentColumns} data={consentLogs} rowKey={(r) => r.id} sortable filterable filterPlaceholder="Search consent logs..." filterKeys={['consent_type', 'guest_id']} emptyMessage="No consent logs recorded." />}

      {/* Retention Policies */}
      {tab === 'retention' && <DataTable columns={retentionColumns} data={policies} rowKey={(r) => r.id} sortable filterable filterPlaceholder="Search policies..." filterKeys={['table_name', 'action']} emptyMessage="No retention policies configured." />}

      {/* PII Requests */}
      {tab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2"><Download size={16} className="text-indigo-500" /> Export Requests ({exports.length})</h3>
            <DataTable
              columns={[
                { key: 'target_entity', label: 'Target', render: (r: PiiRequest) => <span className="text-[10px] font-mono font-bold text-slate-500">{r.target_entity.slice(0, 12)}</span> },
                { key: 'status', label: 'Status', align: 'center', render: (r: PiiRequest) => <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{r.status}</span> },
                { key: 'exported_at', label: 'Exported At', align: 'center', render: (r: PiiRequest) => <span className="text-[10px] font-bold text-slate-500">{r.exported_at ? new Date(r.exported_at).toLocaleString() : '—'}</span> },
              ] as Column<PiiRequest>[]}
              data={exports} rowKey={(r) => r.id} emptyMessage="No export requests."
            />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2"><Trash2 size={16} className="text-rose-500" /> Erasure Requests ({erasures.length})</h3>
            <DataTable
              columns={[
                { key: 'target_entity', label: 'Target', render: (r: PiiRequest) => <span className="text-[10px] font-mono font-bold text-slate-500">{r.target_entity.slice(0, 12)}</span> },
                { key: 'status', label: 'Status', align: 'center', render: (r: PiiRequest) => <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{r.status}</span> },
                { key: 'erased_at', label: 'Erased At', align: 'center', render: (r: PiiRequest) => <span className="text-[10px] font-bold text-slate-500">{r.erased_at ? new Date(r.erased_at).toLocaleString() : '—'}</span> },
              ] as Column<PiiRequest>[]}
              data={erasures} rowKey={(r) => r.id} emptyMessage="No erasure requests."
            />
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ModalSystem isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="PII Export" subtitle="Export all data for a guest entity (GDPR right to access)" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guest ID</label>
            <input value={targetEntity} onChange={e => setTargetEntity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter guest UUID" />
          </div>
          {exportResult && (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 max-h-64 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exported Data</p>
              <pre className="text-[9px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{JSON.stringify(exportResult, null, 2)}</pre>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowExportModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Close</button>
          <button onClick={handleExport} disabled={!targetEntity.trim()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition">Export Data</button>
        </div>
      </ModalSystem>

      {/* Erasure Modal */}
      <ModalSystem isOpen={showEraseModal} onClose={() => setShowEraseModal(false)} title="PII Erasure" subtitle="Anonymize guest PII data (GDPR right to erasure)" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-rose-600 dark:text-rose-400">Warning: This action is irreversible</p>
              <p className="text-[10px] font-bold text-rose-500 mt-1">All PII fields (name, email, phone, address, passport, nationality) will be anonymized. Financial records are retained for legal compliance.</p>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guest ID</label>
            <input value={targetEntity} onChange={e => setTargetEntity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" placeholder="Enter guest UUID" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowEraseModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleErase} disabled={!targetEntity.trim()} className="px-6 py-2.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 transition">Erase PII</button>
        </div>
      </ModalSystem>

      {/* Policy Edit Modal */}
      <ModalSystem isOpen={!!editPolicy} onClose={() => setEditPolicy(null)} title="Edit Retention Policy" subtitle={editPolicy?.table_name} variant="form" size="sm" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Retention (days)</label>
            <input type="number" value={policyForm.retentionDays} onChange={e => setPolicyForm({ ...policyForm, retentionDays: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Action</label>
            <select value={policyForm.action} onChange={e => setPolicyForm({ ...policyForm, action: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="archive">Archive</option><option value="delete">Delete</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Enabled</label>
            <select value={String(policyForm.enabled)} onChange={e => setPolicyForm({ ...policyForm, enabled: e.target.value === 'true' })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="true">Active</option><option value="false">Disabled</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setEditPolicy(null)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSavePolicy} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Save</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default ComplianceCenter;
