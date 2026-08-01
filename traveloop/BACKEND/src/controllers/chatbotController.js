const asyncHandler = require('../utils/asyncHandler');
const { getChatbotResponse, isAIConfigured } = require('../services/chatbotService');
const ChatMessage = require('../models/ChatMessage');

function buildAssistantExtras() {
  const links = [
    { label: 'Explore destinations', href: '/explore' },
    { label: 'Create itinerary', href: '/itinerary-builder' },
    { label: 'Open budget planner', href: '/budget' },
  ];

  const suggestions = [
    'Plan 3-day itinerary',
    'Budget travel ideas',
    'Create packing checklist',
    'Best places near me',
    'Suggest a trip',
  ];

  return { cards: [], links, suggestions: [...new Set(suggestions)].slice(0, 6) };
}

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

  if (!isAIConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'AI assistant is not configured. Please try again later.'
    });
  }

  // Get AI Response
  const reply = await getChatbotResponse(message, history || []);

  // Format expected by frontend:
  // { reply: "...", suggestions: [], meta: {} }

  const extras = buildAssistantExtras();
  const responsePayload = {
    reply,
    cards: extras.cards,
    links: extras.links,
    suggestions: extras.suggestions,
    meta: {
      timestamp: new Date(),
      aiConfigured: isAIConfigured(),
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
