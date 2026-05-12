const express = require('express');
const { body } = require('express-validator');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getUpcomingTrips,
  getRecentTrips
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/upcoming', protect, getUpcomingTrips);
router.get('/recent', protect, getRecentTrips);

router.route('/')
  .get(protect, getTrips)
  .post(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('destination', 'Destination is required').not().isEmpty(),
      body('startDate', 'Start date is required').not().isEmpty(),
      body('endDate', 'End date is required').not().isEmpty(),
      validateRequest
    ],
    createTrip
  );

router.route('/:id')
  .get(protect, getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

module.exports = router;
