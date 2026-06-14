const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, firstName = '', lastName = '', phone = '', location = '' } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return errorResponse(res, 400, 'User already exists');
  }

  const user = await User.create({
    name: name || [firstName, lastName].filter(Boolean).join(' '),
    email,
    password,
    firstName,
    lastName,
    phone,
    location,
    emailVerificationCode: '123456',
  });

  if (user) {
    successResponse(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileComplete: user.profileComplete,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
    });
  } else {
    errorResponse(res, 400, 'Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    successResponse(res, 200, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      travelStyle: user.travelStyle,
      profileComplete: user.profileComplete,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
    });
  } else {
    errorResponse(res, 401, 'Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    successResponse(res, 200, 'User profile fetched successfully', user);
  } else {
    errorResponse(res, 404, 'User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;
    user.travelStyle = req.body.travelStyle || user.travelStyle;
    user.preferredBudget = req.body.preferredBudget || user.preferredBudget;
    user.preferredCurrency = req.body.preferredCurrency || user.preferredCurrency;
    user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
    user.savedTravelersCount = req.body.savedTravelersCount || user.savedTravelersCount;
    user.interests = req.body.interests || user.interests;
    user.profileComplete = req.body.profileComplete ?? true;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    successResponse(res, 200, 'Profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      preferredCurrency: updatedUser.preferredCurrency,
      preferredLanguage: updatedUser.preferredLanguage,
      travelStyle: updatedUser.travelStyle,
      profileComplete: updatedUser.profileComplete,
      token: generateToken(updatedUser._id),
    });
  } else {
    errorResponse(res, 404, 'User not found');
  }
});

// @desc    Forgot Password - Placeholder
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  successResponse(res, 200, 'Password reset link sent to email (placeholder)', {
    resetTokenPlaceholder: 'traveloop-reset-token',
  });
});

// @desc    Reset Password - Placeholder
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = await User.findOne({ email }).select('+password');
    if (user) {
      user.password = password;
      await user.save();
    }
  }
  successResponse(res, 200, 'Password reset successfully');
});

const logoutUser = asyncHandler(async (req, res) => {
  successResponse(res, 200, 'Logout successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (email) {
    await User.findOneAndUpdate({ email }, { emailVerified: true });
  }
  successResponse(res, 200, 'Email verified successfully');
});

const googleLogin = asyncHandler(async (req, res) => {
  const { email = 'google.user@traveloop.app', name = 'Google Traveler' } = req.body;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: `google-${Date.now()}`,
      emailVerified: true,
      profileComplete: true,
    });
  }

  successResponse(res, 200, 'Google login successful', {
    _id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    profileComplete: user.profileComplete,
    token: generateToken(user._id),
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
  verifyEmail,
  googleLogin,
};
