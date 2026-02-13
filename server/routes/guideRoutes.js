const express = require('express');
const router = express.Router();
const {
  createGuideProfile,
  updateGuideProfile,
  viewSchedule,
  acceptBooking,
  rejectBooking,
  getAllGuides,
  getGuideById
} = require('../controllers/guideController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllGuides);
router.get('/:id', getGuideById);

// Protected routes - Guide only
router.post(
  '/',
  protect,
  authorize('guide'),
  createGuideProfile
);

router.put(
  '/profile',
  protect,
  authorize('guide'),
  checkVerified,
  updateGuideProfile
);

router.get(
  '/schedule',
  protect,
  authorize('guide'),
  checkVerified,
  viewSchedule
);

router.put(
  '/bookings/:id/accept',
  protect,
  authorize('guide'),
  checkVerified,
  acceptBooking
);

router.put(
  '/bookings/:id/reject',
  protect,
  authorize('guide'),
  checkVerified,
  rejectBooking
);

module.exports = router;