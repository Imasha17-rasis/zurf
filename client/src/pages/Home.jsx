import React, { useState, useEffect } from 'react';
import { surfSpotAPI } from '../services/api';
import SurfSpotCard from '../components/SurfSpotCard';
import { FiSearch, FiFilter, FiMapPin, FiDollarSign, FiStar } from 'react-icons/fi';

const Home = () => {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSurfSpots();
  }, []);

  const fetchSurfSpots = async (params = {}) => {
    try {
      setLoading(true);
      const response = await surfSpotAPI.getAll(params);
      setSurfSpots(response.data.data);
    } catch (error) {
      console.error('Error fetching surf spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    fetchSurfSpots(activeFilters);
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
    fetchSurfSpots();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Discover Amazing Surf Spots
            </h1>
            <p className="text-xl text-ocean-100 mb-8">
              Book the best surf spots, guides, and gear all in one place
            </p>
            
            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-2 flex items-center">
                <FiSearch className="h-6 w-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search by location..."
                  className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
                <button
                  onClick={applyFilters}
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-3 rounded-lg font-medium transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Surf Spots ({surfSpots.length})
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FiFilter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-1" />
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  placeholder="e.g., USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="e.g., Malibu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline mr-1" />
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline mr-1" />
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiStar className="inline mr-1" />
                  Min Rating
                </label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={applyFilters}
                className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 px-6 py-2 rounded-lg font-medium transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Surf Spots Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
          </div>
        ) : surfSpots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No surf spots found. Try different filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surfSpots.map((spot) => (
              <SurfSpotCard key={spot._id} surfSpot={spot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;