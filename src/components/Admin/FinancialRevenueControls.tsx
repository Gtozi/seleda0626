/**
 * Financial & Revenue Controls
 * 1. Tax & Fee Engine
 * 2. Payment Gateway Integration
 * 3. Folio & Invoicing Settings
 * 4. Transaction Codes
 */

import React, { useState } from 'react';
import {
  Coins, CreditCard, FileText, BarChart3, Save, CheckCircle2,
  Plus, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign,
  Receipt, Landmark, Settings, Globe2, X, Sliders, CreditCard as CreditCardIcon
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ChartOfAccount } from '../../types/finance';

type FinanceTab = 'tax_fees' | 'payment_gateways' | 'folio_invoicing' | 'transaction_codes' | 'billing_matrix';

const TAB_META: { id: FinanceTab; label: string; icon: React.ReactNode }[] = [
  { id: 'tax_fees', label: 'Tax & Fee Engine', icon: <Percent size={14} /> },
  { id: 'billing_matrix', label: 'Billing Matrix', icon: <Sliders size={14} /> },
  { id: 'payment_gateways', label: 'Payment Gateways', icon: <CreditCard size={14} /> },
  { id: 'folio_invoicing', label: 'Folio & Invoicing', icon: <Receipt size={14} /> },
  { id: 'transaction_codes', label: 'Transaction Codes', icon: <BarChart3 size={14} /> },
];

export default function FinancialRevenueControls() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('tax_fees');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {TAB_META.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'tax_fees' && <TaxFeeEngine />}
        {activeTab === 'billing_matrix' && <BillingMatrixModule />}
        {activeTab === 'payment_gateways' && <PaymentGatewayModule />}
        {activeTab === 'folio_invoicing' && <FolioInvoicingModule />}
        {activeTab === 'transaction_codes' && <TransactionCodesModule />}
      </div>
    </div>
  );
}

function TaxFeeEngine() {
  const { globalHotelSettings, submitGlobalSettingsChange, currency, setCurrency, chartOfAccounts } = useERP();
  const [form, setForm] = useState({
    taxPercent: globalHotelSettings.taxPercent ?? 15,
    serviceChargePercent: globalHotelSettings.serviceChargePercent ?? 10,
    taxInclusive: (globalHotelSettings.feeComponents || []).some(f => f.name.toLowerCase().includes('inclusive')) || false,
    addonCharges: globalHotelSettings.addonCharges || [],
    newAddonName: '',
    newAddonPercent: 0,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Tax & Fee Engine',
      `Tax: ${form.taxPercent}%, Service charge: ${form.serviceChargePercent}%, Addons: ${form.addonCharges.length}`,
      'revenue-mapping',
      {
        taxPercent: Number(form.taxPercent) || 0,
        serviceChargePercent: Number(form.serviceChargePercent) || 0,
        addonCharges: form.addonCharges,
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const addAddon = () => {
    if (!form.newAddonName.trim() || !form.newAddonPercent) return;
    setForm(f => ({ ...f, addonCharges: [...f.addonCharges, { name: form.newAddonName.trim(), percent: Number(form.newAddonPercent) }], newAddonName: '', newAddonPercent: 0 }));
  };

  const removeAddon = (idx: number) => {
    setForm(f => ({ ...f, addonCharges: f.addonCharges.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Percent size={18} className="text-indigo-500" /> Tax & Service Charge Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Sales Tax (%)</label>
            <input type="number" step={0.1} value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Service Charge (%)</label>
            <input type="number" step={0.1} value={form.serviceChargePercent} onChange={e => setForm(f => ({ ...f, serviceChargePercent: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => setForm(f => ({ ...f, taxInclusive: !f.taxInclusive }))}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.taxInclusive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.taxInclusive ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm font-bold text-slate-800">Display rates as tax-inclusive</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-amber-500" /> Additional Fees & Levies
        </h2>
        <div className="flex gap-2 mb-3">
          <input placeholder="Fee name (e.g. Tourism Levy)" value={form.newAddonName} onChange={e => setForm(f => ({ ...f, newAddonName: e.target.value }))}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          <input type="number" placeholder="%" value={form.newAddonPercent || ''} onChange={e => setForm(f => ({ ...f, newAddonPercent: Number(e.target.value) }))}
            className="w-24 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          <button onClick={addAddon} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Add</button>
        </div>
        <div className="space-y-2">
          {form.addonCharges.map((addon, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-800">{addon.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">{addon.percent}%</span>
                <button onClick={() => removeAddon(i)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {form.addonCharges.length === 0 && <p className="text-xs text-slate-400">No additional fees configured.</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Tax & Fee Settings'}
        </button>
      </div>
    </div>
  );
}

function BillingMatrixModule() {
  const { globalHotelSettings, submitGlobalSettingsChange, currency, setCurrency, chartOfAccounts } = useERP();
  const [exchangeRate, setExchangeRate] = useState(globalHotelSettings.exchangeRate || 120);
  const [feeComponents, setFeeComponents] = useState<import('../../types/erp').FeeComponent[]>(
    globalHotelSettings.feeComponents || [
      { id: 'fc_vat', name: 'VAT', feeType: 'percentage', value: 15, isEnabled: true, displayOrder: 1, accountCode: '2200' },
      { id: 'fc_sc', name: 'Service Charge', feeType: 'percentage', value: 10, isEnabled: true, displayOrder: 2, accountCode: '2300' }
    ]
  );
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeType, setNewFeeType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newFeeValue, setNewFeeValue] = useState('');
  const [newFeeAccount, setNewFeeAccount] = useState('');
  const [splitFolioRules, setSplitFolioRules] = useState(globalHotelSettings.splitFolioRules || []);
  const [paymentTypesConfig, setPaymentTypesConfig] = useState((globalHotelSettings.paymentTypes || ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer', 'Room Charge']).join(', '));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    const vatFee = feeComponents.find(f => f.name.toLowerCase().includes('vat') && f.isEnabled);
    const scFee = feeComponents.find(f => f.name.toLowerCase().includes('service charge') && f.isEnabled);

    const taxPercent = vatFee ? vatFee.value : 0;
    const serviceChargePercent = scFee ? scFee.value : 0;
    const paymentTypes = paymentTypesConfig.split(',').map(s => s.trim()).filter(Boolean);

    // Build delta: only include fields that actually changed
    const delta: Partial<typeof globalHotelSettings> = {};
    if (Number(exchangeRate) !== globalHotelSettings.exchangeRate) delta.exchangeRate = Number(exchangeRate);
    if (JSON.stringify(feeComponents) !== JSON.stringify(globalHotelSettings.feeComponents)) {
      delta.feeComponents = feeComponents.map(f => ({ ...f }));
    }
    if (taxPercent !== globalHotelSettings.taxPercent) delta.taxPercent = taxPercent;
    if (serviceChargePercent !== globalHotelSettings.serviceChargePercent) delta.serviceChargePercent = serviceChargePercent;
    if (JSON.stringify(splitFolioRules) !== JSON.stringify(globalHotelSettings.splitFolioRules)) {
      delta.splitFolioRules = splitFolioRules;
    }
    if (JSON.stringify(paymentTypes) !== JSON.stringify(globalHotelSettings.paymentTypes || [])) {
      delta.paymentTypes = paymentTypes;
    }

    if (Object.keys(delta).length === 0) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
      return;
    }

    const changedFieldNames = Object.keys(delta).map(k => {
      const labels: Record<string, string> = {
        exchangeRate: 'Exchange Rate',
        feeComponents: 'Fee Components',
        taxPercent: 'Tax Percent',
        serviceChargePercent: 'Service Charge Percent',
        splitFolioRules: 'Split Folio Rules',
        paymentTypes: 'Payment Types'
      };
      return labels[k] || k;
    }).join(', ');

    submitGlobalSettingsChange(
      'Billing & Exchange Matrix',
      `Changed: ${changedFieldNames}`,
      'revenue-mapping',
      delta
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders size={18} className="text-indigo-500" /> Exchange, Taxes & Fees Matrix
            </h2>
            <p className="text-xs text-slate-400">Global variables used by checkout modules to compute line charges and foreign currencies.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-450 font-bold">Base Currency:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
              <button 
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-lg transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}
              >
                USD ($)
              </button>
              <button 
                type="button"
                onClick={() => setCurrency('ETB')}
                className={`px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-lg transition ${currency === 'ETB' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}
              >
                ETB (Br)
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200/60 transition">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">USD Exchange Rate (ETB)</label>
          <p className="text-[11px] text-slate-400 leading-tight">System pegged parity rate for converting room charges to native ETB.</p>
          <div className="relative pt-2">
            <input
              type="number"
              value={exchangeRate}
              onChange={e => setExchangeRate(Number(e.target.value))}
              className="w-full px-4 py-2.5 pl-12 bg-white border border-slate-250 rounded-xl text-xs font-sans font-bold focus:ring-1 focus:ring-indigo-600 focus:outline-none"
            />
            <span className="absolute left-3 top-5 text-slate-400 text-[10px] font-mono font-bold">1 USD =</span>
            <span className="absolute right-3 top-5 text-slate-400 text-[10px] font-mono font-bold">ETB</span>
          </div>
        </div>

        <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between text-xs bg-slate-50/20">
          <div className="flex gap-2 items-center">
            <Globe2 size={16} className="text-indigo-600" />
            <span className="text-slate-600">Active Peg: <strong className="text-slate-800">1.00 USD = {globalHotelSettings.exchangeRate} ETB</strong></span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Percent size={18} className="text-indigo-500" /> Fee Components
        </h2>
        <div className="space-y-2">
          {(feeComponents || []).map((fee, index) => (
            <div key={fee.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeeComponents(prev => prev.map((f, i) => i === index ? { ...f, isEnabled: !f.isEnabled } : f))}
                className={`p-2 rounded-lg text-xs font-bold transition ${fee.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
              >
                {fee.isEnabled ? 'ON' : 'OFF'}
              </button>
              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-bold">
                {fee.name}
              </div>
              <div className="w-20 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-mono text-right">
                {fee.feeType === 'percentage' ? `${fee.value}%` : `$${fee.value}`}
              </div>
              <div className="w-24 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 text-center">
                {fee.feeType === 'percentage' ? 'Percentage' : 'Fixed'}
              </div>
              <input
                type="number"
                value={fee.value}
                onChange={e => setFeeComponents(prev => prev.map((f, i) => i === index ? { ...f, value: Number(e.target.value) } : f))}
                className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
              />
              <button
                type="button"
                onClick={() => setFeeComponents(prev => prev.filter((_, i) => i !== index))}
                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <input
              type="text"
              placeholder="e.g. Environmental Tax"
              value={newFeeName}
              onChange={e => setNewFeeName(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={newFeeType}
              onChange={e => setNewFeeType(e.target.value as any)}
              className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed $</option>
            </select>
            <input
              type="number"
              placeholder={newFeeType === 'percentage' ? '%' : '$'}
              value={newFeeValue}
              onChange={e => setNewFeeValue(e.target.value)}
              className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-center"
            />
            <select
              value={newFeeAccount}
              onChange={e => setNewFeeAccount(e.target.value)}
              className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Account</option>
              {(chartOfAccounts || []).map(a => (
                <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (newFeeName.trim() && newFeeValue) {
                  setFeeComponents(prev => [...prev, {
                    id: `fc-${Date.now()}`,
                    name: newFeeName.trim(),
                    feeType: newFeeType,
                    value: Number(newFeeValue),
                    isEnabled: true,
                    displayOrder: prev.length + 1,
                    accountCode: newFeeAccount || undefined
                  }]);
                  setNewFeeName('');
                  setNewFeeValue('');
                  setNewFeeAccount('');
                }
              }}
              disabled={!newFeeName.trim() || !newFeeValue}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50"
            >
              Add Fee
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <CreditCardIcon size={18} className="text-indigo-500" /> Payment Methods
        </h2>
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Accepted Payment Types</label>
          <input 
            type="text"
            value={paymentTypesConfig}
            onChange={e => setPaymentTypesConfig(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
            placeholder="Cash, Credit Card, Mobile Money"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Billing Matrix'}
        </button>
      </div>
    </div>
  );
}

function PaymentGatewayModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const integrations = globalHotelSettings.apiIntegrations || [];
  const [newGateway, setNewGateway] = useState({ serviceName: '', apiKey: '', category: 'Finance' as any });

  const addGateway = () => {
    if (!newGateway.serviceName.trim() || !newGateway.apiKey.trim()) return;
    const next = [...integrations, { serviceName: newGateway.serviceName.trim(), apiKey: newGateway.apiKey.trim(), status: 'active', category: newGateway.category }];
    submitGlobalSettingsChange(
      'Connect Payment Gateway',
      `Add gateway "${newGateway.serviceName}" (${newGateway.category})`,
      'integration-config',
      { apiIntegrations: next }
    );
    setNewGateway({ serviceName: '', apiKey: '', category: 'Finance' });
  };

  const removeGateway = (idx: number) => {
    const next = integrations.filter((_, i) => i !== idx);
    submitGlobalSettingsChange(
      'Remove Payment Gateway',
      `Remove gateway "${integrations[idx]?.serviceName || idx}"`,
      'integration-config',
      { apiIntegrations: next }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Gateways', value: integrations.filter((i: any) => i.status === 'active').length, icon: CreditCard, color: 'indigo' },
          { label: 'Pending Setup', value: integrations.filter((i: any) => i.status === 'inactive').length, icon: Settings, color: 'amber' },
          { label: 'Primary Currency', value: 'USD', icon: DollarSign, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600`}><s.icon size={20} /></div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-xl font-black text-slate-900">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-indigo-500" /> Payment Gateway Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input placeholder="Gateway name (e.g. Stripe)" value={newGateway.serviceName} onChange={e => setNewGateway(f => ({ ...f, serviceName: e.target.value }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          <input placeholder="API Key / Client ID" value={newGateway.apiKey} onChange={e => setNewGateway(f => ({ ...f, apiKey: e.target.value }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono" />
          <button onClick={addGateway} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-1.5">
            <Plus size={14} /> Connect Gateway
          </button>
        </div>
        <div className="space-y-2">
          {integrations.map((api: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-900">{api.serviceName}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono ml-2">{api.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${api.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {api.status}
                </span>
                <button onClick={() => removeGateway(i)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {integrations.length === 0 && <p className="text-xs text-slate-400">No payment gateways configured.</p>}
        </div>
      </div>
    </div>
  );
}

function FolioInvoicingModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    invoiceTemplate: globalHotelSettings.invoiceTemplate || 'modern',
    invoiceFooterText: globalHotelSettings.invoiceFooterText || '',
    invoiceBankDetails: globalHotelSettings.invoiceBankDetails || '',
    autoNightAuditTime: globalHotelSettings.autoNightAuditTime || '02:00',
    paymentTypesConfig: (globalHotelSettings.paymentTypes || ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer', 'Room Charge']).join(', '),
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Invoice & Folio Settings',
      `Template: ${form.invoiceTemplate}, Footer: ${form.invoiceFooterText}, Night audit: ${form.autoNightAuditTime}, Payment types: ${form.paymentTypesConfig.split(',').map(s => s.trim()).filter(Boolean).join(', ')}`,
      'global-setting',
      {
        invoiceTemplate: form.invoiceTemplate as any,
        invoiceFooterText: form.invoiceFooterText,
        invoiceBankDetails: form.invoiceBankDetails,
        autoNightAuditTime: form.autoNightAuditTime,
        paymentTypes: form.paymentTypesConfig.split(',').map(s => s.trim()).filter(Boolean)
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <FileText size={18} className="text-indigo-500" /> Invoice Layout & Numbering
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Invoice Template</label>
            <select value={form.invoiceTemplate} onChange={e => setForm(f => ({ ...f, invoiceTemplate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
              <option value="thermal">Thermal Receipt</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Auto Night Audit Time</label>
            <input type="time" value={form.autoNightAuditTime} onChange={e => setForm(f => ({ ...f, autoNightAuditTime: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Invoice Footer Text</label>
            <textarea rows={2} value={form.invoiceFooterText} onChange={e => setForm(f => ({ ...f, invoiceFooterText: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Bank Details for Corporate Invoices</label>
            <textarea rows={2} value={form.invoiceBankDetails} onChange={e => setForm(f => ({ ...f, invoiceBankDetails: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none font-mono" />
            <p className="text-[10px] text-slate-400 leading-normal mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <strong>Template format:</strong> Bank name on first line, followed by Account Name and Account Number. 
              <br />
              💡 <em>Tip: You can use the high-fidelity interactive <strong>"Smart Bank Accounts Editor"</strong> in the Executive Business Settings tab to register and update accounts visually!</em>
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Payment Types / Options</label>
            <p className="text-[11px] text-slate-400 leading-tight mb-2">Comma-separated list of payment methods available across the system.</p>
            <input 
              type="text"
              value={form.paymentTypesConfig}
              onChange={e => setForm(f => ({ ...f, paymentTypesConfig: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              placeholder="Cash, Credit Card, Mobile Money"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Folio Settings'}
        </button>
      </div>
    </div>
  );
}

function TransactionCodesModule() {
  const { chartOfAccounts, addAccount, deleteAccount } = useERP();
  const [newAccount, setNewAccount] = useState({ code: '', name: '', category: 'Revenue' as any, subCategory: '' });

  const categories = ['Revenue', 'Asset', 'Liability', 'Equity', 'Expense'];

  const handleAdd = () => {
    if (!newAccount.code.trim() || !newAccount.name.trim()) return;
    addAccount({
      id: newAccount.code,
      code: newAccount.code,
      name: newAccount.name,
      category: newAccount.category,
      subCategory: newAccount.subCategory,
      balance: 0,
      currency: 'USD',
      isActive: true,
    });
    setNewAccount({ code: '', name: '', category: 'Revenue', subCategory: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-indigo-500" /> Chart of Accounts / Transaction Codes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input placeholder="Account Code" value={newAccount.code} onChange={e => setNewAccount(f => ({ ...f, code: e.target.value }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono" />
          <input placeholder="Account Name" value={newAccount.name} onChange={e => setNewAccount(f => ({ ...f, name: e.target.value }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          <select value={newAccount.category} onChange={e => setNewAccount(f => ({ ...f, category: e.target.value }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleAdd} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-1.5">
            <Plus size={14} /> Add Account
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Subcategory</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartOfAccounts.map((acc: ChartOfAccount) => (
                <tr key={acc.id} className="text-xs hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-mono font-bold text-slate-700">{acc.code}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{acc.name}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      acc.category === 'Revenue' ? 'bg-emerald-50 text-emerald-600' :
                      acc.category === 'Expense' ? 'bg-rose-50 text-rose-600' :
                      acc.category === 'Asset' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>{acc.category}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{acc.subCategory || '—'}</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">${acc.balance.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteAccount(acc.code)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {chartOfAccounts.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-xs text-slate-400">No accounts configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
