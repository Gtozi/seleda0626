import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, CheckCircle2, Download, Car, Globe, ShieldCheck,
  Sparkles, Clock, AlertTriangle, UserCheck, X
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';

interface PreRegistrationPanelProps {
  preRegistrations: any[];
  loading: boolean;
  filter: 'all' | 'pending' | 'reviewed' | 'imported' | 'rejected';
  setFilter: (f: 'all' | 'pending' | 'reviewed' | 'imported' | 'rejected') => void;
  onImport: (id: string) => Promise<void>;
  onReview: (id: string, status: string, notes?: string) => Promise<void>;
  importing: boolean;
}

export default function PreRegistrationPanel({
  preRegistrations, loading, filter, setFilter, onImport, onReview, importing
}: PreRegistrationPanelProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const pendingCount = preRegistrations.filter(p => p.status === 'pending').length;

  const handleImportClick = useCallback(async () => {
    if (!selected) return;
    await onImport(selected.id);
  }, [selected, onImport]);

  const handleReviewClick = useCallback(async (status: string) => {
    if (!selected) return;
    await onReview(selected.id, status, reviewNotes);
    setSelected(null);
    setReviewNotes('');
  }, [selected, onReview, reviewNotes]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-indigo-500" /> Pre-Registration Submissions
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-bold">{pendingCount} pending</span>
            )}
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Guests who submitted check-in details online before arrival</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'reviewed', 'imported', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 italic">Loading pre-registrations...</div>
      ) : preRegistrations.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <ClipboardList size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 font-mono">No pre-registrations found</p>
          <p className="text-[10px] text-slate-300 mt-1">Guests who complete the pre-registration form on the public booking portal will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preRegistrations.map((pr: any) => (
            <div key={pr.id} onClick={() => { setSelected(pr); setReviewNotes(pr.review_notes || ''); }}
              className={`bg-white border rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-all ${pr.status === 'pending' ? 'border-indigo-200' : pr.status === 'imported' ? 'border-emerald-200' : pr.status === 'rejected' ? 'border-rose-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${pr.status === 'pending' ? 'bg-indigo-500' : pr.status === 'imported' ? 'bg-emerald-500' : pr.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-400'}`}>
                    {pr.guest_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{pr.guest_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{pr.guest_email}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${pr.status === 'pending' ? 'bg-indigo-100 text-indigo-700' : pr.status === 'imported' ? 'bg-emerald-100 text-emerald-700' : pr.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{pr.status}</span>
              </div>
              <div className="space-y-1 text-[10px] text-slate-500 font-mono">
                <div className="flex justify-between"><span>Reservation:</span><span className="font-bold text-slate-700">{pr.reservation_id}</span></div>
                {pr.guest_nationality && <div className="flex justify-between"><span>Nationality:</span><span className="text-slate-700">{pr.guest_nationality}</span></div>}
                {pr.id_number && <div className="flex justify-between"><span>ID:</span><span className="text-slate-700">{pr.id_type}: {pr.id_number}</span></div>}
                {pr.estimated_arrival_time && <div className="flex justify-between"><span>ETA:</span><span className="text-slate-700">{pr.estimated_arrival_time}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <ModalSystem
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Pre-Registration Details"
          variant="form"
          size="md"
          showFooter={false}
          icon={<ClipboardList size={20} className="text-indigo-500" />}
        >
          <div className="p-5 space-y-4 text-xs">
            {/* Guest Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">{selected.guest_name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selected.guest_email} · {selected.guest_phone || 'N/A'}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${selected.status === 'pending' ? 'bg-indigo-100 text-indigo-700' : selected.status === 'imported' ? 'bg-emerald-100 text-emerald-700' : selected.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{selected.status}</span>
            </div>

            {/* Identification */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><ShieldCheck size={12} /> Identification</h4>
              <div className="grid grid-cols-2 gap-3">
                {selected.guest_nationality && <div><span className="text-slate-400 block">Nationality</span><span className="font-semibold text-slate-700">{selected.guest_nationality}</span></div>}
                {selected.date_of_birth && <div><span className="text-slate-400 block">Date of Birth</span><span className="font-semibold text-slate-700">{selected.date_of_birth}</span></div>}
                {selected.id_type && <div><span className="text-slate-400 block">ID Type</span><span className="font-semibold text-slate-700 capitalize">{selected.id_type}</span></div>}
                {selected.id_number && <div><span className="text-slate-400 block">ID Number</span><span className="font-semibold text-slate-700">{selected.id_number}</span></div>}
                {selected.id_issuing_country && <div><span className="text-slate-400 block">Issuing Country</span><span className="font-semibold text-slate-700">{selected.id_issuing_country}</span></div>}
                {selected.id_expiry_date && <div><span className="text-slate-400 block">Expiry Date</span><span className="font-semibold text-slate-700">{selected.id_expiry_date}</span></div>}
                {selected.passport_number && <div><span className="text-slate-400 block">Passport No.</span><span className="font-semibold text-slate-700">{selected.passport_number}</span></div>}
                {selected.estimated_arrival_time && <div><span className="text-slate-400 block">Est. Arrival</span><span className="font-semibold text-slate-700">{selected.estimated_arrival_time}</span></div>}
              </div>
            </div>

            {/* Preferences */}
            {(selected.pillow_preference || selected.dietary_restrictions || selected.language_preference || selected.room_type_preference) && (
              <div className="bg-indigo-50/50 rounded-xl p-4 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Sparkles size={12} /> Preferences</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selected.room_type_preference && <div><span className="text-slate-400 block">Room Type</span><span className="font-semibold text-slate-700">{selected.room_type_preference}</span></div>}
                  {selected.pillow_preference && <div><span className="text-slate-400 block">Pillow</span><span className="font-semibold text-slate-700">{selected.pillow_preference}</span></div>}
                  {selected.dietary_restrictions && <div><span className="text-slate-400 block">Dietary</span><span className="font-semibold text-slate-700">{selected.dietary_restrictions}</span></div>}
                  {selected.language_preference && <div><span className="text-slate-400 block">Language</span><span className="font-semibold text-slate-700">{selected.language_preference}</span></div>}
                </div>
              </div>
            )}

            {/* Vehicle & Emergency Contact */}
            {(selected.vehicle_plate || selected.vehicle_make || selected.emergency_contact_name) && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Car size={12} /> Vehicle & Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selected.vehicle_plate && <div><span className="text-slate-400 block">Plate</span><span className="font-semibold text-slate-700">{selected.vehicle_plate}</span></div>}
                  {selected.vehicle_make && <div><span className="text-slate-400 block">Make/Model</span><span className="font-semibold text-slate-700">{selected.vehicle_make} {selected.vehicle_model}</span></div>}
                  {selected.emergency_contact_name && <div><span className="text-slate-400 block">Emergency Contact</span><span className="font-semibold text-slate-700">{selected.emergency_contact_name}</span></div>}
                  {selected.emergency_contact_phone && <div><span className="text-slate-400 block">Emergency Phone</span><span className="font-semibold text-slate-700">{selected.emergency_contact_phone}</span></div>}
                  {selected.emergency_contact_relationship && <div><span className="text-slate-400 block">Relationship</span><span className="font-semibold text-slate-700">{selected.emergency_contact_relationship}</span></div>}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {selected.special_requests && (
              <div className="bg-indigo-50/50 rounded-xl p-4 space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Special Requests</h4>
                <p className="text-slate-700 italic">{selected.special_requests}</p>
              </div>
            )}

            {/* Review Notes */}
            {selected.status !== 'imported' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                  placeholder="Internal notes about this pre-registration..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer">Close</button>
              {selected.status !== 'imported' && (
                <>
                  {selected.status === 'pending' && (
                    <button onClick={() => handleReviewClick('reviewed')}
                      className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
                      <CheckCircle2 size={14} /> Mark Reviewed
                    </button>
                  )}
                  <button onClick={() => handleReviewClick('rejected')}
                    className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <X size={14} /> Reject
                  </button>
                  <button onClick={handleImportClick} disabled={importing}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                    {importing ? 'Importing...' : <><Download size={14} /> Import to CRM</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </ModalSystem>
      )}
    </div>
  );
}
