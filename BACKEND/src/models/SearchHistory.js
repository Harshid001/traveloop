const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: { type: String, required: true, trim: true },
    filters: {
      category: { type: String, default: '' },
      budget: { type: String, default: '' },
      season: { type: String, default: '' },
      type: { type: String, default: '' },
    },
    resultCount: { type: Number, default: 0 },
    selectedDestination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    selectedPlaceId: { type: String, default: '' }, // Google Place ID if selected
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying recent searches by user, ordered by recency
searchHistorySchema.index({ user: 1, createdAt: -1 });

// Auto-cleanup: searches older than 90 days
searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
