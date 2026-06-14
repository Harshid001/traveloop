const googleMapsService = require('../services/googleMapsService');
const { cache, CACHE_TTL } = require('../services/cacheService');

/**
 * @desc    Search for places by text query
 * @route   GET /api/places/search
 * @access  Public
 */
const searchPlaces = async (req, res) => {
  try {
    const { q, lat, lng, radius, type } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    const cacheKey = `places:search:${q}:${lat}:${lng}:${radius}:${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.searchPlaces(q, lat, lng, radius, type);
    cache.set(cacheKey, result, CACHE_TTL.SEARCH);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching places:', error.message);
    res.status(500).json({ success: false, message: 'Failed to search places' });
  }
};

/**
 * @desc    Get nearby places by coordinates
 * @route   GET /api/places/nearby
 * @access  Public
 */
const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `places:nearby:${lat}:${lng}:${radius}:${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.getNearbyPlaces(lat, lng, radius, type);
    cache.set(cacheKey, result, CACHE_TTL.PLACES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting nearby places:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get nearby places' });
  }
};

/**
 * @desc    Get detailed information for a specific place
 * @route   GET /api/places/details/:placeId
 * @access  Public
 */
const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ success: false, message: 'Parameter "placeId" is required' });
    }

    const cacheKey = `places:details:${placeId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.getPlaceDetails(placeId);
    cache.set(cacheKey, result, CACHE_TTL.PLACES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting place details:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get place details' });
  }
};

/**
 * @desc    Get a photo for a place by photo reference
 * @route   GET /api/places/photos/:photoReference
 * @access  Public
 */
const getPlacePhotos = async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxWidth } = req.query;

    if (!photoReference) {
      return res.status(400).json({ success: false, message: 'Parameter "photoReference" is required' });
    }

    const cacheKey = `places:photos:${photoReference}:${maxWidth}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.getPlacePhotos(photoReference, maxWidth);
    cache.set(cacheKey, result, CACHE_TTL.IMAGES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting place photos:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get place photos' });
  }
};

/**
 * @desc    Autocomplete place name input
 * @route   GET /api/places/autocomplete
 * @access  Public
 */
const autocomplete = async (req, res) => {
  try {
    const { input, types, lat, lng } = req.query;

    if (!input) {
      return res.status(400).json({ success: false, message: 'Query parameter "input" is required' });
    }

    const cacheKey = `places:autocomplete:${input}:${types}:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.autocomplete(input, types, lat, lng);
    cache.set(cacheKey, result, CACHE_TTL.AUTOCOMPLETE);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error with autocomplete:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get autocomplete suggestions' });
  }
};

module.exports = {
  searchPlaces,
  getNearbyPlaces,
  getPlaceDetails,
  getPlacePhotos,
  autocomplete,
};
