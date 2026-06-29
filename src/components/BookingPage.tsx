import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  Plane
} from 'lucide-react';
import TermsAndConditionsModal from './TermsAndConditionsModal';

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
}

interface SelectedItem {
  roomType: string;
  quantity: number;
}

interface AirportShuttleDetails {
  shuttleType: 'Pickup' | 'Drop-off';
  flightNumber: string;
  flightTime: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
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

export default function BookingPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [guestServices, setGuestServices] = useState<PublicGuestService[]>([]);
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
  const [specialRequests, setSpecialRequests] = useState('');
  const [airportShuttleDetails, setAirportShuttleDetails] = useState<AirportShuttleDetails>({
    shuttleType: 'Pickup',
    flightNumber: '',
    flightTime: '',
    scheduledDate: checkIn,
    scheduledTime: '',
    notes: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  // Keep airport shuttle scheduled date aligned with stay dates
  useEffect(() => {
    setAirportShuttleDetails(prev => ({
      ...prev,
      scheduledDate: prev.shuttleType === 'Pickup' ? checkIn : checkOut
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

  const pricing = useMemo(() => {
    if (selectedItems.length === 0 || nights === 0) return { roomTotal: 0, packageTotal: 0, guestServicesTotal: 0, tax: 0, serviceCharge: 0, total: 0, additionalFees: 0 };
    const roomTotal = selectedItems.reduce((sum, item) => {
      const room = rooms.find(r => r.type === item.roomType);
      return sum + (room ? room.rate * nights * item.quantity : 0);
    }, 0);
    const packageTotal = selectedPackages.reduce((sum, p) => sum + p.price * p.quantity * (p.chargeFrequency === 'daily' ? nights : 1), 0);
    const guestServicesTotal = selectedGuestServices.reduce((sum, gs) => sum + gs.price * gs.quantity, 0);
    const subtotal = roomTotal + packageTotal + guestServicesTotal;
    
    // Use fee components from business admin if available, otherwise fall back to simple tax/service charge
    let tax = 0;
    let serviceCharge = 0;
    let additionalFees = 0;
    
    if (settings?.feeComponents && settings.feeComponents.length > 0) {
      settings.feeComponents.forEach(fee => {
        if (fee.isEnabled) {
          if (fee.name.toLowerCase().includes('vat') || fee.name.toLowerCase().includes('tax')) {
            tax += fee.feeType === 'percentage' ? Math.round(subtotal * (fee.value / 100)) : fee.value;
          } else if (fee.name.toLowerCase().includes('service charge')) {
            serviceCharge += fee.feeType === 'percentage' ? Math.round(subtotal * (fee.value / 100)) : fee.value;
          } else {
            additionalFees += fee.feeType === 'percentage' ? Math.round(subtotal * (fee.value / 100)) : fee.value;
          }
        }
      });
    } else {
      // Fall back to simple calculation
      tax = Math.round(subtotal * ((settings?.taxPercent || 0) / 100));
      serviceCharge = Math.round(subtotal * ((settings?.serviceChargePercent || 0) / 100));
    }
    
    return { roomTotal, packageTotal, guestServicesTotal, tax, serviceCharge, additionalFees, total: subtotal + tax + serviceCharge + additionalFees };
  }, [selectedItems, rooms, nights, selectedPackages, selectedGuestServices, settings]);

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
      return airportShuttleDetails.scheduledTime.trim() !== '' && airportShuttleDetails.flightNumber.trim() !== '';
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
    setSubmitting(true);
    setError('');
    try {
      const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
      const requestBody: Record<string, any> = {
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        guestNationality,
        packageIds: selectedPackageIds,
        guestServiceIds: selectedGuestServiceIds,
        specialRequests,
        items: selectedItems.map(item => ({
          roomType: item.roomType,
          quantity: item.quantity,
          adults,
          children
        }))
      };
      if (shuttleService) {
        requestBody.airportShuttleDetails = airportShuttleDetails;
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
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-2xl shadow-stone-200/50 text-center space-y-5">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-8 ${isWaitlisted ? 'bg-amber-50 text-amber-600 ring-amber-50/50' : 'bg-emerald-50 text-emerald-600 ring-emerald-50/50'}`}>
            <Check size={36} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">
              {isWaitlisted ? 'Booking Request Received' : 'Reservation Confirmed'}
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              {isWaitlisted
                ? `Thank you, ${guestName}. Your multi-room request has been submitted and is pending front desk review.`
                : `Thank you, ${guestName}. We have received your booking.`}
            </p>
          </div>
          <div className="bg-stone-50 rounded-2xl p-5 text-left space-y-3 text-sm border border-stone-100">
            {confirmation.isGroupBooking && confirmation.groupBookingId && (
              <div className="flex justify-between">
                <span className="text-stone-500">Group booking ID</span>
                <span className="font-mono font-semibold text-stone-900">{confirmation.groupBookingId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Reservation IDs</span>
              <span className="font-mono font-semibold text-stone-900 text-right">{confirmation.reservationIds.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Status</span>
              <span className={`font-bold ${isWaitlisted ? 'text-amber-600' : 'text-emerald-600'}`}>{confirmation.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total</span>
              <span className="font-bold text-stone-900">{formatPrice(confirmation.totalAmount)}</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition">
            Make Another Booking
          </button>
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
              <span className="block font-semibold text-stone-900 tracking-tight">{settings?.customHotelName || 'Grand Hotel'}</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Direct Reservations</span>
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
                Find your perfect stay
              </h1>
              <p className="text-stone-700 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
                Book directly with us for the best available rates, personalized service, and instant confirmation.
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
                    {step === 1 ? 'Select Room' : step === 2 ? 'Add-ons' : 'Details'}
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
                      <Bed size={18} className="text-amber-500" /> Select your room
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
                      <p className="text-stone-500 font-medium">No rooms available for the selected dates.</p>
                      <p className="text-xs text-stone-400 mt-1">Try adjusting your dates or contact the hotel.</p>
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
            <div className="lg:col-span-12 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selected Room Summary */}
                {selectedItems.length > 0 && (
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                    <div className="p-5 border-b border-stone-100">
                      <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                        <Bed size={18} className="text-amber-500" /> Your Rooms
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {selectedItems.map(item => {
                        const room = rooms.find(r => r.type === item.roomType);
                        if (!room) return null;
                        return (
                          <div key={item.roomType} className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-stone-900">{room.title} × {item.quantity}</p>
                              <p className="text-xs text-stone-500">{nights} night{nights > 1 ? 's' : ''}</p>
                            </div>
                            <span className="font-semibold text-stone-900">{formatPrice(room.rate * nights * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Packages */}
                {packages.length > 0 && !loading && (
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                    <div className="p-5 border-b border-stone-100">
                      <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-500" /> Packages
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {packages.map(pkg => {
                        const quantity = selectedPackageQuantities[pkg.id] || 0;
                        return (
                          <div
                            key={pkg.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              quantity > 0 ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-white'
                            }`}
                          >
                            <div className="min-w-0">
                              <h3 className="font-semibold text-stone-900 text-sm">{pkg.name}</h3>
                              <p className="text-xs text-stone-500 mt-1 truncate">{pkg.description}</p>
                              <p className="mt-1 text-sm font-semibold text-stone-900">
                                {formatPrice(pkg.price)}
                                <span className="text-[10px] font-medium text-stone-400 uppercase ml-1">{pkg.chargeFrequency}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPackageQuantity(pkg.id, quantity - 1)}
                                disabled={quantity === 0}
                                className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-stone-900">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => setPackageQuantity(pkg.id, quantity + 1)}
                                className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Guest Services */}
              {guestServices.length > 0 && !loading && (
                <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                  <div className="p-5 border-b border-stone-100">
                    <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                      <Users size={18} className="text-amber-500" /> Guest Services
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {guestServices.map(gs => {
                        const quantity = selectedGuestServiceQuantities[gs.id] || 0;
                        return (
                          <div
                            key={gs.id}
                            className={`flex flex-col justify-between p-3 rounded-xl border transition-all ${
                              quantity > 0 ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-white'
                            }`}
                          >
                            <div>
                              <h3 className="font-semibold text-stone-900 text-sm">{gs.name}</h3>
                              <p className="text-xs text-stone-500 mt-1">{gs.description}</p>
                              <p className="text-[10px] text-stone-400 mt-1 capitalize">{gs.category}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-sm font-semibold text-stone-900">
                                {formatPrice(gs.price)}
                                <span className="text-[10px] font-medium text-stone-400 uppercase ml-1">per service</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setGuestServiceQuantity(gs.id, quantity - 1)}
                                  disabled={quantity === 0}
                                  className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold text-stone-900">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => setGuestServiceQuantity(gs.id, quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Airport Shuttle Details */}
              {(() => {
                const shuttleService = selectedGuestServices.find(gs => gs.name.toLowerCase().includes('airport') || gs.name.toLowerCase().includes('shuttle'));
                if (!shuttleService) return null;
                return (
                  <div className="bg-white border border-amber-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden mt-6">
                    <div className="p-5 border-b border-amber-100 bg-amber-50/50">
                      <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                        <Plane size={18} className="text-amber-500" /> Airport Shuttle Details
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">Provide flight information so we can schedule your transfer.</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transfer Type</label>
                        <div className="flex gap-3">
                          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition ${airportShuttleDetails.shuttleType === 'Pickup' ? 'border-amber-400 bg-amber-50 text-stone-900' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                            <input type="radio" name="shuttleType" value="Pickup" checked={airportShuttleDetails.shuttleType === 'Pickup'} onChange={() => setAirportShuttleDetails(prev => ({ ...prev, shuttleType: 'Pickup', scheduledDate: checkIn }))} className="sr-only" />
                            <span className="text-sm font-semibold">Pickup</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition ${airportShuttleDetails.shuttleType === 'Drop-off' ? 'border-amber-400 bg-amber-50 text-stone-900' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                            <input type="radio" name="shuttleType" value="Drop-off" checked={airportShuttleDetails.shuttleType === 'Drop-off'} onChange={() => setAirportShuttleDetails(prev => ({ ...prev, shuttleType: 'Drop-off', scheduledDate: checkOut }))} className="sr-only" />
                            <span className="text-sm font-semibold">Drop-off</span>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Flight Number</label>
                          <input type="text" value={airportShuttleDetails.flightNumber} onChange={e => setAirportShuttleDetails(prev => ({ ...prev, flightNumber: e.target.value }))} placeholder="e.g. ET302" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Flight Time</label>
                          <input type="time" value={airportShuttleDetails.flightTime} onChange={e => setAirportShuttleDetails(prev => ({ ...prev, flightTime: e.target.value }))} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transfer Date</label>
                          <input type="date" value={airportShuttleDetails.scheduledDate} min={checkIn} max={checkOut} onChange={e => setAirportShuttleDetails(prev => ({ ...prev, scheduledDate: e.target.value }))} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transfer Time</label>
                          <input type="time" value={airportShuttleDetails.scheduledTime} onChange={e => setAirportShuttleDetails(prev => ({ ...prev, scheduledTime: e.target.value }))} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Notes</label>
                        <textarea value={airportShuttleDetails.notes} onChange={e => setAirportShuttleDetails(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Terminal, number of bags, etc." className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-stone-200 text-stone-900 rounded-xl font-semibold text-sm hover:bg-stone-300 transition flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition flex items-center gap-2"
                >
                  Continue <ChevronRight size={18} />
                </button>
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
                      <CreditCard size={18} /> Guest Details
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-5 space-y-3">
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
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Special requests</label>
                      <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none" />
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer pt-1">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-amber-500" />
                      <span>
                        I agree to the hotel terms and conditions and cancellation policy.
                        <span
                          onClick={e => { e.stopPropagation(); e.preventDefault(); setShowTermsModal(true); }}
                          className="text-amber-600 font-semibold hover:underline ml-1 cursor-pointer"
                        >
                          Read terms
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
                      {submitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><CreditCard size={18} /> Confirm booking</>}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-medium">
                      <ShieldCheck size={12} /> Secure booking · No card required
                    </div>
                  </form>
                </div>

                {/* Booking Summary */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
                  <div className="p-5 border-b border-stone-100">
                    <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                      <ShoppingBag size={18} /> Booking Summary
                    </h3>
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                    {selectedItems.map(item => {
                      const room = rooms.find(r => r.type === item.roomType);
                      if (!room) return null;
                      return (
                        <div key={item.roomType} className="flex justify-between text-stone-600">
                          <span>{room.title} × {item.quantity}</span>
                          <span className="font-medium">{formatPrice(room.rate * nights * item.quantity)}</span>
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
                    {settings?.feeComponents && settings.feeComponents.length > 0 ? (
                      <>
                        {settings.feeComponents.filter(f => f.isEnabled).map(fee => (
                          <div key={fee.id} className="flex justify-between text-stone-600">
                            <span>{fee.name}</span>
                            <span className="font-medium">
                              {fee.feeType === 'percentage' ? `${fee.value}%` : formatPrice(fee.value)}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {pricing.tax > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Tax</span>
                            <span className="font-medium">{formatPrice(pricing.tax)}</span>
                          </div>
                        )}
                        {pricing.serviceCharge > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Service Charge</span>
                            <span className="font-medium">{formatPrice(pricing.serviceCharge)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                      <span>Total</span>
                      <span>{formatPrice(pricing.total)}</span>
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
                <p className="text-xs text-stone-500">{nights} night{nights > 1 ? 's' : ''} · {formatPrice(pricing.roomTotal)}</p>
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
      />
    </div>
  );
}
