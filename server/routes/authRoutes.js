const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  uploadCertificate,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require('../middleware/validators/Authvalidators');
const { authLimiter, passwordLimiter } = require('../middleware/rateLimiter');

// Public routes — strict rate limiting to block brute-force attacks
router.post('/register', authLimiter, validateRegister, validate, registerUser);
router.post('/login', authLimiter, validateLogin, validate, loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, validateUpdateProfile, validate, updateProfile);
router.put('/change-password', protect, passwordLimiter, validateChangePassword, validate, changePassword);
router.post('/upload-certificate', protect, uploadSingle, handleUploadError, uploadCertificate);

module.exports = router;