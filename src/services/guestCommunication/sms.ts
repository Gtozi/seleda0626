/**
 * SMS Communication Service
 * Handles SMS integration for guest communications via Twilio or other SMS providers
 */

interface SMSConfig {
  provider: 'twilio' | 'aws_sns' | 'nexmo' | 'custom';
  apiKey: string;
  apiSecret: string;
  accountSid?: string;
  phoneNumber: string;
  testMode: boolean;
}

interface SMSMessage {
  to: string;
  from: string;
  body: string;
  scheduledAt?: Date;
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: 'sent' | 'queued' | 'failed' | 'delivered';
}

class SMSService {
  private config: SMSConfig;
  private baseUrl: string;

  constructor(config: SMSConfig) {
    this.config = config;
    
    // Set base URL based on provider
    switch (config.provider) {
      case 'twilio':
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`;
        break;
      case 'aws_sns':
        this.baseUrl = 'https://sns.us-east-1.amazonaws.com';
        break;
      case 'nexmo':
        this.baseUrl = 'https://rest.nexmo.com/sms/json';
        break;
      default:
        this.baseUrl = '';
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(to: string, body: string, scheduledAt?: Date): Promise<MessageResult> {
    try {
      const message: SMSMessage = {
        to: this.formatPhoneNumber(to),
        from: this.config.phoneNumber,
        body,
        scheduledAt
      };

      let response: Response;
      let data: any;

      switch (this.config.provider) {
        case 'twilio':
          response = await this.sendTwilioSMS(message);
          data = await response.json();
          break;
        case 'aws_sns':
          response = await this.sendAWSSMS(message);
          data = await response.json();
          break;
        case 'nexmo':
          response = await this.sendNexmoSMS(message);
          data = await response.json();
          break;
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`);
      }

      if (response.ok) {
        return {
          success: true,
          messageId: data.sid || data.messageId || data.MessageId,
          status: scheduledAt ? 'queued' : 'sent'
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Failed to send SMS',
          status: 'failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      };
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendTwilioSMS(message: SMSMessage): Promise<Response> {
    const auth = btoa(`${this.config.accountSid}:${this.config.apiSecret}`);
    
    const body = new URLSearchParams();
    body.append('To', message.to);
    body.append('From', message.from);
    body.append('Body', message.body);

    if (message.scheduledAt) {
      // Twilio doesn't support scheduled messages directly via API
      // This would need to be handled by a backend job scheduler
    }

    return fetch(`${this.baseUrl}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
  }

  /**
   * Send SMS via AWS SNS
   */
  private async sendAWSSMS(message: SMSMessage): Promise<Response> {
    return fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AmazonSNS_Publish'
      },
      body: JSON.stringify({
        PhoneNumber: message.to,
        Message: message.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      })
    });
  }

  /**
   * Send SMS via Nexmo (Vonage)
   */
  private async sendNexmoSMS(message: SMSMessage): Promise<Response> {
    return fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        text: message.body,
        api_key: this.config.apiKey,
        api_secret: this.config.apiSecret
      })
    });
  }

  /**
   * Send pre-arrival SMS
   */
  async sendPreArrivalSMS(
    phoneNumber: string,
    guestName: string,
    checkInDate: string,
    propertyName: string
  ): Promise<MessageResult> {
    const message = `Welcome to ${propertyName}, ${guestName}! Your check-in is on ${checkInDate}. We'll send your room details soon. Reply with any questions.`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send check-in confirmation SMS
   */
  async sendCheckInConfirmationSMS(
    phoneNumber: string,
    guestName: string,
    roomNumber: string,
    wifiPassword: string
  ): Promise<MessageResult> {
    const message = `${propertyName}: Room ${roomNumber} ready for ${guestName}. WiFi: ${wifiPassword}. Enjoy your stay!`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send check-out reminder SMS
   */
  async sendCheckOutReminderSMS(
    phoneNumber: string,
    guestName: string,
    checkOutTime: string
  ): Promise<MessageResult> {
    const message = `Reminder: Check-out today at ${checkOutTime}. Please leave key at front desk. Thanks for staying with us!`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send OTP/verification code
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string,
    purpose: 'check_in' | 'payment' | 'booking'
  ): Promise<MessageResult> {
    const purposeText = {
      check_in: 'check-in',
      payment: 'payment verification',
      booking: 'booking confirmation'
    };

    const message = `Your ${purposeText[purpose]} code is: ${code}. Valid for 10 minutes. Do not share this code.`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send promotional offer SMS
   */
  async sendPromotionalOffer(
    phoneNumber: string,
    guestName: string,
    offerName: string,
    discountPercent: number,
    expiryDate: string
  ): Promise<MessageResult> {
    const message = `Hi ${guestName}! Exclusive offer: ${offerName} - ${discountPercent}% OFF. Valid until ${expiryDate}. Reply OFFER to claim!`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send urgent notification SMS
   */
  async sendUrgentNotification(
    phoneNumber: string,
    guestName: string,
    notification: string
  ): Promise<MessageResult> {
    const message = `URGENT: ${guestName} - ${notification}. Please contact the front desk immediately.`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    timestamp: string;
    error?: string;
  }> {
    try {
      let response: Response;
      let data: any;

      switch (this.config.provider) {
        case 'twilio':
          response = await fetch(`${this.baseUrl}/Messages/${messageId}.json`, {
            headers: {
              'Authorization': `Basic ${btoa(`${this.config.accountSid}:${this.config.apiSecret}`)}`
            }
          });
          data = await response.json();
          return {
            status: data.status,
            timestamp: data.dateCreated
          };
        default:
          throw new Error(`Status check not supported for provider: ${this.config.provider}`);
      }
    } catch (error) {
      return {
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch send SMS messages
   */
  async batchSendSMS(messages: Array<{ to: string; body: string }>): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: MessageResult[];
  }> {
    const results = await Promise.all(
      messages.map(msg => this.sendSMS(msg.to, msg.body))
    );

    return {
      total: messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Format phone number for SMS sending
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Ethiopia +251)
    if (!cleaned.startsWith('251')) {
      cleaned = '251' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Calculate SMS cost estimate
   */
  calculateCostEstimate(messageCount: number, destination: string): number {
    // Rough cost estimation (would need provider-specific rates)
    const baseCostPerSMS = 0.0075; // $0.0075 per SMS (example rate)
    return messageCount * baseCostPerSMS;
  }

  /**
   * Check SMS credits/balance
   */
  async checkBalance(): Promise<{
    balance: number;
    currency: string;
    error?: string;
  }> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          const response = await fetch(`${this.baseUrl}/Balance.json`, {
            headers: {
              'Authorization': `Basic ${btoa(`${this.config.accountSid}:${this.config.apiSecret}`)}`
            }
          });
          const data = await response.json();
          return {
            balance: parseFloat(data.balance),
            currency: data.account_sid
          };
        default:
          return {
            balance: 0,
            currency: 'USD',
            error: 'Balance check not supported for this provider'
          };
      }
    } catch (error) {
      return {
        balance: 0,
        currency: 'USD',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default SMSService;
export type { SMSConfig, SMSMessage, MessageResult };
