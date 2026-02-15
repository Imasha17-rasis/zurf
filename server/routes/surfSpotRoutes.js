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
const validate = require('../middleware/validate');
const {
  validateCreateSurfSpot,
  validateUpdateSurfSpot,
} = require('../middleware/validators/Surfspotvalidators');

// Public routes
router.get('/', getAllSurfSpots);

// Static named routes must come BEFORE /:id to avoid Express
// treating the literal string "owner" as an ID parameter
router.get(
  '/owner/my-spots',
  protect,
  authorize('owner'),
  getOwnerSurfSpots
);

router.get('/:id', getSurfSpotById);

// Protected routes - Owner only
router.post(
  '/',
  protect,
  authorize('owner'),
  checkVerified,
  uploadMultiple,
  handleUploadError,
  validateCreateSurfSpot,
  validate,
  createSurfSpot
);

router.put(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  validateUpdateSurfSpot,
  validate,
  updateSurfSpot
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  deleteSurfSpot
);

module.exports = router;