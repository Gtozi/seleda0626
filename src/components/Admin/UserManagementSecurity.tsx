/**
 * User Management & Security (Identity & Access Control)
 * 1. Role-Based Access Control (RBAC)
 * 2. User Profiles
 * 3. Audit Logs
 * 4. Security Settings
 */

import React, { useState, useMemo } from 'react';
import {
  Shield, Users, Key, FileSearch, Lock, Smartphone, Fingerprint,
  Save, CheckCircle2, AlertTriangle, Search, Filter, Eye, EyeOff,
  Clock, Globe, Mail, ChevronDown, ChevronRight, Activity,
  UserCheck, ShieldAlert, Download
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { User, SystemAuditLog } from '../../types/erp';
import SystemAdmin from '../Executive/SystemAdmin';

type SecurityTab = 'rbac' | 'users' | 'audit' | 'security_settings';

const TAB_META: { id: SecurityTab; label: string; icon: React.ReactNode }[] = [
  { id: 'users', label: 'User Profiles', icon: <Users size={14} /> },
  { id: 'rbac', label: 'Role & Permissions', icon: <Key size={14} /> },
  { id: 'audit', label: 'Audit Logs', icon: <FileSearch size={14} /> },
  { id: 'security_settings', label: 'Security Settings', icon: <Shield size={14} /> },
];

function deriveSeverity(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('fail') || a.includes('denied') || a.includes('lock') || a.includes('unauthorized')) return 'Critical';
  if (a.includes('delete') || a.includes('void') || a.includes('override')) return 'High';
  if (a.includes('update') || a.includes('config') || a.includes('role') || a.includes('change')) return 'Medium';
  return 'Low';
}

export default function UserManagementSecurity() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('users');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {TAB_META.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'users' && <SystemAdmin initialTab="users" showNav={false} />}
        {activeTab === 'rbac' && <SystemAdmin initialTab="roles" showNav={false} />}
        {activeTab === 'audit' && <AuditLogsModule />}
        {activeTab === 'security_settings' && <SecuritySettingsModule />}
      </div>
    </div>
  );
}

// ---------- AUDIT LOGS ----------
function AuditLogsModule() {
  const { structuredAuditLogs, systemUsers } = useERP();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const auditEvents = useMemo(() => {
    return structuredAuditLogs.map((log: SystemAuditLog) => ({
      id: log.id,
      time: log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '',
      user: log.userName || 'Unknown',
      action: log.action,
      module: log.module || 'System',
      severity: deriveSeverity(log.action),
      details: log.details || '',
      ip: log.ipAddress || '—',
    }));
  }, [structuredAuditLogs]);

  const filtered = auditEvents.filter(e => {
    const matchesFilter = activeFilter === 'All' || e.severity === activeFilter;
    const matchesSearch = !searchTerm ||
      e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = auditEvents.filter(e => e.severity === 'Critical').length;
  const highCount = auditEvents.filter(e => e.severity === 'High').length;

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: auditEvents.length, icon: Activity, color: 'indigo' },
          { label: 'Critical', value: criticalCount, icon: ShieldAlert, color: 'rose' },
          { label: 'High Risk', value: highCount, icon: AlertTriangle, color: 'amber' },
          { label: 'Active Users', value: systemUsers.filter((u: User) => u.status === 'Active').length, icon: Users, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600`}><s.icon size={20} /></div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-xl font-black text-slate-900 leading-none">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex gap-2">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                  activeFilter === f ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search audit log..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none w-48 focus:w-64 transition-all" />
            </div>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-50">
              <Download size={12} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">IP</th>
                <th className="px-5 py-3 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                  <td className="px-5 py-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{e.time}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{e.user.charAt(0)}</div>
                      <span className="text-slate-900">{e.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono uppercase">{e.action}</span>
                  </td>
                  <td className="px-5 py-3 text-[10px] text-slate-500 max-w-xs truncate">{e.details}</td>
                  <td className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase">{e.module}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{e.ip}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                      e.severity === 'Critical' ? 'bg-rose-500 text-white' :
                      e.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      e.severity === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{e.severity.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-xs text-slate-400">No audit events match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- SECURITY SETTINGS ----------
function SecuritySettingsModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    passwordComplexity: globalHotelSettings.passwordComplexity || 'medium',
    forceMfa: globalHotelSettings.forceMfa ?? false,
    strictPasswordRotation: globalHotelSettings.strictPasswordRotation ?? false,
    biometricReauth: globalHotelSettings.biometricReauth ?? false,
    sessionTimeout: globalHotelSettings.sessionTimeout ?? 30,
    allowedIps: (globalHotelSettings.allowedIps || []).join('\n'),
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    submitGlobalSettingsChange(
      'Security & Authentication Policy',
      `Password complexity: ${form.passwordComplexity}, MFA: ${form.forceMfa ? 'on' : 'off'}, Session timeout: ${form.sessionTimeout}min, IP whitelist: ${form.allowedIps.split('\n').filter(Boolean).length} entries.`,
      'security-setting',
      {
        passwordComplexity: form.passwordComplexity as any,
        forceMfa: form.forceMfa,
        strictPasswordRotation: form.strictPasswordRotation,
        biometricReauth: form.biometricReauth,
        sessionTimeout: Number(form.sessionTimeout) || 30,
        allowedIps: form.allowedIps.split('\n').map(s => s.trim()).filter(Boolean),
      }
    );
    setTimeout(() => { setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2500); }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Lock size={18} className="text-indigo-500" /> Authentication & Password Policies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Password Complexity</label>
            <select value={form.passwordComplexity} onChange={e => setForm(f => ({ ...f, passwordComplexity: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none">
              <option value="low">Low — Minimum 6 characters</option>
              <option value="medium">Medium — 8 chars, mixed case & number</option>
              <option value="high">High — 12 chars, symbols, no dictionary words</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Session Timeout (minutes)</label>
            <input type="number" min={5} max={480} value={form.sessionTimeout}
              onChange={e => setForm(f => ({ ...f, sessionTimeout: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Smartphone size={18} className="text-emerald-500" /> Multi-Factor Authentication (MFA)
        </h2>
        <div className="space-y-4">
          <ToggleRow label="Enforce MFA for all users" description="Require authenticator app or SMS OTP at every login."
            enabled={form.forceMfa} onChange={v => setForm(f => ({ ...f, forceMfa: v }))} />
          <ToggleRow label="Biometric Re-authentication" description="Prompt for biometric verification on sensitive actions."
            enabled={form.biometricReauth} onChange={v => setForm(f => ({ ...f, biometricReauth: v }))} />
          <ToggleRow label="Mandatory Password Rotation" description="Force password change every 90 days."
            enabled={form.strictPasswordRotation} onChange={v => setForm(f => ({ ...f, strictPasswordRotation: v }))} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Globe size={18} className="text-amber-500" /> IP Access Control
        </h2>
        <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-2">Allowed IP Addresses (one per line)</label>
        <textarea rows={4} value={form.allowedIps}
          onChange={e => setForm(f => ({ ...f, allowedIps: e.target.value }))}
          placeholder="192.168.1.0/24&#10;10.0.0.5"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-mono" />
        <p className="text-[10px] text-slate-400 mt-2">Leave blank to allow all IPs. CIDR notation supported.</p>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50">
          {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Security Policies'}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }: { label: string; description?: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
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
