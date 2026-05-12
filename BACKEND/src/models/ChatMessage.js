const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest users to have ephemeral or no history saved
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system', 'model'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    suggestions: {
      type: [String],
      default: [],
    },
    meta: {
      type: Object,
      default: {},
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
