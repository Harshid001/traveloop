const SavedPlace = require('../models/SavedPlace');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all saved places
// @route   GET /api/saved
// @access  Private
const getSavedPlaces = asyncHandler(async (req, res) => {
  const savedPlaces = await SavedPlace.find({ user: req.user._id }).sort({ createdAt: -1 });
  successResponse(res, 200, 'Saved places fetched successfully', savedPlaces);
});

// @desc    Save a place
// @route   POST /api/saved
// @access  Private
const savePlace = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const place = await SavedPlace.create(req.body);

  successResponse(res, 201, 'Place saved successfully', place);
});

// @desc    Update a saved place
// @route   PUT /api/saved/:id
// @access  Private
const updateSavedPlace = asyncHandler(async (req, res) => {
  const place = await SavedPlace.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!place) {
    return errorResponse(res, 404, 'Saved place not found');
  }

  successResponse(res, 200, 'Saved place updated successfully', place);
});

// @desc    Delete a saved place
// @route   DELETE /api/saved/:id
// @access  Private
const deleteSavedPlace = asyncHandler(async (req, res) => {
  const place = await SavedPlace.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!place) {
    return errorResponse(res, 404, 'Saved place not found');
  }

  successResponse(res, 200, 'Saved place removed successfully', {});
});

// @desc    Toggle favorite status
// @route   PATCH /api/saved/:id/toggle-favorite
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const place = await SavedPlace.findOne({ _id: req.params.id, user: req.user._id });

  if (!place) {
    return errorResponse(res, 404, 'Saved place not found');
  }

  place.isFavorite = !place.isFavorite;
  await place.save();

  successResponse(res, 200, 'Favorite status toggled', place);
});

module.exports = {
  getSavedPlaces,
  savePlace,
  updateSavedPlace,
  deleteSavedPlace,
  toggleFavorite
};
