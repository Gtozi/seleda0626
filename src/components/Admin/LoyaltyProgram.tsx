/**
 * Loyalty Program Module
 * Handles guest loyalty points accrual and redemption settings
 */

import React, { useState } from 'react';
import { UserCheck, Save, CheckCircle2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function LoyaltyProgram() {
  const { globalHotelSettings, submitGlobalSettingsChange, currency } = useERP();
  const [form, setForm] = useState({
    loyaltyPointsPerDollar: globalHotelSettings.loyaltyPointsPerDollar || 10,
    loyaltyRedemptionRate: globalHotelSettings.loyaltyRedemptionRate || 100,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Loyalty Program Configuration',
      `Points per ${currency}: ${form.loyaltyPointsPerDollar}, Redemption rate: ${form.loyaltyRedemptionRate} pts/${currency}`,
      'loyalty-config',
      {
        loyaltyPointsPerDollar: Number(form.loyaltyPointsPerDollar),
        loyaltyRedemptionRate: Number(form.loyaltyRedemptionRate)
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <UserCheck size={18} className="text-indigo-500" /> Guest Loyalty & Membership Rules
        </h2>
        <p className="text-xs text-slate-400">Configure how guest spend translates to points and monetary redemptions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-indigo-900 tracking-tight">Accrual Engine</h4>
              <p className="text-[11px] text-indigo-700/70">Points earned per unit of currency spent on non-taxable base amounts.</p>
            </div>
            <div className="mt-6">
              <div className="flex items-end gap-2">
                <span className="text-lg font-black text-indigo-950">1 {currency} =</span>
                <input type="number" value={form.loyaltyPointsPerDollar} onChange={e => setForm(f => ({ ...f, loyaltyPointsPerDollar: Number(e.target.value) }))} className="w-24 bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 text-sm font-black text-indigo-600 focus:outline-none focus:border-indigo-500" />
                <span className="text-xs font-bold text-indigo-600 mb-2">Points</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-emerald-900 tracking-tight">Redemption Value</h4>
              <p className="text-[11px] text-emerald-700/70">Number of points required to discount invoice by 1 unit of currency.</p>
            </div>
            <div className="mt-6">
              <div className="flex items-end gap-2">
                <input type="number" value={form.loyaltyRedemptionRate} onChange={e => setForm(f => ({ ...f, loyaltyRedemptionRate: Number(e.target.value) }))} className="w-24 bg-white border-2 border-emerald-200 rounded-xl px-3 py-2 text-sm font-black text-emerald-600 focus:outline-none focus:border-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 mb-2 flex flex-col">
                  <span>Points =</span>
                  <span className="text-lg text-emerald-950">1 {currency} Credit</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
           <h4 className="text-[10px] font-mono font-black uppercase text-slate-500 mb-4 tracking-widest underline decoration-indigo-200">System Simulation (Loyalty ROI)</h4>
           <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                 <span className="text-[10px] text-slate-400 font-medium">Earned on $1,000 spend:</span>
                 <p className="text-lg font-black text-slate-800">{1000 * form.loyaltyPointsPerDollar} <span className="text-xs font-normal">pts</span></p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] text-slate-400 font-medium">Redeemable for:</span>
                 <p className="text-lg font-black text-indigo-600">${((1000 * form.loyaltyPointsPerDollar) / form.loyaltyRedemptionRate).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] text-slate-400 font-medium">Net Discount Liability:</span>
                 <p className="text-lg font-black text-rose-500">{((((1000 * form.loyaltyPointsPerDollar) / form.loyaltyRedemptionRate) / 1000) * 100).toFixed(1)}%</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Update Membership Parameters'}
        </button>
      </div>
    </div>
  );
}
