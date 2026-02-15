import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surfSpotAPI } from '../services/api';
import SurfSpotCard from '../components/SurfSpotCard';
import {
  FiSearch,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const Home = () => {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = () => {
    if (searchTerm) {
      fetchSurfSpots({ city: searchTerm });
    } else {
      fetchSurfSpots();
    }
  };

  // Popular destinations data
  const popularDestinations = [
    {
      name: 'Malibu, California',
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
      spots: 12,
      description: 'Perfect waves for all skill levels'
    },
    {
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      spots: 25,
      description: 'Tropical paradise with world-class breaks'
    },
    {
      name: 'Gold Coast, Australia',
      image: 'https://images.unsplash.com/photo-1583737094376-5a0c9c2aa9c4?w=800',
      spots: 18,
      description: 'Consistent swells year-round'
    },
    {
      name: 'Nazaré, Portugal',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      spots: 8,
      description: 'Home to the biggest waves on Earth'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Surfer',
      image: 'https://i.pravatar.cc/150?img=1',
      text: 'Zurf made it so easy to find and book the perfect surf spots. The guides were amazing and the gear rental was seamless!'
    },
    {
      name: 'Mike Chen',
      role: 'Surf Enthusiast',
      image: 'https://i.pravatar.cc/150?img=13',
      text: 'As a beginner, I was nervous about finding the right spot. Zurf connected me with an incredible guide who made my first experience unforgettable.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Travel Blogger',
      image: 'https://i.pravatar.cc/150?img=5',
      text: "I've used Zurf in 5 different countries. It's the only platform I trust for finding authentic surf experiences around the world."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ocean-600 to-ocean-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920"
            alt="Surfing"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Ride the Perfect Wave
            </h1>
            <p className="text-xl md:text-2xl text-ocean-100 mb-10">
              Book premium surf spots, expert guides, and quality gear all in one place
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
                <FiSearch className="h-6 w-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="flex-1 px-4 py-4 text-gray-900 text-lg focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-ocean-100 rounded-full p-4">
                  <FiMapPin className="h-8 w-8 text-ocean-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Surf Spots</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-4">
                  <FiUsers className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">200+</h3>
              <p className="text-gray-600">Expert Guides</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 rounded-full p-4">
                  <GiWaves className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Surfers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-100 rounded-full p-4">
                  <FiCalendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">50K+</h3>
              <p className="text-gray-600">Bookings Made</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore the world's best surf spots</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-80">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{destination.name}</h3>
                    <p className="text-ocean-200 mb-3">{destination.description}</p>
                    <div className="flex items-center text-sm">
                      <FiMapPin className="h-4 w-4 mr-1" />
                      <span>{destination.spots} surf spots</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  1
                </div>
                <div className="absolute -top-2 -right-2 bg-ocean-300 rounded-full w-8 h-8 animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Spot</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse through hundreds of verified surf spots in Sri Lanka. Filter by location, price, and ratings to find your perfect wave.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book & Customize</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose your date, add an expert guide, and rent quality gear. Get instant price calculations and secure your booking in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ride the Waves</h3>
              <p className="text-gray-600 leading-relaxed">
                Show up and enjoy! Your spot is reserved, your guide is ready, and your gear is waiting. Just bring your passion for surfing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Surf Spots */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Surf Spots</h2>
              <p className="text-xl text-gray-600">Handpicked locations for the best experience</p>
            </div>
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hidden md:flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-semibold"
            >
              <span>View All</span>
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
          ) : surfSpots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No surf spots available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {surfSpots.slice(0, 6).map((spot) => (
                  <SurfSpotCard key={spot._id} surfSpot={spot} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center space-x-2 bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <span>Explore All Spots</span>
                  <FiArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-br from-ocean-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Surfers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of happy wave riders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Catch Your Next Wave?
          </h2>
          <p className="text-xl text-ocean-100 mb-10">
            Join our community of passionate surfers and discover your next adventure
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-ocean-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span>Get Started Free</span>
              <FiCheckCircle className="h-5 w-5" />
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-ocean-700 hover:bg-ocean-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 border-white/30"
            >
              <span>Browse Spots</span>
              <FiArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GiWaves className="h-8 w-8 text-ocean-400" />
                <span className="text-xl font-bold text-white">Zurf</span>
              </div>
              <p className="text-sm">
                Your trusted platform for booking the world's best surf spots, guides, and gear.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-ocean-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">How It Works</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Destinations</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Become a Host</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-ocean-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Safety</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Cancellation</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-ocean-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-ocean-400 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Zurf. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;