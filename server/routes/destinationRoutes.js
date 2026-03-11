const express = require('express');
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  addReview
} = require('../controllers/destinationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

// Private routes (Admin only)
router.post('/', protect, authorize('admin'), uploadSingle, handleUploadError, createDestination);
router.put('/:id', protect, authorize('admin'), uploadSingle, handleUploadError, updateDestination);
router.delete('/:id', protect, authorize('admin'), deleteDestination);

// Review routes (Authenticated users)
router.post('/:id/reviews', protect, addReview);

module.exports = router;
