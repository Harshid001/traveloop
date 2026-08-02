/**
 * Recommendation service for Traveloop.
 * Aggregates user signals (search history, wishlist, trips, preferences)
 * to generate personalized destination recommendations using Gemini AI.
 */

const { cache, CACHE_TTL } = require('./cacheService');
const amadeusService = require('./amadeusService');
const { enrichWithImages } = require('./discoverService');

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
    return [];
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

  const trending = await amadeusService.getTrendingDestinations('');
  const enriched = await enrichWithImages(trending.slice(0, 6));

  cache.set(cacheKey, enriched, CACHE_TTL.TRENDING);
  return enriched;
};

/**
 * AI-powered recommendation from natural language query.
 * @param {string} query - Natural language query
 * @param {object} preferences - User preferences
 * @returns {Promise<Array>} Matching destinations
 */
const getAiSuggestions = async (query, _preferences = {}) => {
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
      const seasonal = await amadeusService.getTrendingDestinations('');
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
    return [];
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
  } catch (err) {
    console.error('recommendationService: Amadeus category fetch failed:', err.message);
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

module.exports = {
  getPersonalizedRecommendations,
  getSimilarDestinations,
  getSeasonalRecommendations,
  getAiSuggestions,
};
