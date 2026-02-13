const User = require('../models/User');
const SurfSpot = require('../models/SurfSpot');
const Guide = require('../models/Guide');
const Gear = require('../models/Gear');
const Booking = require('../models/Booking');

// @desc    Verify owner
// @route   PUT /api/admin/verify-owner/:id
// @access  Private (Admin only)
exports.verifyOwner = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'User is not an owner'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify guide
// @route   PUT /api/admin/verify-guide/:id
// @access  Private (Admin only)
exports.verifyGuide = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'guide') {
      return res.status(400).json({
        success: false,
        message: 'User is not a guide'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify gear
// @route   PUT /api/admin/verify-gear/:id
// @access  Private (Admin only)
exports.verifyGear = async (req, res) => {
  try {
    const gear = await Gear.findById(req.params.id);

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found'
      });
    }

    gear.isVerified = true;
    await gear.save();

    res.json({
      success: true,
      data: gear
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify surf spot
// @route   PUT /api/admin/verify-surfspot/:id
// @access  Private (Admin only)
exports.verifySurfSpot = async (req, res) => {
  try {
    const surfSpot = await SurfSpot.findById(req.params.id);

    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    surfSpot.isVerified = true;
    await surfSpot.save();

    res.json({
      success: true,
      data: surfSpot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/suspend-user/:id
// @access  Private (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    user.isVerified = false;
    await user.save();

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all pending verifications
// @route   GET /api/admin/pending-verifications
// @access  Private (Admin only)
exports.getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      isVerified: false,
      role: { $in: ['owner', 'guide'] }
    }).select('-password');

    const pendingSurfSpots = await SurfSpot.find({ isVerified: false })
      .populate('owner', 'name email');

    const pendingGears = await Gear.find({ isVerified: false })
      .populate('surfSpot', 'name location');

    res.json({
      success: true,
      data: {
        users: pendingUsers,
        surfSpots: pendingSurfSpots,
        gears: pendingGears
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    View system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.viewSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSurfers = await User.countDocuments({ role: 'surfer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalGuides = await User.countDocuments({ role: 'guide' });
    
    const totalSurfSpots = await SurfSpot.countDocuments();
    const verifiedSurfSpots = await SurfSpot.countDocuments({ isVerified: true });
    
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get monthly revenue trend
    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          surfers: totalSurfers,
          owners: totalOwners,
          guides: totalGuides
        },
        surfSpots: {
          total: totalSurfSpots,
          verified: verifiedSurfSpots,
          pending: totalSurfSpots - verifiedSurfSpots
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          monthly: monthlyRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};