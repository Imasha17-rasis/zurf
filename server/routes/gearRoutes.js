const express = require('express');
const router = express.Router();
const {
  addGear,
  updateGear,
  deleteGear,
  getAllGears,
  getGearById,
  getGearsBySurfSpot
} = require('../controllers/gearController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllGears);
router.get('/:id', getGearById);
router.get('/surfspot/:surfSpotId', getGearsBySurfSpot);

// Protected routes - Owner only
router.post(
  '/',
  protect,
  authorize('owner'),
  checkVerified,
  uploadSingle,
  handleUploadError,
  addGear
);

router.put(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  updateGear
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  deleteGear
);

module.exports = router;