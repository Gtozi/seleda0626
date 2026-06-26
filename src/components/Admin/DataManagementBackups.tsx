/**
 * Data Management & Backups
 * 1. Database Backup & Restore
 * 2. Data Retention Policies
 */

import React, { useState, useMemo } from 'react';
import {
  Database, Archive, RefreshCw, Download, Upload, ShieldCheck,
  Clock, Save, CheckCircle2, AlertTriangle, Trash2, HardDrive,
  Cloud, FileJson, FileSpreadsheet, Settings, Calendar, CheckCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useSystem } from '../../context/SystemContext';

type BackupTab = 'backups' | 'retention' | 'exports';

const TAB_META: { id: BackupTab; label: string; icon: React.ReactNode }[] = [
  { id: 'backups', label: 'Backups & Restore', icon: <Archive size={14} /> },
  { id: 'retention', label: 'Data Retention', icon: <Clock size={14} /> },
  { id: 'exports', label: 'Manual Exports', icon: <Download size={14} /> },
];

export default function DataManagementBackups() {
  const [activeTab, setActiveTab] = useState<BackupTab>('backups');

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
        {activeTab === 'backups' && <BackupsModule />}
        {activeTab === 'retention' && <RetentionModule />}
        {activeTab === 'exports' && <ExportsModule />}
      </div>
    </div>
  );
}

function BackupsModule() {
  const { currentSystemDate } = useSystem();
  const [schedule, setSchedule] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'manual',
    time: '02:00',
    cloudEnabled: true,
    localEnabled: true,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  const snapshots = useMemo(() => {
    const base = new Date(currentSystemDate);
    const rows: { id: string; date: string; time: string; type: string; size: string; status: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      rows.push({
        id: `SNAP_${9422 - i}`,
        date: dateStr,
        time: '02:00 UTC',
        type: i === 0 ? 'Full' : 'Diff',
        size: i === 0 ? '12.4 GB' : `${200 + i * 15}MB`,
        status: i === 0 ? 'Healthy' : 'Verified'
      });
    }
    return rows;
  }, [currentSystemDate]);

  const handleSave = () => {
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Storage Used', value: '42.2 GB', icon: HardDrive, color: 'indigo' },
          { label: 'Backup Health', value: '100%', icon: ShieldCheck, color: 'emerald' },
          { label: 'Next Backup', value: 'Tonight 02:00', icon: Clock, color: 'amber' },
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
          <Settings size={18} className="text-indigo-500" /> Backup Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Frequency</label>
            <select value={schedule.frequency} onChange={e => setSchedule(f => ({ ...f, frequency: e.target.value as any }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Backup Time</label>
            <input type="time" value={schedule.time} onChange={e => setSchedule(f => ({ ...f, time: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={schedule.cloudEnabled} onChange={e => setSchedule(f => ({ ...f, cloudEnabled: e.target.checked }))} />
            Cloud Backup
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={schedule.localEnabled} onChange={e => setSchedule(f => ({ ...f, localEnabled: e.target.checked }))} />
            Local Mirror
          </label>
        </div>
      </div>

      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Snapshots</h3>
          <button onClick={() => triggerToast('Manual snapshot triggered successfully.', 'success')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-700">
            <RefreshCw size={12} /> Trigger Now
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {snapshots.map(row => (
            <div key={row.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl border-2 border-slate-100 flex items-center justify-center font-black text-slate-400 font-mono text-[10px]">
                  {row.type === 'Full' ? 'F' : 'D'}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">{row.id} • {row.size}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{row.date} @ {row.time}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{row.status}</span>
                <button onClick={() => triggerToast(`Snapshot ${row.id} download started.`, 'info')} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Backup Settings'}
        </button>
      </div>
    </div>
  );
}

function RetentionModule() {
  const [policy, setPolicy] = useState({
    guestDataRetentionMonths: 24,
    auditLogRetentionMonths: 60,
    autoAnonymize: true,
    archiveBeforeDelete: true,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm text-amber-700 font-medium">
        <AlertTriangle size={16} /> Configure retention carefully — deleted data cannot be recovered.
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Clock size={18} className="text-indigo-500" /> Data Retention Policies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Guest Data Retention (months)</label>
            <input type="number" min={1} max={120} value={policy.guestDataRetentionMonths}
              onChange={e => setPolicy(f => ({ ...f, guestDataRetentionMonths: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Audit Log Retention (months)</label>
            <input type="number" min={1} max={120} value={policy.auditLogRetentionMonths}
              onChange={e => setPolicy(f => ({ ...f, auditLogRetentionMonths: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
        </div>
        <div className="space-y-3">
          <ToggleRow label="Auto-anonymize expired guest data" description="Replace PII with anonymized tokens before deletion."
            enabled={policy.autoAnonymize} onChange={v => setPolicy(f => ({ ...f, autoAnonymize: v }))} />
          <ToggleRow label="Archive to cold storage before deletion" description="Move expired records to long-term archive before purging."
            enabled={policy.archiveBeforeDelete} onChange={v => setPolicy(f => ({ ...f, archiveBeforeDelete: v }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Retention Policy'}
        </button>
      </div>
    </div>
  );
}

function ExportsModule() {
  const { guests, rooms, inventoryItems, reservations } = useERP();

  const exportData = (label: string, data: any[], type: 'csv' | 'json') => {
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase().replace(/\s+/g, '_')}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Guests', count: guests.length, icon: Database },
          { label: 'Rooms', count: rooms.length, icon: Archive },
          { label: 'Inventory', count: inventoryItems.length, icon: Database },
          { label: 'Reservations', count: reservations.length, icon: Calendar },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600"><s.icon size={20} /></div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <h4 className="text-xl font-black text-slate-900">{s.count}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Download size={18} className="text-indigo-500" /> Manual Data Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Guest Profiles', desc: 'CSV/JSON export of all guest records', records: guests.length, data: guests },
            { name: 'Room Inventory', desc: 'CSV/JSON export of room master data', records: rooms.length, data: rooms },
            { name: 'Inventory SKUs', desc: 'CSV/JSON export of inventory items', records: inventoryItems.length, data: inventoryItems },
            { name: 'Reservations', desc: 'CSV/JSON export of booking history', records: reservations.length, data: reservations },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">{item.name}</span>
                <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                <span className="text-[10px] font-mono text-slate-400">{item.records.toLocaleString()} records</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportData(item.name, item.data, 'csv')}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-white transition flex items-center gap-1">
                  <FileSpreadsheet size={12} /> CSV
                </button>
                <button onClick={() => exportData(item.name, item.data, 'json')}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-white transition flex items-center gap-1">
                  <FileJson size={12} /> JSON
                </button>
              </div>
            </div>
          ))}
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
