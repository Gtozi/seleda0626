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

export const initialRooms: Room[] = [];

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

export const initialGuests: Guest[] = [];

export const initialReservations: Reservation[] = [];

export const initialGroupBookings: GroupBooking[] = [];

export const initialCorporateAccounts: CorporateAccount[] = [];

export const initialPromotions: Promotion[] = [];

export const initialCampaigns: MarketingCampaign[] = [];

export const initialNotifications: Notification[] = [];

export const initialRatePlans: RatePlan[] = [];

export const initialSeasons: Season[] = [];

export const initialPackages: Package[] = [];

export const initialSalesTransactions: GlobalSaleTransaction[] = [];

export const initialExpenseRequests: ExpenseRequest[] = [];

export const initialInventoryStores: Store[] = [];

export const initialInventoryItems: InventoryItem[] = [];
