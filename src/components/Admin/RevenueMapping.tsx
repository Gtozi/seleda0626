/**
 * Revenue Mapping Module
 * Maps operational modules to Financial Chart of Accounts for automatic journal postings
 */

import React, { useState } from 'react';
import { Link2, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function RevenueMapping() {
  const { globalHotelSettings, submitGlobalSettingsChange, chartOfAccounts } = useERP();
  const [form, setForm] = useState({
    revMapRoom: globalHotelSettings.revenueMappings?.roomRevenueAccount || '4010',
    revMapFB: globalHotelSettings.revenueMappings?.fbRevenueAccount || '4020',
    revMapBar: globalHotelSettings.revenueMappings?.barRevenueAccount || '4020',
    revMapGift: globalHotelSettings.revenueMappings?.giftShopRevenueAccount || '4030',
    revMapTax: globalHotelSettings.revenueMappings?.taxPayableAccount || '2200',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Revenue & Ledger Account Mappings',
      `Map Room:${form.revMapRoom}, F&B:${form.revMapFB}, Bar:${form.revMapBar}, Gift:${form.revMapGift}, Tax:${form.revMapTax}`,
      'revenue-mapping',
      {
        revenueMappings: {
          roomRevenueAccount: form.revMapRoom,
          fbRevenueAccount: form.revMapFB,
          barRevenueAccount: form.revMapBar,
          giftShopRevenueAccount: form.revMapGift,
          taxPayableAccount: form.revMapTax
        }
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Link2 size={18} className="text-indigo-500" /> Revenue & Ledger Account Mappings
        </h2>
        <p className="text-xs text-slate-400">Bind operational modules to Financial Chart of Accounts for automatic journal postings.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-800">Room Revenue / Folio</h4>
                <p className="text-[10px] text-slate-400 font-mono">Main ledger for overnight stays</p>
              </div>
              <select value={form.revMapRoom} onChange={e => setForm(f => ({ ...f, revMapRoom: e.target.value }))} className="bg-white border rounded-lg px-2 py-1 text-xs font-mono font-bold">
                {chartOfAccounts.filter(a => a.category === 'Revenue').map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-800">F&B Outlet Sales</h4>
                <p className="text-[10px] text-slate-400 font-mono">Restaurant & Room Service postings</p>
              </div>
              <select value={form.revMapFB} onChange={e => setForm(f => ({ ...f, revMapFB: e.target.value }))} className="bg-white border rounded-lg px-2 py-1 text-xs font-mono font-bold">
                {chartOfAccounts.filter(a => a.category === 'Revenue').map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-800">Bar & Beverage Revenue</h4>
                <p className="text-[10px] text-slate-400 font-mono">Alcohol and Bar POS settlements</p>
              </div>
              <select value={form.revMapBar} onChange={e => setForm(f => ({ ...f, revMapBar: e.target.value }))} className="bg-white border rounded-lg px-2 py-1 text-xs font-mono font-bold">
                {chartOfAccounts.filter(a => a.category === 'Revenue').map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-800">Gift Shop / Miscellaneous</h4>
                <p className="text-[10px] text-slate-400 font-mono">Retail and auxiliary services</p>
              </div>
              <select value={form.revMapGift} onChange={e => setForm(f => ({ ...f, revMapGift: e.target.value }))} className="bg-white border rounded-lg px-2 py-1 text-xs font-mono font-bold">
                {chartOfAccounts.filter(a => a.category === 'Revenue').map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between md:col-span-2">
              <div>
                <h4 className="text-[10px] font-black uppercase text-indigo-400">Sales Tax / VAT Liability</h4>
                <p className="text-[10px] text-slate-500 font-mono">Account for collected taxes pending remittance</p>
              </div>
              <select value={form.revMapTax} onChange={e => setForm(f => ({ ...f, revMapTax: e.target.value }))} className="bg-slate-800 text-white border-slate-700 border rounded-lg px-2 py-1 text-xs font-mono font-bold">
                {chartOfAccounts.filter(a => a.category === 'Liability').map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-800 font-medium">Re-mapping accounts mid-cycle may cause discrepancies in Trial Balance and P&L reports until current month-end audit. Proceed with accounting supervisor authorization.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-slate-900 hover:bg-slate-800 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Synchronize Ledger Mappings'}
        </button>
      </div>
    </div>
  );
}
