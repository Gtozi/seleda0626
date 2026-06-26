/**
 * System Integration & Channel Management
 * 1. Channel Manager Sync
 * 2. Hardware Peripherals
 * 3. Local Network Config
 */

import React, { useState } from 'react';
import {
  Share2, Wifi, Lock, Key, Save, CheckCircle2, Plus, Trash2,
  DoorOpen, Printer, Monitor, HardDrive, Server, Globe,
  AlertTriangle, Settings, Activity
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

type IntegrationTab = 'channel_manager' | 'hardware' | 'network';

const TAB_META: { id: IntegrationTab; label: string; icon: React.ReactNode }[] = [
  { id: 'channel_manager', label: 'Channel Manager Sync', icon: <Share2 size={14} /> },
  { id: 'hardware', label: 'Hardware Peripherals', icon: <Printer size={14} /> },
  { id: 'network', label: 'Local Network', icon: <Wifi size={14} /> },
];

export default function SystemIntegrationChannel() {
  const [activeTab, setActiveTab] = useState<IntegrationTab>('channel_manager');

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
        {activeTab === 'channel_manager' && <ChannelManagerModule />}
        {activeTab === 'hardware' && <HardwarePeripheralsModule />}
        {activeTab === 'network' && <LocalNetworkModule />}
      </div>
    </div>
  );
}

function ChannelManagerModule() {
  const { globalHotelSettings } = useERP();
  const [channels, setChannels] = useState([
    { name: 'Booking.com', status: 'connected', lastSync: '2 min ago', rateSync: true, availSync: true },
    { name: 'Expedia', status: 'connected', lastSync: '5 min ago', rateSync: true, availSync: true },
    { name: 'Direct Website', status: 'connected', lastSync: 'Live', rateSync: true, availSync: true },
  ]);

  const toggleSync = (idx: number, field: 'rateSync' | 'availSync') => {
    setChannels(prev => prev.map((c, i) => i === idx ? { ...c, [field]: !c[field] } : c));
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Channels', value: channels.filter(c => c.status === 'connected').length, icon: Globe, color: 'indigo' },
          { label: 'Pending Sync', value: 0, icon: Share2, color: 'amber' },
          { label: 'API Health', value: 'Healthy', icon: Activity, color: 'emerald' },
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
          <Share2 size={18} className="text-violet-500" /> Connected Distribution Channels
        </h2>
        <div className="space-y-3">
          {channels.map((ch, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600">
                  <Globe size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{ch.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">{ch.lastSync}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={ch.rateSync} onChange={() => toggleSync(i, 'rateSync')} className="rounded" />
                  Rate Sync
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={ch.availSync} onChange={() => toggleSync(i, 'availSync')} className="rounded" />
                  Avail. Sync
                </label>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  ch.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>{ch.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Key size={18} className="text-amber-500" /> API Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Channel Manager API Key</label>
            <input type="password" defaultValue="sk_live_••••••••••••••••" readOnly
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Property ID</label>
            <input defaultValue="PROP-7782-ETH" readOnly
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HardwarePeripheralsModule() {
  const [devices, setDevices] = useState([
    { id: 'doorlock-01', name: 'Main Entrance Encoder', type: 'Door Lock', status: 'online', ip: '192.168.1.101' },
    { id: 'printer-01', name: 'Reception Thermal Printer', type: 'Receipt Printer', status: 'online', ip: '192.168.1.102' },
    { id: 'kds-01', name: 'Kitchen Display System', type: 'KDS', status: 'offline', ip: '192.168.1.103' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Online Devices', value: devices.filter(d => d.status === 'online').length, icon: DoorOpen, color: 'emerald' },
          { label: 'Offline', value: devices.filter(d => d.status === 'offline').length, icon: AlertTriangle, color: 'rose' },
          { label: 'Total Mapped', value: devices.length, icon: Printer, color: 'indigo' },
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
          <Monitor size={18} className="text-indigo-500" /> Hardware Peripheral Registry
        </h2>
        <div className="space-y-2">
          {devices.map(device => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600">
                  {device.type === 'Door Lock' ? <DoorOpen size={16} /> :
                   device.type === 'Receipt Printer' ? <Printer size={16} /> :
                   <Monitor size={16} />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{device.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">{device.ip}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                device.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>{device.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocalNetworkModule() {
  const [config, setConfig] = useState({
    backupStoragePath: '/mnt/backup/local',
    enableLocalMirror: true,
    wifiSsid: 'Hotel-Staff-5G',
    wifiPassword: '',
  });

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <HardDrive size={18} className="text-indigo-500" /> Local Backup Storage
        </h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Local Backup Path</label>
            <input value={config.backupStoragePath} onChange={e => setConfig(f => ({ ...f, backupStoragePath: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setConfig(f => ({ ...f, enableLocalMirror: !f.enableLocalMirror }))}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${config.enableLocalMirror ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${config.enableLocalMirror ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm font-bold text-slate-800">Enable local mirror sync</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Wifi size={18} className="text-violet-500" /> Staff Network Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">WiFi SSID</label>
            <input value={config.wifiSsid} onChange={e => setConfig(f => ({ ...f, wifiSsid: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">WiFi Password</label>
            <input type="password" value={config.wifiPassword} onChange={e => setConfig(f => ({ ...f, wifiPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
