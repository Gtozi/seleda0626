import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getEffectiveNightlyRate } from '../utils/pricing';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  Check,
  Loader2,
  Sparkles,
  Bed,
  Info,
  CreditCard,
  Shield,
  ChevronRight,
  ChevronLeft,
  Star,
  Wifi,
  Coffee,
  Wind,
  Bath,
  Tv,
  Zap,
  UtensilsCrossed,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  ShoppingBag,
  ScrollText,
  Maximize,
  Clock,
  Plane,
  Search,
  Compass,
  Gift,
  Shirt,
  GlassWater,
  Heart,
  Percent,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Building
} from 'lucide-react';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import AirportShuttleModal, { AirportShuttleDetails } from './AirportShuttleModal';

interface PublicRoom {
  type: string;
  title: string;
  description: string;
  rate: number;
  capacity: number;
  available: number;
  features: string[];
  imageUrl: string;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  roomSizeSqm?: number;
  bedConfiguration?: string;
  displayOrder?: number;
  totalRooms?: number;
  isActive?: boolean;
}

interface PublicPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  chargeFrequency: 'once' | 'daily';
  quantity?: number;
}

interface PublicGuestService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  quantity?: number;
}

interface PublicSettings {
  customHotelName: string;
  customHotelAddress: string;
  publicTagline: string;
  heroImageUrl: string;
  hotelLogo?: string;
  contactPhone: string;
  contactEmail: string;
  taxPercent: number;
  serviceChargePercent: number;
  exchangeRate: number;
  publicBookingEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  bookingTerms: string;
  // Business admin extended fields
  hotelTin?: string;
  hotelVatNo?: string;
  invoiceBankDetails?: string;
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: string;
  feeComponents?: Array<{
    id: string;
    name: string;
    feeType: 'percentage' | 'fixed_amount';
    value: number;
    isEnabled: boolean;
  }>;
  policySections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  cancellationGraceHours?: number;
  cancellationPenaltyPercent?: number;
  // Booking page content fields
  bookingHeroTitle?: string;
  bookingHeroDescription?: string;
  bookingStep1Label?: string;
  bookingStep2Label?: string;
  bookingStep3Label?: string;
  bookingRoomsSectionTitle?: string;
  bookingPackagesSectionTitle?: string;
  bookingGuestServicesSectionTitle?: string;
  bookingYourRoomsTitle?: string;
  bookingGuestDetailsTitle?: string;
  bookingSummaryTitle?: string;
  bookingHeaderSubtitle?: string;
  bookingNoRoomsMessage?: string;
  bookingNoRoomsSubtext?: string;
  bookingTermsAgreement?: string;
  bookingReadTermsText?: string;
  bookingConfirmButtonText?: string;
  bookingSecureBookingText?: string;
}

interface SelectedItem {
  roomType: string;
  quantity: number;
}


const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getFourDaysLaterStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toISOString().split('T')[0];
};

const calculateNights = (inStr: string, outStr: string) => {
  if (!inStr || !outStr) return 0;
  const diff = new Date(outStr).getTime() - new Date(inStr).getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

const formatPrice = (n: number) => `$${n.toLocaleString()}`;

const featureIcons: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'Breakfast': Coffee,
  'AC': Wind,
  'Air Conditioning': Wind,
  'Mini Bar': Zap,
  'TV': Tv,
  'Bath': Bath,
  'Restaurant': UtensilsCrossed,
  'Room Service': UtensilsCrossed,
};

const FeatureBadge = ({ text }: { text: string; key?: string | number }) => {
  const Icon = featureIcons[text] || Star;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 border border-stone-200 rounded-full text-[10px] font-semibold text-stone-600">
      <Icon size={12} /> <span>{text}</span>
    </span>
  );
};

const Counter = ({ label, value, onChange, min = 0, max = 10 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-stone-700">{label}</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-stone-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

const parseHighlights = (description: string) => {
  if (!description) return [];
  let items = [];
  if (description.includes(';')) {
    items = description.split(';');
  } else if (description.includes('\n')) {
    items = description.split('\n');
  } else if (description.split(',').length > 2) {
    items = description.split(',');
  } else {
    items = [description];
  }
  return items.map(i => i.trim()).filter(i => i.length > 0);
};

const serviceCategoryIcons: Record<string, React.ElementType> = {
  dining: Coffee,
  transportation: Plane,
  laundry: Shirt,
  spa: Sparkles,
  room_service: Bed,
  concierge: Compass,
};

const getServiceIcon = (name: string, category?: string) => {
  const normCat = category?.toLowerCase().trim().replace('-', '_') || '';
  if (serviceCategoryIcons[normCat]) {
    return serviceCategoryIcons[normCat];
  }
  
  const term = `${name} ${normCat}`.toLowerCase();
  if (term.includes('airport') || term.includes('shuttle') || term.includes('transfer') || term.includes('transport') || term.includes('car')) {
    return Plane;
  }
  if (term.includes('massage') || term.includes('spa') || term.includes('wellness') || term.includes('yoga') || term.includes('sauna') || term.includes('treatment')) {
    return Sparkles;
  }
  if (term.includes('breakfast') || term.includes('dinner') || term.includes('lunch') || term.includes('meal') || term.includes('food') || term.includes('dining') || term.includes('restaurant')) {
    return Coffee;
  }
  if (term.includes('wine') || term.includes('champagne') || term.includes('bar') || term.includes('drink') || term.includes('cocktail')) {
    return GlassWater;
  }
  if (term.includes('laundry') || term.includes('cleaning') || term.includes('housekeeping') || term.includes('washing')) {
    return Shirt;
  }
  if (term.includes('tour') || term.includes('activity') || term.includes('safari') || term.includes('trip') || term.includes('excursion') || term.includes('guide')) {
    return Compass;
  }
  if (term.includes('gift') || term.includes('souvenir') || term.includes('basket')) {
    return Gift;
  }
  return Heart;
};

const categoryMetadata: Record<string, { label: string; icon: React.ElementType }> = {
  all: { label: 'All Services', icon: ShoppingBag },
  dining: { label: 'Dining', icon: Coffee },
  transportation: { label: 'Transportation', icon: Plane },
  laundry: { label: 'Laundry', icon: Shirt },
  spa: { label: 'Spa & Wellness', icon: Sparkles },
  room_service: { label: 'Room Service', icon: Bed },
  concierge: { label: 'Concierge', icon: Compass },
  other: { label: 'Other', icon: Heart }
};

const getCategoryMeta = (cat: string) => {
  const norm = cat.toLowerCase().trim().replace('-', '_');
  if (categoryMetadata[norm]) return categoryMetadata[norm];
  return {
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    icon: Gift
  };
};

export default function BookingPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [guestServices, setGuestServices] = useState<PublicGuestService[]>([]);
  const [ratePlans, setRatePlans] = useState<any[]>([]);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>('');
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [checkIn, setCheckIn] = useState<string>(getTomorrowStr());
  const [checkOut, setCheckOut] = useState<string>(getFourDaysLaterStr());
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedPackageQuantities, setSelectedPackageQuantities] = useState<Record<string, number>>({});
  const [selectedGuestServiceQuantities, setSelectedGuestServiceQuantities] = useState<Record<string, number>>({});

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNationality, setGuestNationality] = useState('');
  const [groupName, setGroupName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [airportShuttleDetails, setAirportShuttleDetails] = useState<AirportShuttleDetails>({
    pickup: {
      quantity: 0,
      flightNumber: '',
      flightTime: '',
      scheduledDate: checkIn,
      scheduledTime: ''
    },
    dropOff: {
      quantity: 0,
      flightNumber: '',
      flightTime: '',
      scheduledDate: checkOut,
      scheduledTime: ''
    },
    notes: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showShuttleModal, setShowShuttleModal] = useState(false);
  const wasShuttleSelectedRef = useRef(false);

  // Add-ons page filters and search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payment gateway states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'telebirr' | 'bank'>('bank');
  const [paying, setPaying] = useState(false);
  const [paymentCardName, setPaymentCardName] = useState('');
  const [paymentCardNum, setPaymentCardNum] = useState('');
  const [paymentCardExpiry, setPaymentCardExpiry] = useState('');
  const [paymentCardCVC, setPaymentCardCVC] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [showWaitlistedReceipt, setShowWaitlistedReceipt] = useState(false);

  // B2B state fields
  const [tourOperators, setTourOperators] = useState<any[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Multi-step booking state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ reservationIds: string[]; totalAmount: number; isGroupBooking?: boolean; groupBookingId?: string | null; status?: string } | null>(null);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/public/settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const { settings } = await res.json();
        setSettings(settings);
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      setError('');
      try {
        const [roomsRes, pkgRes, gsRes] = await Promise.all([
          fetch(`/api/public/rooms?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`),
          fetch('/api/public/packages'),
          fetch('/api/public/guest-services')
        ]);
        if (!roomsRes.ok) throw new Error('Failed to load rooms');
        if (!pkgRes.ok) throw new Error('Failed to load packages');
        if (!gsRes.ok) throw new Error('Failed to load guest services');
        const roomsData = await roomsRes.json();
        const pkgData = await pkgRes.json();
        const gsData = await gsRes.json();
        setRooms(roomsData.rooms || []);
        setPackages(pkgData.packages || []);
        setGuestServices(gsData.guestServices || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, [checkIn, checkOut]);

  // Load tour operators for B2B booking
  useEffect(() => {
    const loadTourOperators = async () => {
      try {
        const res = await fetch('/api/b2b/operators');
        if (res.ok) {
          const data = await res.json();
          setTourOperators(data.filter((op: any) => op.is_active));
        }
      } catch (e) {
        console.error('Failed to load tour operators:', e);
      }
    };
    loadTourOperators();
  }, []);

  // Load rate plans and seasons
  useEffect(() => {
    const loadRatePlansAndSeasons = async () => {
      try {
        const [rpRes, roomsRes] = await Promise.all([
          fetch('/api/public/rate-plans'),
          fetch(`/api/public/rooms?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`)
        ]);
        if (rpRes.ok) {
          const rpData = await rpRes.json();
          setRatePlans(rpData.ratePlans || []);
        }
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setSeasons(roomsData.seasons || []);
        }
      } catch (e) {
        console.error('Failed to load rate plans/seasons:', e);
      }
    };
    loadRatePlansAndSeasons();
  }, [checkIn, checkOut]);

  // Voucher redemption function
  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    setVoucherError('');
    try {
      const res = await fetch('/api/b2b/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucher_number: voucherCode })
      });
      if (!res.ok) {
        const err = await res.json();
        setVoucherError(err.error || 'Invalid voucher');
        setVoucherDiscount(0);
      } else {
        const data = await res.json();
        setVoucherDiscount(data.discount_amount || 0);
        setVoucherError('');
      }
    } catch (e) {
      setVoucherError('Failed to apply voucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Keep airport shuttle scheduled dates aligned with stay dates
  useEffect(() => {
    setAirportShuttleDetails(prev => ({
      ...prev,
      pickup: { ...prev.pickup, scheduledDate: checkIn },
      dropOff: { ...prev.dropOff, scheduledDate: checkOut }
    }));
  }, [checkIn, checkOut]);

  const setRoomQuantity = useCallback((roomType: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.roomType !== roomType));
    } else {
      setSelectedItems(prev => {
        const existing = prev.find(item => item.roomType === roomType);
        if (!existing) return [...prev, { roomType, quantity }];
        return prev.map(item => item.roomType === roomType ? { ...item, quantity } : item);
      });
    }
  }, []);

  const totalSelectedRooms = useMemo(() => selectedItems.reduce((sum, item) => sum + item.quantity, 0), [selectedItems]);

  const selectedPackageIds = useMemo(
    () => Object.entries(selectedPackageQuantities).flatMap(([id, qty]) => Array(qty).fill(id)),
    [selectedPackageQuantities]
  );

  const selectedGuestServiceIds = useMemo(
    () => Object.entries(selectedGuestServiceQuantities).flatMap(([id, qty]) => Array(qty).fill(id)),
    [selectedGuestServiceQuantities]
  );

  const selectedPackages = useMemo(
    () => packages.filter(p => (selectedPackageQuantities[p.id] || 0) > 0).map(p => ({ ...p, quantity: selectedPackageQuantities[p.id] })),
    [packages, selectedPackageQuantities]
  );

  const selectedGuestServices = useMemo(
    () => guestServices.filter(gs => (selectedGuestServiceQuantities[gs.id] || 0) > 0).map(gs => ({ ...gs, quantity: selectedGuestServiceQuantities[gs.id] })),
    [guestServices, selectedGuestServiceQuantities]
  );

  const uniqueCategories = useMemo(() => {
    const cats = new Set(guestServices.map(gs => gs.category?.toLowerCase().trim() || 'other'));
    return ['all', ...Array.from(cats)];
  }, [guestServices]);

  const filteredGuestServices = useMemo(() => {
    return guestServices.filter(gs => {
      const matchCat = selectedCategory === 'all' || gs.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      const matchSearch = !searchQuery || gs.name.toLowerCase().includes(searchQuery.toLowerCase()) || gs.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [guestServices, selectedCategory, searchQuery]);

  // Auto-open shuttle modal when the shuttle service is newly selected
  useEffect(() => {
    const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
    const isShuttleSelected = !!shuttleService;
    if (isShuttleSelected && !wasShuttleSelectedRef.current) {
      setShowShuttleModal(true);
    }
    wasShuttleSelectedRef.current = isShuttleSelected;
  }, [selectedGuestServices]);

  const pricing = useMemo(() => {
    if (selectedItems.length === 0 || nights === 0) return { roomTotal: 0, packageTotal: 0, guestServicesTotal: 0, tax: 0, serviceCharge: 0, total: 0, additionalFees: 0, seasonMultiplier: 1, ratePlanModifier: 1, seasonName: '', ratePlanName: '', addonDetails: [] };

    // Calculate room total (base rate only - fees calculated by DB)
    const roomTotal = selectedItems.reduce((sum, item) => {
      const room = rooms.find(r => r.type === item.roomType);
      const baseRate = room ? room.baseRate || room.rate : 0;
      return sum + baseRate * nights * item.quantity;
    }, 0);

    const packageTotal = selectedPackages.reduce((sum, p) => sum + p.price * p.quantity * (p.chargeFrequency === 'daily' ? nights : 1), 0);
    const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
    const shuttleQuantity = (shuttleService ? airportShuttleDetails.pickup.quantity + airportShuttleDetails.dropOff.quantity : 0);
    const guestServicesTotal = selectedGuestServices.reduce((sum, gs) => {
      const isShuttle = gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle');
      return sum + gs.price * (isShuttle ? shuttleQuantity : gs.quantity);
    }, 0);
    const subtotal = roomTotal + packageTotal + guestServicesTotal;

    // Return base pricing - fees will be calculated by DB API
    return {
      roomTotal,
      packageTotal,
      guestServicesTotal,
      tax: 0,
      serviceCharge: 0,
      additionalFees: 0,
      total: subtotal,
      seasonMultiplier: 1,
      ratePlanModifier: 1,
      seasonName: '',
      ratePlanName: '',
      addonDetails: [],
      subtotal
    };
  }, [selectedItems, rooms, nights, selectedPackages, selectedGuestServices, checkIn]);

  // Fetch fee breakdown from database
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  
  useEffect(() => {
    const fetchFeeBreakdown = async () => {
      if (pricing.subtotal > 0 && settings) {
        try {
          const params = new URLSearchParams({
            baseAmount: pricing.subtotal.toString(),
          });
          const response = await fetch(`/api/public/billing/calculate-breakdown?${params}`);
          if (response.ok) {
            const data = await response.json();
            setFeeBreakdown(data);
          }
        } catch (error) {
          console.error('Error fetching fee breakdown:', error);
        }
      }
    };
    fetchFeeBreakdown();
  }, [pricing.subtotal, settings]);

  // Combine base pricing with DB fee breakdown
  const finalPricing = useMemo(() => {
    if (!feeBreakdown) return pricing;
    
    return {
      ...pricing,
      tax: feeBreakdown.vat_amount || 0,
      serviceCharge: feeBreakdown.service_charge_total || 0,
      additionalFees: feeBreakdown.non_vat_fees || 0,
      total: feeBreakdown.total_amount || finalPricing.subtotal,
      addonDetails: (feeBreakdown.fee_breakdown || []).map((f: any) => ({
        name: f.name,
        amount: f.amount
      }))
    };
  }, [pricing, feeBreakdown]);

  const setPackageQuantity = useCallback((id: string, quantity: number) => {
    setSelectedPackageQuantities(prev => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: quantity };
    });
  }, []);

  const setGuestServiceQuantity = useCallback((id: string, quantity: number) => {
    setSelectedGuestServiceQuantities(prev => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: quantity };
    });
  }, []);

  // Step navigation
  const canProceedToStep2 = useMemo(() => {
    return selectedItems.length > 0 && nights > 0;
  }, [selectedItems, nights]);

  const canProceedToStep3 = useMemo(() => {
    if (!canProceedToStep2) return false;
    const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
    if (shuttleService) {
      const hasActivePickup = airportShuttleDetails.pickup.quantity > 0;
      const hasActiveDropOff = airportShuttleDetails.dropOff.quantity > 0;
      if (!hasActivePickup && !hasActiveDropOff) return false;
      const pickupValid = !hasActivePickup || (airportShuttleDetails.pickup.scheduledTime.trim() !== '' && airportShuttleDetails.pickup.flightNumber.trim() !== '');
      const dropOffValid = !hasActiveDropOff || (airportShuttleDetails.dropOff.scheduledTime.trim() !== '' && airportShuttleDetails.dropOff.flightNumber.trim() !== '');
      return pickupValid && dropOffValid;
    }
    return true;
  }, [canProceedToStep2, selectedGuestServices, airportShuttleDetails]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      if (currentStep === 1 && !canProceedToStep2) return;
      if (currentStep === 2 && !canProceedToStep3) return;
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceedToStep2, canProceedToStep3]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      if (step === 2 && !canProceedToStep2) return;
      if (step === 3 && !canProceedToStep3) return;
      setCurrentStep(step);
    }
  }, [canProceedToStep2, canProceedToStep3]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || nights === 0 || !agreed) return;
    
    // Validate required fields
    const isGroup = selectedItems.reduce((sum, s) => sum + s.quantity, 0) > 1;
    if (!guestEmail.trim()) {
      setError('Email address is required');
      return;
    }
    if (isGroup) {
      if (!primaryContact.trim()) {
        setError('Primary contact is required for group bookings');
        return;
      }
      if (!groupName.trim()) {
        setError('Group name is required for group bookings');
        return;
      }
    } else {
      if (!guestName.trim()) {
        setError('Guest name is required');
        return;
      }
    }
    
    setSubmitting(true);
    setError('');
    try {
      const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
      const isGroup = selectedItems.reduce((sum, s) => sum + s.quantity, 0) > 1;
      // For group bookings, use primaryContact as guestName; for individual, use guestName
      const effectiveGuestName = isGroup ? (primaryContact || guestName) : guestName;
      const requestBody: Record<string, any> = {
        checkIn,
        checkOut,
        guestName: effectiveGuestName,
        guestEmail,
        guestPhone,
        guestNationality,
        groupName,
        primaryContact,
        packageIds: selectedPackageIds,
        guestServiceIds: selectedGuestServiceIds,
        specialRequests,
        items: selectedItems.map(item => ({
          roomType: item.roomType,
          quantity: item.quantity,
          adults,
          children
        })),
        // B2B fields
        operator_id: selectedOperatorId || null,
        voucher_code: voucherCode || null,
        voucher_discount: voucherDiscount,
        ratePlanId: selectedRatePlanId || null
      };
      if (shuttleService) {
        const shuttleRequests: Array<{
          shuttleType: 'Pickup' | 'Drop-off';
          quantity: number;
          flightNumber: string;
          flightTime: string;
          scheduledDate: string;
          scheduledTime: string;
          notes: string;
        }> = [];
        if (airportShuttleDetails.pickup.quantity > 0) {
          shuttleRequests.push({ shuttleType: 'Pickup', ...airportShuttleDetails.pickup, notes: airportShuttleDetails.notes });
        }
        if (airportShuttleDetails.dropOff.quantity > 0) {
          shuttleRequests.push({ shuttleType: 'Drop-off', ...airportShuttleDetails.dropOff, notes: airportShuttleDetails.notes });
        }
        requestBody.airportShuttleRequests = shuttleRequests;
      }
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setConfirmation({
        reservationIds: data.reservationIds,
        totalAmount: data.totalAmount,
        isGroupBooking: data.isGroupBooking,
        groupBookingId: data.groupBookingId,
        status: data.status
      });
    } catch (e: any) {
      setError(e.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setPaying(true);
    setPaymentError('');
    try {
      const details: Record<string, string> = {};
      if (paymentMethod === 'card') {
        if (!paymentCardNum || !paymentCardExpiry || !paymentCardCVC) {
          throw new Error('Please fill in all credit card details.');
        }
        details.cardholderName = paymentCardName;
        details.maskedCardNumber = `•••• •••• •••• ${paymentCardNum.slice(-4)}`;
      } else if (paymentMethod === 'telebirr') {
        if (!paymentPhone) {
          throw new Error('Please enter your mobile wallet number.');
        }
        details.phoneNumber = paymentPhone;
      }
      
      const res = await fetch('/api/public/bookings/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationIds: confirmation.reservationIds,
          paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'telebirr' ? 'Mobile Money (Telebirr)' : 'Direct Bank Transfer',
          paymentDetails: details
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment processing failed');
      
      setConfirmation(prev => prev ? { ...prev, status: 'Confirmed' } : null);
    } catch (e: any) {
      setPaymentError(e.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  };

  if (settings?.maintenanceMode || settings?.publicBookingEnabled === false) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-md space-y-5">
          <div className="inline-flex p-4 bg-white/5 border border-white/10 rounded-2xl">
            <Shield size={32} className="text-amber-400" />
          </div>
          <h1 className="text-white font-semibold text-2xl tracking-tight">Booking Temporarily Unavailable</h1>
          <p className="text-stone-400 text-sm leading-relaxed">{settings?.maintenanceMessage || 'Please contact the front desk to make a reservation.'}</p>
        </motion.div>
      </div>
    );
  }

  if (confirmation) {
    const isWaitlisted = confirmation.status === 'Waitlisted';
    
    // Format check-in / check-out nicely
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const optionsDateLong: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    
    const displayCheckIn = checkInDate.toLocaleDateString('en-US', optionsDateLong);
    const displayCheckOut = checkOutDate.toLocaleDateString('en-US', optionsDateLong);

    // If waitlisted and they haven't bypassed checkout, show the Payment Checkout page
    if (isWaitlisted && !showWaitlistedReceipt) {
      return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Top Security Info Header */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-stone-900 text-sm">Your Reservation is Waitlisted</h2>
                  <p className="text-xs text-stone-600 mt-0.5">To transition your stay status to <strong className="text-stone-900">Confirmed</strong> and guarantee your selected rooms, please complete your secure booking deposit.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWaitlistedReceipt(true)}
                className="shrink-0 self-start sm:self-center px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer"
              >
                Skip / View Receipt
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Secure Checkout Form */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-6">
                <div className="border-b border-stone-100 pb-4 space-y-1">
                  <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={20} /> Secure Reservation Gateway
                  </h3>
                  <p className="text-xs text-stone-500">Your details are processed with end-to-end bank-grade encryption.</p>
                </div>

                <form onSubmit={handleCompletePayment} className="space-y-6">
                  {/* Select Payment Method */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Payment Method</label>
                    <div className="grid grid-cols-1 gap-3 max-w-sm">
                      {/* Commented out Credit Card & Telebirr methods for the time being
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('card'); setPaymentError(''); }}
                        className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-amber-500 bg-amber-500/5 text-stone-900 shadow-sm ring-1 ring-amber-500'
                            : 'border-stone-200 text-stone-500 hover:border-amber-400 hover:text-stone-700'
                        }`}
                      >
                        <CreditCard size={18} />
                        <span className="text-[11px] font-bold">Credit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('telebirr'); setPaymentError(''); }}
                        className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'telebirr'
                            ? 'border-amber-500 bg-amber-500/5 text-stone-900 shadow-sm ring-1 ring-amber-500'
                            : 'border-stone-200 text-stone-500 hover:border-amber-400 hover:text-stone-700'
                        }`}
                      >
                        <Zap size={18} />
                        <span className="text-[11px] font-bold">Telebirr</span>
                      </button>
                      */}
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('bank'); setPaymentError(''); }}
                        className={`p-3.5 border rounded-xl flex flex-row items-center justify-center gap-3 transition-all cursor-pointer ${
                          paymentMethod === 'bank'
                            ? 'border-amber-500 bg-amber-500/5 text-stone-900 shadow-sm ring-1 ring-amber-500'
                            : 'border-stone-200 text-stone-500 hover:border-amber-400 hover:text-stone-700'
                        }`}
                      >
                        <MapPin size={18} className="text-amber-500" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Direct Bank Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Card Details inputs */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Name on Card</label>
                        <input
                          type="text"
                          required
                          value={paymentCardName}
                          onChange={e => setPaymentCardName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-medium text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Card Number</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={paymentCardNum}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            const matches = val.match(/\d{4,16}/g);
                            const match = matches && matches[0] || '';
                            const parts = [];
                            for (let i=0, len=match.length; i<len; i+=4) {
                              parts.push(match.substring(i, i+4));
                            }
                            if (parts.length > 0) {
                              setPaymentCardNum(parts.join(' '));
                            } else {
                              setPaymentCardNum(val);
                            }
                          }}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-mono tracking-wider font-semibold text-stone-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Expiry Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={paymentCardExpiry}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 2) {
                                setPaymentCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                              } else {
                                setPaymentCardExpiry(val);
                              }
                            }}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-mono tracking-widest font-semibold text-stone-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">CVC / CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={paymentCardCVC}
                            onChange={e => setPaymentCardCVC(e.target.value.replace(/\D/g, ''))}
                            placeholder="•••"
                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-mono tracking-widest font-semibold text-stone-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Mobile Money (Telebirr) inputs */}
                  {paymentMethod === 'telebirr' && (
                    <div className="space-y-4 bg-stone-50 p-4 border border-stone-100 rounded-2xl">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Telebirr Registered Number</label>
                        <div className="flex gap-2">
                          <span className="px-4 py-2.5 bg-stone-200 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 flex items-center shrink-0">
                            +251
                          </span>
                          <input
                            type="tel"
                            required
                            value={paymentPhone}
                            onChange={e => setPaymentPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="911223344"
                            className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-bold text-stone-800"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">We will send a secure transaction approval prompt to your mobile device.</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Bank Transfer details */}
                  {paymentMethod === 'bank' && (
                    <div className="space-y-4 bg-stone-50 p-5 border border-stone-200 rounded-2xl text-xs text-stone-600">
                      {settings?.invoiceBankDetails ? (
                        <div className="space-y-3">
                          <p className="font-bold text-stone-800 flex items-center gap-1 border-b border-stone-200/60 pb-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Official Bank Transfer Details
                          </p>
                          <div className="whitespace-pre-line leading-relaxed pl-1 text-stone-700 font-medium font-sans">
                            {settings.invoiceBankDetails}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="font-bold text-stone-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Commercial Bank of Ethiopia (CBE)
                            </p>
                            <p className="pl-2.5 text-stone-500">Account Name: <strong className="text-stone-800">SELEDA Luxury Resort Booking</strong></p>
                            <p className="pl-2.5 text-stone-500">Account Number: <strong className="font-mono text-stone-800 text-sm">1000 4829 3819 1932</strong></p>
                          </div>
                          <div className="space-y-2 border-t border-stone-100 pt-3">
                            <p className="font-bold text-stone-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Awash Bank
                            </p>
                            <p className="pl-2.5 text-stone-500">Account Name: <strong className="text-stone-800">SELEDA Resort PLC</strong></p>
                            <p className="pl-2.5 text-stone-500">Account Number: <strong className="font-mono text-stone-800 text-sm">0132 0293 4819 2831</strong></p>
                          </div>
                        </>
                      )}
                      <div className="bg-white p-3 border border-stone-100 rounded-xl text-[10px] leading-normal text-stone-500 mt-2">
                        Please proceed with transfer of the total amount. Submit payment receipt with your <strong>Reservation ID ({confirmation.reservationIds[0]})</strong> to <strong className="text-amber-600">{settings?.contactEmail || 'billing@seledaresort.com'}</strong>.
                      </div>
                    </div>
                  )}

                  {paymentError && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100/50 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} /> {paymentError}
                    </p>
                  )}

                  {/* Pay button for card/telebirr */}
                  {paymentMethod !== 'bank' && (
                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-md shadow-stone-900/5"
                    >
                      {paying ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Processing Secure Payment...
                        </>
                      ) : (
                        `Pay ${formatPrice(confirmation.totalAmount)} & Confirm stay`
                      )}
                    </button>
                  )}
                </form>

                {/* Bank transfer button outside form */}
                {paymentMethod === 'bank' && (
                  <button
                    type="button"
                    onClick={async () => {
                      setPaying(true);
                      setPaymentError('');
                      try {
                        const res = await fetch('/api/public/bookings/confirm-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            reservationIds: confirmation.reservationIds,
                            paymentMethod: 'Direct Bank Transfer',
                            paymentDetails: { method: 'Bank Transfer' }
                          })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Payment confirmation failed');
                        setConfirmation(prev => prev ? { ...prev, status: 'Confirmed' } : null);
                        setShowWaitlistedReceipt(true);
                      } catch (e: any) {
                        setPaymentError(e.message || 'Payment confirmation failed');
                      } finally {
                        setPaying(false);
                      }
                    }}
                    disabled={paying}
                    className="w-full py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-md shadow-stone-900/5"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Confirming Payment...
                      </>
                    ) : (
                      'Confirm & View Transfer Reservation Receipt'
                    )}
                  </button>
                )}
              </div>

              {/* Right Column: Mini Selection Breakdown & Invoice Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                  <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2.5">
                    Reservation Details
                  </h3>
                  
                  {/* Basic Stay Info */}
                  <div className="text-xs space-y-2 text-stone-600 pb-2 border-b border-stone-100">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Check-In</span>
                      <span className="font-bold text-stone-800">{displayCheckIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Check-Out</span>
                      <span className="font-bold text-stone-800">{displayCheckOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Stay Duration</span>
                      <span className="font-bold text-stone-800">{nights} Night{nights > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Guests</span>
                      <span className="font-bold text-stone-800">{adults} Adult{adults > 1 ? 's' : ''} {children > 0 ? `· ${children} Child` : ''}</span>
                    </div>
                  </div>

                  {/* Rooms Selected */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">Your Rooms</span>
                    {selectedItems.map(item => {
                      const room = rooms.find(r => r.type === item.roomType);
                      if (!room) return null;
                      return (
                        <div key={item.roomType} className="flex justify-between text-xs font-semibold text-stone-800">
                          <span className="truncate">{room.title} (x{item.quantity})</span>
                          <span>{formatPrice(room.rate * nights * item.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Subtotal breakdown */}
                  <div className="border-t border-stone-100 pt-3 mt-3 text-xs space-y-1.5 text-stone-600">
                    {finalPricing.packageTotal > 0 && (
                      <div className="flex justify-between">
                        <span>VIP Upgrades</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.packageTotal)}</span>
                      </div>
                    )}
                    {finalPricing.guestServicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Guest Services</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.guestServicesTotal)}</span>
                      </div>
                    )}
                    {finalPricing.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Estimated Taxes</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.tax)}</span>
                      </div>
                    )}
                    {finalPricing.serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.serviceCharge)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-dashed border-stone-200 pt-3 mt-3 flex justify-between items-baseline">
                      <span className="font-black text-stone-900 text-sm">TOTAL AMOUNT</span>
                      <span className="text-xl font-black text-amber-600">{formatPrice(confirmation.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Secure Badge trust footer */}
                <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl flex items-start gap-2 text-xs text-stone-500">
                  <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <span>
                    <strong>Cancellation Grace Period:</strong> Free cancellation up to 48 hours before check-in. If cancelled in time, your secure deposit is 100% refunded to your payment method automatically.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    // Otherwise, show the Receipt Confirmation Page (either Confirmed Paid or Waitlisted Unpaid)
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Action Row (Hidden on print) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isWaitlisted ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-semibold text-stone-600">
                {isWaitlisted ? 'Waitlisted (Pending Secure Payment)' : 'Reservation Confirmed & Paid'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Printer size={14} /> Print Confirmation
              </button>
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Make Another Booking
              </button>
            </div>
          </div>

          {/* Waitlisted Alert Action Banner (Only visible if waitlisted receipt) */}
          {isWaitlisted && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
              <div>
                <p className="text-xs font-bold text-amber-800">Payment Required to Confirm Reservation</p>
                <p className="text-[11px] text-amber-700 mt-0.5">Your rooms are temporarily held, but your status is waitlisted until payment completes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWaitlistedReceipt(false)}
                className="shrink-0 self-start sm:self-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
              >
                Complete Secure Checkout <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Top Success Banner Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 text-center space-y-5 relative overflow-hidden">
            {/* Elegant decorative background waves */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 via-transparent to-transparent pointer-events-none" />
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ring-8 relative z-10 ${
              isWaitlisted 
                ? 'bg-amber-50 text-amber-600 ring-amber-50/50' 
                : 'bg-emerald-50 text-emerald-600 ring-emerald-50/50'
            }`}>
              {isWaitlisted ? (
                <AlertCircle size={30} />
              ) : (
                <Check size={30} strokeWidth={3} />
              )}
            </div>
            
            <div className="space-y-2 relative z-10">
              <h1 className="text-3xl font-black tracking-tight text-stone-900">
                {isWaitlisted ? 'Reservation Waitlisted' : 'Reservation Confirmed!'}
              </h1>
              <p className="text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
                {isWaitlisted
                  ? `Thank you, ${guestName || primaryContact}. Your booking is waitlisted pending payment validation.`
                  : `Thank you, ${guestName || primaryContact}. We have received your booking and your luxury escape is secured.`}
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100/50 rounded-full px-3.5 py-1 inline-block font-semibold mt-1">
                Confirmation email sent to {guestEmail}
              </p>
            </div>
          </div>

          {/* Stay Timeline Calendar Box */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            {/* Check-In */}
            <div className="p-6 space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-In</span>
              <p className="text-xl font-black text-stone-900">{displayCheckIn}</p>
              <p className="text-xs text-stone-500">After 3:00 PM local time</p>
            </div>
            
            {/* Stay Stats */}
            <div className="p-6 bg-stone-50/50 flex flex-col justify-center items-center text-center space-y-1">
              <Calendar size={18} className="text-amber-500" />
              <p className="text-sm font-bold text-stone-800">{nights} Night{nights > 1 ? 's' : ''} Stay</p>
              <p className="text-xs text-stone-500">{adults} Adult{adults > 1 ? 's' : ''} {children > 0 ? `· ${children} Child${children > 1 ? 'ren' : ''}` : ''}</p>
            </div>

            {/* Check-Out */}
            <div className="p-6 space-y-2 text-center md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-Out</span>
              <p className="text-xl font-black text-stone-900">{displayCheckOut}</p>
              <p className="text-xs text-stone-500">Before 12:00 PM local time</p>
            </div>
          </div>

          {/* Split Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Rooms & Extras Information (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Rooms & Amenity Summary */}
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2.5">
                  Your Accommodation
                </h3>
                
                <div className="space-y-4">
                  {selectedItems.map(item => {
                    const room = rooms.find(r => r.type === item.roomType);
                    if (!room) return null;
                    return (
                      <div key={item.roomType} className="flex items-start gap-4">
                        <div className="w-16 h-12 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                          <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-stone-900 text-sm">{room.title}</h4>
                          <p className="text-xs text-stone-500">{item.quantity} room{item.quantity > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {room.features.slice(0, 3).map((f, i) => (
                              <span key={i} className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Extras / Packages / Guest Services Lists */}
                {(selectedPackages.length > 0 || selectedGuestServices.length > 0) && (
                  <div className="border-t border-stone-100 pt-4 mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-stone-800">Selected Extras & Services</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                      {selectedPackages.map(pkg => (
                        <div key={pkg.id} className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                          <Sparkles size={12} className="text-amber-500 shrink-0" />
                          <span className="truncate font-medium text-stone-700">{pkg.name} {pkg.quantity > 1 ? `(×${pkg.quantity})` : ''}</span>
                        </div>
                      ))}
                      {selectedGuestServices.map(gs => (
                        <div key={gs.id} className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                          <Coffee size={12} className="text-amber-500 shrink-0" />
                          <span className="truncate font-medium text-stone-700">{gs.name} {gs.quantity > 1 ? `(×${gs.quantity})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Airport Shuttle Status Block */}
              {(() => {
                const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
                if (!shuttleService) return null;
                
                const hasPickup = airportShuttleDetails.pickup.quantity > 0;
                const hasDropOff = airportShuttleDetails.dropOff.quantity > 0;
                
                return (
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <Plane size={16} className="text-amber-500" /> Airport Transfer Scheduled
                      </h3>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Confirmed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {hasPickup && (
                        <div className="bg-stone-50/50 p-3.5 border border-stone-100 rounded-xl space-y-1">
                          <p className="font-bold text-stone-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Airport Pickup
                          </p>
                          <p className="text-stone-500 text-[11px] mt-1">Flight: <strong className="text-stone-800">{airportShuttleDetails.pickup.flightNumber}</strong></p>
                          <p className="text-stone-500 text-[11px]">Time: <strong className="text-stone-800">{airportShuttleDetails.pickup.flightTime}</strong></p>
                          <p className="text-stone-500 text-[11px]">Scheduled: <strong className="text-stone-800">{new Date(airportShuttleDetails.pickup.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ {airportShuttleDetails.pickup.scheduledTime}</strong></p>
                        </div>
                      )}
                      {hasDropOff && (
                        <div className="bg-stone-50/50 p-3.5 border border-stone-100 rounded-xl space-y-1">
                          <p className="font-bold text-stone-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Airport Drop-off
                          </p>
                          <p className="text-stone-500 text-[11px] mt-1">Flight: <strong className="text-stone-800">{airportShuttleDetails.dropOff.flightNumber}</strong></p>
                          <p className="text-stone-500 text-[11px]">Time: <strong className="text-stone-800">{airportShuttleDetails.dropOff.flightTime}</strong></p>
                          <p className="text-stone-500 text-[11px]">Scheduled: <strong className="text-stone-800">{new Date(airportShuttleDetails.dropOff.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ {airportShuttleDetails.dropOff.scheduledTime}</strong></p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* What's Next & Policy Checklist */}
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-3.5">
                <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2.5">
                  Pre-Arrival Guide
                </h3>
                <ul className="space-y-3 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-100 text-amber-700 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-bold text-stone-800">Check Your Inbox</p>
                      <p className="text-stone-500 mt-0.5">A copy of this digital receipt and stay terms has been sent to {guestEmail}.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-100 text-amber-700 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-bold text-stone-800">Bring Valid ID & Credit Card</p>
                      <p className="text-stone-500 mt-0.5">Upon check-in, the primary guest must present a physical photo ID and card for incidental security verification.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-100 text-amber-700 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-bold text-stone-800">Flexible Incidental Policies</p>
                      <p className="text-stone-500 mt-0.5">{isWaitlisted ? 'All room waitlists will transition to confirmed status once payment has been received and verified by billing.' : 'No immediate deposit was charged. All balances, services, and optional extras are payable upon departure at the front desk.'}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Guest Info & Invoice Receipt (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Guest Details Card */}
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-3">
                <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2.5">
                  Guest Information
                </h3>
                
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Primary Guest</span>
                    <span className="font-bold text-stone-800">{guestName || primaryContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Email Address</span>
                    <span className="font-bold text-stone-800">{guestEmail}</span>
                  </div>
                  {guestPhone && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Phone Number</span>
                      <span className="font-bold text-stone-800">{guestPhone}</span>
                    </div>
                  )}
                  {guestNationality && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Nationality</span>
                      <span className="font-bold text-stone-800">{guestNationality}</span>
                    </div>
                  )}
                  {specialRequests && (
                    <div className="pt-2 border-t border-stone-100 space-y-1">
                      <span className="text-stone-400 font-medium">Special Requests</span>
                      <p className="bg-stone-50 p-2.5 rounded-lg text-stone-700 italic border border-stone-100">{specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Invoice Receipt Card */}
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden relative">
                
                {/* Visual "Receipt cut" pattern top and bottom */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(circle,_transparent_70%,_#f5f5f4_30%)] bg-[length:12px_12px] bg-repeat-x pointer-events-none opacity-20" />
                
                <div className="p-6 space-y-5">
                  <div className="text-center space-y-1 border-b border-dashed border-stone-100 pb-4">
                    <h3 className="font-black text-stone-900 text-sm uppercase tracking-widest">Digital Invoice</h3>
                    <p className="text-[10px] text-stone-400 font-semibold">Resort Reservation Receipt</p>
                  </div>

                  <div className="space-y-3 text-xs text-stone-600">
                    {/* Reservation IDs */}
                    <div className="flex justify-between items-start">
                      <span className="text-stone-400">Reservation ID</span>
                      <span className="font-mono font-bold text-stone-900 text-right max-w-[180px] break-all">
                        {confirmation.reservationIds.join(', ')}
                      </span>
                    </div>

                    {/* Group Booking ID if applicable */}
                    {confirmation.isGroupBooking && confirmation.groupBookingId && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Group Booking ID</span>
                        <span className="font-mono font-bold text-stone-900">{confirmation.groupBookingId}</span>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex justify-between">
                      <span className="text-stone-400">Status</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                        isWaitlisted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>{confirmation.status}</span>
                    </div>

                    {/* Payment Status */}
                    <div className="flex justify-between">
                      <span className="text-stone-400">Payment Status</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                        isWaitlisted ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>{isWaitlisted ? 'Unpaid' : 'Paid'}</span>
                    </div>

                    {/* Stay Rates Subtotal */}
                    <div className="flex justify-between pt-3 border-t border-stone-100">
                      <span className="text-stone-400">Accommodation Base</span>
                      <span className="font-semibold text-stone-800">{formatPrice(finalPricing.roomTotal)}</span>
                    </div>

                    {/* Extras and upgrades */}
                    {finalPricing.packageTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">VIP Upgrade Packages</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.packageTotal)}</span>
                      </div>
                    )}

                    {/* Guest Services */}
                    {finalPricing.guestServicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Guest Services Extra</span>
                        <span className="font-semibold text-stone-800">{formatPrice(finalPricing.guestServicesTotal)}</span>
                      </div>
                    )}

                    {/* Taxes & Charges */}
                    {settings?.feeComponents && settings.feeComponents.length > 0 ? (
                      <>
                        {settings.feeComponents.filter(f => f.isEnabled).map(fee => (
                          <div key={fee.id} className="flex justify-between">
                            <span className="text-stone-400">{fee.name}</span>
                            <span className="font-semibold text-stone-800">
                              {fee.feeType === 'percentage' ? `${fee.value}%` : formatPrice(fee.value)}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {finalPricing.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-stone-400">Estimated Taxes</span>
                            <span className="font-semibold text-stone-800">{formatPrice(finalPricing.tax)}</span>
                          </div>
                        )}
                        {finalPricing.serviceCharge > 0 && (
                          <div className="flex justify-between">
                            <span className="text-stone-400">Service Fee</span>
                            <span className="font-semibold text-stone-800">{formatPrice(finalPricing.serviceCharge)}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Bold Final Total */}
                    <div className="pt-4 border-t-2 border-dashed border-stone-200 flex justify-between items-baseline">
                      <span className="font-black text-stone-900 text-sm uppercase tracking-wider">Total Charge</span>
                      <span className="text-2xl font-black text-stone-900">{formatPrice(confirmation.totalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 text-center text-[10px] text-stone-400 leading-normal border-t border-stone-100">
                    {isWaitlisted ? 'Complete secure payment checkout to transition your reservation from waitlisted to confirmed.' : 'Please keep this receipt for check-in verification. Thank you for booking directly!'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back to Site Button (Hidden on Print) */}
          <div className="text-center pt-4 print:hidden">
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-md active:scale-95 cursor-pointer"
            >
              Back to Reservation Search
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-10 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.hotelLogo ? (
              <img src={settings.hotelLogo} alt="Hotel Logo" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">
                {settings?.customHotelName?.charAt(0) || 'G'}
              </div>
            )}
            <div className="leading-tight">
              <span className="block font-semibold text-stone-900 tracking-tight">{settings?.customHotelName || 'Gheralta'}</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">{settings?.bookingHeaderSubtitle || 'Direct Reservations'}</span>
                {settings?.starRating && (
                  <span className="text-[10px] text-amber-500">{'★'.repeat(parseInt(settings.starRating))}</span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-500">
            {settings?.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-1.5 hover:text-stone-900 transition">
                <Phone size={13} /> {settings.contactPhone}
              </a>
            )}
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-1.5 hover:text-stone-900 transition">
                <Mail size={13} /> {settings.contactEmail}
              </a>
            )}
            {settings?.checkInTime && (
              <div className="flex items-center gap-1.5 text-stone-400">
                <Clock size={13} />
                <span>Check-in: {settings.checkInTime}</span>
              </div>
            )}
            {settings?.checkOutTime && (
              <div className="flex items-center gap-1.5 text-stone-400">
                <Clock size={13} />
                <span>Check-out: {settings.checkOutTime}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Maintenance Mode / Booking Disabled Screen */}
      {settings && (settings.maintenanceMode || !settings.publicBookingEnabled) && (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-4">
              {settings.maintenanceMode ? 'Under Maintenance' : 'Booking Temporarily Unavailable'}
            </h1>
            <p className="text-stone-600 leading-relaxed">
              {settings.maintenanceMode
                ? settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.'
                : 'Online booking is currently disabled. Please contact us directly to make a reservation.'}
            </p>
            {settings.contactPhone && (
              <div className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-stone-500 mb-2">Need assistance?</p>
                <a href={`tel:${settings.contactPhone}`} className="text-lg font-semibold text-amber-600 hover:text-amber-700">
                  {settings.contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section
        role="banner"
        className="relative h-[60vh] min-h-[480px] w-full overflow-hidden bg-transparent"
        style={{
          backgroundImage: settings?.heroImageUrl ? `url(${settings.heroImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end pb-28 md:pb-32 px-6 lg:px-10 z-20 bg-transparent">
          <div className="max-w-[1400px] mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1] max-w-2xl">
                {settings?.bookingHeroTitle || 'Find your perfect stay'}
              </h1>
              <p className="text-stone-700 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
                {settings?.bookingHeroDescription || 'Book directly with us for the best available rates, personalized service, and instant confirmation.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Search Bar */}
      <div className="relative z-30 -mt-16 px-4 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-2xl p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Calendar size={12} /> Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                />
              </div>
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Calendar size={12} /> Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                />
              </div>
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Users size={12} /> Guests per room
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-3">
                  <Counter label="Adults" value={adults} onChange={setAdults} min={1} max={10} />
                  <Counter label="Children" value={children} onChange={setChildren} min={0} max={10} />
                </div>
              </div>
            </div>

            {ratePlans.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Star size={12} /> Rate Plan (Optional)
                </label>
                <select
                  value={selectedRatePlanId}
                  onChange={e => setSelectedRatePlanId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                >
                  <option value="">Standard Rate</option>
                  {ratePlans.map(rp => (
                    <option key={rp.id} value={rp.id}>
                      {rp.name} {rp.base_modifier != 1 ? `(${rp.base_modifier}x)` : ''}
                    </option>
                  ))}
                </select>
                {selectedRatePlanId && (
                  <p className="text-xs text-stone-500 mt-1">
                    {ratePlans.find(rp => rp.id === selectedRatePlanId)?.description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main */}
      <div>
      <main className="max-w-[1400px] mx-auto px-4 lg:px-10 py-12 md:py-16">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3"
          >
            <Info size={18} className="shrink-0" /> {error}
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => goToStep(step)}
                  disabled={(step === 2 && !canProceedToStep2) || (step === 3 && !canProceedToStep3)}
                  className={`flex flex-col items-center gap-2 ${
                    (step === 2 && !canProceedToStep2) || (step === 3 && !canProceedToStep3)
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep === step
                      ? 'bg-amber-400 text-stone-900 ring-4 ring-amber-100'
                      : currentStep > step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {currentStep > step ? <Check size={16} /> : step}
                  </div>
                  <span className={`text-xs font-medium ${
                    currentStep === step ? 'text-amber-600' : currentStep > step ? 'text-emerald-600' : 'text-stone-500'
                  }`}>
                    {step === 1 ? (settings?.bookingStep1Label || 'Select Room') : step === 2 ? (settings?.bookingStep2Label || 'Add-ons') : (settings?.bookingStep3Label || 'Details')}
                  </span>
                </button>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-emerald-500' : 'bg-stone-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Step 1: Room Selection */}
          {currentStep === 1 && (
            <>
              <div className="lg:col-span-12 space-y-10">
                {/* Rooms */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                      <Bed size={18} className="text-amber-500" /> {settings?.bookingRoomsSectionTitle || 'Select your room'}
                    </h2>
                    <span className="text-xs text-stone-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
                          <div className="w-full h-52 bg-stone-200" />
                          <div className="p-5 space-y-3">
                            <div className="h-4 bg-stone-200 rounded w-1/3" />
                            <div className="h-3 bg-stone-200 rounded w-2/3" />
                            <div className="h-3 bg-stone-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-14 bg-white border border-stone-200 rounded-2xl">
                      <Bed size={40} className="mx-auto text-stone-300 mb-3" />
                      <p className="text-stone-500 font-medium">{settings?.bookingNoRoomsMessage || 'No rooms available for the selected dates.'}</p>
                      <p className="text-xs text-stone-400 mt-1">{settings?.bookingNoRoomsSubtext || 'Try adjusting your dates or contact the hotel.'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence mode="popLayout">
                        {rooms.map((room, index) => {
                          const quantity = selectedItems.find(item => item.roomType === room.type)?.quantity || 0;
                          const soldOut = room.available === 0;
                          const remaining = room.available - quantity;
                          return (
                            <motion.div
                              key={room.type}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`group relative bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col ${
                                quantity > 0 ? 'border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-900/5' : 'border-stone-200 hover:border-amber-300 hover:shadow-md'
                              } ${soldOut ? 'opacity-60' : ''}`}
                              onClick={() => !soldOut && quantity === 0 && setRoomQuantity(room.type, 1)}
                            >
                              <div className="relative w-full h-52 shrink-0">
                                <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover" />
                                {quantity > 0 && (
                                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-stone-900 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    {quantity} selected
                                  </div>
                                )}
                                {soldOut && (
                                  <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                                    <span className="px-3 py-1 bg-white/90 text-stone-900 text-xs font-bold uppercase tracking-wider rounded-full">
                                      Sold out
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 p-5 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h3 className="text-lg font-semibold text-stone-900">{room.title}</h3>
                                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{room.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xl font-bold text-stone-900">{formatPrice(room.rate)}</p>
                                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">/ night</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {room.features.slice(0, 4).map((f, i) => <FeatureBadge key={i} text={f} />)}
                                  </div>
                                  <div className="mt-3 space-y-1">
                                    {room.bedConfiguration && (
                                      <div className="text-xs text-stone-500 flex items-center gap-1.5">
                                        <Bed size={12} />
                                        <span>{room.bedConfiguration}</span>
                                      </div>
                                    )}
                                    {room.roomSizeSqm && (
                                      <div className="text-xs text-stone-500 flex items-center gap-1.5">
                                        <Maximize size={12} />
                                        <span>{room.roomSizeSqm} sqm</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-3">
                                  <span className={`text-sm font-bold ${remaining > 0 ? 'text-emerald-600' : quantity > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                                    {remaining > 0 ? `${remaining} room${remaining > 1 ? 's' : ''} available` : quantity > 0 ? 'All remaining rooms selected' : 'No availability'}
                                  </span>

                                  {quantity === 0 ? (
                                    <button
                                      disabled={soldOut}
                                      onClick={(e) => { e.stopPropagation(); setRoomQuantity(room.type, 1); }}
                                      className="w-full px-5 py-2.5 bg-stone-900 disabled:bg-stone-300 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-2"
                                    >
                                      Add room <Plus size={16} />
                                    </button>
                                  ) : (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-sm font-medium text-stone-700">{quantity} room{quantity > 1 ? 's' : ''}</span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setRoomQuantity(room.type, quantity - 1); }}
                                          className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition"
                                        >
                                          <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-semibold text-stone-900">{quantity}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setRoomQuantity(room.type, quantity + 1); }}
                                          disabled={quantity >= room.available}
                                          className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
                                        >
                                          <Plus size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* Step 2: Packages & Guest Services */}
          {currentStep === 2 && (
            <div className="lg:col-span-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Sticky Live Booking Summary Cart */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                    <div className="p-5 border-b border-stone-100 bg-stone-50/50">
                      <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-amber-500 animate-pulse" /> Your Selection
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {nights} Night{nights > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="p-5 divide-y divide-stone-100 space-y-4">
                      {/* Rooms Section */}
                      {selectedItems.length > 0 && (
                        <div className="space-y-3 pb-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rooms</h4>
                          {selectedItems.map(item => {
                            const room = rooms.find(r => r.type === item.roomType);
                            if (!room) return null;
                            return (
                              <div key={item.roomType} className="flex items-start justify-between gap-3 text-sm">
                                <div>
                                  <p className="font-semibold text-stone-900">{room.title}</p>
                                  <p className="text-xs text-stone-500">{item.quantity} room{item.quantity > 1 ? 's' : ''} × {formatPrice(room.rate)} / night</p>
                                </div>
                                <span className="font-semibold text-stone-900 shrink-0">{formatPrice(room.rate * nights * item.quantity)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Packages Section */}
                      {selectedPackages.length > 0 && (
                        <div className="space-y-3 py-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Selected Upgrades</h4>
                          {selectedPackages.map(pkg => {
                            const durationMultiplier = pkg.chargeFrequency === 'daily' ? nights : 1;
                            return (
                              <div key={pkg.id} className="flex items-start justify-between gap-3 text-sm">
                                <div>
                                  <p className="font-semibold text-stone-900">{pkg.name}</p>
                                  <p className="text-xs text-stone-500">
                                    {pkg.quantity} × {formatPrice(pkg.price)} {pkg.chargeFrequency === 'daily' ? '/ night' : '/ stay'}
                                  </p>
                                </div>
                                <span className="font-semibold text-stone-900 shrink-0">
                                  {formatPrice(pkg.price * pkg.quantity * durationMultiplier)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Guest Services Section */}
                      {selectedGuestServices.length > 0 && (
                        <div className="space-y-3 py-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Guest Services</h4>
                          {selectedGuestServices.map(gs => {
                            const isShuttle = gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle');
                            const shuttleQuantity = isShuttle ? (airportShuttleDetails.pickup.quantity + airportShuttleDetails.dropOff.quantity) : gs.quantity;
                            const finalQty = isShuttle ? shuttleQuantity : gs.quantity;
                            return (
                              <div key={gs.id} className="flex items-start justify-between gap-3 text-sm">
                                <div>
                                  <p className="font-semibold text-stone-900">{gs.name}</p>
                                  <p className="text-xs text-stone-500">
                                    {finalQty} × {formatPrice(gs.price)}
                                  </p>
                                </div>
                                <span className="font-semibold text-stone-900 shrink-0">
                                  {formatPrice(gs.price * finalQty)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Taxes & Fees Section */}
                      <div className="space-y-2 py-4 text-xs text-stone-600">
                        {settings?.feeComponents && settings.feeComponents.length > 0 ? (
                          <>
                            {settings.feeComponents.filter(f => f.isEnabled).map(fee => (
                              <div key={fee.id} className="flex justify-between">
                                <span>{fee.name}</span>
                                <span className="font-medium">
                                  {fee.feeType === 'percentage' ? `${fee.value}%` : formatPrice(fee.value)}
                                </span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {finalPricing.tax > 0 && (
                              <div className="flex justify-between">
                                <span>Tax</span>
                                <span className="font-medium">{formatPrice(finalPricing.tax)}</span>
                              </div>
                            )}
                            {finalPricing.serviceCharge > 0 && (
                              <div className="flex justify-between">
                                <span>Service Charge</span>
                                <span className="font-medium">{formatPrice(finalPricing.serviceCharge)}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Grand Total */}
                      <div className="pt-4 flex justify-between items-baseline">
                        <div>
                          <p className="text-sm font-bold text-stone-900">Total Estimate</p>
                          <p className="text-[10px] text-stone-500">All fees included</p>
                        </div>
                        <span className="text-2xl font-black text-amber-600">{formatPrice(finalPricing.total)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3 text-xs text-stone-500">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
                      <span>No deposit required · Pay at the resort</span>
                    </div>
                  </div>
                </div>

                {/* Right: Packages & Guest Services Choices */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Packages Section */}
                  {packages.length > 0 && !loading && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <h3 className="font-bold text-stone-900 flex items-center gap-2 text-lg">
                          <Sparkles size={18} className="text-amber-500 animate-pulse" /> {settings?.bookingPackagesSectionTitle || 'Exclusive Packages'}
                        </h3>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">VIP Upgrades</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages.map((pkg, idx) => {
                          const quantity = selectedPackageQuantities[pkg.id] || 0;
                          const highlights = parseHighlights(pkg.description);
                          const isSelected = quantity > 0;
                          return (
                            <div
                              key={pkg.id}
                              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                                isSelected 
                                  ? 'border-amber-400 bg-amber-50/10 ring-1 ring-amber-400 shadow-lg shadow-amber-900/5' 
                                  : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-bold text-stone-900 text-sm">{pkg.name}</h3>
                                  {idx === 0 && (
                                    <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-widest bg-amber-500 text-stone-900 px-2 py-0.5 rounded-md">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                
                                {highlights.length > 0 ? (
                                  <ul className="mt-3 space-y-1.5">
                                    {highlights.slice(0, 4).map((highlight, hIdx) => (
                                      <li key={hIdx} className="flex items-start gap-1.5 text-xs text-stone-600 leading-relaxed">
                                        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{highlight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">{pkg.description}</p>
                                )}
                              </div>

                              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Upgrade Rate</p>
                                  <p className="text-base font-black text-stone-900 leading-none mt-1">
                                    {formatPrice(pkg.price)}
                                    <span className="text-[10px] font-medium text-stone-400 uppercase ml-0.5">/{pkg.chargeFrequency}</span>
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPackageQuantity(pkg.id, quantity - 1)}
                                    disabled={quantity === 0}
                                    className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition active:scale-95 shadow-sm"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold text-stone-900">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setPackageQuantity(pkg.id, quantity + 1)}
                                    className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition active:scale-95 shadow-sm"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Guest Services Section */}
                  {guestServices.length > 0 && !loading && (
                    <div className="space-y-6">
                      <div className="border-b border-stone-100 pb-4 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-stone-900 flex items-center gap-2 text-lg">
                              <Users size={18} className="text-amber-500" /> {settings?.bookingGuestServicesSectionTitle || 'Personalize Your Stay'}
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5">Select optional resort extras and guest services</p>
                          </div>
                          
                          {/* Search */}
                          <div className="relative w-full md:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Search extras..."
                              className="w-full pl-9 pr-4 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                            />
                          </div>
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
                          {uniqueCategories.map(cat => {
                            const meta = getCategoryMeta(cat);
                            const isSelected = selectedCategory === cat;
                            const IconComp = meta.icon;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                  isSelected
                                    ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                                }`}
                              >
                                <IconComp size={12} />
                                <span>{meta.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filtered Guest Services list */}
                      {filteredGuestServices.length === 0 ? (
                        <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                          <ShoppingBag size={28} className="mx-auto text-stone-300 mb-2 animate-bounce" />
                          <p className="text-stone-500 text-xs font-semibold">No extra services match your search</p>
                          <button 
                            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                            className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {filteredGuestServices.map(gs => {
                            const quantity = selectedGuestServiceQuantities[gs.id] || 0;
                            const isSelected = quantity > 0;
                            const SvcIcon = getServiceIcon(gs.name, gs.category);
                            
                            return (
                              <div
                                key={gs.id}
                                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                                  isSelected 
                                    ? 'border-amber-400 bg-amber-50/10 ring-1 ring-amber-400 shadow-md shadow-amber-900/5' 
                                    : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'
                                  }`}>
                                    <SvcIcon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-stone-900 text-sm leading-snug">{gs.name}</h4>
                                    <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{gs.description}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[8px] font-extrabold uppercase tracking-wider">
                                      {gs.category?.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Service Fee</p>
                                    <p className="text-sm font-bold text-stone-900 mt-0.5">
                                      {formatPrice(gs.price)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setGuestServiceQuantity(gs.id, quantity - 1)}
                                      disabled={quantity === 0}
                                      className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition active:scale-95 shadow-sm"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-5 text-center text-xs font-bold text-stone-900">{quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => setGuestServiceQuantity(gs.id, quantity + 1)}
                                      className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition active:scale-95 shadow-sm"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Airport Shuttle Timeline Section */}
                  {(() => {
                    const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
                    if (!shuttleService) return null;
                    
                    const hasPickup = airportShuttleDetails.pickup.quantity > 0;
                    const hasDropOff = airportShuttleDetails.dropOff.quantity > 0;
                    const isConfigured = hasPickup || hasDropOff;
                    
                    const pickupValid = !hasPickup || (airportShuttleDetails.pickup.scheduledTime.trim() !== '' && airportShuttleDetails.pickup.flightNumber.trim() !== '');
                    const dropOffValid = !hasDropOff || (airportShuttleDetails.dropOff.scheduledTime.trim() !== '' && airportShuttleDetails.dropOff.flightNumber.trim() !== '');
                    const isValid = isConfigured && pickupValid && dropOffValid;
                    
                    return (
                      <div className={`border rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden transition-all duration-300 ${
                        isValid 
                          ? 'border-emerald-200 bg-emerald-50/10' 
                          : isConfigured 
                            ? 'border-amber-300 bg-amber-50/20 shadow-amber-500/5' 
                            : 'border-amber-400 bg-amber-50/30'
                      }`}>
                        <div className="p-5 md:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                <Plane size={18} />
                              </div>
                              <div>
                                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 flex-wrap">
                                  Airport Shuttle Concierge
                                  {isValid ? (
                                    <span className="text-[8px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                                      Configured
                                    </span>
                                  ) : isConfigured ? (
                                    <span className="text-[8px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                                      Details Required
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-extrabold uppercase tracking-widest bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full">
                                      Not Configured
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">Please provide your shuttle transfer details to ensure our luxury airport transport awaits you.</p>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => setShowShuttleModal(true)}
                              className="shrink-0 self-start sm:self-center px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition flex items-center gap-1.5"
                            >
                              {isConfigured ? 'Edit Details' : 'Configure Shuttle'} <ChevronRight size={14} />
                            </button>
                          </div>

                          {/* Display Shuttle Legs */}
                          {isConfigured ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              {/* Pickup Leg */}
                              {hasPickup && (
                                <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col justify-between space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Airport Pickup
                                    </span>
                                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
                                      {airportShuttleDetails.pickup.quantity} Pax
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Flight Number</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.pickup.flightNumber || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Flight Time</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.pickup.flightTime || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Transfer Date</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">
                                        {airportShuttleDetails.pickup.scheduledDate 
                                          ? new Date(airportShuttleDetails.pickup.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                          : '—'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Scheduled Time</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.pickup.scheduledTime || '—'}</p>
                                    </div>
                                  </div>
                                  {!pickupValid && (
                                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                                      <AlertCircle size={12} /> Flight no. & transfer time required
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Drop-off Leg */}
                              {hasDropOff && (
                                <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col justify-between space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Airport Drop-off
                                    </span>
                                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
                                      {airportShuttleDetails.dropOff.quantity} Pax
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Flight Number</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.dropOff.flightNumber || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Flight Time</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.dropOff.flightTime || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Transfer Date</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">
                                        {airportShuttleDetails.dropOff.scheduledDate 
                                          ? new Date(airportShuttleDetails.dropOff.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                          : '—'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Scheduled Time</p>
                                      <p className="font-semibold text-stone-800 mt-0.5">{airportShuttleDetails.dropOff.scheduledTime || '—'}</p>
                                    </div>
                                  </div>
                                  {!dropOffValid && (
                                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                                      <AlertCircle size={12} /> Flight no. & transfer time required
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl flex items-center justify-center text-center">
                              <p className="text-xs text-stone-500 font-medium">Please tap "Configure Shuttle" above to select directions, quantities, flight numbers, and times.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100 pt-6">
                    <button
                      onClick={prevStep}
                      className="w-full sm:w-auto px-6 py-3 bg-stone-200 text-stone-900 rounded-xl font-semibold text-sm hover:bg-stone-300 transition flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} /> Back
                    </button>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      {!canProceedToStep3 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-100">
                          <AlertCircle size={14} /> Please configure required Airport Shuttle details
                        </span>
                      )}
                      <button
                        onClick={nextStep}
                        disabled={!canProceedToStep3}
                        className="w-full sm:w-auto px-6 py-3 bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2"
                      >
                        Continue <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Guest Details & Confirmation */}
          {currentStep === 3 && (
            <div className="lg:col-span-12 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Form */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                  <div className="p-5 border-b border-stone-100">
                    <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                      <CreditCard size={18} /> {settings?.bookingGuestDetailsTitle || 'Guest Details'}
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    {selectedItems.reduce((sum, item) => sum + item.quantity, 0) > 1 ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Primary contact name</label>
                          <input required type="text" value={primaryContact} onChange={e => setPrimaryContact(e.target.value)} placeholder="e.g. John Smith" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</label>
                          <input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phone</label>
                          <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nationality</label>
                          <input type="text" value={guestNationality} onChange={e => setGuestNationality(e.target.value)} placeholder="e.g. Ethiopia" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Group name</label>
                          <input required type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Company Conference" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full name</label>
                          <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</label>
                          <input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phone</label>
                          <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nationality</label>
                          <input type="text" value={guestNationality} onChange={e => setGuestNationality(e.target.value)} placeholder="e.g. Ethiopia" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Special requests</label>
                      <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none" />
                    </div>

                    {/* B2B Section */}
                    {tourOperators.length > 0 && (
                      <div className="pt-4 border-t border-stone-200">
                        <div className="flex items-center gap-1.5 pb-2 text-stone-900 font-bold uppercase tracking-wider text-[10px] font-mono">
                          <Building size={14} className="text-indigo-600" /> Tour Operator (Optional)
                        </div>
                        <div className="space-y-1">
                          <select value={selectedOperatorId} onChange={e => setSelectedOperatorId(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition">
                            <option value="">Select tour operator (if applicable)</option>
                            {tourOperators.map((op: any) => (
                              <option key={op.id} value={op.id}>{op.name} ({op.code})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-stone-200">
                      <div className="flex items-center gap-1.5 pb-2 text-stone-900 font-bold uppercase tracking-wider text-[10px] font-mono">
                        <Gift size={14} className="text-indigo-600" /> Voucher Code (Optional)
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Enter voucher code" className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        <button type="button" onClick={applyVoucher} disabled={applyingVoucher} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                          {applyingVoucher ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                        </button>
                      </div>
                      {voucherError && <p className="text-xs text-rose-600 mt-1">{voucherError}</p>}
                      {voucherDiscount > 0 && <p className="text-xs text-emerald-600 mt-1 font-bold">Discount applied: {formatPrice(voucherDiscount)}</p>}
                    </div>

                    {/* Dynamic Policy Highlights Box */}
                    <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200/40 text-stone-900 font-bold uppercase tracking-wider text-[10px] font-mono">
                        <ShieldCheck size={14} className="text-emerald-600" /> Key Booking Policies
                      </div>
                      
                      {/* Cancellation Policy */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 mt-0.5 font-mono">
                          C
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 text-[11px]">Flexible Cancellation Rules</p>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            Free cancellation up to <strong className="text-stone-700 font-bold">{settings?.cancellationGraceHours || 24} hours</strong> before check-in. Late cancellations incur a {settings?.cancellationPenaltyPercent || 50}% fee.
                          </p>
                        </div>
                      </div>

                      {/* Waitlisted Status Rule */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-amber-50 text-amber-700 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 mt-0.5 font-mono">
                          W
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 text-[11px]">Verification Protocol</p>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            Reservations default to <span className="font-semibold text-amber-700 font-mono">Waitlisted</span> and are automatically promoted to <span className="font-semibold text-emerald-700 font-mono">Confirmed</span> once verified by business admin.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer pt-1">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-amber-500" />
                      <span>
                        {settings?.bookingTermsAgreement || 'I agree to the hotel terms and conditions and cancellation policy.'}
                        <span
                          onClick={e => { e.stopPropagation(); e.preventDefault(); setShowTermsModal(true); }}
                          className="text-amber-600 font-semibold hover:underline ml-1 cursor-pointer"
                        >
                          {settings?.bookingReadTermsText || 'Read terms'}
                        </span>
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="w-full py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50 transition flex items-center justify-center gap-2"
                    >
                      <ScrollText size={14} /> View Terms & Conditions
                    </button>
                    <button
                      disabled={submitting || !agreed}
                      className="w-full py-3.5 bg-stone-900 disabled:bg-stone-300 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2"
                    >
                      {submitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><CreditCard size={18} /> {settings?.bookingConfirmButtonText || 'Confirm booking'}</>}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-medium">
                      <ShieldCheck size={12} /> {settings?.bookingSecureBookingText || 'Secure booking · No card required'}
                    </div>
                  </form>
                </div>

                {/* Booking Summary */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                  <div className="p-5 border-b border-stone-100">
                    <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                      <ShoppingBag size={18} /> {settings?.bookingSummaryTitle || 'Booking Summary'}
                    </h3>
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                    {selectedItems.map(item => {
                      const room = rooms.find(r => r.type === item.roomType);
                      if (!room) return null;
                      const baseRate = room.baseRate || room.rate;
                      const effectiveRate = getEffectiveNightlyRate(baseRate, finalPricing.seasonMultiplier, finalPricing.ratePlanModifier);
                      return (
                        <div key={item.roomType} className="flex justify-between text-stone-600">
                          <span>{room.title} × {item.quantity} ({nights} night{nights > 1 ? 's' : ''})</span>
                          <span className="font-medium">{formatPrice(effectiveRate * nights * item.quantity)}</span>
                        </div>
                      );
                    })}
                    {selectedPackages.map(pkg => (
                      <div key={pkg.id} className="flex justify-between text-stone-600">
                        <span>{pkg.name} {pkg.quantity > 1 ? `× ${pkg.quantity}` : ''}</span>
                        <span className="font-medium">{formatPrice(pkg.price * pkg.quantity * (pkg.chargeFrequency === 'daily' ? nights : 1))}</span>
                      </div>
                    ))}
                    {selectedGuestServices.map(gs => (
                      <div key={gs.id} className="flex justify-between text-stone-600">
                        <span>{gs.name} {gs.quantity > 1 ? `× ${gs.quantity}` : ''}</span>
                        <span className="font-medium">{formatPrice(gs.price * gs.quantity)}</span>
                      </div>
                    ))}
                    {finalPricing.seasonName && (
                      <div className="flex justify-between text-amber-700 text-xs">
                        <span>Season: {finalPricing.seasonName} ({finalPricing.seasonMultiplier}x)</span>
                      </div>
                    )}
                    {finalPricing.ratePlanName && (
                      <div className="flex justify-between text-amber-700 text-xs">
                        <span>Rate Plan: {finalPricing.ratePlanName} ({finalPricing.ratePlanModifier}x)</span>
                      </div>
                    )}
                    {finalPricing.serviceCharge > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Service Charge</span>
                        <span className="font-medium">{formatPrice(finalPricing.serviceCharge)}</span>
                      </div>
                    )}
                    {finalPricing.addonDetails && finalPricing.addonDetails.length > 0 && (
                      finalPricing.addonDetails.map((addon: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-stone-600">
                          <span>{addon.name}</span>
                          <span className="font-medium">{formatPrice(addon.amount)}</span>
                        </div>
                      ))
                    )}
                    {finalPricing.tax > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>VAT / Tax</span>
                        <span className="font-medium">{formatPrice(finalPricing.tax)}</span>
                      </div>
                    )}
                    {finalPricing.additionalFees > 0 && finalPricing.additionalFees !== (finalPricing.addonDetails?.reduce((sum: number, a: any) => sum + a.amount, 0) || 0) && (
                      <div className="flex justify-between text-stone-600">
                        <span>Additional Fees</span>
                        <span className="font-medium">{formatPrice(finalPricing.additionalFees)}</span>
                      </div>
                    )}
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Voucher Discount</span>
                        <span className="font-medium">-{formatPrice(voucherDiscount)}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                      <span>Total</span>
                      <span>{formatPrice(finalPricing.total - voucherDiscount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-stone-200 text-stone-900 rounded-xl font-semibold text-sm hover:bg-stone-300 transition flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {currentStep === 1 && selectedItems.length > 0 && (
        <div className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-sm border-t border-stone-200 py-4 px-4 lg:px-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <Bed size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">{totalSelectedRooms} room{totalSelectedRooms > 1 ? 's' : ''} selected</p>
                <p className="text-xs text-stone-500">{nights} night{nights > 1 ? 's' : ''} · {formatPrice(finalPricing.roomTotal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Counter label="Adults" value={adults} onChange={setAdults} min={1} max={10} />
              <Counter label="Children" value={children} onChange={setChildren} min={0} max={10} />
            </div>
            <button
              onClick={nextStep}
              disabled={!canProceedToStep2}
              className="w-full md:w-auto px-6 py-3 bg-stone-900 disabled:bg-stone-300 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-12">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>{settings?.customHotelName || 'Grand Hotel'} &copy; {new Date().getFullYear()}</p>
          {settings?.customHotelAddress && <p className="flex items-center gap-1"><MapPin size={12} /> {settings.customHotelAddress}</p>}
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        terms={settings?.bookingTerms || ''}
        hotelName={settings?.customHotelName}
        policySections={settings?.policySections}
        cancellationGraceHours={settings?.cancellationGraceHours}
        cancellationPenaltyPercent={settings?.cancellationPenaltyPercent}
      />

      {/* Airport Shuttle Modal */}
      <AirportShuttleModal
        isOpen={showShuttleModal}
        onClose={() => setShowShuttleModal(false)}
        details={airportShuttleDetails}
        onChange={setAirportShuttleDetails}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    </div>
  );
}
