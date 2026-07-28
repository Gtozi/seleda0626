/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, Crown, Baby, User, X, Wallet } from 'lucide-react';
import { Guest } from '../../types/erp';

export interface SharedGuest {
  share_id: string;
  guest_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_status: string;
  role: 'primary' | 'sharing' | 'child';
  is_primary_occupant: boolean;
  billing_split: 'shared' | 'separate' | 'primary_pays';
  folio_label: string | null;
  preferences: any;
  notes: string | null;
  created_at: string;
}

interface SharedGuestsPanelProps {
  reservationId: string;
  guests: Guest[];
  onRefresh?: () => void;
}

export default function SharedGuestsPanel({ reservationId, guests, onRefresh }: SharedGuestsPanelProps) {
  const [sharedGuests, setSharedGuests] = useState<SharedGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGuestRole, setNewGuestRole] = useState<'sharing' | 'child'>('sharing');
  const [newGuestBilling, setNewGuestBilling] = useState<'shared' | 'separate' | 'primary_pays'>('shared');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [error, setError] = useState('');

  const fetchSharedGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share-reservations/${reservationId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSharedGuests(data.sharedGuests || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchSharedGuests();
  }, [fetchSharedGuests]);

  const handleAddGuest = async () => {
    if (!selectedGuestId) {
      setError('Please select a guest');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/share-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reservation_id: reservationId,
          guest_id: selectedGuestId,
          role: newGuestRole,
          billing_split: newGuestBilling,
        }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setSelectedGuestId('');
        setSearchQuery('');
        fetchSharedGuests();
        onRefresh?.();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add guest');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleRemoveGuest = async (shareId: string) => {
    try {
      const res = await fetch(`/api/share-reservations/${shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchSharedGuests();
        onRefresh?.();
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateRole = async (shareId: string, role: string) => {
    try {
      await fetch(`/api/share-reservations/${shareId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      fetchSharedGuests();
    } catch {
      // ignore
    }
  };

  const handleUpdateBilling = async (shareId: string, billing_split: string) => {
    try {
      await fetch(`/api/share-reservations/${shareId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ billing_split }),
      });
      fetchSharedGuests();
    } catch {
      // ignore
    }
  };

  const filteredGuests = guests.filter(g => {
    if (sharedGuests.some(sg => sg.guest_id === g.id)) return false;
    if (!searchQuery) return true;
    return g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           g.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const roleIcon = (role: string) => {
    if (role === 'primary') return <Crown size={12} className="text-amber-500" />;
    if (role === 'child') return <Baby size={12} className="text-sky-500" />;
    return <User size={12} className="text-indigo-500" />;
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      primary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      sharing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      child: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    };
    return styles[role] || styles.sharing;
  };

  const billingBadge = (billing: string) => {
    const styles: Record<string, string> = {
      shared: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      separate: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      primary_pays: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    const labels: Record<string, string> = {
      shared: 'Shared',
      separate: 'Separate Folio',
      primary_pays: 'Primary Pays',
    };
    return { className: styles[billing] || styles.shared, label: labels[billing] || billing };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Shared Guests</h4>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
            {sharedGuests.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-all border border-indigo-200/60 dark:border-indigo-800/50"
        >
          <UserPlus size={12} /> Add Guest
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Link a Guest to This Reservation</span>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
              <X size={14} className="text-slate-400" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search guests by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredGuests.length === 0 ? (
              <div className="text-center text-[10px] text-slate-400 py-3 italic">No matching guests found</div>
            ) : (
              filteredGuests.slice(0, 8).map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuestId(g.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${selectedGuestId === g.id ? 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{g.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{g.email}</div>
                  </div>
                  {selectedGuestId === g.id && <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                </button>
              ))
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Role</label>
              <select
                value={newGuestRole}
                onChange={e => setNewGuestRole(e.target.value as 'sharing' | 'child')}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-400"
              >
                <option value="sharing">Sharing</option>
                <option value="child">Child</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Billing</label>
              <select
                value={newGuestBilling}
                onChange={e => setNewGuestBilling(e.target.value as 'shared' | 'separate' | 'primary_pays')}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-400"
              >
                <option value="shared">Shared Folio</option>
                <option value="separate">Separate Folio</option>
                <option value="primary_pays">Primary Pays</option>
              </select>
            </div>
          </div>
          {error && <div className="text-[10px] text-rose-500 font-medium">{error}</div>}
          <button
            onClick={handleAddGuest}
            disabled={!selectedGuestId}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus size={12} /> Link Guest
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-[10px] text-slate-400 py-4 italic">Loading shared guests...</div>
      ) : sharedGuests.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <Users size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
          <div className="text-[10px] text-slate-400 font-mono">No shared guests linked yet</div>
        </div>
      ) : (
        <div className="space-y-2">
          {sharedGuests.map(sg => {
            const billing = billingBadge(sg.billing_split);
            return (
              <div key={sg.share_id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${sg.role === 'primary' ? 'bg-amber-500' : sg.role === 'child' ? 'bg-sky-500' : 'bg-indigo-500'}`}>
                    {sg.guest_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{sg.guest_name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${roleBadge(sg.role)} flex items-center gap-0.5`}>
                        {roleIcon(sg.role)} {sg.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{sg.guest_email}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${billing.className} flex items-center gap-0.5`}>
                        <Wallet size={8} /> {billing.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={sg.role}
                    onChange={e => handleUpdateRole(sg.share_id, e.target.value)}
                    className="text-[10px] px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="primary">Primary</option>
                    <option value="sharing">Sharing</option>
                    <option value="child">Child</option>
                  </select>
                  <select
                    value={sg.billing_split}
                    onChange={e => handleUpdateBilling(sg.share_id, e.target.value)}
                    className="text-[10px] px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="shared">Shared</option>
                    <option value="separate">Separate</option>
                    <option value="primary_pays">Primary Pays</option>
                  </select>
                  <button
                    onClick={() => handleRemoveGuest(sg.share_id)}
                    className="p-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 rounded-lg transition"
                    title="Remove from reservation"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
