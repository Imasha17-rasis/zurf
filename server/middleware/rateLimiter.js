const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for login and register.
 */
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,  // Return RateLimit-* headers so clients can back off
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please try again in 15 minutes.',
    },
});

/**
 * Moderate limiter for password change.
 */
exports.passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password change attempts. Please try again in 15 minutes.',
    },
});

/**
 * General API limiter applied globally in server.js.
 * Protects every route from bulk scraping / accidental hammering
 * without being noticeable to normal users.
 */
exports.apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down and try again shortly.',
    },
    // Skip rate limiting for the Stripe webhook — it is called server-to-server
    // and must never be blocked
    skip: (req) => req.path === '/api/payments/webhook',
});