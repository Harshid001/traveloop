const express = require('express');
const { getBookings, createBooking, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getBookings);
router.post('/', protect, createBooking);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
