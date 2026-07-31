const asyncHandler = require('../utils/asyncHandler');
const { getChatbotResponse } = require('../services/chatbotService');
const ChatMessage = require('../models/ChatMessage');
const destinations = require('../data/destinations');

function buildAssistantExtras(message) {
  const text = message.toLowerCase();
  const matchingDestinations = destinations
    .filter((item) =>
      text.includes(item.name.toLowerCase()) ||
      item.activities.some((activity) => text.includes(String(activity).toLowerCase().split(' ')[0])) ||
      text.includes(item.category.toLowerCase()),
    )
    .slice(0, 3);

  const cards = (matchingDestinations.length ? matchingDestinations : destinations.slice(0, 3)).map((item) => ({
    title: item.name,
    subtitle: `${item.country} • ${item.rating} rating • $${item.budgetEstimate}`,
    image: item.image,
    href: `/destinations/${item.id}`,
    tags: [item.category, item.bestTimeToVisit],
  }));

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

  if (text.includes('packing')) suggestions.unshift('What should I pack?');
  if (text.includes('budget')) suggestions.unshift('Estimate my daily budget');

  return { cards, links, suggestions: [...new Set(suggestions)].slice(0, 6) };
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

  // Get AI Response
  const reply = await getChatbotResponse(message, history || []);

  // Format expected by frontend:
  // { reply: "...", suggestions: [], meta: {} }
  
  const extras = buildAssistantExtras(message);
  const responsePayload = {
    reply,
    cards: extras.cards,
    links: extras.links,
    suggestions: extras.suggestions,
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
