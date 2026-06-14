/**
 * Recommendation service for Traveloop.
 * Aggregates user signals (search history, wishlist, trips, preferences)
 * to generate personalized destination recommendations using Gemini AI.
 */

const env = require('../config/env');
const { cache, CACHE_TTL } = require('./cacheService');
const amadeusService = require('./amadeusService');
const unsplashService = require('./unsplashService');

/**
 * Get personalized recommendations based on user behavior signals.
 * @param {string} userId - User ID
 * @param {object} signals - User behavior signals
 * @returns {Promise<Array>} Recommended destinations
 */
const getPersonalizedRecommendations = async (userId, signals = {}) => {
  const cacheKey = `recommendations:personalized:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Combine multiple recommendation strategies
    const [trendingRes, categoryRes] = await Promise.allSettled([
      amadeusService.getTrendingDestinations(''),
      getCategoryBasedRecommendations(signals),
    ]);

    let recommendations = [];

    if (trendingRes.status === 'fulfilled') {
      recommendations.push(...(trendingRes.value || []));
    }
    if (categoryRes.status === 'fulfilled') {
      recommendations.push(...(categoryRes.value || []));
    }

    // Deduplicate by name
    const seen = new Set();
    recommendations = recommendations.filter((r) => {
      const key = (r.name || '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Score and rank
    recommendations = recommendations.map((dest) => ({
      ...dest,
      relevanceScore: calculateRelevanceScore(dest, signals),
    }));

    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Enrich top results with images
    const top = recommendations.slice(0, 10);
    const enriched = await enrichWithImages(top);

    cache.set(cacheKey, enriched, CACHE_TTL.TRENDING);
    return enriched;
  } catch (error) {
    console.error('Recommendation service error:', error.message);
    return getFallbackRecommendations();
  }
};

/**
 * Get similar destinations to a given destination.
 * @param {object} destination - Source destination
 * @returns {Promise<Array>} Similar destinations
 */
const getSimilarDestinations = async (destination) => {
  if (!destination) return [];

  const cacheKey = `recommendations:similar:${destination.name || destination._id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Search for destinations with same type/category
    const type = destination.type || destination.category || '';
    const results = await amadeusService.getRecommendedDestinations(type);

    // Filter out the source destination
    const filtered = (results || []).filter(
      (r) => (r.name || '').toLowerCase() !== (destination.name || '').toLowerCase()
    );

    const enriched = await enrichWithImages(filtered.slice(0, 6));
    cache.set(cacheKey, enriched, CACHE_TTL.TRENDING);
    return enriched;
  } catch (error) {
    console.error('Similar destinations error:', error.message);
    return [];
  }
};

/**
 * Get seasonal recommendations based on current month.
 * @param {number} month - Month number (1-12)
 * @returns {Promise<Array>} Seasonal destinations
 */
const getSeasonalRecommendations = async (month) => {
  const cacheKey = `recommendations:seasonal:${month}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const seasonalDestinations = getSeasonalData(month);
  const enriched = await enrichWithImages(seasonalDestinations);

  cache.set(cacheKey, enriched, CACHE_TTL.TRENDING);
  return enriched;
};

/**
 * AI-powered recommendation from natural language query.
 * @param {string} query - Natural language query
 * @param {object} preferences - User preferences
 * @returns {Promise<Array>} Matching destinations
 */
const getAiSuggestions = async (query, preferences = {}) => {
  try {
    // Parse query intent using keyword matching (Gemini enhancement optional)
    const intent = parseQueryIntent(query);

    let results = [];

    // Fetch based on parsed intent
    if (intent.category) {
      const catResults = await amadeusService.getRecommendedDestinations(intent.category);
      results.push(...(catResults || []));
    }

    if (intent.season) {
      const monthMap = { winter: 1, spring: 4, summer: 7, fall: 10 };
      const seasonal = getSeasonalData(monthMap[intent.season] || new Date().getMonth() + 1);
      results.push(...seasonal);
    }

    // Deduplicate
    const seen = new Set();
    results = results.filter((r) => {
      const key = (r.name || '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by budget if specified
    if (intent.budget) {
      const budgetRanges = {
        low: { min: 0, max: 1000 },
        mid: { min: 1000, max: 3000 },
        high: { min: 3000, max: 10000 },
      };
      const range = budgetRanges[intent.budget] || budgetRanges.mid;
      results = results.filter((r) => {
        const price = r.estimatedBudget?.mid || r.budgetEstimate || 0;
        return price >= range.min && price <= range.max;
      });
    }

    const enriched = await enrichWithImages(results.slice(0, 10));
    return enriched;
  } catch (error) {
    console.error('AI suggestions error:', error.message);
    return getFallbackRecommendations();
  }
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Calculate relevance score for a destination based on user signals.
 */
const calculateRelevanceScore = (dest, signals) => {
  let score = 50; // base score

  const type = (dest.type || '').toLowerCase();
  const categories = signals.favoriteCategories || [];

  // Category match (30% weight)
  if (categories.includes(type)) score += 30;

  // Popularity boost (15% weight)
  score += (dest.popularity || 50) * 0.15;

  // Rating boost (15% weight)
  score += (dest.rating || 4.0) * 3;

  // Budget fit (20% weight)
  if (signals.budgetRange) {
    const price = dest.estimatedBudget?.mid || dest.budgetEstimate || 0;
    if (price >= signals.budgetRange.min && price <= signals.budgetRange.max) {
      score += 20;
    }
  }

  // Seasonal fit (20% weight)
  const currentMonth = new Date().getMonth() + 1;
  if (dest.bestMonths && dest.bestMonths.includes(currentMonth)) {
    score += 20;
  }

  return Math.min(score, 100);
};

/**
 * Get category-based recommendations from user signals.
 */
const getCategoryBasedRecommendations = async (signals) => {
  const categories = signals.favoriteCategories || ['beach', 'city', 'mountain'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  try {
    return await amadeusService.getRecommendedDestinations(category);
  } catch {
    return [];
  }
};

/**
 * Parse natural language query into structured intent.
 */
const parseQueryIntent = (query) => {
  const q = (query || '').toLowerCase();
  const intent = {};

  // Category detection
  const categoryKeywords = {
    beach: ['beach', 'coast', 'ocean', 'sea', 'tropical', 'island'],
    mountain: ['mountain', 'hill', 'alpine', 'trek', 'hiking', 'ski', 'snow'],
    city: ['city', 'urban', 'metropolitan', 'nightlife'],
    cultural: ['culture', 'cultural', 'heritage', 'temple', 'historical', 'museum'],
    adventure: ['adventure', 'extreme', 'rafting', 'diving', 'safari'],
    nature: ['nature', 'wildlife', 'forest', 'national park'],
    luxury: ['luxury', 'premium', 'five star', '5 star', 'resort'],
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => q.includes(kw))) {
      intent.category = cat;
      break;
    }
  }

  // Season detection
  const seasonKeywords = {
    winter: ['winter', 'december', 'january', 'february', 'cold', 'snow'],
    spring: ['spring', 'march', 'april', 'may', 'bloom', 'cherry'],
    summer: ['summer', 'june', 'july', 'august', 'hot', 'warm'],
    fall: ['fall', 'autumn', 'september', 'october', 'november', 'foliage'],
  };

  for (const [season, keywords] of Object.entries(seasonKeywords)) {
    if (keywords.some((kw) => q.includes(kw))) {
      intent.season = season;
      break;
    }
  }

  // Budget detection
  if (q.includes('budget') || q.includes('cheap') || q.includes('affordable') || q.includes('low cost')) {
    intent.budget = 'low';
  } else if (q.includes('luxury') || q.includes('premium') || q.includes('expensive')) {
    intent.budget = 'high';
  } else if (q.includes('mid') || q.includes('moderate')) {
    intent.budget = 'mid';
  }

  return intent;
};

/**
 * Get seasonal destination data by month.
 */
const getSeasonalData = (month) => {
  const seasonMap = {
    // Winter (Dec-Feb): tropical beaches, ski resorts
    12: [
      { name: 'Maldives', city: 'Male', country: 'Maldives', type: 'beach', rating: 4.9, popularity: 92, coordinates: { lat: 4.1755, lng: 73.5093 }, bestSeason: 'December-April', estimatedBudget: { mid: 3000 } },
      { name: 'Swiss Alps', city: 'Interlaken', country: 'Switzerland', type: 'mountain', rating: 4.8, popularity: 88, coordinates: { lat: 46.6863, lng: 7.8632 }, bestSeason: 'December-March', estimatedBudget: { mid: 2500 } },
      { name: 'Phuket', city: 'Phuket', country: 'Thailand', type: 'beach', rating: 4.6, popularity: 85, coordinates: { lat: 7.8804, lng: 98.3923 }, bestSeason: 'November-March', estimatedBudget: { mid: 800 } },
    ],
    1: null, 2: null, // same as December
    // Spring (Mar-May): cherry blossoms, moderate climates
    3: [
      { name: 'Kyoto', city: 'Kyoto', country: 'Japan', type: 'cultural', rating: 4.9, popularity: 90, coordinates: { lat: 35.0116, lng: 135.7681 }, bestSeason: 'March-May', estimatedBudget: { mid: 1800 } },
      { name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', type: 'city', rating: 4.7, popularity: 86, coordinates: { lat: 52.3676, lng: 4.9041 }, bestSeason: 'March-May', estimatedBudget: { mid: 1500 } },
      { name: 'Morocco', city: 'Marrakech', country: 'Morocco', type: 'cultural', rating: 4.6, popularity: 82, coordinates: { lat: 31.6295, lng: -7.9811 }, bestSeason: 'March-May', estimatedBudget: { mid: 900 } },
    ],
    4: null, 5: null,
    // Summer (Jun-Aug): European cities, islands, mountains
    6: [
      { name: 'Santorini', city: 'Thira', country: 'Greece', type: 'island', rating: 4.9, popularity: 94, coordinates: { lat: 36.3932, lng: 25.4615 }, bestSeason: 'June-September', estimatedBudget: { mid: 2000 } },
      { name: 'Barcelona', city: 'Barcelona', country: 'Spain', type: 'city', rating: 4.7, popularity: 89, coordinates: { lat: 41.3874, lng: 2.1686 }, bestSeason: 'May-September', estimatedBudget: { mid: 1500 } },
      { name: 'Iceland', city: 'Reykjavik', country: 'Iceland', type: 'nature', rating: 4.8, popularity: 87, coordinates: { lat: 64.1466, lng: -21.9426 }, bestSeason: 'June-August', estimatedBudget: { mid: 2200 } },
    ],
    7: null, 8: null,
    // Fall (Sep-Nov): foliage, wine regions
    9: [
      { name: 'New England', city: 'Burlington', country: 'USA', type: 'nature', rating: 4.7, popularity: 85, coordinates: { lat: 44.4759, lng: -73.2121 }, bestSeason: 'September-October', estimatedBudget: { mid: 1800 } },
      { name: 'Tuscany', city: 'Florence', country: 'Italy', type: 'cultural', rating: 4.8, popularity: 88, coordinates: { lat: 43.7696, lng: 11.2558 }, bestSeason: 'September-November', estimatedBudget: { mid: 1600 } },
      { name: 'Patagonia', city: 'El Calafate', country: 'Argentina', type: 'adventure', rating: 4.8, popularity: 83, coordinates: { lat: -50.3403, lng: -72.2648 }, bestSeason: 'October-March', estimatedBudget: { mid: 2000 } },
    ],
    10: null, 11: null,
  };

  // Fall back to seasonal data
  const data = seasonMap[month] || seasonMap[12] || seasonMap[6] || seasonMap[3] || seasonMap[9];
  return data || seasonMap[12];
};

/**
 * Enrich destinations with images from Unsplash.
 */
const enrichWithImages = async (destinations) => {
  if (!destinations || destinations.length === 0) return [];

  try {
    const enriched = await Promise.all(
      destinations.map(async (dest) => {
        if (dest.image && typeof dest.image === 'object' && dest.image.url) return dest;

        try {
          const images = await unsplashService.getDestinationImages(dest.name || dest.city, 1);
          const photo = images?.[0];
          return {
            ...dest,
            image: photo
              ? { url: photo.url?.regular || photo.url, photographer: photo.photographer?.name || '', attribution: photo.attribution || '' }
              : { url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format`, photographer: '', attribution: '' },
          };
        } catch {
          return {
            ...dest,
            image: { url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format`, photographer: '', attribution: '' },
          };
        }
      })
    );
    return enriched;
  } catch {
    return destinations;
  }
};

/**
 * Fallback recommendations when all APIs fail.
 */
const getFallbackRecommendations = () => [
  { id: 'rec_1', name: 'Bali', city: 'Denpasar', country: 'Indonesia', type: 'beach', rating: 4.8, popularity: 92, image: { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format' }, coordinates: { lat: -8.3405, lng: 115.092 }, bestSeason: 'April-October', estimatedBudget: { mid: 1200 }, tags: ['beach', 'culture', 'nature'] },
  { id: 'rec_2', name: 'Paris', city: 'Paris', country: 'France', type: 'city', rating: 4.7, popularity: 95, image: { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format' }, coordinates: { lat: 48.8566, lng: 2.3522 }, bestSeason: 'April-October', estimatedBudget: { mid: 2000 }, tags: ['city', 'culture', 'food'] },
  { id: 'rec_3', name: 'Tokyo', city: 'Tokyo', country: 'Japan', type: 'city', rating: 4.8, popularity: 93, image: { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format' }, coordinates: { lat: 35.6762, lng: 139.6503 }, bestSeason: 'March-May', estimatedBudget: { mid: 1800 }, tags: ['city', 'culture', 'food'] },
  { id: 'rec_4', name: 'Santorini', city: 'Thira', country: 'Greece', type: 'island', rating: 4.9, popularity: 91, image: { url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format' }, coordinates: { lat: 36.3932, lng: 25.4615 }, bestSeason: 'June-September', estimatedBudget: { mid: 2000 }, tags: ['island', 'romance', 'luxury'] },
];

module.exports = {
  getPersonalizedRecommendations,
  getSimilarDestinations,
  getSeasonalRecommendations,
  getAiSuggestions,
};
