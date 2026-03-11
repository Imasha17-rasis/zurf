const Guide = require('../models/Guide');
const Booking = require('../models/Booking');
const User = require('../models/User');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

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

// @desc    Get guide profile
// @route   GET /api/guides/profile
// @access  Private (Guide only)
exports.getGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id })
      .populate('user', 'name email phone location bio isVerified')
      .populate('surfSpot', 'name location');

    // If no guide profile exists, return user data only
    if (!guide) {
      const user = await User.findById(req.user._id);
      
      const profileData = {
        _id: null,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        isVerified: user.isVerified,
        profileImage: null,
        experienceYears: null,
        experienceLevel: 'Not specified',
        pricePerSession: null,
        availability: [],
        specialties: [],
        rating: 0,
        totalReviews: 0,
        isActive: true,
        surfSpot: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profileIncomplete: true
      };

      return res.json({
        success: true,
        data: profileData
      });
    }

    // Combine guide and user data for the frontend
    const profileData = {
      _id: guide._id,
      name: guide.user?.name,
      email: guide.user?.email,
      phone: guide.user?.phone || '',
      location: guide.user?.location || '',
      bio: guide.user?.bio || '',
      isVerified: guide.user?.isVerified,
      profileImage: guide.profileImage,
      experienceYears: guide.experienceYears,
      experienceLevel: guide.experienceYears >= 5 ? 'Expert' : guide.experienceYears >= 2 ? 'Intermediate' : 'Beginner',
      pricePerSession: guide.pricePerSession,
      availability: guide.availability,
      specialties: guide.specialties || [],
      rating: guide.rating || 0,
      totalReviews: guide.totalReviews || 0,
      isActive: guide.isActive !== undefined ? guide.isActive : true,
      surfSpot: guide.surfSpot,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      profileIncomplete: false
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get guide profile error:', error);
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
    let guide = await Guide.findOne({ user: req.user._id });

    // Separate user fields from guide fields
    const { name, phone, location, bio, ...guideFields } = req.body;

    // Update User fields if provided
    if (name !== undefined || phone !== undefined || location !== undefined || bio !== undefined) {
      const userUpdateFields = {};
      if (name !== undefined) userUpdateFields.name = name;
      if (phone !== undefined) userUpdateFields.phone = phone;
      if (location !== undefined) userUpdateFields.location = location;
      if (bio !== undefined) userUpdateFields.bio = bio;

      await User.findByIdAndUpdate(req.user._id, userUpdateFields, {
        new: true,
        runValidators: true
      });
    }

    // If guide profile doesn't exist and guide-specific fields are provided, create it
    if (!guide && (guideFields.experienceYears || guideFields.pricePerSession)) {
      guide = await Guide.create({
        user: req.user._id,
        experienceYears: guideFields.experienceYears || 0,
        pricePerSession: guideFields.pricePerSession || 0,
        availability: guideFields.availability || [],
        specialties: guideFields.specialties || [],
        rating: guideFields.rating || 0,
        totalReviews: guideFields.totalReviews || 0,
        isActive: guideFields.isActive !== undefined ? guideFields.isActive : true,
        surfSpot: guideFields.surfSpot || null
      });
    } else if (guide && Object.keys(guideFields).length > 0) {
      // Update existing guide profile
      guide = await Guide.findByIdAndUpdate(
        guide._id,
        guideFields,
        {
          new: true,
          runValidators: true
        }
      );
    }

    // Fetch updated data
    if (guide) {
      guide = await Guide.findById(guide._id)
        .populate('user', 'name email phone location bio isVerified')
        .populate('surfSpot', 'name location');
    }

    // Get updated user data
    const user = await User.findById(req.user._id);

    // Return combined data
    const profileData = {
      _id: guide?._id || null,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      isVerified: user.isVerified,
      experienceYears: guide?.experienceYears || null,
      experienceLevel: guide?.experienceYears >= 5 ? 'Expert' : guide?.experienceYears >= 2 ? 'Intermediate' : guide?.experienceYears ? 'Beginner' : 'Not specified',
      pricePerSession: guide?.pricePerSession || null,
      availability: guide?.availability || [],
      specialties: guide?.specialties || [],
      rating: guide?.rating || 0,
      totalReviews: guide?.totalReviews || 0,
      isActive: guide?.isActive !== undefined ? guide.isActive : true,
      surfSpot: guide?.surfSpot || null,
      createdAt: guide?.createdAt || user.createdAt,
      updatedAt: guide?.updatedAt || user.updatedAt,
      profileIncomplete: !guide
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Update guide profile error:', error);
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

// @desc    Request to hire a guide
// @route   POST /api/guides/:id/request-hire
// @access  Private (Owner only)
exports.requestHireGuide = async (req, res) => {
  try {
    const { surfSpotId } = req.body;
    const guideId = req.params.id;

    if (!surfSpotId) {
      return res.status(400).json({
        success: false,
        message: 'Surf spot ID is required'
      });
    }

    const guide = await Guide.findById(guideId).populate('user');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Check if owner already has a pending or accepted request for this guide
    const existingRequest = guide.hireRequests.find(
      hireRequest => hireRequest.owner.toString() === req.user._id.toString() && hireRequest.status !== 'rejected'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or accepted request for this guide'
      });
    }

    // Add hire request
    guide.hireRequests.push({
      owner: req.user._id,
      surfSpot: surfSpotId,
      status: 'pending'
    });

    await guide.save();

    res.json({
      success: true,
      message: 'Hire request sent successfully',
      data: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get hire requests for a guide
// @route   GET /api/guides/my-hire-requests
// @access  Private (Guide only)
exports.getHireRequests = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id })
      .populate('hireRequests.owner', 'name email')
      .populate('hireRequests.surfSpot', 'name location');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const pendingRequests = guide.hireRequests.filter(req => req.status === 'pending');

    res.json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept hire request
// @route   PUT /api/guides/hire-requests/:requestId/accept
// @access  Private (Guide only)
exports.acceptHireRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the guide associated with the logged-in user
    const guide = await Guide.findOne({ user: req.user._id }).populate('hireRequests.surfSpot');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const hireRequest = guide.hireRequests.id(requestId);

    if (!hireRequest) {
      return res.status(404).json({
        success: false,
        message: 'Hire request not found'
      });
    }

    // Accept the request
    hireRequest.status = 'accepted';
    
    // Update the guide's surfSpot to the requested surf spot
    guide.surfSpot = hireRequest.surfSpot._id;

    await guide.save();

    res.json({
      success: true,
      message: 'Hire request accepted',
      data: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject hire request
// @route   PUT /api/guides/hire-requests/:requestId/reject
// @access  Private (Guide only)
exports.rejectHireRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the guide associated with the logged-in user
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const hireRequest = guide.hireRequests.id(requestId);

    if (!hireRequest) {
      return res.status(404).json({
        success: false,
        message: 'Hire request not found'
      });
    }

    hireRequest.status = 'rejected';

    await guide.save();

    res.json({
      success: true,
      message: 'Hire request rejected',
      data: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner's hire requests
// @route   GET /api/guides/owner/hire-requests
// @access  Private (Owner only)
exports.getOwnerHireRequests = async (req, res) => {
  try {
    // Find all guides that have hire requests from this owner
    const guides = await Guide.find(
      { 'hireRequests.owner': req.user._id }
    )
      .populate('user', 'name email')
      .populate('hireRequests.owner', 'name email')
      .populate('hireRequests.surfSpot', 'name location');

    // Extract only the hire requests sent by this owner
    const ownerHireRequests = [];
    guides.forEach(guide => {
      guide.hireRequests.forEach(request => {
        if (request.owner._id.toString() === req.user._id.toString()) {
          ownerHireRequests.push({
            _id: request._id,
            guide: {
              _id: guide._id,
              guideUserId: guide.user._id,
              name: guide.user.name,
              email: guide.user.email,
              experienceYears: guide.experienceYears,
              pricePerSession: guide.pricePerSession
            },
            surfSpot: request.surfSpot,
            status: request.status,
            requestedAt: request.requestedAt
          });
        }
      });
    });

    res.json({
      success: true,
      count: ownerHireRequests.length,
      data: ownerHireRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign guide to booking
// @route   PUT /api/guides/assign-to-booking
// @access  Private (Owner only)
exports.assignGuideToBooking = async (req, res) => {
  try {
    const { bookingId, guideId } = req.body;

    if (!bookingId || !guideId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and Guide ID are required'
      });
    }

    // Verify the guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Verify the booking exists and belongs to this owner's surf spot
    const booking = await Booking.findById(bookingId)
      .populate('surfSpot', 'owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify owner owns the surf spot
    if (booking.surfSpot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign a guide to this booking'
      });
    }

    // Verify owner has an accepted hire request for this guide
    const hasAcceptedRequest = await Guide.findOne({
      _id: guideId,
      'hireRequests.owner': req.user._id,
      'hireRequests.status': 'accepted'
    });

    if (!hasAcceptedRequest) {
      return res.status(400).json({
        success: false,
        message: 'You do not have an accepted hire request for this guide'
      });
    }

    // Assign the guide to the booking
    booking.guide = guideId;
    await booking.save();

    // Refetch the booking with populated guide details
    const updatedBooking = await Booking.findById(bookingId)
      .populate('guide', 'experienceYears pricePerSession')
      .populate('guide.user', 'name email')
      .populate('surfer', 'name email')
      .populate('surfSpot', 'name location');

    res.json({
      success: true,
      message: 'Guide assigned to booking successfully',
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload guide profile image
// @route   POST /api/guides/upload-profile-image
// @access  Private (Guide only)
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload buffer directly to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'zurf/guide-profiles',
      resource_type: 'auto',
    });

    // Find and update guide profile with image URL
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    guide.profileImage = result.secure_url;
    await guide.save();

    res.json({
      success: true,
      data: {
        profileImage: guide.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};