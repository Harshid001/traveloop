const express = require('express');
const { body } = require('express-validator');
const { getBookings, createBooking, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', protect, getBookings);
router.post('/',
  protect,
  [
    body('tripId', 'Trip ID is required').not().isEmpty(),
    body('tripTitle', 'Trip title is required').not().isEmpty(),
    validateRequest,
  ],
  createBooking
);
router.put('/:id/status', protect,
  [
    body('status', 'Status must be confirmed, pending, or cancelled')
      .isIn(['confirmed', 'pending', 'cancelled']),
    validateRequest,
  ],
  updateBookingStatus
);

module.exports = router;