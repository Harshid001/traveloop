const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const staticDestinations = require('../data/destinations');

function filterDestinations(query) {
  const { search, category, budget, rating, sort } = query;
  let data = [...staticDestinations];

  if (search) {
    const text = search.toLowerCase();
    data = data.filter((item) =>
      `${item.name} ${item.country} ${item.category} ${item.description} ${item.activities.join(' ')}`
        .toLowerCase()
        .includes(text),
    );
  }

  if (category && category !== 'All') {
    data = data.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (budget === 'low') data = data.filter((item) => item.budgetEstimate <= 1800);
  if (budget === 'medium') data = data.filter((item) => item.budgetEstimate > 1800 && item.budgetEstimate <= 3200);
  if (budget === 'high') data = data.filter((item) => item.budgetEstimate > 3200);
  if (rating) data = data.filter((item) => item.rating >= Number(rating));

  if (sort === 'highest-rated') data.sort((a, b) => b.rating - a.rating);
  if (sort === 'low-budget') data.sort((a, b) => a.budgetEstimate - b.budgetEstimate);
  if (sort === 'high-budget') data.sort((a, b) => b.budgetEstimate - a.budgetEstimate);

  return data;
}

const getDestinations = asyncHandler(async (req, res) => {
  successResponse(res, 200, 'Destinations fetched successfully', filterDestinations(req.query));
});

const getDestination = asyncHandler(async (req, res) => {
  const destination = staticDestinations.find((item) => item.id === String(req.params.id));
  if (!destination) return errorResponse(res, 404, 'Destination not found');
  successResponse(res, 200, 'Destination fetched successfully', destination);
});

module.exports = {
  getDestinations,
  getDestination,
  filterDestinations,
};
