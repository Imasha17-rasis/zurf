const express = require('express');
const router = express.Router();
const {
  createGuideProfile,
  getGuideProfile,
  updateGuideProfile,
  viewSchedule,
  acceptBooking,
  rejectBooking,
  getAllGuides,
  getGuideById,
  requestHireGuide,
  getHireRequests,
  acceptHireRequest,
  rejectHireRequest,
  getOwnerHireRequests,
  assignGuideToBooking,
  uploadProfileImage
} = require('../controllers/guideController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  validateCreateGuideProfile,
  validateUpdateGuideProfile,
} = require('../middleware/validators/Guidevalidators');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

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

router.get(
  '/profile',
  protect,
  authorize('guide'),
  getGuideProfile
);

router.get(
  '/my-hire-requests',
  protect,
  authorize('guide'),
  getHireRequests
);

router.post(
  '/upload-profile-image',
  protect,
  authorize('guide'),
  uploadSingle,
  handleUploadError,
  uploadProfileImage
);

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

// Hire request routes
router.post(
  '/:id/request-hire',
  protect,
  authorize('owner'),
  requestHireGuide
);

router.put(
  '/hire-requests/:requestId/accept',
  protect,
  authorize('guide'),
  acceptHireRequest
);

router.put(
  '/hire-requests/:requestId/reject',
  protect,
  authorize('guide'),
  rejectHireRequest
);

// Owner routes for hiring guides
router.get(
  '/owner/hire-requests',
  protect,
  authorize('owner'),
  getOwnerHireRequests
);

router.put(
  '/assign-to-booking',
  protect,
  authorize('owner'),
  assignGuideToBooking
);

// Public route for getting guide by ID - MUST be last
router.get('/:id', getGuideById);

module.exports = router;