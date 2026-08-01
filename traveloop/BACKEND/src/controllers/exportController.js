const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Budget = require('../models/Budget');
const PackingItem = require('../models/PackingItem');
const Journal = require('../models/Journal');
const SavedPlace = require('../models/SavedPlace');
const Wishlist = require('../models/Wishlist');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Export all user data as JSON (data ownership / portability)
// @route   GET /api/export
// @access  Private
const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [trips, itineraries, budgets, packingItems, journals, savedPlaces, wishlist, bookings] = await Promise.all([
    Trip.find({ user: userId }).lean(),
    Itinerary.find({ user: userId }).lean(),
    Budget.find({ user: userId }).lean(),
    PackingItem.find({ user: userId }).lean(),
    Journal.find({ user: userId }).lean(),
    SavedPlace.find({ user: userId }).lean(),
    Wishlist.find({ user: userId }).lean(),
    Booking.find({ user: userId }).lean(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    application: 'Traveloop',
    version: 1,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    data: {
      trips,
      itineraries,
      budgets,
      packingItems,
      journals,
      savedPlaces,
      wishlist,
      bookings,
    },
    counts: {
      trips: trips.length,
      itineraries: itineraries.length,
      budgets: budgets.length,
      packingItems: packingItems.length,
      journals: journals.length,
      savedPlaces: savedPlaces.length,
      wishlist: wishlist.length,
      bookings: bookings.length,
    },
  };

  const filename = `traveloop-export-${new Date().toISOString().split('T')[0]}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(JSON.stringify(payload, null, 2));
});

module.exports = {
  exportUserData,
};
