const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: {
      type: String,
      enum: ['destination', 'trip', 'activity', 'hotel'],
      default: 'destination',
    },
    itemId: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SavedItem', savedItemSchema);
