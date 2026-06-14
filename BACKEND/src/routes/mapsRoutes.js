const router = require('express').Router();
const {
  geocode,
  reverseGeocode,
  getDirections,
  getDistanceMatrix,
} = require('../controllers/mapsController');

router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocode);
router.get('/directions', getDirections);
router.get('/distance', getDistanceMatrix);

module.exports = router;
