const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');
const { env } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return errorResponse(res, 401, 'Not authorized, user not found');
    }
    next();
  } catch (_error) {
    return errorResponse(res, 401, 'Not authorized, token failed');
  }
});

module.exports = { protect };