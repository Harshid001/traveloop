const express = require('express');
const { body } = require('express-validator');
const {
  getSavedPlaces,
  savePlace,
  updateSavedPlace,
  deleteSavedPlace,
  toggleFavorite
} = require('../controllers/savedController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.route('/')
  .get(protect, getSavedPlaces)
  .post(protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      validateRequest,
    ],
    savePlace
  );

router.route('/:id')
  .put(protect,
    [
      body('title', 'Title must be a string').optional().isString(),
      validateRequest,
    ],
    updateSavedPlace
  )
  .delete(protect, deleteSavedPlace);

router.patch('/:id/toggle-favorite', protect, toggleFavorite);

module.exports = router;