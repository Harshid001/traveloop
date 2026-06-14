const router = require('express').Router();
const {
  searchImages,
  getDestinationImages,
  getRandomImage,
} = require('../controllers/imagesController');

router.get('/search', searchImages);
router.get('/destination/:destinationName', getDestinationImages);
router.get('/random', getRandomImage);

module.exports = router;
