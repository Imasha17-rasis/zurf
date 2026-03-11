import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surfSpotAPI, guideAPI, gearAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import { 
  FiMapPin, 
  FiStar, 
  FiDollarSign, 
  FiCheckCircle,
  FiUser,
  FiPackage,
  FiCalendar
} from 'react-icons/fi';

const SurfSpotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSurfer } = useAuth();
  
  const [surfSpot, setSurfSpot] = useState(null);
  const [guides, setGuides] = useState([]);
  const [gears, setGears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState('details'); // Track booking form step
  const [bookingData, setBookingData] = useState(null); // Track booking details

  useEffect(() => {
    fetchSurfSpotDetails();
  }, [id]);

  const fetchSurfSpotDetails = async () => {
    try {
      setLoading(true);
      const surfSpotResponse = await surfSpotAPI.getById(id);
      setSurfSpot(surfSpotResponse.data.data);

      // Fetch gears assigned to this surf spot
      const gearsResponse = await gearAPI.getBySurfSpot(id);
      console.log('📍 Gears assigned to this spot:', gearsResponse.data.data?.length);
      const assignedGears = gearsResponse.data.data || [];

      // Also fetch all gears to get global/unassigned gears
      try {
        const allGearsResponse = await gearAPI.getAll();
        console.log('📍 All gears in system:', allGearsResponse.data.data?.length);
        
        // Get gears that are not assigned to any specific spot (can be used everywhere)
        const globalGears = allGearsResponse.data.data?.filter(gear => 
          !gear.surfSpot || gear.surfSpot === null || gear.surfSpot === undefined
        ) || [];
        
        console.log('📍 Global/unassigned gears:', globalGears.length);

        // Combine assigned and global gears, removing duplicates
        const allAvailableGears = [
          ...assignedGears,
          ...globalGears.filter(gg => !assignedGears.some(ag => ag._id === gg._id))
        ];

        console.log('✅ Total available gears (assigned + global):', allAvailableGears.length);
        setGears(allAvailableGears);
      } catch (err) {
        console.error('❌ Error fetching global gears:', err);
        // Fallback to just assigned gears if global fetch fails
        setGears(assignedGears);
      }

      console.log('📍 Surf Spot:', surfSpotResponse.data.data);

      // Fetch hired guides for this surf spot
      // Get all guides and filter for those with accepted hire requests for this spot
      try {
        const allGuidesResponse = await guideAPI.getAll();
        console.log('📍 All guides fetched:', allGuidesResponse.data.data?.length);
        
        // Filter guides that have been hired (accepted hireRequest) for this surf spot
        const hiredGuides = allGuidesResponse.data.data?.filter(guide => {
          const acceptedHire = guide.hireRequests?.some(
            hire => hire.surfSpot === id && hire.status === 'accepted'
          );
          return acceptedHire;
        }) || [];
        
        console.log('✅ Hired guides for this spot:', hiredGuides.length);
        setGuides(hiredGuides);
      } catch (err) {
        console.error('❌ Error fetching guides:', err);
        setGuides([]);
      }
    } catch (error) {
      console.error('❌ Error fetching surf spot details:', error);
      console.error('❌ Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    alert('Booking created successfully! Check your bookings page.');
    navigate('/my-bookings');
  };

  const handleBookingStepChange = (step, data) => {
    setBookingStep(step);
    setBookingData(data);
  };

  // Helper function to get guide name from booking data
  const getGuideName = () => {
    if (!bookingData?.booking?.guide) return null;

    const guide = bookingData.booking.guide;
    console.log('📍 Attempting to get guide name from:', guide);

    // If guide is a full object with user property
    if (guide?.user?.name) {
      console.log('✅ Found guide name from guide.user.name:', guide.user.name);
      return guide.user.name;
    }

    // If guide is an ID string or ObjectId
    const guideId = typeof guide === 'string' ? guide : guide?._id?.toString?.() || guide?.toString?.();
    console.log('📍 Looking up guide ID:', guideId);

    if (guideId) {
      const foundGuide = guides.find(g => {
        const gId = g._id?.toString ? g._id.toString() : g._id;
        return gId === guideId || g._id === guideId;
      });

      if (foundGuide?.user?.name) {
        console.log('✅ Found guide name from guides array:', foundGuide.user.name);
        return foundGuide.user.name;
      }
    }

    console.log('❌ Could not find guide name');
    return null;
  };

  // Helper function to get gear name from booking data
  const getGearName = (gearItem) => {
    if (!gearItem) return 'Unknown';

    // If gearItem is a full object with name property
    if (gearItem?.gear?.name) {
      return gearItem.gear.name;
    }

    if (gearItem?.name) {
      return gearItem.name;
    }

    // If gearItem.gear is an ID string, look it up
    const gearId = typeof gearItem.gear === 'string' 
      ? gearItem.gear 
      : gearItem.gear?._id?.toString?.() || gearItem.gear?.toString?.();

    if (gearId) {
      const foundGear = gears.find(g => {
        const gId = g._id?.toString ? g._id.toString() : g._id;
        return gId === gearId || g._id === gearId;
      });

      if (foundGear?.name) {
        return foundGear.name;
      }
    }

    return 'Unknown gear';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
      </div>
    );
  }

  if (!surfSpot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Surf spot not found</h2>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={surfSpot.images?.[0] || defaultImage}
          alt={surfSpot.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{surfSpot.name}</h1>
              {surfSpot.isVerified && (
                <FiCheckCircle className="h-8 w-8 text-green-400" />
              )}
            </div>
            <div className="flex items-center text-white text-lg">
              <FiMapPin className="mr-2" />
              {surfSpot.location?.city}, {surfSpot.location?.country}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{surfSpot.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-ocean-100 p-3 rounded-lg">
                    <FiDollarSign className="h-6 w-6 text-ocean-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price per hour</p>
                    <p className="text-xl font-bold text-gray-900">${surfSpot.pricePerHour}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <FiStar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-xl font-bold text-gray-900">
                      {surfSpot.rating?.toFixed(1) || 'New'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Guides */}
            {guides.length > 0 && bookingStep === 'details' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Available Guides
                </h2>
                <div className="space-y-4">
                  {guides.map(guide => (
                    <div key={guide._id} className="border border-gray-200 rounded-lg p-4 hover:border-ocean-300 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{guide.user?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {guide.experienceYears} years of experience
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-ocean-600">
                            ${guide.pricePerSession}
                          </p>
                          <p className="text-xs text-gray-500">per session</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Gears */}
            {gears.length > 0 && bookingStep === 'details' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiPackage className="mr-2" />
                  Available Gears
                </h2>
                <div className="space-y-4">
                  {gears.map(gear => (
                    <div key={gear._id} className="border border-gray-200 rounded-lg p-4 hover:border-ocean-300 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{gear.name}</h3>
                          <p className="text-sm text-gray-600">
                            {gear.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-ocean-600">
                            ${gear.pricePerHour}
                          </p>
                          <p className="text-xs text-gray-500">per hour</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3 mt-3">
                        <span className="text-gray-600">
                          {gear.quantityAvailable} available
                        </span>
                        {gear.isVerified && (
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Summary - shown during payment/success */}
            {bookingData && bookingStep !== 'details' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-4">
                  {/* Booking Details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiCalendar className="mr-2" />
                      Date & Time
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Date:</span> {new Date(bookingData.booking.bookingDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Start Time:</span> {bookingData.booking.startTime}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span> {bookingData.booking.durationHours} hour{bookingData.booking.durationHours > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Guide Addon */}
                  {getGuideName() && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2" />
                        Selected Guide
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        ✓ {getGuideName()}
                      </p>
                    </div>
                  )}

                  {/* Gears Addon */}
                  {bookingData.booking.gears && bookingData.booking.gears.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FiPackage className="mr-2" />
                        Selected Gears
                      </h3>
                      <div className="space-y-2">
                        {bookingData.booking.gears.map((gearItem, idx) => (
                          <div key={idx} className="text-sm text-gray-600 font-medium">
                            ✓ {getGearName(gearItem)}
                            {gearItem.quantity && ` x${gearItem.quantity}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-ocean-700 flex items-center">
                        <FiDollarSign className="h-5 w-5" />{bookingData.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Book This Spot</h2>
              
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please login to book this surf spot</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Login to Book
                  </button>
                </div>
              ) : !isSurfer ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Only surfers can make bookings</p>
                </div>
              ) : (
                <BookingForm
                  surfSpot={surfSpot}
                  guides={guides}
                  gears={gears}
                  onSuccess={handleBookingSuccess}
                  onStepChange={handleBookingStepChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurfSpotDetails;