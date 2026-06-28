/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { RoomType, Reservation } from '../../types/erp';
import UnifiedInvoiceTemplate from '../Shared/UnifiedInvoiceTemplate';
import { getChargeFolio, getChargeType } from '../../utils/folioRouting';
import { 
  Check, 
  X, 
  Coins, 
  CreditCard, 
  Printer, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Search,
  ChevronRight,
  UserPlus,
  Pencil,
  Ban,
  CornerUpRight,
  PlusCircle,
  Sliders,
  Briefcase,
  User,
  Edit3,
  Plus
} from 'lucide-react';
import { calculateFolioComponents } from '../../utils/billing';

export default function CheckInOutModule({
  initialFolioResId,
  onClearFolioResId
}: {
  initialFolioResId?: string;
  onClearFolioResId?: () => void;
}) {
  const { 
    rooms, 
    reservations, 
    addReservation, 
    checkInReservation, 
    checkOutReservation, 
    assignRoomToReservation,
    setRoomStatus,
    changeRoom,
    currentSystemDate,
    addFolioCharge,
    editFolioCharge,
    voidFolioCharge,
    moveFolioCharge,
    addFolioPayment,
    voidFolioPayment,
    updateReservation,
    currency,
    formatAmount,
    globalHotelSettings,
    updateGlobalHotelSettings,
    addSaleTransaction,
    userProfile,
    chartOfAccounts,
    corporateAccounts,
    updateCorporateAccount,
    groupBookings,
    checkInGroupBooking
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'assignment' | 'checkout-folio'>('assignment');

  // Billing states
  const [selectedFolioResId, setSelectedFolioResId] = useState<string>('');
  
  // All features allowed for all users
  const canEditGlobalSettings = true;
  const canAdjustHotelTaxes = true;
  const canBypassHousekeepingLock = true;
  const canManageUserAccounts = true;
  
  React.useEffect(() => {
    if (initialFolioResId) {
      setSelectedFolioResId(initialFolioResId);
      if (onClearFolioResId) {
        onClearFolioResId();
      }
    }
  }, [initialFolioResId, onClearFolioResId]);

  // Billing states
  const [extraChargeAmount, setExtraChargeAmount] = useState<number>(35);
  const [extraChargeLabel, setExtraChargeLabel] = useState<string>('Standard Room Service Food Order');
  const [folioSuccess, setFolioSuccess] = useState('');
  const [editChargeId, setEditChargeId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [moveChargeId, setMoveChargeId] = useState<string | null>(null);

  // Advanced Split-Folio States
  const [activeRoutingProfileId, setActiveRoutingProfileId] = useState<string>('');
  const [splitCorporateAccountId, setSplitCorporateAccountId] = useState<string>('');
  const [activeFolioLedgerTab, setActiveFolioLedgerTab] = useState<'consolidated' | 'folio-a' | 'folio-b'>('consolidated');
  const [extraChargeType, setExtraChargeType] = useState<'Room' | 'F&B' | 'Extra' | 'Minibar' | 'Laundry' | 'Other'>('Extra');

  // Group Checkout and Corporate billing states
  const [billingMode, setBillingMode] = useState<'individual' | 'group'>('individual');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>(''); // e.g. 'ca-CA-401' or 'gb-GB-303'
  const [selectedGroupResIds, setSelectedGroupResIds] = useState<Record<string, boolean>>({});
  const [groupFolioPrintTab, setGroupFolioPrintTab] = useState<'consolidated' | 'folio-a' | 'folio-b'>('consolidated');
  const [showGroupPrintView, setShowGroupPrintView] = useState(false);
  const [groupSuccess, setGroupSuccess] = useState('');
  const [activeGroupChargeTypes, setActiveGroupChargeTypes] = useState<string[]>(['Room', 'F&B', 'Laundry', 'Transfer', 'Extra']);

  // Invoice generation handler
  const handleGenerateInvoice = () => {
    if (!currentFolioRes) return;

    // In production: Call generate_folio_invoice database function
    setFolioSuccess(`Invoice generated for Room ${currentFolioRes.roomNumber || 'N/A'} - ${currentFolioRes.guestName}`);
  };

  const getChargeType = (charge: any) => {
    if (charge.type) {
      if (['Room', 'F&B', 'Laundry', 'Transfer', 'Extra'].includes(charge.type)) {
        return charge.type;
      }
    }
    const desc = (charge.description || '').toLowerCase();
    if (desc.includes('room') || desc.includes('tariff') || desc.includes('accommodation') || desc.includes('lodging') || desc.includes('rate')) {
      return 'Room';
    }
    if (desc.includes('restaurant') || desc.includes('dinner') || desc.includes('breakfast') || desc.includes('bar') || desc.includes('cafe') || desc.includes('food') || desc.includes('beverage')) {
      return 'F&B';
    }
    if (desc.includes('laundry') || desc.includes('dry clean') || desc.includes('washing')) {
      return 'Laundry';
    }
    if (desc.includes('transfer') || desc.includes('airport') || desc.includes('shuttle') || desc.includes('taxi')) {
      return 'Transfer';
    }
    return 'Extra';
  };

  // Helper calculations for active folio modifiers (Discount, Service Charge, Taxes)
  // Helper function to calculate folio math for a generic reservation
  const calculateReservationFolioMath = (res: any) => {
    const profile = (globalHotelSettings.splitFolioRules || []).find((rule: any) => rule.id === (res.routingProfileId || (res.channel === 'Corporate' ? 'rule-corp-standard' : 'rule-all-personal')));
    
    const rawCharges = res.charges || [];
    const chargesAll = rawCharges;

    const chargesA = chargesAll.filter((c: any) => !c.isVoided && getChargeFolio(c, profile, billingMode, activeGroupChargeTypes) === 'A');
    const chargesB = chargesAll.filter((c: any) => !c.isVoided && getChargeFolio(c, profile, billingMode, activeGroupChargeTypes) === 'B');

    const discPct = res.discountPercent || 0;
    const scPct = res.serviceChargePercent !== undefined && res.serviceChargePercent !== null ? res.serviceChargePercent : globalHotelSettings.serviceChargePercent;
    const taxPct = res.taxPercent !== undefined && res.taxPercent !== null ? res.taxPercent : globalHotelSettings.taxPercent;

    const subtotal = chargesAll.filter((c: any) => !c.isVoided).reduce((sum: number, c: any) => sum + c.amount, 0);
    const discountAmt = Math.round(subtotal * (discPct / 100) * 100) / 100;
    const serviceAmt = Math.round(subtotal * (scPct / 100) * 100) / 100;

    let addonTotal = 0;
    if (globalHotelSettings.addonCharges && globalHotelSettings.addonCharges.length > 0) {
      globalHotelSettings.addonCharges.forEach((addon: any) => {
        addonTotal += Math.round(subtotal * (addon.percent / 100) * 100) / 100;
      });
    }
    const taxableBasis = subtotal - discountAmt + serviceAmt + addonTotal;
    const taxAmt = Math.round(taxableBasis * (taxPct / 100) * 100) / 100;
    const adjustedTotal = parseFloat((subtotal - discountAmt + serviceAmt + addonTotal + taxAmt).toFixed(2));

    // Folio A
    const subtotalA = chargesA.reduce((sum: number, c: any) => sum + c.amount, 0);
    const discountAmtA = Math.round(subtotalA * (discPct / 100) * 100) / 100;
    const serviceAmtA = Math.round(subtotalA * (scPct / 100) * 100) / 100;
    let addonTotalA = 0;
    if (globalHotelSettings.addonCharges && globalHotelSettings.addonCharges.length > 0) {
      globalHotelSettings.addonCharges.forEach((addon: any) => {
        addonTotalA += Math.round(subtotalA * (addon.percent / 100) * 100) / 100;
      });
    }
    const taxableBasisA = subtotalA - discountAmtA + serviceAmtA + addonTotalA;
    const taxAmtA = Math.round(taxableBasisA * (taxPct / 100) * 100) / 100;
    const totalA = parseFloat((subtotalA - discountAmtA + serviceAmtA + addonTotalA + taxAmtA).toFixed(2));

    // Folio B
    const subtotalB = chargesB.reduce((sum: number, c: any) => sum + c.amount, 0);
    const discountAmtB = Math.round(subtotalB * (discPct / 100) * 100) / 100;
    const serviceAmtB = Math.round(subtotalB * (scPct / 100) * 100) / 100;
    let addonTotalB = 0;
    if (globalHotelSettings.addonCharges && globalHotelSettings.addonCharges.length > 0) {
      globalHotelSettings.addonCharges.forEach((addon: any) => {
        addonTotalB += Math.round(subtotalB * (addon.percent / 100) * 100) / 100;
      });
    }
    const taxableBasisB = subtotalB - discountAmtB + serviceAmtB + addonTotalB;
    const taxAmtB = Math.round(taxableBasisB * (taxPct / 100) * 100) / 100;
    const totalB = parseFloat((subtotalB - discountAmtB + serviceAmtB + addonTotalB + taxAmtB).toFixed(2));

    // Payments
    const paymentsAll = (res.payments || []).filter((p: any) => !p.isVoided);
    const paymentsA = paymentsAll.filter((p: any) => p.method === 'Corporate Account Settle' || p.notes?.includes('A-Folio') || p.notes?.includes('Corporate'));
    const paymentsB = paymentsAll.filter((p: any) => p.method !== 'Corporate Account Settle' && !p.notes?.includes('A-Folio') && !p.notes?.includes('Corporate'));

    const totalPaid = paymentsAll.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPaidA = paymentsA.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPaidB = paymentsB.reduce((sum: number, p: any) => sum + p.amount, 0);

    const remainingBalance = Math.max(0, adjustedTotal - totalPaid);
    const remainingBalanceA = Math.max(0, totalA - totalPaidA);
    const remainingBalanceB = Math.max(0, totalB - totalPaidB);

    return {
      subtotal,
      discountAmt,
      serviceAmt,
      addonTotal,
      taxAmt,
      adjustedTotal,
      subtotalA,
      totalA,
      remainingBalanceA,
      subtotalB,
      totalB,
      remainingBalanceB,
      totalPaid,
      remainingBalance,
      chargesA,
      chargesB,
      paymentsA,
      paymentsB,
      paymentsAll
    };
  };

  const groupType = selectedGroupKey.startsWith('ca-') ? 'corporate' : selectedGroupKey.startsWith('gb-') ? 'group-booking' : null;
  const groupId = selectedGroupKey.replace(/^(ca-|gb-)/, '');
  const selectedCorpDetails = groupType === 'corporate' ? corporateAccounts?.find((c: any) => c.id === groupId) : null;
  const selectedGroupDetails = groupType === 'group-booking' ? groupBookings?.find((g: any) => g.id === groupId) : null;

  const groupReservations = reservations.filter(r => {
    if (!groupType) return false;
    if (groupType === 'corporate') {
      return r.corporateAccountId === groupId;
    } else {
      // Include all reservations with this group ID, regardless of room type
      return r.groupBookingId === groupId || r.bookingGroupId === groupId;
    }
  });

  const groupInHouseReservations = groupReservations.filter(r => r.status === 'CheckedIn');
  const groupConfirmedReservations = groupReservations.filter(r => r.status === 'Confirmed');

  React.useEffect(() => {
    const initialSelecteds: Record<string, boolean> = {};
    groupInHouseReservations.forEach(r => {
      initialSelecteds[r.id] = true;
    });
    setSelectedGroupResIds(initialSelecteds);
  }, [selectedGroupKey, groupInHouseReservations.length]);

  // Folio sub-section state (Unified single tab/console)
  const [showPrintView, setShowPrintView] = useState(false);
  const [showClientInfoFields, setShowClientInfoFields] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Active checked in reservations
  const checkedInReservations = reservations.filter(r => r.status === 'CheckedIn');
  const currentFolioRes = reservations.find(r => r.id === selectedFolioResId);

  // Helper calculations for active folio modifiers (Discount, Service Charge, Taxes)
  // Dynamic Split-Folio state & profile sync
  React.useEffect(() => {
    if (currentFolioRes) {
      const savedProfileId = currentFolioRes.routingProfileId || (currentFolioRes.channel === 'Corporate' ? 'rule-corp-standard' : 'rule-all-personal');
      setActiveRoutingProfileId(savedProfileId);
      
      const savedCorpId = currentFolioRes.corporateAccountId || (corporateAccounts && corporateAccounts.length > 0 ? corporateAccounts[0].id : '');
      setSplitCorporateAccountId(savedCorpId);

      const rules = globalHotelSettings.splitFolioRules || [];
      const rule = rules.find((r: any) => r.id === savedProfileId);
      if (rule && rule.corporateBillingOnly) {
        setActiveFolioLedgerTab('folio-a');
      } else {
        setActiveFolioLedgerTab('consolidated');
      }

      // Auto-populate payment amount with remaining balance
      const totalPaid = (currentFolioRes.payments || []).filter((p: any) => !p.isVoided).reduce((sum: number, p: any) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, currentFolioRes.totalAmount - totalPaid);
      setPaymentAmount(parseFloat(remainingBalance.toFixed(2)));
    }
  }, [selectedFolioResId, currentFolioRes?.id, corporateAccounts, globalHotelSettings.splitFolioRules]);

  const handleRoutingProfileChange = (profileId: string) => {
    setActiveRoutingProfileId(profileId);
    if (currentFolioRes) {
      updateReservation(currentFolioRes.id, { routingProfileId: profileId });
    }
  };

  const handleCorporateAccountChange = (corpId: string) => {
    setSplitCorporateAccountId(corpId);
    if (currentFolioRes) {
      updateReservation(currentFolioRes.id, { corporateAccountId: corpId });
    }
  };

  const activeProfile = (globalHotelSettings.splitFolioRules || []).find((r: any) => r.id === activeRoutingProfileId);

  // Base charges split
  const chargesAll = currentFolioRes ? (currentFolioRes.charges || []) : [];
  const chargesA = chargesAll.filter(c => !c.isVoided && getChargeFolio(c, activeProfile, billingMode, activeGroupChargeTypes) === 'A');
  const chargesB = chargesAll.filter(c => !c.isVoided && getChargeFolio(c, activeProfile, billingMode, activeGroupChargeTypes) === 'B');

  // Parameters
  const discPct = currentFolioRes?.discountPercent || 0;
  const scPct = currentFolioRes
    ? (currentFolioRes.serviceChargePercent !== undefined && currentFolioRes.serviceChargePercent !== null
        ? currentFolioRes.serviceChargePercent
        : globalHotelSettings.serviceChargePercent)
    : globalHotelSettings.serviceChargePercent;
  const taxPct = currentFolioRes
    ? (currentFolioRes.taxPercent !== undefined && currentFolioRes.taxPercent !== null
        ? currentFolioRes.taxPercent
        : globalHotelSettings.taxPercent)
    : globalHotelSettings.taxPercent;

  const hotelNameVal = currentFolioRes
    ? (currentFolioRes.customHotelName || globalHotelSettings.customHotelName)
    : globalHotelSettings.customHotelName;
  const hotelAddressVal = currentFolioRes
    ? (currentFolioRes.customHotelAddress || globalHotelSettings.customHotelAddress)
    : globalHotelSettings.customHotelAddress;
  const hotelTinVal = currentFolioRes
    ? (currentFolioRes.hotelTin || globalHotelSettings.hotelTin)
    : globalHotelSettings.hotelTin;
  const hotelVatNoVal = currentFolioRes
    ? (currentFolioRes.hotelVatNo || globalHotelSettings.hotelVatNo)
    : globalHotelSettings.hotelVatNo;
  const hotelVatDateVal = currentFolioRes
    ? (currentFolioRes.hotelVatDate || globalHotelSettings.hotelVatDate)
    : globalHotelSettings.hotelVatDate;

  // CONSOLIDATED MATH
  const consolidatedBilling = calculateFolioComponents(
    chargesAll.filter(c => !c.isVoided),
    currentFolioRes || {},
    globalHotelSettings
  );
  
  const subtotal = consolidatedBilling.subtotal;
  const originalDiscountAmt = consolidatedBilling.discountAmt;
  const serviceAmt = consolidatedBilling.serviceAmt;
  const addonTotal = consolidatedBilling.addonTotal;
  const addonDetails = consolidatedBilling.addonDetails;
  const taxAmt = consolidatedBilling.taxAmt;
  const adjustedTotal = consolidatedBilling.total;
  const feeBreakdown = consolidatedBilling.feeBreakdown || [];

  // FOLIO A MATH
  const billingA = calculateFolioComponents(
    chargesA,
    currentFolioRes || {},
    globalHotelSettings
  );

  const subtotalA = billingA.subtotal;
  const discountAmtA = billingA.discountAmt;
  const serviceAmtA = billingA.serviceAmt;
  const addonTotalA = billingA.addonTotal;
  const addonDetailsA = billingA.addonDetails;
  const feeBreakdownA = billingA.feeBreakdown || [];
  const taxAmtA = billingA.taxAmt;
  const totalA = billingA.total;

  // FOLIO B MATH
  const billingB = calculateFolioComponents(
    chargesB,
    currentFolioRes || {},
    globalHotelSettings
  );
  
  const subtotalB = billingB.subtotal;
  const discountAmtB = billingB.discountAmt;
  const serviceAmtB = billingB.serviceAmt;
  const addonTotalB = billingB.addonTotal;
  const addonDetailsB = billingB.addonDetails;
  const taxAmtB = billingB.taxAmt;
  const totalB = billingB.total;
  const feeBreakdownB = billingB.feeBreakdown || [];

  // PAYMENTS & OFFSETS
  const paymentsAll = currentFolioRes ? (currentFolioRes.payments || []).filter(p => !p.isVoided) : [];
  const paymentsA = paymentsAll.filter(p => p.targetFolio === 'A' || (!p.targetFolio && (p.method === 'Corporate Account Settle' || p.notes?.includes('A-Folio') || p.notes?.includes('Corporate'))));
  const paymentsB = paymentsAll.filter(p => p.targetFolio === 'B' || (!p.targetFolio && (p.method !== 'Corporate Account Settle' && !p.notes?.includes('A-Folio') && !p.notes?.includes('Corporate'))));

  const totalPaid = paymentsAll.reduce((sum, p) => sum + p.amount, 0);
  const totalPaidA = paymentsA.reduce((sum, p) => sum + p.amount, 0);
  const totalPaidB = paymentsB.reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = currentFolioRes ? Math.max(0, adjustedTotal - totalPaid) : 0;
  const remainingBalanceA = currentFolioRes ? Math.max(0, totalA - totalPaidA) : 0;
  const remainingBalanceB = currentFolioRes ? Math.max(0, totalB - totalPaidB) : 0;

  // Active sub-ledger selected values
  const activeTabSubtotal = activeFolioLedgerTab === 'folio-a' ? subtotalA : activeFolioLedgerTab === 'folio-b' ? subtotalB : subtotal;
  const activeTabDiscount = activeFolioLedgerTab === 'folio-a' ? discountAmtA : activeFolioLedgerTab === 'folio-b' ? discountAmtB : originalDiscountAmt;
  const activeTabService = activeFolioLedgerTab === 'folio-a' ? serviceAmtA : activeFolioLedgerTab === 'folio-b' ? serviceAmtB : serviceAmt;
  const activeTabAddonTotal = activeFolioLedgerTab === 'folio-a' ? addonTotalA : activeFolioLedgerTab === 'folio-b' ? addonTotalB : addonTotal;
  const activeTabTax = activeFolioLedgerTab === 'folio-a' ? taxAmtA : activeFolioLedgerTab === 'folio-b' ? taxAmtB : taxAmt;
  const activeTabTotal = activeFolioLedgerTab === 'folio-a' ? totalA : activeFolioLedgerTab === 'folio-b' ? totalB : adjustedTotal;
  const activeTabTotalPaid = activeFolioLedgerTab === 'folio-a' ? totalPaidA : activeFolioLedgerTab === 'folio-b' ? totalPaidB : totalPaid;
  const activeTabBalance = activeFolioLedgerTab === 'folio-a' ? remainingBalanceA : activeFolioLedgerTab === 'folio-b' ? remainingBalanceB : remainingBalance;
  const activeTabFeeBreakdown = activeFolioLedgerTab === 'folio-a' ? feeBreakdownA : activeFolioLedgerTab === 'folio-b' ? feeBreakdownB : feeBreakdown;

  React.useEffect(() => {
    if (currentFolioRes) {
      setPaymentAmount(parseFloat(activeTabBalance.toFixed(2)));
    } else {
      setPaymentAmount(0);
    }
  }, [selectedFolioResId, activeTabBalance]);

  // Synchronize adjusted totalAmount to ERPContext whenever charges, discount, service charge, or tax values change
  React.useEffect(() => {
    if (currentFolioRes) {
      if (Math.abs(currentFolioRes.totalAmount - adjustedTotal) > 0.01) {
        updateReservation(currentFolioRes.id, {
          totalAmount: adjustedTotal
        });
      }
    }
  }, [selectedFolioResId, adjustedTotal, currentFolioRes?.totalAmount, updateReservation]);

  // Late checkout requests list
  const expressRequestsList = reservations.filter(
    r => r.status === 'CheckedIn' && (r.earlyCheckOutRequested || r.lateCheckOutRequested)
  );

  // Render consolidated group master ledger overview
  const renderGroupMasterLedger = () => {
    const selectedResIds = Object.keys(selectedGroupResIds).filter(id => selectedGroupResIds[id]);
    const activeSelectedList = groupInHouseReservations.filter(r => selectedResIds.includes(r.id));

    return (
      <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full w-full">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                <Briefcase size={16} className="text-indigo-600" />
                Consolidated Group Master Ledger Overview
              </h3>
              <p className="text-xs text-slate-400">Manage bulk accounts, master routing settlements, and tour block checkouts.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (groupInHouseReservations.length === 0) {
                    alert("No active in-house reservations under this group debtor!");
                    return;
                  }
                  setGroupFolioPrintTab('consolidated');
                  setShowGroupPrintView(true);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold text-xs uppercase tracking-wide rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-sm"
              >
                <Printer size={14} />
                Print Master Invoice
              </button>
            </div>
          </div>

          {selectedGroupKey ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sans">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block leading-none mb-1.5">Rooms In-House</span>
                <span className="text-base font-bold text-slate-800">
                  {groupInHouseReservations.length} <span className="text-xs text-slate-400 font-normal">Active</span>
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block leading-none mb-1.5">Total Corporate Folio Due</span>
                <span className="text-base font-bold text-indigo-700">
                  {formatAmount(
                    groupInHouseReservations.reduce((sum, r) => sum + calculateReservationFolioMath(r).remainingBalanceA, 0)
                  )}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block leading-none mb-1.5">Total Individual Folio Due</span>
                <span className="text-base font-bold text-amber-600">
                  {formatAmount(
                    groupInHouseReservations.reduce((sum, r) => sum + calculateReservationFolioMath(r).remainingBalanceB, 0)
                  )}
                </span>
              </div>
            </div>
          ) : null}

          {selectedGroupKey ? (
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3 font-sans text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-sans font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-600" />
                  Route Group Billing Charges by Type
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Toggle On to route to Corporate Folio, Toggle Off to route to Individual Folio
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { name: '💰 Room Tariff', key: 'Room', color: 'bg-blue-55/70 text-blue-900 border-blue-200' },
                  { name: '🍳 Food & Beverage', key: 'F&B', color: 'bg-emerald-55/75 text-emerald-950 border-emerald-200' },
                  { name: '👕 Laundry', key: 'Laundry', color: 'bg-purple-55/70 text-purple-900 border-purple-200' },
                  { name: '🚗 Transfers', key: 'Transfer', color: 'bg-teal-55/70 text-teal-900 border-teal-200' },
                  { name: '🏷️ Incidentals & Extra', key: 'Extra', color: 'bg-amber-55/70 text-amber-900 border-amber-200' },
                ].map((type) => {
                  const isChecked = activeGroupChargeTypes.includes(type.key);
                  return (
                    <label
                      key={type.key}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-lg cursor-pointer flex items-center gap-1.5 transition-all duration-200 outline-none select-none ${
                        isChecked
                          ? `${type.color} shadow-sm hover:opacity-90`
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setActiveGroupChargeTypes((prev) =>
                            prev.includes(type.key)
                              ? prev.filter((k) => k !== type.key)
                              : [...prev, type.key]
                          );
                        }}
                        className="sr-only"
                      />
                      <span className={`h-1.5 w-1.5 rounded-full ${isChecked ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      {type.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {selectedGroupKey ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-semibold text-slate-500 font-sans leading-none tracking-wide">
                  Room List & Folio Statuses ({groupInHouseReservations.length} in-house, {groupConfirmedReservations.length} incoming)
                </h4>
                
                {groupInHouseReservations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const selectAll: Record<string, boolean> = {};
                        groupInHouseReservations.forEach(r => { selectAll[r.id] = true; });
                        setSelectedGroupResIds(selectAll);
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold font-sans cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupResIds({})}
                      className="text-xs text-slate-500 hover:underline font-semibold font-sans cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-3xs uppercase text-slate-500 font-semibold">
                      <th className="py-2.5 px-3 w-10 text-center">Settle?</th>
                      <th className="py-2.5 px-2">Room / Occupant</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-2 text-right">Corporate Folio</th>
                      <th className="py-2.5 px-2 text-right">Individual Folio</th>
                      <th className="py-2.5 px-2 text-right">Remaining Balance</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupInHouseReservations.map(res => {
                      const math = calculateReservationFolioMath(res);
                      const isChecked = !!selectedGroupResIds[res.id];
                      return (
                        <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setSelectedGroupResIds(prev => ({
                                  ...prev,
                                  [res.id]: e.target.checked
                                }));
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-slate-800">
                              Room {res.roomNumber || 'N/A'} - {res.guestName}
                            </div>
                            <div className="text-xs text-slate-400 font-mono capitalize">
                              Stay: {res.checkInDate} to {res.checkOutDate} • {res.roomType} room
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-sans text-xs font-semibold uppercase select-none">
                              IN HOUSE
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-xs text-indigo-700 font-bold">
                            {formatAmount(math.remainingBalanceA)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-xs text-amber-600 font-semibold">
                            {formatAmount(math.remainingBalanceB)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-xs text-slate-900 font-bold">
                            {formatAmount(math.remainingBalance)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFolioResId(res.id);
                                setBillingMode('individual');
                              }}
                              className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 font-sans border border-slate-200 font-semibold text-xs rounded cursor-pointer uppercase transition-all duration-200"
                              title="Open detailed single guest ledger billing controls"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {groupConfirmedReservations.map(res => (
                      <tr key={res.id} className="border-b border-slate-100 bg-slate-100/10 opacity-75">
                        <td className="py-2.5 px-3 text-center">-</td>
                        <td className="py-2.5 px-2">
                          <div className="font-semibold text-slate-600">
                            Room {res.roomNumber || 'Pre-Assigned'} - {res.guestName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Arrives {res.checkInDate} • {res.roomType} room
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-sans text-xs font-semibold uppercase animate-pulse">
                            ARRIVING
                          </span>
                        </td>
                        <td colSpan={3} className="py-2.5 px-2 text-center font-mono text-xs text-slate-400 font-semibold">
                          No historical folio balance prior to check-in
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              await checkInReservation(res.id);
                              setGroupSuccess(`Checked in guest ${res.guestName} (auto-assigned room).`);
                              setTimeout(() => setGroupSuccess(''), 4000);
                            }}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 font-sans border border-indigo-200 font-semibold text-xs rounded cursor-pointer uppercase transition-all duration-200"
                          >
                            Check In
                          </button>
                        </td>
                      </tr>
                    ))}

                    {groupReservations.filter(r => r.status === 'CheckedOut').map(res => (
                      <tr key={res.id} className="border-b border-slate-100 bg-slate-100/5 opacity-60">
                        <td className="py-2.5 px-3 text-center">
                          <Check size={14} className="text-emerald-500 mx-auto" />
                        </td>
                        <td className="py-2.5 px-2 text-slate-400">
                          <div className="font-normal line-through">
                            Room {res.roomNumber || 'N/A'} - {res.guestName}
                          </div>
                          <div className="text-xs font-mono">
                            FINALIZED OUT
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-sans text-xs font-semibold uppercase">
                            OUT
                          </span>
                        </td>
                        <td colSpan={3} className="py-2.5 px-2 text-center text-xs font-mono text-emerald-600 font-semibold">
                          Sponsor Direct-Billing ledger set in full
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFolioResId(res.id);
                              setBillingMode('individual');
                            }}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-400 font-sans font-semibold text-xs rounded cursor-pointer uppercase transition-all duration-200"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}

                    {groupReservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic font-sans text-xs">
                          No members associated under this Sponsor yet. Link other checked-in guests via corporate assignment selector.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 italic font-sans text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
              Please select a Corporate Account or Tour Group in the console to load the bulk checkout module.
            </div>
          )}
        </div>

        {/* BULK CHECKOUT MASTER ACTIONS */}
        {selectedGroupKey && groupInHouseReservations.length > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1 font-sans font-sans">
                <span className="text-xs uppercase font-semibold tracking-wide text-slate-500 block leading-none">
                  Consolidated Settle Method for Bulk Group Checkout
                </span>
                <div className="flex items-center gap-1.5 pt-1.5">
                  <label className="text-xs font-mono uppercase text-slate-500 font-semibold block uppercase">Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-sans text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {(() => {
                      const baseTypes = globalHotelSettings.paymentTypes || ['Credit Card', 'Cash', 'Mobile Money', 'Bank Transfer'];
                      const accounts = (chartOfAccounts || [])
                        .filter(a => (a.subCategory === 'Bank' || a.subCategory === 'Cash') && a.isActive)
                        .map(a => a.name);
                      
                      const allMethods = Array.from(new Set([...baseTypes, ...accounts, 'Company Ledger', 'Room Charge']));
                      return allMethods.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ));
                    })()}
                  </select>

                  {!['Cash', 'Room Charge'].includes(paymentMethod) && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1 animate-fade-in">
                      <label className="text-xs font-mono uppercase text-slate-500 font-semibold">Receipt Screenshot</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setPaymentScreenshot(e.target.files[0]);
                          }
                        }}
                        className="w-full bg-white text-slate-700 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSelectedList.length === 0) {
                      alert("Please select at least one in-house room guest using checkboxes.");
                      return;
                    }
                    
                    activeSelectedList.forEach(r => {
                      const math = calculateReservationFolioMath(r);

                      if (math.remainingBalanceA > 0) {
                        addFolioPayment(r.id, {
                          amount: math.remainingBalanceA,
                          method: paymentMethod || 'Company Ledger',
                          notes: `Bulk Group block checkout billed via ${paymentMethod}`
                        });
                        if (groupType === 'corporate' && selectedCorpDetails) {
                          const currentBal = selectedCorpDetails.unpaidBalance || 0;
                          updateCorporateAccount(selectedCorpDetails.id, {
                            unpaidBalance: currentBal + math.remainingBalanceA
                          });
                        }
                      }

                      if (math.remainingBalanceB > 0) {
                        addFolioPayment(r.id, {
                          amount: math.remainingBalanceB,
                          method: paymentMethod || 'Credit Card',
                          notes: `Bulk Group checkout incidental settle via ${paymentMethod}`
                        });
                      }

                      checkOutReservation(r.id);
                    });

                    setGroupSuccess(`Checked out ${activeSelectedList.length} rooms under master direct billing ledger account of ${selectedCorpDetails?.companyName || selectedGroupDetails?.groupName}!`);
                    setSelectedGroupResIds({});
                    setTimeout(() => setGroupSuccess(''), 5500);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans font-semibold rounded-lg text-xs transition-all duration-200 shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer uppercase select-none"
                >
                  <Check size={14} />
                  Master Settle & Checkout Selected ({activeSelectedList.length} Rooms)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="checkin-checkout-module">
      
      {/* GUEST FOLIO & INVOICING SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Folio selectors & posting */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
          <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-800">Folio Billing Terminal</h3>
              <p className="text-xs text-slate-400 font-sans">Unified billing console for charges and payments</p>
            </div>
            <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">
              Unified console
            </span>
          </div>

            {folioSuccess && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-2xs rounded-lg animate-pulse mb-3">
                {folioSuccess}
              </div>
            )}

            {groupSuccess && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-2xs rounded-lg animate-pulse mb-3">
                {groupSuccess}
              </div>
            )}

            {/* BILLING TERMINAL MODE TOGGLE */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-sans font-medium text-slate-500">
              <button
                type="button"
                onClick={() => setBillingMode('individual')}
                className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${
                  billingMode === 'individual'
                    ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50'
                    : 'border-b-transparent hover:text-slate-700'
                }`}
              >
                <User size={14} /> Individual Folio
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingMode('group');
                  if (!selectedGroupKey) {
                    if (corporateAccounts && corporateAccounts.length > 0) {
                      setSelectedGroupKey(`ca-${corporateAccounts[0].id}`);
                    } else if (groupBookings && groupBookings.length > 0) {
                      setSelectedGroupKey(`gb-${groupBookings[0].id}`);
                    }
                  }
                }}
                className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${
                  billingMode === 'group'
                    ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50'
                    : 'border-b-transparent hover:text-slate-700'
                }`}
              >
                <Briefcase size={14} /> Group Checkout
              </button>
            </div>

            {billingMode === 'individual' ? (
              <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Select Checked-In Room Guest</label>
                <select
                  value={selectedFolioResId}
                  onChange={(e) => setSelectedFolioResId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono font-semibold transition-all duration-200"
                >
                  <option value="">Select In-House Guest...</option>
                  {checkedInReservations.map(r => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber || 'N/A'}: {r.guestName}</option>
                  ))}
                  {currentFolioRes && currentFolioRes.status !== 'CheckedIn' && (
                    <option key={currentFolioRes.id} value={currentFolioRes.id}>
                      [Checked Out] Room {currentFolioRes.roomNumber || 'N/A'}: {currentFolioRes.guestName}
                    </option>
                  )}
                </select>
              </div>

              {selectedFolioResId && (
                <div className="space-y-4" id="unified-billing-controls">
                  
                  {/* I. CLIENT INFO SECTION */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3">
                      <UserPlus size={14} className="text-indigo-600" />
                      <span className="text-xs font-sans font-semibold text-slate-800">
                        Client Information
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setShowClientInfoFields(!showClientInfoFields)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={12} /> {showClientInfoFields ? 'Hide' : 'Edit'} Client Info
                      </button>

                      {showClientInfoFields && (
                        <div className="space-y-2 border-t border-dashed border-slate-300 pt-2 animate-fade-in max-h-[220px] overflow-y-auto pr-1 text-2xs">
                          <div className="space-y-1">
                            <label className="text-3xs font-mono uppercase text-slate-400">Client Name</label>
                            <input
                              type="text"
                              value={currentFolioRes.guestName ?? ''}
                              onChange={(e) => updateReservation(currentFolioRes.id, { guestName: e.target.value })}
                              placeholder="John/Jane Doe"
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all duration-200"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <div className="space-y-0.5">
                              <label className="text-3xs font-mono uppercase text-slate-400">Client TIN</label>
                              <input
                                type="text"
                                value={currentFolioRes.guestTin ?? ''}
                                onChange={(e) => updateReservation(currentFolioRes.id, { guestTin: e.target.value })}
                                placeholder="CUST-TIN-8899"
                                className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-3xs font-mono uppercase text-slate-400">Client VAT No</label>
                              <input
                                type="text"
                                value={currentFolioRes.guestVatNo ?? ''}
                                onChange={(e) => updateReservation(currentFolioRes.id, { guestVatNo: e.target.value })}
                                placeholder="CUST-VAT-1122"
                                className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-3xs font-mono uppercase text-slate-400">Client Date of VAT Reg.</label>
                            <input
                              type="date"
                              value={currentFolioRes.guestVatDate ?? ''}
                              onChange={(e) => updateReservation(currentFolioRes.id, { guestVatDate: e.target.value })}
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all duration-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* II. POST INCIDENTAL CHARGE SECTION */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3">
                      <PlusCircle size={14} className="text-indigo-600" />
                      <span className="text-xs font-sans font-semibold text-slate-800">
                        Post Incidental Charge
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-3xs font-mono uppercase text-slate-400">Charge Title</label>
                        <input
                          type="text"
                          value={extraChargeLabel}
                          onChange={(e) => setExtraChargeLabel(e.target.value)}
                          placeholder="Cafe, Spa Treatment, Extra Guest Fee etc."
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-1 border-t border-slate-100 pt-1">
                        <label className="text-3xs font-mono uppercase text-slate-400">Amount Charged ({currency})</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[10px]">{currency === 'USD' ? '$' : 'Br'}</span>
                          <input
                            type="number"
                            min="5"
                            value={extraChargeAmount}
                            onChange={(e) => setExtraChargeAmount(Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 border-t border-slate-100 pt-1">
                        <label className="text-3xs font-mono uppercase text-slate-400">Charge Category / Route Type</label>
                        <select
                          value={extraChargeType}
                          onChange={(e) => setExtraChargeType(e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans font-semibold text-slate-700 transition-all duration-200"
                        >
                          <option value="Room">Nightly Room Tariff / Accommodation</option>
                          <option value="F&B">F&B (Restaurant, Dinner, Beverage, Room Service)</option>
                          <option value="Minibar">Minibar / Snacks / Cabinets</option>
                          <option value="Extra">Spa / Health Treatments & Extra Fees</option>
                          <option value="Laundry">Laundry / Valet Services</option>
                          <option value="Transfer">Transfer / Airport Shuttle</option>
                          <option value="Other">Other Miscellaneous Charges</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!currentFolioRes) return;
                          addFolioCharge(currentFolioRes.id, {
                            amount: extraChargeAmount,
                            description: extraChargeLabel,
                            type: extraChargeType as any
                          });
                          setFolioSuccess(`Charged ${formatAmount(extraChargeAmount)} for "${extraChargeLabel}" [Route Type: ${extraChargeType}] to Room ${currentFolioRes.roomNumber || 'N/A'}.`);
                          setExtraChargeAmount(35);
                          setExtraChargeLabel('Standard Room Service Food Order');
                          setExtraChargeType('Extra');
                          setTimeout(() => setFolioSuccess(''), 4000);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans font-semibold rounded-lg text-xs transition-all duration-200 shadow-md shadow-indigo-200 cursor-pointer"
                      >
                        <Plus size={12} /> Post Charge Entry
                      </button>
                    </div>
                  </div>

                  {/* III. POST PAYMENT / CREDIT SECTION */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3">
                      <CreditCard size={14} className="text-emerald-600" />
                      <span className="text-xs font-sans font-semibold text-slate-800">
                        Record Payment / Credit
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs font-sans transition-all duration-200"
                        >
                          {(() => {
                            const baseTypes = globalHotelSettings.paymentTypes || ['Credit Card', 'Cash', 'Mobile Money', 'Bank Transfer'];
                            const accounts = (chartOfAccounts || [])
                              .filter(a => (a.subCategory === 'Bank' || a.subCategory === 'Cash') && a.isActive)
                              .map(a => a.name);
                            
                            const allMethods = Array.from(new Set([...baseTypes, ...accounts, 'Room Charge']));
                            return allMethods.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ));
                          })()}
                        </select>

                        {!['Cash', 'Room Charge'].includes(paymentMethod) && (
                          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 animate-fade-in">
                            <label className="text-3xs font-mono uppercase text-slate-500 font-bold">Payment Receipt Screenshot</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const file = e.target.files[0];
                                  setPaymentScreenshot(file);

                                  // In production: Upload to Supabase Storage and create payment_receipts record
                                }
                              }}
                              className="w-full bg-white text-slate-700 text-2xs p-2 rounded-lg border border-slate-300"
                            />
                            {paymentScreenshot && (
                              <div className="flex items-center gap-2 text-xs text-emerald-600 mt-1">
                                <Check size={12} />
                                <span>{paymentScreenshot.name} selected</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Payment Amount ({currency})</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[10px]">{currency === 'USD' ? '$' : 'Br'}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full pl-6 pr-14 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-bold text-slate-900 transition-all duration-200"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const totalPaidVal = (currentFolioRes.payments || [])
                                .filter(p => !p.isVoided)
                                .reduce((sum, p) => sum + p.amount, 0);
                              setPaymentAmount(Math.max(0, currentFolioRes.totalAmount - totalPaidVal));
                            }}
                            className="absolute right-1 top-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase hover:bg-indigo-100 transition-all duration-200 cursor-pointer"
                          >
                            Pay Full
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-mono uppercase text-slate-400">Notes / Reference Ref</label>
                        <input
                          type="text"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Auth code, split ID, depositor..."
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans transition-all duration-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!currentFolioRes) return;
                          
                          // If corporate folio, update corporate account balance
                          if (activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId) {
                            const corpAcc = corporateAccounts.find(a => a.id === splitCorporateAccountId);
                            if (corpAcc) {
                              updateCorporateAccount(corpAcc.id, {
                                unpaidBalance: Math.max(0, (corpAcc.unpaidBalance || 0) - paymentAmount)
                              });
                            }
                          }

                          addFolioPayment(currentFolioRes.id, {
                            amount: paymentAmount,
                            method: paymentMethod,
                            notes: paymentNotes || (activeFolioLedgerTab === 'folio-a' ? 'A-Folio Corporate Payment' : 'Individual Payment'),
                            targetFolio: activeFolioLedgerTab === 'folio-a' ? 'A' : 'B'
                          });
                          
                          addSaleTransaction({
                            date: new Date().toISOString(),
                            invoiceNumber: `INV-FOLIO${Math.floor(Math.random()*10000)}`,
                            module: 'Front Desk Folio',
                            customerName: currentFolioRes.guestName,
                            items: [{ productName: 'Folio Settlement / Payment', quantity: 1, price: paymentAmount }],
                            subtotal: paymentAmount,
                            tax: 0,
                            total: paymentAmount,
                            paymentMethod: paymentMethod,
                            status: 'Completed',
                            cashierName: userProfile?.name || 'Front Desk'
                          });

                          setFolioSuccess(`Received ${formatAmount(paymentAmount)} via "${paymentMethod}" for Room ${currentFolioRes.roomNumber || 'N/A'}.`);
                          setPaymentNotes('');
                          setTimeout(() => setFolioSuccess(''), 4000);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-sans font-semibold rounded-lg text-xs transition-all duration-200 shadow-md shadow-emerald-200 cursor-pointer"
                      >
                        <CreditCard size={12} /> Post Payment Credit
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
            ) : (
              <div className="space-y-4 text-xs font-sans animate-fade-in pb-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold block">Group Debtor / Operator</label>
                  <select
                    value={selectedGroupKey}
                    onChange={(e) => setSelectedGroupKey(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans text-xs font-semibold text-slate-800 transition-all duration-200"
                  >
                    <option value="">Select Corporate Account or Group...</option>
                    {corporateAccounts && corporateAccounts.length > 0 && (
                      <optgroup label="💼 Approved Corporates">
                        {corporateAccounts.map((c: any) => (
                          <option key={`ca-${c.id}`} value={`ca-${c.id}`}>
                            {c.companyName} ({c.activeBookings || 0} active)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {groupBookings && groupBookings.length > 0 && (
                      <optgroup label="✈️ Tour Operator / Group Blocks">
                        {groupBookings.map((g: any) => (
                          <option key={`gb-${g.id}`} value={`gb-${g.id}`}>
                            {g.groupName} ({g.roomCount} rooms)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {selectedGroupKey ? (
                  <div className="space-y-4">
                    {/* Sponsor guest info */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 text-xs font-semibold text-slate-800 font-sans">
                        <Briefcase size={14} className="text-indigo-600 shrink-0" />
                        <span>Sponsor Contract Profile</span>
                      </div>
                      <div className="space-y-1 text-2xs text-slate-600 font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono">Company:</span>
                          <span className="font-bold text-slate-850 text-right">
                            {groupType === 'corporate' ? selectedCorpDetails?.companyName : selectedGroupDetails?.groupName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono">Contact:</span>
                          <span className="font-semibold text-slate-750 text-right">
                            {groupType === 'corporate' ? selectedCorpDetails?.contactPerson : selectedGroupDetails?.contactName}
                          </span>
                        </div>
                        <div className="flex justify-between font-mono text-[9px]">
                          <span className="text-slate-400 font-sans">Email/Ph:</span>
                          <span className="text-slate-500 text-right truncate max-w-[150px]">
                            {groupType === 'corporate' ? selectedCorpDetails?.contactEmail : selectedGroupDetails?.contactEmail}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono">Rates / Disc:</span>
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.25 rounded font-mono text-[10px]">
                            {groupType === 'corporate' ? selectedCorpDetails?.discountPercent : selectedGroupDetails?.discountPercent}% contract discount
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Simulation Aids */}
                    <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-950 font-sans text-xs uppercase tracking-wider">
                        <Sliders size={14} className="text-indigo-600 shrink-0" />
                        <span>Group Test Simulation</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        To test active Group Checkout, rooms must be Checked In under this corporation/operator. If none are checked in, click below to check them in automatically.
                      </p>
                      
                      {groupConfirmedReservations.length > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (groupType === 'group-booking') {
                              await checkInGroupBooking(groupId);
                              setGroupSuccess(`Checked in all ${groupConfirmedReservations.length} incoming members for ${selectedGroupDetails?.groupName}!`);
                              setTimeout(() => setGroupSuccess(''), 4500);
                            } else {
                              // Corporate account bookings check in with auto-assign
                              for (const r of groupConfirmedReservations) {
                                await checkInReservation(r.id);
                              }
                              setGroupSuccess(`Checked in ${groupConfirmedReservations.length} corporate reservation rooms!`);
                              setTimeout(() => setGroupSuccess(''), 4500);
                            }
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans font-semibold rounded-lg text-xs transition-all duration-200 shadow-md shadow-indigo-200 cursor-pointer"
                        >
                          <UserPlus size={12} /> Check-In All Incoming Rooms ({groupConfirmedReservations.length})
                        </button>
                      )}

                      <div className="pt-3 border-t border-indigo-100/50 font-sans">
                        <label className="text-xs uppercase tracking-wider text-slate-400 block font-semibold mb-1">Corporate Sponsor Assignment</label>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateReservation(e.target.value, { 
                                corporateAccountId: groupType === 'corporate' ? groupId : undefined,
                                groupBookingId: groupType === 'group-booking' ? groupId : undefined,
                                channel: groupType === 'corporate' ? 'Corporate' : 'Direct Website'
                              });
                              setGroupSuccess(`Assigned guest to group sponsor ledger successfully.`);
                              setTimeout(() => setGroupSuccess(''), 4000);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-2.5 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs rounded text-slate-600 dark:text-slate-300 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Link any other In-House Guest...</option>
                          {checkedInReservations
                            .filter(r => r.corporateAccountId !== groupId && r.groupBookingId !== groupId)
                            .map(r => (
                              <option key={r.id} value={r.id}>
                                Room {r.roomNumber || 'N/A'}: {r.guestName}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex items-start gap-2 text-xs text-slate-400 font-sans leading-relaxed">
                      <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>Note: The Group master bill aggregates all rooms' Corporate Folio direct charges. Guest incidentals remain on the Individual Folio unless manually settled bulk-wise.</span>
                    </div>

                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic text-xs font-sans">
                    Please select a Corporate account or Tour Operator to manage bulk billing.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Graphical Invoice Folio Summary Receipt */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-lg shadow-slate-200/50 space-y-4 flex flex-col justify-between" id="folio-invoice-ledger">
            {billingMode === 'group' ? (
              renderGroupMasterLedger()
            ) : (
              <>
                <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-b-slate-100 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sliders size={16} className="text-indigo-600" />
                    Property Management Folio Ledger Console
                  </h3>
                  <p className="text-xs text-slate-400">Manage split corporate rules or guest discretionary lists in real time.</p>
                </div>
                
                {currentFolioRes && (
                  <button 
                    onClick={() => setShowPrintView(true)} 
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-sans font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-sm self-start sm:self-auto"
                  >
                    <Printer size={14} /> Print {activeFolioLedgerTab === 'folio-a' ? 'Corporate' : activeFolioLedgerTab === 'folio-b' ? 'Individual' : 'Consolidated'} Folio
                  </button>
                )}
              </div>

              {!currentFolioRes ? (
                <div className="py-24 text-center text-xs text-slate-400 font-sans">
                  Select an in-house room on the left view to display checkout folio receipts.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ADVANCED SPLIT ROUTING RULE CONFIGURING BAR */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-sans">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-xs uppercase tracking-wider text-slate-400 font-sans font-semibold block">Active Folio Routing Rule</label>
                        <select
                          value={activeRoutingProfileId}
                          onChange={(e) => handleRoutingProfileChange(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans font-semibold text-slate-700 transition-all duration-200"
                        >
                          {(globalHotelSettings.splitFolioRules || []).map((rule: any) => (
                            <option key={rule.id} value={rule.id}>{rule.name}</option>
                          ))}
                        </select>
                      </div>

                      {(activeProfile?.corporateBillingOnly || chargesA.length > 0) && (
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-xs uppercase tracking-wider text-slate-400 font-sans font-semibold block">Target Corporate Debtor Account</label>
                          <select
                            value={splitCorporateAccountId}
                            onChange={(e) => handleCorporateAccountChange(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 bg-indigo-50/10 text-indigo-950 font-sans font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          >
                            {(corporateAccounts || []).map((corp: any) => (
                              <option key={corp.id} value={corp.id}>{corp.companyName} (VAT: {corp.vatNumber || 'N/A'})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {activeProfile?.corporateBillingOnly ? (
                      <div className="space-y-2">
                        <div className="p-3 border border-indigo-100 bg-indigo-50/25 rounded-lg flex items-start gap-2 text-indigo-950 text-xs leading-relaxed font-sans">
                          <Briefcase size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Automated Routing Engine Engaged ({activeProfile.name}):</strong> Corporate-sponsored charges (<strong>{activeProfile.primaryTypes.join(', ')}</strong>) automatically split into <span className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded font-semibold text-xs">Corporate Folio</span>. Guest incidentals (<strong>{activeProfile.secondaryTypes.join(', ')}</strong>) route to <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold text-xs">Individual Folio</span>.
                          </div>
                        </div>
                        <div className="p-2 border border-slate-100 bg-slate-50 rounded-lg flex items-center gap-1.5 text-slate-500 text-xs font-sans">
                          <Sliders size={12} className="text-indigo-500" />
                          <span>Pro-tip: Click the <strong>A</strong> or <strong>B</strong> control pills in the table below to manually choose folio assignment for individual items in detail.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-lg flex items-start gap-2 text-indigo-950 text-xs leading-relaxed font-sans">
                          <Sliders size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Direct Splitting Console:</strong> Use the <strong>A / B</strong> selector pills beside item charges in the ledger to instantly choose which item goes to which folio in detail.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HIGH CONTRAST FOLIO TAB SWITCHER */}
                  <div className="flex items-center gap-1 border-b border-slate-200 pt-2 font-sans overflow-x-auto whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setActiveFolioLedgerTab('consolidated')}
                      className={`px-3 py-2.5 border-b-2 text-xs uppercase tracking-wider transition-all duration-200 font-semibold flex items-center gap-1.5 cursor-pointer ${
                        activeFolioLedgerTab === 'consolidated'
                          ? 'border-slate-800 text-slate-900 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Consolidated Ledger ({chargesAll.length})
                    </button>
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveFolioLedgerTab('folio-a')}
                        className={`px-3 py-2.5 border-b-2 text-xs uppercase tracking-wider transition-all duration-200 font-semibold flex items-center gap-1.5 cursor-pointer ${
                          activeFolioLedgerTab === 'folio-a'
                            ? 'border-indigo-600 text-indigo-700 font-bold'
                            : 'border-transparent text-slate-400 hover:text-indigo-600/80'
                        }`}
                      >
                        <Briefcase size={12} /> Corporate Folio
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-sans font-semibold rounded-full">{chargesA.length}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFolioLedgerTab('folio-b')}
                        className={`px-3 py-2.5 border-b-2 text-xs uppercase tracking-wider transition-all duration-200 font-semibold flex items-center gap-1.5 cursor-pointer ${
                          activeFolioLedgerTab === 'folio-b'
                            ? 'border-amber-600 text-amber-700 font-bold'
                            : 'border-transparent text-slate-400 hover:text-amber-600/80'
                        }`}
                      >
                        <User size={12} /> Individual Folio
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-xs text-amber-700 font-sans font-semibold rounded-full">{chargesB.length}</span>
                      </button>
                    </>
                  </div>

                  {/* ACTIVE TAB LEDGER GRAPHICS SHEET */}
                  <div className="p-6 border border-slate-200 bg-gradient-to-br from-slate-50 to-white rounded-2xl space-y-5 font-mono text-xs text-slate-600 leading-normal shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between font-sans items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{hotelNameVal}</h4>
                        <p className="text-xs text-slate-400">{hotelAddressVal}</p>
                        {(hotelTinVal || hotelVatNoVal) && (
                          <div className="text-xs text-slate-400 font-mono mt-2 space-x-2 leading-tight">
                            {hotelTinVal && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>TIN: {hotelTinVal}</span>}
                            {hotelVatNoVal && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>VAT: {hotelVatNoVal}</span>}
                            {hotelVatDateVal && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>({hotelVatDateVal})</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                          activeFolioLedgerTab === 'folio-a' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : activeFolioLedgerTab === 'folio-b' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {activeFolioLedgerTab === 'folio-a' && <Briefcase size={12} />}
                          {activeFolioLedgerTab === 'folio-b' && <User size={12} />}
                          {activeFolioLedgerTab === 'folio-a' ? 'Corporate Folio' : activeFolioLedgerTab === 'folio-b' ? 'Individual Folio' : 'Consolidated'}
                        </div>
                        {activeProfile?.corporateBillingOnly && activeFolioLedgerTab !== 'consolidated' && (
                          <span className="text-xs text-slate-400 italic block mt-1">Automated routing applied</span>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-xs uppercase text-slate-400 block font-sans font-semibold tracking-wider">BILL TO CLIENT</span>
                        {activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId ? (
                          <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-lg">
                            <strong className="text-indigo-950 font-sans font-bold text-sm block">
                              {corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.companyName || 'Corporate Account'}
                            </strong>
                            <div className="text-slate-600 font-sans text-xs mt-1">Guest Resident: {currentFolioRes.guestName}</div>
                            {corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.tinNumber && (
                              <div className="text-slate-500 text-xs mt-1 font-mono">Corporate TIN: {corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.tinNumber}</div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <strong className="text-slate-800 font-bold text-sm block">{currentFolioRes.guestName}</strong>
                            <div className="text-slate-500 text-xs mt-1">{currentFolioRes.guestEmail}</div>
                            {(currentFolioRes.guestTin || currentFolioRes.guestVatNo) && (
                              <div className="text-xs text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200 leading-tight">
                                {currentFolioRes.guestTin && <div>TIN: {currentFolioRes.guestTin}</div>}
                                {currentFolioRes.guestVatNo && <div>VAT Reg. No: {currentFolioRes.guestVatNo} {currentFolioRes.guestVatDate && `(${currentFolioRes.guestVatDate})`}</div>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs uppercase text-slate-400 block font-sans font-semibold tracking-wider">FOLIO LEDGER #</span>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <strong className="text-slate-900 font-bold text-sm block">
                            INV-{currentFolioRes.id}-{currentFolioRes.roomNumber || '000'}
                            {activeFolioLedgerTab === 'folio-a' ? '-A' : activeFolioLedgerTab === 'folio-b' ? '-B' : ''}
                          </strong>
                          <div className="text-slate-500 text-xs mt-1">Operating Date: {currentSystemDate}</div>
                          {activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId && (
                            <div className="text-indigo-700 font-semibold text-xs font-sans mt-1 flex items-center gap-1">
                              <Briefcase size={12} /> Direct Billing Offset Account Ledger
                            </div>
                          )}
                          {currentFolioRes.status === 'CheckedIn' && (
                            <div className="mt-2 flex items-center gap-2 font-sans">
                              <span className="text-xs uppercase text-slate-400 font-semibold">Room:</span>
                              <strong className="text-slate-900 text-xs">{currentFolioRes.roomNumber || 'N/A'}</strong>
                              <select
                                className="text-xs px-2 py-1 border border-slate-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                value=""
                                onChange={async (e) => {
                                  const newRoom = e.target.value;
                                  if (!newRoom) return;
                                  if (window.confirm(`Move ${currentFolioRes.guestName} from Room ${currentFolioRes.roomNumber || 'N/A'} to Room ${newRoom}?`)) {
                                    await changeRoom(currentFolioRes.id, newRoom);
                                    setFolioSuccess(`Moved ${currentFolioRes.guestName} to Room ${newRoom}.`);
                                    setTimeout(() => setFolioSuccess(''), 4000);
                                  }
                                }}
                              >
                                <option value="">Change room…</option>
                                {rooms
                                  .filter(r =>
                                    r.number !== currentFolioRes.roomNumber &&
                                    r.status !== 'Out of Order' &&
                                    !reservations.some(res => res.id !== currentFolioRes.id && res.status === 'CheckedIn' && res.roomNumber === r.number)
                                  )
                                  .map(r => (
                                    <option key={r.number} value={r.number}>
                                      Room {r.number} ({r.type}) - {r.status}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ITEMIZED CHARGES FOR THIS SPECIFIC VIEW TAB */}
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
                      <span className="text-xs uppercase text-slate-400 font-sans font-semibold tracking-wider block">Itemized Charges</span>
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                              <th className="py-3 px-4">Charge Item Line Details</th>
                              <th className="py-3 px-3 text-center w-28">Route Category</th>
                              <th className="py-3 px-3 text-center w-32">Assigned Folio</th>
                              <th className="py-3 px-3 text-right w-28">Amount</th>
                              <th className="py-3 px-3 w-20"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-mono">
                        {(activeFolioLedgerTab === 'folio-a' 
                            ? chargesA 
                            : activeFolioLedgerTab === 'folio-b' 
                              ? chargesB 
                              : (currentFolioRes.charges || [])
                         ).map(charge => (
                          <tr key={charge.id} className={`hover:bg-slate-50 transition-colors duration-150 ${charge.isVoided ? 'opacity-50 line-through text-slate-400 bg-rose-50/30' : ''}`}>
                            <td className="py-3 px-4 font-semibold font-sans">
                              {charge.description} {charge.isVoided && <span className="text-rose-500 font-bold ml-2 px-2 py-0.5 bg-rose-100 rounded text-xs">(VOID)</span>}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold capitalize ${
                                charge.type === 'Room' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : charge.type === 'F&B'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : charge.type === 'Minibar'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {charge.type || 'Other'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {!charge.isVoided && currentFolioRes.status === 'CheckedIn' ? (
                                <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shadow-sm" role="group">
                                  <button
                                    type="button"
                                    onClick={() => editFolioCharge(currentFolioRes.id, charge.id, { targetFolio: 'A' })}
                                    className={`px-3 py-1.5 text-xs font-sans font-semibold transition-all duration-200 rounded-md cursor-pointer ${
                                      getChargeFolio(charge, activeProfile, billingMode, activeGroupChargeTypes) === 'A'
                                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                        : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title="Route custom charge directly to Corporate Folio (Corporate account debtor liability)"
                                  >
                                    <Briefcase size={10} className="inline mr-1" /> Corp
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => editFolioCharge(currentFolioRes.id, charge.id, { targetFolio: 'B' })}
                                    className={`px-3 py-1.5 text-xs font-sans font-semibold transition-all duration-200 rounded-md cursor-pointer ml-0.5 ${
                                      getChargeFolio(charge, activeProfile, billingMode, activeGroupChargeTypes) === 'B'
                                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                                        : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title="Route custom charge directly to Individual Folio (Guest checkout card/cash liability)"
                                  >
                                    <User size={10} className="inline mr-1" /> Ind
                                  </button>
                                </div>
                              ) : charge.isVoided ? (
                                <span className="text-slate-300">-</span>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold uppercase ${
                                  getChargeFolio(charge, activeProfile, billingMode, activeGroupChargeTypes) === 'A'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {getChargeFolio(charge, activeProfile, billingMode, activeGroupChargeTypes) === 'A' ? 'Corporate' : 'Individual'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold">
                              {editChargeId === charge.id && !charge.isVoided ? (
                                <div className="flex justify-end gap-1.5 items-center">
                                  <span className="text-slate-400">{currency === 'USD' ? '$' : 'Br'}</span>
                                  <input 
                                    type="number" 
                                    className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                                    value={editAmount} 
                                    onChange={(e) => setEditAmount(Number(e.target.value))} 
                                  />
                                  <button onClick={() => { editFolioCharge(currentFolioRes.id, charge.id, { amount: editAmount }); setEditChargeId(null); }} className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors duration-200"><Check size={14}/></button>
                                  <button onClick={() => setEditChargeId(null)} className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors duration-200"><X size={14}/></button>
                                </div>
                              ) : (
                                <span className="text-slate-900">{formatAmount(charge.amount)}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right space-x-1 w-20">
                              {!charge.isVoided && currentFolioRes.status === 'CheckedIn' && (
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => { setEditChargeId(charge.id); setEditAmount(charge.amount); setMoveChargeId(null); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200" title="Edit Amount">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => { voidFolioCharge(currentFolioRes.id, charge.id); setMoveChargeId(null); setEditChargeId(null); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200" title="Void Charge">
                                    <Ban size={14} />
                                  </button>
                                  <button onClick={() => { setMoveChargeId(moveChargeId === charge.id ? null : charge.id); setEditChargeId(null); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200" title="Move Charge to Another Folio">
                                    <CornerUpRight size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {(activeFolioLedgerTab === 'folio-a' ? chargesA : activeFolioLedgerTab === 'folio-b' ? chargesB : chargesAll).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 italic font-sans text-xs">
                              <div className="flex flex-col items-center gap-2">
                                <Sliders size={24} className="text-slate-300" />
                                No items on this sub-folio ledger.
                              </div>
                            </td>
                          </tr>
                        )}

                        {moveChargeId && (
                          <tr>
                            <td colSpan={5} className="py-3 bg-amber-50">
                               <div className="flex items-center gap-3 justify-end px-4">
                                 <span className="text-amber-800 text-xs font-sans font-semibold">Move Selected Charge to Another Guest Folio:</span>
                                 <select 
                                   className="text-xs px-3 py-2 border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                   onChange={async (e) => {
                                     if (e.target.value) {
                                       await moveFolioCharge(currentFolioRes.id, e.target.value, moveChargeId);
                                       setMoveChargeId(null);
                                     }
                                   }}
                                 >
                                   <option value="">Select Room Folio...</option>
                                   {checkedInReservations.filter(r => r.id !== currentFolioRes.id).map(r => (
                                     <option key={r.id} value={r.id}>Room {r.roomNumber} - {r.guestName}</option>
                                   ))}
                                 </select>
                                 <button onClick={() => setMoveChargeId(null)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-all duration-200"><X size={14}/></button>
                               </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                      </div>
                    </div>

                    {/* PAYMENTS MATCHING THIS VIEW TAB */}
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                      <span className="text-xs uppercase text-slate-400 font-sans font-semibold tracking-wider block">Receipt Settlement Credits ({activeFolioLedgerTab === 'folio-a' ? 'Corporate Ledger' : activeFolioLedgerTab === 'folio-b' ? 'Individual Ledger' : 'Consolidated'})</span>
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                              <th className="py-3 px-4">Payment Method Line</th>
                              <th className="py-3 px-3 text-right w-28 font-semibold">Amount</th>
                              <th className="py-3 px-3 w-20"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-mono">
                          {(activeFolioLedgerTab === 'folio-a' 
                              ? paymentsA 
                              : activeFolioLedgerTab === 'folio-b' 
                                ? paymentsB 
                                : paymentsAll
                           ).length > 0 ? (
                            (activeFolioLedgerTab === 'folio-a' ? paymentsA : activeFolioLedgerTab === 'folio-b' ? paymentsB : paymentsAll).map(payment => (
                              <tr key={payment.id} className={`hover:bg-slate-50 transition-colors duration-150 ${payment.isVoided ? 'opacity-50 line-through text-slate-400 bg-rose-50/30' : ''}`}>
                                <td className="py-3 px-4 font-semibold text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <CreditCard size={12} className="text-emerald-500" />
                                    <span>Paid via {payment.method}</span>
                                    {payment.notes && <span className="text-slate-400">({payment.notes})</span>}
                                    {payment.isVoided && <span className="text-rose-500 font-bold ml-2 px-2 py-0.5 bg-rose-100 rounded text-xs">(VOID)</span>}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-slate-700">
                                  <span>{formatAmount(payment.amount)}</span>
                                </td>
                                <td className="py-3 px-3 text-right w-20">
                                  {!payment.isVoided && currentFolioRes.status === 'CheckedIn' && (
                                    <button 
                                      onClick={() => voidFolioPayment(currentFolioRes.id, payment.id)} 
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer" 
                                      title="Void Payment Receipt"
                                    >
                                      <Ban size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-12 text-slate-400 italic text-center font-sans text-xs">
                                <div className="flex flex-col items-center gap-2">
                                  <CreditCard size={24} className="text-slate-300" />
                                  No credits posted towards this sub-ledger view.
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* DYNAMIC REACTIVE LEDGER MATH BREAKBOARD */}
                    <div className="space-y-2 pt-2 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Itemized Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatAmount(activeTabSubtotal)}</span>
                      </div>
                      {discPct > 0 && (
                        <div className="flex justify-between items-center text-rose-600">
                          <span>Direct Discount Applied ({discPct}%)</span>
                          <span className="font-semibold">-{formatAmount(activeTabDiscount)}</span>
                        </div>
                      )}

                      {/* DYNAMIC FEE COMPONENTS */}
                      {(activeTabFeeBreakdown || []).map((fee: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-slate-500">
                          <span>{fee.name} ({fee.type === 'percentage' ? (fee.type === 'percentage' && fee.value ? fee.value + '%' : fee.type) : 'Fixed'})</span>
                          <span className="font-semibold text-slate-700">+{formatAmount(fee.amount)}</span>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center text-slate-700 font-bold border-b border-slate-200 pb-2 pt-2">
                        <span>Adjusted Total Ledger Spend</span>
                        <span className="font-semibold text-slate-900">{formatAmount(activeTabTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Total Settled Payments & Credits</span>
                        <span className="font-semibold">-{formatAmount(activeTabTotalPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-3 border-t-2 border-slate-200 font-sans">
                        <span>Remaining Ledger Balance Due</span>
                        <span className={`px-3 py-1 rounded-lg ${activeTabBalance > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                          {formatAmount(activeTabBalance)} {activeTabBalance === 0 && ' (Settled in Full)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION DIRECT BILLING WORKFLOW FOOTER */}
            {currentFolioRes && currentFolioRes.status === 'CheckedIn' && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 mt-6 font-sans">
                {/* DIRECT BILLING QUICK SETTLE TRIGGER FOR CORPORATE FOLIO */}
                {activeFolioLedgerTab === 'folio-a' && remainingBalanceA > 0 && (activeProfile?.corporateBillingOnly || chargesA.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const selectedCorp = corporateAccounts.find((c: any) => c.id === splitCorporateAccountId);
                      if (!selectedCorp) {
                        alert("Please select a Corporate Debtor Account first.");
                        return;
                      }
                      
                      // Post a payment to reservation specifically identified as corporate settlement
                      addFolioPayment(currentFolioRes.id, {
                        amount: remainingBalanceA,
                        method: 'Corporate Account Settle',
                        notes: `Corporate Folio direct-billed to corporate debtor: ${selectedCorp.companyName}`
                      });
                      
                      // Update corporate account ledger balance
                      const currentBal = selectedCorp.unpaidBalance || 0;
                      updateCorporateAccount(selectedCorp.id, {
                        unpaidBalance: currentBal + remainingBalanceA
                      });
                      
                      setFolioSuccess(`Corporate Folio outstanding balance of ${formatAmount(remainingBalanceA)} has been successfully direct-billed to ${selectedCorp.companyName} ledger account!`);
                      setTimeout(() => setFolioSuccess(''), 5000);
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans font-semibold rounded-lg text-xs transition-all duration-200 shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase size={14} />
                    Direct Bill Corporate Folio
                  </button>
                )}

                {activeFolioLedgerTab === 'folio-b' && remainingBalanceB > 0 && (
                  <div className="text-xs text-slate-500 font-sans italic self-start flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" />
                    Collect {formatAmount(remainingBalanceB)} from resident physically at desk before checking out.
                  </div>
                )}

                {/* MAIN CHECKOUT SQUEEZE TRIGGER */}
                <div className="flex gap-3 w-full sm:w-auto justify-end ml-auto">
                  {(activeProfile?.corporateBillingOnly || chargesA.length > 0) ? (
                    <button
                      onClick={() => {
                        // Intelligent complete billing split resolver
                        const selectedCorp = corporateAccounts.find((c: any) => c.id === splitCorporateAccountId);
                        if (!selectedCorp && remainingBalanceA > 0) {
                          alert("Select a valid Corporate Account debtor to route the Corporate Folio to.");
                          return;
                        }

                        // 1. Process Corporate Folio settlement to corporate if unpaid
                        if (remainingBalanceA > 0 && selectedCorp) {
                          addFolioPayment(currentFolioRes.id, {
                            amount: remainingBalanceA,
                            method: 'Corporate Account Settle',
                            notes: `Auto-split checkout transfer to ${selectedCorp.companyName} accounts ledger.`
                          });
                          const prevBal = selectedCorp.unpaidBalance || 0;
                          updateCorporateAccount(selectedCorp.id, {
                            unpaidBalance: prevBal + remainingBalanceA
                          });
                        }

                        // 2. Process Individual Folio checkout payment with general credit/cash method
                        if (remainingBalanceB > 0) {
                          addFolioPayment(currentFolioRes.id, {
                            amount: remainingBalanceB,
                            method: paymentMethod || 'Credit Card',
                            notes: `Individual Folio guest split checkout settlement via ${paymentMethod}`
                          });
                        }

                        // 3. Complete Checkout operation
                        checkOutReservation(currentFolioRes.id);
                        setFolioSuccess("Checkout successfully completed! Corporate split and guest payments automatically balanced and recorded.");
                        
                        // 4. Auto-generate invoice
                        handleGenerateInvoice();
                        setTimeout(() => setFolioSuccess(''), 5000);
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans font-semibold rounded-lg text-sm transition-all duration-200 shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard size={14} /> 
                      Split-Checkout & Auto-Settle Both
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Simple check out settlement
                        if (remainingBalance > 0) {
                          addFolioPayment(currentFolioRes.id, {
                            amount: remainingBalance,
                            method: paymentMethod || 'Credit Card',
                            notes: `Consolidated checkout billing payment via ${paymentMethod}`
                          });
                        }
                        checkOutReservation(currentFolioRes.id);
                        setFolioSuccess("Integrated checkout finished!");
                        setTimeout(() => setFolioSuccess(''), 4000);
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-sans font-semibold rounded-lg text-sm transition-all duration-200 shadow-md shadow-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard size={14} /> 
                      {remainingBalance > 0 
                        ? `Complete Checkout & Pay ${formatAmount(remainingBalance)}` 
                        : "Complete Checkout (Fully Paid)"
                      }
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {currentFolioRes && currentFolioRes.status !== 'CheckedIn' && (
              <div className="p-5 mt-6 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-sans font-semibold flex items-center gap-3 justify-center">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Check size={20} className="text-emerald-600" />
                </div>
                This guest ledger is completely finalized and checkout operations are closed.
              </div>
            )}
              </>
            )}
          </div>
        </div>

      {/* Full-screen Elegant Printable Invoice Modal */}
      {showPrintView && currentFolioRes && (
        <UnifiedInvoiceTemplate 
          title={
            activeFolioLedgerTab === 'folio-a'
              ? "GUEST CORPORATE FOLIO LEDGER"
              : activeFolioLedgerTab === 'folio-b'
                ? "GUEST INDIVIDUAL FOLIO LEDGER"
                : "GUEST SYSTEM CONSOLIDATED FOLIO LEDGER"
          }
          invoiceNumber={`INV-${currentFolioRes.id}-${currentFolioRes.roomNumber || "000"}${
            activeFolioLedgerTab === 'folio-a' ? '-A' : activeFolioLedgerTab === 'folio-b' ? '-B' : ''
          }`}
          date={currentSystemDate}
          customerName={
            activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId
              ? `${currentFolioRes.guestName} / Corporate Target: ${corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.companyName || 'Corporate Ledger'}`
              : currentFolioRes.guestName
          }
          customerEmail={currentFolioRes.guestEmail}
          roomNo={currentFolioRes.roomNumber}
          customerTin={
            activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId
              ? corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.tinNumber || currentFolioRes.guestTin
              : currentFolioRes.guestTin
          }
          customerVatNo={
            activeFolioLedgerTab === 'folio-a' && splitCorporateAccountId
              ? corporateAccounts.find((c: any) => c.id === splitCorporateAccountId)?.vatNumber || currentFolioRes.guestVatNo
              : currentFolioRes.guestVatNo
          }
          customerVatDate={currentFolioRes.guestVatDate}
          items={(
            activeFolioLedgerTab === 'folio-a' 
              ? chargesA 
              : activeFolioLedgerTab === 'folio-b' 
                ? chargesB 
                : chargesAll.filter(c => !c.isVoided)
          ).map(charge => ({
            productName: charge.description,
            quantity: 1,
            price: charge.amount
          }))}
          subtotal={activeTabSubtotal}
          fees={[
            ...(discPct > 0 ? [{ label: `Discount (-${discPct}%)`, amount: -activeTabDiscount }] : []),
            ...(activeTabFeeBreakdown || []).map((fee: any) => ({ label: `${fee.name}${fee.type === 'percentage' ? ' (' + (fee.value || '') + '%)' : ''}`, amount: fee.amount }))
          ]}
          total={activeTabTotal}
          payments={(
            activeFolioLedgerTab === 'folio-a' 
              ? paymentsA 
              : activeFolioLedgerTab === 'folio-b' 
                ? paymentsB 
                : paymentsAll
          ).map(payment => ({
            method: payment.method,
            amount: payment.amount,
            notes: payment.notes
          }))}
          balanceDue={activeTabBalance}
          onClose={() => setShowPrintView(false)}
          footerMessage={
            activeFolioLedgerTab === 'folio-a'
              ? "This Corporate Folio represents approved room tariff corporate obligations settled via Direct Billing offset."
              : activeFolioLedgerTab === 'folio-b'
                ? "This Individual Folio represents discretionary guest incidentals which were fully settled via personal currency payment."
                : "Standard guest consolidated accounting ledger. Please keep this invoice for your archives."
          }
        />
      )}

      {/* Full-screen Elegant Consolidated Group Master Invoice Modal */}
      {showGroupPrintView && selectedGroupKey && (
        <UnifiedInvoiceTemplate
          title={
            groupType === 'corporate'
              ? `CONSOLIDATED CORPORATE LEDGER — ${selectedCorpDetails?.companyName?.toUpperCase()}`
              : `CONSOLIDATED TOUR GROUP BLOCK LEDGER — ${selectedGroupDetails?.groupName?.toUpperCase()}`
          }
          invoiceNumber={`CON-${groupId}-${Date.now().toString().slice(-4)}`}
          date={currentSystemDate}
          customerName={
            groupType === 'corporate'
              ? selectedCorpDetails?.companyName || 'Corporate Ledger'
              : selectedGroupDetails?.groupName || 'Tour Operator Ledger'
          }
          customerEmail={
            groupType === 'corporate'
              ? selectedCorpDetails?.contactEmail || ''
              : selectedGroupDetails?.contactEmail || ''
          }
          roomNo={
            groupInHouseReservations.map(r => r.roomNumber || 'Pre').slice(0, 8).join(', ') + 
            (groupInHouseReservations.length > 8 ? '...' : '')
          }
          customerTin={groupType === 'corporate' ? selectedCorpDetails?.tinNumber : undefined}
          customerVatNo={groupType === 'corporate' ? selectedCorpDetails?.vatNumber : undefined}
          items={groupInHouseReservations.flatMap(res => {
            const math = calculateReservationFolioMath(res);
            return [
              {
                productName: `Room ${res.roomNumber || 'N/A'} - ${res.guestName}: Room Tariff & Approved Charges (Corporate Folio)`,
                quantity: 1,
                price: math.totalA
              },
              {
                productName: `Room ${res.roomNumber || 'N/A'} - ${res.guestName}: Guest Incidentals & Services (Individual Folio)`,
                quantity: 1,
                price: math.totalB
              }
            ];
          })}
          subtotal={
            groupInHouseReservations.reduce((sum, r) => sum + calculateReservationFolioMath(r).totalA + calculateReservationFolioMath(r).totalB, 0)
          }
          fees={[]}
          total={
            groupInHouseReservations.reduce((sum, r) => sum + calculateReservationFolioMath(r).adjustedTotal, 0)
          }
          payments={groupInHouseReservations.flatMap(res => {
            const math = calculateReservationFolioMath(res);
            return [
              ...(math.paymentsA || []),
              ...(math.paymentsB || [])
            ];
          }).map(p => ({
            method: p.method,
            amount: p.amount,
            notes: p.notes
          }))}
          balanceDue={
            groupInHouseReservations.reduce((sum, r) => sum + calculateReservationFolioMath(r).remainingBalance, 0)
          }
          onClose={() => setShowGroupPrintView(false)}
          footerMessage={`Consolidated billing breakdown of all ${groupInHouseReservations.length} in-house room blocks routing through ${groupType === 'corporate' ? 'corporate direct account' : 'operator charter'} sponsor arrangement.`}
        />
      )}
    </div>
  );
}
