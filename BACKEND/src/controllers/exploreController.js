const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { filterDestinations } = require('./destinationController');

// Dummy data for explore section since we might not have a full DB for this,
// or we can query from a generic "Explore" collection.
// Based on spec, we return destinations.
const exploreData = [
  {
    id: "1",
    name: "Goa",
    country: "India",
    type: "beach",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
    rating: 4.7,
    description: "Famous for its beaches and vibrant nightlife.",
    bestTime: "November to February",
    estimatedBudget: 12000
  },
  {
    id: "2",
    name: "Kyoto",
    country: "Japan",
    type: "culture",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    rating: 4.9,
    description: "Historic temples and beautiful gardens.",
    bestTime: "March to May",
    estimatedBudget: 35000
  },
  {
    id: "3",
    name: "Swiss Alps",
    country: "Switzerland",
    type: "mountain",
    image: "https://images.unsplash.com/photo-1531366936337-77b5d32c918a",
    rating: 4.8,
    description: "Stunning mountain ranges perfect for skiing.",
    bestTime: "December to March",
    estimatedBudget: 50000
  }
];

// @desc    Get explore destinations
// @route   GET /api/explore
// @access  Public
const getExploreData = asyncHandler(async (req, res) => {
  let data = filterDestinations({
    search: req.query.search,
    category: req.query.category || req.query.type,
    budget: req.query.budget,
    rating: req.query.rating,
    sort: req.query.sort,
  });

  if (!data.length) data = exploreData;

  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  getExploreData
};
