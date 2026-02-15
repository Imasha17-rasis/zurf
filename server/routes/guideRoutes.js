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
const validate = require('../middleware/validate');
const {
  validateCreateGuideProfile,
  validateUpdateGuideProfile,
} = require('../middleware/validators/Guidevalidators');

// Public routes
router.get('/', getAllGuides);

// Static named routes must come BEFORE /:id to avoid Express
// treating literal strings like "schedule" as an ID parameter
router.get(
  '/schedule',
  protect,
  authorize('guide'),
  checkVerified,
  viewSchedule
);

router.get('/:id', getGuideById);

// Protected routes - Guide only
router.post(
  '/',
  protect,
  authorize('guide'),
  validateCreateGuideProfile,
  validate,
  createGuideProfile
);

router.put(
  '/profile',
  protect,
  authorize('guide'),
  checkVerified,
  validateUpdateGuideProfile,
  validate,
  updateGuideProfile
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