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
const {
  getItinerary,
  upsertTripItinerary,
  deleteTripItineraryDay,
} = require('../controllers/itineraryController');
const {
  getTripBudget,
  addTripExpense,
  updateTripExpense,
  deleteTripExpense,
} = require('../controllers/budgetController');
const {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
} = require('../controllers/packingController');
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
      body('startDate', 'Start date is required').not().isEmpty(),
      body('endDate', 'End date is required').not().isEmpty(),
      validateRequest
    ],
    createTrip
  );

router.route('/:tripId/itinerary')
  .get(protect, getItinerary)
  .post(protect, upsertTripItinerary)
  .put(protect, upsertTripItinerary);

router.delete('/:tripId/itinerary/:dayId', protect, deleteTripItineraryDay);

router.get('/:tripId/budget', protect, getTripBudget);
router.post('/:tripId/budget/expenses', protect, addTripExpense);
router.route('/:tripId/budget/expenses/:expenseId')
  .put(protect, updateTripExpense)
  .delete(protect, deleteTripExpense);

router.get('/:tripId/packing', protect, getPackingItems);
router.post('/:tripId/packing/items', protect, addPackingItem);
router.route('/:tripId/packing/items/:itemId')
  .put(protect, updatePackingItem)
  .delete(protect, deletePackingItem);

router.route('/:id')
  .get(protect, getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

module.exports = router;
