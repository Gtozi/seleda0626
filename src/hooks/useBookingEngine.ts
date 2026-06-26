/**
 * useBookingEngine
 * Encapsulates all public booking business logic (dates, availability,
 * pricing, cart, guest profile creation, group bookings, confirmation email
 * and terms state) so presentational components can stay declarative.
 *
 * This powers the public booking blocks and any future booking surfaces
 * without duplicating the reservation logic.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useERP } from '../context/ERPContext';
import { RoomType } from '../types/erp';
import { toISODate } from '../utils/date';

export interface ExperienceService {
  id: string;
  name: string;
  price: number;
  desc?: string;
}

export function useBookingEngine() {
  const {
    addReservation,
    addFolioPayment,
    addGuest,
    addGroupBooking,
    promotions,
    formatAmount,
    formatTaxesAndFees,
    globalHotelSettings,
    rooms,
    packages,
    getTypeAvailability,
    ratePlans,
    seasons,
    addDispatchedEmail,
    guests,
  } = useERP();

  const todayStr = useMemo(() => toISODate(), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }, []);

  // Reservation form state
  const [bIn, setBIn] = useState(todayStr);
  const [bOut, setBOut] = useState(tomorrowStr);
  const [bAdults, setBAdults] = useState(2);
  const [bChildren, setBChildren] = useState(0);
  const [bCode, setBCode] = useState('');

  const [selectedTypeQuantities, setSelectedTypeQuantities] = useState<Record<RoomType, number>>({
    Single: 0,
    Double: 0,
    Deluxe: 0,
    Suite: 0,
    Penthouse: 0,
  });
  const [expandedRoomType, setExpandedRoomType] = useState<RoomType | null>(null);
  const [showPayScreen, setShowPayScreen] = useState(false);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState(() => {
    const std = ratePlans.find(r => r.baseModifier === 1.0 && r.active);
    return std ? std.id : (ratePlans.find(r => r.active)?.id || '');
  });

  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gRequests, setGRequests] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [payLoading, setPayLoading] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [viewTab, setViewTab] = useState<'booking' | 'terms'>('booking');
  const [termsSearchQuery, setTermsSearchQuery] = useState('');
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0);
  const [submitError, setSubmitError] = useState('');

  // Derive base price per room type from live ERP inventory
  const typeToBasePrice = useMemo(() => {
    const map: Record<string, number> = {};
    const counts: Record<string, number> = {};
    rooms.forEach(r => {
      map[r.type] = (map[r.type] || 0) + r.rate;
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    Object.keys(map).forEach(type => { map[type] = Math.round(map[type] / (counts[type] || 1)); });
    return map;
  }, [rooms]);

  const bungalowOffers = useMemo(() => {
    const typeMap = new Map<string, { title: string; desc: string; imgUrl: string; amenities: string[]; basePrice: number }>();
    rooms.forEach(r => {
      const existing = typeMap.get(r.type);
      if (!existing) {
        typeMap.set(r.type, { title: r.type, desc: '', imgUrl: '', amenities: [...r.features], basePrice: typeToBasePrice[r.type] || r.rate });
      } else {
        r.features.forEach(f => { if (!existing.amenities.includes(f)) existing.amenities.push(f); });
      }
    });
    return Array.from(typeMap.entries()).map(([type, data]) => ({ type, ...data }));
  }, [rooms, typeToBasePrice]);

  const typeAvailability = useMemo(() => {
    const map: Record<string, { available: number; capacity: number }> = {};
    bungalowOffers.forEach(offer => {
      const av = getTypeAvailability(offer.type, bIn, bOut);
      map[offer.type] = { available: av.available, capacity: av.capacity };
    });
    return map;
  }, [bungalowOffers, bIn, bOut, getTypeAvailability]);

  // Auto-cap selected quantities when availability shrinks
  useEffect(() => {
    setSelectedTypeQuantities(prev => {
      const next: Record<string, number> = { ...prev };
      let changed = false;
      (Object.keys(prev) as RoomType[]).forEach(type => {
        const avail = typeAvailability[type]?.available ?? 0;
        if ((prev[type] || 0) > avail) {
          next[type] = avail;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [typeAvailability]);

  const experiences: ExperienceService[] = useMemo(() => {
    return packages.map(p => ({ id: p.id, name: p.name, price: p.price, desc: p.description }));
  }, [packages]);

  const getDays = useCallback(() => {
    const start = new Date(bIn);
    const end = new Date(bOut);
    const diff = end.getTime() - start.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return isNaN(days) || days <= 0 ? 1 : Math.round(days);
  }, [bIn, bOut]);

  const activeSeason = useMemo(() => {
    const d = new Date(bIn);
    return seasons.find(s => {
      const start = new Date(d.getFullYear(), s.startMonth, s.startDay);
      const end = new Date(d.getFullYear(), s.endMonth, s.endDay);
      if (start > end) {
        return d >= start || d <= end;
      }
      return d >= start && d <= end;
    });
  }, [bIn, seasons]);
  const seasonMultiplier = activeSeason ? activeSeason.multiplier : 1;
  const seasonName = activeSeason ? activeSeason.name : '';

  const activeRatePlan = ratePlans.find(r => r.id === selectedRatePlanId && r.active);
  const ratePlanModifier = activeRatePlan ? activeRatePlan.baseModifier : 1;
  const ratePlanName = activeRatePlan ? activeRatePlan.name : 'Standard Rate';

  const getPromoMultiplier = useCallback((type: RoomType) => {
    const promo = promotions.find(p => p.code.toUpperCase() === bCode.toUpperCase() && p.active && p.appliesTo?.includes(type));
    if (promo) return 1 - promo.discountPercent / 100;
    return 1;
  }, [promotions, bCode]);

  const getFinalPriceForType = useCallback((type: RoomType, base: number) => {
    return Math.round(base * seasonMultiplier * ratePlanModifier * getPromoMultiplier(type));
  }, [seasonMultiplier, ratePlanModifier, getPromoMultiplier]);

  const getPriceForType = useCallback((base: number, type: RoomType) => {
    return Math.round(base * seasonMultiplier * ratePlanModifier * getPromoMultiplier(type));
  }, [seasonMultiplier, ratePlanModifier, getPromoMultiplier]);

  const finalRoomTotal = useMemo(() => bungalowOffers.reduce((acc, offer) => {
    const qty = selectedTypeQuantities[offer.type] || 0;
    if (qty <= 0) return acc;
    const individualPrice = getFinalPriceForType(offer.type, offer.basePrice);
    return acc + (individualPrice * getDays() * qty);
  }, 0), [bungalowOffers, selectedTypeQuantities, getFinalPriceForType, getDays]);

  const addonsPriceTotal = useMemo(() => selectedActivities.reduce((acc, actId) => {
    const item = experiences.find(s => s.id === actId);
    return acc + (item ? item.price : 0);
  }, 0) * (bAdults + bChildren), [selectedActivities, experiences, bAdults, bChildren]);

  const finalTotalPriceBeforeTax = finalRoomTotal + addonsPriceTotal;
  const taxesObj = formatTaxesAndFees(finalTotalPriceBeforeTax);

  const totalSelectedRooms = (Object.keys(selectedTypeQuantities) as RoomType[])
    .reduce((sum, key) => sum + (selectedTypeQuantities[key] || 0), 0);

  const toggleActivity = useCallback((actId: string) => {
    setSelectedActivities(prev => prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]);
  }, []);

  const incrementRoom = useCallback((type: RoomType) => {
    setSelectedTypeQuantities(prev => ({
      ...prev,
      [type]: Math.min((prev[type] || 0) + 1, typeAvailability[type]?.available ?? 0),
    }));
  }, [typeAvailability]);

  const decrementRoom = useCallback((type: RoomType) => {
    setSelectedTypeQuantities(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedTypeQuantities({ Single: 0, Double: 0, Deluxe: 0, Suite: 0, Penthouse: 0 });
    setShowPayScreen(false);
    setSuccessBookingId(null);
    setGName('');
    setGEmail('');
    setGPhone('');
    setGRequests('');
    setSelectedActivities([]);
    setBChildren(0);
    setSubmitError('');
  }, []);

  const canSubmit =
    gName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gEmail.trim()) &&
    acceptedTerms &&
    totalSelectedRooms > 0;

  const handleBookingConfirm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const totalSelected = (Object.keys(selectedTypeQuantities) as RoomType[]).reduce((sum, key) => sum + (selectedTypeQuantities[key] || 0), 0);
    if (totalSelected === 0) { setSubmitError('Please select at least 1 room.'); return; }
    if (!gName.trim() || gName.trim().length < 2) { setSubmitError('Guest name is required (min 2 characters).'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gEmail.trim())) { setSubmitError('Please enter a valid email address.'); return; }
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
    if (gPhone.trim() && !phoneRegex.test(gPhone.trim())) { setSubmitError('Please enter a valid phone number.'); return; }
    if (!acceptedTerms) { setSubmitError('You must accept the terms and conditions to proceed.'); return; }
    if (new Date(bOut) <= new Date(bIn)) { setSubmitError('Check-out date must be after check-in date.'); return; }

    const overbooked = (Object.keys(selectedTypeQuantities) as RoomType[]).some(type => {
      const qty = selectedTypeQuantities[type] || 0;
      if (qty <= 0) return false;
      const avail = getTypeAvailability(type, bIn, bOut).available;
      return qty > avail;
    });
    if (overbooked) { setSubmitError('Availability changed for your selected dates. Please review room quantities.'); return; }

    const now = Date.now();
    if (now - lastSubmitAt < 10000) { setSubmitError('Please wait a moment before submitting again.'); return; }

    setLastSubmitAt(now);
    setPayLoading(true);

    try {
      const selectedNames = selectedActivities
        .map(actId => experiences.find(a => a.id === actId)?.name)
        .filter(Boolean);

      const finalNotes = [
        gRequests,
        selectedNames.length > 0 ? `PREBOOKED SERVICES: ${selectedNames.join(', ')}` : '',
      ].filter(Boolean).join(' | ');

      const totalBookedCount = totalSelected;
      const createdIds: string[] = [];

      const roomTypeBreakdown = (Object.keys(selectedTypeQuantities) as RoomType[])
        .filter(type => (selectedTypeQuantities[type] || 0) > 0)
        .map(type => ({ roomType: type, count: selectedTypeQuantities[type] || 0 }));

      const primaryRoomType = roomTypeBreakdown[0]?.roomType || 'Double';

      let groupBookingId: string | undefined;
      if (totalBookedCount > 1) {
        const createdGroup = await addGroupBooking({
          groupName: gName,
          contactName: gName,
          contactEmail: gEmail,
          contactPhone: gPhone || '',
          roomTypeNeeded: primaryRoomType,
          roomCount: totalBookedCount,
          roomTypeBreakdown,
          checkInDate: bIn,
          checkOutDate: bOut,
          discountPercent: 0,
          status: 'Confirmed',
        });
        if (createdGroup) groupBookingId = createdGroup.id;
      }

      const existingGuest = guests.find(g => g.name.trim().toLowerCase() === gName.trim().toLowerCase());
      let guestId: string;
      if (existingGuest) {
        guestId = existingGuest.id;
      } else {
        guestId = addGuest({
          name: gName,
          email: gEmail,
          phone: gPhone,
          status: (bAdults + bChildren) > 2 || finalTotalPriceBeforeTax > (globalHotelSettings.vipSpendThreshold || 500) ? 'VIP' : 'Regular',
          loyaltyPoints: 0,
          specialRequests: gRequests,
          notes: `Direct website booking on ${new Date().toISOString()}.`,
          totalSpend: 0,
          history: [],
        });
      }

      (Object.keys(selectedTypeQuantities) as RoomType[]).forEach((type) => {
        const qty = selectedTypeQuantities[type] || 0;
        if (qty <= 0) return;

        const offer = bungalowOffers.find(o => o.type === type);
        const base = offer ? offer.basePrice : 120;
        const individualNightPrice = getFinalPriceForType(type, base);
        const individualTotalWithActivity = individualNightPrice * getDays() + Math.round(addonsPriceTotal / (totalBookedCount > 0 ? totalBookedCount : 1));

        for (let i = 0; i < qty; i++) {
          const resId = addReservation({
            guestName: gName,
            guestEmail: gEmail,
            guestPhone: gPhone,
            guestStatus: bAdults > 2 || finalTotalPriceBeforeTax > 500 ? 'VIP' : 'Regular',
            roomType: type,
            checkInDate: bIn,
            checkOutDate: bOut,
            adults: Math.max(1, Math.round(bAdults / (totalBookedCount > 0 ? totalBookedCount : 1))),
            children: Math.round(bChildren / (totalBookedCount > 0 ? totalBookedCount : 1)),
            status: 'Waitlisted',
            rate: individualNightPrice,
            totalAmount: individualTotalWithActivity,
            channel: 'Direct Website',
            paymentStatus: 'Unpaid',
            ratePlanId: selectedRatePlanId,
            guestId,
            groupBookingId,
            bookingGroupId: groupBookingId,
            isGroup: totalBookedCount > 1,
            notes: (totalBookedCount > 1 ? `${finalNotes} (Room ${i + 1} of ${qty} - ${type})` : finalNotes),
          });
          createdIds.push(resId);

          addFolioPayment(resId, {
            amount: individualTotalWithActivity,
            method: 'Pending Verification',
            description: 'Direct website booking — pending front office confirmation',
          });
        }
      });

      setSuccessBookingId(createdIds.join(', '));

      addDispatchedEmail({
        recipient: gEmail,
        subject: `Booking Confirmation - ${globalHotelSettings.customHotelName}`,
        body: `Dear ${gName},\n\nThank you for your booking request at ${globalHotelSettings.customHotelName}.\n\nReservation ID(s): ${createdIds.join(', ')}\nCheck-in: ${bIn}\nCheck-out: ${bOut}\nGuests: ${bAdults} Adults, ${bChildren} Children\nTotal: ${formatAmount(taxesObj.totalWithTaxes)}\n\nYour reservation is currently waitlisted. Our front office team will review and confirm your booking shortly.\n\nBest regards,\n${globalHotelSettings.customHotelName}`,
        status: 'Sent',
        type: 'BookingConfirmation',
      });
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitError('An error occurred while processing your booking. Please try again.');
    } finally {
      setPayLoading(false);
    }
  }, [
    selectedTypeQuantities, gName, gEmail, gPhone, gRequests, acceptedTerms, bIn, bOut, bAdults, bChildren,
    lastSubmitAt, selectedActivities, experiences, bungalowOffers, getFinalPriceForType, getDays, addonsPriceTotal,
    addGroupBooking, guests, addGuest, addReservation, addFolioPayment, addDispatchedEmail, selectedRatePlanId,
    finalTotalPriceBeforeTax, globalHotelSettings, formatAmount, taxesObj, getTypeAvailability,
  ]);

  return {
    // context passthrough (read-only display helpers)
    formatAmount,
    globalHotelSettings,
    promotions,
    // dates & occupancy
    todayStr, tomorrowStr,
    bIn, setBIn, bOut, setBOut,
    bAdults, setBAdults, bChildren, setBChildren,
    bCode, setBCode,
    getDays,
    // inventory & pricing
    bungalowOffers, typeAvailability, experiences,
    selectedTypeQuantities, setSelectedTypeQuantities,
    incrementRoom, decrementRoom,
    expandedRoomType, setExpandedRoomType,
    getPriceForType, getFinalPriceForType, getPromoMultiplier,
    seasonMultiplier, seasonName, ratePlanModifier, ratePlanName,
    selectedRatePlanId, setSelectedRatePlanId,
    finalRoomTotal, addonsPriceTotal, finalTotalPriceBeforeTax, taxesObj,
    totalSelectedRooms,
    // experiences
    selectedActivities, toggleActivity,
    // checkout
    showPayScreen, setShowPayScreen,
    gName, setGName, gEmail, setGEmail, gPhone, setGPhone, gRequests, setGRequests,
    payLoading, successBookingId, submitError,
    acceptedTerms, setAcceptedTerms,
    canSubmit, handleBookingConfirm, handleClose,
    // terms
    viewTab, setViewTab, termsSearchQuery, setTermsSearchQuery,
  };
}

export type BookingEngine = ReturnType<typeof useBookingEngine>;
