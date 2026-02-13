import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi';

const BookingForm = ({ surfSpot, guides, gears, onSuccess }) => {
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

  // Calculate price whenever form data changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (formData.durationHours > 0) {
        try {
          const response = await bookingAPI.calculatePrice({
            surfSpotId: surfSpot._id,
            guideId: formData.guide || null,
            gearIds: formData.gears,
            durationHours: formData.durationHours,
          });
          setCalculatedPrice(response.data.data);
        } catch (error) {
          console.error('Price calculation error:', error);
        }
      }
    };

    calculatePrice();
  }, [formData.durationHours, formData.guide, formData.gears, surfSpot._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGearChange = (gearId) => {
    setFormData(prev => ({
      ...prev,
      gears: prev.gears.includes(gearId)
        ? prev.gears.filter(id => id !== gearId)
        : [...prev.gears, gearId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        surfSpot: surfSpot._id,
        guide: formData.guide || null,
        gears: formData.gears,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        durationHours: Number(formData.durationHours),
      };

      await bookingAPI.create(bookingData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
          {[1, 2, 3, 4, 5, 6].map(hours => (
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
            Select Guide (Optional)
          </label>
          <select
            name="guide"
            value={formData.guide}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="">No guide</option>
            {guides.map(guide => (
              <option key={guide._id} value={guide._id}>
                {guide.user?.name} - ${guide.pricePerSession} ({guide.experienceYears} years exp)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gear Selection */}
      {gears && gears.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Gear (Optional)
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {gears.map(gear => (
              <label key={gear._id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gears.includes(gear._id)}
                  onChange={() => handleGearChange(gear._id)}
                  className="w-4 h-4 text-ocean-500 rounded focus:ring-ocean-500"
                />
                <span className="flex-1 text-sm text-gray-700">
                  {gear.name} ({gear.type})
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${gear.pricePerHour}/hr
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {calculatedPrice && (
        <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Surf Spot ({formData.durationHours}h)</span>
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
      >
        {loading ? 'Processing...' : 'Confirm Booking'}
      </button>
    </form>
  );
};

export default BookingForm;