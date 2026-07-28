/**
 * WhatsApp Communication Service
 * Handles WhatsApp Business API integration for guest communications
 */

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
  testMode: boolean;
}

interface WhatsAppMessage {
  to: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
}

interface WhatsAppTemplate {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: WhatsAppTemplateComponent[];
}

interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  buttons?: WhatsAppButton[];
}

interface WhatsAppButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: 'sent' | 'queued' | 'failed';
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Send text message via WhatsApp
   */
  async sendTextMessage(phoneNumber: string, message: string): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: this.formatPhoneNumber(phoneNumber),
            type: 'text',
            text: {
              body: message
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages[0]?.id,
          status: 'sent'
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send message',
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
   * Send template message via WhatsApp
   */
  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    language: string = 'en',
    components?: any[]
  ): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: this.formatPhoneNumber(phoneNumber),
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: language
              },
              components: components || []
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages[0]?.id,
          status: 'sent'
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send template message',
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
   * Send media message via WhatsApp
   */
  async sendMediaMessage(
    phoneNumber: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    caption?: string
  ): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: this.formatPhoneNumber(phoneNumber),
            type: mediaType,
            [mediaType]: {
              link: mediaUrl,
              caption: caption || ''
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages[0]?.id,
          status: 'sent'
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send media message',
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
   * Send pre-arrival welcome message
   */
  async sendPreArrivalMessage(
    phoneNumber: string,
    guestName: string,
    checkInDate: string,
    propertyName: string
  ): Promise<MessageResult> {
    const message = `Dear ${guestName},\n\nWelcome to ${propertyName}! We're excited to host you starting ${checkInDate}.\n\nYour room is being prepared and we'll send you your room number and check-in details soon.\n\nIf you have any questions or special requests, feel free to reply to this message.\n\nSee you soon!`;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send check-in confirmation with room number
   */
  async sendCheckInConfirmation(
    phoneNumber: string,
    guestName: string,
    roomNumber: string,
    wifiPassword: string
  ): Promise<MessageResult> {
    const message = `Dear ${guestName},\n\nYour room is ready! 🎉\n\n📍 Room: ${roomNumber}\n📶 WiFi: ${wifiPassword}\n\nEnjoy your stay!`;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send check-out reminder
   */
  async sendCheckOutReminder(
    phoneNumber: string,
    guestName: string,
    checkOutTime: string
  ): Promise<MessageResult> {
    const message = `Dear ${guestName},\n\nJust a reminder that check-out is today at ${checkOutTime}.\n\nPlease leave your key card at the front desk. We hope you enjoyed your stay!`;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send upsell offer
   */
  async sendUpsellOffer(
    phoneNumber: string,
    guestName: string,
    offerName: string,
    offerPrice: number,
    offerDescription: string
  ): Promise<MessageResult> {
    const message = `Dear ${guestName},\n\nSpecial offer just for you! ✨\n\n${offerName}\n${offerDescription}\n\nSpecial price: $${offerPrice}\n\nReply 'YES' to accept this offer or contact us for more details.`;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    timestamp: string;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          status: data.status,
          timestamp: data.timestamp
        };
      } else {
        return {
          status: 'failed',
          timestamp: new Date().toISOString(),
          error: data.error?.message
        };
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
   * Verify webhook signature
   */
  verifyWebhookSignature(
    signature: string,
    payload: string
  ): boolean {
    // In production, implement proper HMAC verification
    // This is a placeholder for security implementation
    return true;
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(payload: any): Promise<{
    success: boolean;
    messageType: string;
    from: string;
    message?: string;
    error?: string;
  }> {
    try {
      if (!payload.entry || !payload.entry[0]?.changes) {
        return {
          success: false,
          messageType: 'unknown',
          from: '',
          error: 'Invalid webhook payload'
        };
      }

      const change = payload.entry[0].changes[0];
      
      if (change.field === 'messages') {
        const message = change.value.messages[0];
        return {
          success: true,
          messageType: message.type,
          from: message.from,
          message: message.text?.body
        };
      }

      return {
        success: false,
        messageType: 'unknown',
        from: '',
        error: 'Unsupported webhook event'
      };
    } catch (error) {
      return {
        success: false,
        messageType: 'unknown',
        from: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Format phone number for WhatsApp API
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
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}

export default WhatsAppService;
export type { WhatsAppConfig, WhatsAppMessage, WhatsAppTemplate, MessageResult };
