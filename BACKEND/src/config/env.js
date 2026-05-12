require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/traveloop',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
};

module.exports = env;
