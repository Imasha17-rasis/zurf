const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ─── Stripe webhook (must come before express.json) ───────────────────────────
// Stripe needs the raw request body to verify the webhook signature.
// express.raw() is applied only to this one route so everything else keeps
// the normal JSON body parser.
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/paymentRoutes')
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS — only allow requests from the configured client origin.
// Set CLIENT_URL in your .env (e.g. http://localhost:3000 for dev,
// https://yourdomain.com for production).
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_URL;

    // Allow server-to-server calls (e.g. Stripe webhooks) and same-origin
    // requests that have no Origin header
    if (!origin) return callback(null, true);

    if (!allowedOrigin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CLIENT_URL env var is not set — CORS blocked'));
      }
      // Dev fallback: allow all origins so the server still works locally
      // without the env var configured
      return callback(null, true);
    }

    if (origin === allowedOrigin) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  credentials: true, // Allow cookies / Authorization headers cross-origin
};
app.use(cors(corsOptions));

// Global rate limiter — applied to every route as a baseline defence
// against bulk scraping and accidental hammering.
// Auth routes add a stricter per-route limiter on top of this.
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/surfspots', require('./routes/surfSpotRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api/gears', require('./routes/gearRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Zurf API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🌊 Zurf server running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;