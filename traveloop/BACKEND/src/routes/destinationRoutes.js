const express = require('express');
const { param } = require('express-validator');
const { getDestinations, getDestination } = require('../controllers/destinationController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id',
  [
    param('id', 'Invalid destination ID').isMongoId(),
    validateRequest,
  ],
  getDestination
);

module.exports = router;
