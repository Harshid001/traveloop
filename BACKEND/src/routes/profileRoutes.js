const express = require('express');
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMe);
router.put('/', protect, updateMe);

module.exports = router;
