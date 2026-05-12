const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');
const env = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return errorResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }
});

module.exports = { protect };
