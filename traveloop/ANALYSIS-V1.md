# Traveloop — File Analysis V1

> Generated: 2026-07-29  
> Repository root: `D:\NewVolumeE\Traveloop\traveloop`

---

## 1. Project Overview

Traveloop is a full-stack travel planning platform with three tiers:

| Tier | Technology | Path |
|------|-----------|------|
| Backend | Node.js, Express, MongoDB, Mongoose | `BACKEND/` |
| Website | React 19, Vite, Tailwind CSS, Redux Toolkit | `FRONTEND/` |
| Mobile | React Native (Expo), NativeWind, React Navigation | `MOBILE/` |

**Key features:** onboarding, authentication (email + Google), destination discovery, trip creation, itineraries, budgets, packing lists, journals, saved items/wishlist, notifications, global search, travel chatbot (Gemini AI).

---

## 2. Directory Structure

```
traveloop/
├── BACKEND/
│   ├── server.js                  # Entry point: loads dotenv, connects DB, starts Express
│   ├── package.json               # Dependencies & scripts (start, dev, seed)
│   ├── .env / .env.example        # Environment config (Mongo, JWT, API keys)
│   └── src/
│       ├── app.js                 # Express app setup, middleware, route mounting
│       ├── config/
│       │   ├── env.js             # Centralized env var loader with defaults
│       │   └── db.js              # Mongoose connection to MongoDB
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT Bearer token verification (protect)
│       │   ├── errorMiddleware.js # 404 handler + global error handler
│       │   ├── rateLimiter.js     # Rate limiting (apiLimiter, authLimiter)
│       │   └── validateRequest.js # express-validator result check
│       ├── models/
│       │   ├── User.js            # User schema (auth, profile, preferences, tokens)
│       │   ├── Trip.js            # Trip schema (destinations, dates, budget, status)
│       │   ├── Itinerary.js       # Day-by-day itinerary entries
│       │   ├── Budget.js          # Trip budget tracking
│       │   ├── Expense.js         # Individual expense items
│       │   ├── PackingItem.js     # Packing checklist items
│       │   ├── Journal.js         # Trip journals
│       │   ├── JournalNote.js     # Individual journal notes
│       │   ├── SavedItem.js       # Saved/bookmarked items
│       │   ├── SavedPlace.js      # Saved places
│       │   ├── Booking.js         # Travel bookings
│       │   ├── Notification.js    # User notifications
│       │   ├── ChatMessage.js     # Chatbot conversation history
│       │   ├── Destination.js     # Destination data model
│       │   ├── Wishlist.js        # User wishlists
│       │   ├── UserPreference.js  # User travel preferences
│       │   └── SearchHistory.js   # Search history tracking
│       ├── controllers/           # Request handlers (one per route module)
│       │   ├── authController.js      # register, login, logout, forgot/reset password, verify email, Google OAuth
│       │   ├── userController.js      # GET/PUT /users/me
│       │   ├── tripController.js      # CRUD trips
│       │   ├── itineraryController.js # Itinerary management
│       │   ├── budgetController.js    # Budget operations
│       │   ├── packingController.js   # Packing list operations
│       │   ├── journalController.js   # Journal entries CRUD
│       │   ├── savedController.js     # Saved items CRUD
│       │   ├── wishlistController.js  # Wishlist management
│       │   ├── bookingController.js   # Booking management
│       │   ├── notificationController.js  # Notification read/clear
│       │   ├── searchController.js    # Global search
│       │   ├── exploreController.js   # Explore/discover endpoints
│       │   ├── discoverController.js  # Discovery features
│       │   ├── destinationController.js  # Destination details
│       │   ├── dashboardController.js    # Dashboard stats
│       │   ├── chatbotController.js      # Chatbot message handling
│       │   ├── recommendationsController.js  # AI recommendations
│       │   ├── placesController.js      # Nearby places
│       │   ├── mapsController.js        # Map-related endpoints
│       │   └── imagesController.js      # Image serving
│       ├── routes/                # Express routers (one per feature)
│       │   ├── authRoutes.js          # /api/auth/*
│       │   ├── userRoutes.js          # /api/users/*
│       │   ├── tripRoutes.js          # /api/trips/*
│       │   ├── itineraryRoutes.js     # /api/itineraries/*
│       │   ├── budgetRoutes.js        # /api/budgets/*
│       │   ├── packingRoutes.js       # /api/packing/*
│       │   ├── journalRoutes.js       # /api/journals/*  +  /api/journal/* (alias)
│       │   ├── savedRoutes.js         # /api/saved/*
│       │   ├── wishlistRoutes.js      # /api/wishlist/*
│       │   ├── bookingRoutes.js       # /api/bookings/*
│       │   ├── profileRoutes.js       # /api/profile/*
│       │   ├── chatbotRoutes.js       # /api/chatbot/*
│       │   ├── dashboardRoutes.js     # /api/dashboard/*
│       │   ├── exploreRoutes.js       # /api/explore/*
│       │   ├── destinationRoutes.js   # /api/destinations/*
│       │   ├── notificationRoutes.js  # /api/notifications/*
│       │   ├── searchRoutes.js        # /api/search/*
│       │   ├── placesRoutes.js        # /api/places/*
│       │   ├── discoverRoutes.js      # /api/discover/*
│       │   ├── mapsRoutes.js          # /api/maps/*
│       │   ├── imagesRoutes.js        # /api/images/*
│       │   ├── recommendationsRoutes.js  # /api/recommendations/*
│       │   └── mockRoutes.js          # /api/mock/*  (dev/testing without DB)
│       ├── services/              # Business logic & external API integrations
│       │   ├── chatbotService.js      # Gemini AI integration (GoogleGenAI)
│       │   ├── emailService.js        # Nodemailer SMTP (Gmail)
│       │   ├── weatherService.js      # OpenWeatherMap API
│       │   ├── unsplashService.js     # Unsplash image API
│       │   ├── googleMapsService.js   # Google Maps/Places/Directions
│       │   ├── amadeusService.js      # Amadeus flight/hotel API (OAuth2)
│       │   ├── tripadvisorService.js  # TripAdvisor Content API
│       │   ├── recommendationService.js  # AI recommendation engine
│       │   ├── mockTravelService.js   # Mock data fallback
│       │   └── cacheService.js        # Caching layer
│       ├── utils/
│       │   ├── generateToken.js   # JWT token generation
│       │   ├── asyncHandler.js    # Async error wrapper for Express
│       │   └── apiResponse.js     # Standardized success/error response helpers
│       ├── data/
│       │   └── destinations.js    # Seed data: 6 destinations (Paris, Tokyo, Bali, Dubai, Singapore, Goa)
│       ├── templates/
│       │   └── welcome.html       # Email template
│       └── seed/
│           └── seedExploreData.js # Database seeding script
│
├── FRONTEND/
│   ├── index.html                 # Vite HTML entry
│   ├── vite.config.js             # Vite config with /api proxy to :5000
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS config
│   ├── eslint.config.js           # ESLint config
│   ├── package.json               # Dependencies (React 19, Redux Toolkit, Framer Motion, Leaflet, etc.)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── dist/                      # Production build output
│   └── src/
│       ├── main.jsx               # App entry: StrictMode, BrowserRouter, App mount
│       ├── App.jsx                # Route definitions (lazy-loaded pages, ProtectedRoute wrapper)
│       ├── index.css              # Global styles + Tailwind directives
│       ├── styles/
│       │   └── print.css          # Print-specific styles
│       ├── store.js               # Redux store (RTK Query apiSlice)
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state, login/register/logout, offline fallback, guest user
│       ├── services/
│       │   ├── api.js             # Fetch wrapper (apiRequest), authApi, tripsApi, notificationApi
│       │   └── apiSlice.js        # RTK Query slice (getTopTrips, getLatestTrips)
│       ├── pages/                 # Route-level components (lazy-loaded)
│       │   ├── HomePage.jsx           # Main dashboard
│       │   ├── Dashboard.jsx          # Dashboard component
│       │   ├── OnboardingScreen.jsx   # First-launch onboarding
│       │   ├── WelcomeScreen.jsx      # Welcome/splash
│       │   ├── SplashScreen.jsx       # App splash
│       │   ├── LoginScreen.jsx        # Email/password login
│       │   ├── SignupScreen.jsx       # Registration
│       │   ├── AuthScreen.jsx         # Generic auth screen
│       │   ├── AuthFlowScreen.jsx     # Forgot/reset/verify/complete profile flow
│       │   ├── ExploreScreen.jsx      # Destination discovery
│       │   ├── DestinationDetailScreen.jsx  # Single destination
│       │   ├── CreateTripScreen.jsx   # Trip creation wizard
│       │   ├── MyTripsScreen.jsx      # User's trips list
│       │   ├── TripDetailScreen.jsx   # Single trip view
│       │   ├── ItineraryBuilderScreen.jsx  # Day-by-day itinerary builder
│       │   ├── ItineraryViewScreen.jsx     # Itinerary preview
│       │   ├── BudgetScreen.jsx       # Budget tracking
│       │   ├── PackingScreen.jsx      # Packing checklist
│       │   ├── JournalScreen.jsx      # Travel journal
│       │   ├── SavedScreen.jsx        # Saved/wishlist items
│       │   ├── ProfileScreen.jsx      # User profile & settings
│       │   ├── NotificationsScreen.jsx # Notification center
│       │   ├── GlobalSearchScreen.jsx  # Global search
│       │   └── slides.jsx             # Onboarding slides data
│       ├── components/
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx  # Auth guard with loading state
│       │   │   ├── Button.jsx          # Reusable button
│       │   │   ├── GlassCard.jsx       # Glassmorphism card
│       │   │   ├── MobileBottomNav.jsx # Mobile bottom navigation
│       │   │   └── ShareModal.jsx      # Share destination/trip
│       │   ├── ui/                     # UI primitives
│       │   │   ├── Button.jsx
│       │   │   ├── GlassCard.jsx
│       │   │   ├── TextInput.jsx
│       │   │   ├── ErrorBanner.jsx
│       │   │   ├── FullScreenSpinner.jsx
│       │   │   └── SkeletonCard.jsx
│       │   ├── features/home/         # Home page feature components
│       │   │   ├── HomeHeader.jsx
│       │   │   ├── TopDestinationsCarousel.jsx
│       │   │   ├── LatestTripsGrid.jsx
│       │   │   └── DashboardStats.jsx
│       │   └── chatbot/               # AI Travel Assistant widget
│       │       ├── TravelChatbot.jsx   # Full chatbot UI (Framer Motion, voice input, suggestions)
│       │       └── chatbotApi.js       # Chatbot API client
│       ├── data/
│       │   └── trips.js               # Seed/mock trip data
│       └── assets/
│           ├── hero.png
│           ├── vite.svg
│           └── react.svg
│
├── MOBILE/
│   ├── App.js                    # Expo entry: SafeAreaProvider + AppNavigator
│   ├── index.js                  # Register root component
│   ├── app.json                  # Expo config
│   ├── babel.config.js           # Babel config (NativeWind)
│   ├── metro.config.js           # Metro bundler config
│   ├── tailwind.config.js        # NativeWind Tailwind config
│   ├── global.css                # Global NativeWind styles
│   ├── package.json              # Expo 54, React Native 0.81, React Navigation, NativeWind
│   ├── .env / .env.example       # Environment variables
│   └── src/
│       ├── navigation/
│       │   └── AppNavigator.js   # Stack navigator (Splash→Onboarding→Auth→MainTabs) + ErrorBoundary
│       ├── screens/              # Screen components (one per route)
│       │   ├── SplashScreen.js
│       │   ├── OnboardingScreen.js
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   ├── HomeScreen.js
│       │   ├── ExploreScreen.js
│       │   ├── DestinationDetailScreen.js
│       │   ├── CreateTripScreen.js
│       │   ├── MyTripsScreen.js
│       │   ├── TripDetailsScreen.js
│       │   ├── ItineraryBuilderScreen.js
│       │   ├── ItineraryViewScreen.js
│       │   ├── BudgetScreen.js
│       │   ├── PackingScreen.js
│       │   ├── JournalScreen.js
│       │   ├── WishlistScreen.js
│       │   ├── BookingScreen.js
│       │   ├── ProfileScreen.js
│       │   ├── NotificationsScreen.js
│       │   └── ChatbotScreen.js
│       ├── components/           # Reusable UI components
│       │   ├── Header.js
│       │   ├── SearchBar.js
���       │   ├── FilterBar.js
│       │   ├── SmartFilters.js
│       │   ├── DestinationCard.js
│       │   ├── FeaturedTripCard.js
│       │   ├── RecommendedTripCard.js
│       │   ├── TripCard.js
│       │   ├── AttractionCard.js
│       │   ├── ReviewCard.js
│       │   ├── ImageGallery.js
│       │   ├── WeatherBadge.js
│       │   ├── StatsSection.js
│       │   ├── SectionHeader.js
│       │   ├── MoodChips.js
│       │   ├── SkeletonCard.js
│       │   ├── EmptyState.js
│       │   ├── AutocompleteDropdown.js
│       │   └── PrimaryButton.js
│       ├── services/
│       │   ├── api.js                # Mock API layer + authApi, tripsApi stubs (real endpoints ready)
│       │   ├── appData.js            # App-level data management
│       │   ├── cacheManager.js       # Local caching
│       │   ├── currency.js           # Currency formatting/conversion
│       │   ├── destinationAdapter.js # Destination data adapter
│       │   ├── locationService.js    # Device location
│       │   ├── storage.js           # AsyncStorage wrapper
│       │   ├── tokenStorage.js      # Secure token storage (expo-secure-store)
│       │   └── validators.js        # Form validation helpers
│       ├── hooks/
│       │   ├── useSearch.js
│       │   ├── useDestinations.js
│       │   └── useLocation.js
│       ├── constants/
│       │   ├── colors.js
│       │   └── data.js
│       └── assets/                   # App icons & splash
│           ├── icon.png
│           ├── splash-icon.png
│           ├── adaptive-icon.png
│           └── favicon.png
│
├── README.md                    # Project-level documentation
├── CLAUDE.md                    # AI coding assistant guide
└── .gitignore
```

---

## 3. API Endpoint Inventory (Complete)

### 3.1 Authentication — `/api/auth/*`
| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | `/api/auth/register` | `registerUser` | Public |
| POST | `/api/auth/signup` | `registerUser` | Public |
| POST | `/api/auth/login` | `loginUser` | Public |
| POST | `/api/auth/logout` | `logoutUser` | Public |
| POST | `/api/auth/forgot-password` | `forgotPassword` | Public |
| POST | `/api/auth/reset-password/:token` | `resetPassword` | Public |
| POST | `/api/auth/verify-email` | `verifyEmail` | Public |
| POST | `/api/auth/google` | `googleLogin` | Public |
| GET | `/api/auth/me` | `getUserProfile` | Private |
| PUT | `/api/auth/profile` | `updateUserProfile` | Private |

### 3.2 Users — `/api/users/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/users/me` | Private |
| PUT | `/api/users/me` | Private |

### 3.3 Trips — `/api/trips/*`
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/trips` | Private |
| GET | `/api/trips` | Private |
| GET | `/api/trips/:id` | Private |
| PUT | `/api/trips/:id` | Private |
| DELETE | `/api/trips/:id` | Private |

### 3.4 Itineraries — `/api/itineraries/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/itineraries/:tripId` | Private |
| POST | `/api/itineraries/:tripId` | Private |
| PUT | `/api/itineraries/:id` | Private |

### 3.5 Budgets — `/api/budgets/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/budgets/:tripId` | Private |
| POST | `/api/budgets/:tripId` | Private |
| PUT | `/api/budgets/:id` | Private |

### 3.6 Packing — `/api/packing/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/packing/:tripId` | Private |
| POST | `/api/packing/:tripId` | Private |
| PUT | `/api/packing/:itemId` | Private |
| DELETE | `/api/packing/:itemId` | Private |

### 3.7 Journals — `/api/journals/*` (also aliased as `/api/journal/*`)
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/journals` | Private |
| POST | `/api/journals` | Private |
| PUT | `/api/journals/:id` | Private |
| DELETE | `/api/journals/:id` | Private |

### 3.8 Saved/Wishlist — `/api/saved/*`, `/api/wishlist/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/saved` | Private |
| POST | `/api/saved` | Private |
| DELETE | `/api/saved/:id` | Private |

### 3.9 Notifications — `/api/notifications/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/notifications` | Private |
| PATCH | `/api/notifications/:id/read` | Private |
| DELETE | `/api/notifications/clear` | Private |

### 3.10 Search — `/api/search/*`
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/search?q=...` | Private |

### 3.11 Chatbot — `/api/chatbot/*`
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/chatbot/message` | Private |

### 3.12 Additional Feature Routes
| Prefix | Purpose | Auth |
|--------|---------|------|
| `/api/dashboard` | Dashboard stats & summaries | Private |
| `/api/explore` | Destination exploration/discovery | Private |
| `/api/discover` | Discovery features | Private |
| `/api/destinations` | Destination CRUD & details | Private |
| `/api/bookings` | Travel booking management | Private |
| `/api/profile` | User profile | Private |
| `/api/places` | Nearby places search | Private |
| `/api/maps` | Map-related endpoints | Private |
| `/api/images` | Image serving | Private |
| `/api/recommendations` | AI-powered recommendations | Private |
| `/api/mock` | Mock data for dev/testing | Public |

---

## 4. Database Models (Mongoose)

| Model | File | Key Fields |
|-------|------|-----------|
| **User** | `models/User.js` | name, email (unique), password (hashed, bcrypt), avatar, phone, firstName, lastName, location, bio, travelStyle, preferredBudget, interests, preferences, preferredCurrency (INR/USD), preferredLanguage, travelers, profileComplete, emailVerified, googleId, resetPasswordToken/Expires, emailVerificationToken/Expires. Methods: matchPassword, generateEmailVerificationToken, getResetPasswordToken. |
| **Trip** | `models/Trip.js` | user (ref User), title, destination, destinations[], selectedDestinations[], selectedActivities{}, startDate, endDate, travelers, budget, budgetRange, tripType (Solo/Couple/Family/Friends/Business/Adventure/Luxury/Budget), coverImage, description, status (draft/planning/upcoming/active/ongoing/completed/cancelled), tags[], notes, shareId (uuid). |
| **Itinerary** | `models/Itinerary.js` | Trip day-by-day planning |
| **Budget** | `models/Budget.js` | Trip budget tracking |
| **Expense** | `models/Expense.js` | Individual expense items |
| **PackingItem** | `models/PackingItem.js` | Packing checklist items |
| **Journal** | `models/Journal.js` | Trip journals |
| **JournalNote** | `models/JournalNote.js` | Individual journal notes |
| **SavedItem** | `models/SavedItem.js` | Saved/bookmarked items |
| **SavedPlace** | `models/SavedPlace.js` | Saved places |
| **Booking** | `models/Booking.js` | Travel bookings |
| **Notification** | `models/Notification.js` | User notifications |
| **ChatMessage** | `models/ChatMessage.js` | Chatbot conversation history |
| **Destination** | `models/Destination.js` | Destination data |
| **Wishlist** | `models/Wishlist.js` | User wishlists |
| **UserPreference** | `models/UserPreference.js` | User travel preferences |
| **SearchHistory** | `models/SearchHistory.js` | Search history tracking |

---

## 5. Environment Configuration

### Backend (`BACKEND/.env.example`)
| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 5000 | Express server port |
| `MONGO_URI` | `mongodb://localhost:27017/traveloop` | MongoDB connection string |
| `JWT_SECRET` | (placeholder) | JWT signing secret |
| `JWT_EXPIRES_IN` | 7d | Token expiration |
| `CLIENT_URL` | `http://localhost:5173` | CORS allowed origin |
| `GEMINI_API_KEY` | — | Google Gemini AI key |
| `AI_PROVIDER` | gemini | AI provider (gemini) |
| `GOOGLE_MAPS_API_KEY` | — | Google Maps/Places/Directions |
| `AMADEUS_CLIENT_ID` | — | Amadeus flight API OAuth2 |
| `AMADEUS_CLIENT_SECRET` | — | Amadeus secret |
| `TRIPADVISOR_API_KEY` | — | TripAdvisor Content API |
| `UNSPLASH_ACCESS_KEY` | — | Unsplash images |
| `OPENWEATHER_API_KEY` | — | Weather data |
| `EMAIL_HOST` | smtp.gmail.com | SMTP host |
| `EMAIL_PORT` | 587 | SMTP port |
| `EMAIL_USER` | — | SMTP username |
| `EMAIL_PASS` | — | SMTP password |
| `EMAIL_FROM` | Traveloop <noreply@traveloop.com> | Sender address |

### Frontend (`FRONTEND/.env.example`)
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## 6. Frontend Architecture

### 6.1 Technology Stack
- **Framework:** React 19.2.5
- **Build:** Vite 8.0.10
- **Routing:** React Router DOM 7.15.0 (client-side)
- **State:** Redux Toolkit 2.11.2 with RTK Query
- **Styling:** Tailwind CSS 3.4.19
- **Animation:** Framer Motion 12.38.0
- **Icons:** Lucide React 1.14.0 + React Icons 5.6.0
- **Maps:** Leaflet + React Leaflet 5.0.0
- **Forms:** React Hook Form 7.75.0
- **UI:** Headless UI 2.2.10

### 6.2 Route Map
| Path | Component | Protected | Lazy |
|------|-----------|-----------|------|
| `/` | Redirect → `/onboarding` | No | — |
| `/onboarding` | OnboardingScreen | No | Yes |
| `/welcome` | WelcomeScreen | No | Yes |
| `/login` | LoginScreen | No | Yes |
| `/signup` | SignupScreen | No | Yes |
| `/forgot-password` | AuthFlowScreen (forgot) | No | Yes |
| `/reset-password` | AuthFlowScreen (reset) | No | Yes |
| `/verify-email` | AuthFlowScreen (verify) | No | Yes |
| `/complete-profile` | AuthFlowScreen (complete) | Yes | Yes |
| `/home` | HomePage | Yes | Yes |
| `/trip/:id` | TripDetailScreen | Yes | Yes |
| `/create-trip` | CreateTripScreen | Yes | Yes |
| `/my-trips` | MyTripsScreen | Yes | Yes |
| `/explore` | ExploreScreen | Yes | Yes |
| `/destinations/:id` | DestinationDetailScreen | Yes | Yes |
| `/saved` | SavedScreen | Yes | Yes |
| `/notifications` | NotificationsScreen | Yes | Yes |
| `/search` | GlobalSearchScreen | Yes | Yes |
| `/itinerary-builder` | ItineraryBuilderScreen | Yes | Yes |
| `/itinerary-view` | ItineraryViewScreen | Yes | Yes |
| `/budget` | BudgetScreen | Yes | Yes |
| `/packing` | PackingScreen | Yes | Yes |
| `/journal` | JournalScreen | Yes | Yes |
| `/profile` | ProfileScreen | Yes | Yes |

### 6.3 Authentication Flow
- **AuthContext** (`context/AuthContext.jsx`): Provides user state, login/register/logout functions
- **Guest mode:** Falls back to offline user when backend is unreachable
- **Token storage:** localStorage (remember me) or sessionStorage
- **ProtectedRoute:** Shows loading spinner while initializing auth, redirects to `/login` if unauthenticated
- **API wrapper:** Auto-attaches Bearer token; handles 401 responses by clearing token

### 6.4 State Management
- **Redux Store** (`store.js`): Configured with RTK Query `apiSlice` middleware
- **apiSlice** (`services/apiSlice.js`): Currently exposes `getTopTrips` and `getLatestTrips` endpoints
- **Legacy API** (`services/api.js`): Manual fetch wrapper with `authApi`, `tripsApi`, `notificationApi` helpers

### 6.5 Chatbot Widget
- **TravelChatbot** (`components/chatbot/TravelChatbot.jsx`): 408-line component
  - Floating FAB button (bottom-right) → expandable dialog
  - Message history persisted to localStorage
  - Supports text input + voice input (Web Speech API)
  - Quick suggestion chips, typing indicator
  - Renders assistant responses: text, destination cards, action links
  - Framer Motion animations for open/close
  - Communicates via `/api/chatbot/message` POST endpoint

---

## 7. Mobile Architecture

### 7.1 Technology Stack
- **Framework:** React Native 0.81.5
- **Platform:** Expo 54.0.33
- **Navigation:** React Navigation 7 (native-stack + bottom-tabs)
- **Styling:** NativeWind 4.2.3 (Tailwind CSS for RN)
- **Icons:** Lucide React Native 1.17.0
- **Storage:** AsyncStorage 2.2.0, expo-secure-store 15.0.8
- **Auth:** expo-local-authentication 17.0.8 (biometric placeholder)
- **Haptics:** expo-haptics 15.0.8
- **Animation:** react-native-reanimated 4.1.1

### 7.2 Navigation Structure
```
Stack Navigator (root)
├── Splash → Onboarding → Login/Register → MainTabs
│
├── MainTabs (Bottom Tab Navigator)
│   ├── Home (HomeScreen)
│   ├── Explore (ExploreScreen)
│   ├── Trips (MyTripsScreen)
│   ├── Wishlist (WishlistScreen)
│   └── Profile (ProfileScreen)
│
└── Modal Screens (pushed on stack)
    ├── TripDetails
    ├── DestinationDetail
    ├── Booking
    ├── CreateTrip
    ├── ItineraryBuilder
    ├── ItineraryView
    ├── Budget
    ├── Packing
    ├── Journal
    └── Chatbot
```

### 7.3 API Layer Status
The mobile `services/api.js` contains:
- **Working mocks:** `getTrendingDestinations`, `getSeasonalRecommendations`, `getDestinationDetails`, `searchDestinations`
- **Stub hooks:** `authApi`, `tripsApi`, `chatbotApi`, `journalApi`, `notificationsApi`, `bookingsApi`, `wishlistApi` — wired but using empty implementations pending backend connectivity

### 7.4 Key Services
| Service | Purpose |
|---------|---------|
| `tokenStorage.js` | Secure token persistence via expo-secure-store |
| `storage.js` | General AsyncStorage wrapper |
| `cacheManager.js` | Local data caching |
| `locationService.js` | Device geolocation |
| `currency.js` | Currency formatting |
| `validators.js` | Form input validation |

---

## 8. Seed/Mock Data

### Destinations (`BACKEND/src/data/destinations.js`)
6 predefined destinations with full details:
1. **Paris, France** — Sightseeing, budget ₹2500, rating 4.8
2. **Tokyo, Japan** — Food Tour, budget ₹3200, rating 4.9
3. **Bali, Indonesia** — Beach, budget ₹1800, rating 4.7
4. **Dubai, UAE** — Luxury, budget ₹3500, rating 4.6
5. **Singapore** — Family, budget ₹2800, rating 4.7
6. **Goa, India** — Budget Friendly, budget ₹800, rating 4.3

Each includes: image, description, bestTimeToVisit, location (lat/lng), activities[], foodRecommendations[], nearbyAttractions[].

---

## 9. External Service Integrations

| Service | Provider | Status | Used In |
|---------|----------|--------|---------|
| AI Chatbot | Google Gemini (gemini-2.5-flash) | Configured | `chatbotService.js` |
| Email | Nodemailer (Gmail SMTP) | Configured | `emailService.js` |
| Maps/Places | Google Maps API | Ready | `googleMapsService.js` |
| Flights/Hotels | Amadeus API (OAuth2) | Ready | `amadeusService.js` |
| Reviews/Content | TripAdvisor Content API | Ready | `tripadvisorService.js` |
| Images | Unsplash API | Ready | `unsplashService.js` |
| Weather | OpenWeatherMap | Ready | `weatherService.js` |
| Recommendations | Custom AI engine | Ready | `recommendationService.js` |
| Google OAuth | Google Auth Library | Ready | `authController.js` |

---

## 10. Middleware & Security

| Middleware | Purpose |
|------------|---------|
| `helmet` | Security headers |
| `cors` | Cross-origin (CLIENT_URL) |
| `express.json` / `urlencoded` | Body parsing |
| `morgan` | HTTP logging (dev only) |
| `apiLimiter` | Rate limiting on all `/api/*` routes |
| `authLimiter` | Stricter rate limit on login |
| `protect` | JWT Bearer token verification |
| `validateRequest` | express-validator error handling |
| `notFound` | 404 catch-all |
| `errorHandler` | Global error response (stack in dev) |

---

## 11. Build & Dev Commands

### Backend
```bash
cd BACKEND
npm install
npm run dev      # nodemon server.js
npm start        # node server.js
npm run seed     # seed explore data
```

### Frontend
```bash
cd FRONTEND
npm install
npm run dev      # vite (port 5173, proxies /api → :5000)
npm run build    # vite build
npm run lint     # eslint
npm run preview  # vite preview
```

### Mobile
```bash
cd MOBILE
npm install
npm start        # expo start
npm run android  # expo start --android
npm run ios      # expo start --ios
```

---

## 12. Key Observations

1. **Offline-first design:** Both frontend and mobile have mock/fallback layers so the app is usable without backend connectivity.
2. **Monorepo structure:** BACKEND, FRONTEND, MOBILE are separate npm projects with independent `package.json` files (no workspaces).
3. **Backend completeness:** 25 route modules, 22 controllers, 15 models, 9 services — comprehensive API coverage.
4. **Frontend completeness:** 28 page components, reusable UI kit, Redux store, auth context, chatbot widget — full feature parity with backend.
5. **Mobile parity:** Screens mirror frontend feature set; 17 components, 8 services, 3 custom hooks — but API integration stubs still need backend wiring.
6. **Environment separation:** Each tier has its own `.env.example` with clear variable documentation.
7. **Testing state:** CLAUDE.md references Jest (backend) and Vitest (frontend) test commands, but test files are co-located with modules — no `__tests__` directories found in glob results.
8. **No CI/CD config visible:** GitHub Actions mentioned in CLAUDE.md but not present in repo files.
9. **Tailwind across platforms:** Same design system (Tailwind) used in both web (Tailwind CSS) and mobile (NativeWind).
10. **Vite proxy:** Frontend dev server proxies `/api` → `http://127.0.0.1:5000`, avoiding CORS issues in development.