const router = require('express').Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
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
router.post('/ai-suggest',
  [
    body('query', 'Query is required').not().isEmpty(),
    validateRequest,
  ],
  aiSuggest
);

module.exports = router;