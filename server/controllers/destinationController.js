const Destination = require('../models/Destination');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getAllDestinations = async (req, res) => {
  try {
    const { country, city, search, minExperience } = req.query;

    // Build query
    let query = {};

    // General search across name, city, and country
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'location.city': searchRegex },
        { 'location.country': searchRegex },
        { description: searchRegex }
      ];
    }

    if (country) query['location.country'] = new RegExp(country, 'i');
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minExperience) {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const minIndex = levels.indexOf(minExperience);
      if (minIndex !== -1) {
        query.minimumExperienceLevel = { $in: levels.slice(0, minIndex + 1) };
      }
    }

    const destinations = await Destination.find(query)
      .populate({
        path: 'surfSpots',
        populate: [
          {
            path: 'guides',
            select: '_id name email user'
          },
          {
            path: 'owner',
            select: '_id name'
          }
        ]
      })
      .populate('guides', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single destination by ID
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate({
        path: 'surfSpots',
        populate: [
          {
            path: 'guides',
            select: '_id name email user'
          },
          {
            path: 'owner',
            select: '_id name'
          }
        ]
      })
      .populate({
        path: 'guides',
        select: 'name email role'
      })
      .populate('reviews.user', 'name');

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private (Admin only)
exports.createDestination = async (req, res) => {
  try {
    const { name, location, description, bestTimeToSurf, minimumExperienceLevel, surfSpots, guides } = req.body;

    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'zurf/destinations',
      });
      imageUrl = result.secure_url;
    }

    const destination = await Destination.create({
      name,
      location,
      description,
      bestTimeToSurf,
      minimumExperienceLevel,
      image: imageUrl,
      surfSpots: surfSpots || [],
      guides: guides || []
    });

    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private (Admin only)
exports.updateDestination = async (req, res) => {
  try {
    let destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Update image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'zurf/destinations',
      });
      req.body.image = result.secure_url;
    }

    destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private (Admin only)
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      message: 'Destination deleted',
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review to destination
// @route   POST /api/destinations/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if user already reviewed
    const existingReview = destination.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this destination'
      });
    }

    destination.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const avgRating = destination.reviews.reduce((sum, r) => sum + r.rating, 0) / destination.reviews.length;
    destination.rating = parseFloat(avgRating.toFixed(1));

    await destination.save();

    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
