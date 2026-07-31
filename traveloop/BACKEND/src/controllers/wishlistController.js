const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });
  successResponse(res, 200, 'Wishlist fetched successfully', items);
});

const saveWishlistItem = asyncHandler(async (req, res) => {
  const destinationId = String(req.params.destinationId);
  const payload = {
    user: req.user._id,
    destinationId,
    name: req.body.name || req.body.title || destinationId,
    title: req.body.title || req.body.name || destinationId,
    country: req.body.country || '',
    location: req.body.location || req.body.destination || '',
    image: req.body.image || '',
    rating: req.body.rating || 0,
    price: req.body.price || '',
    budgetAmount: req.body.budgetAmount || req.body.estimatedCost || 0,
    type: req.body.type || 'city',
    notes: req.body.notes || '',
    tags: req.body.tags || [],
  };

  const item = await Wishlist.findOneAndUpdate(
    { user: req.user._id, destinationId },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  successResponse(res, 201, 'Destination saved to wishlist', item);
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndDelete({ user: req.user._id, destinationId: String(req.params.destinationId) });
  successResponse(res, 200, 'Destination removed from wishlist');
});

module.exports = {
  getWishlist,
  saveWishlistItem,
  removeWishlistItem,
};
