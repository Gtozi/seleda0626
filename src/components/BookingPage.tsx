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
  Star,
  Wifi,
  Coffee,
  Wind,
  Bath,
  Tv,
  Zap,
  UtensilsCrossed,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  ShoppingBag,
  X,
  ScrollText
} from 'lucide-react';

interface PublicRoom {
  type: string;
  title: string;
  description: string;
  rate: number;
  capacity: number;
  available: number;
  features: string[];
  imageUrl: string;
}

interface PublicPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  chargeFrequency: 'once' | 'daily';
}

interface PublicSettings {
  customHotelName: string;
  customHotelAddress: string;
  publicTagline: string;
  heroImageUrl: string;
  contactPhone: string;
  contactEmail: string;
  taxPercent: number;
  serviceChargePercent: number;
  publicBookingEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  bookingTerms: string;
}

interface CartItem {
  roomType: string;
  quantity: number;
  adults: number;
  children: number;
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

const FeatureBadge = ({ text }: { text: string }) => {
  const Icon = featureIcons[text] || Star;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 border border-stone-200 rounded-full text-[10px] font-semibold text-stone-600">
      <Icon size={12} /> {text}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [checkIn, setCheckIn] = useState<string>(getTomorrowStr());
  const [checkOut, setCheckOut] = useState<string>(getFourDaysLaterStr());
  const [defaultAdults, setDefaultAdults] = useState<number>(2);
  const [defaultChildren, setDefaultChildren] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
        const [roomsRes, pkgRes] = await Promise.all([
          fetch(`/api/public/rooms?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`),
          fetch('/api/public/packages')
        ]);
        if (!roomsRes.ok) throw new Error('Failed to load rooms');
        if (!pkgRes.ok) throw new Error('Failed to load packages');
        const roomsData = await roomsRes.json();
        const pkgData = await pkgRes.json();
        setRooms(roomsData.rooms || []);
        setPackages(pkgData.packages || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, [checkIn, checkOut]);

  const getCartItem = useCallback((roomType: string) => cart.find(item => item.roomType === roomType), [cart]);
  const cartQuantity = useCallback((roomType: string) => getCartItem(roomType)?.quantity || 0, [getCartItem]);

  const addToCart = useCallback((room: PublicRoom) => {
    const currentQty = cartQuantity(room.type);
    if (currentQty >= room.available) return;
    setCart(prev => {
      const existing = prev.find(item => item.roomType === room.type);
      if (existing) {
        return prev.map(item => item.roomType === room.type ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { roomType: room.type, quantity: 1, adults: defaultAdults, children: defaultChildren }];
    });
  }, [cartQuantity, defaultAdults, defaultChildren]);

  const removeFromCart = useCallback((roomType: string) => {
    setCart(prev => prev.filter(item => item.roomType !== roomType));
  }, []);

  const updateCartQuantity = useCallback((roomType: string, quantity: number, room: PublicRoom) => {
    if (quantity <= 0) {
      removeFromCart(roomType);
      return;
    }
    if (quantity > room.available) return;
    setCart(prev => prev.map(item => item.roomType === roomType ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const updateCartGuests = useCallback((roomType: string, adults: number, children: number) => {
    setCart(prev => prev.map(item => item.roomType === roomType ? { ...item, adults, children } : item));
  }, []);

  const selectedPackages = useMemo(
    () => packages.filter(p => selectedPackageIds.includes(p.id)),
    [packages, selectedPackageIds]
  );

  const pricing = useMemo(() => {
    if (cart.length === 0 || nights === 0) return { roomTotal: 0, packageTotal: 0, tax: 0, serviceCharge: 0, total: 0 };
    let roomTotal = 0;
    for (const item of cart) {
      const room = rooms.find(r => r.type === item.roomType);
      if (room) roomTotal += room.rate * item.quantity * nights;
    }
    const packageTotal = selectedPackages.reduce((sum, p) => sum + p.price * (p.chargeFrequency === 'daily' ? nights : 1), 0);
    const subtotal = roomTotal + packageTotal;
    const tax = Math.round(subtotal * ((settings?.taxPercent || 0) / 100));
    const serviceCharge = Math.round(subtotal * ((settings?.serviceChargePercent || 0) / 100));
    return { roomTotal, packageTotal, tax, serviceCharge, total: subtotal + tax + serviceCharge };
  }, [cart, rooms, nights, selectedPackages, settings]);

  const togglePackage = useCallback((id: string) => {
    setSelectedPackageIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || nights === 0 || !agreed) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          packageIds: selectedPackageIds,
          specialRequests,
          items: cart.map(item => ({
            roomType: item.roomType,
            quantity: item.quantity,
            adults: item.adults,
            children: item.children
          }))
        })
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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 lg:px-10 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">G</div>
            <div className="leading-tight">
              <span className="block font-semibold text-stone-900 tracking-tight">{settings?.customHotelName || 'Grand Hotel'}</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-stone-500 font-medium">Direct Reservations</span>
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
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] max-h-[540px] overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img
            src={settings?.heroImageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920'}
            alt="Hotel hero"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-950/20" />
        </div>
        <div className="relative h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col justify-end pb-28 md:pb-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} /> {settings?.publicTagline || 'Direct Booking'}
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-[1.1] max-w-2xl">
              Find your perfect stay
            </h1>
            <p className="text-stone-300 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
              Book directly with us for the best available rates, personalized service, and instant confirmation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Floating Search Bar */}
      <div className="relative z-30 -mt-16 px-4 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 border border-stone-200 p-4 md:p-6"
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
                  <Users size={12} /> Default guests per room
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-3">
                  <Counter label="Adults" value={defaultAdults} onChange={setDefaultAdults} min={1} max={10} />
                  <Counter label="Children" value={defaultChildren} onChange={setDefaultChildren} min={0} max={10} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main */}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-9 space-y-10">
            {/* Rooms */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <Bed size={18} className="text-amber-500" /> Select your rooms
                </h2>
                <span className="text-xs text-stone-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4 flex gap-4 animate-pulse">
                      <div className="w-full md:w-80 h-44 md:h-56 bg-stone-200 rounded-xl" />
                      <div className="flex-1 space-y-3 py-2">
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
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {rooms.map((room, index) => {
                      const qty = cartQuantity(room.type);
                      const inCart = qty > 0;
                      const soldOut = room.available === 0;
                      return (
                        <motion.div
                          key={room.type}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group relative bg-white border rounded-2xl overflow-hidden transition-all ${
                            inCart ? 'border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-900/5' : 'border-stone-200 hover:border-amber-300 hover:shadow-md'
                          } ${soldOut ? 'opacity-60' : ''}`}
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-80 h-56 md:h-auto shrink-0">
                              <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover" />
                              {inCart && (
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-stone-900 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  {qty} in cart
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
                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-stone-900">{room.title}</h3>
                                    <p className="text-sm text-stone-500 mt-1.5 leading-relaxed max-w-md">{room.description}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-2xl font-bold text-stone-900">{formatPrice(room.rate)}</p>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">/ night</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-5">
                                  {room.features.slice(0, 6).map((f, i) => <FeatureBadge key={i} text={f} />)}
                                </div>
                              </div>

                              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <span className={`text-sm font-bold ${room.available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {room.available > 0 ? `${room.available} room${room.available > 1 ? 's' : ''} available` : 'No availability'}
                                </span>

                                {inCart ? (
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
                                      <button
                                        onClick={() => updateCartQuantity(room.type, qty - 1, room)}
                                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 transition"
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="w-6 text-center text-sm font-bold text-stone-900">{qty}</span>
                                      <button
                                        onClick={() => updateCartQuantity(room.type, qty + 1, room)}
                                        disabled={qty >= room.available}
                                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => removeFromCart(room.type)}
                                      className="p-2 text-stone-400 hover:text-rose-600 transition"
                                      aria-label="Remove from cart"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(room)}
                                    disabled={soldOut}
                                    className="px-5 py-2.5 bg-stone-900 disabled:bg-stone-300 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition flex items-center gap-2"
                                  >
                                    Add to cart <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* Packages */}
            {packages.length > 0 && !loading && (
              <section>
                <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2 mb-5">
                  <Sparkles size={18} className="text-amber-500" /> Enhance your stay
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map(pkg => {
                    const selected = selectedPackageIds.includes(pkg.id);
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => togglePackage(pkg.id)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          selected ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400' : 'border-stone-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-stone-900">{pkg.name}</h3>
                            <p className="text-xs text-stone-500 mt-1">{pkg.description}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'bg-amber-400 border-amber-400 text-white' : 'border-stone-300'}`}>
                            {selected && <Check size={14} />}
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-stone-900">
                          {formatPrice(pkg.price)}
                          <span className="text-[10px] font-medium text-stone-400 uppercase ml-1">{pkg.chargeFrequency}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Cart / Summary */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                    <ShoppingBag size={18} /> Your cart
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {nights} night{nights > 1 ? 's' : ''}
                  </p>
                </div>
                {cart.length > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} item{cart.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {cart.length > 0 ? (
                <>
                  <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto">
                    {cart.map(item => {
                      const room = rooms.find(r => r.type === item.roomType);
                      if (!room) return null;
                      return (
                        <div key={item.roomType} className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-stone-900">{room.title}</p>
                              <p className="text-xs text-stone-500">{item.quantity} × {nights} night{nights > 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.roomType)} className="text-stone-400 hover:text-rose-600 transition">
                              <X size={14} />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.roomType, item.quantity - 1, room)}
                                className="w-6 h-6 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.roomType, item.quantity + 1, room)}
                                disabled={item.quantity >= room.available}
                                className="w-6 h-6 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 disabled:opacity-40"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="font-semibold text-stone-900">{formatPrice(room.rate * item.quantity * nights)}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-stone-100">
                            <Counter label="Adults" value={item.adults} onChange={v => updateCartGuests(item.roomType, v, item.children)} min={1} max={10} />
                            <div className="mt-2">
                              <Counter label="Children" value={item.children} onChange={v => updateCartGuests(item.roomType, item.adults, v)} min={0} max={10} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 space-y-3 text-sm border-t border-stone-100">
                    <div className="flex justify-between text-stone-600">
                      <span>Rooms</span>
                      <span className="font-medium">{formatPrice(pricing.roomTotal)}</span>
                    </div>
                    {selectedPackages.map(pkg => (
                      <div key={pkg.id} className="flex justify-between text-stone-600">
                        <span>{pkg.name}</span>
                        <span className="font-medium">{formatPrice(pkg.price * (pkg.chargeFrequency === 'daily' ? nights : 1))}</span>
                      </div>
                    ))}
                    {(pricing.tax > 0 || pricing.serviceCharge > 0) && (
                      <div className="flex justify-between text-stone-600">
                        <span>Taxes & fees</span>
                        <span className="font-medium">{formatPrice(pricing.tax + pricing.serviceCharge)}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                      <span>Total</span>
                      <span>{formatPrice(pricing.total)}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-3">
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Special requests</label>
                      <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none" />
                    </div>
                    <div className="border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowTerms(p => !p)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                      >
                        <span className="flex items-center gap-1.5"><ScrollText size={14} /> Terms & Conditions</span>
                        <span className="text-stone-400">{showTerms ? 'Hide' : 'Read'}</span>
                      </button>
                      <AnimatePresence>
                        {showTerms && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 text-xs text-stone-600 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line bg-white">
                              {settings?.bookingTerms || 'No terms and conditions have been set yet. Please contact the hotel for more information.'}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer pt-1">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-amber-500" />
                      <span>
                        I agree to the hotel terms and conditions and cancellation policy.
                        <span
                          onClick={e => { e.stopPropagation(); e.preventDefault(); setShowTerms(true); }}
                          className="text-amber-600 font-semibold hover:underline ml-1 cursor-pointer"
                        >
                          Read terms
                        </span>
                      </span>
                    </label>
                    <button
                      disabled={submitting || !agreed || cart.length === 0}
                      className="w-full py-3.5 bg-stone-900 disabled:bg-stone-300 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2"
                    >
                      {submitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><CreditCard size={18} /> Confirm booking</>}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-medium">
                      <ShieldCheck size={12} /> Secure booking · No card required
                    </div>
                  </form>
                </>
              ) : (
                <div className="p-8 text-center text-sm text-stone-500">
                  <ShoppingBag size={32} className="mx-auto text-stone-300 mb-3" />
                  Your cart is empty. Add rooms to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-12">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>{settings?.customHotelName || 'Grand Hotel'} &copy; {new Date().getFullYear()}</p>
          {settings?.customHotelAddress && <p className="flex items-center gap-1"><MapPin size={12} /> {settings.customHotelAddress}</p>}
        </div>
      </footer>
    </div>
  );
}
