/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Printer,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  ToggleLeft,
  ToggleRight,
  Sliders,
  HardDrive,
  Palette,
  Info,
  Smartphone,
  Building,
  Percent
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface POSSettingsProps {
  outletId?: string;
  outletName?: string;
}

interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt' | 'bar';
  ipAddress: string;
  isActive: boolean;
}

interface PaymentTerminal {
  id: string;
  type: string;
  model: string;
  serialNumber: string;
  isActive: boolean;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

export default function POSSettings({ outletName }: POSSettingsProps) {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'payment' | 'tax' | 'display'>('general');
  const [saving, setSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    outletName: outletName || 'Main Restaurant',
    currency: 'ETB',
    language: 'en',
    autoPrintReceipt: true,
    requireManagerForVoid: true,
    requireManagerForDiscount: true,
    allowSplitPayments: true,
    enableTips: true,
    defaultTipPercent: 10,
    serviceChargePercent: 10,
    operatingHours: {
      open: '06:00',
      close: '23:00'
    }
  });

  // Hardware Settings
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [paymentTerminals, setPaymentTerminals] = useState<PaymentTerminal[]>([]);

  // Payment Settings
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState({
    cash: true,
    card: true,
    mobile: true,
    roomCharge: true
  });

  // Tax Settings
  const [taxRates] = useState<TaxRate[]>([
    { id: '1', name: 'VAT', rate: 15, isDefault: true },
    { id: '2', name: 'Service Tax', rate: 10, isDefault: false }
  ]);

  // Display Settings
  const [displaySettings, setDisplaySettings] = useState({
    showImages: true,
    gridColumns: 4,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    theme: 'light' as 'light' | 'dark',
    showQuickActions: true
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In production, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification('Settings saved successfully', 'success', 'F&B');
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification('Failed to save settings', 'warning', 'F&B');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters(printers.filter(p => p.id !== id));
    addNotification('Printer removed', 'success', 'F&B');
  };

  const handleDeleteTerminal = (id: string) => {
    setPaymentTerminals(paymentTerminals.filter(t => t.id !== id));
    addNotification('Payment terminal removed', 'success', 'F&B');
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Sliders },
    { id: 'hardware' as const, label: 'Hardware', icon: HardDrive },
    { id: 'payment' as const, label: 'Payment', icon: CreditCard },
    { id: 'tax' as const, label: 'Tax & Fees', icon: DollarSign },
    { id: 'display' as const, label: 'Display', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            POS Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {outletName || 'All Outlets'} • Configuration
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-all"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={20} className="text-indigo-600" />
              General Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Outlet Name
                </label>
                <input
                  type="text"
                  value={generalSettings.outletName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, outletName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="ETB">ETB - Ethiopian Birr</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Language
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Default Tip Percentage
                </label>
                <input
                  type="number"
                  value={generalSettings.defaultTipPercent}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultTipPercent: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Service Charge Percentage
                </label>
                <input
                  type="number"
                  value={generalSettings.serviceChargePercent}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, serviceChargePercent: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Operating Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={generalSettings.operatingHours.open}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, operatingHours: { ...generalSettings.operatingHours, open: e.target.value } })}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <input
                    type="time"
                    value={generalSettings.operatingHours.close}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, operatingHours: { ...generalSettings.operatingHours, close: e.target.value } })}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Toggle Settings</h4>
              
              <div className="space-y-3">
                {[
                  { key: 'autoPrintReceipt', label: 'Auto-print receipts after payment' },
                  { key: 'requireManagerForVoid', label: 'Require manager approval for void' },
                  { key: 'requireManagerForDiscount', label: 'Require manager approval for discounts' },
                  { key: 'allowSplitPayments', label: 'Allow split payments' },
                  { key: 'enableTips', label: 'Enable tips' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-900 dark:text-white">{setting.label}</span>
                    <button
                      onClick={() => setGeneralSettings({ ...generalSettings, [setting.key]: !generalSettings[setting.key as keyof typeof generalSettings] })}
                      className={`p-1 rounded-lg transition-all ${
                        generalSettings[setting.key as keyof typeof generalSettings]
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                      }`}
                    >
                      {generalSettings[setting.key as keyof typeof generalSettings] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive size={20} className="text-indigo-600" />
              Hardware Configuration
            </h3>

            {/* Printers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer size={16} />
                  Printers
                </h4>
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  <Plus size={14} />
                  Add Printer
                </button>
              </div>

              <div className="space-y-3">
                {printers.map((printer) => (
                  <div key={printer.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        printer.type === 'kitchen' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                        printer.type === 'bar' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        <Printer size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{printer.name}</h5>
                        <p className="text-xs text-slate-500">{printer.type} • {printer.ipAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        printer.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                      }`}>
                        {printer.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeletePrinter(printer.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg text-rose-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {printers.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Printer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No printers configured</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Terminals */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={16} />
                  Payment Terminals
                </h4>
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  <Plus size={14} />
                  Add Terminal
                </button>
              </div>

              <div className="space-y-3">
                {paymentTerminals.map((terminal) => (
                  <div key={terminal.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{terminal.model}</h5>
                        <p className="text-xs text-slate-500">{terminal.type} • {terminal.serialNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        terminal.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                      }`}>
                        {terminal.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteTerminal(terminal.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg text-rose-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {paymentTerminals.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No payment terminals configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" />
              Payment Methods
            </h3>

            <div className="space-y-3">
              {[
                { key: 'cash', label: 'Cash', icon: DollarSign },
                { key: 'card', label: 'Card', icon: CreditCard },
                { key: 'mobile', label: 'Mobile Money', icon: Smartphone },
                { key: 'roomCharge', label: 'Room Charge', icon: Building }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{method.label}</span>
                    </div>
                    <button
                      onClick={() => setEnabledPaymentMethods({ ...enabledPaymentMethods, [method.key]: !enabledPaymentMethods[method.key as keyof typeof enabledPaymentMethods] })}
                      className={`p-1 rounded-lg transition-all ${
                        enabledPaymentMethods[method.key as keyof typeof enabledPaymentMethods]
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                      }`}
                    >
                      {enabledPaymentMethods[method.key as keyof typeof enabledPaymentMethods] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">Payment Configuration</h5>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Ensure payment terminals are properly configured before enabling card payments. Contact your administrator for setup assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign size={20} className="text-indigo-600" />
              Tax & Fees Configuration
            </h3>

            <div className="space-y-3">
              {taxRates.map((tax) => (
                <div key={tax.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                      <Percent size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{tax.name}</h5>
                      <p className="text-xs text-slate-500">{tax.rate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tax.isDefault && (
                      <span className="text-[10px] px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full font-bold">
                        Default
                      </span>
                    )}
                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-400 transition-all">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all w-full justify-center">
              <Plus size={16} />
              Add Tax Rate
            </button>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette size={20} className="text-indigo-600" />
              Display Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">Show Product Images</h5>
                  <p className="text-xs text-slate-500">Display images in product grid</p>
                </div>
                <button
                  onClick={() => setDisplaySettings({ ...displaySettings, showImages: !displaySettings.showImages })}
                  className={`p-1 rounded-lg transition-all ${
                    displaySettings.showImages
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                  }`}
                >
                  {displaySettings.showImages ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">Show Quick Actions</h5>
                  <p className="text-xs text-slate-500">Display quick action buttons</p>
                </div>
                <button
                  onClick={() => setDisplaySettings({ ...displaySettings, showQuickActions: !displaySettings.showQuickActions })}
                  className={`p-1 rounded-lg transition-all ${
                    displaySettings.showQuickActions
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                  }`}
                >
                  {displaySettings.showQuickActions ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Grid Columns
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setDisplaySettings({ ...displaySettings, gridColumns: cols })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        displaySettings.gridColumns === cols
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {cols} Columns
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setDisplaySettings({ ...displaySettings, fontSize: size })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all capitalize ${
                        displaySettings.fontSize === size
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Theme
                </label>
                <div className="flex gap-2">
                  {(['light', 'dark'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setDisplaySettings({ ...displaySettings, theme })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all capitalize ${
                        displaySettings.theme === theme
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
