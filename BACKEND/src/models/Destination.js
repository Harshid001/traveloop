const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  photographer: { type: String, default: '' },
  photographerUrl: { type: String, default: '' },
  source: { type: String, enum: ['unsplash', 'google', 'tripadvisor', 'manual'], default: 'manual' },
  attribution: { type: String, default: '' },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
}, { _id: false });

const nearbyAttractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: '' },
  placeId: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  rating: { type: Number, default: 0 },
  distance: { type: String, default: '' },
  photo: { type: String, default: '' },
}, { _id: false });

const destinationSchema = new mongoose.Schema(
  {
    // Core identity
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    city: { type: String, default: '' },
    description: { type: String, default: '' },
    overview: { type: String, default: '' },

    // Legacy single-image field (kept for backward compatibility)
    image: { type: String, default: '' },
    // New: array of rich image objects from Unsplash/Google/TripAdvisor
    images: { type: [imageSchema], default: [] },

    // Classification
    category: { type: String, default: 'Sightseeing' },
    categories: { type: [String], default: [] }, // e.g., ['beach', 'luxury', 'family']
    type: { type: String, default: '' }, // beach, mountain, city, cultural, historical, island, adventure
    tags: { type: [String], default: [] },

    // Ratings & popularity
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 50, min: 0, max: 100 }, // 1-100 score

    // Budget
    budgetEstimate: { type: Number, default: 0 }, // legacy field
    estimatedBudget: {
      budget: { type: Number, default: 0 },   // backpacker/budget range
      mid: { type: Number, default: 0 },       // mid-range
      luxury: { type: Number, default: 0 },    // luxury range
      currency: { type: String, default: 'USD' },
    },

    // Location & coordinates
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    // Timing & seasons
    bestTimeToVisit: { type: String, default: '' },
    bestMonths: { type: [Number], default: [] }, // month numbers 1-12
    duration: { type: String, default: '' }, // suggested trip duration e.g. "5-7 days"
    seasonalData: {
      spring: { weather: { type: String, default: '' }, crowd: { type: String, default: '' }, price: { type: String, default: '' } },
      summer: { weather: { type: String, default: '' }, crowd: { type: String, default: '' }, price: { type: String, default: '' } },
      fall: { weather: { type: String, default: '' }, crowd: { type: String, default: '' }, price: { type: String, default: '' } },
      winter: { weather: { type: String, default: '' }, crowd: { type: String, default: '' }, price: { type: String, default: '' } },
    },

    // Weather
    weather: {
      summary: { type: String, default: '' },
      avgTemp: { type: Number, default: 0 },
      condition: { type: String, default: '' },
    },

    // Activities & attractions
    activities: { type: [Object], default: [] },
    foodRecommendations: { type: [String], default: [] },
    nearbyAttractions: { type: [nearbyAttractionSchema], default: [] },
    highlights: { type: [String], default: [] },

    // External API cross-references
    googlePlaceId: { type: String, default: '', index: true },
    amadeusCode: { type: String, default: '' }, // IATA city code
    tripadvisorId: { type: String, default: '' },

    // Data source tracking
    source: {
      type: String,
      enum: ['manual', 'amadeus', 'google', 'tripadvisor', 'curated'],
      default: 'manual',
    },
    lastEnriched: { type: Date, default: null }, // when live API data was last fetched

    // Legacy field
    hotelsPlaceholder: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Text index for full-text search across key fields
destinationSchema.index({
  name: 'text',
  city: 'text',
  country: 'text',
  description: 'text',
  tags: 'text',
  categories: 'text',
});

// Compound index for category + rating queries
destinationSchema.index({ category: 1, rating: -1 });
destinationSchema.index({ type: 1, popularity: -1 });

module.exports = mongoose.model('Destination', destinationSchema);
