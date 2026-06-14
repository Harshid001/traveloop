/**
 * @fileoverview Amadeus API proxy service.
 * Uses raw HTTP with OAuth2 client_credentials flow — no Amadeus SDK.
 * Falls back to curated destination data when the API is unavailable.
 */

const axios = require('axios');
const env = require('../config/env');

const BASE_URL = 'https://api.amadeus.com';

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

/** @type {{ token: string|null, expiresAt: number }} */
let tokenCache = { token: null, expiresAt: 0 };

/**
 * Obtain (or refresh) an OAuth2 access token using the client_credentials flow.
 * The token is cached until it expires.
 * @returns {Promise<string>} Valid access token
 */
const getAccessToken = async () => {
  // Return cached token if still valid (with 60 s safety margin)
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.AMADEUS_CLIENT_ID,
        client_secret: env.AMADEUS_CLIENT_SECRET,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return tokenCache.token;
  } catch (error) {
    console.error('amadeusService.getAccessToken error:', error.message);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

/**
 * Make an authenticated GET request to the Amadeus API.
 * @param {string} path - API path (e.g. "/v1/reference-data/locations")
 * @param {object} [params={}] - Query parameters
 * @returns {Promise<object>} Response data
 */
const amadeusGet = async (path, params = {}) => {
  const token = await getAccessToken();
  const { data } = await axios.get(`${BASE_URL}${path}`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_TRENDING = [
  { name: 'Bali', city: 'Denpasar', country: 'Indonesia', iataCode: 'DPS', type: 'beach', coordinates: { lat: -8.3405, lng: 115.092 } },
  { name: 'Paris', city: 'Paris', country: 'France', iataCode: 'CDG', type: 'city', coordinates: { lat: 48.8566, lng: 2.3522 } },
  { name: 'Tokyo', city: 'Tokyo', country: 'Japan', iataCode: 'NRT', type: 'city', coordinates: { lat: 35.6762, lng: 139.6503 } },
  { name: 'Santorini', city: 'Thira', country: 'Greece', iataCode: 'JTR', type: 'island', coordinates: { lat: 36.3932, lng: 25.4615 } },
  { name: 'Dubai', city: 'Dubai', country: 'UAE', iataCode: 'DXB', type: 'city', coordinates: { lat: 25.2048, lng: 55.2708 } },
  { name: 'Swiss Alps', city: 'Interlaken', country: 'Switzerland', iataCode: 'BRN', type: 'mountain', coordinates: { lat: 46.6863, lng: 7.8632 } },
  { name: 'Maldives', city: 'Male', country: 'Maldives', iataCode: 'MLE', type: 'beach', coordinates: { lat: 4.1755, lng: 73.5093 } },
  { name: 'Machu Picchu', city: 'Cusco', country: 'Peru', iataCode: 'CUZ', type: 'historical', coordinates: { lat: -13.1631, lng: -72.545 } },
  { name: 'New York', city: 'New York', country: 'USA', iataCode: 'JFK', type: 'city', coordinates: { lat: 40.7128, lng: -74.006 } },
  { name: 'Kyoto', city: 'Kyoto', country: 'Japan', iataCode: 'KIX', type: 'cultural', coordinates: { lat: 35.0116, lng: 135.7681 } },
];

const RECOMMENDED_BY_TYPE = {
  adventure: ['Bali', 'Machu Picchu', 'Swiss Alps'],
  relaxation: ['Maldives', 'Santorini', 'Bali'],
  cultural: ['Kyoto', 'Paris', 'Machu Picchu'],
  urban: ['New York', 'Tokyo', 'Dubai'],
  default: ['Paris', 'Bali', 'Tokyo', 'Santorini', 'New York'],
};

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Normalize an Amadeus location result.
 * @param {object} loc - Raw Amadeus location object
 * @returns {object} Normalized destination
 */
const normalizeLocation = (loc) => ({
  name: loc.name || loc.address?.cityName || '',
  city: loc.address?.cityName || '',
  country: loc.address?.countryName || loc.address?.countryCode || '',
  iataCode: loc.iataCode || '',
  type: loc.subType?.toLowerCase() || 'city',
  coordinates: loc.geoCode
    ? { lat: loc.geoCode.latitude, lng: loc.geoCode.longitude }
    : { lat: null, lng: null },
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for destinations by keyword.
 * @param {string} keyword - Keyword to search for (e.g. "London")
 * @returns {Promise<object[]>} Array of normalized destination objects
 */
const searchDestinations = async (keyword) => {
  try {
    const data = await amadeusGet('/v1/reference-data/locations', {
      subType: 'CITY',
      keyword,
    });

    return (data.data || []).map(normalizeLocation);
  } catch (error) {
    console.error('amadeusService.searchDestinations error:', error.message);
    // Fallback: filter curated list by keyword
    const kw = keyword.toLowerCase();
    return FALLBACK_TRENDING.filter(
      (d) => d.name.toLowerCase().includes(kw) || d.city.toLowerCase().includes(kw)
    );
  }
};

/**
 * Get a specific city by its IATA city code.
 * @param {string} cityCode - IATA city code (e.g. "PAR")
 * @returns {Promise<object>} Normalized destination object
 */
const getCityByCode = async (cityCode) => {
  try {
    const data = await amadeusGet(`/v1/reference-data/locations/CITY_${cityCode}`);
    return normalizeLocation(data.data || data);
  } catch (error) {
    console.error('amadeusService.getCityByCode error:', error.message);
    const match = FALLBACK_TRENDING.find((d) => d.iataCode === cityCode);
    return match || null;
  }
};

/**
 * Get airports serving a given city.
 * @param {string} cityCode - IATA city code
 * @returns {Promise<object[]>} Array of normalized airport objects
 */
const getAirportsByCity = async (cityCode) => {
  try {
    const data = await amadeusGet('/v1/reference-data/locations', {
      subType: 'AIRPORT',
      keyword: cityCode,
    });

    return (data.data || []).map(normalizeLocation);
  } catch (error) {
    console.error('amadeusService.getAirportsByCity error:', error.message);
    return [];
  }
};

/**
 * Get trending flight destinations from a given origin city.
 * Falls back to the curated list when the API is unavailable.
 * @param {string} originCity - IATA code of the origin city (e.g. "NYC")
 * @returns {Promise<object[]>} Array of destination objects
 */
const getTrendingDestinations = async (originCity) => {
  try {
    const data = await amadeusGet('/v1/shopping/flight-destinations', {
      origin: originCity,
    });

    return (data.data || []).map((d) => ({
      name: d.destination,
      iataCode: d.destination,
      type: 'flight',
      price: d.price?.total ? parseFloat(d.price.total) : null,
      currency: d.price?.currency || 'USD',
      departureDate: d.departureDate || null,
      returnDate: d.returnDate || null,
    }));
  } catch (error) {
    console.error('amadeusService.getTrendingDestinations error:', error.message);
    return FALLBACK_TRENDING;
  }
};

/**
 * Get recommended destinations based on traveler type.
 * Falls back to curated data filtered by traveler preference.
 * @param {string} [travelerType='default'] - One of: adventure, relaxation, cultural, urban
 * @returns {Promise<object[]>} Array of destination objects
 */
const getRecommendedDestinations = async (travelerType = 'default') => {
  try {
    // Amadeus Recommended Locations API (if available)
    const data = await amadeusGet('/v1/reference-data/recommended-locations', {
      cityCodes: 'PAR',
      travelerCountryCode: 'FR',
    });

    return (data.data || []).map(normalizeLocation);
  } catch (error) {
    console.error('amadeusService.getRecommendedDestinations error:', error.message);
    // Curated fallback filtered by traveler type
    const names = RECOMMENDED_BY_TYPE[travelerType] || RECOMMENDED_BY_TYPE.default;
    return FALLBACK_TRENDING.filter((d) => names.includes(d.name));
  }
};

module.exports = {
  getAccessToken,
  searchDestinations,
  getCityByCode,
  getAirportsByCity,
  getTrendingDestinations,
  getRecommendedDestinations,
};
