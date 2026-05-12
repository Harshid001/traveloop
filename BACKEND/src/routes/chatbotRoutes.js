const express = require('express');
const { processMessage } = require('../controllers/chatbotController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

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
    } catch (error) {
      // Just proceed as guest if token is invalid
    }
  }
  next();
};

router.post('/message', optionalProtect, processMessage);

module.exports = router;
