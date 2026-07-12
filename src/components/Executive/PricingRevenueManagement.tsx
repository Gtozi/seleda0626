/**
 * Pricing and Revenue Management Module for Executive Portal
 * Manages yield pricing, rate plans, sales, and campaigns
 * Front desk has view-only access, executives have full management capabilities
 */

import React, { useState, useEffect } from 'react';
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
  Gift,
  RefreshCw,
  Info,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'yield' | 'rateplans' | 'seasons' | 'packages' | 'guest_services' | 'sales' | 'campaigns';

export default function PricingRevenueManagement({ readOnly = false }: { readOnly?: boolean }) {
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
  const [modalType, setModalType] = useState<'yield' | 'rateplan' | 'season' | 'package' | 'guest_service' | 'promotion' | 'campaign' | 'corporate' | 'contract'>('yield');

  // B2B Contract state
  const [contracts, setContracts] = useState<any[]>([]);
  const [tourOperators, setTourOperators] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [contractForm, setContractForm] = useState({
    operator_id: '',
    room_type_id: '',
    board_basis: 'BB',
    rate_model: 'net',
    net_rate: 0,
    sell_rate: 0,
    commission_pct: 10,
    valid_from: '',
    valid_to: '',
    is_active: true
  });
  const [savingContract, setSavingContract] = useState(false);

  // Tour Operator form state
  const [showOperatorForm, setShowOperatorForm] = useState(false);
  const [operatorForm, setOperatorForm] = useState({
    code: '',
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    payment_terms: 'Net 30',
    commission_model: 'net',
    credit_limit: 0,
    is_active: true
  });
  const [savingOperator, setSavingOperator] = useState(false);

  // Allotment form state
  const [allotments, setAllotments] = useState<any[]>([]);
  const [showAllotmentForm, setShowAllotmentForm] = useState(false);
  const [allotmentForm, setAllotmentForm] = useState({
    operator_id: '',
    room_type_id: '',
    stay_date: '',
    blocked_qty: 1,
    release_date: ''
  });
  const [savingAllotment, setSavingAllotment] = useState(false);

  // Voucher form state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    voucher_no: '',
    operator_id: '',
    room_type_id: '',
    valid_from: '',
    valid_to: '',
    nights: 0,
    board_basis: 'BB',
    pax_count: 1,
    net_value: 0
  });
  const [savingVoucher, setSavingVoucher] = useState(false);

  // Executive portal users can manage; Front Desk usage is view-only
  const canManage = !readOnly;

  // Load B2B contract data
  useEffect(() => {
    const loadContracts = async () => {
      try {
        const res = await fetch('/api/b2b/contracts');
        if (res.ok) setContracts(await res.json());
      } catch (e) {
        console.error('Failed to load contracts:', e);
      }
    };
    loadContracts();
  }, []);

  useEffect(() => {
    const loadTourOperators = async () => {
      try {
        const res = await fetch('/api/b2b/operators');
        if (res.ok) setTourOperators(await res.json());
      } catch (e) {
        console.error('Failed to load tour operators:', e);
      }
    };
    loadTourOperators();
  }, []);

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const res = await fetch('/api/room-types');
        if (res.ok) setRoomTypes(await res.json());
      } catch (e) {
        console.error('Failed to load room types:', e);
      }
    };
    loadRoomTypes();
  }, []);

  useEffect(() => {
    const loadAllotments = async () => {
      try {
        const res = await fetch('/api/b2b/allotments');
        if (res.ok) setAllotments(await res.json());
      } catch (e) {
        console.error('Failed to load allotments:', e);
      }
    };
    loadAllotments();
  }, []);

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const res = await fetch('/api/b2b/vouchers');
        if (res.ok) setVouchers(await res.json());
      } catch (e) {
        console.error('Failed to load vouchers:', e);
      }
    };
    loadVouchers();
  }, []);

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
    { id: 'sales' as TabType, label: 'Sales & B2B', icon: <Briefcase size={16} /> },
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

  const handleSave = async () => {
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

  const handleDelete = async (id: string, type: string) => {
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
      {/* Tour Operators Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tour Operators ({tourOperators.length})</h3>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => setShowOperatorForm(!showOperatorForm)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
              <Plus size={12} /> {showOperatorForm ? 'Cancel' : 'Add Operator'}
            </button>
            <button onClick={() => window.location.hash = '#executive-b2b'} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-300">
              <Tag size={12} /> Full Portal
            </button>
          </div>
        )}
      </div>

      {showOperatorForm && (
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Operator Code *</label>
              <input type="text" value={operatorForm.code} onChange={e => setOperatorForm({...operatorForm, code: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Operator Name *</label>
              <input type="text" value={operatorForm.name} onChange={e => setOperatorForm({...operatorForm, name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Contact Name</label>
              <input type="text" value={operatorForm.contact_name} onChange={e => setOperatorForm({...operatorForm, contact_name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Contact Email</label>
              <input type="email" value={operatorForm.contact_email} onChange={e => setOperatorForm({...operatorForm, contact_email: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Contact Phone</label>
              <input type="tel" value={operatorForm.contact_phone} onChange={e => setOperatorForm({...operatorForm, contact_phone: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Payment Terms</label>
              <select value={operatorForm.payment_terms} onChange={e => setOperatorForm({...operatorForm, payment_terms: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 7">Net 7</option>
                <option value="COD">COD</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Commission Model</label>
              <select value={operatorForm.commission_model} onChange={e => setOperatorForm({...operatorForm, commission_model: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                <option value="net">Net Rate</option>
                <option value="commissionable">Commissionable</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Credit Limit</label>
              <input type="number" value={operatorForm.credit_limit} onChange={e => setOperatorForm({...operatorForm, credit_limit: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={operatorForm.is_active} onChange={e => setOperatorForm({...operatorForm, is_active: e.target.checked})} className="accent-indigo-600" />
            <label className="text-xs text-slate-600">Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowOperatorForm(false)} className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold">Cancel</button>
            <button onClick={async () => {
              setSavingOperator(true);
              try {
                await fetch('/api/b2b/operators', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(operatorForm)
                });
                const res = await fetch('/api/b2b/operators');
                if (res.ok) setTourOperators(await res.json());
                setShowOperatorForm(false);
                setOperatorForm({
                  code: '',
                  name: '',
                  contact_name: '',
                  contact_email: '',
                  contact_phone: '',
                  payment_terms: 'Net 30',
                  commission_model: 'net',
                  credit_limit: 0,
                  is_active: true
                });
              } catch (e) {
                console.error('Failed to save operator:', e);
              } finally {
                setSavingOperator(false);
              }
            }} disabled={savingOperator || !operatorForm.code || !operatorForm.name} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
              {savingOperator ? 'Saving...' : 'Save Operator'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/30">
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Code</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Name</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Contact</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Payment Terms</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Commission</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Credit Limit</th>
              <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {tourOperators.map(op => (
              <tr key={op.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{op.code}</td>
                <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{op.name}</td>
                <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{op.contact_name || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{op.payment_terms}</td>
                <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{op.commission_model}</td>
                <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{formatAmount(op.credit_limit)}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${op.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {op.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {tourOperators.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-slate-400 text-xs">No operators found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rate Contracts Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Allotments ({allotments.length})</h3>
          {canManage && (
            <button onClick={() => setShowAllotmentForm(!showAllotmentForm)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
              <Plus size={12} /> {showAllotmentForm ? 'Cancel' : 'Block Allotment'}
            </button>
          )}
        </div>

        {showAllotmentForm && (
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Tour Operator *</label>
                <select value={allotmentForm.operator_id} onChange={e => setAllotmentForm({...allotmentForm, operator_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select operator</option>
                  {tourOperators.map(op => <option key={op.id} value={op.id}>{op.name} ({op.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Room Type *</label>
                <select value={allotmentForm.room_type_id} onChange={e => setAllotmentForm({...allotmentForm, room_type_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select room type</option>
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Stay Date *</label>
                <input type="date" value={allotmentForm.stay_date} onChange={e => setAllotmentForm({...allotmentForm, stay_date: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Blocked Qty *</label>
                <input type="number" min={1} value={allotmentForm.blocked_qty} onChange={e => setAllotmentForm({...allotmentForm, blocked_qty: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Release Date *</label>
                <input type="date" value={allotmentForm.release_date} onChange={e => setAllotmentForm({...allotmentForm, release_date: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAllotmentForm(false)} className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold">Cancel</button>
              <button onClick={async () => {
                setSavingAllotment(true);
                try {
                  await fetch('/api/b2b/allotments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(allotmentForm)
                  });
                  const res = await fetch('/api/b2b/allotments');
                  if (res.ok) setAllotments(await res.json());
                  setShowAllotmentForm(false);
                  setAllotmentForm({
                    operator_id: '',
                    room_type_id: '',
                    stay_date: '',
                    blocked_qty: 1,
                    release_date: ''
                  });
                } catch (e) {
                  console.error('Failed to save allotment:', e);
                } finally {
                  setSavingAllotment(false);
                }
              }} disabled={savingAllotment || !allotmentForm.operator_id || !allotmentForm.room_type_id || !allotmentForm.stay_date || !allotmentForm.release_date} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                {savingAllotment ? 'Saving...' : 'Block Allotment'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30">
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Operator</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Room Type</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Stay Date</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Blocked</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Picked Up</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Available</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Release Date</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {allotments.map(allotment => {
                const available = allotment.blocked_qty - allotment.picked_up_qty;
                const released = allotment.is_released || new Date(allotment.release_date) < new Date();
                return (
                  <tr key={allotment.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{allotment.tour_operators?.name || allotment.operator_id}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{allotment.room_types?.name || allotment.room_type_id}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300">{allotment.stay_date}</td>
                    <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{allotment.blocked_qty}</td>
                    <td className="px-3 py-2 text-xs font-bold text-indigo-600">{allotment.picked_up_qty}</td>
                    <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{available}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{allotment.release_date}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${released ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                        {released ? 'Released' : 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allotments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-400 text-xs">No allotments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vouchers Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Vouchers ({vouchers.length})</h3>
          {canManage && (
            <button onClick={() => setShowVoucherForm(!showVoucherForm)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
              <Plus size={12} /> {showVoucherForm ? 'Cancel' : 'Issue Voucher'}
            </button>
          )}
        </div>

        {showVoucherForm && (
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Voucher Number *</label>
                <input type="text" value={voucherForm.voucher_no} onChange={e => setVoucherForm({...voucherForm, voucher_no: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Tour Operator *</label>
                <select value={voucherForm.operator_id} onChange={e => setVoucherForm({...voucherForm, operator_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select operator</option>
                  {tourOperators.map(op => <option key={op.id} value={op.id}>{op.name} ({op.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Room Type *</label>
                <select value={voucherForm.room_type_id} onChange={e => setVoucherForm({...voucherForm, room_type_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select room type</option>
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Valid From *</label>
                <input type="date" value={voucherForm.valid_from} onChange={e => setVoucherForm({...voucherForm, valid_from: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Valid To *</label>
                <input type="date" value={voucherForm.valid_to} onChange={e => setVoucherForm({...voucherForm, valid_to: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Nights</label>
                <input type="number" min={0} value={voucherForm.nights} onChange={e => setVoucherForm({...voucherForm, nights: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Board Basis</label>
                <select value={voucherForm.board_basis} onChange={e => setVoucherForm({...voucherForm, board_basis: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="BB">Bed & Breakfast</option>
                  <option value="HB">Half Board</option>
                  <option value="FB">Full Board</option>
                  <option value="AI">All Inclusive</option>
                  <option value="RO">Room Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Pax Count</label>
                <input type="number" min={1} value={voucherForm.pax_count} onChange={e => setVoucherForm({...voucherForm, pax_count: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Net Value</label>
                <input type="number" min={0} value={voucherForm.net_value} onChange={e => setVoucherForm({...voucherForm, net_value: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowVoucherForm(false)} className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold">Cancel</button>
              <button onClick={async () => {
                setSavingVoucher(true);
                try {
                  await fetch('/api/b2b/vouchers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(voucherForm)
                  });
                  const res = await fetch('/api/b2b/vouchers');
                  if (res.ok) setVouchers(await res.json());
                  setShowVoucherForm(false);
                  setVoucherForm({
                    voucher_no: '',
                    operator_id: '',
                    room_type_id: '',
                    valid_from: '',
                    valid_to: '',
                    nights: 0,
                    board_basis: 'BB',
                    pax_count: 1,
                    net_value: 0
                  });
                } catch (e) {
                  console.error('Failed to save voucher:', e);
                } finally {
                  setSavingVoucher(false);
                }
              }} disabled={savingVoucher || !voucherForm.voucher_no || !voucherForm.operator_id || !voucherForm.room_type_id || !voucherForm.valid_from || !voucherForm.valid_to} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                {savingVoucher ? 'Saving...' : 'Issue Voucher'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30">
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Voucher No</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Operator</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Room Type</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Valid From</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Valid To</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Nights</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Pax</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Net Value</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(voucher => (
                <tr key={voucher.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{voucher.voucher_no}</td>
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{voucher.tour_operators?.name || voucher.operator_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{voucher.room_types?.name || voucher.room_type_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{voucher.valid_from}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{voucher.valid_to}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{voucher.nights || '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{voucher.pax_count}</td>
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{formatAmount(voucher.net_value)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      voucher.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                      voucher.status === 'redeemed' ? 'bg-indigo-100 text-indigo-700' :
                      voucher.status === 'void' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-slate-400 text-xs">No vouchers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Contracts Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rate Contracts ({contracts.length})</h3>
          {canManage && (
            <button onClick={() => setShowContractForm(!showContractForm)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
              <Plus size={12} /> {showContractForm ? 'Cancel' : 'Add Contract'}
            </button>
          )}
        </div>

        {showContractForm && (
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Tour Operator *</label>
                <select value={contractForm.operator_id} onChange={e => setContractForm({...contractForm, operator_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select operator</option>
                  {tourOperators.map(op => <option key={op.id} value={op.id}>{op.name} ({op.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Room Type *</label>
                <select value={contractForm.room_type_id} onChange={e => setContractForm({...contractForm, room_type_id: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="">Select room type</option>
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Board Basis</label>
                <select value={contractForm.board_basis} onChange={e => setContractForm({...contractForm, board_basis: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="BB">Bed & Breakfast</option>
                  <option value="HB">Half Board</option>
                  <option value="FB">Full Board</option>
                  <option value="AI">All Inclusive</option>
                  <option value="RO">Room Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Rate Model</label>
                <select value={contractForm.rate_model} onChange={e => setContractForm({...contractForm, rate_model: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                  <option value="net">Net Rate</option>
                  <option value="commissionable">Commissionable</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Net Rate</label>
                <input type="number" value={contractForm.net_rate} onChange={e => setContractForm({...contractForm, net_rate: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Sell Rate</label>
                <input type="number" value={contractForm.sell_rate} onChange={e => setContractForm({...contractForm, sell_rate: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Commission %</label>
                <input type="number" value={contractForm.commission_pct} onChange={e => setContractForm({...contractForm, commission_pct: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Valid From *</label>
                <input type="date" value={contractForm.valid_from} onChange={e => setContractForm({...contractForm, valid_from: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Valid To *</label>
                <input type="date" value={contractForm.valid_to} onChange={e => setContractForm({...contractForm, valid_to: e.target.value})} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={contractForm.is_active} onChange={e => setContractForm({...contractForm, is_active: e.target.checked})} className="accent-indigo-600" />
              <label className="text-xs text-slate-600">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => {
                setShowContractForm(false);
                setEditingContractId(null);
                setContractForm({
                  operator_id: '',
                  room_type_id: '',
                  board_basis: 'BB',
                  rate_model: 'net',
                  net_rate: 0,
                  sell_rate: 0,
                  commission_pct: 10,
                  valid_from: '',
                  valid_to: '',
                  is_active: true
                });
              }} className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold">Cancel</button>
              <button onClick={async () => {
                setSavingContract(true);
                try {
                  const url = editingContractId ? `/api/b2b/contracts/${editingContractId}` : '/api/b2b/contracts';
                  const method = editingContractId ? 'PUT' : 'POST';
                  await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contractForm)
                  });
                  const res = await fetch('/api/b2b/contracts');
                  if (res.ok) setContracts(await res.json());
                  setShowContractForm(false);
                  setEditingContractId(null);
                  setContractForm({
                    operator_id: '',
                    room_type_id: '',
                    board_basis: 'BB',
                    rate_model: 'net',
                    net_rate: 0,
                    sell_rate: 0,
                    commission_pct: 10,
                    valid_from: '',
                    valid_to: '',
                    is_active: true
                  });
                } catch (e) {
                  console.error('Failed to save contract:', e);
                } finally {
                  setSavingContract(false);
                }
              }} disabled={savingContract || !contractForm.operator_id || !contractForm.room_type_id || !contractForm.valid_from || !contractForm.valid_to} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                {savingContract ? 'Saving...' : (editingContractId ? 'Update Contract' : 'Save Contract')}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30">
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Operator</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Room Type</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Board</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Model</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Net Rate</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Sell Rate</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Commission</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Valid From</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Valid To</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Status</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => (
                <tr key={contract.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{contract.tour_operators?.name || contract.operator_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{contract.room_types?.name || contract.room_type_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{contract.board_basis}</td>
                  <td className="px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300">{contract.rate_model}</td>
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{formatAmount(contract.net_rate)}</td>
                  <td className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{formatAmount(contract.sell_rate)}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{contract.commission_pct}%</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{contract.valid_from}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{contract.valid_to}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${contract.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {contract.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {canManage && (
                      <div className="flex gap-1">
                        <button onClick={() => {
                          setEditingContractId(contract.id);
                          setContractForm({
                            operator_id: contract.operator_id,
                            room_type_id: contract.room_type_id,
                            board_basis: contract.board_basis,
                            rate_model: contract.rate_model,
                            net_rate: contract.net_rate,
                            sell_rate: contract.sell_rate,
                            commission_pct: contract.commission_pct,
                            valid_from: contract.valid_from,
                            valid_to: contract.valid_to,
                            is_active: contract.is_active
                          });
                          setShowContractForm(true);
                        }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                          <Edit size={12} className="text-slate-500" />
                        </button>
                        <button onClick={async () => {
                          if (confirm('Are you sure you want to delete this contract?')) {
                            try {
                              await fetch(`/api/b2b/contracts/${contract.id}`, { method: 'DELETE' });
                              const res = await fetch('/api/b2b/contracts');
                              if (res.ok) setContracts(await res.json());
                            } catch (e) {
                              console.error('Failed to delete contract:', e);
                            }
                          }
                        }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                          <Trash2 size={12} className="text-rose-500" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-4 text-center text-slate-400 text-xs">No contracts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-100">Legacy Corporate Accounts</h4>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">Corporate account management has been replaced by the Tour Operators (B2B) system. Use the B2B Portal to manage operator profiles, allotments, and rate contracts.</p>
          </div>
        </div>
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
            <p className="text-[10px] text-slate-500">Channel: {campaign.channel}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Budget: {formatAmount(campaign.budget)}</span>
              <span className="text-indigo-600 font-bold">ROI: {campaign.roi}%</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : campaign.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {campaign.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  
  const renderModal = () => {
    if (readOnly || !showModal) return null;

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
      {readOnly && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Info size={14} />
            <span className="font-bold">View Only Mode</span>
          </div>
          <p className="mt-1 text-[10px]">Pricing, yield, and campaign management is restricted to the Executive portal.</p>
        </div>
      )}
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
