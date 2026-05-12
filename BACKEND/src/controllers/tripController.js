const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all trips for user (with pagination, filtering, sorting)
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { user: req.user._id };

  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  const total = await Trip.countDocuments(query);
  const trips = await Trip.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: trips.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: trips
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  successResponse(res, 200, 'Trip fetched successfully', trip);
});

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const trip = await Trip.create(req.body);

  // Initialize empty Itinerary and Budget for this trip
  await Itinerary.create({ user: req.user._id, trip: trip._id, days: [] });
  await Budget.create({ user: req.user._id, trip: trip._id, totalBudget: trip.budget || 0, expenses: [] });

  successResponse(res, 201, 'Trip created successfully', trip);
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = asyncHandler(async (req, res) => {
  let trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  successResponse(res, 200, 'Trip updated successfully', trip);
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  await trip.deleteOne();
  
  // Optionally, cascade delete itinerary and budget
  await Itinerary.deleteOne({ trip: req.params.id });
  await Budget.deleteOne({ trip: req.params.id });

  successResponse(res, 200, 'Trip removed successfully', {});
});

// @desc    Get upcoming trips
// @route   GET /api/trips/upcoming
// @access  Private
const getUpcomingTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ 
    user: req.user._id, 
    status: 'upcoming' 
  }).sort({ startDate: 1 }).limit(5);
  
  successResponse(res, 200, 'Upcoming trips fetched successfully', trips);
});

// @desc    Get recent trips
// @route   GET /api/trips/recent
// @access  Private
const getRecentTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ 
    user: req.user._id 
  }).sort({ createdAt: -1 }).limit(5);
  
  successResponse(res, 200, 'Recent trips fetched successfully', trips);
});

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getUpcomingTrips,
  getRecentTrips
};
