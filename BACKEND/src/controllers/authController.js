const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const { setTokenCookie, clearTokenCookie } = require('../utils/setTokenCookie');

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
    // generateVerificationToken will be called after creation
  });

  if (user) {
    // Generate email verification token and send email
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    await require('../services/emailService').sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Please verify your email by clicking the link: ${verificationUrl}`,
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    successResponse(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileComplete: user.profileComplete,
      emailVerified: user.emailVerified,
      token,
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

  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (user.isLocked()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return errorResponse(res, 423, `Account locked. Try again in ${minutes} minute(s).`);
  }

  if (await user.matchPassword(password)) {
    await user.resetLoginAttempts();
    const token = generateToken(user._id);
    setTokenCookie(res, token);
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
      token,
    });
  } else {
    await user.incrementLoginAttempts();
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

    const token = generateToken(updatedUser._id);
    setTokenCookie(res, token);
    successResponse(res, 200, 'Profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      preferredCurrency: updatedUser.preferredCurrency,
      preferredLanguage: updatedUser.preferredLanguage,
      travelStyle: updatedUser.travelStyle,
      profileComplete: updatedUser.profileComplete,
      token,
    });
  } else {
    errorResponse(res, 404, 'User not found');
  }
});

// @desc    Forgot Password – sends a reset token via email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorResponse(res, 400, 'Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal user existence for security
    return successResponse(res, 200, 'If that email exists, a reset link has been sent');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Build reset URL (frontend should handle this endpoint)
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // Send email
  const emailResult = await require('../services/emailService').sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\nIf you did not request this, ignore this email.`,
  });

  if (!emailResult.success) {
    // Cleanup token on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return errorResponse(res, 500, 'Email could not be sent');
  }

  successResponse(res, 200, 'If that email exists, a reset link has been sent');
});

// @desc    Reset Password – validates token and updates password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  if (!password) {
    return errorResponse(res, 400, 'New password is required');
  }

  // Hash token to compare with stored hash
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired reset token');
  }

  // Set new password and clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  successResponse(res, 200, 'Password has been reset successfully');
});

const logoutUser = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  successResponse(res, 200, 'Logout successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return errorResponse(res, 400, 'Verification token is required');
  }

  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired verification token');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  successResponse(res, 200, 'Email verified successfully');
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return errorResponse(res, 400, 'Google ID token is required');
  }

  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  let ticket, payload;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed:', err);
    return errorResponse(res, 401, 'Invalid Google ID token');
  }

  const email = payload.email;
  const name = payload.name || payload.email;

  let user = await User.findOne({ email });
  if (!user) {
    // Create a new user with a random password
    user = await User.create({
      name,
      email,
      password: `google-${Date.now()}`,
      emailVerified: true,
      profileComplete: true,
    });
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);
  successResponse(res, 200, 'Google login successful', {
    _id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    profileComplete: user.profileComplete,
    token,
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
