const express = require('express');
const router = express.Router();
const {
  calculateTotalPrice,
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingById,
  getDailyIncome,
  getMonthlyReport
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  validateCalculatePrice,
  validateCreateBooking,
  validateUpdateBookingStatus,
} = require('../middleware/validators/Bookingvalidators');

// Protected routes - Surfer
router.post(
  '/calculate-price',
  protect,
  validateCalculatePrice,
  validate,
  calculateTotalPrice
);

router.post(
  '/',
  protect,
  authorize('surfer'),
  validateCreateBooking,
  validate,
  createBooking
);

router.get(
  '/my-bookings',
  protect,
  authorize('surfer'),
  getUserBookings
);

router.put(
  '/:id/cancel',
  protect,
  authorize('surfer'),
  cancelBooking
);

// Protected routes - Owner
router.get(
  '/owner/all',
  protect,
  authorize('owner'),
  checkVerified,
  getOwnerBookings
);

router.get(
  '/owner/daily-income',
  protect,
  authorize('owner'),
  checkVerified,
  getDailyIncome
);

router.get(
  '/owner/monthly-report',
  protect,
  authorize('owner'),
  checkVerified,
  getMonthlyReport
);

router.put(
  '/:id/status',
  protect,
  authorize('owner', 'admin'),
  validateUpdateBookingStatus,
  validate,
  updateBookingStatus
);

// Common protected route
router.get(
  '/:id',
  protect,
  getBookingById
);

module.exports = router;