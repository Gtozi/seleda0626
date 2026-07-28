
export type FinancialDirection = 'Debit' | 'Credit';
export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  subCategory: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Posted' | 'Reversed';
  createdBy: string;
  approvedBy?: string;
  amount?: number;
  lines: JournalLine[];
  attachments?: string[];
  department?: string;
  costCenter?: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface Debtor {
  id: string;
  name: string;
  category: 'Individual' | 'Corporate' | 'Travel Agent' | 'Event' | 'Long-Term';
  balance: number;
  creditLimit: number;
  status: 'Active' | 'Hold' | 'Collection';
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120: number;
  };
}

export interface Creditor {
  id: string;
  name: string;
  balance: number;
  status: 'Active' | 'Pending' | 'Overdue';
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120: number;
  };
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Fixed Deposit';
}

export interface CashShift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  closingCash?: number;
  status: 'Open' | 'Closed' | 'Reconciled';
  transactions: {
    type: 'Collection' | 'Payment' | 'Transfer';
    amount: number;
  }[];
}

export interface Budget {
  id: string;
  department: string;
  year: number;
  month: number;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  cost: number;
  usefulLife: number; // in years
  depreciationMethod: 'Straight Line' | 'Declining Balance';
  accumulatedDepreciation: number;
  bookValue: number;
  location: string;
}

export interface SplitPayment {
  method: string;
  amount: number;
  reference?: string;
  bankAccountId?: string;
  bankAccountName?: string;
}

export interface GlobalSaleTransaction {
  id: string;
  date: string;
  invoiceNumber: string;
  module: 'F&B POS' | 'Restaurant POS' | 'Bar POS' | 'Gift Shop' | 'Front Desk Folio' | 'Other';
  customerName: string;
  items: { productName: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  serviceCharge?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  splitPayments?: SplitPayment[];
  status: 'Completed' | 'Voided' | 'Pending';
  cashierName?: string;
  receiptUrl?: string;
}

export interface ExpenseRequest {
  id: string;
  date: string;
  department: string;
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  status: 'Under Review' | 'Approved' | 'Paid' | 'Rejected';
  requestedBy: string;
  approver?: string;
  attachments: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isGrn?: boolean;
  grnId?: string;
  supplierName?: string;
}
