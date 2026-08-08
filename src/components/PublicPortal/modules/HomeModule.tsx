/**
 * Home Module
 * Main landing page with hero banner, booking widget, featured offers, and property highlights
 */

import { useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Heart,
  Building,
  Car,
  Award,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Check
} from 'lucide-react';

interface HomeModuleProps {
  onNavigate?: (module: string) => void;
}

interface FeaturedOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  imageUrl: string;
  category: 'rooms' | 'dining' | 'spa' | 'experiences';
}

interface PropertyHighlight {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  startingPrice: number;
  amenities: string[];
}

const HomeModule: React.FC<HomeModuleProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0
  });

  const featuredOffers: FeaturedOffer[] = [
    {
      id: '1',
      title: 'Summer Escape Package',
      description: 'Enjoy 20% off on stays of 3+ nights plus complimentary breakfast',
      discount: '20% OFF',
      validUntil: 'Aug 31, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      category: 'rooms'
    },
    {
      id: '2',
      title: 'Spa Retreat Special',
      description: 'Book any spa treatment and get 50% off on your second treatment',
      discount: '50% OFF',
      validUntil: 'Sep 15, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
      category: 'spa'
    },
    {
      id: '3',
      title: 'Romantic Dinner Package',
      description: '3-course dinner for two with complimentary wine',
      discount: 'SPECIAL',
      validUntil: 'Aug 15, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
      category: 'dining'
    }
  ];

  const propertyHighlights: PropertyHighlight[] = [
    {
      id: '1',
      name: 'SELEDA Grand Hotel',
      location: 'Addis Ababa, Ethiopia',
      rating: 4.8,
      reviewCount: 1234,
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
      startingPrice: 150,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant']
    },
    {
      id: '2',
      name: 'SELEDA Resort',
      location: 'Awasa, Ethiopia',
      rating: 4.9,
      reviewCount: 856,
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600',
      startingPrice: 200,
      amenities: ['Lake View', 'Private Beach', 'Water Sports', 'Kids Club']
    },
    {
      id: '3',
      name: 'SELEDA Lodge',
      location: 'Bale Mountains, Ethiopia',
      rating: 4.7,
      reviewCount: 432,
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600',
      startingPrice: 180,
      amenities: ['Mountain View', 'Hiking Trails', 'Fireplace', 'Restaurant']
    }
  ];

  const quickActions = [
    { id: 'rooms', label: 'Book Rooms', icon: <Calendar size={24} />, module: 'booking', color: 'bg-indigo-600' },
    { id: 'restaurant', label: 'Restaurants', icon: <UtensilsCrossed size={24} />, module: 'restaurant', color: 'bg-rose-600' },
    { id: 'spa', label: 'Spa & Wellness', icon: <Sparkles size={24} />, module: 'spa', color: 'bg-purple-600' },
    { id: 'experiences', label: 'Experiences', icon: <MapPin size={24} />, module: 'experiences', color: 'bg-emerald-600' },
    { id: 'weddings', label: 'Weddings', icon: <Heart size={24} />, module: 'weddings', color: 'bg-pink-600' },
    { id: 'meetings', label: 'Meetings', icon: <Building size={24} />, module: 'meetings', color: 'bg-blue-600' },
    { id: 'transport', label: 'Transport', icon: <Car size={24} />, module: 'transportation', color: 'bg-amber-600' },
    { id: 'offers', label: 'Special Offers', icon: <Award size={24} />, module: 'offers', color: 'bg-red-600' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredOffers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredOffers.length) % featuredOffers.length);
  };

  const handleSearch = () => {
    if (onNavigate) {
      onNavigate('booking');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920"
          alt="Hotel Hero"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
          <h1 className="text-5xl font-bold mb-4 text-center">Welcome to SELEDA Grand Hotel</h1>
          <p className="text-xl mb-8 text-center max-w-2xl">
            Experience luxury and comfort in the heart of Ethiopia. Book direct for the best rates and exclusive offers.
          </p>

          {/* Quick Booking Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check In</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={searchParams.checkIn}
                    onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check Out</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={searchParams.checkOut}
                    onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Guests</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={`${searchParams.adults} Adults, ${searchParams.children} Children`}
                    onChange={(e) => {
                      const [adults, children] = e.target.value.split(', ').map(s => parseInt(s));
                      setSearchParams({ ...searchParams, adults, children });
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white appearance-none"
                  >
                    <option>1 Adults, 0 Children</option>
                    <option>2 Adults, 0 Children</option>
                    <option>2 Adults, 1 Children</option>
                    <option>2 Adults, 2 Children</option>
                    <option>3 Adults, 0 Children</option>
                    <option>4 Adults, 0 Children</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Search Availability
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate?.(action.module)}
              className={`${action.color} hover:opacity-90 text-white p-6 rounded-xl transition-all transform hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-3">
                {action.icon}
                <span className="font-semibold">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Offers Slider */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Offers</h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl">
          {featuredOffers.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative h-[300px]">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-rose-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {offer.discount}
                    </span>
                    <span className="text-sm opacity-90">Valid until {offer.validUntil}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-sm opacity-90 mb-4">{offer.description}</p>
                  <button
                    onClick={() => onNavigate?.('offers')}
                    className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                  >
                    View Offer
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Highlights */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Properties</h2>
          <button
            onClick={() => onNavigate?.('properties')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            View All Properties
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {propertyHighlights.map((property) => (
            <div
              key={property.id}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-slate-900">{property.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{property.name}</h3>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-2">
                  <MapPin size={14} />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-3">
                  <Star size={14} className="text-amber-500" />
                  <span>{property.reviewCount} reviews</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-indigo-600">${property.startingPrice}</span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">/night</span>
                  </div>
                  <button
                    onClick={() => onNavigate?.('booking')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Why Choose SELEDA?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <Award size={32} />, title: 'Best Price Guarantee', description: 'Book direct and get the lowest rates' },
            { icon: <Check size={32} />, title: 'Free Cancellation', description: 'Flexible booking with no hidden fees' },
            { icon: <Sparkles size={32} />, title: 'Exclusive Offers', description: 'Members-only deals and packages' },
            { icon: <Phone size={32} />, title: '24/7 Support', description: 'Round-the-clock customer service' }
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="flex justify-center mb-3 text-indigo-600">{feature.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-indigo-400" />
                <span>+251 11 555 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-indigo-400" />
                <span>reservations@seleda.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-indigo-400" />
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button onClick={() => onNavigate?.('support')} className="block hover:text-indigo-400 transition-colors">FAQs</button>
              <button onClick={() => onNavigate?.('support')} className="block hover:text-indigo-400 transition-colors">Cancellation Policy</button>
              <button onClick={() => onNavigate?.('support')} className="block hover:text-indigo-400 transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate?.('support')} className="block hover:text-indigo-400 transition-colors">Terms & Conditions</button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-slate-400 mb-4">Subscribe for exclusive offers and updates</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeModule;