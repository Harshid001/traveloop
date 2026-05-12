const express = require('express');
const {
  getItinerary,
  addDayToItinerary,
  updateItineraryDay,
  deleteItineraryDay,
  addActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getItinerary)
  .post(protect, addDayToItinerary);

router.route('/:id')
  .put(protect, updateItineraryDay)
  .delete(protect, deleteItineraryDay);

router.post('/:id/activity', protect, addActivity);
router.route('/:id/activity/:activityId')
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);

module.exports = router;
