const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destinationId: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String, default: '' },
    country: { type: String, default: '' },
    location: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    price: { type: String, default: '' },
    budgetAmount: { type: Number, default: 0 },
    type: { type: String, default: 'city' },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

wishlistSchema.index({ user: 1, destinationId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
