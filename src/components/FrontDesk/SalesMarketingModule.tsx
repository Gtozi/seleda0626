/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { RoomType } from '../../types/erp';
import { 
  Megaphone, 
  Tag, 
  Briefcase, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent, 
  FileSpreadsheet, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

export default function SalesMarketingModule() {
  const { 
    campaigns,
    addCampaign,
    promotions,
    addPromotion,
    corporateAccounts,
    addCorporateAccount
  } = useERP();

  // Screen layout toggles
  const [panelSection, setPanelSection] = useState<'campaigns' | 'promotions' | 'corporate'>('campaigns');

  // All features allowed for all users

  // Trigger forms
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(15);
  const [promoCats, setPromoCats] = useState<RoomType[]>(['Double']);
  const [promoSuccess, setPromoSuccess] = useState('');

  // Corporate forms
  const [showAddCorp, setShowAddCorp] = useState(false);
  const [corpName, setCorpName] = useState('');
  const [corpContact, setCorpContact] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpDiscount, setCorpDiscount] = useState(15);
  const [corpSuccess, setCorpSuccess] = useState('');

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode || !promoName) return;

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(today.getFullYear(), today.getMonth() + 4, 0).toISOString().split('T')[0];

    addPromotion({
      code: promoCode.toUpperCase(),
      name: promoName,
      discountPercent: promoDiscount,
      active: true,
      validFrom: startDate,
      validTo: endDate,
      appliesTo: promoCats
    });

    setPromoSuccess(`Promo Code "${promoCode.toUpperCase()}" added successfully.`);
    setTimeout(() => setPromoSuccess(''), 4000);

    setPromoCode('');
    setPromoName('');
    setShowAddPromo(false);
  };

  const handleCreateCorp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpName || !corpContact) return;

    addCorporateAccount({
      companyName: corpName,
      contactPerson: corpContact,
      contactEmail: corpEmail,
      contactPhone: '',
      discountPercent: corpDiscount,
      activeBookings: 0,
      unpaidBalance: 0
    });

    setCorpSuccess(`Corporate Contract Partner agreement established for ${corpName}!`);
    setTimeout(() => setCorpSuccess(''), 4000);

    setCorpName('');
    setCorpContact('');
    setCorpEmail('');
    setShowAddCorp(false);
  };

  return (
    <div className="space-y-6" id="sales-marketing">
      
      {/* Mini internal navigations */}
      <div className="flex border-b border-b-slate-100 gap-1 overflow-x-auto text-xs font-mono font-medium text-slate-500">
        <button
          onClick={() => setPanelSection('campaigns')}
          className={`px-4 py-2 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition ${panelSection === 'campaigns' ? 'border-b-indigo-600 text-indigo-700 font-bold bg-indigo-50/40' : 'border-b-transparent'}`}
        >
          <Megaphone size={14} /> Sales Campaign Tracker
        </button>
        <button
          onClick={() => setPanelSection('promotions')}
          className={`px-4 py-2 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition ${panelSection === 'promotions' ? 'border-b-indigo-600 text-indigo-700 font-bold bg-indigo-50/40' : 'border-b-transparent'}`}
        >
          <Tag size={14} /> Promotions & Packages Builder
        </button>
        <button
          onClick={() => setPanelSection('corporate')}
          className={`px-4 py-2 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition ${panelSection === 'corporate' ? 'border-b-indigo-600 text-indigo-700 font-bold bg-indigo-50/40' : 'border-b-transparent'}`}
        >
          <Briefcase size={14} /> Corporate Account Agreements
        </button>
      </div>

      {/* CAMPAIGN METRICS PANEL */}
      {panelSection === 'campaigns' && (
        <div className="space-y-6 animate-fade-in" id="campaigns-tab">
          
          {/* Summary widgets row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-10/40 border border-indigo-150 rounded-xl space-y-1">
              <span className="text-3xs font-mono uppercase text-indigo-550 font-bold">Total Sales Marketing Channels</span>
              <h3 className="text-lg font-sans font-bold text-slate-800">{campaigns.length} Campaigns</h3>
              <p className="text-2xs text-slate-450 font-mono">Driving direct reservations</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-3xs font-mono uppercase text-slate-400 font-bold">Average Campaign ROI</span>
              <h3 className="text-lg font-sans font-bold text-slate-800">
                {Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length)}% ROI
              </h3>
              <p className="text-2xs text-emerald-600 font-mono flex items-center gap-1">
                <TrendingUp size={10} /> Expanding social networks channels
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-3xs font-mono uppercase text-slate-400 font-bold font-bold">Total Budget Dispatched</span>
              <h3 className="text-lg font-sans font-bold text-slate-800">
                ${campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
              </h3>
              <p className="text-2xs text-slate-450 font-mono">Q2 marketing allocation</p>
            </div>
          </div>

          <div className="bg-white border border-slate-105 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-b-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-sans font-semibold text-slate-800">Active Ad Channels & Funnels</h3>
                <p className="text-xs text-slate-400 font-sans">Compare leads and direct check-ins per social outreach medium.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => (
                <div key={camp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between hover:ring-1 hover:ring-indigo-200 transition">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-850">{camp.name}</span>
                      <span className="px-1.5 py-0.2 font-mono text-3xs font-bold rounded-full bg-indigo-100 text-indigo-805">
                        {camp.status}
                      </span>
                    </div>
                    <div className="text-3xs font-mono text-slate-405 uppercase">Medium: {camp.channel}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 font-mono text-xs">
                    <div>
                      <div className="text-3xs uppercase text-slate-400 leading-none">Gross Budget</div>
                      <span className="font-bold text-slate-850">${camp.budget}</span>
                    </div>
                    <div>
                      <div className="text-3xs uppercase text-slate-400 leading-none">Qualified Leads</div>
                      <span className="font-bold text-slate-850">{camp.leadsCount}</span>
                    </div>
                    <div>
                      <div className="text-3xs text-indigo-600 font-bold uppercase leading-none">Conversions</div>
                      <span className="font-bold text-indigo-650">{camp.conversionsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-t-slate-150 pt-2 text-3xs font-mono">
                    <span className="text-slate-500">Sales ROI Index: <strong className="text-emerald-600">{camp.roi}%</strong></span>
                    <span className="text-slate-400 italic">Sync: Live CRM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC PROMOTIONS PACKAGES BUILDER */}
      {panelSection === 'promotions' && (
        <div className="space-y-6 animate-fade-in" id="promotions-tab">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-b-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-850">Direct Sales Dynamic Promotions Builder</h3>
              <p className="text-xs text-slate-450 font-sans">Assemble seasonal incentives and code rules to expand direct bookings.</p>
            </div>
            
            <button
              onClick={() => setShowAddPromo(true)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-white font-mono rounded-lg text-xs hover:bg-slate-850 transition flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Build Promotion Code
            </button>
          </div>

          {promoSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-lg font-mono">
              {promoSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map(promo => (
              <div key={promo.id} className="p-4 bg-white border border-slate-205 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-350 transition relative overflow-hidden" id={`promo-card-${promo.code}`}>
                {/* Decorative cut */}
                <span className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-slate-100/30 border border-slate-200"></span>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="px-2 py-0.5 border border-dashed border-rose-405 text-rose-700 bg-rose-50 font-mono text-xs tracking-wider rounded-md font-bold uppercase shadow-2xs">
                      {promo.code}
                    </strong>
                    <span className={`px-1.5 py-0.2 font-mono text-3xs font-bold rounded ${
                      promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {promo.active ? 'ACTIVE' : 'EXPIRED'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-850 font-sans">{promo.name}</h4>
                  <p className="text-3xs text-slate-400 font-mono">Category coverage: {promo.appliesTo.join(', ')}</p>
                </div>

                <div className="flex items-center justify-between border-t border-t-slate-150 pt-2 text-2xs font-mono">
                  <span className="text-slate-500 font-bold text-rose-600">{promo.discountPercent}% OFF TARIFF</span>
                  <span className="text-slate-400">Exp: {promo.validTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORPORATE PARTNERS CONTRACT ACCOUNT AGREEMENTS */}
      {panelSection === 'corporate' && (
        <div className="space-y-6 animate-fade-in" id="corporate-tab">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-b-slate-105 pb-3 bg-white">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-850">Corporate Account Agreements</h3>
              <p className="text-xs text-slate-400 font-sans">Review contracted companies, registered balance sheets and discount indexes.</p>
            </div>
            
            <button
              onClick={() => setShowAddCorp(true)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-white font-mono rounded-lg text-xs hover:bg-slate-850 transition flex items-center justify-center gap-1.5 animate-pulse"
            >
              <Plus size={14} /> Establish Corporate Account
            </button>
          </div>

          {corpSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-805 font-mono text-xs rounded-lg">
              {corpSuccess}
            </div>
          )}

          <div className="overflow-x-auto border border-slate-155 rounded-xl bg-white shadow-3xs">
            <table className="w-full text-left text-xs text-slate-600 border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-b-slate-100 font-mono text-slate-400 text-3xs uppercase">
                  <th className="py-2.5 px-4">Corporate company Name</th>
                  <th className="py-2.5 px-4">Contact info</th>
                  <th className="py-2.5 px-4 text-center">Discount Index</th>
                  <th className="py-2.5 px-4 text-center">Active Blockings</th>
                  <th className="py-2.5 px-4 text-right">Unpaid Balance Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {corporateAccounts.map(corp => (
                  <tr key={corp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {corp.companyName}
                      <span className="block font-mono text-3xs text-slate-400">Account: {corp.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{corp.contactPerson}</div>
                      <div className="text-2xs font-mono text-slate-400">{corp.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                      {corp.discountPercent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                      {corp.activeBookings}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                      ${corp.unpaidBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW PROMO DIALOG */}
      {showAddPromo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-b-slate-100 pb-2">
              <h3 className="font-sans font-semibold text-sm text-slate-850">Assemble Seasonal Promotion</h3>
              <button 
                onClick={() => setShowAddPromo(false)}
                className="p-1 hover:bg-slate-55 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Promo Code</label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="SUMMER26 or VIPREST"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Promotion Title</label>
                <input
                  type="text"
                  required
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  placeholder="Summer direct wellness discount"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Discount Rate (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    required
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Applies to Type</label>
                  <select
                    onChange={(e) => setPromoCats([e.target.value as RoomType])}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none"
                  >
                    <option value="Double">Double Rooms</option>
                    <option value="Single">Single Rooms</option>
                    <option value="Suite">Suite Luxury</option>
                    <option value="Penthouse">Penthouses</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 border border-slate-800 text-white font-sans font-semibold rounded-lg text-xs hover:bg-slate-850 transition"
              >
                Onboard promotion
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW CORPORATE PARTNER AGREEMENT */}
      {showAddCorp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-b-slate-105 pb-2">
              <h3 className="font-sans font-semibold text-sm text-slate-850">Establish Corporate Agreement</h3>
              <button 
                onClick={() => setShowAddCorp(false)}
                className="p-1 hover:bg-slate-55 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCorp} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={corpName}
                  onChange={(e) => setCorpName(e.target.value)}
                  placeholder="Tesla Motors, Apple Inc."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Primary Account rep Name</label>
                <input
                  type="text"
                  required
                  value={corpContact}
                  onChange={(e) => setCorpContact(e.target.value)}
                  placeholder="Steve Jobs"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Representative Email Address</label>
                <input
                  type="email"
                  required
                  value={corpEmail}
                  onChange={(e) => setCorpEmail(e.target.value)}
                  placeholder="s.jobs@apple.com"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Contracted Discount Rate (%)</label>
                <input
                  type="number"
                  min="5"
                  max="35"
                  required
                  value={corpDiscount}
                  onChange={(e) => setCorpDiscount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 border border-slate-800 text-white font-sans font-semibold rounded-lg text-xs hover:bg-slate-850 transition"
              >
                Establish contracted agreement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
