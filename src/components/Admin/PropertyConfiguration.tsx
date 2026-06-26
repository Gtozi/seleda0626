/**
 * Consolidated Property & Configuration Center
 * Merges BusinessAdmin, GlobalConfigModule, IntegrationsCenter,
 * and the system configuration sections formerly in SystemAdmin.
 */

import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Link2,
  ShieldCheck,
  Settings,
  Layers,
  Save,
  ChevronRight
} from 'lucide-react';
import GlobalConfigModule from '../Settings/GlobalConfigModule';
import IntegrationsCenter from './IntegrationsCenter';

type ConfigTab = 'global' | 'integrations';

const tabs: { id: ConfigTab; label: string; icon: React.ReactNode }[] = [
  { id: 'global', label: 'Portal & Global Config', icon: <Globe size={14} /> },
  { id: 'integrations', label: 'Integrations & APIs', icon: <Link2 size={14} /> },
];

export default function PropertyConfiguration() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('global');

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4">
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {tabs.map(t => (
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

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'global' && <GlobalConfigModule />}
        {activeTab === 'integrations' && <IntegrationsCenter />}
      </div>
    </div>
  );
}
