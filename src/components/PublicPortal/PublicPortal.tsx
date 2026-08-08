/**
 * Unified Public Booking Portal
 * Main component integrating all public portal modules for hotel booking and discovery
 */

import { useState } from 'react';
import {
  Home,
  Building,
  Calendar,
  Sparkles,
  Users,
  UtensilsCrossed,
  Heart,
  Car,
  Gift,
  Award,
  MapPin,
  Image,
  Star,
  Tag,
  User,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Phone,
  Mail
} from 'lucide-react';

// Import all modules
import HomeModule from './modules/HomeModule';
import PropertyDirectoryModule from './modules/PropertyDirectoryModule';
import RoomBookingEngineModule from './modules/RoomBookingEngineModule';
import PackagesPromotionsModule from './modules/PackagesPromotionsModule';
import MeetingsEventsModule from './modules/MeetingsEventsModule';
import WeddingBookingModule from './modules/WeddingBookingModule';
import RestaurantReservationsModule from './modules/RestaurantReservationsModule';
import SpaWellnessBookingModule from './modules/SpaWellnessBookingModule';
import ExperiencesActivitiesModule from './modules/ExperiencesActivitiesModule';
import TransportationBookingModule from './modules/TransportationBookingModule';
import GiftCardsModule from './modules/GiftCardsModule';
import LoyaltyEnrollmentModule from './modules/LoyaltyEnrollmentModule';
import CorporateTravelPartnersModule from './modules/CorporateTravelPartnersModule';
import DestinationGuideModule from './modules/DestinationGuideModule';
import GalleryModule from './modules/GalleryModule';
import ReviewsTestimonialsModule from './modules/ReviewsTestimonialsModule';
import SpecialOffersModule from './modules/SpecialOffersModule';
import GuestAccountModule from './modules/GuestAccountModule';
import ContactLiveChatModule from './modules/ContactLiveChatModule';
import SupportCenterModule from './modules/SupportCenterModule';

type ModuleType = 
  | 'home'
  | 'properties'
  | 'booking'
  | 'packages'
  | 'meetings'
  | 'weddings'
  | 'restaurant'
  | 'spa'
  | 'experiences'
  | 'transportation'
  | 'giftCards'
  | 'loyalty'
  | 'corporate'
  | 'destination'
  | 'gallery'
  | 'reviews'
  | 'offers'
  | 'account'
  | 'contact'
  | 'support';

const PublicPortal: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home' as ModuleType, label: 'Home', icon: <Home size={18} /> },
    { id: 'booking' as ModuleType, label: 'Book Rooms', icon: <Calendar size={18} /> },
    { id: 'properties' as ModuleType, label: 'Properties', icon: <Building size={18} /> },
    { id: 'packages' as ModuleType, label: 'Packages', icon: <Sparkles size={18} /> },
    { id: 'restaurant' as ModuleType, label: 'Restaurants', icon: <UtensilsCrossed size={18} /> },
    { id: 'spa' as ModuleType, label: 'Spa', icon: <Sparkles size={18} /> },
    { id: 'experiences' as ModuleType, label: 'Experiences', icon: <MapPin size={18} /> },
    { id: 'weddings' as ModuleType, label: 'Weddings', icon: <Heart size={18} /> },
    { id: 'meetings' as ModuleType, label: 'Events', icon: <Users size={18} /> },
    { id: 'offers' as ModuleType, label: 'Offers', icon: <Tag size={18} /> },
    { id: 'gallery' as ModuleType, label: 'Gallery', icon: <Image size={18} /> },
    { id: 'reviews' as ModuleType, label: 'Reviews', icon: <Star size={18} /> },
    { id: 'contact' as ModuleType, label: 'Contact', icon: <MessageSquare size={18} /> }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomeModule onNavigate={setActiveModule} />;
      case 'properties':
        return <PropertyDirectoryModule />;
      case 'booking':
        return <RoomBookingEngineModule />;
      case 'packages':
        return <PackagesPromotionsModule />;
      case 'meetings':
        return <MeetingsEventsModule />;
      case 'weddings':
        return <WeddingBookingModule />;
      case 'restaurant':
        return <RestaurantReservationsModule />;
      case 'spa':
        return <SpaWellnessBookingModule />;
      case 'experiences':
        return <ExperiencesActivitiesModule />;
      case 'transportation':
        return <TransportationBookingModule />;
      case 'giftCards':
        return <GiftCardsModule />;
      case 'loyalty':
        return <LoyaltyEnrollmentModule />;
      case 'corporate':
        return <CorporateTravelPartnersModule />;
      case 'destination':
        return <DestinationGuideModule />;
      case 'gallery':
        return <GalleryModule />;
      case 'reviews':
        return <ReviewsTestimonialsModule />;
      case 'offers':
        return <SpecialOffersModule />;
      case 'account':
        return <GuestAccountModule />;
      case 'contact':
        return <ContactLiveChatModule />;
      case 'support':
        return <SupportCenterModule />;
      default:
        return <HomeModule onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveModule('home')}>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">SELEDA Grand Hotel</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Luxury & Comfort</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModule('account')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium"
                >
                  <User size={18} />
                  <span>My Account</span>
                </button>
                <button
                  onClick={() => setActiveModule('booking')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Calendar size={18} />
                  <span>Book Now</span>
                </button>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="px-4 py-3 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeModule === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <button
                    onClick={() => {
                      setActiveModule('account');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <User size={18} />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveModule('support');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <HelpCircle size={18} />
                    <span>Help & Support</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderModule()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SELEDA Grand Hotel</h3>
              <p className="text-slate-400 text-sm mb-4">Experience luxury and comfort in the heart of Ethiopia.</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone size={16} />
                  <span>+251 11 555 1234</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail size={16} />
                  <span>reservations@seleda.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setActiveModule('booking')} className="hover:text-white transition-colors">Book Rooms</button></li>
                <li><button onClick={() => setActiveModule('packages')} className="hover:text-white transition-colors">Packages</button></li>
                <li><button onClick={() => setActiveModule('restaurant')} className="hover:text-white transition-colors">Restaurants</button></li>
                <li><button onClick={() => setActiveModule('spa')} className="hover:text-white transition-colors">Spa & Wellness</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setActiveModule('support')} className="hover:text-white transition-colors">FAQs</button></li>
                <li><button onClick={() => setActiveModule('support')} className="hover:text-white transition-colors">Cancellation Policy</button></li>
                <li><button onClick={() => setActiveModule('support')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModule('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-slate-400 text-sm mb-4">Subscribe for exclusive offers and updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 SELEDA Grand Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;