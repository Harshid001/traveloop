const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: String, default: '' },
    tripTitle: { type: String, required: true },
    travelers: { type: Number, default: 1, min: 1 },
    travelDate: { type: String, required: true },
    phone: { type: String, required: true },
    pickupCity: { type: String, default: '' },
    note: { type: String, default: '' },
    price: { type: String, default: '' },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'cancelled', 'completed'],
      default: 'requested',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Booking', bookingSchema);
