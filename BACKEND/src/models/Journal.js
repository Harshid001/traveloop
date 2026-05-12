const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      // Allow journals without a trip if needed, but required per spec. 
      // If optional, we can remove `required: true`. Let's keep it optional just in case.
      required: false, 
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
    mood: {
      type: String,
      default: 'happy',
    },
    isPrivate: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Journal', journalSchema);
