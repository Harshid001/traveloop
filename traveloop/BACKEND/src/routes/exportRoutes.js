const express = require('express');
const { exportUserData } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, exportUserData);

module.exports = router;
