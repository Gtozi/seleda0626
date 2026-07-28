import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Key, Plus, Copy, Check, Ban, Clock, Activity,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';
import { ModalSystem } from '../Shared/ModalSystem';

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  rate_limit: number;
  created_at: string;
  expires_at: string | null;
  last_used: string | null;
  disabled: boolean;
}

const AVAILABLE_SCOPES = [
  'reservations:read', 'reservations:write',
  'rooms:read', 'rooms:write',
  'guests:read', 'guests:write',
  'folios:read', 'folios:write',
  'reports:read',
  'inventory:read', 'inventory:write',
  '*',
];

const APIManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; scopes: string[]; rateLimit: number; expiresAt: string }>({ name: '', scopes: [], rateLimit: 100, expiresAt: '' });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('erp_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/api-keys', { headers });
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST', headers, body: JSON.stringify(newKey),
      });
      const data = await res.json();
      if (data.rawKey) {
        setCreatedKey(data.rawKey);
        loadData();
      } else { setError(data.error || 'Failed to create key'); }
    } catch (err: any) { setError(err.message); }
  };

  const handleToggleDisable = async (key: ApiKey) => {
    try {
      await fetch(`/api/admin/api-keys/${key.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ disabled: !key.disabled }),
      });
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleScope = (scope: string) => {
    setNewKey(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const columns: Column<ApiKey>[] = [
    { key: 'name', label: 'Name', render: (k) => <span className="text-xs font-black text-slate-900 dark:text-white">{k.name}</span> },
    { key: 'key_prefix', label: 'Key Prefix', render: (k) => <span className="text-[10px] font-mono font-black text-slate-400">{k.key_prefix}...</span> },
    { key: 'scopes', label: 'Scopes', render: (k) => (
      <div className="flex flex-wrap gap-1">
        {k.scopes.length === 0 ? <span className="text-[10px] text-slate-400">No scopes</span> :
          k.scopes.slice(0, 3).map(s => <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black font-mono">{s}</span>)}
        {k.scopes.length > 3 && <span className="text-[8px] font-bold text-slate-400">+{k.scopes.length - 3}</span>}
      </div>
    ) },
    { key: 'rate_limit', label: 'Rate Limit', align: 'center', render: (k) => <span className="text-[10px] font-black text-slate-600">{k.rate_limit}/min</span> },
    { key: 'last_used', label: 'Last Used', align: 'center', render: (k) => <span className="text-[10px] font-bold text-slate-500">{k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}</span> },
    { key: 'expires_at', label: 'Expires', align: 'center', render: (k) => <span className="text-[10px] font-bold text-slate-500">{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}</span> },
    { key: 'disabled', label: 'Status', align: 'center', render: (k) => (
      <button onClick={() => handleToggleDisable(k)} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition ${k.disabled ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
        {k.disabled ? 'Revoked' : 'Active'}
      </button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">API Key Management</h2>
          <p className="text-xs text-slate-400 font-medium">Issue, rotate, and revoke API keys for external integrations with scoped access</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => { setNewKey({ name: '', scopes: [], rateLimit: 100, expiresAt: '' }); setCreatedKey(null); setShowCreateModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Plus size={16} /> Issue Key
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <DataTable columns={columns} data={keys} rowKey={(r) => r.id} sortable filterable filterPlaceholder="Search API keys..." filterKeys={['name', 'key_prefix']} emptyMessage="No API keys issued." />

      {/* Create Key Modal */}
      <ModalSystem isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={createdKey ? 'API Key Created' : 'Issue New API Key'} subtitle={createdKey ? 'Copy your key now — it won\'t be shown again' : 'Generate a scoped API key for external integrations'} variant="form" size="lg" showFooter={false}>
        {createdKey ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
              <Key size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-600">Store this key securely</p>
                <p className="text-[10px] font-bold text-amber-500 mt-1">This is the only time the full key will be displayed. Copy it now.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={createdKey} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono font-bold text-slate-700 outline-none" />
              <button onClick={handleCopy} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-1">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Key Name</label>
              <input value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Channel Manager Integration" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Scopes</label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SCOPES.map(s => (
                  <button key={s} onClick={() => toggleScope(s)} className={`px-2 py-1.5 rounded-lg text-[9px] font-mono font-black border-2 transition ${newKey.scopes.includes(s) ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Rate Limit (req/min)</label>
                <input type="number" value={newKey.rateLimit} onChange={e => setNewKey({ ...newKey, rateLimit: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Expires At (optional)</label>
                <input type="date" value={newKey.expiresAt} onChange={e => setNewKey({ ...newKey, expiresAt: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        )}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">{createdKey ? 'Close' : 'Cancel'}</button>
          {!createdKey && <button onClick={handleCreate} disabled={!newKey.name.trim()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition">Generate Key</button>}
        </div>
      </ModalSystem>
    </div>
  );
};

export default APIManagement;
