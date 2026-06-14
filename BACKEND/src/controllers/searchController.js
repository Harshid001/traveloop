const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { filterDestinations } = require('./destinationController');
const Trip = require('../models/Trip');
const Journal = require('../models/Journal');
const SavedPlace = require('../models/SavedPlace');

const globalSearch = asyncHandler(async (req, res) => {
  const text = req.query.q || req.query.search || '';
  const destinations = filterDestinations({ search: text }).map((item) => ({
    type: 'destination',
    id: item.id,
    title: item.name,
    subtitle: item.country,
    image: item.image,
  }));

  if (!req.user) {
    return successResponse(res, 200, 'Search results fetched successfully', {
      destinations,
      trips: [],
      journalNotes: [],
      savedItems: [],
    });
  }

  const regex = { $regex: text, $options: 'i' };
  const [trips, journalNotes, savedItems] = await Promise.all([
    Trip.find({ user: req.user._id, $or: [{ title: regex }, { destination: regex }] }).limit(10),
    Journal.find({ user: req.user._id, $or: [{ title: regex }, { content: regex }, { location: regex }] }).limit(10),
    SavedPlace.find({ user: req.user._id, $or: [{ name: regex }, { destination: regex }, { notes: regex }] }).limit(10),
  ]);

  successResponse(res, 200, 'Search results fetched successfully', {
    destinations,
    trips,
    journalNotes,
    savedItems,
  });
});

module.exports = { globalSearch };
