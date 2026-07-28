/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Offline POS Database Service
 * Provides SQLite local database wrapper for POS modules to enable offline operations
 * Handles data caching, sync queue management, and conflict resolution
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

// Types for offline POS operations
export interface OfflinePOSOrder {
  id: string;
  timestamp: string;
  outletId: string;
  orderData: any; // Order object matching server schema
  lines: any[]; // Order lines
  syncStatus: 'pending' | 'synced' | 'conflict' | 'failed';
  localReceipt: string;
  serverOrderId?: string;
  errorMessage?: string;
  syncAttempts: number;
  lastSyncAttempt?: string;
}

export interface OfflineInventoryCache {
  ingredientId: string;
  cachedQuantity: number;
  lastSyncAt: string;
  version: number;
  isDirty: boolean;
}

export interface SyncConflict {
  conflictId: string;
  conflictType: 'duplicate_order' | 'inventory_mismatch' | 'payment_mismatch' | 'entity_version_conflict';
  entityType?: 'order' | 'payment' | 'stock_transaction' | 'wastage_log';
  localOperationId: string;
  localPayload: any;
  serverEntityId?: string;
  serverPayload?: any;
  resolutionStrategy: 'local_wins' | 'server_wins' | 'manual_merge' | 'ignore';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

// IndexedDB schema definition
interface OfflinePOSDatabase extends DBSchema {
  orders: {
    key: string;
    value: OfflinePOSOrder;
    indexes: {
      'by-sync-status': string;
      'by-outlet': string;
      'by-timestamp': string;
    };
  };
  inventory: {
    key: string;
    value: OfflineInventoryCache;
    indexes: {
      'by-dirty': number;
    };
  };
  conflicts: {
    key: string;
    value: SyncConflict;
    indexes: {
      'by-resolved': number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      operationType: 'order_create' | 'order_update' | 'order_void' | 'payment' | 'stock_transaction' | 'wastage_log';
      entityType: 'order' | 'payment' | 'stock_transaction' | 'wastage_log';
      entityId: string;
      payload: any;
      syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
      syncAttempts: number;
      lastSyncAttempt?: string;
      createdAt: string;
    };
    indexes: {
      'by-status': string;
      'by-created': string;
    };
  };
}

class OfflinePOSDatabaseService {
  private db: IDBPDatabase<OfflinePOSDatabase> | null = null;
  private clientId: string;
  private dbName = 'SELEDA_OfflinePOS';
  private dbVersion = 1;

  constructor() {
    // Generate or retrieve client ID for this device
    this.clientId = this.getOrCreateClientId();
  }

  private getOrCreateClientId(): string {
    let clientId = localStorage.getItem('seleda_pos_client_id');
    if (!clientId) {
      clientId = `pos_${uuidv4()}`;
      localStorage.setItem('seleda_pos_client_id', clientId);
    }
    return clientId;
  }

  public getClientId(): string {
    return this.clientId;
  }

  /**
   * Initialize the offline database
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<OfflinePOSDatabase>(this.dbName, this.dbVersion, {
        upgrade(db: IDBPDatabase<OfflinePOSDatabase>) {
          // Orders store
          if (!db.objectStoreNames.contains('orders')) {
            const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
            orderStore.createIndex('by-sync-status', 'syncStatus');
            orderStore.createIndex('by-outlet', 'outletId');
            orderStore.createIndex('by-timestamp', 'timestamp');
          }

          // Inventory cache store
          if (!db.objectStoreNames.contains('inventory')) {
            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'ingredientId' });
            inventoryStore.createIndex('by-dirty', 'isDirty');
          }

          // Conflicts store
          if (!db.objectStoreNames.contains('conflicts')) {
            const conflictStore = db.createObjectStore('conflicts', { keyPath: 'conflictId' });
            conflictStore.createIndex('by-resolved', 'resolved');
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('by-status', 'syncStatus');
            syncStore.createIndex('by-created', 'createdAt');
          }
        },
      });
      console.log('Offline POS database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline POS database:', error);
      throw error;
    }
  }

  /**
   * Store an order offline
   */
  async storeOfflineOrder(order: any, lines: any[]): Promise<string> {
    if (!this.db) await this.initialize();

    const offlineOrder: OfflinePOSOrder = {
      id: order.id || uuidv4(),
      timestamp: new Date().toISOString(),
      outletId: order.outlet_id,
      orderData: order,
      lines: lines,
      syncStatus: 'pending',
      localReceipt: this.generateLocalReceipt(order, lines),
      syncAttempts: 0,
    };

    await this.db!.put('orders', offlineOrder);

    // Add to sync queue
    await this.addToSyncQueue('order_create', 'order', offlineOrder.id, offlineOrder);

    return offlineOrder.id;
  }

  /**
   * Get all pending orders for sync
   */
  async getPendingOrders(): Promise<OfflinePOSOrder[]> {
    if (!this.db) await this.initialize();

    return await this.db!.getAllFromIndex('orders', 'by-sync-status', 'pending');
  }

  /**
   * Update order sync status
   */
  async updateOrderSyncStatus(
    orderId: string,
    status: 'synced' | 'conflict' | 'failed',
    serverOrderId?: string,
    errorMessage?: string
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const order = await this.db!.get('orders', orderId);
    if (order) {
      order.syncStatus = status;
      order.serverOrderId = serverOrderId;
      order.errorMessage = errorMessage;
      order.syncAttempts += 1;
      order.lastSyncAttempt = new Date().toISOString();
      await this.db!.put('orders', order);
    }
  }

  /**
   * Cache inventory for offline use
   */
  async cacheInventory(ingredients: Array<{ id: string; quantity: number }>): Promise<void> {
    if (!this.db) await this.initialize();

    const tx = this.db!.transaction('inventory', 'readwrite');
    await Promise.all(
      ingredients.map(async (ingredient) => {
        const cached: OfflineInventoryCache = {
          ingredientId: ingredient.id,
          cachedQuantity: ingredient.quantity,
          lastSyncAt: new Date().toISOString(),
          version: 1,
          isDirty: false,
        };
        await tx.store.put(cached);
      })
    );
    await tx.done;
  }

  /**
   * Get cached inventory quantity
   */
  async getCachedInventory(ingredientId: string): Promise<number | null> {
    if (!this.db) await this.initialize();

    const cached = await this.db!.get('inventory', ingredientId);
    return cached ? cached.cachedQuantity : null;
  }

  /**
   * Update cached inventory (mark as dirty)
   */
  async updateCachedInventory(ingredientId: string, quantity: number): Promise<void> {
    if (!this.db) await this.initialize();

    const cached = await this.db!.get('inventory', ingredientId);
    if (cached) {
      cached.cachedQuantity = quantity;
      cached.isDirty = true;
      cached.version += 1;
      await this.db!.put('inventory', cached);
    }
  }

  /**
   * Get all dirty inventory items
   */
  async getDirtyInventory(): Promise<OfflineInventoryCache[]> {
    if (!this.db) await this.initialize();

    return await this.db!.getAllFromIndex('inventory', 'by-dirty', 1);
  }

  /**
   * Add operation to sync queue
   */
  private async addToSyncQueue(
    operationType: any,
    entityType: any,
    entityId: string,
    payload: any
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const syncItem = {
      id: uuidv4(),
      operationType,
      entityType,
      entityId,
      payload,
      syncStatus: 'pending' as const,
      syncAttempts: 0,
      createdAt: new Date().toISOString(),
    };

    await this.db!.add('syncQueue', syncItem);
  }

  /**
   * Get pending sync operations
   */
  async getPendingSyncOperations(): Promise<any[]> {
    if (!this.db) await this.initialize();

    return await this.db!.getAllFromIndex('syncQueue', 'by-status', 'pending');
  }

  /**
   * Update sync operation status
   */
  async updateSyncOperationStatus(
    syncId: string,
    status: 'synced' | 'conflict' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const operation = await this.db!.get('syncQueue', syncId);
    if (operation) {
      operation.syncStatus = status;
      operation.syncAttempts += 1;
      operation.lastSyncAttempt = new Date().toISOString();
      await this.db!.put('syncQueue', operation);
    }
  }

  /**
   * Create a conflict record
   */
  async createConflict(conflict: Omit<SyncConflict, 'conflictId' | 'resolved'>): Promise<string> {
    if (!this.db) await this.initialize();

    const newConflict: SyncConflict = {
      ...conflict,
      conflictId: uuidv4(),
      resolved: false,
    };

    await this.db!.add('conflicts', newConflict);
    return newConflict.conflictId;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    if (!this.db) await this.initialize();

    return await this.db!.getAllFromIndex('conflicts', 'by-resolved', 0);
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(
    conflictId: string,
    resolutionStrategy: string,
    resolvedBy: string,
    notes?: string
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const conflict = await this.db!.get('conflicts', conflictId);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolutionStrategy = resolutionStrategy as any;
      conflict.resolvedBy = resolvedBy;
      conflict.resolvedAt = new Date().toISOString();
      conflict.notes = notes;
      await this.db!.put('conflicts', conflict);
    }
  }

  /**
   * Generate a local receipt for offline orders
   */
  private generateLocalReceipt(order: any, lines: any[]): string {
    const receiptLines = [
      'SELEDA HOTEL - OFFLINE RECEIPT',
      '================================',
      `Order ID: ${order.id || 'PENDING'}`,
      `Date: ${new Date().toLocaleString()}`,
      `Outlet: ${order.outlet_id || 'N/A'}`,
      '--------------------------------',
      ...lines.map((line) => 
        `${line.name || line.menu_item?.name} x${line.quantity} - ${this.formatCurrency(line.unit_price * line.quantity)}`
      ),
      '--------------------------------',
      `Subtotal: ${this.formatCurrency(order.subtotal || 0)}`,
      `Tax: ${this.formatCurrency(order.tax_amount || 0)}`,
      `Total: ${this.formatCurrency(order.total_amount || 0)}`,
      '================================',
      '* OFFLINE MODE - Will sync when online *',
    ];
    return receiptLines.join('\n');
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  }

  /**
   * Clear all offline data (use with caution)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize();

    const tx = this.db!.transaction(['orders', 'inventory', 'conflicts', 'syncQueue'], 'readwrite');
    await Promise.all([
      tx.objectStore('orders').clear(),
      tx.objectStore('inventory').clear(),
      tx.objectStore('conflicts').clear(),
      tx.objectStore('syncQueue').clear(),
    ]);
    await tx.done;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    pendingOrders: number;
    syncedOrders: number;
    dirtyInventory: number;
    unresolvedConflicts: number;
    pendingSyncOperations: number;
  }> {
    if (!this.db) await this.initialize();

    const [pendingOrders, dirtyInventory, unresolvedConflicts, pendingSyncOperations] = await Promise.all([
      this.db!.getAllFromIndex('orders', 'by-sync-status', 'pending'),
      this.db!.getAllFromIndex('inventory', 'by-dirty', 1),
      this.db!.getAllFromIndex('conflicts', 'by-resolved', 0),
      this.db!.getAllFromIndex('syncQueue', 'by-status', 'pending'),
    ]);

    const allOrders = await this.db!.getAll('orders');
    const syncedOrders = allOrders.filter((o: OfflinePOSOrder) => o.syncStatus === 'synced').length;

    return {
      pendingOrders: pendingOrders.length,
      syncedOrders,
      dirtyInventory: dirtyInventory.length,
      unresolvedConflicts: unresolvedConflicts.length,
      pendingSyncOperations: pendingSyncOperations.length,
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const offlinePOSDatabase = new OfflinePOSDatabaseService();

// Export types
export type { OfflinePOSDatabaseService };
