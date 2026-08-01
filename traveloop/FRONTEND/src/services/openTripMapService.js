// OpenTripMap API Service for Real-World Tourist Attractions, Monuments & Landmarks
// Free & Open-Source OpenTripMap Data Engine

const OPENTRIPMAP_BASE = 'https://api.opentripmap.com/0.1/en/places';
const OTM_API_KEY = '5af835b22f1d15db63cafeec7d8b9404';

// In-memory & localStorage Cache
const cacheMap = new Map();

const getCachedData = (key) => {
  if (cacheMap.has(key)) return cacheMap.get(key);
  try {
    const stored = localStorage.getItem(`otm_cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      cacheMap.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return null;
};

const setCachedData = (key, value) => {
  cacheMap.set(key, value);
  try {
    localStorage.setItem(`otm_cache_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
};

/**
 * Fetch real places within bounding box (south, west, north, east)
 */
export async function fetchPlacesInBbox(bbox, kinds = 'interesting_places', limit = 25) {
  if (!bbox || bbox.south === undefined) return [];

  const cacheKey = `bbox_${bbox.south.toFixed(2)}_${bbox.west.toFixed(2)}_${bbox.north.toFixed(2)}_${bbox.east.toFixed(2)}_${kinds}_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENTRIPMAP_BASE}/bbox?lon_min=${bbox.west}&lat_min=${bbox.south}&lon_max=${bbox.east}&lat_max=${bbox.north}&kinds=${kinds}&format=json&limit=${limit}&apikey=${OTM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      setCachedData(cacheKey, data);
      return data;
    }
    return [];
  } catch (error) {
    console.warn('fetchPlacesInBbox error:', error.message);
    return [];
  }
}

/**
 * Fetch real places within a specified radius (in meters) around coordinates (lat, lng)
 */
export async function fetchPlacesByRadius(lat, lng, radiusMeters = 10000, kinds = 'interesting_places', limit = 30) {
  if (lat === undefined || lng === undefined) return [];

  const cacheKey = `radius_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}_${kinds}_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENTRIPMAP_BASE}/radius?radius=${radiusMeters}&lon=${lng}&lat=${lat}&kinds=${kinds}&format=json&limit=${limit}&apikey=${OTM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      setCachedData(cacheKey, data);
      return data;
    }
    return [];
  } catch (error) {
    console.warn('fetchPlacesByRadius error:', error.message);
    return [];
  }
}

/**
 * Fetch place details by XID from OpenTripMap
 */
export async function fetchPlaceDetailsByXid(xid) {
  if (!xid) return null;

  const cacheKey = `xid_${xid}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENTRIPMAP_BASE}/xid/${xid}?apikey=${OTM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`fetchPlaceDetailsByXid error for ${xid}:`, error.message);
    return null;
  }
}

/**
 * Search places by name/title keyword using OpenTripMap autosuggest
 */
export async function searchPlacesByAutosuggest(name, limit = 10) {
  if (!name || name.trim().length < 2) return [];

  const cacheKey = `autosuggest_${name.trim().toLowerCase()}_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENTRIPMAP_BASE}/autosuggest?name=${encodeURIComponent(name)}&radius=5000000&lon=0&lat=0&format=json&limit=${limit}&apikey=${OTM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      setCachedData(cacheKey, data);
      return data;
    }
    return [];
  } catch (error) {
    console.warn('searchPlacesByAutosuggest error:', error.message);
    return [];
  }
}
