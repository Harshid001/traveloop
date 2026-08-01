const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const amadeusService = require('../services/amadeusService');
const destinationStore = require('../services/destinationStore');
const Trip = require('../models/Trip');
const Journal = require('../models/Journal');
const SavedPlace = require('../models/SavedPlace');

const globalSearch = asyncHandler(async (req, res) => {
  const text = req.query.q || req.query.search || '';
  let destinations = [];
  try {
    const dbResults = await destinationStore.search(text);
    if (dbResults.length) {
      destinations = dbResults.slice(0, 10).map((item) => {
        const card = destinationStore.toCard(item);
        return {
          type: 'destination',
          id: card.id,
          title: card.name,
          subtitle: card.country,
          image: card.image?.url || null,
        };
      });
    } else {
      const results = await amadeusService.searchDestinations(text || '');
      destinations = results.slice(0, 10).map((item) => ({
        type: 'destination',
        id: item.iataCode || item.name,
        title: item.name,
        subtitle: item.country,
        image: null,
      }));
    }
  } catch (err) {
    console.error('searchController: destination search failed:', err.message);
  }

  if (!req.user) {
    return successResponse(res, 200, 'Search results fetched successfully', {
      destinations,
      trips: [],
      journalNotes: [],
      savedItems: [],
    });
  }

  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = { $regex: escapedText, $options: 'i' };
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
