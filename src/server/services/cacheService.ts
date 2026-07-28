/**
 * Simple in-memory caching service for financial reports
 * Supports TTL-based cache invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Periodic cleanup every 5 minutes
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

/**
 * Cache decorator for async functions
 * Caches the result of a function based on its arguments
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyPrefix: string,
  ttl?: number,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const cacheKey = keyGenerator 
        ? `${keyPrefix}:${keyGenerator(...args)}`
        : `${keyPrefix}:${JSON.stringify(args)}`;

      const cached = cacheService.get<any>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cacheService.set(cacheKey, result, ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * Get or set pattern for cache
 * Useful for expensive database queries
 */
export async function getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await factory();
  cacheService.set(key, result, ttl);
  return result;
}
