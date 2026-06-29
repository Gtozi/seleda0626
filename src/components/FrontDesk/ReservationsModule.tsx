import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { RoomType, Reservation, BookingChannel, ReservationStatus, RatePlan, Package, Season } from '../../types/erp';
import { rangesOverlap } from '../../services/allocationService';
import { toISODate } from '../../utils/date';
import ReservationsForecasting from './ReservationsForecasting';
import ModernCalendar from './ModernCalendar';
import SalesMarketingModule from './SalesMarketingModule';
import {
  Plus,
  Calendar,
  Globe,
  DollarSign,
  Users,
  Users2,
  Building2,
  Star,
  Search,
  Check,
  Tag,
  AlertCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCw,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Mail,
  ExternalLink,
  Send,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Megaphone
} from 'lucide-react';
import { calculateNights, calculateDailyRate, getSeasonalMultiplier } from '../../utils/billing';
import ReservationModal from './ReservationModal';
import { ReservationFormData } from '../../schemas/reservationSchema';

export default function ReservationsModule({ 
  onNavigateToCRM, 
  onProcessCheckout,
  onGroupCheckIn,
  onViewGuestProfile,
  currentUser
}: { 
  onNavigateToCRM?: (resData: { id: string, roomNumber?: string, guestName: string, guestEmail: string, guestPhone?: string, checkInDate: string }) => void;
  onProcessCheckout?: (resId: string) => void;
  onGroupCheckIn?: (data: { id: string, groupName: string, contactName: string, contactEmail: string, contactPhone: string, roomCount: number, checkInDate: string }) => void;
  onViewGuestProfile?: (guestId: string) => void;
  currentUser?: any;
}) {
  const {
    rooms,
    roomTypes,
    reservations,
    addReservation,
    guests,
    addGuest,
    updateGuestData,
    updateReservationStatus,
    assignRoomToReservation,
    checkInReservation,
    checkOutReservation,
    currentSystemDate,
    triggerLiveSyncSimulation,
    promotions,
    addPromotion,
    currency,
    formatAmount,
    updateReservation,
    updateDepositStatus,
    promoteFromWaitlist,
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
    corporateAccounts,
    groupBookings,
    addGroupBooking,
    updateGroupBookingStatus,
    dispatchedEmails,
    setPlatformView,
    setActiveGuestPortalResId,
    getTypeAvailability,
    yieldPolicies,
    addYieldPolicy,
    updateYieldPolicy,
    deleteYieldPolicy,
    globalHotelSettings
  } = useERP();

  // Screen Toggles
  const [activeTab, setActiveTab] = useState<'form' | 'calendar' | 'ota' | 'yield' | 'walkin' | 'pricing' | 'forecast' | 'sales'>('form');

  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [promotingGroupRes, setPromotingGroupRes] = useState<Reservation | null>(null);

  // All features allowed for all users
  const canViewRoomOutlook = true;
  const canViewRatePlans = true;
  const canEditRatePlans = true;
  const canViewSalesCampaigns = true;
  const canManageSalesCampaigns = true;

  // Dynamic Yield config state & rules (Now persisted in ERP context)
  const [demandTier, setDemandTier] = useState<string>('Standard');

  const getYieldMultiplier = () => {
    const activePolicy = yieldPolicies.find(p => p.id === demandTier);
    return activePolicy ? activePolicy.multiplier : 1.0;
  };

  const handleAddYieldPolicy = () => {
    const newPolicy = {
      name: 'New Custom Yield Tier',
      description: 'Custom occupancy or event rate adjustment rules.',
      multiplier: 1.20,
      isDefault: false
    };
    addYieldPolicy(newPolicy);
  };

  const handleUpdateYieldPolicy = (id: string, updates: Partial<{ name: string; description: string; multiplier: number }>) => {
    updateYieldPolicy(id, updates);
  };

  const handleDeleteYieldPolicy = (id: string) => {
    // If the active demand tier is being deleted, fallback to Standard
    if (demandTier === id) {
      setDemandTier('Standard');
    }
    deleteYieldPolicy(id);
  };

  // Rate/Package/Season Management Modals
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRatePlan, setEditingRatePlan] = useState<RatePlan | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const handleOpenRateModal = (plan: RatePlan | null = null) => {
    setEditingRatePlan(plan);
    setRpName(plan?.name || '');
    setRpDesc(plan?.description || '');
    setRpModifier(plan?.baseModifier || 1.0);
    setRpActive(plan?.active !== false);
    setIsRateModalOpen(true);
  };

  const handleOpenPackageModal = (pkg: Package | null = null) => {
    setEditingPackage(pkg);
    setPkgName(pkg?.name || '');
    setPkgDesc(pkg?.description || '');
    setPkgPrice(pkg?.price || 0);
    setPkgFrequency(pkg?.chargeFrequency || 'once');
    setIsPackageModalOpen(true);
  };

  const handleOpenSeasonModal = (season: Season | null = null) => {
    setEditingSeason(season);
    setSzName(season?.name || '');
    setSzStartMonth(season?.startMonth || 0);
    setSzStartDay(season?.startDay || 1);
    setSzEndMonth(season?.endMonth || 0);
    setSzEndDay(season?.endDay || 1);
    setSzMultiplier(season?.multiplier || 1.0);
    setIsSeasonModalOpen(true);
  };

  const handleSaveRatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      name: rpName,
      description: rpDesc,
      baseModifier: rpModifier,
      active: rpActive
    };
    if (editingRatePlan) updateRatePlan(editingRatePlan.id, planData);
    else addRatePlan(planData);
    setIsRateModalOpen(false);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const pkgData = {
      name: pkgName,
      description: pkgDesc,
      price: pkgPrice,
      chargeFrequency: pkgFrequency
    };
    if (editingPackage) updatePackage(editingPackage.id, pkgData);
    else addPackage(pkgData);
    setIsPackageModalOpen(false);
  };

  const handleSaveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    const szData = {
      name: szName,
      startMonth: szStartMonth,
      startDay: szStartDay,
      endMonth: szEndMonth,
      endDay: szEndDay,
      multiplier: szMultiplier
    };
    if (editingSeason) updateSeason(editingSeason.id, szData);
    else addSeason(szData);
    setIsSeasonModalOpen(false);
  };

  // Rate Plan Form State
  const [rpName, setRpName] = useState('');
  const [rpDesc, setRpDesc] = useState('');
  const [rpModifier, setRpModifier] = useState(1.0);
  const [rpActive, setRpActive] = useState(true);

  // Package Form State
  const [pkgName, setPkgName] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgPrice, setPkgPrice] = useState(0);
  const [pkgFrequency, setPkgFrequency] = useState<'once' | 'daily'>('once');

  // Season Form State
  const [szName, setSzName] = useState('');
  const [szStartMonth, setSzStartMonth] = useState(0);
  const [szStartDay, setSzStartDay] = useState(1);
  const [szEndMonth, setSzEndMonth] = useState(0);
  const [szEndDay, setSzEndDay] = useState(1);
  const [szMultiplier, setSzMultiplier] = useState(1.0);

  // Walk-in form states
  const [waName, setWaName] = useState('');
  const [waEmail, setWaEmail] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waType, setWaType] = useState<RoomType>('Double');
  const [waNights, setWaNights] = useState(1);
  const [waSuccess, setWaSuccess] = useState('');

  // Group booking expand/collapse state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'individual' | 'groups'>('all');

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const expandAllGroups = () => {
    const allGroupIds = new Set(
      reservations
        .filter(r => r.bookingGroupId || r.groupBookingId)
        .map(r => r.bookingGroupId || r.groupBookingId!)
        .filter(id => id)
    );
    setExpandedGroups(allGroupIds);
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  // Find a vacant clean room matching selected type for rapid walkin,
  // excluding rooms already assigned to a confirmed/checked-in reservation with overlapping dates.
  const walkInCheckIn = currentSystemDate;
  const walkInCheckOut = (() => {
    const d = new Date(currentSystemDate);
    d.setDate(d.getDate() + waNights);
    return toISODate(d);
  })();

  const availableRoomForWalkin = rooms.find(r => {
    if (r.type !== waType) return false;
    const conflict = reservations.some(res =>
      res.roomNumber === r.number &&
      (res.status === 'Confirmed' || res.status === 'CheckedIn') &&
      rangesOverlap(walkInCheckIn, walkInCheckOut, res.checkInDate, res.checkOutDate)
    );
    return !conflict;
  });

  // Get unique room types from rooms
  const uniqueRoomTypes = Array.from(new Set(rooms.map(r => r.type))).sort() as string[];

  // Get base rate for room type from actual rooms
  const getBaseRate = (roomType: string) => {
    const roomOfType = rooms.find(r => r.type === roomType);
    return roomOfType?.rate || 150;
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waName || !waEmail || !availableRoomForWalkin) return;

    // Reuse pre-computed dates
    const checkInStr = walkInCheckIn;
    const checkOutStr = walkInCheckOut;

    // Availability guard: prevent confirmed walk-ins beyond physical capacity for the stay dates
    const availability = getTypeAvailability(waType, checkInStr, checkOutStr);
    if (availability.available <= 0) {
      setWaSuccess(`Cannot check in: no ${waType} rooms available for ${checkInStr} → ${checkOutStr} (capacity ${availability.capacity}, already booked ${availability.booked}).`);
      setTimeout(() => setWaSuccess(''), 6000);
      return;
    }

    // Create guest profile first (booking phase)
    const existingGuest = guests.find(g =>
      g.email.toLowerCase() === waEmail.toLowerCase() ||
      g.name.toLowerCase() === waName.toLowerCase()
    );

    if (!existingGuest) {
      addGuest({
        name: waName,
        lastName: waName.split(' ').pop() || waName,
        email: waEmail,
        phone: waPhone,
        status: 'Regular',
        loyaltyPoints: 0,
        specialRequests: '',
        notes: 'Walk-in guest profile created during booking',
        history: [],
        totalSpend: 0,
        nationality: undefined,
        tin: undefined,
        vatNo: undefined,
        vatDate: undefined,
        passportNumber: undefined,
        dateOfBirth: undefined
      });
    }

    // Rate calculations
    const baseRaw = waType === 'Single' ? 120 : waType === 'Double' ? 180 : waType === 'Suite' ? 350 : waType === 'Deluxe' ? 260 : 650;
    const base = Math.round(baseRaw * getYieldMultiplier());
    const total = base * waNights;

    // Create reservation
    const resId = addReservation({
      guestName: waName,
      guestEmail: waEmail,
      guestPhone: waPhone,
      guestStatus: 'Regular',
      roomType: waType,
      roomNumber: availableRoomForWalkin.number,
      checkInDate: checkInStr,
      checkOutDate: checkOutStr,
      adults: 1,
      children: 0,
      status: 'Confirmed',
      rate: base,
      totalAmount: total,
      channel: 'Walk-In',
      paymentStatus: 'Unpaid',
      notes: 'Direct Walk-In Desk Check'
    });

    // Check-in immediately!
    checkInReservation(resId, availableRoomForWalkin.number);

    setWaSuccess(`Walk-In Check-In COMPLETE! Welcome guest ${waName} to Room ${availableRoomForWalkin.number}. Invoice ${formatAmount(total)} created.`);

    // Route to CRM on onboarding walk in (guest profile already exists)
    if (onNavigateToCRM) {
      onNavigateToCRM({
        id: resId,
        roomNumber: availableRoomForWalkin.number,
        guestName: waName,
        guestEmail: waEmail,
        guestPhone: waPhone,
        checkInDate: checkInStr
      });
    }

    setTimeout(() => setWaSuccess(''), 5000);

    setWaName('');
    setWaEmail('');
    setWaPhone('');
  };

  // Search filter inside reservations
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRoomType, setFilterRoomType] = useState<string>('All');
  const [filterCheckInDate, setFilterCheckInDate] = useState<string>('');
  const [filterCheckOutDate, setFilterCheckOutDate] = useState<string>('');

  // Calendar view state (synced with booking table filters)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(new Date(currentSystemDate));

  // Popup Modal Toggle
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedCalendarRes, setSelectedCalendarRes] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const renderAddonsCell = (res: Reservation) => {
    const countIds = (ids: string[]) => {
      const counts = new Map<string, number>();
      ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
      return counts;
    };
    const pkgCounts = countIds(res.packageIds || []);
    const serviceCounts = countIds(res.guestServiceIds || []);
    const items: { label: string; quantity: number }[] = [];
    pkgCounts.forEach((qty, id) => {
      items.push({ label: packages.find(p => p.id === id)?.name || id, quantity: qty });
    });
    serviceCounts.forEach((qty, id) => {
      items.push({ label: guestServices.find(gs => gs.id === id)?.name || id, quantity: qty });
    });
    if (items.length === 0) return <span className="text-xs text-slate-400 italic">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded border border-amber-200/60">
            {item.label}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
          </span>
        ))}
      </div>
    );
  };

  const getDailyRateForType = (type: RoomType, ratePlanId?: string, promoCode?: string) => {
    return calculateDailyRate(type, ratePlanId || 'RP-STD', ratePlans, promotions, promoCode);
  };

  const handleCreateReservation = async (data: ReservationFormData) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        roomType: data.roomSelections && data.roomSelections.length > 0 ? data.roomSelections[0].roomType : data.roomType,
        roomNumber: data.roomSelections && data.roomSelections.length > 0 && data.roomSelections[0].roomNumbers && data.roomSelections[0].roomNumbers.length > 0 ? data.roomSelections[0].roomNumbers[0] : undefined,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        adults: data.adults,
        children: data.children,
        rate: calculateDailyRate(data.roomType, data.ratePlanId || 'RP-STD', ratePlans, promotions, data.promoCode),
        channel: data.channel as BookingChannel,
        status: editingReservation.status,
        notes: data.notes,
        depositAmount: data.depositAmount,
        isDepositPaid: data.isDepositPaid,
        ratePlanId: data.ratePlanId,
        packageIds: data.packageIds,
        additionalGuestIds: data.additionalGuestIds,
        guestTin: data.guestTin,
        guestVatNo: data.guestVatNo,
        guestVatDate: data.guestVatDate,
        isGroup: data.bookingType === 'Group',
        bookingGroupId: data.bookingGroupId || undefined,
        groupBookingId: data.groupName || undefined,
        corporateAccountId: data.corporateAccountId || undefined
      });
      // If this was a waitlisted reservation, promote it after update so room assignment is part of the promotion flow
      if (editingReservation.status === 'Waitlisted') {
        promoteFromWaitlist(editingReservation.id);
        setSuccessMsg(`Reservation ${editingReservation.id} successfully updated and promoted!`);
      } else {
        setSuccessMsg(`Reservation ${editingReservation.id} successfully updated!`);
      }
    } else {
      // If promoting a waitlisted group booking, cancel the old waitlisted reservations first
      if (promotingGroupRes) {
        const oldGroupId = promotingGroupRes.bookingGroupId || promotingGroupRes.groupBookingId;
        if (oldGroupId) {
          reservations
            .filter(r => (r.bookingGroupId === oldGroupId || r.groupBookingId === oldGroupId) && r.status === 'Waitlisted')
            .forEach(r => updateReservationStatus(r.id, 'Cancelled'));
        } else {
          updateReservationStatus(promotingGroupRes.id, 'Cancelled');
        }
        setPromotingGroupRes(null);
      }

      let groupId = data.bookingGroupId || (data.bookingType !== 'Individual' ? 'GRP-' + Math.floor(1000 + Math.random() * 9000) : undefined);

      // Create group booking profile at booking time
      if (data.bookingType === 'Group' && data.groupName) {
        const existingGroup = groupBookings.find(g => g.id === groupId);
        if (!existingGroup) {
          // Detect if multiple room types are selected
          const selectedRoomTypes = data.roomSelections && data.roomSelections.length > 0 
            ? Array.from(new Set(data.roomSelections.map(s => s.roomType)))
            : [data.roomType];
          
          const isMixed = selectedRoomTypes.length > 1;
          
          // Build room type breakdown
          const roomTypeBreakdown = data.roomSelections && data.roomSelections.length > 0
            ? data.roomSelections.map(s => ({ roomType: s.roomType, count: s.count }))
            : [{ roomType: data.roomType, count: data.numberOfRooms || 1 }];

          // Use the first actual room type for roomTypeNeeded, not 'Mixed'
          // 'Mixed' is only for display purposes in the group profile
          const primaryRoomType = selectedRoomTypes[0] || data.roomType;

          const createdGroup = await addGroupBooking({
            groupName: data.groupName,
            contactName: data.guestName,
            contactEmail: data.guestEmail,
            contactPhone: data.guestPhone || '',
            roomTypeNeeded: primaryRoomType,
            roomCount: data.numberOfRooms || 1,
            roomTypeBreakdown,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            discountPercent: 0,
            status: 'Confirmed'
          });
          if (createdGroup) {
            groupId = createdGroup.id;
          }
        }
      }

      // Create or update guest profile with hierarchical structure for group/corporate bookings
      let guestId: string | undefined;
      let guestIdsForRooms: string[] = []; // Store guest IDs for each room in group booking

      if (data.bookingType === 'Group' && data.groupName) {
        // Guest profiles are now created by the database function create_group_booking
        // We just need to find the existing guest profile created by the database
        const existingGuest = guests.find(g =>
          g.email.toLowerCase() === data.guestEmail.toLowerCase() &&
          g.parentGroupId === groupId
        );

        if (existingGuest) {
          guestId = existingGuest.id;
          guestIdsForRooms.push(guestId);
        }
      } else if (data.bookingType === 'Corporate' && data.corporateAccountId) {
        // Check if guest already exists
        const existingGuest = guests.find(g => 
          g.email.toLowerCase() === data.guestEmail.toLowerCase() || 
          g.name.toLowerCase() === data.guestName.toLowerCase()
        );
        
        if (existingGuest) {
          // Link existing guest to corporate account
          guestId = existingGuest.id;
          const corporateAccount = corporateAccounts.find(c => c.id === data.corporateAccountId);
          updateGuestData(guestId, { 
            parentCorporateId: data.corporateAccountId, 
            parentGroupId: undefined,
            isPrimaryContact: true,
            notes: existingGuest.notes + `\nCorporate contact for: ${corporateAccount?.companyName || 'Corporate Account'}`
          });
        } else {
          // Create new guest profile linked to corporate account
          const corporateAccount = corporateAccounts.find(c => c.id === data.corporateAccountId);
          guestId = addGuest({
            name: data.guestName,
            lastName: data.guestName.split(' ').pop() || data.guestName,
            email: data.guestEmail,
            phone: data.guestPhone || '',
            status: 'Regular',
            loyaltyPoints: 0,
            specialRequests: '',
            notes: `Corporate contact for: ${corporateAccount?.companyName || 'Corporate Account'}`,
            history: [],
            totalSpend: 0,
            parentCorporateId: data.corporateAccountId,
            isPrimaryContact: true,
            nationality: undefined,
            tin: data.guestTin,
            vatNo: data.guestVatNo,
            vatDate: data.guestVatDate,
            passportNumber: undefined,
            dateOfBirth: undefined
          });
        }
      } else {
        // Individual booking - create/update guest profile without hierarchy
        const existingGuest = guests.find(g => 
          g.email.toLowerCase() === data.guestEmail.toLowerCase() || 
          g.name.toLowerCase() === data.guestName.toLowerCase()
        );
        
        if (!existingGuest) {
          guestId = addGuest({
            name: data.guestName,
            lastName: data.guestName.split(' ').pop() || data.guestName,
            email: data.guestEmail,
            phone: data.guestPhone || '',
            status: 'Regular',
            loyaltyPoints: 0,
            specialRequests: '',
            notes: 'Individual booking guest',
            history: [],
            totalSpend: 0,
            nationality: undefined,
            tin: data.guestTin,
            vatNo: data.guestVatNo,
            vatDate: data.guestVatDate,
            passportNumber: undefined,
            dateOfBirth: undefined
          });
        } else {
          guestId = existingGuest.id;
        }
      }

      const selections = data.roomSelections && data.roomSelections.length > 0
        ? data.roomSelections
        : [{ roomType: data.roomType, count: 1, roomNumbers: [] }];

      // Availability guard: only confirmed (Walk-In) bookings consume physical inventory.
      if (data.channel === 'Walk-In') {
        for (const sel of selections) {
          const availability = getTypeAvailability(sel.roomType, data.checkInDate, data.checkOutDate);
          if (availability.available < sel.count) {
            alert(`Cannot create confirmed booking: only ${availability.available} ${sel.roomType} room(s) available for ${data.checkInDate} → ${data.checkOutDate}. You requested ${sel.count}.`);
            return;
          }
        }
      }

      let createdCount = 0;
      const createdIds: string[] = [];

      for (const sel of selections) {
        const typeRate = getDailyRateForType(sel.roomType, data.ratePlanId, data.promoCode);
        const nights = calculateNights(data.checkInDate, data.checkOutDate);
        let roomTotal = 0;
        for (let idx = 0; idx < nights; idx++) {
          const d = new Date(data.checkInDate);
          d.setDate(d.getDate() + idx);
          const multi = getSeasonalMultiplier(toISODate(d), seasons);
          roomTotal += typeRate * multi * getYieldMultiplier();
        }

        let packageTotal = 0;
        data.packageIds?.forEach(pkgId => {
          const pkg = packages.find(p => p.id === pkgId);
          if (pkg) {
            packageTotal += pkg.chargeFrequency === 'daily' ? pkg.price * nights : pkg.price;
          }
        });

        const totalAmount = Math.round(roomTotal + packageTotal);

        for (let i = 0; i < sel.count; i++) {
          const roomNumber = sel.roomNumbers && sel.roomNumbers.length > i ? sel.roomNumbers[i] : undefined;

          // For group bookings, create a guest profile for each room
          let roomGuestId = guestId;
          if (data.bookingType === 'Group' && data.groupName) {
            const roomGuestName = i === 0 ? data.guestName : `${data.guestName} (Room ${i + 1})`;
            // Give each room a unique derived email so they each get their own guest profile
            const roomGuestEmail = i === 0 ? data.guestEmail : `${data.guestEmail.replace('@', `+room${i + 1}@`)}`;

            const existingRoomGuest = guests.find(g =>
              g.email.toLowerCase() === roomGuestEmail.toLowerCase() ||
              g.name.toLowerCase() === roomGuestName.toLowerCase()
            );

            if (existingRoomGuest) {
              roomGuestId = existingRoomGuest.id;
              // Force link to group profile, removing any existing corporate/group links
              updateGuestData(roomGuestId, {
                parentGroupId: groupId,
                parentCorporateId: undefined,
                isPrimaryContact: i === 0,
                notes: existingRoomGuest.notes + `\nGroup booking: ${data.groupName} - Room ${i + 1} (Forced group link)`
              });
            } else {
              roomGuestId = addGuest({
                name: roomGuestName,
                lastName: roomGuestName.split(' ').pop() || roomGuestName,
                email: roomGuestEmail,
                phone: data.guestPhone || '',
                status: 'Regular',
                loyaltyPoints: 0,
                specialRequests: '',
                notes: `Group booking: ${data.groupName} - Room ${i + 1}`,
                history: [],
                totalSpend: 0,
                parentGroupId: groupId,
                isPrimaryContact: i === 0,
                nationality: undefined,
                tin: data.guestTin,
                vatNo: data.guestVatNo,
                vatDate: data.guestVatDate,
                passportNumber: undefined,
                dateOfBirth: undefined
              });
            }
            guestIdsForRooms.push(roomGuestId);
          }

          const resId = addReservation({
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            guestPhone: data.guestPhone || '',
            guestStatus: 'Regular',
            roomType: sel.roomType,
            roomNumber,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            adults: data.adults,
            children: data.children,
            status: data.channel === 'Walk-In' ? 'Confirmed' : 'Waitlisted',
            rate: typeRate,
            totalAmount,
            channel: data.channel as BookingChannel,
            paymentStatus: 'Unpaid',
            notes: data.notes,
            depositAmount: data.depositAmount,
            isDepositPaid: data.isDepositPaid,
            ratePlanId: data.ratePlanId,
            packageIds: data.packageIds,
            additionalGuestIds: data.bookingType === 'Group' && data.groupName ? guestIdsForRooms : data.additionalGuestIds,
            guestTin: data.guestTin,
            guestVatNo: data.guestVatNo,
            guestVatDate: data.guestVatDate,
            isGroup: data.bookingType === 'Group',
            bookingGroupId: groupId,
            groupId,
            groupBookingId: data.groupName || undefined,
            corporateAccountId: data.corporateAccountId || undefined
          });
          createdCount++;
          createdIds.push(resId);
        }
      }

      if (data.channel !== 'Walk-In') {
        setSuccessMsg(`Guest ${data.guestName} successfully added to waitlist registry. ${createdCount} reservation(s) created: ${createdIds.join(', ')}`);
      } else {
        setSuccessMsg(`${createdCount} reservation(s) successfully created for ${data.guestName}: ${createdIds.join(', ')}`);
      }
    }

    setTimeout(() => {
      setSuccessMsg('');
      setIsNewBookingOpen(false);
      setEditingReservation(null);
      setPromotingGroupRes(null);
    }, 2000);
  };

  const startEditing = (res: Reservation) => {
    setEditingReservation(res);
    setPromotingGroupRes(null);
    setIsNewBookingOpen(true);
  };

  const startPromotingGroup = (res: Reservation) => {
    setEditingReservation(null);
    setPromotingGroupRes(res);
    setIsNewBookingOpen(true);
  };

  return (
    <div className="space-y-6" id="reservations-module-container block">
      {/* Reservations Sub tabs */}
      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 text-[10px] sm:text-xs font-mono font-medium text-slate-500 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-1 sm:p-1.5 border border-slate-200/80 dark:border-slate-700/80 card-shadow">
        <button
          onClick={() => setActiveTab('walkin')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'walkin' 
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <UserPlus size={12} sm:size={14} className={activeTab === 'walkin' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Walk-in Check-in</span>
          <span className="sm:hidden">Walk-in</span>
          {activeTab === 'walkin' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => {
            // Sync table filter date with calendar when switching back
            if (activeTab === 'calendar') {
              setFilterCheckInDate(toISODate(calendarSelectedDate));
            }
            setActiveTab('form');
          }}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'form'
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <List size={12} sm:size={14} className={activeTab === 'form' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Bookings Registry</span>
          <span className="sm:hidden">Bookings</span>
          {activeTab === 'form' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => {
            // Sync calendar date with table's filterCheckInDate when switching
            if (filterCheckInDate) {
              setCalendarSelectedDate(new Date(filterCheckInDate));
            }
            setActiveTab('calendar');
          }}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'calendar'
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Calendar size={12} sm:size={14} className={activeTab === 'calendar' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Rooms Outlook</span>
          <span className="sm:hidden">Outlook</span>
          {activeTab === 'calendar' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => setActiveTab('ota')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'ota' 
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Globe size={12} sm:size={14} className={activeTab === 'ota' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Channel Manager</span>
          <span className="sm:hidden">OTA</span>
          {activeTab === 'ota' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => setActiveTab('yield')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'yield' 
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <TrendingUp size={12} sm:size={14} className={activeTab === 'yield' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Yield Pricing</span>
          <span className="sm:hidden">Yield</span>
          {activeTab === 'yield' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'pricing' 
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Tag size={12} sm:size={14} className={activeTab === 'pricing' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Rate Plans</span>
          <span className="sm:hidden">Rates</span>
          {activeTab === 'pricing' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'forecast' 
              ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50'
          }`}
        >
          <Sparkles size={12} sm:size={14} className={activeTab === 'forecast' ? 'text-indigo-500 animate-pulse' : 'text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300'} />
          <span className="hidden sm:inline">AI Forecasting</span>
          <span className="sm:hidden">AI</span>
          {activeTab === 'forecast' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full mx-1 sm:mx-2" />}
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-200 relative group smooth-transition ${
            activeTab === 'sales' 
              ? 'bg-gradient-to-r from-white to-white dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white font-bold shadow-md shadow-slate-200/50 dark:shadow-slate-900/50' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Megaphone size={12} sm:size={14} className={activeTab === 'sales' ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
          <span className="hidden sm:inline">Sales & Campaigns</span>
          <span className="sm:hidden">Sales</span>
          {activeTab === 'sales' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-1 sm:mx-2" />}
        </button>
      </div>

      {/* RENDER ACTIVE SCREEN */}
      {activeTab === 'walkin' && (
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 card-shadow hover:card-shadow-hover transition-all duration-300 space-y-4 sm:space-y-5 animate-fade-in smooth-transition" id="walkin-view">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-sans font-black text-slate-900 dark:text-white tracking-tight">Rapid Walk-In Registry</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-sans">Instantly reserve, check in, and route a new walk-in guest into CRM.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 card-shadow space-y-3 sm:space-y-4">
            {waSuccess && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 font-mono text-xs rounded-lg flex items-center gap-2 shadow-sm animate-bounce-subtle">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-500" />
                {waSuccess}
              </div>
            )}

            <form onSubmit={handleWalkinSubmit} className="space-y-3 sm:space-y-4 text-[10px] sm:text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-3xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={waName}
                    onChange={(e) => setWaName(e.target.value)}
                    placeholder="E.g. Juliet Montague"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 smooth-transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-3xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={waEmail}
                    onChange={(e) => setWaEmail(e.target.value)}
                    placeholder="juliet@rome.it"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 smooth-transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-3xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">Contact phone</label>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+39 (555) 012"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 smooth-transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] sm:text-3xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">Room Type</label>
                  <select
                    value={waType}
                    onChange={(e) => setWaType(e.target.value)}
                    className="w-full px-2 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono text-slate-700 dark:text-slate-200 transition-all duration-200 smooth-transition"
                  >
                    {uniqueRoomTypes.map(type => (
                      <option key={type} value={type}>{type} ({formatAmount(getBaseRate(type))})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] sm:text-3xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">Duration (Nights)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={waNights}
                    onChange={(e) => setWaNights(Number(e.target.value))}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono transition-all duration-200 smooth-transition"
                  />
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 card-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] sm:text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Matching Vacant & Clean Room:</span>
                  {availableRoomForWalkin ? (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      Room {availableRoomForWalkin.number} Available
                    </span>
                  ) : (
                    <span className="font-mono text-rose-500 dark:text-rose-400 font-semibold bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border border-rose-200 dark:border-rose-800 flex items-center gap-1 shadow-sm">
                      <AlertCircle size={10} /> Fully Booked!
                    </span>
                  )}
                </div>
                {availableRoomForWalkin && (
                  <p className="text-[9px] sm:text-3xs text-slate-500 dark:text-slate-400 leading-tight">
                    Submitting this form checks in the guest and queues their onboarding card to the CRM module automatically.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!availableRoomForWalkin}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-700 dark:border-slate-600 text-white font-sans font-semibold rounded-lg text-[10px] sm:text-xs transition-all duration-200 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                Onboard Guest Walk-In & Check-In
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'form' && (
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 animate-fade-in" id="bookings-registry-view">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white tracking-tight">Active Bookings & Profile Registry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Reconcile walk-ins, group contracts, OTA listings, and GDS holds securely across the matrix.</p>
            </div>
            

              <button
                type="button"
                onClick={() => {
                  setEditingReservation(null);
                  
                  setIsNewBookingOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-sans font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={14} className="stroke-[3]" /> Create New Reservation
              </button>
          </div>

          <>
              {/* Filters shelf */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-sm flex flex-col items-center gap-4 space-y-4 md:space-y-0">
            <div className="w-full flex flex-col md:flex-row items-center gap-3">
              <div className="w-full md:flex-1 relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by guest name, email, phone, or reservation reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 shadow-sm"
                />
              </div>

              <div className="w-full md:w-auto flex flex-row gap-2">
                <div className="flex-1 md:w-40">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'all' | 'individual' | 'groups')}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 cursor-pointer transition-all duration-200 shadow-sm appearance-none"
                  >
                    <option value="all">All Bookings</option>
                    <option value="individual">Individual Only</option>
                    <option value="groups">Groups Only</option>
                  </select>
                </div>

                <div className="flex-1 md:w-40">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 cursor-pointer transition-all duration-200 shadow-sm appearance-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="CheckedIn">Checked In</option>
                    <option value="CheckedOut">Checked Out</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Waitlisted">Waitlisted</option>
                  </select>
                </div>

                <button
                  onClick={expandAllGroups}
                  className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 shadow-sm"
                  title="Expand All Groups"
                >
                  <ChevronDown size={14} />
                </button>

                <button
                  onClick={collapseAllGroups}
                  className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 shadow-sm"
                  title="Collapse All Groups"
                >
                  <ChevronRightIcon size={14} />
                </button>

                <div className="flex-1 md:w-44">
                  <select
                    value={filterRoomType}
                    onChange={(e) => setFilterRoomType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-sans font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 cursor-pointer transition-all duration-200 shadow-sm appearance-none"
                  >
                    <option value="All">All Categories</option>
                    {uniqueRoomTypes.map(type => (
                      <option key={type} value={type}>{type} ({formatAmount(getBaseRate(type))})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row items-center gap-3 border-t border-slate-200/60 dark:border-slate-700/60 pt-4 md:border-t-0 md:pt-0">
               <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold shrink-0">Dates:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 group">
                      <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input 
                        type="date"
                        value={filterCheckInDate}
                        onChange={(e) => setFilterCheckInDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-200 shadow-sm"
                        title="Filter by Check-In Date"
                      />
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-light">→</span>
                    <div className="relative flex-1 group">
                      <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                      <input 
                        type="date"
                        value={filterCheckOutDate}
                        onChange={(e) => setFilterCheckOutDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-200 shadow-sm"
                        title="Filter by Check-Out Date"
                      />
                    </div>
                  </div>
               </div>

               {(searchQuery || filterStatus !== 'All' || filterRoomType !== 'All' || filterCheckInDate || filterCheckOutDate) && (
                 <button
                   onClick={() => {
                     setSearchQuery('');
                     setFilterStatus('All');
                     setFilterRoomType('All');
                     setFilterCheckInDate('');
                     setFilterCheckOutDate('');
                   }}
                   className="text-[10px] font-mono font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1 cursor-pointer"
                 >
                   <X size={10} /> Clear Filters
                 </button>
               )}
            </div>
          </div>

          {/* Bookings Table / Grid */}
          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/20 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200 border-collapse table-fixed" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700 font-sans text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                  <th className="py-4 px-5 w-[100px]">Booking ID</th>
                  <th className="py-4 px-5 w-[80px]">Group ID</th>
                  <th className="py-4 px-5 w-[150px]">Guest Name</th>
                  <th className="py-4 px-5 w-[80px]">Room Type</th>
                  <th className="py-4 px-5 w-[90px]">Check In</th>
                  <th className="py-4 px-5 w-[90px]">Check Out</th>
                  <th className="py-4 px-5 w-[50px] text-center">Nights</th>
                  <th className="py-4 px-5 w-[80px]">Room No</th>
                  <th className="py-4 px-5 w-[80px]">Channel</th>
                  <th className="py-4 px-5 w-[80px]">Rate</th>
                  <th className="py-4 px-5 w-[80px]">Total</th>
                  <th className="py-4 px-5 w-[100px]">Add-ons / Packages</th>
                  <th className="py-4 px-5 w-[80px]">Deposit</th>
                  <th className="py-4 px-5 w-[120px]">Notes</th>
                  <th className="py-4 px-5 w-[60px] text-center">Status</th>
                  <th className="py-4 px-5 w-[130px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-700/50 bg-white/80 dark:bg-slate-900/20">
                {(() => {
                  // Group reservations by group ID
                  const groupMap = new Map<string, Reservation[]>();
                  const individualReservations: Reservation[] = [];

                  reservations.forEach(res => {
                    const groupId = res.bookingGroupId || res.groupBookingId;
                    if (groupId) {
                      if (!groupMap.has(groupId)) {
                        groupMap.set(groupId, []);
                      }
                      groupMap.get(groupId)!.push(res);
                    } else {
                      individualReservations.push(res);
                    }
                  });

                  // Filter based on view mode
                  let groupsToShow: Array<{ groupId: string; reservations: Reservation[] }> = [];
                  let individualsToShow: Reservation[] = [];

                  if (viewMode === 'all' || viewMode === 'groups') {
                    groupsToShow = Array.from(groupMap.entries()).map(([groupId, res]) => ({ groupId, reservations: res }));
                  }
                  if (viewMode === 'all' || viewMode === 'individual') {
                    individualsToShow = individualReservations;
                  }

                  // Apply filters
                  const filterRes = (res: Reservation) => {
                    const matchesQuery = !searchQuery ? true : (
                      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      res.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      res.guestPhone.includes(searchQuery) ||
                      res.id.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    const matchesStatus = filterStatus === 'All' ? true : res.status === filterStatus;
                    const matchesRoomType = filterRoomType === 'All' ? true : res.roomType === filterRoomType;
                    const matchesCheckIn = !filterCheckInDate ? true : res.checkInDate === filterCheckInDate;
                    const matchesCheckOut = !filterCheckOutDate ? true : res.checkOutDate === filterCheckOutDate;
                    return matchesQuery && matchesStatus && matchesRoomType && matchesCheckIn && matchesCheckOut;
                  };

                  const filterGroup = (groupId: string, groupRes: Reservation[]) => {
                    if (!searchQuery) return true;
                    const group = groupBookings.find(g => g.id === groupId);
                    const matchesGroupName = group?.groupName.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesGroupId = groupId.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesAnyReservation = groupRes.some(filterRes);
                    return matchesGroupName || matchesGroupId || matchesAnyReservation;
                  };

                  groupsToShow = groupsToShow.filter(g => filterGroup(g.groupId, g.reservations));
                  individualsToShow = individualsToShow.filter(filterRes);

                  // Auto-expand groups if search matches any child
                  if (searchQuery) {
                    groupsToShow.forEach(g => {
                      if (g.reservations.some(filterRes)) {
                        setExpandedGroups(prev => new Set([...prev, g.groupId]));
                      }
                    });
                  }

                  return (
                    <>
                      {/* Render Group Parent Rows */}
                      {groupsToShow.map(({ groupId, reservations: groupRes }) => {
                        const group = groupBookings.find(g => g.id === groupId);
                        const derivedGroupStatus = (() => {
                          if (groupRes.length === 0) return group?.status || 'Confirmed';
                          if (groupRes.every(r => r.status === 'CheckedOut')) return 'CheckedOut';
                          if (groupRes.every(r => r.status === 'CheckedIn')) return 'CheckedIn';
                          if (groupRes.some(r => r.status === 'CheckedIn')) return 'CheckedIn';
                          if (groupRes.some(r => r.status === 'Confirmed')) return 'Confirmed';
                          if (groupRes.some(r => r.status === 'Waitlisted')) return 'Pending';
                          if (groupRes.every(r => r.status === 'Cancelled')) return 'Cancelled';
                          return group?.status || 'Confirmed';
                        })();
                        const isExpanded = expandedGroups.has(groupId);
                        const totalRooms = groupRes.length;
                        const totalGuests = groupRes.reduce((sum, r) => sum + r.adults + r.children, 0);
                        const checkedIn = groupRes.filter(r => r.status === 'CheckedIn').length;
                        const checkedOut = groupRes.filter(r => r.status === 'CheckedOut').length;
                        const pending = groupRes.filter(r => r.status === 'Confirmed').length;
                        const totalRevenue = groupRes.reduce((sum, r) => sum + r.totalAmount, 0);
                        const isPaid = groupRes.every(r => r.paymentStatus === 'Paid');
                        const groupStart = new Date(groupRes[0]?.checkInDate || '');
                        const groupEnd = new Date(groupRes[0]?.checkOutDate || '');
                        const groupNights = Math.max(1, Math.round((groupEnd.getTime() - groupStart.getTime()) / (1000 * 60 * 60 * 24)));

                        return (
                          <React.Fragment key={`group-${groupId}`}>
                            {/* Parent Group Row */}
                            <tr className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 hover:from-indigo-100/50 hover:to-purple-100/50 transition-colors duration-200">
                              <td className="py-3 px-5">
                                <button
                                  onClick={() => toggleGroupExpansion(groupId)}
                                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
                                  <span className="font-mono font-bold text-sm">{groupId}</span>
                                </button>
                              </td>
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-2">
                                  <Users2 size={14} className="text-indigo-500" />
                                  <span className="font-semibold text-indigo-700">{group?.groupName || 'Unknown Group'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-5">
                                <div className="text-xs text-slate-600">
                                  <div className="font-semibold">{totalRooms} Rooms</div>
                                  <div className="text-slate-500">{totalGuests} Guests</div>
                                </div>
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-600 italic">—</td>
                              <td className="py-3 px-5 text-xs text-slate-600">
                                {groupRes[0]?.checkInDate || '—'}
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-600">
                                {groupRes[0]?.checkOutDate || '—'}
                              </td>
                              <td className="py-3 px-5 text-center text-xs text-slate-600 font-semibold">{groupNights}</td>
                              <td className="py-3 px-5 text-xs text-slate-600 italic">—</td>
                              <td className="py-3 px-5 text-xs text-slate-600 italic">—</td>
                              <td className="py-3 px-5 text-xs text-slate-600 italic">—</td>
                              <td className="py-3 px-5 text-xs text-slate-600">
                                {formatAmount(totalRevenue)}
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-600 italic">—</td>
                              <td className="py-3 px-5">
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                  isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-600">
                                <div className="flex gap-2">
                                  <span className="text-emerald-600">{checkedIn} In</span>
                                  <span className="text-amber-600">{pending} Pending</span>
                                  <span className="text-slate-500">{checkedOut} Out</span>
                                </div>
                              </td>
                              <td className="py-3 px-5 text-center">
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                  derivedGroupStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  derivedGroupStatus === 'CheckedIn' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {derivedGroupStatus}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-right">
                                <div className="flex gap-2 justify-end flex-wrap">
                                  {derivedGroupStatus === 'CheckedIn' ? (
                                    <button
                                      onClick={async () => {
                                        const checkedInReservations = groupRes.filter(r => r.status === 'CheckedIn');
                                        // Prevent checkout if any folio is not closed
                                        const unpaid = checkedInReservations.find(r => r.paymentStatus !== 'Paid');
                                        if (unpaid) {
                                          onProcessCheckout?.(unpaid.id);
                                          return;
                                        }
                                        checkedInReservations.forEach(r => checkOutReservation(r.id));
                                        await updateGroupBookingStatus(groupId, 'CheckedOut');
                                        const folioTarget = checkedInReservations[0];
                                        if (folioTarget) onProcessCheckout?.(folioTarget.id);
                                      }}
                                      className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                      Group Check-Out
                                    </button>
                                  ) : derivedGroupStatus === 'CheckedOut' ? (
                                    <span className="text-xs font-mono text-slate-400 italic">Checked Out</span>
                                  ) : groupRes.some(r => r.status === 'Waitlisted') ? (
                                    <button
                                      onClick={() => {
                                        const firstWaitlisted = groupRes.find(r => r.status === 'Waitlisted');
                                        if (firstWaitlisted) startPromotingGroup(firstWaitlisted);
                                      }}
                                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Zap size={12} /> Promote Group
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onGroupCheckIn?.({
                                        id: groupId,
                                        groupName: group?.groupName || '',
                                        contactName: group?.contactName || '',
                                        contactEmail: group?.contactEmail || '',
                                        contactPhone: group?.contactPhone || '',
                                        roomCount: totalRooms,
                                        checkInDate: groupRes[0]?.checkInDate || ''
                                      })}
                                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                      Check In Group
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onGroupCheckIn?.({
                                      id: groupId,
                                      groupName: group?.groupName || '',
                                      contactName: group?.contactName || '',
                                      contactEmail: group?.contactEmail || '',
                                      contactPhone: group?.contactPhone || '',
                                      roomCount: totalRooms,
                                      checkInDate: groupRes[0]?.checkInDate || ''
                                    })}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Group Profile
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Child Reservation Rows */}
                            {isExpanded && groupRes.filter(filterRes).map(res => {
                              const start = new Date(res.checkInDate);
                              const end = new Date(res.checkOutDate);
                              const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                              return (
                                <tr key={res.id} className="bg-slate-50/30 hover:bg-slate-100/50 transition-colors duration-200 border-l-4 border-indigo-300">
                                  <td className="py-3 px-5 pl-12 font-mono text-xs text-slate-500">
                                    <div className="font-semibold text-slate-700">{res.id}</div>
                                  </td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-400 italic">—</td>
                                  <td className="py-3 px-5 pl-12 font-sans max-w-[150px]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-slate-800">{res.guestName}</span>
                                      {res.groupBookingId && (
                                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[120px]">
                                          {res.groupBookingId}
                                        </span>
                                      )}
                                      <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold rounded-md uppercase ${
                                        res.guestStatus === 'VIP' ? 'bg-amber-100 text-amber-900 border border-amber-200/60' :
                                        res.guestStatus === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-950 border border-indigo-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                                      }`}>
                                        {res.guestStatus}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono mt-1 truncate">{res.guestEmail}</div>
                                  </td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.roomType}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.checkInDate}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.checkOutDate}</td>
                                  <td className="py-3 px-5 pl-12 text-center text-xs text-slate-600">{nights}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.roomNumber || 'Unassigned'}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.channel}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{formatAmount(res.rate)}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{formatAmount(res.totalAmount)}</td>
                                  <td className="py-3 px-5 pl-12">{renderAddonsCell(res)}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-600">{res.depositAmount > 0 ? formatAmount(res.depositAmount) : '—'}</td>
                                  <td className="py-3 px-5 pl-12 text-xs text-slate-500 max-w-[120px] truncate">{res.notes || '—'}</td>
                                  <td className="py-3 px-5 pl-12 text-center">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                      res.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                      res.status === 'CheckedIn' ? 'bg-blue-100 text-blue-700' :
                                      res.status === 'CheckedOut' ? 'bg-slate-100 text-slate-600' :
                                      res.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {res.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-5 pl-12 text-right">
                                    <div className="flex gap-2 justify-end flex-wrap">
                                      {res.status === 'Confirmed' && (
                                        <>
                                          {res.roomNumber ? (
                                            <button
                                              onClick={() => {
                                                checkInReservation(res.id, res.roomNumber!);
                                                onNavigateToCRM?.({ id: res.id, roomNumber: res.roomNumber, guestName: res.guestName, guestEmail: res.guestEmail, guestPhone: res.guestPhone, checkInDate: res.checkInDate });
                                              }}
                                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                            >
                                              Check In
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setEditingReservation(res);
                                                setIsNewBookingOpen(true);
                                              }}
                                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                            >
                                              Assign Rm
                                            </button>
                                          )}
                                          <button
                                            onClick={() => updateReservationStatus(res.id, 'Cancelled')}
                                            className="px-3 py-1.5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-sans font-semibold text-xs rounded-lg transition-all duration-200 cursor-pointer hover:shadow-sm"
                                            title="Cancel Booking"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingReservation(res);
                                              setIsNewBookingOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                          >
                                            Edit
                                          </button>
                                        </>
                                      )}
                                      {res.status === 'CheckedIn' && (
                                        <button
                                          onClick={() => {
                                            if (onProcessCheckout) {
                                              onProcessCheckout(res.id);
                                            } else if (res.paymentStatus === 'Paid') {
                                              checkOutReservation(res.id);
                                            } else {
                                              alert('Please close the folio before checking out.');
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                        >
                                          Check Out
                                        </button>
                                      )}
                                      {res.status === 'Cancelled' && (
                                        <button
                                          onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                                          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                          title="Approve Booking"
                                        >
                                          Approve
                                        </button>
                                      )}
                                      {res.status === 'CheckedOut' && (
                                        <span className="text-xs font-mono text-slate-400 italic">Archived</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}

                      {/* Render Individual Reservations */}
                      {individualsToShow.filter(filterRes).map(res => {
                    const vacantRoomsOfType = rooms.filter(r => r.type === res.roomType);
                    
                    const start = new Date(res.checkInDate);
                    const end = new Date(res.checkOutDate);
                    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors duration-200 group">
                        {/* Booking ID */}
                        <td className="py-4 px-5 font-mono text-xs text-slate-500">
                          <div className="font-semibold text-slate-900">{res.id}</div>
                          {res.ratePlanId && (
                            <div className="text-[10px] text-indigo-600 uppercase font-bold mt-1 flex items-center gap-1">
                              <Tag size={10} /> {ratePlans.find(p => p.id === res.ratePlanId)?.name || res.ratePlanId}
                            </div>
                          )}
                        </td>

                        {/* Group ID */}
                        <td className="py-4 px-5 font-mono text-xs text-slate-500">
                          {res.bookingGroupId ? (
                            <div className="flex items-center gap-1">
                              <Users2 size={12} className="text-indigo-500" />
                              <span className="font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/60">{res.bookingGroupId}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                          {res.corporateAccountId && (
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 size={12} className="text-emerald-500" />
                              <span className="text-[10px] text-emerald-700 font-semibold">{corporateAccounts.find(c => c.id === res.corporateAccountId)?.companyName || res.corporateAccountId}</span>
                            </div>
                          )}
                        </td>

                        {/* Guest Name */}
                        <td className="py-4 px-5 font-sans max-w-[150px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{res.guestName}</span>
                            {res.groupBookingId && (
                              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[120px]">
                                {res.groupBookingId}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold rounded-md uppercase ${
                              res.guestStatus === 'VIP' ? 'bg-amber-100 text-amber-900 border border-amber-200/60' :
                              res.guestStatus === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-950 border border-indigo-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                            }`}>
                              {res.guestStatus}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-1 truncate">{res.guestEmail}</div>
                          {res.guestPhone && <div className="text-xs text-slate-400 font-mono">{res.guestPhone}</div>}
                          {/* Hierarchical guest information */}
                          {(() => {
                            const guest = guests.find(g => g.email.toLowerCase() === res.guestEmail.toLowerCase() || g.name.toLowerCase() === res.guestName.toLowerCase());
                            if (!guest) return null;
                            return (
                              <div className="mt-1.5 space-y-1">
                                {guest.parentGroupId && (
                                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-mono">
                                    <Users2 size={10} />
                                    <span className="font-semibold">{guest.parentGroupId}</span>
                                    {guest.isPrimaryContact && <Star size={8} className="text-amber-500 fill-amber-500" />}
                                  </div>
                                )}
                                {guest.parentCorporateId && (
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                                    <Building2 size={10} />
                                    <span className="font-semibold">{corporateAccounts.find(c => c.id === guest.parentCorporateId)?.companyName || guest.parentCorporateId}</span>
                                    {guest.isPrimaryContact && <Star size={8} className="text-amber-500 fill-amber-500" />}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          {res.additionalGuestIds && res.additionalGuestIds.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {res.additionalGuestIds.map(id => {
                                const g = guests.find(item => item.id === id);
                                if (!g) return null;
                                return (
                                  <span key={g.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 text-xs font-sans border border-indigo-200/60 font-medium">
                                    {g.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Room Type */}
                        <td className="py-4 px-5 font-sans">
                          <span className="font-semibold text-slate-800">{res.roomType}</span>
                          <div className="text-xs text-slate-400 font-mono mt-1">
                            {res.adults}A{res.children ? ` / ${res.children}C` : ''}
                          </div>
                        </td>

                        {/* Check In */}
                        <td className="py-4 px-5 font-mono text-sm">
                          <div className="font-semibold text-slate-800">{new Date(res.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </td>

                        {/* Check Out */}
                        <td className="py-4 px-5 font-mono text-sm">
                          <div className="font-semibold text-slate-800">{new Date(res.checkOutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </td>

                        {/* Nights */}
                        <td className="py-4 px-5 text-center font-mono text-sm font-semibold text-amber-600">
                          {nights}
                        </td>

                        {/* Room No */}
                        <td className="py-4 px-5">
                          {res.roomNumber ? (
                            <span className="px-3 py-1.5 bg-slate-100/80 text-slate-800 font-mono font-semibold rounded-lg text-sm border border-slate-200/60">
                              {res.roomNumber}
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="px-2.5 py-1 bg-amber-50/80 text-amber-800 font-mono text-xs font-semibold rounded-md block text-center border border-amber-200/60 uppercase tracking-wider">
                                Unassigned
                              </span>
                              {res.status === 'Confirmed' && vacantRoomsOfType.length > 0 && (
                                <select
                                  onChange={(e) => {
                                    const rmNum = e.target.value;
                                    if (rmNum) assignRoomToReservation(res.id, rmNum);
                                  }}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200/60 rounded-md text-xs font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 cursor-pointer transition-all duration-200"
                                  defaultValue=""
                                >
                                  <option value="">Assign...</option>
                                  {vacantRoomsOfType.map(rm => (
                                    <option key={rm.id} value={rm.number}>{rm.number}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Channel */}
                        <td className="py-4 px-5 font-sans">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Globe size={14} className="text-slate-400 flex-shrink-0" />
                            <span>{res.channel}</span>
                          </div>
                        </td>

                        {/* Rate */}
                        <td className="py-4 px-5 font-mono text-sm">
                          <div className="font-semibold text-slate-700">{formatAmount(res.rate)}<span className="text-slate-400 font-normal text-xs">/nt</span></div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-5 font-mono">
                          <div className="font-semibold text-slate-900 text-sm">{formatAmount(res.totalAmount)}</div>
                          <span className={`mt-1 inline-block px-2 py-0.5 font-mono text-[10px] font-semibold rounded-md uppercase ${
                            res.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60' :
                            res.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800 border border-amber-200/60' : 'bg-rose-100 text-rose-800 border border-rose-200/60'
                          }`}>
                            {res.paymentStatus}
                          </span>
                        </td>

                        {/* Add-ons / Packages */}
                        <td className="py-4 px-5">{renderAddonsCell(res)}</td>

                        {/* Deposit */}
                        <td className="py-4 px-5 font-sans">
                          {res.depositAmount ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="text-xs text-slate-600 font-mono font-semibold">{formatAmount(res.depositAmount)}</div>
                              <button
                                onClick={() => updateDepositStatus(res.id, !res.isDepositPaid)}
                                className={`px-2.5 py-1 rounded-lg font-sans font-semibold text-xs uppercase inline-block w-fit cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                  res.isDepositPaid
                                    ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                                    : 'bg-amber-50/80 text-amber-700 border border-amber-200/60 hover:bg-amber-100'
                                }`}
                              >
                                {res.isDepositPaid ? 'Received' : 'Pending'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">None</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-4 px-5 font-sans max-w-[120px]">
                          {res.notes ? (
                            <div className="text-xs text-slate-600 line-clamp-2" title={res.notes}>
                              {res.notes}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">No notes</span>
                          )}
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {res.earlyCheckOutRequested && <span className="px-1.5 py-0.5 bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-[10px] font-semibold rounded-md" title="Early Checkout Requested">EARLY C/O</span>}
                            {res.lateCheckOutRequested && <span className="px-1.5 py-0.5 bg-purple-50/80 border border-purple-200/60 text-purple-700 text-[10px] font-semibold rounded-md" title="Late Checkout Requested">LATE C/O</span>}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold font-sans rounded-full ${
                            res.status === 'CheckedIn' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60' :
                            res.status === 'Confirmed' ? 'bg-sky-50 text-sky-700 border border-sky-200/60' :
                            res.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200/60' :
                            res.status === 'Waitlisted' ? 'bg-amber-100 text-amber-800 border border-amber-200/60' :
                            'bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}>
                            {res.status === 'Confirmed' ? 'Confirmed' :
                             res.status === 'CheckedIn' ? 'Checked In' :
                             res.status === 'CheckedOut' ? 'Checked Out' :
                             res.status === 'Cancelled' ? 'Cancelled' :
                             'Waitlisted'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right font-sans">
                          <div className="flex justify-end gap-2 items-center flex-wrap">
                            {res.status !== 'CheckedOut' && res.status !== 'Cancelled' && (
                              <button
                                onClick={() => startEditing(res)}
                                className="p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-sm"
                                title="Edit Reservation"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {res.status === 'Waitlisted' && (
                              <button
                                onClick={() => {
                                  if (res.isGroup || res.bookingGroupId) {
                                    startPromotingGroup(res);
                                  } else {
                                    startEditing(res);
                                  }
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Zap size={12} /> Promote
                              </button>
                            )}
                            {res.status === 'Confirmed' && (
                              <>
                                {res.bookingGroupId ? (
                                  <button
                                    onClick={async () => {
                                      // Auto-create group profile if it doesn't exist
                                      let group = groupBookings.find(g => g.id === res.bookingGroupId);
                                      if (!group) {
                                        await addGroupBooking({
                                          groupName: res.groupBookingId || res.bookingGroupId!,
                                          contactName: res.guestName,
                                          contactEmail: res.guestEmail,
                                          contactPhone: res.guestPhone || '',
                                          roomTypeNeeded: res.roomType,
                                          roomCount: 1,
                                          checkInDate: res.checkInDate,
                                          checkOutDate: res.checkOutDate,
                                          discountPercent: 0,
                                          status: 'Confirmed'
                                        });
                                        group = groupBookings.find(g => g.id === res.bookingGroupId) || {
                                          id: res.bookingGroupId!,
                                          groupName: res.groupBookingId || res.bookingGroupId!,
                                          contactName: res.guestName,
                                          contactEmail: res.guestEmail,
                                          contactPhone: res.guestPhone || '',
                                          roomTypeNeeded: res.roomType,
                                          roomCount: 1,
                                          checkInDate: res.checkInDate,
                                          checkOutDate: res.checkOutDate,
                                          discountPercent: 0,
                                          status: 'Confirmed'
                                        };
                                      }
                                      
                                      // Check in all reservations with the same group ID
                                      const groupReservations = reservations.filter(r => r.bookingGroupId === res.bookingGroupId && r.status === 'Confirmed' && r.roomNumber);
                                      groupReservations.forEach(groupRes => {
                                        checkInReservation(groupRes.id, groupRes.roomNumber!);
                                        
                                        // Auto-link guest to group profile (create if doesn't exist)
                                        // Match by email, name, and parentGroupId to ensure unique guests per reservation
                                        let guest = guests.find(g => 
                                          g.email.toLowerCase() === groupRes.guestEmail.toLowerCase() && 
                                          g.name.toLowerCase() === groupRes.guestName.toLowerCase() &&
                                          g.parentGroupId === res.bookingGroupId
                                        );
                                        if (!guest) {
                                          // Create guest profile
                                          guest = addGuest({
                                            name: groupRes.guestName,
                                            lastName: groupRes.guestName.split(' ').pop() || groupRes.guestName,
                                            email: groupRes.guestEmail,
                                            phone: groupRes.guestPhone || '',
                                            status: groupRes.guestStatus || 'Regular',
                                            loyaltyPoints: 0,
                                            specialRequests: '',
                                            notes: `Auto-created from group booking: ${res.groupBookingId || res.bookingGroupId} - Reservation: ${groupRes.id}`,
                                            history: [],
                                            totalSpend: 0,
                                            parentGroupId: res.bookingGroupId,
                                            isPrimaryContact: groupRes.guestName === res.guestName,
                                            nationality: undefined,
                                            tin: groupRes.guestTin,
                                            vatNo: groupRes.guestVatNo,
                                            vatDate: groupRes.guestVatDate,
                                            passportNumber: undefined,
                                            dateOfBirth: undefined
                                          });
                                        }
                                      });
                                      // Update group booking status to CheckedIn
                                      if (res.bookingGroupId) {
                                        updateGroupBookingStatus(res.bookingGroupId, 'CheckedIn');
                                      }

                                      // Also trigger the group check-in flow for CRM
                                      onGroupCheckIn?.({
                                        id: res.bookingGroupId!,
                                        groupName: res.groupBookingId || res.bookingGroupId!,
                                        contactName: res.guestName,
                                        contactEmail: res.guestEmail,
                                        contactPhone: res.guestPhone || '',
                                        roomCount: groupReservations.length,
                                        checkInDate: res.checkInDate
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                  >
                                    Group Check-In
                                  </button>
                                ) : res.roomNumber ? (
                                  <button
                                    onClick={() => {
                                      checkInReservation(res.id, res.roomNumber!);
                                      onNavigateToCRM?.({ id: res.id, roomNumber: res.roomNumber, guestName: res.guestName, guestEmail: res.guestEmail, guestPhone: res.guestPhone, checkInDate: res.checkInDate });
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                  >
                                    Check In
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 italic mr-1">Assign Rm</span>
                                )}
                                <button
                                  onClick={() => updateReservationStatus(res.id, 'Cancelled')}
                                  className="px-3 py-1.5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-sans font-semibold text-xs rounded-lg transition-all duration-200 cursor-pointer hover:shadow-sm"
                                  title="Cancel Booking"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {res.status === 'CheckedIn' && (
                              <button
                                onClick={() => {
                                  if (onProcessCheckout) {
                                    onProcessCheckout(res.id);
                                  } else if (res.paymentStatus === 'Paid') {
                                    checkOutReservation(res.id);
                                  } else {
                                    alert('Please close the folio before checking out.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                              >
                                Check Out
                              </button>
                            )}
                            {res.status === 'Cancelled' && (
                              <button
                                onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-sans font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                title="Approve Booking"
                              >
                                Approve
                              </button>
                            )}
                            {res.status === 'CheckedOut' && (
                              <span className="text-xs font-mono text-slate-400 italic">Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                    </>
                  );
                })()}
              </tbody>
            </table>

            {(() => {
              const groupMap = new Map<string, Reservation[]>();
              const individualReservations: Reservation[] = [];

              reservations.forEach(res => {
                const groupId = res.bookingGroupId || res.groupBookingId;
                if (groupId) {
                  if (!groupMap.has(groupId)) {
                    groupMap.set(groupId, []);
                  }
                  groupMap.get(groupId)!.push(res);
                } else {
                  individualReservations.push(res);
                }
              });

              let groupsToShow: Array<{ groupId: string; reservations: Reservation[] }> = [];
              let individualsToShow: Reservation[] = [];

              if (viewMode === 'all' || viewMode === 'groups') {
                groupsToShow = Array.from(groupMap.entries()).map(([groupId, res]) => ({ groupId, reservations: res }));
              }
              if (viewMode === 'all' || viewMode === 'individual') {
                individualsToShow = individualReservations;
              }

              const filterRes = (res: Reservation) => {
                const matchesQuery = !searchQuery ? true : (
                  res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  res.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  res.guestPhone.includes(searchQuery) ||
                  res.id.toLowerCase().includes(searchQuery.toLowerCase())
                );
                const matchesStatus = filterStatus === 'All' ? true : res.status === filterStatus;
                const matchesRoomType = filterRoomType === 'All' ? true : res.roomType === filterRoomType;
                const matchesCheckIn = !filterCheckInDate ? true : res.checkInDate === filterCheckInDate;
                const matchesCheckOut = !filterCheckOutDate ? true : res.checkOutDate === filterCheckOutDate;
                return matchesQuery && matchesStatus && matchesRoomType && matchesCheckIn && matchesCheckOut;
              };

              const filterGroup = (groupId: string, groupRes: Reservation[]) => {
                if (!searchQuery) return true;
                const group = groupBookings.find(g => g.id === groupId);
                const matchesGroupName = group?.groupName.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesGroupId = groupId.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesAnyReservation = groupRes.some(filterRes);
                return matchesGroupName || matchesGroupId || matchesAnyReservation;
              };

              groupsToShow = groupsToShow.filter(g => filterGroup(g.groupId, g.reservations));
              individualsToShow = individualsToShow.filter(filterRes);

              if (groupsToShow.length === 0 && individualsToShow.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 mt-2 space-y-1">
                    <Users size={28} className="mx-auto text-slate-300 dark:text-slate-500 pb-1" />
                    <p className="font-sans font-bold text-slate-750 dark:text-slate-300">No Bookings Found</p>
                    <p className="font-sans text-xs text-slate-400 dark:text-slate-400 max-w-xs mx-auto">There are no profile reservations matching the search query or filtered status tags in database buffers.</p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </>

        </div>
      )}

      {/* TIMELINE OUTLOOK CALENDAR GRID */}
      {activeTab === 'calendar' && (
        <ModernCalendar
          rooms={rooms}
          reservations={reservations}
          currentSystemDate={currentSystemDate}
          onReservationClick={setSelectedCalendarRes}
          filterStatus={filterStatus === 'All' ? 'all' : filterStatus}
          selectedDate={calendarSelectedDate}
          onSelectedDateChange={setCalendarSelectedDate}
        />
      )}

      {/* CHANNEL MANAGER INTEGRATION */}
      {activeTab === 'ota' && (
        <div className="bg-white border border-slate-105 rounded-xl p-5 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-800">Channel Manager & OTA Sync panel</h3>
              <p className="text-xs text-slate-400">Reconcile listings from active channels instantly.</p>
            </div>
            
            <button
              id="ota-sync-manual-btn"
              onClick={triggerLiveSyncSimulation}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-mono rounded-lg text-xs transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} className="animate-spin" /> Fetch & Re-sync channels
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ota-cards">
            {/* Booking.com */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-blue-800 text-sm">Booking.com API</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-3xs font-bold font-mono rounded-full">CONNECTED</span>
              </div>
              <p className="text-xs text-slate-500">Live rate parity: <span className="font-semibold text-slate-700">100%</span> | Average response time: <span className="font-semibold text-slate-700">45ms</span></p>
              <div className="flex justify-between text-2xs font-mono text-slate-400 pt-1">
                <span>Last Synced: 3 mins ago</span>
                <span>Exp 30 bookings/mo</span>
              </div>
            </div>

            {/* Expedia */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-amber-700 text-sm">Expedia Global GDS</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-3xs font-bold font-mono rounded-full">CONNECTED</span>
              </div>
              <p className="text-xs text-slate-500">Live rate parity: <span className="font-semibold text-slate-700">100%</span> | Active listings: <span className="font-semibold text-slate-700">23 rooms</span></p>
              <div className="flex justify-between text-2xs font-mono text-slate-400 pt-1">
                <span>Last Synced: 2 mins ago</span>
                <span>Active Campaign ROI: 410%</span>
              </div>
            </div>

            {/* Direct Web engine */}
            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-indigo-900 text-sm">Direct Hotel Engine</span>
                <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-3xs font-bold font-mono rounded-full">INTERNAL</span>
              </div>
              <p className="text-xs text-indigo-750">Direct commission savings of <span className="font-bold text-indigo-900">18.5%</span>. Live reservation state sync matches room matrix natively.</p>
              <div className="flex justify-between text-2xs font-mono text-indigo-400 pt-1">
                <span>Last Event: Instantaneous</span>
                <span>SSL Secured</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-450 tracking-wider">Historical OTA Synchronization events</h4>
            <div className="bg-slate-900 text-slate-350 p-4 rounded-xl font-mono text-2xs space-y-1.5 h-36 overflow-y-auto">
              <div>[{toISODate()} 14:10] Sync: RECEIVED BOOKING R-2005 - Juliet Capulet via Expedia. Assigned Room 202.</div>
              <div>[{toISODate()} 12:40] Sync: Room Status inventory synced to Booking.com. Occupied rate 34%.</div>
              <div>[{toISODate()} 10:15] Rates: Dispatched dynamic pricing update to GDS channel matrices.</div>
              <div>[{toISODate()} 08:00] Webhooks: Expedia ping checklist success. Keep alive check succeeded.</div>
            </div>
          </div>

          {/* OUTBOUND GUEST PORTAL COMMUNICATOR GATEWAY */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-sm font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail size={15} className="text-indigo-600" /> Outbound Comms Hub: Dispatched Client Portals
                </h4>
                <p className="text-xs text-slate-405">Verifiably track confirmation emails and guest portal linkages triggered upon manual waitlist promotion.</p>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-700 text-3xs font-bold font-mono tracking-wide">
                SYSTEM FEED: ONLINE/OTA CHANNELS
              </span>
            </div>

            {dispatchedEmails.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl text-center space-y-2">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Send size={14} />
                </div>
                <h5 className="text-xs font-sans font-semibold text-slate-700">Comms Outbox Empty</h5>
                <p className="text-2xs text-slate-450 max-w-md mx-auto">
                  When guest bookings are simulated by booking on-line or importing via Expedia & Booking.com, they land as <span className="font-semibold text-amber-600">Waitlisted</span>. 
                  Once you click the <span className="font-semibold text-emerald-600">"Promote"</span> button on any waitlisted reservation inside the registry grid, the system automatically dispatches its formal approval email and companion credentials here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {dispatchedEmails.map((email) => (
                  <div key={email.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-2xs">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono rounded">
                            SENT SUCCESSFULLY
                          </span>
                          <h5 className="text-xs font-sans font-bold text-slate-800 mt-1.5">
                            {email.subject}
                          </h5>
                          <p className="text-2xs text-slate-400">Recipient: <span className="font-semibold text-slate-600">{email.recipientName}</span> ({email.recipientEmail})</p>
                        </div>
                        <span className="text-[10px] font-mono whitespace-nowrap text-slate-400 font-semibold">
                          {email.sentAt}
                        </span>
                      </div>

                      <div className="bg-white border border-slate-150 rounded-xl p-3 text-[11px] font-mono text-slate-650 h-32 overflow-y-auto whitespace-pre-line leading-relaxed">
                        {email.body}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <span className="text-2xs font-mono text-indigo-650 font-semibold bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded">
                        Companion Access Link: {email.linkUrl}
                      </span>
                      <button
                        onClick={() => {
                          setActiveGuestPortalResId(email.reservationId);
                          setPlatformView('mobile');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-sans font-bold text-[11px] rounded-lg shadow-2xs hover:shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer border border-transparent self-end"
                        id={`simulate-guest-${email.reservationId}`}
                      >
                        <ExternalLink size={10} /> Open Guest App Companion
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* YIELD & PRICE POLICY CONTROLLER */}
      {activeTab === 'yield' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-slate-850 dark:text-slate-100 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Yield Pricing Policies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {yieldPolicies.map(policy => (
              <div key={policy.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{policy.name}</h4>
                  {policy.isDefault && (
                    <span className="text-indigo-600 font-bold text-[10px]">Default</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">{policy.description}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Multiplier: {policy.multiplier}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-fade-in" id="pricing-management-view">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-sans font-black text-slate-900 tracking-tight">Rate Plan & Package Management</h3>
              <p className="text-xs text-slate-500 font-sans">Manage global rate strategies, seasonal multipliers, and optional guest service packages.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/30">
            {/* Rate Plans Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider">Institutional Rate Plans</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ratePlans.map(plan => (
                  <div key={plan.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                      {plan.active && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-100">ACTIVE</span>}
                    </div>
                    <p className="text-[10px] text-slate-500">{plan.description}</p>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Base: {plan.baseModifier}x</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seasons Section */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mt-8">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider">Seasonal Yield Rules</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seasons.map(season => (
                  <div key={season.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{season.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <Calendar size={10} />
                      <span>Valid: {season.startMonth+1}/{season.startDay} - {season.endMonth+1}/{season.endDay}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Dynamic Lift: {season.multiplier > 1 ? '+' : ''}{Math.round((season.multiplier - 1) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider">Guest Service Packages</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packages.map(pkg => (
                  <div key={pkg.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                      <span className="font-mono font-black text-indigo-600">{formatAmount(pkg.price)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{pkg.description}</p>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Charge: {pkg.chargeFrequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI FORECASTING TAB VIEW */}
      {activeTab === 'forecast' && (
        <ReservationsForecasting
          reservations={reservations}
          rooms={rooms}
          currentSystemDate={currentSystemDate}
          formatAmount={formatAmount}
          triggerLiveSyncSimulation={triggerLiveSyncSimulation}
          setDemandTier={setDemandTier}
          setSuccessMsg={setSuccessMsg}
          successMsg={successMsg}
        />
      )}

      {activeTab === 'sales' && (
        <SalesMarketingModule />
      )}

      {/* Prefill data when promoting a waitlisted group booking so the form opens as a new group booking with guest info filled */}
      {(() => {
        const groupPrefillData: ReservationFormData | null = (() => {
          if (!promotingGroupRes) return null;
          const groupReservations = reservations.filter(r =>
            r.bookingGroupId === promotingGroupRes.bookingGroupId ||
            r.groupBookingId === promotingGroupRes.groupBookingId
          );
          const roomSelectionsMap = new Map<string, { roomType: string; count: number; roomNumbers: string[] }>();
          groupReservations.forEach(r => {
            const existing = roomSelectionsMap.get(r.roomType);
            if (existing) {
              existing.count++;
              if (r.roomNumber) existing.roomNumbers.push(r.roomNumber);
            } else {
              roomSelectionsMap.set(r.roomType, { roomType: r.roomType, count: 1, roomNumbers: r.roomNumber ? [r.roomNumber] : [] });
            }
          });
          return {
            guestName: promotingGroupRes.guestName,
            guestEmail: promotingGroupRes.guestEmail,
            guestPhone: promotingGroupRes.guestPhone,
            roomType: promotingGroupRes.roomType,
            checkInDate: promotingGroupRes.checkInDate,
            checkOutDate: promotingGroupRes.checkOutDate,
            adults: promotingGroupRes.adults,
            children: promotingGroupRes.children,
            channel: 'Walk-In',
            notes: promotingGroupRes.notes,
            depositAmount: promotingGroupRes.depositAmount || 0,
            isDepositPaid: promotingGroupRes.isDepositPaid || false,
            ratePlanId: promotingGroupRes.ratePlanId || 'RP-STD',
            packageIds: promotingGroupRes.packageIds || [],
            additionalGuestIds: promotingGroupRes.additionalGuestIds || [],
            guestTin: promotingGroupRes.guestTin,
            guestVatNo: promotingGroupRes.guestVatNo,
            guestVatDate: promotingGroupRes.guestVatDate,
            bookingType: 'Group' as const,
            bookingGroupId: promotingGroupRes.bookingGroupId,
            groupName: promotingGroupRes.guestName,
            numberOfRooms: groupReservations.length || 1,
            roomSelections: Array.from(roomSelectionsMap.values()),
          };
        })();

        return (
          <ReservationModal
            isOpen={isNewBookingOpen}
            editingReservation={editingReservation}
            prefillData={groupPrefillData}
            successMsg={successMsg}
            onClose={() => {
              setIsNewBookingOpen(false);
              setEditingReservation(null);
              setPromotingGroupRes(null);
            }}
            onSubmit={handleCreateReservation}
            ratePlans={ratePlans}
            packages={packages}
            corporateAccounts={corporateAccounts}
            rooms={rooms}
            roomTypes={roomTypes}
            reservations={reservations}
            currency={currency}
            formatAmount={formatAmount}
            getYieldMultiplier={getYieldMultiplier}
            getSeasonalMultiplier={(date) => getSeasonalMultiplier(date, seasons)}
            getDailyRateForType={getDailyRateForType}
            currentSystemDate={currentSystemDate}
            getTypeAvailability={getTypeAvailability}
            onReservationClick={(res) => startEditing(res)}
          />
        );
      })()}

      {/* RATE PLAN MODAL */}
      {isRateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-sans font-black text-slate-900 flex items-center gap-2">
                <Tag className="text-amber-500" />
                {editingRatePlan ? 'Edit Rate Plan' : 'Add New Rate Plan'}
              </h3>
              <button onClick={() => setIsRateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRatePlan} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Plan Name</label>
                <input
                  type="text"
                  required
                  value={rpName}
                  onChange={(e) => setRpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans font-bold"
                  placeholder="e.g. Non-Refundable Rate"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Description</label>
                <textarea
                  value={rpDesc}
                  onChange={(e) => setRpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans min-h-[80px]"
                  placeholder="Explain the terms and inclusions of this rate plan..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Base Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={rpModifier}
                    onChange={(e) => setRpModifier(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Status</label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-white transition h-[34px]">
                    <input
                      type="checkbox"
                      checked={rpActive}
                      onChange={(e) => setRpActive(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-[10px] font-sans font-extrabold text-slate-600">Active</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRateModalOpen(false)} className="px-4 py-2 text-xs font-sans font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-slate-800 transition">Save Rate Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKAGE MODAL */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-sans font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" />
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans font-bold"
                  placeholder="e.g. Guided City Tour"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Description</label>
                <textarea
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans min-h-[80px]"
                  placeholder="What is included in this service package?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Price ({currency})</label>
                  <input
                    type="number"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Charge Frequency</label>
                  <select
                    value={pkgFrequency}
                    onChange={(e) => setPkgFrequency(e.target.value as 'once' | 'daily')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans"
                  >
                    <option value="once">One-time Charge</option>
                    <option value="daily">Daily / Repeating</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPackageModalOpen(false)} className="px-4 py-2 text-xs font-sans font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-slate-800 transition">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEASONAL YIELD RULE MODAL */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-sans font-black text-slate-900 flex items-center gap-2">
                <Calendar className="text-amber-500 animate-pulse" size={18} />
                {editingSeason ? 'Edit Season Yield Rule' : 'Add Season Yield Rule'}
              </h3>
              <button onClick={() => setIsSeasonModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSeason} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Season Name / Label</label>
                <input
                  type="text"
                  required
                  value={szName}
                  onChange={(e) => setSzName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-sans font-bold"
                  placeholder="e.g. Mid-Summer High Demand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold block">Start Date Window</span>
                  <div className="flex gap-2">
                    <select
                      value={szStartMonth}
                      onChange={(e) => setSzStartMonth(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                        <option key={idx} value={idx}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      placeholder="Day"
                      value={szStartDay}
                      onChange={(e) => setSzStartDay(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold block">End Date Window</span>
                  <div className="flex gap-2">
                    <select
                      value={szEndMonth}
                      onChange={(e) => setSzEndMonth(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                        <option key={idx} value={idx}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      placeholder="Day"
                      value={szEndDay}
                      onChange={(e) => setSzEndDay(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Price Yield Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="5"
                  required
                  value={szMultiplier}
                  onChange={(e) => setSzMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none font-mono font-bold"
                  placeholder="e.g. 1.25 for +25%, 0.85 for -15%"
                />
                <span className="text-[10px] text-slate-400 font-sans tracking-tight">
                  E.g. <strong className="text-slate-650">1.25</strong> lifts prices by 25%. <strong className="text-slate-650">0.80</strong> discounts them by 20% during this window.
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSeasonModalOpen(false)} className="px-4 py-2 text-xs font-sans font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-slate-800 transition">Save Seasonal Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CALENDAR BOOKING DETAIL VIEW MODAL */}
      {selectedCalendarRes && (() => {
        const liveRes = reservations.find(r => r.id === selectedCalendarRes.id);
        if (!liveRes) return null;

        // Calculate nights
        const nights = Math.max(
          1,
          Math.round(
            (new Date(liveRes.checkOutDate).getTime() - new Date(liveRes.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        // Find vacant rooms of matching room type for mapping
        const vacantRoomsOfType = rooms.filter(
          r => r.type === liveRes.roomType
        );

        return (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col transition-colors duration-300">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/45">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      FOLIO #{liveRes.id}
                    </span>
                    <span className={`px-2 py-0.5 text-3xs font-mono font-bold rounded-full border ${
                      liveRes.status === 'CheckedIn' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-205 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' :
                      liveRes.status === 'Confirmed' ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-205 dark:border-sky-800 text-sky-700 dark:text-sky-400' :
                      liveRes.status === 'Waitlisted' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-205 dark:border-amber-800 text-amber-700 dark:text-amber-400' :
                      liveRes.status === 'Cancelled' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-205 dark:border-rose-800 text-rose-700 dark:text-rose-400' :
                      'bg-slate-50 dark:bg-slate-950/20 border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {liveRes.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white mt-1">
                    Booking Detail Lookup
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedCalendarRes(null)} 
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition cursor-pointer text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                
                {/* Guest Profile Details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-450 dark:text-slate-405 font-extrabold block">Primary Guest Information</span>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-start justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white text-sm block">{liveRes.guestName}</strong>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">{liveRes.guestEmail}</span>
                      <span className="text-[11px] font-mono text-slate-550 dark:text-slate-400 block mt-0.5">{liveRes.guestPhone || 'No recorded phone'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded font-bold border border-indigo-100/50 dark:border-indigo-900/50 block w-fit ml-auto">
                        {liveRes.channel}
                      </span>
                      {onViewGuestProfile && (
                        <button
                          onClick={() => {
                            const guest = guests.find(g =>
                              g.email.toLowerCase() === liveRes.guestEmail.toLowerCase() ||
                              g.name.toLowerCase() === liveRes.guestName.toLowerCase()
                            );
                            if (guest) {
                              onViewGuestProfile(guest.id);
                              setSelectedCalendarRes(null);
                            }
                          }}
                          className="mt-2 text-3xs font-sans font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 justify-end cursor-pointer"
                        >
                          Guest Profile <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stay details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-455 dark:text-slate-405 font-extrabold block">Scheduled Dates</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1">
                      <div className="text-xs font-mono font-bold flex justify-between">
                        <span className="text-slate-400 dark:text-slate-500">In:</span> 
                        <span className="text-slate-805 dark:text-slate-200">{liveRes.checkInDate}</span>
                      </div>
                      <div className="text-xs font-mono font-bold flex justify-between">
                        <span className="text-slate-400 dark:text-slate-500">Out:</span> 
                        <span className="text-slate-805 dark:text-slate-200">{liveRes.checkOutDate}</span>
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-1 flex justify-between">
                        <span>Duration:</span>
                        <span>{nights} Nights ({nights + 1} Days)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-455 dark:text-slate-405 font-extrabold block">Stay Metadata</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-500">Tier:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{liveRes.roomType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-500">Guests:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {liveRes.adults} Ad / {liveRes.children} Ch
                        </span>
                      </div>
                      {liveRes.ratePlanId && (
                        <div className="flex justify-between text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold">
                          <span>Plan:</span>
                          <span className="uppercase">{ratePlans.find(rp => rp.id === liveRes.ratePlanId)?.name || liveRes.ratePlanId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-455 dark:text-slate-405 font-extrabold block">Financial & Posting Ledger</span>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Booked Rate:</span>
                      <span className="font-mono font-black text-slate-800 dark:text-slate-200">{formatAmount(liveRes.rate)} <span className="text-[9px] text-slate-400 font-sans font-normal">/ night</span></span>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-slate-150/40 dark:border-slate-800/65 pt-2.5">
                      <span className="text-slate-900 dark:text-white font-bold text-sm">Total Quote:</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">{formatAmount(liveRes.totalAmount)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-150/45 dark:border-slate-800/65">
                      <div className="flex items-center gap-1">
                        <span className="text-2xs text-slate-400 uppercase font-mono">Invoice:</span>
                        <span className={`px-1.5 py-0.5 text-3xs font-mono font-black rounded uppercase ${
                          liveRes.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-450' :
                          liveRes.paymentStatus === 'Partial' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-850 dark:text-amber-455' : 
                          'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-455'
                        }`}>
                          {liveRes.paymentStatus}
                        </span>
                      </div>

                      {liveRes.depositAmount !== undefined && (
                        <div className="flex items-center gap-2.5 ml-auto">
                          <span className="text-2xs text-slate-400 uppercase font-mono">
                            Deposit: {formatAmount(liveRes.depositAmount)}
                          </span>
                          <button 
                            type="button"
                            onClick={() => updateDepositStatus(liveRes.id, !liveRes.isDepositPaid)}
                            className={`px-2 py-0.5 rounded-full text-3xs font-mono font-bold uppercase transition cursor-pointer ${
                              liveRes.isDepositPaid 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40' 
                                : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            {liveRes.isDepositPaid ? 'DEPOSIT PAID / RECV' : 'DEPOSIT PENDING'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Allocation Status */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-455 dark:text-slate-405 font-extrabold block">Room Allocation Status</span>
                  {liveRes.roomNumber ? (
                    <div className="p-3 bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between font-sans">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-mono text-sm font-black shadow-3xs">
                          Rm {liveRes.roomNumber}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Assigned and allocated</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Inventory Type: {liveRes.roomType}</span>
                        </div>
                      </div>
                      {liveRes.status === 'Confirmed' && (
                        <select
                          value={liveRes.roomNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) assignRoomToReservation(liveRes.id, val);
                          }}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100"
                        >
                          <option value={liveRes.roomNumber}>Keep Rm {liveRes.roomNumber}</option>
                          {vacantRoomsOfType.map(rm => (
                            <option key={rm.id} value={rm.number}>Change to Rm {rm.number}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/5 dark:bg-amber-500/3 border border-amber-200/55 dark:border-amber-900/55 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-amber-800 dark:text-amber-450 text-xs block">Unassigned Hold Block</strong>
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 block font-sans">A room assignment is required before check-in.</span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 rounded-full text-3xs font-mono font-extrabold uppercase animate-pulse">
                          No Assign
                        </span>
                      </div>

                      {vacantRoomsOfType.length > 0 ? (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono uppercase text-slate-400 font-extrabold block">Select available vacant room</label>
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) assignRoomToReservation(liveRes.id, val);
                            }}
                            className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono rounded-xl focus:ring-1 focus:ring-amber-500 cursor-pointer text-slate-800 dark:text-slate-100"
                            defaultValue=""
                          >
                            <option value="">-- Choose Vacant {liveRes.roomType} Room --</option>
                            {vacantRoomsOfType.map(rm => (
                              <option key={rm.id} value={rm.number}>Room {rm.number}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-rose-650 dark:text-rose-450 font-bold bg-rose-50/20 dark:bg-rose-950/10 p-1.5 rounded-lg border border-rose-200/50">
                          ALERT: No available vacant {liveRes.roomType} rooms in system buffer to allocate right now!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Notes & Special Requests */}
                {liveRes.notes && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-455 dark:text-slate-405 font-extrabold block">(Special Requests & Booking Notes)</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-650 dark:text-slate-300 italic font-sans leading-relaxed">
                      {liveRes.notes}
                    </div>
                  </div>
                )}

                {/* Early / Late C/O Flags */}
                {(liveRes.earlyCheckOutRequested || liveRes.lateCheckOutRequested) && (
                  <div className="flex gap-2">
                    {liveRes.earlyCheckOutRequested && (
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-3xs font-bold rounded-lg font-mono">
                        Early Checkout Request Buffered
                      </span>
                    )}
                    {liveRes.lateCheckOutRequested && (
                      <span className="px-2 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-750 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-3xs font-bold rounded-lg font-mono">
                        Late Checkout Request Buffered
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer (Action Panel) */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCalendarRes(null)}
                  className="px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-sans font-bold text-slate-500 dark:text-slate-400 cursor-pointer"
                >
                  Close
                </button>

                {liveRes.status !== 'CheckedOut' && liveRes.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      startEditing(liveRes);
                      setSelectedCalendarRes(null);
                    }}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-805 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-xs font-sans font-bold rounded-xl transition cursor-pointer"
                  >
                    Edit / Modify
                  </button>
                )}

                {liveRes.status === 'Confirmed' && (
                  <>
                    {liveRes.roomNumber ? (
                      <button
                        type="button"
                        onClick={() => {
                          checkInReservation(liveRes.id, liveRes.roomNumber!);
                          onNavigateToCRM?.({ 
                            id: liveRes.id, 
                            roomNumber: liveRes.roomNumber, 
                            guestName: liveRes.guestName, 
                            guestEmail: liveRes.guestEmail, 
                            guestPhone: liveRes.guestPhone, 
                            checkInDate: liveRes.checkInDate 
                          });
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-sans font-bold rounded-xl transition shadow-3xs cursor-pointer"
                      >
                        Check In Guest
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 text-xs font-sans font-medium rounded-xl cursor-not-allowed"
                        title="You must allocate a room number first"
                      >
                        Check In (No Room)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        updateReservationStatus(liveRes.id, 'Cancelled');
                      }}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/15 text-rose-705 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-sans font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel Reservation
                    </button>
                  </>
                )}

                {liveRes.status === 'CheckedIn' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onProcessCheckout) {
                        onProcessCheckout(liveRes.id);
                      } else {
                        checkOutReservation(liveRes.id);
                      }
                      setSelectedCalendarRes(null);
                    }}
                    className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-sans font-bold rounded-xl transition shadow-3xs cursor-pointer"
                  >
                    Check Out Guest
                  </button>
                )}

                {(liveRes.status === 'Cancelled' || liveRes.status === 'Waitlisted') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (liveRes.status === 'Waitlisted') {
                        setSelectedCalendarRes(null);
                        if (liveRes.isGroup || liveRes.bookingGroupId) {
                          startPromotingGroup(liveRes);
                        } else {
                          startEditing(liveRes);
                        }
                      } else {
                        updateReservationStatus(liveRes.id, 'Confirmed');
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold rounded-xl transition shadow-3xs cursor-pointer"
                  >
                    {liveRes.status === 'Waitlisted' ? 'Promote / Confirm' : 'Re-confirm Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
