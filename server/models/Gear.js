const mongoose = require('mongoose');

const gearSchema = new mongoose.Schema({
  surfSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SurfSpot',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a gear name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add a gear type'],
    enum: ['board', 'wetsuit', 'leash', 'fins', 'other']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please add price per hour'],
    min: 0
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Please add available quantity'],
    min: 0
  },
  certificate: {
    type: String, // Cloudinary URL
    default: null
  },
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

module.exports = mongoose.model('Gear', gearSchema);