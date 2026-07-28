async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export interface Vendor {
  id: string;
  name: string;
  contact?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  withholdingRate?: number;
  category?: string;
  status: string;
  balance: number;
}

export interface BillLine {
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Bill {
  id: string;
  vendorId: string;
  vendorName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  category?: string;
  amount: number;
  taxAmount: number;
  withholdingAmount: number;
  netPayable: number;
  amountDue: number;
  status: string;
  lines: BillLine[];
  createdAt?: string;
}

export interface Payment {
  id: string;
  billId: string;
  vendorName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  status: string;
}

export function mapVendorFromDb(row: any): Vendor {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    taxId: row.tax_id,
    withholdingRate: row.withholding_rate,
    category: row.category,
    status: row.status,
    balance: Number(row.balance) || 0,
  };
}

export function mapBillFromDb(row: any): Bill {
  const vendor = row.vendors || {};
  return {
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: vendor.name || row.vendor_name,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    category: row.category,
    amount: Number(row.amount) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    withholdingAmount: Number(row.withholding_amount) || 0,
    netPayable: Number(row.net_payable) || 0,
    amountDue: Number(row.amount_due) || 0,
    status: row.status,
    lines: Array.isArray(row.lines) ? row.lines : [],
  };
}

export function mapPaymentFromDb(row: any): Payment {
  const vendor = row.vendors || {};
  return {
    id: row.id,
    billId: row.bill_id,
    vendorName: vendor.name || row.vendor_name,
    amount: Number(row.amount) || 0,
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    reference: row.reference,
    status: row.status,
  };
}

export async function fetchVendors(): Promise<Vendor[]> {
  const rows = await api<any[]>('/api/accounts-payable/vendors');
  return rows.map(mapVendorFromDb);
}

export async function createVendor(vendor: Omit<Vendor, 'id' | 'balance' | 'status'>): Promise<Vendor> {
  const row = await api<any>('/api/accounts-payable/vendors', {
    method: 'POST',
    body: JSON.stringify(vendor),
  });
  return mapVendorFromDb(row);
}

export async function fetchBills(status?: string): Promise<Bill[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const rows = await api<any[]>(`/api/accounts-payable/bills${qs}`);
  return rows.map(mapBillFromDb);
}

export async function createBill(bill: Omit<Bill, 'id' | 'amountDue' | 'netPayable' | 'status' | 'vendorName'>): Promise<Bill> {
  const row = await api<any>('/api/accounts-payable/bills', {
    method: 'POST',
    body: JSON.stringify(bill),
  });
  return mapBillFromDb(row);
}

export async function payBill(billId: string, payment: Omit<Payment, 'id' | 'billId' | 'vendorName' | 'status'>): Promise<any> {
  return api<any>(`/api/accounts-payable/bills/${billId}/pay`, {
    method: 'POST',
    body: JSON.stringify(payment),
  });
}

export async function fetchPayments(): Promise<Payment[]> {
  const rows = await api<any[]>('/api/accounts-payable/payments');
  return rows.map(mapPaymentFromDb);
}
