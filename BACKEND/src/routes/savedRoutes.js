const express = require('express');
const {
  getSavedPlaces,
  savePlace,
  updateSavedPlace,
  deleteSavedPlace,
  toggleFavorite
} = require('../controllers/savedController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getSavedPlaces)
  .post(protect, savePlace);

router.route('/:id')
  .put(protect, updateSavedPlace)
  .delete(protect, deleteSavedPlace);

router.patch('/:id/toggle-favorite', protect, toggleFavorite);

module.exports = router;
