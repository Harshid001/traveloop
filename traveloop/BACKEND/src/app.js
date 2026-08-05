const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const xss = require('xss-clean');
const { env, validateEnv } = require('./config/env');

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}
const Sentry = require('@sentry/node');
const { initSentry } = require('./config/sentry');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const { protect } = require('./middleware/authMiddleware');
const { doubleCsrfProtection, csrfErrorHandler } = require('./middleware/csrf');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const packingRoutes = require('./routes/packingRoutes');
const journalRoutes = require('./routes/journalRoutes');
const savedRoutes = require('./routes/savedRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const placesRoutes = require('./routes/placesRoutes');
const discoverRoutes = require('./routes/discoverRoutes');
const mapsRoutes = require('./routes/mapsRoutes');
const imagesRoutes = require('./routes/imagesRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const csrfRoutes = require('./routes/csrfRoutes');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { requestLogger } = require('./config/logger');
const connectDB = require('./config/db');
const app = express();
initSentry(app);

let isDbConnected = false;
app.use(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/' || env.NODE_ENV === 'test') {
    return next();
  }
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('Database connection warning:', err.message);
    }
  }
  next();
});

app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : 0);

app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(compression());

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
  styleSrc: ["'self'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
  connectSrc: ["'self'", 'https://*.googleapis.com'],
};

if (env.CSP_REPORT_URI) {
  cspDirectives.reportUri = env.CSP_REPORT_URI;
}

app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: { directives: cspDirectives },
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'self'"],
      payment: ["'self'"],
      usb: ["'none'"],
      accelerometer: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
    },
  },
}));

if (env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const clientUrls = (env.CLIENT_URL ? env.CLIENT_URL.split(',').map(s => s.trim()) : []);
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  env.MOBILE_URL || 'http://localhost:19000',
  ...clientUrls,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  exposedHeaders: ['x-csrf-token'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(requestLogger);

if (env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Traveloop API Documentation',
}));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Traveloop API Backend is running', version: '1.0.0' });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', version: 'v1' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', version: 'v1' });
});

// Legacy unversioned API route rewrite middleware to support /api/ -> /api/v1/
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/', '/api/v1/');
  }
  next();
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1', csrfRoutes);
app.use('/api/v1', doubleCsrfProtection);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/places', placesRoutes);
app.use('/api/v1/maps', mapsRoutes);
app.use('/api/v1/images', imagesRoutes);
app.use('/api/v1/discover', discoverRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);

app.use('/api/v1/users', protect, userRoutes);
app.use('/api/v1/trips', protect, tripRoutes);
app.use('/api/v1/trips', protect, itineraryRoutes);
app.use('/api/v1/trips', protect, budgetRoutes);
app.use('/api/v1/trips', protect, packingRoutes);
app.use('/api/v1/journals', protect, journalRoutes);
app.use('/api/v1/saved', protect, savedRoutes);
app.use('/api/v1/wishlist', protect, wishlistRoutes);
app.use('/api/v1/bookings', protect, bookingRoutes);
app.use('/api/v1/profile', protect, profileRoutes);
app.use('/api/v1/dashboard', protect, dashboardRoutes);
app.use('/api/v1/export', protect, exportRoutes);
app.use('/api/v1/notifications', protect, notificationRoutes);
app.use('/api/v1/search', protect, searchRoutes);

app.use(csrfErrorHandler);
if (Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return error.status >= 500 || !error.status;
    },
  }));
}
app.use(notFound);
app.use(errorHandler);

module.exports = app;