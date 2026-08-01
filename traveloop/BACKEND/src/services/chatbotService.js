const { GoogleGenAI } = require('@google/genai');
const { env } = require('../config/env');

const isAIConfigured = () => env.AI_PROVIDER === 'gemini' && Boolean(env.GEMINI_API_KEY);

const getChatbotResponse = async (message, history = []) => {
  if (!isAIConfigured()) {
    throw new Error('AI assistant is not configured. Set AI_PROVIDER=gemini and GEMINI_API_KEY to enable it.');
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const systemInstruction = `You are the Traveloop AI Assistant, an expert travel planner. 
  Help users plan their trips, create itineraries, suggest destinations, and manage budgets. 
  Keep your responses helpful, engaging, and reasonably concise. Format output using Markdown where appropriate.`;

  let promptContext = "Chat History:\n";
  history.forEach(msg => {
    if (msg.role === 'user') promptContext += `User: ${msg.content}\n`;
    else promptContext += `Assistant: ${msg.content}\n`;
  });
  promptContext += `\nSystem: ${systemInstruction}\nUser: ${message}\nAssistant:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptContext,
  });

  if (!response.text) {
    throw new Error('Gemini API returned an empty response');
  }

  return response.text;
};

module.exports = {
  getChatbotResponse,
  isAIConfigured,
};
