/**
 * Cache manager for Traveloop mobile app.
 * Uses AsyncStorage to provide TTL-aware response caching,
 * stale-while-revalidate pattern, and offline support.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'traveloop:cache:';
const CACHE_INDEX_KEY = 'traveloop:cache:__index__';

/** Cache TTL defaults (in seconds) */
export const CACHE_TTL = {
  SHORT: 300,          // 5 minutes — autocomplete, search suggestions
  MEDIUM: 1800,        // 30 minutes — weather, trending
  STANDARD: 3600,      // 1 hour — search results, category pages
  LONG: 86400,         // 24 hours — place details, destination data
  VERY_LONG: 604800,   // 7 days — images, static destination info
};

/**
 * Generate a deterministic cache key from params.
 * @param {string} namespace - e.g., 'discover', 'places'
 * @param {string} operation - e.g., 'trending', 'search'
 * @param {object} params - query parameters
 * @returns {string}
 */
export const generateCacheKey = (namespace, operation, params = {}) => {
  const paramStr = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${CACHE_PREFIX}${namespace}:${operation}${paramStr ? `:${paramStr}` : ''}`;
};

/**
 * Get a cached value if it exists and hasn't expired.
 * @param {string} key - Cache key
 * @returns {Promise<{data: any, stale: boolean} | null>}
 */
export const getCached = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    const now = Date.now();

    if (now < entry.expiresAt) {
      return { data: entry.data, stale: false };
    }

    // Expired but still available (stale-while-revalidate)
    // Keep stale data available for up to 2x TTL
    if (now < entry.expiresAt + (entry.ttl * 1000)) {
      return { data: entry.data, stale: true };
    }

    // Fully expired — clean up
    await AsyncStorage.removeItem(key);
    return null;
  } catch (error) {
    console.warn('Cache read error:', error.message);
    return null;
  }
};

/**
 * Store a value in cache with TTL.
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds
 */
export const setCached = async (key, data, ttlSeconds = CACHE_TTL.STANDARD) => {
  try {
    const entry = {
      data,
      ttl: ttlSeconds,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      cachedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    await updateCacheIndex(key);
  } catch (error) {
    console.warn('Cache write error:', error.message);
  }
};

/**
 * Remove a specific cache entry.
 * @param {string} key - Cache key to remove
 */
export const removeCached = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn('Cache remove error:', error.message);
  }
};

/**
 * Clear all Traveloop cache entries.
 */
export const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('Cache clear error:', error.message);
  }
};

/**
 * Get cache stats (total entries, approximate size).
 * @returns {Promise<{entries: number, namespaces: string[]}>}
 */
export const getCacheStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_INDEX_KEY);
    const namespaces = [...new Set(
      cacheKeys.map((k) => k.replace(CACHE_PREFIX, '').split(':')[0])
    )];
    return { entries: cacheKeys.length, namespaces };
  } catch {
    return { entries: 0, namespaces: [] };
  }
};

/**
 * Fetch with cache — stale-while-revalidate pattern.
 * Returns cached data immediately if available (even if stale),
 * then refreshes in the background.
 *
 * @param {string} cacheKey - Cache key
 * @param {function} fetchFn - Async function that fetches fresh data
 * @param {number} ttlSeconds - TTL for cache
 * @returns {Promise<{data: any, fromCache: boolean, stale: boolean}>}
 */
export const fetchWithCache = async (cacheKey, fetchFn, ttlSeconds = CACHE_TTL.STANDARD) => {
  // Try cache first
  const cached = await getCached(cacheKey);

  if (cached && !cached.stale) {
    // Fresh cache hit
    return { data: cached.data, fromCache: true, stale: false };
  }

  try {
    // Fetch fresh data
    const freshData = await fetchFn();
    // Update cache
    await setCached(cacheKey, freshData, ttlSeconds);
    return { data: freshData, fromCache: false, stale: false };
  } catch (error) {
    // Network error — return stale data if available
    if (cached) {
      return { data: cached.data, fromCache: true, stale: true };
    }
    throw error; // No cached data and network error
  }
};

/** Track cache keys for cleanup */
const updateCacheIndex = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    const index = raw ? JSON.parse(raw) : [];
    if (!index.includes(key)) {
      index.push(key);
      // Keep index size reasonable (max 500 entries)
      if (index.length > 500) {
        index.splice(0, index.length - 500);
      }
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
    }
  } catch {
    // Index tracking is non-critical
  }
};
