const {
  normalizeDestinationCard,
  enrichWithImages,
  SEASONAL_SUGGESTIONS,
  getSeason,
  BUDGET_DESTINATIONS,
  CATEGORY_DESTINATIONS,
  getWeatherSuggestions,
  amadeusService,
  googleMapsService,
  weatherService,
  getChatbotResponse,
} = require('../services/discoverService');
const { cache, CACHE_TTL } = require('../services/cacheService');

const getTrending = async (req, res) => {
  try {
    const cacheKey = 'discover:trending';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = [];
    try {
      const raw = await amadeusService.getTrendingDestinations();
      destinations = (raw || []).map((d) => normalizeDestinationCard(d, 'amadeus'));
    } catch (err) {
      console.error('Amadeus trending destinations failed, using curated fallback:', err.message);
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
    await cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting trending destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get trending destinations' });
  }
};

const getSeasonal = async (req, res) => {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const hemisphere = req.query.hemisphere || 'northern';
    const season = getSeason(month, hemisphere);

    const cacheKey = `discover:seasonal:${month}:${hemisphere}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const seasonData = SEASONAL_SUGGESTIONS[season] || SEASONAL_SUGGESTIONS.summer;
    let destinations = seasonData.destinations.map((d) => normalizeDestinationCard(d, 'curated'));

    try {
      const amadeusData = await amadeusService.getTrendingDestinations();
      if (amadeusData && amadeusData.length) {
        const extra = amadeusData
          .slice(0, 3)
          .map((d) => normalizeDestinationCard({ ...d, bestSeason: season }, 'amadeus'));
        destinations = [...destinations, ...extra];
      }
    } catch (err) {
      console.error('Amadeus enrichment for seasonal destinations failed:', err.message);
    }

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.SEASONAL);

    res.status(200).json({ success: true, data: destinations, meta: { season, month: parseInt(month, 10), hemisphere } });
  } catch (error) {
    console.error('Error getting seasonal destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get seasonal destinations' });
  }
};

const getBudgetDestinations = async (req, res) => {
  try {
    const min = parseFloat(req.query.min) || 0;
    const max = parseFloat(req.query.max) || Infinity;

    const cacheKey = `discover:budget:${min}:${max}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = BUDGET_DESTINATIONS
      .filter((d) => d.estimatedBudget.min >= min && d.estimatedBudget.max <= max)
      .map((d) => normalizeDestinationCard(d, 'curated'));

    if (!destinations.length) {
      destinations = BUDGET_DESTINATIONS
        .sort((a, b) => a.estimatedBudget.min - b.estimatedBudget.min)
        .map((d) => normalizeDestinationCard(d, 'curated'));
    }

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting budget destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get budget destinations' });
  }
};

const getCategoryDestinations = async (req, res) => {
  try {
    const { category } = req.params;
    const normalizedCategory = (category || '').toLowerCase();

    const cacheKey = `discover:category:${normalizedCategory}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let destinations = (CATEGORY_DESTINATIONS[normalizedCategory] || [])
      .map((d) => normalizeDestinationCard(d, 'curated'));

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
    } catch (err) {
      console.error('Google Places category search failed:', err.message);
    }

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

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

const getNearbyDestinations = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `discover:nearby:${lat}:${lng}`;
    const cached = await cache.get(cacheKey);
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
    } catch (err) {
      console.error('Google Places nearby search failed:', err.message);
      return res.status(200).json({ success: true, data: [], message: 'Could not fetch nearby destinations. Please try again later.' });
    }

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.SEARCH);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting nearby destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get nearby destinations' });
  }
};

const getRecommendedDestinations = async (req, res) => {
  try {
    const cacheKey = 'discover:recommended';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let trending = [];
    try {
      const raw = await amadeusService.getTrendingDestinations();
      trending = (raw || []).slice(0, 3).map((d) => normalizeDestinationCard(d, 'amadeus'));
    } catch (err) {
      console.error('Amadeus recommended destinations failed:', err.message);
      trending = [
        normalizeDestinationCard({ name: 'Bali', country: 'Indonesia', type: 'island', tags: ['trending'], popularity: 92 }, 'curated'),
        normalizeDestinationCard({ name: 'Tokyo', country: 'Japan', type: 'city', tags: ['trending'], popularity: 95 }, 'curated'),
      ];
    }

    const month = new Date().getMonth() + 1;
    const season = getSeason(month, 'northern');
    const seasonData = SEASONAL_SUGGESTIONS[season] || SEASONAL_SUGGESTIONS.summer;
    const seasonal = seasonData.destinations.slice(0, 3).map((d) => normalizeDestinationCard(d, 'curated'));

    const categories = Object.keys(CATEGORY_DESTINATIONS);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryPicks = (CATEGORY_DESTINATIONS[randomCategory] || [])
      .slice(0, 2)
      .map((d) => normalizeDestinationCard(d, 'curated'));

    const seen = new Set();
    let destinations = [...trending, ...seasonal, ...categoryPicks].filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.TRENDING);

    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error getting recommended destinations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get recommended destinations' });
  }
};

const getWeatherBasedDestinations = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Query parameters "lat" and "lng" are required' });
    }

    const cacheKey = `discover:weather:${lat}:${lng}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    let currentWeather = { temp: 20, condition: 'clear' };
    try {
      currentWeather = await weatherService.getCurrentWeather(lat, lng);
    } catch (err) {
      console.error('Weather service failed, using default weather:', err.message);
    }

    const suggestions = getWeatherSuggestions(currentWeather);
    const allTypes = [suggestions.suggestType, ...(suggestions.alternatives || [])];

    let destinations = [];
    for (const type of allTypes) {
      const picks = (CATEGORY_DESTINATIONS[type] || []).map((d) => normalizeDestinationCard(d, 'curated'));
      destinations = [...destinations, ...picks];
    }

    const seen = new Set();
    destinations = destinations.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.WEATHER);

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

const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    const cacheKey = `discover:smartsearch:${q}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const parsePrompt = `Parse the following travel search query into JSON filters. Return ONLY valid JSON, no markdown or explanation.
Fields: category (beach|mountain|city|cultural|historical|island|adventure|luxury), season (winter|spring|summer|fall), budget (low|medium|high), specific_destination (string or null).
Budget mapping: low = $0-50/day, medium = $50-150/day, high = $150+/day.
Query: "${q}"
Example output: {"category":"beach","season":"winter","budget":"low","specific_destination":null}`;

    let filters = {};
    try {
      const aiResponse = await getChatbotResponse(parsePrompt);
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        filters = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('AI smart search parsing failed, using keyword fallback:', err.message);
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

    if (filters.category && CATEGORY_DESTINATIONS[filters.category]) {
      destinations = CATEGORY_DESTINATIONS[filters.category].map((d) => normalizeDestinationCard(d, 'curated'));
    }

    if (filters.season && SEASONAL_SUGGESTIONS[filters.season]) {
      const seasonDests = SEASONAL_SUGGESTIONS[filters.season].destinations
        .map((d) => normalizeDestinationCard(d, 'curated'));
      destinations = destinations.length
        ? destinations.filter((d) => seasonDests.some((sd) => sd.type === d.type) || true)
        : seasonDests;
    }

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

    if (filters.specific_destination) {
      destinations.unshift(
        normalizeDestinationCard({ name: filters.specific_destination, type: filters.category || 'city', tags: ['search-result'] }, 'curated')
      );
    }

    if (!destinations.length) {
      destinations = [
        { name: 'Bali', country: 'Indonesia', type: 'island', tags: ['popular'], popularity: 92 },
        { name: 'Paris', country: 'France', type: 'city', tags: ['popular'], popularity: 96 },
        { name: 'Tokyo', country: 'Japan', type: 'city', tags: ['popular'], popularity: 95 },
        { name: 'Barcelona', country: 'Spain', type: 'city', tags: ['popular'], popularity: 88 },
      ].map((d) => normalizeDestinationCard(d, 'curated'));
    }

    const seen = new Set();
    destinations = destinations.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    destinations = await enrichWithImages(destinations);
    await cache.set(cacheKey, destinations, CACHE_TTL.SEARCH);

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