const express = require('express');
const { getNotifications, markAsRead, clearNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/clear', protect, clearNotifications);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
