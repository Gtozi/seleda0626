/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Room, Guest, Reservation, GroupBooking, CorporateAccount, 
  Promotion, MarketingCampaign, Notification, RatePlan, Season, Package, User,
  RoomTypeMetadata
} from '../types/erp';
import { GlobalSaleTransaction, ExpenseRequest } from '../types/finance';
import { InventoryItem, Store } from '../types/inventory';

export const initialRooms: Room[] = [
  { id: '101', number: '101', type: 'Single', floor: 1, status: 'Vacant Clean', rate: 120, features: ['Wifi', 'TV', 'Desk'] },
  { id: '102', number: '102', type: 'Single', floor: 1, status: 'Vacant Clean', rate: 120, features: ['Wifi', 'TV', 'Desk'] },
  { id: '103', number: '103', type: 'Single', floor: 1, status: 'Vacant Clean', rate: 125, features: ['Wifi', 'TV', 'Desk', 'Mini-bar'] },
  { id: '104', number: '104', type: 'Single', floor: 1, status: 'Vacant Clean', rate: 120, features: ['Wifi', 'TV'] },
  { id: '105', number: '105', type: 'Single', floor: 1, status: 'Vacant Clean', rate: 120, features: ['Wifi', 'TV', 'Desk'] },
  { id: '201', number: '201', type: 'Double', floor: 2, status: 'Vacant Clean', rate: 180, features: ['Wifi', 'TV', 'AC', 'Ocean View'] },
  { id: '202', number: '202', type: 'Double', floor: 2, status: 'Vacant Clean', rate: 180, features: ['Wifi', 'TV', 'AC', 'Garden View'] },
  { id: '203', number: '203', type: 'Double', floor: 2, status: 'Vacant Clean', rate: 185, features: ['Wifi', 'TV', 'AC', 'Mini Fridge'] },
  { id: '204', number: '204', type: 'Double', floor: 2, status: 'Vacant Clean', rate: 180, features: ['Wifi', 'TV', 'AC'] },
  { id: '205', number: '205', type: 'Double', floor: 2, status: 'Vacant Clean', rate: 190, features: ['Wifi', 'TV', 'AC', 'Balcony'] },
  { id: '301', number: '301', type: 'Double', floor: 3, status: 'Vacant Clean', rate: 195, features: ['Wifi', 'TV', 'Balcony', 'Safe'] },
  { id: '302', number: '302', type: 'Double', floor: 3, status: 'Vacant Clean', rate: 195, features: ['Wifi', 'TV', 'Balcony', 'Safe'] },
  { id: '303', number: '303', type: 'Single', floor: 3, status: 'Vacant Clean', rate: 130, features: ['Wifi', 'TV', 'Desk'] },
  { id: '304', number: '304', type: 'Double', floor: 3, status: 'Vacant Clean', rate: 195, features: ['Wifi', 'TV', 'Safe'] },
  { id: '305', number: '305', type: 'Suite', floor: 3, status: 'Vacant Clean', rate: 320, features: ['Wifi', 'King Bed', 'Kitchenette', 'Living Area', 'Jaccuzi'] },
  { id: '401', number: '401', type: 'Suite', floor: 4, status: 'Vacant Clean', rate: 350, features: ['Wifi', 'Living Area', 'King Bed', 'Coffee machine', 'City View'] },
  { id: '402', number: '402', type: 'Suite', floor: 4, status: 'Vacant Clean', rate: 350, features: ['Wifi', 'Living Area', 'King Bed', 'Coffee machine'] },
  { id: '403', number: '403', type: 'Deluxe', floor: 4, status: 'Vacant Clean', rate: 260, features: ['Wifi', 'Balcony', 'AC', 'Mini-bar'] },
  { id: '404', number: '404', type: 'Deluxe', floor: 4, status: 'Vacant Clean', rate: 260, features: ['Wifi', 'Balcony', 'AC', 'Mini-bar'] },
  { id: '405', number: '405', type: 'Deluxe', floor: 4, status: 'Vacant Clean', rate: 260, features: ['Wifi', 'Balcony', 'AC'] },
  { id: '501', number: '501', type: 'Deluxe', floor: 5, status: 'Vacant Clean', rate: 280, features: ['Wifi', 'Top Floor View', 'Jaccuzi', 'Premium Audio'] },
  { id: '502', number: '502', type: 'Penthouse', floor: 5, status: 'Vacant Clean', rate: 650, features: ['Private Elevator', 'Panoramic Terrace', 'Infiniti Pool Access', 'Private Bar', 'Butler Service'] },
  { id: '503', number: '503', type: 'Penthouse', floor: 5, status: 'Vacant Clean', rate: 700, features: ['Private Elevator', 'Panoramic Terrace', 'Ocean View', 'Private Bar', 'Chef On Demand'] }
];

export const initialRoomTypeMetadata: RoomTypeMetadata[] = [
  {
    type: 'Single',
    title: 'Traditional Stone Single Bungalow',
    description: 'Meticulously crafted from local red sandstones with a classic thatched tall cedar ceiling. Offers a peaceful sanctuary with a comfortable bed, handpicked local woven draperies, en-suite stone rain shower, and a private path leading into our organic crop and olive garden.',
    shortDescription: 'Peaceful sandstone sanctuary with garden path and stone rain shower.',
    imgUrl: '/src/assets/images/standard_stone_bungalow_1780826667642.png',
    galleryUrls: [],
    amenities: ['Local Sandstone Masonry', 'Organic Garden Path', 'Handcrafted Textiles', 'Hot Stone Rain Shower', 'Complimentary Macchiato'],
    stars: 4,
    maxOccupancy: 1,
    bedConfiguration: '1 Queen',
    viewType: 'Garden',
    sqm: 28
  },
  {
    type: 'Double',
    title: 'Premium Panoramic Double Bungalow',
    description: 'An authentic dry-stone masterpiece featuring spacious timber beams, luxury layout, and wide bay windows opening to visual views of the monumental rugged mountains. Styled with premium embroidered linens and solid native olive-tree wood vanity crafts.',
    shortDescription: 'Dry-stone masterpiece with mountain panoramas and olive-wood accents.',
    imgUrl: '/src/assets/images/standard_stone_bungalow_1780826667642.png',
    galleryUrls: [],
    amenities: ['Veranda Cliff Chairs', 'Superior Cotton Embroidery', '180° Mountain Panoramas', 'Local Clay Craft Accents', 'Complimentary Local Treats'],
    stars: 5,
    maxOccupancy: 2,
    bedConfiguration: '1 King or 2 Twins',
    viewType: 'Mountain',
    sqm: 38
  },
  {
    type: 'Suite',
    title: 'Heritage Cliff-View Family Suite',
    description: 'Our expansive multi-room stone cottage built with a private handlaid sandstone terrace. Includes a gorgeous indoor fire alcove, authentic local pottery details, spacious premium modern en-suite bath with organic herbal soaps, and breathtaking vantage points of the sunset valleys.',
    shortDescription: 'Multi-room stone cottage with private terrace, fire alcove, and sunset views.',
    imgUrl: '/src/assets/images/cliffview_suite_1780826683307.png',
    galleryUrls: [],
    amenities: ['Expanded Private Veranda', 'Indoor Rock Fire Alcove', 'Traditional Clay Artware', 'Double Stone Vanity', 'Mountain Guide Concierge'],
    stars: 5,
    maxOccupancy: 4,
    bedConfiguration: '1 King + 2 Singles',
    viewType: 'Cliff / Sunset',
    sqm: 65
  },
  {
    type: 'Deluxe',
    title: 'Deluxe Balcony Retreat',
    description: 'A refined elevated sanctuary with private balcony vistas, climate-controlled interiors, and curated mini-bar selections. Perfect for guests seeking understated elegance with modern amenities and seamless mountain views.',
    shortDescription: 'Elevated sanctuary with private balcony, climate control, and curated mini-bar.',
    imgUrl: '/src/assets/images/cliffview_suite_1780826683307.png',
    galleryUrls: [],
    amenities: ['Private Balcony', 'Climate Control', 'Curated Mini-Bar', 'Premium Linens', 'Rainfall Shower'],
    stars: 4,
    maxOccupancy: 2,
    bedConfiguration: '1 King',
    viewType: 'Balcony / City',
    sqm: 42
  },
  {
    type: 'Penthouse',
    title: 'Royal Highland Mountain Residence',
    description: 'Perched on the highest point of our volcanic ridge with breathtaking 360-degree views of the mountain range. Features custom premium feathered quilts, an outdoor stone fire pit for cold desert evenings, direct priorities for rock climbs, and a complementary evening local honey-wine decanter.',
    shortDescription: 'Volcanic ridge penthouse with 360° views, fire pit, and dedicated trail coordinator.',
    imgUrl: '/src/assets/images/mountain_hero_banner_1780826654743.png',
    galleryUrls: [],
    amenities: ['Outdoor Lookout Fire Pit', '360° Massif Vantage', 'Honey-wine Decanter', 'Premium Feather Quilts', 'Dedicated Trail Coordinator'],
    stars: 5,
    maxOccupancy: 6,
    bedConfiguration: '2 King + Lounge',
    viewType: '360° Panoramic',
    sqm: 120
  }
];

export const initialGuests: Guest[] = [
  {
    id: 'G-001',
    name: 'James Anderson',
    lastName: 'Anderson',
    email: 'james.anderson@email.com',
    phone: '+1 555-0101',
    status: 'VIP',
    loyaltyPoints: 2500,
    specialRequests: 'Late check-out, high floor preference',
    notes: 'Frequent business traveler, prefers ocean view rooms',
    history: [
      { id: 'H-001', checkIn: '2025-10-15', checkOut: '2025-10-18', roomType: 'Suite', roomNumber: '305', ratePaid: 320 }
    ],
    totalSpend: 960,
    nationality: 'USA',
    tin: 'US-TAX-12345',
    vatNo: 'US-VAT-67890',
    vatDate: '2024-01-15',
    passportNumber: 'A12345678',
    dateOfBirth: '1980-05-20'
  },
  {
    id: 'G-002',
    name: 'Sophie Laurent',
    lastName: 'Laurent',
    email: 'sophie.laurent@email.com',
    phone: '+33 6 12 34 56 78',
    status: 'Loyalty Member',
    loyaltyPoints: 750,
    specialRequests: 'Hypoallergenic bedding',
    notes: 'French guest, returning customer',
    history: [
      { id: 'H-002', checkIn: '2025-09-10', checkOut: '2025-09-14', roomType: 'Double', roomNumber: '201', ratePaid: 180 }
    ],
    totalSpend: 720,
    nationality: 'France',
    passportNumber: 'FR98765432',
    dateOfBirth: '1985-08-12'
  },
  {
    id: 'G-003',
    name: 'Michael Chen',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+86 138 0000 0000',
    status: 'Regular',
    loyaltyPoints: 0,
    specialRequests: '',
    notes: 'First-time guest',
    history: [],
    totalSpend: 0,
    nationality: 'China',
    parentGroupId: 'GRP-001',
    isPrimaryContact: true
  },
  {
    id: 'G-004',
    name: 'Sarah Johnson',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 555-0202',
    status: 'Regular',
    loyaltyPoints: 0,
    specialRequests: '',
    notes: 'Conference attendee',
    history: [],
    totalSpend: 0,
    nationality: 'USA',
    parentGroupId: 'GRP-001'
  },
  {
    id: 'G-005',
    name: 'David Smith',
    lastName: 'Smith',
    email: 'david.smith@techcorp.com',
    phone: '+1 555-0303',
    status: 'Loyalty Member',
    loyaltyPoints: 500,
    specialRequests: 'Quiet room',
    notes: 'Corporate account holder',
    history: [
      { id: 'H-003', checkIn: '2025-11-01', checkOut: '2025-11-05', roomType: 'Deluxe', roomNumber: '403', ratePaid: 260 }
    ],
    totalSpend: 1040,
    nationality: 'USA',
    parentCorporateId: 'CORP-001',
    isPrimaryContact: true
  }
];

export const initialReservations: Reservation[] = [
  {
    id: 'RES-001',
    guestName: 'James Anderson',
    guestEmail: 'james.anderson@email.com',
    guestPhone: '+1 555-0101',
    guestStatus: 'VIP',
    roomType: 'Suite',
    roomNumber: '305',
    checkInDate: '2026-06-15',
    checkOutDate: '2026-06-18',
    adults: 1,
    children: 0,
    status: 'Confirmed',
    rate: 320,
    totalAmount: 960,
    channel: 'Direct Website',
    paymentStatus: 'Paid',
    notes: 'VIP guest returning',
    charges: [],
    payments: []
  },
  {
    id: 'RES-002',
    guestName: 'Sophie Laurent',
    guestEmail: 'sophie.laurent@email.com',
    guestPhone: '+33 6 12 34 56 78',
    guestStatus: 'Loyalty Member',
    roomType: 'Double',
    roomNumber: '201',
    checkInDate: '2026-06-20',
    checkOutDate: '2026-06-24',
    adults: 2,
    children: 0,
    status: 'Confirmed',
    rate: 180,
    totalAmount: 720,
    channel: 'Booking.com',
    paymentStatus: 'Unpaid',
    notes: 'Loyalty member returning',
    charges: [],
    payments: []
  }
];

export const initialGroupBookings: GroupBooking[] = [
  {
    id: 'GRP-001',
    groupName: 'Tech Conference 2026',
    contactName: 'Michael Chen',
    contactEmail: 'michael.chen@email.com',
    contactPhone: '+86 138 0000 0000',
    roomTypeNeeded: 'Double',
    roomCount: 5,
    checkInDate: '2026-07-10',
    checkOutDate: '2026-07-15',
    discountPercent: 15,
    status: 'Confirmed',
    organizerCompany: 'Tech Innovations Inc',
    cutOffDate: '2026-06-30',
    masterPaymentMethod: 'Invoice',
    creditLimit: 10000,
    roomingList: []
  }
];

export const initialCorporateAccounts: CorporateAccount[] = [
  {
    id: 'CORP-001',
    companyName: 'TechCorp Industries',
    contactPerson: 'David Smith',
    contactEmail: 'david.smith@techcorp.com',
    contactPhone: '+1 555-0303',
    discountPercent: 20,
    activeBookings: 2,
    unpaidBalance: 1500,
    corporateTaxId: 'US-CORP-98765',
    billingAddress: '123 Tech Plaza, Suite 500',
    billingCity: 'San Francisco',
    billingCountry: 'USA',
    creditLimit: 25000,
    lifetimeValue: 45000,
    paymentTerms: 'Net 30',
    isActive: true
  },
  {
    id: 'CORP-002',
    companyName: 'Global Ventures Ltd',
    contactPerson: 'Emma Wilson',
    contactEmail: 'emma.wilson@globalventures.com',
    contactPhone: '+44 20 1234 5678',
    discountPercent: 15,
    activeBookings: 0,
    unpaidBalance: 0,
    corporateTaxId: 'UK-CORP-54321',
    billingAddress: '45 Business Park, London',
    billingCity: 'London',
    billingCountry: 'UK',
    creditLimit: 15000,
    lifetimeValue: 12000,
    paymentTerms: 'Net 15',
    isActive: true
  }
];

export const initialPromotions: Promotion[] = [];

export const initialCampaigns: MarketingCampaign[] = [];

export const initialNotifications: Notification[] = [];

export const initialRatePlans: RatePlan[] = [
  { id: 'RP-STD', name: 'Standard Rate', description: 'Base flexible rate', baseModifier: 1.0, active: true },
  { id: 'RP-NRF', name: 'Non-Refundable', description: '10% discount for pre-payment', baseModifier: 0.9, active: true },
  { id: 'RP-BB', name: 'Bed & Breakfast', description: 'Includes gourmet breakfast buffet', baseModifier: 1.2, active: true },
  { id: 'RP-SPA', name: 'Spa Package', description: 'Includes 1 hour daily spa treatment', baseModifier: 1.5, active: true }
];

export const initialSeasons: Season[] = [
  { id: 'S-PEAK', name: 'Summer High Season', startMonth: 5, startDay: 1, endMonth: 7, endDay: 31, multiplier: 1.5 },
  { id: 'S-WINTER', name: 'Winter Holiday', startMonth: 11, startDay: 15, endMonth: 11, endDay: 31, multiplier: 1.8 },
  { id: 'S-LOW', name: 'Off-Peak Monsoons', startMonth: 8, startDay: 1, endMonth: 9, endDay: 30, multiplier: 0.7 }
];

export const initialPackages: Package[] = [
  { id: 'PKG-AIRPORT', name: 'Airport Shuttle', description: 'One-way pickup/drop-off', price: 45, chargeFrequency: 'once' },
  { id: 'PKG-WIFI', name: 'Premium WiFi', description: 'Uncapped gigabit speed', price: 15, chargeFrequency: 'daily' },
  { id: 'PKG-MINIBAR', name: 'Mini-Bar Refill', description: 'Daily snack & drinks restock', price: 25, chargeFrequency: 'daily' }
];

export const initialSalesTransactions: GlobalSaleTransaction[] = [];

export const initialExpenseRequests: ExpenseRequest[] = [];

export const initialInventoryStores: Store[] = [
  { id: 'ST-MAIN', name: 'Central Warehouse', type: 'Main', manager: 'Warehouse Manager' },
  { id: 'ST-GIFT', name: 'Gift Store', type: 'Departmental', manager: 'Gift Shop Supervisor' },
  { id: 'ST-BAR', name: 'Bar Store', type: 'Departmental', manager: 'Bar Manager' },
  { id: 'ST-REST', name: 'Restaurant Store', type: 'Departmental', manager: 'Head Chef' },
  { id: 'ST-HK', name: 'Housekeeping Central', type: 'Departmental', manager: 'Executive Housekeeper' },
  { id: 'ST-ENG', name: 'Engineering Plant Store', type: 'Departmental', manager: 'Chief Engineer' },
  { id: 'ST-OFC', name: 'Front Office Store', type: 'Departmental', manager: 'Front Desk Manager' }
];

export const initialInventoryItems: InventoryItem[] = [
  // Main Warehouse items (storeId: ST-MAIN)
  { id: 'MW-001', code: 'OFF001', name: 'A4 Copy Paper Ream', category: 'Office Supplies', subcategory: 'Stationery', unit: 'pcs', supplierId: 'SUP-004', minStock: 10, maxStock: 100, reorderLevel: 20, lastCost: 12, avgCost: 12, currentStock: 35, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 12, salePrice: 12 },
  { id: 'MW-002', code: 'OFF002', name: 'Ink Cartridge HP-63', category: 'Office Supplies', subcategory: 'Printing', unit: 'pcs', supplierId: 'SUP-004', minStock: 5, maxStock: 50, reorderLevel: 10, lastCost: 45, avgCost: 45, currentStock: 18, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 45, salePrice: 45 },
  { id: 'MW-003', code: 'GFT003', name: 'Hotel Branded Mug', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-002', minStock: 20, maxStock: 300, reorderLevel: 40, lastCost: 8, avgCost: 8, currentStock: 80, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 18, salePrice: 15, guestPortalActive: true },
  { id: 'MW-004', code: 'GFT004', name: 'Spa Voucher Card', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-002', minStock: 10, maxStock: 150, reorderLevel: 20, lastCost: 2, avgCost: 2, currentStock: 60, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 5, salePrice: 0, guestPortalActive: true },
  { id: 'MW-005', code: 'GFT005', name: 'Local Coffee Blend', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-003', minStock: 15, maxStock: 200, reorderLevel: 30, lastCost: 10, avgCost: 10, currentStock: 55, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 24, salePrice: 20, guestPortalActive: true },
  { id: 'MW-006', code: 'GFT006', name: 'Crystal Keepsake', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-002', minStock: 8, maxStock: 80, reorderLevel: 15, lastCost: 40, avgCost: 40, currentStock: 25, location: 'Central Warehouse', storeId: 'ST-MAIN', retailPrice: 95, salePrice: 80, guestPortalActive: true },
  // Front Office Store items (storeId: ST-OFC)
  { id: 'OFC-001', code: 'OFC001', name: 'Ballpoint Pen Black', category: 'Office Supplies', subcategory: 'Stationery', unit: 'pcs', supplierId: 'SUP-004', minStock: 15, maxStock: 200, reorderLevel: 30, lastCost: 1.50, avgCost: 1.50, currentStock: 45, location: 'Front Office Store', storeId: 'ST-OFC', retailPrice: 1.50, salePrice: 1.50 },
  { id: 'OFC-002', code: 'OFC002', name: 'Sticky Notes 3x3 Yellow', category: 'Office Supplies', subcategory: 'Stationery', unit: 'pcs', supplierId: 'SUP-004', minStock: 10, maxStock: 100, reorderLevel: 20, lastCost: 4, avgCost: 4, currentStock: 30, location: 'Front Office Store', storeId: 'ST-OFC', retailPrice: 4, salePrice: 4 },
  { id: 'OFC-003', code: 'OFC003', name: 'Thermal Paper Roll 80mm', category: 'Office Supplies', subcategory: 'Printing', unit: 'pcs', supplierId: 'SUP-004', minStock: 8, maxStock: 80, reorderLevel: 15, lastCost: 12, avgCost: 12, currentStock: 22, location: 'Front Office Store', storeId: 'ST-OFC', retailPrice: 12, salePrice: 12 },
  { id: 'OFC-004', code: 'OFC004', name: 'Room Key Cards Pack', category: 'Office Supplies', subcategory: 'Consumables', unit: 'pcs', supplierId: 'SUP-005', minStock: 30, maxStock: 500, reorderLevel: 50, lastCost: 3, avgCost: 3, currentStock: 120, location: 'Front Office Store', storeId: 'ST-OFC', retailPrice: 3, salePrice: 3 },
  // Gift Shop items (storeId: ST-GIFT)
  { id: 'GS-001', code: 'GS001', name: 'Plush Resort Robe', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-001', minStock: 5, maxStock: 50, reorderLevel: 10, lastCost: 60, avgCost: 60, currentStock: 20, location: 'Gift Store', storeId: 'ST-GIFT', salePrice: 120, guestPortalActive: true },
  { id: 'GS-002', code: 'GS002', name: 'Signature Scented Candle', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-001', minStock: 5, maxStock: 50, reorderLevel: 10, lastCost: 15, avgCost: 15, currentStock: 30, location: 'Gift Store', storeId: 'ST-GIFT', salePrice: 35, guestPortalActive: true },
  { id: 'GS-003', code: 'GS003', name: 'Crystal Keepsake', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-002', minStock: 3, maxStock: 30, reorderLevel: 5, lastCost: 40, avgCost: 40, currentStock: 12, location: 'Gift Store', storeId: 'ST-GIFT', salePrice: 95, guestPortalActive: true },
  { id: 'GS-004', code: 'GS004', name: 'Local Coffee Blend', category: 'Gift Shop', subcategory: 'Souvenirs', unit: 'pcs', supplierId: 'SUP-003', minStock: 10, maxStock: 100, reorderLevel: 20, lastCost: 10, avgCost: 10, currentStock: 45, location: 'Gift Store', storeId: 'ST-GIFT', salePrice: 24, guestPortalActive: true },
  // F&B items (storeId: ST-REST / ST-BAR)
  { id: 'FB-001', code: 'FB001', name: 'Signature Breakfast Platter', category: 'Food & Beverage', subcategory: 'Bakery', unit: 'srv', supplierId: 'SUP-004', minStock: 10, maxStock: 100, reorderLevel: 20, lastCost: 12, avgCost: 12, currentStock: 50, location: 'Restaurant', storeId: 'ST-REST', salePrice: 28, guestPortalActive: true, dietaryTags: ['Vegetarian'] },
  { id: 'FB-002', code: 'FB002', name: 'Garden Green Club Sandwich', category: 'Food & Beverage', subcategory: 'Dry Foods', unit: 'srv', supplierId: 'SUP-004', minStock: 10, maxStock: 80, reorderLevel: 15, lastCost: 9, avgCost: 9, currentStock: 40, location: 'Restaurant', storeId: 'ST-REST', salePrice: 22, guestPortalActive: true, dietaryTags: ['Vegetarian'] },
  { id: 'FB-003', code: 'FB003', name: 'Aged Ribeye with Jus', category: 'Food & Beverage', subcategory: 'Meat & Poultry', unit: 'srv', supplierId: 'SUP-005', minStock: 5, maxStock: 40, reorderLevel: 8, lastCost: 20, avgCost: 20, currentStock: 18, location: 'Restaurant', storeId: 'ST-REST', salePrice: 45, guestPortalActive: true },
  { id: 'FB-004', code: 'FB004', name: 'Classic Mojito Selection', category: 'Food & Beverage', subcategory: 'Beverages', unit: 'srv', supplierId: 'SUP-006', minStock: 10, maxStock: 60, reorderLevel: 15, lastCost: 7, avgCost: 7, currentStock: 35, location: 'Bar', storeId: 'ST-BAR', salePrice: 18, guestPortalActive: true },
  { id: 'FB-005', code: 'FB005', name: 'Artisan Cheese Board', category: 'Food & Beverage', subcategory: 'Dairy', unit: 'srv', supplierId: 'SUP-007', minStock: 5, maxStock: 30, reorderLevel: 8, lastCost: 10, avgCost: 10, currentStock: 15, location: 'Bar', storeId: 'ST-BAR', salePrice: 24, guestPortalActive: true, dietaryTags: ['Vegetarian', 'Gluten-Free'] }
];
