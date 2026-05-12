const mongoose = require('mongoose');

const packingItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'general',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    packed: {
      type: Boolean,
      default: false,
    },
    important: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PackingItem', packingItemSchema);
