const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const amadeusService = require('../services/amadeusService');
const destinationStore = require('../services/destinationStore');

const toAppShape = (item, index = 0) => ({
  id: item.iataCode || item.name || `dest-${index}`,
  name: item.name || item.city || '',
  city: item.city || '',
  country: item.country || '',
  lat: item.coordinates?.lat ?? null,
  lng: item.coordinates?.lng ?? null,
  type: item.type || 'city',
  image: item.image?.url || item.image || null,
  rating: item.rating ?? null,
  budgetEstimate: item.budgetEstimate ?? null,
  description: item.description || '',
  activities: item.activities || [],
});

const getDestinations = asyncHandler(async (req, res) => {
  const { search, category, rating } = req.query;
  const seeded = await destinationStore.isSeeded();

  let data;
  if (search) {
    const dbResults = await destinationStore.search(search);
    if (dbResults.length) {
      data = dbResults.map(destinationStore.toCard);
    } else {
      const results = await amadeusService.searchDestinations(search);
      data = results.map(toAppShape);
    }
  } else if (seeded) {
    data = (await destinationStore.getTrending(20)).map(destinationStore.toCard);
  } else {
    const results = await amadeusService.getRecommendedDestinations();
    data = results.map(toAppShape);
  }

  if (category && category !== 'All') {
    data = data.filter((item) => item.type === category.toLowerCase());
  }
  if (rating) {
    data = data.filter((item) => item.rating !== null && item.rating >= Number(rating));
  }
  successResponse(res, 200, 'Destinations fetched successfully', data);
});

const getDestination = asyncHandler(async (req, res) => {
  const stored = await destinationStore.getById(req.params.id);
  let destination;
  if (stored) {
    destination = destinationStore.toCard(stored);
  } else {
    const code = String(req.params.id).toUpperCase();
    destination = await amadeusService.getCityByCode(code);
  }
  if (!destination) return errorResponse(res, 404, 'Destination not found');
  successResponse(res, 200, 'Destination fetched successfully', destination);
});

module.exports = {
  getDestinations,
  getDestination,
};
