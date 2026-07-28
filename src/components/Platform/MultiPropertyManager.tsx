/**
 * Multi-Property Management
 * Manage property hierarchy, settings, and cross-property configurations
 */

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Users,
  Bed,
  Star,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface Property {
  propertyId: string;
  name: string;
  code: string;
  type: 'brand' | 'group' | 'property';
  parentId?: string;
  timezone: string;
  currency: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  settings: PropertySettings;
  children?: Property[];
}

interface PropertySettings {
  checkInTime: string;
  checkOutTime: string;
  languages: string[];
  taxRate: number;
  cancellationPolicy: string;
  brandStandards: {
    logo?: string;
    colorScheme: string;
    amenities: string[];
  };
}

interface PropertyHierarchy {
  id: string;
  name: string;
  type: 'brand' | 'group' | 'property';
  level: number;
  children: PropertyHierarchy[];
}

const mockProperties: Property[] = [
  {
    propertyId: 'PROP-001',
    name: 'Grand Hotel Downtown',
    code: 'GHD',
    type: 'property',
    parentId: 'GROUP-001',
    timezone: 'America/New_York',
    currency: 'USD',
    location: {
      address: '123 Main Street',
      city: 'New York',
      country: 'USA'
    },
    status: 'active',
    settings: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      languages: ['en', 'es', 'fr'],
      taxRate: 14.875,
      cancellationPolicy: '24 hours',
      brandStandards: {
        colorScheme: '#1e40af',
        amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant']
      }
    }
  },
  {
    propertyId: 'PROP-002',
    name: 'Seaside Resort',
    code: 'SSR',
    type: 'property',
    parentId: 'GROUP-001',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    location: {
      address: '456 Ocean Drive',
      city: 'Miami',
      country: 'USA'
    },
    status: 'active',
    settings: {
      checkInTime: '16:00',
      checkOutTime: '11:00',
      languages: ['en', 'es'],
      taxRate: 11.0,
      cancellationPolicy: '48 hours',
      brandStandards: {
        colorScheme: '#1e40af',
        amenities: ['wifi', 'pool', 'beach', 'spa', 'restaurant']
      }
    }
  },
  {
    propertyId: 'PROP-003',
    name: 'Mountain Lodge',
    code: 'MLO',
    type: 'property',
    parentId: 'GROUP-002',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    location: {
      address: '789 Alpine Way',
      city: 'Zurich',
      country: 'Switzerland'
    },
    status: 'maintenance',
    settings: {
      checkInTime: '15:00',
      checkOutTime: '10:00',
      languages: ['en', 'de', 'fr', 'it'],
      taxRate: 8.1,
      cancellationPolicy: '72 hours',
      brandStandards: {
        colorScheme: '#065f46',
        amenities: ['wifi', 'spa', 'restaurant', 'ski_storage']
      }
    }
  }
];

const mockHierarchy: PropertyHierarchy[] = [
  {
    id: 'BRAND-001',
    name: 'Prestige Hotels Group',
    type: 'brand',
    level: 0,
    children: [
      {
        id: 'GROUP-001',
        name: 'North America Operations',
        type: 'group',
        level: 1,
        children: [
          {
            id: 'PROP-001',
            name: 'Grand Hotel Downtown',
            type: 'property',
            level: 2,
            children: []
          },
          {
            id: 'PROP-002',
            name: 'Seaside Resort',
            type: 'property',
            level: 2,
            children: []
          }
        ]
      },
      {
        id: 'GROUP-002',
        name: 'European Operations',
        type: 'group',
        level: 1,
        children: [
          {
            id: 'PROP-003',
            name: 'Mountain Lodge',
            type: 'property',
            level: 2,
            children: []
          }
        ]
      }
    ]
  }
];

export default function MultiPropertyManager() {
  const [activeTab, setActiveTab] = useState<'properties' | 'hierarchy' | 'settings'>('properties');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['BRAND-001', 'GROUP-001', 'GROUP-002']));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'inactive':
        return <XCircle size={14} className="text-rose-500" />;
      case 'maintenance':
        return <AlertCircle size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return <Building2 size={16} className="text-purple-500" />;
      case 'group':
        return <Users size={16} className="text-blue-500" />;
      case 'property':
        return <Bed size={16} className="text-emerald-500" />;
      default:
        return <Building2 size={16} className="text-slate-500" />;
    }
  };

  const renderHierarchyNode = (node: PropertyHierarchy) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="ml-4">
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
          ) : (
            <div className="w-4" />
          )}
          {getTypeIcon(node.type)}
          <span className="text-sm font-bold text-slate-900 dark:text-white">{node.name}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{node.type}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderHierarchyNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="multi-property-manager">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Multi-Property Management</h2>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
          <Plus size={14} /> Add Property
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Building2 size={20} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {mockProperties.filter(p => p.status === 'active').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Properties</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Globe size={20} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-500">3</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Countries</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Operations</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-500">2</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Groups</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Organizational</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-500">USD/EUR/CHF</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">3</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currencies</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-3xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} /> Properties
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'hierarchy'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={14} /> Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={14} /> Brand Standards
          </button>
        </div>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">All Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProperties.map((property) => (
                <div
                  key={property.propertyId}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 transition-all cursor-pointer"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Building2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{property.name}</h4>
                          {getStatusIcon(property.status)}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{property.code}</span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                      <Settings size={14} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin size={12} />
                      <span>{property.location.city}, {property.location.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock size={12} />
                      <span>{property.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <DollarSign size={12} />
                      <span>{property.currency}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Check-in/out</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {property.settings.checkInTime} / {property.settings.checkOutTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Property Hierarchy</h3>
            <button className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1">
              <Edit size={12} /> Edit Hierarchy
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
            {mockHierarchy.map(node => renderHierarchyNode(node))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Brand Standards</h3>
            <button className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1">
              <Edit size={12} /> Edit Standards
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                Brand Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Primary Color</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-800" style={{ backgroundColor: '#1e40af' }} />
                    <span className="font-mono text-slate-900 dark:text-white">#1e40af</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Logo</span>
                  <div className="mt-1">
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] text-slate-500">Prestige Hotels</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield size={16} className="text-purple-500" />
                Standard Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Free WiFi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Parking'].map((amenity) => (
                  <span key={amenity} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                Language Support
              </h4>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Italian'].map((lang) => (
                  <span key={lang} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Building2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProperty.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{selectedProperty.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedProperty.status)}
                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{selectedProperty.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Type</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-1">{selectedProperty.type}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Timezone</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.timezone}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Currency</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.currency}</div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {selectedProperty.location.address}, {selectedProperty.location.city}, {selectedProperty.location.country}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Check-in Time</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.settings.checkInTime}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Check-out Time</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.settings.checkOutTime}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Tax Rate</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.settings.taxRate}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Cancellation Policy</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedProperty.settings.cancellationPolicy}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs text-white flex items-center gap-2">
                <Edit size={14} /> Edit Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
