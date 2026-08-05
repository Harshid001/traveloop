const rateLimit = require('express-rate-limit');

const inTest = process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => inTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes'
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => inTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after an hour'
    });
  },
});

const protectedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => inTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests to this protected resource, please slow down'
    });
  },
});

const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => inTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many share link requests, please try again later'
    });
  },
});

module.exports = { apiLimiter, authLimiter, protectedLimiter, shareLimiter };