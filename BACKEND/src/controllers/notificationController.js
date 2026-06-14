const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const Notification = require('../models/Notification');

const fallbackNotifications = [
  { id: 'trip-1', type: 'trip', title: 'Trip reminder', message: 'Review your upcoming itinerary.', read: false },
  { id: 'packing-1', type: 'packing', title: 'Packing reminder', message: 'Your packing checklist still has open items.', read: false },
  { id: 'budget-1', type: 'budget', title: 'Budget alert', message: 'You are close to your planned food budget.', read: true },
];

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  successResponse(res, 200, 'Notifications fetched successfully', notifications.length ? notifications : fallbackNotifications);
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
