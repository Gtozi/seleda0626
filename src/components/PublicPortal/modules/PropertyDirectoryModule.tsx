/**
 * Property Directory Module
 * Display and browse all hotel properties in the group
 */

import { useState } from 'react';
import {
  Building,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  Bed,
  Coffee,
  Wifi,
  Car,
  UtensilsCrossed,
  Sparkles,
  Search,
  SlidersHorizontal,
  Check
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'lodge' | 'apartment' | 'villa';
  location: string;
  country: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl: string;
  amenities: string[];
  facilities: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  roomCount: number;
  startingPrice: number;
  awards?: string[];
}

const PropertyDirectoryModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const properties: Property[] = [
    {
      id: '1',
      name: 'SELEDA Grand Hotel',
      type: 'hotel',
      location: 'Addis Ababa',
      country: 'Ethiopia',
      rating: 4.8,
      reviewCount: 1234,
      description: 'Luxury hotel in the heart of Addis Ababa with world-class amenities and services.',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar', 'Room Service', 'Concierge'],
      facilities: ['Conference Rooms', 'Business Center', 'Wedding Venue', 'Parking', 'Airport Shuttle'],
      contact: {
        phone: '+251 11 555 1234',
        email: 'grand@seleda.com',
        website: 'www.seleda-grand.com'
      },
      roomCount: 150,
      startingPrice: 150,
      awards: ['Best Hotel in Ethiopia 2025', 'Luxury Hotel Award']
    },
    {
      id: '2',
      name: 'SELEDA Resort',
      type: 'resort',
      location: 'Awasa',
      country: 'Ethiopia',
      rating: 4.9,
      reviewCount: 856,
      description: 'Beautiful lakeside resort offering stunning views and recreational activities.',
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
      amenities: ['Free WiFi', 'Private Beach', 'Pool', 'Restaurant', 'Spa', 'Kids Club', 'Water Sports'],
      facilities: ['Conference Rooms', 'Wedding Venue', 'Tennis Court', 'Parking', 'Boat Rental'],
      contact: {
        phone: '+251 46 555 5678',
        email: 'resort@seleda.com',
        website: 'www.seleda-resort.com'
      },
      roomCount: 80,
      startingPrice: 200,
      awards: ['Best Resort 2025']
    },
    {
      id: '3',
      name: 'SELEDA Lodge',
      type: 'lodge',
      location: 'Bale Mountains',
      country: 'Ethiopia',
      rating: 4.7,
      reviewCount: 432,
      description: 'Mountain lodge perfect for nature lovers and hiking enthusiasts.',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
      amenities: ['Free WiFi', 'Fireplace', 'Restaurant', 'Hiking Trails', 'Wildlife Tours'],
      facilities: ['Guided Tours', 'Library', 'Parking', 'Restaurant'],
      contact: {
        phone: '+251 43 555 9012',
        email: 'lodge@seleda.com',
        website: 'www.seleda-lodge.com'
      },
      roomCount: 25,
      startingPrice: 180,
      awards: ['Eco-Friendly Lodge Award']
    },
    {
      id: '4',
      name: 'SELEDA Apartments',
      type: 'apartment',
      location: 'Addis Ababa',
      country: 'Ethiopia',
      rating: 4.5,
      reviewCount: 234,
      description: 'Modern serviced apartments for extended stays with full kitchen facilities.',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      amenities: ['Free WiFi', 'Kitchen', 'Washer/Dryer', 'Gym', 'Parking'],
      facilities: ['Business Center', 'Parking', '24/7 Security'],
      contact: {
        phone: '+251 11 555 3456',
        email: 'apartments@seleda.com',
        website: 'www.seleda-apartments.com'
      },
      roomCount: 40,
      startingPrice: 100
    },
    {
      id: '5',
      name: 'SELEDA Villas',
      type: 'villa',
      location: 'Lake Langano',
      country: 'Ethiopia',
      rating: 4.8,
      reviewCount: 156,
      description: 'Private luxury villas with exclusive beach access and personalized services.',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
      amenities: ['Private Pool', 'Kitchen', 'Private Beach', 'Butler Service', 'Spa'],
      facilities: ['Private Chef', 'Boat Dock', 'Parking', 'Security'],
      contact: {
        phone: '+251 44 555 7890',
        email: 'villas@seleda.com',
        website: 'www.seleda-villas.com'
      },
      roomCount: 10,
      startingPrice: 500,
      awards: ['Luxury Villa Award']
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Building size={24} />;
      case 'resort': return <Sparkles size={24} />;
      case 'lodge': return <MapPin size={24} />;
      case 'apartment': return <Building size={24} />;
      case 'villa': return <Award size={24} />;
      default: return <Building size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Our Properties</h1>
        <p className="text-lg opacity-90">Discover our collection of luxury hotels, resorts, and unique accommodations across Ethiopia</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'hotel', 'resort', 'lodge', 'apartment', 'villa'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedProperty(property)}
          >
            <div className="relative h-48">
              <img
                src={property.imageUrl}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                {getTypeIcon(property.type)}
                <span className="text-sm font-medium text-slate-900 capitalize">{property.type}</span>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-slate-900">{property.rating}</span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{property.name}</h3>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-3">
                <MapPin size={14} />
                <span>{property.location}, {property.country}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{property.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {property.amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-2xl font-bold text-indigo-600">${property.startingPrice}</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">/night</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {property.roomCount} rooms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-72">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedProperty.name}</h2>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin size={18} />
                    <span>{selectedProperty.location}, {selectedProperty.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-700 dark:text-amber-400">{selectedProperty.rating}</span>
                  <span className="text-amber-600 dark:text-amber-400">({selectedProperty.reviewCount})</span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">{selectedProperty.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <Bed size={24} className="text-indigo-600 mb-2" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">Rooms</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedProperty.roomCount}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <Users size={24} className="text-indigo-600 mb-2" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">Type</div>
                  <div className="font-semibold text-slate-900 dark:text-white capitalize">{selectedProperty.type}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <Phone size={24} className="text-indigo-600 mb-2" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">Phone</div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{selectedProperty.contact.phone}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <Mail size={24} className="text-indigo-600 mb-2" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">Email</div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{selectedProperty.contact.email}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedProperty.facilities.map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProperty.awards && selectedProperty.awards.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">Awards & Recognition</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.awards.map((award, idx) => (
                      <span key={idx} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm">
                        {award}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Book This Property
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDirectoryModule;