const router = require('express').Router();
const {
  searchPlaces,
  getNearbyPlaces,
  getPlaceDetails,
  getPlacePhotos,
  autocomplete,
} = require('../controllers/placesController');

router.get('/search', searchPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/details/:placeId', getPlaceDetails);
router.get('/photos/:photoReference', getPlacePhotos);
router.get('/autocomplete', autocomplete);

module.exports = router;
