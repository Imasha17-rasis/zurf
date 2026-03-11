import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import {
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiX,
  FiShield,
  FiImage,
  FiEye,
  FiXCircle,
  FiSearch
} from 'react-icons/fi';

const AdminPanel = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' });
  
  // Search and filter states for users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Determine active tab based on URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/verifications')) return 'verifications';
    if (path.includes('/users')) return 'users';
    if (path.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Filter users based on search and filter criteria
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    return allUsers.filter((user) => {
      const matchesSearch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === '' || 
        (statusFilter === 'active' && !user.isSuspended) ||
        (statusFilter === 'suspended' && user.isSuspended);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const promises = [];

      // Always fetch analytics and verifications
      promises.push(adminAPI.getAnalytics());
      promises.push(adminAPI.getPendingVerifications());

      // Also fetch users if on users tab
      if (activeTab === 'users') {
        promises.push(adminAPI.getAllUsers());
      }

      const [analyticsRes, verificationsRes, usersRes] = await Promise.all(promises);

      setAnalytics(analyticsRes.data.data);
      setPendingVerifications(verificationsRes.data.data);
      if (usersRes) {
        setAllUsers(usersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, type) => {
    try {
      if (type === 'owner') {
        await adminAPI.verifyOwner(userId);
      } else if (type === 'guide') {
        await adminAPI.verifyGuide(userId);
      }
      alert('User verified successfully');
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleVerifySurfSpot = async (spotId) => {
    try {
      await adminAPI.verifySurfSpot(spotId);
      alert('Surf spot verified successfully');
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleVerifyGear = async (gearId) => {
    try {
      await adminAPI.verifyGear(gearId);
      alert('Gear verified successfully');
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) {
      return;
    }

    try {
      await adminAPI.suspendUser(userId);
      alert('User suspended successfully');
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Suspension failed');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'overview' && 'Admin Dashboard'}
              {activeTab === 'verifications' && 'Pending Verifications'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'analytics' && 'System Analytics'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'overview' && 'System overview and management'}
              {activeTab === 'verifications' && 'Review and manage pending verifications'}
              {activeTab === 'users' && 'Manage all system users'}
              {activeTab === 'analytics' && 'Detailed system analytics and reports'}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                  title="Total Users"
                  value={analytics.users.total}
                  subtitle={`${analytics.users.surfers} Surfers, ${analytics.users.owners} Owners, ${analytics.users.guides} Guides`}
                  icon={FiUsers}
                  color="blue"
                />
                <AnalyticsCard
                  title="Surf Spots"
                  value={analytics.surfSpots.total}
                  subtitle={`${analytics.surfSpots.verified} Verified, ${analytics.surfSpots.pending} Pending`}
                  icon={FiMapPin}
                  color="ocean"
                />
                <AnalyticsCard
                  title="Total Bookings"
                  value={analytics.bookings.total}
                  subtitle={`${analytics.bookings.completed} Completed`}
                  icon={FiCalendar}
                  color="purple"
                />
                <AnalyticsCard
                  title="Total Revenue"
                  value={`$${analytics.revenue.total.toFixed(2)}`}
                  icon={FiDollarSign}
                  color="green"
                />
              </div>

              {/* Monthly Revenue Chart */}
              {analytics.revenue.monthly && analytics.revenue.monthly.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Revenue Trend</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Month
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Bookings
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analytics.revenue.monthly.map((month, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {month._id.year}-{String(month._id.month).padStart(2, '0')}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {month.count}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600">
                              ${month.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && pendingVerifications && (
            <div className="space-y-6">
              {/* Pending Users */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiShield className="h-5 w-5 mr-2 text-ocean-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending User Verifications ({pendingVerifications.users.length})
                  </h2>
                </div>

                {pendingVerifications.users.length === 0 ? (
                  <p className="p-8 text-center text-gray-600">No pending user verifications</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pendingVerifications.users.map((user) => (
                      <div key={user._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {user.role}
                            </span>

                            {/* Document Display */}
                            {user.certificate && (
                              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <FiImage className="h-5 w-5 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {user.role === 'guide' ? 'Certification Document' : 'Verification Document'}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Submitted document for verification</p>
                                  </div>
                                  <button
                                    onClick={() => setDocumentModal({ isOpen: true, url: user.certificate, title: `${user.name}'s Certificate` })}
                                    className="flex items-center space-x-1 bg-ocean-500 hover:bg-ocean-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                                  >
                                    <FiEye className="h-4 w-4" />
                                    <span>View</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVerifyUser(user._id, user.role)}
                              className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              <FiCheck className="h-4 w-4" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => handleSuspendUser(user._id)}
                              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              <FiX className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Surf Spots */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiMapPin className="h-5 w-5 mr-2 text-ocean-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Surf Spots ({pendingVerifications.surfSpots.length})
                  </h2>
                </div>

                {pendingVerifications.surfSpots.length === 0 ? (
                  <p className="p-8 text-center text-gray-600">No pending surf spot verifications</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pendingVerifications.surfSpots.map((spot) => (
                      <div key={spot._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{spot.name}</h3>
                            <p className="text-sm text-gray-600">
                              {spot.location?.city}, {spot.location?.country}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Owner: {spot.owner?.name}
                            </p>

                            {/* Images Display */}
                            {spot.images && spot.images.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  Submitted Images ({spot.images.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {spot.images.map((image, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setDocumentModal({ isOpen: true, url: image, title: `${spot.name} - Image ${idx + 1}` })}
                                      className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-ocean-500 transition group"
                                    >
                                      <img
                                        src={image}
                                        alt={`${spot.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition">
                                        <FiEye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleVerifySurfSpot(spot._id)}
                            className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <FiCheck className="h-4 w-4" />
                            <span>Verify</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Gears */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiImage className="h-5 w-5 mr-2 text-ocean-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Gear Verifications ({pendingVerifications.gears.length})
                  </h2>
                </div>

                {pendingVerifications.gears.length === 0 ? (
                  <p className="p-8 text-center text-gray-600">No pending gear verifications</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pendingVerifications.gears.map((gear) => (
                      <div key={gear._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{gear.name}</h3>
                            <p className="text-sm text-gray-600">Type: {gear.type}</p>
                            <p className="text-sm text-gray-600">
                              Surf Spot: {gear.surfSpot?.name}
                            </p>

                            {/* Document Display */}
                            {gear.certificate && (
                              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <FiImage className="h-5 w-5 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      Gear Certification
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Equipment verification document</p>
                                  </div>
                                  <button
                                    onClick={() => setDocumentModal({ isOpen: true, url: gear.certificate, title: `${gear.name} Certificate` })}
                                    className="flex items-center space-x-1 bg-ocean-500 hover:bg-ocean-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                                  >
                                    <FiEye className="h-4 w-4" />
                                    <span>View</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleVerifyGear(gear._id)}
                            className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <FiCheck className="h-4 w-4" />
                            <span>Verify</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && allUsers && (
            <div className="space-y-6">
              {/* Search and Filter Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Role
                      </label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      >
                        <option value="">All Roles</option>
                        <option value="surfer">Surfer</option>
                        <option value="owner">Owner</option>
                        <option value="guide">Guide</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Results Info */}
                  <div className="pt-2 text-sm text-gray-600">
                    Showing {filteredUsers.length} of {allUsers.length} users
                    {(searchQuery || roleFilter || statusFilter) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('');
                          setStatusFilter('');
                        }}
                        className="ml-3 text-ocean-600 hover:text-ocean-700 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiUsers className="h-5 w-5 mr-2 text-ocean-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Users ({filteredUsers.length})
                  </h2>
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="p-8 text-center text-gray-600">
                    {allUsers.length === 0 ? 'No users found' : 'No users match your search criteria'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                user.isSuspended
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.isSuspended ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                  title="Total Users"
                  value={analytics.users.total}
                  subtitle={`${analytics.users.surfers} Surfers`}
                  icon={FiUsers}
                  color="blue"
                />
                <AnalyticsCard
                  title="Owners & Guides"
                  value={analytics.users.owners + analytics.users.guides}
                  subtitle={`${analytics.users.owners} Owners, ${analytics.users.guides} Guides`}
                  icon={FiUsers}
                  color="purple"
                />
                <AnalyticsCard
                  title="Total Bookings"
                  value={analytics.bookings.total}
                  subtitle={`${analytics.bookings.completed} Completed`}
                  icon={FiCalendar}
                  color="green"
                />
                <AnalyticsCard
                  title="Total Revenue"
                  value={`$${analytics.revenue.total.toFixed(2)}`}
                  icon={FiDollarSign}
                  color="ocean"
                />
              </div>

              {/* Detailed Revenue Chart */}
              {analytics.revenue.monthly && analytics.revenue.monthly.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Revenue & Bookings</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Month
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Bookings
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Avg per Booking
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analytics.revenue.monthly.map((month, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                              {month._id.year}-{String(month._id.month).padStart(2, '0')}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {month.count}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600">
                              ${month.revenue.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              ${(month.revenue / month.count).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Content Verification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Verified Surf Spots</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {analytics.surfSpots.verified}
                      </p>
                    </div>
                    <FiMapPin className="h-12 w-12 text-ocean-500 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pending Spots</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {analytics.surfSpots.pending}
                      </p>
                    </div>
                    <FiMapPin className="h-12 w-12 text-yellow-500 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Spots</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {analytics.surfSpots.total}
                      </p>
                    </div>
                    <FiMapPin className="h-12 w-12 text-blue-500 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{documentModal.title}</h3>
              <button
                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiXCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-gray-50">
              {documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={documentModal.url}
                  alt={documentModal.title}
                  className="w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiImage className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Document type not previewable</p>
                  <a
                    href={documentModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;