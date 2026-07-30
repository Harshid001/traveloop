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

const getSeason = (month, hemisphere = 'northern') => {
  const m = parseInt(month, 10);
  const seasonMap = { northern: {}, southern: {} };
  for (const [season, data] of Object.entries(SEASONAL_SUGGESTIONS)) {
    data.months.forEach((mo) => { seasonMap.northern[mo] = season; });
  }
  seasonMap.southern = {
    12: 'summer', 1: 'summer', 2: 'summer',
    3: 'fall', 4: 'fall', 5: 'fall',
    6: 'winter', 7: 'winter', 8: 'winter',
    9: 'spring', 10: 'spring', 11: 'spring',
  };
  return (seasonMap[hemisphere] || seasonMap.northern)[m] || 'summer';
};

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
  SEASONAL_SUGGESTIONS,
  getSeason,
  BUDGET_DESTINATIONS,
  CATEGORY_DESTINATIONS,
  getWeatherSuggestions,
  amadeusService,
  googleMapsService,
  weatherService,
  getChatbotResponse,
};