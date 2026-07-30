const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
  verifyEmail,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter,
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must include a number')
      .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character'),
    validateRequest
  ],
  registerUser
);

router.post('/register', authLimiter,
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must include a number')
      .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character'),
    validateRequest
  ],
  registerUser
);

router.post('/login', authLimiter,
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    validateRequest
  ],
  loginUser
);

router.post('/forgot-password', authLimiter,
  [
    body('email', 'Please include a valid email').isEmail(),
    validateRequest,
  ],
  forgotPassword
);
router.post('/google', authLimiter, googleLogin);

router.get('/me', protect, getUserProfile);
router.put('/profile', protect,
  [
    body('name', 'Name must be a string').optional().isString().isLength({ min: 1 }),
    body('email', 'Please include a valid email').optional().isEmail(),
    validateRequest,
  ],
  updateUserProfile
);
router.post('/logout', logoutUser);
router.post('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must include a number')
      .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character'),
    validateRequest,
  ],
  resetPassword
);
router.post('/verify-email', verifyEmail);

module.exports = router;