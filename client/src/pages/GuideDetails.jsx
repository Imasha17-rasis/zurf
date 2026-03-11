import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiAward, FiCalendar, FiDollarSign, FiArrowLeft, FiX } from 'react-icons/fi';
import { guideAPI } from '../services/api';
import { surfSpotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GuideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hireLoading, setHireLoading] = useState(false);
  const [hireMessage, setHireMessage] = useState({ type: '', text: '' });
  const [showHireModal, setShowHireModal] = useState(false);
  const [surfSpots, setSurfSpots] = useState([]);
  const [surfSpotsLoading, setSurfSpotsLoading] = useState(false);
  const [selectedSurfSpot, setSelectedSurfSpot] = useState(null);

  // Helper function to format location object or string
  const formatLocation = (location) => {
    if (!location) return 'Sri Lanka';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }
      return 'Sri Lanka';
    }
    return 'Sri Lanka';
  };

  // Helper function to determine specialties based on experience
  const getSpecialtiesByExperience = (years) => {
    const specialtiesPool = [
      'Beginner Lessons',
      'Advanced Techniques',
      'Reef Breaks',
      'Beach Breaks',
      'Wave Selection',
      'Safety Training',
      'Video Analysis',
      'Group Lessons',
      'Ocean Safety',
    ];
    
    const shuffled = specialtiesPool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Generate dummy reviews
  const generateDummyReviews = (guideName) => [
    {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2 weeks ago',
      text: `${guideName} is an amazing instructor! Patient, encouraging, and really knows how to break down the basics.`
    },
    {
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=13',
      rating: 5,
      date: '1 month ago',
      text: 'Best surf lesson ever. Highly recommended for all levels!'
    },
    {
      name: 'Emma Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 4,
      date: '1 month ago',
      text: 'Great instructor with good knowledge and teaching methods.'
    },
    {
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      date: '2 months ago',
      text: 'Fantastic experience! Made me feel safe and confident in the water.'
    }
  ];

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await guideAPI.getById(id);
        const guideData = response.data.data;

        // Transform API data to component structure
        const formattedLocation = formatLocation(guideData.surfSpot?.location);
        const transformedGuide = {
          _id: guideData._id,
          name: guideData.user?.name || 'Anonymous Guide',
          image: guideData.profileImage || `https://i.pravatar.cc/400?u=${guideData.user?.email || guideData._id}`,
          location: formattedLocation,
          experience: `${guideData.experienceYears} year${guideData.experienceYears !== 1 ? 's' : ''}`,
          rating: 4.5 + (guideData.experienceYears * 0.05 > 0.5 ? 0.5 : guideData.experienceYears * 0.05),
          reviewCount: Math.floor(Math.random() * 200) + 20,
          pricePerSession: `$${guideData.pricePerSession}`,
          specialties: getSpecialtiesByExperience(guideData.experienceYears),
          bio: `Certified surf guide with ${guideData.experienceYears} years of experience. Charges $${guideData.pricePerSession} per session.`,
          fullBio: guideData.user?.bio || `Certified surf guide with ${guideData.experienceYears} years of experience. Available for lessons at ${formattedLocation}.`,
          certifications: [
            'Certified Surf Instructor',
            'Ocean Safety Trained',
            'First Aid Certified'
          ],
          reviews: generateDummyReviews(guideData.user?.name || 'Guide')
        };

        setGuide(transformedGuide);
        setError(null);
      } catch (err) {
        console.error('Error fetching guide:', err);
        setError('Failed to load guide details');
        setGuide(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  const handleRequestHire = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSurfSpotsLoading(true);
      const response = await surfSpotAPI.getOwnerSpots();
      setSurfSpots(response.data.data || []);
      setSelectedSurfSpot(null);
      setShowHireModal(true);
    } catch (err) {
      console.error('Error fetching surf spots:', err);
      setHireMessage({ 
        type: 'error', 
        text: 'Failed to load your surf spots. Please try again.' 
      });
    } finally {
      setSurfSpotsLoading(false);
    }
  };

  const handleConfirmHire = async () => {
    if (!selectedSurfSpot) {
      setHireMessage({ type: 'error', text: 'Please select a surf spot' });
      return;
    }

    try {
      setHireLoading(true);
      const response = await guideAPI.requestHire(id, selectedSurfSpot._id);
      
      setShowHireModal(false);
      setHireMessage({ 
        type: 'success', 
        text: 'Hire request sent! The guide will review and respond to your request.' 
      });
      
      setTimeout(() => setHireMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error requesting hire:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send hire request';
      setHireMessage({ type: 'error', text: errorMsg });
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Guide not found'}</h2>
          <button
            onClick={() => navigate('/guides')}
            className="text-ocean-600 hover:text-ocean-700 font-semibold"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/guides')}
            className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-semibold transition"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span>Back to Guides</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Guide Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src={guide.image}
                  alt={guide.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-1 shadow-lg">
                  <FiStar className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-bold text-gray-900">{guide.rating}</span>
                  <span className="text-sm text-gray-600">({guide.reviewCount})</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{guide.name}</h1>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="h-5 w-5 mr-2 text-ocean-500" />
                    <span>{guide.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiAward className="h-5 w-5 mr-2 text-ocean-500" />
                    <span>{guide.experience} experience</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiDollarSign className="h-5 w-5 mr-2 text-ocean-500" />
                    <span>{guide.pricePerSession} per session</span>
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                  <ul className="space-y-2">
                    {guide.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-ocean-500 mr-2">✓</span>
                        <span className="text-gray-700">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, idx) => (
                      <span key={idx} className="bg-ocean-50 text-ocean-700 text-xs font-medium px-3 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {hireMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    hireMessage.type === 'success' 
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {hireMessage.text}
                  </div>
                )}

                {/* CTA Button */}
                {user?.role === 'owner' ? (
                  <button
                    onClick={handleRequestHire}
                    disabled={hireLoading}
                    className="w-full mt-6 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <FiCalendar className="h-5 w-5" />
                    <span>{hireLoading ? 'Sending...' : 'Request to Hire'}</span>
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="w-full mt-6 bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-xl font-semibold transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <FiCalendar className="h-5 w-5" />
                    <span>Book a Session</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Bio & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {guide.name.split(' ')[0]}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{guide.fullBio}</p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({guide.reviewCount})</h2>
              
              {/* Review Stats */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.round(guide.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{guide.rating} out of 5</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{guide.rating}</p>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {guide.reviews.map((review, idx) => (
                  <div key={idx} className="pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Learn from {guide.name.split(' ')[0]}?</h2>
          <p className="text-lg text-ocean-100 mb-6">Book a session and start your surfing journey today</p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-white text-ocean-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span>Book Now</span>
            <FiArrowLeft className="h-5 w-5 rotate-180" />
          </Link>
        </div>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Select Surf Spot</h3>
              <button
                onClick={() => {
                  setShowHireModal(false);
                  setSelectedSurfSpot(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">Choose a surf spot to assign this guide to:</p>

            {surfSpotsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
              </div>
            ) : surfSpots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't added any surf spots yet.</p>
                <Link
                  to="/dashboard/owner"
                  className="text-ocean-600 hover:text-ocean-700 font-semibold"
                >
                  Create Surf Spot
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {surfSpots.map((spot) => (
                    <div
                      key={spot._id}
                      onClick={() => setSelectedSurfSpot(spot)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedSurfSpot?._id === spot._id
                          ? 'border-ocean-600 bg-ocean-50'
                          : 'border-gray-200 bg-white hover:border-ocean-400'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{spot.name}</h4>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        <span>{formatLocation(spot.location)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowHireModal(false);
                      setSelectedSurfSpot(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmHire}
                    disabled={!selectedSurfSpot || hireLoading}
                    className="flex-1 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                  >
                    {hireLoading ? 'Sending...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDetails;
