const mongoose = require('mongoose');

const savedPlaceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['destination', 'hotel', 'restaurant', 'activity', 'other'],
      default: 'destination',
    },
    image: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedPlace', savedPlaceSchema);
