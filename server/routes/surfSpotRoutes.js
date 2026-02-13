const express = require('express');
const router = express.Router();
const {
  createSurfSpot,
  getAllSurfSpots,
  getSurfSpotById,
  updateSurfSpot,
  deleteSurfSpot,
  getOwnerSurfSpots
} = require('../controllers/surfSpotController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');
const { uploadMultiple, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllSurfSpots);
router.get('/:id', getSurfSpotById);

// Protected routes - Owner only
router.post(
  '/',
  protect,
  authorize('owner'),
  checkVerified,
  uploadMultiple,
  handleUploadError,
  createSurfSpot
);

router.put(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  updateSurfSpot
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  deleteSurfSpot
);

router.get(
  '/owner/my-spots',
  protect,
  authorize('owner'),
  getOwnerSurfSpots
);

module.exports = router;