const express = require('express');
const { query } = require('express-validator');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/User');
const { globalSearch } = require('../controllers/searchController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      console.error('Optional auth parsing failed:', err.message);
      req.user = null;
    }
  }
  next();
};

router.get('/',
  optionalProtect,
  [
    query('q', 'Search query is required').not().isEmpty().isString().isLength({ max: 500 }),
    validateRequest,
  ],
  globalSearch
);

module.exports = router;
