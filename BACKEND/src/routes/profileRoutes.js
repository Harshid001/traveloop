const express = require('express');
const { body } = require('express-validator');
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', protect, getMe);
router.put('/',
  protect,
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Valid email is required').isEmail(),
    validateRequest,
  ],
  updateMe
);

module.exports = router;