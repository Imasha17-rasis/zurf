const Guide = require('../models/Guide');

/**
 * Get hired guides for a specific surf spot
 * @param {String} surfSpotId - The ID of the surf spot
 * @returns {Array} - Array of hired guides with populated user data
 */
exports.getHiredGuidesForSurfSpot = async (surfSpotId) => {
  try {
    console.log('📍 Getting hired guides for surf spot:', surfSpotId);
    
    // Find all guides with accepted hire requests for this surf spot
    const hiredGuides = await Guide.find({
      'hireRequests': {
        $elemMatch: {
          surfSpot: surfSpotId,
          status: 'accepted'
        }
      }
    }).populate('user', 'name email profileImage').populate({
      path: 'hireRequests',
      match: { surfSpot: surfSpotId, status: 'accepted' }
    });

    console.log('✅ Found hired guides:', hiredGuides.length);
    return hiredGuides;
  } catch (error) {
    console.error('❌ Error getting hired guides:', error);
    return [];
  }
};

/**
 * Check if a guide is hired for a specific surf spot
 * @param {String} guideId - The ID of the guide
 * @param {String} surfSpotId - The ID of the surf spot
 * @returns {Boolean} - True if guide is hired for this spot
 */
exports.isGuidehiredForSurfSpot = async (guideId, surfSpotId) => {
  try {
    const guide = await Guide.findById(guideId);
    if (!guide) return false;

    const hired = guide.hireRequests?.some(
      hire => hire.surfSpot.toString() === surfSpotId && hire.status === 'accepted'
    );
    
    return hired || false;
  } catch (error) {
    console.error('❌ Error checking if guide is hired:', error);
    return false;
  }
};
