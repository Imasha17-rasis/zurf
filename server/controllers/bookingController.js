const Booking = require('../models/Booking');
const SurfSpot = require('../models/SurfSpot');
const Guide = require('../models/Guide');
const Gear = require('../models/Gear');
const {
  checkGuideAvailability,
  checkGearAvailability,
  getAvailableGuides,
  getAvailableGears
} = require('../utils/availabilityChecker');
const { isGuidehiredForSurfSpot } = require('../utils/guideHelper');

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

    // Validate surf spot exists
    const spot = await SurfSpot.findById(surfSpot);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    // Check guide availability if provided
    if (guide) {
      // Check if guide is hired for this surf spot
      const isHired = await isGuidehiredForSurfSpot(guide, surfSpot);
      if (!isHired) {
        return res.status(400).json({
          success: false,
          message: 'This guide is not available for this surf spot'
        });
      }

      const guideAvailability = await checkGuideAvailability(guide, bookingDate, startTime, durationHours);
      if (!guideAvailability.available) {
        return res.status(400).json({
          success: false,
          message: `Guide unavailable: ${guideAvailability.reason}`
        });
      }
    }

    // Check gear availability if provided
    let gearsForBooking = [];
    if (gears && gears.length > 0) {
      // Convert gears array to proper format with quantities (default 1 each)
      const gearsData = Array.isArray(gears) ? gears.map(gearId => ({
        gearId,
        quantity: 1
      })) : [];

      const gearAvailability = await checkGearAvailability(gearsData, bookingDate);
      if (!gearAvailability.available) {
        return res.status(400).json({
          success: false,
          message: 'Some gear items are not available',
          unavailableItems: gearAvailability.unavailableItems
        });
      }
      
      // Format gears for booking with quantities
      gearsForBooking = gearsData.map(item => ({
        gear: item.gearId,
        quantity: item.quantity
      }));
    }

    // Calculate total price
    let totalPrice = 0;
    totalPrice += spot.pricePerHour * durationHours;

    if (guide) {
      const guideDoc = await Guide.findById(guide);
      if (guideDoc) {
        totalPrice += guideDoc.pricePerSession;
      }
    }

    if (gearsForBooking && gearsForBooking.length > 0) {
      const gearDocs = await Gear.find({ _id: { $in: gearsForBooking.map(g => g.gear) } });
      gearsForBooking.forEach(gearBooking => {
        const gearDoc = gearDocs.find(g => g._id.toString() === gearBooking.gear.toString());
        if (gearDoc) {
          totalPrice += gearDoc.pricePerHour * durationHours * gearBooking.quantity;
        }
      });
    }

    const booking = await Booking.create({
      surfer: req.user._id,
      surfSpot,
      guide: guide || null,
      gears: gearsForBooking.length > 0 ? gearsForBooking : [],
      bookingDate,
      startTime,
      durationHours,
      totalPrice
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('surfSpot', 'name location')
      .populate({
        path: 'guide',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('gears.gear');

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

// @desc    Check availability for guides and gears for a specific booking date/time
// @route   POST /api/bookings/check-availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { surfSpotId, bookingDate, startTime, durationHours, guideIds } = req.body;

    console.log('📍 checkAvailability called with:', { surfSpotId, bookingDate, startTime, durationHours, guideIds });

    // Validate surf spot exists
    const surfSpot = await SurfSpot.findById(surfSpotId);
    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    // Get available guides
    const availableGuides = guideIds && guideIds.length > 0 
      ? await getAvailableGuides(surfSpotId, bookingDate, startTime, durationHours, guideIds)
      : [];

    console.log('📍 Available guides:', availableGuides);

    // Get available gears
    const availableGears = await getAvailableGears(surfSpotId, bookingDate);

    console.log('📍 Available gears:', availableGears);

    res.json({
      success: true,
      data: {
        availableGuides: availableGuides.map(guide => ({
          _id: guide._id,
          name: guide.user?.name,
          experienceYears: guide.experienceYears,
          pricePerSession: guide.pricePerSession,
          rating: guide.rating
        })),
        availableGears: availableGears.map(gear => ({
          _id: gear._id,
          name: gear.name,
          type: gear.type,
          pricePerHour: gear.pricePerHour,
          quantityAvailable: gear.quantityAvailable,
          availableQuantity: gear.availableQuantity
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in checkAvailability:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check specific guide availability
// @route   POST /api/bookings/check-guide-availability
// @access  Private
exports.checkGuideAvailabilityEndpoint = async (req, res) => {
  try {
    const { guideId, bookingDate, startTime, durationHours } = req.body;

    const availability = await checkGuideAvailability(guideId, bookingDate, startTime, durationHours);

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check specific gear availability
// @route   POST /api/bookings/check-gear-availability
// @access  Private
exports.checkGearAvailabilityEndpoint = async (req, res) => {
  try {
    const { gearIds, bookingDate } = req.body;

    // Format gear data with default quantity of 1
    const gearsData = gearIds.map(gearId => ({
      gearId,
      quantity: 1
    }));

    const availability = await checkGearAvailability(gearsData, bookingDate);

    res.json({
      success: true,
      data: availability
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
      .populate({
        path: 'guide',
        populate: {
          path: 'user',
          select: 'firstName lastName name'
        }
      })
      .populate('gears.gear')
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
      .populate({
        path: 'guide',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('gears.gear')
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
      .populate({
        path: 'guide',
        populate: {
          path: 'user',
          select: 'firstName lastName name'
        }
      })
      .populate('gears.gear');

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
    }).populate('gears.gear').populate('guide');

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Most rented gear
    const gearCount = {};
    bookings.forEach(booking => {
      booking.gears.forEach(gearItem => {
        const gearId = gearItem.gear._id;
        gearCount[gearId] = (gearCount[gearId] || 0) + gearItem.quantity;
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

// @desc    Get yearly report for owner
// @route   GET /api/bookings/owner/yearly-report
// @access  Private (Owner)
exports.getYearlyReport = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31, 23, 59, 59);

    // Find all surf spots owned by this user
    const surfSpots = await SurfSpot.find({ owner: req.user._id });
    const surfSpotIds = surfSpots.map(spot => spot._id);

    const bookings = await Booking.find({
      surfSpot: { $in: surfSpotIds },
      bookingDate: { $gte: firstDay, $lte: lastDay },
      status: { $in: ['approved', 'completed'] },
      paymentStatus: 'paid'
    });

    const totalIncome = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
      bookings: 0,
      income: 0,
    }));

    bookings.forEach(booking => {
      const month = new Date(booking.bookingDate).getMonth();
      monthlyBreakdown[month].bookings += 1;
      monthlyBreakdown[month].income += booking.totalPrice;
    });

    res.json({
      success: true,
      data: {
        year,
        totalBookings: bookings.length,
        totalIncome,
        averageBookingValue: bookings.length > 0 ? totalIncome / bookings.length : 0,
        monthlyBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};