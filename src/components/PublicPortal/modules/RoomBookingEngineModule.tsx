/**
 * Room Booking Engine Module
 * Comprehensive room search, availability check, and booking functionality
 */

import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  MapPin,
  Bed,
  Bath,
  Wifi,
  Coffee,
  Wind,
  Tv,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
  X,
  Info,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface RoomBookingEngineModuleProps {
  // Props can be added for pre-filled search parameters
}

interface SearchParams {
  destination: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  promoCode: string;
  corporateCode: string;
  groupCode: string;
}

interface RoomType {
  id: string;
  title: string;
  description: string;
  rate: number;
  baseRate: number;
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
  cancellationPolicy?: string;
  amenities?: string[];
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  chargeFrequency: 'once' | 'daily';
}

const RoomBookingEngineModule: React.FC<RoomBookingEngineModuleProps> = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    destination: '',
    hotel: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    promoCode: '',
    corporateCode: '',
    groupCode: ''
  });

  const [searchResults, setSearchResults] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const filters = {
    priceRange: [0, 1000],
    starRating: 0,
    amenities: [] as string[],
    roomType: [] as string[]
  };

  const mockRoomTypes: RoomType[] = [
    {
      id: '1',
      title: 'Standard Room',
      description: 'Comfortable and well-appointed room with modern amenities',
      rate: 150,
      baseRate: 150,
      capacity: 2,
      available: 5,
      features: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Coffee Maker'],
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600',
      imageUrl3: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=600',
      roomSizeSqm: 28,
      bedConfiguration: '1 Queen Bed',
      displayOrder: 1,
      totalRooms: 20,
      isActive: true,
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Hair Dryer', 'Safe']
    },
    {
      id: '2',
      title: 'Deluxe Room',
      description: 'Spacious room with premium amenities and city views',
      rate: 220,
      baseRate: 220,
      capacity: 2,
      available: 3,
      features: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Coffee Maker', 'Balcony', 'City View'],
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600',
      imageUrl2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600',
      roomSizeSqm: 35,
      bedConfiguration: '1 King Bed',
      displayOrder: 2,
      totalRooms: 15,
      isActive: true,
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Balcony', 'Mini Bar', 'Safe']
    },
    {
      id: '3',
      title: 'Suite',
      description: 'Luxurious suite with separate living area and premium amenities',
      rate: 350,
      baseRate: 350,
      capacity: 4,
      available: 2,
      features: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Coffee Maker', 'Living Room', 'Kitchenette', 'Premium View'],
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600',
      imageUrl2: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=600',
      roomSizeSqm: 55,
      bedConfiguration: '1 King Bed + Sofa Bed',
      displayOrder: 3,
      totalRooms: 8,
      isActive: true,
      cancellationPolicy: 'Free cancellation up to 72 hours before check-in',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Living Room', 'Kitchenette', 'Mini Bar', 'Safe', 'Jacuzzi']
    },
    {
      id: '4',
      title: 'Family Room',
      description: 'Spacious room perfect for families with children',
      rate: 280,
      baseRate: 280,
      capacity: 4,
      available: 4,
      features: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Coffee Maker', 'Kids Amenities', 'Connecting Rooms Available'],
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600',
      roomSizeSqm: 45,
      bedConfiguration: '2 Queen Beds',
      displayOrder: 4,
      totalRooms: 10,
      isActive: true,
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Kids Amenities', 'Safe', 'Microwave']
    }
  ];

  const mockPackages: Package[] = [
    { id: '1', name: 'Bed & Breakfast', description: 'Includes daily breakfast', price: 25, chargeFrequency: 'daily' },
    { id: '2', name: 'Half Board', description: 'Includes breakfast and dinner', price: 45, chargeFrequency: 'daily' },
    { id: '3', name: 'Full Board', description: 'Includes all meals', price: 65, chargeFrequency: 'daily' },
    { id: '4', name: 'Romantic Package', description: 'Champagne, flowers, and late checkout', price: 100, chargeFrequency: 'once' }
  ];

  useEffect(() => {
    // Load initial mock data
    setSearchResults(mockRoomTypes);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSearchResults(mockRoomTypes);
    setIsLoading(false);
  };

  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
    setShowDetails(true);
  };

  const nextImage = () => {
    if (selectedRoom) {
      const images = [selectedRoom.imageUrl, selectedRoom.imageUrl2, selectedRoom.imageUrl3].filter(Boolean);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      const images = [selectedRoom.imageUrl, selectedRoom.imageUrl2, selectedRoom.imageUrl3].filter(Boolean);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={18} />;
    if (amenityLower.includes('coffee')) return <Coffee size={18} />;
    if (amenityLower.includes('air') || amenityLower.includes('wind')) return <Wind size={18} />;
    if (amenityLower.includes('tv')) return <Tv size={18} />;
    if (amenityLower.includes('bath')) return <Bath size={18} />;
    return <Check size={18} />;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Find Your Perfect Room</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="City or Hotel"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hotel</label>
            <select
              value={searchParams.hotel}
              onChange={(e) => setSearchParams({ ...searchParams, hotel: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Hotels</option>
              <option value="seleda-grand">SELEDA Grand Hotel</option>
              <option value="seleda-resort">SELEDA Resort</option>
              <option value="seleda-lodge">SELEDA Lodge</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check In - Check Out</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                  className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white text-sm"
                />
              </div>
              <div className="relative flex-1">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                  className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white text-sm"
                />
              </div>
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

        {/* Promo Codes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Promo Code</label>
            <input
              type="text"
              placeholder="Enter promo code"
              value={searchParams.promoCode}
              onChange={(e) => setSearchParams({ ...searchParams, promoCode: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Corporate Code</label>
            <input
              type="text"
              placeholder="Enter corporate code"
              value={searchParams.corporateCode}
              onChange={(e) => setSearchParams({ ...searchParams, corporateCode: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Group Code</label>
            <input
              type="text"
              placeholder="Enter group code"
              value={searchParams.groupCode}
              onChange={(e) => setSearchParams({ ...searchParams, groupCode: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            {isLoading ? 'Searching...' : 'Search Rooms'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Filter Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                <span className="text-slate-500">-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Star Rating</label>
              <div className="flex gap-2">
                {[3, 4, 5].map((rating) => (
                  <button key={rating} className="flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Star size={16} className="text-amber-500" />
                    <span className="text-sm">{rating}+</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Room Type</label>
              <div className="flex flex-wrap gap-2">
                {['Standard', 'Deluxe', 'Suite', 'Family'].map((type) => (
                  <button key={type} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {searchResults.length} Room Types Available
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              Sort by: Price
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {searchResults.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Room Images */}
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <img
                    src={room.imageUrl}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart size={18} className="text-slate-600" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Share2 size={18} className="text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Room Details */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{room.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">{room.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Bed size={16} />
                          <span>{room.bedConfiguration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{room.capacity} guests</span>
                        </div>
                        {room.roomSizeSqm && (
                          <div className="flex items-center gap-1">
                            <span>{room.roomSizeSqm} m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">${room.rate}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">per night</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {room.features.slice(0, 6).map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                        >
                          {getAmenityIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {room.available} rooms available
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Free Cancellation
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRoomSelect(room)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      View Details
                      <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={() => handleRoomSelect(room)}
                      className="px-6 py-3 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-semibold transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Details Modal */}
      {showDetails && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Image Gallery */}
              <div className="relative h-80">
                {selectedRoom.imageUrl && (
                  <img
                    src={[selectedRoom.imageUrl, selectedRoom.imageUrl2, selectedRoom.imageUrl3].filter(Boolean)[currentImageIndex]}
                    alt={selectedRoom.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {[selectedRoom.imageUrl, selectedRoom.imageUrl2, selectedRoom.imageUrl3].filter(Boolean).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight size={24} className="text-slate-600" />
                </button>
              </div>

              {/* Details Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedRoom.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{selectedRoom.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-indigo-600">${selectedRoom.rate}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">per night</div>
                  </div>
                </div>

                {/* Room Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <Bed size={24} className="text-indigo-600 mb-2" />
                    <div className="text-sm text-slate-600 dark:text-slate-400">Bed Type</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{selectedRoom.bedConfiguration}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <Users size={24} className="text-indigo-600 mb-2" />
                    <div className="text-sm text-slate-600 dark:text-slate-400">Capacity</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{selectedRoom.capacity} guests</div>
                  </div>
                  {selectedRoom.roomSizeSqm && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <MapPin size={24} className="text-indigo-600 mb-2" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">Room Size</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{selectedRoom.roomSizeSqm} m²</div>
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <Info size={24} className="text-indigo-600 mb-2" />
                    <div className="text-sm text-slate-600 dark:text-slate-400">Availability</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{selectedRoom.available} rooms</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRoom.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancellation Policy */}
                {selectedRoom.cancellationPolicy && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                      <Check size={20} />
                      <span className="font-semibold">Cancellation Policy</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">{selectedRoom.cancellationPolicy}</p>
                  </div>
                )}

                {/* Available Packages */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Enhance Your Stay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mockPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{pkg.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{pkg.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-indigo-600">+${pkg.price}</div>
                            <div className="text-xs text-slate-500">{pkg.chargeFrequency}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    Proceed to Booking
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBookingEngineModule;