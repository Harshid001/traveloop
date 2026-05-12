const express = require('express');
const {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePackedStatus
} = require('../controllers/packingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:tripId')
  .get(protect, getPackingItems)
  .post(protect, addPackingItem);

router.route('/:itemId')
  .put(protect, updatePackingItem)
  .delete(protect, deletePackingItem);

router.patch('/:itemId/toggle', protect, togglePackedStatus);

module.exports = router;
