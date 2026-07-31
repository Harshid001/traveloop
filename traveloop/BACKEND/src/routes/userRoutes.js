const express = require('express');
const { getUsers, getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/me').get(protect, getMe).put(protect, updateMe);

module.exports = router;
