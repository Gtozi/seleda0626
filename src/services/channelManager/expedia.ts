/**
 * Expedia API Integration Service
 * Handles real-time synchronization with Expedia/EPC OTA channel
 */

interface ExpediaConfig {
  apiKey: string;
  username: string;
  hotelId: string;
  endpoint: string;
  testMode: boolean;
}

interface RoomInventory {
  roomCode: string;
  date: string;
  availableRooms: number;
  totalRooms: number;
  blockedRooms: number;
  rate: number;
  currency: string;
}

interface ExpediaBooking {
  bookingId: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomCode: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  rate: number;
  currency: string;
  totalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netAmount: number;
  bookingStatus: string;
  specialRequests?: string;
}

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  duration: number;
  errors: string[];
}

class ExpediaService {
  private config: ExpediaConfig;
  private baseUrl: string;

  constructor(config: ExpediaConfig) {
    this.config = config;
    this.baseUrl = config.endpoint || 'https://services.expediapartnercentral.com';
  }

  /**
   * Authenticate with Expedia API
   */
  async authenticate(): Promise<boolean> {
    try {
      // Expedia uses OAuth2 or API key based authentication
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.username,
          client_secret: this.config.apiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store access token for future requests
        this.config.apiKey = data.access_token;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Expedia authentication failed:', error);
      return false;
    }
  }

  /**
   * Fetch room inventory from Expedia
   */
  async getInventory(startDate: string, endDate: string, roomCodes?: string[]): Promise<RoomInventory[]> {
    try {
      const requestBody = this.buildInventoryRequest(startDate, endDate, roomCodes);
      
      const response = await fetch(`${this.baseUrl}/api/v1/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Expedia API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseInventoryResponse(data);
    } catch (error) {
      console.error('Failed to fetch Expedia inventory:', error);
      throw error;
    }
  }

  /**
   * Push inventory to Expedia
   */
  async pushInventory(inventory: RoomInventory[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    try {
      // Process in batches of 50 records (Expedia has smaller batch limits)
      const batchSize = 50;
      for (let i = 0; i < inventory.length; i += batchSize) {
        const batch = inventory.slice(i, i + batchSize);
        
        try {
          const requestBody = this.buildInventoryUpdateRequest(batch);
          
          const response = await fetch(`${this.baseUrl}/api/v1/inventory/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: requestBody
          });

          if (response.ok) {
            successful += batch.length;
          } else {
            failed += batch.length;
            const errorData = await response.json();
            errors.push(`Batch ${i / batchSize + 1} failed: ${errorData.message || response.statusText}`);
          }
        } catch (error) {
          failed += batch.length;
          errors.push(`Batch ${i / batchSize + 1} error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: failed === 0,
        recordsProcessed: inventory.length,
        recordsSuccessful: successful,
        recordsFailed: failed,
        duration: Date.now() - startTime,
        errors
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: inventory.length,
        recordsSuccessful: successful,
        recordsFailed: failed + (inventory.length - successful - failed),
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Fetch bookings from Expedia
   */
  async getBookings(startDate: string, endDate: string): Promise<ExpediaBooking[]> {
    try {
      const requestBody = this.buildBookingFetchRequest(startDate, endDate);
      
      const response = await fetch(`${this.baseUrl}/api/v1/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Expedia API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBookingResponse(data);
    } catch (error) {
      console.error('Failed to fetch Expedia bookings:', error);
      throw error;
    }
  }

  /**
   * Push rates to Expedia
   */
  async pushRates(rates: { roomCode: string; date: string; rate: number; currency: string }[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    try {
      const requestBody = this.buildRateUpdateRequest(rates);
      
      const response = await fetch(`${this.baseUrl}/api/v1/rates/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: requestBody
      });

      if (response.ok) {
        successful = rates.length;
      } else {
        failed = rates.length;
        const errorData = await response.json();
        errors.push(`Rate update failed: ${errorData.message || response.statusText}`);
      }

      return {
        success: failed === 0,
        recordsProcessed: rates.length,
        recordsSuccessful: successful,
        recordsFailed: failed,
        duration: Date.now() - startTime,
        errors
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: rates.length,
        recordsSuccessful: successful,
        recordsFailed: failed + (rates.length - successful - failed),
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Confirm booking with Expedia
   */
  async confirmBooking(bookingId: string, confirmationCode: string): Promise<boolean> {
    try {
      const requestBody = this.buildBookingConfirmationRequest(bookingId, confirmationCode);
      
      const response = await fetch(`${this.baseUrl}/api/v1/reservations/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: requestBody
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to confirm booking with Expedia:', error);
      return false;
    }
  }

  /**
   * Cancel booking with Expedia
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      const requestBody = this.buildBookingCancellationRequest(bookingId, reason);
      
      const response = await fetch(`${this.baseUrl}/api/v1/reservations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: requestBody
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to cancel booking with Expedia:', error);
      return false;
    }
  }

  /**
   * Process webhook from Expedia
   */
  async processWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      const eventType = payload.reservation?.status || payload.type;
      
      switch (eventType) {
        case 'new':
        case 'created':
        case 'booked':
          return { success: true, message: 'New booking processed' };
        case 'cancelled':
        case 'canceled':
          return { success: true, message: 'Cancellation processed' };
        case 'modified':
          return { success: true, message: 'Modification processed' };
        default:
          return { success: false, message: `Unknown event type: ${eventType}` };
      }
    } catch (error) {
      console.error('Failed to process Expedia webhook:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get rate parity status from Expedia
   */
  async getRateParityStatus(roomCode: string, date: string): Promise<{
    ourRate: number;
    channelRate: number;
    differencePercent: number;
    inParity: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/rates/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          hotelId: this.config.hotelId,
          roomCode,
          date
        })
      });

      if (!response.ok) {
        throw new Error(`Expedia API error: ${response.statusText}`);
      }

      const data = await response.json();
      const ourRate = data.ourRate || 0;
      const channelRate = data.channelRate || 0;
      const differencePercent = channelRate > 0 ? Math.abs((ourRate - channelRate) / channelRate * 100) : 0;

      return {
        ourRate,
        channelRate,
        differencePercent,
        inParity: differencePercent <= 5.0
      };
    } catch (error) {
      console.error('Failed to get rate parity status from Expedia:', error);
      throw error;
    }
  }

  // JSON Builder Methods (Expedia uses JSON instead of XML)

  private buildInventoryRequest(startDate: string, endDate: string, roomCodes?: string[]): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      startDate,
      endDate,
      roomCodes: roomCodes || []
    });
  }

  private buildInventoryUpdateRequest(inventory: RoomInventory[]): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      inventory: inventory.map(inv => ({
        roomCode: inv.roomCode,
        date: inv.date,
        availableRooms: inv.availableRooms,
        totalRooms: inv.totalRooms,
        blockedRooms: inv.blockedRooms,
        rate: inv.rate,
        currency: inv.currency
      }))
    });
  }

  private buildBookingFetchRequest(startDate: string, endDate: string): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      startDate,
      endDate
    });
  }

  private buildRateUpdateRequest(rates: { roomCode: string; date: string; rate: number; currency: string }[]): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      rates: rates.map(rate => ({
        roomCode: rate.roomCode,
        date: rate.date,
        rate: rate.rate,
        currency: rate.currency
      }))
    });
  }

  private buildBookingConfirmationRequest(bookingId: string, confirmationCode: string): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      bookingId,
      confirmationCode
    });
  }

  private buildBookingCancellationRequest(bookingId: string, reason?: string): string {
    return JSON.stringify({
      hotelId: this.config.hotelId,
      bookingId,
      reason: reason || 'Cancelled by property'
    });
  }

  // JSON Parser Methods

  private parseInventoryResponse(data: any): RoomInventory[] {
    if (!data.inventory || !Array.isArray(data.inventory)) {
      return [];
    }

    return data.inventory.map((item: any) => ({
      roomCode: item.roomCode,
      date: item.date,
      availableRooms: item.availableRooms || 0,
      totalRooms: item.totalRooms || 0,
      blockedRooms: item.blockedRooms || 0,
      rate: item.rate || 0,
      currency: item.currency || 'USD'
    }));
  }

  private parseBookingResponse(data: any): ExpediaBooking[] {
    if (!data.reservations || !Array.isArray(data.reservations)) {
      return [];
    }

    return data.reservations.map((item: any) => ({
      bookingId: item.bookingId || item.id,
      confirmationCode: item.confirmationCode,
      guestName: item.guestName,
      guestEmail: item.guestEmail,
      guestPhone: item.guestPhone,
      roomCode: item.roomCode,
      checkInDate: item.checkInDate,
      checkOutDate: item.checkOutDate,
      nights: item.nights,
      adults: item.adults || 1,
      children: item.children || 0,
      rate: item.rate || 0,
      currency: item.currency || 'USD',
      totalAmount: item.totalAmount || 0,
      commissionPercent: item.commissionPercent || 0,
      commissionAmount: item.commissionAmount || 0,
      netAmount: item.netAmount || 0,
      bookingStatus: item.bookingStatus || item.status,
      specialRequests: item.specialRequests
    }));
  }
}

export default ExpediaService;
export type { ExpediaConfig, RoomInventory, ExpediaBooking, SyncResult };
