const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { generateReceiptPDF } = require('../utils/receiptGenerator');

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
        console.log('✅ Payment succeeded event received for:', paymentIntent.id);

        try {
            const result = await Booking.findOneAndUpdate(
                { stripePaymentIntentId: paymentIntent.id },
                { paymentStatus: 'paid' },
                { new: true }
            );
            
            if (result) {
                console.log('✅ Booking payment status updated successfully:', result._id);
            } else {
                console.warn('⚠️ No booking found with this payment intent ID:', paymentIntent.id);
            }
        } catch (err) {
            // Log but don't return an error — Stripe will retry if we send non-200
            console.error('❌ Failed to update booking payment status:', err.message);
        }
    }

    // Always acknowledge receipt so Stripe doesn't retry
    res.json({ received: true });
};

// @desc    Download payment receipt as PDF
// @route   GET /api/payments/receipt/:bookingId
// @access  Private (Surfer — must own the booking)
exports.downloadReceipt = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'bookingId is required',
            });
        }

        // Fetch booking with all populated references
        console.log('📍 Fetching booking:', bookingId);
        const booking = await Booking.findById(bookingId);
        
        // Populate surfer
        await booking.populate('surfer', 'name email phone');
        
        // Populate surf spot
        await booking.populate('surfSpot', 'name description location');
        
        // Populate gears
        await booking.populate('gears.gear', 'name pricePerDay');
        
        // Populate guide with nested user if guide exists
        if (booking.guide) {
            await booking.populate({
                path: 'guide',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });
        }

        console.log('📍 Booking fetched:', {
            id: booking?._id,
            surfer: booking?.surfer?.name,
            surfSpot: booking?.surfSpot?.name,
            guide: booking?.guide ? `${booking.guide.user?.name} (ID: ${booking.guide._id})` : 'No guide',
            gears: booking?.gears?.length || 0,
            status: booking?.status,
            paymentStatus: booking?.paymentStatus
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Verify the surfer owns this booking
        if (booking.surfer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorised to download this receipt',
            });
        }

        // Verify payment is complete
        if (booking.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This booking has not been paid yet',
            });
        }

        // Verify booking is approved
        if (booking.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Receipt is only available for approved bookings',
            });
        }

        // Generate PDF
        console.log('📄 Generating receipt for booking:', bookingId);
        console.log('   Surfer:', booking.surfer.name);
        console.log('   Guide:', booking.guide ? (booking.guide.user?.name || 'Unknown') : 'None');
        console.log('   Gears:', booking.gears.length);
        
        const pdfBuffer = await generateReceiptPDF(booking, booking.surfer);

        // Set response headers for PDF download
        const filename = `receipt-${booking._id.toString().slice(-8)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF
        console.log('✅ Receipt generated successfully:', filename);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('❌ Error downloading receipt:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};