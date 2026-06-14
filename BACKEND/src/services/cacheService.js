/**
 * @fileoverview In-memory cache service with TTL support.
 * No external dependencies — uses a plain Map with expiry timestamps.
 */

/** Default TTL values (in seconds) for different data categories */
const CACHE_TTL = {
  AUTOCOMPLETE: 300,      // 5 min
  SEARCH: 3600,           // 1 hour
  PLACE_DETAILS: 86400,   // 24 hours
  IMAGES: 604800,         // 7 days
  WEATHER: 1800,          // 30 min
  REVIEWS: 21600,         // 6 hours
  TRENDING: 3600,         // 1 hour
  DIRECTIONS: 86400,      // 24 hours
};

class CacheService {
  constructor() {
    /** @type {Map<string, {value: any, expiresAt: number}>} */
    this.cache = new Map();
    this._hits = 0;
    this._misses = 0;
  }

  /**
   * Retrieve a cached value by key.
   * Returns null if the key doesn't exist or has expired.
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this._misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this._misses++;
      return null;
    }

    this._hits++;
    return entry.value;
  }

  /**
   * Store a value in the cache with a TTL.
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttlSeconds=3600] - Time-to-live in seconds (default 1 hour)
   */
  set(key, value, ttlSeconds = 3600) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Check if a key exists and has not expired.
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a single entry from the cache.
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Remove all entries from the cache and reset stats.
   */
  clear() {
    this.cache.clear();
    this._hits = 0;
    this._misses = 0;
  }

  /**
   * Return cache statistics.
   * @returns {{ size: number, hits: number, misses: number }}
   */
  getStats() {
    // Purge expired entries before reporting size
    for (const [key, entry] of this.cache) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    return {
      size: this.cache.size,
      hits: this._hits,
      misses: this._misses,
    };
  }
}

const defaultCache = new CacheService();

module.exports = { CacheService, cache: defaultCache, CACHE_TTL };
