const express = require('express');
const { body } = require('express-validator');
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
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getItinerary)
  .post(protect,
    [
      body('dayNumber', 'Day number is required').isNumeric(),
      validateRequest,
    ],
    addDayToItinerary
  );

router.route('/:id')
  .put(protect,
    [
      body('dayNumber', 'Day number must be a number').optional().isNumeric(),
      validateRequest,
    ],
    updateItineraryDay
  )
  .delete(protect, deleteItineraryDay);

router.post('/:id/activity',
  protect,
  [
    body('activity.title', 'Activity title is required').not().isEmpty(),
    validateRequest,
  ],
  addActivity
);
router.route('/:id/activity/:activityId')
  .put(protect,
    [
      body('activity.title', 'Activity title must be a string').optional().isString(),
      validateRequest,
    ],
    updateActivity
  )
  .delete(protect, deleteActivity);

module.exports = router;