const mongoose = require('mongoose');

const surfSpotSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a surf spot name'],
    trim: true
  },
  location: {
    country: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please add a price per hour'],
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  guides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide'
  }],
  gears: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gear'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geolocation queries
surfSpotSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('SurfSpot', surfSpotSchema);