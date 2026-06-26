/**
 * Global System Settings & Localization
 * 1. Localization (timezone, date format, language)
 * 2. Night Audit Automations
 * 3. Notification & Email Templates
 */

import React, { useState } from 'react';
import {
  Globe, Clock, Mail, Save, CheckCircle2, Settings, Languages,
  Calendar, Moon, Sun, Bell, FileText, Send, ChevronDown, PenLine, X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import type { GlobalHotelSettings } from '../../types/erp';

type SettingsTab = 'localization' | 'night_audit' | 'templates';

const TAB_META: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'localization', label: 'Localization', icon: <Globe size={14} /> },
  { id: 'night_audit', label: 'Night Audit', icon: <Moon size={14} /> },
  { id: 'templates', label: 'Email Templates', icon: <Mail size={14} /> },
];

export default function GlobalSystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('localization');

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
        {activeTab === 'localization' && <LocalizationModule />}
        {activeTab === 'night_audit' && <NightAuditModule />}
        {activeTab === 'templates' && <EmailTemplatesModule />}
      </div>
    </div>
  );
}

function LocalizationModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'YYYY-MM-DD',
    language: 'en',
    currency: 'USD',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Localization Preferences',
      `Timezone: ${form.timezone}, Date Format: ${form.dateFormat}, Language: ${form.language}, Currency: ${form.currency}`,
      'global-setting',
      { currency: form.currency }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Globe size={18} className="text-indigo-500" /> Regional Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Time Zone</label>
            <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT, UTC+3)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New York (EST/EDT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Date Format</label>
            <select value={form.dateFormat} onChange={e => setForm(f => ({ ...f, dateFormat: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Default Language</label>
            <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Base Currency</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="USD">USD — US Dollar</option>
              <option value="ETB">ETB — Ethiopian Birr</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Localization'}
        </button>
      </div>
    </div>
  );
}

function NightAuditModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    autoNightAuditTime: globalHotelSettings.autoNightAuditTime || '02:00',
    enableAutoNightAudit: !!globalHotelSettings.autoNightAuditTime,
    postRoomCharges: true,
    generateDailySummary: true,
    autoCheckinReminders: true,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Night Audit Schedule',
      `Set automatic night audit time to ${form.autoNightAuditTime} (${form.enableAutoNightAudit ? 'enabled' : 'disabled'})`,
      'global-setting',
      { autoNightAuditTime: form.enableAutoNightAudit ? form.autoNightAuditTime : undefined }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Moon size={18} className="text-indigo-500" /> Night Audit Automation
        </h2>
        <div className="space-y-4">
          <ToggleRow label="Enable automatic Night Audit" description="Run end-of-day posting, charge posting, and summary generation automatically."
            enabled={form.enableAutoNightAudit} onChange={v => setForm(f => ({ ...f, enableAutoNightAudit: v }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Scheduled Time</label>
              <input type="time" value={form.autoNightAuditTime} onChange={e => setForm(f => ({ ...f, autoNightAuditTime: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
          </div>
          <ToggleRow label="Auto-post room charges" description="Automatically post nightly room charges to all active folios."
            enabled={form.postRoomCharges} onChange={v => setForm(f => ({ ...f, postRoomCharges: v }))} />
          <ToggleRow label="Generate daily summary report" description="Create and email the daily revenue and occupancy summary."
            enabled={form.generateDailySummary} onChange={v => setForm(f => ({ ...f, generateDailySummary: v }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Night Audit Settings'}
        </button>
      </div>
    </div>
  );
}

type EmailTemplate = NonNullable<GlobalHotelSettings['emailTemplates']>[number];

function EmailTemplatesModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const dbTemplates = globalHotelSettings.emailTemplates || [];
  const [templates, setTemplates] = useState<EmailTemplate[]>(dbTemplates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [creating, setCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, 'id'>>({
    name: '', subject: '', body: '', enabled: true, variables: []
  });
  const [newVariable, setNewVariable] = useState('');

  // Sync local form state when global settings load / change
  React.useEffect(() => {
    setTemplates(dbTemplates);
  }, [globalHotelSettings.emailTemplates]);

  const updateField = (id: string, field: keyof EmailTemplate, value: string | boolean) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSave = () => {
    submitGlobalSettingsChange(
      'Email Templates',
      `Updated ${templates.length} transactional email templates`,
      'global-setting',
      { emailTemplates: templates }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const addNewTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim()) return;
    const id = `custom_${Date.now()}`;
    const created: EmailTemplate = { ...newTemplate, id };
    setTemplates(prev => [...prev, created]);
    setNewTemplate({ name: '', subject: '', body: '', enabled: true, variables: [] });
    setCreating(false);
    setExpandedId(id);
  };

  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addVariableToNew = () => {
    const v = newVariable.trim().replace(/^{{|}}$/g, '');
    if (!v || newTemplate.variables.includes(v)) return;
    setNewTemplate(prev => ({ ...prev, variables: [...prev.variables, v] }));
    setNewVariable('');
  };

  const removeVariableFromNew = (v: string) => {
    setNewTemplate(prev => ({ ...prev, variables: prev.variables.filter(x => x !== v) }));
  };

  const addVariableToExisting = (id: string, raw: string) => {
    const v = raw.trim().replace(/^{{|}}$/g, '');
    if (!v) return;
    setTemplates(prev => prev.map(t => t.id === id && !t.variables.includes(v) ? { ...t, variables: [...t.variables, v] } : t));
  };

  const removeVariableFromExisting = (id: string, v: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, variables: t.variables.filter(x => x !== v) } : t));
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail size={18} className="text-indigo-500" /> Transactional Email Templates
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCreating(c => !c)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition">
              {creating ? <X size={14} /> : <PenLine size={14} />}
              {creating ? 'Cancel' : 'New Template'}
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
              {saveStatus === 'success' ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {saveStatus === 'success' ? 'Saved' : 'Save Templates'}
            </button>
          </div>
        </div>

        {creating && (
          <div className="mb-4 border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
            <h3 className="text-xs font-sans font-black text-slate-900 tracking-tight">Create New Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 font-bold">Template Name</label>
                <input type="text" value={newTemplate.name} placeholder="e.g. Invoice Reminder"
                  onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 font-bold">Subject Line</label>
                <input type="text" value={newTemplate.subject} placeholder="Email subject..."
                  onChange={e => setNewTemplate(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Body</label>
              <textarea value={newTemplate.body} placeholder="Email body..."
                onChange={e => setNewTemplate(p => ({ ...p, body: e.target.value }))}
                rows={6}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono resize-y" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Variables</label>
              <div className="flex items-center gap-2">
                <input type="text" value={newVariable} placeholder="guestName"
                  onChange={e => setNewVariable(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariableToNew(); } }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" />
                <button onClick={addVariableToNew}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newTemplate.variables.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                    {'{{' + v + '}}'}
                    <button onClick={() => removeVariableFromNew(v)} className="hover:text-red-600"><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={addNewTemplate}
                disabled={!newTemplate.name.trim() || !newTemplate.subject.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle2 size={14} /> Create Template
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {templates.map(t => {
            const isOpen = expandedId === t.id;
            return (
              <div key={t.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${t.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {t.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">{t.subject}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); updateField(t.id, 'enabled', !t.enabled); }}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${t.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${t.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    {isOpen ? <X size={16} className="text-slate-400" /> : <PenLine size={16} className="text-slate-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-400 font-bold">Subject Line</label>
                      <input
                        type="text"
                        value={t.subject}
                        onChange={e => updateField(t.id, 'subject', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                        placeholder="Email subject..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-400 font-bold">Body</label>
                      <textarea
                        value={t.body}
                        onChange={e => updateField(t.id, 'body', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono resize-y"
                        placeholder="Email body..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-400 font-bold">Available Variables</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add variable..."
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariableToExisting(t.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                        />
                        <button
                          onClick={e => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            addVariableToExisting(t.id, input.value);
                            input.value = '';
                          }}
                          className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {t.variables.map(v => (
                          <span key={v} className="inline-flex items-center gap-1 text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                            {'{{' + v + '}}'}
                            <button onClick={() => removeVariableFromExisting(t.id, v)} className="hover:text-red-600"><X size={10} /></button>
                          </span>
                        ))}
                        {t.variables.length === 0 && (
                          <span className="text-[10px] text-slate-400 italic">No variables defined</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => removeTemplate(t.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                      >
                        <X size={12} /> Delete Template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }: { label: string; description?: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button type="button" role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
