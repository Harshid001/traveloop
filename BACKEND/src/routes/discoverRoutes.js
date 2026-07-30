const router = require('express').Router();
const { query, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const {
  getTrending,
  getSeasonal,
  getBudgetDestinations,
  getCategoryDestinations,
  getNearbyDestinations,
  getRecommendedDestinations,
  getWeatherBasedDestinations,
  smartSearch,
} = require('../controllers/discoverController');

const validCategories = ['beach', 'mountain', 'city', 'cultural', 'historical', 'island', 'adventure', 'luxury'];
const validHemispheres = ['northern', 'southern'];

router.get('/trending', getTrending);

router.get('/seasonal', [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('hemisphere').optional().isIn(validHemispheres).withMessage('Hemisphere must be northern or southern'),
  validateRequest,
], getSeasonal);

router.get('/budget', [
  query('min').optional().isFloat({ min: 0 }).withMessage('Min budget must be a positive number'),
  query('max').optional().isFloat({ min: 0 }).withMessage('Max budget must be a positive number'),
  validateRequest,
], getBudgetDestinations);

router.get('/category/:category', [
  param('category').isIn(validCategories).withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  validateRequest,
], getCategoryDestinations);

router.get('/nearby', [
  query('lat').notEmpty().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
  query('lng').notEmpty().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)'),
  validateRequest,
], getNearbyDestinations);

router.get('/recommended', getRecommendedDestinations);

router.get('/weather-based', [
  query('lat').notEmpty().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required (-90 to 90)'),
  query('lng').notEmpty().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required (-180 to 180)'),
  validateRequest,
], getWeatherBasedDestinations);

router.get('/search', [
  query('q').notEmpty().trim().isLength({ min: 2, max: 200 }).withMessage('Search query is required (2-200 characters)'),
  validateRequest,
], smartSearch);

module.exports = router;