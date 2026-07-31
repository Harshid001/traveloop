const express = require('express');
const { getDestinations, getDestination } = require('../controllers/destinationController');

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestination);

module.exports = router;
