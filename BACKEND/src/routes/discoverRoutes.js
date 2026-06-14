const router = require('express').Router();
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

router.get('/trending', getTrending);
router.get('/seasonal', getSeasonal);
router.get('/budget', getBudgetDestinations);
router.get('/category/:category', getCategoryDestinations);
router.get('/nearby', getNearbyDestinations);
router.get('/recommended', getRecommendedDestinations);
router.get('/weather-based', getWeatherBasedDestinations);
router.get('/search', smartSearch);

module.exports = router;
