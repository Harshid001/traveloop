import { ensureCsrfToken, addCsrfHeader } from '../../services/csrf';

const CHATBOT_ENDPOINT = import.meta.env.VITE_CHATBOT_API_URL || '/api/chatbot/message';
const AI_MODEL_API_KEY = import.meta.env.VITE_AI_MODEL_API_KEY || '';

// xKiro DeepSeek V4 Pro — OpenAI-compatible endpoint
const XKIRO_BASE_URL = 'https://api.xkiro.com/v1';
const XKIRO_MODEL = 'deepseek/deepseek-v4-pro';

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
 * Call xKiro DeepSeek V4 Pro directly from the browser (fallback)
 */
async function callDirectAI(message, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-12).map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text || msg.content || '',
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch(`${XKIRO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_MODEL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: XKIRO_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errMsg = data?.error?.message || data?.message || `xKiro API error: ${response.status}`;
    throw new Error(errMsg);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek V4 Pro returned an empty response.');
  return { reply: text };
}

/**
 * Primary: send message through Traveloop backend proxy
 * Fallback: call xKiro API directly from browser
 */
export async function sendChatbotMessage({ message, history }) {
  // Try backend proxy first
  try {
    await ensureCsrfToken();
    const headers = new Headers({ 'Content-Type': 'application/json' });
    addCsrfHeader(headers);

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Travel assistant is unavailable.');
    }

    return data;
  } catch (backendErr) {
    // If backend fails but we have a direct API key, call AI directly
    if (AI_MODEL_API_KEY) {
      console.info('[chatbotApi] Backend unavailable, using direct xKiro API call.');
      return await callDirectAI(message, history);
    }
    throw backendErr;
  }
}
