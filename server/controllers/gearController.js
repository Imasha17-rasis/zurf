const Gear = require('../models/Gear');
const SurfSpot = require('../models/SurfSpot');
const cloudinary = require('cloudinary').v2;

// @desc    Add new gear
// @route   POST /api/gears
// @access  Private (Owner only)
exports.addGear = async (req, res) => {
  try {
    const { surfSpot, name, type, pricePerHour, quantityAvailable } = req.body;

    // Verify that the surf spot belongs to this owner
    const spot = await SurfSpot.findById(surfSpot);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Surf spot not found'
      });
    }

    if (spot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add gear to this surf spot'
      });
    }

    // Upload certificate if provided
    let certificateUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'zurf/gear-certificates',
        resource_type: 'auto'
      });
      certificateUrl = result.secure_url;
    }

    const gear = await Gear.create({
      surfSpot,
      name,
      type,
      pricePerHour,
      quantityAvailable,
      certificate: certificateUrl
    });

    // Add gear to surf spot
    spot.gears.push(gear._id);
    await spot.save();

    res.status(201).json({
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

// @desc    Update gear
// @route   PUT /api/gears/:id
// @access  Private (Owner only)
exports.updateGear = async (req, res) => {
  try {
    let gear = await Gear.findById(req.params.id).populate('surfSpot');

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found'
      });
    }

    // Check ownership
    if (gear.surfSpot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this gear'
      });
    }

    gear = await Gear.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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

// @desc    Delete gear
// @route   DELETE /api/gears/:id
// @access  Private (Owner only)
exports.deleteGear = async (req, res) => {
  try {
    const gear = await Gear.findById(req.params.id).populate('surfSpot');

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found'
      });
    }

    // Check ownership
    if (gear.surfSpot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this gear'
      });
    }

    // Remove gear from surf spot
    await SurfSpot.findByIdAndUpdate(
      gear.surfSpot._id,
      { $pull: { gears: gear._id } }
    );

    await gear.deleteOne();

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

// @desc    Get all gears
// @route   GET /api/gears
// @access  Public
exports.getAllGears = async (req, res) => {
  try {
    const gears = await Gear.find({ isVerified: true })
      .populate('surfSpot', 'name location');

    res.json({
      success: true,
      count: gears.length,
      data: gears
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get gear by ID
// @route   GET /api/gears/:id
// @access  Public
exports.getGearById = async (req, res) => {
  try {
    const gear = await Gear.findById(req.params.id)
      .populate('surfSpot', 'name location');

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found'
      });
    }

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

// @desc    Get gears by surf spot
// @route   GET /api/gears/surfspot/:surfSpotId
// @access  Public
exports.getGearsBySurfSpot = async (req, res) => {
  try {
    const gears = await Gear.find({ 
      surfSpot: req.params.surfSpotId,
      isVerified: true 
    });

    res.json({
      success: true,
      count: gears.length,
      data: gears
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};