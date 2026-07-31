const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  successResponse(res, 200, 'Notifications fetched successfully', notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
  successResponse(res, 200, 'Notification marked as read');
});

const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  successResponse(res, 200, 'Notifications cleared');
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  successResponse(res, 200, 'Notification deleted');
});

module.exports = {
  getNotifications,
  markAsRead,
  clearNotifications,
  deleteNotification,
};
