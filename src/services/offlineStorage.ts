/**
 * Offline Storage Service using SQLite
 * Provides local database support for complete offline operation in POS
 */

// Note: In a real implementation, this would use better-sqlite3 or similar SQLite library
// For now, this is a mock implementation that demonstrates the architecture

export interface OfflineTransaction {
  id: string;
  type: 'sale' | 'refund' | 'void';
  timestamp: string;
  data: any;
  synced: boolean;
  syncAttempts: number;
}

export interface OfflineInventoryItem {
  id: string;
  productId: string;
  quantity: number;
  lastSynced: string;
}

class OfflineStorageService {
  private transactions: OfflineTransaction[] = [];
  private inventory: OfflineInventoryItem[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Load data from localStorage
    this.loadFromStorage();
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncPendingTransactions();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  private loadFromStorage() {
    try {
      const storedTransactions = localStorage.getItem('offline_transactions');
      const storedInventory = localStorage.getItem('offline_inventory');
      
      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions);
      }
      if (storedInventory) {
        this.inventory = JSON.parse(storedInventory);
      }
    } catch (error) {
      console.error('Error loading offline storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('offline_transactions', JSON.stringify(this.transactions));
      localStorage.setItem('offline_inventory', JSON.stringify(this.inventory));
    } catch (error) {
      console.error('Error saving to offline storage:', error);
    }
  }

  /**
   * Store a transaction for later sync
   */
  async storeTransaction(transaction: Omit<OfflineTransaction, 'id' | 'synced' | 'syncAttempts'>): Promise<string> {
    const offlineTx: OfflineTransaction = {
      ...transaction,
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      synced: false,
      syncAttempts: 0,
    };

    this.transactions.push(offlineTx);
    this.saveToStorage();
    
    return offlineTx.id;
  }

  /**
   * Get all unsynced transactions
   */
  getUnsyncedTransactions(): OfflineTransaction[] {
    return this.transactions.filter(t => !t.synced);
  }

  /**
   * Mark transaction as synced
   */
  markTransactionSynced(transactionId: string): void {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (tx) {
      tx.synced = true;
      this.saveToStorage();
    }
  }

  /**
   * Increment sync attempt count
   */
  incrementSyncAttempts(transactionId: string): void {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (tx) {
      tx.syncAttempts++;
      this.saveToStorage();
    }
  }

  /**
   * Update cached inventory levels
   */
  updateInventoryCache(productId: string, quantity: number): void {
    const existing = this.inventory.find(i => i.productId === productId);
    if (existing) {
      existing.quantity = quantity;
      existing.lastSynced = new Date().toISOString();
    } else {
      this.inventory.push({
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        productId,
        quantity,
        lastSynced: new Date().toISOString(),
      });
    }
    this.saveToStorage();
  }

  /**
   * Get cached inventory level
   */
  getInventoryCache(productId: string): number | null {
    const item = this.inventory.find(i => i.productId === productId);
    return item ? item.quantity : null;
  }

  /**
   * Validate if sufficient stock is available offline
   */
  validateStockOffline(productId: string, requiredQuantity: number): boolean {
    const cached = this.getInventoryCache(productId);
    return cached !== null && cached >= requiredQuantity;
  }

  /**
   * Sync pending transactions when online
   */
  private async syncPendingTransactions(): Promise<void> {
    if (!this.isOnline) return;

    const unsynced = this.getUnsyncedTransactions();
    
    for (const tx of unsynced) {
      try {
        // In a real implementation, this would call the API
        // await api.post('/api/pos/sync-transaction', tx.data);
        
        this.markTransactionSynced(tx.id);
      } catch (error) {
        console.error(`Failed to sync transaction ${tx.id}:`, error);
        this.incrementSyncAttempts(tx.id);
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Clear synced transactions (cleanup)
   */
  clearSyncedTransactions(): void {
    this.transactions = this.transactions.filter(t => !t.synced);
    this.saveToStorage();
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalTransactions: number;
    unsyncedTransactions: number;
    totalInventoryItems: number;
    isOnline: boolean;
  } {
    return {
      totalTransactions: this.transactions.length,
      unsyncedTransactions: this.getUnsyncedTransactions().length,
      totalInventoryItems: this.inventory.length,
      isOnline: this.isOnline,
    };
  }
}

export const offlineStorageService = new OfflineStorageService();
