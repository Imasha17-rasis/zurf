import React, { useState, useEffect } from 'react';
import { bookingAPI, surfSpotAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import {
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiTrendingUp,
  FiPackage,
  FiUsers
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
              {['overview', 'bookings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg font-semibold capitalize transition-all duration-200 ${activeTab === tab
                      ? 'bg-ocean-500 text-white shadow-md ring-2 ring-ocean-300'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Surfer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Surf Spot
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {booking.surfer?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {booking.surfSpot?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600">
                              ${booking.totalPrice}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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