# Traveloop Backend

This is the Express/Node.js backend for the Traveloop application. It provides a RESTful API for user authentication, trip planning, itineraries, budgets, packing lists, journals, and an AI-powered travel assistant.

## Features
- **Authentication**: Signup, Login, Profile Management with JWT.
- **Trips & Itineraries**: Manage travel plans, days, and activities.
- **Budgets & Packing**: Track expenses and packing lists.
- **Journals & Saved Places**: Keep travel memories and bucket lists.
- **AI Chatbot**: Travel assistant using Gemini/OpenAI with fallback.
- **Security**: CORS, Helmet, Rate Limiting, Input Validation.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas)

## Installation
1. Clone the repository and navigate to `BACKEND`:
   ```bash
   cd BACKEND
   npm install
   ```

2. Set up your Environment Variables:
   Rename `.env.example` to `.env` and configure your keys.
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/traveloop
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key
   AI_PROVIDER=gemini
   ```

## Running the Server
**Development Mode**
```bash
npm run dev
```
**Production Mode**
```bash
npm start
```

## API Endpoints Overview
- Base URL: `http://localhost:5000/api`
- **Auth**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`
- **Trips**: `/api/trips`, `/api/trips/upcoming`, `/api/trips/recent`
- **Itineraries**: `/api/itineraries/:tripId`
- **Budgets**: `/api/budgets/:tripId`
- **Packing**: `/api/packing/:tripId`
- **Journals**: `/api/journals`
- **Saved Places**: `/api/saved`
- **Explore**: `/api/explore`
- **Dashboard**: `/api/dashboard/summary`
- **Chatbot**: `/api/chatbot/message`

## Frontend Connection Guide

In your Vite frontend, create a `.env` file at the root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CHATBOT_API_URL=http://localhost:5000/api/chatbot/message
```

**Common Frontend Connection Mistakes to Avoid:**
1. **Missing Bearer token**: When making authenticated requests, ensure the header is structured properly: `Authorization: Bearer <token>`.
2. **CORS issues**: Make sure your Vite app runs on the exact port specified in the backend's `CLIENT_URL` (usually `http://localhost:5173`).
3. **Invalid JSON Body**: Ensure `Content-Type: application/json` is set in your fetch/axios requests.
4. **Incorrect Chatbot Payload**: The chatbot endpoint strictly expects `{ message: "text", history: [] }`.

## Testing with Postman
You can test the endpoints locally using Postman.
1. Send `POST /api/auth/signup` to create a user.
2. Send `POST /api/auth/login` to obtain the token.
3. In Postman, add `Authorization -> Bearer Token` and paste your token for subsequent requests to `/api/trips`, `/api/dashboard/summary`, etc.
