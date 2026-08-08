import React, { useState } from 'react';
import {
  Settings, Users, Tag, Percent, Crown,
  Mail, MessageSquare, Bell, Save,
} from 'lucide-react';

const CONFIG_SECTIONS = [
  { id: 'general', label: 'General Settings', icon: Settings },
  { id: 'sales-team', label: 'Sales Team', icon: Users },
  { id: 'commission', label: 'Commission Structure', icon: Percent },
  { id: 'loyalty-tiers', label: 'Loyalty Tiers', icon: Crown },
  { id: 'promo-rules', label: 'Promotion Rules', icon: Tag },
  { id: 'notifications', label: 'Notification Settings', icon: Bell },
];

const SalesConfiguration: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [config, setConfig] = useState({
    defaultCurrency: 'USD',
    leadScoringThreshold: 50,
    autoAssignLeads: true,
    proposalValidDays: 30,
    contractPrefix: 'CTR-',
    proposalPrefix: 'PROP-',
    corporateDiscountDefault: 10,
    travelAgentCommissionDefault: 12,
    loyaltyBronzeThreshold: 0,
    loyaltySilverThreshold: 5000,
    loyaltyGoldThreshold: 15000,
    loyaltyPlatinumThreshold: 30000,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    leadAssignedAlert: true,
    proposalStatusAlert: true,
    contractExpiryAlert: true,
    campaignCompletionAlert: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Configuration</h2>
        <p className="text-xs text-slate-400 font-medium">Portal settings, sales team, commission structures, loyalty tiers, and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[28px] shadow-3xs space-y-1">
            {CONFIG_SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeSection === section.id ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950'}`}>
                  <Icon size={14} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">General Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Default Currency</label>
                    <select value={config.defaultCurrency} onChange={e => setConfig({ ...config, defaultCurrency: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>USD</option><option>ETB</option><option>EUR</option><option>GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Lead Scoring Threshold</label>
                    <input type="number" value={config.leadScoringThreshold} onChange={e => setConfig({ ...config, leadScoringThreshold: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Proposal Prefix</label>
                    <input value={config.proposalPrefix} onChange={e => setConfig({ ...config, proposalPrefix: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contract Prefix</label>
                    <input value={config.contractPrefix} onChange={e => setConfig({ ...config, contractPrefix: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Proposal Validity (days)</label>
                    <input type="number" value={config.proposalValidDays} onChange={e => setConfig({ ...config, proposalValidDays: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={config.autoAssignLeads} onChange={e => setConfig({ ...config, autoAssignLeads: e.target.checked })} className="w-4 h-4 rounded accent-indigo-600" />
                  <span className="text-xs font-bold text-slate-600">Auto-assign new leads to sales reps (round-robin)</span>
                </label>
              </div>
            )}

            {activeSection === 'sales-team' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Sales Team Configuration</h3>
                <p className="text-xs font-bold text-slate-400">Manage sales team members, territories, and targets. Configure in Admin → User Security.</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Sales Representatives</p>
                  <p className="text-xs font-bold text-slate-600">Configure sales team members and their access levels through the Admin portal's User Security module.</p>
                </div>
              </div>
            )}

            {activeSection === 'commission' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Commission Structure</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Corporate Discount Default (%)</label>
                    <input type="number" value={config.corporateDiscountDefault} onChange={e => setConfig({ ...config, corporateDiscountDefault: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Travel Agent Commission Default (%)</label>
                    <input type="number" value={config.travelAgentCommissionDefault} onChange={e => setConfig({ ...config, travelAgentCommissionDefault: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'loyalty-tiers' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Loyalty Tier Thresholds</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Bronze (points)</label>
                    <input type="number" value={config.loyaltyBronzeThreshold} onChange={e => setConfig({ ...config, loyaltyBronzeThreshold: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Silver (points)</label>
                    <input type="number" value={config.loyaltySilverThreshold} onChange={e => setConfig({ ...config, loyaltySilverThreshold: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Gold (points)</label>
                    <input type="number" value={config.loyaltyGoldThreshold} onChange={e => setConfig({ ...config, loyaltyGoldThreshold: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Platinum (points)</label>
                    <input type="number" value={config.loyaltyPlatinumThreshold} onChange={e => setConfig({ ...config, loyaltyPlatinumThreshold: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'promo-rules' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Promotion Rules</h3>
                <p className="text-xs font-bold text-slate-400">Configure global rules for promotions, promo codes, and discount limits.</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Rules</p>
                  <ul className="space-y-1 text-[10px] font-bold text-slate-600">
                    <li>- Maximum discount: 30%</li>
                    <li>- Promo code expiry: 90 days default</li>
                    <li>- Stackable promotions: Disabled</li>
                    <li>- Minimum stay for promotions: 1 night</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Notification Settings</h3>
                <div className="space-y-3">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                    { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageSquare },
                    { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
                    { key: 'leadAssignedAlert', label: 'Lead Assigned Alert', icon: Users },
                    { key: 'proposalStatusAlert', label: 'Proposal Status Change Alert', icon: Tag },
                    { key: 'contractExpiryAlert', label: 'Contract Expiry Alert', icon: Settings },
                    { key: 'campaignCompletionAlert', label: 'Campaign Completion Alert', icon: Bell },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <label key={item.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{item.label}</span>
                        </div>
                        <input type="checkbox" checked={(config as any)[item.key]} onChange={e => setConfig({ ...config, [item.key]: e.target.checked })} className="w-4 h-4 rounded accent-indigo-600" />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2">
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesConfiguration;
