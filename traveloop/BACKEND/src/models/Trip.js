const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title for the trip'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination'],
    },
    destinations: {
      type: [String],
      default: [],
    },
    selectedDestinations: {
      type: [Object],
      default: [],
    },
    selectedActivities: {
      type: Object,
      default: {},
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    travelers: {
      type: Number,
      default: 1,
    },
    budget: {
      type: Number,
      default: 0,
    },
    budgetRange: {
      type: String,
      default: '',
    },
    tripType: {
      type: String,
      enum: ['Solo', 'Couple', 'Family', 'Friends', 'Business', 'Adventure', 'Luxury', 'Budget', ''],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'planning', 'upcoming', 'active', 'ongoing', 'completed', 'cancelled'],
      default: 'planning',
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    // Last time a trip-date reminder email was sent (trip reminders)
    lastReminderDate: {
      type: Date,
      default: null,
    },
    // Public share identifier for read‑only itinerary links
    shareId: {
      type: String,
      default: require('uuid').v4,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ user: 1, startDate: -1 });
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);