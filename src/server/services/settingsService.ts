/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';

/**
 * In-memory cache for the single `global_settings` row.
 *
 * The settings table is read on almost every authenticated request
 * (session timeout, IP allowlist, feature flags, fee components, …).
 * Caching for 60 seconds eliminates redundant round-trips while still
 * picking up changes within a reasonable window.
 */

const CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry {
  data: Record<string, any> | null;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

/**
 * Returns the cached `global_settings` row if it is still fresh,
 * otherwise fetches from the database and updates the cache.
 */
export async function getGlobalSettings(): Promise<Record<string, any> | null> {
  // Serve from cache if still fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('global_settings')
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[settingsService] Failed to fetch global_settings:', error.message);
    // Return stale cache if available, otherwise null
    return cache?.data ?? null;
  }

  cache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Invalidate the cache — call after any UPDATE / INSERT on `global_settings`.
 */
export function invalidateGlobalSettingsCache(): void {
  cache = null;
}

/**
 * Fetch a single column from `global_settings` using the cache.
 */
export async function getGlobalSetting<K extends string>(
  key: K
): Promise<any | undefined> {
  const settings = await getGlobalSettings();
  return settings?.[key];
}

/**
 * Fetch multiple specific columns from `global_settings` using the cache.
 * Returns an object with only the requested keys.
 */
export async function getGlobalSettingsPick<K extends string>(
  keys: K[]
): Promise<Record<K, any>> {
  const settings = await getGlobalSettings();
  const result = {} as Record<K, any>;
  for (const key of keys) {
    result[key] = settings?.[key] ?? null;
  }
  return result;
}
