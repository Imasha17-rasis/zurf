import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surfSpotAPI } from '../services/api';
import SurfSpotCard from '../components/SurfSpotCard';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const SurfSpots = () => {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchSurfSpots();
  }, [sortBy]);

  const fetchSurfSpots = async (params = {}) => {
    try {
      setLoading(true);
      const response = await surfSpotAPI.getAll({
        ...params,
        sort: sortBy === 'latest' ? '-createdAt' : sortBy === 'rating' ? '-rating' : sortBy
      });
      setSurfSpots(response.data.data);
    } catch (error) {
      console.error('Error fetching surf spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchSurfSpots({ search: searchTerm.trim() });
    } else {
      fetchSurfSpots();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchSurfSpots();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Surf Spots</h1>
            <p className="text-xl text-ocean-100 mb-8">
              Discover amazing surf spots added by our community of owners
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
                <FiSearch className="h-6 w-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search surf spots by name or location..."
                  className="flex-1 px-4 py-4 text-gray-900 text-lg focus:outline-none rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      clearSearch();
                    }}
                    className="text-gray-400 hover:text-gray-600 mr-2 text-xl transition"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiFilter className="h-5 w-5" />
              <span className="font-semibold">Sort by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  sortBy === 'latest'
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-ocean-500'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  sortBy === 'rating'
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-ocean-500'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  sortBy === 'name'
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-ocean-500'
                }`}
              >
                Name (A-Z)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Info */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg">
              {loading ? 'Loading...' : `Showing ${surfSpots.length} surf spot${surfSpots.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
          ) : surfSpots.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <GiWaves className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No surf spots found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No results for "${searchTerm}". Try searching for a different location.`
                  : 'There are no surf spots available at the moment.'}
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            /* Surf Spots Grid */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {surfSpots.map((spot) => (
                  <SurfSpotCard key={spot._id} surfSpot={spot} />
                ))}
              </div>

              {/* Clear Search Button (when searching) */}
              {searchTerm && (
                <div className="text-center mt-12">
                  <button
                    onClick={clearSearch}
                    className="text-ocean-600 hover:text-ocean-700 font-semibold px-6 py-2 rounded-lg border border-ocean-600 hover:bg-ocean-50 transition-all"
                  >
                    Clear Search and See All
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Surf Experience?</h2>
          <p className="text-lg text-ocean-100 mb-8">
            Click on any surf spot to see details, available guides, and gear rentals
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-white text-ocean-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurfSpots;
