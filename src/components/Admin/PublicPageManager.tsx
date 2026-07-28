/**
 * Public Page Manager
 * Comprehensive management interface for the public booking portal
 * Allows admins to control visibility, content, and branding of the public-facing booking page
 */

import { useState, useEffect } from 'react';
import {
  Globe,
  ShieldAlert,
  Save,
  CheckCircle2,
  Eye,
  FileText,
  Type,
  Palette,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';

interface PublicPageSettings {
  // Visibility & Access
  publicBookingEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;

  // Hotel Branding
  customHotelName: string;
  customHotelAddress: string;
  publicTagline: string;
  heroImageUrl: string;
  hotelLogo: string;
  contactPhone: string;
  contactEmail: string;

  // Booking Page Content
  bookingHeroTitle: string;
  bookingHeroDescription: string;
  bookingStep1Label: string;
  bookingStep2Label: string;
  bookingStep3Label: string;
  bookingRoomsSectionTitle: string;
  bookingPackagesSectionTitle: string;
  bookingGuestServicesSectionTitle: string;
  bookingYourRoomsTitle: string;
  bookingGuestDetailsTitle: string;
  bookingSummaryTitle: string;
  bookingHeaderSubtitle: string;
  bookingNoRoomsMessage: string;
  bookingNoRoomsSubtext: string;
  bookingTermsAgreement: string;
  bookingReadTermsText: string;
  bookingConfirmButtonText: string;
  bookingSecureBookingText: string;

  // Policies
  bookingTerms: string;
}

export default function PublicPageManager() {
  const { globalHotelSettings, updateGlobalHotelSettings, addNotification } = useERP();

  const [activeTab, setActiveTab] = useState<'visibility' | 'branding' | 'content' | 'policies'>('visibility');
  const [settings, setSettings] = useState<PublicPageSettings>({
    publicBookingEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: '',
    customHotelName: '',
    customHotelAddress: '',
    publicTagline: '',
    heroImageUrl: '',
    hotelLogo: '',
    contactPhone: '',
    contactEmail: '',
    bookingHeroTitle: '',
    bookingHeroDescription: '',
    bookingStep1Label: '',
    bookingStep2Label: '',
    bookingStep3Label: '',
    bookingRoomsSectionTitle: '',
    bookingPackagesSectionTitle: '',
    bookingGuestServicesSectionTitle: '',
    bookingYourRoomsTitle: '',
    bookingGuestDetailsTitle: '',
    bookingSummaryTitle: '',
    bookingHeaderSubtitle: '',
    bookingNoRoomsMessage: '',
    bookingNoRoomsSubtext: '',
    bookingTermsAgreement: '',
    bookingReadTermsText: '',
    bookingConfirmButtonText: '',
    bookingSecureBookingText: '',
    bookingTerms: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState(false);

  // Load settings from globalHotelSettings
  useEffect(() => {
    if (globalHotelSettings) {
      setSettings({
        publicBookingEnabled: globalHotelSettings.publicBookingEnabled ?? true,
        maintenanceMode: globalHotelSettings.maintenanceMode ?? false,
        maintenanceMessage: globalHotelSettings.maintenanceMessage || '',
        customHotelName: globalHotelSettings.customHotelName || '',
        customHotelAddress: globalHotelSettings.customHotelAddress || '',
        publicTagline: globalHotelSettings.publicTagline || '',
        heroImageUrl: globalHotelSettings.heroImageUrl || '',
        hotelLogo: globalHotelSettings.hotelLogo || '',
        contactPhone: globalHotelSettings.contactPhone || '',
        contactEmail: globalHotelSettings.contactEmail || '',
        bookingHeroTitle: globalHotelSettings.bookingHeroTitle || '',
        bookingHeroDescription: globalHotelSettings.bookingHeroDescription || '',
        bookingStep1Label: globalHotelSettings.bookingStep1Label || '',
        bookingStep2Label: globalHotelSettings.bookingStep2Label || '',
        bookingStep3Label: globalHotelSettings.bookingStep3Label || '',
        bookingRoomsSectionTitle: globalHotelSettings.bookingRoomsSectionTitle || '',
        bookingPackagesSectionTitle: globalHotelSettings.bookingPackagesSectionTitle || '',
        bookingGuestServicesSectionTitle: globalHotelSettings.bookingGuestServicesSectionTitle || '',
        bookingYourRoomsTitle: globalHotelSettings.bookingYourRoomsTitle || '',
        bookingGuestDetailsTitle: globalHotelSettings.bookingGuestDetailsTitle || '',
        bookingSummaryTitle: globalHotelSettings.bookingSummaryTitle || '',
        bookingHeaderSubtitle: globalHotelSettings.bookingHeaderSubtitle || '',
        bookingNoRoomsMessage: globalHotelSettings.bookingNoRoomsMessage || '',
        bookingNoRoomsSubtext: globalHotelSettings.bookingNoRoomsSubtext || '',
        bookingTermsAgreement: globalHotelSettings.bookingTermsAgreement || '',
        bookingReadTermsText: globalHotelSettings.bookingReadTermsText || '',
        bookingConfirmButtonText: globalHotelSettings.bookingConfirmButtonText || '',
        bookingSecureBookingText: globalHotelSettings.bookingSecureBookingText || '',
        bookingTerms: globalHotelSettings.bookingTerms || ''
      });
    }
  }, [globalHotelSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      await updateGlobalHotelSettings({
        publicBookingEnabled: settings.publicBookingEnabled,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        customHotelName: settings.customHotelName,
        customHotelAddress: settings.customHotelAddress,
        publicTagline: settings.publicTagline,
        heroImageUrl: settings.heroImageUrl,
        hotelLogo: settings.hotelLogo,
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        bookingHeroTitle: settings.bookingHeroTitle,
        bookingHeroDescription: settings.bookingHeroDescription,
        bookingStep1Label: settings.bookingStep1Label,
        bookingStep2Label: settings.bookingStep2Label,
        bookingStep3Label: settings.bookingStep3Label,
        bookingRoomsSectionTitle: settings.bookingRoomsSectionTitle,
        bookingPackagesSectionTitle: settings.bookingPackagesSectionTitle,
        bookingGuestServicesSectionTitle: settings.bookingGuestServicesSectionTitle,
        bookingYourRoomsTitle: settings.bookingYourRoomsTitle,
        bookingGuestDetailsTitle: settings.bookingGuestDetailsTitle,
        bookingSummaryTitle: settings.bookingSummaryTitle,
        bookingHeaderSubtitle: settings.bookingHeaderSubtitle,
        bookingNoRoomsMessage: settings.bookingNoRoomsMessage,
        bookingNoRoomsSubtext: settings.bookingNoRoomsSubtext,
        bookingTermsAgreement: settings.bookingTermsAgreement,
        bookingReadTermsText: settings.bookingReadTermsText,
        bookingConfirmButtonText: settings.bookingConfirmButtonText,
        bookingSecureBookingText: settings.bookingSecureBookingText,
        bookingTerms: settings.bookingTerms
      });

      setSaveStatus('success');
      addNotification('Public page settings saved', 'success', 'Executive');

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      addNotification('Failed to save settings', 'error', 'Executive');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'visibility', label: 'Visibility', icon: ShieldAlert },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'policies', label: 'Policies', icon: FileText }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Globe size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Public Page Manager</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage public booking portal visibility and content</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <Eye size={16} />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'visibility' && (
            <motion.div
              key="visibility"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Access Control</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Globe size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Public Booking Enabled</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Allow guests to access the public booking portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ ...s, publicBookingEnabled: !s.publicBookingEnabled }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.publicBookingEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.publicBookingEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Maintenance Mode</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Temporarily disable the public booking portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.maintenanceMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                    >
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Maintenance Message
                      </label>
                      <textarea
                        value={settings.maintenanceMessage}
                        onChange={e => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter the message to display to visitors during maintenance..."
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {!settings.publicBookingEnabled && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-400">Public Booking Disabled</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      The public booking portal is currently disabled. Visitors will see a "Booking Temporarily Unavailable" message.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'branding' && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Hotel Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      value={settings.customHotelName}
                      onChange={e => setSettings(s => ({ ...s, customHotelName: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your Hotel Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.customHotelAddress}
                      onChange={e => setSettings(s => ({ ...s, customHotelAddress: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="123 Main Street, City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.publicTagline}
                      onChange={e => setSettings(s => ({ ...s, publicTagline: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Experience luxury in the heart of the city"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={e => setSettings(s => ({ ...s, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+251 911 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={e => setSettings(s => ({ ...s, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="reservations@hotel.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Images</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hero Image URL
                    </label>
                    <input
                      type="url"
                      value={settings.heroImageUrl}
                      onChange={e => setSettings(s => ({ ...s, heroImageUrl: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://example.com/hero-image.jpg"
                    />
                    {settings.heroImageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <img src={settings.heroImageUrl} alt="Hero preview" className="w-full h-48 object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hotel Logo URL
                    </label>
                    <input
                      type="url"
                      value={settings.hotelLogo}
                      onChange={e => setSettings(s => ({ ...s, hotelLogo: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Hero Section</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={settings.bookingHeroTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingHeroTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Find your perfect stay"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hero Description
                    </label>
                    <textarea
                      value={settings.bookingHeroDescription}
                      onChange={e => setSettings(s => ({ ...s, bookingHeroDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Book directly with us for the best available rates..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Header Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.bookingHeaderSubtitle}
                      onChange={e => setSettings(s => ({ ...s, bookingHeaderSubtitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Direct Reservations"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Step Labels</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Step 1
                    </label>
                    <input
                      type="text"
                      value={settings.bookingStep1Label}
                      onChange={e => setSettings(s => ({ ...s, bookingStep1Label: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Select Room"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Step 2
                    </label>
                    <input
                      type="text"
                      value={settings.bookingStep2Label}
                      onChange={e => setSettings(s => ({ ...s, bookingStep2Label: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Add-ons"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Step 3
                    </label>
                    <input
                      type="text"
                      value={settings.bookingStep3Label}
                      onChange={e => setSettings(s => ({ ...s, bookingStep3Label: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Details"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Section Titles</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rooms Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingRoomsSectionTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingRoomsSectionTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Select your room"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Packages Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingPackagesSectionTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingPackagesSectionTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Packages"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Guest Services Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingGuestServicesSectionTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingGuestServicesSectionTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Guest Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Your Rooms Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingYourRoomsTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingYourRoomsTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your Rooms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Guest Details Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingGuestDetailsTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingGuestDetailsTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Guest Details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Summary Section
                    </label>
                    <input
                      type="text"
                      value={settings.bookingSummaryTitle}
                      onChange={e => setSettings(s => ({ ...s, bookingSummaryTitle: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Booking Summary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Messages & Buttons</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      No Rooms Message
                    </label>
                    <input
                      type="text"
                      value={settings.bookingNoRoomsMessage}
                      onChange={e => setSettings(s => ({ ...s, bookingNoRoomsMessage: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="No rooms available for the selected dates."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      No Rooms Subtext
                    </label>
                    <input
                      type="text"
                      value={settings.bookingNoRoomsSubtext}
                      onChange={e => setSettings(s => ({ ...s, bookingNoRoomsSubtext: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Try adjusting your dates or contact the hotel."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Terms Agreement Text
                    </label>
                    <input
                      type="text"
                      value={settings.bookingTermsAgreement}
                      onChange={e => setSettings(s => ({ ...s, bookingTermsAgreement: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="I agree to the hotel terms and conditions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Read Terms Link Text
                    </label>
                    <input
                      type="text"
                      value={settings.bookingReadTermsText}
                      onChange={e => setSettings(s => ({ ...s, bookingReadTermsText: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Read terms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Button Text
                    </label>
                    <input
                      type="text"
                      value={settings.bookingConfirmButtonText}
                      onChange={e => setSettings(s => ({ ...s, bookingConfirmButtonText: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Confirm booking"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Secure Booking Text
                    </label>
                    <input
                      type="text"
                      value={settings.bookingSecureBookingText}
                      onChange={e => setSettings(s => ({ ...s, bookingSecureBookingText: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Secure booking · No card required"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Booking Terms & Conditions</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Terms Text
                  </label>
                  <textarea
                    value={settings.bookingTerms}
                    onChange={e => setSettings(s => ({ ...s, bookingTerms: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your booking terms and conditions..."
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400">Policy Management</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        For advanced policy management (cancellation policies, hotel rules, etc.), use the Business Admin module in the Executive Portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Status Toast */}
      <AnimatePresence>
        {saveStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg"
          >
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
