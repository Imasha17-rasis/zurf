const express = require('express');
const router = express.Router();
const {
  addGear,
  updateGear,
  deleteGear,
  getAllGears,
  getGearById,
  getGearsBySurfSpot,
  getOwnerGears
} = require('../controllers/gearController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, checkVerified } = require('../middleware/roleMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const {
  validateAddGear,
  validateUpdateGear,
} = require('../middleware/validators/Gearvalidators');

// Public routes
router.get('/', getAllGears);

// Owner gear listing (must be before /:id to avoid param conflict)
router.get('/owner/my-gears', protect, authorize('owner'), getOwnerGears);

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
  validateAddGear,
  validate,
  addGear
);

router.put(
  '/:id',
  protect,
  authorize('owner'),
  checkVerified,
  validateUpdateGear,
  validate,
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