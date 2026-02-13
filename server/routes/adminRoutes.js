const express = require('express');
const router = express.Router();
const {
  verifyOwner,
  verifyGuide,
  verifyGear,
  verifySurfSpot,
  suspendUser,
  getPendingVerifications,
  viewSystemStats,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// Verification routes
router.put('/verify-owner/:id', verifyOwner);
router.put('/verify-guide/:id', verifyGuide);
router.put('/verify-gear/:id', verifyGear);
router.put('/verify-surfspot/:id', verifySurfSpot);

// User management
router.put('/suspend-user/:id', suspendUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Analytics and reports
router.get('/pending-verifications', getPendingVerifications);
router.get('/analytics', viewSystemStats);

module.exports = router;