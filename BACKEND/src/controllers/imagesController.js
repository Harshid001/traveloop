const unsplashService = require('../services/unsplashService');
const { cache, CACHE_TTL } = require('../services/cacheService');

/**
 * @desc    Search for images by query
 * @route   GET /api/images/search
 * @access  Public
 */
const searchImages = async (req, res) => {
  try {
    const { q, page, perPage, orientation } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    const cacheKey = `images:search:${q}:${page}:${perPage}:${orientation}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await unsplashService.searchPhotos(q, page, perPage, orientation);
    cache.set(cacheKey, result, CACHE_TTL.IMAGES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching images:', error.message);
    res.status(500).json({ success: false, message: 'Failed to search images' });
  }
};

/**
 * @desc    Get images for a specific destination
 * @route   GET /api/images/destination/:destinationName
 * @access  Public
 */
const getDestinationImages = async (req, res) => {
  try {
    const { destinationName } = req.params;
    const { count } = req.query;

    if (!destinationName) {
      return res.status(400).json({ success: false, message: 'Parameter "destinationName" is required' });
    }

    const cacheKey = `images:destination:${destinationName}:${count}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await unsplashService.getDestinationImages(destinationName, count);
    cache.set(cacheKey, result, CACHE_TTL.IMAGES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting destination images:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get destination images' });
  }
};

/**
 * @desc    Get a random image matching a query
 * @route   GET /api/images/random
 * @access  Public
 */
const getRandomImage = async (req, res) => {
  try {
    const { q, orientation } = req.query;

    const cacheKey = `images:random:${q}:${orientation}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const result = await unsplashService.getRandomPhoto(q, orientation);
    cache.set(cacheKey, result, CACHE_TTL.IMAGES);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting random image:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get random image' });
  }
};

module.exports = {
  searchImages,
  getDestinationImages,
  getRandomImage,
};
