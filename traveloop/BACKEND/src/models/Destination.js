const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  photographer: { type: String, default: '' },
  photographerUrl: { type: String, default: '' },
  source: { type: String, enum: ['unsplash', 'google', 'tripadvisor', 'manual'], default: 'manual' },
  attribution: { type: String, default: '' },
}, { _id: false });

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    city: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: { type: [imageSchema], default: [] },
    type: { type: String, default: '' },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 50, min: 0, max: 100 },
    estimatedBudget: {
      budget: { type: Number, default: 0 },
      mid: { type: Number, default: 0 },
      luxury: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    bestTimeToVisit: { type: String, default: '' },
    bestMonths: { type: [Number], default: [] },
    activities: { type: [Object], default: [] },
    foodRecommendations: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    source: {
      type: String,
      enum: ['manual', 'amadeus', 'google', 'tripadvisor', 'curated', 'wikidata'],
      default: 'manual',
    },
    lastEnriched: { type: Date, default: null },
  },
  { timestamps: true },
);

destinationSchema.index({
  name: 'text',
  city: 'text',
  country: 'text',
  description: 'text',
  tags: 'text',
});

destinationSchema.index({ type: 1, rating: -1 });
destinationSchema.index({ type: 1, popularity: -1 });

module.exports = mongoose.model('Destination', destinationSchema);