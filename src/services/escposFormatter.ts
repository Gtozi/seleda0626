/**
 * ESC/POS Receipt Formatter
 * Phase 4 Item 4: Hardware printer integration — formats receipts for thermal printers
 */

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  modifiers?: string[];
}

export interface ReceiptData {
  outletName: string;
  outletAddress?: string;
  outletPhone?: string;
  receiptNumber: string;
  date: string;
  cashier: string;
  tableNumber?: string;
  items: ReceiptLineItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxDetails?: Array<{ name: string; rate: number; amount: number }>;
  serviceCharge?: number;
  total: number;
  paymentMethod: string;
  paymentAmount?: number;
  change?: number;
  currency: string;
  footer?: string[];
  charactersPerLine?: number;
}

const ESC = '\x1b';
const GS = '\x1d';
const INIT = ESC + '@';
const BOLD_ON = ESC + 'E' + '\x01';
const BOLD_OFF = ESC + 'E' + '\x00';
const CENTER = ESC + 'a' + '\x01';
const LEFT = ESC + 'a' + '\x00';
const CUT = GS + 'V' + '\x41' + '\x00';
const FEED = '\n';

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return ' '.repeat(len - str.length) + str;
}

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function formatItemLine(item: ReceiptLineItem, charsPerLine: number): string {
  const name = item.name.substring(0, charsPerLine - 12);
  const qty = `${item.quantity}x`;
  const price = formatAmount(item.total, '');
  const nameLen = charsPerLine - 12;
  return `${padRight(name, nameLen)}${padLeft(qty, 3)} ${padLeft(price, 8)}`;
}

export function formatReceipt(data: ReceiptData): string {
  const cpl = data.charactersPerLine || 48;
  const lines: string[] = [];

  // Initialize printer
  lines.push(INIT);

  // Header
  lines.push(CENTER);
  lines.push(BOLD_ON + data.outletName + BOLD_OFF);
  if (data.outletAddress) lines.push(data.outletAddress);
  if (data.outletPhone) lines.push(`Tel: ${data.outletPhone}`);
  lines.push('='.repeat(cpl));

  // Receipt info
  lines.push(LEFT);
  lines.push(`Receipt: ${data.receiptNumber}`);
  lines.push(`Date: ${data.date}`);
  lines.push(`Cashier: ${data.cashier}`);
  if (data.tableNumber) lines.push(`Table: ${data.tableNumber}`);
  lines.push('-'.repeat(cpl));

  // Items
  for (const item of data.items) {
    lines.push(formatItemLine(item, cpl));
    if (item.modifiers) {
      for (const mod of item.modifiers) {
        lines.push(`  + ${mod.substring(0, cpl - 4)}`);
      }
    }
  }
  lines.push('-'.repeat(cpl));

  // Totals
  const labelLen = Math.floor(cpl * 0.6);
  const valueLen = cpl - labelLen;

  lines.push(`${padRight('Subtotal', labelLen)}${padLeft(formatAmount(data.subtotal, data.currency), valueLen)}`);

  if (data.discountAmount > 0) {
    lines.push(`${padRight(`Discount (${data.discountPercent}%)`, labelLen)}${padLeft('-' + formatAmount(data.discountAmount, data.currency), valueLen)}`);
  }

  if (data.taxDetails) {
    for (const tax of data.taxDetails) {
      lines.push(`${padRight(`${tax.name} (${tax.rate}%)`, labelLen)}${padLeft(formatAmount(tax.amount, data.currency), valueLen)}`);
    }
  } else {
    lines.push(`${padRight('Tax', labelLen)}${padLeft(formatAmount(data.taxAmount, data.currency), valueLen)}`);
  }

  if (data.serviceCharge && data.serviceCharge > 0) {
    lines.push(`${padRight('Service Charge', labelLen)}${padLeft(formatAmount(data.serviceCharge, data.currency), valueLen)}`);
  }

  lines.push('='.repeat(cpl));
  lines.push(BOLD_ON + `${padRight('TOTAL', labelLen)}${padLeft(formatAmount(data.total, data.currency), valueLen)}` + BOLD_OFF);
  lines.push('='.repeat(cpl));

  // Payment
  lines.push(`${padRight(`Payment (${data.paymentMethod})`, labelLen)}${padLeft(formatAmount(data.total, data.currency), valueLen)}`);
  if (data.paymentAmount && data.change !== undefined) {
    lines.push(`${padRight('Tendered', labelLen)}${padLeft(formatAmount(data.paymentAmount, data.currency), valueLen)}`);
    lines.push(`${padRight('Change', labelLen)}${padLeft(formatAmount(data.change, data.currency), valueLen)}`);
  }

  // Footer
  lines.push(CENTER);
  lines.push(FEED);
  if (data.footer) {
    for (const f of data.footer) lines.push(f);
  } else {
    lines.push('Thank you!');
    lines.push('Please come again');
  }
  lines.push(FEED);
  lines.push('Powered by SELEDA ERP');
  lines.push(FEED + FEED);

  // Cut paper
  lines.push(CUT);

  return lines.join('\n');
}

export function formatKitchenTicket(
  orderId: string,
  tableNumber: string,
  items: Array<{ name: string; quantity: number; modifiers?: string[]; specialInstructions?: string }>,
  course: string,
  charactersPerLine: number = 48
): string {
  const lines: string[] = [];

  lines.push(INIT);
  lines.push(CENTER);
  lines.push(BOLD_ON + 'KITCHEN ORDER' + BOLD_OFF);
  lines.push('='.repeat(charactersPerLine));
  lines.push(LEFT);
  lines.push(`Order: ${orderId}`);
  lines.push(`Table: ${tableNumber}`);
  lines.push(`Course: ${course}`);
  lines.push(`Time: ${new Date().toLocaleTimeString()}`);
  lines.push('-'.repeat(charactersPerLine));

  for (const item of items) {
    lines.push(BOLD_ON + `${item.quantity}x ${item.name}` + BOLD_OFF);
    if (item.modifiers) {
      for (const mod of item.modifiers) {
        lines.push(`  - ${mod}`);
      }
    }
    if (item.specialInstructions) {
      lines.push(`  ** ${item.specialInstructions}`);
    }
  }

  lines.push('='.repeat(charactersPerLine));
  lines.push(FEED + FEED);
  lines.push(CUT);

  return lines.join('\n');
}
