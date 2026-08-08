/**
 * Front Office Configuration Module
 * Hotel and front office setup, settings, and configuration
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
  ChevronDown,
  Building2,
  Clock,
  Users,
  FileText,
  Shield,
  CreditCard,
  Bell,
  MapPin,
  Phone,
  Mail,
  Globe,
  Printer
} from 'lucide-react';
import StatCard from '../StatCard';

type ConfigSection = 'general' | 'property' | 'rooms' | 'policies' | 'payment' | 'notifications' | 'integrations';

interface HotelSettings {
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  timeZone: string;
  currency: string;
  language: string;
}

interface RoomTypeConfig {
  id: string;
  name: string;
  code: string;
  capacity: number;
  beds: string;
  size: string;
  floor: string;
  amenities: string[];
  housekeepingStatus: boolean;
}

interface PolicyConfig {
  id: string;
  name: string;
  type: 'check_in' | 'check_out' | 'cancellation' | 'payment' | 'housekeeping' | 'other';
  description: string;
  active: boolean;
}

const Configuration = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as ConfigSection) || 'general';
  const setActiveTab = (tab: ConfigSection) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [hotelSettings, setHotelSettings] = useState<HotelSettings>({
    name: 'SELEDA Hotel',
    code: 'SEL',
    address: '123 Main Street',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    phone: '+251 11 123 4567',
    email: 'info@seledahotel.com',
    website: 'www.seledahotel.com',
    timeZone: 'Africa/Addis_Ababa',
    currency: 'ETB',
    language: 'en',
  });

  const [roomTypes] = useState<RoomTypeConfig[]>([
    {
      id: 'RT-001',
      name: 'Deluxe King',
      code: 'DK',
      capacity: 2,
      beds: '1 King',
      size: '35 sqm',
      floor: '1-5',
      amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Safe'],
      housekeepingStatus: true,
    },
    {
      id: 'RT-002',
      name: 'Standard Twin',
      code: 'ST',
      capacity: 2,
      beds: '2 Twin',
      size: '28 sqm',
      floor: '1-4',
      amenities: ['AC', 'WiFi', 'TV'],
      housekeepingStatus: true,
    },
    {
      id: 'RT-003',
      name: 'Suite',
      code: 'SU',
      capacity: 4,
      beds: '1 King + 1 Sofa',
      size: '55 sqm',
      floor: '5-6',
      amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Safe', 'Jacuzzi', 'Balcony'],
      housekeepingStatus: true,
    },
  ]);

  const [policies] = useState<PolicyConfig[]>([
    {
      id: 'POL-001',
      name: 'Check-in Policy',
      type: 'check_in',
      description: 'Check-in from 3:00 PM. Valid ID required. Security deposit may be required.',
      active: true,
    },
    {
      id: 'POL-002',
      name: 'Check-out Policy',
      type: 'check_out',
      description: 'Check-out by 11:00 AM. Late check-out available upon request (subject to availability).',
      active: true,
    },
    {
      id: 'POL-003',
      name: 'Cancellation Policy',
      type: 'cancellation',
      description: 'Free cancellation up to 24 hours before check-in. Late cancellations charged for first night.',
      active: true,
    },
    {
      id: 'POL-004',
      name: 'Payment Policy',
      type: 'payment',
      description: 'Full payment required at check-in. Credit card guarantee required for reservations.',
      active: true,
    },
    {
      id: 'POL-005',
      name: 'Housekeeping Schedule',
      type: 'housekeeping',
      description: 'Daily housekeeping between 9:00 AM - 3:00 PM. Do not disturb available upon request.',
      active: true,
    },
  ]);

  const handleSave = () => {
    setHasChanges(false);
    setShowEditModal(false);
  };

  const handleSettingChange = (field: keyof HotelSettings, value: string) => {
    setHotelSettings({ ...hotelSettings, [field]: value });
    setHasChanges(true);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: ConfigSection; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in" id="configuration">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Hotel and front office setup, settings, and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Save size={16} />
              Save Changes
            </button>
          )}
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Room Types" value="3" icon={Building2} variant="rooms" />
        <StatCard label="Active Policies" value="5" icon={FileText} variant="primary" />
        <StatCard label="Payment Methods" value="4" icon={CreditCard} variant="revenue" />
        <StatCard label="Integrations" value="6" icon={Globe} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="general" label="General" icon={Settings} />
        <TabButton id="property" label="Property" icon={Building2} />
        <TabButton id="rooms" label="Rooms" icon={Building2} />
        <TabButton id="policies" label="Policies" icon={FileText} />
        <TabButton id="payment" label="Payment" icon={CreditCard} />
        <TabButton id="notifications" label="Notifications" icon={Bell} />
        <TabButton id="integrations" label="Integrations" icon={Globe} />
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hotel Name</label>
              <input
                type="text"
                value={hotelSettings.name}
                onChange={(e) => handleSettingChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hotel Code</label>
              <input
                type="text"
                value={hotelSettings.code}
                onChange={(e) => handleSettingChange('code', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
              <select
                value={hotelSettings.timeZone}
                onChange={(e) => handleSettingChange('timeZone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <select
                value={hotelSettings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ETB">ETB - Ethiopian Birr</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
              <select
                value={hotelSettings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Property Tab */}
      {activeTab === 'property' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Property Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <input
                type="text"
                value={hotelSettings.address}
                onChange={(e) => handleSettingChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                value={hotelSettings.city}
                onChange={(e) => handleSettingChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <input
                type="text"
                value={hotelSettings.country}
                onChange={(e) => handleSettingChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={hotelSettings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={hotelSettings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="url"
                  value={hotelSettings.website}
                  onChange={(e) => handleSettingChange('website', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Room Type Configuration</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              + Add Room Type
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Room Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                  <th className="px-4 py-3 text-left font-semibold">Beds</th>
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Floor</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roomTypes.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{room.name}</td>
                    <td className="px-4 py-3 text-slate-600">{room.code}</td>
                    <td className="px-4 py-3 text-slate-600">{room.capacity} guests</td>
                    <td className="px-4 py-3 text-slate-600">{room.beds}</td>
                    <td className="px-4 py-3 text-slate-600">{room.size}</td>
                    <td className="px-4 py-3 text-slate-600">{room.floor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Hotel Policies</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              + Add Policy
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{policy.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${policy.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {policy.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded capitalize">{policy.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Payment Configuration</h3>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Credit Card</div>
                    <div className="text-sm text-slate-500">Visa, Mastercard, Amex</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Enabled</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Bank Transfer</div>
                    <div className="text-sm text-slate-500">Direct bank transfers</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Enabled</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Mobile Money</div>
                    <div className="text-sm text-slate-500">Telebirr, M-Pesa</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Enabled</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Cash</div>
                    <div className="text-sm text-slate-500">Local currency only</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Check-in Notifications</div>
                <div className="text-sm text-slate-500">Alert when guests check in</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Check-out Notifications</div>
                <div className="text-sm text-slate-500">Alert when guests check out</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Housekeeping Alerts</div>
                <div className="text-sm text-slate-500">Notify when rooms need cleaning</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">OTA Booking Alerts</div>
                <div className="text-sm text-slate-500">Notify of new OTA bookings</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">System Integrations</h3>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Booking.com</div>
                    <div className="text-sm text-slate-500">Channel manager integration</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Connected</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Expedia</div>
                    <div className="text-sm text-slate-500">Channel manager integration</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Connected</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Printer size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">PMS Integration</div>
                    <div className="text-sm text-slate-500">Property management system</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Connected</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Payment Gateway</div>
                    <div className="text-sm text-slate-500">Secure payment processing</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;
