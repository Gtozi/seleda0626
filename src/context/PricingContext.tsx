/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pricing & catalog context: room types, yield policies, promotions,
 * campaigns, and guest services. Extracted from the legacy ERPContext
 * god-context to reduce re-render storms and establish a single owner
 * for pricing/catalog state.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  RoomTypeDetail,
  YieldPolicy,
  Promotion,
  MarketingCampaign,
  GuestService,
} from '../types/erp';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

export interface PricingContextType {
  roomTypes: RoomTypeDetail[];
  yieldPolicies: YieldPolicy[];
  promotions: Promotion[];
  campaigns: MarketingCampaign[];
  guestServices: GuestService[];
  addRoomType: (roomType: Omit<RoomTypeDetail, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoomType: (id: string, updates: Partial<RoomTypeDetail>) => void;
  deleteRoomType: (id: string) => void;
  addYieldPolicy: (policy: Omit<YieldPolicy, 'id'>) => void;
  updateYieldPolicy: (id: string, updates: Partial<YieldPolicy>) => void;
  deleteYieldPolicy: (id: string) => void;
  addPromotion: (promo: Omit<Promotion, 'id'>) => void;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => void;
  deleteCampaign: (id: string) => void;
  addGuestService: (service: Omit<GuestService, 'id'>) => void;
  updateGuestService: (id: string, updates: Partial<GuestService>) => void;
  deleteGuestService: (id: string) => void;
  refreshData: () => Promise<void>;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Yield policies state
  const [yieldPolicies, setYieldPolicies] = useState<YieldPolicy[]>([]);

  // Campaigns and Promotions state
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Guest Services state
  const [guestServices, setGuestServices] = useState<GuestService[]>([]);

  // Room Types state
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetail[]>([
    {
      id: 'rt_single',
      name: 'Single Room',
      description: 'Comfortable single room perfect for business travelers. Features a cozy workspace and modern amenities.',
      basePrice: 89.00,
      maxOccupancy: 1,
      bedConfiguration: '1 Queen Bed',
      roomSizeSqm: 26,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping'],
      imageUrl1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_double',
      name: 'Double Room',
      description: 'Spacious double room ideal for couples or friends. Offers comfortable bedding and city views.',
      basePrice: 129.00,
      maxOccupancy: 2,
      bedConfiguration: '1 King Bed or 2 Queen Beds',
      roomSizeSqm: 33,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View'],
      imageUrl1: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_suite',
      name: 'Suite',
      description: 'Luxurious suite with separate living area. Perfect for extended stays and special occasions.',
      basePrice: 199.00,
      maxOccupancy: 3,
      bedConfiguration: '1 King Bed + Sofa Bed',
      roomSizeSqm: 51,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View', 'Living Room', 'Dining Table', 'Bathtub', 'Robes'],
      imageUrl1: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_deluxe',
      name: 'Deluxe Room',
      description: 'Premium deluxe room with enhanced amenities and stunning views. Features premium bedding and upgraded bath products.',
      basePrice: 159.00,
      maxOccupancy: 2,
      bedConfiguration: '1 King Bed',
      roomSizeSqm: 39,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'Ocean View', 'Premium Bath Products', 'Turndown Service'],
      imageUrl1: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_penthouse',
      name: 'Penthouse',
      description: 'Exclusive penthouse suite with panoramic views, private terrace, and full luxury amenities. The ultimate accommodation experience.',
      basePrice: 499.00,
      maxOccupancy: 4,
      bedConfiguration: '1 King Bed + 2 Queen Beds',
      roomSizeSqm: 111,
      amenities: ['Free WiFi', 'Multiple Smart TVs', 'Work Desk', 'Air Conditioning', 'Fully Stocked Mini Bar', 'Premium Coffee Maker', 'Safe', 'Daily Housekeeping', 'Panoramic View', 'Living Room', 'Dining Room', 'Private Terrace', 'Jacuzzi', 'Steam Room', 'Butler Service', 'Private Check-in', 'Airport Transfer'],
      imageUrl1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const refreshData = useCallback(async () => {
    if (!hasSupabaseConfig) return;
    try {
      const { data: yieldData } = await supabase.from('yield_policies').select('*');
      if (yieldData) {
        setYieldPolicies(yieldData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          multiplier: row.multiplier,
          isDefault: row.is_default
        })));
      }

      const { data: guestServicesData } = await supabase.from('guest_services').select('*');
      if (guestServicesData) {
        setGuestServices(guestServicesData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          price: row.price,
          available: row.available
        })));
      }

      const { data: roomTypesData } = await supabase.from('room_types').select('*').order('display_order');
      if (roomTypesData && roomTypesData.length > 0) {
        setRoomTypes(roomTypesData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          basePrice: row.base_price,
          maxOccupancy: row.max_occupancy,
          bedConfiguration: row.bed_configuration,
          roomSizeSqm: row.room_size_sqm,
          amenities: row.amenities || [],
          imageUrl1: row.image_url_1,
          imageUrl2: row.image_url_2,
          imageUrl3: row.image_url_3,
          isActive: row.is_active,
          displayOrder: row.display_order,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })));
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addRoomType = useCallback(async (roomType: Omit<RoomTypeDetail, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `rt_${Date.now()}`;
    const now = new Date().toISOString();
    const newRoomType = { ...roomType, id: newId, createdAt: now, updatedAt: now };

    setRoomTypes(prev => [...prev, newRoomType]);

    if (hasSupabaseConfig) {
      try {
        await fetch('/api/room-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: newId,
            name: roomType.name,
            description: roomType.description,
            base_price: roomType.basePrice,
            max_occupancy: roomType.maxOccupancy,
            bed_configuration: roomType.bedConfiguration,
            room_size_sqm: roomType.roomSizeSqm,
            amenities: roomType.amenities,
            image_url_1: roomType.imageUrl1,
            image_url_2: roomType.imageUrl2,
            image_url_3: roomType.imageUrl3,
            is_active: roomType.isActive,
            display_order: roomType.displayOrder
          })
        });
      } catch (error) {
        console.error('Error adding room type:', error);
      }
    }
  }, []);

  const updateRoomType = useCallback(async (id: string, updates: Partial<RoomTypeDetail>) => {
    setRoomTypes(prev => prev.map(rt => {
      if (rt.id === id) {
        return { ...rt, ...updates, updatedAt: new Date().toISOString() };
      }
      return rt;
    }));

    if (hasSupabaseConfig) {
      try {
        await fetch(`/api/room-types/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: updates.name,
            description: updates.description,
            base_price: updates.basePrice,
            max_occupancy: updates.maxOccupancy,
            bed_configuration: updates.bedConfiguration,
            room_size_sqm: updates.roomSizeSqm,
            amenities: updates.amenities,
            image_url_1: updates.imageUrl1,
            image_url_2: updates.imageUrl2,
            image_url_3: updates.imageUrl3,
            is_active: updates.isActive,
            display_order: updates.displayOrder,
            updated_at: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error updating room type:', error);
      }
    }
  }, []);

  const deleteRoomType = useCallback(async (id: string) => {
    setRoomTypes(prev => prev.filter(rt => rt.id !== id));

    if (hasSupabaseConfig) {
      try {
        await fetch(`/api/room-types/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  }, []);

  const addYieldPolicy = useCallback(async (policy: Omit<YieldPolicy, 'id'>) => {
    const newId = `policy_${Date.now()}`;
    const newPolicy = { ...policy, id: newId };

    setYieldPolicies(prev => [...prev, newPolicy]);

    if (hasSupabaseConfig) {
      try {
        await fetch('/api/yield-policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: newId,
            name: policy.name,
            description: policy.description,
            multiplier: policy.multiplier,
            is_default: policy.isDefault
          })
        });
      } catch (error) {
        console.error('Error adding yield policy:', error);
      }
    }
  }, []);

  const updateYieldPolicy = useCallback(async (id: string, updates: Partial<YieldPolicy>) => {
    setYieldPolicies(prev => prev.map(policy => {
      if (policy.id === id) {
        return { ...policy, ...updates };
      }
      return policy;
    }));

    if (hasSupabaseConfig) {
      try {
        await fetch(`/api/yield-policies/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: updates.name,
            description: updates.description,
            multiplier: updates.multiplier,
            is_default: updates.isDefault
          })
        });
      } catch (error) {
        console.error('Error updating yield policy:', error);
      }
    }
  }, []);

  const deleteYieldPolicy = useCallback(async (id: string) => {
    setYieldPolicies(prev => prev.filter(policy => policy.id !== id));

    if (hasSupabaseConfig) {
      try {
        await fetch(`/api/yield-policies/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error deleting yield policy:', error);
      }
    }
  }, []);

  const addCampaign = useCallback((campaign: Omit<MarketingCampaign, 'id'>) => {
    const newId = `camp_${Date.now()}`;
    setCampaigns(prev => [...prev, { ...campaign, id: newId }]);
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(camp => {
      if (camp.id === id) {
        return { ...camp, ...updates };
      }
      return camp;
    }));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(camp => camp.id !== id));
  }, []);

  const addGuestService = useCallback(async (service: Omit<GuestService, 'id'>) => {
    const newId = `gs_${Date.now()}`;
    const newService = { ...service, id: newId };

    setGuestServices(prev => [...prev, newService]);

    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').insert({
          id: newId,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          available: service.available
        });
      } catch (error) {
        console.error('Error adding guest service:', error);
      }
    }
  }, []);

  const updateGuestService = useCallback(async (id: string, updates: Partial<GuestService>) => {
    setGuestServices(prev => prev.map(service => {
      if (service.id === id) {
        return { ...service, ...updates };
      }
      return service;
    }));

    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          price: updates.price,
          available: updates.available
        }).eq('id', id);
      } catch (error) {
        console.error('Error updating guest service:', error);
      }
    }
  }, []);

  const deleteGuestService = useCallback(async (id: string) => {
    setGuestServices(prev => prev.filter(service => service.id !== id));

    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').delete().eq('id', id);
      } catch (error) {
        console.error('Error deleting guest service:', error);
      }
    }
  }, []);

  const addPromotion = useCallback((promo: Omit<Promotion, 'id'>) => {
    const newId = `promo_${Date.now()}`;
    setPromotions(prev => [...prev, { ...promo, id: newId }]);
  }, []);

  const updatePromotion = useCallback((id: string, updates: Partial<Promotion>) => {
    setPromotions(prev => prev.map(promo => {
      if (promo.id === id) {
        return { ...promo, ...updates };
      }
      return promo;
    }));
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotions(prev => prev.filter(promo => promo.id !== id));
  }, []);

  const value: PricingContextType = {
    roomTypes,
    yieldPolicies,
    promotions,
    campaigns,
    guestServices,
    addRoomType,
    updateRoomType,
    deleteRoomType,
    addYieldPolicy,
    updateYieldPolicy,
    deleteYieldPolicy,
    addPromotion,
    updatePromotion,
    deletePromotion,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    refreshData,
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};
