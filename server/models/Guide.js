const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileImage: {
    type: String,
    default: null
  },
  experienceYears: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: 0,
    max: 70
  },
  pricePerSession: {
    type: Number,
    required: [true, 'Please add price per session'],
    min: 0
  },
  surfSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SurfSpot',
    default: null
  },
  availability: [{
    type: Date
  }],
  specialties: [{
    type: String,
    enum: [
      'Beginner Lessons',
      'Advanced Techniques',
      'Reef Breaks',
      'Beach Breaks',
      'Wave Selection',
      'Safety Training',
      'Video Analysis',
      'Group Lessons',
      'Ocean Safety',
      'Longboarding',
      'Shortboarding',
      'Competition Prep',
      'Kids Lessons',
      'Barrel Riding',
      'Point Breaks'
    ]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hireRequests: [{
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    surfSpot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SurfSpot'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);