const express = require('express');
const { getExploreData } = require('../controllers/exploreController');

const router = express.Router();

router.get('/', getExploreData);

module.exports = router;
