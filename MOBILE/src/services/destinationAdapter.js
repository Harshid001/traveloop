/**
 * Destination data adapter for Traveloop mobile app.
 * Normalizes API responses from different sources (backend proxy for Google Places,
 * Amadeus, TripAdvisor, Unsplash) into unified data shapes used by UI components.
 */

import { destinations as fallbackDestinations } from '../constants/data';

/**
 * Default fallback image when no image is available.
 */
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format';

/**
 * Normalize any API destination response into the standard destination card shape
 * used by FeaturedDestinationCard, DestinationCard, and list components.
 *
 * @param {object} raw - Raw API response object (from any source)
 * @returns {object} Normalized destination card data
 */
export const toDestinationCard = (raw) => {
  if (!raw) return null;

  // Determine the best image URL
  const image = resolveImage(raw);

  return {
    id: raw._id || raw.id || raw.placeId || raw.googlePlaceId || generateId(),
    placeId: raw.placeId || raw.googlePlaceId || '',

    // Identity
    name: raw.name || raw.title || 'Unknown Destination',
    title: raw.title || raw.name || 'Unknown Destination',
    city: raw.city || raw.location?.city || extractCity(raw) || '',
    country: raw.country || raw.location?.country || extractCountry(raw) || '',
    location: raw.city
      ? `${raw.city}, ${raw.country || ''}`
      : raw.location || raw.address || '',

    // Classification
    type: raw.type || raw.category || inferType(raw) || 'sightseeing',
    category: raw.category || raw.type || 'Sightseeing',
    categories: raw.categories || raw.tags || [],
    tags: raw.tags || raw.categories || [],

    // Visual
    image,
    images: normalizeImages(raw),

    // Ratings
    rating: raw.rating || raw.score || 4.5,
    reviewCount: raw.reviewCount || raw.userRatingsTotal || raw.reviews?.length || 0,
    popularity: raw.popularity || 50,

    // Budget
    price: raw.price || formatBudget(raw),
    budgetAmount: raw.budgetAmount || raw.budgetEstimate || raw.estimatedBudget?.mid || 0,
    estimatedBudget: raw.estimatedBudget || {
      budget: raw.budgetEstimate || 0,
      mid: raw.budgetEstimate ? Math.round(raw.budgetEstimate * 1.5) : 0,
      luxury: raw.budgetEstimate ? Math.round(raw.budgetEstimate * 3) : 0,
      currency: 'USD',
    },

    // Timing
    duration: raw.duration || raw.suggestedDuration || '',
    bestTime: raw.bestTimeToVisit || raw.bestTime || raw.bestSeason || '',
    bestMonths: raw.bestMonths || [],

    // Weather
    weather: raw.weather || { summary: '', condition: '', temp: null },

    // Content
    description: raw.description || raw.overview || '',
    highlights: raw.highlights || raw.activities || [],
    facilities: raw.facilities || ['Hotel', 'Meals', 'Guide', 'Transfers'],
    activities: raw.activities || [],
    nearbyAttractions: raw.nearbyAttractions || [],

    // Coordinates
    coordinates: {
      lat: raw.coordinates?.lat || raw.location?.lat || raw.lat || 0,
      lng: raw.coordinates?.lng || raw.location?.lng || raw.lng || 0,
    },

    // Source tracking
    source: raw.source || 'unknown',
  };
};

/**
 * Normalize for the detail view (more comprehensive data).
 * @param {object} raw - Raw API response
 * @returns {object} Detailed destination data
 */
export const toDetailView = (raw) => {
  const card = toDestinationCard(raw);
  return {
    ...card,
    overview: raw.overview || raw.description || '',
    gallery: normalizeImages(raw),
    reviews: normalizeReviews(raw.reviews || []),
    seasonalData: raw.seasonalData || null,
    foodRecommendations: raw.foodRecommendations || [],
    openingHours: raw.openingHours || null,
    website: raw.website || '',
    phone: raw.phone || '',
    tripadvisorId: raw.tripadvisorId || '',
    googlePlaceId: raw.googlePlaceId || raw.placeId || '',
  };
};

/**
 * Normalize for map marker display.
 * @param {object} raw - Raw API response
 * @returns {object} Map marker data
 */
export const toMapMarker = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id || raw.placeId || generateId(),
    placeId: raw.placeId || raw.googlePlaceId || '',
    title: raw.name || raw.title || 'Unknown',
    description: raw.type || raw.category || '',
    coordinate: {
      latitude: raw.coordinates?.lat || raw.location?.lat || raw.lat || 0,
      longitude: raw.coordinates?.lng || raw.location?.lng || raw.lng || 0,
    },
    type: raw.type || raw.placeType || 'default',
    rating: raw.rating || null,
    image: resolveImage(raw),
  };
};

/**
 * Convert an attraction API response into a card shape.
 * @param {object} raw - Raw attraction data
 * @returns {object} Attraction card data
 */
export const toAttractionCard = (raw) => {
  if (!raw) return null;
  return {
    id: raw.placeId || raw._id || raw.id || generateId(),
    placeId: raw.placeId || '',
    name: raw.name || 'Unknown Attraction',
    type: raw.type || raw.placeType || raw.types?.[0] || 'attraction',
    rating: raw.rating || null,
    reviewCount: raw.userRatingsTotal || raw.reviewCount || 0,
    distance: raw.distance || '',
    address: raw.address || raw.formattedAddress || '',
    photo: raw.photo || raw.photos?.[0]?.url || resolveImage(raw),
    coordinates: {
      lat: raw.coordinates?.lat || raw.lat || 0,
      lng: raw.coordinates?.lng || raw.lng || 0,
    },
    openingHours: raw.openingHours || null,
  };
};

/**
 * Batch normalize an array of destinations.
 * @param {array} items - Array of raw destination data
 * @returns {array} Array of normalized destination cards
 */
export const normalizeDestinations = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(toDestinationCard).filter(Boolean);
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Resolve the best available image URL */
const resolveImage = (raw) => {
  // Direct image field
  if (raw.image && typeof raw.image === 'string' && raw.image.startsWith('http')) {
    return raw.image;
  }
  // Images array
  if (raw.images?.length > 0) {
    const first = raw.images[0];
    return first.url || first.regular || first.small || first;
  }
  // Image object with size variants
  if (raw.image?.url) return raw.image.url;
  if (raw.image?.regular) return raw.image.regular;
  // Photos array (Google Places style)
  if (raw.photos?.length > 0) {
    return raw.photos[0].url || raw.photos[0];
  }
  return FALLBACK_IMAGE;
};

/** Normalize images array from various sources */
const normalizeImages = (raw) => {
  const images = [];

  // From images array
  if (raw.images?.length > 0) {
    raw.images.forEach((img) => {
      images.push({
        url: img.url || img.regular || img,
        thumbnail: img.thumbnail || img.small || img.thumb || img.url || img,
        photographer: img.photographer || '',
        attribution: img.attribution || '',
        source: img.source || 'unknown',
      });
    });
  }

  // From gallery array
  if (raw.gallery?.length > 0 && images.length === 0) {
    raw.gallery.forEach((url) => {
      images.push({
        url: typeof url === 'string' ? url : url.url || '',
        thumbnail: typeof url === 'string' ? url : url.thumbnail || url.url || '',
        photographer: '',
        attribution: '',
        source: 'manual',
      });
    });
  }

  // Fallback to single image
  if (images.length === 0) {
    const img = resolveImage(raw);
    if (img !== FALLBACK_IMAGE) {
      images.push({
        url: img,
        thumbnail: img,
        photographer: '',
        attribution: '',
        source: 'manual',
      });
    }
  }

  return images;
};

/** Normalize reviews array */
const normalizeReviews = (reviews) => {
  if (!Array.isArray(reviews)) return [];
  return reviews.map((r) => ({
    id: r._id || r.id || generateId(),
    author: r.author || r.authorName || r.author_name || 'Traveler',
    rating: r.rating || 0,
    text: r.text || r.content || r.body || '',
    date: r.time || r.date || r.publishedDate || '',
    source: r.source || 'google',
  }));
};

/** Extract city from address or other fields */
const extractCity = (raw) => {
  if (raw.address) {
    const parts = raw.address.split(',').map((s) => s.trim());
    return parts.length > 1 ? parts[parts.length - 2] : '';
  }
  return '';
};

/** Extract country from address or other fields */
const extractCountry = (raw) => {
  if (raw.address) {
    const parts = raw.address.split(',').map((s) => s.trim());
    return parts[parts.length - 1] || '';
  }
  return '';
};

/** Infer destination type from tags/types */
const inferType = (raw) => {
  const allTypes = [...(raw.types || []), ...(raw.tags || []), ...(raw.categories || [])];
  const typeStr = allTypes.join(' ').toLowerCase();

  if (typeStr.includes('beach') || typeStr.includes('coast')) return 'beach';
  if (typeStr.includes('mountain') || typeStr.includes('ski') || typeStr.includes('alpine')) return 'mountain';
  if (typeStr.includes('city') || typeStr.includes('urban') || typeStr.includes('metropolitan')) return 'city';
  if (typeStr.includes('cultural') || typeStr.includes('heritage') || typeStr.includes('temple')) return 'cultural';
  if (typeStr.includes('historical') || typeStr.includes('ruins') || typeStr.includes('ancient')) return 'historical';
  if (typeStr.includes('island')) return 'island';
  if (typeStr.includes('adventure') || typeStr.includes('trek') || typeStr.includes('hiking')) return 'adventure';
  if (typeStr.includes('nature') || typeStr.includes('forest') || typeStr.includes('wildlife')) return 'nature';
  return '';
};

/** Format budget for display */
const formatBudget = (raw) => {
  const amount = raw.budgetEstimate || raw.estimatedBudget?.mid || raw.price;
  if (!amount || amount === 0) return '';
  if (typeof amount === 'string') return amount;
  return `$${amount.toLocaleString()}`;
};

/** Generate a simple unique ID */
let idCounter = 0;
const generateId = () => `dest_${Date.now()}_${++idCounter}`;
