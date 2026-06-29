/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Megaphone, 
  Tag, 
  Briefcase, 
  HelpCircle,
  Gift,
  Users
} from 'lucide-react';

export default function SalesMarketingModule() {
  const { 
    campaigns,
    promotions,
    corporateAccounts,
    guestServices,
    packages,
    userProfile,
    formatAmount
  } = useERP();

  // Check if user has management permissions
  // Front desk roles that should have view-only access
  const frontOfficeRoles = [
    'frontdesk', 'front desk', 'front_desk', 'front-desk', 
    'receptionist', 'agent', 'staff', 'frontoffice', 'front office', 'front_office', 'front-office',
    'front office manager', 'front desk manager', 'frontdesk manager',
    'reception', 'check-in', 'checkin', 'check_in', 'check-in agent',
    'desk agent', 'front desk agent', 'frontdesk agent',
    'front desk staff', 'frontdesk staff', 'front office staff',
    'guest services', 'guest services agent', 'guest services staff'
  ];
  const userRole = userProfile?.role?.toLowerCase() || '';
  const isFrontOffice = frontOfficeRoles.some(role => userRole.includes(role));
  const canManage = !isFrontOffice;

  // Screen layout toggles
  const [panelSection, setPanelSection] = useState<'campaigns' | 'promotions' | 'corporate' | 'guest_services' | 'packages'>('campaigns');

  return (
    <div className="space-y-6" id="sales-marketing">
      
      {!canManage && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <HelpCircle size={14} />
            <span className="font-bold">View Only Mode</span>
          </div>
          <p className="mt-1 text-[10px]">You are in view-only mode. Contact an executive for management access to pricing, campaigns, and promotions.</p>
        </div>
      )}

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
        <button
          onClick={() => setPanelSection('guest_services')}
          className={`px-4 py-2 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition ${panelSection === 'guest_services' ? 'border-b-indigo-600 text-indigo-700 font-bold bg-indigo-50/40' : 'border-b-transparent'}`}
        >
          <Users size={14} /> Guest Services
        </button>
        <button
          onClick={() => setPanelSection('packages')}
          className={`px-4 py-2 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition ${panelSection === 'packages' ? 'border-b-indigo-600 text-indigo-700 font-bold bg-indigo-50/40' : 'border-b-transparent'}`}
        >
          <Gift size={14} /> Bundled Packages
        </button>
      </div>

      {/* CAMPAIGN METRICS PANEL */}
      {panelSection === 'campaigns' && (
        <div className="space-y-4 animate-fade-in" id="campaigns-tab">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Marketing Campaigns</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map(camp => (
              <div key={camp.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{camp.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    camp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    camp.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    camp.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Channel: {camp.channel}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Budget: ${camp.budget}</span>
                  <span className="text-indigo-600 font-bold">{camp.roi}% ROI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DYNAMIC PROMOTIONS PACKAGES BUILDER */}
      {panelSection === 'promotions' && (
        <div className="space-y-4 animate-fade-in" id="promotions-tab">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Promotions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{promo.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    promo.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Code: {promo.code}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Discount: {promo.discountPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORPORATE PARTNERS CONTRACT ACCOUNT AGREEMENTS */}
      {panelSection === 'corporate' && (
        <div className="space-y-4 animate-fade-in" id="corporate-tab">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Corporate Accounts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {corporateAccounts.map(account => (
              <div key={account.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{account.companyName}</h4>
                </div>
                <p className="text-[10px] text-slate-500">Contact: {account.contactPerson}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Discount: {account.discountPercent}%</span>
                  <span className="text-indigo-600 font-bold">{account.activeBookings} bookings</span>
                </div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${account.unpaidBalance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {account.unpaidBalance > 0 ? `Due: $${account.unpaidBalance}` : 'Paid'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GUEST SERVICES */}
      {panelSection === 'guest_services' && (
        <div className="space-y-4 animate-fade-in" id="guest-services-tab">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Individual Guest Services</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {guestServices.map(service => (
              <div key={service.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{service.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${service.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {service.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{service.description}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 capitalize">{service.category.replace('_', ' ')}</span>
                  <span className="text-indigo-600 font-bold">{formatAmount(service.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUNDLED PACKAGES */}
      {panelSection === 'packages' && (
        <div className="space-y-4 animate-fade-in" id="packages-tab">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bundled Experience Packages</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                </div>
                <p className="text-[10px] text-slate-500">{pkg.description}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Type: {pkg.type}</span>
                  <span className="text-indigo-600 font-bold">{formatAmount(pkg.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
