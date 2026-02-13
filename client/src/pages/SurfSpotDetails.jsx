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
  FiPackage
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

  useEffect(() => {
    fetchSurfSpotDetails();
  }, [id]);

  const fetchSurfSpotDetails = async () => {
    try {
      setLoading(true);
      const [spotResponse, gearsResponse] = await Promise.all([
        surfSpotAPI.getById(id),
        gearAPI.getBySurfSpot(id)
      ]);

      setSurfSpot(spotResponse.data.data);
      setGears(gearsResponse.data.data);

      // Fetch guides if available
      if (spotResponse.data.data.guides?.length > 0) {
        const guidesData = await Promise.all(
          spotResponse.data.data.guides.map(guideId => 
            guideAPI.getById(guideId).catch(() => null)
          )
        );
        setGuides(guidesData.filter(g => g !== null).map(g => g.data.data));
      }
    } catch (error) {
      console.error('Error fetching surf spot details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    alert('Booking created successfully! Check your bookings page.');
    navigate('/my-bookings');
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
            {guides.length > 0 && (
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

            {/* Available Gear */}
            {gears.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiPackage className="mr-2" />
                  Available Gear
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gears.map(gear => (
                    <div key={gear._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{gear.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {gear.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {gear.quantityAvailable} available
                        </span>
                        <span className="font-bold text-ocean-600">
                          ${gear.pricePerHour}/hr
                        </span>
                      </div>
                    </div>
                  ))}
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