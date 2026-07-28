import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Building2, Hotel, MapPin, Phone, Mail,
  Coins, Calendar, CheckCircle2, XCircle,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface Property {
  id: string;
  org_id: string | null;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
  fiscal_year_start: string | null;
  is_active: boolean;
  organizations?: Organization | null;
}

const PropertyManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showPropModal, setShowPropModal] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', legalName: '', taxId: '', address: '', phone: '', email: '' });
  const [propForm, setPropForm] = useState({ orgId: '', name: '', code: '', address: '', phone: '', email: '', currency: 'ETB', fiscalYearStart: '', isActive: true });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('erp_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const [orgRes, propRes] = await Promise.all([
        fetch('/api/admin/organizations', { headers }).then(r => r.json()),
        fetch('/api/admin/properties', { headers }).then(r => r.json()),
      ]);
      setOrganizations(orgRes.organizations || []);
      setProperties(propRes.properties || []);
    } catch (err: any) { setError(err.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateOrg = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      await fetch('/api/admin/organizations', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(orgForm),
      });
      setShowOrgModal(false);
      setOrgForm({ name: '', legalName: '', taxId: '', address: '', phone: '', email: '' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create organization'); }
  };

  const handleCreateProperty = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      await fetch('/api/admin/properties', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(propForm),
      });
      setShowPropModal(false);
      setPropForm({ orgId: '', name: '', code: '', address: '', phone: '', email: '', currency: 'ETB', fiscalYearStart: '', isActive: true });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create property'); }
  };

  const propColumns: Column<Property>[] = [
    { key: 'name', label: 'Property', render: (p) => (
      <div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{p.name}</span>
        {p.code && <span className="ml-2 text-[9px] font-mono font-black text-slate-400 uppercase">{p.code}</span>}
      </div>
    ) },
    { key: 'organizations', label: 'Organization', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.organizations?.name || '—'}</span> },
    { key: 'currency', label: 'Currency', align: 'center', render: (p) => <span className="text-[10px] font-black text-indigo-600">{p.currency}</span> },
    { key: 'address', label: 'Address', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.address || '—'}</span> },
    { key: 'phone', label: 'Phone', align: 'center', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.phone || '—'}</span> },
    { key: 'is_active', label: 'Status', align: 'center', render: (p) => (
      <div className="flex justify-center">
        {p.is_active
          ? <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600"><CheckCircle2 size={11} /> Active</span>
          : <span className="flex items-center gap-1 text-[9px] font-black text-slate-400"><XCircle size={11} /> Inactive</span>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Organization & Property Hierarchy</h2>
          <p className="text-xs text-slate-400 font-medium">Multi-property management with org-level grouping and property-level scoping</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowPropModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Plus size={16} /> Add Property
          </button>
          <button onClick={() => setShowOrgModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Add Organization
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Organizations */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <Building2 size={16} className="text-emerald-500" /> Organizations ({organizations.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map(org => {
            const orgProperties = properties.filter(p => p.org_id === org.id);
            return (
              <div key={org.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"><Building2 size={18} /></div>
                  <span className="text-[9px] font-black text-slate-400">{orgProperties.length} properties</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{org.name}</h4>
                {org.legal_name && <p className="text-[10px] font-bold text-slate-500 mt-0.5">{org.legal_name}</p>}
                <div className="mt-3 space-y-1">
                  {org.tax_id && <p className="text-[9px] font-bold text-slate-400">TIN: {org.tax_id}</p>}
                  {org.address && <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={8} /> {org.address}</p>}
                  {org.phone && <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Phone size={8} /> {org.phone}</p>}
                  {org.email && <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Mail size={8} /> {org.email}</p>}
                </div>
                {orgProperties.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Properties</p>
                    {orgProperties.map(p => (
                      <div key={p.id} className="flex items-center gap-1.5 py-0.5">
                        <Hotel size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{p.name}</span>
                        {p.code && <span className="text-[8px] font-mono text-slate-400">{p.code}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {organizations.length === 0 && <p className="text-xs text-slate-400 font-bold col-span-full text-center py-8">No organizations yet.</p>}
        </div>
      </div>

      {/* Properties Table */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <Hotel size={16} className="text-indigo-500" /> Properties ({properties.length})
        </h3>
        <DataTable columns={propColumns} data={properties} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search properties..." filterKeys={['name', 'code', 'currency']} emptyMessage="No properties yet." />
      </div>

      {/* Organization Modal */}
      <ModalSystem isOpen={showOrgModal} onClose={() => setShowOrgModal(false)} title="New Organization" subtitle="Create a hotel group or chain entity" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Name</label>
              <input value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Gheralta Hotels" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Legal Name</label>
              <input value={orgForm.legalName} onChange={e => setOrgForm({ ...orgForm, legalName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Gheralta Hotels Group Ltd." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Tax ID</label>
              <input value={orgForm.taxId} onChange={e => setOrgForm({ ...orgForm, taxId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Phone</label>
              <input value={orgForm.phone} onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Address</label>
            <input value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email</label>
            <input value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowOrgModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateOrg} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create</button>
        </div>
      </ModalSystem>

      {/* Property Modal */}
      <ModalSystem isOpen={showPropModal} onClose={() => setShowPropModal(false)} title="New Property" subtitle="Register a hotel property under an organization" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Organization</label>
            <select value={propForm.orgId} onChange={e => setPropForm({ ...propForm, orgId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— Select Organization —</option>
              {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Property Name</label>
              <input value={propForm.name} onChange={e => setPropForm({ ...propForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Gheralta Main Hotel" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Code</label>
              <input value={propForm.code} onChange={e => setPropForm({ ...propForm, code: e.target.value.toUpperCase() })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., GHM" maxLength={5} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Currency</label>
              <select value={propForm.currency} onChange={e => setPropForm({ ...propForm, currency: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                <option>ETB</option><option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Fiscal Year Start</label>
              <input type="date" value={propForm.fiscalYearStart} onChange={e => setPropForm({ ...propForm, fiscalYearStart: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Phone</label>
              <input value={propForm.phone} onChange={e => setPropForm({ ...propForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email</label>
              <input value={propForm.email} onChange={e => setPropForm({ ...propForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Active</label>
              <select value={String(propForm.isActive)} onChange={e => setPropForm({ ...propForm, isActive: e.target.value === 'true' })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Address</label>
            <input value={propForm.address} onChange={e => setPropForm({ ...propForm, address: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowPropModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateProperty} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Create Property</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default PropertyManager;
