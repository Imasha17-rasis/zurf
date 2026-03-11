import React, { useState, useEffect } from 'react';
import { bookingAPI, surfSpotAPI, guideAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import {
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiTrendingUp,
  FiPackage,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAward
} from 'react-icons/fi';
import { format } from 'date-fns';

const DashboardOwner = () => {
  const [stats, setStats] = useState({
    dailyIncome: 0,
    todayBookings: 0,
    totalSpots: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [hireRequests, setHireRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignmentLoading, setAssignmentLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
    fetchHireRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'hiredGuides') {
      fetchHireRequests();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dailyIncomeRes, spotsRes, bookingsRes, monthlyRes] = await Promise.all([
        bookingAPI.getDailyIncome(),
        surfSpotAPI.getOwnerSpots(),
        bookingAPI.getOwnerBookings(),
        bookingAPI.getMonthlyReport(),
      ]);

      // Set stats
      setStats({
        dailyIncome: dailyIncomeRes.data.data.totalIncome || 0,
        todayBookings: dailyIncomeRes.data.data.totalBookings || 0,
        totalSpots: spotsRes.data.count || 0,
        pendingBookings: bookingsRes.data.data.filter(b => b.status === 'pending').length || 0,
      });

      // Set recent bookings (last 5)
      setRecentBookings(bookingsRes.data.data.slice(0, 5));

      // Set monthly report
      setMonthlyReport(monthlyRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHireRequests = async () => {
    try {
      const response = await guideAPI.getOwnerHireRequests();
      setHireRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hire requests:', error);
      setMessage({ type: 'error', text: 'Failed to load hire requests' });
    }
  };

  const handleAssignGuideToBooking = async (bookingId, guideId) => {
    try {
      setAssignmentLoading(bookingId);
      await guideAPI.assignGuideToBooking(bookingId, guideId);
      setMessage({ type: 'success', text: 'Guide assigned to booking successfully' });
      // Refresh bookings
      const bookingsRes = await bookingAPI.getOwnerBookings();
      setRecentBookings(bookingsRes.data.data.slice(0, 5));
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error assigning guide:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to assign guide' });
    } finally {
      setAssignmentLoading(null);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setAssignmentLoading(bookingId);
      await bookingAPI.updateStatus(bookingId, newStatus);
      setMessage({ type: 'success', text: `Booking ${newStatus} successfully` });
      // Refresh bookings
      const bookingsRes = await bookingAPI.getOwnerBookings();
      setRecentBookings(bookingsRes.data.data.slice(0, 5));
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update booking status' });
    } finally {
      setAssignmentLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar role="owner" />
          <div className="flex-1 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="owner" />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your business overview.</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-1.5 mb-6 flex gap-1">
              {['overview', 'bookings', 'hiredGuides'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg font-semibold capitalize transition-all duration-200 ${activeTab === tab
                      ? 'bg-ocean-500 text-white shadow-md ring-2 ring-ocean-300'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {tab === 'hiredGuides' ? 'Hired Guides' : tab}
                </button>
              ))}
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                {message.text}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnalyticsCard
                    title="Today's Income"
                    value={`$${stats.dailyIncome.toFixed(2)}`}
                    icon={FiDollarSign}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Today's Bookings"
                    value={stats.todayBookings}
                    icon={FiCalendar}
                    color="blue"
                  />
                  <AnalyticsCard
                    title="Total Surf Spots"
                    value={stats.totalSpots}
                    icon={FiMapPin}
                    color="ocean"
                  />
                  <AnalyticsCard
                    title="Pending Bookings"
                    value={stats.pendingBookings}
                    icon={FiUsers}
                    color="yellow"
                  />
                </div>

                {/* Monthly Report */}
                {monthlyReport && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FiTrendingUp className="mr-2" />
                      Monthly Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {monthlyReport.totalBookings}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${monthlyReport.totalIncome?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Average Booking Value</p>
                        <p className="text-2xl font-bold text-ocean-600">
                          ${monthlyReport.averageBookingValue?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiCalendar className="mr-2" />
                  Recent Bookings
                </h2>

                {recentBookings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">{booking.surfer?.name || 'N/A'}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Spot</p>
                                <p className="font-medium text-gray-900">{booking.surfSpot?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">{format(new Date(booking.bookingDate), 'MMM dd')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-medium text-green-600">${booking.totalPrice}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Guide</p>
                                <p className="font-medium text-gray-900">
                                  {booking.guide?.user?.name || booking.guide?.name || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {!booking.guide && booking.status === 'approved' && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Assign a guide:</p>
                            <select
                              disabled={hireRequests.filter(r => r.status === 'accepted').length === 0}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignGuideToBooking(booking._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">Select a guide...</option>
                              {hireRequests
                                .filter(r => r.status === 'accepted')
                                .map(request => (
                                  <option key={request._id} value={request.guide._id}>
                                    {request.guide.name} (${request.guide.pricePerSession}/session)
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {/* Status Change Buttons */}
                        {booking.status === 'pending' && (
                          <div className="flex gap-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'approved')}
                              disabled={assignmentLoading === booking._id}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                              {assignmentLoading === booking._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiCheckCircle className="h-4 w-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                              disabled={assignmentLoading === booking._id}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                              {assignmentLoading === booking._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiXCircle className="h-4 w-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        )}

                        {booking.status === 'approved' && (
                          <div className="pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'completed')}
                              disabled={assignmentLoading === booking._id}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                              {assignmentLoading === booking._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiCheckCircle className="h-4 w-4" />
                              )}
                              Mark as Completed
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hired Guides Tab */}
            {activeTab === 'hiredGuides' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiAward className="mr-2" />
                  Hired Guides
                </h2>

                {hireRequests.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hire requests yet. Start by hiring guides from the Guides page.</p>
                ) : (
                  <div className="space-y-4">
                    {hireRequests.map((request) => (
                      <div
                        key={request._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{request.guide.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{request.guide.email}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="font-medium text-gray-900">{request.guide.experienceYears} years</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Price/Session</p>
                                <p className="font-medium text-ocean-600">${request.guide.pricePerSession}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Surf Spot</p>
                                <p className="font-medium text-gray-900">{request.surfSpot?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Requested</p>
                                <p className="font-medium text-gray-900">{format(new Date(request.requestedAt), 'MMM dd')}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            {request.status === 'pending' && (
                              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg">
                                <FiClock className="h-4 w-4" />
                                <span className="text-xs font-semibold">Pending</span>
                              </div>
                            )}
                            {request.status === 'accepted' && (
                              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                                <FiCheckCircle className="h-4 w-4" />
                                <span className="text-xs font-semibold">Accepted</span>
                              </div>
                            )}
                            {request.status === 'rejected' && (
                              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
                                <FiXCircle className="h-4 w-4" />
                                <span className="text-xs font-semibold">Rejected</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {request.status === 'accepted' && (
                          <div className="pt-3 border-t border-gray-200 text-xs text-gray-600">
                            ✓ This guide has accepted your hire request. You can now assign them to bookings.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOwner;