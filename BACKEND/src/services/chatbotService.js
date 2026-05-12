const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');

const fallbackResponse = "I'm your offline Traveloop assistant! Currently, my AI connection is not configured, but I can still help you organize your trips. You can go to the 'Create Trip' page to start planning, or check out the Explore tab for destination inspiration!";

const getChatbotResponse = async (message, history = []) => {
  if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      
      const systemInstruction = `You are the Traveloop AI Assistant, an expert travel planner. 
      Help users plan their trips, create itineraries, suggest destinations, and manage budgets. 
      Keep your responses helpful, engaging, and reasonably concise. Format output using Markdown where appropriate.`;
      
      // Convert history to Gemini format if needed, but for simplicity, we can pass it as context in prompt
      // or use chat sessions. Using generateContent for simplicity here, appending history as text context
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

      return response.text || "I'm having trouble thinking right now. Please try again.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I encountered an error connecting to my AI brain. Please check your API key or try again later.";
    }
  }

  // Fallback if no API key or provider matches
  return fallbackResponse;
};

module.exports = {
  getChatbotResponse
};
