/**
 * Property & Configuration Setup
 * 1. Property Profile
 */

import React, { useState } from 'react';
import {
  Building2, Settings, Save, CheckCircle2, Clock
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function PropertyConfigurationSetup() {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <PropertyProfileModule />
      </div>
    </div>
  );
}

function PropertyProfileModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    customHotelName: globalHotelSettings.customHotelName || '',
    customHotelAddress: globalHotelSettings.customHotelAddress || '',
    hotelTin: globalHotelSettings.hotelTin || '',
    hotelVatNo: globalHotelSettings.hotelVatNo || '',
    hotelVatDate: globalHotelSettings.hotelVatDate || '',
    contactPhone: globalHotelSettings.contactPhone || '',
    contactEmail: globalHotelSettings.contactEmail || '',
    publicTagline: globalHotelSettings.publicTagline || '',
    checkInTime: globalHotelSettings.checkInTime || '02:00 PM',
    checkOutTime: globalHotelSettings.checkOutTime || '11:00 AM',
    starRating: globalHotelSettings.starRating || '5',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      `Update Property: ${form.customHotelName || 'Hotel'}`,
      `Property profile update — name, address, TIN, VAT, contact info, check-in/out times, star rating.`,
      'property-config',
      {
        customHotelName: form.customHotelName,
        customHotelAddress: form.customHotelAddress,
        hotelTin: form.hotelTin,
        hotelVatNo: form.hotelVatNo,
        hotelVatDate: form.hotelVatDate,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        publicTagline: form.publicTagline,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        starRating: form.starRating,
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-indigo-500" /> Core Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Property Name</label>
            <input value={form.customHotelName} onChange={e => setForm(f => ({ ...f, customHotelName: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Contact Phone</label>
            <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Star Rating</label>
            <select value={form.starRating} onChange={e => setForm(f => ({ ...f, starRating: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none">
              <option value="3">3 Star Boutique</option>
              <option value="4">4 Star Premium</option>
              <option value="5">5 Star Ultra Luxury Resort</option>
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Address</label>
            <textarea rows={2} value={form.customHotelAddress} onChange={e => setForm(f => ({ ...f, customHotelAddress: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Tax ID (TIN)</label>
            <input value={form.hotelTin} onChange={e => setForm(f => ({ ...f, hotelTin: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">VAT Number</label>
            <input value={form.hotelVatNo} onChange={e => setForm(f => ({ ...f, hotelVatNo: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">VAT Activation Date</label>
            <input type="date" value={form.hotelVatDate} onChange={e => setForm(f => ({ ...f, hotelVatDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Public Tagline</label>
            <input value={form.publicTagline} onChange={e => setForm(f => ({ ...f, publicTagline: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
            <Clock size={16} className="text-indigo-600" />
            Service & Operator Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Standard Check-In Time</label>
              <input type="text" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))}
                placeholder="e.g. 02:00 PM"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Standard Check-Out Time</label>
              <input type="text" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))}
                placeholder="e.g. 11:00 AM"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Property Profile'}
        </button>
      </div>
    </div>
  );
}
