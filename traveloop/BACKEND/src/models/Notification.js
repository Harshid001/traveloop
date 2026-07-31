const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'trip',
        'packing',
        'budget',
        'itinerary',
        'saved',
        'system',
        'booking',
        'price drop',
        'budget alert',
        'itinerary reminder',
        'packing reminder',
        'system update',
      ],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    actionUrl: { type: String, default: '' },
    scheduledFor: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Notification', notificationSchema);
