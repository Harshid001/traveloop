const express = require('express');
const { getWishlist, saveWishlistItem, removeWishlistItem } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/:destinationId', protect, saveWishlistItem);
router.delete('/:destinationId', protect, removeWishlistItem);

module.exports = router;
