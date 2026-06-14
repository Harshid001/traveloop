const amadeusService = require('../services/amadeusService');
const unsplashService = require('../services/unsplashService');
const googleMapsService = require('../services/googleMapsService');
const weatherService = require('../services/weatherService');
const { getChatbotResponse } = require('../services/chatbotService');
const { cache, CACHE_TTL } = require('../services/cacheService');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize raw data from various sources into a standard destination card.
 * @param {Object} raw - Raw destination data
 * @param {string} source - Data source identifier
 * @returns {Object} Normalized destination card
 */
const normalizeDestinationCard = (raw, source = 'curated') => ({
  id: raw.id || raw.placeId || raw.iataCode || `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: raw.name || raw.title || '',
  city: raw.city || raw.name || '',
  country: raw.country || '',
  coordinates: {
    lat: raw.coordinates?.lat || raw.lat || null,
    lng: raw.coordinates?.lng || raw.lng || null,
  },
  type: raw.type || 'city',
  image: raw.image || { url: null, photographer: null, attribution: null },
  rating: raw.rating || null,
  reviewCount: raw.reviewCount || null,
  estimatedBudget: raw.estimatedBudget || { min: null, max: null, currency: 'USD' },
  weather: raw.weather || { temp: null, condition: null, icon: null },
  bestSeason: raw.bestSeason || null,
  bestMonths: raw.bestMonths || [],
  tags: raw.tags || [],
  popularity: raw.popularity || null,
  source,
});

/**
 * Enrich a list of destinations with Unsplash images where image is missing.
 * @param {Array} destinations - Array of destination objects
 * @returns {Promise<Array>} Enriched destinations
 */
const enrichWithImages = async (destinations) => {
  const enriched = await Promise.all(
    destinations.map(async (dest) => {
      if (dest.image && dest.image.url) return dest;
      try {
        const photo = await unsplashService.getRandomPhoto(
          `${dest.name || dest.city} travel`,
          'landscape'
        );
        return {
          ...dest,
          image: {
            url: photo?.url || photo?.urls?.regular || null,
            photographer: photo?.photographer || photo?.user?.name || null,
            attribution: photo?.attribution || photo?.links?.html || null,
          },
        };
      } catch {
        return dest;
      }
    })
  );
  return enriched;
};

// ---------------------------------------------------------------------------
// Seasonal helpers
// ---------------------------------------------------------------------------

/** Map months to seasonal destination suggestions (Northern Hemisphere base). */
const SEASONAL_SUGGESTIONS = {
  winter: {
    months: [12, 1, 2],
    types: ['beach', 'island', 'adventure'],
    destinations: [
      { name: 'Maldives', country: 'Maldives', type: 'beach', tags: ['tropical', 'luxury', 'island'], bestSeason: 'winter', bestMonths: [12, 1, 2, 3] },
      { name: 'Bali', country: 'Indonesia', type: 'island', tags: ['tropical', 'culture', 'surfing'], bestSeason: 'winter', bestMonths: [4, 5, 6, 7, 8, 9] },
      { name: 'Whistler', country: 'Canada', type: 'mountain', tags: ['skiing', 'snow', 'adventure'], bestSeason: 'winter', bestMonths: [12, 1, 2, 3] },
      { name: 'Zermatt', country: 'Switzerland', type: 'mountain', tags: ['skiing', 'alps', 'luxury'], bestSeason: 'winter', bestMonths: [12, 1, 2, 3] },
      { name: 'Cancun', country: 'Mexico', type: 'beach', tags: ['tropical', 'nightlife', 'ruins'], bestSeason: 'winter', bestMonths: [12, 1, 2, 3, 4] },
      { name: 'Phuket', country: 'Thailand', type: 'beach', tags: ['tropical', 'budget', 'diving'], bestSeason: 'winter', bestMonths: [11, 12, 1, 2, 3] },
    ],
  },
  spring: {
    months: [3, 4, 5],
    types: ['cultural', 'city', 'historical'],
    destinations: [
      { name: 'Tokyo', country: 'Japan', type: 'city', tags: ['cherry-blossoms', 'culture', 'food'], bestSeason: 'spring', bestMonths: [3, 4, 5] },
      { name: 'Amsterdam', country: 'Netherlands', type: 'city', tags: ['tulips', 'canals', 'art'], bestSeason: 'spring', bestMonths: [4, 5] },
      { name: 'Provence', country: 'France', type: 'cultural', tags: ['lavender', 'wine', 'countryside'], bestSeason: 'spring', bestMonths: [4, 5, 6] },
      { name: 'Santorini', country: 'Greece', type: 'island', tags: ['romance', 'sunsets', 'architecture'], bestSeason: 'spring', bestMonths: [4, 5, 6] },
      { name: 'Marrakech', country: 'Morocco', type: 'cultural', tags: ['markets', 'architecture', 'food'], bestSeason: 'spring', bestMonths: [3, 4, 5] },
      { name: 'Washington DC', country: 'USA', type: 'city', tags: ['cherry-blossoms', 'history', 'museums'], bestSeason: 'spring', bestMonths: [3, 4] },
    ],
  },
  summer: {
    months: [6, 7, 8],
    types: ['beach', 'mountain', 'island'],
    destinations: [
      { name: 'Barcelona', country: 'Spain', type: 'city', tags: ['beach', 'architecture', 'nightlife'], bestSeason: 'summer', bestMonths: [6, 7, 8] },
      { name: 'Amalfi Coast', country: 'Italy', type: 'beach', tags: ['coast', 'romance', 'food'], bestSeason: 'summer', bestMonths: [5, 6, 7, 8, 9] },
      { name: 'Reykjavik', country: 'Iceland', type: 'adventure', tags: ['midnight-sun', 'nature', 'hiking'], bestSeason: 'summer', bestMonths: [6, 7, 8] },
      { name: 'Swiss Alps', country: 'Switzerland', type: 'mountain', tags: ['hiking', 'nature', 'scenic'], bestSeason: 'summer', bestMonths: [6, 7, 8, 9] },
      { name: 'Dubrovnik', country: 'Croatia', type: 'historical', tags: ['medieval', 'coast', 'GOT'], bestSeason: 'summer', bestMonths: [5, 6, 7, 8, 9] },
      { name: 'Mykonos', country: 'Greece', type: 'island', tags: ['party', 'beach', 'luxury'], bestSeason: 'summer', bestMonths: [6, 7, 8] },
    ],
  },
  fall: {
    months: [9, 10, 11],
    types: ['cultural', 'city', 'mountain'],
    destinations: [
      { name: 'New England', country: 'USA', type: 'mountain', tags: ['foliage', 'scenic', 'drives'], bestSeason: 'fall', bestMonths: [9, 10, 11] },
      { name: 'Tuscany', country: 'Italy', type: 'cultural', tags: ['wine', 'harvest', 'countryside'], bestSeason: 'fall', bestMonths: [9, 10, 11] },
      { name: 'Kyoto', country: 'Japan', type: 'cultural', tags: ['autumn-leaves', 'temples', 'tea'], bestSeason: 'fall', bestMonths: [10, 11] },
      { name: 'Munich', country: 'Germany', type: 'city', tags: ['oktoberfest', 'beer', 'culture'], bestSeason: 'fall', bestMonths: [9, 10] },
      { name: 'Napa Valley', country: 'USA', type: 'cultural', tags: ['wine', 'harvest', 'food'], bestSeason: 'fall', bestMonths: [9, 10, 11] },
      { name: 'Patagonia', country: 'Argentina', type: 'adventure', tags: ['hiking', 'glaciers', 'nature'], bestSeason: 'fall', bestMonths: [9, 10, 11] },
    ],
  },
};

/**
 * Determine season from month number and hemisphere.
 * @param {number} month - Month number (1-12)
 * @param {string} hemisphere - 'northern' or 'southern'
 * @returns {string} Season name
 */
const getSeason = (month, hemisphere = 'northern') => {
  const m = parseInt(month, 10);
  const seasonMap = { northern: {}, southern: {} };
  for (const [season, data] of Object.entries(SEASONAL_SUGGESTIONS)) {
    data.months.forEach((mo) => { seasonMap.northern[mo] = season; });
  }
  // Southern hemisphere is shifted by 6 months
  seasonMap.southern = {
    12: 'summer', 1: 'summer', 2: 'summer',
    3: 'fall', 4: 'fall', 5: 'fall',
    6: 'winter', 7: 'winter', 8: 'winter',
    9: 'spring', 10: 'spring', 11: 'spring',
  };
  return (seasonMap[hemisphere] || seasonMap.northern)[m] || 'summer';
};

// ---------------------------------------------------------------------------
// Budget helper data
// ---------------------------------------------------------------------------

const BUDGET_DESTINATIONS = [
  { name: 'Bangkok', country: 'Thailand', type: 'city', estimatedBudget: { min: 30, max: 60, currency: 'USD' }, tags: ['budget', 'food', 'temples'] },
  { name: 'Hanoi', country: 'Vietnam', type: 'city', estimatedBudget: { min: 25, max: 50, currency: 'USD' }, tags: ['budget', 'culture', 'food'] },
  { name: 'Lisbon', country: 'Portugal', type: 'city', estimatedBudget: { min: 50, max: 100, currency: 'USD' }, tags: ['budget', 'history', 'nightlife'] },
  { name: 'Budapest', country: 'Hungary', type: 'city', estimatedBudget: { min: 40, max: 80, currency: 'USD' }, tags: ['budget', 'thermal-baths', 'architecture'] },
  { name: 'Marrakech', country: 'Morocco', type: 'cultural', estimatedBudget: { min: 35, max: 70, currency: 'USD' }, tags: ['budget', 'markets', 'culture'] },
  { name: 'Cusco', country: 'Peru', type: 'historical', estimatedBudget: { min: 30, max: 60, currency: 'USD' }, tags: ['budget', 'ruins', 'hiking'] },
  { name: 'Bali', country: 'Indonesia', type: 'island', estimatedBudget: { min: 35, max: 75, currency: 'USD' }, tags: ['budget', 'beach', 'culture'] },
  { name: 'Prague', country: 'Czech Republic', type: 'city', estimatedBudget: { min: 45, max: 90, currency: 'USD' }, tags: ['budget', 'beer', 'architecture'] },
  { name: 'Mexico City', country: 'Mexico', type: 'city', estimatedBudget: { min: 35, max: 70, currency: 'USD' }, tags: ['budget', 'food', 'art'] },
  { name: 'Paris', country: 'France', type: 'city', estimatedBudget: { min: 100, max: 250, currency: 'USD' }, tags: ['luxury', 'romance', 'food'] },
  { name: 'Tokyo', country: 'Japan', type: 'city', estimatedBudget: { min: 80, max: 200, currency: 'USD' }, tags: ['moderate', 'food', 'tech'] },
  { name: 'Dubai', country: 'UAE', type: 'luxury', estimatedBudget: { min: 150, max: 400, currency: 'USD' }, tags: ['luxury', 'shopping', 'architecture'] },
];

// ---------------------------------------------------------------------------
// Category helper data
// ---------------------------------------------------------------------------

const CATEGORY_DESTINATIONS = {
  beach: [
    { name: 'Maldives', country: 'Maldives', type: 'beach', tags: ['tropical', 'luxury', 'diving'] },
    { name: 'Cancun', country: 'Mexico', type: 'beach', tags: ['tropical', 'nightlife', 'ruins'] },
    { name: 'Bora Bora', country: 'French Polynesia', type: 'beach', tags: ['luxury', 'overwater', 'romance'] },
    { name: 'Phuket', country: 'Thailand', type: 'beach', tags: ['tropical', 'budget', 'island'] },
  ],
  mountain: [
    { name: 'Swiss Alps', country: 'Switzerland', type: 'mountain', tags: ['skiing', 'hiking', 'scenic'] },
    { name: 'Banff', country: 'Canada', type: 'mountain', tags: ['nature', 'hiking', 'wildlife'] },
    { name: 'Patagonia', country: 'Argentina', type: 'mountain', tags: ['trekking', 'glaciers', 'nature'] },
    { name: 'Himalayas', country: 'Nepal', type: 'mountain', tags: ['trekking', 'spiritual', 'extreme'] },
  ],
  city: [
    { name: 'Paris', country: 'France', type: 'city', tags: ['romance', 'art', 'food'] },
    { name: 'New York', country: 'USA', type: 'city', tags: ['shopping', 'culture', 'entertainment'] },
    { name: 'Tokyo', country: 'Japan', type: 'city', tags: ['food', 'tech', 'culture'] },
    { name: 'London', country: 'England', type: 'city', tags: ['history', 'theatre', 'pubs'] },
  ],
  cultural: [
    { name: 'Kyoto', country: 'Japan', type: 'cultural', tags: ['temples', 'tea', 'tradition'] },
    { name: 'Rome', country: 'Italy', type: 'cultural', tags: ['history', 'food', 'architecture'] },
    { name: 'Marrakech', country: 'Morocco', type: 'cultural', tags: ['markets', 'architecture', 'food'] },
    { name: 'Varanasi', country: 'India', type: 'cultural', tags: ['spiritual', 'ancient', 'tradition'] },
  ],
  historical: [
    { name: 'Athens', country: 'Greece', type: 'historical', tags: ['ancient', 'ruins', 'philosophy'] },
    { name: 'Cairo', country: 'Egypt', type: 'historical', tags: ['pyramids', 'pharaohs', 'desert'] },
    { name: 'Cusco', country: 'Peru', type: 'historical', tags: ['inca', 'ruins', 'highlands'] },
    { name: 'Istanbul', country: 'Turkey', type: 'historical', tags: ['empires', 'mosques', 'bazaars'] },
  ],
  island: [
    { name: 'Santorini', country: 'Greece', type: 'island', tags: ['sunsets', 'romance', 'architecture'] },
    { name: 'Bali', country: 'Indonesia', type: 'island', tags: ['culture', 'surfing', 'spiritual'] },
    { name: 'Hawaii', country: 'USA', type: 'island', tags: ['volcanoes', 'surfing', 'nature'] },
    { name: 'Fiji', country: 'Fiji', type: 'island', tags: ['tropical', 'diving', 'relaxation'] },
  ],
  adventure: [
    { name: 'Queenstown', country: 'New Zealand', type: 'adventure', tags: ['bungee', 'skiing', 'hiking'] },
    { name: 'Costa Rica', country: 'Costa Rica', type: 'adventure', tags: ['zip-line', 'rainforest', 'wildlife'] },
    { name: 'Iceland', country: 'Iceland', type: 'adventure', tags: ['geysers', 'glaciers', 'northern-lights'] },
    { name: 'Patagonia', country: 'Argentina', type: 'adventure', tags: ['trekking', 'glaciers', 'nature'] },
  ],
  luxury: [
    { name: 'Dubai', country: 'UAE', type: 'luxury', tags: ['shopping', 'architecture', 'desert'] },
    { name: 'Monaco', country: 'Monaco', type: 'luxury', tags: ['casino', 'yachts', 'F1'] },
    { name: 'Maldives', country: 'Maldives', type: 'luxury', tags: ['overwater', 'spa', 'diving'] },
    { name: 'St. Moritz', country: 'Switzerland', type: 'luxury', tags: ['skiing', 'alpine', 'exclusive'] },
  ],
};

// ---------------------------------------------------------------------------
// Weather-based suggestion mapping
// ---------------------------------------------------------------------------

/**
 * Map current weather to suggested destination types.
 * @param {Object} weather - Current weather object { temp, condition }
 * @returns {Object} Suggestion hints
 */
const getWeatherSuggestions = (weather) => {
  const temp = parseFloat(weather?.temp) || 20;
  const condition = (weather?.condition || '').toLowerCase();

  if (temp > 30 || condition.includes('hot')) {
    return { suggestType: 'mountain', reason: 'Escape the heat with cool mountain retreats', alternatives: ['island'] };
  }
  if (temp < 10 || condition.includes('snow') || condition.includes('cold')) {
    return { suggestType: 'beach', reason: 'Warm up with tropical beach getaways', alternatives: ['island', 'luxury'] };
  }
  if (condition.includes('rain')) {
    return { suggestType: 'city', reason: 'Explore vibrant indoor city attractions', alternatives: ['cultural', 'historical'] };
  }
  return { suggestType: 'adventure', reason: 'Perfect weather for outdoor adventures', alternatives: ['mountain', 'island'] };
};

// ---------------------------------------------------------------------------
// Controller functions
// ---------------------------------------------------------------------------

/**
 * @desc    Get trending destinations enriched with images
 * @route   GET /api/discover/trending
 * @access  Public
 */
const getTrending = async (req, res) => {
  try {
    const cacheKey = 'discover:trending';
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = [];
    try {
      const raw = await amadeusService.getTrendingDestinations();
      destinations = (raw || []).map((d) => normalizeDestinationCard(d, 'amadeus'));
    } catch {
      // Fallback to curated trending picks
      destinations = [
        { name: 'Bali', country: 'Indonesia', type: 'island', tags: ['trending', 'culture', 'beach'], popularity: 92 },
        { name: 'Tokyo', country: 'Japan', type: 'city', tags: ['trending', 'food', 'tech'], popularity: 95 },
        { name: 'Barcelona', country: 'Spain', type: 'city', tags: ['trending', 'architecture', 'beach'], popularity: 88 },
        { name: 'Santorini', country: 'Greece', type: 'island', tags: ['trending', 'romance', 'sunsets'], popularity: 90 },
        { name: 'Dubai', country: 'UAE', type: 'luxury', tags: ['trending', 'shopping', 'modern'], popularity: 87 },
        { name: 'Iceland', country: 'Iceland', type: 'adventure', tags: ['trending', 'nature', 'northern-lights'], popularity: 85 },
      ].map((d) => normalizeDestinationCard(d, 'curated'));
    }

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting trending destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get trending destinations' });
  }
};

/**
 * @desc    Get seasonal destination recommendations
 * @route   GET /api/discover/seasonal
 * @access  Public
 * @query   month - Month number (1-12), defaults to current month
 * @query   hemisphere - 'northern' or 'southern', defaults to 'northern'
 */
const getSeasonal = async (req, res) => {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const hemisphere = req.query.hemisphere || 'northern';
    const season = getSeason(month, hemisphere);

    const cacheKey = `discover:seasonal:${month}:${hemisphere}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const seasonData = SEASONAL_SUGGESTIONS[season] || SEASONAL_SUGGESTIONS.summer;
    let destinations = seasonData.destinations.map((d) => normalizeDestinationCard(d, 'curated'));

    // Try enriching with Amadeus trending data for the season
    try {
      const amadeusData = await amadeusService.getTrendingDestinations();
      if (amadeusData && amadeusData.length) {
        const extra = amadeusData
          .slice(0, 3)
          .map((d) => normalizeDestinationCard({ ...d, bestSeason: season }, 'amadeus'));
        destinations = [...destinations, ...extra];
      }
    } catch {
      // Continue with curated data only
    }

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.SEASONAL);

    res.status(200).json({ success: true, data: destinations, meta: { season, month: parseInt(month, 10), hemisphere } });
  } catch (error) {
    console.error('Error getting seasonal destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get seasonal destinations' });
  }
};

/**
 * @desc    Get destinations filtered by daily budget range (USD)
 * @route   GET /api/discover/budget
 * @access  Public
 * @query   min - Minimum daily budget
 * @query   max - Maximum daily budget
 */
const getBudgetDestinations = async (req, res) => {
  try {
    const min = parseFloat(req.query.min) || 0;
    const max = parseFloat(req.query.max) || Infinity;

    const cacheKey = `discover:budget:${min}:${max}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = BUDGET_DESTINATIONS
      .filter((d) => d.estimatedBudget.min >= min && d.estimatedBudget.max <= max)
      .map((d) => normalizeDestinationCard(d, 'curated'));

    // If no matches, return all sorted by budget
    if (!destinations.length) {
      destinations = BUDGET_DESTINATIONS
        .sort((a, b) => a.estimatedBudget.min - b.estimatedBudget.min)
        .map((d) => normalizeDestinationCard(d, 'curated'));
    }

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting budget destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get budget destinations' });
  }
};

/**
 * @desc    Get destinations by category
 * @route   GET /api/discover/category/:category
 * @access  Public
 */
const getCategoryDestinations = async (req, res) => {
  try {
    const { category } = req.params;
    const normalizedCategory = (category || '').toLowerCase();

    const cacheKey = `discover:category:${normalizedCategory}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = (CATEGORY_DESTINATIONS[normalizedCategory] || [])
      .map((d) => normalizeDestinationCard(d, 'curated'));

    // Try to enrich with Google Places data
    try {
      const googleResults = await googleMapsService.searchPlaces(`${normalizedCategory} travel destinations`);
      if (googleResults && googleResults.length) {
        const extra = googleResults.slice(0, 3).map((place) =>
          normalizeDestinationCard({
            id: place.place_id,
            name: place.name,
            city: place.name,
            country: place.formatted_address || '',
            type: normalizedCategory,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            coordinates: place.geometry?.location || {},
          }, 'google')
        );
        destinations = [...destinations, ...extra];
      }
    } catch {
      // Continue with curated data only
    }

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    // If category is unknown, return a helpful message
    if (!destinations.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: `No destinations found for category "${category}". Try: beach, mountain, city, cultural, historical, island, adventure, luxury.`,
      });
    }

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting category destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get category destinations' });
  }
};

/**
 * @desc    Get nearby destinations using Google Places
 * @route   GET /api/discover/nearby
 * @access  Public
 * @query   lat, lng - User coordinates (required)
 */
const getNearbyDestinations = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `discover:nearby:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = [];
    try {
      const places = await googleMapsService.getNearbyPlaces(lat, lng, 50000, 'tourist_attraction');
      destinations = (places || []).map((place) =>
        normalizeDestinationCard({
          id: place.place_id,
          name: place.name,
          city: place.vicinity || '',
          country: '',
          type: 'city',
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          coordinates: place.geometry?.location || { lat: parseFloat(lat), lng: parseFloat(lng) },
          tags: place.types || [],
        }, 'google')
      );
    } catch {
      // Return empty with a helpful message if Google Places fails
      return res.status(200).json({ success: true, data: [], message: 'Could not fetch nearby destinations. Please try again later.' });
    }

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.SEARCH);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting nearby destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get nearby destinations' });
  }
};

/**
 * @desc    Get personalized recommended destinations (trending + seasonal + random category)
 * @route   GET /api/discover/recommended
 * @access  Public
 */
const getRecommendedDestinations = async (req, res) => {
  try {
    const cacheKey = 'discover:recommended';
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    // 1. Get trending picks
    let trending = [];
    try {
      const raw = await amadeusService.getTrendingDestinations();
      trending = (raw || []).slice(0, 3).map((d) => normalizeDestinationCard(d, 'amadeus'));
    } catch {
      trending = [
        normalizeDestinationCard({ name: 'Bali', country: 'Indonesia', type: 'island', tags: ['trending'], popularity: 92 }, 'curated'),
        normalizeDestinationCard({ name: 'Tokyo', country: 'Japan', type: 'city', tags: ['trending'], popularity: 95 }, 'curated'),
      ];
    }

    // 2. Get seasonal picks
    const month = new Date().getMonth() + 1;
    const season = getSeason(month, 'northern');
    const seasonData = SEASONAL_SUGGESTIONS[season] || SEASONAL_SUGGESTIONS.summer;
    const seasonal = seasonData.destinations.slice(0, 3).map((d) => normalizeDestinationCard(d, 'curated'));

    // 3. Get random category picks
    const categories = Object.keys(CATEGORY_DESTINATIONS);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryPicks = (CATEGORY_DESTINATIONS[randomCategory] || [])
      .slice(0, 2)
      .map((d) => normalizeDestinationCard(d, 'curated'));

    // Combine and deduplicate by name
    const seen = new Set();
    let destinations = [...trending, ...seasonal, ...categoryPicks].filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting recommended destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get recommended destinations' });
  }
};

/**
 * @desc    Suggest destinations based on current weather contrast
 * @route   GET /api/discover/weather-based
 * @access  Public
 * @query   lat, lng - User coordinates for weather lookup
 */
const getWeatherBasedDestinations = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `discover:weather:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    // Fetch current weather
    let currentWeather = { temp: 20, condition: 'clear' };
    try {
      currentWeather = await weatherService.getCurrentWeather(lat, lng);
    } catch {
      // Use default weather
    }

    const suggestions = getWeatherSuggestions(currentWeather);
    const allTypes = [suggestions.suggestType, ...(suggestions.alternatives || [])];

    // Gather destinations from categories that match the suggestion
    let destinations = [];
    for (const type of allTypes) {
      const picks = (CATEGORY_DESTINATIONS[type] || []).map((d) => normalizeDestinationCard(d, 'curated'));
      destinations = [...destinations, ...picks];
    }

    // Deduplicate by name
    const seen = new Set();
    destinations = destinations.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.WEATHER);

    res.status(200).json({
      success: true,
      data: destinations,
      meta: {
        currentWeather,
        suggestion: suggestions.reason,
        suggestedType: suggestions.suggestType,
      },
    });
  } catch (error) {
    console.error('Error getting weather-based destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get weather-based destinations' });
  }
};

/**
 * @desc    Natural language smart search — uses Gemini to parse query into structured filters
 * @route   GET /api/discover/search
 * @access  Public
 * @query   q - Natural language query string
 */
const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    const cacheKey = `discover:smartsearch:${q}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    // Ask Gemini to parse the natural language query into structured filters
    const parsePrompt = `Parse the following travel search query into JSON filters. Return ONLY valid JSON, no markdown or explanation.
Fields: category (beach|mountain|city|cultural|historical|island|adventure|luxury), season (winter|spring|summer|fall), budget (low|medium|high), specific_destination (string or null).
Budget mapping: low = $0-50/day, medium = $50-150/day, high = $150+/day.
Query: "${q}"
Example output: {"category":"beach","season":"winter","budget":"low","specific_destination":null}`;

    let filters = {};
    try {
      const aiResponse = await getChatbotResponse(parsePrompt);
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        filters = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If AI parsing fails, do a basic keyword match
      const lq = q.toLowerCase();
      if (lq.includes('beach')) filters.category = 'beach';
      else if (lq.includes('mountain')) filters.category = 'mountain';
      else if (lq.includes('city')) filters.category = 'city';
      else if (lq.includes('culture') || lq.includes('cultural')) filters.category = 'cultural';
      else if (lq.includes('adventure')) filters.category = 'adventure';
      else if (lq.includes('luxury')) filters.category = 'luxury';

      if (lq.includes('winter')) filters.season = 'winter';
      else if (lq.includes('summer')) filters.season = 'summer';
      else if (lq.includes('spring')) filters.season = 'spring';
      else if (lq.includes('fall') || lq.includes('autumn')) filters.season = 'fall';

      if (lq.includes('cheap') || lq.includes('budget') || lq.includes('affordable')) filters.budget = 'low';
      else if (lq.includes('luxury') || lq.includes('expensive')) filters.budget = 'high';
    }

    let destinations = [];

    // 1. Category filter
    if (filters.category && CATEGORY_DESTINATIONS[filters.category]) {
      destinations = CATEGORY_DESTINATIONS[filters.category].map((d) => normalizeDestinationCard(d, 'curated'));
    }

    // 2. Season filter
    if (filters.season && SEASONAL_SUGGESTIONS[filters.season]) {
      const seasonDests = SEASONAL_SUGGESTIONS[filters.season].destinations
        .map((d) => normalizeDestinationCard(d, 'curated'));
      destinations = destinations.length
        ? destinations.filter((d) => seasonDests.some((sd) => sd.type === d.type) || true)
        : seasonDests;
    }

    // 3. Budget filter
    if (filters.budget) {
      const budgetRanges = { low: { min: 0, max: 50 }, medium: { min: 50, max: 150 }, high: { min: 150, max: 99999 } };
      const range = budgetRanges[filters.budget] || budgetRanges.medium;
      const budgetDests = BUDGET_DESTINATIONS
        .filter((d) => d.estimatedBudget.min >= range.min && d.estimatedBudget.max <= range.max)
        .map((d) => normalizeDestinationCard(d, 'curated'));
      if (budgetDests.length) {
        destinations = destinations.length ? [...destinations, ...budgetDests] : budgetDests;
      }
    }

    // 4. If specific destination mentioned, add it
    if (filters.specific_destination) {
      destinations.unshift(
        normalizeDestinationCard({ name: filters.specific_destination, type: filters.category || 'city', tags: ['search-result'] }, 'curated')
      );
    }

    // Fallback — if nothing matched, return general trending
    if (!destinations.length) {
      destinations = [
        { name: 'Bali', country: 'Indonesia', type: 'island', tags: ['popular'], popularity: 92 },
        { name: 'Paris', country: 'France', type: 'city', tags: ['popular'], popularity: 96 },
        { name: 'Tokyo', country: 'Japan', type: 'city', tags: ['popular'], popularity: 95 },
        { name: 'Barcelona', country: 'Spain', type: 'city', tags: ['popular'], popularity: 88 },
      ].map((d) => normalizeDestinationCard(d, 'curated'));
    }

    // Deduplicate
    const seen = new Set();
    destinations = destinations.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    cache.set(cacheKey, destinations, CACHE_TTL.SEARCH);

    res.status(200).json({ success: true, data: destinations, meta: { query: q, parsedFilters: filters } });
  } catch (error) {
    console.error('Error with smart search:', error.message);
    res.status(500).json({ success: false, message: 'Failed to perform smart search' });
  }
};

module.exports = {
  getTrending,
  getSeasonal,
  getBudgetDestinations,
  getCategoryDestinations,
  getNearbyDestinations,
  getRecommendedDestinations,
  getWeatherBasedDestinations,
  smartSearch,
};
