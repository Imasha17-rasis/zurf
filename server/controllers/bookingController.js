const Booking = require('../models/Booking');
const SurfSpot = require('../models/SurfSpot');
const Guide = require('../models/Guide');
const Gear = require('../models/Gear');

// @desc    Calculate total price for booking
// @route   POST /api/bookings/calculate-price
// @access  Private
exports.calculateTotalPrice = async (req, res) => {
  try {
    const { surfSpotId, guideId, gearIds, durationHours } = req.body;

    // Fetch all required documents in parallel — single round-trip per resource
    const [surfSpot, guide, gears] = await Promise.all([
      SurfSpot.findById(surfSpotId),
      guideId ? Guide.findById(guideId) : null,
      gearIds && gearIds.length > 0 ? Gear.find({ _id: { $in: gearIds } }) : [],
    ]);

    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    // Calculate each component once and reuse for both totalPrice and the
    // breakdown — no second DB queries needed
    const surfSpotCost = surfSpot.pricePerHour * durationHours;
    const guideCost = guide ? guide.pricePerSession : 0;
    const gearsCost = gears.reduce((sum, gear) => sum + gear.pricePerHour * durationHours, 0);
    const totalPrice = surfSpotCost + guideCost + gearsCost;

    res.json({
      success: true,
      data: {
        totalPrice,
        breakdown: {
          surfSpot: surfSpotCost,
          guide: guideCost,
          gears: gearsCost,
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

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Surfer)
exports.createBooking = async (req, res) => {
  try {
    const {
      surfSpot,
      guide,
      gears,
      bookingDate,
      startTime,
      durationHours
    } = req.body;

    // Calculate total price
    let totalPrice = 0;

    const spot = await SurfSpot.findById(surfSpot);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }
    totalPrice += spot.pricePerHour * durationHours;

    if (guide) {
      const guideDoc = await Guide.findById(guide);
      if (guideDoc) {
        totalPrice += guideDoc.pricePerSession;
      }
    }

    if (gears && gears.length > 0) {
      const gearDocs = await Gear.find({ _id: { $in: gears } });
      gearDocs.forEach(gear => {
        totalPrice += gear.pricePerHour * durationHours;
      });
    }

    const booking = await Booking.create({
      surfer: req.user._id,
      surfSpot,
      guide,
      gears,
      bookingDate,
      startTime,
      durationHours,
      totalPrice
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('surfSpot', 'name location')
      .populate('guide')
      .populate('gears');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Surfer)
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ surfer: req.user._id })
      .populate('surfSpot', 'name location images')
      .populate('guide')
      .populate('gears')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings for owner's surf spots
// @route   GET /api/bookings/owner/all
// @access  Private (Owner)
exports.getOwnerBookings = async (req, res) => {
  try {
    // Find all surf spots owned by this user
    const surfSpots = await SurfSpot.find({ owner: req.user._id });
    const surfSpotIds = surfSpots.map(spot => spot._id);

    // Find all bookings for these surf spots
    const bookings = await Booking.find({
      surfSpot: { $in: surfSpotIds }
    })
      .populate('surfer', 'name email')
      .populate('surfSpot', 'name location')
      .populate('guide')
      .populate('gears')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('surfSpot');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is owner of the surf spot
    if (booking.surfSpot.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
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

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Surfer)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the one who made the booking
    if (booking.surfer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    booking.status = 'cancelled';
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

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('surfer', 'name email')
      .populate('surfSpot', 'name location')
      .populate('guide')
      .populate('gears');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

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

// @desc    Get daily income for owner
// @route   GET /api/bookings/owner/daily-income
// @access  Private (Owner)
exports.getDailyIncome = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all surf spots owned by this user
    const surfSpots = await SurfSpot.find({ owner: req.user._id });
    const surfSpotIds = surfSpots.map(spot => spot._id);

    // Find bookings for today
    const bookings = await Booking.find({
      surfSpot: { $in: surfSpotIds },
      bookingDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['approved', 'completed'] },
      paymentStatus: 'paid'
    });

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    res.json({
      success: true,
      data: {
        date: today,
        totalBookings: bookings.length,
        totalIncome,
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly report for owner
// @route   GET /api/bookings/owner/monthly-report
// @access  Private (Owner)
exports.getMonthlyReport = async (req, res) => {
  try {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Find all surf spots owned by this user
    const surfSpots = await SurfSpot.find({ owner: req.user._id });
    const surfSpotIds = surfSpots.map(spot => spot._id);

    const bookings = await Booking.find({
      surfSpot: { $in: surfSpotIds },
      bookingDate: { $gte: firstDay, $lte: lastDay },
      status: { $in: ['approved', 'completed'] },
      paymentStatus: 'paid'
    }).populate('gears').populate('guide');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Most rented gear
    const gearCount = {};
    bookings.forEach(booking => {
      booking.gears.forEach(gear => {
        gearCount[gear._id] = (gearCount[gear._id] || 0) + 1;
      });
    });

    const mostRentedGear = Object.entries(gearCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        period: { firstDay, lastDay },
        totalBookings: bookings.length,
        totalIncome,
        averageBookingValue: bookings.length > 0 ? totalIncome / bookings.length : 0,
        mostRentedGear
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};