const express = require('express');
const { body } = require('express-validator');
const { processMessage } = require('../controllers/chatbotController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Optional auth middleware specifically for chatbot since it can be public
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_error) {
      // Just proceed as guest if token is invalid
    }
  }
  next();
};

router.post('/message', optionalProtect,
  [
    body('message', 'Message is required').not().isEmpty().isString().isLength({ max: 2000 }),
    validateRequest,
  ],
  (req, res, next) => {
    if (req.body.message && typeof req.body.message === 'string') {
      req.body.message = req.body.message.replace(/<[^>]*>/g, '');
    }
    next();
  },
  processMessage
);

module.exports = router;
