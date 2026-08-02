# 🌍 Traveloop — Plan Smarter, Travel Better

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Expo](https://img.shields.io/badge/Expo-React%20Native-000000.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Traveloop** is a modern, full-stack travel planning and itinerary management platform built with a **React (Vite) Web App**, **Expo (React Native) Mobile App**, and a robust **Node.js / Express / MongoDB Backend**. It seamlessly combines trip customization, budget tracking, dynamic packing lists, travel journals, destination discovery, and an intelligent **AI Travel Assistant** (powered by Gemini & OpenAI).

---

## 🚀 Live Demo & Deployment

| Environment | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [traveloop-frontend-drab.vercel.app](https://traveloop-frontend-drab.vercel.app) | Production web application deployed on Vercel |
| **Backend REST API** | [traveloop-backend.vercel.app](https://traveloop-backend.vercel.app) | Production Serverless API deployed on Vercel |
| **API Documentation** | [traveloop-backend.vercel.app/api-docs](https://traveloop-backend.vercel.app/api-docs) | Interactive Swagger UI API docs |

---

## ✨ Features

- 🔑 **Secure Authentication**: Email/Password registration & login, Google OAuth 2.0 integration, double CSRF token validation, HTTP-only JWT cookies, and rate limiting.
- 🤖 **AI Travel Assistant**: Conversational AI powered by Google Gemini / OpenAI with smart fallbacks, interactive suggestion cards, destination tips, and quick actions.
- ✈️ **Trip Customization**: Create, view, update, and manage trips with start/end dates, target budgets, multiple destination stops, and public share links.
- 📅 **Interactive Itineraries**: Organize trips into day-by-day itineraries, add custom activities, set schedules, and drag-and-drop days.
- 💰 **Budget & Expense Tracker**: Set trip budgets across multiple currencies, categorize spending (flights, accommodation, food, activities), and monitor real-time visual progress bars with over-budget alerts.
- 🎒 **Packing Lists**: Smart packing lists with default essentials and custom items, categorized progress, and one-tap status toggling.
- 📖 **Travel Journal**: Document memories with auto-saving notes, rich entry metadata, and search filters.
- 📌 **Saved Places & Bucket List**: Save destinations and wishlist items for future trips with quick add-to-trip shortcuts.
- 🗺️ **Destination Discovery & Search**: Global search for top destinations with ratings, categories, photos, and interactive Mapbox maps.
- 📱 **Cross-Platform Mobile App**: Fully responsive mobile app built with Expo and React Native featuring tab navigation and token persistence.

---

## 🛠️ Tech Stack

### Web Frontend (`FRONTEND/`)
- **Core**: React 18, React Router v6, Vite
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons
- **Maps & UI**: Mapbox GL JS, `@react-oauth/google`
- **Testing**: Vitest, React Testing Library, Playwright (E2E)

### Backend Service (`BACKEND/`)
- **Core**: Node.js, Express.js, Mongoose (MongoDB)
- **Security & Middleware**: JWT, `csrf-csrf`, Helmet, CORS, `express-rate-limit`, Winston Logging, Sentry Error Tracking
- **API Docs**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Testing**: Jest, Supertest

### Mobile App (`MOBILE/`)
- **Core**: React Native, Expo, React Navigation
- **Styling**: NativeWind (Tailwind for React Native)
- **Storage**: Secure Token Abstraction

---

## 📁 Repository Structure

```
traveloop/
├── BACKEND/                   # Express.js REST API & Serverless Functions
│   ├── api/                   # Vercel Serverless Entrypoint (api/index.js)
│   ├── src/
│   │   ├── config/            # Database, Logger, Sentry, Swagger & Env configuration
│   │   ├── controllers/       # Auth, Trip, Itinerary, Budget, Chatbot, User controllers
│   │   ├── middleware/        # Auth, CSRF, Rate Limiter, Error Handling
│   │   ├── models/            # Mongoose schemas (User, Trip, Destination, etc.)
│   │   ├── routes/            # Express route modules
│   │   └── services/          # AI Service, Email Service, Reminder Scheduler
│   ├── __tests__/             # Backend integration & unit tests
│   ├── vercel.json            # Vercel serverless configuration
│   └── package.json
│
├── FRONTEND/                  # React + Vite Web Application
│   ├── src/
│   │   ├── components/        # UI components, Layouts, Navigation, Modals
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # Login, Register, Dashboard, Trips, Discover, Profile
│   │   ├── services/          # API fetch wrapper, CSRF handler, Auth services
│   │   └── utils/             # Helpers, Storage, Image formatters
│   ├── vercel.json            # Frontend proxy rewrites & security headers
│   ├── vite.config.js
│   └── package.json
│
└── MOBILE/                    # Expo React Native App
    ├── src/                   # Mobile screens, components, and navigators
    ├── app.json               # Expo configuration
    └── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local instance (`mongodb://localhost:27017/traveloop`) or MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file inside `BACKEND/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/traveloop
JWT_SECRET=traveloop_default_jwt_secret_key_min_32_chars_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MOBILE_URL=http://localhost:19000

# AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the backend server in development mode:

```bash
npm run dev
```

The API server will run at `http://localhost:5000` with Swagger docs at `http://localhost:5000/api-docs`.

---

### 2. Frontend Setup

```bash
cd FRONTEND
npm install
```

Create a `.env` file inside `FRONTEND/`:

```env
VITE_API_URL=/api
VITE_CHATBOT_API_URL=/api/chatbot/message
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 3. Mobile Setup

```bash
cd MOBILE
npm install
npm start
```

Scan the Expo QR code using the **Expo Go** app on iOS or Android.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/csrf-token` | Fetch double CSRF protection token | ❌ |
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT / cookie | ❌ |
| `POST` | `/api/auth/google` | Google OAuth sign-in | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | 🔐 |
| `POST` | `/api/auth/logout` | Clear authentication session | 🔐 |
| `GET` | `/api/trips` | Get user's created trips | 🔐 |
| `POST` | `/api/trips` | Create a new trip | 🔐 |
| `GET` | `/api/trips/:id` | Get trip details by ID | 🔐 |
| `GET` | `/api/itineraries/:tripId` | Fetch itinerary days & activities | 🔐 |
| `POST` | `/api/itineraries/:tripId` | Add itinerary day / activity | 🔐 |
| `GET` | `/api/budgets/:tripId` | Get trip budget & expenses | 🔐 |
| `POST` | `/api/budgets/:tripId` | Add expense entry | 🔐 |
| `GET` | `/api/packing/:tripId` | Get trip packing list | 🔐 |
| `POST` | `/api/chatbot/message` | Query AI travel assistant | ❌ |
| `GET` | `/api/destinations` | Browse & filter destinations | ❌ |

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd BACKEND
npm test
```

### Frontend Unit & Component Tests
```bash
cd FRONTEND
npm test
```

---

## 🌐 Vercel Production Deployment Notes

- **Backend Vercel Config** (`BACKEND/vercel.json`): Rewrites requests to `/api/index.js`. File log transports are automatically bypassed when `process.env.VERCEL` is active to maintain compatibility with serverless read-only filesystems.
- **Frontend Vercel Proxy** (`FRONTEND/vercel.json`): Rewrites `/api/:path*` to `https://traveloop-backend.vercel.app/api/:path*` to eliminate CORS issues and 405 static method errors, while enforcing `Cross-Origin-Opener-Policy: same-origin-allow-popups` for seamless Google OAuth popups.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
