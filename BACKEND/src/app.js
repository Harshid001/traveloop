const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const packingRoutes = require('./routes/packingRoutes');
const journalRoutes = require('./routes/journalRoutes');
const savedRoutes = require('./routes/savedRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exploreRoutes = require('./routes/exploreRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/explore', exploreRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
