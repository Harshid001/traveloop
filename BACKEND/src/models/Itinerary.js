const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, default: '' },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0 },
  category: { type: String, default: 'other' }, // e.g., food, transport, activity, accommodation
  completed: { type: Boolean, default: false },
  // Google Places integration
  googlePlaceId: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  travelTimeFromPrevious: { type: Number, default: null }, // minutes
  travelDistanceFromPrevious: { type: Number, default: null }, // km
  placeType: { type: String, default: '' }, // Google Places type e.g., restaurant, museum, park
  photo: { type: String, default: '' }, // place photo URL
  address: { type: String, default: '' }, // formatted address from Google
  rating: { type: Number, default: null }, // place rating
  duration: { type: Number, default: 60 }, // estimated minutes at this place
});

const daySchema = new mongoose.Schema({
  clientId: { type: String, default: '' },
  dayNumber: { type: Number, default: 1 },
  date: { type: String, default: '' },
  title: { type: String, default: '' },
  stops: { type: [String], default: [] },
  timeSlots: { type: [String], default: [] },
  notes: { type: String, default: '' },
  cost: { type: Number, default: 0 },
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
