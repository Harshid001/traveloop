const amadeusService = require('./amadeusService');
const unsplashService = require('./unsplashService');
const googleMapsService = require('./googleMapsService');
const weatherService = require('./weatherService');
const { getChatbotResponse } = require('./chatbotService');

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
      } catch (err) {
        console.error('discoverService: enrichWithImages failed for', dest.name || dest.city, err.message);
        return dest;
      }
    })
  );
  return enriched;
};

const getSeason = (month, hemisphere = 'northern') => {
  const m = parseInt(month, 10);
  const northern = {
    12: 'winter', 1: 'winter', 2: 'winter',
    3: 'spring', 4: 'spring', 5: 'spring',
    6: 'summer', 7: 'summer', 8: 'summer',
    9: 'fall', 10: 'fall', 11: 'fall',
  };
  const southern = {
    12: 'summer', 1: 'summer', 2: 'summer',
    3: 'fall', 4: 'fall', 5: 'fall',
    6: 'winter', 7: 'winter', 8: 'winter',
    9: 'spring', 10: 'spring', 11: 'spring',
  };
  return (hemisphere === 'southern' ? southern : northern)[m] || 'summer';
};

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

module.exports = {
  normalizeDestinationCard,
  enrichWithImages,
  getSeason,
  getWeatherSuggestions,
  amadeusService,
  googleMapsService,
  weatherService,
  getChatbotResponse,
};