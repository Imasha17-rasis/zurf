const SurfSpot = require('../models/SurfSpot');
const cloudinary = require('cloudinary').v2;

// @desc    Create new surf spot
// @route   POST /api/surfspots
// @access  Private (Owner only)
exports.createSurfSpot = async (req, res) => {
  try {
    const { name, location, description, pricePerHour } = req.body;

    // Upload images to Cloudinary if provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'zurf/surfspots'
        });
        imageUrls.push(result.secure_url);
      }
    }

    const surfSpot = await SurfSpot.create({
      owner: req.user._id,
      name,
      location,
      description,
      pricePerHour,
      images: imageUrls
    });

    res.status(201).json({
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

// @desc    Get all surf spots
// @route   GET /api/surfspots
// @access  Public
exports.getAllSurfSpots = async (req, res) => {
  try {
    const { country, city, minPrice, maxPrice, minRating } = req.query;

    // Build query
    let query = { isVerified: true };

    if (country) query['location.country'] = new RegExp(country, 'i');
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };

    const surfSpots = await SurfSpot.find(query)
      .populate('owner', 'name email')
      .populate('guides')
      .populate('gears');

    res.json({
      success: true,
      count: surfSpots.length,
      data: surfSpots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single surf spot by ID
// @route   GET /api/surfspots/:id
// @access  Public
exports.getSurfSpotById = async (req, res) => {
  try {
    const surfSpot = await SurfSpot.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('guides')
      .populate('gears');

    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

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

// @desc    Update surf spot
// @route   PUT /api/surfspots/:id
// @access  Private (Owner only)
exports.updateSurfSpot = async (req, res) => {
  try {
    let surfSpot = await SurfSpot.findById(req.params.id);

    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    // Check ownership
    if (surfSpot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this surf spot'
      });
    }

    surfSpot = await SurfSpot.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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

// @desc    Delete surf spot
// @route   DELETE /api/surfspots/:id
// @access  Private (Owner only)
exports.deleteSurfSpot = async (req, res) => {
  try {
    const surfSpot = await SurfSpot.findById(req.params.id);

    if (!surfSpot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    // Check ownership
    if (surfSpot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this surf spot'
      });
    }

    await surfSpot.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner's surf spots
// @route   GET /api/surfspots/owner/my-spots
// @access  Private (Owner only)
exports.getOwnerSurfSpots = async (req, res) => {
  try {
    const surfSpots = await SurfSpot.find({ owner: req.user._id })
      .populate('guides')
      .populate('gears');

    res.json({
      success: true,
      count: surfSpots.length,
      data: surfSpots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};