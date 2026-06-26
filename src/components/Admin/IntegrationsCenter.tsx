/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  Globe, 
  Cpu, 
  MessageSquare, 
  CreditCard,
  Mail,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

const FALLBACK_INTEGRATIONS = [
  { name: 'Stripe Payments', category: 'Finance', status: 'Healthy', icon: CreditCard, color: 'indigo' },
  { name: 'WhatsApp Business', category: 'CRM', status: 'Warning', icon: MessageSquare, color: 'emerald' },
  { name: 'SendGrid Email', category: 'Communication', status: 'Healthy', icon: Mail, color: 'indigo' },
  { name: 'Google Cloud Backup', category: 'System', status: 'Healthy', icon: Cpu, color: 'purple' },
  { name: 'Firebase Auth', category: 'Security', status: 'Healthy', icon: Globe, color: 'rose' },
];

export default function IntegrationsCenter() {
  const { globalHotelSettings } = useSystem();
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  const integrations = useMemo(() => {
    const apiList = globalHotelSettings.apiIntegrations;
    if (!apiList || apiList.length === 0) return FALLBACK_INTEGRATIONS;
    return apiList.map((api: any) => ({
      name: api.serviceName,
      category: api.category || 'System',
      status: api.status === 'active' ? 'Healthy' : 'Warning',
      icon: api.serviceName.toLowerCase().includes('stripe') ? CreditCard : api.serviceName.toLowerCase().includes('mail') ? Mail : Globe,
      color: 'indigo'
    }));
  }, [globalHotelSettings.apiIntegrations]);

  return (
    <div className="space-y-6 animate-fade-in" id="integrations-module">
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">External Connectivity</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Integrations & API Center</h2>
        </div>
        <button onClick={() => triggerToast('Integration marketplace opened.', 'info')} className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition hover:scale-105">
           <Plus size={14} /> Connect New Service
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((app, i) => {
                const Icon = app.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:border-indigo-500 transition group cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                       <div className={`p-2.5 rounded-xl bg-${app.color}-500/10 text-${app.color}-600`}>
                          <Icon size={24} />
                       </div>
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-850">
                          <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-widest ${app.status === 'Healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>{app.status}</span>
                       </div>
                    </div>
                    
                    <div className="relative z-10">
                       <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">{app.name}</h4>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 block">{app.category} Subsystem</span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center relative z-10 transition-transform group-hover:translate-x-1">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Config Vault</span>
                       <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-slate-950 p-8 rounded-3xl text-white shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                 <Zap size={18} className="text-amber-400" />
                 <h4 className="font-black text-sm uppercase tracking-widest">Webhook Monitoring</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { event: 'Payment Success (Stripe)', time: '2m ago', status: 'OK' },
                   { event: 'WhatsApp Template Delivered', time: '14m ago', status: 'OK' },
                   { event: 'Google Sync Failure', time: '1h ago', status: 'ERR' },
                 ].map((hook, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold">
                      <div className="flex gap-4 items-center">
                         <div className="text-slate-500 font-mono italic">#{1024 - i}</div>
                         <div>{hook.event}</div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="opacity-40">{hook.time}</span>
                         <span className={`font-black p-1 rounded ${hook.status === 'OK' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{hook.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Developer Vault</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Securely manage API keys, client secrets, and environment tokens. All keys are encrypted at rest.</p>
           </div>
           
           <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800 flex justify-between items-center">
                 <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-ellipsis overflow-hidden">STRIPE_SEC_KEY</span>
                 <Share2 size={12} className="text-slate-300" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-ellipsis overflow-hidden">WABA_TOKEN_v2</span>
                <Share2 size={12} className="text-slate-300" />
              </div>
           </div>
           
           <button onClick={() => triggerToast('Secret Manager vault accessed.', 'info')} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition hover:scale-105 active:scale-95">
              Access Secret Manager
           </button>
        </div>
      </div>
    </div>
  );
}
