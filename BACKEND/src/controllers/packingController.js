const PackingItem = require('../models/PackingItem');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get packing items for a trip
// @route   GET /api/packing/:tripId
// @access  Private
const getPackingItems = asyncHandler(async (req, res) => {
  const items = await PackingItem.find({ trip: req.params.tripId, user: req.user._id });

  successResponse(res, 200, 'Packing items fetched successfully', items);
});

// @desc    Add packing item
// @route   POST /api/packing/:tripId
// @access  Private
const addPackingItem = asyncHandler(async (req, res) => {
  const item = await PackingItem.create({
    user: req.user._id,
    trip: req.params.tripId,
    ...req.body
  });

  successResponse(res, 201, 'Packing item added successfully', item);
});

// @desc    Update packing item
// @route   PUT /api/packing/:itemId
// @access  Private
const updatePackingItem = asyncHandler(async (req, res) => {
  const item = await PackingItem.findOneAndUpdate(
    { _id: req.params.itemId, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    return errorResponse(res, 404, 'Packing item not found');
  }

  successResponse(res, 200, 'Packing item updated successfully', item);
});

// @desc    Delete packing item
// @route   DELETE /api/packing/:itemId
// @access  Private
const deletePackingItem = asyncHandler(async (req, res) => {
  const item = await PackingItem.findOneAndDelete({ _id: req.params.itemId, user: req.user._id });

  if (!item) {
    return errorResponse(res, 404, 'Packing item not found');
  }

  successResponse(res, 200, 'Packing item deleted successfully', {});
});

// @desc    Toggle packed status
// @route   PATCH /api/packing/:itemId/toggle
// @access  Private
const togglePackedStatus = asyncHandler(async (req, res) => {
  const item = await PackingItem.findOne({ _id: req.params.itemId, user: req.user._id });

  if (!item) {
    return errorResponse(res, 404, 'Packing item not found');
  }

  item.packed = !item.packed;
  await item.save();

  successResponse(res, 200, 'Packing item status toggled', item);
});

module.exports = {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePackedStatus
};
