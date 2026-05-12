const Itinerary = require('../models/Itinerary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get itinerary for a trip
// @route   GET /api/itineraries/:tripId
// @access  Private
const getItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ trip: req.params.tripId, user: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary not found');
  }

  successResponse(res, 200, 'Itinerary fetched successfully', itinerary);
});

// @desc    Create/Update day in itinerary
// @route   POST /api/itineraries/:tripId
// @access  Private
const addDayToItinerary = asyncHandler(async (req, res) => {
  let itinerary = await Itinerary.findOne({ trip: req.params.tripId, user: req.user._id });

  if (!itinerary) {
    // Should have been created with trip, but just in case
    itinerary = await Itinerary.create({
      user: req.user._id,
      trip: req.params.tripId,
      days: [req.body]
    });
  } else {
    itinerary.days.push(req.body);
    await itinerary.save();
  }

  successResponse(res, 201, 'Day added to itinerary successfully', itinerary);
});

// @desc    Update itinerary day
// @route   PUT /api/itineraries/:id
// @access  Private
const updateItineraryDay = asyncHandler(async (req, res) => {
  // :id is the itinerary document id. req.body should contain day data with _id to update
  const { dayId, updates } = req.body;
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, "days._id": dayId },
    { $set: { "days.$": { ...updates, _id: dayId } } },
    { new: true }
  );

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary or day not found');
  }

  successResponse(res, 200, 'Itinerary day updated successfully', itinerary);
});

// @desc    Delete itinerary day
// @route   DELETE /api/itineraries/:id
// @access  Private
const deleteItineraryDay = asyncHandler(async (req, res) => {
  const { dayId } = req.body;
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $pull: { days: { _id: dayId } } },
    { new: true }
  );

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary not found');
  }

  successResponse(res, 200, 'Itinerary day deleted successfully', itinerary);
});

// @desc    Add activity to itinerary day
// @route   POST /api/itineraries/:id/activity
// @access  Private
const addActivity = asyncHandler(async (req, res) => {
  const { dayId, activity } = req.body;
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, "days._id": dayId },
    { $push: { "days.$.activities": activity } },
    { new: true }
  );

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary or day not found');
  }

  successResponse(res, 201, 'Activity added successfully', itinerary);
});

// @desc    Update activity in itinerary day
// @route   PUT /api/itineraries/:id/activity/:activityId
// @access  Private
const updateActivity = asyncHandler(async (req, res) => {
  const { dayId, updates } = req.body;
  const { activityId } = req.params;

  // This requires a bit complex query in Mongoose. We'll use the arrayFilters approach
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { "days.$[day].activities.$[act]": { ...updates, _id: activityId } } },
    { 
      arrayFilters: [{ "day._id": dayId }, { "act._id": activityId }],
      new: true 
    }
  );

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary, day, or activity not found');
  }

  successResponse(res, 200, 'Activity updated successfully', itinerary);
});

// @desc    Delete activity
// @route   DELETE /api/itineraries/:id/activity/:activityId
// @access  Private
const deleteActivity = asyncHandler(async (req, res) => {
  const { dayId } = req.body; // or req.query
  const { activityId } = req.params;

  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, "days._id": dayId },
    { $pull: { "days.$.activities": { _id: activityId } } },
    { new: true }
  );

  if (!itinerary) {
    return errorResponse(res, 404, 'Itinerary or day not found');
  }

  successResponse(res, 200, 'Activity deleted successfully', itinerary);
});

module.exports = {
  getItinerary,
  addDayToItinerary,
  updateItineraryDay,
  deleteItineraryDay,
  addActivity,
  updateActivity,
  deleteActivity
};
