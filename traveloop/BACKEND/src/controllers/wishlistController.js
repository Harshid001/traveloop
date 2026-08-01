const SavedPlace = require('../models/SavedPlace');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// Wishlist endpoints now share the SavedPlace model (single source of truth).
// Kept for backward compatibility with the mobile app; new code should use /api/saved.

const getWishlist = asyncHandler(async (req, res) => {
  const items = await SavedPlace.find({ user: req.user._id, type: 'destination' }).sort({ createdAt: -1 });
  const normalized = items.map((item) => ({
    _id: item._id,
    destinationId: String(item._id),
    name: item.name,
    title: item.name,
    country: item.destination,
    location: item.location || item.destination,
    image: item.image || '',
    rating: item.rating || 0,
    price: item.estimatedCost ? `$${item.estimatedCost}` : '',
    budgetAmount: item.estimatedCost || 0,
    type: item.type,
    notes: item.notes || '',
    tags: item.tags || [],
  }));
  successResponse(res, 200, 'Wishlist fetched successfully', normalized);
});

const saveWishlistItem = asyncHandler(async (req, res) => {
  const payload = {
    user: req.user._id,
    name: req.body.name || req.body.title || String(req.params.destinationId),
    destination: req.body.country || req.body.destination || req.body.location || 'Unknown',
    type: 'destination',
    image: req.body.image || '',
    rating: req.body.rating || 0,
    notes: req.body.notes || '',
    location: req.body.location || req.body.destination || '',
    estimatedCost: req.body.budgetAmount || req.body.estimatedCost || 0,
    tags: req.body.tags || [],
    isFavorite: true,
  };

  const item = await SavedPlace.findOneAndUpdate(
    { user: req.user._id, name: payload.name, type: 'destination' },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  successResponse(res, 201, 'Destination saved to wishlist', item);
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  await SavedPlace.findOneAndDelete({ user: req.user._id, name: String(req.params.destinationId), type: 'destination' });
  successResponse(res, 200, 'Destination removed from wishlist');
});

module.exports = {
  getWishlist,
  saveWishlistItem,
  removeWishlistItem,
};
