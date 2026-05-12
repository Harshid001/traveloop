const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 auth requests per hour
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour'
  }
});

module.exports = { apiLimiter, authLimiter };
