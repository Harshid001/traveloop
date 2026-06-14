# Traveloop

Traveloop is a full-stack travel planning platform with a responsive React website, Expo mobile app, and Express/MongoDB API. It supports onboarding, authentication, destination discovery, trip creation, itineraries, budgets, packing, journals, saved items, notifications, global search, and a travel assistant.

## Structure

- `FRONTEND/` - React, Vite, React Router, Tailwind CSS, Framer Motion, Lucide, React Leaflet.
- `MOBILE/` - React Native, Expo, NativeWind, React Navigation, secure token storage abstraction.
- `BACKEND/` - Node.js, Express, MongoDB, Mongoose, JWT auth, REST APIs, chatbot endpoint.

## Setup

1. Backend

```bash
cd BACKEND
npm install
copy .env.example .env
npm run dev
```

2. Website

```bash
cd FRONTEND
npm install
copy .env.example .env
npm run dev
```

3. Mobile

```bash
cd MOBILE
npm install
copy .env.example .env
npm start
```

Use `npm.cmd` instead of `npm` on Windows PowerShell if script execution policy blocks `npm.ps1`.

## API Coverage

Implemented or prepared routes include:

- Auth: `POST /api/auth/register`, `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/verify-email`, `POST /api/auth/google`
- User: `GET /api/users/me`, `PUT /api/users/me`
- Destinations: `GET /api/destinations`, `GET /api/destinations/:id`
- Trips: `POST /api/trips`, `GET /api/trips`, `GET /api/trips/:id`, `PUT /api/trips/:id`, `DELETE /api/trips/:id`
- Itineraries: `GET /api/itineraries/:tripId`, `POST /api/itineraries/:tripId`, `PUT /api/itineraries/:id`
- Budgets: `GET /api/budgets/:tripId`, `POST /api/budgets/:tripId`, `PUT /api/budgets/:id`
- Packing: `GET /api/packing/:tripId`, `POST /api/packing/:tripId`, `PUT /api/packing/:itemId`, `DELETE /api/packing/:itemId`
- Journal: `GET /api/journal`, `POST /api/journal`, `PUT /api/journal/:id`, `DELETE /api/journal/:id`
- Saved: `GET /api/saved`, `POST /api/saved`, `DELETE /api/saved/:id`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/clear`
- Search: `GET /api/search?q=...`
- Chatbot: `POST /api/chatbot/message`

## Testing Checklist

- Website: run `npm run build` in `FRONTEND`.
- Backend: run `node -e "require('./src/app'); console.log('app ok')"` in `BACKEND`.
- Mobile: run `npx expo-doctor` in `MOBILE`.
- Auth: sign up, complete profile, logout, login, try forgot/reset/verify placeholders.
- Dashboard: verify protected redirect, quick actions, search, notifications, and chatbot.
- Explore: test search, filters, sort, save, detail page, share, and add-to-trip.
- Trip flow: create trip, save draft, reorder/select destinations, activity picks, and validation.
- Itinerary: add/edit days, preview, print/share placeholders.
- Budget: change currency, add/delete expense, confirm progress and over-budget warning.
- Packing: add/delete/toggle items across default categories.
- Journal: add/edit/delete notes and confirm autosave-style draft behavior.
- Mobile: walk through splash, auth, tabs, create trip, itinerary, budget, packing, journal, saved, notifications, profile, and chatbot screens.

## Notes

- Mock fallbacks remain in place so Traveloop is usable when MongoDB or the AI provider is unavailable.
- The mobile biometric flow is intentionally a placeholder behind a token storage abstraction. Add `expo-local-authentication` when enabling the biometric gate.
- Chatbot responses support `reply`, `cards`, `links`, and `suggestions` from `/api/chatbot/message`.
