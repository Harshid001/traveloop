const express = require('express');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { globalSearch } = require('../controllers/searchController');

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};

router.get('/', optionalProtect, globalSearch);

module.exports = router;
