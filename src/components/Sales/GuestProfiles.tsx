import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Users, Star,
  Calendar, Heart,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchLeads } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface GuestProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  loyaltyStatus: string;
  totalStays: number;
  totalSpend: number;
  roomPreference: string;
  dietaryPreference: string;
  specialOccasions: string | null;
  communicationConsent: boolean;
  interests: string | null;
}

const GuestProfiles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', loyaltyStatus: 'Silver',
    roomPreference: 'Standard', dietaryPreference: 'None',
    specialOccasions: '', interests: '', communicationConsent: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const leads = await fetchLeads().catch(() => []);
      const mapped: GuestProfile[] = leads.map(l => ({
        id: l.id,
        name: l.lead_name,
        email: l.contact_email,
        phone: l.contact_phone,
        loyaltyStatus: 'Silver',
        totalStays: 0,
        totalSpend: Number(l.opportunity_value || 0),
        roomPreference: 'Standard',
        dietaryPreference: 'None',
        specialOccasions: null,
        communicationConsent: true,
        interests: l.notes,
      }));
      setGuests(mapped);
    } catch (err: any) { setError(err.message || 'Failed to load guest profiles'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const columns: Column<GuestProfile>[] = [
    { key: 'name', label: 'Guest Name', render: (g) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Users size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{g.name}</span>
      </div>
    ) },
    { key: 'email', label: 'Email', render: (g) => <span className="text-[10px] font-bold text-slate-500">{g.email || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (g) => <span className="text-[10px] font-bold text-slate-500">{g.phone || '—'}</span> },
    { key: 'loyaltyStatus', label: 'Loyalty', align: 'center', render: (g) => {
      const colors: Record<string, string> = { Platinum: 'bg-slate-100 text-slate-700', Gold: 'bg-amber-50 text-amber-600', Silver: 'bg-slate-50 text-slate-500', Bronze: 'bg-orange-50 text-orange-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[g.loyaltyStatus] || colors['Silver']}`}>{g.loyaltyStatus}</span>;
    } },
    { key: 'totalStays', label: 'Stays', align: 'center', render: (g) => <span className="text-[10px] font-black text-slate-600">{g.totalStays}</span> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: (g) => <span className="text-xs font-black text-emerald-600">${fmt(g.totalSpend)}</span> },
    { key: 'roomPreference', label: 'Room Pref', align: 'center', render: (g) => <span className="text-[10px] font-bold text-slate-500">{g.roomPreference}</span> },
    { key: 'dietaryPreference', label: 'Dietary', align: 'center', render: (g) => <span className="text-[10px] font-bold text-slate-500">{g.dietaryPreference}</span> },
    { key: 'communicationConsent', label: 'Consent', align: 'center', render: (g) => (
      <span className={`text-[10px] font-black ${g.communicationConsent ? 'text-emerald-600' : 'text-rose-500'}`}>{g.communicationConsent ? 'Yes' : 'No'}</span>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Guest Profiles</h2>
          <p className="text-xs text-slate-400 font-medium">Personal information, preferences, stay history, and spend analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Add Guest
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><Users size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Guests</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{guests.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><Star size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Loyalty Members</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{guests.filter(g => g.loyaltyStatus !== 'Silver').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><Calendar size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Stays</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{guests.reduce((s, g) => s + g.totalStays, 0)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><Heart size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Spend</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(guests.reduce((s, g) => s + g.totalSpend, 0))}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={guests} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search guests..." filterKeys={['name', 'email', 'phone', 'loyaltyStatus']} emptyMessage="No guest profiles found." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Guest Profile" subtitle="Register a new guest with preferences" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guest Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Loyalty Status</label>
              <select value={form.loyaltyStatus} onChange={e => setForm({ ...form, loyaltyStatus: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Room Preference</label>
              <select value={form.roomPreference} onChange={e => setForm({ ...form, roomPreference: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Standard</option><option>Deluxe</option><option>Suite</option><option>Executive Floor</option><option>Connecting Rooms</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Dietary Preference</label>
              <select value={form.dietaryPreference} onChange={e => setForm({ ...form, dietaryPreference: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>None</option><option>Vegetarian</option><option>Vegan</option><option>Halal</option><option>Gluten-Free</option><option>Kosher</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Special Occasions</label>
            <input value={form.specialOccasions} onChange={e => setForm({ ...form, specialOccasions: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Anniversary, Birthday" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guest Interests</label>
            <input value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Spa, Golf, Business" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.communicationConsent} onChange={e => setForm({ ...form, communicationConsent: e.target.checked })} className="w-4 h-4 rounded accent-emerald-600" />
            <span className="text-xs font-bold text-slate-600">Communication consent (GDPR compliance)</span>
          </label>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Add Guest</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default GuestProfiles;
