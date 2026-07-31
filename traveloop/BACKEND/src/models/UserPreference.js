const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Aggregated from user behavior
    favoriteCategories: {
      type: [String],
      default: [], // e.g., ['beach', 'mountain', 'cultural']
    },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 5000 },
      currency: { type: String, default: 'USD' },
    },
    preferredSeasons: {
      type: [String],
      default: [], // e.g., ['summer', 'winter']
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'backpacker', 'balanced', ''],
      default: '',
    },
    preferredDuration: {
      type: String,
      enum: ['weekend', 'short', 'medium', 'long', ''],
      default: '', // weekend=2-3d, short=4-5d, medium=6-10d, long=10+d
    },
    // Track visited destinations for "don't suggest again" logic
    visitedDestinations: [{
      destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      googlePlaceId: { type: String, default: '' },
      visitDate: { type: Date, default: Date.now },
    }],
    // Patterns mined from search history
    searchPatterns: {
      topSearchTerms: { type: [String], default: [] },
      topCategories: { type: [String], default: [] },
      avgBudget: { type: Number, default: 0 },
      searchCount: { type: Number, default: 0 },
    },
    // User's last known location (for nearby recommendations)
    lastLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    },
    // AI recommendation tracking
    lastRecommendationAt: { type: Date, default: null },
    recommendationFeedback: [{
      destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      action: { type: String, enum: ['viewed', 'saved', 'dismissed', 'booked'] },
      timestamp: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
