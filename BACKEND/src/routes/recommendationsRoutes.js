/**
 * Recommendations routes for Traveloop.
 */

const router = require('express').Router();
const {
  getPersonalized,
  getSimilar,
  getTrending,
  getSeasonal,
  aiSuggest,
} = require('../controllers/recommendationsController');

router.get('/personalized', getPersonalized);
router.get('/similar/:destinationId', getSimilar);
router.get('/trending', getTrending);
router.get('/seasonal', getSeasonal);
router.post('/ai-suggest', aiSuggest);

module.exports = router;
