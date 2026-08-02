# 💻 Traveloop Web Frontend

The React + Vite single-page application for **Traveloop**. Provides an interactive dashboard, trip creation wizard, day-by-day itinerary builder, budget tracker, packing list manager, travel journal, destination explorer, and AI travel chatbot.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide Icons (`lucide-react`)
- **Maps**: Mapbox GL JS (`maplibre-gl`)
- **Authentication**: `@react-oauth/google`, Custom CSRF & Cookie fetcher
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Deployment**: Vercel

---

## 📦 Setup & Installation

1. Navigate to `FRONTEND`:
   ```bash
   cd FRONTEND
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Environment Variables:
   ```env
   VITE_API_URL=/api
   VITE_CHATBOT_API_URL=/api/chatbot/message
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

---

## 🧪 Testing & Build

```bash
# Run unit & component tests
npm test

# Production build
npm run build
```
