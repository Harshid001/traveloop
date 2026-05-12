const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validateRequest
  ],
  registerUser
);

router.post(
  '/login',
  authLimiter,
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    validateRequest
  ],
  loginUser
);

router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
