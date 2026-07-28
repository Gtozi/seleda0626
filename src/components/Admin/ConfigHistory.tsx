import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, History, RotateCcw, ChevronDown, ChevronRight,
  User, Clock, FileText,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';
import { ModalSystem } from '../Shared/ModalSystem';

interface ConfigVersion {
  id: string;
  table_name: string;
  record_id: string;
  diff: any;
  changed_by: string | null;
  changed_at: string;
  version: number;
}

const ConfigHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [filterTable, setFilterTable] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<ConfigVersion | null>(null);

  const token = localStorage.getItem('erp_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url = filterTable ? `/api/admin/config-versions?table=${filterTable}` : '/api/admin/config-versions';
      const res = await fetch(url, { headers });
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [filterTable]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRollback = async () => {
    if (!rollbackTarget) return;
    try {
      await fetch(`/api/admin/config-versions/${rollbackTarget.id}/rollback`, { method: 'POST', headers });
      setRollbackTarget(null);
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  const columns: Column<ConfigVersion>[] = [
    { key: 'version', label: 'Ver', align: 'center', render: (v) => <span className="text-xs font-black text-indigo-600">v{v.version}</span> },
    { key: 'table_name', label: 'Table', render: (v) => <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300">{v.table_name}</span> },
    { key: 'record_id', label: 'Record', render: (v) => <span className="text-[10px] font-mono font-bold text-slate-400">{v.record_id?.slice(0, 12)}</span> },
    { key: 'changed_by', label: 'Changed By', align: 'center', render: (v) => <span className="text-[10px] font-bold text-slate-500">{v.changed_by?.slice(0, 8) || 'system'}</span> },
    { key: 'changed_at', label: 'Timestamp', align: 'center', render: (v) => <span className="text-[10px] font-bold text-slate-500">{new Date(v.changed_at).toLocaleString()}</span> },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (v) => (
      <div className="flex justify-center gap-1">
        <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View diff">
          {expandedId === v.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <button onClick={() => setRollbackTarget(v)} className="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Rollback"><RotateCcw size={14} /></button>
      </div>
    ) },
  ];

  const tableOptions = [...new Set(versions.map(v => v.table_name))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Configuration History</h2>
          <p className="text-xs text-slate-400 font-medium">Track and rollback changes to global settings, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterTable} onChange={e => setFilterTable(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Tables</option>
            {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <DataTable columns={columns} data={versions} rowKey={(r) => r.id} sortable filterable filterPlaceholder="Search versions..." filterKeys={['table_name', 'record_id']} emptyMessage="No config changes recorded." />

      {/* Diff Viewer */}
      {expandedId && versions.find(v => v.id === expandedId) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> Diff Viewer
            </h3>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
            <div className="p-4">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Before</p>
              <pre className="text-[9px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{JSON.stringify(versions.find(v => v.id === expandedId)?.diff?.before || {}, null, 2)}</pre>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">After</p>
              <pre className="text-[9px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{JSON.stringify(versions.find(v => v.id === expandedId)?.diff?.after || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation */}
      <ModalSystem isOpen={!!rollbackTarget} onClose={() => setRollbackTarget(null)} title="Confirm Rollback" subtitle={`Revert ${rollbackTarget?.table_name} to v${rollbackTarget?.version}`} variant="form" size="sm" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
            <p className="text-xs font-black text-amber-600">This will restore the previous configuration state.</p>
            <p className="text-[10px] font-bold text-amber-500 mt-1">Record: {rollbackTarget?.record_id?.slice(0, 12)} · Changed at: {rollbackTarget ? new Date(rollbackTarget.changed_at).toLocaleString() : ''}</p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setRollbackTarget(null)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleRollback} className="px-6 py-2.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition">Rollback</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default ConfigHistory;
