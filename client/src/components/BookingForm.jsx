import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { bookingAPI, paymentAPI } from '../services/api';
import { FiCalendar, FiClock, FiDollarSign, FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

// Initialise Stripe once outside the component so it isn't recreated on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Step 1: Booking details form
const BookingDetailsForm = ({ surfSpot, guides, gears, onProceed }) => {
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    durationHours: 1,
    guide: '',
    gears: [],
  });
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableGuides, setAvailableGuides] = useState([]);
  const [availableGears, setAvailableGears] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Log props on mount
  useEffect(() => {
    console.log('📍 BookingDetailsForm received props:');
    console.log('  guides:', guides);
    console.log('  gears:', gears);
    console.log('  gears.length:', gears?.length);
    console.log('  surfSpot:', surfSpot);
  }, []);

  // Log gears separately to track changes
  useEffect(() => {
    console.log('🔍 Gears prop changed:', gears);
  }, [gears]);

  // Log availableGears changes
  useEffect(() => {
    console.log('🔍 Available gears changed:', availableGears);
  }, [availableGears]);

  // Check availability whenever date/time/duration changes
  useEffect(() => {
    if (!formData.bookingDate || !formData.startTime) return;

    checkAvailabilityForDateTime();
  }, [formData.bookingDate, formData.startTime, formData.durationHours, surfSpot._id]);

  const checkAvailabilityForDateTime = async () => {
    try {
      setCheckingAvailability(true);
      
      const guideIdsList = guides.map(g => g._id);
      
      const payload = {
        surfSpotId: surfSpot._id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        durationHours: Number(formData.durationHours),
        guideIds: guideIdsList
      };
      
      console.log('📍 Checking availability with payload:', payload);
      console.log('  - Guides passed to form:', guides.length, guides.map(g => ({ id: g._id, name: g.user?.name })));
      
      const response = await bookingAPI.checkAvailability(payload);
      
      console.log('✅ Availability response:', response.data);
      
      if (response.data.success) {
        setAvailableGuides(response.data.data.availableGuides || []);
        setAvailableGears(response.data.data.availableGears || []);
        
        console.log('✅ Available guides:', response.data.data.availableGuides || []);
        console.log('✅ Available gears:', response.data.data.availableGears || []);
        
        // Clear selection if current selection is no longer available
        if (formData.guide && !response.data.data.availableGuides.find(g => g._id === formData.guide)) {
          setFormData(prev => ({ ...prev, guide: '' }));
        }
      }
    } catch (err) {
      console.error('❌ Error checking availability:', err.response?.data || err.message);
      setError('Unable to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Recalculate price whenever relevant fields change
  useEffect(() => {
    if (formData.durationHours <= 0) return;

    const calculatePrice = async () => {
      try {
        const response = await bookingAPI.calculatePrice({
          surfSpotId: surfSpot._id,
          guideId: formData.guide || null,
          gearIds: formData.gears,
          durationHours: Number(formData.durationHours),
        });
        setCalculatedPrice(response.data.data);
      } catch (err) {
        console.error('❌ Error calculating price:', err);
        // Non-critical — price preview failing shouldn't block the user
      }
    };

    calculatePrice();
  }, [formData.durationHours, formData.guide, formData.gears, surfSpot._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGearChange = (gearId) => {
    setFormData((prev) => ({
      ...prev,
      gears: prev.gears.includes(gearId)
        ? prev.gears.filter((id) => id !== gearId)
        : [...prev.gears, gearId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the booking record first (still unpaid at this point)
      const bookingResponse = await bookingAPI.create({
        surfSpot: surfSpot._id,
        guide: formData.guide || null,
        gears: formData.gears,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        durationHours: Number(formData.durationHours),
      });

      const booking = bookingResponse.data.data;

      // Ask the server for a PaymentIntent client secret for this booking
      const intentResponse = await paymentAPI.createIntent(booking._id);
      const { clientSecret } = intentResponse.data.data;

      // Hand off to the payment step
      onProceed({ booking, clientSecret, totalPrice: booking.totalPrice });
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      const unavailableItems = err.response?.data?.unavailableItems;
      
      if (unavailableItems) {
        const itemDetails = unavailableItems.map(item => `- ${item.gearName || 'Item'}: ${item.reason}`).join('\n');
        setError(`${message}\n${itemDetails}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  // Get gear availability info
  const getGearAvailabilityInfo = (gearId) => {
    const availGear = availableGears.find(g => g._id === gearId);
    if (!availGear) return { available: 0, total: 0 };
    return {
      available: availGear.availableQuantity,
      total: availGear.quantityAvailable
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiCalendar className="inline mr-1" />
            Booking Date
          </label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiClock className="inline mr-1" />
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (hours)
        </label>
        <select
          name="durationHours"
          value={formData.durationHours}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
        >
          {[1, 2, 3, 4, 5, 6].map((hours) => (
            <option key={hours} value={hours}>
              {hours} hour{hours > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Guide Selection */}
      {guides && guides.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Guide (Optional Add-on)
          </label>
          {!formData.bookingDate || !formData.startTime ? (
            <p className="text-xs text-gray-500 mb-2">👆 Select a date and time to see available guides</p>
          ) : checkingAvailability ? (
            <p className="text-xs text-blue-600 mb-2">🔄 Checking guide availability...</p>
          ) : null}
          <select
            name="guide"
            value={formData.guide}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="">No guide</option>
            {guides.map((guide) => {
              const isAvailable = availableGuides.length > 0 ? availableGuides.some(ag => ag._id === guide._id) : true;
              return (
                <option 
                  key={guide._id} 
                  value={guide._id}
                  disabled={availableGuides.length > 0 && !isAvailable}
                >
                  {guide.user?.name} — ${guide.pricePerSession} ({guide.experienceYears} yrs exp)
                  {availableGuides.length > 0 && !isAvailable && ' [Not Available]'}
                </option>
              );
            })}
          </select>
          {formData.guide && availableGuides.length > 0 && !availableGuides.some(ag => ag._id === formData.guide) && (
            <p className="text-sm text-red-600 mt-1">⚠️ This guide is not available for your selected date/time</p>
          )}
        </div>
      )}

      {/* Gear Selection */}
      {gears && gears.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Gear (Optional Add-ons)
          </label>
          {!formData.bookingDate || !formData.startTime ? (
            <p className="text-xs text-gray-500 mb-2">👆 Select a date and time to see available gear</p>
          ) : checkingAvailability ? (
            <p className="text-xs text-blue-600 mb-2">🔄 Checking gear availability...</p>
          ) : null}
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {gears.map((gear) => {
              const availInfo = getGearAvailabilityInfo(gear._id);
              const isAvailable = availableGears.length > 0 ? availInfo.available > 0 : true;
              
              return (
                <label 
                  key={gear._id} 
                  className={`flex items-center space-x-3 cursor-pointer ${!isAvailable && availableGears.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.gears.includes(gear._id)}
                    onChange={() => handleGearChange(gear._id)}
                    disabled={!isAvailable && availableGears.length > 0}
                    className="w-4 h-4 text-ocean-500 rounded focus:ring-ocean-500"
                  />
                  <span className="flex-1 text-sm text-gray-700">
                    {gear.name} ({gear.type})
                  </span>
                  <span className="text-xs text-gray-500">
                    {availableGears.length > 0 ? (
                      isAvailable ? `${availInfo.available} available` : 'Unavailable'
                    ) : (
                      '...'
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${gear.pricePerHour}/hr
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {calculatedPrice && (
        <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Surf Spot ({formData.durationHours}h)
              </span>
              <span className="font-medium">${calculatedPrice.breakdown.surfSpot}</span>
            </div>
            {calculatedPrice.breakdown.guide > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Guide</span>
                <span className="font-medium">${calculatedPrice.breakdown.guide}</span>
              </div>
            )}
            {calculatedPrice.breakdown.gears > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Gear ({formData.durationHours}h)</span>
                <span className="font-medium">${calculatedPrice.breakdown.gears}</span>
              </div>
            )}
            <div className="border-t border-ocean-300 pt-2 mt-2 flex justify-between text-lg font-bold text-ocean-700">
              <span>Total</span>
              <span className="flex items-center">
                <FiDollarSign className="h-5 w-5" />
                {calculatedPrice.totalPrice}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        <FiLock className="h-4 w-4" />
        {loading ? 'Preparing payment…' : 'Proceed to Payment'}
      </button>
    </form>
  );
};

// Step 2: Stripe card payment form
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

const PaymentForm = ({ totalPrice, clientSecret, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: elements.getElement(CardElement) } }
    );

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      {/* Summary */}
      <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4 flex justify-between items-center">
        <span className="font-medium text-gray-700">Total due</span>
        <span className="text-xl font-bold text-ocean-700 flex items-center">
          <FiDollarSign className="h-5 w-5" />{totalPrice}
        </span>
      </div>

      {/* Card input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card details
        </label>
        <div className="border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-ocean-500 focus-within:border-transparent">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <FiLock className="h-3 w-3" /> Secured by Stripe. We never store your card details.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <FiLock className="h-4 w-4" />
          {loading ? 'Processing…' : `Pay $${totalPrice}`}
        </button>
      </div>
    </form>
  );
};

// Step 3: Success screen
const PaymentSuccess = ({ bookingId }) => {
  const [paymentStatus, setPaymentStatus] = useState('processing');

  useEffect(() => {
    // Wait a bit for webhook to process, then check payment status
    const timer = setTimeout(async () => {
      try {
        const response = await bookingAPI.getById(bookingId);
        if (response.data.data.paymentStatus === 'paid') {
          setPaymentStatus('confirmed');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        // Still consider it a success even if we can't verify
      }
    }, 2000); // Wait 2 seconds for webhook to process

    return () => clearTimeout(timer);
  }, [bookingId]);

  return (
    <div className="text-center py-8 space-y-4">
      <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-bold text-gray-900">Payment successful!</h3>
      <p className="text-gray-600">
        Your booking is confirmed and payment has been processed.
      </p>
      
      {paymentStatus === 'processing' && (
        <p className="text-sm text-blue-600 font-medium">
          Processing payment confirmation...
        </p>
      )}
      {paymentStatus === 'confirmed' && (
        <p className="text-sm text-green-600 font-medium">
          ✓ Payment confirmed
        </p>
      )}
      
      <p className="text-sm text-gray-500 mt-4">
        Your payment receipt will be available to download after the surf spot owner approves your booking. You can download it anytime from your My Bookings page.
      </p>
    </div>
  );
};

// Root export: orchestrates the three steps
const BookingForm = ({ surfSpot, guides, gears, onSuccess, onStepChange }) => {
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [paymentData, setPaymentData] = useState(null);

  const handleProceedToPayment = (data) => {
    setPaymentData(data);
    setStep('payment');
    // Notify parent about step and booking data
    if (onStepChange) {
      onStepChange('payment', data);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    // Notify parent about completion
    if (onStepChange) {
      onStepChange('success', paymentData);
    }
    // Give the user a moment to read the success screen before navigating away
    setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
  };

  const handleBackToDetails = () => {
    setStep('details');
    // Notify parent we're back to details
    if (onStepChange) {
      onStepChange('details', null);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      {step === 'details' && (
        <BookingDetailsForm
          surfSpot={surfSpot}
          guides={guides}
          gears={gears}
          onProceed={handleProceedToPayment}
        />
      )}

      {step === 'payment' && paymentData && (
        <PaymentForm
          booking={paymentData.booking}
          clientSecret={paymentData.clientSecret}
          totalPrice={paymentData.totalPrice}
          onBack={handleBackToDetails}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {step === 'success' && paymentData && <PaymentSuccess bookingId={paymentData.booking._id} />}
    </Elements>
  );
};

export default BookingForm;