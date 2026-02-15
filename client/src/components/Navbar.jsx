import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'owner':
        return '/dashboard/owner';
      case 'guide':
        return '/dashboard/guide';
      case 'admin':
        return '/admin';
      default:
        return '/profile';
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GiWaves className="h-8 w-8 text-ocean-500" />
              <span className="text-2xl font-bold text-gray-900">Zurf</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
            >
              Surf Spots
            </Link>
            <Link
              to="/guides"
              className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
            >
              Guides
            </Link>
            <Link
              to="/gear"
              className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
            >
              Gear
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
            >
              Profile
            </Link>

            {isAuthenticated && user?.role === 'surfer' && (
              <Link
                to="/my-bookings"
                className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
              >
                My Bookings
              </Link>
            )}

            {isAuthenticated && (user?.role === 'owner' || user?.role === 'guide') && (
              <Link
                to={getDashboardLink()}
                className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-ocean-500"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-ocean-500 px-3 py-2 text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-ocean-500 p-2"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Surf Spots
            </Link>
            <Link
              to="/guides"
              className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Guides
            </Link>
            <Link
              to="/gear"
              className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gear
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>

            {isAuthenticated && user?.role === 'surfer' && (
              <Link
                to="/my-bookings"
                className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}

            {isAuthenticated && (user?.role === 'owner' || user?.role === 'guide') && (
              <Link
                to={getDashboardLink()}
                className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-gray-700 hover:bg-ocean-50 hover:text-ocean-500 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;