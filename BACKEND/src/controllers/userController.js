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

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, 'User not found');
  successResponse(res, 200, 'Current user fetched successfully', user);
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowed = [
    'name',
    'email',
    'phone',
    'avatar',
    'location',
    'bio',
    'travelStyle',
    'preferredBudget',
    'preferredCurrency',
    'preferredLanguage',
    'currency',
    'language',
    'travelers',
    'preferences',
    'savedTravelersCount',
    'interests',
    'profileComplete',
  ];

  const updates = allowed.reduce((acc, key) => {
    if (req.body[key] !== undefined) acc[key] = req.body[key];
    return acc;
  }, {});

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) return errorResponse(res, 404, 'User not found');
  successResponse(res, 200, 'Profile updated successfully', user);
});

module.exports = {
  getUsers,
  getMe,
  updateMe,
};
