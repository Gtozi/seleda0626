/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ERPStats } from '../types/erp';
import { JournalEntry, GlobalSaleTransaction, ChartOfAccount, ExpenseRequest } from '../types/finance';
import { initialSalesTransactions, initialExpenseRequests } from './initialState';
import { useSystem } from './SystemContext';
import { useReservation } from './ReservationContext';

export interface FinanceContextType {
  journals: JournalEntry[];
  salesTransactions: GlobalSaleTransaction[];
  chartOfAccounts: ChartOfAccount[];
  expenseRequests: ExpenseRequest[];
  stats: ERPStats;
  
  addSaleTransaction: (transaction: Omit<GlobalSaleTransaction, 'id'>) => string;
  updateSaleTransactionStatus: (id: string, status: 'Completed' | 'Voided' | 'Pending') => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => string;
  addAccount: (account: ChartOfAccount) => void;
  deleteAccount: (code: string) => void;
  postAutoJournal: (params: {
    reference: string;
    description: string;
    amount: number;
    debitAccount: string;
    creditAccount: string;
    department?: string;
  }) => void;
  addExpenseRequest: (request: Omit<ExpenseRequest, 'id'>) => string;
  updateExpenseRequestStatus: (id: string, status: ExpenseRequest['status']) => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentSystemDate, addNotification, logAudit } = useSystem();
  const { rooms, reservations } = useReservation();

  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([
    { code: '1010', name: 'Cash at Hand', category: 'Asset', description: 'Physical cash in safe and registers', balance: 0 },
    { code: '1100', name: 'Accounts Receivable', category: 'Asset', description: 'Owed by guests/corporate', balance: 0 },
    { code: '4010', name: 'Room Revenue', category: 'Revenue', description: 'Direct accommodation sales', balance: 0 },
    { code: '4020', name: 'F&B Revenue', category: 'Revenue', description: 'Restaurant & Bar sales', balance: 0 },
  ]);
  
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>(initialExpenseRequests);
  const [salesTransactions, setSalesTransactions] = useState<GlobalSaleTransaction[]>(initialSalesTransactions);
  
  const [stats, setStats] = useState<ERPStats>({
    occupancyRate: 0, adr: 0, revpar: 0, totalRevenue: 0,
    arrivalsTodayCount: 0, departuresTodayCount: 0,
    occupiedRoomsCount: 0, dirtyRoomsCount: 0, outOfOrderCount: 0
  });

  const calculateStats = useCallback(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied Clean' || r.status === 'Occupied Dirty').length;
    const dirty = rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Occupied Dirty').length;
    const ooo = rooms.filter(r => r.status === 'Out of Order').length;
    
    const currentCheckedIn = reservations.filter(r => r.status === 'CheckedIn');
    const adr = currentCheckedIn.length > 0 ? currentCheckedIn.reduce((sum, r) => sum + r.rate, 0) / currentCheckedIn.length : 0;
    const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
    const revpar = (adr * occupancyRate) / 100;
    const arrivals = reservations.filter(r => r.status === 'Confirmed' && r.checkInDate === currentSystemDate).length;
    const departures = reservations.filter(r => r.status === 'CheckedIn' && r.checkOutDate === currentSystemDate).length;

    setStats(prev => ({
      ...prev,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      adr: Math.round(adr),
      revpar: Math.round(revpar),
      occupiedRoomsCount: occupied,
      dirtyRoomsCount: dirty,
      outOfOrderCount: ooo,
      arrivalsTodayCount: arrivals,
      departuresTodayCount: departures
    }));
  }, [rooms, reservations, currentSystemDate]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const refreshData = useCallback(async () => {
    calculateStats();
  }, [calculateStats]);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>): string => {
    const id = `JV-${Date.now()}`;
    const newEntry = { ...entry, id };
    setJournals(prev => [newEntry, ...prev]);
    
    if (entry.status === 'Posted') {
      setChartOfAccounts(prevCOA => prevCOA.map(acc => {
        let newBalance = acc.balance;
        entry.lines.filter(l => l.accountId === acc.code).forEach(line => {
          const isNormalDebit = acc.category === 'Asset' || acc.category === 'Expense';
          newBalance += isNormalDebit ? (line.debit - line.credit) : (line.credit - line.debit);
        });
        return { ...acc, balance: newBalance };
      }));
    }
    return id;
  }, []);

  const addAccount = useCallback((account: ChartOfAccount) => {
    setChartOfAccounts(prev => [...prev, account]);
  }, []);

  const deleteAccount = useCallback((code: string) => {
    setChartOfAccounts(prev => prev.filter(a => a.code !== code));
  }, []);

  const postAutoJournal = useCallback((params: {
    reference: string;
    description: string;
    amount: number;
    debitAccount: string;
    creditAccount: string;
    department?: string;
  }) => {
    const debitAcc = chartOfAccounts.find(a => a.code === params.debitAccount);
    const creditAcc = chartOfAccounts.find(a => a.code === params.creditAccount);
    const journal: Omit<JournalEntry, 'id'> = {
      date: currentSystemDate, reference: params.reference, description: params.description,
      status: 'Posted', createdBy: 'SYSTEM', amount: params.amount, department: params.department,
      lines: [
        { id: `L1-${Date.now()}`, accountId: params.debitAccount, accountName: debitAcc?.name || '?', description: params.description, debit: params.amount, credit: 0 },
        { id: `L2-${Date.now()}`, accountId: params.creditAccount, accountName: creditAcc?.name || '?', description: params.description, debit: 0, credit: params.amount }
      ]
    };
    addJournalEntry(journal);
    logAudit(`Auto Journal: ${params.description}`);
  }, [chartOfAccounts, currentSystemDate, addJournalEntry, logAudit]);

  const addSaleTransaction = useCallback((transaction: Omit<GlobalSaleTransaction, 'id'>) => {
    const id = `STX-${Date.now()}`;
    setSalesTransactions(prev => [{ ...transaction, id }, ...prev]);
    postAutoJournal({
      reference: transaction.invoiceNumber,
      description: `Sales (${transaction.module})`,
      amount: transaction.total,
      debitAccount: transaction.paymentMethod === 'Room Charge' ? '1100' : '1010',
      creditAccount: transaction.module === 'F&B POS' ? '4020' : '4030'
    });
    return id;
  }, [postAutoJournal]);

  const updateSaleTransactionStatus = useCallback((id: string, status: 'Completed' | 'Voided' | 'Pending') => {
    setSalesTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const addExpenseRequest = useCallback((request: Omit<ExpenseRequest, 'id'>) => {
    const id = `EXP-${Date.now()}`;
    setExpenseRequests(prev => [...prev, { ...request, id }]);
    addNotification(`New expense submitted.`, 'success', 'Finance');
    return id;
  }, [addNotification]);

  const updateExpenseRequestStatus = useCallback((id: string, status: ExpenseRequest['status']) => {
    setExpenseRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  }, []);

  const value = {
    journals, salesTransactions, chartOfAccounts, expenseRequests, stats,
    addSaleTransaction, updateSaleTransactionStatus, addJournalEntry,
    addAccount, deleteAccount, postAutoJournal, addExpenseRequest, updateExpenseRequestStatus,
    refreshData
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
