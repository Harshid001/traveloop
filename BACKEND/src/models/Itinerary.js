const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, default: '' },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0 },
  category: { type: String, default: 'other' }, // e.g., food, transport, activity, accommodation
  completed: { type: Boolean, default: false }
});

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  title: { type: String, default: '' },
  activities: [activitySchema]
});

const itinerarySchema = new mongoose.Schema(
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
      unique: true // One itinerary per trip conceptually, or we can handle multiple but specs imply 1-to-1 or just by tripId
    },
    days: [daySchema]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
