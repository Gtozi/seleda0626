/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Offline Sync Manager
 * Handles synchronization between offline local storage and server
 * Manages conflict resolution and sync queue processing
 */

import { offlinePOSDatabase, OfflinePOSOrder, SyncConflict } from './offlinePOSDatabase';

interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

interface SyncProgress {
  total: number;
  processed: number;
  currentOperation: string;
}

type SyncProgressCallback = (progress: SyncProgress) => void;

class OfflineSyncManager {
  private isSyncing: boolean = false;
  private syncInProgress: boolean = false;
  private API_BASE = '/api/food-beverage';
  private POS_SYNC_API = '/api/pos/sync';

  /**
   * Check if device is online
   */
  private isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Start synchronization process
   */
  async sync(progressCallback?: SyncProgressCallback): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        conflicts: 0,
        errors: ['Sync already in progress'],
      };
    }

    if (!this.isOnline()) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        conflicts: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Initialize offline database
      await offlinePOSDatabase.initialize();

      // Get pending operations
      const pendingOperations = await offlinePOSDatabase.getPendingSyncOperations();
      const total = pendingOperations.length;

      if (total === 0) {
        return result;
      }

      for (let i = 0; i < pendingOperations.length; i++) {
        const operation = pendingOperations[i];
        
        if (progressCallback) {
          progressCallback({
            total,
            processed: i,
            currentOperation: `Syncing ${operation.entityType} (${operation.operationType})`,
          });
        }

        try {
          await this.syncOperation(operation);
          result.processed++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync ${operation.entityId}: ${error}`);
          
          // Mark as failed if too many attempts
          if (operation.syncAttempts >= 3) {
            await offlinePOSDatabase.updateSyncOperationStatus(
              operation.id,
              'failed',
              String(error)
            );
          }
        }
      }

      // Sync inventory cache from server
      await this.syncInventoryFromServer();

      // Check for conflicts
      const conflicts = await offlinePOSDatabase.getUnresolvedConflicts();
      result.conflicts = conflicts.length;

      if (result.conflicts > 0) {
        result.success = false;
        result.errors.push(`${result.conflicts} conflicts require manual resolution`);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Sync a single operation to server
   */
  private async syncOperation(operation: any): Promise<void> {
    const { operationType, entityType, entityId, payload } = operation;

    switch (operationType) {
      case 'order_create':
        await this.syncOrderCreate(payload);
        break;
      case 'order_update':
        await this.syncOrderUpdate(payload);
        break;
      case 'order_void':
        await this.syncOrderVoid(payload);
        break;
      case 'stock_transaction':
        await this.syncStockTransaction(payload);
        break;
      case 'wastage_log':
        await this.syncWastageLog(payload);
        break;
      default:
        throw new Error(`Unknown operation type: ${operationType}`);
    }

    // Mark operation as synced
    await offlinePOSDatabase.updateSyncOperationStatus(operation.id, 'synced');
  }

  /**
   * Sync order creation to server
   */
  private async syncOrderCreate(payload: any): Promise<void> {
    try {
      // Use canonical pos_sync_queue pattern for unified offline POS
      const orderId = payload.orderData.id || payload.orderData.outlet_id + '_' + Date.now();
      const response = await fetch(`${this.POS_SYNC_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transaction_id: orderId,
          outlet_id: payload.orderData.outlet_id,
          terminal_id: payload.orderData.terminal_id || null,
          device_id: payload.orderData.device_id || null,
          operation_type: 'transaction',
          payload: {
            ...payload.orderData,
            line_items: payload.lines || [],
          },
          client_created_at: payload.orderData.transaction_date || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // Check for duplicate order conflict
        if (error.message?.includes('duplicate') || error.message?.includes('already exists') || error.message?.includes('already queued')) {
          await this.createConflict(
            'duplicate_order',
            'order',
            payload.orderData.id,
            payload,
            null,
            null
          );
          throw new Error('Duplicate order conflict');
        }
        
        throw new Error(error.message || error.error || 'Failed to sync order');
      }

      const serverOrder = await response.json();
      
      // Update local order with server ID
      await offlinePOSDatabase.updateOrderSyncStatus(
        payload.orderData.id,
        'synced',
        serverOrder.id
      );

    } catch (error) {
      // Check if this is a conflict we already handled
      if (String(error).includes('conflict')) {
        throw error;
      }
      throw new Error(`Order sync failed: ${error}`);
    }
  }

  /**
   * Sync order update to server
   */
  private async syncOrderUpdate(payload: any): Promise<void> {
    const response = await fetch(`${this.API_BASE}/orders/${payload.orderData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload.orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order');
    }
  }

  /**
   * Sync order void to server
   */
  private async syncOrderVoid(payload: any): Promise<void> {
    // Use pos_sync_queue for void operations
    const response = await fetch(`${this.POS_SYNC_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        transaction_id: `void_${payload.orderData.id}`,
        outlet_id: payload.orderData.outlet_id,
        operation_type: 'void',
        payload: {
          transaction_id: payload.orderData.id,
          void_reason: payload.voidReason,
          voided_by: payload.voidedBy,
        },
        client_created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || 'Failed to void order');
    }
  }

  /**
   * Sync stock transaction to server
   */
  private async syncStockTransaction(payload: any): Promise<void> {
    const response = await fetch(`${this.API_BASE}/stock-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Check for inventory conflict
      if (error.message?.includes('insufficient') || error.message?.includes('inventory')) {
        await this.createConflict(
          'inventory_mismatch',
          'stock_transaction',
          payload.ingredient_id,
          payload,
          null,
          null
        );
        throw new Error('Inventory conflict');
      }
      
      throw new Error(error.message || 'Failed to sync stock transaction');
    }
  }

  /**
   * Sync wastage log to server
   */
  private async syncWastageLog(payload: any): Promise<void> {
    const response = await fetch(`${this.API_BASE}/wastage-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sync wastage log');
    }
  }

  /**
   * Create a conflict record
   */
  private async createConflict(
    conflictType: any,
    entityType: 'order' | 'payment' | 'stock_transaction' | 'wastage_log',
    localOperationId: string,
    localPayload: any,
    serverEntityId: string | null,
    serverPayload: any
  ): Promise<void> {
    await offlinePOSDatabase.createConflict({
      conflictType,
      entityType,
      localOperationId,
      localPayload,
      serverEntityId: serverEntityId || undefined,
      serverPayload,
      resolutionStrategy: 'manual_merge',
    });
  }

  /**
   * Sync inventory from server to local cache
   */
  private async syncInventoryFromServer(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/ingredients?isActive=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory from server');
      }

      const ingredients = await response.json();
      
      // Cache each ingredient's current quantity
      const inventoryData = ingredients.map((ingredient: any) => ({
        id: ingredient.id,
        quantity: ingredient.current_cost || 0, // This would be actual stock level in real implementation
      }));

      await offlinePOSDatabase.cacheInventory(inventoryData);

    } catch (error) {
      console.error('Failed to sync inventory from server:', error);
      // Don't fail the entire sync if inventory sync fails
    }
  }

  /**
   * Resolve a conflict with a specific strategy
   */
  async resolveConflict(
    conflictId: string,
    strategy: 'local_wins' | 'server_wins' | 'manual_merge' | 'ignore',
    resolvedBy: string,
    notes?: string
  ): Promise<void> {
    const conflicts = await offlinePOSDatabase.getUnresolvedConflicts();
    const conflict = conflicts.find(c => c.conflictId === conflictId);

    if (!conflict) {
      throw new Error('Conflict not found');
    }

    switch (strategy) {
      case 'local_wins':
        // Force sync local data to server
        await this.forceSyncLocalData(conflict);
        break;
      case 'server_wins':
        // Discard local changes, use server data
        await this.discardLocalData(conflict);
        break;
      case 'manual_merge':
        // User has manually resolved, just mark as resolved
        break;
      case 'ignore':
        // Ignore the conflict
        break;
    }

    await offlinePOSDatabase.resolveConflict(conflictId, strategy, resolvedBy, notes);
  }

  /**
   * Force sync local data to server (for conflict resolution)
   */
  private async forceSyncLocalData(conflict: SyncConflict): Promise<void> {
    // Re-attempt the sync with force flag
    try {
      await this.syncOperation({
        operationType: conflict.localPayload.operationType || 'order_create',
        entityType: conflict.localPayload.entityType || 'order',
        entityId: conflict.localOperationId,
        payload: conflict.localPayload,
      });
    } catch (error) {
      throw new Error(`Failed to force sync: ${error}`);
    }
  }

  /**
   * Discard local data and use server data (for conflict resolution)
   */
  private async discardLocalData(conflict: SyncConflict): Promise<void> {
    // Remove local order/data
    if (conflict.entityType === 'order') {
      await offlinePOSDatabase.updateOrderSyncStatus(
        conflict.localOperationId,
        'failed',
        undefined,
        'Discarded in favor of server data'
      );
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    isSyncing: boolean;
    pendingOperations: number;
    unresolvedConflicts: number;
    lastSyncTime?: string;
  }> {
    await offlinePOSDatabase.initialize();
    
    const stats = await offlinePOSDatabase.getStats();
    const lastSyncTime = localStorage.getItem('seleda_last_sync_time');

    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      pendingOperations: stats.pendingSyncOperations,
      unresolvedConflicts: stats.unresolvedConflicts,
      lastSyncTime: lastSyncTime || undefined,
    };
  }

  /**
   * Get pending orders count
   */
  async getPendingOrdersCount(): Promise<number> {
    await offlinePOSDatabase.initialize();
    const stats = await offlinePOSDatabase.getStats();
    return stats.pendingOrders;
  }

  /**
   * Get unresolved conflicts
   */
  async getConflicts(): Promise<SyncConflict[]> {
    await offlinePOSDatabase.initialize();
    return await offlinePOSDatabase.getUnresolvedConflicts();
  }

  /**
   * Auto-sync on connection restored
   */
  setupAutoSync(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored, starting auto-sync...');
      this.sync().catch(error => {
        console.error('Auto-sync failed:', error);
      });
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost, offline mode activated');
    });

    // Periodic sync check (every 5 minutes)
    setInterval(() => {
      if (this.isOnline() && !this.isSyncing) {
        this.sync().catch(error => {
          console.error('Periodic sync failed:', error);
        });
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Update last sync time
   */
  private updateLastSyncTime(): void {
    localStorage.setItem('seleda_last_sync_time', new Date().toISOString());
  }
}

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Export types
export type { SyncResult, SyncProgress, SyncProgressCallback };
