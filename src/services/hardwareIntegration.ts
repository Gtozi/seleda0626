/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Hardware Integration Layer
 * Provides abstraction layer for POS hardware integration
 * Supports KDS, receipt printers, payment terminals, barcode scanners, etc.
 */

// Hardware device types and interfaces
export type HardwareDeviceType = 'kds' | 'printer' | 'payment_terminal' | 'scanner' | 'display';
export type ConnectionType = 'network' | 'usb' | 'bluetooth';
export type DeviceStatus = 'online' | 'offline' | 'error';

export interface HardwareDevice {
  deviceId: string;
  deviceType: HardwareDeviceType;
  name: string;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  status: DeviceStatus;
  lastHeartbeat: string;
  capabilities: string[];
}

// KDS (Kitchen Display System) interfaces
export interface KDSMessage {
  messageId: string;
  orderId: string;
  tableNumber: string;
  items: KDSItem[];
  course: 'appetizer' | 'main' | 'dessert';
  priority: 'normal' | 'urgent' | 'vip';
  estimatedTime: number;
  sentAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

export interface KDSItem {
  menuItemId: string;
  name: string;
  quantity: number;
  modifiers: string[];
  specialInstructions?: string;
  station?: string;
}

export interface KDSStation {
  stationId: string;
  name: string;
  type: 'hot' | 'cold' | 'bar' | 'dessert';
  displayDeviceId: string;
  assignedCategories: string[];
}

// Printer interfaces
export interface PrintJob {
  jobId: string;
  printerId: string;
  content: string;
  copies: number;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  queuedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface PrinterConfig {
  printerId: string;
  name: string;
  type: 'thermal' | 'inkjet' | 'laser';
  connectionType: ConnectionType;
  ipAddress?: string;
  usbPort?: string;
  paperWidth: number; // mm
  charactersPerLine: number;
  supportsGraphics: boolean;
}

// Payment terminal interfaces
export interface PaymentTerminalConfig {
  terminalId: string;
  name: string;
  model: string;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  supportsEMV: boolean;
  supportsNFC: boolean;
  supportsContactless: boolean;
}

export interface PaymentRequest {
  terminalId: string;
  amount: number;
  currency: string;
  transactionId: string;
  cardType?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  authorizationCode?: string;
  cardType?: string;
  maskedCardNumber?: string;
  errorMessage?: string;
}

// Barcode scanner interfaces
export interface ScannerConfig {
  scannerId: string;
  name: string;
  connectionType: ConnectionType;
  usbPort?: string;
  barcodeTypes: string[];
}

export interface ScanResult {
  scannerId: string;
  barcode: string;
  barcodeType: string;
  timestamp: string;
}

// Customer display interfaces
export interface CustomerDisplayConfig {
  displayId: string;
  name: string;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  lines: number;
  charactersPerLine: number;
  supportsGraphics: boolean;
}

export interface DisplayContent {
  displayId: string;
  line1?: string;
  line2?: string;
  showTotal?: boolean;
  totalAmount?: number;
  currency?: string;
}

// Hardware manager class
class HardwareIntegrationManager {
  private devices: Map<string, HardwareDevice> = new Map();
  private printers: Map<string, PrinterConfig> = new Map();
  private paymentTerminals: Map<string, PaymentTerminalConfig> = new Map();
  private scanners: Map<string, ScannerConfig> = new Map();
  private displays: Map<string, CustomerDisplayConfig> = new Map();
  private kdsStations: Map<string, KDSStation> = new Map();

  /**
   * Register a hardware device
   */
  registerDevice(device: HardwareDevice): void {
    this.devices.set(device.deviceId, device);
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): HardwareDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get all devices by type
   */
  getDevicesByType(deviceType: HardwareDeviceType): HardwareDevice[] {
    return Array.from(this.devices.values()).filter(d => d.deviceType === deviceType);
  }

  /**
   * Update device status
   */
  updateDeviceStatus(deviceId: string, status: DeviceStatus): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      device.lastHeartbeat = new Date().toISOString();
    }
  }

  /**
   * Check device health
   */
  async checkDeviceHealth(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    try {
      // Simulate health check - in real implementation, this would ping the device
      const response = await fetch(`/api/hardware/${deviceId}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const isHealthy = response.ok;
      
      this.updateDeviceStatus(deviceId, isHealthy ? 'online' : 'error');
      return isHealthy;
    } catch (error) {
      this.updateDeviceStatus(deviceId, 'offline');
      return false;
    }
  }

  // KDS Methods
  registerKDSStation(station: KDSStation): void {
    this.kdsStations.set(station.stationId, station);
  }

  async sendToKDS(message: KDSMessage, stationId: string): Promise<boolean> {
    const station = this.kdsStations.get(stationId);
    if (!station) {
      console.error(`KDS station ${stationId} not found`);
      return false;
    }

    try {
      const response = await fetch('/api/hardware/kds/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          message,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send to KDS:', error);
      return false;
    }
  }

  async acknowledgeKDSMessage(messageId: string, stationId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/hardware/kds/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, stationId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to acknowledge KDS message:', error);
      return false;
    }
  }

  async completeKDSMessage(messageId: string, stationId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/hardware/kds/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, stationId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to complete KDS message:', error);
      return false;
    }
  }

  // Printer Methods
  registerPrinter(printer: PrinterConfig): void {
    this.printers.set(printer.printerId, printer);
    this.registerDevice({
      deviceId: printer.printerId,
      deviceType: 'printer',
      name: printer.name,
      connectionType: printer.connectionType,
      ipAddress: printer.ipAddress,
      status: 'offline',
      lastHeartbeat: new Date().toISOString(),
      capabilities: printer.supportsGraphics ? ['graphics', 'text'] : ['text'],
    });
  }

  async printReceipt(printerId: string, content: string, copies: number = 1): Promise<PrintJob> {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const job: PrintJob = {
      jobId: `job_${Date.now()}`,
      printerId,
      content,
      copies,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/hardware/printer/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerId,
          content,
          copies,
        }),
      });

      if (response.ok) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      } else {
        job.status = 'failed';
        job.errorMessage = 'Print request failed';
      }
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = String(error);
    }

    return job;
  }

  async printKitchenTicket(
    printerId: string,
    orderId: string,
    tableNumber: string,
    items: any[],
    course: string
  ): Promise<boolean> {
    const printer = this.printers.get(printerId);
    if (!printer) {
      console.error(`Printer ${printerId} not found`);
      return false;
    }

    // Format kitchen ticket
    const ticket = this.formatKitchenTicket(orderId, tableNumber, items, course);
    return await this.printReceipt(printerId, ticket, 1).then(job => job.status === 'completed');
  }

  private formatKitchenTicket(orderId: string, tableNumber: string, items: any[], course: string): string {
    const lines = [
      'KITCHEN TICKET',
      '================',
      `Order: ${orderId}`,
      `Table: ${tableNumber}`,
      `Course: ${course}`,
      `Time: ${new Date().toLocaleTimeString()}`,
      '----------------',
      ...items.map(item => 
        `${item.quantity}x ${item.name}${item.specialInstructions ? ` (${item.specialInstructions})` : ''}`
      ),
      '================',
    ];
    return lines.join('\n');
  }

  // Payment Terminal Methods
  registerPaymentTerminal(terminal: PaymentTerminalConfig): void {
    this.paymentTerminals.set(terminal.terminalId, terminal);
    this.registerDevice({
      deviceId: terminal.terminalId,
      deviceType: 'payment_terminal',
      name: terminal.name,
      connectionType: terminal.connectionType,
      ipAddress: terminal.ipAddress,
      port: terminal.port,
      status: 'offline',
      lastHeartbeat: new Date().toISOString(),
      capabilities: [
        ...(terminal.supportsEMV ? ['emv'] : []),
        ...(terminal.supportsNFC ? ['nfc'] : []),
        ...(terminal.supportsContactless ? ['contactless'] : []),
      ],
    });
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const terminal = this.paymentTerminals.get(request.terminalId);
    if (!terminal) {
      return {
        success: false,
        transactionId: request.transactionId,
        errorMessage: `Terminal ${request.terminalId} not found`,
      };
    }

    try {
      const response = await fetch('/api/hardware/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        return {
          success: false,
          transactionId: request.transactionId,
          errorMessage: error.message || 'Payment processing failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        transactionId: request.transactionId,
        errorMessage: String(error),
      };
    }
  }

  // Scanner Methods
  registerScanner(scanner: ScannerConfig): void {
    this.scanners.set(scanner.scannerId, scanner);
    this.registerDevice({
      deviceId: scanner.scannerId,
      deviceType: 'scanner',
      name: scanner.name,
      connectionType: scanner.connectionType,
      status: 'offline',
      lastHeartbeat: new Date().toISOString(),
      capabilities: scanner.barcodeTypes,
    });
  }

  // Customer Display Methods
  registerCustomerDisplay(display: CustomerDisplayConfig): void {
    this.displays.set(display.displayId, display);
    this.registerDevice({
      deviceId: display.displayId,
      deviceType: 'display',
      name: display.name,
      connectionType: display.connectionType,
      ipAddress: display.ipAddress,
      port: display.port,
      status: 'offline',
      lastHeartbeat: new Date().toISOString(),
      capabilities: display.supportsGraphics ? ['graphics', 'text'] : ['text'],
    });
  }

  async updateDisplay(content: DisplayContent): Promise<boolean> {
    const display = this.displays.get(content.displayId);
    if (!display) {
      console.error(`Display ${content.displayId} not found`);
      return false;
    }

    try {
      const response = await fetch('/api/hardware/display/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update display:', error);
      return false;
    }
  }

  async clearDisplay(displayId: string): Promise<boolean> {
    return await this.updateDisplay({ displayId });
  }

  /**
   * Get all devices status
   */
  getAllDevicesStatus(): HardwareDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get devices by status
   */
  getDevicesByStatus(status: DeviceStatus): HardwareDevice[] {
    return Array.from(this.devices.values()).filter(d => d.status === status);
  }
}

// Export singleton instance
export const hardwareIntegration = new HardwareIntegrationManager();
