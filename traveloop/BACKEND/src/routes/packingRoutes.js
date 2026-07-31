const express = require('express');
const { body } = require('express-validator');
const {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePackedStatus
} = require('../controllers/packingController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getPackingItems)
  .post(protect,
    [
      body('name', 'Item name is required').not().isEmpty(),
      validateRequest,
    ],
    addPackingItem
  );

router.route('/:itemId')
  .put(protect,
    [
      body('name', 'Item name is required').optional().not().isEmpty(),
      body('quantity', 'Quantity must be a number').optional().isNumeric(),
      validateRequest,
    ],
    updatePackingItem
  )
  .delete(protect, deletePackingItem);

router.patch('/:itemId/toggle', protect, togglePackedStatus);

module.exports = router;