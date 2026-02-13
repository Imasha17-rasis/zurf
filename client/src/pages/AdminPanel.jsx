import React, { useState, useEffect } from 'react';
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
  FiShield
} from 'react-icons/fi';

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, verifications, users

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, verificationsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getPendingVerifications(),
      ]);

      setAnalytics(analyticsRes.data.data);
      setPendingVerifications(verificationsRes.data.data);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">System overview and management</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
            {['overview', 'verifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                  activeTab === tab
                    ? 'bg-ocean-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {user.role}
                            </span>
                            {user.certificate && (
                              <div className="mt-2">
                                <a
                                  href={user.certificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-ocean-600 hover:underline"
                                >
                                  View Certificate
                                </a>
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{spot.name}</h3>
                            <p className="text-sm text-gray-600">
                              {spot.location?.city}, {spot.location?.country}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Owner: {spot.owner?.name}
                            </p>
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
                <div className="px-6 py-4 border-b border-gray-200">
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{gear.name}</h3>
                            <p className="text-sm text-gray-600">Type: {gear.type}</p>
                            <p className="text-sm text-gray-600">
                              Surf Spot: {gear.surfSpot?.name}
                            </p>
                            {gear.certificate && (
                              <div className="mt-2">
                                <a
                                  href={gear.certificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-ocean-600 hover:underline"
                                >
                                  View Certificate
                                </a>
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;