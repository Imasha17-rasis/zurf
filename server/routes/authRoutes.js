const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  uploadCertificate,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-certificate', protect, uploadSingle, handleUploadError, uploadCertificate);

module.exports = router;