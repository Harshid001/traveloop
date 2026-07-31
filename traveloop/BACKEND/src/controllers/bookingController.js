const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  successResponse(res, 200, 'Bookings fetched successfully', bookings);
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.create({
    user: req.user._id,
    tripId: req.body.tripId || '',
    tripTitle: req.body.tripTitle || req.body.title || 'Traveloop trip',
    travelers: req.body.travelers || 1,
    travelDate: req.body.travelDate || req.body.date,
    phone: req.body.phone,
    pickupCity: req.body.pickupCity || '',
    note: req.body.note || '',
    price: req.body.price || '',
  });

  await Notification.create({
    user: req.user._id,
    type: 'booking',
    title: 'Booking request sent',
    message: `${booking.tripTitle} booking request is now being tracked.`,
  });

  successResponse(res, 201, 'Booking request created successfully', booking);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: req.body.status || 'requested' },
    { new: true, runValidators: true },
  );
  if (!booking) return errorResponse(res, 404, 'Booking not found');
  successResponse(res, 200, 'Booking status updated', booking);
});

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
};
