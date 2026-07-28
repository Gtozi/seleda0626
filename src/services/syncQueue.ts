/**
 * Sync Queue Service
 * Manages automatic synchronization with conflict resolution
 */

import { offlineStorageService } from './offlineStorage';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  timestamp: string;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  resolution?: any;
}

class SyncQueueService {
  private queue: SyncOperation[] = [];
  private isProcessing: boolean = false;
  private conflictResolutionStrategy: ConflictResolution = { strategy: 'server-wins' };

  /**
   * Add operation to sync queue
   */
  enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const syncOp: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(op => op.priority < syncOp.priority);
    if (insertIndex === -1) {
      this.queue.push(syncOp);
    } else {
      this.queue.splice(insertIndex, 0, syncOp);
    }

    this.persistQueue();
    this.processQueue();

    return syncOp.id;
  }

  /**
   * Process sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue[0];

      try {
        const success = await this.syncOperation(operation);
        
        if (success) {
          this.queue.shift(); // Remove successfully synced operation
        } else {
          // Move to end of queue for retry
          operation.retryCount++;
          if (operation.retryCount >= operation.maxRetries) {
            // Max retries reached, mark as failed
            console.error(`Sync operation ${operation.id} failed after ${operation.maxRetries} attempts`);
            this.queue.shift();
          } else {
            this.queue.push(this.queue.shift()!);
          }
        }
      } catch (error) {
        console.error(`Error processing sync operation ${operation.id}:`, error);
        operation.retryCount++;
        if (operation.retryCount >= operation.maxRetries) {
          this.queue.shift();
        } else {
          this.queue.push(this.queue.shift()!);
        }
      }

      this.persistQueue();
    }

    this.isProcessing = false;
  }

  /**
   * Sync a single operation
   */
  private async syncOperation(operation: SyncOperation): Promise<boolean> {
    // In a real implementation, this would make API calls
    // For now, simulate success
    
    switch (operation.type) {
      case 'create':
        return await this.syncCreate(operation);
      case 'update':
        return await this.syncUpdate(operation);
      case 'delete':
        return await this.syncDelete(operation);
      default:
        return false;
    }
  }

  private async syncCreate(operation: SyncOperation): Promise<boolean> {
    // Simulate API call
    // await api.post(`/api/${operation.entity}`, operation.data);
    return true;
  }

  private async syncUpdate(operation: SyncOperation): Promise<boolean> {
    // Check for conflicts
    const hasConflict = await this.checkForConflict(operation);
    
    if (hasConflict) {
      return await this.resolveConflict(operation);
    }
    
    // await api.put(`/api/${operation.entity}/${operation.entityId}`, operation.data);
    return true;
  }

  private async syncDelete(operation: SyncOperation): Promise<boolean> {
    // await api.delete(`/api/${operation.entity}/${operation.entityId}`);
    return true;
  }

  /**
   * Check for conflicts between client and server data
   */
  private async checkForConflict(operation: SyncOperation): Promise<boolean> {
    // In a real implementation, this would fetch server data and compare
    // For now, return false (no conflict)
    return false;
  }

  /**
   * Resolve conflicts based on strategy
   */
  private async resolveConflict(operation: SyncOperation): Promise<boolean> {
    switch (this.conflictResolutionStrategy.strategy) {
      case 'server-wins':
        // Discard client changes, fetch server data
        return true;
      
      case 'client-wins':
        // Force client data to server
        // await api.put(`/api/${operation.entity}/${operation.entityId}`, operation.data, { force: true });
        return true;
      
      case 'merge':
        // Attempt intelligent merge
        return await this.mergeConflict(operation);
      
      case 'manual':
        // Flag for manual resolution
        console.warn(`Manual resolution required for ${operation.entity} ${operation.entityId}`);
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Merge conflicting data
   */
  private async mergeConflict(operation: SyncOperation): Promise<boolean> {
    // In a real implementation, this would perform intelligent field-level merging
    // For now, use client-wins as fallback
    return true;
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictResolutionStrategy(strategy: ConflictResolution): void {
    this.conflictResolutionStrategy = strategy;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    total: number;
    processing: boolean;
    byPriority: Record<number, number>;
  } {
    const byPriority: Record<number, number> = {};
    this.queue.forEach(op => {
      byPriority[op.priority] = (byPriority[op.priority] || 0) + 1;
    });

    return {
      total: this.queue.length,
      processing: this.isProcessing,
      byPriority,
    };
  }

  /**
   * Clear queue (use with caution)
   */
  clearQueue(): void {
    this.queue = [];
    this.persistQueue();
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error persisting sync queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  loadQueue(): void {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    this.isProcessing = false;
    await this.processQueue();
  }
}

export const syncQueueService = new SyncQueueService();

// Load queue on initialization
syncQueueService.loadQueue();
