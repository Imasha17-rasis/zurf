const Guide = require('../models/Guide');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Create guide profile
// @route   POST /api/guides
// @access  Private (Guide only)
exports.createGuideProfile = async (req, res) => {
  try {
    const { experienceYears, pricePerSession, availability, surfSpot } = req.body;

    // Check if guide profile already exists
    const existingGuide = await Guide.findOne({ user: req.user._id });

    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: 'Guide profile already exists'
      });
    }

    const guide = await Guide.create({
      user: req.user._id,
      experienceYears,
      pricePerSession,
      availability,
      surfSpot
    });

    res.status(201).json({
      success: true,
      data: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update guide profile
// @route   PUT /api/guides/profile
// @access  Private (Guide only)
exports.updateGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      guide._id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedGuide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get guide schedule
// @route   GET /api/guides/schedule
// @access  Private (Guide only)
exports.viewSchedule = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    // Get all bookings for this guide
    const bookings = await Booking.find({
      guide: guide._id,
      status: { $in: ['pending', 'approved'] }
    })
      .populate('surfer', 'name email')
      .populate('surfSpot', 'name location')
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept booking
// @route   PUT /api/guides/bookings/:id/accept
// @access  Private (Guide only)
exports.acceptBooking = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if this booking is for this guide
    if (booking.guide.toString() !== guide._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this booking'
      });
    }

    booking.status = 'approved';
    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject booking
// @route   PUT /api/guides/bookings/:id/reject
// @access  Private (Guide only)
exports.rejectBooking = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if this booking is for this guide
    if (booking.guide.toString() !== guide._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this booking'
      });
    }

    booking.status = 'rejected';
    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
exports.getAllGuides = async (req, res) => {
  try {
    // isVerified lives on the User document, not the Guide document, so we
    // first collect the IDs of all verified guide users, then filter guides
    // by those IDs. This ensures pending/unverified guides are never exposed.
    const verifiedGuideUsers = await User.find(
      { role: 'guide', isVerified: true },
      '_id'
    );
    const verifiedUserIds = verifiedGuideUsers.map((u) => u._id);

    const guides = await Guide.find({ user: { $in: verifiedUserIds } })
      .populate('user', 'name email isVerified')
      .populate('surfSpot', 'name location');

    res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get guide by ID
// @route   GET /api/guides/:id
// @access  Public
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('user', 'name email isVerified')
      .populate('surfSpot', 'name location');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Block direct ID lookups for guides whose user account is not yet verified
    if (!guide.user?.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};