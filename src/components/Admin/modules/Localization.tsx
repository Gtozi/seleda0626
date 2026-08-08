import React, { useState } from 'react';
import { Globe, Calendar, Hash, DollarSign, Clock, Calendar as FiscalCalendar, Search, Plus, Settings, Activity, CheckCircle, XCircle, Filter, MoreVertical, Languages, MapPin, Save } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  code: string;
  nativeName: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  completion: number;
}

interface DateFormat {
  id: string;
  name: string;
  format: string;
  example: string;
  isDefault: boolean;
  region: string;
}

interface NumberFormat {
  id: string;
  name: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  example: string;
  isDefault: boolean;
  region: string;
}

interface CurrencyFormat {
  id: string;
  currency: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  example: string;
  isDefault: boolean;
}

interface TimeZone {
  id: string;
  name: string;
  region: string;
  offset: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
}

interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'active' | 'closed' | 'upcoming';
}

const Localization: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([
    { id: '1', name: 'English', code: 'en', nativeName: 'English', isDefault: true, status: 'active', completion: 100 },
    { id: '2', name: 'French', code: 'fr', nativeName: 'Français', isDefault: false, status: 'active', completion: 95 },
    { id: '3', name: 'Spanish', code: 'es', nativeName: 'Español', isDefault: false, status: 'active', completion: 85 },
    { id: '4', name: 'German', code: 'de', nativeName: 'Deutsch', isDefault: false, status: 'active', completion: 70 },
    { id: '5', name: 'Amharic', code: 'am', nativeName: 'አማርኛ', isDefault: false, status: 'inactive', completion: 60 },
  ]);

  const [dateFormats, setDateFormats] = useState<DateFormat[]>([
    { id: '1', name: 'US Format', format: 'MM/DD/YYYY', example: '01/15/2024', isDefault: true, region: 'US' },
    { id: '2', name: 'European Format', format: 'DD/MM/YYYY', example: '15/01/2024', isDefault: false, region: 'EU' },
    { id: '3', name: 'ISO Format', format: 'YYYY-MM-DD', example: '2024-01-15', isDefault: false, region: 'International' },
    { id: '4', name: 'Ethiopian Format', format: 'DD/MM/YYYY (Eth)', example: '07/07/2016', isDefault: false, region: 'Ethiopia' },
  ]);

  const [numberFormats, setNumberFormats] = useState<NumberFormat[]>([
    { id: '1', name: 'US Format', decimalSeparator: '.', thousandsSeparator: ',', example: '1,234.56', isDefault: true, region: 'US' },
    { id: '2', name: 'European Format', decimalSeparator: ',', thousandsSeparator: '.', example: '1.234,56', isDefault: false, region: 'EU' },
    { id: '3', name: 'Indian Format', decimalSeparator: '.', thousandsSeparator: ',', example: '1,23,456.78', isDefault: false, region: 'India' },
  ]);

  const [currencyFormats, setCurrencyFormats] = useState<CurrencyFormat[]>([
    { id: '1', currency: 'USD', symbol: '$', symbolPosition: 'before', decimalPlaces: 2, example: '$1,234.56', isDefault: true },
    { id: '2', currency: 'EUR', symbol: '€', symbolPosition: 'before', decimalPlaces: 2, example: '€1.234,56', isDefault: false },
    { id: '3', currency: 'GBP', symbol: '£', symbolPosition: 'before', decimalPlaces: 2, example: '£1,234.56', isDefault: false },
    { id: '4', currency: 'ETB', symbol: 'ብር', symbolPosition: 'after', decimalPlaces: 2, example: '1,234.56 ብር', isDefault: false },
  ]);

  const [timeZones, setTimeZones] = useState<TimeZone[]>([
    { id: '1', name: 'Eastern Time', region: 'America/New_York', offset: 'UTC-5', isDefault: true, status: 'active' },
    { id: '2', name: 'Central European Time', region: 'Europe/Paris', offset: 'UTC+1', isDefault: false, status: 'active' },
    { id: '3', name: 'East Africa Time', region: 'Africa/Addis_Ababa', offset: 'UTC+3', isDefault: false, status: 'active' },
    { id: '4', name: 'Pacific Time', region: 'America/Los_Angeles', offset: 'UTC-8', isDefault: false, status: 'inactive' },
  ]);

  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([
    { id: '1', name: 'FY 2024', startDate: '2024-01-01', endDate: '2024-12-31', isCurrent: true, status: 'active' },
    { id: '2', name: 'FY 2023', startDate: '2023-01-01', endDate: '2023-12-31', isCurrent: false, status: 'closed' },
    { id: '3', name: 'FY 2025', startDate: '2025-01-01', endDate: '2025-12-31', isCurrent: false, status: 'upcoming' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'languages' | 'date_formats' | 'number_formats' | 'currency_formats' | 'time_zones' | 'fiscal_year'>('languages');

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'current': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': case 'closed': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'upcoming': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const localizationStats = [
    { label: 'Languages', value: languages.filter(l => l.status === 'active').length, icon: Languages, color: 'text-blue-600' },
    { label: 'Date Formats', value: dateFormats.length, icon: Calendar, color: 'text-emerald-600' },
    { label: 'Number Formats', value: numberFormats.length, icon: Hash, color: 'text-purple-600' },
    { label: 'Currencies', value: currencyFormats.length, icon: DollarSign, color: 'text-amber-600' },
    { label: 'Time Zones', value: timeZones.filter(t => t.status === 'active').length, icon: Clock, color: 'text-cyan-600' },
    { label: 'Fiscal Years', value: fiscalYears.filter(f => f.status === 'active').length, icon: FiscalCalendar, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Localization</h1>
          <p className="text-xs text-slate-400">Configure languages, date formats, number formats, currency formats, time zones, and fiscal year</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Localization Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {localizationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('languages')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'languages'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Languages
        </button>
        <button
          onClick={() => setActiveTab('date_formats')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'date_formats'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Date Formats
        </button>
        <button
          onClick={() => setActiveTab('number_formats')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'number_formats'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Number Formats
        </button>
        <button
          onClick={() => setActiveTab('currency_formats')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'currency_formats'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Currency Formats
        </button>
        <button
          onClick={() => setActiveTab('time_zones')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'time_zones'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Time Zones
        </button>
        <button
          onClick={() => setActiveTab('fiscal_year')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'fiscal_year'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Fiscal Year
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search localization settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {activeTab === 'languages' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Supported Languages</h3>
              <p className="text-xs text-slate-400">Manage available languages and translation progress</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Language
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLanguages.map((lang) => (
                  <tr key={lang.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                          <Globe size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{lang.name}</div>
                          <div className="text-[10px] text-slate-400">{lang.nativeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{lang.code}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(lang.status)}`}>
                        {lang.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${lang.completion}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{lang.completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lang.isDefault && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit language">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as default">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'date_formats' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Date Formats</h3>
              <p className="text-xs text-slate-400">Configure regional date display formats</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Format
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Format Name</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Pattern</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Example</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {dateFormats.map((format) => (
                  <tr key={format.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{format.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{format.format}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.example}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.region}</td>
                    <td className="px-6 py-4">
                      {format.isDefault && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit format">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as default">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'number_formats' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Number Formats</h3>
              <p className="text-xs text-slate-400">Configure decimal and thousand separators</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Format
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Format Name</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Decimal</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Thousands</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Example</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {numberFormats.map((format) => (
                  <tr key={format.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{format.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">"{format.decimalSeparator}"</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">"{format.thousandsSeparator}"</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.example}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.region}</td>
                    <td className="px-6 py-4">
                      {format.isDefault && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit format">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as default">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'currency_formats' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Currency Formats</h3>
              <p className="text-xs text-slate-400">Configure currency symbols and display formats</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Currency
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Decimals</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Example</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {currencyFormats.map((format) => (
                  <tr key={format.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{format.currency}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.symbol}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{format.symbolPosition}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.decimalPlaces}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format.example}</td>
                    <td className="px-6 py-4">
                      {format.isDefault && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit format">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as default">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'time_zones' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Time Zones</h3>
              <p className="text-xs text-slate-400">Configure supported time zones and offsets</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Time Zone
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Time Zone</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Offset</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {timeZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{zone.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{zone.region}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{zone.offset}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(zone.status)}`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {zone.isDefault && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit time zone">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as default">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fiscal_year' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Fiscal Year Configuration</h3>
              <p className="text-xs text-slate-400">Manage fiscal year periods and status</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={14} />
              Add Fiscal Year
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Fiscal Year</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Current</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {fiscalYears.map((fy) => (
                  <tr key={fy.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 flex items-center justify-center">
                          <FiscalCalendar size={20} />
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{fy.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{fy.startDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{fy.endDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(fy.status)}`}>
                        {fy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {fy.isCurrent && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit fiscal year">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Set as current">
                          <CheckCircle size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Settings Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Current Default Settings</h3>
            <p className="text-xs text-slate-400">Summary of active localization defaults</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">Default Language</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {languages.find(l => l.isDefault)?.name || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">Date Format</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {dateFormats.find(f => f.isDefault)?.format || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">Currency</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {currencyFormats.find(f => f.isDefault)?.currency || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">Time Zone</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {timeZones.find(t => t.isDefault)?.name || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 flex items-center justify-center">
                <FiscalCalendar size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">Fiscal Year</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {fiscalYears.find(f => f.isCurrent)?.name || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localization;