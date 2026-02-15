const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Stripe webhook — must be registered with express.raw() in server.js,
// NOT with express.json(). See server.js for the special wiring.
// This route is intentionally unauthenticated; Stripe signs the payload instead.
router.post('/webhook', handleWebhook);

// Create a PaymentIntent for a pending booking
router.post(
    '/create-intent',
    protect,
    authorize('surfer'),
    createPaymentIntent
);

module.exports = router;