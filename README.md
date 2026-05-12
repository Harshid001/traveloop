# Traveloop ✈️🌍

Traveloop is a comprehensive, full-stack travel planning application designed to help users organize trips, manage itineraries, track budgets, prepare packing lists, log travel memories in a journal, and discover new destinations. It also features an integrated AI-powered travel assistant to give personalized recommendations and tips.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion (for dynamic, modern UI animations)
- **Routing:** React Router

**Backend:**
- **Framework:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Security:** Helmet, Express Rate Limit, CORS

---

## 📂 Project Structure

The repository is organized into two main workspaces:

- `FRONTEND/`: The React application (UI/UX, pages, components, and frontend logic).
- `BACKEND/`: The Node.js server (RESTful APIs, database models, AI chatbot logic, and authentication).

---

## 🚀 Getting Started

To run Traveloop locally, you will need to start both the backend server and the frontend application.

### 1. Backend Setup

1. Open a terminal and navigate to the `BACKEND` directory:
   ```bash
   cd BACKEND
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Environment Configuration:
   Create a `.env` file in the `BACKEND` directory (you can copy `.env.example`) and add the following keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/traveloop
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_PROVIDER=gemini
   ```
   *(Note: Ensure you have MongoDB installed locally and running, or use a MongoDB Atlas connection string).*
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a **new** terminal window and navigate to the `FRONTEND` directory:
   ```bash
   cd FRONTEND
   ```
2. Install the frontend dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Environment Configuration:
   Create a `.env` file in the root of the `FRONTEND` folder with the following variables so it can talk to the backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CHATBOT_API_URL=http://localhost:5000/api/chatbot/message
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Open this URL in your browser to view the app.*

---

## 🌟 Key Features

*   **User Authentication**: Secure signup and login functionality with JWT. Protected routes ensure that user data remains private.
*   **Trip Dashboard**: An overview of upcoming trips, recent activities, and high-level budget summaries.
*   **Itinerary Builder**: Plan trips day-by-day. Add, edit, or remove specific activities with time and location details.
*   **Budget Tracker**: Set trip budgets and log individual expenses to easily monitor your spending.
*   **Packing Lists**: Dynamically check off items you need to pack for specific trips, categorized for convenience.
*   **Travel Journal**: Write down memories, attach mood indicators, and log locations for your trips.
*   **Saved Places**: Save and rate locations or hotels you wish to visit in the future.
*   **AI Travel Assistant Chatbot**: Ask the AI for destination recommendations, packing advice, or budget tips!

---

## 🛡️ Security

The backend is built with production-grade security practices:
- Passwords are securely hashed using `bcryptjs` before being stored in the database.
- All protected endpoints require a valid Bearer Token (JWT).
- The application uses `helmet` to set secure HTTP headers.
- `express-rate-limit` prevents brute-force attacks by limiting repeated requests.
- Input data is sanitized and validated using `express-validator`.

## 🧑‍💻 Contributing

When contributing to this project, please ensure you check the respective `package.json` for available scripts and stick to the established directory structure. Make sure you test both the UI responsiveness (Tailwind) and the API functionality (Postman/Insomnia) before merging changes.
