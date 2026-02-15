const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// @desc    Create a Stripe PaymentIntent for an existing booking
// @route   POST /api/payments/create-intent
// @access  Private (Surfer — must own the booking)
exports.createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'bookingId is required',
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Only the surfer who created the booking may pay for it
        if (booking.surfer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorised to pay for this booking',
            });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been paid',
            });
        }

        // Stripe amounts are in the smallest currency unit (cents for USD)
        const amountInCents = Math.round(booking.totalPrice * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            // Embed the booking ID so the webhook can look it up without a DB query
            metadata: { bookingId: booking._id.toString() },
        });

        // Persist the intent ID so the webhook can match it back to this booking
        booking.stripePaymentIntentId = paymentIntent.id;
        await booking.save();

        res.json({
            success: true,
            data: { clientSecret: paymentIntent.client_secret },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Stripe webhook — mark booking as paid on successful payment
// @route   POST /api/payments/webhook
// @access  Public (verified by Stripe signature)
//
// IMPORTANT: this route must receive the raw request body (Buffer), NOT the
// parsed JSON body. See server.js for how this is wired up before express.json().
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,                             // raw Buffer
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        try {
            await Booking.findOneAndUpdate(
                { stripePaymentIntentId: paymentIntent.id },
                { paymentStatus: 'paid' }
            );
        } catch (err) {
            // Log but don't return an error — Stripe will retry if we send non-200
            console.error('Failed to update booking payment status:', err.message);
        }
    }

    // Always acknowledge receipt so Stripe doesn't retry
    res.json({ received: true });
};