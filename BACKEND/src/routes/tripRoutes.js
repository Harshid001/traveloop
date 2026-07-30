const express = require('express');
const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/apiResponse');
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
const { shareLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/upcoming', protect, getUpcomingTrips);
router.get('/recent', protect, getRecentTrips);

router.get('/share/:shareId', shareLimiter, async (req, res) => {
  const { shareId } = req.params;
  try {
    const trip = await require('../models/Trip').findOne({ shareId }).lean();
    if (!trip) return errorResponse(res, 404, 'Trip not found');
    successResponse(res, 200, 'Trip fetched successfully', trip);
  } catch (e) {
    console.error(e);
    errorResponse(res, 500, 'Server error');
  }
});

router.route('/')
  .get(protect, getTrips)
  .post(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('startDate', 'Start date is required').not().isEmpty(),
      body('endDate', 'End date is required').not().isEmpty(),
      validateRequest
    ],
    createTrip
  );

router.route('/:id')
  .get(protect, getTrip)
  .put(protect,
    [
      body('title', 'Title must be a string').optional().isString(),
      body('startDate', 'Start date must be a valid date').optional().isISO8601(),
      body('endDate', 'End date must be a valid date').optional().isISO8601(),
      validateRequest,
    ],
    updateTrip
  )
  .delete(protect, deleteTrip);

module.exports = router;
