const Redis = require('ioredis');
const { env } = require('../config/env');

const CACHE_TTL = {
  AUTOCOMPLETE: 300,
  SEARCH: 3600,
  PLACE_DETAILS: 86400,
  IMAGES: 604800,
  WEATHER: 1800,
  REVIEWS: 21600,
  TRENDING: 3600,
  DIRECTIONS: 86400,
};

let redis = null;

function getRedis() {
  if (redis) return redis;
  if (env.REDIS_URL) {
    redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3, retryStrategy: (times) => Math.min(times * 100, 3000) });
    redis.on('error', (err) => console.warn('Redis connection error (falling back to in-memory):', err.message));
    return redis;
  }
  return null;
}

const memoryCache = new Map();
let _hits = 0;
let _misses = 0;

async function get(key) {
  const r = getRedis();
  if (r) {
    try {
      const val = await r.get(key);
      if (val) { _hits++; return JSON.parse(val); }
      _misses++;
      return null;
    } catch { /* fall through to memory */ }
  }
  const entry = memoryCache.get(key);
  if (!entry) { _misses++; return null; }
  if (Date.now() > entry.expiresAt) { memoryCache.delete(key); _misses++; return null; }
  _hits++;
  return entry.value;
}

async function set(key, value, ttlSeconds = 3600) {
  const r = getRedis();
  if (r) {
    try {
      await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch { /* fall through to memory */ }
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function has(key) {
  const r = getRedis();
  if (r) {
    try { return (await r.exists(key)) === 1; } catch { /* fall through */ }
  }
  const entry = memoryCache.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { memoryCache.delete(key); return false; }
  return true;
}

async function del(key) {
  const r = getRedis();
  if (r) {
    try { await r.del(key); } catch { /* continue */ }
  }
  memoryCache.delete(key);
}

function getStats() {
  for (const [k, e] of memoryCache) { if (Date.now() > e.expiresAt) memoryCache.delete(k); }
  return { size: memoryCache.size, hits: _hits, misses: _misses };
}

const cache = { get, set, has, delete: del, getStats };

module.exports = { cache, CACHE_TTL };