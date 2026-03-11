import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiMapPin, 
  FiCalendar, 
  FiPackage, 
  FiUsers, 
  FiBarChart2,
  FiSettings,
  FiShield,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const ownerLinks = [
    { path: '/dashboard/owner', icon: FiHome, label: 'Dashboard' },
    { path: '/dashboard/owner/surf-spots', icon: FiMapPin, label: 'My Surf Spots' },
    { path: '/dashboard/owner/bookings', icon: FiCalendar, label: 'Bookings' },
    { path: '/dashboard/owner/gears', icon: FiPackage, label: 'Gear Management' },
    { path: '/dashboard/owner/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const guideLinks = [
    { path: '/dashboard/guide', icon: FiHome, label: 'Dashboard' },
    { path: '/dashboard/guide/schedule', icon: FiCalendar, label: 'My Schedule' },
    { path: '/dashboard/guide/profile', icon: FiSettings, label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/verifications', icon: FiShield, label: 'Verifications' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'System Analytics' },
  ];

  const links = role === 'owner' ? ownerLinks : role === 'guide' ? guideLinks : adminLinks;

  return (
    <aside className="bg-white w-64 min-h-screen shadow-lg flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {role === 'owner' ? 'Owner Panel' : role === 'guide' ? 'Guide Panel' : 'Admin Panel'}
        </h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.path)
                  ? 'bg-ocean-500 text-white'
                  : 'text-gray-700 hover:bg-ocean-50 hover:text-ocean-600'
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <FiLogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;