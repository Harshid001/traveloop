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
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [totalTrips, upcomingTripsCount, savedPlaces, journalEntries, recentTrips, upcomingTripList, budgets, totalTripsCount] = await Promise.all([
    Trip.countDocuments({ user: userId }),
    Trip.countDocuments({ user: userId, status: 'upcoming' }),
    SavedPlace.countDocuments({ user: userId }),
    Journal.countDocuments({ user: userId }),
    Trip.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Trip.find({ user: userId, status: 'upcoming' }).sort({ startDate: 1 }).limit(1),
    Budget.find({ user: userId }),
    Trip.countDocuments({ user: userId }),
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
      },
      pagination: {
        page,
        limit,
        total: totalTripsCount,
        pages: Math.ceil(totalTripsCount / limit),
      },
    }
  });
});

module.exports = {
  getDashboardSummary
};
