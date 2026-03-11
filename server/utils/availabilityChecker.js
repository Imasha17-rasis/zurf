const Booking = require('../models/Booking');
const Guide = require('../models/Guide');
const Gear = require('../models/Gear');
const { isGuidehiredForSurfSpot } = require('./guideHelper');

/**
 * Check if a guide is available for a given date and time
 * @param {String} guideId - Guide ID
 * @param {Date} bookingDate - The date of booking
 * @param {String} startTime - Start time (HH:MM format)
 * @param {Number} durationHours - Duration of booking in hours
 * @returns {Object} - { available: Boolean, reason: String }
 */
exports.checkGuideAvailability = async (guideId, bookingDate, startTime, durationHours) => {
  try {
    const guide = await Guide.findById(guideId);
    
    if (!guide) {
      return {
        available: false,
        reason: 'Guide not found'
      };
    }

    // Check if guide has availability dates set
    if (guide.availability && guide.availability.length > 0) {
      const bookingDateOnly = new Date(bookingDate);
      bookingDateOnly.setHours(0, 0, 0, 0);
      
      const isAvailableOnDate = guide.availability.some(availDate => {
        const availDateOnly = new Date(availDate);
        availDateOnly.setHours(0, 0, 0, 0);
        return availDateOnly.getTime() === bookingDateOnly.getTime();
      });

      if (!isAvailableOnDate) {
        return {
          available: false,
          reason: 'Guide is not available on this date'
        };
      }
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      guide: guideId,
      bookingDate: {
        $gte: new Date(bookingDate),
        $lt: new Date(new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'approved', 'completed'] },
      paymentStatus: 'paid'
    });

    // Parse time slots
    const [bookingHour, bookingMinute] = startTime.split(':').map(Number);
    const bookingStart = bookingHour * 60 + bookingMinute;
    const bookingEnd = bookingStart + (durationHours * 60);

    for (const booking of conflictingBookings) {
      const [existingHour, existingMinute] = booking.startTime.split(':').map(Number);
      const existingStart = existingHour * 60 + existingMinute;
      const existingEnd = existingStart + (booking.durationHours * 60);

      // Check for time overlap
      if (!(bookingEnd <= existingStart || bookingStart >= existingEnd)) {
        return {
          available: false,
          reason: 'Guide has a conflicting booking at this time'
        };
      }
    }

    return {
      available: true,
      reason: 'Guide is available'
    };
  } catch (error) {
    return {
      available: false,
      reason: `Error checking guide availability: ${error.message}`
    };
  }
};

/**
 * Check if gear items are available in required quantities
 * @param {Array} gearsData - Array of {gearId, quantity}
 * @param {Date} bookingDate - The date of booking
 * @returns {Object} - { available: Boolean, unavailableItems: Array }
 */
exports.checkGearAvailability = async (gearsData, bookingDate) => {
  try {
    const unavailableItems = [];

    for (const gearItem of gearsData) {
      const gear = await Gear.findById(gearItem.gearId || gearItem.gear);
      
      if (!gear) {
        unavailableItems.push({
          gearId: gearItem.gearId || gearItem.gear,
          reason: 'Gear not found'
        });
        continue;
      }

      // Check total quantity available
      if (gear.quantityAvailable < (gearItem.quantity || 1)) {
        unavailableItems.push({
          gearId: gearItem.gearId || gearItem.gear,
          gearName: gear.name,
          requested: gearItem.quantity || 1,
          available: gear.quantityAvailable,
          reason: `Only ${gear.quantityAvailable} unit(s) available`
        });
        continue;
      }

      // Check for conflicting bookings on the same date
      const conflictingBookings = await Booking.find({
        gears: {
          $elemMatch: {
            gear: gear._id
          }
        },
        bookingDate: {
          $gte: new Date(bookingDate),
          $lt: new Date(new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['pending', 'approved', 'completed'] },
        paymentStatus: 'paid'
      });

      // Calculate total reserved quantity
      let totalReserved = 0;
      conflictingBookings.forEach(booking => {
        const gearBooking = booking.gears.find(g => g.gear.toString() === gear._id.toString());
        if (gearBooking) {
          totalReserved += gearBooking.quantity;
        }
      });

      const availableForBooking = gear.quantityAvailable - totalReserved;
      
      if (availableForBooking < (gearItem.quantity || 1)) {
        unavailableItems.push({
          gearId: gearItem.gearId || gearItem.gear,
          gearName: gear.name,
          requested: gearItem.quantity || 1,
          available: availableForBooking,
          reason: `Only ${availableForBooking} unit(s) available on this date`
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  } catch (error) {
    return {
      available: false,
      unavailableItems: [{
        reason: `Error checking gear availability: ${error.message}`
      }]
    };
  }
};

/**
 * Get available guides for a given date/time slot
 * @param {String} surfSpotId - Surf spot ID
 * @param {Date} bookingDate - The date of booking
 * @param {String} startTime - Start time (HH:MM format)
 * @param {Number} durationHours - Duration in hours
 * @returns {Array} - Available guides
 */
exports.getAvailableGuides = async (surfSpotId, bookingDate, startTime, durationHours, guideIds = []) => {
  try {
    console.log('📍 getAvailableGuides called with guideIds:', guideIds);
    
    // Get guides by their IDs
    const guides = await Guide.find({
      _id: { $in: guideIds }
    }).populate('user', 'name');

    console.log('📍 Fetched guides from DB:', guides.length, guides.map(g => ({ id: g._id, name: g.user?.name })));

    const availableGuides = [];

    for (const guide of guides) {
      // Check if guide is hired for this surf spot
      const isHired = await isGuidehiredForSurfSpot(guide._id, surfSpotId);
      
      if (!isHired) {
        console.log(`  - Guide ${guide.user?.name}: ❌ Not hired for this spot`);
        continue;
      }

      // Check availability for the date/time
      const availability = await this.checkGuideAvailability(guide._id, bookingDate, startTime, durationHours);
      console.log(`  - Guide ${guide.user?.name}: ${availability.available ? '✅ Available' : '❌ Not available'} (${availability.reason})`);
      if (availability.available) {
        availableGuides.push(guide);
      }
    }

    console.log('✅ Final available guides:', availableGuides.length);
    return availableGuides;
  } catch (error) {
    console.error('❌ Error getting available guides:', error);
    return [];
  }
};

/**
 * Get available gear items for a given date
 * @param {String} surfSpotId - Surf spot ID
 * @param {Date} bookingDate - The date of booking
 * @returns {Array} - Available gear items with available quantities
 */
exports.getAvailableGears = async (surfSpotId, bookingDate) => {
  try {
    // Fetch gears assigned to this specific surf spot AND global/unassigned gears
    const gears = await Gear.find({
      $and: [
        {
          $or: [
            { surfSpot: surfSpotId },           // Gears assigned to this specific spot
            { surfSpot: null },                  // Gears not assigned to any spot (global)
            { surfSpot: undefined }
          ]
        },
        { quantityAvailable: { $gt: 0 } }
      ]
    });

    console.log('📍 getAvailableGears: Found', gears.length, 'gears for spot', surfSpotId);
    console.log('📍 Spot-specific gears:', gears.filter(g => g.surfSpot?.toString() === surfSpotId).length);
    console.log('📍 Global gears:', gears.filter(g => !g.surfSpot).length);

    const gearsWithAvailability = [];

    for (const gear of gears) {
      // Check for bookings on this date
      const conflictingBookings = await Booking.find({
        gears: {
          $elemMatch: {
            gear: gear._id
          }
        },
        bookingDate: {
          $gte: new Date(bookingDate),
          $lt: new Date(new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['pending', 'approved', 'completed'] },
        paymentStatus: 'paid'
      });

      let totalReserved = 0;
      conflictingBookings.forEach(booking => {
        const gearBooking = booking.gears.find(g => g.gear.toString() === gear._id.toString());
        if (gearBooking) {
          totalReserved += gearBooking.quantity;
        }
      });

      const availableQuantity = gear.quantityAvailable - totalReserved;
      
      gearsWithAvailability.push({
        ...gear.toObject(),
        availableQuantity: Math.max(0, availableQuantity)
      });
    }

    console.log('✅ Returning', gearsWithAvailability.length, 'gears with availability info');
    return gearsWithAvailability;
  } catch (error) {
    console.error('❌ Error getting available gears:', error);
    return [];
  }
};
