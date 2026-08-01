// Wikipedia REST API & Wikimedia Commons Service
// Fetches 100% real introductory summaries, article extracts, and high-res photography

const WIKI_REST_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_ACTION_BASE = 'https://en.wikipedia.org/w/api.php';

const wikiCache = new Map();

const getCachedWiki = (key) => {
  if (wikiCache.has(key)) return wikiCache.get(key);
  try {
    const stored = localStorage.getItem(`wiki_cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      wikiCache.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    console.warn('Wiki cache read error:', e);
  }
  return null;
};

const setCachedWiki = (key, value) => {
  wikiCache.set(key, value);
  try {
    localStorage.setItem(`wiki_cache_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Wiki cache write error:', e);
  }
};

/**
 * Fetch real Wikipedia page summary by article title or place name
 * @param {string} title - Article title or place name (e.g. 'Kyoto', 'Eiffel_Tower', 'Colosseum')
 */
export async function fetchWikipediaSummary(title) {
  if (!title) return null;

  const cleanTitle = encodeURIComponent(title.trim().replace(/ /g, '_'));
  const cacheKey = `summary_${cleanTitle}`;
  const cached = getCachedWiki(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${WIKI_REST_BASE}/${cleanTitle}`);
    if (!response.ok) return null;
    const data = await response.json();

    const summaryData = {
      title: data.title || title,
      displayTitle: data.displaytitle || data.title || title,
      description: data.description || '',
      extract: data.extract || '',
      thumbnail: data.thumbnail ? data.thumbnail.source : null,
      originalImage: data.originalimage ? data.originalimage.source : null,
      contentUrls: data.content_urls ? data.content_urls.desktop.page : `https://en.wikipedia.org/wiki/${cleanTitle}`,
      lang: data.lang || 'en',
    };

    setCachedWiki(cacheKey, summaryData);
    return summaryData;
  } catch (error) {
    console.warn(`fetchWikipediaSummary error for ${title}:`, error.message);
    return null;
  }
}

/**
 * Search Wikipedia for articles near coordinates (geosearch)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default 10000)
 */
export async function searchWikipediaByCoords(lat, lng, radius = 10000) {
  if (lat === undefined || lng === undefined) return [];

  const cacheKey = `geo_${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
  const cached = getCachedWiki(cacheKey);
  if (cached) return cached;

  try {
    const url = `${WIKI_ACTION_BASE}?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=${radius}&gslimit=10&format=json&origin=*`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (data?.query?.geosearch) {
      const results = data.query.geosearch.map((item) => ({
        pageId: item.pageid,
        title: item.title,
        lat: item.lat,
        lng: item.lon,
        dist: item.dist,
      }));
      setCachedWiki(cacheKey, results);
      return results;
    }
    return [];
  } catch (error) {
    console.warn('searchWikipediaByCoords error:', error.message);
    return [];
  }
}
