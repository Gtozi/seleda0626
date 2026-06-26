/**
 * Operational Policies Module
 * Handles cancellation policies, credit limits, operating hours, and terms & conditions
 */

import React, { useState } from 'react';
import { Gavel, Save, CheckCircle2, Plus, Trash2, FileText, Clock } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function OperationalPolicies() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    cancellationGraceHours: globalHotelSettings.cancellationGraceHours || 24,
    cancellationPenaltyPercent: globalHotelSettings.cancellationPenaltyPercent || 50,
    creditLimitDefault: globalHotelSettings.creditLimitDefault || 500,
    autoNightAuditTime: globalHotelSettings.autoNightAuditTime || '02:00',
    opHoursFrontDesk: globalHotelSettings.operatingHours?.frontDesk || '24 Hours',
    opHoursRestaurant: globalHotelSettings.operatingHours?.restaurant || '06:00 - 23:00',
    opHoursBar: globalHotelSettings.operatingHours?.bar || '10:00 - 02:00',
    opHoursSpa: globalHotelSettings.operatingHours?.spa || '08:00 - 20:00',
  });
  const [policySections, setPolicySections] = useState<{id: string, title: string, content: string}[]>(
    globalHotelSettings.policySections || [
      { id: '1', title: '🏨 Section 1: Standard Guest Liability Waiver', content: globalHotelSettings.termsAdventureLiability || "The Hotel is not responsible for any loss or damage to guest property during their stay." },
      { id: '2', title: '🔍 Section 2: Booking and Waitlist Protocol', content: globalHotelSettings.termsWaitlistProtocol || "All online booking registrations are subject to verification." },
      { id: '3', title: '🌱 Section 3: Environmental Guidelines', content: globalHotelSettings.termsConservationDevotion || "Guests are encouraged to be mindful of water and electricity consumption." },
      { id: '4', title: '💳 Section 4: Billing and Cancellation', content: globalHotelSettings.termsBillingCancellation || "A valid credit/debit card is required for all bookings." },
    ]
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Operational Policies Update',
      `Cancellation grace: ${form.cancellationGraceHours}h, Penalty: ${form.cancellationPenaltyPercent}%, Credit limit: ${form.creditLimitDefault}, Night audit: ${form.autoNightAuditTime}`,
      'operational-policy',
      {
        cancellationGraceHours: Number(form.cancellationGraceHours),
        cancellationPenaltyPercent: Number(form.cancellationPenaltyPercent),
        creditLimitDefault: Number(form.creditLimitDefault),
        autoNightAuditTime: form.autoNightAuditTime,
        operatingHours: {
          frontDesk: form.opHoursFrontDesk,
          restaurant: form.opHoursRestaurant,
          bar: form.opHoursBar,
          spa: form.opHoursSpa
        },
        policySections,
        termsAdventureLiability: policySections[0]?.content || '',
        termsWaitlistProtocol: policySections[1]?.content || '',
        termsConservationDevotion: policySections[2]?.content || '',
        termsBillingCancellation: policySections[3]?.content || '',
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Gavel size={18} className="text-indigo-500" /> Operational & Cancellation Policies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60">
            <h4 className="text-[10px] font-mono font-black uppercase text-indigo-600 tracking-widest">Cancellation Rules</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Grace Period (Hours)</label>
                <input type="number" value={form.cancellationGraceHours} onChange={e => setForm(f => ({ ...f, cancellationGraceHours: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Penalty Percent (%)</label>
                <input type="number" value={form.cancellationPenaltyPercent} onChange={e => setForm(f => ({ ...f, cancellationPenaltyPercent: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60">
            <h4 className="text-[10px] font-mono font-black uppercase text-indigo-600 tracking-widest">Credit & Audit</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Default Guest Credit Limit</label>
                <input type="number" value={form.creditLimitDefault} onChange={e => setForm(f => ({ ...f, creditLimitDefault: Number(e.target.value) }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold block">Scheduled Night Audit (Time)</label>
                <input type="time" value={form.autoNightAuditTime} onChange={e => setForm(f => ({ ...f, autoNightAuditTime: e.target.value }))} className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-sans" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 bg-slate-900 rounded-2xl text-white mt-6">
          <h4 className="text-[10px] font-mono font-black uppercase text-indigo-400 tracking-widest">Departmental Operating Hours</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Front Desk</label>
              <input type="text" value={form.opHoursFrontDesk} onChange={e => setForm(f => ({ ...f, opHoursFrontDesk: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Restaurant</label>
              <input type="text" value={form.opHoursRestaurant} onChange={e => setForm(f => ({ ...f, opHoursRestaurant: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Bar Module</label>
              <input type="text" value={form.opHoursBar} onChange={e => setForm(f => ({ ...f, opHoursBar: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Spa / Wellness</label>
              <input type="text" value={form.opHoursSpa} onChange={e => setForm(f => ({ ...f, opHoursSpa: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-mono font-black uppercase text-amber-800 tracking-widest flex items-center gap-1.5">
            <FileText size={12} className="text-amber-600" /> Public Booking Portal Terms & Conditions
          </h4>
          <button 
            type="button" 
            onClick={() => setPolicySections(prev => [...prev, {id: Date.now().toString(), title: 'New Section', content: ''}])}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-700 bg-white px-2 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-50"
          >
            <Plus size={10} /> Add Section
          </button>
        </div>
        <div className="space-y-4 pt-4">
          {policySections.map((section, idx) => (
            <div key={section.id} className="space-y-1 relative group">
              <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                <input 
                  value={section.title}
                  onChange={e => setPolicySections(prev => prev.map((s, i) => i === idx ? {...s, title: e.target.value} : s))}
                  className="bg-transparent border-none w-full p-0 flex-1 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setPolicySections(prev => prev.filter((_, i) => i !== idx))}
                  className="opacity-0 group-hover:opacity-100 text-rose-500"
                >
                  <Trash2 size={12} />
                </button>
              </label>
              <textarea 
                rows={3}
                value={section.content} 
                onChange={e => setPolicySections(prev => prev.map((s, i) => i === idx ? {...s, content: e.target.value} : s))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Policies'}
        </button>
      </div>
    </div>
  );
}
