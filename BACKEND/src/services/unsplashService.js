/**
 * @fileoverview Unsplash API proxy service.
 * Wraps photo search, random photo, and convenience destination-image helpers.
 * Returns normalized photo objects with proper attribution.
 */

const axios = require('axios');
const env = require('../config/env');

const BASE_URL = 'https://api.unsplash.com';

/**
 * Create an axios instance pre-configured with Unsplash auth.
 */
const unsplashClient = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a raw Unsplash photo object into the app-standard shape.
 * @param {object} photo - Raw Unsplash photo
 * @returns {object} Normalized photo object
 */
const normalizePhoto = (photo) => ({
  id: photo.id,
  url: {
    raw: photo.urls?.raw || '',
    full: photo.urls?.full || '',
    regular: photo.urls?.regular || '',
    small: photo.urls?.small || '',
    thumb: photo.urls?.thumb || '',
  },
  width: photo.width || 0,
  height: photo.height || 0,
  description: photo.description || photo.alt_description || '',
  alt: photo.alt_description || photo.description || '',
  photographer: {
    name: photo.user?.name || 'Unknown',
    username: photo.user?.username || '',
    profileUrl: photo.user?.links?.html || '',
  },
  attribution: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search Unsplash for photos matching a query.
 * @param {string} query - Search query
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=10] - Results per page (max 30)
 * @param {string} [orientation] - "landscape", "portrait", or "squarish"
 * @returns {Promise<object>} { results: normalizedPhoto[], total, totalPages }
 */
const searchPhotos = async (query, page = 1, perPage = 10, orientation) => {
  try {
    const params = { query, page, per_page: perPage };
    if (orientation) params.orientation = orientation;

    const { data } = await unsplashClient.get('/search/photos', { params });

    return {
      results: (data.results || []).map(normalizePhoto),
      total: data.total || 0,
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error('unsplashService.searchPhotos error:', error.message);
    return { results: [], total: 0, totalPages: 0 };
  }
};

/**
 * Get a random photo matching a query.
 * @param {string} [query] - Optional search query to narrow randomness
 * @param {string} [orientation] - "landscape", "portrait", or "squarish"
 * @returns {Promise<object|null>} Normalized photo or null
 */
const getRandomPhoto = async (query, orientation) => {
  try {
    const params = {};
    if (query) params.query = query;
    if (orientation) params.orientation = orientation;

    const { data } = await unsplashClient.get('/photos/random', { params });

    return normalizePhoto(data);
  } catch (error) {
    console.error('unsplashService.getRandomPhoto error:', error.message);
    return null;
  }
};

/**
 * Get a specific photo by its Unsplash ID.
 * @param {string} id - Unsplash photo ID
 * @returns {Promise<object|null>} Normalized photo or null
 */
const getPhotoById = async (id) => {
  try {
    const { data } = await unsplashClient.get(`/photos/${id}`);
    return normalizePhoto(data);
  } catch (error) {
    console.error('unsplashService.getPhotoById error:', error.message);
    return null;
  }
};

/**
 * Convenience wrapper to fetch travel/destination images.
 * Combines the destination name with travel-related keywords for better results.
 * @param {string} destinationName - Name of the destination (e.g. "Paris")
 * @param {number} [count=5] - Number of images to return
 * @returns {Promise<object[]>} Array of normalized photo objects
 */
const getDestinationImages = async (destinationName, count = 5) => {
  try {
    const searchQuery = `${destinationName} travel landscape`;
    const { results } = await searchPhotos(searchQuery, 1, count, 'landscape');

    // If the travel-specific query returned too few results, broaden the search
    if (results.length < count) {
      const { results: broader } = await searchPhotos(destinationName, 1, count - results.length, 'landscape');
      return [...results, ...broader];
    }

    return results;
  } catch (error) {
    console.error('unsplashService.getDestinationImages error:', error.message);
    return [];
  }
};

module.exports = {
  searchPhotos,
  getRandomPhoto,
  getPhotoById,
  getDestinationImages,
};
