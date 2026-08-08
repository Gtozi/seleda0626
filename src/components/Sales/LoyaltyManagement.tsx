import React, { useState } from 'react';
import {
  Plus, RefreshCw, Crown, Star, Gift,
  BedDouble, Utensils, Sparkles,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];
interface LoyaltyMember {
  id: string;
  name: string;
  tier: string;
  points: number;
  totalStays: number;
  totalSpend: number;
  rewardsRedeemed: number;
  enrollmentDate: string;
  status: string;
}

const LoyaltyManagement: React.FC = () => {
  const [members] = useState<LoyaltyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', tier: 'Bronze', points: 0 });

  const columns: Column<LoyaltyMember>[] = [
    { key: 'name', label: 'Member', render: (m) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Crown size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{m.name}</span>
      </div>
    ) },
    { key: 'tier', label: 'Tier', align: 'center', render: (m) => {
      const colors: Record<string, string> = { Bronze: 'bg-orange-50 text-orange-600', Silver: 'bg-slate-50 text-slate-500', Gold: 'bg-amber-50 text-amber-600', Platinum: 'bg-slate-100 text-slate-700' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[m.tier] || colors['Bronze']}`}>{m.tier}</span>;
    } },
    { key: 'points', label: 'Points', align: 'right', render: (m) => <span className="text-xs font-black text-amber-600">{m.points.toLocaleString()}</span> },
    { key: 'totalStays', label: 'Stays', align: 'center', render: (m) => <span className="text-[10px] font-black text-slate-600">{m.totalStays}</span> },
    { key: 'totalSpend', label: 'Spend', align: 'right', render: (m) => <span className="text-xs font-black text-emerald-600">${m.totalSpend.toLocaleString()}</span> },
    { key: 'rewardsRedeemed', label: 'Rewards', align: 'center', render: (m) => <span className="text-[10px] font-black text-purple-600">{m.rewardsRedeemed}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (m) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Inactive: 'bg-slate-100 text-slate-500', Suspended: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[m.status] || colors['Active']}`}>{m.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Loyalty Management</h2>
          <p className="text-xs text-slate-400 font-medium">Membership enrollment, tier management, points, rewards, and redemption</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-amber-200">
            <Plus size={16} /> Enroll Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TIERS.map(tier => {
          const count = members.filter(m => m.tier === tier).length;
          const colors: Record<string, string> = { Bronze: 'bg-orange-50 text-orange-600', Silver: 'bg-slate-50 text-slate-500', Gold: 'bg-amber-50 text-amber-600', Platinum: 'bg-slate-100 text-slate-700' };
          return (
            <div key={tier} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
              <div className={`p-2 w-fit rounded-xl ${colors[tier]} mb-3`}><Crown size={16} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{tier} Members</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{count}</h3>
            </div>
          );
        })}
      </div>

      {/* Rewards Catalog */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Reward Catalog</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Free Nights', icon: BedDouble, points: 5000, color: 'bg-indigo-50 text-indigo-600' },
            { name: 'Room Upgrades', icon: Star, points: 3000, color: 'bg-purple-50 text-purple-600' },
            { name: 'Dining Rewards', icon: Utensils, points: 1500, color: 'bg-amber-50 text-amber-600' },
            { name: 'Spa Rewards', icon: Sparkles, points: 2500, color: 'bg-emerald-50 text-emerald-600' },
            { name: 'Exclusive Offers', icon: Gift, points: 1000, color: 'bg-rose-50 text-rose-600' },
          ].map(reward => {
            const Icon = reward.icon;
            return (
              <div key={reward.name} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className={`p-2 w-fit rounded-xl ${reward.color} mb-2`}><Icon size={16} /></div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{reward.name}</p>
                <p className="text-[10px] font-bold text-amber-600 mt-1">{reward.points.toLocaleString()} pts</p>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable columns={columns} data={members} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search members..." filterKeys={['name', 'tier', 'status']} emptyMessage="No loyalty members enrolled yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Enroll Loyalty Member" subtitle="Register a new loyalty program member" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Member Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Tier</label>
              <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500">
                {TIERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Starting Points</label>
              <input type="number" value={form.points} onChange={e => setForm({ ...form, points: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition">Enroll</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default LoyaltyManagement;
