/**
 * Pricing and Revenue Management Module for Executive Portal
 * Manages yield pricing, rate plans, sales, and campaigns
 * Front desk has view-only access, executives have full management capabilities
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  TrendingUp,
  Tag,
  Briefcase,
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Percent,
  Users,
  BarChart3,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'yield' | 'rateplans' | 'seasons' | 'packages' | 'guest_services' | 'sales' | 'campaigns';

export default function PricingRevenueManagement() {
  const {
    userProfile,
    yieldPolicies,
    addYieldPolicy,
    updateYieldPolicy,
    deleteYieldPolicy,
    ratePlans,
    addRatePlan,
    updateRatePlan,
    deleteRatePlan,
    seasons,
    addSeason,
    updateSeason,
    deleteSeason,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    guestServices,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    corporateAccounts,
    addCorporateAccount,
    updateCorporateAccount,
    deleteCorporateAccount,
    formatAmount
  } = useERP();

  const [activeTab, setActiveTab] = useState<TabType>('yield');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'yield' | 'rateplan' | 'season' | 'package' | 'guest_service' | 'promotion' | 'campaign' | 'corporate'>('yield');

  // Since this is the ExecutivePortal, only executives have access (enforced in App.tsx)
  // All users in this module have management access
  const canManage = true;

  // Yield Pricing Modal State
  const [yieldPolicy, setYieldPolicy] = useState({
    name: '',
    description: '',
    multiplier: 1.2,
    isDefault: false
  });

  // Rate Plan Modal State
  const [ratePlan, setRatePlan] = useState({
    name: '',
    description: '',
    baseModifier: 1.0,
    minStay: 1,
    maxStay: 30,
    cancellationPolicy: '24h',
    applicableRoomTypes: [] as string[]
  });

  // Season Modal State
  const [season, setSeason] = useState({
    name: '',
    startMonth: 0,
    startDay: 1,
    endMonth: 11,
    endDay: 31,
    multiplier: 1.0
  });

  // Package Modal State
  const [packageItem, setPackageItem] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'special_occasion',
    applicableRoomTypes: [] as string[],
    amenities: [] as string[]
  });

  // Guest Service Modal State
  const [guestService, setGuestService] = useState({
    name: '',
    description: '',
    category: 'dining',
    price: 0,
    available: true
  });

  // Promotion Modal State
  const [promotion, setPromotion] = useState({
    code: '',
    name: '',
    discountPercent: 10,
    validFrom: '',
    validTo: '',
    appliesTo: [] as string[],
    active: true
  });

  // Campaign Modal State
  const [campaign, setCampaign] = useState({
    name: '',
    channel: '',
    budget: 0,
    leadsCount: 0,
    conversionsCount: 0,
    roi: 0,
    status: 'Active' as 'Prospecting' | 'Active' | 'Completed' | 'Paused'
  });

  // Corporate Account Modal State
  const [corporateAccount, setCorporateAccount] = useState({
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    discountPercent: 10,
    creditLimit: 0
  });

  const tabs = [
    { id: 'yield' as TabType, label: 'Yield Pricing', icon: <TrendingUp size={16} /> },
    { id: 'rateplans' as TabType, label: 'Rate Plans', icon: <DollarSign size={16} /> },
    { id: 'seasons' as TabType, label: 'Seasonal Rates', icon: <Calendar size={16} /> },
    { id: 'packages' as TabType, label: 'Packages', icon: <Gift size={16} /> },
    { id: 'guest_services' as TabType, label: 'Guest Services', icon: <Users size={16} /> },
    { id: 'sales' as TabType, label: 'Sales & Corporate', icon: <Briefcase size={16} /> },
    { id: 'campaigns' as TabType, label: 'Campaigns', icon: <Megaphone size={16} /> },
  ];

  const handleOpenModal = (type: 'yield' | 'rateplan' | 'season' | 'package' | 'guest_service' | 'promotion' | 'campaign' | 'corporate', item?: any) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      switch (type) {
        case 'yield':
          setYieldPolicy(item);
          break;
        case 'rateplan':
          setRatePlan(item);
          break;
        case 'season':
          setSeason(item);
          break;
        case 'package':
          setPackageItem(item);
          break;
        case 'guest_service':
          setGuestService(item);
          break;
        case 'promotion':
          setPromotion(item);
          break;
        case 'campaign':
          setCampaign(item);
          break;
        case 'corporate':
          setCorporateAccount(item);
          break;
      }
    } else {
      setEditingItem(null);
      switch (type) {
        case 'yield':
          setYieldPolicy({ name: '', description: '', multiplier: 1.2, isDefault: false });
          break;
        case 'rateplan':
          setRatePlan({ name: '', description: '', baseModifier: 1.0, minStay: 1, maxStay: 30, cancellationPolicy: '24h', applicableRoomTypes: [] });
          break;
        case 'season':
          setSeason({ name: '', startMonth: 0, startDay: 1, endMonth: 11, endDay: 31, multiplier: 1.0 });
          break;
        case 'package':
          setPackageItem({ name: '', description: '', price: 0, type: 'special_occasion', applicableRoomTypes: [], amenities: [] });
          break;
        case 'guest_service':
          setGuestService({ name: '', description: '', category: 'dining', price: 0, available: true });
          break;
        case 'promotion':
          setPromotion({ code: '', name: '', discountPercent: 10, validFrom: '', validTo: '', appliesTo: [], active: true });
          break;
        case 'campaign':
          setCampaign({ name: '', channel: '', budget: 0, leadsCount: 0, conversionsCount: 0, roi: 0, status: 'Active' });
          break;
        case 'corporate':
          setCorporateAccount({ companyName: '', contactPerson: '', contactEmail: '', contactPhone: '', discountPercent: 10, creditLimit: 0 });
          break;
      }
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    switch (modalType) {
      case 'yield':
        if (editingItem) {
          updateYieldPolicy(editingItem.id, yieldPolicy);
        } else {
          addYieldPolicy({ ...yieldPolicy, active: true });
        }
        break;
      case 'rateplan':
        if (editingItem) {
          updateRatePlan(editingItem.id, ratePlan);
        } else {
          addRatePlan({ ...ratePlan, active: true });
        }
        break;
      case 'season':
        if (editingItem) {
          updateSeason(editingItem.id, season);
        } else {
          addSeason(season);
        }
        break;
      case 'package':
        if (editingItem) {
          updatePackage(editingItem.id, packageItem);
        } else {
          addPackage(packageItem);
        }
        break;
      case 'guest_service':
        if (editingItem) {
          updateGuestService(editingItem.id, guestService);
        } else {
          addGuestService(guestService);
        }
        break;
      case 'promotion':
        if (editingItem) {
          updatePromotion(editingItem.id, promotion);
        } else {
          addPromotion(promotion);
        }
        break;
      case 'campaign':
        if (editingItem) {
          updateCampaign(editingItem.id, campaign);
        } else {
          addCampaign(campaign);
        }
        break;
      case 'corporate':
        if (editingItem) {
          updateCorporateAccount(editingItem.id, corporateAccount);
        } else {
          addCorporateAccount({ ...corporateAccount, activeBookings: 0, unpaidBalance: 0 });
        }
        break;
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    switch (type) {
      case 'yield':
        deleteYieldPolicy(id);
        break;
      case 'rateplan':
        deleteRatePlan(id);
        break;
      case 'season':
        deleteSeason(id);
        break;
      case 'package':
        deletePackage(id);
        break;
      case 'guest_service':
        deleteGuestService(id);
        break;
      case 'promotion':
        deletePromotion(id);
        break;
      case 'campaign':
        deleteCampaign(id);
        break;
      case 'corporate':
        deleteCorporateAccount(id);
        break;
    }
  };

  const renderYieldPricing = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Yield Pricing Policies</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('yield')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Policy
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {yieldPolicies.map(policy => (
          <div key={policy.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{policy.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('yield', policy)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(policy.id, 'yield')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{policy.description}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Multiplier: {policy.multiplier}x</span>
              {policy.isDefault && (
                <span className="text-indigo-600 font-bold">Default</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRatePlans = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rate Plans</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('rateplan')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Rate Plan
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ratePlans.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{plan.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('rateplan', plan)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(plan.id, 'rateplan')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{plan.description}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Base: {plan.baseModifier}x</span>
              <span className="text-indigo-600 font-bold">{formatAmount(plan.baseRate || 100)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Min Stay: {plan.minStay} nights</span>
              <span className="text-slate-500">Max: {plan.maxStay} nights</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${plan.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {plan.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSeasons = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Seasonal Yield Rules</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('season')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Season
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {seasons.map(season => (
          <div key={season.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{season.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('season', season)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(season.id, 'season')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Calendar size={10} />
              <span>Valid: {season.startMonth+1}/{season.startDay} - {season.endMonth+1}/{season.endDay}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Multiplier: {season.multiplier}x</span>
              <span className={`font-bold ${season.multiplier > 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {season.multiplier > 1 ? '+' : ''}{Math.round((season.multiplier - 1) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bundled Experience Packages</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('package')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Package
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('package', pkg)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(pkg.id, 'package')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{pkg.description}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Type: {pkg.type}</span>
              <span className="text-indigo-600 font-bold">{formatAmount(pkg.price)}</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${pkg.applicableRoomTypes && pkg.applicableRoomTypes.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {pkg.applicableRoomTypes && pkg.applicableRoomTypes.length > 0 ? `${pkg.applicableRoomTypes.length} room types` : 'All rooms'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuestServices = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Guest Services</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('guest_service')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Service
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {guestServices.map(service => (
          <div key={service.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{service.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('guest_service', service)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(service.id, 'guest_service')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{service.description}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 capitalize">{service.category.replace('_', ' ')}</span>
              <span className="text-indigo-600 font-bold">{formatAmount(service.price)}</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${service.available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {service.available ? 'Available' : 'Unavailable'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSalesCorporate = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sales & Corporate Accounts</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('corporate')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Corporate Account
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {corporateAccounts.map(account => (
          <div key={account.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{account.companyName}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('corporate', account)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(account.id, 'corporate')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Contact: {account.contactPerson}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Discount: {account.discountPercent}%</span>
              <span className="text-indigo-600 font-bold">{account.activeBookings} bookings</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${account.unpaidBalance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {account.unpaidBalance > 0 ? `Due: ${formatAmount(account.unpaidBalance)}` : 'Paid'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Marketing Campaigns</h3>
        {canManage && (
          <button onClick={() => handleOpenModal('campaign')} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
            <Plus size={12} /> Add Campaign
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{campaign.name}</h4>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('campaign', campaign)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Edit size={12} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(campaign.id, 'campaign')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <Trash2 size={12} className="text-rose-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{campaign.description}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Budget: {formatAmount(campaign.budget)}</span>
              <span className="text-indigo-600 font-bold">{campaign.status}</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {campaign.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          
          {modalType === 'yield' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Policy Name</label>
                <input type="text" value={yieldPolicy.name} onChange={e => setYieldPolicy({...yieldPolicy, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea value={yieldPolicy.description} onChange={e => setYieldPolicy({...yieldPolicy, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Multiplier</label>
                  <input type="number" step="0.1" value={yieldPolicy.multiplier} onChange={e => setYieldPolicy({...yieldPolicy, multiplier: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Policy</label>
                  <select value={yieldPolicy.isDefault ? 'true' : 'false'} onChange={e => setYieldPolicy({...yieldPolicy, isDefault: e.target.value === 'true'})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalType === 'rateplan' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Plan Name</label>
                <input type="text" value={ratePlan.name} onChange={e => setRatePlan({...ratePlan, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea value={ratePlan.description} onChange={e => setRatePlan({...ratePlan, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Modifier</label>
                  <input type="number" step="0.1" value={ratePlan.baseModifier} onChange={e => setRatePlan({...ratePlan, baseModifier: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Min Stay (nights)</label>
                  <input type="number" value={ratePlan.minStay} onChange={e => setRatePlan({...ratePlan, minStay: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
            </div>
          )}

          {modalType === 'season' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Season Name</label>
                <input type="text" value={season.name} onChange={e => setSeason({...season, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Summer Season" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Month</label>
                  <select value={season.startMonth} onChange={e => setSeason({...season, startMonth: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value={0}>January</option>
                    <option value={1}>February</option>
                    <option value={2}>March</option>
                    <option value={3}>April</option>
                    <option value={4}>May</option>
                    <option value={5}>June</option>
                    <option value={6}>July</option>
                    <option value={7}>August</option>
                    <option value={8}>September</option>
                    <option value={9}>October</option>
                    <option value={10}>November</option>
                    <option value={11}>December</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Day</label>
                  <input type="number" min="1" max="31" value={season.startDay} onChange={e => setSeason({...season, startDay: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Month</label>
                  <select value={season.endMonth} onChange={e => setSeason({...season, endMonth: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value={0}>January</option>
                    <option value={1}>February</option>
                    <option value={2}>March</option>
                    <option value={3}>April</option>
                    <option value={4}>May</option>
                    <option value={5}>June</option>
                    <option value={6}>July</option>
                    <option value={7}>August</option>
                    <option value={8}>September</option>
                    <option value={9}>October</option>
                    <option value={10}>November</option>
                    <option value={11}>December</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Day</label>
                  <input type="number" min="1" max="31" value={season.endDay} onChange={e => setSeason({...season, endDay: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Multiplier</label>
                <input type="number" step="0.1" value={season.multiplier} onChange={e => setSeason({...season, multiplier: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="1.2" />
              </div>
            </div>
          )}

          {modalType === 'package' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Package Name</label>
                <input type="text" value={packageItem.name} onChange={e => setPackageItem({...packageItem, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Birthday Package, Honeymoon Package, Geralta Mountain Hiking" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea value={packageItem.description} onChange={e => setPackageItem({...packageItem, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Complete bundled experience description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price</label>
                  <input type="number" value={packageItem.price} onChange={e => setPackageItem({...packageItem, price: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="299" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                  <select value={packageItem.type} onChange={e => setPackageItem({...packageItem, type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value="special_occasion">Special Occasion</option>
                    <option value="adventure">Adventure Package</option>
                    <option value="romance">Romantic Getaway</option>
                    <option value="wellness">Wellness Package</option>
                    <option value="business">Business Package</option>
                    <option value="family">Family Package</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Applicable Room Types (comma-separated)</label>
                <input type="text" value={packageItem.applicableRoomTypes.join(', ')} onChange={e => setPackageItem({...packageItem, applicableRoomTypes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Suite, Deluxe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Included Amenities (comma-separated)</label>
                <input type="text" value={packageItem.amenities.join(', ')} onChange={e => setPackageItem({...packageItem, amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Champagne, Chocolates, Late Checkout, Spa Treatment" />
              </div>
            </div>
          )}

          {modalType === 'guest_service' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Service Name</label>
                <input type="text" value={guestService.name} onChange={e => setGuestService({...guestService, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Lunch, Dinner, Airport Shuttle" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea value={guestService.description} onChange={e => setGuestService({...guestService, description: e.target.value})} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="Individual guest service description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select value={guestService.category} onChange={e => setGuestService({...guestService, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value="dining">Dining (Lunch, Dinner)</option>
                    <option value="transportation">Transportation (Airport Shuttle)</option>
                    <option value="laundry">Laundry Service</option>
                    <option value="spa">Spa & Wellness</option>
                    <option value="room_service">Room Service</option>
                    <option value="concierge">Concierge</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price</label>
                  <input type="number" value={guestService.price} onChange={e => setGuestService({...guestService, price: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" placeholder="25" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Availability</label>
                <select value={guestService.available ? 'true' : 'false'} onChange={e => setGuestService({...guestService, available: e.target.value === 'true'})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>
          )}

          {modalType === 'promotion' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Promo Code</label>
                  <input type="text" value={promotion.code} onChange={e => setPromotion({...promotion, code: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount %</label>
                  <input type="number" value={promotion.discountPercent} onChange={e => setPromotion({...promotion, discountPercent: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input type="text" value={promotion.name} onChange={e => setPromotion({...promotion, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid From</label>
                  <input type="date" value={promotion.validFrom} onChange={e => setPromotion({...promotion, validFrom: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid To</label>
                  <input type="date" value={promotion.validTo} onChange={e => setPromotion({...promotion, validTo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
            </div>
          )}

          {modalType === 'campaign' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Name</label>
                <input type="text" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Channel</label>
                <input type="text" value={campaign.channel} onChange={e => setCampaign({...campaign, channel: e.target.value})} placeholder="e.g., Social Media, Email, OTA" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Budget</label>
                  <input type="number" value={campaign.budget} onChange={e => setCampaign({...campaign, budget: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select value={campaign.status} onChange={e => setCampaign({...campaign, status: e.target.value as 'Prospecting' | 'Active' | 'Completed' | 'Paused'})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                    <option value="Prospecting">Prospecting</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalType === 'corporate' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                <input type="text" value={corporateAccount.companyName} onChange={e => setCorporateAccount({...corporateAccount, companyName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
                <input type="text" value={corporateAccount.contactPerson} onChange={e => setCorporateAccount({...corporateAccount, contactPerson: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
                  <input type="email" value={corporateAccount.contactEmail} onChange={e => setCorporateAccount({...corporateAccount, contactEmail: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount %</label>
                  <input type="number" value={corporateAccount.discountPercent} onChange={e => setCorporateAccount({...corporateAccount, discountPercent: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'yield' && (
              <motion.div key="yield" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderYieldPricing()}
              </motion.div>
            )}
            {activeTab === 'rateplans' && (
              <motion.div key="rateplans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderRatePlans()}
              </motion.div>
            )}
            {activeTab === 'seasons' && (
              <motion.div key="seasons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderSeasons()}
              </motion.div>
            )}
            {activeTab === 'packages' && (
              <motion.div key="packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderPackages()}
              </motion.div>
            )}
            {activeTab === 'guest_services' && (
              <motion.div key="guest_services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderGuestServices()}
              </motion.div>
            )}
            {activeTab === 'sales' && (
              <motion.div key="sales" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderSalesCorporate()}
              </motion.div>
            )}
            {activeTab === 'campaigns' && (
              <motion.div key="campaigns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {renderCampaigns()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {renderModal()}
    </div>
  );
}
