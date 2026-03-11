import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { destinationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiCalendar, FiUsers, FiArrowLeft, FiStar, FiMessageSquare } from 'react-icons/fi';

const DestinationDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getById(id);
      setDestination(response.data.data);
    } catch (error) {
      console.error('Error fetching destination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await destinationAPI.addReview(id, {
        rating: parseInt(rating),
        comment
      });
      setRating(5);
      setComment('');
      await fetchDestination();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mb-4"></div>
          <p className="text-gray-600">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Destination not found</p>
          <button
            onClick={() => navigate('/destinations')}
            className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Back to Destinations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/destinations')}
            className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium transition"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Destinations
          </button>
        </div>
      </div>

      {/* Destination Image */}
      {destination.image && (
        <div className="relative h-96 bg-gray-200 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{destination.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 mb-4">
              <FiMapPin className="h-5 w-5 text-ocean-600" />
              {destination.location.city}, {destination.location.country}
            </p>

            {/* Rating */}
            {destination.rating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(destination.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-900">
                  {destination.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({destination.reviews?.length || 0} reviews)
                </span>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{destination.description}</p>

              {/* Key Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <FiCalendar className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Best Time to Surf</p>
                    <p className="text-lg font-semibold text-gray-900">{destination.bestTimeToSurf}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiStar className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Minimum Experience Level</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {destination.minimumExperienceLevel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Surf Spots Section */}
            {destination.surfSpots && destination.surfSpots.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiMapPin className="text-ocean-600" />
                  Surf Spots ({destination.surfSpots.length})
                </h2>
                <div className="space-y-4">
                  {destination.surfSpots.map((spot) => (
                    <div
                      key={spot._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-ocean-500 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{spot.name}</h3>
                          <p className="text-sm text-gray-600">{spot.description}</p>
                        </div>
                        {spot.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{spot.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-ocean-600 font-medium">
                        ${spot.pricePerHour}/hour
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guides Section */}
            {destination.guides && destination.guides.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiUsers className="text-ocean-600" />
                  Guides ({destination.guides.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.guides.map((guide) => (
                    <div
                      key={guide._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-ocean-500 transition"
                    >
                      <h3 className="font-bold text-lg text-gray-900">{guide.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{guide.email}</p>
                      <p className="text-xs bg-ocean-100 text-ocean-800 px-2 py-1 rounded inline-block capitalize">
                        {guide.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiMessageSquare className="text-ocean-600" />
                Reviews
              </h2>

              {/* Review Form */}
              {isAuthenticated ? (
                <form onSubmit={handleAddReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Good</option>
                      <option value="3">⭐⭐⭐ Average</option>
                      <option value="2">⭐⭐ Poor</option>
                      <option value="1">⭐ Terrible</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this destination..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      rows="4"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-ocean-50 border border-ocean-200 rounded-lg text-center">
                  <p className="text-gray-700 mb-3">
                    Sign in to share your experience with this destination
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Login to Review
                  </button>
                </div>
              )}

              {/* Reviews List */}
              {destination.reviews && destination.reviews.length > 0 ? (
                <div className="space-y-4">
                  {destination.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.user?.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Destination Info</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Experience Level</p>
                  <p className="text-lg font-semibold text-ocean-600 capitalize">
                    {destination.minimumExperienceLevel}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Surf Spots</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {destination.surfSpots?.length || 0}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Available Guides</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {destination.guides?.length || 0}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Best Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {destination.bestTimeToSurf}
                  </p>
                </div>

                {destination.rating > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(destination.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {destination.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
