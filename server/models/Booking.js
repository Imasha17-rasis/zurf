const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  surfer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surfSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SurfSpot',
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    default: null
  },
  gears: [{
    gear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gear'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  bookingDate: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  durationHours: {
    type: Number,
    required: [true, 'Please add duration in hours'],
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  // Stored so the Stripe webhook can match a payment_intent.succeeded event
  // back to this booking without an extra metadata lookup
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);