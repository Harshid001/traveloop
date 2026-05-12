const Trip = require('../models/Trip');
const SavedPlace = require('../models/SavedPlace');
const Journal = require('../models/Journal');
const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalTrips, upcomingTripsCount, savedPlaces, journalEntries, recentTrips, upcomingTripList, budgets] = await Promise.all([
    Trip.countDocuments({ user: userId }),
    Trip.countDocuments({ user: userId, status: 'upcoming' }),
    SavedPlace.countDocuments({ user: userId }),
    Journal.countDocuments({ user: userId }),
    Trip.find({ user: userId }).sort({ createdAt: -1 }).limit(3),
    Trip.find({ user: userId, status: 'upcoming' }).sort({ startDate: 1 }).limit(1),
    Budget.find({ user: userId })
  ]);

  let totalBudget = 0;
  let totalSpent = 0;

  budgets.forEach(b => {
    totalBudget += b.totalBudget || 0;
    const spent = b.expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
    totalSpent += spent;
  });

  res.status(200).json({
    success: true,
    data: {
      totalTrips,
      upcomingTrips: upcomingTripsCount,
      savedPlaces,
      journalEntries,
      recentTrips,
      upcomingTrip: upcomingTripList.length > 0 ? upcomingTripList[0] : null,
      budgetSummary: {
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent
      }
    }
  });
});

module.exports = {
  getDashboardSummary
};
