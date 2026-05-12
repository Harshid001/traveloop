const Journal = require('../models/Journal');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all journal entries for user
// @route   GET /api/journals
// @access  Private
const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ user: req.user._id }).sort({ date: -1 });
  successResponse(res, 200, 'Journals fetched successfully', journals);
});

// @desc    Get journals for specific trip
// @route   GET /api/journals/trip/:tripId
// @access  Private
const getJournalsByTrip = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ user: req.user._id, trip: req.params.tripId }).sort({ date: -1 });
  successResponse(res, 200, 'Trip journals fetched successfully', journals);
});

// @desc    Get single journal entry
// @route   GET /api/journals/:id
// @access  Private
const getJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });

  if (!journal) {
    return errorResponse(res, 404, 'Journal entry not found');
  }

  successResponse(res, 200, 'Journal entry fetched successfully', journal);
});

// @desc    Create journal entry
// @route   POST /api/journals
// @access  Private
const createJournal = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  const journal = await Journal.create(req.body);

  successResponse(res, 201, 'Journal entry created successfully', journal);
});

// @desc    Update journal entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!journal) {
    return errorResponse(res, 404, 'Journal entry not found');
  }

  successResponse(res, 200, 'Journal entry updated successfully', journal);
});

// @desc    Delete journal entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!journal) {
    return errorResponse(res, 404, 'Journal entry not found');
  }

  successResponse(res, 200, 'Journal entry deleted successfully', {});
});

module.exports = {
  getJournals,
  getJournalsByTrip,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal
};
