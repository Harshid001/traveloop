const googleMapsService = require('../services/googleMapsService');
const { cache, CACHE_TTL } = require('../services/cacheService');

/**
 * @desc    Geocode an address to coordinates
 * @route   GET /api/maps/geocode
 * @access  Public
 */
const geocode = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ success: false, message: 'Query parameter "address" is required' });
    }

    const cacheKey = `maps:geocode:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.geocode(address);
    cache.set(cacheKey, result, CACHE_TTL.DIRECTIONS);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    res.status(500).json({ success: false, message: 'Failed to geocode address' });
  }
};

/**
 * @desc    Reverse-geocode coordinates to an address
 * @route   GET /api/maps/reverse-geocode
 * @access  Public
 */
const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `maps:reverse-geocode:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.reverseGeocode(lat, lng);
    cache.set(cacheKey, result, CACHE_TTL.DIRECTIONS);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error reverse-geocoding:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reverse-geocode coordinates' });
  }
};

/**
 * @desc    Get directions between origin and destination
 * @route   GET /api/maps/directions
 * @access  Public
 */
const getDirections = async (req, res) => {
  try {
    const { origin, destination, mode } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Query parameters "origin" and "destination" are required' });
    }

    const cacheKey = `maps:directions:${origin}:${destination}:${mode}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.getDirections(origin, destination, mode);
    cache.set(cacheKey, result, CACHE_TTL.DIRECTIONS);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting directions:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get directions' });
  }
};

/**
 * @desc    Get distance matrix for multiple origins/destinations
 * @route   GET /api/maps/distance
 * @access  Public
 */
const getDistanceMatrix = async (req, res) => {
  try {
    const { origins, destinations, mode } = req.query;

    if (!origins || !destinations) {
      return res.status(400).json({ success: false, message: 'Query parameters "origins" and "destinations" are required' });
    }

    const cacheKey = `maps:distance:${origins}:${destinations}:${mode}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await googleMapsService.getDistanceMatrix(origins, destinations, mode);
    cache.set(cacheKey, result, CACHE_TTL.DIRECTIONS);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting distance matrix:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get distance matrix' });
  }
};

module.exports = {
  geocode,
  reverseGeocode,
  getDirections,
  getDistanceMatrix,
};
