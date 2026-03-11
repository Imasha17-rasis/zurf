import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

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

  const getNavItems = () => {
    const allItems = [
      { path: '/', label: 'Home' },
      { path: '/chatbot', label: '💬 AI Assistant', roles: ['surfer'] },
      { path: '/guides', label: 'Guides', roles: ['owner'] },
      { path: '/destinations', label: 'Destinations', roles: ['surfer'] },
      { path: '/surf-spots', label: 'Surf Spots', roles: ['surfer'] },
      { path: '/my-bookings', label: 'My Bookings', roles: ['surfer'], requiresAuth: true },
      { path: getDashboardLink(), label: 'Dashboard', roles: ['guide', 'owner'], requiresAuth: true },
      { path: '/profile', label: 'Profile', roles: ['guide', 'owner', 'surfer'], requiresAuth: true },
    ];

    if (!isAuthenticated) {
      return [{ path: '/', label: 'Home' }];
    }

    return allItems.filter(item => {
      // Home is always available
      if (item.path === '/') return true;

      // If item doesn't specify roles, it's available for all
      if (!item.roles) return true;

      // If requiresAuth is set and user is not authenticated
      if (item.requiresAuth && !isAuthenticated) return false;

      // Check if user's role is in the allowed roles
      return item.roles.includes(user?.role);
    });
  };

  const navItems = getNavItems();

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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition border-b-2 ${
                  isActive(item.path)
                    ? 'text-ocean-500 border-ocean-500'
                    : 'text-gray-700 hover:text-ocean-500 border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md font-medium transition ${
                  isActive(item.path)
                    ? 'bg-ocean-100 text-ocean-600 border-l-4 border-ocean-500'
                    : 'text-gray-700 hover:bg-ocean-50 hover:text-ocean-500'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

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
                  className={`block px-3 py-2 rounded-md font-medium transition ${
                    isActive('/login')
                      ? 'bg-ocean-100 text-ocean-600 border-l-4 border-ocean-500'
                      : 'text-gray-700 hover:bg-ocean-50 hover:text-ocean-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md font-medium transition ${
                    isActive('/register')
                      ? 'bg-ocean-100 text-ocean-600 border-l-4 border-ocean-500'
                      : 'text-gray-700 hover:bg-ocean-50 hover:text-ocean-500'
                  }`}
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