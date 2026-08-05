const express = require('express');
const { param } = require('express-validator');
const { getNotifications, markAsRead, clearNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect,
  [
    param('id', 'Invalid notification ID').isMongoId(),
    validateRequest,
  ],
  markAsRead
);
router.delete('/clear', protect, clearNotifications);
router.delete('/:id', protect,
  [
    param('id', 'Invalid notification ID').isMongoId(),
    validateRequest,
  ],
  deleteNotification
);

module.exports = router;
