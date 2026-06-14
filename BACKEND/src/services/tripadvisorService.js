/**
 * @fileoverview TripAdvisor Content API proxy service.
 * Wraps location search, details, reviews, photos, and nearby attractions.
 * Returns empty arrays with a source flag when the API is unavailable.
 */

const axios = require('axios');
const env = require('../config/env');

const BASE_URL = 'https://api.content.tripadvisor.com/api/v1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a request URL and attach the API key as a query parameter.
 * @param {string} path - API path (e.g. "/location/search")
 * @param {object} [params={}] - Additional query parameters
 * @returns {{ url: string, params: object }}
 */
const buildRequest = (path, params = {}) => ({
  url: `${BASE_URL}${path}`,
  params: { ...params, key: env.TRIPADVISOR_API_KEY },
});

/**
 * Normalize a TripAdvisor location object.
 * @param {object} loc - Raw location from the API
 * @returns {object} Normalized location
 */
const normalizeLocation = (loc) => ({
  locationId: loc.location_id || null,
  name: loc.name || '',
  address: loc.address_obj
    ? [loc.address_obj.street1, loc.address_obj.city, loc.address_obj.country].filter(Boolean).join(', ')
    : '',
  city: loc.address_obj?.city || '',
  country: loc.address_obj?.country || '',
  coordinates: loc.latitude && loc.longitude
    ? { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) }
    : { lat: null, lng: null },
  rating: loc.rating ? parseFloat(loc.rating) : null,
  numReviews: loc.num_reviews ? parseInt(loc.num_reviews, 10) : 0,
  category: loc.category?.name || '',
  subcategories: (loc.subcategory || []).map((s) => s.name),
  rankingString: loc.ranking_data?.ranking_string || '',
  webUrl: loc.web_url || null,
  photoUrl: loc.photo?.images?.medium?.url || null,
});

/**
 * Return the standard unavailable fallback shape.
 * @returns {{ data: any[], source: string }}
 */
const unavailable = () => ({ data: [], source: 'unavailable' });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for locations by text query.
 * @param {string} query - Search text
 * @param {string} [category] - Category filter (e.g. "attractions", "restaurants", "hotels")
 * @param {string} [language='en'] - Language code
 * @returns {Promise<object>} { data: normalizedLocation[], source: 'tripadvisor' | 'unavailable' }
 */
const searchLocations = async (query, category, language = 'en') => {
  try {
    const params = { searchQuery: query, language };
    if (category) params.category = category;

    const req = buildRequest('/location/search', params);
    const { data } = await axios.get(req.url, { params: req.params });

    return {
      data: (data.data || []).map(normalizeLocation),
      source: 'tripadvisor',
    };
  } catch (error) {
    console.error('tripadvisorService.searchLocations error:', error.message);
    return unavailable();
  }
};

/**
 * Get detailed information for a location.
 * @param {string} locationId - TripAdvisor location ID
 * @returns {Promise<object>} { data: normalizedLocation | null, source }
 */
const getLocationDetails = async (locationId) => {
  try {
    const req = buildRequest(`/location/${locationId}/details`);
    const { data } = await axios.get(req.url, { params: req.params });

    return {
      data: normalizeLocation(data),
      source: 'tripadvisor',
    };
  } catch (error) {
    console.error('tripadvisorService.getLocationDetails error:', error.message);
    return { data: null, source: 'unavailable' };
  }
};

/**
 * Get reviews for a location.
 * @param {string} locationId - TripAdvisor location ID
 * @param {string} [language='en'] - Language code
 * @returns {Promise<object>} { data: review[], source }
 */
const getLocationReviews = async (locationId, language = 'en') => {
  try {
    const req = buildRequest(`/location/${locationId}/reviews`, { language });
    const { data } = await axios.get(req.url, { params: req.params });

    const reviews = (data.data || []).map((r) => ({
      id: r.id || null,
      title: r.title || '',
      text: r.text || '',
      rating: r.rating || null,
      publishedDate: r.published_date || null,
      author: r.user?.username || 'Anonymous',
      tripType: r.trip_type || null,
      travelDate: r.travel_date || null,
    }));

    return { data: reviews, source: 'tripadvisor' };
  } catch (error) {
    console.error('tripadvisorService.getLocationReviews error:', error.message);
    return unavailable();
  }
};

/**
 * Get photos for a location.
 * @param {string} locationId - TripAdvisor location ID
 * @returns {Promise<object>} { data: photo[], source }
 */
const getLocationPhotos = async (locationId) => {
  try {
    const req = buildRequest(`/location/${locationId}/photos`);
    const { data } = await axios.get(req.url, { params: req.params });

    const photos = (data.data || []).map((p) => ({
      id: p.id || null,
      caption: p.caption || '',
      publishedDate: p.published_date || null,
      images: {
        thumbnail: p.images?.thumbnail?.url || null,
        small: p.images?.small?.url || null,
        medium: p.images?.medium?.url || null,
        large: p.images?.large?.url || null,
        original: p.images?.original?.url || null,
      },
      author: p.user?.username || 'Unknown',
    }));

    return { data: photos, source: 'tripadvisor' };
  } catch (error) {
    console.error('tripadvisorService.getLocationPhotos error:', error.message);
    return unavailable();
  }
};

/**
 * Search for nearby attractions around a coordinate.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} [category] - Category filter
 * @returns {Promise<object>} { data: normalizedLocation[], source }
 */
const getNearbyAttractions = async (lat, lng, category) => {
  try {
    const params = { latLong: `${lat},${lng}` };
    if (category) params.category = category;

    const req = buildRequest('/location/nearby_search', params);
    const { data } = await axios.get(req.url, { params: req.params });

    return {
      data: (data.data || []).map(normalizeLocation),
      source: 'tripadvisor',
    };
  } catch (error) {
    console.error('tripadvisorService.getNearbyAttractions error:', error.message);
    return unavailable();
  }
};

module.exports = {
  searchLocations,
  getLocationDetails,
  getLocationReviews,
  getLocationPhotos,
  getNearbyAttractions,
};
