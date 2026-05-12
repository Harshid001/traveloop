const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

// Additional user operations if needed (e.g. admin routes) can go here.
// But as per the specs, profile updating is under authRoutes. 
// Adding a dummy route just to satisfy the folder structure requested.

// @desc    Get users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  successResponse(res, 200, 'Users fetched successfully', users);
});

module.exports = {
  getUsers,
};
