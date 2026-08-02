# ⚙️ Traveloop Backend API

The Express / Node.js serverless REST API for **Traveloop**. Handles authentication, trip management, itineraries, budgets, packing lists, travel journals, destination discovery, and AI travel assistant responses.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT Authentication, Cookie Parser, `csrf-csrf` Double CSRF protection, Helmet Security Headers, CORS, `express-rate-limit`
- **AI Integrations**: Google Gemini API (`@google/generative-ai`), OpenAI API (`openai`) with automatic fallback
- **Logging & Monitoring**: Winston logger, Sentry error tracking
- **Documentation**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Deployment**: Vercel Serverless Functions

---

## 📦 Setup & Installation

1. Navigate to the `BACKEND` directory:
   ```bash
   cd BACKEND
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Environment Variables breakdown:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/traveloop
   JWT_SECRET=traveloop_default_jwt_secret_key_min_32_chars_long
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   MOBILE_URL=http://localhost:19000

   # AI Assistant (Optional)
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   AI_PROVIDER=gemini

   # Third-Party APIs (Optional)
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Run locally:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

---

## 🧪 Testing

Run backend Jest test suites:
```bash
npm test
```

---

## 📚 Interactive API Documentation

When running locally, Swagger UI documentation is available at:
`http://localhost:5000/api-docs`

In production:
`https://traveloop-backend.vercel.app/api-docs`
