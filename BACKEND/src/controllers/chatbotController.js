const asyncHandler = require('../utils/asyncHandler');
const { getChatbotResponse } = require('../services/chatbotService');
const ChatMessage = require('../models/ChatMessage');

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
const processMessage = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Get AI Response
  const reply = await getChatbotResponse(message, history || []);

  // Format expected by frontend:
  // { reply: "...", suggestions: [], meta: {} }
  
  const responsePayload = {
    reply,
    suggestions: [
      "Suggest a 3-day itinerary for Paris",
      "How can I save money on flights?",
      "What should I pack for a beach vacation?"
    ],
    meta: {
      timestamp: new Date()
    }
  };

  // If user is authenticated, save the history
  if (req.user) {
    try {
      // Save User Message
      await ChatMessage.create({
        user: req.user._id,
        role: 'user',
        content: message
      });

      // Save Assistant Response
      await ChatMessage.create({
        user: req.user._id,
        role: 'assistant',
        content: reply,
        suggestions: responsePayload.suggestions,
        meta: responsePayload.meta
      });
    } catch (err) {
      console.error("Error saving chat history", err);
    }
  }

  res.status(200).json(responsePayload);
});

module.exports = {
  processMessage
};
