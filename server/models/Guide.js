const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  experienceYears: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: 0
  },
  pricePerSession: {
    type: Number,
    required: [true, 'Please add price per session'],
    min: 0
  },
  availability: [{
    type: Date
  }],
  surfSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SurfSpot',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);