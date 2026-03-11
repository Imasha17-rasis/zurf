import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationAPI } from '../services/api';
import { FiMapPin, FiStar, FiDroplet } from 'react-icons/fi';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getAll();
      const destinationsList = response.data.data || response.data;
      setDestinations(destinationsList);
      // Get first 4 destinations with surf spots for featured section
      const destinationsWithSpots = destinationsList.filter(
        (dest) => dest.surfSpots && dest.surfSpots.length > 0
      );
      setFeaturedDestinations(destinationsWithSpots.slice(0, 4));
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationClick = (id) => {
    navigate(`/destinations/${id}`);
  };

  const handleSurfSpotClick = (e, spotId) => {
    e.stopPropagation();
    navigate(`/surf-spots/${spotId}`);
  };

  const getGuidesCountFromSurfSpots = (surfSpots) => {
    if (!surfSpots || surfSpots.length === 0) return 0;
    const guideIds = new Set();
    surfSpots.forEach((spot) => {
      if (spot.guides && Array.isArray(spot.guides)) {
        spot.guides.forEach((guide) => {
          guideIds.add(guide._id || guide);
        });
      }
    });
    return guideIds.size;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Explore Destinations</h1>
          <p className="text-ocean-100">Discover the best surf destinations around the world</p>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination) => (
              <div
                key={destination._id}
                onClick={() => handleDestinationClick(destination._id)}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <FiMapPin className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:via-black/30"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{destination.name}</h3>
                  
                  {/* Location */}
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <FiMapPin className="h-4 w-4" />
                    {destination.location.city}, {destination.location.country}
                  </p>

                  {/* Best Time to Surf */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-semibold">Best Season:</span> {destination.bestTimeToSurf}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Level:</span>{' '}
                      <span className="inline-block bg-ocean-100 text-ocean-800 px-2 py-0.5 rounded text-xs">
                        {destination.minimumExperienceLevel.charAt(0).toUpperCase() + destination.minimumExperienceLevel.slice(1)}
                      </span>
                    </p>
                  </div>

                  {/* Surf Spots */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      <FiDroplet className="h-4 w-4 inline-block mr-1" />
                      Surf Spots ({destination.surfSpots?.length || 0})
                    </p>
                    {destination.surfSpots && destination.surfSpots.length > 0 ? (
                      <div className="space-y-1">
                        {destination.surfSpots.map((spot) => (
                          <button
                            key={spot._id}
                            onClick={(e) => handleSurfSpotClick(e, spot._id)}
                            className="w-full text-left text-sm text-ocean-600 hover:text-ocean-700 hover:underline transition"
                          >
                            • {spot.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No surf spots yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Destinations Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mb-4"></div>
              <p className="text-gray-600">Loading destinations...</p>
            </div>
          </div>
        ) : destinations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div
                key={destination._id}
                onClick={() => handleDestinationClick(destination._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer transform hover:scale-105"
              >
                {/* Image */}
                {destination.image && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <FiMapPin className="h-4 w-4" />
                    {destination.location.city}, {destination.location.country}
                  </p>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{destination.description}</p>

                  {/* Tags and Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-ocean-100 text-ocean-800 px-2 py-1 rounded">
                        {destination.minimumExperienceLevel.charAt(0).toUpperCase() + destination.minimumExperienceLevel.slice(1)}
                      </span>
                      {destination.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            {destination.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">{destination.surfSpots?.length || 0}</span> Surf Spot
                        {destination.surfSpots?.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{getGuidesCountFromSurfSpots(destination.surfSpots)}</span> Guide
                        {getGuidesCountFromSurfSpots(destination.surfSpots) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-700 font-medium">
                      Best Time: <span className="text-ocean-600">{destination.bestTimeToSurf}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
