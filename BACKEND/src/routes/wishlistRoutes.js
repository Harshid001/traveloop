const express = require('express');
const { body } = require('express-validator');
const { getWishlist, saveWishlistItem, removeWishlistItem } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/:destinationId',
  protect,
  [
    body('name', 'Destination name is required').not().isEmpty(),
    validateRequest,
  ],
  saveWishlistItem
);
router.delete('/:destinationId', protect, removeWishlistItem);

module.exports = router;