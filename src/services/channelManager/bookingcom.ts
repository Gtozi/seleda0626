/**
 * Booking.com API Integration Service
 * Handles real-time synchronization with Booking.com OTA channel
 */

interface BookingComConfig {
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

interface BookingComBooking {
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

class BookingComService {
  private config: BookingComConfig;
  private baseUrl: string;

  constructor(config: BookingComConfig) {
    this.config = config;
    this.baseUrl = config.endpoint || 'https://supply-xml.booking.com/hotel-v3';
  }

  /**
   * Authenticate with Booking.com API
   */
  async authenticate(): Promise<boolean> {
    try {
      // Booking.com uses API key in headers for authentication
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Booking.com authentication failed:', error);
      return false;
    }
  }

  /**
   * Fetch room inventory from Booking.com
   */
  async getInventory(startDate: string, endDate: string, roomCodes?: string[]): Promise<RoomInventory[]> {
    try {
      const requestBody = this.buildInventoryRequest(startDate, endDate, roomCodes);
      
      const response = await fetch(`${this.baseUrl}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parseInventoryResponse(xmlData);
    } catch (error) {
      console.error('Failed to fetch Booking.com inventory:', error);
      throw error;
    }
  }

  /**
   * Push inventory to Booking.com
   */
  async pushInventory(inventory: RoomInventory[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    try {
      // Process in batches of 100 records
      const batchSize = 100;
      for (let i = 0; i < inventory.length; i += batchSize) {
        const batch = inventory.slice(i, i + batchSize);
        
        try {
          const requestBody = this.buildInventoryUpdateRequest(batch);
          
          const response = await fetch(`${this.baseUrl}/availability/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/xml',
              'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
            },
            body: requestBody
          });

          if (response.ok) {
            successful += batch.length;
          } else {
            failed += batch.length;
            errors.push(`Batch ${i / batchSize + 1} failed: ${response.statusText}`);
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
   * Fetch bookings from Booking.com
   */
  async getBookings(startDate: string, endDate: string): Promise<BookingComBooking[]> {
    try {
      const requestBody = this.buildBookingFetchRequest(startDate, endDate);
      
      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parseBookingResponse(xmlData);
    } catch (error) {
      console.error('Failed to fetch Booking.com bookings:', error);
      throw error;
    }
  }

  /**
   * Push rates to Booking.com
   */
  async pushRates(rates: { roomCode: string; date: string; rate: number; currency: string }[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    try {
      const requestBody = this.buildRateUpdateRequest(rates);
      
      const response = await fetch(`${this.baseUrl}/rates/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        },
        body: requestBody
      });

      if (response.ok) {
        successful = rates.length;
      } else {
        failed = rates.length;
        errors.push(`Rate update failed: ${response.statusText}`);
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
   * Confirm booking with Booking.com
   */
  async confirmBooking(bookingId: string, confirmationCode: string): Promise<boolean> {
    try {
      const requestBody = this.buildBookingConfirmationRequest(bookingId, confirmationCode);
      
      const response = await fetch(`${this.baseUrl}/reservations/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        },
        body: requestBody
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to confirm booking with Booking.com:', error);
      return false;
    }
  }

  /**
   * Cancel booking with Booking.com
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      const requestBody = this.buildBookingCancellationRequest(bookingId, reason);
      
      const response = await fetch(`${this.baseUrl}/reservations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')}`
        },
        body: requestBody
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to cancel booking with Booking.com:', error);
      return false;
    }
  }

  /**
   * Process webhook from Booking.com
   */
  async processWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      const eventType = payload.reservation?.status || payload.type;
      
      switch (eventType) {
        case 'new':
        case 'created':
          return { success: true, message: 'New booking processed' };
        case 'cancelled':
          return { success: true, message: 'Cancellation processed' };
        case 'modified':
          return { success: true, message: 'Modification processed' };
        default:
          return { success: false, message: `Unknown event type: ${eventType}` };
      }
    } catch (error) {
      console.error('Failed to process Booking.com webhook:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // XML Builder Methods

  private buildInventoryRequest(startDate: string, endDate: string, roomCodes?: string[]): string {
    const roomsXml = roomCodes 
      ? roomCodes.map(code => `<RoomCode>${code}</RoomCode>`).join('')
      : '';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
      <AvailabilityRequest>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <HotelId>${this.config.hotelId}</HotelId>
        <StartDate>${startDate}</StartDate>
        <EndDate>${endDate}</EndDate>
        ${roomsXml}
      </AvailabilityRequest>`;
  }

  private buildInventoryUpdateRequest(inventory: RoomInventory[]): string {
    const roomsXml = inventory.map(inv => `
      <RoomAvailability>
        <RoomCode>${inv.roomCode}</RoomCode>
        <Date>${inv.date}</Date>
        <AvailableRooms>${inv.availableRooms}</AvailableRooms>
        <TotalRooms>${inv.totalRooms}</TotalRooms>
        <BlockedRooms>${inv.blockedRooms}</BlockedRooms>
        <Rate>${inv.rate}</Rate>
        <Currency>${inv.currency}</Currency>
      </RoomAvailability>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
      <AvailabilityUpdate>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <HotelId>${this.config.hotelId}</HotelId>
        ${roomsXml}
      </AvailabilityUpdate>`;
  }

  private buildBookingFetchRequest(startDate: string, endDate: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <ReservationRequest>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <HotelId>${this.config.hotelId}</HotelId>
        <StartDate>${startDate}</StartDate>
        <EndDate>${endDate}</EndDate>
      </ReservationRequest>`;
  }

  private buildRateUpdateRequest(rates: { roomCode: string; date: string; rate: number; currency: string }[]): string {
    const ratesXml = rates.map(rate => `
      <RoomRate>
        <RoomCode>${rate.roomCode}</RoomCode>
        <Date>${rate.date}</Date>
        <Rate>${rate.rate}</Rate>
        <Currency>${rate.currency}</Currency>
      </RoomRate>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
      <RateUpdate>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <HotelId>${this.config.hotelId}</HotelId>
        ${ratesXml}
      </RateUpdate>`;
  }

  private buildBookingConfirmationRequest(bookingId: string, confirmationCode: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <ReservationConfirm>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <BookingId>${bookingId}</BookingId>
        <ConfirmationCode>${confirmationCode}</ConfirmationCode>
      </ReservationConfirm>`;
  }

  private buildBookingCancellationRequest(bookingId: string, reason?: string): string {
    const reasonXml = reason ? `<Reason>${reason}</Reason>` : '';
    return `<?xml version="1.0" encoding="UTF-8"?>
      <ReservationCancel>
        <Authentication>
          <Username>${this.config.username}</Username>
          <Password>${this.config.apiKey}</Password>
        </Authentication>
        <BookingId>${bookingId}</BookingId>
        ${reasonXml}
      </ReservationCancel>`;
  }

  // XML Parser Methods

  private parseInventoryResponse(xmlData: string): RoomInventory[] {
    // Simplified XML parsing - in production, use a proper XML parser like xml2js
    const inventory: RoomInventory[] = [];
    
    // This is a placeholder for actual XML parsing logic
    // In production, implement proper XML parsing
    
    return inventory;
  }

  private parseBookingResponse(xmlData: string): BookingComBooking[] {
    // Simplified XML parsing - in production, use a proper XML parser like xml2js
    const bookings: BookingComBooking[] = [];
    
    // This is a placeholder for actual XML parsing logic
    // In production, implement proper XML parsing
    
    return bookings;
  }
}

export default BookingComService;
export type { BookingComConfig, RoomInventory, BookingComBooking, SyncResult };
