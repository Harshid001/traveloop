const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const { env } = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Traveloop API',
      version: '1.0.0',
      description: 'REST API for the Traveloop travel planning platform. Handles authentication, trips, itineraries, budgets, packing lists, journal entries, destination discovery, and chatbot interactions.',
      contact: {
        name: 'Traveloop Team',
        url: 'https://traveloop.com',
      },
    },
    servers: [
      {
        url: env.NODE_ENV === 'production'
          ? (process.env.DOCS_URL || 'https://traveloop-backend.vercel.app')
          : `http://localhost:${env.PORT || 5000}`,
        description: env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token. Used by mobile clients.',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'httpOnly cookie set automatically on login. Used by the web frontend.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60f7b1c0d4e5a72b9c8d1234' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            avatar: { type: 'string', example: '' },
            phone: { type: 'string', example: '+1234567890' },
            preferredCurrency: { type: 'string', example: 'USD' },
            travelStyle: { type: 'string', example: 'adventure' },
            profileComplete: { type: 'boolean', example: true },
            emailVerified: { type: 'boolean', example: true },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Summer Europe Tour' },
            startDate: { type: 'string', format: 'date', example: '2026-07-01' },
            endDate: { type: 'string', format: 'date', example: '2026-07-15' },
            destinations: { type: 'array', items: { type: 'string' } },
            budget: { type: 'number', example: 3000 },
            shareId: { type: 'string', description: 'Public share identifier' },
          },
        },
        Destination: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Paris' },
            country: { type: 'string', example: 'France' },
            image: { type: 'string', format: 'uri' },
            rating: { type: 'number', example: 4.7 },
            category: { type: 'string', example: 'city' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', description: 'Min 8 chars, must include uppercase, lowercase, digit, and special character' },
          },
        },
        TripRequest: {
          type: 'object',
          required: ['title', 'startDate', 'endDate'],
          properties: {
            title: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            destinations: { type: 'array', items: { type: 'object' } },
            budget: { type: 'number' },
            notes: { type: 'string' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Trips', description: 'Trip CRUD and management' },
      { name: 'Discover', description: 'Destination discovery and recommendations' },
      { name: 'Health', description: 'Health check' },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../docs/*.js'),
  ],
};

let swaggerSpec = {};
try {
  swaggerSpec = swaggerJsdoc(options);
} catch (err) {
  console.warn('Swagger spec initialization warning:', err.message);
}

module.exports = swaggerSpec;