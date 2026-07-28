/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface ChannelConnection {
  id: string;
  channelName: string;
  channelCode: string;
  channelType: string;
  apiEndpoint: string;
  apiVersion?: string;
  credentials: any;
  webhookUrl?: string;
  syncIntervalMinutes: number;
  lastSyncAt?: string;
  lastSyncStatus: string;
  lastSyncError?: string;
  rateParityEnabled: boolean;
  rateParityThreshold: number;
  inventorySyncEnabled: boolean;
  bookingSyncEnabled: boolean;
  active: boolean;
  testMode: boolean;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelRoomMapping {
  id: string;
  channelId: string;
  ourRoomTypeId: string;
  channelRoomCode: string;
  channelRoomName?: string;
  qualityScore: number;
  rateMultiplier: number;
  inventoryMultiplier: number;
  active: boolean;
  syncEnabled: boolean;
  mappedAt: string;
}

export interface ChannelBooking {
  id: string;
  channelId: string;
  channelBookingId: string;
  channelConfirmationCode?: string;
  reservationId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  channelRate: number;
  channelCurrency: string;
  ourRate?: number;
  totalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netAmount: number;
  bookingStatus: string;
  syncStatus: string;
  specialRequests?: string;
  channelRawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: string[];
  duration: number;
}

export interface RateSyncResult {
  success: boolean;
  recordsProcessed: number;
  parityViolations: number;
  errors: string[];
  duration: number;
}

export interface BookingSyncResult {
  success: boolean;
  bookingsProcessed: number;
  bookingsConfirmed: number;
  bookingsCancelled: number;
  errors: string[];
  duration: number;
}

// ============================================
// CHANNEL MANAGER SERVICE
// ============================================

export class ChannelManagerService {
  
  // ============================================
  // CHANNEL CONNECTION MANAGEMENT
  // ============================================
  
  static async getChannelConnections(): Promise<ChannelConnection[]> {
    const { data, error } = await supabase
      .from('channel_connections')
      .select('*')
      .order('channel_name');
    
    if (error) throw error;
    return data.map(this.mapChannelConnection);
  }
  
  static async getChannelConnection(channelId: string): Promise<ChannelConnection | null> {
    const { data, error } = await supabase
      .from('channel_connections')
      .select('*')
      .eq('id', channelId)
      .single();
    
    if (error || !data) return null;
    return this.mapChannelConnection(data);
  }
  
  static async getChannelConnectionByCode(channelCode: string): Promise<ChannelConnection | null> {
    const { data, error } = await supabase
      .from('channel_connections')
      .select('*')
      .eq('channel_code', channelCode)
      .single();
    
    if (error || !data) return null;
    return this.mapChannelConnection(data);
  }
  
  static async updateChannelCredentials(channelId: string, credentials: any): Promise<void> {
    const { error } = await supabase
      .from('channel_connections')
      .update({ 
        credentials: credentials,
        updated_at: new Date().toISOString()
      })
      .eq('id', channelId);
    
    if (error) throw error;
  }
  
  static async testChannelConnection(channelId: string): Promise<boolean> {
    const channel = await this.getChannelConnection(channelId);
    if (!channel) return false;
    
    try {
      switch (channel.channelCode) {
        case 'BOOKINGCOM':
          return await this.testBookingComConnection(channel);
        case 'EXPEDIA':
          return await this.testExpediaConnection(channel);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Connection test failed for ${channel.channelName}:`, error);
      return false;
    }
  }
  
  // ============================================
  // ROOM MAPPING MANAGEMENT
  // ============================================
  
  static async getChannelRoomMappings(channelId: string): Promise<ChannelRoomMapping[]> {
    const { data, error } = await supabase
      .from('channel_room_mapping')
      .select('*')
      .eq('channel_id', channelId)
      .eq('active', true);
    
    if (error) throw error;
    return data.map(this.mapChannelRoomMapping);
  }
  
  static async addChannelRoomMapping(mapping: Omit<ChannelRoomMapping, 'id' | 'mappedAt'>): Promise<string> {
    const { data, error } = await supabase
      .from('channel_room_mapping')
      .insert({
        channel_id: mapping.channelId,
        our_room_type_id: mapping.ourRoomTypeId,
        channel_room_code: mapping.channelRoomCode,
        channel_room_name: mapping.channelRoomName,
        quality_score: mapping.qualityScore,
        rate_multiplier: mapping.rateMultiplier,
        inventory_multiplier: mapping.inventoryMultiplier,
        active: mapping.active,
        sync_enabled: mapping.syncEnabled
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async updateChannelRoomMapping(mappingId: string, updates: Partial<ChannelRoomMapping>): Promise<void> {
    const { error } = await supabase
      .from('channel_room_mapping')
      .update({
        channel_room_code: updates.channelRoomCode,
        channel_room_name: updates.channelRoomName,
        quality_score: updates.qualityScore,
        rate_multiplier: updates.rateMultiplier,
        inventory_multiplier: updates.inventoryMultiplier,
        active: updates.active,
        sync_enabled: updates.syncEnabled
      })
      .eq('id', mappingId);
    
    if (error) throw error;
  }
  
  // ============================================
  // INVENTORY SYNCHRONIZATION
  // ============================================
  
  static async syncInventoryToChannel(channelId: string, startDate: string, endDate: string): Promise<InventorySyncResult> {
    const startTime = Date.now();
    const channel = await this.getChannelConnection(channelId);
    if (!channel || !channel.inventorySyncEnabled) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsSuccessful: 0,
        recordsFailed: 0,
        errors: ['Channel not found or inventory sync disabled'],
        duration: 0
      };
    }
    
    const syncId = crypto.randomUUID();
    const errors: string[] = [];
    let recordsProcessed = 0;
    let recordsSuccessful = 0;
    let recordsFailed = 0;
    
    try {
      await supabase.from('inventory_sync_log').insert({
        sync_id: syncId,
        channel_id: channelId,
        sync_type: 'incremental',
        sync_start: new Date().toISOString(),
        status: 'running'
      });
      
      const mappings = await this.getChannelRoomMappings(channelId);
      
      for (const mapping of mappings) {
        const dates = this.getDateRange(startDate, endDate);
        
        for (const date of dates) {
          recordsProcessed++;
          
          try {
            const availability = await this.calculateRoomAvailability(mapping.ourRoomTypeId, date);
            
            const { error: insertError } = await supabase.from('channel_inventory_snapshot')
              .upsert({
                channel_id: channelId,
                room_type_id: mapping.ourRoomTypeId,
                date: date,
                total_rooms: availability.totalRooms,
                available_rooms: availability.availableRooms,
                blocked_rooms: availability.blockedRooms,
                booked_rooms: availability.bookedRooms,
                sync_status: 'pending',
                synced_at: new Date().toISOString()
              }, {
                onConflict: 'channel_id,room_type_id,date'
              });
            
            if (insertError) throw insertError;
            
            if (!channel.testMode) {
              await this.sendInventoryToChannel(channel, mapping, date, availability);
            }
            
            recordsSuccessful++;
            
            await supabase.from('channel_inventory_snapshot')
              .update({ sync_status: 'synced' })
              .eq('channel_id', channelId)
              .eq('room_type_id', mapping.ourRoomTypeId)
              .eq('date', date);
              
          } catch (error) {
            recordsFailed++;
            errors.push(`${mapping.channelRoomCode} on ${date}: ${error}`);
            
            await supabase.from('channel_inventory_snapshot')
              .update({ 
                sync_status: 'failed',
                error_message: String(error)
              })
              .eq('channel_id', channelId)
              .eq('room_type_id', mapping.ourRoomTypeId)
              .eq('date', date);
          }
        }
      }
      
      await supabase.from('inventory_sync_log')
        .update({
          sync_end: new Date().toISOString(),
          records_processed: recordsProcessed,
          records_successful: recordsSuccessful,
          records_failed: recordsFailed,
          status: recordsFailed === 0 ? 'completed' : 'completed_with_errors',
          error_summary: errors.length > 0 ? { errors } : null
        })
        .eq('sync_id', syncId);
      
      await supabase.from('channel_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: recordsFailed === 0 ? 'success' : 'partial_failure',
          last_sync_error: errors.length > 0 ? errors[0] : null
        })
        .eq('id', channelId);
      
    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      
      await supabase.from('inventory_sync_log')
        .update({
          sync_end: new Date().toISOString(),
          status: 'failed',
          error_summary: { errors }
        })
        .eq('sync_id', syncId);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      success: recordsFailed === 0,
      recordsProcessed,
      recordsSuccessful,
      recordsFailed,
      errors,
      duration
    };
  }
  
  // ============================================
  // RATE SYNCHRONIZATION
  // ============================================
  
  static async syncRatesToChannel(channelId: string, startDate: string, endDate: string): Promise<RateSyncResult> {
    const startTime = Date.now();
    const channel = await this.getChannelConnection(channelId);
    if (!channel || !channel.rateParityEnabled) {
      return {
        success: false,
        recordsProcessed: 0,
        parityViolations: 0,
        errors: ['Channel not found or rate sync disabled'],
        duration: 0
      };
    }
    
    const errors: string[] = [];
    let recordsProcessed = 0;
    let parityViolations = 0;
    
    try {
      const mappings = await this.getChannelRoomMappings(channelId);
      const dates = this.getDateRange(startDate, endDate);
      
      for (const mapping of mappings) {
        for (const date of dates) {
          recordsProcessed++;
          
          try {
            const ourRate = await this.getOurRate(mapping.ourRoomTypeId, date);
            const channelRate = ourRate * mapping.rateMultiplier;
            
            if (!channel.testMode) {
              await this.sendRateToChannel(channel, mapping, date, channelRate);
            }
            
            await supabase.from('rate_sync_log').insert({
              channel_id: channelId,
              room_type_id: mapping.ourRoomTypeId,
              date: date,
              our_rate: ourRate,
              channel_rate: channelRate,
              sync_status: 'synced',
              synced_at: new Date().toISOString()
            });
            
            await this.checkRateParity(channelId, mapping.ourRoomTypeId, date, ourRate, channelRate);
            
          } catch (error) {
            errors.push(`${mapping.channelRoomCode} on ${date}: ${error}`);
            
            await supabase.from('rate_sync_log').insert({
              channel_id: channelId,
              room_type_id: mapping.ourRoomTypeId,
              date: date,
              our_rate: 0,
              channel_rate: 0,
              sync_status: 'failed',
              error_message: String(error)
            });
          }
        }
      }
      
      const { count } = await supabase
        .from('rate_parity_monitor')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channelId)
        .eq('parity_violation', true)
        .gte('date', startDate)
        .lte('date', endDate);
      
      parityViolations = count || 0;
      
    } catch (error) {
      errors.push(`Rate sync failed: ${error}`);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      success: errors.length === 0,
      recordsProcessed,
      parityViolations,
      errors,
      duration
    };
  }
  
  // ============================================
  // BOOKING SYNCHRONIZATION
  // ============================================
  
  static async fetchBookingsFromChannel(channelId: string, startDate: string, endDate: string): Promise<BookingSyncResult> {
    const startTime = Date.now();
    const channel = await this.getChannelConnection(channelId);
    if (!channel || !channel.bookingSyncEnabled) {
      return {
        success: false,
        bookingsProcessed: 0,
        bookingsConfirmed: 0,
        bookingsCancelled: 0,
        errors: ['Channel not found or booking sync disabled'],
        duration: 0
      };
    }
    
    const errors: string[] = [];
    let bookingsProcessed = 0;
    let bookingsConfirmed = 0;
    let bookingsCancelled = 0;
    
    try {
      const channelBookings = await this.fetchBookingsFromChannelAPI(channel, startDate, endDate);
      
      for (const channelBooking of channelBookings) {
        bookingsProcessed++;
        
        try {
          const existing = await this.getChannelBookingByChannelId(channelId, channelBooking.channelBookingId);
          
          if (existing) {
            if (channelBooking.bookingStatus === 'cancelled' && existing.bookingStatus !== 'cancelled') {
              await this.cancelBookingInSystem(existing.reservationId);
              bookingsCancelled++;
            }
          } else {
            if (channelBooking.bookingStatus !== 'cancelled') {
              const reservationId = await this.createBookingInSystem(channelBooking);
              channelBooking.reservationId = reservationId;
              bookingsConfirmed++;
            }
          }
          
          await this.saveChannelBooking(channelBooking);
          
        } catch (error) {
          errors.push(`Booking ${channelBooking.channelBookingId}: ${error}`);
        }
      }
      
    } catch (error) {
      errors.push(`Booking sync failed: ${error}`);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      success: errors.length === 0,
      bookingsProcessed,
      bookingsConfirmed,
      bookingsCancelled,
      errors,
      duration
    };
  }
  
  // ============================================
  // BOOKING.COM SPECIFIC IMPLEMENTATIONS
  // ============================================
  
  private static async testBookingComConnection(channel: ChannelConnection): Promise<boolean> {
    try {
      const response = await fetch(`${channel.apiEndpoint}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${channel.credentials.apiKey}`,
          'Content-Type': 'application/xml'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Booking.com connection test failed:', error);
      return false;
    }
  }
  
  private static async sendInventoryToChannel(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    availability: any
  ): Promise<void> {
    if (channel.channelCode === 'BOOKINGCOM') {
      await this.sendInventoryToBookingCom(channel, mapping, date, availability);
    } else if (channel.channelCode === 'EXPEDIA') {
      await this.sendInventoryToExpedia(channel, mapping, date, availability);
    }
  }
  
  private static async sendInventoryToBookingCom(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    availability: any
  ): Promise<void> {
    const xmlPayload = this.buildBookingComInventoryXML(mapping, date, availability);
    
    await fetch(`${channel.apiEndpoint}/rooms/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${channel.credentials.apiKey}`,
        'Content-Type': 'application/xml'
      },
      body: xmlPayload
    });
  }
  
  private static async sendRateToChannel(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    rate: number
  ): Promise<void> {
    if (channel.channelCode === 'BOOKINGCOM') {
      await this.sendRateToBookingCom(channel, mapping, date, rate);
    } else if (channel.channelCode === 'EXPEDIA') {
      await this.sendRateToExpedia(channel, mapping, date, rate);
    }
  }
  
  private static async sendRateToBookingCom(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    rate: number
  ): Promise<void> {
    const xmlPayload = this.buildBookingComRateXML(mapping, date, rate);
    
    await fetch(`${channel.apiEndpoint}/rates/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${channel.credentials.apiKey}`,
        'Content-Type': 'application/xml'
      },
      body: xmlPayload
    });
  }
  
  private static async fetchBookingsFromChannelAPI(
    channel: ChannelConnection,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    if (channel.channelCode === 'BOOKINGCOM') {
      return await this.fetchBookingsFromBookingCom(channel, startDate, endDate);
    } else if (channel.channelCode === 'EXPEDIA') {
      return await this.fetchBookingsFromExpedia(channel, startDate, endDate);
    }
    return [];
  }
  
  private static async fetchBookingsFromBookingCom(
    channel: ChannelConnection,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const xmlPayload = this.buildBookingComBookingQueryXML(startDate, endDate);
    
    const response = await fetch(`${channel.apiEndpoint}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${channel.credentials.apiKey}`,
        'Content-Type': 'application/xml'
      },
      body: xmlPayload
    });
    
    return [];
  }
  
  // ============================================
  // EXPEDIA SPECIFIC IMPLEMENTATIONS
  // ============================================
  
  private static async testExpediaConnection(channel: ChannelConnection): Promise<boolean> {
    try {
      const response = await fetch(`${channel.apiEndpoint}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${channel.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Expedia connection test failed:', error);
      return false;
    }
  }
  
  private static async sendInventoryToExpedia(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    availability: any
  ): Promise<void> {
    const payload = {
      roomTypeCode: mapping.channelRoomCode,
      date: date,
      availability: availability.availableRooms
    };
    
    await fetch(`${channel.apiEndpoint}/inventory`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channel.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }
  
  private static async sendRateToExpedia(
    channel: ChannelConnection,
    mapping: ChannelRoomMapping,
    date: string,
    rate: number
  ): Promise<void> {
    const payload = {
      roomTypeCode: mapping.channelRoomCode,
      date: date,
      rate: rate
    };
    
    await fetch(`${channel.apiEndpoint}/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channel.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }
  
  private static async fetchBookingsFromExpedia(
    channel: ChannelConnection,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const response = await fetch(`${channel.apiEndpoint}/bookings?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${channel.credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.bookings || [];
  }
  
  // ============================================
  // HELPER METHODS
  // ============================================
  
  private static mapChannelConnection(data: any): ChannelConnection {
    return {
      id: data.id,
      channelName: data.channel_name,
      channelCode: data.channel_code,
      channelType: data.channel_type,
      apiEndpoint: data.api_endpoint,
      apiVersion: data.api_version,
      credentials: data.credentials,
      webhookUrl: data.webhook_url,
      syncIntervalMinutes: data.sync_interval_minutes,
      lastSyncAt: data.last_sync_at,
      lastSyncStatus: data.last_sync_status,
      lastSyncError: data.last_sync_error,
      rateParityEnabled: data.rate_parity_enabled,
      rateParityThreshold: data.rate_parity_threshold,
      inventorySyncEnabled: data.inventory_sync_enabled,
      bookingSyncEnabled: data.booking_sync_enabled,
      active: data.active,
      testMode: data.test_mode,
      settings: data.settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  private static mapChannelRoomMapping(data: any): ChannelRoomMapping {
    return {
      id: data.id,
      channelId: data.channel_id,
      ourRoomTypeId: data.our_room_type_id,
      channelRoomCode: data.channel_room_code,
      channelRoomName: data.channel_room_name,
      qualityScore: data.quality_score,
      rateMultiplier: data.rate_multiplier,
      inventoryMultiplier: data.inventory_multiplier,
      active: data.active,
      syncEnabled: data.sync_enabled,
      mappedAt: data.mapped_at
    };
  }
  
  private static getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }
  
  private static async calculateRoomAvailability(roomTypeId: string, date: string): Promise<any> {
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('room_type_id', roomTypeId)
      .not('status', 'in', '("Out of Order", "Out of Service")');
    
    const totalRooms = rooms?.length || 0;
    
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_type_id', roomTypeId)
      .eq('status', 'CheckedIn')
      .lte('check_in_date', date)
      .gte('check_out_date', date);
    
    const bookedRooms = reservations?.length || 0;
    const availableRooms = totalRooms - bookedRooms;
    
    return {
      totalRooms,
      availableRooms,
      blockedRooms: 0,
      bookedRooms
    };
  }
  
  private static async getOurRate(roomTypeId: string, date: string): Promise<number> {
    const { data: pricingHistory } = await supabase
      .from('pricing_history')
      .select('effective_rate')
      .eq('room_type_id', roomTypeId)
      .eq('date', date)
      .single();
    
    if (pricingHistory) {
      return pricingHistory.effective_rate;
    }
    
    const { data: ratePlan } = await supabase
      .from('rate_plans')
      .select('base_rate')
      .eq('room_type_id', roomTypeId)
      .eq('active', true)
      .single();
    
    return ratePlan?.base_rate || 100;
  }
  
  private static async checkRateParity(
    channelId: string,
    roomTypeId: string,
    date: string,
    ourRate: number,
    channelRate: number
  ): Promise<void> {
    const differencePercent = Math.abs((ourRate - channelRate) / channelRate * 100);
    
    const { data: channel } = await supabase
      .from('channel_connections')
      .select('rate_parity_threshold')
      .eq('id', channelId)
      .single();
    
    const threshold = channel?.rate_parity_threshold || 5.0;
    const parityViolation = differencePercent > threshold;
    
    await supabase.from('rate_parity_monitor')
      .upsert({
        channel_id: channelId,
        room_type_id: roomTypeId,
        date: date,
        our_rate: ourRate,
        channel_rate: channelRate,
        difference_percent: differencePercent,
        parity_status: ourRate < channelRate ? 'undercut' : 'overpriced',
        parity_violation: parityViolation,
        detected_at: new Date().toISOString()
      }, {
        onConflict: 'channel_id,room_type_id,date'
      });
  }
  
  private static async getChannelBookingByChannelId(channelId: string, channelBookingId: string): Promise<ChannelBooking | null> {
    const { data, error } = await supabase
      .from('channel_bookings')
      .select('*')
      .eq('channel_id', channelId)
      .eq('channel_booking_id', channelBookingId)
      .single();
    
    if (error || !data) return null;
    return this.mapChannelBooking(data);
  }
  
  private static async createBookingInSystem(channelBooking: any): Promise<string> {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        guest_name: channelBooking.guestName,
        guest_email: channelBooking.guestEmail,
        guest_phone: channelBooking.guestPhone,
        room_type_id: channelBooking.roomTypeId,
        check_in_date: channelBooking.checkInDate,
        check_out_date: channelBooking.checkOutDate,
        adults: channelBooking.adults,
        children: channelBooking.children,
        total_amount: channelBooking.totalAmount,
        status: 'Confirmed',
        channel: channelBooking.channelName,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  private static async cancelBookingInSystem(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'Cancelled' })
      .eq('id', reservationId);
    
    if (error) throw error;
  }
  
  private static async saveChannelBooking(booking: any): Promise<string> {
    const { data, error } = await supabase
      .from('channel_bookings')
      .upsert({
        channel_id: booking.channelId,
        channel_booking_id: booking.channelBookingId,
        channel_confirmation_code: booking.channelConfirmationCode,
        reservation_id: booking.reservationId,
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
        room_type_id: booking.roomTypeId,
        check_in_date: booking.checkInDate,
        check_out_date: booking.checkOutDate,
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        channel_rate: booking.channelRate,
        channel_currency: booking.channelCurrency,
        our_rate: booking.ourRate,
        total_amount: booking.totalAmount,
        commission_percent: booking.commissionPercent,
        commission_amount: booking.commissionAmount,
        net_amount: booking.netAmount,
        booking_status: booking.bookingStatus,
        sync_status: 'synced',
        special_requests: booking.specialRequests,
        channel_raw_data: booking.channelRawData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'channel_id,channel_booking_id'
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  private static mapChannelBooking(data: any): ChannelBooking {
    return {
      id: data.id,
      channelId: data.channel_id,
      channelBookingId: data.channel_booking_id,
      channelConfirmationCode: data.channel_confirmation_code,
      reservationId: data.reservation_id,
      guestName: data.guest_name,
      guestEmail: data.guest_email,
      guestPhone: data.guest_phone,
      roomTypeId: data.room_type_id,
      checkInDate: data.check_in_date,
      checkOutDate: data.check_out_date,
      nights: data.nights,
      adults: data.adults,
      children: data.children,
      channelRate: data.channel_rate,
      channelCurrency: data.channel_currency,
      ourRate: data.our_rate,
      totalAmount: data.total_amount,
      commissionPercent: data.commission_percent,
      commissionAmount: data.commission_amount,
      netAmount: data.net_amount,
      bookingStatus: data.booking_status,
      syncStatus: data.sync_status,
      specialRequests: data.special_requests,
      channelRawData: data.channel_raw_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  // ============================================
  // XML BUILDERS FOR BOOKING.COM
  // ============================================
  
  private static buildBookingComInventoryXML(mapping: ChannelRoomMapping, date: string, availability: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<RoomUpdate xmlns="http://www.booking.com/hotel-v3">
  <RoomStay>
    <RoomType Code="${mapping.channelRoomCode}"/>
    <DateRange Start="${date}" End="${date}"/>
    <Availability Available="${availability.availableRooms}"/>
  </RoomStay>
</RoomUpdate>`;
  }
  
  private static buildBookingComRateXML(mapping: ChannelRoomMapping, date: string, rate: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<RateUpdate xmlns="http://www.booking.com/hotel-v3">
  <RoomStay>
    <RoomType Code="${mapping.channelRoomCode}"/>
    <DateRange Start="${date}" End="${date}"/>
    <Rate Amount="${rate}" Currency="ETB"/>
  </RoomStay>
</RateUpdate>`;
  }
  
  private static buildBookingComBookingQueryXML(startDate: string, endDate: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<BookingRetrieval xmlns="http://www.booking.com/hotel-v3">
  <DateRange Start="${startDate}" End="${endDate}"/>
</BookingRetrieval>`;
  }
  
  // ============================================
  // BATCH OPERATIONS
  // ============================================
  
  static async syncAllChannels(startDate: string, endDate: string): Promise<{
    inventoryResults: Map<string, InventorySyncResult>;
    rateResults: Map<string, RateSyncResult>;
    bookingResults: Map<string, BookingSyncResult>;
  }> {
    const channels = await this.getChannelConnections();
    const inventoryResults = new Map<string, InventorySyncResult>();
    const rateResults = new Map<string, RateSyncResult>();
    const bookingResults = new Map<string, BookingSyncResult>();
    
    for (const channel of channels) {
      if (channel.active) {
        if (channel.inventorySyncEnabled) {
          const inventoryResult = await this.syncInventoryToChannel(channel.id, startDate, endDate);
          inventoryResults.set(channel.id, inventoryResult);
        }
        
        if (channel.rateParityEnabled) {
          const rateResult = await this.syncRatesToChannel(channel.id, startDate, endDate);
          rateResults.set(channel.id, rateResult);
        }
        
        if (channel.bookingSyncEnabled) {
          const bookingResult = await this.fetchBookingsFromChannel(channel.id, startDate, endDate);
          bookingResults.set(channel.id, bookingResult);
        }
      }
    }
    
    return {
      inventoryResults,
      rateResults,
      bookingResults
    };
  }
}
