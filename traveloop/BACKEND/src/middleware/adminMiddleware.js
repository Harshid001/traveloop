const { errorResponse } = require('../utils/apiResponse');

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 403, 'Not authorized as an admin');
};

module.exports = { admin };