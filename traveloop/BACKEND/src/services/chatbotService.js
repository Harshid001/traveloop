const axios = require('axios');
const { env } = require('../config/env');

// xKiro API (DeepSeek V4 Pro) — OpenAI-compatible
const AI_MODEL_API_KEY = env.AI_MODEL_API_KEY || env.OPENAI_API_KEY || '';
const XKIRO_BASE_URL = 'https://api.xkiro.com/v1';
const XKIRO_MODEL = 'deepseek/deepseek-v4-pro';

const isAIConfigured = () => Boolean(AI_MODEL_API_KEY);

const SYSTEM_PROMPT = `You are the Traveloop AI Travel Assistant — an expert global travel planner, destination guide, and trip advisor exclusively for the Traveloop travel platform.

🌍 YOUR EXPERTISE (ONLY answer questions related to these topics):
- Trip planning, itineraries, and travel schedules
- Destinations: countries, cities, towns, regions, landmarks
- Tourist attractions, monuments, UNESCO sites, hidden gems
- Hotels, hostels, resorts, Airbnbs, and accommodation
- Flights, trains, buses, car rentals, and local transport
- Travel budgets, costs, currency exchange, and money-saving tips
- Visa requirements, passport info, and entry regulations
- Packing lists, travel essentials, and gear recommendations
- Food, restaurants, local cuisine, and dining experiences
- Safety tips, travel insurance, and health advice for travelers
- Weather, best seasons, and ideal months to visit destinations
- Cultural etiquette, local customs, and language tips
- Adventure activities, outdoor experiences, and tours
- Family travel, solo travel, honeymoon trips, group tours
- Traveloop platform features: creating trips, itineraries, budget planner, packing lists, journal

🚫 STRICT RESTRICTIONS:
- If the user asks about ANYTHING unrelated to travel, tourism, destinations, Traveloop, or trip planning — do NOT answer it.
- Topics you must REFUSE: coding, programming, math, science, politics, sports, entertainment, finance, relationships, health (non-travel), homework, general knowledge, jokes, recipes, etc.
- When refusing, be warm, brief, and redirect to travel topics.
- NEVER pretend to be a general-purpose AI assistant.

✅ REFUSAL RESPONSE FORMAT (use when off-topic):
"✈️ I'm Traveloop's travel assistant, so I can only help with travel-related questions! Try asking me about destinations, trip planning, hotels, budgets, or things to do in [any city]. Where are you thinking of traveling? 🌍"

Always respond in clean Markdown with emojis where appropriate. Be warm, enthusiastic, and knowledgeable about travel.`;

/**
 * Call xKiro DeepSeek V4 Pro API (OpenAI-compatible)
 */
const getChatbotResponse = async (message, history = []) => {
  if (!isAIConfigured()) {
    throw new Error('AI assistant is not configured. Please add an API key in the server environment.');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-12).map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content || msg.text || '',
    })),
    { role: 'user', content: message },
  ];

  try {
    const response = await axios.post(
      `${XKIRO_BASE_URL}/chat/completions`,
      {
        model: XKIRO_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${AI_MODEL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('DeepSeek V4 Pro returned an empty response.');
    return text;
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.response?.data?.message || err.message;
    console.error('[chatbotService] xKiro API error:', detail);
    throw new Error(`AI assistant error: ${detail}`, { cause: err });
  }
};

module.exports = {
  getChatbotResponse,
  isAIConfigured,
};
