require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/traveloop',
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-for-integration-tests-32chars+' : undefined),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MOBILE_URL: process.env.MOBILE_URL || 'http://localhost:19000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AI_MODEL_API_KEY: process.env.AI_MODEL_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',

  // Third-party API keys
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID || '',
  AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET || '',
  TRIPADVISOR_API_KEY: process.env.TRIPADVISOR_API_KEY || '',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',

  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Traveloop <noreply@traveloop.com>',

  // Redis
  REDIS_URL: process.env.REDIS_URL || '',

  // Documentation
  DOCS_URL: process.env.DOCS_URL || '',

  // Security
  CSP_REPORT_URI: process.env.CSP_REPORT_URI || '',
};

const JWT_PLACEHOLDERS = [
  'change_this_secret_in_production',
  'change_this_in_production_use_a_strong_random_secret',
  'your_jwt_secret_here',
  'your-secret-key',
  'dev_secret_change_in_production',
];

const MIN_JWT_SECRET_LENGTH = 32;

function validateEnv() {
  const errors = [];

  if (!env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (JWT_PLACEHOLDERS.includes(env.JWT_SECRET)) {
    errors.push('JWT_SECRET is using a placeholder value — generate a strong random secret for production');
  } else if (env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long (current: ${env.JWT_SECRET.length})`);
  }

  if (!env.MONGO_URI) {
    errors.push('MONGO_URI is required');
  }

  if (errors.length > 0) {
    const message = `FATAL: Environment validation failed:\n  - ${errors.join('\n  - ')}`;
    const err = new Error(message);
    err.code = 'ENV_VALIDATION_FAILED';
    throw err;
  }
}

module.exports = { env, validateEnv };